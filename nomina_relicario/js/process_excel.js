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
    $('#btn_procesar_nomina_relicario').on('click', function (e) {
        e.preventDefault();

        var $form = $('#form_excel_raya');
        var form = $form[0];

        // 1. Enviar el primer archivo Excel (Lista de Raya)
        var formData1 = new FormData();
        if (!form.archivo_excel_lista_raya_relicario || form.archivo_excel_lista_raya_relicario.files.length === 0) {
            alert('Selecciona el archivo Lista de Raya.');
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
                    validarExistenciaNomina(numeroSemana, anio).then(function (existe) {

                        // Verificar si se subió el archivo biométrico (opcional)
                        const hayBiometrico = form.archivo_excel_biometrico_relicario && form.archivo_excel_biometrico_relicario.files.length > 0;

                        if (existe) {
                            // Obtener la nómina real desde el servidor
                            getNominaRelicario(numeroSemana, anio).then(function (nomina) {
                                jsonNominaRelicario = nomina;
                                validarExistenciaTrabajadorBD(jsonNominaRelicario, JsonListaRaya);


                                $('#btn_procesar_nomina_relicario').removeClass('loading').prop('disabled', false);
                            }).catch(function (err) {
                                console.error('Error al obtener nómina desde servidor:', err);
                                $('#btn_procesar_nomina_relicario').removeClass('loading').prop('disabled', false);
                            });
                        } else {

                            if (hayBiometrico) {
                                // Si hay biométrico, validar existencia pero omitir agregar empleados sin seguro por ahora
                                validarExistenciaTrabajador(JsonListaRaya, true);
                                procesarBiometrico(form, JsonListaRaya);
                                //console.log(jsonNominaRelicario);

                            } else {
                                // Si no hay biométrico, validar existencia y sí agregar empleados sin seguro
                                validarExistenciaTrabajador(JsonListaRaya, false);
                                // aplicar cambios 
                                $('#btn_procesar_nomina_relicario').removeClass('loading').prop('disabled', false);

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
                                emp.salario_semanal = empBD.salario_semanal;
                                emp.salario_diario = empBD.salario_diario;
                                emp.id_empresa = empBD.id_empresa;
                                emp.id_departamento = empBD.id_departamento;
                                emp.id_puestoEspecial = empBD.id_puestoEspecial;
                                emp.biometrico = empBD.biometrico;
                                emp.seguroSocial = true;
                                
                                // Agregar horario_oficial para empleados del departamento 6 (incluso si está vacío)
                                if (empBD.id_departamento == 6) {
                                    emp.horario_oficial = empBD.horario_oficial || null;
                                }
                            }
                            return true;
                        }
                        return false;
                    });
                });


                if (!omitirSinSeguro) {


                    // Obtener empleados sin seguro y unirlos al JSON
                    obtenerJornalerosCoordinadores(JsonListaRaya);
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

// PASO 2: Función para obtener empleados jornaleros Base, De Apoyo y Vivero  y coordinadores Ranchos y Viveros(sin seguro)
function obtenerJornalerosCoordinadores(JsonListaRaya) {
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerJornalerosCoordinadores'
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
                    
                    // Agregar horario_oficial para empleados del departamento 6 (incluso si está vacío)
                    if (empleadoBD.id_departamento == 6) {
                        empleado.horario_oficial = empleadoBD.horario_oficial || null;
                    }

                    // Determinar a qué departamento agregar
                    let nombreDpto = null;
                    if (empleadoBD.id_departamento == 6) {
                        nombreDpto = '6 Rancho El Relicario Coordinadores';
                    } else if (empleadoBD.id_departamento == 7) {
                        nombreDpto = '7 Rancho el Relicario Jornaleros';
                    }

                    // Si se determina un departamento válido, agregar el empleado
                    if (nombreDpto && JsonListaRaya && JsonListaRaya.departamentos) {
                        const dpto = JsonListaRaya.departamentos.find(d => d.nombre === nombreDpto);
                        if (dpto) {
                            // Evitar duplicados
                            const yaExiste = dpto.empleados.some(e => e.clave === empleado.clave);
                            if (!yaExiste) {
                                dpto.empleados.push(empleado);
                            }
                        }
                    }


                });

                asignarPropiedadesEmpleado(JsonListaRaya);
                ordenarEmpleadosPorNombre(JsonListaRaya);
                jsonNominaRelicario = JsonListaRaya;
                initComponents();
                // Filtrar empleados con id_tipo_puesto 1
                let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, 7);
                         
                mostrarDatosTabla(jsonFiltrado, 1);
                console.log(jsonNominaRelicario);

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
function procesarBiometrico(form, JsonListaRaya) {
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

                jsonNominaRelicario = unirJson(JsonListaRaya, JsonBiometrico);
                const empleadosNoUnidos = obtenerEmpleadosNoUnidos(JsonListaRaya, JsonBiometrico);
                // Validar empleados sin IMSS solo si hay empleados no unidos
                if (empleadosNoUnidos && empleadosNoUnidos.length > 0) {
                    obtenerEmpleadosSinSeguroBiometrico(empleadosNoUnidos);
                    console.log(empleadosNoUnidos);

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
            console.log('Empleados sin seguro del biometrico:', response);

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
                    
                    // Agregar horario_oficial para empleados del departamento 6 (incluso si está vacío)
                    if (empleadoBD.id_departamento == 6) {
                        empleado.horario_oficial = empleadoBD.horario_oficial || null;
                    }

                    // Determinar a qué departamento agregar
                    let nombreDpto = null;
                    if (empleadoBD.id_departamento == 6) {
                        nombreDpto = '6 Rancho El Relicario Coordinadores';
                    } else if (empleadoBD.id_departamento == 7) {
                        nombreDpto = '7 Rancho el Relicario Jornaleros';
                    }

                    // Si se determina un departamento válido, agregar el empleado
                    if (nombreDpto && jsonNominaRelicario && jsonNominaRelicario.departamentos) {
                        const dpto = jsonNominaRelicario.departamentos.find(d => d.nombre === nombreDpto);
                        if (dpto) {
                            // Evitar duplicados
                            const yaExiste = dpto.empleados.some(e => e.clave === empleado.clave);
                            if (!yaExiste) {
                                dpto.empleados.push(empleado);
                            }
                        }
                    }
                });
                asignarPropiedadesEmpleado(jsonNominaRelicario);
                ordenarEmpleadosPorNombre(jsonNominaRelicario);
                initComponents();
                // Filtrar empleados con id_tipo_puesto 1
                let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, 7);
                mostrarDatosTabla(jsonFiltrado, 1);
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


