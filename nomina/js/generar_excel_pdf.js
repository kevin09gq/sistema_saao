$('#btn_export_excel').on('click', function () {
    if (!jsonGlobal) {
        alert('No hay datos disponibles para exportar.');
        return;
    }

    //Verificar si hay sueldos negativos antes de exportar
    if (verificarSueldosNegativos()) {
      
        return; // Si hay sueldos negativos, no continuar con la exportación
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

    // Verificar si hay sueldos negativos antes de exportar
    if (verificarSueldosNegativos()) {
        return; // Si hay sueldos negativos, no continuar con la exportación
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

// Agregar event listener para el botón de reporte PDF
$('#btn_export_pdf_reporte').on('click', function () {
    if (!jsonGlobal) {
        alert('No hay datos disponibles para exportar.');
        return;
    }

    // Verificar si hay sueldos negativos antes de exportar
    if (verificarSueldosNegativos()) {
        return; // Si hay sueldos negativos, no continuar con la exportación
    }

    // Mostrar indicador de carga
    Swal.fire({
        title: 'Generando reporte...',
        text: 'Por favor espere mientras se genera el reporte PDF',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Obtener información de la nómina
    const tituloNomina = ($('#nombre_nomina').length ? $('#nombre_nomina').text() : '').trim();
    const numeroSemana = jsonGlobal.numero_semana || 'N/A';
    const fechaCierre = jsonGlobal.fecha_cierre || new Date().toLocaleDateString();

    const payload = {
        datos: jsonGlobal,
        tituloNomina: tituloNomina,
        numeroSemana: numeroSemana,
        fechaCierre: fechaCierre
    };

    $.ajax({
        url: '../php/generar_pdf_reporte.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        xhrFields: { responseType: 'blob' },
        success: async function (blob, textStatus, xhr) {
            // Cerrar indicador de carga
            Swal.close();

            // Verificar si es un error JSON
            if (xhr.getResponseHeader('content-type') === 'application/json') {
                const text = await blob.text();
                const errorData = JSON.parse(text);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error del servidor: ' + (errorData.error || 'Error desconocido')
                });
                return;
            }

            if (!(blob instanceof Blob) || blob.size === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se recibió un archivo PDF válido.'
                });
                return;
            }

            const partesFecha = fechaCierre.split('/');
            const anio = partesFecha[2] || new Date().getFullYear();
            const fileName = `Reporte_Nomina_Semana_${numeroSemana}_${anio}.pdf`;

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

                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'Reporte generado correctamente',
                        timer: 2000
                    });
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

            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Reporte descargado correctamente',
                timer: 2000
            });
        },
        error: function (xhr, textStatus, errorThrown) {
            // Cerrar indicador de carga
            Swal.close();

            let errorMessage = 'Error al generar el reporte PDF.';
            try {
                if (xhr.responseText) {
                    const errorData = JSON.parse(xhr.responseText);
                    errorMessage = errorData.error || errorMessage;
                }
            } catch (e) {
                errorMessage = `Error de conexión: ${textStatus}`;
            }

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    });
});

// Función para verificar si hay sueldos negativos en la nómina
function verificarSueldosNegativos() {
    if (!jsonGlobal || !jsonGlobal.departamentos) {
        return false;
    }

    let haySueldosNegativos = false;
    let mensajeError = '<strong>Se encontraron sueldos negativos en:</strong><br><br>';

    jsonGlobal.departamentos.forEach(depto => {
        const nombreDepto = (depto.nombre || '').toLowerCase();
        
        // Verificar solo departamentos que contengan "40 libras" o "sin seguro"
        if ((nombreDepto.includes('40 libras') || nombreDepto.includes('sin seguro')) && depto.empleados) {
            depto.empleados.forEach(empleado => {
                // Convertir sueldo_a_cobrar a número y verificar si es negativo
                const sueldoACobrar = parseFloat(empleado.sueldo_a_cobrar) || 0;
                
                if (sueldoACobrar < 0) {
                    haySueldosNegativos = true;
                  
                    mensajeError += `<strong>Empleado:</strong> ${empleado.nombre || empleado.nombre_completo || 'Sin nombre'}<br>`;
                    mensajeError += `<strong>Sueldo a cobrar:</strong> $${sueldoACobrar.toFixed(2)}<br><br>`;
                }
            });
        }
    });

    if (haySueldosNegativos) {
        Swal.fire({
            icon: 'error',
            title: 'Sueldos Negativos Detectados',
            html: mensajeError,
            confirmButtonText: 'Entendido'
        });
        return true;
    }

    return false;
}