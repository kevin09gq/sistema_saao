$(document).ready(function () {
    const rutaPlugins = '/sistema_saao/';

    getDepartamentos();
    obtenerDatosEmpleados();
    departamentoSeleccionado();
    filtrosBusqueda();
    setValoresModal();

    // Se Obtienen los departamentos
    function getDepartamentos() {
        $.ajax({
            type: "GET",
            url: "../php/obtenerDepartamentos.php",
            success: function (response) {
                if (!response.error) {
                    let departamentos = JSON.parse(response);
                    let opciones = `<option value=\"0\">Todos</option>`;
                    departamentos.forEach((element) => {
                        opciones += `
                        <option value=\"${element.id_departamento}\">${element.nombre_departamento}</option> `;
                    });
                    $("#filtroDepartamento").html(opciones);

                }

            }
        });
    }



    function obtenerDatosEmpleados() {
        $.ajax({
            type: "POST",
            url: "../php/obtenerEmpleados.php",
            data: {
                accion: "cargarEmpleados",
            },
            dataType: "json",
            success: function (empleados) {
                setEmpleadosData(empleados);
            },
            error: function (xhr, status, error) {
                console.error("Error en la petición:", error);
                console.log("Respuesta completa:", xhr.responseText);
            }
        });
    }

    function departamentoSeleccionado() {
        // Si quieres recargar empleados al cambiar el filtro de departamento:
        $("#filtroDepartamento").on("change", function () {


            setFiltroDepartamento($(this).val());
            $("#buscadorEmpleado").val(""); // Opcional: limpia el buscador al cambiar departamento
            setBusqueda(""); // Resetea búsqueda
        });
    }


    function filtrosBusqueda(param) {

        $("#buscadorEmpleado").on("input", function () {
            setBusqueda($(this).val());
        });

        $("#activos-tab").on("click", function () {
            setFiltroEstado("Activo");
        });
        $("#inactivos-tab").on("click", function () {
            setFiltroEstado("Baja");
        });
        $("#all-tab").on("click", function () {
            setFiltroEstado("Todos");
        });

    }

    function validarDatos(selector, validacion) {
        $(selector).on('input', function () {
            const valor = $(this).val();

            // Quita clases anteriores
            $(this).removeClass('border-success border-danger');

            // Si está vacío, no aplica ninguna clase
            if (valor === "") return;

            // Aplica validación directa sin trim
            const isValid = validacion(valor);
            $(this).addClass(isValid ? 'border-success' : 'border-danger');
        });
    }


    function validarCampos(selector, validar) {
        let valorCampo = selector.val();
        if (valorCampo === "") {
            $(selector).removeClass("border-danger");
            $(selector).removeClass("border-success");
            return;

        }
        if (validar(valorCampo)) {
            $(selector).removeClass("border-danger");
            $(selector).addClass("border-success");

        } else {
            $(selector).removeClass("border-success");
            $(selector).addClass("border-danger");

        }

    }

    function setValoresModal(params) {
        $(document).on("click", ".btn-actualizar", function () {
            let idEmpleado = $(this).data("id");
            let claveEmpleado = $(this).data("clave");

            let data = {
                id_empleado: idEmpleado,
                clave_empleado: claveEmpleado,
                accion: "dataEmpleado"
            };

            // Primero obtenemos los datos del empleado
            $.ajax({
                type: "POST",
                url: "../php/obtenerEmpleados.php",
                data: data,
                success: function (empleado) {
                    if (!empleado.error) {
                        // Extraemos todos los datos del empleado
                        let nombreEmpleado = empleado.nombre_empleado;
                        let apPaternoEmpleado = empleado.apellido_paterno_empleado;
                        let apMaternoEmpleado = empleado.apellido_materno_empleado;
                        let domicilioEmpleado = empleado.domicilio_empleado;
                        let imssEmpleado = empleado.imss;
                        let curpEmpleado = empleado.curp;
                        let sexoEmpleado = empleado.sexo;
                        let grupoSanguineo = empleado.grupo_sanguineo;
                        let enfermedades = empleado.enfermedades_alergias;
                        let fechaIngreso = empleado.fecha_ingreso;
                        let idDepartamentoEmpleado = empleado.id_departamento; // 👈 ID del departamento

                        let nombreContacto = empleado.nombre_contacto;
                        let apPaternoContacto = empleado.apellido_paterno_contacto;
                        let apMaternoContacto = empleado.apellido_materno_contacto;
                        let telefonoContacto = empleado.telefono_contacto;
                        let domicilioContacto = empleado.domicilio_contacto;
                        let parentescoContacto = empleado.parentesco;

                        // Asignamos los valores a los inputs del modal
                        $("#empleado_id").val(idEmpleado);
                        $("#modal_clave_empleado").val(claveEmpleado);
                        $("#modal_nombre_empleado").val(nombreEmpleado);
                        $("#modal_apellido_paterno").val(apPaternoEmpleado);
                        $("#modal_apellido_materno").val(apMaternoEmpleado);
                        $("#modal_domicilio").val(domicilioEmpleado);
                        $("#modal_imss").val(imssEmpleado);
                        $("#modal_curp").val(curpEmpleado);
                        $("#modal_sexo").val(sexoEmpleado);
                        $("#modal_grupo_sanguineo").val(grupoSanguineo);
                        $("#modal_enfermedades_alergias").val(enfermedades);
                        $("#modal_fecha_ingreso").val(fechaIngreso);

                        $("#modal_emergencia_nombre").val(nombreContacto);
                        $("#modal_emergencia_ap_paterno").val(apPaternoContacto);
                        $("#modal_emergencia_ap_materno").val(apMaternoContacto);
                        $("#modal_emergencia_telefono").val(telefonoContacto);
                        $("#modal_emergencia_domicilio").val(domicilioContacto);
                        $("#modal_emergencia_parentesco").val(parentescoContacto);

                        // Ahora cargamos los departamentos y seleccionamos el que corresponde
                        $.ajax({
                            type: "GET",
                            url: "../php/obtenerDepartamentos.php",
                            success: function (response) {
                                let departamentos = JSON.parse(response);
                                let opciones = `<option value="0">Ninguno</option>`;

                                departamentos.forEach((element) => {
                                    opciones += `
                                <option value="${element.id_departamento}">${element.nombre_departamento}</option>`;
                                });

                                $("#modal_departamento").html(opciones);
                                // Seleccionar automáticamente el departamento del empleado
                                // Si idDepartamentoEmpleado es null, undefined o vacío, seleccionamos "Ninguno"
                                if (!idDepartamentoEmpleado || idDepartamentoEmpleado === "0") {
                                    $("#modal_departamento").val("0");
                                } else {
                                    $("#modal_departamento").val(idDepartamentoEmpleado);
                                }
                            }
                        });



                        validarCampos($("#modal_clave_empleado"), validarClave);
                        validarCampos($("#modal_nombre_empleado"), validarNombre);
                        validarCampos($("#modal_apellido_paterno"), validarApellido);
                        validarCampos($("#modal_apellido_materno"), validarApellido);
                        validarCampos($("#modal_imss"), validarNSS);
                        validarCampos($("#modal_curp"), validarCURP);
                        validarCampos($("#modal_grupo_sanguineo"), validarGrupoSanguineo);
                        validarCampos($("#modal_emergencia_nombre"), validarNombre);
                        validarCampos($("#modal_emergencia_ap_paterno"), validarApellido);
                        validarCampos($("#modal_emergencia_ap_materno"), validarApellido);
                        validarCampos($("#modal_emergencia_telefono"), validarTelefono);
                        validarCampos($("#modal_emergencia_parentesco"), validarParentesco);

                        validarDatos($("#modal_clave_empleado"), validarClave);
                        validarDatos($("#modal_nombre_empleado"), validarNombre);
                        validarDatos($("#modal_apellido_paterno"), validarApellido);
                        validarDatos($("#modal_apellido_materno"), validarApellido);
                        validarDatos($("#modal_imss"), validarNSS);
                        validarDatos($("#modal_curp"), validarCURP);
                        validarDatos($("#modal_grupo_sanguineo"), validarGrupoSanguineo);
                        validarDatos($("#modal_emergencia_nombre"), validarNombre);
                        validarDatos($("#modal_emergencia_ap_paterno"), validarApellido);
                        validarDatos($("#modal_emergencia_ap_materno"), validarApellido);
                        validarDatos($("#modal_emergencia_telefono"), validarTelefono);
                        validarDatos($("#modal_emergencia_parentesco"), validarParentesco);

                    }

                },

            });

            // Finalmente mostramos el modal
            $("#modal_actualizar_empleado").modal("show");
        });
    }


    // Evento para enviar el formulario de actualización
    // Se valida que los campos obligatorios no estén vacíos y que los opcionales sean válidos
    // Si hay algún error, se muestra un mensaje de advertencia
    // Si todo es correcto, se envían los datos al servidor para actualizar el empleado
    // y se actualiza la tabla de empleados

    $("#form_modal_actualizar_empleado").submit(function (e) {
        e.preventDefault();

        // Datos del empleado
        let idEmpleado = $("#empleado_id").val();
        let clave = $("#modal_clave_empleado").val();
        let nombre = $("#modal_nombre_empleado").val();
        let apellidoPaterno = $("#modal_apellido_paterno").val();
        let apellidoMaterno = $("#modal_apellido_materno").val();
        let domicilio = $("#modal_domicilio").val();
        let imss = $("#modal_imss").val();
        let curp = $("#modal_curp").val();
        let sexo = $("#modal_sexo").val();
        let grupoSanguineo = $("#modal_grupo_sanguineo").val();
        let enfermedades = $("#modal_enfermedades_alergias").val();
        let fechaIngreso = $("#modal_fecha_ingreso").val();
        let idDepartamento = $("#modal_departamento").val();

        // Datos de emergencia
        let emergenciaNombre = $("#modal_emergencia_nombre").val();
        let emergenciaApPaterno = $("#modal_emergencia_ap_paterno").val();
        let emergenciaApMaterno = $("#modal_emergencia_ap_materno").val();
        let emergenciaTelefono = $("#modal_emergencia_telefono").val();
        let emergenciaDomicilio = $("#modal_emergencia_domicilio").val();
        let emergenciaParentesco = $("#modal_emergencia_parentesco").val();

        // Validaciones obligatorias
        let obligatoriosValidos = (
            validarClave(clave) &&
            validarNombre(nombre) &&
            validarApellido(apellidoPaterno) &&
            validarApellido(apellidoMaterno) &&
            sexo
        );

        let opcionalesValidos = true;
        if (imss && !validarNSS(imss)) opcionalesValidos = false;
        if (curp && !validarCURP(curp)) opcionalesValidos = false;
        if (grupoSanguineo && !validarGrupoSanguineo(grupoSanguineo)) opcionalesValidos = false;
        if (emergenciaNombre && !validarNombre(emergenciaNombre)) opcionalesValidos = false;
        if (emergenciaApPaterno && !validarApellido(emergenciaApPaterno)) opcionalesValidos = false;
        if (emergenciaApMaterno && !validarApellido(emergenciaApMaterno)) opcionalesValidos = false;
        if (emergenciaParentesco && !validarParentesco(emergenciaParentesco)) opcionalesValidos = false;
        if (emergenciaTelefono && !validarTelefono(emergenciaTelefono)) opcionalesValidos = false;


        if (!obligatoriosValidos) {

            VanillaToasts.create({
                title: 'ADVERTENCIA!',
                text: 'Existen campos obligatorios vacíos o incorrectos.',
                type: 'warning', //valores aceptados: success, warning, info, error
                icon: rutaPlugins + 'plugins/toasts/icons/icon_warning.png',
                timeout: 3000, // visible 3 segundos
            });

            return;
        }

        if (!opcionalesValidos) {

            VanillaToasts.create({
                title: 'ADVERTENCIA!',
                text: 'Hay datos opcionales incorrectos.',
                type: 'warning', //valores aceptados: success, warning, info, error
                icon: rutaPlugins + 'plugins/toasts/icons/icon_warning.png',
                timeout: 3000, // visible 3 segundos
            });

            return;
        }
        // Construir objeto con todos los datos, enviando "" si están vacíos
        let datos = {
            id_empleado: idEmpleado,
            clave_empleado: clave,
            nombre_empleado: nombre,
            apellido_paterno_empleado: apellidoPaterno,
            apellido_materno_empleado: apellidoMaterno,
            domicilio_empleado: domicilio || "",
            imss: imss || "",
            curp: curp || "",
            sexo: sexo,
            grupo_sanguineo: grupoSanguineo || "",
            enfermedades_alergias: enfermedades || "",
            fecha_ingreso: fechaIngreso || "",
            id_departamento: idDepartamento || "",
            nombre_contacto: emergenciaNombre || "",
            apellido_paterno_contacto: emergenciaApPaterno || "",
            apellido_materno_contacto: emergenciaApMaterno || "",
            telefono_contacto: emergenciaTelefono || "",
            domicilio_contacto: emergenciaDomicilio || "",
            parentesco: emergenciaParentesco || ""
        };



        $.ajax({
            type: "POST",
            url: "../php/update_empleado.php",
            data: datos,
            success: function (response) {
                //Actualizar la tabla de empleados
                obtenerDatosEmpleados();

                VanillaToasts.create({
                    title: response.title,
                    text: response.text,
                    type: response.type, // 'success', 'info', 'warning', etc.
                    icon: response.icon, // URL del icono
                    timeout: response.timeout // Tiempo de duración en milisegundos
                });

            }
        });

    });


    // Cambiar el Status del Empleado
    $(document).on("click", "#btn_status", function () {
        let idEmpleado = $(this).data("id-empleado");
        let idStatus = $(this).data("id-status");

        let datos = {
            id_empleado: idEmpleado,
            id_status: idStatus,
            accion: "cambiarStatus"
        };

        $.ajax({
            type: "POST",
            url: "../php/obtenerEmpleados.php",
            data: datos,
            success: function (response) {
                if (response == true) {
                    // Actualizar solo los datos sin cambiar la página actual
                    $.ajax({
                        type: "POST",
                        url: "../php/obtenerEmpleados.php",
                        data: {
                            accion: "cargarEmpleados",
                        },
                        dataType: "json",
                        success: function (empleados) {
                            empleadosData = empleados;
                            paginacionStatus(empleadosData);                            
                        }
                    });
                }
            }
        });
    });


});