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

    // Activar funciones de uniformes
    try { if (typeof agregarFolioUniforme === 'function') agregarFolioUniforme(); } catch (e) { }
    try { if (typeof gestionarBotonUniformes === 'function') gestionarBotonUniformes(); } catch (e) { }

    // Activar funciones de permisos
    try { if (typeof agregarPermiso === 'function') agregarPermiso(); } catch (e) { }
    try { if (typeof gestionarBotonPermisos === 'function') gestionarBotonPermisos(); } catch (e) { }

    //Guardar y limpiar nómina de confianza
    saveAndClearNominaConfianza();

    // Activar botones de recálculo
    activarBotonesRecalculo();
    activarInputsValidadores();
    calcularSueldoACobrar();

    aplicarActualizarRegistrosBiometricos();

    abrirModal();
});

// Función para actualizar la cabecera de la nómina
function actualizarCabeceraNomina(json) {
    if (!json) return;

    // Función para obtener el nombre del mes en español
    function mesEnLetras(mes) {
        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        return meses[mes - 1];
    }

    // Extraer día, mes y año de las fechas
    function descomponerFecha(fecha) {
        // Verificar que la fecha no sea null o undefined
        if (!fecha) {
            return { dia: '', mes: '', anio: '' };
        }

        // Ejemplo: "21/Jun/2025" o "21/05/2025"
        const partes = fecha.split('/');
        let dia = partes[0] || '';
        let mes = partes[1] || '';
        let anio = partes[2] || '';

        // Si el mes es numérico, conviértelo a nombre
        if (/^\d+$/.test(mes)) {
            mes = mesEnLetras(parseInt(mes, 10));
        } else {
            // Si el mes es abreviado (Jun), conviértelo a nombre completo
            const mesesAbrev = {
                'Ene': 'Enero', 'Feb': 'Febrero', 'Mar': 'Marzo', 'Abr': 'Abril', 'May': 'Mayo', 'Jun': 'Junio',
                'Jul': 'Julio', 'Ago': 'Agosto', 'Sep': 'Septiembre', 'Oct': 'Octubre', 'Nov': 'Noviembre', 'Dic': 'Diciembre'
            };
            mes = mesesAbrev[mes] || mes;
        }
        return { dia, mes, anio };
    }

    // Verificar que las fechas existan antes de procesarlas
    if (!json.fecha_inicio || !json.fecha_cierre) {
        $('#nombre_nomina').text('NÓMINA');
        $('#num_semana').text(`SEM ${json.numero_semana || ''}`);
        return;
    }

    const ini = descomponerFecha(json.fecha_inicio);
    const fin = descomponerFecha(json.fecha_cierre);

    let nombreNomina = '';
    if (ini.anio === fin.anio) {
        if (ini.mes === fin.mes) {
            // Mismo mes y año
            nombreNomina = `NÓMINA DEL ${ini.dia} AL ${fin.dia} DE ${fin.mes.toUpperCase()} DEL ${fin.anio}`;
        } else {
            // Mismo año, diferente mes
            nombreNomina = `NÓMINA DEL ${ini.dia} ${ini.mes.toUpperCase()} AL ${fin.dia} DE ${fin.mes.toUpperCase()} DEL ${fin.anio}`;
        }
    } else {
        // Diferente año
        nombreNomina = `NÓMINA DEL ${ini.dia} ${ini.mes.toUpperCase()} DEL ${ini.anio} AL ${fin.dia} DE ${fin.mes.toUpperCase()} DEL ${fin.anio}`;
    }

    $('#nombre_nomina').text(nombreNomina);
    $('#num_semana').text(`SEM ${json.numero_semana}`);
}


