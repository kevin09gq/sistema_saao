//====================================================
// FUNCIÓN PARA ABRIR EL MODAL DE REINGRESOS
// FUNCIÓN LLAMADA DESDE EL SWITCH DE ACCIONES
//====================================================

function abrirModalReingresos(idEmpleado) {

    // 2. Guardar el ID del empleado en el formulario
    $('#formReingresoEmpleado').data('id_empleado', idEmpleado);

    obtenerReingresos(idEmpleado);

    actualizarFechaAltaEmpresa(idEmpleado);

    actualizarFechaAltaImss(idEmpleado);

    aplicarPermisosReingresosFechas();

    // 4. Abrir el modal
    $('#modalReingresos').modal('show');
}



//====================================================
// FUNCIÓN AUXILIAR PARA FORMATEAR FECHAS
//====================================================

function formatearFecha(fecha) {
    if (!fecha) return '';

    const meses = [
        'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
        'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
    ];

    const fechaObj = new Date(fecha);
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const mes = meses[fechaObj.getMonth()];
    const anio = fechaObj.getFullYear();

    return `${dia}/${mes}/${anio}`;
}


//====================================================
// FUNCIÓN PARA ACTUALIZAR LA FECHA DE ALTA EMPRESA
//====================================================

function actualizarFechaAltaEmpresa(idEmpleado) {

    $(document).on('click', '#btnActualizarFechaAltaEmpresa', function () {

        const fechaAltaEmpresa = $('#editarFechaAltaEmpresa').val();

        if (!fechaAltaEmpresa) {
            mostrarAlerta('error', 'Error', 'La fecha de alta empresa es obligatoria.');
            return;
        }

        $.ajax({
            type: "POST",
            url: "../php/infoReingresos.php",
            data: {
                accion: "actualizarFechaAltaEmpresa",
                id_empleado: idEmpleado,
                fecha_alta_empresa: fechaAltaEmpresa
            },
            dataType: "json",

            success: function (response) {
                if (response.success) {
                    mostrarAlerta('success', 'Éxito', response.mensaje);

                    // actualizar la información del empleado en la tabla manteniendo página y filtros
                    obtenerEmpleados(true);
                } else {
                    mostrarAlerta('error', 'Error', response.mensaje);
                }
            },

            error: function (xhr, status, error) {
                console.error("Error al actualizar fecha alta empresa:", error);
                console.error(xhr.responseText);
                mostrarAlerta('error', 'Error', 'Error al actualizar la fecha de alta empresa.');
            }
        });
    });
}

//====================================================
// FUNCIÓN PARA ACTUALIZAR LA FECHA DE ALTA IMSS
//====================================================

function actualizarFechaAltaImss(idEmpleado) {

    $(document).on('click', '#btnActualizarFechaAltaImss', function () {

        const fechaAltaImss = $('#editarFechaAltaImss').val();

        if (!fechaAltaImss) {
            mostrarAlerta('error', 'Error', 'La fecha de alta IMSS es obligatoria.');
            return;
        }

        $.ajax({
            type: "POST",
            url: "../php/infoReingresos.php",
            data: {
                accion: "actualizarFechaAltaImss",
                id_empleado: idEmpleado,
                fecha_alta_imss: fechaAltaImss
            },
            dataType: "json",

            success: function (response) {
                if (response.success) {
                    mostrarAlerta('success', 'Éxito', response.mensaje);
                } else {
                    mostrarAlerta('error', 'Error', response.mensaje);
                }
            },

            error: function (xhr, status, error) {
                console.error("Error al actualizar fecha alta IMSS:", error);
                console.error(xhr.responseText);
                mostrarAlerta('error', 'Error', 'Error al actualizar la fecha de alta IMSS.');
            }
        });
    });
}

//====================================================
// FUNCIÓN PARA OBTENER EL HISTORIAL DE REINGRESOS 
// DE UN EMPLEADO
//====================================================

