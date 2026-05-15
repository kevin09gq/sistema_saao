/**
 * ================================================================
 * MÓDULO DE SELECCIÓN DE EMPLEADOS PARA TICKETS - NÓMINA HUASTECA
 * ================================================================
 * Maneja la selección manual de empleados para generar tickets PDF
 * ================================================================
 */

// Variables globales para el modal de selección
let empleadosParaTickets = [];
let empleadosSeleccionados = new Set();

// Inicializar eventos cuando el DOM esté listo
$(document).ready(function() {
    // Evento para abrir modal de selección de empleados
    $('#btn_ticket_seleccion').on('click', function() {
        // PRIORIZAR la variable global que ya está en memoria y actualizada
        // Intentar obtenerla directamente (no desde window ya que let no se adjunta a window)
        let nominaData = null;
        try {
            if (typeof jsonNominaHuasteca !== 'undefined' && jsonNominaHuasteca) {
                nominaData = jsonNominaHuasteca;
            }
        } catch (e) {
            console.log("jsonNominaHuasteca no definida globalmente todavía");
        }
        
        // Si por alguna razón no está en memoria, intentar cargar de localStorage
        if (!nominaData || !nominaData.departamentos) {
            nominaData = JSON.parse(localStorage.getItem('jsonNominaHuasteca') || '{}');
            if (nominaData && nominaData.departamentos && typeof jsonNominaHuasteca !== 'undefined') {
                // Sincronizar si es posible
                try { jsonNominaHuasteca = nominaData; } catch(e){}
            }
        }

        if (!nominaData || !nominaData.departamentos) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin datos',
                text: 'No hay datos de nómina cargados. Primero procesa los archivos.'
            });
            return;
        }
        
        filtroSeguroActivoHuasteca = 'todos';
        actualizarEstilosFiltrosHuasteca();
        // Limpiar el campo de búsqueda antes de abrir el modal
        $('#buscar_empleado_ticket').val('');
        
        cargarEmpleadosParaTickets(nominaData);
        $('#modal_seleccion_tickets').modal('show');
    });

    // Accesibilidad: forzar aria-hidden correcto en el modal
    $('#modal_seleccion_tickets').on('shown.bs.modal', function () {
        $(this).attr('aria-hidden', 'false');
    });
    $('#modal_seleccion_tickets').on('hidden.bs.modal', function () {
        $(this).attr('aria-hidden', 'true');
    });

    // Eventos del modal - usar delegación de eventos para elementos dinámicos
    $('#btn_seleccionar_todos_tickets').on('click', function() {
        filtroSeguroActivoHuasteca = 'todos';
        actualizarEstilosFiltrosHuasteca();
        $('#buscar_empleado_ticket').trigger('input');
    });

    $('#btn_seleccionar_con_seguro_tickets').on('click', function() {
        filtroSeguroActivoHuasteca = 'con_seguro';
        actualizarEstilosFiltrosHuasteca();
        $('#buscar_empleado_ticket').trigger('input');
    });

    $('#btn_seleccionar_sin_seguro_tickets').on('click', function() {
        filtroSeguroActivoHuasteca = 'sin_seguro';
        actualizarEstilosFiltrosHuasteca();
        $('#buscar_empleado_ticket').trigger('input');
    });

    $('#btn_marcar_visibles_tickets').on('click', function() {
        const query = $('#buscar_empleado_ticket').val().toLowerCase().trim();
        empleadosParaTickets.forEach(emp => {
            const nombre = (emp.nombre || '').toLowerCase();
            const clave = String(emp.clave || emp.id || '');
            const depto = (emp.departamento || '').toLowerCase();
            
            // Filtro por texto
            const coincideQuery = query === '' || nombre.includes(query) || clave.includes(query) || depto.includes(query);
            
            // Filtro por seguro
            let coincideSeguro = true;
            if (filtroSeguroActivoHuasteca === 'con_seguro') coincideSeguro = !emp.esSinSeguro;
            else if (filtroSeguroActivoHuasteca === 'sin_seguro') coincideSeguro = emp.esSinSeguro;

            if (coincideQuery && coincideSeguro) {
                empleadosSeleccionados.add(String(emp.clave || emp.id));
            }
        });
        actualizarVistaSeleccion();
    });

    $('#btn_deseleccionar_todos_tickets').on('click', deseleccionarTodosEmpleados);
    $(document).on('input', '#buscar_empleado_ticket', filtrarEmpleados);
    $('#btn_generar_tickets_seleccionados').on('click', generarTicketsSeleccionados);
    $('#btn_generar_tickets_nombre_seleccionados').on('click', generarTicketsNombreSeleccionados);
    $(document).on('click', '#btn_limpiar_busqueda', limpiarCampoBusqueda);

    // Evento para seleccionar empleado individual
    $(document).on('click', '.empleado-item', function(e) {
        // Evitar que el click en el checkbox dispare el evento dos veces
        if ($(e.target).is('input[type="checkbox"]')) {
            return;
        }
        
        const clave = String($(this).data('clave')); // Normalizar como string
        const checkbox = $(this).find('input[type="checkbox"]');
        
        if (empleadosSeleccionados.has(clave)) {
            empleadosSeleccionados.delete(clave);
            $(this).removeClass('active');
            checkbox.prop('checked', false);
        } else {
            empleadosSeleccionados.add(clave);
            $(this).addClass('active');
            checkbox.prop('checked', true);
        }
        
        actualizarContadores();
    });
    
    // Evento para el checkbox directamente
    $(document).on('change', '.empleado-item input[type="checkbox"]', function() {
        const listItem = $(this).closest('.list-group-item');
        const clave = String(listItem.data('clave'));
        
        if ($(this).is(':checked')) {
            empleadosSeleccionados.add(clave);
            listItem.addClass('active');
        } else {
            empleadosSeleccionados.delete(clave);
            listItem.removeClass('active');
        }
        
        actualizarContadores();
    });
});

