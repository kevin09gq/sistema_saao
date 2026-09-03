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

    // Establecer el nombre del empleado en el label del modal
    $("#labelNombreEmpleado").text(empleado.nombre || '');

    establecerMinutosTrabajadosYExtras(empleado);

    // Establecer Percepciones y Percepciones Extras
    establecerPercepciones(empleado);
    mostrarPercepcionesExtras(empleado.percepciones_extra);

    // Establecer Conceptos
    establecerConceptos(empleado);

    desactivarInputsConceptos(empleado);

    // Establecer Deducciones y Deducciones Extras
    establecerDeducciones(empleado);
    mostrarDeduccionesExtras(empleado.deducciones_extra);

    // Establecer Historiales de Incidencias
    establecerHistorialOlvidosBiometrico(empleado.historial_olvidos);
    establecerHistorialInasistencias(empleado.historial_inasistencias);
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
    establecerEventosOlvidosBiometrico(empleado.registros, jsonNomina40lbs);
    establecerEventosEntradasTempranas(empleado.registros, jsonNomina40lbs);
    establecerEventosSalidasTardias(empleado.registros, jsonNomina40lbs);
    establecerEventosSalidasTempranas(empleado.registros, jsonNomina40lbs);
    establecerEventosRetardos(empleado.registros, jsonNomina40lbs);
    establecerEventosAusentismos(empleado.registros, jsonNomina40lbs);
    establecerEventosComidaExtra(empleado.registros, jsonNomina40lbs);
    establecerEventosMarcajes(empleado.registros, jsonNomina40lbs);

    // Establecer Registros y Biometrico Redondeado (renderizar tablas)
    establecerRegistrosEmpleado(empleado.registros);
    establecerBiometricoRedondeado(empleado.biometrico_redondeado);

    // Establecer Registros Copia (si existen)
    if (empleado.registros_copia) {
        establecerRegistrosCopiaEmpleado(empleado.registros_copia);
    }

    // Abrir el modal de detalles del empleado
    $('#modalDetallesNominaEmpleado').modal('show');
}


//==========================================================
// FUNCIÓN PARA ESTABLECER LOS MINUTOS DEL EMPLEADO
//==========================================================

function establecerMinutosTrabajadosYExtras(empleado) {

    // Obtener minutos programados del empleado según los horarios semanales

    var minutosProgramados = 0;

    if (
        jsonNomina40lbs.horarios_semanales &&
        Array.isArray(jsonNomina40lbs.horarios_semanales)
    ) {

        for (var i = 0; i < jsonNomina40lbs.horarios_semanales.length; i++) {

            var horario = jsonNomina40lbs.horarios_semanales[i];

            minutosProgramados += parseInt(horario.minutos) || 0;

        }

    }

    // Obtener minutos trabajados
    var minutosTrabajados = parseInt(empleado.minutos_trabajados) || 0;

    // Obtener minutos extras trabajados

    var minutosExtras = parseInt(
        empleado.minutos_extras_trabajados
    ) || 0;

    // Calcular minutos no trabajados

    var minutosNoTrabajados = minutosProgramados - minutosTrabajados;

    // Evitar valores negativos
    if (minutosNoTrabajados < 0) {
        minutosNoTrabajados = 0;
    }

    $("#campo-minutos-programados-40lbs").text(
        minutosProgramados
    );

    $("#campo-minutos-trabajados-40lbs").text(
        minutosTrabajados
    );

    $("#campo-minutos-extras-40lbs").text(
        minutosExtras
    );

    $("#campo-minutos-no-trabajados-40lbs").text(
        minutosNoTrabajados
    );
}

//==========================================================
// FUNCIÓN PARA ESTABLECER LOS VALORES DE LAS PERCEPCIONES
// DEL EMPLEADO EN LOS INPUTS DEL MODAL
//==========================================================

