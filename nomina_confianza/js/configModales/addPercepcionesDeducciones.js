$(document).ready(function () {
    // Evento para abrir el modal
    $('#btn_add_percepciones_deducciones').on('click', function () {
        cargarEmpleadosMasivo();
        $('#modalAddPercepcionesDeducciones').modal('show');
    });

    // Checkbox para seleccionar/deseleccionar todos
    $('#check-all-masivo').on('change', function () {
        const isChecked = $(this).is(':checked');
        $('.check-empleado-masivo:visible').prop('checked', isChecked);
        $('.check-depto-masivo:visible').prop('checked', isChecked);
        actualizarContadorSeleccionados();
    });

    // Checkbox de departamento para seleccionar/deseleccionar empleados del departamento
    $(document).on('change', '.check-depto-masivo', function () {
        const deptoId = $(this).data('depto-id');
        const isChecked = $(this).is(':checked');
        $(`.emp-row-depto-masivo-${deptoId}:visible .check-empleado-masivo`).prop('checked', isChecked);
        actualizarContadorSeleccionados();
    });

    // Contador de seleccionados al cambiar checkboxes individuales
    $(document).on('change', '.check-empleado-masivo', function () {
        actualizarContadorSeleccionados();
    });

    // Buscador de empleados
    $('#buscar-empleado-masivo').on('input', function () {
        const busqueda = $(this).val().toLowerCase();
        $('#tbody-empleados-masivo tr').each(function () {
            // No ocultar las filas de encabezado de departamento si tienen elementos hijos visibles
            if ($(this).hasClass('table-secondary')) return;

            const texto = $(this).text().toLowerCase();
            $(this).toggle(texto.indexOf(busqueda) > -1);
        });

        // Ocultar cabeceras de departamento si no hay empleados visibles en él
        $('.depto-header-row-masivo').each(function () {
            const deptoId = $(this).data('depto-id');
            const empleadosVisibles = $(`.emp-row-depto-masivo-${deptoId}:visible`).length;
            $(this).toggle(empleadosVisibles > 0);
        });

        actualizarContadorSeleccionados();
    });

    // Botón para aplicar el concepto
    $('#btn-aplicar-concepto-masivo').on('click', function () {
        aplicarConceptoMasivo();
    });
});

//======================================================
// CARGAR LA LISTA DE EMPLEADOS EN EL MODAL
//======================================================
function cargarEmpleadosMasivo() {
    if (!jsonNominaConfianza || !jsonNominaConfianza.departamentos) return;

    const tbody = $('#tbody-empleados-masivo');
    tbody.empty();
    $('#check-all-masivo').prop('checked', false);
    $('#buscar-empleado-masivo').val('');
    $('#nombre-concepto-masivo').val('');
    $('#importe-concepto-masivo').val('0.00');

    let deptoCounter = 0;

    jsonNominaConfianza.departamentos.forEach(depto => {
        // Filtrar empleados que se muestran en la nómina
        const empleadosVisibles = depto.empleados.filter(emp => emp.mostrar !== false);

        if (empleadosVisibles.length === 0) return;

        deptoCounter++;

        // Fila de encabezado de departamento con checkbox
        tbody.append(`
            <tr class="table-secondary depto-header-row-masivo" data-depto-id="${deptoCounter}">
                <td class="text-center">
                    <input class="form-check-input check-depto-masivo" type="checkbox" data-depto-id="${deptoCounter}">
                </td>
                <td colspan="3" class="fw-bold">
                    <i class="bi bi-building"></i> ${depto.nombre} 
                    <small class="fw-normal text-muted ms-1">(${empleadosVisibles.length} empleados)</small>
                </td>
            </tr>
        `);

        // Ordenar por nombre
        empleadosVisibles.sort((a, b) => a.nombre.localeCompare(b.nombre));

        empleadosVisibles.forEach(empleado => {
            const fila = `
                <tr class="emp-row-depto-masivo-${deptoCounter}">
                    <td class="text-center">
                        <input class="form-check-input check-empleado-masivo" type="checkbox" 
                               data-clave="${empleado.clave}" 
                               data-empresa="${empleado.id_empresa}">
                    </td>
                    <td class="text-center small fw-bold text-muted">${empleado.clave}</td>
                    <td colspan="2">
                        <div class="fw-bold" style="font-size: 0.9rem;">${empleado.nombre}</div>
                    </td>
                </tr>
            `;
            tbody.append(fila);
        });
    });

    actualizarContadorSeleccionados();
}

