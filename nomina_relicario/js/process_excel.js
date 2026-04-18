jsonNominaRelicario = null;


$(document).ready(function () {
    processExcelData();
    restoreNomina();
    confirmarsaveNomina();
    limpiarCamposNomina();
    console.log(jsonNominaRelicario);
});

// PASO 1: Función para procesar los archivos Excel subidos por el usuario y unir los datos 
function processExcelData(params) {
    $("#container-nomina_relicario").removeAttr("hidden");
    $('#btn_procesar_nomina_relicario').on('click', function (e) {
        e.preventDefault();

        var $form = $('#form_excel_raya');
        var form = $form[0];

        // 1. Enviar el primer archivo Excel (Lista de Raya)
        var formData1 = new FormData();
        if (!form.archivo_excel_lista_raya_relicario || form.archivo_excel_lista_raya_relicario.files.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Falta archivo',
                text: 'Por favor, selecciona el archivo de Lista de Raya.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            return;
        }
        // El backend (`leerListaRaya.php`) espera el campo 'archivo_excel'
        formData1.append('archivo_excel', form.archivo_excel_lista_raya_relicario.files[0]);

        // Mostrar indicador de carga
        $(this).addClass('loading').prop('disabled', true);

        $.ajax({
            url: '../php/leerListaRaya.php',
            type: 'POST',
            data: formData1,
            processData: false,
            contentType: false,
            success: function (res1) {

                const JsonListaRaya = JSON.parse(res1);
                console.log(JsonListaRaya);

                // Antes de continuar, consultar si la nómina ya está guardada en BD para esta semana
                const numeroSemana = JsonListaRaya.numero_semana;

                //IMPORTANTE: Usar fecha_cierre para determinar el año (NO fecha_inicio)
                // Esto es crítico para semanas que cruzan el cambio de año
                // Ejemplo: Semana 1 del 2026 que va del 27/Dic/2025 al 02/Ene/2026
                let anio = new Date().getFullYear();
                if (JsonListaRaya.fecha_cierre) {
                    const partes = JsonListaRaya.fecha_cierre.split('/');
                    anio = parseInt(partes[2]);
                    if (!anio || isNaN(anio)) {
                        anio = new Date().getFullYear();
                    }
                } else if (JsonListaRaya.fecha_inicio) {
                    // Fallback solo si no existe fecha_cierre
                    const partes = JsonListaRaya.fecha_inicio.split('/');
                    anio = parseInt(partes[2]);
                    if (!anio || isNaN(anio)) {
                        anio = new Date().getFullYear();
                    }
                }

                if (typeof validarExistenciaNomina === 'function') {
                    // LLAMADA DE PRUEBA: Visualizar estructura basada en BD por consola
                    // testEstructuraBaseDatos(JsonListaRaya);

                    validarExistenciaNomina(numeroSemana, anio).then(function (existe) {

                        // Verificar si se subió el archivo biométrico (opcional)
                        const hayBiometrico = form.archivo_excel_biometrico_relicario && form.archivo_excel_biometrico_relicario.files.length > 0;

                        if (existe) {
                            // Obtener la nómina real desde el servidor
                            getNominaRelicario(numeroSemana, anio).then(function (nomina) {
                                jsonNominaRelicario = nomina;
                                console.log(jsonNominaRelicario);

                                //Actualizar Fechas de inicio y cierre
                                jsonNominaRelicario.fecha_inicio = JsonListaRaya.fecha_inicio;
                                jsonNominaRelicario.fecha_cierre = JsonListaRaya.fecha_cierre;

                                validarExistenciaTrabajadorBD(jsonNominaRelicario, JsonListaRaya);


                                $('#btn_procesar_nomina_relicario').removeClass('loading').prop('disabled', false);
                            }).catch(function (err) {
                                console.error('Error al obtener nómina desde servidor:', err);
                                $('#btn_procesar_nomina_relicario').removeClass('loading').prop('disabled', false);
                            });
                        } else {
                            // Ahora siempre usamos la estructura básica de la BD
                            // Si hay biométrico, pasamos un booleano "true" para indicarlo
                            if (hayBiometrico) {
                                crearEstructuraJson(JsonListaRaya, true, form);
                            } else {
                                crearEstructuraJson(JsonListaRaya, false);
                            }
                        }
                    });

                }
            },
            error: function (xhr, status, error) {

                console.error('Error al procesar Lista de Raya:', error);

            }

        });
    });
}

