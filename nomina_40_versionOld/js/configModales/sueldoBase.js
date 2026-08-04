$(document).ready(function () {
    // Abrir modal
    abrirModalSueldoBase(); 

    // Aplicar sueldo base
    aplicarSueldoBaseDesdeBD();



    // Buscador
    // Buscador funcional (soporta teclado y pegado)
    $(document).on('input', '#buscar-empleado-sueldo-base', function () {
        const texto = $(this).val().toLowerCase().trim();
        const items = $('#lista-empleados-sueldo-base .list-group-item');

        items.each(function () {
            // No procesar directamente los divisores de departamento aquí
            if ($(this).hasClass('list-group-item-secondary')) return;

            const contenido = $(this).text().toLowerCase();
            if (contenido.includes(texto)) {
                $(this).attr('style', 'display: flex !important'); // Forzar display flex por ser d-flex
            } else {
                $(this).attr('style', 'display: none !important');
            }
        });

        // Actualizar encabezados de departamentos
        actualizarVisibilidadDepartamentos();
    });

    // Seleccionar todos
    $('#btn-seleccionar-todos-sueldo').on('click', function () {
        $('#lista-empleados-sueldo-base .list-group-item:visible input[type="checkbox"]').prop('checked', true);
    });

    // Deseleccionar todos
    $('#btn-deseleccionar-todos-sueldo').on('click', function () {
        $('#lista-empleados-sueldo-base .list-group-item:visible input[type="checkbox"]').prop('checked', false);
    });
    // Botón Quitar Sueldo Base
    $('#btn-quitar-sueldo-base').on('click', function () {
        quitarSueldoBase();
    });
});


//===============================
// ABRIR MODAL DE SUELDO BASE
//===============================

function abrirModalSueldoBase() {
    $('#btn_sueldo_base').on('click', function () {

        $('#lista-empleados-sueldo-base').empty();
        $('#buscar-empleado-sueldo-base').val('');

        cargarDatos();
        const modal = new bootstrap.Modal(document.getElementById('modalSueldoBase'));
        modal.show();
    });
}

//===============================
// MOSTRAR EMPLEADS DEL JSON
//===============================

function cargarDatos() {
    if (typeof jsonNomina40lbs === 'undefined' || !jsonNomina40lbs.departamentos) {
        return;
    }

    jsonNomina40lbs.departamentos.forEach(depto => {
        if (depto.editar !== true) return;

        const divisor = `<div class="list-group-item list-group-item-secondary fw-bold py-1" data-depto="${depto.nombre}">${depto.nombre}</div>`;
        $('#lista-empleados-sueldo-base').append(divisor);

        depto.empleados.forEach(emp => {
            if (emp.mostrar === false) return;
            const isChecked = emp.sueldo_base === true ? 'checked' : '';
            const item = `
                <label class="list-group-item d-flex align-items-center">
                    <input class="form-check-input me-2" type="checkbox" value="${emp.clave}" data-empresa="${emp.id_empresa}" ${isChecked}>
                    <span>${emp.nombre} <small class="text-muted">(${emp.clave})</small></span>
                </label>
            `;
            $('#lista-empleados-sueldo-base').append(item);
        });
    });
}

function actualizarVisibilidadDepartamentos() {
    $('#lista-empleados-sueldo-base .list-group-item-secondary').each(function () {
        const depto = $(this);
        let tieneVisibles = false;
        let proximo = depto.next();
        while (proximo.length && !proximo.hasClass('list-group-item-secondary')) {
            if (proximo.is(':visible')) {
                tieneVisibles = true;
                break;
            }
            proximo = proximo.next();
        }
        depto.toggle(tieneVisibles);
    });
}


//===============================
// OBTENER SUELDO BASE Y HORARIO OFICIAL APLICARLO EN EL JSON
//===============================

function aplicarSueldoBaseDesdeBD() {
    // Botón Siguiente (Procesar)
    $('#btn-procesar-sueldo-base').on('click', function () {


        const marcados = $('#lista-empleados-sueldo-base input:checked');
        if (marcados.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin selección',
                text: 'Por favor, selecciona al menos un empleado.',
                confirmButtonColor: '#0d6efd'
            });
            return;
        }

        const claves = [];
        marcados.each(function () {
            claves.push($(this).val());
        });

        $.ajax({
            url: '../php/validarExistenciaEmpleado.php',
            type: 'POST',
            data: {
                case: 'obtenerSalarioSemanal',
                claves: claves
            },
            success: function (res) {
                try {
                    const data = JSON.parse(res);
                    if (data.salarios) {
                        actualizarEmpleadosSueldoBase(data.salarios);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudieron obtener los salarios: ' + (data.error || 'Desconocido'),
                            confirmButtonColor: '#0d6efd'
                        });
                    }
                } catch (e) {
                    console.error('Error al parsear respuesta:', e);
                }
            },
            error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de servidor',
                    text: 'Ocurrió un problema al conectar con el servidor.',
                    confirmButtonColor: '#0d6efd'
                });
            }
        });
    });

}

