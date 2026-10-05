/* =====================================================
   MÓDULO CASILLERO - JavaScript principal
   Maneja: cargar, mostrar, agregar, editar,
           eliminar, asignar y liberar casilleros.
   Las rutas PHP apuntan a ../gafetes/php/ ya que
   la lógica de backend es la misma (tablas reutilizadas).
   ===================================================== */

// ── Variables globales ──
let casilleroActual = null;
let paginaActual = 1;
let totalPaginas = 1;
let filtroActual = 'todos';
let busquedaActual = '';

const PHP_BASE = '../gafetes/php/';

/* ══════════════════════════════════════════
   CARGA Y VISUALIZACIÓN DE CASILLEROS
══════════════════════════════════════════ */

function cargarCasilleros(pagina = 1, filtro = 'todos', busqueda = '') {
    const paginaValida = Math.max(1, parseInt(pagina) || 1);
    paginaActual = paginaValida;
    filtroActual = filtro;
    busquedaActual = busqueda;

    const contenedor = document.getElementById('contenedor-casilleros');
    if (!contenedor) return;

    // Fade out
    contenedor.style.transition = 'opacity 0.15s ease';
    contenedor.style.opacity = '0';

    // Spinner con delay
    const spinnerTimer = setTimeout(() => {
        contenedor.innerHTML = `
            <div class="loading-state">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-3 text-muted">Cargando casilleros...</p>
            </div>`;
        contenedor.style.opacity = '1';
    }, 250);

    let url = `${PHP_BASE}obtener_casilleros.php?pagina=${paginaValida}&filtro=${filtro}`;
    if (busqueda) url += `&busqueda=${encodeURIComponent(busqueda)}`;

    fetch(url)
        .then(r => r.json())
        .then(data => {
            clearTimeout(spinnerTimer);
            if (data.success) {
                paginaActual = data.pagina_actual;
                totalPaginas = data.total_paginas;
                filtroActual = data.filtro_actual;
                busquedaActual = data.busqueda_actual || '';

                actualizarFiltros(filtro);
                mostrarCasilleros(data.data);
                mostrarPaginacion();
                actualizarContador(data.total_casilleros);
            } else {
                throw new Error(data.error || 'Error al cargar los casilleros');
            }
        })
        .catch(error => {
            clearTimeout(spinnerTimer);
            console.error(error);
            contenedor.innerHTML = `
                <div class="empty-casilleros">
                    <i class="bi bi-exclamation-triangle-fill text-danger"></i>
                    <p class="text-danger">Error al cargar: ${error.message}</p>
                    <button class="btn btn-sm btn-outline-danger mt-2"
                            onclick="cargarCasilleros(1,'${filtro}','${busqueda}')">
                        <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
                    </button>
                </div>`;
            contenedor.style.opacity = '1';
        });
}

function actualizarContador(total) {
    const el = document.getElementById('totalCasilleros');
    if (el) el.textContent = total;
}

function actualizarFiltros(filtro) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const mapa = { todos: 'btnFiltroTodos', disponibles: 'btnFiltroDisponibles', parciales: 'btnFiltroParciales', completos: 'btnFiltroCompletos' };
    const btnId = mapa[filtro] || 'btnFiltroTodos';
    document.getElementById(btnId)?.classList.add('active');
}

