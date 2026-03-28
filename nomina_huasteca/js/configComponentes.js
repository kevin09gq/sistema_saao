quitarTarjeta();
updateTarjeta();


// ============================================
// FUNCIONES DE INICIALIZACIÓN Y CONFIGURACIÓN DE COMPONENTES
// RECUERDA CAMBIAR container-acceso-huasteca A container-nomina_huasteca
// CUANDO HAYA EMPLEADOS ASEGURADOS
// ============================================

function initComponents() {
    $("#container-nomina_huasteca").attr("hidden", true);
    $("#container-acceso-huasteca").attr("hidden", true);
    $("#tabla-nomina-responsive").removeAttr("hidden");
    $("#config-valores-huasteca").attr("hidden", true);
    // Se oculta la tabla de corte
    $("#tabla-corte-container-huasteca").prop("hidden", true);
}

// ============================================
// MOSTRAR CONFIGURACIÓN DE VALORES Y ASIGNAR EVENTOS
// RECUERDA CAMBIAR container-acceso-huasteca A container-nomina_huasteca
// CUANDO HAYA EMPLEADOS ASEGURADOS
// ============================================
function mostrarConfigValores(bandera) {
    // Cerrar cualquier alerta de carga abierta
    Swal.close();

    $("#container-acceso-huasteca").attr("hidden", true);
    $("#config-valores-huasteca").removeAttr("hidden");
    asignarValoresConfig(bandera);
    actualizarCabeceraNomina(jsonNominaHuasteca);
}

// ============================================
// OBTENER EL VALOR DEL PASAJE Y TARDEADA, ASIGNAR AL JSON
// ============================================
function asignarValoresConfig(statusRancho = true) {
    $("#btn_config_avanzar_huasteca").click(function (e) {
        e.preventDefault();

        // Obtener los valores de los inputs
        let pasajeVal = $("#precio_pasaje_huasteca").val().trim();
        let tardeadaVal = $("#pago_tardeada_huasteca").val().trim();
        let comidaVal = $("#pago_comida_huasteca").val().trim();

        // Si están vacíos, asignar 0, si no parsear
        let pasaje = pasajeVal === '' ? 0 : parseFloat(pasajeVal);
        let tardeada = tardeadaVal === '' ? 0 : parseFloat(tardeadaVal);
        let comida = comidaVal === '' ? 0 : parseFloat(comidaVal);

        // Validar que sean números válidos
        if (isNaN(pasaje) || isNaN(tardeada) || isNaN(comida)) {
            Swal.fire('Error', 'Los valores deben ser números válidos', 'error');
            return;
        }

        // Asignar valores al JSON global
        jsonNominaHuasteca.precio_pasaje = pasaje;
        jsonNominaHuasteca.pago_tardeada = tardeada;
        jsonNominaHuasteca.pago_comida = comida;

        // Guardar valores de configuración en localStorage
        saveNomina(jsonNominaHuasteca);

        $("#config-valores-huasteca").attr("hidden", true);
        $("#tabla-nomina-responsive").removeAttr("hidden");

        if (statusRancho) {

            // obtenerHorarioRancho es async: llamará calcularSueldoSemanal que refresca la tabla
            obtenerHorarioRancho();


        } else {
            // Sin horarioRancho (nómina restaurada): renderizar tabla directamente
            //  let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaHuasteca, 8);
            // mostrarDatosTabla(jsonFiltrado, 1);
        }
    });
}

// ============================================
// LIMPIAR CAMPOS DE NÓMINA
// ============================================
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
                // Asignar null a la variable local para que beforeunload no re-guarde en localStorage
                jsonNominaHuasteca = null;
                // $("#container-nomina_huasteca").removeAttr("hidden");
                $("#container-acceso-huasteca").removeAttr("hidden");
                $("#tabla-nomina-responsive").attr("hidden", true);
                // Resetear el tab de Bootstrap a "Crear"
                var tabCrear = new bootstrap.Tab(document.getElementById('tab-crear-nomina'));
                tabCrear.show();
            }
        });


    });

}



