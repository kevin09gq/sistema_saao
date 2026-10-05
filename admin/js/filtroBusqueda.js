$(document).ready(function () {
    // Inicializar los eventos de los componentes de filtro
    aplicarFiltrosComponentes();
});

//====================================================
// APLICAR FILTROS A LOS COMPONENTES DE BÚSQUEDA
//====================================================

function aplicarFiltrosComponentes() {

    // Filtrar mientras se escribe en el buscador
    $('#inputBuscarUsuario').on('input', function () {
        aplicarFiltros();
    });

    // Filtrar cuando cambie el select de rol
    $('#selectRolUsuario').change(function () {
        rolSeleccionado = $(this).val();
        aplicarFiltros();
    });

    // Botón / Pestaña Todos los estados
    $('#tabTodos').click(function () {
        $('.status-tab').removeClass('active');
        $(this).addClass('active');
        statusSeleccionado = "todos";
        aplicarFiltros();
    });

    // Botón / Pestaña Activos
    $('#tabActivos').click(function () {
        $('.status-tab').removeClass('active');
        $(this).addClass('active');
        statusSeleccionado = "activos";
        aplicarFiltros();
    });

    // Botón / Pestaña Inactivos
    $('#tabInactivos').click(function () {
        $('.status-tab').removeClass('active');
        $(this).addClass('active');
        statusSeleccionado = "inactivos";
        aplicarFiltros();
    });
}

//====================================================
// FUNCIÓN PARA APLICAR TODOS LOS FILTROS
//====================================================

function aplicarFiltros(mantenerPagina = false) {

    // Si aún no se han cargado los usuarios desde la base de datos, salir
    if (!Array.isArray(usuarios)) {
        return;
    }

    // Obtener valores de los filtros
    const textoBusqueda = ($('#inputBuscarUsuario').val() || "").toLowerCase().trim();
    const rolActual = ($('#selectRolUsuario').val() || "todos");

    // Filtrar la lista de usuarios
    usuariosFiltrados = usuarios.filter(function (usuario) {

        // 1. FILTRO DE BÚSQUEDA (Nombre, Correo o Rol)
        const nombre = (usuario.nombre_admin ?? '').toLowerCase();
        const correo = (usuario.correo ?? '').toLowerCase();
        const nombreRol = (usuario.nombre_rol ?? '').toLowerCase();

        const coincideBusqueda =
            textoBusqueda === "" ||
            nombre.includes(textoBusqueda) ||
            correo.includes(textoBusqueda) ||
            nombreRol.includes(textoBusqueda);

        // 2. FILTRO POR ROL
        const coincideRol =
            rolActual === "todos" ||
            rolActual === "" ||
            String(usuario.id_rol) === String(rolActual);

        // 3. FILTRO POR ESTADO (STATUS)
        let coincideStatus = true;

        if (statusSeleccionado === "activos") {
            coincideStatus = usuario.id_status == 1;
        } else if (statusSeleccionado === "inactivos") {
            coincideStatus = usuario.id_status != 1;
        }

        // El usuario debe cumplir con todos los criterios activos
        return coincideBusqueda && coincideRol && coincideStatus;
    });

    // Manejo de la página actual
    if (!mantenerPagina) {
        paginaActual = 1;
    } else {
        const totalPaginas = Math.ceil(usuariosFiltrados.length / registrosPorPagina) || 1;
        if (paginaActual > totalPaginas) {
            paginaActual = totalPaginas;
        }
    }

    // Renderizar los usuarios en la tabla
    mostrarUsuarios();
}
