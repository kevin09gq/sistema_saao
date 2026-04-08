// Definición de conceptos por tipo
const PERCEPCIONES = [
    { nombre: 'Sueldo Semanal', propiedad: 'salario_semanal' },
    { nombre: 'Pasaje', propiedad: 'pasaje' },
    { nombre: 'Comida', propiedad: 'comida' },
    { nombre: 'Extras', propiedad: 'sueldo_extra_total' } 
];

const DEDUCCIONES = [
    { nombre: 'Retardos', propiedad: 'retardos' },
    { nombre: 'ISR', codigo: '45' },
    { nombre: 'IMSS', codigo: '52' },
    { nombre: 'Ajuste al Sub', codigo: '107' },
    { nombre: 'Infonavit', codigo: '16' },
    { nombre: 'Permiso', propiedad: 'permiso' },
    { nombre: 'Inasistencias', propiedad: 'inasistencia' },
    { nombre: 'Uniformes', propiedad: 'uniformes' },
    { nombre: 'Checador', propiedad: 'checador' },
    { nombre: 'Préstamo', propiedad: 'prestamo' },
    { nombre: 'Tarjeta', propiedad: 'tarjeta' }
];

$(document).ready(function() {
    $('#btn_conceptos_totales').on('click', function() {
        calcularYMostrarTotales();
        $('#modalConceptosTotales').modal('show');
    });
});

function calcularYMostrarTotales() {
    if (!jsonNominaRelicario || !jsonNominaRelicario.departamentos) {
        alert('No hay datos de nómina disponibles');
        return;
    }

    const empleadosVisibles = [];
    jsonNominaRelicario.departamentos.forEach(departamento => {
        const empleadosFiltrados = departamento.empleados.filter(emp => emp.mostrar !== false);
        empleadosVisibles.push(...empleadosFiltrados);
    });

    // Inicializar estructuras de datos
    const percepciones = {};
    const deducciones = {};
    let totalPercepcionesGeneral = 0;
    let totalDeduccionesGeneral = 0;

    // Inicializar todos los conceptos con cero
    PERCEPCIONES.forEach(p => percepciones[p.nombre] = { total: 0, empleados: [] });
    DEDUCCIONES.forEach(d => deducciones[d.nombre] = { total: 0, empleados: [] });

    // Calcular totales
    empleadosVisibles.forEach(empleado => {
        // Procesar percepciones
        PERCEPCIONES.forEach(perc => {
            const valor = parseFloat(empleado[perc.propiedad]) || 0;
            percepciones[perc.nombre].total += valor;
            if (valor > 0) {
                percepciones[perc.nombre].empleados.push({ nombre: empleado.nombre, monto: valor });
            }
            totalPercepcionesGeneral += valor;
        });

        // Procesar deducciones fijas
        DEDUCCIONES.forEach(dedu => {
            let valor = 0;
            if (dedu.propiedad) {
                valor = parseFloat(empleado[dedu.propiedad]) || 0;
            } else if (dedu.codigo) {
                const concepto = (empleado.conceptos || []).find(c => String(c.codigo) === String(dedu.codigo));
                valor = concepto ? (parseFloat(concepto.resultado) || 0) : 0;
            }
            deducciones[dedu.nombre].total += valor;
            if (valor > 0) {
                deducciones[dedu.nombre].empleados.push({ nombre: empleado.nombre, monto: valor });
            }
            totalDeduccionesGeneral += valor;
        });

        // Procesar deducciones adicionales (propiedad 'deducciones_extra')
        if (Array.isArray(empleado.deducciones_extra) && empleado.deducciones_extra.length > 0) {
            // Sumar todas las deducciones adicionales por empleado y agruparlas como 'Otras Deducciones'
            let totalExtrasEmpleado = 0;
            empleado.deducciones_extra.forEach(extra => {
                const valorExtra = parseFloat(extra.cantidad) || 0;
                if (valorExtra > 0) totalExtrasEmpleado += valorExtra;
            });
            if (totalExtrasEmpleado > 0) {
                const clave = 'Otras Deducciones';
                if (!deducciones[clave]) {
                    deducciones[clave] = { total: 0, empleados: [] };
                }
                deducciones[clave].total += totalExtrasEmpleado;
                deducciones[clave].empleados.push({ nombre: empleado.nombre, monto: totalExtrasEmpleado });
                totalDeduccionesGeneral += totalExtrasEmpleado;
            }
        }
    });

    const totalNetoGeneral = totalPercepcionesGeneral - totalDeduccionesGeneral;

    // Mostrar totales generales
    $('#total-percepciones-general').text('$' + totalPercepcionesGeneral.toFixed(2));
    $('#total-deducciones-general').text('$' + totalDeduccionesGeneral.toFixed(2));
    $('#total-neto-general').text('$' + Math.round(totalNetoGeneral).toFixed(2));

    // Renderizar datos
    renderizarConceptos('percepciones-accordion', percepciones);
    renderizarConceptos('deducciones-accordion', deducciones);
}

function renderizarConceptos(contenedorId, conceptos) {
    const contenedor = $(`#${contenedorId}`);
    contenedor.empty();

    let index = 0;
    for (const [nombre, datos] of Object.entries(conceptos)) {
        const collapseId = `collapse-${contenedorId}-${index}`;
        const headingId = `heading-${contenedorId}-${index}`;
        const empleadosHtml = datos.empleados.length > 0 
            ? datos.empleados.map((emp, idx) => `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${emp.nombre}</td>
                    <td class="text-end">$${emp.monto.toFixed(2)}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="3" class="text-center text-muted">Sin movimientos</td></tr>';

        const item = `
            <div class="accordion-item">
                <h2 class="accordion-header" id="${headingId}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                            data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                        <span class="concept-title"><strong>${nombre}</strong></span>
                        <span class="badge bg-primary">$${datos.total.toFixed(2)}</span>
                        <span class="badge bg-secondary">${datos.empleados.length} persona(s)</span>
                    </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}">
                    <div class="accordion-body p-2">
                        <table class="table table-sm mb-0">
                            <thead>
                                <tr>
                                    <th style="width:40px">#</th>
                                    <th>Empleado</th>
                                    <th class="text-end" style="width:120px">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${empleadosHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        contenedor.append(item);
        index++;
    }
}
