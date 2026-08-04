// MODAL DE LOS DETALLES
const modal_detalles = new bootstrap.Modal(document.getElementById('modal_detalles'));

// EVENTO: ABRIR EL MODAL DE LOS DETALLES
$(document).on('click', '.btn_ver_detalles', function (e) {
    e.preventDefault();

    // Obtener los datos del botón
    const anio = $(this).data('anio');
    const departamento = $(this).data('departamento');
    const id_departamento = $(this).data('iddepartamento');
    const id_utilidad = $(this).data('id_utilidad');
    const empleados = $(this).data('empleados');
    const fecha_creacion = $(this).data('fecha_creacion');

    $('#detalle_empleados').val('');
    $('#detalle_anio').val('');
    $('#detalle_id_departamento').val('');
    $('#detalle_nombre_departamento').val('');

    // LLENAR EL INPUT DE EMPLEADOS
    $('#detalle_empleados').val(JSON.stringify(empleados));
    $('#detalle_anio').val(anio);
    $('#detalle_id_departamento').val(id_departamento);
    $('#detalle_nombre_departamento').val(departamento);

    // PONER UN TITULO DEL MODAL
    $('#titulo_modal').text(anio + ' ' + departamento.toUpperCase());

    // LLENAR SELECT DE DEPARTAMENTO
    $('#detalle_departamento').empty();
    $('#detalle_departamento').html('<option value="' + id_departamento + '">' + departamento + '</option>');

    // LLENAR LA TABLA DE DETALLES
    llenar_tabla_detalles(empleados);

    // PONER LA FECHA DE REGISTRO
    $('#fecha_registro_modal').text(formatearFecha(fecha_creacion));

    modal_detalles.show();
});


/**
 * Función para obtener las empresas
 */
function obtener_empresas() {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerEmpresas.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
            // VAIAR EL SELECT DE EMPRESAS
            const selectEmpresa = $('#detalle_empresa');
            selectEmpresa.empty();
            data.forEach(element => {
                selectEmpresa.append('<option value="' + element.id_empresa + '">' + element.nombre_empresa + '</option>');
            });
        },
        error: function () {
            console.error("Error al cargar empresas");
        }
    });
}

/**
 * Llena la tabla de detalles con los empleados filtrados
 * @param {Array} empleados Empleados a mostrar en la tabla
 */
function llenar_tabla_detalles(empleados) {
    // RECUPERAR LOS FILTROS PARA FILTRAR LOS EMPLEADOS
    const departamentoSeleccionado = $('#detalle_departamento').val();
    const empresaSeleccionada = $('#detalle_empresa').val();
    const textoBusqueda = $('#detalle_busqueda').val();

    // Filtrar empleados
    let empleadosFiltrados = empleados.filter(emp => {
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
        const esVisible = emp.visible === true;

        return coincideBusqueda && coincideDepartamento && coincideEmpresa && esVisible;
    });

    // VACIAR LA TABLA
    $("#cuerpo_tabla_detalles").empty();
    if (empleadosFiltrados.length === 0) {
        $("#cuerpo_tabla_detalles").append('<tr><td colspan="13" class="text-center">No se encontraron empleados</td></tr>');
    }

    // RECORRER LOS EMPLEADOS FILTRADOS Y AGREGARLOS A LA TABLA
    empleadosFiltrados.forEach((empleado, index) => {
        const fila = `
        <tr>
            <td class="fw-bold">${index + 1}</td>
            <td class="text-center">${empleado.clave_empleado}</td>
            <td>${empleado.nombre} ${empleado.ap_paterno} ${empleado.ap_materno}</td>
            <td>${empleado.nombre_puesto ?? '-'}</td>
            <td>${formatoMonedaVisual(empleado.salario_diario)}</td>
            <td class="text-center">${empleado.dias_ptu > 7 ? Math.round(empleado.dias_ptu) : empleado.dias_ptu}</td>
            <td>${formatoMonedaVisual(empleado.ptu)}</td>
            <td>${formatoMonedaVisual(empleado.tarjeta)}</td>
            <td>${formatoMonedaVisual(empleado.neto_pagar)}</td>
            <td>${formatoMonedaVisual(empleado.redondeo)}</td>
            <td>${formatoMonedaVisual(empleado.neto_pagar_redondeado)}</td>
        </tr>
        `;

        $("#cuerpo_tabla_detalles").append(fila);
    });
}



