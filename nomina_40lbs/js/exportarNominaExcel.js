abrirModalExportarExcel();
exportar40lbsSss();
exportar40lbsCss();
exportar10lbsSss();
exportar10lbsCss();
nominaCompleta();
reporteNominaPdf();
exportarDispersionTarjeta();

function abrirModalExportarExcel() {
    $(document).on('click', '#btn_export_excel', function (e) {
        e.preventDefault();

        $('#modalExportarNomina').modal('show');
    });
}

function exportar40lbsCss() {
    // Lógica para exportar la nómina de Jornalero Base 
    $("#btn-export-40lbs-css").click(async function (e) {
        e.preventDefault();

        // Validar que jsonNomina40lbs exista
        if (!jsonNomina40lbs) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (await validarEmpleadosNegativos()) return;

        // Mostrar alerta de carga
        Swal.fire({
            title: 'Generando documento...',
            html: 'Por favor espera mientras se genera el archivo Excel.',
            icon: 'info',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: (modal) => {
                Swal.showLoading();
            }
        });

        // Enviar el jsonNomina40lbs al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNomina40lbsCss.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNomina40lbs)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                Swal.close();
                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonNomina40lbs.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNomina40lbs.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' - 40 LIBRAS CSS - ' + timestamp + '.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                Swal.close();
                console.error('Error al descargar el Excel:', error);
                alert('Error: No se pudo generar el archivo Excel.');
            }
        });

    });
}


function exportar40lbsSss() {
    // Lógica para exportar la nómina de Jornalero Base 
    $("#btn-export-40lbs-sss").click(async function (e) {
        e.preventDefault();

        // Validar que jsonNomina40lbs exista
        if (!jsonNomina40lbs) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (await validarEmpleadosNegativos()) return;

        // Mostrar alerta de carga
        Swal.fire({
            title: 'Generando documento...',
            html: 'Por favor espera mientras se genera el archivo Excel.',
            icon: 'info',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: (modal) => {
                Swal.showLoading();
            }
        });

        // Enviar el jsonNomina40lbs al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNomina40lbsSss.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNomina40lbs)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                Swal.close();
                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonNomina40lbs.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNomina40lbs.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' - 40 LIBRAS SSS - ' + timestamp + '.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                Swal.close();
                console.error('Error al descargar el Excel:', error);
                alert('Error: No se pudo generar el archivo Excel.');
            }
        });

    });
}

function exportar10lbsCss() {
    // Lógica para exportar la nómina de Jornalero Base 
    $("#btn-export-10lbs-css").click(async function (e) {
        e.preventDefault();

        // Validar que jsonNomina40lbs exista
        if (!jsonNomina40lbs) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (await validarEmpleadosNegativos()) return;

        // Mostrar alerta de carga
        Swal.fire({
            title: 'Generando documento...',
            html: 'Por favor espera mientras se genera el archivo Excel.',
            icon: 'info',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: (modal) => {
                Swal.showLoading();
            }
        });

        // Enviar el jsonNomina40lbs al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNomina10lbsCss.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNomina40lbs)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                Swal.close();
                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonNomina40lbs.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNomina40lbs.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' - 10 LIBRAS CSS - ' + timestamp + '.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                Swal.close();
                console.error('Error al descargar el Excel:', error);
                alert('Error: No se pudo generar el archivo Excel.');
            }
        });

    });
}


function exportar10lbsSss() {
    // Lógica para exportar la nómina de Jornalero Base 
    $("#btn-export-10lbs-sss").click(async function (e) {
        e.preventDefault();

        // Validar que jsonNomina40lbs exista
        if (!jsonNomina40lbs) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (await validarEmpleadosNegativos()) return;

        // Mostrar alerta de carga
        Swal.fire({
            title: 'Generando documento...',
            html: 'Por favor espera mientras se genera el archivo Excel.',
            icon: 'info',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: (modal) => {
                Swal.showLoading();
            }
        });

        // Enviar el jsonNomina40lbs al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNomina10lbsSss.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNomina40lbs)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                Swal.close();
                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonNomina40lbs.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNomina40lbs.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' - 10 LIBRAS SSS - ' + timestamp + '.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                Swal.close();
                console.error('Error al descargar el Excel:', error);
                alert('Error: No se pudo generar el archivo Excel.');
            }
        });

    });
}


