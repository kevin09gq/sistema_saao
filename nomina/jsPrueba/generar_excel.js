$('#btn_export_excel').on('click', function () {
    if (!jsonGlobal) {
        alert('No hay datos disponibles para exportar.');
        return;
    }

    $.ajax({
        url: '../php/generar_excel.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(jsonGlobal),
        xhrFields: { responseType: 'blob' },
        success: function (blob) {
            if (!(blob instanceof Blob) || blob.size === 0) {
                alert('Error: no se recibió un archivo válido.');
                return;
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'produccion_40_libras.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        },
        error: function (xhr) {
            let errorMessage = 'Error al generar el archivo Excel.';
            if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMessage = xhr.responseJSON.error;
            }
            alert(errorMessage);
        }
    });
});
