//====================================================
// VARIABLES GLOBALES DE CLAVES DISPONIBLES
//====================================================

// Contiene la lista total de claves obtenida del servidor
let clavesLista = [];

// Catálogo de empresas registradas
let empresasListaClaves = [];

// Contiene las claves después de aplicar filtros y búsqueda
let clavesFiltradas = [];

// Filtros actuales
let filtroEmpresaClave = 'todas';
let filtroEstadoClave = 'todos';
let filtroTipoClave = 'todos';
let textoBusquedaClave = '';

// Variables de paginación
let paginaActualClaves = 1;
let registrosPorPaginaClaves = 10;


//====================================================
// INICIALIZACIÓN DE EVENTOS
//====================================================

$(document).ready(function () {

    // Botón para abrir el modal desde el formulario de información personal
    $('#btnAbrirClavesDisponibles').on('click', function () {
        abrirModalClavesDisponibles();
    });

    // Búsqueda en tiempo real
    $('#inputBuscarClave').on('input keyup', function () {
        textoBusquedaClave = $(this).val().trim().toLowerCase();
        aplicarFiltrosClaves(false);
    });

    // Botón para limpiar búsqueda
    $('#btnLimpiarBuscarClave').on('click', function () {
        $('#inputBuscarClave').val('');
        textoBusquedaClave = '';
        aplicarFiltrosClaves(false);
    });

    // Filtro por Empresa
    $('#selectFiltroEmpresaClave').on('change', function () {
        filtroEmpresaClave = $(this).val();
        aplicarFiltrosClaves(false);
    });

    // Filtro por Estado
    $('#selectFiltroEstadoClave').on('change', function () {
        filtroEstadoClave = $(this).val();
        aplicarFiltrosClaves(false);
    });

    // Filtro por Tipo de Clave
    $('#selectFiltroTipoClave').on('change', function () {
        filtroTipoClave = $(this).val();
        aplicarFiltrosClaves(false);
    });

    // Manejar el foco y scroll al cerrar el modal de claves
    $('#modalClavesDisponibles').on('hidden.bs.modal', function () {
        if ($('#modalEditarEmpleado').is(':visible')) {
            $('body').addClass('modal-open');
        }
    });

});


//====================================================
// FUNCIÓN PARA ABRIR EL MODAL DE CLAVES
//====================================================

function abrirModalClavesDisponibles() {

    // Resetear filtros y búsqueda al abrir para ver la información general
    textoBusquedaClave = '';
    filtroEmpresaClave = 'todas';
    filtroEstadoClave = 'todos';
    filtroTipoClave = 'todos';
    paginaActualClaves = 1;

    $('#inputBuscarClave').val('');
    $('#selectFiltroEmpresaClave').val('todas');
    $('#selectFiltroEstadoClave').val('todos');
    $('#selectFiltroTipoClave').val('todos');

    // Mostrar modal
    $('#modalClavesDisponibles').modal('show');

    // Obtener las claves desde el servidor
    obtenerClaves();
}


//====================================================
// FUNCIÓN PARA OBTENER LAS CLAVES DEL SERVIDOR
//====================================================

