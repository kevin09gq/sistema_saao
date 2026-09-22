$(document).ready(function () {
    obtenerInformacionEmpleado();

    guardarContactoEmergencia();

    continuarBeneficiarios();

    finalizarRegistro();

    $('#stepIndicator1').removeClass('btn-outline-secondary').addClass('btn-success active');
    $('#stepIndicator2').removeClass('btn-success active').addClass('btn-outline-secondary');
    $('#stepIndicator3').removeClass('btn-success active').addClass('btn-outline-secondary');

});

//===============================================================
// FUNCIÓN PARA OBTENER LA INFORMACIÓN DEL EMPLEADO Y VALIDARLA
//===============================================================

function obtenerInformacionEmpleado() {
    $("#btnInfoEmpleado").click(function (e) {
        e.preventDefault();

        var empleado = obtenerInfoPersonal();

        // Validar datos básicos obligatorios
        if (!empleado.nombre || !empleado.ap_paterno || !empleado.ap_materno) {
            mostrarAlerta("error", "Datos incompletos", "Por favor ingresa el nombre y los apellidos del empleado.");
            return;
        }

        if (!empleado.sexo) {
            mostrarAlerta("warning", "Campo obligatorio", "Por favor selecciona el sexo del empleado.");
            $('#registroSexo').focus();
            return;
        }

        // Iniciar el proceso de validación
        validarClave(empleado);

    });
}

//===============================================================
// FUNCIÓN PARA OBTENER LA INFORMACIÓN PERSONAL DEL EMPLEADO
// ALMACENADA EN EL OBJETO EMPLEADO, PARA ENVIARLA AL SERVIDOR
//===============================================================

function obtenerInfoPersonal() {


    var empleado = {

        // DATOS PERSONALES

        clave: $('#registroClave').val().trim(),

        nombre: $('#registroNombre').val().trim().toUpperCase(),

        ap_paterno: $('#registroApellidoPaterno').val().trim().toUpperCase(),

        ap_materno: $('#registroApellidoMaterno').val().trim().toUpperCase(),

        imss: $('#registroImss').val().trim(),

        curp: $('#registroCurp').val().trim().toUpperCase(),

        rfc: $('#registroRfc').val().trim().toUpperCase(),

        domicilio: $('#registroDomicilio').val().trim(),

        sexo: $('#registroSexo').val(),

        grupo_sanguineo: $('#registroGrupoSanguineo').val().trim(),

        fecha_nacimiento: $('#registroFechaNacimiento').val(),

        estado_civil: $('#registroEstadoCivil').val(),


        // DATOS DE CONTACTO  

        telefono: $('#registroTelefono').val().trim(),

        enfermedades_alergias: $('#registroEnfermedades').val().trim(),



        // DATOS LABORALES

        numero_casillero: $('#registroCasillero').val().trim(),

        id_biometrico: $('#registroBiometrico').val().trim(),

        id_empresa: $('#registroEmpresa').val(),

        id_area: $('#registroArea').val(),

        id_departamento: $('#registroDepartamento').val(),

        id_puestoEspecial: $('#registroPuesto').val(),


        // DATOS SALARIALES

        salario_semanal: $('#registroSalarioSemanal').val(),

        salario_diario: $('#registroSalarioDiario').val()

    };

    return empleado;

}

//=============================================
// FUNCIÓN PARA VALIDAR QUE LA CLAVE NO EXISTA
// EN LA MISMA EMPRESA
//=============================================

function validarClave(empleado) {

    // Si no hay clave, continuar con la validación del nombre
    if (!empleado.clave) {
        validarNombre(empleado);
        return;
    }

    $.ajax({
        type: "POST",
        url: "../../empleados/php/infoEmpleado.php",
        data: {
            accion: "validarClave",
            clave: empleado.clave,
            id_empresa: empleado.id_empresa,
            id_empleado: "" // Vacío para registro nuevo (sin ID aún)
        },
        dataType: "json",
        success: function (response) {
            if (response.success) {

                // La clave ya existe en la misma empresa
                if (response.existe) {

                    mostrarAlerta("error", "Clave en uso", "La clave ya existe en la misma empresa. Por favor, elige otra clave.");
                    return;

                } else {
                    // La clave es única en la misma empresa, ahora validar el nombre completo
                    validarNombre(empleado);

                }

            } else {
                console.error("Error al validar la clave.");
            }
        }
    });

}

