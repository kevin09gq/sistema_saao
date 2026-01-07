let historialDatos = [];
let modalColumnaActual = null; // 'vacaciones' | 'ausencias' | 'incapacidades' | 'dias_trabajados' | null
let modoHistorial = 'semana';
let historialPersonaDatos = [];
let departamentosLista = [];
let personaState = { anio: null, semana: null, departamento: '', buscar: '', ordenPor: 'vacaciones' };

$(document).ready(function() {
        // Listener para búsqueda en persona
        $(document).on('input', '#persona_buscar', function() {
            $('#btn_limpiar_persona_buscar').toggle($(this).val().length > 0);
        });

        // Botón para limpiar búsqueda de persona
        $(document).on('click', '#btn_limpiar_persona_buscar', function() {
            $('#persona_buscar').val('').trigger('input');
        });
    // Listener para el nuevo filtro de orden asc/desc en el modal
    $('#modal_orden_dir_simple').on('change', function() {
        // Por defecto ordena por la columna actual o por días trabajados
        let campo = modalColumnaActual || 'dias_trabajados';
        let orden = $(this).val();
        ordenarModalDetalleSemana(campo, orden);
    });

    // Listener para búsqueda en el modal
    $(document).on('input', '#modal_buscar_empleado', function() {
        let campo = modalColumnaActual || 'dias_trabajados';
        let orden = $('#modal_orden_dir_simple').val();
        ordenarModalDetalleSemana(campo, orden);
        // Mostrar/ocultar botón limpiar
        $('#btn_limpiar_modal_buscar').toggle($(this).val().length > 0);
    });

    // Botón para limpiar búsqueda del modal
    $(document).on('click', '#btn_limpiar_modal_buscar', function() {
        $('#modal_buscar_empleado').val('').trigger('input');
    });

    cargarDepartamentos().then(() => {
        poblarDepartamentosSelect('#filtro_departamento');
        poblarDepartamentosSelect('#persona_departamento');
    }).finally(() => {
        cargarHistorial();
    });

    // Listener para filtrar detalle de semana en modal
    $('#modal_filtro_semana').on('change', function() {
        const campo = $(this).val();
        // Si hay una columna fija seleccionada por clic en badge, ignorar el select y mantener el orden por esa columna
        if (modalColumnaActual) {
            ordenarModalDetalleSemana(modalColumnaActual);
        } else {
            ordenarModalDetalleSemana(campo);
        }
    });

    $('#btn_modo_semana').on('click', function() {
        modoHistorial = 'semana';
        $('#contenedor_semana').show();
        $('#contenedor_persona').hide();
        $('#filtros_semana_bar').show();
        $('#btn_modo_semana').css({ background: '#f9fafb' });
        $('#btn_modo_persona').css({ background: '#fff' });
    });
    $('#btn_modo_persona').on('click', function() {
        modoHistorial = 'persona';
        $('#contenedor_semana').hide();
        $('#contenedor_persona').show();
        $('#filtros_semana_bar').hide();
        $('#btn_modo_persona').css({ background: '#f9fafb' });
        $('#btn_modo_semana').css({ background: '#fff' });
        poblarPersonaAnios();
        // Restaurar selección de año si existe en el estado
        if (personaState.anio) {
            const $anio = $('#persona_anio');
            if ($anio.find(`option[value="${personaState.anio}"]`).length) {
                $anio.val(personaState.anio);
                poblarPersonaSemanas();
            }
        } else {
            poblarPersonaSemanas();
        }
        // Restaurar semana si existe
        if (personaState.semana && personaState.anio) {
            const $sem = $('#persona_semana');
            if ($sem.find(`option[value="${personaState.semana}"]`).length) {
                $sem.val(personaState.semana);
            }
        }
        // Restaurar departamento y búsqueda
        if (typeof personaState.departamento === 'string') {
            const $dep = $('#persona_departamento');
            if (!$dep.length || !$dep.find(`option[value="${personaState.departamento}"]`).length) {
                // si no existe esa opción, dejamos "Todos"
            } else {
                $dep.val(personaState.departamento);
            }
        }
        // Restaurar orden y mostrar
        $('#persona_mostrar').val(personaState.mostrar || 'todos');
        $('#persona_buscar').val(personaState.buscar || '');
        // Recargar detalle si hay valores actuales en los selects
        const anioSel = $('#persona_anio').val();
        const semanaSel = $('#persona_semana').val();
        if (anioSel && semanaSel) {
            cargarPersonaDetalle();
        } else {
            limpiarPersonaTabla();
        }
    });

    $(document).on('contextmenu', '#tbody_historial tr[data-semana] .badge', function(e) {
        e.preventDefault();
        $(".custom-context-menu").remove();
        const tr = $(this).closest('tr');
        const semana = tr.data('semana');
        const anio = tr.data('anio');
        const valor = parseInt($(this).text(), 10) || 0;
        if (valor <= 0) return false;
        let columna = null;
        if ($(this).hasClass('badge-azul')) columna = 'vacaciones';
        else if ($(this).hasClass('badge-morado')) columna = 'ausencias';
        else if ($(this).hasClass('badge-gris')) columna = 'incapacidades';
        else if ($(this).hasClass('badge-negro')) columna = 'dias_trabajados';
        const idDepto = ($('#filtro_departamento').val() || '').trim() || null;
        const menu = $(`
            <div class="custom-context-menu" style="position:fixed;z-index:2000;left:${e.pageX}px;top:${e.pageY}px;background:#fff;border:1px solid #ccc;border-radius:6px;box-shadow:0 2px 8px #0002;min-width:160px;">
                <div class="context-menu-item" style="padding:10px 18px;cursor:pointer;">Ver detalles</div>
            </div>
        `);
        $('body').append(menu);
        menu.find('.context-menu-item').on('click', function() {
            $(".custom-context-menu").remove();
            if (columna) cargarModalDetalleSemana(semana, anio, columna, idDepto);
        });
        $(document).on('click.contextmenu2', function() {
            $(".custom-context-menu").remove();
            $(document).off('click.contextmenu2');
        });
        return false;
    });

    $('#persona_anio').on('change', function() {
        personaState.anio = $(this).val();
        window.personaPaginaActual = 1;
        poblarPersonaSemanas();
        limpiarPersonaTabla();
    });
    $('#persona_semana').on('change', function() {
        personaState.semana = $(this).val();
        window.personaPaginaActual = 1;
        cargarPersonaDetalle();
    });
    $('#persona_buscar').on('input', function() {
        personaState.buscar = $(this).val();
        window.personaPaginaActual = 1;
        filtrarPersonaTabla($(this).val());
    });
    $('#persona_orden_por').on('change', function() {
        personaState.ordenPor = $(this).val() || 'vacaciones';
        renderPersonaTabla(historialPersonaDatos || []);
    });
    $('#persona_mostrar').on('change', function() {
        personaState.mostrar = $(this).val() || 'todos';
        window.personaPaginaActual = 1;
        renderPersonaTabla(historialPersonaDatos || []);
    });
    $('#filtro_departamento').on('change', function() {
        window.semanaPaginaActual = 1;
        cargarHistorial();
    });
    $('#persona_departamento').on('change', function() {
        personaState.departamento = $(this).val();
        window.personaPaginaActual = 1;
        cargarPersonaDetalle();
    });

    // Listeners para los filtros de año y semana
    $('#filtro_anio').on('change', function() {
        window.semanaPaginaActual = 1;
        poblarFiltroSemana();
        filtrarHistorial();
    });
    $('#filtro_semana').on('change', function() {
        window.semanaPaginaActual = 1;
        filtrarHistorial();
    });
});

