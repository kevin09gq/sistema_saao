$(document).ready(function () {
    getEmpresas();
    registrarEmpresa();
    mostrarImagenEmpresa();
    editarEmpresa();
    buscarEmpresa();
    
    // Agregar validación para el campo RFC de empresa
    validarDatos("#rfc_empresa", validarRFCmoral);
    
    // Formatear RFC de empresa a mayúsculas
    formatearMayusculas("#rfc_empresa");
});

function getEmpresas() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerEmpresa.php",
        success: function (response) {
            if (!response.error) {
                let areas = JSON.parse(response);
                let opciones = ``;

                // Agregamos un contador para mostrar números secuenciales
                let contador = 1;

                areas.forEach((element) => {
                    opciones += `
                                <tr id="area-row-${element.id_empresa}" data-id="${element.id_empresa}">
                                    <td>${contador}</td>
                                    <td>${element.nombre_empresa}</td>
                                    <td>
                                        <button class="btn btn-sm btn-edit btn-edit-empresa" id="btn-edit-empresa-${element.id_empresa}" data-id="${element.id_empresa}" title="Editar"><i class="bi bi-pencil"></i></button>
                                        <button class="btn btn-sm btn-image btn-image-empresa" id="btn-image-empresa-${element.id_empresa}" data-id="${element.id_empresa}" title="Cambiar imagen"><i class="bi bi-image"></i></button>
                                    </td>
                                </tr>   
                        `;

                    // Incrementamos el contador para la siguiente área
                    contador++;
                });
                $("#empresas-tbody").html(opciones);
            }
        }
    });
}

// Función para resetear el formulario de empresa a su estado inicial
function resetearFormularioEmpresa() {
    $("#empresa_id").val('');
    $("#nombre_empresa").val('');
    $("#rfc_empresa").val('');
    $("#domicilio_fiscal").val('');
    $("#logo_empresa").val('');
    $("#preview_logo_empresa").attr('src', '');
    $(".current-image-preview").hide();
    $(".remove-image[data-target='logo_empresa']").hide().data("empresa-id", "");
    $("#btn-guardar-empresa").html('<i class="fas fa-save"></i> Guardar');
}

