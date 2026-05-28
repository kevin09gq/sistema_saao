/**
 * ================================================================
 * MÓDULO DE SELECCIÓN DE EMPLEADOS PARA TICKETS - NÓMINA RELICARIO
 * ================================================================
 * Rediseñado para manejar desgloses de Corte y Poda
 * ================================================================
 */

let empleadosParaTickets = [];
let empleadosSeleccionados = new Set();

$(document).ready(function() {
    // Delegación de eventos para abrir modal
    $(document).on('click', '#btn_ticket_manual', function(e) {
        e.preventDefault();
        
        let nominaData = null;
        if (typeof jsonNominaRelicario !== 'undefined' && jsonNominaRelicario && jsonNominaRelicario.departamentos) {
            nominaData = jsonNominaRelicario;
        } else {
            const stored = localStorage.getItem('jsonNominaRelicario');
            if (stored) nominaData = JSON.parse(stored);
        }

        if (!nominaData) {
            Swal.fire('Sin datos', 'No hay datos de nómina cargados.', 'warning');
            return;
        }
        
        filtroSeguroActivoRelicario = 'todos';
        actualizarEstilosFiltrosRelicario();
        $('#buscar_empleado_ticket').val('');
        cargarEmpleadosParaTickets(nominaData);
        
        const modalEl = document.getElementById('modal_seleccion_tickets');
        if (modalEl) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    });

    // Eventos del modal
    $('#btn_seleccionar_todos_tickets').on('click', function() {
        filtroSeguroActivoRelicario = 'todos';
        actualizarEstilosFiltrosRelicario();
        $('#buscar_empleado_ticket').trigger('input');
    });

    $('#btn_seleccionar_con_seguro_tickets').on('click', function() {
        filtroSeguroActivoRelicario = 'con_seguro';
        actualizarEstilosFiltrosRelicario();
        $('#buscar_empleado_ticket').trigger('input');
    });

    $('#btn_seleccionar_sin_seguro_tickets').on('click', function() {
        filtroSeguroActivoRelicario = 'sin_seguro';
        actualizarEstilosFiltrosRelicario();
        $('#buscar_empleado_ticket').trigger('input');
    });

    $('#btn_marcar_visibles_tickets').on('click', function() {
        const query = String($('#buscar_empleado_ticket').val() || '').toLowerCase().trim();
        empleadosParaTickets.forEach(emp => {
            const nombre = (emp.nombre || '').toLowerCase();
            const clave = String(emp.clave || '');
            const depto = (emp.departamento || '').toLowerCase();
            
            // Filtro por texto
            const coincideQuery = query === '' || nombre.includes(query) || clave.includes(query) || depto.includes(query);
            
            // Filtro por seguro
            let coincideSeguro = true;
            if (filtroSeguroActivoRelicario === 'con_seguro') coincideSeguro = !emp.esSinSeguro;
            else if (filtroSeguroActivoRelicario === 'sin_seguro') coincideSeguro = emp.esSinSeguro;

            if (coincideQuery && coincideSeguro) {
                empleadosSeleccionados.add(String(emp.clave));
            }
        });
        actualizarVistaSeleccion();
    });

    $('#btn_deseleccionar_todos_tickets').on('click', deseleccionarTodosEmpleados);
    $(document).on('input', '#buscar_empleado_ticket', filtrarEmpleados);
    $('#btn_generar_tickets_seleccionados').on('click', generarTicketsSeleccionados);
    $('#btn_generar_tickets_nombre_seleccionados').on('click', generarTicketsNombreSeleccionados);
    $(document).on('click', '#btn_limpiar_busqueda', limpiarCampoBusqueda);

    // Selección individual
    $(document).on('click', '.empleado-item', function(e) {
        if ($(e.target).is('input[type="checkbox"]')) return;
        const clave = String($(this).data('clave'));
        toggleSeleccion(clave, $(this));
    });
    
    $(document).on('change', '.empleado-item input[type="checkbox"]', function() {
        const clave = String($(this).closest('.empleado-item').data('clave'));
        toggleSeleccion(clave, $(this).closest('.empleado-item'), $(this).is(':checked'));
    });
});