/* Validacion 1: Sube Lista de Raya pero no el Biometrico
Se ejecuta processExcelData() -> se procesa Lista de Raya -> Verificar si hay biometrico (no hay) ->
validarExistenciaTrabajador(JsonListaRaya) para detectar si las claves estan en la BD, una vez obtenida
la respuesta del servidor se quedan los empleados que estan y se eliminan los que no se encontraron del jsonListaRaya->
obtenerJornalerosCoordinadores(JsonListaRaya) se obtiene de manera general a los empleados que no tienen seguro y que son jornaleros BASE, DE APOYO Y VIVERO Y COORDINADORES DE RANCHOS Y VIVEROS->
asignarPropiedadesEmpleado(JsonListaRaya) se asignan las propiedades necesarias a los empleados->
ordenarEmpleadosPorApellido(JsonListaRaya) se ordenan los empleados por nombre dentro de cada departamento->
jsonNominaRelicario = JsonListaRaya asignando el jsonNominaRelicario final para ser usado en el proceso de generación de nómina y en la tabla de revisión y edición.;
*/

function crearEstructuraJson(JsonListaRaya, siHayBiometrico = false, form = null) {
    // 1. Obtener departamentos autorizados para la nómina Relicario (ID 4)
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerDepartamentosNomina',
            id_nomina: 4
        },
        dataType: 'json',
        success: function (respDepts) {
            if (!respDepts.departamentos || respDepts.departamentos.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Sin departamentos!',
                    text: 'No se encontraron departamentos asignados a esta nómina en la base de datos.',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                console.error("Error al obtener departamentos de la BD:", respDepts.error);
                $('#btn_procesar_nomina_relicario').removeClass('loading').prop('disabled', false);
                return;
            }

            // 2. Crear nueva estructura base con los departamentos de la BD
            let estructuraJson = {
                numero_semana: JsonListaRaya.numero_semana,
                fecha_inicio: JsonListaRaya.fecha_inicio,
                fecha_cierre: JsonListaRaya.fecha_cierre,
                departamentos: respDepts.departamentos.map(d => ({
                    id_departamento: d.id_departamento,
                    nombre: d.nombre_departamento,
                    empleados: []
                }))
            };

            // ACA LLAMAMOS A LA VALIDACIÓN
            // Si hay biométrico (true), omitimos los sin seguro temporalmente
            validarExistenciaTrabajador(JsonListaRaya, estructuraJson, siHayBiometrico, form);
        },
        error: function (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de servidor',
                text: 'Hubo un problema al consultar los departamentos. Inténtalo de nuevo.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            console.error("Error al obtener departamentos para prueba:", err);
            $('#btn_procesar_nomina_relicario').removeClass('loading').prop('disabled', false);
        }
    });

}

// PASO 1: Función para obtener las claves de empleados y verificar su existencia en la base de datos
function validarExistenciaTrabajador(JsonListaRaya, estructuraJson = null, siHayBiometrico = false, form = null) {

    // Array para almacenar todas las claves de empleados
    var clavesEmpleados = [];

    // Recorrer todos los departamentos
    JsonListaRaya.departamentos.forEach(function (departamento) {
        // Recorrer todos los empleados de cada departamento
        departamento.empleados.forEach(function (empleado) {
            // Agregar la clave del empleado al array
            clavesEmpleados.push(empleado.clave);
        });
    });

    //Enviar las claves al servidor con el case
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'POST',
        data: {
            claves: clavesEmpleados,
            case: 'validarExistenciaTrabajador'
        },
        dataType: 'json',
        success: function (response) {

            // Aquí puedes procesar la respuesta
            if (response.existentes) {

                // LÓGICA DE UNIÓN: Si hay departametos (Estructura BD), poblarla.
                if (estructuraJson) {
                    response.existentes.forEach(function (empBD) {
                        // Buscar datos financieros en el Excel original
                        let empExcel = null;
                        for (let dExcel of JsonListaRaya.departamentos) {
                            empExcel = dExcel.empleados.find(e => e.clave === empBD.clave);
                            if (empExcel) break;
                        }

                        if (empExcel) {
                            // Crear empleado final combinando BD y Excel
                            let empleadoFinal = {
                                clave: empBD.clave,
                                nombre: empBD.nombre,
                                id_empresa: empBD.id_empresa,
                                id_departamento: empBD.id_departamento,
                                id_puestoEspecial: empBD.id_puestoEspecial,
                                biometrico: empBD.biometrico,
                                seguroSocial: true,
                                tarjeta: empExcel.tarjeta,
                                conceptos: empExcel.conceptos
                            };

                            // Meterlo en el departamento correspondiente de estructuraJson
                            let deptoDestino = estructuraJson.departamentos.find(d => d.id_departamento == empBD.id_departamento);
                            if (deptoDestino) {
                                deptoDestino.empleados.push(empleadoFinal);
                            } else {
                                console.warn(`Empleado ${empBD.clave} tiene un id_departamento (${empBD.id_departamento}) que no pertenece a esta nómina.`);
                            }
                        }
                    });

                    // Si hay biométrico, seguimos con su procesamiento. Si no, flujo normal sin seguro.
                    if (siHayBiometrico) {
                        procesarBiometrico(form, estructuraJson);
                    } else {
                        obtenerEmpleadosSinSeguro(estructuraJson);
                    }

                }

            }

        },
        error: function (xhr, status, error) {
            console.error('Error al verificar empleados:', error);
            console.error('Respuesta del servidor:', xhr.responseText);
        }
    });
}

