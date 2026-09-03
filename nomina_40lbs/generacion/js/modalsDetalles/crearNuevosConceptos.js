$(document).ready(function () {
    agregarPercepcionExtra();
    agregarDeduccionExtra();
});

//==========================================================
// FUNCIÓN PARA AGREGAR UNA NUEVA PERCEPCIÓN EXTRA
// AL EMPLEADO SELECCIONADO
//==========================================================

function agregarPercepcionExtra() {

    $("#btnAgregarOtroConceptoPercepcion").on("click", function () {

        // Obtener el empleado actual del modal
        let empleado = objEmpleado.getEmpleado();

        // Validar que exista un empleado seleccionado
        if (!empleado) {


            mostrarAlerta(
                "warning",
                "Advertencia",
                "No hay un empleado seleccionado."
            );


            return;

        }


        // Crear el arreglo de percepciones extras si no existe
        if (!empleado.percepciones_extra) {


            empleado.percepciones_extra = [];


        }

        // Obtener nombre del concepto
        let nombre = $("#inputNombrePercepcionExtra").val();

        // Obtener cantidad del concepto
        let cantidad = $("#inputCantidadPercepcionExtra").val();


        // Validar nombre
        if (nombre.trim() == "") {


            mostrarAlerta(
                "warning",
                "Advertencia",
                "Ingrese el nombre del concepto."
            );


            return;


        }

        // Validar cantidad
        if (cantidad == "" || isNaN(cantidad)) {


            mostrarAlerta(
                "warning",
                "Advertencia",
                "Ingrese una cantidad válida."
            );


            return;


        }

        // Crear nuevo objeto de percepción
        let nuevaPercepcion = {

            nombre: nombre,

            cantidad: parseFloat(cantidad)


        };


        // Agregar percepción al empleado
        empleado.percepciones_extra.push(nuevaPercepcion);



        // Actualizar tabla del modal
        mostrarPercepcionesExtras(empleado.percepciones_extra);

        // Actualizar el total del sueldo extra
        calcularTotalSueldoExtra();

        // Actualizar el total a cobrar del empleado
        calcularTotalCobrar();

        // Limpiar campos
        $("#inputNombrePercepcionExtra").val("");

        $("#inputCantidadPercepcionExtra").val("");

        

    });

}

//==========================================================
// FUNCIÓN PARA ELIMINAR UNA PERCEPCIÓN EXTRA
// DEL EMPLEADO SELECCIONADO
//==========================================================

function eliminarPercepcionExtra(indice) {


    // Obtener empleado actual
    let empleado = objEmpleado.getEmpleado();



    // Validar empleado
    if (!empleado || !empleado.percepciones_extra) {


        return;


    }



    // Eliminar percepción seleccionada
    empleado.percepciones_extra.splice(indice, 1);



    // Actualizar tabla
    mostrarPercepcionesExtras(empleado.percepciones_extra);

    // Actualizar el total del sueldo extra
    calcularTotalSueldoExtra();

}

//==========================================================
// FUNCIÓN PARA AGREGAR UNA NUEVA DEDUCCIÓN EXTRA
// AL EMPLEADO SELECCIONADO
//==========================================================

function agregarDeduccionExtra() {

    $("#btnAgregarDeduccionExtra").on("click", function () {

        // Obtener el empleado actual del modal
        let empleado = objEmpleado.getEmpleado();

        // Validar que exista un empleado seleccionado
        if (!empleado) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "No hay un empleado seleccionado."
            );

            return;
        }

        // Crear el arreglo de deducciones extras si no existe
        if (!empleado.deducciones_extra) {

            empleado.deducciones_extra = [];

        }

        // Obtener nombre del concepto
        let nombre = $("#inputNombreDeduccionExtra").val();

        // Obtener cantidad del concepto
        let cantidad = $("#inputCantidadDeduccionExtra").val();

        // Validar nombre
        if (nombre.trim() == "") {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Ingrese el nombre del concepto."
            );

            return;
        }

        // Validar cantidad
        if (cantidad == "" || isNaN(cantidad)) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Ingrese una cantidad válida."
            );

            return;
        }

        // Crear nuevo objeto de deducción
        let nuevaDeduccion = {

            nombre: nombre,

            cantidad: parseFloat(cantidad)

        };

        // Agregar deducción al empleado
        empleado.deducciones_extra.push(nuevaDeduccion);

        // Actualizar tabla del modal
        mostrarDeduccionesExtras(empleado.deducciones_extra);

        // Actualizar el total de F.A/GAFET/COFIA
        calcularTotalFAGafetCofia();

        // Limpiar campos
        $("#inputNombreDeduccionExtra").val("");

        $("#inputCantidadDeduccionExtra").val("");


    });

}

//==========================================================
// FUNCIÓN PARA ELIMINAR UNA DEDUCCIÓN EXTRA
// DEL EMPLEADO SELECCIONADO
//==========================================================

function eliminarDeduccionExtra(indice) {

    // Obtener empleado actual
    let empleado = objEmpleado.getEmpleado();

    // Validar empleado
    if (!empleado || !empleado.deducciones_extra) {

        return;
    }

    // Eliminar deducción seleccionada
    empleado.deducciones_extra.splice(indice, 1);

    // Actualizar tabla
    mostrarDeduccionesExtras(empleado.deducciones_extra);

    // Actualizar el total de F.A/GAFET/COFIA
    calcularTotalFAGafetCofia();

}