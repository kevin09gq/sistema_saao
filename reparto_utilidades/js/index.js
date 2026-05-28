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

    const obj = {
        anio: anio,
        configuracion: config,
        empleados: data
    };

    localStorage.setItem("utilidad", JSON.stringify(obj));
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
        return obj.empleados || null;
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
    if (!window.jsonUtilidad) return;
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

            // Renderizar departamentos en la SECCION 1
            render_departamentos_dias_pago(depa_ordenado);

            // Renderizar departamentos en la SECCION 2
            render_departamentos_salarios(depa_ordenado);

            // Llenar los select de departamentos principal
            render_select_departamentos({
                selector: "#id_departamento",
                data: ordenarDepartamentos(data),
                keepFirstOption: true,
                selectFirst: false
            });

            // Llenar los select de departamentos de visibilidad
            render_select_departamentos({
                selector: "#select_departamento_visibilidad",
                data: ordenarDepartamentos(data),
                keepFirstOption: false,
                selectFirst: true
            });

            // Llenar los select de departamentos de redondeos
            render_select_departamentos({
                selector: "#select_departamento_redondeos",
                data: ordenarDepartamentos(data),
                keepFirstOption: false,
                selectFirst: true
            });

            // Llenar los select de departamentos de tarjetas
            render_select_departamentos({
                selector: "#select_departamento_tarjeta",
                data: ordenarDepartamentos(data),
                keepFirstOption: false,
                selectFirst: true
            });

            // Llenar los select de departamentos de fechas
            render_select_departamentos({
                selector: "#id_departamento_fecha",
                data: ordenarDepartamentos(data),
                keepFirstOption: true,
                selectFirst: false
            });

            // Llenar la lista de departamentos para exportar
            render_exportar_departamentos(ordenarDepartamentos(data));
        },
        error: function () {
            console.error("Error al cargar departamentos");
        }
    });
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
 * @param {Object} config
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
 * Función para renderizar la tabla de días de pago por departamento en la SECCIÓN 1
 * @param {Array} departamentos Deptos con id_departamento y nombre_departamento para construir la tabla de días de pago
 */
function render_departamentos_dias_pago(departamentos) {
    // Limpiar tabla antes de renderizar
    let tbody = $("#cuerpo_tabla_dias_pago");
    tbody.empty();
    // Variable temporal para construir el HTML de las filas
    let tmp = ``;
    // Recorrer departamentos y construir filas
    departamentos.forEach((departamento, index) => {
        tmp += `
         <tr>
            <td>${departamento.nombre_departamento}</td>
            <td>
                <input type="number" class="form-control form-control-sm text-center" data-id="${departamento.id_departamento}" name="dias_dept[${departamento.id_departamento}]" placeholder="0">
            </td>
        </tr>
        `;
    });
    // Insertar filas en el tbody
    tbody.html(tmp);
}

/**
 * Función para renderizar la tabla de salarios por departamento en la SECCIÓN 2
 * @param {Array} departamentos Deptos con id_departamento y nombre_departamento para construir la tabla de salarios
 */
function render_departamentos_salarios(departamentos) {
    // Limpiar tabla antes de renderizar
    let tbody = $("#cuerpo_tabla_salarios");
    tbody.empty();
    // Variable temporal para construir el HTML de las filas
    let tmp = ``;
    // Recorrer departamentos y construir filas
    departamentos.forEach((departamento, index) => {
        tmp += `
        <tr>
            <td>${departamento.nombre_departamento}</td>
            <td>
                <div class="form-check form-check-inline">
                    <input class="form-check-input radio-salario" data-id="${departamento.id_departamento}" type="radio" name="tipo_salario_${departamento.id_departamento}" id="base_${departamento.id_departamento}" value="base" checked>
                    <label class="form-check-label" for="base_${departamento.id_departamento}">Base</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input radio-salario" data-id="${departamento.id_departamento}" type="radio" name="tipo_salario_${departamento.id_departamento}" id="manual_${departamento.id_departamento}" value="manual">
                    <label class="form-check-label" for="manual_${departamento.id_departamento}">Manual</label>
                </div>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm input-salario-manual" data-id="${departamento.id_departamento}" id="monto_${departamento.id_departamento}" disabled placeholder="0.00">
            </td>
        </tr>
        `;
    });
    // Insertar filas en el tbody
    tbody.html(tmp);
}

/**
 * Renderizar la lista de departamentos en el modal de exportación
 * @param {Array} data Array de departamentos con id_departamento y nombre_departamento
 */
function render_exportar_departamentos(data) {
    let tmp = ``;

    data.forEach(departamento => {
        tmp += `
        <label class="list-group-item list-group-item-action d-flex align-items-center py-3">
            <input
                class="form-check-input me-3 mt-0"
                type="checkbox" 
                value="${departamento.id_departamento}"
                id="departamento_${departamento.nombre_departamento}"
                data-id="${departamento.id_departamento}"
                data-nombre="${departamento.nombre_departamento}" 
                name="departamentos_seleccionados[]" checked>
            <span class="flex-grow-1 fw-medium">${departamento.nombre_departamento}</span>
        </label>
        `;
    });

    $('#contenedor_lista_deptamentos').html(tmp);
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
            // console.log(data);
            // Llenar el select de empresas de la tabla
            render_select_empresas(data);
        },
        error: function () {
            console.error("Error al cargar empresas");
        }
    });
}

/**
 * Renderizar la lista de empresas en el modal de exportación
 * @param {Array} data Array de empresas con id_empresa y nombre_empresa
 */
function render_select_empresas(data) {
    const select = $("#id_empresa");
    // Mantener la opción por defecto
    select.find("option:not(:first)").remove();

    data.forEach(function (depto) {
        select.append(
            `<option value="${depto.id_empresa}">${depto.nombre_empresa}</option>`
        );
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
    $("#seccion_2_salarios").addClass("d-none");
    $("#cuerpo_config_ptu").addClass("d-none");
    // MOSTRAR TABLA PRINCIPAL
    $("#seccion_3_resultados").removeClass("d-none");

    // PREPARAR INTERFAZ CON LOS DATOS CARGADOS
    preparar_interfaz();
}

/**
 * Función para mostrar formulario y ocultar tabla principal
 */
function mostrar_formulario() {
    // OCULTAR TABLA PRINCIPAL
    $("#seccion_3_resultados").addClass("d-none");
    // MOSTRAR FORMULARIO DE CONFIGURACIÓN
    $("#seccion_1_configuracion").removeClass("d-none");
    $("#seccion_2_salarios").removeClass("d-none");
    $("#cuerpo_config_ptu").removeClass("d-none");
}


// =============================================================================================================
// =============================================================================================================

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

    if (json) {
        // Si hay datos en storage, cargarlos en la variable global jsonUtilidad
        window.jsonUtilidad = json;

        console.log("DATOS CARGADOS DEL STORAGE: ", window.jsonUtilidad);
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


/**
 * Eventos para hacer que los modales sean arrastrables usando jQuery UI
 */
$(".modal-dialog").draggable({
    handle: ".modal-header"
});