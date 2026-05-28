
// Evento para abrir el modal de las fechas
$('#btn_fechas').click(function (e) {
    e.preventDefault();

    llenar_tabla_fechas();

    modal_seleccion_fechas.show();
});

/**
 * Función para llenar la tabla de selección de fechas con los empleados filtrados por los criterios de búsqueda y departamento.
 */
function llenar_tabla_fechas() {
    // RECUPERAR DATOS DE JSON
    let json = getUtilidad();

    // VERIFICAR SI HAY DATOS EN JSON
    if (!json || json.length === 0) {
        console.warn("No hay datos en json para mostrar en la tabla");
        $('#cuerpo_tabla_ptu').html(
            '<tr><td colspan="10" class="text-center text-muted">No hay empleados disponibles</td></tr>'
        );
        return;
    }

    // OBTENER LOS FILTROS SELECCIONADOS
    const textoBusqueda = $('#busqueda_empleado_fechas').val().toLowerCase();
    const departamentoSeleccionado = $('#id_departamento_fecha').val();

    // FILTRAR LOS EMPLEADOS SEGUN LOS FILTROS SELECCIONADOS
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

        return coincideBusqueda && coincideDepartamento;
    });


    // LIMPIAR EL CUERPO DE LA TABLA ANTES DE LLENARLA
    const tbody = $('#cuerpo_tabla_fechas');
    tbody.empty();

    // VALIDAR SI HAY EMPLEADOS PARA MOSTRAR EN LA PAGINA ACTUAL
    if (empleadosFiltrados.length === 0) {
        tbody.html(
            '<tr><td colspan="6" class="text-center text-muted">No se encontraron resultados</td></tr>'
        );
        $('#paginacion').empty();
        return;
    }

    empleadosFiltrados.forEach((emp, index) => {

        const contador = index + 1;
        const nombreCompleto = `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.trim();

        const fila = `
            <tr data-id="${emp.id_empleado}" style="cursor:pointer;">
                <td>${contador}</td>
                <td class="text-center">${emp.clave_empleado}</td>
                <td>${nombreCompleto}</td>
                <td class="text-center">${emp.fecha_ingreso_real ? formatearFecha(emp.fecha_ingreso_real) : '—'}</td>
                <td class="text-center">${emp.fecha_ingreso_imss ? formatearFecha(emp.fecha_ingreso_imss) : '—'}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <input
                            ${emp.usar_fecha_real ? 'checked' : ''}
                            type="radio"
                            data-id="${emp.id_empleado}"
                            class="btn-check checked_fecha_real"
                            name="radio_emp_${emp.id_empleado}"
                            id="r1_${emp.id_empleado}" checked>
                        <label
                            class="btn btn-outline-success"
                            for="r1_${emp.id_empleado}">Real</label>

                        <input
                            ${emp.usar_fecha_real ? '' : 'checked'}
                            ${emp.status_seguro == 0 ? 'disabled' : ''}
                            type="radio"
                            data-id="${emp.id_empleado}"
                            class="btn-check checked_fecha_imss"
                            name="radio_emp_${emp.id_empleado}"
                            id="r2_${emp.id_empleado}">
                        <label
                            class="btn btn-outline-primary"
                            for="r2_${emp.id_empleado}">IMSS</label>
                    </div>
                </td>
            </tr>
        `;
        tbody.append(fila);
    });

}


// Evento change en select de departamentos para actualizar la tabla de fechas
$('#id_departamento_fecha').change(function (e) {
    e.preventDefault();
    llenar_tabla_fechas();
});

// Evento input en el campo de búsqueda para actualizar la tabla de fechas
$('#busqueda_empleado_fechas').on('input', function (e) {
    e.preventDefault();
    llenar_tabla_fechas();
});


/**
 * EVENTOS PARA APLICAR A TODOS LOS EMPLEADOS DEL DEPARTAMENTO SELECCIONADO
 */

// PONER A TODOS LA FECHA REAL
$('#btn_todos_fecha_real').click(function (e) {
    e.preventDefault();

    console.log("Hola a todos la fecha real");


    // RECUPERAR JSON
    let json = getUtilidad();

    // Anio
    let anio = json.anio;

    // OBTENER EL DEPARTAMENTO SELECCIONADO
    const departamentoSeleccionado = $('#id_departamento_fecha').val();

    // Aplicar a todos los empleados del departamento seleccionado la fecha real
    json.empleados.forEach(empleado => {
        if (empleado.id_departamento == departamentoSeleccionado) {

            // VA A USAR LA FECHA REAL
            empleado.usar_fecha_real = true;

            // CALCULAR LOS DÍAS TRABAJADOS. Por defecto usar la fecha real
            if (empleado.usar_fecha_real) {
                empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_real, anio);
            } else {
                // Si es false usa la fecha del imss
                empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_imss, anio);
            }

            // CALCULAR LOS DIAS DE PTU PROPORCIONAL
            // dias_pago es la base para calcular
            empleado.dias_ptu = diasPTU(empleado.dias_trabajados, empleado.dias_pago);

            // CALCULAR LA PTU
            empleado.ptu = calcular_ptu(empleado.salario_diario, empleado.dias_ptu);

            // CALCULAR EL NETO A PAGAR
            empleado.neto_pagar = calcular_neto_pagar(empleado.ptu, empleado.tarjeta);

            // CALCULAR LA DIFERENCIA DE REDONDEO
            empleado.redondeo = diferenciaRedondeo(empleado.neto_pagar);

            // CALCULAR EL NETO A PAGAR REDONDEADO
            empleado.neto_pagar_redondeado = calcular_neto_pagar_redondeo(empleado.neto_pagar, empleado.redondeo);
        }
    });

    // GUARDAR LOS DATOS DE LOS EMPLEADOS EN EL LOCALSTORAGE
    setUtilidad(json);

    // Se llena la tabla con los datos obtenidos del storage
    llenar_tabla_ptu();

    // Se llena la tabla de fechas con los datos obtenidos del storage
    llenar_tabla_fechas();
});


// PONER A TODOS LA FECHA IMSS
$('#btn_todos_fecha_imss').click(function (e) {
    e.preventDefault();

    console.log("Hola a todos la fecha imss");

    // RECUPERAR JSON
    let json = getUtilidad();

    // Anio
    let anio = json.anio;

    // OBTENER EL DEPARTAMENTO SELECCIONADO
    const departamentoSeleccionado = $('#id_departamento_fecha').val();

    // Aplicar a todos los empleados del departamento seleccionado la fecha imss
    // Sólo aplica si el empleado tiene seguro
    json.empleados.forEach(empleado => {
        if (empleado.id_departamento == departamentoSeleccionado && empleado.status_seguro == 1) {
            // VA A USAR LA FECHA IMSS
            empleado.usar_fecha_real = false;


            // CALCULAR LOS DÍAS TRABAJADOS. Por defecto usar la fecha real
            if (empleado.usar_fecha_real) {
                empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_real, anio);
            } else {
                // Si es false usa la fecha del imss
                empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_imss, anio);
            }

            // CALCULAR LOS DIAS DE PTU PROPORCIONAL
            // dias_pago es la base para calcular
            empleado.dias_ptu = diasPTU(empleado.dias_trabajados, empleado.dias_pago);

            // CALCULAR LA PTU
            empleado.ptu = calcular_ptu(empleado.salario_diario, empleado.dias_ptu);

            // CALCULAR EL NETO A PAGAR
            empleado.neto_pagar = calcular_neto_pagar(empleado.ptu, empleado.tarjeta);

            // CALCULAR LA DIFERENCIA DE REDONDEO
            empleado.redondeo = diferenciaRedondeo(empleado.neto_pagar);

            // CALCULAR EL NETO A PAGAR REDONDEADO
            empleado.neto_pagar_redondeado = calcular_neto_pagar_redondeo(empleado.neto_pagar, empleado.redondeo);
        }
    });

    // Recalcular los valores de todos
    let empleados_tmp = json.empleados;

    // OBTENER LOS FILTROS SELECCIONADOS
    json.empleados = calcular_valores(empleados_tmp, anio);

    // GUARDAR LOS DATOS DE LOS EMPLEADOS EN EL LOCALSTORAGE
    setUtilidad(json);

    // Se llena la tabla con los datos obtenidos del storage
    llenar_tabla_ptu();

    // Se llena la tabla de fechas con los datos obtenidos del storage
    llenar_tabla_fechas();
});


/**
 * EVENTOS PARA APLICAR A UN SOLO EMPLEADO CUANDO SELECCIONA UNA DE LAS FECHAS
 */


// Evento para seleccionar la fecha real de un empleado
$(document).on('change', '.checked_fecha_real', function (e) {
    e.preventDefault();

    const idEmpleado = $(this).data('id');

    // RECUPERAR JSON
    let json = getUtilidad();

    // Recuperar el año para los cálculos
    let anio = json.anio;

    // Optener index del empleado en el JSON
    const indexEmpleado = json.empleados.findIndex(emp => emp.id_empleado == idEmpleado);

    if (indexEmpleado == -1) {
        console.error("No se encontró el empleado con id: " + idEmpleado);
        return;
    }

    // Cambiar a usar fecha real
    json.empleados[indexEmpleado].usar_fecha_real = true;

    // CALCULAR LOS DÍAS TRABAJADOS. Por defecto usar la fecha real
    if (json.empleados[indexEmpleado].usar_fecha_real) {
        json.empleados[indexEmpleado].dias_trabajados = diasTrabajados(json.empleados[indexEmpleado].fecha_ingreso_real, anio);
    } else {
        // Si es false usa la fecha del imss
        json.empleados[indexEmpleado].dias_trabajados = diasTrabajados(json.empleados[indexEmpleado].fecha_ingreso_imss, anio);
    }

    // CALCULAR LOS DIAS DE PTU PROPORCIONAL
    // dias_pago es la base para calcular
    json.empleados[indexEmpleado].dias_ptu = diasPTU(json.empleados[indexEmpleado].dias_trabajados, json.empleados[indexEmpleado].dias_pago);

    // CALCULAR LA PTU
    json.empleados[indexEmpleado].ptu = calcular_ptu(json.empleados[indexEmpleado].salario_diario, json.empleados[indexEmpleado].dias_ptu);

    // CALCULAR EL NETO A PAGAR
    json.empleados[indexEmpleado].neto_pagar = calcular_neto_pagar(json.empleados[indexEmpleado].ptu, json.empleados[indexEmpleado].tarjeta);

    // CALCULAR LA DIFERENCIA DE REDONDEO
    json.empleados[indexEmpleado].redondeo = diferenciaRedondeo(json.empleados[indexEmpleado].neto_pagar);

    // CALCULAR EL NETO A PAGAR REDONDEADO
    json.empleados[indexEmpleado].neto_pagar_redondeado = calcular_neto_pagar_redondeo(json.empleados[indexEmpleado].neto_pagar, json.empleados[indexEmpleado].redondeo);

    // GUARDAR LOS DATOS DE LOS EMPLEADOS EN EL LOCALSTORAGE
    setUtilidad(json);

    // Se llena la tabla con los datos obtenidos del storage
    llenar_tabla_ptu();

    // Se llena la tabla de fechas con los datos obtenidos del storage
    llenar_tabla_fechas();
});


// Evento para seleccionar la fecha imss de un empleado
$(document).on('change', '.checked_fecha_imss', function (e) {
    e.preventDefault();

    const idEmpleado = $(this).data('id');

    // RECUPERAR JSON
    let json = getUtilidad();

    // Recuperar el año para los cálculos
    let anio = json.anio;

    // Optener index del empleado en el JSON
    const indexEmpleado = json.empleados.findIndex(emp => emp.id_empleado == idEmpleado);

    if (indexEmpleado == -1) {
        console.error("No se encontró el empleado con id: " + idEmpleado);
        return;
    }

    // Cambiar a usar fecha real
    json.empleados[indexEmpleado].usar_fecha_real = false;

    // CALCULAR LOS DÍAS TRABAJADOS. Por defecto usar la fecha real
    if (json.empleados[indexEmpleado].usar_fecha_real) {
        json.empleados[indexEmpleado].dias_trabajados = diasTrabajados(json.empleados[indexEmpleado].fecha_ingreso_real, anio);
    } else {
        // Si es false usa la fecha del imss
        json.empleados[indexEmpleado].dias_trabajados = diasTrabajados(json.empleados[indexEmpleado].fecha_ingreso_imss, anio);
    }

    // CALCULAR LOS DIAS DE PTU PROPORCIONAL
    // dias_pago es la base para calcular
    json.empleados[indexEmpleado].dias_ptu = diasPTU(json.empleados[indexEmpleado].dias_trabajados, json.empleados[indexEmpleado].dias_pago);

    // CALCULAR LA PTU
    json.empleados[indexEmpleado].ptu = calcular_ptu(json.empleados[indexEmpleado].salario_diario, json.empleados[indexEmpleado].dias_ptu);

    // CALCULAR EL NETO A PAGAR
    json.empleados[indexEmpleado].neto_pagar = calcular_neto_pagar(json.empleados[indexEmpleado].ptu, json.empleados[indexEmpleado].tarjeta);

    // CALCULAR LA DIFERENCIA DE REDONDEO
    json.empleados[indexEmpleado].redondeo = diferenciaRedondeo(json.empleados[indexEmpleado].neto_pagar);

    // CALCULAR EL NETO A PAGAR REDONDEADO
    json.empleados[indexEmpleado].neto_pagar_redondeado = calcular_neto_pagar_redondeo(json.empleados[indexEmpleado].neto_pagar, json.empleados[indexEmpleado].redondeo);

    // GUARDAR LOS DATOS DE LOS EMPLEADOS EN EL LOCALSTORAGE
    setUtilidad(json);

    // Se llena la tabla con los datos obtenidos del storage
    llenar_tabla_ptu();

    // Se llena la tabla de fechas con los datos obtenidos del storage
    llenar_tabla_fechas();
});