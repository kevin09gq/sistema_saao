// Variables Globales
jsonNominaConfianza = null;


$(document).ready(function () {
    incializarComponentes();
    restoreNomina();
    // Inicializar el procesamiento del Excel
    processExcelData();
    console.log(jsonNominaConfianza);

    // Habilitar menú contextual y enlace al modal (si las funciones existen)
    try { if (typeof mostrarContextMenu === 'function') mostrarContextMenu(); } catch (e) { }
    try { if (typeof bindContextMenuToModal === 'function') bindContextMenuToModal(); } catch (e) { }
    nuevosConceptosPercepcciones();
    cerrarModalDetalles();
    guardarCambiosEmpleado();
    activarActualizacionTotalExtra();
});



function incializarComponentes() {
    // Si ya hay una nómina guardada, no mostrar el formulario de carga
    try {
        if (typeof loadNomina === 'function' && loadNomina() !== null) {
            // Hay datos guardados: dejar la vista que restaure `storage.js`
            return;
        }
    } catch (err) {
        // Si algo falla, seguir mostrando el formulario
    }

    $("#container-nomina").removeAttr("hidden");
}


// PASO 1: Función para procesar los archivos Excel subidos por el usuario y unir los datos 
function processExcelData(params) {
    $('#btn_procesar_archivos').on('click', function (e) {
        e.preventDefault();

        var $form = $('#form_excel');
        var form = $form[0];

        // 1. Enviar el primer archivo Excel
        var formData1 = new FormData();
        if (!form.archivo_excel || form.archivo_excel.files.length === 0) {
            alert('Selecciona el primer archivo Excel.');
            return;
        }
        formData1.append('archivo_excel', form.archivo_excel.files[0]);

        // Mostrar indicador de carga
        $(this).addClass('loading').prop('disabled', true);

        $.ajax({
            url: '../php/leer_lista_raya.php',
            type: 'POST',
            data: formData1,
            processData: false,
            contentType: false,
            success: function (res1) {
                try {

                    const JsonListaRaya = JSON.parse(res1);
                    // Validar existencia de trabajadores en la base de datos
                    validarExistenciaTrabajador(JsonListaRaya);


                    // 2. Si fue exitoso, enviar el segundo archivo Excel
                    var formData2 = new FormData();
                    if (!form.archivo_excel2 || form.archivo_excel2.files.length === 0) {
                        alert('Selecciona el segundo archivo Excel.');
                        $('#btn_procesar_archivos').removeClass('loading').prop('disabled', false);
                        return;
                    }
                    formData2.append('archivo_excel2', form.archivo_excel2.files[0]);

                    $.ajax({
                        url: '../php/leer_biometrico.php',
                        type: 'POST',
                        data: formData2,
                        processData: false,
                        contentType: false,
                        success: function (res2) {
                            try {
                                const JsonBiometrico = JSON.parse(res2);

                                //Unir los dos JSON
                                jsonNominaConfianza = unirJson(JsonListaRaya, JsonBiometrico);

                                // Asegurar que todos los empleados ya existentes tengan las propiedades necesarias
                                asignarPropiedadesEmpleado(jsonNominaConfianza);

                                // Obtener empleados que no se unieron
                                const empleadosNoUnidos = obtenerEmpleadosNoUnidos(JsonListaRaya, JsonBiometrico);

                                // Validar empleados sin IMSS
                                validarExistenciaTrabajadorSinImms(empleadosNoUnidos);

                                // Mostrar la tabla de nómina
                                setInitialVisibility();
                                obtenerDepartamentosPermitidos();

                                mostrarDatosTabla(jsonNominaConfianza);
                                // Guardado inicial (se volverá a guardar si la validación asíncrona añade empleados)
                                saveNomina(jsonNominaConfianza);




                            } catch (e) {

                            } finally {
                                $('#btn_procesar_archivos').removeClass('loading').prop('disabled', false);
                            }
                        },

                    });

                } catch (e) {

                }
            },

        });
    });
}

