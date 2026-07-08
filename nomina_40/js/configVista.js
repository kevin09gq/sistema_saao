
// FUNCION PARA OCULTAR EL CONTENEDOR DE DATOS PARA MOSTRAR LA TABLA DE NÓMINA

function cambiarVistaNomina40lbs() {
    // Agregar el atributo "hidden" al contenedor de datos para ocultarlo
    $("#contenedor-data").attr("hidden", true);
    // Quitar el atributo "hidden" del contenedor de la tabla de nómina para mostrarlo
    $("#tabla-nomina-responsive").removeAttr("hidden");

}