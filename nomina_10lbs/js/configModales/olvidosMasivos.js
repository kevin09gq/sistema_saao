abrirModalOlvidosMasivos();
cambioSelectorDia();
aplicarPerdonOlvidos();

//====================================
// FUNCION PARA ABRIR EL MODAL DE OLVIDOS 
//====================================

function abrirModalOlvidosMasivos() {
    // Abrir modal y cargar datos iniciales
    $(document).on('click', '#btn_modal_olvidos_masivos', function () {
        const diaInicial = $('#select-dia-olvido-masivo').val();
        renderizarListaOlvidos(diaInicial);
        $('#modal-olvidos-masivos').modal('show');
    });
}


//====================================
// FUNCION PARA CAMBIAR EL DÍA SELECCIONADO Y RECARGAR LA LISTA DE OLVIDOS
//====================================

function cambioSelectorDia() {
    // Cambio de día en el selector
    $(document).on('change', '#select-dia-olvido-masivo', function () {
        renderizarListaOlvidos($(this).val());
    });

    $(document).on('change', '.check-dept-group', function () {
        const idDepto = $(this).data('depto');
        const isChecked = $(this).is(':checked');
        $(`.check-emp-olvido[data-depto="${idDepto}"]`).prop('checked', isChecked);
    });
}

//====================================
// FUNCION PARA CARGAR LOS OLVIDOS DETECTADOS EN EL MODAL
//====================================

function renderizarListaOlvidos(diaSeleccionado) {
    const $contenedor = $('#contenedor-lista-olvidos-masivos');
    const $contador = $('#contador-olvidos-detectados');

    $contenedor.empty();
    let totalOlvidosDetectados = 0;

    if (!jsonNomina10lbs || !jsonNomina10lbs.departamentos) return;

    // Helper para normalizar strings (quitar acentos y pasar a minúsculas)
    const normalizar = s => (s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    const diaSeleccionadoNorm = normalizar(diaSeleccionado);

    jsonNomina10lbs.departamentos.forEach(depto => {
        // Filtrar empleados del departamento que tengan olvido ese día
        const empleadosConOlvido = depto.empleados.filter(emp => {
            if (!Array.isArray(emp.historial_olvidos)) return false;

            // Buscar si tiene un olvido el día seleccionado con descuento mayor a 0
            return emp.historial_olvidos.some(o =>
                normalizar(o.dia) === diaSeleccionadoNorm &&
                parseFloat(o.descuento_olvido) > 0
            );
        });

        if (empleadosConOlvido.length > 0) {
            totalOlvidosDetectados += empleadosConOlvido.length;

            // Crear encabezado de departamento
            const htmlDepto = `
                <div class="seccion-departamento-olvido mb-4">
                    <div class="dept-header d-flex justify-content-between align-items-center bg-light p-2 border-start border-4 border-danger">
                        <span class="fw-bold text-uppercase small"><i class="bi bi-building"></i> ${depto.nombre}</span>
                        <div class="form-check m-0">
                            <input class="form-check-input check-dept-group" type="checkbox" data-depto="${depto.id_departamento || depto.nombre}" id="check-depto-${depto.id_departamento || depto.nombre}">
                            <label class="form-check-label small fw-semibold" for="check-depto-${depto.id_departamento || depto.nombre}">Seleccionar Todo</label>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-sm table-hover align-middle mb-0">
                            <thead class="table-light text-uppercase" style="font-size: 0.75rem;">
                                <tr>
                                    <th width="40"></th>
                                    <th width="100">Clave</th>
                                    <th>Nombre</th>
                                    <th class="text-end">Monto Actual</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${empleadosConOlvido.map(emp => {
                                    const olvido = emp.historial_olvidos.find(o => normalizar(o.dia) === diaSeleccionadoNorm);
                                        return `
                                        <tr class="fila-empleado-olvido">
                                            <td>
                                                <input class="form-check-input check-emp-olvido" type="checkbox" 
                                                    value="${emp.clave}" 
                                                    data-depto="${depto.id_departamento || depto.nombre}"
                                                    data-id-empresa="${emp.id_empresa}">
                                            </td>
                                            <td><span class="badge bg-light text-dark border">${emp.clave}</span></td>
                                            <td class="small fw-semibold">${emp.nombre}</td>
                                            <td class="text-end text-danger fw-bold">$${parseFloat(olvido.descuento_olvido).toFixed(2)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            $contenedor.append(htmlDepto);
        }
    });

    $contador.text(`${totalOlvidosDetectados} Olvidos detectados`);

    if (totalOlvidosDetectados === 0) {
        $contenedor.html(`
            <div class="text-center py-5 text-muted">
                <i class="bi bi-emoji-smile fs-1 d-block mb-2"></i>
                <p>No se detectaron olvidos para el día <strong>${diaSeleccionado}</strong></p>
            </div>
        `);
    }
}

//====================================
// FUNCION PARA APLICAR EL PERDÓN DE OLVIDOS A LOS EMPLEADOS SELECCIONADOS
//====================================

function aplicarPerdonOlvidos() {
    $(document).on('click', '#btn-aplicar-perdon-olvidos', function () {
        const seleccionados = $('.check-emp-olvido:checked');
        const diaSeleccionado = $('#select-dia-olvido-masivo').val();

        if (seleccionados.length === 0) {
            Swal.fire('Atención', 'Por favor selecciona al menos un empleado.', 'warning');
            return;
        }

        // Helper para normalizar
        const normalizar = s => (s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
        const diaSeleccionadoNorm = normalizar(diaSeleccionado);

        Swal.fire({
            title: '¿Confirmar perdón?',
            text: `Se pondrá en $0 el olvido del ${diaSeleccionado} para ${seleccionados.length} empleados.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Sí, perdonar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                let procesados = 0;

                seleccionados.each(function () {
                    const clave = $(this).val();
                    const idEmpresa = $(this).data('id-empresa');

                    // Buscar empleado en el JSON global
                    jsonNomina10lbs.departamentos.forEach(depto => {
                        const emp = depto.empleados.find(e => String(e.clave) === String(clave) && String(e.id_empresa) === String(idEmpresa));

                        if (emp && Array.isArray(emp.historial_olvidos)) {
                            const olvido = emp.historial_olvidos.find(o => normalizar(o.dia) === diaSeleccionadoNorm);

                            if (olvido) {
                                olvido.descuento_olvido = 0;
                                olvido.editado = true;

                                // Recalcular sus totales
                                if (typeof asignarTotalOlvidos === 'function') {
                                    asignarTotalOlvidos(emp, true);
                                }
                             

                                procesados++;
                            }
                        }
                    });
                });

                // Guardar cambios, refrescar tabla y cerrar
                if (typeof saveNomina === 'function') {
                    saveNomina(jsonNomina10lbs);
                }
                // Actualizar la tabla manteniendo la paginación actual
               refrescarTabla();

                $('#modal-olvidos-masivos').modal('hide');

                Swal.fire({
                    title: '¡Completado!',
                    text: `${procesados} incidencias marcadas como perdonadas.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    });
}
