/**
 * ================================================================
 * MÓDULO DE SELECCIÓN DE EMPLEADOS PARA TICKETS - NÓMINA Huasteca
 * ================================================================
 * Misma estructura que Relicario: desgloses de Corte, Poda y Extra
 * ================================================================
 */

let empleadosParaTickets = [];
let empleadosSeleccionados = new Set();

let filtroSeguroActivoHuasteca = 'todos';

$(document).ready(function() {
    $('#btn_ticket_seleccion').on('click', function(e) {
        e.preventDefault();

        let nominaData = null;
        try {
            if (typeof jsonNominaHuasteca !== 'undefined' && jsonNominaHuasteca) {
                nominaData = jsonNominaHuasteca;
            }
        } catch (err) {}

        if (!nominaData || !nominaData.departamentos) {
            nominaData = JSON.parse(localStorage.getItem('jsonNominaHuasteca') || '{}');
            if (nominaData && nominaData.departamentos && typeof jsonNominaHuasteca !== 'undefined') {
                try { jsonNominaHuasteca = nominaData; } catch (e) {}
            }
        }

        if (!nominaData || !nominaData.departamentos) {
            Swal.fire({ icon: 'warning', title: 'Sin datos', text: 'No hay datos de nómina cargados.' });
            return;
        }

        filtroSeguroActivoHuasteca = 'todos';
        actualizarEstilosFiltrosHuasteca();
        $('#buscar_empleado_ticket').val('');
        cargarEmpleadosParaTickets(nominaData);

        const modalEl = document.getElementById('modal_seleccion_tickets');
        if (modalEl) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    });

    $('#modal_seleccion_tickets').on('shown.bs.modal', function () {
        $(this).attr('aria-hidden', 'false');
    });
    $('#modal_seleccion_tickets').on('hidden.bs.modal', function () {
        $(this).attr('aria-hidden', 'true');
    });

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
        const query = String($('#buscar_empleado_ticket').val() || '').toLowerCase().trim();
        empleadosParaTickets.forEach(emp => {
            const nombre = (emp.nombre || '').toLowerCase();
            const clave = String(emp.clave || '');
            const depto = (emp.departamento || '').toLowerCase();
            const coincideQuery = query === '' || nombre.includes(query) || clave.includes(query) || depto.includes(query);
            let coincideSeguro = true;
            if (filtroSeguroActivoHuasteca === 'con_seguro') coincideSeguro = !emp.esSinSeguro;
            else if (filtroSeguroActivoHuasteca === 'sin_seguro') coincideSeguro = emp.esSinSeguro;
            if (coincideQuery && coincideSeguro) {
                empleadosSeleccionados.add(String(emp.clave));
            }
        });
        actualizarVistaSeleccion();
    });

    $('#btn_deseleccionar_todos_tickets').on('click', deseleccionarTodosEmpleados);
    $(document).on('input', '#buscar_empleado_ticket', filtrarEmpleadosHuasteca);
    $('#btn_generar_tickets_seleccionados').on('click', generarTicketsSeleccionados);
    $('#btn_generar_tickets_nombre_seleccionados').on('click', generarTicketsNombreSeleccionados);
    $(document).on('click', '#btn_limpiar_busqueda', limpiarCampoBusqueda);

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

            const nombre = String(emp.nombre || '').trim();
            if (!nombre) return;

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
                    originalParaExtras: { ...emp },
                    originalNormal: null
                };
            }

            const ref = empleadosPorNombre[nombre];
            if (!ref.originalParaExtras && emp) ref.originalParaExtras = { ...emp };

            if (nombreDepto.toUpperCase() === 'CORTE') {
                const concepto = String(emp.concepto || '').toUpperCase();
                if (concepto === 'REJA' && Array.isArray(emp.tickets)) {
                    emp.tickets.forEach(t => {
                        ref.rejas.push({ ticket: t, precio: t.precio_reja ?? 0 });
                    });
                } else if (concepto === 'NOMINA' && Array.isArray(emp.nomina)) {
                    ref.nomina = emp.nomina;
                }
            } else if (nombreDepto.toUpperCase() === 'PODA' && Array.isArray(emp.movimientos)) {
                ref.movimientosPoda.push(...emp.movimientos.filter(m => String(m.concepto || '').toUpperCase() === 'PODA'));
                ref.extrasPoda.push(...emp.movimientos.filter(m => String(m.concepto || '').toUpperCase() !== 'PODA'));
            } else {
                ref.originalNormal = { ...emp, departamento: nombreDepto };
            }
        });
    });

    Object.keys(empleadosPorNombre).forEach(nombre => {
        const empConsolidado = empleadosPorNombre[nombre];
        const esSinSeguro = empConsolidado.esSinSeguro;
        const claveBase = String(empConsolidado.clave);

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

    empleadosParaTickets.sort((a, b) => {
        if (a.esSinSeguro === b.esSinSeguro) {
            return String(a.nombre || '').localeCompare(String(b.nombre || ''));
        }
        return a.esSinSeguro ? 1 : -1;
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

function filtrarEmpleadosHuasteca() {
    const query = String($('#buscar_empleado_ticket').val() || '').toLowerCase().trim();
    $('#btn_limpiar_busqueda').toggle(query !== '');

    const filtrados = empleadosParaTickets.filter(emp => {
        const nombre = (emp.nombre || '').toLowerCase();
        const clave = String(emp.clave || '');
        const depto = (emp.departamento || '').toLowerCase();
        const coincideQuery = query === '' || nombre.includes(query) || clave.includes(query) || depto.includes(query);
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
        Swal.fire({ icon: 'warning', title: 'Sin selección', text: 'Selecciona al menos un empleado.' });
        return;
    }

    let numSemana = '';
    try {
        if (typeof jsonNominaHuasteca !== 'undefined') numSemana = jsonNominaHuasteca.numero_semana || '';
    } catch (e) {}

    const seleccionados = [];
    empleadosParaTickets.forEach(item => {
        if (empleadosSeleccionados.has(item.clave)) {
            if (item.original && item.original.mostrar === false) return;
            const empCopia = { ...item.original };
            if (item.esSinSeguro) empCopia.sin_seguro_ticket = true;
            seleccionados.push(empCopia);
        }
    });

    const btn = $('#btn_generar_tickets_seleccionados');
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
                a.download = 'tickets_seleccionados_Huasteca.pdf';
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
        Swal.fire({ icon: 'warning', title: 'Sin selección', text: 'Selecciona al menos un empleado.' });
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

    const btn = $('#btn_generar_tickets_nombre_seleccionados');
    const original = btn.html();
    btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i>');

    $.ajax({
        url: '../php/descargar_ticket_nombre_pdf.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            nomina: {
                departamentos: [{ nombre: 'Seleccionados', empleados: seleccionados }]
            }
        }),
        xhrFields: { responseType: 'blob' },
        success: function(blob) {
            if (blob instanceof Blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tickets_nombre_seleccionados_Huasteca.pdf';
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
