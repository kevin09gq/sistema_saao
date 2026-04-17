// Variables Globales
jsonNominaConfianza = null;
var paginaActualNomina = 1;

$(document).ready(function () {
    // Esperar a que los selectores estén cargados antes de restaurar para evitar filtros vacíos
    cargarSelectsConfianza().then(function () {
        if (!restoreNomina()) {
            $("#container-nomina_confianza").removeAttr("hidden");
              
        }
         console.log(jsonNominaConfianza);
    });
    processExcelData();
    confirmarsaveNomina();
      
  

});

// PASO 1: Función para procesar los archivos Excel subidos por el usuario y unir los datos 
function processExcelData() {

    $('#btn_procesar_nomina_confianza').on('click', function (e) {
        e.preventDefault();

        var form = $('#form_excel_raya')[0];

        // 1. Validar archivo principal SAAO
        if (!form.archivo_excel_lista_raya_saao || form.archivo_excel_lista_raya_saao.files.length === 0) {
            Swal.fire('Error', 'Selecciona el archivo Lista de Raya SAAO.', 'error');
            return;
        }

        // Mostrar indicador de carga
        $(this).addClass('loading').prop('disabled', true);

        // Procesar archivo 1 (SAAO)
        var formData1 = new FormData();
        formData1.append('archivo_excel', form.archivo_excel_lista_raya_saao.files[0]);

        $.ajax({
            url: '../php/leerListaRaya.php',
            type: 'POST',
            data: formData1,
            processData: false,
            contentType: false,
            success: function (res1) {
                try {
                    const jsonSAAO = JSON.parse(res1);
                    // Asignar id_empresa = 1 (SAAO)
                    jsonSAAO.departamentos.forEach(d => {
                        if (d.empleados) d.empleados.forEach(e => e.id_empresa = 1);
                    });

                    // Verificar si hay un segundo archivo (SB Group)
                    const haySBGroup = form.archivo_excel_lista_raya_sbgroup && form.archivo_excel_lista_raya_sbgroup.files.length > 0;

                    if (haySBGroup) {
                        // Procesar archivo 2 (SB Group)
                        var formData2 = new FormData();
                        formData2.append('archivo_excel', form.archivo_excel_lista_raya_sbgroup.files[0]);

                        $.ajax({
                            url: '../php/leerListaRaya.php',
                            type: 'POST',
                            data: formData2,
                            processData: false,
                            contentType: false,
                            success: function (res2) {
                                try {
                                    const jsonSBGroup = JSON.parse(res2);
                                    // Asignar id_empresa = 2 (SB Group)
                                    jsonSBGroup.departamentos.forEach(d => {
                                        if (d.empleados) d.empleados.forEach(e => e.id_empresa = 2);
                                    });

                                    // FUSIONAR AMBOS ARCHIVOS
                                    const jsonListaRaya = unirJsonListaRaya(jsonSAAO, jsonSBGroup);

                                    if (jsonListaRaya) {
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
                                                    getNominaConfianza(numeroSemana, anio).then(function (nomina) {
                                                        jsonNominaConfianza = nomina;
                                                        console.log(jsonNominaConfianza);
                                                        //Actualizar Fechas de inicio y cierre
                                                        jsonNominaConfianza.fecha_inicio = jsonListaRaya.fecha_inicio;
                                                        jsonNominaConfianza.fecha_cierre = jsonListaRaya.fecha_cierre;

                                                        validarExistenciaTrabajadorBD(jsonNominaConfianza, jsonListaRaya);
                                                        // validarExistenciaTrabajadorBD(jsonNominaConfianza, jsonListaRaya);

                                                        $('#btn_procesar_nomina_confianza').removeClass('loading').prop('disabled', false);
                                                    }).catch(function (err) {
                                                        console.error('Error al obtener nómina desde servidor:', err);
                                                        $('#btn_procesar_nomina_confianza').removeClass('loading').prop('disabled', false);
                                                    });

                                                } else {
                                                    // Verificar si se subió el archivo biométrico (opcional)
                                                    const hayBiometrico = form.archivo_excel_biometrico_confianza && form.archivo_excel_biometrico_confianza.files.length > 0;

                                                    if (hayBiometrico) {
                                                        crearEstructuraJson(jsonListaRaya, true, form);

                                                    } else {
                                                        crearEstructuraJson(jsonListaRaya, false);
                                                    }
                                                }
                                            }).catch(function (err) {
                                                console.error('Error verificando existencia de nómina:', err);
                                                $('#btn_procesar_nomina_confianza').removeClass('loading').prop('disabled', false);
                                            });
                                        }

                                    } else {
                                        $('#btn_procesar_nomina_confianza').removeClass('loading').prop('disabled', false);
                                    }
                                } catch (e) {
                                    console.error('Error al procesar SB Group:', e);
                                    $('#btn_procesar_nomina_confianza').removeClass('loading').prop('disabled', false);
                                }
                            },
                            error: function () {
                                Swal.fire('Error', 'No se pudo procesar el archivo SB Group.', 'error');
                                $('#btn_procesar_nomina_confianza').removeClass('loading').prop('disabled', false);
                            }
                        });
                    } else {
                        // Solo archivo SAAO
                        // iniciarValidacionNomina(JsonSAAO, form);
                    }
                } catch (e) {
                    console.error('Error al procesar SAAO:', e);
                    $('#btn_procesar_nomina_confianza').removeClass('loading').prop('disabled', false);
                }
            }


        });

    });
}


