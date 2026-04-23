$(".modal-dialog").draggable({
    handle: ".modal-header"
});

$(document).ready(function () {
    buscar_cortador_poda();
    buscar_cortador_extra();
});


// Modal para ingresar datos de poda de árboles y calcular el total a pagar
const modal_poda = new bootstrap.Modal(document.getElementById('modalPoda'));

// Evento para abrir el modal de poda
$(document).on('click', '#btn_modal_poda', function (e) {
    e.preventDefault();

    modal_poda.show();
});

/**
 * ========================================================================================
 * FUNCIONES AUXILIARES PARA PODA
 * ========================================================================================
 */

/**
 * Obtiene el siguiente ID dentro del departamento Poda}
 * @param {Object} json El jsonNominaPalmilla completo de nómina del Relicario
 * @returns {Number} El siguiente ID disponible para un nuevo movimiento de poda
 */
function obtenerSiguienteIdPoda(json) {
    // Inicializar el ID máximo encontrado
    let maxId = 0;

    // Buscar el departamento Poda dentro del JSON
    const departamento = json.departamentos.find(d => d.nombre === "Poda");

    // Si no se encuentra el departamento o no tiene empleados, el siguiente ID es 1
    if (!departamento || !Array.isArray(departamento.empleados)) {
        return 1; // Primer ID
    }

    // Recorrer todos los empleados del departamento Poda y sus movimientos para encontrar el ID máximo
    departamento.empleados.forEach(emp => {
        if (Array.isArray(emp.movimientos)) {
            emp.movimientos.forEach(mov => {
                if (mov.id && mov.id > maxId) {
                    maxId = mov.id;
                }
            });
        }
    });

    // El siguiente ID será el máximo encontrado más 1
    return maxId + 1;
}


/**
 * ========================================================================================
 * FUNCIONALIDAD PARA LA PESTAÑA DE PODA
 * ========================================================================================
 */


/**
 * Evento que se dispara al ingresar texto en el input del nombre del cortador
 * Convierte el texto a mayúsculas y quita acentos
 */
$(document).on("input", "#nombre_cabo_poda", function () {
    let texto = $(this).val();

    // Convertir a mayúsculas
    texto = texto.toUpperCase();

    // Quitar acentos
    texto = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Actualizar el valor del input
    $(this).val(texto);
});

/**
 * Función para buscar el nombre del empleado de PODA
 */
function buscar_cortador_poda() {
    $("#nombre_cabo_poda").autocomplete({
        source: function (request, response) {

            // 1. Buscar el departamento Poda
            let departamento = jsonNominaPalmilla.departamentos
                .find(d => d.nombre === "Poda");

            // 2. Obtener nombres sin duplicados
            let empleados = departamento
                ? [...new Set(
                    departamento.empleados.map(emp => emp.nombre)
                )]
                : [];

            // 3. Filtrar por lo que escribe el usuario
            let resultados = empleados.filter(nombre =>
                nombre.toLowerCase().includes(request.term.toLowerCase())
            );

            // 4. Formato autocomplete
            response(resultados.map(nombre => ({
                label: nombre,
                value: nombre
            })));
        },
        minLength: 1,
        appendTo: "#modalPoda"
    });
}

/**
 * Evento que se dispara al seleccionar un día de la semana para poda
 * Calcula la fecha de poda más cercana dentro del rango de fechas de la nómina
 * y la asigna al input de fecha de poda
 */
$(document).on('change', '#dia_semana_poda', function (e) {
    e.preventDefault();

    let fechas = obtenerRangoFechas(
        jsonNominaPalmilla.fecha_inicio,
        jsonNominaPalmilla.fecha_cierre,
        false
    );

    const diaSeleccionado = $(this).val();

    const diasSemana = {
        DOMINGO: 0,
        LUNES: 1,
        MARTES: 2,
        MIERCOLES: 3,
        JUEVES: 4,
        VIERNES: 5,
        SABADO: 6
    };

    const diaNumero = diasSemana[diaSeleccionado];

    function parseFechaISO(fecha) {
        const [anio, mes, dia] = fecha.split("-");
        // En el Date es mejor usar el formato numérico para evitar problemas de zona horaria
        return new Date(Number(anio), Number(mes) - 1, Number(dia));
    }

    const fechaEncontrada = fechas.find(fecha => {
        const d = parseFechaISO(fecha);
        return d.getDay() === diaNumero;
    });

    if (fechaEncontrada) {
        $('#fecha_poda').val(fechaEncontrada);
    } else {
        $('#fecha_poda').val('');
    }
});

