// Inyecta estilo para mostrar el signo de $ solo de forma visual en celdas con clase "currency"
(function injectCurrencyStyle() {
    const styleId = 'currency-td-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #tabulador-tbody td.currency::before {
                content: '$';
                margin-right: 2px;
            }
        `;
        document.head.appendChild(style);
    }
})();

// Función para crear una nueva fila (normal u hora extra)
function crearNuevaFila(esHoraExtra = false) {
    const $tbody = $("#tabulador-tbody");
    const newRow = $(
        `
        <tr ${esHoraExtra ? 'data-tipo="hora_extra"' : 'data-tipo="normal"'}>
            <td contenteditable="true">${esHoraExtra ? '48:01' : '00:00'}</td>
            <td contenteditable="true">${esHoraExtra ? 'en adelante' : '00:00'}</td>
            <td contenteditable="true">${esHoraExtra ? '' : '0'}</td>
            <td class="${esHoraExtra ? '' : 'currency'}" contenteditable="true">${esHoraExtra ? '' : '0.00'}</td>
            <td class="currency" contenteditable="true">${esHoraExtra ? '1.34' : '0.00'}</td>
            <td class="${esHoraExtra ? '' : 'currency'}" contenteditable="true">${esHoraExtra ? 'Hora extra' : '0.00'}</td>
        </tr>
        `
    );

    if (esHoraExtra) {
        // En hora extra, minutos, sueldo base y etiqueta 'Hora extra' no aplican para edición
        newRow.find('td:nth-child(3), td:nth-child(4), td:nth-child(6)')
            .attr('contenteditable', 'false');
        // Asegurar que la última celda no tenga formato de moneda
        newRow.find('td:nth-child(6)').removeClass('currency');
    }

    $tbody.append(newRow);
    return newRow;
}

// Función para eliminar la fila seleccionada
function eliminarFilaSeleccionada() {
    const $filaSeleccionada = $("#tabulador-tbody tr.selected");
    if ($filaSeleccionada.length > 0) {
        $filaSeleccionada.remove();
    } else if ($("#tabulador-tbody tr").length > 1) {
        // Si no hay fila seleccionada pero hay más de una fila, eliminar la última
        $("#tabulador-tbody tr:last").remove();
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Debe haber al menos una fila en el tabulador.'
        });
    }
}

$(document).ready(function () {
    // Espera a que window.rangosHorasJson esté disponible (puede llegar por AJAX desde obtener_tabulador.js)
    let intentos = 0;
    let intervalo = setInterval(function () {
        if (window.rangosHorasJson && Array.isArray(window.rangosHorasJson) && window.rangosHorasJson.length > 0) {
            llenarTablaTabulador(window.rangosHorasJson);
            clearInterval(intervalo);
        }
        intentos++;
        if (intentos > 20) { // Espera hasta 2 segundos
            clearInterval(intervalo);
        }
    }, 100);

    // Botón actualizar tabulador: respeta el formato original pero fuerza números
    $("#btn-actualizar-tabulador").on("click", function () {
        let datosTabulador = [];
        $("#tabulador-tbody tr").each(function () {
            let fila = $(this);
            let desde = fila.find("td:nth-child(1)").text().trim();
            let hasta = fila.find("td:nth-child(2)").text().trim();
            let minutos = fila.find("td:nth-child(3)").text().trim();
            let sueldoBase = fila.find("td:nth-child(4)").text().trim();
            let costoMinuto = fila.find("td:nth-child(5)").text().trim();
            let sexto = fila.find("td:nth-child(6)").text().trim();

            if (sexto.toLowerCase() === "hora extra") {
                datosTabulador.push({
                    "rango": { "desde": desde, "hasta": hasta },
                    "tipo": "hora_extra",
                    "costo_por_minuto": Number(costoMinuto)
                });
            } else {
                datosTabulador.push({
                    "rango": { "desde": desde, "hasta": hasta },
                    "minutos": Number(minutos),
                    "sueldo_base": Number(sueldoBase),
                    "sueldo_especial": Number(sexto),
                    "costo_por_minuto": Number(costoMinuto)
                });
            }
        });

        let infoTabulador = JSON.stringify(datosTabulador, null, 2);

        $.ajax({
            url: '/sistema_saao/config/settings/php/tabulador.php',
            method: 'POST',
            data: {
                accion: 'actualizarTabulador',
                id_empresa: 1,
                info_tabulador: infoTabulador
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: response.message
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message
                    });
                }
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al actualizar el tabulador: ' + error
                });
            }
        });
    });

    // Hacer la tabla editable
    tablaEditable();

    // Manejar clic en filas para selección
    $("#tabulador-tbody").on('click', 'tr', function() {
        $("#tabulador-tbody tr").removeClass('selected');
        $(this).addClass('selected');
    });

    // Botón para agregar nueva fila
    $("#btn-agregar-fila").on('click', function() {
        crearNuevaFila();
    });

    // Botón para agregar fila de Hora Extra
    $("#btn-agregar-extra").on('click', function() {
        // Evitar duplicados de hora extra
        const yaExiste = $("#tabulador-tbody tr").filter(function(){
            return $(this).data('tipo') === 'hora_extra' || $(this).find('td:last').text().trim().toLowerCase() === 'hora extra';
        }).length > 0;
        if (yaExiste) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Ya existe una fila de Hora Extra.'
            });
            return;
        }
        crearNuevaFila(true);
    });

    // Botón para eliminar fila seleccionada
    $("#btn-eliminar-fila").on('click', function() {
        eliminarFilaSeleccionada();
    });

    // Manejar tecla Enter para agregar nueva fila
    $(document).on('keydown', '#tabulador-tbody td[contenteditable=true]', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Si es la última celda de la última fila, agregar nueva fila
            if ($(this).is('td:last-child') && $(this).closest('tr').is('tr:last-child')) {
                crearNuevaFila();
            }
            // Mover al siguiente campo o fila
            const $next = $(this).next('td');
            if ($next.length) {
                $next.focus();
            } else {
                $(this).closest('tr').next('tr').find('td:first').focus();
            }
        }
    });
});

function llenarTablaTabulador(jsonTabulador) {
    let $tbody = $("#tabulador-tbody");
    $tbody.empty();

    if (!Array.isArray(jsonTabulador)) return;

    jsonTabulador.forEach(function (item) {
        let desde = item.rango?.desde || '';
        let hasta = item.rango?.hasta || '';
        // Si el hasta es exactamente "en adelante" (con o sin :00), mostrar solo "en adelante"
        if (typeof hasta === "string" && hasta.toLowerCase().startsWith("en adelante")) {
            hasta = "en adelante";
        }

        const esHoraExtra = item.tipo === 'hora_extra';
        const $fila = crearNuevaFila(esHoraExtra);

        // Rellenar valores
        $fila.find('td:nth-child(1)').text(desde || (esHoraExtra ? '48:01' : '00:00'));
        $fila.find('td:nth-child(2)').text(hasta || (esHoraExtra ? 'en adelante' : '00:00'));
        if (esHoraExtra) {
            $fila.attr('data-tipo', 'hora_extra');
            $fila.find('td:nth-child(5)').text(item.costo_por_minuto !== undefined ? item.costo_por_minuto : '1.34');
            $fila.find('td:nth-child(6)').text('Hora extra').removeClass('currency');
        } else {
            $fila.attr('data-tipo', 'normal');
            $fila.find('td:nth-child(3)').text(item.minutos !== undefined ? item.minutos : '');
            $fila.find('td:nth-child(4)').text(item.sueldo_base !== undefined ? item.sueldo_base : '');
            $fila.find('td:nth-child(5)').text(item.costo_por_minuto !== undefined ? item.costo_por_minuto : '');
            $fila.find('td:nth-child(6)').text(item.sueldo_especial !== undefined ? item.sueldo_especial : '');
        }
    });

    // Llama aquí para hacer la tabla editable después de llenarla
    tablaEditable();
}

function tablaEditable() {
    // Resetear y aplicar contenteditable según el tipo de fila
    $("#tabulador-tbody tr").each(function(){
        const $tr = $(this);
        const esHoraExtra = ($tr.data('tipo') === 'hora_extra') || ($tr.find('td:last').text().trim().toLowerCase() === 'hora extra');
        $tr.find('td').attr('contenteditable', 'true');
        if (esHoraExtra) {
            // Bloquear minutos (3), sueldo base (4) y etiqueta (6)
            $tr.find('td:nth-child(3), td:nth-child(4), td:nth-child(6)').attr('contenteditable', 'false');
            // Asegurar formato visual correcto
            $tr.find('td:nth-child(6)').removeClass('currency').text('Hora extra');
        }
    });

    // Solo permitir números y dos puntos en columnas de hora (col 1 y 2)
    $("#tabulador-tbody").on("input", "td:nth-child(1)[contenteditable], td:nth-child(2)[contenteditable]", function () {
        let valor = $(this).text();
        // Limpiar todo lo que no sea número o dos puntos
        let nuevoValor = valor.replace(/[^0-9:]/g, "");
        // Formato máximo 5 caracteres (00:00)
        if (nuevoValor.length > 5) {
            nuevoValor = nuevoValor.substring(0, 5);
        }
        // Formatear automáticamente a 00:00 si hay 4 o más dígitos
        let soloNumeros = nuevoValor.replace(/:/g, "");
        if (soloNumeros.length >= 3) {
            let h = soloNumeros.substring(0, 2);
            let m = soloNumeros.substring(2, 4);
            nuevoValor = h + ":" + (m ? m : "");
        }
        if (valor !== nuevoValor) {
            $(this).text(nuevoValor);
        }
    });

    // Para las demás columnas, solo permitir números y punto decimal
    $("#tabulador-tbody").on("input", "td:not(:nth-child(1)):not(:nth-child(2))[contenteditable]", function () {
        let valor = $(this).text();
        // Si es la columna 6 de hora extra, no permitir edición
        if ($(this).index() === 5 && ($(this).closest('tr').data('tipo') === 'hora_extra')) {
            $(this).text('Hora extra');
            return;
        }
        let nuevoValor = valor.replace(/[^0-9.]/g, "");
        if (valor !== nuevoValor) {
            $(this).text(nuevoValor);
        }
    });
}