function crearEstructuraJson(jsonListaRaya, siHayBiometrico = false, form = null) {
    // 1. Obtener departamentos autorizados para la nómina Confianza (ID 5)
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerDepartamentosNomina',
            id_nomina: 3
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
                $('#btn_procesar_nomina_confianza').removeClass('loading').prop('disabled', false);
                return;
            }

            // 2. Crear nueva estructura base con los departamentos de la BD
            let estructuraJson = {
                numero_semana: jsonListaRaya.numero_semana,
                fecha_inicio: jsonListaRaya.fecha_inicio,
                fecha_cierre: jsonListaRaya.fecha_cierre,
                departamentos: respDepts.departamentos.map(d => ({
                    id_departamento: d.id_departamento,
                    nombre: d.nombre_departamento,
                    color_reporte: d.color_reporte || '#FF0000',
                    empleados: []
                }))
            };


            // ACA LLAMAMOS A LA VALIDACIÓN
            // Si hay biométrico (true), omitimos los sin seguro temporalmente
            validarExistenciaTrabajador(jsonListaRaya, estructuraJson, siHayBiometrico, form);
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
            $('#btn_procesar_nomina_confianza').removeClass('loading').prop('disabled', false);
        }
    });

}

// PASO 1: Función para obtener las claves de empleados y verificar su existencia en la base de datos
function validarExistenciaTrabajador(jsonListaRaya, estructuraJson = null, siHayBiometrico = false, form = null) {

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
                        for (let dExcel of jsonListaRaya.departamentos) {
                            empExcel = dExcel.empleados.find(e => String(e.clave) === String(empBD.clave) && e.id_empresa == empBD.id_empresa);
                            if (empExcel) break;
                        }

                        if (empExcel) {
                            // Crear empleado final combinando BD y Excel
                            let empleadoFinal = {
                                clave: empBD.clave,
                                nombre: empBD.nombre,
                                id_empresa: empBD.id_empresa,
                                id_departamento: empBD.id_departamento,
                                biometrico: empBD.biometrico,
                                salario_semanal: empBD.salario_semanal,
                                horario_oficial: empBD.horario_oficial,
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
                        // obtenerEmpleadosSinSeguro(estructuraJson);
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

// PASO 2: Función para obtener empleados de los departamentos que estan relacionado a la nomina pilar (sin seguro)
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
                        nombre: empleadoBD.nombre,
                        id_empresa: empleadoBD.id_empresa,
                        id_departamento: empleadoBD.id_departamento,
                        biometrico: empleadoBD.biometrico,
                        salario_semanal: empleadoBD.salario_semanal,
                        horario_oficial: empleadoBD.horario_oficial,
                        seguroSocial: false
                    };


                    // Determinar el destino según si usamos la estructura de la BD o la del Excel
                    if (estructuraJson) {
                        let dpto = estructuraJson.departamentos.find(d => d.id_departamento == empleadoBD.id_departamento);
                        if (dpto) {
                            // Evitar duplicados por CLAVE e ID_EMPRESA
                            const yaExiste = dpto.empleados.some(e => String(e.clave) === String(empleado.clave) && e.id_empresa == empleado.id_empresa);
                            if (!yaExiste) {
                                dpto.empleados.push(empleado);
                            }
                        }
                    }

                });

                asignarPropiedadesEmpleado(estructuraJson);
                ordenarEmpleadosPorNombre(estructuraJson);
                jsonNominaConfianza = estructuraJson;
                actualizarCabeceraNomina(jsonNominaConfianza);
                initComponents(); // Inicializar componentes después de tener la estructura completa

                // Aplicar filtros iniciales (esto mostrará la tabla automáticamente)
                if (typeof aplicarFiltrosConfianza === 'function') {
                    aplicarFiltrosConfianza();
                }

                console.log(jsonNominaConfianza);
                //actualizarCabeceraNomina(jsonNominaConfianza);

            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener empleados sin seguro:', error);
        }
    });
}