/**
 * Carga todos los empleados de nómina huasteca
 */
function cargarEmpleadosParaTickets(nominaData) {
    empleadosParaTickets = [];
    empleadosSeleccionados.clear();
    
    if (!nominaData || !nominaData.departamentos) {
        return;
    }

    // Procesar todos los departamentos de nómina huasteca
    nominaData.departamentos.forEach(depto => {
        const nombreDepto = depto.nombre || '';
        if (depto.empleados && Array.isArray(depto.empleados)) {
            depto.empleados.forEach(emp => {
                if (emp && typeof emp === 'object') {
                    if (emp.mostrar === false) return;
                    // Generar una clave única determinista si no tiene una
                    const claveUnica = emp.clave || `manual_${nombreDepto}_${emp.nombre}`.replace(/\s+/g, '_');
                    const esSinSeguro = (emp?.seguroSocial === false) || nombreDepto.toLowerCase().includes('sin seguro');
                    
                    empleadosParaTickets.push({
                        original: emp, 
                        clave: claveUnica,
                        nombre: emp.nombre,
                        departamento: nombreDepto,
                        tipo: 'huasteca',
                        esSinSeguro: esSinSeguro
                    });
                }
            });
        }
    });

    // Ordenar: primero con seguro (esSinSeguro = false), luego sin seguro (esSinSeguro = true)
    empleadosParaTickets.sort((a, b) => {
        if (a.esSinSeguro === b.esSinSeguro) {
            return String(a.nombre || '').localeCompare(String(b.nombre || ''));
        }
        return a.esSinSeguro ? 1 : -1;
    });

    mostrarEmpleados(empleadosParaTickets);
}

/**
 * Mostrar empleados en el modal
 */
