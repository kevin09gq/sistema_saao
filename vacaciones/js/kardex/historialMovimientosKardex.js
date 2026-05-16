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
    $.post('../php/vacaciones_lft.php', {
        action: 'obtenerKardexEmpleado',
        id_empleado: empleado.id_empleado
    }, function (movimientos) {
        if (movimientos && movimientos.length > 0) {
            // Si hay datos en la base de datos, los usamos
            listaMovimientosGlobal = movimientos;
            mostrarPaginaKardex(1);
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
    // Necesitamos las leyes LFT para saber cuántos días le tocaban en cada año pasado
    $.post('../php/vacaciones_lft.php', { action: 'obtenerTodoLft' }, function (todasLasLeyes) {

        // Configuramos la fecha de ingreso ajustando la zona horaria
        let fechaIngreso = new Date(empleado.fecha_ingreso_final);
        fechaIngreso.setMinutes(fechaIngreso.getMinutes() + fechaIngreso.getTimezoneOffset());

        let hoy = new Date();
        let anioBase = fechaIngreso.getFullYear();
        let mesBase = fechaIngreso.getMonth();
        let diaBase = fechaIngreso.getDate();

        let movimientos = []; // Lista temporal para ir armando el historial

        // Fila inicial informativa (Saldo 0)
        movimientos.push({
            concepto: 'Vacaciones tomadas antes del registro del empleado',
            fecha_registro: empleado.fecha_ingreso_final,
            dias_tomados: 0,
            dias_derecho: 0,
            observaciones: 'Saldo inicial de apertura'
        });

        // BUCLE DE ANIVERSARIOS: Recorremos cada año hasta hoy
        for (let anios = 1; anios <= 100; anios++) {
            let fechaAniversario = new Date(anioBase + anios, mesBase, diaBase);
            if (fechaAniversario > hoy) break;

            //==============================
            // 1. BUSCAMOS LA LEY VIGENTE EN ESE ANIVERSARIO
            // Consultamos la tabla 'versiones_vacaciones_lft'
            //==============================
            let ley = null;
            $.each(todasLasLeyes, function (i, l) {
                // Convertimos las fechas de vigencia de la tabla a objetos de fecha
                let inicio = new Date(l.fecha_inicio_vigencia);
                let fin = l.fecha_fin_vigencia ? new Date(l.fecha_fin_vigencia) : new Date(9999, 11, 31);

                // REGLA: Si la fecha del aniversario cae dentro del inicio y fin de esta ley, ¡esta es la ley correcta!
                if (fechaAniversario >= inicio && fechaAniversario <= fin) {
                    ley = l;
                    return false; // Salimos del bucle porque ya encontramos la ley
                }
            });

            if (ley) {
                //==============================
                // 2. BUSCAMOS EL RANGO DE ANTIGÜEDAD DENTRO DE ESA LEY
                // Consultamos la tabla 'dias_vacaciones_lft' que viene dentro de la ley
                //==============================
                let rangoValido = null;
                $.each(ley.tabla_dias, function (i, r) {
                    // Obtenemos los años de inicio del rango (ej: 1, 5, 10...)
                    let inicioRango = parseInt(r.anios_antiguedad_inicio);

                    // REGLA: Si los años del empleado son mayores o iguales al inicio del rango, es un candidato.
                    // Ejemplo: Si el empleado tiene 3 años, entra en el rango que inicia en 1, pero no en el de 5.
                    if (anios >= inicioRango) {
                        // Nos quedamos con el rango que tenga el inicio más alto posible sin pasarse.
                        // Esto asegura que si tiene 7 años, tome el rango de "5 a 9" y no el de "1 a 4".
                        if (!rangoValido || inicioRango > parseInt(rangoValido.anios_antiguedad_inicio)) {
                            rangoValido = r;
                        }
                    }
                });

                //==============================
                // 3. ASIGNAMOS LOS DÍAS ENCONTRADOS
                // Una vez que tenemos el rango exacto, tomamos el valor de 'dias_vacaciones_correspondientes'
                //==============================
                if (rangoValido) {
                    movimientos.push({
                        concepto: 'Aniversario laboral al finalizar la jornada',
                        fecha_registro: fechaAniversario.toISOString().split('T')[0],
                        dias_derecho: parseInt(rangoValido.dias_vacaciones_correspondientes),
                        dias_tomados: 0
                    });
                }
            }

        }

        // CÁLCULO DEL PROPORCIONAL (REGLA DE 3)
        let ultimoAniversario = new Date(anioBase + (movimientos.length - 1), mesBase, diaBase);
        if (ultimoAniversario < hoy) {
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
                let diasProporcionales = (diffDays / 365) * parseInt(rangoProximo.dias_vacaciones_correspondientes);
                movimientos.push({
                    concepto: 'Proporción último año',
                    fecha_registro: hoy.toISOString().split('T')[0],
                    dias_derecho: diasProporcionales,
                    dias_tomados: 0,
                    observaciones: `Cálculo automático: ${diffDays} días transcurridos`
                });
            }
        }

        listaMovimientosGlobal = movimientos;
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

    // Calculamos el saldo que viene de las páginas anteriores
    let saldoAcumulado = 0;
    for (let j = 0; j < (pagina - 1) * filasPorPaginaKardex; j++) {
        let m = listaMovimientosGlobal[j];
        saldoAcumulado += (parseFloat(m.dias_derecho || 0) - parseFloat(m.dias_tomados || 0));
    }

    let inicio = (pagina - 1) * filasPorPaginaKardex;
    let fin = Math.min(inicio + filasPorPaginaKardex, total);
    let fragmento = listaMovimientosGlobal.slice(inicio, fin);

    $.each(fragmento, function (i, m) {
        let conDerecho = parseFloat(m.dias_derecho || 0);
        let tomadas = parseFloat(m.dias_tomados || 0);
        saldoAcumulado += (conDerecho - tomadas);

        let tipo = (conDerecho > 0) ? '<span class="type-abono">ABONO</span>' : '<span class="type-cargo">CARGO</span>';
        let diasTexto = (conDerecho > 0) ? `+${conDerecho.toFixed(3)}` : `-${tomadas.toFixed(3)}`;
        let claseDias = (conDerecho > 0) ? 'text-success' : 'text-danger';
        let periodoTexto = (m.fecha_inicio && m.fecha_fin) ? `${formatearFecha(m.fecha_inicio)} - ${formatearFecha(m.fecha_fin)}` : '---';

        let fila = `
            <tr>
                <td>${formatearFecha(m.fecha_registro)}</td>
                <td>
                    <strong>${m.concepto}</strong>
                    ${m.observaciones ? `<br><small class="text-muted">${m.observaciones}</small>` : ''}
                </td>
                <td class="text-center">${periodoTexto}</td>
                <td class="text-center">${tipo}</td>
                <td class="${claseDias} fw-bold text-end">${diasTexto}</td>
                <td class="fw-bold text-end">${saldoAcumulado.toFixed(3)}</td>
            </tr>`;
        $tbody.append(fila);
    });

    actualizarControlesPaginacionKardex(total);
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