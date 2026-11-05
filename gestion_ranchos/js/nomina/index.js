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

/**
 * Función para recuperar los ranchos de la base de datos
 */
function obtener_ranchos() {
    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/php/nomina/gestion_nomina.php",
        data: {
            accion: "obtener_ranchos"
        },
        dataType: "json",
        success: function (response) {
            // Obtener solo la data de los ranchos
            let ranchos = response.data;
            // LIMPIAR EL SELECTOR DE RANCHOS
            $("#select_rancho").empty();
            // Agregar una opción por defecto
            // $("#select_rancho").append('<option value="-1">--- Seleccionar ---</option>');

            // Limpiar el nombre del rancho
            ranchos.forEach(ra => {
                ra.nombre_area = quitarPalabraRancho(ra.nombre_area);
                // LLENAR EL SELECT DE LOS FILTROS PRINCIPALES
                $("#select_rancho").append('<option value="' + ra.nombre_area + '">' + ra.nombre_area + '</option>');
            });

            // Seleccionar el primer rancho por defecto
            $("#select_rancho option:eq(0)").prop("selected", true);
            // Dispara el evento "change" del select
            $("#select_rancho").trigger("change");
            $("#select_anio").trigger("change");

            // Obtener los resultados con los datos iniciales (sin filtros)
            obtener_nominas_corte();

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
        $("#select_semana").empty().append('<option value="-1">--- Seleccionar ---</option>');
        return; // Salir de la función si no hay rancho seleccionado
    }

    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/php/nomina/gestion_nomina.php",
        data: {
            accion: "obtener_anios_nomina",
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

            // Si no hay años disponibles, limpiar el selector de semanas
            if (data.length === 0) {
                $("#select_semana").empty().append('<option value="-1">--- Seleccionar ---</option>');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("error", "Ocurrió un error", "No se pudieron cargar. Contacta a sistemas.");
        }
    });
});

// EVENTO: OBTENER EL NUMERO DE SEMANAS DISPONIBLES PARA EL RANCHO Y AÑO SELECCIONADO
$(document).on('change', '#select_anio', function (e) {
    e.preventDefault();
    // OBTENER EL RANCHO QUE FUE SELECCIONADO
    let ranchoSeleccionado = $("#select_rancho").val().toLowerCase();
    let anioSeleccionado = $(this).val();



    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/php/nomina/gestion_nomina.php",
        data: {
            accion: "obtener_semanas_nomina",
            nombre_rancho: ranchoSeleccionado,
            anio: anioSeleccionado
        },
        dataType: "json",
        success: function (response) {
            // RECUPERAR SOLO LAS SEMANAS DE LA RESPUESTA
            let data = response.data;

            // LIMPIAR EL SELECTOR DE semanas
            $("#select_semana").empty();
            // Agregar una opción por defecto
            $("#select_semana").append('<option value="-1">--- Seleccionar ---</option>');
            // Agregar las semanas al selector
            data.forEach(semana => {
                $("#select_semana").append('<option value="' + semana.numero_semana + '"> Semana ' + semana.numero_semana + '</option>');
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("error", "Ocurrió un error", "No se pudieron cargar los empleados. Contacta a sistemas.");
        }
    });
});

// EVENTO: BUSCAR EL HISTORIAL DEL CORTE
$(document).on('click', '#btn_filtrar', function (e) {
    e.preventDefault();
    obtener_nominas_corte();
});


/**
 * Función para llenar la tabla de resultados del historial de cortes
 */
