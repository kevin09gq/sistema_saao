
/**
 * Evento para procesar el formulario de aguinaldo
 */
$(document).on('submit', '#form_aguinaldo', function (e) {
    e.preventDefault();

    // Obtener el año ingresado
    const anio = parseInt($('#anio').val(), 10);
    const dias_pago = parseInt($('#dias_pago').val(), 10);

    if (anio == 0 || !anio) {
        alerta("info", "Año inválido", "Por favor, ingresa un año válido para procesar el aguinaldo.");
        return;
    }

    if (dias_pago == 0 || dias_pago < 1 || !dias_pago) {
        alerta("info", "Días de pago inválidos", "Por favor, ingresa un número válido de días de pago para procesar el aguinaldo.");
        return;
    }

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
        // VALIDAR SI YA EXISTE UN CALCULO DE AGUINALDO PARA EL AÑO INGRESADO
        validar_existe_aguinaldo(anio, dias_pago);
    }, 2500);
});


/**
 * Función para validar si ya existe un cálculo de aguinaldo para el año ingresado
 * @param {number} anio Año a validar
 * @param {number} dias_pago Número de días de pago
 */
function validar_existe_aguinaldo(anio, dias_pago = 15) {
    $.ajax({
        type: "GET",
        url: "php/aguinaldo.php",
        data: {
            accion: "existe_aguinaldo",
            anio: anio
        },
        dataType: "json",
        success: function (response) {

            // CERRAR PRIMERA ALERTA DE CARGA
            Swal.close();

            if (response.texto == "existe") {

                // MOSTRAR ALERTA DE CARGA DE RECUPERACIÓN DE DATOS
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

                // HACER UNA PAUSA VISUAL
                setTimeout(() => {
                    // CERRAR LA ALERTA DE CARGA
                    Swal.close();

                    // YA EXISTEN DATOS GUARDADOS EN LA BASE DE DATOS PARA EL AÑO INGRESADO
                    // SIMPLEMENTE SE RECUPERAN Y SE MUESTRAN EN LA INTERFAZ
                    setAguinaldo(response.data);
                    // Se llena la tabla con los datos obtenidos del storage
                    llenar_tabla_aguinaldo();
                    // Se muestra la tabla y se oculta el formulario
                    mostrar_tabla();
                    // Alerta de éxito
                    alerta("success", "Información recuperada de la base de datos con exito.", "", true);
                }, 2500);

            } else {
                // NO EXISTEN DATOS GUARDADOS EN LA BASE DE DATOS PARA EL AÑO INGRESADO
                // SE PROCEDE A RECUPERAR LOS DATOS DE LOS EMPLEADOS
                obtener_empleados(anio, dias_pago);
            }
        }
    });
}

/**
 * ==================================================================================
 * NO EXISTE REGISTRO EN LA BASE DE DATOS ASI QUE SE EJECUTA
 * obtener_empleados PARA RECUPERAR LOS EMPLEADOS Y PROCESAR EL AGUINALDO
 * ==================================================================================
 */

/**
 * Función para obtener los datos de los empleados desde la base de datos
 * @param {number} anio Año para el cual se van a obtener los empleados (opcional, por defecto el año actual)
 * @param {number} dias_pago Número de días de pago
 */
