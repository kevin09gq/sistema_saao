
/**
 * =========================================================================================================================
 * FUNCIONES PARA LLENAR LA TABLA DE AGUINALDO
 * =========================================================================================================================
 */

/**
 * Llenar la tabla de aguinaldo con los datos obtenidos del servidor
 */
function llenar_tabla_aguinaldo() {

    if (!window.jsonAguinaldo || window.jsonAguinaldo.length === 0) {
        console.warn("No hay datos en jsonAguinaldo para mostrar en la tabla");
        $('#cuerpo_tabla_aguinaldo').html(
            '<tr><td colspan="13" class="text-center text-muted">No hay empleados disponibles</td></tr>'
        );
        return;
    }

    // Inicializar elementos de la interfaz
    inicializar_interfaz();

    // Obtener valores de los filtros
    const textoBusqueda = $('#busqueda').val().toLowerCase();
    const departamentoSeleccionado = $('#id_departamento').val();
    const empresaSeleccionada = $('#id_empresa').val();
    const limite = parseInt($('#limite').val()) || 10;
    // Obtener la página actual de la paginación
    let paginaActual = parseInt($('#pagina-actual').data('pagina')) || 1;


    // Filtrar empleados
    let empleadosFiltrados = jsonAguinaldo.empleados.filter(emp => {
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
        // Filtro de empresa por id
        const coincideEmpresa = empresaSeleccionada === "-1" ||
            (parseInt(emp.id_empresa) === parseInt(empresaSeleccionada));

        // Filtro de derecho a aguinaldo y visibilidad
        const cumpleDerechoYVisible = emp.derecho_aguinaldo === true && emp.visible === true;

        return coincideBusqueda && coincideDepartamento && coincideEmpresa && cumpleDerechoYVisible;
    });

    // Calcular paginación
    let inicio = 0;
    let fin = empleadosFiltrados.length;

    if (limite !== -1) {
        inicio = (paginaActual - 1) * limite;
        fin = inicio + limite;
    }

    // Obtener empleados para la página actual
    const empleadosPagina = empleadosFiltrados.slice(inicio, fin);
    const totalPaginas = limite === -1 ? 1 : Math.ceil(empleadosFiltrados.length / limite);

    // Limpiar tabla
    const tbody = $('#cuerpo_tabla_aguinaldo');
    tbody.empty();

    // Si no hay empleados después de filtrar, mostrar mensaje
    if (empleadosPagina.length === 0) {
        tbody.html(
            '<tr><td colspan="13" class="text-center text-muted">No se encontraron resultados</td></tr>'
        );
        $('#paginacion').empty();
        return;
    }

    // Renderizar filas
    empleadosPagina.forEach((emp, index) => {
        const contador = inicio + index + 1;
        const campoVacio = '<span class="text-secondary">-</span>'
        const nombreCompleto = `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.trim();
        const empresa = emp.id_empresa == 1 ? '<span class="badge rounded-pill text-bg-primary">SAAO</span>' : (emp.id_empresa == 2 ? '<span class="badge rounded-pill text-bg-secondary">SB</span>' : campoVacio);
        const sueldoDiario = parseFloat(emp.salario_diario) || 0;
        const diasTrabajados = emp.dias_trabajados || 0;
        const mesesTrabajados = emp.meses_trabajados || 0;
        const aguinaldo = emp.aguinaldo !== null && emp.aguinaldo !== undefined ? emp.aguinaldo : 0;
        const nss = emp.status_nss === 1 ? '<span class="badge rounded-pill text-bg-success">Sí</span>' : '<span class="badge rounded-pill text-bg-secondary">No</span>';
        const isr = emp.isr == 0 ? campoVacio : `<span class="text-danger">- $${formatoMoneda(emp.isr)}</span>`;
        const tarjeta = emp.tarjeta == 0 ? campoVacio : `<span class="text-danger">- $${formatoMoneda(emp.tarjeta)}</span>`;

        // Calcular total deducciones (ISR + Tarjeta)
        const suma = (parseFloat(emp.isr) || 0) + (parseFloat(emp.tarjeta) || 0);
        const totalDeducciones = suma == 0 ? campoVacio : `<span class="text-danger">- $ ${formatoMoneda(suma)}</span>`;

        const netoPagar = emp.neto_pagar < 0 ?
            `<span class="text-danger">- $ ${formatoMoneda(emp.neto_pagar * -1)}</span>` :
            (emp.neto_pagar > 0 ? `<span class="text-success">$ ${formatoMoneda(emp.neto_pagar)}</span>` : campoVacio);

        //const redondeado = emp.aplicar_redondeo ? diferenciaRedondeo(emp.neto_pagar) : 0;
        const redondeado = emp.redondeo;

        // const total_redondeo = emp.neto_pagar + redondeado;
        const total_redondeo = emp.neto_pagar_redondeado;

        const fila = `
            <tr data-id="${emp.id_empleado}" style="cursor:pointer;">
                <td>${contador}</td>
                <td class="text-center">${emp.clave_empleado}</td>
                <td>${nombreCompleto}</td>
                <td class="text-center fw-bold">${empresa}</td>
                <td class="text-center">${nss}</td>
                <td class="text-center">${sueldoDiario == 0 ? campoVacio : `$ ${formatoMoneda(sueldoDiario)}`}</td>
                <td class="text-center">${diasTrabajados}</td>
                <td class="text-center">${mesesTrabajados}</td>
                <td class="text-center">${aguinaldo == 0 ? campoVacio : `$ ${formatoMoneda(aguinaldo)}`}</td>
                <td class="text-center">${isr}</td>
                <td class="text-center">${tarjeta}</td>
                <td class="text-center fw-bold">${netoPagar}</td>
                <td class="text-center">${estructuraDinero(redondeado)}</td>
                <td class="text-center fw-bold">${estructuraDinero(total_redondeo)}</td>
            </tr>
        `;

        tbody.append(fila);
    });

    // ===============================
    // FILA DE TOTALES
    // ===============================
    if (paginaActual === totalPaginas || limite === -1) {

        const totalAguinaldo = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.aguinaldo) || 0),
            0
        );

        const totalISR = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.isr) || 0),
            0
        );

        const totalTarjeta = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.tarjeta) || 0),
            0
        );

        const totalNeto = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.neto_pagar) || 0),
            0
        );

        const totalRedondeo = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.redondeo) || 0),
            0
        );

        const totalNetoRedondeado = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.neto_pagar_redondeado) || 0),
            0
        );

        const filaTotal = `
        <tr class="table-light fw-bold">
            <td colspan="3" class="text-center">
                TOTALES
            </td>

            <td colspan="5"></td>

            <td class="text-center">
                $ ${formatoMoneda(totalAguinaldo)}
            </td>

            <td class="text-center text-danger">
                - $ ${formatoMoneda(totalISR)}
            </td>

            <td class="text-center text-danger">
                - $ ${formatoMoneda(totalTarjeta)}
            </td>

            <td class="text-center text-success">
                $ ${formatoMoneda(totalNeto)}
            </td>

            <td class="text-center">
                $ ${formatoMoneda(totalRedondeo)}
            </td>

            <td class="text-center text-success">
                $ ${formatoMoneda(totalNetoRedondeado)}
            </td>
        </tr>
    `;

        tbody.append(filaTotal);
    }

    // Renderizar paginación
    renderizarPaginacion(empleadosFiltrados.length, paginaActual, limite);
}


/**
 * Renderizar los botones de paginación
 */
function renderizarPaginacion(totalEmpleados, paginaActual, limite) {
    if (limite === -1) {
        $('#paginacion').empty();
        return;
    }

    const totalPaginas = Math.ceil(totalEmpleados / limite);
    const paginacion = $('#paginacion');
    paginacion.empty();

    // Botón anterior
    if (paginaActual > 1) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">Anterior</a>
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
                <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i}</a>
            </li>
        `);
    }

    // Botón siguiente
    if (paginaActual < totalPaginas) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">Siguiente</a>
            </li>
        `);
    }
}


/**
 * Cambiar a una página específica
 */
function cambiarPagina(nuevaPagina) {
    $('#pagina-actual').data('pagina', nuevaPagina);
    llenar_tabla_aguinaldo();
    window.scrollTo(0, 0);
}


/**
 * ========================================================================================================================
 * FUNCIONES PARA AGREGAR LA FILA DE TOTALES EN LA TABLA DE AGUINALDO
 * ========================================================================================================================
 */








/**
 * ========================================================================================================================
 * FUNCION AUX PARA DAR FORMATO A LOS CAMPOS DE DINERO EN LA TABLA, MOSTRANDOLOS EN VERDE SI SON POSITIVOS,
 * ROJO SI SON NEGATIVOS Y GRIS SI SON CERO O NULOS
 * ========================================================================================================================
 */

/**
 * Dar formato a una cantidad numérica para mostrarla en la tabla con colores según si es positiva, negativa o cero
 * @param {Float} cantidad 
 * @returns 
 */
function estructuraDinero(cantidad) {
    switch (true) {
        case (cantidad < 0):
            return `<span class="text-danger">- $ ${formatoMoneda(cantidad * -1)}</span>`;
            break;
        case (cantidad === 0):
            return '<span class="text-secondary">-</span>';
            break;
        case (cantidad > 0):
            return `<span class="text-success">$ ${formatoMoneda(cantidad)}</span>`;
            break;
        default:
            return '<span class="text-secondary">-</span>';
    }
}

/**
 * Dar formulato de moneda a un número, con dos decimales y separador de miles, sin símbolo de moneda
 * @param {Number} numero 
 * @returns 
 */
function formatoMoneda(numero) {
    return numero.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Configurar eventos de filtrado
 */
$(document).ready(function () {
    // Evento de búsqueda
    $('#busqueda').on('keyup', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_tabla_aguinaldo();
    });

    // Evento de filtro departamento
    $('#id_departamento').on('change', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_tabla_aguinaldo();
    });

    // Evento de filtro empresa
    $('#id_empresa').on('change', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_tabla_aguinaldo();
    });

    // Evento de límite por página
    $('#limite').on('change', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_tabla_aguinaldo();
    });

    // Inicializar variable de página actual si no existe
    if (!$('#pagina-actual').length) {
        $('body').append('<div id="pagina-actual" data-pagina="1" style="display:none;"></div>');
    }
});


/**
 * =========================================================================================================================
 * FUNCIONES y EVENTOS PARA DAR FUNCIONALIDAD A LOS DEMÁS COSAS DE LA INTERFAZ
 * =========================================================================================================================
 */


function inicializar_interfaz() {
    // PONER EL AÑO EN EL TITULO
    $('#anio_calculo_label').text(window.jsonAguinaldo.anio || new Date().getFullYear());
}


/**
 * Evento para Cargar los datos de nuevo
 */
$(document).on('click', '#btn_cerrar', function (e) {
    e.preventDefault();
    Swal.fire({
        title: "¿Seguro de cerrar?",
        text: "Si no has guardado, perderás los cambios realizados. ¿Deseas continuar?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cerrar",
        cancelButtonText: "cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar datos del storage y jsonAguinaldo
            clearStorage();
            // Mostrar formulario y ocultar tabla
            mostrar_formulario();
        }
    });
});


/**
 * Evento para guardar los cambios en la base de datos
 */
$(document).on('click', '#btn_guardar', function (e) {
    e.preventDefault();
    Swal.fire({
        title: "¿Seguro de guardar?",
        text: "Una vez guardados, los cambios no podrán ser deshechos. ¿Deseas continuar?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#008227",
        cancelButtonColor: "#20193B",
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {

            // Mostrar alerta de carga
            Swal.fire({
                title: 'GUARDANDO INFORMACIÓN...',
                html: 'ESPERE UN MOMENTO.',
                icon: 'info',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: (modal) => {
                    Swal.showLoading();
                }
            });

            setTimeout(() => {
                Swal.close();
                // Obtener el año del calculo desde el jsonAguinaldo o usar el año actual si no está definido
                let anio = window.jsonAguinaldo.anio;

                $.ajax({
                    type: "POST",
                    url: "php/aguinaldo.php",
                    data: {
                        anio: anio,
                        json: JSON.stringify(window.jsonAguinaldo),
                        accion: "guardar_aguinaldo"
                    },
                    dataType: "json",
                    success: function (response) {

                        alerta(response.icono, response.titulo, response.texto);

                    }
                });
            }, 3000);
        }
    });
});

/**
 * Evento para guardar los cambios en la base de datos
 */
$(document).on('click', '#btn_resetear', function (e) {
    e.preventDefault();
    Swal.fire({
        title: "¿Seguro de resetear?",
        text: "Esta acción regresará el cálculo del aguinaldo a su estado original, eliminando cualquier ajuste realizado. ¿Deseas continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#008227",
        cancelButtonColor: "#20193B",
        confirmButtonText: "Sí, resetear",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // Obtener el año del calculo desde el jsonAguinaldo o usar el año actual si no está definido
            let anio = window.jsonAguinaldo.anio || new Date().getFullYear();
            // Llamar a la función para obtener los empleados y recalcular el aguinaldo, esto reseteará cualquier cambio realizado
            obtener_empleados(anio);
            // Mostrar alerta de éxito
            alerta("success", "Cálculo reseteado", "El cálculo del aguinaldo ha sido reseteado a su estado original.");
        }
    });
});