
$(document).ready(function () {
    // Inicializar el procesar_raya
    procesar_rayas();
});

/**
 * Evento para abrir el modal de las configuraciones
 */
$('#btn_configuracion').click(function (e) {
    e.preventDefault();
    // Obtener la configuración actual del aguinaldo
    let configuracion = window.jsonAguinaldo.configuraciones;

    // Si es 1 se han cargado archivos excel
    // si es 0 no se han cargado archivos excel
    if (configuracion == 1) {
        mostrar_tabla_configuracion();
        llenar_tabla_configuracion();
    } else {
        mostrar_form_configuracion();
    }

    modal_configuracion.show();
});

/**
 * Función para mostrar la tabla de configuraciones
 */
function mostrar_tabla_configuracion() {
    $('#cuerpo_tabla_configuracion').removeClass('d-none');
    $('#cuerpo_form_subir_archivos').addClass('d-none');
}

/**
 * Función para mostrar el formulario de configuraciones
 */
function mostrar_form_configuracion(params) {
    $('#cuerpo_tabla_configuracion').addClass('d-none');
    $('#cuerpo_form_subir_archivos').removeClass('d-none');
}

/**
 * PROCESAR LOS DATOS DEL EXCEL DE LAS RAYAS Y AUSENCIAS
 */
