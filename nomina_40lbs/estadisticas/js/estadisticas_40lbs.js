/**
 * ============================================================================
 * JAVASCRIPT: ESTADÍSTICAS Y COMPARATIVO DE NÓMINA 40 LIBRAS
 * ============================================================================
 */

// Dataset estático de demostración para Nómina 40 Lbs (Año 2026 y 2025)
const DATA_NOMINAS = {
    "2026": [
        { id: 1,  semana: 1,  anio: 2026, fecha_inicio: "02/01/2026", fecha_fin: "08/01/2026", percepciones: 152400.00, deducciones: 18200.00, neto: 134200.00, empleados: 42 },
        { id: 2,  semana: 2,  anio: 2026, fecha_inicio: "09/01/2026", fecha_fin: "15/01/2026", percepciones: 161850.00, deducciones: 19500.00, neto: 142350.00, empleados: 44 },
        { id: 3,  semana: 3,  anio: 2026, fecha_inicio: "16/01/2026", fecha_fin: "22/01/2026", percepciones: 141800.00, deducciones: 17620.00, neto: 124180.00, empleados: 39 }, // MINIMO
        { id: 4,  semana: 4,  anio: 2026, fecha_inicio: "23/01/2026", fecha_fin: "29/01/2026", percepciones: 159300.00, deducciones: 19100.00, neto: 140200.00, empleados: 43 },
        { id: 5,  semana: 5,  anio: 2026, fecha_inicio: "30/01/2026", fecha_fin: "05/02/2026", percepciones: 168700.00, deducciones: 20400.00, neto: 148300.00, empleados: 45 },
        { id: 6,  semana: 6,  anio: 2026, fecha_inicio: "06/02/2026", fecha_fin: "12/02/2026", percepciones: 175200.00, deducciones: 21900.00, neto: 153300.00, empleados: 46 },
        { id: 7,  semana: 7,  anio: 2026, fecha_inicio: "13/02/2026", fecha_fin: "19/02/2026", percepciones: 169400.00, deducciones: 20800.00, neto: 148600.00, empleados: 45 },
        { id: 8,  semana: 8,  anio: 2026, fecha_inicio: "20/02/2026", fecha_fin: "26/02/2026", percepciones: 181900.00, deducciones: 22600.00, neto: 159300.00, empleados: 47 },
        { id: 9,  semana: 9,  anio: 2026, fecha_inicio: "27/02/2026", fecha_fin: "05/03/2026", percepciones: 188400.00, deducciones: 23700.00, neto: 164700.00, empleados: 48 },
        { id: 10, semana: 10, anio: 2026, fecha_inicio: "06/03/2026", fecha_fin: "12/03/2026", percepciones: 195600.00, deducciones: 24800.00, neto: 170800.00, empleados: 49 },
        { id: 11, semana: 11, anio: 2026, fecha_inicio: "13/03/2026", fecha_fin: "19/03/2026", percepciones: 212400.00, deducciones: 27750.00, neto: 184650.00, empleados: 52 }, // MAXIMO
        { id: 12, semana: 12, anio: 2026, fecha_inicio: "20/03/2026", fecha_fin: "26/03/2026", percepciones: 190100.00, deducciones: 24200.00, neto: 165900.00, empleados: 48 },
        { id: 13, semana: 13, anio: 2026, fecha_inicio: "27/03/2026", fecha_fin: "02/04/2026", percepciones: 187950.00, deducciones: 24300.00, neto: 163650.00, empleados: 47 },
        { id: 14, semana: 14, anio: 2026, fecha_inicio: "03/04/2026", fecha_fin: "09/04/2026", percepciones: 201300.00, deducciones: 24800.00, neto: 176500.00, empleados: 50 }  // RECIENTE
    ],
    "2025": [
        { id: 101, semana: 45, anio: 2025, fecha_inicio: "07/11/2025", fecha_fin: "13/11/2025", percepciones: 145000.00, deducciones: 17200.00, neto: 127800.00, empleados: 40 },
        { id: 102, semana: 46, anio: 2025, fecha_inicio: "14/11/2025", fecha_fin: "20/11/2025", percepciones: 152300.00, deducciones: 18500.00, neto: 133800.00, empleados: 41 },
        { id: 103, semana: 47, anio: 2025, fecha_inicio: "21/11/2025", fecha_fin: "27/11/2025", percepciones: 138900.00, deducciones: 16400.00, neto: 122500.00, empleados: 38 }, // MINIMO 2025
        { id: 104, semana: 48, anio: 2025, fecha_inicio: "28/11/2025", fecha_fin: "04/12/2025", percepciones: 160400.00, deducciones: 19100.00, neto: 141300.00, empleados: 43 },
        { id: 105, semana: 49, anio: 2025, fecha_inicio: "05/12/2025", fecha_fin: "11/12/2025", percepciones: 178200.00, deducciones: 22100.00, neto: 156100.00, empleados: 46 },
        { id: 106, semana: 50, anio: 2025, fecha_inicio: "12/12/2025", fecha_fin: "18/12/2025", percepciones: 198500.00, deducciones: 25400.00, neto: 173100.00, empleados: 49 },
        { id: 107, semana: 51, anio: 2025, fecha_inicio: "19/12/2025", fecha_fin: "25/12/2025", percepciones: 209000.00, deducciones: 26500.00, neto: 182500.00, empleados: 51 }, // MAXIMO 2025
        { id: 108, semana: 52, anio: 2025, fecha_inicio: "26/12/2025", fecha_fin: "01/01/2026", percepciones: 184000.00, deducciones: 23000.00, neto: 161000.00, empleados: 47 }
    ]
};

