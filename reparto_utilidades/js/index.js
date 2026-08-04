// ===============================
// VARIABLE GLOBAL
// ===============================
window.jsonUtilidad = null;

// Constantes y variables globales
const RUTA_RAIZ = window.rutaRaiz || '/sistema_saao';

// Menu contextual
const $menu_contexto = $('#context_menu');
let filaSeleccionada = null; // Variable para almacenar la fila seleccionada en el menú contextual


// MODALES
const modalCalculoPTU = new bootstrap.Modal(document.getElementById('modalCalculoPTU'));
const modal_visibilidad = new bootstrap.Modal(document.getElementById('modal_visibilidad'));
const modal_redondeos = new bootstrap.Modal(document.getElementById('modal_redondeos'));
const modal_dispersion_tarjeta = new bootstrap.Modal(document.getElementById('modal_dispersion_tarjeta'));
const modal_tarjeta = new bootstrap.Modal(document.getElementById('modal_tarjeta'));
const modal_configuracion = new bootstrap.Modal(document.getElementById('modal_configuracion'));
const modal_reporte_excel = new bootstrap.Modal(document.getElementById('modal_reporte_excel'));
const modal_seleccion_fechas = new bootstrap.Modal(document.getElementById('modal_seleccion_fechas'));



// =============================================================
// FUNCIONES INCIALES PARA PROCESAR DATOS Y GUARDAR EN STORAGE
// =============================================================

/**
 * Función para guardar datos en localStorage
 * @param {Array} data Información de los empleados
 * @param {number} anio Año del aguinaldo
 * @param {number} config Si es 0 no se han cargado archivos excel, si es 1 se han cargado archivos excel
 */
function setStorage(data, anio, config) {
    localStorage.setItem("utilidad", JSON.stringify(data));
}

/**
 * Función para obtener datos de localStorage
 * @returns {Array|null} Información de los empleados o null si no hay datos
 */
function getStorage() {
    const data = localStorage.getItem("utilidad");

    if (!data) return null;

    try {
        const obj = JSON.parse(data);
        return obj || null;
    } catch (e) {
        console.error("Error parseando storage", e);
        return null;
    }
}

/**
 * Función para limpiar datos de localStorage
 */
function clearStorage() {
    localStorage.removeItem("utilidad");
    window.jsonUtilidad = null;
}

/**
 * Función para establecer los datos del jsonUtilidad
 * @param {Array} data Información de los empleados
 */
function setUtilidad(data) {
    window.jsonUtilidad = data || null;
    syncStorage();
}

/**
 * Función para obtener los datos del jsonUtilidad
 * @returns {Array} Información de los empleados
 */
function getUtilidad() {
    return window.jsonUtilidad;
}

/**
 * Función para sincronizar el estado del jsonUtilidad con localStorage
 * @returns {void}
 */
function syncStorage() {
    if (!window.jsonUtilidad) {
        console.error("ERROR EN LA SINCRONIZACIÓ CON EL STORAGE. Archivo index.js linea 72", window.jsonUtilidad);
        alerta("error", "Error de almacenamiento", "Error en la sincronización. Contacta a sistemas");
        return;
    }
    setStorage(window.jsonUtilidad);
}


/**
 * =============================================================================================
 * FUNCIONES AUXILIARES PARA INICIALIZAR LA APLICACIÓN, RENDERIZAR DEPARTAMENTOS, MOSTRAR ALERTAS, ETC.
 * =============================================================================================
 */


/**
 * Función para mostrar alertas usando SweetAlert2
 * @param {String} icono Iconos: success, error, warning, info, question.
 * @param {String} titulo Titulo prinicipal de la alerta.
 * @param {String} texto Mensaje principal de la alerta.
 * @param {Boolean} toast True para mostrar como toast, false para modal tradicional. Valor por defecto: false.
 * @param {Number} tiempo Duración del toast en ms (si toast=true). Valor por defecto: 3000ms.
 */
function alerta(icono, titulo, texto, toast = false, tiempo = 3000) {
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
    } else {
        // Modal tradicional
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icono,
            confirmButtonText: "Entendido"
        });
    }
}

/**
 * Ordenar los departamentos alfabéticamente por su nombre,
 * ignorando mayúsculas y acentos, y convertir el nombre a mayúsculas
 * @param {Array} departamentos Array de departamentos con id_departamento y nombre_departamento
 * @returns Array de departamentos ordenados alfabéticamente por nombre_departamento en mayúsculas
 */
