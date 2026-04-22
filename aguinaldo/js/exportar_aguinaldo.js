
// Evemtp ára abrir el modal de exportación
$('#btn_exportar_excel').click(function (e) {
    e.preventDefault();
    modal_reporte_excel.show();
});


/**
 * Evento para seleccionar todos los departamentos en el modal de exportación
 */
$(document).on('click', '#btn_seleccionar_todo', function (e) {
    e.preventDefault();
    // Hacer un checked a todos los checkboxes de departamentos
    $('#contenedor_lista_deptamentos input[type="checkbox"]').prop('checked', true);
});


/**
 * Evento para deseleccionar todos los departamentos en el modal de exportación
 */
$(document).on('click', '#btn_deseleccionar_todo', function (e) {
    e.preventDefault();
    // Hacer un checked a todos los checkboxes de departamentos
    $('#contenedor_lista_deptamentos input[type="checkbox"]').prop('checked', false);
});


/**
 * Evento para generar el reporte Excel del aguinaldo
 */
$(document).on('click', '#btn_generar_reporte', function (e) {
    e.preventDefault();

    if (!jsonAguinaldo) {
        alerta('Sin datos para exportar', 'No se ha encontrado información del aguinaldo. Por favor, asegúrate de haber cargado los datos correctamente.', 'warning');
        return;
    }

    // Obtener el año seleccionado por el usuario
    const anio = $('#anio').val();
    // Obtener los departamentos seleccionados
    let departamentosSeleccionados = [];
    // Recorrer los checkboxes de departamentos seleccionados y agregar su información al array
    $('#contenedor_lista_deptamentos input[type="checkbox"]:checked').each(function () {
        // Agregar el departamento seleccionado al array con su id y nombre
        departamentosSeleccionados.push({
            id_departamento: $(this).data('id'),
            nombre_departamento: $(this).data('nombre')
        });
    });

    // Validar que se haya seleccionado al menos un departamento
    if (departamentosSeleccionados.length == 0) {
        alerta('Sin departamentos seleccionados', 'Por favor, selecciona al menos un departamento para generar el reporte.', 'warning');
        return;
    }

    // Obtener la empresa
    let empresaSeleccionada = $('input[name="radio_empresa"]:checked').val();

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

    // Enviar el jsonAguinaldo al servidor PHP mediante POST
    $.ajax({
        url: '../php/exportar_excel.php',
        type: 'POST',
        data: {
            jsonAguinaldo: JSON.stringify(jsonAguinaldo),
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
            link.download = 'REPORTE_AGUINALDOS_' + anio + '_' + nombre_empresa + '_' + timestamp + '.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },
        error: function (xhr, status, error) {
            // Cerrar la alerta de carga
            Swal.close();

            console.error('Error al descargar el Excel:', error);
            alerta("Se ha producido un error", "Error al generar reporte Excel: " + error, "error");
        }
    });


});