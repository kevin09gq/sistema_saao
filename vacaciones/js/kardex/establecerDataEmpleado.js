//==============================
// VARIABLE GLOBAL PARA ALMACENAR LOS DATOS DEL EMPLEADO
//==============================
let empleadoActual = null;

$(document).ready(function () {
    // Obtener ID del empleado desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idEmpleado = urlParams.get('id');

    if (idEmpleado) {
        obtenerInformacionEmpleado(idEmpleado);
    } else {
        alert("No se especificó un empleado.");
        window.location.href = 'vacaciones.php';
    }
});

/***************************
 ENCABEZADO
***************************/

//==============================
// OBTIENE LA INFORMACIÓN DEL EMPLEADO DESDE EL SERVIDOR
//==============================
function obtenerInformacionEmpleado(idEmpleado) {
    $.post('../php/infoEmpleados.php', {
        action: 'obtenerEmpleadoPorId',
        id_empleado: idEmpleado
    }, function (empleado) {
        if (empleado.error) {
            alert(empleado.error);
            return;
        }
        empleadoActual = empleado; // Guardar en variable global
        cargarEncabezadoEmpleado(empleado);
        cargarPeriodosVacaciones(empleado); // Nueva función para cargar la tabla
    }, 'json');
}


//==============================
// CARGA LA INFORMACION DEL EMPLEADO EN EL ENCABEZADO DE LA PAGINA
//==============================
function cargarEncabezadoEmpleado(emp) {
    let iniciales = (emp.nombre.charAt(0) + (emp.ap_paterno ? emp.ap_paterno.charAt(0) : '')).toUpperCase();
    $('#avatarEmpleado').text(iniciales);
    $('#nombreEmpleado').text(`${emp.nombre} ${emp.ap_paterno} ${emp.ap_materno}`);
    $('#claveEmpleado').text(emp.clave_empleado);
    $('#deptoEmpleado').text(emp.nombre_departamento || 'Sin asignar');
    $('#ingresoEmpleado').text(formatearFecha(emp.fecha_ingreso_final));
    $('#antiguedadEmpleado').text(emp.antiguedad);

    $('#statusEmpleado')
        .removeClass('status-activo status-vencido')
        .addClass(emp.id_status == 1 ? 'status-activo' : 'status-vencido')
        .text(emp.id_status == 1 ? 'ELEGIBLE' : 'NO ELEGIBLE');
}


//==============================
// CARGA LA INFORMACION DEL RESUMEN DE LOS PERIODOS EN EL ENCABEZADO
// Solo suma los periodos del CICLO ACTUAL (el num_ciclo más alto)
//==============================
function actualizarResumenTotales(periodos) {
    let totales = 0;
    let tomados = 0;
    let saldo = 0;

    // Determinar el ciclo más reciente (el número más alto)
    let cicloActual = 0;
    $.each(periodos, function(i, p) {
        let nc = parseInt(p.num_ciclo) || 1;
        if (nc > cicloActual) cicloActual = nc;
    });

    // Sumar solo los periodos del ciclo actual
    $.each(periodos, function(i, p) {
        let nc = parseInt(p.num_ciclo) || 1;
        if (nc === cicloActual) {
            totales += parseFloat(p.dias_derecho);
            tomados += parseFloat(p.dias_tomados);
            saldo += parseFloat(p.saldo);
        }
    });

    $('#diasTotales').text(totales.toFixed(3));
    $('#diasUtilizados').text(tomados.toFixed(3));
    $('#saldoDisponible').text(saldo.toFixed(3));
}


//==============================
// FUNCIONES AUXILIARES
//==============================
function formatearFecha(fechaTexto) {
    if (!fechaTexto) return '---';
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    let fecha = new Date(fechaTexto);
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

//==============================
// OBTIENE EL HISTORIAL DE HITOS LABORALES (INGRESO, REINGRESOS Y BAJAS) ORDENADO CRONOLÓGICAMENTE
//==============================
function obtenerHitosLaborales(empleado) {
    let hitos = [];

    // 1. Agregar Ingreso inicial
    if (empleado.fecha_alta_empresa && empleado.fecha_alta_empresa !== '0000-00-00') {
        hitos.push({
            fecha: empleado.fecha_alta_empresa,
            tipo: 'INGRESO',
            concepto: 'Ingreso del empleado',
            observaciones: 'Alta de empleado en la empresa'
        });
    }

    // 2. Agregar Reingresos y Bajas
    if (empleado.historial_reingresos && empleado.historial_reingresos.length > 0) {
        $.each(empleado.historial_reingresos, function(idx, h) {
            if (h.fecha_reingreso && h.fecha_reingreso !== '0000-00-00' && h.fecha_reingreso !== empleado.fecha_alta_empresa) {
                hitos.push({
                    fecha: h.fecha_reingreso,
                    tipo: 'REINGRESO',
                    concepto: 'Reingreso del empleado',
                    observaciones: 'Reingreso a labores'
                });
            }
            if (h.fecha_salida && h.fecha_salida !== '0000-00-00') {
                hitos.push({
                    fecha: h.fecha_salida,
                    tipo: 'BAJA',
                    concepto: 'Dada de baja del empleado',
                    observaciones: 'Baja del empleado / Fin de relación laboral'
                });
            }
        });
    }

    // 3. Ordenar cronológicamente (más antiguo a más reciente)
    hitos.sort(function(a, b) {
        return new Date(a.fecha) - new Date(b.fecha);
    });

    return hitos;
}