// Instancias de gráficos
let chartEvolucionInstance = null;
let chartComparativoInstance = null;
let chartDistribucionInstance = null;
let chartVariacionInstance = null;

// Formateador de moneda MXN
const formatoMoneda = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
});

// Formateador de porcentaje
const formatoPorcentaje = (num) => {
    const signo = num > 0 ? '+' : '';
    return `${signo}${num.toFixed(2)}%`;
};

/**
 * Inicialización al cargar la página
 */
$(document).ready(function () {
    inicializarVistaEstadisticas();
    configurarEventos();
});

/**
 * Inicializa los cálculos y componentes
 */
function inicializarVistaEstadisticas() {
    const anioSeleccionado = $('#select-anio').val() || "2026";
    const rangoSeleccionado = $('#select-rango').val() || "todas";
    procesarYRenderizar(anioSeleccionado, rangoSeleccionado);
}

/**
 * Configuración de eventos de filtros y controles
 */
function configurarEventos() {
    // Cambio de año
    $('#select-anio').on('change', function () {
        aplicarFiltros();
    });

    // Cambio de rango de semanas
    $('#select-rango').on('change', function () {
        aplicarFiltros();
    });

    // Buscador en la tabla
    $('#input-buscar-semana').on('keyup', function () {
        const busqueda = $(this).val().toLowerCase().trim();
        $('#tabla-cuerpo-nominas tr').each(function () {
            const textoFila = $(this).text().toLowerCase();
            $(this).toggle(textoFila.indexOf(busqueda) > -1);
        });
    });

    // Botón restablecer filtros
    $('#btn-reset-filtros').on('click', function () {
        $('#select-anio').val("2026");
        $('#select-rango').val("todas");
        $('#input-buscar-semana').val("");
        aplicarFiltros();
    });

    // Botón refrescar simulación con feedback
    $('#btn-refresh-stats').on('click', function () {
        const btn = $(this);
        btn.addClass('disabled').html('<span class="spinner-border spinner-border-sm me-1"></span> Actualizando...');
        setTimeout(() => {
            aplicarFiltros();
            btn.removeClass('disabled').html('<i class="bi bi-arrow-clockwise me-1"></i> Actualizar');
        }, 350);
    });

    // Botón imprimir / exportar reporte
    $('#btn-imprimir-reporte').on('click', function () {
        window.print();
    });
}

/**
 * Aplica los filtros seleccionados
 */
function aplicarFiltros() {
    const anio = $('#select-anio').val();
    const rango = $('#select-rango').val();
    procesarYRenderizar(anio, rango);
}

/**
 * Procesa los datos, calcula diferencias y renderiza todo
 */
