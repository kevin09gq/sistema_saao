/**
 * =====================================
 *  Departamentos con reglas especiales
 * =====================================
 */
const DEPA_CDMX = "Sucursal CdMx administrativos";
const DEPA_VIGILANCIA = "Seguridad Vigilancia e Intendencia";
const DEPA_COMPRA = "Compra de limon";


$(document).ready(function () {
    // Verificar si hay datos guardados
    const datosGuardados = cargarDatosDeSesion();

    if (datosGuardados) {
        // Ocultar formulario y mostrar tabla si es necesario
        $("#container-reloj").prop("hidden", true);
        $("#tabla-reloj-responsive").prop("hidden", false);

        // Re-procesar con festividades actuales (si cambian en BD)
        obtenerFestividadesSet()
            .then((festivosSet) => {
                procesarTodosRegistros(datosGuardados, festivosSet);
                guardarDatosEnSesion(datosGuardados);
                poblarCamposDesdeDatos(datosGuardados);
                $(document).trigger('reloj-data-updated');
            })
            .catch(() => {
                poblarCamposDesdeDatos(datosGuardados);
                $(document).trigger('reloj-data-updated');
            });
    }

    processExcelData();

});

let _festividadesSetCache = null;
let _turnosCache = null;

/**
 * ============================================
 * Normalizar las fechas al formato DD/MM/YYYY
 * ============================================
 */
function normalizarFechaDDMMYYYY(fecha) {
    if (!fecha) return '';

    const f = String(fecha).trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(f)) return f;
    if (/^\d{4}-\d{2}-\d{2}$/.test(f)) {
        const [y, m, d] = f.split('-');
        return `${d}/${m}/${y}`;
    }
    return f;
}

/**
 * =======================================================
 * Función para obtener las festividades desde el servidor
 */
function obtenerFestividadesSet() {
    if (_festividadesSetCache) return Promise.resolve(_festividadesSetCache);

    return new Promise((resolve, reject) => {
        $.ajax({
            url: '../../public/php/obtenerFestividades.php',
            type: 'GET',
            dataType: 'json',
            success: function (rows) {
                try {
                    const set = new Set();
                    (rows || []).forEach(r => {
                        // Priorizar fecha_vista (dd/mm/YYYY), fallback a fecha (YYYY-mm-dd)
                        const fv = normalizarFechaDDMMYYYY(r.fecha_vista || r.fecha);
                        if (fv) set.add(fv);
                    });
                    _festividadesSetCache = set;
                    resolve(set);
                } catch (e) {
                    reject(e);
                }
            },
            error: function (xhr, status, error) {
                reject(error);
            }
        });
    });
}

/**
 * ============================================
 * Con esto se obtene los turnos del gobierno
 * diurna, nocturna, mixta
 * ============================================
 */
function obtenerTurnos() {
    if (_turnosCache) return Promise.resolve(_turnosCache);

    return new Promise((resolve, reject) => {
        $.ajax({
            url: '../../public/php/obtenerTurnos.php',
            type: 'GET',
            dataType: 'json',
            success: function (turnos) {
                try {
                    _turnosCache = turnos;
                    resolve(turnos);
                } catch (e) {
                    reject(e);
                }
            },
            error: function (xhr, status, error) {
                reject(error);
            }
        });
    });
}

// =================================
// Boton para limpiar los datos
// ================================
$(document).on('click', '#btn_limpiar_datos', function (e) {
    e.preventDefault();

    Swal.fire({
        title: "¿Limpiar información?",
        text: "Vas a perder la información",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, Limpiar"
    }).then((result) => {
        if (result.isConfirmed) {

            limpiarDatosDeSesion();

            mostrar_alerta("Completado", "Proceso completado con exito.", "success")
        }
    });
});

// Procesa todos los registros de todos los empleados en todos los departamentos
function procesarTodosRegistros(json, festivosSet = new Set()) {

    // Obtener fechas de la semana entre las fechas de inicio y fin
    const diasSemana = obtenerDiasSemana(json.fecha_inicio, json.fecha_cierre);

    // Se recorre cada departamento
    json.departamentos.forEach((depto, idxDepto) => {

        // Identificar tipo de departamento por nombre (sin número inicial)
        const nombreDepto = (depto.nombre || '').replace(/^\d+\.?\s*/, '').trim();
        // Veririficar si es departamento especial
        const esDeptoEspecial = nombreDepto === DEPA_CDMX || nombreDepto === DEPA_COMPRA;
        // Verificar si es vigilancia
        const esVigilancia = nombreDepto === DEPA_VIGILANCIA;
        
        // Comienza el recorrido por cada empleado del departamento
        (depto.empleados || []).forEach(empleado => {
            // Guardar registros editados manualmente antes de reprocesar
            const registrosEditadosMap = {};
            if (empleado.registros_procesados && Array.isArray(empleado.registros_procesados)) {
                empleado.registros_procesados.forEach(reg => {
                    if (reg.editado_manualmente) {
                        registrosEditadosMap[reg.fecha] = reg;
                    }
                });
            }
            
            // Procesar registros normalmente
            empleado.registros_procesados = procesarRegistrosEmpleado(
                empleado,
                diasSemana,
                esDeptoEspecial,
                esVigilancia,
                festivosSet
            );
            
            // Restaurar registros editados manualmente (no sobrescribir)
            empleado.registros_procesados = empleado.registros_procesados.map(reg => {
                if (registrosEditadosMap[reg.fecha]) {
                    return registrosEditadosMap[reg.fecha];
                }
                return reg;
            });

            // Totales semanales por empleado (sumando minutos para evitar redondeos)
            const totalMin = (empleado.registros_procesados || []).reduce((acc, dia) => {
                const m = (dia && typeof dia.trabajado_minutos === 'number') ? dia.trabajado_minutos : 0;
                return acc + m;
            }, 0);

            empleado.trabajado_total_minutos = totalMin;
            empleado.trabajado_total_hhmm = minutosAHHMM(totalMin);
            empleado.trabajado_total_decimal = Math.round((totalMin / 60) * 100) / 100;
        });
    });
}