function ordenarDepartamentos(departamentos) {
    return departamentos
        .map(dep => ({
            ...dep,
            nombre_departamento: dep.nombre_departamento.toUpperCase()
        }))
        .sort((a, b) =>
            a.nombre_departamento.localeCompare(b.nombre_departamento, 'es', {
                sensitivity: 'base'
            })
        );
}

/**
 * Renderiza departamentos en un select
 * 
 * @param {Object} config Configuración para renderizar los departamentos
 * @param {string} config.selector Selector del select
 * @param {Array} config.data Lista de departamentos
 * @param {boolean} [config.keepFirstOption=false] Mantener primera opción existente
 * @param {boolean} [config.selectFirst=false] Seleccionar automáticamente el primer elemento
 */
function render_select_departamentos({
    selector,
    data,
    keepFirstOption = false,
    selectFirst = false
}) {

    const select = $(selector);

    if (keepFirstOption) {
        select.find("option:not(:first)").remove();
    } else {
        select.empty();
    }

    data.forEach((depto, index) => {

        const selected = (selectFirst && index === 0)
            ? 'selected'
            : '';

        select.append(`
            <option ${selected} value="${depto.id_departamento}">
                ${depto.nombre_departamento}
            </option>
        `);
    });
}

/**
 * Obtener la lista de departamentos para el filtro
 */
function obtener_departamentos() {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerDepartamentos.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
            // Ordenar departamentos alfabéticamente por nombre_departamento
            let depa_ordenado = ordenarDepartamentos(data);

            // Llenar los select del formulario de configuración
            render_select_departamentos({
                selector: "#departamento_configuracion",
                data: depa_ordenado,
                keepFirstOption: true,
                selectFirst: false
            });

            // ESTO ES PARA LLENAR LOS SELECT DE LOS FILTROS CUANDO YA SE CARGA LA INFORMACIÓN
            let json = getUtilidad();
            if (json && json.id_departamento) {
                // DEBE SER FILTER PORQUE render_select_departamentos ACEPTA UN ARRAY DE DEPARTAMENTOS
                let depa_seleccionado = depa_ordenado.filter(d => d.id_departamento == json.id_departamento);

                // Llenar los select de departamentos de la tabla principal
                render_select_departamentos({
                    selector: "#id_departamento",
                    data: depa_seleccionado,
                    keepFirstOption: false,
                    selectFirst: false
                });
            }

        },
        error: function () {
            console.error("Error al cargar departamentos");
        }
    });
}

/**
 * Renderiza empresas en un select
 * 
 * @param {Object} config Configuración para renderizar las empresas
 * @param {string} config.selector Selector del select
 * @param {Array} config.data Lista de empresas
 * @param {boolean} [config.keepFirstOption=false] Mantener primera opción existente
 * @param {boolean} [config.selectFirst=false] Seleccionar automáticamente el primer elemento
 */
function render_select_empresas({
    selector,
    data,
    keepFirstOption = false,
    selectFirst = false
}) {

    const select = $(selector);

    if (keepFirstOption) {
        select.find("option:not(:first)").remove();
    } else {
        select.empty();
    }

    data.forEach((empresa, index) => {

        const selected = (selectFirst && index === 0)
            ? 'selected'
            : '';

        select.append(`
            <option ${selected} value="${empresa.id_empresa}">
                ${empresa.nombre_empresa}
            </option>
        `);
    });
}

/**
 * Función para obtener las empresas
 */
function obtener_empresas() {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerEmpresas.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
            // LLENAR EL SELECT DE LA TABLA PRINCIPAL
            render_select_empresas({
                selector: "#id_empresa",
                data: data,
                keepFirstOption: true,
                selectFirst: false
            });
            // LLENAR EL SELECT DEL MODAL DE SELECCIÓN DE FECHAS
            render_select_empresas({
                selector: "#id_empresa_fecha",
                data: data,
                keepFirstOption: true,
                selectFirst: false
            });
        },
        error: function () {
            console.error("Error al cargar empresas");
        }
    });
}

/**
 * Función para buscar los años ingresados en la base de datos
 */
function buscar_anio() {
    $("#anio").autocomplete({
        source: function (request, response) {
            // request.term contiene el valor que el usuario ha ingresado en el input
            // Se hace la petición AJAX al servidor para obtener los años que coincidan con el término de búsqueda
            $.ajax({
                url: "../php/utilidades.php",
                type: "GET",
                data: {
                    buscar: request.term,
                    accion: "buscar_anio"
                },
                dataType: "json",
                success: function (result) {
                    response($.map(result.data, function (item) {
                        return {
                            label: item.anio, // lo que se muestra en la lista
                            value: item.anio  // lo que se coloca en el input
                        };
                    }));

                }
            });
        },
        select: function (event, ui) {
            // Recuperar el valor seleccionado
            let cadena = ui.item.value;
            // console.log(cadena);
            // Mostrar el valor seleccionado en el input
            $("#anio").val(cadena);
        },
        minLength: 1, // empieza a buscar desde 0 caracteres
        maxLength: 4, // máximo 4 caracteres para el año
        delay: 0 // sin retraso para mostrar resultados
    });
}

