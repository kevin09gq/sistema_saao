$(document).ready(function () {
    // Botón para abrir el modal
    $("#btn_cajas_general").on("click", function () {
        abrirModalCajasGeneral();
    });



    // Buscador de empleados en tiempo real dentro del modal
    $("#buscar-empleado-cajas").on("keyup", function () {
        const busqueda = $(this).val().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        $("#tbody-general-cajas tr").each(function () {
            // Ignorar filas de encabezado de grupo en la búsqueda
            if ($(this).hasClass('group-header')) return;

            const nombre = $(this).find("td.sticky-col-3").text().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const clave = $(this).find("td.sticky-col-2").text().toLowerCase();

            if (nombre.includes(busqueda) || clave.includes(busqueda)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });

        // Mostrar/Ocultar encabezados de grupo según si tienen elementos visibles
        actualizarVisibilidadHeaders();
    });
});

/**
 * Función auxiliar para obtener la lista de empleados agrupada por Seguro Social
 * (Asegura que el orden sea consistente en todas las funciones del modal)
 * Solo devuelve empleados donde mostrar === true
 */
function obtenerListaEmpleadosCajas() {
    if (!jsonHistorialNomina || !jsonHistorialNomina.departamentos) return [];

    let conSeguro = [];
    let sinSeguro = [];

    jsonHistorialNomina.departamentos.forEach(depto => {
        if (!depto.empleados) return;
        depto.empleados.forEach(emp => {
            // Filtrar solo empleados donde mostrar === true
            if (emp.mostrar !== true) return;

            if (emp.seguroSocial === true) conSeguro.push(emp);
            else sinSeguro.push(emp);
        });
    });

    return conSeguro.concat(sinSeguro);
}

/**
 * Oculta los encabezados de grupo si no hay empleados visibles debajo de ellos
 */
function actualizarVisibilidadHeaders() {
    $(".group-header").each(function () {
        let hasVisible = false;
        let next = $(this).next();
        while (next.length && !next.hasClass('group-header')) {
            if (next.is(':visible')) {
                hasVisible = true;
                break;
            }
            next = next.next();
        }
        $(this).toggle(hasVisible);
    });
}

let diasAgregados = []; // Para no repetir días

//=======================================
//ABRIR MODAL DONDE SE MUESTRA A LOS EMPLEADOS
//========================================

function abrirModalCajasGeneral() {
    if (!jsonHistorialNomina || !jsonHistorialNomina.departamentos) {
        Swal.fire("Error", "No hay datos de nómina cargados.", "error");
        return;
    }

    // Reiniciar lista de días al abrir
    diasAgregados = [];
    $("#header-fila-dias th:gt(2)").remove();
    $("#header-fila-tipos").empty();

    // 1. Obtener empleados agrupados (Con Seguro -> Sin Seguro)
    const empleados10lbs = obtenerListaEmpleadosCajas();

    // 2. Limpiar y llenar tabla con empleados
    $("#tbody-general-cajas").empty();

    let yaRenderizadoSinSeguro = false;

    // Encabezado inicial si hay empleados con seguro
    if (empleados10lbs.length > 0 && empleados10lbs[0].seguroSocial) {
        $("#tbody-general-cajas").append(`
            <tr class="group-header" style="background-color: #e7f1ff !important;">
                <td colspan="3" class="ps-3 py-2 fw-bold text-primary">
                    <i class="bi bi-shield-check me-2"></i>EMPLEADOS CON SEGURO
                </td>
            </tr>
        `);
    }

    empleados10lbs.forEach((emp, index) => {
        // Separador para empleados sin seguro
        if (!emp.seguroSocial && !yaRenderizadoSinSeguro) {
            $("#tbody-general-cajas").append(`
                <tr class="group-header" style="background-color: #fff5f5 !important;">
                    <td colspan="3" class="ps-3 py-2 fw-bold text-danger border-top">
                        <i class="bi bi-shield-x me-2"></i>EMPLEADOS SIN SEGURO
                    </td>
                </tr>
            `);
            yaRenderizadoSinSeguro = true;
        }

        const badgeSeguro = emp.seguroSocial
            ? '<span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-2" style="font-size: 0.65rem;">IMSS</span>'
            : '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle ms-2" style="font-size: 0.65rem;">S/S</span>';

        $("#tbody-general-cajas").append(`
            <tr data-emp-idx="${index}">
                <td class="text-center fw-bold text-muted sticky-col-1">${index + 1}</td>
                <td class="text-center sticky-col-2">
                    <span class="badge rounded-pill bg-light text-dark border px-2 py-1">${emp.clave}</span>
                </td>
                <td class="ps-3 sticky-col-3">
                    <div class="d-flex align-items-center justify-content-between pe-3">
                        <span>${emp.nombre}</span>
                        ${badgeSeguro}
                    </div>
                </td>
            </tr>
        `);
    });

    // 3. Detectar días que ya tienen información y agregarlos automáticamente
    let diasConDatos = new Set();
    empleados10lbs.forEach(emp => {
        if (emp.historial_empaque) {
            emp.historial_empaque.forEach(h => diasConDatos.add(h.dia));
        }
    });

    // Agregar cada día detectado a la tabla
    diasConDatos.forEach(dia => {
        agregarDiaTabla(dia);
    });

    $("#modal-cajas-empacadas-general").modal("show");
}

//=======================================
//AGREGAR DIAS DE CAJAS EMPACADAS A LOS EMPLEADOS
//========================================


function agregarDiaTabla(diaManual) {
    // Si viene diaManual lo usamos, si no, lo tomamos del select
    const dia = diaManual || $("#select-agregar-dia").val();

    if (!dia) {
        Swal.fire("Atención", "Seleccione un día.", "warning");
        return;
    }

    if (diasAgregados.includes(dia)) {
        if (!diaManual) Swal.fire("Atención", "Este día ya está en la tabla.", "info");
        return;
    }

    diasAgregados.push(dia);

    const tipos = (jsonHistorialNomina.precio_cajas || []).filter(c => c.utilidad === true);
    const empleados = obtenerListaEmpleadosCajas();

    // 1. Cabecera del Día
    $("#header-fila-dias").append(`
        <th colspan="${tipos.length}" class="text-center bg-primary text-white border-start">
            ${dia}
        </th>
    `);

    // 2. Cabecera de Tipos
    tipos.forEach(t => {
        const nombreCaja = t.valor.split(':')[0];
        const colorCaja = t.color || '#f8f9fa';

        $("#header-fila-tipos").append(`
            <th class="text-center small border-start" style="width: 80px; min-width: 80px; background-color: ${colorCaja} !important;">
                ${nombreCaja} <br> <span class="badge bg-white text-dark border-0">$${t.precio}</span>
            </th>
        `);
    });

    // 3. Celdas de Inputs (Poblar con datos si existen)
    $("#tbody-general-cajas tr").each(function () {
        if ($(this).hasClass('group-header')) return; // Saltar encabezados

        const empIdx = $(this).data("emp-idx");
        const emp = empleados[empIdx];

        tipos.forEach(t => {
            const registro = (emp.historial_empaque || []).find(h => h.dia === dia && h.tipo === t.valor);
            const valor = registro ? registro.cantidad : "";
            const colorCaja = t.color || '#ffffff'; // Color de la caja o blanco

            $(this).append(`
                <td class="p-0 border-start td-captura" style="background-color: ${colorCaja} !important;">
                    <input type="number" 
                           class="input-caja border-0 w-100 text-center py-2" 
                           style="background: transparent;"
                           data-dia="${dia}" 
                           data-tipo="${t.valor}" 
                           data-precio="${t.precio}"
                           value="${valor}"
                           placeholder="0">
                </td>
            `);
        });
    });

    // 4. Actualizar la estructura del footer para incluir el nuevo día
    actualizarEstructuraFooter();
    actualizarValoresTotales();

    // Evento para actualizar totales al escribir
    $(".input-caja").off("input").on("input", function () {
        actualizarValoresTotales();
    });
}

//=======================================
// ACTUALIZA LA FILA DE TOTALES EN EL FOOTER SEGÚN LOS DÍAS Y TIPOS AGREGADOS
//========================================

function actualizarEstructuraFooter() {
    const $tfoot = $("#tfoot-general-cajas").empty();
    const tipos = (jsonHistorialNomina.precio_cajas || []).filter(c => c.utilidad === true);

    let fila = `
        <tr>
            <th colspan="3" class="text-end pe-3 sticky-col-1" style="background-color: #f1f3f5 !important; border-top: 2px solid #dee2e6;">TOTALES:</th>
    `;

    diasAgregados.forEach(dia => {
        tipos.forEach(t => {
            const valorLimpio = t.valor.replace(/:/g, '-').replace(/ /g, '_');
            const colorCaja = t.color || '#fff3cd'; // Color de la caja o amarillento por defecto

            fila += `<th class="text-center total-caja-${dia}-${valorLimpio}" 
                        style="width: 60px; min-width: 60px; background-color: ${colorCaja} !important; border-top: 2px solid #dee2e6;">
                        0
                     </th>`;
        });
    });

    fila += `</tr>`;
    $tfoot.append(fila);
}



//=======================================
// ACTUALIZA LOS VALORES TOTALES EN TIEMPO REAL CUANDO SE MODIFICAN LOS INPUTS DE CANTIDAD
//========================================

function actualizarValoresTotales() {
    const tipos = (jsonHistorialNomina.precio_cajas || []).filter(c => c.utilidad === true);
    let granTotalCajas = 0;
    let granTotalDinero = 0;

    diasAgregados.forEach(dia => {
        tipos.forEach(t => {
            let sumaCajas = 0;
            // Usamos selector de atributo exacto, que soporta espacios
            $(`.input-caja[data-dia="${dia}"][data-tipo="${t.valor}"]`).each(function () {
                const cant = parseInt($(this).val()) || 0;
                sumaCajas += cant;
            });

            const valorLimpio = t.valor.replace(/:/g, '-').replace(/ /g, '_');
            const claseTotal = `.total-caja-${dia}-${valorLimpio}`;
            $(claseTotal).text(sumaCajas);

            granTotalCajas += sumaCajas;
            granTotalDinero += (sumaCajas * t.precio);
        });
    });

    // Mostrar el Gran Total en la parte superior
    const $labelTotal = $("#total-general-superior");
    $labelTotal.text(granTotalCajas);

    $("#total-dinero-superior").text(`$${granTotalDinero.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    //==========================================
    // VALIDACIÓN CONTRA TOTAL DE CAJAS DE CLIENTES
    //==========================================
    const totalMaximo = (window.jsonHistorialNomina.clientes && window.jsonHistorialNomina.clientes.total_de_cajas)
        ? window.jsonHistorialNomina.clientes.total_de_cajas
        : 0;

    if (totalMaximo > 0 && granTotalCajas > totalMaximo) {
        // Cambiar a color rojo y añadir animación de aviso
        $labelTotal.removeClass("text-warning").addClass("text-danger fw-bold");

        // Notificación tipo Toast para no interrumpir la captura
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: false
        });

        // Solo alertar si no se ha alertado en esta sesión de escritura actual
        if (!window.yaAvisadoExceso) {
            Toast.fire({
                icon: 'warning',
                title: '¡Atención!',
                text: `Has superado el límite de cajas de clientes (${totalMaximo})`
            });
            window.yaAvisadoExceso = true;
        }
    } else {
        // Regresar a color normal si el total es válido
        $labelTotal.removeClass("text-danger fw-bold").addClass("text-warning");
        window.yaAvisadoExceso = false;
    }
}