/**
 * =========================================
 * Converte minutos totales a formato HH:MM
 * =========================================
 */
function minutosAHHMM(totalMin) {
    const hh = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// Genera arreglo de días de la semana a partir de fecha_inicio y fecha_cierre
function obtenerDiasSemana(fechaInicio, fechaFin) {
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

// Función aislada para procesar registros de un empleado
function procesarRegistrosEmpleado(empleado, diasSemana, esDeptoEspecial = false, esVigilancia = false, festivosSet = new Set()) {
    // Por cada día laboral, debe haber mínimo cuatro registros (E, S, E, S)
    // Estructura de cada registro_procesado: fecha, tipo, registros: [ {tipo: 'entrada'|'salida', hora: 'HH:MM', observacion} ...], observacion_dia, tipo_turno, max_horas
    
    // Agrupar todos los registros por fecha (puede haber múltiples por día)
    const registrosMap = {};
    (empleado.registros || []).forEach(r => {
        if (!registrosMap[r.fecha]) {
            registrosMap[r.fecha] = [];
        }
        registrosMap[r.fecha].push(r);
    });
    
    // Ordenar los registros de cada día por hora de entrada
    Object.keys(registrosMap).forEach(fecha => {
        registrosMap[fecha].sort((a, b) => (a.entrada || '').localeCompare(b.entrada || ''));
    });
    
    const horario = empleado.horario || [];
    
    // Si no tiene horario, retornar registros vacíos (sin turno)
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
    
    // Función para obtener el turno según el día de la semana
    const obtenerTurnoPorDia = (fecha) => {
        const diasSemanaES = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        const [dia, mes, anio] = fecha.split('/');
        const fechaObj = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
        const nombreDia = diasSemanaES[fechaObj.getDay()];
        
        if (Array.isArray(horario) && horario.length > 0) {
            const turnoDelDia = horario.find(h => h.dia.toUpperCase() === nombreDia);
            if (turnoDelDia) {
                return {
                    hora_inicio: turnoDelDia.entrada || '09:00',
                    hora_fin: turnoDelDia.salida || '18:00',
                    salida_comida: turnoDelDia.salida_comida || '13:00',
                    entrada_comida: turnoDelDia.entrada_comida || '14:00'
                };
            }
        }
        // Valores por defecto si no hay horario
        return {
            hora_inicio: null,
            hora_fin: null,
            salida_comida: '13:00',
            entrada_comida: '14:00'
        };
    };

    // Función para determinar tipo de turno basado en horas específicas del día
    const determinarTipoTurnoDia = (horaInicio, horaFin) => {
        if (!horaInicio || !horaFin) return { tipo_turno: "N/A", max_horas: 0 };
        
        // Obtener turnos de la ley (usar cache global si existe)
        const turnosLey = window._turnosCache || [];
        
        const horaAMinutos = (hora) => {
            const [h, m] = hora.split(':').map(Number);
            return h * 60 + m;
        };

        const entrada = horaAMinutos(horaInicio);
        const salida = horaAMinutos(horaFin);

        // Buscar definiciones de turnos
        const turnoDiurna = turnosLey.find(t => t.descripcion && t.descripcion.toLowerCase().includes('diurna'));
        const turnoNocturna = turnosLey.find(t => t.descripcion && t.descripcion.toLowerCase().includes('nocturna'));
        const turnoMixta = turnosLey.find(t => t.descripcion && t.descripcion.toLowerCase().includes('mixta'));

        const inicioDiurna = horaAMinutos(turnoDiurna?.inicio_hora || '06:00');
        const finDiurna = horaAMinutos(turnoDiurna?.fin_hora || '20:00');
        const inicioNocturna = horaAMinutos(turnoNocturna?.inicio_hora || '20:00');

        const esDiurna = entrada >= inicioDiurna && salida <= finDiurna;
        const esNocturna = (entrada >= inicioNocturna) || (salida <= inicioDiurna && entrada < inicioDiurna);
        const esMixta = !esDiurna && !esNocturna;

        if (esDiurna) {
            return {
                tipo_turno: `DIURNA(${horaInicio}-${horaFin})`,
                max_horas: parseFloat(turnoDiurna?.max || 8)
            };
        } else if (esMixta) {
            return {
                tipo_turno: `MIXTA(${horaInicio}-${horaFin})`,
                max_horas: parseFloat(turnoMixta?.max || 7.5)
            };
        } else {
            return {
                tipo_turno: `NOCTURNA(${horaInicio}-${horaFin})`,
                max_horas: parseFloat(turnoNocturna?.max || 7)
            };
        }
    };

    // Normaliza HH:MM:SS -> HH:MM
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

    // Sumar minutos a una hora, devolviendo HH:MM
    function sumarMinutos(hora, minutos) {
        return minutosAHora(horaAMinutos(hora) + minutos);
    }

    // Hash simple para que la variación sea determinística (no cambia en recargas)
    function hashString(str) {
        let h = 2166136261;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    // Variación determinística en minutos dentro de un rango
    function jitterHora(baseHoraHHMM, minOffset, maxOffset, seedKey) {
        const base = horaAMinutos(baseHoraHHMM);
        const seed = hashString(seedKey);
        const rango = (maxOffset - minOffset + 1);
        const offset = minOffset + (seed % rango);
        return minutosAHora(base + offset);
    }

    // ============ RANGOS DE TOLERANCIA PARA CADA TIPO DE MARCA ============
    // Estos rangos definen cuándo una hora real se considera "cercana" al horario
    const RANGOS_TOLERANCIA = {
        entrada: { min: -5, max: 15 },           // Entrada: 5 min antes hasta 15 min después (ej: 8:00 → 7:55-8:15)
        salida_comida: { min: -10, max: 5 },     // Salida comida: 10 min antes hasta 5 después (ej: 13:00 → 12:50-13:05)
        entrada_comida: { min: -5, max: 15 },    // Entrada comida: 5 min antes hasta 15 después (ej: 14:00 → 13:55-14:15)
        salida: { min: -15, max: 5 }             // Salida final: 15 min antes hasta 5 después (ej: 18:00 → 17:45-18:05)
    };

    // Función para verificar si una hora está dentro del rango de tolerancia
    function estaDentroDeRango(horaReal, horaBase, tipo) {
        if (!horaReal || !horaBase) return false;
        const minReal = horaAMinutos(horaReal);
        const minBase = horaAMinutos(horaBase);
        const rango = RANGOS_TOLERANCIA[tipo] || { min: -15, max: 15 };
        return minReal >= (minBase + rango.min) && minReal <= (minBase + rango.max);
    }

    function construirRegistrosDia(turno, fecha, observacion) {
        const inicio = normalizarHora(turno.hora_inicio);
        const fin = normalizarHora(turno.hora_fin);
        const comidaSalidaBase = normalizarHora(turno.salida_comida || '13:00');
        const comidaEntradaBase = normalizarHora(turno.entrada_comida || '14:00');

        // Rangos ajustados según lo solicitado:
        // Entrada: -5 a +5 minutos (llegar 5 min antes hasta 5 min después)
        const e1 = jitterHora(inicio, -5, 5, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${fecha}|E1`);
        // Salida a comida: -10 a +5 minutos (salir 10 min antes hasta 5 después)
        const s1 = jitterHora(comidaSalidaBase, -10, 5, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${fecha}|S1`);
        // Entrada después de comida: -5 a +15 minutos (regresar 5 min antes hasta 15 después)
        const e2 = jitterHora(comidaEntradaBase, -5, 15, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${fecha}|E2`);
        // Salida final: -15 a +5 minutos (salir 15 min antes hasta 5 después)
        const s2 = jitterHora(fin, -15, 5, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${fecha}|S2`);

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

    // Variables de control
    const resultados = [];
    const diasTrabajadosRestantes = empleado.dias_trabajados || 0;
    let diasProcesados = 0;

    diasSemana.forEach(dia => {
        // REGLA 1: DOMINGOS son SIEMPRE descanso para TODOS (sin excepciones)
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

        // Obtener turno del día
        const turno = obtenerTurnoPorDia(dia.fecha);
        const esLaborable = turno.hora_inicio && turno.hora_fin;
        
        // Calcular tipo de turno para este día específico
        const infoTurnoDia = determinarTipoTurnoDia(turno.hora_inicio, turno.hora_fin);
        
        // Verificar si tiene registro biométrico REAL (ahora es un array de registros del día)
        const registrosDelDia = registrosMap[dia.fecha] || [];
        const tieneRegistroBiometrico = registrosDelDia.length > 0 && 
            registrosDelDia.some(r => r.entrada || r.salida);

        // REGLA 2: Días NO laborables según horario → descanso
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

        // REGLA 3: Vacaciones/incapacidad/ausencia (no cuentan como días trabajados)
        if (empleado.vacaciones) {
            resultados.push({
                fecha: dia.fecha,
                tipo: "vacaciones",
                registros: [],
                trabajado_minutos: 0,
                trabajado_hhmm: '00:00',
                trabajado_decimal: 0,
                observacion_dia: "VACACIONES",
                tipo_turno: infoTurnoDia.tipo_turno,
                max_horas: infoTurnoDia.max_horas
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
                tipo_turno: infoTurnoDia.tipo_turno,
                max_horas: infoTurnoDia.max_horas
            });
            return;
        }
        if (empleado.ausencias) {
            resultados.push({
                fecha: dia.fecha,
                tipo: "ausencia",
                registros: [],
                trabajado_minutos: 0,
                trabajado_hhmm: '00:00',
                trabajado_decimal: 0,
                observacion_dia: "AUSENCIA",
                tipo_turno: infoTurnoDia.tipo_turno,
                max_horas: infoTurnoDia.max_horas
            });
            return;
        }

        // REGLA 4: Departamentos especiales (CDMX, Compra) → auto-generan si hay espacio
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
                tipo_turno: infoTurnoDia.tipo_turno,
                max_horas: infoTurnoDia.max_horas
            });
            return;
        }

        // REGLA 5: SOLO trabajó si tiene registro biométrico Y hay espacio en dias_trabajados
        if (tieneRegistroBiometrico && diasProcesados < diasTrabajadosRestantes) {
            diasProcesados++;
            
            // registrosDelDia es un array de registros (cada uno con entrada/salida)
            // Ya está ordenado por hora de entrada
            const inicio = normalizarHora(turno.hora_inicio);
            const fin = normalizarHora(turno.hora_fin);
            const comidaSalida = normalizarHora(turno.salida_comida || '13:00');
            const comidaEntrada = normalizarHora(turno.entrada_comida || '14:00');
            
            // Iniciar con registros base (RELLENO según horario)
            const base = construirRegistrosDia(turno, dia.fecha, 'RELLENO');
            
            // Filtrar registros válidos: solo los que tienen sentido dentro del horario laboral
            // Un registro es válido si su entrada O salida están dentro de un rango amplio del horario
            const minInicio = horaAMinutos(inicio);
            const minFin = horaAMinutos(fin);
            const margenAmplio = 120; // 2 horas de margen para considerar un registro
            
            const registrosValidos = registrosDelDia.filter(r => {
                const entradaMin = r.entrada ? horaAMinutos(normalizarHora(r.entrada)) : null;
                const salidaMin = r.salida ? horaAMinutos(normalizarHora(r.salida)) : null;
                
                // Validar que al menos una hora esté dentro del rango laboral amplio
                const entradaValida = entradaMin !== null && entradaMin >= (minInicio - margenAmplio) && entradaMin <= (minFin + margenAmplio);
                const salidaValida = salidaMin !== null && salidaMin >= (minInicio - margenAmplio) && salidaMin <= (minFin + margenAmplio);
                
                return entradaValida || salidaValida;
            });
            
            // Clasificar registros en mañana (antes de comida) y tarde (después de comida)
            const minComidaInicio = horaAMinutos(comidaSalida);
            const minComidaFin = horaAMinutos(comidaEntrada);
            
            const registrosManana = [];
            const registrosTarde = [];
            
            registrosValidos.forEach(r => {
                const entradaMin = r.entrada ? horaAMinutos(normalizarHora(r.entrada)) : null;
                
                if (entradaMin !== null) {
                    // Si la entrada es antes de la hora de comida → mañana
                    if (entradaMin < minComidaFin) {
                        registrosManana.push(r);
                    } else {
                        // Si la entrada es después del regreso de comida → tarde
                        registrosTarde.push(r);
                    }
                }
            });
            
            // Procesar registro de la MAÑANA (entrada inicial y salida a comida)
            if (registrosManana.length > 0) {
                const regManana = registrosManana[0];
                
                // ENTRADA INICIAL
                if (regManana.entrada) {
                    const entradaOriginal = normalizarHora(regManana.entrada);
                    
                    if (estaDentroDeRango(entradaOriginal, inicio, 'entrada')) {
                        // Está dentro del rango aceptable → ajustar al horario
                        base[0] = {
                            tipo: 'entrada',
                            hora: jitterHora(inicio, -5, 5, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${dia.fecha}|E1_ADJ`),
                            observacion: 'AJUSTADO'
                        };
                    } else {
                        const minEntrada = horaAMinutos(entradaOriginal);
                        if (minEntrada > horaAMinutos(inicio) + RANGOS_TOLERANCIA.entrada.max) {
                            // Llegó tarde (fuera del rango) → marcar como RETARDO
                            base[0] = { tipo: 'entrada', hora: entradaOriginal, observacion: 'RETARDO' };
                        } else {
                            // Llegó muy temprano → ajustar
                            base[0] = {
                                tipo: 'entrada',
                                hora: jitterHora(inicio, -5, 5, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${dia.fecha}|E1_ADJ`),
                                observacion: 'AJUSTADO'
                            };
                        }
                    }
                }
                
                // SALIDA A COMIDA
                if (regManana.salida) {
                    const salidaOriginal = normalizarHora(regManana.salida);
                    
                    if (estaDentroDeRango(salidaOriginal, comidaSalida, 'salida_comida')) {
                        // Está dentro del rango → ajustar al horario
                        base[1] = {
                            tipo: 'salida',
                            hora: jitterHora(comidaSalida, -10, 5, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${dia.fecha}|S1_ADJ`),
                            observacion: 'AJUSTADO'
                        };
                    }
                    // Si está fuera del rango, se mantiene el RELLENO (horario normal)
                }
            }
            
            // Procesar registro de la TARDE (entrada después de comida y salida final)
            if (registrosTarde.length > 0) {
                const regTarde = registrosTarde[0];
                
                // ENTRADA DESPUÉS DE COMIDA
                if (regTarde.entrada) {
                    const entradaOriginal = normalizarHora(regTarde.entrada);
                    
                    if (estaDentroDeRango(entradaOriginal, comidaEntrada, 'entrada_comida')) {
                        // Está dentro del rango → ajustar
                        base[2] = {
                            tipo: 'entrada',
                            hora: jitterHora(comidaEntrada, -5, 15, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${dia.fecha}|E2_ADJ`),
                            observacion: 'AJUSTADO'
                        };
                    }
                    // Si está fuera del rango, se mantiene el RELLENO
                }
                
                // SALIDA FINAL (usar el último registro válido de la tarde si existe)
                const ultimoRegTarde = registrosTarde[registrosTarde.length - 1];
                if (ultimoRegTarde && ultimoRegTarde.salida) {
                    const salidaOriginal = normalizarHora(ultimoRegTarde.salida);
                    
                    if (estaDentroDeRango(salidaOriginal, fin, 'salida')) {
                        // Está dentro del rango → ajustar
                        base[3] = {
                            tipo: 'salida',
                            hora: jitterHora(fin, -15, 5, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${dia.fecha}|S2_ADJ`),
                            observacion: 'AJUSTADO'
                        };
                    } else {
                        // Salió fuera del horario normal
                        const minSalida = horaAMinutos(salidaOriginal);
                        if (minSalida > horaAMinutos(fin) + RANGOS_TOLERANCIA.salida.max) {
                            // Salió después del horario → hora extra, usar real pero limitado
                            base[3] = { tipo: 'salida', hora: salidaOriginal, observacion: 'HORA EXTRA' };
                        }
                        // Si salió muy temprano, se mantiene el RELLENO
                    }
                }
            } else if (registrosManana.length > 0) {
                // Si solo hay registro de mañana pero no de tarde, verificar si el registro de mañana
                // tiene una salida que podría ser la salida final (no salió a comida)
                const regManana = registrosManana[0];
                if (regManana.salida) {
                    const salidaOriginal = normalizarHora(regManana.salida);
                    const minSalida = horaAMinutos(salidaOriginal);
                    
                    // Si la salida está cerca de la hora final (no de la comida)
                    if (minSalida > horaAMinutos(comidaEntrada)) {
                        if (estaDentroDeRango(salidaOriginal, fin, 'salida')) {
                            base[3] = {
                                tipo: 'salida',
                                hora: jitterHora(fin, -15, 5, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${dia.fecha}|S2_ADJ`),
                                observacion: 'AJUSTADO'
                            };
                        } else if (minSalida > horaAMinutos(fin) + RANGOS_TOLERANCIA.salida.max) {
                            base[3] = { tipo: 'salida', hora: salidaOriginal, observacion: 'HORA EXTRA' };
                        }
                    }
                }
            }

            const trabajo = calcularTrabajoDesdeRegistros(base);
            resultados.push({
                fecha: dia.fecha,
                tipo: "asistencia",
                registros: base,
                trabajado_minutos: trabajo.minutos,
                trabajado_hhmm: trabajo.hhmm,
                trabajado_decimal: trabajo.decimal,
                observacion_dia: "OK/PARCIAL",
                tipo_turno: infoTurnoDia.tipo_turno,
                max_horas: infoTurnoDia.max_horas
            });
            return;
        }

        // REGLA 6: Si NO tiene registro biométrico → inasistencia
        if (!tieneRegistroBiometrico) {
            resultados.push({
                fecha: dia.fecha,
                tipo: "inasistencia",
                registros: [],
                trabajado_minutos: 0,
                trabajado_hhmm: '00:00',
                trabajado_decimal: 0,
                observacion_dia: "SIN REGISTRO BIOMÉTRICO",
                tipo_turno: infoTurnoDia.tipo_turno,
                max_horas: infoTurnoDia.max_horas
            });
            return;
        }

        // REGLA 7: Tiene registro pero ya se completaron dias_trabajados → descanso
        resultados.push({
            fecha: dia.fecha,
            tipo: "descanso",
            registros: [],
            trabajado_minutos: 0,
            trabajado_hhmm: '00:00',
            trabajado_decimal: 0,
            observacion_dia: "DÍA DE DESCANSO",
            tipo_turno: infoTurnoDia.tipo_turno,
            max_horas: infoTurnoDia.max_horas
        });
    });

    return resultados;
}

