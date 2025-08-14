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




    // IMPORTANTE: Usa SIEMPRE los datos actuales del objeto para el modal
    establecerDatosModal(
        empleadoEncontrado.nombre,
        empleadoEncontrado.clave,
        empleadoEncontrado.neto_pagar,
        empleadoEncontrado.horas_totales,
        empleadoEncontrado.tiempo_total,
        empleadoEncontrado.conceptos || [],
        empleadoEncontrado.registros || [],
        empleadoEncontrado.sueldo_base,


    );

    actualizarInformacionEmpleado(empleadoEncontrado.clave);
    establecerDatosPercepciones(empleadoEncontrado);
    establecerDatosConceptos(empleadoEncontrado.conceptos || []);
    establecerDatosDeducciones(empleadoEncontrado);

    return empleadoEncontrado;


}

// Función para establecer los datos del modal
function establecerDatosModal(nombre, clave, neto_pagar, horas_totales, tiempo_total, conceptos, registros) {

    // Actualiza la información básica del empleado en el modal
    $('#campo-clave').text(clave);

    //Muestra los datos en el modal "Trabajador"


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
    (registros || []).forEach(registro => {
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
                        <input class="registro-input solo-numeros" type="text" value="${valorComida ?? ''}">
                        <label class="registro-label">Trabajado:</label>
                        <input class="registro-input hora-mask trabajado" type="text" value="${registro.trabajado}" readonly>
                    </div>
                </div>
            </li>
        `;
        $('#registros-cards').append(registroCard);
    });

    // Asegurar valores por defecto antes de cálculos
    const noRegistros = !registros || registros.length === 0;
    $('#horas-totales').text(noRegistros ? '0' : (horas_totales || '0'));
    $('#tiempo-total').text(noRegistros ? '00:00' : (tiempo_total || '00:00'));

    formatoHora();

    // (Re)iniciar listeners de cálculo
    setTimeout(() => {
        calcularHorasTrabajadas();
    }, 200);
}


// Función para aplicar el formato de hora a los inputs del modal
function formatoHora() {
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

}

// Evento para actualizar trabajado al escribir en entrada, salida o comida1
function calcularHorasTrabajadas() {
    // Evitar handlers duplicados al reabrir/cambiar de empleado
    $('#registros-cards').off('keyup change', '.entrada, .salida, .solo-numeros');

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

        // Calcular horas totales y tiempo total
        let totalMinutos = 0;
        $('#registros-cards li').each(function () {
            const trabajado = $(this).find('.trabajado').val();
            if (trabajado && trabajado.length === 5) {
                totalMinutos += horaToMinutos(trabajado);
            }
        });
        // Horas totales en decimal (ej: 37.10)
        let horasTotalesDecimal = (totalMinutos / 60);
        horasTotalesDecimal = isNaN(horasTotalesDecimal) ? '' : horasTotalesDecimal.toFixed(2);
        // Tiempo total en formato hh:mm
        const tiempoTotal = minutosToHora(totalMinutos);

        // Establece los valores en el modal
        $('#horas-totales').text(horasTotalesDecimal === '' ? '0' : horasTotalesDecimal);
        $('#tiempo-total').text(tiempoTotal || '00:00');

        // Obtener el empleado actual usando la clave
        let empleado = null;
        if (window.jsonGlobal && window.jsonGlobal.departamentos) {
            window.jsonGlobal.departamentos.forEach(depto => {
                (depto.empleados || []).forEach(emp => {
                    if (String(emp.clave) === String(clave)) {
                        empleado = emp;
                    }
                });
            });
        }

        // Si se encontró el empleado, recalcula y actualiza los valores
        if (empleado) {
            // Actualiza los registros temporales para el cálculo
            let registrosActualizados = [];
            $('#registros-cards li').each(function () {
                const $li = $(this);
                const entrada = $li.find('.entrada').val();
                const salida = $li.find('.salida').val();
                const comida = parseInt($li.find('.solo-numeros').val()) || 0;
                const trabajado = $li.find('.trabajado').val();
                registrosActualizados.push({
                    entrada: entrada,
                    salida: salida,
                    hora_comida: comida,
                    trabajado: trabajado
                });
            });

            // Actualiza los datos del empleado
            empleado.registros = registrosActualizados;
            empleado.tiempo_total = tiempoTotal;
            empleado.horas_totales = horasTotalesDecimal;

            // Recalcula los campos de sueldo
            if (typeof calcularCamposEmpleado === "function") {
                calcularCamposEmpleado(empleado);
            }

            // Actualiza los inputs de percepciones con los valores recalculados
            setTimeout(() => {
                const sueldoBase = empleado.sueldo_base;
                const sueldoExtra = empleado.sueldo_extra;
                
                $("#mod-sueldo-neto").val(isNaN(sueldoBase) ? 0 : sueldoBase);
                $("#mod-sueldo-extra").val(isNaN(sueldoExtra) ? 0 : sueldoExtra);
            }, 100);
        }
    });
}

// Función para actualizar la información del empleado en jsonGlobal
function actualizarInformacionEmpleado(claveEncontrada) {
    // Elimina eventos previos para evitar acumulación y lentitud
    $("#btn-guardar-detalles").off('click');
    $("#btn-guardar-detalles").click(function (e) {
        e.preventDefault();

        const clave = claveEncontrada;

        // Buscar el empleado en jsonGlobal
        let empleadoEncontrado = null;
        let departamentoEncontrado = null;

        if (window.jsonGlobal && window.jsonGlobal.departamentos) {
            window.jsonGlobal.departamentos.forEach(depto => {
                (depto.empleados || []).forEach(emp => {
                    if (String(emp.clave) === String(clave)) {
                        empleadoEncontrado = emp;
                        departamentoEncontrado = depto;
                    }
                });
            });
        }

        if (!empleadoEncontrado) {

            return;
        }

        // Recopilar todos los registros actualizados del modal
        const registrosActualizados = [];
        $('#registros-cards li').each(function () {
            const $li = $(this);
            const fecha = $li.find('.registro-fecha').text();
            const entrada = $li.find('.entrada').val();
            const salida = $li.find('.salida').val();
            // --- CORREGIDO: Si el campo está vacío o NaN, pon 0 ---
            let comida = parseInt($li.find('.solo-numeros').val());
            comida = isNaN(comida) ? '' : comida;
            const trabajado = $li.find('.trabajado').val();

            // Crear objeto de registro actualizado
            const registroActualizado = {
                fecha: fecha,
                entrada: entrada,
                salida: salida,
                hora_comida: comida, // Agregar hora de comida
                trabajado: trabajado
            };

            registrosActualizados.push(registroActualizado);
        });

        // Actualizar registros del empleado en jsonGlobal
        empleadoEncontrado.registros = registrosActualizados;

        // Calcular nuevo tiempo total sumando todos los registros
        let totalMinutos = 0;
        registrosActualizados.forEach(registro => {
            if (registro.trabajado && registro.trabajado.length === 5) {
                totalMinutos += horaToMinutos(registro.trabajado);
            }
        });

        // Actualizar tiempo_total y horas_totales
        empleadoEncontrado.tiempo_total = totalMinutos > 0 ? minutosToHora(totalMinutos) : '';
        empleadoEncontrado.horas_totales = totalMinutos > 0 ? (totalMinutos / 60).toFixed(2) : '';

        // Recalcular todos los campos del empleado usando la función existente
        calcularCamposEmpleado(empleadoEncontrado);

        // Obtener el sueldo base y extra del modal
        const sueldoBase = parseFloat($("#mod-sueldo-neto").val());
        const sueldoExtra = parseFloat($("#mod-sueldo-extra").val());
        
        empleadoEncontrado.sueldo_base = isNaN(sueldoBase) ? 0 : sueldoBase;
        empleadoEncontrado.sueldo_extra = isNaN(sueldoExtra) ? 0 : sueldoExtra;

        // Obtener el incentivo si está habilitado
        let incentivo = 0;
        if ($("#mod-incentivo-check").is(":checked")) {
            const incentivoValor = parseFloat($("#mod-incentivo-monto").val());
            incentivo = isNaN(incentivoValor) ? 0 : incentivoValor;
        }

        // Agregar el incentivo al empleado
        empleadoEncontrado.incentivo = incentivo;

        // Actualizar también en empleadosOriginales para mantener consistencia
        if (window.empleadosOriginales) {
            const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
            if (empleadoOriginal) {
                // Actualizar todos los campos
                empleadoOriginal.registros = registrosActualizados;
                empleadoOriginal.tiempo_total = empleadoEncontrado.tiempo_total;
                empleadoOriginal.horas_totales = empleadoEncontrado.horas_totales;
                empleadoOriginal.Minutos_trabajados = empleadoEncontrado.Minutos_trabajados;
                empleadoOriginal.Minutos_normales = empleadoEncontrado.Minutos_normales;
                empleadoOriginal.Minutos_extra = empleadoEncontrado.Minutos_extra;
                empleadoOriginal.sueldo_base = empleadoEncontrado.sueldo_base;
                empleadoOriginal.sueldo_extra = empleadoEncontrado.sueldo_extra;
                empleadoOriginal.incentivo = empleadoEncontrado.incentivo;
            }
        }

        // Actualizar empleadosFiltrados si el empleado está en la lista filtrada
        if (empleadosFiltrados) {
            const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
            if (empleadoFiltrado) {
                empleadoFiltrado.registros = registrosActualizados;
                empleadoFiltrado.tiempo_total = empleadoEncontrado.tiempo_total;
                empleadoFiltrado.horas_totales = empleadoEncontrado.horas_totales;
                empleadoFiltrado.Minutos_trabajados = empleadoEncontrado.Minutos_trabajados;
                empleadoFiltrado.Minutos_normales = empleadoEncontrado.Minutos_normales;
                empleadoFiltrado.Minutos_extra = empleadoEncontrado.Minutos_extra;
                empleadoFiltrado.sueldo_base = empleadoEncontrado.sueldo_base;
                empleadoFiltrado.sueldo_extra = empleadoEncontrado.sueldo_extra;
                empleadoFiltrado.incentivo = empleadoEncontrado.incentivo;
            }
        }

        // Actualizar solo la fila del empleado específico
        actualizarFilaEmpleado(empleadoEncontrado);

        // Empleado actualizado exitosamente

        // Cerrar el modal
        $('#modal-detalles').fadeOut();
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

// Función para actualizar solo la fila del empleado específico
function actualizarFilaEmpleado(empleado) {
    // Buscar la fila en la tabla por la clave del empleado
    const $fila = $(`#tabla-nomina-body tr[data-clave="${empleado.clave}"]`);

    if ($fila.length > 0) {
        // Obtener conceptos
        const conceptos = empleado.conceptos || [];
        const getConcepto = (codigo) => {
            const c = conceptos.find(c => c.codigo === codigo);
            return c ? parseFloat(c.resultado).toFixed(2) : '';
        };
        const infonavit = getConcepto('16');
        const isr = getConcepto('45');
        const imss = getConcepto('52');

        // Obtener el incentivo si existe
        const incentivo = empleado.incentivo ? empleado.incentivo.toFixed(2) : '';

        // Función para mostrar cadena vacía en lugar de 0, NaN o valores vacíos
        const mostrarValor = (valor) => {
            if (valor === 0 || valor === '0' || valor === '' || valor === null || valor === undefined || isNaN(valor)) {
                return '';
            }
            return valor;
        };

        // Actualizar solo las celdas que pueden cambiar
        $fila.find('td:eq(3)').text(mostrarValor(empleado.sueldo_base)); // Sueldo base
        $fila.find('td:eq(4)').text(mostrarValor(incentivo)); // Incentivo
        $fila.find('td:eq(5)').text(mostrarValor(empleado.sueldo_extra)); // Sueldo extra
        $fila.find('td:eq(6)').text(mostrarValor(empleado.neto_pagar)); // Neto a pagar
        $fila.find('td:eq(7)').text(mostrarValor(empleado.prestamo)); // Préstamo
        $fila.find('td:eq(8)').text(mostrarValor(empleado.inasistencias_descuento)); // Inasistencias
        $fila.find('td:eq(9)').text(mostrarValor(empleado.uniformes)); // Uniformes
        $fila.find('td:eq(10)').text(mostrarValor(infonavit)); // INFONAVIT
        $fila.find('td:eq(11)').text(mostrarValor(isr)); // ISR
        $fila.find('td:eq(12)').text(mostrarValor(imss)); // IMSS
        $fila.find('td:eq(13)').text(mostrarValor(empleado.checador)); // Checador
        $fila.find('td:eq(14)').text(mostrarValor(empleado.fa_gafet_cofia)); // F.A/GAFET/COFIA
        
    }
}


/**** MODIFICAR DETALLES ****/

// Función para establzer los datos en Percepciones

function establecerDatosPercepciones(empleado) {
    // Limpiar inputs antes de establecer valores
    $("#mod-sueldo-neto").val(0);
    $("#mod-sueldo-extra").val(0);
    
    // Establecer valores solo si existen y no son NaN
    if (empleado.sueldo_base && !isNaN(empleado.sueldo_base)) {
        $("#mod-sueldo-neto").val(empleado.sueldo_base);
    }
    if (empleado.sueldo_extra && !isNaN(empleado.sueldo_extra)) {
        $("#mod-sueldo-extra").val(empleado.sueldo_extra);
    }

    // Agregar eventos para actualizar sueldos en tiempo real (solo jsonGlobal, no tabla)
    $("#mod-sueldo-neto").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const sueldoBase = parseFloat($(this).val());
        actualizarSueldoEnJsonGlobal(clave, 'sueldo_base', sueldoBase);
    });

    $("#mod-sueldo-extra").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const sueldoExtra = parseFloat($(this).val());
        actualizarSueldoEnJsonGlobal(clave, 'sueldo_extra', sueldoExtra);
    });
}


