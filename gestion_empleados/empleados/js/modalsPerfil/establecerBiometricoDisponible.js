//====================================================
// VARIABLES GLOBALES DE BIOMÉTRICOS DISPONIBLES
//====================================================

// Contiene la lista total de biométricos obtenida del servidor
let biometricosLista = [];

// Catálogo de áreas registradas
let areasListaBiometrico = [];

// Contiene los biométricos después de aplicar filtros y búsqueda
let biometricosFiltrados = [];

// Filtros actuales
let filtroAreaBiometrico = 'todas';
let filtroEstadoBiometrico = 'todos';
let textoBusquedaBiometrico = '';

// Variables de paginación
let paginaActualBiometricos = 1;
let registrosPorPaginaBiometricos = 10;


//====================================================
// INICIALIZACIÓN DE EVENTOS
//====================================================

$(document).ready(function () {

    // Botón para abrir el modal desde el formulario de información personal
    $('#btnAbrirBiometricoDisponible').on('click', function () {
        abrirModalBiometricoDisponible();
    });

    // Búsqueda en tiempo real
    $('#inputBuscarBiometrico').on('input keyup', function () {
        textoBusquedaBiometrico = $(this).val().trim().toLowerCase();
        aplicarFiltrosBiometricos(false);
    });

    // Botón para limpiar búsqueda
    $('#btnLimpiarBuscarBiometrico').on('click', function () {
        $('#inputBuscarBiometrico').val('');
        textoBusquedaBiometrico = '';
        aplicarFiltrosBiometricos(false);
    });

    // Filtro por Área
    $('#selectFiltroAreaBiometrico').on('change', function () {
        filtroAreaBiometrico = $(this).val();
        aplicarFiltrosBiometricos(false);
    });

    // Filtro por Estado
    $('#selectFiltroEstadoBiometrico').on('change', function () {
        filtroEstadoBiometrico = $(this).val();
        aplicarFiltrosBiometricos(false);
    });

    // Manejar el foco y scroll al cerrar el modal de biométricos
    $('#modalBiometricoDisponible').on('hidden.bs.modal', function () {
        if ($('#modalEditarEmpleado').is(':visible')) {
            $('body').addClass('modal-open');
        }
    });

});


//====================================================
// FUNCIÓN PARA ABRIR EL MODAL DE BIOMÉTRICOS
//====================================================

function abrirModalBiometricoDisponible() {

    // Resetear filtros y búsqueda al abrir
    textoBusquedaBiometrico = '';
    filtroEstadoBiometrico = 'todos';
    paginaActualBiometricos = 1;

    $('#inputBuscarBiometrico').val('');
    $('#selectFiltroEstadoBiometrico').val('todos');

    // Si hay un área seleccionada en el formulario de edición o registro, preseleccionarla
    var areaEmpleado = $('#editarArea').length ? $('#editarArea').val() : $('#registroArea').val();
    if (areaEmpleado && areaEmpleado !== '1000' && areaEmpleado !== '') {
        filtroAreaBiometrico = areaEmpleado;
    } else {
        filtroAreaBiometrico = 'todas';
    }

    // Mostrar modal
    $('#modalBiometricoDisponible').modal('show');

    // Obtener los biométricos desde el servidor
    obtenerBiometricos();
}


//====================================================
// FUNCIÓN PARA OBTENER LOS BIOMÉTRICOS DEL SERVIDOR
//====================================================

