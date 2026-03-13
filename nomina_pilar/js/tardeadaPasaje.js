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
    if (!jsonNominaPilar) {
        console.warn('jsonNominaPilar no está cargado aún');
        return;
    }
    $("#input-pasaje").val(jsonNominaPilar.precio_pasaje || 0);
    $("#input-comida").val(jsonNominaPilar.pago_comida || 0);
    $("#input-tardeada").val(jsonNominaPilar.pago_tardeada || 0);
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

        jsonNominaPilar.precio_pasaje = pasaje;
        jsonNominaPilar.pago_comida = comida;
        jsonNominaPilar.pago_tardeada = tardeada;

        // Actualizar pasaje y tardeada en todos los empleados
        actualizarPasajeTardeadaEnEmpleados();

        $('#modalTardeadaPasaje').modal('hide');
    });
}

// ============================================
// ACTUALIZAR PASAJE Y TARDEADA EN TODOS LOS EMPLEADOS
// ============================================
function actualizarPasajeTardeadaEnEmpleados() {
    // Validar que exista jsonNominaPilar y horarioRancho
    if (!jsonNominaPilar || !jsonNominaPilar.horarioRancho) {
        console.warn('No se puede actualizar: falta jsonNominaPilar o horarioRancho');
        return;
    }

    // Recolectar empleados del departamento 11 que tengan registros
    const empleadosAActualizar = [];

    if (Array.isArray(jsonNominaPilar.departamentos)) {
        jsonNominaPilar.departamentos.forEach(departamento => {
            if (!Array.isArray(departamento.empleados)) return;

            departamento.empleados.forEach(empleado => {
                // Solo procesar departamento 11 con registros
                if (parseInt(empleado.id_departamento) === 11 && Array.isArray(empleado.registros)) {
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
    if (!jsonNominaPilar || !Array.isArray(jsonNominaPilar.departamentos)) {
        console.warn('jsonNominaPilar no disponible');
        return;
    }

    const tbody = $('#tbody-empleados-quitar');
    tbody.empty();

    // Iterar y filtrar jornaleros (departamento 11 con mostrar = true)
    jsonNominaPilar.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            if (parseInt(empleado.id_departamento) === 11 && empleado.mostrar !== false) {
                const fila = `
                    <tr>
                        <td><input type="checkbox" class="checkbox-empleado-quitar" value="${empleado.clave}|${empleado.id_empresa}"></td>
                        <td>${empleado.clave}</td>
                        <td>${empleado.nombre}</td>
                    </tr>
                `;
                tbody.append(fila);
            }
        });
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

        jsonNominaPilar.departamentos.forEach(departamento => {
            if (!Array.isArray(departamento.empleados)) return;

            const empleado = departamento.empleados.find(
                e => String(e.clave) === String(clave) && String(e.id_empresa) === String(id_empresa)
            );

            if (empleado) {
                if (accion === 'comida' || accion === 'ambos') {
                    empleado.comida = 0;
                }
                if (accion === 'pasaje' || accion === 'ambos') {
                    empleado.pasaje = 0;
                }
            }
        });
    });

    console.log(`Se quitó ${accion} a ${empleadosSeleccionados.length} empleados`);

    // Limpiar campos
    $('#select-accion-quitar').val('');
    $('#checkbox-seleccionar-todos-quitar').prop('checked', false);

    // Actualizar la tabla manteniendo el filtrado y paginación actual
    const id_departamento = parseInt($('#filtro_departamento').val());
    const id_puestoEspecial = parseInt($('#filtro_puesto').val());

    // Aplicar los mismos filtros que están activos
    let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaPilar, id_departamento);
    jsonFiltrado = filtrarEmpleadosPorPuesto(jsonFiltrado, id_puestoEspecial);

    // Mostrar la tabla en la página actual (usar window.paginaActualNomina para acceso global)

    mostrarDatosTabla(jsonFiltrado, window.paginaActualNomina || 1);
}

// Inicializar funciones
abrirModalQuitarComidaPasaje();