function establecerPercepciones(empleado) {
    // Establecer sueldo neto
    $("#inputSueldoNeto").val(empleado.sueldo_neto || '');

    // Establecer incentivo 
    $("#inputIncentivo").val(empleado.incentivo || '');

    // Establecer Horas extras
    $("#inputHorasExtras").val(empleado.horas_extra || '');

    // Establecer Bono de Antiguedad
    $("#inputBonoAntiguedad").val(empleado.bono_antiguedad || '');

    // Establecer actividades especiales
    $("#inputActividadesEspeciales").val(empleado.actividades_especiales || '');

    // Establecer puesto
    $("#inputPuesto").val(empleado.puesto || '');

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

    // Establecer costo por minuto por defecto y limpiar campos
    $("#inputCostoMinutoAusentismo").val(jsonNomina40lbs.costo_por_minuto || 0);
    $("#inputMinutosAusentismo").val("");
    $("#selectDiaAusentismo").val("");

    if (empleado && empleado.sueldo_base == true) {
        $("#inputCantidadAusentismo").val((empleado.sueldo_neto / 7).toFixed(2));
    } else {
        $("#inputCantidadAusentismo").val("");
    }


    // Limpiar tabla
    $("#tbody-historial-ausentismos").empty();



    // Validar si existen inasistencias
    if (!historialInasistencias || historialInasistencias.length == 0) {


        $("#tbody-historial-ausentismos").append(`

            <tr>

                <td colspan="5" class="text-center text-muted">

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
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE PERMISOS
// DEL EMPLEADO
//==========================================================

function establecerHistorialPermisos(historialPermisos) {

    let empleado = objEmpleado.getEmpleado();

    // Establecer en el input inputCostoMinutoPermiso el costo_por_minuto si existe,
    // si no existe, establecerlo en 0
    $("#inputCostoMinutoPermiso").val(jsonNomina40lbs.costo_por_minuto || 0);
    $("#inputMinutosPermiso").val("");
    $("#selectDiaPermiso").val("");

    if (empleado && empleado.sueldo_base == true) {
        $("#inputDescuentoPermiso").val((empleado.sueldo_neto / 7).toFixed(2));
    } else {
        $("#inputDescuentoPermiso").val("");
    }

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

                    <!-- Editar -->
                    <button
                        type="button"
                        class="btn btn-outline-success btn-sm"
                        id="btnEditarPermiso${i}"
                        onclick="editarPermiso(${i})">

                        <i class="bi bi-pencil"></i>

                    </button>


                    <!-- Eliminar -->
                    <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        id="btnEliminarPermiso${i}"
                        onclick="eliminarPermiso(${i})">

                        <i class="bi bi-trash"></i>

                    </button>


                    <!-- Guardar -->
                    <button
                        type="button"
                        class="btn btn-success btn-sm"
                        id="btnGuardarPermiso${i}"
                        onclick="guardarPermiso(${i})"
                        hidden>

                        <i class="bi bi-check-lg"></i>

                    </button>


                    <!-- Cancelar -->
                    <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        id="btnCancelarPermiso${i}"
                        onclick="cancelarPermiso(${i})"
                        hidden>

                        <i class="bi bi-x-lg"></i>

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

                <td colspan="6" class="text-center text-muted">

                    No hay registros disponibles

                </td>

            </tr>

        `);

        return;

    }

    // Recorrer registros
    registros.forEach(function (registro, indice) {

        let claseEvento = obtenerClaseEventoRegistro(registro);

        $("#tbody-registros-empleado").append(`

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

                <td class="celda-accion text-center">

                    <div class="d-flex justify-content-center gap-1">

                        <button
                            type="button"
                            class="btn btn-primary btn-sm btn-editar-registro"
                            data-indice="${indice}"
                            title="Editar">

                            <i class="bi bi-pencil-square"></i>

                        </button>

                        <button
                            type="button"
                            class="btn btn-success btn-sm btn-agregar-fila"
                            data-indice="${indice}"
                            title="Agregar fila">

                            <i class="bi bi-plus-lg"></i>

                        </button>

                        <button
                            type="button"
                            class="btn btn-danger btn-sm btn-eliminar-fila"
                            data-indice="${indice}"
                            title="Eliminar fila">

                            <i class="bi bi-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `);

    });

    // Activar eventos de los botones
    eventosEditarRegistrosEmpleado();

}

