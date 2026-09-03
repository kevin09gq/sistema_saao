$(document).ready(function () {
    agregarInasistencia();
    agregarPermiso();
    agregarUniforme();
    calcularDescuentoPermisoTiempoReal();
    calcularDescuentoInasistenciaTiempoReal();
    calcularDescuentoInasistenciaHistorialTiempoReal();
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
// SIEMPRE Y CUANDO EL EMPLEADO TENGA SUELDO BASE
// ======================================================


function crearHistorialInasistencias(empleado) {

    // Validar empleado
    if (!empleado) {
        return;
    }

    // Obtener horarios semanales
    let horarios_semanales = jsonNomina40lbs.horarios_semanales;

    // Validar horarios
    if (!horarios_semanales || horarios_semanales.length == 0) {
        return;
    }

    // Crear historial si no existe
    if (!empleado.historial_inasistencias) {
        empleado.historial_inasistencias = [];
    }

    // ==================================================
    // SUELDO BASE
    // ==================================================

    if (empleado.sueldo_base == true) {

        // Calcular descuento diario
        let descuento = parseFloat(empleado.sueldo_neto) / 7;

        // Recorrer horarios
        for (let i = 0; i < horarios_semanales.length; i++) {

            let horario = horarios_semanales[i];

            // Validar que sea un día laboral
            if (horario.entrada == "" || horario.salida == "") {
                continue;
            }

            let existeAsistencia = false;

            // Buscar registros del empleado
            if (empleado.registros) {

                for (let j = 0; j < empleado.registros.length; j++) {

                    let registro = empleado.registros[j];

                    if (
                        registro.dia &&
                        registro.dia.toLowerCase() ==
                        horario.dia.toLowerCase()
                    ) {

                        // Si tiene entrada o salida, tiene marcaje
                        if (
                            registro.entrada != "" ||
                            registro.salida != ""
                        ) {

                            existeAsistencia = true;
                            break;

                        }

                    }

                }

            }

            // ==================================================
            // SI NO ASISTIO
            // ==================================================

            if (existeAsistencia == false) {

                // Verificar si ya existe la inasistencia
                let existeHistorial = false;

                for (
                    let k = 0;
                    k < empleado.historial_inasistencias.length;
                    k++
                ) {

                    if (
                        empleado.historial_inasistencias[k].dia &&
                        empleado.historial_inasistencias[k].dia.toLowerCase() ==
                        horario.dia.toLowerCase()
                    ) {

                        existeHistorial = true;
                        break;

                    }

                }

                // Si no existe, agregar
                if (existeHistorial == false) {

                    empleado.historial_inasistencias.push({

                        dia: horario.dia,

                        descuento_inasistencia:
                            parseFloat(descuento.toFixed(2))

                    });

                }

            }

        }

    }

    // ==================================================
    // SUELDO NO BASE
    // ==================================================

    else {

        // Obtener costo por minuto
        let costoPorMinuto =
            parseFloat(jsonNomina40lbs.costo_por_minuto) || 0;

        // Recorrer horarios semanales
        for (let i = 0; i < horarios_semanales.length; i++) {

            let horario = horarios_semanales[i];

            // Validar que sea un día laboral
            if (horario.entrada == "" || horario.salida == "") {
                continue;
            }

            let existeMarcaje = false;

            // ==============================================
            // BUSCAR SI EL EMPLEADO TIENE MARCAJE ESE DIA
            // ==============================================

            if (empleado.registros) {

                for (let j = 0; j < empleado.registros.length; j++) {

                    let registro = empleado.registros[j];

                    if (
                        registro.dia &&
                        registro.dia.toLowerCase() ==
                        horario.dia.toLowerCase()
                    ) {

                        // Si tiene entrada o salida,
                        // significa que asistió
                        if (
                            registro.entrada != "" ||
                            registro.salida != ""
                        ) {

                            existeMarcaje = true;
                            break;

                        }

                    }

                }

            }

            // ==============================================
            // SI NO TIENE MARCAJE, ES AUSENTISMO
            // ==============================================

            if (existeMarcaje == false) {

                // Verificar si ya existe en historial
                let existeHistorial = false;

                for (
                    let k = 0;
                    k < empleado.historial_inasistencias.length;
                    k++
                ) {

                    if (
                        empleado.historial_inasistencias[k].dia &&
                        empleado.historial_inasistencias[k].dia.toLowerCase() ==
                        horario.dia.toLowerCase()
                    ) {

                        existeHistorial = true;
                        break;

                    }

                }

                // ==========================================
                // SI NO EXISTE, CREAR INASISTENCIA
                // ==========================================

                if (existeHistorial == false) {

                    let minutos =
                        parseInt(horario.minutos) || 0;

                    let descuento =
                        minutos * costoPorMinuto;

                    empleado.historial_inasistencias.push({

                        dia: horario.dia,

                        minutos: minutos,

                        costo_por_minuto: costoPorMinuto,

                        descuento_inasistencia:
                            parseFloat(descuento.toFixed(2))

                    });

                }

            }

        }

    }

    // Recalcular total
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

    // Habilitar el campo de minutos
    $("#inputMinutosInasistencia" + indice).prop("readonly", false);

    // Habilitar el campo de costo por minuto
    $("#inputCostoMinutoInasistencia" + indice).prop("readonly", false);

    // Deshabilitar el campo de descuento (se calculará automáticamente)
    $("#inputDescuentoInasistencia" + indice).prop("readonly", true);


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

    // Obtener nuevos valores
    let minutos = $("#inputMinutosInasistencia" + indice).val();
    let costoPorMinuto = $("#inputCostoMinutoInasistencia" + indice).val();
    let descuento = $("#inputDescuentoInasistencia" + indice).val();

    // Si hay minutos y costo, recalcular el descuento para asegurar consistencia
    if (minutos !== "" && costoPorMinuto !== "") {
        let minVal = parseFloat(minutos) || 0;
        let costoVal = parseFloat(costoPorMinuto) || 0;
        descuento = (minVal * costoVal).toFixed(2);
        $("#inputDescuentoInasistencia" + indice).val(descuento);
    }

    // Actualizar historial del empleado
    empleado.historial_inasistencias[indice].minutos = minutos ? parseInt(minutos) : '';
    empleado.historial_inasistencias[indice].costo_por_minuto = costoPorMinuto ? parseFloat(costoPorMinuto) : '';
    empleado.historial_inasistencias[indice].descuento_inasistencia =
        parseFloat(descuento);

    // Bloquear nuevamente los campos
    $("#inputMinutosInasistencia" + indice).prop("readonly", true);
    $("#inputCostoMinutoInasistencia" + indice).prop("readonly", true);
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
        let minutos = $("#inputMinutosAusentismo").val();
        let costoPorMinuto = $("#inputCostoMinutoAusentismo").val();
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


        // Si se ingresó minutos, validar y calcular
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
            cantidad = (parseInt(minutos) * parseFloat(costoPorMinuto)).toFixed(2);
        } else {
            // Si es sueldo base y no capturó minutos,
            // calcular automáticamente el descuento diario
            if (empleado.sueldo_base == true) {
                cantidad = (empleado.sueldo_neto / 7).toFixed(2);
            }
        }


        // Validar cantidad
        if (cantidad == "" || parseFloat(cantidad) <= 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Ingrese minutos y costo por minuto válidos."
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

            minutos: minutos !== "" ? parseInt(minutos) : '',

            costo_por_minuto: costoPorMinuto !== "" ? parseFloat(costoPorMinuto) : '',

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
        $("#inputMinutosAusentismo").val("");
        $("#inputCostoMinutoAusentismo").val(jsonNomina40lbs.costo_por_minuto || 0);
        if (empleado.sueldo_base == true) {
            $("#inputCantidadAusentismo").val((empleado.sueldo_neto / 7).toFixed(2));
        } else {
            $("#inputCantidadAusentismo").val("");
        }


        // Actualizar la Tabla de la nomina
        llenarTablaNomina();

    });

}

