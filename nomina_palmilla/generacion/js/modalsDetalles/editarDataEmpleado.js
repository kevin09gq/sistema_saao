$(document).ready(function () {
    actualizarPropiedadesEmpleado();

    actualizarInputsConceptos();

   // cerrarModalDetallesNominaEmpleado();
});

//==========================================================
// FUNCIÓN PARA ACTUALIZAR LAS PROPIEDADES
// DEL EMPLEADO
//==========================================================

function actualizarPropiedadesEmpleado() {

    $("#btnGuardarConfiguracionNomina").on("click", function () {

        let empleado = objEmpleado.getEmpleado();

        actualizarPercepcionesEmpleado(empleado);

        actualizarConceptosEmpleado(empleado);

        actualizarDeduccionesEmpleado(empleado);

        actualizarStatusRedondeo(empleado);

        llenarTablaNomina();

        // limpiarModalDetallesNominaEmpleado();

        $("#modalDetallesNominaEmpleado").modal("hide");

    });

}

//==========================================================
// FUNCIÓN PARA CERRAR EL MODAL DE DETALLES DEL EMPLEADO 
// ==========================================================

function cerrarModalDetallesNominaEmpleado() {
    $("#btnCerrarModalDetallesNomina").click(function (e) {
        e.preventDefault();
        limpiarModalDetallesNominaEmpleado();

    });

    $("#btnCerrarModalDetallesNomina").click(function (e) {
        e.preventDefault();
        limpiarModalDetallesNominaEmpleado();
    });
}

//==========================================================
// FUNCIÓN PARA ACTUALIZAR LAS PERCEPCIONES
// DEL EMPLEADO
//==========================================================

function actualizarPercepcionesEmpleado(empleado) {

    empleado.salario_semanal =
        parseFloat($("#inputSalarioSemanal").val()) || 0;

    empleado.comida =
        parseFloat($("#inputComida").val()) || 0;

    empleado.pasaje =
        parseFloat($("#inputPasaje").val()) || 0;

    empleado.tardeada =
        parseFloat($("#inputTardeada").val()) || 0;

    empleado.sueldo_extra_total =
        parseFloat($("#inputTotalSueldoExtra").val()) || 0;

}

//==========================================================
// FUNCIÓN PARA ACTUALIZAR LOS CONCEPTOS
// DEL EMPLEADO
//==========================================================

function actualizarConceptosEmpleado(empleado) {

    const conceptos = empleado.conceptos || [];

    const actualizarConcepto = (codigo, nuevoResultado) => {
        const concepto = conceptos.find(c => c.codigo === codigo);
        if (concepto) {
            concepto.resultado = nuevoResultado;
        } else {
            conceptos.push({ codigo, resultado: nuevoResultado });
        }
    };

    actualizarConcepto("45", parseFloat($('#inputISR').val()) || 0); // ISR
    actualizarConcepto("52", parseFloat($('#inputIMSS').val()) || 0); // IMSS
    actualizarConcepto("16", parseFloat($('#inputInfonavit').val()) || 0); // Infonavit
    actualizarConcepto("107", parseFloat($('#inputAjustesSub').val()) || 0); // Ajuste al Sub

}

//========================================================================================
// FUNCIÓN PARA RESTAURAR EL IMPORTE ORIGINAL DE UN CONCEPTO O DE LA TARJETA
// SE VA A ESTABLECER EL VALOR ORIGINAL EN EL INPUT CORRESPONDIENTE
//========================================================================================

function restaurarImporteOriginal(tipo, referencia, inputDestino) {

    // Obtener el empleado seleccionado
    const empleado = objEmpleado.getEmpleado();

    // Validar que exista el empleado
    if (!empleado) {
        return;
    }

    let valor = 0;

    // RESTAURAR UN CONCEPTO

    if (tipo == "concepto") {

        // Buscar el concepto dentro de conceptos_copia
        const concepto = empleado.conceptos_copia.find(function (item) {
            return item.codigo == referencia;
        });

        // Si no existe el concepto salir
        if (!concepto) {
            return;
        }

        // Obtener el importe original
        valor = concepto.resultado;

    }

    // RESTAURAR EL IMPORTE DE LA TARJETA

    else if (tipo == "tarjeta") {

        // Obtener el importe original de la tarjeta
        valor = empleado.tarjeta_copia;

    }

    // Establecer el valor en el input y disparar el evento change
    $(inputDestino).val(valor).trigger("change");

}

