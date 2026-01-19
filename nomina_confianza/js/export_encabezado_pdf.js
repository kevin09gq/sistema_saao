$(document).ready(function () {
    $('#btn_export_pdf_reporte').on('click', function () {
        // Datos necesarios para el reporte del PDF
        const datosEncabezado = {
            datos: jsonNominaConfianza, // Enviar el JSON completo de la nómina
            tituloNomina: $('#nombre_nomina').text() // Título opcional
        };

        // Enviar solicitud AJAX para generar y descargar el PDF
        $.ajax({
            url: '../php/generar_pdf_encabezado.php',
            type: 'POST',
            data: JSON.stringify(datosEncabezado),
            contentType: 'application/json',
            xhrFields: {
                responseType: 'blob' // Para manejar la respuesta como un archivo
            },
            success: function (response) {
                // Crear un enlace temporal para descargar el archivo
                const url = window.URL.createObjectURL(new Blob([response]));
                const a = document.createElement('a');
                a.href = url;
                a.download = 'reporte_nomina_administrativo.pdf';
                document.body.append(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            },
            error: function (xhr) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: xhr.responseJSON?.error || 'Ocurrió un error al generar el PDF.'
                });
            }
        });
    });
});