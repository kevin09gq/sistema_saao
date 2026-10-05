// ===================================================
// FUNCIÓN PARA SABER SI EL USUARIO TIENE UN PERMISO
// ===================================================

// "clavePermiso" es el permiso que queremos comprobar.
// Ejemplo:
// tienePermiso('empleados.editar_informacion');

function tienePermiso(clavePermiso) {

    // Primero verificamos que "permisosUsuario" exista
    // y que tenga los permisos del usuario.
    //
    // Ejemplo de permisosUsuario:
    //
    // [
    //     'empleados.ver',
    //     'empleados.editar_informacion',
    //     'nominas.ver'
    // ]

    if (!Array.isArray(permisosUsuario)) {

        // Si "permisosUsuario" no existe o no es un arreglo,
        // significa que no tenemos permisos disponibles.
        // Por seguridad, regresamos false.
        return false;
    }

    // "includes()" busca dentro del arreglo si existe
    // exactamente el permiso que estamos preguntando.
    //
    // Ejemplo:
    //
    // permisosUsuario.includes('empleados.ver')
    //
    // Si existe:
    //      true
    //
    // Si NO existe:
    //      false

    return permisosUsuario.includes(clavePermiso);
}