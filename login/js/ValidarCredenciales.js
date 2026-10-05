
$(document).ready(function () {

    obtenerCredenciales();

    mostrarPassword();

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