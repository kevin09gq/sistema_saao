$(document).ready(function () {
    obtenerNominas();
    eventosPaginacion();
    eventosFiltros();
    limpiarBusqueda();
    visualizarNomina();
});

// Variables globales
let nominas = [];
let nominasFiltradas = [];
let paginaActual = 1;
let registrosPorPagina = 5;

//===============================================
// CONFIGURACIÓN PARA MOSTRAR LAS NÓMINAS
//===============================================

//FUNCION PARA OBTENER TODAS LAS NOMINAS DESDE EL SERVIDOR
function obtenerNominas() {

    $.ajax({
        type: "GET",
        url: "../php/obtenerNominas.php",
        data: {
            case: "obtenerNominas"
        },
        dataType: "json",

        success: function (response) {

            if (response.success) {

                nominas = response.nominas;
                nominasFiltradas = response.nominas;

                cargarAnios();
                mostrarNominas();

            } else {

                alert("No se pudieron obtener las nóminas");

            }

        },

        error: function (error) {

            alert(
                "Error al conectar con el servidor\n\n" +
                error.responseText
            );

        }

    });

}

// FUNCION PARA MOSTRAR LAS NOMINAS EN LA TABLA DE LA INTERFAZ
function mostrarNominas() {

    $("#tbody-nominas").html("");

    let inicio = (paginaActual - 1) * registrosPorPagina;
    let fin = inicio + registrosPorPagina;

    let nominasPagina = nominasFiltradas.slice(inicio, fin);

    nominasPagina.forEach(nomina => {

        let fila = `
            <tr>
                <td>${nomina.anio}</td>

                <td>
                    <span class="badge-semana-container">
                        <span class="badge-semana-icon">
                            <i class="bi bi-calendar3"></i>
                        </span>
                        Semana ${nomina.numero_semana}
                    </span>
                </td>

                <td class="percepciones-val">
                    $${nomina.total_percepciones}
                </td>

                <td class="deducciones-val">
                    -$${nomina.total_deducciones}
                </td>

                <td class="neto-val">
                    $${nomina.total_neto}
                </td>

                <td>
                    <button
                        type="button"
                        class="btn-historial-action"
                        data-id="${nomina.id_nomina_40lbs}">
                        <i class="bi bi-eye"></i>
                        Visualizar
                    </button>
                </td>
            </tr>
        `;

        $("#tbody-nominas").append(fila);

    });

    actualizarInfoPaginacion();
    generarBotonesPaginacion();

}

//===============================================
// CONFIGURACIÓN DE PAGINACIÓN
//===============================================

// FUNCION PARA ACTUALIZAR LA INFORMACIÓN DEL PIE DE PAGINA CON EL RANGO DE NÓMINAS MOSTRADAS Y EL TOTAL
function actualizarInfoPaginacion() {

    let inicio = ((paginaActual - 1) * registrosPorPagina) + 1;
    let fin = paginaActual * registrosPorPagina;

    if (fin > nominasFiltradas.length) {
        fin = nominasFiltradas.length;
    }

    $("#info-paginacion").html(`
        Mostrando <strong>${inicio}</strong> a
        <strong>${fin}</strong> de
        <strong>${nominasFiltradas.length}</strong> nóminas
    `);

}

// FUNCION PARA GENERAR LOS BOTONES DE PAGINACIÓN DINÁMICAMENTE SEGÚN EL TOTAL DE NÓMINAS FILTRADAS Y LA PÁGINA ACTUAL
function generarBotonesPaginacion() {

    let totalPaginas = Math.ceil(
        nominasFiltradas.length / registrosPorPagina
    );

    $("#paginacion-nominas").html("");

    // Botón anterior
    $("#paginacion-nominas").append(`
        <li>
            <a href="#" data-pagina="${paginaActual - 1}">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>
    `);

    let inicioPagina = paginaActual - 2;
    let finPagina = paginaActual + 2;

    if (inicioPagina < 1) {

        inicioPagina = 1;
        finPagina = 5;

    }

    if (finPagina > totalPaginas) {

        finPagina = totalPaginas;
        inicioPagina = totalPaginas - 4;

        if (inicioPagina < 1) {

            inicioPagina = 1;

        }

    }

    // Mostrar primera página y ...
    if (inicioPagina > 1) {

        $("#paginacion-nominas").append(`
            <li>
                <a href="#" data-pagina="1">
                    1
                </a>
            </li>
        `);

        if (inicioPagina > 2) {

            $("#paginacion-nominas").append(`
                <li>
                    <span>...</span>
                </li>
            `);

        }

    }

    // Páginas centrales
    for (
        let pagina = inicioPagina;
        pagina <= finPagina;
        pagina++
    ) {

        $("#paginacion-nominas").append(`
            <li class="${pagina === paginaActual ? 'active' : ''}">
                <a href="#" data-pagina="${pagina}">
                    ${pagina}
                </a>
            </li>
        `);

    }

    // Mostrar ... y última página
    if (finPagina < totalPaginas) {

        if (finPagina < totalPaginas - 1) {

            $("#paginacion-nominas").append(`
                <li>
                    <span>...</span>
                </li>
            `);

        }

        $("#paginacion-nominas").append(`
            <li>
                <a href="#" data-pagina="${totalPaginas}">
                    ${totalPaginas}
                </a>
            </li>
        `);

    }

    // Botón siguiente
    $("#paginacion-nominas").append(`
        <li>
            <a href="#" data-pagina="${paginaActual + 1}">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `);

}

