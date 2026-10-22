// ===============================
// VARIABLE GLOBAL
// ===============================
window.jsonAguinaldo = null;

// Constantes y variables globales
const RUTA_RAIZ = window.rutaRaiz || '/sistema_saao';

// RECUPERAR DATOS DE LA URL
const params = new URLSearchParams(window.location.search);
// Recuperar el valor de "cv"
const cv = params.get("cv");

// Modales
const modal_editar = new bootstrap.Modal(document.getElementById('modal_editar'));
const modal_configuracion = new bootstrap.Modal(document.getElementById('modal_configuracion'));
const modal_reporte_excel = new bootstrap.Modal(document.getElementById('modal_reporte_excel'));
const modal_empleados_sin_derecho = new bootstrap.Modal(document.getElementById('modal_empleados_sin_derecho'));
const modal_visibilidad = new bootstrap.Modal(document.getElementById('modal_visibilidad'));
const modal_redondeos = new bootstrap.Modal(document.getElementById('modal_redondeos'));
const modal_dispersion_tarjeta = new bootstrap.Modal(document.getElementById('modal_dispersion_tarjeta'));
const modal_tarjeta = new bootstrap.Modal(document.getElementById('modal_tarjeta'));

// Menu contextual
const $menu_contexto = $('#context_menu');
let filaSeleccionada = null; // Variable para almacenar la fila seleccionada en el menú contextual


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
    if (!data) return;

    let objToStore;
    if (data && typeof data === 'object' && !Array.isArray(data) && ('empleados' in data || 'anio' in data)) {
        objToStore = { ...data };
        if (anio && !objToStore.anio) objToStore.anio = anio;
        if (config !== undefined && objToStore.configuraciones === undefined) objToStore.configuraciones = config;
    } else {
        const currentAnio = anio || (window.jsonAguinaldo && window.jsonAguinaldo.anio) || parseInt($('#anio').val()) || parseInt($('#anio_calculo_label').text()) || new Date().getFullYear();
        const currentDepto = (window.jsonAguinaldo && window.jsonAguinaldo.id_departamento) || parseInt($('#id_departamento_confg').val()) || parseInt($('#id_departamento').val()) || null;
        objToStore = {
            anio: currentAnio,
            id_departamento: currentDepto,
            configuraciones: config || 0,
            empleados: Array.isArray(data) ? data : []
        };
    }

    localStorage.setItem("aguinaldo", JSON.stringify(objToStore));
}

/**
 * Función para obtener datos de localStorage
 * @returns {Object|null} Objeto con la información del aguinaldo
 */
function getStorage() {
    const data = localStorage.getItem("aguinaldo");

    if (!data) return null;

    try {
        const obj = JSON.parse(data);
        if (!obj) return null;

        // Si ya es el objeto completo con empleados y (anio o id_departamento)
        if (obj.empleados && (Array.isArray(obj.empleados) && (obj.anio || obj.id_departamento))) {
            return obj;
        }

        // Si fue guardado anidado por versiones anteriores
        if (obj.empleados && typeof obj.empleados === 'object' && !Array.isArray(obj.empleados) && obj.empleados.empleados) {
            return obj.empleados;
        }

        // Si solo contiene un arreglo de empleados
        if (Array.isArray(obj)) {
            const primerDepto = obj.length > 0 && obj[0].id_departamento ? obj[0].id_departamento : null;
            return {
                anio: parseInt($('#anio').val()) || parseInt($('#anio_calculo_label').text()) || new Date().getFullYear(),
                id_departamento: parseInt($('#id_departamento_confg').val()) || parseInt($('#id_departamento').val()) || primerDepto,
                configuraciones: 0,
                empleados: obj
            };
        }

        // Si contiene empleados como arreglo pero faltan propiedades superiores
        if (Array.isArray(obj.empleados)) {
            const primerDepto = obj.empleados.length > 0 && obj.empleados[0].id_departamento ? obj.empleados[0].id_departamento : null;
            return {
                anio: obj.anio || parseInt($('#anio').val()) || parseInt($('#anio_calculo_label').text()) || new Date().getFullYear(),
                id_departamento: obj.id_departamento || parseInt($('#id_departamento_confg').val()) || parseInt($('#id_departamento').val()) || primerDepto,
                configuraciones: obj.configuracion || obj.configuraciones || 0,
                empleados: obj.empleados
            };
        }

        return obj;
    } catch (e) {
        console.error("Error parseando storage", e);
        return null;
    }
}

