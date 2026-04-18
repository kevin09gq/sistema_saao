let filtrosData = {};
let tabActual = 'poda';
let lastResponseData = null;

function configurarDropdownAccionesSoloUnoAbierto() {
    document.addEventListener('show.bs.dropdown', (event) => {
        const dropdownActual = event.target;
        const togglesAbiertos = document.querySelectorAll('.tb-action-dropdown [data-bs-toggle="dropdown"][aria-expanded="true"]');

        togglesAbiertos.forEach((toggle) => {
            if (dropdownActual.contains(toggle)) return;
            if (typeof bootstrap === 'undefined' || !bootstrap.Dropdown) return;
            bootstrap.Dropdown.getOrCreateInstance(toggle).hide();
        });
    });
}

// Función para formatear fecha de YYYY-MM-DD a YYYY-MMM-DD
function formatearFecha(fecha) {
    if (!fecha) return fecha;
    
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const partes = fecha.split('-');
    
    if (partes.length === 3) {
        const año = partes[0];
        const mes = parseInt(partes[1]);
        const dia = partes[2];
        
        if (mes >= 1 && mes <= 12) {
            return `${año}-${meses[mes - 1]}-${dia}`;
        }
    }
    
    return fecha; // Devolver original si no puede formatear
}

document.addEventListener('DOMContentLoaded', () => {
    configurarDropdownAccionesSoloUnoAbierto();
    cargarFiltrosIniciales();

    document.getElementById('filtro_anio').addEventListener('change', actualizarMeses);
    document.getElementById('filtro_mes').addEventListener('change', actualizarSemanas);

    document.getElementById('btn_buscar').addEventListener('click', buscarHistorial);
});

function cargarFiltrosIniciales() {
    const formData = new FormData();
    formData.append('action', 'get_filtros_iniciales');

    fetch('../php/historial/get_historial_podas.php', {
        method: 'POST',
        body: formData
    })
        .then(r => r.json())
        .then(res => {
            if (res.status === 'success') {
                filtrosData = res.data;
                const selectAnio = document.getElementById('filtro_anio');
                selectAnio.innerHTML = '';

                const anios = Object.keys(filtrosData).sort((a, b) => b - a);

                if (anios.length === 0) {
                    selectAnio.innerHTML = '<option value="">Sin datos</option>';
                    return;
                }

                anios.forEach(anio => {
                    selectAnio.innerHTML += `<option value="${anio}">${anio}</option>`;
                });

                selectAnio.innerHTML = '<option value="">Seleccione un año...</option>' + selectAnio.innerHTML;
                selectAnio.value = "";
                actualizarMeses();
            }
        })
        .catch(err => console.error("Error cargando filtros", err));
}

const NOMBRES_MESES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function actualizarMeses() {
    const anio = document.getElementById('filtro_anio').value;
    const selectMes = document.getElementById('filtro_mes');

    selectMes.innerHTML = '<option value="">Todos los meses</option>';
    document.getElementById('filtro_semana').innerHTML = '<option value="">Todas las semanas</option>';

    if (anio && filtrosData[anio]) {
        const meses = Object.keys(filtrosData[anio]).sort((a, b) => a - b);
        meses.forEach(mesStr => {
            const mesNum = parseInt(mesStr);
            selectMes.innerHTML += `<option value="${mesNum}">${NOMBRES_MESES[mesNum]}</option>`;
        });
    }
}

function actualizarSemanas() {
    const anio = document.getElementById('filtro_anio').value;
    const mes = document.getElementById('filtro_mes').value;
    const selectSemana = document.getElementById('filtro_semana');

    selectSemana.innerHTML = '<option value="">Todas las semanas</option>';

    if (anio && mes && filtrosData[anio] && filtrosData[anio][mes]) {
        const semanas = filtrosData[anio][mes].sort((a, b) => a - b);
        semanas.forEach(sem => {
            selectSemana.innerHTML += `<option value="${sem}">Semana ${sem}</option>`;
        });
    }
}

