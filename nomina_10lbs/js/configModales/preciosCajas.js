$(document).ready(function () {
    // Escuchar el clic en el botón para abrir el modal de precios
    $("#btn_precios_cajas").on("click", function () {
        $("#modalPrecioCajas").modal("show");
        mostrarTiposCajas();
    });

    // Guardar los cambios realizados en el modal
    $("#btn_guardar_precios_cajas").on("click", function () {
        modficarPropiedades();
    });
});

// Función para cargar los precios de las cajas desde la base de datos al objeto global jsonNomina10lbs
function cargarPreciosCajasJson(jsonNomina10lbs) {
    if (!jsonNomina10lbs) return;

    $.ajax({
        type: "GET",
        url: "../../public/php/obtenerPreciosCajas.php",
        dataType: "json",
        success: function (precios) {
            // Mapeamos los datos para guardarlos en la propiedad precio_cajas del JSON global
            jsonNomina10lbs.precio_cajas = precios.map(item => ({
                valor: item.valor,
                precio: item.precio,
                color: item.color_hex,
                utilidad: true // Por defecto habilitados
            }));
            console.log("Precios de cajas cargados exitosamente.");
        },
        error: function (err) {
            console.error("Error al obtener los precios de las cajas:", err);
        }
    });
}

// Función para renderizar la lista de precios en el modal
function mostrarTiposCajas() {
    const $tbody = $('#tbody_precios_edicion');
    $tbody.empty();

    if (jsonNomina10lbs && Array.isArray(jsonNomina10lbs.precio_cajas)) {
        jsonNomina10lbs.precio_cajas.forEach((caja, index) => {
            const checked = caja.utilidad ? 'checked' : '';
            const fila = `
                <tr>
                    <td class="ps-4 py-3">
                        <div class="d-flex align-items-center">
                            <div class="shadow-sm border rounded-3 p-1 me-3 d-flex justify-content-center align-items-center caja-icon-container" style="width: 40px; height: 40px;">
                                <i class="bi bi-box"></i>
                            </div>
                            <div>
                                <span class="d-block fw-bold text-dark">${caja.valor}</span>
                            </div>
                        </div>
                    </td>
                    <td class="text-center py-3">
                        <span class="precio-badge">$${parseFloat(caja.precio).toFixed(2)}</span>
                    </td>
                    <td class="text-center py-3">
                        <input type="color" class="form-control-color color-picker-simple mx-auto input-color-caja" 
                               data-index="${index}" value="${caja.color || '#000000'}" title="Cambiar color distintivo">
                    </td>
                    <td class="text-center py-3 pe-4">
                        <div class="form-check form-switch d-flex justify-content-center">
                            <input class="form-check-input switch-utilidad-caja cursor-pointer" style="width: 2.5em; height: 1.25em;" 
                                   type="checkbox" role="switch" data-index="${index}" ${checked}>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(fila);
        });
    } else {
        $tbody.html('<tr><td colspan="4" class="text-center text-muted py-5"><i class="bi bi-cloud-slash fs-2 d-block mb-2"></i>No hay datos disponibles</td></tr>');
    }
}

// Función para recolectar los cambios del modal y guardarlos en el JSON global
function modficarPropiedades() {
    if (!jsonNomina10lbs || !Array.isArray(jsonNomina10lbs.precio_cajas)) return;

    // Recorrer las filas de la tabla para obtener los valores actuales de los inputs
    $('#tbody_precios_edicion tr').each(function () {
        const $colorInput = $(this).find('.input-color-caja');
        const $utilidadSwitch = $(this).find('.switch-utilidad-caja');
        
        const index = $colorInput.data('index');
        
        if (index !== undefined) {
            // Actualizar el objeto JSON
            jsonNomina10lbs.precio_cajas[index].color = $colorInput.val();
            jsonNomina10lbs.precio_cajas[index].utilidad = $utilidadSwitch.is(':checked');
        }
    });

    // Refrescar el dropdown de selección en el modal del empleado si la función existe
    if (typeof establecerTiposCajasEmpacadas === 'function') {
        establecerTiposCajasEmpacadas();
    }

    // Cerrar modal y notificar éxito
    $("#modalPrecioCajas").modal("hide");
    
    Swal.fire({
        title: '¡Guardado!',
        text: 'Los cambios en el catálogo se han aplicado exitosamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}