// PASO 0: Inicializar componentes y verificar si hay nómina guardada
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

                    // 2. Verificar si se subió el archivo biométrico (opcional)
                    const hayBiometrico = form.archivo_excel2 && form.archivo_excel2.files.length > 0;

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

                    console.log(`Buscando nómina guardada: Semana ${numeroSemana}, Año ${anio}`);
                    console.log(`Fechas: ${JsonListaRaya.fecha_inicio} - ${JsonListaRaya.fecha_cierre}`);

                    obtenerNominaConfianzaPorSemana(
                        numeroSemana,
                        anio,
                        // onEncontrada: Nómina existe
                        (nominaGuardada) => {
                            // Existe en BD: usar esa nómina y validar empleados
                            jsonNominaConfianza = nominaGuardada;

                            // Actualizar fechas con las del nuevo archivo
                            jsonNominaConfianza.fecha_inicio = JsonListaRaya.fecha_inicio;
                            jsonNominaConfianza.fecha_cierre = JsonListaRaya.fecha_cierre;
                            jsonNominaConfianza.numero_semana = JsonListaRaya.numero_semana;

                            // Validar empleados existentes y detectar nuevos
                            validarEmpleadosGuardados(JsonListaRaya, () => {
                                setInitialVisibility();
                                obtenerDepartamentosPermitidos();
                                mostrarDatosTabla(jsonNominaConfianza);

                                actualizarCabeceraNomina(jsonNominaConfianza);

                                $('#btn_procesar_archivos').removeClass('loading').prop('disabled', false);
                            });
                        },
                        // onNoEncontrada: No existe nómina
                        () => {
                            // No existe en BD: continuar flujo normal
                            validarExistenciaTrabajador(JsonListaRaya, (JsonListaRayaValidado) => {
                                if (!hayBiometrico) {
                                    // No se subió archivo biométrico: continuar sin registros
                                    jsonNominaConfianza = JsonListaRayaValidado;
                                    inicializarRegistrosVacios(jsonNominaConfianza);
                                    asignarPropiedadesEmpleado(jsonNominaConfianza);
                                    obtenerEmpleadosSinImssDesdeBD(JsonListaRayaValidado, () => {
                                        if (typeof detectarEventosAutomaticos === 'function') {
                                            detectarEventosAutomaticos(jsonNominaConfianza);
                                        }
                                        setInitialVisibility();
                                        obtenerDepartamentosPermitidos();
                                        mostrarDatosTabla(jsonNominaConfianza);
                                        saveNomina(jsonNominaConfianza);
                                        actualizarCabeceraNomina(jsonNominaConfianza);
                                        $('#btn_procesar_archivos').removeClass('loading').prop('disabled', false);
                                    });
                                } else {
                                    procesarBiometrico(JsonListaRayaValidado, form);
                                }
                            });
                        },
                        // onError: Error en la consulta
                        (errorMsg) => {

                        }
                    );

                } catch (e) {

                }
            },

        });
    });
}


// Función encargada de procesar el archivo biométrico subido por el usuario. 
// Combina los datos del biométrico con la lista de raya y realiza validaciones adicionales.
function procesarBiometrico(JsonListaRayaValidado, form) {
    var formData2 = new FormData();
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

                // Unir los dos JSON
                jsonNominaConfianza = unirJson(JsonListaRayaValidado, JsonBiometrico);

                // Asegurar que todos los empleados ya existentes tengan las propiedades necesarias
                asignarPropiedadesEmpleado(jsonNominaConfianza);

                // Ejecutar detección automática de eventos para todos los empleados
                if (typeof detectarEventosAutomaticos === 'function') {
                    detectarEventosAutomaticos(jsonNominaConfianza);
                }

                // Obtener empleados que no se unieron
                const empleadosNoUnidos = obtenerEmpleadosNoUnidos(JsonListaRayaValidado, JsonBiometrico);

                // Validar empleados sin IMSS solo si hay empleados no unidos
                if (empleadosNoUnidos && empleadosNoUnidos.length > 0) {
                    validarExistenciaTrabajadorSinImms(empleadosNoUnidos);
                }

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
        error: function () {
        }
    });
}

