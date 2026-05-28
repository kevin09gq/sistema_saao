
/**
 * COMENZAR EL PROCESO DE REPARTO DE UTILIDADES
 * 1. RECUPERAR LOS DÍAS DE PAGO POR DEPARTAMENTO
 * 2. RECUPERAR LOS TIPOS DE SALARIO Y MONTOS MANUALES POR DEPARTAMENTO
 * 3. VALIDAR SI YA EXISTEN REGISTROS DE PTU PARA EL AÑO SELECCIONADO
 * 4. SI EXISTE:
 *  4.1. RECUPERAR LOS REGISTROS EXISTENTES
 *  4.2. MOSTRAR LOS REGISTROS EXISTENTES EN UNA TABLA PRINCIPAL
 * 5. SI NO EXISTE:
 *  5.1. RECUPERAR TODOS LOS EMPLEADOS ACTIVOS DE LA BASE DE DATOS
 *  5.2. UNIR LOS EMPLEADOS CON LOS DIAS DE PAGO Y SALARIOS POR DEPARTAMENTO
 *  5.3. CALCULAR LA PTU PARA CADA EMPLEADO: PTU = SALARIO DIARIO * DIAS DE PAGO
 *  5.4. CALCULAR NETO PAGAR: NETO = PTU - TARJETA
 *  5.5. CALCULAR REDONDEO
 *  5.6. CALCULAR NETO PAGAR REDONDEADO: NETO REDONDEADO = NETO PAGAR + RODENDEO
 */
$(document).on('click', '#btn_procesar_ptu', function (e) {
    e.preventDefault();

    console.log('COMIENZA EL PROCESO DE LA PTU');

    // RECUPERAMOS EL AÑO SELECCIONADO
    let anio = $("#anio").val();

    // VALIDAMOS EL AÑO SELECCIONADO
    if (!anio || anio == 0 || anio < 0) {
        alerta("error", "Error en año seleccionado", "Por favor, seleccione un año válido.");
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

        console.log("SE CONTINUA DESPUES DE UNA PEQUEÑA PAUSA");


        // RECUPERAMOS LOS DÍAS DE PAGO POR DEPARTAMENTO
        let dias_pago_departamentos = obtenerDiasPorDepartamento();
        // RECUPERAMOS LOS TIPOS DE SALARIO Y MONTOS MANUALES POR DEPARTAMENTO
        let salarios = obtenerSalariosPorDepartamento();
        // SI HAY ERRORES EN LOS MONTOS MANUALES, MOSTRAMOS ALERTA Y NO PROCEDEMOS
        if (salarios.errores.length > 0) {
            alerta("error", "Error en datos de salarios", "Errores:\n" + salarios.errores.join("\n"));
            return; // No enviamos si hay errores
        }
        // VALIDAMOS SI YA EXISTE UN CÁLCULO DE PTU PARA EL AÑO SELECCIONADO
        validar_existe_utilidad(anio, dias_pago_departamentos, salarios.resultados);
    }, 1500);

});

/**
 * Función para obtener los días de pago por departamento
 * @returns {Array} Array de objetos con los días de pago por departamento
 */
function obtenerDiasPorDepartamento() {
    let resultados = [];

    $("#cuerpo_tabla_dias_pago input").each(function () {
        let idDept = $(this).data("id");              // Recupera el id del departamento
        let diasPago = parseInt($(this).val(), 10);   // Convierte el valor a número

        // Si está vacío o no es número, asignamos 7 por defecto
        resultados.push({
            id_departamento: idDept,
            dias_pago: isNaN(diasPago) ? 7 : diasPago
        });
    });

    return resultados;
}

/**
 * Función para obtener los tipos de salario y montos manuales por departamento
 * @returns {Object} Objeto con los resultados y errores
 */
function obtenerSalariosPorDepartamento() {
    let resultados = [];
    let errores = [];

    $("#cuerpo_tabla_salarios tr").each(function () {
        let idDept = $(this).find(".radio-salario").data("id");
        let tipoSalario = $(this).find(".radio-salario:checked").val();
        let montoManual = $(this).find(".input-salario-manual").val();

        if (tipoSalario === "manual") {
            let monto = parseFloat(montoManual);

            if (isNaN(monto) || monto <= 0) {
                errores.push(`Departamento ${idDept}: monto manual inválido`);
            }

            resultados.push({
                id_departamento: idDept,
                tipo_salario: "manual",
                monto_manual: monto
            });
        } else {
            resultados.push({
                id_departamento: idDept,
                tipo_salario: "base",
                monto_manual: null
            });
        }
    });

    return { resultados, errores };
}

/**
 * Función para validar si ya existe un cálculo de aguinaldo para el año ingresado
 * @param {number} anio Año a validar
 * @param {number} dias_pago Número de días de pago
 * @param {Array} salarios Array con los tipos de salario y montos manuales por departamento
 */