function cargarHistorial() {
    const idDepto = ($('#filtro_departamento').val() || '').trim();
    // Guardar valores actuales de año y semana
    const anioActual = $('#filtro_anio').val();
    const semanaActual = $('#filtro_semana').val();
    $.ajax({
        url: '../php/obtener_historial.php',
        type: 'GET',
        data: idDepto ? { id_departamento: idDepto } : {},
        dataType: 'json',
        success: function(response) {
            if (response.success && response.data) {
                historialDatos = response.data;
                poblarFiltroAnio();
                // Restaurar año si existe
                if (anioActual && $('#filtro_anio option[value="' + anioActual + '"]').length) {
                    $('#filtro_anio').val(anioActual);
                }
                poblarFiltroSemana();
                // Restaurar semana si existe
                if (semanaActual && $('#filtro_semana option[value="' + semanaActual + '"]').length) {
                    $('#filtro_semana').val(semanaActual);
                }
                filtrarHistorial();
            } else {
                mostrarSinDatos();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar historial:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar el historial de incidencias',
                icon: 'error'
            });
            mostrarSinDatos();
        }
    });
}

function poblarFiltroAnio() {
    const select = $('#filtro_anio');
    select.empty();
    select.append(`<option value="">Selecciona año</option>`);
    const anios = [...new Set(historialDatos.map(r => r.anio))].sort((a, b) => b - a);
    anios.forEach(anio => {
        select.append(`<option value="${anio}">${anio}</option>`);
    });
}

