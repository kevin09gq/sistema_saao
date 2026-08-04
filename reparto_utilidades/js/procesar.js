// ================================================================================================
// EVENTO: HABILITAR O DESHABILITAR INPUT DE SALARIO MANUAL
// ================================================================================================
$(document).on('change', '#usar_salario_manual', function (e) {
    e.preventDefault();
    // Si el checkbox está marcado, habilitar el input
    if ($(this).is(':checked')) {
        $('#salario_manual').prop('disabled', false);
    } else {
        // Si el checkbox no está marcado, deshabilitar el input y limpiar su valor
        $('#salario_manual').prop('disabled', true).val('');
    }
});

// ================================================================================================
// EVENTO: COMENZO EL PROCESO PARA LA PTU DEL AÑO Y DEPARTAMENTO SELECCIONADO
// ================================================================================================
$(document).on('click', '#btn_procesar_ptu', function (e) {
    e.preventDefault();

    // OBTENER EL AÑO SELECCIONADO
    let anio = $("#anio").val().trim();
    // VALIDAR QUE SE HAYA SELECCIONADO UN AÑO
    if (!anio) {
        alerta('info', 'Año requerido', 'Por favor, selecciona un año para procesar la PTU.');
        return;
    }

    // OBTENER EL DEPARTAMENTO SELECCIONADO
    let id_departamento = $("#departamento_configuracion").val();
    // VALIDAR QUE SE HAYA SELECCIONADO UN DEPARTAMENTO
    if (!id_departamento || id_departamento === "-1") {
        alerta('info', 'Departamento requerido', 'Por favor, selecciona un departamento para procesar la PTU.');
        return;
    }

    // RECUPERAR DIAS DE UTILIDAD
    // Si el input de días de utilidad está vacío, usar un valor por defecto (ej. 7 días)
    let dias_utilidad = $("#dias_utilidad").val().trim() || 7;

    // VALIDAR EL SUELDO MANUAL SI ESTÁ HABILITADO
    let usar_salario_manual = $("#usar_salario_manual").is(':checked');
    let salario_manual = null;

    if (usar_salario_manual) {
        salario_manual = $("#salario_manual").val().trim();
        if (!salario_manual) {
            alerta('info', 'Salario manual requerido', 'Por favor, ingresa un salario manual para procesar la PTU.');
            return;
        }
        // Validar que el salario manual sea un número positivo
        if (isNaN(salario_manual) || Number(salario_manual) <= 0) {
            alerta('info', 'Salario manual inválido', 'Por favor, ingresa un salario manual válido (número positivo).');
            return;
        }
    }

    // console.log("COMIENZA EL PROCESO DE LA PTU...", anio, id_departamento, dias_utilidad, usar_salario_manual, salario_manual);

    // Mostrar alerta de carga
    Swal.fire({
        title: 'PROCESANDO INFORMACIÓN...',
        html: 'ESPERE UN MOMENTO.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: (modal) => {
            Swal.showLoading();
        }
    });

    setTimeout(() => {

        // console.log("SE CONTINUA DESPUES DE UNA PEQUEÑA PAUSA");

        validar_existe_utilidad(anio, id_departamento, dias_utilidad, usar_salario_manual, salario_manual);


    }, 1500);
});


/**
 * Función para validar si ya existe un cálculo de aguinaldo para el año ingresado
 * @param {number} anio Año a validar
 * @param {number} id_departamento ID del departamento seleccionado
 * @param {number} dias_pago Número de días de pago
 * @param {boolean} usar_manual Indica si se debe usar el salario manual
 * @param {Array} salario Array con los tipos de salario y montos manuales por departamento
 */
