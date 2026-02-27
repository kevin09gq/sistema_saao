

function initComponents() {
    $("#container-nomina_relicario").attr("hidden", true);
    $("#tabla-nomina-responsive").removeAttr("hidden");
    $("#config-valores-relicario").attr("hidden", true);
}


function mostrarConfigValores() {
    $("#container-nomina_relicario").attr("hidden", true);
    $("#config-valores-relicario").removeAttr("hidden");
    asignarValoresConfig();
}

function asignarValoresConfig() {
    $("#btn_config_avanzar_relicario").click(function (e) {
        e.preventDefault();

        // Obtener los valores de los inputs
        let pasajeVal = $("#precio_pasaje_relicario").val().trim();
        let tardeadaVal = $("#pago_tardeada_relicario").val().trim();

        // Si están vacíos, asignar 0, si no parsear
        let pasaje = pasajeVal === '' ? 0 : parseFloat(pasajeVal);
        let tardeada = tardeadaVal === '' ? 0 : parseFloat(tardeadaVal);

        // Validar que sean números válidos
        if (isNaN(pasaje) || isNaN(tardeada)) {
            Swal.fire('Error', 'Los valores deben ser números válidos', 'error');
            return;
        }

        // Asignar valores al JSON global
        jsonNominaRelicario.precio_pasaje = pasaje;
        jsonNominaRelicario.pago_tardeada = tardeada;

        $("#config-valores-relicario").attr("hidden", true);
        // Filtrar empleados con id_tipo_puesto 1
        let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, 7);

        mostrarDatosTabla(jsonFiltrado, 1);
        $("#tabla-nomina-responsive").removeAttr("hidden");
    });
}


function limpiarCamposNomina() {
    $("#btn_limpiar_datos").click(function (e) {
        e.preventDefault();

        Swal.fire({
            title: '¿Limpiar datos?',
            text: '¿Está seguro que desea limpiar todos los datos? Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, limpiar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                clearNomina();
                $("#container-nomina_relicario").removeAttr("hidden");
                $("#tabla-nomina-responsive").attr("hidden", true);
            }
        });


    });

}

updateTarjeta();
function updateTarjeta() {
    $(document).on('click', '#btn_aplicar_copias_global', function (e) {
        e.preventDefault();

        if (!jsonNominaRelicario || !Array.isArray(jsonNominaRelicario.departamentos)) {
            alert('No hay nómina cargada para aplicar copias.');
            return;
        }

        let totalAplicados = 0;

        jsonNominaRelicario.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                // Asignar conceptos_copia a conceptos
                if (Array.isArray(emp.conceptos_copia) && emp.conceptos_copia.length > 0) {
                    emp.conceptos = JSON.parse(JSON.stringify(emp.conceptos_copia));
                }

                // Actualizar tarjeta con lo que hay en tarjeta_copia
                if (emp.tarjeta_copia !== undefined && emp.tarjeta_copia !== null) {
                    emp.tarjeta = emp.tarjeta_copia;
                }

                totalAplicados++;
            });
        });

        // Guardar cambios
        saveNomina(jsonNominaRelicario);
        // Actualizar la tabla manteniendo el filtrado y paginación actual
        const id_departamento = parseInt($('#filtro_departamento').val());
        const id_puestoEspecial = parseInt($('#filtro_puesto').val());

        // Aplicar los mismos filtros que están activos
        let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, id_departamento);
        jsonFiltrado = filtrarEmpleadosPorPuesto(jsonFiltrado, id_puestoEspecial);

        // Mostrar la tabla en la página actual (usar window.paginaActualNomina para acceso global)

        mostrarDatosTabla(jsonFiltrado, window.paginaActualNomina || 1);



        // Mostrar confirmación
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Copias aplicadas',
                text: 'Se aplicaron copias a ' + totalAplicados + ' empleados.'
            });
        } else {
            alert('Copias aplicadas a ' + totalAplicados + ' empleados.');
        }
    });
}
quitarTarjeta();
function quitarTarjeta() {

    $(document).on('click', '#btn_delete_tarjeta', function () {
        if (typeof jsonNominaRelicario === 'undefined' || !jsonNominaRelicario || !Array.isArray(jsonNominaRelicario.departamentos)) {
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
                jsonNominaRelicario.departamentos.forEach(departamento => {
                    if (!Array.isArray(departamento.empleados)) return;
                    departamento.empleados.forEach(empleado => {
                        empleado.tarjeta = 0; // asignación directa, sencillo y claro
                    });
                });

                saveNomina(jsonNominaRelicario);
                const id_departamento = parseInt($('#filtro_departamento').val());
                const id_puestoEspecial = parseInt($('#filtro_puesto').val());

                // Aplicar los mismos filtros que están activos
                let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, id_departamento);
                jsonFiltrado = filtrarEmpleadosPorPuesto(jsonFiltrado, id_puestoEspecial);

                // Mostrar la tabla en la página actual (usar window.paginaActualNomina para acceso global)

                mostrarDatosTabla(jsonFiltrado, window.paginaActualNomina || 1);



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
