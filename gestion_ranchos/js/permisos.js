//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN LA VISTA 
// historial_cortes.php PARA NO AGREGAR NUEVOS CORTES
//================================================

function aplicarPermisosAgregarCortes() {
    // Verificar si el usuario tiene permiso para agregar Cortes
    if (!tienePermiso('cortes.agregar_corte')) {
        // Ocultar botón de agregar
        $('#btn_nuevo_vale').hide();

    } else {
        // si tiene permiso mostrar botón de agregar Eliminando el atributo hidden
        $('#btn_nuevo_vale').removeAttr('hidden');
    }
}

//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN LA VISTA 
// historial_cortes.php PARA NO EDITAR CORTES
//================================================

function aplicarPermisosEditarCortes() {
    // Verificar si el usuario tiene permiso para editar Cortes
    if (!tienePermiso('cortes.editar_corte')) {
        // Ocultar botón de editar en la tabla
        $('.btn_modificar_corte').hide();
    }
}


//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN LA VISTA 
// historial_cortes.php PARA NO CANCELAR CORTES
//================================================

function aplicarPermisosCancelarCortes() {
    // Verificar si el usuario tiene permiso para cancelar Cortes
    if (!tienePermiso('cortes.cancelar_corte')) {
        // Ocultar botón de cancelar en la tabla 
        $('.btn_cambiar_estado_corte').hide();
    }
}