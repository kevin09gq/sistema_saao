editarPropiedades();

/************************************
 * EDIAR PROPIEDADES DEL EMPLEADO DESDE EL MODAL DE COORDINADOR
 ************************************/

function editarPropiedades() {
    $("#btn-guardar-propiedades-coordinador").click(function (e) {
        e.preventDefault();
        const empleado = objEmpleadoCoordinador.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;
        
        // 1. PRIMERO: Aplicar cambios de horario oficial (si los hay)
        //    Esto es CRÍTICO porque los cálculos de retardos dependen del horario.
        //    Si modificamos el horario después de calcular retardos, los nuevos
        //    retardos generados por el cambio de horario NO se crearán.
        modificarHorarioOficial(empleado);
        
        // 2. SEGUNDO: Recalcular historiales basándose en el horario actualizado.
        //    Los historiales (retardos, inasistencias, olvidos) ahora se generan
        //    con el nuevo horario, creando nuevos registros si es necesario.
        asignarHistorialOlvidos(empleado);
        asignarHistorialRetardos(empleado);
        asignarHistorialInasistencias(empleado);
        
        // 3. TERCERO: Calcular los totales. Con force=false, respeta los flags
        //    de edición manual (_retardos_editado_manual, etc.)
        asignarTotalOlvidosCoordinador(empleado, false);
        asignarTotalRetardosCoordinador(empleado, false);
        asignarTotalInasistenciasCoordinador(empleado, false);

        // 3.5 ACTUALIZAR MODAL: Si se acaba de crear horario_oficial, actualizar los campos
        //     con los nuevos valores recalculados basados en el nuevo horario
        if (empleado._horario_oficial_recien_creado) {
            actualizarValoresHistorialesEnModal(empleado);
            delete empleado._horario_oficial_recien_creado;
        }

       

        // 4. CUARTO: Aplicar modificaciones del usuario desde el modal.
        //    Ahora, si el usuario editó manualmente una deducción o concepto,
        //    estas funciones detectarán el cambio y establecerán los flags
        //    correspondientes para proteger esos valores.
        modificarPercepciones(empleado);
        modificarConceptos(empleado);
        modificarDeducciones(empleado);

        // Resetear flags de edición manual después de guardar
        delete empleado._retardos_editado_manual;
        delete empleado._checador_editado_manual;
        delete empleado._inasistencia_editado_manual;

      
        //limpiar modal después de guardar
        limpiarModalCoordinador();

        //limpiar empleado abierto después de guardar
        objEmpleadoCoordinador.limpiarEmpleado();
        // Cerrar modal después de guardar
        $('#modal-coordinadores').modal('hide');

        // Actualizar la tabla manteniendo el filtrado y paginación actual
        const id_departamento = parseInt($('#filtro_departamento').val());
        const id_puestoEspecial = parseInt($('#filtro_puesto').val());
        
        // Aplicar los mismos filtros que están activos
        let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaPilar, id_departamento);
        jsonFiltrado = filtrarEmpleadosPorPuesto(jsonFiltrado, id_puestoEspecial);
        
        // Mostrar la tabla en la página actual (usar window.paginaActualNomina para acceso global)
        
        mostrarDatosTabla(jsonFiltrado, window.paginaActualNomina || 1);

    });




}

/************************************
 * MODIFICAR PERCEPCIONES DEL EMPLEADO
 ************************************/

function modificarPercepciones(empleado) {

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

    actualizarConcepto("45", parseFloat($('#mod-isr-coordinador').val()) || 0); // ISR
    actualizarConcepto("52", parseFloat($('#mod-imss-coordinador').val()) || 0); // IMSS
    actualizarConcepto("16", parseFloat($('#mod-infonavit-coordinador').val()) || 0); // Infonavit
    actualizarConcepto("107", parseFloat($('#mod-ajustes-sub-coordinador').val()) || 0); // Ajuste al Sub


}

/************************************
 * ACTUALIZAR VALORES DE HISTORIALES EN EL MODAL
 ************************************/

function actualizarValoresHistorialesEnModal(empleado) {
    // Validar que exista empleado
    if (!empleado) {
        return;
    }

    // Si no hay historial de retardos o está vacío, poner 0; si no, mostrar el total
    if (!Array.isArray(empleado.historial_retardos) || empleado.historial_retardos.length === 0) {
        $('#mod-retardos-coordinador').val(0);
    } else {
        $('#mod-retardos-coordinador').val(empleado.retardos || 0);
    }

    // Si no hay historial de inasistencias o está vacío, poner 0; si no, mostrar el total
    if (!Array.isArray(empleado.historial_inasistencias) || empleado.historial_inasistencias.length === 0) {
        $('#mod-inasistencias-coordinador').val(0);
    } else {
        $('#mod-inasistencias-coordinador').val(empleado.inasistencia || 0);
    }

    // Si no hay historial de olvidos o está vacío, poner 0; si no, mostrar el total
    if (!Array.isArray(empleado.historial_olvidos) || empleado.historial_olvidos.length === 0) {
        $('#mod-checador-coordinador').val(0);
    } else {
        $('#mod-checador-coordinador').val(empleado.checador || 0);
    }
}

/************************************
 * MODIFICAR DEDUCCIONES DEL EMPLEADO
 ************************************/


