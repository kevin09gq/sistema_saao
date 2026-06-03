//==================================================================================================
// GESTIÓN DEL HISTORIAL DE MOVIMIENTOS (KARDEX) CON PAGINACIÓN
// Este archivo controla la tabla inferior del Kardex, donde se ven abonos y cargos de días.
//==================================================================================================

let listaMovimientosGlobal = []; // Aquí guardamos todos los movimientos (reales o calculados)
let paginaActualKardex = 1;      // Controla en qué página estamos
const filasPorPaginaKardex = 5;  // Cantidad de registros que veremos por vez

//==============================
// CARGA EL HISTORIAL DEL KARDEX (MOVIMIENTOS)
// Punto de entrada: Intenta traer datos de la BD; si no hay, los genera matemáticamente.
//==============================
function cargarKardexVacaciones(empleado) {
    if (!empleado) return;

    // Pedimos al servidor los movimientos guardados en la tabla 'kardex_vacaciones'
    $.post('../php/infoEmpleados.php', {
        action: 'obtenerKardexEmpleado',
        id_empleado: empleado.id_empleado
    }, function (movimientos) {
        if (movimientos && movimientos.length > 0) {
            // Si hay datos en la base de datos, los usamos pero les agregamos el proporcional dinámico
            let listaModificada = [];

            // 1. Agregar fila inicial de "Vacaciones tomadas antes del registro del empleado" (Saldo inicial)
            listaModificada.push({
                num_ciclo: 1,
                concepto: 'Vacaciones tomadas antes del registro del empleado',
                fecha_registro: '', // Columna vacia para que no interfiera con el orden cronológico
                dias_movimiento: 0.000,
                saldo_resultante: 0.000,
                observaciones: 'Saldo inicial de apertura'
            });


            // 2. Agregar los movimientos reales de la base de datos tomados directamente
            $.each(movimientos, function (i, m) {
                if (m.concepto !== 'Vacaciones tomadas antes del registro del empleado') {
                    listaModificada.push({
                        num_ciclo: m.num_ciclo || 1,
                        concepto: m.concepto,
                        // Limpiamos la fecha para quedarnos solo con YYYY-MM-DD
                        fecha_registro: m.fecha_registro.split(' ')[0],
                        fecha_inicio: m.fecha_inicio,
                        fecha_fin: m.fecha_fin,
                        dias_movimiento: parseFloat(m.dias_movimiento),
                        saldo_resultante: parseFloat(m.saldo_resultante),
                        observaciones: m.observaciones
                    });
                }
            });

            // 3. Agregar la Proporción del Último Año si el empleado sigue activo
            let ultimoAnivFecha = new Date(empleado.fecha_ingreso_final);
            let numAniversarios = 0;

            $.each(listaModificada, function (i, m) {
                if (m.concepto.includes('Aniversario laboral')) {
                    numAniversarios++;
                    let f = new Date(m.fecha_registro);
                    if (f > ultimoAnivFecha) {
                        ultimoAnivFecha = f;
                    }
                }
            });

            let hoy = new Date();
            if (ultimoAnivFecha < hoy && empleado.id_status == 1) { // Solo si está activo
                let diffDays = Math.ceil(Math.abs(hoy - ultimoAnivFecha) / (1000 * 60 * 60 * 24));

                // Pedimos las leyes para saber cuántos días le tocarían el próximo año
                $.post('../php/vacaciones_lft.php', { action: 'obtenerTodoLft' }, function (todasLasLeyes) {
                    let proximoAnio = numAniversarios + 1;
                    let leyActual = todasLasLeyes[todasLasLeyes.length - 1]; // Ley vigente actual

                    let rangoProximo = null;
                    $.each(leyActual.tabla_dias, function (i, r) {
                        if (proximoAnio >= parseInt(r.anios_antiguedad_inicio)) {
                            if (!rangoProximo || parseInt(r.anios_antiguedad_inicio) > parseInt(rangoProximo.anios_antiguedad_inicio)) {
                                rangoProximo = r;
                            }
                        }
                    });

                    if (rangoProximo) {
                        //--------------------------------------------------------------------------
                        // DETECCIÓN DINÁMICA DE AÑO BISIESTO (366 DÍAS)
                        // Calculamos la fecha del próximo aniversario (exactamente 1 año después del último).
                        // La diferencia en días nos dirá si ese año específico tiene 365 o 366 días.
                        //--------------------------------------------------------------------------
                        let proximoAnivFecha = new Date(ultimoAnivFecha);
                        proximoAnivFecha.setFullYear(proximoAnivFecha.getFullYear() + 1);

                        let diasDelAnio = Math.round(Math.abs(proximoAnivFecha - ultimoAnivFecha) / (1000 * 60 * 60 * 24));

                        let diasProporcionales = (diffDays / diasDelAnio) * parseInt(rangoProximo.dias_vacaciones_correspondientes);

                        // Obtenemos el último saldo resultante de la lista modificada
                        let saldoUltimo = listaModificada[listaModificada.length - 1].saldo_resultante;

                        // Obtenemos el ciclo más reciente de la lista
                        let cicloActual = listaModificada[listaModificada.length - 1].num_ciclo || 1;

                        listaModificada.push({
                            num_ciclo: cicloActual,
                            concepto: 'Proporción último año',
                            fecha_registro: hoy.toISOString().split('T')[0],
                            dias_movimiento: diasProporcionales,
                            saldo_resultante: saldoUltimo + diasProporcionales,
                            observaciones: `Cálculo automático: ${diffDays} días transcurridos de un año de ${diasDelAnio} días`
                        });
                    }

                    listaMovimientosGlobal = inyectarYRecalcularKardex(listaModificada, empleado);
                    mostrarPaginaKardex(1);
                }, 'json').fail(function () {
                    // Si falla la LFT, igual mostramos lo que tenemos
                    listaMovimientosGlobal = inyectarYRecalcularKardex(listaModificada, empleado);
                    mostrarPaginaKardex(1);
                });
            } else {
                listaMovimientosGlobal = inyectarYRecalcularKardex(listaModificada, empleado);
                mostrarPaginaKardex(1);
            }
        } else {
            // SI LA TABLA ESTÁ VACÍA: Ejecutamos el motor de simulación para mostrar el pasado
            generarKardexSimulado(empleado);
        }
    }, 'json');
}

