let filtrosData = {};
let current_num_tabla_desglose = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarFiltrosIniciales();

    document.getElementById('filtro_anio').addEventListener('change', actualizarMeses);
    document.getElementById('filtro_mes').addEventListener('change', actualizarSemanas);

    document.getElementById('btn_buscar').addEventListener('click', buscarHistorial);
});

function cargarFiltrosIniciales() {
    const formData = new FormData();
    formData.append('action', 'get_filtros_iniciales');

    fetch('../php/historial/get_historial_palmilla.php', {
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

    fetch('../php/historial/get_historial_palmilla.php', {
        method: 'POST',
        body: formData
    })
        .then(r => r.json())
        .then(res => {
            document.getElementById('btn_buscar').innerHTML = '<i class="bi bi-search"></i> Buscar Historial';
            document.getElementById('btn_buscar').disabled = false;

            if (res.status === 'success') {
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

function pintarDashboard(data) {
    document.getElementById('panel_resultados').style.display = 'flex';
    document.getElementById('panel_desglose_completo').style.display = 'flex';

    document.getElementById('res_total_rejas').innerText = data.total_rejas.toLocaleString();
    document.getElementById('res_total_dinero').innerText = `$${parseFloat(data.total_dinero).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    document.getElementById('res_mejor_tabla').innerText = data.mejor_tabla;

    // Cambiar los títulos de los KPIs
    const kpiTitles = document.querySelectorAll('.kpi-title');
    if (kpiTitles.length >= 3) {
        kpiTitles[1].textContent = 'Gastos de cortes';
        kpiTitles[2].textContent = 'Sección con más rejas';
    }

    window.rankingTablasActual = data.ranking_tablas || [];

    const tbody = document.getElementById('tbody_historial');
    tbody.innerHTML = '';

    if (data.cortes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay cortes registrados en este periodo</td></tr>';
        return;
    }

    window.cortesDataActual = data.cortes;

    data.cortes.forEach((c, index) => {
        let tablasHTML = '';
        if (c.tablas_detalle) {
            const arr = c.tablas_detalle.split('|');
            arr.forEach(t => {
                tablasHTML += `<span class="badge-tabla">${t}</span>`;
            });
        }

        tbody.innerHTML += `
            <tr>
                <td class="text-secondary fw-bold">Sem ${c.sem_corte} / ${c.anio_corte}</td>
                <td class="fw-bold">${c.folio}</td>
                <td>${c.fecha_corte}</td>
                <td>${c.nombre_cortador}</td>
                <td>${tablasHTML}</td>
                <td class="fw-bold text-primary fs-5">${c.total_rejas || 0}</td>
                <td>
                    <div class="dropdown tb-action-dropdown">
                        <button class="btn btn-sm btn-light border-0" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" onclick="event.stopPropagation();">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu shadow pointer-events-auto">
                            <li>
                                <button class="dropdown-item text-primary" onclick="abrirDetallesCorte(${index})">
                                    <i class="bi bi-eye"></i> Ver detalles
                                </button>
                            </li>
                            <li>
                                <button class="dropdown-item text-danger" onclick="exportarPDFUnFolio(${index})">
                                    <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
                                </button>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    });
}

function abrirDetallesCorte(index) {
    if (!window.cortesDataActual || !window.cortesDataActual[index]) return;
    const corte = window.cortesDataActual[index];

    document.getElementById('det_folio').innerText = corte.folio;
    document.getElementById('det_fecha').innerText = corte.fecha_corte;
    document.getElementById('det_cortador').innerText = corte.nombre_cortador;
    document.getElementById('det_nomina').innerText = `Semana ${corte.sem_corte} del ${corte.anio_corte}`;

    const precio = parseFloat(corte.precio_reja || 0);
    document.getElementById('det_precio').innerText = `$${precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

    document.getElementById('det_rejas').innerText = corte.total_rejas || 0;

    const ganancia = parseFloat(corte.dinero_generado || 0);
    document.getElementById('det_ganancia').innerText = `$${ganancia.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

    const tbodyTablas = document.getElementById('det_tbody_tablas');
    tbodyTablas.innerHTML = '';

    if (corte.tablas_detalle) {
        const arr = corte.tablas_detalle.split('|');
        arr.forEach(t => {
            const parts = t.split(':');
            if (parts.length === 2) {
                const nombre = parts[0].replace('T', 'Tabla ');
                tbodyTablas.innerHTML += `
                    <tr>
                        <td class="fw-bold text-secondary"><i class="bi bi-box me-2"></i>${nombre}</td>
                        <td class="fw-bold text-dark fs-6">${parts[1]}</td>
                    </tr>
                `;
            }
        });
    } else {
        tbodyTablas.innerHTML = '<tr><td colspan="2" class="text-muted py-3">Sin desglose disponible</td></tr>';
    }

    var miModal = new bootstrap.Modal(document.getElementById('modalDetalleCorte'));
    miModal.show();
}

function abrirModalRanking() {
    if (!window.rankingTablasActual || window.rankingTablasActual.length === 0) {
        Swal.fire('Atención', 'No hay datos de tablas para mostrar en este periodo.', 'info');
        return;
    }

    volverARanking();
    ordenarRanking('desc');

    var miModal = new bootstrap.Modal(document.getElementById('modalRankingTablas'));
    miModal.show();
}

let sortRankingDirection = 'desc';

function ordenarRanking(dir) {
    sortRankingDirection = dir;

    if (dir === 'desc') {
        document.getElementById('btnSortDesc').className = 'btn btn-sm btn-primary fw-bold px-3 active';
        document.getElementById('btnSortAsc').className = 'btn btn-sm btn-outline-primary fw-bold px-3';
    } else {
        document.getElementById('btnSortAsc').className = 'btn btn-sm btn-primary fw-bold px-3 active';
        document.getElementById('btnSortDesc').className = 'btn btn-sm btn-outline-primary fw-bold px-3';
    }

    renderizarTablaRanking();
}

function renderizarTablaRanking() {
    const tbodyModalRanking = document.getElementById('tbody_modal_ranking');
    tbodyModalRanking.innerHTML = '';

    if (!window.rankingTablasActual) return;

    let lista = [...window.rankingTablasActual];
    if (sortRankingDirection === 'asc') {
        lista.sort((a, b) => a.total - b.total);
    } else {
        lista.sort((a, b) => b.total - a.total);
    }

    lista.forEach((r, idx) => {
        let medalla = '';
        if (sortRankingDirection === 'desc') {
            if (idx === 0) medalla = '<span class="fs-4">🥇</span>';
            else if (idx === 1) medalla = '<span class="fs-5">🥈</span>';
            else if (idx === 2) medalla = '<span class="fs-5">🥉</span>';
            else medalla = `<span class="badge bg-secondary text-white fw-bold">#${idx + 1}</span>`;
        } else {
            medalla = `<span class="badge bg-danger text-white fw-bold">#${idx + 1}</span>`;
        }

        tbodyModalRanking.innerHTML += `
            <tr>
                <td class="text-center align-middle">${medalla}</td>
                <td class="fw-bold text-secondary align-middle fs-6"><i class="bi bi-box me-2"></i> Tabla ${r.num_tabla}</td>
                <td class="fw-bold text-primary align-middle fs-5">${r.total}</td>
                <td class="align-middle">
                    <button class="btn btn-sm btn-outline-primary fw-bold rounded-pill px-3 shadow-sm border-2" onclick="verDetallesRanking(${r.num_tabla})">
                        <i class="bi bi-list-check"></i> Desglose
                    </button>
                </td>
            </tr>
        `;
    });
}

function verDetallesRanking(num_tabla) {
    current_num_tabla_desglose = num_tabla;
    document.getElementById('vista_ranking_principal').style.display = 'none';
    document.getElementById('vista_ranking_detalles').style.display = 'block';

    document.getElementById('titulo_detalles_tabla').innerText = `Desglose de Folios (Tabla ${num_tabla})`;

    const tbodyEspecif = document.getElementById('tbody_detalles_especificos');
    tbodyEspecif.innerHTML = '';

    let encontados = 0;
    const searchToken = `T${num_tabla}:`;

    if (window.cortesDataActual) {
        window.cortesDataActual.forEach((c, index) => {
            if (c.tablas_detalle && c.tablas_detalle.includes(searchToken)) {
                const arr = c.tablas_detalle.split('|');
                let rejasEsaTabla = 0;
                arr.forEach(t => {
                    const parts = t.split(':');
                    if (parts[0] === `T${num_tabla}`) {
                        rejasEsaTabla = parts[1];
                    }
                });

                tbodyEspecif.innerHTML += `
                    <tr>
                        <td class="text-muted align-middle"><small>${c.fecha_corte}</small></td>
                        <td class="fw-bold align-middle">${c.folio}</td>
                        <td class="align-middle"><small>${c.nombre_cortador}</small></td>
                        <td class="fw-bold text-primary align-middle">${rejasEsaTabla}</td>
                        <td class="align-middle">
                            <div class="dropdown tb-action-dropdown">
                                <button class="btn btn-sm btn-light border-0" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" onclick="event.stopPropagation();">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu shadow pointer-events-auto">
                                    <li>
                                        <button class="dropdown-item text-primary" onclick="abrirDetallesCorte(${index})">
                                            <i class="bi bi-eye"></i> Ver detalles
                                        </button>
                                    </li>
                                    <li>
                                        <button class="dropdown-item text-danger" onclick="exportarPDFUnFolio(${index})">
                                            <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                `;
                encontados++;
            }
        });
    }

    if (encontados === 0) {
        tbodyEspecif.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No se encontraron detalles</td></tr>';
    }
}

function volverARanking() {
    document.getElementById('vista_ranking_detalles').style.display = 'none';
    document.getElementById('vista_ranking_principal').style.display = 'block';
}

function exportarDesgloseTablaPDF() {
    if (!current_num_tabla_desglose || !window.cortesDataActual) return;

    const searchToken = `T${current_num_tabla_desglose}:`;
    const foliosAsociados = window.cortesDataActual.filter(c => c.tablas_detalle && c.tablas_detalle.includes(searchToken));

    if (foliosAsociados.length === 0) {
        Swal.fire('Atención', 'No hay datos para exportar en esta tabla.', 'info');
        return;
    }

    const logoUrl = '../../public/img/palmilla.jpeg';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const logoBase64 = canvas.toDataURL('image/jpeg');
        generarPDFConLogo(logoBase64, foliosAsociados, `Desglose_Tabla_${current_num_tabla_desglose}`);
    };
    img.onerror = () => {
        generarPDFConLogo(null, foliosAsociados, `Desglose_Tabla_${current_num_tabla_desglose}`);
    };
    img.src = logoUrl;
}

function exportarPDFUnFolio(index) {
    if (!window.cortesDataActual || !window.cortesDataActual[index]) return;
    const corteSeleccionado = window.cortesDataActual[index];

    const logoUrl = '../../public/img/palmilla.jpeg';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const logoBase64 = canvas.toDataURL('image/jpeg');
        generarPDFConLogo(logoBase64, [corteSeleccionado], corteSeleccionado.folio);
    };
    img.onerror = () => {
        generarPDFConLogo(null, [corteSeleccionado], corteSeleccionado.folio);
    };
    img.src = logoUrl;
}

function exportarPDF() {
    if (!window.cortesDataActual || window.cortesDataActual.length === 0) {
        Swal.fire('Atención', 'No hay datos para exportar. Realiza una búsqueda primero.', 'info');
        return;
    }

    const logoUrl = '../../public/img/palmilla.jpeg';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const logoBase64 = canvas.toDataURL('image/jpeg');
        generarPDFConLogo(logoBase64, window.cortesDataActual);
    };
    img.onerror = () => {
        generarPDFConLogo(null, window.cortesDataActual);
    };
    img.src = logoUrl;
}

function generarPDFConLogo(logoBase64, datosExportar, folioUnico = null) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const PAGE_W = doc.internal.pageSize.getWidth();
    const PAGE_H = doc.internal.pageSize.getHeight();
    const MARGIN = 14;
    const CONTENT_W = PAGE_W - MARGIN * 2;

    const COL_DARK = [27, 94, 32];
    const COL_ACCENT = [76, 175, 80];
    const COL_GREEN = [46, 125, 50];
    const COL_LIGHT = [232, 245, 233];
    const COL_WHITE = [255, 255, 255];
    const COL_GRAY = [108, 117, 125];
    const COL_HEADER_TEXT = [27, 94, 32];
    const COL_SUBTEXT = [100, 100, 100];
    const COL_VAL = [30, 30, 50];

    // Logo eliminado por solicitud

    // Título principal
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COL_HEADER_TEXT);
    doc.text('Reportes de Rejas Cortes', PAGE_W / 2, 13, { align: 'center' });

    // Subtítulo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COL_HEADER_TEXT);
    doc.text('Rancho Palmilla', PAGE_W / 2, 19, { align: 'center' });

    // Fecha
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COL_SUBTEXT);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}`, PAGE_W / 2, 25, { align: 'center' });

    doc.setDrawColor(...COL_ACCENT);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, 28 + 4, PAGE_W - MARGIN, 28 + 4);

    let y = 40;
    const MESES_CORTOS = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const fmtFechaPDF = (fechaStr) => {
        if (!fechaStr) return fechaStr;
        const partes = fechaStr.split('-');
        return partes.length === 3 ? `${partes[2]}/${MESES_CORTOS[parseInt(partes[1])] || partes[1]}/${partes[0]}` : fechaStr;
    };

    datosExportar.forEach((c) => {
        const tablas = [];
        if (c.tablas_detalle) {
            c.tablas_detalle.split('|').forEach(t => {
                const parts = t.split(':');
                if (parts.length === 2) tablas.push({ tabla: parts[0].replace('T', 'Tabla '), rejas: parseInt(parts[1]) });
            });
        }

        const FICHA_H = 50 + Math.ceil(tablas.length / 3) * 4;
        if (y + FICHA_H > PAGE_H - 18) { doc.addPage(); y = MARGIN; }

        doc.setDrawColor(...COL_ACCENT);
        doc.setLineWidth(0.3);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(MARGIN, y, CONTENT_W, FICHA_H, 3, 3, 'FD');

        doc.setFillColor(...COL_ACCENT);
        doc.roundedRect(MARGIN, y, CONTENT_W, 10, 3, 3, 'F');
        doc.rect(MARGIN, y + 5, CONTENT_W, 5, 'F');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COL_WHITE);
        doc.text(`Folio: ${c.folio}`, MARGIN + 3, y + 7);
        doc.text(`Sem ${c.sem_corte} / ${c.anio_corte}`, PAGE_W - MARGIN - 3, y + 7, { align: 'right' });

        y += 17;
        const drawField = (label, value, bx, by) => {
            doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_GRAY); doc.setFontSize(9);
            doc.text(label + ':', bx, by);
            doc.setFont('helvetica', 'normal'); doc.setTextColor(...COL_VAL); doc.setFontSize(10);
            doc.text(String(value), bx + doc.getTextWidth(label + ':') + 2, by);
        };

        drawField('Cortador', c.nombre_cortador, MARGIN + 3, y);
        drawField('Fecha', fmtFechaPDF(c.fecha_corte), MARGIN + CONTENT_W / 2 + 3, y);
        y += 9;
        drawField('Precio/Reja', `$${parseFloat(c.precio_reja).toFixed(2)}`, MARGIN + 3, y);
        drawField('Total Rejas', c.total_rejas, MARGIN + CONTENT_W / 2 + 3, y);
        y += 9;

        doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_GRAY); doc.setFontSize(9);
        doc.text('Gastos cortes:', MARGIN + 3, y);
        doc.setTextColor(...COL_GREEN); doc.setFontSize(10);
        doc.text(`$${parseFloat(c.dinero_generado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, MARGIN + 3 + doc.getTextWidth('Gastos cortes:') + 8, y);
        y += 6;

        doc.setDrawColor(...COL_LIGHT); doc.line(MARGIN + 3, y, PAGE_W - MARGIN - 3, y);
        y += 5;
        doc.setFontSize(7.5); doc.setTextColor(...COL_ACCENT); doc.text('Desglose:', MARGIN + 3, y);
        y += 5;

        let bx = MARGIN + 3;
        tablas.forEach((t) => {
            const txt = `${t.tabla}: ${t.rejas}`;
            const w = doc.getTextWidth(txt) + 6;
            if (bx + w > PAGE_W - MARGIN - 3) { bx = MARGIN + 3; y += 8; }
            doc.setFillColor(...COL_LIGHT); doc.roundedRect(bx, y - 4, w, 6, 1, 1, 'F');
            doc.setTextColor(...COL_DARK); doc.setFontSize(7); doc.text(txt, bx + 3, y);
            bx += w + 3;
        });
        y += 15;
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let pg = 1; pg <= totalPages; pg++) {
        doc.setPage(pg); doc.setFontSize(6.5); doc.setTextColor(...COL_GRAY);
        doc.text(`Nómina Palmilla • Historial de Cortes • Página ${pg} de ${totalPages}`, PAGE_W / 2, PAGE_H - 10, { align: 'center' });
    }
    doc.save(folioUnico ? `Corte_Palmilla_${folioUnico}.pdf` : `Historial_Palmilla.pdf`);
}