// PASO 1: Función encargada de procesar el archivo biométrico subido por el usuario. 
function procesarBiometrico(form, estructuraJson) {
    var formData2 = new FormData();
    formData2.append('archivo_excel2', form.archivo_excel_biometrico_confianza.files[0]);

    $.ajax({
        url: '../php/leerBiometrico.php',
        type: 'POST',
        data: formData2,
        processData: false,
        contentType: false,
        success: function (res2) {
            try {
                const jsonBiometrico = JSON.parse(res2);
                jsonNominaConfianza = unirJson(estructuraJson, jsonBiometrico);
                const empleadosNoUnidos = obtenerEmpleadosNoUnidos(estructuraJson, jsonBiometrico);
                // Validar empleados sin IMSS solo si hay empleados no unidos
                if (empleadosNoUnidos && empleadosNoUnidos.length > 0) {
                    obtenerEmpleadosSinSeguroBiometrico(empleadosNoUnidos);
                }

            } catch (e) {
                console.error('Error al parsear datos biométricos:', e);
            } finally {
                $('#btn_procesar_nomina_confianza').removeClass('loading').prop('disabled', false);
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

    // Crear un conjunto de nombres normalizados de jsonListaRaya
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

    // Filtrar empleados de JsonBiometrico que no están en jsonListaRaya
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
                        nombre: empleadoBD.nombre,
                        tarjeta: null,
                        id_empresa: empleadoBD.id_empresa,
                        id_departamento: empleadoBD.id_departamento,
                        biometrico: empleadoBD.biometrico,
                        salario_semanal: empleadoBD.salario_semanal,
                        horario_oficial: empleadoBD.horario_oficial,
                        seguroSocial: false,
                        // Establecer registros del biometrico si existen
                        registros: empleadoBiometrico ? (empleadoBiometrico.registros || []) : []
                    };


                    // Buscar el departamento correspondiente usando el ID directamente
                    if (jsonNominaConfianza && jsonNominaConfianza.departamentos) {
                        let dpto = jsonNominaConfianza.departamentos.find(d => d.id_departamento == empleadoBD.id_departamento);

                        if (dpto) {
                            // Evitar duplicados por CLAVE e ID_EMPRESA
                            const yaExiste = dpto.empleados.some(e => String(e.clave) === String(empleado.clave) && e.id_empresa == empleado.id_empresa);
                            if (!yaExiste) {
                                dpto.empleados.push(empleado);
                            }
                        } else {
                            console.warn(`No se encontró el departamento con ID ${empleadoBD.id_departamento} en la estructura de nómina.`);
                        }
                    }
                });
                asignarPropiedadesEmpleado(jsonNominaConfianza);
                ordenarEmpleadosPorNombre(jsonNominaConfianza);
                if (typeof calcularRetardosTodos === 'function') {
                    calcularRetardosTodos(jsonNominaConfianza);
                }
                if (typeof calcularInasistenciasTodos === 'function') {
                    calcularInasistenciasTodos(jsonNominaConfianza);
                }
                if (typeof calcularOlvidosTodos === 'function') {
                    calcularOlvidosTodos(jsonNominaConfianza);
                }
                actualizarCabeceraNomina(jsonNominaConfianza);
                initComponents();
                //actualizarCabeceraNomina(jsonNominaConfianza);
                // Aplicar filtros iniciales (esto mostrará la tabla automáticamente)
                if (typeof aplicarFiltrosConfianza === 'function') {
                    aplicarFiltrosConfianza();
                }
                console.log(jsonNominaConfianza);

            }
        },
        error: function (xhr, status, error) {
            console.error('Error al validar empleados sin seguro del biometrico:', error);
        }
    });
}


