$(document).ready(function () {

    // Constantes
    const URL_SABE = "/sistema_saao/";
    let departamentos = document.getElementById("departamento");
    let inputBusqueda = document.getElementById("busqueda");
    let selectEstado = document.getElementById("estado");
    let cuerpoTabla = document.getElementById("cuerpo-tabla-prestamos");
    let paginacion = document.getElementById("paginacion");

    const LIMITE = 10;
    let paginaActual = 1;


    // Inicializar funciones
    obtenerDepartamentos();
    obtenerPrestamos();

    // Eventos de filtros
    let debounceTimer = null;
    inputBusqueda.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            paginaActual = 1;
            obtenerPrestamos();
        }, 350);
    });

    departamentos.addEventListener('change', function () {
        paginaActual = 1;
        obtenerPrestamos();
    });

    selectEstado.addEventListener('change', function () {
        paginaActual = 1;
        obtenerPrestamos();
    });

    // =======================================
    // Obtener departamentos desde el servidor
    // =======================================
    function obtenerDepartamentos() {
        $.ajax({
            type: "GET",
            url: URL_SABE + "public/php/obtenerDepartamentos.php",
            dataType: "json",
            success: function (response) {
                console.log(response);
                departamentos.innerHTML = "<option selected value='-1'>Todos los departamentos</option>";
                response.forEach(departamento => {
                    let option = document.createElement("option");
                    option.value = departamento.id_departamento;
                    option.textContent = departamento.nombre_departamento;
                    departamentos.appendChild(option);
                });
            }
        });
    }

    // ====================
    //  Obtener prestamos
    // ====================
    function obtenerPrestamos() {

        $.ajax({
            type: "GET",
            url: URL_SABE + "prestamos/php/obtenerPrestamos.php",
            dataType: "json",
            data: {
                busqueda: inputBusqueda.value || "",
                departamento: departamentos.value || "-1",
                estado: selectEstado.value || "-1",
                page: paginaActual,
                limit: LIMITE
            },
            success: function (response) {
                if (!response || !response.data) {
                    renderTabla([]);
                    renderPaginacion({ page: 1, total_pages: 1 });
                    return;
                }

                let items = response.data.items || [];
                let pagination = response.data.pagination || { page: 1, total_pages: 1 };

                renderTabla(items);
                renderPaginacion(pagination);
            },
            error: function () {
                renderTabla([]);
                renderPaginacion({ page: 1, total_pages: 1 });
            }
        });
    }

    function formatearMoneda(numero) {
        let n = Number(numero || 0);
        return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // =============================
    // Llenar la tabla con sus datos
    // =============================
    function renderTabla(items) {
        if (!cuerpoTabla) {
            return;
        }

        if (!items || items.length === 0) {
            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">Sin resultados</td>
                </tr>
            `;
            return;
        }

        let html = "";
        items.forEach(item => {
            let estado = (item.estado || '').toLowerCase();
            let badge = estado === 'activo'
                ? '<span class="badge text-bg-success">Activo</span>'
                : '<span class="badge text-bg-secondary">Liquidado</span>';

            let link_detalles = `detalles.php?id_empleado=${encodeURIComponent(item.id_empleado)}`;
            let link_pdf = `generarPdfEstadoCuenta.php?id_empleado=${encodeURIComponent(item.id_empleado)}`;

            html += `
                <tr>
                    <td data-titulo="empleado">${item.empleado}</td>
                    <td data-titulo="prestamo" class="text-end">$ ${formatearMoneda(item.prestamo)}</td>
                    <td data-titulo="abonado" class="text-end">$ ${formatearMoneda(item.abonado)}</td>
                    <td data-titulo="deuda" class="text-end">$ ${formatearMoneda(item.deuda)}</td>
                    <td data-titulo="estado" class="text-center">${badge}</td>
                    <td class="text-center">
                        <a class="btn btn-outline-primary" href="${link_detalles}" title="Ver Detalles"><i class="bi bi-search"></i></a>
                        <a class="btn btn-outline-danger" href="${link_pdf}" target="_blank" title="Generar Estado de Cuenta"><i class="bi bi-file-earmark-pdf"></i></a>
                    </td>
                </tr>
            `;
        });

        cuerpoTabla.innerHTML = html;
    }

    function renderPaginacion(paginationData) {
        if (!paginacion) {
            return;
        }

        let page = Number(paginationData.page || 1);
        let totalPages = Number(paginationData.total_pages || 1);
        if (totalPages < 1) {
            totalPages = 1;
        }
        if (page < 1) {
            page = 1;
        }
        if (page > totalPages) {
            page = totalPages;
        }

        let start = Math.max(1, page - 2);
        let end = Math.min(totalPages, page + 2);

        let html = '<ul class="pagination">';

        html += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${page - 1}" aria-label="Previous">&laquo;</a>
            </li>
        `;

        for (let p = start; p <= end; p++) {
            html += `
                <li class="page-item ${p === page ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${p}">${p}</a>
                </li>
            `;
        }

        html += `
            <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${page + 1}" aria-label="Next">&raquo;</a>
            </li>
        `;

        html += '</ul>';
        paginacion.innerHTML = html;

        // Bind click eventos
        $(paginacion).find('a.page-link').off('click').on('click', function (e) {
            e.preventDefault();
            let target = Number($(this).data('page'));
            if (!target || target < 1 || target > totalPages || target === paginaActual) {
                return;
            }
            paginaActual = target;
            obtenerPrestamos();
        });
    }

});