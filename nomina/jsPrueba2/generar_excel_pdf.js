$('#btn_export_excel').on('click', function () {
    if (!jsonGlobal) {
        alert('No hay datos disponibles para exportar.');
        return;
    }

    const tituloNomina = ($('#nombre_nomina').length ? $('#nombre_nomina').text() : '').trim();
    const numeroSemana = jsonGlobal.numero_semana;
    const fechaCierre = jsonGlobal.fecha_cierre;
    const partesFecha = fechaCierre.split('/');
    const anio = partesFecha[2];
    const tituloExcel = `SEMANA ${numeroSemana}-${anio}`;

    const payload = {
        datos: jsonGlobal,
        tituloNomina: tituloNomina,
        tituloExcel: tituloExcel
    };

    $.ajax({
        url: '../php/generar_excel.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        xhrFields: { responseType: 'blob' },
        success: async function (blob) {
            if (!(blob instanceof Blob) || blob.size === 0) {
                alert('Error: no se recibió un archivo válido.');
                return;
            }

            const fileName = tituloExcel + '.xlsx';

            // Intentar siempre diálogo Guardar como (Chromium + https/localhost)
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{
                            description: 'Archivo Excel',
                            accept: {
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
                            }
                        }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    return;
                } catch (e) {
                    if (e.name === 'AbortError') return; // Canceló
                    // Si falla continua al fallback
                }
            }

            // Fallback: descarga directa (sin poder forzar el diálogo)
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName; // Sin esto algunos navegadores abrirían pestaña en blanco
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
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

// Agregar event listener para el botón PDF
$('#btn_export_pdf').on('click', function () {
    if (!jsonGlobal) {
        alert('No hay datos disponibles para exportar.');
        return;
    }

    const tituloNomina = ($('#nombre_nomina').length ? $('#nombre_nomina').text() : '').trim();
    const numeroSemana = jsonGlobal.numero_semana;
    const fechaCierre = jsonGlobal.fecha_cierre;
    const partesFecha = fechaCierre.split('/');
    const anio = partesFecha[2];
    const tituloExcel = `SEMANA ${numeroSemana}-${anio}`;

    const payload = {
        datos: jsonGlobal,
        tituloNomina: tituloNomina,
        tituloExcel: tituloExcel
    };

    $.ajax({
        url: '../php/generar_pdf.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        xhrFields: { responseType: 'blob' },
        success: async function (blob, textStatus, xhr) {
            // Verificar si es un error JSON
            if (xhr.getResponseHeader('content-type') === 'application/json') {
                const text = await blob.text();
                const errorData = JSON.parse(text);
                alert('Error del servidor: ' + (errorData.error || 'Error desconocido'));
                return;
            }

            if (!(blob instanceof Blob) || blob.size === 0) {
                alert('Error: no se recibió un archivo PDF válido.');
                return;
            }

            const fileName = tituloExcel + '.pdf';

            // Intentar diálogo Guardar como
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{
                            description: 'Archivo PDF',
                            accept: { 'application/pdf': ['.pdf'] }
                        }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    return;
                } catch (e) {
                    if (e.name === 'AbortError') return;
                }
            }

            // Fallback: descarga directa
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        },
        error: function (xhr, textStatus, errorThrown) {
            
            let errorMessage = 'Error al generar el archivo PDF.';
            try {
                if (xhr.responseText) {
                    const errorData = JSON.parse(xhr.responseText);
                    errorMessage = errorData.error || errorMessage;
                }
            } catch (e) {
                errorMessage = `Error de conexión: ${textStatus}`;
            }
            
            alert(errorMessage);
        }
    });
});

