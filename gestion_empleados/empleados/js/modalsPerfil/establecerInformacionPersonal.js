//====================================================
// FUNCIÓN PARA ABRIR EL MODAL DE INFORMACIÓN PERSONAL
// FUNCIÓN LLAMADA DESDE EL SWITCH DE ACCIONES
//====================================================

async function abrirModalEditarEmpleado(idEmpleado) {
    // 1. Cargar selects iniciales
    await cargarEmpresas();
    await cargarAreas();

    // 2. Configurar listeners de cambio manual
    obtenerIdArea();
    obtenerIdDepartamento();

    // 3. Obtener información del empleado y llenar campos
    await obtenerInfoEmpleado(idEmpleado);

    // 4. Aplicar permisos de edición
    aplicarPermisosInformacionPersonal();

    // 5. Aplicar permisos de Salarios
    aplicarPermisosSalarios();

    // 5. Abrir el modal
    $('#modalEditarEmpleado').modal('show');
}

//====================================================
// FUNCIÓN PARA CARGAR LAS EMPRESAS EN EL SELECT
//====================================================

function cargarEmpresas() {
    return $.ajax({
        type: "POST",
        url: "../php/infoAreasDepartamento.php",
        data: { accion: "obtenerEmpresas" },
        dataType: "json",

        // Ejecutar cuando la petición sea exitosa
        success: function (respuesta) {

            // Verificar si la respuesta fue exitosa
            if (respuesta.success) {

                // Limpiar el select de empresas
                $('#editarEmpresa').empty();

                // Agregar opción por defecto en empresas
                $('#editarEmpresa').append(`
                    <option value="1000">
                       Todas las empresas
                    </option>
                `);

                // Recorrer las empresas obtenidas
                respuesta.empresas.forEach(empresa => {

                    // Agregar cada empresa al select
                    $('#editarEmpresa').append(`
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
        url: "../php/infoAreasDepartamento.php",
        data: { accion: "obtenerAreas" },
        dataType: "json",

        // Ejecutar cuando la petición sea exitosa
        success: function (respuesta) {

            // Verificar si la respuesta fue exitosa
            if (respuesta.success) {

                // Limpiar el select de áreas
                $('#editarArea').empty();

                // Inicializar select de departamentos bloqueado y con opción por defecto
                $('#editarDepartamento').prop('disabled', true);
                $('#editarDepartamento').empty().append(`
                    <option value="1000">
                        Todos los departamentos
                    </option>
                `);
                $('#editarDepartamento').val("1000");

                // Inicializar select de puestos bloqueado y con opción por defecto
                $('#editarPuesto').prop('disabled', true);
                $('#editarPuesto').empty().append(`
                    <option value="1000">
                        Todos los puestos
                    </option>
                `);
                $('#editarPuesto').val("1000");

                // Agregar opción por defecto en áreas
                $('#editarArea').append(`
                    <option value="1000">
                       Todas las áreas
                    </option>
                `);

                // Recorrer las áreas obtenidas
                respuesta.areas.forEach(area => {

                    // Agregar cada área al select
                    $('#editarArea').append(`
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
    $('#editarArea').off('change').on('change', function () {

        // Obtener el área seleccionada
        let idAreaSeleccionada = $(this).val();

        // Si se seleccionaron todas las áreas
        if (idAreaSeleccionada == 1000 || !idAreaSeleccionada) {

            // Bloquear departamentos
            $('#editarDepartamento').prop('disabled', true);

            // Bloquear Puesto
            $('#editarPuesto').prop('disabled', true);

            // Limpiar departamentos
            $('#editarDepartamento').empty();

            // Limpiar Puesto
            $('#editarPuesto').empty();

            // Agregar opción por defecto
            $('#editarDepartamento').append(`
                <option value="1000">
                    Todos los departamentos
                </option>
            `);

            $('#editarDepartamento').val("1000");

            // Agregar opción por defecto para Puesto
            $('#editarPuesto').append(`
                <option value="1000">
                    Todos los puestos
                </option>
            `);
            $('#editarPuesto').val("1000");

        } else {

            // Desbloquear departamentos
            $('#editarDepartamento').prop('disabled', false);

            // Colocar opción por defecto inmediatamente para evitar valores null
            $('#editarDepartamento').empty().append(`
                <option value="1000">
                    Todos los departamentos
                </option>
            `);
            $('#editarDepartamento').val("1000");

            // Resetear Puesto a bloqueado hasta que seleccione un departamento
            $('#editarPuesto').prop('disabled', true).empty().append(`
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
        url: "../php/infoAreasDepartamento.php",

        data: {
            accion: "obtenerDepartamentos",
            id_area: areaId
        },
        dataType: "json",
        success: function (response) {
            if (response.success) {
                // Limpiar los departamentos existentes
                $('#editarDepartamento').empty();

                // Agregar la opción por defecto
                $('#editarDepartamento').append(`
                    <option value="1000">
                        Todos los departamentos
                    </option>
                `);

                // Agregar los nuevos departamentos
                response.departamentos.forEach(function (departamento) {
                    $('#editarDepartamento').append(`
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
    $('#editarDepartamento').off('change').on('change', function () {

        // Obtener el departamento seleccionado
        let idDepartamentoSeleccionada = $(this).val();

        // Si se seleccionaron todos los departamentos
        if (idDepartamentoSeleccionada == 1000 || !idDepartamentoSeleccionada) {

            // Bloquear Puesto
            $('#editarPuesto').prop('disabled', true);

            // Limpiar Puesto
            $('#editarPuesto').empty();

            // Agregar opción por defecto para Puesto
            $('#editarPuesto').append(`
                <option value="1000">
                    Todos los puestos
                </option>
            `);
            $('#editarPuesto').val("1000");

        } else {

            // Desbloquear Puesto
            $('#editarPuesto').prop('disabled', false);

            // Colocar opción por defecto inmediatamente para evitar valores null
            $('#editarPuesto').empty().append(`
                <option value="1000">
                    Todos los puestos
                </option>
            `);
            $('#editarPuesto').val("1000");

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
        url: "../php/infoAreasDepartamento.php",
        data: {
            accion: "obtenerPuestos",
            id_departamento: departamentoId
        },
        dataType: "json",
        success: function (response) {
            if (response.success) {
                // Limpiar los puestos existentes
                $('#editarPuesto').empty();

                // Agregar la opción por defecto
                $('#editarPuesto').append(`
                    <option value="1000">
                        Todos los puestos
                    </option>
                `);

                // Agregar los nuevos puestos
                response.puestos.forEach(function (puesto) {
                    $('#editarPuesto').append(`
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
// FUNCIÓN PARA OBTENER LA INFORMACIÓN DEL EMPLEADO
// ENVIANDO EL ID DEL EMPLEADO AL PHP
//====================================================

function obtenerInfoEmpleado(idEmpleado) {

    return $.ajax({
        type: "POST",
        url: "../php/infoEmpleado.php",
        data: {
            accion: "obtenerInformacionPersonal",
            id_empleado: idEmpleado
        },
        dataType: "json",
        success: async function (response) {
            if (response.success) {

                // Establecer los valores en los campos del modal
                establecerDatosPersonales(response.empleado);
                establecerDatosContactos(response.empleado);
                await establecerDatosLaborales(response.empleado);
                establecerSalario(response.empleado);


            }

        }
    });

}


//====================================================
// FUNCIÓN PARA ESTABLECER LOS DATOS PERSONALES DEL 
// EMPLEADO EN LOS CAMPOS DEL MODAL
//====================================================

function establecerDatosPersonales(empleado) {

    // Establecer ID del empleado
    $('#formEditarEmpleado').data('id_empleado', empleado.id_empleado);

    // Establecer Clave
    $('#editarClave').val(empleado.clave);

    //Establecer Nombre
    $('#editarNombre').val(empleado.nombre);

    // Establecer Apellido Paterno
    $('#editarApellidoPaterno').val(empleado.ap_paterno);

    // Establecer Apellido Materno
    $('#editarApellidoMaterno').val(empleado.ap_materno);

    // Establecer Imss
    $("#editarImss").val(empleado.imss);

    // Establecer Curp
    $("#editarCurp").val(empleado.curp);

    // Establecer Rfc
    $("#editarRfc").val(empleado.rfc);

    // Establecer Domicilio
    $("#editarDomicilio").val(empleado.domicilio);

    // Establecer Grupo Sanguíneo
    $("#editarGrupoSanguineo").val(empleado.grupo_sanguineo);

    // Establecer Sexo

    if (empleado.sexo === 'M') {
        $('#editarSexo').val('M').change();
    } else if (empleado.sexo === 'F') {
        $('#editarSexo').val('F').change();
    } else {
        $('#editarSexo').val('').change(); // Valor por defecto si no es M o F
    }

    // Establecer Fecha de Nacimiento y Edad

    if (empleado.fecha_nacimiento) {

        $('#editarFechaNacimiento').val(empleado.fecha_nacimiento);

        // Calcular edad
        const edad = calcularEdad(empleado.fecha_nacimiento);

        $('#editarEdad').val(edad + ' años');

    } else {

        $('#editarFechaNacimiento').val('');
        $('#editarEdad').val('');

    }


    // Establecer Estado Civil
    if (empleado.estado_civil) {
        $('#editarEstadoCivil').val(empleado.estado_civil).change();
    } else {
        $('#editarEstadoCivil').val('').change();
    }

}

//====================================================
// FUNCIÓN PARA ESTABLECER LOS DATOS DE CONTACTO DEL 
// EMPLEADO EN LOS CAMPOS DEL MODAL
//====================================================

function establecerDatosContactos(empleado) {
    // Establecer Teléfono
    $("#editarTelefono").val(empleado.telefono);

    // Establecer Enfermedades o Alergias
    $("#editarEnfermedades").val(empleado.enfermedades_alergias);
}

//====================================================
// FUNCIÓN PARA ESTABLECER LOS DATOS LABORALES DEL 
// EMPLEADO EN LOS CAMPOS DEL MODAL
//====================================================

async function establecerDatosLaborales(empleado) {

    // Establecer Número de Casillero
    $("#editarCasillero").val(empleado.numero_casillero);

    // Establecer Biometrico
    $("#editarBiometrico").val(empleado.id_biometrico);

    // Establecer Empresa
    if (empleado.id_empresa) {
        $('#editarEmpresa').val(empleado.id_empresa);
    } else {
        $('#editarEmpresa').val('1000');
    }

    // Establecer Área
    if (empleado.id_area && empleado.id_area != 1000) {
        $('#editarArea').val(empleado.id_area);
        $('#editarDepartamento').prop('disabled', false);

        // Esperar a que se carguen los departamentos del área
        await cargarDepartamentos(empleado.id_area);

        // Establecer Departamento
        if (empleado.id_departamento && empleado.id_departamento != 1000) {
            $('#editarDepartamento').val(empleado.id_departamento);
            $('#editarPuesto').prop('disabled', false);

            // Esperar a que se carguen los puestos del departamento
            await cargarPuestos(empleado.id_departamento);

            // Establecer Puesto
            if (empleado.id_puestoEspecial && empleado.id_puestoEspecial != 1000) {
                $('#editarPuesto').val(empleado.id_puestoEspecial);
            } else {
                $('#editarPuesto').val('1000');
            }

        } else {
            $('#editarDepartamento').val('1000');
            $('#editarPuesto').prop('disabled', true).val('1000');
        }

    } else {
        $('#editarArea').val('1000');
        $('#editarDepartamento').prop('disabled', true).val('1000');
        $('#editarPuesto').prop('disabled', true).val('1000');
    }
}

//====================================================
// FUNCIÓN PARA ESTABLECER EL SALARIO DEL EMPLEADO EN 
// EL CAMPO DEL MODAL
//====================================================

function establecerSalario(empleado) {

    // Establecer Salario semanal
    $("#editarSalarioSemanal").val(empleado.salario_semanal);

    // Establecer Salario diario
    $("#editarSalarioDiario").val(empleado.salario_diario);

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