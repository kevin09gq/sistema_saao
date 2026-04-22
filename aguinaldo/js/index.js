// Constantes y variables globales
const RUTA_RAIZ = window.rutaRaiz || '/sistema_saao';
jsonAguinaldo = null;  // Variable global (sin let/const/var)

// modal de configuraciones
const modal_configuracion = new bootstrap.Modal(document.getElementById('modal_configuracion'));
const modal_reporte_excel = new bootstrap.Modal(document.getElementById('modal_reporte_excel'));
const modal_editar = new bootstrap.Modal(document.getElementById('modal_editar'));

// Menu contextual
const $menu_corte = $('#context_menu');
let filaSeleccionada = null; // Variable para almacenar la fila seleccionada en el menú contextual

/**
 * FLUJO GENERAL DE COMO FUNCIONA:
 * 1. Al cargar la pagina, se ejecuta existeAguinaldo(), si existe recupera de la BD y guarda en localStorage.
 * 2. Si no existe, llama a obtener_empleado() para inicializar el nuevo calculo del aguinaldo.
 * 3. En obtener_empleados(), verifica si el jsonAguinaldo ya esta lleno, si lo esta simplemente no hace nada.
 * 4. Si el jsonAguinaldo esta vacio, hace la consulta al servidor, obtiene los empleados y los guarda en jsonAguinaldo.
 */

$(document).ready(function () {

    // 1. Intentar restaurar desde localStorage
    const restaurado = restoreAguinaldo();

    // existeAguinaldo();

    // 2. Si no hay datos en localStorage, obtener desde servidor
    if (!restaurado) {
        existeAguinaldo();
    }

    console.log(jsonAguinaldo);
    
});


/**
 * Función para mostrar alertas usando SweetAlert2
 * @param {String} titulo Titulo prinicipal de la alerta.
 * @param {String} texto Mensaje principal de la alerta.
 * @param {String} icono Iconos: success, error, warning, info, question.
 * @param {Boolean} toast True para mostrar como toast, false para modal tradicional. Valor por defecto: false.
 * @param {Number} tiempo Duración del toast en ms (si toast=true). Valor por defecto: 3000ms.
 */
function alerta(titulo, texto, icono, toast = false, tiempo = 3000) {
    if (toast) {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: tiempo,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: icono,
            title: titulo
        });
        return;
    }

    // Modal tradicional
    Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        confirmButtonText: "Entendido"
    });
}

/**
 * Función para verificar si ya existe un cálculo de aguinaldo para el año seleccionado.
 */
