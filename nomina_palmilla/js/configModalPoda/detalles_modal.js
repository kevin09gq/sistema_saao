const $menu_poda = $('#context_menu_poda');

// Modales para la poda
const modal_poda_detalle = new bootstrap.Modal(document.getElementById('modal_poda_detalle'));
const modal_poda_detalle_extra = new bootstrap.Modal(document.getElementById('modal_poda_detalle_extra'));

$(document).ready(function () {
    mostrarContextMenuPoda();
});


/**
 * Muestra el menú contextual al hacer clic derecho en una fila de la tabla de poda
 */
function mostrarContextMenuPoda() {
    // Click derecho en fila de la tabla
    $('#tabla_poda').on('contextmenu', 'tr', function (e) {
        e.preventDefault();
        // Fila seleccionada
        filaSeleccionada = $(this);
        // Posicionar y mostrar menú
        $menu_poda.css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        }).show();
    });

    // Cerrar menú al hacer click en otro lugar
    $(document).on('click', function () {
        $menu_poda.hide();
    });
}

/**
 * Abrir los modales correspondientes según el concepto de la fila seleccionada
 */
$(document).on('click', '#context_menu_poda', function (e) {
    e.preventDefault();

    const concepto = String(filaSeleccionada.data('concepto') || '').trim();
    const nombre = String(filaSeleccionada.data('nombre') || '').trim();
    const monto = String(filaSeleccionada.data('monto') || '').trim();

    switch (concepto) {
        case 'PODA':
            abrir_modal_poda(jsonNominaPalmilla, nombre, monto);
            break;
        default:
            abrir_modal_poda_extra(jsonNominaPalmilla, concepto, nombre, monto);
            break;
    }
});

/**
 * Abrir el modal de detalles para un movimiento de Poda
 * @param {Object} json Objeto JSON con la información de los departamentos y empleados
 * @param {String} nombre_empleado Nombre del empleado
 * @param {Number} monto_poda Monto del movimiento de Poda
 */
function abrir_modal_poda(json, nombre_empleado, monto_poda) {

    // Mostrar los detalles generales primero
    $("#detalles-tab-pane").addClass("show active");
    $("#movimientos-tab-pane").removeClass("show active");
    $("#detalles-tab").addClass("show active");
    $("#movimientos-tab").removeClass("show active");

    const nombre = String(nombre_empleado || '').trim();
    const monto = parseFloat(monto_poda) || 0;

    // Buscar el departamento
    const departamento = json.departamentos.find(dept => dept.nombre === 'Poda');

    if (!departamento) {
        alert('Error: Departamento Poda no encontrado');
        return;
    }

    // Buscar el empleado SOLO por nombre (No existe en la base de datos)
    const empleado = departamento.empleados.find(emp => emp.nombre == nombre);

    if (!empleado) {
        alert('Empleado no encontrado');
        return;
    }

    // Filtrar los movimientos del empleado para encontrar el que coincide con el concepto "PODA" y el monto
    const movimientos = empleado.movimientos.filter(mov =>
        mov.concepto === "PODA" && mov.monto == monto
    );

    // Llenar el tab de los detalles generales del modal
    llenar_detalles_poda(nombre, monto, movimientos);

    // Llenar el tab de los movimientos del empleado
    llenar_movimientos_poda(movimientos);

    // Mostrar el modal
    modal_poda_detalle.show();
}


/**
 * Función para llenar los detalles general del modal.
 * @param {String} nombre_empleado Nombre del empleado
 * @param {Number} monto_poda Monto que se le pago por arbol
 * @param {Array} movimientos Movimientos del empleado
 */
function llenar_detalles_poda(nombre_empleado, monto_poda, movimientos) {
    // Llenar el nombre del empleado
    $('#nombre_empleado_poda, #visual_nombre_poda').text(nombre_empleado);
    // Llenar el monto por arbol
    $('#monto_por_arbol').text('$ ' + monto_poda.toFixed(2));
    // Llenar el total de árboles podados
    const total_arboles = sumarArboles(movimientos);
    $('#total_arboles').text(total_arboles);
    // Total efectivo
    const total_efectivo = total_arboles * monto_poda;
    $('#total_efectivo_poda').text('$ ' + total_efectivo.toFixed(2));
}

/**
 * Suma el total de árboles podados a partir de los movimientos del empleado para Poda
 * @param {JsonArray} movimientos Movimiento del empleado para Poda
 * @returns 
 */
function sumarArboles(movimientos) {
    return movimientos.reduce((total, mov) => {
        return total + Number(mov.arboles_podados || 0);
    }, 0);
}

/**
 * Llena el tab de movimientos del modal para Poda
 */
