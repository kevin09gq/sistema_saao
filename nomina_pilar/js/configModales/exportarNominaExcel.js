abrirModalExportarExcel();
exportarNominaDepartamento();
exportarNominaCompleta();
reporteNominaPdf();

function abrirModalExportarExcel() {
    $(document).on('click', '#btn_export_excel', function (e) {
        e.preventDefault();

        // Cargar los departamentos dinámicamente antes de mostrar
        cargarDepartamentosExportar();
        $('#modalExportarNomina').modal('show');
    });
}

function cargarDepartamentosExportar() {
    const container = $('#contenedor-opciones-exportar');
    container.empty();

    if (!jsonNominaPilar || !Array.isArray(jsonNominaPilar.departamentos)) {
        container.html('<div class="alert alert-warning small">No hay departamentos disponibles</div>');
        return;
    }

    jsonNominaPilar.departamentos.forEach(depto => {
        // Omitir el departamento de Corte porque es una opción estática fuera de esta lista
        if (depto.nombre.toUpperCase() === 'CORTE' || depto.nombre.toUpperCase() === 'PODA') return;

        const btnHtml = `
       
            <button type="button" class="list-group-item list-group-item-action border-success" id="btn-export-corte"   
                data-id="${depto.id_departamento}" data-nombre="${depto.nombre}">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1 text-success fw-bold">
                                    <i class="bi bi-leaf-fill"></i> ${depto.nombre}
                                </h6>
                            </div>
                            <i class="bi bi-file-earmark-spreadsheet text-success fs-4"></i>
                        </div>
            </button>

        `;
        container.append(btnHtml);
    });

    if (container.children().length === 0) {
        container.html('<div class="alert alert-info small text-center">Solo disponible Nómina Completa y Corte</div>');
    }
}

function exportarNominaDepartamento() {
    $(document).on('click', '#btn-export-corte', function (e) {
        e.preventDefault();

        if (validarEmpleadosNegativos()) return;

        const deptoId = $(this).data('id');
        const deptoNombre = $(this).data('nombre');
        let tmp_url = "";


        switch (deptoNombre) {
            case "Corte":
                tmp_url = '../php/exportarNomina/exportarNominaCorte.php';
                break;
            case "Poda":
                tmp_url = '../php/exportarNomina/exportarNominaPoda.php';
                break;
            default:
                tmp_url = '../php/exportarNomina/exportarNominaDepartamento.php';
                break;
        }

        // Validar que jsonNominaPilar exista
        if (!jsonNominaPilar) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        // Validar que el departamento exista
        const departamento = jsonNominaPilar.departamentos.find(d => d.id_departamento == deptoId);
        if (!departamento || !departamento.empleados || departamento.empleados.length === 0) {
            alerta("info", "Nomina no encontrada", "No se encontró el departamento de " + deptoNombre + " o no tiene empleados. Por favor, cargar los tickets de " + deptoNombre + ".");
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

        // Enviar el jsonNominaPilar al servidor PHP mediante POST
        $.ajax({
            url: tmp_url,
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaPilar),
                deptoId: deptoId,
                deptoNombre: deptoNombre
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
                var numeroSemana = String(jsonNominaPilar.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaPilar.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + deptoNombre.toUpperCase() + ' - ' + aniosCierre + '.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                // Cerrar la alerta de carga
                Swal.close();

                console.error('Error al descargar el Excel:', error);
                alerta("error", "Error al generar reporte excel", "No se pudo generar el archivo Excel para el departamento de " + deptoNombre + ". Por favor, intenta nuevamente o contacta al soporte.");
            }
        });

    });
}

function exportarNominaCompleta() {
    $(document).on('click', '#btn-export-nomina-completa', function (e) {
        e.preventDefault();

        // Validar que jsonNominaPilar exista
        if (!jsonNominaPilar) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        // Validar que no haya empleados negativos
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
                // Cerrar la alerta de carga
                Swal.close();

                // Crear un blob y descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonNominaPilar.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaPilar.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + 'RANCHO PILAR - ' + aniosCierre + '.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                // Cerrar la alerta de carga
                Swal.close();

                console.error('Error al descargar el Excel:', error);
                alerta("error", "Error al generar reporte excel", "No se pudo generar el archivo Excel para la nómina completa. Por favor, intenta nuevamente o contacta al soporte.");
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

        if (validarEmpleadosNegativos()) return;

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

            if (emp.mostrar !== false && Number(emp.total_cobrar) < 0) {
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

