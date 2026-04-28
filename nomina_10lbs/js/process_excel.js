// Variables Globales
jsonNomina10lbs = null;


$(document).ready(function () {

    processExcelData();

    // Si no se logra restaurar una nómina previa, mostrar el contenedor de carga
    if (!restoreNomina()) {
        $("#container-nomina_10lbs").removeAttr("hidden");
    }

    confirmarsaveNomina();
    limpiarCamposNomina();
    console.log(jsonNomina10lbs);

});

// PASO 1: Función para procesar los archivos Excel subidos por el usuario y unir los datos 
function processExcelData(params) {

    $('#btn_procesar_nomina_10lbs').on('click', function (e) {
        e.preventDefault();

        var $form = $('#form_excel_raya');
        var form = $form[0];

        // 1. Enviar el primer archivo Excel (Lista de Raya)
        var formData1 = new FormData();
        if (!form.archivo_excel_lista_raya_10lbs || form.archivo_excel_lista_raya_10lbs.files.length === 0) {
            alert('Selecciona el archivo Lista de Raya.');
            return;
        }
        // El backend (`leerListaRaya.php`) espera el campo 'archivo_excel'
        formData1.append('archivo_excel', form.archivo_excel_lista_raya_10lbs.files[0]);

        // Mostrar indicador de carga y OCULTAR el contenedor de carga
        $(this).addClass('loading').prop('disabled', true);

        $.ajax({
            url: '../php/leerListaRaya.php',
            type: 'POST',
            data: formData1,
            processData: false,
            contentType: false,
            success: function (res1) {

                const jsonListaRaya = JSON.parse(res1);

                // Antes de continuar, consultar si la nómina ya está guardada en BD para esta semana
                const numeroSemana = jsonListaRaya.numero_semana;

                // IMPORTANTE: Usar fecha_cierre para determinar el año (NO fecha_inicio)
                // Esto es crítico para semanas que cruzan el cambio de año
                // Ejemplo: Semana 1 del 2026 que va del 27/Dic/2025 al 02/Ene/2026
                let anio = new Date().getFullYear();
                if (jsonListaRaya.fecha_cierre) {
                    const partes = jsonListaRaya.fecha_cierre.split('/');
                    anio = parseInt(partes[2]);
                    if (!anio || isNaN(anio)) {
                        anio = new Date().getFullYear();
                    }
                } else if (jsonListaRaya.fecha_inicio) {
                    // Fallback solo si no existe fecha_cierre
                    const partes = jsonListaRaya.fecha_inicio.split('/');
                    anio = parseInt(partes[2]);
                    if (!anio || isNaN(anio)) {
                        anio = new Date().getFullYear();
                    }
                }

                // Hay Nomina en la BD

                if (typeof validarExistenciaNomina === 'function') {
                    // validarExistenciaNomina devuelve Promise<boolean>
                    validarExistenciaNomina(numeroSemana, anio).then(function (existe) {
                        if (existe) {
                            // Obtener la nómina real desde el servidor
                            getNomina10lbs(numeroSemana, anio).then(function (nomina) {
                                jsonNomina10lbs = nomina;
                                validarExistenciaTrabajadorBD(jsonNomina10lbs, jsonListaRaya);


                                $('#btn_procesar_nomina_10lbs').removeClass('loading').prop('disabled', false);
                            }).catch(function (err) {
                                console.error('Error al obtener nómina desde servidor:', err);
                                $('#btn_procesar_nomina_10lbs').removeClass('loading').prop('disabled', false);
                            });

                        } else {
                            // Verificar si se subió el archivo biométrico (opcional)
                            const hayBiometrico = form.archivo_excel_biometrico_10lbs && form.archivo_excel_biometrico_10lbs.files.length > 0;

                            if (hayBiometrico) {
                                // Si hay biométrico, validar existencia pero omitir agregar empleados sin seguro por ahora
                                crearEstructuraJson(jsonListaRaya, true, form);

                            } else {
                                // Si no hay biométrico, validar existencia y sí agregar empleados sin seguro
                                //validarExistenciaTrabajador(jsonListaRaya, false);
                                crearEstructuraJson(jsonListaRaya, false, form);

                                // aplicar cambios 
                                $('#btn_procesar_nomina_10lbs').removeClass('loading').prop('disabled', false);

                            }
                        }
                    }).catch(function (err) {
                        console.error('Error verificando existencia de nómina:', err);
                        $('#btn_procesar_nomina_10lbs').removeClass('loading').prop('disabled', false);
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
obtenerEmpleadosSinSS(JsonListaRaya) se obtiene de manera general a los empleados que no tienen seguro y se unen al jsonNomina10lbs->
asignarPropiedadesEmpleado(JsonListaRaya) se asignan las propiedades necesarias a los empleados del departamento 40 y 10 libras y sin seguro->
ordenarEmpleadosPorApellido(JsonListaRaya) se ordenan los empleados por apellido paterno dentro de cada departamento->
jsonNomina10lbs = JsonListaRaya asignando el jsonNomina10lbs ;
*/


function crearEstructuraJson(jsonListaRaya, siHayBiometrico, form) {
    // 1. Obtener departamentos autorizados para la nómina Relicario (ID 4)
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        cache: false,
        data: {
            case: 'obtenerDepartamentosNomina',
            id_nomina: 2 // ID de nómina para 10lbs
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
                $('#btn_procesar_nomina_10lbs').removeClass('loading').prop('disabled', false);
                return;
            }

            // 2. Crear nueva estructura base con los departamentos de la BD
            let estructuraJson = {
                numero_semana: jsonListaRaya.numero_semana,
                fecha_inicio: jsonListaRaya.fecha_inicio,
                fecha_cierre: jsonListaRaya.fecha_cierre,
                precio_cajas: [],
                departamentos: respDepts.departamentos.map(d => ({
                    id_departamento: d.id_departamento,
                    nombre: d.nombre_departamento,
                     color_reporte: d.color_depto_nomina || '#FF0000',
                    empleados: []
                }))
            };

            // CORRECCIÓN: Pasamos el JSON original para que encuentre las claves
            validarExistenciaTrabajador(jsonListaRaya, estructuraJson, siHayBiometrico, form);

            // IMPORTANTE: Quitar carga solo si NO falló la validación inicial
            $('#btn_procesar_nomina_10lbs').removeClass('loading').prop('disabled', false);
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
            $('#btn_procesar_nomina_10lbs').removeClass('loading').prop('disabled', false);
        }
    });

}

// PASO 1: Función para obtener las claves de empleados y verificar su existencia en la base de datos
function validarExistenciaTrabajador(jsonListaRaya, estructuraJson, siHayBiometrico, form) {
    // Array para almacenar todas las claves de empleados
    var clavesEmpleados = [];

    // Recorrer todos los departamentos
    jsonListaRaya.departamentos.forEach(function (departamento) {
        // Recorrer todos los empleados de cada departamento
        departamento.empleados.forEach(function (empleado) {
            // Agregar la clave del empleado al array
            clavesEmpleados.push(empleado.clave);
        });
    });

    //Enviar las claves al servidor con el case
    if (clavesEmpleados.length === 0) {
        console.warn("No se encontraron claves de empleados para validar.");
        $('#btn_procesar_nomina_10lbs').removeClass('loading').prop('disabled', false);
        return;
    }

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

                // LÓGICA DE UNIÓN: Poblar estructuraJson (Departamentos de la BD) con empleados del Excel
                if (estructuraJson) {
                    // Crear Set de claves que SÍ existen en la BD (para excluir no_existentes en FASE 2)
                    let clavesExistentes = new Set(response.existentes.map(e => String(e.clave)));
                    let clavesUnidas = new Set();

                    // FASE 1: Unir según Base de Datos (Departamentos Oficiales)
                    response.existentes.forEach(function (empBD) {
                        // 1. Buscar los datos que vienen del Excel original para este empleado
                        let empExcel = null;
                        for (let dExcel of jsonListaRaya.departamentos) {
                            empExcel = dExcel.empleados.find(e => String(e.clave) === String(empBD.clave));
                            if (empExcel) break;
                        }

                        if (empExcel) {
                            // 2. Crear el objeto de empleado final combinando datos de BD y Excel
                            let empleadoFinal = {
                                clave: empBD.clave,
                                nombre: empBD.nombre,
                                id_departamento: empBD.id_departamento,
                                id_empresa: empBD.id_empresa,
                                color_puesto: empBD.color_puesto ?? null,
                                biometrico: empBD.biometrico ?? null,
                                seguroSocial: true, // Empleados encontrados en este flujo tienen seguro
                                tarjeta: empExcel.tarjeta,
                                conceptos: empExcel.conceptos
                            };

                            // 3. Buscar el departamento destino en la estructuraJson por ID
                            let deptoDestino = estructuraJson.departamentos.find(d => d.id_departamento == empBD.id_departamento);

                            if (deptoDestino) {
                                deptoDestino.empleados.push(empleadoFinal);
                                clavesUnidas.add(String(empBD.clave)); // Marcamos como unido
                            }
                        }
                    });



                    // Limpiar departamentos oficiales que hayan quedado vacíos
                    estructuraJson.departamentos = estructuraJson.departamentos.filter(d => d.empleados.length > 0);

                    if (siHayBiometrico) {
                        procesarBiometrico(form, estructuraJson);
                    } else {
                        obtenerEmpleadosSinSeguro(estructuraJson);
                    }
                }

            } else {
                console.log("El servidor no devolvió empleados existentes.", response);
            }

            if (response.no_existentes && response.no_existentes.length > 0) {
                console.warn(
                    `[validarExistenciaTrabajador] ${response.no_existentes.length} empleado(s) no encontrados en BD y omitidos de la nómina:`,
                    response.no_existentes.map(e => e.clave)
                );
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al verificar empleados:', error);
            console.error('Respuesta del servidor:', xhr.responseText);
            $('#btn_procesar_nomina_10lbs').removeClass('loading').prop('disabled', false);
        }
    });
}

// PASO 2: Función para obtener empleados sin seguro de manera general y unirlos al JSON de nómina
function obtenerEmpleadosSinSeguro(estructuraJson) {
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerEmpleadosSinSeguro'
        },
        dataType: 'json',
        success: function (response) {
            if (response.empleados && response.empleados.length > 0) {


                // Convertir empleados de BD a estructura del JSON y unirlos a sus departamentos correspondientes
                response.empleados.forEach(function (empleadoBD) {

                    var empleado = {
                        clave: empleadoBD.clave,
                        nombre: empleadoBD.nombre,
                        tarjeta: null,
                        id_empresa: empleadoBD.id_empresa,
                        id_departamento: parseInt(empleadoBD.id_departamento),
                        color_puesto: empleadoBD.color_puesto ?? null,
                        seguroSocial: false // Estos empleados no tienen seguro
                    };

                    // Buscar el departamento adecuado en la estructura
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

                jsonNomina10lbs = estructuraJson;
                asignarPropiedadesEmpleado(jsonNomina10lbs);
                ordenarEmpleadosPorApellido(jsonNomina10lbs);
                cargarPreciosCajasJson(jsonNomina10lbs); // Cargar los precios de las cajas desde la BD al JSON
                poblarSelectDepartamentos(jsonNomina10lbs); // Poblar el select dinámico
                actualizarCabeceraNomina(jsonNomina10lbs);
                refrescarTabla(); // Mostrar la tabla automáticamente con el primer filtro
                initComponents();
                console.log(jsonNomina10lbs);
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
obtenerEmpleadosSinSeguroBiometrico(empleadosNoUnidos) se obtiene de manera especifica a los empleados que no se unieron y no tienen seguro y se unen al jsonNomina10lbs->
asignarPropiedadesEmpleado(jsonNomina10lbs) se asignan las propiedades necesarias a los empleados del departamento 40 y 10 libras y sin seguro->
ordenarEmpleadosPorApellido(jsonNomina10lbs) se ordenan los empleados por apellido paterno dentro de cada departamento->
*/

// PASO 1: Función encargada de procesar el archivo biométrico subido por el usuario. 
function procesarBiometrico(form, estructuraJson) {
    var formData2 = new FormData();
    formData2.append('archivo_excel2', form.archivo_excel_biometrico_10lbs.files[0]);

    $.ajax({
        url: '../php/leerBiometrico.php',
        type: 'POST',
        data: formData2,
        processData: false,
        contentType: false,
        success: function (res2) {
            try {
                const jsonBiometrico = JSON.parse(res2);

                jsonNomina10lbs = unirJson(estructuraJson, jsonBiometrico);

                const empleadosNoUnidos = obtenerEmpleadosNoUnidos(estructuraJson, jsonBiometrico);
                // Validar empleados sin IMSS solo si hay empleados no unidos
                if (empleadosNoUnidos && empleadosNoUnidos.length > 0) {
                    obtenerEmpleadosSinSeguroBiometrico(empleadosNoUnidos);

                }

            } catch (e) {
                console.error('Error al parsear datos biométricos:', e);
            } finally {
                $('#btn_procesar_nomina_10lbs').removeClass('loading').prop('disabled', false);
            }
        },
        error: function (xhr, status, error) {

            console.error('Error al procesar archivo biométrico:', error);

        }
    });
}

// PASO 2: Función para unir los registros del biométrico al JSON de nómina
function unirJson(json1, json2) {

    // Si json2 no existe o no tiene empleados, inicializar registros 
    if (!json2 || !json2.empleados || json2.empleados.length === 0) {
        if (json1 && json1.departamentos) {
            json1.departamentos.forEach(depto => {

                if (depto.empleados) {
                    depto.empleados.forEach(emp1 => {
                        if (!emp1.registros || !Array.isArray(emp1.registros)) emp1.registros = [];
                    });
                }

            });
        }
        return json1;
    }

    // Mejor normalización para nombres: quita tildes, colapsa espacios y ordena palabras
    const normalizarNombre = s => s
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase()
        .split(' ')
        .sort()
        .join(' ');

    const empleados2Map = {};
    if (json2 && json2.empleados) {
        json2.empleados.forEach(emp => {
            empleados2Map[normalizarNombre(emp.nombre)] = emp;
        });
    }

    // Recorre únicamente los departamentos  y aplica la unión de registros
    if (json1 && json1.departamentos) {
        json1.departamentos.forEach(depto => {


            if (depto.empleados) {
                depto.empleados.forEach(emp1 => {
                    const nombreNormalizado = normalizarNombre(emp1.nombre);
                    if (empleados2Map[nombreNormalizado]) {
                        const emp2 = empleados2Map[nombreNormalizado];
                        // Unir registros (tomar de biométrico si existe)
                        emp1.registros = emp2.registros || [];
                    } else {
                        // Si no se encuentra en el biométrico, inicializar registros vacíos
                        if (!emp1.registros || !Array.isArray(emp1.registros)) emp1.registros = [];
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

// PASO 4: Función para obtener empleados sin seguro del biométrico y unirlos al JSON de nómina
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
                // Integrar empleados del biométrico en sus departamentos oficiales
                response.empleados.forEach(function (empleadoBD) {
                    // Buscar el empleado correspondiente en empleadosNoUnidos para recuperar sus registros
                    const empleadoBiometrico = empleadosNoUnidos.find(emp => emp.id_biometrico == empleadoBD.biometrico);

                    const empleado = {
                        clave: empleadoBD.clave,
                        nombre: empleadoBD.nombre,
                        biometrico: empleadoBD.biometrico,
                        tarjeta: null,
                        id_empresa: empleadoBD.id_empresa,
                        id_departamento: parseInt(empleadoBD.id_departamento),
                        color_puesto: empleadoBD.color_puesto ?? null,
                        seguroSocial: false, // Siguiendo el requerimiento de marcar como unidos/seguro
                        registros: empleadoBiometrico ? (empleadoBiometrico.registros || []) : []
                    };

                    // Buscar el departamento correspondiente usando el ID directamente
                    if (jsonNomina10lbs && jsonNomina10lbs.departamentos) {
                        let dpto = jsonNomina10lbs.departamentos.find(d => d.id_departamento == empleadoBD.id_departamento);

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

                // Finalizar actualización de propiedades y ordenamiento
                asignarPropiedadesEmpleado(jsonNomina10lbs);
                ordenarEmpleadosPorApellido(jsonNomina10lbs);
                cargarPreciosCajasJson(jsonNomina10lbs);
                calcularOlvidosTodosEmpleados(jsonNomina10lbs);
                poblarSelectDepartamentos(jsonNomina10lbs); // Poblar el select dinámico
                actualizarCabeceraNomina(jsonNomina10lbs);
                refrescarTabla(); // Mostrar la tabla automáticamente con el primer filtro
                initComponents();

                console.log(jsonNomina10lbs);


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
se ejecuta validarExistenciaTrabajadorBD(JsonNomina10lbs, JsonListaRaya) para obtener la informacion guardada previamente ->
una vez obtenida la respuesta del servidor se combinan los datos del archivo actual con los datos guardados ->
se ejecutan funciones para agregar empleados nuevos que esten en el archivo actual pero no en los datos guardados ->
se ejecuta verificarEmpleadosSinSeguro(JsonNomina10lbs) para identificar empleados que estan en la BD pero no en la lista de raya (sin seguro) ->
asignarPropiedadesEmpleado(jsonNomina10lbs) se asignan las propiedades necesarias a los empleados del departamento 40 y 10 libras y sin seguro->
ordenarEmpleadosPorApellido(jsonNomina10lbs) se ordenan los empleados por apellido paterno dentro de cada departamento->
*/


// PASO 1: Validar existencia de trabajadores en la BD (se ejecuta al inicio del proceso) 
function validarExistenciaTrabajadorBD(JsonNomina10lbs, JsonListaRaya) {
    // Array para almacenar todas las claves de empleados
    var clavesEmpleados = [];

    // Recorrer todos los departamentos
    JsonNomina10lbs.departamentos.forEach(function (departamento) {
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
            case: 'validarExistenciaTrabajadorBD'
        },
        dataType: 'json',
        success: function (response) {
            if (response.existentes) {
                // Obtener claves existentes
                var clavesExistentes = response.existentes.map(emp => emp.clave);

                // Filtrar empleados: solo dejar los que existen en BD (id_status=1 e id_empresa=1)
                JsonNomina10lbs.departamentos.forEach(function (departamento) {
                    departamento.empleados = departamento.empleados.filter(function (empleado) {
                        return clavesExistentes.includes(String(empleado.clave));
                    });
                });

                // Quitar departamentos vacíos
                JsonNomina10lbs.departamentos = JsonNomina10lbs.departamentos.filter(function (departamento) {
                    return departamento.empleados.length > 0;
                });

                // Actualizar conceptos_copia y tarjeta_copia con los nuevos datos del Excel
                // Solo para empleados con seguro social que existan en ambos JSON
                JsonNomina10lbs.departamentos.forEach(function (departamentoBD) {
                    departamentoBD.empleados.forEach(function (empleadoBD) {
                        if (!empleadoBD.seguroSocial) return;

                        // Buscar al mismo empleado en el nuevo Excel usando su clave
                        let empleadoExcel = null;
                        for (let deptoExcel of JsonListaRaya.departamentos) {
                            empleadoExcel = deptoExcel.empleados.find(e => e.clave === empleadoBD.clave);
                            if (empleadoExcel) break;
                        }
                        if (!empleadoExcel) return;

                        // Actualizar el resultado de cada concepto buscando por código
                        if (empleadoExcel.conceptos && empleadoExcel.conceptos.length > 0) {
                            // Si conceptos_copia no existe aún (datos viejos de BD sin esta propiedad), crearla
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
                    });
                });

                // Cargar/Actualizar precios de cajas al restaurar nómina
                if (typeof cargarPreciosCajasJson === 'function') {
                    jsonNomina10lbs = JsonNomina10lbs;
                    cargarPreciosCajasJson();
                }

                // Agregar empleados nuevos del archivo Excel
                agregarEmpleadosNuevos(JsonNomina10lbs, JsonListaRaya);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al verificar empleados:', error);
            console.error('Respuesta del servidor:', xhr.responseText);
        }
    });
}

// PASO 2: Agregar empleados nuevos al jsonNomina10lbs (se ejecuta después de validar existencia en la BD) 
// Esta funcion recibe el jsonNomina10lbs actualizado y el JsonListaRaya para identificar nuevos empleados
function agregarEmpleadosNuevos(jsonNomina10lbs, jsonListaRaya) {
    if (!jsonListaRaya || !jsonListaRaya.departamentos) return;

    let empleadosNuevosDetectados = [];
    let clavesExistentes = new Set();

    // 1. Mapear claves que ya tenemos en el JSON local
    jsonNomina10lbs.departamentos.forEach(depto => {
        depto.empleados.forEach(emp => {
            clavesExistentes.add(String(emp.clave));
        });
    });

    // 2. Identificar nuevos candidatos desde el Excel
    jsonListaRaya.departamentos.forEach(deptoExcel => {
        deptoExcel.empleados.forEach(empExcel => {
            if (!clavesExistentes.has(String(empExcel.clave))) {
                empleadosNuevosDetectados.push(empExcel);
            }
        });
    });

    if (empleadosNuevosDetectados.length === 0) {
        verificarEmpleadosSinSeguro(jsonNomina10lbs);
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
                    let deptoDestino = jsonNomina10lbs.departamentos.find(d =>
                        parseInt(d.id_departamento) === parseInt(empBD.id_departamento)
                    );

                    if (deptoDestino) {
                        // Evitar duplicados si el empleado ya existe en el JSON
                        const yaExiste = deptoDestino.empleados.some(e => String(e.clave) === String(empBD.clave));
                        if (yaExiste) return;

                        // Buscar el registro original de este empleado en los detectados del Excel para traer tarjeta y conceptos
                        const empExcel = empleadosNuevosDetectados.find(e => String(e.clave) === String(empBD.clave));


                        // Crear el objeto de empleado con la estructura estándar
                        const nuevoEmpleado = {
                            clave: empBD.clave,
                            nombre: empBD.nombre,
                            id_empresa: empBD.id_empresa,
                            id_departamento: empBD.id_departamento,
                            biometrico: empBD.biometrico,
                            color_puesto: empBD.color_puesto ?? null,
                            seguroSocial: true,
                            tarjeta: empExcel ? (empExcel.tarjeta || 0) : 0,
                            conceptos: empExcel ? (empExcel.conceptos || []) : [],

                        };

                        deptoDestino.empleados.push(nuevoEmpleado);

                    }
                });


            }

            // Paso 3: Lanzar la verificación de empleados sin seguro secuencialmente
            verificarEmpleadosSinSeguro(jsonNomina10lbs);
        },
        error: function (xhr, status, error) {
            console.error('Error en la validación de empleados nuevos:', error);
        }
    });
}


function verificarEmpleadosSinSeguro(jsonNomina10lbs) {
    // Recopilar todas las claves de empleados en la nómina actual
    let clavesNomina = new Set();
    jsonNomina10lbs.departamentos.forEach(function (departamento) {
        departamento.empleados.forEach(function (empleado) {
            clavesNomina.add(String(empleado.clave || "").trim());
        });
    });

    // Obtener empleados sin seguro de la base de datos
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerEmpleadosSinSeguro'
        },
        dataType: 'json',
        success: function (response) {
            if (response.empleados && response.empleados.length > 0) {
                // Filtrar empleados sin seguro que no están en la nómina actual
                const empleadosSinSeguro = response.empleados.filter(emp => {
                    const claveSSS = String(emp.clave || "").trim();
                    return !clavesNomina.has(claveSSS);
                });

                // Agregar empleados sin seguro al departamento correspondiente por id_departamento
                empleadosSinSeguro.forEach(function (empSinSeguro) {
                    const idDepto = parseInt(empSinSeguro.id_departamento);

                    // Buscar departamento destino en la nómina por ID
                    let deptoDestino = jsonNomina10lbs.departamentos.find(d =>
                        d.id_departamento && parseInt(d.id_departamento) === idDepto
                    );

                    // Si el departamento no existe en el JSON de la nómina, se omite o se podría crear
                    // En este caso, solo lo agregamos si el departamento ya existe (es de la nómina)
                    if (deptoDestino) {
                        const empleado = {
                            clave: empSinSeguro.clave,
                            nombre: empSinSeguro.nombre,
                            tarjeta: null,
                            biometrico: empSinSeguro.biometrico ?? null,
                            id_empresa: empSinSeguro.id_empresa,
                            id_departamento: empSinSeguro.id_departamento,
                            color_puesto: empSinSeguro.color_puesto ?? null,
                            seguroSocial: false
                        };

                        // Solo agregar si no existe ya en el departamento
                        const existe = deptoDestino.empleados.some(emp => emp.clave === empleado.clave);
                        if (!existe) {
                            deptoDestino.empleados.push(empleado);
                        }
                    }
                });
            }

            // FINALIZACIÓN: Asignar propiedades, ordenar, guardar y refrescar UI
            asignarPropiedadesEmpleado(jsonNomina10lbs);
            ordenarEmpleadosPorApellido(jsonNomina10lbs);
            initComponents();

            /*  if (typeof saveNomina === 'function') {
                  saveNomina(jsonNomina10lbs);
              }*/

            actualizarCabeceraNomina(jsonNomina10lbs);
            poblarSelectDepartamentos(jsonNomina10lbs);
            refrescarTabla();
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener empleados sin seguro:', error);
            // Intentar finalizar incluso con error en este paso
            poblarSelectDepartamentos(jsonNomina10lbs);
            refrescarTabla();
        }
    });
}





// FUNCIONES AUXILIARES

// Función para asignar propiedades necesarias a empleados de departamentos específicos
function asignarPropiedadesEmpleado(jsonNomina10lbs) {
    if (!jsonNomina10lbs || !Array.isArray(jsonNomina10lbs.departamentos)) return;

    // Recorrer todos los departamentos
    jsonNomina10lbs.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            // --- PROPIEDADES GENERALES (Aplicar a todos, incluyendo residuales) ---

            // Agregar propiedad mostrar (para filtrar en tabla)
            if (empleado.mostrar === undefined) {
                empleado.mostrar = true;
            }

            // Asegurar que tengan tarjeta_copia para sincronización
            if (empleado.tarjeta_copia === undefined) {
                empleado.tarjeta_copia = empleado.tarjeta;
            }

            // --- PROPIEDADES DE NÓMINA ---

            // Inicializar registros como array vacío si no existen
            if (!empleado.registros || !Array.isArray(empleado.registros)) {
                empleado.registros = [];
            }

            // Agregar o mantener las propiedades necesarias (no sobrescribir si ya vienen de la BD)
            empleado.sueldo_neto = empleado.sueldo_neto ?? 0;
            empleado.color_puesto = empleado.color_puesto ?? null;
            empleado.sueldo_extra_total = empleado.sueldo_extra_total ?? 0;
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
            }
        });
    });
}

// Función para ordenar empleados por apellido paterno dentro de cada departamento
function ordenarEmpleadosPorApellido(jsonOrdenado) {
    jsonOrdenado.departamentos.forEach(function (departamento) {
        departamento.empleados.sort(function (a, b) {
            var apellidoA = a.nombre.split(' ')[0]; // Primer palabra es apellido paterno
            var apellidoB = b.nombre.split(' ')[0];
            return apellidoA.localeCompare(apellidoB);
        });
    });

}

