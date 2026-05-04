abrirModalExportarExcel();
exportarNominaDepartamento();
exportarNominaCompleta();
reporteNominaPdf();
let mapaEmpresas = null;

/**
 * Función para obtener los nombres de las empresas desde la base de datos.
 * Utiliza un caché (mapaEmpresas) para no repetir la consulta cada vez que se abre el modal.
 */
async function obtenerNombresEmpresas() {
    if (mapaEmpresas) return mapaEmpresas; // Si ya tenemos los nombres, los devolvemos de inmediato

    try {
        const response = await $.ajax({
            url: '../../public/php/obtenerEmpresa.php',
            type: 'GET',
            dataType: 'json'
        });

        mapaEmpresas = {};
        if (Array.isArray(response)) {
            response.forEach(emp => {
                mapaEmpresas[emp.id_empresa] = emp.nombre_empresa;
            });
        }
        return mapaEmpresas;
    } catch (error) {
        console.error('Error al obtener nombres de empresas:', error);
        // Fallback: Nombres por defecto en caso de que falle la conexión
        return { 1: 'Citricos Saao', 2: 'SB citric´s group' };
    }
}

function abrirModalExportarExcel() {
    $(document).on('click', '#btn_export_excel', async function (e) {
        e.preventDefault();

        // Cargar los departamentos dinámicamente antes de mostrar
        await cargarDepartamentosExportar();
        $('#modalExportarNomina').modal('show');
    });
}

/**
 * Genera dinámicamente los botones en el modal de exportación.
 * Crea un botón por cada combinación de Departamento y Empresa detectada en el JSON.
 */
async function cargarDepartamentosExportar() {
    const container = $('#contenedor-opciones-exportar');
    container.empty(); // Limpiamos el contenedor antes de empezar

    // Verificamos que existan datos cargados en la nómina
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) {
        container.html('<div class="alert alert-warning small">No hay departamentos disponibles</div>');
        return;
    }

    // Obtenemos los nombres reales de las empresas de la base de datos
    const empresasMap = await obtenerNombresEmpresas();

    // Recorremos cada departamento que unificamos previamente en process_excel.js
    jsonNominaConfianza.departamentos.forEach(depto => {
        
        /**
         * listaConfiguraciones es un arreglo que contiene el color y el id_empresa.
         * Ejemplo: [{id_empresa: 1, color: '#pink'}, {id_empresa: 2, color: '#green'}]
         * Esto nos permite saber en cuántas empresas está este departamento y qué color usa cada una.
         */
        const listaConfiguraciones = Array.isArray(depto.color_reporte) ? depto.color_reporte : [];

        // Generamos un botón por cada empresa que tenga este departamento asignado
        listaConfiguraciones.forEach(config => {
            const idEmpresa = Number(config.id_empresa);
            const nombreEmpresa = empresasMap[idEmpresa] || 'Empresa ' + idEmpresa;
            const nombreBoton = `${depto.nombre} - ${nombreEmpresa}`;

            // Creamos el HTML del botón con sus datos (ID Depto, ID Empresa, etc.)
            const btnHtml = `
                <button type="button" class="list-group-item list-group-item-action border-success btn-export-corte-especifico"   
                    data-depto-id="${depto.id_departamento}" 
                    data-depto-nombre="${depto.nombre}"
                    data-empresa-id="${idEmpresa}"
                    data-empresa-nombre="${nombreEmpresa}">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1 text-success fw-bold">
                                    <i class="bi bi-building"></i> ${nombreBoton}
                                </h6>
                            </div>
                            <i class="bi bi-file-earmark-spreadsheet text-success fs-4"></i>
                        </div>
                </button>
            `;
            container.append(btnHtml);
        });
    });

    // Mensaje de respaldo si no se encontró nada para mostrar
    if (container.children().length === 0) {
        container.html('<div class="alert alert-info small text-center">No hay departamentos configurados para exportar</div>');
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
        let colorExcel = '#FF0000';
        
        if (deptoObj && deptoObj.color_reporte) {
            if (Array.isArray(deptoObj.color_reporte)) {
                // Buscar el color que corresponde a la empresa seleccionada
                const configColor = deptoObj.color_reporte.find(c => c.id_empresa == empresaId);
                colorExcel = configColor ? configColor.color : deptoObj.color_reporte[0].color;
            } else {
                colorExcel = deptoObj.color_reporte;
            }
        }

        // Ya no necesitamos la excepción manual para SB Group porque el color 
        // ahora viene correctamente de la configuración dinámica.
        let textColor = '#FFFFFF'; // Color de texto por defecto

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
                jsonNomina: JSON.stringify(jsonNominaConfianza),
                mapaEmpresas: JSON.stringify(mapaEmpresas)
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

