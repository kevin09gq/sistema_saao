// ========================================
// LOGICA PARA EDITAR MONTO DE TARJETA
// ========================================

$(document).ready(function () {
    // Escuchar el clic en el botón de edición
    $(document).on('click', '.btn-editar-tarjeta', function () {
        habilitarEdicionTarjeta($(this));
    });

    // Escuchar el botón de cancelar
    $(document).on('click', '.btn-cancelar-edicion', function () {
        cancelarEdicionTarjeta($(this));
    });

    // Escuchar el botón de confirmar
    $(document).on('click', '.btn-confirmar-edicion', function () {
        confirmarEdicionTarjeta($(this));
         refrescarTabla();
    });

    // Permitir guardar con el Enter en el input
    $(document).on('keypress', '.input-edicion-tarjeta', function (e) {
        if (e.which === 13) {
            confirmarEdicionTarjeta($(this).closest('td').find('.btn-confirmar-edicion'));
        }
    });

    // Validar en tiempo real que no supere el máximo (tarjeta_copia)
    $(document).on('input', '.input-edicion-tarjeta', function () {
        const $input = $(this);
        const $tr = $input.closest('tr');
        const maxVal = parseFloat($tr.data('tarjeta-copia')) || 0;
        let valor = parseFloat($input.val()) || 0;

        if (valor > maxVal) {
            $input.val(maxVal);
        }
    });
});

/**
 * Cambia la celda de texto a un campo de entrada para editar
 */
function habilitarEdicionTarjeta($boton) {
    const $celda = $boton.closest('td');
    const valorActual = $celda.find('.valor-tarjeta').text().replace('$', '').replace(/,/g, '');
    
    // Guardar el valor original en un atributo data por si se cancela
    $celda.data('valor-original', valorActual);

    const htmlEdicion = `
        <div class="d-flex align-items-center justify-content-end gap-1">
            <input type="number" class="form-control form-control-sm text-end input-edicion-tarjeta" 
                   value="${valorActual}" step="0.01" style="width: 100px;">
            <button class="btn btn-sm btn-success btn-confirmar-edicion" title="Confirmar">
                <i class="bi bi-check-lg"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-cancelar-edicion" title="Cancelar">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
    `;

    $celda.html(htmlEdicion);
    $celda.find('.input-edicion-tarjeta').focus().select();
}

/**
 * Revierte los cambios y vuelve al estado de solo lectura
 */
function cancelarEdicionTarjeta($boton) {
    const $celda = $boton.closest('td');
    const valorOriginal = $celda.data('valor-original');
    restaurarCeldaLectura($celda, valorOriginal);
}

/**
 * Guarda el nuevo valor en el objeto global y actualiza la vista
 */
function confirmarEdicionTarjeta($boton) {
    const $tr = $boton.closest('tr');
    const $celda = $boton.closest('td');
    const claveEmpleado = $tr.data('clave');
    const maxVal = parseFloat($tr.data('tarjeta-copia')) || 0;
    
    let nuevoValor = parseFloat($celda.find('.input-edicion-tarjeta').val()) || 0;

    // Validación final antes de guardar
    if (nuevoValor > maxVal) {
        nuevoValor = maxVal;
    }

    // Actualizar en el JSON global
    let encontrado = false;
    jsonNomina40lbs.departamentos.forEach(depto => {
        depto.empleados.forEach(emp => {
            if (emp.clave == claveEmpleado) {
                emp.tarjeta = nuevoValor;
                encontrado = true;
            }
        });
    });

    if (encontrado) {
        restaurarCeldaLectura($celda, nuevoValor.toFixed(2));
        recalcularTotalTarjeta();
    } else {
        Swal.fire('Error', 'No se pudo encontrar al empleado para actualizar el dato.', 'error');
        cancelarEdicionTarjeta($boton);
    }
}

/**
 * Vuelve a poner la celda en modo lectura con el valor proporcionado
 */
function restaurarCeldaLectura($celda, valor) {
    const htmlLectura = `
        <div class="d-flex align-items-center justify-content-end gap-2">
            <span class="fw-bold text-dark valor-tarjeta">$${parseFloat(valor).toFixed(2)}</span>
            <button class="btn btn-sm btn-outline-primary btn-editar-tarjeta" title="Editar monto">
                <i class="bi bi-pencil-square"></i>
            </button>
        </div>
    `;
    $celda.html(htmlLectura);
}

/**
 * Recalcula el total de la tabla basándose en los datos actuales del DOM o del JSON
 * En este caso, lo haremos recorriendo las filas visibles para que coincida con el pie de tabla
 */
function recalcularTotalTarjeta() {
    let nuevoTotal = 0;
    
    // Obtenemos todos los empleados que están en el JSON y que deberían estar visibles 
    // según el filtro de departamento actual
    const deptoSeleccionado = $('#filtro-departamento-tarjeta').val();
    
    jsonNomina40lbs.departamentos.forEach(depto => {
        if (deptoSeleccionado === 'todos' || depto.nombre === deptoSeleccionado) {
            if (depto.nombre !== 'Sin Seguro') {
                depto.empleados.forEach(emp => {
                    if (emp.mostrar !== false) {
                        nuevoTotal += parseFloat(emp.tarjeta) || 0;
                    }
                });
            }
        }
    });

    $('#total-general-tarjeta').text('$' + nuevoTotal.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }));
}