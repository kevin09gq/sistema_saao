// Variables Globales
jsonNomina40lbs = null;


$(document).ready(function () {
    processExcelData();
    restoreNomina();
    confirmarsaveNomina();
    limpiarCamposNomina();


});


// PASO 1: Función para procesar los archivos Excel subidos por el usuario y unir los datos 
function processExcelData(params) {
    $('#btn_procesar_nomina_40lbs').on('click', function (e) {
        e.preventDefault();

        var $form = $('#form_excel_raya');
        var form = $form[0];

        // 1. Enviar el primer archivo Excel (Lista de Raya)
        var formData1 = new FormData();
        if (!form.archivo_excel_lista_raya_40lbs || form.archivo_excel_lista_raya_40lbs.files.length === 0) {
            alert('Selecciona el archivo Lista de Raya.');
            return;
        }
        // El backend (`leerListaRaya.php`) espera el campo 'archivo_excel'
        formData1.append('archivo_excel', form.archivo_excel_lista_raya_40lbs.files[0]);

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

                // Antes de continuar, consultar si la nómina ya está guardada en BD para esta semana
                const numeroSemana = JsonListaRaya.numero_semana;

                // IMPORTANTE: Usar fecha_cierre para determinar el año (NO fecha_inicio)
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

                // Hay Nomina en la BD

                if (typeof validarExistenciaNomina === 'function') {
                    // validarExistenciaNomina devuelve Promise<boolean>
                    validarExistenciaNomina(numeroSemana, anio).then(function (existe) {
                        if (existe) {
                            // Obtener la nómina real desde el servidor
                            getNomina40lbs(numeroSemana, anio).then(function (nomina) {
                                jsonNomina40lbs = nomina;
                                validarExistenciaTrabajadorBD(jsonNomina40lbs);
                                
                              
                                $('#btn_procesar_nomina_40lbs').removeClass('loading').prop('disabled', false);
                            }).catch(function (err) {
                                console.error('Error al obtener nómina desde servidor:', err);
                                $('#btn_procesar_nomina_40lbs').removeClass('loading').prop('disabled', false);
                            });

                        } else {
                            // Verificar si se subió el archivo biométrico (opcional)
                            const hayBiometrico = form.archivo_excel_biometrico_40lbs && form.archivo_excel_biometrico_40lbs.files.length > 0;

                            if (hayBiometrico) {
                                // Si hay biométrico, validar existencia pero omitir agregar empleados sin seguro por ahora
                                validarExistenciaTrabajador(JsonListaRaya, true);
                                procesarBiometrico(form, JsonListaRaya);
                                console.log(jsonNomina40lbs);

                            } else {
                                // Si no hay biométrico, validar existencia y sí agregar empleados sin seguro
                                validarExistenciaTrabajador(JsonListaRaya, false);

                                // aplicar cambios 
                                $('#btn_procesar_nomina_40lbs').removeClass('loading').prop('disabled', false);

                            }
                        }
                    }).catch(function (err) {
                        console.error('Error verificando existencia de nómina:', err);
                        $('#btn_procesar_nomina_40lbs').removeClass('loading').prop('disabled', false);
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
obtenerEmpleadosSinSS(JsonListaRaya) se obtiene de manera general a los empleados que no tienen seguro y se unen al jsonNomina40lbs->
asignarPropiedadesEmpleado(JsonListaRaya) se asignan las propiedades necesarias a los empleados del departamento 40 y 10 libras y sin seguro->
ordenarEmpleadosPorApellido(JsonListaRaya) se ordenan los empleados por apellido paterno dentro de cada departamento->
jsonNomina40lbs = JsonListaRaya asignando el jsonNomina40lbs ;
*/

// PASO 1: Función para obtener las claves de empleados y verificar su existencia en la base de datos
function validarExistenciaTrabajador(JsonListaRaya, omitirSinSeguro = false) {
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
                // Obtener claves existentes
                var clavesExistentes = response.existentes.map(emp => emp.clave);

                // Filtrar empleados que existen en BD y actualizar nombres
                JsonListaRaya.departamentos.forEach(function (departamento) {
                    departamento.empleados = departamento.empleados.filter(emp => {
                        if (clavesExistentes.includes(emp.clave)) {
                            // Buscar el nombre en la BD y sobreescribirlo
                            var empBD = response.existentes.find(e => e.clave === emp.clave);
                            if (empBD) {
                                emp.nombre = empBD.nombre;
                                emp.id_empresa = empBD.id_empresa;
                            }
                            return true;
                        }
                        return false;
                    });
                });
                if (!omitirSinSeguro) {
                    // Obtener empleados sin seguro y unirlos al JSON
                    obtenerEmpleadosSinSS(JsonListaRaya);
                } else {
                    // Omitir obtener empleados sin seguro: asignar propiedades y finalizar
                    // asignarPropiedadesEmpleado(JsonListaRaya);
                    // jsonNomina40lbs = JsonListaRaya;
                    // ordenarEmpleadosPorApellido(JsonListaRaya);

                }

            }

            if (response.no_existentes) {
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al verificar empleados:', error);
            console.error('Respuesta del servidor:', xhr.responseText);
        }
    });
}

// PASO 2: Función para obtener empleados sin seguro de manera general y unirlos al JSON de nómina
function obtenerEmpleadosSinSS(JsonListaRaya) {
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerEmpleadosSinSeguro'
        },
        dataType: 'json',
        success: function (response) {
            if (response.empleados && response.empleados.length > 0) {
                // Crear departamento "Sin Seguro"
                var departamentoSinSeguro = {
                    nombre: "Sin Seguro",
                    empleados: []
                };

                // Convertir empleados de BD a estructura del JSON
                response.empleados.forEach(function (empleadoBD) {
                    var empleado = {
                        clave: empleadoBD.clave,
                        nombre: empleadoBD.ap_paterno + ' ' + empleadoBD.ap_materno + ' ' + empleadoBD.nombre,
                        tarjeta: null,
                        id_empresa: empleadoBD.id_empresa

                    };
                    departamentoSinSeguro.empleados.push(empleado);
                });

                // Agregar departamento al jsonNomina40lbs
                if (JsonListaRaya && JsonListaRaya.departamentos) {
                    JsonListaRaya.departamentos.push(departamentoSinSeguro);


                }

                // Asignar propiedades necesarias a todos los empleados
                asignarPropiedadesEmpleado(JsonListaRaya);
                jsonNomina40lbs = JsonListaRaya;
                initComponents();

                if (typeof saveNomina === 'function') {
                    saveNomina(jsonNomina40lbs);
                }


                // Filtrar empleados con id_departamento 4
                let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNomina40lbs, 4);
                console.log(jsonNomina40lbs);


                mostrarDatosTabla(jsonFiltrado, 1);
                console.log("JSON filtrado (id_departamento 4):", jsonFiltrado);
                console.log(jsonNomina40lbs);


                ordenarEmpleadosPorApellido(JsonListaRaya);
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
obtenerEmpleadosSinSeguroBiometrico(empleadosNoUnidos) se obtiene de manera especifica a los empleados que no se unieron y no tienen seguro y se unen al jsonNomina40lbs->
asignarPropiedadesEmpleado(jsonNomina40lbs) se asignan las propiedades necesarias a los empleados del departamento 40 y 10 libras y sin seguro->
ordenarEmpleadosPorApellido(jsonNomina40lbs) se ordenan los empleados por apellido paterno dentro de cada departamento->

*/


// PASO 1: Función encargada de procesar el archivo biométrico subido por el usuario. 
function procesarBiometrico(form, JsonListaRaya) {
    var formData2 = new FormData();
    formData2.append('archivo_excel2', form.archivo_excel_biometrico_40lbs.files[0]);

    $.ajax({
        url: '../php/leerBiometrico.php',
        type: 'POST',
        data: formData2,
        processData: false,
        contentType: false,
        success: function (res2) {
            try {
                const JsonBiometrico = JSON.parse(res2);

                jsonNomina40lbs = unirJson(JsonListaRaya, JsonBiometrico);
                const empleadosNoUnidos = obtenerEmpleadosNoUnidos(JsonListaRaya, JsonBiometrico);
                // Validar empleados sin IMSS solo si hay empleados no unidos
                if (empleadosNoUnidos && empleadosNoUnidos.length > 0) {
                    obtenerEmpleadosSinSeguroBiometrico(empleadosNoUnidos);
                }




            } catch (e) {
                console.error('Error al parsear datos biométricos:', e);
            } finally {
                $('#btn_procesar_nomina_40lbs').removeClass('loading').prop('disabled', false);
            }
        },
        error: function (xhr, status, error) {

            console.error('Error al procesar archivo biométrico:', error);

        }
    });
}

// PASO 2: Función para unir los registros del biométrico al JSON de nómina
function unirJson(json1, json2) {
    // Departamentos objetivo donde se debe aplicar la unión de registros
    const objetivos = ['produccion 40 libras', 'empaque 10 libras', 'sin seguro'];

    // Normalizar nombre de departamento (quita número inicial y pasa a minúsculas)
    const normalizarDept = s => String(s || '').replace(/^\s*\d+\s+/, '').trim().toLowerCase();

    // Si json2 no existe o no tiene empleados, inicializar registros sólo en departamentos objetivo
    if (!json2 || !json2.empleados || json2.empleados.length === 0) {
        if (json1 && json1.departamentos) {
            json1.departamentos.forEach(depto => {
                const nombreDept = normalizarDept(depto.nombre);
                if (objetivos.some(t => nombreDept.includes(t))) {
                    if (depto.empleados) {
                        depto.empleados.forEach(emp1 => {
                            if (!emp1.registros || !Array.isArray(emp1.registros)) emp1.registros = [];
                        });
                    }
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

    // Recorre únicamente los departamentos objetivo y aplica la unión de registros
    if (json1 && json1.departamentos) {
        json1.departamentos.forEach(depto => {
            const nombreDept = normalizarDept(depto.nombre);
            if (!objetivos.some(t => nombreDept.includes(t))) return; // saltar otros departamentos

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
function obtenerEmpleadosNoUnidos(JsonListaRaya, JsonBiometrico) {
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
    if (JsonListaRaya && JsonListaRaya.departamentos) {
        JsonListaRaya.departamentos.forEach(depto => {
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
            console.log('Empleados sin seguro del biometrico:', response);

            if (response.empleados && response.empleados.length > 0) {
                // Crear departamento "Sin Seguro"
                const departamentoSinSeguro = {
                    nombre: "Sin Seguro",
                    empleados: []
                };

                // Convertir empleados de BD a estructura del JSON
                response.empleados.forEach(function (empleadoBD) {
                    // Buscar el empleado correspondiente en empleadosNoUnidos por biometrico
                    const empleadoBiometrico = empleadosNoUnidos.find(emp => emp.id_biometrico == empleadoBD.biometrico);

                    const empleado = {
                        clave: empleadoBD.clave,
                        nombre: empleadoBD.ap_paterno + ' ' + empleadoBD.ap_materno + ' ' + empleadoBD.nombre,
                        tarjeta: null,
                        id_empresa: empleadoBD.id_empresa,
                        // Establecer registros del biometrico si existen
                        registros: empleadoBiometrico ? (empleadoBiometrico.registros || []) : []
                    };
                    departamentoSinSeguro.empleados.push(empleado);
                });

                // Agregar departamento al jsonNomina40lbs
                if (jsonNomina40lbs && jsonNomina40lbs.departamentos) {
                    jsonNomina40lbs.departamentos.push(departamentoSinSeguro);

                }

                asignarPropiedadesEmpleado(jsonNomina40lbs);
                ordenarEmpleadosPorApellido(jsonNomina40lbs);


            }
        },
        error: function (xhr, status, error) {
            console.error('Error al validar empleados sin seguro del biometrico:', error);
        }
    });
}


/*
Validacion 3: Sube Lista de Raya y la informacion se guarda en la base de datos
*/

function validarExistenciaTrabajadorBD(JsonListaRaya) {
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
            case: 'validarExistenciaTrabajadorBD'
        },
        dataType: 'json',
        success: function (response) {

            // Aquí puedes procesar la respuesta
            if (response.existentes) {
                // Obtener claves existentes
                var clavesExistentes = response.existentes.map(emp => emp.clave);

                // Filtrar empleados: solo dejar los que existen en BD (id_status=1 e id_empresa=1)
                JsonListaRaya.departamentos.forEach(function (departamento) {
                    departamento.empleados = departamento.empleados.filter(function (empleado) {
                        return clavesExistentes.includes(String(empleado.clave));
                    });
                });

                // Quitar departamentos vacíos
                JsonListaRaya.departamentos = JsonListaRaya.departamentos.filter(function (departamento) {
                    return departamento.empleados.length > 0;
                });

                console.log(JsonListaRaya);
                

            }

        },
        error: function (xhr, status, error) {
            console.error('Error al verificar empleados:', error);
            console.error('Respuesta del servidor:', xhr.responseText);
        }
    });
}




// FUNCIONES AUXILIARES

// Función para asignar propiedades necesarias a empleados de departamentos específicos
function asignarPropiedadesEmpleado(jsonNomina40lbs) {
    if (!jsonNomina40lbs || !Array.isArray(jsonNomina40lbs.departamentos)) return;

    // Recorrer todos los departamentos
    jsonNomina40lbs.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        // Mapear nombre de departamento a id (si corresponde) - PARA TODOS
        const nombreDeptRaw = String(departamento.nombre || '').trim();
        // Quitar número al inicio si existe: "1 Administracion" -> "Administracion"
        const nombreDept = nombreDeptRaw.replace(/^\s*\d+\s+/, '').trim();
        const nombreLower = nombreDept.toLowerCase();
        let mappedId = null;
        if (nombreLower === 'administracion') mappedId = 1;
        else if (nombreLower === 'produccion') mappedId = 2;
        else if (nombreLower === 'seguridad vigilancia e intendencia') mappedId = 3;
        else if (nombreLower === 'produccion 40 libras') mappedId = 4;
        else if (nombreLower === 'empaque 10 libras') mappedId = 5;
        else if (nombreLower === 'relicario coordinadores') mappedId = 6;
        else if (nombreLower === 'relicario jornaleros') mappedId = 7;
        else if (nombreLower === 'rancho el pilar') mappedId = 8;
        else if (nombreLower === 'administracion sucursal cdmx') mappedId = 9;
        else if (nombreLower === 'compra de limon') mappedId = 10;

        // Asignar id_departamento a todos los empleados
        departamento.empleados.forEach(empleado => {
            if ((empleado.id_departamento === undefined || empleado.id_departamento === null) && mappedId !== null) {
                empleado.id_departamento = mappedId;
            }
        });

        // Verificar si es departamento que necesita propiedades específicas
        const esProduccion40 = nombreLower.includes('produccion 40 libras');
        const esEmpaque10 = nombreLower.includes('empaque 10 libras');
        const esSinSeguro = nombreLower.includes('sin seguro');

        if (esProduccion40 || esEmpaque10 || esSinSeguro) {
            // Recorrer empleados solo para departamentos específicos
            departamento.empleados.forEach(empleado => {
                // Inicializar registros como array vacío si no existen
                if (!empleado.registros || !Array.isArray(empleado.registros)) {
                    empleado.registros = [];
                }

                // Agregar o mantener las propiedades necesarias (no sobrescribir si ya vienen de la BD)
                empleado.sueldo_neto = empleado.sueldo_semanal ?? 0;
                empleado.incentivo = empleado.incentivo ?? 0;
                empleado.horas_extra = empleado.horas_extra ?? 0;
                empleado.bono_antiguedad = empleado.bono_antiguedad ?? 0;
                empleado.actividades_especiales = empleado.actividades_especiales ?? 0;
                empleado.puesto = empleado.puesto ?? '';
                empleado.sueldo_extra_total = empleado.sueldo_extra_total ?? 0;
                empleado.retardos = empleado.retardos ?? 0;
                empleado.prestamo = empleado.prestamo ?? 0;
                empleado.permiso = empleado.permiso ?? 0;
                empleado.inasistencia = empleado.inasistencia ?? 0;
                empleado.uniformes = empleado.uniformes ?? 0;
                empleado.checador = empleado.checador ?? 0;
                empleado.fa_gafet_cofia = empleado.fa_gafet_cofia ?? 0;
                empleado.total_cobrar = empleado.total_cobrar ?? 0;
                empleado.id_empresa = empleado.id_empresa ?? null;
                empleado.redondeo = empleado.redondeo ?? 0;
                empleado.redondeo_activo = empleado.redondeo_activo ?? false;

                // Inicializar historial de retardos
                if (!empleado.historial_retardos || !Array.isArray(empleado.historial_retardos)) {
                    empleado.historial_retardos = [];
                }

                // Inicializar historial de inasistencias
                if (!empleado.historial_inasistencias || !Array.isArray(empleado.historial_inasistencias)) {
                    empleado.historial_inasistencias = [];
                }

                // Inicializar historial de olvidos
                if (!empleado.historial_olvidos || !Array.isArray(empleado.historial_olvidos)) {
                    empleado.historial_olvidos = [];
                }

                // Inicializar historial de uniformes
                if (!empleado.historial_uniformes || !Array.isArray(empleado.historial_uniformes)) {
                    empleado.historial_uniformes = [];
                }

                // Inicializar historial de permisos
                if (!empleado.historial_permisos || !Array.isArray(empleado.historial_permisos)) {
                    empleado.historial_permisos = [];
                }

                // Crear array de conceptos si no existe
                if (!empleado.conceptos || !Array.isArray(empleado.conceptos)) {
                    empleado.conceptos = [
                        { codigo: "45", resultado: '' },   // ISR
                        { codigo: "52", resultado: '' },   // IMSS
                        { codigo: "16", resultado: '' },   // Infonavit
                        { codigo: "107", resultado: '' }   // Ajuste al Sub
                    ];
                }
                // Agregar propiedad mostrar (para filtrar en tabla)
                if (empleado.mostrar === undefined) {
                    empleado.mostrar = true;
                }
            });
        }
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

// Función para filtrar empleados por id_departamento
function filtrarEmpleadosPorDepartamento(jsonNomina, idDepartamento) {
    let jsonFiltrado = {
        departamentos: []
    };

    if (jsonNomina && jsonNomina.departamentos) {
        jsonNomina.departamentos.forEach(depto => {
            let deptoFiltrado = {
                nombre: depto.nombre,
                empleados: depto.empleados.filter(emp => emp.id_departamento === idDepartamento)
            };

            // Solo agregar departamento si tiene empleados con el id_departamento especificado
            if (deptoFiltrado.empleados.length > 0) {
                jsonFiltrado.departamentos.push(deptoFiltrado);
            }
        });
    }

    return jsonFiltrado;
}
