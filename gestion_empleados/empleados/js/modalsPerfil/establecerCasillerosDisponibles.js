//====================================================
// VARIABLES GLOBALES DE CASILLEROS DISPONIBLES
//====================================================

// Contiene la lista total de casilleros obtenida del servidor
let casillerosLista = [];

// Contiene los casilleros después de aplicar filtros y búsqueda
let casillerosFiltrados = [];

// Estado del filtro seleccionado ('todos', 'disponibles', 'ocupados')
let filtroEstadoCasillero = 'todos';

// Texto de búsqueda ingresado
let textoBusquedaCasillero = '';

// Variables de paginación
let paginaActualCasilleros = 1;
let registrosPorPaginaCasilleros = 10;


//====================================================
// INICIALIZACIÓN DE EVENTOS
//====================================================

$(document).ready(function () {

    // Botón para abrir el modal desde el formulario de información personal
    $('#btnAbrirCasillerosDisponibles').on('click', function () {
        abrirModalCasillerosDisponibles();
    });

    // Búsqueda en tiempo real
    $('#inputBuscarCasillero').on('input keyup', function () {
        textoBusquedaCasillero = $(this).val().trim().toLowerCase();
        aplicarFiltrosCasilleros(false);
    });

    // Botón para limpiar búsqueda
    $('#btnLimpiarBuscarCasillero').on('click', function () {
        $('#inputBuscarCasillero').val('');
        textoBusquedaCasillero = '';
        aplicarFiltrosCasilleros(false);
    });

    // Filtro por Select de estado (todos, disponibles, ocupados)
    $('#selectFiltroEstadoCasillero').on('change', function () {
        filtroEstadoCasillero = $(this).val();
        aplicarFiltrosCasilleros(false);
    });

    // Manejar el foco y scroll al cerrar el modal de casilleros
    $('#modalCasillerosDisponibles').on('hidden.bs.modal', function () {
        if ($('#modalEditarEmpleado').is(':visible')) {
            $('body').addClass('modal-open');
        }
    });

});


//====================================================
// FUNCIÓN PARA ABRIR EL MODAL DE CASILLEROS
//====================================================

function abrirModalCasillerosDisponibles() {

    // Resetear filtros y búsqueda al abrir
    textoBusquedaCasillero = '';
    filtroEstadoCasillero = 'todos';
    paginaActualCasilleros = 1;

    $('#inputBuscarCasillero').val('');
    $('#selectFiltroEstadoCasillero').val('todos');

    // Mostrar modal
    $('#modalCasillerosDisponibles').modal('show');

    // Obtener los casilleros desde el servidor
    obtenerCasillerosDisponibles();
}


//====================================================
// FUNCIÓN PARA OBTENER LOS CASILLEROS DEL SERVIDOR
//====================================================

function obtenerCasillerosDisponibles(mantenerPagina = false) {

    // Mostrar estado de carga si la lista estaba vacía
    if (!casillerosLista || casillerosLista.length === 0) {
        $('#tbodyCasillerosDisponibles').html(`
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                    Cargando casilleros...
                </td>
            </tr>
        `);
    }

    let urlCasilleros = window.location.pathname.includes('/registro/') || window.location.href.includes('/registro/')
        ? "../../empleados/php/infoCasillerosDisponibles.php"
        : "../php/infoCasillerosDisponibles.php";

    $.ajax({
        type: "POST",
        url: urlCasilleros,
        data: {
            accion: "obtenerCasillerosDisponibles"
        },
        dataType: "json",

        success: function (response) {

            if (!response.success) {
                console.error("Error al obtener casilleros:", response.mensaje);
                $('#tbodyCasillerosDisponibles').html(`
                    <tr>
                        <td colspan="4" class="text-center text-danger py-4">
                            <i class="bi bi-exclamation-triangle me-1"></i>
                            ${response.mensaje || 'Error al cargar los casilleros.'}
                        </td>
                    </tr>
                `);
                return;
            }

            casillerosLista = response.casilleros || [];

            // Aplicar filtros y renderizar tabla
            aplicarFiltrosCasilleros(mantenerPagina);
        },

        error: function (xhr, status, error) {
            console.error("Error AJAX al obtener los casilleros:", error);
            $('#tbodyCasillerosDisponibles').html(`
                <tr>
                    <td colspan="4" class="text-center text-danger py-4">
                        <i class="bi bi-exclamation-circle me-1"></i>
                        Error al conectar con el servidor.
                    </td>
                </tr>
            `);
        }
    });
}


