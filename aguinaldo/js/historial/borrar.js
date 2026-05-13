
// EVENTO PARA BORRAR UN AGUINALDO
$(document).on('click', '.btn_borrar_aguinaldo', function (e) {
    e.preventDefault();
    // OBTENER EL ID DEL AGUINALDO A BORRAR
    const id_aguinaldo = $(this).data('id');

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
            borrar_aguinaldo(id_aguinaldo);
        }
    });
});

/**
 * Función para borrar un aguinaldo del historial
 * @param {Number} id_aguinaldo ID del aguinaldo a borrar 
 */
function borrar_aguinaldo(id_aguinaldo) {
    $.ajax({
        type: "POST",
        url: `${RUTA_RAIZ}/aguinaldo/php/aguinaldo.php`,
        data: {
            accion: 'borrar_aguinaldo',
            id_aguinaldo: id_aguinaldo
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

            obtener_aguinaldos_historial();

        },
        error: function (xhr, status, error) {
            console.error("Error al borrar el aguinaldo:", error);
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