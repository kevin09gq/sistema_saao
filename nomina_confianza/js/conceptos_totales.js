// Funcionalidad para el modal de totales por concepto

$(document).ready(function() {
    // Abrir modal al hacer clic en el botón
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

    // Obtener solo empleados con mostrar=true
    const empleadosVisibles = [];
    jsonNominaConfianza.departamentos.forEach(departamento => {
        const empleadosFiltrados = departamento.empleados.filter(emp => emp.mostrar !== false);
        empleadosVisibles.push(...empleadosFiltrados);
    });

    // Estructura para almacenar totales por concepto
    const conceptos = {
        'Sueldo Semanal': { total: 0, empleados: [] },
        'Extras': { total: 0, empleados: [] },
        'Retardos': { total: 0, empleados: [] },
        'ISR': { total: 0, empleados: [] },
        'IMSS': { total: 0, empleados: [] },
        'Ajuste al Sub': { total: 0, empleados: [] },
        'Infonavit': { total: 0, empleados: [] },
        'Permiso': { total: 0, empleados: [] },
        'Inasistencias': { total: 0, empleados: [] },
        'Uniformes': { total: 0, empleados: [] },
        'Checador': { total: 0, empleados: [] },
        'Préstamo': { total: 0, empleados: [] },
        'Tarjeta': { total: 0, empleados: [] }
    };

    // Totales generales
    let totalPercepcionesGeneral = 0;
    let totalDeduccionesGeneral = 0;
    let totalNetoGeneral = 0;

    // Recorrer empleados y sumar conceptos
    empleadosVisibles.forEach(empleado => {
        // Función auxiliar para buscar concepto
        const buscarConcepto = (codigo) => {
            if (!Array.isArray(empleado.conceptos)) return 0;
            const concepto = empleado.conceptos.find(c => String(c.codigo) === String(codigo));
            return concepto ? (parseFloat(concepto.resultado) || 0) : 0;
        };

        // Sueldo Semanal
        const sueldo = parseFloat(empleado.sueldo_semanal) || 0;
        if (sueldo > 0) {
            conceptos['Sueldo Semanal'].total += sueldo;
            conceptos['Sueldo Semanal'].empleados.push({ nombre: empleado.nombre, monto: sueldo });
        }

        // Extras
        const extras = parseFloat(empleado.sueldo_extra_total) || 0;
        if (extras > 0) {
            conceptos['Extras'].total += extras;
            conceptos['Extras'].empleados.push({ nombre: empleado.nombre, monto: extras });
        }

        // Retardos
        const retardos = parseFloat(empleado.retardos) || 0;
        if (retardos > 0) {
            conceptos['Retardos'].total += retardos;
            conceptos['Retardos'].empleados.push({ nombre: empleado.nombre, monto: retardos });
        }

        // ISR
        const isr = buscarConcepto('45');
        if (isr > 0) {
            conceptos['ISR'].total += isr;
            conceptos['ISR'].empleados.push({ nombre: empleado.nombre, monto: isr });
        }

        // IMSS
        const imss = buscarConcepto('52');
        if (imss > 0) {
            conceptos['IMSS'].total += imss;
            conceptos['IMSS'].empleados.push({ nombre: empleado.nombre, monto: imss });
        }

        // Ajuste al Sub
        const ajusteSub = parseFloat(empleado.ajuste_sub) || 0;
        if (ajusteSub > 0) {
            conceptos['Ajuste al Sub'].total += ajusteSub;
            conceptos['Ajuste al Sub'].empleados.push({ nombre: empleado.nombre, monto: ajusteSub });
        }

        // Infonavit
        const infonavit = buscarConcepto('16');
        if (infonavit > 0) {
            conceptos['Infonavit'].total += infonavit;
            conceptos['Infonavit'].empleados.push({ nombre: empleado.nombre, monto: infonavit });
        }

        // Permiso
        const permiso = parseFloat(empleado.permiso) || 0;
        if (permiso > 0) {
            conceptos['Permiso'].total += permiso;
            conceptos['Permiso'].empleados.push({ nombre: empleado.nombre, monto: permiso });
        }

        // Inasistencias
        const inasistencias = parseFloat(empleado.inasistencia) || 0;
        if (inasistencias > 0) {
            conceptos['Inasistencias'].total += inasistencias;
            conceptos['Inasistencias'].empleados.push({ nombre: empleado.nombre, monto: inasistencias });
        }

        // Uniformes
        const uniformes = parseFloat(empleado.uniformes) || 0;
        if (uniformes > 0) {
            conceptos['Uniformes'].total += uniformes;
            conceptos['Uniformes'].empleados.push({ nombre: empleado.nombre, monto: uniformes });
        }

        // Checador
        const checador = parseFloat(empleado.checador) || 0;
        if (checador > 0) {
            conceptos['Checador'].total += checador;
            conceptos['Checador'].empleados.push({ nombre: empleado.nombre, monto: checador });
        }

        // Préstamo
        const prestamo = parseFloat(empleado.prestamo) || 0;
        if (prestamo > 0) {
            conceptos['Préstamo'].total += prestamo;
            conceptos['Préstamo'].empleados.push({ nombre: empleado.nombre, monto: prestamo });
        }

        // Tarjeta
        const tarjeta = parseFloat(empleado.tarjeta) || 0;
        if (tarjeta > 0) {
            conceptos['Tarjeta'].total += tarjeta;
            conceptos['Tarjeta'].empleados.push({ nombre: empleado.nombre, monto: tarjeta });
        }

        // Calcular totales generales
        const percepciones = sueldo + extras;
        const deducciones = retardos + isr + imss + ajusteSub + infonavit + permiso + inasistencias + uniformes + checador;
        const neto = percepciones - deducciones - prestamo - tarjeta;

        totalPercepcionesGeneral += percepciones;
        totalDeduccionesGeneral += deducciones;
        totalNetoGeneral += neto;
    });

    // Mostrar totales generales
    $('#total-percepciones-general').text('$' + totalPercepcionesGeneral.toFixed(2));
    $('#total-deducciones-general').text('$' + totalDeduccionesGeneral.toFixed(2));
    $('#total-neto-general').text('$' + totalNetoGeneral.toFixed(2));

    // Renderizar accordion de conceptos
    renderizarAccordion(conceptos);
}

function renderizarAccordion(conceptos) {
    const accordion = $('#accordionConceptos');
    accordion.empty();

    let index = 0;
    for (const [nombreConcepto, datos] of Object.entries(conceptos)) {
        // Solo mostrar conceptos que tengan empleados
        if (datos.empleados.length === 0) continue;

        const collapseId = 'collapse' + index;
        const headingId = 'heading' + index;
        const item = `
            <div class="accordion-item">
                <h2 class="accordion-header" id="${headingId}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                            data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                        <span class="concept-title"><strong>${nombreConcepto}</strong></span>
                        <div class="badge-group">
                            <span class="badge bg-primary">Total: $${datos.total.toFixed(2)}</span>
                            <span class="badge bg-secondary">${datos.empleados.length} empleado(s)</span>
                        </div>
                    </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}" 
                     data-bs-parent="#accordionConceptos">
                    <div class="accordion-body">
                        <div class="table-responsive">
                        <table class="table table-sm table-hover mb-0">
                            <thead>
                                <tr>
                                    <th style="width:40px">#</th>
                                    <th>Empleado</th>
                                    <th class="text-end" style="width:120px">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${datos.empleados.map((emp, idx) => `
                                    <tr>
                                        <td>${idx + 1}</td>
                                        <td>${emp.nombre}</td>
                                        <td class="text-end">$${emp.monto.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        accordion.append(item);
        index++;
    }
}
