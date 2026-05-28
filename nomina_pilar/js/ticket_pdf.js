// ticket_pdf.js - Ticket general para nómina Pilar
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
        if (typeof jsonNominaPilar === 'undefined' || !jsonNominaPilar) {
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

        // Manejo especial para departamentos de Corte y Poda en Pilar
        if (idDepto === 800) {
            // Corte
            let deptoCorte = (jsonNominaPilar.departamentos || []).find(d => d.nombre.toUpperCase() === 'CORTE');
            datosFiltrados = {
                departamentos: deptoCorte ? [{
                    nombre: 'Corte',
                    empleados: deptoCorte.empleados || []
                }] : []
            };
        } else if (idDepto === 801) {
            // Poda
            let deptoPoda = (jsonNominaPilar.departamentos || []).find(d => d.nombre.toUpperCase() === 'PODA');
            datosFiltrados = {
                departamentos: deptoPoda ? [{
                    nombre: 'Poda',
                    empleados: deptoPoda.empleados || []
                }] : []
            };
        } else {
            // Filtrado normal
            datosFiltrados = filtrarEmpleadosPorDepartamento(jsonNominaPilar, idDepto);
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

        // Recalcular totales antes de enviar
        (nominaConsolidada.departamentos || []).forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (typeof calcularTotalCobrar === 'function') {
                    calcularTotalCobrar(emp);
                }
            });
        });

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
                    link.download = 'tickets_nombre_pilar.pdf';
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
        if (!$('#tabla-corte-container-pilar').prop('hidden')) return 'corte';
        if (!$('#tabla_poda_container').prop('hidden')) return 'poda';
        return 'nomina';
    }

    function generarTicketsCorte() {
        let deptoCorte = (jsonNominaPilar.departamentos || []).find(d => d.nombre.toUpperCase() === 'CORTE');
        if (!deptoCorte || !deptoCorte.empleados || deptoCorte.empleados.length === 0) {
            Swal.fire('Sin datos', 'No hay datos de corte.', 'warning');
            return;
        }

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

            const concepto = String(emp.concepto || '').toUpperCase();
            if (concepto === 'REJA' && Array.isArray(emp.tickets)) {
                emp.tickets.forEach(t => {
                    empleadosPorNombre[nombre].rejas.push({
                        ticket: t,
                        precio: t.precio_reja ?? 0
                    });
                });
            } else if (concepto === 'NOMINA' && Array.isArray(emp.nomina)) {
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

        enviarDatosParaTickets({ empleados: empleadosParaTickets, meta: { numero_semana: jsonNominaPilar.numero_semana || '' } });
    }

    function generarTicketsPoda() {
        let deptoPoda = (jsonNominaPilar.departamentos || []).find(d => d.nombre.toUpperCase() === 'PODA');
        if (!deptoPoda || !deptoPoda.empleados || deptoPoda.empleados.length === 0) {
            Swal.fire('Sin datos', 'No hay datos de poda.', 'warning');
            return;
        }

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

            if (data.movsPoda.length > 0) {
                const datos = procesarPodaParaTicket(nombre, data.movsPoda);
                datos.departamento = 'Poda';
                if (esSinSeguro) datos.sin_seguro_ticket = true;
                empleadosParaTickets.push(datos);
            }

            if (data.movsExtras.length > 0) {
                const datosExtra = procesarExtrasParaTicket(nombre, data.movsExtras, data.original);
                datosExtra.departamento = 'Poda';
                if (esSinSeguro) datosExtra.sin_seguro_ticket = true;
                empleadosParaTickets.push(datosExtra);
            }
        });

        if (empleadosParaTickets.length === 0) {
            Swal.fire('Sin datos', 'No hay tickets de poda válidos.', 'warning');
            return;
        }

        enviarDatosParaTickets({ empleados: empleadosParaTickets, meta: { numero_semana: jsonNominaPilar.numero_semana || '' } });
    }

    function generarTicketsNominaNormal() {
        let idDepto = parseInt($('#filtro_departamento').val() || '-1');
        let idPuesto = parseInt($('#filtro_puesto').val() || '-1');

        let datosFiltrados = filtrarEmpleadosPorDepartamento(jsonNominaPilar, idDepto);
        if (idPuesto !== -1) datosFiltrados = filtrarEmpleadosPorPuesto(datosFiltrados, idPuesto);

        datosFiltrados = filtrarNominaSoloVisibles(datosFiltrados);

        let total = 0;
        (datosFiltrados.departamentos || []).forEach(d => total += (d.empleados || []).length);

        if (total === 0) {
            Swal.fire('Sin datos', 'No hay empleados con los filtros actuales.', 'warning');
            return;
        }

        // Recalcular totales antes de enviar
        (datosFiltrados.departamentos || []).forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (typeof calcularTotalCobrar === 'function') {
                    calcularTotalCobrar(emp);
                }
            });
        });

        enviarDatosParaTickets({ nomina: datosFiltrados, meta: { numero_semana: jsonNominaPilar.numero_semana || '' } });
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
                    link.download = 'tickets_pilar.pdf';
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