function toggleSeleccion(clave, elemento, forzarEstado = null) {
    const nuevoEstado = forzarEstado !== null ? forzarEstado : !empleadosSeleccionados.has(clave);
    
    if (nuevoEstado) {
        empleadosSeleccionados.add(clave);
        elemento.addClass('active');
        elemento.find('input[type="checkbox"]').prop('checked', true);
    } else {
        empleadosSeleccionados.delete(clave);
        elemento.removeClass('active');
        elemento.find('input[type="checkbox"]').prop('checked', false);
    }
    actualizarContadores();
}

function cargarEmpleadosParaTickets(nominaData) {
    empleadosParaTickets = [];
    empleadosSeleccionados.clear();

    const empleadosPorNombre = {};

    nominaData.departamentos.forEach(depto => {
        const nombreDepto = depto.nombre || '';
        if (!depto.empleados) return;

        depto.empleados.forEach(emp => {
            if (!emp || emp.mostrar === false) return;
            
            const nombre = emp.nombre;
            if (!empleadosPorNombre[nombre]) {
                const esSinSeguro = (emp?.seguroSocial === false) || String(nombreDepto || '').toLowerCase().includes('sin seguro');
                empleadosPorNombre[nombre] = {
                    nombre: nombre,
                    clave: emp.clave || `emp-${nombre}-${Math.random()}`,
                    departamento: nombreDepto,
                    esSinSeguro: esSinSeguro,
                    rejas: [],
                    nomina: null,
                    movimientosPoda: [],
                    extrasPoda: [],
                    originalParaExtras: { ...emp }, // Guardar datos base del empleado
                    originalNormal: null
                };
            }

            const ref = empleadosPorNombre[nombre];
            if (!ref.originalParaExtras && emp) ref.originalParaExtras = { ...emp };

            if (nombreDepto.toUpperCase() === 'CORTE') {
                if (emp.concepto === 'REJA' && Array.isArray(emp.tickets)) {
                    emp.tickets.forEach(t => {
                        ref.rejas.push({
                            ticket: t,
                            precio: t.precio_reja ?? 0
                        });
                    });
                } else if (emp.concepto === 'NOMINA' && Array.isArray(emp.nomina)) {
                    ref.nomina = emp.nomina;
                }
            } else if (nombreDepto.toUpperCase() === 'PODA' && Array.isArray(emp.movimientos)) {
                const movsPoda = emp.movimientos.filter(m => m.concepto === 'PODA');
                ref.movimientosPoda.push(...movsPoda);
                
                const extras = emp.movimientos.filter(m => m.concepto !== 'PODA');
                ref.extrasPoda.push(...extras);
            } else {
                // Nómina normal
                ref.originalNormal = { ...emp, departamento: nombreDepto };
            }
        });
    });

    // Convertir el mapa a la lista para el modal
    Object.keys(empleadosPorNombre).forEach(nombre => {
        const empConsolidado = empleadosPorNombre[nombre];
        const esSinSeguro = empConsolidado.esSinSeguro;
        const claveBase = String(empConsolidado.clave);

        // CASO 1: CORTE (Rejas o Nómina)
        if (empConsolidado.rejas.length > 0 || empConsolidado.nomina) {
            const original = procesarTicketsCorteCombinado(nombre, empConsolidado.rejas, empConsolidado.nomina);
            original.departamento = 'Corte';
            if (esSinSeguro) original.sin_seguro_ticket = true;
            
            empleadosParaTickets.push({
                original: original,
                clave: claveBase + '-Corte',
                nombre: nombre,
                departamento: 'Corte',
                esSinSeguro: esSinSeguro
            });
        }

        // CASO 2: PODA (Movimientos de Poda)
        if (empConsolidado.movimientosPoda.length > 0) {
            const original = procesarPodaParaTicket(nombre, empConsolidado.movimientosPoda);
            original.departamento = 'Poda';
            if (esSinSeguro) original.sin_seguro_ticket = true;

            empleadosParaTickets.push({
                original: original,
                clave: claveBase + '-Poda',
                nombre: nombre,
                departamento: 'Poda',
                esSinSeguro: esSinSeguro
            });
        }

        // CASO 3: EXTRA (Movimientos que no son Poda en el depto Poda)
        if (empConsolidado.extrasPoda.length > 0) {
            const original = procesarExtrasParaTicket(nombre, empConsolidado.extrasPoda, empConsolidado.originalParaExtras);
            original.departamento = 'Extra';
            if (esSinSeguro) original.sin_seguro_ticket = true;

            empleadosParaTickets.push({
                original: original,
                clave: claveBase + '-Extra',
                nombre: nombre,
                departamento: 'Extra',
                esSinSeguro: esSinSeguro
            });
        }

        // CASO 4: NÓMINA NORMAL (Otros departamentos)
        if (empConsolidado.originalNormal) {
            const original = { ...empConsolidado.originalNormal };
            if (esSinSeguro) original.sin_seguro_ticket = true;

            empleadosParaTickets.push({
                original: original,
                clave: claveBase,
                nombre: nombre,
                departamento: empConsolidado.departamento,
                esSinSeguro: esSinSeguro
            });
        }
    });

    // Ordenar: primero con seguro (esSinSeguro = false), luego sin seguro (esSinSeguro = true)
    empleadosParaTickets.sort((a, b) => {
        const aSin = a.esSinSeguro || false;
        const bSin = b.esSinSeguro || false;
        if (aSin === bSin) {
            return String(a.nombre || '').localeCompare(String(b.nombre || ''));
        }
        return aSin ? 1 : -1;
    });

    mostrarEmpleados(empleadosParaTickets);
    actualizarContadores();
}

