// ticket_ptu_pdf.js - Gestión de tickets para Reparto de Utilidades (PTU)

// Variables globales para la selección manual
let empleadosParaTicketsPTU = [];
let empleadosSeleccionadosPTU = new Set();
let filtroSeguroPTU = 'todos';

$(document).ready(function () {
    
    // ================================================================
    // 1. MODAL DE OPCIONES GENERALES (NORMAL / NOMBRE)
    // ================================================================

    // Abrir modal de opciones al hacer clic en el botón principal "Tickets"
    $('#btn_ticket_pdf').on('click', function () {
        const json = getUtilidad();
        if (!json || !json.empleados || json.empleados.length === 0) {
            Swal.fire('Sin datos', 'No hay datos de utilidades para generar los tickets.', 'warning');
            return;
        }

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalSeleccionTicket'));
        modal.show();
    });

    // Opción: Ticket Normal (Visibles)
    $('#btn_ticket_normal').on('click', function () {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalSeleccionTicket'));
        if (modal) modal.hide();
        generarTicketsPTU('normal', true); // true = solo visibles
    });

    // Opción: Ticket Nombre (Visibles)
    $('#btn_ticket_nombre').on('click', function () {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalSeleccionTicket'));
        if (modal) modal.hide();
        generarTicketsPTU('nombre', true); // true = solo visibles
    });


    // ================================================================
    // 2. MODAL DE SELECCIÓN MANUAL DE EMPLEADOS
    // ================================================================

    // Abrir modal de selección manual
    $('#btn_ticket_seleccion_ptu').on('click', function () {
        const json = getUtilidad();
        if (!json || !json.empleados || json.empleados.length === 0) {
            Swal.fire('Sin datos', 'No hay datos de utilidades para seleccionar empleados.', 'warning');
            return;
        }

        filtroSeguroPTU = 'todos';
        $('#buscar_empleado_ticket_ptu').val('');
        actualizarEstilosFiltrosPTU();
        
        cargarEmpleadosPTU(json);
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal_seleccion_tickets_ptu'));
        modal.show();
    });

    // Filtros de seguro en el modal de selección
    $('#btn_seleccionar_todos_tickets_ptu').on('click', function() {
        filtroSeguroPTU = 'todos';
        actualizarEstilosFiltrosPTU();
        filtrarListaEmpleadosPTU();
    });

    $('#btn_seleccionar_con_seguro_tickets_ptu').on('click', function() {
        filtroSeguroPTU = 'con_seguro';
        actualizarEstilosFiltrosPTU();
        filtrarListaEmpleadosPTU();
    });

    $('#btn_seleccionar_sin_seguro_tickets_ptu').on('click', function() {
        filtroSeguroPTU = 'sin_seguro';
        actualizarEstilosFiltrosPTU();
        filtrarListaEmpleadosPTU();
    });

    // Botón Marcar Visibles (dentro del modal de selección)
    $('#btn_marcar_visibles_tickets_ptu').on('click', function() {
        $('.empleado-item:not(.d-none)').each(function() {
            const clave = String($(this).data('clave'));
            empleadosSeleccionadosPTU.add(clave);
        });
        actualizarUISeleccionPTU();
    });

    // Botón Deseleccionar Todos
    $('#btn_deseleccionar_todos_tickets_ptu').on('click', function() {
        empleadosSeleccionadosPTU.clear();
        actualizarUISeleccionPTU();
    });

    // Búsqueda en tiempo real
    $('#buscar_empleado_ticket_ptu').on('input', filtrarListaEmpleadosPTU);
    
    // Limpiar búsqueda
    $('#btn_limpiar_busqueda_ptu').on('click', function() {
        $('#buscar_empleado_ticket_ptu').val('').trigger('input');
    });

    // Click en un empleado de la lista
    $(document).on('click', '.empleado-item', function() {
        const clave = String($(this).data('clave'));
        if (empleadosSeleccionadosPTU.has(clave)) {
            empleadosSeleccionadosPTU.delete(clave);
        } else {
            empleadosSeleccionadosPTU.add(clave);
        }
        actualizarUISeleccionPTU();
    });

    // Botones finales de generación en el modal de selección
    $('#btn_generar_tickets_seleccionados_ptu').on('click', function() {
        if (empleadosSeleccionadosPTU.size === 0) {
            Swal.fire('Atención', 'Selecciona al menos un empleado.', 'info');
            return;
        }
        generarTicketsPTU('normal', false); // false = usar lista seleccionada
    });

    $('#btn_generar_tickets_nombre_seleccionados_ptu').on('click', function() {
        if (empleadosSeleccionadosPTU.size === 0) {
            Swal.fire('Atención', 'Selecciona al menos un empleado.', 'info');
            return;
        }
        generarTicketsPTU('nombre', false); // false = usar lista seleccionada
    });

});


/**
 * Función núcleo para generar y descargar los tickets
 */
function generarTicketsPTU(tipo, soloVisibles) {
    const jsonFull = getUtilidad();
    if (!jsonFull) return;

    let empleadosFinales = [];

    if (soloVisibles) {
        empleadosFinales = jsonFull.empleados.filter(emp => emp.visible !== false);
    } else {
        empleadosFinales = jsonFull.empleados.filter(emp => 
            empleadosSeleccionadosPTU.has(String(emp.clave_empleado || emp.id_empleado))
        );
    }

    if (empleadosFinales.length === 0) {
        Swal.fire('Atención', 'No hay empleados para generar los tickets.', 'info');
        return;
    }

    const datosEnviar = {
        utilidad: { ...jsonFull, empleados: empleadosFinales },
        meta: { anio: jsonFull.anio || '' }
    };

    const url = (tipo === 'nombre') ? '../php/descargar_ticket_nombre_ptu_pdf.php' : '../php/descargar_ticket_ptu_pdf.php';
    const filename = (tipo === 'nombre') ? 'tickets_nombre_ptu.pdf' : 'tickets_ptu.pdf';
    const btnId = soloVisibles ? '#btn_ticket_pdf' : '#btn_generar_tickets_seleccionados_ptu';

    descargarPDF_PTU(url, datosEnviar, filename, btnId);
}


