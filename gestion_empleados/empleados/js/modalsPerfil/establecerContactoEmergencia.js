//====================================================
// FUNCIÓN PARA ABRIR EL MODAL DE CONTACTO DE EMERGENCIA
// FUNCIÓN LLAMADA DESDE EL SWITCH DE ACCIONES 
//====================================================

function abrirModalContactoEmergencia(idEmpleado) {
    limpiarContactoEmergencia();

    // 2. Guardar el ID del empleado en el formulario
    $('#formContactoEmergencia').data('id_empleado', idEmpleado);

    // Obtener y mostrar el nombre del empleado en el pie del modal
    const emp = (typeof empleados !== 'undefined' && Array.isArray(empleados))
        ? empleados.find(e => e.id_empleado == idEmpleado)
        : null;
    const nombreCompleto = emp
        ? `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.replace(/\s+/g, ' ').trim()
        : '---';
    $('#nombreEmpleadoModalContactoEmergencia').text(nombreCompleto);

    obtenerContactoEmergencia(idEmpleado);

    guardarContactoEmergencia();

    // 3. Aplicar permisos de edición
    aplicarPermisosContactoEmergencia();

    // 4. Abrir el modal
    $('#modalContactoEmergencia').modal('show');
}


//=============================================================
// FUNCIÓN PARA OBTENER EL CONTACTO DE EMERGENCIA DEL EMPLEADO
//=============================================================

function obtenerContactoEmergencia(id_empleado) {

    // consultar el contacto al servidor
    $.ajax({
        type: "POST",
        url: "../php/infoContactoEmergencia.php",
        data: {
            accion: "obtenerContactoEmergencia",
            id_empleado: id_empleado
        },
        dataType: "json",

        success: function (response) {

            // verificar que la consulta fue correcta
            if (!response.success) {

                console.error(
                    "Error:",
                    response.mensaje
                );

                return;
            }

            // verificar si existe un contacto
            if (!response.existe) {

                // limpiar el formulario
                limpiarContactoEmergencia();

                return;
            }

            // obtener los datos del contacto
            var contacto = response.contacto;

            // establecer los datos en el modal
            establecerContactoEmergencia(contacto);
        },

        error: function (xhr, status, error) {

            // mostrar informacion del error ajax
            console.error(
                "Error AJAX al obtener el contacto de emergencia."
            );

            console.error("status:", status);
            console.error("error:", error);
            console.error(
                "respuesta servidor:",
                xhr.responseText
            );
        }
    });
}


//============================================================
// FUNCIÓN PARA ESTABLECER LOS DATOS DEL CONTACTO EN EL MODAL
//============================================================

function establecerContactoEmergencia(contacto) {

    // establecer el nombre
    $('#editarContactoNombre').val(
        contacto.nombre || ''
    );

    // establecer el apellido paterno
    $('#editarContactoApellidoPaterno').val(
        contacto.ap_paterno || ''
    );

    // establecer el apellido materno
    $('#editarContactoApellidoMaterno').val(
        contacto.ap_materno || ''
    );

    // establecer el telefono
    $('#editarContactoTelefono').val(
        contacto.telefono || ''
    );

    // establecer el parentesco
    $('#editarContactoParentesco').val(
        contacto.parentesco || ''
    );

    // establecer el domicilio
    $('#editarContactoDomicilio').val(
        contacto.domicilio || ''
    );

    // guardar el id del contacto
    $('#formContactoEmergencia').data(
        'id_contacto',
        contacto.id_contacto
    );
}

//============================================================
// FUNCIÓN PARA LIMPIAR LOS DATOS DEL CONTACTO DE EMERGENCIA
//============================================================

function limpiarContactoEmergencia() {

    // limpiar el nombre
    $('#editarContactoNombre').val('');

    // limpiar el apellido paterno
    $('#editarContactoApellidoPaterno').val('');

    // limpiar el apellido materno
    $('#editarContactoApellidoMaterno').val('');

    // limpiar el telefono
    $('#editarContactoTelefono').val('');

    // limpiar el parentesco
    $('#editarContactoParentesco').val('');

    // limpiar el domicilio
    $('#editarContactoDomicilio').val('');

    // eliminar el id del contacto
    $('#formContactoEmergencia').removeData(
        'id_contacto'
    );
}


//====================================================
// guardar o actualizar el contacto de emergencia
//====================================================

function guardarContactoEmergencia() {
    $('#btnGuardarContactoEmergencia').off('click').on('click', function () {

        // obtener el id del empleado
        var id_empleado = $('#formContactoEmergencia').data('id_empleado');

        // obtener los datos del contacto
        var nombre = $('#editarContactoNombre').val().trim();
        var ap_paterno = $('#editarContactoApellidoPaterno').val().trim();
        var ap_materno = $('#editarContactoApellidoMaterno').val().trim();
        var telefono = $('#editarContactoTelefono').val().trim();
        var domicilio = $('#editarContactoDomicilio').val().trim();
        var parentesco = $('#editarContactoParentesco').val();


        // validar el id del empleado
        if (!id_empleado) {

            console.error(
                "No se encontro el id del empleado."
            );

            return;
        }

        // validar el nombre
        if (!nombre) {

            console.error(
                "El nombre del contacto es obligatorio."
            );

            return;
        }

        // enviar los datos al servidor
        $.ajax({
            type: "POST",
            url: "../php/infoContactoEmergencia.php",

            data: {
                accion: "guardarContactoEmergencia",

                id_empleado: id_empleado,
                nombre: nombre,
                ap_paterno: ap_paterno,
                ap_materno: ap_materno,
                telefono: telefono,
                domicilio: domicilio,
                parentesco: parentesco
            },

            dataType: "json",

            success: function (response) {      

                // verificar si la operacion fue correcta
                if (response.success) {

                  
                    // cerrar el modal
                    $('#modalContactoEmergencia').modal('hide');

                } else {

                    console.error(
                        "Error:",
                        response.mensaje
                    );
                }
            },

            error: function (xhr, status, error) {

                // mostrar informacion del error
                console.error(
                    "Error AJAX al guardar el contacto."
                );

                console.error(
                    "status:",
                    status
                );

                console.error(
                    "error:",
                    error
                );

                console.error(
                    "respuesta servidor:",
                    xhr.responseText
                );
            }
        });
    });
}