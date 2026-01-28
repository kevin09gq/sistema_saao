// Manejador para descargar el PDF al hacer clic en el botón
$(document).ready(function() {
    $('#btn_ticket_pdf').on('click', function() {
        // Verificar que existe la nómina
        if (typeof jsonGlobal === 'undefined' || !jsonGlobal) {
            alert('No hay datos de nómina para generar el PDF.');
            return;
        }

        // Detectar si la vista activa es "sin seguro"
        var vistaSinSeguroActiva = !$('#tabla-sin-seguro-container').attr('hidden') && 
                                   $('#tabla-sin-seguro-container').is(':visible');
        
        var datosEnviar = {};
        var nombreArchivoDefault = 'tickets_zebra.pdf';
        
        if (vistaSinSeguroActiva) {
            // Si estamos en la vista de empleados sin seguro, usar solo esos empleados
            var empleadosSinSeguro = (typeof empleadosSinSeguroPaginados !== 'undefined') ? empleadosSinSeguroPaginados : [];
            
            if (empleadosSinSeguro.length === 0) {
                alert('No hay empleados sin seguro para generar tickets.');
                return;
            }
            
            nombreArchivoDefault = 'tickets_sin_seguro.pdf';
            
            // Crear un objeto con la estructura esperada por el backend
            datosEnviar = {
                nomina: {
                    numero_semana: jsonGlobal.numero_semana || '',
                    departamentos: [{
                        nombre: 'SIN SEGURO',
                        empleados: empleadosSinSeguro
                    }]
                },
                departamento_filtrado: null,
                solo_sin_seguro: true
            };
        } else {
            // Vista normal: usar todos los empleados con el filtro de departamento
            var departamentoFiltrado = $('#departamentos-nomina').val() || null;
            datosEnviar = { 
                nomina: jsonGlobal,
                departamento_filtrado: departamentoFiltrado,
                solo_sin_seguro: false
            };
        }

        // Desactivar el botón mientras se procesa
        $(this).prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Generando...');

        // Enviar datos por AJAX
        $.ajax({
            url: '../php/descargar_ticket_pdf.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datosEnviar),
            xhrFields: {
                responseType: 'blob'
            },
            success: function(blob, status, xhr) {
                // Validar que la respuesta sea un Blob válido
                if (!(blob instanceof Blob)) {
                    console.error('Respuesta no válida: no es un Blob');
                    alert('Error: El servidor no devolvió un archivo PDF válido.');
                    $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-receipt"></i> Ticket Zebra');
                    return;
                }
            
                // Verificar que el Blob tenga contenido
                if (blob.size === 0) {
                    console.error('Blob vacío recibido');
                    alert('Error: Archivo PDF vacío.');
                    $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-receipt"></i> Ticket Zebra');
                    return;
                }
            
                // Obtener el nombre del archivo desde el header o usar uno por defecto
                var filename = nombreArchivoDefault;
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('filename=') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/["']/g, '');
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
                $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-receipt"></i> Ticket Zebra');
            },
            error: function(xhr, status, error) {
                console.error('Error al generar PDF:', error);
                alert('Error al generar el PDF. Por favor, intenta nuevamente.');
                // Reactivar el botón
                $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-receipt"></i> Ticket Zebra');
            }
        });
    });
});
