editarPropiedades();

function editarPropiedades() {
    $("#btn-guardar-propiedades").click(function (e) {
        e.preventDefault();
        const empleado = objEmpleado.getEmpleado();

        // 2. SEGUNDO: Recalcular historiales basándose en el horario actualizado.
        //    Los historiales (inasistencias, olvidos) ahora se generan
        //    con el nuevo horario, creando nuevos registros si es necesario.

        asignarHistorialOlvidos(empleado);


        // 3. TERCERO: Calcular los totales. Con force=false, respeta los flags
        //   de edición manual (_retardos_editado_manual, etc.)

        asignarTotalOlvidos(empleado, false);


        // 4. CUARTO: Aplicar modificaciones del usuario desde el modal.
        //    Ahora, si el usuario editó manualmente una deducción o concepto,
        //    estas funciones detectarán el cambio y establecerán los flags
        //    correspondientes para proteger esos valores.

        modificarPercepciones(empleado);
        modificarConceptos(empleado);
        modificarDeducciones(empleado);

        // Resetear flags de edición manual después de guardar
        delete empleado._checador_editado_manual;
        delete empleado._inasistencia_editado_manual;

        // Si no hay empleado, salir
        if (!empleado) return;

        // Refrescar la tabla manteniendo paginación y filtro actual
        refrescarTabla();
        limpiarModal();

        // Cerrar modal después de guardar
        $('#modal-10lbs').modal('hide');
    });
}

/************************************
 * MODIFICAR PERCEPCIONES DEL EMPLEADO
 ************************************/

function modificarPercepciones(empleado) {

    // Obtener valores de las percepciones del modal
    let sueldoNeto = parseFloat($('#mod-sueldo-neto-10lbs').val());
    let sueldoExtraTotal = parseFloat($('#mod-total-extra-10lbs').val());

    // Si los valores son NaN o vacíos, establecer como 0
    sueldoNeto = isNaN(sueldoNeto) ? 0 : sueldoNeto;
    sueldoExtraTotal = isNaN(sueldoExtraTotal) ? 0 : sueldoExtraTotal;

    // Establecer los valores en el objeto empleado
    empleado.sueldo_neto = sueldoNeto;
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

    actualizarConcepto("45", parseFloat($('#mod-isr-10lbs').val()) || 0); // ISR
    actualizarConcepto("52", parseFloat($('#mod-imss-10lbs').val()) || 0); // IMSS
    actualizarConcepto("16", parseFloat($('#mod-infonavit-10lbs').val()) || 0); // Infonavit
    actualizarConcepto("107", parseFloat($('#mod-ajustes-sub-10lbs').val()) || 0); // Ajuste al Sub
}

function desabilitarCamposConceptos(tieneSeguroSocial) {

    // Deshabilitar o habilitar campos de conceptos según seguroSocial
    if (!tieneSeguroSocial) {
        // Deshabilitar campos de entrada
        $('#mod-isr-10lbs').prop('disabled', true);
        $('#mod-imss-10lbs').prop('disabled', true);
        $('#mod-infonavit-10lbs').prop('disabled', true);
        $('#mod-ajustes-sub-10lbs').prop('disabled', true);

        // Deshabilitar botones de aplicar
        $('#btn-aplicar-isr-10lbs').prop('disabled', true);
        $('#btn-aplicar-imss-10lbs').prop('disabled', true);
        $('#btn-aplicar-infonavit-10lbs').prop('disabled', true);
        $('#btn-aplicar-ajuste-sub-10lbs').prop('disabled', true);

        // Deshabilitar total (aunque ya tiene readonly)
        $('#mod-total-conceptos-10lbs').prop('disabled', true);

        return; // Salir sin procesar conceptos
    }

    // Si tiene seguro social, habilitar los campos
    $('#mod-isr-10lbs').prop('disabled', false);
    $('#mod-imss-10lbs').prop('disabled', false);
    $('#mod-infonavit-10lbs').prop('disabled', false);
    $('#mod-ajustes-sub-10lbs').prop('disabled', false);

    $('#btn-aplicar-isr-10lbs').prop('disabled', false);
    $('#btn-aplicar-imss-10lbs').prop('disabled', false);
    $('#btn-aplicar-infonavit-10lbs').prop('disabled', false);
    $('#btn-aplicar-ajuste-sub-10lbs').prop('disabled', false);

    $('#mod-total-conceptos-10lbs').prop('disabled', false);
}

/************************************
 * MODIFICAR DEDUCCIONES DEL EMPLEADO
 ************************************/


// Esta función marca flags (_retardos_editado_manual, _checador_editado_manual, _inasistencia_editado_manual) en el objeto empleado
// para indicar que el usuario editó manualmente el campo o lo dejó vacío en el modal.
// Si el flag está presente, las funciones automáticas NO sobreescriben el valor manual.
function modificarDeducciones(empleado) {
    let tarjeta = parseFloat($('#mod-tarjeta-10lbs').val());
    let prestamo = parseFloat($('#mod-prestamo-10lbs').val());
    let checador = parseFloat($('#mod-checador-10lbs').val());
    let inasistencias = parseFloat($('#mod-inasistencias-10lbs').val());
    let permiso = parseFloat($('#mod-permisos-10lbs').val());
    let uniforme = parseFloat($('#mod-uniforme-10lbs').val());
    let fa_gafet_cofia = parseFloat($('#mod-fagafetcofia-10lbs').val());


    // Si los valores son NaN o vacíos, establecer como 0
    tarjeta = isNaN(tarjeta) ? 0 : tarjeta;
    prestamo = isNaN(prestamo) ? 0 : prestamo;
    checador = isNaN(checador) ? 0 : checador;
    inasistencias = isNaN(inasistencias) ? 0 : inasistencias;
    permiso = isNaN(permiso) ? 0 : permiso;
    uniforme = isNaN(uniforme) ? 0 : uniforme;
    fa_gafet_cofia = isNaN(fa_gafet_cofia) ? 0 : fa_gafet_cofia;


    // Marcar si fueron editados manualmente
    // Si el input está vacío O si el valor cambió, marcar flag para proteger

    const checadorVacio = $('#mod-checador-10lbs').val() === '';
    const inasistenciasVacio = $('#mod-inasistencias-10lbs').val() === '';

    if (checadorVacio || checador !== (empleado.checador || 0)) {
        empleado._checador_editado_manual = true;
    }

    if (inasistenciasVacio || inasistencias !== (empleado.inasistencia || 0)) {
        empleado._inasistencia_editado_manual = true;
    }

    empleado.tarjeta = tarjeta;
    empleado.prestamo = prestamo;
    empleado.checador = checador;
    empleado.inasistencia = inasistencias;
    empleado.permiso = permiso;
    empleado.uniforme = uniforme;
    empleado.fa_gafet_cofia = fa_gafet_cofia;

}
