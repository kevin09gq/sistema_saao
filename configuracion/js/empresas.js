$(document).ready(function () {
    obtenerEmpresas();
    editarEmpresa();
    agregarEmpresa();
    guardarLogoEmpresa();
    previsualizarNuevoLogo();
});

//=========================================
// FUNCIÓN PARA OBTENER LAS EMPRESAS
// MOSTRARLAS EN LA TABLA DE LA VISTA
//=========================================

function obtenerEmpresas() {

    $.ajax({
        type: "POST",
        url: "../php/empresas.php",

        data: {
            accion: "obtenerEmpresas"
        },

        dataType: "json",

        success: function (response) {

            if (response.success) {

                // Limpiamos la tabla antes de agregar los datos
                $("#tablaEmpresas").empty();

                // Recorremos las empresas recibidas
                response.empresas.forEach(function (empresa) {

                    // Obtener las iniciales de la empresa
                    let iniciales = obtenerIniciales(empresa.nombre_empresa);

                    // Renderizar avatar: imagen si existe o círculo con iniciales si no existe o falla
                    let avatarHtml = empresa.logo_empresa
                        ? `<img
                                src="${rutaRaiz}public/logosEmpresas/${empresa.logo_empresa}"
                                alt="Logo de ${empresa.nombre_empresa}"
                                class="rounded-circle"
                                width="40"
                                height="40"
                                style="object-fit: contain;"
                                onerror="this.outerHTML='<div class=\\'avatar-iniciales\\'>${iniciales}</div>'">`
                        : `<div class="avatar-iniciales">${iniciales}</div>`;

                    // Contenedor interactivo clicable
                    let contenidoLogo = `
                        <div role="button" class="d-inline-block position-relative avatar-clickable" onclick="abrirModalActualizarLogo('${empresa.id_empresa}', '${empresa.logo_empresa || ''}', '${empresa.nombre_empresa}')" title="Clic para actualizar logo de la empresa">
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
                                ${empresa.nombre_empresa}
                            </td>

                            <td>
                                ${empresa.rfc_empresa || "Sin RFC"}
                            </td>

                            <td>
                                ${empresa.domicilio_fiscal || "Sin domicilio registrado"}
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
                                                onclick="abrirModalEditarEmpresa('${empresa.id_empresa}', '${empresa.nombre_empresa}', '${empresa.rfc_empresa || ''}', '${empresa.domicilio_fiscal || ''}')">

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
                    $("#tablaEmpresas").append(fila);
                });

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
// EDITAR UNA EMPRESA
//=========================================

function abrirModalEditarEmpresa(id_empresa, nombre_empresa, rfc_empresa, domicilio_fiscal) {

    // Guardar id de la empresa en el formulario
    $("#editarIdEmpresa").val(id_empresa);

    // Asignar Nombre de la empresa
    $("#editarNombreEmpresa").val(nombre_empresa);

    // Asignar RFC de la empresa
    $("#editarRfcEmpresa").val(rfc_empresa || "");

    // Asignar Domicilio Fiscal de la empresa
    $("#editarDomicilioFiscal").val(domicilio_fiscal || "");

    // Mostramos el modal de edición
    $('#modalEditarEmpresa').modal('show');
}

//=========================================
// FUNCIÓN PARA EDITAR LA INFORMACION DE 
// LA EMPRESA
//=========================================

function editarEmpresa() {

    $("#btnActualizarEmpresa").click(function (e) {

        e.preventDefault();

        // Obtenemos los datos del formulario y lo guardammos en un objeto
        let datosEmpresa = {
            id_empresa: $("#editarIdEmpresa").val(),
            nombre_empresa: $("#editarNombreEmpresa").val(),
            rfc_empresa: $("#editarRfcEmpresa").val(),
            domicilio_fiscal: $("#editarDomicilioFiscal").val()
        };

        // Validamos que el nombre de la empresa no esté vacío
        if (datosEmpresa.nombre_empresa == null || datosEmpresa.nombre_empresa.trim() === "") {
            mostrarAlerta("error", "Error", "El nombre de la empresa no puede estar vacío.");
            return;
        }

        // Enviamos los datos al servidor mediante AJAX
        $.ajax({
            type: "POST",
            url: "../php/empresas.php",
            data: {
                datosEmpresa: datosEmpresa,
                accion: "editarEmpresa"
            },
            dataType: "json",
            success: function (response) {

                if (response.success) {

                    // Mostramos un mensaje de éxito
                    mostrarAlerta("success", "Éxito", response.mensaje);

                    // Actualizamos la lista de empresas
                    obtenerEmpresas();

                    // Limpiamos el formulario de edición
                    limpiarFormularioEditarEmpresa();

                    // Cerramos el modal
                    $('#modalEditarEmpresa').modal('hide');
                }
            }
        });


    });
}

//=========================================
// FUNCIÓN PARA LIMPIAR EL FORMULARIO DE 
// EDICIÓN DE EMPRESA
//=========================================

function limpiarFormularioEditarEmpresa() {
    $("#editarIdEmpresa").val("");
    $("#editarNombreEmpresa").val("");
    $("#editarRfcEmpresa").val("");
    $("#editarDomicilioFiscal").val("");
}

//=========================================
// FUNCIÓN PARA LIMPIAR EL FORMULARIO DE 
// AGREGAR EMPRESA
//=========================================

function limpiarFormularioAgregarEmpresa() {
    $("#agregarNombreEmpresa").val("");
    $("#agregarRfcEmpresa").val("");
    $("#agregarDomicilioFiscal").val("");
    $("#agregarLogoEmpresa").val("");
}

//=========================================
// FUNCIÓN PARA AGREGAR UNA NUEVA EMPRESA
//=========================================

function agregarEmpresa() {
    $("#btnGuardarEmpresa").click(function (e) {
        e.preventDefault();

        // Validamos que el nombre de la empresa no esté vacío
        let nombre_empresa = $("#agregarNombreEmpresa").val();
        if (nombre_empresa == null || nombre_empresa.trim() === "") {
            mostrarAlerta("error", "Error", "El nombre de la empresa no puede estar vacío.");
            return;
        }

        // Creamos un objeto FormData para enviar archivos
        let formData = new FormData($("#formAgregarEmpresa")[0]);

        // Agregamos la acción al FormData
        formData.append("accion", "agregarEmpresa");

        // Enviamos los datos al servidor mediante AJAX
        $.ajax({
            type: "POST",
            url: "../php/empresas.php",
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",
            success: function (response) {

                if (response.success) {

                    // Mostramos un mensaje de éxito
                    mostrarAlerta("success", "Éxito", response.mensaje);

                    // Actualizamos la lista de empresas
                    obtenerEmpresas();

                    // Limpiamos el formulario de agregado
                    limpiarFormularioAgregarEmpresa();

                    // Cerramos el modal
                    $('#modalAgregarEmpresa').modal('hide');
                } else {
                    mostrarAlerta("error", "Error", response.mensaje);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error AJAX:", error);
                console.error(xhr.responseText);
                mostrarAlerta("error", "Error", "Ocurrió un error al agregar la empresa.");
            }
        });
    });
}


//=========================================
// FUNCIÓN PARA ABRIR EL MODAL DE
// ACTUALIZAR LOGO DE LA EMPRESA
//=========================================

function abrirModalActualizarLogo(id_empresa, logo_empresa, nombre_empresa) {

    // Limpiar el modal antes de cargar datos
    limpiarModalLogo();

    // Guardar el ID de la empresa en el formulario
    $('#formActualizarLogo').data('id_empresa', id_empresa);

    // Establecer la información del logo en el modal
    establecerInformacionLogo(logo_empresa, nombre_empresa);

    // Abrir el modal
    $('#modalActualizarLogo').modal('show');
}


//=========================================
// FUNCIÓN PARA ESTABLECER INFORMACIÓN DEL
// LOGO EN EL MODAL
//=========================================

function establecerInformacionLogo(logo_empresa, nombre_empresa) {

    // Obtener iniciales de la empresa
    let iniciales = obtenerIniciales(nombre_empresa);

    // Renderizar logo si tiene o iniciales si no tiene
    if (logo_empresa && logo_empresa.trim() !== '') {

        let rutaCompleta = `${rutaRaiz}public/logosEmpresas/${logo_empresa}`;

        $('#contenedorPreviewLogoModal').html(`
            <img
                src="${rutaCompleta}"
                alt="Logo de la empresa"
                onerror="establecerInicialesModalLogo('${iniciales}')">
        `);

    } else {

        let textoIniciales = iniciales ? iniciales.toUpperCase() : '--';

        $('#contenedorPreviewLogoModal').html(`
        <div class="avatar-modal-iniciales">
            ${textoIniciales}
        </div>
    `);

    }
}


//=========================================
// FUNCIÓN PARA PREVISUALIZAR EL NUEVO LOGO
//=========================================

function previsualizarNuevoLogo() {

    $('#inputLogoEmpresa').on('change', function () {

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
            $('#contenedorPreviewLogoModal').html(`
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

function limpiarModalLogo() {
    $('#formActualizarLogo').removeData('id_empresa');
    $('#formActualizarLogo')[0].reset();
    $('#contenedorPreviewLogoModal').empty();
}


//=========================================
// FUNCIÓN PARA GUARDAR EL LOGO DE LA EMPRESA
//=========================================

function guardarLogoEmpresa() {

    $('#btnGuardarLogo').on('click', function () {

        let idEmpresa = $('#formActualizarLogo').data('id_empresa');
        let inputArchivo = document.getElementById('inputLogoEmpresa');
        let archivo = inputArchivo && inputArchivo.files ? inputArchivo.files[0] : null;

        // Validar que se haya seleccionado una empresa
        if (!idEmpresa) {
            mostrarAlerta("warning", "Atención", "No se ha seleccionado ninguna empresa.");
            return;
        }

        // Validar que se haya seleccionado una imagen
        if (!archivo) {
            mostrarAlerta("warning", "Atención", "Por favor, selecciona una imagen para actualizar el logo de la empresa.");
            return;
        }

        // Preparar los datos a enviar
        let formData = new FormData();
        formData.append('accion', 'actualizarLogo');
        formData.append('id_empresa', idEmpresa);
        formData.append('logo', archivo);

        // Deshabilitar botón durante el proceso
        let $btn = $('#btnGuardarLogo');
        $btn.prop('disabled', true).html(`
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Guardando...
        `);

        // Realizar la petición AJAX
        $.ajax({
            type: "POST",
            url: "../php/empresas.php",
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",

            success: function (response) {

                if (response.success) {

                    // Re-renderizar la tabla de empresas
                    obtenerEmpresas();

                    // Cerrar el modal
                    $('#modalActualizarLogo').modal('hide');

                    // Notificación de éxito

                    mostrarAlerta("success", "Éxito", response.mensaje || "Logo de la empresa actualizado correctamente.");

                } else {

                    mostrarAlerta("error", "Error", response.mensaje || "No se pudo actualizar el logo de la empresa.");

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
