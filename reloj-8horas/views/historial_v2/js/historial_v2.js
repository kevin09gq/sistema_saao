/**
 * Historial V2 - Lógica principal
 */

let historialGlobal = [];
let modoActual = 'semana'; // 'semana' | 'persona'
let paginaActualSemana = 1;
let paginaActualPersona = 1;
const registrosPorPagina = 10;

$(document).ready(function () {
    inicializarApp();
});

function inicializarApp() {
    cargarEmpresas();
    cargarDepartamentos();
    configurarEventListeners();
}

function configurarEventListeners() {
    // Cambio de modo (Tabs)
    $('#pills-semana-tab').on('click', function () {
        modoActual = 'semana';
        $('#contenedor_filtro_semana').show();
        actualizarVista();
    });

    $('#pills-persona-tab').on('click', function () {
        modoActual = 'persona';
        $('#contenedor_filtro_semana').show();
        actualizarVista();
    });

    // Botón de regreso principal (el que está junto a las pestañas)
    $('#btn_regresar_lista_top').on('click', function() {
        $('#filtro_semana').val('').trigger('change');
    });

    // Filtros principales
    $('#filtro_empresa').on('change', function () {
        const idEmpresa = $(this).val();
        $('#filtro_anio').empty().append('<option value="">Selecciona año</option>').prop('disabled', true);
        $('#filtro_semana').empty().append('<option value="">Todas</option>').prop('disabled', true);
        
        if (idEmpresa) {
            cargarAnios(idEmpresa);
        }
        actualizarVista();
    });

    $('#filtro_anio').on('change', function () {
        const idEmpresa = $('#filtro_empresa').val();
        const anio = $(this).val();
        $('#filtro_semana').empty().append('<option value="">Todas</option>').prop('disabled', true);
        
        if (idEmpresa && anio) {
            cargarSemanas(idEmpresa, anio);
            cargarDatosHistorial();
        } else {
            actualizarVista();
        }
    });

    $('#filtro_semana').on('change', function () {
        paginaActualSemana = 1;
        paginaActualPersona = 1;
        actualizarVista();
    });

    $('#filtro_departamento').on('change', function () {
        if ($('#filtro_empresa').val() && $('#filtro_anio').val()) {
            cargarDatosHistorial();
        }
    });

    // Buscador y orden en persona
    $('#persona_buscar').on('input', function () {
        paginaActualPersona = 1;
        renderizarTablaPersona();
    });

    $('#persona_orden').on('change', function () {
        renderizarTablaPersona();
    });

    $('#btn_limpiar_filtros').on('click', function () {
        $('#filtro_empresa').val('').trigger('change');
        $('#filtro_departamento').val('');
        $('#persona_buscar').val('');
        $('#persona_orden').val('nombre_asc');
    });
}

// --- Carga de Datos (AJAX) ---

function cargarEmpresas() {
    $.get('../../php/obtener_empresas.php', function (res) {
        if (res.success) {
            const select = $('#filtro_empresa');
            select.empty().append('<option value="">Selecciona empresa</option>');
            res.data.forEach(e => {
                select.append(`<option value="${e.id_empresa}">${e.nombre_empresa}</option>`);
            });
        }
    });
}

function cargarDepartamentos() {
    $.get('../../../public/php/obtenerDepartamentos.php', function (res) {
        const select = $('#filtro_departamento');
        select.empty().append('<option value="">Todos los departamentos</option>');
        
        let datos = [];
        if (typeof res === 'string') {
            try {
                datos = JSON.parse(res);
            } catch (e) {
                console.error("Error al parsear departamentos:", e);
            }
        } else if (Array.isArray(res)) {
            datos = res;
        }

        if (datos.length > 0) {
            datos.forEach(d => {
                select.append(`<option value="${d.id_departamento}">${d.nombre_departamento}</option>`);
            });
        }
    });
}

