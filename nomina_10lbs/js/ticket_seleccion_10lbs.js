let empleadosParaTickets10lbs = [];
let empleadosSeleccionados10lbs = new Set();

function claveCompuestaTicket(emp, deptoNombre) {
    const clave = String(emp?.clave || '').trim();
    const idEmpresa = String(emp?.id_empresa ?? '1').trim() || '1';
    const esSinSeguro = (emp?.seguroSocial === false) || String(deptoNombre || '').toLowerCase().includes('sin seguro');
    // Estructura: idEmpresa|SS o N|clave para asegurar unicidad
    return `${idEmpresa}|${esSinSeguro ? 'SS' : 'N'}|${clave}`;
}

function obtenerNombreEmpresaPorId(idEmpresa) {
    const v = String(idEmpresa ?? '').trim();
    // Intentar buscar en un select de empresas si existe, si no, usar nombres conocidos
    const $sel = $('#filtro-empresa');
    if ($sel.length) {
        const $opt = $sel.find(`option[value="${v}"]`);
        if ($opt.length) return String($opt.text() || '').trim();
    }
    
    // Fallback para nombres comunes si no hay select
    const empresas = {
        '1': 'Cítricos SAA',
        '2': 'SB Group',
        '3': 'Otro'
    };
    return empresas[v] || '';
}

function obtenerNomina10lbsGlobal() {
    if (window.jsonNomina10lbs && Array.isArray(window.jsonNomina10lbs.departamentos)) return window.jsonNomina10lbs;
    if (typeof jsonNomina10lbs !== 'undefined' && jsonNomina10lbs && Array.isArray(jsonNomina10lbs.departamentos)) return jsonNomina10lbs;
    return null;
}

function cargarEmpleadosParaTickets10lbs() {
    empleadosParaTickets10lbs = [];
    empleadosSeleccionados10lbs.clear();

    const pool = (typeof obtenerTodosEmpleados10lbs === 'function') ? obtenerTodosEmpleados10lbs() : [];
    pool.forEach(({ emp, deptoNombre }) => {
        if (!emp || typeof emp !== 'object') return;
        const esSinSeguro = (emp?.seguroSocial === false) || String(deptoNombre || '').toLowerCase().includes('sin seguro');
        empleadosParaTickets10lbs.push({
            original: emp,
            clave: emp.clave,
            nombre: emp.nombre,
            departamento: String(deptoNombre || ''),
            id: claveCompuestaTicket(emp, deptoNombre),
            esSinSeguro: esSinSeguro
        });
    });

    // Ordenar: primero con seguro (esSinSeguro = false), luego sin seguro (esSinSeguro = true)
    empleadosParaTickets10lbs.sort((a, b) => {
        if (a.esSinSeguro === b.esSinSeguro) {
            return String(a.nombre || '').localeCompare(String(b.nombre || ''));
        }
        return a.esSinSeguro ? 1 : -1;
    });

    mostrarEmpleadosTickets10lbs(empleadosParaTickets10lbs);
    actualizarContadoresTickets10lbs();
}