//==============================
// GENERA UN KARDEX SIMULADO BASADO EN ANIVERSARIOS
// Calcula el historial desde el ingreso del empleado usando las leyes LFT.
//==============================
function generarKardexSimulado(empleado) {
    $.post('../php/vacaciones_lft.php', { action: 'obtenerTodoLft' }, function (todasLasLeyes) {

        let fechaIngreso = new Date(empleado.fecha_ingreso_final);
        fechaIngreso.setMinutes(fechaIngreso.getMinutes() + fechaIngreso.getTimezoneOffset());

        let hoy = new Date();
        let anioBase = fechaIngreso.getFullYear();
        let mesBase = fechaIngreso.getMonth();
        let diaBase = fechaIngreso.getDate();

        let movimientos = []; // Lista temporal para ir armando el historial
        let saldoAcumulado = 0.000;

        // Fila inicial informativa (Saldo 0)
        movimientos.push({
            concepto: 'Vacaciones tomadas antes del registro del empleado',
            fecha_registro: empleado.fecha_ingreso_final,
            dias_movimiento: 0.000,
            saldo_resultante: 0.000,
            observaciones: 'Saldo inicial de apertura'
        });

        // BUCLE DE ANIVERSARIOS: Recorremos cada año hasta hoy
        for (let anios = 1; anios <= 100; anios++) {
            let fechaAniversario = new Date(anioBase + anios, mesBase, diaBase);
            if (fechaAniversario > hoy) break;

            // 1. BUSCAMOS LA LEY VIGENTE EN ESE ANIVERSARIO
            let ley = null;
            $.each(todasLasLeyes, function (i, l) {
                let inicio = new Date(l.fecha_inicio_vigencia);
                let fin = l.fecha_fin_vigencia ? new Date(l.fecha_fin_vigencia) : new Date(9999, 11, 31);
                if (fechaAniversario >= inicio && fechaAniversario <= fin) {
                    ley = l;
                    return false;
                }
            });

            if (ley) {
                // 2. BUSCAMOS EL RANGO DE ANTIGÜEDAD DENTRO DE ESA LEY
                let rangoValido = null;
                $.each(ley.tabla_dias, function (i, r) {
                    let inicioRango = parseInt(r.anios_antiguedad_inicio);
                    if (anios >= inicioRango) {
                        if (!rangoValido || inicioRango > parseInt(rangoValido.anios_antiguedad_inicio)) {
                            rangoValido = r;
                        }
                    }
                });

                // 3. ASIGNAMOS LOS DÍAS ENCONTRADOS Y SUMAMOS AL SALDO ACUMULADO
                if (rangoValido) {
                    let diasDerecho = parseInt(rangoValido.dias_vacaciones_correspondientes);
                    saldoAcumulado += diasDerecho;

                    movimientos.push({
                        concepto: 'Aniversario laboral al finalizar la jornada',
                        fecha_registro: fechaAniversario.toISOString().split('T')[0],
                        dias_movimiento: diasDerecho,
                        saldo_resultante: saldoAcumulado
                    });
                }
            }

        }

        // CÁLCULO DEL PROPORCIONAL (REGLA DE 3)
        let ultimoAniversario = new Date(anioBase + (movimientos.length - 1), mesBase, diaBase);
        if (ultimoAniversario < hoy && empleado.id_status == 1) {
            let diffDays = Math.ceil(Math.abs(hoy - ultimoAniversario) / (1000 * 60 * 60 * 24));
            let proximoAnio = movimientos.length;
            let leyActual = todasLasLeyes[todasLasLeyes.length - 1];

            let rangoProximo = null;
            $.each(leyActual.tabla_dias, function (i, r) {
                if (proximoAnio >= parseInt(r.anios_antiguedad_inicio)) {
                    if (!rangoProximo || parseInt(r.anios_antiguedad_inicio) > parseInt(rangoProximo.anios_antiguedad_inicio)) {
                        rangoProximo = r;
                    }
                }
            });

            if (rangoProximo) {
                //--------------------------------------------------------------------------
                // DETECCIÓN DINÁMICA DE AÑO BISIESTO (366 DÍAS)
                //--------------------------------------------------------------------------
                let proximoAnivFecha = new Date(ultimoAniversario);
                proximoAnivFecha.setFullYear(proximoAnivFecha.getFullYear() + 1);

                let diasDelAnio = Math.round(Math.abs(proximoAnivFecha - ultimoAniversario) / (1000 * 60 * 60 * 24));

                let diasProporcionales = (diffDays / diasDelAnio) * parseInt(rangoProximo.dias_vacaciones_correspondientes);
                saldoAcumulado += diasProporcionales;

                movimientos.push({
                    concepto: 'Proporción último año',
                    fecha_registro: hoy.toISOString().split('T')[0],
                    dias_movimiento: diasProporcionales,
                    saldo_resultante: saldoAcumulado,
                    observaciones: `Cálculo automático: ${diffDays} días transcurridos de un año de ${diasDelAnio} días`
                });
            }
        }

        listaMovimientosGlobal = inyectarYRecalcularKardex(movimientos, empleado);
        mostrarPaginaKardex(1);
    }, 'json');
}