function establecerDatosConceptos(conceptos) {
    // Limpiar todos los inputs antes de establecer nuevos valores
    $("#mod-isr").val(0);
    $("#mod-imss").val(0);
    $("#mod-infonavit").val(0);

    // Buscar cada concepto por su código y establecer su valor en el input correspondiente
    conceptos.forEach(concepto => {
        if (concepto.codigo === '45') {
            $("#mod-isr").val(concepto.resultado);
        }
        if (concepto.codigo === '52') {
            $("#mod-imss").val(concepto.resultado);
        }
        if (concepto.codigo === '16') { // Ajusta este código según tu JSON
            $("#mod-infonavit").val(concepto.resultado);
        }
    });

    // Agregar eventos para actualizar conceptos en tiempo real (solo jsonGlobal, no tabla)
    $("#mod-isr").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const isr = parseFloat($(this).val());
        actualizarConceptoEnJsonGlobal(clave, '45', isr); // 45 es el código del ISR
    });

    $("#mod-imss").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const imss = parseFloat($(this).val());
        actualizarConceptoEnJsonGlobal(clave, '52', imss); // 52 es el código del IMSS
    });

    $("#mod-infonavit").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const infonavit = parseFloat($(this).val());
        actualizarConceptoEnJsonGlobal(clave, '16', infonavit); // 16 es el código del INFONAVIT
    });

}

