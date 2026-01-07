/**
 * Módulo para generar reportes PDF del reloj 8 horas
 */

// Función para parsear fecha DD/MM/YYYY
function parseDDMMYYYY(s) {
    if (!s) return null;
    const [dd, mm, yyyy] = String(s).split('/').map(x => parseInt(x, 10));
    if (!dd || !mm || !yyyy) return null;
    return new Date(yyyy, mm - 1, dd);
}

// Función para obtener día de la semana en español
function diaSemanaES(date) {
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    return dias[date.getDay()];
}

// Normalizar HH:MM
function normalizarHHMM(h) {
    if (!h) return '';
    const partes = String(h).split(':');
    if (partes.length < 2) return '';
    return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
}

// Convertir fecha de formato "29/Nov/2025" a "29/11/2025"
function normalizarFecha(fecha) {
    if (!fecha) return '';

    const meses = {
        'ENE': '01', 'FEB': '02', 'MAR': '03', 'ABR': '04',
        'MAY': '05', 'JUN': '06', 'JUL': '07', 'AGO': '08',
        'SEP': '09', 'OCT': '10', 'NOV': '11', 'DIC': '12'
    };

    const partes = String(fecha).split('/');
    if (partes.length !== 3) return fecha;

    const dia = partes[0];
    const mes = partes[1];
    const anio = partes[2];

    // Si el mes es texto, convertirlo a número
    const mesUpper = mes.toUpperCase();
    if (meses[mesUpper]) {
        return `${dia}/${meses[mesUpper]}/${anio}`;
    }

    // Si ya es número, devolverlo tal cual
    return fecha;
}

// Convertir HH:MM a minutos
function hhmmToMin(hhmm) {
    const h = normalizarHHMM(hhmm);
    if (!h) return 0;
    const [hh, mm] = h.split(':').map(Number);
    return (hh * 60) + mm;
}

