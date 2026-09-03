//==========================================================
// FUNCIÓN PARA ACTIVAR LOS EVENTOS
// DE EDICIÓN DE LOS REGISTROS
//==========================================================
function eventosEditarRegistrosEmpleado() {

    // Evento para editar un registro
    $("#tbody-registros-empleado")
        .off("click", ".btn-editar-registro")
        .on("click", ".btn-editar-registro", function () {

            let indice = parseInt($(this).attr("data-indice"));

            editarRegistroEmpleado(indice);

        });

    // Evento para agregar una nueva fila
    $("#tbody-registros-empleado")
        .off("click", ".btn-agregar-fila")
        .on("click", ".btn-agregar-fila", function () {

            let indice = parseInt($(this).attr("data-indice"));

            agregarNuevaFilaRegistro(indice);

        });

    // Evento para eliminar una fila
    $("#tbody-registros-empleado")
        .off("click", ".btn-eliminar-fila")
        .on("click", ".btn-eliminar-fila", function () {

            let indice = parseInt($(this).attr("data-indice"));

            eliminarFilaRegistro(indice);

        });

}

//==========================================================
// FUNCIÓN PARA EDITAR UN REGISTRO
// DEL EMPLEADO
//==========================================================
function editarRegistroEmpleado(indice) {

    // Validar que exista el registro
    if (!registrosEmpleadoActuales ||
        !registrosEmpleadoActuales[indice]) {

        return;

    }

    // Obtener registro
    let registro = registrosEmpleadoActuales[indice];

    // Obtener fila
    let fila = $(
        '#tbody-registros-empleado tr[data-indice-registro="' +
        indice +
        '"]'
    );

    // Guardar valores originales
    fila.attr(
        "data-entrada-original",
        registro.entrada || ""
    );

    fila.attr(
        "data-salida-original",
        registro.salida || ""
    );

    // Convertir Entrada en input
    fila.find(".celda-entrada").html(`

        <input
            type="time"
            class="form-control form-control-sm input-editar-entrada"
            value="${registro.entrada || ""}">

    `);

    // Convertir Salida en input
    fila.find(".celda-salida").html(`

        <input
            type="time"
            class="form-control form-control-sm input-editar-salida"
            value="${registro.salida || ""}">

    `);

    // Mostrar minutos actuales
    fila.find(".celda-minutos").html(`

        <span class="texto-minutos-editar">

            ${registro.minutos || 0}

        </span>

    `);

    // Reemplazar botón Editar
    fila.find(".celda-accion").html(`

        <div class="d-flex justify-content-center gap-1">

            <button
                type="button"
                class="btn btn-success btn-sm btn-guardar-registro"
                data-indice="${indice}"
                title="Guardar">

                <i class="bi bi-check-lg"></i>

            </button>

            <button
                type="button"
                class="btn btn-danger btn-sm btn-cancelar-registro"
                data-indice="${indice}"
                title="Cancelar">

                <i class="bi bi-x-lg"></i>

            </button>

        </div>

    `);

    // Actualizar minutos automáticamente
    actualizarMinutosRegistroEnEdicion(fila);

    // Evento para cambiar Entrada
    fila.find(".input-editar-entrada").on("change", function () {

        actualizarMinutosRegistroEnEdicion(fila);

    });

    // Evento para cambiar Salida
    fila.find(".input-editar-salida").on("change", function () {

        actualizarMinutosRegistroEnEdicion(fila);

    });

    // Evento guardar
    fila.find(".btn-guardar-registro").on("click", function () {

        guardarRegistroEmpleado(indice, fila);

    });

    // Evento cancelar
    fila.find(".btn-cancelar-registro").on("click", function () {

        cancelarEdicionRegistroEmpleado(indice);

    });

}

//==========================================================
// FUNCIÓN PARA ACTUALIZAR LOS MINUTOS
// MIENTRAS SE EDITA EL REGISTRO
//==========================================================
function actualizarMinutosRegistroEnEdicion(fila) {

    let entrada =
        fila.find(".input-editar-entrada").val();

    let salida =
        fila.find(".input-editar-salida").val();

    // Si falta alguna hora
    if (!entrada || !salida) {

        fila.find(".texto-minutos-editar").text(0);

        return;

    }

    // Convertir horas a minutos
    let minutosEntrada =
        convertirHoraAMinutos(entrada);

    let minutosSalida =
        convertirHoraAMinutos(salida);

    // Calcular diferencia
    let minutos = minutosSalida - minutosEntrada;

    // Si el turno cruza medianoche
    if (minutos < 0) {

        minutos += 1440;

    }

    // Mostrar resultado
    fila.find(".texto-minutos-editar").text(minutos);

}

