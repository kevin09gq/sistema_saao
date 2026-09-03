$(document).ready(function () {

    abrirModalExportarNomina();
    exportarNominaDepartamento();
    exportarNominaCompleta();
    reporteNominaPdf();
    exportarDispersionTarjeta();

});

//=================================================
// FUNCION PARA ABRIR EL MODAL DE EXPORTAR NOMINA
//=================================================

function abrirModalExportarNomina() {
    $("#btn_export_excel").click(function (e) {
        e.preventDefault();

        // Cargamos los departamentos en el modal
        cargarDepartamentosExportar();

        // Abrimos el modal
        $("#modalExportarNomina").modal("show");

    });

}

//======================================================================
// FUNCION PARA CARGAR LOS DEPARTAMENTOS EN EL MODAL DE EXPORTAR NOMINA
//======================================================================

function cargarDepartamentosExportar() {

    // Obtenemos el contenedor donde se agregarán los departamentos
    const contenedor = $("#contenedor-opciones-exportar");

    // Limpiamos el contenido anterior
    contenedor.empty();

    // Verificamos que exista la información de la nómina
    if (!jsonHistorialConfianza) {
        console.error("No existe jsonHistorialConfianza.");
        return;
    }

    // Verificamos que exista el arreglo de departamentos
    if (
        !jsonHistorialConfianza.departamentos ||
        !Array.isArray(jsonHistorialConfianza.departamentos)
    ) {
        console.error("No existen departamentos en jsonHistorialConfianza.");
        return;
    }

    // Recorremos todos los departamentos
    $.each(jsonHistorialConfianza.departamentos, function (indice, departamento) {

        // Obtenemos los datos del departamento
        const idDepartamento = departamento.id_departamento;
        const idEmpresa = departamento.id_empresa;
        const nombreDepartamento = departamento.nombre;

        // Creamos el botón del departamento
        const boton = `
            <button 
                type="button"
                class="list-group-item list-group-item-action btn-export-departamento"
                data-id-departamento="${idDepartamento}"
                data-id-empresa="${idEmpresa}"
                data-nombre="${nombreDepartamento}"
            >
                <div class="d-flex justify-content-between align-items-center">

                    <div>
                        <h6 class="mb-1 fw-bold text-primary">
                            <i class="bi bi-people-fill"></i>
                            ${nombreDepartamento}
                        </h6>
                    </div>

                    <i class="bi bi-file-earmark-spreadsheet fs-4 text-primary"></i>

                </div>
            </button>
        `;

        // Agregamos el botón al contenedor
        contenedor.append(boton);
    });
}

//=================================================
// FUNCION PARA EXPORTAR NOMINA DE UN DEPARTAMENTO
//=================================================

function exportarNominaDepartamento() {

    // Evento click para botones de exportar departamento
    $(document).on("click", ".btn-export-departamento", function (e) {
        e.preventDefault();

        // Obtenemos los datos del departamento seleccionado
        const idDepartamento = $(this).data("id-departamento");
        const idEmpresa = $(this).data("id-empresa");
        const nombreDepartamento = $(this).data("nombre");

        // Verificamos que exista la información de la nómina
        if (!jsonHistorialConfianza) {
            alerta("error", "Error", "No hay datos de nómina para exportar.");
            return;
        }

        // Mostramos alerta de carga
        Swal.fire({
            title: "Generando documento...",
            html: `Exportando <b>${nombreDepartamento}</b>...`,
            icon: "info",
            allowOutsideClick: false,
            didOpen: function () {
                Swal.showLoading();
            }
        });

        // Obtenemos el color del departamento desde el JSON
        const departamentoObj = jsonHistorialConfianza.departamentos.find(
            depto => depto.id_departamento == idDepartamento
        );

        let colorExcel = "#FF0000"; // Color por defecto

        if (departamentoObj && departamentoObj.color_reporte) {
            if (Array.isArray(departamentoObj.color_reporte) && departamentoObj.color_reporte.length > 0) {
                // Nuevo formato: array simple de strings hexadecimales
                colorExcel = departamentoObj.color_reporte[0];
            } else {
                colorExcel = departamentoObj.color_reporte;
            }
        }

        // Enviamos la petición AJAX para generar el Excel
        $.ajax({
            url: "../../generacion/php/exportarNomina/exportarNominaDepartamento.php",
            type: "POST",
            data: {
                jsonNomina: JSON.stringify(jsonHistorialConfianza),
                deptoId: idDepartamento,
                deptoNombre: nombreDepartamento,
                id_empresa: idEmpresa,
                colorExcel: colorExcel
            },
            xhrFields: {
                responseType: "blob"
            },
            success: function (blob) {
                // Cerramos la alerta de carga
                Swal.close();

                // Creamos el enlace para descargar el archivo
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.href = url;

                // Generamos el nombre del archivo
                const numeroSemana = String(jsonHistorialConfianza.numero_semana).padStart(2, "0");
                const anioCierre = jsonHistorialConfianza.fecha_cierre.split("/")[2];
                link.download = `SEM ${numeroSemana} - ${nombreDepartamento.toUpperCase()} - ${anioCierre}.xlsx`;

                // Descargamos el archivo
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                // Cerramos la alerta de carga
                Swal.close();

                console.error("Error al descargar el Excel:", error);
                alerta("error", "Error", "No se pudo generar el archivo Excel.");
            }
        });
    });
}

