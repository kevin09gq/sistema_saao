$(document).ready(function () {
    // Botón para abrir el modal
    $("#btn_cajas_general").on("click", function () {
        abrirModalCajasGeneral();
    });

    // Botón para agregar el día elegido a la tabla
    $("#btn-agregar-dia-tabla").on("click", function () {
        agregarDiaTabla();
    });
});

let diasAgregados = []; // Para no repetir días

//=======================================
//ABRIR MODAL DONDE SE MUESTRA A LOS EMPLEADOS
//========================================

function abrirModalCajasGeneral() {
    if (!jsonNomina10lbs || !jsonNomina10lbs.departamentos) {
        Swal.fire("Error", "No hay datos de nómina cargados.", "error");
        return;
    }

    // Reiniciar lista de días al abrir
    diasAgregados = [];
    $("#header-fila-dias th:gt(2)").remove(); 
    $("#header-fila-tipos").empty();

    // 1. Obtener empleados
    let empleados10lbs = [];
    jsonNomina10lbs.departamentos.forEach(depto => {
        empleados10lbs = empleados10lbs.concat(depto.empleados);
    });

    // 2. Limpiar y llenar tabla con empleados
    $("#tbody-general-cajas").empty();
    empleados10lbs.forEach((emp, index) => {
        $("#tbody-general-cajas").append(`
            <tr data-emp-idx="${index}">
                <td class="text-center fw-bold text-muted sticky-col-1">${index + 1}</td>
                <td class="text-center sticky-col-2">
                    <span class="badge rounded-pill bg-light text-dark border px-2 py-1">${emp.clave}</span>
                </td>
                <td class="ps-3 sticky-col-3">${emp.nombre}</td>
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

    const tipos = (jsonNomina10lbs.precio_cajas || []).filter(c => c.utilidad === true);
    let empleados = [];
    jsonNomina10lbs.departamentos.forEach(d => empleados = empleados.concat(d.empleados));

    // 1. Cabecera del Día
    $("#header-fila-dias").append(`
        <th colspan="${tipos.length}" class="text-center bg-primary text-white border-start">
            ${dia}
        </th>
    `);

    // 2. Cabecera de Tipos
    tipos.forEach(t => {
        const nombreCaja = t.valor.split(':')[0];
        $("#header-fila-tipos").append(`
            <th class="text-center small bg-light border-start" style="width: 60px; min-width: 60px;">
                ${nombreCaja}
            </th>
        `);
    });

    // 3. Celdas de Inputs (Poblar con datos si existen)
    $("#tbody-general-cajas tr").each(function () {
        const empIdx = $(this).data("emp-idx");
        const emp = empleados[empIdx];
        
        tipos.forEach(t => {
            // Buscar si ya tiene este registro
            const registro = (emp.historial_empaque || []).find(h => h.dia === dia && h.tipo === t.valor);
            const valor = registro ? registro.cantidad : "";

            $(this).append(`
                <td class="p-0 border-start td-captura">
                    <input type="number" 
                           class="input-caja border-0 w-100 text-center py-2" 
                           data-dia="${dia}" 
                           data-tipo="${t.valor}" 
                           data-precio="${t.precio}"
                           value="${valor}"
                           placeholder="0">
                </td>
            `);
        });
    });
}