// PASO 2: Función para validar la existencia de trabajadores en la base de datos
// Ahora acepta un callback que se ejecuta cuando termina la validación
function validarExistenciaTrabajador(JsonListaRaya, callback) {
    // Extraer todas las claves de todos los empleados de todos los departamentos
    const claves = [];

    JsonListaRaya.departamentos.forEach(departamento => {
        departamento.empleados.forEach(empleado => {
            claves.push(empleado.clave);
        });
    });

    // Si no hay claves, ejecutar callback inmediatamente
    if (claves.length === 0) {
        if (typeof callback === 'function') {
            callback(JsonListaRaya);
        }
        return;
    }

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

            // Crear un mapa de claves válidas para búsqueda rápida (guardamos nombre, salario, id_empleado y horario)
            const mapaEmpleados = {};
            empleadosValidos.forEach(emp => {
                // Parsear horario_oficial si viene como string JSON
                let horarioParsed = null;
                if (emp.horario_oficial) {
                    try {
                        horarioParsed = typeof emp.horario_oficial === 'string'
                            ? JSON.parse(emp.horario_oficial)
                            : emp.horario_oficial;
                    } catch (e) {

                        horarioParsed = null;
                    }
                }

                mapaEmpleados[emp.clave] = {
                    id_empleado: emp.id_empleado,
                    nombre: emp.nombre,
                    salario: parseFloat(emp.salario_semanal) || 0,
                    salario_diario: parseFloat(emp.salario_diario) || 0,
                    id_empresa: emp.id_empresa || null,
                    horario_oficial: horarioParsed
                };
            });

            // Filtrar y actualizar empleados
            JsonListaRaya.departamentos.forEach(departamento => {
                // Filtrar solo empleados válidos
                departamento.empleados = departamento.empleados.filter(empleado => {
                    const clave = String(empleado.clave).trim();
                    if (mapaEmpleados[clave]) {
                        // Guardar valores actuales en propiedades copia antes de sobrescribir
                        empleado.tarjeta_copia = empleado.tarjeta || null;
                        empleado.conceptos_copia = empleado.conceptos ? JSON.parse(JSON.stringify(empleado.conceptos)) : null;

                        // Actualizar el nombre, sueldo semanal, id_empleado, id_empresa y horario con los datos de la base
                        empleado.id_empleado = mapaEmpleados[clave].id_empleado;
                        empleado.nombre = mapaEmpleados[clave].nombre;
                        empleado.sueldo_semanal = mapaEmpleados[clave].salario;
                        empleado.sueldo_diario = mapaEmpleados[clave].salario_diario;
                        empleado.id_empresa = mapaEmpleados[clave].id_empresa;
                        empleado.horario_oficial = mapaEmpleados[clave].horario_oficial;

                        return true;
                    }
                    return false;
                });

                // Ordenar alfabéticamente por nombre
                departamento.empleados.sort((a, b) => {
                    return a.nombre.localeCompare(b.nombre);
                });
            });

            // Ejecutar callback con los datos validados
            if (typeof callback === 'function') {
                callback(JsonListaRaya);
            }
        },
        error: function (xhr, status, error) {
            // En caso de error, ejecutar callback con los datos originales
            if (typeof callback === 'function') {
                callback(JsonListaRaya);
            }
        }
    });
}