function validar_existe_utilidad(anio, id_departamento, dias_pago, usar_manual, salario) {
    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/reparto_utilidades/php/utilidades.php",
        data: {
            accion: "existe_utilidad",
            anio: anio,
            id_departamento: id_departamento
        },
        dataType: "json",
        success: function (response) {
            // CERRAR PRIMERA ALERTA DE CARGA
            Swal.close();

            let respuesta = response;

            if (respuesta.texto == "existe") {

                Swal.fire({
                    title: "Registro existente encontrado",
                    text: "¿Desea utilizar el registro existente o iniciar uno nuevo?",
                    icon: "question",
                    showCancelButton: false,
                    showDenyButton: true,
                    confirmButtonText: "Usar existente",
                    denyButtonText: "Iniciar nuevo",
                    confirmButtonColor: "#3085d6",
                    denyButtonColor: "#6c757d"
                }).then((result) => {
                    if (result.isConfirmed) {

                        // // MOSTRAR ALERTA DE CARGA DE RECUPERACIÓN DE DATOS
                        Swal.fire({
                            title: 'RECUPERANDO DATOS...',
                            html: 'OBTENIENDO INFORMACIÓN DE LA BASE DE DATOS.',
                            icon: 'info',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            didOpen: (modal) => {
                                Swal.showLoading();
                            }
                        });

                        // // HACER UNA PAUSA VISUAL
                        setTimeout(() => {
                            // CERRAR LA ALERTA DE CARGA
                            Swal.close();

                            // YA EXISTEN DATOS GUARDADOS EN LA BASE DE DATOS PARA EL AÑO INGRESADO
                            setUtilidad(respuesta.data);
                            // Se llena la tabla con los datos obtenidos del storage
                            llenar_tabla_ptu();
                            // Llamar departamentos para llenar los selects
                            obtener_departamentos();
                            // Se muestra la tabla y se oculta el formulario
                            mostrar_tabla();
                            // Alerta de éxito
                            alerta("success", "Información recuperada de la base de datos con exito.", "", true);
                        }, 1000);
                    } else if (result.isDenied) {
                        // Acción si inicia uno nuevo
                        const estructura = {
                            anio: anio,
                            id_departamento: id_departamento,
                            dias_pago: dias_pago,
                            usar_manual: usar_manual,
                            salario: salario
                        };

                        // NO EXISTEN DATOS GUARDADOS EN LA BASE DE DATOS PARA EL AÑO INGRESADO
                        // SE PROCEDE A RECUPERAR LOS DATOS DE LOS EMPLEADOS
                        obtener_empleados(estructura);

                        // Alerta de éxito
                        alerta("success", "Se procesó nuevamente con exito.", "", true);
                    }
                });

            } else {

                const estructura = {
                    anio: anio,
                    id_departamento: id_departamento,
                    dias_pago: dias_pago,
                    usar_manual: usar_manual,
                    salario: salario
                };

                // NO EXISTEN DATOS GUARDADOS EN LA BASE DE DATOS PARA EL AÑO INGRESADO
                // SE PROCEDE A RECUPERAR LOS DATOS DE LOS EMPLEADOS
                obtener_empleados(estructura);
            }
        }
    });
}

/**
 * Funcion para obtener los empleados de la base de datos según la estructura proporcionada
 * @param {Array} estructura Estructura con los datos necesarios para obtener los empleados
 * @param {number} estructura.anio Año a procesar
 * @param {number} estructura.id_departamento ID del departamento seleccionado
 * @param {number} estructura.dias_pago Número de días de pago
 * @param {boolean} estructura.usar_manual Indica si se debe usar el salario manual
 * @param {Array} estructura.salario Array con los tipos de salario y montos manuales por departamento
 */
