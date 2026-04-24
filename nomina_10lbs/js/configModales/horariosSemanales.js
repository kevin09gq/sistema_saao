configModalHorarios();

// ========================================
// ESTABLECER HORARIO SEMANAL
// =======================================

function establecerHorarioSemanal() {
    // Verificar que exista jsonNomina10lbs y la propiedad horarios_semanales
    if (!jsonNomina10lbs || !jsonNomina10lbs.horarios_semanales || jsonNomina10lbs.horarios_semanales.length === 0) {
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
    jsonNomina10lbs.horarios_semanales.forEach(function (horario) {
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

    // Manejar inputs de hora: cambiar a time para editar, volver a text al terminar
    $('#modalHorarios').on('focus', '.input-hora', function () {
        $(this).attr('type', 'time');
    });

    $('#modalHorarios').on('blur', '.input-hora', function () {
        convertirAFormato24h($(this));
    });

    // Evento para guardar horarios semanales
    $('#btn_guardar_horarios_semanales').on('click', function () {
        guardarHorariosEnJSON();
        
        $('#modalHorarios').modal('hide');
    });
}

// ========================================
// GUARDAR HORARIOS SEMANALES EN EL JSON JSONNOMINA10LBS
// =======================================

function guardarHorariosEnJSON() {
    // Verificar que exista el objeto jsonNomina10lbs
    if (!jsonNomina10lbs) {
        jsonNomina10lbs = {};
    }

    // Crear o inicializar la propiedad horarios_semanales
    if (!jsonNomina10lbs.horarios_semanales) {
        jsonNomina10lbs.horarios_semanales = [];
    }

    // Limpiar el array existente
    jsonNomina10lbs.horarios_semanales = [];

    // Recopilar datos de cada fila de la tabla
    $('#tabla-horarios-modal tbody tr').each(function () {
        var dia = $(this).data('dia');
        var entrada = $(this).find('.input-entrada').val();
        var entradaComida = $(this).find('.input-entrada-comida').val();
        var terminoComida = $(this).find('.input-salida-comida').val();
        var salida = $(this).find('.input-salida').val();

        // Solo guardar si hay al menos entrada y salida
        if (entrada && salida) {
            var horarioDia = {
                dia: dia,
                entrada: entrada,
                entrada_comida: entradaComida || '',
                termino_comida: terminoComida || '',
                salida: salida
            };

            jsonNomina10lbs.horarios_semanales.push(horarioDia);
        }
    });

    // Guardar en localStorage
    if (typeof saveNomina === 'function') {
        saveNomina(jsonNomina10lbs);
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