function actualizarEmpleadosSueldoBase(salariosMap) {
    if (!jsonNomina40lbs || !jsonNomina40lbs.departamentos) return;

    let contador = 0;
    jsonNomina40lbs.departamentos.forEach(depto => {
        depto.empleados.forEach(emp => {
            const dataEmp = salariosMap[emp.clave];
            if (dataEmp !== undefined) {
                // Asignar sueldo y el nuevo horario oficial obtenido de la BD
                emp.sueldo_neto = parseFloat(dataEmp.salario_semanal) || 0;
                emp.horario_oficial = dataEmp.horario_oficial || null;
                emp.sueldo_base = true;

                // Eliminar propiedades relacionadas con el redondeo y horas calculadas
                if (emp.biometrico_redondeado) delete emp.biometrico_redondeado;
                if (emp.minutos_extras_trabajados !== undefined) delete emp.minutos_extras_trabajados;
                if (emp.minutos_trabajados !== undefined) delete emp.minutos_trabajados;
                if (emp.horas_trabajadas !== undefined) delete emp.horas_trabajadas;

                if (typeof recalcularSueldoExtraTotal === 'function') {
                    recalcularSueldoExtraTotal(emp);
                }

                // Calcular inasistencias automáticamente basándose en su horario oficial
                if (typeof asignarHistorialInasistencias === 'function') {
                    asignarHistorialInasistencias(emp);
                }
                if (typeof asignarTotalInasistencias === 'function') {
                    asignarTotalInasistencias(emp, true);
                }

                contador++;
            }
        });
    });

    if (typeof saveNomina === 'function') {
        saveNomina(jsonNomina40lbs);
    }

    if (typeof refrescarTabla === 'function') {
        refrescarTabla();
    }

    bootstrap.Modal.getInstance(document.getElementById('modalSueldoBase')).hide();

    Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: `Se aplicó sueldo base a ${contador} empleados correctamente.`,
        timer: 2000,
        showConfirmButton: false
    });
}

function quitarSueldoBase() {
    const marcados = $('#lista-empleados-sueldo-base input:checked');
    if (marcados.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin selección',
            text: 'Por favor, selecciona al menos un empleado.',
            confirmButtonColor: '#0d6efd'
        });
        return;
    }

    Swal.fire({
        title: '¿Estás seguro?',
        text: "Los empleados seleccionados volverán al cálculo automático por horas.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, quitar sueldo base',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            ejecutarQuitarSueldoBase(marcados);
        }
    });
}

function ejecutarQuitarSueldoBase(marcados) {
    const claves = [];
    marcados.each(function () {
        claves.push($(this).val());
    });

    let contador = 0;
    const empleadosAModificar = [];

    jsonNomina40lbs.departamentos.forEach(depto => {
        depto.empleados.forEach(emp => {
            if (claves.includes(String(emp.clave))) {
                       
                // Limpiar propiedades de sueldo base
                if (emp.sueldo_base) delete emp.sueldo_base;
                if (emp.horario_oficial) delete emp.horario_oficial;
                if (emp.historial_inasistencias) delete emp.historial_inasistencias;
                if (emp.inasistencia) emp.inasistencia = 0;
                if (emp.ignorar_inasistencias_automaticas) delete emp.ignorar_inasistencias_automaticas;
                if (emp._inasistencia_editado_manual) delete emp._inasistencia_editado_manual;

                empleadosAModificar.push(emp);
                contador++;
            }
        });
    });

    // Primero redondear para reconstruir las propiedades eliminadas (biometrico_redondeado, etc)
    if (typeof redondearHorarios === 'function') {
        redondearHorarios();
    }

    // Luego obtener tabulador para asignar el sueldo según las horas redondeadas
    if (typeof getTabulador === 'function') {
        getTabulador(empleadosAModificar);
    }

    if (typeof saveNomina === 'function') {
        saveNomina(jsonNomina40lbs);
    }

    bootstrap.Modal.getInstance(document.getElementById('modalSueldoBase')).hide();

    Swal.fire({
        icon: 'success',
        title: 'Sueldo restablecido',
        text: `Se quitó el sueldo base a ${contador} empleados.`,
        timer: 2000,
        showConfirmButton: false
    });
}
