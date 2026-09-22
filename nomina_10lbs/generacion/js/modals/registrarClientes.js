//===================================================
// FUNCIONES DEL MODAL DE REGISTRO DE CLIENTES
//===================================================

$(document).ready(function () {

    abrirModalRegistroClientes();

    cargarTiposCajaClientes();

    calcularTotalCliente();

    registrarCliente();

    mostrarHistorialClientes();

});


//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE REGISTRO DE CLIENTES
//===================================================

function abrirModalRegistroClientes() {

    // Detectar el clic en el botón para abrir el modal
    $('#btn_registro_clientes').click(function () {

        // Cargar nuevamente los tipos de caja
        cargarTiposCajaClientes();

        // Mostrar el historial actual
        mostrarHistorialClientes();

        // Abrir el modal de Bootstrap
        $('#modalRegistroClientes').modal('show');

    });

}


//===================================================
// FUNCIÓN PARA CARGAR LOS TIPOS DE CAJA
// UTILIZA LA PROPIEDAD precio_cajas DEL JSON
//===================================================

function cargarTiposCajaClientes() {

    // Obtener el select
    let selectTipoCaja = $('#selectTipoCajaCliente');

    // Limpiar las opciones actuales
    selectTipoCaja.empty();

    // Agregar opción inicial
    selectTipoCaja.append(`
        <option value="">
            Seleccione...
        </option>
    `);

    // Validar que exista la información de precios de cajas
    if (
        !jsonNomina10lbs ||
        !Array.isArray(jsonNomina10lbs.precio_cajas)
    ) {
        return;
    }

    // Recorrer los precios de las cajas
    jsonNomina10lbs.precio_cajas.forEach(function (caja) {

        // Solo mostrar cajas que tengan utilidad activa
        if (caja.utilidad === true) {

            selectTipoCaja.append(`
                <option
                    value="${caja.valor}"
                    data-precio="${caja.precio}"
                >
                    ${caja.valor}
                </option>
            `);

        }

    });

}


//===================================================
// FUNCIÓN PARA OBTENER EL PRECIO UNITARIO
// SEGÚN EL TIPO DE CAJA SELECCIONADO
//===================================================

function obtenerPrecioCajaSeleccionada() {

    // Obtener la opción seleccionada
    let opcionSeleccionada = $('#selectTipoCajaCliente option:selected');

    // Obtener el precio almacenado en data-precio
    let precio = opcionSeleccionada.attr('data-precio');

    // Validar si existe precio
    if (
        precio === undefined ||
        precio === null ||
        precio === ""
    ) {
        return 0;
    }

    // Convertir a número
    precio = parseFloat(precio);

    // Validar que sea un número
    if (isNaN(precio)) {
        return 0;
    }

    return precio;

}


//===================================================
// FUNCIÓN PARA CALCULAR EL TOTAL A PAGAR
// CANTIDAD DE CAJAS × PRECIO UNITARIO × TARIMAS
//===================================================

function calcularTotalCliente() {

    // Detectar cambio en cantidad de tarimas
    $('#inputTarimasCliente').on('input', function () {

        actualizarTotalCliente();

    });

    // Detectar cambio en cantidad de cajas
    $('#inputCantidadCajasCliente').on('input', function () {

        actualizarTotalCliente();

    });

    // Detectar cambio en tipo de caja
    $('#selectTipoCajaCliente').on('change', function () {

        actualizarTotalCliente();

    });

}


//===================================================
// FUNCIÓN PARA ACTUALIZAR EL TOTAL A PAGAR DEL CLIENTE
// CANTIDAD DE CAJAS × PRECIO UNITARIO × TARIMAS
//===================================================

function actualizarTotalCliente() {

    // Obtener cantidad de tarimas
    let tarimas = parseInt(
        $('#inputTarimasCliente').val()
    ) || 0;

    // Obtener cantidad de cajas
    let cajas = parseInt(
        $('#inputCantidadCajasCliente').val()
    ) || 0;

    // Obtener precio unitario
    let precioUnitario = obtenerPrecioCajaSeleccionada();

    // Calcular subtotal de las cajas
    let subtotal = cajas * precioUnitario;

    // Calcular total considerando las tarimas
    let total = subtotal * tarimas;

    // Mostrar el total en el input
    $('#inputTotalPagarCliente').val(
        total.toFixed(2)
    );

}


