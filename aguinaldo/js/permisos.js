//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN LA VISTA
// aguinaldo.php, EVITAR GENERAR AGUINALDO SI NO 
// TIENE PERMISO
//================================================

function aplicarPermisosGenerarAguinaldo() {
    // Verificar si el usuario tiene permiso para generar aguinaldo
    if (!tienePermiso('aguinaldos.generar_aguinaldo')) {

        // Ocultar el boton de generar aguinaldo
        $('#btn-nuevo-aguinaldo').hide();

    } else {
        // Si tiene permiso, mostrar el boton de generar aguinaldo, eliminando el atributo hidden
        $('#btn-nuevo-aguinaldo').removeAttr('hidden');
    }

}

//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN LA VISTA
// aguinaldo.php, EVITAR ELIMINAR AGUINALDO SI NO 
// TIENE PERMISO
//================================================

function aplicarPermisosEliminarAguinaldo() {
    // Verificar si el usuario tiene permiso para eliminar aguinaldo
    if (!tienePermiso('aguinaldos.eliminar_aguinaldo')) {

        // Ocultar los botones de eliminar aguinaldo en la tabla de historial
        $('.btn_borrar_aguinaldo').hide();

    }

}