// PASO 2: Función para validar la existencia de trabajadores en la base de datos
function validarExistenciaTrabajador(JsonListaRaya) {
    // Extraer todas las claves de todos los empleados de todos los departamentos
    const claves = [];

    JsonListaRaya.departamentos.forEach(departamento => {
        departamento.empleados.forEach(empleado => {
            claves.push(empleado.clave);
        });
    });


    //Enviar claves al servidor para validar
    $.ajax({
        url: '../php/trabajadores_imss.php',
        type: 'POST',
        data: JSON.stringify({ claves: claves }),
        processData: false,
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        success: function (response) {
            // response es un array de objetos [{clave: "003", nombre: "Juan Perez Lopez"}, ...]
            const empleadosValidos = Array.isArray(response) ? response : [];

            // Crear un mapa de claves válidas para búsqueda rápida (guardamos nombre y salario)
            const mapaEmpleados = {};
            empleadosValidos.forEach(emp => {
                mapaEmpleados[emp.clave] = {
                    nombre: emp.nombre,
                    salario: parseFloat(emp.salario_semanal) || 0
                };
            });

            // Filtrar y actualizar empleados
            JsonListaRaya.departamentos.forEach(departamento => {
                // Filtrar solo empleados válidos
                departamento.empleados = departamento.empleados.filter(empleado => {
                    const clave = String(empleado.clave).trim();
                    if (mapaEmpleados[clave]) {
                        // Actualizar el nombre y sueldo semanal con los datos de la base
                        empleado.nombre = mapaEmpleados[clave].nombre;
                        empleado.sueldo_semanal = mapaEmpleados[clave].salario;
                        return true;
                    }
                    return false;
                });

                // Ordenar alfabéticamente por nombre
                departamento.empleados.sort((a, b) => {
                    return a.nombre.localeCompare(b.nombre);
                });
            });


        },
        error: function (xhr, status, error) {

        }
    });
}

// PASO 3: Función para unir dos JSON basados en el nombre del empleado
function unirJson(json1, json2) {
    // Mejor normalización: quita tildes, dobles espacios, mayúsculas y ordena palabras
    const normalizar = s => s
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase()
        .split(" ")
        .sort()
        .join(" ");

    const empleados2Map = {};
    if (json2 && json2.empleados) {
        json2.empleados.forEach(emp => {
            empleados2Map[normalizar(emp.nombre)] = emp;
        });
    }

    // Recorre departamentos y empleados
    if (json1 && json1.departamentos) {
        json1.departamentos.forEach(depto => {
            //   AGREGAR TODOS LOS DEPARTAMENTOS

            if (depto.empleados) {
                depto.empleados.forEach(emp1 => {
                    const nombreNormalizado = normalizar(emp1.nombre);
                    if (empleados2Map[nombreNormalizado]) {
                        const emp2 = empleados2Map[nombreNormalizado];

                        // Unir registros

                        emp1.registros = emp2.registros;

                    }
                });
            }
        });
    }

    return json1;
}

// PASO 4: Función para obtener empleados no unidos entre dos JSON
function obtenerEmpleadosNoUnidos(JsonListaRaya, JsonBiometrico) {
    // Normalizar nombres para comparación
    const normalizar = s => s
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase()
        .split(" ")
        .sort()
        .join(" ");

    // Crear un conjunto de nombres normalizados de JsonListaRaya
    const nombresListaRaya = new Set();
    JsonListaRaya.departamentos.forEach(depto => {
        depto.empleados.forEach(emp => {
            nombresListaRaya.add(normalizar(emp.nombre));
        });
    });

    // Filtrar empleados de JsonBiometrico que no están en JsonListaRaya
    const empleadosNoUnidos = JsonBiometrico.empleados.filter(emp => {
        return !nombresListaRaya.has(normalizar(emp.nombre));
    });


    return empleadosNoUnidos;
}