function cargarAnios(idEmpresa) {
    $.get('../../php/obtener_anios_por_empresa.php', { id_empresa: idEmpresa }, function (res) {
        if (res.success) {
            const select = $('#filtro_anio');
            select.empty().append('<option value="">Selecciona año</option>');
            res.data.forEach(a => {
                select.append(`<option value="${a}">${a}</option>`);
            });
            select.prop('disabled', false);
        }
    });
}

function cargarSemanas(idEmpresa, anio) {
    $.get('../../php/obtener_semanas_por_empresa_anio.php', { id_empresa: idEmpresa, anio: anio }, function (res) {
        if (res.success) {
            const select = $('#filtro_semana');
            select.empty().append('<option value="">Todas las semanas</option>');
            res.data.forEach(s => {
                select.append(`<option value="${s}">Semana ${s}</option>`);
            });
            select.prop('disabled', false);
        }
    });
}

function cargarDatosHistorial() {
    const idEmpresa = $('#filtro_empresa').val();
    const anio = $('#filtro_anio').val();
    const idDepto = $('#filtro_departamento').val();

    if (!idEmpresa || !anio) return;

    const tbody = modoActual === 'semana' ? $('#tbody_semana') : $('#tbody_persona');
    tbody.html('<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>');

    $.get('../../php/obtener_historial.php', { id_empresa: idEmpresa, anio: anio, id_departamento: idDepto }, function (res) {
        if (res.success) {
            historialGlobal = res.data;
            actualizarVista();
        } else {
            historialGlobal = [];
            mostrarSinDatos();
        }
    });
}

// --- Renderizado de Vistas ---

function actualizarVista() {
    const semanaSel = $('#filtro_semana').val();
    
    // Controlar visibilidad del botón de regreso principal
    if (semanaSel && semanaSel !== '') {
        $('#btn_regresar_lista_top').fadeIn();
    } else {
        $('#btn_regresar_lista_top').fadeOut();
    }
    
    if (!semanaSel) {
        // Si no hay semana, ambos modos muestran la lista de semanas
        renderizarTablaSemana();
    } else {
        // Si hay semana, depende del modo
        if (modoActual === 'semana') {
            renderizarTablaSemana();
        } else {
            cargarDetallePersona();
        }
    }
}