function poblarFiltroSemana() {
    const select = $('#filtro_semana');
    select.empty();
    select.append(`<option value="">Selecciona semana</option>`);
    const anio = $('#filtro_anio').val();
    if (!anio) return; // Si no hay año seleccionado, solo dejar la opción por defecto
    select.append(`<option value="todas">Todas</option>`);
    const semanas = historialDatos.filter(r => r.anio == anio).map(r => r.semana);
    const semanasUnicas = [...new Set(semanas)].sort((a, b) => a - b); // menor a mayor
    semanasUnicas.forEach(sem => {
        select.append(`<option value="${sem}">Semana ${sem}</option>`);
    });
}

function filtrarHistorial() {
    const anio = $('#filtro_anio').val();
    const semana = $('#filtro_semana').val();
    if (!anio) {
        $('#tbody_historial').html('<tr><td colspan="5">Selecciona año y semana</td></tr>');
        return;
    }
    if (!semana) {
        $('#tbody_historial').html('<tr><td colspan="5">Selecciona semana</td></tr>');
        return;
    }
    let datosFiltrados;
    if (semana === 'todas') {
        datosFiltrados = historialDatos.filter(r => r.anio == anio);
    } else {
        datosFiltrados = historialDatos.filter(r => r.anio == anio && r.semana == semana);
    }
    mostrarHistorial(datosFiltrados);
}

function poblarPersonaAnios() {
    const select = $('#persona_anio');
    if (!select.length) return;
    const anios = [...new Set(historialDatos.map(r => r.anio))].sort((a, b) => b - a);
    select.empty();
    select.append(`<option value="">Selecciona año</option>`);
    anios.forEach(anio => {
        select.append(`<option value="${anio}">${anio}</option>`);
    });
}

function poblarPersonaSemanas() {
    const select = $('#persona_semana');
    if (!select.length) return;
    const anio = $('#persona_anio').val();
    select.empty();
    select.append(`<option value="">Selecciona semana</option>`);
    if (!anio) return; // Si no hay año seleccionado, solo dejar la opción por defecto
    const semanas = historialDatos.filter(r => String(r.anio) === String(anio)).map(r => r.semana);
    const semanasUnicas = [...new Set(semanas)].sort((a, b) => a - b);
    semanasUnicas.forEach(sem => {
        select.append(`<option value="${sem}">Semana ${sem}</option>`);
    });
}

