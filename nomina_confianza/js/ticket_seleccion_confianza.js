let empleadosParaTicketsConfianza = [];
let empleadosSeleccionadosConfianza = new Set();

function claveCompuestaTicket(emp, deptoNombre) {
    const clave = String(emp?.clave || '').trim();
    const idEmpresa = String(emp?.id_empresa ?? '1').trim() || '1';
    const esSinSeguro = String(deptoNombre || '').toLowerCase().trim() === 'sin seguro';
    return `${idEmpresa}|${esSinSeguro ? 'SS' : 'N'}|${clave}`;
}

function obtenerNombreEmpresaPorId(idEmpresa) {
    const v = String(idEmpresa ?? '').trim();
    const $sel = $('#filtro-empresa');
    if (!$sel.length) return '';
    const $opt = $sel.find(`option[value="${v}"]`);
    return $opt.length ? String($opt.text() || '').trim() : '';
}

function obtenerNominaConfianzaGlobal() {
    if (window.jsonNominaConfianza && Array.isArray(window.jsonNominaConfianza.departamentos)) return window.jsonNominaConfianza;
    if (typeof jsonNominaConfianza !== 'undefined' && jsonNominaConfianza && Array.isArray(jsonNominaConfianza.departamentos)) return jsonNominaConfianza;
    return null;
}

function cargarEmpleadosParaTicketsConfianza() {
    empleadosParaTicketsConfianza = [];
    empleadosSeleccionadosConfianza.clear();

    const pool = (typeof obtenerTodosEmpleadosConfianza === 'function') ? obtenerTodosEmpleadosConfianza() : [];
    pool.forEach(({ emp, deptoNombre }) => {
        if (!emp || typeof emp !== 'object') return;
        empleadosParaTicketsConfianza.push({
            original: emp,
            clave: emp.clave,
            nombre: emp.nombre,
            departamento: String(deptoNombre || ''),
            id: claveCompuestaTicket(emp, deptoNombre)
        });
    });

    mostrarEmpleadosTicketsConfianza(empleadosParaTicketsConfianza);
    actualizarContadoresTicketsConfianza();
}

function mostrarEmpleadosTicketsConfianza(empleados) {
    const $container = $('#lista_empleados_tickets');
    $container.empty();

    if (!empleados || empleados.length === 0) {
        $container.html('<div class="col-12"><div class="alert alert-info text-center">No se encontraron empleados</div></div>');
        return;
    }

    const listaHtml = `
        <div class="list-group">
            ${empleados.map(item => {
                const clave = String(item.id || '');
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
                    badgeClass = 'departamento-badge departamento-administracion';
                } else if (deptoLower.includes('produccion') || deptoLower.includes('producción') || deptoLower.includes('produc')) {
                    badgeClass = 'departamento-badge departamento-produccion';
                } else if (deptoLower.includes('seguridad') || deptoLower.includes('vigilancia') || deptoLower.includes('intendencia')) {
                    badgeClass = 'departamento-badge departamento-seguridad';
                } else if (deptoLower.includes('sin seguro')) {
                    badgeClass = 'departamento-badge departamento-sin-seguro';
                }

                const isSelected = empleadosSeleccionadosConfianza.has(clave);
                const itemClass = isSelected
                    ? 'list-group-item list-group-item-action active d-flex justify-content-between align-items-center'
                    : 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';

                return `
                    <div class="${itemClass} empleado-item" data-clave="${clave}" data-nombre="${nombre.toLowerCase()}" style="cursor: pointer;">
                        <div>
                            <div class="fw-bold">${nombre}</div>
                            <small class="text-muted">Clave: ${claveMostrar}${empresaTxt ? ` | Empresa: ${empresaTxt}` : ''}</small>
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

    $container.html(listaHtml);
}

function actualizarContadoresTicketsConfianza() {
    const count = empleadosSeleccionadosConfianza.size;
    $('#contador_seleccionados').text(count);
    $('#contador_seleccionados_btn').text(count);
    $('#btn_generar_tickets_seleccionados').prop('disabled', count === 0);
}

function filtrarEmpleadosTicketsConfianza() {
    const query = String($('#buscar_empleado_ticket').val() || '').toLowerCase().trim();

    if (query !== '') {
        $('#btn_limpiar_busqueda').css('display', 'flex');
    } else {
        $('#btn_limpiar_busqueda').hide();
    }

    if (query === '') {
        mostrarEmpleadosTicketsConfianza(empleadosParaTicketsConfianza);
        return;
    }

    const filtrados = empleadosParaTicketsConfianza.filter(emp => {
        const nombre = String(emp.nombre || '').toLowerCase();
        const claveBase = String(emp.clave || '');
        const depto = String(emp.departamento || '').toLowerCase();
        return nombre.includes(query) || claveBase.includes(query) || depto.includes(query);
    });

    mostrarEmpleadosTicketsConfianza(filtrados);
}

function limpiarCampoBusquedaTicketsConfianza() {
    $('#buscar_empleado_ticket').val('').trigger('input');
    $('#btn_limpiar_busqueda').hide();
}

