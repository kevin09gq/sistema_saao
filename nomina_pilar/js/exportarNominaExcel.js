abrirModalExportarExcel();
exportarJornaleroBase();
exportarJornaleroApoyo();
exportarJornaleroVivero();
exportarCoordinadorRancho();
exportarCoordinadorVivero();
nominaCompleta();
reporteNominaPdf();

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

        if (validarEmpleadosNegativos()) return;

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
                var numeroSemana = String(jsonNominaRelicario.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaRelicario.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO EL RELICARIO NOMINAS - JORNALERO BASE - ' + timestamp + '.xlsx';
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

function exportarJornaleroApoyo() {
    // Lógica para exportar la nómina de Jornalero Apoyo 
    $("#btn-export-jornalero-apoyo").click(function (e) {
        e.preventDefault();
        // Validar que jsonNominaRelicario exista
        if (!jsonNominaRelicario) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (validarEmpleadosNegativos()) return;

        // Enviar el jsonNominaRelicario al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaJornaleroApoyo.php',
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
                var numeroSemana = String(jsonNominaRelicario.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaRelicario.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO EL RELICARIO NOMINAS - JORNALERO APOYO - ' + timestamp + '.xlsx';
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

function exportarJornaleroVivero() {
    // Lógica para exportar la nómina de Jornalero Vivero 
    $("#btn-export-jornalero-vivero").click(function (e) {
        e.preventDefault();
        // Validar que jsonNominaRelicario exista
        if (!jsonNominaRelicario) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (validarEmpleadosNegativos()) return;
        // Enviar el jsonNominaRelicario al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaJornaleroVivero.php',
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
                var numeroSemana = String(jsonNominaRelicario.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaRelicario.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO EL RELICARIO NOMINAS - JORNALERO VIVERO - ' + timestamp + '.xlsx';
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

function exportarCoordinadorRancho() {
    // Lógica para exportar la nómina de Coordinador Rancho 
    $("#btn-export-coodinador-rancho").click(function (e) {
        e.preventDefault();
        // Validar que jsonNominaRelicario exista
        if (!jsonNominaRelicario) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (validarEmpleadosNegativos()) return;

        // Enviar el jsonNominaRelicario al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaCoordinadorRancho.php',
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
                var numeroSemana = String(jsonNominaRelicario.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaRelicario.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO EL RELICARIO NOMINAS - COORDINADOR RANCHO - ' + timestamp + '.xlsx';
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


function exportarCoordinadorVivero() {
    // Lógica para exportar la nómina de Coordinador Vivero 
    $("#btn-export-coodinador-vivero").click(function (e) {
        e.preventDefault();
        // Validar que jsonNominaRelicario exista
        if (!jsonNominaRelicario) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (validarEmpleadosNegativos()) return;

        // Enviar el jsonNominaRelicario al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaCoordinadorVivero.php',
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
                var numeroSemana = String(jsonNominaRelicario.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaRelicario.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO EL RELICARIO NOMINAS - COORDINADOR VIVERO - ' + timestamp + '.xlsx';
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


function nominaCompleta() {
    // Lógica para exportar todas las nóminas en un mismo archivo con diferentes hojas
    $("#btn-export-nomina-completa").click(function (e) {
        e.preventDefault();
        // Validar que jsonNominaRelicario exista
        if (!jsonNominaRelicario) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }
        if (validarEmpleadosNegativos()) return;

        // Enviar el jsonNominaRelicario al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaCompleta.php',
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
                var numeroSemana = String(jsonNominaRelicario.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaRelicario.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO EL RELICARIO NOMINAS COMPLETAS - ' + timestamp + '.xlsx';
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

function reporteNominaPdf() {
    $("#btn_export_pdf_reporte").click(function (e) {
        e.preventDefault();
        // Validar que jsonNominaRelicario exista
        if (!jsonNominaRelicario) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (validarEmpleadosNegativos()) return;
        $.ajax({
            url: '../php/exportarNomina/reporteNomina.php',
            type: 'POST',
            data: {
                numero_semana: jsonNominaRelicario.numero_semana || '',
                fecha_cierre: jsonNominaRelicario.fecha_cierre || '',
                fecha_inicio: jsonNominaRelicario.fecha_inicio || '',
                periodo_nomina: jsonNominaRelicario.periodo_nomina || '',
                jsonNomina: JSON.stringify(jsonNominaRelicario)
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
                link.download = 'REPORTE_NOMINA_JORNALERO_BASE_' + timestamp + '.pdf';
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

function validarEmpleadosNegativos() {

    if (!jsonNominaRelicario || !jsonNominaRelicario.departamentos) {
        return false;
    }

    let empleadosNegativos = [];

    jsonNominaRelicario.departamentos.forEach(depto => {
        depto.empleados.forEach(emp => {

            if (emp.mostrar === true && Number(emp.total_cobrar) < 0) {
                empleadosNegativos.push(emp.nombre);
            }

        });
    });

    if (empleadosNegativos.length > 0) {

        Swal.fire({
            icon: 'error',
            title: 'No se puede exportar la nómina',
            html: `
                <b>Existen empleados con saldo negativo.</b><br><br>
                Corrige la nómina antes de descargar cualquier archivo.<br><br>
                <b>Empleados afectados:</b><br>
                ${empleadosNegativos.join('<br>')}
            `,
            confirmButtonText: 'Entendido'
        });

        return true; // bloquear descarga
    }

    return false; // permitir descarga
}