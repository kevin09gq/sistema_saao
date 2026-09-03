// Objeto para almacenar el empleado actual del modal
const objEmpleado = {
    empleado: null,

    // Getter: obtener el empleado actual
    getEmpleado() {
        return this.empleado;
    },

    // Setter: establecer el empleado
    setEmpleado(emp) {
        this.empleado = emp;
    },

    // Limpiar: resetear el empleado
    limpiarEmpleado() {
        this.empleado = null;
    }
};

//===========================================
// FUNCIÓN PARA ESTABLECER LA INFORMACIÓN DEL
// EMPLEADO EN EL MODAL DE HISTORIAL DE NÓMINA
//===========================================

function establecerDataEmpleado(empleado) {
    objEmpleado.setEmpleado(empleado);

     // Establecer Dias Trabajados
    $("#labelDiasTrabajados").text(empleado.dias_trabajados || 0);

    // Establecer el nombre del empleado en el label del modal
    $("#labelNombreEmpleado").text(empleado.nombre || '');
    ocultarComponentesModalDetalles(empleado);

    // Percepciones y Percepciones Extras
    establecerPercepciones(empleado);
    mostrarPercepcionesExtras(empleado.percepciones_extra);

    // Conceptos
    establecerConceptos(empleado);

    // Deducciones y Deducciones Extras
    establecerDeducciones(empleado);
    mostrarDeduccionesExtras(empleado.deducciones_extra);

    // Historiales de Incidencias / Deducciones
    establecerHistorialOlvidosBiometrico(empleado.historial_olvidos);
    establecerHistorialInasistencias(empleado.historial_inasistencias);
    establecerHistorialRetardos(empleado.historial_retardos);
    establecerHistorialPermisos(empleado.historial_permisos);
    establecerHistorialUniformes(empleado.historial_uniforme);
    establecerDiasJustificados(empleado.dias_justificados);

    // Inicializar clase de evento en vacío para todos los registros del empleado
    if (empleado.registros) {
        empleado.registros.forEach(function (r) {
            r.claseEvento = "";
        });
    }

    // Establecer los eventos de Incidencias (estas funciones asignan las clases correspondientes a r.claseEvento y rellenan los cards)
    establecerEventosOlvidosBiometrico(empleado.registros);
    establecerEventosEntradasTempranas(empleado, jsonHistorialPilar);
    establecerEventosSalidasTardias(empleado, jsonHistorialPilar);
    establecerEventosSalidasTempranas(empleado, jsonHistorialPilar);
    establecerEventosRetardos(empleado, jsonHistorialPilar);
    establecerEventosAusentismos(empleado, jsonHistorialPilar);
    establecerEventosComidaExtra(empleado, jsonHistorialPilar);
    establecerEventosMarcajes(empleado, jsonHistorialPilar);

    // Establecer registros del empleado
    establecerRegistrosEmpleado(empleado.registros);
    establecerHorarioOficial(empleado.horario_oficial);


    // Establecer Total a Cobrar y Status del Redondeo
    establecerTotalCobrarEmpleado(empleado);

    // Abrir el modal del historial de nómina del empleado
    $('#modalNominaHistorial').modal('show');
}


//==========================================================
// FUNCIÓN PARA OCULTAR COMPONENTES DEL MODAL DE DETALLES
// DE NÓMINA SEGÚN EL TIPO DE HORARIO DEL EMPLEADO
//==========================================================

