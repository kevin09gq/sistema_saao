abrirModalExportarExcel();
exportarJornaleroBase();
exportarJornaleroApoyo();
exportarCoordinadorRancho();
exportarCorte();
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

        // Validar que jsonNominaHuasteca exista
        if (!jsonNominaHuasteca) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (validarEmpleadosNegativos()) return;

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

        // Enviar el jsonNominaHuasteca al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaJornaleroBase.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaHuasteca)
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
                var numeroSemana = String(jsonNominaHuasteca.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaHuasteca.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO LA HUASTECA NOMINAS - JORNALERO BASE - ' + timestamp + '.xlsx';
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

function exportarJornaleroApoyo() {
    // Lógica para exportar la nómina de Jornalero Apoyo 
    $("#btn-export-jornalero-apoyo").click(function (e) {
        e.preventDefault();
        // Validar que jsonNominaHuasteca exista
        if (!jsonNominaHuasteca) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (validarEmpleadosNegativos()) return;

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

        // Enviar el jsonNominaHuasteca al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaJornaleroApoyo.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaHuasteca)
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
                var numeroSemana = String(jsonNominaHuasteca.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaHuasteca.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO LA HUASTECA NOMINAS - JORNALERO APOYO - ' + timestamp + '.xlsx';
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


function exportarCoordinadorRancho() {
    // Lógica para exportar la nómina de Coordinador Rancho 
    $("#btn-export-coodinador-rancho").click(function (e) {
        e.preventDefault();
        // Validar que jsonNominaHuasteca exista
        if (!jsonNominaHuasteca) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

       if (validarEmpleadosNegativos()) return;

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

        // Enviar el jsonNominaHuasteca al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaCoordinadorRancho.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaHuasteca)
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
                var numeroSemana = String(jsonNominaHuasteca.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaHuasteca.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO LA HUASTECA NOMINAS - COORDINADOR RANCHO - ' + timestamp + '.xlsx';
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
    $("#btn-export-nomina-completa").click(function (e) {
        e.preventDefault();
        // Validar que jsonNominaHuasteca exista
        if (!jsonNominaHuasteca) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }
        if (validarEmpleadosNegativos()) return;

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

        // Enviar el jsonNominaHuasteca al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaCompleta.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaHuasteca)
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
                var numeroSemana = String(jsonNominaHuasteca.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaHuasteca.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO LA HUASTECA NOMINAS COMPLETAS - ' + timestamp + '.xlsx';
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
    $("#btn_export_pdf_reporte").click(function (e) {
        e.preventDefault();
        // Validar que jsonNominaHuasteca exista
        if (!jsonNominaHuasteca) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (validarEmpleadosNegativos()) return;
        $.ajax({
            url: '../php/exportarNomina/reporteNomina.php',
            type: 'POST',
            data: {
                numero_semana: jsonNominaHuasteca.numero_semana || '',
                fecha_cierre: jsonNominaHuasteca.fecha_cierre || '',
                fecha_inicio: jsonNominaHuasteca.fecha_inicio || '',
                periodo_nomina: jsonNominaHuasteca.periodo_nomina || '',
                jsonNomina: JSON.stringify(jsonNominaHuasteca)
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
                link.download = 'REPORTE_NOMINA_HUASTECA_' + timestamp + '.pdf';
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

    if (!jsonNominaHuasteca || !jsonNominaHuasteca.departamentos) {
        return false;
    }

    let empleadosNegativos = [];

    jsonNominaHuasteca.departamentos.forEach(depto => {
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



// Generar porte excel para corte de limones
function exportarCorte() {
    // Lógica para exportar la nómina de Corte
    $("#btn-export-corte").click(function (e) {
        e.preventDefault();

        console.log("Hola desde solo corte");
        

        // Validar que jsonNominaRelicario exista
        if (!jsonNominaHuasteca) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        // Validar que el departamento Corte exista
        const departamentoCorte = jsonNominaHuasteca.departamentos.find(d => d.nombre === 'Corte');
        if (!departamentoCorte || !departamentoCorte.empleados || departamentoCorte.empleados.length === 0) {
            alerta("info", "Nomina no encontrada", "No se encontró el departamento de Corte o no tiene empleados. Por favor, cargar los tickets de corte de limon.");
            return;
        }

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

        // Enviar el jsonNominaHuasteca al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaCorte.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaHuasteca)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                // Cerrar la alerta de carga
                Swal.close();

                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonNominaHuasteca.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaHuasteca.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + aniosCierre + ' RANCHO LA HUASTECA NOMINAS - CORTE REJAS DE LIMON - ' + timestamp + '.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                // Cerrar la alerta de carga
                Swal.close();

                console.error('Error al descargar el Excel:', error);
                alerta("error", "Error al generar reporte excel", "No se pudo generar el archivo Excel para el corte de limones. Por favor, intenta nuevamente o contacta al soporte.");
            }
        });

    });
}