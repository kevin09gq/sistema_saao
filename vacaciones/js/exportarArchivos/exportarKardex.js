//==================================================================================================
// CONTROLADOR PARA EXPORTAR EL REPORTE DE KARDEX EN PDF
//==================================================================================================

$(document).ready(function () {
    $('#btnExportarKardexPdf').on('click', function (e) {
        e.preventDefault();
        
        if (!empleadoActual || !empleadoActual.id_empleado) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'No hay información del empleado cargada para exportar.'
            });
            return;
        }
        
        // Descargar el PDF directamente usando AJAX
        const btn = $(this);
        const originalText = btn.html();
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Descargando...');
        
        $.ajax({
            url: `../php/exportarArchivos/exportarKardex.php?id_empleado=${empleadoActual.id_empleado}`,
            type: 'GET',
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                if (blob instanceof Blob && blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Kardex_${empleadoActual.nombre || 'Empleado'}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Descargado',
                        text: 'El Kardex se ha descargado correctamente.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo generar el PDF.'
                    });
                }
                btn.prop('disabled', false).html(originalText);
            },
            error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al descargar el PDF. Por favor, intenta nuevamente.'
                });
                btn.prop('disabled', false).html(originalText);
            }
        });
    });

    $('#btnExportarPrimaPdf').on('click', function (e) {
        e.preventDefault();
        
        if (!empleadoActual || !empleadoActual.id_empleado) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'No hay información del empleado cargada para exportar.'
            });
            return;
        }
        
        // Descargar el PDF directamente usando AJAX
        const btn = $(this);
        const originalText = btn.html();
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Descargando...');
        
        $.ajax({
            url: `../php/exportarArchivos/exportarPrimaVacacional.php?id_empleado=${empleadoActual.id_empleado}`,
            type: 'GET',
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                if (blob instanceof Blob && blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `PrimaVacacional_${empleadoActual.nombre || 'Empleado'}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Descargado',
                        text: 'La Prima Vacacional se ha descargado correctamente.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo generar el PDF.'
                    });
                }
                btn.prop('disabled', false).html(originalText);
            },
            error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al descargar el PDF. Por favor, intenta nuevamente.'
                });
                btn.prop('disabled', false).html(originalText);
            }
        });
    });
});
