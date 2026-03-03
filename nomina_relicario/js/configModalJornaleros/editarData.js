editarPropiedadesJornalero();

function editarPropiedadesJornalero() {
    $("#btn-guardar-propiedades-jornalero").click(function (e) {
        e.preventDefault();
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        modificarPercepcionesJornalero(empleado);
        modificarConceptosJornalero(empleado);


        //limpiar empleado abierto después de guardar
        objEmpleadoJornalero.limpiarEmpleado();


        // Cerrar modal después de guardar
        $('#modal-jornaleros').modal('hide');

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
    let tardeada = parseFloat($('#mod-tardeada-jornalero').val());
    let sueldoExtraTotal = parseFloat($('#mod-total-extra-jornalero').val());

    // Si los valores son NaN o vacíos, establecer como 0
    sueldoSemanal = isNaN(sueldoSemanal) ? 0 : sueldoSemanal;
    pasaje = isNaN(pasaje) ? 0 : pasaje;
    tardeada = isNaN(tardeada) ? 0 : tardeada;
    sueldoExtraTotal = isNaN(sueldoExtraTotal) ? 0 : sueldoExtraTotal;

    // Establecer los valores en el objeto empleado
    empleado.salario_semanal = sueldoSemanal;
    empleado.pasaje = pasaje;
    empleado.tardeada = tardeada;
    empleado.sueldo_extra_total = sueldoExtraTotal;

}


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






