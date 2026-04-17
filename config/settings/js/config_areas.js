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
                                        <button
                                            class="btn btn-sm btn-success btn_ver_dep_area"
                                            data-id="${element.id_area}"
                                            data-nombre="${element.nombre_area}"
                                            title="Ver Departamentos del Área"><i class="bi bi-diagram-3-fill"></i></button>

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
    $(document).on("click", ".btn-image-area", function () {
        let idArea = $(this).data("id");
        let nombreArea = $(this).closest("tr").find("td:eq(1)").text();

        $.ajax({
            type: "POST",
            url: "../php/configAreas.php",
            data: {
                accion: "obtenerImagenArea",
                id_area: idArea
            },
            success: function (response) {
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
                    $("#modalAreaImage").off("error").on("error", function () {
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
                url: "../php/configAreas.php",
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
                text: 'Ingrese un nombre para el área',
                confirmButtonColor: '#eab308'
            });
        }
    });

    // Vista previa de la imagen
    $("#imagen_area").change(function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $("#preview_imagen_area").attr('src', e.target.result);
                $("#area-image-preview").show();
            }
            reader.readAsDataURL(file);
        }
    });

    // Eliminar imagen
    $("#btn-remove-area-image").click(function () {
        $("#imagen_area").val('');
        $("#preview_imagen_area").attr('src', '');
        $("#area-image-preview").hide();
    });
}

// Función para resetear el formulario a su estado inicial
function resetearFormulario() {
    $("#area_id").val('');
    $("#nombre_area").val('');
    $("#imagen_area").val('');
    $("#preview_imagen_area").attr('src', '');
    $("#area-image-preview").hide();
    $("#btn-guardar-area").html('<i class="fas fa-save"></i> Guardar');
}

