// Establecer Datos Por Defecto en la tabla de Horarios
// Este Evento se llamara cuando se una el JsonGlobal

// Llamamos la función pasándole el JSON que está en rangos_horarios.js
function setDataTableHorarios(data) {
    var tbody = $(".tabla-horarios tbody");
    tbody.empty();

    $.each(data.semana, function (clave, diaInfo) {
        var fila = $("<tr>").addClass("fila-horario");

        fila.append($("<td>").addClass("etiqueta-dia").text(diaInfo.dia));
        fila.append($("<td>").addClass("celda-hora editable").attr("contenteditable", "true").text(diaInfo.entrada));
        fila.append($("<td>").addClass("celda-hora editable").attr("contenteditable", "true").text(diaInfo.salidaComida));
        fila.append($("<td>").addClass("celda-hora editable").attr("contenteditable", "true").text(diaInfo.entradaComida));
        fila.append($("<td>").addClass("celda-hora editable").attr("contenteditable", "true").text(diaInfo.salida));
        fila.append($("<td>").addClass("celda-total editable").attr("contenteditable", "true").text(diaInfo.totalHoras));
        fila.append($("<td>").addClass("celda-comida editable").attr("contenteditable", "true").text(diaInfo.horasComida));
        fila.append($("<td>").addClass("celda-minutos").text("0"));

        tbody.append(fila);
    });
}

// Función para aplicar formato y validaciones de hora en las celdas editables
function activarFormatoHora() {
    $(".editable").on("input", function () {
        let valor = $(this).text();

        valor = valor.replace(/[^0-9:]/g, "");
        valor = valor.replace(/:+/g, ':');

        if (valor.length > 5) {
            valor = valor.substring(0, 5);
        }

        if (valor.startsWith(':')) {
            valor = valor.substring(1);
        }

        if (valor.length >= 2 && !valor.includes(':')) {
            let horas = valor.substring(0, 2);
            if (parseInt(horas) > 23) {
                horas = "23";
            }
            valor = horas + valor.substring(2);
        }

        if (valor.length === 2 && !valor.includes(':')) {
            valor += ':';
        }

        if (valor.includes(':') && valor.length >= 5) {
            let partes = valor.split(':');
            if (partes[1] && parseInt(partes[1]) > 59) {
                partes[1] = "59";
            }
            valor = partes[0] + ':' + (partes[1] || '');
        }

        $(this).text(valor);

        var fila = $(this).closest('tr');
        var indiceCelda = $(this).index();

        if (indiceCelda === 1 || indiceCelda === 2 || indiceCelda === 3) {
            setTimeout(function () {
                calcularHorasComida(fila);
                calcularHorasTotales(fila);
            }, 100);
        }

        if (indiceCelda === 1 || indiceCelda === 4) {
            setTimeout(function () {
                calcularHorasTotales(fila);
            }, 100);
        }

        if (indiceCelda === 6) {
            setTimeout(function () {
                calcularHorasTotalesConComidaManual(fila);
                calcularTotalesSemana();
            }, 100);
        }

        let range = document.createRange();
        let sel = window.getSelection();
        range.selectNodeContents(this);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    });

    $(".editable").on("blur", function () {
        let valor = $(this).text();

        if (valor === "") {
            $(this).text("00:00");
            return;
        }

        if (valor.length === 1) {
            $(this).text("0" + valor + ":00");
        } else if (valor.length === 2 && !valor.includes(':')) {
            $(this).text(valor + ":00");
        } else if (valor.length === 3 && valor.includes(':')) {
            $(this).text(valor + "00");
        } else if (valor.length === 4 && valor.includes(':')) {
            $(this).text(valor + "0");
        }

        if ($(this).hasClass('celda-comida')) {
            validarHorasComida($(this));
        }

        var fila = $(this).closest('tr');
        var indiceCelda = $(this).index();

        if (indiceCelda === 1 || indiceCelda === 2 || indiceCelda === 3) {
            calcularHorasComida(fila);
            calcularHorasTotales(fila);
        }

        if (indiceCelda === 1 || indiceCelda === 4) {
            calcularHorasTotales(fila);
        }

        if (indiceCelda === 6) {
            calcularHorasTotalesConComidaManual(fila);
            calcularTotalesSemana();
        }
    });
}