function renderizarTablaSemana() {
    const tbody = modoActual === 'semana' ? $('#tbody_semana') : $('#tbody_persona');
    const thead = modoActual === 'semana' ? $('#tabla_semana thead') : $('#tabla_persona thead');
    const semanaSel = $('#filtro_semana').val();
    const anioSel = $('#filtro_anio').val();
    const esVistaLista = !semanaSel || semanaSel === '';

    if (historialGlobal.length === 0) {
        mostrarSinDatos();
        return;
    }

    // Filtrar estrictamente por el año seleccionado
    let datos = historialGlobal.filter(d => String(d.anio) === String(anioSel));
    
    if (semanaSel) {
        datos = datos.filter(d => String(d.semana) === String(semanaSel));
    }

    // Ordenar por semana
    datos.sort((a, b) => parseInt(a.semana) - parseInt(b.semana));

    // Paginación
    const totalPaginas = Math.ceil(datos.length / registrosPorPagina);
    const actualPagina = modoActual === 'semana' ? paginaActualSemana : paginaActualPersona;
    const inicio = (actualPagina - 1) * registrosPorPagina;
    const items = datos.slice(inicio, inicio + registrosPorPagina);

    tbody.empty();
    
    if (esVistaLista) {
        thead.html(`<tr><th class="ps-3 border-0">Lista de Semanas Disponibles</th><th class="pe-3 border-0 text-end">Acciones</th></tr>`);
    } else {
        thead.html(`
            <tr>
                <th class="ps-3 border-0">Semana</th>
                <th class="border-0">Vacaciones</th>
                <th class="border-0">Ausencias</th>
                <th class="border-0">Incapacidades</th>
                <th class="border-0 text-center">Días Pagados</th>
                <th class="pe-3 border-0 text-end">Acciones</th>
            </tr>
        `);
    }

    items.forEach(r => {
        let html = `<tr data-semana="${r.semana}" data-anio="${r.anio}">`;
        if (esVistaLista) {
            html += `
                <td class="ps-3">
                    <div class="d-flex align-items-center py-1">
                        <div class="bg-primary bg-opacity-10 p-2 rounded-2 me-3" style="width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;">
                            <i class="bi bi-calendar3 text-primary small"></i>
                        </div>
                        <div class="flex-grow-1">
                            <span class="fw-bold text-dark">Semana ${r.semana} / ${r.anio}</span>
                            <div class="text-muted" style="font-size: 0.75rem;">Resumen: ${r.vacaciones} Vac | ${r.ausencias} Aus | ${r.incapacidades} Inc</div>
                        </div>
                        <div class="dots-separator d-none d-md-block"></div>
                    </div>
                </td>
                <td class="pe-3 text-end">
                            <div class="d-inline-block">
                                <button class="btn btn-sm btn-outline-primary btn-ver-detalle-semana" data-semana="${r.semana}">Ver detalles</button>
                            </div>
                </td>
            `;
        } else {
            html += `
                <td class="ps-3 fw-bold">Semana ${r.semana} / ${r.anio}</td>
                <td><span class="badge badge-soft-azul" title="Click para ver empleados">${r.vacaciones}</span></td>
                <td><span class="badge badge-soft-morado" title="Click para ver empleados">${r.ausencias}</span></td>
                <td><span class="badge badge-soft-gris" title="Click para ver empleados">${r.incapacidades}</span></td>
                <td class="text-center"><span class="badge badge-soft-negro" title="Click para ver empleados">${r.dias_trabajados}</span></td>
                <td class="pe-3 text-end">
                    <div class="d-inline-block">
                        <button class="btn btn-sm btn-outline-primary btn-modal-empleados" data-semana="${r.semana}" data-anio="${r.anio}">Ver empleados</button>
                    </div>
                </td>
            `;
        }
        html += `</tr>`;
        tbody.append(html);
    });

    if (!esVistaLista && datos.length > 0) {
        let tVac = 0, tAus = 0, tInc = 0, tPag = 0;
        datos.forEach(d => {
            tVac += parseInt(d.vacaciones);
            tAus += parseInt(d.ausencias);
            tInc += parseInt(d.incapacidades);
            tPag += parseInt(d.dias_trabajados);
        });
        tbody.append(`
            <tr class="bg-light fw-bold" style="font-size: 0.85rem;">
                <td class="ps-3">TOTAL</td>
                <td><span class="text-primary">${tVac}</span></td>
                <td><span class="text-purple" style="color:#6f42c1">${tAus}</span></td>
                <td><span class="text-secondary">${tInc}</span></td>
                <td class="text-center">${tPag}</td>
                <td></td>
            </tr>
        `);
    }

    renderizarPaginacion(modoActual, totalPaginas);
    vincularEventosTabla();
}

let detallePersonaGlobal = [];
function cargarDetallePersona() {
    const idEmpresa = $('#filtro_empresa').val();
    const anio = $('#filtro_anio').val();
    const semana = $('#filtro_semana').val();
    const idDepto = $('#filtro_departamento').val();

    if (!idEmpresa || !anio || !semana) return;

    $('#tbody_persona').html('<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>');

    $.get('../../php/obtener_detalle_semana.php', { 
        id_empresa: idEmpresa, 
        anio: anio, 
        semana: semana,
        id_departamento: idDepto 
    }, function (res) {
        if (res.success) {
            detallePersonaGlobal = res.data;
            renderizarTablaPersona();
        } else {
            detallePersonaGlobal = [];
            mostrarSinDatos();
        }
    });
}

