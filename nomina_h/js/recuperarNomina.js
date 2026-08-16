//======================================================================
// FUNCIÓN PARA RECUPERAR LA ÚLTIMA NÓMINA GUARDADA EN LA BASE DE DATOS
// Obtiene la nómina con el ID más reciente (last id) y la carga
// en la variable global jsonNominaHuasteca para continuar editándola.
//======================================================================

$(document).ready(function () {
    recuperarUltimaNomina();
});

function recuperarUltimaNomina() {

    $('#btn-recuperar-nomina').on('click', function () {

        // Mostrar loading mientras se consulta
        Swal.fire({
            title: 'Recuperando nómina...',
            text: 'Consultando la última nómina guardada.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        $.ajax({
            url: "../php/infoEmpleados.php",
            type: "POST",
            dataType: "json",
            data: {
                accion: "recuperarUltimaNomina"
            },
            success: function (respuesta) {

                // Cerrar el loading
                Swal.close();

                if (!respuesta.success) {
                    mostrarAlerta('warning', 'Sin resultados', respuesta.mensaje);
                    return;
                }

                // Confirmar antes de cargar (por si ya hay datos en memoria)
                const info = respuesta.nomina_info;

                Swal.fire({
                    title: '¿Cargar esta nómina?',
                    html: `
                    <div class="text-start">
                        <p><strong>Semana:</strong> ${info.numero_semana}</p>
                        <p><strong>Año:</strong> ${info.anio}</p>
                        <p><strong>Percepciones:</strong> $${parseFloat(info.total_percepciones).toFixed(2)}</p>
                        <p><strong>Deducciones:</strong> $${parseFloat(info.total_deducciones).toFixed(2)}</p>
                        <p><strong>Neto:</strong> $${parseFloat(info.total_neto).toFixed(2)}</p>
                    </div>
                `,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#198754',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sí, cargar',
                    cancelButtonText: 'Cancelar'
                }).then(function (result) {

                    if (!result.isConfirmed) return;

                    try {
                        // Parsear el JSON de la nómina almacenada en BD
                        jsonNominaHuasteca = JSON.parse(respuesta.nomina_json);

                        // Cargar la interfaz igual que restoreNomina()
                        cargarFiltroDepartamentos();
                        llenarTablaNomina();
                        saveNomina(jsonNominaHuasteca);
                        cambiarVistaTablaNomina();

                        mostrarAlerta(
                            'success',
                            'Nómina recuperada',
                            `Se cargó la nómina de la semana ${info.numero_semana} del ${info.anio}.`
                        );

                    } catch (err) {
                        console.error('Error al parsear la nómina recuperada:', err);
                        mostrarAlerta(
                            'error',
                            'Error',
                            'La nómina recuperada tiene un formato inválido.'
                        );
                    }

                });

            },
            error: function () {
                Swal.close();
                mostrarAlerta('error', 'Error', 'Ocurrió un error al conectar con el servidor.');
            }
        });

    });

}
