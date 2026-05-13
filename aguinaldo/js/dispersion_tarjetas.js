
// EVENTO PARA ABRIR EL MODAL DE DISPERSION DE TARJETAS
$(document).on('click', '#btn_tarjetas', function (e) {

    // LLENAR LA TABLA DE DISPERSIÓN DE TARJETAS
    llenar_lista_dispersion_tarjetas();

    // Abrir el modal de dispersión de tarjetas
    modal_dispersion_tarjeta.show();
});


/**
 * FUNCIÓN PARA LLENAR LA TABLA DE DISPERSIÓN DE TARJETAS
 */
function llenar_lista_dispersion_tarjetas() {

    // RECUPERAR EL JSON ACTUAL
    let json = getAguinaldo();

    // VALIDAR SI EL JSON EXISTE Y TIENE DATOS
    if (!json || json.length === 0) {
        console.warn("No hay datos en jsonAguinaldo para mostrar en la tabla");
        $('#cuerpo_tabla_tarjetas').html(
            '<tr><td colspan="5" class="text-center text-muted">No hay empleados disponibles</td></tr>'
        );
        return;
    }

    // OBTENER LOS VALORES DE LOS FILTROS
    const textoBusqueda = $('#busqueda_tarjeta').val().toLowerCase();
    const departamentoSeleccionado = $('#select_departamento_tarjeta').val();

    // Filtrar empleados
    let empleadosFiltrados = json.empleados.filter(emp => {
        // Filtro de búsqueda (clave, nombre y apellidos)
        const coincideBusqueda = !textoBusqueda ||
            (emp.clave_empleado && emp.clave_empleado.toLowerCase().includes(textoBusqueda)) ||
            (emp.nombre && emp.nombre.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_paterno && emp.ap_paterno.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_materno && emp.ap_materno.toLowerCase().includes(textoBusqueda));

        // Filtro de departamento por id
        // Si es -1 significa que debe mostrar todos los departamentos
        // Si no, mostrar solo los empleado de ese departamento
        const coincideDepartamento = departamentoSeleccionado === "-1" ||
            (parseInt(emp.id_departamento) === parseInt(departamentoSeleccionado));

        // TIENE SEGURO: Solo los empleado con seguro tiene tarjeta
        const tieneSeguro = emp.status_nss === 1;

        return coincideBusqueda && coincideDepartamento && tieneSeguro;
    });

    // OBTENER CUERPO DE LA TABLA Y LIMPIARLO
    const tbody = $('#cuerpo_tabla_tarjetas');
    tbody.empty();

    // VALIDAR SI HAY EMPLEADOS FILTRADOS
    if (empleadosFiltrados.length === 0) {
        tbody.html('<tr><td colspan="5" class="text-center text-muted">No se encontraron empleados que tengan seguro vigente</td></tr>');
        return;
    }

    // LLENAR LA TABLA CON LOS EMPLEADOS FILTRADOS
    empleadosFiltrados.forEach((empleado, index) => {

        const nombre_completo = `${empleado.nombre || ''} ${empleado.ap_paterno || ''} ${empleado.ap_materno || ''}`.trim();
        const contador = index + 1; // Para mostrar un número de fila comenzando en 1

        const tarjeta_formato_moneda = estructuraDinero(empleado.tarjeta || 0);

        const fila = `
            <tr>
                <td class="text-center">${contador}</td>
                <td class="text-center">${empleado.clave_empleado}</td>
                <td>${nombre_completo}</td>
                <td class="text-center">${tarjeta_formato_moneda}</td>
                <td class="text-center">
                    <button
                        class="btn btn-sm btn-outline-primary btn_editar_tarjeta"
                        data-id="${empleado.id_empleado}"
                        data-nombre="${nombre_completo}"
                        data-tarjeta="${empleado.tarjeta}"
                        data-departamento="${empleado.id_departamento}"><i class="bi bi-pencil-fill"></i></button>
                </td>
            </tr>
        `;
        tbody.append(fila);
    });

    // AGREGAR LA FILA DE TOTALES AL FINAL DE LA TABLA
    const total_tarjetas = empleadosFiltrados.reduce((total, emp) => total + (emp.tarjeta || 0), 0);
    const fila_total = `
        <tr class="table-light">
            <td colspan="3" class="text-end fw-bold">Total:</td>
            <td class="text-center fw-bold">${estructuraDinero(total_tarjetas)}</td>
            <td></td>
        </tr>
    `;
    tbody.append(fila_total);
}


/**
 * ===============================================================================
 * EVENTOS PARA LOS FILTROS DE LA TABLA DE DISPERSIÓN DE TARJETAS
 * ===============================================================================
 */


// Evento para el filtro de búsqueda
$(document).on('input', '#busqueda_tarjeta', function () {
    llenar_lista_dispersion_tarjetas();
});

// Evento para el filtro de departamento|
$(document).on('change', '#select_departamento_tarjeta', function () {
    llenar_lista_dispersion_tarjetas();
});


/**
 * ===============================================================================
 * EDITAR TARJETA DE UN EMPLEADO
 * ==============================================================================
 */

