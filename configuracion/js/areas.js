$(document).ready(function () {
    obtenerAreas();
    editarArea();
    agregarArea();
    guardarLogoArea();
    previsualizarNuevoLogoArea();
    sincronizarColorInputs();
});

//=========================================
// FUNCIÓN PARA OBTENER LAS ÁREAS
// MOSTRARLAS EN LA TABLA DE LA VISTA
//=========================================

function obtenerAreas() {

    $.ajax({
        type: "POST",
        url: "../php/areas.php",

        data: {
            accion: "obtenerAreas"
        },

        dataType: "json",

        success: function (response) {

            if (response.success) {

                // Limpiamos la tabla antes de agregar los datos
                $("#tablaAreas").empty();

                // Recorremos las áreas recibidas
                response.areas.forEach(function (area) {

                    // Obtener las iniciales del área
                    let iniciales = obtenerIniciales(area.nombre_area);

                    // Renderizar avatar: imagen si existe o círculo con iniciales si no existe o falla
                    let avatarHtml = area.logo_area
                        ? `<img
                                src="${rutaRaiz}public/logosAreas/${area.logo_area}"
                                alt="Logo de ${area.nombre_area}"
                                class="rounded-circle"
                                width="40"
                                height="40"
                                style="object-fit: contain;"
                                onerror="this.outerHTML='<div class=\\'avatar-iniciales\\'>${iniciales}</div>'">`
                        : `<div class="avatar-iniciales">${iniciales}</div>`;

                    // Contenedor interactivo clicable
                    let contenidoLogo = `
                        <div role="button" class="d-inline-block position-relative avatar-clickable" onclick="abrirModalActualizarLogoArea('${area.id_area}', '${area.logo_area || ''}', '${area.nombre_area}')" title="Clic para actualizar logo del área">
                            ${avatarHtml}
                        </div>
                    `;

                    // Creamos la fila
                    let fila = `
                        <tr>

                            <td class="text-center" style="width: 70px;">
                                ${contenidoLogo}
                            </td>

                            <td class="fw-semibold">
                                ${area.nombre_area}
                            </td>

                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <div class="color-preview" style="background-color: ${area.colores || '#6c757d'}; width: 24px; height: 24px; border-radius: 4px; border: 1px solid #dee2e6;"></div>
                                    <span>${area.colores || '#6c757d'}</span>
                                </div>
                            </td>

                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <div class="color-preview" style="background-color: ${area.colores_texto || '#ffffff'}; width: 24px; height: 24px; border-radius: 4px; border: 1px solid #dee2e6;"></div>
                                    <span>${area.colores_texto || '#ffffff'}</span>
                                </div>
                            </td>

                            <td class="text-end">

                                <div class="dropdown">

                                    <button 
                                        type="button"
                                        class="btn btn-sm btn-light"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        title="Acciones">

                                        <i class="bi bi-three-dots-vertical"></i>

                                    </button>

                                    <ul class="dropdown-menu dropdown-menu-end">

                                        <li>
                                            <button
                                                type="button"
                                                class="dropdown-item"
                                                onclick="abrirModalEditarArea('${area.id_area}', '${area.nombre_area}', '${area.colores || '#6c757d'}', '${area.colores_texto || '#ffffff'}')">

                                                <i class="bi bi-pencil me-2 text-primary"></i>
                                                Editar

                                            </button>
                                        </li>

                                    </ul>

                                </div>

                            </td>
                        </tr>
                    `;

                    // Agregamos la fila a la tabla
                    $("#tablaAreas").append(fila);
                });

                // Actualizar contador
                $("#contadorAreas").text(response.areas.length);

            } else {

                console.error(response.mensaje);

            }
        },

        error: function (xhr, status, error) {

            console.error("Error AJAX:", error);
            console.error(xhr.responseText);

        }
    });
}


//=========================================
// FUNCIÓN PARA ABRIR EL MODAL PARA
// EDITAR UN ÁREA
//=========================================

function abrirModalEditarArea(id_area, nombre_area, colores, colores_texto) {

    // Guardar id del área en el formulario
    $("#editarIdArea").val(id_area);

    // Asignar Nombre del área
    $("#editarNombreArea").val(nombre_area);

    // Asignar Color de fondo
    $("#editarColores").val(colores);
    $("#editarColoresText").val(colores);

    // Asignar Color de texto
    $("#editarColoresTexto").val(colores_texto);
    $("#editarColoresTextoText").val(colores_texto);

    // Mostramos el modal de edición
    $('#modalEditarArea').modal('show');
}

//=========================================
// FUNCIÓN PARA EDITAR LA INFORMACION DE 
// EL ÁREA
//=========================================

