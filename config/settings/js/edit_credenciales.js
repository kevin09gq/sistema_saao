$(document).ready(function() {
    
    // Cargar datos al abrir la pestaña
    $('#usuario-tab').on('shown.bs.tab', function() {
        cargarDatos();
    });

    // Enviar formulario
    $('#formUsuario').submit(function(e) {
        e.preventDefault();
        guardarDatos();
    });

    // Toggle para mostrar/ocultar contraseña actual
    $('#togglePasswordActual').click(function() {
        const input = $('#password_actual');
        const icon = $(this).find('i');
        
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('bi-eye').addClass('bi-eye-slash');
        } else {
            input.attr('type', 'password');
            icon.removeClass('bi-eye-slash').addClass('bi-eye');
        }
    });

    // Toggle para mostrar/ocultar contraseña nueva
    $('#togglePasswordNueva').click(function() {
        const input = $('#password_nueva');
        const icon = $(this).find('i');
        
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('bi-eye').addClass('bi-eye-slash');
        } else {
            input.attr('type', 'password');
            icon.removeClass('bi-eye-slash').addClass('bi-eye');
        }
    });

    // Función para cargar datos
    function cargarDatos() {
        $.ajax({
            url: '../php/edit_credenciales.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    $('#correo').val(response.correo);
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            }
        });
    }

    // Función para guardar datos
    function guardarDatos() {
        var correo = $('#correo').val();
        var password_actual = $('#password_actual').val();
        var password_nueva = $('#password_nueva').val();

        // Validar que se ingrese la contraseña actual
        if (!password_actual) {
            Swal.fire('Error', 'Debes ingresar tu contraseña actual', 'error');
            return;
        }

        $.ajax({
            url: '../php/edit_credenciales.php',
            type: 'POST',
            data: {
                correo: correo,
                password_actual: password_actual,
                password_nueva: password_nueva
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    Swal.fire('Éxito', response.message, 'success');
                    $('#password_actual').val(''); // Limpiar contraseñas
                    $('#password_nueva').val('');
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'No se pudo guardar la información', 'error');
            }
        });
    }
});
