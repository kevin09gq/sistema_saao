$(document).ready(function () {
    reporteNominaPdf();
});



function reporteNominaPdf() {
    $("#btn_export_pdf_reporte").click(async function (e) {
        e.preventDefault();
        // Validar que jsonNomina40lbs exista
        if (!jsonHistorialNomina) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }
        $.ajax({
            url: '../../php/exportarNomina/reporteNomina.php',
            type: 'POST',
            data: {
                numero_semana: jsonHistorialNomina.numero_semana || '',
                fecha_cierre: jsonHistorialNomina.fecha_cierre || '',
                fecha_inicio: jsonHistorialNomina.fecha_inicio || '',
                periodo_nomina: jsonHistorialNomina.periodo_nomina || '',
                jsonNomina: JSON.stringify(jsonHistorialNomina)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                // Descargar el PDF
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'REPORTE_NOMINA_40LBS_' + timestamp + '.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                console.error('Error al descargar el PDF:', error);
                alert('Error: No se pudo generar el archivo PDF.');
            }
        });
    });
}