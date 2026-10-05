//==============================================
// VARIABLES GLOBALES DE USUARIOS Y PAGINACIÓN
//==============================================

// Almacena todos los usuarios obtenidos del servidor
let usuarios = [];

// Almacena los usuarios después de aplicar los filtros de búsqueda
let usuariosFiltrados = [];

// Variables de paginación
let paginaActual = 1;
let registrosPorPagina = 5;

// Variables de filtros
let statusSeleccionado = "todos"; // "todos", "activos", "inactivos"
let rolSeleccionado = "todos";    // "todos", "1", "3", etc.


$(document).ready(function () {
    obtenerUsuarios();
});


//==============================================
// OBTENER USUARIOS
//==============================================

function obtenerUsuarios(mantenerPagina = false) {

    $.ajax({
        type: "POST",
        url: "../php/adminUsuarios.php",
        data: {
            accion: "obtenerUsuarios"
        },
        dataType: "JSON",

        success: function (response) {

            if (!response.success) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.mensaje
                });

                return;
            }

            // Guardar todos los usuarios
            usuarios = response.usuarios || [];

            // Si la función de filtros está disponible, coordinar
            if (typeof aplicarFiltros === "function") {
                aplicarFiltros(mantenerPagina);
            } else {
                usuariosFiltrados = [...usuarios];
                mostrarUsuarios();
            }
        },

        error: function () {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron obtener los usuarios."
            });
        }
    });
}


//==============================================
// MOSTRAR USUARIOS EN LA TABLA
//==============================================

function mostrarUsuarios() {

    const tbody = $("#tbodyUsuarios");
    tbody.empty();

    if (usuariosFiltrados.length === 0) {

        tbody.html(`
            <tr>
                <td colspan="4" class="text-center text-muted py-5">
                    <i class="bi bi-search fs-3 d-block mb-2 text-secondary"></i>
                    No se encontraron usuarios con los filtros aplicados.
                </td>
            </tr>
        `);

        crearPaginacion();
        return;
    }

    // Calcular inicio y fin para la página actual
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const usuariosPagina = usuariosFiltrados.slice(inicio, fin);

    usuariosPagina.forEach(usuario => {

        const iniciales = obtenerIniciales(usuario.nombre_admin);
        const estado = obtenerEstadoUsuario(usuario);

        tbody.append(`
            <tr>

                <td>
                    <div class="d-flex align-items-center gap-3">

                        <div class="avatar-iniciales">
                            ${iniciales}
                        </div>

                        <div>
                            <span class="fw-semibold">
                                ${usuario.nombre_admin}
                            </span>

                            <small class="text-secondary d-block">
                                ${usuario.nombre_rol}
                            </small>
                        </div>

                    </div>
                </td>

                <td>
                    <span class="text-muted">
                        ${usuario.correo}
                    </span>
                </td>

                <td class="text-center">
                    ${estado}
                </td>

                <td class="text-center">

                    <div class="dropdown">

                        <button
                            type="button"
                            class="btn btn-light"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">

                            <i class="bi bi-three-dots-vertical"></i>

                        </button>

                        <ul class="dropdown-menu dropdown-menu-end shadow-sm">

                            <!-- EDITAR -->
                            <li>
                                <button
                                    type="button"
                                    class="dropdown-item d-flex align-items-center gap-2"
                                    onclick="abrirModalEditarInformacion('${usuario.nombre_admin}', '${usuario.id_rol}', '${usuario.correo}', ${usuario.id_admin})">

                                    <i class="bi bi-pencil text-success"></i>
                                    Editar información

                                </button>
                            </li>

                            <!-- PERMISOS -->
                            <li>
                                <button
                                    type="button"
                                    class="dropdown-item d-flex align-items-center gap-2"
                                    onclick="abrirModalPermisos('${usuario.nombre_admin}', '${usuario.nombre_rol}', '${usuario.correo}', ${usuario.id_admin})">

                                    <i class="bi bi-shield-check text-success"></i>
                                    Permisos

                                </button>
                            </li>

                            <li>
                                <hr class="dropdown-divider">
                            </li>

                            <!-- DAR DE BAJA / REACTIVAR -->
                            <li>
                                ${usuario.id_status == 1 ? `
                                    <button
                                        type="button" 
                                        class="dropdown-item d-flex align-items-center gap-2 text-warning"
                                        onclick="darBajaAltaUsuario('${usuario.id_admin}', '${usuario.id_status}', '${usuario.id_rol}')">
                                        <i class="bi bi-person-slash"></i>
                                        Dar de baja
                                    </button>
                                ` : `
                                    <button
                                        type="button" 
                                        class="dropdown-item d-flex align-items-center gap-2 text-success"
                                        onclick="darBajaAltaUsuario('${usuario.id_admin}', '${usuario.id_status}', '${usuario.id_rol}')">
                                        <i class="bi bi-person-check"></i>
                                        Reactivar usuario
                                    </button>
                                `}
                            </li>
                            

                            <!-- ELIMINAR -->
                            <li>
                                <button
                                    type="button"
                                    class="dropdown-item d-flex align-items-center gap-2 text-danger"
                                    onclick="eliminarUsuario('${usuario.id_admin}', '${usuario.id_rol}')">

                                    <i class="bi bi-trash"></i>
                                    Eliminar usuario
                                </button>
                            </li>

                        </ul>

                    </div>

                </td>

            </tr>
        `);
    });

    crearPaginacion();
}


