$(document).ready(function () {
   agregarBeneficiario();
});


//===============================================================
// FUNCIÓN PARA AGREGAR UN BENEFICIARIO A LA LISTA
//===============================================================

function agregarBeneficiario() {
    $("#btnAgregarBeneficiario").click(function (e) {
        e.preventDefault();

        // Obtener los datos del formulario de beneficiario
        const nombre = $('#registroBeneficiarioNombre').val().trim().toUpperCase();
        const apPaterno = $('#registroBeneficiarioApellidoPaterno').val().trim().toUpperCase();
        const apMaterno = $('#registroBeneficiarioApellidoMaterno').val().trim().toUpperCase();
        const parentesco = $('#registroBeneficiarioParentesco').val().trim().toUpperCase();
        const porcentaje = parseFloat($('#registroBeneficiarioPorcentaje').val()) || 0;

        // Validar campos obligatorios
        if (!nombre) {
            mostrarAlerta("warning", "Campo obligatorio", "Por favor ingrese el nombre del beneficiario.");
            $('#registroBeneficiarioNombre').focus();
            return;
        }

        if (!apPaterno) {
            mostrarAlerta("warning", "Campo obligatorio", "Por favor ingrese el apellido paterno del beneficiario.");
            $('#registroBeneficiarioApellidoPaterno').focus();
            return;
        }

        if (porcentaje <= 0 || porcentaje > 100) {
            mostrarAlerta("warning", "Porcentaje inválido", "El porcentaje debe ser mayor a 0 y menor o igual a 100.");
            $('#registroBeneficiarioPorcentaje').focus();
            return;
        }

        // Obtener el ID del empleado
        const idEmpleado = $('#registroIdEmpleado').val() || $('#formRegistroEmpleado').data('id_empleado');

        if (!idEmpleado) {
            mostrarAlerta("error", "Error", "No se ha registrado el empleado aún. Por favor complete el paso 1 primero.");
            return;
        }

        // Calcular el porcentaje total actual
        const porcentajeTotal = calcularPorcentajeTotal();

        if ((porcentajeTotal + porcentaje) > 100) {
            const disponible = 100 - porcentajeTotal;
            mostrarAlerta("warning", "Porcentaje excedido", `El porcentaje total superaría el 100%. Porcentaje disponible: ${disponible}%`);
            return;
        }

        // Enviar datos al endpoint reutilizado infoBeneficiarios.php
        $.ajax({
            type: "POST",
            url: "../../empleados/php/infoBeneficiarios.php",
            data: {
                accion: "guardarBeneficiario",
                id_empleado: idEmpleado,
                nombre: nombre,
                ap_paterno: apPaterno,
                ap_materno: apMaterno,
                parentesco: parentesco,
                porcentaje: porcentaje
            },
            dataType: "json",

            success: function (response) {
                if (response.success) {
                    mostrarAlerta(
                        "success",
                        "Beneficiario agregado",
                        "El beneficiario se ha agregado correctamente."
                    );

                    // Limpiar el formulario
                    $('#registroBeneficiarioNombre').val('');
                    $('#registroBeneficiarioApellidoPaterno').val('');
                    $('#registroBeneficiarioApellidoMaterno').val('');
                    $('#registroBeneficiarioParentesco').val('');
                    $('#registroBeneficiarioPorcentaje').val('');

                    // Actualizar la tabla de beneficiarios primero
                    actualizarTablaBeneficiarios(idEmpleado).done(function () {
                        // Luego actualizar el porcentaje total después de que la tabla se actualice
                        setTimeout(function () {
                            actualizarPorcentajeTotal();
                        }, 100);
                    });

                } else {
                    mostrarAlerta(
                        "error",
                        "Error al agregar",
                        response.mensaje || "Hubo un error al agregar el beneficiario."
                    );
                }
            },
            error: function (xhr, status, error) {
                console.error("Error AJAX al agregar beneficiario.");
                console.error("status:", status);
                console.error("error:", error);
                console.error("respuesta servidor:", xhr.responseText);

                mostrarAlerta(
                    "error",
                    "Error de conexión",
                    "No se pudo conectar con el servidor para agregar el beneficiario."
                );
            },

        });

    });
}

//===============================================================
// FUNCIÓN PARA ACTUALIZAR LA TABLA DE BENEFICIARIOS
//===============================================================