function cargarEmpleadosPTU(json) {
    empleadosParaTicketsPTU = [];
    empleadosSeleccionadosPTU.clear();
    
    json.empleados.forEach(emp => {
        if (emp.visible === false) return;
        
        // CORRECCIÓN: Usar status_seguro en lugar de status_nss
        const esSinSeguro = (emp.status_seguro !== 1);
        
        empleadosParaTicketsPTU.push({
            clave: String(emp.clave_empleado || emp.id_empleado),
            nombre: `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.trim(),
            departamento: emp.nombre_departamento || 'Sin Depto',
            esSinSeguro: esSinSeguro
        });
    });

    empleadosParaTicketsPTU.sort((a, b) => a.nombre.localeCompare(b.nombre));
    renderizarListaSeleccionPTU();
    actualizarUISeleccionPTU();
}

function renderizarListaSeleccionPTU() {
    const container = $('#lista_empleados_tickets_ptu');
    container.empty();

    empleadosParaTicketsPTU.forEach(emp => {
        const item = `
            <div class="empleado-item d-flex align-items-center" data-clave="${emp.clave}">
                <div class="form-check me-3">
                    <input class="form-check-input" type="checkbox" ${empleadosSeleccionadosPTU.has(emp.clave) ? 'checked' : ''}>
                </div>
                <div class="flex-grow-1">
                    <div class="fw-bold">${emp.clave} - ${emp.nombre}</div>
                    <div class="small text-muted">${emp.departamento} ${emp.esSinSeguro ? '<span class="badge bg-warning text-dark ms-1">Sin Seguro</span>' : ''}</div>
                </div>
            </div>
        `;
        container.append(item);
    });
    $('#info_total_empleados_ptu').text(`Total: ${empleadosParaTicketsPTU.length} empleados`);
}

function filtrarListaEmpleadosPTU() {
    const query = $('#buscar_empleado_ticket_ptu').val().toLowerCase().trim();
    $('.empleado-item').each(function() {
        const clave = String($(this).data('clave'));
        const emp = empleadosParaTicketsPTU.find(e => e.clave === clave);
        if (!emp) return;
        const coincideBusqueda = query === '' || emp.nombre.toLowerCase().includes(query) || emp.clave.toLowerCase().includes(query) || emp.departamento.toLowerCase().includes(query);
        let coincideSeguro = true;
        if (filtroSeguroPTU === 'con_seguro') coincideSeguro = !emp.esSinSeguro;
        else if (filtroSeguroPTU === 'sin_seguro') coincideSeguro = emp.esSinSeguro;
        $(this).toggleClass('d-none', !(coincideBusqueda && coincideSeguro));
    });
}

function actualizarUISeleccionPTU() {
    $('.empleado-item').each(function() {
        const clave = String($(this).data('clave'));
        const isSelected = empleadosSeleccionadosPTU.has(clave);
        $(this).toggleClass('active', isSelected);
        $(this).find('input[type="checkbox"]').prop('checked', isSelected);
    });
    const total = empleadosSeleccionadosPTU.size;
    $('#contador_seleccionados_ptu').text(total);
    $('#contador_seleccionados_btn_ticket_ptu').text(total);
    $('#contador_seleccionados_btn_nombre_ptu').text(total);
}

function actualizarEstilosFiltrosPTU() {
    $('#btn_seleccionar_todos_tickets_ptu, #btn_seleccionar_con_seguro_tickets_ptu, #btn_seleccionar_sin_seguro_tickets_ptu').removeClass('active');
    if (filtroSeguroPTU === 'todos') $('#btn_seleccionar_todos_tickets_ptu').addClass('active');
    else if (filtroSeguroPTU === 'con_seguro') $('#btn_seleccionar_con_seguro_tickets_ptu').addClass('active');
    else if (filtroSeguroPTU === 'sin_seguro') $('#btn_seleccionar_sin_seguro_tickets_ptu').addClass('active');
}

function descargarPDF_PTU(url, datos, defaultFilename, btnSelector) {
    const $btn = $(btnSelector);
    const originalHtml = $btn.html();
    $btn.prop('disabled', true).html('<i class="bi bi-hourglass-split me-1"></i> Generando...');

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(datos),
        xhrFields: { responseType: 'blob' },
        success: function (blob, status, xhr) {
            $btn.prop('disabled', false).html(originalHtml);
            if (!(blob instanceof Blob) || blob.size === 0) {
                Swal.fire('Error', 'No se pudo generar el archivo PDF.', 'error');
                return;
            }
            let filename = defaultFilename;
            const disposition = xhr.getResponseHeader('Content-Disposition');
            if (disposition && disposition.indexOf('filename=') !== -1) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1].replace(/["']/g, '');
            }
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        },
        error: function () {
            $btn.prop('disabled', false).html(originalHtml);
            Swal.fire('Error', 'Ocurrió un error al intentar generar el PDF.', 'error');
        }
    });
}