// PASO 3: Unir datos de Lista de Raya con registros del Biométrico por nombre de empleado
function unirJson(json1, json2) {
    // Si json2 no existe o no tiene empleados, retornar json1 con registros vacíos
    if (!json2 || !json2.empleados || json2.empleados.length === 0) {
        inicializarRegistrosVacios(json1);
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

// PASO 4: Identificar empleados del biométrico que NO están en la Lista de Raya (empleados sin IMSS)
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

// PASO 4B: Obtener empleados sin IMSS directamente de la BD cuando NO se sube biométrico
// (solo cuando se procesa únicamente Lista de Raya)
function obtenerEmpleadosSinImssDesdeBD(JsonListaRayaValidado, callback) {
    // Extraer todas las claves de los empleados que ya están en la lista de raya
    const clavesExcluidas = [];

    if (JsonListaRayaValidado && JsonListaRayaValidado.departamentos) {
        JsonListaRayaValidado.departamentos.forEach(departamento => {
            if (departamento.empleados) {
                departamento.empleados.forEach(empleado => {
                    if (empleado.clave) {
                        clavesExcluidas.push(String(empleado.clave).trim());
                    }
                });
            }
        });
    }

    // Enviar al servidor para obtener todos los empleados sin IMSS
    // excluyendo los que ya están en la lista de raya
    $.ajax({
        url: '../php/trabajadores_sin_imss.php',
        type: 'POST',
        data: JSON.stringify({
            biometricos: [], // Array vacío para indicar que queremos todos
            claves_excluidas: clavesExcluidas
        }),
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        success: function (response) {
            // response contiene todos los empleados sin IMSS que no están en la lista de raya
            if (!response || !Array.isArray(response) || response.length === 0) {
                // No hay empleados sin IMSS adicionales
                if (typeof callback === 'function') {
                    callback();
                }
                return;
            }

            // Convertir los empleados de la BD al formato esperado
            const empleadosFormateados = response.map(emp => {
                const partes = [emp.nombre, emp.ap_paterno, emp.ap_materno].filter(Boolean);
                const nombreCompleto = partes.length ? partes.join(' ').trim() : '';

                return {
                    clave: emp.clave_empleado,
                    nombre: nombreCompleto,
                    id_biometrico: emp.biometrico || null,
                    registros: [], // Sin registros porque no hay biométrico
                    sueldo_semanal: parseFloat(emp.salario_semanal) || 0,
                    sueldo_diario: parseFloat(emp.salario_diario) || 0,
                    id_departamento: Number(emp.id_departamento) || 0,
                    id_empresa: emp.id_empresa || null
                };
            });

            // Ordenar alfabéticamente A-Z por nombre
            empleadosFormateados.sort((a, b) => {
                return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' });
            });

            // Integrar empleados sin IMSS al JSON principal
            integrarNuevaInformacion(empleadosFormateados);

            // Ejecutar callback cuando termine
            if (typeof callback === 'function') {
                callback();
            }
        },
        error: function (xhr, status, error) {
            // En caso de error, continuar sin empleados sin IMSS adicionales
            if (typeof callback === 'function') {
                callback();
            }
        }
    });
}

// PASO 5: Validar en BD los empleados sin IMSS encontrados en el biométrico (de PASO 4)
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
                    // Asignar sueldo diario desde la BD si viene
                    if (resultado.salario_diario !== undefined) {
                        emp.sueldo_diario = parseFloat(resultado.salario_diario) || 0;
                    }
                    // Asignar id_departamento desde la BD si viene
                    if (resultado.id_departamento !== undefined) {
                        emp.id_departamento = Number(resultado.id_departamento) || emp.id_departamento || 0;
                    }
                    // Asignar id_empresa desde la BD si viene
                    if (resultado.id_empresa !== undefined) {
                        emp.id_empresa = resultado.id_empresa || null;
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

// PASO 6: Integrar empleados sin IMSS validados al departamento "sin seguro" en la nómina
function integrarNuevaInformacion(empleadosValidados) {
    // Si no hay empleados validados, no hacer nada
    if (!empleadosValidados || empleadosValidados.length === 0) {
        return;
    }

    // Agregar el departamento al JSON principal
    if (!jsonNominaConfianza.departamentos) {
        jsonNominaConfianza.departamentos = [];
    }

    // Verificar si ya existe el departamento "sin seguro"
    let departamentoSinSeguro = jsonNominaConfianza.departamentos.find(
        dept => dept.nombre && dept.nombre.toLowerCase() === "sin seguro"
    );

    if (departamentoSinSeguro) {
        // Si ya existe, agregar los empleados al departamento existente
        if (!departamentoSinSeguro.empleados) {
            departamentoSinSeguro.empleados = [];
        }
        departamentoSinSeguro.empleados = departamentoSinSeguro.empleados.concat(empleadosValidados);

        // Eliminar duplicados por clave
        const clavesVistas = new Set();
        departamentoSinSeguro.empleados = departamentoSinSeguro.empleados.filter(emp => {
            const clave = String(emp.clave || '').trim();
            if (clave && !clavesVistas.has(clave)) {
                clavesVistas.add(clave);
                return true;
            }
            return false;
        });
    } else {
        // Si no existe, crear el departamento "sin seguro"
        departamentoSinSeguro = {
            nombre: "sin seguro",
            empleados: empleadosValidados
        };
        jsonNominaConfianza.departamentos.push(departamentoSinSeguro);
    }

    // Asignar propiedades a todos los empleados (incluyendo el nuevo departamento)
    asignarPropiedadesEmpleado(jsonNominaConfianza);

    // NO ejecutar detección aquí porque ya se ejecutó en el proceso principal
    // para evitar duplicación de eventos

    // Guardar después de integrar nueva información asíncrona
    try {
        saveNomina(jsonNominaConfianza);
    } catch (err) {

    }


}

// PASO 6B: Inicializar registros vacíos para todos los empleados (cuando NO hay biométrico)
function inicializarRegistrosVacios(jsonNominaConfianza) {
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    jsonNominaConfianza.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            // Inicializar registros como array vacío si no existen
            if (!empleado.registros || !Array.isArray(empleado.registros)) {
                empleado.registros = [];
            }
        });
    });
}

