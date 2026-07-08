// Constantes y variables globales
const RUTA_RAIZ = rutaRaiz + "/gestion_ranchos";

let vales = [];
// Variable global para almacenar el historial de cortes
let historial = null;
let valeActual = null;

// Array con los nombres de los meses
const nombresMeses = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

// MODALES
const modal_detalles_corte = new bootstrap.Modal(document.getElementById('modal_detalles_corte'));
const modal_nuevo_vale = new bootstrap.Modal(document.getElementById('modal_nuevo_vale'));
const modal_editar_vale = new bootstrap.Modal(document.getElementById('modal_editar_vale'));
const modal_ranking = new bootstrap.Modal(document.getElementById('modal_ranking'));

/**
 * Función para recuperar los ranchos de la base de datos
 */
function obtener_ranchos() {
    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/php/gestion_corte.php",
        data: {
            accion: "obtener_ranchos"
        },
        dataType: "json",
        success: function (response) {
            // Obtener solo la data de los ranchos
            let ranchos = response.data;
            // LIMPIAR EL SELECTOR DE RANCHOS
            $("#select_rancho").empty();
            $("#select_rancho_nuevo").empty();
            // Agregar una opción por defecto
            // $("#select_rancho").append('<option value="-1">--- Seleccionar ---</option>');
            $("#select_rancho_nuevo").append('<option value="-1">--- Seleccionar ---</option>');
            $("#select_rancho_editar").append('<option value="-1">--- Seleccionar ---</option>');
            // Limpiar el nombre del rancho
            ranchos.forEach(ra => {
                ra.nombre_area = quitarPalabraRancho(ra.nombre_area);
                // LLENAR EL SELECT DE LOS FILTROS PRINCIPALES
                $("#select_rancho").append('<option value="' + ra.nombre_area + '">' + ra.nombre_area + '</option>');
                // LLENAR EL SELECT DEL MODAL DE NUEVO VALE
                $("#select_rancho_nuevo").append('<option value="' + ra.nombre_area + '">' + ra.nombre_area + '</option>');
                // LLENAR EL SELECT DEL MODAL DE EDITAR VALE
                $("#select_rancho_editar").append('<option value="' + ra.nombre_area + '">' + ra.nombre_area + '</option>');
            });

            $("#select_rancho option:eq(0)").prop("selected", true);
            // Dispara el evento "change" del select
            $("#select_rancho").trigger("change");

            // Llenar la tabla de resultados con los cortes del rancho 
            obtener_cortes();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("error", "Ocurrió un error", "No se pudieron cargar los empleados. Contacta a sistemas.");
        }
    });
}

// ============================================================================================
// EVENTOS DEL FILTRADO
// ============================================================================================

// EVENTO: OBTENER LOS AÑOS DE CORTES DISPONIBLES PARA EL RANCHO SELECCIONADO
$(document).on('change', '#select_rancho', function (e) {
    e.preventDefault();
    // OBTENER EL RANCHO QUE FUE SELECCIONADO
    let ranchoSeleccionado = $(this).val().toLowerCase();

    if (ranchoSeleccionado === "-1") {
        // Si no se seleccionó un rancho, limpiar los selectores de año, mes y semana
        $("#select_anio").empty().append('<option value="-1">--- Seleccionar ---</option>');
        $("#select_mes").empty().append('<option value="-1">--- Seleccionar ---</option>');
        $("#select_semana").empty().append('<option value="-1">--- Seleccionar ---</option>');
        return; // Salir de la función si no hay rancho seleccionado
    }

    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/php/gestion_corte.php",
        data: {
            accion: "obtener_anios_cortes",
            nombre_rancho: ranchoSeleccionado
        },
        dataType: "json",
        success: function (response) {
            // RECUPERAR SOLO LOS AÑOS DE LA RESPUESTA
            let data = response.data;
            // LIMPIAR EL SELECTOR DE AÑOS
            $("#select_anio").empty();
            // Agregar una opción por defecto
            $("#select_anio").append('<option value="-1">--- Seleccionar ---</option>');
            // Agregar los años al selector
            data.forEach(anio => {
                $("#select_anio").append('<option value="' + anio.anio + '">' + anio.anio + '</option>');
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("error", "Ocurrió un error", "No se pudieron cargar los empleados. Contacta a sistemas.");
        }
    });
});

// EVENTO: OBTENER LOS MESES DE CORTES DISPONIBLES PARA EL RANCHO Y AÑO SELECCIONADO
$(document).on('change', '#select_anio', function (e) {
    e.preventDefault();
    // OBTENER EL RANCHO QUE FUE SELECCIONADO
    let ranchoSeleccionado = $("#select_rancho").val().toLowerCase();
    let anioSeleccionado = $(this).val();

    if (anioSeleccionado === "-1") {
        // Si no se seleccionó un año, limpiar los selectores de mes y semana
        $("#select_mes").empty().append('<option value="-1">--- Seleccionar ---</option>');
        $("#select_semana").empty().append('<option value="-1">--- Seleccionar ---</option>');
        return; // Salir de la función si no hay año seleccionado
    }

    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/php/gestion_corte.php",
        data: {
            accion: "obtener_meses_cortes",
            nombre_rancho: ranchoSeleccionado,
            anio: anioSeleccionado
        },
        dataType: "json",
        success: function (response) {
            // RECUPERAR SOLO LOS MESES DE LA RESPUESTA
            let data = response.data;
            // LIMPIAR EL SELECTOR DE MESES
            $("#select_mes").empty();
            // Agregar una opción por defecto
            $("#select_mes").append('<option value="-1">--- Seleccionar ---</option>');
            // Agregar los meses al selector
            // Agregar los meses al selector
            data.forEach(mes => {
                // mes.mes es un número (ej. 4), restamos 1 porque el array empieza en 0
                let nombreMes = nombresMeses[mes.mes - 1];
                $("#select_mes").append('<option value="' + mes.mes + '">' + nombreMes + '</option>');
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("error", "Ocurrió un error", "No se pudieron cargar los empleados. Contacta a sistemas.");
        }
    });
});