function ocultarComponentesModalDetalles(empleado) {

    // Eliminar clases de ocultar a los componentes del modal por defecto

    $("#ocultarTardiada").removeClass("d-none").show();
    $("#ocultarRetardos").removeClass("d-none").show();
    $("#ocultarAusentismos").removeClass("d-none").show();
    $("#ocultarBotonHorarioOficial").removeClass("d-none").show();
    $("#ocultarDiasTrabajados").removeClass("d-none").show();

    // obtener el departamento del empleado
    let departamentoEmpleado = jsonHistorialPilar.departamentos.find(function (departamento) {

        return departamento.id_departamento == empleado.id_departamento;

    });


    // validar que exista el departamento
    if (!departamentoEmpleado) {

        return;

    }


    // obtener el tipo de horario
    let tipoHorario = departamentoEmpleado.tipo_horario;


    // tipo de horario 1 = horario oficial
    if (tipoHorario == 1) {
        $("#ocultarTardiada").addClass("d-none").hide();
        $("#ocultarDiasTrabajados").addClass("d-none").hide();
    }


    // tipo de horario 2 = horario de rancho
    else if (tipoHorario == 2) {

       $("#ocultarRetardos").addClass("d-none").hide();
       $("#ocultarAusentismos").addClass("d-none").hide();
       $("#ocultarBotonHorarioOficial").addClass("d-none").hide();

    }

}

//==========================================================
// FUNCIÓN PARA MOSTRAR LOS REGISTROS DEL EMPLEADO (HISTORIAL)
//==========================================================

function establecerRegistrosEmpleado(registros) {

    // Guardar registros actuales para evaluar eventos
    registrosEmpleadoActuales = registros;

    // Limpiar tabla
    $("#tbRegistros").empty();

    // Validar registros
    if (!registros || registros.length == 0) {

        $("#tbRegistros").append(`

            <tr>

                <td colspan="5" class="text-center text-muted">

                    No hay registros disponibles

                </td>

            </tr>

        `);

        return;

    }

    // Recorrer registros
    registros.forEach(function (registro, indice) {

        let claseEvento = obtenerClaseEventoRegistro(registro);

        $("#tbRegistros").append(`

            <tr class="${claseEvento}" data-indice-registro="${indice}">

                <td>${registro.dia}</td>

                <td>${registro.fecha}</td>

                <td class="celda-entrada">

                    ${registro.entrada || "-"}

                </td>

                <td class="celda-salida">

                    ${registro.salida || "-"}

                </td>

                <td class="celda-minutos">

                    ${registro.minutos || 0}

                </td>


            </tr>

        `);

    });

   

}

//==========================================================
// FUNCIÓN PARA MOSTRAR EL HORARIO DE ACUERDO AL TIPO DE 
// HORARIO DEL EMPLEADO 
//==========================================================

function establecerHorarioOficial(horario_oficial) {

    // Limpiar tabla
    $("#tbody-horario-oficial").empty();

    // Validar si existen registros
    if (!horario_oficial || horario_oficial.length == 0) {

        $("#tbody-horario-oficial").append(`

            <tr>

                <td colspan="8" class="text-center text-muted">

                    No hay Biométricos disponibles

                </td>

            </tr>

        `);

        return;

    }

    // Recorrer registros
    horario_oficial.forEach((horario) => {

        $("#tbody-horario-oficial").append(`

            <tr>

                <td>${horario.dia}</td>

                <td>${horario.entrada || "-"}</td>

                <td>${horario.entrada_comida || "-"}</td>

                <td>${horario.salida_comida || "-"}</td>

                <td>${horario.salida || "-"}</td>

            </tr>

        `);

    });

}




// ============================================
// FUNCIÓN PARA ESTABLECER PERCEPCIONES EN EL MODAL
// ============================================

function establecerPercepciones(empleado) {

    // Establecer Sueldo Neto
    $("#salarioSemanal").val(empleado.salario_semanal || '');

    // Establecer Comida
    $("#comida").val(empleado.comida || '');

    // Establecer Pasaje
    $("#pasaje").val(empleado.pasaje || '');

    // Establecer Tardeada
    $("#tardeada").val(empleado.tardeada || '');

    // Establecer Total de Percepciones Extra
    $("#totalSueldoExtra").val(empleado.sueldo_extra_total || '');

}

//==========================================================
// FUNCIÓN PARA MOSTRAR LAS PERCEPCIONES EXTRAS
// DEL EMPLEADO EN LA TABLA DEL MODAL 
//==========================================================

