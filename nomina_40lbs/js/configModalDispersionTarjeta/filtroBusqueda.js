// ========================================
// OBTENER Y FILTRAR EMPLEADOS PARA EL MODAL DE DISPERSIÓN DE TARJETA
// ========================================

function obtenerTodosLosEmpleadosFiltrados() {
    let empleados = [];
    jsonNomina40lbs.departamentos.forEach(depto => {
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

function cargarDepartamentosEnSelect() {
    const $select = $('#filtro-departamento-tarjeta');
    $select.empty();
    $select.append('<option value="todos">Todos los departamentos</option>');

    // Obtener lista única de departamentos que tienen al menos un empleado con seguro social
    const deptosConSeguro = new Set();
    jsonNomina40lbs.departamentos.forEach(depto => {
        const tieneInsured = depto.empleados.some(emp => emp.seguroSocial === true);
        if (tieneInsured) {
            deptosConSeguro.add(depto.nombre);
        }
    });

    deptosConSeguro.forEach(nombreDepto => {
        $select.append(`<option value="${nombreDepto}">${nombreDepto}</option>`);
    });
}

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