//=============================================================================
// FUNCIÓN PARA APLICAR LOS EVENTOS DE LOS BOTONES DE ACTUALIZACIÓN
//=============================================================================

function actualizarInputsConceptos() {

    $("#btnActualizarIsr").click(function () {
        restaurarImporteOriginal("concepto", "45", "#inputISR");
    });

    $("#btnActualizarImss").click(function () {
        restaurarImporteOriginal("concepto", "52", "#inputIMSS");
    });

    $("#btnActualizarInfonavit").click(function () {
        restaurarImporteOriginal("concepto", "16", "#inputInfonavit");
    });

    $("#btnActualizarAjusteSub").click(function () {
        restaurarImporteOriginal("concepto", "107", "#inputAjustesSub");
    });

    $("#btnActualizarTarjeta").click(function () {
        restaurarImporteOriginal("tarjeta", null, "#inputTarjeta");
    });

}

//==========================================================
// FUNCIÓN PARA ACTUALIZAR LAS DEDUCCIONES
// DEL EMPLEADO
//==========================================================

function actualizarDeduccionesEmpleado(empleado) {

    empleado.tarjeta =
        parseFloat($("#inputTarjeta").val()) || 0;

    empleado.prestamo =
        parseFloat($("#inputPrestamos").val()) || 0;

    empleado.retardos =
        parseFloat($("#inputRetardos").val()) || 0;

    empleado.checador =
        parseFloat($("#inputBiometrico").val()) || 0;

    empleado.inasistencia =
        parseFloat($("#inputAusentismos").val()) || 0;

    empleado.permiso =
        parseFloat($("#inputPermisos").val()) || 0;

    empleado.uniformes =
        parseFloat($("#inputUniformes").val()) || 0;

    empleado.fa_gafet_cofia =
        parseFloat($("#inputFAGafetCofia").val()) || 0;

}

//====================================================================
// FUNCIÓN PARA ACTUALIZAR EL STATUS DE REDONDEO A TRAVEZ DEL
// checkRedondearNomina SI ESTA ACTIVO ACTUALIZAMOS EL STATUS 
// redondeo_activo = true, SI NO ESTA ACTIVO redondeo_activo = false
//====================================================================

function actualizarStatusRedondeo(empleado) {

    // Obtener el estado del checkbox
    const isRedondeoActivo = $('#checkRedondearNomina').is(':checked');

    // Actualizar la propiedad redondeo_activo del empleado
    empleado.redondeo_activo = isRedondeoActivo;

    // Actualizar la propiedad redondeo del empleado según el estado del checkbox, para actualizar
    // La tabla de nomina y mostrar el redondeo en la columna correspondiente, si el checkbox esta activo

    if (isRedondeoActivo) {

        // Obtener el valor sin redondear del atributo data
        let totalSinRedondear = parseFloat($('#inputTotalCobrar').attr('data-total-original')) || 0;

        // Obtener el valor actual del input (que podría estar redondeado)
        let totalActual = parseFloat($('#inputTotalCobrar').val()) || 0;

        // Calcular el valor de redondeo (diferencia entre valor redondeado y original)
        empleado.redondeo = parseFloat((totalActual - totalSinRedondear).toFixed(2));

    } else {

        // Si no está activo, el redondeo es 0
        empleado.redondeo = 0;


    }

}


//===================================================
// LIMPIAR MODAL DETALLES NÓMINA EMPLEADO
// LIMPIA CAMPOS, TABLAS Y OBJETO TEMPORAL
//===================================================