async function generarTicketsSeleccionadosConfianza() {
    if (empleadosSeleccionadosConfianza.size === 0) return;

    const seleccionados = [];
    empleadosParaTicketsConfianza.forEach(item => {
        if (empleadosSeleccionadosConfianza.has(item.id)) {
            const copia = JSON.parse(JSON.stringify(item.original || {}));
            copia.departamento = String(item.departamento || '').trim();
            if (String(copia.departamento).toLowerCase().trim() === 'sin seguro') {
                copia.sin_seguro_ticket = true;
            }
            if (copia.id_empresa === undefined || copia.id_empresa === null || copia.id_empresa === '') {
                copia.id_empresa = 1;
            }
            seleccionados.push({ emp: copia, deptoNombre: copia.departamento });
        }
    });

    if (seleccionados.length === 0) return;

    const nominaParaEnviar = (typeof construirNominaParaTicketsConfianza === 'function')
        ? construirNominaParaTicketsConfianza(seleccionados)
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
            body: JSON.stringify({ nomina: nominaParaEnviar, filename_prefix: 'tickets_confianza_seleccion' })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        if (!(blob instanceof Blob) || blob.size === 0) throw new Error('PDF vacío');

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets_confianza_seleccion_${seleccionados.length}.pdf`;
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
    const $btnAbrir = $('#btn_ticket_manual_confianza');
    $btnAbrir.on('click', function () {
        const nomina = obtenerNominaConfianzaGlobal();
        if (!nomina || !Array.isArray(nomina.departamentos)) {
            Swal.fire({ icon: 'warning', title: 'Sin datos', text: 'No hay datos de nómina cargados.' });
            return;
        }
        cargarEmpleadosParaTicketsConfianza();
        $('#modal_seleccion_tickets').modal('show');
    });

    $('#btn_seleccionar_todos_tickets').on('click', function () {
        const query = String($('#buscar_empleado_ticket').val() || '').toLowerCase().trim();
        if (query === '') {
            empleadosParaTicketsConfianza.forEach(emp => empleadosSeleccionadosConfianza.add(String(emp.id)));
        } else {
            empleadosParaTicketsConfianza.forEach(emp => {
                const nombre = String(emp.nombre || '').toLowerCase();
                const claveBase = String(emp.clave || '');
                const depto = String(emp.departamento || '').toLowerCase();
                if (nombre.includes(query) || claveBase.includes(query) || depto.includes(query)) {
                    empleadosSeleccionadosConfianza.add(String(emp.id));
                }
            });
        }
        actualizarVistaSeleccionTicketsConfianza();
    });

    $('#btn_deseleccionar_todos_tickets').on('click', function () {
        const query = String($('#buscar_empleado_ticket').val() || '').toLowerCase().trim();
        if (query === '') {
            empleadosSeleccionadosConfianza.clear();
        } else {
            empleadosParaTicketsConfianza.forEach(emp => {
                const nombre = String(emp.nombre || '').toLowerCase();
                const claveBase = String(emp.clave || '');
                const depto = String(emp.departamento || '').toLowerCase();
                if (nombre.includes(query) || claveBase.includes(query) || depto.includes(query)) {
                    empleadosSeleccionadosConfianza.delete(String(emp.id));
                }
            });
        }
        actualizarVistaSeleccionTicketsConfianza();
    });

    $(document).on('click', '.empleado-item', function (e) {
        if ($(e.target).is('input[type="checkbox"]')) return;
        const id = String($(this).data('clave') || '');
        if (id === '') return;
        const $chk = $(this).find('input[type="checkbox"]');
        if (empleadosSeleccionadosConfianza.has(id)) {
            empleadosSeleccionadosConfianza.delete(id);
            $(this).removeClass('active');
            $chk.prop('checked', false);
        } else {
            empleadosSeleccionadosConfianza.add(id);
            $(this).addClass('active');
            $chk.prop('checked', true);
        }
        actualizarContadoresTicketsConfianza();
    });

    $(document).on('change', '.empleado-item input[type="checkbox"]', function () {
        const $it = $(this).closest('.empleado-item');
        const id = String($it.data('clave') || '');
        if (id === '') return;
        if ($(this).is(':checked')) {
            empleadosSeleccionadosConfianza.add(id);
            $it.addClass('active');
        } else {
            empleadosSeleccionadosConfianza.delete(id);
            $it.removeClass('active');
        }
        actualizarContadoresTicketsConfianza();
    });

    $(document).on('input', '#buscar_empleado_ticket', filtrarEmpleadosTicketsConfianza);
    $('#btn_limpiar_busqueda').on('click', limpiarCampoBusquedaTicketsConfianza);
    $('#btn_generar_tickets_seleccionados').on('click', generarTicketsSeleccionadosConfianza);
});

function actualizarVistaSeleccionTicketsConfianza() {
    $('.empleado-item').each(function () {
        const id = String($(this).data('clave') || '');
        const checkbox = $(this).find('input[type="checkbox"]');
        if (id !== '' && empleadosSeleccionadosConfianza.has(id)) {
            $(this).addClass('active');
            checkbox.prop('checked', true);
        } else {
            $(this).removeClass('active');
            checkbox.prop('checked', false);
        }
    });
    actualizarContadoresTicketsConfianza();
}
