$(document).ready(function () {

    $(document).on("click", "#btn_guardar_datos", function (e) {
        // Obtener los datos guardados del sessionStorage (no localStorage)
        const datosGuardados = JSON.parse(sessionStorage.getItem('reloj-ocho'));
        
        if (!datosGuardados) {
            Swal.fire({
                title: "Error",
                text: "No hay datos para guardar. Por favor, carga primero los archivos Excel.",
                icon: "error"
            });
            return;
        }

        Swal.fire({
            title: "¿Guardar datos?",
            html: `<div style='text-align:left'>
                <p>Se guardará el resumen semanal:</p>
                <ul style='margin-left:1em;'>
                    <li><strong>Semana:</strong> ${datosGuardados.numero_semana}</li>
                    <li>🏖️ Vacaciones</li>
                    <li>🚫 Ausencias</li>
                    <li>🤒 Incapacidades</li>
                    <li>🗓️ Días trabajados</li>
                </ul>
            </div>`,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "rgba(86, 86, 86, 1)",
            confirmButtonText: "Sí, guardar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                // Mostrar loading
                Swal.fire({
                    title: 'Guardando...',
                    text: 'Por favor espere',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Enviar datos al servidor
                $.ajax({
                    url: '../php/guardar_datos.php',
                    type: 'POST',
                    data: JSON.stringify(datosGuardados),
                    contentType: 'application/json',
                    success: function(response) {
                        console.log('Respuesta del servidor:', response);
                        Swal.fire({
                            title: "¡Guardado!",
                            html: `<div>
                                <p>${response.message || "Los datos han sido guardados correctamente."}</p>
                                ${response.resumen ? `
                                <div style="margin-top: 1rem; text-align: left;">
                                    <strong>Resumen:</strong><br>
                                    🏖️ Vacaciones: ${response.resumen.vacaciones ?? 0}<br>
                                    🚫 Ausencias: ${response.resumen.ausencias ?? 0}<br>
                                    🤒 Incapacidades: ${response.resumen.incapacidades ?? 0}<br>
                                    🗓️ Días trabajados: ${response.resumen.dias_trabajados ?? 0}
                                </div>
                                ` : ''}
                            </div>`,
                            icon: "success"
                        });
                    },
                    error: function(xhr, status, error) {
                        console.error('Error en AJAX:', error);
                        console.error('Respuesta:', xhr.responseText);
                        let errorMsg = "Error al guardar los datos.";
                        if (xhr.responseJSON && xhr.responseJSON.message) {
                            errorMsg = xhr.responseJSON.message;
                        } else if (xhr.responseText) {
                            errorMsg = xhr.responseText;
                        }
                        Swal.fire({
                            title: "Error",
                            text: errorMsg,
                            icon: "error"
                        });
                    }
                });
            }
        });
    });


});