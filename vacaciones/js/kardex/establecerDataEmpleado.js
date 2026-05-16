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
// FUNCIONES AUXILIARES
//==============================
function formatearFecha(fechaTexto) {
    if (!fechaTexto) return '---';
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    let fecha = new Date(fechaTexto);
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}