// PASO 2: Función para obtener empleados de los departamentos que estan relacionado a la nomina relicario (sin seguro)
function obtenerEmpleadosSinSeguro(estructuraJson = null) {
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerEmpleadosSinSeguro'
        },
        dataType: 'json',
        success: function (response) {
            if (response.empleados && response.empleados.length > 0) {


                // Convertir empleados de BD a estructura del JSON
                response.empleados.forEach(function (empleadoBD) {
                    var empleado = {
                        clave: empleadoBD.clave,
                        nombre: empleadoBD.nombre + ' ' + empleadoBD.ap_paterno + ' ' + empleadoBD.ap_materno,
                        id_empresa: empleadoBD.id_empresa,
                        id_departamento: empleadoBD.id_departamento,
                        id_puestoEspecial: empleadoBD.id_puestoEspecial,
                        biometrico: empleadoBD.biometrico,
                        seguroSocial: false
                    };


                    // Determinar el destino según si usamos la estructura de la BD o la del Excel
                    if (estructuraJson) {
                        let dpto = estructuraJson.departamentos.find(d => d.id_departamento == empleadoBD.id_departamento);
                        if (dpto) {
                            // Evitar duplicados RECUERDA PONER TAMBIEN POR EL ID EMPRESA
                            const yaExiste = dpto.empleados.some(e => e.clave === empleado.clave);
                            if (!yaExiste) {
                                dpto.empleados.push(empleado);
                            }
                        }
                    }

                });



                asignarPropiedadesEmpleado(estructuraJson);
                ordenarEmpleadosPorNombre(estructuraJson);
                jsonNominaRelicario = estructuraJson;


                console.log(jsonNominaRelicario);
                //actualizarCabeceraNomina(jsonNominaRelicario);

                // BHL: Llenar tabla de pagos por día cuando se cargue la nómina
                if (typeof llenar_cuerpo_tabla_pagos_por_dia === 'function') {
                    llenar_cuerpo_tabla_pagos_por_dia();
                }

                mostrarConfigValores(false);

            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener empleados sin seguro:', error);
        }
    });
}

/*
Validacion 2: Sube Lista de Raya y el Biometrico
Se ejecuta processExcelData() -> se procesa Lista de Raya -> Verificar si hay biometrico (si hay) ->
validarExistenciaTrabajador(JsonListaRaya, true) para detectar si las claves estan en la BD, una vez obtenida
la respuesta del servidor se quedan los empleados que estan y se eliminan los que no se encontraron del jsonListaRaya->
no se ejecuta obtenerEmpleadosSinSS(JsonListaRaya) por el parametro true ->
se ejecuta procesarBiometrico(form, JsonListaRaya) -> se procesa el biometrico ->
unirJson(JsonListaRaya, JsonBiometrico) se unen los registros del biometrico al jsonListaRaya->
obtenerEmpleadosNoUnidos(JsonListaRaya, JsonBiometrico) se obtienen los empleados del biometrico que no se unieron al jsonListaRaya ->
obtenerEmpleadosSinSeguroBiometrico(empleadosNoUnidos) se obtiene de manera especifica a los empleados que no se unieron y no tienen seguro y se unen al jsonNominaRelicario->
asignarPropiedadesEmpleado(jsonNominaRelicario) se asignan las propiedades necesarias a los empleados ->
ordenarEmpleadosPorNombre(jsonNominaRelicario) se ordenan los empleados por nombre dentro de cada departamento->
*/