// Esta función marca flags (_retardos_editado_manual, _checador_editado_manual, _inasistencia_editado_manual) en el objeto empleado
// para indicar que el usuario editó manualmente el campo o lo dejó vacío en el modal.
// Si el flag está presente, las funciones automáticas NO sobreescriben el valor manual.
function modificarDeducciones(empleado) {
    let tarejta = parseFloat($('#mod-tarjeta-coordinador').val());
    let prestamo = parseFloat($('#mod-prestamo-coordinador').val());
    let checador = parseFloat($('#mod-checador-coordinador').val());
    let retardos = parseFloat($('#mod-retardos-coordinador').val());
    let inasistencias = parseFloat($('#mod-inasistencias-coordinador').val());
    let uniformes = parseFloat($('#mod-uniforme-coordinador').val());
    let permiso = parseFloat($('#mod-permisos-coordinador').val());
    let fa_gafet_cofia = parseFloat($('#mod-fagafetcofia-coordinador').val());

    // Si los valores son NaN o vacíos, establecer como 0
    tarejta = isNaN(tarejta) ? 0 : tarejta;
    prestamo = isNaN(prestamo) ? 0 : prestamo;
    checador = isNaN(checador) ? 0 : checador;
    retardos = isNaN(retardos) ? 0 : retardos;
    inasistencias = isNaN(inasistencias) ? 0 : inasistencias;
    uniformes = isNaN(uniformes) ? 0 : uniformes;
    permiso = isNaN(permiso) ? 0 : permiso;
    fa_gafet_cofia = isNaN(fa_gafet_cofia) ? 0 : fa_gafet_cofia;



    // Marcar si fueron editados manualmente
    // Si el input está vacío O si el valor cambió, marcar flag para proteger
    const retardosVacio = $('#mod-retardos-coordinador').val() === '';
    const checadorVacio = $('#mod-checador-coordinador').val() === '';
    const inasistenciasVacio = $('#mod-inasistencias-coordinador').val() === '';

    if (inasistenciasVacio || inasistencias !== (empleado.inasistencia || 0)) {
        empleado._inasistencia_editado_manual = true;
    }
    
    if (retardosVacio || retardos !== (empleado.retardos || 0)) {
        empleado._retardos_editado_manual = true;
    }
    if (checadorVacio || checador !== (empleado.checador || 0)) {
        empleado._checador_editado_manual = true;
    }
    

    empleado.tarjeta       = tarejta;
    empleado.prestamo      = prestamo;
    empleado.checador      = checador;
    empleado.retardos      = retardos;
    empleado.inasistencia  = inasistencias;
    empleado.uniformes     = uniformes;
    empleado.permiso       = permiso;
    empleado.fa_gafet_cofia = fa_gafet_cofia;

    // Guardar estado del redondeo al presionar Guardar
    // Nota: redondeo y total_cobrar ya fueron calculados en tiempo real por aplicarRedondeo(),
    // aquí nos aseguramos de que queden sincronizados correctamente.
    const redondeoActivoGuardar = $('#mod-redondear-sueldo-coordinador').is(':checked');
    empleado.redondeo_activo = redondeoActivoGuardar;
    empleado.total_cobrar    = parseFloat($('#mod-sueldo-a-cobrar-coordinador').val()) || 0;
    if (!redondeoActivoGuardar) {
        // Sin redondeo: no hay diferencia
        empleado.redondeo = 0;
    }
    // Si redondeoActivoGuardar === true: empleado.redondeo ya tiene la diferencia correcta
    // (asignada por aplicarRedondeo() al vuelo), no se sobreescribe.
}


/************************************
 * MODIFICAR HORARIO OFICIAL DEL EMPLEADO
 ************************************/

function modificarHorarioOficial(empleado){
    // Validar que exista empleado 
    if (!empleado) {
        return;
    }

    // Detectar si se acaba de crear horario_oficial (no existía antes)
    const horarioNoExistia = !empleado.horario_oficial || !Array.isArray(empleado.horario_oficial);
    
    // Si no existe horario_oficial, inicializarlo como array vacío
    if (horarioNoExistia) {
        empleado.horario_oficial = [];
        // Marcar con una bandera para actualizar el modal después de recalcular
        empleado._horario_oficial_recien_creado = true;
    }
    
    // Iterar sobre cada fila de la tabla de horarios
    $('#tbody-horarios-oficiales-coordinadores tr').each(function (index) {
        const $celdas = $(this).find('td');
        
        // Obtener los valores de cada celda
        const dia = $celdas.eq(0).text().trim(); // Día (no editable)
        const entrada = $celdas.eq(1).text().trim(); // Entrada
        const salidaComida = $celdas.eq(2).text().trim(); // Salida Comida
        const entradaComida = $celdas.eq(3).text().trim(); // Entrada Comida
        const salida = $celdas.eq(4).text().trim(); // Salida
        
        // Buscar el horario correspondiente por el nombre del día
        let horario = empleado.horario_oficial.find(h => 
            String(h.dia || '').toUpperCase().trim() === dia.toUpperCase().trim()
        );
        
        // Si no existe el horario para este día, crearlo
        if (!horario) {
            horario = {
                dia: dia.toUpperCase()
            };
            empleado.horario_oficial.push(horario);
        }
        
        // Actualizar los valores (convertir '-' en vacío)
        horario.entrada = entrada === '-' ? '' : entrada;
        horario.salida_comida = salidaComida === '-' ? '' : salidaComida;
        horario.entrada_comida = entradaComida === '-' ? '' : entradaComida;
        horario.salida = salida === '-' ? '' : salida;
    });
}