function renderizarTablaPersona() {
    const tbody = $('#tbody_persona');
    const thead = $('#tabla_persona thead');
    const buscar = $('#persona_buscar').val().toLowerCase();
    const orden = $('#persona_orden').val();
    const semanaSel = $('#filtro_semana').val();

    let datos = [...detallePersonaGlobal];

    // Actualizar encabezado
    if (semanaSel) {
        thead.html(`
            <tr>
                <th class="ps-3 border-0">Empleado</th>
                <th class="border-0">Vacaciones</th>
                <th class="border-0">Ausencias</th>
                <th class="border-0">Incapacidades</th>
                <th class="border-0 text-center">Días Pagados</th>
            </tr>
        `);
    }

    // Filtro búsqueda
    if (buscar) {
        datos = datos.filter(d => 
            (d.nombre_completo || d.nombre).toLowerCase().includes(buscar) || 
            (d.clave_empleado || '').toLowerCase().includes(buscar)
        );
    }

    // Orden
    datos.sort((a, b) => {
        if (orden === 'nombre_asc') return (a.nombre_completo || a.nombre).localeCompare(b.nombre_completo || b.nombre);
        if (orden === 'vacaciones-desc') return parseInt(b.vacaciones) - parseInt(a.vacaciones);
        if (orden === 'ausencias-desc') return parseInt(b.ausencias) - parseInt(a.ausencias);
        if (orden === 'incapacidades-desc') return parseInt(b.incapacidades) - parseInt(a.incapacidades);
        return 0;
    });

    const totalPaginas = Math.ceil(datos.length / registrosPorPagina);
    const inicio = (paginaActualPersona - 1) * registrosPorPagina;
    const items = datos.slice(inicio, inicio + registrosPorPagina);

    tbody.empty();
    if (items.length === 0) {
        tbody.html('<tr><td colspan="5" class="text-center py-5 text-muted">No se encontraron empleados</td></tr>');
        return;
    }

    items.forEach(p => {
        tbody.append(`
            <tr>
                <td class="ps-3">
                    <div class="fw-bold text-dark small">${p.nombre_completo || 'Empleado Desconocido'}</div>
                </td>
                <td><span class="badge badge-soft-azul" title="Click para ver detalles">${p.vacaciones}</span></td>
                <td><span class="badge badge-soft-morado" title="Click para ver detalles">${p.ausencias}</span></td>
                <td><span class="badge badge-soft-gris" title="Click para ver detalles">${p.incapacidades}</span></td>
                <td class="text-center"><span class="badge badge-soft-negro" title="Click para ver detalles">${p.dias_trabajados}</span></td>
            </tr>
        `);
    });

    renderizarPaginacion('persona', totalPaginas);
    
    vincularEventosTabla();
}

// --- Utilidades de UI ---

function renderizarPaginacion(tipo, total) {
    const div = tipo === 'semana' ? $('#paginacion_semana') : $('#paginacion_persona');
    let actual = tipo === 'semana' ? paginaActualSemana : paginaActualPersona;
    
    div.empty();
    if (total <= 1) return;

    const btnPrev = $(`<button class="btn btn-outline-primary"><i class="bi bi-chevron-left"></i></button>`)
        .prop('disabled', actual === 1)
        .on('click', () => {
            if (tipo === 'semana') { paginaActualSemana--; renderizarTablaSemana(); }
            else { paginaActualPersona--; renderizarTablaPersona(); }
        });
    
    const btnNext = $(`<button class="btn btn-outline-primary"><i class="bi bi-chevron-right"></i></button>`)
        .prop('disabled', actual === total)
        .on('click', () => {
            if (tipo === 'semana') { paginaActualSemana++; renderizarTablaSemana(); }
            else { paginaActualPersona++; renderizarTablaPersona(); }
        });

    div.append(btnPrev);
    
    // Solo mostrar algunas páginas si son muchas
    for (let i = 1; i <= total; i++) {
        const btn = $(`<button class="btn ${i === actual ? 'btn-primary text-white' : 'btn-outline-primary'}">${i}</button>`)
            .on('click', () => {
                if (tipo === 'semana') { paginaActualSemana = i; renderizarTablaSemana(); }
                else { paginaActualPersona = i; renderizarTablaPersona(); }
            });
        div.append(btn);
    }
    
    div.append(btnNext);
}

