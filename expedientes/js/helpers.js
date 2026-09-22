$(document).ready(function () {

    function mostrarAlerta(titulo, mensaje, tipo) {
        Swal.fire({ title: titulo, text: mensaje, icon: tipo, confirmButtonColor: '#198754', confirmButtonText: 'Aceptar' });
    }

    function confirmarAccion(titulo, texto, callback) {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        }).then((r) => { if (r.isConfirmed) callback(); });
    }

    window.expedienteHelpers = {
        mostrarAlerta: mostrarAlerta,
        confirmarAccion: confirmarAccion
    };
});