/**
 * ===============================================================
 * Funcion para poblar departamentos, puestos, titulo y num semana
 * ===============================================================
 */
function poblarCamposDesdeDatos(datos) {
    // 1. Mostrar número de semana
    if (datos.numero_semana) {
        $('#num_semana').text('SEMANA ' + datos.numero_semana);
    }

    // 2. Mostrar título con fechas en mayúsculas
    if (datos.fecha_inicio && datos.fecha_cierre) {
        // Convertir a formato: CHEQUEO 29 DE NOVIEMBRE AL 5 DE DICIEMBRE DEL 2025
        function formatearFecha(fecha) {
            // fecha: 29/Nov/2025
            const partes = fecha.split('/');
            if (partes.length !== 3) return fecha.toUpperCase();
            const dia = partes[0];
            let mes = partes[1];
            const anio = partes[2];
            // Traducir meses
            const meses = {
                'ENE': 'ENERO', 'FEB': 'FEBRERO', 'MAR': 'MARZO', 'ABR': 'ABRIL',
                'MAY': 'MAYO', 'JUN': 'JUNIO', 'JUL': 'JULIO', 'AGO': 'AGOSTO',
                'SEP': 'SEPTIEMBRE', 'OCT': 'OCTUBRE', 'NOV': 'NOVIEMBRE', 'DIC': 'DICIEMBRE'
            };
            mes = mes.replace('.', '').toUpperCase();
            mes = meses[mes] || mes;
            return `${dia} DE ${mes} DEL ${anio}`.toUpperCase();
        }
        const fechaInicio = formatearFecha(datos.fecha_inicio);
        const fechaFin = formatearFecha(datos.fecha_cierre);
        const titulo = `CHEQUEO ${fechaInicio} AL ${fechaFin}`;
        $('#titulo_reloj').text(titulo);
    }

    // 3. Llenar select de departamentos
    const $select = $('#departamentos-reloj');
    $select.empty();
    $select.append(`<option value="-1">Departamentos (TODOS)</option>`);
    if (datos.departamentos && Array.isArray(datos.departamentos)) {
        datos.departamentos.forEach((depto, idx) => {
            $select.append(`<option value="${idx}">${depto.nombre}</option>`);
        });
    }

    // 4. Llenar select de puestos
    const $selectPuestos = $('#puestos-reloj');
    $selectPuestos.empty();
    $selectPuestos.append(`<option value="-1">Puestos (TODOS)</option>`);
    if (datos.puestos && Array.isArray(datos.puestos)) {
        datos.puestos.forEach((puesto, idx) => {
            $selectPuestos.append(`<option value="${puesto}">${puesto}</option>`);
        });
    }
}

