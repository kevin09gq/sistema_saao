$(document).ready(function () {
    $("#btn-agregar-caja-10lbs").on("click", function () {
        agregarCajasEmpacadas();
    });
});
/************************************
 * AGREGAR CAJAS EMPACADAS AL HISTORIAL DEL EMPLEADO
 ************************************/

function agregarCajasEmpacadas() {
    const empleado = objEmpleado.getEmpleado();
    if (!empleado) return;

    // Obtener valores de los campos
    const dia = $("#select-dia-caja-10lbs").val();
    const tipoCaja = $("#select-tipo-caja-10lbs").val();
    const precioUnit = parseFloat($("#select-tipo-caja-10lbs option:selected").attr("data-precio"));
    const cantidad = parseInt($("#input-cantidad-caja-10lbs").val());

    // Validaciones básicas
    if (!dia) {
        Swal.fire("Atención", "Por favor seleccione un día.", "warning");
        return;
    }
    if (!tipoCaja) {
        Swal.fire("Atención", "Por favor seleccione el tipo de caja.", "warning");
        return;
    }
    if (isNaN(cantidad) || cantidad <= 0) {
        Swal.fire("Atención", "Por favor ingrese una cantidad válida mayor a 0.", "warning");
        return;
    }

    // Calcular subtotal
    const subtotal = cantidad * precioUnit;

    // Inicializar historial si no existe
    if (!empleado.historial_empaque) {
        empleado.historial_empaque = [];
    }

    // Crear el objeto del registro
    const nuevoRegistro = {
        dia: dia,
        tipo: tipoCaja,
        precio_unitario: precioUnit,
        cantidad: cantidad,
        subtotal: subtotal
    };

    // Agregar al historial del empleado
    empleado.historial_empaque.push(nuevoRegistro);

    // Actualizar el sueldo_neto basado en el total del historial
    const totalSueldoNeto = empleado.historial_empaque.reduce((total, item) => total + (parseFloat(item.subtotal) || 0), 0);
    empleado.sueldo_neto = totalSueldoNeto;

    // Actualizar el campo en la interfaz (pestaña Modificar Detalles)
    $("#mod-sueldo-neto-10lbs").val(totalSueldoNeto.toFixed(2));

    // Limpiar campos del formulario
    $("#select-dia-caja-10lbs").val("");
    $("#select-tipo-caja-10lbs").val("");
    $("#input-cantidad-caja-10lbs").val("");

    // Actualizar la vista en el modal
    if (typeof mostrarHistorialEmpaque === "function") {
        mostrarHistorialEmpaque(empleado);
    }

    /* Recalcular el total a cobrar si existe la función
    if (typeof calcularSueldoACobrar === "function") {
        calcularSueldoACobrar();
    }*/
}

/************************************
 * ELIMINA LAS CAJAS EMPACADAS DEL HISTORIAL DEL EMPLEADO
 ************************************/

function eliminarEmpaque(index) {
    const empleado = objEmpleado.getEmpleado();
    if (!empleado || !empleado.historial_empaque) return;

    empleado.historial_empaque.splice(index, 1);

    // Actualizar el sueldo_neto basado en el total del historial después de eliminar
    const totalSueldoNeto = empleado.historial_empaque.reduce((total, item) => total + (parseFloat(item.subtotal) || 0), 0);
    empleado.sueldo_neto = totalSueldoNeto;

    // Actualizar el campo en la interfaz (pestaña Modificar Detalles) después de eliminar
    $("#mod-sueldo-neto-10lbs").val(totalSueldoNeto.toFixed(2));

    mostrarHistorialEmpaque(empleado);
}