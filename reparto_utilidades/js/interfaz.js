
/**
 * ==================================================================================================
 * FUNCIONES RELACIONADAS CON LA TABLA PRINCIPAL Y SU PAGINACION
 * ==================================================================================================
 */

/**
 * Función para Llenar la tabla principal con los datos de PTU
 */
function llenar_tabla_ptu() {

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
    const textoBusqueda = $('#busqueda').val().toLowerCase();
    const departamentoSeleccionado = $('#id_departamento').val();
    const empresaSeleccionada = $('#id_empresa').val();
    const limite = parseInt($('#limite').val()) || 10;
    // Obtener la página actual de la paginación
    let paginaActual = parseInt($('#pagina-actual').data('pagina')) || 1;

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
        // Filtro de empresa por id
        const coincideEmpresa = empresaSeleccionada === "-1" ||
            (parseInt(emp.id_empresa) === parseInt(empresaSeleccionada));

        // Filtro de derecho a aguinaldo y visibilidad
        const visible = emp.visible === true;

        return coincideBusqueda && coincideDepartamento && coincideEmpresa && visible;
    });

    // CALCULAR INICIO Y FIN DE LOS EMPLEADOS A MOSTRAR SEGUN LA PAGINACION
    let inicio = 0;
    let fin = empleadosFiltrados.length;

    if (limite !== -1) {
        inicio = (paginaActual - 1) * limite;
        fin = inicio + limite;
    }

    // OBTENER LOS EMPLEADOS A MOSTRAR EN LA PAGINA ACTUAL
    const empleadosPagina = empleadosFiltrados.slice(inicio, fin);
    const totalPaginas = limite === -1 ? 1 : Math.ceil(empleadosFiltrados.length / limite);

    // LIMPIAR EL CUERPO DE LA TABLA ANTES DE LLENARLA
    const tbody = $('#cuerpo_tabla_ptu');
    tbody.empty();

    // VALIDAR SI HAY EMPLEADOS PARA MOSTRAR EN LA PAGINA ACTUAL
    if (empleadosPagina.length === 0) {
        tbody.html(
            '<tr><td colspan="10" class="text-center text-muted">No se encontraron resultados</td></tr>'
        );
        $('#paginacion').empty();
        return;
    }

    // LLENAR LA TABLA CON LOS EMPLEADOS
    // Renderizar filas
    empleadosPagina.forEach((emp, index) => {

        const campoVacio = '<span class="text-secondary">-</span>'

        const contador = inicio + index + 1;
        const nombreCompleto = `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.trim();
        const empresa = emp.id_empresa == 1 ? '<span class="badge rounded-pill text-bg-primary">SAAO</span>' : (emp.id_empresa == 2 ? '<span class="badge rounded-pill text-bg-secondary">SB</span>' : campoVacio);
        const nss = emp.status_seguro === 1 ? '<span class="badge rounded-pill text-bg-success">Sí</span>' : '<span class="badge rounded-pill text-bg-secondary">No</span>';

        const puesto = emp.nombre_puesto ? emp.nombre_puesto : campoVacio;


        const fila = `
            <tr data-id="${emp.id_empleado}" style="cursor:pointer;">
                <td>${contador}</td>
                <td class="text-center">${emp.clave_empleado}</td>
                <td>${nombreCompleto}</td>
                <td class="text-center">${nss}</td>
                <td class="text-center fw-bold">${empresa}</td>

                <td class="text-center">${formatoCantidad(emp.salario_diario, '')}</td>
                <td class="text-center">${puesto}</td>
                <td class="text-end">${formatoCantidad(emp.ptu, '')}</td>
                <td width="100" class="text-end">${formatoCantidad(emp.tarjeta, 'text-danger')}</td>
                <td class="text-end">${formatoCantidad(emp.neto_pagar, 'text-success')}</td>
                <td class="text-end">${formatoCantidad(emp.redondeo, 'text-success')}</td>
                <td width="100" class="text-end fw-bolder">${formatoCantidad(emp.neto_pagar_redondeado, 'text-primary')}</td>
            </tr>
        `;

        tbody.append(fila);
    });

    // ===============================
    // FILA DE TOTALES
    // ===============================
    if (paginaActual === totalPaginas || limite === -1) {

        const totalPTU = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.ptu) || 0),
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
            <td colspan="2" class="text-center">
                TOTALES
            </td>

            <td colspan="5"></td>

            <td class="text-end">${formatoCantidad(totalPTU, '')}</td>

            <td class="text-end">${formatoCantidad(totalTarjeta, 'text-danger')}</td>

            <td class="text-end text-success">${formatoCantidad(totalNeto, '')}</td>

            <td class="text-end">${formatoCantidad(totalRedondeo, '')}</td>

            <td class="text-end text-success">${formatoCantidad(totalNetoRedondeado, '')}</td>
        </tr>
        `;

        tbody.append(filaTotal);
    }


    // RENDIZAR LA PAGINACION
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

    // Botón Inicio
    if (paginaActual > 1) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(1); return false;"><i class="bi bi-chevron-double-left me-1"></i>Inicio</a>
            </li>
        `);
    }

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

    // Botón Final
    if (paginaActual < totalPaginas) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(${totalPaginas}); return false;">Final <i class="bi bi-chevron-double-right ms-1"></i></a>
            </li>
        `);
    }
}

