
$(document).ready(function () {
    $('#btn_ver_dispersion').on('click', function () {
        abrirModalDispersionTarjeta();
    });
    habilitarFiltroDepartamento();
});

// ========================================================
// CONFIGURACION PARA ABRIR Y ESTABLECER DATOS DEL MODAL 
//=========================================================

// FUNCION PARA ABRIR EL MODAL DE DISPERSION DE TARJETA
function abrirModalDispersionTarjeta() {
    if (typeof jsonHistorialNomina === 'undefined' || !jsonHistorialNomina || !jsonHistorialNomina.departamentos) {
        Swal.fire('Error', 'No hay datos de nómina cargados.', 'error');
        return;
    }

    // Inicializar el select de departamentos
    cargarDepartamentosEnSelect();

    // Mostrar todos los empleados inicialmente
    const todosLosEmpleados = obtenerTodosLosEmpleadosFiltrados();
    // Filtrar solo empleados con mostrar = true
    const empleadosAMostrar = todosLosEmpleados.filter(emp => emp.mostrar === true);
    renderizarTablaTarjeta(empleadosAMostrar);

    // Mostrar el modal
    $('#modalDispersionTarjeta').modal('show');
}

// FUNCION PARA OBTENER LOS EMPLEADOS QUE TENGAN SEGUROSOCIAL = TRUE Y SE PUEDAN FILTRAR POR DEPARTAMENTO
function obtenerTodosLosEmpleadosFiltrados() {
    let empleados = [];
    jsonHistorialNomina.departamentos.forEach(depto => {
        // Solo departamentos habilitados para edición (Dinámico)
        depto.empleados.forEach(emp => {
            // Solo mostrar empleados con seguro social y marcados para mostrar
            if (emp.seguroSocial === true) {
                // Guardamos el nombre del departamento en el objeto para facilitar el filtrado posterior
                empleados.push({
                    ...emp,
                    nombre_departamento: depto.nombre
                });
            }
        });

    });
    return empleados;
}

// FUNCION PARA CARGAR LOS DATOS AL SELECT DE DEPARTAMENTOS QUE CONTIENEN EL JSON
function cargarDepartamentosEnSelect() {
    const $select = $('#filtro-departamento-tarjeta');
    $select.empty();
    $select.append('<option value="todos">Todos los departamentos</option>');

    // Obtener lista única de departamentos que tienen al menos un empleado con seguro social
    const deptosConSeguro = new Set();
    jsonHistorialNomina.departamentos.forEach(depto => {
        const tieneInsured = depto.empleados.some(emp => emp.seguroSocial === true);
        if (tieneInsured) {
            deptosConSeguro.add(depto.nombre);
        }
    });

    deptosConSeguro.forEach(nombreDepto => {
        $select.append(`<option value="${nombreDepto}">${nombreDepto}</option>`);
    });
}

// FUNCION PARA MOSTRAR LOS EMPLEADOS EN LA TABLA DEL MODAL DE DISPERSION DE TARJETA
function renderizarTablaTarjeta(empleados) {
    const $tbody = $('#tbody-dispersion-tarjeta');
    $tbody.empty();

    let totalGeneral = 0;

    if (empleados.length === 0) {
        $tbody.append('<tr><td colspan="4" class="text-center text-muted">No se encontraron empleados.</td></tr>');
    } else {
        empleados.forEach((emp, index) => {
            const montoTarjeta = parseFloat(emp.tarjeta) || 0;
            totalGeneral += montoTarjeta;

            const row = `
                <tr data-clave="${emp.clave}" data-tarjeta-copia="${emp.tarjeta_copia || 0}">
                    <td class="text-center">${index + 1}</td>
                    <td><span class="badge bg-light text-dark border">${emp.clave || 'N/A'}</span></td>
                    <td>${emp.nombre || 'SIN NOMBRE'}</td>
                    <td class="text-end">
                        <div class="d-flex align-items-center justify-content-end gap-2">
                             <span class="fw-bold text-dark valor-tarjeta">$${montoTarjeta.toFixed(2)}</span>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });
    }

    // Actualizar totales en la vista
    $('#total-empleados-tarjeta').text(empleados.length);
    $('#total-general-tarjeta').text('$' + totalGeneral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
}

// ==========================================================
// CONFIGURACION PARA EL FILTRADO DE DEPARTAMENTOS DEL MODAL 
//===========================================================

function habilitarFiltroDepartamento() {
    $(document).on('change', '#filtro-departamento-tarjeta', function () {
    const departamentoSeleccionado = $(this).val();

    // Obtener todos los empleados inicialmente disponibles
    const todosLosEmpleados = obtenerTodosLosEmpleadosFiltrados();

    // Filtrar por el departamento seleccionado si no es "todos"
    let empleadosFiltrados;
    if (departamentoSeleccionado === 'todos') {
        empleadosFiltrados = todosLosEmpleados;
    } else {
        empleadosFiltrados = todosLosEmpleados.filter(emp => emp.nombre_departamento === departamentoSeleccionado);
    }

    // Volver a renderizar la tabla con los resultados filtrados
    renderizarTablaTarjeta(empleadosFiltrados);
});
}

