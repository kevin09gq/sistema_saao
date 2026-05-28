
/**
 * EVENTO PARA BORRAR EL REGISTRO DE PTU
 */
$(document).on('click', '.btn_borrar', function (e) {
    e.preventDefault();
    // OBTENER EL ID DEL AGUINALDO A BORRAR
    const id_utilidad = $(this).data('id');

    Swal.fire({
        title: "¿Borrar registros?",
        text: "¡No podrás revertir esto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d63030",
        cancelButtonColor: "#24123B",
        confirmButtonText: "Sí, borrar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            borrar_utilidad(id_utilidad);
        }
    });
});

/**
 * Función para borrar un aguinaldo del historial
 * @param {Number} id_utilidad ID de la utilidad a borrar 
 */
function borrar_utilidad(id_utilidad) {
    $.ajax({
        type: "POST",
        url: `${RUTA_RAIZ}/reparto_utilidades/php/utilidades.php`,
        data: {
            accion: 'borrar_utilidad',
            id_utilidad: id_utilidad
        },
        dataType: "json",
        success: function (response) {

            Swal.fire({
                title: response.titulo,
                text: response.texto,
                icon: response.icono,
                confirmButtonColor: "#24123B",
                confirmButtonText: "Entendido"
            });

            obtener_utilidades_historial();

        },
        error: function (xhr, status, error) {
            console.error("Error al borrar la utilidad:", error);
            let response = JSON.parse(xhr.responseText);
            Swal.fire({
                title: response.titulo,
                text: response.texto + '. Contacta a sistemas.',
                icon: response.icono,
                confirmButtonColor: "#24123B",
                confirmButtonText: "Entendido"
            });
        }
    });
}