/**
 * =============================================================================================================
 * FUNCIONES PARA MOSTRAR Y OCULTAR SECCIONES DE LA APLICACIÓN
 * =============================================================================================================
 */

/**
 * Función para mostrar la tabla principal y ocultar los formularios de configuración
 */
function mostrar_tabla() {
    // OCULTAR FORMULARIO DE CONFIGURACIÓN
    $("#seccion_1_configuracion").addClass("d-none");
    $("#cuerpo_config_ptu").addClass("d-none");
    // MOSTRAR TABLA PRINCIPAL
    $("#seccion_2_resultados").removeClass("d-none");

    // PREPARAR INTERFAZ CON LOS DATOS CARGADOS
    preparar_interfaz();
    // RESETEAR EL FORMULARIO DE CONFIGURACIÓN PARA QUE SI SE REGRESA, APAREZCA LIMPIO
    resetFormularioConfiguracion();
}

/**
 * Función para resetear el formulario de configuración a su estado inicial
 */
function resetFormularioConfiguracion() {
    // Reiniciar el input de año
    $("#anio").val("");

    // Reiniciar el select al valor -1
    $("#departamento_configuracion").val("-1");

    // Reiniciar días de utilidad
    $("#dias_utilidad").val("");

    // Reiniciar salario manual y deshabilitarlo
    $("#usar_salario_manual").prop("checked", false);
    $("#salario_manual").val("").prop("disabled", true);
}

// SELECT DE FILTROS PARA LA TABLA PRINCIPAL Y DE MÁS
const selects_departamentos = ["#id_departamento"];

/**
 * Función para mostrar formulario y ocultar tabla principal
 */
function mostrar_formulario() {
    // OCULTAR TABLA PRINCIPAL
    $("#seccion_2_resultados").addClass("d-none");
    // MOSTRAR FORMULARIO DE CONFIGURACIÓN
    $("#seccion_1_configuracion").removeClass("d-none");
    $("#cuerpo_config_ptu").removeClass("d-none");

    // BORRAR EL CUERPO DE LA TABLA PRINCIPAL
    $("#cuerpo_tabla_ptu").empty();
    // BORRAR LOS SELECT DE DEPARTAMENTOS PARA EVITAR ERROR AL LLENAR
    selects_departamentos.forEach(select => {
        limpiar_select(select);
    });
}

function limpiar_select(id_select) {
    $(id_select).empty().append('<option value="-1">--Selecciona un departamento--</option>');
}

/**
 * Función para preparar la interfaz, mostrar u ocultar secciones, etc.
 */
function preparar_interfaz() {
    let json = getStorage();

    // VALIDAR SI EL JSON EXISTE Y TIENE DATOS
    // Si no hay datos, No hacer nada
    if (!json || json.length === 0) return;

    // RECUPERAR AÑO
    const anio = json.anio || new Date().getFullYear();
    // Mostrar año en el span del título
    $("#span_anio").text(anio);
}


// ================================================================================================
// SECCION DE INICIALIZACIÓN DE LA APLICACIÓN
// ================================================================================================

/**
 * Función de inicialización para cargar datos necesarios al iniciar la página
 */
function init() {
    // Cargar departamentos para el filtro
    obtener_departamentos();
    // Cargar empresas para el modal de exportación
    obtener_empresas();
    // Buscar años en la base de datos para el autocomplete
    buscar_anio();

    // RECUPERAR DATOS DE STORAGE SI EXISTEN
    let json = getStorage();

    console.log(json);

    if (json) {
        // Si hay datos en storage, cargarlos en la variable global jsonUtilidad
        setUtilidad(json);
        // LLENAR LA TABLA PRINCIPAL CON LOS DATOS DE STORAGE
        llenar_tabla_ptu();
        // Mostrar la tabla principal con los datos cargados
        mostrar_tabla();
    } else {
        // Si no hay datos en storage, inicializar jsonUtilidad como un array vacío
        window.jsonUtilidad = [];
        // Mostrar el formulario de configuración para cargar datos
        mostrar_formulario();
    }
}

/**
 * Evento document ready para iniciar la aplicación una vez que el DOM esté completamente cargado
 */
$(document).ready(function () {
    init();
});