function vincularEventosTabla() {
    $('.btn-ver-detalle-semana').off('click').on('click', function() {
        const sem = $(this).data('semana');
        $('#filtro_semana').val(sem).trigger('change');
    });

    $('.btn-regresar-lista').off('click').on('click', function(e) {
        e.preventDefault();
        $('#filtro_semana').val('').trigger('change');
    });

    $('.btn-modal-empleados').off('click').on('click', function(e) {
        e.preventDefault();
        const sem = $(this).data('semana');
        const anio = $(this).data('anio');
        abrirModalDetalle(sem, anio);
    });

    // --- NUEVO: Interacción con Badges (Click y Click Derecho) ---
    
    // Click normal en badges para ver detalles
    $('.badge-soft-azul, .badge-soft-morado, .badge-soft-gris, .badge-soft-negro').off('click').on('click', function() {
        const tr = $(this).closest('tr');
        const sem = tr.data('semana');
        const anio = tr.data('anio');
        
        if (sem && anio) {
            let columna = null;
            if ($(this).hasClass('badge-soft-azul')) columna = 'vacaciones';
            else if ($(this).hasClass('badge-soft-morado')) columna = 'ausencias';
            else if ($(this).hasClass('badge-soft-gris')) columna = 'incapacidades';
            else if ($(this).hasClass('badge-soft-negro')) columna = 'dias_trabajados';
            
            abrirModalDetalle(sem, anio, columna);
        }
    });

    // Click derecho (Context Menu) en badges
    $('.badge-soft-azul, .badge-soft-morado, .badge-soft-gris, .badge-soft-negro').off('contextmenu').on('contextmenu', function(e) {
        e.preventDefault();
        $(".custom-context-menu").remove();
        
        const tr = $(this).closest('tr');
        const sem = tr.data('semana');
        const anio = tr.data('anio');
        
        if (!sem || !anio) return;

        let columna = null;
        if ($(this).hasClass('badge-soft-azul')) columna = 'vacaciones';
        else if ($(this).hasClass('badge-soft-morado')) columna = 'ausencias';
        else if ($(this).hasClass('badge-soft-gris')) columna = 'incapacidades';
        else if ($(this).hasClass('badge-soft-negro')) columna = 'dias_trabajados';

        const menu = $(`
            <div class="custom-context-menu dropdown-menu show" style="position:fixed; z-index:2000; left:${e.pageX}px; top:${e.pageY}px; display:block; min-width:150px;">
                <a class="dropdown-item context-menu-item" href="#"><i class="bi bi-eye me-2"></i>Ver detalles</a>
            </div>
        `);
        
        $('body').append(menu);
        
        menu.find('.context-menu-item').on('click', function(e) {
            e.preventDefault();
            $(".custom-context-menu").remove();
            abrirModalDetalle(sem, anio, columna);
        });

        $(document).on('click.contextmenu_v2', function() {
            $(".custom-context-menu").remove();
            $(document).off('click.contextmenu_v2');
        });
    });
}

