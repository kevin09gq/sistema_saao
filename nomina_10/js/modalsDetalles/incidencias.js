$(document).ready(function () {
    calcularCostoMinutoPermisoPorHorasTrabajadas();
    calcularDescuentoPermisoTiempoReal();
    agregarPermiso();
    agregarUniforme();

});


// ******************************************************
// CONFIGURACION DEL HISTORIAL DEL BIOMETRICO
// ******************************************************


// ======================================================
// FUNCION PARA CREAR EL HISTORIAL DE OLVIDOS DE CHECADOR
// ======================================================

function crearHistorialOlvidosChecador(empleado) {

    // Reiniciar historial
    empleado.historial_olvidos = [];

    // Validar que tenga registros
    if (empleado.registros) {

        // Recorrer los registros
        for (var i = 0; i < empleado.registros.length; i++) {

            var registro = empleado.registros[i];

            // Si tiene algun marcaje
            if (registro.entrada != "" || registro.salida != "") {

                // Si falta entrada o salida
                if (registro.entrada == "" || registro.salida == "") {

                    empleado.historial_olvidos.push({

                        fecha: registro.fecha,

                        dia: registro.dia,

                        descuento_olvido: 20,

                        editado: false

                    });

                }

            }

        }

        calcularDescuentoOlvidosChecador(empleado);

    }

}

// ======================================================
// FUNCION PARA CALCULAR EL TOTAL DE DESCUENTOS
// POR OLVIDOS DE CHECADOR 
// ======================================================

function calcularDescuentoOlvidosChecador(empleado) {

    // Reiniciar descuento
    empleado.checador = 0;

    // Validar historial
    if (empleado.historial_olvidos) {

        // Recorrer historial
        for (var i = 0; i < empleado.historial_olvidos.length; i++) {

            empleado.checador =
                empleado.checador +
                empleado.historial_olvidos[i].descuento_olvido;

        }

    }

}

//==========================================================
// FUNCIÓN PARA HABILITAR LA EDICIÓN DEL HISTORIAL
// DE OLVIDOS DE BIOMÉTRICO
//==========================================================

function editarOlvidoBiometrico(indice) {

    // Habilitar el campo de descuento
    $("#inputDescuentoOlvido" + indice).prop("readonly", false);

    // Ocultar botón Editar
    $("#btnEditarOlvido" + indice).attr("hidden", true);

    // Ocultar botón Eliminar
    $("#btnEliminarOlvido" + indice).attr("hidden", true);

    // Mostrar botón Guardar
    $("#btnGuardarOlvido" + indice).removeAttr("hidden");

    // Mostrar botón Cancelar
    $("#btnCancelarOlvido" + indice).removeAttr("hidden");

}

//==========================================================
// FUNCIÓN PARA GUARDAR EL DESCUENTO EDITADO
// DEL HISTORIAL DE OLVIDOS
//==========================================================

function guardarOlvidoBiometrico(indice) {

    // Obtener el empleado seleccionado
    let empleado = objEmpleado.getEmpleado();

    // Obtener el nuevo descuento
    let descuento = $("#inputDescuentoOlvido" + indice).val();

    // Actualizar el historial del empleado
    empleado.historial_olvidos[indice].descuento_olvido = parseFloat(descuento);

    // Marcar el registro como editado
    empleado.historial_olvidos[indice].editado = true;

    // Bloquear nuevamente el campo
    $("#inputDescuentoOlvido" + indice).prop("readonly", true);

    // Mostrar botón Editar
    $("#btnEditarOlvido" + indice).removeAttr("hidden");

    // Mostrar botón Eliminar
    $("#btnEliminarOlvido" + indice).removeAttr("hidden");

    // Ocultar botón Guardar
    $("#btnGuardarOlvido" + indice).attr("hidden", true);

    // Ocultar botón Cancelar
    $("#btnCancelarOlvido" + indice).attr("hidden", true);

    // Actualizar el total de descuentos
    calcularDescuentoOlvidosChecador(empleado);

    // Actualizar inputBiometrico
    $("#inputBiometrico").val(empleado.checador || '').trigger('change');

    // Actualizar la Tabla de la nomina
    llenarTablaNomina();
}

//==========================================================
// FUNCIÓN PARA CANCELAR LA EDICIÓN DEL HISTORIAL
// DE OLVIDOS DE BIOMÉTRICO
//==========================================================

