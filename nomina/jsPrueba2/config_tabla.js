// Paginación simple para nómina 
let empleadosPaginados = [];
let paginaActualNomina = 1;
const empleadosPorPagina = 7;

function setEmpleadosPaginados(array) {
    // Recalcular sueldos antes de filtrar
    array.forEach(emp => {
        if (typeof calcularSueldoACobraPorEmpleado === 'function') {
            calcularSueldoACobraPorEmpleado(emp);
        }
    });
    
    // Filtrar solo empleados registrados antes de paginar
    filtrarEmpleadosRegistradosYPaginar(array);
}

// Nueva función para filtrar empleados registrados antes de la paginación
function filtrarEmpleadosRegistradosYPaginar(todosLosEmpleados) {
    // Obtener claves de empleados registrados
    let claves = obtenerClavesEmpleados();
    
    // Enviar petición AJAX para validar claves
    $.ajax({
        type: "POST",
        url: "../php/validar_clave.php",
        data: JSON.stringify({ claves: claves }),
        contentType: "application/json",
        success: function (clavesValidasJSON) {
            const clavesValidas = JSON.parse(clavesValidasJSON);
            
            // Filtrar solo empleados que están registrados en la base de datos
            const empleadosRegistrados = todosLosEmpleados.filter(emp => {
                return clavesValidas.includes(String(emp.clave)) || clavesValidas.includes(Number(emp.clave));
            });
            
            // Recalcular sueldos antes de asignar
            empleadosRegistrados.forEach(emp => {
                if (typeof calcularSueldoACobraPorEmpleado === 'function') {
                    calcularSueldoACobraPorEmpleado(emp);
                }
            });
            
            // Ahora asignar a empleadosPaginados solo los empleados registrados
            empleadosPaginados = empleadosRegistrados;
            paginaActualNomina = 1;
            
            // Actualizar empleados filtrados globales
            actualizarEmpleadosFiltradosGlobales();
            
            renderTablaPaginada();
        },
        error: function(xhr, status, error) {
            console.error('Error al validar claves:', error);
            // En caso de error, usar todos los empleados
            empleadosPaginados = todosLosEmpleados;
            paginaActualNomina = 1;
            renderTablaPaginada();
        }
    });
}

function renderTablaPaginada() {
    const inicio = (paginaActualNomina - 1) * empleadosPorPagina;
    const fin = inicio + empleadosPorPagina;
    const empleadosPagina = empleadosPaginados.slice(inicio, fin);
    
    // Recalcular sueldos antes de renderizar
    empleadosPagina.forEach(emp => {
        if (typeof calcularSueldoACobraPorEmpleado === 'function') {
            calcularSueldoACobraPorEmpleado(emp);
        }
    });
    
    // Renderiza la tabla con los empleados de la página actual
    mostrarDatosTablaPaginada(empleadosPagina);
    renderPaginacionNomina();
}