function validarHorasComida(celda) {
    let valor = celda.text();

    if (valor === "00:00") {
        return;
    }

    let [horas, minutos] = valor.split(':').map(Number);
    let totalMinutos = (horas * 60) + minutos;
    let tiemposValidos = [30, 60, 90, 120];

    if (!tiemposValidos.includes(totalMinutos)) {
        let tiempoMasCercano = tiemposValidos.reduce((prev, curr) =>
            Math.abs(curr - totalMinutos) < Math.abs(prev - totalMinutos) ? curr : prev
        );

        let horasCorregidas = Math.floor(tiempoMasCercano / 60);
        let minutosCorregidos = tiempoMasCercano % 60;
        let valorCorregido = horasCorregidas.toString().padStart(2, '0') + ':' +
            minutosCorregidos.toString().padStart(2, '0');

        celda.text(valorCorregido);
    }
}

function calcularHorasComida(fila) {
    var entrada = fila.find('.celda-hora.editable').eq(0).text();
    var salidaComida = fila.find('.celda-hora.editable').eq(1).text();
    var entradaComida = fila.find('.celda-hora.editable').eq(2).text();
    var celdaHorasComida = fila.find('.celda-comida.editable');

    if (entrada === "00:00" || entrada === "") {
        celdaHorasComida.text("00:00");
        return;
    }

    if ((salidaComida === "00:00" || salidaComida === "") &&
        (entradaComida === "00:00" || entradaComida === "")) {
        celdaHorasComida.text("00:00");
        return;
    }

    if (salidaComida === "00:00" || salidaComida === "" ||
        entradaComida === "00:00" || entradaComida === "") {
        celdaHorasComida.text("00:00");
        return;
    }

    if (!esHoraValida(salidaComida) || !esHoraValida(entradaComida)) {
        celdaHorasComida.text("00:00");
        return;
    }

    var salidaMinutos = convertirHoraAMinutos(salidaComida);
    var entradaMinutos = convertirHoraAMinutos(entradaComida);

    if (isNaN(salidaMinutos) || isNaN(entradaMinutos)) {
        celdaHorasComida.text("00:00");
        return;
    }

    var diferenciaMinutos = entradaMinutos - salidaMinutos;

    if (diferenciaMinutos <= 0) {
        celdaHorasComida.text("00:00");
        return;
    }

    var horasComida = convertirMinutosAHora(diferenciaMinutos);

    if (horasComida.includes("NaN")) {
        celdaHorasComida.text("00:00");
        return;
    }

    celdaHorasComida.text(horasComida);
}

function esHoraValida(hora) {
    var patron = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!patron.test(hora)) {
        return false;
    }

    if (hora.includes("NaN")) {
        return false;
    }

    return true;
}

function convertirHoraAMinutos(hora) {
    if (!hora || hora === "" || hora.includes("NaN")) {
        return NaN;
    }

    var partes = hora.split(':');

    if (partes.length !== 2) {
        return NaN;
    }

    var horas = parseInt(partes[0]);
    var minutos = parseInt(partes[1]);

    if (isNaN(horas) || isNaN(minutos)) {
        return NaN;
    }

    return (horas * 60) + minutos;
}

function convertirMinutosAHora(totalMinutos) {
    if (isNaN(totalMinutos) || totalMinutos < 0) {
        return "00:00";
    }

    var horas = Math.floor(totalMinutos / 60);
    var minutos = totalMinutos % 60;

    if (isNaN(horas) || isNaN(minutos)) {
        return "00:00";
    }

    return horas.toString().padStart(2, '0') + ':' + minutos.toString().padStart(2, '0');
}

