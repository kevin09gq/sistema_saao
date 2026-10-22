
/**
 * EVENTO PARA ABRIR EL MODAL DE EMPLEADOS QUE NO TENGAN DERECHO AGUINALDO
 */
$('#btn_sin_derecho').click(function (e) {
    e.preventDefault();

    // Cargar departamentos si no están cargados
    let departamentoSeleccionado = $('#select_departamento_sin_derecho').val();
    if (!departamentoSeleccionado || departamentoSeleccionado === "-1") {
        // Si no hay departamento seleccionado, usar el del jsonAguinaldo
        if (window.jsonAguinaldo && window.jsonAguinaldo.id_departamento) {
            $('#select_departamento_sin_derecho').val(window.jsonAguinaldo.id_departamento);
        }
    }

    // Llenar los empleados que no tengan aguinaldo
    llenar_lista_empleados_sin_derecho_aguinaldo();

    // Abrir el modal
    modal_empleados_sin_derecho.show();
});

/**
 * Función para llenar la lista de empleados que no tienen derecho a aguinaldo en el modal correspondiente
 * Se aplican los filtros de departamento, empresa, área y búsqueda por texto
 */
function llenar_lista_empleados_sin_derecho_aguinaldo() {

    // RECUPERAR EL JSON DE AGUINALDO
    let json = getAguinaldo();
    // RECUPERAR EL DEPARTAMENTO SELECCIONADO EN EL FILTRO
    let departamentoSeleccionado = $('#select_departamento_sin_derecho').val();
    // RECUPERAR EL ÁREA SELECCIONADA EN EL FILTRO
    let areaSeleccionada = $('#select_area_sin_derecho').val();
    // RECUPERAR LA EMPRESA SELECCIONADA EN EL FILTRO
    let empresaSeleccionada = $('#select_empresa_sin_derecho').val();
    // RECUPERAR EL TEXTO DE BÚSQUEDA
    let textoBusqueda = $('#buscar_empleado_sin_derecho').val().toLowerCase().trim();


    // VALIDAR QUE EL jsonAguinaldo si exista
    if (!json || !json.empleados || json.empleados.length === 0) {
        console.warn("No hay datos en jsonAguinaldo para mostrar");
        $('#contenedor_lista_empleados_sin_derecho').html('<span class="p-3 text-center text-secondary">Registros no encontrados.</span>');
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
        // Filtro de empresa
        const coincideEmpresa = !empresaSeleccionada || empresaSeleccionada === "-1" ||
            parseInt(emp.id_empresa) === parseInt(empresaSeleccionada);
        // Filtro de área
        const coincideArea = !areaSeleccionada || areaSeleccionada === "-1" ||
            parseInt(emp.id_area) === parseInt(areaSeleccionada);
        // Filtro de departamento
        const coincideDepartamento = !departamentoSeleccionado || departamentoSeleccionado === "-1" ||
            parseInt(emp.id_departamento) === parseInt(departamentoSeleccionado);

        return cumpleDerecho && coincideBusqueda && coincideEmpresa && coincideArea && coincideDepartamento;
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
 * Eventos para el modal de empleados sin derecho a aguinaldo
* =========================================================================================
 */

// Evento de búsqueda
$('#buscar_empleado_sin_derecho').on('keyup', function () {
    llenar_lista_empleados_sin_derecho_aguinaldo();
});

// Evento de filtro empresa
$('#select_empresa_sin_derecho').on('change', function () {
    llenar_lista_empleados_sin_derecho_aguinaldo();
});

// Evento de filtro área - carga departamentos y desbloquea el select
$('#select_area_sin_derecho').on('change', function () {
    let areaSeleccionada = $(this).val();
    const selectDepartamento = $('#select_departamento_sin_derecho');

    if (areaSeleccionada && areaSeleccionada !== "-1") {
        // Obtener departamentos por área
        obtener_departamentos_por_area_sin_derecho(areaSeleccionada);
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
    llenar_lista_empleados_sin_derecho_aguinaldo();
});

// Evento de filtro departamento
$('#select_departamento_sin_derecho').on('change', function () {
    llenar_lista_empleados_sin_derecho_aguinaldo();
});

/**
 * Función para obtener departamentos filtrados por área en el modal sin derecho
 */
function obtener_departamentos_por_area_sin_derecho(id_area) {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerDepartamentos.php",
        type: "GET",
        data: { id_area: id_area },
        dataType: "json",
        success: function (data) {
            // Renderizar departamentos filtrados
            const select = $("#select_departamento_sin_derecho");
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