function cancelarOlvidoBiometrico(indice) {

    // Obtener el empleado seleccionado
    let empleado = objEmpleado.getEmpleado();

    // Restaurar el valor original
    $("#inputDescuentoOlvido" + indice).val(
        empleado.historial_olvidos[indice].descuento_olvido
    );

    // Bloquear nuevamente el campo
    $("#inputDescuentoOlvido" + indice).prop("readonly", true);

    // Mostrar botón Editar
    $("#btnEditarOlvido" + indice).removeAttr("hidden");

    // Mostrar botón Eliminar
    $("#btnEliminarOlvido" + indice).removeAttr("hidden");

    // Ocultar botón Guardar
    $("#btnGuardarOlvido" + indice).attr("hidden", true);

    // Ocultar botón Cancelar
    $("#btnCancelarOlvido" + indice).attr("hidden", true);

}

//==========================================================
// FUNCIÓN PARA ELIMINAR UN OLVIDO DE BIOMÉTRICO
//==========================================================

function eliminarOlvidoBiometrico(indice) {

    // Obtener empleado seleccionado
    let empleado = objEmpleado.getEmpleado();

    // Eliminar registro del historial
    empleado.historial_olvidos.splice(indice, 1);

    // Actualizar total de descuentos
    calcularDescuentoOlvidosChecador(empleado);

    // Actualizar inputBiometrico
    $("#inputBiometrico").val(empleado.checador || '').trigger('change');

    // Refrescar tabla
    establecerHistorialOlvidosBiometrico(
        empleado.historial_olvidos
    );

    // Actualizar la Tabla de la nomina
    llenarTablaNomina();
}




// ******************************************************
// CONFIGURACION DEL HISTORIAL DEL PERMISO
// ******************************************************

//==========================================================
// FUNCIÓN PARA AGREGAR UN PERMISO
//==========================================================

function agregarPermiso() {

    $("#btnAgregarPermiso").on("click", function () {

        // Obtener empleado seleccionado
        let empleado = objEmpleado.getEmpleado();

        // Obtener valores
        let dia = $("#selectDiaPermiso").val();
        let minutos = $("#inputMinutosPermiso").val();
        let costoPorMinuto = $("#inputCostoMinutoPermiso").val();
        let descuento = "";

        // Validar día
        if (dia == "") {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Seleccione un día."
            );

            return;

        }

        // Si se ingresó una cantidad de minutos (independientemente de si el costo está pre-llenado), calculamos el descuento por minutos.
        // Si no se ingresaron minutos, y el empleado tiene sueldo base, usamos el descuento diario por defecto.
        if (minutos !== "") {
            if (parseInt(minutos) <= 0) {
                mostrarAlerta(
                    "warning",
                    "Advertencia",
                    "Ingrese una cantidad de minutos válida o deje el campo de minutos vacío para usar el descuento por defecto."
                );
                return;
            }
            if (costoPorMinuto == "" || parseFloat(costoPorMinuto) <= 0) {
                mostrarAlerta(
                    "warning",
                    "Advertencia",
                    "Ingrese un costo por minuto válido."
                );
                return;
            }
            descuento = parseInt(minutos) * parseFloat(costoPorMinuto);
        }

        // Validar descuento final
        if (descuento === "" || parseFloat(descuento) <= 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Ingrese una cantidad de minutos válida."
            );

            return;

        }

        // Crear historial si no existe
        if (!empleado.historial_permisos) {

            empleado.historial_permisos = [];

        }

        // Agregar permiso
        empleado.historial_permisos.push({

            dia: dia,

            minutos_permiso: minutos !== "" ? parseInt(minutos) : 0,

            costo_por_minuto: minutos !== "" ? parseFloat(costoPorMinuto) : 0,

            descuento_permiso: parseFloat(parseFloat(descuento).toFixed(2))

        });

        // Limpiar controles
        $("#selectDiaPermiso").val("");
        $("#inputMinutosPermiso").val("");
        $("#inputCostoMinutoPermiso").val("");
        $("#inputDescuentoPermiso").val("");
        $("#inputHrsTrabajadas").val("");

        establecerHistorialPermisos(empleado.historial_permisos);

        calcularDescuentoPermisos(empleado);

        // Actualizar input de permisos
        $("#inputPermisos").val(empleado.permiso || '').trigger('change');

        // Actualizar la Tabla de la nomina
        llenarTablaNomina();

    });


}

//==========================================================
// FUNCIÓN PARA CALCULAR EL DESCUENTO DEL PERMISO
// EN TIEMPO REAL
//==========================================================