function mostrarEmpleados(empleados) {
    const container = $('#lista_empleados_tickets');
    container.empty();
    
    if (!empleados || empleados.length === 0) {
        container.html('<div class="col-12"><div class="alert alert-info text-center">No se encontraron empleados</div></div>');
        return;
    }
    
    // Crear lista simple en lugar de tarjetas
    const listaHtml = `
        <div class="list-group">
            ${empleados.map(empleado => {
                // Usar la clave ya calculada en cargarEmpleadosParaTickets
                const clave = String(empleado.clave);
                const nombre = empleado.nombre || 'Sin nombre';
                const departamento = empleado.departamento || 'Sin departamento';
                    
                // Determinar la clase del badge según el departamento específico de Huasteca
                let badgeClass = 'bg-secondary'; // Color por defecto
                const deptoLower = departamento.toLowerCase();
                    
                // Departamentos específicos con colores únicos
                if (deptoLower.includes('jornalero') || deptoLower.includes('jornal')) {
                    badgeClass = 'bg-success';
                } else if (deptoLower.includes('coordinador') || deptoLower.includes('coordi')) {
                    badgeClass = 'bg-primary';
                } else if (deptoLower.includes('vivero') || deptoLower.includes('vive')) {
                    badgeClass = 'bg-warning text-dark';
                } else if (deptoLower.includes('rancho') || deptoLower.includes('ranch')) {
                    badgeClass = 'bg-danger';
                } else if (deptoLower.includes('apoyo') || deptoLower.includes('apoy')) {
                    badgeClass = 'bg-info';
                } else if (deptoLower.includes('base') || deptoLower.includes('bas')) {
                    badgeClass = 'bg-dark';
                } else if (deptoLower.includes('administracion') || deptoLower.includes('admin')) {
                    badgeClass = 'bg-primary';
                } else if (deptoLower.includes('produccion') || deptoLower.includes('produc')) {
                    badgeClass = 'bg-warning text-dark';
                } else if (deptoLower.includes('seguridad') || deptoLower.includes('vigilancia') || deptoLower.includes('intendencia')) {
                    badgeClass = 'bg-purple';
                } else if (deptoLower.includes('sin seguro') || deptoLower.includes('sin')) {
                    badgeClass = 'bg-orange';
                }
                    
                const isSelected = empleadosSeleccionados.has(clave);
                const itemClass = isSelected ? 'list-group-item list-group-item-action active d-flex justify-content-between align-items-center' : 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
                    
                return `
                    <div class="${itemClass} empleado-item" data-clave="${clave}" data-nombre="${nombre.toLowerCase()}" style="cursor: pointer;">
                        <div>
                            <div class="fw-bold">${nombre}</div>
                            <small class="text-muted">Clave: ${clave}</small>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge ${badgeClass} rounded-pill">${departamento}</span>
                            <input class="form-check-input" type="checkbox" ${isSelected ? 'checked' : ''}>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
        
    container.html(listaHtml);
}

/**
 * Filtrar empleados en tiempo real
 */
let filtroSeguroActivoHuasteca = 'todos';

function filtrarEmpleados() {
    const query = String($(this).val() || '').toLowerCase().trim();
    
    // Mostrar/ocultar el botón de limpiar
    if (query !== '') {
        $('#btn_limpiar_busqueda').css('display', 'flex');
    } else {
        $('#btn_limpiar_busqueda').hide();
    }
    
    const filtrados = empleadosParaTickets.filter(emp => {
        // Filtro por texto
        const nombre = (emp.nombre || '').toLowerCase();
        const clave = String(emp.clave || emp.id || '');
        const depto = (emp.departamento || '').toLowerCase();
        const coincideQuery = query === '' || nombre.includes(query) || clave.includes(query) || depto.includes(query);
        
        // Filtro por seguro
        let coincideSeguro = true;
        if (filtroSeguroActivoHuasteca === 'con_seguro') coincideSeguro = !emp.esSinSeguro;
        else if (filtroSeguroActivoHuasteca === 'sin_seguro') coincideSeguro = emp.esSinSeguro;

        return coincideQuery && coincideSeguro;
    });
    
    mostrarEmpleados(filtrados);
}