function mostrarCasilleros(casilleros) {
    const contenedor = document.getElementById('contenedor-casilleros');
    if (!contenedor) return;

    if (!casilleros || casilleros.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-casilleros">
                <i class="bi bi-box-seam"></i>
                <p>No hay casilleros${filtroActual !== 'todos' ? ' con el filtro seleccionado' : ' registrados'}.</p>
                ${filtroActual !== 'todos' ? `<button class="btn btn-sm btn-outline-secondary mt-2" onclick="cargarCasilleros(1,'todos','')"><i class="bi bi-x-circle me-1"></i>Quitar filtro</button>` : ''}
            </div>`;
        contenedor.style.opacity = '1';
        return;
    }

    let html = '';
    casilleros.forEach(c => {
        const num = String(c.num_casillero || '');
        const totalEmpleados = parseInt(c.total_empleados) || 0;
        const estado = String(c.estado || 'Disponible');
        const empleadoNombre = String(c.empleado_nombre || '');

        // Clase de color
        let claseEstado = 'disponible';
        if (totalEmpleados === 1) claseEstado = 'parcial';
        if (totalEmpleados >= 2) claseEstado = 'ocupado';

        // Texto empleado
        let infoEmp = '';
        if (empleadoNombre && empleadoNombre.trim()) {
            if (totalEmpleados > 1) {
                const nombres = empleadoNombre.split(', ').map(n => n.split(' ')[0]);
                infoEmp = `<div class="casillero-empleado" title="${empleadoNombre}">${nombres.join(', ')}</div>`;
            } else {
                infoEmp = `<div class="casillero-empleado" title="${empleadoNombre}">${empleadoNombre.split(' ')[0]}</div>`;
            }
        }

        html += `
        <div class="casillero-item ${claseEstado}"
             onclick="abrirEditarCasillero('${num.replace(/'/g, "\\'")}', ${totalEmpleados > 0})"
             title="Casillero ${num} — ${estado} (${totalEmpleados}/2)">
            <div class="casillero-numero">${num}</div>
            <div class="casillero-estado">${estado} (${totalEmpleados}/2)</div>
            ${infoEmp}
        </div>`;
    });

    contenedor.innerHTML = html;
    contenedor.style.transition = 'opacity 0.15s ease';
    contenedor.style.opacity = '0';
    contenedor.getBoundingClientRect(); // forzar reflow
    contenedor.style.opacity = '1';
}

/* ══════════════════════════════════════════
   PAGINACIÓN
══════════════════════════════════════════ */

function mostrarPaginacion() {
    const wrapper = document.getElementById('controles-paginacion');
    const infoPag = document.getElementById('info-paginacion');
    const paginacionEl = document.getElementById('paginacion-casilleros');
    if (!wrapper || !paginacionEl) return;

    if (infoPag) infoPag.textContent = `Página ${paginaActual} de ${totalPaginas}`;

    if (totalPaginas <= 1) {
        wrapper.style.display = 'none';
        return;
    }

    wrapper.style.display = '';

    let items = '';

    items += paginaActual > 1
        ? `<li class="page-item"><a class="page-link" href="#" onclick="cargarCasilleros(${paginaActual - 1},'${filtroActual}','${busquedaActual}');return false;"><i class="bi bi-chevron-left"></i></a></li>`
        : `<li class="page-item disabled"><span class="page-link"><i class="bi bi-chevron-left"></i></span></li>`;

    items += `<li class="page-item ${paginaActual === 1 ? 'active' : ''}"><a class="page-link" href="#" onclick="cargarCasilleros(1,'${filtroActual}','${busquedaActual}');return false;">1</a></li>`;

    if (paginaActual > 3) items += `<li class="page-item disabled"><span class="page-link">…</span></li>`;

    const rangoInicio = Math.max(2, paginaActual - 1);
    const rangoFin = Math.min(totalPaginas - 1, paginaActual + 1);
    for (let i = rangoInicio; i <= rangoFin; i++) {
        items += `<li class="page-item ${paginaActual === i ? 'active' : ''}"><a class="page-link" href="#" onclick="cargarCasilleros(${i},'${filtroActual}','${busquedaActual}');return false;">${i}</a></li>`;
    }

    if (paginaActual < totalPaginas - 2) items += `<li class="page-item disabled"><span class="page-link">…</span></li>`;

    if (totalPaginas > 1) {
        items += `<li class="page-item ${paginaActual === totalPaginas ? 'active' : ''}"><a class="page-link" href="#" onclick="cargarCasilleros(${totalPaginas},'${filtroActual}','${busquedaActual}');return false;">${totalPaginas}</a></li>`;
    }

    items += paginaActual < totalPaginas
        ? `<li class="page-item"><a class="page-link" href="#" onclick="cargarCasilleros(${paginaActual + 1},'${filtroActual}','${busquedaActual}');return false;"><i class="bi bi-chevron-right"></i></a></li>`
        : `<li class="page-item disabled"><span class="page-link"><i class="bi bi-chevron-right"></i></span></li>`;

    paginacionEl.innerHTML = items;
}

/* ══════════════════════════════════════════
   MODAL EDITAR / ASIGNAR CASILLERO
══════════════════════════════════════════ */

function abrirEditarCasillero(numCasillero, estaOcupado) {
    casilleroActual = numCasillero;

    // Actualizar label
    const label = document.getElementById('labelNumeroCasilleroEditar');
    if (label) label.textContent = `#${numCasillero}`;

    // Precarga campos
    const inputNum = document.getElementById('nuevo_numero');
    const inputId = document.getElementById('casillero_id');
    if (inputNum) inputNum.value = numCasillero;
    if (inputId) inputId.value = numCasillero;

    // Reset búsqueda empleado
    const inputBuscar = document.getElementById('buscarEmpleado');
    if (inputBuscar) inputBuscar.value = '';

    resetResultadosBusqueda();

    // Cargar empleados asignados
    if (estaOcupado) {
        cargarEmpleadosAsignados(numCasillero);
    } else {
        const infoDiv = document.getElementById('infoEmpleadoAsignado');
        if (infoDiv) infoDiv.innerHTML = '';
    }

    // Eventos de botones del modal
    document.getElementById('btnGuardarCambios').onclick = () => actualizarNumeroCasillero(numCasillero);
    document.getElementById('btnEliminarCasillero').onclick = () => confirmarEliminarCasillero(numCasillero);
    document.getElementById('btnBuscarEmpleado').onclick = buscarEmpleado;

    // Buscar con Enter
    if (inputBuscar) {
        inputBuscar.onkeydown = (e) => { if (e.key === 'Enter') buscarEmpleado(); };
    }

    // Limpiar búsqueda empleado
    const btnLimpiar = document.getElementById('btnLimpiarBusquedaEmpleado');
    if (btnLimpiar) {
        btnLimpiar.onclick = () => {
            if (inputBuscar) inputBuscar.value = '';
            resetResultadosBusqueda();
        };
    }

    // Recargar al cambiar tab
    const tabAsignar = document.getElementById('asignar-tab');
    if (tabAsignar) {
        tabAsignar.addEventListener('shown.bs.tab', () => {
            if (estaOcupado) cargarEmpleadosAsignados(numCasillero);
        }, { once: true });
    }

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditarCasillero'));
    modal.show();
}