function normalizarDiaNomina(dia) {
    if (!dia) return '';
    const d = String(dia).trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const alias = {
        dom: 'domingo', domingo: 'domingo',
        lun: 'lunes', lunes: 'lunes',
        mar: 'martes', martes: 'martes',
        mie: 'miercoles', miercoles: 'miercoles',
        jue: 'jueves', jueves: 'jueves',
        vie: 'viernes', viernes: 'viernes',
        sab: 'sabado', sabado: 'sabado'
    };
    return alias[d] || d;
}

function obtenerDiaSemanaDesdeFecha(fechaStr) {
    if (!fechaStr) return '';
    const s = String(fechaStr).trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        const [a, m, d] = s.split('-').map(Number);
        const date = new Date(a, m - 1, d);
        const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        return normalizarDiaNomina(dias[date.getDay()]);
    }

    if (s.includes('/')) {
        const meses = {
            Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4, Jun: 5,
            Jul: 6, Ago: 7, Sep: 8, Oct: 9, Nov: 10, Dic: 11
        };
        const partes = s.split('/');
        if (partes.length === 3) {
            const [dia, mesStr, anio] = partes;
            const mes = meses[mesStr];
            if (mes !== undefined) {
                const date = new Date(Number(anio), mes, Number(dia));
                const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
                return normalizarDiaNomina(dias[date.getDay()]);
            }
        }
    }

    return normalizarDiaNomina(s);
}

function procesarTicketsCorteCombinado(nombre, rejasArray, datoNomina) {
    let totalRejas = 0;
    let rejasConPrecio = [];
    let diasTrabajados = 0;
    let preciosPorDia = [];
    let diasConCorte = {};

    if (Array.isArray(rejasArray) && rejasArray.length > 0) {
        rejasArray.forEach(rInfo => {
            const t = rInfo.ticket;
            let cantidadTicket = 0;
            (t.datosRejas || []).forEach(tr => {
                cantidadTicket += Number(tr.cantidad || 0);
                totalRejas += Number(tr.cantidad || 0);
            });

            if (cantidadTicket > 0) {
                const diaSemana = obtenerDiaSemanaDesdeFecha(t.fecha);
                if (diaSemana) diasConCorte[diaSemana] = true;

                rejasConPrecio.push({
                    cantidad: cantidadTicket,
                    precio: rInfo.precio || 0
                });
            }
        });
    }

    const preciosUnicos = [];
    const preciosYaAgregados = new Set();
    rejasConPrecio.forEach(rp => {
        const precioStr = rp.precio.toString();
        if (!preciosYaAgregados.has(precioStr)) {
            preciosUnicos.push(rp.precio);
            preciosYaAgregados.add(precioStr);
        }
    });

    let efectivoRejas = 0;
    if (rejasConPrecio.length > 0) {
        rejasConPrecio.forEach(rp => {
            efectivoRejas += rp.cantidad * rp.precio;
        });
    }

    let totalNomina = 0;
    const hayDiasConCorte = Object.keys(diasConCorte).length > 0;
    if (datoNomina && Array.isArray(datoNomina)) {
        datoNomina.forEach(n => {
            const nombreDia = normalizarDiaNomina(n.dia);
            const pago = parseFloat(n.pago) || 0;
            const aplicaNomina = pago > 0 && (!hayDiasConCorte || diasConCorte[nombreDia]);

            if (aplicaNomina) {
                preciosPorDia.push(pago);
                totalNomina += pago;
                diasTrabajados++;
            }
        });
    }

    const subtotal = efectivoRejas + totalNomina;
    const totalEfectivo = Math.round(subtotal);
    const redondeo = totalEfectivo - subtotal;

    return {
        nombre,
        concepto: 'REJA_NOMINA',
        totalRejas,
        preciosUnicos,
        efectivoRejas,
        diasTrabajados,
        preciosPorDia,
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
    return obtenerDiaSemanaDesdeFecha(fechaStr);
}