function validar_existe_utilidad(anio, dias_pago, salarios) {
    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/reparto_utilidades/php/utilidades.php",
        data: {
            accion: "existe_utilidad",
            anio: anio
        },
        dataType: "json",
        success: function (response) {

            // CERRAR PRIMERA ALERTA DE CARGA
            Swal.close();

            if (response.texto == "existe") {
                console.log("EXISTE ALGO EN LA BASE");


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
                    // SIMPLEMENTE SE RECUPERAN Y SE MUESTRAN EN LA INTERFAZ
                    setUtilidad(response.data);
                    // Se llena la tabla con los datos obtenidos del storage
                    llenar_tabla_ptu();
                    // Se muestra la tabla y se oculta el formulario
                    mostrar_tabla();
                    // Alerta de éxito
                    alerta("success", "Información recuperada de la base de datos con exito.", "", true);
                }, 1500);

            } else {
                // NO EXISTEN DATOS GUARDADOS EN LA BASE DE DATOS PARA EL AÑO INGRESADO
                // SE PROCEDE A RECUPERAR LOS DATOS DE LOS EMPLEADOS
                obtener_empleados(anio, dias_pago, salarios);
            }
        }
    });
}

/**
 * Función para obtener los datos de los empleados desde la base de datos
 * @param {number} anio Año para el cual se van a obtener los empleados (opcional, por defecto el año actual)
 * @param {number} dias_pago Número de días de pago
 * @param {Array} salarios Array con los tipos de salario y montos manuales por departamento
 */
function obtener_empleados(anio, dias_pago, salarios) {
    // RECUPERAR LOS DATOS DEL JSON GUARDADO EN LOCALSTORAGE
    let json = getUtilidad();
    // SI EL JSON EXISTE Y ES UN ARRAY NO VACÍO, NO HACEMOS LA PETICIÓN AJAX
    if (json !== null && Array.isArray(json) && json.length > 0) return;

    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/reparto_utilidades/php/utilidades.php",
        data: {
            accion: "obtener_empleados"
        },
        dataType: "json",
        success: function (response) {

            // RECUPERAR LOS DATOS DE LOS EMPLEADOS DE LA BD
            let empleados = response.data;

            // console.log("Empleados obtenidos de la BD: ", empleados);

            // UNIR LOS EMPLEADOS CON LOS DIAS DE PAGO
            empleados = unir_dias_pago(empleados, dias_pago);

            // console.log("Empleados unidos con dias pago: ", empleados);

            // UNIR LOS EMPLEADOS CON LOS TIPOS DE SALARIO Y MONTOS MANUALES
            empleados = unir_salarios(empleados, salarios);

            // console.log("Empleados unidos con salarios: ", empleados);

            // CALCULAR LOS VALORES DE PTU, NETO A PAGAR, REDONDEO Y NETO A PAGAR REDONDEADO PARA CADA EMPLEADO
            empleados = calcular_valores(empleados, anio);

            // console.log("Empleados con valores calculados: ", empleados);

            // SE ASIGNA EL RESULTADO LA ESTRUCTURA BASE DEL AGUINALDO
            let estructura = {
                "empleados": empleados,
                "anio": anio
            };


            // GUARDAR LOS DATOS DE LOS EMPLEADOS EN EL LOCALSTORAGE
            setUtilidad(estructura);

            // CERRAR LA ALERTA DE CARGA
            Swal.close();

            // Se llena la tabla con los datos obtenidos del storage
            llenar_tabla_ptu();

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
 * Función para unir los empleados con los días de pago por departamento
 * @param {Array} empleados Lista de empleados obtenida de la base de datos
 * @param {Array} dias_pago Lista de días de pago por departamento obtenida del formulario
 * @returns 
 */
function unir_dias_pago(empleados, dias_pago) {
    // RECORRER LOS EMPLEADOS
    empleados.forEach(empleado => {
        // BUSCAR EL DEPARTAMENTO DEL EMPLEADO EN EL ARRAY DE DÍAS DE PAGO
        let depto = dias_pago.find(d => d.id_departamento === empleado.id_departamento);
        // SI SE ENCUENTRA EL DEPARTAMENTO, ASIGNAR LOS DÍAS DE PAGO AL EMPLEADO
        if (depto) {
            // ASIGNAR LOS DÍAS DE PAGO AL EMPLEADO
            empleado.dias_pago = depto.dias_pago;
            empleado.dias_pago_copia = depto.dias_pago;
        }
    });

    return empleados;
}

/**
 * Función para unir los empleados con los tipos de salario y montos manuales por departamento
 * @param {Array} empleados Lista de empleados obtenida de la base de datos
 * @param {Array} salarios Lista de tipos de salario y montos manuales por departamento obtenida del formulario
 * @returns {Array} Lista de empleados con los salarios unidos
 */
function unir_salarios(empleados, salarios) {
    // RECORRER LOS EMPLEADOS
    empleados.forEach(empleado => {
        // Buscar el salario correspondiente al departamento del empleado
        let salario = salarios.find(s => s.id_departamento === empleado.id_departamento);

        // VALIDAR SI SE ENCONTRÓ EL SALARIO Y ASIGNARLO AL EMPLEADO
        if (salario) {
            // ASIGNAR EL TIPO DE SALARIO AL EMPLEADO
            if (salario.tipo_salario === "manual") {
                // Si es manual, asignar el monto_manual al salario_diario
                empleado.salario_diario = salario.monto_manual;
            }
        }
    });

    return empleados;
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
    });

    return empleados;
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