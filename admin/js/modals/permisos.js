$(document).ready(function () {
    guardarPermisos();
});

//==============================================
// FUNCIÓN PARA ABRIR EL MODAL DE PERMISOS
//==============================================

function abrirModalPermisos(nombre_admin, nombre_rol, correo, id_admin) {

    // muestra el modal de permisos
    $('#modalPermisos').modal('show');

    // almacena el id del usuario en el modal para usarlo al guardar
    $('#modalPermisos').data('id_admin', id_admin);

    // obtiene las iniciales del nombre del usuario y las muestra
    $('#inicialesUsuarioPermisos').text(
        obtenerIniciales(nombre_admin)
    );

    // muestra el nombre completo del usuario
    $('#nombreUsuarioPermisos').text(
        nombre_admin
    );

    // muestra el rol y correo del usuario
    $('#datosUsuarioPermisos').text(
        `${nombre_rol} - ${correo}`
    );

    // obtiene los permisos del usuario desde la base de datos
    obtenerPermisos(id_admin);
}


//==============================================
// FUNCIÓN PARA OBTENER LOS PERMISOS DEL USUARIO
//==============================================

function obtenerPermisos(idAdmin) {

    // hace una petición ajax al servidor para obtener los permisos del usuario
    $.ajax({
        type: "POST",
        url: "../php/adminUsuarios.php",
        data: {
            accion: "obtenerPermisos",
            id_admin: idAdmin
        },
        dataType: "JSON",

        success: function (response) {

            // si la respuesta no fue exitosa, muestra un error
            if (!response.success) {

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.mensaje
                });

                return;
            }

            // llama a la función para mostrar los permisos en el modal
            mostrarPermisos(response.modulos, response.permisos);
        },

        error: function () {

            // si hay un error en la petición, muestra un mensaje de error
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron obtener los permisos."
            });

        }
    });
}


//==============================================
// FUNCIÓN PARA MOSTRAR LOS PERMISOS EN EL MODAL
// DE ACUERDO A LOS MÓDULOS Y PERMISOS OBTENIDOS
//============================================== 

function mostrarPermisos(modulos, permisos) {

    // obtiene el contenedor donde se mostrarán los permisos
    const contenedor = $("#contenedorPermisos");

    // limpia el contenedor antes de agregar nuevos elementos
    contenedor.empty();

    // si no hay módulos, muestra un mensaje
    if (modulos.length === 0) {

        contenedor.html(`
            <div class="text-center text-muted py-4">
                No hay módulos registrados.
            </div>
        `);

        return;
    }

    // recorre cada módulo para crear su tarjeta en el modal
    modulos.forEach(modulo => {

        // filtra los permisos que pertenecen a este módulo
        const permisosModulo = permisos.filter(
            permiso => permiso.id_modulo == modulo.id_modulo
        );

        // variable para acumular el html de los permisos
        let permisosHTML = "";

        // recorre cada permiso del módulo
        permisosModulo.forEach(permiso => {

            // determina si el permiso está asignado para marcar el checkbox
            const activo = permiso.asignado == 1
                ? "checked"
                : "";

            // crea el html para cada permiso con su checkbox
            permisosHTML += `
                <div class="col-md-6">

                    <div class="form-check">

                        <input
                            class="form-check-input permiso-checkbox"
                            type="checkbox"
                            value="${permiso.id_permiso}"
                            data-modulo="${modulo.id_modulo}"
                            ${activo}>

                        <label class="form-check-label">

                            <span class="fw-semibold">
                                ${permiso.nombre_permiso}
                            </span>

                            <small class="d-block text-muted">
                                ${permiso.descripcion ?? ""}
                            </small>

                        </label>

                    </div>

                </div>
            `;
        });

        // agrega la tarjeta del módulo con sus permisos al contenedor
        contenedor.append(`
            <div class="card border-0 mb-4">

                <div class="card-header bg-white py-3">

                    <div class="d-flex align-items-center justify-content-between">

                        <h6 class="mb-0 fw-semibold text-success">
                            <i class="bi bi-grid me-2"></i>
                            ${modulo.nombre_modulo}
                        </h6>

                        <div class="form-check form-switch">

                            <input
                                class="form-check-input toggle-modulo"
                                type="checkbox"
                                data-modulo="${modulo.id_modulo}">

                            <label class="form-check-label small text-muted">
                                Activar todo
                            </label>

                        </div>

                    </div>

                </div>

                <div class="card-body">

                    <div class="row g-3">

                        ${permisosHTML}

                    </div>

                </div>

            </div>
        `);
    });

    activarDesactivarPermisosModulo();
}


//==============================================
// FUNCIÓN PARA GUARDAR LOS PERMISOS DEL USUARIO
//==============================================

function guardarPermisos() {
    $("#btnGuardarPermisos").click(function (e) {
        e.preventDefault();


        // obtiene el id del usuario almacenado en el modal
        const idAdmin = $('#modalPermisos').data('id_admin');

        // arreglo donde se almacenarán los permisos seleccionados
        const permisos = [];

        // recorre todos los checkbox de permisos seleccionados
        $('.permiso-checkbox:checked').each(function () {

            permisos.push($(this).val());

        });

        // hace una petición ajax para guardar los permisos
        $.ajax({
            type: "POST",
            url: "../php/adminUsuarios.php",
            data: {
                accion: "guardarPermisos",
                id_admin: idAdmin,
                permisos: permisos
            },
            dataType: "JSON",

            success: function (response) {

                // si el guardado no fue exitoso, muestra el error
                if (!response.success) {

                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: response.mensaje
                    });

                    return;
                }

                // muestra mensaje de confirmación
                Swal.fire({
                    icon: "success",
                    title: "Permisos guardados",
                    text: "Los permisos del usuario se actualizaron correctamente.",
                    confirmButtonText: "Aceptar"
                }).then(() => {

                    // cierra el modal después de guardar
                    $('#modalPermisos').modal('hide');

                });
            },

            error: function () {

                // muestra un error si no se pudo realizar la petición
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudieron guardar los permisos."
                });

            }
        });
    });
}


//==============================================
// FUNCIÓN PARA ACTIVAR/DESACTIVAR TODOS LOS
// PERMISOS DE UN MÓDULO
//==============================================

function activarDesactivarPermisosModulo() {

    // Detecta cuando cambia cualquiera de los switches
    $(".toggle-modulo").on("change", function () {

        // Obtiene el id del módulo del switch
        const idModulo = $(this).data("modulo");

        // Obtiene si el switch está activado
        const activar = $(this).is(":checked");

        // Marca o desmarca los permisos de este módulo
        $(`.permiso-checkbox[data-modulo="${idModulo}"]`)
            .prop("checked", activar);

    });
}
