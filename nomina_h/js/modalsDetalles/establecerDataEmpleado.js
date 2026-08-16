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
// EMPLEADO EN EL MODAL DE DETALLES DE NÓMINA
//===========================================

function establecerDataEmpleado(empleado) {
    objEmpleado.setEmpleado(empleado);
 // Establecer Dias Trabajados
    $("#labelDiasTrabajados").text(empleado.dias_trabajados || 0);

    ocultarComponentesModalDetalles(empleado);

    // Establecer el nombre del empleado en el label del modal
    $("#labelNombreEmpleado").text(empleado.nombre || '');


    // Establecer Percepciones y Percepciones Extras
    establecerPercepciones(empleado);
    mostrarPercepcionesExtras(empleado.percepciones_extra);

    // Establecer Conceptos
    establecerConceptos(empleado);

    // Desactivar inputs de conceptos
    desactivarInputsConceptos(empleado);

    // Establecer Deducciones y Deducciones Extras
    establecerDeducciones(empleado);
    mostrarDeduccionesExtras(empleado.deducciones_extra);

    // Establecer Historiales de Incidencias
    establecerHistorialOlvidosBiometrico(empleado.historial_olvidos);
    establecerHistorialInasistencias(empleado.historial_inasistencias);
    establecerHistorialRetardos(empleado.historial_retardos);
    establecerHistorialPermisos(empleado.historial_permisos);
    establecerHistorialUniformes(empleado.historial_uniforme);

    // Establecer Total a Cobrar y Status del Redondeo
    establecerTotalCobrarEmpleado(empleado);

    // Inicializar clase de evento en vacío para todos los registros del empleado
    if (empleado.registros) {
        empleado.registros.forEach(function (r) {
            r.claseEvento = "";
        });
    }

    // Establecer los eventos de Incidencias (estas funciones asignan las clases correspondientes)
    establecerEventosOlvidosBiometrico(empleado.registros);
    establecerEventosEntradasTempranas(empleado);
    establecerEventosSalidasTardias(empleado);
    establecerEventosSalidasTempranas(empleado);
    establecerEventosRetardos(empleado);
    establecerEventosAusentismos(empleado);
    establecerEventosComidaExtra(empleado);
    establecerEventosMarcajes(empleado);

    // Establecer Registros y Horario Oficial (renderizar tablas)
    establecerRegistrosEmpleado(empleado.registros);
    establecerHorarioOficial(empleado.horario_oficial);

    // Abrir el modal de detalles del empleado
    $('#modalDetallesNominaEmpleado').modal('show');
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
    let departamentoEmpleado = jsonNominaHuasteca.departamentos.find(function (departamento) {

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
// FUNCIÓN PARA ESTABLECER LOS VALORES DE LAS PERCEPCIONES
// DEL EMPLEADO EN LOS INPUTS DEL MODAL
//==========================================================

function establecerPercepciones(empleado) {

    // Establecer salario semanal
    $("#inputSalarioSemanal").val(empleado.salario_semanal || '');

    // Establecer Comida
    $("#inputComida").val(empleado.comida || '');

    // Establecer Pasaje 
    $("#inputPasaje").val(empleado.pasaje || '');

    // Establecer Tardeada 
    $("#inputTardeada").val(empleado.tardeada || '');

    // Establecer total extras
    $("#inputTotalSueldoExtra").val(empleado.sueldo_extra_total || '');

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

                <td colspan="3" class="text-center text-muted">

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
                    $${parseFloat(percepcion.cantidad).toFixed(2)}
                </td>


                <td class="text-center">


                    <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        onclick="eliminarPercepcionExtra(${i})">


                        <i class="bi bi-trash"></i>


                    </button>


                </td>

            </tr>

        `);


    }


}

//==========================================================
// FUNCIÓN PARA ESTABLECER LOS CONCEPTOS DEL EMPLEADO EN LOS
// INPUTS DEL MODAL
//==========================================================

function establecerConceptos(empleado) {

    const conceptos = empleado.conceptos || [];

    // Buscar conceptos por código
    const conceptoISR = conceptos.find(c => c.codigo === "45");
    const conceptoIMSS = conceptos.find(c => c.codigo === "52");
    const conceptoInfonavit = conceptos.find(c => c.codigo === "16");
    const conceptoAjusteSub = conceptos.find(c => c.codigo === "107");

    // Establecer ISR
    $("#inputISR").val(conceptoISR?.resultado || '');

    // Establecer IMSS
    $("#inputIMSS").val(conceptoIMSS?.resultado || '');

    // Establecer INFONAVIT
    $("#inputInfonavit").val(conceptoInfonavit?.resultado || '');

    // Establecer Ajustes al Subsidio
    $("#inputAjustesSub").val(conceptoAjusteSub?.resultado || '');

    // Establecer el total de conceptos
    calcularTotalConceptos();

}


//====================================================================
// FUNCION PARA DESACTIVAR LOS INPUTS DE CONCEPTOS PARA LOS EMPLEADOS 
// QUE TIENE seguroSocial = false PARA QUE NO PUEDA ESCRIBIR
//====================================================================

function desactivarInputsConceptos(empleado) {

    // Primero habilitar todos

    $('#inputISR').prop('disabled', false);

    $('#inputIMSS').prop('disabled', false);

    $('#inputInfonavit').prop('disabled', false);

    $('#inputAjustesSub').prop('disabled', false);

    $('#inputTarjeta').prop('disabled', false);


    if (empleado.seguroSocial == false) {


        $('#inputISR').prop('disabled', true);
        $('#inputIMSS').prop('disabled', true);
        $('#inputInfonavit').prop('disabled', true);
        $('#inputAjustesSub').prop('disabled', true);
        $('#inputTarjeta').prop('disabled', true);


    }


}


//==========================================================
// FUNCIÓN PARA ESTABLECER LAS DEDUCCIONES DEL EMPLEADO EN 
// LOS INPUTS DEL MODAL
//==========================================================

function establecerDeducciones(empleado) {

    // Establecer Tarjeta
    $("#inputTarjeta").val(empleado.tarjeta || '');

    // Establecer Prestamo
    $("#inputPrestamos").val(empleado.prestamo || '');

    // Establecer Retardos
    $("#inputRetardos").val(empleado.retardos || '');

    // Establecer Olvidos Checador
    $("#inputBiometrico").val(empleado.checador || '');

    // Establecer Inasistencias
    $("#inputAusentismos").val(empleado.inasistencia || '');

    // Establecer Permisos
    $("#inputPermisos").val(empleado.permiso || '');

    // Establecer Uniforme
    $("#inputUniformes").val(empleado.uniformes || '');

    // Establecer F.A/GAFET/COFIA
    $("#inputFAGafetCofia").val(empleado.fa_gafet_cofia || '');

}


//==========================================================
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE OLVIDOS
// DE BIOMÉTRICO DEL EMPLEADO
//==========================================================

function establecerHistorialOlvidosBiometrico(historialOlvidos) {

    // Limpiar la tabla
    $("#tbody-historial-olvidos-biometrico").empty();


    // Validar si existen olvidos
    if (!historialOlvidos || historialOlvidos.length == 0) {

        $("#tbody-historial-olvidos-biometrico").append(`

            <tr>

                <td colspan="4" class="text-center text-muted">

                    No hay olvidos de biométrico registrados

                </td>

            </tr>

        `);

        return;

    }


    // Recorrer historial de olvidos
    for (let i = 0; i < historialOlvidos.length; i++) {

        let olvido = historialOlvidos[i];

        $("#tbody-historial-olvidos-biometrico").append(`

            <tr>

                <td>

                    ${olvido.dia}

                </td>

                <td>

                    ${olvido.fecha}

                </td>

                <td>

                    <input
                        type="number"
                        class="form-control"
                        id="inputDescuentoOlvido${i}"
                        value="${olvido.descuento_olvido}"
                        readonly>

                </td>

                <td class="text-center">

                    <!-- Editar -->
                    <button
                        type="button"
                        class="btn btn-outline-success btn-sm"
                        id="btnEditarOlvido${i}"
                        onclick="editarOlvidoBiometrico(${i})">

                        <i class="bi bi-pencil"></i>

                    </button>

                    <!-- Eliminar -->
                    <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        id="btnEliminarOlvido${i}"
                        onclick="eliminarOlvidoBiometrico(${i})">

                        <i class="bi bi-trash"></i>

                    </button>

                    <!-- Guardar -->
                    <button
                        type="button"
                        class="btn btn-success btn-sm"
                        id="btnGuardarOlvido${i}"
                        onclick="guardarOlvidoBiometrico(${i})"
                        hidden>

                        <i class="bi bi-check-lg"></i>

                    </button>

                    <!-- Cancelar -->
                    <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        id="btnCancelarOlvido${i}"
                        onclick="cancelarOlvidoBiometrico(${i})"
                        hidden>

                        <i class="bi bi-x-lg"></i>

                    </button>

                </td>

            </tr>

        `);

    }

}

// ======================================================
// FUNCION PARA MOSTRAR EL HISTORIAL DE INASISTENCIAS DEL 
// EMPLEADO
// ======================================================

function establecerHistorialInasistencias(historialInasistencias) {

    let empleado = objEmpleado.getEmpleado();

    // Limpiar campos
    $("#selectDiaAusentismo").val("");
    $("#inputCantidadAusentismo").val("");


    // Limpiar tabla
    $("#tbody-historial-ausentismos").empty();


    // Validar si existen inasistencias
    if (!historialInasistencias || historialInasistencias.length == 0) {


        $("#tbody-historial-ausentismos").append(`

            <tr>

                <td colspan="3" class="text-center text-muted">

                    No hay inasistencias registradas

                </td>

            </tr>

        `);


        return;

    }



    // Recorrer historial de inasistencias
    for (let i = 0; i < historialInasistencias.length; i++) {


        let inasistencia = historialInasistencias[i];



        $("#tbody-historial-ausentismos").append(`

            <tr>


                <td>

                    ${inasistencia.dia}

                </td>



                <td>


                    <input
                        type="number"
                        class="form-control"
                        id="inputDescuentoInasistencia${i}"
                        value="${inasistencia.descuento_inasistencia}"
                        readonly>


                </td>



                <td class="text-center">


                    <!-- Editar -->
                    <button
                        type="button"
                        class="btn btn-outline-success btn-sm"
                        id="btnEditarInasistencia${i}"
                        onclick="editarInasistencia(${i})">

                        <i class="bi bi-pencil"></i>

                    </button>



                    <!-- Eliminar -->
                    <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        id="btnEliminarInasistencia${i}"
                        onclick="eliminarInasistencia(${i})">

                        <i class="bi bi-trash"></i>

                    </button>



                    <!-- Guardar -->
                    <button
                        type="button"
                        class="btn btn-success btn-sm"
                        id="btnGuardarInasistencia${i}"
                        onclick="guardarInasistencia(${i})"
                        hidden>

                        <i class="bi bi-check-lg"></i>

                    </button>



                    <!-- Cancelar -->
                    <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        id="btnCancelarInasistencia${i}"
                        onclick="cancelarInasistencia(${i})"
                        hidden>

                        <i class="bi bi-x-lg"></i>

                    </button>


                </td>


            </tr>

        `);


    }


}

//==========================================================
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE RETARDOS
// DEL EMPLEADO
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
                <td class="text-center">
                    <!-- Editar -->
                    <button
                        type="button"
                        class="btn btn-outline-success btn-sm"
                        id="btnEditarRetardo${i}"
                        onclick="editarRetardo(${i})">
                        <i class="bi bi-pencil"></i>
                    </button>

                    <!-- Eliminar -->
                    <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        id="btnEliminarRetardo${i}"
                        onclick="eliminarRetardo(${i})">
                        <i class="bi bi-trash"></i>
                    </button>

                    <!-- Guardar -->
                    <button
                        type="button"
                        class="btn btn-success btn-sm"
                        id="btnGuardarRetardo${i}"
                        onclick="guardarRetardo(${i})"
                        hidden>
                        <i class="bi bi-check-lg"></i>
                    </button>

                    <!-- Cancelar -->
                    <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        id="btnCancelarRetardo${i}"
                        onclick="cancelarRetardo(${i})"
                        hidden>
                        <i class="bi bi-x-lg"></i>
                    </button>
                </td>
            </tr>
        `);

    }

}

//==========================================================
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE PERMISOS
// DEL EMPLEADO
//==========================================================

function establecerHistorialPermisos(historialPermisos) {

    let empleado = objEmpleado.getEmpleado();


    // Limpiar tabla
    $("#tbody-historial-permisos").empty();


    // Validar si existen permisos
    if (!historialPermisos || historialPermisos.length == 0) {

        $("#tbody-historial-permisos").append(`

            <tr>

                <td colspan="5" class="text-center text-muted">

                    No hay permisos registrados

                </td>

            </tr>

        `);

        return;

    }


    // Recorrer historial
    for (let i = 0; i < historialPermisos.length; i++) {

        let permiso = historialPermisos[i];

        $("#tbody-historial-permisos").append(`

            <tr>

                <td>

                    ${permiso.dia}

                </td>

                <td>

                    <input
                        type="number"
                        class="form-control"
                        id="inputMinutosPermisoHistorial${i}"
                        value="${permiso.minutos_permiso}"
                        readonly>

                </td>

                <td>

                    <input
                        type="number"
                        class="form-control"
                        id="inputCostoMinutoPermisoHistorial${i}"
                        value="${permiso.costo_por_minuto}"
                        readonly>

                </td>

                <td>

                    <input
                        type="number"
                        class="form-control"
                        id="inputDescuentoPermisoHistorial${i}"
                        value="${permiso.descuento_permiso}"
                        readonly>

                </td>

                <td class="text-center">

                    <!-- Eliminar -->
                    <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        id="btnEliminarPermiso${i}"
                        onclick="eliminarPermiso(${i})">

                        <i class="bi bi-trash"></i>

                    </button>

                   
                </td>

            </tr>

        `);

    }

}

//==========================================================
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE UNIFORMES
// DEL EMPLEADO
//==========================================================
function establecerHistorialUniformes(historialUniformes) {


    // Limpiar tabla
    $("#tbody-historial-uniformes").empty();



    // Validar si existen uniformes
    if (!historialUniformes || historialUniformes.length == 0) {


        $("#tbody-historial-uniformes").append(`

            <tr>

                <td colspan="3" class="text-center text-muted">

                    No hay uniformes registrados

                </td>

            </tr>

        `);


        return;


    }



    // Recorrer historial
    for (let i = 0; i < historialUniformes.length; i++) {


        let uniforme = historialUniformes[i];



        $("#tbody-historial-uniformes").append(`

            <tr>


                <td>

                    ${uniforme.folio}

                </td>


                <td>

                    <input
                        type="number"
                        class="form-control"
                        id="inputCantidadUniformeHistorial${i}"
                        value="${uniforme.cantidad}"
                        readonly>

                </td>



                <td class="text-center">


                    <!-- Editar -->
                    <button
                        type="button"
                        class="btn btn-outline-success btn-sm"
                        id="btnEditarUniforme${i}"
                        onclick="editarUniforme(${i})">

                        <i class="bi bi-pencil"></i>

                    </button>



                    <!-- Eliminar -->
                    <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        id="btnEliminarUniforme${i}"
                        onclick="eliminarUniforme(${i})">

                        <i class="bi bi-trash"></i>

                    </button>



                    <!-- Guardar -->
                    <button
                        type="button"
                        class="btn btn-success btn-sm"
                        id="btnGuardarUniforme${i}"
                        onclick="guardarUniforme(${i})"
                        hidden>

                        <i class="bi bi-check-lg"></i>

                    </button>



                    <!-- Cancelar -->
                    <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        id="btnCancelarUniforme${i}"
                        onclick="cancelarUniforme(${i})"
                        hidden>

                        <i class="bi bi-x-lg"></i>

                    </button>


                </td>


            </tr>


        `);


    }


}

//==========================================================
// FUNCIÓN PARA MOSTRAR LAS DEDUCCIONES EXTRAS
// DEL EMPLEADO EN LA TABLA DEL MODAL
//==========================================================

function mostrarDeduccionesExtras(deducciones_extra) {

    // Limpiar tabla
    $("#tbody-deducciones-extras").empty();

    // Validar si existen deducciones extras
    if (!deducciones_extra || deducciones_extra.length == 0) {

        $("#tbody-deducciones-extras").append(`

            <tr>

                <td colspan="3" class="text-center text-muted">

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
                    $${parseFloat(deduccion.cantidad).toFixed(2)}
                </td>

                <td class="text-center">

                    <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        onclick="eliminarDeduccionExtra(${i})">

                        <i class="bi bi-trash"></i>

                    </button>

                </td>

            </tr>

        `);

    }

}


//==========================================================
// FUNCIÓN PARA ESTABLECER EL TOTAL A COBRAR
// Y ESTABLECER EL STATUS DEL CHECKBOX DE REDONDEO
//==========================================================

function establecerTotalCobrarEmpleado(empleado) {

    // Establecer status del checkbox de redondeo
    // si redondeo_activo es true, marcar el checkbox, de lo contrario desmarcarlo
    $("#checkRedondearNomina").prop("checked", empleado.redondeo_activo || false);

    // Establecer Total a cobrar del empleado
    $("#inputTotalCobrar").val(empleado.total_cobrar || '');

    // Si el redondeo está activo, necesitamos guardar el valor sin redondear
    // en data-total-original para que al desactivar el check pueda volver a decimales
    if (empleado.redondeo_activo) {

        // El valor redondeo indica la diferencia entre el valor redondeado y el original
        // Valor original = total_cobrar - redondeo
        let totalSinRedondear = empleado.total_cobrar - (empleado.redondeo || 0);

        $("#inputTotalCobrar").attr("data-total-original", totalSinRedondear);

    } else {

        // Si no está activo, el valor actual ya es sin redondear
        let totalSinRedondear = empleado.total_cobrar || 0;

        $("#inputTotalCobrar").attr("data-total-original", totalSinRedondear);

    }

    // Actualizar el label del pie del modal
    $("#labelTotalEmpleado").text(formatoMoneda(empleado.total_cobrar || 0));

}


//==========================================================
// FUNCIÓN PARA MOSTRAR LOS REGISTROS
// DEL EMPLEADO
//==========================================================

function establecerRegistrosEmpleado(registros) {


    // Guardar registros actuales para evaluar eventos
    registrosEmpleadoActuales = registros;


    // Limpiar tabla
    $("#tbody-registros-empleado").empty();


    // Validar registros
    if (!registros || registros.length == 0) {


        $("#tbody-registros-empleado").append(`

            <tr>

                <td colspan="4" class="text-center text-muted">

                    No hay registros disponibles

                </td>

            </tr>

        `);


        return;

    }



    // Recorrer registros
    registros.forEach(function (registro) {



        let claseEvento = obtenerClaseEventoRegistro(registro);



        $("#tbody-registros-empleado").append(`

            <tr class="${claseEvento}">

                <td>${registro.dia}</td>

                <td>${registro.fecha}</td>

                <td>${registro.entrada || "-"}</td>

                <td>${registro.salida || "-"}</td>

            </tr>

        `);



    });


}


//==========================================================
// FUNCIÓN PARA MOSTRAR EL HORARIO DE ACUERDO AL TIPO DE 
// HORARIO DEL EMPLEADO YA SEA OFICIAL O DE RANCHO
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
