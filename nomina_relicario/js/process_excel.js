jsonNominaRelicario = null;

$(document).ready(function () {
    processExcelData();

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
                //const numeroSemana = JsonListaRaya.numero_semana;

                /*IMPORTANTE: Usar fecha_cierre para determinar el año (NO fecha_inicio)
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
                }*/



                // Verificar si se subió el archivo biométrico (opcional)
                const hayBiometrico = form.archivo_excel_biometrico_relicario && form.archivo_excel_biometrico_relicario.files.length > 0;

                if (hayBiometrico) {
                    // Si hay biométrico, validar existencia pero omitir agregar empleados sin seguro por ahora
                    // validarExistenciaTrabajador(JsonListaRaya, true);
                    // procesarBiometrico(form, JsonListaRaya);
                    //console.log(jsonNominaRelicario);

                } else {
                    // Si no hay biométrico, validar existencia y sí agregar empleados sin seguro
                    validarExistenciaTrabajador(JsonListaRaya, false);
                   

                    // aplicar cambios 
                    $('#btn_procesar_nomina_relicario').removeClass('loading').prop('disabled', false);

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
obtenerJornaleros(JsonListaRaya) se obtiene de manera general a los empleados que no tienen seguro y que son jornaleros BASE, DE APOYO Y VIVERO->
obtenerCoordinadores(JsonListaRaya) se obtiene de manera general a los empleados que no tienen seguro y que son coordinadores de ranchos y viveros->
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
                                emp.seguroSocial = true
                            }
                            return true;
                        }
                        return false;
                    });
                });


                if (!omitirSinSeguro) {


                    // Obtener empleados sin seguro y unirlos al JSON
                    obtenerJornaleros(JsonListaRaya);
                } else {
                    // Omitir obtener empleados sin seguro: asignar propiedades y finalizar
                    // asignarPropiedadesEmpleado(JsonListaRaya);
                    // jsonNomina40lbs = JsonListaRaya;
                    // ordenarEmpleadosPorApellido(JsonListaRaya);
                    // Actualizar jsonNomina40lbs y continuar con el proceso
                    //asignarPropiedadesEmpleado(JsonListaRaya);
                    //jsonNomina40lbs = JsonListaRaya;
                    //ordenarEmpleadosPorApellido(JsonListaRaya);
                    // Verificar empleados sin seguro basados en la lista de raya
                    //verificarEmpleadosSinSeguro(JsonListaRaya, JsonListaRaya);

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

// PASO 2: Función para obtener empleados jornaleros Base, De Apoyo y Vivero (sin seguro)
function obtenerJornaleros(JsonListaRaya) {
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerJornaleros'
        },
        dataType: 'json',
        success: function (response) {
            if (response.empleados && response.empleados.length > 0) {
                // Buscar el departamento existente: 7 Relicario Jornaleros
                var deptoJornaleros = JsonListaRaya.departamentos.find(function (d) {
                    return d.nombre === '7 Relicario Jornaleros';
                });

                // Convertir empleados de BD a estructura del JSON
                response.empleados.forEach(function (empleadoBD) {
                    var empleado = {
                        clave: empleadoBD.clave,
                        nombre: empleadoBD.nombre + ' ' + empleadoBD.ap_paterno + ' ' + empleadoBD.ap_materno,
                        id_empresa: empleadoBD.id_empresa,
                        id_departamento: empleadoBD.id_departamento,
                        id_puestoEspecial: empleadoBD.id_puestoEspecial,
                        seguroSocial: false
                    };


                    // Evitar duplicados por clave
                    var yaExiste = deptoJornaleros.empleados.some(function (e) {
                        return e.clave === empleado.clave;
                    });

                    //Agregar solo si no existe ya un empleado con la misma clave en el departamento

                    if (!yaExiste) {
                        deptoJornaleros.empleados.push(empleado);
                    }

                });
                obtenerCoordinadores(JsonListaRaya);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener empleados sin seguro:', error);
        }
    });
}

// PASO 3: Función para obtener empleados coordinadores Ranchos y Viveros (sin seguro)
function obtenerCoordinadores(JsonListaRaya) {
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerCoordinadores'
        },
        dataType: 'json',
        success: function (response) {
            if (response.empleados && response.empleados.length > 0) {
                // Buscar el departamento existente: 6 Relicario Coordinadores
                var deptoCoordinadores = JsonListaRaya.departamentos.find(function (d) {
                    return d.nombre === '6 Relicario Coordinadores';
                });

                // Convertir empleados de BD a estructura del JSON
                response.empleados.forEach(function (empleadoBD) {
                    var empleado = {
                        clave: empleadoBD.clave,
                        nombre: empleadoBD.nombre + ' ' + empleadoBD.ap_paterno + ' ' + empleadoBD.ap_materno,
                        id_empresa: empleadoBD.id_empresa,
                        id_departamento: empleadoBD.id_departamento,
                        id_puestoEspecial: empleadoBD.id_puestoEspecial,
                        seguroSocial: false
                    };


                    // Evitar duplicados por clave
                    var yaExiste = deptoCoordinadores.empleados.some(function (e) {
                        return e.clave === empleado.clave;
                    });

                    //Agregar solo si no existe ya un empleado con la misma clave en el departamento

                    if (!yaExiste) {
                        deptoCoordinadores.empleados.push(empleado);
                    }                
                    
                    
                    asignarPropiedadesEmpleado(JsonListaRaya);
                    ordenarEmpleadosPorNombre(JsonListaRaya);
                    jsonNominaRelicario = JsonListaRaya;
                    console.log(jsonNominaRelicario);
                    
            
                });

            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener empleados sin seguro:', error);
        }
    });
}


/*
Validacion 3: Sube Lista de Raya y la informacion se guarda en la base de datos
*/





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
            const idPuesto = parseInt(empleado.id_puestoEspecial);
            
            // Mapear id_puestoEspecial a id_tipo_jornalero
            if ([10, 11].includes(idPuesto)) {
                empleado.id_tipo_jornalero = 1; // Jornalero Base
            } else if (idPuesto === 38) {
                empleado.id_tipo_jornalero = 2; // Jornalero Vivero
            } else if ([37, 39].includes(idPuesto)) {
                empleado.id_tipo_jornalero = 3; // Jornalero de Apoyo
            } else if (idPuesto === 40) {
                empleado.id_tipo_jornalero = 5; // Coordinador Vivero
            } else {
                empleado.id_tipo_jornalero = 4; // Coordinador Rancho
            }

            // Asignar propiedad pasaje para jornaleros base y vivero
            if ([1, 2].includes(empleado.id_tipo_jornalero)) {
                empleado.pasaje = empleado.pasaje ?? 0;
            }

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

