/**
 * Formatea un valor numérico como moneda mexicana (MXN)
 * @param {number|string} valor - El valor a formatear
 * @returns {string} Valor formateado con símbolo $ y comas
 */
function formatearMonedaMXNModales(valor) {
    const num = parseFloat(valor) || 0;
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(num);
}

// Definición de conceptos por tipo
const PERCEPCIONES = [
    { nombre: 'Sueldo Semanal', propiedad: 'salario_semanal' },
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
    if (!jsonNominaConfianza || !jsonNominaConfianza.departamentos) {
        alert('No hay datos de nómina disponibles');
        return;
    }

    // Inicializar estructuras de datos
    const percepciones = {};
    const deducciones = {};
    let totalPercepcionesGeneral = 0;
    let totalDeduccionesGeneral = 0;

    // Inicializar todos los conceptos con cero
    PERCEPCIONES.forEach(p => percepciones[p.nombre] = { total: 0, departamentos: {} });
    DEDUCCIONES.forEach(d => deducciones[d.nombre] = { total: 0, departamentos: {} });

    /**
     * Helper para agregar montos a la estructura agrupada
     */
    const agregarAlConcepto = (coleccion, nombreConcepto, deptoNombre, empleado, monto) => {
        if (!coleccion[nombreConcepto]) {
            coleccion[nombreConcepto] = { total: 0, departamentos: {} };
        }
        coleccion[nombreConcepto].total += monto;

        if (!coleccion[nombreConcepto].departamentos[deptoNombre]) {
            coleccion[nombreConcepto].departamentos[deptoNombre] = {
                total: 0,
                empleados: []
            };
        }

        const depto = coleccion[nombreConcepto].departamentos[deptoNombre];
        depto.total += monto;
        depto.empleados.push({ nombre: empleado.nombre, monto: monto });
    };

    // Calcular totales agrupados por departamento e IMSS
    jsonNominaConfianza.departamentos.forEach(departamento => {
        const deptoNombre = departamento.nombre;

        departamento.empleados.forEach(empleado => {
            if (empleado.mostrar === false) return;

            // Procesar percepciones
            PERCEPCIONES.forEach(perc => {
                const valor = parseFloat(empleado[perc.propiedad]) || 0;
                if (valor > 0) {
                    agregarAlConcepto(percepciones, perc.nombre, deptoNombre, empleado, valor);
                    totalPercepcionesGeneral += valor;
                }
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
                if (valor > 0) {
                    agregarAlConcepto(deducciones, dedu.nombre, deptoNombre, empleado, valor);
                    totalDeduccionesGeneral += valor;
                }
            });

            // Procesar deducciones adicionales (propiedad 'deducciones_extra')
            if (Array.isArray(empleado.deducciones_extra) && empleado.deducciones_extra.length > 0) {
                let totalExtrasEmpleado = 0;
                empleado.deducciones_extra.forEach(extra => {
                    totalExtrasEmpleado += parseFloat(extra.cantidad) || 0;
                });
                if (totalExtrasEmpleado > 0) {
                    agregarAlConcepto(deducciones, 'Otras Deducciones', deptoNombre, empleado, totalExtrasEmpleado);
                    totalDeduccionesGeneral += totalExtrasEmpleado;
                }
            }
        });
    });

    const totalNetoGeneral = totalPercepcionesGeneral - totalDeduccionesGeneral;

    // Mostrar totales generales
    $('#total-percepciones-general').text(formatearMonedaMXNModales(totalPercepcionesGeneral));
    $('#total-deducciones-general').text(formatearMonedaMXNModales(totalDeduccionesGeneral));
    $('#total-neto-general').text(formatearMonedaMXNModales(Math.round(totalNetoGeneral)));

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

        let totalPersonas = 0;
        let filasHtml = '';

        const deptosEntradas = Object.entries(datos.departamentos);

        if (deptosEntradas.length > 0) {
            deptosEntradas.forEach(([deptoNombre, deptoDatos]) => {
                totalPersonas += deptoDatos.empleados.length;

                // Fila de subtotal por departamento
                filasHtml += `
                    <tr class="table-light">
                        <td colspan="2"><span class="badge bg-secondary me-2">DEPTO</span> <strong>${deptoNombre}</strong></td>
                        <td class="text-end text-primary"><strong>${formatearMonedaMXNModales(deptoDatos.total)}</strong></td>
                    </tr>
                `;

                // Filas de empleados
                deptoDatos.empleados.forEach((emp, idx) => {
                    filasHtml += `
                        <tr>
                            <td class="ps-3 text-muted" style="width:40px">${idx + 1}</td>
                            <td class="ps-3">${emp.nombre}</td>
                            <td class="text-end">${formatearMonedaMXNModales(emp.monto)}</td>
                        </tr>
                    `;
                });
            });
        } else {
            filasHtml = '<tr><td colspan="3" class="text-center text-muted py-3">Sin movimientos</td></tr>';
        }

        const item = `
            <div class="accordion-item">
                <h2 class="accordion-header" id="${headingId}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                            data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                        <span class="concept-title"><strong>${nombre}</strong></span>
                        <span class="badge bg-primary">${formatearMonedaMXNModales(datos.total)}</span>
                        <span class="badge bg-secondary">${totalPersonas} persona(s)</span>
                    </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}">
                    <div class="accordion-body p-0">
                        <div class="table-responsive">
                            <table class="table table-sm table-hover mb-0">
                                <thead class="table-dark">
                                    <tr>
                                        <th class="ps-3" style="width:40px">#</th>
                                        <th>Empleado / Departamento</th>
                                        <th class="text-end" style="width:140px">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filasHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedor.append(item);
        index++;
    }
}