function establecerDatosDeducciones(empleado) {
    // Limpiar todos los inputs antes de establecer nuevos valores
    $("#mod-tarjeta").val(0);
    $("#mod-prestamo").val(0);
    $("#mod-uniformes").val(0);
    $("#mod-checador").val(0);
    $("#mod-fa-gafet-cofia").val(0);
    $("#mod-inasistencias-horas").val(0);
    $("#mod-inasistencias-descuento").val(0);

    // Establecer los valores del empleado (si existen)
    $("#mod-tarjeta").val(empleado.neto_pagar || 0);
    $("#mod-prestamo").val(empleado.prestamo || 0);
    $("#mod-uniformes").val(empleado.uniformes || 0);
    $("#mod-checador").val(empleado.checador || 0);
    $("#mod-fa-gafet-cofia").val(empleado.fa_gafet_cofia || 0);
    $("#mod-inasistencias-horas").val(empleado.inasistencias_horas || 0);
    $("#mod-inasistencias-descuento").val(empleado.inasistencias_descuento || 0);

    // Eventos para actualizar deducciones en tiempo real (solo jsonGlobal, no tabla)
    $("#mod-tarjeta").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const neto_pagar = parseFloat($(this).val());
        actualizarDeduccionEnJsonGlobal(clave, 'neto_pagar', neto_pagar);
    });

    $("#mod-prestamo").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const prestamo = parseFloat($(this).val());
        actualizarDeduccionEnJsonGlobal(clave, 'prestamo', isNaN(prestamo) ? 0 : prestamo);
    });

    $("#mod-uniformes").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const uniformes = parseFloat($(this).val());
        actualizarDeduccionEnJsonGlobal(clave, 'uniformes', isNaN(uniformes) ? 0 : uniformes);
    });

    $("#mod-checador").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const checador = parseFloat($(this).val());
        actualizarDeduccionEnJsonGlobal(clave, 'checador', isNaN(checador) ? 0 : checador);
    });

    $("#mod-fa-gafet-cofia").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const faGafetCofia = parseFloat($(this).val());
        actualizarDeduccionEnJsonGlobal(clave, 'fa_gafet_cofia', isNaN(faGafetCofia) ? 0 : faGafetCofia);
    });

    // Evento para calcular el descuento por inasistencias
    $("#mod-inasistencias-horas").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const horas = parseFloat($(this).val());

        // Obtener el costo por minuto de las horas extra para el cálculo de inasistencias
        let costoPorMinuto = 0;
        if (window.rangosHorasJson && window.rangosHorasJson.length > 0) {
            // Buscar el rango de horas extra
            const rangoExtra = window.rangosHorasJson.find(rango => rango.tipo === "hora_extra");
            if (rangoExtra) {
                costoPorMinuto = rangoExtra.costo_por_minuto;
            } else {
                // Si no encuentra horas extra, usar el último rango
                costoPorMinuto = window.rangosHorasJson[window.rangosHorasJson.length - 1].costo_por_minuto || 0;
            }
        }

        const descuento = horas * 60 * costoPorMinuto; // Usar costo_por_minuto del archivo
        $("#mod-inasistencias-descuento").val(descuento.toFixed(2));

        // Actualizar también en jsonGlobal
        actualizarDeduccionEnJsonGlobal(clave, 'inasistencias_horas', isNaN(horas) ? 0 : horas);
        actualizarDeduccionEnJsonGlobal(clave, 'inasistencias_descuento', isNaN(descuento) ? 0 : descuento);
    });

    // Evento para el descuento por inasistencias (actualización manual)
    $("#mod-inasistencias-descuento").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const descuento = parseFloat($(this).val());
        actualizarDeduccionEnJsonGlobal(clave, 'inasistencias_descuento', isNaN(descuento) ? 0 : descuento);
    });


}


