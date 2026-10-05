$(document).ready(function () {
    cargarBeneficiarioParaEditar();
    guardarBeneficiario();
    confirmarEliminarBeneficiario();
});


//====================================================
// FUNCIÓN PARA ABRIR EL MODAL DE BENEFICIARIOS
// FUNCIÓN LLAMADA DESDE EL SWITCH DE ACCIONES
//====================================================

function abrirModalBeneficiarios(idEmpleado) {

    // 1. Limpiar el formulario
    limpiarFormularioBeneficiario();

    // 2. Guardar el ID del empleado en el modal
    $('#modalBeneficiarios').data('id_empleado', idEmpleado);

    // 3. Obtener los beneficiarios del empleado
    obtenerBeneficiarios(idEmpleado);

    // 4. Aplicar permisos de edición
    aplicarPermisosBeneficiarios();

    // 5. Abrir el modal
    $('#modalBeneficiarios').modal('show');
}


//=============================================================
// FUNCIÓN PARA OBTENER LOS BENEFICIARIOS DEL EMPLEADO
//=============================================================

function obtenerBeneficiarios(id_empleado) {

    // consultar los beneficiarios al servidor
    $.ajax({
        type: "POST",
        url: "../php/infoBeneficiarios.php",
        data: {
            accion: "obtenerBeneficiarios",
            id_empleado: id_empleado
        },
        dataType: "json",

        success: function (response) {

            // verificar que la consulta fue correcta
            if (!response.success) {

                console.error(
                    "Error:",
                    response.mensaje
                );

                return;
            }

            // obtener el listado de beneficiarios
            var beneficiarios = response.beneficiarios || [];


            // guardar la lista de beneficiarios en el modal
            $('#modalBeneficiarios').data('beneficiarios_lista', beneficiarios);

            // establecer los datos en la tabla del modal
            establecerBeneficiarios(beneficiarios);
        },

        error: function (xhr, status, error) {

            // mostrar informacion del error ajax
            console.error(
                "Error AJAX al obtener los beneficiarios."
            );

            console.error("status:", status);
            console.error("error:", error);
            console.error(
                "respuesta servidor:",
                xhr.responseText
            );
        }
    });
}


//============================================================
// FUNCIÓN PARA ESTABLECER LOS BENEFICIARIOS EN LA TABLA
//============================================================

function establecerBeneficiarios(beneficiarios) {

    // Obtener el cuerpo de la tabla y limpiarlo
    $('#tablaBeneficiarios').empty();

    // Si no existen beneficiarios, mostrar mensaje
    if (!beneficiarios || beneficiarios.length === 0) {

        $('#tablaBeneficiarios').append(`
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-person-x fs-3 d-block mb-2"></i>
                    No hay beneficiarios registrados
                </td>
            </tr>
        `);

        // El porcentaje total es 0
        actualizarResumenPorcentajes(0);
        return;
    }

    // Guardar el porcentaje total
    var total = 0;

    // Recorrer todos los beneficiarios
    beneficiarios.forEach(function (b, index) {

        // Obtener porcentaje
        var porcentaje = parseFloat(b.porcentaje) || 0;

        // Sumar al total
        total += porcentaje;

        // Crear la fila
        $('#tablaBeneficiarios').append(`
            <tr>
                <td class="fw-semibold text-muted">
                    ${index + 1}
                </td>

                <td class="fw-semibold">
                    ${b.nombre || ''}
                </td>

                <td>
                    ${b.ap_paterno || ''}
                </td>

                <td>
                    ${b.ap_materno || ''}
                </td>

                <td>
                    <span class="badge bg-secondary">
                        ${b.parentesco || 'N/A'}
                    </span>
                </td>

                <td class="text-center">
                    <span class="badge bg-light text-primary border border-primary">
                        ${porcentaje.toFixed(2)}%
                    </span>
                </td>

                <td class="text-center">
                    ${tienePermiso('empleados.editar_beneficiarios') ? `
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary btn-editar-beneficiario"
                        data-id="${b.id_empleado_beneficiario}"
                        title="Editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger btn-eliminar-beneficiario"
                        data-id="${b.id_empleado_beneficiario}"
                        title="Eliminar">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                    ` : '<span class="text-muted">-</span>'}
                </td>
            </tr>
        `);
    });

    // Actualizar el porcentaje total
    actualizarResumenPorcentajes(total);
}


//============================================================
// FUNCIÓN PARA ACTUALIZAR EL RESUMEN DE PORCENTAJES
//============================================================

