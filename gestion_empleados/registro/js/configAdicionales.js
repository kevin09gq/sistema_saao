$(document).ready(function () {
    cargarEmpresas();

    cargarAreas();

    obtenerIdArea();

    obtenerIdDepartamento();

    calcularSueldoDiario();

    establecerEdadEmpleado();
});

//====================================================
// FUNCIÓN PARA CARGAR LAS EMPRESAS EN EL SELECT
//====================================================

function cargarEmpresas() {
    return $.ajax({
        type: "POST",
        url: "../../empleados/php/infoAreasDepartamento.php",
        data: { accion: "obtenerEmpresas" },
        dataType: "json",

        // Ejecutar cuando la petición sea exitosa
        success: function (respuesta) {

            // Verificar si la respuesta fue exitosa
            if (respuesta.success) {

                // Limpiar el select de empresas
                $('#registroEmpresa').empty();

                // Agregar opción por defecto en empresas
                $('#registroEmpresa').append(`
                    <option value="1000">
                       Todas las empresas
                    </option>
                `);

                // Recorrer las empresas obtenidas
                respuesta.empresas.forEach(empresa => {

                    // Agregar cada empresa al select
                    $('#registroEmpresa').append(`
                        <option value="${empresa.id_empresa}">
                            ${empresa.nombre_empresa}
                        </option>
                    `);

                });

            } else {

                // Mostrar el mensaje de error
                console.error(respuesta.mensaje);

            }
        },
        // Ejecutar cuando ocurra un error
        error: function (xhr, estado, error) {

            // Mostrar el error ocurrido
            console.error("Error al obtener las empresas:", error);

        }

    });
}

//====================================================
// FUNCIÓN PARA CARGAR LAS ÁREAS EN EL SELECT
//====================================================

function cargarAreas() {
    return $.ajax({
        type: "POST",
        url: "../../empleados/php/infoAreasDepartamento.php",
        data: { accion: "obtenerAreas" },
        dataType: "json",

        // Ejecutar cuando la petición sea exitosa
        success: function (respuesta) {

            // Verificar si la respuesta fue exitosa
            if (respuesta.success) {

                // Limpiar el select de áreas
                $('#registroArea').empty();

                // Inicializar select de departamentos bloqueado y con opción por defecto
                $('#registroDepartamento').prop('disabled', true);
                $('#registroDepartamento').empty().append(`
                    <option value="1000">
                        Todos los departamentos
                    </option>
                `);
                $('#registroDepartamento').val("1000");

                // Inicializar select de puestos bloqueado y con opción por defecto
                $('#registroPuesto').prop('disabled', true);
                $('#registroPuesto').empty().append(`
                    <option value="1000">
                        Todos los puestos
                    </option>
                `);
                $('#registroPuesto').val("1000");

                // Agregar opción por defecto en áreas
                $('#registroArea').append(`
                    <option value="1000">
                       Todas las áreas
                    </option>
                `);

                // Recorrer las áreas obtenidas
                respuesta.areas.forEach(area => {

                    // Agregar cada área al select
                    $('#registroArea').append(`
                        <option value="${area.id_area}">
                            ${area.nombre_area}
                        </option>
                    `);

                });

            } else {

                // Mostrar el mensaje de error
                console.error(respuesta.mensaje);

            }
        },
        // Ejecutar cuando ocurra un error
        error: function (xhr, estado, error) {

            // Mostrar el error ocurrido
            console.error("Error al obtener las áreas:", error);

        }

    });
}

//====================================================
// FUNCIÓN PARA OBTENER EL ID DEL ÁREA SELECCIONADA
// Y CARGAR LOS DEPARTAMENTOS CORRESPONDIENTES
//====================================================

function obtenerIdArea() {

    // Detectar cuando se seleccione un área
    $('#registroArea').off('change').on('change', function () {

        // Obtener el área seleccionada
        let idAreaSeleccionada = $(this).val();

        // Si se seleccionaron todas las áreas
        if (idAreaSeleccionada == 1000 || !idAreaSeleccionada) {

            // Bloquear departamentos
            $('#registroDepartamento').prop('disabled', true);

            // Bloquear Puesto
            $('#registroPuesto').prop('disabled', true);

            // Limpiar departamentos
            $('#registroDepartamento').empty();

            // Limpiar Puesto
            $('#registroPuesto').empty();

            // Agregar opción por defecto
            $('#registroDepartamento').append(`
                <option value="1000">
                    Todos los departamentos
                </option>
            `);

            $('#registroDepartamento').val("1000");

            // Agregar opción por defecto para Puesto
            $('#registroPuesto').append(`
                <option value="1000">
                    Todos los puestos
                </option>
            `);
            $('#registroPuesto').val("1000");

        } else {

            // Desbloquear departamentos
            $('#registroDepartamento').prop('disabled', false);

            // Colocar opción por defecto inmediatamente para evitar valores null
            $('#registroDepartamento').empty().append(`
                <option value="1000">
                    Todos los departamentos
                </option>
            `);
            $('#registroDepartamento').val("1000");

            // Resetear Puesto a bloqueado hasta que seleccione un departamento
            $('#registroPuesto').prop('disabled', true).empty().append(`
                <option value="1000">
                    Todos los puestos
                </option>
            `).val("1000");

            // Obtener los departamentos del área seleccionada
            cargarDepartamentos(idAreaSeleccionada);
        }

    });
}

