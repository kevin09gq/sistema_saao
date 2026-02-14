$(document).ready(function () {
    getAreas();
    registrarArea();
    mostrarImagenArea();
    eliminarArea();
    editarArea();
    buscarAreas();
    cancelarArea(); // 
});


// Se Obtienen las áreas
function getAreas() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerAreas.php",
        success: function (response) {
            if (!response.error) {
                let areas = JSON.parse(response);
                let opciones = ``;

                // Agregamos un contador para mostrar números secuenciales
                let contador = 1;

                areas.forEach((element) => {
                    opciones += `
                                <tr id="area-row-${element.id_area}" data-id="${element.id_area}">
                                    <td>${contador}</td>
                                    <td>${element.nombre_area}</td>
                                    <td>
                                        <button class="btn btn-sm btn-edit btn-edit-area" id="btn-edit-area-${element.id_area}" data-id="${element.id_area}" title="Editar"><i class="bi bi-pencil"></i></button>
                                        <button class="btn btn-sm btn-image btn-image-area" id="btn-image-area-${element.id_area}" data-id="${element.id_area}" title="Cambiar imagen"><i class="bi bi-image"></i></button>
                                        <button class="btn btn-sm btn-delete btn-delete-area" id="btn-delete-area-${element.id_area}" data-id="${element.id_area}" title="Eliminar"><i class="bi bi-trash"></i></button>
                                    </td>
                                </tr>   
                        `;

                    // Incrementamos el contador para la siguiente área
                    contador++;
                });
                $("#areas-tbody").html(opciones);
            }
        }
    });
}

