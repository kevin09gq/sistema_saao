//====================================================
// PANEL ADMINISTRATIVO - GESTIÓN DE USUARIOS Y PERMISOS
//====================================================

// Arreglo global de usuarios
let usuariosSistema = [];


$(document).ready(function () {

    // 1. Cargar la lista inicial de usuarios y estadísticas
    obtenerUsuarios();

 
});


//====================================================
// FUNCIÓN PARA OBTENER TODOS LOS USUARIOS
//====================================================

function obtenerUsuarios() {

    const tbody = $('#tbodyUsuarios');
    tbody.html(`
        <tr>
            <td colspan="5" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                Cargando usuarios...
            </td>
        </tr>
    `);

    $.ajax({
        type: "POST",
        url: "../php/adminUsuarios.php",
        data: { accion: "obtenerUsuarios" },
        dataType: "json",
        success: function (res) {
            if (res.success) {
                usuariosSistema = res.usuarios;

                // Actualizar métricas
                $('#statTotalUsuarios').text(res.estadisticas.total);
                $('#statTotalAdmins').text(res.estadisticas.admins);
                $('#statTotalEstandar').text(res.estadisticas.estandar);
                $('#statTotalActivos').text(res.estadisticas.activos);

                renderizarTablaUsuarios(usuariosSistema);
            } else {
                mostrarAlerta('error', 'Error', res.mensaje);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error AJAX al obtener usuarios:", error, xhr.responseText);
            tbody.html(`
                <tr>
                    <td colspan="5" class="text-center text-danger py-4">
                        <i class="bi bi-exclamation-triangle me-2"></i> Error al conectar con el servidor.
                    </td>
                </tr>
            `);
        }
    });
}


//====================================================
// FUNCIÓN PARA RENDERIZAR LA TABLA DE USUARIOS
//====================================================
function renderizarTablaUsuarios(lista) {

    const tbody = $('#tbodyUsuarios');
    tbody.empty();

    if (!lista || lista.length === 0) {
        tbody.html(`
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-people me-2"></i> No se encontraron usuarios registrados.
                </td>
            </tr>
        `);
        return;
    }

    lista.forEach(function (user) {

        // Badge de rol
        const esAdmin = (user.id_rol == 1);
        const badgeRol = esAdmin
            ? `<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><i class="bi bi-shield-fill-check me-1"></i> Administrador</span>`
            : `<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1"><i class="bi bi-person-fill me-1"></i> Estándar</span>`;

        // Badge de estatus
        const esActivo = (user.id_status == 1);
        const badgeStatus = esActivo
            ? `<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i> Activo</span>`
            : `<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i> Inactivo</span>`;

        const tr = `
            <tr>
                <td class="fw-bold text-secondary">#${user.id_admin}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle me-2 ${esAdmin ? 'bg-success text-white' : 'bg-primary text-white'}">
                            ${user.nombre_admin.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="fw-semibold text-dark">${user.nombre_admin}</div>
                            <small class="text-muted"><i class="bi bi-envelope me-1"></i>${user.correo}</small>
                        </div>
                    </div>
                </td>
                <td>${badgeRol}</td>
                <td class="text-center">${badgeStatus}</td>
                <td class="text-center">
                    <div class="dropdown">
                        <button
                            type="button"
                            class="btn btn-sm btn-light border"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            data-id="${user.id_admin}">
                            ⋮
                        </button>

                        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2" onclick="abrirModalEditar(${user.id_admin})">
                                    <i class="bi bi-pencil-square text-primary"></i>
                                    <span>Editar datos</span>
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2 ${esAdmin ? 'text-muted' : ''}" onclick="abrirModalMudulos()">
                                    <i class="bi bi-shield-lock-fill ${esAdmin ? 'text-muted' : 'text-success'}"></i>
                                    <span>Gestionar Permisos</span>
                                </a>
                            </li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2 ${esActivo ? 'text-danger' : 'text-success'}" onclick="cambiarEstadoUsuario(${user.id_admin}, ${user.id_status}, '${user.nombre_admin}')">
                                    <i class="bi ${esActivo ? 'bi-person-x-fill' : 'bi-person-check-fill'}"></i>
                                    <span>${esActivo ? 'Desactivar usuario' : 'Activar usuario'}</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;

        tbody.append(tr);
    });
}








//====================================================
// FUNCIÓN HELPER DE SWEETALERT
//====================================================
function mostrarAlerta(icono, titulo, texto) {
    Swal.fire({
        icon: icono,
        title: titulo,
        text: texto,
        confirmButtonColor: '#198754'
    });
}
