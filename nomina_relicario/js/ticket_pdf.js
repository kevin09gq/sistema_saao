// ticket_pdf.js - Ticket general para nómina Relicario
$(document).ready(function () {
    function filtrarNominaSoloVisibles(nomina) {
        if (!nomina || !Array.isArray(nomina.departamentos)) return { departamentos: [] };
        return {
            ...nomina,
            departamentos: (nomina.departamentos || [])
                .map(d => ({
                    ...d,
                    empleados: (d.empleados || []).filter(emp => emp && emp.mostrar !== false)
                }))
                .filter(d => (d.empleados || []).length > 0)
        };
    }

    // Botón combinado de opciones
    $('#btn_ticket_pdf').on('click', function () {
        if (typeof jsonNominaRelicario === 'undefined' || !jsonNominaRelicario) {
            Swal.fire('Sin datos', 'No hay datos de nómina para generar el PDF.', 'warning');
            return;
        }

        const modalEl = document.getElementById('modalSeleccionTicket');
        if (modalEl) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    });

    // Opción 1: Ticket Normal
    $('#btn_ticket_normal').on('click', function () {
        const modalEl = document.getElementById('modalSeleccionTicket');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        let vistaActiva = determinarVistaActiva();
        if (vistaActiva === 'corte') {
            generarTicketsCorte();
        } else if (vistaActiva === 'poda') {
            generarTicketsPoda();
        } else {
            generarTicketsNominaNormal();
        }
    });

    // Opción 2: Ticket Nombre
    $('#btn_ticket_nombre').on('click', function () {
        const modalEl = document.getElementById('modalSeleccionTicket');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        let idDepto = parseInt($('#filtro_departamento').val() || '-1');
        let idPuesto = parseInt($('#filtro_puesto').val() || '-1');

        let datosFiltrados;
        if (idDepto === 800) {
            let deptoCorte = (jsonNominaRelicario.departamentos || []).find(d => d.nombre.toUpperCase() === 'CORTE');
            datosFiltrados = { departamentos: deptoCorte ? [{ nombre: 'Corte', empleados: deptoCorte.empleados || [] }] : [] };
        } else if (idDepto === 801) {
            let deptoPoda = (jsonNominaRelicario.departamentos || []).find(d => d.nombre.toUpperCase() === 'PODA');
            datosFiltrados = { departamentos: deptoPoda ? [{ nombre: 'Poda', empleados: deptoPoda.empleados || [] }] : [] };
        } else {
            datosFiltrados = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, idDepto);
            if (idPuesto !== -1) datosFiltrados = filtrarEmpleadosPorPuesto(datosFiltrados, idPuesto);
        }

        datosFiltrados = filtrarNominaSoloVisibles(datosFiltrados);

        // Consolidar por nombre para que cada empleado aparezca solo UNA vez en los tickets por nombre
        const empleadosUnicos = {};
        (datosFiltrados.departamentos || []).forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                const nombre = (emp.nombre || '').trim();
                if (nombre && !empleadosUnicos[nombre]) {
                    empleadosUnicos[nombre] = { ...emp };
                }
            });
        });

        const nominaConsolidada = {
            departamentos: [{
                nombre: 'Consolidado',
                empleados: Object.values(empleadosUnicos)
            }]
        };

        let total = nominaConsolidada.departamentos[0].empleados.length;

        if (total === 0) {
            Swal.fire('Sin datos', 'No hay empleados con los filtros actuales.', 'warning');
            return;
        }

        enviarDatosParaTicketsNombre({ nomina: nominaConsolidada });
    });

    function enviarDatosParaTicketsNombre(datos) {
        const btn = $('#btn_ticket_pdf');
        const original = btn.html();
        btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i>');

        $.ajax({
            url: '../php/descargar_ticket_nombre_pdf.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            xhrFields: { responseType: 'blob' },
            success: function (blob) {
                if (!(blob instanceof Blob) || blob.size === 0) {
                    Swal.fire('Error', 'PDF inválido.', 'error');
                } else {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'tickets_nombre_relicario.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    Swal.fire({ title: '¡Listo!', icon: 'success', timer: 1500, showConfirmButton: false });
                }
                btn.prop('disabled', false).html(original);
            },
            error: function () {
                Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
                btn.prop('disabled', false).html(original);
            }
        });
    }

    function determinarVistaActiva() {
        if (!$('#tabla-corte-container-relicario').prop('hidden')) return 'corte';
        if (!$('#tabla_poda_container').prop('hidden')) return 'poda';
        return 'nomina';
    }

    function generarTicketsCorte() {
        let deptoCorte = (jsonNominaRelicario.departamentos || []).find(d => d.nombre.toUpperCase() === 'CORTE');
        if (!deptoCorte || !deptoCorte.empleados || deptoCorte.empleados.length === 0) {
            Swal.fire('Sin datos', 'No hay datos de corte.', 'warning');
            return;
        }

        // Consolidar por nombre de empleado
        const empleadosPorNombre = {};
        const esSinSeguroPorNombre = {};
        
        deptoCorte.empleados.forEach(emp => {
            if (!emp || emp.mostrar === false) return;
            const esSinSeguro = (emp.seguroSocial === false) || deptoCorte.nombre.toUpperCase().includes('SIN SEGURO');
            const nombre = (emp.nombre || '').trim();
            
            if (!empleadosPorNombre[nombre]) {
                empleadosPorNombre[nombre] = { rejas: [], nomina: null };
                esSinSeguroPorNombre[nombre] = esSinSeguro;
            }
            
            if (emp.concepto === 'REJA' && Array.isArray(emp.tickets)) {
                // Guardar todas las rejas sin separar por precio
                emp.tickets.forEach(t => {
                    empleadosPorNombre[nombre].rejas.push({
                        ticket: t,
                        precio: t.precio_reja ?? 0
                    });
                });
            } else if (emp.concepto === 'NOMINA' && Array.isArray(emp.nomina)) {
                empleadosPorNombre[nombre].nomina = emp.nomina;
            }
        });

        let empleadosParaTickets = [];
        Object.keys(empleadosPorNombre).forEach(nombre => {
            const consolidado = empleadosPorNombre[nombre];
            const datos = procesarTicketsCorteCombinado(nombre, consolidado.rejas, consolidado.nomina);
            datos.departamento = 'Corte';
            if (esSinSeguroPorNombre[nombre]) datos.sin_seguro_ticket = true;
            empleadosParaTickets.push(datos);
        });

        if (empleadosParaTickets.length === 0) {
            Swal.fire('Sin datos', 'No hay tickets válidos.', 'warning');
            return;
        }

        enviarDatosParaTickets({ empleados: empleadosParaTickets, meta: { numero_semana: jsonNominaRelicario.numero_semana || '' } });
    }

    function generarTicketsPoda() {
        let deptoPoda = (jsonNominaRelicario.departamentos || []).find(d => d.nombre.toUpperCase() === 'PODA');
        if (!deptoPoda || !deptoPoda.empleados || deptoPoda.empleados.length === 0) {
            Swal.fire('Sin datos', 'No hay datos de poda.', 'warning');
            return;
        }

        // Consolidar por nombre de empleado
        const empleadosPorNombre = {};
        const esSinSeguroPorNombre = {};

        deptoPoda.empleados.forEach(emp => {
            if (!emp || emp.mostrar === false) return;
            const nombre = (emp.nombre || '').trim();
            const esSinSeguro = (emp.seguroSocial === false) || deptoPoda.nombre.toUpperCase().includes('SIN SEGURO');
            
            if (!empleadosPorNombre[nombre]) {
                empleadosPorNombre[nombre] = { movsPoda: [], movsExtras: [], original: emp };
                esSinSeguroPorNombre[nombre] = esSinSeguro;
            }
            
            const movs = Array.isArray(emp.movimientos) ? emp.movimientos : [];
            empleadosPorNombre[nombre].movsPoda.push(...movs.filter(m => m.concepto === 'PODA'));
            empleadosPorNombre[nombre].movsExtras.push(...movs.filter(m => m.concepto !== 'PODA'));
        });

        let empleadosParaTickets = [];
        Object.keys(empleadosPorNombre).forEach(nombre => {
            const data = empleadosPorNombre[nombre];
            const esSinSeguro = esSinSeguroPorNombre[nombre];
            
            // TICKET 1: PODA
            if (data.movsPoda.length > 0) {
                const datos = procesarPodaParaTicket(nombre, data.movsPoda);
                datos.departamento = 'Poda';
                if (esSinSeguro) datos.sin_seguro_ticket = true;
                empleadosParaTickets.push(datos);
            }

            // TICKET 2: EXTRAS
            if (data.movsExtras.length > 0) {
                const datosExtra = procesarExtrasParaTicket(nombre, data.movsExtras, data.original);
                datosExtra.departamento = 'Poda'; // O el depto original
                if (esSinSeguro) datosExtra.sin_seguro_ticket = true;
                empleadosParaTickets.push(datosExtra);
            }
        });

        if (empleadosParaTickets.length === 0) {
            Swal.fire('Sin datos', 'No hay tickets de poda válidos.', 'warning');
            return;
        }

        enviarDatosParaTickets({ empleados: empleadosParaTickets, meta: { numero_semana: jsonNominaRelicario.numero_semana || '' } });
    }

    function generarTicketsNominaNormal() {
        let idDepto = parseInt($('#filtro_departamento').val() || '-1');
        let idPuesto = parseInt($('#filtro_puesto').val() || '-1');

        let datosFiltrados = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, idDepto);
        if (idPuesto !== -1) datosFiltrados = filtrarEmpleadosPorPuesto(datosFiltrados, idPuesto);

        datosFiltrados = filtrarNominaSoloVisibles(datosFiltrados);

        let total = 0;
        (datosFiltrados.departamentos || []).forEach(d => total += (d.empleados || []).length);

        if (total === 0) {
            Swal.fire('Sin datos', 'No hay empleados con los filtros actuales.', 'warning');
            return;
        }

        enviarDatosParaTickets({ nomina: datosFiltrados, meta: { numero_semana: jsonNominaRelicario.numero_semana || '' } });
    }

    function enviarDatosParaTickets(datos) {
        const btn = $('#btn_ticket_pdf');
        const original = btn.html();
        btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i>');
        
        $.ajax({
            url: '../php/descargar_ticket_pdf.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            xhrFields: { responseType: 'blob' },
            success: function (blob) {
                if (!(blob instanceof Blob) || blob.size === 0) {
                    Swal.fire('Error', 'PDF inválido.', 'error');
                } else {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'tickets_relicario.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    Swal.fire({ title: '¡Listo!', icon: 'success', timer: 1500, showConfirmButton: false });
                }
                btn.prop('disabled', false).html(original);
            },
            error: function () {
                Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
                btn.prop('disabled', false).html(original);
            }
        });
    }
});

