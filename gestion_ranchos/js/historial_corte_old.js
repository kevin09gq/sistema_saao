// Constantes y variables globales
const RUTA_RAIZ = rutaRaiz + "/gestion_ranchos";

// Variable global para almacenar el historial de cortes
let historial = null;

// Array con los nombres de los meses
const nombresMeses = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

// MODALES
const modal_detalles_corte = new bootstrap.Modal(document.getElementById('modal_detalles_corte'));
const modal_nuevo_vale = new bootstrap.Modal(document.getElementById('modal_nuevo_vale'));
const modal_editar_vale = new bootstrap.Modal(document.getElementById('modal_editar_vale'));

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
            llenar_resultados_historial();
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
    llenar_resultados_historial();
});

/**
 * Función para llenar la tabla de resultados del historial de cortes
 */
function llenar_resultados_historial() {
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
            let vales = response.data;

            console.log(vales);


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

            // CONTADOR
            let contador = 1;
            let tmp = "";
            // VACIAR EL CUERPO DE LA TABLA
            $("#cuerpo_tabla_historial_corte").empty();
            // RECORRER LOS CORTES Y AGREGARLOS A LA TABLA
            vales.forEach((vale, index) => {

                // DEFINIR EL ESTADO DEL VALE
                const estado = vale.estado ? `<span class="badge bg-success">Activo</span>` : `<span class="badge bg-danger">Cancelado</span>`;
                // DEFINIR SI TIENE O NO NOMINA
                const nomina = vale.anio ? `Sem ${vale.numero_semana} / ${vale.anio}` : `<em class="text-muted">Pendiente</em>`;
                // TABLAS INVOLUCRADAS Y TOTAL REJAS
                let tablas = "";
                let total_rejas = 0;
                vale.rejas.forEach(reja => {
                    // OBTENER TABLAS INVOLUCRADAS
                    tablas += `<span class="badge text-bg-secondary">T${reja.num_tabla}: ${reja.rejas}</span> `;
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


                tmp += `
                <tr>
                    <td class="text-center">${contador}</td>
                    <td>${nomina}</td>
                    <td>${vale.folio}</td>
                    <td>${formatearFechaEspa(vale.fecha_corte)}</td>
                    <td>${vale.nombre_cortador}</td>
                    <td>${tablas}</td>
                    <td>${total_rejas}</td>
                    <td>${estado}</td>
                    <td>
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
                                    <button class="dropdown-item text-danger btn_exportar_pdf_corte">
                                        <i class="bi bi-file-earmark-pdf me-2"></i>Exportar PDF
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </td>
                </tr>
                `;

                contador++;
            });

            // AGREGAR LOS CORTES A LA TABLA
            $("#cuerpo_tabla_historial_corte").html(tmp);
            // QUITAR LA CLASE D-NONE DE LA SECCION DE RESULTADOS
            $("#seccion_tabla_resultados").removeClass("d-none");
            $("#seccion_tarjetas_resumen").removeClass("d-none");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("error", "Ocurrió un error", "No se pudieron cargar los empleados. Contacta a sistemas.");
        }
    });
}

// ============================================================================================
// FUNCIONES AUXILIARES PARA PRESENTAR LA SECCION DE RESULTADOS
// ============================================================================================

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

    // LLENAR EL MODAL CON LOS DETALLES DEL CORTE
    $("#label_detalle_corte").text(vale.folio);
    $("#label_detalle_cortador").text(vale.nombre_cortador);
    $("#label_detalle_fecha").text(formatearFechaEspa(vale.fecha_corte));
    // VER SI TIENE NOMINA O NO, SI NO TIENE NOMINA, PONER "PENDIENTE"
    const nomina = vale.anio ? `Sem ${vale.numero_semana} / ${vale.anio}` : `<em class="text-muted">Pendiente</em>`;
    $("#label_detalle_nomina").html(nomina);
    // ESTADO DEL VALE
    $("#label_detalle_estado").text(vale.estado ? "Activo" : "Cancelado");

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
                    llenar_resultados_historial();
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
    if (isNaN(precio_reja) || precio_reja <= 0) {
        alerta("info", "Precio inválido", "Debes ingresar un precio por reja válido para el nuevo vale de corte.");
        return;
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
    console.log(vale);

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