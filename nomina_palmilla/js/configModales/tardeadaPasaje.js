abrirModalPasajeTardeada();
guardarValoresTardeadaPasaje();


// ============================================
// ABRIR MODAL DE PASAJE Y TARDEADA
// ============================================
function abrirModalPasajeTardeada() {
    $(document).on('click', '#btn_actualizar_valores', function (e) {
        e.preventDefault();
        establecerDataModalTardeadaPasaje();
        $('#modalTardeadaPasaje').modal('show');
    });



};

// ============================================
// ESTABLECER VALORES ACTUALES DE PASAJE Y TARDEADA EN EL MODAL
// ============================================

function establecerDataModalTardeadaPasaje() {
    if (!jsonNominaPalmilla) {
        console.warn('jsonNominaPalmilla no está cargado aún');
        return;
    }
    $("#input-pasaje").val(jsonNominaPalmilla.precio_pasaje || 0);
    $("#input-comida").val(jsonNominaPalmilla.pago_comida || 0);
    $("#input-tardeada").val(jsonNominaPalmilla.pago_tardeada || 0);
}

// ============================================
// GUARDAR VALORES DE PASAJE Y TARDEADA
// ============================================

function guardarValoresTardeadaPasaje() {
    // Guardar valores (ejemplo simple: solo mostrar en consola)
    $(document).on('click', '#btn-guardar-tardeada-pasaje', function () {
        const pasaje = parseFloat($('#input-pasaje').val()) || 0;
        const comida = parseFloat($('#input-comida').val()) || 0;
        const tardeada = parseFloat($('#input-tardeada').val()) || 0;

        jsonNominaPalmilla.precio_pasaje = pasaje;
        jsonNominaPalmilla.pago_comida = comida;
        jsonNominaPalmilla.pago_tardeada = tardeada;

        // Actualizar pasaje y tardeada en todos los empleados
        actualizarPasajeTardeadaEnEmpleados();

        $('#modalTardeadaPasaje').modal('hide');
    });
}

// ============================================
// ACTUALIZAR PASAJE Y TARDEADA EN TODOS LOS EMPLEADOS
// ============================================
function actualizarPasajeTardeadaEnEmpleados() {
    // Validar que exista jsonNominaPalmilla y horarioRancho
    if (!jsonNominaPalmilla || !jsonNominaPalmilla.horarioRancho) {
        console.warn('No se puede actualizar: falta jsonNominaPalmilla o horarioRancho');
        return;
    }

    // Recolectar empleados del tipo_horario 2 que tengan registros
    const empleadosAActualizar = [];

    if (Array.isArray(jsonNominaPalmilla.departamentos)) {
        jsonNominaPalmilla.departamentos.forEach(departamento => {
            if (!Array.isArray(departamento.empleados)) return;

            departamento.empleados.forEach(empleado => {
                // Solo procesar empleados con tipo_horario 2 y registros
                if (empleado.tipo_horario === 2 && Array.isArray(empleado.registros)) {
                    empleadosAActualizar.push(empleado);
                }
            });
        });
    }

    // Recalcular pasaje y tardeada para cada empleado
    if (typeof calcularSueldoSemanal === 'function') {
        calcularSueldoSemanal(empleadosAActualizar);
    } else {
        console.error('calcularSueldoSemanal no está disponible');
    }
}


// ============================================
// ABRIR MODAL QUITAR PASAJE
// ============================================

function abrirModalQuitarComidaPasaje() {
    $(document).on('click', '#btn_quitar_comida_pasaje', function (e) {
        e.preventDefault();
        listarEmpleadosParaQuitarComidaPasaje();
        $('#modalQuitarComidaPasaje').modal('show');
    });

    // Seleccionar/deseleccionar todos
    $(document).on('change', '#checkbox-seleccionar-todos-quitar', function () {
        const isChecked = $(this).is(':checked');
        $('#tbody-empleados-quitar input[type="checkbox"]').prop('checked', isChecked);
    });

    // Aplicar cambios
    $(document).on('click', '#btn-aplicar-quitar', function () {
        aplicarQuitarComidaPasaje();
        $('#modalQuitarComidaPasaje').modal('hide');
    });
}