// Evento para abrir el modal de edición de tarjeta
$(document).on('click', '.btn_editar_tarjeta', function (e) {
    e.preventDefault();

    // Obtener datos del empleado desde los atributos data-* del botón
    const id_empleado = $(this).data('id');
    const nombre_empleado = $(this).data('nombre');
    const tarjeta_actual = $(this).data('tarjeta');

    // CERRAR EL MODAL DE DISPERSIÓN DE TARJETAS
    modal_dispersion_tarjeta.hide();

    // LLENAR LOS CAMPOS DEL MODAL
    llenar_modal_tarjeta(id_empleado, nombre_empleado, tarjeta_actual);

    // ABRIR EL MODAL DE EDICIÓN DE TARJETA
    modal_tarjeta.show();
});

/**
 * Función para llenar los campos del modal de edición de tarjeta
 * @param {Number} id_empleado Id del empleado
 * @param {String} nombre_empleado Nombre completo del empleado
 * @param {Number} tarjeta_actual Valor actual de la tarjeta del empleado
 */
function llenar_modal_tarjeta(id_empleado, nombre_empleado, tarjeta_actual) {
    // Rellenar los campos del modal con los datos del empleado
    $('#id_empleado_tarjeta').val(id_empleado);
    $('#nombre_empleado_tarjeta').val(nombre_empleado);
    $('#dispersion_tarjeta').val(tarjeta_actual || '');
}

/**
 * Función para limpiar los campos del modal de edición de tarjeta
 */
function limpiar_modal_tarjeta() {
    $('#id_empleado_tarjeta').val('');
    $('#nombre_empleado').val('');
    $('#dispersion_tarjeta').val('');
}


// Evento para cerrar el modal de edición de tarjeta y volver al modal de dispersión de tarjetas
$(document).on('click', '#btn_cerrar_modal_tarjeta', function (e) {
    e.preventDefault();
    // CERRAR EL MODAL DE EDICIÓN DE TARJETA
    modal_tarjeta.hide();
    // SE LIMPIAN LOS CAMPOS DEL MODAL DE EDICIÓN DE TARJETA
    limpiar_modal_tarjeta();
    // VOLVER A ABRIR EL MODAL DE DISPERSIÓN DE TARJETAS
    modal_dispersion_tarjeta.show();
});


// EVENTO PARA GUARDAR LOS CAMBIOS DE LA TARJETA EN EL MODAL DE EDICIÓN DE TARJETA
$(document).on('click', '#btn_guardar_tarjeta', function (e) {
    e.preventDefault(); 

    // OBTENER LOS VALORES DE LOS CAMPOS DEL MODAL
    const id_empleado = $('#id_empleado_tarjeta').val();
    const nueva_tarjeta = parseFloat($('#dispersion_tarjeta').val()) || 0;

    // RECUPERAR EL JSON ACTUAL
    let json = getAguinaldo();

    // VALIDAR SI EL JSON EXISTE Y TIENE DATOS
    if (!json || json.length === 0) {
        console.error("No hay datos en jsonAguinaldo para actualizar la tarjeta");
        alerta('error', 'Error al actualizar', 'No se pudo actualizar la tarjeta porque no hay datos disponibles.');
        return;
    }

    // RECUPERAR EL INDEX DEL EMPLEADO EN EL JSON
    const indexEmpleado = json.empleados.findIndex(emp => emp.id_empleado == id_empleado);

    if (indexEmpleado === -1) {
        console.error(`Empleado con id ${id_empleado} no encontrado en jsonAguinaldo`);
        alerta('error', 'Error al actualizar', 'No se pudo encontrar el empleado para actualizar la tarjeta.');
        return;
    }

    // ACTUALIZAR EL VALOR DE LA TARJETA DEL EMPLEADO
    json.empleados[indexEmpleado].tarjeta = nueva_tarjeta;

    // CALCULAR NETO A PAGAR DEL EMPLEADO: aguinaldo - isr - tarjeta
    json.empleados[indexEmpleado].neto_pagar = calcularNetoPagar(json.empleados[indexEmpleado].aguinaldo, json.empleados[indexEmpleado].isr, json.empleados[indexEmpleado].tarjeta);

    // CALCULAR EL REDONDEO DEL NETO A PAGAR
    json.empleados[indexEmpleado].redondeo = json.empleados[indexEmpleado].aplicar_redondeo ? diferenciaRedondeo(json.empleados[indexEmpleado].neto_pagar) : 0;

    // CALCULAR EL NETO A PAGAR CON REDONDEO
    json.empleados[indexEmpleado].neto_pagar_redondeado = calcularNetoPagarRedondeado(json.empleados[indexEmpleado].neto_pagar, json.empleados[indexEmpleado].redondeo);

    // GUARDAR LOS CAMBIOS EN EL LOCAL STORAGE
    setAguinaldo(json);

    // CERRAR EL MODAL DE EDICIÓN DE TARJETA
    modal_tarjeta.hide();
    // SE LIMPIAN LOS CAMPOS DEL MODAL DE EDICIÓN DE TARJETA
    limpiar_modal_tarjeta();
    // VOLVER A ABRIR EL MODAL DE DISPERSIÓN DE TARJETAS
    modal_dispersion_tarjeta.show();

    // REFRESCAR LA LISTA DE DISPERSIÓN DE TARJETAS
    llenar_lista_dispersion_tarjetas();

    // REFRESCAR LOS DATOS EN LA TABLA PRINCIPAL
    llenar_tabla_aguinaldo();
});