function actualizarTablaBeneficiarios(idEmpleado) {
    return $.ajax({
        type: "POST",
        url: "../../empleados/php/infoBeneficiarios.php",
        data: {
            accion: "obtenerBeneficiarios",
            id_empleado: idEmpleado
        },
        dataType: "json",

        success: function (response) {
            if (response.success) {
                renderizarBeneficiarios(response.beneficiarios);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error AJAX al obtener beneficiarios.");
            console.error("status:", status);
            console.error("error:", error);
        }
    });
}

//===============================================================
// FUNCIÓN PARA RENDERIZAR LOS BENEFICIARIOS EN LA TABLA
//===============================================================

function renderizarBeneficiarios(beneficiarios) {
    const tbody = $('#registroTablaBeneficiarios');
    tbody.empty();

    if (!beneficiarios || beneficiarios.length === 0) {
        tbody.html(`
            <tr id="registroFilaSinBeneficiarios">
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-person-x fs-3 d-block mb-2"></i>
                    No hay beneficiarios registrados
                </td>
            </tr>
        `);
        return;
    }

    beneficiarios.forEach(function (beneficiario, index) {
        const fila = `
            <tr>
                <td>${index + 1}</td>
                <td>${beneficiario.nombre || ''}</td>
                <td>${beneficiario.ap_paterno || ''}</td>
                <td>${beneficiario.ap_materno || ''}</td>
                <td>${beneficiario.parentesco || ''}</td>
                <td class="text-center">${parseFloat(beneficiario.porcentaje).toFixed(2)}%</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger btn-eliminar-beneficiario"
                            data-id="${beneficiario.id_empleado_beneficiario}"
                            title="Eliminar beneficiario">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.append(fila);
    });

    // Agregar eventos a los botones de eliminar recién creados
    $('.btn-eliminar-beneficiario').off('click').on('click', function () {
        const idRelacion = $(this).data('id');
        const idEmpleado = $('#registroIdEmpleado').val() || $('#formRegistroEmpleado').data('id_empleado');

        Swal.fire({
            title: '¿Eliminar beneficiario?',
            text: '¿Está seguro de eliminar este beneficiario?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../../empleados/php/infoBeneficiarios.php",
                    data: {
                        accion: "eliminarBeneficiario",
                        id_empleado: idEmpleado,
                        id_empleado_beneficiario: idRelacion
                    },
                    dataType: "json",

                    success: function (response) {
                        if (response.success) {
                            mostrarAlerta("success", "Beneficiario eliminado", "El beneficiario se ha eliminado correctamente.");

                            // Actualizar la tabla primero
                            actualizarTablaBeneficiarios(idEmpleado).done(function() {
                                // Luego actualizar el porcentaje total
                                setTimeout(function() {
                                    actualizarPorcentajeTotal();
                                }, 100);
                            });
                        } else {
                            mostrarAlerta("error", "Error al eliminar", response.mensaje || "Hubo un error al eliminar el beneficiario.");
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Error AJAX al eliminar beneficiario.");
                        mostrarAlerta("error", "Error de conexión", "No se pudo conectar con el servidor.");
                    }
                });
            }
        });
    });

}

//===============================================================
// FUNCIÓN PARA CALCULAR EL PORCENTAJE TOTAL DE BENEFICIARIOS
//===============================================================

function calcularPorcentajeTotal() {
    let total = 0;

    $('#registroTablaBeneficiarios tr').each(function () {
        const porcentajeTexto = $(this).find('td').eq(5).text();
        const porcentaje = parseFloat(porcentajeTexto) || 0;
        total += porcentaje;
    });

    return total;
}

//===============================================================
// FUNCIÓN PARA ACTUALIZAR EL PORCENTAJE TOTAL EN LA INTERFAZ
//===============================================================

function actualizarPorcentajeTotal() {
    const total = calcularPorcentajeTotal();
    const disponible = 100 - total;

    $('#registroBeneficiariosPorcentajeTotal').text(total.toFixed(2) + '%');
    $('#registroPorcentajeAsignado').text(total.toFixed(2) + '%');
    $('#registroPorcentajeDisponible').text(disponible.toFixed(2) + '%');

    // Cambiar color si excede el 100%
    if (total > 100) {
        $('#registroPorcentajeAsignado').removeClass('fw-bold').addClass('fw-bold text-danger');
    } else {
        $('#registroPorcentajeAsignado').removeClass('text-danger').addClass('fw-bold');
    }
}


