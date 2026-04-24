$(document).ready(function () {
    getPrecios();
    registrarPrecio();
    eliminarPrecio();
    editarPrecio();
    buscarPrecio();
    cancelarPrecio();
    syncColorCajas();
});

// Obtener la lista de precios
function getPrecios() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerPreciosCajas.php",
        success: function (response) {
            try {
                let precios = JSON.parse(response);
                let contenido = ``;
                let contador = 1;

                precios.forEach((element) => {
                    contenido += `
                        <tr id="precio-row-${element.id_precio_caja}">
                            <td>${contador}</td>
                            <td><span class="badge ${element.tipo === 'CALIBRE' ? 'bg-primary' : 'bg-info'}">${element.tipo}</span></td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <div style="width: 20px; height: 20px; border-radius: 50%; background-color: ${element.color_hex}; border: 1px solid #ddd;"></div>
                                    <span>${element.color_hex}</span>
                                </div>
                            </td>
                            <td>${element.valor}</td>
                            <td>$${parseFloat(element.precio).toFixed(2)}</td>
                            <td>
                                <button class="btn btn-sm btn-edit btn-edit-precio" data-id="${element.id_precio_caja}" title="Editar"><i class="bi bi-pencil"></i></button>
                                <button class="btn btn-sm btn-delete btn-delete-precio" data-id="${element.id_precio_caja}" title="Eliminar"><i class="bi bi-trash"></i></button>
                            </td>
                        </tr>
                    `;
                    contador++;
                });

                if (precios.length === 0) {
                    contenido = '<tr><td colspan="5" class="text-center">No hay precios registrados</td></tr>';
                }

                $("#precios-tbody").html(contenido);
            } catch (e) {
                console.error("Error al parsear precios:", e, response);
            }
        }
    });
}

// Registrar o actualizar precio
function registrarPrecio() {
    $("#precioCajaForm").submit(function (e) {
        e.preventDefault();

        let formData = new FormData(this);
        let idPrecio = $("#precio_id").val().trim();
        let accion = idPrecio ? "actualizarPrecio" : "registrarPrecio";

        formData.append("accion", accion);

        $.ajax({
            type: "POST",
            url: "../php/configPreciosCajas.php",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                let res = response.trim();
                if (res === "1") {
                    resetearFormularioPrecio();
                    getPrecios();
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: idPrecio ? 'Precio actualizado correctamente' : 'Precio registrado correctamente',
                        confirmButtonColor: '#22c55e'
                    });
                } else if (res === "3") {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Atención',
                        text: 'Este valor ya se encuentra registrado para este tipo.',
                        confirmButtonColor: '#eab308'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo procesar la operación',
                        confirmButtonColor: '#ef4444'
                    });
                }
            },
            error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor',
                    confirmButtonColor: '#ef4444'
                });
            }
        });
    });
}

function resetearFormularioPrecio() {
    $("#precioCajaForm").trigger("reset");
    $("#precio_id").val("");
    $("#color_hex_caja").val("#000000");
    $("#color_picker_caja").val("#000000");
    $("#btn-guardar-precio").html('<i class="bi bi-save"></i> Guardar');
}

function eliminarPrecio() {
    $(document).on("click", ".btn-delete-precio", function () {
        let id = $(this).data("id");

        Swal.fire({
            icon: 'question',
            title: '¿Eliminar?',
            text: '¿Seguro que deseas eliminar este precio? Esta acción es irreversible.',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../php/configPreciosCajas.php",
                    data: {
                        accion: "eliminarPrecio",
                        id_precio_caja: id
                    },
                    success: function (response) {
                        if (response.trim() === "1") {
                            Swal.fire({
                                icon: 'success',
                                title: 'Eliminado',
                                text: 'El registro fue eliminado con éxito.',
                                confirmButtonColor: '#22c55e'
                            });
                            getPrecios();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo eliminar el registro',
                                confirmButtonColor: '#ef4444'
                            });
                        }
                    }
                });
            }
        });
    });
}

function editarPrecio() {
    $(document).on("click", ".btn-edit-precio", function () {
        let id = $(this).data("id");
        $.ajax({
            type: "POST",
            url: "../php/configPreciosCajas.php",
            data: {
                accion: "obtenerInfoPrecio",
                id_precio_caja: id
            },
            success: function (response) {
                try {
                    let data = JSON.parse(response);
                    if (data.error) throw new Error(data.message);

                    $("#precio_id").val(data.id_precio_caja);
                    $("#tipo_precio").val(data.tipo);
                    $("#valor_caja").val(data.valor);
                    $("#precio_caja").val(data.precio);
                    $("#color_hex_caja").val(data.color_hex);
                    $("#color_picker_caja").val(data.color_hex);

                    $("#btn-guardar-precio").html('<i class="bi bi-pencil-square"></i> Actualizar');

                    // Hacer scroll al formulario
                    $('html, body').animate({
                        scrollTop: $("#precioCajaForm").offset().top - 100
                    }, 200);

                } catch (e) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo cargar la información'
                    });
                }
            }
        });
    });
}

function buscarPrecio() {
    $("#search-precios").on("keyup", function () {
        let valor = $(this).val().toLowerCase();
        $("#precios-tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(valor) > -1);
        });
    });
}

function cancelarPrecio() {
    $("#btn-cancelar-precio").on("click", function () {
        resetearFormularioPrecio();
    });
}

function syncColorCajas() {
    // Sincronizar selector de color -> input de texto
    $("#color_picker_caja").on("input", function () {
        $("#color_hex_caja").val($(this).val().toUpperCase());
    });

    // Sincronizar input de texto -> selector de color
    $("#color_hex_caja").on("input", function () {
        let color = $(this).val();
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            $("#color_picker_caja").val(color);
        }
    });
}