// PASO 1: Función encargada de procesar el archivo biométrico subido por el usuario. 
function procesarBiometrico(form, estructuraJson) {
    var formData2 = new FormData();
    formData2.append('archivo_excel2', form.archivo_excel_biometrico_relicario.files[0]);

    $.ajax({
        url: '../php/leerBiometrico.php',
        type: 'POST',
        data: formData2,
        processData: false,
        contentType: false,
        success: function (res2) {
            try {
                const JsonBiometrico = JSON.parse(res2);

                jsonNominaRelicario = unirJson(estructuraJson, JsonBiometrico);
                const empleadosNoUnidos = obtenerEmpleadosNoUnidos(estructuraJson, JsonBiometrico);

                // Validar empleados sin IMSS solo si hay empleados no unidos.
                // Se pasa un callback para ejecutar los cálculos DESPUÉS de que el AJAX interno termine.
                if (empleadosNoUnidos && empleadosNoUnidos.length > 0) {
                    obtenerEmpleadosSinSeguroBiometrico(empleadosNoUnidos, function () {

                    });
                } else {
                    // No hay empleados sin seguro: ejecutar cálculos de inmediato

                }

            } catch (e) {
                console.error('Error al parsear datos biométricos:', e);
            } finally {
                $('#btn_procesar_nomina_relicario').removeClass('loading').prop('disabled', false);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al procesar archivo biométrico:', error);
        }
    });
}

// PASO 2: Función para unir los registros del biométrico al JSON de nómina
function unirJson(json1, json2) {
    // Si json2 no existe o no tiene empleados, retornar json1 con registros vacíos
    if (!json2 || !json2.empleados || json2.empleados.length === 0) {
        inicializarRegistrosVacios(json1);
        console.log("No hay empleados en el biométrico para unir.");

        return json1;
    }

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
                        emp1.registros = emp2.registros || [];
                    } else {
                        // Si no se encuentra en el biométrico, inicializar registros vacíos
                        if (!emp1.registros || !Array.isArray(emp1.registros)) {
                            emp1.registros = [];
                        }
                    }
                });
            }
        });
    }

    return json1;
}

// PASO 3: Función para obtener empleados del biométrico que no se unieron al JSON de nómina
function obtenerEmpleadosNoUnidos(estructuraJson, JsonBiometrico) {
    // Si no hay JsonBiometrico o no tiene empleados, retornar array vacío
    if (!JsonBiometrico || !JsonBiometrico.empleados || JsonBiometrico.empleados.length === 0) {
        return [];
    }

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
    if (estructuraJson && estructuraJson.departamentos) {
        estructuraJson.departamentos.forEach(depto => {
            if (depto.empleados) {
                depto.empleados.forEach(emp => {
                    nombresListaRaya.add(normalizar(emp.nombre));
                });
            }
        });
    }

    // Filtrar empleados de JsonBiometrico que no están en JsonListaRaya
    const empleadosNoUnidos = JsonBiometrico.empleados.filter(emp => {
        return !nombresListaRaya.has(normalizar(emp.nombre));
    });

    return empleadosNoUnidos;
}

// PASO 4: Función para obtener empleados sin seguro Coordinadores y Jornaleros del biométrico y unirlos al JSON de nómina
function obtenerEmpleadosSinSeguroBiometrico(empleadosNoUnidos) {

    const biometricos = empleadosNoUnidos.map(emp => emp.id_biometrico);

    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'validarEmpleadosSinSeguroBiometrico',
            biometricos: biometricos
        },
        dataType: 'json',
        success: function (response) {

            if (response.empleados && response.empleados.length > 0) {
                // Convertir empleados de BD a estructura del JSON
                response.empleados.forEach(function (empleadoBD) {
                    // Buscar el empleado correspondiente en empleadosNoUnidos por biometrico
                    const empleadoBiometrico = empleadosNoUnidos.find(emp => emp.id_biometrico == empleadoBD.biometrico);

                    const empleado = {
                        clave: empleadoBD.clave,
                        nombre: empleadoBD.nombre + ' ' + empleadoBD.ap_paterno + ' ' + empleadoBD.ap_materno,
                        tarjeta: null,
                        id_empresa: empleadoBD.id_empresa,
                        id_departamento: empleadoBD.id_departamento,
                        id_puestoEspecial: empleadoBD.id_puestoEspecial,
                        biometrico: empleadoBD.biometrico,
                        seguroSocial: false,
                        // Establecer registros del biometrico si existen
                        registros: empleadoBiometrico ? (empleadoBiometrico.registros || []) : []
                    };


                    // Buscar el departamento correspondiente usando el ID directamente
                    if (jsonNominaRelicario && jsonNominaRelicario.departamentos) {
                        let dpto = jsonNominaRelicario.departamentos.find(d => d.id_departamento == empleadoBD.id_departamento);

                        if (dpto) {
                            // Evitar duplicados
                            const yaExiste = dpto.empleados.some(e => e.clave === empleado.clave);
                            if (!yaExiste) {
                                dpto.empleados.push(empleado);
                            }

                        } else {
                            console.warn(`No se encontró el departamento con ID ${empleadoBD.id_departamento} en la estructura de nómina.`);
                        }
                    }
                });
                asignarPropiedadesEmpleado(jsonNominaRelicario);
                ordenarEmpleadosPorNombre(jsonNominaRelicario);
                // Calcular retardos e inasistencias para todos los coordinadores (departamento 8)

                actualizarCabeceraNomina(jsonNominaRelicario);

                // BHL: Llenar tabla de pagos por día cuando se cargue la nómina
                if (typeof llenar_cuerpo_tabla_pagos_por_dia === 'function') {
                    llenar_cuerpo_tabla_pagos_por_dia();
                }

                mostrarConfigValores(true);



                console.log(jsonNominaRelicario);

            }
        },
        error: function (xhr, status, error) {
            console.error('Error al validar empleados sin seguro del biometrico:', error);
        }
    });
}


