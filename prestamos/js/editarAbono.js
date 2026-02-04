$(document).ready(function () {
    
    const URL_BASE = "/sistema_saao/";
    
    // Obtener el id_abono de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idAbono = urlParams.get('id_abono');

    if (!idAbono) {
        Swal.fire('Error', 'No se proporcionó un ID de abono válido', 'error').then(() => {
            window.history.back();
        });
        return;
    }

    // Cargar datos del abono
    cargarDatosAbono();

    function cargarDatosAbono() {
        $.ajax({
            type: 'GET',
            url: URL_BASE + 'prestamos/php/obtenerAbono.php',
            data: { id_abono: idAbono },
            dataType: 'json',
            success: function (response) {
                if (!response || !response.data) {
                    Swal.fire('Error', 'No se pudo cargar la información del abono', 'error').then(() => {
                        window.history.back();
                    });
                    return;
                }

                let abono = response.data;
                
                // Llenar campos del formulario
                $('#empleado').val(abono.empleado || '-');
                $('#folio_prestamo').val(abono.folio || '-');
                $('#fecha_asignacion').val(abono.fecha_registro || '-');
                $('#monto_abono').val(abono.monto_pago || '0.00');
                $('#semana').val(abono.num_sem_pago || '-');
                $('#anio').val(abono.anio_pago || '-');
                
                // Convertir fecha_pago a formato datetime-local (YYYY-MM-DDTHH:MM)
                if (abono.fecha_pago) {
                    let fechaPago = new Date(abono.fecha_pago);
                    let year = fechaPago.getFullYear();
                    let month = String(fechaPago.getMonth() + 1).padStart(2, '0');
                    let day = String(fechaPago.getDate()).padStart(2, '0');
                    let hours = String(fechaPago.getHours()).padStart(2, '0');
                    let minutes = String(fechaPago.getMinutes()).padStart(2, '0');
                    $('#fecha_pago').val(`${year}-${month}-${day}T${hours}:${minutes}`);
                }
            },
            error: function (xhr) {
                let msg = 'Error al cargar el abono';
                if (xhr && xhr.responseJSON && xhr.responseJSON.mensaje) {
                    msg = xhr.responseJSON.mensaje;
                }
                Swal.fire('Error', msg, 'error').then(() => {
                    window.history.back();
                });
            }
        });
    }

    // Botón cancelar
    $(document).on('click', '#btnCancelar', function () {
        window.history.back();
    });

    // Enviar formulario
    $(document).on("submit", "#form-editar-abono", function (e) {
        e.preventDefault();

        let motivo = "AUTORIZACION PARA GUARDAR LOS CAMBIOS EN EL ABONO. ID ABONO: " + idAbono;

        let fechaPago = $('#fecha_pago').val();
        let semana = parseInt($('#semana').val());
        let anio = parseInt($('#anio').val());

        if (!fechaPago) {
            Swal.fire('Validación', 'Debes ingresar una fecha de pago', 'warning');
            return;
        }

        // Validar que la fecha esté dentro de la semana y año
        if (!validarFechaEnSemana(fechaPago, semana, anio)) {
            Swal.fire(
                'Fecha inválida', 
                `La fecha ingresada no corresponde a la semana ${semana} del año ${anio}. Por favor, ingresa una fecha válida.`,
                'error'
            );
            return;
        }

        // Pedir clave de autorización
        Swal.fire({
            title: "Ingresa clave de autorización",
            text: "Se requiere autorización para modificar el abono",
            input: "password",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Autorizar y Guardar",
            cancelButtonText: "Cancelar",
            showLoaderOnConfirm: true,
            preConfirm: async (clave) => {
                try {
                    // Validar clave
                    const authResponse = await $.ajax({
                        type: "POST",
                        url: URL_BASE + "public/php/obtenerAutorizacion.php",
                        data: { clave: clave, motivo: motivo },
                        dataType: "json"
                    });
                    
                    if (authResponse.clv !== true) {
                        return Swal.showValidationMessage(
                            authResponse.mensaje || 'Clave inválida'
                        );
                    }

                    // Clave correcta, guardar cambios
                    const saveResponse = await $.ajax({
                        type: "POST",
                        url: URL_BASE + "prestamos/php/guardarEdicionAbono.php",
                        data: {
                            id_abono: idAbono,
                            fecha_pago: fechaPago
                        },
                        dataType: "json"
                    });

                    // Retornar la respuesta para manejarla en .then()
                    return saveResponse;

                } catch (error) {
                    let res = error && error.responseJSON ? error.responseJSON : null;
                    return Swal.showValidationMessage(
                        res ? res.mensaje : 'Error al procesar la solicitud'
                    );
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const saveResponse = result.value;
                if (saveResponse.icono === 'success') {
                    Swal.fire(
                        saveResponse.titulo || '¡Éxito!',
                        saveResponse.mensaje || 'Abono actualizado correctamente',
                        'success'
                    ).then(() => {
                        window.history.back();
                    });
                } else {
                    Swal.fire(
                        saveResponse.titulo || 'Error',
                        saveResponse.mensaje || 'Error al guardar',
                        'error'
                    );
                }
            }
        });
    });

    /**
     * Validar que una fecha esté dentro de una semana y año específico
     */
    function validarFechaEnSemana(fechaStr, semana, anio) {
        let fecha = new Date(fechaStr);
        
        // Obtener el número de semana de la fecha
        let semanaFecha = obtenerNumeroSemana(fecha);
        let anioFecha = fecha.getFullYear();

        return semanaFecha === semana && anioFecha === anio;
    }

    /**
     * Calcular el número de semana de una fecha
     * Usa el estándar ISO 8601 (semana empieza en lunes)
     */
    function obtenerNumeroSemana(fecha) {
        let date = new Date(fecha.getTime());
        date.setHours(0, 0, 0, 0);
        // Jueves de la semana actual
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // Enero 4 es siempre en la semana 1
        let week1 = new Date(date.getFullYear(), 0, 4);
        // Calcular el número de semana
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

});