/**
 * ================================
 * Guardar datos en sessionStorage
 * ================================
 */
function guardarDatosEnSesion(datos) {
    try {
        sessionStorage.setItem('reloj-ocho', JSON.stringify(datos));
    } catch (e) {
        console.error('Error al guardar en sessionStorage:', e);
    }
}

/**
 * ==============================================
 * Función para cargar datos desde sessionStorage
 * ==============================================
 */
function cargarDatosDeSesion() {
    try {
        const datos = sessionStorage.getItem('reloj-ocho');
        return datos ? JSON.parse(datos) : null;
    } catch (e) {
        console.error('Error al cargar de sessionStorage:', e);
        return null;
    }
}

/**
 * ====================================================
 * Función para limpiar los datos de sesión
 * ====================================================
 */
function limpiarDatosDeSesion() {
    // Elimina solo la clave 'reloj-ocho'
    sessionStorage.removeItem('reloj-ocho');

    $("#container-reloj").prop("hidden", false);
    $("#tabla-reloj-responsive").prop("hidden", true);
}

/**
 * =======================================
 * Mostrar una alerta de tipo SweetAlert2
 * =======================================
 */
function mostrar_alerta(titulo, texto, icono) {
    Swal.fire({
        title: titulo,
        html: texto,
        icon: icono,
        timer: 1500,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false
    });
}

