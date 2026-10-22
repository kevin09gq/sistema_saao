//====================================================
// VARIABLES GLOBALES DEL HISTORIAL
//====================================================

// datos del historial semanal
let datosHistorial = null;

$(document).ready(function () {
    exportarTotalesExcel();
});

//====================================================
// FUNCIÓN PARA CARGAR EL HISTORIAL SEMANAL
//====================================================

function cargarHistorialSemanal(anio) {

    // validar que se haya recibido el año
    if (!anio) {
        return;
    }

    // llamada ajax para obtener el historial semanal
    $.ajax({
        type: "POST",
        url: "../php/totalesNominas.php",
        data: {
            accion: "obtenerHistorialSemanal",
            anio: anio
        },
        dataType: "json",

        success: function (respuesta) {

            // validar si la respuesta fue exitosa
            if (respuesta.success) {

                // guardar los datos del historial
                datosHistorial = respuesta;

                // renderizar la tabla
                renderizarTablaHistorial(respuesta.historial);

            } else {

                // mostrar error si falló
                console.error(respuesta.mensaje);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: respuesta.mensaje
                });
            }
        },

        error: function (xhr, estado, error) {

            // mostrar error en consola
            console.error("error al obtener el historial semanal:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCIÓN PARA RENDERIZAR LA TABLA DE HISTORIAL
//====================================================

function renderizarTablaHistorial(historial) {

    // limpiar el tbody
    $('#tbody-historial-semanal').empty();

    // validar que haya datos
    if (historial.length === 0) {
        $('#tbody-historial-semanal').append(`
            <tr>
                <td colspan="11" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                    No hay datos de historial para el año seleccionado.
                </td>
            </tr>
        `);
        return;
    }

    // recorrer cada semana y crear la fila
    historial.forEach(function (semana) {

        // calcular las clases para el cambio
        let claseCambio = '';
        let iconoCambio = '';
        
        if (semana.cambio > 0) {
            claseCambio = 'bg-success text-white';
            iconoCambio = 'bi-arrow-up';
        } else if (semana.cambio < 0) {
            claseCambio = 'bg-danger text-white';
            iconoCambio = 'bi-arrow-down';
        } else {
            claseCambio = 'bg-secondary text-white';
            iconoCambio = 'bi-dash';
        }

        // formatear el cambio
        let cambioFormateado = formatearMonto(semana.cambio);
        let porcentajeFormateado = semana.porcentaje.toFixed(1) + '%';

        // crear la fila de la semana con todas las nóminas
        $('#tbody-historial-semanal').append(`
            <tr>
                <td class="fw-semibold">Semana ${semana.numero_semana}</td>
                <td class="text-end">${formatearMonto(semana['40lbs'])}</td>
                <td class="text-end">${formatearMonto(semana['40lbs_jornal'])}</td>
                <td class="text-end">${formatearMonto(semana['10lbs'])}</td>
                <td class="text-end">${formatearMonto(semana['confianza'])}</td>
                <td class="text-end">${formatearMonto(semana['relicario'])}</td>
                <td class="text-end">${formatearMonto(semana['pilar'])}</td>
                <td class="text-end">${formatearMonto(semana['huasteca'])}</td>
                <td class="text-end">${formatearMonto(semana['palmilla'])}</td>
                <td class="text-end fw-bold" style="background-color: var(--light-green); color: var(--primary-green);">${formatearMonto(semana.total_semana)}</td>
                <td class="text-center">
                    <span class="badge ${claseCambio}">
                        <i class="bi ${iconoCambio} me-1"></i>
                        ${cambioFormateado}
                    </span>
                </td>
                <td class="text-center">
                    <span class="badge ${claseCambio}">
                        ${porcentajeFormateado}
                    </span>
                </td>
            </tr>
        `);
    });

    // actualizar el contador de semanas
    $('#badge-contador-semanas').text(`${historial.length} semanas`);
}



//====================================================
// FUNCIÓN PARA ACTUALIZAR EL HISTORIAL AL CAMBIAR DE AÑO
//====================================================

function actualizarHistorialSemanal(anio) {
    cargarHistorialSemanal(anio);
}

//====================================================
// EXPORTAR EXCEL DE TOTALES DE NÓMINA POR AÑO
//====================================================

function exportarTotalesExcel() {
    $(document).on("click", "#btn_exportar_totales_excel", function () {

    var anio = $("#select_anio").val();

    if (!anio) {
        Swal.fire({
            icon: "warning",
            title: "Año no seleccionado",
            text: "Por favor seleccione un año para exportar los totales de nómina."
        });
        return;
    }

    Swal.fire({
        title: "Generando Excel de Totales...",
        text: "Procesando departamentos y nóminas del año " + anio + ", por favor espere.",
        allowOutsideClick: false,
        didOpen: function () {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: "../php/exportarTotalesNominas/exportarTotalesExcel.php",
        type: "POST",
        xhrFields: {
            responseType: 'blob'
        },
        data: {
            accion: "exportarTotalesExcel",
            anio: anio
        },
        success: function (blob, status, xhr) {
            Swal.close();

            // Obtener el nombre del archivo del header Content-Disposition
            var filename = 'Totales_Nominas.xlsx';
            var disposition = xhr.getResponseHeader('Content-Disposition');
            if (disposition && disposition.indexOf('filename=') !== -1) {
                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            // Crear un enlace temporal para descargar el archivo
            var link = document.createElement('a');
            var url = window.URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            Swal.fire({
                icon: "success",
                title: "¡Archivo generado con éxito!",
                text: "Descarga iniciada correctamente.",
                timer: 2000,
                showConfirmButton: false
            });
        },
        error: function (xhr, estado, error) {
            Swal.close();
            console.error("Error al exportar totales a excel:", error, xhr.responseText);
            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: "No se pudo comunicar con el servidor para exportar el archivo."
            });
        }
    });
});

}

