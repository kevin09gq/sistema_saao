// ticket_pdf.js - Ticket general para nómina Palmilla
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
        if (typeof jsonNominaPalmilla === 'undefined' || !jsonNominaPalmilla) {
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

        // Determinar qué vista está activa
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

        if (typeof jsonNominaPalmilla === 'undefined' || !jsonNominaPalmilla) {
            Swal.fire('Sin datos', 'No hay datos de nómina para generar el PDF.', 'warning');
            return;
        }

        // Obtener los datos filtrados actuales según el departamento y puesto seleccionados
        let id_departamento = parseInt($('#filtro_departamento').val() || '-1');
        let id_puestoEspecial = parseInt($('#filtro_puesto').val() || '-1');

        let datosFiltrados;
        let totalEmpleados = 0;

        // Manejo especial para departamentos de Corte y Poda en Palmilla
        if (id_departamento === 800) {
            // Corte
            let deptoCorte = (jsonNominaPalmilla.departamentos || []).find(d => d.nombre === 'Corte');
            datosFiltrados = {
                departamentos: deptoCorte ? [{
                    nombre: 'Corte',
                    empleados: deptoCorte.empleados || []
                }] : []
            };
        } else if (id_departamento === 801) {
            // Poda
            let deptoPoda = (jsonNominaPalmilla.departamentos || []).find(d => d.nombre === 'Poda');
            datosFiltrados = {
                departamentos: deptoPoda ? [{
                    nombre: 'Poda',
                    empleados: deptoPoda.empleados || []
                }] : []
            };
        } else {
            // Aplicar los mismos filtros que se usan para mostrar la tabla
            datosFiltrados = filtrarEmpleadosPorDepartamento(jsonNominaPalmilla, id_departamento);
            if (id_puestoEspecial !== -1) {
                datosFiltrados = filtrarEmpleadosPorPuesto(datosFiltrados, id_puestoEspecial);
            }
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

        totalEmpleados = nominaConsolidada.departamentos[0].empleados.length;

        if (totalEmpleados === 0) {
            Swal.fire('Sin datos', 'No hay empleados para los filtros seleccionados.', 'warning');
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

        var datosEnviar = {
            nomina: nominaConsolidada,
            meta: {
                numero_semana: jsonNominaPalmilla.numero_semana || ''
            }
        };

        $('#btn_ticket_pdf').prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Generando...');

        $.ajax({
            url: '../php/descargar_ticket_nombre_pdf.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datosEnviar),
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob, status, xhr) {
                if (!(blob instanceof Blob)) {
                    Swal.fire('Error', 'El servidor no devolvió un archivo PDF válido.', 'error');
                    $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
                    return;
                }
                if (blob.size === 0) {
                    Swal.fire('Error', 'Archivo PDF vacío.', 'error');
                    $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
                    return;
                }
                var filename = 'tickets_nombre_palmilla.pdf';
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('filename=') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/["']/g, '');
                    }
                }
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
            },
            error: function () {
                Swal.fire('Error', 'Error al generar el PDF. Por favor, intenta nuevamente.', 'error');
                $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
            }
        });
    });

    /**
     * Determina qué vista está activa basándose en las tablas visibles
     */
    function determinarVistaActiva() {
        if ($('#tabla-nomina-corte').is(':visible')) {
            return 'corte';
        } else if ($('#tabla_poda').is(':visible')) {
            return 'poda';
        } else {
            return 'nomina';
        }
    }

    /**
     * Genera tickets para la vista de cortes
     */
    function generarTicketsCorte() {
        let deptoCorte = (jsonNominaPalmilla.departamentos || []).find(d => d.nombre.toUpperCase() === 'CORTE');
        if (!deptoCorte || !deptoCorte.empleados || deptoCorte.empleados.length === 0) {
            Swal.fire('Sin datos', 'No hay datos de corte para generar tickets.', 'warning');
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
            Swal.fire('Sin datos', 'No hay datos válidos para generar tickets de corte.', 'warning');
            return;
        }

        Swal.fire({
            title: 'Generando tickets de corte',
            html: `Procesando <strong>${empleadosParaTickets.length}</strong> tickets de corte...`,
            icon: 'info',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
        });

        enviarDatosParaTickets({
            empleados: empleadosParaTickets,
            meta: { numero_semana: jsonNominaPalmilla.numero_semana || '' }
        }, 'corte');
    }

    function generarTicketsPoda() {
        let deptoPoda = (jsonNominaPalmilla.departamentos || []).find(d => d.nombre.toUpperCase() === 'PODA');
        if (!deptoPoda || !deptoPoda.empleados || deptoPoda.empleados.length === 0) {
            Swal.fire('Sin datos', 'No hay datos de poda para generar tickets.', 'warning');
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
            Swal.fire('Sin datos', 'No hay datos válidos para generar tickets de poda.', 'warning');
            return;
        }

        Swal.fire({
            title: 'Generando tickets de poda',
            html: `Procesando <strong>${empleadosParaTickets.length}</strong> tickets de poda...`,
            icon: 'info',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
        });

        enviarDatosParaTickets({
            empleados: empleadosParaTickets,
            meta: { numero_semana: jsonNominaPalmilla.numero_semana || '' }
        }, 'poda');
    }

    /**
     * Genera tickets para la nómina normal
     */
    function generarTicketsNominaNormal() {
        // Obtener los datos filtrados actuales según el departamento y puesto seleccionados
        let id_departamento = parseInt($('#filtro_departamento').val() || '-1');
        let id_puestoEspecial = parseInt($('#filtro_puesto').val() || '-1');

        // Aplicar los mismos filtros que se usan para mostrar la tabla
        let datosFiltrados = filtrarEmpleadosPorDepartamento(jsonNominaPalmilla, id_departamento);
        if (id_puestoEspecial !== -1) {
            datosFiltrados = filtrarEmpleadosPorPuesto(datosFiltrados, id_puestoEspecial);
        }

        datosFiltrados = filtrarNominaSoloVisibles(datosFiltrados);

        // Verificar si hay empleados después de aplicar los filtros
        let totalEmpleados = 0;
        (datosFiltrados.departamentos || []).forEach(depto => {
            totalEmpleados += (depto.empleados || []).length;
        });

        if (totalEmpleados === 0) {
            Swal.fire('Sin datos', 'No hay empleados para los filtros seleccionados.', 'warning');
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

        // Mostrar mensaje informativo
        let nombreDepartamento = $('#filtro_departamento option:selected').text();
        let nombrePuesto = $('#filtro_puesto').val() === '-1' ? 'Todos los puestos' : $('#filtro_puesto option:selected').text();

        Swal.fire({
            title: 'Generando tickets',
            html: `Departamento: <strong>${nombreDepartamento}</strong><br>Puesto: <strong>${nombrePuesto}</strong><br>Empleados: <strong>${totalEmpleados}</strong>`,
            icon: 'info',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
        });

        var datosEnviar = {
            nomina: datosFiltrados,
            meta: {
                numero_semana: jsonNominaPalmilla.numero_semana || ''
            }
        };

        enviarDatosParaTickets(datosEnviar, 'nomina');
    }

    /**
     * Envía los datos al servidor para generar los PDF
     */
    function enviarDatosParaTickets(datos, tipo) {
        $('#btn_ticket_pdf').prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Generando...');

        $.ajax({
            url: '../php/descargar_ticket_pdf.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datos),
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob, status, xhr) {
                if (!(blob instanceof Blob)) {
                    Swal.fire('Error', 'El servidor no devolvió un archivo PDF válido.', 'error');
                    $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
                    return;
                }
                if (blob.size === 0) {
                    Swal.fire('Error', 'Archivo PDF vacío.', 'error');
                    $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
                    return;
                }
                var filename = `tickets_palmilla.pdf`;
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('filename=') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/["']/g, '');
                    }
                }
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');

                Swal.fire({
                    icon: 'success',
                    title: 'Tickets generados',
                    text: `Los tickets de ${tipo} se han descargado correctamente.`,
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            error: function () {
                Swal.fire('Error', 'Error al generar el PDF. Por favor, intenta nuevamente.', 'error');
                $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
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
    rejasConPrecio.forEach(rp => {
        efectivoRejas += rp.cantidad * rp.precio;
    });

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

function procesarPodaParaTicket(nombre, movs) {
    const arb = { viernes: 0, sabado: 0, domingo: 0, lunes: 0, martes: 0, miercoles: 0, jueves: 0 };
    let totalArboles = 0;
    let totalEfectivo = 0;
    const desglosesMap = {};

    (movs || []).forEach(m => {
        const dia = obtenerDiaSemanaDesdeFecha(m.fecha);
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