// PASO 7: Asignar propiedades iniciales a cada empleado (sueldo, retardos, inasistencias, etc.)
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
        else if (nombreLower === 'administracion sucursal cdmx') mappedId = 9;

        // Recorrer todos los empleados de cada departamento
        departamento.empleados.forEach(empleado => {
            // Inicializar registros como array vacío si no existen
            if (!empleado.registros || !Array.isArray(empleado.registros)) {
                empleado.registros = [];
            }

            // Agregar o mantener las propiedades necesarias (no sobrescribir si ya vienen de la BD)
            empleado.sueldo_semanal = empleado.sueldo_semanal ?? 0;
            empleado.vacaciones = empleado.vacaciones ?? 0;
            empleado.sueldo_extra_total = empleado.sueldo_extra_total ?? 0;
            empleado.retardos = empleado.retardos ?? 0;
            empleado.prestamo = empleado.prestamo ?? 0;
            empleado.permiso = empleado.permiso ?? 0;
            empleado.inasistencia = empleado.inasistencia ?? 0;
            empleado.uniformes = empleado.uniformes ?? 0;
            empleado.checador = empleado.checador ?? 0;
            empleado.total_cobrar = empleado.total_cobrar ?? 0;
            empleado.id_empresa = empleado.id_empresa ?? null;

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

            // Si no tiene id_departamento, asignarlo desde el departamento actual (si mapeamos uno)
            if ((empleado.id_departamento === undefined || empleado.id_departamento === null) && mappedId !== null) {
                empleado.id_departamento = mappedId;
            }
        });
    });
}

// Resumen de flujo (comentario al final del archivo):
// - Al procesar ambos archivos: se llama a `processExcelData` -> `leer_lista_raya.php` ->
//   `validarExistenciaTrabajador` -> `leer_biometrico.php` -> `unirJson` -> `asignarPropiedadesEmpleado` ->
//   `detectarEventosAutomaticos` -> `mostrarDatosTabla` -> `saveNomina`.
// - Solo Lista de Raya: `processExcelData` -> `leer_lista_raya.php` -> `validarExistenciaTrabajador` ->
//   `inicializarRegistrosVacios` -> `asignarPropiedadesEmpleado` -> `mostrarDatosTabla` -> `saveNomina`.
// - Si ya existe nómina en BD: `obtenerNominaConfianzaPorSemana` carga la nómina y se muestran datos.
// - Para actualizar biométrico en una nómina guardada: usar `actualizarRegistrosBiometricos` (sube archivo),
//   `leer_biometrico.php` y `unirRegistrosBiometricos`, luego `detectarEventosAutomaticos` y `guardarNominaConfianza`.
// Fin del resumen.

