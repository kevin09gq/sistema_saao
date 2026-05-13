
/**
 * Evento para abrir el modal de redondeos
 */
$('#btn_redondeos').click(function (e) {
    e.preventDefault();

    // Lamar a la función para llenar la lista de empleados en el modal de redondeos
    llenar_lista_empleados_redondeos();

    // Abrir el modal de redondeos
    modal_redondeos.show();
});

/**
 * Función para llenar la lista de empleados en el modal de redondeos
 */
function llenar_lista_empleados_redondeos() {

    // Obtener el jsonAguinaldo actual para obtener la lista de empleados
    let json = getAguinaldo();

    // Filtrar empleados por departamentos
    let departamentoSeleccionado = $('#select_departamento_redondeos').val();
    // Obtener el texto de búsqueda y convertirlo a minúsculas para comparación
    let textoBusqueda = $('#buscar_empleado_redondeos').val().toLowerCase();

    // Filtrar empleados: De acuerdo al departamento seleccionado
    let empleadosFiltrados = json.empleados.filter(emp => {
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
    const contenedor = $('#contenedor_empleados_redondeos');
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
                    ${empleado.aplicar_redondeo ? 'checked' : ''}
                    data-id="${empleado.id_empleado}"
                    class="form-check-input me-3 mt-0 checkbox_empleado_redondeos"
                    type="checkbox">
                <span class="flex-grow-1 fw-medium"><span class="text-secondary me-2">[${empleado.clave_empleado}]</span>${nombre_completo} - ${empleado.dias_trabajados} Días trabajados</span>
                <i class="bi bi-person-fill text-muted"></i>
            </label>
        `;

        contenedor.append(fila);
    });
}

// Evento para aplicar rodendeos a todos los empleados
$('#btn_poner_redondeos').click(function (e) {
    e.preventDefault();

    // RECUPERAR EL DEPARTAMENTO SELECCIONADO EN EL FILTRO
    let departamentoSeleccionado = $('#select_departamento_redondeos').val();

    // RECUPERAR EL JSON ACTUAL
    let json = getAguinaldo();

    // APLICAR REDONDEOS A TODOS LOS EMPLEADOS
    json.empleados.forEach(empleado => {
        // SI EL DEPARTAMENTO DEL EMPLEADO COINCIDE CON EL DEPARTAMENTO SELECCIONADO, APLICAR REDONDEO
        if (parseInt(empleado.id_departamento) === parseInt(departamentoSeleccionado)) {
            empleado.aplicar_redondeo = true;

            // CALCULAR EL REDONDEO
            empleado.redondeo = empleado.aplicar_redondeo ? diferenciaRedondeo(empleado.neto_pagar) : 0;
            // CALCULAR EL NETO A PAGAR CON REDONDEO
            empleado.neto_pagar_redondeado = calcularNetoPagarRedondeado(empleado.neto_pagar, empleado.redondeo);
        }
    });

    // ACTUALIZAR EL JSON ACTUAL
    setAguinaldo(json);

    // VOLVER A LLENAR LA LISTA DE EMPLEADOS EN EL MODAL DE REDONDEOS PARA REFLEJAR LOS CAMBIOS
    llenar_lista_empleados_redondeos();

    // VOLVER A LLENAR LA TABLA PRINCIPAL PARA REFLEJAR LOS CAMBIOS EN LOS REDONDEOS
    llenar_tabla_aguinaldo();
});

// Evento para quitar redondeos a todos los empleados
$('#btn_quitar_redondeos').click(function (e) {
    e.preventDefault();

    // OBTENER EL DEPARTAMENTO SELECCIONADO EN EL FILTRO
    let departamentoSeleccionado = $('#select_departamento_redondeos').val();

    // RECUPERAR EL JSON ACTUAL
    let json = getAguinaldo();

    // APLICAR REDONDEOS A TODOS LOS EMPLEADOS
    json.empleados.forEach(empleado => {
        // SI EL DEPARTAMENTO DEL EMPLEADO COINCIDE CON EL DEPARTAMENTO SELECCIONADO, QUITAR REDONDEO
        if (parseInt(empleado.id_departamento) === parseInt(departamentoSeleccionado)) {
            empleado.aplicar_redondeo = false;

            // CALCULAR EL REDONDEO
            empleado.redondeo = empleado.aplicar_redondeo ? diferenciaRedondeo(empleado.neto_pagar) : 0;
            // CALCULAR EL NETO A PAGAR CON REDONDEO
            empleado.neto_pagar_redondeado = calcularNetoPagarRedondeado(empleado.neto_pagar, empleado.redondeo);
        }
    });

    // ACTUALIZAR EL JSON ACTUAL
    setAguinaldo(json);

    // VOLVER A LLENAR LA LISTA DE EMPLEADOS EN EL MODAL DE REDONDEOS PARA REFLEJAR LOS CAMBIOS
    llenar_lista_empleados_redondeos();

    // VOLVER A LLENAR LA TABLA PRINCIPAL PARA REFLEJAR LOS CAMBIOS EN LOS REDONDEOS
    llenar_tabla_aguinaldo();
});

// Evento para aplicar redondeos a un empleado específico al marcar su checkbox
$(document).on('change', '.checkbox_empleado_redondeos', function (e) {
    e.preventDefault();

    // Obtener el estado del checkbox (marcado o desmarcado)
    let check = $(this);
    // OBTENER EL ID DEL EMPLEADO DESDE EL ATRIBUTO DATA
    let id_empleado = $(this).data('id');
    // SABER SI EL CHECKBOX ESTÁ MARCADO O NO
    let aplicar_redondeo = check.is(':checked'); // true si está marcado, false si no lo está
    // RECUPERAR EL JSON ACTUAL
    let json = getAguinaldo();

    // BUSCAR EL EMPLEADO EN EL JSON POR SU ID Y ACTUALIZAR SU PROPIEDAD "aplicar_redondeo"
    let empleado = json.empleados.findIndex(emp => emp.id_empleado == id_empleado);

    // SI SE ENCONTRÓ EL EMPLEADO, ACTUALIZAR SU PROPIEDAD "aplicar_redondeo" CON EL VALOR DEL CHECKBOX
    if (empleado !== -1) {
        json.empleados[empleado].aplicar_redondeo = aplicar_redondeo;

        // CALCULAR EL REDONDEO
        json.empleados[empleado].redondeo = aplicar_redondeo ? diferenciaRedondeo(json.empleados[empleado].neto_pagar) : 0;
        // CALCULAR EL NETO A PAGAR CON REDONDEO
        json.empleados[empleado].neto_pagar_redondeado = calcularNetoPagarRedondeado(json.empleados[empleado].neto_pagar, json.empleados[empleado].redondeo);
    }

    // GUARDAR LOS CAMBIOS EN EL JSON ACTUALIZADO
    setAguinaldo(json);
    // LLENAR LISTA DE EMPLEADOS EN EL MODAL DE REDONDEOS PARA REFLEJAR LOS CAMBIOS
    llenar_lista_empleados_redondeos();
    // LLENAR LA TABLA PRINCIPAL PARA REFLEJAR LOS CAMBIOS EN LOS REDONDEOS
    llenar_tabla_aguinaldo();
});

/**
 * ========================================================================================
 * Eventos para el modal de visibilidad de empleados
* =========================================================================================
 */

// Evento de búsqueda
$('#buscar_empleado_redondeos').on('keyup', function () {
    llenar_lista_empleados_redondeos();
});

// Evento de filtro departamento
$('#select_departamento_redondeos').on('change', function () {
    llenar_lista_empleados_redondeos();
});