// EVENTO: OBTENER LAS SEMANAS DEL MES SELECCIONADO PARA EL RANCHO Y AÑO SELECCIONADO
$(document).on('change', '#select_mes', function (e) {
    e.preventDefault();
    // OBTENER EL RANCHO QUE FUE SELECCIONADO
    let ranchoSeleccionado = $("#select_rancho").val().toLowerCase();
    let anioSeleccionado = $("#select_anio").val();
    let mesSeleccionado = $(this).val();

    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/php/gestion_corte.php",
        data: {
            accion: "obtener_semanas_cortes",
            nombre_rancho: ranchoSeleccionado,
            anio: anioSeleccionado,
            mes: mesSeleccionado
        },
        dataType: "json",
        success: function (response) {
            // RECUPERAR SOLO LAS SEMANAS DE LA RESPUESTA
            let data = response.data;
            // LIMPIAR EL SELECTOR DE SEMANAS
            $("#select_semana").empty();
            // Agregar una opción por defecto
            $("#select_semana").append('<option value="-1">--- Seleccionar ---</option>');
            // Agregar las semanas al selector
            data.forEach(semana => {
                $("#select_semana").append('<option value="' + semana.semana + '"> Semana ' + semana.semana + '</option>');
            });

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("error", "Ocurrió un error", "No se pudieron cargar los empleados. Contacta a sistemas.");
        }
    });
});


// ============================================================================================
// EVENTO DE BUSQUEDA DE HISTORIAL
// ============================================================================================

// EVENTO: BUSCAR EL HISTORIAL DEL CORTE
$(document).on('click', '#btn_filtrar', function (e) {
    e.preventDefault();
    obtener_cortes();
});


/**
 * Función para llenar la tabla de resultados del historial de cortes
 */
function obtener_cortes() {
    // OBTENER EL RANCHO SELECCIONADO
    let nombre_rancho = $("#select_rancho").val();
    let anio = $("#select_anio").val();
    let mes = $("#select_mes").val();
    let semana = $("#select_semana").val();

    // VALIDAR QUE SE HAYA SELECCIONADO UN RANCHO
    if (nombre_rancho == "-1") {
        alerta("info", "Selecciona un rancho", "Debes seleccionar un rancho para filtrar el historial de cortes.");
        return;
    }

    // ENVIAR LA INFORMACION AL SERVIDOR PARA OBTENER EL HISTORIAL DE CORTES
    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/php/gestion_corte.php",
        data: {
            accion: "obtener_cortes",
            nombre_rancho: nombre_rancho,
            anio: anio,
            mes: mes,
            semana: semana
        },
        dataType: "json",
        success: function (response) {
            // RECUPERAR SOLO LOS CORTES DE LA RESPUESTA
            vales = response.data;
            historial = vales;

            console.log(historial);

            // LLENAR LA TABLA DE RESULTADOS CON LOS CORTES OBTENIDOS
            llenar_resultados_historial();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("error", "Ocurrió un error", "No se pudieron cargar los empleados. Contacta a sistemas.");
        }
    });
}


/**
 * Función para llenar la tabla de resultados del historial de cortes
 */
