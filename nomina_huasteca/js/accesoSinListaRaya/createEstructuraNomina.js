let jsonNominaHuasteca = null;

$(document).ready(function () {
    crearEstructuraJson();
});

// ============================================
// CREAR LA ESTRUCTURA INICIAL DE LA NÓMINA HUASTECA 
// ============================================

function crearEstructuraJson() {
    $("#container-acceso-huasteca").removeAttr("hidden");
    $('#btn_crear_nomina_huasteca').on('click', function () {
        // Obtener valores de los campos
        // Función simple para formatear fecha a 30/Ene/2026

        jsonNominaHuasteca = {
            numero_semana: $('#semana_nomina_huasteca').val(),
            fecha_inicio: formatearFechaNomina($('#fecha_inicio_nomina_huasteca').val()),
            fecha_cierre: formatearFechaNomina($('#fecha_cierre_nomina_huasteca').val()),
            departamentos: [
                {
                    nombre: "huasteca coordinadores",
                    empleados: []
                },
                {
                    nombre: "huasteca jornaleros",
                    empleados: []
                }
            ]
        };

        obtenerJornalerosCoordinadores(jsonNominaHuasteca);
    });
}

// ============================================
// FORMATEAR FECHA PARA MOSTRAR EN NÓMINA (DD/Mes/AAAA)
// ============================================

function formatearFechaNomina(fecha) {
    if (!fecha) return '';
    var meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    var partes = fecha.split('-');
    return partes[2] + '/' + meses[parseInt(partes[1]) - 1] + '/' + partes[0];
}

// ============================================
// OBTENER JORNALEROS Y COORDINADORES DE LA BASE DE DATOS PARA AGREGARLOS A LA ESTRUCTURA DE LA NÓMINA HUASTECA
// ============================================

function obtenerJornalerosCoordinadores(jsonNominaHuasteca) {
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
                        salario_diario: empleadoBD.salario_diario,
                        id_empresa: empleadoBD.id_empresa,
                        id_departamento: empleadoBD.id_departamento,
                        id_puestoEspecial: empleadoBD.id_puestoEspecial,
                        biometrico: empleadoBD.biometrico,
                        seguroSocial: false
                    };

                    // Agregar horario_oficial y salario_semanal solo para departamento 12 (huasteca coordinadores)
                    if (empleadoBD.id_departamento == 12) {
                        empleado.horario_oficial = empleadoBD.horario_oficial || null;
                        empleado.salario_semanal = empleadoBD.salario_semanal;
                    }

                    // Determinar a qué departamento agregar
                    let nombreDpto = null;
                    if (empleadoBD.id_departamento == 12) {
                        nombreDpto = 'huasteca coordinadores';
                    } else if (empleadoBD.id_departamento == 13) {
                        nombreDpto = 'huasteca jornaleros';
                    }

                    // Si se determina un departamento válido, agregar el empleado
                    if (nombreDpto && jsonNominaHuasteca && jsonNominaHuasteca.departamentos) {
                        let dpto = jsonNominaHuasteca.departamentos.find(d => d.nombre === nombreDpto);

                        // Si el departamento no existe, crearlo
                        if (!dpto) {
                            dpto = {
                                nombre: nombreDpto,
                                empleados: []
                            };
                            jsonNominaHuasteca.departamentos.push(dpto);
                        }

                        // Evitar duplicados
                        const yaExiste = dpto.empleados.some(e => e.clave === empleado.clave);
                        if (!yaExiste) {
                            dpto.empleados.push(empleado);
                        }
                    }


                });
                asignarPropiedadesEmpleado(jsonNominaHuasteca);
                ordenarEmpleadosPorNombre(jsonNominaHuasteca);
                inicializarRegistrosVacios(jsonNominaHuasteca);
                mostrarConfigValores(true);

                console.log(jsonNominaHuasteca);


                // BHL: Llenar tabla de pagos por día cuando se cargue la nómina
                /* 
                if (typeof llenar_cuerpo_tabla_pagos_por_dia === 'function') {
                    llenar_cuerpo_tabla_pagos_por_dia();
                } */


            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener empleados sin seguro:', error);
        }
    });
}



// FUNCIONES AUXILIARES

// Función para asignar propiedades necesarias a empleados de departamentos específicos

function asignarPropiedadesEmpleado(jsonNominaHuasteca) {
    if (!jsonNominaHuasteca || !Array.isArray(jsonNominaHuasteca.departamentos)) return;

    // Recorrer todos los departamentos
    jsonNominaHuasteca.departamentos.forEach(departamento => {
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
            if (idDepto === 12) {
                // Departamento: Coordinadores
                empleado.id_tipo_puesto = 4; // Coordinador

            } else if (idDepto === 11) {
                // Departamento: Jornaleros
                empleado.id_tipo_puesto = (idPuesto === 37 || idPuesto === 39) ? 3 : ((idPuesto === 38) ? 2 : 1);
            }*/

            // Asignar propiedad pasaje para jornaleros base y vivero
            if (["13"].includes(empleado.id_departamento)) {
                empleado.pasaje = empleado.pasaje ?? 0;
                empleado.comida = empleado.comida ?? 0;
                empleado.tardeada = empleado.tardeada ?? 0;
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

function inicializarRegistrosVacios(jsonNominaHuasteca) {
    if (!jsonNominaHuasteca || !Array.isArray(jsonNominaHuasteca.departamentos)) return;

    jsonNominaHuasteca.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            // Inicializar registros como array vacío si no existen
            if (!empleado.registros || !Array.isArray(empleado.registros)) {
                empleado.registros = [];
            }
        });
    });
}




