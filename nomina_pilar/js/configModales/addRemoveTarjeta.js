$(document).ready(function () {
    // Evento para abrir el modal
    $('#btn_abrir_add_remove_tarjeta').on('click', function () {
        cargarEmpleadosTarjeta();
        $('#modalAddRemoveTarjeta').modal('show');
    });

    // Checkbox para seleccionar/deseleccionar todos
    $('#check-all-tarjeta').on('change', function () {
        const isChecked = $(this).is(':checked');
        $('.check-empleado-tarjeta:visible').prop('checked', isChecked);
        actualizarContadorSeleccionadosTarjeta();
    });

    // Contador de seleccionados al cambiar checkboxes individuales
    $(document).on('change', '.check-empleado-tarjeta', function () {
        actualizarContadorSeleccionadosTarjeta();
    });

    // Buscador de empleados
    $('#buscar-empleado-tarjeta').on('input', function () {
        const busqueda = $(this).val().toLowerCase();
        $('#tbody-empleados-tarjeta tr').each(function () {
            // No ocultar las filas de encabezado de departamento si tienen elementos hijos visibles
            if ($(this).hasClass('table-secondary')) return;

            const texto = $(this).text().toLowerCase();
            $(this).toggle(texto.indexOf(busqueda) > -1);
        });

        // Ocultar cabeceras de departamento si no hay empleados visibles en él
        $('.depto-header-row').each(function () {
            const deptoId = $(this).data('depto-id');
            const empleadosVisibles = $(`.emp-row-depto-${deptoId}:visible`).length;
            $(this).toggle(empleadosVisibles > 0);
        });
    });

    // Botón para aplicar la acción (agregar o quitar)
    $('#btn-aplicar-tarjeta-masivo').on('click', function () {
        aplicarTarjetaConceptoMasivo();
    });
});

//======================================================
// CARGAR LA LISTA DE EMPLEADOS EN EL MODAL (SEGURO SOCIAL & MOSTRAR)
//======================================================
function cargarEmpleadosTarjeta() {
    if (!jsonNominaPilar || !jsonNominaPilar.departamentos) return;

    const tbody = $('#tbody-empleados-tarjeta');
    tbody.empty();

    // Reiniciar inputs y controles
    $('#check-all-tarjeta').prop('checked', false);
    $('#buscar-empleado-tarjeta').val('');
    $('#tarjeta-concepto-select').val('todos');
    $('#tarjeta-accion-select').val('agregar');

    let deptoCounter = 0;

    jsonNominaPilar.departamentos.forEach(depto => {
        // Filtrar empleados que tienen seguro social Y se muestran en la nómina (mostrar !== false)
        const empleadosValidos = depto.empleados.filter(emp => emp.seguroSocial === true && emp.mostrar !== false);

        if (empleadosValidos.length === 0) return;

        deptoCounter++;

        // Fila de encabezado de departamento
        tbody.append(`
            <tr class="table-secondary depto-header-row" data-depto-id="${deptoCounter}">
                <td colspan="3" class="fw-bold">
                    <i class="bi bi-building"></i> ${depto.nombre} 
                    <small class="fw-normal text-muted ms-1">(${empleadosValidos.length} empleados con seguro)</small>
                </td>
            </tr>
        `);

        // Ordenar por nombre
        empleadosValidos.sort((a, b) => a.nombre.localeCompare(b.nombre));

        empleadosValidos.forEach(empleado => {
            const fila = `
                <tr class="emp-row-depto-${deptoCounter}">
                    <td class="text-center">
                        <input class="form-check-input check-empleado-tarjeta" type="checkbox" 
                               data-clave="${empleado.clave}" 
                               data-empresa="${empleado.id_empresa}">
                    </td>
                    <td class="text-center small fw-bold text-muted">${empleado.clave}</td>
                    <td>
                        <div class="fw-bold" style="font-size: 0.9rem;">${empleado.nombre}</div>
                    </td>
                </tr>
            `;
            tbody.append(fila);
        });
    });

    actualizarContadorSeleccionadosTarjeta();
}

//======================================================
// ACTUALIZAR EL CONTADOR DE EMPLEADOS SELECCIONADOS
//======================================================
function actualizarContadorSeleccionadosTarjeta() {
    const total = $('.check-empleado-tarjeta:checked').length;
    $('#contador-seleccionados-tarjeta').text(total);
}