/*
Validacion 3: Sube Lista de Raya y la informacion se guarda en la base de datos
Se ejecuta processExcelData() -> se procesa Lista de Raya -> se verifica si ya hay informacion guardada en la BD ->
se ejecuta validarExistenciaTrabajadorBD(jsonNominaRelicario, JsonListaRaya) para obtener la informacion guardada previamente ->
una vez obtenida la respuesta del servidor se combinan los datos del archivo actual con los datos guardados ->
se ejecutan funciones para agregar empleados nuevos que esten en el archivo actual pero no en los datos guardados ->
se ejecuta verificarEmpleadosSinSeguro(jsonNominaRelicario) para identificar empleados que estan en la BD pero no en la lista de raya (sin seguro) ->
asignarPropiedadesEmpleado(jsonNominaRelicario) se asignan las propiedades necesarias a los empleados ->
ordenarEmpleadosPorNombre(jsonNominaRelicario) se ordenan los empleados por apellido paterno dentro de cada departamento->
*/

// PASO 1: Validar existencia de trabajadores en la BD (se ejecuta al inicio del proceso si la nómina ya existe) 
function validarExistenciaTrabajadorBD(jsonNominaRelicario, JsonListaRaya) {
    // Array para almacenar todas las claves de empleados que ya tenemos en la BD
    var clavesEmpleados = [];

    // Recorrer todos los departamentos de la nómina recuperada
    jsonNominaRelicario.departamentos.forEach(function (departamento) {
        departamento.empleados.forEach(function (empleado) {
            clavesEmpleados.push(empleado.clave);
        });
    });

    // Enviar las claves al servidor para verificar si siguen activos (id_status=1)
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'POST',
        data: {
            claves: clavesEmpleados,
            case: 'validarExistenciaTrabajadorBD'
        },
        dataType: 'json',
        success: function (response) {
            if (response.existentes) {
                // Obtener claves vigentes
                var clavesExistentes = response.existentes.map(emp => String(emp.clave));

                // 2. Filtrar: Solo dejar empleados que siguen vigentes en la BD
                jsonNominaRelicario.departamentos.forEach(function (departamento) {
                    // Si es Corte, no filtrar contra BD (el flujo de corte es manual)
                    if (departamento.nombre === "Corte") return;
                    // Si es Poda, no filtrar contra BD (el flujo de Poda es manual)
                    if (departamento.nombre === "Poda") return;

                    departamento.empleados = departamento.empleados.filter(function (empleado) {
                        return clavesExistentes.includes(String(empleado.clave));
                    });
                });

                // 3. Sincronizar: Actualizar conceptos y tarjeta con los nuevos datos del Excel actual
                jsonNominaRelicario.departamentos.forEach(function (departamentoBD) {
                    departamentoBD.empleados.forEach(function (empleadoBD) {
                        // Buscar al mismo empleado en el Excel actual usando su clave
                        let empleadoExcel = null;
                        for (let deptoExcel of JsonListaRaya.departamentos) {
                            empleadoExcel = deptoExcel.empleados.find(e => String(e.clave) === String(empleadoBD.clave));
                            if (empleadoExcel) break;
                        }

                        if (empleadoExcel) {
                            // Actualizar conceptos_copia buscando por código
                            if (empleadoExcel.conceptos && empleadoExcel.conceptos.length > 0) {
                                if (!empleadoBD.conceptos_copia || !Array.isArray(empleadoBD.conceptos_copia)) {
                                    empleadoBD.conceptos_copia = JSON.parse(JSON.stringify(empleadoBD.conceptos || []));
                                }
                                empleadoExcel.conceptos.forEach(function (conceptoExcel) {
                                    const conceptoCopia = empleadoBD.conceptos_copia.find(c => c.codigo === conceptoExcel.codigo);
                                    if (conceptoCopia) conceptoCopia.resultado = conceptoExcel.resultado;
                                });
                            }
                            // Actualizar tarjeta_copia con el valor del nuevo Excel
                            if (empleadoExcel.tarjeta !== undefined) empleadoBD.tarjeta_copia = empleadoExcel.tarjeta;
                        }
                    });
                });

                agregarEmpleadosNuevos(jsonNominaRelicario, JsonListaRaya);


            }
        },
        error: function (xhr, status, error) {
            console.error('Error al verificar empleados en Validación 3:', error);
            $('#btn_procesar_nomina_relicario').removeClass('loading').prop('disabled', false);
        }
    });
}


