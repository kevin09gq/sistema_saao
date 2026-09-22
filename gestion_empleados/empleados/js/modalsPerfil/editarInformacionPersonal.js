$(document).ready(function () {

    // Evento para guardar los cambios del empleado
    $('#btnGuardarEmpleado').on('click', function () {

        guardarInformacionEmpleado();

    });

    establecerEdadEmpleado();

    calcularSueldoDiario();

});


//====================================================
// FUNCIÓN PARA OBTENER LOS DATOS DEL MODAL
//====================================================

function obtenerDatosEmpleado() {

    var empleado = {

        //==============================================
        // DATOS PERSONALES
        //==============================================

        id_empleado: $('#formEditarEmpleado').data('id_empleado'),

        clave: $('#editarClave').val().trim(),

        nombre: $('#editarNombre').val().trim().toUpperCase(),

        ap_paterno: $('#editarApellidoPaterno').val().trim().toUpperCase(),

        ap_materno: $('#editarApellidoMaterno').val().trim().toUpperCase(),

        imss: $('#editarImss').val().trim(),

        curp: $('#editarCurp').val().trim().toUpperCase(),

        rfc: $('#editarRfc').val().trim().toUpperCase(),

        domicilio: $('#editarDomicilio').val().trim(),

        sexo: $('#editarSexo').val(),

        grupo_sanguineo: $('#editarGrupoSanguineo').val().trim(),

        fecha_nacimiento: $('#editarFechaNacimiento').val(),

        estado_civil: $('#editarEstadoCivil').val(),


        //==============================================
        // DATOS DE CONTACTO
        //==============================================

        telefono: $('#editarTelefono').val().trim(),

        enfermedades_alergias: $('#editarEnfermedades').val().trim(),


        //==============================================
        // DATOS LABORALES
        //==============================================

        numero_casillero: $('#editarCasillero').val().trim(),

        id_biometrico: $('#editarBiometrico').val().trim(),

        id_empresa: $('#editarEmpresa').val(),

        id_area: $('#editarArea').val(),

        id_departamento: $('#editarDepartamento').val(),

        id_puestoEspecial: $('#editarPuesto').val(),


        //==============================================
        // DATOS SALARIALES
        //==============================================

        salario_semanal: $('#editarSalarioSemanal').val(),

        salario_diario: $('#editarSalarioDiario').val()

    };

    return empleado;
}

//====================================================
// FUNCIÓN PARA GUARDAR LA INFORMACIÓN DEL EMPLEADO
//====================================================

