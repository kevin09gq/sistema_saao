// Generar y descargar Excel con los datos del reloj
function generarReporteExcel(datos) {
    if (!datos) {
        alert('No hay datos disponibles para generar el Excel.');
        return;
    }

    // Mostrar mensaje de carga
    Swal.fire({
        title: 'Generando Excel...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Usar XMLHttpRequest para manejar correctamente el blob
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '../php/generar_excel.php', true);
    xhr.responseType = 'blob';
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function() {
        Swal.close();

        if (xhr.status === 200) {
            const blob = xhr.response;
            
            // Verificar si la respuesta es un error JSON
            if (blob.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = function() {
                    try {
                        const error = JSON.parse(reader.result);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.error || 'Error desconocido al generar el Excel'
                        });
                    } catch (e) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error al procesar la respuesta del servidor'
                        });
                    }
                };
                reader.readAsText(blob);
                return;
            }
            
            // Crear un enlace temporal para descargar el archivo
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Nombre del archivo con fecha
            const fecha = new Date().toISOString().split('T')[0];
            const semana = datos.numero_semana || 'S/N';
            a.download = `Reporte_Reloj_Semana${semana}_${fecha}.xlsx`;
            
            document.body.appendChild(a);
            a.click();
            
            // Limpiar
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);
            
            Swal.fire({
                icon: 'success',
                title: '¡Excel generado!',
                text: 'El archivo se ha descargado correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            // Error del servidor
            const blob = xhr.response;
            const reader = new FileReader();
            reader.onload = function() {
                try {
                    const errorData = JSON.parse(reader.result);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorData.error || 'Error al generar el Excel'
                    });
                } catch (e) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo generar el archivo Excel. ' + reader.result
                    });
                }
            };
            reader.readAsText(blob);
        }
    };

    xhr.onerror = function() {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error de conexión al intentar generar el Excel'
        });
    };

    // Enviar datos
    const formData = 'datos=' + encodeURIComponent(JSON.stringify(datos));
    xhr.send(formData);
}