/**
 * Función para limpiar datos de localStorage
 */
function clearStorage() {
    localStorage.removeItem("aguinaldo");
    window.jsonAguinaldo = null;
}


// ===============================
// ESTADO (CONTROLADO)
// ===============================

/**
 * Función para establecer los datos del jsonAguinaldo
 * @param {Array|Object} data Información de los empleados o estructura completa
 */
function setAguinaldo(data) {
    if (!data) {
        window.jsonAguinaldo = null;
        return;
    }

    // Asegurar estructura de objeto consistente
    if (Array.isArray(data)) {
        const primerDepto = data.length > 0 && data[0].id_departamento ? data[0].id_departamento : null;
        const anio = (window.jsonAguinaldo && window.jsonAguinaldo.anio) || parseInt($('#anio').val()) || parseInt($('#anio_calculo_label').text()) || new Date().getFullYear();
        const id_depto = (window.jsonAguinaldo && window.jsonAguinaldo.id_departamento) || parseInt($('#id_departamento_confg').val()) || parseInt($('#id_departamento').val()) || primerDepto;
        window.jsonAguinaldo = {
            configuraciones: 0,
            id_departamento: id_depto,
            empleados: data,
            anio: anio,
            dias_pago_general: 15
        };
    } else {
        window.jsonAguinaldo = data;
    }

    syncStorage();
}

/**
 * Función para obtener los datos del jsonAguinaldo
 * @returns {Array} Información de los empleados
 */
function getAguinaldo() {
    return window.jsonAguinaldo;
}

/**
 * Función para sincronizar el estado del jsonAguinaldo con localStorage
 * @returns {void}
 */
function syncStorage() {
    if (!window.jsonAguinaldo) return;
    setStorage(window.jsonAguinaldo);
}


// =============================================================
// FUNCIONES COMPLEMENTARIAS PARA MANEJO DE INTERFAZ Y PROCESOS
// =============================================================

/**
 * Función para buscar los años ingresados en la base de datos
 */
