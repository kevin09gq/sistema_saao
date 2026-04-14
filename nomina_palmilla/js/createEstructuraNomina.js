let jsonNominaPalmilla = null;

$(document).ready(function () {
    crearEstructuraJson();
    restoreNomina();
    limpiarCamposNomina();
    obtenerNominaPalmilla();
    console.log(jsonNominaPalmilla);
});

// ============================================
// CREAR LA ESTRUCTURA INICIAL DE LA NÓMINA HUASTECA 
// ============================================

// PASO 1: Crea la estructura del json con los datos básicos de la nómina (semana, fechas) y departamentos vacíos
function crearEstructuraJson() {
    $("#container-acceso-palmilla").removeAttr("hidden");
    $('#btn_crear_nomina_palmilla').on('click', function () {
        const semana = $('#semana_nomina_palmilla').val();
        const fechaInicio = $('#fecha_inicio_nomina_palmilla').val();
        const fechaCierre = $('#fecha_cierre_nomina_palmilla').val();

        if (!semana || !fechaInicio || !fechaCierre) {
            Swal.fire('Error', 'Por favor completa todos los campos para crear la nómina.', 'error');
            return;
        }

        // Mostrar alerta de carga
        Swal.fire({
            title: 'Creando nómina...',
            text: 'Espere un momento por favor.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        jsonNominaPalmilla = {
            numero_semana: $('#semana_nomina_palmilla').val(),
            fecha_inicio: formatearFechaNomina($('#fecha_inicio_nomina_palmilla').val()),
            fecha_cierre: formatearFechaNomina($('#fecha_cierre_nomina_palmilla').val()),
            departamentos: []
        };
    
        // Cargar departamentos asociados a la nómina 7
        obtenerDepartamentosNomina(jsonNominaPalmilla);
    });
}

// PASO 2: Obtener los departamentos asociados a la nómina y agregarlos a la estructura del JSON
function obtenerDepartamentosNomina(jsonNominaPalmilla) {
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerDepartamentosNomina',
            id_nomina: 7
        },
        dataType: 'json',
        success: function (response) {
            if (response.departamentos && response.departamentos.length > 0) {
                // Agregar cada departamento a la estructura
                response.departamentos.forEach(function (dpto) {
                    jsonNominaPalmilla.departamentos.push({
                        id_departamento: dpto.id_departamento,
                        nombre: dpto.nombre_departamento,
                        empleados: []
                    });
                });

                
                // Una vez cargados los departamentos, obtener los empleados
                obtenerEmpleadosSinSeguro(jsonNominaPalmilla);

            } else if (response.departamentos && response.departamentos.length === 0) {
                Swal.fire('Atención', 'No se encontraron departamentos asociados a esta nómina.', 'warning');
            } else {
                Swal.fire('Error', 'No se recibieron datos de departamentos del servidor.', 'error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener departamentos:', error);
            Swal.fire('Error', 'Hubo un problema al obtener los departamentos de la nómina.', 'error');
        }
    });
}

// PASO 3: Obtener los empleados sin seguro de la base de datos y agregarlos al departamento correspondiente en la estructura del JSON
function obtenerEmpleadosSinSeguro(jsonNominaPalmilla) {
    
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
                    if (jsonNominaPalmilla) {
                        let dpto = jsonNominaPalmilla.departamentos.find(d => d.id_departamento == empleadoBD.id_departamento);
                        if (dpto) {
                            // Evitar duplicados RECUERDA PONER TAMBIEN POR EL ID EMPRESA
                            const yaExiste = dpto.empleados.some(e => e.clave === empleado.clave);
                            if (!yaExiste) {
                                dpto.empleados.push(empleado);
                            }
                        }
                    }

                });


                asignarPropiedadesEmpleado(jsonNominaPalmilla);
                ordenarEmpleadosPorNombre(jsonNominaPalmilla);
                inicializarRegistrosVacios(jsonNominaPalmilla);
                
                // Guardar explícitamente al crear para asegurar persistencia
                saveNomina(jsonNominaPalmilla);
                mostrarConfigValores(true);

                // BHL: Llenar tabla de pagos por día cuando se cargue la nómina
                if (typeof llenar_cuerpo_tabla_pagos_por_dia === 'function') {
                    llenar_cuerpo_tabla_pagos_por_dia();
                }

            } else {
                Swal.fire('Atención', 'No se encontraron empleados sin seguro para cargar en la nómina.', 'info');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener empleados sin seguro:', error);
            Swal.fire('Error', 'Error al obtener empleados sin seguro: ' + error, 'error');
        }
    });
}


// ============================================
// RECUPERAR NÓMINA HUASTECA GUARDADA EN LA BASE DE DATOS (SI EXISTE)
// ============================================

// PASO 1: Obtener la nomina de la BD
function obtenerNominaPalmilla() {
    $('#btn_recuperar_nomina_palmilla').on('click', function () {
        var anio = parseInt($('#anio_recuperar_nomina_palmilla').val());
        var semana = parseInt($('#semana_recuperar_nomina_palmilla').val());

        if (!anio || !semana) {
            Swal.fire('Error', 'Por favor completa año y semana', 'error');
            return;
        }

        // 1. Validar que exista la nómina en la BD
        validarExistenciaNomina(semana, anio)
            .then(function (existe) {
                if (!existe) {
                    Swal.fire({
                        title: 'No encontrada',
                        text: `No existe una nómina guardada para la semana ${semana} del año ${anio}.`,
                        icon: 'warning'
                    });
                    return;
                }

                // 2. Obtener la nómina completa
                return getNominaPalmilla(semana, anio)
                    .then(function (nomina) {
                        if (!nomina) {
                            Swal.fire('Error', 'No se pudo recuperar la nómina. Intenta de nuevo.', 'error');
                            return;
                        }

                        // 3. Cargar en la variable global y en localStorage
                        jsonNominaPalmilla = nomina;
                        validarExistenciaTrabajadorBD(jsonNominaPalmilla);



                    });
            })
            .catch(function (err) {
                console.error('Error en obtenerNominaPalmilla:', err);
                Swal.fire('Error', 'Ocurrió un error al comunicarse con el servidor.', 'error');
            });
    });
}