//==============================================
// FUNCIÓN PARA CREAR LA PAGINACIÓN
//==============================================

function crearPaginacion() {

    const $paginacion = $('#paginacionUsuarios');

    $paginacion.empty();

    const totalRegistros = usuariosFiltrados.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina) || 1;

    if (totalRegistros === 0) {
        return;
    }

    // Botón Anterior
    $paginacion.append(`
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <button
                type="button"
                class="page-link"
                onclick="cambiarPagina(${paginaActual - 1})"
                ${paginaActual === 1 ? 'tabindex="-1" aria-disabled="true"' : ''}>
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>
    `);

    // Generar números de página
    if (totalPaginas <= 7) {

        for (let p = 1; p <= totalPaginas; p++) {
            agregarBotonPagina(p);
        }

    } else {

        agregarBotonPagina(1);

        let pInicio = paginaActual - 1;
        let pFin = paginaActual + 1;

        if (paginaActual <= 3) {
            pInicio = 2;
            pFin = 4;
        }

        if (paginaActual >= totalPaginas - 2) {
            pInicio = totalPaginas - 3;
            pFin = totalPaginas - 1;
        }

        if (pInicio > 2) {
            $paginacion.append(`
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `);
        }

        for (let p = pInicio; p <= pFin; p++) {
            agregarBotonPagina(p);
        }

        if (pFin < totalPaginas - 1) {
            $paginacion.append(`
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `);
        }

        agregarBotonPagina(totalPaginas);
    }

    // Botón Siguiente
    $paginacion.append(`
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <button
                type="button"
                class="page-link"
                onclick="cambiarPagina(${paginaActual + 1})"
                ${paginaActual === totalPaginas ? 'tabindex="-1" aria-disabled="true"' : ''}>
                <i class="bi bi-chevron-right"></i>
            </button>
        </li>
    `);
}

function agregarBotonPagina(numPagina) {
    const esActiva = numPagina === paginaActual;
    $('#paginacionUsuarios').append(`
        <li class="page-item ${esActiva ? 'active' : ''}">
            <button
                type="button"
                class="page-link"
                onclick="cambiarPagina(${numPagina})">
                ${numPagina}
            </button>
        </li>
    `);
}

function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(usuariosFiltrados.length / registrosPorPagina) || 1;
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

    paginaActual = nuevaPagina;
    mostrarUsuarios();
}


//==============================================
// OBTENER INICIALES DEL USUARIO
//==============================================

function obtenerIniciales(nombre) {

    const palabras = (nombre || '').trim().split(/\s+/);

    if (palabras.length === 1) {
        return palabras[0].substring(0, 2).toUpperCase();
    }

    return (
        palabras[0].charAt(0) +
        palabras[1].charAt(0)
    ).toUpperCase();
}


//==============================================
// MOSTRAR ESTADO DEL USUARIO
//==============================================

function obtenerEstadoUsuario(usuario) {

    if (usuario.id_status == 1) {

        return `
            <span class="badge bg-success badge-status status-activo">
                ${usuario.nombre_status}
            </span>
        `;
    }

    return `
        <span class="badge bg-secondary badge-status status-inactivo">
            ${usuario.nombre_status}
        </span>
    `;
}