//====================================================
// FUNCIÓN PARA CARGAR LOS DEPARTAMENTOS EN EL SELECT
//====================================================

function cargarDepartamentos(areaId) {
    return $.ajax({
        type: "POST",
        url: "../../empleados/php/infoAreasDepartamento.php",

        data: {
            accion: "obtenerDepartamentos",
            id_area: areaId
        },
        dataType: "json",
        success: function (response) {
            if (response.success) {
                // Limpiar los departamentos existentes
                $('#registroDepartamento').empty();

                // Agregar la opción por defecto
                $('#registroDepartamento').append(`
                    <option value="1000">
                        Todos los departamentos
                    </option>
                `);

                // Agregar los nuevos departamentos
                response.departamentos.forEach(function (departamento) {
                    $('#registroDepartamento').append(`
                        <option value="${departamento.id_departamento}">
                            ${departamento.nombre_departamento}
                        </option>
                    `);
                });
            }
        }
    });
}

//====================================================
// FUNCIÓN PARA OBTENER EL ID DEL DEPARTAMENTO SELECCIONADO
// Y CARGAR LOS PUESTOS CORRESPONDIENTES
//====================================================

function obtenerIdDepartamento() {
    // Detectar cuando se seleccione un Departamento
    $('#registroDepartamento').off('change').on('change', function () {

        // Obtener el departamento seleccionado
        let idDepartamentoSeleccionada = $(this).val();

        // Si se seleccionaron todos los departamentos
        if (idDepartamentoSeleccionada == 1000 || !idDepartamentoSeleccionada) {

            // Bloquear Puesto
            $('#registroPuesto').prop('disabled', true);

            // Limpiar Puesto
            $('#registroPuesto').empty();

            // Agregar opción por defecto para Puesto
            $('#registroPuesto').append(`
                <option value="1000">
                    Todos los puestos
                </option>
            `);
            $('#registroPuesto').val("1000");

        } else {

            // Desbloquear Puesto
            $('#registroPuesto').prop('disabled', false);

            // Colocar opción por defecto inmediatamente para evitar valores null
            $('#registroPuesto').empty().append(`
                <option value="1000">
                    Todos los puestos
                </option>
            `);
            $('#registroPuesto').val("1000");

            // Obtener los puestos del departamento seleccionado
            cargarPuestos(idDepartamentoSeleccionada);
        }

    });
}

//====================================================
// FUNCIÓN PARA CARGAR LOS PUESTOS EN EL SELECT
//====================================================

function cargarPuestos(departamentoId) {
    return $.ajax({
        type: "POST",
        url: "../../empleados/php/infoAreasDepartamento.php",
        data: {
            accion: "obtenerPuestos",
            id_departamento: departamentoId
        },
        dataType: "json",
        success: function (response) {
            if (response.success) {
                // Limpiar los puestos existentes
                $('#registroPuesto').empty();

                // Agregar la opción por defecto
                $('#registroPuesto').append(`
                    <option value="1000">
                        Todos los puestos
                    </option>
                `);

                // Agregar los nuevos puestos
                response.puestos.forEach(function (puesto) {
                    $('#registroPuesto').append(`
                        <option value="${puesto.id_puestoEspecial}">
                            ${puesto.nombre_puesto}
                        </option>
                    `);
                });
            }
        }
    });
}

//====================================================
// FUNCIÓN PARA LIMPIAR EL FORMULARIO Y REGRESAR AL PASO 1
//====================================================

