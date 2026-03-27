// ========================================
// OBTENER Y FILTRAR EMPLEADOS PARA EL MODAL DE DISPERSIÓN DE TARJETA
// ========================================

function obtenerTodosLosEmpleadosFiltrados() {
    let empleados = [];
    jsonNomina40lbs.departamentos.forEach(depto => {
        if (depto.nombre !== 'Sin Seguro') {
            depto.empleados.forEach(emp => {
                if (emp.mostrar !== false) {
                    // Guardamos el nombre del departamento en el objeto para facilitar el filtrado posterior
                    empleados.push({
                        ...emp,
                        nombre_departamento: depto.nombre
                    });
                }
            });
        }
    });
    return empleados;
}

function cargarDepartamentosEnSelect() {
    const $select = $('#filtro-departamento-tarjeta');
    $select.empty();
    $select.append('<option value="todos">Todos los departamentos</option>');

    jsonNomina40lbs.departamentos.forEach(depto => {
        if (depto.nombre !== 'Sin Seguro') {
            $select.append(`<option value="${depto.nombre}">${depto.nombre}</option>`);
        }
    });
}

$(document).on('change', '#filtro-departamento-tarjeta', function() {
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