function cargarPersonaDetalle() {
    const semana = $('#persona_semana').val();
    const anio = $('#persona_anio').val();
    const idDepto = ($('#persona_departamento').val() || '').trim();
    if (!semana || !anio) {
        limpiarPersonaTabla();
        return;
    }
    $('#persona_tbody').html('<tr><td colspan="5">Cargando...</td></tr>');
    $.ajax({
        url: '../php/obtener_detalle_semana.php',
        type: 'GET',
        data: idDepto ? { semana: semana, anio: anio, id_departamento: idDepto } : { semana: semana, anio: anio },
        dataType: 'json',
        success: function(response) {
            if (response.success && response.data) {
                historialPersonaDatos = response.data;
                renderPersonaTabla(historialPersonaDatos);
            } else {
                renderPersonaTabla([]);
            }
        },
        error: function() {
            renderPersonaTabla([]);
        }
    });
}

function renderPersonaTabla(datos) {
    const tbody = $('#persona_tbody');
    if (!tbody.length) return;
    tbody.empty();
    if (!datos || datos.length === 0) {
        tbody.html('<tr><td colspan="5">Sin datos</td></tr>');
        return;
    }
    const filtro = ($('#persona_buscar').val() || '').toLowerCase();
    const campoOrden = ($('#persona_orden_por').val() || 'vacaciones');
    const mostrar = ($('#persona_mostrar').val() || 'todos');
    const table = tbody.closest('table');
    const thead = table.find('thead');
    const base = (datos || []).filter(emp => {
        const nombre = (emp.nombre_completo || '').toLowerCase();
        const clave = (emp.clave_empleado || '').toLowerCase();
        return nombre.includes(filtro) || clave.includes(filtro);
    });
    // Mostrar todos los empleados, no solo los que tienen valores > 0
    // Soporte para orden ascendente/descendente al hacer clic en el encabezado
    if (!window.personaOrdenDir) window.personaOrdenDir = {};
    let ordenDir = window.personaOrdenDir[mostrar] || 'desc';
    let setOrdenDir = dir => { window.personaOrdenDir[mostrar] = dir; };
    // Nuevo: obtener campo y orden desde el select persona_mostrar
    let mostrarRaw = ($('#persona_mostrar').val() || 'todos');
    let campoMostrar, ordenMostrar;
    if (mostrarRaw === 'todos') {
        campoMostrar = 'todos';
        ordenMostrar = 'desc';
    } else {
        [campoMostrar, ordenMostrar] = mostrarRaw.split('-');
    }
    let ordenados = [];
    if (campoMostrar === 'todos') {
        ordenados = base.slice().sort((a, b) => parseInt(b['vacaciones'] || 0) - parseInt(a['vacaciones'] || 0));
    } else {
        ordenados = base.filter(emp => parseInt(emp[campoMostrar] || 0) > 0)
            .sort((a, b) => ordenMostrar === 'asc' ? parseInt(a[campoMostrar] || 0) - parseInt(b[campoMostrar] || 0) : parseInt(b[campoMostrar] || 0) - parseInt(a[campoMostrar] || 0));
    }

    // --- Paginación ---
    const paginacionDiv = $('#persona_paginacion');
    const pageSize = 10;
    if (!window.personaPaginaActual) window.personaPaginaActual = 1;
    let paginaActual = window.personaPaginaActual;
    const totalPaginas = Math.max(1, Math.ceil(ordenados.length / pageSize));
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    if (paginaActual < 1) paginaActual = 1;
    window.personaPaginaActual = paginaActual;
    const inicio = (paginaActual - 1) * pageSize;
    const fin = inicio + pageSize;
    const empleadosPagina = ordenados.slice(inicio, fin);

    if (campoMostrar === 'todos') {
        if (thead.length) {
            thead.html(`
                <tr>
                    <th style="min-width:180px;">Empleado</th>
                    <th class="col-azul persona-sortable" data-campo="vacaciones">Vacaciones</th>
                    <th class="col-morado persona-sortable" data-campo="ausencias">Ausencias</th>
                    <th class="col-gris persona-sortable" data-campo="incapacidades">Incapacidades</th>
                    <th class="col-negro persona-sortable" data-campo="dias_trabajados">Días Pagados</th>
                </tr>
            `);
        }
        empleadosPagina.forEach(emp => {
            const nombreCompleto = emp.nombre_completo || emp.nombre;
            const fila = `
                <tr>
                    <td>${nombreCompleto}</td>
                    <td><span class="badge badge-azul">${emp.vacaciones}</span></td>
                    <td><span class="badge badge-morado">${emp.ausencias}</span></td>
                    <td><span class="badge badge-gris">${emp.incapacidades}</span></td>
                    <td><span class="badge badge-negro">${emp.dias_trabajados}</span></td>
                </tr>
            `;
            tbody.append(fila);
        });
    } else {
        const specMostrar = obtenerEspecificacionColumna(campoMostrar);
        if (thead.length) {
            thead.html(`
                <tr>
                    <th style="min-width:180px;">Empleado</th>
                    <th class="${specMostrar.colClass}">${specMostrar.header}</th>
                </tr>
            `);
        }
        empleadosPagina.forEach(emp => {
            const nombreCompleto = emp.nombre_completo || emp.nombre;
            const valor = parseInt(emp[campoMostrar] || 0);
            const fila = `
                <tr>
                    <td>${nombreCompleto}</td>
                    <td><span class="badge ${specMostrar.badge}">${valor}</span></td>
                </tr>
            `;
            tbody.append(fila);
        });
    }

    // Renderizar controles de paginación
    paginacionDiv.empty();
    if (totalPaginas > 1) {
        const btnPrev = $('<button type="button">&lt;</button>').prop('disabled', paginaActual === 1).css({padding:'6px 12px',border:'1px solid #ccc',borderRadius:'4px',background:'#fff',cursor:paginaActual===1?'not-allowed':'pointer',fontWeight:'bold'});
        const btnNext = $('<button type="button">&gt;</button>').prop('disabled', paginaActual === totalPaginas).css({padding:'6px 12px',border:'1px solid #ccc',borderRadius:'4px',background:'#fff',cursor:paginaActual===totalPaginas?'not-allowed':'pointer',fontWeight:'bold'});
        btnPrev.on('click',function(){ if(paginaActual>1){ window.personaPaginaActual = paginaActual-1; renderPersonaTabla(historialPersonaDatos||[]); }});
        btnNext.on('click',function(){ if(paginaActual<totalPaginas){ window.personaPaginaActual = paginaActual+1; renderPersonaTabla(historialPersonaDatos||[]); }});
        paginacionDiv.append(btnPrev);
        for(let i=1;i<=totalPaginas;i++){
            const btn = $('<button type="button"></button>').text(i).css({padding:'6px 12px',border:'1px solid #ccc',borderRadius:'4px',background:i===paginaActual?'#3b82f6':'#fff',color:i===paginaActual?'#fff':'#000',fontWeight:i===paginaActual?'bold':'normal',cursor:'pointer'});
            if(i!==paginaActual){ btn.on('click',function(){ window.personaPaginaActual = i; renderPersonaTabla(historialPersonaDatos||[]); }); }
            paginacionDiv.append(btn);
        }
        paginacionDiv.append(btnNext);
    }

    // Listeners para alternar orden al hacer clic en encabezado
    thead.find('.persona-sortable').off('click').on('click', function() {
        const campo = $(this).data('campo');
        if (mostrar === 'todos') {
            if (campoOrden === campo) {
                ordenDir = ordenDir === 'asc' ? 'desc' : 'asc';
            } else {
                ordenDir = 'desc';
            }
            personaState.ordenPor = campo;
        } else {
            if (mostrar === campo) {
                ordenDir = ordenDir === 'asc' ? 'desc' : 'asc';
            } else {
                ordenDir = 'desc';
            }
        }
        setOrdenDir(ordenDir);
        renderPersonaTabla(historialPersonaDatos || []);
    });
}