function limpiarModalDetallesNominaEmpleado() {


    //==========================================
    // LIMPIAR OBJETO DEL EMPLEADO SELECCIONADO
    //==========================================

    if (typeof objEmpleado !== "undefined") {

        objEmpleado.limpiarEmpleado();

    }


    //==========================================
    // LIMPIAR LABELS
    //==========================================

    $('#labelNombreEmpleado').text('');

    $('#labelTotalEmpleado').text('$0.00');



    //==========================================
    // LIMPIAR RESUMEN
    //==========================================

    $('#campo-minutos-trabajados-palmilla').text('');

    $('#campo-minutos-extras-palmilla').text('');



    //==========================================
    // LIMPIAR INPUTS PERCEPCIONES
    //==========================================

    $('#inputSueldoNeto').val('');

    $('#inputIncentivo').val('');

    $('#inputTotalSueldoExtra').val('');

    $('#inputHorasExtras').val('');

    $('#inputBonoAntiguedad').val('');

    $('#inputActividadesEspeciales').val('');

    $('#inputPuesto').val('');

    $('#inputNombrePercepcionExtra').val('');

    $('#inputCantidadPercepcionExtra').val('');



    //==========================================
    // LIMPIAR CONCEPTOS
    //==========================================

    $('#inputISR').val('');

    $('#inputIMSS').val('');

    $('#inputInfonavit').val('');

    $('#inputAjustesSub').val('');

    $('#inputTotalConceptos').val('');



    //==========================================
    // LIMPIAR DEDUCCIONES
    //==========================================

    $('#inputTarjeta').val('');

    $('#inputPrestamos').val('');

    $('#inputBiometrico').val('');

    $('#inputAusentismos').val('');

    $('#inputPermisos').val('');

    $('#inputUniformes').val('');

    $('#inputFAGafetCofia').val('');



    //==========================================
    // LIMPIAR INPUTS AUXILIARES
    //==========================================


    $('#selectDiaAusentismo').val('');

    $('#inputCantidadAusentismo').val('');


    $('#selectDiaPermiso').val('');

    $('#inputMinutosPermiso').val('');

    $('#inputCostoMinutoPermiso').val('');

    $('#inputDescuentoPermiso').val('');



    $('#inputFolioUniforme').val('');

    $('#inputCantidadUniforme').val('');



    $('#inputNombreDeduccionExtra').val('');

    $('#inputCantidadDeduccionExtra').val('');



    //==========================================
    // LIMPIAR TABLAS
    //==========================================


    $('#tbody-registros-empleado').empty();


    $('#tbody-biometrico-redondeado').empty();


    $('#tbody-historial-olvidos-biometrico').empty();


    $('#tbody-historial-ausentismos').empty();


    $('#tbody-historial-permisos').html(`

        <tr>

            <td colspan="5" class="text-center text-muted">
                No hay permisos registrados
            </td>

        </tr>

    `);



    $('#tbody-historial-uniformes').html(`

        <tr>

            <td colspan="3" class="text-center text-muted">
                No hay uniformes registrados
            </td>

        </tr>

    `);



    $('#tbody-percepciones-extras').html(`

        <tr>

            <td colspan="3" class="text-center text-muted">
                No hay percepciones extras agregadas
            </td>

        </tr>

    `);



    $('#tbody-deducciones-extras').html(`

        <tr>

            <td colspan="3" class="text-center text-muted">
                No hay conceptos adicionales agregados
            </td>

        </tr>

    `);



    //==========================================
    // LIMPIAR EVENTOS ESPECIALES
    //==========================================


    $('#entradas-tempranas-palmilla').empty();

    $('#salidas-tardias-palmilla').empty();

    $('#salidas-tempranas-palmilla').empty();

    $('#olvidos-checador-palmilla').empty();

    $('#retardos-palmilla').empty();

    $('#inasistencias-content-palmilla').empty();

    $('#comida-palmilla').empty();

    $('#marcajes-palmilla').empty();



    // Totales

    $('#total-entradas-tempranas-palmilla').text('0');

    $('#total-salidas-tardias-palmilla').text('0');

    $('#total-salidas-tempranas-palmilla').text('0');

    $('#total-olvidos-checador-palmilla').text('0');

    $('#total-retardos-palmilla').text('0');

    $('#total-inasistencias-palmilla').text('0');

    $('#total-comida-palmilla').text('0');

    $('#total-marcajes-palmilla').text('0');



    //==========================================
    // REGRESAR TAB PRINCIPAL
    //==========================================


    $('#tab-registros-principal-tab').tab('show');


    $('#tab-registros-tab').tab('show');



    //==========================================
    // HABILITAR INPUTS NUEVAMENTE
    //==========================================


    $('#modalDetallesNominaEmpleado input').prop('disabled', false);



    // Volver a bloquear los calculados

    $('#inputTotalSueldoExtra').prop('disabled', true);

    $('#inputTotalConceptos').prop('disabled', true);

    $('#inputTotalCobrar').prop('disabled', true);

    $('#inputBiometrico').prop('disabled', true);

    $('#inputAusentismos').prop('disabled', true);

    $('#inputPermisos').prop('disabled', true);

    $('#inputUniformes').prop('disabled', true);

    $('#inputFAGafetCofia').prop('disabled', true);


}