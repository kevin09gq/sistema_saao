editarPropiedades();

function editarPropiedades() {
    $("#btn-guardar-propiedades").click(function (e) {
        e.preventDefault();
        const empleado = objEmpleado.getEmpleado();

        // Modificar percepciones del empleado
        modificarPercepciones(empleado);

        // Modificar conceptos del empleado
        modificarConceptos(empleado);

        // Modificar deducciones del empleado
        modificarDeducciones(empleado);

        asignarHistorialOlvidos(empleado);

        asignarTotalOlvidos(empleado, false);

        // Si no hay empleado, salir
        if (!empleado) return;

        // Refrescar la tabla manteniendo paginación y filtro actual
        refrescarTabla();

        // Cerrar modal después de guardar
        $('#modal-40lbs').modal('hide');
    });
}

/************************************
 * MODIFICAR PERCEPCIONES DEL EMPLEADO
 ************************************/

function modificarPercepciones(empleado) {

    // Obtener valores de las percepciones del modal
    let sueldoNeto = parseFloat($('#mod-sueldo-neto-40lbs').val());
    let incentivo = parseFloat($('#mod-incentivo-40lbs').val());
    let horasExtras = parseFloat($('#mod-horas-extras-40lbs').val());
    let bonoAntiguedad = parseFloat($('#mod-bono-antiguedad-40lbs').val()); 
    let actividadesEspciales = parseFloat($('#mod-actividades-especiales-40lbs').val());
    let puesto = $('#mod-puesto-40lbs').val();
    let sueldoExtraTotal = parseFloat($('#mod-total-extra-40lbs').val());

    // Si los valores son NaN o vacíos, establecer como 0
    sueldoNeto = isNaN(sueldoNeto) ? 0 : sueldoNeto;
    incentivo = isNaN(incentivo) ? 0 : incentivo;
    horasExtras = isNaN(horasExtras) ? 0 : horasExtras;
    bonoAntiguedad = isNaN(bonoAntiguedad) ? 0 : bonoAntiguedad;
    actividadesEspciales = isNaN(actividadesEspciales) ? 0 : actividadesEspciales;
    puesto = isNaN(puesto) ? '' : puesto;   
    sueldoExtraTotal = isNaN(sueldoExtraTotal) ? 0 : sueldoExtraTotal;

    // Establecer los valores en el objeto empleado
    empleado.sueldo_neto = sueldoNeto;
    empleado.incentivo = incentivo;
    empleado.horas_extra = horasExtras;
    empleado.bono_antiguedad = bonoAntiguedad;
    empleado.actividades_especiales = actividadesEspciales;
    empleado.puesto = puesto;
    empleado.sueldo_extra_total = sueldoExtraTotal;

}

/************************************
 * MODIFICAR CONCEPTOS DEL EMPLEADO
 ************************************/

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

    actualizarConcepto("45", parseFloat($('#mod-isr-40lbs').val()) || 0); // ISR
    actualizarConcepto("52", parseFloat($('#mod-imss-40lbs').val()) || 0); // IMSS
    actualizarConcepto("16", parseFloat($('#mod-infonavit-40lbs').val()) || 0); // Infonavit
    actualizarConcepto("107", parseFloat($('#mod-ajustes-sub-40lbs').val()) || 0); // Ajuste al Sub
}

function desabilitarCamposConceptos(tieneSeguroSocial) {

    // Deshabilitar o habilitar campos de conceptos según seguroSocial
    if (!tieneSeguroSocial) {
        // Deshabilitar campos de entrada
        $('#mod-isr-40lbs').prop('disabled', true);
        $('#mod-imss-40lbs').prop('disabled', true);
        $('#mod-infonavit-40lbs').prop('disabled', true);
        $('#mod-ajustes-sub-40lbs').prop('disabled', true);

        // Deshabilitar botones de aplicar
        $('#btn-aplicar-isr-40lbs').prop('disabled', true);
        $('#btn-aplicar-imss-40lbs').prop('disabled', true);
        $('#btn-aplicar-infonavit-40lbs').prop('disabled', true);
        $('#btn-aplicar-ajuste-sub-40lbs').prop('disabled', true);

        // Deshabilitar total (aunque ya tiene readonly)
        $('#mod-total-conceptos-40lbs').prop('disabled', true);

        return; // Salir sin procesar conceptos
    }

    // Si tiene seguro social, habilitar los campos
    $('#mod-isr-40lbs').prop('disabled', false);
    $('#mod-imss-40lbs').prop('disabled', false);
    $('#mod-infonavit-40lbs').prop('disabled', false);
    $('#mod-ajustes-sub-40lbs').prop('disabled', false);

    $('#btn-aplicar-isr-40lbs').prop('disabled', false);
    $('#btn-aplicar-imss-40lbs').prop('disabled', false);
    $('#btn-aplicar-infonavit-40lbs').prop('disabled', false);
    $('#btn-aplicar-ajuste-sub-40lbs').prop('disabled', false);

    $('#mod-total-conceptos-40lbs').prop('disabled', false);
}

/************************************
 * MODIFICAR DEDUCCIONES DEL EMPLEADO
 ************************************/


// Esta función marca flags (_retardos_editado_manual, _checador_editado_manual, _inasistencia_editado_manual) en el objeto empleado
// para indicar que el usuario editó manualmente el campo o lo dejó vacío en el modal.
// Si el flag está presente, las funciones automáticas NO sobreescriben el valor manual.
function modificarDeducciones(empleado) {
    let tarjeta = parseFloat($('#mod-tarjeta-40lbs').val());
    let prestamo = parseFloat($('#mod-prestamo-40lbs').val());


    // Si los valores son NaN o vacíos, establecer como 0
    tarjeta = isNaN(tarjeta) ? 0 : tarjeta;
    prestamo = isNaN(prestamo) ? 0 : prestamo;


    empleado.tarjeta       = tarjeta;
    empleado.prestamo      = prestamo;

}
