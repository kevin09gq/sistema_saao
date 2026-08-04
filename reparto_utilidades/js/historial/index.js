// Constantes y variables globales
const RUTA_RAIZ = window.rutaRaiz || '/sistema_saao';


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
 * Función para obtener los años disponibles desde el servidor.
 */
function obtener_anios() {
    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/reparto_utilidades/php/historial/historial.php",
        data: { accion: "obtener_anios" },
        dataType: "json",
        success: function (response) {
            // Manejar la respuesta del servidor
            let anios = response.data;
            // LLENAR EL SELECT filtro_anio con un -1 para indicar "Todos los años" y luego los años obtenidos
            $("#filtro_anio").append('<option value="">-- Todos los años --</option>');
            // Recorrer los años y agregarlos al select
            anios.forEach(anio => {
                $("#filtro_anio").append(`<option value="${anio}">${anio}</option>`);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error al obtener los años:", error);
        }
    });
}

/**
 * Función para obtener los departamentos
 */
function obtener_departamentos() {
    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/reparto_utilidades/php/historial/historial.php",
        data: { accion: "obtener_departamentos" },
        dataType: "json",
        success: function (response) {
            // Manejar la respuesta del servidor
            let departamentos = response.data;
            // LLENAR EL SELECT filtro_departamento con un -1 para indicar "Todos los departamentos" y luego los departamentos obtenidos
            $("#filtro_departamento").append('<option value="">-- Todos los departamentos --</option>');
            // Recorrer los departamentos y agregarlos al select
            departamentos.forEach(dep => {
                $("#filtro_departamento").append(`<option value="${dep.id_departamento}">${dep.nombre_departamento.toUpperCase()}</option>`);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error al obtener los departamentos:", error);
        }
    });
}


/**
 * Función para obtener las utilidades según los filtros seleccionados
 */
function obtener_utilidades() {

    // Obtener los valores seleccionados en los filtros
    let busqueda = $("#busqueda").val();
    let anioSeleccionado = $("#filtro_anio").val();
    let departamentoSeleccionado = $("#filtro_departamento").val();
    let limite = $("#filtro_limite").val() || 20;
    let paginaActual = parseInt($("#pagina_actual").data("pagina")) || 1;

    $.ajax({
        type: "POST",
        url: RUTA_RAIZ + "/reparto_utilidades/php/historial/historial.php",
        data: {
            accion: "obtener_utilidades",
            busqueda: busqueda,
            anio: anioSeleccionado,
            departamento: departamentoSeleccionado,
            limite: limite,
            pagina: paginaActual
        },
        dataType: "json",
        success: function (response) {
            // OBTENER SOLO LA DATA DE LA BASE
            let data = response.data.data;

            // PREPARAR CADA ELEMENTO ANTES DE PRESENTAR EN UNA TABLA
            data.forEach(elemento => {
                // OBTENER EL TOTAL DE EMPLEADOS VISIBLES PARA CADA ELEMENTO
                const empleadosVisibles = elemento.empleados.filter(emp => emp.visible === true);
                elemento.total_empleados = empleadosVisibles.length;
                // OBTENER EL TOTAL DEL PTU DE LOS EMPLEADOS VISIBLES
                const totalPTU = elemento.empleados
                    .filter(emp => emp.visible)        // solo visibles
                    .reduce((suma, emp) => suma + emp.ptu, 0);
                elemento.total_ptu = totalPTU; // Redondear a 2 decimales
                // OBTENER EL TOTAL DE LA DISPESION DE TARJETA
                const totalDispersion = elemento.empleados
                    .filter(emp => emp.visible)
                    .reduce((suma, emp) => suma + emp.tarjeta, 0);
                elemento.total_tarjeta = totalDispersion; // Redondear a 2 decimales
                // TOTAL DEL NETO A PAGAR REDONDEADO
                const totalNeto = elemento.empleados
                    .filter(emp => emp.visible)
                    .reduce((suma, emp) => suma + emp.neto_pagar_redondeado, 0);
                elemento.total_neto = totalNeto; // Redondear a 2 decimales
            });

            // LLENAR LA TABLA PRINCIPAL CON LOS DATOS FILTRADOS
            llenar_tabla_principal(data, response.data.inicio);

            // RENDERIZAR LA PAGINACION
            renderizarPaginacion(response.data.total, response.data.pagina, response.data.limite);

        },
        error: function (xhr, status, error) {
            console.error("Error al obtener los departamentos:", error);
        }
    });
}

