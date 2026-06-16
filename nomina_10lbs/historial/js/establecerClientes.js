$(document).ready(function () {
    // Abrir modal al presionar el botón de la barra de herramientas
    $("#btn_capturar_clientes").on("click", function () {
        abrirModalClientes();
    });

    // Calcular el total a pagar automáticamente en el formulario
    $("#cliente-tarimas, #cliente-cajas, #cliente-tipo-caja").on("change input", function () {
        calcularTotalFormulario();
    });

});

let clientesTemporales = [];

//==========================================
// ABRIR EL MODAL 
//===========================================

function abrirModalClientes() {
    // Validar que haya datos de nómina cargados
    if (!jsonHistorialNomina) {
        Swal.fire("Error", "No hay datos de nómina cargados.", "error");
        return;
    }

    // Cargar datos previos. Si es un objeto nuevo traemos registros, si es arreglo viejo lo traemos directo
    let datosClientes = jsonHistorialNomina.clientes || {};

    clientesTemporales = JSON.parse(JSON.stringify(datosClientes.registros || []));

    // Renderizar la tabla con los clientes cargados
    renderizarTablaClientes();

    // Mostrar el modal en pantalla
    $("#modal-capturar-clientes").modal("show");
}

//==========================================
// CALCULAR EL TOTAL DE TODOS LOS CLIENTES POR CONCEPTO
//==========================================
function calcularTotalFormulario() {
    const tarimas = parseInt($("#cliente-tarimas").val()) || 0;
    const cajas = parseInt($("#cliente-cajas").val()) || 0;
    const precio = parseFloat($("#cliente-tipo-caja option:selected").data("precio")) || 0;
    const total = tarimas * cajas * precio;
    $("#cliente-total").val(total.toFixed(2));
}



//==========================================
// DIBUJA LAS FILAS DE LA TABLA DE CLIENTES DENTRO DEL MODAL
//==========================================
function renderizarTablaClientes() {
    const $tbody = $("#tbody-clientes").empty();
    let totalGral = 0;

    if (clientesTemporales.length === 0) {
        $tbody.append('<tr><td colspan="7" class="text-center text-muted py-4">No hay clientes registrados en esta sesión.</td></tr>');
    } else {
        clientesTemporales.forEach((c, index) => {
            totalGral += c.total;
            $tbody.append(`
                <tr class="animate__animated animate__fadeIn">
                    <td class="ps-3 fw-bold text-dark">${c.nombre}</td>
                    <td class="text-center"><span class="badge bg-light text-dark border">${c.tarimas}</span></td>
                    <td class="text-center fw-bold">${c.cajas}</td>
                    <td class="text-center"><span class="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2">${c.tipo_caja}</span></td>
                    <td class="text-center text-muted">$${c.precio_unitario.toFixed(2)}</td>
                    <td class="text-end pe-3 fw-bold text-primary">$${c.total.toFixed(2)}</td>

                </tr>
            `);
        });
    }

    $("#total-clientes-general").text(`$${totalGral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
}


