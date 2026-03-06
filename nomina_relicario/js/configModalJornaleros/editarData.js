editarPropiedadesJornalero();

function editarPropiedadesJornalero() {
    $("#btn-guardar-propiedades-jornalero").click(function (e) {
        e.preventDefault();
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        modificarPercepcionesJornalero(empleado);
        modificarConceptosJornalero(empleado);
        modificarDeduccionesJornalero(empleado);

        // Resetear flags de edición manual después de guardar
        delete empleado._checador_editado_manual;

        //limpiar empleado abierto después de guardar
        objEmpleadoJornalero.limpiarEmpleado();

        // Cerrar modal después de guardar
        $('#modal-jornaleros').modal('hide');

        limpiarModalJornalero();

        // Actualizar la tabla manteniendo el filtrado y paginación actual
        const id_departamento = parseInt($('#filtro_departamento').val());
        const id_puestoEspecial = parseInt($('#filtro_puesto').val());

        // Aplicar los mismos filtros que están activos
        let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, id_departamento);
        jsonFiltrado = filtrarEmpleadosPorPuesto(jsonFiltrado, id_puestoEspecial);

        // Mostrar la tabla en la página actual (usar window.paginaActualNomina para acceso global)

        mostrarDatosTabla(jsonFiltrado, window.paginaActualNomina || 1);

    });

}


/************************************
 * MODIFICAR PERCEPCIONES DEL EMPLEADO
 ************************************/

function modificarPercepcionesJornalero(empleado) {

    // Obtener valores de las percepciones del modal
    let sueldoSemanal = parseFloat($('#mod-sueldo-semanal-jornalero').val());
    let pasaje = parseFloat($('#mod-pasaje-jornalero').val());
    let comida = parseFloat($('#mod-comida-jornalero').val());
    let tardeada = parseFloat($('#mod-tardeada-jornalero').val());
    let sueldoExtraTotal = parseFloat($('#mod-total-extra-jornalero').val());

    // Si los valores son NaN o vacíos, establecer como 0
    sueldoSemanal = isNaN(sueldoSemanal) ? 0 : sueldoSemanal;
    pasaje = isNaN(pasaje) ? 0 : pasaje;
    comida = isNaN(comida) ? 0 : comida;
    tardeada = isNaN(tardeada) ? 0 : tardeada;
    sueldoExtraTotal = isNaN(sueldoExtraTotal) ? 0 : sueldoExtraTotal;

    // Establecer los valores en el objeto empleado
    empleado.salario_semanal = sueldoSemanal;
    empleado.pasaje = pasaje;
    empleado.comida = comida;
    empleado.tardeada = tardeada;
    empleado.sueldo_extra_total = sueldoExtraTotal;

}

/************************************
 * MODIFICAR CONCEPTOS DEL EMPLEADO
 ************************************/

function modificarConceptosJornalero(empleado) {
    // Conceptos específicos
    const conceptos = empleado.conceptos || [];

    const actualizarConceptoJornalero = (codigo, nuevoResultado) => {
        const concepto = conceptos.find(c => c.codigo === codigo);
        if (concepto) {
            concepto.resultado = nuevoResultado;
        } else {
            conceptos.push({ codigo, resultado: nuevoResultado });
        }
    };

    actualizarConceptoJornalero("45", parseFloat($('#mod-isr-jornalero').val()) || 0); // ISR
    actualizarConceptoJornalero("52", parseFloat($('#mod-imss-jornalero').val()) || 0); // IMSS
    actualizarConceptoJornalero("16", parseFloat($('#mod-infonavit-jornalero').val()) || 0); // Infonavit
    actualizarConceptoJornalero("107", parseFloat($('#mod-ajustes-sub-jornalero').val()) || 0); // Ajuste al Sub
}


/************************************
 * MODIFICAR DEDUCCIONES DEL EMPLEADO
 ************************************/


// Esta función marca flags (_retardos_editado_manual, _checador_editado_manual, _inasistencia_editado_manual) en el objeto empleado
// para indicar que el usuario editó manualmente el campo o lo dejó vacío en el modal.
// Si el flag está presente, las funciones automáticas NO sobreescriben el valor manual.
function modificarDeduccionesJornalero(empleado) {
    let tarjeta = parseFloat($('#mod-tarjeta-jornalero').val());
    let prestamo = parseFloat($('#mod-prestamo-jornalero').val());
    let checador = parseFloat($('#mod-checador-jornalero').val());
    let retardos = parseFloat($('#mod-retardos-jornalero').val());
    let permiso = parseFloat($('#mod-permisos-jornalero').val());
    let uniformes = parseFloat($('#mod-uniforme-jornalero').val());
    let fagafetcofia = parseFloat($('#mod-fagafetcofia-jornalero').val());

    // Si los valores son NaN o vacíos, establecer como 0
    tarjeta = isNaN(tarjeta) ? 0 : tarjeta;
    prestamo = isNaN(prestamo) ? 0 : prestamo;
    checador = isNaN(checador) ? 0 : checador;
    retardos = isNaN(retardos) ? 0 : retardos;
    permiso = isNaN(permiso) ? 0 : permiso;
    uniformes = isNaN(uniformes) ? 0 : uniformes;
    fagafetcofia = isNaN(fagafetcofia) ? 0 : fagafetcofia;
    // Marcar si fueron editados manualmente
    // Si el input está vacío O si el valor cambió, marcar flag para proteger

    const checadorVacio = $('#mod-checador-jornalero').val() === '';

    if (checadorVacio || checador !== (empleado.checador || 0)) {
        empleado._checador_editado_manual = true;
    }

    empleado.tarjeta = tarjeta;
    empleado.prestamo = prestamo;
    empleado.checador = checador;
    empleado.retardos = retardos;
    empleado.permiso = permiso;
    empleado.uniformes = uniformes;
    empleado.fa_gafet_cofia = fagafetcofia;

}