//===================================================
// FUNCIÓN PARA OBTENER Y VALIDAR LA INFORMACIÓN
// DEL CLIENTE
//===================================================

function obtenerDatosCliente() {

    // Obtener información de los campos
    let nombre = $('#inputNombreCliente').val().trim();

    let tarimasVal = $('#inputTarimasCliente').val();

    let cajasVal = $('#inputCantidadCajasCliente').val();

    let tipoCaja = $('#selectTipoCajaCliente').val();

    // Validar nombre
    if (nombre === "") {

        mostrarAlerta(
            "warning",
            "Advertencia",
            "Debe ingresar el nombre del cliente."
        );

        return null;

    }

    // Validar tarimas
    if (
        tarimasVal === "" ||
        isNaN(tarimasVal) ||
        parseInt(tarimasVal) <= 0
    ) {

        mostrarAlerta(
            "warning",
            "Advertencia",
            "Debe ingresar una cantidad válida de tarimas mayor a 0."
        );

        return null;

    }

    // Validar cajas
    if (
        cajasVal === "" ||
        isNaN(cajasVal) ||
        parseInt(cajasVal) <= 0
    ) {

        mostrarAlerta(
            "warning",
            "Advertencia",
            "Debe ingresar una cantidad válida de cajas mayor a 0."
        );

        return null;

    }

    // Validar tipo de caja
    if (tipoCaja === "") {

        mostrarAlerta(
            "warning",
            "Advertencia",
            "Debe seleccionar el tipo de caja."
        );

        return null;

    }

    // Obtener precio unitario
    let precioUnitario = obtenerPrecioCajaSeleccionada();

    // Validar precio
    if (
        isNaN(precioUnitario) ||
        precioUnitario <= 0
    ) {

        mostrarAlerta(
            "warning",
            "Advertencia",
            "El tipo de caja seleccionado no tiene un precio válido."
        );

        return null;

    }

    // Convertir valores numéricos
    let tarimas = parseInt(tarimasVal);

    let cajas = parseInt(cajasVal);

    // Calcular total a pagar (cajas × precio unitario × tarimas)
    let total = cajas * precioUnitario * tarimas;

    // Retornar objeto con los datos procesados
    return {

        nombre: nombre,

        tarimas: tarimas,

        cajas: cajas,

        tipo_caja: tipoCaja,

        precio_unitario: precioUnitario,

        total: total

    };

}


//===================================================
// FUNCIÓN PARA REGISTRAR EL CLIENTE
//===================================================

function registrarCliente() {

    $('#btnRegistrarCliente').on('click', function () {

        // Obtener y validar los datos del cliente
        let cliente = obtenerDatosCliente();

        // Si la validación falla, detener proceso
        if (!cliente) {
            return;
        }

        // Validar que exista la estructura de clientes
        if (!jsonNomina10lbs.clientes) {

            jsonNomina10lbs.clientes = {

                total_de_cajas: 0,

                total_general: 0,

                registros: []

            };

        }

        // Validar que exista el arreglo de registros
        if (
            !Array.isArray(
                jsonNomina10lbs.clientes.registros
            )
        ) {

            jsonNomina10lbs.clientes.registros = [];

        }

        // Agregar el nuevo cliente
        jsonNomina10lbs.clientes.registros.push({

            cajas: cliente.cajas,

            nombre: cliente.nombre,

            precio_unitario: cliente.precio_unitario,

            tarimas: cliente.tarimas,

            tipo_caja: cliente.tipo_caja,

            total: cliente.total

        });

        // Actualizar los totales generales
        actualizarTotalesClientes();

        // Actualizar el historial
        mostrarHistorialClientes();

        // Limpiar formulario
        limpiarFormularioCliente();

        // Mostrar mensaje de éxito
        mostrarAlerta(
            "success",
            "Éxito",
            "Cliente registrado correctamente."
        );

        // Mostrar JSON actualizado en consola
        console.log(
            "JSON actualizado:",
            jsonNomina10lbs
        );

    });

}


//===================================================
// FUNCIÓN PARA ACTUALIZAR LOS TOTALES DE CLIENTES
// CALCULA:
// total_de_cajas = SUMA DE CAJAS
// total_general = SUMA DE LOS TOTALES
//===================================================