function buscarHistorial() {
    const anio = document.getElementById('filtro_anio').value;
    const mes = document.getElementById('filtro_mes').value;
    const semana = document.getElementById('filtro_semana').value;

    if (!anio) {
        Swal.fire('Atención', 'Seleccione una Nómina (Año) válida.', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('action', 'buscar');
    formData.append('anio', anio);
    formData.append('mes', mes);
    formData.append('semana', semana);

    document.getElementById('btn_buscar').innerHTML = '<i class="bi bi-hourglass-split"></i> Buscando...';
    document.getElementById('btn_buscar').disabled = true;

    fetch('../php/historial/get_historial_podas.php', {
        method: 'POST',
        body: formData
    })
        .then(r => r.json())
        .then(res => {
            document.getElementById('btn_buscar').innerHTML = '<i class="bi bi-search"></i> Buscar Historial';
            document.getElementById('btn_buscar').disabled = false;

            if (res.status === 'success') {
                lastResponseData = res.data;
                pintarDashboard(res.data);
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        })
        .catch(err => {
            document.getElementById('btn_buscar').innerHTML = '<i class="bi bi-search"></i> Buscar Historial';
            document.getElementById('btn_buscar').disabled = false;
            console.error("Error al buscar", err);
        });
}

function cambiarTab(tab) {
    tabActual = tab;

    // Actualizar UI de botones
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
    if (tab === 'general') document.getElementById('tab-general').classList.add('active');
    if (tab === 'poda') document.getElementById('tab-poda-solo').classList.add('active');
    if (tab === 'extras') document.getElementById('tab-extras').classList.add('active');

    // Ocultar ranking si estamos en extras
    const btnRanking = document.getElementById('btn_ver_ranking');
    if (btnRanking) {
        btnRanking.style.display = (tab === 'extras') ? 'none' : 'block';
    }

    if (lastResponseData) pintarDashboard(lastResponseData);
}

function pintarDashboard(data) {
    document.getElementById('panel_resultados').style.display = 'flex';
    document.getElementById('panel_desglose_completo').style.display = 'flex';

    const thead = document.getElementById('thead_historial');
    const tbody = document.getElementById('tbody_historial');
    const titulo = document.getElementById('titulo_seccion_tabla');

    tbody.innerHTML = '';

    // Inicializar totales para la TAB activa
    let tabTotalArboles = 0;
    let tabTotalDinero = 0;

    // Definir Columnas y Título según Tab
    if (tabActual === 'general') {
        titulo.innerHTML = '<i class="bi bi-grid-fill"></i> Historial Consolidado (Poda + Extras)';
        thead.innerHTML = `
            <tr>
                <th>Sem/Año</th>
                <th>Empleado</th>
                <th>Fecha</th>
                <th>Árboles</th>
                <th>Pago por árbol</th>
                <th>Total</th>
                <th>Opciones</th>
            </tr>
        `;
    } else if (tabActual === 'poda') {
        titulo.innerHTML = '<i class="bi bi-scissors"></i> Desglose Exclusivo de Podas';
        thead.innerHTML = `
            <tr>
                <th>Sem/Año</th>
                <th>Empleado</th>
                <th>Árboles</th>
                <th>Pago por árbol</th>
                <th>Total</th>
                <th>Opciones</th>
            </tr>
        `;
    } else {
        titulo.innerHTML = '<i class="bi bi-plus-circle-fill"></i> Reporte de Pagos Extras';
        thead.innerHTML = `
            <tr>
                <th>Sem/Año</th>
                <th>Empleado</th>
                <th>Concepto</th>
                <th>Pago por extra</th>
                <th>Total</th>
                <th>Opciones</th>
            </tr>
        `;
    }

    if (!data.podas || data.podas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">No hay datos en este periodo</td></tr>`;
        return;
    }

    window.rankingPodadoresActual = data.ranking_podadores || [];
    window.podasDataActual = data.podas;

    data.podas.forEach((p, index) => {
        const fechaFmt = p.fecha_creacion ? p.fecha_creacion.split(' ')[0] : '-';
        const tieneArboles = parseInt(p.total_arboles) > 0;
        const tieneExtras = parseFloat(p.total_extras) > 0;

        // Pago por árbol (valor guardado) para mostrar en la tabla resumen
        const pagoPorArbol = parseFloat(p.pago_por_arbol || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });

        // Totales reales (PODA = arboles*monto; EXTRAS = monto)
        const totalPodas = parseFloat(p.total_podas || 0);
        const totalExtras = parseFloat(p.total_extras || 0);

        if (tabActual === 'general') {
            tabTotalArboles += parseInt(p.total_arboles || 0);
            const totalReal = totalPodas + totalExtras;
            tabTotalDinero += totalReal;

            tbody.innerHTML += `
                <tr>
                    <td class="text-secondary fw-bold">Sem ${p.sem_poda} / ${p.anio_poda}</td>
                    <td class="fw-bold">${p.nombre_empleado}</td>
                    <td>${fechaFmt}</td>
                    <td class="fw-bold text-success fs-5">${p.total_arboles || 0}</td>
                    <td class="fw-bold text-primary">$${pagoPorArbol}</td>
                    <td class="fw-bold text-dark">$${totalReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td>${generarBotonOpciones(index)}</td>
                </tr>
            `;
        } else if (tabActual === 'poda') {
            if (!tieneArboles) return; // Ocultar si NO es poda (solo tiene extras)

            tabTotalArboles += parseInt(p.total_arboles || 0);
            const totalReal = totalPodas;
            tabTotalDinero += totalReal;

            tbody.innerHTML += `
                <tr>
                    <td class="text-secondary fw-bold">Sem ${p.sem_poda} / ${p.anio_poda}</td>
                    <td class="fw-bold">${p.nombre_empleado}</td>
                    <td class="fw-bold text-success fs-5">${p.total_arboles || 0}</td>
                    <td class="fw-bold text-primary">$${pagoPorArbol}</td>
                    <td class="fw-bold text-dark">$${totalReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td>${generarBotonOpciones(index)}</td>
                </tr>
            `;
        } else {
            if (!tieneExtras) return; // Ocultar si NO tiene extras

            tabTotalDinero += totalExtras;

            tbody.innerHTML += `
                <tr>
                    <td class="text-secondary fw-bold">Sem ${p.sem_poda} / ${p.anio_poda}</td>
                    <td class="fw-bold">${p.nombre_empleado}</td>
                    <td class="fw-bold">${p.concepto_extra || '-'}</td>
                    <td class="fw-bold text-primary">$${parseFloat(p.total_extras).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td class="fw-bold text-dark">$${parseFloat(p.total_extras).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td>${generarBotonOpciones(index)}</td>
                </tr>
            `;
        }
    });

    // Actualizar KPIs con los totales de la TAB
    document.getElementById('res_total_arboles').innerText = tabTotalArboles.toLocaleString();
    document.getElementById('res_total_dinero').innerText = `$${tabTotalDinero.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

    // Cambiar título del KPI de dinero según la tab activa
    const kpiDineroBox = document.getElementById('res_total_dinero').closest('.kpi-box');
    const kpiDineroTitle = kpiDineroBox.querySelector('.kpi-title');
    if (tabActual === 'poda') {
        kpiDineroTitle.innerText = 'Inversión Total en Podas';
    } else if (tabActual === 'extras') {
        kpiDineroTitle.innerText = 'Inversión en Extras';
    }

    // Mostrar/ocultar KPI de árboles según tab
    const kpiArbolesBox = document.getElementById('res_total_arboles').closest('.kpi-box');
    if (tabActual === 'extras') {
        kpiArbolesBox.style.opacity = '0.3';
        document.getElementById('res_total_arboles').innerText = '0';
    } else {
        kpiArbolesBox.style.opacity = '1';
    }

    if (tbody.innerHTML === '') {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">No hay registros para este filtro</td></tr>`;
    }
}

function generarBotonOpciones(index) {
    return `
        <div class="dropdown tb-action-dropdown">
            <button class="btn btn-sm btn-light border-0" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" onclick="event.stopPropagation();">
                <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu shadow pointer-events-auto">
                <li>
                    <button class="dropdown-item text-primary" onclick="abrirDetallesPoda(${index})">
                        <i class="bi bi-eye"></i> Ver detalles
                    </button>
                </li>
                <li>
                    <button class="dropdown-item text-danger" onclick="exportarPDFUnicaPoda(${index})">
                        <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
                    </button>
                </li>
            </ul>
        </div>
    `;
}

function abrirDetallesPoda(index, desdeRanking = false) {
    if (!window.podasDataActual || !window.podasDataActual[index]) return;
    const poda = window.podasDataActual[index];

    // Configurar botones de navegación y PDF
    const btnRegresar = document.getElementById('btn_regresar_ranking');
    if (btnRegresar) btnRegresar.style.display = desdeRanking ? 'block' : 'none';

    const btnPdf = document.getElementById('btn_pdf_detalle_modal');
    if (btnPdf) {
        btnPdf.onclick = () => exportarPDFUnicaPoda(index);
    }

    document.getElementById('det_empleado').innerText = poda.nombre_empleado;
    document.getElementById('det_nomina').innerText = `Semana ${poda.sem_poda} del ${poda.anio_poda}`;

    // Header dinámico del modal - Total es la suma de pago_por_arbol + extras
    let totalModal = 0;
    if (tabActual === 'poda') {
        totalModal = parseFloat(poda.total_podas || 0);
    } else if (tabActual === 'extras') {
        totalModal = parseFloat(poda.total_extras || 0);
    } else {
        totalModal = parseFloat(poda.total_podas || 0) + parseFloat(poda.total_extras || 0);
    }

    document.getElementById('det_total').innerText = `$${totalModal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

    const arbolesBox = document.getElementById('det_arboles').closest('.col-6');
    if (tabActual === 'extras') {
        if (arbolesBox) arbolesBox.style.display = 'none';
    } else {
        if (arbolesBox) {
            arbolesBox.style.display = 'block';
            document.getElementById('det_arboles').innerText = poda.total_arboles || 0;
        }
    }

    const tbody = document.getElementById('det_tbody_movimientos');
    const thead = document.querySelector('.table-custom-modal thead tr');
    
    // Actualizar encabezado según el tipo
    if (tabActual === 'extras') {
        thead.innerHTML = `
            <th>Fecha</th>
            <th>Concepto</th>
            <th>Total</th>
        `;
    } else {
        thead.innerHTML = `
            <th>Fecha</th>
            <th>Concepto</th>
            <th>Árboles</th>
            <th>Pago por árbol</th>
            <th>Total</th>
        `;
    }
    
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-3"><div class="spinner-border spinner-border-sm text-success"></div></td></tr>';

    const formData = new FormData();
    formData.append('action', 'get_movimientos');
    formData.append('id_poda', poda.id_poda);

    fetch('../php/historial/get_historial_podas.php', {
        method: 'POST',
        body: formData
    })
        .then(r => r.json())
        .then(res => {
            tbody.innerHTML = '';
            if (res.status === 'success' && res.data.length > 0) {
                res.data.forEach(m => {
                    // FILTRAR MOVIMIENTOS SEGÚN TAB
                    if (tabActual === 'poda' && m.es_extra == 1) return;
                    if (tabActual === 'extras' && m.es_extra == 0) return;

                    if (tabActual === 'extras') {
                        // Para extras: solo Fecha, Concepto y Total
                        const totalCalc = parseFloat(m.monto);
                        tbody.innerHTML += `
                            <tr>
                                <td>${m.fecha}</td>
                                <td>${m.concepto || '-'}</td>
                                <td class="text-primary fw-bold">$${totalCalc.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        `;
                    } else {
                        // Para poda: Fecha, Concepto, Árboles, Pago por árbol, Total
                        const pagoPorArbolVal = `$${parseFloat(m.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
                        const totalCalc = m.arboles_podados * parseFloat(m.monto);

                        tbody.innerHTML += `
                            <tr>
                                <td>${m.fecha}</td>
                                <td>${m.concepto || 'PODA'}</td>
                                <td class="fw-bold">${m.arboles_podados}</td>
                                <td class="text-success fw-bold">${pagoPorArbolVal}</td>
                                <td class="text-primary fw-bold">$${totalCalc.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        `;
                    }
                });
            } else {
                const colspan = tabActual === 'extras' ? 3 : 5;
                tbody.innerHTML = `<tr><td colspan="${colspan}" class="text-center text-muted">No hay movimientos registrados</td></tr>`;
            }
        });

    var miModal = new bootstrap.Modal(document.getElementById('modalDetallePoda'));
    miModal.show();
}


