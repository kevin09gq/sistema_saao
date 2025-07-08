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

    // Cargar departamentos al iniciar
    obtenerDepartamentos();
    registrarEmpleado();


    function validarDatos(selector, validacion) {
        $(selector).on('input', function () {
            const isValid = validacion($(this).val());
            $(this).removeClass('border-success border-danger')
                .addClass(isValid ? 'border-success' : 'border-danger');
        });
    };


    //Funcion para obtener los departamentos
    function obtenerDepartamentos() {
        $.ajax({
            type: "GET",
            url: "../php/obtenerDepartamentos.php",
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
                console.error("Error al cargar departamentos");
            }
        });
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

            // Datos de emergencia (opcionales)
            const emergencia_nombre = $("#nombre_emergencia").val().trim();
            const emergencia_ap_paterno = $("#ap_paterno_emergencia").val().trim();
            const emergencia_ap_materno = $("#ap_materno_emergencia").val().trim();
            const emergencia_parentesco = $("#parentesco_emergencia").val().trim();
            const emergencia_telefono = $("#telefono_emergencia").val().trim();
            const emergencia_domicilio = $("#domicilio_emergencia").val().trim();

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
            if (emergencia_nombre && !validarNombre(emergencia_nombre)) opcionalesValidos = false;
            if (emergencia_ap_paterno && !validarApellido(emergencia_ap_paterno)) opcionalesValidos = false;
            if (emergencia_ap_materno && !validarApellido(emergencia_ap_materno)) opcionalesValidos = false;
            if (emergencia_parentesco && !validarParentesco(emergencia_parentesco)) opcionalesValidos = false;
            if (emergencia_telefono && !validarTelefono(emergencia_telefono)) opcionalesValidos = false;

            if (!obligatoriosValidos) {
                console.log("Existen campos obligatorios vacíos o incorrectos.");
                return;
            }

            if (!opcionalesValidos) {
                console.log("Hay datos opcionales incorrectos.");
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
                emergencia_nombre: emergencia_nombre || "",
                emergencia_ap_paterno: emergencia_ap_paterno || "",
                emergencia_ap_materno: emergencia_ap_materno || "",
                emergencia_parentesco: emergencia_parentesco || "",
                emergencia_telefono: emergencia_telefono || "",
                emergencia_domicilio: emergencia_domicilio || ""
            };

          
            

          $.ajax({
                type: "POST",
                url: "../php/registro_empleado.php",
                data: datos,
                success: function (response) {
                    if (!response.error) {
                        console.log(response);
                    }
                }
            });
        })
    }

});