/**
 * Quitar el icono de carga y habilitar el botón
 */
function quitar_icono_carga() {
    $('#btn_procesar_archivos').removeClass('loading').prop('disabled', false);
}

/**
 * ====================================================
 * PROCESAR DATOS DE EXCELS
 * ====================================================
 */
function processExcelData() {
    $('#btn_procesar_archivos').on('click', async function (e) {
        e.preventDefault();

        // Mostrar indicador de carga
        $(this).addClass('loading').prop('disabled', true);

        const form = $('#form_excel')[0];

        // =====================================================
        // Validar archivos OBLIGATORIOS (Lista de Raya y Central)
        // =====================================================
        const fileListaRaya = form.archivo_excel.files[0];
        const fileBiometricoCentral = form.archivo_excel2.files[0];

        if (!fileListaRaya) {
            mostrar_alerta("Datos incompletos", "Debes seleccionar el archivo de Lista de Raya", "warning");
            quitar_icono_carga();
            return;
        }

        if (!fileBiometricoCentral) {
            mostrar_alerta("Datos incompletos", "Debes seleccionar el archivo del Biométrico Central", "warning");
            quitar_icono_carga();
            return;
        }

        try {
            // =====================================================
            // 1. Procesar Lista de Raya (OBLIGATORIO)
            // =====================================================
            const formDataRaya = new FormData();
            formDataRaya.append('archivo_excel', fileListaRaya);

            const JsonListaRaya = await $.ajax({
                url: '../php/leer_lista_raya.php',
                type: 'POST',
                data: formDataRaya,
                dataType: 'json',
                processData: false,
                contentType: false
            });

            // =====================================================
            // 2. Procesar Biométrico Central (OBLIGATORIO)
            // =====================================================
            const formDataCentral = new FormData();
            formDataCentral.append('archivo_excel2', fileBiometricoCentral);

            const JsonBiometricoCentral = await $.ajax({
                url: '../php/leer_biometrico_central.php',
                type: 'POST',
                data: formDataCentral,
                dataType: 'json',
                processData: false,
                contentType: false
            });

            console.log("Biometrico Central", JsonBiometricoCentral);

            // =====================================================
            // 3. Procesar Biométricos de Ranchos (OPCIONALES)
            //    Detecta dinámicamente cuáles inputs tienen archivos
            // =====================================================
            const biometricosRanchos = [];
            const inputsRanchos = document.querySelectorAll('.input-biometrico-rancho');

            for (const input of inputsRanchos) {
                if (input.files && input.files.length > 0) {
                    const nombreRancho = input.dataset.rancho || input.name;
                    const fieldName = input.name;

                    console.log(`Procesando biométrico de rancho: ${nombreRancho}`);

                    const formDataRancho = new FormData();
                    formDataRancho.append(fieldName, input.files[0]);
                    formDataRancho.append('field_name', fieldName);

                    try {
                        const jsonRancho = await $.ajax({
                            url: '../php/leer_biometrico_generico.php',
                            type: 'POST',
                            data: formDataRancho,
                            dataType: 'json',
                            processData: false,
                            contentType: false
                        });

                        if (jsonRancho && !jsonRancho.error) {
                            biometricosRanchos.push({
                                nombre: nombreRancho,
                                datos: jsonRancho
                            });
                            console.log(`Biométrico ${nombreRancho} procesado:`, jsonRancho);
                        } else if (jsonRancho.error) {
                            console.warn(`Error en biométrico ${nombreRancho}:`, jsonRancho.error);
                        }
                    } catch (errorRancho) {
                        console.warn(`No se pudo procesar biométrico de ${nombreRancho}:`, errorRancho);
                        // Continuar con los demás ranchos
                    }
                }
            }

            console.log(`Total de biométricos de ranchos procesados: ${biometricosRanchos.length}`);

            // =====================================================
            // 4. Unir todos los JSONs
            // =====================================================
            const JsonUnido = await unirJson(JsonListaRaya, JsonBiometricoCentral, biometricosRanchos);

            console.log("JSON Unido:", JsonUnido);

            // =====================================================
            // 5. Procesar registros y guardar
            // =====================================================
            try {
                const festivosSet = await obtenerFestividadesSet();
                procesarTodosRegistros(JsonUnido, festivosSet);
            } catch (errorFestivos) {
                console.warn('No se pudieron cargar festividades, continuando sin ellas');
                procesarTodosRegistros(JsonUnido);
            }

            guardarDatosEnSesion(JsonUnido);
            poblarCamposDesdeDatos(JsonUnido);
            $(document).trigger('reloj-data-updated');

            // Limpiar formulario
            $("#form_excel")[0].reset();

            // Ocultar formulario y mostrar tabla
            $("#container-reloj").prop("hidden", true);
            $("#tabla-reloj-responsive").prop("hidden", false);

        } catch (error) {
            console.error('Error al procesar los archivos:', error);
            mostrar_alerta("Error", "Ocurrió un error al procesar los datos: " + (error.message || error), "error");
        } finally {
            quitar_icono_carga();
        }

    }); // Fin del evento click

}

