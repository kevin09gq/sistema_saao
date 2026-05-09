$(document).ready(function () {
    // Abrir modal al presionar el botón de la barra de herramientas
    $("#btn_capturar_clientes").on("click", function () {
        abrirModalClientes();
    });

    // Calcular el total a pagar automáticamente en el formulario
    $("#cliente-tarimas, #cliente-cajas, #cliente-tipo-caja").on("change input", function () {
        calcularTotalFormulario();
    });

    // Manejar el registro de un nuevo cliente en la lista temporal
    $("#form-capturar-cliente").on("submit", function (e) {
        e.preventDefault();
        agregarClienteTemporal();
    });

    // Guardar los cambios finales en el objeto JSON global
    $("#btn-guardar-clientes-json").on("click", function () {
        guardarClientesGlobal();
    });
});

let clientesTemporales = [];

//==========================================
// ABRIR EL MODAL 
//===========================================

function abrirModalClientes() {
    // Validar que haya datos de nómina cargados
    if (!jsonNomina10lbs) {
        Swal.fire("Error", "No hay datos de nómina cargados.", "error");
        return;
    }

    // Limpiar y poblar el selector de tipos de cajas con precios vigentes
    const $selectTiposCajas = $("#cliente-tipo-caja").empty();
    $selectTiposCajas.append('<option value="">Seleccionar...</option>');

    const tiposCajasDisponibles = (jsonNomina10lbs.precio_cajas || []).filter(t => t.utilidad === true);
    tiposCajasDisponibles.forEach(tipoCaja => {
        $selectTiposCajas.append(
            `<option value="${tipoCaja.valor}" data-precio="${tipoCaja.precio}">
                ${tipoCaja.valor} ($${tipoCaja.precio})
            </option>`
        );
    });

    // Cargar datos previos. Si es un objeto nuevo traemos registros, si es arreglo viejo lo traemos directo
    let datosClientes = jsonNomina10lbs.clientes || {};
    if (Array.isArray(datosClientes)) {
        clientesTemporales = JSON.parse(JSON.stringify(datosClientes));
    } else {
        clientesTemporales = JSON.parse(JSON.stringify(datosClientes.registros || []));
    }

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
// AGREGAR CLIENTE AL ARREGLO TEMPORAL Y RENDERIZAR LA TABLA
//==========================================

function agregarClienteTemporal() {
    const nombre = $("#cliente-nombre").val().trim();
    const tarimas = parseInt($("#cliente-tarimas").val()) || 0;
    const cajas = parseInt($("#cliente-cajas").val()) || 0;
    const tipoCaja = $("#cliente-tipo-caja").val();
    const precio = parseFloat($("#cliente-tipo-caja option:selected").data("precio")) || 0;

    if (!nombre || !tipoCaja || cajas <= 0) {
        Swal.fire("Atención", "Por favor complete el nombre, tipo de caja y cantidad válida.", "warning");
        return;
    }

    // Añadir al arreglo temporal
    clientesTemporales.push({
        nombre: nombre,
        tarimas: tarimas,
        cajas: cajas,
        tipo_caja: tipoCaja,
        precio_unitario: precio,
        total: tarimas * cajas * precio
    });

    // Resetear el formulario para la siguiente entrada
    $("#form-capturar-cliente")[0].reset();
    $("#cliente-total").val("0.00");

    renderizarTablaClientes();
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
                    <td class="text-center">
                        <button class="btn btn-outline-danger btn-sm border-0 rounded-circle" onclick="eliminarClienteTemporal(${index})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    $("#total-clientes-general").text(`$${totalGral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
}

//==========================================
// ELIMINA UN CLIENTE DE LA LISTA TEMPORAL DEL MODAL
//==========================================
function eliminarClienteTemporal(index) {
    clientesTemporales.splice(index, 1);
    renderizarTablaClientes();
}

//==========================================
// PERSISTE LOS DATOS TEMPORALES AL OBJETO JSON GLOBAL
//==========================================
function guardarClientesGlobal() {
    if (!jsonNomina10lbs) return;

    let sumaCajas = 0;
    let sumaDinero = 0;

    // Calculamos los totales finales
    clientesTemporales.forEach(cli => {
        sumaCajas += (cli.tarimas * cli.cajas);
        sumaDinero += cli.total;
    });

    // Guardamos la estructura solicitada
    jsonNomina10lbs.clientes = {
        registros: JSON.parse(JSON.stringify(clientesTemporales)),
        total_de_cajas: sumaCajas,
        total_general: sumaDinero
    };

    Swal.fire({
        icon: 'success',
        title: 'Guardado Correctamente',
        text: 'La información de los clientes y sus totales han sido integrados.',
        timer: 2000,
        showConfirmButton: false
    });

    $("#modal-capturar-clientes").modal("hide");
}