function mostrarEmpleadosTickets10lbs(empleados) {
    const $container = $('#lista_empleados_tickets');
    $container.empty();

    if (!empleados || empleados.length === 0) {
        $container.html('<div class="col-12"><div class="alert alert-info text-center">No se encontraron empleados</div></div>');
        return;
    }

    const listaHtml = `
        <div class="list-group">
            ${empleados.map(item => {
                const claveUnica = String(item.id || '');
                const nombre = String(item.nombre || '').trim() || 'Sin nombre';
                const departamento = String(item.departamento || '').trim() || 'Sin departamento';
                const idEmpresa = (item.original && item.original.id_empresa !== undefined) ? item.original.id_empresa : 1;
                const empresaTxt = obtenerNombreEmpresaPorId(idEmpresa);
                const esSinSeguro = departamento.toLowerCase().trim() === 'sin seguro';
                const claveBase = String(item.clave || '').trim();
                const claveMostrar = esSinSeguro ? `SS/${claveBase}` : claveBase;

                let badgeClass = 'bg-secondary';
                const deptoLower = departamento.toLowerCase();
                if (deptoLower.includes('administracion') || deptoLower.includes('administración') || deptoLower.includes('admin')) {
                    badgeClass = 'badge bg-primary rounded-pill';
                } else if (deptoLower.includes('produccion') || deptoLower.includes('producción') || deptoLower.includes('produc')) {
                    badgeClass = 'badge bg-success rounded-pill';
                } else if (deptoLower.trim() === 'seguridad vigilancia e intendencia'.toLowerCase()) {
                    badgeClass = 'badge rounded-pill';
                } else if (deptoLower.includes('sin seguro')) {
                    badgeClass = 'badge bg-warning text-dark rounded-pill';
                }

                const isSelected = empleadosSeleccionados10lbs.has(claveUnica);
                const itemClass = isSelected
                    ? 'list-group-item list-group-item-action active d-flex justify-content-between align-items-center'
                    : 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';

                return `
                    <div class="${itemClass} empleado-item" data-clave="${claveUnica}" data-nombre="${nombre.toLowerCase()}" style="cursor: pointer;">
                        <div>
                            <div class="fw-bold">${nombre}</div>
                            <small class="${isSelected ? 'text-white' : 'text-muted'}">
                                Clave: ${claveMostrar}${empresaTxt ? ` | Empresa: ${empresaTxt}` : ''}
                            </small>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="${badgeClass}" ${deptoLower.trim() === 'seguridad vigilancia e intendencia'.toLowerCase() ? 'style="background-color:#6f42c1;"' : ''}>${departamento}</span>
                            <input class="form-check-input" type="checkbox" ${isSelected ? 'checked' : ''}>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    $container.html(listaHtml);
}

function actualizarContadoresTickets10lbs() {
    const count = empleadosSeleccionados10lbs.size;
    $('#contador_seleccionados').text(count);
    $('#contador_seleccionados_btn').text(count);
    $('#btn_generar_tickets_seleccionados').prop('disabled', count === 0);
    $('#btn_generar_tickets_nombre_seleccionados').prop('disabled', count === 0);
}

let filtroSeguroActivo10lbs = 'todos';

function filtrarEmpleadosTickets10lbs() {
    const query = String($('#buscar_empleado_ticket').val() || '').toLowerCase().trim();

    if (query !== '') {
        $('#btn_limpiar_busqueda').css('display', 'flex');
    } else {
        $('#btn_limpiar_busqueda').hide();
    }

    const filtrados = empleadosParaTickets10lbs.filter(emp => {
        // Filtro por texto
        const coincideQuery = query === '' || 
            String(emp.nombre || '').toLowerCase().includes(query) || 
            String(emp.clave || '').toLowerCase().includes(query) || 
            String(emp.departamento || '').toLowerCase().includes(query);
        
        // Filtro por seguro
        let coincideSeguro = true;
        if (filtroSeguroActivo10lbs === 'con_seguro') coincideSeguro = !emp.esSinSeguro;
        else if (filtroSeguroActivo10lbs === 'sin_seguro') coincideSeguro = emp.esSinSeguro;

        return coincideQuery && coincideSeguro;
    });

    mostrarEmpleadosTickets10lbs(filtrados);
}

function actualizarEstilosFiltros10lbs() {
    $('#btn_seleccionar_todos_tickets').toggleClass('active', filtroSeguroActivo10lbs === 'todos');
    $('#btn_seleccionar_con_seguro_tickets').toggleClass('active', filtroSeguroActivo10lbs === 'con_seguro');
    $('#btn_seleccionar_sin_seguro_tickets').toggleClass('active', filtroSeguroActivo10lbs === 'sin_seguro');
}

function limpiarCampoBusquedaTickets10lbs() {
    $('#buscar_empleado_ticket').val('').trigger('input');
    $('#btn_limpiar_busqueda').hide();
}

