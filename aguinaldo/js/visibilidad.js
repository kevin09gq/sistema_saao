/**
 * Evento para abrir el modal de visibilidad de los empleados
 */
$('#btn_visibilidad').click(function (e) {
    e.preventDefault();

    llenar_lista_empleados_visibilidad();

    modal_visibilidad.show();
});


/**
 * Funcion para llenar la lista de empleados para el modal de visibilidad de empleados
 */
function llenar_lista_empleados_visibilidad() {

    // VALIDAR QUE EL jsonAguinaldo si exista
    if (!window.jsonAguinaldo || window.jsonAguinaldo.length === 0) {
        console.warn("No hay datos en jsonAguinaldo para mostrar");
        $('#contenedor_lista_empleados_sin_derecho').html('<span>Registros no encontrados.</span>');
        return;
    }

    // Filtrar empleados por departamentos
    let departamentoSeleccionado = $('#select_departamento_visibilidad').val();
    // Obtener el texto de búsqueda y convertirlo a minúsculas para comparación
    let textoBusqueda = $('#buscar_empleado_visibilidad').val().toLowerCase();

    // Filtrar empleados: De acuerdo al departamento seleccionado
    let empleadosFiltrados = jsonAguinaldo.empleados.filter(emp => {
        // Filtro de búsqueda por texto
        const coincideBusqueda = !textoBusqueda ||
            (emp.clave_empleado && emp.clave_empleado.toLowerCase().includes(textoBusqueda)) ||
            (emp.nombre && emp.nombre.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_paterno && emp.ap_paterno.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_materno && emp.ap_materno.toLowerCase().includes(textoBusqueda));
        // Filtro de departamento por id
        const coincideDepartamento = parseInt(emp.id_departamento) === parseInt(departamentoSeleccionado);

        return coincideDepartamento && coincideBusqueda;
    });

    // Limpiar tabla
    const contenedor = $('#contenedor_lista_empleados_visibilidad');
    contenedor.empty();

    // Si no hay empleados después de filtrar, mostrar mensaje
    if (empleadosFiltrados.length === 0) {
        contenedor.html('No se encontraron empleados');
        return;
    }

    // Generar los registros
    empleadosFiltrados.forEach((empleado, index) => {

        let nombre_completo = empleado.nombre + ' ' + empleado.ap_paterno + ' ' + empleado.ap_materno;

        const fila = `
            <label class="list-group-item list-group-item-action d-flex align-items-center py-3" style="cursor: pointer;">
                <input
                    ${empleado.visible ? 'checked' : ''}
                    data-id="${empleado.id_empleado}"
                    class="form-check-input me-3 mt-0 checkbox_empleado_visibilidad"
                    type="checkbox">
                <span class="flex-grow-1 fw-medium"><span class="text-secondary me-2">[${empleado.clave_empleado}]</span>${nombre_completo} - ${empleado.dias_trabajados} Días trabajados</span>
                <i class="bi bi-person-fill text-muted"></i>
            </label>
        `;

        contenedor.append(fila);
    });
}

/**
 * Evento para mostrar u ocultar el aguinaldo de un empleado específico
 */