function procesarTicketsCorteCombinado(nombre, rejasArray, datoNomina) {
    let totalRejas = 0;
    let rejasConPrecio = []; // Array de {cantidad, precio}
    let diasTrabajados = 0;
    let preciosPorDia = []; // Array de precios de nómina
    
    let diasConCorte = {}; // Para saber qué días tuvieron rejas > 0

    // PASO 1 & 2: Procesar todas las REJAS - sumar cantidades y guardar precios
    if (Array.isArray(rejasArray) && rejasArray.length > 0) {
        rejasArray.forEach(rInfo => {
            const t = rInfo.ticket;
            let cantidadTicket = 0;
            (t.datosRejas || []).forEach(tr => {
                cantidadTicket += tr.cantidad;
                totalRejas += tr.cantidad;
            });
            
            // Guardar cantidad y precio de esta reja, y registrar el día
            if (cantidadTicket > 0) {
                const diaSemana = obtenerDiaSemana(t.fecha);
                if (diaSemana) diasConCorte[diaSemana] = true;
                
                rejasConPrecio.push({
                    cantidad: cantidadTicket,
                    precio: rInfo.precio || 0
                });
            }
        });
    }

    // Eliminar precios duplicados de reja
    const preciosUnicos = [];
    const preciosYaAgregados = new Set();
    rejasConPrecio.forEach(rp => {
        const precioStr = rp.precio.toString();
        if (!preciosYaAgregados.has(precioStr)) {
            preciosUnicos.push(rp.precio);
            preciosYaAgregados.add(precioStr);
        }
    });

    // PASO 3: Calcular Efectivo rejas (Suma de todas las rejas)
    let efectivoRejas = 0;
    if (rejasConPrecio.length > 0) {
        rejasConPrecio.forEach(rp => {
            efectivoRejas += rp.cantidad * rp.precio;
        });
    }

    // PASO 4 & 5: Procesar NOMINA - contar días y sumar pagos (SOLO si hubo cortes ese día)
    let totalNomina = 0;
    if (datoNomina && Array.isArray(datoNomina)) {
        datoNomina.forEach(n => {
            const nombreDia = String(n.dia || '').toLowerCase();
            const pago = parseFloat(n.pago) || 0;
            
            // Solo cuenta el día de nómina si en ese mismo día hubo corte de rejas
            if (pago > 0 && diasConCorte[nombreDia]) {
                preciosPorDia.push(pago);
                totalNomina += pago;
                diasTrabajados++;
            }
        });
    }

    // PASO 6: Calcular total efectivo
    const subtotal = efectivoRejas + totalNomina;
    const totalEfectivo = Math.round(subtotal);
    const redondeo = totalEfectivo - subtotal;
    
    return {
        nombre,
        concepto: 'REJA_NOMINA',
        totalRejas,
        preciosUnicos, // Array con precios únicos de reja
        efectivoRejas,
        diasTrabajados,
        preciosPorDia, // Array de precios individuales
        totalNomina,
        subtotal,
        redondeo,
        totalEfectivo
    };
}

