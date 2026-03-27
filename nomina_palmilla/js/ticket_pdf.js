// ticket_pdf.js - Ticket general para nómina palmilla
$(document).ready(function () {
    $('#btn_ticket_pdf').on('click', function () {
        if (typeof jsonNominaPalmilla === 'undefined' || !jsonNominaPalmilla) {
            Swal.fire('Sin datos', 'No hay datos de nómina para generar el PDF.', 'warning');
            return;
        }

        // Obtener los datos filtrados actuales según el departamento y puesto seleccionados
        let id_departamento = parseInt($('#filtro_departamento').val() || '7');
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
        let nombreDepartamento = $('#filtro_departamento option:selected').text();
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

    // Evento para ticket individual (delegado para elementos dinámicos)
    $('#tabla-nomina-body-palmilla').on('click', '.btn-ticket-individual', function () {
        const clave = $(this).data('clave');
        const nombreDepartamento = $(this).data('departamento');

        if (!jsonNominaPalmilla || !jsonNominaPalmilla.departamentos) {
            Swal.fire('Error', 'No hay datos de nómina cargados.', 'error');
            return;
        }

        // Buscar el empleado en los datos globales
        let empleadoEncontrado = null;
        let deptoEncontrado = null;

        for (const depto of jsonNominaPalmilla.departamentos) {
            if (depto.nombre === nombreDepartamento) {
                const emp = depto.empleados.find(e => e.clave == clave);
                if (emp) {
                    empleadoEncontrado = emp;
                    deptoEncontrado = depto;
                    break;
                }
            }
        }

        if (!empleadoEncontrado) {
            Swal.fire('Error', 'No se encontró la información del empleado.', 'error');
            return;
        }

        // Crear una estructura de nómina con solo este empleado
        const datosFiltrados = {
            departamentos: [{
                nombre: deptoEncontrado.nombre,
                id_departamento: deptoEncontrado.id_departamento,
                empleados: [empleadoEncontrado]
            }]
        };

        const datosEnviar = {
            nomina: datosFiltrados,
            meta: {
                numero_semana: jsonNominaPalmilla.numero_semana || ''
            }
        };

        const $btn = $(this);
        const originalHtml = $btn.html();
        $btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i>');

        $.ajax({
            url: '../php/descargar_ticket_pdf.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datosEnviar),
            xhrFields: {
                responseType: 'blob'
            },
            success: function (blob, status, xhr) {
                if (!(blob instanceof Blob) || blob.size === 0) {
                    Swal.fire('Error', 'El servidor no devolvió un archivo PDF válido.', 'error');
                    $btn.prop('disabled', false).html(originalHtml);
                    return;
                }
                
                let filename = `ticket_${empleadoEncontrado.nombre.replace(/\s+/g, '_')}.pdf`;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                $btn.prop('disabled', false).html(originalHtml);
            },
            error: function () {
                Swal.fire('Error', 'Error al generar el PDF.', 'error');
                $btn.prop('disabled', false).html(originalHtml);
            }
        });
    });
});