/**
 * Configurar eventos de filtrado
 */
$(document).ready(function () {
    // Evento de búsqueda
    $('#detalle_busqueda').on('keyup', function () {
        let empleados = $('#detalle_empleados').val();
        if (empleados) {
            empleados = JSON.parse(empleados);
        }
        llenar_tabla_detalles(empleados);
    });

    // Evento de filtro departamento
    $('#detalle_departamento').on('change', function () {
        let empleados = $('#detalle_empleados').val();
        if (empleados) {
            empleados = JSON.parse(empleados);
        }
        llenar_tabla_detalles(empleados);
    });

    // Evento de filtro empresa
    $('#detalle_empresa').on('change', function () {
        let empleados = $('#detalle_empleados').val();
        if (empleados) {
            empleados = JSON.parse(empleados);
        }
        llenar_tabla_detalles(empleados);
    });
});



/**
 * Evento para generar el reporte Excel de utilidades (PTU)
 */
$(document).on('click', '#btn_generar_excel_detalles', function (e) {
    e.preventDefault();

    // OBTENER EL JSON DE UTILIDAD DESDE EL STORAGE
    let empleados = $('#detalle_empleados').val();

    // VALIDAR SI EL JSON DE UTILIDAD EXISTE
    if (!empleados) {
        alerta('Sin datos para exportar', 'No se ha encontrado información de utilidades. Por favor, asegúrate de haber cargado los datos correctamente.', 'warning');
        return;
    }

    // Obtener el año seleccionado por el usuario
    const anio = $('#detalle_anio').val();;
    const id_departamento = $('#detalle_id_departamento').val();
    const nombre_departamento = $('#detalle_nombre_departamento').val();
    // Obtener los departamentos seleccionados
    let departamentosSeleccionados = [];
    // Agregar el departamento seleccionado al array con su id y nombre
    departamentosSeleccionados.push({
        id_departamento: id_departamento,
        nombre_departamento: nombre_departamento
    });

    // Validar que se haya seleccionado al menos un departamento
    if (departamentosSeleccionados.length == 0) {
        alerta('info', 'Departamentos no seleccionados', 'Por favor, selecciona al menos un departamento para generar el reporte.');
        return;
    }

    // Obtener la empresa
    let empresaSeleccionada = $('#detalle_empresa').val();

    // estructura
    let json = {
        anio: anio,
        empleados: JSON.parse(empleados),
        id_departamento: id_departamento,
    };

    // Mostrar alerta de carga
    Swal.fire({
        title: 'Generando documento...',
        html: 'Por favor espera mientras se genera el archivo Excel.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: (modal) => {
            Swal.showLoading();
        }
    });

    // Enviar el jsonUtilidad al servidor PHP mediante POST
    $.ajax({
        url: '../php/exportar_excel.php',
        type: 'POST',
        data: {
            jsonUtilidad: JSON.stringify(json),
            anio: anio,
            departamentos: JSON.stringify(departamentosSeleccionados),
            empresa: empresaSeleccionada
        },
        xhrFields: {
            responseType: 'blob'
        },
        success: function (blob) {
            // Cerrar la alerta de carga
            Swal.close();

            // Crear un blob y descargar el archivo
            var link = document.createElement('a');
            var url = URL.createObjectURL(blob);
            // Generar un timestamp para el nombre del archivo
            var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
            // Determinar el nombre de la empresa para el nombre del archivo
            var nombre_empresa = empresaSeleccionada == 1 ? 'CITRICOS_SAAO' : 'SB_CITRICS_GROUP';
            link.href = url;
            // Establecer el nombre del archivo con el formato: REPORTE_AGUINALDOS_AÑO_EMPRESA_TIMESTAMP.xlsx
            link.download = 'REPORTE_PTU_' + anio + '_' + nombre_empresa + '_' + timestamp + '.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },
        error: function (xhr, status, error) {
            // Cerrar la alerta de carga
            Swal.close();

            console.error('Error al descargar el Excel:', error);
            alerta("error", "Error al generar reporte Excel", "Error al generar reporte Excel: " + error);
        }
    });
});