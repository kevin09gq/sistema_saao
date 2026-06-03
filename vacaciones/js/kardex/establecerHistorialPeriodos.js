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
    $.post('../php/infoEmpleados.php', {
        action: 'obtenerPeriodosEmpleado',
        id_empleado: empleado.id_empleado
    }, function (periodos) {

        if (periodos && periodos.length > 0) {
            listaPeriodosGlobal = inyectarEventosHistorialPeriodos(periodos, empleado);
            mostrarPaginaPeriodos(1);
            actualizarResumenTotales(periodos);
        } else {
            // SI NO HAY DATOS, CALCULAR EN TIEMPO REAL (SIMULACIÓN)
            calcularYMostrarPeriodosSimulados(empleado);
        }

        // CARGAR TAMBIÉN EL KARDEX (MOVIMIENTOS)
        cargarKardexVacaciones(empleado);

        // CARGAR TAMBIÉN EL HISTORIAL DE PRIMAS VACACIONALES
        cargarPrimasVacacionales(empleado);


    }, 'json');
}

//==============================
// CALCULA Y MUESTRA PERIODOS SI LA TABLA ESTÁ VACÍA
//==============================
function calcularYMostrarPeriodosSimulados(empleado) {
    $.post('../php/vacaciones_lft.php', { action: 'obtenerTodoLft' }, function (todasLasLeyes) {
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
            $.each(todasLasLeyes, function (i, ley) {
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
                $.each(leySeleccionada.tabla_dias, function (i, rango) {
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
        listaPeriodosGlobal = inyectarEventosHistorialPeriodos(periodosSimulados, empleado);
        mostrarPaginaPeriodos(1);
        actualizarResumenTotales(periodosSimulados);

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
    $.each(fragmento, function (i, p) {
        let fila = '';
        if (p.tipo_evento === 'INGRESO' || p.tipo_evento === 'REINGRESO' || p.tipo_evento === 'BAJA') {
            let badgeClass = '';
            if (p.tipo_evento === 'INGRESO') badgeClass = 'bg-primary';
            else if (p.tipo_evento === 'REINGRESO') badgeClass = 'bg-info text-white';
            else if (p.tipo_evento === 'BAJA') badgeClass = 'bg-danger';

            fila = `
                <tr style="background-color: #fafafa;">
                    <td>${formatearFecha(p.fecha_aniversario)}</td>
                    <td class="text-center">---</td>
                    <td><small class="text-muted"><strong>${p.nombre_version}</strong></small></td>
                    <td class="text-end">---</td>
                    <td class="text-end">---</td>
                    <td class="text-end">---</td>
                    <td class="text-center">
                        <span class="badge ${badgeClass} px-2 py-1">${p.tipo_evento}</span>
                    </td>
                </tr>`;
        } else {
            let statusClass = p.estatus.toLowerCase();
            fila = `
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
        }
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
// INYECTA LOS HITOS DE INGRESO, REINGRESO Y BAJA EN LA LISTA DE PERIODOS
//==============================
function inyectarEventosHistorialPeriodos(listaPeriodos, empleado) {
    let result = [];
    
    // Clonar para evitar mutar el original
    $.each(listaPeriodos, function(idx, p) {
        result.push(Object.assign({}, p));
    });

    // Obtener los hitos laborales centralizados
    let hitos = obtenerHitosLaborales(empleado);

    // Mapear cada hito al formato de la tabla de periodos y agregarlo
    $.each(hitos, function(idx, h) {
        result.push({
            fecha_aniversario: h.fecha,
            anios_antiguedad: '---',
            nombre_version: h.observaciones,
            dias_derecho: 0,
            dias_tomados: 0,
            saldo: 0,
            estatus: h.tipo,
            tipo_evento: h.tipo
        });
    });

    // Ordenar cronológicamente (más antiguo a más reciente)
    result.sort(function(a, b) {
        return new Date(a.fecha_aniversario) - new Date(b.fecha_aniversario);
    });

    return result;
}

