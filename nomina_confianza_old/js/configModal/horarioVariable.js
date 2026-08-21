establecerHorarioVariable();

// Copiar valores HV a filas LUNES->SABADO
function copiarHorarioVariable() {
    const entrada = $('#hv-input-entrada').val() || '';
    const salidaComida = $('#hv-input-salida-comida').val() || '';
    const entradaComida = $('#hv-input-entrada-comida').val() || '';
    const salida = $('#hv-input-salida').val() || '';

    // Seleccionar filas del tbody (asumimos que están en orden LUNES..DOMINGO)
    const $rows = $('#tbody-horario-variable tr');
    // Copiar solo a las primeras 6 filas (LUNES..SABADO)
    $rows.slice(0, 6).each(function () {
        const $r = $(this);
        const $entrada = $r.find('.entrada');
        const $salidaComida = $r.find('.salida-comida');
        const $entradaComida = $r.find('.entrada-comida');
        const $salida = $r.find('.salida');

        $entrada.val(entrada);
        $salidaComida.val(salidaComida);
        $entradaComida.val(entradaComida);
        $salida.val(salida);
    });
}

function lstEmpSinHorarioVar() {
    // Listar todos los empleados del jsonNominaConfianza
    const empleados = [];
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return empleados;

    jsonNominaConfianza.departamentos.forEach(dept => {
        dept.empleados.forEach(emp => {
            // Si el empleado está marcado para no mostrar, saltarlo
            if (emp.mostrar === false) return;

            empleados.push({ clave: emp.clave, nombre: emp.nombre, id_empresa: emp.id_empresa });
        });
    });

    // Pintar en el modal
    const $tbody = $('#tbody-empleados-sin-horario');
    $tbody.empty();

    if (empleados.length === 0) {
        $('#empleados-sin-horario-empty').show();
        $('#empleados-sin-horario-count').text('');
    } else {
        $('#empleados-sin-horario-empty').hide();
        $('#empleados-sin-horario-count').text(empleados.length + ' empleados sin horario oficial');

        empleados.forEach(emp => {
            const row = `
                <tr>
                    <td class="text-center"><input type="checkbox" class="form-check-input chk-emp-sin-hor" data-clave="${emp.clave}" data-id-empresa="${emp.id_empresa}"></td>
                    <td>${emp.clave}</td>
                    <td>${emp.nombre}</td>
                </tr>
            `;
            $tbody.append(row);
        });
    }

    return empleados;
}

function establecerHorarioVariable() {

    // Abrir modal Horario Variable (Paso 1 por defecto)
    $(document).on('click', '#btn_add_horario_variable', function () {
        const $modal = $('#modalHorarioVariable');
        if ($modal.length === 0) return;

        // Resetear al Paso 1 por si acaso se cerró en el Paso 2
        $('#hv-container-horarios, #hv-footer-paso1').removeClass('d-none');
        $('#hv-container-empleados, #hv-footer-paso2').addClass('d-none');
        $('#hv-modal-header').removeClass('bg-warning text-dark').addClass('bg-success text-white');
        $('#hv-title-text').text('Asignar Horario Variable');

        const bsModal = bootstrap.Modal.getOrCreateInstance($modal[0]);
        bsModal.show();
    });

    // Copiar horario rápido (Paso 1)
    $(document).on('click', '#hv-btn-copiar-horario', function () {
        copiarHorarioVariable();
    });

    // Transición Paso 1 -> Paso 2
    $(document).on('click', '#btn-aplicar-horario', function () {
        // Generar la lista de empleados disponibles
        lstEmpSinHorarioVar();

        // Ocultar Paso 1, Mostrar Paso 2
        $('#hv-container-horarios, #hv-footer-paso1').addClass('d-none');
        $('#hv-container-empleados, #hv-footer-paso2').removeClass('d-none');

        // Cambiar apariencia del header para denotar cambio de fase (como el modal anterior)
        $('#hv-modal-header').removeClass('bg-success text-white').addClass('bg-warning text-dark');
        $('#hv-title-text').text('Seleccionar Empleados');
    });

    // Transición Paso 2 -> Paso 1 (Regresar)
    $(document).on('click', '#btn-hv-regresar', function () {
        $('#hv-container-empleados, #hv-footer-paso2').addClass('d-none');
        $('#hv-container-horarios, #hv-footer-paso1').removeClass('d-none');

        $('#hv-modal-header').removeClass('bg-warning text-dark').addClass('bg-success text-white');
        $('#hv-title-text').text('Asignar Horario Variable');
    });

    // Select all checkbox (Paso 2)
    $(document).on('change', '#chk-select-all-sin-horario', function () {
        const checked = $(this).is(':checked');
        $('#tbody-empleados-sin-horario .chk-emp-sin-hor').prop('checked', checked);
    });

    // Finalizar: Asignar horario a seleccionados
    $(document).on('click', '#btn-asignar-horario-seleccionados', function () {
        const seleccionados = [];
        $('#tbody-empleados-sin-horario .chk-emp-sin-hor:checked').each(function () {
            seleccionados.push({ clave: $(this).data('clave'), id_empresa: $(this).data('id-empresa') });
        });

        if (seleccionados.length === 0) {
            Swal.fire('Atención', 'Selecciona al menos un empleado para asignar el horario.', 'warning');
            return;
        }

        const horario = [];
        $('#tbody-horario-variable tr').each(function () {
            const $row = $(this);
            const dia = $row.find('input[type="text"]').val() || '';
            const entrada = $row.find('.entrada').val() || '';
            const salida_comida = $row.find('.salida-comida').val() || '';
            const entrada_comida = $row.find('.entrada-comida').val() || '';
            const salida = $row.find('.salida').val() || '';

            horario.push({ dia: String(dia).toUpperCase().trim(), entrada, salida_comida, entrada_comida, salida });
        });

        seleccionados.forEach(sel => {
            jsonNominaConfianza.departamentos.forEach(dept => {
                const emp = dept.empleados.find(e => String(e.clave) === String(sel.clave) && String(e.id_empresa) === String(sel.id_empresa));
                if (emp) {
                    emp.horario_oficial = JSON.parse(JSON.stringify(horario));
                    recalcularEventos(emp);
                }
            });
        });

        // Guardar cambios
        if (typeof saveNomina === 'function') saveNomina(jsonNominaConfianza);

        // Notificación de éxito
        Swal.fire({
            title: '¡Asignado!',
            text: `Se aplicó el horario a ${seleccionados.length} empleados correctamente.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        // Cerrar el modal único
        const modalEl = document.getElementById('modalHorarioVariable');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();

          if (typeof aplicarFiltrosConfianza === 'function') {
            aplicarFiltrosConfianza(paginaActualNomina);
        }
    });
}