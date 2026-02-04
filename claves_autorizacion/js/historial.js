$(document).ready(function () {

    // ================================================================
    // CONSTANTES Y VARIABLES GLOBALES
    // ================================================================
    const URL_APP = "/sistema_saao/";
    let paginaActual = 1;
    let registrosPorPagina = 5; // Ya no es const, ahora es variable

    // ================================================================
    // INICIALIZACIÓN
    // ================================================================
    inicializarModulo();

    function inicializarModulo() {
        // Funciones para listar información
        cargarDepartamentos();
        listarHistorial();
        configurarFiltros();
    }

    // ================================================================
    // SECCIÓN: LISTAR HISTORIAL DE AUTORIZACIONES
    // ================================================================

    /**
     * Cargar departamentos en el select
     */
    function cargarDepartamentos() {
        $.ajax({
            url: URL_APP + "public/php/obtenerDepartamentos.php",
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
     * Listar historial de autorizaciones con paginación y filtros
     */
    function listarHistorial() {
        const busqueda = $("#busqueda").val();
        const departamento = $("#departamento").val();
        const orden = $("#orden_fecha").val();
        const limite = $("#limite").val();

        // Actualizar registros por página
        registrosPorPagina = parseInt(limite);

        $.ajax({
            url: "../php/listarHistorial.php",
            type: "GET",
            data: {
                pagina: paginaActual,
                limite: limite,
                busqueda: busqueda,
                departamento: departamento,
                orden: orden
            },
            dataType: "json",
            beforeSend: function () {
                $("#cuerpo-tabla-historial").html(
                    '<tr><td colspan="4" class="text-center"><span class="spinner-border spinner-border-sm"></span> Cargando...</td></tr>'
                );
            },
            success: function (response) {
                renderizarTabla(response.data, response.pagina, response.limite);
                renderizarPaginacion(response.total, response.pagina, response.limite);
            },
            error: function () {
                $("#cuerpo-tabla-historial").html(
                    '<tr><td colspan="4" class="text-center text-danger">Error al cargar los datos</td></tr>'
                );
            }
        });
    }

    /**
     * Renderizar datos en la tabla
     */
    function renderizarTabla(datos, pagina, limite) {
        const tbody = $("#cuerpo-tabla-historial");
        tbody.empty();

        if (!datos || datos.length === 0) {
            tbody.html(
                '<tr><td colspan="4" class="text-center text-muted">No se encontraron registros</td></tr>'
            );
            return;
        }

        datos.forEach(function (registro, index) {
            // Calcular el número de fila global
            let numeroFila;
            if (limite === -1) {
                // Si es "Todos", solo mostrar el índice
                numeroFila = index + 1;
            } else {
                // Calcular según la página actual
                numeroFila = (pagina - 1) * limite + index + 1;
            }
            
            const fila = `
                <tr>
                    <td class="text-center">${numeroFila}</td>
                    <td>${registro.motivo}</td>
                    <td class="text-center">${registro.nombre_completo}</td>
                    <td class="text-center">${formatearFecha(registro.fecha)}</td>
                </tr>
            `;
            tbody.append(fila);
        });
    }

    /**
     * Formatear fecha para mostrar: 12/ENE/2026 14:15:05
     */
    function formatearFecha(fechaStr) {
        if (!fechaStr) return "-";
        
        const fecha = new Date(fechaStr);
        const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = meses[fecha.getMonth()];
        const anio = fecha.getFullYear();
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        const segundos = String(fecha.getSeconds()).padStart(2, '0');
        
        return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
    }

    /**
     * Renderizar paginación
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
                listarHistorial();
            }
        });
    }

    /**
     * Configurar filtros de búsqueda
     */
    function configurarFiltros() {
        // Búsqueda con debounce
        let timeoutBusqueda;
        $("#busqueda").on("input", function () {
            clearTimeout(timeoutBusqueda);
            timeoutBusqueda = setTimeout(function () {
                paginaActual = 1;
                listarHistorial();
            }, 500);
        });

        // Filtro por departamento
        $("#departamento").on("change", function () {
            paginaActual = 1;
            listarHistorial();
        });

        // Filtro por orden de fecha
        $("#orden_fecha").on("change", function () {
            paginaActual = 1;
            listarHistorial();
        });

        // Filtro por límite de registros
        $("#limite").on("change", function () {
            paginaActual = 1;
            registrosPorPagina = parseInt($(this).val());
            listarHistorial();
        });
    }

});
