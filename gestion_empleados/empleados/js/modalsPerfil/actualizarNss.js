//====================================================
// FUNCIÓN PARA CAMBIAR EL ESTATUS DE NSS DEL EMPLEADO
//====================================================

function cambiarStatusNss(idEmpleado, statusActual) {

    // Validar que se haya recibido el ID del empleado
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

    // Determinar nuevo estatus (1 -> 0, 0 -> 1)
    const nuevoStatus = (parseInt(statusActual) === 1) ? 0 : 1;
    const textoNuevoStatus = nuevoStatus === 1 ? 'Sí' : 'No';
    const badgeColor = nuevoStatus === 1 ? 'bg-success' : 'bg-danger';
    const iconoBadge = nuevoStatus === 1 ? '✓' : '✗';

    // Confirmación con SweetAlert2
    Swal.fire({
        title: nuevoStatus === 1 ? '¿Activar Seguro Social (NSS)?' : '¿Desactivar Seguro Social (NSS)?',
        html: `
            <div class="text-center my-2">
                <p class="mb-2">¿Deseas cambiar el estatus de NSS para <strong>${nombreCompleto}</strong>?</p>
                <div class="p-2 rounded bg-light border d-inline-block">
                    Nuevo estatus: <span class="badge ${badgeColor}">${iconoBadge} ${textoNuevoStatus}</span>
                </div>
            </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: nuevoStatus === 1 ? "#2d6a4f" : "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: nuevoStatus === 1
            ? '<i class="bi bi-check-circle me-1"></i> Sí, activar'
            : '<i class="bi bi-x-circle me-1"></i> Sí, desactivar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {

        if (result.isConfirmed) {

            // Mostrar carga mientras se procesa la petición
            Swal.fire({
                title: "Actualizando estatus...",
                text: "Por favor, espera un momento.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Petición AJAX para actualizar el estatus en la base de datos
            $.ajax({
                type: "POST",
                url: "../php/infoEmpleado.php",
                data: {
                    accion: "actualizarStatusNss",
                    id_empleado: idEmpleado,
                    status_nss: nuevoStatus
                },
                dataType: "json",

                success: function (response) {

                    if (response.success) {

                        // Actualizar en el arreglo global de empleados
                        const empIndex = empleados.findIndex(e => e.id_empleado == idEmpleado);
                        if (empIndex !== -1) {
                            empleados[empIndex].status_nss = nuevoStatus;
                        }

                        // Actualizar en el arreglo de empleados filtrados
                        const empFiltIndex = empleadosFiltrados.findIndex(e => e.id_empleado == idEmpleado);
                        if (empFiltIndex !== -1) {
                            empleadosFiltrados[empFiltIndex].status_nss = nuevoStatus;
                        }

                        // Volver a renderizar la tabla de empleados
                        if (typeof mostrarEmpleados === 'function') {
                            mostrarEmpleados();
                        }

                        // Notificación de éxito
                        Swal.fire({
                            icon: "success",
                            title: "¡Actualizado!",
                            text: response.mensaje || "El estatus de NSS ha sido actualizado correctamente.",
                            timer: 2000,
                            showConfirmButton: false
                        });

                    } else {

                        // Notificación de error si el servidor reporta fallo
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: response.mensaje || "No se pudo actualizar el estatus de NSS.",
                            confirmButtonColor: "#2d6a4f"
                        });

                    }
                },

                error: function (xhr, status, error) {

                    console.error("Error al actualizar status_nss:", error);
                    console.error(xhr.responseText);

                    Swal.fire({
                        icon: "error",
                        title: "Error de servidor",
                        text: "Ocurrió un error al intentar comunicarse con el servidor.",
                        confirmButtonColor: "#2d6a4f"
                    });
                }
            });

        }
    });
}