// Función para obtener las claves de empleados del departamento "PRODUCCION 40 LIBRAS"
function obtenerClavesEmpleados() {
    // Obtiene solo las claves de empleados del departamento "PRODUCCION 40 LIBRAS"
    let claves = [];
    if (jsonGlobal && jsonGlobal.departamentos) {
        jsonGlobal.departamentos.forEach(depto => {
            if ((depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS')) {
                (depto.empleados || []).forEach(emp => {
                    if (emp.clave) {
                        claves.push(emp.clave);
                    }
                });
            }
        });
    }

    return claves;
}

// Función para mostrar datos de la tabla con paginación
function mostrarDatosTablaPaginada(empleadosPagina) {
    // Limpiar la tabla
    $('#tabla-nomina-body').empty();
    
    // Calcular el número de fila inicial para la página actual
    let numeroFila = ((paginaActualNomina - 1) * empleadosPorPagina) + 1;
    
    // Renderizar solo los empleados de la página actual
    // Nota: empleadosPagina ya contiene solo empleados registrados
    empleadosPagina.forEach(emp => {
        // Recalcular sueldo a cobrar antes de mostrar
        if (typeof calcularSueldoACobraPorEmpleado === 'function') {
            calcularSueldoACobraPorEmpleado(emp);
        }
        
        // Obtener conceptos
        const conceptos = emp.conceptos || [];
        const getConcepto = (codigo) => {
            const c = conceptos.find(c => c.codigo === codigo);
            return c ? parseFloat(c.resultado).toFixed(2) : '';
        };
        const infonavit = getConcepto('16');
        const isr = getConcepto('45');
        const imss = getConcepto('52');

        // Usar el puesto original del empleado
        let puestoEmpleado = emp.puesto || emp.nombre_departamento || '';

        // Obtener el incentivo si existe y formatearlo correctamente
        const incentivo = emp.incentivo ? parseFloat(emp.incentivo).toFixed(2) : '';

        // Función para mostrar cadena vacía en lugar de 0, NaN o valores vacíos
        const mostrarValor = (valor) => {
            if (valor === 0 || valor === '0' || valor === '' || valor === null || valor === undefined || isNaN(valor)) {
                return '';
            }
            // Formatear números con dos decimales
            const num = parseFloat(valor);
            return isNaN(num) ? '' : num.toFixed(2);
        };

        let fila = `
            <tr data-clave="${emp.clave}">
                <td>${numeroFila++}</td>
                <td>${emp.nombre}</td>
                <td>${puestoEmpleado}</td>
                <td>${mostrarValor(emp.sueldo_base)}</td>
                <td>${mostrarValor(incentivo)}</td>
                <td>${mostrarValor(emp.sueldo_extra_final)}</td>
                <td>${mostrarValor(emp.neto_pagar)}</td>
                <td>${mostrarValor(emp.prestamo)}</td>
                <td>${mostrarValor(emp.inasistencias_descuento)}</td>
                <td>${mostrarValor(emp.uniformes)}</td>
                <td>${mostrarValor(infonavit)}</td>
                <td>${mostrarValor(isr)}</td>
                <td>${mostrarValor(imss)}</td>
                <td>${mostrarValor(emp.checador)}</td>
                <td>${mostrarValor(emp.fa_gafet_cofia)}</td>
                <td>${mostrarValor(emp.sueldo_a_cobrar)}</td>
            </tr>
        `;
        $('#tabla-nomina-body').append(fila);
    });
    
    // Re-inicializar el menú contextual después de renderizar la tabla
    inicializarMenuContextual();
}

// Función para actualizar empleados filtrados globales cuando se cambie el set paginado
function actualizarEmpleadosFiltradosGlobales() {
    if (window.empleadosFiltrados) {
        window.empleadosFiltrados = [...empleadosPaginados];
    }
}

// ========================================
// PAGINACIÓN PARA TABLA PRINCIPAL
// ========================================

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
    // Recalcular sueldos antes de asignar
    array.forEach(emp => {
        if (typeof calcularSueldoACobraPorEmpleado === 'function') {
            calcularSueldoACobraPorEmpleado(emp);
        }
    });
    
    empleadosDispersionPaginados = array;
    paginaActualDispersion = 1;
    renderTablaDispersionPaginada();
}

// Función para renderizar tabla de dispersión paginada
function renderTablaDispersionPaginada() {
    const inicio = (paginaActualDispersion - 1) * empleadosPorPaginaDispersion;
    const fin = inicio + empleadosPorPaginaDispersion;
    const empleadosPagina = empleadosDispersionPaginados.slice(inicio, fin);
    
    // Recalcular sueldos antes de renderizar
    empleadosPagina.forEach(emp => {
        if (typeof calcularSueldoACobraPorEmpleado === 'function') {
            calcularSueldoACobraPorEmpleado(emp);
        }
    });
    
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
        // Formatear números con dos decimales
        const num = parseFloat(valor);
        return isNaN(num) ? '' : num.toFixed(2);
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