// FUNCIÓN ADICIONAL 3: Validar empleados guardados cuando existe nómina en BD
function validarEmpleadosGuardados(JsonListaRaya, callback) {
    if (!jsonNominaConfianza || !jsonNominaConfianza.departamentos) {
        if (typeof callback === 'function') callback();
        return;
    }

    // Extraer todas las claves de todos los empleados actuales
    const clavesActuales = [];
    jsonNominaConfianza.departamentos.forEach(departamento => {
        if (departamento.empleados) {
            departamento.empleados.forEach(empleado => {
                if (empleado.clave) {
                    clavesActuales.push(String(empleado.clave).trim());
                }
            });
        }
    });

    if (clavesActuales.length === 0) {
        if (typeof callback === 'function') callback();
        return;
    }

    // Enviar claves al servidor para validar
    $.ajax({
        url: '../php/validar_empleados.php',
        type: 'POST',
        data: JSON.stringify({
            funcion: 'validarEmpleadosExistentes',
            claves: clavesActuales
        }),
        processData: false,
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        success: function (response) {
            const clavesValidas = Array.isArray(response) ? response : [];
            const clavesValidasSet = new Set(clavesValidas);

            // 1. ACTUALIZAR tarjeta_copia con los NUEVOS valores de la lista de raya (sin modificar tarjeta original)
            jsonNominaConfianza.departamentos.forEach(departamento => {
                if (departamento.empleados) {
                    departamento.empleados.forEach(empleado => {
                        const clave = String(empleado.clave || '').trim();

                        // Buscar el empleado en la nueva lista de raya
                        let empleadoNuevo = null;
                        if (JsonListaRaya && JsonListaRaya.departamentos) {
                            JsonListaRaya.departamentos.forEach(deptoLista => {
                                if (deptoLista.empleados) {
                                    const encontrado = deptoLista.empleados.find(emp =>
                                        String(emp.clave || '').trim() === clave
                                    );
                                    if (encontrado) {
                                        empleadoNuevo = encontrado;
                                    }
                                }
                            });
                        }

                        // Si se encontró en la nueva lista de raya, actualizar solo las propiedades _copia
                        if (empleadoNuevo) {
                            // Actualizar tarjeta_copia con el NUEVO valor del archivo
                            if (empleadoNuevo.tarjeta !== undefined && empleadoNuevo.tarjeta !== null) {
                                empleado.tarjeta_copia = empleadoNuevo.tarjeta;
                            }

                            // Actualizar conceptos_copia con los NUEVOS valores del archivo
                            if (empleadoNuevo.conceptos && Array.isArray(empleadoNuevo.conceptos)) {
                                empleado.conceptos_copia = JSON.parse(JSON.stringify(empleadoNuevo.conceptos));
                            }
                        }
                    });

                    // Filtrar empleados: solo dejar los que siguen siendo válidos
                    departamento.empleados = departamento.empleados.filter(empleado => {
                        const clave = String(empleado.clave || '').trim();
                        return clave === '' || clavesValidasSet.has(clave);
                    });
                }
            });

            // 2. Detectar nuevos empleados de la lista de raya
            if (JsonListaRaya && JsonListaRaya.departamentos) {
                const clavesExistentes = new Set(clavesActuales);
                const nuevosEmpleados = [];

                JsonListaRaya.departamentos.forEach(deptoLista => {
                    if (deptoLista.empleados) {
                        deptoLista.empleados.forEach(empLista => {
                            const clave = String(empLista.clave || '').trim();
                            // Si no está en el JSON actual, es un nuevo empleado
                            if (clave && !clavesExistentes.has(clave)) {
                                nuevosEmpleados.push({
                                    ...empLista,
                                    registros: [] // Sin registros inicialmente
                                });
                            }
                        });
                    }
                });

                // 3. Validar nuevos empleados contra la BD
                if (nuevosEmpleados.length > 0) {
                    const clavesNuevas = nuevosEmpleados.map(emp => String(emp.clave).trim());

                    $.ajax({
                        url: '../php/validar_empleados.php',
                        type: 'POST',
                        data: JSON.stringify({
                            funcion: 'obtenerInfoEmpleados',
                            claves: clavesNuevas
                        }),
                        processData: false,
                        contentType: 'application/json; charset=UTF-8',
                        dataType: 'json',
                        success: function (responseNuevos) {
                            const empleadosInfo = Array.isArray(responseNuevos) ? responseNuevos : [];
                            const mapaEmpleados = {};

                            // Crear mapa de empleados para búsqueda rápida
                            empleadosInfo.forEach(emp => {
                                // Parsear horario_oficial si viene como string JSON
                                let horarioParsed = null;
                                if (emp.horario_oficial) {
                                    try {
                                        horarioParsed = typeof emp.horario_oficial === 'string'
                                            ? JSON.parse(emp.horario_oficial)
                                            : emp.horario_oficial;
                                    } catch (e) {
                                        horarioParsed = null;
                                    }
                                }

                                mapaEmpleados[emp.clave] = {
                                    id_empleado: emp.id_empleado,
                                    nombre: emp.nombre,
                                    sueldo_semanal: parseFloat(emp.salario_semanal) || 0,
                                    sueldo_diario: parseFloat(emp.salario_diario) || 0,
                                    horario_oficial: horarioParsed
                                };
                            });

                            // Filtrar y actualizar nuevos empleados con la información completa
                            const nuevosValidos = nuevosEmpleados.filter(emp => {
                                const clave = String(emp.clave || '').trim();
                                if (mapaEmpleados[clave]) {
                                    // Actualizar el empleado con la información de la BD
                                    emp.id_empleado = mapaEmpleados[clave].id_empleado;
                                    emp.nombre = mapaEmpleados[clave].nombre;
                                    emp.sueldo_semanal = mapaEmpleados[clave].sueldo_semanal;
                                    emp.sueldo_diario = mapaEmpleados[clave].sueldo_diario;
                                    emp.horario_oficial = mapaEmpleados[clave].horario_oficial;
                                    return true;
                                }
                                return false;
                            });

                            // Agregar nuevos empleados válidos al JSON
                            if (nuevosValidos.length > 0) {
                                // Agregar al primer departamento existente o crear uno por defecto
                                let deptoDestino = jsonNominaConfianza.departamentos[0];

                                if (!deptoDestino) {
                                    // Si no hay departamentos, crear uno por defecto
                                    deptoDestino = {
                                        nombre: "general",
                                        empleados: []
                                    };
                                    jsonNominaConfianza.departamentos.push(deptoDestino);
                                }

                                if (!deptoDestino.empleados) {
                                    deptoDestino.empleados = [];
                                }

                                nuevosValidos.forEach(nuevoEmp => {
                                    deptoDestino.empleados.push(nuevoEmp);
                                });

                                // Asignar propiedades a los nuevos empleados
                                asignarPropiedadesEmpleado(jsonNominaConfianza);
                            }

                            // Guardar los cambios después de filtrar y agregar
                            try {
                                saveNomina(jsonNominaConfianza);
                            } catch (err) {

                            }

                            // Después de agregar nuevos empleados de la lista de raya,
                            // buscar también nuevos empleados sin IMSS
                            obtenerEmpleadosSinImssDesdeBD(jsonNominaConfianza, callback);
                        },
                        error: function () {
                            // Aunque haya error, buscar empleados sin IMSS
                            obtenerEmpleadosSinImssDesdeBD(jsonNominaConfianza, callback);
                        }
                    });
                } else {
                    // No hay nuevos empleados de la lista de raya,
                    // pero buscar empleados sin IMSS de todas formas
                    obtenerEmpleadosSinImssDesdeBD(jsonNominaConfianza, callback);
                }
            } else {
                // No hay JsonListaRaya, buscar empleados sin IMSS
                obtenerEmpleadosSinImssDesdeBD(jsonNominaConfianza, callback);
            }
        },
        error: function () {
            if (typeof callback === 'function') callback();
        }
    });
}