function actualizarResumenPorcentajes(porcentajeTotal) {

    var totalAsignado = parseFloat(porcentajeTotal) || 0;
    var totalDisponible = Math.max(0, 100 - totalAsignado);

    // actualizar texto en encabezado
    $('#beneficiariosPorcentajeTotal').text(totalAsignado.toFixed(2) + '%');

    // cambiar color del badge del encabezado segun el total
    if (totalAsignado === 100) {
        $('#beneficiariosPorcentajeTotal').removeClass('bg-primary bg-danger').addClass('bg-success');
    } else if (totalAsignado > 100) {
        $('#beneficiariosPorcentajeTotal').removeClass('bg-primary bg-success').addClass('bg-danger');
    } else {
        $('#beneficiariosPorcentajeTotal').removeClass('bg-success bg-danger').addClass('bg-primary');
    }

    // actualizar valores en el cuadro de resumen
    $('#porcentajeAsignado').text(totalAsignado.toFixed(2) + '%');
    $('#porcentajeDisponible').text(totalDisponible.toFixed(2) + '%');

    if (totalDisponible === 0) {
        $('#porcentajeDisponible').removeClass('text-success text-danger').addClass('text-muted');
    } else if (totalDisponible < 0) {
        $('#porcentajeDisponible').removeClass('text-success text-muted').addClass('text-danger');
    } else {
        $('#porcentajeDisponible').removeClass('text-muted text-danger').addClass('text-success');
    }
}


//============================================================
// FUNCIÓN PARA LIMPIAR EL FORMULARIO DE BENEFICIARIO
//============================================================

function limpiarFormularioBeneficiario() {

    // limpiar el nombre
    $('#beneficiarioNombre').val('');

    // limpiar el apellido paterno
    $('#beneficiarioApellidoPaterno').val('');

    // limpiar el apellido materno
    $('#beneficiarioApellidoMaterno').val('');

    // limpiar el parentesco
    $('#beneficiarioParentesco').val('');

    // limpiar el porcentaje
    $('#beneficiarioPorcentaje').val('');

    // eliminar id de beneficiario en edicion si existia
    $('#modalBeneficiarios').removeData('id_empleado_beneficiario');

    // restaurar texto y estilo del boton agregar
    $('#btnAgregarBeneficiario')
        .html('<i class="bi bi-plus-lg me-1"></i> Agregar beneficiario')
        .removeClass('btn-warning')
        .addClass('btn-primary');
}


//============================================================
// FUNCIÓN PARA CARGAR UN BENEFICIARIO EN EL FORMULARIO
//============================================================

function cargarBeneficiarioParaEditar() {

    $('#tablaBeneficiarios').on('click', '.btn-editar-beneficiario', function () {

        // Obtener el ID del beneficiario
        var idEmpleadoBeneficiario = $(this).data('id');

        // obtener la lista cacheada de beneficiarios
        var lista = $('#modalBeneficiarios').data('beneficiarios_lista') || [];

        // buscar el beneficiario seleccionado
        var beneficiario = lista.find(function (item) {
            return parseInt(item.id_empleado_beneficiario) === parseInt(idEmpleadoBeneficiario);
        });

        if (!beneficiario) {
            console.error("No se encontró el beneficiario seleccionado.");
            return;
        }

        // llenar los campos del formulario con los datos
        $('#beneficiarioNombre').val(beneficiario.nombre || '');
        $('#beneficiarioApellidoPaterno').val(beneficiario.ap_paterno || '');
        $('#beneficiarioApellidoMaterno').val(beneficiario.ap_materno || '');
        $('#beneficiarioParentesco').val(beneficiario.parentesco || '');
        $('#beneficiarioPorcentaje').val(parseFloat(beneficiario.porcentaje || 0));

        // guardar el id_empleado_beneficiario en el modal para la actualizacion
        $('#modalBeneficiarios').data('id_empleado_beneficiario', idEmpleadoBeneficiario);

        // cambiar el boton a modo actualizar
        $('#btnAgregarBeneficiario')
            .html('<i class="bi bi-check-lg me-1"></i> Actualizar beneficiario')
            .removeClass('btn-primary')
            .addClass('btn-warning');

        // hacer scroll hacia arriba para ver el formulario
        $('#modalBeneficiarios .modal-body').animate({ scrollTop: 0 }, 'fast');
    });
}


//====================================================
// GUARDAR O ACTUALIZAR EL BENEFICIARIO
//====================================================