//======================================================
// ACTUALIZAR EL CONTADOR DE EMPLEADOS SELECCIONADOS
//======================================================
function actualizarContadorSeleccionados() {
    const total = $('.check-empleado-masivo:checked').length;
    $('#contador-seleccionados-masivo').text(total);

    // Actualizar estado de los checkboxes de departamento
    $('.depto-header-row-masivo:visible').each(function () {
        const deptoId = $(this).data('depto-id');
        const $empChecks = $(`.emp-row-depto-masivo-${deptoId}:visible .check-empleado-masivo`);
        if ($empChecks.length > 0) {
            const allChecked = $empChecks.length === $empChecks.filter(':checked').length;
            $(this).find('.check-depto-masivo').prop('checked', allChecked);
        } else {
            $(this).find('.check-depto-masivo').prop('checked', false);
        }
    });

    // Actualizar estado del checkbox principal (check-all)
    const $todosVisibles = $('.check-empleado-masivo:visible');
    if ($todosVisibles.length > 0) {
        const todosChecked = $todosVisibles.length === $todosVisibles.filter(':checked').length;
        $('#check-all-masivo').prop('checked', todosChecked);
    } else {
        $('#check-all-masivo').prop('checked', false);
    }
}

//======================================================
// APLICAR EL CONCEPTO A LOS EMPLEADOS SELECCIONADOS
//======================================================
function aplicarConceptoMasivo() {
    const tipo = $('#tipo-concepto-masivo').val();
    const nombre = $('#nombre-concepto-masivo').val().trim();
    const importe = parseFloat($('#importe-concepto-masivo').val()) || 0;

    // Validaciones
    if (!nombre) {
        swal.fire('Error', 'Por favor ingresa el nombre del concepto', 'error');
        return;
    }

    if (importe <= 0) {
        swal.fire('Error', 'El importe debe ser mayor a 0', 'error');
        return;
    }

    const seleccionados = [];
    $('.check-empleado-masivo:checked').each(function () {
        seleccionados.push({
            clave: String($(this).data('clave')),
            empresa: String($(this).data('empresa'))
        });
    });

    if (seleccionados.length === 0) {
        swal.fire('Atención', 'Selecciona al menos un empleado', 'warning');
        return;
    }

    // Confirmación
    swal.fire({
        title: '¿Estás seguro?',
        text: `Se aplicará el concepto "${nombre}" de $${importe.toFixed(2)} a ${seleccionados.length} empleados.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, aplicar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            let totalAplicados = 0;

            // Iterar sobre el JSON de la nómina
            jsonNominaConfianza.departamentos.forEach(depto => {
                depto.empleados.forEach(empleado => {
                    const claveEmp = String(empleado.clave);
                    const empresaEmp = String(empleado.id_empresa);

                    // Verificar si está en la lista de seleccionados
                    const estaSeleccionado = seleccionados.some(sel => sel.clave === claveEmp && sel.empresa === empresaEmp);

                    if (estaSeleccionado) {
                        const nuevoConcepto = {
                            nombre: nombre,
                            cantidad: importe
                        };

                        if (tipo === 'percepcion') {
                            if (!Array.isArray(empleado.percepciones_extra)) empleado.percepciones_extra = [];
                            empleado.percepciones_extra.push(nuevoConcepto);

                            // Actualizar el total acumulado de percepciones extras
                            empleado.sueldo_extra_total = empleado.percepciones_extra.reduce((sum, p) => sum + (parseFloat(p.cantidad) || 0), 0);
                        } else {
                            if (!Array.isArray(empleado.deducciones_extra)) empleado.deducciones_extra = [];
                            empleado.deducciones_extra.push(nuevoConcepto);

                            // Actualizar el total acumulado de deducciones extras (F.A/Gafet/Cofia)
                            empleado.fa_gafet_cofia = empleado.deducciones_extra.reduce((sum, d) => sum + (parseFloat(d.cantidad) || 0), 0);
                        }

                        // Recalcular el total del empleado para que se refleje en la tabla principal
                        if (typeof calcularTotalCobrar === 'function') {
                            calcularTotalCobrar(empleado);
                        }
                        totalAplicados++;
                    }
                });
            });

            // Guardar cambios
            if (typeof saveNomina === 'function') {
                saveNomina();
            }

            // Cerrar modal y refrescar tabla
            $('#modalAddPercepcionesDeducciones').modal('hide');
            // Actualizar la tabla manteniendo la paginación actual
            if (typeof aplicarFiltrosConfianza === 'function') {
                aplicarFiltrosConfianza(paginaActualNomina);
            }

            swal.fire('Éxito', `Concepto aplicado correctamente a ${totalAplicados} empleados`, 'success');
        }
    });
}
