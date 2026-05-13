
/**
 * EVENTO PARA ABRIR EL MODAL DE EMPLEADOS QUE NO TENGAN DERECHO AGUINALDO
 */
$('#btn_sin_derecho').click(function (e) {
    e.preventDefault();

    // Llenar los empleados que no tengan aguinaldo
    llenar_lista_empleados_sin_derecho_aguinaldo();

    // Abrir el modal
    modal_empleados_sin_derecho.show();
});

/**
 * Función para llenar la lista de empleados que no tienen derecho a aguinaldo en el modal correspondiente
 * Se aplican los filtros de departamento y búsqueda por texto
 */
function llenar_lista_empleados_sin_derecho_aguinaldo() {

    // RECUPERAR EL JSON DE AGUINALDO
    let json = getAguinaldo();
    // RECUPERAR EL DEPARTAMENTO SELECCIONADO EN EL FILTRO
    let departamentoSeleccionado = $('#select_departamento_sin_derecho').val();
    // RECUPERAR EL TEXTO DE BÚSQUEDA
    let textoBusqueda = $('#buscar_empleado_sin_derecho').val().toLowerCase().trim();


    // VALIDAR QUE EL jsonAguinaldo si exista
    if (!json || json.length === 0) {
        console.warn("No hay datos en jsonAguinaldo para mostrar");
        $('#contenedor_lista_empleados_sin_derecho').html('<span>Registros no encontrados.</span>');
        return;
    }

    // Filtrar empleados: Sólo los que no tienen derecho al aguinaldo
    let empleadosFiltrados = json.empleados.filter(emp => {
        // Filtro de derecho a aguinaldo y visibilidad
        const cumpleDerecho = emp.derecho_aguinaldo === false;

        // Filtro de búsqueda por texto
        const coincideBusqueda = !textoBusqueda ||
            (emp.clave_empleado && emp.clave_empleado.toLowerCase().includes(textoBusqueda)) ||
            (emp.nombre && emp.nombre.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_paterno && emp.ap_paterno.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_materno && emp.ap_materno.toLowerCase().includes(textoBusqueda));
        // Filtro de departamento
        const coincideDepartamento = parseInt(emp.id_departamento) === parseInt(departamentoSeleccionado);

        return cumpleDerecho && coincideDepartamento && coincideBusqueda;
    });

    // Limpiar tabla
    const contenedor = $('#contenedor_lista_empleados_sin_derecho');
    contenedor.empty();

    // Si no hay empleados después de filtrar, mostrar mensaje
    if (empleadosFiltrados.length === 0) {
        contenedor.html('<span class="p-3 text-center text-secondary">Empleados no encontrados.</span>');
        return;
    }

    // Generar los registros
    empleadosFiltrados.forEach((empleado, index) => {

        let nombre_completo = empleado.nombre + ' ' + empleado.ap_paterno + ' ' + empleado.ap_materno;

        const fila = `
            <label
                data-id="${empleado.id_empleado}"
                class="list-group-item list-group-item-action d-flex align-items-center py-3 btn_abrir_modal_editar"
                style="cursor: pointer;">
                <span class="flex-grow-1 fw-medium"><span class="text-secondary me-2">[${empleado.clave_empleado}]</span>${nombre_completo} - ${empleado.dias_trabajados} Días trabajados</span>
                <i class="bi bi-pencil-fill text-muted"></i>
            </label>
        `;

        contenedor.append(fila);
    });
}


/**
 * ========================================================================================
 * Eventos para el modal de visibilidad de empleados
* =========================================================================================
 */

// Evento de búsqueda
$('#buscar_empleado_sin_derecho').on('keyup', function () {
    llenar_lista_empleados_sin_derecho_aguinaldo();
});

// Evento de filtro departamento
$('#select_departamento_sin_derecho').on('change', function () {
    llenar_lista_empleados_sin_derecho_aguinaldo();
});


/**
 * EVENTO PARA ABRIR EL MODAL DE EDICIÓN DE EMPLEADO DESDE LA LISTA DE EMPLEADOS SIN DERECHO A AGUINALDO
 */

$(document).on('click', '.btn_abrir_modal_editar', function (e) {
    e.preventDefault();
    // RECUPERAR EL ID DEL EMPLEADO DESDE EL ATRIBUTO DATA-ID
    let id_empleado = $(this).data('id');
    // OCULTAR EL MODAL DE EMPLEADOS SIN DERECHO
    modal_empleados_sin_derecho.hide();
    // ABRIR EL MODAL DE EDICIÓN DE AGUINALDO CON EL ID DEL EMPLEADO
    editarAguinaldo(id_empleado);
});