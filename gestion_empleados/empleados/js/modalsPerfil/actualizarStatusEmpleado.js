//====================================================
// FUNCIÓN PRINCIPAL PARA CAMBIAR ESTATUS (ALTA / BAJA)
// AL DAR CLIC EN EL BADGE DE STATUS EN LA TABLA
//====================================================

function cambiarStatusEmpleado(idEmpleado, statusActual) {

    if (!idEmpleado) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se identificó al empleado seleccionado.",
            confirmButtonColor: "#2d6a4f"
        });
        return;
    }

    // Buscar información del empleado en el arreglo global
    const empleado = empleados.find(emp => emp.id_empleado == idEmpleado);
    const nombreCompleto = empleado
        ? `${empleado.nombre} ${empleado.ap_paterno} ${empleado.ap_materno ?? ''}`.trim()
        : 'el empleado';

    const tieneFechaAlta = empleado && empleado.fecha_alta_empresa && empleado.fecha_alta_empresa !== '0000-00-00';
    const hoyISO = obtenerFechaHoyISO();
    const hoyTexto = formatearFechaEspanol(hoyISO);

    // Si actualmente está ACTIVO (1), se pasará a INACTIVO / BAJA (2)
    if (statusActual == 1) {

        if (tieneFechaAlta) {

            // Caso con fecha alta empresa: preguntar si usar fecha de hoy o una fecha específica para la baja
            Swal.fire({
                title: 'Dar de baja al empleado',
                html: `
                    <div class="text-start px-2 py-1">
                        <p class="mb-3 text-secondary">¿Deseas dar de baja a <strong>${nombreCompleto}</strong>?</p>
                        
                        <div class="border rounded p-3 bg-light mb-3">
                            <label class="form-label small fw-bold text-dark d-block mb-2">
                                <i class="bi bi-calendar-event me-1 text-success"></i> Fecha de baja (salida):
                            </label>
                            
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="radio" name="swalOpcionFechaBaja" id="swalRadioHoy" value="hoy" checked>
                                <label class="form-check-label fw-semibold" for="swalRadioHoy">
                                    Usar fecha de hoy (${hoyTexto})
                                </label>
                            </div>
                            
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="radio" name="swalOpcionFechaBaja" id="swalRadioEspecifica" value="especifica">
                                <label class="form-check-label fw-semibold" for="swalRadioEspecifica">
                                    Seleccionar fecha específica
                                </label>
                            </div>

                            <div id="swalContenedorFechaPersonalizada" class="mt-2" style="display: none;">
                                <input type="date" id="swalInputFechaBaja" class="form-control form-control-sm" value="${hoyISO}">
                            </div>
                        </div>
                        
                        <small class="text-muted d-block">
                            <i class="bi bi-info-circle me-1"></i> Se registrará la salida en el historial de reingresos.
                        </small>
                    </div>
                `,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#6c757d",
                confirmButtonText: '<i class="bi bi-person-x me-1"></i> Sí, dar de baja',
                cancelButtonText: 'Cancelar',
                reverseButtons: true,
                didOpen: () => {
                    $('input[name="swalOpcionFechaBaja"]').on('change', function () {
                        if ($(this).val() === 'especifica') {
                            $('#swalContenedorFechaPersonalizada').slideDown(150);
                        } else {
                            $('#swalContenedorFechaPersonalizada').slideUp(150);
                        }
                    });
                },
                preConfirm: () => {
                    const opcion = $('input[name="swalOpcionFechaBaja"]:checked').val();
                    if (opcion === 'especifica') {
                        const fechaVal = $('#swalInputFechaBaja').val();
                        if (!fechaVal) {
                            Swal.showValidationMessage('Debes seleccionar una fecha de baja válida.');
                            return false;
                        }
                        if (empleado.fecha_alta_empresa && fechaVal < empleado.fecha_alta_empresa) {
                            Swal.showValidationMessage('La fecha de baja no puede ser anterior a la fecha de alta empresa (' + formatearFechaEspanol(empleado.fecha_alta_empresa) + ').');
                            return false;
                        }
                        return fechaVal;
                    }
                    return hoyISO;
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const fechaSalidaElegida = result.value;
                    enviarCambioStatus(idEmpleado, 2, { fecha_salida: fechaSalidaElegida });
                }
            });

        } else {

            // Caso sin fecha alta empresa: solo actualizar estatus
            Swal.fire({
                title: '¿Dar de baja al empleado?',
                html: `
                    <div class="text-start px-2 py-1">
                        <p class="mb-2">¿Deseas dar de baja a <strong>${nombreCompleto}</strong>?</p>
                        <div class="alert alert-warning py-2 px-3 small mb-0">
                            <i class="bi bi-exclamation-triangle me-1"></i> El empleado no cuenta con <strong>fecha de alta empresa</strong> registrada, por lo que únicamente se actualizará su estatus a <strong>Inactivo</strong>.
                        </div>
                    </div>
                `,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#6c757d",
                confirmButtonText: '<i class="bi bi-person-x me-1"></i> Sí, dar de baja',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    enviarCambioStatus(idEmpleado, 2, {});
                }
            });

        }

    } else {

        // Si actualmente está INACTIVO (2), se pasará a ACTIVO / ALTA (1)
        if (tieneFechaAlta) {

            // Caso con fecha alta empresa: registrar reingreso con fecha de hoy
            Swal.fire({
                title: '¿Dar de alta / reactivar empleado?',
                html: `
                    <div class="text-center my-2">
                        <p class="mb-3">¿Deseas reactivar y dar de alta a <strong>${nombreCompleto}</strong>?</p>
                        <div class="p-3 rounded bg-light border d-inline-block text-start small">
                            <div class="mb-1"><strong>Nuevo estatus:</strong> <span class="badge bg-success">Activo</span></div>
                            <div><strong>Fecha de reingreso:</strong> Hoy (${hoyTexto})</div>
                        </div>
                    </div>
                `,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#2d6a4f",
                cancelButtonColor: "#6c757d",
                confirmButtonText: '<i class="bi bi-check-circle me-1"></i> Sí, dar de alta',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    enviarCambioStatus(idEmpleado, 1, { fecha_reingreso: hoyISO });
                }
            });

        } else {

            // Caso sin fecha alta empresa: solo actualizar estatus
            Swal.fire({
                title: '¿Reactivar empleado?',
                html: `
                    <div class="text-start px-2 py-1">
                        <p class="mb-2">¿Deseas activar a <strong>${nombreCompleto}</strong>?</p>
                        <div class="alert alert-info py-2 px-3 small mb-0">
                            <i class="bi bi-info-circle me-1"></i> El empleado no cuenta con <strong>fecha de alta empresa</strong> registrada, por lo que únicamente se actualizará su estatus a <strong>Activo</strong>.
                        </div>
                    </div>
                `,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#2d6a4f",
                cancelButtonColor: "#6c757d",
                confirmButtonText: '<i class="bi bi-check-circle me-1"></i> Sí, activar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    enviarCambioStatus(idEmpleado, 1, {});
                }
            });

        }
    }
}