function eliminarArea() {
    $(document).on("click", ".btn-delete-area", function () {
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
                    url: "../php/configAreas.php",
                    data: {
                        accion: "eliminarArea",
                        id_area: idArea
                    },
                    success: function (response) {
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
                            // Actualizar la tabla de departamentos si existe
                            if (typeof getDepartamentos === 'function') {
                                getDepartamentos();
                            }
                            if (typeof getObtenerDepartamentosSelect === 'function') {
                                getObtenerDepartamentosSelect();
                            }
                            // Actualizar la tabla de ranchos si existe
                            if (typeof obtenerInfoRanchos === 'function') {
                                obtenerInfoRanchos();
                            }
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

// NUEVA FUNCIÓN PARA EDITAR ÁREA
function editarArea() {
    $(document).on("click", ".btn-edit-area", function () {
        let idArea = $(this).data("id");
        $.ajax({
            type: "POST",
            url: "../php/configAreas.php",
            data: {
                accion: "obtenerInfoArea",
                id_area: idArea
            },
            success: function (response) {
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

    // Eliminar solo la imagen del área (cuando está editando)
    $(document).on("click", "#btn-remove-area-image", function () {
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
                    url: "../php/configAreas.php",
                    data: {
                        accion: "eliminarImagenArea",
                        id_area: areaId
                    },
                    success: function (response) {
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

// FUNCIÓN PARA BUSCAR ÁREAS EN LA TABLA
function buscarAreas() {
    $("#search-areas").on("keyup", function () {
        let valor = $(this).val().toLowerCase();
        $("#areas-tbody tr").filter(function () {
            $(this).toggle($(this).find("td:eq(1)").text().toLowerCase().indexOf(valor) > -1);
        });
    });
}

// FUNCIÓN PARA LIMPIAR EL FORMULARIO AL CANCELAR
function cancelarArea() {
    $("#btn-cancelar-area").on("click", function () {
        resetearFormulario();
    });
}

/**
 * ============================================================================
 * ASIGNAR LOS DEPARTAMENTOS A CADA ÁREA
 * ============================================================================
 * ============================================================================
 */

// Modal para ver los departamentos asignados a cada área
const modal_departamentos_area = new bootstrap.Modal(document.getElementById('modal_departamentos_area'));


/**
 * Evento para mostrar el modal
 */
$(document).on('click', '.btn_ver_dep_area', function (e) {
    e.preventDefault();

    // Limpiar modal antes de mostrarlo
    $('#nombre_area_detalle_dep').text('');
    $('#id_area_modal_dep').val('');
    $('#tbody_dep_area').html('');

    // Recuperar el ID y NOMBRE del área desde el boton
    let id_area = $(this).data("id");
    let nombre_area = $(this).data("nombre");

    // Llenar el titulo del modal
    $('#nombre_area_detalle_dep').text(nombre_area);
    $('#id_area_modal_dep').val(id_area);

    // Llenar el select con los departamentos disponibles
    llenar_select_dep_area();

    // Llenar el tbody con los departamentos asignados a esta área
    llenar_tbody_dep_area(id_area);

    // Llenar la tabla con los departamentos asignados a esta área

    // Mostrar el modal
    modal_departamentos_area.show();
});

// Función para llenar el select de departamentos en el modal de áreas
function llenar_select_dep_area() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerDepartamentos.php",
        dataType: "json",
        success: function (response) {

            let tmp = `<option value="">Selecciona un departamento</option>`;

            response.forEach(element => {
                tmp += `<option value="${element.id_departamento}">${element.nombre_departamento}</option>`;
            });

            $('#select_dep_area').html(tmp);
            $('#select_depa_puesto').html(tmp);
        }
    });
}

// Función para llenar el tbody con los departamentos asignados a esta área
function llenar_tbody_dep_area(id_area) {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerDepartamentos.php",
        data: { id_area: id_area },
        dataType: "json",
        success: function (response) {
            let tmp = '';
            let contador = 1;
            if (response.length === 0) {
                tmp = `<tr><td colspan="3" class="text-center">No hay departamentos asignados a esta área</td></tr>`;
            } else {
                response.forEach(element => {
                    tmp += `<tr>
                            <td>${contador++}</td>
                            <td>${element.nombre_departamento}</td>
                            <td>
                                <button
                                    class="btn btn-outline-danger btn-sm btn_eliminar_dep_area"
                                    data-dep="${element.id_departamento}"
                                    data-area="${id_area}">
                                    <i class="bi bi-trash-fill"></i>
                                </button>
                            </td>
                        </tr>`;
                });
            }

            $('#tbody_dep_area').html(tmp);
        }
    });
}

// Evento para agregar un departamento a un área
$(document).on('click', '#btn_agregar_dep_area', function (e) {
    e.preventDefault();

    let id_area = $('#id_area_modal_dep').val();
    let id_departamento = $('#select_dep_area').val();

    if (id_area == "" || id_departamento == "") {
        Swal.fire({
            title: "Campos incompletos",
            text: "Debe seleccionar un departamento",
            icon: "info"
        });
        return;
    }

    $.ajax({
        type: "POST",
        url: "../php/configAreas.php",
        data: {
            accion: "registrarAreaDepartamento",
            id_area: id_area,
            id_departamento: id_departamento
        },
        dataType: "json",
        success: function (response) {
            alerta(response.titulo, response.mensaje, response.icono);
            // Volver a llenar el tbody para los cambios
            llenar_tbody_dep_area(id_area);
        },
        error: function (xhr, status, error) {
            // Capturar la respuesta
            let dtata = JSON.parse(xhr.responseText);
            // Alerta
            alerta(dtata.titulo, dtata.mensaje, dtata.icono);
        }
    });

});

// Evento para eliminar la relación entre un departamento y un área
$(document).on('click', '.btn_eliminar_dep_area', function (e) {
    e.preventDefault();

    let id_area = $(this).data("area");
    let id_departamento = $(this).data("dep");

    Swal.fire({
        title: "Eliminar relación área-departamento",
        text: "El departamento dejará de estar asignado a esta área, ¿desea continuar?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#d23232",
        cancelButtonColor: "rgb(30, 27, 38)",
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "POST",
                url: "../php/configAreas.php",
                data: {
                    accion: "eliminarAreasDepartamentos",
                    id_area: id_area,
                    id_departamento: id_departamento
                },
                success: function (response) {
                    alerta(response.titulo, response.mensaje, response.icono);
                    // Volver a llenar el tbody para los cambios
                    llenar_tbody_dep_area(id_area);
                },
                error: function (xhr, status, error) {
                    // Capturar la respuesta
                    let dtata = JSON.parse(xhr.responseText);
                    // Alerta
                    alerta(dtata.titulo, dtata.mensaje, dtata.icono);
                }
            });
        }
    });
});