function buscar_anio() {
    $("#anio").autocomplete({
        source: function (request, response) {
            // request.term contiene el valor que el usuario ha ingresado en el input
            // Se hace la petición AJAX al servidor para obtener los años que coincidan con el término de búsqueda
            $.ajax({
                url: "php/aguinaldo.php",
                type: "GET",
                data: {
                    buscar: request.term,
                    accion: "buscar_anio"
                },
                dataType: "json",
                success: function (result) {
                    const aniosUnicos = [];
                    const vistos = new Set();
                    (result.data || []).forEach(function (item) {
                        if (item && item.anio && !vistos.has(item.anio)) {
                            vistos.add(item.anio);
                            aniosUnicos.push({
                                label: item.anio,
                                value: item.anio
                            });
                        }
                    });
                    response(aniosUnicos);
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
 * Función para mostrar la tabla de resultados del aguinaldo y
 * Oculta el formulario de ingreso de año y muestra la tabla con los resultados del cálculo del aguinaldo
 */
function mostrar_tabla() {
    // Agregar clase para ocultar el formulario
    $("#contenedor_formulario").addClass("d-none");
    // Eliminar clase para mostrar la tabla
    $("#contenedor_tabla_aguinaldo").removeClass("d-none");
    // Resetear el formulario para evitar confusiones
    resetear_formulario();
}

/**
 * Funcion para mostrar el formulario de ingreso de año
 * y ocultar la tabla de resultados del aguinaldo
 */
function mostrar_formulario() {
    // Agregar clase para ocultar la tabla
    $("#contenedor_tabla_aguinaldo").addClass("d-none");
    // Eliminar clase para mostrar el formulario
    $("#contenedor_formulario").removeClass("d-none");
    // Resetear el formulario para evitar confusiones
    resetear_formulario();
    // Limpiar el body de la tabla
    $('#cuerpo_tabla_aguinaldo').empty();
}

/**
 * Función paa resetear el formulario
 */
function resetear_formulario() {
    $("#form_aguinaldo")[0].reset();
}


/**
 * ================================================================================================
 * LLENAR DONDE SE HAGA USO DE LOS DEPARTAMENTOS EN LOS MODALES o INTERFAZ
 * ================================================================================================
 */

/**
 * Obtener la lista de departamentos para el filtro
 */
function obtener_departamentos() {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerDepartamentos.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
            // console.log(data);
            let depa_ordenado = ordenarDepartamentos(data);

            // Llenar los select de departamentos para la configuración del aguinaldo
            render_departamentos({
                selector: "#id_departamento_confg",
                data: ordenarDepartamentos(data),
                keepFirstOption: true,
                selectFirst: false
            });

            // Llenar los select de departamentos principal
            /*
            render_departamentos({
                selector: "#id_departamento",
                data: ordenarDepartamentos(data),
                keepFirstOption: true,
                selectFirst: false
            });
            */

            // Llenar SIEMPRE el select de departamentos del modal de visibilidad con todos los departamentos
            render_departamentos({
                selector: "#select_departamento_visibilidad",
                data: ordenarDepartamentos(data),
                keepFirstOption: true,
                selectFirst: false
            });

            let aguinaldo = getAguinaldo();
            if (aguinaldo && aguinaldo.id_departamento) {
                // DEBE SER FILTER PORQUE render_select_departamentos ACEPTA UN ARRAY DE DEPARTAMENTOS
                let depa_seleccionado = depa_ordenado.filter(d => d.id_departamento == aguinaldo.id_departamento);

                // Llenar los select de departamentos de la tabla principal
                render_departamentos({
                    selector: "#id_departamento",
                    data: depa_seleccionado,
                    keepFirstOption: false,
                    selectFirst: false
                });
                // Desbloquear select de departamento en vista principal
                $('#id_departamento').prop('disabled', false);

                // Llenar los select de departamentos en los modales de visibilidad
                render_departamentos({
                    selector: "#select_departamento_visibilidad",
                    data: depa_seleccionado,
                    keepFirstOption: false,
                    selectFirst: true
                });
                // Desbloquear select de departamento en modal visibilidad
                $('#select_departamento_visibilidad').prop('disabled', false);

                // Llenar los select de departamentos en los modales de redondeos
                render_departamentos({
                    selector: "#select_departamento_redondeos",
                    data: depa_seleccionado,
                    keepFirstOption: false,
                    selectFirst: true
                });

                // Llenar los select de departamentos en los modales de empleados sin derecho a aguinaldo
                render_departamentos({
                    selector: "#select_departamento_sin_derecho",
                    data: depa_seleccionado,
                    keepFirstOption: false,
                    selectFirst: true
                });
                // Desbloquear select de departamento en modal sin derecho
                $('#select_departamento_sin_derecho').prop('disabled', false);

                // Llenar los select de departamentos en los modales de redondeos
                render_departamentos({
                    selector: "#select_departamento_redondeos",
                    data: depa_seleccionado,
                    keepFirstOption: false,
                    selectFirst: true
                });
                // Desbloquear select de departamento en modal redondeos
                $('#select_departamento_redondeos').prop('disabled', false);

                // Llenar los select de departamentos en el modal de dispersión de tarjetas
                render_departamentos({
                    selector: "#select_departamento_tarjeta",
                    data: depa_seleccionado,
                    keepFirstOption: false,
                    selectFirst: true
                });

                // Llenar los select de departamentos en el modal de configuración
                render_departamentos({
                    selector: "#departamento_configuracion",
                    data: depa_seleccionado,
                    keepFirstOption: true,
                    selectFirst: true
                });

                // Llenar los select de departamentos en el modal de exportación
                render_exportar_departamentos(depa_seleccionado, aguinaldo.id_departamento);
            }
        },
        error: function () {
            console.error("Error al cargar departamentos");
        }
    });
}

/**
 * Ordenar los departamentos alfabéticamente por su nombre, ignorando mayúsculas y acentos
 * @param {Array} departamentos Array de departamentos con id_departamento y nombre_departamento
 * @returns Array de departamentos ordenados alfabéticamente por nombre_departamento
 */
function ordenarDepartamentos(departamentos) {
    return departamentos.sort((a, b) =>
        a.nombre_departamento.localeCompare(b.nombre_departamento, 'es', {
            sensitivity: 'base'
        })
    );
}

/**
 * Renderizar la lista de departamentos en el modal de exportación
 * @param {Array} data Array de departamentos con id_departamento y nombre_departamento
 * @param {number} id_departamento_seleccionado ID del departamento seleccionado
 */
function render_exportar_departamentos(data, id_departamento_seleccionado) {
    let tmp = ``;

    data.forEach(departamento => {
        if (departamento.id_departamento == id_departamento_seleccionado) {
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
        }
    });

    $('#contenedor_lista_deptamentos').html(tmp);
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
function render_departamentos({
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
            // Llenar el select de empresas del modal de visibilidad
            render_select_empresas_visibilidad(data);
            // Llenar el select de empresas del modal sin derecho
            render_select_empresas_sin_derecho(data);
            // Llenar el select de empresas del modal redondeos
            render_select_empresas_redondeos(data);
        },
        error: function () {
            console.error("Error al cargar empresas");
        }
    });
}

/**
 * Función para obtener las áreas
 */
function obtener_areas() {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerAreas.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
            // console.log(data);
            // Llenar el select de áreas del modal de visibilidad
            render_select_areas_visibilidad(data);
            // Llenar el select de áreas de la vista principal
            render_select_areas(data);
            // Llenar el select de áreas del modal sin derecho
            render_select_areas_sin_derecho(data);
            // Llenar el select de áreas del modal redondeos
            render_select_areas_redondeos(data);
        },
        error: function () {
            console.error("Error al cargar áreas");
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
 * Renderizar la lista de áreas en la vista principal
 * @param {Array} data Array de áreas con id_area y nombre_area
 */
function render_select_areas(data) {
    const select = $("#id_area");
    // Mantener la opción por defecto
    select.find("option:not(:first)").remove();

    data.forEach(function (area) {
        select.append(
            `<option value="${area.id_area}">${area.nombre_area}</option>`
        );
    });
}

/**
 * Renderizar la lista de empresas en el modal de visibilidad
 * @param {Array} data Array de empresas con id_empresa y nombre_empresa
 */
function render_select_empresas_visibilidad(data) {
    const select = $("#select_empresa_visibilidad");
    // Mantener la opción por defecto
    select.find("option:not(:first)").remove();

    data.forEach(function (empresa) {
        select.append(
            `<option value="${empresa.id_empresa}">${empresa.nombre_empresa}</option>`
        );
    });
}

/**
 * Renderizar la lista de áreas en el modal de visibilidad
 * @param {Array} data Array de áreas con id_area y nombre_area
 */
function render_select_areas_visibilidad(data) {
    const select = $("#select_area_visibilidad");
    // Mantener la opción por defecto
    select.find("option:not(:first)").remove();

    data.forEach(function (area) {
        select.append(
            `<option value="${area.id_area}">${area.nombre_area}</option>`
        );
    });
}

/**
 * Renderizar la lista de empresas en el modal sin derecho
 * @param {Array} data Array de empresas con id_empresa y nombre_empresa
 */
function render_select_empresas_sin_derecho(data) {
    const select = $("#select_empresa_sin_derecho");
    // Mantener la opción por defecto
    select.find("option:not(:first)").remove();

    data.forEach(function (empresa) {
        select.append(
            `<option value="${empresa.id_empresa}">${empresa.nombre_empresa}</option>`
        );
    });
}

/**
 * Renderizar la lista de áreas en el modal sin derecho
 * @param {Array} data Array de áreas con id_area y nombre_area
 */
function render_select_areas_sin_derecho(data) {
    const select = $("#select_area_sin_derecho");
    // Mantener la opción por defecto
    select.find("option:not(:first)").remove();

    data.forEach(function (area) {
        select.append(
            `<option value="${area.id_area}">${area.nombre_area}</option>`
        );
    });
}

/**
 * Renderizar la lista de empresas en el modal redondeos
 * @param {Array} data Array de empresas con id_empresa y nombre_empresa
 */
function render_select_empresas_redondeos(data) {
    const select = $("#select_empresa_redondeos");
    // Mantener la opción por defecto
    select.find("option:not(:first)").remove();

    data.forEach(function (empresa) {
        select.append(
            `<option value="${empresa.id_empresa}">${empresa.nombre_empresa}</option>`
        );
    });
}

/**
 * Renderizar la lista de áreas en el modal redondeos
 * @param {Array} data Array de áreas con id_area y nombre_area
 */
function render_select_areas_redondeos(data) {
    const select = $("#select_area_redondeos");
    // Mantener la opción por defecto
    select.find("option:not(:first)").remove();

    data.forEach(function (area) {
        select.append(
            `<option value="${area.id_area}">${area.nombre_area}</option>`
        );
    });
}

/**
 * Formatear una fecha en el formato DD/MM/YYYY
 * @param {String} fecha Fecha en formato YYYY-MM-DD
 * @returns Fecha con el formato DD/MM/YYYY
 */
function formatearFecha(fecha) {
    if (!fecha) return "N/A"; // null, undefined, "", 0, etc.

    const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
        "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

    const partes = fecha.split("-");

    // Validación básica del formato
    if (partes.length !== 3) return "N/A";

    const anio = partes[0];
    const mesIndex = parseInt(partes[1], 10) - 1;
    const dia = partes[2];

    // Validar que el mes sea correcto
    if (mesIndex < 0 || mesIndex > 11) return "N/A";

    const mes = meses[mesIndex];

    return `${dia}/${mes}/${anio}`;
}

// ===============================
// INICIALIZACIÓN Y CONTROL DE PROCESOS
// ===============================

/**
 * Función para inicializar el estado de jsonAguinaldo al cargar la página
 * @returns {void}
 */
function initAguinaldo() {
    // Obtener la lista de departamentos para el filtro
    obtener_departamentos();
    // Obtener la lista de empresas para el filtro
    obtener_empresas();
    // Obtener la lista de áreas para el filtro
    obtener_areas();
    // Obtener los años ingresados en la base de datos para el autocomplete
    buscar_anio();

    // Intentar cargar datos desde localStorage
    const data = getStorage();

    if (data) {
        window.jsonAguinaldo = data;
        console.log("Datos cargados desde localStorage");
        console.log(window.jsonAguinaldo);

        // Se llena la tabla con los datos obtenidos del storage
        llenar_tabla_aguinaldo();
        // Se muestra la tabla y se oculta el formulario
        mostrar_tabla();
    } else {
        window.jsonAguinaldo = [];
        console.log("Sin datos en storage");
        // Se muestra el formulario y se oculta la tabla
        mostrar_formulario();
    }
}


// ===============================
// Inicialización al cargar la página
// ===============================


$(document).ready(function () {

    initAguinaldo();

});