function obtener_empleados(estructura) {
    // RECUPERAR LOS DATOS DEL JSON GUARDADO EN LOCALSTORAGE
    let json = getUtilidad();
    // SI EL JSON EXISTE Y ES UN ARRAY NO VACÍO NO HACE NADA
    if (json !== null && Array.isArray(json) && json.length > 0) return;

    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/reparto_utilidades/php/utilidades.php",
        data: {
            accion: "obtener_empleados",
            anio: estructura.anio,
            id_departamento: estructura.id_departamento
        },
        dataType: "json",
        success: function (response) {
            // RECUPERAR LOS DATOS DE LOS EMPLEADOS DE LA BD
            let empleados = response.data;

            // VALIDAR QUE SE HAYAN RECUPERADO EMPLEADOS
            if (empleados.length == 0) {
                alerta("warning", "Empleados no encontrados", "No se encontraron empleados para el departamento seleccionado. Por favor, verifica que existan empleados registrados en ese departamento para el año " + estructura.anio + ".");
                return;
            }

            // RECORRER LOS EMPLEADOS PARA ASIGNARLES LOS DIAS DE PAGO Y EL SALARIO MANUAL SI APLICA
            empleados.forEach(empleado => {
                // ASIGNAR LOS DÍAS DE PAGO A CADA EMPLEADO
                empleado.dias_pago = estructura.dias_pago;
                empleado.dias_pago_copia = estructura.dias_pago;

                // ASIGNAR EL SALARIO MANUAL A CADA EMPLEADO SI APLICA
                if (estructura.usar_manual) {
                    // REEMPLAZAR EL SALARIO DE LA BASE POR EL SALARIO MANUAL PROPORCIONADO
                    empleado.salario_diario = estructura.salario;
                    empleado.salario_diario_copia = estructura.salario;
                }
            });

            // CALCULAR LOS VALORES DE PTU, NETO A PAGAR, REDONDEO Y NETO A PAGAR REDONDEADO PARA CADA EMPLEADO
            empleados = calcular_valores(empleados, estructura.anio);

            // SE ASIGNA EL RESULTADO LA ESTRUCTURA BASE DEL AGUINALDO
            let json = {
                "anio": estructura.anio,
                "id_departamento": estructura.id_departamento,
                "empleados": empleados
            };

            // GUARDAR LOS DATOS DE LOS EMPLEADOS EN EL LOCALSTORAGE
            setUtilidad(json);
            // Se llena la tabla con los datos obtenidos del storage
            llenar_tabla_ptu();
            // Obtener departamentos
            obtener_departamentos();
            // Se muestra la tabla y se oculta el formulario
            mostrar_tabla();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("error", "Ocurrió un error", "No se pudieron cargar los empleados. Contacta a sistemas.");
        }
    });
}

/**
 * Función para calcular los valores de PTU, Neto a Pagar, Redondeo y Neto a Pagar Redondeado para cada empleado
 * @param {Array} empleados Empleado de la base de datos
 * @param {Number} anio Año para el cual se están calculando las utilidades
 * @returns {Array} Lista de empleados con los valores calculados
 */
function calcular_valores(empleados, anio) {
    // RECORRER LOS EMPLEADOS PARA CALCULAR LA PTU, NETO A PAGAR, REDONDEO Y NETO A PAGAR REDONDEADO
    empleados.forEach(empleado => {
        // CALCULAR LOS VALORES PARA CADA EMPLEADO
        empleado = calcular_valor_empleado(empleado, anio);
    });

    return empleados;
}

/**
 * Esta funcion calcula los valores para un solo empleado
 * @param {Array} empleado Empleado a procesar 
 * @param {Number} anio Anio ingresado para el cálculo de la PTU
 */
function calcular_valor_empleado(empleado, anio) {

    // CALCULAR LOS DÍAS TRABAJADOS. Por defecto usar la fecha real
    if (empleado.usar_fecha_real) {
        empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_real, anio);
    } else {
        // Si es false usa la fecha del imss
        empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_imss, anio);
    }

    empleado.dias_trabajados_copia = empleado.dias_trabajados;

    // CALCULAR LOS DIAS DE PTU PROPORCIONAL
    // dias_pago es la base para calcular
    empleado.dias_ptu = diasPTU(empleado.dias_trabajados, empleado.dias_pago);
    empleado.dias_ptu_copia = empleado.dias_ptu;

    // CALCULAR LA PTU
    empleado.ptu = calcular_ptu(empleado.salario_diario, empleado.dias_ptu);
    empleado.ptu_copia = empleado.ptu;

    // CALCULAR EL NETO A PAGAR
    empleado.neto_pagar = calcular_neto_pagar(empleado.ptu, empleado.tarjeta);

    // CALCULAR LA DIFERENCIA DE REDONDEO
    empleado.redondeo = diferenciaRedondeo(empleado.neto_pagar);

    // CALCULAR EL NETO A PAGAR REDONDEADO
    empleado.neto_pagar_redondeado = calcular_neto_pagar_redondeo(empleado.neto_pagar, empleado.redondeo);

    // RETORNAR EL EMPLEADO CON LOS VALORES CALCULADOS
    return empleado;
}