function filtrarPersonaTabla(valor) {
    renderPersonaTabla(historialPersonaDatos || []);
}

function limpiarPersonaTabla() {
    $('#persona_tbody').html('<tr><td colspan="5">Selecciona año y semana</td></tr>');
}

function cargarDepartamentos() {
    return new Promise((resolve) => {
        $.ajax({
            url: '../../public/php/obtenerDepartamentos.php',
            type: 'GET',
            dataType: 'json',
            success: function(rows) {
                departamentosLista = rows || [];
                resolve();
            },
            error: function() {
                departamentosLista = [];
                resolve();
            }
        });
    });
}

function poblarDepartamentosSelect(selector) {
    const sel = $(selector);
    if (!sel.length) return;
    const current = sel.val();
    sel.empty();
    sel.append(`<option value="">Todos</option>`);
    departamentosLista.forEach(d => {
        sel.append(`<option value="${d.id_departamento}">${d.nombre_departamento}</option>`);
    });
    if (current) sel.val(current);
}

function cargarModalDetalleSemana(semana, anio, columna = null, idDepartamento = null) {
    modalColumnaActual = columna || null;
    $('#modal_detalle_semana').show();
    const tituloExtra = modalColumnaActual ? ` - ${formatearNombreColumna(modalColumnaActual)}` : '';
    $('#modal_titulo_semana').text(`Detalle de Semana ${semana} / ${anio}${tituloExtra}`);
    $('#modal_tbody_detalle').html('<tr><td colspan="6">Cargando...</td></tr>');
    // Ocultar select de orden si hay columna fija
    if (modalColumnaActual) {
        $('#modal_filtro_semana').closest('div').hide();
    } else {
        $('#modal_filtro_semana').closest('div').show();
    }
    
    $.ajax({
        url: '../php/obtener_detalle_semana.php',
        type: 'GET',
        data: idDepartamento ? { semana: semana, anio: anio, id_departamento: idDepartamento } : { semana: semana, anio: anio },
        dataType: 'json',
        success: function(response) {
            if (response.success && response.data) {
                mostrarModalDetalleSemana(response.data);
            } else {
                $('#modal_tbody_detalle').html('<tr><td colspan="6">No hay datos para esta semana</td></tr>');
            }
        },
        error: function() {
            $('#modal_tbody_detalle').html('<tr><td colspan="6">Error al cargar datos</td></tr>');
        }
    });
}

