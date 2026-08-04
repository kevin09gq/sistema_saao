
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
            '<tr><td colspan="10" class="text-center text-muted"></td></tr>'
        );
        return;
    }

    // OBTENER LOS FILTROS SELECCIONADOS
    const textoBusqueda = $('#busqueda_empleado_fechas').val().toLowerCase();
    // const departamentoSeleccionado = $('#id_departamento_fecha').val();
    const empresaSeleccionada = $('#id_empresa_fecha').val();

    // FILTRAR LOS EMPLEADOS SEGÚN LOS FILTROS SELECCIONADOS
    let empleadosFiltrados = json.empleados.filter(emp => {
        // Filtro de búsqueda (clave, nombre y apellidos)
        const coincideBusqueda = !textoBusqueda ||
            (emp.clave_empleado && emp.clave_empleado.toLowerCase().includes(textoBusqueda)) ||
            (emp.nombre && emp.nombre.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_paterno && emp.ap_paterno.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_materno && emp.ap_materno.toLowerCase().includes(textoBusqueda));

        // Filtro de departamento por id
        // const coincideDepartamento = departamentoSeleccionado === "-1" ||
        //     (parseInt(emp.id_departamento) === parseInt(departamentoSeleccionado));

        // Filtro de empresa por id
        const coincideEmpresa = empresaSeleccionada === "-1" ||
            (parseInt(emp.id_empresa) === parseInt(empresaSeleccionada));

        // return coincideBusqueda && coincideDepartamento && coincideEmpresa;
        return coincideBusqueda && coincideEmpresa;
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
                <td class="text-center ${emp.status_seguro == 0 ? 'text-muted' : ''}">${emp.clave_empleado}</td>
                <td class="${emp.status_seguro == 0 ? 'text-muted' : ''}">${nombreCompleto}</td>
                <td class="text-center ${emp.status_seguro == 0 ? 'text-muted' : ''}">${emp.fecha_ingreso_real ? formatearFecha(emp.fecha_ingreso_real) : '—'}</td>
                <td class="text-center ${emp.status_seguro == 0 ? 'text-muted' : ''}">${emp.fecha_ingreso_imss ? formatearFecha(emp.fecha_ingreso_imss) : '—'}</td>
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

    console.log("SE LLENO LA TABLA DEL MODAL DE FECHAS....");
}


// Evento change en select de departamentos para actualizar la tabla de fechas
$('#id_departamento_fecha').change(function (e) {
    e.preventDefault();
    llenar_tabla_fechas();
});

// Evento change en select de empresa para actualizar la tabla de fechas
$('#id_empresa_fecha').change(function (e) {
    e.preventDefault();
    llenar_tabla_fechas();
});

// Evento input en el campo de búsqueda para actualizar la tabla de fechas
$('#busqueda_empleado_fechas').on('input', function (e) {
    e.preventDefault();
    llenar_tabla_fechas();
});


/**
 * =========================================================================================
 * EVENTOS PARA APLICAR A TODOS LOS EMPLEADOS DEL DEPARTAMENTO SELECCIONADO
 * =========================================================================================
 */

// PONER A TODOS LA FECHA REAL
$('#btn_todos_fecha_real').click(function (e) {
    e.preventDefault();

    // RECUPERAR JSON
    let json = getUtilidad();

    // Anio
    let anio = json.anio;

    // OBTENER EL DEPARTAMENTO SELECCIONADO
    // const departamentoSeleccionado = parseInt($('#id_departamento_fecha').val(), 10);

    // OBTENER LA EMPRESA SELECCIONADA
    const empresaSeleccionada = parseInt($('#id_empresa_fecha').val(), 10);

    // Aplicar a todos los empleados según filtros
    json.empleados.forEach(empleado => {
        // Validar que el empleado cumpla con los filtros de departamento y empresa
        // const coincideDepto = (departamentoSeleccionado === -1 || empleado.id_departamento == departamentoSeleccionado);
        // Si el filtro de empresa es -1, se aplica a todos, si no, solo a los que coincidan con la empresa seleccionada
        const coincideEmpresa = (empresaSeleccionada === -1 || empleado.id_empresa == empresaSeleccionada);

        if (coincideEmpresa) {
            // VA A USAR LA FECHA REAL
            empleado.usar_fecha_real = true;

            // CALCULAR LOS DÍAS TRABAJADOS
            if (empleado.usar_fecha_real) {
                empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_real, anio);
            } else {
                empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_imss, anio);
            }

            // CALCULAR LOS DIAS DE PTU PROPORCIONAL
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
    //const departamentoSeleccionado = parseInt($('#id_departamento_fecha').val(), 10);

    // OBTENER LA EMPRESA SELECCIONADA
    const empresaSeleccionada = parseInt($('#id_empresa_fecha').val(), 10);

    // Aplicar a todos los empleados según filtros
    json.empleados.forEach(empleado => {
        // const coincideDepto = (departamentoSeleccionado === -1 || empleado.id_departamento == departamentoSeleccionado);
        const coincideEmpresa = (empresaSeleccionada === -1 || empleado.id_empresa == empresaSeleccionada);

        // Solo aplica si el empleado tiene seguro social
        if (coincideEmpresa && empleado.status_seguro == 1 && empleado.fecha_ingreso_imss) {
            // VA A USAR LA FECHA IMSS
            empleado.usar_fecha_real = false;

            // CALCULAR LOS DÍAS TRABAJADOS
            if (empleado.usar_fecha_real) {
                empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_real, anio);
            } else {
                empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_imss, anio);
            }

            // CALCULAR LOS DIAS DE PTU PROPORCIONAL
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
 * =========================================================================================
 * EVENTOS PARA APLICAR A UN SOLO EMPLEADO CUANDO SELECCIONA UNA DE LAS FECHAS
 * =========================================================================================
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

    // SI NO TIENE FECHA IMSS, NO SE PUEDE CAMBIAR A ESA OPCIÓN
    if (!json.empleados[indexEmpleado].fecha_ingreso_imss) {
        Swal.fire({
            icon: "error",
            title: "Sin fecha",
            text: "El empleado no tiene fecha de ingreso IMSS asignada."
        });
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



/**
 * =========================================================================================
 * EVENTOS PARA TRAER LAS FECHAS DESDE LA BASE DE DATOS
 * =========================================================================================
 */

// EVENTO PARA OBTENER LAS FECHAS DE LA BASE DE DATOS
$(document).on('click', '#btn_actualizar_fechas', function (e) {
    e.preventDefault();

    Swal.fire({
        title: 'Obtener Fechas de la Base de datos',
        text: 'Advertencia: esta acción hará que las fechas de ingreso previamente cargadas en el PTU sean actualizadas por las fechas existentes en la base de datos. Esta acción podría modificar el cálculo del PTU. ¿Seguro que deseas confirmar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#198754', // Verde (éxito)
        cancelButtonColor: '#6c757d',   // Gris (cancelar)
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {

            // Si el usuario confirma, ejecutamos la función
            obtener_fechas_ingreso();

            // ALERTA DE ÉXITO
            alerta("success", "Fechas actualizadas", "Las fechas de ingreso han sido actualizadas con éxito desde la base de datos.");
        }
    });
});


/**
 * Función para obtener las fechas de ingreso de cada empleado desde la base de datos
 * - Reutiliza el obtener_empleados de php/utilidades.php
 * - Pero solo hará uso de las fechas ingreso real e imss
 */
function obtener_fechas_ingreso() {

    let json = getUtilidad();

    if (!json || json.length === 0) {
        console.warn("No hay empleados en el JSON para actualizar las fechas de ingreso.");
        return;
    }

    const anio = json.anio;
    const departamentoSeleccionado = $('#id_departamento_fecha').val();
    const empresaSeleccionada = $('#id_empresa_fecha').val();

    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/reparto_utilidades/php/utilidades.php",
        data: {
            accion: "obtener_empleados",
            anio: anio
        },
        dataType: "json",
        success: function (response) {

            // FILTRAR SOLO LOS EMPLEADOS SEGÚN DEPARTAMENTO Y EMPRESA
            let empleados_fechas = response.data
                .filter(emp => {
                    // SE FILTRA PRIMERO POR DEPARTAMENTO Y EMPRESA
                    // SI ES -1 EN CUALQUIERA DE LOS DOS, SE INCLUYEN TODOS LOS EMPLEADOS SIN IMPORTAR ESE CRITERIO
                    // const coincideDepartamento = departamentoSeleccionado === "-1" ||
                    //     parseInt(emp.id_departamento) === parseInt(departamentoSeleccionado);

                    const coincideEmpresa = empresaSeleccionada === "-1" ||
                        parseInt(emp.id_empresa) === parseInt(empresaSeleccionada);

                    // return coincideDepartamento && coincideEmpresa;
                    return coincideEmpresa;
                })
                .map(emp => ({
                    // SOLO SE OBTIENEN LOS CAMPOS NECESARIOS PARA ACTUALIZAR LAS FECHAS DE INGRESO EN EL JSON DEL STORAGE
                    id_empleado: emp.id_empleado,
                    fecha_ingreso_real: emp.fecha_ingreso_real,
                    fecha_ingreso_imss: emp.fecha_ingreso_imss,
                    id_empresa: emp.id_empresa,
                    id_departamento: emp.id_departamento
                }));

            // UNIR LAS FECHAS DE INGRESO CON EL JSON DE EMPLEADOS DEL STORAGE
            let empleados_con_fechas = unir_fechas(empleados_fechas, json);

            // console.log("EMPLEADOS CON FECHAS ACTUALIZADAS: ", empleados_con_fechas);

            // LIMPIAR json.empleado Y ASIGNARLE SOLO LOS EMPLEADOS CON LAS FECHAS ACTUALIZADAS
            json.empleados = empleados_con_fechas;

            // ACTUALIZAR EL JSON EN EL STORAGE CON LAS NUEVAS FECHAS DE INGRESO
            setUtilidad(json);

            // LLENAR TABLA DE FECHAS
            llenar_tabla_fechas();

            // LLENAR TABLA DE PTU
            llenar_tabla_ptu();

            console.log("SE ACTUALIZADO EL JSON EN EL STORAGE CON LAS NUEVAS FECHAS DE INGRESO: ", getUtilidad());

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener los empleados:", errorThrown);
            console.error("Response:", jqXHR.responseText);
            alerta("error", "Ocurrió un error", "No se pudieron cargar los empleados. Contacta a sistemas.");
        }
    });
}


/**
 * Función para unir las fechas de ingreso de cada empleado con el json del storage
 * @param {JSON} empleados_fechas Arreglo de fecha obtenido desde la base de datos
 * @param {JSON} json JSON recuperado del storage
 * @returns Empleados con sus fechas actualizadas
 */
function unir_fechas(empleados_fechas, json) {

    // VALIDAR QUE EL JSON EXISTE Y ES UN ARRAY NO VACÍO
    if (!json || json.length === 0 || !json.empleados || json.empleados.length === 0) {
        console.warn("No hay empleados en el JSON para actualizar las fechas de ingreso.");
        return json; // Retorna el JSON original sin modificaciones
    }

    // VALIDAR QUE EL ARREGLO DE FECHAS DE EMPLEADOS NO ESTÁ VACÍO
    if (!empleados_fechas || empleados_fechas.length === 0) {
        console.warn("No se obtuvieron fechas de ingreso de los empleados para actualizar.");
        return json; // Retorna el JSON original sin modificaciones
    }

    // RECUPERAR LOS EMPLEADOS DEL JSON
    let json_empleados = json.empleados;
    // RECUPERAR EL AÑO DEL JSON
    let anio = json.anio;

    // UNIR LAS FECHAS DE INGRESO CON EL JSON DE EMPLEADOS DEL STORAGE
    json_empleados.forEach(emp => {
        // Buscar el empleado en empleados_fechas por id_empleado
        let empFechas = empleados_fechas.find(emp_fecha => emp_fecha.id_empleado === emp.id_empleado);

        // Si existe, actualizar las fechas
        if (empFechas) {

            // SI LAS FECHAS COINCIDEN SE ACTUALIZAN, ESTO PORQUE POSIBLEMENTE LA ING YA HIZO MODIFICACIONES EN EL JSON DEL STORAGE
            emp.fecha_ingreso_real = empFechas.fecha_ingreso_real;
            emp.fecha_ingreso_imss = empFechas.fecha_ingreso_imss;

            // LAS COPIAS SE ACTUALIZAN SIEMPRE SIN IMPORTAR SI EL USUARIO HIZO MODIFICACIONES EN EL JSON DEL STORAGE
            emp.fecha_ingreso_real_copia = empFechas.fecha_ingreso_real;
            emp.fecha_ingreso_imss_copia = empFechas.fecha_ingreso_imss;
        }

        // REPROCESAR LOS VALORES
        emp = calcular_valor_empleado(emp, anio);
    });

    // RETORNAR SOLO LOS EMPLEADOS YA CON LAS FECHAS NUEVAS
    return json_empleados;
}