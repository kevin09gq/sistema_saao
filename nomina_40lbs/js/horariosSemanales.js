configModalHorarios();

// ========================================
// ESTABLECER HORARIO SEMANAL
// =======================================

function establecerHorarioSemanal() {
    // Verificar que exista jsonNomina40lbs y la propiedad horarios_semanales
    if (!jsonNomina40lbs || !jsonNomina40lbs.horarios_semanales || jsonNomina40lbs.horarios_semanales.length === 0) {
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
    jsonNomina40lbs.horarios_semanales.forEach(function (horario) {
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


// ========================================
// CONFIGURACIÓN DEL MODAL DE HORARIOS SEMANALES Y CÁLCULO DE HORAS EN TIEMPO REAL
// =======================================

// Configurar eventos para el modal de horarios
function configModalHorarios() {
    $('#btn_establecer_horario_semanal').on('click', function () {
        establecerHorarioSemanal();
        $('#modalHorarios').modal('show');
    });

    // Manejar inputs de hora: cambiar a time para editar, volver a text al terminar
    $('#modalHorarios').on('focus', '.input-hora', function () {
        $(this).attr('type', 'time');
    });

    $('#modalHorarios').on('blur', '.input-hora', function () {
        convertirAFormato24h($(this));
        var fila = $(this).closest('tr');
        calcularTotalHorasFila(fila);
    });

    // Calcular total de horas cuando cambien los inputs de tiempo
    $('#modalHorarios').on('change', '.input-entrada, .input-entrada-comida, .input-salida-comida, .input-salida', function () {
        var fila = $(this).closest('tr');
        calcularTotalHorasFila(fila);
    });

    // Evento para guardar horarios semanales
    $('#btn_guardar_horarios_semanales').on('click', function () {
        guardarHorariosEnJSON();
        redondearHorarios();
        $('#modalHorarios').modal('hide');
    });
}
// Función para calcular las horas y comida totales de una fila específica
function calcularTotalHorasFila(fila) {
    // Obtener los valores de los inputs de tiempo
    var entrada = fila.find('.input-entrada').val();
    var entradaComida = fila.find('.input-entrada-comida').val();
    var terminoComida = fila.find('.input-salida-comida').val();
    var salida = fila.find('.input-salida').val();

    // Verificar que al menos entrada y salida tengan valores
    if (entrada && salida) {
        // Convertir las horas a minutos desde medianoche
        var entradaMinutos = convertirHoraAMinutos(entrada);
        var salidaMinutos = convertirHoraAMinutos(salida);

        // Calcular el total de minutos trabajados
        var minutosTrabajados = 0;

        // Si se proporcionan las horas de comida, calcular con interrupción
        if (entradaComida && terminoComida) {
            var entradaComidaMinutos = convertirHoraAMinutos(entradaComida);
            var terminoComidaMinutos = convertirHoraAMinutos(terminoComida);

            // Calcular el total de minutos trabajados: (Entrada Comida - Entrada) + (Salida - Salida Comida)
            minutosTrabajados = (entradaComidaMinutos - entradaMinutos) + (salidaMinutos - terminoComidaMinutos);

            // Calcular horas de comida
            var horasComida = Math.floor((terminoComidaMinutos - entradaComidaMinutos) / 60);
            var minutosComida = (terminoComidaMinutos - entradaComidaMinutos) % 60;
            var horasComidaTexto = horasComida.toString().padStart(2, '0') + ':' + minutosComida.toString().padStart(2, '0');
        } else {
            // Si no hay horas de comida, calcular directamente de entrada a salida
            minutosTrabajados = salidaMinutos - entradaMinutos;

            // No hay horas de comida
            var horasComidaTexto = '00:00';
        }

        // Calcular horas y minutos trabajados
        var horas = Math.floor(minutosTrabajados / 60);
        var minutos = minutosTrabajados % 60;

        // Formatear como HH:MM
        var horasFormateadas = horas.toString().padStart(2, '0');
        var minutosFormateados = minutos.toString().padStart(2, '0');
        var totalHorasTexto = horasFormateadas + ':' + minutosFormateados;

        // Calcular minutos totales trabajados
        var minutosTotales = horas * 60 + minutos;

        // Actualizar los campos correspondientes
        fila.find('.total-horas').val(totalHorasTexto);
        fila.find('.horas-comida').val(horasComidaTexto);
        fila.find('.minutos-dia').val(minutosTotales);
    } else {
        // Limpiar campos si no hay entrada y salida
        fila.find('.total-horas').val('');
        fila.find('.horas-comida').val('');
        fila.find('.minutos-dia').val('');
    }

    // Calcular totales semanales después de actualizar la fila
    calcularTotalSemanal();
}

// Función para calcular los totales semanales "total horas, total horas comida y total minutos" sumando todas las filas
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

// ========================================
// GUARDAR HORARIOS SEMANALES EN EL JSON JSONNOMINA40LBS
// =======================================

function guardarHorariosEnJSON() {
    // Verificar que exista el objeto jsonNomina40lbs
    if (!jsonNomina40lbs) {
        jsonNomina40lbs = {};
    }

    // Crear o inicializar la propiedad horarios_semanales
    if (!jsonNomina40lbs.horarios_semanales) {
        jsonNomina40lbs.horarios_semanales = [];
    }

    // Limpiar el array existente
    jsonNomina40lbs.horarios_semanales = [];

    // Recopilar datos de cada fila de la tabla
    $('#tabla-horarios-modal tbody tr').each(function () {
        // Saltar la fila de totales
        if ($(this).hasClass('table-primary')) {
            return;
        }

        var dia = $(this).data('dia');
        var entrada = $(this).find('.input-entrada').val();
        var entradaComida = $(this).find('.input-entrada-comida').val();
        var terminoComida = $(this).find('.input-salida-comida').val();
        var salida = $(this).find('.input-salida').val();
        var totalHoras = $(this).find('.total-horas').val();
        var horasComida = $(this).find('.horas-comida').val();
        var minutos = $(this).find('.minutos-dia').val();

        // Solo guardar si hay al menos entrada y salida
        if (entrada && salida) {
            var horarioDia = {
                dia: dia,
                entrada: entrada,
                entrada_comida: entradaComida || '',
                termino_comida: terminoComida || '',
                salida: salida,
                total_horas: totalHoras || '00:00',
                horas_comida: horasComida || '00:00',
                minutos: minutos || 0
            };

            jsonNomina40lbs.horarios_semanales.push(horarioDia);
        }
    });

    // Guardar en localStorage
    if (typeof saveNomina === 'function') {
        saveNomina(jsonNomina40lbs);
    }

}


// ========================================
// FUNCIONES AUXILIARES PARA CONVERTIR HORAS Y CONVERTIR A FORMATO 24H
// =======================================


// Función para convertir hora en formato HH:MM a minutos desde medianoche
function convertirHoraAMinutos(hora) {
    var partes = hora.split(':');
    var horas = parseInt(partes[0], 10);
    var minutos = parseInt(partes[1], 10);
    return horas * 60 + minutos;
}
// Convertir input de time a formato 24h y cambiar a type="text"
function convertirAFormato24h(input) {
    var valor = input.val();
    if (valor) {
        // El value ya viene en formato 24h desde tipo time (HH:MM)
        input.attr('type', 'text').val(valor);
    } else {
        input.attr('type', 'text');
    }
}