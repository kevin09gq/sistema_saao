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
        empleadosParaTickets10lbs.push({
            original: emp,
            clave: emp.clave,
            nombre: emp.nombre,
            departamento: String(deptoNombre || ''),
            id: claveCompuestaTicket(emp, deptoNombre)
        });
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
}

function filtrarEmpleadosTickets10lbs() {
    const query = String($('#buscar_empleado_ticket').val() || '').toLowerCase().trim();

    if (query !== '') {
        $('#btn_limpiar_busqueda').css('display', 'flex');
    } else {
        $('#btn_limpiar_busqueda').hide();
    }

    if (query === '') {
        mostrarEmpleadosTickets10lbs(empleadosParaTickets10lbs);
        return;
    }

    const filtrados = empleadosParaTickets10lbs.filter(emp => {
        const nombre = String(emp.nombre || '').toLowerCase();
        const claveBase = String(emp.clave || '');
        const depto = String(emp.departamento || '').toLowerCase();
        return nombre.includes(query) || claveBase.includes(query) || depto.includes(query);
    });

    mostrarEmpleadosTickets10lbs(filtrados);
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
        cargarEmpleadosParaTickets10lbs();
        $('#modal_seleccion_tickets').modal('show');
    });

    $('#btn_seleccionar_todos_tickets').on('click', function () {
        const query = String($('#buscar_empleado_ticket').val() || '').toLowerCase().trim();
        if (query === '') {
            empleadosParaTickets10lbs.forEach(emp => empleadosSeleccionados10lbs.add(String(emp.id)));
        } else {
            empleadosParaTickets10lbs.forEach(emp => {
                const nombre = String(emp.nombre || '').toLowerCase();
                const claveBase = String(emp.clave || '');
                const depto = String(emp.departamento || '').toLowerCase();
                if (nombre.includes(query) || claveBase.includes(query) || depto.includes(query)) {
                    empleadosSeleccionados10lbs.add(String(emp.id));
                }
            });
        }
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