function actualizarHorariosSemanalesActualizados() {
    $("#guardar-cambios").off('click').on('click', function (e) {
        e.preventDefault();
       
        
        if (!window.horariosSemanalesActualizados) {
            window.horariosSemanalesActualizados = JSON.parse(JSON.stringify(window.horariosSemanales));
        }

        $(".tabla-horarios tbody tr").each(function () {
            var fila = $(this);
            var nombreDia = fila.find('.etiqueta-dia').text().toLowerCase();

            var mapaDias = {
                'viernes': 'viernes',
                'sábado': 'sabado',
                'domingo': 'domingo',
                'lunes': 'lunes',
                'martes': 'martes',
                'miércoles': 'miercoles',
                'jueves': 'jueves'
            };

            var claveDia = mapaDias[nombreDia];

            if (claveDia && window.horariosSemanalesActualizados.semana[claveDia]) {
                window.horariosSemanalesActualizados.semana[claveDia].entrada = fila.find('.celda-hora.editable').eq(0).text();
                window.horariosSemanalesActualizados.semana[claveDia].salidaComida = fila.find('.celda-hora.editable').eq(1).text();
                window.horariosSemanalesActualizados.semana[claveDia].entradaComida = fila.find('.celda-hora.editable').eq(2).text();
                window.horariosSemanalesActualizados.semana[claveDia].salida = fila.find('.celda-hora.editable').eq(3).text();
                window.horariosSemanalesActualizados.semana[claveDia].totalHoras = fila.find('.celda-total.editable').text();
                window.horariosSemanalesActualizados.semana[claveDia].horasComida = fila.find('.celda-comida.editable').text();
            }
        });

        if (typeof redondearRegistrosEmpleados === 'function') {
            // Forzar recálculo completo cuando se modifican horarios oficiales
            redondearRegistrosEmpleados(true);
            
            // Actualizar la tabla para mostrar los cambios
            if (typeof setEmpleadosPaginados === 'function' && window.empleadosOriginales) {
                setEmpleadosPaginados(window.empleadosOriginales);
            }
        }

        $('#horarios_modal').modal('hide');
        console.log(jsonGlobal);
        
    });
}