function procesarYRenderizar(anio, rango) {
    let listaOriginal = DATA_NOMINAS[anio] ? [...DATA_NOMINAS[anio]] : [...DATA_NOMINAS["2026"]];

    // Aplicar filtro de rango
    let listaProcesada = [...listaOriginal];
    if (rango === "ultimas4") {
        listaProcesada = listaProcesada.slice(-4);
    } else if (rango === "ultimas8") {
        listaProcesada = listaProcesada.slice(-8);
    } else if (rango === "primeras6") {
        listaProcesada = listaProcesada.slice(0, 6);
    }

    if (listaProcesada.length === 0) return;

    // Calcular diferencias vs semana anterior para cada elemento
    const nominasConDiferencia = calcularDiferenciasSemana(listaProcesada);

    // Calcular métricas clave: Máxima, Mínima, Variación Última vs Penúltima, etc.
    const metricas = calcularMetricasClave(nominasConDiferencia);

    // Actualizar las tarjetas KPI
    actualizarTarjetasKPI(metricas);

    // Actualizar la tabla de datos
    actualizarTablaNominas(nominasConDiferencia, metricas);

    // Actualizar gráficas
    renderizarGraficas(nominasConDiferencia, metricas);
}

/**
 * Calcula la diferencia en monto y porcentaje respecto a la semana anterior
 */
function calcularDiferenciasSemana(lista) {
    return lista.map((item, index) => {
        let difMonto = 0;
        let difPorcentaje = 0;
        let tieneAnterior = false;
        let anteriorNeto = 0;

        if (index > 0) {
            tieneAnterior = true;
            anteriorNeto = lista[index - 1].neto;
            difMonto = item.neto - anteriorNeto;
            difPorcentaje = anteriorNeto > 0 ? (difMonto / anteriorNeto) * 100 : 0;
        }

        return {
            ...item,
            tieneAnterior,
            anteriorNeto,
            difMonto,
            difPorcentaje
        };
    });
}

/**
 * Extrae la nómina más alta, más baja, variación reciente y acumulados
 */
function calcularMetricasClave(lista) {
    let maxItem = lista[0];
    let minItem = lista[0];
    let sumaNeto = 0;
    let sumaPercepciones = 0;
    let sumaDeducciones = 0;

    lista.forEach(item => {
        if (item.neto > maxItem.neto) maxItem = item;
        if (item.neto < minItem.neto) minItem = item;
        sumaNeto += item.neto;
        sumaPercepciones += item.percepciones;
        sumaDeducciones += item.deducciones;
    });

    const cantidadSemanas = lista.length;
    const promedioNeto = sumaNeto / cantidadSemanas;
    const brechaMaxMin = maxItem.neto - minItem.neto;
    const porcentajeBrecha = minItem.neto > 0 ? (brechaMaxMin / minItem.neto) * 100 : 0;

    // Última semana y su diferencia respecto a la previa
    const ultimaNomina = lista[lista.length - 1];
    const penultimaNomina = lista.length > 1 ? lista[lista.length - 2] : null;

    let difUltimaMonto = 0;
    let difUltimaPorcentaje = 0;
    if (penultimaNomina) {
        difUltimaMonto = ultimaNomina.neto - penultimaNomina.neto;
        difUltimaPorcentaje = penultimaNomina.neto > 0 ? (difUltimaMonto / penultimaNomina.neto) * 100 : 0;
    }

    return {
        maxItem,
        minItem,
        ultimaNomina,
        penultimaNomina,
        difUltimaMonto,
        difUltimaPorcentaje,
        sumaNeto,
        sumaPercepciones,
        sumaDeducciones,
        promedioNeto,
        brechaMaxMin,
        porcentajeBrecha,
        cantidadSemanas
    };
}

/**
 * Actualiza los valores y estados visuales de las tarjetas KPI
 */
