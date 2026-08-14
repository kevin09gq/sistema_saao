$(document).ready(function () {
    aplicarInputsSueldoExtra();
    aplicarInputsConceptos();
    aplicarInputsSueldoCobrar();
    activarRedondeoNomina();
    aplicarLimitarConceptoPorCopia();
});

//=====================================================================================
// FUNCIÓN PARA APLICAR A LOS INPUTS EL EVENTO DE CALCULAR EL TOTAL DEL SUELDO EXTRA
// EN TIEMPO REAL, CADA VEZ QUE SE MODIFIQUE EL VALOR DE ALGUNO DE LOS CAMPOS
//=====================================================================================
function aplicarInputsSueldoExtra() {
    $(document).on(
        "input",
        "#inputHorasExtras, #inputBonoAntiguedad, #inputActividadesEspeciales, #inputPuesto",
        function () {


            calcularTotalSueldoExtra();


        }
    );
}


//==========================================================
// FUNCIÓN PARA CALCULAR EL TOTAL DEL SUELDO EXTRA
// DEL EMPLEADO
//==========================================================
function calcularTotalSueldoExtra() {

    let horasExtras = parseFloat($("#inputHorasExtras").val()) || 0;

    let bonoAntiguedad = parseFloat($("#inputBonoAntiguedad").val()) || 0;

    let actividadesEspeciales = parseFloat($("#inputActividadesEspeciales").val()) || 0;

    let puesto = parseFloat($("#inputPuesto").val()) || 0;



    // Variable para almacenar percepciones extras
    let totalPercepcionesExtras = 0;



    // Obtener empleado actual
    let empleado = objEmpleado.getEmpleado();



    // Validar si tiene percepciones extras
    if (empleado && empleado.percepciones_extra) {


        // Recorrer percepciones extras
        for (let i = 0; i < empleado.percepciones_extra.length; i++) {


            totalPercepcionesExtras +=
                parseFloat(empleado.percepciones_extra[i].cantidad) || 0;


        }


    }



    // Calcular total
    let total =
        horasExtras +
        bonoAntiguedad +
        actividadesEspeciales +
        puesto +
        totalPercepcionesExtras;



    // Mostrar resultado
    $("#inputTotalSueldoExtra").val(total.toFixed(2)).trigger('change');


}

//==========================================================
// EVENTO PARA ACTUALIZAR LOS CONCEPTOS
// EN TIEMPO REAL
//==========================================================

function aplicarInputsConceptos() {
    $(document).on(
        "input change",
        "#inputISR, #inputIMSS, #inputInfonavit, #inputAjustesSub",
        function () {

            calcularTotalConceptos();

        }
    );
}


//==========================================================
// FUNCIÓN PARA CALCULAR EL TOTAL DE CONCEPTOS
// DEL EMPLEADO EN TIEMPO REAL
//==========================================================

function calcularTotalConceptos() {


    // Obtener valor del ISR
    let isr = parseFloat($("#inputISR").val()) || 0;


    // Obtener valor del IMSS
    let imss = parseFloat($("#inputIMSS").val()) || 0;


    // Obtener valor del INFONAVIT
    let infonavit = parseFloat($("#inputInfonavit").val()) || 0;


    // Obtener valor de Ajustes al Subsidio
    let ajustesSub = parseFloat($("#inputAjustesSub").val()) || 0;



    // Realizar suma de todos los conceptos
    let totalConceptos =
        isr +
        imss +
        infonavit +
        ajustesSub;



    // Mostrar resultado en el campo Total Conceptos
    $("#inputTotalConceptos").val(totalConceptos.toFixed(2));

}

//==========================================================
// FUNCIÓN PARA CALCULAR EL TOTAL DE F.A/GAFET/COFIA
// DEL EMPLEADO
//==========================================================

function calcularTotalFAGafetCofia() {

    // Variable para almacenar deducciones extras
    let totalDeduccionesExtras = 0;

    // Obtener empleado actual
    let empleado = objEmpleado.getEmpleado();

    // Validar si tiene deducciones extras
    if (empleado && empleado.deducciones_extra) {

        // Recorrer deducciones extras
        for (let i = 0; i < empleado.deducciones_extra.length; i++) {

            totalDeduccionesExtras +=
                parseFloat(empleado.deducciones_extra[i].cantidad) || 0;

        }

    }

    // Actualizar la propiedad del empleado
    if (empleado) {
        empleado.fa_gafet_cofia = totalDeduccionesExtras;
    }

    // Mostrar resultado (solo deducciones extras)
    $("#inputFAGafetCofia").val(totalDeduccionesExtras.toFixed(2)).trigger('change');

}

//==========================================================
// FUNCIÓN PARA APLICAR A LOS INPUTS DEL MODAL EL EVENTO DE 
// CALCULAR EL TOTAL A COBRAR EN TIEMPO REAL CUANDO PRESIONO 
// UNA TECLA, CADA VEZ QUE SE MODIFIQUE EL VALOR DE ALGUNO DE 
// LOS CAMPOS
//==========================================================

function aplicarInputsSueldoCobrar() {

    // Escuchar cambios en todos los inputs que afectan el total
    // Usamos el evento 'change' que detecta cambios programáticos (cuando se actualiza con JavaScript)
    // Incluyendo los inputs que componen el sueldo extra (horas extras, bono, etc)
    $(document).on("input change", `
        #inputSueldoNeto,
        #inputIncentivo,
        #inputTotalSueldoExtra,
        #inputISR,
        #inputIMSS,
        #inputInfonavit,
        #inputAjustesSub,
        #inputTarjeta,
        #inputPrestamos,
        #inputBiometrico,
        #inputAusentismos,
        #inputPermisos,
        #inputUniformes,
        #inputFAGafetCofia
    `, function () {

        calcularTotalCobrar();
    });

}