/* ══════════════════════════════════════════
   EMPLEADOS ASIGNADOS AL CASILLERO
══════════════════════════════════════════ */

function cargarEmpleadosAsignados(numCasillero) {
    const infoDiv = document.getElementById('infoEmpleadoAsignado');
    if (!infoDiv) return;

    infoDiv.innerHTML = `
        <div class="d-flex align-items-center gap-2 text-muted py-2">
            <div class="spinner-border spinner-border-sm text-success" role="status"></div>
            <small>Cargando empleados asignados...</small>
        </div>`;

    fetch(`${PHP_BASE}obtener_empleado_casillero.php?casillero=${encodeURIComponent(numCasillero)}`)
        .then(r => r.json())
        .then(data => {
            if (data.success && data.empleados && data.empleados.length > 0) {
                let html = `<div class="mb-1"><small class="fw-bold text-secondary">Empleados asignados:</small></div>`;
                data.empleados.forEach(emp => {
                    const nombreCompleto = `${emp.nombre} ${emp.apellido_paterno} ${emp.apellido_materno || ''}`.trim();
                    html += `
                    <div class="empleado-card-assigned">
                        <div class="empleado-info">
                            <div class="nombre"><i class="bi bi-person-badge-fill text-success me-1"></i>${nombreCompleto}</div>
                            <div class="detalle">
                                <i class="bi bi-hash me-1"></i>ID: ${emp.id_empleado}
                                ${emp.departamento ? `&nbsp;·&nbsp;<i class="bi bi-building me-1"></i>${emp.departamento}` : ''}
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger"
                                onclick="confirmarLiberarCasillero('${numCasillero}', ${emp.id_empleado}, '${nombreCompleto.replace(/'/g, "\\'")}')">
                            <i class="bi bi-person-dash me-1"></i>Liberar
                        </button>
                    </div>`;
                });
                infoDiv.innerHTML = html;
            } else {
                infoDiv.innerHTML = '';
            }
        })
        .catch(() => {
            infoDiv.innerHTML = `<small class="text-danger"><i class="bi bi-exclamation-triangle me-1"></i>Error al cargar empleados asignados.</small>`;
        });
}