let datosModalDetalle = [];
function mostrarModalDetalleSemana(datos) {
    datosModalDetalle = datos;
    // Renderizar encabezado según columna seleccionada
    renderizarEncabezadoModal();
    // Ordenar por la columna actual si existe; de lo contrario por select
    if (modalColumnaActual) {
        ordenarModalDetalleSemana(modalColumnaActual);
    } else {
        ordenarModalDetalleSemana($('#modal_filtro_semana').val());
    }
}

function ordenarModalDetalleSemana(campo, orden = null) {
    if (!datosModalDetalle || datosModalDetalle.length === 0) return;
    let base = [...datosModalDetalle];
    
    // Aplicar filtro de búsqueda por nombre o clave
    const busqueda = ($('#modal_buscar_empleado').val() || '').toLowerCase();
    if (busqueda) {
        base = base.filter(emp => {
            const nombre = (emp.nombre_completo || '').toLowerCase();
            const clave = (emp.clave_empleado || '').toLowerCase();
            return nombre.includes(busqueda) || clave.includes(busqueda);
        });
    }
    
    if (modalColumnaActual) {
        base = base.filter(emp => parseInt(emp[modalColumnaActual] || 0) > 0);
    }
    // Determinar dirección de ordenamiento
    let dir = orden || ($('#modal_orden_dir_simple').val() || 'desc');
    const datosOrdenados = base.sort((a, b) => {
        let valA = parseInt(a[campo] || 0);
        let valB = parseInt(b[campo] || 0);
        return dir === 'asc' ? valA - valB : valB - valA;
    });
    const tbody = $('#modal_tbody_detalle');
    tbody.empty();
    if (datosOrdenados.length === 0) {
        const spec = obtenerEspecificacionColumna(modalColumnaActual || campo);
        tbody.html(`<tr><td colspan="2">No hay empleados con ${spec.header} en esta semana</td></tr>`);
        return;
    }
    datosOrdenados.forEach((emp) => {
        const nombreCompleto = emp.nombre_completo || emp.nombre;
        let fila = `<tr><td>${nombreCompleto}</td>`;
        if (modalColumnaActual) {
            const spec = obtenerEspecificacionColumna(modalColumnaActual);
            const valor = parseInt(emp[modalColumnaActual] || 0);
            fila += `<td><span class="badge ${spec.badge}">${valor}</span></td>`;
        } else {
            fila += `
                <td><span class="badge badge-azul">${emp.vacaciones}</span></td>
                <td><span class="badge badge-morado">${emp.ausencias}</span></td>
                <td><span class="badge badge-gris">${emp.incapacidades}</span></td>
                <td><span class="badge badge-negro">${emp.dias_trabajados}</span></td>
            `;
        }
        fila += `</tr>`;
        tbody.append(fila);
    });
}

