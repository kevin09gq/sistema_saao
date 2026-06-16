configModalHorarios();
 $('input').prop('readonly', true);

// ========================================
// ESTABLECER HORARIO SEMANAL
// =======================================

function establecerHorarioSemanal() {
    // Verificar que exista jsonHistorialNomina y la propiedad horarios_semanales
    if (!jsonHistorialNomina || !jsonHistorialNomina.horarios_semanales || jsonHistorialNomina.horarios_semanales.length === 0) {
        // Limpiar todos los campos de la tabla si no hay horarios guardados
        $('#tabla-horarios-modal tbody tr').each(function () {
            $(this).find('.input-entrada').val('');
            $(this).find('.input-entrada-comida').val('');
            $(this).find('.input-salida-comida').val('');
            $(this).find('.input-salida').val('');
        });

        return;
    }

    // Limpiar la tabla antes de cargar los datos
    $('#tabla-horarios-modal tbody tr').each(function () {
        $(this).find('.input-entrada').val('');
        $(this).find('.input-entrada-comida').val('');
        $(this).find('.input-salida-comida').val('');
        $(this).find('.input-salida').val('');
    });

    // Cargar los horarios guardados
    jsonHistorialNomina.horarios_semanales.forEach(function (horario) {
        var fila = $('#tabla-horarios-modal tbody tr[data-dia="' + horario.dia + '"]');
        if (fila.length > 0) {
            fila.find('.input-entrada').val(horario.entrada);
            fila.find('.input-entrada-comida').val(horario.entrada_comida);
            fila.find('.input-salida-comida').val(horario.termino_comida);
            fila.find('.input-salida').val(horario.salida);
        }
    });

}


// ========================================
// CONFIGURACIÓN DEL MODAL DE HORARIOS SEMANALES Y CÁLCULO DE HORAS EN TIEMPO REAL
// =======================================

// Configurar eventos para el modal de horarios
function configModalHorarios() {
    $('#btn_establecer_horario_semanal').on('click', function () {
        establecerHorarioSemanal();
        $('#modalHorarios').modal('show');
    });



}