/* ══════════════════════════════════════════
   BUSCAR EMPLEADOS
══════════════════════════════════════════ */

function buscarEmpleado() {
    const busqueda = document.getElementById('buscarEmpleado')?.value.trim() || '';
    const resultados = document.getElementById('resultadoBusqueda');
    if (!resultados) return;

    if (!busqueda) {
        resultados.innerHTML = `
            <div class="alert alert-warning d-flex align-items-center gap-2 py-2 px-3" style="font-size:.82rem">
                <i class="bi bi-exclamation-triangle"></i>
                Ingrese un nombre o ID de empleado para buscar.
            </div>`;
        return;
    }

    resultados.innerHTML = `
        <div class="d-flex align-items-center gap-2 text-muted py-3 px-2">
            <div class="spinner-border spinner-border-sm text-success" role="status"></div>
            <small>Buscando empleados...</small>
        </div>`;

    fetch(`${PHP_BASE}buscar_empleados.php?q=${encodeURIComponent(busqueda)}`)
        .then(r => r.json())
        .then(data => {
            if (data.success && data.results && data.results.length > 0) {
                let html = '';
                data.results.forEach(emp => {
                    const nombre = `${emp.nombre} ${emp.apellido_paterno} ${emp.apellido_materno || ''}`.trim();
                    html += `
                    <div class="empleado-result-item">
                        <div>
                            <div class="nombre">${nombre}</div>
                            <div class="detalle"><i class="bi bi-hash me-1"></i>ID: ${emp.id_empleado}</div>
                        </div>
                        <button class="btn btn-sm btn-success"
                                onclick="confirmarAsignarEmpleado('${casilleroActual}', ${emp.id_empleado}, '${nombre.replace(/'/g, "\\'")}')">
                            <i class="bi bi-check-lg me-1"></i>Asignar
                        </button>
                    </div>`;
                });
                resultados.innerHTML = html;
            } else {
                resultados.innerHTML = `
                    <div class="empty-search-state">
                        <i class="bi bi-person-x-fill"></i>
                        <p>No se encontraron empleados para &ldquo;${busqueda}&rdquo;</p>
                    </div>`;
            }
        })
        .catch(err => {
            console.error(err);
            resultados.innerHTML = `
                <div class="empty-search-state">
                    <i class="bi bi-exclamation-circle-fill text-danger"></i>
                    <p class="text-danger">Error al buscar empleados.</p>
                </div>`;
        });
}

function resetResultadosBusqueda() {
    const resultados = document.getElementById('resultadoBusqueda');
    if (resultados) {
        resultados.innerHTML = `
            <div class="empty-search-state">
                <i class="bi bi-person-lines-fill"></i>
                <p>Busque un empleado para asignar al casillero</p>
            </div>`;
    }
}

/* ══════════════════════════════════════════
   ASIGNAR EMPLEADO
══════════════════════════════════════════ */

function confirmarAsignarEmpleado(numCasillero, idEmpleado, nombreEmpleado) {
    mostrarConfirmacion({
        titulo: 'Confirmar asignación',
        mensaje: `¿Desea asignar el casillero <strong>${numCasillero}</strong> a <strong>${nombreEmpleado}</strong>?`,
        tipo: 'question',
        textoConfirmar: 'Sí, asignar',
        onConfirm: () => ejecutarAsignacion(numCasillero, idEmpleado, nombreEmpleado)
    });
}