function abrirModalDetalle(semana, anio, columnaFija = null) {
    const idEmpresa = $('#filtro_empresa').val();
    const idDepto = $('#filtro_departamento').val();
    
    let tituloColumna = "";
    if (columnaFija) {
        switch(columnaFija) {
            case 'vacaciones': tituloColumna = " - Vacaciones"; break;
            case 'ausencias': tituloColumna = " - Ausencias"; break;
            case 'incapacidades': tituloColumna = " - Incapacidades"; break;
            case 'dias_trabajados': tituloColumna = " - Días Pagados"; break;
        }
    }

    $('#modalTitulo').text(`Detalle de Semana ${semana} / ${anio}${tituloColumna}`);
    $('#modalSubtitulo').text(columnaFija ? `Mostrando solo empleados con ${tituloColumna.replace(' - ', '')}` : 'Listado de empleados y sus incidencias registradas');
    $('#tbody_modal').html('<tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>');
    
    // Actualizar encabezado del modal dinámicamente
    const theadModal = $('#tabla_modal thead');
    if (columnaFija) {
        let thEspecifico = "";
        switch(columnaFija) {
            case 'vacaciones': thEspecifico = "<th>Vacaciones</th>"; break;
            case 'ausencias': thEspecifico = "<th>Ausencias</th>"; break;
            case 'incapacidades': thEspecifico = "<th>Incapacidades</th>"; break;
            case 'dias_trabajados': thEspecifico = "<th class='text-center'>Días Pagados</th>"; break;
        }
        theadModal.html(`
            <tr>
                <th>Empleado</th>
                ${thEspecifico}
            </tr>
        `);
    } else {
        theadModal.html(`
            <tr>
                <th>Empleado</th>
                <th>Vacaciones</th>
                <th>Ausencias</th>
                <th>Incapacidades</th>
                <th class="text-center">Días Pagados</th>
            </tr>
        `);
    }

    const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
    modal.show();

    $.get('../../php/obtener_detalle_semana.php', { 
        id_empresa: idEmpresa, 
        anio: anio, 
        semana: semana,
        id_departamento: idDepto 
    }, function (res) {
        const tbody = $('#tbody_modal');
        tbody.empty();
        if (res.success && res.data.length > 0) {
            let datos = res.data;
            
            // Si hay columna fija, filtrar estrictamente solo los que tengan valor > 0 en esa columna
            if (columnaFija) {
                datos = datos.filter(p => parseInt(p[columnaFija]) > 0);
            }

            if (datos.length === 0) {
                tbody.html(`<tr><td colspan="${columnaFija ? 2 : 5}" class="text-center py-4 text-muted">No hay registros de ${columnaFija || 'datos'} en esta semana</td></tr>`);
                return;
            }

            datos.forEach(p => {
                if (columnaFija) {
                    let tdEspecifico = "";
                    switch(columnaFija) {
                        case 'vacaciones': tdEspecifico = `<td><span class="badge badge-soft-azul">${p.vacaciones}</span></td>`; break;
                        case 'ausencias': tdEspecifico = `<td><span class="badge badge-soft-morado">${p.ausencias}</span></td>`; break;
                        case 'incapacidades': tdEspecifico = `<td><span class="badge badge-soft-gris">${p.incapacidades}</span></td>`; break;
                        case 'dias_trabajados': tdEspecifico = `<td class="text-center"><span class="badge badge-soft-negro">${p.dias_trabajados}</span></td>`; break;
                    }
                    tbody.append(`
                        <tr>
                            <td>
                                <div class="fw-bold small">${p.nombre_completo || 'Empleado Desconocido'}</div>
                            </td>
                            ${tdEspecifico}
                        </tr>
                    `);
                } else {
                    tbody.append(`
                        <tr>
                            <td>
                                <div class="fw-bold small">${p.nombre_completo || 'Empleado Desconocido'}</div>
                            </td>
                            <td><span class="badge badge-soft-azul">${p.vacaciones}</span></td>
                            <td><span class="badge badge-soft-morado">${p.ausencias}</span></td>
                            <td><span class="badge badge-soft-gris">${p.incapacidades}</span></td>
                            <td class="text-center"><span class="badge badge-soft-negro">${p.dias_trabajados}</span></td>
                        </tr>
                    `);
                }
            });
        } else {
            tbody.html(`<tr><td colspan="${columnaFija ? 2 : 5}" class="text-center py-4 text-muted">No hay datos disponibles</td></tr>`);
        }
    });
}

function mostrarSinDatos() {
    const tbody = modoActual === 'semana' ? $('#tbody_semana') : $('#tbody_persona');
    tbody.html(`
        <tr>
            <td colspan="6" class="text-center py-5">
                <div class="text-muted">
                    <i class="bi bi-folder-x fs-1 d-block mb-3"></i>
                    No se encontraron registros para los filtros seleccionados
                </div>
            </td>
        </tr>
    `);
    if (modoActual === 'semana') $('#paginacion_semana').empty();
    else $('#paginacion_persona').empty();
}
