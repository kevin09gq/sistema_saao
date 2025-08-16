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

// ========================================
// PAGINACIÓN PARA TABLA DE DISPERSIÓN
// ========================================

// Variables para paginación de dispersión
let empleadosDispersionPaginados = [];
let paginaActualDispersion = 1;
const empleadosPorPaginaDispersion = 7;

// Función para establecer empleados paginados para dispersión
function setEmpleadosDispersionPaginados(array) {
    empleadosDispersionPaginados = array;
    paginaActualDispersion = 1;
    renderTablaDispersionPaginada();
}

// Función para renderizar tabla de dispersión paginada
function renderTablaDispersionPaginada() {
    const inicio = (paginaActualDispersion - 1) * empleadosPorPaginaDispersion;
    const fin = inicio + empleadosPorPaginaDispersion;
    const empleadosPagina = empleadosDispersionPaginados.slice(inicio, fin);
    
    // Renderiza la tabla con los empleados de la página actual
    mostrarDatosTablaDispersionPaginada(empleadosPagina);
    renderPaginacionDispersion();
}

// Función para mostrar datos de la tabla de dispersión con paginación
function mostrarDatosTablaDispersionPaginada(empleadosPagina) {
    // Limpiar la tabla
    $('#tabla-dispersion-body').empty();
    
    let numeroFila = ((paginaActualDispersion - 1) * empleadosPorPaginaDispersion) + 1;
    
    // Función para mostrar cadena vacía en lugar de 0, NaN o valores vacíos
    const mostrarValor = (valor) => {
        if (valor === 0 || valor === '0' || valor === '' || valor === null || valor === undefined || isNaN(valor)) {
            return '';
        }
        return valor;
    };
    
    // Renderizar solo los empleados de la página actual
    empleadosPagina.forEach(emp => {
        if (emp && emp.clave && emp.nombre) {
            let fila = `
                <tr data-clave="${emp.clave}">
                    <td>${numeroFila++}</td>
                    <td>${emp.clave}</td>
                    <td>${emp.nombre}</td>
                    <td>${mostrarValor(emp.neto_pagar)}</td>
                </tr>
            `;
            $('#tabla-dispersion-body').append(fila);
        }
    });
}

// Función para renderizar paginación de dispersión
function renderPaginacionDispersion() {
    const totalPaginas = Math.ceil(empleadosDispersionPaginados.length / empleadosPorPaginaDispersion);
    let html = '';
    if (totalPaginas > 1) {
        html += `<li class="page-item${paginaActualDispersion === 1 ? ' disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPaginaDispersion(${paginaActualDispersion - 1}); return false;">&laquo;</a>
        </li>`;
        for (let i = 1; i <= totalPaginas; i++) {
            html += `<li class="page-item${paginaActualDispersion === i ? ' active' : ''}">
                <a class="page-link" href="#" onclick="cambiarPaginaDispersion(${i}); return false;">${i}</a>
            </li>`;
        }
        html += `<li class="page-item${paginaActualDispersion === totalPaginas ? ' disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPaginaDispersion(${paginaActualDispersion + 1}); return false;">&raquo;</a>
        </li>`;
    }
    $("#paginacion-dispersion").html(html);
}

// Función para cambiar página en dispersión
function cambiarPaginaDispersion(nuevaPagina) {
    const totalPaginas = Math.ceil(empleadosDispersionPaginados.length / empleadosPorPaginaDispersion);
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    paginaActualDispersion = nuevaPagina;
    renderTablaDispersionPaginada();
}

