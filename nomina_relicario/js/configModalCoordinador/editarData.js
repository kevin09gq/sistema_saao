editarPropiedades();

function editarPropiedades() {
    $("#btn-guardar-propiedades-coordinador").click(function (e) {
        e.preventDefault();
        modificarPercepciones();
        modificarConceptos();

        //limpiar modal después de guardar
        limpiarModalCoordinador();

        //limpiar empleado abierto después de guardar
        objEmpleado.limpiarEmpleado();
        // Cerrar modal después de guardar
        $('#modal-coordinadores').modal('hide');

    });




}

function modificarPercepciones() {
    const empleado = objEmpleado.getEmpleado();

    // Si no hay empleado, salir
    if (!empleado) return;

    // Obtener valores de las percepciones del modal
    let sueldoSemanal = parseFloat($('#mod-sueldo-semanal-coordinador').val());
    let sueldoExtraTotal = parseFloat($('#mod-total-extra-coordinador').val());

    // Si los valores son NaN o vacíos, establecer como 0
    sueldoSemanal = isNaN(sueldoSemanal) ? 0 : sueldoSemanal;
    sueldoExtraTotal = isNaN(sueldoExtraTotal) ? 0 : sueldoExtraTotal;

    // Establecer los valores en el objeto empleado
    empleado.salario_semanal = sueldoSemanal;
    empleado.sueldo_extra_total = sueldoExtraTotal;

}

function modificarConceptos() {
    const empleado = objEmpleado.getEmpleado();

    // Si no hay empleado, salir
    if (!empleado) return;
    
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

    actualizarConcepto("45", parseFloat($('#mod-isr-coordinador').val()) || 0); // ISR
    actualizarConcepto("52", parseFloat($('#mod-imss-coordinador').val()) || 0); // IMSS
    actualizarConcepto("16", parseFloat($('#mod-infonavit-coordinador').val()) || 0); // Infonavit
    actualizarConcepto("107", parseFloat($('#mod-ajustes-sub-coordinador').val()) || 0); // Ajuste al Sub


}