// PASO 2:  Validar a los empleados si existen en la base de datos
function validarExistenciaTrabajadorBD(jsonNominaPalmilla) {

    // Array para almacenar todas las claves de empleados
    var clavesEmpleados = [];

    // Recorrer todos los departamentos
    jsonNominaPalmilla.departamentos.forEach(function (departamento) {
        departamento.empleados.forEach(function (empleado) {
            clavesEmpleados.push(empleado.clave);
        });
    });

    // Enviar las claves al servidor para validar
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
                // Obtener claves existentes en la BD
                var clavesExistentes = response.existentes.map(emp => emp.clave);

                // Filtrar empleados: solo dejar los que existen en BD (id_status=1 e id_empresa=1)
                jsonNominaPalmilla.departamentos.forEach(function (departamento) {

                    // Si es Corte, no filtrar contra BD
                    if (departamento.nombre === "Corte") {
                        return;
                    }

                    departamento.empleados = departamento.empleados.filter(function (empleado) {
                        return clavesExistentes.includes(String(empleado.clave));
                    });
                });

                // Quitar departamentos vacíos
                jsonNominaPalmilla.departamentos = jsonNominaPalmilla.departamentos.filter(function (departamento) {
                    return departamento.empleados.length > 0;
                });

                console.log(jsonNominaPalmilla);

                verificarEmpleadosSinSeguro(jsonNominaPalmilla);

            }
        },
        error: function (xhr, status, error) {
            console.error('Error al verificar empleados:', error);
            console.error('Respuesta del servidor:', xhr.responseText);
        }
    });
}

// PASO 3: Verificar si hay empleados sin seguro que no estén en la nómina y agregarlos al departamento correspondiente
function verificarEmpleadosSinSeguro(jsonNominaPalmilla) {
    if (!jsonNominaPalmilla || !jsonNominaPalmilla.departamentos) return;

    // Recopilar todas las claves de empleados en la nómina actual para evitar duplicados
    let clavesNomina = new Set();
    jsonNominaPalmilla.departamentos.forEach(function (departamento) {
        departamento.empleados.forEach(function (empleado) {
            clavesNomina.add(String(empleado.clave));
        });
    });

    // Obtener empleados sin seguro de la base de datos (Específico para Palmilla)
    $.ajax({
        url: '../php/validarExistenciaEmpleado.php',
        type: 'GET',
        data: {
            case: 'obtenerEmpleadosSinSeguroPalmilla'
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
                    const deptoDestino = jsonNominaPalmilla.departamentos.find(d =>
                        parseInt(d.id_departamento) === parseInt(empSinSeguro.id_departamento)
                    );

                    if (deptoDestino) {
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

                asignarPropiedadesEmpleado(jsonNominaPalmilla);
                ordenarEmpleadosPorNombre(jsonNominaPalmilla);

                if (typeof initComponents === 'function') {
                    initComponents();
                }

                saveNomina(jsonNominaPalmilla);

                let id_departamento = parseInt($('#filtro_departamento').val());
                let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaPalmilla, id_departamento);
                mostrarDatosTabla(jsonFiltrado, 1);
                console.log(jsonNominaPalmilla);

                // BHL: Llenar tabla de pagos por día cuando se cargue la nómina
                if (typeof llenar_cuerpo_tabla_pagos_por_dia === 'function') {
                    llenar_cuerpo_tabla_pagos_por_dia();
                }

            } else {
                Swal.fire('Atención', 'No hay empleados sin seguro adicionales para agregar a la nómina.', 'info');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener empleados sin seguro:', error);
            Swal.fire('Error', 'Error al obtener empleados sin seguro: ' + error, 'error');
        }
    });
}





// FUNCIONES AUXILIARES

// Función para asignar propiedades necesarias a empleados de departamentos específicos

function asignarPropiedadesEmpleado(jsonNominaPalmilla) {
    if (!jsonNominaPalmilla || !Array.isArray(jsonNominaPalmilla.departamentos)) return;

    // Recorrer todos los departamentos
    jsonNominaPalmilla.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;



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


// Función para ordenar empleados por nombre dentro de cada departamento
function ordenarEmpleadosPorNombre(jsonOrdenado) {
    jsonOrdenado.departamentos.forEach(function (departamento) {
        departamento.empleados.sort(function (a, b) {
            return a.nombre.localeCompare(b.nombre);
        });
    });

}

function inicializarRegistrosVacios(jsonNominaPalmilla) {
    if (!jsonNominaPalmilla || !Array.isArray(jsonNominaPalmilla.departamentos)) return;

    jsonNominaPalmilla.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            // Inicializar registros como array vacío si no existen
            if (!empleado.registros || !Array.isArray(empleado.registros)) {
                empleado.registros = [];
            }
        });
    });
}

function formatearFechaNomina(fecha) {
    if (!fecha) return '';
    var meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    var partes = fecha.split('-');
    return partes[2] + '/' + meses[parseInt(partes[1]) - 1] + '/' + partes[0];
}