function actualizarEstilosFiltrosHuasteca() {
    $('#btn_seleccionar_todos_tickets').toggleClass('active', filtroSeguroActivoHuasteca === 'todos');
    $('#btn_seleccionar_con_seguro_tickets').toggleClass('active', filtroSeguroActivoHuasteca === 'con_seguro');
    $('#btn_seleccionar_sin_seguro_tickets').toggleClass('active', filtroSeguroActivoHuasteca === 'sin_seguro');
}

/**
 * Seleccionar todos los empleados visibles
 */
function seleccionarTodosEmpleados() {
    // Si hay búsqueda activa, seleccionar solo los visibles
    const query = $('#buscar_empleado_ticket').val().toLowerCase().trim();
    
    if (query === '') {
        empleadosParaTickets.forEach(emp => {
            empleadosSeleccionados.add(String(emp.clave || emp.id));
        });
    } else {
        empleadosParaTickets.forEach(emp => {
            const nombre = (emp.nombre || '').toLowerCase();
            const clave = String(emp.clave || emp.id || '');
            const depto = (emp.departamento || '').toLowerCase();
            
            if (nombre.includes(query) || clave.includes(query) || depto.includes(query)) {
                empleadosSeleccionados.add(String(emp.clave || emp.id));
            }
        });
    }
    
    actualizarVistaSeleccion();
}

/**
 * Deseleccionar todos los empleados visibles
 */
function deseleccionarTodosEmpleados() {
    const query = $('#buscar_empleado_ticket').val().toLowerCase().trim();
    
    if (query === '') {
        empleadosSeleccionados.clear();
    } else {
        empleadosParaTickets.forEach(emp => {
            const nombre = (emp.nombre || '').toLowerCase();
            const clave = String(emp.clave || emp.id || '');
            const depto = (emp.departamento || '').toLowerCase();
            
            if (nombre.includes(query) || clave.includes(query) || depto.includes(query)) {
                empleadosSeleccionados.delete(String(emp.clave || emp.id));
            }
        });
    }
    
    actualizarVistaSeleccion();
}

/**
 * Actualiza la vista según el Set de seleccionados
 */
function actualizarVistaSeleccion() {
    $('.empleado-item').each(function() {
        const clave = String($(this).data('clave'));
        const checkbox = $(this).find('input[type="checkbox"]');
        
        if (empleadosSeleccionados.has(clave)) {
            $(this).addClass('active');
            checkbox.prop('checked', true);
        } else {
            $(this).removeClass('active');
            checkbox.prop('checked', false);
        }
    });
    
    actualizarContadores();
}

/**
 * Actualizar contadores de selección
 */
function actualizarContadores() {
    const total = empleadosSeleccionados.size;
    $('#contador_seleccionados').text(total);
    $('#contador_seleccionados_btn').text(total);
}

/**
 * Limpiar campo de búsqueda
 */
function limpiarCampoBusqueda() {
    $('#buscar_empleado_ticket').val('').trigger('input');
    $(this).hide();
}

/**
 * Generar tickets para empleados seleccionados
 */