// Calcular diferencia entre dos horas
function diffHHMM(inicio, fin) {
    if (!inicio || !fin) return '';
    const a = hhmmToMin(inicio);
    const b = hhmmToMin(fin);
    let d = b - a;
    if (d < 0) d += 24 * 60;
    const hh = Math.floor(d / 60);
    const mm = d % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// Obtener clase CSS según el tipo de registro
function getRowClass(tipo, emp) {
    const t = String(tipo || '').toLowerCase();
    if (t === 'ausencia' || t === 'inasistencia' || t === 'no_laboro' || t === 'sin_turno') return 'table-secondary';
    if (t === 'incapacidad') return 'table-primary';
    if (t === 'vacaciones') return 'table-success';
    if (t === 'descanso') return 'table-warning';
    if (emp?.incapacidades) return 'table-primary';
    if (emp?.vacaciones) return 'table-success';
    if (emp?.ausencias) return 'table-secondary';
    return '';
}

// Función para aplanar empleados
function flattenEmpleados(datos) {
    const out = [];
    if (!datos || !Array.isArray(datos.departamentos)) return out;
    datos.departamentos.forEach((d, idx) => {
        (d.empleados || []).forEach(emp => {
            out.push({
                deptIndex: idx,
                deptNombre: d.nombre,
                empleado: emp
            });
        });
    });
    return out;
}

// Generar HTML de la página de un empleado
function generarPaginaEmpleado(item, datos, esPrimeraEnPagina = false, esPrimeroDelDepartamento = false) {
    const emp = item.empleado;
    const registros = emp.registros_procesados || [];
    const fechaInicio = normalizarFecha(datos?.fecha_inicio || '');
    const fechaFin = normalizarFecha(datos?.fecha_cierre || '');

    // Limpiar el nombre del departamento (quitar número)
    let deptNombre = item.deptNombre || '';
    deptNombre = deptNombre.replace(/^\d+\s*/, '');

    const numSemana = datos?.numero_semana || datos?.num_semana || '';

    let html = `
        <div class="tabla-empleado ${esPrimeraEnPagina ? 'primera-en-pagina' : ''}">
            ${esPrimeraEnPagina ? `
                <div class="encabezado-container">
                    <div class="encabezado">Reporte General</div>
                    <div class="semana">SEM ${numSemana}</div>
                </div>
            ` : ''}
            <table class="tabla-reporte">
                <colgroup>
                    <col><col><col><col><col><col><col><col><col><col><col>
                </colgroup>
                <thead>`;

    // Solo mostrar Departamento, Desde y Hasta si es el primer empleado del departamento
    if (esPrimeroDelDepartamento) {
        html += `
                    <tr>
                        <th colspan="3">Departamento</th>
                        <td colspan="8" style="text-align:center; font-weight:700;">${deptNombre}</td>
                    </tr>
                    <tr>
                        <th colspan="3">Desde</th>
                        <td colspan="3">${fechaInicio}</td>
                        <th colspan="2">Hasta</th>
                        <td colspan="3">${fechaFin}</td>
                    </tr>`;
    }

    html += `
                    <tr>
                        <th colspan="3">Nombre</th>
                        <td colspan="3">${emp.nombre || ''}</td>
                        <th colspan="2">Número de Tarjeta</th>
                        <td colspan="3"></td>
                    </tr>
                    <tr>
                        <th>ID</th>
                        <th>DIA</th>
                        <th>Fecha</th>
                        <th>Turno</th>
                        <th>Entrada</th>
                        <th>Salida</th>
                        <th>Redondeo Entrada</th>
                        <th>Redondeo Salida</th>
                        <th>Trabajado</th>
                        <th>Tarde / Temprano</th>
                        <th>Descanso</th>
                    </tr>
                </thead>
                <tbody>
    `;

    registros.forEach(r => {
        const d = parseDDMMYYYY(r.fecha);
        const dia = d ? diaSemanaES(d) : '';

        // SIEMPRE mostrar el turno del empleado
        let turnoTxt = '';

        // Buscar en el horario del empleado el turno del día correspondiente
        const horario = emp.horario || [];
        const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        const diaIndex = d ? d.getDay() : -1;

        // 1. Primero buscar en el horario del empleado para ese día
        if (diaIndex >= 0 && horario.length > 0) {
            const diaNombre = diasSemana[diaIndex];
            const horarioDia = horario.find(h => h.dia && h.dia.toUpperCase() === diaNombre);
            if (horarioDia && horarioDia.entrada && horarioDia.salida) {
                turnoTxt = `DIURNA(${horarioDia.entrada}-${horarioDia.salida})`;
            }
        }

        // 2. Si no hay turno del día, usar tipo_turno del registro (si es válido)
        if (!turnoTxt && r.tipo_turno && r.tipo_turno !== 'N/A' && r.tipo_turno.trim() !== '') {
            turnoTxt = r.tipo_turno;
        }

        // 3. Si aún no hay, buscar en turno_base/turno_sabado
        if (!turnoTxt) {
            const turno = (dia === 'SÁBADO') ? emp.turno_sabado : emp.turno_base;
            if (turno && (turno.descripcion || turno.hora_inicio || turno.hora_fin)) {
                const turnoDesc = turno.descripcion || '';
                const tIni = normalizarHHMM(turno.hora_inicio);
                const tFin = normalizarHHMM(turno.hora_fin);
                turnoTxt = (turnoDesc || tIni || tFin) ? `${turnoDesc}${(tIni || tFin) ? `(${tIni}-${tFin})` : ''}` : '';
            }
        }

        // 4. Si es día de descanso y aún no hay turno, buscar el turno del día anterior o siguiente
        if (!turnoTxt && horario.length > 0) {
            // Buscar cualquier día con horario para obtener el turno base
            const cualquierDia = horario.find(h => h.entrada && h.salida);
            if (cualquierDia) {
                turnoTxt = `DIURNA(${cualquierDia.entrada}-${cualquierDia.salida})`;
            }
        }

        const marcas = Array.isArray(r.registros) ? r.registros : [];
        const e1 = marcas[0]?.hora || '';
        const s1 = marcas[1]?.hora || '';
        const e2 = marcas[2]?.hora || '';
        const s2 = marcas[3]?.hora || '';

        const rowClass = getRowClass(r.tipo, emp);
        const id = emp.clave || emp.id_empleado || '';
        const descansoClass = String(r.tipo) === 'descanso' ? rowClass : '';

        if (String(r.tipo) === 'asistencia') {
            html += `
                <tr>
                    <td>${id}</td>
                    <td>${dia}</td>
                    <td>${r.fecha || ''}</td>
                    <td>${turnoTxt}</td>
                    <td class="${rowClass}">${e1}</td>
                    <td class="${rowClass}">${s1}</td>
                    <td></td>
                    <td></td>
                    <td>${diffHHMM(e1, s1) || '00:00'}</td>
                    <td></td>
                    <td class="${descansoClass}"></td>
                </tr>
                <tr>
                    <td>${id}</td>
                    <td>${dia}</td>
                    <td>${r.fecha || ''}</td>
                    <td>${turnoTxt}</td>
                    <td class="${rowClass}">${e2}</td>
                    <td class="${rowClass}">${s2}</td>
                    <td></td>
                    <td></td>
                    <td>${diffHHMM(e2, s2) || '00:00'}</td>
                    <td></td>
                    <td class="${descansoClass}"></td>
                </tr>
            `;
        } else {
            html += `
                <tr>
                    <td>${id}</td>
                    <td>${dia}</td>
                    <td>${r.fecha || ''}</td>
                    <td>${turnoTxt}</td>
                    <td class="${rowClass}"></td>
                    <td class="${rowClass}"></td>
                    <td></td>
                    <td></td>
                    <td>${r.trabajado_hhmm || '00:00'}</td>
                    <td></td>
                    <td class="${descansoClass}"></td>
                </tr>
            `;
        }
    });

    const horasTotales = (emp.trabajado_total_decimal ?? 0).toFixed(2);
    const tiempoTotal = emp.trabajado_total_hhmm || '00:00';

    const horasRedondeada = redondearHoras(tiempoTotal);

    html += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4">Horas totales</td>
                        <td colspan="2">${horasRedondeada}</td>
                        <td colspan="2">Tiempo total</td>
                        <td colspan="3">${tiempoTotal}</td>
                    </tr>
                </tfoot>
            </table>
            <div class="firmas-wrapper">
                <div class="firma">${emp.nombre || ''}</div>
            </div>
            <div class="palabra">SELLO TRABAJADOR REVISADO</div>
        </div>
    `;

    return html;
}

/**
 * =========================================================
 * Redondea horas en formato "HH:MM" al entero más cercano.
 * =========================================================
 */
function redondearHoras(hhmm) {
    const [horasStr, minutosStr] = (hhmm || '00:00').split(':');
    const horas = parseInt(horasStr, 10);
    const minutos = parseInt(minutosStr, 10);
    const resultado = minutos <= 10 ? horas : horas + 1;
    return resultado.toFixed(2);
}

// Generar y mostrar reporte para impresión
function generarReportePDF(datos) {
    const empleadosFlat = flattenEmpleados(datos);

    if (empleadosFlat.length === 0) {
        alert('No hay empleados para generar el reporte.');
        return;
    }

    // Cache buster para forzar recarga del CSS
    const cacheBuster = new Date().getTime();

    let htmlCompleto = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte_Reloj_8Horas</title>
            <link rel="stylesheet" href="/sistema_saao/reloj-8horas/css/print_styles.css?v=${cacheBuster}">
        </head>
        <body>
    `;

    // Generar tablas sin restricción de páginas, dejar que fluyan naturalmente
    let departamentoActual = null;

    empleadosFlat.forEach((item, index) => {
        // Verificar si es el primer empleado del departamento
        const esPrimeroDelDepartamento = (item.deptNombre !== departamentoActual);
        departamentoActual = item.deptNombre;

        // Solo la primera tabla general lleva encabezado de reporte
        const esPrimeraEnPagina = (index === 0);
        htmlCompleto += generarPaginaEmpleado(item, datos, esPrimeraEnPagina, esPrimeroDelDepartamento);
    });

    htmlCompleto += '</body></html>';

    // Crear iframe oculto para imprimir
    let iframe = document.getElementById('print-iframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'print-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlCompleto);
    doc.close();

    // Esperar a que cargue el contenido y luego imprimir
    iframe.contentWindow.onload = function () {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    };
}
