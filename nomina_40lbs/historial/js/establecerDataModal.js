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

    // Establecer el nombre del empleado en el label del modal
    $("#labelNombreEmpleado").text(empleado.nombre || '');

    // Establecer minutos programados, trabajados y extras
    establecerMinutosTrabajadosYExtras(empleado);

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
    establecerHistorialPermisos(empleado.historial_permisos);
    establecerHistorialUniformes(empleado.historial_uniforme);

    // Inicializar clase de evento en vacío para todos los registros del empleado
    if (empleado.registros) {
        empleado.registros.forEach(function (r) {
            r.claseEvento = "";
        });
    }

    // Establecer los eventos de Incidencias (estas funciones asignan las clases correspondientes a r.claseEvento y rellenan los cards)
    establecerEventosOlvidosBiometrico(empleado.registros, jsonHistorial40lbs);
    establecerEventosEntradasTempranas(empleado.registros, jsonHistorial40lbs);
    establecerEventosSalidasTardias(empleado.registros, jsonHistorial40lbs);
    establecerEventosSalidasTempranas(empleado.registros, jsonHistorial40lbs);
    establecerEventosRetardos(empleado.registros, jsonHistorial40lbs);
    establecerEventosAusentismos(empleado.registros, jsonHistorial40lbs);
    establecerEventosComidaExtra(empleado.registros, jsonHistorial40lbs);
    establecerEventosMarcajes(empleado.registros, jsonHistorial40lbs);

    // Establecer registros del empleado, biométrico y copia (AHORA SÍ con las clases de eventos calculadas)
    establecerRegistrosEmpleado(empleado.registros);
    establecerBiometricoRedondeado(empleado.biometrico_redondeado);
    if (empleado.registros_copia) {
        establecerRegistrosCopiaEmpleado(empleado.registros_copia);
    } else {
        $("#tbCopia").empty();
    }

    // Establecer Total a Cobrar y Status del Redondeo
    establecerTotalCobrarEmpleado(empleado);

    // Abrir el modal del historial de nómina del empleado
    $('#modalNominaHistorial').modal('show');
}

//==========================================================
// FUNCIÓN PARA ESTABLECER LOS MINUTOS DEL EMPLEADO
//==========================================================

function establecerMinutosTrabajadosYExtras(empleado) {
    var minutosProgramados = 0;

    if (
        typeof jsonHistorial40lbs !== 'undefined' &&
        jsonHistorial40lbs &&
        jsonHistorial40lbs.horarios_semanales &&
        Array.isArray(jsonHistorial40lbs.horarios_semanales)
    ) {
        for (var i = 0; i < jsonHistorial40lbs.horarios_semanales.length; i++) {
            var horario = jsonHistorial40lbs.horarios_semanales[i];
            minutosProgramados += parseInt(horario.minutos) || 0;
        }
    }

    var minutosTrabajados = parseInt(empleado.minutos_trabajados) || 0;
    var minutosExtras = parseInt(empleado.minutos_extras_trabajados) || 0;
    var minutosNoTrabajados = minutosProgramados - minutosTrabajados;

    if (minutosNoTrabajados < 0) {
        minutosNoTrabajados = 0;
    }

    $("#minProg").text(minutosProgramados);
    $("#minTrab").text(minutosTrabajados);
    $("#minExtra").text(minutosExtras);
    $("#minNoTrab").text(minutosNoTrabajados);
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
// FUNCIÓN PARA MOSTRAR EL BIOMÉTRICO REDONDEADO
//==========================================================

function establecerBiometricoRedondeado(biometrico_redondeado) {
    $("#tbBiometrico").empty();

    if (!biometrico_redondeado || biometrico_redondeado.length == 0) {
        $("#tbBiometrico").append(`
            <tr>
                <td colspan="8" class="text-center text-muted">
                    No hay Biométricos disponibles
                </td>
            </tr>
        `);
        return;
    }

    biometrico_redondeado.forEach((biometrico) => {
        $("#tbBiometrico").append(`
            <tr>
                <td>${biometrico.dia || '-'}</td>
                <td>${biometrico.entrada || '-'}</td>
                <td>${biometrico.entrada_comida || '-'}</td>
                <td>${biometrico.termino_comida || '-'}</td>
                <td>${biometrico.salida || '-'}</td>
                <td>${biometrico.horas_comida || '-'}</td>
                <td>${biometrico.minutos_trabajados || '-'}</td>
                <td>${biometrico.horas_trabajadas || '-'}</td>
            </tr>
        `);
    });
}

//==========================================================
// FUNCIÓN PARA MOSTRAR LOS REGISTROS COPIA
//==========================================================

function establecerRegistrosCopiaEmpleado(registrosCopia) {
    $("#tbCopia").empty();

    if (!registrosCopia || registrosCopia.length == 0) {
        $("#tbCopia").append(`
            <tr>
                <td colspan="5" class="text-center text-muted">
                    No hay registros copia disponibles
                </td>
            </tr>
        `);
        return;
    }

    registrosCopia.forEach(function (registroCopia) {
        registroCopia.claseEvento = "";
    });

    establecerEventosOlvidosBiometrico(registrosCopia, jsonHistorial40lbs);
    establecerEventosEntradasTempranas(registrosCopia, jsonHistorial40lbs);
    establecerEventosSalidasTardias(registrosCopia, jsonHistorial40lbs);
    establecerEventosSalidasTempranas(registrosCopia, jsonHistorial40lbs);
    establecerEventosRetardos(registrosCopia, jsonHistorial40lbs);
    establecerEventosAusentismos(registrosCopia, jsonHistorial40lbs);
    establecerEventosComidaExtra(registrosCopia, jsonHistorial40lbs);
    establecerEventosMarcajes(registrosCopia, jsonHistorial40lbs);

    registrosCopia.forEach(function (registroCopia) {
        let claseEvento = obtenerClaseEventoRegistro(registroCopia);
        $("#tbCopia").append(`
            <tr class="${claseEvento}">
                <td>${registroCopia.dia || '-'}</td>
                <td>${registroCopia.fecha || '-'}</td>
                <td>${registroCopia.entrada || '-'}</td>
                <td>${registroCopia.salida || '-'}</td>
                <td>${registroCopia.minutos || 0}</td>
            </tr>
        `);
    });
}

// ============================================
// FUNCIÓN PARA ESTABLECER PERCEPCIONES EN EL MODAL
// ============================================

function establecerPercepciones(empleado) {

    // Establecer Sueldo Neto
    $("#sueldoNeto").val(empleado.sueldo_neto || "");

    // Establecer Incentivo
    $("#incentivo").val(empleado.incentivo || "");

    // Establecer Horas Extras
    $("#horasExtras").val(empleado.horas_extra || "");

    // Establecer Bono de Antigüedad
    $("#bonoAntiguedad").val(empleado.bono_antiguedad || "");

    // Establecer Actividades Especiales
    $("#actEspeciales").val(empleado.actividades_especiales || "");

    // Establecer Puesto
    $("#puesto").val(empleado.puesto || "");

    // Establecer Total de Percepciones Extra
    $("#totalExtra").val(empleado.sueldo_extra_total || "");

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
                        id="inputMinutosInasistencia${i}"
                        value="${inasistencia.minutos || ''}"
                        readonly>
                </td>
                <td>
                    <input
                        type="number"
                        class="form-control"
                        id="inputCostoMinutoInasistencia${i}"
                        value="${inasistencia.costo_por_minuto || ''}"
                        readonly>
                </td>
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