//=================================================
// FUNCION PARA EXPORTAR NOMINA COMPLETA
//=================================================

function exportarNominaCompleta() {

    // Evento click para botón de exportar nómina completa
    $(document).on("click", "#btn-export-nomina-completa", function (e) {
        e.preventDefault();

        // Verificamos que exista la información de la nómina
        if (!jsonHistorialConfianza) {
            alerta("error", "Error", "No hay datos de nómina para exportar.");
            return;
        }

        // Mostramos alerta de carga
        Swal.fire({
            title: "Generando documento...",
            html: "Exportando nómina completa...",
            icon: "info",
            allowOutsideClick: false,
            didOpen: function () {
                Swal.showLoading();
            }
        });

        // Enviamos la petición AJAX para generar el Excel
        $.ajax({
            url: "../../generacion/php/exportarNomina/exportarNominaCompleta.php",
            type: "POST",
            data: {
                jsonNomina: JSON.stringify(jsonHistorialConfianza)
            },
            xhrFields: {
                responseType: "blob"
            },
            success: function (blob) {
                // Cerramos la alerta de carga
                Swal.close();

                // Creamos el enlace para descargar el archivo
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.href = url;

                // Generamos el nombre del archivo
                const numeroSemana = String(jsonHistorialConfianza.numero_semana).padStart(2, "0");
                const anioCierre = jsonHistorialConfianza.fecha_cierre.split("/")[2];
                link.download = `SEM ${numeroSemana} - NOMINA CONFIANZA - ${anioCierre}.xlsx`;

                // Descargamos el archivo
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: function (xhr, status, error) {
                // Cerramos la alerta de carga
                Swal.close();

                console.error("Error al descargar el Excel:", error);
                alerta("error", "Error", "No se pudo generar el archivo Excel de nómina completa.");
            }
        });
    });
}


function reporteNominaPdf() {
    $("#btn_export_pdf_reporte").click(function (e) {
        e.preventDefault();
        // Validar que jsonHistorialConfianza exista
        if (!jsonHistorialConfianza) {
            alert('No hay datos de nómina para exportar. Por favor, procesa los datos primero.');
            return;
        }

        // if (validarEmpleadosNegativos()) return;

        $.ajax({
            url: '../../generacion/php/exportarNomina/reporteNomina.php',
            type: 'POST',
            data: {
                numero_semana: jsonHistorialConfianza.numero_semana || '',
                fecha_cierre: jsonHistorialConfianza.fecha_cierre || '',
                fecha_inicio: jsonHistorialConfianza.fecha_inicio || '',
                periodo_nomina: jsonHistorialConfianza.periodo_nomina || '',
                jsonNomina: JSON.stringify(jsonHistorialConfianza)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                // Descargar el PDF
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonHistorialConfianza.numero_semana).padStart(2, '0');
                var aniosCierre = jsonHistorialConfianza.fecha_cierre.split('/')[2];
                var numeroSemana = String(jsonHistorialConfianza.numero_semana).padStart(2, '0');
                var timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
                link.download = 'SEM_' + numeroSemana + '_DESGLOSE_NOMINA_CONFIANZA_' + '.pdf'; document.body.appendChild(link);
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

        if (!jsonHistorialConfianza) {
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
            url: '../../generacion/php/exportarNomina/exportarDispersionTarjeta.php',
            type: 'POST',
            data: {
                jsonNomina: JSON.stringify(jsonHistorialConfianza)
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob) {
                Swal.close();
                var link = document.createElement('a');
                var url = URL.createObjectURL(blob);
                link.href = url;
                var numeroSemana = String(jsonHistorialConfianza.numero_semana).padStart(2, '0');
                var anio = jsonHistorialConfianza.fecha_cierre.split('/')[2];
                link.download = 'SEM_' + numeroSemana + '_DISPERSION_TARJETA_CONFIANZA_' + anio + '.xlsx';
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