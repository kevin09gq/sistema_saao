// Configuración global de paginación
let empleadosData = [];
let empleadosPorPagina = 5; // Número de empleados por página
// Variable para la página actual
let paginaActual = 1;
let filtroDepartamento = "0"; // 0 = Todos
let busquedaActual = "";
let filtroEstado = "Todos"; // 'Todos', 'Activo', 'Baja'

function setEmpleadosData(data) {
    empleadosData = data;
    paginaActual = 1;
    renderTablaEmpleados();
}

function setFiltroDepartamento(idDepartamento) {
    filtroDepartamento = idDepartamento;
    paginaActual = 1;
    renderTablaEmpleados();
}

function setFiltroEstado(estado) {
    filtroEstado = estado;
    paginaActual = 1;
    renderTablaEmpleados();
}

function setBusqueda(texto) {
    busquedaActual = texto.toLowerCase();
    paginaActual = 1;
    renderTablaEmpleados();
}

function renderTablaEmpleados() {
    // Filtrar por departamento
    let filtrados = empleadosData;
    if (filtroDepartamento !== "0") {
        filtrados = empleadosData.filter(emp => String(emp.id_departamento) === String(filtroDepartamento));
    }
    // Filtrar por estado
    if (filtroEstado !== "Todos") {
        filtrados = filtrados.filter(emp => {
            // Considera que nombre_status puede ser 'Activo' o 'Inactivo'
            return emp.nombre_status === filtroEstado;
        });
    }
    // Filtrar por búsqueda
    if (busquedaActual && busquedaActual.trim() !== "") {
        filtrados = filtrados.filter(emp => {
            let texto = (
                emp.nombre + " " +
                emp.ap_paterno + " " +
                emp.ap_materno + " " +
                emp.clave_empleado
            ).toLowerCase();
            return texto.includes(busquedaActual);
        });
    }

    let inicio = (paginaActual - 1) * empleadosPorPagina;
    let fin = inicio + empleadosPorPagina;
    let empleadosPagina = filtrados.slice(inicio, fin);

    let datos = "";
    empleadosPagina.forEach(emp => {
        datos += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="name-company">
                            <span class="name">${emp.nombre} ${emp.ap_paterno} ${emp.ap_materno}</span>
                            <span class="company">${emp.nombre_departamento}</span>
                        </div>
                    </div>
                </td>
                <td>${emp.clave_empleado}</td>
                <td><span class="status ${emp.id_status == 1 ? 'status-activo' : 'status-inactivo'}">${emp.nombre_status}</span></td>
                <td class="text-end">
                    <button class="btn btn-view btn-actualizar" data-id="${emp.id_empleado}" data-clave="${emp.clave_empleado}"> Actualizar </button>
                </td>
            </tr>
        `;
    });
    $("#tablaEmpleadosCuerpo").html(datos);
    renderPaginacion(filtrados.length);
}

function renderPaginacion(totalFiltrados) {
    let totalPaginas = Math.ceil(totalFiltrados / empleadosPorPagina);
    let paginacionHtml = "";

    if (totalPaginas <= 1) {
        $("#paginacion").html("");
        return;
    }

    paginacionHtml += `<li class="page-item${paginaActual === 1 ? ' disabled' : ''}">
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">&laquo;</a>
    </li>`;

    for (let i = 1; i <= totalPaginas; i++) {
        paginacionHtml += `<li class="page-item${paginaActual === i ? ' active' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i}</a>
        </li>`;
    }

    paginacionHtml += `<li class="page-item${paginaActual === totalPaginas ? ' disabled' : ''}">
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">&raquo;</a>
    </li>`;

    $("#paginacion").html(paginacionHtml);
}

function cambiarPagina(nuevaPagina) {
    // Filtrar por departamento, estado y búsqueda para saber el total de páginas
    let filtrados = empleadosData;
    if (filtroDepartamento !== "0") {
        filtrados = empleadosData.filter(emp => String(emp.id_departamento) === String(filtroDepartamento));
    }
    if (filtroEstado !== "Todos") {
        filtrados = filtrados.filter(emp => emp.nombre_status === filtroEstado);
    }
    if (busquedaActual && busquedaActual.trim() !== "") {
        filtrados = filtrados.filter(emp => {
            let texto = (
                emp.nombre + " " +
                emp.ap_paterno + " " +
                emp.ap_materno + " " +
                emp.clave_empleado
            ).toLowerCase();
            return texto.includes(busquedaActual);
        });
    }
    let totalPaginas = Math.ceil(filtrados.length / empleadosPorPagina);
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    paginaActual = nuevaPagina;
    renderTablaEmpleados();
}
