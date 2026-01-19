// Manejador para descargar el PDF al hacer clic en el botón
$(document).ready(function() {
    $('#btn_ticket_pdf').on('click', function() {
        // Verificar que existe la nómina
        if (typeof jsonNominaConfianza === 'undefined' || !jsonNominaConfianza) {
            Swal.fire('Error', 'No hay datos de nómina para generar el PDF.', 'error');
            return;
        }

        // Desactivar el botón mientras se procesa
        $(this).prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Generando...');

        // Enviar datos por AJAX
        $.ajax({
            url: '../php/descargar_ticket_pdf.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
                nomina: jsonNominaConfianza
            }),
            xhrFields: {
                responseType: 'blob'
            },
            success: function(blob, status, xhr) {
                // Obtener el nombre del archivo desde el header o usar uno por defecto
                var filename = 'tickets_zebra.pdf';
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('filename=') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }

                // Crear URL temporal y descargar
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Reactivar el botón
                $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-printer"></i> Ticket Zebra');
            },
            error: function(xhr, status, error) {
                console.error('Error al generar PDF:', error);
                Swal.fire('Error', 'Error al generar el PDF. Por favor, intenta nuevamente.', 'error');
                // Reactivar el botón
                $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-printer"></i> Ticket Zebra');
            }
        });
    });
});