// PASO 1: Validar existencia de trabajadores en la BD (se ejecuta al inicio del proceso) 
function validarExistenciaTrabajadorBD(jsonNominaRelicario, JsonListaRaya) {
    // Array para almacenar todas las claves de empleados
    var clavesEmpleados = [];

    // Recorrer todos los departamentos
    jsonNominaRelicario.departamentos.forEach(function (departamento) {
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
                jsonNominaRelicario.departamentos.forEach(function (departamento) {
                    departamento.empleados = departamento.empleados.filter(function (empleado) {
                        return clavesExistentes.includes(String(empleado.clave));
                    });
                });

                // Quitar departamentos vacíos
                jsonNominaRelicario.departamentos = jsonNominaRelicario.departamentos.filter(function (departamento) {
                    return departamento.empleados.length > 0;
                });



                // Agregar empleados nuevos del archivo Excel
                agregarEmpleadosNuevos(jsonNominaRelicario, JsonListaRaya);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al verificar empleados:', error);
            console.error('Respuesta del servidor:', xhr.responseText);
        }
    });
}

// PASO 2: Agregar empleados nuevos al jsonNominaRelicario (se ejecuta después de validar existencia en la BD) 
// Esta funcion recibe el jsonNominaRelicario actualizado y el JsonListaRaya para identificar nuevos empleados
function agregarEmpleadosNuevos(jsonNominaRelicario, JsonListaRaya) {
    let empleadosNuevos = [];

    // Recopilar todas las claves de empleados guardados
    let clavesGuardadas = new Set();
    jsonNominaRelicario.departamentos.forEach(function (departamento) {
        departamento.empleados.forEach(function (empleado) {
            clavesGuardadas.add(String(empleado.clave));
        });
    });

    // Buscar empleados nuevos en el archivo Excel
    JsonListaRaya.departamentos.forEach(function (deptoNuevo) {
        deptoNuevo.empleados.forEach(function (empleadoNuevo) {
            if (!clavesGuardadas.has(String(empleadoNuevo.clave))) {
                // Este es un empleado nuevo
                empleadosNuevos.push({
                    empleado: empleadoNuevo,
                    departamento_origen: deptoNuevo.nombre
                });
            }
        });
    });

    if (empleadosNuevos.length > 0) {
        // Extraer las claves de empleados nuevos para validar
        const clavesNuevas = empleadosNuevos.map(item => item.empleado.clave);

        // Validar empleados nuevos contra la base de datos
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
                    // Agregar empleados válidos a sus respectivos departamentos
                    response.existentes.forEach(function (empValido) {
                        // Encontrar el empleado nuevo completo
                        const empleadoEncontrado = empleadosNuevos.find(item =>
                            String(item.empleado.clave) === String(empValido.clave)
                        );

                        if (empleadoEncontrado) {
                            // Actualizar nombre con datos de BD
                            empleadoEncontrado.empleado.nombre = empValido.nombre;
                            empleadoEncontrado.empleado.id_empresa = empValido.id_empresa;
                            empleadoEncontrado.empleado.id_departamento = empValido.id_departamento;
                            empleadoEncontrado.empleado.id_puestoEspecial = empValido.id_puestoEspecial;
                            empleadoEncontrado.empleado.biometrico = empValido.biometrico;
                            empleadoEncontrado.empleado.seguroSocial = true;
                            
                            // Agregar horario_oficial para empleados del departamento 6 (incluso si está vacío)
                            if (empValido.id_departamento == 6) {
                                empleadoEncontrado.empleado.horario_oficial = empValido.horario_oficial || null;
                            }

                            // Buscar o crear departamento destino
                            let deptoDestino = jsonNominaRelicario.departamentos.find(
                                depto => depto.nombre === empleadoEncontrado.departamento_origen
                            );

                            if (!deptoDestino) {
                                // Crear departamento si no existe
                                deptoDestino = {
                                    nombre: empleadoEncontrado.departamento_origen,
                                    empleados: []
                                };
                                jsonNominaRelicario.departamentos.push(deptoDestino);
                            }

                            // Agregar empleado al departamento
                            deptoDestino.empleados.push(empleadoEncontrado.empleado);
                        }
                    });

                }
            },
            error: function (xhr, status, error) {
                console.error('Error al validar empleados nuevos:', error);
            }
        });
    }


    // DESPUÉS de agregar empleados nuevos, verificar empleados sin seguro
    verificarEmpleadosSinSeguro(jsonNominaRelicario);
}

