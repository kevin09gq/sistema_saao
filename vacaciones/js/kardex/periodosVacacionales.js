//==================================================================================================
// GESTIÓN DE PERIODOS DE VACACIONES CON PAGINACIÓN
//==================================================================================================

let listaPeriodosGlobal = [];
let paginaActualPeriodos = 1;
const filasPorPaginaPeriodos = 5;

//==============================
// CARGA LOS PERIODOS DE VACACIONES (DE BD O CALCULADOS)
//==============================
function cargarPeriodosVacaciones(empleado) {
    if (!empleado) return;

    // 1. Intentar traer datos reales de la base de datos
    $.post('../php/vacaciones_lft.php', { 
        action: 'obtenerPeriodosEmpleado', 
        id_empleado: empleado.id_empleado 
    }, function(periodos) {
        
        if (periodos && periodos.length > 0) {
            listaPeriodosGlobal = periodos;
            mostrarPaginaPeriodos(1);
            actualizarResumenTotales(periodos);
        } else {
            // SI NO HAY DATOS, CALCULAR EN TIEMPO REAL (SIMULACIÓN)
            calcularYMostrarPeriodosSimulados(empleado);
        }
        
    }, 'json');
}

//==============================
// CALCULA Y MUESTRA PERIODOS SI LA TABLA ESTÁ VACÍA
//==============================
function calcularYMostrarPeriodosSimulados(empleado) {
    $.post('../php/vacaciones_lft.php', { action: 'obtenerTodoLft' }, function(todasLasLeyes) {
        let fechaIngreso = new Date(empleado.fecha_ingreso_final);
        fechaIngreso.setMinutes(fechaIngreso.getMinutes() + fechaIngreso.getTimezoneOffset());
        let hoy = new Date();
        let anioBase = fechaIngreso.getFullYear();
        let mesBase = fechaIngreso.getMonth();
        let diaBase = fechaIngreso.getDate();

        let periodosSimulados = [];

        // Bucle para cada aniversario (hasta 100 años)
        for (let anios = 1; anios <= 100; anios++) {
            let fechaAniversario = new Date(anioBase + anios, mesBase, diaBase);
            if (fechaAniversario > hoy) break;

            // Buscar ley vigente
            let leySeleccionada = null;
            $.each(todasLasLeyes, function(i, ley) {
                let inicio = new Date(ley.fecha_inicio_vigencia);
                let fin = ley.fecha_fin_vigencia ? new Date(ley.fecha_fin_vigencia) : new Date(9999, 11, 31);
                if (fechaAniversario >= inicio && fechaAniversario <= fin) {
                    leySeleccionada = ley;
                    return false;
                }
            });

            if (leySeleccionada) {
                let diasDerecho = 0;
                let rangoValido = null;
                // Buscar rango de antigüedad correcto (mayor a menor)
                $.each(leySeleccionada.tabla_dias, function(i, rango) {
                    let inicioRango = parseInt(rango.anios_antiguedad_inicio);
                    if (anios >= inicioRango) {
                        if (!rangoValido || inicioRango > parseInt(rangoValido.anios_antiguedad_inicio)) {
                            rangoValido = rango;
                        }
                    }
                });

                if (rangoValido) {
                    diasDerecho = parseInt(rangoValido.dias_vacaciones_correspondientes);
                    periodosSimulados.push({
                        fecha_aniversario: fechaAniversario.toISOString().split('T')[0],
                        anios_antiguedad: anios,
                        nombre_version: leySeleccionada.nombre_version,
                        dias_derecho: diasDerecho,
                        dias_tomados: 0,
                        saldo: diasDerecho,
                        estatus: 'ACTIVO'
                    });
                }
            }
        }
        
        // Guardar y mostrar
        listaPeriodosGlobal = periodosSimulados.reverse(); // Más recientes primero
        mostrarPaginaPeriodos(1);
        actualizarResumenTotales(listaPeriodosGlobal);
        
        console.log("Se generaron periodos simulados.");
    }, 'json');
}

