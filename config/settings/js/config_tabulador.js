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

    // Llama aquí para hacer la tabla editable después de llenarla
    tablaEditable();
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
        let minutos = item.minutos !== undefined ? item.minutos : '';
        let sueldoBase = item.sueldo_base !== undefined ? item.sueldo_base : '';
        let sueldoEspecial = item.sueldo_especial !== undefined ? item.sueldo_especial : '';
        let costoMinuto = item.costo_por_minuto !== undefined ? item.costo_por_minuto : '';
        let tipo = item.tipo === "hora_extra" ? "Hora extra" : "";

        // Clase para mostrar símbolo de $ de forma visual sin alterar el contenido
        let classAdicional = tipo ? '' : 'currency';

        $tbody.append(`
            <tr>
                <td>${desde}</td>
                <td>${hasta}</td>
                <td>${minutos}</td>
                <td class="currency">${sueldoBase}</td>
                <td class="currency">${costoMinuto}</td>
                <td class="${classAdicional}">${tipo || sueldoEspecial}</td>
            </tr>
        `);
    });

    // Llama aquí para hacer la tabla editable después de llenarla
    tablaEditable();
}

function tablaEditable() {
    // Permitir editar todas las celdas
    $("#tabulador-tbody td").attr("contenteditable", "true");

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
        let nuevoValor = valor.replace(/[^0-9.]/g, "");
        if (valor !== nuevoValor) {
            $(this).text(nuevoValor);
        }
    });
}