// PASO 2: Agregar empleados nuevos al jsonNominaRelicario
// Compara el Excel (JsonListaRaya) contra el JSON local y valida en BD los que falten.
function agregarEmpleadosNuevos(jsonNominaRelicario, JsonListaRaya) {
    if (!JsonListaRaya || !JsonListaRaya.departamentos) return;

    let empleadosNuevosDetectados = [];
    let clavesExistentes = new Set();

    // 1. Mapear claves que ya tenemos en el JSON local
    jsonNominaRelicario.departamentos.forEach(depto => {
        depto.empleados.forEach(emp => {
            clavesExistentes.add(String(emp.clave));
        });
    });

    // 2. Identificar nuevos candidatos desde el Excel
    JsonListaRaya.departamentos.forEach(deptoExcel => {
        deptoExcel.empleados.forEach(empExcel => {
            if (!clavesExistentes.has(String(empExcel.clave))) {
                empleadosNuevosDetectados.push(empExcel);
            }
        });
    });

    if (empleadosNuevosDetectados.length === 0) {
        verificarEmpleadosSinSeguro(jsonNominaRelicario);
    }

    const clavesNuevas = empleadosNuevosDetectados.map(e => e.clave);

    // 3. Validar en la BD si estos empleados pertenecen a la nómina (Área y Depto correctos)
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'POST',
        data: {
            claves: clavesNuevas,
            case: 'validarEmpleadosNuevos'
        },
        dataType: 'json',
        success: function (response) {
            if (response.existentes && response.existentes.length > 0) {

                response.existentes.forEach(empBD => {
                    // Buscar el departamento destino en nuestro JSON por id_departamento
                    let deptoDestino = jsonNominaRelicario.departamentos.find(d =>
                        parseInt(d.id_departamento) === parseInt(empBD.id_departamento)
                    );

                    if (deptoDestino) {
                        // Evitar duplicados si el empleado ya existe en el JSON
                        const yaExiste = deptoDestino.empleados.some(e => String(e.clave) === String(empBD.clave));
                        if (yaExiste) return;

                        // Buscar el registro original de este empleado en los detectados del Excel para traer tarjeta y conceptos
                        const empExcel = empleadosNuevosDetectados.find(e => String(e.clave) === String(empBD.clave));

                        // Determinar el tipo de horario heredado del departamento configurado
                        const tipoHorarioDepto = deptoDestino.tipo_horario !== undefined ? deptoDestino.tipo_horario : 0;

                        // Crear el objeto de empleado con la estructura estándar
                        const nuevoEmpleado = {
                            clave: empBD.clave,
                            nombre: empBD.nombre,
                            tipo_horario: tipoHorarioDepto,
                            id_empresa: empBD.id_empresa,
                            id_departamento: empBD.id_departamento,
                            id_puestoEspecial: empBD.id_puestoEspecial,
                            biometrico: empBD.biometrico,
                            seguroSocial: true,
                            registros: empExcel ? (empExcel.registros || []) : [],
                            tarjeta: empExcel ? (empExcel.tarjeta || 0) : 0,
                            conceptos: empExcel ? (empExcel.conceptos || []) : [],
                            mostrar: true
                        };

                        // Si el departamento es de tipo Horario Oficial (1), asignar propiedades adicionales
                        if (tipoHorarioDepto === 1) {
                            nuevoEmpleado.salario_semanal = empBD.salario_semanal || 0;
                            nuevoEmpleado.horario_oficial = empBD.horario_oficial || null;
                        } else if (tipoHorarioDepto === 2) {
                            nuevoEmpleado.salario_diario = empBD.salario_diario || 0;
                        }

                        deptoDestino.empleados.push(nuevoEmpleado);

                    }
                });


            }

            // Paso 3: Lanzar la verificación de empleados sin seguro secuencialmente
            verificarEmpleadosSinSeguro(jsonNominaRelicario);
        },
        error: function (xhr, status, error) {
            console.error('Error en la validación de empleados nuevos:', error);
        }
    });
}