function encontrarEmpleadoEnJsonGlobal(clave) {
    if (!window.jsonGlobal || !window.jsonGlobal.departamentos) return null;

    for (let depto of window.jsonGlobal.departamentos) {
        if ((depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS')) {
            for (let emp of depto.empleados || []) {
                if (emp.clave === clave) {
                    return emp;
                }
            }
        }
    }
    return null;
}

function calcularMinutosTotales(fila) {
    var totalHoras = fila.find('.celda-total.editable').text();
    var celdaMinutos = fila.find('.celda-minutos');

    if (totalHoras === "00:00" || totalHoras === "" || !esHoraValida(totalHoras)) {
        celdaMinutos.text("0");
        return;
    }

    var totalMinutos = convertirHoraAMinutos(totalHoras);
    
    if (isNaN(totalMinutos)) {
        celdaMinutos.text("0");
        return;
    }

    celdaMinutos.text(totalMinutos.toString());
}

function calcularHorasTotales(fila) {
    var entrada = fila.find('.celda-hora.editable').eq(0).text();
    var salida = fila.find('.celda-hora.editable').eq(3).text();
    var salidaComida = fila.find('.celda-hora.editable').eq(1).text();
    var entradaComida = fila.find('.celda-hora.editable').eq(2).text();
    var celdaTotalHoras = fila.find('.celda-total.editable');

    if (entrada === "00:00" || entrada === "" || salida === "00:00" || salida === "") {
        celdaTotalHoras.text("00:00");
        calcularMinutosTotales(fila);
        return;
    }

    if (!esHoraValida(entrada) || !esHoraValida(salida)) {
        celdaTotalHoras.text("00:00");
        calcularMinutosTotales(fila);
        return;
    }

    var entradaMinutos = convertirHoraAMinutos(entrada);
    var salidaMinutos = convertirHoraAMinutos(salida);

    if (isNaN(entradaMinutos) || isNaN(salidaMinutos)) {
        celdaTotalHoras.text("00:00");
        calcularMinutosTotales(fila);
        return;
    }

    var totalMinutosTrabajados = salidaMinutos - entradaMinutos;

    if (totalMinutosTrabajados < 0) {
        totalMinutosTrabajados += (24 * 60);
    }

    var tiempoComidaMinutos = 0;
    if (salidaComida !== "00:00" && salidaComida !== "" &&
        entradaComida !== "00:00" && entradaComida !== "") {

        if (esHoraValida(salidaComida) && esHoraValida(entradaComida)) {
            var salidaComidaMinutos = convertirHoraAMinutos(salidaComida);
            var entradaComidaMinutos = convertirHoraAMinutos(entradaComida);

            if (!isNaN(salidaComidaMinutos) && !isNaN(entradaComidaMinutos)) {
                tiempoComidaMinutos = entradaComidaMinutos - salidaComidaMinutos;
                if (tiempoComidaMinutos > 0) {
                    totalMinutosTrabajados -= tiempoComidaMinutos;
                }
            }
        }
    }

    if (totalMinutosTrabajados <= 0) {
        celdaTotalHoras.text("00:00");
        calcularMinutosTotales(fila);
        return;
    }

    var horasTotales = convertirMinutosAHora(totalMinutosTrabajados);

    if (horasTotales.includes("NaN")) {
        celdaTotalHoras.text("00:00");
        calcularMinutosTotales(fila);
        return;
    }

    celdaTotalHoras.text(horasTotales);
    calcularMinutosTotales(fila);
    calcularTotalesSemana();
}

function calcularHorasTotalesConComidaManual(fila) {
    var entrada = fila.find('.celda-hora.editable').eq(0).text();
    var salida = fila.find('.celda-hora.editable').eq(3).text();
    var horasComidaManual = fila.find('.celda-comida.editable').text();
    var celdaTotalHoras = fila.find('.celda-total.editable');

    if (entrada === "00:00" || entrada === "" || salida === "00:00" || salida === "") {
        celdaTotalHoras.text("00:00");
        calcularMinutosTotales(fila);
        return;
    }

    if (!esHoraValida(entrada) || !esHoraValida(salida)) {
        celdaTotalHoras.text("00:00");
        calcularMinutosTotales(fila);
        return;
    }

    var entradaMinutos = convertirHoraAMinutos(entrada);
    var salidaMinutos = convertirHoraAMinutos(salida);

    if (isNaN(entradaMinutos) || isNaN(salidaMinutos)) {
        celdaTotalHoras.text("00:00");
        calcularMinutosTotales(fila);
        return;
    }

    var totalMinutosTrabajados = salidaMinutos - entradaMinutos;

    if (totalMinutosTrabajados < 0) {
        totalMinutosTrabajados += (24 * 60);
    }

    if (horasComidaManual !== "00:00" && horasComidaManual !== "" && esHoraValida(horasComidaManual)) {
        var horasComidaMinutos = convertirHoraAMinutos(horasComidaManual);
        if (!isNaN(horasComidaMinutos) && horasComidaMinutos > 0) {
            totalMinutosTrabajados -= horasComidaMinutos;
        }
    }

    if (totalMinutosTrabajados <= 0) {
        celdaTotalHoras.text("00:00");
        calcularMinutosTotales(fila);
        return;
    }

    var horasTotales = convertirMinutosAHora(totalMinutosTrabajados);

    if (horasTotales.includes("NaN")) {
        celdaTotalHoras.text("00:00");
        calcularMinutosTotales(fila);
        return;
    }

    celdaTotalHoras.text(horasTotales);
    calcularMinutosTotales(fila);
    calcularTotalesSemana();
}

function calcularTotalesSemana() {
    var totalHorasSemanales = 0;
    var totalComidaSemanales = 0;
    var totalMinutosSemanales = 0;

    $(".tabla-horarios tbody tr").each(function () {
        var fila = $(this);

        var horasTotales = fila.find('.celda-total.editable').text();
        if (horasTotales && horasTotales !== "00:00") {
            var minutosHoras = convertirHoraAMinutos(horasTotales);
            if (!isNaN(minutosHoras)) {
                totalHorasSemanales += minutosHoras;
            }
        }

        var horasComida = fila.find('.celda-comida.editable').text();
        if (horasComida && horasComida !== "00:00") {
            var minutosComida = convertirHoraAMinutos(horasComida);
            if (!isNaN(minutosComida)) {
                totalComidaSemanales += minutosComida;
            }
        }

        var minutosDia = fila.find('.celda-minutos').text();
        if (minutosDia && minutosDia !== "0") {
            var minutosNumero = parseInt(minutosDia);
            if (!isNaN(minutosNumero)) {
                totalMinutosSemanales += minutosNumero;
            }
        }
    });

    var totalHorasFormateadas = convertirMinutosAHora(totalHorasSemanales);
    var totalComidaFormateadas = convertirMinutosAHora(totalComidaSemanales);

    $(".celda-total-horas-semana").text(totalHorasFormateadas);
    $(".celda-total-comida-semana").text(totalComidaFormateadas);
    $(".celda-total-minutos-semana").text(totalMinutosSemanales.toString());
}

function inicializarTotales() {
    setTimeout(function () {
        calcularTotalesSemana();
    }, 500);
}