//===========================================================
// FUNCIÓN PARA VALIDAR EL NOMBRE Y APELLIDOS DEL EMPLEADO
//===========================================================

function validarNombre(empleado) {

    // Validar que el nombre y los apellidos no estén vacíos
    if (!empleado.nombre || !empleado.ap_paterno || !empleado.ap_materno) {
        mostrarAlerta("error", "Datos incompletos", "Nombre o apellidos incompletos. No se puede validar el nombre completo.");
        return;
    }

    $.ajax({
        type: "POST",
        url: "../../empleados/php/infoEmpleado.php",
        data: {
            accion: "validarNombre",
            nombre: empleado.nombre,
            ap_paterno: empleado.ap_paterno,
            ap_materno: empleado.ap_materno,
            id_empleado: "" // Vacío para registro nuevo
        },
        dataType: "json",

        success: function (response) {

            if (response.success) {

                if (response.existe) {

                    mostrarAlerta("error", "Empleado existente", "El empleado ya existe en la base de datos.");

                } else {

                    // El nombre completo es único, continuar con validación de casillero
                    validarCasillero(empleado);

                }

            } else {

                console.error(
                    "Error al validar el nombre:",
                    response.mensaje
                );
            }
        },

        error: function (xhr, status, error) {

            console.error("Error AJAX al validar el nombre.");
            console.error("status:", status);
            console.error("error:", error);
            console.error("respuesta servidor:", xhr.responseText);

        }
    });
}

//===========================================================
// FUNCIÓN PARA VALIDAR EL CASILLERO DEL EMPLEADO
//===========================================================

function validarCasillero(empleado) {

    // si no hay casillero asignado, continuar con la validación del biométrico
    if (!empleado.numero_casillero) {
        validarBiometrico(empleado);
        return;
    }

    $.ajax({
        type: "POST",
        url: "../../empleados/php/infoEmpleado.php",
        data: {
            accion: "validarCasillero",
            numero_casillero: empleado.numero_casillero,
            id_empleado: "" // Vacío para registro nuevo
        },
        dataType: "json",

        success: function (response) {

            if (response.success) {

                if (response.lleno) {

                    mostrarAlerta("error", "Casillero lleno", "El casillero ya tiene 2 empleados asignados. Por favor, elige otro casillero.");

                } else {

                    // El casillero tiene espacio disponible, ahora validar el biométrico
                    validarBiometrico(empleado);

                }

            } else {

                console.error(
                    "Error al validar el casillero:",
                    response.mensaje
                );
            }
        },

        error: function (xhr, status, error) {

            console.error("Error AJAX al validar el casillero.");
            console.error("status:", status);
            console.error("error:", error);
            console.error("respuesta servidor:", xhr.responseText);

        }
    });
}

//===========================================================
// FUNCIÓN PARA VALIDAR EL BIOMÉTRICO DEL EMPLEADO
//===========================================================

function validarBiometrico(empleado) {

    // Si no hay biométrico asignado, continuar con el proceso de registro
    if (!empleado.id_biometrico) {
        registrarInformacionPersonal(empleado);
        return;
    }

    $.ajax({
        type: "POST",
        url: "../../empleados/php/infoEmpleado.php",
        data: {
            accion: "validarBiometrico",
            id_biometrico: empleado.id_biometrico,
            id_area: empleado.id_area,
            id_empleado: "" // Vacío para registro nuevo
        },
        dataType: "json",

        success: function (response) {

            if (response.success) {

                if (response.existe) {

                    mostrarAlerta("error", "Biométrico en uso", "El biométrico ya está asignado a otro empleado en la misma área. Por favor, elige otro biométrico.");

                } else {

                    // El biométrico está disponible en esta área, continuar con el registro
                    registrarInformacionPersonal(empleado);
                }

            } else {

                mostrarAlerta("error", "Error al validar", "Hubo un error al validar el biométrico. Por favor, intenta de nuevo.");

                console.error(
                    "Error al validar el biométrico:",
                    response.mensaje
                );
            }
        },

        error: function (xhr, status, error) {

            console.error("Error AJAX al validar el biométrico.");
            console.error("status:", status);
            console.error("error:", error);
            console.error("respuesta servidor:", xhr.responseText);

        }
    });
}