//==========================================================
// FUNCIÓN PARA GUARDAR UN REGISTRO
// DEL EMPLEADO
//==========================================================
function guardarRegistroEmpleado(indice, fila) {

    // Validar registro
    if (!registrosEmpleadoActuales ||
        !registrosEmpleadoActuales[indice]) {

        return;

    }

    // Obtener registro
    let registro = registrosEmpleadoActuales[indice];

    // Obtener nuevos valores
    let entrada =
        fila.find(".input-editar-entrada").val();

    let salida =
        fila.find(".input-editar-salida").val();

    // Calcular minutos
    let minutos = 0;

    if (entrada && salida) {

        let minutosEntrada =
            convertirHoraAMinutos(entrada);

        let minutosSalida =
            convertirHoraAMinutos(salida);

        minutos = minutosSalida - minutosEntrada;

        // Turno que cruza medianoche
        if (minutos < 0) {

            minutos += 1440;

        }

    }

    // Actualizar registro
    registro.entrada = entrada;
    registro.salida = salida;
    registro.minutos = minutos;

    // Obtener el empleado actual
    let empleado = objEmpleado.getEmpleado();

    if (empleado) {

        // Sincronizar los registros actuales con el empleado
        if (empleado.registros) {
            empleado.registros = registrosEmpleadoActuales;
        }

        // Redondear registros del empleado (calcula biométrico redondeado, sueldo neto, incentivo e historiales de biométrico e inasistencias)
        redondearRegistrosEmpleado(empleado, false);

        llenarTablaNomina();

        establecerDataEmpleado(empleado);

    }
}

//==========================================================
// FUNCIÓN PARA CANCELAR LA EDICIÓN
// DE UN REGISTRO
//==========================================================
function cancelarEdicionRegistroEmpleado(indice) {

    // Validar registro
    if (!registrosEmpleadoActuales ||
        !registrosEmpleadoActuales[indice]) {

        return;

    }

    // Volver a mostrar los registros originales
    establecerRegistrosEmpleado(
        registrosEmpleadoActuales
    );

}

//==========================================================
// FUNCIÓN PARA AGREGAR UNA NUEVA FILA DE REGISTRO
// CON EL MISMO DÍA Y FECHA
//==========================================================
function agregarNuevaFilaRegistro(indice) {

    // Validar registro base
    if (!registrosEmpleadoActuales ||
        !registrosEmpleadoActuales[indice]) {

        return;

    }

    // Obtener el registro base para copiar día y fecha
    let registroBase = registrosEmpleadoActuales[indice];

    // Crear nuevo registro con el mismo día y fecha
    let nuevoRegistro = {
        dia: registroBase.dia,
        fecha: registroBase.fecha,
        entrada: "",
        salida: "",
        minutos: 0,
        claseEvento: ""
    };

    // Insertar el nuevo registro después del registro base
    registrosEmpleadoActuales.splice(indice + 1, 0, nuevoRegistro);

    // Re-renderizar la tabla
    establecerRegistrosEmpleado(registrosEmpleadoActuales);

    // Activar automáticamente el modo de edición en la nueva fila (índice + 1)
    editarRegistroEmpleado(indice + 1);

}

//==========================================================
// FUNCIÓN PARA ELIMINAR UNA FILA DE REGISTRO
//==========================================================
function eliminarFilaRegistro(indice) {

    // Validar registro
    if (!registrosEmpleadoActuales ||
        !registrosEmpleadoActuales[indice]) {

        return;

    }

    // Eliminar el registro del array
    registrosEmpleadoActuales.splice(indice, 1);

    // Obtener el empleado actual
    let empleado = objEmpleado.getEmpleado();

    if (empleado) {

        // Sincronizar los registros actuales con el empleado
        if (empleado.registros) {
            empleado.registros = registrosEmpleadoActuales;
        }

        // Redondear registros del empleado (calcula biométrico redondeado, sueldo neto, incentivo e historiales de biométrico e inasistencias)
        redondearRegistrosEmpleado(empleado, false);

        llenarTablaNomina();

        establecerDataEmpleado(empleado);

    } 

}