function obtenerBiometricos(mantenerPagina = false) {

    // Mostrar estado de carga si la lista estaba vacía
    if (!biometricosLista || biometricosLista.length === 0) {
        $('#tbodyBiometricosDisponibles').html(`
            <tr>
                <td colspan="3" class="text-center text-muted py-4">
                    <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                    Cargando biométricos...
                </td>
            </tr>
        `);
    }

    let urlBiometricos = window.location.pathname.includes('/registro/') || window.location.href.includes('/registro/')
        ? "../../empleados/php/infoBiometricoDisponible.php"
        : "../php/infoBiometricoDisponible.php";

    $.ajax({
        type: "POST",
        url: urlBiometricos,
        data: {
            accion: "obtenerBiometricos"
        },
        dataType: "json",

        success: function (response) {

            if (!response.success) {
                console.error("Error al obtener biométricos:", response.mensaje);
                $('#tbodyBiometricosDisponibles').html(`
                    <tr>
                        <td colspan="3" class="text-center text-danger py-4">
                            <i class="bi bi-exclamation-triangle me-1"></i>
                            ${response.mensaje || 'Error al cargar los biométricos.'}
                        </td>
                    </tr>
                `);
                return;
            }

            biometricosLista = response.biometricos || [];
            areasListaBiometrico = response.areas || [];

            // Llenar el select de áreas
            llenarSelectAreasBiometrico();

            // Aplicar filtros y renderizar tabla
            aplicarFiltrosBiometricos(mantenerPagina);
        },

        error: function (xhr, status, error) {
            console.error("Error AJAX al obtener biométricos:", error);
            $('#tbodyBiometricosDisponibles').html(`
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
// FUNCIÓN PARA LLENAR EL SELECT DE ÁREAS
//====================================================

function llenarSelectAreasBiometrico() {

    var select = $('#selectFiltroAreaBiometrico');
    var valorActual = filtroAreaBiometrico;

    select.empty();
    select.append('<option value="todas">Todas las áreas</option>');

    areasListaBiometrico.forEach(function (area) {
        select.append(`
            <option value="${area.id_area}">
                ${area.nombre_area}
            </option>
        `);
    });

    select.val(valorActual);
}


//====================================================
// FUNCIÓN PARA APLICAR FILTROS Y BÚSQUEDA
//====================================================

function aplicarFiltrosBiometricos(mantenerPagina = false) {

    biometricosFiltrados = biometricosLista.filter(function (item) {

        // 1. Filtro por Área
        if (filtroAreaBiometrico !== 'todas') {
            var areaIdNum = parseInt(filtroAreaBiometrico);

            var ocupadoEnArea = item.ocupantes && item.ocupantes.some(function (o) {
                return o.id_area === areaIdNum;
            });

            var disponibleEnArea = item.areas_disponibles && item.areas_disponibles.some(function (a) {
                return a.id_area === areaIdNum;
            });

            if (filtroEstadoBiometrico === 'ocupados' && !ocupadoEnArea) {
                return false;
            }
            if (filtroEstadoBiometrico === 'disponibles' && !disponibleEnArea) {
                return false;
            }
            if (filtroEstadoBiometrico === 'todos' && !ocupadoEnArea && !disponibleEnArea) {
                return false;
            }
        } else {
            // Cuando es todas las áreas
            if (filtroEstadoBiometrico === 'ocupados' && (!item.ocupantes || item.ocupantes.length === 0)) {
                return false;
            }
            if (filtroEstadoBiometrico === 'disponibles' && (!item.areas_disponibles || item.areas_disponibles.length === 0)) {
                return false;
            }
        }

        // 2. Filtro por texto de búsqueda (biométrico, nombre, clave, área)
        if (textoBusquedaBiometrico !== '') {

            var bioMatch = (item.biometrico || '').toString().toLowerCase().includes(textoBusquedaBiometrico);

            var empMatch = false;
            if (item.ocupantes && item.ocupantes.length > 0) {
                empMatch = item.ocupantes.some(function (emp) {
                    var nombre = (emp.nombre_completo || '').toLowerCase();
                    var clave = (emp.clave || '').toString().toLowerCase();
                    var area = (emp.nombre_area || '').toLowerCase();
                    return nombre.includes(textoBusquedaBiometrico) || 
                           clave.includes(textoBusquedaBiometrico) ||
                           area.includes(textoBusquedaBiometrico);
                });
            }

            var areaDispMatch = false;
            if (item.areas_disponibles && item.areas_disponibles.length > 0) {
                areaDispMatch = item.areas_disponibles.some(function (area) {
                    return area.nombre_area.toLowerCase().includes(textoBusquedaBiometrico);
                });
            }

            return bioMatch || empMatch || areaDispMatch;
        }

        return true;
    });

    if (!mantenerPagina) {
        paginaActualBiometricos = 1;
    }

    mostrarBiometricosEnTabla();
}


//====================================================
// FUNCIÓN PARA MOSTRAR LOS BIOMÉTRICOS EN LA TABLA
//====================================================

function mostrarBiometricosEnTabla() {

    $('#tbodyBiometricosDisponibles').empty();

    // Si no hay resultados
    if (!biometricosFiltrados || biometricosFiltrados.length === 0) {
        $('#tbodyBiometricosDisponibles').html(`
            <tr>
                <td colspan="3" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                    No se encontraron números de biométrico con los criterios seleccionados.
                </td>
            </tr>
        `);

        $('#infoPaginacionBiometricos').text('Mostrando 0 biométricos');
        $('#paginacionBiometricos').empty();
        return;
    }

    // Calcular paginación
    var totalRegistros = biometricosFiltrados.length;
    var totalPaginas = Math.ceil(totalRegistros / registrosPorPaginaBiometricos);

    if (paginaActualBiometricos > totalPaginas) {
        paginaActualBiometricos = totalPaginas;
    }
    if (paginaActualBiometricos < 1) {
        paginaActualBiometricos = 1;
    }

    var inicio = (paginaActualBiometricos - 1) * registrosPorPaginaBiometricos;
    var fin = inicio + registrosPorPaginaBiometricos;
    var biometricosPagina = biometricosFiltrados.slice(inicio, fin);

    // Obtener el área del empleado que se está editando o registrando
    var areaEmpleadoEditando = $('#editarArea').length ? $('#editarArea').val() : $('#registroArea').val();
    var areaEmpleadoId = (areaEmpleadoEditando && areaEmpleadoEditando !== '1000' && areaEmpleadoEditando !== '') ? parseInt(areaEmpleadoEditando) : null;

    // Obtener información del filtro de área activo
    var esAreaFiltrada = (filtroAreaBiometrico !== 'todas');
    var areaFiltroId = esAreaFiltrada ? parseInt(filtroAreaBiometrico) : null;
    var nombreAreaFiltro = '';
    if (esAreaFiltrada) {
        var areaObj = areasListaBiometrico.find(a => a.id_area === areaFiltroId);
        nombreAreaFiltro = areaObj ? areaObj.nombre_area : '';
    }

    // Renderizar filas
    biometricosPagina.forEach(function (b) {

        var ocupantesHtml = '';
        var puedeSeleccionar = true;
        var tituloDeshabilitado = '';

        if (esAreaFiltrada) {
            // ==========================================
            // MODO VISTA CON ÁREA SELECCIONADA
            // ==========================================
            var empEnArea = b.ocupantes ? b.ocupantes.find(o => o.id_area === areaFiltroId) : null;

            if (empEnArea) {
                // Está ocupado en esta área
                puedeSeleccionar = false;
                tituloDeshabilitado = `Ocupado por ${empEnArea.nombre_completo} en ${nombreAreaFiltro}`;

                ocupantesHtml = `
                    <div class="d-flex align-items-center justify-content-between p-2 rounded bg-light border">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-person-circle fs-5 text-secondary"></i>
                            <div>
                                <div class="fw-semibold text-dark small">${empEnArea.nombre_completo}</div>
                                <div class="text-muted small" style="font-size: 0.75rem;">
                                    Clave: ${empEnArea.clave ? empEnArea.clave : 'S/C'} &bull; <span class="badge bg-light text-primary border">${empEnArea.nombre_area}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="btn btn-outline-danger btn-sm"
                            style="padding: 0.2rem 0.5rem; font-size: 0.78rem;"
                            title="Liberar biométrico de este empleado"
                            onclick="confirmarLiberarBiometrico(${empEnArea.id_empleado}, '${b.biometrico}', '${empEnArea.nombre_completo.replace(/'/g, "\\'")}', '${empEnArea.nombre_area.replace(/'/g, "\\'")}')">
                            <i class="bi bi-person-dash me-1"></i> Liberar
                        </button>
                    </div>
                `;
            } else {
                // Está disponible en esta área
                puedeSeleccionar = true;

                ocupantesHtml = `
                    <div class="d-flex align-items-center gap-2 text-success small py-1">
                        <i class="bi bi-check-circle-fill text-success fs-5"></i>
                        <span>Disponible para asignarse en <b>${nombreAreaFiltro}</b></span>
                    </div>
                `;
            }

        } else {
            // ==========================================
            // MODO VISTA CON TODAS LAS ÁREAS
            // ==========================================
            if (b.ocupantes && b.ocupantes.length > 0) {
                ocupantesHtml = b.ocupantes.map(function (emp) {
                    return `
                        <div class="d-flex align-items-center justify-content-between p-2 mb-1 rounded bg-light border">
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 0.72rem;">
                                    <i class="bi bi-geo-alt me-1"></i>${emp.nombre_area}
                                </span>
                                <span class="fw-semibold text-dark small">${emp.nombre_completo}</span>
                                <span class="text-muted small">(${emp.clave ? emp.clave : 'S/C'})</span>
                            </div>
                            <button
                                type="button"
                                class="btn btn-outline-danger btn-sm"
                                style="padding: 0.15rem 0.45rem; font-size: 0.75rem;"
                                title="Liberar biométrico de este empleado"
                                onclick="confirmarLiberarBiometrico(${emp.id_empleado}, '${b.biometrico}', '${emp.nombre_completo.replace(/'/g, "\\'")}', '${emp.nombre_area.replace(/'/g, "\\'")}')">
                                <i class="bi bi-person-dash me-1"></i> Liberar
                            </button>
                        </div>
                    `;
                }).join('');
            } else {
                ocupantesHtml = `
                    <span class="text-muted fst-italic small">
                        <i class="bi bi-dash-circle me-1"></i> Sin asignaciones (Libre en todas las áreas)
                    </span>
                `;
            }

            // Validar si puede seleccionar en base al área del empleado
            if (areaEmpleadoId) {
                var ocupadoEnAreaEmpleado = b.ocupantes && b.ocupantes.some(o => o.id_area === areaEmpleadoId);
                if (ocupadoEnAreaEmpleado) {
                    puedeSeleccionar = false;
                    tituloDeshabilitado = 'Este biométrico ya está ocupado en el área del empleado';
                }
            } else {
                if (b.total_disponibles === 0) {
                    puedeSeleccionar = false;
                    tituloDeshabilitado = 'Biométrico ocupado en todas las áreas';
                }
            }
        }

        // Botón de acción
        var botonAccion = '';
        if (puedeSeleccionar) {
            botonAccion = `
                <button
                    type="button"
                    class="btn btn-sm btn-success"
                    onclick="seleccionarBiometrico('${b.biometrico}')"
                    title="Asignar este biométrico">
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
                    <i class="bi bi-lock-fill me-1"></i> Ocupado
                </button>
            `;
        }

        $('#tbodyBiometricosDisponibles').append(`
            <tr>
                <td class="text-center">
                    <span class="badge bg-light text-dark border fs-6 px-3 py-2 fw-semibold">
                        <i class="bi bi-fingerprint text-success me-1"></i>
                        ${b.biometrico}
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
    $('#infoPaginacionBiometricos').text(
        `Mostrando ${mostrandoDesde} a ${mostrandoHasta} de ${totalRegistros} biométricos`
    );

    // Generar botones de paginación
    crearPaginacionBiometricos(totalPaginas);
}