$(document).on('change', '.checkbox_empleado_visibilidad', function (e) {
    e.preventDefault();

    let check = $(this);

    // Obtener el id del empleado desde el atributo data-id del input
    const idEmpleado = check.data('id');
    // Saber si esta checked o no
    let visible = check.is(':checked') ? true : false;
    // Recuperar el estado actual de jsonAguinaldo
    const json = getAguinaldo();
    // Recupera al empleado mediante el id
    const empleadoIndex = json.empleados.findIndex(e => e.id_empleado === idEmpleado);
    // Si no se encuentra el empleado, muestra una alerta y detiene la ejecución
    if (empleadoIndex === -1) {
        alerta("error", "Empleado no encontrado.", "No se pudo encontrar al empleado para actualizar su visibilidad.");
        return;
    }

    // Saber si el empleado tiene derecho al aguinaldo
    let tiene_derecho = json.empleados[empleadoIndex].derecho_aguinaldo;

    if (tiene_derecho) {
        // Si el empleado tiene derecho al aguinaldo, se puede mostrar u ocultar su información en la tabla del aguinaldo
        // Actualizar el estado de visible del empleado seleccionado
        json.empleados[empleadoIndex].visible = visible;
    } else {
        // Si el empleado no tiene derecho al aguinaldo, se muestra una alerta y se desmarca la casilla
        alerta("warning", "Empleado sin derecho a aguinaldo.", "Este empleado no tiene derecho a recibir aguinaldo, por lo que no se puede mostrar en la tabla del aguinaldo. Vaya al modal de Empleados sin Aguinaldo y asigne dias trabajados a este empleado para que pueda ser visible en la tabla del aguinaldo.");
        check.prop('checked', false);
        return;
    }

    // Actualizar el jsonAguinaldo con los nuevos datos combinados
    setAguinaldo(json);
    // Llenar la tabla de aguinaldo para mostrar u ocultar el empleado seleccionado
    llenar_tabla_aguinaldo();
});

/**
 * Eventos para mostrar todos los empleados
 */
$(document).on('click', '#btn_visibles_todos', function (e) {
    e.preventDefault();

    // Recuperar el estado actual de jsonAguinaldo
    let json = getAguinaldo();
    // Recuperar departamento seleccionado para filtrar los empleados
    let departamentoSeleccionado = $('#select_departamento_visibilidad').val();

    // Actualizar el estado de visible de todos los empleados a true
    json.empleados.forEach(empleado => {
        // VERIFICAR SI EL EMPLEADO TIENE DERECHO AL AGUINALDO
        if (empleado.derecho_aguinaldo && parseInt(empleado.id_departamento) === parseInt(departamentoSeleccionado)) {
            empleado.visible = true;
        }
    });

    // Actualizar el jsonAguinaldo con los nuevos datos combinados
    setAguinaldo(json);
    // Llenar la lista de empleados para el modal de visibilidad de empleados para marcar a todos los empleados como visibles
    llenar_lista_empleados_visibilidad();
    // Llenar la tabla de aguinaldo para mostrar a todos los empleados
    llenar_tabla_aguinaldo();
});

/**
 * Eventos para ocultar todos los empleados
 */
$(document).on('click', '#btn_ocultos_todos', function (e) {
    e.preventDefault();

    // Recuperar el estado actual de jsonAguinaldo
    let json = getAguinaldo();
    // Recuperar departamento seleccionado para filtrar los empleados
    let departamentoSeleccionado = $('#select_departamento_visibilidad').val();

    // Actualizar el estado de visible de todos los empleados a false
    json.empleados.forEach(empleado => {
        // NO IMPORTA SI EL EMPLEADO TIENE DERECHO AL AGUINALDO O NO, SI SE VA A OCULTAR
        if (parseInt(empleado.id_departamento) === parseInt(departamentoSeleccionado)) {
            empleado.visible = false;
        }
    });

    // Actualizar el jsonAguinaldo con los nuevos datos combinados
    setAguinaldo(json);
    // Llenar la lista de empleados para el modal de visibilidad de empleados para marcar a todos los empleados como visibles
    llenar_lista_empleados_visibilidad();
    // Llenar la tabla de aguinaldo para mostrar a todos los empleados
    llenar_tabla_aguinaldo();
});

/**
 * ========================================================================================
 * Eventos para el modal de visibilidad de empleados
* =========================================================================================
 */

// Evento de búsqueda
$('#buscar_empleado_visibilidad').on('keyup', function () {
    llenar_lista_empleados_visibilidad();
});

// Evento de filtro departamento
$('#select_departamento_visibilidad').on('change', function () {
    llenar_lista_empleados_visibilidad();
});