// Función para actualizar sueldo solo en jsonGlobal (sin afectar tabla)
function actualizarSueldoEnJsonGlobal(clave, tipo, valor) {
    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    emp[tipo] = valor;
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal[tipo] = valor;
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado[tipo] = valor;
        }
    }


}

// Función para actualizar deducciones solo en jsonGlobal (sin afectar tabla)
function actualizarDeduccionEnJsonGlobal(clave, tipoDeduccion, valor) {
    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    // Agregar la deducción como propiedad directa del empleado
                    emp[tipoDeduccion] = valor;
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal[tipoDeduccion] = valor;
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado[tipoDeduccion] = valor;
        }
    }
}

// Función para actualizar conceptos solo en jsonGlobal (sin afectar tabla)
function actualizarConceptoEnJsonGlobal(clave, codigoConcepto, valor) {
    // Función auxiliar para obtener el nombre del concepto
    const getConceptoNombre = (codigo) => {
        const nombres = {
            '45': 'I.S.R. (mes)',
            '52': 'I.M.S.S.',
            '16': 'Préstamo infonavit (CF)'
        };
        return nombres[codigo] || `Concepto ${codigo}`;
    };

    // Función auxiliar para actualizar o crear concepto en un empleado
    const actualizarConceptoEnEmpleado = (empleado) => {
        // Asegurar que el array conceptos existe
        if (!empleado.conceptos) {
            empleado.conceptos = [];
        }

        // Buscar el concepto existente
        let concepto = empleado.conceptos.find(c => c.codigo === codigoConcepto);

        if (concepto) {
            // Actualizar concepto existente
            concepto.resultado = valor;
        } else {
            // Crear nuevo concepto si no existe
            concepto = {
                codigo: codigoConcepto,
                nombre: getConceptoNombre(codigoConcepto),
                resultado: valor
            };
            empleado.conceptos.push(concepto);
        }
    };

    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    actualizarConceptoEnEmpleado(emp);
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            actualizarConceptoEnEmpleado(empleadoOriginal);
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            actualizarConceptoEnEmpleado(empleadoFiltrado);
        }
    }


}