//====================================================
// FUNCIÓN PARA GENERAR LA PAGINACIÓN DE BIOMÉTRICOS
//====================================================

function crearPaginacionBiometricos(totalPaginas) {

    $('#paginacionBiometricos').empty();

    if (totalPaginas <= 1) {
        return;
    }

    // Botón Anterior
    $('#paginacionBiometricos').append(`
        <li class="page-item ${paginaActualBiometricos === 1 ? 'disabled' : ''}">
            <button
                type="button"
                class="page-link"
                onclick="cambiarPaginaBiometricos(${paginaActualBiometricos - 1})"
                aria-label="Anterior">
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>
    `);

    // Páginas numéricas
    var inicio = Math.max(1, paginaActualBiometricos - 2);
    var fin = Math.min(totalPaginas, paginaActualBiometricos + 2);

    if (inicio > 1) {
        $('#paginacionBiometricos').append(`
            <li class="page-item">
                <button type="button" class="page-link" onclick="cambiarPaginaBiometricos(1)">1</button>
            </li>
        `);
        if (inicio > 2) {
            $('#paginacionBiometricos').append(`
                <li class="page-item disabled"><span class="page-link">...</span></li>
            `);
        }
    }

    for (var i = inicio; i <= fin; i++) {
        $('#paginacionBiometricos').append(`
            <li class="page-item ${i === paginaActualBiometricos ? 'active' : ''}">
                <button
                    type="button"
                    class="page-link"
                    onclick="cambiarPaginaBiometricos(${i})">
                    ${i}
                </button>
            </li>
        `);
    }

    if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) {
            $('#paginacionBiometricos').append(`
                <li class="page-item disabled"><span class="page-link">...</span></li>
            `);
        }
        $('#paginacionBiometricos').append(`
            <li class="page-item">
                <button type="button" class="page-link" onclick="cambiarPaginaBiometricos(${totalPaginas})">${totalPaginas}</button>
            </li>
        `);
    }

    // Botón Siguiente
    $('#paginacionBiometricos').append(`
        <li class="page-item ${paginaActualBiometricos === totalPaginas ? 'disabled' : ''}">
            <button
                type="button"
                class="page-link"
                onclick="cambiarPaginaBiometricos(${paginaActualBiometricos + 1})"
                aria-label="Siguiente">
                <i class="bi bi-chevron-right"></i>
            </button>
        </li>
    `);
}


