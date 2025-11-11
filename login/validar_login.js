$(document).ready(function() {
    
    // Toggle para mostrar/ocultar contraseña SOLO en el login
    $('.login-form .toggle-password').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const input = $(this).siblings('input[name="password"]');
        const icon = $(this).find('i');
        
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('bi-eye').addClass('bi-eye-slash');
        } else {
            input.attr('type', 'password');
            icon.removeClass('bi-eye-slash').addClass('bi-eye');
        }
    });

    // Enviar formulario de login
    $('.login-form').submit(function(e) {
        e.preventDefault();
        
        const email = $('input[name="email"]').val();
        const password = $('input[name="password"]').val();
        const submitBtn = $('.login-button');
        const btnOriginal = submitBtn.html();
        
        // Deshabilitar botón y mostrar loading
        submitBtn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Iniciando...');
        
        $.ajax({
            url: 'validar_login.php',
            type: 'POST',
            data: {
                email: email,
                password: password
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    // Login exitoso
                    Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: response.message,
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.href = response.redirect;
                    });
                } else {
                    // Error en login
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message,
                        confirmButtonText: 'Intentar de nuevo'
                    });
                    submitBtn.prop('disabled', false).html(btnOriginal);
                }
            },
            error: function() {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo conectar con el servidor',
                    confirmButtonText: 'Aceptar'
                });
                submitBtn.prop('disabled', false).html(btnOriginal);
            }
        });
    });
});