function limpiarFormularioRegresarInicio() {
    // Limpiar el campo oculto del ID del empleado
    $('#registroIdEmpleado').val('');
    $('#formRegistroEmpleado').removeData('id_empleado');

    // Limpiar todos los inputs de texto del paso 1
    $('#registroClave').val('');
    $('#registroNombre').val('');
    $('#registroApellidoPaterno').val('');
    $('#registroApellidoMaterno').val('');
    $('#registroImss').val('');
    $('#registroCurp').val('');
    $('#registroRfc').val('');
    $('#registroDomicilio').val('');
    $('#registroSexo').val('');
    $('#registroGrupoSanguineo').val('');
    $('#registroFechaNacimiento').val('');
    $('#registroEdad').val('');
    $('#registroEstadoCivil').val('');
    $('#registroTelefono').val('');
    $('#registroEnfermedades').val('');
    $('#registroCasillero').val('');
    $('#registroBiometrico').val('');
    $('#registroSalarioSemanal').val('');
    $('#registroSalarioDiario').val('');

    // Limpiar los selects del paso 1
    $('#registroEmpresa').val('1000');
    $('#registroArea').val('1000');
    $('#registroDepartamento').val('1000').prop('disabled', true);
    $('#registroPuesto').val('1000').prop('disabled', true);

    // Limpiar los campos del paso 2 (Contacto de emergencia)
    $('#registroContactoNombre').val('');
    $('#registroContactoApellidoPaterno').val('');
    $('#registroContactoApellidoMaterno').val('');
    $('#registroContactoTelefono').val('');
    $('#registroContactoParentesco').val('');
    $('#registroContactoDomicilio').val('');

    // Limpiar los campos del paso 3 (Beneficiarios)
    $('#registroBeneficiarioNombre').val('');
    $('#registroBeneficiarioApellidoPaterno').val('');
    $('#registroBeneficiarioApellidoMaterno').val('');
    $('#registroBeneficiarioParentesco').val('');
    $('#registroBeneficiarioPorcentaje').val('');

    // Limpiar la tabla de beneficiarios
    $('#registroTablaBeneficiarios').html(`
        <tr id="registroFilaSinBeneficiarios">
            <td colspan="7" class="text-center text-muted py-4">
                <i class="bi bi-person-x fs-3 d-block mb-2"></i>
                No hay beneficiarios registrados
            </td>
        </tr>
    `);

    // Reiniciar los porcentajes de beneficiarios
    $('#registroBeneficiariosPorcentajeTotal').text('0.00%');
    $('#registroPorcentajeAsignado').text('0.00%');
    $('#registroPorcentajeDisponible').text('100.00%');

    // Ocultar pasos 2 y 3, mostrar paso 1
    $('#step2').addClass('d-none');
    $('#step3').addClass('d-none');
    $('#step1').removeClass('d-none');

    // Reiniciar indicadores de pasos
    $('#stepIndicator1').removeClass('btn-outline-secondary').addClass('btn-success active');
    $('#stepIndicator2').removeClass('btn-success active').addClass('btn-outline-secondary');
    $('#stepIndicator3').removeClass('btn-success active').addClass('btn-outline-secondary');

    // Recargar selects para asegurar que estén en estado inicial
    cargarEmpresas();
    cargarAreas();
}

//====================================================
// FUNCIÓN PARA CALCULAR EL SUELDO DIARIO A PARTIR
// DEL SUELDO SEMANAL
//====================================================

function calcularSueldoDiario() {

    $('#registroSalarioSemanal').on('input', function () {

        // obtener el sueldo semanal
        var sueldoSemanal = $('#registroSalarioSemanal').val();

        // validar que exista un sueldo
        if (sueldoSemanal === '') {

            $('#registroSalarioDiario').val('');

            return;
        }

        // convertir el sueldo semanal a numero
        sueldoSemanal = parseFloat(sueldoSemanal);

        // validar que sea un numero valido
        if (isNaN(sueldoSemanal)) {

            $('#registroSalarioDiario').val('');

            return;
        }

        // calcular el sueldo diario
        var sueldoDiario = sueldoSemanal / 7;

        // establecer el resultado sin redondearlo
        $('#registroSalarioDiario').val(sueldoDiario);

    });

}

//====================================================
// FUNCIÓN PARA ESTABLECER LA EDAD DEL EMPLEADO A PARTIR
// DE LA FECHA DE NACIMIENTO
//====================================================

function establecerEdadEmpleado() {
    $('#registroFechaNacimiento').on('change input', function () {

        // Obtener la fecha de nacimiento
        var fechaNacimiento = $(this).val();

        if (!fechaNacimiento) {
            $('#registroEdad').val('');
            return;
        }

        // Calcular la edad utilizando la función
        var edad = calcularEdad(fechaNacimiento);

        // Establecer la edad en el campo
        if (edad !== '' && !isNaN(edad) && edad >= 0) {
            $('#registroEdad').val(edad + " años");
        } else {
            $('#registroEdad').val('');
        }

    });
}

//====================================================
// FUNCIÓN AUXILIAR PARA CALCULAR LA EDAD A PARTIR DE 
// LA FECHA DE NACIMIENTO
//====================================================

function calcularEdad(fechaNacimiento) {

    if (!fechaNacimiento) {
        return '';
    }

    // Convertir la fecha de nacimiento
    const fechaNacimientoDate = new Date(fechaNacimiento + 'T00:00:00');

    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNacimientoDate.getFullYear();

    const mesActual = hoy.getMonth();
    const mesNacimiento = fechaNacimientoDate.getMonth();

    const diaActual = hoy.getDate();
    const diaNacimiento = fechaNacimientoDate.getDate();

    // Si todavía no cumple años este año
    if (
        mesActual < mesNacimiento ||
        (mesActual === mesNacimiento && diaActual < diaNacimiento)
    ) {
        edad--;
    }

    return edad;
}