function mostrarPercepcionesExtras(percepciones_extra) {

    // Limpiar tabla
    $("#tbody-percepciones-extras").empty();

    // Validar si existen percepciones extras
    if (!percepciones_extra || percepciones_extra.length == 0) {

        $("#tbody-percepciones-extras").append(`
            <tr>
                <td colspan="2" class="text-center text-muted">
                    No hay percepciones extras agregadas
                </td>
            </tr>
        `);

        return;

    }

    // Recorrer percepciones del empleado
    for (let i = 0; i < percepciones_extra.length; i++) {

        let percepcion = percepciones_extra[i];

        $("#tbody-percepciones-extras").append(`
            <tr>
                <td>
                    ${percepcion.nombre}
                </td>
                <td>
                    $${parseFloat(percepcion.cantidad || 0).toFixed(2)}
                </td>
            </tr>
        `);

    }

}

//==========================================================
// FUNCIÓN PARA ESTABLECER LOS CONCEPTOS DEL EMPLEADO EN LOS
// INPUTS DEL MODAL (Usa IDs #isr, #imss, #infonavit, #ajusteSub)
//==========================================================

function establecerConceptos(empleado) {

    const conceptos = empleado.conceptos || [];

    // Buscar conceptos por código
    const conceptoISR = conceptos.find(c => c.codigo === "45");
    const conceptoIMSS = conceptos.find(c => c.codigo === "52");
    const conceptoInfonavit = conceptos.find(c => c.codigo === "16");
    const conceptoAjusteSub = conceptos.find(c => c.codigo === "107");

    // Establecer ISR
    $("#isr").val(conceptoISR?.resultado || '');

    // Establecer IMSS
    $("#imss").val(conceptoIMSS?.resultado || '');

    // Establecer INFONAVIT
    $("#infonavit").val(conceptoInfonavit?.resultado || '');

    // Establecer Ajustes al Subsidio
    $("#ajusteSub").val(conceptoAjusteSub?.resultado || '');

    // Establecer el total de conceptos
    calcularTotalConceptos();

}

//==========================================================
// FUNCIÓN PARA CALCULAR EL TOTAL DE CONCEPTOS EN EL MODAL
//==========================================================

function calcularTotalConceptos() {

    let isr = parseFloat($("#isr").val()) || 0;
    let imss = parseFloat($("#imss").val()) || 0;
    let infonavit = parseFloat($("#infonavit").val()) || 0;
    let ajustesSub = parseFloat($("#ajusteSub").val()) || 0;

    let totalConceptos = isr + imss + infonavit + ajustesSub;

    $("#inputTotalConceptos").val(totalConceptos.toFixed(2));

}

//==========================================================
// FUNCIÓN PARA ESTABLECER LAS DEDUCCIONES DEL EMPLEADO EN 
// LOS INPUTS DEL MODAL
//==========================================================

function establecerDeducciones(empleado) {

    // Establecer Tarjeta
    $("#inputTarjeta").val(empleado.tarjeta || '');

    // Establecer Préstamo
    $("#inputPrestamos").val(empleado.prestamo || '');

    // Establecer Olvidos Checador
    $("#inputBiometrico").val(empleado.checador || '');

    // Establecer Inasistencias
    $("#inputAusentismos").val(empleado.inasistencia || '');

    // Establecer Retardos
    $("#inputRetardos").val(empleado.retardos || '');

    // Establecer Permisos
    $("#inputPermisos").val(empleado.permiso || '');

    // Establecer Uniformes
    $("#inputUniformes").val(empleado.uniformes || '');

    // Establecer F.A/GAFET/COFIA
    $("#inputFAGafetCofia").val(empleado.fa_gafet_cofia || '');

}

//==========================================================
// FUNCIÓN PARA MOSTRAR LAS DEDUCCIONES EXTRAS EN LA TABLA
//==========================================================