function listarEmpleadosParaQuitarComidaPasaje() {
    if (!jsonNominaPalmilla || !Array.isArray(jsonNominaPalmilla.departamentos)) {
        console.warn('jsonNominaPalmilla no disponible');
        return;
    }

    const tbody = $('#tbody-empleados-quitar');
    tbody.empty();

    // Iterar y filtrar jornaleros (tipo_horario 2 con mostrar = true)
    jsonNominaPalmilla.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        // Filtrar jornaleros del departamento
        const jornaleros = departamento.empleados.filter(e => e.tipo_horario === 2 && e.mostrar !== false);

        if (jornaleros.length > 0) {
            // Agregar fila del departamento
            const filaDepto = `
                <tr class="table-primary border-bottom border-secondary">
                    <td colspan="4" class="py-2">
                        <div class="form-check d-flex align-items-center mb-0 ms-1">
                            <input type="checkbox" class="form-check-input check-dept-quitar me-2" data-depto="${departamento.id_departamento}" id="check-depto-quitar-${departamento.id_departamento}">
                            <label class="form-check-label fw-bold text-uppercase small" for="check-depto-quitar-${departamento.id_departamento}">
                                <i class="bi bi-building"></i> ${departamento.nombre}
                            </label>
                        </div>
                    </td>
                </tr>
            `;
            tbody.append(filaDepto);

            // Agregar empleados del departamento
            jornaleros.forEach(empleado => {
                const fila = `
                    <tr class="fila-empleado-quitar">
                        <td><input type="checkbox" class="checkbox-empleado-quitar" data-depto="${departamento.id_departamento}" value="${empleado.clave}|${empleado.id_empresa}"></td>
                        <td><span class="badge bg-light text-dark border">${empleado.clave}</span></td>
                        <td class="small fw-semibold">${empleado.nombre}</td>
                    </tr>
                `;
                tbody.append(fila);
            });
        }
    });

    // Evento para seleccionar todo un departamento
    $(document).off('change', '.check-dept-quitar').on('change', '.check-dept-quitar', function () {
        const idDepto = $(this).data('depto');
        const isChecked = $(this).is(':checked');
        $(`.checkbox-empleado-quitar[data-depto="${idDepto}"]`).prop('checked', isChecked);
    });
}

function aplicarQuitarComidaPasaje() {
    const accion = $('#select-accion-quitar').val();

    if (!accion) {
        alert('Selecciona una acción');
        return;
    }

    // Obtener empleados seleccionados
    const empleadosSeleccionados = [];
    $('#tbody-empleados-quitar input[type="checkbox"]:checked').each(function () {
        empleadosSeleccionados.push($(this).val());
    });

    if (empleadosSeleccionados.length === 0) {
        alert('Selecciona al menos un empleado');
        return;
    }

    // Aplicar cambios a cada empleado
    empleadosSeleccionados.forEach(claveBuscar => {
        const [clave, id_empresa] = claveBuscar.split('|');

        jsonNominaPalmilla.departamentos.forEach(departamento => {
            if (!Array.isArray(departamento.empleados)) return;

            const empleado = departamento.empleados.find(
                e => String(e.clave) === String(clave) && String(e.id_empresa) === String(id_empresa)
            );

            if (empleado) {
                // Comida
                if (accion === 'quitar_comida' || accion === 'quitar_ambos') {
                    empleado.comida_override = 'quitar';
                } else if (accion === 'agregar_comida' || accion === 'agregar_ambos') {
                    empleado.comida_override = 'agregar';
                }

                // Pasaje
                if (accion === 'quitar_pasaje' || accion === 'quitar_ambos') {
                    empleado.pasaje_override = 'quitar';
                } else if (accion === 'agregar_pasaje' || accion === 'agregar_ambos') {
                    empleado.pasaje_override = 'agregar';
                }

                // Restablecer
                if (accion === 'restablecer_todos') {
                    empleado.comida_override = null;
                    delete empleado.comida_override;
                    empleado.pasaje_override = null;
                    delete empleado.pasaje_override;
                }
            }
        });
    });

    console.log(`Acción ${accion} aplicada a ${empleadosSeleccionados.length} empleados`);

    // Recalcular sueldos para aplicar los overrides
    actualizarPasajeTardeadaEnEmpleados();

    // Limpiar campos
    $('#select-accion-quitar').val('');
    $('#checkbox-seleccionar-todos-quitar').prop('checked', false);

    // Actualizar la tabla manteniendo el filtrado y paginación actual
    const id_departamento = parseInt($('#filtro_departamento').val());
    const id_puestoEspecial = parseInt($('#filtro_puesto').val());

    // Aplicar los mismos filtros que están activos
    let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaPalmilla, id_departamento);
    jsonFiltrado = filtrarEmpleadosPorPuesto(jsonFiltrado, id_puestoEspecial);

    // Mostrar la tabla en la página actual (usar window.paginaActualNomina para acceso global)

    mostrarDatosTabla(jsonFiltrado, window.paginaActualNomina || 1);
}

// Inicializar funciones
abrirModalQuitarComidaPasaje();

