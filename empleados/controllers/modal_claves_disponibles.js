 $(function () {
    const modalElement = document.getElementById('modalClavesDisponibles');

    if (!modalElement) {
        return;
    }

    const modalClaves = bootstrap.Modal.getOrCreateInstance(modalElement);
    const estadoClaves = {
        numericas: [],
        ss: []
    };
    let resumenActual = null;

    function escaparHtml(valor) {
        return String(valor ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* ──────────────────────────────────────────────
       Empresa: lee del select propio del modal
    ────────────────────────────────────────────── */
    function obtenerEmpresaSeleccionada() {
        const $selectModal = $('#selectEmpresaClaves');
        return {
            id: $selectModal.val(),
            nombre: $selectModal.find('option:selected').text().trim()
        };
    }

    /* ──────────────────────────────────────────────
       Carga el listado de empresas en el select del modal
    ────────────────────────────────────────────── */
    function cargarEmpresasEnModal(callback) {
        const $select = $('#selectEmpresaClaves');

        // Si ya tiene opciones cargadas (más de la opción vacía) no volver a pedir
        if ($select.find('option').length > 1) {
            if (typeof callback === 'function') callback();
            return;
        }

        $.ajax({
            type: 'GET',
            url: '../../public/php/obtenerEmpresas.php',
            success: function (response) {
                let empresas = response;
                if (typeof response === 'string') {
                    try { empresas = JSON.parse(response); } catch (e) { empresas = []; }
                }

                if (!Array.isArray(empresas)) empresas = [];

                let opciones = '<option value="">-- Selecciona una empresa --</option>';
                empresas.forEach(function (emp) {
                    opciones += `<option value="${escaparHtml(emp.id_empresa)}">${escaparHtml(emp.nombre_empresa)}</option>`;
                });
                $select.html(opciones);

                if (typeof callback === 'function') callback();
            },
            error: function () {
                $select.html('<option value="">Error al cargar empresas</option>');
            }
        });
    }

    /* ──────────────────────────────────────────────
       Pre-selecciona en el modal la empresa del formulario (si hay una)
    ────────────────────────────────────────────── */
    function preseleccionarEmpresaDelForm() {
        const idEmpresaForm = $('#empresa_trabajador').val();
        if (idEmpresaForm) {
            $('#selectEmpresaClaves').val(idEmpresaForm);
        }
    }

    function obtenerMetadatosEstado(claveInfo) {
        if (!claveInfo.disponible) {
            return {
                badgeClass: 'text-bg-danger',
                borderClass: 'border-danger',
                texto: 'Ocupada en esta empresa',
                botonClass: 'btn-outline-secondary',
                botonTexto: 'No disponible',
                seleccionable: false
            };
        }

        if (claveInfo.total_asignados > 0) {
            return {
                badgeClass: 'text-bg-warning',
                borderClass: 'border-warning',
                texto: 'Disponible en esta empresa',
                botonClass: 'btn-outline-primary',
                botonTexto: 'Usar clave',
                seleccionable: true
            };
        }

        return {
            badgeClass: 'text-bg-success',
            borderClass: 'border-success',
            texto: 'Disponible',
            botonClass: 'btn-outline-success',
            botonTexto: 'Usar clave',
            seleccionable: true
        };
    }

    function renderizarGrupoEmpleados(titulo, empleados, claseLista) {
        if (!Array.isArray(empleados) || !empleados.length) {
            return '';
        }

        const items = empleados.map((empleado) => `
            <li class="list-group-item px-2 py-1 ${claseLista}">
                <div class="fw-semibold">${escaparHtml(empleado.nombre_completo || 'Sin nombre')}</div>
                <div class="small text-muted">${escaparHtml(empleado.empresa || 'Sin empresa asignada')}</div>
            </li>
        `).join('');

        return `
            <div class="mb-2">
                <div class="small fw-semibold mb-1">${escaparHtml(titulo)}</div>
                <ul class="list-group list-group-flush small border rounded">
                    ${items}
                </ul>
            </div>
        `;
    }

    function coincideConBusqueda(claveInfo, busqueda) {
        if (!busqueda) {
            return true;
        }

        const texto = busqueda.toUpperCase();

        if ((claveInfo.clave || '').toUpperCase().includes(texto)) {
            return true;
        }

        const grupos = [
            ...(claveInfo.empleados_misma_empresa || []),
            ...(claveInfo.empleados_otras_empresas || []),
            ...(claveInfo.empleados_sin_empresa || [])
        ];

        return grupos.some((empleado) => {
            const nombre = (empleado.nombre_completo || '').toUpperCase();
            const empresa = (empleado.empresa || '').toUpperCase();
            return nombre.includes(texto) || empresa.includes(texto);
        });
    }

    function renderizarListaClaves(tipo) {
        const busqueda = ($('#buscarClaveDisponible').val() || '').trim().toUpperCase();
        const claves = Array.isArray(estadoClaves[tipo]) ? estadoClaves[tipo] : [];
        const clavesFiltradas = claves.filter((claveInfo) => coincideConBusqueda(claveInfo, busqueda));

        const contenedorId = tipo === 'numericas' ? '#contenedorClavesNumericas' : '#contenedorClavesSS';
        const infoId = tipo === 'numericas' ? '#infoClavesNumericas' : '#infoClavesSS';
        const resumenDisponibles = tipo === 'numericas'
            ? resumenActual?.numericas_disponibles_misma_empresa
            : resumenActual?.ss_disponibles_misma_empresa;
        const resumenOcupadas = tipo === 'numericas'
            ? resumenActual?.numericas_ocupadas_misma_empresa
            : resumenActual?.ss_ocupadas_misma_empresa;

        $(infoId).text(`Mostrando ${clavesFiltradas.length} de ${claves.length}. Disponibles: ${resumenDisponibles ?? 0}. Ocupadas en esta empresa: ${resumenOcupadas ?? 0}.`);

        if (!claves.length) {
            $(contenedorId).html('<div class="col-12 text-center text-muted py-4">No hay claves cargadas para mostrar.</div>');
            return;
        }

        if (!clavesFiltradas.length) {
            $(contenedorId).html('<div class="col-12 text-center text-muted py-4">No hay coincidencias con la busqueda.</div>');
            return;
        }

        const html = clavesFiltradas.map((claveInfo) => {
            const estado = obtenerMetadatosEstado(claveInfo);
            const resumenAsignacion = [];

            if ((claveInfo.empleados_misma_empresa || []).length) {
                resumenAsignacion.push(`${claveInfo.empleados_misma_empresa.length} en esta empresa`);
            }
            if ((claveInfo.empleados_otras_empresas || []).length) {
                resumenAsignacion.push(`${claveInfo.empleados_otras_empresas.length} en otras empresas`);
            }
            if ((claveInfo.empleados_sin_empresa || []).length) {
                resumenAsignacion.push(`${claveInfo.empleados_sin_empresa.length} sin empresa`);
            }

            return `
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="card h-100 shadow-sm ${estado.borderClass}">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                                <div>
                                    <h5 class="card-title mb-1">${escaparHtml(claveInfo.clave)}</h5>
                                    <span class="badge ${estado.badgeClass}">${estado.texto}</span>
                                </div>
                                <button
                                    type="button"
                                    class="btn btn-sm ${estado.botonClass} btn-seleccionar-clave"
                                    data-clave="${escaparHtml(claveInfo.clave)}"
                                    ${estado.seleccionable ? '' : 'disabled'}
                                >
                                    ${estado.botonTexto}
                                </button>
                            </div>

                            <div class="small text-muted mb-2">
                                ${resumenAsignacion.length ? escaparHtml(resumenAsignacion.join(' | ')) : 'Sin asignaciones registradas.'}
                            </div>

                            ${renderizarGrupoEmpleados('Misma empresa', claveInfo.empleados_misma_empresa, '')}
                            ${renderizarGrupoEmpleados('Otras empresas', claveInfo.empleados_otras_empresas, '')}
                            ${renderizarGrupoEmpleados('Sin empresa asignada', claveInfo.empleados_sin_empresa, '')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $(contenedorId).html(html);
    }

    function renderizarTodasLasListas() {
        renderizarListaClaves('numericas');
        renderizarListaClaves('ss');
    }

    function resetearContenido() {
        estadoClaves.numericas = [];
        estadoClaves.ss = [];
        resumenActual = null;
        $('#buscarClaveDisponible').val('');
        $('#infoClavesNumericas, #infoClavesSS').text('Sin datos cargados.');
        $('#contenedorClavesNumericas, #contenedorClavesSS').html('<div class="col-12 text-center text-muted py-4">Selecciona una empresa para consultar claves.</div>');
    }

    function cargarClavesDisponibles() {
        const empresa = obtenerEmpresaSeleccionada();

        if (!empresa.id) {
            resetearContenido();
            return;
        }

        $('#contenedorClavesNumericas, #contenedorClavesSS').html('<div class="col-12 text-center text-muted py-4">Cargando claves disponibles...</div>');
        $('#infoClavesNumericas, #infoClavesSS').text('Consultando informacion...');

        $.ajax({
            type: 'GET',
            url: '../php/obtener_claves_disponibles.php',
            data: {
                id_empresa: empresa.id,
                limite: 1000
            },
            success: function (response) {
                let respuesta = response;

                if (typeof response === 'string') {
                    try {
                        respuesta = JSON.parse(response);
                    } catch (error) {
                        respuesta = null;
                    }
                }

                if (!respuesta || respuesta.success !== true) {
                    const mensaje = respuesta && respuesta.message ? respuesta.message : 'No se pudieron cargar las claves disponibles.';
                    $('#contenedorClavesNumericas, #contenedorClavesSS').html(`<div class="col-12 text-center text-danger py-4">${escaparHtml(mensaje)}</div>`);
                    $('#infoClavesNumericas, #infoClavesSS').text('Error al consultar.');
                    return;
                }

                estadoClaves.numericas = Array.isArray(respuesta.numericas) ? respuesta.numericas : [];
                estadoClaves.ss = Array.isArray(respuesta.ss) ? respuesta.ss : [];
                resumenActual = respuesta.resumen || null;

                renderizarTodasLasListas();
            },
            error: function () {
                $('#contenedorClavesNumericas, #contenedorClavesSS').html('<div class="col-12 text-center text-danger py-4">Error de conexion al consultar claves.</div>');
                $('#infoClavesNumericas, #infoClavesSS').text('Error al consultar.');
            }
        });
    }

    /* ──────────────────────────────────────────────
       Eventos
    ────────────────────────────────────────────── */

    // Abrir modal: cargar empresas, preseleccionar la del form y cargar claves
    $(document).on('click', '#btnAbrirModalClaves', function () {
        modalClaves.show();
        cargarEmpresasEnModal(function () {
            preseleccionarEmpresaDelForm();
            cargarClavesDisponibles();
        });
    });

    // Cambio de empresa dentro del modal → recargar claves automáticamente
    $(document).on('change', '#selectEmpresaClaves', function () {
        resetearContenido();
        cargarClavesDisponibles();
    });

    // Botón Actualizar
    $(document).on('click', '#btnRecargarClavesDisponibles', function () {
        cargarClavesDisponibles();
    });

    // Filtro de búsqueda
    $(document).on('input', '#buscarClaveDisponible', function () {
        renderizarTodasLasListas();
    });

    // Seleccionar clave → poner en el formulario y sincronizar empresa
    $(document).on('click', '.btn-seleccionar-clave', function () {
        const clave = $(this).data('clave');

        // Poner la clave en el campo del formulario
        $('#clave_trabajador')
            .val(clave)
            .trigger('input');

        // Sincronizar la empresa elegida en el modal al select del formulario
        const empresa = obtenerEmpresaSeleccionada();
        if (empresa.id) {
            const $selectForm = $('#empresa_trabajador');
            if ($selectForm.val() !== empresa.id) {
                $selectForm.val(empresa.id).trigger('change');
            }
        }

        modalClaves.hide();
    });

    // Si el usuario cambia empresa en el form MIENTRAS el modal está cerrado,
    // la próxima apertura del modal preseleccionará la nueva empresa.
    // No es necesario resetear el modal aquí porque se refresca al abrirse.
});
