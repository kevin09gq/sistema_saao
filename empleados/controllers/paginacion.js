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
    if (filtroDepartamento === "1000") {
        // Filtrar empleados sin seguro (donde imss es null o vacío)
        filtrados = empleadosData.filter(emp => !emp.imss || emp.imss === "" || emp.imss === null);
    } else if (filtroDepartamento !== "0") {
        // Filtrar por departamento específico
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
                <td><span id="btn_status" data-id-empleado="${emp.id_empleado}" data-id-status="${emp.id_status}" class="status ${emp.id_status == 1 ? 'status-activo' : 'status-inactivo'}">${emp.nombre_status}</span></td>
                <td class="text-end">
                    <button class="btn btn-view btn-actualizar" data-id="${emp.id_empleado}" data-clave="${emp.clave_empleado}" title="Actualizar"><i class="bi bi-pencil"></i></button>
                    ${emp.nombre_status !== 'Activo' ? `<button class="btn btn-danger btn-eliminar" data-id="${emp.id_empleado}" data-nombre="${emp.nombre} ${emp.ap_paterno} ${emp.ap_materno}" title="Eliminar"><i class="bi bi-trash"></i></button>` : ''}
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

    // Botón anterior
    paginacionHtml += `<li class="page-item${paginaActual === 1 ? ' disabled' : ''}">
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">&laquo;</a>
    </li>`;
    
    // Determinar qué números de página mostrar
    const paginasVisibles = 5; // Número de páginas a mostrar además de la primera y última
    const paginas = [];
    
    // Siempre agregar la primera página
    paginas.push(1);
    
    // Calcular el rango alrededor de la página actual
    const inicio = Math.max(2, paginaActual - Math.floor(paginasVisibles/2));
    const fin = Math.min(totalPaginas - 1, inicio + paginasVisibles - 1);
    
    // Agregar ellipsis después de la página 1 si es necesario
    if (inicio > 2) {
        paginas.push('...');
    }
    
    // Agregar páginas del rango calculado
    for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
    }
    
    // Agregar ellipsis antes de la última página si es necesario
    if (fin < totalPaginas - 1) {
        paginas.push('...');
    }
    
    // Siempre agregar la última página si hay más de una página
    if (totalPaginas > 1) {
        paginas.push(totalPaginas);
    }
    
    // Generar HTML para cada número de página o ellipsis
    paginas.forEach(pagina => {
        if (pagina === '...') {
            paginacionHtml += `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>`;
        } else {
            paginacionHtml += `<li class="page-item${paginaActual === pagina ? ' active' : ''}">
                <a class="page-link" href="#" onclick="cambiarPagina(${pagina}); return false;">${pagina}</a>
            </li>`;
        }
    });

    // Botón siguiente
    paginacionHtml += `<li class="page-item${paginaActual === totalPaginas ? ' disabled' : ''}">
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">&raquo;</a>
    </li>`;

    $("#paginacion").html(paginacionHtml);
}

function cambiarPagina(nuevaPagina) {
    // Filtrar por departamento, estado y búsqueda para saber el total de páginas
    let filtrados = empleadosData;
    if (filtroDepartamento === "1000") {
        filtrados = empleadosData.filter(emp => !emp.imss || emp.imss === "" || emp.imss === null);
    } else if (filtroDepartamento !== "0") {
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

function paginacionStatus(empleadosData) {
    // Verificar si la página actual sigue siendo válida
    let filtrados = empleadosData;
    if (filtroDepartamento === "1000") {
        filtrados = empleadosData.filter(emp => !emp.imss || emp.imss === "" || emp.imss === null);
    } else if (filtroDepartamento !== "0") {
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

    // Si la página actual es mayor que el total de páginas, ir a la última página válida
    if (paginaActual > totalPaginas && totalPaginas > 0) {
        paginaActual = totalPaginas;
    } else if (totalPaginas === 0) {
        paginaActual = 1;
    }

    renderTablaEmpleados();

}
