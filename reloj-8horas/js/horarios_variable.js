// Autor: Brandon

$(document).ready(function () {

    // Mapeo de checkboxes a nombres de departamentos (con variantes por cambios históricos)
    // NOTA: Solo 10 Libras y 40 Libras tienen variantes históricas (Empaque -> Produccion)
    // "Produccion" es un departamento independiente y NO tiene variantes
    const DEPARTAMENTOS_MAP = {
        'checkBoxProduccion': ['Produccion'],  // Solo "Produccion", sin variantes
        'checkBoxProduccion40Libras': ['Produccion 40 Libras', 'Empaque 40 Libras'],
        'checkBoxProduccion10Libras': ['Produccion 10 Libras', 'Empaque 10 Libras']
    };

    // ===================================================
    // AQUI SE GUARDA EL HORARIO VARIABLE A LOS EMPLEADOS
    // ===================================================
    $(document).on('click', '#btn-guardar-horario-variable', async function () {
        
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
            // departamentosSeleccionados es un array de arrays con variantes
            const deptoNombreLimpio = limpiarNombreDepto(depto.nombre);
            
            // IMPORTANTE: Usar comparación EXACTA (===), no .includes()
            // Esto evita que "Produccion" coincida con "Produccion 10 Libras"
            const estaSeleccionado = departamentosSeleccionados.some(variantes => 
                variantes.some(variante => deptoNombreLimpio === variante)
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
        // Obtener festividades antes de reprocesar
        let festivosSet = new Set();
        if (typeof obtenerFestividadesSet === 'function') {
            try {
                festivosSet = await obtenerFestividadesSet();
            } catch (e) {
                console.warn('No se pudieron obtener festividades:', e);
            }
        }
        
        reprocesarRegistrosEmpleados(jsonUnido, festivosSet);

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
    /*
    $('#horariosModal').on('hidden.bs.modal', function () {
        limpiarFormularioModal();
    }); */

    // ============================================================
    // BOTÓN PARA LIMPIAR UNA FILA DEL FORMULARIO DE HORARIOS
    // ============================================================
    $(document).on('click', '.btn-limpiar-fila-horario', function (e) {
        e.preventDefault();
        const $fila = $(this).closest('tr');
        
        // Limpiar select del día
        // $fila.find('select[name="horario_variable_dia[]"]').val('');
        
        // Limpiar todos los inputs de hora
        $fila.find('input[type="time"]').val('');
        
        // Limpiar el evento oculto
        $fila.find('input[name="horario_variable_evento[]"]').val('');
        
        // Ocultar el badge de evento
        $fila.find('.evento-badge').addClass('d-none').text('');
    });

    // ============================================================
    // BOTÓN PARA ABRIR MODAL DE EVENTOS DEL DÍA
    // ============================================================
    let $filaEventoActual = null;

    $(document).on('click', '.btn-evento-dia', function (e) {
        e.preventDefault();
        $filaEventoActual = $(this).closest('tr');
        
        // Obtener el valor actual del evento (si existe)
        const eventoActual = $filaEventoActual.find('input[name="horario_variable_evento[]"]').val();
        
        // Limpiar selección previa
        $('input[name="tipoEventoHorarioVariable"]').prop('checked', false);
        
        // Si hay un evento, seleccionarlo
        if (eventoActual) {
            $(`input[name="tipoEventoHorarioVariable"][value="${eventoActual}"]`).prop('checked', true);
        }
        
        // Abrir el modal de eventos para horarios variables
        $('#eventosHorarioVariableModal').modal('show');
    });

    // ============================================================
    // GUARDAR EVENTO DEL DÍA EN HORARIOS VARIABLES
    // ============================================================
    $(document).on('click', '#btn-guardar-evento-horario-variable', function () {
        if (!$filaEventoActual) return;
        
        const eventoSeleccionado = $('input[name="tipoEventoHorarioVariable"]:checked').val() || '';
        
        // Guardar en el input oculto
        $filaEventoActual.find('input[name="horario_variable_evento[]"]').val(eventoSeleccionado);
        
        // Actualizar el badge visual
        const $badge = $filaEventoActual.find('.evento-badge');
        
        if (eventoSeleccionado) {
            let badgeText = '';
            let badgeClass = 'bg-secondary';
            
            if (eventoSeleccionado === 'descanso') {
                badgeText = '🏠 Descanso';
                badgeClass = 'bg-warning text-dark';
            } else if (eventoSeleccionado === 'dia_festivo') {
                badgeText = '🎉 Festivo';
                badgeClass = 'bg-info';
            }
            
            $badge.removeClass('d-none bg-secondary bg-warning bg-info text-dark')
                  .addClass(badgeClass)
                  .text(badgeText);
        } else {
            $badge.addClass('d-none').text('');
        }
        
        // Cerrar el modal
        $('#eventosHorarioVariableModal').modal('hide');
        $filaEventoActual = null;
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
            $(this).find('select').val('');
            // Limpiar eventos
            $(this).find('input[name="horario_variable_evento[]"]').val('');
            $(this).find('.evento-badge').addClass('d-none').text('');
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
            const dia = $fila.find('select[name="horario_variable_dia[]"]').val().trim().toUpperCase();
            const entrada = $fila.find('input[name="horario_variable_entrada[]"]').val();
            const salidaComida = $fila.find('input[name="horario_variable_salida_comida[]"]').val();
            const entradaComida = $fila.find('input[name="horario_variable_entrada_comida[]"]').val();
            const salida = $fila.find('input[name="horario_variable_salida[]"]').val();
            const evento = $fila.find('input[name="horario_variable_evento[]"]').val() || '';
            
            // Agregar si tiene el día seleccionado (con horario O con evento)
            if (dia) {
                horarios.push({
                    dia: dia,
                    entrada: entrada || '',
                    salida_comida: salidaComida || '',
                    entrada_comida: entradaComida || '',
                    salida: salida || '',
                    evento: evento  // 'descanso', 'dia_festivo' o ''
                });
            }
        });
        
        return horarios;
    }

    /**
     * Obtiene los nombres de departamentos seleccionados en los checkboxes
     * Retorna un array de arrays, donde cada sub-array contiene las variantes del nombre
     * Ejemplo: [['Produccion 10 Libras', 'Empaque 10 Libras'], ['Produccion 40 Libras', 'Empaque 40 Libras']]
     */
    function obtenerDepartamentosSeleccionados() {
        const seleccionados = [];
        
        Object.keys(DEPARTAMENTOS_MAP).forEach(checkboxId => {
            const $checkbox = $(`#${checkboxId}`);
            if ($checkbox.is(':checked')) {
                // DEPARTAMENTOS_MAP[checkboxId] ahora es un array de variantes
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
    function reprocesarRegistrosEmpleados(jsonUnido, festivosSet = new Set()) {
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
                            esVigilancia,
                            festivosSet
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
    function procesarRegistrosEmpleadoLocal(empleado, diasSemana, esDeptoEspecial, esVigilancia, festivosSet = new Set()) {
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
                // Verificar si tiene un evento especial (descanso o día festivo)
                if (turnoDelDia.evento === 'descanso') {
                    return { 
                        hora_inicio: null, 
                        hora_fin: null, 
                        salida_comida: null, 
                        entrada_comida: null, 
                        tiene_comida: false,
                        evento: 'descanso'
                    };
                }
                if (turnoDelDia.evento === 'dia_festivo') {
                    return { 
                        hora_inicio: null, 
                        hora_fin: null, 
                        salida_comida: null, 
                        entrada_comida: null, 
                        tiene_comida: false,
                        evento: 'dia_festivo'
                    };
                }
                
                const entrada = turnoDelDia.entrada && turnoDelDia.entrada.trim() !== '' ? turnoDelDia.entrada : null;
                const salida = turnoDelDia.salida && turnoDelDia.salida.trim() !== '' ? turnoDelDia.salida : null;
                
                // Si no tiene entrada/salida, es día de descanso
                if (!entrada || !salida) {
                    return { hora_inicio: null, hora_fin: null, salida_comida: null, entrada_comida: null, tiene_comida: false };
                }
                
                // Verificar si tiene comida definida
                const salidaComida = turnoDelDia.salida_comida && turnoDelDia.salida_comida.trim() !== '' ? turnoDelDia.salida_comida : null;
                const entradaComida = turnoDelDia.entrada_comida && turnoDelDia.entrada_comida.trim() !== '' ? turnoDelDia.entrada_comida : null;
                const tieneComida = salidaComida !== null && entradaComida !== null;
                
                return {
                    hora_inicio: entrada,
                    hora_fin: salida,
                    salida_comida: salidaComida,
                    entrada_comida: entradaComida,
                    tiene_comida: tieneComida,
                    evento: ''
                };
            }
            return { hora_inicio: null, hora_fin: null, salida_comida: null, entrada_comida: null, tiene_comida: false, evento: '' };
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

        // ============================================================
        // CLASIFICADOR DE INCIDENCIAS DE MARCAJES (versión local)
        // ============================================================
        function clasificarIncidenciaMarcajes(todasLasMarcas, turno, tieneComida) {
            const numMarcas = todasLasMarcas.length;
            const inicio = normalizarHora(turno.hora_inicio);
            const fin = normalizarHora(turno.hora_fin);
            const minInicio = horaAMinutos(inicio);
            const minFin = horaAMinutos(fin);
            
            let minComidaSalida = null, minComidaEntrada = null;
            
            if (tieneComida) {
                minComidaSalida = horaAMinutos(normalizarHora(turno.salida_comida));
                minComidaEntrada = horaAMinutos(normalizarHora(turno.entrada_comida));
            }
            
            const resultado = {
                caso: '',
                descripcion: '',
                marcasClasificadas: { entrada: null, salidaComida: null, entradaComida: null, salida: null },
                observaciones: [],
                requiereAtencion: false
            };
            
            if (numMarcas === 0) {
                resultado.caso = 'E-19';
                resultado.observaciones.push('OLVIDO TOTAL');
                resultado.requiereAtencion = true;
                return resultado;
            }
            
            if (numMarcas === 1) {
                const marca = todasLasMarcas[0];
                if (marca.minutos <= minInicio + 90) {
                    resultado.caso = 'D-15';
                    resultado.marcasClasificadas.entrada = marca;
                    resultado.observaciones.push('FALTA SALIDA');
                } else if (marca.minutos >= minFin - 90) {
                    resultado.caso = 'D-18';
                    resultado.marcasClasificadas.salida = marca;
                    resultado.observaciones.push('FALTA ENTRADA');
                } else {
                    resultado.caso = 'D-XX';
                    resultado.observaciones.push('MARCA AMBIGUA');
                }
                resultado.requiereAtencion = true;
                return resultado;
            }
            
            if (numMarcas === 2 && !tieneComida) {
                resultado.caso = 'A-IDEAL';
                resultado.marcasClasificadas.entrada = todasLasMarcas[0];
                resultado.marcasClasificadas.salida = todasLasMarcas[1];
                return resultado;
            }
            
            if (numMarcas === 2 && tieneComida) {
                resultado.caso = 'C-10';
                resultado.marcasClasificadas.entrada = todasLasMarcas[0];
                resultado.marcasClasificadas.salida = todasLasMarcas[1];
                resultado.observaciones.push('NO MARCÓ COMIDAS');
                resultado.requiereAtencion = true;
                return resultado;
            }
            
            if (numMarcas === 3 && tieneComida) {
                resultado.caso = 'B-XX';
                resultado.observaciones.push('MARCAJE INCOMPLETO');
                resultado.requiereAtencion = true;
                return resultado;
            }
            
            if (numMarcas === 4 && tieneComida) {
                resultado.caso = 'A-1';
                resultado.marcasClasificadas.entrada = todasLasMarcas[0];
                resultado.marcasClasificadas.salidaComida = todasLasMarcas[1];
                resultado.marcasClasificadas.entradaComida = todasLasMarcas[2];
                resultado.marcasClasificadas.salida = todasLasMarcas[3];
                return resultado;
            }
            
            if (numMarcas >= 5) {
                resultado.caso = 'F-20';
                resultado.observaciones.push('MARCAS DUPLICADAS');
                resultado.requiereAtencion = true;
                return resultado;
            }
            
            return resultado;
        }

        // ============================================================
        // VALIDADOR DE HORARIOS ANÓMALOS (versión local)
        // ============================================================
        function validarHorariosAnomalos(marcasClasificadas, turno, tieneComida) {
            const anomalias = [];
            const entrada = marcasClasificadas.entrada;
            const salida = marcasClasificadas.salida;
            const salidaComida = marcasClasificadas.salidaComida;
            const entradaComida = marcasClasificadas.entradaComida;
            
            if (entrada && salida) {
                const duracionReal = salida.minutos - entrada.minutos;
                let tiempoComida = 0;
                if (tieneComida && salidaComida && entradaComida) {
                    tiempoComida = entradaComida.minutos - salidaComida.minutos;
                }
                const trabajoNeto = duracionReal - tiempoComida;
                
                if (trabajoNeto < 240 && trabajoNeto > 0) {
                    anomalias.push({ tipo: 'G-23', descripcion: 'JORNADA CORTA' });
                }
                if (duracionReal > 720) {
                    anomalias.push({ tipo: 'G-24', descripcion: 'JORNADA MUY LARGA' });
                }
            }
            
            if (tieneComida && salidaComida && entradaComida) {
                const duracionComida = entradaComida.minutos - salidaComida.minutos;
                if (duracionComida < 10) {
                    anomalias.push({ tipo: 'G-25', descripcion: 'COMIDA MUY CORTA' });
                }
            }
            
            return anomalias;
        }

        function construirRegistrosDia(turno, fecha, observacion) {
            const inicio = normalizarHora(turno.hora_inicio);
            const fin = normalizarHora(turno.hora_fin);
            
            // Verificar si el turno tiene comida
            const tieneComida = turno.tiene_comida === true;

            // ============================================================
            // REGLAS DE GENERACIÓN DE HORAS (ACTUALIZADAS):
            // ENTRADA: Entre -13 y 0 minutos antes de la hora oficial (rango 7:47-8:00 para horario 8:00)
            // SALIDA FINAL: SIEMPRE entre 0 y +7 minutos después de la hora oficial
            // SALIDA COMIDA: Entre -5 y 0 minutos antes de la hora oficial
            // ENTRADA COMIDA: Calcular para asegurar mínimo 57 min de comida
            // ============================================================
            
            const REGLAS = {
                entrada: { min: -13, max: 0 },
                salida: { min: 0, max: 7 },
                salida_comida: { min: -5, max: 0 },
                entrada_comida: { min: -3, max: 0 },
                MINUTOS_MENOS_COMIDA: 3
            };
            
            const seedBase = `${empleado.id_empleado || empleado.clave}|${fecha}`;
            
            // Entrada al trabajo: -13 a 0 minutos
            const e1 = jitterHora(inicio, REGLAS.entrada.min, REGLAS.entrada.max, `${seedBase}|E1`);
            
            // Salida final: SIEMPRE 0 a +7 minutos
            const s2 = jitterHora(fin, REGLAS.salida.min, REGLAS.salida.max, `${seedBase}|S2`);

            // Si NO tiene comida, solo devolver entrada y salida
            if (!tieneComida) {
                return [
                    { tipo: 'entrada', hora: e1, observacion },
                    { tipo: 'salida', hora: s2, observacion }
                ];
            }
            
            // Calcular horarios de comida (duración = oficial - 3 minutos = mínimo 57 min)
            const comidaSalidaBase = normalizarHora(turno.salida_comida);
            const comidaEntradaBase = normalizarHora(turno.entrada_comida);
            
            const minComidaSalida = horaAMinutos(comidaSalidaBase);
            const minComidaEntrada = horaAMinutos(comidaEntradaBase);
            const duracionComidaOficial = minComidaEntrada - minComidaSalida;
            const duracionComidaMinima = duracionComidaOficial - REGLAS.MINUTOS_MENOS_COMIDA; // 57 min para 1hr, 117 min para 2hrs
            
            // Salida a comida: -5 a 0 minutos
            const s1 = jitterHora(comidaSalidaBase, REGLAS.salida_comida.min, REGLAS.salida_comida.max, `${seedBase}|S1`);
            
            // Entrada de comida: Calcular para que dure mínimo 57 min
            const minSalidaComidaReal = horaAMinutos(s1);
            const minEntradaComidaMinima = minSalidaComidaReal + duracionComidaMinima;
            const minEntradaComidaOficialMenos3 = minComidaEntrada + REGLAS.entrada_comida.min;
            const minEntradaComidaFinal = Math.max(minEntradaComidaMinima, minEntradaComidaOficialMenos3);
            const variacionEntradaComida = hashString(`${seedBase}|E2_VAR`) % 4; // 0 a 3 min
            const e2 = minutosAHora(minEntradaComidaFinal + variacionEntradaComida);

            return [
                { tipo: 'entrada', hora: e1, observacion },
                { tipo: 'salida', hora: s1, observacion },
                { tipo: 'entrada', hora: e2, observacion },
                { tipo: 'salida', hora: s2, observacion }
            ];
        }

        function calcularTrabajoDesdeRegistros(registros, maxHorasTurno = 8) {
            let minutosTrabajados = 0;
            const maxMinutos = maxHorasTurno * 60;
            
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
            
            // Limitar al máximo de horas del turno
            if (minutosTrabajados > maxMinutos) {
                minutosTrabajados = maxMinutos;
            }
            
            return {
                minutos: minutosTrabajados,
                hhmm: minutosAHora(minutosTrabajados),
                decimal: Math.round((minutosTrabajados / 60) * 100) / 100
            };
        }

        // Función para ajustar registros si exceden máximo de horas del turno
        // Función para ajustar registros si exceden máximo de horas del turno
        // IMPORTANTE: La salida NUNCA puede ser antes de la hora oficial del turno
        function ajustarRegistrosSiExcedenMaximo(registros, maxHorasTurno, seedKey) {
            if (!registros || registros.length === 0) return registros;
            
            const TOLERANCIA_MINUTOS = 15;
            const maxMinutosPermitidos = (maxHorasTurno * 60) + TOLERANCIA_MINUTOS;
            
            let minutosTrabajados = 0;
            const pares = [];
            
            for (let i = 0; i < registros.length; i++) {
                if (registros[i].tipo === 'entrada' && i + 1 < registros.length && registros[i + 1].tipo === 'salida') {
                    const e = horaAMinutos(registros[i].hora);
                    const s = horaAMinutos(registros[i + 1].hora);
                    let duracion = s >= e ? (s - e) : ((24 * 60) - e + s);
                    minutosTrabajados += duracion;
                    pares.push({ idxSalida: i + 1, minSalida: s });
                    i++;
                }
            }
            
            if (minutosTrabajados <= maxMinutosPermitidos || pares.length === 0) {
                return registros;
            }
            
            // El tiempo excede el máximo - solo agregar nota, NO mover la salida antes de la hora oficial
            const ultimoPar = pares[pares.length - 1];
            registros[ultimoPar.idxSalida].observacion = registros[ultimoPar.idxSalida].observacion + ' [TIEMPO EXCEDE MÁXIMO]';
            
            return registros;
        }

        const resultados = [];
        const diasTrabajadosRestantes = empleado.dias_trabajados || 0;
        let diasProcesados = 0;
        
        // ============================================================
        // CONTADORES PARA EVENTOS (vacaciones, incapacidades, ausencias)
        // Se usan para asignar días cuando ya se completaron dias_trabajados
        // ============================================================
        const diasVacacionesRestantes = empleado.dias_vacaciones || 0;
        const diasIncapacidadesRestantes = empleado.dias_incapacidades || 0;
        const diasAusenciasRestantes = empleado.dias_ausencias || 0;
        let vacacionesProcesadas = 0;
        let incapacidadesProcesadas = 0;
        let ausenciasProcesadas = 0;
        
        // ============================================================
        // VERIFICAR SI EL EMPLEADO TIENE REGISTROS BIOMÉTRICOS
        // Si registros está vacío o todos vacíos, el empleado no está dado de alta en el reloj
        // ============================================================
        const tieneRegistrosBiometricos = (empleado.registros || []).length > 0 && 
            (empleado.registros || []).some(r => r.entrada || r.salida);
        
        // ============================================================
        // PRE-PROCESAMIENTO: Buscar el turno de un día laborable válido
        // Prioridad: VIERNES > JUEVES > MIERCOLES > MARTES > LUNES
        // Esto sirve para rellenar sábado/domingo que no tienen horario
        // ============================================================
        let ultimoTurnoValido = { tipo_turno: "N/A", max_horas: 0 };
        
        const diasPrioridad = ['VIERNES', 'JUEVES', 'MIERCOLES', 'MARTES', 'LUNES', 'SABADO', 'DOMINGO'];
        
        for (const nombreDia of diasPrioridad) {
            if (Array.isArray(horario) && horario.length > 0) {
                const turnoDelDia = horario.find(h => h.dia && h.dia.toUpperCase() === nombreDia);
                if (turnoDelDia) {
                    const entrada = turnoDelDia.entrada && turnoDelDia.entrada.trim() !== '' ? turnoDelDia.entrada : null;
                    const salida = turnoDelDia.salida && turnoDelDia.salida.trim() !== '' ? turnoDelDia.salida : null;
                    
                    // Si tiene entrada y salida válidas, usar este turno como referencia
                    if (entrada && salida) {
                        ultimoTurnoValido = {
                            tipo_turno: `DIURNA(${entrada}-${salida})`,
                            max_horas: 8
                        };
                        break; // Ya encontramos un turno válido, salir del bucle
                    }
                }
            }
        }

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
                    tipo_turno: ultimoTurnoValido.tipo_turno,
                    max_horas: ultimoTurnoValido.max_horas
                });
                return;
            }
            
            // DÍAS FESTIVOS → marcar como dia_festivo
            if (festivosSet.has(dia.fecha)) {
                // Para VIGILANCIA: verificar si tienen registros biométricos en este día
                if (esVigilancia) {
                    const registrosDelDiaFestivo = registrosMap[dia.fecha] || [];
                    const tieneRegistrosEnFestivo = registrosDelDiaFestivo.length > 0 &&
                        registrosDelDiaFestivo.some(r => r.entrada || r.salida);
                    
                    if (tieneRegistrosEnFestivo) {
                        // Vigilancia CON registros → procesar como día normal (no retornar)
                        console.log(`[VIGILANCIA] ${empleado.nombre} trabajó el día festivo ${dia.fecha}`);
                    } else {
                        // Vigilancia SIN registros → se les dio el día festivo
                        resultados.push({
                            fecha: dia.fecha,
                            tipo: "dia_festivo",
                            registros: [],
                            trabajado_minutos: 0,
                            trabajado_hhmm: '00:00',
                            trabajado_decimal: 0,
                            observacion_dia: "DÍA FESTIVO",
                            tipo_turno: ultimoTurnoValido.tipo_turno,
                            max_horas: ultimoTurnoValido.max_horas
                        });
                        return;
                    }
                } else {
                    // Para otros departamentos: siempre es día festivo
                    resultados.push({
                        fecha: dia.fecha,
                        tipo: "dia_festivo",
                        registros: [],
                        trabajado_minutos: 0,
                        trabajado_hhmm: '00:00',
                        trabajado_decimal: 0,
                        observacion_dia: "DÍA FESTIVO",
                        tipo_turno: ultimoTurnoValido.tipo_turno,
                        max_horas: ultimoTurnoValido.max_horas
                    });
                    return;
                }
            }

            const turno = obtenerTurnoPorDia(dia.fecha);
            
            // ============================================================
            // VERIFICAR SI EL DÍA TIENE UN EVENTO ESPECIAL DEL HORARIO VARIABLE
            // (descanso o día festivo definido por RRHH)
            // ============================================================
            if (turno.evento === 'descanso') {
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "descanso",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "DÍA DE DESCANSO (HORARIO VARIABLE)",
                    tipo_turno: ultimoTurnoValido.tipo_turno,
                    max_horas: ultimoTurnoValido.max_horas
                });
                return;
            }
            
            if (turno.evento === 'dia_festivo') {
                // Verificar si tiene registros biométricos (asistencia a pesar del festivo)
                const registrosDelDiaFestivo = registrosMap[dia.fecha] || [];
                const tieneRegistrosEnFestivo = registrosDelDiaFestivo.length > 0 &&
                    registrosDelDiaFestivo.some(r => r.entrada || r.salida);
                
                if (tieneRegistrosEnFestivo) {
                    // Tiene registros → procesar como día normal (continuar)
                    console.log(`[HORARIO VARIABLE] ${empleado.nombre} trabajó el día festivo ${dia.fecha}`);
                } else {
                    // Sin registros → día festivo
                    resultados.push({
                        fecha: dia.fecha,
                        tipo: "dia_festivo",
                        registros: [],
                        trabajado_minutos: 0,
                        trabajado_hhmm: '00:00',
                        trabajado_decimal: 0,
                        observacion_dia: "DÍA FESTIVO (HORARIO VARIABLE)",
                        tipo_turno: ultimoTurnoValido.tipo_turno,
                        max_horas: ultimoTurnoValido.max_horas
                    });
                    return;
                }
            }
            
            const esLaborable = turno.hora_inicio && turno.hora_fin;
            
            // Usar el turno del día si es laborable, sino usar el último turno válido
            const tipoTurno = esLaborable ? `DIURNA(${turno.hora_inicio}-${turno.hora_fin})` : ultimoTurnoValido.tipo_turno;
            const maxHoras = esLaborable ? 8 : ultimoTurnoValido.max_horas;

            const registrosDelDia = registrosMap[dia.fecha] || [];
            const tieneRegistroBiometrico = registrosDelDia.length > 0 && 
                registrosDelDia.some(r => r.entrada || r.salida);

            // Días NO laborables según horario → no_laboro (no es descanso ni ausencia)
            // Solo el DOMINGO es "descanso" oficial
            if (!esLaborable) {
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "no_laboro",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "NO LABORA ESTE DÍA",
                    tipo_turno: ultimoTurnoValido.tipo_turno,
                    max_horas: ultimoTurnoValido.max_horas
                });
                return;
            }

            // Departamentos especiales auto-generan
            if (esDeptoEspecial && diasProcesados < diasTrabajadosRestantes) {
                diasProcesados++;
                const registrosDia = construirRegistrosDia(turno, dia.fecha, 'REGISTRO AUTOMÁTICO');
                // Ajustar si excede máximo de horas
                const seedKey = `${empleado.id_empleado || empleado.clave}|${dia.fecha}`;
                ajustarRegistrosSiExcedenMaximo(registrosDia, maxHoras, seedKey);
                const trabajo = calcularTrabajoDesdeRegistros(registrosDia, maxHoras);
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
                // Ajustar si excede máximo de horas
                const seedKey = `${empleado.id_empleado || empleado.clave}|${dia.fecha}`;
                ajustarRegistrosSiExcedenMaximo(base, maxHoras, seedKey);
                const trabajo = calcularTrabajoDesdeRegistros(base, maxHoras);
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

            // ================================================================
            // Empleado SIN registros biométricos (no dado de alta en reloj)
            // pero SÍ tiene horario definido → auto-generar según dias_trabajados
            // ================================================================
            if (!tieneRegistrosBiometricos && diasProcesados < diasTrabajadosRestantes) {
                diasProcesados++;
                const registrosDia = construirRegistrosDia(turno, dia.fecha, 'SIN BIOMÉTRICO');
                // Ajustar si excede máximo de horas
                const seedKey = `${empleado.id_empleado || empleado.clave}|${dia.fecha}`;
                ajustarRegistrosSiExcedenMaximo(registrosDia, maxHoras, seedKey);
                const trabajo = calcularTrabajoDesdeRegistros(registrosDia, maxHoras);
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "asistencia",
                    registros: registrosDia,
                    trabajado_minutos: trabajo.minutos,
                    trabajado_hhmm: trabajo.hhmm,
                    trabajado_decimal: trabajo.decimal,
                    observacion_dia: "SIN REGISTRO EN RELOJ",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }
            
            // Si no tiene registros biométricos y ya se completaron dias_trabajados
            // → Asignar vacaciones, incapacidades, ausencias o descanso según corresponda
            if (!tieneRegistrosBiometricos) {
                // Prioridad: vacaciones > incapacidades > ausencias > descanso
                if (vacacionesProcesadas < diasVacacionesRestantes) {
                    vacacionesProcesadas++;
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
                
                if (incapacidadesProcesadas < diasIncapacidadesRestantes) {
                    incapacidadesProcesadas++;
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
                
                if (ausenciasProcesadas < diasAusenciasRestantes) {
                    ausenciasProcesadas++;
                    resultados.push({
                        fecha: dia.fecha,
                        tipo: "ausencia",
                        registros: [],
                        trabajado_minutos: 0,
                        trabajado_hhmm: '00:00',
                        trabajado_decimal: 0,
                        observacion_dia: "AUSENCIA",
                        tipo_turno: tipoTurno,
                        max_horas: maxHoras
                    });
                    return;
                }
                
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
                return;
            }

            // Sin registro biométrico del día (pero sí está dado de alta en reloj)
            // NUEVA LÓGICA: Si dias_ausencias === 0, RRHH indicó que no tuvo ausencias
            // → Auto-generar registros en lugar de marcar inasistencia
            if (!tieneRegistroBiometrico) {
                const diasAusenciasRestantes = empleado.dias_ausencias || 0;
                
                if (diasAusenciasRestantes === 0 && diasProcesados < diasTrabajadosRestantes) {
                    // RRHH indicó 0 ausencias → auto-generar registro
                    diasProcesados++;
                    const registrosDia = construirRegistrosDia(turno, dia.fecha, 'REGISTRO GENERADO');
                    const trabajo = calcularTrabajoDesdeRegistros(registrosDia, maxHoras);
                    resultados.push({
                        fecha: dia.fecha,
                        tipo: "asistencia",
                        registros: registrosDia,
                        trabajado_minutos: trabajo.minutos,
                        trabajado_hhmm: trabajo.hhmm,
                        trabajado_decimal: trabajo.decimal,
                        observacion_dia: "SIN CHECADA (0 AUSENCIAS RRHH)",
                        tipo_turno: tipoTurno,
                        max_horas: maxHoras
                    });
                    return;
                }
                
                // Si tiene ausencias pendientes o ya completó dias_trabajados → inasistencia
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

            // Días restantes → Asignar vacaciones, incapacidades, ausencias o descanso
            // Prioridad: vacaciones > incapacidades > ausencias > descanso
            if (vacacionesProcesadas < diasVacacionesRestantes) {
                vacacionesProcesadas++;
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
            
            if (incapacidadesProcesadas < diasIncapacidadesRestantes) {
                incapacidadesProcesadas++;
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
            
            if (ausenciasProcesadas < diasAusenciasRestantes) {
                ausenciasProcesadas++;
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "ausencia",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "AUSENCIA",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }
            
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
