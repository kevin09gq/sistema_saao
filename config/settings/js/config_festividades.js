$(document).ready(function () {
    getFestividades();
    registrarFestividad();
    eliminarFestividad();
    editarFestividad();
    buscarFestividad();
    cancelarFestividad();
});


// Se Obtienen las áreas
function getFestividades() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerFestividades.php",
        success: function (response) {
            if (!response.error) {
                let turnos = JSON.parse(response);
                let opciones = ``;

                // Agregamos un contador para mostrar números secuenciales
                let contador = 1;

                turnos.forEach((element) => {
                    opciones += `
                                <tr id="festividad-row-${element.id_festividad}" data-id="${element.id_festividad}">
                                    <td>${contador}</td>
                                    <td>${element.nombre}</td>
                                    <td>${element.fecha_vista}</td>
                                    <td>
                                        <button class="btn btn-sm btn-edit btn-edit-festividad" id="btn-edit-festividad-${element.id_festividad}" data-id="${element.id_festividad}" title="Editar"><i class="bi bi-pencil"></i></button>
                                        <button class="btn btn-sm btn-delete btn-delete-festividad" id="btn-delete-festividad-${element.id_festividad}" data-id="${element.id_festividad}" title="Eliminar"><i class="bi bi-trash"></i></button>
                                    </td>
                                </tr>   
                        `;

                    // Incrementamos el contador para la siguiente área
                    contador++;
                });
                $("#festividades-tbody").html(opciones);
            }
        }
    });
}

// Función para registrar un área nueva
function registrarFestividad() {
    $("#festividadForm").submit(function (e) {
        e.preventDefault();

        // Crear un objeto FormData para manejar la carga de archivos
        let formData = new FormData(this);

        // Obtener los valores del formulario
        let idFestividad = $("#festividad_id").val().trim();
        let nombre_festividad = $("#nombre_festividad").val().trim();
        let fecha_festividad = $("#fecha_festividad").val().trim();

        let accion = idFestividad ? "actualizarFestividad" : "registrarFestividad";

        // Agregar la acción al FormData
        formData.append("accion", accion);

        if (nombre_festividad != "" && fecha_festividad != "") {
            $.ajax({
                type: "POST",
                url: "../php/configFestividades.php",
                data: formData,
                contentType: false,
                processData: false,
                cache: false,
                success: function (response) {
                    if (response.trim() == "1") {
                        // Operación exitosa
                        // Resetear el formulario
                        resetearFormularioFestividades();
                        // Recargar la lista de áreas
                        getFestividades();

                        // Mostrar mensaje de éxito con SweetAlert2
                        let mensaje = accion === "registrarFestividad" ?
                            "El registro fue exitoso" :
                            "La información se actualizó con exito";

                        Swal.fire({
                            icon: 'success',
                            title: 'Éxito',
                            text: mensaje,
                            confirmButtonColor: '#22c55e'
                        });
                    } else {
                        // Mostrar mensaje de error con SweetAlert2
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
        } else {
            // Mostrar mensaje de advertencia con SweetAlert2
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Debe completar todo el formulario.',
                confirmButtonColor: '#eab308'
            });
        }
    });
}

// Función para resetear el formulario a su estado inicial
function resetearFormularioFestividades() {
    $("#festividadForm").trigger("reset");
    $("#btn-guardar-festividad").html('<i class="bi bi-save"></i> Guardar');
}

function eliminarFestividad() {
    $(document).on("click", ".btn-delete-festividad", function () {
        let idFestividad = $(this).data("id");
        let descripcion = $(this).closest("tr").find("td:eq(1)").text();

        Swal.fire({
            icon: 'question',
            title: '¿Eliminar?',
            text: '¿Seguro que deseas eliminar "' + descripcion + '"? Esta acción es irreversible.',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../php/configFestividades.php",
                    data: {
                        accion: "eliminarFestividad",
                        id_festividad: idFestividad
                    },
                    success: function (response) {
                        let resultado = response.trim();
                        if (resultado == "1") {
                            Swal.fire({
                                icon: 'success',
                                title: 'Eliminado',
                                text: 'Información eliminada con exito.',
                                confirmButtonColor: '#22c55e'
                            });
                            getFestividades();
                        } else if (resultado == "2") {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo eliminar',
                                confirmButtonColor: '#ef4444'
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Ocurrió un problema: ' + response,
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
            }
        });
    });
}

// NUEVA FUNCIÓN PARA EDITAR TURNO
function editarFestividad() {
    $(document).on("click", ".btn-edit-festividad", function () {
        let idFestividad = $(this).data("id");
        $.ajax({
            type: "POST",
            url: "../php/configFestividades.php",
            data: {
                accion: "obtenerInfoFestividad",
                id_festividad: idFestividad
            },
            success: function (response) {
                try {
                    let data = JSON.parse(response);
                    if (data.error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message || 'No se pudo obtener la información del turno',
                            confirmButtonColor: '#ef4444'
                        });
                        return;
                    }

                    $("#festividad_id").val(data.id_festividad);
                    $("#nombre_festividad").val(data.nombre);
                    $("#fecha_festividad").val(data.fecha);
                    $("#tipo_festividad").val(data.tipo);
                    $("#observacion").val(data.observacion);

                    $("#btn-guardar-festividad").html('<i class="fas fa-save"></i> Actualizar');

                } catch (e) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al procesar la información',
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

// FUNCIÓN PARA BUSCAR TUNROS EN LA TABLA
function buscarFestividad() {
    $("#search-festividades").on("keyup", function () {
        let valor = $(this).val().toLowerCase();
        $("#festividades-tbody tr").filter(function () {
            $(this).toggle($(this).find("td:eq(1)").text().toLowerCase().indexOf(valor) > -1);
        });
    });
}

// FUNCIÓN PARA LIMPIAR EL FORMULARIO AL CANCELAR
function cancelarFestividad() {
    $("#btn-cancelar-festividad").on("click", function () {
        resetearFormularioFestividades()
    });
}