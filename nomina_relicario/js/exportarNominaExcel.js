abrirModalExportarExcel();

exportarJornaleroBase();

function abrirModalExportarExcel() {
    $(document).on('click', '#btn_export_excel', function (e) {
        e.preventDefault();

        $('#modalExportarNomina').modal('show');
    });
}



function exportarJornaleroBase() {
    // Lógica para exportar la nómina de Jornalero Base 
    $("#btn-export-jornalero-base").click(function (e) { 
        e.preventDefault();
        
        // Validar que jsonNominaRelicario exista
        if (!jsonNominaRelicario) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }
        
        // Enviar el jsonNominaRelicario al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaJornaleroBase.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaRelicario)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                link.download = 'Nomina_Jornalero_Base_' + new Date().toISOString().slice(0,10) + '.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                console.error('Error al descargar el Excel:', error);
                alert('Error: No se pudo generar el archivo Excel.');
            }
        });
        
    });
}