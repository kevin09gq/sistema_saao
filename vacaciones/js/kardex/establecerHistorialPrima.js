//==================================================================================================
// GESTIÓN DEL HISTORIAL DE PRIMAS VACACIONALES CON PAGINACIÓN
//==================================================================================================

let listaPrimasGlobal = [];
let paginaActualPrimas = 1;
const filasPorPaginaPrimas = 5;

//==============================
// CARGA EL HISTORIAL DE PRIMAS VACACIONALES DEL EMPLEADO
//==============================
function cargarPrimasVacacionales(empleado) {
    if (!empleado) return;

    $.post('../php/infoEmpleados.php', {
        action: 'obtenerPrimasEmpleado',
        id_empleado: empleado.id_empleado
    }, function (primas) {
        listaPrimasGlobal = primas || [];
        mostrarPaginaPrimas(1);
    }, 'json').fail(function() {
        listaPrimasGlobal = [];
        mostrarPaginaPrimas(1);
    });
}

//==============================
// RENDERIZA UNA PÁGINA DEL HISTORIAL DE PRIMAS VACACIONALES
//==============================
function mostrarPaginaPrimas(pagina) {
    paginaActualPrimas = pagina;
    let total = listaPrimasGlobal.length;
    let $tbody = $('#tbodyPrimas').empty();

    if (total === 0) {
        $tbody.append('<tr><td colspan="9" class="text-center text-muted">No hay primas vacacionales registradas</td></tr>');
        actualizarControlesPaginacionPrimas(0);
        return;
    }

    let inicio = (pagina - 1) * filasPorPaginaPrimas;
    let fin = Math.min(inicio + filasPorPaginaPrimas, total);
    let fragmento = listaPrimasGlobal.slice(inicio, fin);

    $.each(fragmento, function (i, p) {
        let semanaAnio = `${p.numero_semana} / ${p.anio}`;
        let fechaPago = formatearFecha(p.fecha_pago);
        let periodoVacacional = `${formatearFecha(p.fecha_inicio)} - ${formatearFecha(p.fecha_fin)}`;
        let diasVacaciones = parseFloat(p.dias_vacaciones).toFixed(3);
        let salarioDiario = parseFloat(p.salario_diario).toFixed(2);
        let montoPrima = parseFloat(p.monto_prima_vacacional).toFixed(2);
        let isr = parseFloat(p.isr).toFixed(2);
        let tarjeta = parseFloat(p.dispersion_tarjeta || 0).toFixed(2);
        let totalPagado = parseFloat(p.total_pagado).toFixed(2);

        let fila = `
            <tr>
                <td>${semanaAnio}</td>
                <td>${fechaPago}</td>
                <td>${periodoVacacional}</td>
                <td class="text-end fw-bold">${diasVacaciones}</td>
                <td class="text-end">$${salarioDiario}</td>
                <td class="text-end fw-bold text-success">$${montoPrima}</td>
                <td class="text-end text-danger">$${isr}</td>
                <td class="text-end text-secondary">$${tarjeta}</td>
                <td class="text-end fw-bold text-primary">$${totalPagado}</td>
            </tr>`;
        $tbody.append(fila);
    });

    actualizarControlesPaginacionPrimas(total);
    if (typeof renderizarCalendario === 'function') {
        renderizarCalendario();
    }
}

//==============================
// ACTUALIZA LOS CONTROLES DE PAGINACIÓN DE PRIMAS
//==============================
function actualizarControlesPaginacionPrimas(total) {
    let numPaginas = Math.ceil(total / filasPorPaginaPrimas);
    let $info = $('#infoPaginacionPrimas');
    let $lista = $('#listaPaginacionPrimas').empty();

    if (total === 0) {
        $info.html('Mostrando 0 a 0 de 0 primas');
        return;
    }

    let desde = (paginaActualPrimas - 1) * filasPorPaginaPrimas + 1;
    let hasta = Math.min(paginaActualPrimas * filasPorPaginaPrimas, total);
    $info.html(`Mostrando <strong>${desde}</strong> a <strong>${hasta}</strong> de <strong>${total}</strong> primas`);

    $lista.append(`<li class="page-item ${(paginaActualPrimas === 1) ? 'disabled' : ''}">
        <a class="page-link" href="javascript:void(0)" onclick="mostrarPaginaPrimas(${paginaActualPrimas - 1})">
            <i class="bi bi-chevron-left"></i>
        </a>
    </li>`);

    for (let i = 1; i <= numPaginas; i++) {
        $lista.append(`<li class="page-item ${(i === paginaActualPrimas) ? 'active' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="mostrarPaginaPrimas(${i})">${i}</a>
        </li>`);
    }

    $lista.append(`<li class="page-item ${(paginaActualPrimas === numPaginas) ? 'disabled' : ''}">
        <a class="page-link" href="javascript:void(0)" onclick="mostrarPaginaPrimas(${paginaActualPrimas + 1})">
            <i class="bi bi-chevron-right"></i>
        </a>
    </li>`);
}
