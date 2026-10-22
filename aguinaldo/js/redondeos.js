
/**
 * Evento para abrir el modal de redondeos
 */
$('#btn_redondeos').click(function (e) {
    e.preventDefault();

    // Cargar departamentos si no están cargados
    let departamentoSeleccionado = $('#select_departamento_redondeos').val();
    if (!departamentoSeleccionado || departamentoSeleccionado === "-1") {
        // Si no hay departamento seleccionado, usar el del jsonAguinaldo
        if (window.jsonAguinaldo && window.jsonAguinaldo.id_departamento) {
            $('#select_departamento_redondeos').val(window.jsonAguinaldo.id_departamento);
        }
    }

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
    let areaSeleccionada = $('#select_area_redondeos').val();
    let empresaSeleccionada = $('#select_empresa_redondeos').val();
    // Obtener el texto de búsqueda y convertirlo a minúsculas para comparación
    let textoBusqueda = $('#buscar_empleado_redondeos').val().toLowerCase();

    // VALIDAR QUE EL jsonAguinaldo si exista
    if (!json || !json.empleados || json.empleados.length === 0) {
        console.warn("No hay datos en jsonAguinaldo para mostrar");
        $('#contenedor_empleados_redondeos').html('<span class="p-3 text-center text-secondary">Registros no encontrados.</span>');
        return;
    }

    // Filtrar empleados: De acuerdo al departamento seleccionado
    let empleadosFiltrados = json.empleados.filter(emp => {
        // Filtro de búsqueda por texto
        const coincideBusqueda = !textoBusqueda ||
            (emp.clave_empleado && emp.clave_empleado.toLowerCase().includes(textoBusqueda)) ||
            (emp.nombre && emp.nombre.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_paterno && emp.ap_paterno.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_materno && emp.ap_materno.toLowerCase().includes(textoBusqueda));
        // Filtro de empresa
        const coincideEmpresa = !empresaSeleccionada || empresaSeleccionada === "-1" ||
            parseInt(emp.id_empresa) === parseInt(empresaSeleccionada);
        // Filtro de área
        const coincideArea = !areaSeleccionada || areaSeleccionada === "-1" ||
            parseInt(emp.id_area) === parseInt(areaSeleccionada);
        // Filtro de departamento por id
        const coincideDepartamento = !departamentoSeleccionado || departamentoSeleccionado === "-1" ||
            parseInt(emp.id_departamento) === parseInt(departamentoSeleccionado);

        return coincideBusqueda && coincideEmpresa && coincideArea && coincideDepartamento;
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

    // RECUPERAR LOS FILTROS SELECCIONADOS
    let departamentoSeleccionado = $('#select_departamento_redondeos').val();
    let areaSeleccionada = $('#select_area_redondeos').val();
    let empresaSeleccionada = $('#select_empresa_redondeos').val();

    // RECUPERAR EL JSON ACTUAL
    let json = getAguinaldo();

    // APLICAR REDONDEOS A TODOS LOS EMPLEADOS SEGÚN LOS FILTROS
    json.empleados.forEach(empleado => {
        // VERIFICAR SI COINCIDE CON LOS FILTROS
        const coincideEmpresa = !empresaSeleccionada || empresaSeleccionada === "-1" ||
            parseInt(empleado.id_empresa) === parseInt(empresaSeleccionada);
        const coincideArea = !areaSeleccionada || areaSeleccionada === "-1" ||
            parseInt(empleado.id_area) === parseInt(areaSeleccionada);
        const coincideDepartamento = !departamentoSeleccionado || departamentoSeleccionado === "-1" ||
            parseInt(empleado.id_departamento) === parseInt(departamentoSeleccionado);

        if (coincideEmpresa && coincideArea && coincideDepartamento) {
            empleado.aplicar_redondeo = true;

            // CALCULAR EL REDONDEO
            empleado.redondeo = empleado.aplicar_redondeo ? diferenciaRedondeo(empleado.neto_pagar) : 0;
            // CALCULAR EL NETO A PAGAR CON REDONDEO
            empleado.neto_pagar_redondeado = calcularNetoPagarRedondeo(empleado.neto_pagar, empleado.redondeo);
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

    // OBTENER LOS FILTROS SELECCIONADOS
    let departamentoSeleccionado = $('#select_departamento_redondeos').val();
    let areaSeleccionada = $('#select_area_redondeos').val();
    let empresaSeleccionada = $('#select_empresa_redondeos').val();

    // RECUPERAR EL JSON ACTUAL
    let json = getAguinaldo();

    // QUITAR REDONDEOS A TODOS LOS EMPLEADOS SEGÚN LOS FILTROS
    json.empleados.forEach(empleado => {
        // VERIFICAR SI COINCIDE CON LOS FILTROS
        const coincideEmpresa = !empresaSeleccionada || empresaSeleccionada === "-1" ||
            parseInt(empleado.id_empresa) === parseInt(empresaSeleccionada);
        const coincideArea = !areaSeleccionada || areaSeleccionada === "-1" ||
            parseInt(empleado.id_area) === parseInt(areaSeleccionada);
        const coincideDepartamento = !departamentoSeleccionado || departamentoSeleccionado === "-1" ||
            parseInt(empleado.id_departamento) === parseInt(departamentoSeleccionado);

        if (coincideEmpresa && coincideArea && coincideDepartamento) {
            empleado.aplicar_redondeo = false;

            // CALCULAR EL REDONDEO
            empleado.redondeo = empleado.aplicar_redondeo ? diferenciaRedondeo(empleado.neto_pagar) : 0;
            // CALCULAR EL NETO A PAGAR CON REDONDEO
            empleado.neto_pagar_redondeado = calcularNetoPagarRedondeo(empleado.neto_pagar, empleado.redondeo);
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
        json.empleados[empleado].neto_pagar_redondeado = calcularNetoPagarRedondeo(json.empleados[empleado].neto_pagar, json.empleados[empleado].redondeo);
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
 * Eventos para el modal de redondeos
* =========================================================================================
 */

// Evento de búsqueda
$('#buscar_empleado_redondeos').on('keyup', function () {
    llenar_lista_empleados_redondeos();
});

// Evento de filtro empresa
$('#select_empresa_redondeos').on('change', function () {
    llenar_lista_empleados_redondeos();
});

// Evento de filtro área - carga departamentos y desbloquea el select
$('#select_area_redondeos').on('change', function () {
    let areaSeleccionada = $(this).val();
    const selectDepartamento = $('#select_departamento_redondeos');

    if (areaSeleccionada && areaSeleccionada !== "-1") {
        // Obtener departamentos por área
        obtener_departamentos_por_area_redondeos(areaSeleccionada);
        // Desbloquear select de departamentos
        selectDepartamento.prop('disabled', false);
        // Resetear a "Todos"
        selectDepartamento.val('-1');
    } else {
        // Bloquear select de departamentos y limpiar
        selectDepartamento.prop('disabled', true);
        selectDepartamento.find('option:not(:first)').remove();
        selectDepartamento.val('-1');
    }
    llenar_lista_empleados_redondeos();
});

// Evento de filtro departamento
$('#select_departamento_redondeos').on('change', function () {
    llenar_lista_empleados_redondeos();
});

/**
 * Función para obtener departamentos filtrados por área en el modal redondeos
 */
function obtener_departamentos_por_area_redondeos(id_area) {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerDepartamentos.php",
        type: "GET",
        data: { id_area: id_area },
        dataType: "json",
        success: function (data) {
            // Renderizar departamentos filtrados
            const select = $("#select_departamento_redondeos");
            select.find("option:not(:first)").remove();

            data.forEach(function (depto) {
                select.append(
                    `<option value="${depto.id_departamento}">${depto.nombre_departamento}</option>`
                );
            });
        },
        error: function () {
            console.error("Error al cargar departamentos por área");
        }
    });
}