function calcularDescuentoPermisoTiempoReal() {

    $(document).on("keyup input change", "#inputMinutosPermiso, #inputCostoMinutoPermiso", function () {

        let empleado = objEmpleado.getEmpleado();
        let minutos = $("#inputMinutosPermiso").val();
        let costo = parseFloat($("#inputCostoMinutoPermiso").val()) || 0;

        if (minutos === "" && empleado && empleado.sueldo_base == true) {
            let descuento = empleado.sueldo_neto / 7;
            $("#inputDescuentoPermiso").val(descuento.toFixed(2));
        } else {
            let minVal = parseFloat(minutos) || 0;
            let descuento = minVal * costo;
            $("#inputDescuentoPermiso").val(descuento.toFixed(2));
        }

    });

}

//==========================================================
// FUNCIÓN PARA CALCULAR EL COSTO POR MINUTO EN PERMISOS
// EN BASE A LAS HORAS TRABAJADAS POR DÍA
//==========================================================

function calcularCostoMinutoPermisoPorHorasTrabajadas() {

    $(document).on("keyup input change", "#inputHrsTrabajadas", function () {

        let empleado = objEmpleado.getEmpleado();

        let salarioSemanal = parseFloat(
            empleado?.sueldo_neto ||
            $("#inputSalarioSemanal").val()
        ) || 0;

        let horasDia = parseFloat($(this).val()) || 0;

        if (horasDia > 0 && salarioSemanal > 0) {
            let costoPorMinuto = salarioSemanal / 7 / 60 / horasDia;
            let costoTruncado = (Math.floor(costoPorMinuto * 100) / 100).toFixed(2);
            $("#inputCostoMinutoPermiso").val(costoTruncado).trigger("input");
        } else {
            $("#inputCostoMinutoPermiso").val("").trigger("input");
        }

    });

}


// ======================================================
// FUNCION PARA CALCULAR EL TOTAL DE DESCUENTOS
// POR PERMISOS
// ======================================================

function calcularDescuentoPermisos(empleado) {

    // Reiniciar descuento
    empleado.permiso = 0;

    // Validar historial
    if (empleado.historial_permisos) {

        // Recorrer historial
        for (var i = 0; i < empleado.historial_permisos.length; i++) {

            empleado.permiso =
                empleado.permiso +
                empleado.historial_permisos[i].descuento_permiso;

        }

    }

    // Redondear total
    empleado.permiso = parseFloat(empleado.permiso.toFixed(2));

}


//==========================================================
// FUNCIÓN PARA ELIMINAR UN PERMISO
//==========================================================

function eliminarPermiso(indice) {

    let empleado = objEmpleado.getEmpleado();

    empleado.historial_permisos.splice(indice, 1);


    // Recalcular total
    calcularDescuentoPermisos(empleado);

    $("#inputPermisos").val(empleado.permiso || '').trigger('change');


    // Refrescar historial
    establecerHistorialPermisos(
        empleado.historial_permisos
    );

    // Actualizar la Tabla de la nomina
    llenarTablaNomina();

}


// ******************************************************
// CONFIGURACION DEL HISTORIAL DE UNIFORMES
// ******************************************************


//==========================================================
// FUNCIÓN PARA AGREGAR UNIFORME
//==========================================================

function agregarUniforme() {

    $("#btnAgregarUniforme").on("click", function () {


        // Obtener empleado seleccionado
        let empleado = objEmpleado.getEmpleado();


        // Obtener valores
        let folio = $("#inputFolioUniforme").val().trim();

        let cantidad = $("#inputCantidadUniforme").val();



        // Validar folio
        if (folio == "") {


            mostrarAlerta(
                "warning",
                "Advertencia",
                "Ingrese un folio."
            );

            return;

        }



        // Validar cantidad
        if (cantidad == "" || parseFloat(cantidad) <= 0) {


            mostrarAlerta(
                "warning",
                "Advertencia",
                "Ingrese una cantidad válida."
            );

            return;

        }



        // Crear historial si no existe
        if (!empleado.historial_uniforme) {


            empleado.historial_uniforme = [];


        }



        // Agregar uniforme al historial
        empleado.historial_uniforme.push({


            folio: folio,


            cantidad: parseFloat(parseFloat(cantidad).toFixed(2))


        });



        // Limpiar controles
        $("#inputFolioUniforme").val("");

        $("#inputCantidadUniforme").val("");



        // Actualizar historial visual
        establecerHistorialUniformes(
            empleado.historial_uniforme
        );

        // Calcular total uniforme
        calcularDescuentoUniformes(empleado);

        // Actualizar input de uniforme
        $("#inputUniformes").val(empleado.uniformes || '').trigger('change');

        // Actualizar la Tabla de la nomina
        llenarTablaNomina();
    });


}

