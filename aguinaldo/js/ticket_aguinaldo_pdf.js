/**
 * ================================================================
 * MÓDULO DE SELECCIÓN DE EMPLEADOS PARA TICKETS - AGUINALDO
 * ================================================================
 */

let empleadosSeleccionadosAguinaldo = new Set();
let empleadosListaAguinaldo = [];

$(document).ready(function() {
    // Evento para Ticket General (basado en filtros actuales)
    $('#btn_ticket_pdf').on('click', function() {
        if (!window.jsonAguinaldo || !window.jsonAguinaldo.empleados) {
            Swal.fire('Atención', 'No hay datos de aguinaldo procesados.', 'warning');
            return;
        }

        // Obtener empleados visibles según filtros actuales
        const filtrados = obtenerEmpleadosFiltradosActuales();
        if (filtrados.length === 0) {
            Swal.fire('Sin datos', 'No hay empleados que coincidan con los filtros.', 'warning');
            return;
        }

        enviarDatosTicketAguinaldo(filtrados);
    });

    // Abrir Modal de Selección
    $('#btn_ticket_seleccion_aguinaldo').on('click', function() {
        if (!window.jsonAguinaldo || !window.jsonAguinaldo.empleados) {
            Swal.fire('Atención', 'No hay datos de aguinaldo procesados.', 'warning');
            return;
        }

        $('#buscar_empleado_ticket').val('');
        empleadosSeleccionadosAguinaldo.clear();
        cargarListaParaSeleccion();
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal_seleccion_tickets_aguinaldo'));
        modal.show();
    });

    // Eventos del Modal
    $(document).on('input', '#buscar_empleado_ticket', filtrarListaSeleccion);
    $('#btn_seleccionar_todos_tickets').on('click', () => toggleTodos(true));
    $('#btn_deseleccionar_todos_tickets').on('click', () => toggleTodos(false));
    $('#btn_generar_tickets_seleccionados').on('click', generarSeleccionados);

    $(document).on('click', '.empleado-item-aguinaldo', function(e) {
        if ($(e.target).is('input')) return;
        const id = $(this).data('id');
        const cb = $(this).find('input[type="checkbox"]');
        cb.prop('checked', !cb.is(':checked')).trigger('change');
    });

    $(document).on('change', '.empleado-item-aguinaldo input', function() {
        const id = $(this).closest('.empleado-item-aguinaldo').data('id');
        const item = $(this).closest('.empleado-item-aguinaldo');
        if ($(this).is(':checked')) {
            empleadosSeleccionadosAguinaldo.add(String(id));
            item.addClass('active');
        } else {
            empleadosSeleccionadosAguinaldo.delete(String(id));
            item.removeClass('active');
        }
        actualizarContadores();
    });
});

function obtenerEmpleadosFiltradosActuales() {
    const textoBusqueda = $('#busqueda').val().toLowerCase();
    const deptoId = $('#id_departamento').val();
    const empresaId = $('#id_empresa').val();

    return jsonAguinaldo.empleados.filter(emp => {
        const nombreCompleto = `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.toLowerCase();
        const matchBusqueda = !textoBusqueda || 
            nombreCompleto.includes(textoBusqueda) ||
            (emp.clave_empleado && emp.clave_empleado.toLowerCase().includes(textoBusqueda));
        const matchDepto = deptoId === "-1" || parseInt(emp.id_departamento) === parseInt(deptoId);
        const matchEmpresa = empresaId === "-1" || parseInt(emp.id_empresa) === parseInt(empresaId);
        return matchBusqueda && matchDepto && matchEmpresa && emp.derecho_aguinaldo && emp.visible;
    });
}

function cargarListaParaSeleccion() {
    empleadosListaAguinaldo = jsonAguinaldo.empleados.filter(e => e.derecho_aguinaldo && e.visible);
    renderizarListaSeleccion(empleadosListaAguinaldo);
}

function renderizarListaSeleccion(lista) {
    const container = $('#lista_empleados_tickets');
    container.empty();
    
    if (lista.length === 0) {
        container.html('<div class="col-12 text-center py-3">No se encontraron empleados</div>');
        return;
    }

    const html = `<div class="list-group w-100">
        ${lista.map(emp => {
            const isSelected = empleadosSeleccionadosAguinaldo.has(String(emp.id_empleado));
            // Concatenar nombre completo: Nombre + Ap Paterno + Ap Materno
            const nombreCompleto = `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.trim();
            return `
                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center empleado-item-aguinaldo ${isSelected ? 'active' : ''}" data-id="${emp.id_empleado}">
                    <div>
                        <div class="fw-bold text-dark">${nombreCompleto}</div>
                        <small class="text-muted">Clave: ${emp.clave_empleado} | ${emp.nombre_departamento || 'General'}</small>
                    </div>
                    <input class="form-check-input" type="checkbox" ${isSelected ? 'checked' : ''}>
                </div>
            `;
        }).join('')}
    </div>`;
    container.html(html);
    actualizarContadores();
}

function filtrarListaSeleccion() {
    const query = $(this).val().toLowerCase().trim();
    const filtrados = empleadosListaAguinaldo.filter(emp => {
        const nombreCompleto = `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.toLowerCase();
        return nombreCompleto.includes(query) || 
               (emp.clave_empleado && emp.clave_empleado.toLowerCase().includes(query));
    });
    renderizarListaSeleccion(filtrados);
}

function toggleTodos(estado) {
    const query = $('#buscar_empleado_ticket').val().toLowerCase().trim();
    empleadosListaAguinaldo.forEach(emp => {
        const nombreCompleto = `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.toLowerCase();
        if (!query || nombreCompleto.includes(query) || (emp.clave_empleado && emp.clave_empleado.toLowerCase().includes(query))) {
            if (estado) empleadosSeleccionadosAguinaldo.add(String(emp.id_empleado));
            else empleadosSeleccionadosAguinaldo.delete(String(emp.id_empleado));
        }
    });
    const listaRender = query ? empleadosListaAguinaldo.filter(emp => {
        const nombreCompleto = `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.toLowerCase();
        return nombreCompleto.includes(query) || (emp.clave_empleado && emp.clave_empleado.toLowerCase().includes(query));
    }) : empleadosListaAguinaldo;
    renderizarListaSeleccion(listaRender);
}

function actualizarContadores() {
    const total = empleadosSeleccionadosAguinaldo.size;
    $('#contador_seleccionados, #contador_seleccionados_btn').text(total);
}

function generarSeleccionados() {
    if (empleadosSeleccionadosAguinaldo.size === 0) {
        Swal.fire('Atención', 'Selecciona al menos un empleado.', 'warning');
        return;
    }

    const seleccionados = jsonAguinaldo.empleados.filter(e => empleadosSeleccionadosAguinaldo.has(String(e.id_empleado)));
    enviarDatosTicketAguinaldo(seleccionados);
}

function enviarDatosTicketAguinaldo(empleados) {
    const btn = $('#btn_generar_tickets_seleccionados');
    const original = btn.html();
    btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Generando...');

    $.ajax({
        url: 'php/descargar_ticket_aguinaldo_pdf.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            empleados: empleados,
            meta: { anio: jsonAguinaldo.anio || '' }
        }),
        xhrFields: { responseType: 'blob' },
        success: function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tickets_aguinaldo.pdf';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            $('#modal_seleccion_tickets_aguinaldo').modal('hide');
            Swal.fire({ icon: 'success', title: 'Tickets generados', timer: 1500, showConfirmButton: false });
            btn.prop('disabled', false).html(original);
        },
        error: function() {
            Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
            btn.prop('disabled', false).html(original);
        }
    });
}
