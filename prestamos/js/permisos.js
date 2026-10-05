//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN LA VISTA
// DE PRESTAMOS INDEX.PHP, DETALLES.PHP
//================================================

function aplicarPermisosRegistrarPrestamo() {
    // Verificar si el usuario tiene permiso para registrar préstamos
    if (!tienePermiso('prestamos.registrar_prestamo')) {

        // Ocultar botón de guardar
        $('#link-nuevo-prestamo').hide();

        // Ocultar botón de nuevo préstamo en detalles.php
        $('#btn-nuevo-prestamo').hide();
        

    } else {

        // Mostrar botón de guardar, eliminando el atributo "hidden"
        $('#link-nuevo-prestamo').removeAttr('hidden');

        // Mostrar botón de nuevo préstamo en detalles.php, eliminando el atributo "hidden"
        $('#btn-nuevo-prestamo').removeAttr('hidden');

    }
}


function aplicarPermisosEditarPrestamo() {
    // Verificar si el usuario tiene permiso para editar préstamos
    if (!tienePermiso('prestamos.editar_prestamo')) {

        // Ocultar la columna de acciones de la tabla tabla-prestamos (encabezado y celdas)
        $('#tabla-prestamos th:last-child, #tabla-prestamos td:last-child').hide();
    }

}

function aplicarPermisosAbonarPrestamo() {
    // Verificar si el usuario tiene permiso para abonar préstamos
    if (!tienePermiso('prestamos.registrar_abono')) {

        // Ocultar Boton de abonar préstamo en detalles.php
        $('#btn-abonar').hide();
    }else{
        // Mostrar Boton de abonar préstamo en detalles.php, eliminando el atributo "hidden"
        $('#btn-abonar').removeAttr('hidden');
    }

    // Verificar si el usuario tiene permiso para editar abonos
    if (!tienePermiso('prestamos.editar_abono')) {

        // Ocultar los botones de editar abono en la tabla tabla-abonos
        $('#tabla-abonos .btn-editar-abono').hide();
    }
}


function aplicarPermisosPlanPagos() {
    // Verificar si el usuario tiene permiso para editar plan de pagos
    if (!tienePermiso('prestamos.editar_plan_pago')) {

        // Ocultar los botones de editar plan en la tabla tabla-planes
        $('#tabla-planes .btn-editar-plan').hide();
    }
}