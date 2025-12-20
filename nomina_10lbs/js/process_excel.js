// Variables Globales
jsonNominaConfianza = null;


$(document).ready(function () {
    // Inicializar el procesamiento del Excel
    processExcelData();

});

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

                                // Obtener empleados que no se unieron
                                const empleadosNoUnidos = obtenerEmpleadosNoUnidos(JsonListaRaya, JsonBiometrico);

                                // Validar empleados sin IMSS
                                validarExistenciaTrabajadorSinImms(empleadosNoUnidos);

                                // Mostrar la tabla de nómina
                                setInitialVisibility();

                                mostrarDatosTabla(jsonNominaConfianza);



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

            // Crear un mapa de claves válidas para búsqueda rápida
            const mapaEmpleados = {};
            empleadosValidos.forEach(emp => {
                mapaEmpleados[emp.clave] = emp.nombre;
            });

            // Filtrar y actualizar empleados
            JsonListaRaya.departamentos.forEach(departamento => {
                // Filtrar solo empleados válidos
                departamento.empleados = departamento.empleados.filter(empleado => {
                    const clave = String(empleado.clave).trim();
                    if (mapaEmpleados[clave]) {
                        // Actualizar el nombre con el de la base de datos
                        empleado.nombre = mapaEmpleados[clave];
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
            console.error('Error validando trabajadores:', error);
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

    console.log("Empleados no unidos:", empleadosNoUnidos);
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

            // Agregar la clave a cada empleado validado
            empleadosValidados.forEach(emp => {
                const resultado = response.find(r => String(r.biometrico) === String(emp.id_biometrico));
                if (resultado) {
                    // Actualizar clave
                    emp.clave = resultado.clave_empleado;
                    // Actualizar nombre con los campos que vienen de la base de datos
                    const partes = [resultado.nombre, resultado.ap_paterno, resultado.ap_materno].filter(Boolean);
                    if (partes.length) {
                        emp.nombre = partes.join(' ').trim();
                    }
                }
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
    
    console.log("Departamento 'sin seguro' agregado:", departamentoSinSeguro);
    console.log("JSON completo:", jsonNominaConfianza);
}

// PASO 7: Función para asignar propiedades iniciales a cada empleado
function asignarPropiedadesEmpleado(jsonNominaConfianza) {
    // Recorrer todos los departamentos
    jsonNominaConfianza.departamentos.forEach(departamento => {
        // Recorrer todos los empleados de cada departamento
        departamento.empleados.forEach(empleado => {
            // Agregar las propiedades necesarias
            empleado.sueldo_semanal = 0;
            empleado.vacaciones = 0;
            empleado.sueldo_extra_total = 0;
            empleado.retardos = 0;
            empleado.ajuste_sub = 0;
            empleado.prestamo = 0;
            empleado.permiso = 0;
            empleado.inacistencia = 0;
            empleado.uniformes = 0;
            empleado.checador = 0;
            empleado.total_cobrar = 0;
        });
    });
}