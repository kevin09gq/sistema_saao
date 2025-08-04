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
    
    // Renderiza la tabla con los empleados de la página actual
    mostrarDatosTablaPaginada(empleadosPagina);
    renderPaginacionNomina();
}

// La función mostrarDatosTablaPaginada() ahora está en leer_excel.js

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

// Función para mantener compatibilidad con el código existente
function mostrarDatosTabla() {
    // Si se llama desde el código existente, usar la paginación
    if (empleadosPaginados.length > 0) {
        renderTablaPaginada();
    } else {
        // Fallback: mostrar todos los datos sin paginación
        console.warn('No hay datos paginados, mostrando todos los datos');
        if (window.empleadosOriginales && window.empleadosOriginales.length > 0) {
            setEmpleadosPaginados(window.empleadosOriginales);
        }
    }
}
