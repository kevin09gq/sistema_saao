//====================================================
// VARIABLES GLOBALES DEL HISTORIAL
//====================================================

// datos del historial semanal
let datosHistorial = null;


//====================================================
// FUNCIÓN PARA CARGAR EL HISTORIAL SEMANAL
//====================================================

function cargarHistorialSemanal(anio) {

    // validar que se haya recibido el año
    if (!anio) {
        return;
    }

    // llamada ajax para obtener los datos
    $.ajax({
        type: "POST",
        url: "../php/infoHistorialSemanal.php",
        data: {
            accion: "obtenerHistorialSemanal",
            anio: anio
        },
        dataType: "json",

        success: function (respuesta) {

            // validar si la respuesta fue exitosa
            if (respuesta.success) {

                // guardar los datos
                datosHistorial = respuesta;

                // renderizar la tabla
                renderizarHistorialSemanal(respuesta);

            } else {

                // mostrar error si falló
                console.error(respuesta.mensaje);
                $('#tbody-historial-semanal').html(`
                    <tr>
                        <td colspan="7" class="text-center py-4 text-danger">
                            <i class="bi bi-exclamation-circle me-2"></i>
                            ${respuesta.mensaje}
                        </td>
                    </tr>
                `);
                $('#badge-contador-semanas').text('0 semanas');
            }
        },

        error: function (xhr, estado, error) {

            // mostrar error en consola
            console.error("error al obtener historial semanal:", error);
            console.error(xhr.responseText);

            $('#tbody-historial-semanal').html(`
                <tr>
                    <td colspan="7" class="text-center py-4 text-danger">
                        <i class="bi bi-exclamation-circle me-2"></i>
                        Error al cargar el historial
                    </td>
                </tr>
            `);
        }
    });
}


//====================================================
// FUNCIÓN PARA RENDERIZAR LA TABLA DE HISTORIAL
//====================================================

function renderizarHistorialSemanal(datos) {

    // actualizar contador de semanas
    $('#badge-contador-semanas').text(datos.semanas.length + ' semanas');

    // limpiar tbody
    $('#tbody-historial-semanal').empty();

    // recorrer las semanas y agregar filas
    datos.semanas.forEach(function (semana) {

        // formatear montos
        let totalPercepciones = formatearMonto(semana.total_percepciones);
        let totalDeducciones = formatearMonto(semana.total_deducciones);
        let totalNeto = formatearMonto(semana.total_neto);

        // calcular cambio vs anterior
        let htmlCambioDinero = '';
        let htmlCambioPorcentaje = '';

        if (semana.numero_semana === 1) {
            // primera semana
            htmlCambioDinero = '<span class="text-muted">-</span>';
            htmlCambioPorcentaje = '<span class="text-muted">-</span>';
        } else {
            let cambioDinero = semana.cambio_dinero;
            let cambioPorcentaje = semana.cambio_porcentaje;

            // cambio en dinero
            if (cambioDinero > 0) {
                htmlCambioDinero = `
                    <span class="text-success fw-semibold">
                        <i class="bi bi-arrow-up-circle me-1"></i>
                        +${formatearMonto(cambioDinero)}
                    </span>
                `;
            } else if (cambioDinero < 0) {
                htmlCambioDinero = `
                    <span class="text-danger fw-semibold">
                        <i class="bi bi-arrow-down-circle me-1"></i>
                        ${formatearMonto(cambioDinero)}
                    </span>
                `;
            } else {
                htmlCambioDinero = '<span class="text-muted">0.00</span>';
            }

            // cambio en porcentaje
            if (cambioPorcentaje > 0) {
                htmlCambioPorcentaje = `
                    <span class="text-success fw-semibold">
                        +${cambioPorcentaje.toFixed(1)}%
                    </span>
                `;
            } else if (cambioPorcentaje < 0) {
                htmlCambioPorcentaje = `
                    <span class="text-danger fw-semibold">
                        ${cambioPorcentaje.toFixed(1)}%
                    </span>
                `;
            } else {
                htmlCambioPorcentaje = '<span class="text-muted">0.0%</span>';
            }
        }

        // agregar fila a la tabla
        $('#tbody-historial-semanal').append(`
            <tr>
                <td class="py-3 px-3 fw-bold">Semana ${semana.numero_semana}</td>
                <td class="py-3 text-end"><span class="chip-10lbs">10 Lbs</span></td>
                <td class="py-3 text-end">${totalPercepciones}</td>
                <td class="py-3 text-end">${totalDeducciones}</td>
                <td class="py-3 text-end fw-bold" style="background-color: var(--light-green); color: var(--primary-green);">${totalNeto}</td>
                <td class="py-3 text-center">${htmlCambioDinero}</td>
                <td class="py-3 text-center">${htmlCambioPorcentaje}</td>
            </tr>
        `);
    });
}


//====================================================
// FUNCIÓN PARA FORMATEAR MONTOS
//====================================================

function formatearMonto(monto) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(monto || 0);
}


//====================================================
// FUNCIÓN PARA ACTUALIZAR EL HISTORIAL AL CAMBIAR DE AÑO
//====================================================

function actualizarHistorialSemanal(anio) {
    cargarHistorialSemanal(anio);
}