// PASO 1: Validar existencia de trabajadores en la BD (se ejecuta al inicio del proceso si la nómina ya existe) 
function validarExistenciaTrabajadorBD(jsonNominaConfianza, jsonListaRaya) {
    // Array para almacenar todas las claves de empleados que ya tenemos en la BD
    var clavesEmpleados = [];

    // Recorrer todos los departamentos de la nómina recuperada
    jsonNominaConfianza.departamentos.forEach(function (departamento) {
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
                // Obtener claves vigentes compuestas (clave-id_empresa)
                var clavesExistentes = response.existentes.map(emp => `${emp.clave}-${emp.id_empresa}`);

                // 2. Filtrar: Solo dejar empleados que siguen vigentes en la BD
                jsonNominaConfianza.departamentos.forEach(function (departamento) {
                    departamento.empleados = departamento.empleados.filter(function (empleado) {
                        const claveCompuesta = `${empleado.clave}-${empleado.id_empresa}`;
                        return clavesExistentes.includes(claveCompuesta);
                    });
                });

                // 3. Sincronizar: Actualizar conceptos y tarjeta con los nuevos datos del Excel actual
                jsonNominaConfianza.departamentos.forEach(function (departamentoBD) {
                    departamentoBD.empleados.forEach(function (empleadoBD) {
                        // Buscar al mismo empleado en el Excel actual usando su clave
                        let empleadoExcel = null;
                        for (let deptoExcel of jsonListaRaya.departamentos) {
                            empleadoExcel = deptoExcel.empleados.find(e => String(e.clave) === String(empleadoBD.clave) && e.id_empresa == empleadoBD.id_empresa);
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

                agregarEmpleadosNuevos(jsonNominaConfianza, jsonListaRaya);

            }
        },
        error: function (xhr, status, error) {
            console.error('Error al verificar empleados en Validación 3:', error);
            $('#btn_procesar_nomina_confianza').removeClass('loading').prop('disabled', false);
        }
    });
}

// PASO 2: Agregar empleados nuevos al jsonNominaConfianza
// Compara el Excel (jsonListaRaya) contra el JSON local y valida en BD los que falten.
function agregarEmpleadosNuevos(jsonNominaConfianza, jsonListaRaya) {
    if (!jsonListaRaya || !jsonListaRaya.departamentos) return;

    let empleadosNuevosDetectados = [];
    let clavesExistentes = new Set();

    // 1. Mapear claves compuestas que ya tenemos en el JSON local (clave-id_empresa)
    jsonNominaConfianza.departamentos.forEach(depto => {
        depto.empleados.forEach(emp => {
            clavesExistentes.add(`${emp.clave}-${emp.id_empresa}`);
        });
    });

    // 2. Identificar nuevos candidatos desde el Excel usando clave compuesta
    jsonListaRaya.departamentos.forEach(deptoExcel => {
        deptoExcel.empleados.forEach(empExcel => {
            const claveCompuesta = `${empExcel.clave}-${empExcel.id_empresa}`;
            if (!clavesExistentes.has(claveCompuesta)) {
                empleadosNuevosDetectados.push(empExcel);
            }
        });
    });

    if (empleadosNuevosDetectados.length === 0) {
        verificarEmpleadosSinSeguro(jsonNominaConfianza);
        return;
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
                    let deptoDestino = jsonNominaConfianza.departamentos.find(d =>
                        parseInt(d.id_departamento) === parseInt(empBD.id_departamento)
                    );

                    if (deptoDestino) {
                        // Evitar duplicados por CLAVE e ID_EMPRESA
                        const yaExiste = deptoDestino.empleados.some(e => String(e.clave) === String(empBD.clave) && e.id_empresa == empBD.id_empresa);
                        if (yaExiste) return;

                        // Buscar el registro original de este empleado en los detectados del Excel para traer tarjeta y conceptos
                        const empExcel = empleadosNuevosDetectados.find(e => String(e.clave) === String(empBD.clave) && e.id_empresa == empBD.id_empresa);

                        if (empExcel) {
                            // Crear el objeto de empleado con la estructura estándar
                            const nuevoEmpleado = {
                                clave: empBD.clave,
                                nombre: empBD.nombre,
                                id_empresa: empBD.id_empresa,
                                id_departamento: empBD.id_departamento,
                                biometrico: empBD.biometrico,
                                salario_semanal: empBD.salario_semanal,
                                horario_oficial: empBD.horario_oficial,
                                seguroSocial: true,
                                tarjeta: empExcel.tarjeta,
                                conceptos: empExcel.conceptos
                            };

                            deptoDestino.empleados.push(nuevoEmpleado);
                        }
                    }
                });
            }

            // Paso 3: Lanzar la verificación de empleados sin seguro secuencialmente
            verificarEmpleadosSinSeguro(jsonNominaConfianza);
        },
        error: function (xhr, status, error) {
            console.error('Error en la validación de empleados nuevos:', error);
            verificarEmpleadosSinSeguro(jsonNominaConfianza);
        }
    });
}