//==========================================================
// FUNCIÓN PARA CALCULAR EL DESCUENTO DE LA INASISTENCIA
// EN TIEMPO REAL
//==========================================================
function calcularDescuentoInasistenciaTiempoReal() {

    $(document).on("keyup input change", "#inputMinutosAusentismo, #inputCostoMinutoAusentismo", function () {

        let empleado = objEmpleado.getEmpleado();
        let minutos = $("#inputMinutosAusentismo").val();
        let costo = parseFloat($("#inputCostoMinutoAusentismo").val()) || 0;

        if (minutos === "" && empleado && empleado.sueldo_base == true) {
            let descuento = empleado.sueldo_neto / 7;
            $("#inputCantidadAusentismo").val(descuento.toFixed(2));
        } else {
            let minVal = parseFloat(minutos) || 0;
            let descuento = minVal * costo;
            $("#inputCantidadAusentismo").val(descuento.toFixed(2));
        }

    });

}

//==========================================================
// FUNCIÓN PARA CALCULAR EL DESCUENTO DE LA INASISTENCIA
// EN TIEMPO REAL EN EL HISTORIAL
//==========================================================
function calcularDescuentoInasistenciaHistorialTiempoReal() {

    $(document).on("keyup input change", "[id^='inputMinutosInasistencia'], [id^='inputCostoMinutoInasistencia']", function () {

        // Obtener el índice del input actual
        let currentId = $(this).attr('id');
        let indice = currentId.replace('inputMinutosInasistencia', '').replace('inputCostoMinutoInasistencia', '');

        let minutos = $("#inputMinutosInasistencia" + indice).val();
        let costo = parseFloat($("#inputCostoMinutoInasistencia" + indice).val()) || 0;

        if (minutos !== "" && costo > 0) {
            let minVal = parseFloat(minutos) || 0;
            let descuento = minVal * costo;
            $("#inputDescuentoInasistencia" + indice).val(descuento.toFixed(2));
        }

    });

}

//==========================================================
// FUNCIÓN PARA CANCELAR LA EDICIÓN DEL HISTORIAL
// DE INASISTENCIAS
//==========================================================

function cancelarInasistencia(indice) {


    // Obtener empleado seleccionado
    let empleado = objEmpleado.getEmpleado();



    // Restaurar valores originales
    $("#inputMinutosInasistencia" + indice).val(
        empleado.historial_inasistencias[indice].minutos || ''
    );

    $("#inputCostoMinutoInasistencia" + indice).val(
        empleado.historial_inasistencias[indice].costo_por_minuto || ''
    );

    $("#inputDescuentoInasistencia" + indice).val(

        empleado.historial_inasistencias[indice].descuento_inasistencia

    );



    // Bloquear nuevamente los campos
    $("#inputMinutosInasistencia" + indice).prop("readonly", true);
    $("#inputCostoMinutoInasistencia" + indice).prop("readonly", true);
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
        } else {
            // Si es sueldo base y no capturó minutos,
            // calcular automáticamente el descuento diario
            if (empleado.sueldo_base == true) {
                descuento = empleado.sueldo_neto / 7;
            }
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
        $("#inputCostoMinutoPermiso").val(jsonNomina40lbs.costo_por_minuto || 0);
        if (empleado.sueldo_base == true) {
            $("#inputDescuentoPermiso").val((empleado.sueldo_neto / 7).toFixed(2));
        } else {
            $("#inputDescuentoPermiso").val("");
        }

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

