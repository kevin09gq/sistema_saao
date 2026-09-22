$(document).ready(function () {

    // Inicializar evento para guardar foto
    guardarFotoPerfil();

    // Inicializar evento para previsualizar foto seleccionada
    previsualizarNuevaFoto();

});


//====================================================
// FUNCIÓN PARA ABRIR EL MODAL DE ACTUALIZAR FOTO
//====================================================

function abrirModalActualizarFoto(idEmpleado) {

    // Limpiar el modal antes de cargar datos
    limpiarModalFoto();

    // Guardar el ID del empleado en el formulario
    $('#formActualizarFoto').data('id_empleado', idEmpleado);

    // Buscar el empleado en el arreglo global
    const empleado = empleados.find(emp => emp.id_empleado == idEmpleado);

    if (!empleado) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se encontró la información del empleado.",
            confirmButtonColor: "#198754"
        });
        return;
    }

    // Establecer la información del empleado en el modal
    establecerInformacionFoto(empleado);

    // Abrir el modal
    $('#modalActualizarFoto').modal('show');
}


//====================================================
// FUNCIÓN PARA ESTABLECER INFORMACIÓN EN EL MODAL
//====================================================

function establecerInformacionFoto(empleado) {

    // Obtener iniciales del empleado
    const iniciales = obtenerIniciales(
        empleado.nombre,
        empleado.ap_paterno
    );

    // Renderizar foto si tiene, o iniciales si no tiene o si falla al cargar
    if (empleado.ruta_foto && empleado.ruta_foto.trim() !== '') {

        const timestamp = new Date().getTime();
        const rutaCompleta = `../../../gafetes/${empleado.ruta_foto}?t=${timestamp}`;

        $('#contenedorPreviewFotoModal').html(`
            <img
                src="${rutaCompleta}"
                alt="Foto del empleado"
                onerror="establecerInicialesModal('${iniciales}')">
        `);

    } else {

        establecerInicialesModal(iniciales);

    }
}


//====================================================
// FUNCIÓN PARA MOSTRAR INICIALES EN EL MODAL
//====================================================

function establecerInicialesModal(iniciales) {

    const textoIniciales = iniciales ? iniciales.toUpperCase() : '--';

    $('#contenedorPreviewFotoModal').html(`
        <div class="avatar-modal-iniciales">
            ${textoIniciales}
        </div>
    `);
}


//====================================================
// FUNCIÓN PARA PREVISUALIZAR LA NUEVA IMAGEN
//====================================================

function previsualizarNuevaFoto() {

    $('#inputFotoEmpleado').on('change', function () {

        const archivo = this.files && this.files[0];

        if (!archivo) {
            return;
        }

        // Tipos de imagen permitidos
        const tiposPermitidos = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif'
        ];

        // Validar tipo de archivo
        if (!tiposPermitidos.includes(archivo.type)) {

            Swal.fire({
                icon: "warning",
                title: "Formato no válido",
                text: "Solo se permiten imágenes en formato JPG, PNG, WEBP o GIF.",
                confirmButtonColor: "#198754"
            });

            $(this).val('');
            return;
        }

        // Validar tamaño máximo (5 MB)
        const tamanoMaximo = 5 * 1024 * 1024;
        if (archivo.size > tamanoMaximo) {

            Swal.fire({
                icon: "warning",
                title: "Tamaño excedido",
                text: "La imagen no debe superar los 5 MB.",
                confirmButtonColor: "#198754"
            });

            $(this).val('');
            return;
        }

        // Leer y previsualizar la imagen seleccionada
        const reader = new FileReader();

        reader.onload = function (e) {
            $('#contenedorPreviewFotoModal').html(`
                <img
                    src="${e.target.result}"
                    alt="Previsualización de la foto">
            `);
        };

        reader.readAsDataURL(archivo);
    });
}


//====================================================
// FUNCIÓN PARA LIMPIAR EL FORMULARIO DEL MODAL
//====================================================

function limpiarModalFoto() {

    $('#formActualizarFoto').removeData('id_empleado');
    $('#formActualizarFoto')[0].reset();
    $('#contenedorPreviewFotoModal').empty();
}


//====================================================
// FUNCIÓN PARA GUARDAR LA FOTO DE PERFIL DEL EMPLEADO
//====================================================

function guardarFotoPerfil() {

    $('#btnGuardarFoto').on('click', function () {

        const idEmpleado = $('#formActualizarFoto').data('id_empleado');
        const inputArchivo = document.getElementById('inputFotoEmpleado');
        const archivo = inputArchivo && inputArchivo.files ? inputArchivo.files[0] : null;

        // Validar que se haya seleccionado un empleado
        if (!idEmpleado) {
            Swal.fire({
                icon: "warning",
                title: "Atención",
                text: "No se ha seleccionado ningún empleado.",
                confirmButtonColor: "#198754"
            });
            return;
        }

        // Validar que se haya seleccionado una imagen
        if (!archivo) {
            Swal.fire({
                icon: "warning",
                title: "Atención",
                text: "Debes seleccionar una imagen para actualizar la foto de perfil.",
                confirmButtonColor: "#198754"
            });
            return;
        }

        // Preparar los datos a enviar
        const formData = new FormData();
        formData.append('accion', 'actualizarFoto');
        formData.append('id_empleado', idEmpleado);
        formData.append('foto', archivo);

        // Deshabilitar botón durante el proceso
        const $btn = $('#btnGuardarFoto');
        $btn.prop('disabled', true).html(`
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Guardando...
        `);

        // Realizar la petición AJAX
        $.ajax({
            type: "POST",
            url: "../php/infoEmpleado.php",
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",

            success: function (response) {

                if (response.success) {

                    // Actualizar la ruta_foto en el arreglo global
                    const empIndex = empleados.findIndex(e => e.id_empleado == idEmpleado);
                    if (empIndex !== -1) {
                        empleados[empIndex].ruta_foto = response.ruta_foto;
                    }

                    // Actualizar en el arreglo filtrado si existe
                    const empFiltIndex = empleadosFiltrados.findIndex(e => e.id_empleado == idEmpleado);
                    if (empFiltIndex !== -1) {
                        empleadosFiltrados[empFiltIndex].ruta_foto = response.ruta_foto;
                    }

                    // Re-renderizar la tabla de empleados
                    if (typeof mostrarEmpleados === 'function') {
                        mostrarEmpleados();
                    }

                    // Cerrar el modal
                    $('#modalActualizarFoto').modal('hide');

                    // Notificación de éxito
                    Swal.fire({
                        icon: "success",
                        title: "¡Correcto!",
                        text: response.mensaje || "Foto de perfil actualizada correctamente.",
                        confirmButtonColor: "#198754"
                    });

                } else {

                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: response.mensaje || "No se pudo actualizar la foto de perfil.",
                        confirmButtonColor: "#198754"
                    });

                }
            },

            error: function (xhr, status, error) {

                console.error("Error al actualizar la foto:", error);
                console.error(xhr.responseText);

                Swal.fire({
                    icon: "error",
                    title: "Error de servidor",
                    text: "Ocurrió un error al intentar comunicarse con el servidor.",
                    confirmButtonColor: "#198754"
                });
            },

            complete: function () {
                $btn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Guardar Foto');
            }
        });
    });
}