function actualizarTarjetasKPI(metricas) {
    const { maxItem, minItem, ultimaNomina, penultimaNomina, difUltimaMonto, difUltimaPorcentaje, promedioNeto, sumaNeto, brechaMaxMin } = metricas;

    // 1. Tarjeta Nómina Más Alta
    $('#kpi-max-semana').text(`Semana ${String(maxItem.semana).padStart(2, '0')} (${maxItem.anio})`);
    $('#kpi-max-monto').text(formatoMoneda.format(maxItem.neto));
    $('#kpi-max-percepciones').text(formatoMoneda.format(maxItem.percepciones));
    $('#kpi-max-deducciones').text(formatoMoneda.format(maxItem.deducciones));
    const difMaxPromedio = maxItem.neto - promedioNeto;
    const pctMaxPromedio = (difMaxPromedio / promedioNeto) * 100;
    $('#kpi-max-vs-promedio').html(`+${formatoMoneda.format(difMaxPromedio)} (${pctMaxPromedio.toFixed(1)}% vs promedio)`);

    // 2. Tarjeta Nómina Más Baja
    $('#kpi-min-semana').text(`Semana ${String(minItem.semana).padStart(2, '0')} (${minItem.anio})`);
    $('#kpi-min-monto').text(formatoMoneda.format(minItem.neto));
    $('#kpi-min-percepciones').text(formatoMoneda.format(minItem.percepciones));
    $('#kpi-min-deducciones').text(formatoMoneda.format(minItem.deducciones));
    const difMinPromedio = minItem.neto - promedioNeto;
    const pctMinPromedio = (difMinPromedio / promedioNeto) * 100;
    $('#kpi-min-vs-promedio').html(`${formatoMoneda.format(difMinPromedio)} (${pctMinPromedio.toFixed(1)}% vs promedio)`);

    // 3. Tarjeta Diferencia de la Antigua / Semana Anterior
    if (penultimaNomina) {
        const esPositivo = difUltimaMonto >= 0;
        const colorClase = esPositivo ? 'text-success' : 'text-danger';
        const iconoFlecha = esPositivo ? 'bi-arrow-up-right-circle-fill' : 'bi-arrow-down-right-circle-fill';
        const badgeClase = esPositivo ? 'badge-soft-success' : 'badge-soft-danger';
        const textoSentido = esPositivo ? 'Incremento' : 'Disminución';

        $('#kpi-dif-semanas-label').text(`Sem. ${ultimaNomina.semana} vs Sem. ${penultimaNomina.semana}`);
        $('#kpi-dif-monto').html(`
            <span class="${colorClase} d-inline-flex align-items-center gap-1">
                <i class="bi ${iconoFlecha}"></i>
                ${formatoMoneda.format(difUltimaMonto)}
            </span>
        `);
        $('#kpi-dif-porcentaje-badge')
            .removeClass('badge-soft-success badge-soft-danger')
            .addClass(badgeClase)
            .html(`${formatoPorcentaje(difUltimaPorcentaje)} (${textoSentido})`);
        
        $('#kpi-dif-detalle-texto').html(`
            Sem. ${ultimaNomina.semana}: <b>${formatoMoneda.format(ultimaNomina.neto)}</b> vs 
            Sem. ${penultimaNomina.semana}: <b>${formatoMoneda.format(penultimaNomina.neto)}</b>
        `);
    } else {
        $('#kpi-dif-semanas-label').text(`Semana ${ultimaNomina.semana}`);
        $('#kpi-dif-monto').html(`<span class="text-secondary">$0.00</span>`);
        $('#kpi-dif-porcentaje-badge').html(`Sin registro previo`);
        $('#kpi-dif-detalle-texto').text(`Primer registro del periodo`);
    }

    // 4. Tarjeta Promedio y Dispersión
    $('#kpi-promedio-monto').text(formatoMoneda.format(promedioNeto));
    $('#kpi-acumulado-monto').text(formatoMoneda.format(sumaNeto));
    $('#kpi-brecha-monto').text(formatoMoneda.format(brechaMaxMin));
}

/**
 * Llena la tabla responsiva con cada semana y su comparativo
 */
