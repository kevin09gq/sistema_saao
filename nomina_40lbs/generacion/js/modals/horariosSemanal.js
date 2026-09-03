$(document).ready(function () {
    abrirModalHorarioSemanal();

    activarSelectorHora();

    activarNavegacionCeldas();

    guardarHorariosEnJSON();
});

//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE HORARIO SEMANAL
//===================================================

function abrirModalHorarioSemanal() {

    // Detectar el clic en el botón "btn_establecer_horario_semanal"
    $('#btn_establecer_horario_semanal').click(function () {

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
    if (!jsonNomina40lbs.horarios_semanales) {
        return;
    }

    // Recorrer todos los horarios guardados
    jsonNomina40lbs.horarios_semanales.forEach((horario) => {

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

//===================================================
// FUNCIÓN PARA ACTIVAR EL SELECTOR DE HORA
// CUANDO EL USUARIO HAGA CLIC EN CUALQUIER
// CAMPO DE ENTRADA O SALIDA.
//===================================================

function activarSelectorHora() {
    // Manejar inputs de hora: cambiar a time para editar, volver a text al terminar
    $('#modalHorarioSemanal').on('focus', '.input-hora', function () {
        $(this).attr('type', 'time');
    });

    // Manejar inputs de hora: convertir a formato 24h al perder el foco
    $('#modalHorarioSemanal').on('blur', '.input-hora', function () {
        convertirAFormato24h($(this));

        // Obtener la fila donde se modificó la hora
        let fila = $(this).closest('tr');

        calcularTotalHorasFila(fila);
        calcularHorasComidaFila(fila);
        calcularMinutosFila(fila);
        calcularTotalesTablaHorarios();
    });

}

//=================================================================================
// FUNCION PARA CONVERTIR UN INPUT DE TIME A FORMATO 24H Y CAMBIAR A TYPE="TEXT"
//=================================================================================

function convertirAFormato24h(input) {
    var valor = input.val();
    if (valor) {
        // El value ya viene en formato 24h desde tipo time (HH:MM)
        input.attr('type', 'text').val(valor);
    } else {
        input.attr('type', 'text');
    }
}

//===================================================
// FUNCIÓN PARA CALCULAR EL TOTAL DE HORAS
// DESCONTANDO EL TIEMPO DE COMIDA.
// SOPORTA TURNOS QUE TERMINAN AL DÍA SIGUIENTE.
//===================================================

function calcularTotalHorasFila(fila) {

    // Obtener las horas de entrada y salida
    let entrada = fila.find('.input-entrada').val();
    let salida = fila.find('.input-salida').val();

    // Obtener las horas de comida
    let entradaComida = fila.find('.input-entrada-comida').val();
    let salidaComida = fila.find('.input-salida-comida').val();

    // Verificar que existan la entrada y la salida
    if (entrada == "" || salida == "") {

        fila.find('.total-horas').val("");

        return;

    }

    // Convertir entrada y salida a minutos
    let minutosEntrada = convertirHoraAMinutos(entrada);
    let minutosSalida = convertirHoraAMinutos(salida);

    // Si la salida es menor que la entrada,
    // significa que terminó al día siguiente.
    if (minutosSalida < minutosEntrada) {

        minutosSalida += 24 * 60;

    }

    // Calcular el tiempo total transcurrido
    let diferencia = minutosSalida - minutosEntrada;

    // Verificar que exista horario de comida
    if (entradaComida != "" && salidaComida != "") {

        // Convertir las horas de comida a minutos
        let minutosEntradaComida = convertirHoraAMinutos(entradaComida);

        let minutosSalidaComida = convertirHoraAMinutos(salidaComida);

        // Si el regreso de comida fue al día siguiente
        if (minutosSalidaComida < minutosEntradaComida) {

            minutosSalidaComida += 24 * 60;

        }

        // Calcular cuánto duró la comida
        let minutosComida = minutosSalidaComida - minutosEntradaComida;

        // Restar el tiempo de comida
        diferencia -= minutosComida;

    }

    // Convertir nuevamente a horas y minutos
    let horas = Math.floor(diferencia / 60);

    let minutos = diferencia % 60;

    // Mostrar el resultado
    fila.find('.total-horas').val(

        String(horas).padStart(2, '0') + ":" +
        String(minutos).padStart(2, '0')

    );

}

//===================================================
// FUNCIÓN PARA CALCULAR EL TIEMPO
// DESTINADO A LA COMIDA.
//===================================================

function calcularHorasComidaFila(fila) {

    // Obtener entrada a comida
    let entradaComida = fila.find('.input-entrada-comida').val();

    // Obtener regreso de comida
    let salidaComida = fila.find('.input-salida-comida').val();

    // Verificar que ambas horas existan
    if (entradaComida == "" || salidaComida == "") {

        fila.find('.horas-comida').val("");

        return;

    }

    // Convertir a minutos
    let inicio = convertirHoraAMinutos(entradaComida);

    let fin = convertirHoraAMinutos(salidaComida);

    // Calcular diferencia
    let diferencia = fin - inicio;

    let horas = Math.floor(diferencia / 60);

    let minutos = diferencia % 60;

    // Mostrar resultado
    fila.find('.horas-comida').val(

        String(horas).padStart(2, '0') + ":" +
        String(minutos).padStart(2, '0')

    );

}

//===================================================
// FUNCIÓN PARA CALCULAR LOS MINUTOS
// TRABAJADOS DESCONTANDO EL TIEMPO DE COMIDA.
//===================================================

function calcularMinutosFila(fila) {

    // Obtener el total de horas
    let totalHoras = fila.find('.total-horas').val();

    // Verificar que exista el total de horas
    if (totalHoras == "") {

        fila.find('.minutos-dia').val("");

        return;

    }

    // Convertir el total de horas a minutos
    let minutosTrabajados = convertirHoraAMinutos(totalHoras);



    // Restar los minutos de comida
    let minutosFinales = minutosTrabajados;

    // Mostrar el resultado
    fila.find('.minutos-dia').val(minutosFinales);

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

//==========================================================
// FUNCIÓN PARA GUARDAR LOS HORARIOS EN EL JSON
// CREANDO UNA PROPIEDAD "horarios_semanales" SI NO EXISTE.
//==========================================================

function guardarHorariosEnJSON() {

    $('#btn_guardar_horarios_semanales').on('click', function () {

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

      
        redondearHorarios();
        llenarTablaNomina();
      
        // Cerrar el modal
        $('#modalHorarioSemanal').modal('hide');
        // Mostrar alerta de cargar

    });

}

//==========================================================
// FUNCIÓN PARA NAVEGAR ENTRE CELDAS EDITABLES CON TECLAS
// (FLECHAS Y ENTER)
//==========================================================
function activarNavegacionCeldas() {
    $('#modalHorarioSemanal').on('keydown', '.input-hora', function (e) {
        const key = e.key;

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(key)) {
            const $input = $(this);
            const $tr = $input.closest('tr');
            const $inputsFila = $tr.find('.input-hora');
            const colIndex = $inputsFila.index($input);

            switch (key) {
                case 'ArrowUp': {
                    e.preventDefault();
                    const $prevTr = $tr.prev('tr');
                    if ($prevTr.length && $prevTr.find('.input-hora').length) {
                        $prevTr.find('.input-hora').eq(colIndex).focus();
                    }
                    break;
                }
                case 'ArrowDown': {
                    e.preventDefault();
                    const $nextTr = $tr.next('tr');
                    if ($nextTr.length && $nextTr.find('.input-hora').length) {
                        $nextTr.find('.input-hora').eq(colIndex).focus();
                    }
                    break;
                }
                case 'ArrowLeft': {
                    e.preventDefault();
                    if (colIndex > 0) {
                        $inputsFila.eq(colIndex - 1).focus();
                    } else {
                        const $prevTr = $tr.prev('tr');
                        if ($prevTr.length && $prevTr.find('.input-hora').length) {
                            $prevTr.find('.input-hora').last().focus();
                        }
                    }
                    break;
                }
                case 'ArrowRight':
                case 'Enter': {
                    e.preventDefault();
                    if (colIndex < $inputsFila.length - 1) {
                        $inputsFila.eq(colIndex + 1).focus();
                    } else {
                        const $nextTr = $tr.next('tr');
                        if ($nextTr.length && $nextTr.find('.input-hora').length) {
                            $nextTr.find('.input-hora').first().focus();
                        }
                    }
                    break;
                }
            }
        }
    });
}


//===================================================
// FUNCION PARA ESTABLECER EL COSTO POR MINUTO DEL
// HORARIO SEMANAL DE ACUERDO AL TABULADOR
//===================================================

function establecerCostoPorMinutoHorarioSemanal() {

    // Verificar que exista el tabulador
    if (!tabuladorSueldo || tabuladorSueldo.length === 0) {
        jsonNomina40lbs.costo_por_minuto = 0;
        return;
    }

    console.log(tabuladorSueldo);
    
    // Obtener los minutos totales del horario semanal
    var minutosTrabajados = 0;

    for (var i = 0; i < jsonNomina40lbs.horarios_semanales.length; i++) {
        minutosTrabajados += parseInt(jsonNomina40lbs.horarios_semanales[i].minutos) || 0;
    }

    // Variable para guardar el último rango normal
    var ultimoRangoNormal = null;

    // Buscar el rango correspondiente
    for (var i = 0; i < tabuladorSueldo.length; i++) {

        var rango = tabuladorSueldo[i];

        if (rango.tipo === "normal") {

            ultimoRangoNormal = rango;

            if (minutosTrabajados <= rango.minutos) {

                jsonNomina40lbs.costo_por_minuto = parseFloat(rango.costo_por_minuto);
                return;
            }
        }

        // Si llegó al rango de horas extra,
        // utilizar el costo por minuto de ese rango
        if (rango.tipo === "hora_extra") {

            if (ultimoRangoNormal && minutosTrabajados > ultimoRangoNormal.minutos) {

                jsonNomina40lbs.costo_por_minuto = parseFloat(rango.costo_por_minuto);
                return;
            }
        }
    }

    // Si no encontró un rango
    jsonNomina40lbs.costo_por_minuto = 0;
}