//PASO 3: Verificar Y agrega nuevos empleados sin seguro (se ejecuta después de agregar empleados nuevos)

function verificarEmpleadosSinSeguro(jsonNominaConfianza) {
    if (!jsonNominaConfianza || !jsonNominaConfianza.departamentos) return;

    // Recopilar todas las claves compuestas (clave-id_empresa) de empleados en la nómina actual para evitar duplicados
    let clavesNomina = new Set();
    jsonNominaConfianza.departamentos.forEach(function (departamento) {
        departamento.empleados.forEach(function (empleado) {
            clavesNomina.add(`${empleado.clave}-${empleado.id_empresa}`);
        });
    });

    // Obtener empleados sin seguro de la base de datos (Específico para Confianza)
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerEmpleadosSinSeguro' // Usamos el caso general de sin seguro para esta verificación secuencial
        },
        dataType: 'json',
        success: function (response) {
            if (response.error) {
                console.error('Error al obtener empleados:', response.error);
                return;
            }

            if (response.empleados && response.empleados.length > 0) {
                // Filtrar empleados que no están ya en la nómina usando clave compuesta
                const empleadosSinSeguroNuevos = response.empleados.filter(emp => {
                    const claveCompuesta = `${emp.clave}-${emp.id_empresa}`;
                    return !clavesNomina.has(claveCompuesta);
                });

                // Agregar empleados sin seguro al departamento correspondiente
                empleadosSinSeguroNuevos.forEach(function (empSinSeguro) {
                    const deptoDestino = jsonNominaConfianza.departamentos.find(d =>
                        parseInt(d.id_departamento) === parseInt(empSinSeguro.id_departamento)
                    );

                    if (deptoDestino) {
                        // Doble check directo en el departamento por CLAVE e ID_EMPRESA
                        const yaExiste = deptoDestino.empleados.some(e => String(e.clave) === String(empSinSeguro.clave) && e.id_empresa == empSinSeguro.id_empresa);
                        if (yaExiste) return;

                        const nuevoEmpleado = {
                            clave: empSinSeguro.clave,
                            nombre: empSinSeguro.nombre,
                            id_empresa: empSinSeguro.id_empresa,
                            id_departamento: empSinSeguro.id_departamento,
                            biometrico: empSinSeguro.biometrico,
                            salario_semanal: empSinSeguro.salario_semanal,
                            horario_oficial: empSinSeguro.horario_oficial,
                            seguroSocial: false
                        };

                        deptoDestino.empleados.push(nuevoEmpleado);
                    }
                });

                asignarPropiedadesEmpleado(jsonNominaConfianza);
                ordenarEmpleadosPorNombre(jsonNominaConfianza);
                actualizarCabeceraNomina(jsonNominaConfianza);
                initComponents();
                //actualizarCabeceraNomina(jsonNominaConfianza);
                // Aplicar filtros iniciales (esto mostrará la tabla automáticamente)
                if (typeof aplicarFiltrosConfianza === 'function') {
                    aplicarFiltrosConfianza();
                }
                console.log(jsonNominaConfianza);

            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener empleados sin seguro:', error);
        }
    });
}




// FUNCIONES AUXILIARES

// Función para asignar propiedades necesarias a empleados de departamentos específicos

function asignarPropiedadesEmpleado(jsonNominaConfianza) {
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    // Recorrer todos los departamentos
    jsonNominaConfianza.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;


        // Recorrer todos los empleados de cada departamento
        departamento.empleados.forEach(empleado => {


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

// Función para fusionar dos objetos de nómina
function unirJsonListaRaya(json1, json2) {
    // Validar consistencia de semana
    if (json1.numero_semana !== json2.numero_semana) {
        Swal.fire('Error', 'Los archivos corresponden a diferentes semanas comerciales.', 'error');
        return null;
    }

    // Clonar json1 como base
    let fusion = JSON.parse(JSON.stringify(json1));

    // Recorrer departamentos de json2
    json2.departamentos.forEach(depto2 => {
        let deptoDestino = fusion.departamentos.find(d => d.nombre.trim().toLowerCase() === depto2.nombre.trim().toLowerCase());

        if (deptoDestino) {
            // Unir empleados al departamento existente
            deptoDestino.empleados = deptoDestino.empleados.concat(depto2.empleados);
        } else {
            // Agregar nuevo departamento
            fusion.departamentos.push(depto2);
        }
    });

    return fusion;
}

