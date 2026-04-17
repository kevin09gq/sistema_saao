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

    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) {
        container.html('<div class="alert alert-warning small">No hay departamentos disponibles</div>');
        return;
    }

    // Mapeo de nombres de empresas
    const empresasMap = {
        1: 'Citricos Saao',
        2: 'SB citric´s group'
    };

    jsonNominaConfianza.departamentos.forEach(depto => {
        // Encontrar empresas únicas que tienen empleados en este departamento
        const empresasEnDepto = new Set();
        (depto.empleados || []).forEach(emp => {
            if (emp.mostrar !== false && emp.id_empresa) {
                empresasEnDepto.add(Number(emp.id_empresa));
            }
        });

        // Generar un botón por cada combinación de Departamento - Empresa
        empresasEnDepto.forEach(idEmpresa => {
            const nombreEmpresa = empresasMap[idEmpresa] || 'Empresa ' + idEmpresa;
            const nombreCompleto = `${depto.nombre} - ${nombreEmpresa}`;

            const btnHtml = `
                <button type="button" class="list-group-item list-group-item-action border-success btn-export-corte-especifico"   
                    data-depto-id="${depto.id_departamento}" 
                    data-depto-nombre="${depto.nombre}"
                    data-empresa-id="${idEmpresa}"
                    data-empresa-nombre="${nombreEmpresa}">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1 text-success fw-bold">
                                    <i class="bi bi-building"></i> ${nombreCompleto}
                                </h6>
                            </div>
                            <i class="bi bi-file-earmark-spreadsheet text-success fs-4"></i>
                        </div>
                </button>
            `;
            container.append(btnHtml);
        });
    });

    if (container.children().length === 0) {
        container.html('<div class="alert alert-info small text-center">No hay departamentos con empleados para exportar</div>');
    }
}

function exportarNominaDepartamento() {
    $(document).on('click', '.btn-export-corte-especifico', function (e) {
        e.preventDefault();

        const deptoId = $(this).data('depto-id');
        const deptoNombre = $(this).data('depto-nombre');
        const empresaId = $(this).data('empresa-id');
        const empresaNombre = $(this).data('empresa-nombre');

        let tmp_url = "../php/exportarNomina/exportarNominaDepartamento.php";

        if (!jsonNominaConfianza) {
            alert('No hay datos de nómina para exportar.');
            return;
        }

        // Mostrar alerta de carga
        Swal.fire({
            title: 'Generando documento...',
            html: `Exportando <b>${deptoNombre}</b> de <b>${empresaNombre}</b>...`,
            icon: 'info',
            allowOutsideClick: false,
            didOpen: (modal) => { Swal.showLoading(); }
        });

        // Obtener el color del departamento desde el JSON
        const deptoObj = jsonNominaConfianza.departamentos.find(d => d.id_departamento == deptoId);
        let colorExcel = deptoObj ? (deptoObj.color_reporte || '#FF0000') : '#FF0000';

        // Excepción de color para SB Group (id_empresa: 2)
        let textColor = '#FFFFFF'; // Blanco por defecto
        if (empresaId == 2) {
            colorExcel = '#A9D08E'; // Verde institucional de la imagen
            textColor = '#000000'; // Negro para mejor contraste
        }

        $.ajax({
            url: tmp_url,
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaConfianza),
                deptoId: deptoId,
                deptoNombre: deptoNombre,
                empresaId: empresaId,
                empresaNombre: empresaNombre,
                colorExcel: colorExcel,
                textColor: textColor
            },
            xhrFields: { responseType: 'blob' },
            success: function (blob) {
                Swal.close();
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;

                var numeroSemana = String(jsonNominaConfianza.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaConfianza.fecha_cierre.split('/')[2];

                // Nombre del archivo incluyendo la empresa
                link.download = `SEM ${numeroSemana} - ${deptoNombre.toUpperCase()} - ${empresaNombre.toUpperCase()} - ${aniosCierre}.xlsx`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                Swal.close();
                console.error('Error al descargar el Excel:', error);
                alerta("error", "Error", "No se pudo generar el archivo Excel.");
            }
        });
    });
}

function exportarNominaCompleta() {
    $(document).on('click', '#btn-export-nomina-completa', function (e) {
        e.preventDefault();

        // Validar que jsonNominaConfianza exista
        if (!jsonNominaConfianza) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        // Validar que no haya empleados negativos
       // if (validarEmpleadosNegativos()) return;

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

        // Enviar el jsonNominaConfianza al servidor PHP mediante POST
        $.ajax({
            url: '../php/exportarNomina/exportarNominaCompleta.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNominaConfianza)
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
                var numeroSemana = String(jsonNominaConfianza.numero_semana).padStart(2, '0');
                var aniosCierre = jsonNominaConfianza.fecha_cierre.split('/')[2];
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM ' + numeroSemana + ' - ' + 'NOMINA CONFIANZA - ' + aniosCierre + '.xlsx';
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
        // Validar que jsonNominaConfianza exista
        if (!jsonNominaConfianza) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

       // if (validarEmpleadosNegativos()) return;

        $.ajax({
            url: '../php/exportarNomina/reporteNomina.php',
            type: 'POST',
            data: {
                numero_semana: jsonNominaConfianza.numero_semana || '',
                fecha_cierre: jsonNominaConfianza.fecha_cierre || '',
                fecha_inicio: jsonNominaConfianza.fecha_inicio || '',
                periodo_nomina: jsonNominaConfianza.periodo_nomina || '',
                jsonNomina: JSON.stringify(jsonNominaConfianza)
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
                link.download = 'REPORTE_NOMINA_CONFIANZA_' + timestamp + '.pdf';
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

    if (!jsonNominaConfianza || !jsonNominaConfianza.departamentos) {
        return false;
    }

    let empleadosNegativos = [];

    jsonNominaConfianza.departamentos.forEach(depto => {
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