//PASO 3: Verificar Y agrega nuevos empleados sin seguro (se ejecuta después de agregar empleados nuevos)
function verificarEmpleadosSinSeguro(jsonNominaRelicario) {
    // Recopilar todas las claves de empleados en la nómina actual (que representa la lista de raya)
    let clavesNomina = new Set();
    jsonNominaRelicario.departamentos.forEach(function (departamento) {

        departamento.empleados.forEach(function (empleado) {
            clavesNomina.add(String(empleado.clave));
        });
    });

    // Obtener empleados sin seguro de la base de datos
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerJornalerosCoordinadores'
        },
        dataType: 'json',
        success: function (response) {
            if (response.empleados && response.empleados.length > 0) {
                // Filtrar empleados sin seguro que no están en la nómina actual
                const empleadosSinSeguro = response.empleados.filter(emp => {
                    return !clavesNomina.has(String(emp.clave));
                });


                // Agregar empleados sin seguro al departamento
                empleadosSinSeguro.forEach(function (empSinSeguro) {
                    const empleado = {
                        clave: empSinSeguro.clave,
                        nombre: empSinSeguro.nombre + ' ' + empSinSeguro.ap_paterno + ' ' + empSinSeguro.ap_materno,
                        id_empresa: empSinSeguro.id_empresa,
                        id_departamento: empSinSeguro.id_departamento,
                        id_puestoEspecial: empSinSeguro.id_puestoEspecial,
                        biometrico: empSinSeguro.biometrico,
                        seguroSocial: false,
                    };
                    
                    // Agregar horario_oficial para empleados del departamento 6 (incluso si está vacío)
                    if (empleado.id_departamento == 6) {
                        empleado.horario_oficial = empSinSeguro.horario_oficial || null;
                    }

                    // Determinar a qué departamento agregar
                    let nombreDpto = null;
                    if (empleado.id_departamento == 6) {
                        nombreDpto = '6 Rancho El Relicario Coordinadores';
                    } else if (empleado.id_departamento == 7) {
                        nombreDpto = '7 Rancho el Relicario Jornaleros';
                    }

                    // Si se determina un departamento válido, agregar el empleado
                    if (nombreDpto && jsonNominaRelicario && jsonNominaRelicario.departamentos) {
                        const dpto = jsonNominaRelicario.departamentos.find(d => d.nombre === nombreDpto);
                        if (dpto) {
                            // Evitar duplicados
                            const yaExiste = dpto.empleados.some(e => e.clave === empleado.clave);
                            if (!yaExiste) {
                                dpto.empleados.push(empleado);
                            }
                        }
                    }
                });

                asignarPropiedadesEmpleado(jsonNominaRelicario);
                ordenarEmpleadosPorNombre(jsonNominaRelicario);
                
                initComponents();
                
                // Filtrar empleados con id_tipo_puesto 1
                let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, 7);

                mostrarDatosTabla(jsonFiltrado, 1);
                console.log(jsonNominaRelicario);

            }
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



        // Recorrer todos los empleados de cada departamento
        departamento.empleados.forEach(empleado => {
            // Convertir id_puestoEspecial a número para comparaciones
            const idPuesto = parseInt(empleado.id_puestoEspecial) || null;
            const idDepto = parseInt(empleado.id_departamento);

            /*
            FLUJO DE ASIGNACIÓN DE TIPO PUESTO:
            
            Si el empleado está en el departamento 6 (Coordinadores):
              - Si tiene puesto 40 → Es Coordinador Vivero (id_tipo_puesto = 5)
              - Si tiene cualquier otro puesto → Es Coordinador Rancho (id_tipo_puesto = 4)
            
            Si el empleado está en el departamento 7 (Jornaleros):
              - Si tiene puesto 10 o 11 → Es Jornalero Base (id_tipo_puesto = 1)
              - Si tiene puesto 38 → Es Jornalero Vivero (id_tipo_puesto = 2)
              - Si tiene puesto 37 o 39 → Es Jornalero de Apoyo (id_tipo_puesto = 3)
              - Si no tiene puesto asignado (null) → Por defecto es Jornalero Base (id_tipo_puesto = 1)
            */

            // Mapear id_puestoEspecial a id_tipo_jornalero según departamento
            if (idDepto === 6) {
                // Departamento: Coordinadores
                empleado.id_tipo_puesto = (idPuesto === 40) ? 5 : 4;
            } else if (idDepto === 7) {
                // Departamento: Jornaleros
                if ([10, 11].includes(idPuesto)) {
                    empleado.id_tipo_puesto = 1; // Jornalero Base
                } else if (idPuesto === 38) {
                    empleado.id_tipo_puesto = 2; // Jornalero Vivero
                } else if ([37, 39].includes(idPuesto)) {
                    empleado.id_tipo_puesto = 3; // Jornalero de Apoyo
                } else if (idPuesto === null) {
                    empleado.id_tipo_puesto = 1; // Jornalero Base (por defecto)
                }
            }

            // Asignar propiedad pasaje para jornaleros base y vivero
            if ([1, 2].includes(empleado.id_tipo_puesto)) {
                empleado.pasaje = empleado.pasaje ?? 0;
            }

            // Inicializar registros como array vacío si no existen
            if (!empleado.registros || !Array.isArray(empleado.registros)) {
                empleado.registros = [];
            }

            // Agregar o mantener las propiedades necesarias (no sobrescribir si ya vienen de la BD)
       
            empleado.vacaciones = empleado.vacaciones ?? 0;
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
            }

            // Agregar propiedad mostrar (para filtrar en tabla)
            if (empleado.mostrar === undefined) {
                empleado.mostrar = true;
            }


        });
    });
}

// Función para ordenar empleados por nombre dentro de cada departamento
function ordenarEmpleadosPorNombre(jsonOrdenado) {
    jsonOrdenado.departamentos.forEach(function (departamento) {
        departamento.empleados.sort(function (a, b) {
            return a.nombre.localeCompare(b.nombre);
        });
    });

}

function inicializarRegistrosVacios(jsonNominaRelicario) {
    if (!jsonNominaRelicario || !Array.isArray(jsonNominaRelicario.departamentos)) return;

    jsonNominaRelicario.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            // Inicializar registros como array vacío si no existen
            if (!empleado.registros || !Array.isArray(empleado.registros)) {
                empleado.registros = [];
            }
        });
    });
}






