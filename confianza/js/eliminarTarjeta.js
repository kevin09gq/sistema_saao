// eliminarTarjeta.js
// Asigna 0 a la propiedad `tarjeta` de TODOS los empleados en jsonNominaConfianza
// Uso: botón con id #btn_delete_tarjeta

function eliminarTarjetaDeEmpleados() {
    $(document).on('click', '#btn_delete_tarjeta', function() {
        if (typeof jsonNominaConfianza === 'undefined' || !jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) {
            console.warn('No hay nómina cargada para eliminar tarjetas.');
            return;
        }

        // Confirmación con SweetAlert2
        Swal.fire({
            title: '¿Quitar tarjeta a todos los empleados?',
            text: 'Esta acción establecerá 0 a "tarjeta" para todos los empleados.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, quitar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Iterar departamentos y empleados y asignar 0 a tarjeta
                jsonNominaConfianza.departamentos.forEach(departamento => {
                    if (!Array.isArray(departamento.empleados)) return;
                    departamento.empleados.forEach(empleado => {
                        empleado.tarjeta = 0; // asignación directa, sencillo y claro
                    });
                });

                // Guardar cambios en storage si la función existe
                if (typeof saveNomina === 'function') {
                    saveNomina(jsonNominaConfianza);
                }

                // Refrescar la tabla mostrando la página actual (si está definida)
                if (typeof mostrarDatosTabla === 'function') {
                    mostrarDatosTabla(jsonNominaConfianza, (typeof paginaActualNomina !== 'undefined' ? paginaActualNomina : 1));
                }

                // Mostrar confirmación modal (tamaño normal, no toast)
                Swal.fire({
                    icon: 'success',
                    title: 'Tarjetas quitadas',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                });
            }
        });
    });
}