function guardarInformacionEmpleado() {

    // Obtener todos los datos actuales del modal
    var empleado = obtenerDatosEmpleado();

    // Validar que exista el ID del empleado
    if (!empleado.id_empleado) {

        console.error("No se encontró el id del empleado.");

        return;
    }

    validarClave(empleado);
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
        url: "../php/infoEmpleado.php",
        data: {
            accion: "validarClave",
            clave: empleado.clave,
            id_empresa: empleado.id_empresa,
            id_empleado: empleado.id_empleado
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
        url: "../php/infoEmpleado.php",
        data: {
            accion: "validarNombre",
            nombre: empleado.nombre,
            ap_paterno: empleado.ap_paterno,
            ap_materno: empleado.ap_materno,
            id_empleado: empleado.id_empleado
        },
        dataType: "json",

        success: function (response) {

            if (response.success) {

                if (response.existe) {

                    mostrarAlerta("error", "Empleado existente", "El empleado ya existe en la misma empresa.");

                } else {

                    // El nombre completo es único en la misma empresa, ahora validar el casillero
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

//=============================================
// FUNCIÓN PARA VALIDAR EL CASILLERO DEL EMPLEADO
// VERIFICANDO SI YA HAY 2 EMPLEADOS ASIGNADOS AL 
// MISMO CASILLERO
//=============================================

function validarCasillero(empleado) {

    // si no hay casillero asignado, continuar con la validación del biométrico
    if (!empleado.numero_casillero) {
        validarBiometrico(empleado);
        return;
    }

    $.ajax({
        type: "POST",
        url: "../php/infoEmpleado.php",
        data: {
            accion: "validarCasillero",
            numero_casillero: empleado.numero_casillero,
            id_empleado: empleado.id_empleado
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

//=============================================
// FUNCIÓN PARA VALIDAR EL BIOMÉTRICO DEL EMPLEADO
// VERIFICANDO SI YA EXISTE EN LA MISMA ÁREA
//=============================================

function validarBiometrico(empleado) {

    // Si no hay biométrico asignado, continuar con la función para guardar la información del empleado
    if (!empleado.id_biometrico) {
        actualizarInformacionEmpleado(empleado);
        return;
    }

    $.ajax({
        type: "POST",
        url: "../php/infoEmpleado.php",
        data: {
            accion: "validarBiometrico",
            id_biometrico: empleado.id_biometrico,
            id_area: empleado.id_area,
            id_empleado: empleado.id_empleado
        },
        dataType: "json",

        success: function (response) {

            if (response.success) {

                if (response.existe) {

                    mostrarAlerta("error", "Biométrico en uso", "El biométrico ya está asignado a otro empleado en la misma área. Por favor, elige otro biométrico.");

                } else {

                    // El biométrico está disponible en esta área, ahora guardar la información del empleado
                    actualizarInformacionEmpleado(empleado);
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


//====================================================
// GUARDAR / ACTUALIZAR LA INFORMACIÓN DEL EMPLEADO EN BD
//====================================================

function actualizarInformacionEmpleado(empleado) {

    // enviar los datos al servidor
    $.ajax({
        type: "POST",
        url: "../php/infoEmpleado.php",
        data: {
            accion: "actualizarEmpleado",

            // datos personales
            id_empleado: empleado.id_empleado,
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


            // verificar si el servidor actualizo correctamente
            if (response.success) {

                mostrarAlerta("success", "Empleado actualizado", "La información del empleado se ha actualizado correctamente.");

                // cerrar el modal
                $('#modalEditarEmpleado').modal('hide');

                // actualizar la información del empleado en la tabla manteniendo página y filtros
                obtenerEmpleados(true);

            } else {

                mostrarAlerta("error", "Error al actualizar", "Hubo un error al actualizar la información del empleado. Por favor, intenta de nuevo.");
            }
        },

        error: function (xhr, status, error) {

            console.error("Error AJAX al actualizar el empleado.");
            console.error("status:", status);
            console.error("error:", error);
            console.error("respuesta servidor:", xhr.responseText);

        }
    });
}


//====================================================
// FUNCIÓN PARA MOSTRAR ALERTAS CON SWEETALERT2
//====================================================

function mostrarAlerta(icono, titulo, mensaje) {

    Swal.fire({
        icon: icono,
        title: titulo,
        text: mensaje,
        confirmButtonText: "Aceptar"
    });

}

//====================================================
// FUNCIÓN PARA ESTABLECER LA EDAD DEL EMPLEADO
// AUTOMÁTICAMENTE
//====================================================

function establecerEdadEmpleado() {
    $('#editarFechaNacimiento').on('change', function () {

        // obtener la fecha de nacimiento
        var fechaNacimiento = $('#editarFechaNacimiento').val();

        // calcular la edad utilizando la funcion existente
        var edad = calcularEdad(fechaNacimiento);

        // establecer la edad en el campo
        $('#editarEdad').val(edad + " años");

    });
}


//====================================================
// FUNCIÓN PARA CALCULAR EL SUELDO DIARIO A PARTIR 
// DEL SUELDO SEMANAL
//====================================================

function calcularSueldoDiario() {

    $('#editarSalarioSemanal').on('input', function () {

        // obtener el sueldo semanal
        var sueldoSemanal = $('#editarSalarioSemanal').val();

        // validar que exista un sueldo
        if (sueldoSemanal === '') {

            $('#editarSalarioDiario').val('');

            return;
        }

        // convertir el sueldo semanal a numero
        sueldoSemanal = parseFloat(sueldoSemanal);

        // validar que sea un numero valido
        if (isNaN(sueldoSemanal)) {

            $('#editarSalarioDiario').val('');

            return;
        }

        // calcular el sueldo diario
        var sueldoDiario = sueldoSemanal / 7;

        // establecer el resultado sin redondearlo
        $('#editarSalarioDiario').val(sueldoDiario);

    });

}