/**
 * Evento que se dispara al ingresar el pago por árbol o la cantidad de árboles podados
 * Calcula el total a pagar y lo muestra en el input de total calculado
 */
$(document).on('input', '#pago_arbol, #cantidad_arboles', function (e) {

    let pagoArbol = parseFloat($('#pago_arbol').val()) || 0;
    let cantidadArboles = parseInt($('#cantidad_arboles').val()) || 0;

    let total = pagoArbol * cantidadArboles;

    $('#total_calculado').val(total.toFixed(2));
});

/**
 * Evento que se dispara al marcar o desmarcar la opción de usar día extra
 * Si se marca, se deshabilita la selección de día de semana y fecha de poda, y se habilita el input de fecha de día extra
 * Si se desmarca, se habilita la selección de día de semana y fecha de poda, y se deshabilita el input de fecha de día extra
 */
$(document).on('change', '#usar_dia_extra', function (e) {
    e.preventDefault();
    if ($(this).is(':checked')) {
        $('#fecha_poda').prop('disabled', true);
        $('#fecha_poda').val('');
        $('#dia_semana_poda').val('').prop('disabled', true);
        $('#fecha_dia_extra').prop('disabled', false);
    } else {
        $('#fecha_poda').prop('disabled', false);
        $('#dia_semana_poda').prop('disabled', false);
        $('#fecha_dia_extra').prop('disabled', true).val('');
    }
});

// Evento para guardar los datos de poda
$(document).on('submit', '#form_poda', function (e) {
    e.preventDefault();

    // Verificar si se va a usar el día extra
    let usar_dia_extra = $('#usar_dia_extra').is(':checked') ? true : false;

    // Validar nombre del empleado
    let nombre_empleado = $('#nombre_cabo_poda').val();
    if (nombre_empleado == '') {
        alerta("error", "Nombre incompleto", "Por favor, ingrese el nombre del cortador");
        return;
    }
    // Validar fecha de poda
    let fecha_poda = $('#fecha_poda').val();
    if (fecha_poda == '' && !usar_dia_extra) {
        alerta("error", "Fecha de poda incompleta", "Por favor, seleccione una fecha de poda");
        return;
    }
     // Validar fecha de poda
    let fecha_dia_extra = $('#fecha_dia_extra').val();
    if (fecha_dia_extra == '' && usar_dia_extra) {
        alerta("error", "Fecha de día extra incompleta", "Por favor, seleccione una fecha para el día extra");
        return;
    }
    // Validar cantidad de árboles podados
    let arboles_podados = parseInt($('#cantidad_arboles').val()) || 0;
    if (arboles_podados <= 0) {
        alerta("error", "Cantidad de árboles inválida", "Por favor, ingrese una cantidad válida de árboles podados");
        return;
    }
    // Validar pago por árbol
    let pago_arbol = parseFloat($('#pago_arbol').val()) || 0;
    if (pago_arbol <= 0) {
        alerta("error", "Pago por árbol inválido", "Por favor, ingrese un pago válido por árbol");
        return;
    }

    let fecha = usar_dia_extra ? fecha_dia_extra : fecha_poda;

    guardar_poda(nombre_empleado, fecha, arboles_podados, pago_arbol);
});

/**
 * Función para guardar los datos de poda en el JSON de nómina
 * @param {String} nombre_empleado Nombre del empleado que realizó la poda
 * @param {String} fecha_poda Fecha en formato ISO (YYYY-MM-DD) de la poda realizada
 * @param {Number} arboles_podados Cantidad de árboles podados por el empleado en esa fecha
 * @param {Number} pago_arbol Pago acordado por cada árbol podado para ese empleado
 */