// ============================================
// ACTUALIZAR CONCEPTOS Y TARJETA A TODOS LOS EMPLEADOS
// ============================================
function updateTarjeta() {
    $(document).on('click', '#btn_aplicar_copias_global', function (e) {
        e.preventDefault();

        if (!jsonNominaHuasteca || !Array.isArray(jsonNominaHuasteca.departamentos)) {
            alert('No hay nómina cargada para aplicar copias.');
            return;
        }

        let totalAplicados = 0;

        jsonNominaHuasteca.departamentos.forEach(depto => {
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
        saveNomina(jsonNominaHuasteca);
        // Actualizar la tabla manteniendo el filtrado y paginación actual
        const id_departamento = parseInt($('#filtro_departamento').val());
        const id_puestoEspecial = parseInt($('#filtro_puesto').val());

        // Aplicar los mismos filtros que están activos
        let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaHuasteca, id_departamento);
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

// ============================================
// QUITA TARJETA A TODOS LOS EMPLEADOS 
// ============================================
function quitarTarjeta() {

    $(document).on('click', '#btn_delete_tarjeta', function () {
        if (typeof jsonNominaHuasteca === 'undefined' || !jsonNominaHuasteca || !Array.isArray(jsonNominaHuasteca.departamentos)) {
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
                jsonNominaHuasteca.departamentos.forEach(departamento => {
                    if (!Array.isArray(departamento.empleados)) return;
                    departamento.empleados.forEach(empleado => {
                        empleado.tarjeta = 0; // asignación directa, sencillo y claro
                    });
                });

                saveNomina(jsonNominaHuasteca);
                const id_departamento = parseInt($('#filtro_departamento').val());
                const id_puestoEspecial = parseInt($('#filtro_puesto').val());

                // Aplicar los mismos filtros que están activos
                let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaHuasteca, id_departamento);
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

// Función para actualizar la cabecera de la nómina
function actualizarCabeceraNomina(json) {
    if (!json) return;

    // Función para obtener el nombre del mes en español
    function mesEnLetras(mes) {
        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        return meses[mes - 1];
    }

    // Extraer día, mes y año de las fechas
    function descomponerFecha(fecha) {
        // Verificar que la fecha no sea null o undefined
        if (!fecha) {
            return { dia: '', mes: '', anio: '' };
        }

        // Ejemplo: "21/Jun/2025" o "21/05/2025"
        const partes = fecha.split('/');
        let dia = partes[0] || '';
        let mes = partes[1] || '';
        let anio = partes[2] || '';

        // Si el mes es numérico, conviértelo a nombre
        if (/^\d+$/.test(mes)) {
            mes = mesEnLetras(parseInt(mes, 10));
        } else {
            // Si el mes es abreviado (Jun), conviértelo a nombre completo
            const mesesAbrev = {
                'Ene': 'Enero', 'Feb': 'Febrero', 'Mar': 'Marzo', 'Abr': 'Abril', 'May': 'Mayo', 'Jun': 'Junio',
                'Jul': 'Julio', 'Ago': 'Agosto', 'Sep': 'Septiembre', 'Oct': 'Octubre', 'Nov': 'Noviembre', 'Dic': 'Diciembre'
            };
            mes = mesesAbrev[mes] || mes;
        }
        return { dia, mes, anio };
    }

    // Verificar que las fechas existan antes de procesarlas
    if (!json.fecha_inicio || !json.fecha_cierre) {
        $('#nombre_nomina').text('NÓMINA');
        $('#num_semana').text(`SEM ${json.numero_semana || ''}`);
        return;
    }

    const ini = descomponerFecha(json.fecha_inicio);
    const fin = descomponerFecha(json.fecha_cierre);

    let nombreNomina = '';
    if (ini.anio === fin.anio) {
        if (ini.mes === fin.mes) {
            // Mismo mes y año
            nombreNomina = `NÓMINA DEL ${ini.dia} AL ${fin.dia} DE ${fin.mes.toUpperCase()} DEL ${fin.anio}`;
        } else {
            // Mismo año, diferente mes
            nombreNomina = `NÓMINA DEL ${ini.dia} ${ini.mes.toUpperCase()} AL ${fin.dia} DE ${fin.mes.toUpperCase()} DEL ${fin.anio}`;
        }
    } else {
        // Diferente año
        nombreNomina = `NÓMINA DEL ${ini.dia} ${ini.mes.toUpperCase()} DEL ${ini.anio} AL ${fin.dia} DE ${fin.mes.toUpperCase()} DEL ${fin.anio}`;
    }

    $('#nombre_nomina').text(nombreNomina);
    $('#num_semana').text(`SEM ${json.numero_semana}`);
}