//PASO 3: Verificar Y agrega nuevos empleados sin seguro (se ejecuta después de agregar empleados nuevos)
function verificarEmpleadosSinSeguro(jsonNominaRelicario) {
    if (!jsonNominaRelicario || !jsonNominaRelicario.departamentos) return;

    // Recorelicario todas las claves de empleados en la nómina actual para evitar duplicados
    let clavesNomina = new Set();
    jsonNominaRelicario.departamentos.forEach(function (departamento) {
        departamento.empleados.forEach(function (empleado) {
            clavesNomina.add(String(empleado.clave));
        });
    });

    // Obtener empleados sin seguro de la base de datos (Específico para Relicario)
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerEmpleadosSinSeguroRelicario'
        },
        dataType: 'json',
        success: function (response) {
            if (response.error) {
                console.error('Error al obtener empleados:', response.error);
                return;
            }

            if (response.empleados && response.empleados.length > 0) {
                // Filtrar empleados que no están ya en la nómina (Set inicial)
                const empleadosSinSeguroNuevos = response.empleados.filter(emp => {
                    return !clavesNomina.has(String(emp.clave));
                });


                // Agregar empleados sin seguro al departamento correspondiente
                empleadosSinSeguroNuevos.forEach(function (empSinSeguro) {
                    const deptoDestino = jsonNominaRelicario.departamentos.find(d =>
                        parseInt(d.id_departamento) === parseInt(empSinSeguro.id_departamento)
                    );

                    if (deptoDestino && deptoDestino.nombre !== "Corte" && deptoDestino.nombre !== "Poda") {
                        // Doble check directo en el departamento (por si hubo cambios asíncronos)
                        const yaExiste = deptoDestino.empleados.some(e => String(e.clave) === String(empSinSeguro.clave));
                        if (yaExiste) return;

                        const tipoHorarioDepto = deptoDestino.tipo_horario !== undefined ? deptoDestino.tipo_horario : 0;

                        const nuevoEmpleado = {
                            clave: empSinSeguro.clave,
                            nombre: empSinSeguro.nombre + ' ' + empSinSeguro.ap_paterno + ' ' + empSinSeguro.ap_materno,
                            id_empresa: empSinSeguro.id_empresa,
                            id_departamento: empSinSeguro.id_departamento,
                            id_puestoEspecial: empSinSeguro.id_puestoEspecial,
                            biometrico: empSinSeguro.biometrico,
                            seguroSocial: false,
                            tipo_horario: tipoHorarioDepto,
                            registros: [],
                            mostrar: true
                        };

                        if (tipoHorarioDepto === 1) {
                            nuevoEmpleado.salario_semanal = empSinSeguro.salario_semanal || 0;
                            nuevoEmpleado.horario_oficial = empSinSeguro.horario_oficial || null;
                        } else if (tipoHorarioDepto === 2) {
                            nuevoEmpleado.salario_diario = empSinSeguro.salario_diario || 0;
                        }

                        deptoDestino.empleados.push(nuevoEmpleado);

                    }
                });

            }

            // Siempre ejecutar al finalizar, haya o no nuevos empleados sin seguro
            asignarPropiedadesEmpleado(jsonNominaRelicario);
            ordenarEmpleadosPorNombre(jsonNominaRelicario);
            actualizarCabeceraNomina(jsonNominaRelicario);

            if (typeof initComponents === 'function') {
                initComponents();
            }

            saveNomina(jsonNominaRelicario);

            let id_departamento = parseInt($('#filtro_departamento').val());
            if (!id_departamento && jsonNominaRelicario.departamentos && jsonNominaRelicario.departamentos.length > 0) {
                id_departamento = jsonNominaRelicario.departamentos[0].id_departamento;
            }
            let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, id_departamento);
            mostrarDatosTabla(jsonFiltrado, 1);
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener empleados sin seguro:', error);
        }
    });
}