function actualizarTablaNominas(nominas, metricas) {
    const { maxItem, minItem } = metricas;
    const cuerpoTabla = $('#tabla-cuerpo-nominas');
    cuerpoTabla.empty();

    // Invertir temporalmente para mostrar las semanas más recientes primero
    const nominasOrdenadas = [...nominas].reverse();

    nominasOrdenadas.forEach(item => {
        const esMaxima = item.id === maxItem.id;
        const esMinima = item.id === minItem.id;

        // Clase de fila destacada
        let claseFila = "";
        if (esMaxima) claseFila = "table-row-highest";
        else if (esMinima) claseFila = "table-row-lowest";

        // Badge de estado / etiqueta
        let badgeEstado = `<span class="badge text-bg-light border text-secondary fw-normal">Regular</span>`;
        if (esMaxima) {
            badgeEstado = `<span class="badge badge-soft-success fw-bold"><i class="bi bi-trophy-fill me-1"></i>Más Alta</span>`;
        } else if (esMinima) {
            badgeEstado = `<span class="badge badge-soft-danger fw-bold"><i class="bi bi-arrow-down-circle-fill me-1"></i>Más Baja</span>`;
        }

        // Diferencia vs anterior
        let htmlDiferencia = `<span class="text-muted small">Semana base</span>`;
        let htmlDiferenciaMonto = `<span class="text-muted small">—</span>`;

        if (item.tieneAnterior) {
            const esAlza = item.difMonto >= 0;
            const color = esAlza ? 'text-success' : 'text-danger';
            const icon = esAlza ? 'bi-caret-up-fill' : 'bi-caret-down-fill';
            const badgeDif = esAlza ? 'badge-soft-success' : 'badge-soft-danger';

            htmlDiferenciaMonto = `<span class="fw-bold ${color}">${formatoMoneda.format(item.difMonto)}</span>`;
            htmlDiferencia = `
                <span class="badge ${badgeDif}">
                    <i class="bi ${icon} me-1"></i>${formatoPorcentaje(item.difPorcentaje)}
                </span>
            `;
        }

        // Porcentaje relativo al máximo
        const pctRelativoMax = maxItem.neto > 0 ? (item.neto / maxItem.neto) * 100 : 0;
        const barraColor = esMaxima ? 'bg-success' : (esMinima ? 'bg-danger' : 'bg-primary');

        const filaHtml = `
            <tr class="${claseFila}">
                <td class="align-middle">
                    <div class="d-flex align-items-center">
                        <div class="fw-bold text-dark me-2">Semana ${String(item.semana).padStart(2, '0')}</div>
                        <span class="badge text-bg-secondary-subtle text-secondary small">${item.anio}</span>
                    </div>
                    <small class="text-muted d-block">${item.fecha_inicio} al ${item.fecha_fin}</small>
                </td>
                <td class="align-middle text-end font-monospace text-secondary">
                    ${formatoMoneda.format(item.percepciones)}
                </td>
                <td class="align-middle text-end font-monospace text-warning-emphasis">
                    ${formatoMoneda.format(item.deducciones)}
                </td>
                <td class="align-middle text-end">
                    <span class="fw-bold fs-6 font-monospace text-dark">${formatoMoneda.format(item.neto)}</span>
                    <div class="table-progress-bar" title="${pctRelativoMax.toFixed(1)}% del pico más alto">
                        <div class="table-progress-fill ${barraColor}" style="width: ${pctRelativoMax}%;"></div>
                    </div>
                </td>
                <td class="align-middle text-end font-monospace">
                    ${htmlDiferenciaMonto}
                </td>
                <td class="align-middle text-center">
                    ${htmlDiferencia}
                </td>
                <td class="align-middle text-center">
                    ${badgeEstado}
                </td>
                <td class="align-middle text-center">
                    <button type="button" class="btn btn-outline-primary btn-sm px-2 py-1 shadow-sm" onclick="verDetalleSemanaModal(${item.id})">
                        <i class="bi bi-eye me-1"></i>Detalle
                    </button>
                </td>
            </tr>
        `;

        cuerpoTabla.append(filaHtml);
    });

    // Actualizar conteo de registros en footer de tabla
    $('#total-registros-tabla').text(`${nominas.length} semanas registradas`);
}

/**
 * Renderiza todas las gráficas con Chart.js
 */