function ejecutarAsignacion(numCasillero, idEmpleado, nombreEmpleado) {
    fetch(`${PHP_BASE}asignar_casillero.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `num_casillero=${encodeURIComponent(numCasillero)}&id_empleado=${idEmpleado}`
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Casillero asignado',
                    text: `El casillero ${numCasillero} ha sido asignado a ${nombreEmpleado}.`,
                    confirmButtonText: 'Aceptar'
                });
                cargarCasilleros(paginaActual, filtroActual, busquedaActual);
                cargarEmpleadosAsignados(numCasillero);
                resetResultadosBusqueda();
                if (document.getElementById('buscarEmpleado')) document.getElementById('buscarEmpleado').value = '';
            } else {
                throw new Error(data.error || 'Error al asignar el casillero');
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'No se pudo asignar el casillero',
                confirmButtonText: 'Aceptar'
            });
        });
}

/* ══════════════════════════════════════════
   LIBERAR CASILLERO
══════════════════════════════════════════ */

function confirmarLiberarCasillero(numCasillero, idEmpleado, nombreEmpleado) {
    mostrarConfirmacion({
        titulo: 'Liberar casillero',
        mensaje: `¿Desea liberar el casillero <strong>${numCasillero}</strong> de <strong>${nombreEmpleado}</strong>?`,
        tipo: 'warning',
        textoConfirmar: 'Sí, liberar',
        onConfirm: () => ejecutarLiberacion(numCasillero, idEmpleado)
    });
}

function ejecutarLiberacion(numCasillero, idEmpleado) {
    fetch(`${PHP_BASE}liberar_casillero.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `num_casillero=${encodeURIComponent(numCasillero)}&id_empleado=${idEmpleado}`
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Casillero liberado',
                    text: `El casillero ${numCasillero} ha sido liberado correctamente.`,
                    confirmButtonText: 'Aceptar'
                });
                cargarCasilleros(paginaActual, filtroActual, busquedaActual);
                cargarEmpleadosAsignados(numCasillero);
            } else {
                throw new Error(data.error || 'Error al liberar el casillero');
            }
        })
        .catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'No se pudo liberar el casillero',
                confirmButtonText: 'Aceptar'
            });
        });
}

/* ══════════════════════════════════════════
   ACTUALIZAR NÚMERO DE CASILLERO
══════════════════════════════════════════ */

