$(document).ready(function () {

    // Mapeo de checkboxes a nombres de departamentos (parciales para buscar)
    const DEPARTAMENTOS_MAP = {
        'checkBoxProduccion': 'Produccion',
        'checkBoxProduccion40Libras': 'Produccion 40 Libras',
        'checkBoxProduccion10Libras': 'Produccion 10 Libras'
    };

    // Event listener para guardar horario variable
    $(document).on('click', '#btn-guardar-horario-variable', function () {
        
        // 1. Leer los datos del formulario
        const horariosFormulario = leerHorariosDelFormulario();
        
        if (horariosFormulario.length === 0) {
            Swal.fire({
                title: "Error",
                text: "No se ha ingresado ningún horario válido",
                icon: "error"
            });
            return;
        }

        // 2. Obtener departamentos seleccionados
        const departamentosSeleccionados = obtenerDepartamentosSeleccionados();
        
        if (departamentosSeleccionados.length === 0) {
            Swal.fire({
                title: "Error",
                text: "Debe seleccionar al menos un departamento",
                icon: "warning"
            });
            return;
        }

        // 3. Cargar datos del sessionStorage
        let jsonUnido;
        try {
            const stored = sessionStorage.getItem('reloj-ocho');
            if (!stored) {
                Swal.fire({
                    title: "Error",
                    text: "No hay datos cargados. Primero debe procesar los archivos Excel.",
                    icon: "error"
                });
                return;
            }
            jsonUnido = JSON.parse(stored);
        } catch (e) {
            console.error('Error al parsear sessionStorage:', e);
            return;
        }

        // 4. Aplicar horarios a los empleados correspondientes
        let empleadosActualizados = 0;
        
        (jsonUnido.departamentos || []).forEach(depto => {
            // Verificar si este departamento está seleccionado
            const deptoNombreLimpio = limpiarNombreDepto(depto.nombre);
            const estaSeleccionado = departamentosSeleccionados.some(seleccionado => 
                deptoNombreLimpio.includes(seleccionado)
            );
            
            if (!estaSeleccionado) return;
            
            // Buscar empleados con horario_fijo = 0 y aplicar_horario_variable = true
            (depto.empleados || []).forEach(emp => {
                if (emp.horario_fijo === 0 && emp.aplicar_horario_variable === true) {
                    // Aplicar el horario general a este empleado
                    emp.horario = JSON.parse(JSON.stringify(horariosFormulario)); // Copia profunda
                    empleadosActualizados++;
                    console.log(`Horario aplicado a: ${emp.nombre}`);
                }
            });
        });

        if (empleadosActualizados === 0) {
            Swal.fire({
                title: "Aviso",
                text: "No se encontraron empleados con horario variable en los departamentos seleccionados",
                icon: "info"
            });
            return;
        }

        // 5. Re-procesar registros de los empleados actualizados
        reprocesarRegistrosEmpleados(jsonUnido);

        // 6. Guardar en sessionStorage
        try {
            sessionStorage.setItem('reloj-ocho', JSON.stringify(jsonUnido));
        } catch (e) {
            console.error('Error al guardar en sessionStorage:', e);
            Swal.fire({
                title: "Error",
                text: "Error al guardar los cambios",
                icon: "error"
            });
            return;
        }

        // 7. Cerrar modal y actualizar interfaz
        $('#horariosModal').modal('hide');
        
        Swal.fire({
            title: "Horarios guardados",
            text: `Se actualizaron ${empleadosActualizados} empleados`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });

        // Disparar evento para actualizar la interfaz
        $(document).trigger('reloj-data-updated');
    });

    // Event listener para limpiar el modal al cerrarse
    $('#horariosModal').on('hidden.bs.modal', function () {
        limpiarFormularioModal();
    });

    // Event listener para convertir a mayúsculas automáticamente al escribir en el campo día
    $(document).on('input', 'input[name="horario_variable_dia[]"]', function () {
        const $input = $(this);
        const cursorPos = $input[0].selectionStart;
        const valorOriginal = $input.val();
        const valorMayusculas = valorOriginal.toUpperCase();
        
        if (valorOriginal !== valorMayusculas) {
            $input.val(valorMayusculas);
            // Restaurar la posición del cursor
            $input[0].setSelectionRange(cursorPos, cursorPos);
        }
    });

    /**
     * Limpia el formulario del modal y restablece los checkboxes
     */
    function limpiarFormularioModal() {
        // Limpiar todos los inputs del formulario
        $('#tbody_horarios tr').each(function () {
            $(this).find('input[type="text"]').val('');
            $(this).find('input[type="time"]').val('');
        });
        
        // Desmarcar checkbox de Produccion
        $('#checkBoxProduccion').prop('checked', false);
        
        // Marcar checkboxes de 40 y 10 libras
        $('#checkBoxProduccion40Libras').prop('checked', true);
        $('#checkBoxProduccion10Libras').prop('checked', true);
    }

    /**
     * Lee los horarios ingresados en el formulario del modal
     */
    function leerHorariosDelFormulario() {
        const horarios = [];
        const $filas = $('#tbody_horarios tr');
        
        $filas.each(function () {
            const $fila = $(this);
            const dia = $fila.find('input[name="horario_variable_dia[]"]').val().trim().toUpperCase();
            const entrada = $fila.find('input[name="horario_variable_entrada[]"]').val();
            const salidaComida = $fila.find('input[name="horario_variable_salida_comida[]"]').val();
            const entradaComida = $fila.find('input[name="horario_variable_entrada_comida[]"]').val();
            const salida = $fila.find('input[name="horario_variable_salida[]"]').val();
            
            // Solo agregar si tiene al menos el día y alguna hora
            if (dia && (entrada || salida)) {
                horarios.push({
                    dia: dia,
                    entrada: entrada || '',
                    salida_comida: salidaComida || '',
                    entrada_comida: entradaComida || '',
                    salida: salida || ''
                });
            }
        });
        
        return horarios;
    }

    /**
     * Obtiene los nombres de departamentos seleccionados en los checkboxes
     */
    function obtenerDepartamentosSeleccionados() {
        const seleccionados = [];
        
        Object.keys(DEPARTAMENTOS_MAP).forEach(checkboxId => {
            const $checkbox = $(`#${checkboxId}`);
            if ($checkbox.is(':checked')) {
                seleccionados.push(DEPARTAMENTOS_MAP[checkboxId]);
            }
        });
        
        return seleccionados;
    }

    /**
     * Limpia el nombre del departamento (quita el número inicial)
     */
    function limpiarNombreDepto(nombre) {
        return (nombre || '').replace(/^\d+\s*/, '').trim();
    }

    /**
     * Re-procesa los registros de todos los empleados que tienen horario variable
     */
    function reprocesarRegistrosEmpleados(jsonUnido) {
        // Obtener días de la semana
        const diasSemana = obtenerDiasSemanaLocal(jsonUnido.fecha_inicio, jsonUnido.fecha_cierre);
        
        // Constantes de departamentos especiales
        const DEPA_CDMX = "Sucursal CdMx administrativos";
        const DEPA_COMPRA = "Compra de limon";
        const DEPA_VIGILANCIA = "Seguridad Vigilancia e Intendencia";
        
        (jsonUnido.departamentos || []).forEach(depto => {
            const nombreDepto = limpiarNombreDepto(depto.nombre);
            const esDeptoEspecial = nombreDepto === DEPA_CDMX || nombreDepto === DEPA_COMPRA;
            const esVigilancia = nombreDepto === DEPA_VIGILANCIA;
            
            (depto.empleados || []).forEach(emp => {
                // Solo reprocesar si tiene horario variable y se le aplicó el horario
                if (emp.horario_fijo === 0 && emp.aplicar_horario_variable === true) {
                    // Verificar que tenga horario definido
                    if (emp.horario && emp.horario.length > 0) {
                        // Guardar registros editados manualmente
                        const registrosEditadosMap = {};
                        if (emp.registros_procesados && Array.isArray(emp.registros_procesados)) {
                            emp.registros_procesados.forEach(reg => {
                                if (reg.editado_manualmente) {
                                    registrosEditadosMap[reg.fecha] = reg;
                                }
                            });
                        }
                        
                        // Re-procesar
                        emp.registros_procesados = procesarRegistrosEmpleadoLocal(
                            emp,
                            diasSemana,
                            esDeptoEspecial,
                            esVigilancia
                        );
                        
                        // Restaurar registros editados manualmente
                        emp.registros_procesados = emp.registros_procesados.map(reg => {
                            if (registrosEditadosMap[reg.fecha]) {
                                return registrosEditadosMap[reg.fecha];
                            }
                            return reg;
                        });
                        
                        // Recalcular totales
                        const totalMin = (emp.registros_procesados || []).reduce((acc, dia) => {
                            const m = (dia && typeof dia.trabajado_minutos === 'number') ? dia.trabajado_minutos : 0;
                            return acc + m;
                        }, 0);
                        
                        emp.trabajado_total_minutos = totalMin;
                        emp.trabajado_total_hhmm = minutosAHHMMLocal(totalMin);
                        emp.trabajado_total_decimal = Math.round((totalMin / 60) * 100) / 100;
                    }
                }
            });
        });
    }

    /**
     * Genera arreglo de días de la semana
     */
    function obtenerDiasSemanaLocal(fechaInicio, fechaFin) {
        const meses = {
            'ENE': 0, 'FEB': 1, 'MAR': 2, 'ABR': 3,
            'MAY': 4, 'JUN': 5, 'JUL': 6, 'AGO': 7,
            'SEP': 8, 'OCT': 9, 'NOV': 10, 'DIC': 11
        };
        
        function parseFecha(f) {
            const [dia, mes, anio] = f.split('/');
            return new Date(parseInt(anio), meses[mes.toUpperCase()], parseInt(dia));
        }
        
        const inicio = parseFecha(fechaInicio);
        const fin = parseFecha(fechaFin);
        const dias = [];
        
        for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
            dias.push({
                fecha: d.toLocaleDateString('es-MX').split('/').map(x => x.padStart(2, '0')).join('/'),
                esSabado: d.getDay() === 6,
                esDomingo: d.getDay() === 0
            });
        }
        
        return dias;
    }

    function minutosAHHMMLocal(totalMin) {
        const hh = Math.floor(totalMin / 60);
        const mm = totalMin % 60;
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }

    /**
     * Procesa los registros de un empleado (versión local simplificada)
     */
    function procesarRegistrosEmpleadoLocal(empleado, diasSemana, esDeptoEspecial, esVigilancia) {
        const registrosMap = {};
        (empleado.registros || []).forEach(r => {
            if (!registrosMap[r.fecha]) {
                registrosMap[r.fecha] = [];
            }
            registrosMap[r.fecha].push(r);
        });
        
        Object.keys(registrosMap).forEach(fecha => {
            registrosMap[fecha].sort((a, b) => (a.entrada || '').localeCompare(b.entrada || ''));
        });
        
        const horario = empleado.horario || [];
        
        if (!Array.isArray(horario) || horario.length === 0) {
            return diasSemana.map(dia => ({
                fecha: dia.fecha,
                tipo: "sin_horario",
                registros: [],
                trabajado_minutos: 0,
                trabajado_hhmm: '00:00',
                trabajado_decimal: 0,
                observacion_dia: "SIN HORARIO DEFINIDO",
                tipo_turno: "N/A",
                max_horas: 0
            }));
        }
        
        // Funciones auxiliares
        const obtenerTurnoPorDia = (fecha) => {
            const diasSemanaES = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
            const [dia, mes, anio] = fecha.split('/');
            const fechaObj = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
            const nombreDia = diasSemanaES[fechaObj.getDay()];
            
            const turnoDelDia = horario.find(h => h.dia.toUpperCase() === nombreDia);
            if (turnoDelDia) {
                return {
                    hora_inicio: turnoDelDia.entrada || '09:00',
                    hora_fin: turnoDelDia.salida || '18:00',
                    salida_comida: turnoDelDia.salida_comida || '13:00',
                    entrada_comida: turnoDelDia.entrada_comida || '14:00'
                };
            }
            return { hora_inicio: null, hora_fin: null, salida_comida: '13:00', entrada_comida: '14:00' };
        };

        function normalizarHora(hora) {
            if (!hora) return '';
            const partes = String(hora).split(':');
            if (partes.length < 2) return '';
            return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
        }

        function horaAMinutos(horaHHMM) {
            const [h, m] = normalizarHora(horaHHMM).split(':').map(Number);
            return (h * 60) + m;
        }

        function minutosAHora(mins) {
            let total = mins % (24 * 60);
            if (total < 0) total += (24 * 60);
            const h = Math.floor(total / 60);
            const m = total % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }

        function hashString(str) {
            let h = 2166136261;
            for (let i = 0; i < str.length; i++) {
                h ^= str.charCodeAt(i);
                h = Math.imul(h, 16777619);
            }
            return h >>> 0;
        }

        function jitterHora(baseHoraHHMM, minOffset, maxOffset, seedKey) {
            const base = horaAMinutos(baseHoraHHMM);
            const seed = hashString(seedKey);
            const rango = (maxOffset - minOffset + 1);
            const offset = minOffset + (seed % rango);
            return minutosAHora(base + offset);
        }

        function construirRegistrosDia(turno, fecha, observacion) {
            const inicio = normalizarHora(turno.hora_inicio);
            const fin = normalizarHora(turno.hora_fin);
            const comidaSalidaBase = normalizarHora(turno.salida_comida || '13:00');
            const comidaEntradaBase = normalizarHora(turno.entrada_comida || '14:00');

            const e1 = jitterHora(inicio, -5, 5, `${empleado.id_empleado || empleado.clave}|${fecha}|E1`);
            const s1 = jitterHora(comidaSalidaBase, -10, 5, `${empleado.id_empleado || empleado.clave}|${fecha}|S1`);
            const e2 = jitterHora(comidaEntradaBase, -5, 15, `${empleado.id_empleado || empleado.clave}|${fecha}|E2`);
            const s2 = jitterHora(fin, -15, 5, `${empleado.id_empleado || empleado.clave}|${fecha}|S2`);

            return [
                { tipo: 'entrada', hora: e1, observacion },
                { tipo: 'salida', hora: s1, observacion },
                { tipo: 'entrada', hora: e2, observacion },
                { tipo: 'salida', hora: s2, observacion }
            ];
        }

        function calcularTrabajoDesdeRegistros(registros) {
            let minutosTrabajados = 0;
            for (let i = 0; i < registros.length; i++) {
                if (registros[i].tipo === 'entrada' && i + 1 < registros.length && registros[i + 1].tipo === 'salida') {
                    const e = horaAMinutos(registros[i].hora);
                    const s = horaAMinutos(registros[i + 1].hora);
                    if (s >= e) {
                        minutosTrabajados += (s - e);
                    } else {
                        minutosTrabajados += ((24 * 60) - e + s);
                    }
                    i++;
                }
            }
            return {
                minutos: minutosTrabajados,
                hhmm: minutosAHora(minutosTrabajados),
                decimal: Math.round((minutosTrabajados / 60) * 100) / 100
            };
        }

        const resultados = [];
        const diasTrabajadosRestantes = empleado.dias_trabajados || 0;
        let diasProcesados = 0;

        diasSemana.forEach(dia => {
            // Domingos siempre descanso
            if (dia.esDomingo) {
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "descanso",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "DOMINGO (DESCANSO)",
                    tipo_turno: "N/A",
                    max_horas: 0
                });
                return;
            }

            const turno = obtenerTurnoPorDia(dia.fecha);
            const esLaborable = turno.hora_inicio && turno.hora_fin;
            
            const tipoTurno = esLaborable ? `DIURNA(${turno.hora_inicio}-${turno.hora_fin})` : 'N/A';
            const maxHoras = esLaborable ? 8 : 0;

            const registrosDelDia = registrosMap[dia.fecha] || [];
            const tieneRegistroBiometrico = registrosDelDia.length > 0 && 
                registrosDelDia.some(r => r.entrada || r.salida);

            if (!esLaborable) {
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "descanso",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "DÍA DE DESCANSO",
                    tipo_turno: "N/A",
                    max_horas: 0
                });
                return;
            }

            if (empleado.vacaciones) {
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "vacaciones",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "VACACIONES",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }

            if (empleado.incapacidades) {
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "incapacidad",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "INCAPACIDAD",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }

            // Departamentos especiales auto-generan
            if (esDeptoEspecial && diasProcesados < diasTrabajadosRestantes) {
                diasProcesados++;
                const registrosDia = construirRegistrosDia(turno, dia.fecha, 'REGISTRO AUTOMÁTICO');
                const trabajo = calcularTrabajoDesdeRegistros(registrosDia);
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "asistencia",
                    registros: registrosDia,
                    trabajado_minutos: trabajo.minutos,
                    trabajado_hhmm: trabajo.hhmm,
                    trabajado_decimal: trabajo.decimal,
                    observacion_dia: "REGISTRO AUTOMÁTICO",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }

            // Si tiene registro biométrico
            if (tieneRegistroBiometrico && diasProcesados < diasTrabajadosRestantes) {
                diasProcesados++;
                const base = construirRegistrosDia(turno, dia.fecha, 'RELLENO');
                const trabajo = calcularTrabajoDesdeRegistros(base);
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "asistencia",
                    registros: base,
                    trabajado_minutos: trabajo.minutos,
                    trabajado_hhmm: trabajo.hhmm,
                    trabajado_decimal: trabajo.decimal,
                    observacion_dia: "OK/PARCIAL",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }

            // Sin registro biométrico
            if (!tieneRegistroBiometrico) {
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "inasistencia",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "SIN REGISTRO BIOMÉTRICO",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }

            // Días restantes
            resultados.push({
                fecha: dia.fecha,
                tipo: "descanso",
                registros: [],
                trabajado_minutos: 0,
                trabajado_hhmm: '00:00',
                trabajado_decimal: 0,
                observacion_dia: "DÍA DE DESCANSO",
                tipo_turno: tipoTurno,
                max_horas: maxHoras
            });
        });

        return resultados;
    }

});
