// Paginación simple para nómina (sin API, solo funciones y variables globales)
let empleadosPaginados = [];
let paginaActualNomina = 1;
const empleadosPorPagina = 7;

function setEmpleadosPaginados(array) {
    empleadosPaginados = array;
    paginaActualNomina = 1;
    renderTablaPaginada();
}

function renderTablaPaginada() {
    const inicio = (paginaActualNomina - 1) * empleadosPorPagina;
    const fin = inicio + empleadosPorPagina;
    const empleadosPagina = empleadosPaginados.slice(inicio, fin);
    // Renderiza la tabla (el usuario debe definir renderEmpleadosTabla)
    if (typeof renderEmpleadosTabla === 'function') {
        renderEmpleadosTabla(empleadosPagina, inicio);
    }
    renderPaginacionNomina();
}

function renderPaginacionNomina() {
    const totalPaginas = Math.ceil(empleadosPaginados.length / empleadosPorPagina);
    let html = '';
    if (totalPaginas > 1) {
        html += `<li class="page-item${paginaActualNomina === 1 ? ' disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPaginaNomina(${paginaActualNomina - 1}); return false;">&laquo;</a>
        </li>`;
        for (let i = 1; i <= totalPaginas; i++) {
            html += `<li class="page-item${paginaActualNomina === i ? ' active' : ''}">
                <a class="page-link" href="#" onclick="cambiarPaginaNomina(${i}); return false;">${i}</a>
            </li>`;
        }
        html += `<li class="page-item${paginaActualNomina === totalPaginas ? ' disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPaginaNomina(${paginaActualNomina + 1}); return false;">&raquo;</a>
        </li>`;
    }
    $("#paginacion-nomina").html(html);
}

function cambiarPaginaNomina(nuevaPagina) {
    const totalPaginas = Math.ceil(empleadosPaginados.length / empleadosPorPagina);
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    paginaActualNomina = nuevaPagina;
    renderTablaPaginada();
}