function mostrarDeduccionesExtras(deducciones_extra) {

    // Limpiar tabla
    $("#tbody-deducciones-extras").empty();

    // Validar si existen deducciones extras
    if (!deducciones_extra || deducciones_extra.length == 0) {

        $("#tbody-deducciones-extras").append(`
            <tr>
                <td colspan="2" class="text-center text-muted">
                    No hay conceptos adicionales agregados
                </td>
            </tr>
        `);

        return;

    }

    // Recorrer deducciones del empleado
    for (let i = 0; i < deducciones_extra.length; i++) {

        let deduccion = deducciones_extra[i];

        $("#tbody-deducciones-extras").append(`
            <tr>
                <td>
                    ${deduccion.nombre}
                </td>
                <td>
                    $${parseFloat(deduccion.cantidad || 0).toFixed(2)}
                </td>
            </tr>
        `);

    }

}

//==========================================================
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE OLVIDOS DE BIOMÉTRICO
//==========================================================

function establecerHistorialOlvidosBiometrico(historialOlvidos) {

    $("#tbody-historial-olvidos-biometrico").empty();

    if (!historialOlvidos || historialOlvidos.length == 0) {
        $("#tbody-historial-olvidos-biometrico").append(`
            <tr>
                <td colspan="3" class="text-center text-muted">
                    No hay olvidos de biométrico registrados
                </td>
            </tr>
        `);
        return;
    }

    for (let i = 0; i < historialOlvidos.length; i++) {
        let olvido = historialOlvidos[i];
        $("#tbody-historial-olvidos-biometrico").append(`
            <tr>
                <td>${olvido.dia || ''}</td>
                <td>${olvido.fecha || ''}</td>
                <td>
                    <input
                        type="number"
                        class="form-control"
                        id="inputDescuentoOlvido${i}"
                        value="${olvido.descuento_olvido || ''}"
                        readonly>
                </td>
            </tr>
        `);
    }

}

//==========================================================
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE INASISTENCIAS
//==========================================================

function establecerHistorialInasistencias(historialInasistencias) {

    $("#tbody-historial-ausentismos").empty();

    if (!historialInasistencias || historialInasistencias.length == 0) {
        $("#tbody-historial-ausentismos").append(`
            <tr>
                <td colspan="4" class="text-center text-muted">
                    No hay inasistencias registradas
                </td>
            </tr>
        `);
        return;
    }

    for (let i = 0; i < historialInasistencias.length; i++) {
        let inasistencia = historialInasistencias[i];
        $("#tbody-historial-ausentismos").append(`
            <tr>
                <td>${inasistencia.dia || ''}</td>

                <td>
                    <input
                        type="number"
                        class="form-control"
                        id="inputDescuentoInasistencia${i}"
                        value="${inasistencia.descuento_inasistencia || ''}"
                        readonly>
                </td>
            </tr>
        `);
    }

}

//==========================================================
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE RETARDOS
//==========================================================

function establecerHistorialRetardos(historialRetardos) {

    // Limpiar la tabla
    $("#tbody-historial-retardos").empty();

    // Validar si existen retardos
    if (!historialRetardos || historialRetardos.length == 0) {

        $("#tbody-historial-retardos").append(`
            <tr>
                <td colspan="7" class="text-center text-muted">
                    No hay retardos registrados
                </td>
            </tr>
        `);

        return;

    }

    // Recorrer historial
    for (let i = 0; i < historialRetardos.length; i++) {

        let retardo = historialRetardos[i];

        let minRetardo = retardo.minutos_retardo;
        let tol = retardo.tolerancia;
        let costoMin = retardo.descuento_por_minuto;
        let totalDesc = retardo.total_descontado;

        $("#tbody-historial-retardos").append(`
            <tr>
                <td>${retardo.dia || ''}</td>
                <td>${retardo.fecha || ''}</td>
                <td>
                    <input
                        type="number"
                        class="form-control"
                        id="inputMinutosRetardoHistorial${i}"
                        value="${minRetardo}"
                        readonly>
                </td>
                <td>
                    <input
                        type="number"
                        class="form-control"
                        id="inputToleranciaRetardoHistorial${i}"
                        value="${tol}"
                        readonly>
                </td>
                <td>
                    <input
                        type="number"
                        class="form-control"
                        id="inputCostoMinutoRetardoHistorial${i}"
                        value="${costoMin}"
                        readonly>
                </td>
                <td>
                    <input
                        type="number"
                        class="form-control"
                        id="inputDescuentoRetardoHistorial${i}"
                        value="${totalDesc}"
                        readonly>
                </td>
            </tr>
        `);

    }

}


