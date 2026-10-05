//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN LA VISTA
// historial.php, EVITAR GENERAR PTU SI NO 
// TIENE PERMISO
//================================================

function aplicarPermisosGenerarPTU() {
    // Verificar si el usuario tiene permiso para generar ptu
    if (!tienePermiso('ptu.generar_ptu')) {

        // Ocultar el boton de generar ptu
        $('#btn-nuevo-ptu').hide();

    } else {
        // Si tiene permiso, mostrar el boton de generar ptu, eliminando el atributo hidden
        $('#btn-nuevo-ptu').removeAttr('hidden');
    }

}

//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN LA VISTA
// historial.php, EVITAR ELIMINAR PTU SI NO 
// TIENE PERMISO
//================================================

function aplicarPermisosEliminarPTU() {
    // Verificar si el usuario tiene permiso para eliminar ptu
    if (!tienePermiso('ptu.eliminar_ptu')) {

        // Ocultar los botones de eliminar ptu en la tabla de historial
        $('.btn_eliminar_utilidad').hide();

    }

}