//======================================================
// APLICAR LA ACCIÓN (AGREGAR/QUITAR) A LOS EMPLEADOS SELECCIONADOS
//======================================================
function aplicarTarjetaConceptoMasivo() {
    const concepto = $('#tarjeta-concepto-select').val();
    const accion = $('#tarjeta-accion-select').val();

    const seleccionados = [];
    $('.check-empleado-tarjeta:checked').each(function () {
        seleccionados.push({
            clave: String($(this).data('clave')),
            empresa: String($(this).data('empresa'))
        });
    });

    if (seleccionados.length === 0) {
        swal.fire('Atención', 'Selecciona al menos un empleado', 'warning');
        return;
    }

    const accionTexto = accion === 'agregar' ? 'Agregar' : 'Quitar';
    let conceptoTexto = '';

    if (concepto === 'todos') {
        conceptoTexto = 'Tarjeta y todos los Impuestos (ISR, IMSS, Infonavit, Ajuste al Sub)';
    } else if (concepto === 'tarjeta') {
        conceptoTexto = 'Tarjeta';
    } else if (concepto === 'isr') {
        conceptoTexto = 'ISR (45)';
    } else if (concepto === 'imss') {
        conceptoTexto = 'IMSS (52)';
    } else if (concepto === 'infonavit') {
        conceptoTexto = 'Infonavit (16)';
    } else if (concepto === 'ajuste_sub') {
        conceptoTexto = 'Ajuste al Sub (107)';
    }

    // Confirmación con SweetAlert2
    swal.fire({
        title: '¿Estás seguro?',
        text: `Se va a realizar la acción "${accionTexto}" para el concepto "${conceptoTexto}" a los ${seleccionados.length} empleados seleccionados.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, proceder',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            let totalModificados = 0;

            // Iterar sobre el JSON de la nómina
            jsonNominaPilar.departamentos.forEach(depto => {
                depto.empleados.forEach(empleado => {
                    const claveEmp = String(empleado.clave);
                    const empresaEmp = String(empleado.id_empresa);

                    // Verificar si está seleccionado
                    const estaSeleccionado = seleccionados.some(sel => sel.clave === claveEmp && sel.empresa === empresaEmp);

                    if (estaSeleccionado) {
                        if (accion === 'agregar') {
                            // --- ACCIÓN: AGREGAR / APLICAR COPIA ---

                            // 1. Tarjeta
                            if (concepto === 'todos' || concepto === 'tarjeta') {
                                if (empleado.tarjeta_copia !== undefined && empleado.tarjeta_copia !== null) {
                                    empleado.tarjeta = empleado.tarjeta_copia;
                                }
                                delete empleado.quitar_tarjeta;
                            }

                            // 2. Conceptos (ISR, IMSS, Infonavit, Ajuste al Sub)
                            if (concepto === 'todos' || concepto === 'isr' || concepto === 'imss' || concepto === 'infonavit' || concepto === 'ajuste_sub') {
                                if (Array.isArray(empleado.conceptos_copia)) {
                                    // Asegurar inicialización de array de conceptos
                                    if (!Array.isArray(empleado.conceptos)) {
                                        empleado.conceptos = JSON.parse(JSON.stringify(empleado.conceptos_copia));
                                    } else {
                                        empleado.conceptos_copia.forEach(copia => {
                                            const codigoConcepto = copia.codigo;
                                            const debeModificar =
                                                (concepto === 'todos') ||
                                                (concepto === 'isr' && codigoConcepto === '45') ||
                                                (concepto === 'imss' && codigoConcepto === '52') ||
                                                (concepto === 'infonavit' && codigoConcepto === '16') ||
                                                (concepto === 'ajuste_sub' && codigoConcepto === '107');

                                            if (debeModificar) {
                                                const actual = empleado.conceptos.find(c => c.codigo === codigoConcepto);
                                                if (actual) {
                                                    actual.resultado = copia.resultado;
                                                } else {
                                                    empleado.conceptos.push(JSON.parse(JSON.stringify(copia)));
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                        } else {
                            // --- ACCIÓN: QUITAR / ELIMINAR DE NÓMINA ---

                            // 1. Tarjeta (Establecer en 0)
                            if (concepto === 'todos' || concepto === 'tarjeta') {
                                empleado.tarjeta = 0;
                                empleado.quitar_tarjeta = true;
                            }

                            // 2. Conceptos (Vaciar a '')
                            if (concepto === 'todos' || concepto === 'isr' || concepto === 'imss' || concepto === 'infonavit' || concepto === 'ajuste_sub') {
                                if (Array.isArray(empleado.conceptos)) {
                                    empleado.conceptos.forEach(actual => {
                                        const codigoConcepto = actual.codigo;
                                        const debeModificar =
                                            (concepto === 'todos') ||
                                            (concepto === 'isr' && codigoConcepto === '45') ||
                                            (concepto === 'imss' && codigoConcepto === '52') ||
                                            (concepto === 'infonavit' && codigoConcepto === '16') ||
                                            (concepto === 'ajuste_sub' && codigoConcepto === '107');

                                        if (debeModificar) {
                                            actual.resultado = '';
                                        }
                                    });
                                }
                            }
                        }

                        // Recalcular el total del empleado para que se refleje inmediatamente en la UI
                        if (typeof calcularTotalCobrar === 'function') {
                            calcularTotalCobrar(empleado);
                        }
                        totalModificados++;
                    }
                });
            });

            // Guardar cambios
            if (typeof saveNomina === 'function') {
                saveNomina(jsonNominaPilar);
            }

            // Cerrar modal y refrescar la tabla principal
            $('#modalAddRemoveTarjeta').modal('hide');
            // Actualizar la tabla manteniendo la paginación actual
            aplicarFiltrosActuales();


            swal.fire('Éxito', `Conceptos/Tarjeta actualizados correctamente para ${totalModificados} empleados`, 'success');
        }
    });
}