function cerrarModalDetalle() {
    $('#modal_detalle_semana').hide();
    $('#modal_buscar_empleado').val('');
    datosModalDetalle = [];
    modalColumnaActual = null;
    // Restaurar encabezado completo
    renderizarEncabezadoModal();
    // Mostrar el select de orden
    $('#modal_filtro_semana').closest('div').show();
}

function mostrarHistorial(datos) {
    const tbody = $('#tbody_historial');
    tbody.empty();

    if (datos.length === 0) {
        mostrarSinDatos();
        $('#semana_paginacion').empty();
        return;
    }

    // Ordenar por semana de menor a mayor (dentro del año seleccionado)
    datos = datos.slice().sort((a, b) => parseInt(a.semana) - parseInt(b.semana));

    // --- Paginación ---
    const paginacionDiv = $('#semana_paginacion');
    const pageSize = 10;
    if (!window.semanaPaginaActual) window.semanaPaginaActual = 1;
    let paginaActual = window.semanaPaginaActual;
    const totalPaginas = Math.max(1, Math.ceil(datos.length / pageSize));
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    if (paginaActual < 1) paginaActual = 1;
    window.semanaPaginaActual = paginaActual;
    const inicio = (paginaActual - 1) * pageSize;
    const fin = inicio + pageSize;
    const semanasPagina = datos.slice(inicio, fin);

    let totalVacaciones = 0;
    let totalAusencias = 0;
    let totalIncapacidades = 0;
    let totalDiasPagados = 0;
    let totalDiasTrabajados = 0;

    // Calcular totales de todas las semanas (no solo la página actual)
    datos.forEach(function(registro) {
        totalVacaciones += parseInt(registro.vacaciones) || 0;
        totalAusencias += parseInt(registro.ausencias) || 0;
        totalIncapacidades += parseInt(registro.incapacidades) || 0;
        totalDiasPagados += parseInt(registro.dias_trabajados) || 0;
    });

    // Renderizar solo las semanas de la página actual
    semanasPagina.forEach(function(registro) {
        const fila = `
            <tr data-semana="${registro.semana}" data-anio="${registro.anio}">
                <td><strong>Semana ${registro.semana} / ${registro.anio}</strong></td>
                <td><span class="badge badge-azul">${registro.vacaciones}</span></td>
                <td><span class="badge badge-morado">${registro.ausencias}</span></td>
                <td><span class="badge badge-gris">${registro.incapacidades}</span></td>
                <td><span class="badge badge-negro">${registro.dias_trabajados}</span></td>
            </tr>
        `;
        tbody.append(fila);
    });

    // Fila de totales
    const filaTotal = `
        <tr style="background:#f3f4f6;font-weight:600;">
            <td style="text-align:right;">Total:</td>
            <td><span class="badge badge-azul">${totalVacaciones}</span></td>
            <td><span class="badge badge-morado">${totalAusencias}</span></td>
            <td><span class="badge badge-gris">${totalIncapacidades}</span></td>
            <td><span class="badge badge-negro">${totalDiasPagados}</span></td>
        </tr>
    `;
    tbody.append(filaTotal);

    // Renderizar controles de paginación
    paginacionDiv.empty();
    if (totalPaginas > 1) {
        const btnPrev = $('<button type="button">&lt;</button>').prop('disabled', paginaActual === 1).css({padding:'6px 12px',border:'1px solid #ccc',borderRadius:'4px',background:'#fff',cursor:paginaActual===1?'not-allowed':'pointer',fontWeight:'bold'});
        const btnNext = $('<button type="button">&gt;</button>').prop('disabled', paginaActual === totalPaginas).css({padding:'6px 12px',border:'1px solid #ccc',borderRadius:'4px',background:'#fff',cursor:paginaActual===totalPaginas?'not-allowed':'pointer',fontWeight:'bold'});
        btnPrev.on('click',function(){ if(paginaActual>1){ window.semanaPaginaActual = paginaActual-1; filtrarHistorial(); }});
        btnNext.on('click',function(){ if(paginaActual<totalPaginas){ window.semanaPaginaActual = paginaActual+1; filtrarHistorial(); }});
        paginacionDiv.append(btnPrev);
        for(let i=1;i<=totalPaginas;i++){
            const btn = $('<button type="button"></button>').text(i).css({padding:'6px 12px',border:'1px solid #ccc',borderRadius:'4px',background:i===paginaActual?'#3b82f6':'#fff',color:i===paginaActual?'#fff':'#000',fontWeight:i===paginaActual?'bold':'normal',cursor:'pointer'});
            if(i!==paginaActual){ btn.on('click',function(){ window.semanaPaginaActual = i; filtrarHistorial(); }); }
            paginacionDiv.append(btn);
        }
        paginacionDiv.append(btnNext);
    }
}