function editarArea() {

    $("#btnActualizarArea").click(function (e) {

        e.preventDefault();

        // Obtenemos los datos del formulario y lo guardammos en un objeto
        let datosArea = {
            id_area: $("#editarIdArea").val(),
            nombre_area: $("#editarNombreArea").val(),
            colores: $("#editarColores").val(),
            colores_texto: $("#editarColoresTexto").val()
        };

        // Validamos que el nombre del área no esté vacío
        if (datosArea.nombre_area == null || datosArea.nombre_area.trim() === "") {
            mostrarAlerta("error", "Error", "El nombre del área no puede estar vacío.");
            return;
        }

        // Enviamos los datos al servidor mediante AJAX
        $.ajax({
            type: "POST",
            url: "../php/areas.php",
            data: {
                datosArea: datosArea,
                accion: "editarArea"
            },
            dataType: "json",
            success: function (response) {

                if (response.success) {

                    // Mostramos un mensaje de éxito
                    mostrarAlerta("success", "Éxito", response.mensaje);

                    // Actualizamos la lista de áreas
                    obtenerAreas();

                    // Limpiamos el formulario de edición
                    limpiarFormularioEditarArea();

                    // Cerramos el modal
                    $('#modalEditarArea').modal('hide');
                }
            }
        });


    });
}

//=========================================
// FUNCIÓN PARA LIMPIAR EL FORMULARIO DE 
// EDICIÓN DE ÁREA
//=========================================

function limpiarFormularioEditarArea() {
    $("#editarIdArea").val("");
    $("#editarNombreArea").val("");
    $("#editarColores").val("#6c757d");
    $("#editarColoresText").val("#6c757d");
    $("#editarColoresTexto").val("#ffffff");
    $("#editarColoresTextoText").val("#ffffff");
}

//=========================================
// FUNCIÓN PARA LIMPIAR EL FORMULARIO DE 
// AGREGAR ÁREA
//=========================================

function limpiarFormularioAgregarArea() {
    $("#agregarNombreArea").val("");
    $("#agregarLogoArea").val("");
    $("#agregarColores").val("#6c757d");
    $("#agregarColoresText").val("#6c757d");
    $("#agregarColoresTexto").val("#ffffff");
    $("#agregarColoresTextoText").val("#ffffff");
}

//=========================================
// FUNCIÓN PARA AGREGAR UNA NUEVA ÁREA
//=========================================

function agregarArea() {
    $("#btnGuardarArea").click(function (e) {
        e.preventDefault();

        // Validamos que el nombre del área no esté vacío
        let nombre_area = $("#agregarNombreArea").val();
        if (nombre_area == null || nombre_area.trim() === "") {
            mostrarAlerta("error", "Error", "El nombre del área no puede estar vacío.");
            return;
        }

        // Creamos un objeto FormData para enviar archivos
        let formData = new FormData($("#formAgregarArea")[0]);

        // Agregamos la acción al FormData
        formData.append("accion", "agregarArea");

        // Enviamos los datos al servidor mediante AJAX
        $.ajax({
            type: "POST",
            url: "../php/areas.php",
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",
            success: function (response) {

                if (response.success) {

                    // Mostramos un mensaje de éxito
                    mostrarAlerta("success", "Éxito", response.mensaje);

                    // Actualizamos la lista de áreas
                    obtenerAreas();

                    // Limpiamos el formulario de agregado
                    limpiarFormularioAgregarArea();

                    // Cerramos el modal
                    $('#modalAgregarArea').modal('hide');
                } else {
                    mostrarAlerta("error", "Error", response.mensaje);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error AJAX:", error);
                console.error(xhr.responseText);
                mostrarAlerta("error", "Error", "Ocurrió un error al agregar el área.");
            }
        });
    });
}


//=========================================
// FUNCIÓN PARA ABRIR EL MODAL DE
// ACTUALIZAR LOGO DEL ÁREA
//=========================================

function abrirModalActualizarLogoArea(id_area, logo_area, nombre_area) {

    // Limpiar el modal antes de cargar datos
    limpiarModalLogoArea();

    // Guardar el ID del área en el formulario
    $('#formActualizarLogoArea').data('id_area', id_area);

    // Establecer la información del logo en el modal
    establecerInformacionLogoArea(logo_area, nombre_area);

    // Abrir el modal
    $('#modalActualizarLogoArea').modal('show');
}


//=========================================
// FUNCIÓN PARA ESTABLECER INFORMACIÓN DEL
// LOGO EN EL MODAL
//=========================================

function establecerInformacionLogoArea(logo_area, nombre_area) {

    // Obtener iniciales del área
    let iniciales = obtenerIniciales(nombre_area);

    // Renderizar logo si tiene o iniciales si no tiene
    if (logo_area && logo_area.trim() !== '') {

        let rutaCompleta = `${rutaRaiz}public/logosAreas/${logo_area}`;

        $('#contenedorPreviewLogoAreaModal').html(`
            <img
                src="${rutaCompleta}"
                alt="Logo del área"
                onerror="establecerInicialesModalLogoArea('${iniciales}')">
        `);

    } else {

        let textoIniciales = iniciales ? iniciales.toUpperCase() : '--';

        $('#contenedorPreviewLogoAreaModal').html(`
        <div class="avatar-modal-iniciales">
            ${textoIniciales}
        </div>
    `);

    }
}


//=========================================
// FUNCIÓN PARA PREVISUALIZAR EL NUEVO LOGO
//=========================================

function previsualizarNuevoLogoArea() {

    $('#inputLogoArea').on('change', function () {

        let archivo = this.files && this.files[0];

        if (!archivo) {
            return;
        }

        // Tipos de imagen permitidos
        let tiposPermitidos = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif'
        ];

        // Validar tipo de archivo
        if (!tiposPermitidos.includes(archivo.type)) {

            mostrarAlerta("warning", "Tipo de archivo no permitido", "Solo se permiten imágenes en formato JPEG, JPG, PNG, WEBP o GIF.");

            $(this).val('');
            return;
        }

        // Validar tamaño máximo (5 MB)
        let tamanoMaximo = 5 * 1024 * 1024;
        if (archivo.size > tamanoMaximo) {

            mostrarAlerta("warning", "Tamaño excedido", "La imagen no debe superar los 5 MB.");
            $(this).val('');
            return;
        }

        // Leer y previsualizar la imagen seleccionada
        let reader = new FileReader();

        reader.onload = function (e) {
            $('#contenedorPreviewLogoAreaModal').html(`
                <img
                    src="${e.target.result}"
                    alt="Previsualización del logo">
            `);
        };

        reader.readAsDataURL(archivo);
    });
}