//===========================================================
// FUNCIÓN PARA REGISTRAR LA INFORMACIÓN PERSONAL DEL EMPLEADO
// Y CONTINUAR CON EL PROCESO DE REGISTRO
//===========================================================

function registrarInformacionPersonal(empleado) {

    $.ajax({
        type: "POST",
        url: "../php/registroEmpleado.php",
        data: {
            accion: "registrarInformacionPersonal",

            // datos personales
            clave: empleado.clave,
            nombre: empleado.nombre,
            ap_paterno: empleado.ap_paterno,
            ap_materno: empleado.ap_materno,
            imss: empleado.imss,
            curp: empleado.curp,
            rfc: empleado.rfc,
            domicilio: empleado.domicilio,
            sexo: empleado.sexo,
            grupo_sanguineo: empleado.grupo_sanguineo,
            fecha_nacimiento: empleado.fecha_nacimiento,
            estado_civil: empleado.estado_civil,

            // datos de contacto
            telefono: empleado.telefono,
            enfermedades_alergias: empleado.enfermedades_alergias,

            // datos laborales
            numero_casillero: empleado.numero_casillero,
            id_biometrico: empleado.id_biometrico,
            id_empresa: empleado.id_empresa,
            id_area: empleado.id_area,
            id_departamento: empleado.id_departamento,
            id_puestoEspecial: empleado.id_puestoEspecial,

            // datos salariales
            salario_semanal: empleado.salario_semanal,
            salario_diario: empleado.salario_diario
        },
        dataType: "json",

        success: function (response) {
            if (response.success) {
                // Guardar el ID del empleado para usarlo en los siguientes pasos
                empleado.id_empleado = response.id_empleado;
                $('#registroIdEmpleado').val(response.id_empleado);
                $('#formRegistroEmpleado').data('id_empleado', response.id_empleado);

                mostrarAlerta("success", "Empleado registrado", "La información del empleado se ha registrado correctamente.");

                // Navegar al paso 2 (Contacto de Emergencia)
                $('#step1').addClass('d-none');
                $('#step2').removeClass('d-none');

                // Actualizar indicador de pasos
                $('#stepIndicator1').removeClass('btn-success active').addClass('btn-outline-secondary');
                $('#stepIndicator2').removeClass('btn-outline-secondary').addClass('btn-success active');

            } else {
                mostrarAlerta("error", "Error al registrar", "Hubo un error al registrar el empleado: " + response.mensaje);
            }
        },

        error: function (xhr, status, error) {
            console.error("Error AJAX al registrar el empleado.");
            console.error("status:", status);
            console.error("error:", error);
            console.error("respuesta servidor:", xhr.responseText);

            mostrarAlerta("error", "Error de conexión", "No se pudo conectar con el servidor para registrar el empleado.");
        }
    });

}


//===========================================================
// FUNCIÓN PARA GUARDAR LA INFORMACIÓN DEL CONTACTO DE EMERGENCIA
// Y CONTINUAR CON EL PROCESO DE REGISTRO
//===========================================================

