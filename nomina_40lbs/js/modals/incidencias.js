$(document).ready(function () {
    agregarInasistencia();
    agregarPermiso();
    agregarUniforme();
    calcularDescuentoPermisoTiempoReal();
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
// ======================================================

function crearHistorialInasistencias(empleado) {


    // Validar que aplique para sueldo base
    if (empleado.sueldo_base != true) {
        return;
    }


    // Obtener horarios semanales de la nómina
    let horarios_semanales = jsonNomina40lbs.horarios_semanales;


    // Validar si tiene historial de inasistencias si tiene que no se cree uno nuevo
    if (!empleado.historial_inasistencias) {
        empleado.historial_inasistencias = [];
    }



    // Calcular descuento diario
    let descuento = empleado.sueldo_neto / 7;



    // Recorrer horarios semanales
    horarios_semanales.forEach((horario) => {


        // Validar que ese día sea laboral
        if (horario.entrada != "" && horario.salida != "") {


            let existeAsistencia = false;



            // Buscar el día dentro de los registros del empleado
            empleado.registros.forEach((registro) => {


                if (registro.dia.toLowerCase() == horario.dia.toLowerCase()) {


                    // Si tiene entrada significa que asistió
                    if (registro.entrada != "") {

                        existeAsistencia = true;

                    }

                }


            });



            // Si tenía horario pero no tiene registro
            if (existeAsistencia == false) {


                empleado.historial_inasistencias.push({

                    dia: horario.dia,

                    descuento_inasistencia: parseFloat(descuento.toFixed(2))

                });


            }


        }


    });

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


        // Si es sueldo base y no capturó cantidad,
        // calcular automáticamente el descuento diario
        if (empleado.sueldo_base == true && cantidad == "") {

            cantidad = (empleado.sueldo_neto / 7).toFixed(2);

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

        // Validar día
        if (dia == "") {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Seleccione un día."
            );

            return;

        }

        // Validar minutos
        if (minutos == "" || parseInt(minutos) <= 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Ingrese una cantidad de minutos válida."
            );

            return;

        }

        // Validar costo por minuto
        if (costoPorMinuto == "" || parseFloat(costoPorMinuto) <= 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Ingrese un costo por minuto válido."
            );

            return;

        }

        // Calcular descuento
        let descuento = parseInt(minutos) * parseFloat(costoPorMinuto);

        // Crear historial si no existe
        if (!empleado.historial_permisos) {

            empleado.historial_permisos = [];

        }

        // Agregar permiso
        empleado.historial_permisos.push({

            dia: dia,

            minutos_permiso: parseInt(minutos),

            costo_por_minuto: parseFloat(costoPorMinuto),

            descuento_permiso: parseFloat(descuento.toFixed(2))

        });

        // Limpiar controles
        $("#selectDiaPermiso").val("");
        $("#inputMinutosPermiso").val("");
        $("#inputCostoMinutoPermiso").val("");
        $("#inputDescuentoPermiso").val("");

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

    $(document).on("keyup", "#inputMinutosPermiso, #inputCostoMinutoPermiso", function () {

        let minutos = parseFloat($("#inputMinutosPermiso").val()) || 0;

        let costo = parseFloat($("#inputCostoMinutoPermiso").val()) || 0;

        let descuento = minutos * costo;

        $("#inputDescuentoPermiso").val(descuento.toFixed(2));

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
// FUNCIÓN PARA HABILITAR LA EDICIÓN DEL HISTORIAL
// DE PERMISOS
//==========================================================

function editarPermiso(indice) {

    // Habilitar campos
    $("#inputMinutosPermisoHistorial" + indice).prop("readonly", false);
    $("#inputCostoMinutoPermisoHistorial" + indice).prop("readonly", false);

    // Ocultar botones
    $("#btnEditarPermiso" + indice).attr("hidden", true);
    $("#btnEliminarPermiso" + indice).attr("hidden", true);

    // Mostrar botones
    $("#btnGuardarPermiso" + indice).removeAttr("hidden");
    $("#btnCancelarPermiso" + indice).removeAttr("hidden");


    // Recalcular descuento mientras edita
    $("#inputMinutosPermisoHistorial" + indice +
        ", #inputCostoMinutoPermisoHistorial" + indice)
        .off("input")
        .on("input", function () {

            let minutos = parseFloat($("#inputMinutosPermisoHistorial" + indice).val()) || 0;

            let costo = parseFloat($("#inputCostoMinutoPermisoHistorial" + indice).val()) || 0;

            $("#inputDescuentoPermisoHistorial" + indice)
                .val((minutos * costo).toFixed(2));

        });

}

//==========================================================
// FUNCIÓN PARA GUARDAR EL PERMISO EDITADO
//==========================================================

function guardarPermiso(indice) {

    let empleado = objEmpleado.getEmpleado();

    // Obtener valores editados

    let minutos = parseFloat($("#inputMinutosPermisoHistorial" + indice).val());

    let costo = parseFloat($("#inputCostoMinutoPermisoHistorial" + indice).val());

    let descuento = minutos * costo;

    empleado.historial_permisos[indice].minutos_permiso = minutos;

    empleado.historial_permisos[indice].costo_por_minuto = costo;

    empleado.historial_permisos[indice].descuento_permiso = parseFloat(descuento.toFixed(2));


    // Bloquear campos
    $("#inputMinutosPermisoHistorial" + indice).prop("readonly", true);
    $("#inputCostoMinutoPermisoHistorial" + indice).prop("readonly", true);


    // Mostrar botones
    $("#btnEditarPermiso" + indice).removeAttr("hidden");
    $("#btnEliminarPermiso" + indice).removeAttr("hidden");


    // Ocultar botones
    $("#btnGuardarPermiso" + indice).attr("hidden", true);
    $("#btnCancelarPermiso" + indice).attr("hidden", true);


    // Actualizar descuento mostrado
    $("#inputDescuentoPermisoHistorial" + indice)
        .val(descuento.toFixed(2));


    // Recalcular total
    calcularDescuentoPermisos(empleado);

    $("#inputPermisos").val(empleado.permiso || '').trigger('change');

    // Actualizar la Tabla de la nomina
    llenarTablaNomina();
}

//==========================================================
// FUNCIÓN PARA CANCELAR LA EDICIÓN
// DEL HISTORIAL DE PERMISOS
//==========================================================

function cancelarPermiso(indice) {

    let empleado = objEmpleado.getEmpleado();

    let permiso = empleado.historial_permisos[indice];


    $("#inputMinutosPermisoHistorial" + indice)
        .val(permiso.minutos_permiso);

    $("#inputCostoMinutoPermisoHistorial" + indice)
        .val(permiso.costo_por_minuto);

    $("#inputDescuentoPermisoHistorial" + indice)
        .val(permiso.descuento_permiso);


    $("#inputMinutosPermisoHistorial" + indice).prop("readonly", true);

    $("#inputCostoMinutoPermisoHistorial" + indice).prop("readonly", true);


    $("#btnEditarPermiso" + indice).removeAttr("hidden");
    $("#btnEliminarPermiso" + indice).removeAttr("hidden");

    $("#btnGuardarPermiso" + indice).attr("hidden", true);
    $("#btnCancelarPermiso" + indice).attr("hidden", true);

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