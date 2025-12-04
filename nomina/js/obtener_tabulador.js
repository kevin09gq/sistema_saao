$(document).ready(function () {
    let idEmpresa = 1;

    // Obtener tabulador
    $.ajax({
        type: "POST",
        url: "/sistema_saao/config/settings/php/tabulador.php", // <-- Ruta absoluta correcta
        data: {
            accion: "obtenerTabulador",
            id_empresa: idEmpresa
        },
        success: function (response) {
            try {
                window.data = JSON.parse(response);

                // Aquí ya puedes asignarlo a tu window.rangosHorasJson si quieres
                window.rangosHorasJson = window.data;

            } catch (e) {
            }
        },
        error: function () {
        }
    });

});