async function generarTicketsSeleccionados10lbs() {
    if (empleadosSeleccionados10lbs.size === 0) return;

    const seleccionados = [];
    empleadosParaTickets10lbs.forEach(item => {
        if (empleadosSeleccionados10lbs.has(item.id)) {
            const copia = JSON.parse(JSON.stringify(item.original || {}));
            copia.departamento = String(item.departamento || '').trim();
            const esSinSeguro = (copia.seguroSocial === false) || String(copia.departamento).toLowerCase().includes('sin seguro');
            if (esSinSeguro) {
                copia.sin_seguro_ticket = true;
            }
            if (copia.id_empresa === undefined || copia.id_empresa === null || copia.id_empresa === '') {
                copia.id_empresa = 1;
            }
            seleccionados.push({ emp: copia, deptoNombre: copia.departamento });
        }
    });

    if (seleccionados.length === 0) return;

    const nominaParaEnviar = (typeof construirNominaParaTickets10lbs === 'function')
        ? construirNominaParaTickets10lbs(seleccionados)
        : null;

    if (!nominaParaEnviar) return;

    $('#modal_seleccion_tickets').modal('hide');

    Swal.fire({
        title: 'Generando tickets...',
        html: `Empleados: <strong>${seleccionados.length}</strong>`,
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch('../php/descargar_ticket_pdf.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({ nomina: nominaParaEnviar, filename_prefix: 'tickets_10lbs_seleccion' })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        if (!(blob instanceof Blob) || blob.size === 0) throw new Error('PDF vacío');

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets_10lbs_seleccion_${seleccionados.length}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        Swal.fire({ icon: 'success', title: 'Listo', text: 'Tickets generados correctamente', timer: 1500, showConfirmButton: false });
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron generar los tickets.' });
    }
}

$(document).ready(function () {
    const $btnAbrir = $('#btn_ticket_manual_10lbs');
    $btnAbrir.on('click', function () {
        const nomina = obtenerNomina10lbsGlobal();
        if (!nomina || !Array.isArray(nomina.departamentos)) {
            Swal.fire({ icon: 'warning', title: 'Sin datos', text: 'No hay datos de nómina cargados.' });
            return;
        }
        filtroSeguroActivo10lbs = 'todos';
        actualizarEstilosFiltros10lbs();
        cargarEmpleadosParaTickets10lbs();
        $('#modal_seleccion_tickets').modal('show');
    });

    $('#btn_seleccionar_todos_tickets').on('click', function () {
        filtroSeguroActivo10lbs = 'todos';
        actualizarEstilosFiltros10lbs();
        filtrarEmpleadosTickets10lbs();
    });

    $('#btn_seleccionar_con_seguro_tickets').on('click', function () {
        filtroSeguroActivo10lbs = 'con_seguro';
        actualizarEstilosFiltros10lbs();
        filtrarEmpleadosTickets10lbs();
    });

    $('#btn_seleccionar_sin_seguro_tickets').on('click', function () {
        filtroSeguroActivo10lbs = 'sin_seguro';
        actualizarEstilosFiltros10lbs();
        filtrarEmpleadosTickets10lbs();
    });

    $('#btn_marcar_visibles_tickets').on('click', function () {
        const query = String($('#buscar_empleado_ticket').val() || '').toLowerCase().trim();
        empleadosParaTickets10lbs.forEach(emp => {
            // Verificar si el empleado cumple con el filtro de texto
            const coincideQuery = query === '' || 
                String(emp.nombre || '').toLowerCase().includes(query) || 
                String(emp.clave || '').toLowerCase().includes(query) || 
                String(emp.departamento || '').toLowerCase().includes(query);
            
            // Verificar si el empleado cumple con el filtro de seguro
            let coincideSeguro = true;
            if (filtroSeguroActivo10lbs === 'con_seguro') coincideSeguro = !emp.esSinSeguro;
            else if (filtroSeguroActivo10lbs === 'sin_seguro') coincideSeguro = emp.esSinSeguro;

            if (coincideQuery && coincideSeguro) {
                empleadosSeleccionados10lbs.add(String(emp.id));
            }
        });
        actualizarVistaSeleccionTickets10lbs();
    });

    $('#btn_deseleccionar_todos_tickets').on('click', function () {
        const query = String($('#buscar_empleado_ticket').val() || '').toLowerCase().trim();
        if (query === '') {
            empleadosSeleccionados10lbs.clear();
        } else {
            empleadosParaTickets10lbs.forEach(emp => {
                const nombre = String(emp.nombre || '').toLowerCase();
                const claveBase = String(emp.clave || '');
                const depto = String(emp.departamento || '').toLowerCase();
                if (nombre.includes(query) || claveBase.includes(query) || depto.includes(query)) {
                    empleadosSeleccionados10lbs.delete(String(emp.id));
                }
            });
        }
        actualizarVistaSeleccionTickets10lbs();
    });

    $(document).on('click', '.empleado-item', function (e) {
        if ($(e.target).is('input[type="checkbox"]')) return;
        const id = String($(this).data('clave') || '');
        if (id === '') return;
        const $chk = $(this).find('input[type="checkbox"]');
        if (empleadosSeleccionados10lbs.has(id)) {
            empleadosSeleccionados10lbs.delete(id);
            $(this).removeClass('active');
            $chk.prop('checked', false);
        } else {
            empleadosSeleccionados10lbs.add(id);
            $(this).addClass('active');
            $chk.prop('checked', true);
        }
        actualizarContadoresTickets10lbs();
    });

    $(document).on('change', '.empleado-item input[type="checkbox"]', function () {
        const $it = $(this).closest('.empleado-item');
        const id = String($it.data('clave') || '');
        if (id === '') return;
        if ($(this).is(':checked')) {
            empleadosSeleccionados10lbs.add(id);
            $it.addClass('active');
        } else {
            empleadosSeleccionados10lbs.delete(id);
            $it.removeClass('active');
        }
        actualizarContadoresTickets10lbs();
    });

    $(document).on('input', '#buscar_empleado_ticket', filtrarEmpleadosTickets10lbs);
    $('#btn_limpiar_busqueda').on('click', limpiarCampoBusquedaTickets10lbs);
    $('#btn_generar_tickets_seleccionados').on('click', generarTicketsSeleccionados10lbs);
    $('#btn_generar_tickets_nombre_seleccionados').on('click', generarTicketsNombreSeleccionados10lbs);
});

function actualizarVistaSeleccionTickets10lbs() {
    $('.empleado-item').each(function () {
        const id = String($(this).data('clave') || '');
        const checkbox = $(this).find('input[type="checkbox"]');
        if (id !== '' && empleadosSeleccionados10lbs.has(id)) {
            $(this).addClass('active');
            checkbox.prop('checked', true);
        } else {
            $(this).removeClass('active');
            checkbox.prop('checked', false);
        }
    });
    actualizarContadoresTickets10lbs();
}

function generarTicketsNombreSeleccionados10lbs() {
    if (empleadosSeleccionados10lbs.size === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin selección',
            text: 'Por favor, selecciona al menos un empleado para generar tickets.'
        });
        return;
    }
    
    const nominaData = obtenerNomina10lbsGlobal();
    if (!nominaData) {
        Swal.fire('Error', 'No hay datos de nómina disponibles.', 'error');
        return;
    }

    const seleccionados = [];
    
    // Obtener los datos más recientes de los empleados seleccionados
    empleadosParaTickets10lbs.forEach(item => {
        const clave = String(item.id || '');
        if (empleadosSeleccionados10lbs.has(clave)) {
            // Aseguramos que usamos la referencia original que se actualiza con la tabla
            const empActualizado = item.original;
            if (empActualizado) {
                // Añadir departamento al objeto para el PDF
                empActualizado.departamento = item.departamento;
                seleccionados.push(empActualizado);
            }
        }
    });
    
    if (seleccionados.length === 0) return;
    
    // Preparar datos en formato de nómina para el endpoint
    const nominaParaEnviar = construirNominaParaTickets10lbs(seleccionados.map(emp => ({
        emp,
        deptoNombre: emp.departamento || ''
    })));
    
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
        contentType: 'application/json; charset=UTF-8',
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
            
            let filename = 'tickets_nombre_seleccionados_10lbs.pdf';
            const disposition = xhr.getResponseHeader('Content-Disposition');
            if (disposition && disposition.indexOf('filename=') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches && matches[1]) {
                    filename = matches[1].replace(/["']/g, '');
                }
            }
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
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