/**
 * ====================================================
 * OBTENER DATOS DE EMPLEADOS DESDE LA BASE DE DATOS
 * ====================================================
 */
function obtenerDatosEmpleados() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '../php/obtenerEmpleadosSN.php',
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                // Crear un mapa de empleados por nombre completo normalizado
                const empleadosMap = new Map();

                response.forEach(empleado => {
                    // Crear nombre completo (ap_paterno ap_materno nombre)
                    // Asegurar que no haya espacios dobles o valores null/undefined
                    const ap_paterno = (empleado.ap_paterno || '').trim();
                    const ap_materno = (empleado.ap_materno || '').trim();
                    const nombre = (empleado.nombre || '').trim();
                    
                    const nombreCompleto = `${ap_paterno} ${ap_materno} ${nombre}`.replace(/\s+/g, ' ').trim();

                    // Normalizar nombre para búsqueda
                    const nombreNormalizado = normalizar(nombreCompleto);

                    // Parsear el horario JSON si existe
                    let horario = [];
                    if (empleado.horario_json) {
                        try {
                            horario = JSON.parse(empleado.horario_json);
                        } catch (e) {
                            console.error('Error al parsear horario_json:', e);
                            horario = [];
                        }
                    }

                    // Agregar al mapa
                    empleadosMap.set(nombreNormalizado, {
                        id_empleado: empleado.id_empleado,
                        clave_empleado: empleado.clave_empleado,
                        nombre_completo: nombreCompleto,
                        horario_fijo: empleado.horario_fijo,
                        horario: horario
                    });
                    
                    // Debug: Log para verificar nombres
                    // console.log(`BD: "${nombreCompleto}" -> Normalizado: "${nombreNormalizado}"`);
                });

                resolve(empleadosMap);
            },
            error: function (xhr, status, error) {
                console.error('Error al obtener datos de empleados:', error);
                reject(error);
            }
        });
    });
}