function generarTicketsSeleccionados() {
    if (empleadosSeleccionados.size === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin selección',
            text: 'Por favor, selecciona al menos un empleado para generar tickets.'
        });
        return;
    }
    
    // Intentar obtener la variable global más reciente
    let nominaData = null;
    try {
        if (typeof jsonNominaHuasteca !== 'undefined' && jsonNominaHuasteca) {
            nominaData = jsonNominaHuasteca;
        }
    } catch (e) {}
    
    if (!nominaData) {
        nominaData = JSON.parse(localStorage.getItem('jsonNominaHuasteca') || '{}');
    }

    const seleccionados = [];
    console.log("Iniciando generación de tickets seleccionados...");
    console.log("IDs seleccionados:", Array.from(empleadosSeleccionados));
    
    // Obtener los datos más recientes de los empleados seleccionados
    empleadosParaTickets.forEach(item => {
        const clave = String(item.clave);
        if (empleadosSeleccionados.has(clave)) {
            console.log("Procesando empleado:", item.nombre, "de", item.departamento);
            const empOriginal = item.original;
            if (empOriginal) {
                if (empOriginal.mostrar === false) return;
                // Si es un empleado de Corte o Poda, procesar sus tickets/movimientos
                if (item.departamento === "Corte") {
                    if (empOriginal.concepto === "REJA" && empOriginal.tickets) {
                        console.log("  Es concepto REJA con", empOriginal.tickets.length, "tickets");
                        const ticketsPorPrecio = agruparTicketsPorPrecio(empOriginal.tickets);
                        Object.keys(ticketsPorPrecio).forEach(precio => {
                            const tickets = ticketsPorPrecio[precio];
                            const datosTicket = procesarTicketsParaCorte(empOriginal.nombre, tickets, parseFloat(precio));
                            datosTicket.departamento = "Corte";
                            seleccionados.push(datosTicket);
                        });
                    } else if (empOriginal.concepto === "NOMINA" && empOriginal.nomina) {
                        console.log("  Es concepto NOMINA");
                        const datosTicket = procesarNominaParaCorte(empOriginal.nombre, empOriginal.nomina);
                        datosTicket.departamento = "Corte";
                        seleccionados.push(datosTicket);
                    } else {
                        console.log("  Empleado de corte sin datos específicos, enviando original");
                        const empClon = {...empOriginal, departamento: item.departamento};
                        seleccionados.push(empClon);
                    }
                } else if (item.departamento === "Poda" && empOriginal.movimientos) {
                    console.log("  Es departamento Poda con", empOriginal.movimientos.length, "movimientos");
                    const movimientosPoda = empOriginal.movimientos.filter(m => m.concepto === "PODA");
                    const gruposPoda = {};
                    movimientosPoda.forEach(mov => {
                        const monto = mov.monto;
                        if (!gruposPoda[monto]) gruposPoda[monto] = [];
                        gruposPoda[monto].push(mov);
                    });

                    Object.keys(gruposPoda).forEach(monto => {
                        const datosTicket = procesarPodaParaTicket(empOriginal.nombre, gruposPoda[monto], parseFloat(monto));
                        datosTicket.departamento = "Poda";
                        seleccionados.push(datosTicket);
                    });

                    // También procesar extras de poda
                    const movimientosExtras = empOriginal.movimientos.filter(m => m.concepto !== "PODA");
                    const gruposExtras = {};
                    movimientosExtras.forEach(mov => {
                        const claveExtra = `${mov.concepto}|${mov.monto}`;
                        if (!gruposExtras[claveExtra]) gruposExtras[claveExtra] = [];
                        gruposExtras[claveExtra].push(mov);
                    });

                    Object.values(gruposExtras).forEach(grupo => {
                        if (grupo.length > 0) {
                            const datosTicket = procesarExtraParaTicket(empOriginal.nombre, grupo[0].concepto, grupo, grupo[0].monto);
                            datosTicket.departamento = "Poda";
                            seleccionados.push(datosTicket);
                        }
                    });
                } else {
                    console.log("  Empleado normal o sin movimientos específicos");
                    const empClon = {...empOriginal, departamento: item.departamento};
                    if (item.esSinSeguro) empClon.sin_seguro_ticket = true;
                    seleccionados.push(empClon);
                }
            }
        }
    });

    console.log("Total empleados/tickets a enviar:", seleccionados.length);
    if (seleccionados.length === 0) {
        Swal.fire('Atención', 'No se pudieron procesar los datos de los empleados seleccionados.', 'warning');
        return;
    }

    // Funciones auxiliares de procesamiento (copiadas de ticket_pdf.js o adaptadas)
    function agruparTicketsPorPrecio(tickets) {
        const groups = {};
        tickets.forEach(t => {
            const p = t.precio_reja.toString();
            if (!groups[p]) groups[p] = [];
            groups[p].push(t);
        });
        return groups;
    }

    function procesarTicketsParaCorte(nombre, tickets, precio) {
        const rejasPorDia = {viernes: 0, sabado: 0, domingo: 0, lunes: 0, martes: 0, miercoles: 0, jueves: 0};
        let totalRejas = 0;
        let tablas = [];
        tickets.forEach(t => {
            const dia = obtenerDiaSemana(t.fecha);
            if (t.datosRejas) {
                t.datosRejas.forEach(tab => {
                    tablas.push({tabla: tab.tabla, cantidad: tab.cantidad});
                    if (rejasPorDia.hasOwnProperty(dia)) rejasPorDia[dia] += tab.cantidad;
                    totalRejas += tab.cantidad;
                });
            }
        });
        return {nombre, concepto: 'REJA', ...rejasPorDia, totalRejas, precio, totalEfectivo: totalRejas * precio, tablas};
    }

    function procesarNominaParaCorte(nombre, nomina) {
        const pagos = {viernes: 0, sabado: 0, domingo: 0, lunes: 0, martes: 0, miercoles: 0, jueves: 0};
        let total = 0;
        nomina.forEach(d => {
            const dia = d.dia.toLowerCase();
            const pago = parseFloat(d.pago) || 0;
            if (pagos.hasOwnProperty(dia)) pagos[dia] = pago;
            total += pago;
        });
        return {nombre, concepto: 'NOMINA', ...pagos, totalRejas: 0, precio: 0, totalEfectivo: total};
    }

    function procesarPodaParaTicket(nombre, movs, monto) {
        const arboles = {viernes: 0, sabado: 0, domingo: 0, lunes: 0, martes: 0, miercoles: 0, jueves: 0};
        let total = 0;
        movs.forEach(m => {
            const dia = obtenerDiaSemana(m.fecha);
            if (arboles.hasOwnProperty(dia)) arboles[dia] += m.arboles_podados || 0;
            total += m.arboles_podados || 0;
        });
        return {nombre, concepto: 'PODA', ...arboles, totalArboles: total, monto, totalEfectivo: total * monto};
    }

    function procesarExtraParaTicket(nombre, concepto, movs, monto) {
        const montos = {viernes: 0, sabado: 0, domingo: 0, lunes: 0, martes: 0, miercoles: 0, jueves: 0};
        let total = 0;
        movs.forEach(m => {
            const dia = obtenerDiaSemana(m.fecha);
            if (montos.hasOwnProperty(dia)) montos[dia] += m.monto || 0;
            total += m.monto || 0;
        });
        return {nombre, concepto, ...montos, totalArboles: 0, monto, totalEfectivo: total};
    }

    function obtenerDiaSemana(fechaStr) {
        if (!fechaStr) return '';
        const [a, m, d] = fechaStr.split('-').map(Number);
        const date = new Date(a, m - 1, d);
        const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
        return dias[date.getDay()];
    }
    
    // Mostrar cargando
    const btnOriginalHtml = $(this).html();
    $(this).prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Generando...');
    
    // Preparar datos para enviar
    const dataEnviar = {
        seleccion: true,
        empleados: seleccionados,
        meta: {
            numero_semana: nominaData.numero_semana || ''
        }
    };
    
    // Enviar por AJAX como JSON raw body (más robusto para datos grandes)
    $.ajax({
        url: '../php/descargar_ticket_pdf.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataEnviar),
        xhrFields: {
            responseType: 'blob'
        },
        success: function(blob, status, xhr) {
            if (!(blob instanceof Blob) || blob.size === 0) {
                Swal.fire('Error', 'El servidor no devolvió un archivo PDF válido o está vacío.', 'error');
                $('#btn_generar_tickets_seleccionados').prop('disabled', false).html(btnOriginalHtml);
                return;
            }
            
            var filename = 'tickets_seleccionados_huasteca.pdf';
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
            
            $('#btn_generar_tickets_seleccionados').prop('disabled', false).html(btnOriginalHtml);
            $('#modal_seleccion_tickets').modal('hide');
            
            Swal.fire({
                icon: 'success',
                title: 'Tickets generados',
                text: 'Se han generado los tickets correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        },
        error: function(xhr) {
            console.error('Error al generar tickets:', xhr.responseText);
            Swal.fire('Error', 'Error al generar el PDF. Por favor, intenta nuevamente.', 'error');
            $('#btn_generar_tickets_seleccionados').prop('disabled', false).html(btnOriginalHtml);
        }
    });
}

/**
 * Generar tickets de nombre para empleados seleccionados
 */
function generarTicketsNombreSeleccionados() {
    if (empleadosSeleccionados.size === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin selección',
            text: 'Por favor, selecciona al menos un empleado para generar tickets.'
        });
        return;
    }
    
    // Intentar obtener la variable global más reciente
    let nominaData = null;
    try {
        if (typeof jsonNominaHuasteca !== 'undefined' && jsonNominaHuasteca) {
            nominaData = jsonNominaHuasteca;
        }
    } catch (e) {}
    
    if (!nominaData) {
        nominaData = JSON.parse(localStorage.getItem('jsonNominaHuasteca') || '{}');
    }

    const seleccionados = [];
    
    // Obtener los datos más recientes de los empleados seleccionados
    empleadosParaTickets.forEach(item => {
        const clave = String(item.clave);
        if (empleadosSeleccionados.has(clave)) {
            const empOriginal = item.original;
            if (empOriginal) {
                if (empOriginal.mostrar === false) return;
                // Para ticket de nombre solo necesitamos el nombre y depto
                const empTicket = {
                    nombre: empOriginal.nombre,
                    departamento: item.departamento
                };
                if (item.esSinSeguro) empTicket.sin_seguro_ticket = true;
                seleccionados.push(empTicket);
            }
        }
    });
    
    if (seleccionados.length === 0) return;
    
    // Preparar datos en formato de nómina para el endpoint
    const seleccionadosAgrupados = {};
    seleccionados.forEach(emp => {
        const depto = emp.departamento || 'Seleccionados';
        if (!seleccionadosAgrupados[depto]) {
            seleccionadosAgrupados[depto] = [];
        }
        seleccionadosAgrupados[depto].push(emp);
    });

    const departamentosParaEnviar = Object.keys(seleccionadosAgrupados).map(nombre => ({
        nombre: nombre,
        empleados: seleccionadosAgrupados[nombre]
    }));

    const nominaParaEnviar = {
        departamentos: departamentosParaEnviar,
        numero_semana: nominaData.numero_semana || ''
    };
    
    // Mostrar cargando
    const btnOriginalHtml = $(this).html();
    $(this).prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Generando...');
    
    $('#modal_seleccion_tickets').modal('hide');

    Swal.fire({
        title: 'Generando tickets de nombre...',
        html: `Empleados: <strong>${seleccionados.length}</strong>`,
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });
    
    // Enviar por AJAX como JSON raw body
    $.ajax({
        url: '../php/descargar_ticket_nombre_pdf.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ nomina: nominaParaEnviar }),
        xhrFields: {
            responseType: 'blob'
        },
        success: function(blob, status, xhr) {
            if (!(blob instanceof Blob)) {
                Swal.fire('Error', 'El servidor no devolvió un archivo PDF válido.', 'error');
                $('#btn_generar_tickets_nombre_seleccionados').prop('disabled', false).html(btnOriginalHtml);
                return;
            }
            
            if (blob.size === 0) {
                Swal.fire('Error', 'Archivo PDF vacío.', 'error');
                $('#btn_generar_tickets_nombre_seleccionados').prop('disabled', false).html(btnOriginalHtml);
                return;
            }
            
            var filename = 'tickets_nombre_seleccionados_huasteca.pdf';
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
            
            $('#btn_generar_tickets_nombre_seleccionados').prop('disabled', false).html(btnOriginalHtml);
            
            Swal.fire({
                icon: 'success',
                title: 'Tickets generados',
                text: 'Se han generado los tickets de nombre correctamente.'
            });
        },
        error: function() {
            Swal.fire('Error', 'Error al generar el PDF. Por favor, intenta nuevamente.', 'error');
            $('#btn_generar_tickets_nombre_seleccionados').prop('disabled', false).html(btnOriginalHtml);
        }
    });
}
