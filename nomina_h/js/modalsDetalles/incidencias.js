$(document).ready(function () {
    agregarInasistencia();
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
// CONFIGURACION DEL HISTORIAL DEL INASISTENCIA
// ******************************************************


// ======================================================
// FUNCION PARA CREAR EL HISTORIAL DE INASISTENCIAS
// UTILIZA EL HORARIO OFICIAL DEL PROPIO EMPLEADO
// ======================================================

function crearHistorialInasistenciasHuasteca(empleado) {

    // validar que el empleado tenga horario oficial
    if (
        !empleado.horario_oficial ||
        empleado.horario_oficial.length === 0
    ) {

        return;

    }


    // validar que existan registros del empleado
    if (
        !empleado.registros ||
        empleado.registros.length === 0
    ) {

        return;

    }


    // crear el historial si no existe
    if (!empleado.historial_inasistencias) {

        empleado.historial_inasistencias = [];

    }


    // limpiar el historial para volver a calcularlo
    empleado.historial_inasistencias = [];


    // calcular el descuento de un día
    let descuento =
        parseFloat(empleado.salario_semanal) / 7;


    // recorrer el horario oficial del empleado
    empleado.horario_oficial.forEach(function (horario) {

        // validar que el día tenga una entrada programada
        if (
            !horario.entrada ||
            horario.entrada.trim() == ""
        ) {

            return;

        }


        // normalizar el nombre del día del horario
        let diaHorario = normalizarDia(horario.dia)



        // buscar el registro correspondiente a ese día
        let registroDia = empleado.registros.find(function (registro) {

            let diaRegistro = normalizarDia(registro.dia);

            return diaRegistro == diaHorario;

        });


        // validar si existe una entrada ese día
        let existeAsistencia = false;


        if (registroDia) {

            if (
                registroDia.entrada &&
                registroDia.entrada.trim() != ""
            ) {

                existeAsistencia = true;

            }

        }


        // si tenía horario pero no tiene entrada
        if (!existeAsistencia) {

            empleado.historial_inasistencias.push({

                dia: horario.dia,

                descuento_inasistencia:
                    parseFloat(descuento.toFixed(2))

            });

        }

    });


    // calcular el total de descuentos por inasistencias
    calcularDescuentoInasistencias(empleado);

}


// ======================================================
// FUNCION PARA CALCULAR EL TOTAL DE DESCUENTOS
// POR INASISTENCIAS
// ======================================================

function calcularDescuentoInasistencias(empleado) {

    // Reiniciar descuento
    empleado.inasistencia = 0;


    // Validar historial
    if (empleado.historial_inasistencias) {


        // Recorrer historial
        for (var i = 0; i < empleado.historial_inasistencias.length; i++) {


            empleado.inasistencia =
                empleado.inasistencia +
                empleado.historial_inasistencias[i].descuento_inasistencia;


        }


    }


    // Redondear descuento
    empleado.inasistencia = parseFloat(empleado.inasistencia.toFixed(2));


}


//==========================================================
// FUNCIÓN PARA HABILITAR LA EDICIÓN DEL HISTORIAL
// DE INASISTENCIAS
//==========================================================

function editarInasistencia(indice) {

    // Habilitar el campo de descuento
    $("#inputDescuentoInasistencia" + indice).prop("readonly", false);


    // Ocultar botón Editar
    $("#btnEditarInasistencia" + indice).attr("hidden", true);

    // Ocultar botón Eliminar
    $("#btnEliminarInasistencia" + indice).attr("hidden", true);

    // Mostrar botón Guardar
    $("#btnGuardarInasistencia" + indice).removeAttr("hidden");


    // Mostrar botón Cancelar
    $("#btnCancelarInasistencia" + indice).removeAttr("hidden");

}


//==========================================================
// FUNCIÓN PARA GUARDAR EL DESCUENTO EDITADO
// DEL HISTORIAL DE INASISTENCIAS
//==========================================================

function guardarInasistencia(indice) {

    // Obtener empleado seleccionado
    let empleado = objEmpleado.getEmpleado();

    // Obtener nuevo descuento
    let descuento = $("#inputDescuentoInasistencia" + indice).val();

    // Actualizar historial del empleado
    empleado.historial_inasistencias[indice].descuento_inasistencia =
        parseFloat(descuento);

    // Bloquear nuevamente el campo
    $("#inputDescuentoInasistencia" + indice).prop("readonly", true);

    // Mostrar botón Editar
    $("#btnEditarInasistencia" + indice).removeAttr("hidden");

    // Mostrar botón Eliminar
    $("#btnEliminarInasistencia" + indice).removeAttr("hidden");

    // Ocultar botón Guardar
    $("#btnGuardarInasistencia" + indice).attr("hidden", true);

    // Ocultar botón Cancelar
    $("#btnCancelarInasistencia" + indice).attr("hidden", true);

    // Actualizar total de descuentos
    calcularDescuentoInasistencias(empleado);

    // Actualizar input de ausentismos
    $("#inputAusentismos").val(empleado.inasistencia || '').trigger('change');

    // Actualizar la Tabla de la nomina
    llenarTablaNomina();

}

//==========================================================
// FUNCIÓN PARA AGREGAR UNA INASISTENCIA
//==========================================================

function agregarInasistencia() {

    $("#btnAgregarAusentismo").on("click", function () {

        // Obtener empleado seleccionado
        let empleado = objEmpleado.getEmpleado();

        // Obtener valores
        let dia = $("#selectDiaAusentismo").val();
        let cantidad = $("#inputCantidadAusentismo").val();


        // Validar día
        if (dia == "") {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Seleccione un día."
            );

            return;

        }

        if (cantidad == "") {
            cantidad = (empleado.salario_semanal / 7).toFixed(2);
        }



        // Crear historial si no existe
        if (!empleado.historial_inasistencias) {

            empleado.historial_inasistencias = [];

        }


        // Agregar inasistencia
        empleado.historial_inasistencias.push({

            dia: dia,

            descuento_inasistencia: parseFloat(cantidad)

        });


        // Recalcular descuentos
        calcularDescuentoInasistencias(empleado);


        // Actualizar input
        $("#inputAusentismos").val(empleado.inasistencia || '').trigger('change');


        // Refrescar historial
        establecerHistorialInasistencias(
            empleado.historial_inasistencias
        );


        // Limpiar controles
        $("#selectDiaAusentismo").val("");
        $("#inputCantidadAusentismo").val("");


        // Actualizar la Tabla de la nomina
        llenarTablaNomina();

    });

}


//==========================================================
// FUNCIÓN PARA CANCELAR LA EDICIÓN DEL HISTORIAL
// DE INASISTENCIAS
//==========================================================

function cancelarInasistencia(indice) {


    // Obtener empleado seleccionado
    let empleado = objEmpleado.getEmpleado();



    // Restaurar valor original
    $("#inputDescuentoInasistencia" + indice).val(

        empleado.historial_inasistencias[indice].descuento_inasistencia

    );



    // Bloquear nuevamente el campo
    $("#inputDescuentoInasistencia" + indice).prop("readonly", true);



    // Mostrar botón Editar
    $("#btnEditarInasistencia" + indice).removeAttr("hidden");



    // Mostrar botón Eliminar
    $("#btnEliminarInasistencia" + indice).removeAttr("hidden");



    // Ocultar botón Guardar
    $("#btnGuardarInasistencia" + indice).attr("hidden", true);



    // Ocultar botón Cancelar
    $("#btnCancelarInasistencia" + indice).attr("hidden", true);


}

//==========================================================
// FUNCIÓN PARA ELIMINAR UNA INASISTENCIA DEL HISTORIAL
//==========================================================

function eliminarInasistencia(indice) {

    // Obtener empleado seleccionado
    let empleado = objEmpleado.getEmpleado();


    // Eliminar registro del historial
    empleado.historial_inasistencias.splice(indice, 1);


    // Actualizar total de descuentos
    calcularDescuentoInasistencias(empleado);


    // Actualizar input de ausentismos
    $("#inputAusentismos").val(empleado.inasistencia || '').trigger('change');


    // Refrescar tabla
    establecerHistorialInasistencias(
        empleado.historial_inasistencias
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
            empleado?.salario_semanal ||
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



// ******************************************************
// CONFIGURACION DEL HISTORIAL DE RETARDOS
// ******************************************************

// ======================================================
// FUNCION PARA CREAR EL HISTORIAL DE RETARDOS
// UTILIZA EL HORARIO OFICIAL DEL PROPIO EMPLEADO
// ======================================================

function crearHistorialRetardosHuasteca(empleado) {

    // validar que el empleado tenga horario oficial
    if (
        !empleado.horario_oficial ||
        empleado.horario_oficial.length === 0
    ) {

        return;

    }


    // validar que el empleado tenga registros
    if (
        !empleado.registros ||
        empleado.registros.length === 0
    ) {

        return;

    }


    // crear el historial si no existe
    if (!empleado.historial_retardos) {

        empleado.historial_retardos = [];

    }


    // limpiar el historial para volver a calcularlo
    empleado.historial_retardos = [];


    // descuento por minuto establecido por defecto
    let descuentoPorMinuto = 25;


    // tolerancia establecida
    let tolerancia = 0;


    // recorrer el horario oficial del empleado
    empleado.horario_oficial.forEach(function (horario) {

        // validar que el día tenga horario de entrada
        if (
            !horario.entrada ||
            horario.entrada.trim() == ""
        ) {

            return;

        }


        // normalizar el nombre del día
        let diaHorario = normalizarDia(horario.dia);


        // obtener todos los registros correspondientes al día
        let registrosDia = empleado.registros.filter(function (registro) {

            if (!registro.dia) {

                return false;

            }

            let diaRegistro = normalizarDia(registro.dia);

            return diaRegistro == diaHorario;

        });


        // si no existen registros ese día, no se considera retardo
        if (registrosDia.length === 0) {

            return;

        }


        // buscar la primera entrada registrada del día
        let primeraEntrada = null;


        registrosDia.forEach(function (registro) {

            if (
                registro.entrada &&
                registro.entrada.trim() != ""
            ) {

                if (!primeraEntrada) {

                    primeraEntrada = registro;

                }

            }

        });


        // si no existe entrada, no se calcula retardo
        if (!primeraEntrada) {

            return;

        }


        // convertir la hora oficial a minutos
        let partesHorario = horario.entrada.split(":");

        let minutosHorario =
            (parseInt(partesHorario[0]) * 60) +
            parseInt(partesHorario[1]);


        // convertir la entrada del empleado a minutos
        let partesEntrada = primeraEntrada.entrada.split(":");

        let minutosEntrada =
            (parseInt(partesEntrada[0]) * 60) +
            parseInt(partesEntrada[1]);


        // calcular los minutos de diferencia
        let minutosRetardo =
            minutosEntrada - minutosHorario;


        // aplicar la tolerancia
        minutosRetardo =
            minutosRetardo - tolerancia;


        // si llegó a tiempo o antes, no existe retardo
        if (minutosRetardo <= 0) {

            return;

        }


        // calcular el total descontado
        let totalDescontado =
            minutosRetardo * descuentoPorMinuto;


        // agregar el retardo al historial
        empleado.historial_retardos.push({

            fecha: primeraEntrada.fecha,

            dia: horario.dia,

            minutos_retardo: minutosRetardo,

            tolerancia: tolerancia,

            descuento_por_minuto: descuentoPorMinuto,

            total_descontado: parseFloat(
                totalDescontado.toFixed(2)
            ),

        });

    });


    // calcular el total de descuentos por retardos
    calcularDescuentoRetardosHuasteca(empleado);

}


// ======================================================
// FUNCION PARA CALCULAR EL TOTAL DE DESCUENTOS
// POR RETARDOS
// ======================================================

function calcularDescuentoRetardosHuasteca(empleado) {

    // reiniciar descuento
    empleado.retardos = 0;


    // validar que exista historial
    if (
        !empleado.historial_retardos ||
        empleado.historial_retardos.length === 0
    ) {

        return;

    }


    // recorrer el historial de retardos
    for (let i = 0; i < empleado.historial_retardos.length; i++) {

        empleado.retardos +=
            parseFloat(
                empleado.historial_retardos[i].total_descontado
            ) || 0;

    }


    // redondear el total
    empleado.retardos =
        parseFloat(
            empleado.retardos.toFixed(2)
        );

}

//==========================================================
// FUNCIÓN PARA HABILITAR LA EDICIÓN DEL HISTORIAL
// DE RETARDOS
//==========================================================

function editarRetardo(indice) {

    // Habilitar campos
    $("#inputMinutosRetardoHistorial" + indice).prop("readonly", false);
    $("#inputToleranciaRetardoHistorial" + indice).prop("readonly", false);
    $("#inputCostoMinutoRetardoHistorial" + indice).prop("readonly", false);

    // Ocultar botones Editar y Eliminar
    $("#btnEditarRetardo" + indice).attr("hidden", true);
    $("#btnEliminarRetardo" + indice).attr("hidden", true);

    // Mostrar botones Guardar y Cancelar
    $("#btnGuardarRetardo" + indice).removeAttr("hidden");
    $("#btnCancelarRetardo" + indice).removeAttr("hidden");

    // Recalcular descuento mientras edita
    $("#inputMinutosRetardoHistorial" + indice +
        ", #inputToleranciaRetardoHistorial" + indice +
        ", #inputCostoMinutoRetardoHistorial" + indice)
        .off("input")
        .on("input", function () {

            let minutos = parseFloat($("#inputMinutosRetardoHistorial" + indice).val()) || 0;
            let tolerancia = parseFloat($("#inputToleranciaRetardoHistorial" + indice).val()) || 0;
            let costo = parseFloat($("#inputCostoMinutoRetardoHistorial" + indice).val()) || 0;

            let minutosEfectivos = Math.max(0, minutos - tolerancia);
            let descuento = minutosEfectivos * costo;

            $("#inputDescuentoRetardoHistorial" + indice)
                .val(descuento.toFixed(2));

        });

}

//==========================================================
// FUNCIÓN PARA GUARDAR EL RETARDO EDITADO
//==========================================================

function guardarRetardo(indice) {

    let empleado = objEmpleado.getEmpleado();

    // Obtener valores editados
    let minutos = parseFloat($("#inputMinutosRetardoHistorial" + indice).val()) || 0;
    let tolerancia = parseFloat($("#inputToleranciaRetardoHistorial" + indice).val()) || 0;
    let costo = parseFloat($("#inputCostoMinutoRetardoHistorial" + indice).val()) || 0;

    let minutosEfectivos = Math.max(0, minutos - tolerancia);
    let descuento = minutosEfectivos * costo;

    empleado.historial_retardos[indice].minutos_retardo = minutos;
    empleado.historial_retardos[indice].tolerancia = tolerancia;
    empleado.historial_retardos[indice].descuento_por_minuto = costo;
    empleado.historial_retardos[indice].total_descontado = parseFloat(descuento.toFixed(2));

    // Bloquear campos
    $("#inputMinutosRetardoHistorial" + indice).prop("readonly", true);
    $("#inputToleranciaRetardoHistorial" + indice).prop("readonly", true);
    $("#inputCostoMinutoRetardoHistorial" + indice).prop("readonly", true);

    // Mostrar botones Editar y Eliminar
    $("#btnEditarRetardo" + indice).removeAttr("hidden");
    $("#btnEliminarRetardo" + indice).removeAttr("hidden");

    // Ocultar botones Guardar y Cancelar
    $("#btnGuardarRetardo" + indice).attr("hidden", true);
    $("#btnCancelarRetardo" + indice).attr("hidden", true);

    // Actualizar descuento mostrado
    $("#inputDescuentoRetardoHistorial" + indice)
        .val(descuento.toFixed(2));

    // Recalcular total de retardos
    calcularDescuentoRetardosHuasteca(empleado);

    $("#inputRetardos").val(empleado.retardos || '').trigger('change');

    // Actualizar la Tabla de la nomina

    llenarTablaNomina();


}

//==========================================================
// FUNCIÓN PARA CANCELAR LA EDICIÓN
// DEL HISTORIAL DE RETARDOS
//==========================================================

function cancelarRetardo(indice) {

    let empleado = objEmpleado.getEmpleado();

    let retardo = empleado.historial_retardos[indice];

    let minRetardo = retardo.minutos_retardo !== undefined ? retardo.minutos_retardo : (retardo.minutos || 0);
    let tol = retardo.tolerancia !== undefined ? retardo.tolerancia : 0;
    let costoMin = retardo.descuento_por_minuto !== undefined ? retardo.descuento_por_minuto : (retardo.costo_por_minuto || 0);
    let totalDesc = retardo.total_descontado !== undefined ? retardo.total_descontado : (retardo.descuento_retardo || 0);

    $("#inputMinutosRetardoHistorial" + indice).val(minRetardo);
    $("#inputToleranciaRetardoHistorial" + indice).val(tol);
    $("#inputCostoMinutoRetardoHistorial" + indice).val(costoMin);
    $("#inputDescuentoRetardoHistorial" + indice).val(totalDesc);

    // Bloquear campos
    $("#inputMinutosRetardoHistorial" + indice).prop("readonly", true);
    $("#inputToleranciaRetardoHistorial" + indice).prop("readonly", true);
    $("#inputCostoMinutoRetardoHistorial" + indice).prop("readonly", true);

    // Mostrar botones Editar y Eliminar
    $("#btnEditarRetardo" + indice).removeAttr("hidden");
    $("#btnEliminarRetardo" + indice).removeAttr("hidden");

    // Ocultar botones Guardar y Cancelar
    $("#btnGuardarRetardo" + indice).attr("hidden", true);
    $("#btnCancelarRetardo" + indice).attr("hidden", true);

}

//==========================================================
// FUNCIÓN PARA ELIMINAR UN RETARDO
//==========================================================

function eliminarRetardo(indice) {

    let empleado = objEmpleado.getEmpleado();

    // Eliminar del historial
    empleado.historial_retardos.splice(indice, 1);

    // Recalcular total de retardos
    calcularDescuentoRetardosHuasteca(empleado);

    $("#inputRetardos").val(empleado.retardos || '').trigger('change');

    // Refrescar historial
    if (typeof establecerHistorialRetardos === "function") {
        establecerHistorialRetardos(empleado.historial_retardos);
    }

    // Actualizar la Tabla de la nomina

    llenarTablaNomina();


}
