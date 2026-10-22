
$(document).ready(function () {

    obtenerCredenciales();

    mostrarPassword();

    recuperarPassword();

});


//====================================================
// FUNCIÓN PARA OBTENER LAS CREDENCIALES DEL USUARIO
//====================================================

function obtenerCredenciales() {

    $("#btnIniciarSesion").click(function (e) {

        e.preventDefault();


        //================================================
        // OBTENER DATOS DEL FORMULARIO
        //================================================

        let correo = $("#inputCorreo").val().trim();
        let password = $("#inputPassword").val();


        //================================================
        // VALIDAR CAMPOS
        //================================================

        if (correo === "") {

            Swal.fire({
                icon: "warning",
                title: "Campo requerido",
                text: "Ingresa tu correo electrónico."
            });

            $("#inputCorreo").focus();

            return;
        }


        if (password === "") {

            Swal.fire({
                icon: "warning",
                title: "Campo requerido",
                text: "Ingresa tu contraseña."
            });

            $("#inputPassword").focus();

            return;
        }


        //================================================
        // DESACTIVAR BOTÓN
        //================================================

        $("#btnIniciarSesion")
            .prop("disabled", true)
            .text("Iniciando sesión...");


        //================================================
        // ENVIAR DATOS AL PHP
        //================================================

        $.ajax({

            url: "php/iniciarSesion.php",

            type: "POST",

            dataType: "json",

            data: {
                accion: "iniciarSesion",
                correo: correo,
                password: password
            },


            //================================================
            // RESPUESTA CORRECTA DEL SERVIDOR
            //================================================

            success: function (respuesta) {

                if (respuesta.estado === true) {

                    Swal.fire({
                        icon: "success",
                        title: "¡Bienvenido!",
                        text: respuesta.mensaje,
                        timer: 1200,
                        showConfirmButton: false
                    }).then(function () {

                        // Redirigir al sistema
                        window.location.href = "../index.php";

                    });

                } else {

                    Swal.fire({
                        icon: "error",
                        title: "No se pudo iniciar sesión",
                        text: respuesta.mensaje
                    });


                    // Volver a activar botón
                    $("#btnIniciarSesion")
                        .prop("disabled", false)
                        .text("Iniciar Sesión");
                }
            },


            //================================================
            // ERROR AJAX
            //================================================

            error: function (xhr) {

                console.error("Error AJAX:", xhr.responseText);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Ocurrió un error al comunicarse con el servidor."
                });


                // Volver a activar botón
                $("#btnIniciarSesion")
                    .prop("disabled", false)
                    .text("Iniciar Sesión");
            }

        });

    });

}


function mostrarPassword() {
    $(".toggle-password").click(function () {

        const password = $("#inputPassword");
        const icono = $(this).find("i");

        if (password.attr("type") === "password") {

            password.attr("type", "text");

            icono
                .removeClass("bi-eye")
                .addClass("bi-eye-slash");

        } else {

            password.attr("type", "password");

            icono
                .removeClass("bi-eye-slash")
                .addClass("bi-eye");
        }
    });
}


//====================================================
// FUNCIÓN PARA RECUPERAR CONTRASEÑA VÍA AJAX
//====================================================

function recuperarPassword() {

    $("#formRecuperarPassword").on("submit", function (e) {

        e.preventDefault();

        const email = $("#inputEmailRecuperar").val().trim();

        if (email === "") {
            Swal.fire({
                icon: "warning",
                title: "Campo requerido",
                text: "Por favor, ingresa tu correo electrónico."
            });
            $("#inputEmailRecuperar").focus();
            return;
        }

        const $btn = $("#btnRecuperarPassword");
        const textoOriginal = $btn.text();

        // Desactivar botón y mostrar estado de carga
        $btn.prop("disabled", true).text("Enviando enlace...");

        $.ajax({
            url: "php/recuperar_password.php",
            type: "POST",
            dataType: "json",
            data: { email: email },

            success: function (respuesta) {
                if (respuesta.success) {
                    Swal.fire({
                        icon: "success",
                        title: "¡Enlace enviado!",
                        text: respuesta.message,
                        confirmButtonColor: "#22c55e"
                    });
                    $("#inputEmailRecuperar").val("");
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "No se pudo enviar",
                        text: respuesta.message || "Ocurrió un error al procesar tu solicitud."
                    });
                }
            },

            error: function (xhr) {
                console.error("Error AJAX:", xhr.responseText);
                Swal.fire({
                    icon: "error",
                    title: "Error de conexión",
                    text: "Ocurrió un error al comunicarse con el servidor."
                });
            },

            complete: function () {
                $btn.prop("disabled", false).text(textoOriginal);
            }
        });

    });

}