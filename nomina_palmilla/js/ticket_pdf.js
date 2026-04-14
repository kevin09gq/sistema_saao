// ticket_pdf.js - Ticket general para nómina palmilla
$(document).ready(function () {
    $('#btn_ticket_pdf').on('click', function () {
        if (typeof jsonNominaPalmilla === 'undefined' || !jsonNominaPalmilla) {
            Swal.fire('Sin datos', 'No hay datos de nómina para generar el PDF.', 'warning');
            return;
        }

        // Obtener los datos filtrados actuales según el departamento y puesto seleccionados
        let id_departamento = parseInt($('#filtro_departamento').val() || '-1');
        let id_puestoEspecial = parseInt($('#filtro_puesto').val() || '-1');
        
        // Aplicar los mismos filtros que se usan para mostrar la tabla
        let datosFiltrados = filtrarEmpleadosPorDepartamento(jsonNominaPalmilla, id_departamento);
        if (id_puestoEspecial !== -1) {
            datosFiltrados = filtrarEmpleadosPorPuesto(datosFiltrados, id_puestoEspecial);
        }

        // Verificar si hay empleados después de aplicar los filtros
        let totalEmpleados = 0;
        (datosFiltrados.departamentos || []).forEach(depto => {
            totalEmpleados += (depto.empleados || []).length;
        });

        if (totalEmpleados === 0) {
            Swal.fire('Sin datos', 'No hay empleados para los filtros seleccionados.', 'warning');
            return;
        }

        // Mostrar mensaje informativo
        let nombreDepartamento = $('#filtro_departamento').val() === '-1' ? 'Todos los departamentos' : $('#filtro_departamento option:selected').text();
        let nombrePuesto = $('#filtro_puesto').val() === '-1' ? 'Todos los puestos' : $('#filtro_puesto option:selected').text();
        
        Swal.fire({
            title: 'Generando tickets',
            html: `Departamento: <strong>${nombreDepartamento}</strong><br>Puesto: <strong>${nombrePuesto}</strong><br>Empleados: <strong>${totalEmpleados}</strong>`,
            icon: 'info',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
        });

        var datosEnviar = {
            nomina: datosFiltrados,
            meta: {
                numero_semana: jsonNominaPalmilla.numero_semana || ''
            }
        };

        $(this).prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Generando...');

        $.ajax({
            url: '../php/descargar_ticket_pdf.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datosEnviar),
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob, status, xhr) {
                if (!(blob instanceof Blob)) {
                    Swal.fire('Error', 'El servidor no devolvió un archivo PDF válido.', 'error');
                    $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
                    return;
                }
                if (blob.size === 0) {
                    Swal.fire('Error', 'Archivo PDF vacío.', 'error');
                    $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
                    return;
                }
                var filename = 'tickets_palmilla.pdf';
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('filename=') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/["']/g, '');
                    }
                }
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
            },
            error: function () {
                Swal.fire('Error', 'Error al generar el PDF. Por favor, intenta nuevamente.', 'error');
                $('#btn_ticket_pdf').prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
            }
        });
    });
});