/**
 * Función para llenar la tabla principal con los datos obtenidos
 */
function llenar_tabla_principal(data, inicio) {
    // Limpiar la tabla antes de llenarla
    $("#cuerpo_tabla_principal").empty();
    // VERIFICAR QUE LA DATA NO ESTE VACIA
    if (data.length === 0) {
        // Si no hay datos, mostrar un mensaje en la tabla
        $("#cuerpo_tabla_principal").html('<tr><td colspan="9" class="text-center">No se encontraron registros.</td></tr>');
        return;
    }

    // Recorrer los datos y agregarlos a la tabla
    data.forEach((elemento, index) => {

        const contador = (inicio || 0) + index + 1; // Ajustar el contador según el inicio de la página

        let opciones = ``;

        if (elemento.id_utilidad) {
            opciones = `
                <div class="dropdown">
                    <button class="btn btn-sm btn-dropdown-custom" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                        <li>
                            <button
                                data-anio="${elemento.anio}"
                                data-departamento="${elemento.nombre_departamento}"
                                data-iddepartamento="${elemento.id_departamento}"
                                data-id_utilidad="${elemento.id_utilidad}"
                                data-empleados='${JSON.stringify(elemento.empleados)}'
                                data-fecha_creacion="${elemento.fecha_creacion}"
                                class="dropdown-item btn_ver_detalles">
                                <i class="bi bi-eye me-2"></i>Ver Detalles</button>
                        </li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li>
                            <button
                                data-idutilidad="${elemento.id_utilidad}"
                                class="dropdown-item text-danger btn_eliminar_utilidad">
                                <i class="bi bi-trash me-2"></i>Eliminar</button>
                        </li>
                    </ul>
                </div>
            `;
        } else {
            opciones = `<span class="text-muted">Pendiente</span>`;
        }

        const fila = `
         <tr>
            <td class="ps-4 fw-bold">${contador}</td>
            <td>${elemento.anio}</td>
            <td><span class="badge bg-primary-subtle text-primary">${elemento.nombre_departamento.toUpperCase()}</span></td>
            <td>${elemento.total_empleados == 0 ? '<span class="text-muted">Pendiente</span>' : elemento.total_empleados}</td>
            <td class="fw-semibold">${formatoMonedaVisual(elemento.total_ptu)}</td>
            <td>${formatoMonedaVisual(elemento.total_tarjeta)}</td>
            <td>${formatoMonedaVisual(elemento.total_neto)}</td>
            <td class="small">${elemento.fecha_creacion == "Pendiente" ? '<span class="text-muted">Pendiente</span>' : formatearFecha(elemento.fecha_creacion)}</td>
            <td class="text-center">
                ${opciones}
            </td>
        </tr>
        `;

        // Agregar la fila a la tabla
        $("#cuerpo_tabla_principal").append(fila);
    });
}

/**
 * Renderizar los botones de paginación
 */
function renderizarPaginacion(totalEmpleados, paginaActual, limite) {
    if (limite === -1) {
        $('#paginacion').empty();
        return;
    }

    const totalPaginas = Math.ceil(totalEmpleados / limite);
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
    $('#pagina_actual').data('pagina', nuevaPagina);
    obtener_utilidades();
}

