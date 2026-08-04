$(document).ready(function () {
      $('#btn_horario_semanal').on('click', function () {
        establecerHorarioSemanal();
        $('#modalHorarios').modal('show');
        $('input').prop('readonly', true);
    });
});

// ========================================
// ESTABLECER HORARIO SEMANAL
// =======================================

function establecerHorarioSemanal() {
    // Verificar que exista jsonHistorialNomina y la propiedad horarios_semanales
    if (!jsonHistorialNomina || !jsonHistorialNomina.horarios_semanales || jsonHistorialNomina.horarios_semanales.length === 0) {
        // Limpiar todos los campos de la tabla si no hay horarios guardados
        $('#tabla-horarios-modal tbody tr').each(function () {
            if (!$(this).hasClass('table-primary')) { // No limpiar la fila de totales
                $(this).find('.input-entrada').val('');
                $(this).find('.input-entrada-comida').val('');
                $(this).find('.input-salida-comida').val('');
                $(this).find('.input-salida').val('');
                $(this).find('.total-horas').val('');
                $(this).find('.horas-comida').val('');
                $(this).find('.minutos-dia').val('');
            }
        });

        // Limpiar totales
        $('#total_horas_semana').val('');
        $('#total_horas_comida_semana').val('');
        $('#total_minutos_semana').val('');

        return;
    }

    // Limpiar la tabla antes de cargar los datos
    $('#tabla-horarios-modal tbody tr').each(function () {
        if (!$(this).hasClass('table-primary')) {
            $(this).find('.input-entrada').val('');
            $(this).find('.input-entrada-comida').val('');
            $(this).find('.input-salida-comida').val('');
            $(this).find('.input-salida').val('');
            $(this).find('.total-horas').val('');
            $(this).find('.horas-comida').val('');
            $(this).find('.minutos-dia').val('');
        }
    });

    // Cargar los horarios guardados
    jsonHistorialNomina.horarios_semanales.forEach(function (horario) {
        var fila = $('#tabla-horarios-modal tbody tr[data-dia="' + horario.dia + '"]');
        if (fila.length > 0) {
            fila.find('.input-entrada').val(horario.entrada);
            fila.find('.input-entrada-comida').val(horario.entrada_comida);
            fila.find('.input-salida-comida').val(horario.termino_comida);
            fila.find('.input-salida').val(horario.salida);
            fila.find('.total-horas').val(horario.total_horas);
            fila.find('.horas-comida').val(horario.horas_comida);
            fila.find('.minutos-dia').val(horario.minutos);
        }
    });

    // Calcular totales después de cargar los datos
    calcularTotalSemanal();

}

function calcularTotalSemanal() {
    var totalMinutos = 0;
    var totalMinutosComida = 0;

    // Recorrer todas las filas de días (excepto la fila de totales)
    $('#tabla-horarios-modal tbody tr').each(function () {
        // Saltar la fila de totales si ya existe
        if ($(this).hasClass('table-primary')) {
            return;
        }

        var minutosDia = parseInt($(this).find('.minutos-dia').val()) || 0;
        var horasComida = $(this).find('.horas-comida').val();

        totalMinutos += minutosDia;

        // Sumar minutos de comida
        if (horasComida && horasComida !== '00:00') {
            var partesComida = horasComida.split(':');
            if (partesComida.length === 2) {
                var horas = parseInt(partesComida[0]);
                var minutos = parseInt(partesComida[1]);
                totalMinutosComida += (horas * 60) + minutos;
            }
        }
    });

    // Calcular horas y minutos totales
    var horasTotales = Math.floor(totalMinutos / 60);
    var minutosRestantes = totalMinutos % 60;
    var horasFormateadas = horasTotales.toString().padStart(2, '0');
    var minutosFormateados = minutosRestantes.toString().padStart(2, '0');
    var totalHorasTexto = horasFormateadas + ':' + minutosFormateados;

    // Calcular horas y minutos totales de comida
    var horasComidaTotales = Math.floor(totalMinutosComida / 60);
    var minutosComidaRestantes = totalMinutosComida % 60;
    var horasComidaFormateadas = horasComidaTotales.toString().padStart(2, '0');
    var minutosComidaFormateados = minutosComidaRestantes.toString().padStart(2, '0');
    var totalHorasComidaTexto = horasComidaFormateadas + ':' + minutosComidaFormateados;

    // Actualizar los campos de totales
    $('#total_horas_semana').val(totalHorasTexto);
    $('#total_horas_comida_semana').val(totalHorasComidaTexto);
    $('#total_minutos_semana').val(totalMinutos);
}