function registrarEmpresa() {
    $("#empresaForm").submit(function (e) {
        e.preventDefault();

        // Crear un objeto FormData para manejar la carga de archivos
        let formData = new FormData(this);

        // Obtener los valores del formulario
        let idEmpresa = $("#empresa_id").val().trim();
        let nombreEmpresa = $("#nombre_empresa").val().trim();
        let rfcEmpresa = $("#rfc_empresa").val().trim();
        let domicilioFiscal = $("#domicilio_fiscal").val().trim();
        let accion = idEmpresa ? "actualizarEmpresa" : "registrarEmpresa";

        // Agregar la acción al FormData
        formData.append("accion", accion);

        // Validar RFC si tiene valor
        if (rfcEmpresa && !validarRFCmoral(rfcEmpresa)) {
            Swal.fire({
                icon: 'warning',
                title: 'RFC inválido',
                text: 'El RFC de la empresa no tiene el formato correcto',
                confirmButtonColor: '#eab308'
            });
            return;
        }

        if (nombreEmpresa != "") {
            $.ajax({
                type: "POST",
                url: "../php/configEmpresas.php",
                data: formData,
                contentType: false,
                processData: false,
                cache: false,
                success: function (response) {
                    if (response.trim() == "1") {
                        resetearFormularioEmpresa();
                        getEmpresas();
                        let mensaje = accion === "registrarEmpresa"
                            ? "Empresa registrada correctamente"
                            : "Empresa actualizada correctamente";
                        Swal.fire({
                            icon: 'success',
                            title: 'Éxito',
                            text: mensaje,
                            confirmButtonColor: '#22c55e'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Nombre de empresa ya existe',
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
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Ingrese un nombre para la empresa',
                confirmButtonColor: '#eab308'
            });
        }
    });

    // Vista previa del logo
    $("#logo_empresa").change(function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $("#preview_logo_empresa").attr('src', e.target.result);
                $(".current-image-preview").show();
            }
            reader.readAsDataURL(file);
        }
    });

    // Eliminar logo (solo limpia la vista previa local)
    $("#btn-remove-empresa-image").click(function () {
        $("#logo_empresa").val('');
        $("#preview_logo_empresa").attr('src', '');
        $(".current-image-preview").hide();
    });

    // Funcionalidad del botón cancelar
    $("#btn-cancelar-empresa").click(function () {
        resetearFormularioEmpresa();
    });
}

// Función para mostrar el logo de la empresa en un modal
function mostrarImagenEmpresa() {
    $(document).on("click", ".btn-image-empresa", function () {
        let idEmpresa = $(this).data("id");
        let nombreEmpresa = $(this).closest("tr").find("td:eq(1)").text();

        $.ajax({
            type: "POST",
            url: "../php/configEmpresas.php",
            data: {
                accion: "obtenerImagenEmpresa",
                id_empresa: idEmpresa
            },
            success: function (response) {
                try {
                    let data = JSON.parse(response);

                    // Limpiar el modal antes de mostrar
                    $("#modalEmpresaLogoTitle").text("Logo de la Empresa: " + nombreEmpresa);
                    $("#modalEmpresaLogoImage").hide();
                    $("#modalEmpresaLogoFooter").text("");

                    if (data.error) {
                        $("#modalEmpresaLogoFooter").text(data.message || "No se pudo obtener la información de la empresa");
                        $("#modalEmpresaLogo").modal("show");
                        return;
                    }

                    let logoEmpresa = data.logo_empresa;
                    if (!logoEmpresa || logoEmpresa.trim() === '') {
                        $("#modalEmpresaLogoFooter").text("No hay logo registrado para esta empresa");
                        $("#modalEmpresaLogoImage").hide();
                        $("#modalEmpresaLogo").modal("show");
                        return;
                    }

                    let rutaLogo = rutaRaiz + "gafetes/logos_empresa/" + logoEmpresa;
                    $("#modalEmpresaLogoImage").attr("src", rutaLogo).show();
                    $("#modalEmpresaLogoImage").attr("alt", "Logo de la empresa " + nombreEmpresa);
                    $("#modalEmpresaLogoFooter").text("");
                    $("#modalEmpresaLogo").modal("show");

                    // Manejar error si la imagen no se puede cargar
                    $("#modalEmpresaLogoImage").off("error").on("error", function () {
                        $(this).hide();
                        $("#modalEmpresaLogoFooter").text("No se encontró logo para esta empresa");
                    });

                } catch (e) {
                    $("#modalEmpresaLogoTitle").text("Logo de la Empresa");
                    $("#modalEmpresaLogoImage").hide();
                    $("#modalEmpresaLogoFooter").text("Error al procesar la información de la empresa");
                    $("#modalEmpresaLogo").modal("show");
                }
            },
            error: function () {
                $("#modalEmpresaLogoTitle").text("Logo de la Empresa");
                $("#modalEmpresaLogoImage").hide();
                $("#modalEmpresaLogoFooter").text("No se pudo conectar con el servidor");
                $("#modalEmpresaLogo").modal("show");
            }
        });
    });
}

function editarEmpresa() {
    $(document).on("click", ".btn-edit-empresa", function () {
        let idEmpresa = $(this).data("id");
        $.ajax({
            type: "POST",
            url: "../php/configEmpresas.php",
            data: {
                accion: "obtenerInfoEmpresa",
                id_empresa: idEmpresa
            },
            success: function (response) {
                try {
                    let data = JSON.parse(response);
                    if (data.error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message || 'No se pudo obtener la información de la empresa',
                            confirmButtonColor: '#ef4444'
                        });
                        return;
                    }
                    $("#empresa_id").val(data.id_empresa);
                    $("#nombre_empresa").val(data.nombre_empresa);
                    $("#rfc_empresa").val(data.rfc_empresa || '');
                    $("#domicilio_fiscal").val(data.domicilio_fiscal || '');

                    if (data.logo_empresa && data.logo_empresa.trim() !== "") {
                        let rutaLogo = rutaRaiz + "gafetes/logos_empresa/" + data.logo_empresa;
                        $("#preview_logo_empresa").attr('src', rutaLogo);
                        $(".current-image-preview").show();
                        $(".remove-image[data-target='logo_empresa']").show().data("empresa-id", data.id_empresa);
                    } else {
                        $("#preview_logo_empresa").attr('src', '');
                        $(".current-image-preview").hide();
                        $(".remove-image[data-target='logo_empresa']").hide().data("empresa-id", "");
                    }
                    $("#btn-guardar-empresa").html('<i class="fas fa-save"></i> Actualizar');
                } catch (e) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al procesar la información de la empresa',
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

    $(document).on("click", "#btn-remove-empresa-image", function (e) {
        e.preventDefault();       // evita comportamiento por defecto
        e.stopPropagation();      // evita que el evento burbujee al input file

        let empresaId = $(this).data("empresa-id") || null;

        Swal.fire({
            icon: 'question',
            title: '¿Eliminar logo?',
            text: '¿Seguro que deseas eliminar el logo de esta empresa?',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (result.isConfirmed) {
                if (!empresaId) {
                    // Solo limpiar vista previa (cuando es un logo cargado localmente)
                    $("#logo_empresa").val('');
                    $("#preview_logo_empresa").attr('src', '');
                    $(".current-image-preview").hide();
                    return;
                }

                // Si sí tiene empresaId => borrar en el servidor
                $.ajax({
                    type: "POST",
                    url: "../php/configEmpresas.php",
                    data: {
                        accion: "eliminarLogoEmpresa",
                        id_empresa: empresaId
                    },
                    success: function (response) {
                        let resultado = response.trim();
                        if (resultado == "1") {
                            $("#preview_logo_empresa").attr('src', '');
                            $(".current-image-preview").hide();
                            $(".remove-image[data-target='logo_empresa']").hide().data("empresa-id", "");
                            Swal.fire({
                                icon: 'success',
                                title: 'Logo eliminado',
                                text: 'El logo de la empresa ha sido eliminado correctamente',
                                confirmButtonColor: '#22c55e'
                            });
                            getEmpresas();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo eliminar el logo',
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


function buscarEmpresa() {
    $("#search-empresas").on("keyup", function() {
        let valor = $(this).val().toLowerCase();
        $("#empresas-tbody tr").filter(function() {
            $(this).toggle($(this).find("td:eq(1)").text().toLowerCase().indexOf(valor) > -1);
        });
    });
}

// Función para validar datos en tiempo real
function validarDatos(selector, validacion) {
    $(selector).on('input', function () {
        const valor = $(this).val();
        
        // Quita clases anteriores
        $(this).removeClass('border-success border-danger');
        
        // Si está vacío, no aplica ninguna clase (campo opcional)
        if (valor === "") return;
        
        // Aplica validación
        const isValid = validacion(valor);
        $(this).addClass(isValid ? 'border-success' : 'border-danger');
    });
}

// Función para formatear texto a mayúsculas mientras se escribe
function formatearMayusculas(selector) {
    $(selector).on('input', function () {
        // Obtener la posición actual del cursor
        const cursorPosition = this.selectionStart;
        // Convertir el valor a mayúsculas
        const valorMayusculas = $(this).val().toUpperCase();
        // Establecer el nuevo valor
        $(this).val(valorMayusculas);
        // Restaurar la posición del cursor
        this.setSelectionRange(cursorPosition, cursorPosition);
    });
}

// Función para validar el RFC moral
function validarRFCmoral(rfc) {
    // Expresión regular para validar el formato del RFC moral
    const reRFCMoral = /^[A-Z]{3}\d{6}[A-Z0-9]{3}$/;
    return reRFCMoral.test(rfc);
}

