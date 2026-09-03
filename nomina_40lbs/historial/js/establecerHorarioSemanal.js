$(document).ready(function () {
    abrirModalHorarioSemanal();
});

//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE HORARIO SEMANAL
//===================================================

function abrirModalHorarioSemanal() {

    // Detectar el clic en el botón "btn_establecer_horario_semanal"
    $('#btnHorarioSemanal').click(function () {

        establecerHorariosModal();

        // Abrir el modal de Bootstrap
        $('#modalHorarioSemanal').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA ESTABLECER LOS HORARIOS
// GUARDADOS EN EL JSON DENTRO DEL MODAL.
//===================================================

function establecerHorariosModal() {

    // Verificar que exista la propiedad horarios_semanales
    if (!jsonHistorial40lbs.horarios_semanales) {
        return;
    }

    // Recorrer todos los horarios guardados
    jsonHistorial40lbs.horarios_semanales.forEach((horario) => {

        // Buscar la fila correspondiente al día
        let fila = $('#tabla-horarios-modal tbody tr[data-dia="' + horario.dia + '"]');

        // Si no existe la fila, continuar con el siguiente registro
        if (fila.length == 0) {
            return;
        }

        // Establecer las horas
        fila.find('.input-entrada').val(horario.entrada);

        fila.find('.input-entrada-comida').val(horario.entrada_comida);

        fila.find('.input-salida-comida').val(horario.termino_comida);

        fila.find('.input-salida').val(horario.salida);

        // Establecer los resultados calculados
        fila.find('.total-horas').val(horario.total_horas);

        fila.find('.horas-comida').val(horario.horas_comida);

        fila.find('.minutos-dia').val(horario.minutos);

    });

    calcularTotalesTablaHorarios();

}






//=============================================================
// FUNCIÓN PARA CALCULAR TOTALES DE LA TABLA COMPLETA
//=============================================================

function calcularTotalesTablaHorarios() {
    let totalMinutosSemana = 0;
    let totalMinutosComidaSemana = 0;

    $('#tabla-horarios-modal tbody tr').each(function () {
        if ($(this).hasClass('table-primary')) return;

        let totalHoras = $(this).find('.total-horas').val();
        let horasComida = $(this).find('.horas-comida').val();

        if (totalHoras) {
            totalMinutosSemana += convertirHoraAMinutos(totalHoras);
        }
        if (horasComida) {
            totalMinutosComidaSemana += convertirHoraAMinutos(horasComida);
        }
    });

    let hTotal = Math.floor(totalMinutosSemana / 60);
    let mTotal = totalMinutosSemana % 60;
    $('#total_horas_semana').val(String(hTotal).padStart(2, '0') + ":" + String(mTotal).padStart(2, '0'));

    let hComida = Math.floor(totalMinutosComidaSemana / 60);
    let mComida = totalMinutosComidaSemana % 60;
    $('#total_horas_comida_semana').val(String(hComida).padStart(2, '0') + ":" + String(mComida).padStart(2, '0'));

    $('#total_minutos_semana').val(totalMinutosSemana);
}