/**
 * ====================================================
 *  NORMALIZA NOMBRE PARA QUE TODOS SEAN IGUALES
 * ====================================================
 * - Quita Acentos.
 * - Si tiene varios espacios nomas deja uno.
 * - Elimina espacio al inicio y al final.
 * - Combierte a mayuscula.
 * - Convierte las palabras en un arreglo.
 * - Ordena de forma lexica pa que tenga sentido.
 * - Vuelve a unir toda la cadena.
 * ====================================================
 */
function normalizar(s) {
    if (!s) return '';
    return s
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase()
        .split(" ")
        .sort()
        .join(" ");
}

/**
 * Calcula similitud entre dos nombres normalizados (0-1)
 * Usa coincidencia de palabras individuales
 */
function calcularSimilitudNombres(nombre1, nombre2) {
    const palabras1 = normalizar(nombre1).split(" ").filter(p => p.length > 2); // Ignorar palabras muy cortas como "DE"
    const palabras2 = normalizar(nombre2).split(" ").filter(p => p.length > 2);
    
    if (palabras1.length === 0 || palabras2.length === 0) return 0;
    
    let coincidencias = 0;
    palabras1.forEach(p1 => {
        if (palabras2.some(p2 => p2 === p1 || p2.includes(p1) || p1.includes(p2))) {
            coincidencias++;
        }
    });
    
    return coincidencias / Math.max(palabras1.length, palabras2.length);
}