function obtener_nominas_corte() {
    // OBTENER EL RANCHO SELECCIONADO
    let nombre_rancho = $("#select_rancho").val();
    let anio = $("#select_anio").val();
    let semana = $("#select_semana").val();

    // VALIDAR QUE SE HAYA SELECCIONADO UN RANCHO
    if (nombre_rancho == "-1") {
        alerta("info", "Selecciona un rancho", "Debes seleccionar un rancho para filtrar el historial de cortes.");
        return;
    }

    // ENVIAR LA INFORMACION AL SERVIDOR PARA OBTENER EL HISTORIAL DE CORTES
    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/php/nomina/gestion_nomina.php",
        data: {
            accion: "obtener_nominas_corte",
            nombre_rancho: nombre_rancho,
            anio: anio,
            semana: semana
        },
        dataType: "json",
        success: function (response) {
            // RECUPERAR SOLO LOS CORTES DE LA RESPUESTA
            nominas = response.data;
            historial = darFormatoEstructuraNormalizada(nominas);

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
 * Transforma los datos de una nómina en un formato más usable.
 * @param {Array} datos - Los datos de la nómina.
 * @returns {Array} - Los datos transformados.
 */
function darFormatoEstructuraNormalizada(datos) {
    if (!Array.isArray(datos) || datos.length === 0) {
        return [];
    }

    return datos.map(item => ({
        id: item.id,
        nombre_cortador: item.nombre_cortador,
        id_nomina: item.id_nomina,
        nomina: `${item.numero_semana}/${item.anio}`,
        total: Number(item.total),
        fecha_inicio: item.fecha_inicio,
        fecha_fin: item.fecha_fin,
        fecha_creacion: item.fecha_creacion,
        json_dias: JSON.parse(item.json_dias)
    }));
}

/**
 * Función para llenar los resultados del historial de nominas de corte
 */
function llenar_resultados_historial() {
    // --------------------------------------------------------
    // COSAS PARA LA SECCION DE LAS TARJETAS DE RESUMEN
    // --------------------------------------------------------
    let total_registros = obtenerTotalRegistros(historial);
    let suma_total = obtenerTotalSemana(historial);

    $('#label_total_registros').text(total_registros);
    $('#label_total_gastos_general').text(formatoMoneda(suma_total));


    // --------------------------------------------------------
    // COSAS PARA LA SECCION DE LA TABLA 
    // --------------------------------------------------------

    // DATOS PARA HACER LA PAGINACION
    const limite = parseInt($('#select_limite').val()) || 10;
    let paginaActual = parseInt($('#pagina-actual').data('pagina')) || 1;

    // DATOS DE ORDENAMIENTO
    let ordenar = $('#select_columna').val() || 'nomina';
    let direccion = $('#select_direccion').val() || 'ASC';

    // Ordenamiento dinámico
    historial.sort((a, b) => {
        let valorA, valorB;

        switch (ordenar) {
            case 'nomina': {
                // Formato: "5/2026" (semana/año)
                const [semanaA, anioA] = a.nomina.split('/').map(Number);
                const [semanaB, anioB] = b.nomina.split('/').map(Number);
                valorA = anioA * 100 + semanaA;
                valorB = anioB * 100 + semanaB;
                break;
            }
            case 'nombre_cortador':
                valorA = (a.nombre_cortador || '').toLowerCase();
                valorB = (b.nombre_cortador || '').toLowerCase();
                break;
            case 'total':
                valorA = Number(a.total) || 0;
                valorB = Number(b.total) || 0;
                break;
            case 'fecha_creacion':
                valorA = new Date(a.fecha_creacion);
                valorB = new Date(b.fecha_creacion);
                break;
            default:
                valorA = a.nomina;
                valorB = b.nomina;
        }
        if (valorA < valorB) return direccion === 'ASC' ? -1 : 1;
        if (valorA > valorB) return direccion === 'ASC' ? 1 : -1;
        return 0;
    });

    // CALCULAR EL INICIO Y EL FIN
    let inicio = 0;
    let fin = historial.length;

    // SI ES DIFERENTE DE -1, SE HACE LA PAGINACION
    if (limite !== -1) {
        inicio = (paginaActual - 1) * limite;
        fin = inicio + limite;
    }

    // OBTENER LOS EMPLEADOS A MOSTRAR EN LA PAGINA ACTUAL
    const historialPagina = historial.slice(inicio, fin);
    const totalPaginas = limite === -1 ? 1 : Math.ceil(historial.length / limite);

    // VACIAR EL CUERPO DE LA TABLA
    $("#cuerpo_tabla_historial").empty();

    // VALIDAR QUE HAYA CORTES DISPONIBLES
    if (historialPagina.length === 0) {
        $("#cuerpo_tabla_historial").html(`
                    <tr>
                        <td colspan="8" class="text-center">No hay cortes disponibles</td>
                    </tr>
                `);
        return;
    }

    historialPagina.forEach((nomina, index) => {
        // CONTADOR PARA LA TABLA, SE LE SUMA 1 PARA QUE EMPIECE EN 1 Y NO EN 0
        const contador = inicio + index + 1;
        // Índice global en el arreglo vales
        const indexGlobal = inicio + index;

        // CREAR LA FILA DE LA TABLA
        const fila = `
        <tr data-index="${indexGlobal}">
            <td class="text-center fw-bold">${formatoDosDigitos(contador)}</td>
            <td class="text-center">${nomina.nomina}</td>
            <td class="text-center">${nomina.nombre_cortador}</td>
            <td class="text-center">${formatoMoneda(nomina.total)}</td>
            <td class="text-center">${nomina.fecha_inicio} - ${nomina.fecha_fin}</td>
            <td class="text-center">${formatearFechaSinHora(nomina.fecha_creacion)}</td>
            <td class="text-center">
                <div class="dropdown tb-action-dropdown">
                    <button class="btn btn-sm btn-light border-0" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu shadow pointer-events-auto">
                        <li>
                            <button
                                data-id='${nomina.id}'
                                data-cabo='${nomina.nombre_cortador}'
                                data-nomina='${nomina.nomina}'
                                data-total='${nomina.total}'
                                data-detalles='${JSON.stringify(nomina.json_dias)}'
                                class="dropdown-item text-primary btn_ver_detalles">
                                <i class="bi bi-eye me-2"></i>Ver detalles
                            </button>
                        </li>
                        <li>
                            <button
                                class="dropdown-item text-danger btn_exportar_pdf"
                                data-detalles='${JSON.stringify(nomina.json_dias)}'>
                                <i class="bi bi-file-earmark-pdf me-2"></i>Exportar PDF
                            </button>
                        </li>
                    </ul>
                </div>
            </td>
        </tr>
        `;

        // AGREGAR LA FILA A LA TABLA
        $("#cuerpo_tabla_historial").append(fila);
    });


    // RENDIZAR LA PAGINACION
    renderizarPaginacion(historial.length, paginaActual, limite);

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





/**
 * Función para inicializar la página y cargar los ranchos al inicio
 */
function init() {
    // Obtenemos los ranchos al cargar la página
    obtener_ranchos();
}

// Inicializa la pantalla y ejecuta las consultas/cargas necesarias al terminar de cargar el DOM
$(document).ready(function () {
    init();
});