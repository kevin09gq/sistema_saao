$(document).ready(function () {
    abrirModalNuevoUsuario();
    registrarNuevoUsuario();
    mostrarPasswordNuevo();
});

//==============================================
// FUNCIÓN PARA ABRIR EL MODAL DE NUEVO USUARIO
//==============================================

function abrirModalNuevoUsuario() {
    $("#btnNuevoUsuario").click(function (e) {
        e.preventDefault();

        // Limpiar el formulario
        limpiarFormularioNuevoUsuario();

        // Abrir el modal
        $('#modalNuevoUsuario').modal('show');
    });

    // Limpiar formulario al cerrar el modal
    $('#modalNuevoUsuario').on('hidden.bs.modal', function () {
        limpiarFormularioNuevoUsuario();
    });
}

//==============================================
// FUNCIÓN PARA REGISTRAR UN NUEVO USUARIO
//==============================================

function registrarNuevoUsuario() {

    $("#btnGuardarNuevoUsuario").click(function (e) {
        e.preventDefault();

        // Validar campos
        if (!validarCamposNuevoUsuario()) {
            return;
        }

        // Obtener datos del nuevo usuario
        const usuario = {
            nombre_admin: $("#nuevoNombreUsuario").val().trim(),
            correo: $("#nuevoCorreoUsuario").val().trim(),
            id_rol: $("#nuevoRolUsuario").val(),
            password: $("#nuevoPasswordUsuario").val()
        };

        // Deshabilitar botón durante el proceso
        const $btn = $(this);
        $btn.prop('disabled', true);

        // Enviar petición AJAX
        $.ajax({
            type: "POST",
            url: "../php/adminUsuarios.php",
            data: {
                accion: "crearUsuario",
                usuario: usuario
            },
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: "success",
                        title: "¡Usuario creado!",
                        text: response.mensaje
                    }).then(() => {
                        // Cerrar el modal
                        $('#modalNuevoUsuario').modal('hide');
                        // Limpiar campos
                        limpiarFormularioNuevoUsuario();
                        // Recargar tabla de usuarios
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
                    text: "Ocurrió un error al procesar la solicitud."
                });
            },
            complete: function () {
                $btn.prop('disabled', false);
            }
        });
    });
}

//==============================================
// VALIDACIÓN DE CAMPOS PARA NUEVO USUARIO
//==============================================

function validarCamposNuevoUsuario() {

    const nombre = $("#nuevoNombreUsuario").val().trim();
    const correo = $("#nuevoCorreoUsuario").val().trim();
    const rol = $("#nuevoRolUsuario").val();
    const password = $("#nuevoPasswordUsuario").val();
    const confirmarPassword = $("#nuevoConfirmarPasswordUsuario").val();

    // Validar campos requeridos
    if (nombre === "" || correo === "" || rol === "" || password === "" || confirmarPassword === "") {
        Swal.fire({
            icon: "warning",
            title: "Campos incompletos",
            text: "Por favor, complete todos los campos obligatorios."
        });
        return false;
    }

    // Validar formato de correo electrónico
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
        Swal.fire({
            icon: "warning",
            title: "Correo no válido",
            text: "Por favor, ingrese un correo electrónico válido."
        });
        return false;
    }

    // Validar longitud mínima de contraseña (mínimo 5 caracteres)
    if (password.length < 5) {
        Swal.fire({
            icon: "warning",
            title: "Contraseña corta",
            text: "La contraseña debe tener al menos 5 caracteres."
        });
        return false;
    }

    // Validar coincidencia de contraseñas
    if (password !== confirmarPassword) {
        Swal.fire({
            icon: "error",
            title: "Contraseñas no coinciden",
            text: "La confirmación de contraseña no coincide con la contraseña ingresada."
        });
        return false;
    }

    return true;
}

//==============================================
// MOSTRAR / OCULTAR CONTRASEÑAS EN NUEVO USUARIO
//==============================================

function mostrarPasswordNuevo() {

    // Toggle para campo contraseña
    $("#btnMostrarPasswordNuevo").click(function () {
        const input = $("#nuevoPasswordUsuario");
        const icono = $(this).find("i");

        if (input.attr("type") === "password") {
            input.attr("type", "text");
            icono.removeClass("bi-eye").addClass("bi-eye-slash");
        } else {
            input.attr("type", "password");
            icono.removeClass("bi-eye-slash").addClass("bi-eye");
        }
    });

    // Toggle para campo confirmar contraseña
    $("#btnMostrarConfirmarPasswordNuevo").click(function () {
        const input = $("#nuevoConfirmarPasswordUsuario");
        const icono = $(this).find("i");

        if (input.attr("type") === "password") {
            input.attr("type", "text");
            icono.removeClass("bi-eye").addClass("bi-eye-slash");
        } else {
            input.attr("type", "password");
            icono.removeClass("bi-eye-slash").addClass("bi-eye");
        }
    });
}

//==============================================
// LIMPIAR FORMULARIO DE NUEVO USUARIO
//==============================================

function limpiarFormularioNuevoUsuario() {
    const form = $("#formNuevoUsuario");
    if (form.length > 0) {
        form[0].reset();
    }

    // Restaurar tipo password en inputs e iconos
    $("#nuevoPasswordUsuario").attr("type", "password");
    $("#nuevoConfirmarPasswordUsuario").attr("type", "password");
    $("#btnMostrarPasswordNuevo i").removeClass("bi-eye-slash").addClass("bi-eye");
    $("#btnMostrarConfirmarPasswordNuevo i").removeClass("bi-eye-slash").addClass("bi-eye");
}