// Función para unir múltiples JSON con normalización
// biometricosRanchos es un array de objetos: [{nombre: 'Relicario', datos: jsonData}, ...]
async function unirJson(jsonListaRaya, jsonBiometricoCentral, biometricosRanchos = []) {
    // Primero obtenemos los datos de los empleados
    let empleadosMap;
    try {
        empleadosMap = await obtenerDatosEmpleados();
    } catch (error) {
        console.error('No se pudieron cargar los datos de empleados:', error);
        // Continuamos sin los datos de empleados si hay un error
        empleadosMap = new Map();
    }

    // Obtener los turnos desde la base de datos
    let turnosLey = [];
    try {
        turnosLey = await obtenerTurnos();
    } catch (error) {
        console.error('No se pudieron cargar los turnos:', error);
    }

    // Función para crear mapa de empleados a partir de un JSON biométrico
    const crearMapaEmpleados = (jsonBiometrico) => {
        const mapa = {};
        if (jsonBiometrico && jsonBiometrico.empleados) {
            jsonBiometrico.empleados.forEach(emp => {
                mapa[normalizar(emp.nombre)] = {
                    id_biometrico: emp.id_biometrico || null,
                    registros: emp.registros || [],
                    horas_totales: emp.horas_totales || '0.00',
                    tiempo_total: emp.tiempo_total || '0:00'
                };
            });
        }
        return mapa;
    };

    // Crear mapa para el biométrico Central (obligatorio)
    const empleadosCentralMap = crearMapaEmpleados(jsonBiometricoCentral);

    // Crear array de fuentes biométricas dinámicamente
    const fuentesBiometricas = [
        { datos: empleadosCentralMap, nombre: 'Central' }
    ];

    // Agregar dinámicamente los biométricos de ranchos
    biometricosRanchos.forEach(rancho => {
        const mapaRancho = crearMapaEmpleados(rancho.datos);
        fuentesBiometricas.push({
            datos: mapaRancho,
            nombre: rancho.nombre
        });
        console.log(`Fuente biométrica agregada: ${rancho.nombre} con ${Object.keys(mapaRancho).length} empleados`);
    });

    console.log(`Total de fuentes biométricas: ${fuentesBiometricas.length}`);

    /**
     * =========================================================
     * Verifica si existen el jsonListaRaya y sus departamentos
     * =========================================================
     */
    if (jsonListaRaya && jsonListaRaya.departamentos) {

        /**
         * =======================================
         * Comienza a recorrer cada departamento
         * =======================================
         */
        jsonListaRaya.departamentos.forEach(depto => {

            // Verifica si existen empleados en el departamento
            if (depto.empleados) {

                /**
                 * ===================================
                 *  Comienza a recorrer cada empleado
                 * ===================================
                 */
                depto.empleados.forEach(empRaya => {

                    // Recupera el nombre y lo manda a normalizar
                    const nombreNormalizado = normalizar(empRaya.nombre);

                    // Inicializar el arreglo de registros si no existe
                    if (!empRaya.registros) {
                        empRaya.registros = [];
                    }

                    // Buscar en cada fuente biométrica con búsqueda flexible
                    let datosEncontrados = false;

                    fuentesBiometricas.forEach(fuente => {
                        // Primero intentar búsqueda exacta
                        let empleadoBiometrico = fuente.datos[nombreNormalizado];
                        
                        // Si no hay coincidencia exacta, buscar por similitud
                        if (!empleadoBiometrico) {
                            let mejorSimilitud = 0;
                            let mejorCandidato = null;
                            
                            Object.keys(fuente.datos).forEach(nombreBio => {
                                const similitud = calcularSimilitudNombres(empRaya.nombre, nombreBio);
                                if (similitud > mejorSimilitud && similitud >= 0.7) { // 70% de similitud mínima
                                    mejorSimilitud = similitud;
                                    mejorCandidato = nombreBio;
                                }
                            });
                            
                            if (mejorCandidato) {
                                // console.log(`Coincidencia por similitud (${Math.round(mejorSimilitud * 100)}%): "${empRaya.nombre}" ≈ "${mejorCandidato}"`);
                                empleadoBiometrico = fuente.datos[mejorCandidato];
                            }
                        }
                        
                        if (empleadoBiometrico && empleadoBiometrico.registros && empleadoBiometrico.registros.length > 0) {
                            // Si aún no se han asignado datos biométricos, asignarlos
                            if (!datosEncontrados) {
                                empRaya.id_biometrico = empleadoBiometrico.id_biometrico;
                                empRaya.fuente_biometrico = fuente.nombre;
                                datosEncontrados = true;
                            }

                            // Agregar solo los registros que no estén ya en el arreglo
                            // Comparar por fecha + entrada para evitar duplicados
                            empleadoBiometrico.registros.forEach(registro => {
                                if (!empRaya.registros.some(r => 
                                    r.fecha === registro.fecha && 
                                    r.entrada === registro.entrada && 
                                    r.salida === registro.salida
                                )) {
                                    empRaya.registros.push(registro);
                                }
                            });
                        }
                    });

                    // Ordenar registros por fecha y entrada
                    if (empRaya.registros.length > 0) {
                        empRaya.registros.sort((a, b) => {
                            // Convertir fecha dd/mm/yyyy a yyyy-mm-dd para ordenar correctamente
                            const parseFecha = (f) => {
                                if (!f) return '';
                                const [d, m, y] = f.split('/');
                                return `${y}-${m}-${d}`;
                            };
                            const fechaA = parseFecha(a.fecha);
                            const fechaB = parseFecha(b.fecha);
                            if (fechaA !== fechaB) return fechaA.localeCompare(fechaB);
                            // Si misma fecha, ordenar por hora de entrada
                            return (a.entrada || '').localeCompare(b.entrada || '');
                        });
                    }

                    // Agregar información del empleado desde la base de datos si está disponible
                    const empleadoInfo = empleadosMap.get(nombreNormalizado);
                    if (empleadoInfo) {
                        //console.log(`✓ Empleado encontrado: ${empRaya.nombre} -> ${empleadoInfo.nombre_completo}`);
                        empRaya.id_empleado = empleadoInfo.id_empleado;
                        empRaya.clave_empleado = empleadoInfo.clave_empleado;
                        empRaya.horario = empleadoInfo.horario || [];

                        /**
                         * =============================================
                         *  Se agrega de la base de datos
                         *  para saber si el empleado tiene horario fijo
                         * =============================================
                         */
                        empRaya.horario_fijo = parseInt(empleadoInfo.horario_fijo, 10);

                        /**
                         * =============================================
                         *  Se agrega de la base de datos
                         *  para saber si el empleado aplica horario variable
                         * =============================================
                         */
                        empRaya.aplicar_horario_variable = (empRaya.horario_fijo === 1) ? false : true;
                        
                        // Si no tiene id_biometrico (no se encontró en biométricos), usar clave_empleado
                        if (!empRaya.id_biometrico) {
                            empRaya.id_biometrico = empleadoInfo.clave_empleado;
                            empRaya.fuente_biometrico = 'Clave Empleado';
                        }

                        // Verificar si el empleado tiene registro de nómina
                        if (typeof empRaya.tiene_nomina === 'undefined') {
                            empRaya.tiene_nomina = true; // Asumimos que sí tiene si está en la lista de empleados con seguro
                        }
                    } else {
                        console.warn(`Empleado no encontrado en la base de datos: ${empRaya.nombre}`);
                        empRaya.id_empleado = null;
                        empRaya.clave_empleado = null;
                        empRaya.horario = [];
                        empRaya.tiene_nomina = false; // Marcar como que no tiene nómina si no está en la lista
                    }
                });
            }
        });
    }

    return jsonListaRaya;
}