function guardarBeneficiario() {
    $('#btnAgregarBeneficiario').off('click').on('click', function () {

        // obtener el id del empleado
        var id_empleado = $('#modalBeneficiarios').data('id_empleado');

        // obtener el id_empleado_beneficiario si estamos en modo edicion
        var id_empleado_beneficiario = $('#modalBeneficiarios').data('id_empleado_beneficiario');

        // obtener los datos del beneficiario
        var nombre = $('#beneficiarioNombre').val().trim();
        var ap_paterno = $('#beneficiarioApellidoPaterno').val().trim();
        var ap_materno = $('#beneficiarioApellidoMaterno').val().trim();
        var parentesco = $('#beneficiarioParentesco').val().trim();
        var porcentaje = $('#beneficiarioPorcentaje').val().trim();

        // validar el id del empleado
        if (!id_empleado) {
            console.error("No se encontró el id del empleado.");
            return;
        }

        // validar el nombre
        if (!nombre) {
            mostrarAlerta("error", "Campo obligatorio", "El nombre del beneficiario es obligatorio.");
            return;
        }

        // validar el parentesco
        if (!parentesco) {
            mostrarAlerta("error", "Campo obligatorio", "El parentesco del beneficiario es obligatorio.");
            return;
        }

        // validar el porcentaje
        var porcentajeNum = parseFloat(porcentaje);
        if (isNaN(porcentajeNum) || porcentajeNum <= 0 || porcentajeNum > 100) {
            mostrarAlerta("error", "Valor inválido", "El porcentaje debe ser un número entre 0 y 100.");
            return;
        }

        // validar que la suma de porcentajes no exceda el 100%
        var listaBeneficiarios = $('#modalBeneficiarios').data('beneficiarios_lista') || [];
        var porcentajeActual = 0;

        listaBeneficiarios.forEach(function (b) {
            if (!id_empleado_beneficiario || parseInt(b.id_empleado_beneficiario) !== parseInt(id_empleado_beneficiario)) {
                porcentajeActual += parseFloat(b.porcentaje) || 0;
            }
        });

        if ((porcentajeActual + porcentajeNum) > 100) {
            var disponible = Math.max(0, 100 - porcentajeActual).toFixed(2);
            mostrarAlerta("error", "Porcentaje excedido", "El porcentaje total no puede superar el 100%. Porcentaje disponible: " + disponible + "%.");
            return;
        }

        // determinar la accion a ejecutar
        var accion = id_empleado_beneficiario ? 'actualizarBeneficiario' : 'guardarBeneficiario';

        // preparar los datos a enviar
        var datos = {
            accion: accion,
            id_empleado: id_empleado,
            nombre: nombre,
            ap_paterno: ap_paterno,
            ap_materno: ap_materno,
            parentesco: parentesco,
            porcentaje: porcentajeNum
        };

        if (id_empleado_beneficiario) {
            datos.id_empleado_beneficiario = id_empleado_beneficiario;
        }

        // enviar los datos al servidor
        $.ajax({
            type: "POST",
            url: "../php/infoBeneficiarios.php",
            data: datos,
            dataType: "json",

            success: function (response) {

                // verificar si la operacion fue correcta
                if (response.success) {
                    mostrarAlerta("success", "Éxito", response.mensaje);

                    // limpiar el formulario
                    limpiarFormularioBeneficiario();

                    // recargar la lista de beneficiarios
                    obtenerBeneficiarios(id_empleado);

                } else {
                    mostrarAlerta("error", "Error", response.mensaje);
                    console.error("Error:", response.mensaje);
                }
            },

            error: function (xhr, status, error) {

                // mostrar informacion del error
                console.error("Error AJAX al guardar el beneficiario.");
                console.error("status:", status);
                console.error("error:", error);
                console.error("respuesta servidor:", xhr.responseText);
            }
        });
    });
}


//============================================================
// FUNCIÓN PARA CONFIRMAR LA ELIMINACIÓN DE UN BENEFICIARIO
//============================================================

function confirmarEliminarBeneficiario() {
    $('#tablaBeneficiarios').on('click', '.btn-eliminar-beneficiario', function () {
        var idEmpleadoBeneficiario = $(this).data('id');

        Swal.fire({
            title: '¿Eliminar beneficiario?',
            text: '¿Está seguro de que desea eliminar este beneficiario?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarBeneficiario(idEmpleadoBeneficiario);
            }
        });
    });

}


//============================================================
// FUNCIÓN PARA ELIMINAR UN BENEFICIARIO
//============================================================

function eliminarBeneficiario(idEmpleadoBeneficiario) {

    // obtener el id del empleado
    var id_empleado = $('#modalBeneficiarios').data('id_empleado');

    if (!id_empleado) {
        console.error("No se encontró el id del empleado.");
        return;
    }

    // enviar peticion al servidor
    $.ajax({
        type: "POST",
        url: "../php/infoBeneficiarios.php",
        data: {
            accion: "eliminarBeneficiario",
            id_empleado: id_empleado,
            id_empleado_beneficiario: idEmpleadoBeneficiario
        },
        dataType: "json",

        success: function (response) {

            if (response.success) {

                mostrarAlerta("success", "Éxito", response.mensaje);

                // si se estaba editando este mismo beneficiario, limpiar el formulario
                var enEdicion = $('#modalBeneficiarios').data('id_empleado_beneficiario');
                if (parseInt(enEdicion) === parseInt(idEmpleadoBeneficiario)) {
                    limpiarFormularioBeneficiario();
                }

                // recargar la lista de beneficiarios
                obtenerBeneficiarios(id_empleado);

            } else {

                console.error("Error:", response.mensaje);
            }
        },

        error: function (xhr, status, error) {

            console.error("Error AJAX al eliminar el beneficiario.");
            console.error("status:", status);
            console.error("error:", error);
            console.error("respuesta servidor:", xhr.responseText);
        }
    });
}