//=========================================
// FUNCIÓN PARA LIMPIAR EL MODAL DE LOGO
//=========================================

function limpiarModalLogoArea() {
    $('#formActualizarLogoArea').removeData('id_area');
    $('#formActualizarLogoArea')[0].reset();
    $('#contenedorPreviewLogoAreaModal').empty();
}


//=========================================
// FUNCIÓN PARA GUARDAR EL LOGO DEL ÁREA
//=========================================

function guardarLogoArea() {

    $('#btnGuardarLogoArea').on('click', function () {

        let idArea = $('#formActualizarLogoArea').data('id_area');
        let inputArchivo = document.getElementById('inputLogoArea');
        let archivo = inputArchivo && inputArchivo.files ? inputArchivo.files[0] : null;

        // Validar que se haya seleccionado un área
        if (!idArea) {
            mostrarAlerta("warning", "Atención", "No se ha seleccionado ninguna área.");
            return;
        }

        // Validar que se haya seleccionado una imagen
        if (!archivo) {
            mostrarAlerta("warning", "Atención", "Por favor, selecciona una imagen para actualizar el logo del área.");
            return;
        }

        // Preparar los datos a enviar
        let formData = new FormData();
        formData.append('accion', 'actualizarLogo');
        formData.append('id_area', idArea);
        formData.append('logo', archivo);

        // Deshabilitar botón durante el proceso
        let $btn = $('#btnGuardarLogoArea');
        $btn.prop('disabled', true).html(`
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Guardando...
        `);

        // Realizar la petición AJAX
        $.ajax({
            type: "POST",
            url: "../php/areas.php",
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",

            success: function (response) {

                if (response.success) {

                    // Re-renderizar la tabla de áreas
                    obtenerAreas();

                    // Cerrar el modal
                    $('#modalActualizarLogoArea').modal('hide');

                    // Notificación de éxito

                    mostrarAlerta("success", "Éxito", response.mensaje || "Logo del área actualizado correctamente.");

                } else {

                    mostrarAlerta("error", "Error", response.mensaje || "No se pudo actualizar el logo del área.");

                }
            },

            error: function (xhr, status, error) {

                console.error("Error al actualizar el logo:", error);
                console.error(xhr.responseText);


                mostrarAlerta("error", "Error de servidor", "Ocurrió un error al intentar comunicarse con el servidor.");
            },

            complete: function () {
                $btn.prop('disabled', false).html('<i class="bi bi-floppy me-1"></i> Guardar Logo');
            }
        });
    });
}

//=========================================
// FUNCIÓN PARA SINCRONIZAR INPUTS DE COLOR
//=========================================

function sincronizarColorInputs() {
    // Sincronizar color picker con input de texto (agregar)
    $('#agregarColores').on('input', function() {
        $('#agregarColoresText').val($(this).val());
    });
    $('#agregarColoresText').on('input', function() {
        let valor = $(this).val();
        if (/^#[0-9A-Fa-f]{6}$/.test(valor)) {
            $('#agregarColores').val(valor);
        }
    });

    $('#agregarColoresTexto').on('input', function() {
        $('#agregarColoresTextoText').val($(this).val());
    });
    $('#agregarColoresTextoText').on('input', function() {
        let valor = $(this).val();
        if (/^#[0-9A-Fa-f]{6}$/.test(valor)) {
            $('#agregarColoresTexto').val(valor);
        }
    });

    // Sincronizar color picker con input de texto (editar)
    $('#editarColores').on('input', function() {
        $('#editarColoresText').val($(this).val());
    });
    $('#editarColoresText').on('input', function() {
        let valor = $(this).val();
        if (/^#[0-9A-Fa-f]{6}$/.test(valor)) {
            $('#editarColores').val(valor);
        }
    });

    $('#editarColoresTexto').on('input', function() {
        $('#editarColoresTextoText').val($(this).val());
    });
    $('#editarColoresTextoText').on('input', function() {
        let valor = $(this).val();
        if (/^#[0-9A-Fa-f]{6}$/.test(valor)) {
            $('#editarColoresTexto').val(valor);
        }
    });
}
