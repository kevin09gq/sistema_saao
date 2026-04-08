// Variable global para almacenar el día que se está justificando
let diaJustificacionActual = null;

mostrarModalJustificacion();
vinculaBotonesToipoDia();
mostrarModalDiasInhabiles();

function mostrarModalJustificacion() {
    $(document).on('click', '.btn-justificado-coordinador', function () {
        // Capturar el día de la fila (primera celda)
        const fila = $(this).closest('tr');
        diaJustificacionActual = fila.find('td').eq(0).text().trim();

        var modal = new bootstrap.Modal(document.getElementById('modal-tipo-dia'));
        modal.show();
    });
}

function vinculaBotonesToipoDia() {
    $(document).on('click', '.btn-tipo-dia', function () {
        const tipo = $(this).data('tipo'); // VACACIONES, DESCANSO, ENFERMEDAD, FESTIVO o vacío
        guardarJustificacion(tipo);
        // Cerrar modal después de guardar (mostrarInasistencias ya se llama en guardarJustificacion)
        $('#modal-tipo-dia').modal('hide');
    });
}

function guardarJustificacion(tipo) {
    const empleado = objEmpleadoCoordinador.getEmpleado();

    // Validar que exista empleado y día
    if (!empleado || !diaJustificacionActual) {
        return;
    }

    // 1. Crear propiedad dias_justificados si no existe
    if (!Array.isArray(empleado.dias_justificados)) {
        empleado.dias_justificados = [];
    }

    // 2. Remover justificación anterior para este día (si existe)
    empleado.dias_justificados = empleado.dias_justificados.filter(
        justif => justif.dia !== diaJustificacionActual
    );

    // 3. Si el tipo no está vacío, agregar la nueva justificación
    if (tipo.trim() !== '') {
        empleado.dias_justificados.push({
            dia: diaJustificacionActual,
            tipo: tipo
        });
    }

    // 4. Si no hay días justificados, eliminar la propiedad
    if (empleado.dias_justificados.length === 0) {
        delete empleado.dias_justificados;
    }

    // 5. Actualizar la tabla de horarios oficiales para mostrar la justificación
    establecerHorariosOficiales(empleado);

    // 6. Recalcular el historial de inasistencias (aplica el filtro de justificados)
    asignarHistorialInasistencias(empleado);

    // 7. Recalcular el total de inasistencias
    asignarTotalInasistenciasCoordinador(empleado, true); // force=true para asegurar recálculo

    // 8. Actualizar el input del modal con el nuevo total
    const totalInasistencias = empleado.inasistencia || 0;
    $('#mod-inasistencias-coordinador').val(totalInasistencias.toFixed(2));

    // 9. Actualizar la visualización de inasistencias
    mostrarInasistencias(empleado);

    // 10. Recalcular el sueldo a cobrar
    calcularSueldoACobrar();

   
}

function mostrarModalDiasInhabiles() {
    $(document).on('click', '#btn_establecer_dias_justificados', function () {

        var modal = new bootstrap.Modal(document.getElementById('modal-dias-inhabiles'));
        modal.show();
    });

    // Guardar días inhabiles para TODOS los coordinadores
    $(document).on('click', '#btn-guardar-dia-inhabil', function () {
        guardarJustificacionGeneralCoordinadores();
        $('#modal-dias-inhabiles').modal('hide');
    });
}

// ========================================
// GUARDAR JUSTIFICACIÓN GENERAL PARA TODOS LOS COORDINADORES
// ========================================

function guardarJustificacionGeneralCoordinadores() {
    // Obtener valores del modal
    const diaSemana = $('#select-dia-semana').val().trim();
    const tipo = $('#select-tipo-dias').val().trim();

    // Validar que se haya seleccionado día y tipo
    if (!diaSemana || !tipo) {
        console.warn('Debes seleccionar día y tipo');
        return;
    }

    // Validar que exista jsonNominaRelicario
    if (!jsonNominaRelicario || !Array.isArray(jsonNominaRelicario.departamentos)) {
        console.warn('jsonNominaRelicario no está disponible');
        return;
    }

    let coordinadoresActualizados = 0;

    // Iterar sobre todos los departamentos
    jsonNominaRelicario.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        // Iterar sobre todos los empleados
        departamento.empleados.forEach(empleado => {
            // Solo procesar coordinadores (tipo_horario === 1)
            if (empleado.tipo_horario !== 1) return;

            // 1. Crear propiedad dias_justificados si no existe
            if (!Array.isArray(empleado.dias_justificados)) {
                empleado.dias_justificados = [];
            }

            // 2. Remover justificación anterior para este día (si existe)
            empleado.dias_justificados = empleado.dias_justificados.filter(
                justif => justif.dia !== diaSemana
            );

            // 3. Agregar la nueva justificación
            empleado.dias_justificados.push({
                dia: diaSemana,
                tipo: tipo
            });

            // 4. Recalcular inasistencias (el filtro de justificados se aplicará automáticamente)
            asignarHistorialInasistencias(empleado);
            asignarTotalInasistenciasCoordinador(empleado, true);

            coordinadoresActualizados++;
        });
    });

   
    // Limpiar campos del modal
    $('#select-dia-semana').val('');
    $('#select-tipo-dias').val('');


    // Actualizar la tabla manteniendo el filtrado y paginación actual
    const id_departamento = parseInt($('#filtro_departamento').val());
    const id_puestoEspecial = parseInt($('#filtro_puesto').val());

    // Aplicar los mismos filtros que están activos
    let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, id_departamento);
    jsonFiltrado = filtrarEmpleadosPorPuesto(jsonFiltrado, id_puestoEspecial);

    // Mostrar la tabla en la página actual (usar window.paginaActualNomina para acceso global)

    mostrarDatosTabla(jsonFiltrado, window.paginaActualNomina || 1);
}