//====================================================
// FUNCIÓN PARA APLICAR FILTROS Y BÚSQUEDA
//====================================================

function aplicarFiltrosCasilleros(mantenerPagina = false) {

    casillerosFiltrados = casillerosLista.filter(function (casillero) {

        // 1. Filtro por estado
        var cumpleEstado = true;
        if (filtroEstadoCasillero === 'disponibles') {
            cumpleEstado = (casillero.total_ocupantes < 2);
        } else if (filtroEstadoCasillero === 'ocupados') {
            cumpleEstado = (casillero.total_ocupantes >= 2);
        }

        if (!cumpleEstado) return false;

        // 2. Filtro por texto de búsqueda (casillero o nombre/clave de empleados)
        if (textoBusquedaCasillero !== '') {

            var numMatch = casillero.num_casillero.toLowerCase().includes(textoBusquedaCasillero);

            var empMatch = false;
            if (casillero.empleados && casillero.empleados.length > 0) {
                empMatch = casillero.empleados.some(function (emp) {
                    var nombre = (emp.nombre_completo || '').toLowerCase();
                    var clave = (emp.clave || '').toString().toLowerCase();
                    return nombre.includes(textoBusquedaCasillero) || clave.includes(textoBusquedaCasillero);
                });
            }

            return numMatch || empMatch;
        }

        return true;
    });

    if (!mantenerPagina) {
        paginaActualCasilleros = 1;
    }

    mostrarCasillerosEnTabla();
}


//====================================================
// FUNCIÓN PARA MOSTRAR LOS CASILLEROS EN LA TABLA
//====================================================