function guardar_poda(nombre_empleado, fecha_poda, arboles_podados, pago_arbol) {

    let nuevoMovimiento = {
        'id': obtenerSiguienteIdPoda(jsonNominaPalmilla),
        'concepto': 'PODA',
        'fecha': fecha_poda,
        'arboles_podados': arboles_podados,
        'monto': pago_arbol
    }

    // Buscar el departamento Poda
    let departamento = jsonNominaPalmilla.departamentos.find(
        d => d.nombre === "Poda"
    );

    // Si no existe el departamento Poda, crearlo y agregarlo al JSON
    if (!departamento) {
        departamento = {
            id_departamento: 801, // ID ficticio para Poda
            nombre: "Poda",
            empleados: []
        };
        jsonNominaPalmilla.departamentos.push(departamento);
    }

    // Buscar al empleado por nombre dentro del departamento Poda
    let empleado = departamento.empleados.find(e =>
        e.nombre === nombre_empleado
    );

    // Verificar si el empleado ya existe
    if (empleado) {

        /**
         * Asegurarse de que el campo movimientos sea un array antes de agregar el nuevo movimiento
         */
        if (!Array.isArray(empleado.movimientos)) {
            // Si no es un array, inicializarlo como un array vacío
            empleado.movimientos = [];
        }

        // Agregar el nuevo movimiento al array de movimientos del empleado
        empleado.movimientos.push(nuevoMovimiento);

    } else {

        // Si el empleado no existe, crear un nuevo objeto de empleado con el movimiento y agregarlo al departamento
        departamento.empleados.push({
            nombre: nombre_empleado,
            movimientos: [nuevoMovimiento]
        });

    }

    // Mostrar alerta de éxito y limpiar el formulario
    alerta("success", "Poda guardado", "La poda se ha guardado correctamente", true);
    limpiar_formulario_poda();

    let dep = $("#filtro_departamento").val();

    if (dep == 801) {
        mostrarDatosTablaPoda(jsonNominaPalmilla);
    }

}

/**
 * Función para limpiar el formulario de poda
 */
function limpiar_formulario_poda() {
    //$('#form_poda')[0].reset();
    $('#form_extra')[0].reset();

    // Limpiar form de poda
    $('#pago_arbol').val('');
    $('#cantidad_arboles').val('');
    $('#total_calculado').val('');
}

/**
 * ========================================================================================
 * FUNCIONALIDAD PARA LA PESTAÑA DE EXTRAS
 * ========================================================================================
 */


/**
 * Evento para detectar un cambio en el dia
 */
$(document).on('change', '#extra_dia', function (e) {
    e.preventDefault();

    let fechas = obtenerRangoFechas(
        jsonNominaPalmilla.fecha_inicio,
        jsonNominaPalmilla.fecha_cierre,
        false
    );

    const diaSeleccionado = $(this).val();

    const diasSemana = {
        DOMINGO: 0,
        LUNES: 1,
        MARTES: 2,
        MIERCOLES: 3,
        JUEVES: 4,
        VIERNES: 5,
        SABADO: 6
    };

    const diaNumero = diasSemana[diaSeleccionado];

    function parseFechaISO(fecha) {
        const [anio, mes, dia] = fecha.split("-");
        // En el Date es mejor usar el formato numérico para evitar problemas de zona horaria
        return new Date(Number(anio), Number(mes) - 1, Number(dia));
    }

    const fechaEncontrada = fechas.find(fecha => {
        const d = parseFechaISO(fecha);
        return d.getDay() === diaNumero;
    });

    if (fechaEncontrada) {
        $('#extra_fecha').val(fechaEncontrada);
    } else {
        $('#extra_fecha').val('');
    }
});

/**
 * Evento que se dispara al ingresar texto en el input del nombre del extra
 * Convierte el texto a mayúsculas y quita acentos
 */
$(document).on("input", "#extra_nombre_cabo", function () {
    let texto = $(this).val();

    // Convertir a mayúsculas
    texto = texto.toUpperCase();

    // Quitar acentos
    texto = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Actualizar el valor del input
    $(this).val(texto);
});

/**
 * Función para buscar el nombre del empleado de EXTRA
 */
function buscar_cortador_extra() {
    $("#extra_nombre_cabo").autocomplete({
        source: function (request, response) {

            // 1. Buscar el departamento Poda
            let departamento = jsonNominaPalmilla.departamentos
                .find(d => d.nombre === "Poda");

            // 2. Obtener nombres sin duplicados
            let empleados = departamento
                ? [...new Set(
                    departamento.empleados.map(emp => emp.nombre)
                )]
                : [];

            // 3. Filtrar por lo que escribe el usuario
            let resultados = empleados.filter(nombre =>
                nombre.toLowerCase().includes(request.term.toLowerCase())
            );

            // 4. Formato autocomplete
            response(resultados.map(nombre => ({
                label: nombre,
                value: nombre
            })));
        },
        minLength: 1,
        appendTo: "#modalPoda"
    });
}

/**
 * Evento que se dispara al ingresar texto en el input del concepto
 * Convierte el texto a mayúsculas y quita acentos
 */
$(document).on("input", "#extra_concepto", function () {
    let texto = $(this).val();

    // Convertir a mayúsculas
    texto = texto.toUpperCase();

    // Quitar acentos
    texto = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Actualizar el valor del input
    $(this).val(texto);
});

/**
 * Evento para usar dia extra para movimientos extra
 */
