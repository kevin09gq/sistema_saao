editarPropiedades();

function editarPropiedades() {
    $("#btn-guardar-propiedades-jornalero").click(function (e) {
        e.preventDefault();
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;
        modificarDeducciones(empleado);


     

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



function modificarConceptos(empleado) {
    // Conceptos específicos
    const conceptos = empleado.conceptos || [];

    const actualizarConcepto = (codigo, nuevoResultado) => {
        const concepto = conceptos.find(c => c.codigo === codigo);
        if (concepto) {
            concepto.resultado = nuevoResultado;
        } else {
            conceptos.push({ codigo, resultado: nuevoResultado });
        }
    };

    actualizarConcepto("45", parseFloat($('#mod-isr-jornalero').val()) || 0); // ISR
    actualizarConcepto("52", parseFloat($('#mod-imss-jornalero').val()) || 0); // IMSS
    actualizarConcepto("16", parseFloat($('#mod-infonavit-jornalero').val()) || 0); // Infonavit
    actualizarConcepto("107", parseFloat($('#mod-ajustes-sub-jornalero').val()) || 0); // Ajuste al Sub


}