/**
 * Cambiar a una página específica
 */
function cambiarPagina(nuevaPagina) {
    $('#pagina-actual').data('pagina', nuevaPagina);
    llenar_tabla_ptu();
    window.scrollTo(0, 0);
}

/**
 * =================================================================================================
 * EVENTOS Y FUNCIONES AUXILIARES PARA LA INTERFAZ DE CONFIGURACIÓN DE PTU
 * =================================================================================================
 */

/**
 * Función para formatear una cantidad como moneda, con el formato adecuado según si es positiva, negativa o cero, y aplicando la clase de color correspondiente.
 * @param {Number} cantidad La cantidad a formatear, puede ser positiva, negativa o cero 
 * @param {String} color puede ser 'text-success' para positivo, 'text-danger' para negativo o 'text-secondary' o 'text-muted' para cero
 * @returns 
 */
function formatoCantidad(cantidad, color) {
    let contenido;
    let clase = color;

    if (cantidad === null || cantidad === 0) {
        contenido = '-';
    } else if (cantidad < 0) {
        contenido = `- $ ${Math.abs(cantidad).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        clase = "text-danger"; // fuerza la clase para negativos
    } else {
        contenido = `$ ${cantidad.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    return `<span class="${clase}">${contenido}</span>`;
}

/**
 * Formatea una fecha en el formato dd/MMM/yyyy
 * @param {String} fechaStr La fecha en formato string
 * @returns {String} La fecha formateada
 */
function formatearFecha(fechaStr) {
    // Array de meses abreviados en español
    const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

    // Separar la cadena YYYY-MM-DD
    const [anio, mes, dia] = fechaStr.split("-");

    // Convertir a número para indexar el mes
    const mesAbrev = meses[parseInt(mes, 10) - 1];

    return `${dia}/${mesAbrev}/${anio}`;
}


/**
 * Evento para habilitar o deshabilitar el input de salario manual según la opción seleccionada en los radios de salario.
 */
$(document).on('change', '.radio-salario', function (e) {
    console.log("Esto es una prueba");
    const row = $(this).closest('tr');
    const isManual = $(this).val() === 'manual';
    row.find('.input-salario-manual').prop('disabled', !isManual);
    if (!isManual) row.find('.input-salario-manual').val('');
});


/**
 * ===================================================================================================
 * EVENTOS PARA ACTUALIZAR LA TABLA CUANDO SE HAGA CAMBIOS EN LOS FILTROS
 * ===================================================================================================
 */

/**
 * Eventos de control
 */
/**
 * Configurar eventos de filtrado
 */
$(document).ready(function () {
    // Evento de búsqueda
    $('#busqueda').on('keyup', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_tabla_ptu();
    });

    // Evento de filtro departamento
    $('#id_departamento').on('change', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_tabla_ptu();
    });

    // Evento de filtro empresa
    $('#id_empresa').on('change', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_tabla_ptu();
    });

    // Evento de límite por página
    $('#limite').on('change', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_tabla_ptu();
    });

    // Inicializar variable de página actual si no existe
    if (!$('#pagina-actual').length) {
        $('body').append('<div id="pagina-actual" data-pagina="1" style="display:none;"></div>');
    }
});


/**
 * ==================================================================================================
 * FUNCIONALIDAD DE LOS BOTONES PARA MOSTRAR U OCULTAR LA TABLA PRINCIPAL
* ===================================================================================================
 */


/**
 * EVENTO PARA CERRAR LA TABLA PRINCIPAL Y MOSTRAR EL FORMULARIO DE CONFIGURACIÓN
 */
$('#btn_cerrar').click(function (e) {
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
 * EVENTO PARA GUARDAR LOS DATOS DE LA TABLA PRINCIPAL EN LA BASE DE DATOS
 */
$('#btn_guardar').click(function (e) {
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
                let json = getUtilidad();
                // Obtener el año del calculo desde el jsonUtilidad o usar el año actual si no está definido
                let anio = json.anio;

                $.ajax({
                    type: "POST",
                    url: "../php/utilidades.php",
                    data: {
                        anio: anio,
                        json: JSON.stringify(json),
                        accion: "guardar_utilidad"
                    },
                    dataType: "json",
                    success: function (response) {

                        alerta(response.icono, response.titulo, response.texto);

                    }
                });
            }, 1500);
        }
    });
});