// ===================================================================================================
// EVENTOS: CONTROLA LOS CAMBIOS EN LOS FILTROS PARA CAMBIAR LA TABLA PRINCIPAL
// ===================================================================================================
$(document).ready(function () {
    // Evento de búsqueda
    $('#busqueda').on('keyup', function () {
        $('#pagina_actual').data('pagina', 1);
        obtener_utilidades();
    });

    // Evento de filtro departamento
    $('#filtro_departamento').on('change', function () {
        $('#pagina_actual').data('pagina', 1);
        obtener_utilidades();
    });

    // Evento de filtro empresa
    $('#filtro_anio').on('change', function () {
        $('#pagina_actual').data('pagina', 1);
        obtener_utilidades();
    });

    // Evento de límite por página
    $('#filtro_limite').on('change', function () {
        $('#pagina_actual').data('pagina', 1);
        obtener_utilidades();
    });

    // Inicializar variable de página actual si no existe
    if (!$('#pagina_actual').length) {
        $('body').append('<div id="pagina_actual" data-pagina="1" style="display:none;"></div>');
    }
});

/**
 * Funcion para iniciar la página y cargar los años disponibles.
 */
function init() {
    // Llamar a la función para obtener los años disponibles
    obtener_anios();
    // Llamar a la función para obtener los departamentos
    obtener_departamentos();
    // Llamar a la función para obtener las utilidades
    obtener_utilidades();
    // LLENAR SELECT DE EMPRESA
    obtener_empresas();
}


// Evento que se ejecuta cuando el DOM está completamente cargado
$(document).ready(function () {
    init();
});


/**
 * ----------------------------------------------------------------------------------------------
 * FUNCIONES AUXILIARES
 * ----------------------------------------------------------------------------------------------
 */


/**
 * Convierte una fecha en formato YYYY-MM-DD
 * a "DD Mes YYYY" con abreviatura en español
 * @param {string} fecha Cadena en formato "YYYY-MM-DD"
 * @returns {string} Fecha formateada
 */
function formatearFecha(fecha) {
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    const partes = fecha.split("-");
    const anio = partes[0];
    const mes = parseInt(partes[1], 10) - 1; // índice del mes
    const dia = partes[2];

    return `${dia} ${meses[mes]} ${anio}`;
}

/**
 * Da formato de moneda a un número
 * @param {number} cantidad Número a formatear
 * @returns {string} HTML con span y clase de color
 */
function formatoMonedaVisual(cantidad) {
    let clase;
    let contenido;

    if (cantidad > 0) {
        clase = "text-success";
        contenido = `$ ${cantidad.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    } else if (cantidad < 0) {
        clase = "text-danger";
        contenido = `- $ ${Math.abs(cantidad).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    } else {
        clase = "text-secondary";
        contenido = `-`;
    }

    return `<span class="${clase}">${contenido}</span>`;
}

/** ---------------------------------------------------------------------------------------------- */

// EVENTO: Eliminar un registro de utilidad
$(document).on('click', '.btn_eliminar_utilidad', function (e) {
    e.preventDefault();
    // Obtener el ID de la utilidad desde el atributo data-idutilidad del botón
    const id_utilidad = $(this).data('idutilidad');

    Swal.fire({
        title: "Eliminar utilidad",
        text: "Esta acción es irreversible. ¿Estás seguro de que deseas eliminar esta utilidad?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#B31515",
        cancelButtonColor: "#13051F",
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "POST",
                url: RUTA_RAIZ + "/reparto_utilidades/php/historial/historial.php",
                data: {
                    accion: "eliminar_utilidad",
                    id_utilidad: id_utilidad
                },
                dataType: "json",
                success: function (response) {
                    // Manejar la respuesta exitosa
                    alerta(response.icono, response.titulo, response.texto);
                    // Recargar la tabla principal después de eliminar
                    obtener_utilidades();
                },
                error: function (xhr, status, error) {
                    console.error("Error al obtener los departamentos:", error);
                }
            });
        }
    });
});