function mostrarEmpleados(empleados) {
    const container = $('#lista_empleados_tickets');
    container.empty();
    
    if (empleados.length === 0) {
        container.html('<div class="col-12 text-center py-3">No se encontraron empleados</div>');
        return;
    }
    
    const html = `<div class="list-group w-100">
        ${empleados.map(emp => {
            const isSelected = empleadosSeleccionados.has(emp.clave);
            return `
                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center empleado-item ${isSelected ? 'active' : ''}" data-clave="${emp.clave}">
                    <div>
                        <div class="fw-bold">${emp.nombre}</div>
                        <small class="text-muted">${emp.departamento}</small>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <input class="form-check-input" type="checkbox" ${isSelected ? 'checked' : ''}>
                    </div>
                </div>
            `;
        }).join('')}
    </div>`;
    container.html(html);
}

let filtroSeguroActivoRelicario = 'todos';

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
        const clave = String(emp.clave || '');
        const depto = (emp.departamento || '').toLowerCase();
        const coincideQuery = query === '' || nombre.includes(query) || clave.includes(query) || depto.includes(query);
        
        // Filtro por seguro
        let coincideSeguro = true;
        if (filtroSeguroActivoRelicario === 'con_seguro') coincideSeguro = !emp.esSinSeguro;
        else if (filtroSeguroActivoRelicario === 'sin_seguro') coincideSeguro = emp.esSinSeguro;

        return coincideQuery && coincideSeguro;
    });
    
    mostrarEmpleados(filtrados);
}

function actualizarEstilosFiltrosRelicario() {
    $('#btn_seleccionar_todos_tickets').toggleClass('active', filtroSeguroActivoRelicario === 'todos');
    $('#btn_seleccionar_con_seguro_tickets').toggleClass('active', filtroSeguroActivoRelicario === 'con_seguro');
    $('#btn_seleccionar_sin_seguro_tickets').toggleClass('active', filtroSeguroActivoRelicario === 'sin_seguro');
}

function seleccionarTodosEmpleados() {
    const query = $('#buscar_empleado_ticket').val().toLowerCase().trim();
    empleadosParaTickets.forEach(emp => {
        if (query === '' || (emp.nombre || '').toLowerCase().includes(query)) {
            empleadosSeleccionados.add(emp.clave);
        }
    });
    actualizarVistaSeleccion();
}