function guardarContactoEmergencia() {
    $("#btnRegistroContactoEmergencia").click(function (e) {
        e.preventDefault();


        // Obtener el ID del empleado registrado en el Paso 1
        const idEmpleado = $('#registroIdEmpleado').val() || $('#formRegistroEmpleado').data('id_empleado');

        // Obtener los datos del formulario de contacto
        const nombre = $('#registroContactoNombre').val().trim().toUpperCase();
        const apPaterno = $('#registroContactoApellidoPaterno').val().trim().toUpperCase();
        const apMaterno = $('#registroContactoApellidoMaterno').val().trim().toUpperCase();
        const telefono = $('#registroContactoTelefono').val().trim();
        const parentesco = $('#registroContactoParentesco').val().trim().toUpperCase();
        const domicilio = $('#registroContactoDomicilio').val().trim().toUpperCase();

        // Validar campos obligatorios
        if (!nombre) {
            mostrarAlerta("warning", "Campo obligatorio", "Por favor ingrese el nombre del contacto de emergencia.");
            $('#registroContactoNombre').focus();
            return;
        }

        if (!apPaterno) {
            mostrarAlerta("warning", "Campo obligatorio", "Por favor ingrese el apellido paterno del contacto de emergencia.");
            $('#registroContactoApellidoPaterno').focus();
            return;
        }

        if (!telefono) {
            mostrarAlerta("warning", "Campo obligatorio", "Por favor ingrese el teléfono del contacto de emergencia.");
            $('#registroContactoTelefono').focus();
            return;
        }


        // Enviar datos al endpoint reutilizado infoContactoEmergencia.php
        $.ajax({
            type: "POST",
            url: "../../empleados/php/infoContactoEmergencia.php",
            data: {
                accion: "guardarContactoEmergencia",
                id_empleado: idEmpleado,
                nombre: nombre,
                ap_paterno: apPaterno,
                ap_materno: apMaterno,
                telefono: telefono,
                parentesco: parentesco,
                domicilio: domicilio
            },
            dataType: "json",

            success: function (response) {
                if (response.success) {
                    mostrarAlerta(
                        "success",
                        "Contacto registrado",
                        "La información del contacto de emergencia se ha guardado correctamente."
                    );

                    // Navegar al Paso 3 (Beneficiarios)
                    $('#step2').addClass('d-none');
                    $('#step3').removeClass('d-none');

                    // Actualizar indicador de pasos
                    $('#stepIndicator2').removeClass('btn-success active').addClass('btn-outline-secondary');
                    $('#stepIndicator3').removeClass('btn-outline-secondary').addClass('btn-success active');

                } else {
                    mostrarAlerta(
                        "error",
                        "Error al guardar",
                        response.mensaje || "Hubo un error al guardar el contacto de emergencia."
                    );
                }
            },
            error: function (xhr, status, error) {
                console.error("Error AJAX al registrar contacto de emergencia.");
                console.error("status:", status);
                console.error("error:", error);
                console.error("respuesta servidor:", xhr.responseText);

                mostrarAlerta(
                    "error",
                    "Error de conexión",
                    "No se pudo conectar con el servidor para guardar el contacto de emergencia."
                );
            },

        });

    });
}

//===========================================================
// FUNCIÓN PARA CONTINUAR AL PASO DE BENEFICIARIOS SIN 
// GUARDAR EL CONTACTO DE EMERGENCIA (OPCIONAL)
//===========================================================
function continuarBeneficiarios() {
    $("#btnContinuarBeneficiarios").click(function (e) {
        e.preventDefault();

        // Navegar al Paso 3 (Beneficiarios)
        $('#step2').addClass('d-none');
        $('#step3').removeClass('d-none');

        // Actualizar indicador de pasos
        $('#stepIndicator2').removeClass('btn-success active').addClass('btn-outline-secondary');
        $('#stepIndicator3').removeClass('btn-outline-secondary').addClass('btn-success active');

    });
}

//===========================================================
// FUNCIÓN PARA FINALIZAR EL REGISTRO Y REGRESAR AL INICIO
//===========================================================

function finalizarRegistro() {
    $("#btnFinalizarRegistro").click(function (e) {
        e.preventDefault();
        limpiarFormularioRegresarInicio();
    });

}

//===========================================================
// FUNCIÓN PARA MOSTRAR ALERTAS CON SWEETALERT2
//===========================================================

function mostrarAlerta(icono, titulo, mensaje) {

    Swal.fire({
        icon: icono,
        title: titulo,
        text: mensaje,
        confirmButtonText: "Aceptar"
    });

}