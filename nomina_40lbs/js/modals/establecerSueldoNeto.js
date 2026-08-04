// VARIABLE PARA ALMACENAR EL TABULADOR DE SUELDOS
var tabuladorSueldo = [];

//===========================================================
// FUNCION PARA OBTENER EL TABULADOR DE SUELDOS 
// EL CUAL SERA IMPORTANTE PARA ESTABECER QUE SUELDO NETO 
// SE LE ASIGNARA A CADA EMPLEADO
//===========================================================

function getTabulador() {
    // Verificar si el tabulador ya está cargado para evitar peticiones duplicadas
    if (tabuladorSueldo && tabuladorSueldo.length > 0) {
        return;
    }

    var idEmpresa = 1; // Ajusta según tu lógica
    $.ajax({
        url: '../php/getTabulador.php',
        type: 'POST',
        async: false,
        data: {
            accion: 'obtenerTabulador',
            id_empresa: idEmpresa
        },
        dataType: 'json',
        success: function (datos) {
            const jsonTabulador = datos;
            tabuladorSueldo = jsonTabulador;

        },
        error: function (xhr, status, error) {
            console.error("Error al cargar el tabulador:", error);
        }
    });
}

//===========================================================
// FUNCION PARA ESTABLECER EL SUELDO NETO DE UN EMPLEADO
// DE ACUERDO A LOS MINUTOS TRABAJADOS Y EL TABULADOR
//===========================================================

function establecerSueldoNeto(empleado) {

    // Verificar si el empleado tiene sueldo base asignado
    if (empleado.sueldo_base) {
        // Si tiene sueldo base, no se hace nada, solo calcular el sueldo por horas extra si es necesario
        calcularSueldoHorasExtra(empleado);

        // Establecer historial de olvidos de checador
        crearHistorialOlvidosChecador(empleado);

        // Establecer historial de inasistencias
        crearHistorialInasistencias(empleado);
        
        return;
    }

    // Verificar si el tabulador está cargado
    if (!tabuladorSueldo || tabuladorSueldo.length === 0) {

        empleado.sueldo_neto = 0;
        return;
    }

    // Variable para guardar el ultimo rango normal
    var ultimoRangoNormal = null;

    // Recorrer el tabulador
    for (var i = 0; i < tabuladorSueldo.length; i++) {

        var rango = tabuladorSueldo[i];

        // Guardar el ultimo rango normal recorrido
        if (rango.tipo === "normal") {
            ultimoRangoNormal = rango;
        }

        // Si el rango es normal y los minutos del empleado
        // entran dentro de ese rango, se asigna el sueldo.
        if (rango.tipo === "normal") {

            if (empleado.minutos_trabajados <= rango.minutos) {

                // Asignar el sueldo base correspondiente
                empleado.sueldo_neto = parseFloat(rango.sueldo_base);

                // Calcular el sueldo por horas extra si es necesario
                calcularSueldoHorasExtra(empleado);

                // Establecer historial de olvidos de checador
                crearHistorialOlvidosChecador(empleado);

                return;
            }
        }

        // Si llega al rango de horas extras
        if (rango.tipo === "hora_extra") {

            if (empleado.minutos_trabajados > ultimoRangoNormal.minutos) {

                // Asignar el sueldo base correspondiente al ultimo rango normal
                empleado.sueldo_neto = parseFloat(ultimoRangoNormal.sueldo_base);

                // Calcular el sueldo por horas extra
                calcularSueldoHorasExtra(empleado);

                // Establecer historial de olvidos de checador
                crearHistorialOlvidosChecador(empleado);

                return;
            }
        }

    }

    // Si por alguna razon no encontro un rango
    empleado.sueldo_neto = 0;



}

//===================================================
// FUNCION PARA CALCULAR EL SUELDO POR HORAS EXTRA
//===================================================

function calcularSueldoHorasExtra(empleado) {

    // Obtener el ultimo rango normal
    var ultimoRangoNormal = null;

    // Obtener el rango de horas extra
    var rangoHorasExtra = null;

    for (var i = 0; i < tabuladorSueldo.length; i++) {

        if (tabuladorSueldo[i].tipo === "normal") {
            ultimoRangoNormal = tabuladorSueldo[i];
        }

        if (tabuladorSueldo[i].tipo === "hora_extra") {
            rangoHorasExtra = tabuladorSueldo[i];
        }

    }

    // Si no existe el tabulador correspondiente
    if (!ultimoRangoNormal || !rangoHorasExtra) {
        return;
    }

    // Si no tiene horas extra
    if (empleado.minutos_trabajados <= ultimoRangoNormal.minutos) {

        empleado.minutos_extras_trabajados = 0;
        empleado.horas_extra = 0;

        return;
    }

    // Calcular minutos extra
    empleado.minutos_extras_trabajados = empleado.minutos_trabajados - ultimoRangoNormal.minutos;

    // Calcular sueldo de horas extra
    empleado.horas_extra = empleado.minutos_extras_trabajados * rangoHorasExtra.costo_por_minuto;

    // Redondear a 2 decimales
    empleado.horas_extra = parseFloat(
        empleado.horas_extra.toFixed(2)
    );


}