function procesar_rayas() {
    $("#form_subir_archivos_raya").submit(function (e) {
        e.preventDefault();

        // Recuperar los 4 archivos
        const archivoRayaSAAO = $("#archivo_lista_raya")[0].files[0];
        const archivoRayaSB = $("#archivo_lista_raya_sb")[0].files[0];
        const archivoAusenciasSAAO = $("#archivo_ausencias")[0].files[0];
        const archivoAusenciasSB = $("#archivo_ausencias_sb")[0].files[0];

        // Validar que al menos uno de los 4 archivos esté cargado
        if (!archivoRayaSAAO && !archivoRayaSB && !archivoAusenciasSAAO && !archivoAusenciasSB) {
            alerta("warning", "Archivo requerido.", "Debes seleccionar al menos un archivo para continuar.");
            return;
        }

        // Mostrar un loader mientras se procesa
        Swal.fire({
            title: 'Procesando archivos...',
            text: 'Por favor, espera.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Array para almacenar todas las promesas
        const promesas = [];
        const tiposArchivos = [];

        // Petición para Raya SAAO
        if (archivoRayaSAAO) {
            const formData = new FormData();
            formData.append('archivo_lista_raya', archivoRayaSAAO);
            promesas.push(
                $.ajax({
                    url: 'php/procesar_raya.php',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: 'json'
                })
            );
            tiposArchivos.push('raya_saao');
        }

        // Petición para Raya SB
        if (archivoRayaSB) {
            const formData = new FormData();
            formData.append('archivo_lista_raya', archivoRayaSB);
            promesas.push(
                $.ajax({
                    url: 'php/procesar_raya.php',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: 'json'
                })
            );
            tiposArchivos.push('raya_sb');
        }

        // Petición para Ausencias SAAO
        if (archivoAusenciasSAAO) {
            const formData = new FormData();
            formData.append('archivo_ausencias', archivoAusenciasSAAO);
            promesas.push(
                $.ajax({
                    url: 'php/procesar_ausencias.php',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: 'json'
                })
            );
            tiposArchivos.push('ausencias_saao');
        }

        // Petición para Ausencias SB
        if (archivoAusenciasSB) {
            const formData = new FormData();
            formData.append('archivo_ausencias', archivoAusenciasSB);
            promesas.push(
                $.ajax({
                    url: 'php/procesar_ausencias.php',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: 'json'
                })
            );
            tiposArchivos.push('ausencias_sb');
        }

        // Ejecutar todas las promesas
        Promise.all(promesas)
            .then((resultados) => {
                Swal.close();

                // 1. Mapear resultados con sus tipos
                const datosProcessados = {};
                resultados.forEach((resultado, index) => {
                    datosProcessados[tiposArchivos[index]] = resultado;
                });

                // 2. Unir la información con jsonAguinaldo
                unirDatos(datosProcessados);

                // 3. Mostrar la tabla de configuración con los datos unidos
                mostrar_tabla_configuracion();

                // 4. Llenar la tabla de aguinaldo con los datos combinados
                llenar_tabla_aguinaldo();

                // 5. Resetear paginación a página 1
                $('#pagina_actual_configuracion').data('pagina', 1);

                // 6. Llenar la tabla de configuración con los datos combinados
                llenar_tabla_configuracion();
            })
            .catch(error => {
                Swal.close();
                console.error("Error en el procesamiento:", error);
                alerta("Error", "Ocurrió un error al procesar los archivos.", "error");
            });
    });
}

/**
 * Función para unir los datos procesados
 * Se encarga de unir la información de las rayas y las ausencias
 * con el jsonAguinaldo, de esta forma a cada empleado se le asigna
 * el ISR y la Tarjeta y Ausencias
 * @param {Object} datosProcessados - Objeto con los datos procesados de las rayas y ausencias
 */
function unirDatos(datosProcessados) {
    const mapaAusencias = new Map();

    // Procesar datos de ausencias SAAO
    if (datosProcessados.ausencias_saao && Array.isArray(datosProcessados.ausencias_saao)) {
        datosProcessados.ausencias_saao.forEach(aus => {
            const clave = `${aus.clave_empleado}-${aus.id_empresa}`;
            mapaAusencias.set(clave, aus.total_ausencias);
        });
    }

    // Procesar datos de ausencias SB
    if (datosProcessados.ausencias_sb && Array.isArray(datosProcessados.ausencias_sb)) {
        datosProcessados.ausencias_sb.forEach(aus => {
            const clave = `${aus.clave_empleado}-${aus.id_empresa}`;
            mapaAusencias.set(clave, aus.total_ausencias);
        });
    }

    // Combinar datos de raya de ambas empresas
    const datosRaya = [];
    if (datosProcessados.raya_saao && Array.isArray(datosProcessados.raya_saao)) {
        datosRaya.push(...datosProcessados.raya_saao);
    }
    if (datosProcessados.raya_sb && Array.isArray(datosProcessados.raya_sb)) {
        datosRaya.push(...datosProcessados.raya_sb);
    }

    // RECUPERAR EL JSON ACTUAL
    let json = getAguinaldo();

    // Procesar datos de raya y actualizar jsonAguinaldo de cada empleado
    // Sólo se actualiza la fecha_ingreso_imss, isr, tarjeta
    datosRaya.forEach(raya => {
        const empleadoEncontrado = json.empleados.find(emp =>
            emp.clave_empleado === raya.clave_empleado && emp.id_empresa === raya.id_empresa
        );

        if (empleadoEncontrado) {
            // Agregar la fecha de ingreso al IMSS, si no existe se queda como null
            empleadoEncontrado.fecha_ingreso_imss = raya.fecha_ingreso_imss || null;

            // Unir los conceptos de ISR y tarjeta
            empleadoEncontrado.isr = raya.isr || empleadoEncontrado.isr || 0;
            empleadoEncontrado.tarjeta = raya.tarjeta || empleadoEncontrado.tarjeta || 0;
            // Copias temporales de los conceptos
            empleadoEncontrado.isr_cp = empleadoEncontrado.isr;
            empleadoEncontrado.tarjeta_cp = empleadoEncontrado.tarjeta;

            // Buscar ausencias del empleado
            const claveAusencia = `${raya.clave_empleado}-${raya.id_empresa}`;
            if (mapaAusencias.has(claveAusencia)) {
                empleadoEncontrado.total_ausencias = mapaAusencias.get(claveAusencia);
            }

            // CALCULAR EL NETO A PAGAR
            empleadoEncontrado.neto_pagar = calcularNetoPagar(empleadoEncontrado.aguinaldo, empleadoEncontrado.isr, empleadoEncontrado.tarjeta);

            // CALCULAR REDONDEO
            empleadoEncontrado.redondeo = empleadoEncontrado.aplicar_redondeo ? diferenciaRedondeo(empleadoEncontrado.neto_pagar) : 0;

            // CALCULAR NETO A PAGAR CON REDONDEO
            empleadoEncontrado.neto_pagar_redondeado = calcularNetoPagarRedondeado(empleadoEncontrado.neto_pagar, empleadoEncontrado.redondeo);

        } else {
            console.warn(`Empleado no encontrado para raya: ${raya.clave_empleado} - Empresa ID: ${raya.id_empresa}`);
        }
    });

    // ACTUALIZAR EL CONFIGURAR
    json.configuraciones = 1;
    // GUARDAR EL JSON ACTUALIZADO
    setAguinaldo(json);
}


/**
 * =================================================================================================
 * FUNCIONES PARA LLENAR LA TABLA DE CONFIGURACION Y PAGINACION
 * =================================================================================================
 */

/**
 * Llenar la tabla de configuración
 */
function llenar_tabla_configuracion() {

    let json = getAguinaldo();

    // Validar que haya datos en jsonAguinaldo antes de intentar llenar la tabla
    if (!json || !json.empleados || json.empleados.length === 0) {
        console.warn("No hay datos en jsonAguinaldo para mostrar en la tabla");
        $('#tabla_configuracion_cuerpo').html(
            '<tr><td colspan="7" class="text-center text-muted">No hay empleados disponibles</td></tr>'
        );
        $('#paginacion_configuracion').empty();
        return;
    }

    // Inicializar paginación
    let inicio = 0;
    // Fin se calcula dinámicamente dependiendo del número de registros
    let fin = json.empleados.length;
    // Limite de registros por página
    let limite = 8;
    // Obtener la página actual de la paginación
    let paginaActual = parseInt($('#pagina_actual_configuracion').data('pagina')) || 1;

    // Obtener el departamento seleccionado para filtrar
    let departamentoSeleccionado = $('#departamento_configuracion').val();

    if (limite !== -1) {
        // Calcular el inicio y fin para la página actual
        inicio = (paginaActual - 1) * limite;
        fin = inicio + limite;
    }

    // Filtrar empleados
    let empleadosFiltrados = json.empleados.filter(emp => {
        // Filtro de departamento por id
        // Si es -1 significa que debe mostrar todos los departamentos
        // Si no, mostrar solo los empleado de ese departamento
        const coincideDepartamento = departamentoSeleccionado === "-1" ||
            (parseInt(emp.id_departamento) === parseInt(departamentoSeleccionado));

        return coincideDepartamento;
    });

    // Filtrar los empleado segun el inicio y fin para la página actual
    const empleadosPagina = empleadosFiltrados.slice(inicio, fin);
    const totalPaginas = limite === -1 ? 1 : Math.ceil(empleadosFiltrados.length / limite);

    // Limpiar tabla
    const tbody = $('#tabla_configuracion_cuerpo');
    tbody.empty();

    // Si no hay empleados después de filtrar, mostrar mensaje
    if (empleadosPagina.length === 0) {
        tbody.html(
            '<tr><td colspan="7" class="text-center text-muted">No se encontraron resultados</td></tr>'
        );
        $('#paginacion_configuracion').empty();
        return;
    }

    // Renderizar filas
    empleadosPagina.forEach((emp, index) => {
        const nombreCompleto = `${emp.nombre} ${emp.ap_paterno} ${emp.ap_materno}`;

        // Determinar si usar fecha real o imss basado en usar_fecha_real
        const isRealChecked = emp.usar_fecha_real === 1 ? 'checked' : '';
        const isImssChecked = emp.usar_fecha_real === 0 ? 'checked' : '';

        let celdaFechaImss = '';
        let celdaAusencias = '';

        if (emp.status_nss == 0) {
            celdaFechaImss = '<td class="text-secondary">-</td>';
            celdaAusencias = '<td class="text-secondary">-</td>';
        } else {
            celdaFechaImss = `
                <td>
                    <div class="form-check">
                        <input
                            data-id="${emp.id_empleado}"
                            class="form-check-input check_fecha_imss"
                            type="radio"
                            name="fecha_opcion_${emp.id_empleado}"
                            id="fecha_imss_${emp.id_empleado}"
                            value="${emp.fecha_ingreso_imss}" ${isImssChecked}>
                        <label class="form-check-label" for="fecha_imss_${emp.id_empleado}">${formatearFecha(emp.fecha_ingreso_imss)}</label>
                    </div>
                </td>
            `;
            celdaAusencias = `
                <td>
                    <div class="form-check">
                        <input
                            data-id="${emp.id_empleado}"
                            class="form-check-input check_ausencia"
                            type="checkbox"
                            id="usar_faltas_${emp.id_empleado}"
                            name="usar_faltas" value="${emp.total_ausencias || 0}" ${emp.usar_ausencias ? 'checked' : ''}>
                        <label class="form-check-label" for="usar_faltas_${emp.id_empleado}">${emp.total_ausencias || 0}</label>
                    </div>
                </td>
            `;
        }

        const fila = `
            <tr data-id="${emp.id_empleado}">
                <td>${emp.clave_empleado || 'CV'}</td>
                <td>${nombreCompleto}</td>
                <td>${emp.status_nss ? '<span class="badge text-bg-success">SI</span>' : '<span class="badge text-bg-danger">NO</span>'}</td>
                <td>
                    <div class="form-check">
                        <input
                            data-id="${emp.id_empleado}"
                            class="form-check-input check_fecha_real"
                            type="radio"
                            name="fecha_opcion_${emp.id_empleado}"
                            id="fecha_real_${emp.id_empleado}"
                            value="${emp.fecha_ingreso_real}" ${isRealChecked}>
                        <label class="form-check-label" for="fecha_real_${emp.id_empleado}">${formatearFecha(emp.fecha_ingreso_real)}</label>
                    </div>
                </td>
                ${celdaFechaImss}
                ${celdaAusencias}
                <td>
                    <input type="date" class="form-control form-control-sm fecha_pago" id="fecha_pago_${emp.id_empleado}" name="fecha_pago" value="${emp.fecha_pago || ''}">
                </td>
            </tr>
        `;

        tbody.append(fila);
    });

    console.log(empleadosFiltrados.length, paginaActual, limite);


    renderizarPaginacionConfiguracion(empleadosFiltrados.length, paginaActual, limite);
}

/**
 * Renderizar los botones de paginación de configuración
 */
function renderizarPaginacionConfiguracion(totalEmpleados, paginaActual, limite) {
    if (limite === -1) {
        $('#paginacion_configuracion').empty();
        return;
    }

    console.log("DATOS DE PAGINACION CONFIGURACION: ", totalEmpleados, paginaActual, limite);


    const totalPaginas = Math.ceil(totalEmpleados / limite);
    const paginacion = $('#paginacion_configuracion');
    paginacion.empty();

    // Botón anterior
    if (paginaActual > 1) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPaginaConfiguracion(${paginaActual - 1}); return false;">Anterior</a>
            </li>
        `);
    }

    // Botones de páginas
    const rangoInicio = Math.max(1, paginaActual - 2);
    const rangoFin = Math.min(totalPaginas, paginaActual + 2);

    for (let i = rangoInicio; i <= rangoFin; i++) {
        const activa = i === paginaActual ? 'active' : '';
        paginacion.append(`
            <li class="page-item ${activa}">
                <a class="page-link" href="#" onclick="cambiarPaginaConfiguracion(${i}); return false;">${i}</a>
            </li>
        `);
    }

    // Botón siguiente
    if (paginaActual < totalPaginas) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPaginaConfiguracion(${paginaActual + 1}); return false;">Siguiente</a>
            </li>
        `);
    }
}