function mostrarCasillerosEnTabla() {

    $('#tbodyCasillerosDisponibles').empty();

    // Si no hay casilleros registrados o tras filtrar
    if (!casillerosFiltrados || casillerosFiltrados.length === 0) {
        $('#tbodyCasillerosDisponibles').html(`
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                    No se encontraron casilleros con los criterios seleccionados.
                </td>
            </tr>
        `);

        $('#infoPaginacionCasilleros').text('Mostrando 0 casilleros');
        $('#paginacionCasilleros').empty();
        return;
    }

    // Calcular paginación
    var totalRegistros = casillerosFiltrados.length;
    var totalPaginas = Math.ceil(totalRegistros / registrosPorPaginaCasilleros);

    if (paginaActualCasilleros > totalPaginas) {
        paginaActualCasilleros = totalPaginas;
    }
    if (paginaActualCasilleros < 1) {
        paginaActualCasilleros = 1;
    }

    var inicio = (paginaActualCasilleros - 1) * registrosPorPaginaCasilleros;
    var fin = inicio + registrosPorPaginaCasilleros;
    var casillerosPagina = casillerosFiltrados.slice(inicio, fin);

    // Renderizar filas de casilleros
    casillerosPagina.forEach(function (c) {

        var total = c.total_ocupantes || 0;
        var capacidad = c.capacidad_maxima || 2;

        // Badge de estado y capacidad
        var badgeEstado = '';
        if (total === 0) {
            badgeEstado = `
                <span class="badge bg-success">
                    <i class="bi bi-check-circle me-1"></i> Disponible (0/${capacidad})
                </span>`;
        } else if (total === 1) {
            badgeEstado = `
                <span class="badge bg-warning text-dark">
                    <i class="bi bi-person-fill me-1"></i> Disponible (1/${capacidad})
                </span>`;
        } else {
            badgeEstado = `
                <span class="badge bg-danger">
                    <i class="bi bi-lock-fill me-1"></i> Ocupado (${total}/${capacidad})
                </span>`;
        }

        // Listado de empleados asignados con botón para liberar casillero
        var empleadosHtml = '';
        if (c.empleados && c.empleados.length > 0) {
            empleadosHtml = c.empleados.map(function (emp) {
                return `
                    <div class="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-1 border">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-person-circle text-secondary fs-5"></i>
                            <div>
                                <div class="fw-semibold text-dark small">${emp.nombre_completo}</div>
                                <div class="text-muted small" style="font-size: 0.75rem;">Clave: ${emp.clave ? emp.clave : 'S/C'}</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="btn btn-outline-danger btn-sm"
                            style="padding: 0.2rem 0.5rem; font-size: 0.78rem;"
                            title="Liberar casillero para este empleado"
                            onclick="confirmarLiberarCasillero(${emp.id_empleado}, '${c.num_casillero}', '${emp.nombre_completo.replace(/'/g, "\\'")}')">
                            <i class="bi bi-person-dash me-1"></i> Liberar
                        </button>
                    </div>
                `;
            }).join('');
        } else {
            empleadosHtml = `
                <span class="text-muted fst-italic small">
                    <i class="bi bi-dash-circle me-1"></i> Sin empleados asignados
                </span>
            `;
        }

        // Botón de acción
        var botonAccion = '';
        if (total < capacidad) {
            botonAccion = `
                <button
                    type="button"
                    class="btn btn-sm btn-success"
                    onclick="seleccionarCasillero('${c.num_casillero}')"
                    title="Asignar este casillero">
                    <i class="bi bi-check-lg me-1"></i> Seleccionar
                </button>
            `;
        } else {
            botonAccion = `
                <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    disabled
                    title="Casillero lleno (Límite 2 personas alcanzado)">
                    <i class="bi bi-lock-fill me-1"></i> Lleno
                </button>
            `;
        }

        $('#tbodyCasillerosDisponibles').append(`
            <tr>
                <td class="text-center">
                    <span class="badge bg-light text-dark border fs-6 px-3 py-2">
                        <i class="bi bi-box-seam text-success me-1"></i>
                        ${c.num_casillero}
                    </span>
                </td>
                <td class="text-center">
                    ${badgeEstado}
                </td>
                <td>
                    ${empleadosHtml}
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
    $('#infoPaginacionCasilleros').text(
        `Mostrando ${mostrandoDesde} a ${mostrandoHasta} de ${totalRegistros} casilleros`
    );

    // Generar botones de paginación
    crearPaginacionCasilleros(totalPaginas);
}


//====================================================
// FUNCIÓN PARA GENERAR LA PAGINACIÓN DE CASILLEROS
//====================================================

function crearPaginacionCasilleros(totalPaginas) {

    $('#paginacionCasilleros').empty();

    if (totalPaginas <= 1) {
        return;
    }

    // Botón Anterior
    $('#paginacionCasilleros').append(`
        <li class="page-item ${paginaActualCasilleros === 1 ? 'disabled' : ''}">
            <button
                type="button"
                class="page-link"
                onclick="cambiarPaginaCasilleros(${paginaActualCasilleros - 1})"
                aria-label="Anterior">
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>
    `);

    // Páginas numéricas (máximo 5 botones visibles alrededor de la actual)
    var inicio = Math.max(1, paginaActualCasilleros - 2);
    var fin = Math.min(totalPaginas, paginaActualCasilleros + 2);

    if (inicio > 1) {
        $('#paginacionCasilleros').append(`
            <li class="page-item">
                <button type="button" class="page-link" onclick="cambiarPaginaCasilleros(1)">1</button>
            </li>
        `);
        if (inicio > 2) {
            $('#paginacionCasilleros').append(`
                <li class="page-item disabled"><span class="page-link">...</span></li>
            `);
        }
    }

    for (var i = inicio; i <= fin; i++) {
        $('#paginacionCasilleros').append(`
            <li class="page-item ${i === paginaActualCasilleros ? 'active' : ''}">
                <button
                    type="button"
                    class="page-link"
                    onclick="cambiarPaginaCasilleros(${i})">
                    ${i}
                </button>
            </li>
        `);
    }

    if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) {
            $('#paginacionCasilleros').append(`
                <li class="page-item disabled"><span class="page-link">...</span></li>
            `);
        }
        $('#paginacionCasilleros').append(`
            <li class="page-item">
                <button type="button" class="page-link" onclick="cambiarPaginaCasilleros(${totalPaginas})">${totalPaginas}</button>
            </li>
        `);
    }

    // Botón Siguiente
    $('#paginacionCasilleros').append(`
        <li class="page-item ${paginaActualCasilleros === totalPaginas ? 'disabled' : ''}">
            <button
                type="button"
                class="page-link"
                onclick="cambiarPaginaCasilleros(${paginaActualCasilleros + 1})"
                aria-label="Siguiente">
                <i class="bi bi-chevron-right"></i>
            </button>
        </li>
    `);
}


//====================================================
// FUNCIÓN PARA CAMBIAR DE PÁGINA EN CASILLEROS
//====================================================

function cambiarPaginaCasilleros(nuevaPagina) {
    var totalPaginas = Math.ceil(casillerosFiltrados.length / registrosPorPaginaCasilleros);

    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) {
        return;
    }

    paginaActualCasilleros = nuevaPagina;
    mostrarCasillerosEnTabla();
}


//====================================================
// FUNCIÓN PARA CONFIRMAR LA LIBERACIÓN DE CASILLERO
//====================================================

function confirmarLiberarCasillero(idEmpleado, numCasillero, nombreEmpleado) {

    Swal.fire({
        title: '¿Liberar casillero?',
        html: `¿Está seguro de remover a <b>${nombreEmpleado}</b> del casillero <b>#${numCasillero}</b>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-check-lg me-1"></i> Sí, liberar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            liberarCasillero(idEmpleado, numCasillero);
        }
    });
}