//====================================================
// FUNCIÓN PARA CAMBIAR DE PÁGINA EN BIOMÉTRICOS
//====================================================

function cambiarPaginaBiometricos(nuevaPagina) {
    var totalPaginas = Math.ceil(biometricosFiltrados.length / registrosPorPaginaBiometricos);

    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) {
        return;
    }

    paginaActualBiometricos = nuevaPagina;
    mostrarBiometricosEnTabla();
}


//====================================================
// FUNCIÓN PARA CONFIRMAR LA LIBERACIÓN DE BIOMÉTRICO
//====================================================

function confirmarLiberarBiometrico(idEmpleado, numBiometrico, nombreEmpleado, nombreArea) {

    Swal.fire({
        title: '¿Liberar biométrico?',
        html: `¿Está seguro de remover el biométrico <b>#${numBiometrico}</b> a <b>${nombreEmpleado}</b> (Área: <b>${nombreArea}</b>)?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-check-lg me-1"></i> Sí, liberar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            liberarBiometrico(idEmpleado);
        }
    });
}


//====================================================
// FUNCIÓN PARA LIBERAR EL BIOMÉTRICO
//====================================================

function liberarBiometrico(idEmpleado) {

    let urlBiometricos = window.location.pathname.includes('/registro/') || window.location.href.includes('/registro/')
        ? "../../empleados/php/infoBiometricoDisponible.php"
        : "../php/infoBiometricoDisponible.php";

    $.ajax({
        type: "POST",
        url: urlBiometricos,
        data: {
            accion: "liberarBiometrico",
            id_empleado: idEmpleado
        },
        dataType: "json",

        success: function (response) {

            if (response.success) {

                Swal.fire({
                    icon: 'success',
                    title: 'Biométrico liberado',
                    text: response.mensaje || 'El biométrico ha sido liberado correctamente.',
                    timer: 1800,
                    showConfirmButton: false
                });

                // Si el empleado que se está editando en el formulario principal era el liberado, limpiar el input
                var idEmpleadoEditando = $('#formEditarEmpleado').length ? $('#formEditarEmpleado').data('id_empleado') : $('#registroIdEmpleado').val();
                if (idEmpleadoEditando && parseInt(idEmpleadoEditando) === parseInt(idEmpleado)) {
                    if ($('#editarBiometrico').length) $('#editarBiometrico').val('');
                    if ($('#registroBiometrico').length) $('#registroBiometrico').val('');
                }

                // Recargar biométricos manteniendo la página actual
                obtenerBiometricos(true);

            } else {

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.mensaje || 'No se pudo liberar el biométrico.'
                });

            }
        },

        error: function (xhr, status, error) {
            console.error("Error AJAX al liberar biométrico:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error del servidor',
                text: 'Ocurrió un error al intentar liberar el biométrico.'
            });
        }
    });
}


//====================================================
// FUNCIÓN PARA SELECCIONAR UN BIOMÉTRICO Y ASIGNARLO
//====================================================

function seleccionarBiometrico(numBiometrico) {

    // Establecer el valor en el input del modal de información personal (editar) o del formulario de registro
    if ($('#editarBiometrico').length) {
        $('#editarBiometrico').val(numBiometrico).trigger('change');
        $('#editarBiometrico').focus();
    }

    if ($('#registroBiometrico').length) {
        $('#registroBiometrico').val(numBiometrico).trigger('change');
        $('#registroBiometrico').focus();
    }

    // Cerrar el modal de biométricos disponibles
    $('#modalBiometricoDisponible').modal('hide');
}
