function buscarDatos(claveEmpleado) {
    // Busca el empleado en jsonGlobal usando la clave
    if (!window.jsonGlobal || !window.jsonGlobal.departamentos) return null;

    let empleadoEncontrado = null;

    // Recorre todos los departamentos y empleados
    window.jsonGlobal.departamentos.forEach(depto => {
        (depto.empleados || []).forEach(emp => {
            // Compara la clave como string o número
            if (String(emp.clave) === String(claveEmpleado)) {
                empleadoEncontrado = emp;
            }
        });
    });

    if (!empleadoEncontrado) return null;

    // Imprime el objeto completo del empleado en consola
    console.log(empleadoEncontrado);

    // IMPORTANTE: Usa SIEMPRE los datos actuales del objeto para el modal
    establecerDatosModal(
        empleadoEncontrado.nombre,
        empleadoEncontrado.clave,
        empleadoEncontrado.neto_pagar,
        empleadoEncontrado.horas_totales,
        empleadoEncontrado.tiempo_total,
        empleadoEncontrado.conceptos || [],
        empleadoEncontrado.registros || []
    );
    return empleadoEncontrado;


}


function establecerDatosModal(nombre, clave, neto_pagar, horas_totales, tiempo_total, conceptos, registros) {

    //Muestra los datos en el modal "Trabajador"
    $('#campo-nombre').html('<strong>Nombre:</strong> ' + nombre);
    $('#campo-clave').html('<strong>Clave:</strong> ' + clave);
    $('#campo-neto-pagar').html('<strong>Neto a pagar:</strong> $' + neto_pagar);
    $('#campo-horas-totales').html('<strong>Horas totales:</strong> ' + horas_totales);
    $('#campo-tiempo-total').html('<strong>Tiempo total:</strong> ' + tiempo_total);


    //Muestra los datos en el modal "Concpetos"
    // Limpia el contenedor de conceptos antes de agregar nuevos
    $('#conceptos-cards').empty();

    // Recorre el arreglo de conceptos y crea las tarjetas
    conceptos.forEach(concepto => {
        // Crea el HTML para cada concepto
        const conceptoCard = `
            <div class="concepto-card">
                <div class="concepto-codigo">${concepto.codigo}</div>
                <div class="concepto-nombre">${concepto.nombre}</div>
                <input class="concepto-resultado" type="text" value="${concepto.resultado}">
            </div>
        `;
        // Agrega la tarjeta al contenedor
        $('#conceptos-cards').append(conceptoCard);
    });

    //Muestra los datos en el modal "Registros"
    $('#registros-cards').empty();
    registros.forEach(registro => {
        const valorComida = typeof registro.hora_comida !== "undefined" ? registro.hora_comida : "";
        const registroCard = `
            <li>
                <div class="registro-fecha">${registro.fecha}</div>
                <div class="registro-datos">
                    <div class="registro-row">
                        <label class="registro-label">Entrada:</label>
                        <input class="registro-input hora-mask entrada" type="text" value="${registro.entrada}">
                        <label class="registro-label">Salida:</label>
                        <input class="registro-input hora-mask salida" type="text" value="${registro.salida}">
                    </div>
                    <div class="registro-row">
                        <label class="registro-label">comida:</label>
                        <input class="registro-input solo-numeros" type="text" value="${valorComida}">
                        <label class="registro-label">Trabajado:</label>
                        <input class="registro-input hora-mask trabajado" type="text" value="${registro.trabajado}" readonly>
                    </div>
                </div>
            </li>
        `;
        $('#registros-cards').append(registroCard);
    });

    // Calcular horas totales y tiempo total
    let totalMinutos = 0;
    $('#registros-cards li').each(function () {
        const trabajado = $(this).find('.trabajado').val();
        if (trabajado && trabajado.length === 5) {
            totalMinutos += horaToMinutos(trabajado);
        }
    });
    // Horas totales en decimal (ej: 37.10)
    const horasTotalesDecimal = (totalMinutos / 60).toFixed(2);
    // Tiempo total en formato hh:mm
    const tiempoTotal = minutosToHora(totalMinutos);

    // Establece los valores en el modal
    $('#horas-totales').text(horasTotalesDecimal);
    $('#tiempo-total').text(tiempoTotal);

    // Aplica la máscara a todos los inputs de hora
    $('.hora-mask').inputmask({
        alias: "datetime",
        inputFormat: "HH:MM",
        placeholder: "00:00",
        clearIncomplete: true,
        showMaskOnHover: false,
        hourFormat: "24",
        onBeforePaste: function (pastedValue, opts) {
            return pastedValue.replace(/[^0-9:]/g, '');
        }
    });
    $('.solo-numeros').on('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Evento para actualizar trabajado al escribir en entrada, salida o comida
    $('#registros-cards').on('keyup change', '.entrada, .salida, .solo-numeros', function () {
        const $row = $(this).closest('li');
        const indexRegistro = $row.index();
        const entrada = $row.find('.entrada').val();
        const salida = $row.find('.salida').val();
        const comida = parseInt($row.find('.solo-numeros').val() || "0", 10);
        const clave = $('#campo-clave').text().replace('Clave:', '').trim();

        // --- Calcula y actualiza el campo trabajado en el input del registro ---
        let minutosTrabajado = 0;
        if (entrada.length === 5 && salida.length === 5) {
            const minEntrada = horaToMinutos(entrada);
            const minSalida = horaToMinutos(salida);
            minutosTrabajado = minSalida - minEntrada;
            if (!isNaN(comida) && comida > 0) {
                minutosTrabajado -= comida * 60;
            }
            if (minutosTrabajado < 0) minutosTrabajado = 0;
            $row.find('.trabajado').val(minutosToHora(minutosTrabajado));
        } else {
            $row.find('.trabajado').val('');
        }

        // Actualiza el objeto y todos los cálculos
        actualizarEmpleadoYRegistro(clave, indexRegistro, entrada, salida, comida);

        // --- Obtén los valores actualizados del objeto y actualiza el modal ---
        let empleadoActualizado = null;
        if (window.jsonGlobal && window.jsonGlobal.departamentos) {
            window.jsonGlobal.departamentos.forEach(depto => {
                (depto.empleados || []).forEach(emp => {
                    if (String(emp.clave) === String(clave)) {
                        empleadoActualizado = emp;
                    }
                });
            });
        }
        if (empleadoActualizado) {
            $('#horas-totales').text(empleadoActualizado.horas_totales);
            $('#tiempo-total').text(empleadoActualizado.tiempo_total);
        }
    });




}

/**
 * Actualiza el registro del día y todos los campos dependientes del empleado en jsonGlobal
 * cada vez que se modifica entrada, salida o comida en el modal.
 * - Solo recalcula sueldo_base y sueldo_extra si el empleado es de "Produccion 40 Libras".
 * - El resto de campos (neto_pagar, IMSS, ISR, infonavit) se actualizan para todos.
 */
function actualizarEmpleadoYRegistro(clave, indexRegistro, entrada, salida, comida) {
    if (!window.jsonGlobal || !window.jsonGlobal.departamentos) return;

    window.jsonGlobal.departamentos.forEach(depto => {
        (depto.empleados || []).forEach(emp => {
            if (String(emp.clave) === String(clave)) {
                // 1. Actualiza el registro del día con los nuevos valores
                if (emp.registros && emp.registros[indexRegistro]) {
                    emp.registros[indexRegistro].entrada = entrada;
                    emp.registros[indexRegistro].salida = salida;

                    // Calcula trabajado
                    let minutosTrabajado = 0;
                    if (entrada.length === 5 && salida.length === 5) {
                        const minEntrada = horaToMinutos(entrada);
                        const minSalida = horaToMinutos(salida);
                        minutosTrabajado = minSalida - minEntrada;
                        if (!isNaN(comida) && comida > 0) {
                            minutosTrabajado -= comida * 60;
                        }
                        if (minutosTrabajado < 0) minutosTrabajado = 0;
                        emp.registros[indexRegistro].trabajado = minutosToHora(minutosTrabajado);
                    } else {
                        emp.registros[indexRegistro].trabajado = "";
                    }

                    // Actualiza hora_comida solo si hay valor
                    if (!isNaN(comida) && comida > 0) {
                        emp.registros[indexRegistro].hora_comida = comida;
                    } else {
                        delete emp.registros[indexRegistro].hora_comida;
                    }
                }

                // 2. Recalcula horas_totales y tiempo_total sumando todos los registros
                let totalMinutos = 0;
                (emp.registros || []).forEach(reg => {
                    if (reg.trabajado && reg.trabajado.length === 5) {
                        totalMinutos += horaToMinutos(reg.trabajado);
                    }
                });
                emp.horas_totales = (totalMinutos / 60).toFixed(2);
                emp.tiempo_total = minutosToHora(totalMinutos);

                // 3. Solo si el departamento es "Produccion 40 Libras", recalcula sueldo_base y sueldo_extra
                const esProduccion40 = (depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS');

                if (esProduccion40 && window.rangosHorasJson) {
                    const minutosTotales = totalMinutos;
                    let sueldoBase = 0;
                    let sueldoFinal = 0;
                    let minutosExtras = 0;
                    let extra = 0;
                    let rangoNormal = null;
                    let rangoExtra = null;
                    let maxMinutosNormales = 0;

                    window.rangosHorasJson.forEach(rango => {
                        if (rango.tipo === "hora_extra") {
                            rangoExtra = rango;
                        } else {
                            if (rango.minutos > maxMinutosNormales) {
                                maxMinutosNormales = rango.minutos;
                            }
                            if (minutosTotales <= rango.minutos && !rangoNormal) {
                                rangoNormal = rango;
                            }
                        }
                    });

                    if (minutosTotales > maxMinutosNormales && rangoExtra) {
                        minutosExtras = minutosTotales - maxMinutosNormales;
                        extra = minutosExtras * rangoExtra.costo_por_minuto;
                        const ultimoRango = window.rangosHorasJson.find(r => r.minutos === maxMinutosNormales);
                        sueldoBase = ultimoRango ? ultimoRango.sueldo_base : 0;
                        sueldoFinal = sueldoBase + extra;
                    } else if (rangoNormal && minutosTotales === rangoNormal.minutos) {
                        sueldoBase = rangoNormal.sueldo_base;
                        sueldoFinal = sueldoBase;
                    } else if (rangoNormal && minutosTotales < rangoNormal.minutos) {
                        sueldoBase = minutosTotales * rangoNormal.costo_por_minuto;
                        sueldoFinal = sueldoBase;
                    }

                    emp.Minutos_trabajados = minutosTotales;
                    emp.Minutos_normales = Math.min(minutosTotales, maxMinutosNormales);
                    emp.Minutos_extra = minutosExtras;
                    emp.sueldo_base = Number(sueldoBase.toFixed(2));
                    emp.sueldo_extra = Number(extra.toFixed(2));
                    emp.neto_pagar = Number(sueldoFinal.toFixed(2));
                } else {
                    // Para otros departamentos, solo actualiza los minutos y neto_pagar (si tienes lógica especial, ponla aquí)
                    emp.Minutos_trabajados = totalMinutos;
                    emp.Minutos_normales = totalMinutos;
                    emp.Minutos_extra = 0;
                    // No recalcula sueldo_base ni sueldo_extra
                    // Si necesitas recalcular neto_pagar, hazlo aquí según tu lógica general
                }

                // Imprime el objeto actualizado del empleado en consola
                console.log(emp);
            }
        });
    });
}

// Convierte "hh:mm" a minutos
function horaToMinutos(hora) {
    if (!hora || hora.indexOf(':') === -1) return 0;
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

// Convierte minutos a "hh:mm"
function minutosToHora(minutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}
// Convierte minutos a "hh:mm"
function minutosToHora(minutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}

// Al final de establecerDatosModal, agrega el evento para guardar y actualizar la fila:
$(document).off('click', '#btn-guardar-detalles').on('click', '#btn-guardar-detalles', function () {
    const clave = $('#campo-clave').text().replace('Clave:', '').trim();

    // Busca el empleado actualizado en jsonGlobal
    let empActualizado = null, nombreDepartamento = '';
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    empActualizado = emp;
                    nombreDepartamento = depto.nombre.replace(/^\d+\s*/, '');
                }
            });
        });
    }
    if (!empActualizado) return;

    // Conceptos
    const conceptos = empActualizado.conceptos || [];
    const getConcepto = (codigo) => {
        const c = conceptos.find(c => c.codigo === codigo);
        return c ? parseFloat(c.resultado).toFixed(2) : '';
    };
    const infonavit = getConcepto('16');
    const isr = getConcepto('45');
    const imss = getConcepto('52');

    // Actualiza solo la fila correspondiente en la tabla
    const $fila = $(`#tabla-nomina-body tr[data-clave="${clave}"]`);
    if ($fila.length) {
        // Actualiza solo las celdas necesarias (ajusta los índices si tu tabla cambia)
        // [0]=#, [1]=nombre, [2]=departamento, [3]=sueldo_base, [6]=neto_pagar, [10]=infonavit, [11]=isr, [12]=imss
        $fila.find('td').eq(1).text(empActualizado.nombre);
        $fila.find('td').eq(2).text(nombreDepartamento);
        $fila.find('td').eq(3).text(empActualizado.sueldo_base);
        $fila.find('td').eq(4).text(empActualizado.sueldo_extra ?? '');
        $fila.find('td').eq(6).text(empActualizado.neto_pagar ?? '');
        $fila.find('td').eq(10).text(infonavit);
        $fila.find('td').eq(11).text(isr);
        $fila.find('td').eq(12).text(imss);
    }

    // Opcional: cerrar el modal
    $('#modal-detalles').fadeOut();
});