function obtenerReingresos(idEmpleado) {

    $.ajax({
        type: "POST",
        url: "../php/infoReingresos.php",
        data: {
            accion: "obtenerReingresos",
            id_empleado: idEmpleado
        },
        dataType: "json",

        success: function (response) {

            // validar si la consulta fue exitosa
            if (!response.success) {
                console.error(response.mensaje);
                return;
            }

            // colocar las fechas actuales del empleado
            $('#editarFechaAltaEmpresa').val(
                response.empleado.fecha_alta_empresa || ''
            );

            $('#editarFechaAltaImss').val(
                response.empleado.fecha_alta_imss || ''
            );

            // obtener el tbody de la tabla
            const tbody = $('#tablaHistorialReingresos');

            // limpiar la tabla
            tbody.empty();

            // validar si existen reingresos
            if (!response.reingresos || response.reingresos.length === 0) {

                tbody.html(`
                    <tr id="filaSinReingresos">
                        <td colspan="4" class="text-center text-muted py-4">
                            No hay reingresos registrados
                        </td>
                    </tr>
                `);

                // Habilitar la fecha de alta empresa cuando no hay reingresos
                $('#editarFechaAltaEmpresa').prop('disabled', false);
                $('#btnActualizarFechaAltaEmpresa').prop('disabled', false);

                // Aplicar permisos DESPUÉS de habilitar/deshabilitar
                aplicarPermisosReingresosFechas();

                return;
            }

            // recorrer los reingresos
            response.reingresos.forEach((reingreso, index) => {

                // mostrar texto cuando todavía no existe fecha de salida
                const fechaSalida = reingreso.fecha_salida
                    ? formatearFecha(reingreso.fecha_salida)
                    : 'Activo';

                // agregar la fila a la tabla
                tbody.append(`
                    <tr
                        id="filaReingreso_${reingreso.id_historial}"
                        data-fecha-reingreso="${reingreso.fecha_reingreso}"
                        data-fecha-salida="${reingreso.fecha_salida || ''}">

                        <td>
                            ${index + 1}
                        </td>

                        <td class="fecha-reingreso">
                            ${formatearFecha(reingreso.fecha_reingreso)}
                        </td>

                        <td class="fecha-salida">
                            ${fechaSalida}
                        </td>

                        <td class="text-center">

                            <button
                                type="button"
                                class="btn  btn-outline-primary btn-editar-reingreso"
                                onclick="editarReingreso(${reingreso.id_historial})">
                                <i class="bi bi-pencil-square"></i>

                            </button>

                            <button
                                type="button"
                                class="btn btn-outline-danger btn-eliminar-reingreso"
                                onclick="eliminarReingreso(${reingreso.id_historial})">
                                <i class="bi bi-trash3"></i>

                            </button>

                        </td>

                    </tr>
                `);
            });

            // Si hay reingresos, deshabilitar la fecha de alta empresa
            if (response.reingresos && response.reingresos.length > 0) {
                $('#editarFechaAltaEmpresa').prop('disabled', true);
                $('#btnActualizarFechaAltaEmpresa').prop('disabled', true);
            } else {
                $('#editarFechaAltaEmpresa').prop('disabled', false);
                $('#btnActualizarFechaAltaEmpresa').prop('disabled', false);
            }

            // Aplicar permisos DESPUÉS de habilitar/deshabilitar según reingresos
            aplicarPermisosReingresosFechas();
        },

        error: function (xhr, status, error) {

            console.error("error al obtener los reingresos:", error);

            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCIÓN PARA EDITAR UN REINGRESO CUANDO SE HACE 
// CLICK EN EL BOTÓN EDITAR SE HABILITAN LOS INPUTS DE 
// FECHA Y SE CAMBIA EL BOTÓN A GUARDAR
//====================================================

function editarReingreso(idHistorial) {

    // obtener la fila actual
    const fila = $(`#filaReingreso_${idHistorial}`);

    // obtener las fechas actuales
    const fechaReingreso = fila.data('fecha-reingreso');
    const fechaSalida = fila.data('fecha-salida');

    // obtener todas las filas de reingresos
    const filas = $('#tablaHistorialReingresos tr[id^="filaReingreso_"]');

    // obtener la posición de la fila actual
    const indice = filas.index(fila);

    // obtener la fila anterior y siguiente
    const filaAnterior = indice > 0 ? filas.eq(indice - 1) : null;
    const filaSiguiente = indice < filas.length - 1
        ? filas.eq(indice + 1)
        : null;

    // cambiar la fecha de reingreso por un input
    fila.find('.fecha-reingreso').html(`
        <input
            type="date"
            class="form-control form-control-sm"
            value="${fechaReingreso}">
    `);

    // cambiar la fecha de salida por un input
    fila.find('.fecha-salida').html(`
        <input
            type="date"
            class="form-control form-control-sm"
            value="${fechaSalida || ''}">
    `);

    // cambiar el botón editar por guardar y cancelar
    fila.find('.btn-editar-reingreso').replaceWith(`
        <button
            type="button"
            class="btn  btn-outline-success btn-guardar-reingreso"
            onclick="guardarFechasReingreso(${idHistorial})">
            <i class="bi bi-check"></i>
        </button>

        <button
            type="button"
            class="btn btn-outline-secondary btn-cancelar-reingreso"
            onclick="cancelarEdicionReingreso(${idHistorial})">
            <i class="bi bi-x"></i>
        </button>
    `);

    // ocultar el botón de eliminar durante la edición
    fila.find('.btn-eliminar-reingreso').hide();
}


//=======================================================
// FUNCIÓN PARA GUARDAR LAS FECHAS DE REINGRESO Y SALIDA
//=======================================================

function guardarFechasReingreso(idHistorial) {

    // obtener la fila actual
    const fila = $(`#filaReingreso_${idHistorial}`);

    // obtener las fechas de los inputs
    const fechaReingreso = fila.find('.fecha-reingreso input').val();
    const fechaSalida = fila.find('.fecha-salida input').val();

    // obtener la fecha de alta de la empresa
    const fechaAltaEmpresa = $('#editarFechaAltaEmpresa').val();

    // obtener todas las filas de reingresos
    const filas = $('#tablaHistorialReingresos tr[id^="filaReingreso_"]');

    // obtener la posición de la fila actual
    const indice = filas.index(fila);

    // obtener la fila anterior y siguiente
    const filaAnterior = indice > 0 ? filas.eq(indice - 1) : null;
    const filaSiguiente = indice < filas.length - 1
        ? filas.eq(indice + 1)
        : null;

    // obtener la fecha de salida del reingreso anterior
    const fechaSalidaAnterior = filaAnterior
        ? filaAnterior.data('fecha-salida')
        : '';

    // obtener la fecha de reingreso del siguiente registro
    const fechaReingresoSiguiente = filaSiguiente
        ? filaSiguiente.data('fecha-reingreso')
        : '';

    // validar las fechas
    if (!validarFechasReingreso(
        fechaReingreso,
        fechaSalida,
        fechaAltaEmpresa,
        fechaSalidaAnterior,
        fechaReingresoSiguiente
    )) {
        return;
    }

    // obtener el id del empleado
    const idEmpleado = $('#formReingresoEmpleado').data('id_empleado');

    // hacer la llamada AJAX para actualizar
    $.ajax({
        type: "POST",
        url: "../php/infoReingresos.php",
        data: {
            accion: "actualizarReingreso",
            id_historial: idHistorial,
            id_empleado: idEmpleado,
            fecha_reingreso: fechaReingreso,
            fecha_salida: fechaSalida
        },
        dataType: "json",

        success: function (response) {
            if (response.success) {
                mostrarAlerta('success', 'Éxito', response.mensaje);

                // actualizar los datos de la fila
                fila.data('fecha-reingreso', fechaReingreso);
                fila.data('fecha-salida', fechaSalida);

                // mostrar texto cuando todavía no existe fecha de salida
                const fechaSalidaTexto = fechaSalida ? formatearFecha(fechaSalida) : 'Activo';

                // restaurar la fecha de reingreso
                fila.find('.fecha-reingreso').html(formatearFecha(fechaReingreso));

                // restaurar la fecha de salida
                fila.find('.fecha-salida').html(fechaSalidaTexto);

                // cambiar los botones de vuelta a editar y eliminar
                fila.find('.btn-guardar-reingreso').replaceWith(`
                    <button
                        type="button"
                        class="btn btn-outline-primary btn-editar-reingreso"
                        onclick="editarReingreso(${idHistorial})">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                `);

                fila.find('.btn-cancelar-reingreso').remove();

                // mostrar nuevamente el botón de eliminar
                fila.find('.btn-eliminar-reingreso').show();

                obtenerEmpleados(true);
            } else {
                mostrarAlerta('error', 'Error', response.mensaje);
            }
        },

        error: function (xhr, status, error) {
            console.error("Error al actualizar reingreso:", error);
            console.error(xhr.responseText);
            mostrarAlerta('error', 'Error', 'Error al actualizar el reingreso.');
        }
    });
}



//====================================================
// FUNCIÓN PARA CANCELAR LA EDICIÓN DE UN REINGRESO
//====================================================

function cancelarEdicionReingreso(idHistorial) {

    // obtener la fila actual
    const fila = $(`#filaReingreso_${idHistorial}`);

    // obtener las fechas originales
    const fechaReingreso = fila.data('fecha-reingreso');
    const fechaSalida = fila.data('fecha-salida');

    // mostrar texto cuando todavía no existe fecha de salida
    const fechaSalidaTexto = fechaSalida ? formatearFecha(fechaSalida) : 'Activo';

    // restaurar la fecha de reingreso
    fila.find('.fecha-reingreso').html(formatearFecha(fechaReingreso));

    // restaurar la fecha de salida
    fila.find('.fecha-salida').html(fechaSalidaTexto);

    // cambiar los botones de vuelta a editar y eliminar
    fila.find('.btn-guardar-reingreso').replaceWith(`
        <button
            type="button"
            class="btn btn-outline-primary btn-editar-reingreso"
            onclick="editarReingreso(${idHistorial})">
            <i class="bi bi-pencil-square"></i>
        </button>
    `);

    fila.find('.btn-cancelar-reingreso').remove();

    // mostrar nuevamente el botón de eliminar
    fila.find('.btn-eliminar-reingreso').show();
}


//====================================================
// FUNCIÓN PARA ELIMINAR UN REINGRESO
//====================================================

function eliminarReingreso(idHistorial) {

    // obtener la fila actual
    const fila = $(`#filaReingreso_${idHistorial}`);

    // obtener todas las filas de reingresos
    const filas = $('#tablaHistorialReingresos tr[id^="filaReingreso_"]');

    // obtener la posición de la fila actual
    const indice = filas.index(fila);

    // verificar si hay filas posteriores
    if (indice < filas.length - 1) {
        mostrarAlerta('error', 'Error', 'No se puede eliminar este reingreso porque hay reingresos posteriores. Debe eliminar los reingresos más recientes primero.');
        return;
    }

    // mostrar confirmación con SweetAlert
    Swal.fire({
        title: '¿Está seguro?',
        text: '¿Desea eliminar este reingreso?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // obtener el id del empleado
            const idEmpleado = $('#formReingresoEmpleado').data('id_empleado');

            // hacer la llamada AJAX para eliminar
            $.ajax({
                type: "POST",
                url: "../php/infoReingresos.php",
                data: {
                    accion: "eliminarReingreso",
                    id_historial: idHistorial,
                    id_empleado: idEmpleado
                },
                dataType: "json",

                success: function (response) {
                    if (response.success) {
                        mostrarAlerta('success', 'Éxito', response.mensaje);

                        // recargar los reingresos para actualizar la tabla
                        obtenerReingresos(idEmpleado);

                        obtenerEmpleados(true);
                    } else {
                        mostrarAlerta('error', 'Error', response.mensaje);
                    }
                },

                error: function (xhr, status, error) {
                    console.error("Error al eliminar reingreso:", error);
                    console.error(xhr.responseText);
                    mostrarAlerta('error', 'Error', 'Error al eliminar el reingreso.');
                }
            });
        }
    });
}


//=======================================================
// FUNCIÓN PARA VALIDAR LAS FECHAS DE REINGRESO Y SALIDA
//=======================================================

function validarFechasReingreso(fechaReingreso, fechaSalida, fechaAltaEmpresa, fechaSalidaAnterior, fechaReingresoSiguiente) {

    // validar que exista la fecha de alta de la empresa
    if (!fechaAltaEmpresa) {
        mostrarAlerta('error', 'Error', 'La fecha de alta de la empresa es obligatoria.');
        return false;
    }

    // validar que exista la fecha de reingreso
    if (!fechaReingreso) {

        // no permitir salida si no existe reingreso
        if (fechaSalida) {
            mostrarAlerta('error', 'Error', 'No se puede establecer una fecha de salida sin una fecha de reingreso.');
            return false;
        }

        mostrarAlerta('error', 'Error', 'La fecha de reingreso es obligatoria.');
        return false;
    }

    // validar contra la fecha de alta de la empresa
    if (fechaReingreso < fechaAltaEmpresa) {
        mostrarAlerta('error', 'Error', 'La fecha de reingreso no puede ser anterior a la fecha de alta de la empresa.');
        return false;
    }

    // validar contra la salida del reingreso anterior
    if (fechaSalidaAnterior && fechaReingreso < fechaSalidaAnterior) {
        mostrarAlerta('error', 'Error', 'La fecha de reingreso no puede ser anterior a la fecha de salida del reingreso anterior.');
        return false;
    }

    // validar que la salida no sea anterior al reingreso
    if (fechaSalida && fechaSalida < fechaReingreso) {
        mostrarAlerta('error', 'Error', 'La fecha de salida no puede ser anterior a la fecha de reingreso.');
        return false;
    }

    // validar que exista salida si hay un siguiente reingreso
    if (!fechaSalida && fechaReingresoSiguiente) {
        mostrarAlerta('error', 'Error', 'La fecha de salida es obligatoria porque existe un siguiente reingreso.');
        return false;
    }

    // validar contra el siguiente reingreso
    if (fechaSalida && fechaReingresoSiguiente && fechaSalida > fechaReingresoSiguiente) {
        mostrarAlerta('error', 'Error', 'La fecha de salida no puede ser posterior al siguiente reingreso.');
        return false;
    }

    // todas las fechas son válidas
    return true;
}

//====================================================
// FUNCIÓN PARA ABRIR EL MODAL DE NUEVO REINGRESO
//====================================================

function abrirModalNuevoReingreso() {
    // Limpiar el formulario
    $('#formNuevoReingreso')[0].reset();

    // Obtener la fecha de alta empresa
    const fechaAltaEmpresa = $('#editarFechaAltaEmpresa').val();

    // Obtener el último reingreso para validar
    const filas = $('#tablaHistorialReingresos tr[id^="filaReingreso_"]');

    // Si no hay reingresos, prellenar la fecha de reingreso con la fecha de alta empresa
    if (filas.length === 0 && fechaAltaEmpresa) {
        $('#nuevaFechaReingreso').val(fechaAltaEmpresa);
    }

    // Abrir el modal
    $('#modalNuevoReingreso').modal('show');
}

//====================================================
// EVENT LISTENER PARA GUARDAR NUEVO REINGRESO
//====================================================

$(document).on('click', '#btnGuardarNuevoReingreso', function () {
    const idEmpleado = $('#formReingresoEmpleado').data('id_empleado');
    const fechaReingreso = $('#nuevaFechaReingreso').val();
    const fechaSalida = $('#nuevaFechaSalida').val();

    if (!fechaReingreso) {
        mostrarAlerta('error', 'Error', 'La fecha de reingreso es obligatoria.');
        return;
    }

    // Validar las fechas del nuevo reingreso
    if (!validarNuevoReingreso(idEmpleado, fechaReingreso, fechaSalida)) {
        return;
    }

    // Hacer la llamada AJAX para crear el reingreso
    $.ajax({
        type: "POST",
        url: "../php/infoReingresos.php",
        data: {
            accion: "crearReingreso",
            id_empleado: idEmpleado,
            fecha_reingreso: fechaReingreso,
            fecha_salida: fechaSalida
        },
        dataType: "json",

        success: function (response) {
            if (response.success) {
                mostrarAlerta('success', 'Éxito', response.mensaje);

                // Cerrar el modal de nuevo reingreso
                $('#modalNuevoReingreso').modal('hide');

                // Recargar los reingresos para actualizar la tabla
                obtenerReingresos(idEmpleado);

                obtenerEmpleados(true);

                
            } else {
                mostrarAlerta('error', 'Error', response.mensaje);
            }
        },

        error: function (xhr, status, error) {
            console.error("Error al crear reingreso:", error);
            console.error(xhr.responseText);
            mostrarAlerta('error', 'Error', 'Error al crear el reingreso.');
        }
    });
});


//====================================================
// FUNCIÓN PARA VALIDAR NUEVO REINGRESO
//====================================================

function validarNuevoReingreso(idEmpleado, fechaReingreso, fechaSalida) {
    const fechaAltaEmpresa = $('#editarFechaAltaEmpresa').val();

    // Validar que exista la fecha de alta de la empresa
    if (!fechaAltaEmpresa) {
        mostrarAlerta('error', 'Error', 'La fecha de alta de la empresa es obligatoria.');
        return false;
    }

    // Validar que la fecha de reingreso no sea anterior a la fecha de alta de la empresa
    if (fechaReingreso < fechaAltaEmpresa) {
        mostrarAlerta('error', 'Error', 'La fecha de reingreso no puede ser anterior a la fecha de alta de la empresa.');
        return false;
    }

    // Obtener el último reingreso para validar
    const filas = $('#tablaHistorialReingresos tr[id^="filaReingreso_"]');
    const fechaSalidaUltimo = filas.length > 0
        ? filas.last().data('fecha-salida')
        : '';

    // Si existe un reingreso anterior, validar que el nuevo sea posterior a la salida del anterior
    if (fechaSalidaUltimo && fechaReingreso <= fechaSalidaUltimo) {
        mostrarAlerta('error', 'Error', 'La fecha de reingreso debe ser posterior a la fecha de salida del reingreso anterior.');
        return false;
    }

    // Validar que la fecha de salida no sea anterior a la fecha de reingreso
    if (fechaSalida && fechaSalida < fechaReingreso) {
        mostrarAlerta('error', 'Error', 'La fecha de salida no puede ser anterior a la fecha de reingreso.');
        return false;
    }

    return true;
}
