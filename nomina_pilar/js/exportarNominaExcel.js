abrirModalExportarExcel();
exportarJornaleroBase();
exportarJornaleroApoyo();
exportarCoordinadorRancho();
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

        // Validar que jsonNominaPilar exista
        if (!jsonNominaPilar) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (validarEmpleadosNegativos()) return;

        // Enviar el jsonNominaPilar al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaJornaleroBase.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaPilar)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonNominaPilar.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaPilar.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO EL PILAR NOMINAS - JORNALERO BASE - ' + timestamp + '.xlsx';
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
        // Validar que jsonNominaPilar exista
        if (!jsonNominaPilar) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (validarEmpleadosNegativos()) return;

        // Enviar el jsonNominaPilar al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaJornaleroApoyo.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaPilar)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonNominaPilar.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaPilar.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO EL PILAR NOMINAS - JORNALERO APOYO - ' + timestamp + '.xlsx';
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
        // Validar que jsonNominaPilar exista
        if (!jsonNominaPilar) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (validarEmpleadosNegativos()) return;

        // Enviar el jsonNominaPilar al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaCoordinadorRancho.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaPilar)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonNominaPilar.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaPilar.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO EL PILAR NOMINAS - COORDINADOR RANCHO - ' + timestamp + '.xlsx';
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
        // Validar que jsonNominaPilar exista
        if (!jsonNominaPilar) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }
       // if (validarEmpleadosNegativos()) return;

        // Enviar el jsonNominaPilar al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaCompleta.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaPilar)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonNominaPilar.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaPilar.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO EL PILAR NOMINAS COMPLETAS - ' + timestamp + '.xlsx';
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
        // Validar que jsonNominaPilar exista
        if (!jsonNominaPilar) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        //if (validarEmpleadosNegativos()) return;
        $.ajax({
            url: '../php/exportarNomina/reporteNomina.php',
            type: 'POST',
            data: {
                numero_semana: jsonNominaPilar.numero_semana || '',
                fecha_cierre: jsonNominaPilar.fecha_cierre || '',
                fecha_inicio: jsonNominaPilar.fecha_inicio || '',
                periodo_nomina: jsonNominaPilar.periodo_nomina || '',
                jsonNomina: JSON.stringify(jsonNominaPilar)
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
                link.download = 'REPORTE_NOMINA_PILAR_' + timestamp + '.pdf';
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

    if (!jsonNominaPilar || !jsonNominaPilar.departamentos) {
        return false;
    }

    let empleadosNegativos = [];

    jsonNominaPilar.departamentos.forEach(depto => {
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