//====================================================
// FUNCIÓN PARA LIBERAR EL CASILLERO
//====================================================

function liberarCasillero(idEmpleado, numCasillero) {

    let urlCasilleros = window.location.pathname.includes('/registro/') || window.location.href.includes('/registro/')
        ? "../../empleados/php/infoCasillerosDisponibles.php"
        : "../php/infoCasillerosDisponibles.php";

    $.ajax({
        type: "POST",
        url: urlCasilleros,
        data: {
            accion: "liberarCasillero",
            id_empleado: idEmpleado,
            num_casillero: numCasillero
        },
        dataType: "json",

        success: function (response) {

            if (response.success) {

                Swal.fire({
                    icon: 'success',
                    title: 'Casillero liberado',
                    text: response.mensaje || 'El casillero ha sido liberado correctamente.',
                    timer: 1800,
                    showConfirmButton: false
                });

                // Si el empleado que se está editando en el formulario principal era el que ocupaba este casillero, limpiar el input
                var idEmpleadoEditando = $('#formEditarEmpleado').length ? $('#formEditarEmpleado').data('id_empleado') : $('#registroIdEmpleado').val();
                if (idEmpleadoEditando && parseInt(idEmpleadoEditando) === parseInt(idEmpleado)) {
                    if ($('#editarCasillero').length) $('#editarCasillero').val('');
                    if ($('#registroCasillero').length) $('#registroCasillero').val('');
                }

                // Recargar casilleros manteniendo la página actual
                obtenerCasillerosDisponibles(true);

            } else {

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.mensaje || 'No se pudo liberar el casillero.'
                });

            }
        },

        error: function (xhr, status, error) {
            console.error("Error AJAX al liberar el casillero:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error del servidor',
                text: 'Ocurrió un error al intentar liberar el casillero.'
            });
        }
    });
}


//====================================================
// FUNCIÓN PARA SELECCIONAR UN CASILLERO Y ASIGNARLO
//====================================================

function seleccionarCasillero(numCasillero) {

    // Establecer el valor en el input del modal de información personal (editar) o del formulario de registro
    if ($('#editarCasillero').length) {
        $('#editarCasillero').val(numCasillero).trigger('change');
        $('#editarCasillero').focus();
    }

    if ($('#registroCasillero').length) {
        $('#registroCasillero').val(numCasillero).trigger('change');
        $('#registroCasillero').focus();
    }

    // Cerrar el modal de casilleros disponibles
    $('#modalCasillerosDisponibles').modal('hide');
}
