/**
 * ================================================================
 * MÓDULO DE SELECCIÓN DE EMPLEADOS PARA TICKETS - NÓMINA PILAR
 * ================================================================
 */

let empleadosParaTickets = [];
let empleadosSeleccionados = new Set();

let filtroSeguroActivoPilar = 'todos';

function filtrarEmpleadosPilar() {
    const query = String($('#buscar_empleado_ticket').val() || '').toLowerCase().trim();
    
    // Mostrar/ocultar el botón de limpiar
    $('#btn_limpiar_busqueda').toggle(query !== '');
    
    const filtrados = empleadosParaTickets.filter(emp => {
        // Filtro por texto
        const nombre = (emp.nombre || '').toLowerCase();
        const clave = String(emp.clave || '');
        const depto = (emp.departamento || '').toLowerCase();
        const coincideQuery = query === '' || nombre.includes(query) || clave.includes(query) || depto.includes(query);
        
        // Filtro por seguro
        let coincideSeguro = true;
        if (filtroSeguroActivoPilar === 'con_seguro') coincideSeguro = !emp.esSinSeguro;
        else if (filtroSeguroActivoPilar === 'sin_seguro') coincideSeguro = emp.esSinSeguro;

        return coincideQuery && coincideSeguro;
    });
    
    mostrarEmpleados(filtrados);
}

function actualizarEstilosFiltrosPilar() {
    $('#btn_seleccionar_todos_tickets').toggleClass('active', filtroSeguroActivoPilar === 'todos');
    $('#btn_seleccionar_con_seguro_tickets').toggleClass('active', filtroSeguroActivoPilar === 'con_seguro');
    $('#btn_seleccionar_sin_seguro_tickets').toggleClass('active', filtroSeguroActivoPilar === 'sin_seguro');
}

$(document).ready(function() {
    $('#btn_ticket_seleccion').on('click', function() {
        let nominaData = null;
        try { if (typeof jsonNominaPilar !== 'undefined' && jsonNominaPilar) nominaData = jsonNominaPilar; } catch (e) {}
        if (!nominaData) nominaData = JSON.parse(localStorage.getItem('jsonNominaPilar') || '{}');

        if (!nominaData || !nominaData.departamentos) {
            Swal.fire({ icon: 'warning', title: 'Sin datos', text: 'No hay datos de nómina cargados.' });
            return;
        }
        
        filtroSeguroActivoPilar = 'todos';
        actualizarEstilosFiltrosPilar();
        $('#buscar_empleado_ticket').val('');
        cargarEmpleadosParaTickets(nominaData);
        $('#modal_seleccion_tickets').modal('show');
    });

    $('#btn_seleccionar_todos_tickets').on('click', () => {
        filtroSeguroActivoPilar = 'todos';
        actualizarEstilosFiltrosPilar();
        filtrarEmpleadosPilar();
    });

    $('#btn_seleccionar_con_seguro_tickets').on('click', () => {
        filtroSeguroActivoPilar = 'con_seguro';
        actualizarEstilosFiltrosPilar();
        filtrarEmpleadosPilar();
    });

    $('#btn_seleccionar_sin_seguro_tickets').on('click', () => {
        filtroSeguroActivoPilar = 'sin_seguro';
        actualizarEstilosFiltrosPilar();
        filtrarEmpleadosPilar();
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
            if (filtroSeguroActivoPilar === 'con_seguro') coincideSeguro = !emp.esSinSeguro;
            else if (filtroSeguroActivoPilar === 'sin_seguro') coincideSeguro = emp.esSinSeguro;

            if (coincideQuery && coincideSeguro) {
                empleadosSeleccionados.add(String(emp.uid));
            }
        });
        actualizarVistaSeleccion();
    });

    $('#btn_deseleccionar_todos_tickets').on('click', () => {
        const query = $('#buscar_empleado_ticket').val().toLowerCase().trim();
        if (query === '') empleadosSeleccionados.clear();
        else {
            empleadosParaTickets.forEach(emp => {
                if ((emp.nombre || '').toLowerCase().includes(query) || String(emp.clave || '').includes(query)) {
                    empleadosSeleccionados.delete(String(emp.uid));
                }
            });
        }
        actualizarVistaSeleccion();
    });

    $(document).on('input', '#buscar_empleado_ticket', filtrarEmpleadosPilar);

    $('#btn_generar_tickets_seleccionados').on('click', generarTicketsSeleccionados);
    $('#btn_generar_tickets_nombre_seleccionados').on('click', generarTicketsNombreSeleccionados);
    $(document).on('click', '#btn_limpiar_busqueda', () => $('#buscar_empleado_ticket').val('').trigger('input'));

    $(document).on('click', '.empleado-item', function(e) {
        if ($(e.target).is('input[type="checkbox"]')) return;
        const uid = String($(this).data('uid'));
        if (empleadosSeleccionados.has(uid)) empleadosSeleccionados.delete(uid);
        else empleadosSeleccionados.add(uid);
        actualizarVistaSeleccion();
    });
    
    $(document).on('change', '.empleado-item input[type="checkbox"]', function() {
        const uid = String($(this).closest('.empleado-item').data('uid'));
        if ($(this).is(':checked')) empleadosSeleccionados.add(uid);
        else empleadosSeleccionados.delete(uid);
        actualizarContadores();
    });
});

