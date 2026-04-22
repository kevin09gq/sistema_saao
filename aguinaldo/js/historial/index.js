const RUTA_RAIZ = window.rutaRaiz || '/sistema_saao';
let paginaActual = 1;
let registrosPorPagina = 10;
const modal_detalles = new bootstrap.Modal(document.getElementById('modal_detalles'));

$(document).ready(function () {
    // Inicializar funciones
    obtener_departamentos();
    listar_aguinaldos();
    configurarFiltros();


});

/**
 * Obtener la lista de departamentos para el filtro
 */
function obtener_departamentos() {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerDepartamentos.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
            const select = $("#departamento");
            // Mantener la opción por defecto
            select.find("option:not(:first)").remove();

            data.forEach(function (depto) {
                select.append(
                    `<option value="${depto.id_departamento}">${depto.nombre_departamento}</option>`
                );
            });
        },
        error: function () {
            console.error("Error al cargar departamentos");
        }
    });
}

/**
 * Obtener los aguinaldos desde la base de datos
 */
function listar_aguinaldos() {
    const busqueda = $("#busqueda").val();
    const anio = $("#anio").val();
    const departamento = $("#departamento").val();
    const columna = $("#columna").val();
    const orden = $("#orden").val();
    const limite = $("#limite").val();

    // Actualizar registros por página
    registrosPorPagina = parseInt(limite);

    $.ajax({
        url: "../../php/historial/obtener_aguinaldos.php",
        type: "GET",
        data: {
            pagina: paginaActual,
            limite: limite,
            busqueda: busqueda,
            anio: anio,
            departamento: departamento,
            columna: columna,
            orden: orden
        },
        dataType: "json",
        beforeSend: function () {
            $("#cuerpo_tabla_aguinaldo_registro").html(
                '<tr><td colspan="12" class="text-center"><span class="spinner-border spinner-border-sm"></span> Cargando...</td></tr>'
            );
        },
        success: function (response) {
            renderizarTabla(response.data, response.pagina, response.limite);
            renderizarPaginacion(response.total, response.pagina, response.limite);
        },
        error: function () {
            $("#cuerpo_tabla_aguinaldo_registro").html(
                '<tr><td colspan="12" class="text-center text-danger">Error al cargar los datos</td></tr>'
            );
        }
    });
}

/**
 * Renderizar la tabla con los datos obtenidos
 */
