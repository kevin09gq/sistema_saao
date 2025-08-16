// Establecer Datos Por Defecto en la tabla de Horarios
// Este Evento se llamara cuando se una el JsonGlobal

$(document).ready(function () {
    // Llamamos la función pasándole el JSON que está en rangos_horarios.js
    setDataTableHorarios(window.horariosSemanales);
    activarFormatoHora();
    actualizarHorariosSemanalesActualizados();
    
    // Inicializar totales después de cargar la tabla
    inicializarTotales();


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

            tbody.append(fila);
        });
    }


    // Función para aplicar formato y validaciones de hora en las celdas editables
    function activarFormatoHora() {
        $(".editable").on("input", function () {
            let valor = $(this).text();

            // Remover todo excepto números y ':'
            valor = valor.replace(/[^0-9:]/g, "");

            // Evitar dobles :: consecutivos
            valor = valor.replace(/:+/g, ':');

            // Prevenir más de 5 caracteres
            if (valor.length > 5) {
                valor = valor.substring(0, 5);
            }

            // No permitir que empiece con ':'
            if (valor.startsWith(':')) {
                valor = valor.substring(1);
            }

            // Validar horas (no mayor a 23)
            if (valor.length >= 2 && !valor.includes(':')) {
                let horas = valor.substring(0, 2);
                if (parseInt(horas) > 23) {
                    horas = "23";
                }
                valor = horas + valor.substring(2);
            }

            // Auto-agregar ':' después de 2 dígitos solo si no hay ':'
            if (valor.length === 2 && !valor.includes(':')) {
                valor += ':';
            }

            // Validar minutos (no mayor a 59)
            if (valor.includes(':') && valor.length >= 5) {
                let partes = valor.split(':');
                if (partes[1] && parseInt(partes[1]) > 59) {
                    partes[1] = "59";
                }
                valor = partes[0] + ':' + (partes[1] || '');
            }

            // Actualizar el contenido
            $(this).text(valor);

            // CALCULAR HORAS DE COMIDA EN TIEMPO REAL
            var fila = $(this).closest('tr');
            var indiceCelda = $(this).index();
            
            // Si es la celda de "Entrada" (índice 1), "Salida Comida" (índice 2) o "Entrada Comida" (índice 3)
            if (indiceCelda === 1 || indiceCelda === 2 || indiceCelda === 3) {
                // Calcular inmediatamente mientras se escribe
                setTimeout(function() {
                    calcularHorasComida(fila);
                    // TAMBIÉN RECALCULAR HORAS TOTALES cuando cambien horarios de comida
                    calcularHorasTotales(fila);
                }, 100); // Pequeño retraso para que se actualice el texto
            }

            // CALCULAR HORAS TOTALES EN TIEMPO REAL
            // Si es la celda de "Entrada" (índice 1) o "Salida" (índice 4)
            if (indiceCelda === 1 || indiceCelda === 4) {
                // Calcular inmediatamente mientras se escribe
                setTimeout(function() {
                    calcularHorasTotales(fila);
                }, 100); // Pequeño retraso para que se actualice el texto
            }

            // CALCULAR HORAS TOTALES cuando se edite MANUALMENTE las horas de comida
            // Si es la celda de "Horas Comida" (índice 6)
            if (indiceCelda === 6) {
                // Calcular inmediatamente mientras se escribe
                setTimeout(function() {
                    calcularHorasTotalesConComidaManual(fila);
                    // CALCULAR TOTALES DE LA SEMANA
                    calcularTotalesSemana();
                }, 100); // Pequeño retraso para que se actualice el texto
            }

            // Mover cursor al final
            let range = document.createRange();
            let sel = window.getSelection();
            range.selectNodeContents(this);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        });

        // Al perder el foco, completar formato y validar horas de comida
        $(".editable").on("blur", function () {
            let valor = $(this).text();

            // Si está vacío, poner 00:00
            if (valor === "") {
                $(this).text("00:00");
                return;
            }

            // Completar formato si solo hay números
            if (valor.length === 1) {
                $(this).text("0" + valor + ":00");
            } else if (valor.length === 2 && !valor.includes(':')) {
                $(this).text(valor + ":00");
            } else if (valor.length === 3 && valor.includes(':')) {
                $(this).text(valor + "00");
            } else if (valor.length === 4 && valor.includes(':')) {
                $(this).text(valor + "0");
            }

            // Validar horas de comida si es una celda de comida
            if ($(this).hasClass('celda-comida')) {
                validarHorasComida($(this));
            }

            // Calcular horas de comida cuando se termine de editar
            var fila = $(this).closest('tr');
            var indiceCelda = $(this).index();
            
            // Si es la celda de "Entrada" (índice 1), "Salida Comida" (índice 2) o "Entrada Comida" (índice 3)
            if (indiceCelda === 1 || indiceCelda === 2 || indiceCelda === 3) {
                calcularHorasComida(fila);
                // TAMBIÉN RECALCULAR HORAS TOTALES cuando cambien horarios de comida
                calcularHorasTotales(fila);
            }

            // CALCULAR HORAS TOTALES cuando se termine de editar
            // Si es la celda de "Entrada" (índice 1) o "Salida" (índice 4)
            if (indiceCelda === 1 || indiceCelda === 4) {
                calcularHorasTotales(fila);
            }

            // CALCULAR HORAS TOTALES cuando se termine de editar MANUALMENTE las horas de comida
            // Si es la celda de "Horas Comida" (índice 6)
            if (indiceCelda === 6) {
                calcularHorasTotalesConComidaManual(fila);
                // CALCULAR TOTALES DE LA SEMANA
                calcularTotalesSemana();
            }
        });
    }

    // Nueva función para validar las horas de comida
    function validarHorasComida(celda) {
        let valor = celda.text();

        // Permitir 00:00 (sin comida)
        if (valor === "00:00") {
            return;
        }

        // Convertir a minutos para validar
        let [horas, minutos] = valor.split(':').map(Number);
        let totalMinutos = (horas * 60) + minutos;

        // Validar que las horas de comida sean válidas (30 min, 1h, 1.5h, 2h)
        let tiemposValidos = [30, 60, 90, 120]; // En minutos

        if (!tiemposValidos.includes(totalMinutos)) {
            // Buscar el tiempo más cercano válido
            let tiempoMasCercano = tiemposValidos.reduce((prev, curr) =>
                Math.abs(curr - totalMinutos) < Math.abs(prev - totalMinutos) ? curr : prev
            );

            // Convertir de vuelta a formato HH:MM
            let horasCorregidas = Math.floor(tiempoMasCercano / 60);
            let minutosCorregidos = tiempoMasCercano % 60;
            let valorCorregido = horasCorregidas.toString().padStart(2, '0') + ':' +
                minutosCorregidos.toString().padStart(2, '0');

            // Corregir automáticamente sin mostrar alerta
            celda.text(valorCorregido);
        }
    }

    // Nueva función para calcular las horas de comida automáticamente
    function calcularHorasComida(fila) {
        // Obtener los valores de entrada, salida de comida y entrada de comida
        var entrada = fila.find('.celda-hora.editable').eq(0).text(); // Entrada
        var salidaComida = fila.find('.celda-hora.editable').eq(1).text(); // Salida Comida
        var entradaComida = fila.find('.celda-hora.editable').eq(2).text(); // Entrada Comida
        var celdaHorasComida = fila.find('.celda-comida.editable'); // Celda de Horas Comida

        // Si no hay entrada o es 00:00, poner 00:00 en horas de comida
        if (entrada === "00:00" || entrada === "") {
            celdaHorasComida.text("00:00");
            return;
        }

        // Si ambas (salida y entrada de comida) están vacías o son 00:00, poner 00:00 en horas de comida
        if ((salidaComida === "00:00" || salidaComida === "") && 
            (entradaComida === "00:00" || entradaComida === "")) {
            celdaHorasComida.text("00:00");
            return;
        }

        // Si alguna de las dos está vacía o es 00:00, no calcular
        if (salidaComida === "00:00" || salidaComida === "" || 
            entradaComida === "00:00" || entradaComida === "") {
            celdaHorasComida.text("00:00");
            return;
        }

        // Validar que las horas sean válidas antes de calcular
        if (!esHoraValida(salidaComida) || !esHoraValida(entradaComida)) {
            celdaHorasComida.text("00:00");
            return;
        }

        // Convertir las horas a minutos para hacer el cálculo
        var salidaMinutos = convertirHoraAMinutos(salidaComida);
        var entradaMinutos = convertirHoraAMinutos(entradaComida);

        // Verificar que la conversión fue exitosa
        if (isNaN(salidaMinutos) || isNaN(entradaMinutos)) {
            celdaHorasComida.text("00:00");
            return;
        }

        // Calcular la diferencia en minutos
        var diferenciaMinutos = entradaMinutos - salidaMinutos;

        // Si la diferencia es negativa o cero, poner 00:00
        if (diferenciaMinutos <= 0) {
            celdaHorasComida.text("00:00");
            return;
        }

        // Convertir los minutos de vuelta a formato HH:MM
        var horasComida = convertirMinutosAHora(diferenciaMinutos);
        
        // Verificar que el resultado no sea NaN
        if (horasComida.includes("NaN")) {
            celdaHorasComida.text("00:00");
            return;
        }
        
        // Poner el resultado en la celda de horas de comida
        celdaHorasComida.text(horasComida);
    }

    // Nueva función para validar si una hora es válida
    function esHoraValida(hora) {
        // Verificar que tenga el formato correcto
        var patron = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        
        if (!patron.test(hora)) {
            return false;
        }
        
        // Verificar que no contenga NaN
        if (hora.includes("NaN")) {
            return false;
        }
        
        return true;
    }

    // Función auxiliar para convertir hora (HH:MM) a minutos
    function convertirHoraAMinutos(hora) {
        // Verificar que la hora sea válida
        if (!hora || hora === "" || hora.includes("NaN")) {
            return NaN;
        }
        
        var partes = hora.split(':');
        
        // Verificar que tenga exactamente 2 partes
        if (partes.length !== 2) {
            return NaN;
        }
        
        var horas = parseInt(partes[0]);
        var minutos = parseInt(partes[1]);
        
        // Verificar que sean números válidos
        if (isNaN(horas) || isNaN(minutos)) {
            return NaN;
        }
        
        return (horas * 60) + minutos;
    }

    // Función auxiliar para convertir minutos a hora (HH:MM)
    function convertirMinutosAHora(totalMinutos) {
        // Verificar que sea un número válido
        if (isNaN(totalMinutos) || totalMinutos < 0) {
            return "00:00";
        }
        
        var horas = Math.floor(totalMinutos / 60);
        var minutos = totalMinutos % 60;
        
        // Verificar que no sean NaN
        if (isNaN(horas) || isNaN(minutos)) {
            return "00:00";
        }
        
        return horas.toString().padStart(2, '0') + ':' + minutos.toString().padStart(2, '0');
    }

    // Nueva función para actualizar los datos cuando se edite
    function actualizarHorariosSemanalesActualizados() {
        $("#guardar-cambios").click(function (e) {
            e.preventDefault();


            // Crear una copia del JSON original
            window.horariosSemanalesActualizados = JSON.parse(JSON.stringify(window.horariosSemanales));

            // Recorrer cada fila de la tabla para obtener los datos actuales
            $(".tabla-horarios tbody tr").each(function () {
                var fila = $(this);
                var nombreDia = fila.find('.etiqueta-dia').text().toLowerCase();

                // Mapear nombres de días en español a las claves del JSON
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

                // Si el día existe en el mapa, actualizar los datos
                if (claveDia && window.horariosSemanalesActualizados.semana[claveDia]) {
                    // Obtener los valores de cada celda editable
                    window.horariosSemanalesActualizados.semana[claveDia].entrada = fila.find('.celda-hora.editable').eq(0).text();
                    window.horariosSemanalesActualizados.semana[claveDia].salidaComida = fila.find('.celda-hora.editable').eq(1).text();
                    window.horariosSemanalesActualizados.semana[claveDia].entradaComida = fila.find('.celda-hora.editable').eq(2).text();
                    window.horariosSemanalesActualizados.semana[claveDia].salida = fila.find('.celda-hora.editable').eq(3).text();
                    window.horariosSemanalesActualizados.semana[claveDia].totalHoras = fila.find('.celda-total.editable').text();
                    window.horariosSemanalesActualizados.semana[claveDia].horasComida = fila.find('.celda-comida.editable').text();
                }
            });

            // Cerrar el modal
            $('#horarios_modal').modal('hide');

        });
    }

    // Nueva función para calcular las horas totales del día automáticamente
    function calcularHorasTotales(fila) {
        // Obtener los valores de entrada y salida
        var entrada = fila.find('.celda-hora.editable').eq(0).text(); // Entrada
        var salida = fila.find('.celda-hora.editable').eq(3).text();   // Salida
        var salidaComida = fila.find('.celda-hora.editable').eq(1).text(); // Salida Comida
        var entradaComida = fila.find('.celda-hora.editable').eq(2).text(); // Entrada Comida
        var celdaTotalHoras = fila.find('.celda-total.editable'); // Celda de Total Horas

        // Si no hay entrada o salida, poner 00:00 en total horas
        if (entrada === "00:00" || entrada === "" || salida === "00:00" || salida === "") {
            celdaTotalHoras.text("00:00");
            return;
        }

        // Validar que las horas sean válidas antes de calcular
        if (!esHoraValida(entrada) || !esHoraValida(salida)) {
            celdaTotalHoras.text("00:00");
            return;
        }

        // Convertir las horas a minutos para hacer el cálculo
        var entradaMinutos = convertirHoraAMinutos(entrada);
        var salidaMinutos = convertirHoraAMinutos(salida);

        // Verificar que la conversión fue exitosa
        if (isNaN(entradaMinutos) || isNaN(salidaMinutos)) {
            celdaTotalHoras.text("00:00");
            return;
        }

        // Calcular la diferencia total en minutos
        var totalMinutosTrabajados = salidaMinutos - entradaMinutos;

        // Si la diferencia es negativa (por ejemplo, trabajo nocturno), agregar 24 horas
        if (totalMinutosTrabajados < 0) {
            totalMinutosTrabajados += (24 * 60); // Agregar 24 horas en minutos
        }

        // Restar el tiempo de comida si existe
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

        // Si el resultado es negativo o cero, poner 00:00
        if (totalMinutosTrabajados <= 0) {
            celdaTotalHoras.text("00:00");
            return;
        }

        // Convertir los minutos de vuelta a formato HH:MM
        var horasTotales = convertirMinutosAHora(totalMinutosTrabajados);
        
        // Verificar que el resultado no sea NaN
        if (horasTotales.includes("NaN")) {
            celdaTotalHoras.text("00:00");
            return;
        }
        
        // Poner el resultado en la celda de total horas
        celdaTotalHoras.text(horasTotales);
        
        // CALCULAR TOTALES DE LA SEMANA
        calcularTotalesSemana();
    }

    // Nueva función para calcular horas totales cuando se edita manualmente el tiempo de comida
    function calcularHorasTotalesConComidaManual(fila) {
        // Obtener los valores de entrada, salida y horas de comida manual
        var entrada = fila.find('.celda-hora.editable').eq(0).text(); // Entrada
        var salida = fila.find('.celda-hora.editable').eq(3).text();   // Salida
        var horasComidaManual = fila.find('.celda-comida.editable').text(); // Horas Comida (manual)
        var celdaTotalHoras = fila.find('.celda-total.editable'); // Celda de Total Horas

        // Si no hay entrada o salida, poner 00:00 en total horas
        if (entrada === "00:00" || entrada === "" || salida === "00:00" || salida === "") {
            celdaTotalHoras.text("00:00");
            return;
        }

        // Validar que las horas sean válidas antes de calcular
        if (!esHoraValida(entrada) || !esHoraValida(salida)) {
            celdaTotalHoras.text("00:00");
            return;
        }

        // Convertir las horas a minutos para hacer el cálculo
        var entradaMinutos = convertirHoraAMinutos(entrada);
        var salidaMinutos = convertirHoraAMinutos(salida);

        // Verificar que la conversión fue exitosa
        if (isNaN(entradaMinutos) || isNaN(salidaMinutos)) {
            celdaTotalHoras.text("00:00");
            return;
        }

        // Calcular la diferencia total en minutos
        var totalMinutosTrabajados = salidaMinutos - entradaMinutos;

        // Si la diferencia es negativa (por ejemplo, trabajo nocturno), agregar 24 horas
        if (totalMinutosTrabajados < 0) {
            totalMinutosTrabajados += (24 * 60); // Agregar 24 horas en minutos
        }

        // Restar el tiempo de comida MANUAL si existe y es válido
        if (horasComidaManual !== "00:00" && horasComidaManual !== "" && esHoraValida(horasComidaManual)) {
            var horasComidaMinutos = convertirHoraAMinutos(horasComidaManual);
            if (!isNaN(horasComidaMinutos) && horasComidaMinutos > 0) {
                totalMinutosTrabajados -= horasComidaMinutos;
            }
        }

        // Si el resultado es negativo o cero, poner 00:00
        if (totalMinutosTrabajados <= 0) {
            celdaTotalHoras.text("00:00");
            return;
        }

        // Convertir los minutos de vuelta a formato HH:MM
        var horasTotales = convertirMinutosAHora(totalMinutosTrabajados);
        
        // Verificar que el resultado no sea NaN
        if (horasTotales.includes("NaN")) {
            celdaTotalHoras.text("00:00");
            return;
        }
        
        // Poner el resultado en la celda de total horas
        celdaTotalHoras.text(horasTotales);
        
        // CALCULAR TOTALES DE LA SEMANA
        calcularTotalesSemana();
    }

    // Nueva función para calcular los totales de la semana
    function calcularTotalesSemana() {
        var totalHorasSemanales = 0; // Total en minutos
        var totalComidaSemanales = 0; // Total en minutos
        
        // Recorrer todas las filas del tbody para sumar las horas
        $(".tabla-horarios tbody tr").each(function() {
            var fila = $(this);
            
            // Obtener las horas totales de esta fila
            var horasTotales = fila.find('.celda-total.editable').text();
            if (horasTotales && horasTotales !== "00:00") {
                var minutosHoras = convertirHoraAMinutos(horasTotales);
                if (!isNaN(minutosHoras)) {
                    totalHorasSemanales += minutosHoras;
                }
            }
            
            // Obtener las horas de comida de esta fila
            var horasComida = fila.find('.celda-comida.editable').text();
            if (horasComida && horasComida !== "00:00") {
                var minutosComida = convertirHoraAMinutos(horasComida);
                if (!isNaN(minutosComida)) {
                    totalComidaSemanales += minutosComida;
                }
            }
        });
        
        // Convertir los minutos totales de vuelta a formato HH:MM
        var totalHorasFormateadas = convertirMinutosAHora(totalHorasSemanales);
        var totalComidaFormateadas = convertirMinutosAHora(totalComidaSemanales);
        
        // Actualizar las celdas de totales en el tfoot
        $(".celda-total-horas-semana").text(totalHorasFormateadas);
        $(".celda-total-comida-semana").text(totalComidaFormateadas);
        
        // También mostrar en consola para verificar
        console.log('Total Horas Semana:', totalHorasFormateadas);
        console.log('Total Comida Semana:', totalComidaFormateadas);
    }

    // Función para inicializar los totales cuando se carga la tabla
    function inicializarTotales() {
        // Calcular totales iniciales cuando se carga la tabla
        setTimeout(function() {
            calcularTotalesSemana();
        }, 500); // Dar tiempo a que se cargue la tabla
    }
});