function obtenerClaves(mantenerPagina = false) {

    // Mostrar estado de carga si la lista estaba vacía
    if (!clavesLista || clavesLista.length === 0) {
        $('#tbodyClavesDisponibles').html(`
            <tr>
                <td colspan="3" class="text-center text-muted py-4">
                    <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                    Cargando claves...
                </td>
            </tr>
        `);
    }

    let urlClaves = window.location.pathname.includes('/registro/') || window.location.href.includes('/registro/')
        ? "../../empleados/php/infoClavesDisponibles.php"
        : "../php/infoClavesDisponibles.php";

    $.ajax({
        type: "POST",
        url: urlClaves,
        data: {
            accion: "obtenerClaves"
        },
        dataType: "json",

        success: function (response) {

            if (!response.success) {
                console.error("Error al obtener claves:", response.mensaje);
                $('#tbodyClavesDisponibles').html(`
                    <tr>
                        <td colspan="3" class="text-center text-danger py-4">
                            <i class="bi bi-exclamation-triangle me-1"></i>
                            ${response.mensaje || 'Error al cargar las claves.'}
                        </td>
                    </tr>
                `);
                return;
            }

            clavesLista = response.claves || [];
            empresasListaClaves = response.empresas || [];

            // Llenar el select de empresas
            llenarSelectEmpresasClave();

            // Aplicar filtros y renderizar tabla
            aplicarFiltrosClaves(mantenerPagina);
        },

        error: function (xhr, status, error) {
            console.error("Error AJAX al obtener claves:", error);
            $('#tbodyClavesDisponibles').html(`
                <tr>
                    <td colspan="3" class="text-center text-danger py-4">
                        <i class="bi bi-exclamation-circle me-1"></i>
                        Error al conectar con el servidor.
                    </td>
                </tr>
            `);
        }
    });
}


//====================================================
// FUNCIÓN PARA LLENAR EL SELECT DE EMPRESAS
//====================================================

function llenarSelectEmpresasClave() {

    var select = $('#selectFiltroEmpresaClave');
    var valorActual = filtroEmpresaClave;

    select.empty();
    select.append('<option value="todas">Todas las empresas</option>');

    empresasListaClaves.forEach(function (emp) {
        select.append(`
            <option value="${emp.id_empresa}">
                ${emp.nombre_empresa}
            </option>
        `);
    });

    select.val(valorActual);
}


//====================================================
// FUNCIÓN PARA APLICAR FILTROS Y BÚSQUEDA
//====================================================

function aplicarFiltrosClaves(mantenerPagina = false) {

    clavesFiltradas = clavesLista.filter(function (item) {

        // 1. Filtro por texto de búsqueda global (prioridad para ver información general)
        if (textoBusquedaClave !== '') {

            var claveMatch = (item.clave || '').toString().toLowerCase().includes(textoBusquedaClave);

            var empMatch = false;
            if (item.ocupantes && item.ocupantes.length > 0) {
                empMatch = item.ocupantes.some(function (emp) {
                    var nombre = (emp.nombre_completo || '').toLowerCase();
                    var empresa = (emp.nombre_empresa || '').toLowerCase();
                    return nombre.includes(textoBusquedaClave) || empresa.includes(textoBusquedaClave);
                });
            }

            var empDispMatch = false;
            if (item.empresas_disponibles && item.empresas_disponibles.length > 0) {
                empDispMatch = item.empresas_disponibles.some(function (empresa) {
                    return empresa.nombre_empresa.toLowerCase().includes(textoBusquedaClave);
                });
            }

            // Cuando hay texto de búsqueda, buscar en todo el catálogo
            return claveMatch || empMatch || empDispMatch;
        }

        // 2. Filtro por Tipo de Clave (solo cuando no hay texto de búsqueda activo)
        if (filtroTipoClave !== 'todos') {
            var claveTexto = (item.clave || '').toString().toUpperCase();
            var esTipoSS = claveTexto.includes('SS/');

            if (filtroTipoClave === 'numericas' && esTipoSS) {
                return false;
            }
            if (filtroTipoClave === 'ss' && !esTipoSS) {
                return false;
            }
        }

        // 3. Filtro por Empresa (solo cuando no hay texto de búsqueda activo)
        if (filtroEmpresaClave !== 'todas') {
            var empresaIdNum = parseInt(filtroEmpresaClave);

            var ocupadaEnEmpresa = item.ocupantes && item.ocupantes.some(function (o) {
                return o.id_empresa === empresaIdNum;
            });

            var disponibleEnEmpresa = item.empresas_disponibles && item.empresas_disponibles.some(function (e) {
                return e.id_empresa === empresaIdNum;
            });

            if (filtroEstadoClave === 'ocupadas' && !ocupadaEnEmpresa) {
                return false;
            }
            if (filtroEstadoClave === 'disponibles' && !disponibleEnEmpresa) {
                return false;
            }
            if (filtroEstadoClave === 'todos' && !ocupadaEnEmpresa && !disponibleEnEmpresa) {
                return false;
            }
        } else {
            // Cuando es todas las empresas
            if (filtroEstadoClave === 'ocupadas' && (!item.ocupantes || item.ocupantes.length === 0)) {
                return false;
            }
            if (filtroEstadoClave === 'disponibles' && (!item.empresas_disponibles || item.empresas_disponibles.length === 0)) {
                return false;
            }
        }

        return true;
    });

    // Si el usuario buscó una clave específica que no está registrada aún en ningún empleado
    if (textoBusquedaClave !== '') {
        var busquedaOriginal = $('#inputBuscarClave').val().trim();
        var existeClaveExacta = clavesLista.some(function (item) {
            return (item.clave || '').toString().trim().toLowerCase() === busquedaOriginal.toLowerCase();
        });

        if (busquedaOriginal !== '' && !existeClaveExacta) {
            var nuevaClaveDisponible = {
                clave: busquedaOriginal,
                ocupantes: [],
                empresas_disponibles: empresasListaClaves || [],
                total_ocupadas: 0,
                total_disponibles: (empresasListaClaves || []).length,
                esNueva: true
            };
            // Mostrar al inicio como opción disponible para ser seleccionada
            clavesFiltradas.unshift(nuevaClaveDisponible);
        }
    }

    if (!mantenerPagina) {
        paginaActualClaves = 1;
    }

    mostrarClavesEnTabla();
}