function cargarEmpleadosParaTickets(nominaData) {
    empleadosParaTickets = [];
    empleadosSeleccionados.clear();
    let counter = 0;
    nominaData.departamentos.forEach(depto => {
        if (depto.empleados) {
            depto.empleados.forEach(emp => {
                if (!emp || emp.mostrar === false) return;
                // Crear un UID único para evitar que claves duplicadas o vacías seleccionen a varios
                const uid = `emp_${counter++}`;
                const esSinSeguro = (emp?.seguroSocial === false) || String(depto.nombre || '').toLowerCase().includes('sin seguro');
                empleadosParaTickets.push({ 
                    uid: uid,
                    original: emp, 
                    clave: emp.clave || 'S/C', 
                    nombre: emp.nombre, 
                    departamento: depto.nombre,
                    esSinSeguro: esSinSeguro
                });
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
            const isSelected = empleadosSeleccionados.has(String(emp.uid));
            return `<div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center empleado-item ${isSelected ? 'active' : ''}" data-uid="${emp.uid}" data-clave="${emp.clave}">
                <div>
                    <div class="fw-bold">${emp.nombre}</div>
                    <small class="${isSelected ? 'text-white-50' : 'text-muted'}">Clave: ${emp.clave} | ${emp.departamento}</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-info rounded-pill">${emp.departamento}</span>
                    <input class="form-check-input" type="checkbox" ${isSelected ? 'checked' : ''}>
                </div>
            </div>`;
        }).join('')}
    </div>`;
    container.html(html);
}

function actualizarVistaSeleccion() {
    $('.empleado-item').each(function() {
        const uid = String($(this).data('uid'));
        const isSelected = empleadosSeleccionados.has(uid);
        $(this).toggleClass('active', isSelected);
        $(this).find('input[type="checkbox"]').prop('checked', isSelected);
    });
    actualizarContadores();
}

function actualizarContadores() {
    const total = empleadosSeleccionados.size;
    $('#contador_seleccionados, #contador_seleccionados_btn, #contador_nombre_btn').text(total);
}

function generarTicketsSeleccionados() {
    if (empleadosSeleccionados.size === 0) {
        Swal.fire({ icon: 'warning', title: 'Sin selección', text: 'Selecciona al menos un empleado.' });
        return;
    }
    
    let nominaData = null;
    try { if (typeof jsonNominaPilar !== 'undefined' && jsonNominaPilar) nominaData = jsonNominaPilar; } catch (e) {}
    if (!nominaData) nominaData = JSON.parse(localStorage.getItem('jsonNominaPilar') || '{}');

    const seleccionados = [];
    empleadosParaTickets.forEach(item => {
        if (empleadosSeleccionados.has(String(item.uid))) {
            const empOriginal = item.original;
            if (empOriginal && empOriginal.mostrar === false) return;
            
            // Crear una copia para no modificar el objeto original en memoria
            const emp = { ...empOriginal };
            emp.departamento = item.departamento;
            if (item.esSinSeguro) emp.sin_seguro_ticket = true;

            // PRE-PROCESAMIENTO PARA CORTE Y PODA SI ES NECESARIO
            // Si es de corte y tiene el formato raw, lo procesamos para que el backend lo entienda
            if (item.departamento.toUpperCase() === 'CORTE' && emp.concepto === 'REJA' && emp.tickets) {
                // Para simplificar la selección, procesamos el primer grupo de tickets o el total
                // El backend espera totalRejas, precio, totalEfectivo
                const porPrecio = {};
                emp.tickets.forEach(t => {
                    const p = (t.precio_reja ?? 0).toString();
                    if (!porPrecio[p]) porPrecio[p] = [];
                    porPrecio[p].push(t);
                });
                
                Object.keys(porPrecio).forEach(p => {
                    const datos = procesarTicketsParaCorteSimple(emp.nombre, porPrecio[p], parseFloat(p));
                    datos.departamento = 'Corte';
                    if (item.esSinSeguro) datos.sin_seguro_ticket = true;
                    seleccionados.push(datos);
                });
            } else if (item.departamento.toUpperCase() === 'PODA' && emp.movimientos) {
                const movsPoda = emp.movimientos.filter(m => m.concepto === 'PODA');
                const porMonto = {};
                movsPoda.forEach(m => {
                    if (!porMonto[m.monto]) porMonto[m.monto] = [];
                    porMonto[m.monto].push(m);
                });
                Object.keys(porMonto).forEach(m => {
                    const datos = procesarPodaParaTicketSimple(emp.nombre, porMonto[m], parseFloat(m));
                    datos.departamento = 'Poda';
                    if (item.esSinSeguro) datos.sin_seguro_ticket = true;
                    seleccionados.push(datos);
                });
            } else {
                seleccionados.push(emp);
            }
        }
    });
    
    const btn = $(this);
    const original = btn.html();
    btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i>');
    
    $.ajax({
        url: '../php/descargar_ticket_pdf.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ seleccion: true, empleados: seleccionados, meta: { numero_semana: nominaData.numero_semana || '' } }),
        xhrFields: { responseType: 'blob' },
        success: function(blob) {
            if (blob instanceof Blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tickets_seleccionados_pilar.pdf';
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
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
    
    let nominaData = null;
    try { if (typeof jsonNominaPilar !== 'undefined' && jsonNominaPilar) nominaData = jsonNominaPilar; } catch (e) {}
    if (!nominaData) nominaData = JSON.parse(localStorage.getItem('jsonNominaPilar') || '{}');

    const seleccionados = [];
    empleadosParaTickets.forEach(item => {
        if (empleadosSeleccionados.has(String(item.uid))) {
            if (item.original && item.original.mostrar === false) return;
            const empCopia = { ...item.original };
            if (item.esSinSeguro) empCopia.sin_seguro_ticket = true;
            seleccionados.push(empCopia);
        }
    });
    
    const btn = $(this);
    const original = btn.html();
    btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i>');
    
    $.ajax({
        url: '../php/descargar_ticket_nombre_pdf.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 
            nomina: { 
                departamentos: [{ nombre: 'Selección', empleados: seleccionados }],
                numero_semana: nominaData.numero_semana || ''
            } 
        }),
        xhrFields: { responseType: 'blob' },
        success: function(blob) {
            if (blob instanceof Blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tickets_nombre_seleccionados_pilar.pdf';
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
                $('#modal_seleccion_tickets').modal('hide');
                Swal.fire({ icon: 'success', title: 'Tickets de nombre generados', timer: 1500, showConfirmButton: false });
            }
            btn.prop('disabled', false).html(original);
        },
        error: function() {
            Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
            btn.prop('disabled', false).html(original);
        }
    });
}

// Funciones auxiliares duplicadas de ticket_pdf.js para que el modal funcione independiente
function procesarTicketsParaCorteSimple(nombre, tickets, precio) {
    const rejas = { viernes: 0, sabado: 0, domingo: 0, lunes: 0, martes: 0, miercoles: 0, jueves: 0 };
    let total = 0;
    (tickets || []).forEach(t => {
        const dia = obtenerDiaSemanaSimple(t.fecha);
        (t.datosRejas || []).forEach(tr => {
            if (rejas.hasOwnProperty(dia)) rejas[dia] += tr.cantidad;
            total += tr.cantidad;
        });
    });
    return { nombre, concepto: 'REJA', ...rejas, totalRejas: total, precio, totalEfectivo: total * precio };
}

function procesarPodaParaTicketSimple(nombre, movs, monto) {
    const arb = { viernes: 0, sabado: 0, domingo: 0, lunes: 0, martes: 0, miercoles: 0, jueves: 0 };
    let total = 0;
    (movs || []).forEach(m => {
        const dia = obtenerDiaSemanaSimple(m.fecha);
        const cant = Number(m.arboles_podados || 0);
        if (arb.hasOwnProperty(dia)) arb[dia] += cant;
        total += cant;
    });
    return { nombre, concepto: 'PODA', ...arb, totalArboles: total, monto, totalEfectivo: total * monto };
}

function obtenerDiaSemanaSimple(fechaStr) {
    if (!fechaStr) return '';
    const [a, m, d] = fechaStr.split('-').map(Number);
    const date = new Date(a, m - 1, d);
    return ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][date.getDay()];
}