$(document).on('change', '#usar_dia_extra_mov_extra', function (e) {
    e.preventDefault();
    if ($(this).is(':checked')) {
        $('#extra_fecha').prop('disabled', true);
        $('#extra_fecha').val('');
        $('#extra_dia').val('').prop('disabled', true);
        $('#fecha_dia_extra_mov_extra').prop('disabled', false);
    } else {
        $('#extra_fecha').prop('disabled', false);
        $('#extra_dia').prop('disabled', false);
        $('#fecha_dia_extra_mov_extra').prop('disabled', true).val('');
    }
});



/**
 * Evento para guardar los datos del extra en el JSON de nómina
 */
$(document).on('submit', '#form_extra', function (e) {
    e.preventDefault();

    // Verificar si se va a usar el día extra
    let usar_dia_extra = $('#usar_dia_extra_mov_extra').is(':checked') ? true : false;

    // Validar nombre del empleado
    let nombre_empleado = $('#extra_nombre_cabo').val();
    if (nombre_empleado == "") {
        alerta("error", "Falta nombre del empleado", "Por favor, seleccione un empleado");
        return;
    }

    // Validar fecha del extra
    let fecha_poda = $('#extra_fecha').val();
    if (fecha_poda == "" && !usar_dia_extra) {
        alerta("error", "Falta fecha del extra", "Por favor, seleccione una fecha");
        return;
    }

    // Validar fecha del dia extra
    let fecha_dia_extra = $('#fecha_dia_extra_mov_extra').val();
    if (fecha_dia_extra == "" && usar_dia_extra) {
        alerta("error", "Falta fecha del día extra", "Por favor, seleccione una fecha para el día extra");
        return;
    }

    // Validar concepto
    let concepto = $('#extra_concepto').val();
    if (concepto == "") {
        alerta("error", "Falta concepto", "Por favor, ingrese un concepto");
        return;
    }

    // Validar monto extra
    let pago_extra = parseFloat($('#extra_monto').val()) || 0;
    if (pago_extra <= 0) {
        alerta("error", "Monto extra inválido", "Por favor, ingrese un monto extra válido");
        return;
    }

    let fecha = usar_dia_extra ? fecha_dia_extra : fecha_poda;

    guardar_extra(nombre_empleado, fecha, concepto, pago_extra);
});


/**
 * Guardar un concepto extra en el JSON de nómina
 * @param {String} nombre_empleado 
 * @param {String} fecha_extra 
 * @param {String} concepto_extra 
 * @param {Number} monto_extra 
 */
function guardar_extra(nombre_empleado, fecha_extra, concepto_extra, monto_extra) {
    // Crear un nuevo movimiento con el concepto, fecha y monto del extra
    let nuevoMovimiento = {
        'id': obtenerSiguienteIdPoda(jsonNominaPalmilla),
        'concepto': concepto_extra,
        'fecha': fecha_extra,
        'monto': monto_extra
    }

    // Buscar el departamento Poda
    let departamento = jsonNominaPalmilla.departamentos.find(
        d => d.nombre === "Poda"
    );

    // Si no existe el departamento Poda, crearlo y agregarlo al JSON
    if (!departamento) {
        departamento = {
            id_departamento: 801, // ID ficticio para Poda
            nombre: "Poda",
            empleados: []
        };
        jsonNominaPalmilla.departamentos.push(departamento);
    }

    // Buscar al empleado por nombre dentro del departamento Poda
    let empleado = departamento.empleados.find(e =>
        e.nombre === nombre_empleado
    );

    // Verificar si el empleado ya existe
    if (empleado) {

        /**
         * Asegurarse de que el campo movimientos sea un array antes de agregar el nuevo movimiento
         */
        if (!Array.isArray(empleado.movimientos)) {
            // Si no es un array, inicializarlo como un array vacío
            empleado.movimientos = [];
        }

        // Agregar el nuevo movimiento al array de movimientos del empleado
        empleado.movimientos.push(nuevoMovimiento);

    } else {

        // Si el empleado no existe, crear un nuevo objeto de empleado con el movimiento y agregarlo al departamento
        departamento.empleados.push({
            nombre: nombre_empleado,
            movimientos: [nuevoMovimiento]
        });

    }

    // Mostrar alerta de éxito y limpiar el formulario
    alerta("success", "Concepto extra guardado", "Se ha guardado correctamente", true);
    limpiar_formulario_poda();

    let dep = $("#filtro_departamento").val();

    if (dep == 801) {
        mostrarDatosTablaPoda(jsonNominaPalmilla);
    }
}