//====================================================
// FUNCIÓN PARA ENVIAR LA PETICIÓN AJAX DE CAMBIO DE STATUS
//====================================================

function enviarCambioStatus(idEmpleado, nuevoStatus, datosExtra = {}) {

    // Mostrar loader durante la petición
    Swal.fire({
        title: "Actualizando estatus...",
        text: "Por favor, espera un momento.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const dataAEnviar = Object.assign({
        accion: "cambiarStatusEmpleado",
        id_empleado: idEmpleado,
        nuevo_status: nuevoStatus
    }, datosExtra);

    $.ajax({
        type: "POST",
        url: "../php/infoReingresos.php",
        data: dataAEnviar,
        dataType: "json",

        success: function (response) {

            if (response.success) {

                // Actualizar en el arreglo global de empleados
                const empIndex = empleados.findIndex(e => e.id_empleado == idEmpleado);
                if (empIndex !== -1) {
                    empleados[empIndex].id_status = nuevoStatus;
                }

                // Actualizar en el arreglo filtrado
                const empFiltIndex = empleadosFiltrados.findIndex(e => e.id_empleado == idEmpleado);
                if (empFiltIndex !== -1) {
                    empleadosFiltrados[empFiltIndex].id_status = nuevoStatus;
                }

                // Volver a aplicar filtros para actualizar la tabla respetando la pestaña activa
                if (typeof aplicarFiltros === 'function') {
                    aplicarFiltros(true);
                } else if (typeof mostrarEmpleados === 'function') {
                    mostrarEmpleados();
                }

                Swal.fire({
                    icon: "success",
                    title: "¡Estatus actualizado!",
                    text: response.mensaje,
                    timer: 2200,
                    showConfirmButton: false
                });

            } else {

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.mensaje || "No se pudo actualizar el estatus.",
                    confirmButtonColor: "#2d6a4f"
                });

            }
        },

        error: function (xhr, status, error) {
            console.error("Error al cambiar estatus del empleado:", error);
            console.error(xhr.responseText);

            Swal.fire({
                icon: "error",
                title: "Error de servidor",
                text: "Ocurrió un error al comunicarse con el servidor.",
                confirmButtonColor: "#2d6a4f"
            });
        }
    });
}


//====================================================
// FUNCIONES AUXILIARES DE FECHA PARA CAMBIO DE STATUS
//====================================================

function obtenerFechaHoyISO() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

function formatearFechaEspanol(fechaISO) {
    if (!fechaISO) return '';
    const partes = fechaISO.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fechaISO;
}