function renderizarTabla(datos, pagina, limite) {
    const tbody = $("#cuerpo_tabla_aguinaldo_registro");
    tbody.empty();

    if (!datos || datos.length === 0) {
        tbody.html(
            '<tr><td colspan="8" class="text-center text-muted">No se encontraron registros</td></tr>'
        );
        return;
    }

    datos.forEach(function (registro, index) {
        // Calcular el número de fila global
        let numeroFila;
        if (limite === -1) {
            numeroFila = index + 1;
        } else {
            numeroFila = (pagina - 1) * limite + index + 1;
        }

        const fila = `
            <tr>
                <td class="text-center">${registro.clave_empleado}</td>
                <td>${registro.nombre} ${registro.ap_paterno} ${registro.ap_materno}</td>
                <td class="text-center">${registro.anio}</td>
                <td class="text-center">${registro.sueldo_diario}</td>
                <td class="text-center">${registro.dias_trabajados}</td>
                <td class="text-center">${registro.monto_aguinaldo}</td>
                <td class="text-center">${formatearFecha(registro.fecha_pago)}</td>
                <td class="text-center">
                    <div class="dropdown">
                        <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-three-dots-vertical"></i></button>
                        <ul class="dropdown-menu">
                            <li>
                                <button
                                    type="button"
                                    data-id="${registro.id_aguinaldo}"
                                    data-clave="${registro.clave_empleado}"
                                    data-nombre="${registro.nombre} ${registro.ap_paterno} ${registro.ap_materno}"
                                    data-anio="${registro.anio}"
                                    data-area="${registro.nombre_area}"
                                    data-departamento="${registro.nombre_departamento}"
                                    data-puesto="${registro.nombre_puesto}"
                                    data-dias="${registro.dias_trabajados}"
                                    data-sueldo="${registro.sueldo_diario}"
                                    data-aguinaldo="${registro.monto_aguinaldo}"
                                    data-fecha="${formatearFecha(registro.fecha_pago)}"
                                    data-registro="${formatearFecha(registro.fecha_registro, true)}"

                                    class="dropdown-item btn_detalles">Detalles</button>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
        tbody.append(fila);
    });
}

/**
 * Formatear fecha para mostrar: 12/ENE/2026 14:15:05
 */
function formatearFecha(fechaStr, tieneHora = false) {
    if (!fechaStr) return "-";

    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    // Si la fecha incluye hora, separar fecha y hora
    let [fechaParte, horaParte] = fechaStr.split(" ");
    const partes = fechaParte.split("-");
    if (partes.length !== 3) return fechaStr; // si no cumple el formato, devolver tal cual

    const anio = partes[0];
    const mesIndex = parseInt(partes[1], 10) - 1;
    const dia = partes[2].padStart(2, '0');
    const mes = meses[mesIndex] ?? partes[1];

    if (tieneHora && horaParte) {
        const [horas, minutos, segundos] = horaParte.split(":");
        return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
    }

    return `${dia}/${mes}/${anio}`;
}

/**
 * Renderizar la paginación de resultados
 */
function renderizarPaginacion(total, paginaActualParam, limite) {
    const paginacion = $("#paginacion");
    paginacion.empty();

    // Si limite es -1 (Todos), no mostrar paginación
    if (limite === -1) {
        $("#contenedor-paginacion").hide();
        return;
    }

    const totalPaginas = Math.ceil(total / limite);

    if (totalPaginas <= 1) {
        $("#contenedor-paginacion").hide();
        return;
    }

    $("#contenedor-paginacion").show();

    // Botón anterior
    const btnAnterior = `
        <li class="page-item ${paginaActualParam <= 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-pagina="${paginaActualParam - 1}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;
    paginacion.append(btnAnterior);

    // Números de página
    let inicio = Math.max(1, paginaActualParam - 2);
    let fin = Math.min(totalPaginas, paginaActualParam + 2);

    // Ajustar para mostrar siempre 5 páginas si es posible
    if (fin - inicio < 4) {
        if (inicio === 1) {
            fin = Math.min(totalPaginas, inicio + 4);
        } else if (fin === totalPaginas) {
            inicio = Math.max(1, fin - 4);
        }
    }

    for (let i = inicio; i <= fin; i++) {
        const activo = i === paginaActualParam ? 'active' : '';
        const pagina = `
            <li class="page-item ${activo}">
                <a class="page-link" href="#" data-pagina="${i}">${i}</a>
            </li>
        `;
        paginacion.append(pagina);
    }

    // Botón siguiente
    const btnSiguiente = `
        <li class="page-item ${paginaActualParam >= totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" data-pagina="${paginaActualParam + 1}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    paginacion.append(btnSiguiente);

    // Eventos de paginación
    $(".page-link").off("click").on("click", function (e) {
        e.preventDefault();
        const nuevaPagina = $(this).data("pagina");
        if (nuevaPagina && nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            paginaActual = nuevaPagina;
            listar_aguinaldos();
        }
    });
}

/**
 * Configurar los eventos de los filtros y búsqueda
 */
function configurarFiltros() {
    // Búsqueda con debounce
    let timeoutBusqueda;
    $("#busqueda").on("input", function () {
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(function () {
            paginaActual = 1;
            listar_aguinaldos();
        }, 500);
    });

    // Filtro por año
    $("#anio").on("change", function () {
        paginaActual = 1;
        listar_aguinaldos();
    });

    // Filtro por departamento
    $("#departamento").on("change", function () {
        paginaActual = 1;
        listar_aguinaldos();
    });

    // Filtro por columna (qué ordenar)
    $("#columna").on("change", function () {
        paginaActual = 1;
        listar_aguinaldos();
    });

    // Filtro por orden (asc/desc)
    $("#orden").on("change", function () {
        paginaActual = 1;
        listar_aguinaldos();
    });

    // Filtro por límite de registros
    $("#limite").on("change", function () {
        paginaActual = 1;
        registrosPorPagina = parseInt($(this).val());
        listar_aguinaldos();
    });
}



/**
 * Mostrar detalles del aguinaldo en un modal
 */

$(document).on('click', '.btn_detalles', function (e) {
    e.preventDefault();

    // Recuperar los datos del boton
    const id = $(this).data("id");
    const clave = $(this).data("clave");
    const nombre = $(this).data("nombre");
    const anio = $(this).data("anio");
    const area = $(this).data("area");
    const departamento = $(this).data("departamento");
    const puesto = $(this).data("puesto");
    const dias = $(this).data("dias");
    const sueldo = $(this).data("sueldo");
    const aguinaldo = $(this).data("aguinaldo");
    const fecha = $(this).data("fecha");
    const registro = $(this).data("registro");

    // Insertar la información en el modal
    $("#detalle_clave").text(clave);
    $("#detalle_nombre").text(nombre);
    $("#detalle_anio").text(anio);
    $("#detalle_area").text(area);
    $("#detalle_departamento").text(departamento);
    $("#detalle_puesto").text(puesto);
    $("#detalle_dias").text(dias);
    $("#detalle_sueldo").text('$ ' + sueldo + ' MXN');
    $("#detalle_aguinaldo").text('$ ' + aguinaldo + ' MXN');
    $("#detalle_fecha").text(fecha);
    $("#detalle_registro").text(`Información capturada el día ${registro}`);

    // Mostrar el modal
    modal_detalles.show();
});