//==============================
// RENDERIZA UNA PÁGINA DEL KARDEX
// Dibuja la tabla procesando colores, badges y saldos acumulados.
//==============================
function mostrarPaginaKardex(pagina) {
    paginaActualKardex = pagina;
    let total = listaMovimientosGlobal.length;
    let $tbody = $('#tbodyKardex').empty();

    if (total === 0) {
        $tbody.append('<tr><td colspan="6" class="text-center text-muted">No hay movimientos registrados</td></tr>');
        actualizarControlesPaginacionKardex(0);
        return;
    }

    let inicio = (pagina - 1) * filasPorPaginaKardex;
    let fin = Math.min(inicio + filasPorPaginaKardex, total);
    let fragmento = listaMovimientosGlobal.slice(inicio, fin);

    $.each(fragmento, function (i, m) {
        let fila = '';
        if (m.tipo_evento === 'INGRESO' || m.tipo_evento === 'REINGRESO' || m.tipo_evento === 'BAJA') {
            let badgeClass = '';
            if (m.tipo_evento === 'INGRESO') badgeClass = 'bg-primary';
            else if (m.tipo_evento === 'REINGRESO') badgeClass = 'bg-info text-white';
            else if (m.tipo_evento === 'BAJA') badgeClass = 'bg-danger';

            fila = `
                <tr style="background-color: #fafafa;">
                    <td>${formatearFecha(m.fecha_registro)}</td>
                    <td>
                        <span class="badge ${badgeClass} px-2 py-1 me-2">${m.tipo_evento}</span>
                        <strong>${m.concepto}</strong>
                        ${m.observaciones ? `<br><small class="text-muted">${m.observaciones}</small>` : ''}
                    </td>
                    <td class="text-center">---</td>
                    <td class="text-center">---</td>
                    <td class="text-end">---</td>
                    <td class="text-end">---</td>
                </tr>`;
        } else {
            let valorMov = parseFloat(m.dias_movimiento || 0);
            let saldoResultante = parseFloat(m.saldo_resultante || 0);

            let tipo = (valorMov >= 0) ? '<span class="type-abono">ABONO</span>' : '<span class="type-cargo">CARGO</span>';
            let diasTexto = (valorMov >= 0) ? `+${valorMov.toFixed(3)}` : `-${Math.abs(valorMov).toFixed(3)}`;
            let claseDias = (valorMov >= 0) ? 'text-success' : 'text-danger';
            let periodoTexto = (m.fecha_inicio && m.fecha_fin) ? `${formatearFecha(m.fecha_inicio)} - ${formatearFecha(m.fecha_fin)}` : '---';

            fila = `
                <tr>
                    <td>${formatearFecha(m.fecha_registro)}</td>
                    <td>
                        <strong>${m.concepto}</strong>
                        ${m.observaciones ? `<br><small class="text-muted">${m.observaciones}</small>` : ''}
                    </td>
                    <td class="text-center">${periodoTexto}</td>
                    <td class="text-center">${tipo}</td>
                    <td class="${claseDias} fw-bold text-end">${diasTexto}</td>
                    <td class="fw-bold text-end">${saldoResultante.toFixed(3)}</td>
                </tr>`;
        }
        $tbody.append(fila);
    });

    actualizarControlesPaginacionKardex(total);
    if (typeof actualizarCalendarioConDatos === 'function') {
        actualizarCalendarioConDatos();
    }
}