/**
 * Cambiar a una página específica
 */
function cambiarPaginaConfiguracion(nuevaPagina) {
    console.log("Cambiando a página:", nuevaPagina);

    $('#pagina_actual_configuracion').data('pagina', nuevaPagina);
    llenar_tabla_configuracion();

    // Scroll suave hacia la tabla
    document.getElementById('tabla_configuracion_cuerpo').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Evento para el cambio de departamento en el filtro
$(document).on('change', '#departamento_configuracion', function () {
    // Resetear a página 1 al cambiar el filtro
    $('#pagina_actual_configuracion').data('pagina', 1);
    llenar_tabla_configuracion();
});


/**
 * ============================================================================================
 * EVENTOS PARA DAR FUNCIONALIDAD A LA CONFIGURACION GENERAL PARA TODOS LOS EMPLEADOS
 * ============================================================================================
 */

/**
 * Evento para seleccionar la fecha de ingreso al IMSS para todos los empleados que tengan seguro social
 */
$(document).on('click', '#btn_seleccionar_todas_imss', function (e) {
    e.preventDefault();

    // Recuperar el estado actual de jsonAguinaldo
    let json = getAguinaldo();

    // Recuperar departamento seleccionado para filtrar
    let departamentoSeleccionado = $('#departamento_configuracion').val();

    // Actualizar el estado de usar_fecha_real
    json.empleados.forEach(empleado => {

        // Si es -1 aplica para todos los departamentos
        // Si no, solo aplica al departamento seleccionado
        const aplicaDepartamento =
            departamentoSeleccionado == -1 ||
            empleado.id_departamento == departamentoSeleccionado;

        // Sólo si pertenece al departamento correspondiente
        // y tiene seguro social
        if (
            aplicaDepartamento &&
            empleado.status_nss !== 0 &&
            empleado.fecha_ingreso_imss
        ) {
            empleado.usar_fecha_real = 0;
        }
    });

    // Actualizar el jsonAguinaldo con los nuevos datos combinados
    setAguinaldo(json);
    // Llenar la tabla de configuracion
    llenar_tabla_configuracion();
});

/**
 * Evento para seleccionar la fecha de ingreso al IMSS para todos los empleados que tengan seguro social
 */
$(document).on('click', '#btn_seleccionar_todas_real', function (e) {
    e.preventDefault();

    // Recuperar el estado actual de jsonAguinaldo
    let json = getAguinaldo();

    // Recuperar departamento seleccionado para filtrar
    let departamentoSeleccionado = $('#departamento_configuracion').val();

    // Actualizar el estado de usar_fecha_real a 1 (usar fecha real)
    // No importa si tiene o no seguro social, se aplica a todos los empleados
    json.empleados.forEach(empleado => {

        // Si es -1 aplica a todos
        // Si no, sólo al departamento seleccionado
        const aplicaDepartamento =
            departamentoSeleccionado == -1 ||
            empleado.id_departamento == departamentoSeleccionado;

        if (aplicaDepartamento) {
            empleado.usar_fecha_real = 1;
        }
    });

    // Actualizar el jsonAguinaldo con los nuevos datos combinados
    setAguinaldo(json);
    // Llenar la tabla de configuracion
    llenar_tabla_configuracion();
});

/**
 * Evento para aplicar las ausencias a todos los empleados que tengan ausencias registradas
 */
$(document).on('click', '#btn_seleccionar_todas_ausencias', function (e) {
    e.preventDefault();

    // Recuperar el estado actual de jsonAguinaldo
    let json = getAguinaldo();

    // Recuperar departamento seleccionado para filtrar
    let departamentoSeleccionado = $('#departamento_configuracion').val();

    // Actualizar el estado de usar_ausencias a 1 (usar ausencias)
    json.empleados.forEach(empleado => {

        // Si es -1 aplica a todos
        // Si no, sólo al departamento seleccionado
        const aplicaDepartamento =
            departamentoSeleccionado == -1 ||
            empleado.id_departamento == departamentoSeleccionado;

        // Sólo se aplican si las ausencias son mayores a 0
        if (
            aplicaDepartamento &&
            empleado.total_ausencias > 0
        ) {
            empleado.usar_ausencias = 1;
        }
    });

    // Actualizar el jsonAguinaldo con los nuevos datos combinados
    setAguinaldo(json);
    // Llenar la tabla de configuracion
    llenar_tabla_configuracion();
});

/**
 * Evento para quitar las ausencias de todos los empleados que tengan ausencias registradas
 */
$(document).on('click', '#btn_quitar_todas_ausencias', function (e) {
    e.preventDefault();

    // Recuperar el estado actual de jsonAguinaldo
    let json = getAguinaldo();

    // Recuperar departamento seleccionado para filtrar
    let departamentoSeleccionado = $('#departamento_configuracion').val();

    // Actualizar el estado de usar_ausencias a 0 (no usar ausencias)
    json.empleados.forEach(empleado => {

        // Si es -1 aplica a todos
        // Si no, sólo al departamento seleccionado
        const aplicaDepartamento =
            departamentoSeleccionado == -1 ||
            empleado.id_departamento == departamentoSeleccionado;

        if (aplicaDepartamento) {
            empleado.usar_ausencias = 0;
        }
    });

    // Actualizar el jsonAguinaldo con los nuevos datos combinados
    setAguinaldo(json);
    // Llenar la tabla de configuracion
    llenar_tabla_configuracion();
});

/**
 * Evento para aplicar la fecha de pago para todos los empleados
 */
$(document).on('click', '#btn_copiar_fecha_pago', function (e) {
    e.preventDefault();

    let fechaPagoGeneral = $('#fecha_pago_masiva').val();

    if (!fechaPagoGeneral) {
        alerta("warning", "Fecha de pago requerida.", "Debes seleccionar una fecha de pago para continuar.", true);
        return;
    }

    // Recuperar el estado actual de jsonAguinaldo
    let json = getAguinaldo();

    // Recuperar departamento seleccionado para filtrar
    let departamentoSeleccionado = $('#departamento_configuracion').val();

    // Actualizar la fecha de pago para los empleados correspondientes
    json.empleados.forEach(empleado => {

        // Si es -1 aplica a todos
        // Si no, sólo al departamento seleccionado
        const aplicaDepartamento =
            departamentoSeleccionado == -1 ||
            empleado.id_departamento == departamentoSeleccionado;

        if (aplicaDepartamento) {
            empleado.fecha_pago = fechaPagoGeneral;
        }
    });

    // Actualizar el jsonAguinaldo con los nuevos datos combinados
    setAguinaldo(json);
    // Llenar la tabla de configuracion
    llenar_tabla_configuracion();
});


/**
 * ================================================================================================
 * EVENTOS PARA DAR FUNCIONALIDAD A LA CONFIGURACION DE CADA EMPLEADO 
 * ================================================================================================
 */

/**
 * Evento para seleccionar la fecha real de un empleado específico
 */
$(document).on('change', '.check_fecha_real', function (e) {
    e.preventDefault();

    // Obtener el id del empleado desde el atributo data-id del input
    const idEmpleado = $(this).data('id');
    // Recuperar el estado actual de jsonAguinaldo
    const json = getAguinaldo();
    // Recupera al empleado mediante el id
    const empleadoIndex = json.empleados.findIndex(e => e.id_empleado === idEmpleado);
    // Si no se encuentra el empleado, muestra una alerta y detiene la ejecución
    if (empleadoIndex === -1) {
        alerta("error", "Empleado no encontrado.", "No se pudo encontrar al empleado para actualizar su fecha de ingreso.");
        return;
    }

    // Actualizar el estado de usar_fecha_real del empleado seleccionado
    json.empleados[empleadoIndex].usar_fecha_real = 1;

    // Actualizar el jsonAguinaldo con los nuevos datos combinados
    setAguinaldo(json);
    // Llenar la tabla de configuracion
    llenar_tabla_configuracion();
});

/**
 * Evento para seleccionar la fecha real de un empleado específico
 */
$(document).on('change', '.check_fecha_imss', function (e) {
    e.preventDefault();

    // Obtener el id del empleado desde el atributo data-id del input
    const idEmpleado = $(this).data('id');
    // Recuperar el estado actual de jsonAguinaldo
    const json = getAguinaldo();
    // Recupera al empleado mediante el id
    const empleadoIndex = json.empleados.findIndex(e => e.id_empleado === idEmpleado);
    // Si no se encuentra el empleado, muestra una alerta y detiene la ejecución
    if (empleadoIndex === -1) {
        alerta("error", "Empleado no encontrado.", "No se pudo encontrar al empleado para actualizar su fecha de ingreso.");
        return;
    }

    // Actualizar el estado de usar_fecha_real del empleado seleccionado
    // Si es cero significa que debe usar la fecha imss
    if (json.empleados[empleadoIndex].fecha_ingreso_imss) {
        json.empleados[empleadoIndex].usar_fecha_real = 0;
    }

    // Actualizar el jsonAguinaldo con los nuevos datos combinados
    setAguinaldo(json);
    // Llenar la tabla de configuracion
    llenar_tabla_configuracion();
});


/**
 * Evento para asignar o no las ausencias a un empleado específico
 */
$(document).on('change', '.check_ausencia', function (e) {
    e.preventDefault();

    // Obtener el id del empleado desde el atributo data-id del input
    const idEmpleado = $(this).data('id');
    // Saber si esta checked o no
    let usarAusencias = $(this).is(':checked') ? 1 : 0;
    // Recuperar el estado actual de jsonAguinaldo
    const json = getAguinaldo();
    // Recupera al empleado mediante el id
    const empleadoIndex = json.empleados.findIndex(e => e.id_empleado === idEmpleado);
    // Si no se encuentra el empleado, muestra una alerta y detiene la ejecución
    if (empleadoIndex === -1) {
        alerta("error", "Empleado no encontrado.", "No se pudo encontrar al empleado para actualizar su fecha de ingreso.");
        return;
    }

    // Actualizar el estado de usar_ausencias del empleado seleccionado
    json.empleados[empleadoIndex].usar_ausencias = usarAusencias;

    // Actualizar el jsonAguinaldo con los nuevos datos combinados
    setAguinaldo(json);
    // Llenar la tabla de configuracion
    llenar_tabla_configuracion();
});


/**
 * ================================================================================================
 * EVENTO PARA GUARDAR LOS CAMBIOS DE LA CONFIGURACIÓN
 * ================================================================================================
 */

$('#form_tabla_configuracion').submit(function (e) {
    e.preventDefault();

    // Recuperar el estado actual de jsonAguinaldo
    const json = getAguinaldo();
    const anio = json.anio;

    // SE VAN A REPROCESAR LOS CALCULOS PARA CADA UNO DE LOS EMPLEADOS
    json.empleados.forEach(empleado => {
        // 1. CALCULAR DIAS TRABAJADOS TEMPORAL APARTIR DE LA FECHA REAL DE INGRESO (SE USUARÁ POR DEFECTO LA REAL)
        // Si usar_fecha_real es 1 se usa la fecha de ingreso real, si es 0 se usa la fecha de ingreso al imss
        if (empleado.usar_fecha_real === 1) {
            empleado.dias_trabajados_tmp = diasTrabajados(empleado.fecha_ingreso_real, anio);
        } else {
            empleado.dias_trabajados_tmp = diasTrabajados(empleado.fecha_ingreso_imss, anio);
        }

        // 2. CALCULAR DIAS TRABAJADOS DEFINITIVO RESTANDO LAS AUSENCIAS
        // Si usar_ausencias es 1 se restan las ausencias, se van a restar
        if (empleado.usar_ausencias == 1) {
            empleado.dias_trabajados = empleado.dias_trabajados_tmp - empleado.total_ausencias;
        } else {
            empleado.dias_trabajados = empleado.dias_trabajados_tmp;
        }

        // 3. CALCULAR SI TIENE DERECHO A AGUINALDO, SI TIENE 60 O MAS DIAS TRABAJADOS DEFINITIVO EN EL AÑO, ENTONCES TIENE DERECHO
        empleado.derecho_aguinaldo = empleado.dias_trabajados >= 60;

        // 4. DEFINIR SI SE MUESTRA O NO EN LA INTERFAZ, SI NO TIENE DERECHO A AGUINALDO ENTONCES NO SE MUESTRA
        empleado.visible = empleado.derecho_aguinaldo;

        // 5. CALCULAR LOS MESES TRABAJADOS APARTIR DE LOS DIAS TRABAJADOS DEFINITIVO
        empleado.meses_trabajados = mesesTrabajados(empleado.dias_trabajados);

        // 6. CALCULAR EL AGUINALDO APARTIR DE LOS DIAS TRABAJADOS DEFINITIVO
        empleado.aguinaldo = calcularAguinaldo(empleado.dias_trabajados, empleado.salario_diario, empleado.dias_pago);

        // 7. CALCULAR NETO A PAGAR: AGUINALD - ISR - TARJETA
        empleado.neto_pagar = calcularNetoPagar(empleado.aguinaldo, empleado.isr, empleado.tarjeta);

        // 8. CALCULAR LA DIFERENCIA DE REDONDEO APARTIR DEL NETO A PAGAR
        // POR DEFECTO NO SE APLICA REDONDEO, PERO ESTO SE QUITA DESDE EL MODAL DE LOS REDONDEOS
        empleado.redondeo = empleado.aplicar_redondeo ? diferenciaRedondeo(empleado.neto_pagar) : 0;

        // 10. CALCULAR EL NETO A PAGAR REDONDEADO SUMANDO LA DIFERENCIA DE REDONDEO AL NETO A PAGAR ORIGINAL
        empleado.neto_pagar_redondeado = calcularNetoPagarRedondeado(empleado.neto_pagar, empleado.redondeo);
    });

    // Actualizar el jsonAguinaldo con los nuevos datos combinados
    setAguinaldo(json);
    // Llenar la tabla del aguinaldo
    llenar_tabla_aguinaldo();
    // Ocultar el modal de la configuración
    modal_configuracion.hide();
    // Alerta de éxito
    alerta("success", "Configuración guardada.", "Los cambios en la configuración se han guardado correctamente.");
});


/**
 * ================================================================================================
 * VOLVER A CARGAR LA CONFIGURACION
 * ================================================================================================
 */

/**
 * Evento para volver a cargar los archivos
 */
$('#btn_volver_cargar_configuracion').click(function (e) {
    e.preventDefault();

    Swal.fire({
        title: "¿Seguro de volver a cargar?",
        text: "Esto reseteará cualquier cambio realizado en la configuración actual y volverá a cargar los archivos desde cero.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#008227",
        cancelButtonColor: "#20193B",
        confirmButtonText: "Sí, resetear",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // VACIAR EL CUERPO DE LA TABLA DE CONFIGURACION
            $('#tabla_configuracion_cuerpo').empty();
            // VACIAR LA PAGINACION DE LA CONFIGURACION
            $('#paginacion_configuracion').empty();
            // RECUPERAR JSON AGUINALDO ORIGINAL DESDE EL LOCALSTORAGE
            const json = getAguinaldo();
            // MARCAR LA CONFIGURACIONES COMO 0
            json.configuraciones = 0;
            // ACTUALIZAR EL jsonAguinaldo CON LOS NUEVOS DATOS COMBINADOS
            setAguinaldo(json);
            // MOSTRAR EL FORMULARIO DE CARGA DE ARCHIVOS
            mostrar_form_configuracion();
        }
    });
});