//====================================================
// FUNCIÓN PARA MOSTRAR LAS CLAVES EN LA TABLA
//====================================================

function mostrarClavesEnTabla() {

    $('#tbodyClavesDisponibles').empty();

    // Si no hay resultados
    if (!clavesFiltradas || clavesFiltradas.length === 0) {
        $('#tbodyClavesDisponibles').html(`
            <tr>
                <td colspan="3" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                    No se encontraron claves con los criterios seleccionados.
                </td>
            </tr>
        `);

        $('#infoPaginacionClaves').text('Mostrando 0 claves');
        $('#paginacionClaves').empty();
        return;
    }

    // Calcular paginación
    var totalRegistros = clavesFiltradas.length;
    var totalPaginas = Math.ceil(totalRegistros / registrosPorPaginaClaves);

    if (paginaActualClaves > totalPaginas) {
        paginaActualClaves = totalPaginas;
    }
    if (paginaActualClaves < 1) {
        paginaActualClaves = 1;
    }

    var inicio = (paginaActualClaves - 1) * registrosPorPaginaClaves;
    var fin = inicio + registrosPorPaginaClaves;
    var clavesPagina = clavesFiltradas.slice(inicio, fin);

    // Obtener la empresa del empleado que se está editando o registrando
    var empresaEmpleadoEditando = $('#editarEmpresa').length ? $('#editarEmpresa').val() : $('#registroEmpresa').val();
    var empresaEmpleadoId = (empresaEmpleadoEditando && empresaEmpleadoEditando !== '1000' && empresaEmpleadoEditando !== '') ? parseInt(empresaEmpleadoEditando) : null;

    // Obtener información del filtro de empresa activo (solo si no hay búsqueda de texto activa)
    var esEmpresaFiltrada = (filtroEmpresaClave !== 'todas' && textoBusquedaClave === '');
    var empresaFiltroId = esEmpresaFiltrada ? parseInt(filtroEmpresaClave) : null;
    var nombreEmpresaFiltro = '';
    if (esEmpresaFiltrada) {
        var empObj = empresasListaClaves.find(e => e.id_empresa === empresaFiltroId);
        nombreEmpresaFiltro = empObj ? empObj.nombre_empresa : '';
    }

    // Renderizar filas
    clavesPagina.forEach(function (c) {

        var ocupantesHtml = '';
        var puedeSeleccionar = true;
        var tituloDeshabilitado = '';

        if (esEmpresaFiltrada) {
            // ==========================================
            // MODO VISTA CON EMPRESA SELECCIONADA
            // ==========================================
            var empEnEmpresa = c.ocupantes ? c.ocupantes.find(o => o.id_empresa === empresaFiltroId) : null;

            if (empEnEmpresa) {
                // Está ocupada en esta empresa
                puedeSeleccionar = false;
                tituloDeshabilitado = `Ocupada por ${empEnEmpresa.nombre_completo} en ${nombreEmpresaFiltro}`;

                ocupantesHtml = `
                    <div class="d-flex align-items-center justify-content-between p-2 rounded bg-light border">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-person-circle fs-5 text-secondary"></i>
                            <div>
                                <div class="fw-semibold text-dark small">${empEnEmpresa.nombre_completo}</div>
                                <div class="text-muted small" style="font-size: 0.75rem;">
                                    <span class="badge bg-light text-primary border">${empEnEmpresa.nombre_empresa}</span>
                                </div>
                            </div>
                        </div>
                        <span class="badge bg-danger">
                            <i class="bi bi-lock-fill me-1"></i> Ocupada en ${nombreEmpresaFiltro}
                        </span>
                    </div>
                `;
            } else {
                // Está disponible en esta empresa
                puedeSeleccionar = true;

                ocupantesHtml = `
                    <div class="d-flex align-items-center gap-2 text-success small py-1">
                        <i class="bi bi-check-circle-fill text-success fs-5"></i>
                        <span>Disponible para asignarse en <b>${nombreEmpresaFiltro}</b></span>
                    </div>
                `;
            }

        } else {
            // ==========================================
            // MODO VISTA CON TODAS LAS EMPRESAS
            // ==========================================
            if (c.ocupantes && c.ocupantes.length > 0) {
                ocupantesHtml = c.ocupantes.map(function (emp) {
                    return `
                        <div class="d-flex align-items-center justify-content-between p-2 mb-1 rounded bg-light border">
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 0.72rem;">
                                    <i class="bi bi-building me-1"></i>${emp.nombre_empresa}
                                </span>
                                <span class="fw-semibold text-dark small">${emp.nombre_completo}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                ocupantesHtml = `
                    <div class="d-flex align-items-center gap-2 text-success small py-1">
                        <i class="bi bi-check-circle-fill text-success fs-5"></i>
                        <span><b class="text-success">Disponible</b> &mdash; Clave libre para todas las empresas</span>
                    </div>
                `;
            }

            // Validar si puede seleccionar en base a la empresa del empleado
            if (empresaEmpleadoId) {
                var ocupadaEnEmpresaEmpleado = c.ocupantes && c.ocupantes.some(o => o.id_empresa === empresaEmpleadoId);
                if (ocupadaEnEmpresaEmpleado) {
                    puedeSeleccionar = false;
                    tituloDeshabilitado = 'Esta clave ya está ocupada en la empresa del empleado';
                }
            } else {
                if (c.total_disponibles === 0) {
                    puedeSeleccionar = false;
                    tituloDeshabilitado = 'Clave ocupada en todas las empresas';
                }
            }
        }

        // Botón de acción
        var botonAccion = '';
        var claveEscapada = c.clave.toString().replace(/'/g, "\\'");

        if (puedeSeleccionar) {
            botonAccion = `
                <button
                    type="button"
                    class="btn btn-sm btn-success"
                    onclick="seleccionarClave('${claveEscapada}')"
                    title="Asignar esta clave">
                    <i class="bi bi-check-lg me-1"></i> Seleccionar
                </button>
            `;
        } else {
            botonAccion = `
                <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    disabled
                    title="${tituloDeshabilitado}">
                    <i class="bi bi-lock-fill me-1"></i> Ocupada
                </button>
            `;
        }

        $('#tbodyClavesDisponibles').append(`
            <tr>
                <td class="text-center">
                    <span class="badge bg-light text-dark border fs-6 px-3 py-2 fw-semibold">
                        <i class="bi bi-key-fill text-success me-1"></i>
                        ${c.clave}
                    </span>
                </td>
                <td>
                    ${ocupantesHtml}
                </td>
                <td class="text-center">
                    ${botonAccion}
                </td>
            </tr>
        `);

    });

    // Actualizar texto de información de paginación
    var mostrandoDesde = inicio + 1;
    var mostrandoHasta = Math.min(fin, totalRegistros);
    $('#infoPaginacionClaves').text(
        `Mostrando ${mostrandoDesde} a ${mostrandoHasta} de ${totalRegistros} claves`
    );

    // Generar botones de paginación
    crearPaginacionClaves(totalPaginas);
}


//====================================================
// FUNCIÓN PARA GENERAR LA PAGINACIÓN DE CLAVES
//====================================================

function crearPaginacionClaves(totalPaginas) {

    $('#paginacionClaves').empty();

    if (totalPaginas <= 1) {
        return;
    }

    // Botón Anterior
    $('#paginacionClaves').append(`
        <li class="page-item ${paginaActualClaves === 1 ? 'disabled' : ''}">
            <button
                type="button"
                class="page-link"
                onclick="cambiarPaginaClaves(${paginaActualClaves - 1})"
                aria-label="Anterior">
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>
    `);

    // Páginas numéricas
    var inicio = Math.max(1, paginaActualClaves - 2);
    var fin = Math.min(totalPaginas, paginaActualClaves + 2);

    if (inicio > 1) {
        $('#paginacionClaves').append(`
            <li class="page-item">
                <button type="button" class="page-link" onclick="cambiarPaginaClaves(1)">1</button>
            </li>
        `);
        if (inicio > 2) {
            $('#paginacionClaves').append(`
                <li class="page-item disabled"><span class="page-link">...</span></li>
            `);
        }
    }

    for (var i = inicio; i <= fin; i++) {
        $('#paginacionClaves').append(`
            <li class="page-item ${i === paginaActualClaves ? 'active' : ''}">
                <button
                    type="button"
                    class="page-link"
                    onclick="cambiarPaginaClaves(${i})">
                    ${i}
                </button>
            </li>
        `);
    }

    if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) {
            $('#paginacionClaves').append(`
                <li class="page-item disabled"><span class="page-link">...</span></li>
            `);
        }
        $('#paginacionClaves').append(`
            <li class="page-item">
                <button type="button" class="page-link" onclick="cambiarPaginaClaves(${totalPaginas})">${totalPaginas}</button>
            </li>
        `);
    }

    // Botón Siguiente
    $('#paginacionClaves').append(`
        <li class="page-item ${paginaActualClaves === totalPaginas ? 'disabled' : ''}">
            <button
                type="button"
                class="page-link"
                onclick="cambiarPaginaClaves(${paginaActualClaves + 1})"
                aria-label="Siguiente">
                <i class="bi bi-chevron-right"></i>
            </button>
        </li>
    `);
}


//====================================================
// FUNCIÓN PARA CAMBIAR DE PÁGINA EN CLAVES
//====================================================

function cambiarPaginaClaves(nuevaPagina) {
    var totalPaginas = Math.ceil(clavesFiltradas.length / registrosPorPaginaClaves);

    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) {
        return;
    }

    paginaActualClaves = nuevaPagina;
    mostrarClavesEnTabla();
}


//====================================================
// FUNCIÓN PARA SELECCIONAR UNA CLAVE Y ASIGNARLA
//====================================================

function seleccionarClave(numClave) {

    // Establecer el valor en el input del modal de información personal (editar) o de registro
    if ($('#editarClave').length) {
        $('#editarClave').val(numClave).trigger('change');
        $('#editarClave').focus();
    }

    if ($('#registroClave').length) {
        $('#registroClave').val(numClave).trigger('change');
        $('#registroClave').focus();
    }

    // Cerrar el modal de claves disponibles
    $('#modalClavesDisponibles').modal('hide');
}