//==============================
// ACTUALIZA LOS CONTROLES DE PAGINACIÓN DEL KARDEX
//==============================
function actualizarControlesPaginacionKardex(total) {
    let numPaginas = Math.ceil(total / filasPorPaginaKardex);
    let $info = $('#infoPaginacionKardex');
    let $lista = $('#listaPaginacionKardex').empty();

    if (total === 0) {
        $info.html('Mostrando 0 a 0 de 0 movimientos');
        return;
    }

    let desde = (paginaActualKardex - 1) * filasPorPaginaKardex + 1;
    let hasta = Math.min(paginaActualKardex * filasPorPaginaKardex, total);
    $info.html(`Mostrando <strong>${desde}</strong> a <strong>${hasta}</strong> de <strong>${total}</strong> movimientos`);

    $lista.append(`<li class="page-item ${(paginaActualKardex === 1) ? 'disabled' : ''}">
        <a class="page-link" href="javascript:void(0)" onclick="mostrarPaginaKardex(${paginaActualKardex - 1})">
            <i class="bi bi-chevron-left"></i>
        </a>
    </li>`);

    for (let i = 1; i <= numPaginas; i++) {
        $lista.append(`<li class="page-item ${(i === paginaActualKardex) ? 'active' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="mostrarPaginaKardex(${i})">${i}</a>
        </li>`);
    }

    $lista.append(`<li class="page-item ${(paginaActualKardex === numPaginas) ? 'disabled' : ''}">
        <a class="page-link" href="javascript:void(0)" onclick="mostrarPaginaKardex(${paginaActualKardex + 1})">
            <i class="bi bi-chevron-right"></i>
        </a>
    </li>`);
}