function llenar_movimientos_poda(movimientos) {
    let tmp = ``;

    $('#movimientos_poda_body').empty();

    movimientos.forEach((element, index) => {
        tmp += `
            <tr data-index="${index}">
                <td class="text-center" data-id="${element.id}">${element.id}</td>
                <td>
                    <input type="date" class="form-control form-control-sm shadow-sm fecha_poda"
                        value="${element.fecha || ''}">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm shadow-sm arboles" placeholder="Árboles podados"
                        value="${element.arboles_podados || 0}">
                </td>
                <td>
                    <div class="input-group input-group-sm mb-3">
                        <span class="input-group-text">$</span>
                        <input type="number" step="0.01" class="form-control form-control-sm shadow-sm monto_poda"
                            value="${element.monto.toFixed(2) || 0}">
                    </div>
                </td>
                <td class="total_poda text-center">
                    $ ${(element.arboles_podados * element.monto).toFixed(2)}
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger btn_eliminar_poda" data-id="${element.id}">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    $("#movimientos_poda_body").html(tmp);
}

/**
 * Evento para actualizar el total de cada movimiento al cambiar la cantidad de árboles o el monto por árbol
 */
$(document).on('input', '#movimientos_poda_body .arboles, #movimientos_poda_body .monto_poda', function (e) {
    e.preventDefault();

    // Obtener la fila del movimiento
    const fila = $(this).closest('tr');
    // Obtener el nombre del empleado desde el modal
    const nombre_empleado = $('#nombre_empleado_poda').text().trim();
    // Obtener el ID del movimiento
    const id = parseInt(fila.find("td").eq(0).attr("data-id"), 10);

    /**
     * ==============================================================
     * ACTUALIZAR LA VISTA DEL TOTAL
     * ==============================================================
     */

    // Obtener la cantidad de árboles y el monto por árbol
    const arboles = parseFloat(fila.find('.arboles').val()) || 0;
    const monto = parseFloat(fila.find('.monto_poda').val()) || 0;

    // Calcular el total y actualizar la celda correspondiente
    const total = arboles * monto;

    // Actualizar el total en la celda
    fila.find('.total_poda').text(`$ ${total.toFixed(2)}`);

    /**
     * =============================================================
     * ACTUALIZAR EL JSON
     * =============================================================
     */

    // 1. Buscar departamento
    const departamento = jsonNominaPalmilla.departamentos.find(
        d => d.nombre === "Poda"
    );

    if (!departamento) {
        alerta("error", "Departamento Poda no encontrado", "El departamento Poda no existe en el JSON. No se puede eliminar el movimiento.");
        return;
    }

    // 2. Buscar empleado
    const empleado = departamento.empleados.find(
        e => e.nombre === nombre_empleado
    );

    if (!empleado || !Array.isArray(empleado.movimientos)) {
        alerta("error", "Empleado no encontrado", "El empleado no existe en el departamento Poda. No se puede eliminar el movimiento.");
        return;
    }

    // 3. Buscar movimiento por ID
    const movimiento = empleado.movimientos.find(
        mov => mov.id === id
    );

    if (!movimiento) {
        alerta("error", "Movimiento no encontrado", "El movimiento no existe en el empleado seleccionado. No se puede eliminar.");
        return;
    }

    // 4. Actualizar datos
    movimiento.arboles_podados = arboles;
    movimiento.monto = monto;

    // 5. Actualizar la tabla si el filtro de departamento es Poda
    let dep = $("#filtro_departamento").val();
    if (dep == 801) {
        mostrarDatosTablaPoda(jsonNominaPalmilla);
    }
});

/**
 * Evento para eliminar un movimiento de poda al hacer clic en el botón de eliminar dentro del modal de detalles
 */
$(document).on('click', '.btn_eliminar_poda', function (e) {
    e.preventDefault();

    const fila = $(this).closest('tr');
    const id = $(this).data('id');
    const nombre_empleado = $('#nombre_empleado_poda').text().trim();

    Swal.fire({
        title: "Eliminar registro?",
        text: "¿Estás seguro de eliminar este registro de poda? Esta acción no se puede deshacer.",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#b72929",
        cancelButtonColor: "rgb(52, 40, 58)",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // 1. Buscar departamento Poda
            const departamento = jsonNominaPalmilla.departamentos.find(
                d => d.nombre === "Poda"
            );

            if (!departamento) {
                alerta("error", "Departamento Poda no encontrado", "El departamento Poda no existe en el JSON. No se puede eliminar el movimiento.");
                return;
            }

            // 2. Buscar empleado
            const empleado = departamento.empleados.find(
                e => e.nombre === nombre_empleado
            );

            if (!empleado || !Array.isArray(empleado.movimientos)) {
                alerta("error", "Empleado no encontrado", "El empleado no existe en el departamento Poda. No se puede eliminar el movimiento.");
                return;
            }

            // 3. Eliminar del JSON (por ID)
            empleado.movimientos = empleado.movimientos.filter(
                mov => mov.id !== id
            );

            // 4. Eliminar fila del DOM
            fila.remove();

            // 5. Alertar éxito
            alerta("success", "Registro de poda eliminado", "El registro de poda ha sido eliminado exitosamente.");

            // 6. Actualizar la tabla si el filtro de departamento es Poda
            let dep = $("#filtro_departamento").val();
            if (dep == 801) {
                mostrarDatosTablaPoda(jsonNominaPalmilla);
            }

            // 7. Si no quedan movimientos, cerrar el modal
            let filas = $("#movimientos_poda_body tr").length;
            if (filas === 0) {
                modal_poda_detalle.hide();
            }
        }
    });
});


/** --------------------------------------------------------------------------------------------------------------- */

/**
 * Abrir el modal de detalles para un movimiento extra
 * @param {Object} json Objeto JSON con la información de los departamentos y empleados
 * @param {String} concepto Concepto del movimiento extra
 * @param {String} nombre_empleado Nombre del empleado
 * @param {Number} monto_extra Monto del movimiento extra
 */
function abrir_modal_poda_extra(json, concepto, nombre_empleado, monto_extra) {

    // Mostrar los detalles generales primero
    $("#detalles-tab-pane_extra").addClass("show active");
    $("#movimientos-tab-pane_extra").removeClass("show active");
    $("#detalles-tab_extra").addClass("show active");
    $("#movimientos-tab_extra").removeClass("show active");

    const nombre = String(nombre_empleado || '').trim();
    const monto = parseFloat(monto_extra) || 0;

    // Buscar el departamento
    const departamento = json.departamentos.find(dept => dept.nombre === 'Poda');

    if (!departamento) {
        alert('Error: Departamento Poda no encontrado');
        return;
    }

    // Buscar el empleado SOLO por nombre (No existe en la base de datos)
    const empleado = departamento.empleados.find(emp => emp.nombre == nombre);

    if (!empleado) {
        alert('Empleado no encontrado');
        return;
    }

    // Filtrar los movimientos del empleado para encontrar el que coincide con el concepto "PODA" y el monto
    const movimientos = empleado.movimientos.filter(mov =>
        mov.concepto === concepto && mov.monto == monto
    );

    console.log(movimientos);

    // Llenar el tab de los detalles generales del modal
    llenar_detalles_extra(concepto, nombre, monto, movimientos);

    // Llenar el tab de los movimientos del empleado
    llenar_movimientos_extra(movimientos);


    modal_poda_detalle_extra.show();
}

/**
 * 
 * @param {String} concepto Concepto del movimiento extra 
 * @param {String} nombre_empleado Nombre del empleado
 * @param {Number} monto_extra Monto que se le pago por el movimiento extra
 * @param {Array} movimientos Movimientos del empleado
 */
function llenar_detalles_extra(concepto, nombre_empleado, monto_extra, movimientos) {
    // Llenar el nombre del empleado
    $('#nombre_empleado_extra, #visual_nombre_poda_extra').text(nombre_empleado.trim());
    // Llenar el concepto
    $('#concepto_extra').text(concepto);
    // Llenar el monto por concepto
    $('#total_efectivo_extra').text('$ ' + sumar_montos_extra(movimientos));
}

/**
 * Obtener la suma de todos los montos de movimiento
 * @param {Array} movimientos Movimientos del empleado
 * @returns 
 */
function sumar_montos_extra(movimientos) {
    let total = 0;
    movimientos.forEach(mov => {
        total += parseFloat(mov.monto) || 0;
    });
    return total.toFixed(2);
}

/**
 * Llena el tab de movimientos del modal para Poda
 */
function llenar_movimientos_extra(movimientos) {
    let tmp = ``;

    $('#movimientos_body_extra').empty();

    movimientos.forEach((element, index) => {
        tmp += `
            <tr data-index="${index}">
                <td class="text-center" data-id="${element.id}">${element.id}</td>
                <td>
                    <input type="text" class="form-control form-control-sm shadow-sm concepto_extra"
                        value="${element.concepto || ''}">
                </td>
                <td>
                    <input type="date" class="form-control form-control-sm shadow-sm fecha_extra"
                        value="${element.fecha || ''}">
                </td>
                <td>
                    <div class="input-group input-group-sm mb-3">
                        <span class="input-group-text">$</span>
                        <input type="number" step="0.01" class="form-control form-control-sm shadow-sm monto_extra"
                            value="${element.monto.toFixed(2) || 0}">
                    </div>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger btn_eliminar_extra" data-id="${element.id}">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    $("#movimientos_body_extra").html(tmp);
}

/**
 * Evento para eliminar un movimiento extra
 */
$(document).on('click', '.btn_eliminar_extra', function (e) {
    e.preventDefault();

    const fila = $(this).closest('tr');
    const id = $(this).data('id');
    const nombre_empleado = $('#visual_nombre_poda_extra').text().trim();

    Swal.fire({
        title: "Eliminar registro?",
        text: "¿Estás seguro de eliminar este registro extra? Esta acción no se puede deshacer.",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#b72929",
        cancelButtonColor: "rgb(52, 40, 58)",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {

            // 1. Buscar departamento Poda
            const departamento = jsonNominaPalmilla.departamentos.find(
                d => d.nombre === "Poda"
            );

            if (!departamento) {
                alerta("error", "Departamento Poda no encontrado", "El departamento Poda no existe en el JSON. No se puede eliminar el movimiento.");
                return;
            }

            // 2. Buscar empleado
            const empleado = departamento.empleados.find(
                e => e.nombre === nombre_empleado
            );

            if (!empleado || !Array.isArray(empleado.movimientos)) {
                alerta("error", "Empleado no encontrado", "El empleado no existe en el departamento Poda. No se puede eliminar el movimiento.");
                return;
            }

            // 3. Eliminar del JSON (por ID)
            empleado.movimientos = empleado.movimientos.filter(
                mov => mov.id !== id
            );

            // 4. Eliminar fila del DOM
            fila.remove();

            // 5. Alertar éxito
            alerta("success", "Registro eliminado", "El registro extra ha sido eliminado exitosamente.");

            // 6. Actualizar la tabla si el filtro de departamento es Poda
            let dep = $("#filtro_departamento").val();
            if (dep == 801) {
                mostrarDatosTablaPoda(jsonNominaPalmilla);
            }

            // 7. Si no quedan movimientos, cerrar el modal
            let filas = $("#movimientos_body_extra tr").length;
            if (filas === 0) {
                modal_poda_detalle_extra.hide();
            }
        }
    });
});

/**
 * Actualizar los cambios en los movimientos extra
 */
$(document).on('input', '#movimientos_body_extra .concepto_extra, #movimientos_body_extra .fecha_extra, #movimientos_body_extra .monto_extra', function (e) {
    e.preventDefault();

    // Obtener la fila del movimiento
    const fila = $(this).closest('tr');
    // Obtener el nombre del empleado desde el modal
    const nombre_empleado = $('#visual_nombre_poda_extra').text().trim();
    // Obtener el ID del movimiento
    const id = parseInt(fila.find("td").eq(0).attr("data-id"), 10);

    /**
     * ==============================================================
     * RECUPERAR LOS VALORES DE LOS INPUTS
     * ==============================================================
     */

    // Obtener la cantidad de árboles y el monto por árbol
    const concepto_extra = fila.find('.concepto_extra').val().trim();
    const fecha_extra = fila.find('.fecha_extra').val();
    const monto = parseFloat(fila.find('.monto_extra').val()) || 0;


    /**
     * =============================================================
     * ACTUALIZAR EL JSON
     * =============================================================
     */

    // 1. Buscar departamento
    const departamento = jsonNominaPalmilla.departamentos.find(
        d => d.nombre === "Poda"
    );

    if (!departamento) {
        alerta("error", "Departamento Poda no encontrado", "El departamento Poda no existe en el JSON. No se puede eliminar el movimiento.");
        return;
    }

    // 2. Buscar empleado
    const empleado = departamento.empleados.find(
        e => e.nombre === nombre_empleado
    );

    if (!empleado || !Array.isArray(empleado.movimientos)) {
        alerta("error", "Empleado no encontrado", "El empleado no existe en el departamento Poda. No se puede eliminar el movimiento.");
        return;
    }

    // 3. Buscar movimiento por ID
    const movimiento = empleado.movimientos.find(
        mov => mov.id === id
    );

    if (!movimiento) {
        alerta("error", "Movimiento no encontrado", "El movimiento no existe en el empleado seleccionado. No se puede eliminar.");
        return;
    }

    // 4. Actualizar datos
    movimiento.concepto = concepto_extra;
    movimiento.fecha = fecha_extra;
    movimiento.monto = monto;

    // 5. Actualizar la tabla si el filtro de departamento es Poda
    let dep = $("#filtro_departamento").val();
    if (dep == 801) {
        mostrarDatosTablaPoda(jsonNominaPalmilla);
    }
});