function obtener_empleados(anio, dias_pago = 15) {
    // Si ya hay datos, no volver a hacer la solicitud
    if (jsonAguinaldo !== null && Array.isArray(jsonAguinaldo) && jsonAguinaldo.length > 0) return;

    $.ajax({
        type: "GET",
        url: "php/aguinaldo.php",
        data: {
            accion: "obtener_empleados"
        },
        dataType: "json",
        success: function (response) {

            // Se van a recuperar los datos de los empleados
            let empleados = response.data;

            // PROCESAR DATOS PARA CADA EMPLEADO
            empleados.forEach(empleado => {
                // 1. ASIGNAR LOS DÍAS DE PAGO A CADA EMPLEADO, SE USARÁ PARA CALCULAR EL AGUINALDO
                empleado.dias_pago = dias_pago;

                // 2. CALCULAR DIAS TRABAJADOS TEMPORAL APARTIR DE LA FECHA REAL DE INGRESO (SE USUARÁ POR DEFECTO LA REAL)
                empleado.dias_trabajados_tmp = diasTrabajados(empleado.fecha_alta_empresa, anio);

                // 3. CALCULAR DIAS TRABAJADOS DEFINITIVO RESTANDO LAS AUSENCIAS POR DEFECTO AUSENCIAS SON 0
                empleado.dias_trabajados = empleado.dias_trabajados_tmp - empleado.total_ausencias;

                // 4. CALCULAR SI TIENE DERECHO A AGUINALDO, SI TIENE 60 O MAS DIAS TRABAJADOS DEFINITIVO EN EL AÑO, ENTONCES TIENE DERECHO
                empleado.derecho_aguinaldo = empleado.dias_trabajados >= 60;

                // 5. DEFINIR SI SE MUESTRA O NO EN LA INTERFAZ, SI NO TIENE DERECHO A AGUINALDO ENTONCES NO SE MUESTRA
                empleado.visible = empleado.derecho_aguinaldo;

                // 6. CALCULAR LOS MESES TRABAJADOS APARTIR DE LOS DIAS TRABAJADOS DEFINITIVO
                empleado.meses_trabajados = mesesTrabajados(empleado.dias_trabajados);

                // 7. CALCULAR EL AGUINALDO APARTIR DE LOS DIAS TRABAJADOS DEFINITIVO
                empleado.aguinaldo = calcularAguinaldo(empleado.dias_trabajados, empleado.salario_diario, empleado.dias_pago);

                // 8. CALCULAR NETO A PAGAR: AGUINALD - ISR - TARJETA
                empleado.neto_pagar = calcularNetoPagar(empleado.aguinaldo, empleado.isr, empleado.tarjeta);

                // 9. CALCULAR LA DIFERENCIA DE REDONDEO APARTIR DEL NETO A PAGAR
                // POR DEFECTO NO SE APLICA REDONDEO, PERO ESTO SE QUITA DESDE EL MODAL DE LOS REDONDEOS
                empleado.redondeo = empleado.aplicar_redondeo ? diferenciaRedondeo(empleado.neto_pagar) : 0;

                // 10. CALCULAR EL NETO A PAGAR REDONDEADO SUMANDO LA DIFERENCIA DE REDONDEO AL NETO A PAGAR ORIGINAL
                empleado.neto_pagar_redondeado = calcularNetoPagarRedondeado(empleado.neto_pagar, empleado.redondeo);
            });

            // console.log("EMPLEADOS PROCESADOS: ", empleados);

            // SE ASIGNA EL RESULTADO LA ESTRUCTURA BASE DEL AGUINALDO
            let estructura = {
                "configuraciones": 0,
                "empleados": empleados,
                "anio": anio,
                "dias_pago_general": dias_pago
            };

            // GUARDAR LA ESTRUCTURA EN EL jsonAguinaldo
            // Y GUARDAR EN EL STORAGE
            setAguinaldo(estructura);

            // LLENAR TABLA CON LOS DATOS PROCESADOS
            llenar_tabla_aguinaldo();

            // SE MUESTRA LA TABLA Y SE OCULTA EL FORMULARIO
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
 * ====================================================================
 * FUNCIONES AUXILIARES PARA CALCULAR EL AGUINALDO
 * ====================================================================
 */

/**
 * Calcular los días trabajados de los empleados hasta fin de año.
 * @param {Date} fecha_ingreso Fecha en que el empleado ingresó
 * @param {Number} anio Año de cálculo (ej. 2026)
 * @returns {Number} Número de días trabajados en ese año
 */
function diasTrabajados(fecha_ingreso, anio = new Date().getFullYear()) {

    if (!fecha_ingreso) {
        return 0;
    }

    const fechaIngreso = new Date(fecha_ingreso);
    const inicioAño = new Date(anio, 0, 1);   // 1 de enero
    const finAño = new Date(anio, 11, 31);    // 31 de diciembre

    // Si ingresó este año, contamos desde su fecha de ingreso hasta el 31 de diciembre
    if (fechaIngreso.getFullYear() === anio) {
        const diferenciaMs = finAño - fechaIngreso;
        return Math.max(0, Math.floor(diferenciaMs / (1000 * 60 * 60 * 24)) + 1);
    }

    // Si ingresó en años anteriores, cuenta todo el año completo
    const diferenciaMs = finAño - inicioAño;
    return Math.floor(diferenciaMs / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Recibe los días trabajados y devuelve el equivalente en meses (redondeado a 1 decimal)
 * @param {Number} dias_trabajados Número de días trabajados en el año 
 */
function mesesTrabajados(dias_trabajados) {
    return parseFloat((dias_trabajados / 30.4).toFixed(1));
}

/**
 * Función para calcular el aguinaldo de un empleado
 * @param {Number} dias_trabajados dias que trabajo el empleado en el año
 * @param {Float} salario_diario salario diario del empleado
 * @param {Number} dias_pago número de días de pago para el cálculo del aguinaldo (por defecto 15 días, pero puede ser personalizado)
 * @returns {Float | number} El monto del aguinaldo calculado o -1 si no cumple con el mínimo de días trabajados (60 días) para tener derecho al aguinaldo
 */
function calcularAguinaldo(dias_trabajados, salario_diario, dias_pago = 15) {
    // Convertir salario_diario a número (puede venir como string desde BD)
    const sueldoNumerico = parseFloat(salario_diario) || 0;

    if (dias_trabajados < 60) {
        return 0.00;
    }
    const aguinaldo = (dias_pago / 365) * dias_trabajados * sueldoNumerico;
    return parseFloat(aguinaldo.toFixed(2)); // Redondear a 2 decimales
}


/**
 * Calcular la diferencia entre un valor y su redondeo
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
 * Calcular el neto a pagar al empleado restando ISR y tarjeta del aguinaldo
 * @param {Float} aguinaldo Calculo del aguinaldo para el empleado
 * @param {Float} isr ISR de impuesto
 * @param {Float} tarjeta Valor del dispersión de tarjeta
 * @returns El monto neto a pagar
 */
function calcularNetoPagar(aguinaldo, isr, tarjeta) {
    // Si no tiene derecho a aguinaldo
    // if (aguinaldo === -1) {
    //     return 0.00;
    // }
    // Cálculo normal
    return parseFloat((aguinaldo - isr - tarjeta).toFixed(2));
}

/**
 * Función para calcular el neto a pagar redondeado sumando
 * la diferencia del redondeo al neto a pagar original
 * @param {Float} neto_pagar Neto a pagar original sin redondear
 * @param {Float} redondeo Diferencia del redondeo calculada con la función diferenciaRedondeo
 * @returns Neto a pagar redondeado sumando la diferencia del redondeo
 */
function calcularNetoPagarRedondeado(neto_pagar, redondeo) {
    const pagar = neto_pagar + redondeo;
    return parseFloat(pagar.toFixed(2));
}