function mostrarSinDatos() {
    const tbody = $('#tbody_historial');
    tbody.html(`
        <tr>
            <td colspan="5" class="no-datos">
                <div>
                    <i>📭</i>
                    <p style="margin-top: 1rem; font-size: 1.2rem; font-weight: 500;">No hay datos en el historial</p>
                    <p style="color: #a0aec0;">Carga archivos Excel y guarda los datos para ver el historial</p>
                </div>
            </td>
        </tr>
    `);
}

function renderizarEncabezadoModal() {
    const thead = $('#modal_tbody_detalle').closest('table').find('thead');
    if (!thead.length) return;
    if (modalColumnaActual) {
        const spec = obtenerEspecificacionColumna(modalColumnaActual);
        thead.html(`
            <tr>
                <th style="min-width:180px;">Empleado</th>
                <th class="${spec.colClass}">${spec.header}</th>
            </tr>
        `);
    } else {
        thead.html(`
            <tr>
                <th style="min-width:180px;">Empleado</th>
                <th class="col-azul">Vacaciones</th>
                <th class="col-morado">Ausencias</th>
                <th class="col-gris">Incapacidades</th>
                <th class="col-negro">Días Pagados</th>
            </tr>
        `);
    }
}

function obtenerEspecificacionColumna(col) {
    switch (col) {
        case 'vacaciones':
            return { header: 'Vacaciones', badge: 'badge-azul', colClass: 'col-azul' };
        case 'ausencias':
            return { header: 'Ausencias', badge: 'badge-morado', colClass: 'col-morado' };
        case 'incapacidades':
            return { header: 'Incapacidades', badge: 'badge-gris', colClass: 'col-gris' };
        case 'dias_trabajados':
            return { header: 'Días Pagados', badge: 'badge-negro', colClass: 'col-negro' };
        default:
            return { header: col, badge: 'badge', colClass: '' };
    }
}

function formatearNombreColumna(col) {
    const spec = obtenerEspecificacionColumna(col);
    return spec.header;
}