function llenar_resultados_historial() {
    // --------------------------------------------------------
    // COSAS PARA LA SECCION DE LAS TARJETAS DE RESUMEN
    // --------------------------------------------------------

    // OBTENER EL TOTAL DE REJAS DE TODOS LOS CORTES
    $('#label_total_rejas_general').text(obtenerTotalRejasGeneral(vales));
    // OBTENER EL TOTAL DE GASTOS DE TODOS LOS CORTES
    $('#label_total_gastos_general').text(`$ ${calcularTotalGastosGeneral(vales).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    // OBTENER LA TABLA CON MÁS REJAS
    const tablaMasRejas = tablaConMasRejasGeneral(vales);
    $('#label_tabla_mas_rejas_general').text(`T${tablaMasRejas.num_tabla} / ${tablaMasRejas.total_rejas} rejas`);

    // --------------------------------------------------------
    // COSAS PARA LA SECCION DE LA TABLA 
    // --------------------------------------------------------

    // DATOS PARA HACER LA PAGINACION
    const limite = parseInt($('#select_limite').val()) || 10;
    let paginaActual = parseInt($('#pagina-actual').data('pagina')) || 1;

    // DATOS DE ORDENAMIENTO
    let ordenar = $('#select_columna').val() || 'folio';
    let direccion = $('#select_direccion').val() || 'ASC';

    // Ordenamiento dinámico
    vales.sort((a, b) => {
        let valorA, valorB;

        switch (ordenar) {
            case 'folio':
                valorA = parseInt(a.folio);
                valorB = parseInt(b.folio);
                break;
            case 'fecha_corte':
                valorA = new Date(a.fecha_corte);
                valorB = new Date(b.fecha_corte);
                break;
            case 'nombre_cortador':
                valorA = a.nombre_cortador.toLowerCase();
                valorB = b.nombre_cortador.toLowerCase();
                break;
            case 'total_rejas':
                valorA = calcularTotalRejas(a);
                valorB = calcularTotalRejas(b);
                break;
            default:
                valorA = parseInt(a.folio);
                valorB = parseInt(b.folio);
        }

        if (valorA < valorB) return direccion === 'ASC' ? -1 : 1;
        if (valorA > valorB) return direccion === 'ASC' ? 1 : -1;
        return 0;
    });

    // CALCULAR EL INICIO Y EL FIN
    let inicio = 0;
    let fin = vales.length;

    // SI ES DIFERENTE DE -1, SE HACE LA PAGINACION
    if (limite !== -1) {
        inicio = (paginaActual - 1) * limite;
        fin = inicio + limite;
    }

    // OBTENER LOS EMPLEADOS A MOSTRAR EN LA PAGINA ACTUAL
    const valesPagina = vales.slice(inicio, fin);
    const totalPaginas = limite === -1 ? 1 : Math.ceil(vales.length / limite);

    // VACIAR EL CUERPO DE LA TABLA
    $("#cuerpo_tabla_historial_corte").empty();

    // VALIDAR QUE HAYA CORTES DISPONIBLES
    if (valesPagina.length === 0) {
        $("#cuerpo_tabla_historial_corte").html(`
                    <tr>
                        <td colspan="9" class="text-center">No hay cortes disponibles</td>
                    </tr>
                `);
        return;
    }

    // RECORRER LOS CORTES Y AGREGARLOS A LA TABLA
    valesPagina.forEach((vale, index) => {
        // CONTADOR PARA LA TABLA, SE LE SUMA 1 PARA QUE EMPIECE EN 1 Y NO EN 0
        const contador = inicio + index + 1;
        // Índice global en el arreglo vales
        const indexGlobal = inicio + index;

        // DEFINIR EL ESTADO DEL VALE
        const estado = vale.estado ? `<span class="badge bg-success">Activo</span>` : `<span class="badge bg-danger">Cancelado</span>`;
        // DEFINIR SI TIENE O NO NOMINA
        const nomina = vale.anio ? `Sem ${ formatoDosDigitos(vale.numero_semana) } / ${ vale.anio }` : `<em class="text-muted">Pendiente</em>`;

        // TABLAS INVOLUCRADAS Y TOTAL REJAS
        let tablas = "";
        let total_rejas = 0;
        vale.rejas.forEach(reja => {
            // OBTENER TABLAS INVOLUCRADAS
            tablas += `<span
                        class="badge bg-dark-subtle text-dark-emphasis rounded-1 me-1"
                        title="Tabla ${reja.num_tabla} - Rejas extendidas: ${reja.rejas}"
                        >T${reja.num_tabla}: ${reja.rejas}</span>`;
            // OBTENER LA SUMA TOTAL DE REJAS
            total_rejas += reja.rejas;
        });

        // BOTON PARA CANCELAR O ACTIVAR EL CORTE
        let boton_estado = "";
        if (vale.estado) {
            boton_estado = `
                    <button class="dropdown-item text-primary btn_cambiar_estado" data-id="${vale.id_corte}" data-estado="${vale.estado}">
                        <i class="bi bi-x-circle me-2"></i>Cancelar
                    </button>
                    `;
        } else {
            boton_estado = `
                    <button class="dropdown-item text-primary btn_cambiar_estado" data-id="${vale.id_corte}" data-estado="${vale.estado}">
                        <i class="bi bi-check2-circle me-2"></i>Activar
                    </button>`;
        }

        // CREAR LA FILA DE LA TABLA
        const fila = `
        <tr data-index="${indexGlobal}">
            <td class="text-center fw-bold">${ formatoDosDigitos(contador) }</td>
            <td>${nomina}</td>
            <td>${vale.folio}</td>
            <td>${formatearFechaEspa(vale.fecha_corte)}</td>
            <td>${vale.nombre_cortador}</td>
            <td>${tablas}</td>
            <td class="text-center fw-bold ${ vale.estado ? 'text-primary' : 'text-danger' }">${total_rejas}</td>
            <td class="text-end ${ vale.estado ? 'text-success' : 'text-danger' }">${ formatoMoneda(vale.precio_reja) }</td>
            <td class="text-end fw-bold ${ vale.estado ? 'text-success' : 'text-danger' }">${ formatoMoneda(total_rejas * vale.precio_reja) }</td>
            <td class="text-center">${estado}</td>
            <td class="text-center bg-body-secondary">
                <input
                    ${ vale.estado ? '' : 'disabled' }
                    ${vale.seleccionado ? 'checked' : ''}
                    data-index="${indexGlobal}"
                    data-rejas='${total_rejas}'
                    class="form-check-input check_seleccionar_corte"
                    type="checkbox"
                    id="checkDefault-${indexGlobal}">
            </td>
            <td class="text-center">
                <div class="dropdown tb-action-dropdown">
                    <button class="btn btn-sm btn-light border-0" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu shadow pointer-events-auto">
                        <li>
                            <button
                                data-vale='${JSON.stringify(vale)}'
                                class="dropdown-item text-primary btn_ver_detalles_corte">
                                <i class="bi bi-eye me-2"></i>Ver detalles
                            </button>
                        </li>
                        <li>
                            <button
                                data-vale='${JSON.stringify(vale)}'
                                class="dropdown-item text-primary btn_modificar_corte">
                                <i class="bi bi-pencil-fill me-2"></i>Modificar
                            </button>
                        </li>
                        <li>${boton_estado}</li>
                        <li>
                            <button
                                class="dropdown-item text-danger btn_exportar_pdf_corte"
                                data-vale='${JSON.stringify(vale)}'>
                                <i class="bi bi-file-earmark-pdf me-2"></i>Exportar PDF
                            </button>
                        </li>
                    </ul>
                </div>
            </td>
        </tr>
        `;

        // AGREGAR LA FILA A LA TABLA
        $("#cuerpo_tabla_historial_corte").append(fila);
    });

    // RENDIZAR LA PAGINACION
    renderizarPaginacion(vales.length, paginaActual, limite);

    // QUITAR LA CLASE D-NONE DE LA SECCION DE RESULTADOS
    $("#seccion_tabla_resultados").removeClass("d-none");
    $("#seccion_tarjetas_resumen").removeClass("d-none");
}


/**
 * Renderizar los botones de paginación
 */
function renderizarPaginacion(totalVales, paginaActual, limite) {
    if (limite === -1) {
        $('#paginacion').empty();
        return;
    }

    const totalPaginas = Math.ceil(totalVales / limite);
    const paginacion = $('#paginacion');
    paginacion.empty();

    // Botón Inicio
    if (paginaActual > 1) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(1); return false;"><i class="bi bi-chevron-double-left me-1"></i>Inicio</a>
            </li>
        `);
    }

    // Botón anterior
    if (paginaActual > 1) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">Anterior</a>
            </li>
        `);
    }

    // Botones de páginas
    const rangoInicio = Math.max(1, paginaActual - 2);
    const rangoFin = Math.min(totalPaginas, paginaActual + 2);

    for (let i = rangoInicio; i <= rangoFin; i++) {
        const activa = i === paginaActual ? 'active' : '';
        paginacion.append(`
            <li class="page-item ${activa}">
                <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i}</a>
            </li>
        `);
    }

    // Botón siguiente
    if (paginaActual < totalPaginas) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">Siguiente</a>
            </li>
        `);
    }

    // Botón Final
    if (paginaActual < totalPaginas) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(${totalPaginas}); return false;">Final <i class="bi bi-chevron-double-right ms-1"></i></a>
            </li>
        `);
    }
}

/**
 * Cambiar a una página específica
 */
function cambiarPagina(nuevaPagina) {
    $('#pagina-actual').data('pagina', nuevaPagina);
    llenar_resultados_historial();
}

// EVENTOS PARA CONTROLAR LA PAGINACION Y EL LIMITE DE RESULTADOS POR PAGINA
$(document).ready(function () {
    // Evento de límite por página
    $('#select_limite').on('change', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_resultados_historial();
    });

    // Evento de ordenamiento por columna
    $('#select_columna, #select_direccion').on('change', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_resultados_historial();
    });

    // Inicializar variable de página actual si no existe
    if (!$('#pagina-actual').length) {
        $('body').append('<div id="pagina-actual" data-pagina="1" style="display:none;"></div>');
    }
});

// ============================================================================================
// FUNCIONES AUXILIARES PARA PRESENTAR LA SECCION DE RESULTADOS
// ============================================================================================

/**
 * Calcula el total de rejas para un corte específico
 * @param {*} vale 
 * @returns 
 */
function calcularTotalRejas(vale) {
    return vale.rejas.reduce((acc, r) => acc + r.rejas, 0);
}

/**
 * Funcion para sumar todas las rejas de todos los cortes
 * @param {Array} data Data de cortes que contiene un arreglo de rejas 
 * @returns 
 */
function obtenerTotalRejasGeneral(data) {
    let total = 0;

    data.forEach(item => {
        if (item.estado === 1) { // Solo sumar rejas de cortes activos
            item.rejas.forEach(r => {
                total += r.rejas;
            });
        }
    });

    return total;
}

/**
 * Función para calcular el total de gastos de todos los cortes
 * @param {Array} data Data de cortes que contiene un arreglo de rejas 
 * @returns 
 */
function calcularTotalGastosGeneral(data) {
    let total = 0;

    data.forEach(item => {
        if (item.estado === 1) { // Solo calcular gastos de cortes activos
            item.rejas.forEach(r => {
                total += item.precio_reja * r.rejas;
            });
        }
    });

    return total;
}

/**
 * Encuentra la tabla con más rejas
 * @param {Array} data - Arreglo de cortes
 * @returns {Object} - { num_tabla, total_rejas }
 */
function tablaConMasRejasGeneral(data) {
    const acumulados = {};

    // Acumular rejas por num_tabla
    data.forEach(item => {
        if (item.estado === 1) { // Solo considerar cortes activos
            item.rejas.forEach(r => {
                acumulados[r.num_tabla] = (acumulados[r.num_tabla] || 0) + r.rejas;
            });
        }
    });

    // Buscar el máximo
    let maxTabla = null;
    let maxRejas = 0;
    for (const [tabla, total] of Object.entries(acumulados)) {
        if (total > maxRejas) {
            maxTabla = tabla;
            maxRejas = total;
        }
    }

    return { num_tabla: parseInt(maxTabla, 10), total_rejas: maxRejas };
}


// ============================================================================================
// SECCION PARA DAR FUNCIONALIDAD A LA COLUMNA DE OPCIONES
// ============================================================================================

// EVENTO: VER DETALLES DE UN CORTE
$(document).on('click', '.btn_ver_detalles_corte', function (e) {
    e.preventDefault();
    // OBTENER EL VALE DEL CORTE
    let vale = $(this).data('vale');
    valeActual = vale;

    // LLENAR EL MODAL CON LOS DETALLES DEL CORTE
    $("#label_detalle_corte").text(vale.folio);
    $("#label_detalle_cortador").text(vale.nombre_cortador);
    $("#label_detalle_fecha").text(formatearFechaEspa(vale.fecha_corte));
    // VER SI TIENE NOMINA O NO, SI NO TIENE NOMINA, PONER "PENDIENTE"
    const nomina = vale.anio ? `Sem ${ formatoDosDigitos(vale.numero_semana) } / ${vale.anio}` : `<em class="text-muted">Pendiente</em>`;
    $("#label_detalle_nomina").html(nomina);
    // ESTADO DEL VALE
    $("#label_detalle_estado").html(vale.estado ? '<span class="badge text-bg-success">Activo</span>' : '<span class="badge text-bg-danger">Cancelado</span>');

    // DATOS DE SUMEN
    $('#label_detalle_precio_reja').text(`$${vale.precio_reja.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    // OBTENER EL TOTAL DE REJAS
    let total_rejas = sumarRejasVale(vale.rejas);
    $('#label_detalle_total_rejas').text(total_rejas);
    // OBTENER EL TOTAL DE EFECTIVO
    let total_efectivo = total_rejas * vale.precio_reja;
    $('#label_detalle_efectivo').text(`$ ${total_efectivo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    let rejas = vale.rejas;

    // VACIAR EL CUERPO DE LA TABLA
    $("#cuerpo_tabla_detalles_corte").empty();
    // RECORRER LAS REJAS Y AGREGARLAS A LA TABLA
    let tmp = "";
    rejas.forEach(r => {
        tmp += `
        <tr>
            <td class="text-center">Tabla ${r.num_tabla}</td>
            <td class="text-center fw-bold">${r.rejas}</td>
        </tr>
        `;
    });
    // AGREGAR LAS REJAS A LA TABLA
    $("#cuerpo_tabla_detalles_corte").html(tmp);

    // MOSTRAR EL MODAL
    modal_detalles_corte.show();
});

// EVENTO: PARA CAMBIAR EL ESTADO DEL CORTE
$(document).on('click', '.btn_cambiar_estado', function (e) {
    e.preventDefault();
    // OBTENER EL ID DEL CORTE Y EL ESTADO ACTUAL
    let id_corte = $(this).data('id');
    let estado_actual = $(this).data('estado');
    // DEFINIR EL NUEVO ESTADO
    let nuevo_estado = estado_actual ? 0 : 1;
    // MENSAJE DE CONFIRMACION DEPENDIENDO DEL ESTADO ACTUAL
    let mensaje = estado_actual ? "¿Estás seguro de que deseas cancelar este corte?" : "¿Estás seguro de que deseas activar este corte?";

    Swal.fire({
        title: "¿Cambiar estado del vale?",
        text: mensaje,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#2F7D27",
        cancelButtonColor: "#22192E",
        confirmButtonText: "Sí, cambiar estado",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // RECUPERAR EL NOMBRE DEL RANCHO SELECCIONADO
            const nombre_rancho = $("#select_rancho").val();

            $.ajax({
                type: "POST",
                url: RUTA_RAIZ + "/php/gestion_corte.php",
                data: {
                    accion: "cambiar_estado_corte",
                    id_corte: id_corte,
                    nuevo_estado: nuevo_estado,
                    nombre_rancho: nombre_rancho
                },
                dataType: "json",
                success: function (response) {
                    // Volver a llenar la tabla de resultados con el nuevo estado del corte
                    obtener_cortes();
                    // Mostrar mensaje de éxito
                    alerta("success", "Estado cambiado", response.texto);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Error al obtener los empleados:", errorThrown);
                    console.error("Response:", jqXHR.responseText);
                    alerta("error", "Ocurrió un error", "No se pudieron cargar los empleados. Contacta a sistemas.");
                }
            });
        }
    });
});

// EVENTO: PARA SELECCIONAR O DESELECCIONAR UN CORTE
$(document).on('change', '.check_seleccionar_corte', function (e) {
    e.preventDefault();
    // SABER SI EL CHECKBOX FUE MARCADO O DESMARCADO
    let marcado = $(this).is(':checked');
    // OBTENER EL INDICE DEL CORTE SELECCIONADO
    let index = $(this).data('index');
    // OBTENER EL TOTAL DE REJAS DEL CORTE
    let total_rejas = $(this).data('rejas');

    // RECUPERAR EL TOTAL ACTUAL DE REJAS SELECCIONADAS DE total_rejas_visual
    let total_rejas_actual = parseInt($('#total_rejas_visual').val()) || 0;

    // ACTUALIZAR EL TOTAL DE REJAS SELECCIONADAS
    if (marcado) {
        // Si esta marcado, sumar el total de rejas del corte al total actual
        total_rejas_actual += total_rejas;
        // Marcar el corte como seleccionado en el arreglo de cortes seleccionados
        vales[index].seleccionado = true;
    } else {
        // Si esta desmarcado, restar el total de rejas del corte al total actual
        total_rejas_actual -= total_rejas;
        // Desmarcar el corte en el arreglo de cortes seleccionados
        vales[index].seleccionado = false;
    }

    // ACTUALIZAR EL INPUT TOTAL DE REJAS SELECCIONADAS
    $('#total_rejas_visual').val(total_rejas_actual == 0 ? "" : total_rejas_actual);
});


// ============================================================================================
// SECCION PARA DAR FUNCIONALIDAD AL BOTON DE AGREGAR UN NUEVO VALE DE CORTE
// ============================================================================================

// EVENTO ABRIR MODAL DE NUEVO VALE DE CORTE
$(document).on('click', '#btn_nuevo_vale', function (e) {
    e.preventDefault();
    // LIMPIAR EL FORMULARIO DEL MODAL DE NUEVO VALE DE CORTE
    limpiar_formulario_vale();
    // MOSTRAR EL MODAL DE NUEVO VALE DE CORTE
    modal_nuevo_vale.show();
});

// EVENTO PARA CUANDO SE DETECTE UN CHANGE EN EL SELECT DE RANCHOS DEL MODAL DE NUEVO VALE
$(document).on('change', '#select_rancho_nuevo', function (e) {
    e.preventDefault();
    // OBTENER EL RANCHO SELECCIONADO
    let ranchoSeleccionado = $(this).val().toLowerCase();
    // VALIDAR SI ES MENOS 1
    if (ranchoSeleccionado == "-1") {
        // LIMPIAR EL CONTENEDOR DE CHECKBOXES DE TABLAS
        $("#contenedor_checkboxes_tablas").empty();
        // AGREGAR UN MENSAJE DE INFORMACION
        $("#contenedor_checkboxes_tablas").html('<span class="text-muted text-center">DEBE SELECCIONAR UN RANCHO</span>');
        // VACIAR EL CONTENEDOR DE INPUTS DE TABLAS EXTRA
        $("#contenedor_inputs_tablas_extra").empty();
        return;
    }

    // OBTENER EL NUMERO DE TABLAS DEL RANCHO SELECCIONADO
    obtener_numero_tablas_rancho(ranchoSeleccionado);
});

/**
 * Función para obtener las tablas de los ranchos
 */
function obtener_numero_tablas_rancho(nombre_rancho) {
    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/php/gestion_corte.php",
        data: {
            accion: "obtener_numero_tablas_rancho",
            nombre_rancho: nombre_rancho
        },
        dataType: "json",
        success: function (response) {
            // Obtener solo la data de las tablas
            let tablas = response.data.num_arboles;
            let tmp = "";

            // LIMPIAR EL CONTENEDOR DE CHECKBOXES DE TABLAS
            $("#contenedor_checkboxes_tablas").empty();

            // GENERAR LOS CHECKBOXES DE LAS TABLAS SEGUN EL NUMERO DE TABLAS DEL RANCHO
            for (let i = 1; i <= tablas; i++) {
                tmp += `
                <div class="col-md-2">
                    <div class="form-check">
                        <input
                            data-tabla="${i}"
                            class="form-check-input checkbox_tabla"
                            type="checkbox"
                            id="check_tabla${i}_extra">
                        <label
                            class="form-check-label"
                            for="check_tabla${i}_extra">Tabla ${i}</label>
                    </div>
                </div>
                `;
            }

            // AGREGAR LOS CHECKBOXES AL CONTENEDOR
            $("#contenedor_checkboxes_tablas").html(tmp);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("error", "Ocurrió un error", "No se pudieron cargar los empleados. Contacta a sistemas.");
        }
    });
}

// Evento para checkboxes de tablas extra
$(document).on("change", ".checkbox_tabla", function () {
    const numTabla = $(this).data("tabla");
    const contenedor = $("#contenedor_inputs_tablas_extra");

    if ($(this).is(":checked")) {
        // Agregar bloque si no existe
        if ($("#input_rejas_tabla" + numTabla + "_extra").length === 0) {
            contenedor.append(`
                <div class="col-md-4 bloque-tabla-extra" id="bloque_tabla${numTabla}_extra">
                    <label class="form-label small fw-semibold mb-1">Tabla ${numTabla}</label>
                    <input type="number" class="form-control form-control-sm"
                           id="input_rejas_tabla${numTabla}_extra"
                           placeholder="0" min="0">
                </div>
            `);
        }
    } else {
        // Quitar bloque si se desmarca
        $("#bloque_tabla" + numTabla + "_extra").remove();
    }
});

// Escuchar cambios en los inputs de rejas extra
$(document).on("input", "input[id^='input_rejas_tabla'][id$='_extra']", function () {
    let total = 0;
    // Recorrer todos los inputs actuales dentro del contenedor
    $("#contenedor_inputs_tablas_extra input[id^='input_rejas_tabla'][id$='_extra']").each(function () {
        let valor = parseInt($(this).val(), 10);
        if (!isNaN(valor)) {
            total += valor;
        }
    });

    // Actualizar el input total
    $("#input_total_rejas_nuevo").val(total);
    // Desencadenar el evento de input para recalcular el total efectivo
    $("#input_precio_reja_nuevo").trigger("input");
});

// EVENTO INPUT PARA EL input_precio_reja_nuevo
$(document).on("input", "#input_precio_reja_nuevo", function () {
    let precio = parseFloat($(this).val()) || 0;
    let total_rejas = parseInt($("#input_total_rejas_nuevo").val(), 10) || 0;
    let total_efectivo = precio * total_rejas;

    // Actualizar el input total efectivo
    $("#input_total_efectivo_nuevo").val(total_efectivo.toFixed(2));
});

// EVENTO: GUARDAR NUEVO VALE DE CORTE
$(document).on('click', '#btn_guardar_nuevo_vale', function (e) {
    e.preventDefault();

    // OBTENER EL FOLIO DEL NUEVO VALE
    let folio = $("#input_folio_nuevo").val();
    if (folio.trim() === "") {
        alerta("info", "Folio vacío", "Debes ingresar un folio para el nuevo vale de corte.");
        return;
    }

    // OBTENER EL NOMBRE DEL CORTADOR
    let nombre_cortador = $("#input_nombre_cortador_nuevo").val().trim().toUpperCase();
    if (nombre_cortador.trim() === "") {
        alerta("info", "Cortador vacío", "Debes ingresar el nombre del cortador para el nuevo vale de corte.");
        return;
    }

    // OBTENER LA FECHA DEL CORTE
    let fecha_corte = $("#input_fecha_corte_nuevo").val();
    if (fecha_corte.trim() === "") {
        alerta("info", "Fecha vacía", "Debes ingresar la fecha del corte para el nuevo vale de corte.");
        return;
    }

    // OBTENER EL NOMBRE DEL RANCHO
    let nombre_rancho = $("#select_rancho_nuevo").val().trim().toLowerCase();
    if (nombre_rancho === "-1") {
        alerta("info", "Rancho no seleccionado", "Debes seleccionar un rancho para el nuevo vale de corte.");
        return;
    }

    let valido = true;

    // Recorrer todos los inputs dentro del contenedor
    $("#contenedor_inputs_tablas_extra input[id^='input_rejas_tabla'][id$='_extra']").each(function () {
        let valor = $(this).val();

        if (valor === "" || parseInt(valor, 10) <= 0) {
            valido = false;
        }
    });

    if (!valido) {
        alerta("info", "Valores inválidos", "Debes ingresar valores válidos para todas las tablas seleccionadas.");
        return;
    }

    // OBTENER EL PRECIO POR REJA
    let precio_reja = parseFloat($("#input_precio_reja_nuevo").val());
    if (isNaN(precio_reja)) {
        // Va a permitir que se guarde el vale aunque el precio de reja esté vacío, pero lo pondrá en 0
        precio_reja = 0;
    }

    let rejas = obtenerValoresTablasExtra();

    // Obtener que accion será
    let id_corte = $("#id_corte").val();
    let fun = "guardar_nuevo_vale";
    // Si id_corte no está vacío, significa que estamos modificando un vale existente
    if (id_corte !== "") {
        fun = "modificar_vale";
    }

    $.ajax({
        type: "POST",
        url: RUTA_RAIZ + "/php/gestion_corte.php",
        data: {
            accion: fun,
            folio: folio,
            nombre_cortador: nombre_cortador,
            fecha_corte: fecha_corte,
            nombre_rancho: nombre_rancho,
            precio_reja: precio_reja,
            rejas: JSON.stringify(rejas),
            id_corte: id_corte
        },
        dataType: "json",
        success: function (response) {
            // VOLVER A 1
            $('#accion').val(1);
            // LIMPIAR EL FORMULARIO DEL MODAL
            limpiar_formulario_vale();
            // LLENAR LA TABLA DE RESULTADOS CON EL NUEVO VALE
            llenar_resultados_historial();
            if (id_corte !== "") {
                modal_nuevo_vale.hide(); // Cerrar el modal si se estaba modificando un vale existente
            }
            // ALERTA DE EXITO
            alerta(response.icono, response.titulo, response.texto);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            let data = JSON.parse(jqXHR.responseText);
            alerta(data.icono, data.titulo, data.texto);
        }
    });
});

/**
 * Función para obtener los valores de las tablas extra seleccionadas
 * @returns {Array} Array con los valores de las tablas extra
 */
function obtenerValoresTablasExtra() {
    let resultado = [];

    // Recorrer todos los inputs dentro del contenedor
    $("#contenedor_inputs_tablas_extra input[id^='input_rejas_tabla'][id$='_extra']").each(function () {
        let valor = parseInt($(this).val(), 10) || 0; // si está vacío, toma 0
        let numTabla = $(this).attr("id").match(/input_rejas_tabla(\d+)_extra/)[1]; // extraer número de tabla del id

        resultado.push({
            num_tabla: parseInt(numTabla, 10),
            rejas: valor
        });
    });

    return resultado;
}

/**
 * Limpiar el formulario del modal de nuevo vale de corte
 */
function limpiar_formulario_vale() {
    // LIMPIAR EL FORMULARIO DEL MODAL
    $("#id_corte").val('');
    $("#input_folio_nuevo").val('');
    $("#input_nombre_cortador_nuevo").val('');
    $("#input_fecha_corte_nuevo").val('');
    $("#select_rancho_nuevo").val('-1');
    $("#input_precio_reja_nuevo").val('');

    $("#input_total_rejas_nuevo").val("");
    $("#input_total_efectivo_nuevo").val("");

    // VACIAR EL CONTENEDOR DE CHECKBOXES DE TABLAS
    $("#contenedor_checkboxes_tablas").empty();
    $('#contenedor_checkboxes_tablas').html('<span class="text-muted text-center">DEBE SELECCIONAR UN RANCHO</span>');
    // VACIAR EL CONTENEDOR DE INPUTS DE TABLAS EXTRA
    $("#contenedor_inputs_tablas_extra").empty();
}


// ============================================================================================
// SECCION PARA DAR FUNCIONALIDAD AL BOTON DE MODIFICAR UN VALE DE CORTE
// ============================================================================================

// EVENTO: ABRIR EL MODAL DE MODIFICAR UN VALE DE CORTE
$(document).on('click', '.btn_modificar_corte', function (e) {
    e.preventDefault();
    // LIMPIAR EL FORMULARIO DEL MODAL DE NUEVO VALE DE CORTE
    limpiar_formulario_vale();
    // OBTENER EL VALE DEL CORTE
    let vale = $(this).data('vale');

    // LLENAR LA PRIMERA SECCION
    $('#id_corte').val(vale.id_corte);
    $('#input_folio_nuevo').val(vale.folio);
    $('#input_nombre_cortador_nuevo').val(vale.nombre_cortador);
    $('#input_fecha_corte_nuevo').val(vale.fecha_corte);
    // PRECIO REJA
    $('#input_precio_reja_nuevo').val(vale.precio_reja.toFixed(2));
    // OBTENER EL SELECT DEL RANCHO
    let rancho = $('#select_rancho').val();
    $('#select_rancho_nuevo').val(rancho);

    // DESATAR TIGGER DEL select_rancho_nuevo PARA GENERAR LOS CHECKBOXES
    $('#select_rancho_nuevo').trigger('change');

    // Esperar un poco para que el DOM se actualice
    setTimeout(function () {
        let rejas = vale.rejas;
        rejas.forEach(function (item) {
            let numTabla = item.num_tabla;

            $("#check_tabla" + numTabla + "_extra")
                .prop("checked", true)
                .trigger("change"); // dispara tu lógica de inputs

            $("#input_rejas_tabla" + numTabla + "_extra").val(item.rejas);
        });
    }, 100); // 100 ms suele ser suficiente

    // DESENCADENAR EL TRIGGER PARA OBTENER EL TOTAL DE REJAS
    setTimeout(function () {
        $("#contenedor_inputs_tablas_extra input[id^='input_rejas_tabla'][id$='_extra']").trigger("input");
    }, 100); // 100 ms suele ser suficiente

    modal_nuevo_vale.show();
});



// ============================================================================================
// DAR FUNCIONALIDAD AL BOTON DE RANKING DE CORTES
// ============================================================================================

// EVENTO: ABRIR EL MODAL DE RANKING DE CORTES
$(document).on('click', '#btn_ranking_extra', function (e) {
    e.preventDefault();
    // OBTENER EL RANKING DE CORTES
    let ranking = topTablasPorRejas(vales);
    // VACIAR EL CUERPO DE LA TABLA DE RANKING
    let tbody = $("#cuerpo_tabla_ranking");
    tbody.empty();

    console.log(ranking);
    let contador = 1;

    // RECORRER EL RANKING Y AGREGARLO A LA TABLA
    ranking.forEach(ran => {

        // PREPARAR LA FILA
        const fila = `
        <tr>
            <td class="text-center"><span class="badge ${ contador === 1 ? 'bg-warning text-dark' : 'bg-secondary' } fs-6">${ contador }°</span></td>
            <td class="text-center"><i class="bi bi-box me-2"></i>Tabla ${ formatoDosDigitos(ran.num_tabla) }</td>
            <td class="text-center fw-bold text-success">${ ran.total_rejas }</td>
        </tr>
        `;

        // AGREGAR LA FILA A LA TABLA
        tbody.append(fila);

        // AUMENTAR EL CONTADOR
        contador++;
    });

    // ABRIR EL MODAL DE RANKING
    modal_ranking.show();
});


// ============================================================================================
// SECCION PARA EXPORTAR PDF DE CORTES
// ============================================================================================

function generarPDFCorte(vale) {
    const nombre_rancho = $("#select_rancho").val();

    // Crear un formulario temporal para enviar los datos y descargar el PDF directamente
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = RUTA_RAIZ + '/php/gestion_corte.php';

    const inputAccion = document.createElement('input');
    inputAccion.type = 'hidden';
    inputAccion.name = 'accion';
    inputAccion.value = 'generar_pdf_corte';
    form.appendChild(inputAccion);

    const inputCorte = document.createElement('input');
    inputCorte.type = 'hidden';
    inputCorte.name = 'corte';
    inputCorte.value = JSON.stringify(vale);
    form.appendChild(inputCorte);

    const inputRancho = document.createElement('input');
    inputRancho.type = 'hidden';
    inputRancho.name = 'nombre_rancho';
    inputRancho.value = nombre_rancho;
    form.appendChild(inputRancho);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

function generarPDFTodosCortes() {
    if (!historial || historial.length === 0) {
        alerta("info", "Sin datos", "No hay cortes para exportar");
        return;
    }

    const nombre_rancho_completo = "RANCHO " + $("#select_rancho option:selected").text().toUpperCase();
    const nombre_rancho = $("#select_rancho").val();

    // Crear un formulario temporal para enviar los datos y descargar el PDF directamente
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = RUTA_RAIZ + '/php/gestion_corte.php';

    const inputAccion = document.createElement('input');
    inputAccion.type = 'hidden';
    inputAccion.name = 'accion';
    inputAccion.value = 'generar_pdf_todos_cortes';
    form.appendChild(inputAccion);

    const inputCortes = document.createElement('input');
    inputCortes.type = 'hidden';
    inputCortes.name = 'cortes';
    inputCortes.value = JSON.stringify(historial);
    form.appendChild(inputCortes);

    const inputRancho = document.createElement('input');
    inputRancho.type = 'hidden';
    inputRancho.name = 'nombre_rancho';
    inputRancho.value = nombre_rancho;
    form.appendChild(inputRancho);

    const inputRanchoCompleto = document.createElement('input');
    inputRanchoCompleto.type = 'hidden';
    inputRanchoCompleto.name = 'nombre_rancho_completo';
    inputRanchoCompleto.value = nombre_rancho_completo;
    form.appendChild(inputRanchoCompleto);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

// EVENTO: EXPORTAR PDF DESDE EL DROPDOWN
$(document).on('click', '.btn_exportar_pdf_corte', function (e) {
    e.preventDefault();
    const vale = $(this).data('vale');
    if (vale) {
        generarPDFCorte(vale);
    }
});

// EVENTO: EXPORTAR PDF DESDE EL MODAL
$(document).on('click', '#btn_exportar_pdf_modal', function (e) {
    e.preventDefault();
    if (valeActual) {
        generarPDFCorte(valeActual);
    }
});

// EVENTO: EXPORTAR PDF DESDE EL ENCABEZADO (TODOS LOS CORTES)
$(document).on('click', '#btn_exportar_pdf_extra', function (e) {
    e.preventDefault();
    generarPDFTodosCortes();
});


// ============================================================================================
// SECCION PARA EXPORTAR EL EXCEL DE CORTES
// ============================================================================================

// EVENTO: GENERAR EXCEL AL HACER CLICK SOBRE EL BTN EXPORTAR EXCEL
$(document).on('click', '#btn_exportar_excel', function (e) {
    e.preventDefault();

    // VALIDAR SI HAY DATOS PARA EXPORTAR
    if (!historial || historial.length === 0) {
        alerta("info", "Sin datos", "No hay cortes para exportar");
        return;
    }

    // RECUPERAR LOS DATOS NECESARIOS PARA EL NOMBRE DEL ARCHIVO
    const rancho_nombre = $("#select_rancho").val();
    const anio = $("#select_anio").val();
    const mes = $("#select_mes").val();
    const semana = $("#select_semana").val();

    // BARRA DE CARGA
    Swal.fire({
        title: 'Generando documento...',
        html: 'Por favor espera mientras se genera el archivo Excel.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: (modal) => {
            Swal.showLoading();
        }
    });

    // ENVIAR LA PETICIÓN PARA GENERAR EL EXCEL AL SERVIDOR
    $.ajax({
        url: RUTA_RAIZ + "/php/exportar_excel.php",
        type: 'POST',
        data: {
            vales: JSON.stringify(historial),
            rancho_nombre: rancho_nombre,
            anio: anio,
            mes: mes,
            semana: semana
        },
        xhrFields: {
            responseType: 'blob'
        },
        success: function (blob) {
            setTimeout(() => {
                // Cerrar la alerta de carga
                Swal.close();

                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                // Generar un timestamp para el nombre del archivo
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                // FORMAR EL NOMBRE DEL ARCHIVO
                let nombre_archivo = 'REPORTE_HISTORIAL_CORTES_' + rancho_nombre.toUpperCase() + '_' + timestamp + '.xlsx';
                link.href = url;
                // Establecer el nombre del archivo con el formato: REPORTE_HISTORIAL_CORTES_RANCHO_NOMBRE.xlsx
                link.download = nombre_archivo;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 1500);
        },
        error: function (xhr, status, error) {
            // Cerrar la alerta de carga
            Swal.close();
            console.error('Error al descargar el Excel:', error);
            alerta("error", "Error al generar reporte Excel", "Error al generar reporte Excel: " + error);
        }
    });
});



// ============================================================================================
// SECCION DE INICIALIZACION DE LA PAGINA
// ============================================================================================

/**
 * Función para inicializar la página
 */
function inti() {
    // Obtener los ranchos de la base de datos
    obtener_ranchos();
}

// Inicializar la página cuando el DOM esté listo
$(document).ready(function () {
    inti();
});