//==========================================================
// FUNCIÓN PARA CALCULAR EL TOTAL A COBRAR
// EN TIEMPO REAL
//==========================================================

function calcularTotalCobrar() {

    let percepciones = 0;

    percepciones += parseFloat($("#inputSueldoNeto").val()) || 0;
    percepciones += parseFloat($("#inputIncentivo").val()) || 0;
    percepciones += parseFloat($("#inputTotalSueldoExtra").val()) || 0;


    let deducciones = 0;

    deducciones += parseFloat($("#inputISR").val()) || 0;
    deducciones += parseFloat($("#inputIMSS").val()) || 0;
    deducciones += parseFloat($("#inputInfonavit").val()) || 0;
    deducciones += parseFloat($("#inputAjustesSub").val()) || 0;
    deducciones += parseFloat($("#inputTarjeta").val()) || 0;
    deducciones += parseFloat($("#inputPrestamos").val()) || 0;
    deducciones += parseFloat($("#inputBiometrico").val()) || 0;
    deducciones += parseFloat($("#inputAusentismos").val()) || 0;
    deducciones += parseFloat($("#inputPermisos").val()) || 0;
    deducciones += parseFloat($("#inputUniformes").val()) || 0;
    deducciones += parseFloat($("#inputFAGafetCofia").val()) || 0;


    let total = percepciones - deducciones;

    // Guardar el valor sin redondear en el atributo data del input
    $("#inputTotalCobrar").attr("data-total-original", total);

    // Aplicar redondeo si está activo
    if ($("#checkRedondearNomina").prop("checked")) {

        total = Math.round(total);

    }


    $("#inputTotalCobrar").val(total.toFixed(2));

    $("#labelTotalEmpleado").text(
        formatoMoneda(total)
    );

}


//==========================================================
// FUNCIÓN PARA ACTIVAR EL REDONDEO
// SOLO COMO VISTA PREVIA
//==========================================================

function activarRedondeoNomina() {

    // Detectar cuando el usuario marque o desmarque el check
    $("#checkRedondearNomina").on("change", function () {

        // La primera vez que se marca el check,
        // guardar el total original del input.
        // Esto permite regresar al valor sin redondear
        // cuando el usuario desactive el check.
        if ($("#inputTotalCobrar").attr("data-total-original") == undefined) {

            $("#inputTotalCobrar").attr(

                // Crear un atributo personalizado en el input
                // con el total sin redondear.
                "data-total-original",

                // Guardar el valor actual del input.
                $("#inputTotalCobrar").val()

            );

        }

        // Obtener el total original almacenado.
        // Si por alguna razón no existe, tomar 0.
        let totalOriginal = parseFloat($("#inputTotalCobrar").attr("data-total-original")) || 0;


        // Inicialmente el total será el original.
        let total = totalOriginal;


        // Si el check está activado,
        // mostrar el total redondeado.
        if ($(this).prop("checked")) {

            total = Math.round(totalOriginal);

        }


        // Mostrar el resultado en el input.
        $("#inputTotalCobrar").val(

            total.toFixed(2)

        );


        // Actualizar el total mostrado en el pie del modal.
        $("#labelTotalEmpleado").text(

            formatoMoneda(total)

        );

    });

}


//===================================================
// FUNCIÓN PARA APLICAR EL EVENTO DE LIMITAR EL VALOR 
// DE UN CONCEPTO SEGÚN EL VALOR DEL CONCEPTO DE COPIA
//===================================================

function aplicarLimitarConceptoPorCopia() {
    
    $("#inputISR").on("input", function () {
        limitarImporte("concepto", "45", "#inputISR");
    });

    $("#inputIMSS").on("input", function () {
        limitarImporte("concepto", "52", "#inputIMSS");
    });

    /*
    $("#inputInfonavit").on("input", function () {
        limitarImporte("concepto", "16", "#inputInfonavit");
    });*/

    $("#inputAjustesSub").on("input", function () {
        limitarImporte("concepto", "107", "#inputAjustesSub");
    });

    $("#inputTarjeta").on("input", function () {
        limitarImporte("tarjeta", null, "#inputTarjeta");
    });

}


//===================================================
// FUNCIÓN PARA LIMITAR EL IMPORTE MÁXIMO
//===================================================

function limitarImporte(tipo, referencia, inputDestino) {

    // Obtener el empleado seleccionado
    const empleado = objEmpleado.getEmpleado();

    // Validar que exista el empleado
    if (!empleado) {
        return;
    }

    // Variable que almacenará el importe máximo permitido
    let valorMaximo = 0;

    // OBTENER EL IMPORTE MÁXIMO

    // Si es un concepto (ISR, IMSS, INFONAVIT, etc.)
    if (tipo == "concepto") {

        // Buscar el concepto dentro de la copia
        const concepto = empleado.conceptos_copia.find(function (item) {
            return item.codigo == referencia;
        });

        // Si no existe el concepto salir de la función
        if (!concepto) {
            return;
        }

        // Guardar el importe original del concepto
        valorMaximo = parseFloat(concepto.resultado) || 0;

    }

    // Si es el importe de la tarjeta
    else if (tipo == "tarjeta") {

        // Obtener el importe original de la tarjeta
        valorMaximo = parseFloat(empleado.tarjeta_copia) || 0;

    }

    // VALIDAR EL IMPORTE CAPTURADO

    // Obtener el valor escrito por el usuario
    let valorCapturado = parseFloat($(inputDestino).val()) || 0;

    // Si el valor capturado supera el importe original
    if (valorCapturado > valorMaximo) {

        // Restablecer el valor máximo permitido
        $(inputDestino).val(valorMaximo.toFixed(2));

    }

}