//==============================
// OBTIENE EL CICLO LABORAL CORRESPONDIENTE A UNA FECHA
//==============================
function obtenerCicloPorFecha(fecha, empleado) {
    if (!empleado.historial_reingresos || empleado.historial_reingresos.length === 0) {
        return 1;
    }
    let ciclo = 1;
    for (let i = 0; i < empleado.historial_reingresos.length; i++) {
        let re = empleado.historial_reingresos[i];
        if (re.fecha_reingreso && re.fecha_reingreso !== '0000-00-00') {
            if (new Date(fecha) >= new Date(re.fecha_reingreso)) {
                ciclo = i + 2;
            }
        }
    }
    return ciclo;
}

//==============================
// INYECTA LOS HITOS LABORALES Y RECALCULA EL SALDO RESULTANTE POR CICLO
//==============================
function inyectarYRecalcularKardex(movimientos, empleado) {
    let result = [];
    
    // Clonar para evitar mutar el original
    $.each(movimientos, function(idx, m) {
        result.push(Object.assign({}, m));
    });

    // Obtener los hitos laborales
    let hitos = obtenerHitosLaborales(empleado);

    // Mapear cada hito al formato de la tabla de kardex y agregarlo
    $.each(hitos, function(idx, h) {
        result.push({
            concepto: h.concepto,
            fecha_registro: h.fecha,
            fecha_inicio: '',
            fecha_fin: '',
            dias_movimiento: 0.000,
            saldo_resultante: 0.000,
            observaciones: h.observaciones,
            tipo_evento: h.tipo
        });
    });

    // Ordenar cronológicamente
    result.sort(function(a, b) {
        // El saldo inicial siempre va al inicio
        if (a.concepto === 'Vacaciones tomadas antes del registro del empleado') return -1;
        if (b.concepto === 'Vacaciones tomadas antes del registro del empleado') return 1;

        // Si alguno no tiene fecha, lo dejamos al inicio (después del saldo inicial)
        if (!a.fecha_registro) return -1;
        if (!b.fecha_registro) return 1;

        let dateA = new Date(a.fecha_registro);
        let dateB = new Date(b.fecha_registro);
        if (dateA - dateB !== 0) {
            return dateA - dateB;
        }

        // Si la fecha es idéntica, priorizamos hitos
        let getPriority = function(item) {
            if (item.tipo_evento === 'INGRESO' || item.tipo_evento === 'REINGRESO') return 1;
            if (item.tipo_evento === 'BAJA') return 3;
            return 2;
        };
        return getPriority(a) - getPriority(b);
    });

    // Recalcular saldo resultante por ciclo
    let saldoAcumuladoPorCiclo = {};
    $.each(result, function(idx, m) {
        let ciclo = m.num_ciclo;
        if (!ciclo) {
            if (m.fecha_registro) {
                ciclo = obtenerCicloPorFecha(m.fecha_registro, empleado);
            } else {
                ciclo = 1;
            }
            m.num_ciclo = ciclo;
        }
        
        if (saldoAcumuladoPorCiclo[ciclo] === undefined) {
            saldoAcumuladoPorCiclo[ciclo] = 0.000;
        }
        
        saldoAcumuladoPorCiclo[ciclo] += parseFloat(m.dias_movimiento || 0);
        m.saldo_resultante = saldoAcumuladoPorCiclo[ciclo];
    });

    return result;
}