//==========================================================
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE PERMISOS
//==========================================================

function establecerHistorialPermisos(historialPermisos) {

    $("#tbody-historial-permisos").empty();

    if (!historialPermisos || historialPermisos.length == 0) {
        $("#tbody-historial-permisos").append(`
            <tr>
                <td colspan="4" class="text-center text-muted">
                    No hay permisos registrados
                </td>
            </tr>
        `);
        return;
    }

    for (let i = 0; i < historialPermisos.length; i++) {
        let permiso = historialPermisos[i];
        $("#tbody-historial-permisos").append(`
            <tr>
                <td>${permiso.dia || ''}</td>
                <td>
                    <input
                        type="number"
                        class="form-control"
                        id="inputMinutosPermisoHistorial${i}"
                        value="${permiso.minutos_permiso || ''}"
                        readonly>
                </td>
                <td>
                    <input
                        type="number"
                        class="form-control"
                        id="inputCostoMinutoPermisoHistorial${i}"
                        value="${permiso.costo_por_minuto || ''}"
                        readonly>
                </td>
                <td>
                    <input
                        type="number"
                        class="form-control"
                        id="inputDescuentoPermisoHistorial${i}"
                        value="${permiso.descuento_permiso || ''}"
                        readonly>
                </td>
            </tr>
        `);
    }

}

//==========================================================
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE UNIFORMES
//==========================================================

function establecerHistorialUniformes(historialUniformes) {

    $("#tbody-historial-uniformes").empty();

    if (!historialUniformes || historialUniformes.length == 0) {
        $("#tbody-historial-uniformes").append(`
            <tr>
                <td colspan="2" class="text-center text-muted">
                    No hay uniformes registrados
                </td>
            </tr>
        `);
        return;
    }

    for (let i = 0; i < historialUniformes.length; i++) {
        let uniforme = historialUniformes[i];
        $("#tbody-historial-uniformes").append(`
            <tr>
                <td>${uniforme.folio || ''}</td>
                <td>
                    <input
                        type="number"
                        class="form-control"
                        id="inputCantidadUniformeHistorial${i}"
                        value="${uniforme.cantidad || ''}"
                        readonly>
                </td>
            </tr>
        `);
    }

}

//==========================================================
// FUNCIÓN PARA ESTABLECER EL TOTAL A COBRAR
// Y EL ESTADO DEL CHECKBOX DE REDONDEO
//==========================================================

function establecerTotalCobrarEmpleado(empleado) {

    // Establecer Total a cobrar del empleado
    $("#inputTotalCobrar").val(empleado.total_cobrar || '');

    
    $("#labelTotalEmpleado").text(formatoMoneda(empleado.total_cobrar || 0));

}


//==========================================================
// FUNCIÓN PARA MOSTRAR LOS DÍAS JUSTIFICADOS DEL EMPLEADO
//==========================================================
function establecerDiasJustificados(dias_justificados) {
    // Limpiar tabla
    $("#tbodyJustificacionesEmpleado").empty();

    // Validar si existen días justificados
    if (!dias_justificados || !Array.isArray(dias_justificados) || dias_justificados.length === 0) {
        $("#tablaJustificacionesEmpleado").addClass("d-none");
        $("#alertaNoJustificaciones").removeClass("d-none");
        return;
    }

    $("#tablaJustificacionesEmpleado").removeClass("d-none");
    $("#alertaNoJustificaciones").addClass("d-none");

    // Recorrer los días justificados y agregarlos a la tabla
    dias_justificados.forEach(justificado => {
        $("#tbodyJustificacionesEmpleado").append(`
            <tr>
                <td>${justificado.dia}</td>
                <td>${justificado.tipo || "-"}</td>
            </tr>
        `);
    });
}