async function exportarPDF() {
    if (!window.podasDataActual || window.podasDataActual.length === 0) {
        Swal.fire('Atención', 'No hay datos para exportar.', 'info');
        return;
    }

    // Cargar movimientos para cada poda si no están presentes
    const podasConMovimientos = await Promise.all(window.podasDataActual.map(async (poda) => {
        if (!poda.movimientos) {
            try {
                const formData = new FormData();
                formData.append('action', 'get_movimientos');
                formData.append('id_poda', poda.id_poda);
                const res = await fetch('../php/historial/get_historial_podas.php', {
                    method: 'POST',
                    body: formData
                }).then(r => r.json());
                if (res.status === 'success') {
                    poda.movimientos = res.data;
                } else {
                    poda.movimientos = [];
                }
            } catch (e) {
                poda.movimientos = [];
            }
        }
        return poda;
    }));

    generarPDFPodas(podasConMovimientos);
}

function exportarPDFUnicaPoda(index) {
    if (!window.podasDataActual || !window.podasDataActual[index]) return;
    const poda = window.podasDataActual[index];
    
    // Forzamos la carga de movimientos si no están presentes
    if (!poda.movimientos) {
        const formData = new FormData();
        formData.append('action', 'get_movimientos');
        formData.append('id_poda', poda.id_poda);
        
        Swal.fire({
            title: 'Generando Reporte Profesional...',
            html: 'Cargando desglose de actividades diarias...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        fetch('../php/historial/get_historial_podas.php', {
            method: 'POST',
            body: formData
        })
        .then(r => r.json())
        .then(res => {
            Swal.close();
            if (res.status === 'success') {
                poda.movimientos = res.data;
                generarPDFPodaCorporativo(poda);
            } else {
                Swal.fire('Error', 'No se pudieron cargar los detalles para el reporte.', 'error');
            }
        })
        .catch(err => {
            Swal.close();
            console.error(err);
        });
    } else {
        generarPDFPodaCorporativo(poda);
    }
}

