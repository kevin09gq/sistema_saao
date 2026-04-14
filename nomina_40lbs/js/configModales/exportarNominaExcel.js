abrirModalExportarExcel();
exportarPorDepartamento();
nominaCompleta();
reporteNominaPdf();
exportarDispersionTarjeta();

function abrirModalExportarExcel() {
    $(document).on('click', '#btn_export_excel', function (e) {
        e.preventDefault();

        // Poblar las opciones dinámicamente antes de mostrar
        poblarOpcionesExportar(jsonNomina40lbs);

        $('#modalExportarNomina').modal('show');
    });
}

function poblarOpcionesExportar(json) {
    if (!json || !json.departamentos) return;

    const $contenedor = $('#contenedor-exportar-dinamico');
    $contenedor.empty();


    // 2. Agregar Opciones por Departamento (Dinámico)
    json.departamentos.forEach(depto => {
        // Solo mostrar departamentos con la propiedad editar: true
        if (depto.editar !== true) return;
        
        const nombre = depto.nombre;
        const idDepto = depto.id_departamento || depto.nombre;

        const tieneCSS = depto.empleados.some(emp => emp.seguroSocial === true);
        const tieneSSS = depto.empleados.some(emp => emp.seguroSocial === false);

        if (tieneCSS) {
            $contenedor.append(`
                <button type="button" class="list-group-item list-group-item-action btn-export-departamento-css" 
                        data-id="${idDepto}" data-nombre="${nombre}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1"><i class="bi bi-person-badge"></i> ${nombre} CSS</h6>
                        </div>
                        <i class="bi bi-file-earmark-spreadsheet text-success fs-4"></i>
                    </div>
                </button>
            `);
        }

        if (tieneSSS) {
            $contenedor.append(`
                <button type="button" class="list-group-item list-group-item-action btn-export-departamento-sss" 
                        data-id="${idDepto}" data-nombre="${nombre}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1"><i class="bi bi-people"></i> ${nombre} SSS</h6>
                        </div>
                        <i class="bi bi-file-earmark-bar-graph text-primary fs-4"></i>
                    </div>
                </button>
            `);
        }
    });


}

function exportarPorDepartamento() {
    // Escuchar clics en botones de CSS o SSS generados dinámicamente
    $(document).on('click', '.btn-export-departamento-css, .btn-export-departamento-sss', async function (e) {
        e.preventDefault();

        const $btn = $(this);
        const idDepto = $btn.data('id');
        const nombreDepto = $btn.data('nombre');
        const esSeguroSocial = $btn.hasClass('btn-export-departamento-css'); // Determinar tipo por clase

        // Validar que jsonNomina40lbs exista
        if (!jsonNomina40lbs) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        if (validarEmpleadosNegativos()) return;

        // Mostrar alerta de carga
        Swal.fire({
            title: 'Generando documento...',
            html: `Procesando: <b>${nombreDepto} ${esSeguroSocial ? 'CSS' : 'SSS'}</b><br>Por favor espera.`,
            icon: 'info',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Enviar datos al PHP genérico
        $.ajax({
            url: '../php/exportarNomina/exportarNominaDepartamento.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonNomina40lbs),
                id_departamento: idDepto,
                nombre_departamento: nombreDepto,
                seguroSocial: esSeguroSocial
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                Swal.close();
                // Descargar el archivo
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;

                var numeroSemana = String(jsonNomina40lbs.numero_semana).padStart(2, '0');
                var anio = jsonNomina40lbs.fecha_cierre.split('/')[2];
                var tipoSuffix = esSeguroSocial ? 'CSS' : 'SSS';
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                
                link.download = `SEM ${numeroSemana} - ${anio} - ${nombreDepto} ${tipoSuffix} - ${timestamp}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                Swal.close();
                console.error('Error al descargar el Excel:', error);
                alert('No se pudo generar el archivo Excel para este departamento.');
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
                link.download = 'NOMINA_COMPLETA_SEM_' + numeroSemana + '_' + aniosCierre + '_' + timestamp + '.xlsx';
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

        if (validarEmpleadosNegativos()) return;
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

 function validarEmpleadosNegativos() {
    if (!jsonNomina40lbs || !jsonNomina40lbs.departamentos) return false;

    let nombresNegativos = [];

    jsonNomina40lbs.departamentos.forEach(depto => {
        // Solo validar departamentos marcados para edición
        if (depto.editar !== true) return;

        depto.empleados.forEach(emp => {
            if (Number(emp.total_cobrar) < 0) {
                nombresNegativos.push(emp.nombre);
            }
        });
    });

    if (nombresNegativos.length > 0) {
         Swal.fire({
            icon: 'error',
            title: 'No se puede exportar la nómina',
            html: `
                <b>Existen empleados con saldo negativo.</b><br><br>
                Corrige la nómina antes de descargar cualquier archivo.<br><br>
                <b>Empleados afectados:</b><br>
                ${nombresNegativos.join('<br>')}
            `,
            confirmButtonText: 'Entendido'
        });
        return true; // bloquear descarga
    }
    return false; // permitir descarga (todo normal)
}