//==========================================================
// FUNCIÓN PARA MOSTRAR LOS REGISTROS COPIA
// DEL EMPLEADO (SIN COLUMNA ACCIÓN)
//==========================================================
function establecerRegistrosCopiaEmpleado(registrosCopia) {

    // Limpiar tabla
    $("#tbody-registros-copia").empty();

    // Validar registros copia
    if (!registrosCopia || registrosCopia.length == 0) {

        $("#tbody-registros-copia").append(`

            <tr>

                <td colspan="5" class="text-center text-muted">

                    No hay registros copia disponibles

                </td>

            </tr>

        `);

        return;

    }

    // Inicializar claseEvento para todos los registros copia
    registrosCopia.forEach(function (registroCopia) {
        registroCopia.claseEvento = "";
    });

    // Aplicar eventos de incidencias a los registros copia (solo asignan clases, no modifican UI)
    establecerEventosOlvidosBiometrico(registrosCopia, jsonNomina40lbs);
    establecerEventosEntradasTempranas(registrosCopia, jsonNomina40lbs);
    establecerEventosSalidasTardias(registrosCopia, jsonNomina40lbs);
    establecerEventosSalidasTempranas(registrosCopia, jsonNomina40lbs);
    establecerEventosRetardos(registrosCopia, jsonNomina40lbs);
    establecerEventosAusentismos(registrosCopia, jsonNomina40lbs);
    establecerEventosComidaExtra(registrosCopia, jsonNomina40lbs);
    establecerEventosMarcajes(registrosCopia, jsonNomina40lbs);

    // Recorrer registros copia y aplicar colores
    registrosCopia.forEach(function (registroCopia) {

        let claseEvento = obtenerClaseEventoRegistro(registroCopia);

        $("#tbody-registros-copia").append(`

            <tr class="${claseEvento}">

                <td>${registroCopia.dia || "-"}</td>

                <td>${registroCopia.fecha || "-"}</td>

                <td>${registroCopia.entrada || "-"}</td>

                <td>${registroCopia.salida || "-"}</td>

                <td>${registroCopia.minutos || 0}</td>

            </tr>

        `);

    });

}


//==========================================================
// FUNCIÓN PARA MOSTRAR EL BIOMÉTRICO REDONDEADO
// DEL EMPLEADO
//==========================================================

function establecerBiometricoRedondeado(biometrico_redondeado) {

    // Limpiar tabla
    $("#tbody-biometrico-redondeado").empty();

    // Validar si existen registros
    if (!biometrico_redondeado || biometrico_redondeado.length == 0) {

        $("#tbody-biometrico-redondeado").append(`

            <tr>

                <td colspan="8" class="text-center text-muted">

                    No hay Biométricos disponibles

                </td>

            </tr>

        `);

        return;

    }

    // Recorrer registros
    biometrico_redondeado.forEach((biometrico) => {

        $("#tbody-biometrico-redondeado").append(`

            <tr>

                <td>${biometrico.dia}</td>

                <td>${biometrico.entrada || "-"}</td>

                <td>${biometrico.entrada_comida || "-"}</td>

                <td>${biometrico.termino_comida || "-"}</td>

                <td>${biometrico.salida || "-"}</td>

                <td>${biometrico.horas_comida || "-"}</td>

                <td>${biometrico.minutos_trabajados || "-"}</td>

                <td>${biometrico.horas_trabajadas || "-"}</td>
            </tr>

        `);

    });

}