function existeAguinaldo() {
    const anio = $('#anio').val();

    $.ajax({
        type: "GET",
        url: "../php/aguinaldo.php",
        data: {
            accion: "existe_aguinaldo",
            anio: anio
        },
        dataType: "json",
        success: function (response) {
            
            switch (response.mensaje) {
                case "existe":
                    // Si existe, se recupera el cálculo de aguinaldo desde la base de datos
                    // console.log("Existe registro en la base");
                    
                    recuperarAguinaldoBase(response.data);
                    break;
                case "no_existe":
                    // Si no existe, se obtiene la lista de empleados para iniciar el cálculo del aguinaldo
                    // console.log("No existe registro en la base");
                    obtener_empleados();
                    break;
                default:
                    console.warn("Respuesta inesperada del servidor:", response);
                    break;
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener el aguinaldo:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("Ocurrió un error", "No se pudo cargar el aguinaldo de la BD. Intente recargar la página.", "error");
        }
    });
}

/**
 * Función para recuperar el cálculo de aguinaldo desde la base de datos y llenar el jsonAguinaldo.
 */
function recuperarAguinaldoBase(json_base) {
    // Asignar el resultado a la variable global
    jsonAguinaldo = json_base;

    // Guardar en localStorage para persistencia
    saveAguinaldo(jsonAguinaldo);

    // Alerta para el usuario
    alerta("Aguinaldos recuperados exitosamente.", "", "success", true, 1500);

    // Renderizar tabla con los datos
    if (typeof llenar_tabla === 'function') {
        llenar_tabla();
    }
}

/**
 * Función para obtener la lista de empleados y llenar el jsonAguinaldo.
 */
function obtener_empleados() {
    // console.log("Se ejecuta obtener_empleados");
    
    // Si ya hay datos, no volver a hacer la solicitud
    if (jsonAguinaldo !== null && Array.isArray(jsonAguinaldo) && jsonAguinaldo.length > 0) {
        // console.log("Los datos ya están cargados:", jsonAguinaldo);
        return;
    }

    $.ajax({
        type: "GET",
        url: "../php/obtener_empleados.php",
        dataType: "json",
        success: function (response) {

            console.log("Obtener empleados: ", response.data);
            

            // Validar que la respuesta tenga los datos correctos
            if (response && response.data && Array.isArray(response.data)) {
                jsonAguinaldo = response.data;

                // console.log("Se recuperaron los empleados");

                jsonAguinaldo.slice(1).forEach(empleado => {

                    // Pasa la fecha_ingreso_real por defecto
                    if (empleado.usar_fecha_real === 1) {
                        empleado.tmp_dias_trabajados = diasTrabajados(empleado.fecha_ingreso_real);
                    } else {
                        // Si no se usa fecha real, se calcula con fecha de ingreso al IMSS
                        // Pero primero debe subir la lista de raya y configurarlo desde la configuración
                        empleado.tmp_dias_trabajados = diasTrabajados(empleado.fecha_ingreso_imss);
                    }

                    if (empleado.usar_ausencias == 1 && empleado.dias_trabajados > 0) {
                        empleado.dias_trabajados = empleado.tmp_dias_trabajados - empleado.ausencias;
                    } else {
                        empleado.dias_trabajados = empleado.tmp_dias_trabajados;
                    }
                
                    empleado.meses_trabajados = mesesTrabajados(empleado.dias_trabajados);

                    empleado.aguinaldo = calcularAguinaldo(empleado.dias_trabajados, empleado.salario_diario); // si estaba null, ahora se actualiza

                    empleado.neto_pagar = calcularNetoPagar(empleado.aguinaldo, empleado.isr, empleado.tarjeta); // si estaba 0, ahora se actualiza

                });

                console.log("Empleados cargados correctamente:", jsonAguinaldo);

                // Guardar en localStorage para persistencia
                saveAguinaldo(jsonAguinaldo);

                // Renderizar tabla con los datos
                if (typeof llenar_tabla === 'function') {
                    llenar_tabla();
                }

            } else {
                console.error("Respuesta del servidor en formato incorrecto:", response);
                alerta("Error", "Los datos recibidos no tienen el formato esperado.", "error");
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("Ocurrió un error", "No se pudieron cargar los empleados. Intente recargar la página.", "error");
        }
    });
}

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
 * @returns {Float} El monto del aguinaldo calculado
 */
function calcularAguinaldo(dias_trabajados, salario_diario) {
    // Convertir salario_diario a número (puede venir como string desde BD)
    const sueldoNumerico = parseFloat(salario_diario) || 0;

    if (dias_trabajados < 60) {
        return -1;
    }
    const aguinaldo = (15 / 365) * dias_trabajados * sueldoNumerico;
    return parseFloat(aguinaldo.toFixed(2)); // Redondear a 2 decimales
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
    if (aguinaldo === -1) {
        return 0.00;
    }
    // Cálculo normal
    return parseFloat((aguinaldo - isr - tarjeta).toFixed(2));
}

// Informar el usuario sobre el cambio del año
$(document).on('click', '#anio', function (e) {
    e.preventDefault();
    alerta("Si cambias el año y no has guardado los cambios, se perderán.", ".", "info", true, 5000);
});

// Detectar el cambio del año
$(document).on('change', '#anio', function (e) {
    e.preventDefault();
    // console.log("Cambio de año");
    // console.log("Limpiando localStorage");
    clearAguinaldo();
    // Validar si existe un aguinaldo para el año seleccionado
    existeAguinaldo();
    // Validar si ya se cargaron las listas de raya
    validarEstadoCargaArchivos();
});