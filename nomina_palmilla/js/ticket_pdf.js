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
        totalEmpleados = 0;
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

        var datosEnviar = {
            nomina: datosFiltrados,
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
        let departamentoCorte = jsonNominaPalmilla.departamentos.find(d => d.nombre === "Corte");

        if (!departamentoCorte || !departamentoCorte.empleados || departamentoCorte.empleados.length === 0) {
            Swal.fire('Sin datos', 'No hay datos de corte para generar tickets.', 'warning');
            return;
        }

        // Procesar empleados para el formato de tickets
        let empleadosParaTickets = [];

        departamentoCorte.empleados.forEach(empleado => {
            if (!empleado || empleado.mostrar === false) return;
            const esSinSeguro = (empleado.seguroSocial === false) || departamentoCorte.nombre.toUpperCase().includes('SIN SEGURO');
            if (empleado.concepto === "REJA") {
                // Agrupar tickets por precio
                const ticketsPorPrecio = {};
                (empleado.tickets || []).forEach(ticket => {
                    const precio = (ticket.precio_reja ?? 0).toString();
                    if (!ticketsPorPrecio[precio]) {
                        ticketsPorPrecio[precio] = [];
                    }
                    ticketsPorPrecio[precio].push(ticket);
                });

                // Crear un ticket por cada grupo de precio
                Object.keys(ticketsPorPrecio).forEach(precio => {
                    const tickets = ticketsPorPrecio[precio];
                    const datosTicket = procesarTicketsParaCorte(empleado.nombre, tickets, parseFloat(precio));
                    if (esSinSeguro) datosTicket.sin_seguro_ticket = true;
                    empleadosParaTickets.push(datosTicket);
                });
            } else if (empleado.concepto === "NOMINA") {
                // Procesar nómina de corte
                const datosTicket = procesarNominaParaCorte(empleado.nombre, empleado.nomina || []);
                if (esSinSeguro) datosTicket.sin_seguro_ticket = true;
                empleadosParaTickets.push(datosTicket);
            }
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

        const datosConMeta = {
            empleados: empleadosParaTickets,
            meta: {
                numero_semana: jsonNominaPalmilla.numero_semana || ''
            }
        };
        enviarDatosParaTickets(datosConMeta, 'corte');
    }

    /**
     * Genera tickets para la vista de podas
     */
    function generarTicketsPoda() {
        let departamentoPoda = jsonNominaPalmilla.departamentos.find(d => d.nombre === "Poda");

        if (!departamentoPoda || !departamentoPoda.empleados || departamentoPoda.empleados.length === 0) {
            Swal.fire('Sin datos', 'No hay datos de poda para generar tickets.', 'warning');
            return;
        }

        // Procesar empleados para el formato de tickets
        let empleadosParaTickets = [];

        departamentoPoda.empleados.forEach(emp => {
            if (!emp || emp.mostrar === false) return;
            const esSinSeguro = (emp.seguroSocial === false) || departamentoPoda.nombre.toUpperCase().includes('SIN SEGURO');

            const movimientos = Array.isArray(emp.movimientos) ? emp.movimientos : [];
            const movimientosPoda = movimientos.filter(m => m.concepto === "PODA");
            const movimientosExtras = movimientos.filter(m => m.concepto !== "PODA");

            // Agrupar movimientos de PODA por monto
            const gruposPoda = {};
            movimientosPoda.forEach(mov => {
                const monto = mov.monto;
                if (!gruposPoda[monto]) {
                    gruposPoda[monto] = [];
                }
                gruposPoda[monto].push(mov);
            });

            // Crear un ticket por cada grupo de monto de PODA
            Object.keys(gruposPoda).forEach(monto => {
                const movimientos = gruposPoda[monto];
                const datosTicket = procesarPodaParaTicket(emp.nombre, movimientos, parseFloat(monto));
                if (esSinSeguro) datosTicket.sin_seguro_ticket = true;
                empleadosParaTickets.push(datosTicket);
            });

            // Agrupar movimientos extras por concepto y monto
            const gruposExtras = {};
            movimientosExtras.forEach(mov => {
                const clave = `${mov.concepto}|${mov.monto}`;
                if (!gruposExtras[clave]) {
                    gruposExtras[clave] = [];
                }
                gruposExtras[clave].push(mov);
            });

            // Crear un ticket por cada grupo extra
            Object.values(gruposExtras).forEach(grupo => {
                if (grupo.length > 0) {
                    const datosTicket = procesarExtraParaTicket(emp.nombre, grupo[0].concepto, grupo, grupo[0].monto);
                    if (esSinSeguro) datosTicket.sin_seguro_ticket = true;
                    empleadosParaTickets.push(datosTicket);
                }
            });
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

        const datosConMeta = {
            empleados: empleadosParaTickets,
            meta: {
                numero_semana: jsonNominaPalmilla.numero_semana || ''
            }
        };
        enviarDatosParaTickets(datosConMeta, 'poda');
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

    /**
     * Procesa los tickets de un empleado para corte
     */
    function procesarTicketsParaCorte(nombreEmpleado, tickets, precio) {
        const rejasPorDia = {
            'viernes': 0, 'sabado': 0, 'domingo': 0,
            'lunes': 0, 'martes': 0, 'miercoles': 0, 'jueves': 0
        };

        let totalRejas = 0;
        let todasLasTablas = [];

        (tickets || []).forEach(ticket => {
            const diaSemana = obtenerDiaSemana(ticket.fecha);

            // Agregar todas las tablas de este ticket
            (ticket.datosRejas || []).forEach(tabla => {
                todasLasTablas.push({
                    tabla: tabla.tabla,
                    cantidad: tabla.cantidad
                });

                // Acumular para el total por día
                if (rejasPorDia.hasOwnProperty(diaSemana.toLowerCase())) {
                    rejasPorDia[diaSemana.toLowerCase()] += tabla.cantidad;
                }
                totalRejas += tabla.cantidad;
            });
        });

        return {
            nombre: nombreEmpleado,
            concepto: 'REJA',
            ...rejasPorDia,
            totalRejas: totalRejas,
            precio: precio,
            totalEfectivo: totalRejas * precio,
            tablas: todasLasTablas
        };
    }

    /**
     * Procesa la nómina de un empleado para corte
     */
    function procesarNominaParaCorte(nombreEmpleado, nomina) {
        const pagosPorDia = {
            'viernes': 0, 'sabado': 0, 'domingo': 0,
            'lunes': 0, 'martes': 0, 'miercoles': 0, 'jueves': 0
        };

        let totalEfectivo = 0;

        (nomina || []).forEach(diaPago => {
            const dia = String(diaPago.dia || '').toLowerCase();
            const pago = parseFloat(diaPago.pago) || 0;

            if (pagosPorDia.hasOwnProperty(dia)) {
                pagosPorDia[dia] = pago;
            }
            totalEfectivo += pago;
        });

        return {
            nombre: nombreEmpleado,
            concepto: 'NOMINA',
            ...pagosPorDia,
            totalRejas: 0,
            precio: 0,
            totalEfectivo: totalEfectivo
        };
    }

    /**
     * Procesa los movimientos de poda para ticket
     */
    function procesarPodaParaTicket(nombreEmpleado, movimientos, monto) {
        const arbolesPorDia = {
            'viernes': 0, 'sabado': 0, 'domingo': 0,
            'lunes': 0, 'martes': 0, 'miercoles': 0, 'jueves': 0
        };

        let totalArboles = 0;

        (movimientos || []).forEach(mov => {
            const diaSemana = obtenerDiaSemana(mov.fecha);

            if (arbolesPorDia.hasOwnProperty(diaSemana.toLowerCase())) {
                arbolesPorDia[diaSemana.toLowerCase()] += mov.arboles_podados || 0;
            }
            totalArboles += mov.arboles_podados || 0;
        });

        return {
            nombre: nombreEmpleado,
            concepto: 'PODA',
            ...arbolesPorDia,
            totalArboles: totalArboles,
            monto: monto,
            totalEfectivo: totalArboles * monto
        };
    }

    /**
     * Procesa movimientos extras para ticket
     */
    function procesarExtraParaTicket(nombreEmpleado, concepto, movimientos, monto) {
        const montosPorDia = {
            'viernes': 0, 'sabado': 0, 'domingo': 0,
            'lunes': 0, 'martes': 0, 'miercoles': 0, 'jueves': 0
        };

        let totalEfectivo = 0;

        (movimientos || []).forEach(mov => {
            const diaSemana = obtenerDiaSemana(mov.fecha);

            if (montosPorDia.hasOwnProperty(diaSemana.toLowerCase())) {
                montosPorDia[diaSemana.toLowerCase()] += mov.monto || 0;
            }
            totalEfectivo += mov.monto || 0;
        });

        return {
            nombre: nombreEmpleado,
            concepto: concepto,
            ...montosPorDia,
            totalArboles: 0,
            monto: monto,
            totalEfectivo: totalEfectivo
        };
    }

    /**
     * Función para obtener el día de la semana a partir de una fecha
     */
    function obtenerDiaSemana(fechaStr) {
        const [año, mes, dia] = String(fechaStr || '').split('-').map(Number);
        let fecha = new Date(año, mes - 1, dia);

        const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
        return dias[fecha.getDay()];
    }
});