// FUNCION PARA MANEJAR LOS EVENTOS DE CLIC EN LOS BOTONES DE PAGINACIÓN Y ACTUALIZAR LA PÁGINA ACTUAL EN CONSECUENCIA
function eventosPaginacion() {

    $(document).on(
        "click",
        "#paginacion-nominas a",
        function (e) {

            e.preventDefault();

            let nuevaPagina = parseInt(
                $(this).data("pagina")
            );

            let totalPaginas = Math.ceil(
                nominasFiltradas.length /
                registrosPorPagina
            );

            if (
                nuevaPagina >= 1 &&
                nuevaPagina <= totalPaginas
            ) {

                paginaActual = nuevaPagina;

                mostrarNominas();

            }

        }
    );

}

//===============================================
// CONFIGURACIÓN DE FILTROS
//===============================================

// FUNCION PARA CARGAR LOS AÑOS DISPONIBLES EN EL FILTRO DE AÑO SEGÚN LAS NÓMINAS OBTENIDAS
function cargarAnios() {

    $("#filtro-anio").html(`
        <option value="">Todos los años</option>
    `);

    let anios = [];

    nominas.forEach(nomina => {

        if (!anios.includes(nomina.anio)) {
            anios.push(nomina.anio);
        }

    });

    anios.sort().reverse();

    anios.forEach(anio => {

        $("#filtro-anio").append(`
            <option value="${anio}">
                ${anio}
            </option>
        `);

    });

}

// FUNCION PARA APLICAR LOS FILTROS DE AÑO Y SEMANA BUSCADA SOBRE LA LISTA DE NÓMINAS OBTENIDA Y ACTUALIZAR LA PÁGINA ACTUAL A 1 PARA MOSTRAR LOS RESULTADOS DESDE EL INICIO
function aplicarFiltros() {

    let anioSeleccionado =
        $("#filtro-anio").val();

    let semanaBuscada =
        $("#buscar-semana")
            .val()
            .trim();

    nominasFiltradas = nominas.filter(nomina => {

        let cumpleAnio =
            anioSeleccionado === "" ||
            nomina.anio == anioSeleccionado;

        let cumpleSemana =
            semanaBuscada === "" ||
            nomina.numero_semana
                .toString()
                .includes(semanaBuscada);

        return (
            cumpleAnio &&
            cumpleSemana
        );

    });

    paginaActual = 1;

    mostrarNominas();

}

// FUNCION PARA MANEJAR LOS EVENTOS DE CAMBIO EN EL FILTRO DE AÑO Y DE ENTRADA EN EL CAMPO DE BÚSQUEDA DE SEMANA Y APLICAR LOS FILTROS CORRESPONDIENTES
function eventosFiltros() {

    $("#filtro-anio").on(
        "change",
        function () {

            aplicarFiltros();

        }
    );

    $("#buscar-semana").on(
        "input",
        function () {

            aplicarFiltros();

        }
    );

}

// FUNCION PARA LIMPIAR LOS FILTROS 
function limpiarBusqueda() {

    $("#btn-clear-busqueda").on(
        "click",
        function () {

            $("#buscar-semana").val("");

            aplicarFiltros();

        }
    );

}


function visualizarNomina() {

    $(document).on("click", ".btn-historial-action", function () {

        let idNomina = $(this).data("id");

        window.location.href =
            `detalle_nomina.php?id=${idNomina}`;

    });

}