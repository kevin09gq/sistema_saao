//===================================================
// FUNCIONES DEL MODAL DE REGISTRO DE CLIENTES
//===================================================

$(document).ready(function () {

    abrirModalClientes();

});



//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE REGISTRO DE CLIENTES
//===================================================

function abrirModalClientes() {

    // Detectar el clic en el botón para abrir el modal
    $('#btnVerClientes').click(function () {

            // Mostrar el historial actual
        mostrarHistorialClientes();

        // Abrir el modal de Bootstrap
        $('#modalRegistroClientes').modal('show');

    });

}
//===================================================
// FUNCIÓN PARA MOSTRAR EL HISTORIAL DE CLIENTES
//===================================================

function mostrarHistorialClientes() {

    // Limpiar tabla
    $('#tbody-historial-clientes').empty();

    // Validar que exista información
    if (
        !jsonHistorial10lbs ||
        !jsonHistorial10lbs.clientes ||
        !Array.isArray(
            jsonHistorial10lbs.clientes.registros
        ) ||
        jsonHistorial10lbs.clientes.registros.length === 0
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
    jsonHistorial10lbs.clientes.registros.forEach(function (
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

            </tr>
        `);

    });

}