function deseleccionarTodosEmpleados() {
    const query = $('#buscar_empleado_ticket').val().toLowerCase().trim();
    if (query === '') {
        empleadosSeleccionados.clear();
    } else {
        empleadosParaTickets.forEach(emp => {
            if ((emp.nombre || '').toLowerCase().includes(query)) {
                empleadosSeleccionados.delete(emp.clave);
            }
        });
    }
    actualizarVistaSeleccion();
}

function actualizarVistaSeleccion() {
    $('.empleado-item').each(function() {
        const clave = String($(this).data('clave'));
        const isSelected = empleadosSeleccionados.has(clave);
        $(this).toggleClass('active', isSelected);
        $(this).find('input[type="checkbox"]').prop('checked', isSelected);
    });
    actualizarContadores();
}

function actualizarContadores() {
    const total = empleadosSeleccionados.size;
    $('#contador_seleccionados, #contador_seleccionados_btn, #contador_nombre_btn').text(total);
}

function limpiarCampoBusqueda() {
    $('#buscar_empleado_ticket').val('').trigger('input');
}

function generarTicketsSeleccionados() {
    if (empleadosSeleccionados.size === 0) {
        Swal.fire('Atención', 'Selecciona al menos un empleado.', 'warning');
        return;
    }
    
    let numSemana = '';
    try {
        if (typeof jsonNominaRelicario !== 'undefined') numSemana = jsonNominaRelicario.numero_semana || '';
    } catch(e){}

    const seleccionados = [];
    empleadosParaTickets.forEach(item => {
        if (empleadosSeleccionados.has(item.clave)) {
            if (item.original && item.original.mostrar === false) return;
            const empCopia = { ...item.original };
            if (item.esSinSeguro) empCopia.sin_seguro_ticket = true;
            seleccionados.push(empCopia);
        }
    });
    
    const btn = $(this);
    const original = btn.html();
    btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Generando...');
    
    $.ajax({
        url: '../php/descargar_ticket_pdf.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 
            seleccion: true, 
            empleados: seleccionados, 
            meta: { numero_semana: numSemana } 
        }),
        xhrFields: { responseType: 'blob' },
        success: function(blob) {
            if (blob instanceof Blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tickets_seleccionados.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                $('#modal_seleccion_tickets').modal('hide');
                Swal.fire({ icon: 'success', title: 'Tickets generados', timer: 1500, showConfirmButton: false });
            }
            btn.prop('disabled', false).html(original);
        },
        error: function() {
            Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
            btn.prop('disabled', false).html(original);
        }
    });
}

function generarTicketsNombreSeleccionados() {
    if (empleadosSeleccionados.size === 0) {
        Swal.fire('Atención', 'Selecciona al menos un empleado.', 'warning');
        return;
    }

    const seleccionadosMap = {};
    empleadosParaTickets.forEach(item => {
        if (empleadosSeleccionados.has(item.clave)) {
            if (item.original && item.original.mostrar === false) return;
            
            const nombre = (item.nombre || '').trim();
            if (nombre && !seleccionadosMap[nombre]) {
                const empCopia = { ...item.original };
                if (item.esSinSeguro) empCopia.sin_seguro_ticket = true;
                seleccionadosMap[nombre] = empCopia;
            }
        }
    });

    const seleccionados = Object.values(seleccionadosMap);

    const btn = $(this);
    const original = btn.html();
    btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i>');

    $.ajax({
        url: '../php/descargar_ticket_nombre_pdf.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            nomina: {
                departamentos: [{
                    nombre: 'Seleccionados',
                    empleados: seleccionados
                }]
            }
        }),
        xhrFields: { responseType: 'blob' },
        success: function(blob) {
            if (blob instanceof Blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tickets_nombre_seleccionados.pdf';
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                $('#modal_seleccion_tickets').modal('hide');
                Swal.fire({ icon: 'success', title: 'Tickets generados', timer: 1500, showConfirmButton: false });
            }
            btn.prop('disabled', false).html(original);
        },
        error: function() {
            Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
            btn.prop('disabled', false).html(original);
        }
    });
}