//==============================
// RENDERIZA UNA PÁGINA ESPECÍFICA DE PERIODOS
//==============================
function mostrarPaginaPeriodos(pagina) {
    paginaActualPeriodos = pagina;
    let total = listaPeriodosGlobal.length;
    let $tbody = $('#tbodyPeriodos').empty();

    if (total === 0) {
        $tbody.append('<tr><td colspan="7" class="text-center text-muted">No hay periodos registrados</td></tr>');
        actualizarControlesPaginacion(0);
        return;
    }

    // Calcular rangos
    let inicio = (pagina - 1) * filasPorPaginaPeriodos;
    let fin = Math.min(inicio + filasPorPaginaPeriodos, total);
    let fragmento = listaPeriodosGlobal.slice(inicio, fin);

    // Renderizar filas
    $.each(fragmento, function(i, p) {
        let statusClass = p.estatus.toLowerCase();
        let fila = `
            <tr>
                <td>${formatearFecha(p.fecha_aniversario)}</td>
                <td>${p.anios_antiguedad}</td>
                <td><small>${p.nombre_version}</small></td>
                <td class="fw-bold">${parseFloat(p.dias_derecho).toFixed(3)}</td>
                <td class="text-danger">${parseFloat(p.dias_tomados).toFixed(3)}</td>
                <td class="text-success fw-bold">${parseFloat(p.saldo).toFixed(3)}</td>
                <td class="text-center">
                    <span class="badge-status status-${statusClass}">${p.estatus}</span>
                </td>
            </tr>`;
        $tbody.append(fila);
    });

    actualizarControlesPaginacion(total);
}

//==============================
// ACTUALIZA LOS CONTROLES DE PAGINACIÓN (UI)
//==============================
function actualizarControlesPaginacion(total) {
    let numPaginas = Math.ceil(total / filasPorPaginaPeriodos);
    let $info = $('#infoPaginacionPeriodos');
    let $lista = $('#listaPaginacionPeriodos').empty();

    if (total === 0) {
        $info.html('Mostrando 0 a 0 de 0 períodos');
        return;
    }

    // Texto informativo
    let desde = (paginaActualPeriodos - 1) * filasPorPaginaPeriodos + 1;
    let hasta = Math.min(paginaActualPeriodos * filasPorPaginaPeriodos, total);
    $info.html(`Mostrando <strong>${desde}</strong> a <strong>${hasta}</strong> de <strong>${total}</strong> períodos`);

    // Botón Anterior
    let disabledPrev = (paginaActualPeriodos === 1) ? 'disabled' : '';
    $lista.append(`<li class="page-item ${disabledPrev}"><a class="page-link" href="javascript:void(0)" onclick="mostrarPaginaPeriodos(${paginaActualPeriodos - 1})"><i class="bi bi-chevron-left"></i></a></li>`);

    // Números de página
    for (let i = 1; i <= numPaginas; i++) {
        let active = (i === paginaActualPeriodos) ? 'active' : '';
        $lista.append(`<li class="page-item ${active}"><a class="page-link" href="javascript:void(0)" onclick="mostrarPaginaPeriodos(${i})">${i}</a></li>`);
    }

    // Botón Siguiente
    let disabledNext = (paginaActualPeriodos === numPaginas) ? 'disabled' : '';
    $lista.append(`<li class="page-item ${disabledNext}"><a class="page-link" href="javascript:void(0)" onclick="mostrarPaginaPeriodos(${paginaActualPeriodos + 1})"><i class="bi bi-chevron-right"></i></a></li>`);
}

//==============================
// ACTUALIZA LAS TARJETAS DE RESUMEN
//==============================
function actualizarResumenTotales(periodos) {
    let totales = 0;
    let tomados = 0;
    let saldo = 0;

    $.each(periodos, function(i, p) {
        totales += parseFloat(p.dias_derecho);
        tomados += parseFloat(p.dias_tomados);
        saldo += parseFloat(p.saldo);
    });

    $('#diasTotales').text(totales.toFixed(3));
    $('#diasUtilizados').text(tomados.toFixed(3));
    $('#saldoDisponible').text(saldo.toFixed(3));
}
