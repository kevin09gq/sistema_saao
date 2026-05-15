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

        let total = 0;
        (datosFiltrados.departamentos || []).forEach(d => total += (d.empleados || []).length);

        if (total === 0) {
            Swal.fire('Sin datos', 'No hay empleados con los filtros actuales.', 'warning');
            return;
        }

        enviarDatosParaTicketsNombre({ nomina: datosFiltrados });
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

        let empleadosParaTickets = [];
        deptoCorte.empleados.forEach(emp => {
            if (!emp || emp.mostrar === false) return;
            const esSinSeguro = (emp.seguroSocial === false) || deptoCorte.nombre.toUpperCase().includes('SIN SEGURO');
            if (emp.concepto === 'REJA' && Array.isArray(emp.tickets)) {
                const porPrecio = {};
                emp.tickets.forEach(t => {
                    const p = (t.precio_reja ?? 0).toString();
                    if (!porPrecio[p]) porPrecio[p] = [];
                    porPrecio[p].push(t);
                });
                Object.keys(porPrecio).forEach(p => {
                    const datos = procesarTicketsParaCorte(emp.nombre, porPrecio[p], parseFloat(p));
                    datos.departamento = 'Corte';
                    if (esSinSeguro) datos.sin_seguro_ticket = true;
                    empleadosParaTickets.push(datos);
                });
            } else if (emp.concepto === 'NOMINA' && Array.isArray(emp.nomina)) {
                const datos = procesarNominaParaCorte(emp.nombre, emp.nomina);
                datos.departamento = 'Corte';
                if (esSinSeguro) datos.sin_seguro_ticket = true;
                empleadosParaTickets.push(datos);
            }
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

        let empleadosParaTickets = [];
        deptoPoda.empleados.forEach(emp => {
            if (!emp || emp.mostrar === false) return;
            const esSinSeguro = (emp.seguroSocial === false) || deptoPoda.nombre.toUpperCase().includes('SIN SEGURO');
            const movs = Array.isArray(emp.movimientos) ? emp.movimientos : [];
            const movsPoda = movs.filter(m => m.concepto === 'PODA');
            const porMonto = {};
            movsPoda.forEach(m => {
                if (!porMonto[m.monto]) porMonto[m.monto] = [];
                porMonto[m.monto].push(m);
            });
            Object.keys(porMonto).forEach(m => {
                const datos = procesarPodaParaTicket(emp.nombre, porMonto[m], parseFloat(m));
                datos.departamento = 'Poda';
                if (esSinSeguro) datos.sin_seguro_ticket = true;
                empleadosParaTickets.push(datos);
            });
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

    function procesarPodaParaTicket(nombre, movs, monto) {
        const arb = { viernes: 0, sabado: 0, domingo: 0, lunes: 0, martes: 0, miercoles: 0, jueves: 0 };
        let total = 0;
        (movs || []).forEach(m => {
            const dia = obtenerDiaSemana(m.fecha);
            const cant = Number(m.arboles_podados || 0);
            if (arb.hasOwnProperty(dia)) arb[dia] += cant;
            total += cant;
        });
        return { nombre, concepto: 'PODA', ...arb, totalArboles: total, monto, totalEfectivo: total * monto };
    }

    function obtenerDiaSemana(fechaStr) {
        if (!fechaStr) return '';
        const [a, m, d] = fechaStr.split('-').map(Number);
        const date = new Date(a, m - 1, d);
        return ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][date.getDay()];
    }
});
