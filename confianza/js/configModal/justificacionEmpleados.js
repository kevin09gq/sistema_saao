// Variable global para almacenar el día que se está justificando
let diaJustificacionActual = null;

mostrarModalJustificacion();
vinculaBotonesToipoDia();
mostrarModalDiasInhabiles();

// ========================================
// JUSTIFICACION DENTRO DEL MODAL DEL EMPLEADO
// ========================================

// Motrar modal para justificar un día específico al hacer clic en el botón de justificación
function mostrarModalJustificacion() {
    $(document).on('click', '.btn-justificado-confianza', function () {
        // Capturar el día de la fila (primera celda)
        const fila = $(this).closest('tr');
        diaJustificacionActual = fila.find('td').eq(0).text().trim();

        var modal = new bootstrap.Modal(document.getElementById('modal-tipo-dia'));
        modal.show();
    });
}

// Vincular botones dentro del modal de tipo de día para guardar la justificación
function vinculaBotonesToipoDia() {
    $(document).on('click', '.btn-tipo-dia', function () {
        const tipo = $(this).data('tipo'); // VACACIONES, DESCANSO, ENFERMEDAD, FESTIVO o vacío
        guardarJustificacion(tipo);
        // Cerrar modal después de guardar (mostrarInasistencias ya se llama en guardarJustificacion)
        $('#modal-tipo-dia').modal('hide');
    });
}

// Función para guardar la justificación del día para el empleado actual
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
    asignarTotalInasistencias(empleado, true); // force=true para asegurar recálculo

    // 8. Actualizar el input del modal con el nuevo total
    const totalInasistencias = empleado.inasistencia || 0;
    $('#mod-inasistencias-confianza').val(totalInasistencias.toFixed(2));

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

    // Guardar días inhabiles para TODOS los confianza
    $(document).on('click', '#btn-guardar-dia-inhabil', function () {
        guardarJustificacionGeneral();
        $('#modal-dias-inhabiles').modal('hide');
    });

    // Eliminar días inhabiles para TODOS los confianza
    $(document).on('click', '#btn-eliminar-dia-inhabil-general', function () {
        const diaSemana = $('#select-dia-semana').val();
        if (!diaSemana) {
            Swal.fire({ icon: 'warning', title: 'Selecciona un día', text: 'Por favor selecciona el día de la semana que deseas limpiar.' });
            return;
        }

        Swal.fire({
            title: '¿Eliminar justificación general?',
            text: `Se eliminará la justificación del día ${diaSemana} para TODOS los confianza.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarJustificacionGeneral();
                $('#modal-dias-inhabiles').modal('hide');
                Swal.fire('Eliminado', 'Las justificaciones han sido removidas.', 'success');
            }
        });
    });
}

// ========================================
// ELIMINAR JUSTIFICACIÓN GENERAL PARA TODOS LOS COORDINADORES
// ========================================

function eliminarJustificacionGeneral() {
    // Obtener valores del modal
    const diaSemana = $('#select-dia-semana').val().trim();

    // Validar que se haya seleccionado día
    if (!diaSemana) return;

    // Validar que exista jsonNominaConfianza
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return;

    // Iterar sobre todos los departamentos
    jsonNominaConfianza.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        // Iterar sobre todos los empleados
        departamento.empleados.forEach(empleado => {
      

            // 1. Si tiene días justificados, filtrar el que coincide
            if (Array.isArray(empleado.dias_justificados)) {
                empleado.dias_justificados = empleado.dias_justificados.filter(
                    justif => justif.dia !== diaSemana
                );

                // 2. Si no quedan días, eliminar la propiedad
                if (empleado.dias_justificados.length === 0) {
                    delete empleado.dias_justificados;
                }

                // 3. Recalcular inasistencias
                if (typeof asignarHistorialInasistencias === 'function') {
                    asignarHistorialInasistencias(empleado);
                }
                if (typeof asignarTotalInasistencias === 'function') {
                    asignarTotalInasistencias(empleado, true);
                }
            }
        });
    });

    // Limpiar campos del modal
    $('#select-dia-semana').val('');
    $('#select-tipo-dias').val('');

 if (typeof aplicarFiltrosConfianza === 'function') {
            aplicarFiltrosConfianza(paginaActualNomina);
        }
}

// ========================================
// GUARDAR JUSTIFICACIÓN GENERAL PARA TODOS LOS COORDINADORES
// ========================================

function guardarJustificacionGeneral() {
    // Obtener valores del modal
    const diaSemana = $('#select-dia-semana').val().trim();
    const tipo = $('#select-tipo-dias').val().trim();

    // Validar que se haya seleccionado día y tipo
    if (!diaSemana || !tipo) {
        console.warn('Debes seleccionar día y tipo');
        return;
    }

    // Validar que exista jsonNominaConfianza
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) {
        console.warn('jsonNominaConfianza no está disponible');
        return;
    }

    let confianzaActualizados = 0;

    // Iterar sobre todos los departamentos
    jsonNominaConfianza.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        // Iterar sobre todos los empleados
        departamento.empleados.forEach(empleado => {
         
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
            asignarTotalInasistencias(empleado, true);

            confianzaActualizados++;
        });
    });

   
    // Limpiar campos del modal
    $('#select-dia-semana').val('');
    $('#select-tipo-dias').val('');


    if (typeof aplicarFiltrosConfianza === 'function') {
            aplicarFiltrosConfianza(paginaActualNomina);
        }
}