function actualizarNumeroCasillero(numeroAnterior) {
    const nuevoNumero = document.getElementById('nuevo_numero')?.value.trim();
    if (!nuevoNumero) {
        Swal.fire({
            icon: 'warning',
            title: 'Dato requerido',
            text: 'Por favor ingrese un número de casillero válido',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    if (nuevoNumero === numeroAnterior) {
        bootstrap.Modal.getInstance(document.getElementById('modalEditarCasillero'))?.hide();
        return;
    }

    const btn = document.getElementById('btnGuardarCambios');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>Guardando...';
    btn.disabled = true;

    fetch(`${PHP_BASE}actualizar_casillero.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `numero_anterior=${encodeURIComponent(numeroAnterior)}&nuevo_numero=${encodeURIComponent(nuevoNumero)}`
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                bootstrap.Modal.getInstance(document.getElementById('modalEditarCasillero'))?.hide();
                cargarCasilleros(paginaActual, filtroActual, busquedaActual);
                Swal.fire({
                    icon: 'success',
                    title: 'Casillero actualizado',
                    text: `El casillero se ha actualizado correctamente a "${nuevoNumero}".`,
                    confirmButtonText: 'Aceptar'
                });
            } else {
                throw new Error(data.error || 'Error al actualizar el casillero');
            }
        })
        .catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'No se pudo actualizar el casillero',
                confirmButtonText: 'Aceptar'
            });
        })
        .finally(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        });
}

/* ══════════════════════════════════════════
   ELIMINAR CASILLERO
══════════════════════════════════════════ */

function confirmarEliminarCasillero(numCasillero) {
    // Verificar si está ocupado antes de confirmar
    fetch(`${PHP_BASE}obtener_empleado_casillero.php?casillero=${encodeURIComponent(numCasillero)}`)
        .then(r => r.json())
        .then(data => {
            if (data.success && data.empleados && data.empleados.length > 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Casillero ocupado',
                    text: 'Debe liberar el casillero antes de eliminarlo.',
                    confirmButtonText: 'Aceptar'
                });
                return;
            }
            mostrarConfirmacion({
                titulo: 'Eliminar casillero',
                mensaje: `¿Está seguro de eliminar el casillero <strong>${numCasillero}</strong>? Esta acción no se puede deshacer.`,
                tipo: 'warning',
                textoConfirmar: '<i class="bi bi-trash me-1"></i>Sí, eliminar',
                onConfirm: () => ejecutarEliminar(numCasillero)
            });
        })
        .catch(() => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo verificar el estado del casillero',
                confirmButtonText: 'Aceptar'
            });
        });
}

function ejecutarEliminar(numCasillero) {
    fetch(`${PHP_BASE}eliminar_casillero.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `num_casillero=${encodeURIComponent(numCasillero)}`
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                bootstrap.Modal.getInstance(document.getElementById('modalEditarCasillero'))?.hide();
                cargarCasilleros(paginaActual, filtroActual, busquedaActual);
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: `El casillero ${numCasillero} ha sido eliminado correctamente.`,
                    confirmButtonText: 'Aceptar'
                });
            } else {
                throw new Error(data.error || 'Error al eliminar');
            }
        })
        .catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'No se pudo eliminar el casillero',
                confirmButtonText: 'Aceptar'
            });
        });
}

/* ══════════════════════════════════════════
   AGREGAR CASILLERO
══════════════════════════════════════════ */

function abrirModalAgregarCasillero() {
    const input = document.getElementById('inputNuevoCasillero');
    if (input) input.value = '';
    const modal = new bootstrap.Modal(document.getElementById('modalAgregarCasillero'));
    modal.show();
    setTimeout(() => input?.focus(), 300);
}

