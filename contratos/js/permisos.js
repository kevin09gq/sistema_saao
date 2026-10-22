//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN LA VISTA 
// lista_empleados.php VERIFICAR SI PUEDE EDITAR 
// PLANTILLAS DE CONTRATOS
//================================================

function aplicarPermisosPersonalizarContratos() {
    // Verificar si el usuario tiene permiso para editar información
    if (!tienePermiso('contratos.personalizar_contratos')) {

        // Ocultar botón de guardar
        $("#btn_plantillas").attr("hidden", "hidden");
       
    } else {
        // Si tiene permiso, eliminar el atributo "hidden" del botón
        $("#btn_plantillas").removeAttr("hidden");
    }
}

//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN LA VISTA 
// lista_empleados.php VERIFICAR SI PUEDE GENERAR 
// CONTRATOS
//================================================

function aplicarPermisosGenerarContratos() {
    // Verificar si el usuario tiene permiso para generar contratos
    if (!tienePermiso('contratos.generar_contratos')) {
        // Ocultar botón de generar en la tabla
        $('.btn-generar').hide();
        // Bloquear select de plantillas de contrato
        $('.select-plantilla').prop('disabled', true);
    } else {
        // Si tiene permiso, mostrar botón de generar y habilitar selects
        $('.btn-generar').show();
        $('.select-plantilla').prop('disabled', false);
    }
}