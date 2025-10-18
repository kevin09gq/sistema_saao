const rutaRaiz = '/sistema_saao/';
const rutaPlugins = '/sistema_saao/';
$(document).ready(function () {
    // Funciones de validación
    validarDatos("#nombre_trabajador", validarNombre);
    validarDatos("#apellido_paterno", validarApellido);
    validarDatos("#apellido_materno", validarApellido);
    validarDatos("#clave_trabajador", validarClave);
    validarDatos("#curp_trabajador", validarCURP);
    validarDatos("#imss_trabajador", validarNSS);
    validarDatos("#grupo_sanguineo_trabajador", validarGrupoSanguineo);
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
    $('#imss_trabajador').on('input', function() {
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

    // Función para actualizar el total de porcentajes de beneficiarios
    function actualizarTotalPorcentaje() {
        let total = 0;
        $('.porcentaje-beneficiario').each(function() {
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
    $(document).on('input', '.porcentaje-beneficiario', function() {
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
    $(document).on('click', '#btn_cancelar_form', function(e) {
        e.preventDefault();
        limpiarFormulario();
        
        // Mostrar mensaje de confirmación
        VanillaToasts.create({
            title: 'Formulario Limpiado',
            text: 'Todos los campos han sido vaciados.',
            type: 'info',
            icon: rutaPlugins + 'plugins/toasts/icons/icon_info.png',
            timeout: 2000
        });
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


    // Función para limpiar el formulario después de un registro exitoso
    function limpiarFormulario() {
        // Limpiar campos de texto
        $("#clave_trabajador, #nombre_trabajador, #apellido_paterno, #apellido_materno").val("");
        $("#domicilio_trabajador, #imss_trabajador, #curp_trabajador, #grupo_sanguineo_trabajador").val("");
        $("#enfermedades_alergias_trabajador, #fecha_ingreso_trabajador, #num_casillero, #fecha_nacimiento").val("");
        
        // Limpiar campos de salario
        $("#salario_semanal, #salario_mensual").val("");
        $("#biometrico").val("");
        $("#telefono_empleado").val("");
        
        // Limpiar campos de contacto de emergencia
        $("#nombre_emergencia, #ap_paterno_emergencia, #ap_materno_emergencia").val("");
        $("#parentesco_emergencia, #telefono_emergencia, #domicilio_emergencia").val("");
        
        // Resetear selects a su opción por defecto
        $("#sexo_trabajador").val("");
        $("#departamento_trabajador").val("");
        $("#area_trabajador").val("");
        $("#puesto_trabajador").val("");
        $("#empresa_trabajador").val("");
        
        // Remover clases de validación
        $("input, select, textarea").removeClass('border-success border-danger');
        
        // Opcional: hacer scroll hacia arriba del formulario
        $("html, body").animate({ scrollTop: 0 }, 500);
    }

    // Asocia el evento submit al formulario (correcto para enviar datos después)
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
            const id_puestoEspecial = $("#puesto_trabajador").val(); // Cambiado de id_puesto a id_puestoEspecial
            const id_empresa = $("#empresa_trabajador").val();
            const fecha_nacimiento = $("#fecha_nacimiento").val();
            const telefono_empleado = $("#telefono_empleado").val().trim();
            
            // Campos de salario (opcionales)
            const salario_diario = $("#salario_semanal").val().trim();
            const salario_mensual = $("#salario_mensual").val().trim();

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
            $('.porcentaje-beneficiario').each(function() {
                const valor = parseFloat($(this).val()) || 0;
                if (valor > 0) {
                    hayBeneficiarios = true;
                    totalPorcentaje += valor;
                }
            });

            if (hayBeneficiarios && totalPorcentaje !== 100) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Error en porcentajes',
                        text: `El total de porcentajes de beneficiarios debe ser exactamente 100%. Actual: ${totalPorcentaje}%`,
                        icon: 'error',
                        confirmButtonText: 'Entendido'
                    });
                } else {
                    alert(`El total de porcentajes de beneficiarios debe ser exactamente 100%. Actual: ${totalPorcentaje}%`);
                }
                return false;
            }

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
            if (telefono_empleado && !validarTelefono(telefono_empleado)) opcionalesValidos = false;
            if (emergencia_nombre && !validarNombre(emergencia_nombre)) opcionalesValidos = false;
            if (emergencia_ap_paterno && !validarApellido(emergencia_ap_paterno)) opcionalesValidos = false;
            if (emergencia_ap_materno && !validarApellido(emergencia_ap_materno)) opcionalesValidos = false;
            if (emergencia_parentesco && !validarParentesco(emergencia_parentesco)) opcionalesValidos = false;
            if (emergencia_telefono && !validarTelefono(emergencia_telefono)) opcionalesValidos = false;

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
                id_puestoEspecial: id_puestoEspecial || "", // Cambiado de id_puesto a id_puestoEspecial
                id_empresa: id_empresa || "",
                telefono_empleado: telefono_empleado || "",
                
                // Campo de estatus NSS
                status_nss: $('#status_nss').is(':checked') ? 1 : 0,

                // Campos de salario
                salario_diario: salario_diario || "",
                salario_mensual: salario_mensual || "",

                emergencia_nombre: emergencia_nombre || "",
                emergencia_ap_paterno: emergencia_ap_paterno || "",
                emergencia_ap_materno: emergencia_ap_materno || "",
                emergencia_parentesco: emergencia_parentesco || "",
                emergencia_telefono: emergencia_telefono || "",
                emergencia_domicilio: emergencia_domicilio || "",

                // Datos de beneficiarios
                beneficiarios: beneficiarios
            };

            $.ajax({
                type: "POST",
                url: "../php/registro_empleado.php",
                data: datos,
                success: function (response) {
                    try {
                        // Intentar parsear la respuesta como JSON
                        let respuesta = typeof response === 'string' ? JSON.parse(response) : response;
                        
                        // Mostrar el toast con la respuesta del servidor
                        VanillaToasts.create({
                            title: respuesta.title,
                            text: respuesta.text,
                            type: respuesta.type,
                            icon: respuesta.icon,
                            timeout: respuesta.timeout
                        });
                        
                        // Si el registro fue exitoso, limpiar el formulario
                        if (respuesta.success) {
                            limpiarFormulario();
                        }
                    } catch (e) {
                        // Si no es JSON válido, mostrar mensaje de error
                        VanillaToasts.create({
                            title: 'ERROR',
                            text: 'Error en la respuesta del servidor.',
                            type: 'error',
                            icon: rutaPlugins + 'plugins/toasts/icons/icon_error.png',
                            timeout: 3000
                        });
                        
                        
                    }
                },
                error: function (xhr, status, error) {
                    VanillaToasts.create({
                        title: 'ERROR',
                        text: 'Error de conexión con el servidor.' + error,
                        type: 'error',
                        icon: rutaPlugins + 'plugins/toasts/icons/icon_error.png',
                        timeout: 3000
                    });
                    console.error("Error en la solicitud AJAX:", status, error);
                }
            });
        })
    }

});