/**
 * ==========================================================================================================
 * FUNCIONES AUX PARA CALCULAR EL REPARTO DE UTILIDADES
 * ==========================================================================================================
 */

/**
 * Calcular los días trabajados de los empleados hasta fin de año.
 * @param {Date} fecha_ingreso Fecha en que el empleado ingresó: Formato "YYYY-MM-DD" (ej. "2023-05-15")
 * @param {Number} anio Año de cálculo (ej. 2026)
 * @returns {Number} Número de días trabajados en ese año
 */
function diasTrabajados(fecha_ingreso, anio) {

    if (!fecha_ingreso) {
        return 0;
    }

    const fechaIngreso = new Date(fecha_ingreso);
    const inicioAño = new Date(anio, 0, 1);   // 1 de enero
    const finAño = new Date(anio, 11, 31);    // 31 de diciembre

    // Si ingresó este año, contamos desde su fecha de ingreso hasta el 31 de diciembre
    if (fechaIngreso.getFullYear() == anio) {
        const diferenciaMs = finAño - fechaIngreso;
        return Math.max(0, Math.floor(diferenciaMs / (1000 * 60 * 60 * 24)) + 1);
    }

    // Si ingresó en años anteriores, cuenta todo el año completo
    const diferenciaMs = finAño - inicioAño;
    return Math.floor(diferenciaMs / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Calcular los días de PTU proporcional.
 * @param {Number} dias_trabajados Número de días trabajados
 * @param {Number} dias_utilidad Días de utilidad
 * @returns {Number} Días de PTU proporcional
 */
function diasPTU(dias_trabajados, dias_utilidad) {
    const ptu = dias_trabajados * (dias_utilidad / 365);
    return Number(ptu.toFixed(2)); // redondea a 2 decimales
}

/**
 * Función para calcular la PTU de un empleado
 * @param {Float} salario_diario - El salario diario del empleado
 * @param {Integer} dias_pago - Los días de pago del empleado
 * @returns {Float} La PTU calculada
 */
function calcular_ptu(salario_diario, dias_pago) {
    return parseFloat((salario_diario * dias_pago).toFixed(2));
}

/**
 * Función para calcular el neto a pagar
 * @param {Float} ptu - La PTU calculada
 * @param {Float} tarjeta - El monto de la tarjeta
 * @returns {Float} El neto a pagar
 */
function calcular_neto_pagar(ptu, tarjeta) {
    return parseFloat((ptu - tarjeta).toFixed(2));
}

/**
 * Función para calcular la diferencia de redondeo (Redondeo)
 * @param {Float} cantidad Cantidad que se desea redondear
 * @returns {Float} Diferencia entre el valor redondeado y el original
 */
function diferenciaRedondeo(cantidad) {
    // Redondear al entero más cercano
    const redondeado = Math.round(cantidad);

    // Calcular la diferencia
    const diferencia = redondeado - cantidad;

    return diferencia;
}

/**
 * Función para calcular el neto a pagar con redondeo
 * @param {Float} neto_pagar - El neto a pagar sin redondeo
 * @param {Float} redondeo - La diferencia de redondeo
 * @returns {Float} El neto a pagar con redondeo
 */
function calcular_neto_pagar_redondeo(neto_pagar, redondeo) {
    const pagar = neto_pagar + redondeo;
    return parseFloat(pagar.toFixed(2));
}