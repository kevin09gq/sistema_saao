// Variable global para almacenar el día que se está justificando
let diaJustificacionActual = null;

mostrarModalJustificacion();
vinculaBotonesToipoDia();

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
    const empleado = objEmpleado.getEmpleado();
    
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
    
    console.log('Días justificados:', empleado.dias_justificados);
}