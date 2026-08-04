//==================================================================================================
// EXPORTADOR DE HISTORIAL DE PRIMAS VACACIONALES A PDF
//==================================================================================================

function descargarPrimaVacacionalPDF(idEmpleado) {
    if (!idEmpleado) {
        Swal.fire({
            icon: 'warning',
            title: 'Error',
            text: 'ID de empleado no válido para exportar.'
        });
        return;
    }
    
    // Descargar el PDF directamente usando AJAX
    $.ajax({
        url: `../php/exportarArchivos/exportarPrimaVacacional.php?id_empleado=${idEmpleado}`,
        type: 'GET',
        xhrFields: {
            responseType: 'blob'
        },
        success: function (blob) {
            if (blob instanceof Blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `PrimaVacacional_${idEmpleado}.pdf`;
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
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al descargar el PDF. Por favor, intenta nuevamente.'
            });
        }
    });
}

//==================================================================================================
// EXPORTADOR DE DETALLE DE PRIMA VACACIONAL A EXCEL
//==================================================================================================

function exportarPrimaVacacionalExcel() {
    // Obtener el ID de la prima vacacional desde el modal
    const idPrimaEmpleado = document.getElementById('edit_id_prima_empleado').value;
    
    if (!idPrimaEmpleado) {
        Swal.fire({
            icon: 'warning',
            title: 'Error',
            text: 'No hay datos de prima vacacional para exportar.'
        });
        return;
    }
    
    // Abre el archivo PHP generador de Excel en otra pestaña
    window.open(`../php/exportarArchivos/exportarPrimaVacacionalExcel.php?id_prima_empleado=${idPrimaEmpleado}`, '_blank');
}