function ejecutarAgregarCasillero() {
    const input = document.getElementById('inputNuevoCasillero');
    const numero = input?.value.trim() || '';

    if (!numero) {
        Swal.fire({
            icon: 'warning',
            title: 'Dato requerido',
            text: 'El número de casillero no puede estar vacío',
            confirmButtonText: 'Aceptar'
        });
        input?.focus();
        return;
    }

    const btn = document.getElementById('btnConfirmarAgregar');
    if (!btn) return;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>Agregando...';
    btn.disabled = true;

    fetch(`${PHP_BASE}crear_casillero.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `num_casillero=${encodeURIComponent(numero)}`
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                bootstrap.Modal.getInstance(document.getElementById('modalAgregarCasillero'))?.hide();
                cargarCasilleros(1, 'todos', '');
                Swal.fire({
                    icon: 'success',
                    title: 'Casillero creado',
                    text: `El casillero "${numero}" se ha creado exitosamente.`,
                    confirmButtonText: 'Aceptar'
                });
            } else {
                throw new Error(data.error || 'Error al crear el casillero');
            }
        })
        .catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'No se pudo crear el casillero',
                confirmButtonText: 'Aceptar'
            });
        })
        .finally(() => {
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }, 400);
        });
}

/* ══════════════════════════════════════════
   CONFIRMACIÓN ESTILIZADA
══════════════════════════════════════════ */

function mostrarConfirmacion({ titulo, mensaje, tipo = 'warning', textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar', onConfirm }) {
    const iconMap = {
        question: 'question',
        warning: 'warning',
        success: 'success',
        info: 'info'
    };

    Swal.fire({
        icon: iconMap[tipo] || 'warning',
        title: titulo,
        html: mensaje,
        showCancelButton: true,
        confirmButtonText: textoConfirmar,
        cancelButtonText: textoCancelar,
        confirmButtonColor: tipo === 'warning' ? '#dc3545' : tipo === 'question' ? '#0d6efd' : '#198754',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed && onConfirm) {
            onConfirm();
        }
    });
}

/* ══════════════════════════════════════════
   NOTIFICACIONES / TOASTS
══════════════════════════════════════════ */

function mostrarToast(mensaje, tipo = 'info') {
    if (typeof Swal !== 'undefined') {
        const toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2800,
            timerProgressBar: true
        });
        toast.fire({
            icon: tipo,
            title: mensaje
        });
    } else {
        console.log(`[Toast ${tipo}] ${mensaje}`);
    }
}

/* ══════════════════════════════════════════
   EXPORTAR A EXCEL
══════════════════════════════════════════ */

function abrirModalExportarExcel() {
    const modalEl = document.getElementById('modalExportarExcel');
    if (!modalEl) return;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function ejecutarDescargaExcel() {
    const radioSeleccionado = document.querySelector('input[name="tipoExportacion"]:checked');
    const tipo = radioSeleccionado ? radioSeleccionado.value : 'completo';

    const modalEl = document.getElementById('modalExportarExcel');
    if (modalEl) {
        bootstrap.Modal.getInstance(modalEl)?.hide();
    }

    mostrarToast('Generando archivo Excel de casilleros...', 'info');

    // Iniciar descarga directa
    window.location.href = `php/exportar_casilleros_excel.php?tipo=${encodeURIComponent(tipo)}`;
}

/* ══════════════════════════════════════════
   INICIALIZACIÓN
══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // Cargar casilleros al inicio
    cargarCasilleros(1, 'todos', '');

    // Botón agregar
    document.getElementById('btnAgregarCasillero')?.addEventListener('click', abrirModalAgregarCasillero);

    // Confirmar agregar
    document.getElementById('btnConfirmarAgregar')?.addEventListener('click', ejecutarAgregarCasillero);

    // Exportar Excel
    document.getElementById('btnDescargarExcel')?.addEventListener('click', abrirModalExportarExcel);
    document.getElementById('btnConfirmarExportarExcel')?.addEventListener('click', ejecutarDescargaExcel);

    // Selección de opciones de exportación
    document.querySelectorAll('.export-option-card').forEach(card => {
        card.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            document.querySelectorAll('.export-option-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Enter en modal agregar
    document.getElementById('inputNuevoCasillero')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') ejecutarAgregarCasillero();
    });

    // Filtros
    document.getElementById('btnFiltroTodos')?.addEventListener('click', () => cargarCasilleros(1, 'todos', busquedaActual));
    document.getElementById('btnFiltroDisponibles')?.addEventListener('click', () => cargarCasilleros(1, 'disponibles', busquedaActual));
    document.getElementById('btnFiltroParciales')?.addEventListener('click', () => cargarCasilleros(1, 'parciales', busquedaActual));
    document.getElementById('btnFiltroCompletos')?.addEventListener('click', () => cargarCasilleros(1, 'completos', busquedaActual));

    // Búsqueda principal con debounce
    let timeoutBusqueda;
    const inputBusqueda = document.getElementById('inputBusqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', () => {
            clearTimeout(timeoutBusqueda);
            const val = inputBusqueda.value.trim();
            timeoutBusqueda = setTimeout(() => cargarCasilleros(1, filtroActual, val), 450);
        });
        inputBusqueda.addEventListener('keydown', e => {
            if (e.key === 'Enter') cargarCasilleros(1, filtroActual, inputBusqueda.value.trim());
        });
    }

    // Limpiar búsqueda principal
    document.getElementById('btnLimpiarBusqueda')?.addEventListener('click', () => {
        if (inputBusqueda) inputBusqueda.value = '';
        cargarCasilleros(1, filtroActual, '');
    });

});