function procesarTicketsParaCorte(nombre, tickets, precio) {
    const rejas = { viernes: 0, sabado: 0, domingo: 0, lunes: 0, martes: 0, miercoles: 0, jueves: 0 };
    let total = 0;
    (tickets || []).forEach(t => {
        const dia = obtenerDiaSemana(t.fecha);
        (t.datosRejas || []).forEach(tr => {
            if (rejas.hasOwnProperty(dia)) rejas[dia] += tr.cantidad;
            total += tr.cantidad;
        });
    });
    return { nombre, concepto: 'REJA', ...rejas, totalRejas: total, precio, totalEfectivo: total * precio };
}

function procesarNominaParaCorte(nombre, nomina) {
    const pagos = { viernes: 0, sabado: 0, domingo: 0, lunes: 0, martes: 0, miercoles: 0, jueves: 0 };
    let total = 0;
    (nomina || []).forEach(n => {
        const dia = String(n.dia || '').toLowerCase();
        const pago = parseFloat(n.pago) || 0;
        if (pagos.hasOwnProperty(dia)) pagos[dia] = pago;
        total += pago;
    });
    return { nombre, concepto: 'NOMINA', ...pagos, totalRejas: 0, precio: 0, totalEfectivo: total };
}

function procesarPodaParaTicket(nombre, movs) {
    const arb = { viernes: 0, sabado: 0, domingo: 0, lunes: 0, martes: 0, miercoles: 0, jueves: 0 };
    let totalArboles = 0;
    let totalEfectivo = 0;
    const desglosesMap = {};

    (movs || []).forEach(m => {
        const dia = obtenerDiaSemana(m.fecha);
        const cant = Number(m.arboles_podados || 0);
        const monto = parseFloat(m.monto || 0);
        
        if (arb.hasOwnProperty(dia)) arb[dia] += cant;
        totalArboles += cant;
        totalEfectivo += (cant * monto);

        const key = monto.toString();
        if (!desglosesMap[key]) {
            desglosesMap[key] = { precio: monto, cantidad: 0, total: 0 };
        }
        desglosesMap[key].cantidad += cant;
        desglosesMap[key].total += (cant * monto);
    });

    return {
        nombre,
        concepto: 'PODA',
        ...arb,
        totalArboles,
        desgloses: Object.values(desglosesMap),
        totalEfectivo: totalEfectivo
    };
}

function procesarExtrasParaTicket(nombre, movsExtras, original) {
    const conceptosExtras = [];
    let totalEfectivo = 0;

    movsExtras.forEach(ex => {
        const monto = parseFloat(ex.monto || 0);
        conceptosExtras.push({
            concepto: ex.concepto || 'Extra',
            monto: monto
        });
        totalEfectivo += monto;
    });

    return {
        ...original,
        nombre: nombre,
        concepto: 'EXTRA_PODA',
        esExtraPoda: true,
        conceptosExtras: conceptosExtras,
        totalEfectivo: totalEfectivo
    };
}

function obtenerDiaSemana(fechaStr) {
    if (!fechaStr) return '';
    const [a, m, d] = fechaStr.split('-').map(Number);
    const date = new Date(a, m - 1, d);
    return ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][date.getDay()];
}