// PASO 5: Función para validar la existencia de trabajadores sin IMSS en la base de datos
function validarExistenciaTrabajadorSinImms(empleadosNoUnidos) {
    // Extraer los id_biometrico de los empleados no unidos
    const biometricos = empleadosNoUnidos.map(emp => emp.id_biometrico);

    // Enviar al servidor para validar
    $.ajax({
        url: '../php/trabajadores_sin_imss.php',
        type: 'POST',
        data: JSON.stringify({ biometricos: biometricos }),
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        success: function (response) {
            // response solo contiene empleados que SÍ existen y cumplen las condiciones
            // Crear un array solo con los biometricos válidos del servidor
            const biometricosValidos = response.map(r => String(r.biometrico));

            // Filtrar empleadosNoUnidos: solo dejar los que el servidor validó
            const empleadosValidados = empleadosNoUnidos.filter(emp => {
                return biometricosValidos.includes(String(emp.id_biometrico));
            });

            // Agregar la clave a cada empleado validado y actualizar su nombre según la BD
            empleadosValidados.forEach(emp => {
                const resultado = response.find(r => String(r.biometrico) === String(emp.id_biometrico));
                if (resultado) {
                    emp.clave = resultado.clave_empleado;
                    const partes = [resultado.nombre, resultado.ap_paterno, resultado.ap_materno].filter(Boolean);
                    if (partes.length) {
                        emp.nombre = partes.join(' ').trim();
                    }
                    // Asignar sueldo semanal desde la BD si viene
                    if (resultado.salario_semanal !== undefined) {
                        emp.sueldo_semanal = parseFloat(resultado.salario_semanal) || 0;
                    }
                    // Asignar id_departamento desde la BD si viene
                    if (resultado.id_departamento !== undefined) {
                        emp.id_departamento = Number(resultado.id_departamento) || emp.id_departamento || 0;
                    }
                }
            });

            // Ordenar alfabéticamente A-Z por nombre antes de integrar
            empleadosValidados.sort((a, b) => {
                return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' });
            });

            // Integrar empleados validados al JSON principal
            integrarNuevaInformacion(empleadosValidados);
        },
        error: function (xhr, status, error) {

        }
    });
}

// PASO 6: Función para integrar nueva información al JSON principal
function integrarNuevaInformacion(empleadosValidados) {
    // Crear el departamento "sin seguro"
    const departamentoSinSeguro = {
        nombre: "sin seguro",
        empleados: empleadosValidados
    };

    // Agregar el departamento al JSON principal
    if (!jsonNominaConfianza.departamentos) {
        jsonNominaConfianza.departamentos = [];
    }

    jsonNominaConfianza.departamentos.push(departamentoSinSeguro);

    // Asignar propiedades a todos los empleados (incluyendo el nuevo departamento)
    asignarPropiedadesEmpleado(jsonNominaConfianza);

    // Guardar después de integrar nueva información asíncrona
    try {
        saveNomina(jsonNominaConfianza);
    } catch (err) {

    }


}

// PASO 7: Función para asignar propiedades iniciales a cada empleado
function asignarPropiedadesEmpleado(jsonNominaConfianza) {
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    // Recorrer todos los departamentos
    jsonNominaConfianza.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        // Mapear nombre de departamento a id (si corresponde)
        const nombreDeptRaw = String(departamento.nombre || '').trim();
        // Quitar número al inicio si existe: "1 Administracion" -> "Administracion"
        const nombreDept = nombreDeptRaw.replace(/^\s*\d+\s+/, '').trim();
        const nombreLower = nombreDept.toLowerCase();
        let mappedId = null;
        if (nombreLower === 'administracion') mappedId = 1;
        else if (nombreLower === 'produccion') mappedId = 2;
        else if (nombreLower === 'seguridad vigilancia e intendencia') mappedId = 3;
        else if (nombreLower === 'administracion sucursal cdmx') mappedId = 8;

        // Recorrer todos los empleados de cada departamento
        departamento.empleados.forEach(empleado => {
            // Agregar o mantener las propiedades necesarias (no sobrescribir si ya vienen de la BD)
            empleado.sueldo_semanal = empleado.sueldo_semanal ?? 0;
            empleado.vacaciones = empleado.vacaciones ?? 0;
            empleado.sueldo_extra_total = empleado.sueldo_extra_total ?? 0;
            empleado.retardos = empleado.retardos ?? 0;
            empleado.ajuste_sub = empleado.ajuste_sub ?? 0;
            empleado.prestamo = empleado.prestamo ?? 0;
            empleado.permiso = empleado.permiso ?? 0;
            empleado.inasistencia = empleado.inasistencia ?? 0;
            empleado.uniformes = empleado.uniformes ?? 0;
            empleado.checador = empleado.checador ?? 0;
            empleado.total_cobrar = empleado.total_cobrar ?? 0;

            // Crear array de conceptos si no existe
            if (!empleado.conceptos || !Array.isArray(empleado.conceptos)) {
                empleado.conceptos = [
                    { codigo: "45", resultado: '' },  // ISR
                    { codigo: "52", resultado: '' },  // IMSS
                    { codigo: "16", resultado: '' }   // Infonavit
                ];
            }

            // Si no tiene id_departamento, asignarlo desde el departamento actual (si mapeamos uno)
            if ((empleado.id_departamento === undefined || empleado.id_departamento === null) && mappedId !== null) {
                empleado.id_departamento = mappedId;
            }
        });
    });
}