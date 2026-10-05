//=========================================
// FUNCIÓN PARA ELIMINAR UN USUARIO
//=========================================

function eliminarUsuario(id_admin, id_rol) {

    // Si es Administrador no permite eliminarlo
    if (parseInt(id_rol) === 1) {
        Swal.fire({
            icon: "warning",
            title: "Acción no permitida",
            text: "No se puede eliminar a un usuario con rol de Administrador."
        });
        return;
    }

    // Confirmación con SweetAlert antes de eliminar
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará al usuario y todos sus permisos asociados. No se puede revertir.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: '<i class="bi bi-trash"></i> Sí, eliminar',
        cancelButtonText: '<i class="bi bi-x-lg"></i> Cancelar'
    }).then((result) => {

        if (result.isConfirmed) {

            // Enviar la solicitud AJAX para eliminar el usuario y sus permisos
            $.ajax({
                type: "POST",
                url: "../php/adminUsuarios.php",
                data: {
                    accion: "eliminarUsuario",
                    id_admin: id_admin
                },
                dataType: "json",
                success: function (response) {
                    if (response.success) {
                        Swal.fire({
                            icon: "success",
                            title: "Eliminado",
                            text: response.mensaje
                        }).then(() => {
                            // Recargar la lista de usuarios
                            obtenerUsuarios();
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: response.mensaje
                        });
                    }
                },
                error: function () {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Ocurrió un error al intentar eliminar el usuario."
                    });
                }
            });
        }
    });
}


//=========================================
// FUNCIÓN PARA DAR DE BAJA O ALTA A UN USUARIO
//=========================================

function darBajaAltaUsuario(id_admin, id_status, id_rol) {

    // Validar si es Administrador y se intenta dar de baja
    if (parseInt(id_rol) === 1 && parseInt(id_status) === 1) {
        Swal.fire({
            icon: "warning",
            title: "Acción no permitida",
            text: "No se puede dar de baja a un usuario con rol de Administrador."
        });
        return;
    }

    const esActivo = parseInt(id_status) === 1;
    const nuevoStatus = esActivo ? 2 : 1;

    const titulo = esActivo ? "¿Dar de baja al usuario?" : "¿Reactivar usuario?";
    const texto = esActivo
        ? "El usuario no podrá acceder al sistema mientras se encuentre inactivo."
        : "El usuario volverá a tener acceso al sistema con sus permisos asignados.";
    const textoBoton = esActivo
        ? '<i class="bi bi-person-slash"></i> Sí, dar de baja'
        : '<i class="bi bi-person-check"></i> Sí, reactivar';
    const colorBoton = esActivo ? "#e74848" : "#198754";

    // Confirmación con SweetAlert
    Swal.fire({
        title: titulo,
        text: texto,
        icon: esActivo ? "warning" : "question",
        showCancelButton: true,
        confirmButtonColor: colorBoton,
        cancelButtonColor: "#6c757d",
        confirmButtonText: textoBoton,
        cancelButtonText: '<i class="bi bi-x-lg"></i> Cancelar'
    }).then((result) => {

        if (result.isConfirmed) {

            // Enviar petición AJAX para cambiar el estado
            $.ajax({
                type: "POST",
                url: "../php/adminUsuarios.php",
                data: {
                    accion: "cambiarEstadoUsuario",
                    id_admin: id_admin,
                    id_status: nuevoStatus
                },
                dataType: "json",
                success: function (response) {
                    if (response.success) {
                        Swal.fire({
                            icon: "success",
                            title: "Estado actualizado",
                            text: response.mensaje
                        }).then(() => {
                            // Recargar la lista de usuarios
                            obtenerUsuarios();
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: response.mensaje
                        });
                    }
                },
                error: function () {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Ocurrió un error al intentar cambiar el estado del usuario."
                    });
                }
            });
        }
    });
}