function renderizarGraficas(nominas, metricas) {
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js no está cargado.");
        return;
    }

    const { maxItem, minItem, promedioNeto, sumaPercepciones, sumaDeducciones } = metricas;

    const labels = nominas.map(item => `Sem ${item.semana}`);
    const dataNeto = nominas.map(item => item.neto);
    const dataPercepciones = nominas.map(item => item.percepciones);
    const dataDeducciones = nominas.map(item => item.deducciones);
    const dataDiferencias = nominas.map(item => item.difMonto);

    // Colores de puntos destacados en la gráfica de evolución
    const pointBackgroundColors = nominas.map(item => {
        if (item.id === maxItem.id) return '#198754'; // Verde pico
        if (item.id === minItem.id) return '#dc3545'; // Rojo valle
        return '#0d6efd'; // Azul regular
    });

    const pointRadius = nominas.map(item => {
        if (item.id === maxItem.id || item.id === minItem.id) return 7;
        return 4;
    });

    // =========================================================================
    // 1. GRÁFICA DE EVOLUCIÓN DEL TOTAL NETO (LÍNEA CON GRADIENTE)
    // =========================================================================
    const ctxEvolucion = document.getElementById('chartEvolucionNeto');
    if (ctxEvolucion) {
        if (chartEvolucionInstance) chartEvolucionInstance.destroy();

        const ctx = ctxEvolucion.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(13, 110, 253, 0.35)');
        gradient.addColorStop(1, 'rgba(13, 110, 253, 0.00)');

        chartEvolucionInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Neto ($)',
                        data: dataNeto,
                        borderColor: '#0d6efd',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        pointBackgroundColor: pointBackgroundColors,
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: pointRadius,
                        pointHoverRadius: 8,
                        tension: 0.35,
                        fill: true
                    },
                    {
                        label: 'Promedio del Periodo',
                        data: nominas.map(() => promedioNeto),
                        borderColor: '#6c757d',
                        borderWidth: 1.5,
                        borderDash: [6, 6],
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 14,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(33, 37, 41, 0.95)',
                        padding: 12,
                        callbacks: {
                            label: function (context) {
                                return ` ${context.dataset.label}: ${formatoMoneda.format(context.raw)}`;
                            },
                            afterBody: function (tooltipItems) {
                                const index = tooltipItems[0].dataIndex;
                                const item = nominas[index];
                                let extra = [];
                                if (item.id === maxItem.id) {
                                    extra.push('⭐ ¡NÓMINA MÁS ALTA DEL PERIODO!');
                                } else if (item.id === minItem.id) {
                                    extra.push('⚠️ ¡NÓMINA MÁS BAJA DEL PERIODO!');
                                }
                                if (item.tieneAnterior) {
                                    const signo = item.difMonto >= 0 ? '+' : '';
                                    extra.push(`Dif. vs Sem. anterior: ${signo}${formatoMoneda.format(item.difMonto)} (${formatoPorcentaje(item.difPorcentaje)})`);
                                }
                                return extra;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function (val) {
                                return `$${(val / 1000).toFixed(0)}k`;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // =========================================================================
    // 2. GRÁFICA COMPARATIVA DE BARRAS (PERCEPCIONES VS DEDUCCIONES VS NETO)
    // =========================================================================
    const ctxComparativo = document.getElementById('chartComparativoBarras');
    if (ctxComparativo) {
        if (chartComparativoInstance) chartComparativoInstance.destroy();

        chartComparativoInstance = new Chart(ctxComparativo, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Percepciones Brutas',
                        data: dataPercepciones,
                        backgroundColor: 'rgba(25, 135, 84, 0.75)',
                        borderColor: '#198754',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Total Neto Pagado',
                        data: dataNeto,
                        backgroundColor: 'rgba(13, 110, 253, 0.85)',
                        borderColor: '#0d6efd',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Deducciones',
                        data: dataDeducciones,
                        backgroundColor: 'rgba(255, 193, 7, 0.8)',
                        borderColor: '#ffc107',
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                return ` ${ctx.dataset.label}: ${formatoMoneda.format(ctx.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            callback: (v) => `$${(v / 1000).toFixed(0)}k`
                        }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // =========================================================================
    // 3. GRÁFICA DOUGHNUT DE DISTRIBUCIÓN GLOBAL
    // =========================================================================
    const ctxDistribucion = document.getElementById('chartDistribucion');
    if (ctxDistribucion) {
        if (chartDistribucionInstance) chartDistribucionInstance.destroy();

        chartDistribucionInstance = new Chart(ctxDistribucion, {
            type: 'doughnut',
            data: {
                labels: ['Neto Pagado a Trabajadores', 'Retenciones y Deducciones'],
                datasets: [{
                    data: [metricas.sumaNeto, metricas.sumaDeducciones],
                    backgroundColor: ['#0d6efd', '#ffc107'],
                    hoverBackgroundColor: ['#0b5ed7', '#ffca2c'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 14,
                            padding: 14
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                const total = metricas.sumaPercepciones;
                                const pct = ((ctx.raw / total) * 100).toFixed(1);
                                return ` ${ctx.label}: ${formatoMoneda.format(ctx.raw)} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // =========================================================================
    // 4. GRÁFICA DE VARIACIÓN SEMANA A SEMANA ($ DIFERENCIA VS ANTERIOR)
    // =========================================================================
    const ctxVariacion = document.getElementById('chartVariacionSemanal');
    if (ctxVariacion) {
        if (chartVariacionInstance) chartVariacionInstance.destroy();

        // Colores verde para incremento, rojo para reducción
        const coloresBarras = dataDiferencias.map(val => val >= 0 ? 'rgba(25, 135, 84, 0.8)' : 'rgba(220, 53, 69, 0.8)');
        const bordesBarras = dataDiferencias.map(val => val >= 0 ? '#198754' : '#dc3545');

        chartVariacionInstance = new Chart(ctxVariacion, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Diferencia vs Semana Anterior ($)',
                    data: dataDiferencias,
                    backgroundColor: coloresBarras,
                    borderColor: bordesBarras,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                const signo = ctx.raw >= 0 ? '+' : '';
                                return ` Variación: ${signo}${formatoMoneda.format(ctx.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            callback: (v) => `$${(v / 1000).toFixed(0)}k`
                        }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

/**
 * Muestra el modal con el detalle específico de una semana
 */
function verDetalleSemanaModal(idNomina) {
    const anio = $('#select-anio').val() || "2026";
    const lista = DATA_NOMINAS[anio] || DATA_NOMINAS["2026"];
    const item = lista.find(n => n.id === idNomina);

    if (!item) return;

    $('#modal-detalle-titulo').html(`
        <i class="bi bi-calendar3 me-2 text-primary"></i>
        Detalle de Nómina: Semana ${String(item.semana).padStart(2, '0')} (${item.anio})
    `);

    $('#modal-fechas').text(`${item.fecha_inicio} al ${item.fecha_fin}`);
    $('#modal-empleados').text(`${item.empleados} trabajadores`);
    $('#modal-percepciones').text(formatoMoneda.format(item.percepciones));
    $('#modal-deducciones').text(formatoMoneda.format(item.deducciones));
    $('#modal-neto').text(formatoMoneda.format(item.neto));

    // Desglose simulado representativo para 40 Lbs
    const sueldoBase = item.percepciones * 0.72;
    const destajo40lbs = item.percepciones * 0.18;
    const bonosHorasExtra = item.percepciones * 0.10;

    const imss = item.deducciones * 0.45;
    const prestamos = item.deducciones * 0.35;
    const faltasRetenciones = item.deducciones * 0.20;

    $('#modal-desglose-percepciones').html(`
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="bi bi-person-badge me-2 text-muted"></i>Sueldos ordinarios</span>
            <span class="fw-semibold font-monospace">${formatoMoneda.format(sueldoBase)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="bi bi-box-seam me-2 text-muted"></i>Rendimiento / Destajo 40 Lbs</span>
            <span class="fw-semibold font-monospace">${formatoMoneda.format(destajo40lbs)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="bi bi-clock-history me-2 text-muted"></i>Horas extra y bonificaciones</span>
            <span class="fw-semibold font-monospace">${formatoMoneda.format(bonosHorasExtra)}</span>
        </li>
    `);

    $('#modal-desglose-deducciones').html(`
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="bi bi-shield-check me-2 text-muted"></i>Seguro Social (IMSS)</span>
            <span class="fw-semibold font-monospace text-warning-emphasis">${formatoMoneda.format(imss)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="bi bi-cash-coin me-2 text-muted"></i>Abonos de préstamos</span>
            <span class="fw-semibold font-monospace text-warning-emphasis">${formatoMoneda.format(prestamos)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="bi bi-dash-circle me-2 text-muted"></i>Otras retenciones</span>
            <span class="fw-semibold font-monospace text-warning-emphasis">${formatoMoneda.format(faltasRetenciones)}</span>
        </li>
    `);

    const modalElement = document.getElementById('modalDetalleSemana');
    if (modalElement && typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}