function nominaCompleta() {
    // Lógica para exportar todas las nóminas en un mismo archivo con diferentes hojas
    $("#btn-export-nomina-completa").click(async function (e) {
        e.preventDefault();
        // Validar que jsonNomina40lbs exista
        if (!jsonNomina40lbs) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }
        if (await validarEmpleadosNegativos()) return;

        // Mostrar alerta de carga
        Swal.fire({
            title: 'Generando documento...',
            html: 'Por favor espera mientras se genera el archivo Excel.',
            icon: 'info',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: (modal) => {
                Swal.showLoading();
            }
        });

        // Enviar el jsonNomina40lbs al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaCompleta.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNomina40lbs)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                Swal.close();
                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonNomina40lbs.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNomina40lbs.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' - 40 LIBRAS - ' + timestamp + '.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                Swal.close();
                console.error('Error al descargar el Excel:', error);
                alert('Error: No se pudo generar el archivo Excel.');
            }
        });

    });
}

function reporteNominaPdf() {
    $("#btn_export_pdf_reporte").click(async function (e) {
        e.preventDefault();
        // Validar que jsonNomina40lbs exista
        if (!jsonNomina40lbs) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (await validarEmpleadosNegativos()) return;
        $.ajax({
            url: '../php/exportarNomina/reporteNomina.php',
            type: 'POST',
            data: {
                numero_semana: jsonNomina40lbs.numero_semana || '',
                fecha_cierre: jsonNomina40lbs.fecha_cierre || '',
                fecha_inicio: jsonNomina40lbs.fecha_inicio || '',
                periodo_nomina: jsonNomina40lbs.periodo_nomina || '',
                jsonNomina: JSON.stringify(jsonNomina40lbs)
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






async function validarEmpleadosNegativos() {
    if (!jsonNomina40lbs || !jsonNomina40lbs.departamentos) return false;

    let negativos40lbs = [];
    let negativos10lbs = [];

    jsonNomina40lbs.departamentos.forEach(depto => {
        depto.empleados.forEach(emp => {
            if (emp.mostrar === true && Number(emp.total_cobrar) < 0) {
                // El ID 5 corresponde a Producción 10 Lbs
                if (emp.id_departamento == 5) {
                    negativos10lbs.push(emp.nombre);
                } else {
                    negativos40lbs.push(emp.nombre);
                }
            }
        });
    });

    // CASO 1: Hay negativos en 40lbs u otros (BLOQUEO)
    if (negativos40lbs.length > 0) {
        await Swal.fire({
            icon: 'error',
            title: 'No se puede exportar la nómina',
            html: `
                <b>Existen empleados de 40 Lbs u otros con saldo negativo.</b><br><br>
                Corrige la nómina antes de descargar cualquier archivo.<br><br>
                <b>Empleados afectados:</b><br>
                ${negativos40lbs.join('<br>')}
            `,
            confirmButtonText: 'Entendido'
        });
        return true; // bloquear descarga
    }

    // CASO 2: SOLO hay negativos en 10lbs (ADVERTENCIA Y CONFIRMACIÓN)
    if (negativos10lbs.length > 0) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Atención: Saldos negativos en 10 Lbs',
            html: `
                Existen empleados en el departamento de 10 Libras con sueldo negativo.<br><br>
                <b>¿Deseas descargar el archivo de todos modos o prefieres revisar antes?</b><br><br>
                <b>Afectados:</b><br>
                ${negativos10lbs.join('<br>')}
            `,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, descargar de todos modos',
            cancelButtonText: 'No, cancelar y revisar'
        });

        // Si el usuario confirma descarga (isConfirmed === true), retornamos false para NO bloquearla.
        // Si el usuario cancela (isConfirmed === false), retornamos true para bloquearla.
        return !result.isConfirmed;
    }

    return false; // permitir descarga (todo normal)
}


function exportarDispersionTarjeta() {
    $("#btn-export-dispersion-tarjeta").click(function (e) {
        e.preventDefault();

        if (!jsonNomina40lbs) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        Swal.fire({
            title: 'Generando Dispersión...',
            html: 'Por favor espera mientras se genera el archivo Excel.',
            icon: 'info',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        $.ajax({
            url: '../php/exportarNomina/exportarDispersionTarjeta.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNomina40lbs)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                Swal.close();
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonNomina40lbs.numero_semana).padStart(2, '0');
                var anio = jsonNomina40lbs.fecha_cierre.split('/')[2];
                link.download = 'DISPERSION_TARJETA_SEM_' + numeroSemana + '_' + anio + '.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                Swal.close();
                console.error('Error al descargar el Excel:', error);
                alert('No se pudo generar el archivo de dispersión.');
            }
        });
    });
}