// Función para mostrar la imagen del área en un modal Bootstrap
function mostrarImagenArea() {
    $(document).on("click", ".btn-image-area", function() {
        let idArea = $(this).data("id");
        let nombreArea = $(this).closest("tr").find("td:eq(1)").text();

        $.ajax({
            type: "POST",
            url: "../php/configuration.php",
            data: {
                accion: "obtenerImagenArea",
                id_area: idArea
            },
            success: function(response) {
                try {
                    let data = JSON.parse(response);

                    if (data.error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message || 'No se pudo obtener la información del área',
                            confirmButtonColor: '#ef4444'
                        });
                        return;
                    }

                    let logoArea = data.logo_area;
                    if (!logoArea || logoArea.trim() === '') {
                        // Solo mostrar el modal con mensaje y NO mostrar ni buscar imagen
                        $("#modalAreaTitle").text("Imagen del Área: " + nombreArea);
                        $("#modalAreaImage").hide();
                        $("#modalAreaFooter").text("No hay imagen registrada para esta área");
                        $("#modalAreaImagen").modal("show");
                        return; // Detener aquí, no buscar imagen
                    }

                    // Si hay imagen, mostrarla normalmente
                    let rutaImagen = rutaRaiz + "gafetes/logos_area/" + logoArea;
                    $("#modalAreaTitle").text("Imagen del Área: " + nombreArea);
                    $("#modalAreaImage").attr("src", rutaImagen).show();
                    $("#modalAreaImage").attr("alt", "Imagen del área " + nombreArea);
                    $("#modalAreaFooter").text("");
                    $("#modalAreaImagen").modal("show");

                    // Manejar error si la imagen no se puede cargar
                    $("#modalAreaImage").off("error").on("error", function() {
                        $(this).hide();
                        $("#modalAreaFooter").text("No se encontró imagen para esta área");
                    });

                } catch (e) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al procesar la información del área',
                        confirmButtonColor: '#ef4444'
                    });
                }
            },
            error: function() {
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

// Función para registrar un área nueva
function registrarArea() {
    $("#areaForm").submit(function (e) {
        e.preventDefault();
        
        // Crear un objeto FormData para manejar la carga de archivos
        let formData = new FormData(this);
        
        // Obtener los valores del formulario
        let idArea = $("#area_id").val().trim();
        let nombreArea = $("#nombre_area").val().trim();
        let accion = idArea ? "actualizarArea" : "registrarArea";
        
        // Agregar la acción al FormData
        formData.append("accion", accion);
        
        if (nombreArea != "") {
            $.ajax({
                type: "POST",
                url: "../php/configuration.php",
                data: formData,
                contentType: false,
                processData: false,
                cache: false,
                success: function (response) {
                    if (response.trim() == "1") {
                        // Operación exitosa
                        // Resetear el formulario
                        resetearFormulario();
                        // Recargar la lista de áreas
                        getAreas();
                        
                        getObtenerAreasSelect();
                        
                        // Mostrar mensaje de éxito con SweetAlert2
                        let mensaje = accion === "registrarArea" ? 
                            "Área registrada correctamente" : 
                            "Área actualizada correctamente";
                        
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
                error: function() {
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
                text: 'Ingrese un nombre para el área',
                confirmButtonColor: '#eab308'
            });
        }
    });
    
    // Vista previa de la imagen
    $("#imagen_area").change(function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $("#preview_imagen_area").attr('src', e.target.result);
                $("#area-image-preview").show();
            }
            reader.readAsDataURL(file);
        }
    });
    
    // Eliminar imagen
    $("#btn-remove-area-image").click(function() {
        $("#imagen_area").val('');
        $("#preview_imagen_area").attr('src', '');
        $("#area-image-preview").hide();
    });
}

// Función para resetear el formulario a su estado inicial
function resetearFormulario() {

    alert("Hola desde areas")

    $("#area_id").val('');
    $("#nombre_area").val('');
    $("#imagen_area").val('');
    $("#preview_imagen_area").attr('src', '');
    $("#area-image-preview").hide();
    $("#btn-guardar-area").html('<i class="fas fa-save"></i> Guardar');
}

function eliminarArea() {
    $(document).on("click", ".btn-delete-area", function() {
        let idArea = $(this).data("id");
        let nombreArea = $(this).closest("tr").find("td:eq(1)").text();

        Swal.fire({
            icon: 'question',
            title: '¿Eliminar área?',
            text: '¿Seguro que deseas eliminar el área "' + nombreArea + '"? Los empleados asociados serán actualizados.',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../php/configuration.php",
                    data: {
                        accion: "eliminarArea",
                        id_area: idArea
                    },
                    success: function(response) {
                        let resultado = response.trim();
                        if (resultado == "1") {
                            Swal.fire({
                                icon: 'success',
                                title: 'Área eliminada',
                                text: 'El área se ha eliminado correctamente',
                                confirmButtonColor: '#22c55e'
                            });
                            getAreas();
                            getObtenerAreasSelect();
                        } else if (resultado == "2") {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo eliminar el área',
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
                    error: function() {
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

// NUEVA FUNCIÓN PARA EDITAR ÁREA
function editarArea() {
    $(document).on("click", ".btn-edit-area", function() {
        let idArea = $(this).data("id");
        $.ajax({
            type: "POST",
            url: "../php/configuration.php",
            data: {
                accion: "obtenerInfoArea",
                id_area: idArea
            },
            success: function(response) {
                try {
                    let data = JSON.parse(response);
                    if (data.error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message || 'No se pudo obtener la información del área',
                            confirmButtonColor: '#ef4444'
                        });
                        return;
                    }
                    $("#area_id").val(data.id_area);
                    $("#nombre_area").val(data.nombre_area);

                    if (data.logo_area && data.logo_area.trim() !== "") {
                        let rutaImagen = rutaRaiz + "gafetes/logos_area/" + data.logo_area;
                        $("#preview_imagen_area").attr('src', rutaImagen);
                        $("#area-image-preview").show();
                        $("#btn-remove-area-image").show().data("area-id", data.id_area); // Mostrar botón eliminar imagen
                    } else {
                        $("#preview_imagen_area").attr('src', '');
                        $("#area-image-preview").hide();
                        $("#btn-remove-area-image").hide().data("area-id", ""); // Ocultar botón eliminar imagen
                    }
                    $("#btn-guardar-area").html('<i class="fas fa-save"></i> Actualizar');
                } catch (e) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al procesar la información del área',
                        confirmButtonColor: '#ef4444'
                    });
                }
            },
            error: function() {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor',
                    confirmButtonColor: '#ef4444'
                });
            }
        });
    });

    // Eliminar solo la imagen del área (cuando está editando)
    $(document).on("click", "#btn-remove-area-image", function() {
        let areaId = $(this).data("area-id");
        if (!areaId) {
            // Si no está editando, solo limpia la vista previa local
            $("#imagen_area").val('');
            $("#preview_imagen_area").attr('src', '');
            $("#area-image-preview").hide();
            return;
        }
        Swal.fire({
            icon: 'question',
            title: '¿Eliminar imagen?',
            text: '¿Seguro que deseas eliminar la imagen de esta área?',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../php/configuration.php",
                    data: {
                        accion: "eliminarImagenArea",
                        id_area: areaId
                    },
                    success: function(response) {
                        let resultado = response.trim();
                        if (resultado == "1") {
                            $("#preview_imagen_area").attr('src', '');
                            $("#area-image-preview").hide();
                            $("#btn-remove-area-image").hide().data("area-id", "");
                            Swal.fire({
                                icon: 'success',
                                title: 'Imagen eliminada',
                                text: 'La imagen del área ha sido eliminada correctamente',
                                confirmButtonColor: '#22c55e'
                            });
                            getAreas();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo eliminar la imagen',
                                confirmButtonColor: '#ef4444'
                            });
                        }
                    },
                    error: function() {
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

// FUNCIÓN PARA BUSCAR ÁREAS EN LA TABLA
function buscarAreas() {
    $("#search-areas").on("keyup", function() {
        let valor = $(this).val().toLowerCase();
        $("#areas-tbody tr").filter(function() {
            $(this).toggle($(this).find("td:eq(1)").text().toLowerCase().indexOf(valor) > -1);
        });
    });
}

// FUNCIÓN PARA LIMPIAR EL FORMULARIO AL CANCELAR
function cancelarArea() {
    $("#btn-cancelar-area").on("click", function() {
        resetearFormulario();
    });
}