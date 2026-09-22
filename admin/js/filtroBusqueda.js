$(document).ready(function () {
    //  Evento para el buscador de usuarios
    $('#inputBuscarUsuario').on('keyup', function () {
        filtrarUsuarios($(this).val());
    });

    //  Evento para el filtro de roles
    $('#filtroRol').on('change', function () {
        filtrarUsuarios($('#inputBuscarUsuario').val());
    });
});

//====================================================
// FUNCIÓN PARA FILTRAR USUARIOS
//====================================================
function filtrarUsuarios(criterio) {
    const texto = (criterio || '').toLowerCase().trim();
    const filtroRol = $('#filtroRol').val();

    const filtrados = usuariosSistema.filter(function (u) {
        const coincideTexto = u.nombre_admin.toLowerCase().includes(texto) || u.correo.toLowerCase().includes(texto);
        const coincideRol = (filtroRol === 'todos') || (u.id_rol.toString() === filtroRol);
        return coincideTexto && coincideRol;
    });

    renderizarTablaUsuarios(filtrados);
}