/**
 * DISEÑO DE LISTA PARA PDF DE PODA (Estilo Limpio, Sin Colores)
 */
function generarPDFPodaCorporativo(poda) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const PAGE_W = doc.internal.pageSize.getWidth();
    const MARGIN = 15;
    let y = 15;

    // 1. ENCABEZADO CENTRADO
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    
    // Título dinámico
    const tituloReporte = tabActual === 'extras' ? 'REPORTE DE PAGOS EXTRAS' : 
                         tabActual === 'poda' ? 'REPORTE DE PODAS' : 'REPORTE GENERAL DE PAGOS';
    doc.text(tituloReporte, PAGE_W / 2, y, { align: 'center' });
    
    y += 5;
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text('Rancho Relicario', PAGE_W / 2, y, { align: 'center' });
    
    y += 6;
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-MX')}`, PAGE_W / 2, y, { align: 'center' });
    
    y += 8;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 10;

    // 2. DETALLE DE PAGOS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Detalle de pagos por empleado:', MARGIN, y);
    y += 12;

    // Encabezado del empleado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(poda.nombre_empleado, MARGIN, y);
    y += 10;

    // Procesar movimientos
    if (poda.movimientos && poda.movimientos.length > 0) {
        // Separar PODAs y EXTRAs
        let movimientosOrdenados;
        if (tabActual === 'poda') {
            movimientosOrdenados = poda.movimientos.filter(m => m.es_extra === '0' || m.es_extra === 0);
        } else if (tabActual === 'extras') {
            movimientosOrdenados = poda.movimientos.filter(m => m.es_extra === '1' || m.es_extra === 1);
        } else {
            const podas = poda.movimientos.filter(m => m.es_extra === '0' || m.es_extra === 0);
            const extras = poda.movimientos.filter(m => m.es_extra === '1' || m.es_extra === 1);
            movimientosOrdenados = [...podas, ...extras];
        }

        let primerMovimiento = true;
        let montoTotal = 0;

        movimientosOrdenados.forEach(m => {
            if (y > doc.internal.pageSize.getHeight() - 55) {
                doc.addPage();
                y = 20;
            }

            // Línea separadora (excepto en el primer movimiento)
            if (!primerMovimiento) {
                doc.setDrawColor(180, 180, 180);
                doc.setLineWidth(0.3);
                doc.line(MARGIN, y, PAGE_W - MARGIN, y);
                y += 8;
            }
            primerMovimiento = false;

            // Nombre del empleado (repetido para cada movimiento)
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(poda.nombre_empleado, MARGIN, y);
            y += 7;

            const esPoda = m.es_extra === '0' || m.es_extra === 0;
            const fechaFormateada = formatearFecha(m.fecha);
            let totalLinea = 0;

            // Tipo y datos principales
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            if (esPoda) {
                totalLinea = m.arboles_podados * parseFloat(m.monto);
                doc.text(`Poda:`, MARGIN, y);
                doc.text(`Fecha: ${fechaFormateada}`, MARGIN + 50, y);
                doc.text(`Árboles: ${m.arboles_podados}`, PAGE_W / 2, y);
                y += 7;
                
                doc.text(`Precio por árbol: $${parseFloat(m.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, MARGIN + 50, y);
                doc.setFont('helvetica', 'bold');
                doc.text(`Total: $${totalLinea.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, PAGE_W - MARGIN, y, { align: 'right' });
            } else {
                totalLinea = parseFloat(m.monto);
                const concepto = m.concepto || 'N/A';
                doc.text(`Extra:`, MARGIN, y);
                doc.text(`Fecha: ${fechaFormateada}`, MARGIN + 50, y);
                doc.text(`Concepto: ${concepto}`, PAGE_W / 2, y);
                y += 7;
                
                doc.setFont('helvetica', 'bold');
                doc.text(`Total: $${totalLinea.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, PAGE_W - MARGIN, y, { align: 'right' });
            }
            
            montoTotal += totalLinea;
            y += 10;
        });
        
        // Subtotal del empleado
        y += 3;
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, y, PAGE_W - MARGIN, y);
        y += 6;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('Monto a cobrar:', MARGIN, y);
        doc.text(`$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, PAGE_W - MARGIN, y, { align: 'right' });
    } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text('Sin movimientos detallados', MARGIN + 10, y);
        y += 10;
    }

    doc.save(`Comprobante_${poda.nombre_empleado.replace(/\s/g, '_')}_S${poda.sem_poda}.pdf`);
}



function generarPDFPodas(datos, empleadoIndividual = null) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const PAGE_W = doc.internal.pageSize.getWidth();
    const PAGE_H = doc.internal.pageSize.getHeight();
    const MARGIN = 15;
    const CONTENT_W = PAGE_W - (MARGIN * 2);
    let y = 15;

    // 1. ENCABEZADO CENTRADO
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    
    // Título dinámico
    const tituloReporte = tabActual === 'extras' ? 'REPORTE DE PAGOS EXTRAS' : 
                         tabActual === 'poda' ? 'REPORTE DE PODAS' : 'REPORTE GENERAL DE PAGOS';
    doc.text(tituloReporte, PAGE_W / 2, y, { align: 'center' });
    
    y += 5;
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text('Rancho Relicario', PAGE_W / 2, y, { align: 'center' });
    
    y += 6;
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-MX')}`, PAGE_W / 2, y, { align: 'center' });
    
    y += 8;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 10;
    const listaFiltrada = datos.filter(p => {
        const tieneArboles = parseInt(p.total_arboles) > 0;
        const tieneExtras = parseFloat(p.total_extras) > 0;
        if (tabActual === 'poda' && !tieneArboles) return false;
        if (tabActual === 'extras' && !tieneExtras) return false;
        return true;
    });

    // Eliminado cálculo de estadísticas

    // 3. DETALLE DE PAGOS
    if (listaFiltrada.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('No hay registros para este periodo.', PAGE_W / 2, y, { align: 'center' });
    } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Detalle de pagos por empleado:', MARGIN, y);
        y += 12;

        let primerMovimiento = true;

        listaFiltrada.forEach((p) => {
            if (p.movimientos && p.movimientos.length > 0) {
                // Separar PODAs y EXTRAs
                let movimientosOrdenados;
                if (tabActual === 'poda') {
                    movimientosOrdenados = p.movimientos.filter(m => m.es_extra === '0' || m.es_extra === 0);
                } else if (tabActual === 'extras') {
                    movimientosOrdenados = p.movimientos.filter(m => m.es_extra === '1' || m.es_extra === 1);
                } else {
                    const podas = p.movimientos.filter(m => m.es_extra === '0' || m.es_extra === 0);
                    const extras = p.movimientos.filter(m => m.es_extra === '1' || m.es_extra === 1);
                    movimientosOrdenados = [...podas, ...extras];
                }

                movimientosOrdenados.forEach(m => {
                    if (y > PAGE_H - 55) {
                        doc.addPage();
                        y = 20;
                    }

                    // Línea separadora (excepto en el primer movimiento)
                    if (!primerMovimiento) {
                        doc.setDrawColor(180, 180, 180);
                        doc.setLineWidth(0.3);
                        doc.line(MARGIN, y, PAGE_W - MARGIN, y);
                        y += 8;
                    }
                    primerMovimiento = false;

                    // Nombre del empleado
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(11);
                    doc.setTextColor(0, 0, 0);
                    doc.text(p.nombre_empleado, MARGIN, y);
                    y += 7;

                    const esPoda = m.es_extra === '0' || m.es_extra === 0;
                    const fechaFormateada = formatearFecha(m.fecha);
                    let totalLinea = 0;

                    // Tipo y datos principales
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0);
                    
                    if (esPoda) {
                        totalLinea = m.arboles_podados * parseFloat(m.monto);
                        doc.text(`Poda:`, MARGIN, y);
                        doc.text(`Fecha: ${fechaFormateada}`, MARGIN + 50, y);
                        doc.text(`Árboles: ${m.arboles_podados}`, PAGE_W / 2, y);
                        y += 7;
                        
                        doc.text(`Precio por árbol: $${parseFloat(m.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, MARGIN + 50, y);
                        doc.setFont('helvetica', 'bold');
                        doc.text(`Total: $${totalLinea.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, PAGE_W - MARGIN, y, { align: 'right' });
                    } else {
                        totalLinea = parseFloat(m.monto);
                        const concepto = m.concepto || 'N/A';
                        doc.text(`Extra:`, MARGIN, y);
                        doc.text(`Fecha: ${fechaFormateada}`, MARGIN + 50, y);
                        doc.text(`Concepto: ${concepto}`, PAGE_W / 2, y);
                        y += 7;
                        
                        doc.setFont('helvetica', 'bold');
                        doc.text(`Total: $${totalLinea.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, PAGE_W - MARGIN, y, { align: 'right' });
                    }
                    y += 10;
                });
            }
        });
    }


    const fileName = empleadoIndividual ? 
        `Historial_${empleadoIndividual.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf` : 
        `Reporte_General_${tabActual}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}


// ─── LÓGICA DE RANKING ──────────────────────────────────────────────────────

let sortRankingDirection = 'desc';

function abrirModalRanking() {
    if (!window.rankingPodadoresActual || window.rankingPodadoresActual.length === 0) {
        Swal.fire('Atención', 'No hay datos de podadores para mostrar en este periodo.', 'info');
        return;
    }

    ordenarRanking('desc'); // Por defecto los mejores primero
    var miModal = new bootstrap.Modal(document.getElementById('modalRankingPodadores'));
    miModal.show();
}

function ordenarRanking(dir) {
    sortRankingDirection = dir;

    if (dir === 'desc') {
        document.getElementById('btnSortDesc').className = 'btn btn-sm btn-success fw-bold px-3 active';
        document.getElementById('btnSortAsc').className = 'btn btn-sm btn-outline-success fw-bold px-3';
    } else {
        document.getElementById('btnSortAsc').className = 'btn btn-sm btn-success fw-bold px-3 active';
        document.getElementById('btnSortDesc').className = 'btn btn-sm btn-outline-success fw-bold px-3';
    }

    renderizarTablaRanking();
}

function renderizarTablaRanking() {
    const tbodyModalRanking = document.getElementById('tbody_modal_ranking');
    tbodyModalRanking.innerHTML = '';

    if (!window.rankingPodadoresActual) return;

    let lista = [...window.rankingPodadoresActual].filter(r => parseInt(r.total_arboles) > 0);
    if (sortRankingDirection === 'asc') {
        lista.sort((a, b) => a.total_arboles - b.total_arboles);
    } else {
        lista.sort((a, b) => b.total_arboles - a.total_arboles);
    }

    lista.forEach((r, idx) => {
        let posicion = '';
        if (sortRankingDirection === 'desc') {
            if (idx === 0) posicion = '<span class="fs-3">🥇</span>';
            else if (idx === 1) posicion = '<span class="fs-4">🥈</span>';
            else if (idx === 2) posicion = '<span class="fs-4">🥉</span>';
            else posicion = `<span class="badge bg-secondary text-white fw-bold">#${idx + 1}</span>`;
        } else {
            posicion = `<span class="badge bg-danger text-white fw-bold">Posición ${idx + 1}</span>`;
        }

        // Buscar index original en podasDataActual para el botón de detalles
        const originalIndex = window.podasDataActual.findIndex(p => p.id_poda == r.id_poda);

        tbodyModalRanking.innerHTML += `
            <tr>
                <td class="text-center align-middle">${posicion}</td>
                <td class="fw-bold text-secondary align-middle fs-6">${r.nombre_empleado}</td>
                <td class="fw-bold text-success align-middle fs-5">${r.total_arboles} árboles</td>
                <td class="align-middle">
                    <button class="btn btn-sm btn-outline-success fw-bold rounded-pill px-3 shadow-sm border-2" onclick="abrirDetallesDesdeRanking(${originalIndex})">
                        <i class="bi bi-list-check"></i> Ver detalles
                    </button>
                </td>
            </tr>
        `;
    });
}

function abrirDetallesDesdeRanking(index) {
    if (index === -1) return;
    // Cerrar el modal de ranking primero
    var modalRanking = bootstrap.Modal.getInstance(document.getElementById('modalRankingPodadores'));
    modalRanking.hide();

    // Abrir detalles después de un pequeño delay
    setTimeout(() => {
        abrirDetallesPoda(index, true); // true indica que viene del ranking
    }, 300);
}

function regresarAlRanking() {
    // Cerrar el modal de detalles
    var modalDetalle = bootstrap.Modal.getInstance(document.getElementById('modalDetallePoda'));
    modalDetalle.hide();

    // Abrir ranking después de un pequeño delay
    setTimeout(() => {
        var miModal = new bootstrap.Modal(document.getElementById('modalRankingPodadores'));
        miModal.show();
    }, 300);
}