//==========================================================
// FUNCION PARA CALCULAR EL TOTAL DE DESCUENTOS
// POR UNIFORMES
//==========================================================

function calcularDescuentoUniformes(empleado) {

    // Reiniciar total
    empleado.uniformes = 0;

    // Validar historial
    if (empleado.historial_uniforme) {


        for (var i = 0; i < empleado.historial_uniforme.length; i++) {


            empleado.uniformes =
                empleado.uniformes +
                empleado.historial_uniforme[i].cantidad;


        }


    }



    // Redondear total
    empleado.uniformes =
        parseFloat(empleado.uniformes.toFixed(2));


}

//==========================================================
// FUNCIÓN PARA HABILITAR LA EDICIÓN DEL HISTORIAL
// DE UNIFORMES
//==========================================================

function editarUniforme(indice) {


    // Habilitar campo
    $("#inputCantidadUniformeHistorial" + indice)
        .prop("readonly", false);



    // Ocultar botones
    $("#btnEditarUniforme" + indice)
        .attr("hidden", true);


    $("#btnEliminarUniforme" + indice)
        .attr("hidden", true);



    // Mostrar botones
    $("#btnGuardarUniforme" + indice)
        .removeAttr("hidden");


    $("#btnCancelarUniforme" + indice)
        .removeAttr("hidden");



}

//==========================================================
// FUNCIÓN PARA GUARDAR EL UNIFORME EDITADO
//==========================================================

function guardarUniforme(indice) {


    let empleado = objEmpleado.getEmpleado();



    // Obtener cantidad editada
    let cantidad =
        parseFloat(
            $("#inputCantidadUniformeHistorial" + indice).val()
        );



    // Validar cantidad
    if (isNaN(cantidad) || cantidad <= 0) {


        mostrarAlerta(
            "warning",
            "Advertencia",
            "Ingrese una cantidad válida."
        );


        return;


    }



    // Actualizar historial
    empleado.historial_uniforme[indice].cantidad =
        parseFloat(cantidad.toFixed(2));



    // Bloquear campo
    $("#inputCantidadUniformeHistorial" + indice)
        .prop("readonly", true);



    // Mostrar botones
    $("#btnEditarUniforme" + indice)
        .removeAttr("hidden");


    $("#btnEliminarUniforme" + indice)
        .removeAttr("hidden");



    // Ocultar botones
    $("#btnGuardarUniforme" + indice)
        .attr("hidden", true);


    $("#btnCancelarUniforme" + indice)
        .attr("hidden", true);



    // Recalcular total
    calcularDescuentoUniformes(empleado);

    // Actualizar input de uniforme
    $("#inputUniformes").val(empleado.uniformes || '').trigger('change');

    // Actualizar la Tabla de la nomina
    llenarTablaNomina();


}

//==========================================================
// FUNCIÓN PARA CANCELAR LA EDICIÓN
// DEL HISTORIAL DE UNIFORMES
//==========================================================

function cancelarUniforme(indice) {


    let empleado = objEmpleado.getEmpleado();



    let uniforme =
        empleado.historial_uniforme[indice];



    // Restaurar valor original
    $("#inputCantidadUniformeHistorial" + indice)
        .val(uniforme.cantidad);



    // Bloquear campo
    $("#inputCantidadUniformeHistorial" + indice)
        .prop("readonly", true);



    // Mostrar botones
    $("#btnEditarUniforme" + indice)
        .removeAttr("hidden");


    $("#btnEliminarUniforme" + indice)
        .removeAttr("hidden");



    // Ocultar botones
    $("#btnGuardarUniforme" + indice)
        .attr("hidden", true);


    $("#btnCancelarUniforme" + indice)
        .attr("hidden", true);



}

//==========================================================
// FUNCIÓN PARA ELIMINAR UN UNIFORME
//==========================================================

function eliminarUniforme(indice) {

    let empleado = objEmpleado.getEmpleado();


    // Eliminar del historial
    empleado.historial_uniforme.splice(indice, 1);



    // Recalcular total
    calcularDescuentoUniformes(empleado);



    // Actualizar historial visual
    establecerHistorialUniformes(
        empleado.historial_uniforme
    );

    // Actualizar input de uniforme
    $("#inputUniformes").val(empleado.uniformes || '').trigger('change');

    // Actualizar la Tabla de la nomina
    llenarTablaNomina();

}