// FUNCIONES AUXILIARES

// Función para asignar propiedades necesarias a empleados de departamentos específicos

function asignarPropiedadesEmpleado(jsonNominaRelicario) {
    if (!jsonNominaRelicario || !Array.isArray(jsonNominaRelicario.departamentos)) return;

    // Recorrer todos los departamentos
    jsonNominaRelicario.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        // Saltar departamentos específicos que no requieren esto
        if (departamento.nombre === "Corte" || departamento.nombre === "Poda") return;

        // Recorrer todos los empleados de cada departamento
        departamento.empleados.forEach(empleado => {
            // Convertir id_puestoEspecial a número para comparaciones
            const idPuesto = parseInt(empleado.id_puestoEspecial) || null;
            const idDepto = parseInt(empleado.id_departamento);

            /*
            FLUJO DE ASIGNACIÓN DE TIPO PUESTO:
            
            Si el empleado está en el departamento 8 (Coordinadores):
              - Si tiene el id_departamento 8 son coordinadores, aqui no hay distincion por puesto especial.
            
            Si el empleado está en el departamento 7 (Jornaleros):
              - Si tiene puesto 10 o 11 → Es Jornalero Base (id_tipo_puesto = 1)
              - Si tiene puesto 38 → Es Jornalero Vivero (id_tipo_puesto = 2)
              - Si tiene puesto 37 o 39 → Es Jornalero de Apoyo (id_tipo_puesto = 3)
              - Si no tiene puesto asignado (null) → Por defecto es Jornalero Base (id_tipo_puesto = 1)
            */

            /* Mapear id_puestoEspecial a id_tipo_jornalero según departamento
            if (idDepto === 8) {
                // Departamento: Coordinadores
                empleado.id_tipo_puesto = 4; // Coordinador

            } else if (idDepto === 11) {
                // Departamento: Jornaleros
                empleado.id_tipo_puesto = (idPuesto === 37 || idPuesto === 39) ? 3 : ((idPuesto === 38) ? 2 : 1);
            }*/



            // Inicializar registros como array vacío si no existen
            if (!empleado.registros || !Array.isArray(empleado.registros)) {
                empleado.registros = [];
            }

            // Agregar o mantener las propiedades necesarias (no sobrescribir si ya vienen de la BD)


            empleado.sueldo_extra_total = empleado.sueldo_extra_total ?? 0;
            empleado.retardos = empleado.retardos ?? 0;
            empleado.prestamo = empleado.prestamo ?? 0;
            empleado.permiso = empleado.permiso ?? 0;
            empleado.inasistencia = empleado.inasistencia ?? 0;
            empleado.uniformes = empleado.uniformes ?? 0;
            empleado.checador = empleado.checador ?? 0;
            empleado.fa_gafet_cofia = empleado.fa_gafet_cofia ?? 0;
            empleado.total_cobrar = empleado.total_cobrar ?? 0;
            empleado.redondeo = empleado.redondeo ?? 0;
            empleado.redondeo_activo = empleado.redondeo_activo ?? false;


            // Crear array de conceptos solo si tiene seguro social
            if (empleado.seguroSocial) {
                if (!empleado.conceptos || !Array.isArray(empleado.conceptos)) {
                    empleado.conceptos = [
                        { codigo: "45", resultado: '' },   // ISR
                        { codigo: "52", resultado: '' },   // IMSS
                        { codigo: "16", resultado: '' },   // Infonavit
                        { codigo: "107", resultado: '' }   // Ajuste al Sub
                    ];
                }
                // Crear copias solo si NO existen ya (para no pisar las actualizadas en Validación 3)
                if (!empleado.conceptos_copia || !Array.isArray(empleado.conceptos_copia)) {
                    empleado.conceptos_copia = JSON.parse(JSON.stringify(empleado.conceptos));
                }
                if (empleado.tarjeta_copia === undefined) {
                    empleado.tarjeta_copia = empleado.tarjeta;
                }
            }

            // Agregar propiedad mostrar (para filtrar en tabla)
            if (empleado.mostrar === undefined) {
                empleado.mostrar = true;
            }


        });
    });
}

function ordenarEmpleadosPorNombre(jsonOrdenado) {
    jsonOrdenado.departamentos.forEach(function (departamento) {
        departamento.empleados.sort(function (a, b) {
            return a.nombre.localeCompare(b.nombre);
        });
    });

}