function actualizarTotalesClientes() {

    // Validar que exista la estructura principal
    if (
        !jsonNomina10lbs
    ) {
        return;
    }

    // Validar que exista la estructura de clientes
    if (
        !jsonNomina10lbs.clientes
    ) {

        jsonNomina10lbs.clientes = {

            total_de_cajas: 0,

            total_general: 0,

            registros: []

        };

    }

    // Validar que exista el arreglo de registros
    if (
        !Array.isArray(
            jsonNomina10lbs.clientes.registros
        )
    ) {

        jsonNomina10lbs.clientes.registros = [];

    }

    // Variables para acumular
    let totalDeCajas = 0;

    let totalGeneral = 0;

    // Recorrer todos los registros
    jsonNomina10lbs.clientes.registros.forEach(function (cliente) {

        // Calcular total de cajas considerando las tarimas
        let cajasConTarimas = (parseInt(cliente.cajas) || 0) * (parseInt(cliente.tarimas) || 0);
        
        // Sumar cantidad de cajas (multiplicado por tarimas)
        totalDeCajas += cajasConTarimas;

        // Sumar total a pagar
        totalGeneral += parseFloat(cliente.total) || 0;

    });

    // Guardar resultados en el JSON
    jsonNomina10lbs.clientes.total_de_cajas = totalDeCajas;

    jsonNomina10lbs.clientes.total_general = totalGeneral;

}


//===================================================
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE CLIENTES
//===================================================

function mostrarHistorialClientes() {

    // Limpiar tabla
    $('#tbody-historial-clientes').empty();

    // Validar que exista información
    if (
        !jsonNomina10lbs ||
        !jsonNomina10lbs.clientes ||
        !Array.isArray(
            jsonNomina10lbs.clientes.registros
        ) ||
        jsonNomina10lbs.clientes.registros.length === 0
    ) {

        $('#tbody-historial-clientes').append(`
            <tr>

                <td
                    colspan="7"
                    class="text-center text-muted">

                    No hay registros de clientes.

                </td>

            </tr>
        `);

        return;

    }

    // Recorrer los registros
    jsonNomina10lbs.clientes.registros.forEach(function (
        cliente,
        indice
    ) {

        $('#tbody-historial-clientes').append(`
            <tr>

                <td>
                    ${indice + 1}
                </td>

                <td>
                    ${cliente.nombre}
                </td>

                <td>
                    ${cliente.tarimas}
                </td>

                <td>
                    ${cliente.cajas}
                </td>

                <td>
                    ${cliente.tipo_caja}
                </td>

                <td>
                    $${parseFloat(cliente.total).toFixed(2)}
                </td>

                <td class="text-center">

                    <button
                        type="button"
                        class="btn btn-sm btn-danger"
                        onclick="eliminarCliente(${indice})">

                        <i class="bi bi-trash"></i>

                    </button>

                </td>

            </tr>
        `);

    });

}


//===================================================
// FUNCIÓN PARA ELIMINAR UN CLIENTE DEL HISTORIAL
//===================================================

function eliminarCliente(indice) {

    // Validar que exista el arreglo
    if (
        !jsonNomina10lbs ||
        !jsonNomina10lbs.clientes ||
        !Array.isArray(
            jsonNomina10lbs.clientes.registros
        )
    ) {

        return;

    }

    // Validar que el índice exista
    if (
        indice < 0 ||
        indice >= jsonNomina10lbs.clientes.registros.length
    ) {

        return;

    }

    // Eliminar el registro seleccionado
    jsonNomina10lbs.clientes.registros.splice(
        indice,
        1
    );

    // Actualizar totales generales
    actualizarTotalesClientes();

    // Actualizar historial
    mostrarHistorialClientes();

    // Mostrar mensaje
    mostrarAlerta(
        "success",
        "Éxito",
        "Cliente eliminado correctamente."
    );

}


//===================================================
// FUNCIÓN PARA LIMPIAR EL FORMULARIO DEL CLIENTE
//===================================================

function limpiarFormularioCliente() {

    // Limpiar nombre
    $('#inputNombreCliente').val("");

    // Limpiar tarimas
    $('#inputTarimasCliente').val("");

    // Limpiar cantidad de cajas
    $('#inputCantidadCajasCliente').val("");

    // Regresar select a la opción inicial
    $('#selectTipoCajaCliente').val("");

    // Limpiar total
    $('#inputTotalPagarCliente').val("0.00");

}