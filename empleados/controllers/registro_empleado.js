const rutaRaiz = '/sistema_saao/';

// Manejar los horarios fijos o variables
const $switch = $("#switchCheckHorarioFijo");
const $tab = $("#tab-horarios");

$(document).ready(function () {
    // Funciones de validación
    validarDatos("#nombre_trabajador", validarNombre);
    validarDatos("#apellido_paterno", validarApellido);
    validarDatos("#apellido_materno", validarApellido);
    validarDatos("#clave_trabajador", validarClave);
    validarDatos("#curp_trabajador", validarCURP);
    validarDatos("#imss_trabajador", validarNSS);
    validarDatos("#grupo_sanguineo_trabajador", validarGrupoSanguineo);
    validarDatos("#rfc_trabajador", validarRFCfisica);
    validarDatos("#nombre_emergencia", validarNombre);
    validarDatos("#ap_paterno_emergencia", validarApellido);
    validarDatos("#ap_materno_emergencia", validarApellido);
    validarDatos("#parentesco_emergencia", validarParentesco);
    validarDatos("#telefono_emergencia", validarTelefono);
    validarDatos("#telefono_empleado", validarTelefono);

    // Validar campos de beneficiarios
    $('input[name="beneficiario_nombre[]"]').each(function () {
        validarDatos(this, validarNombre);
    });
    $('input[name="beneficiario_ap_paterno[]"]').each(function () {
        validarDatos(this, validarApellido);
    });
    $('input[name="beneficiario_ap_materno[]"]').each(function () {
        validarDatos(this, validarApellido);
    });
    $('input[name="beneficiario_parentesco[]"]').each(function () {
        validarDatos(this, validarParentesco);
    });

    // Funcionalidad para el switch de estatus NSS
    $('#imss_trabajador').on('input', function () {
        const imssValue = $(this).val().trim();
        if (imssValue === '') {
            $('#status_nss').prop('disabled', true).prop('checked', false);
        } else {
            $('#status_nss').prop('disabled', false);
        }
    });

    // Formatear campos a mayúsculas mientras el usuario escribe
    formatearMayusculas("#nombre_trabajador");
    formatearMayusculas("#apellido_paterno");
    formatearMayusculas("#apellido_materno");
    formatearMayusculas("#curp_trabajador");
    formatearMayusculas("#grupo_sanguineo_trabajador");
    formatearMayusculas("#rfc_trabajador");

    // Formatear campos del contacto de emergencia a mayúsculas
    formatearMayusculas("#nombre_emergencia");
    formatearMayusculas("#ap_paterno_emergencia");
    formatearMayusculas("#ap_materno_emergencia");
    formatearMayusculas("#parentesco_emergencia");

    // Formatear campos de beneficiarios a mayúsculas
    $('input[name="beneficiario_nombre[]"]').each(function () {
        formatearMayusculas(this);
    });
    $('input[name="beneficiario_ap_paterno[]"]').each(function () {
        formatearMayusculas(this);
    });
    $('input[name="beneficiario_ap_materno[]"]').each(function () {
        formatearMayusculas(this);
    });
    $('input[name="beneficiario_parentesco[]"]').each(function () {
        formatearMayusculas(this);
    });

    // Formatear campos del dia de horario
    $('input[name="horario_dia[]"]').each(function () {
        formatearMayusculas(this);
    });

    // Función para actualizar el total de porcentajes de beneficiarios
    function actualizarTotalPorcentaje() {
        let total = 0;
        $('.porcentaje-beneficiario').each(function () {
            const valor = parseFloat($(this).val()) || 0;
            total += valor;
        });

        // Actualizar el campo de total
        $('#total_porcentaje_beneficiarios').val(total.toFixed(2));

        // Resaltar en rojo si no es 100%
        if (total > 0 && total !== 100) {
            $('#total_porcentaje_beneficiarios').addClass('is-invalid');
        } else {
            $('#total_porcentaje_beneficiarios').removeClass('is-invalid');
        }

        return total;
    }

    // Escuchar cambios en los inputs de porcentaje
    $(document).on('input', '.porcentaje-beneficiario', function () {
        // Asegurarse de que el valor esté entre 0 y 100
        let valor = parseFloat($(this).val()) || 0;
        if (valor < 0) valor = 0;
        if (valor > 100) valor = 100;
        $(this).val(valor);

        actualizarTotalPorcentaje();
    });

    // Inicializar el total al cargar la página
    actualizarTotalPorcentaje();

    // Cargar departamentos al iniciar
    obtenerDepartamentos();
    obtenerAreas();
    obtenerEmpresa();
    registrarEmpleado();
    obtenerPuesto();


    // Agregar funcionalidad al botón cancelar
    $(document).on('click', '#btn_cancelar_form', function (e) {
        e.preventDefault();
        limpiarFormulario();


    });

    $(document).on('input', '#salario_semanal', function () {
        const val = parseFloat($(this).val());
        if (isNaN(val)) {
            $('#salario_diario').val('');
        } else {
            const diario = val / 7;
            $('#salario_diario').val(diario.toFixed(2));
        }
    });

    function validarDatos(selector, validacion) {
        $(selector).on('input', function () {
            const isValid = validacion($(this).val());
            $(this).removeClass('border-success border-danger')
                .addClass(isValid ? 'border-success' : 'border-danger');
        });
    };

    // Función para formatear texto a mayúsculas mientras se escribe
    function formatearMayusculas(selector) {
        $(selector).on('input', function () {
            // Obtener la posición actual del cursor
            const cursorPosition = this.selectionStart;
            // Convertir el valor a mayúsculas
            const valorMayusculas = $(this).val().toUpperCase();
            // Establecer el nuevo valor
            $(this).val(valorMayusculas);
            // Restaurar la posición del cursor
            this.setSelectionRange(cursorPosition, cursorPosition);
        });
    };

    // ---------------------------------------
    // Funciones para obtener datos de selects
    // ---------------------------------------

    //Funcion para obtener los departamentos
    function obtenerDepartamentos() {
        $.ajax({
            type: "GET",
            url: rutaRaiz + "public/php/obtenerDepartamentos.php",
            success: function (response) {
                let departamentos = JSON.parse(response);
                let opciones = `<option value="">Selecciona un departamento</option>`;

                departamentos.forEach((element) => {
                    opciones += `
        <option value="${element.id_departamento}">${element.nombre_departamento}</option>
      `;
                });

                // Asegúrate de usar el ID correcto del select
                $("#departamento_trabajador").html(opciones);
            },
            error: function () {

            }
        });
    }

    //Funcion para obtener las Areas
    function obtenerAreas() {
        $.ajax({
            type: "GET",
            url: rutaRaiz + "public/php/obtenerAreas.php",
            success: function (response) {
                let areas = JSON.parse(response);
                let opciones = `<option value="">Selecciona un área</option>`;

                areas.forEach((element) => {
                    opciones += `
                                 <option value="${element.id_area}">${element.nombre_area}</option>
                                     `;
                });

                // Asegúrate de usar el ID correcto del select
                $("#area_trabajador").html(opciones);
            },
            error: function () {

            }
        });
    }

    //Funcion para obtener las Areas
    function obtenerEmpresa() {
        $.ajax({
            type: "GET",
            url: rutaRaiz + "public/php/obtenerEmpresa.php",
            success: function (response) {
                let empresas = JSON.parse(response);
                let opciones = `<option value="">Selecciona una empresa</option>`;

                empresas.forEach((element) => {
                    opciones += `
                                 <option value="${element.id_empresa}">${element.nombre_empresa}</option>
                                     `;
                });

                // Asegúrate de usar el ID correcto del select
                $("#empresa_trabajador").html(opciones);
            },
            error: function () {

            }
        });
    }

    //Funcion para obtener las Areas
    function obtenerPuesto() {
        $.ajax({
            type: "GET",
            url: rutaRaiz + "public/php/obtenerPuestos.php",
            success: function (response) {
                let puestos = JSON.parse(response);
                let opciones = `<option value="">Selecciona un puesto</option>`;

                puestos.forEach((element) => {
                    opciones += `
                                 <option value="${element.id_puestoEspecial}">${element.nombre_puesto}</option>
                                     `;
                });

                // Asegúrate de usar el ID correcto del select
                $("#puesto_trabajador").html(opciones);
            },
            error: function () {

            }
        });
    }

    // ====================================================================================================================================
    // ====================================================================================================================================

    // ==========================================
    // Funciones para registrar un nuevo empleado
    // ==========================================

    function registrarEmpleado() {
        $("#form_registro_empleado").on("submit", function (e) {
            e.preventDefault();

            // Campos obligatorios
            const clave_empleado = $("#clave_trabajador").val().trim();
            const nombre = $("#nombre_trabajador").val().trim();
            const ap_paterno = $("#apellido_paterno").val().trim();
            const ap_materno = $("#apellido_materno").val().trim();
            const sexo = $("#sexo_trabajador").val();

            // Campos opcionales
            const domicilio = $("#domicilio_trabajador").val().trim();
            const imss = $("#imss_trabajador").val().trim();
            const curp = $("#curp_trabajador").val().trim();
            const grupo_sanguineo = $("#grupo_sanguineo_trabajador").val().trim();
            const enfermedades_alergias = $("#enfermedades_alergias_trabajador").val().trim();
            const fecha_ingreso = $("#fecha_ingreso_trabajador").val();
            const id_departamento = $("#departamento_trabajador").val();
            const num_casillero = $("#num_casillero").val().trim();
            const biometrico = $("#biometrico").val().trim();

            // Nuevos campos opcionales
            const id_area = $("#area_trabajador").val();
            const id_puestoEspecial = $("#puesto_trabajador").val();
            const id_empresa = $("#empresa_trabajador").val();
            const fecha_nacimiento = $("#fecha_nacimiento").val();
            const telefono_empleado = $("#telefono_empleado").val().trim();
            const rfc = $("#rfc_trabajador").val().trim();
            const estado_civil = $("#estado_civil_trabajador").val();

            // Campos de salario (opcionales)
            const salario_semanal = $("#salario_semanal").val().trim();
            const salario_diario = $("#salario_diario").val().trim();

            // Datos de emergencia (opcionales)
            const emergencia_nombre = $("#nombre_emergencia").val().trim();
            const emergencia_ap_paterno = $("#ap_paterno_emergencia").val().trim();
            const emergencia_ap_materno = $("#ap_materno_emergencia").val().trim();
            const emergencia_parentesco = $("#parentesco_emergencia").val().trim();
            const emergencia_telefono = $("#telefono_emergencia").val().trim();
            const emergencia_domicilio = $("#domicilio_emergencia").val().trim();

            // Obtener datos de beneficiarios
            let beneficiarios = [];
            $('input[name="beneficiario_nombre[]"]').each(function (index) {
                const nombre = $(this).val().trim();
                const ap_paterno = $('input[name="beneficiario_ap_paterno[]"]').eq(index).val().trim();
                const ap_materno = $('input[name="beneficiario_ap_materno[]"]').eq(index).val().trim();
                const parentesco = $('input[name="beneficiario_parentesco[]"]').eq(index).val().trim();
                const porcentaje = $('input[name="beneficiario_porcentaje[]"]').eq(index).val().trim();

                // Solo agregar beneficiarios que tengan al menos un campo lleno
                if (nombre || ap_paterno || ap_materno || parentesco || porcentaje) {
                    beneficiarios.push({
                        nombre: nombre || "",
                        ap_paterno: ap_paterno || "",
                        ap_materno: ap_materno || "",
                        parentesco: parentesco || "",
                        porcentaje: porcentaje || ""
                    });
                }
            });

            // Validar que el total de porcentajes de beneficiarios sea 100% si hay al menos un beneficiario con porcentaje > 0
            let totalPorcentaje = 0;
            let hayBeneficiarios = false;
            $('.porcentaje-beneficiario').each(function () {
                const valor = parseFloat($(this).val()) || 0;
                if (valor > 0) {
                    hayBeneficiarios = true;
                    totalPorcentaje += valor;
                }
            });

            if (hayBeneficiarios && totalPorcentaje !== 100) {
                Swal.fire({
                    title: 'Error en porcentajes',
                    text: `El total de porcentajes de beneficiarios debe ser exactamente 100%. Actual: ${totalPorcentaje}%`,
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
                return false;
            }


            // Recoger los datos del horario
            let horarios = [];
            $('select[name="horario_dia[]"]').each(function (index) {
                const dia = $(this).val().trim();
                const entrada = $('input[name="horario_entrada[]"]').eq(index).val().trim();
                const salida_comida = $('input[name="horario_salida_comida[]"]').eq(index).val().trim();
                const entrada_comida = $('input[name="horario_entrada_comida[]"]').eq(index).val().trim();
                const salida = $('input[name="horario_salida[]"]').eq(index).val().trim();
                const descanso = $('input[name="horario_descanso[]"]').eq(index).is(':checked') ? 1 : 0;

                // Solo agregar si al menos un campo tiene valor
                if (dia || entrada || salida_comida || entrada_comida || salida) {
                    horarios.push({
                        dia: dia || "",
                        entrada: entrada || "",
                        salida_comida: salida_comida || "",
                        entrada_comida: entrada_comida || "",
                        salida: salida || "",
                        descanso: descanso
                    });
                }
            });

            // Validar si el horario es fijo o variable
            let horario_fijo = $("#switchCheckHorarioFijo").is(":checked") ? 1 : 0;

            if (horario_fijo == 0) {
                horarios = []; // Si es variable, no enviar horarios predefinidos
            }

            // =================================
            // Obtener datos del horario oficial
            // =================================
            let horarios_oficiales = [];
            $('select[name="horario_oficial_dia[]"]').each(function (index) {
                const dia = $(this).val().trim();
                const entrada = $('input[name="horario_oficial_entrada[]"]').eq(index).val().trim();
                const salida_comida = $('input[name="horario_oficial_salida_comida[]"]').eq(index).val().trim();
                const entrada_comida = $('input[name="horario_oficial_entrada_comida[]"]').eq(index).val().trim();
                const salida = $('input[name="horario_oficial_salida[]"]').eq(index).val().trim();

                // Solo agregar si al menos un campo tiene valor
                if (dia || entrada || salida_comida || entrada_comida || salida) {
                    horarios_oficiales.push({
                        dia: dia || "",
                        entrada: entrada || "",
                        salida_comida: salida_comida || "",
                        entrada_comida: entrada_comida || "",
                        salida: salida || ""
                    });
                }
            });

            // Validaciones obligatorias
            let obligatoriosValidos = (
                validarClave(clave_empleado) &&
                validarNombre(nombre) &&
                validarApellido(ap_paterno) &&
                validarApellido(ap_materno) &&
                sexo
            );

            // Validaciones opcionales (solo si tienen valor)
            let opcionalesValidos = true;
            if (imss && !validarNSS(imss)) opcionalesValidos = false;
            if (curp && !validarCURP(curp)) opcionalesValidos = false;
            if (grupo_sanguineo && !validarGrupoSanguineo(grupo_sanguineo)) opcionalesValidos = false;
            if (rfc && !validarRFCfisica(rfc)) opcionalesValidos = false;
            if (telefono_empleado && !validarTelefono(telefono_empleado)) opcionalesValidos = false;
            if (emergencia_nombre && !validarNombre(emergencia_nombre)) opcionalesValidos = false;
            if (emergencia_ap_paterno && !validarApellido(emergencia_ap_paterno)) opcionalesValidos = false;
            if (emergencia_ap_materno && !validarApellido(emergencia_ap_materno)) opcionalesValidos = false;
            if (emergencia_parentesco && !validarParentesco(emergencia_parentesco)) opcionalesValidos = false;
            if (emergencia_telefono && !validarTelefono(emergencia_telefono)) opcionalesValidos = false;

            if (!obligatoriosValidos) {
                Swal.fire({
                    title: 'ADVERTENCIA!',
                    text: 'Existen campos obligatorios vacíos o incorrectos.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            if (!opcionalesValidos) {
                Swal.fire({
                    title: 'ADVERTENCIA!',
                    text: 'Hay datos opcionales incorrectos.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            // Construir objeto con todos los datos, enviando "" si están vacíos
            let datos = {
                clave_empleado,
                nombre,
                ap_paterno,
                ap_materno,
                sexo,
                domicilio: domicilio || "",
                imss: imss || "",
                curp: curp || "",
                grupo_sanguineo: grupo_sanguineo || "",
                enfermedades_alergias: enfermedades_alergias || "",
                fecha_ingreso: fecha_ingreso || "",
                id_departamento: id_departamento || "",
                num_casillero: num_casillero || "",
                biometrico: biometrico || "",

                // Nuevos campos opcionales
                fecha_nacimiento: fecha_nacimiento || "",
                id_area: id_area || "",
                id_puestoEspecial: id_puestoEspecial || "",
                id_empresa: id_empresa || "",
                telefono_empleado: telefono_empleado || "",
                rfc: rfc || "",
                estado_civil: estado_civil || "",

                // Campo de estatus NSS
                status_nss: $('#status_nss').is(':checked') ? 1 : 0,

                // Campos de salario
                salario_semanal: salario_semanal || "",
                salario_diario: salario_diario || "",

                emergencia_nombre: emergencia_nombre || "",
                emergencia_ap_paterno: emergencia_ap_paterno || "",
                emergencia_ap_materno: emergencia_ap_materno || "",
                emergencia_parentesco: emergencia_parentesco || "",
                emergencia_telefono: emergencia_telefono || "",
                emergencia_domicilio: emergencia_domicilio || "",

                // Datos de beneficiarios
                beneficiarios: beneficiarios,

                // Datos de horarios y saber si es fijo o variable
                horarios: horarios,
                horario_fijo: horario_fijo,

                // Datos de horarios oficiales
                horarios_oficiales: horarios_oficiales
            }; // Aqui agregue el turno BHL 

            $.ajax({
                type: "POST",
                url: "../php/registro_empleado.php",
                data: datos,
                success: function (response) {
                    try {
                        // Verificar si la respuesta ya es un objeto o necesita parsing
                        let respuesta;
                        if (typeof response === 'string') {
                            respuesta = JSON.parse(response);
                        } else {
                            respuesta = response;
                        }

                        // Mostrar el toast con la respuesta del servidor
                        Swal.fire({
                            title: respuesta.title || 'Operación completada',
                            text: respuesta.text || respuesta.message || 'Operación realizada correctamente',
                            icon: respuesta.type === 'success' ? 'success' : (respuesta.type === 'warning' ? 'warning' : 'error'),
                            confirmButtonText: 'Aceptar',
                            timer: respuesta.timeout || 3000,
                            timerProgressBar: true
                        });

                        // Si el registro fue exitoso, limpiar el formulario
                        if (respuesta.success === true || respuesta.type === 'success') {
                            limpiarFormulario();
                        }
                    } catch (e) {

                        Swal.fire({
                            title: 'Registro completado',
                            text: 'El empleado fue registrado correctamente.',
                            icon: 'success',
                            confirmButtonText: 'Aceptar',
                            timer: 3000,
                            timerProgressBar: true
                        });

                        // Limpiar formulario ya que el registro fue exitoso
                        limpiarFormulario();
                    }
                },
                error: function (xhr, status, error) {
                    Swal.fire({
                        title: 'ERROR',
                        text: 'Error de conexión con el servidor.' + error,
                        type: 'error',
                        timeout: 3000
                    });
                }
            });
        })
    }

    // Función para limpiar el formulario después de un registro exitoso BHL
    function limpiarFormulario() {
        // Limpiar campos de texto
        $("#clave_trabajador, #nombre_trabajador, #apellido_paterno, #apellido_materno").val("");
        $("#domicilio_trabajador, #imss_trabajador, #curp_trabajador, #grupo_sanguineo_trabajador").val("");
        $("#enfermedades_alergias_trabajador, #fecha_ingreso_trabajador, #num_casillero, #fecha_nacimiento").val("");
        $("#rfc_trabajador").val("");

        // Limpiar campos de salario
        $("#salario_semanal, #salario_diario").val("");
        $("#biometrico").val("");
        $("#telefono_empleado").val("");

        // Limpiar campos de contacto de emergencia
        $("#nombre_emergencia, #ap_paterno_emergencia, #ap_materno_emergencia").val("");
        $("#parentesco_emergencia, #telefono_emergencia, #domicilio_emergencia").val("");

        // Limpiar campos de beneficiarios
        $('input[name="beneficiario_nombre[]"]').val("");
        $('input[name="beneficiario_ap_paterno[]"]').val("");
        $('input[name="beneficiario_ap_materno[]"]').val("");
        $('input[name="beneficiario_parentesco[]"]').val("");
        $('input[name="beneficiario_porcentaje[]"]').val("");

        // Resetear selects a su opción por defecto
        $("#sexo_trabajador").val("");
        $("#estado_civil_trabajador").val("");
        $("#departamento_trabajador").val("");
        $("#area_trabajador").val("");
        $("#puesto_trabajador").val("");
        $("#empresa_trabajador").val("");
        $("#turno_trabajador").val("");
        $("#turno_trabajador_sabado").val("");

        // Remover clases de validación
        $("input, select, textarea").removeClass('border-success border-danger');

        // Opcional: hacer scroll hacia arriba del formulario
        $("html, body").animate({ scrollTop: 0 }, 500);

        // Resetear el switch de status NSS
        $("#status_nss").prop("disabled", true).prop("checked", false);

        // Limpiar campos de horarios
        $('input[name="horario_dia[]"]').val("");
        $('input[name="horario_entrada[]"]').val("");
        $('input[name="horario_salida_comida[]"]').val("");
        $('input[name="horario_entrada_comida[]"]').val("");
        $('input[name="horario_salida[]"]').val("");

        // Limpiar campos de horarios oficiales
        $('input[name="horario_oficial_dia[]"]').val("");
        $('input[name="horario_oficial_entrada[]"]').val("");
        $('input[name="horario_oficial_salida_comida[]"]').val("");
        $('input[name="horario_oficial_entrada_comida[]"]').val("");
        $('input[name="horario_oficial_salida[]"]').val("");


        // Actualizar el total de porcentajes después de limpiar
        actualizarTotalPorcentaje();
    }

    // ====================================================================================================================================
    // ====================================================================================================================================

    // ============================================================
    // Manejar el cambio del switch para horarios fijos o variables
    // ============================================================

    $switch.on("change", function () {
        if ($(this).is(":checked")) {
            $tab.prop("disabled", false); // habilita el tab
        } else {
            $tab.prop("disabled", true);
            // deshabilita el tab
        }
    });

    // ====================================================================================================================================
    // ====================================================================================================================================

    // ============================================================
    // Todos los eventos relacionados con los Horiarios Biometricos
    // ============================================================
    $(document).on('click', '#btnCopiarHorarios', function () {
        // Obtener valores del formulario de referencia
        const entrada = $('#ref_entrada').val();
        const salidaComida = $('#ref_salida_comida').val();
        const entradaComida = $('#ref_entrada_comida').val();
        const salida = $('#ref_salida').val();

        // Copiar a las primeras 6 filas
        $('#tbody_horarios tr').each(function (index) {
            if (index < 7) { // solo las primeras 6 filas
                $(this).find('input[name="horario_entrada[]"]').val(entrada);
                $(this).find('input[name="horario_salida_comida[]"]').val(salidaComida);
                $(this).find('input[name="horario_entrada_comida[]"]').val(entradaComida);
                $(this).find('input[name="horario_salida[]"]').val(salida);
            }
        });
    });

    $(document).on('change', '.chk-descanso', function (e) {
        e.preventDefault();

        // referencia a la fila donde está el checkbox
        let $fila = $(this).closest('tr');

        if ($(this).is(':checked')) {
            // limpiar todos los inputs de hora en esa fila
            $fila.find('input[type="time"]').val('');
        }
    });


    // ====================================================================================================================================
    // ====================================================================================================================================

    // =================================================
    // Evento para copiar horarios de Oficiales
    // =================================================
    $(document).on('click', '#btnCopiarHorariosOficial', function () {
        // Obtener valores del formulario de referencia
        const entrada = $('#ref_entrada_oficial').val();
        const salidaComida = $('#ref_salida_comida_oficial').val();
        const entradaComida = $('#ref_entrada_comida_oficial').val();
        const salida = $('#ref_salida_oficial').val();

        // Copiar a las primeras 6 filas
        $('#tbody_horarios_oficiales tr').each(function (index) {
            if (index < 7) { // solo las primeras 6 filas
                $(this).find('input[name="horario_oficial_entrada[]"]').val(entrada);
                $(this).find('input[name="horario_oficial_salida_comida[]"]').val(salidaComida);
                $(this).find('input[name="horario_oficial_entrada_comida[]"]').val(entradaComida);
                $(this).find('input[name="horario_oficial_salida[]"]').val(salida);
            }
        });
    });

});