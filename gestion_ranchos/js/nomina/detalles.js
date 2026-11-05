
// EVENTO: ABRIR EL MODAL DE DETALLES
$(document).on('click', '.btn_ver_detalles', function (e) {
    e.preventDefault();

    // Obtener los datos del botón
    const id = $(this).data('id');
    const nombreCortador = $(this).data('cabo');
    const nomina = $(this).data('nomina');
    const total = $(this).data('total');
    const detalles = $(this).data('detalles');

    // Pasar los datos al modal
    $('#label_detalle_corte').text(id);
    $('#label_detalle_cortador').text(nombreCortador);
    $('#label_detalle_nomina').text(nomina);
    $('#label_detalle_total').text(formatoMoneda(total));

    // Limpiar la tabla antes de llenarla
    $('#cuerpo_tabla_detalles_corte').empty();

    // Llenar la tabla con los detalles
    detalles.forEach(detalle => {
        const fila = `
            <tr>
                <td class="text-center">${detalle.dia}</td>
                <td class="text-center">${formatearFechaEspa(detalle.fecha)}</td>
                <td class="text-center fw-bold">${formatoMoneda(detalle.pago)}</td>
            </tr>
        `;
        $('#cuerpo_tabla_detalles_corte').append(fila);
    });

    modal_detalles_corte.show();
});