
$(document).ready(function () {
    editarUsuario();

    mostrarPassword();
});
//=========================================
// FUNCIÓN PARA ABRIR EL MODAL PARA 
// EDITAR INFORMACIÓN DEL USUARIO
//=========================================

function abrirModalEditarInformacion(nombre_admin, id_rol, correo, id_admin) {

    // Establece la información del usuario en el modal
    establecerInfo(nombre_admin, id_rol, correo, id_admin);

    // muestra el modal de permisos
    $('#modalEditarUsuario').modal('show');

}

//=========================================
// FUNCIÓN PARA ESTABLECER LA INFORMACIÓN 
// DEL USUARIO EN EL MODAL
//=========================================

function establecerInfo(nombre_admin, id_rol, correo, id_admin) {
    // Establecer ID del usuario en el modal
    $('#modalEditarUsuario').data('id_admin', id_admin);

    // Establecer Nombre del usuario
    $("#editarNombreUsuario").val(nombre_admin);

    // Establecer Rol del usuario en el select
    $("#editarRolUsuario").val(id_rol);

    // Establecer Correo del usuario
    $('#editarCorreoUsuario').val(correo);

    // Limpiar campos de contraseña
    $('#editarPasswordUsuario').val('');
    $('#confirmarPasswordUsuario').val('');
}

//=========================================
// FUNCIÓN PARA EDITAR LA INFORMACIÓN DEL 
// USUARIO
//=========================================

function editarUsuario() {

    $("#btnGuardarUsuario").click(function (e) {

        e.preventDefault();

        // Validar campos antes de enviar el formulario
        if (!validarCampos()) {
            return;
        }

        // Crear objeto usuario 
        const usuario = {
            id_admin: $("#modalEditarUsuario").data("id_admin"),
            nombre_admin: $("#editarNombreUsuario").val().trim(),
            id_rol: $("#editarRolUsuario").val(),
            correo: $("#editarCorreoUsuario").val().trim(),
            password: $("#editarPasswordUsuario").val()
        };

        // Enviar la solicitud AJAX para editar la información del usuario
        $.ajax({
            type: "POST",
            url: "../php/adminUsuarios.php",
            data: {
                accion: "editarUsuario",
                usuario: usuario
            },
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Éxito",
                        text: response.mensaje
                    }).then(() => {
                        // Cerrar el modal
                        $('#modalEditarUsuario').modal('hide');
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
            }
        });
    });



}


function validarCampos() {

    // Validar que los campos obligatorios no estén vacíos
    if (
        $("#editarNombreUsuario").val().trim() === "" ||
        $("#editarRolUsuario").val() === "" ||
        $("#editarCorreoUsuario").val().trim() === ""
    ) {

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, complete todos los campos."
        });

        return false;
    }


    // Obtener las contraseñas
    const password = $("#editarPasswordUsuario").val();
    const confirmarPassword = $("#confirmarPasswordUsuario").val();


    // Si se ingresó una contraseña, debe confirmarse
    if (password !== "" && confirmarPassword === "") {

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, confirme la nueva contraseña."
        });

        return false;
    }


    // Validar que las contraseñas coincidan
    if (password !== "" && password !== confirmarPassword) {

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Las contraseñas no coinciden."
        });

        return false;
    }


    // Todas las validaciones fueron correctas
    return true;
}


//=========================================
// FUNCIÓN PARA MOSTRAR / OCULTAR CONTRASEÑA
//=========================================

function mostrarPassword() {

    $("#btnMostrarPassword").click(function () {

        // Obtiene el campo de contraseña
        const password = $("#editarPasswordUsuario");

        // Obtiene el icono del botón
        const icono = $(this).find("i");

        // Verifica el tipo actual del campo
        if (password.attr("type") === "password") {

            // Mostrar contraseña
            password.attr("type", "text");

            // Cambiar icono
            icono
                .removeClass("bi-eye")
                .addClass("bi-eye-slash");

        } else {

            // Ocultar contraseña
            password.attr("type", "password");

            // Cambiar icono
            icono
                .removeClass("bi-eye-slash")
                .addClass("bi-eye");
        }

    });
}


