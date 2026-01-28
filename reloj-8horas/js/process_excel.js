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
        text: "Recuerda guardar en el historial si deseas conservar los datos actuales.",
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
                // Si el horario tiene entrada y salida vacías o null, es día de descanso
                const entrada = turnoDelDia.entrada && turnoDelDia.entrada.trim() !== '' ? turnoDelDia.entrada : null;
                const salida = turnoDelDia.salida && turnoDelDia.salida.trim() !== '' ? turnoDelDia.salida : null;

                // Si ambas están vacías, es día de descanso (retornar null)
                if (!entrada || !salida) {
                    return {
                        hora_inicio: null,
                        hora_fin: null,
                        salida_comida: null,
                        entrada_comida: null,
                        tiene_comida: false
                    };
                }

                // Verificar si el horario tiene comida definida
                const salidaComida = turnoDelDia.salida_comida && turnoDelDia.salida_comida.trim() !== '' ? turnoDelDia.salida_comida : null;
                const entradaComida = turnoDelDia.entrada_comida && turnoDelDia.entrada_comida.trim() !== '' ? turnoDelDia.entrada_comida : null;
                const tieneComida = salidaComida !== null && entradaComida !== null;

                return {
                    hora_inicio: entrada,
                    hora_fin: salida,
                    salida_comida: salidaComida,
                    entrada_comida: entradaComida,
                    tiene_comida: tieneComida
                };
            }
        }
        // Valores por defecto si no hay horario definido para este día
        return {
            hora_inicio: null,
            hora_fin: null,
            salida_comida: null,
            entrada_comida: null,
            tiene_comida: false
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
    // REGLA DE ORO: Lo que le CONVIENE a la empresa → CONSERVAR
    //               Lo que NO le conviene → REDONDEAR al horario
    // 
    // ENTRADA TRABAJO:
    //   - Llega TARDE → CONSERVAR (no paga esos minutos) ✓ CONVIENE
    //   - Llega a tiempo (rango -15 a 0 min) → CONSERVAR ✓ OK
    //   - Llega MUY TEMPRANO → REDONDEAR (no pagar tiempo extra) ✗ NO CONVIENE
    //
    // SALIDA A COMIDA:
    //   - Sale ANTES de su hora → CONSERVAR (trabajó menos) ✓ CONVIENE
    //   - Sale a tiempo o poco después (0 a +15 min) → CONSERVAR ✓ OK
    //   - Sale MUY TARDE → REDONDEAR (está trabajando de más sin pago) ✗ NO CONVIENE
    //
    // ENTRADA DE COMIDA (regreso):
    //   - Regresa TARDE → CONSERVAR (no paga esos minutos) ✓ CONVIENE
    //   - Regresa a tiempo (rango -5 a +10 min) → CONSERVAR ✓ OK
    //   - Regresa MUY TEMPRANO → REDONDEAR (está trabajando de más) ✗ NO CONVIENE
    //
    // SALIDA A CASA:
    //   - Sale ANTES o a tiempo → CONSERVAR ✓ OK/CONVIENE
    //   - Sale MUY TARDE → REDONDEAR (no pagar horas extra) ✗ NO CONVIENE
    //
    const RANGOS_TOLERANCIA = {
        entrada: { min: -15, max: 0 },           // Entrada: 15 min antes hasta hora exacta
        salida_comida: { min: 0, max: 15 },      // Salida comida: hora exacta hasta 15 min después
        entrada_comida: { min: -5, max: 10 },    // Entrada comida: 5 min antes hasta 10 después
        salida: { min: -30, max: 0 }             // Salida final: 30 min antes hasta hora exacta
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

        // Verificar si el turno tiene comida
        const tieneComida = turno.tiene_comida === true;

        // Rangos de variación para datos generados (más realistas):
        // Entrada: -10 a +3 minutos (puede llegar 10 min antes hasta 3 después)
        const e1 = jitterHora(inicio, -10, 3, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${fecha}|E1`);
        // Salida final: -10 a 0 minutos (ej: 5:50 - 6:00 si sale a 6:00) - NUNCA DESPUÉS
        const s2 = jitterHora(fin, -10, 0, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${fecha}|S2`);

        // Si NO tiene comida, solo devolver entrada y salida (2 registros)
        if (!tieneComida) {
            return [
                { tipo: 'entrada', hora: e1, observacion },
                { tipo: 'salida', hora: s2, observacion }
            ];
        }

        // Si tiene comida, devolver los 4 registros
        const comidaSalidaBase = normalizarHora(turno.salida_comida);
        const comidaEntradaBase = normalizarHora(turno.entrada_comida);

        // Salida a comida: -10 a +5 minutos (ej: 12:50 - 1:05 si comida es a 1:00)
        const s1 = jitterHora(comidaSalidaBase, -10, 5, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${fecha}|S1`);
        // Entrada después de comida: -5 a +10 minutos (puede regresar 5 antes hasta 10 después)
        const e2 = jitterHora(comidaEntradaBase, -5, 10, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${fecha}|E2`);

        return [
            { tipo: 'entrada', hora: e1, observacion },
            { tipo: 'salida', hora: s1, observacion },
            { tipo: 'entrada', hora: e2, observacion },
            { tipo: 'salida', hora: s2, observacion }
        ];
    }

    function calcularTrabajoDesdeRegistros(registros, maxHorasTurno = 8) {
        let minutosTrabajados = 0;
        const maxMinutos = maxHorasTurno * 60; // Convertir máximo de horas a minutos

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

        // Limitar al máximo de horas del turno (no puede exceder)
        if (minutosTrabajados > maxMinutos) {
            minutosTrabajados = maxMinutos;
        }

        return {
            minutos: minutosTrabajados,
            hhmm: minutosAHora(minutosTrabajados),
            decimal: Math.round((minutosTrabajados / 60) * 100) / 100
        };
    }

    // ============================================================
    // FUNCIÓN PARA AJUSTAR REGISTROS SI EXCEDEN MÁXIMO DE HORAS
    // Si el tiempo trabajado excede max_horas + 15 minutos,
    // ajusta la salida final para que quede dentro del límite
    // ============================================================
    function ajustarRegistrosSiExcedenMaximo(registros, maxHorasTurno, seedKey) {
        if (!registros || registros.length === 0) return registros;
        
        const TOLERANCIA_MINUTOS = 15; // 15 minutos de tolerancia sobre el máximo
        const maxMinutosPermitidos = (maxHorasTurno * 60) + TOLERANCIA_MINUTOS;
        
        // Calcular tiempo trabajado actual
        let minutosTrabajados = 0;
        const pares = []; // Guardar pares entrada/salida con sus índices
        
        for (let i = 0; i < registros.length; i++) {
            if (registros[i].tipo === 'entrada' && i + 1 < registros.length && registros[i + 1].tipo === 'salida') {
                const e = horaAMinutos(registros[i].hora);
                const s = horaAMinutos(registros[i + 1].hora);
                let duracion = s >= e ? (s - e) : ((24 * 60) - e + s);
                minutosTrabajados += duracion;
                pares.push({ 
                    idxEntrada: i, 
                    idxSalida: i + 1, 
                    minEntrada: e, 
                    minSalida: s, 
                    duracion: duracion 
                });
                i++;
            }
        }
        
        // Si no excede el máximo permitido, no hacer nada
        if (minutosTrabajados <= maxMinutosPermitidos) {
            return registros;
        }
        
        // Calcular cuántos minutos hay que recortar
        const exceso = minutosTrabajados - maxMinutosPermitidos;
        
        // Encontrar el último par (salida final) para ajustar
        if (pares.length === 0) return registros;
        
        const ultimoPar = pares[pares.length - 1];
        const idxSalidaFinal = ultimoPar.idxSalida;
        
        // Calcular nueva hora de salida (restar el exceso + variación aleatoria de -25 a -10 min)
        // Esto hace que la salida quede entre 10-25 minutos antes del límite máximo
        const variacion = 10 + (hashString(seedKey + '|AJUSTE') % 16); // Variación de 10 a 25 min
        const nuevaSalidaMinutos = ultimoPar.minSalida - exceso - variacion;
        const nuevaSalidaHora = minutosAHora(nuevaSalidaMinutos);
        
        // Actualizar el registro de salida
        registros[idxSalidaFinal] = {
            tipo: 'salida',
            hora: nuevaSalidaHora,
            observacion: 'AJUSTADO (EXCEDE MÁXIMO TURNO)'
        };
        
        return registros;
    }

    // Variables de control
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
    // Si registros está vacío, el empleado no está dado de alta en el reloj
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
                    ultimoTurnoValido = determinarTipoTurnoDia(entrada, salida);
                    break; // Ya encontramos un turno válido, salir del bucle
                }
            }
        }
    }

    diasSemana.forEach(dia => {
        // Obtener turno del día ANTES de las reglas para poder actualizar ultimoTurnoValido
        const turno = obtenerTurnoPorDia(dia.fecha);
        const esLaborable = turno.hora_inicio && turno.hora_fin;

        // Si este día tiene horario válido, actualizar como último turno válido
        if (esLaborable) {
            ultimoTurnoValido = determinarTipoTurnoDia(turno.hora_inicio, turno.hora_fin);
        }

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
                tipo_turno: ultimoTurnoValido.tipo_turno, // Usar el turno del último día laborable
                max_horas: ultimoTurnoValido.max_horas
            });
            return;
        }

        // REGLA 1.5: DÍAS FESTIVOS → marcar como dia_festivo
        // Verificar si la fecha está en el set de festividades
        if (festivosSet.has(dia.fecha)) {
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

        // Calcular tipo de turno para este día específico (o usar el último válido si no hay horario)
        const infoTurnoDia = esLaborable ? determinarTipoTurnoDia(turno.hora_inicio, turno.hora_fin) : ultimoTurnoValido;

        // Verificar si tiene registro biométrico REAL (ahora es un array de registros del día)
        const registrosDelDia = registrosMap[dia.fecha] || [];
        const tieneRegistroBiometrico = registrosDelDia.length > 0 &&
            registrosDelDia.some(r => r.entrada || r.salida);

        // REGLA 2: Días NO laborables según horario → no_laboro (no es descanso ni ausencia)
        // Solo el DOMINGO es "descanso" oficial, los demás días sin horario son "no_laboro"
        if (!esLaborable) {
            resultados.push({
                fecha: dia.fecha,
                tipo: "no_laboro",
                registros: [],
                trabajado_minutos: 0,
                trabajado_hhmm: '00:00',
                trabajado_decimal: 0,
                observacion_dia: "NO LABORA ESTE DÍA",
                tipo_turno: ultimoTurnoValido.tipo_turno, // Usar el turno del último día laborable
                max_horas: ultimoTurnoValido.max_horas
            });
            return;
        }

        // NOTA: Las propiedades globales (empleado.vacaciones, empleado.incapacidades, empleado.ausencias)
        // NO se usan aquí para asignar automáticamente a todos los días.
        // Los eventos por día (vacaciones, incapacidad, ausencia) se asignan manualmente
        // y se preservan con la bandera 'editado_manualmente' en cada registro_procesado.
        // Las propiedades globales solo son indicadores calculados DESPUÉS de los registros.

        // REGLA 3: Departamentos especiales (CDMX, Compra) → auto-generan si hay espacio
        if (esDeptoEspecial && diasProcesados < diasTrabajadosRestantes) {
            diasProcesados++;
            const registrosDia = construirRegistrosDia(turno, dia.fecha, 'REGISTRO AUTOMÁTICO');
            const trabajo = calcularTrabajoDesdeRegistros(registrosDia, infoTurnoDia.max_horas);
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

        // ================================================================
        // REGLA 3.5: Empleado SIN registros biométricos (no dado de alta en reloj)
        // pero SÍ tiene horario definido → auto-generar según dias_trabajados
        // ================================================================
        if (!tieneRegistrosBiometricos && diasProcesados < diasTrabajadosRestantes) {
            diasProcesados++;
            const registrosDia = construirRegistrosDia(turno, dia.fecha, 'SIN BIOMÉTRICO');
            const trabajo = calcularTrabajoDesdeRegistros(registrosDia, infoTurnoDia.max_horas);
            resultados.push({
                fecha: dia.fecha,
                tipo: "asistencia",
                registros: registrosDia,
                trabajado_minutos: trabajo.minutos,
                trabajado_hhmm: trabajo.hhmm,
                trabajado_decimal: trabajo.decimal,
                observacion_dia: "SIN REGISTRO EN RELOJ",
                tipo_turno: infoTurnoDia.tipo_turno,
                max_horas: infoTurnoDia.max_horas
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
                    tipo_turno: infoTurnoDia.tipo_turno,
                    max_horas: infoTurnoDia.max_horas
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
                    tipo_turno: infoTurnoDia.tipo_turno,
                    max_horas: infoTurnoDia.max_horas
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
                    tipo_turno: infoTurnoDia.tipo_turno,
                    max_horas: infoTurnoDia.max_horas
                });
                return;
            }

            // Si no hay más eventos, es descanso
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
            return;
        }

        // REGLA 4: SOLO trabajó si tiene registro biométrico Y hay espacio en dias_trabajados
        if (tieneRegistroBiometrico && diasProcesados < diasTrabajadosRestantes) {
            diasProcesados++;

            // registrosDelDia es un array de registros (cada uno con entrada/salida)
            const inicio = normalizarHora(turno.hora_inicio);
            const fin = normalizarHora(turno.hora_fin);

            // Verificar si el turno tiene comida definida
            const tieneComida = turno.tiene_comida === true;
            const comidaSalida = tieneComida ? normalizarHora(turno.salida_comida) : null;
            const comidaEntrada = tieneComida ? normalizarHora(turno.entrada_comida) : null;

            // Iniciar con registros base (RELLENO según horario)
            const base = construirRegistrosDia(turno, dia.fecha, 'RELLENO');

            // ================================================================
            // RECOLECTAR TODAS LAS MARCAS DEL DÍA (entradas y salidas separadas)
            // ================================================================
            const todasLasMarcasRaw = [];
            const minInicio = horaAMinutos(inicio);
            const minFin = horaAMinutos(fin);
            const margenAmplio = 180; // 3 horas de margen

            registrosDelDia.forEach(r => {
                // Agregar entrada si existe y es válida
                if (r.entrada) {
                    const horaEntrada = normalizarHora(r.entrada);
                    const minEntrada = horaAMinutos(horaEntrada);
                    if (minEntrada >= (minInicio - margenAmplio) && minEntrada <= (minFin + margenAmplio)) {
                        todasLasMarcasRaw.push({ hora: horaEntrada, minutos: minEntrada, origen: 'entrada' });
                    }
                }
                // Agregar salida si existe y es válida
                if (r.salida) {
                    const horaSalida = normalizarHora(r.salida);
                    const minSalida = horaAMinutos(horaSalida);
                    if (minSalida >= (minInicio - margenAmplio) && minSalida <= (minFin + margenAmplio)) {
                        todasLasMarcasRaw.push({ hora: horaSalida, minutos: minSalida, origen: 'salida' });
                    }
                }
            });

            // Ordenar todas las marcas por hora
            todasLasMarcasRaw.sort((a, b) => a.minutos - b.minutos);

            // ================================================================
            // DEDUPLICACIÓN: Filtrar marcas duplicadas/muy cercanas
            // Si hay dos marcas a menos de 15 minutos de diferencia, conservar solo la primera
            // Esto evita que marcaciones accidentales dobles generen pares entrada/salida falsos
            // Ejemplo: empleado marca a 8:45 y vuelve a marcar a 8:55 → solo se conserva 8:45
            // ================================================================
            const MINUTOS_MINIMOS_ENTRE_MARCAS = 15; // Mínimo 15 minutos entre marcas válidas
            const todasLasMarcas = [];

            for (let i = 0; i < todasLasMarcasRaw.length; i++) {
                const marcaActual = todasLasMarcasRaw[i];

                // Si es la primera marca o está suficientemente lejos de la última aceptada
                if (todasLasMarcas.length === 0) {
                    todasLasMarcas.push(marcaActual);
                } else {
                    const ultimaMarcaAceptada = todasLasMarcas[todasLasMarcas.length - 1];
                    const diferencia = marcaActual.minutos - ultimaMarcaAceptada.minutos;

                    if (diferencia >= MINUTOS_MINIMOS_ENTRE_MARCAS) {
                        // Marca válida, está suficientemente lejos
                        todasLasMarcas.push(marcaActual);
                    }
                    // Si diferencia < 15 min → se ignora (marca duplicada/accidental)
                }
            }

            // ================================================================
            // CLASIFICAR MARCAS SEGÚN HORARIO DEL EMPLEADO
            // Considerar si el turno tiene comida o no
            // ================================================================
            const minComidaSalida = tieneComida ? horaAMinutos(comidaSalida) : null;
            const minComidaEntrada = tieneComida ? horaAMinutos(comidaEntrada) : null;

            // Definir rangos para cada tipo de marca
            const rangos = {
                entrada: { min: minInicio - 60, max: minInicio + 90 },           // 1hr antes hasta 1.5hr después
                salida: { min: minFin - 120, max: minFin + 120 }                 // 2 horas antes/después
            };

            // Solo agregar rangos de comida si el turno tiene comida
            if (tieneComida) {
                rangos.salidaComida = { min: minComidaSalida - 30, max: minComidaSalida + 30 };  // 30 min antes/después
                rangos.entradaComida = { min: minComidaEntrada - 30, max: minComidaEntrada + 60 }; // 30 min antes, 1hr después
            }

            // Variables para guardar las marcas clasificadas
            let marcaEntrada = null;
            let marcaSalidaComida = null;
            let marcaEntradaComida = null;
            let marcaSalida = null;

            // ================================================================
            // TURNO SIN COMIDA: Solo espera 2 marcas (entrada y salida)
            // ================================================================
            if (!tieneComida) {
                if (todasLasMarcas.length === 1) {
                    const marca = todasLasMarcas[0];
                    // Calcular distancias a entrada y salida
                    const distEntrada = Math.abs(marca.minutos - minInicio);
                    const distSalida = Math.abs(marca.minutos - minFin);

                    if (distEntrada <= distSalida && marca.minutos >= rangos.entrada.min && marca.minutos <= rangos.entrada.max) {
                        marcaEntrada = marca;
                    } else if (marca.minutos >= rangos.salida.min && marca.minutos <= rangos.salida.max) {
                        marcaSalida = marca;
                    } else if (marca.minutos <= (minInicio + minFin) / 2) {
                        // Antes del punto medio → entrada
                        marcaEntrada = marca;
                    } else {
                        // Después del punto medio → salida
                        marcaSalida = marca;
                    }
                } else if (todasLasMarcas.length >= 2) {
                    // Primera = entrada, última = salida
                    marcaEntrada = todasLasMarcas[0];
                    marcaSalida = todasLasMarcas[todasLasMarcas.length - 1];
                }
            }
            // ================================================================
            // TURNO CON COMIDA: Espera hasta 4 marcas
            // ================================================================
            else {
                // CASO ESPECIAL: Solo hay 1 marca
                if (todasLasMarcas.length === 1) {
                    const marca = todasLasMarcas[0];

                    // Calcular distancias a cada tipo de marca esperada
                    const distEntrada = Math.abs(marca.minutos - minInicio);
                    const distSalidaComida = Math.abs(marca.minutos - minComidaSalida);
                    const distEntradaComida = Math.abs(marca.minutos - minComidaEntrada);
                    const distSalida = Math.abs(marca.minutos - minFin);

                    // Encontrar la distancia mínima para clasificar la marca
                    const minDist = Math.min(distEntrada, distSalidaComida, distEntradaComida, distSalida);

                    if (minDist === distEntrada && marca.minutos >= rangos.entrada.min && marca.minutos <= rangos.entrada.max) {
                        marcaEntrada = marca;
                    }
                    else if (minDist === distEntradaComida && marca.minutos >= rangos.entradaComida.min && marca.minutos <= rangos.entradaComida.max) {
                        marcaEntradaComida = marca;
                    }
                    else if (minDist === distSalidaComida && marca.minutos >= rangos.salidaComida.min && marca.minutos <= rangos.salidaComida.max) {
                        marcaSalidaComida = marca;
                    }
                    else if (minDist === distSalida && marca.minutos >= rangos.salida.min && marca.minutos <= rangos.salida.max) {
                        marcaSalida = marca;
                    }
                    else if (marca.minutos <= minComidaSalida) {
                        marcaEntrada = marca;
                    }
                    else if (marca.minutos >= minComidaEntrada && marca.minutos < minFin - 60) {
                        marcaEntradaComida = marca;
                    }
                    else {
                        marcaSalida = marca;
                    }
                }

                // CASO: 2 marcas en turno con comida
                // Analizar a qué tipo de marca se acerca cada una
                // Ejemplo: Horario 9-13-15-19, marcas 08:26 y 15:05
                // → 08:26 cerca de entrada (9:00), 15:05 cerca de entrada comida (15:00)
                else if (todasLasMarcas.length === 2) {
                    const primera = todasLasMarcas[0];
                    const segunda = todasLasMarcas[1];

                    // Calcular distancias de la primera marca a cada tipo
                    const dist1Entrada = Math.abs(primera.minutos - minInicio);
                    const dist1SalidaComida = Math.abs(primera.minutos - minComidaSalida);
                    const dist1EntradaComida = Math.abs(primera.minutos - minComidaEntrada);
                    const dist1Salida = Math.abs(primera.minutos - minFin);

                    // Calcular distancias de la segunda marca a cada tipo
                    const dist2Entrada = Math.abs(segunda.minutos - minInicio);
                    const dist2SalidaComida = Math.abs(segunda.minutos - minComidaSalida);
                    const dist2EntradaComida = Math.abs(segunda.minutos - minComidaEntrada);
                    const dist2Salida = Math.abs(segunda.minutos - minFin);

                    // Determinar el mejor tipo para la primera marca
                    const minDist1 = Math.min(dist1Entrada, dist1SalidaComida, dist1EntradaComida, dist1Salida);

                    // Determinar el mejor tipo para la segunda marca
                    const minDist2 = Math.min(dist2Entrada, dist2SalidaComida, dist2EntradaComida, dist2Salida);

                    // Asignar primera marca
                    if (minDist1 === dist1Entrada) {
                        marcaEntrada = primera;
                    } else if (minDist1 === dist1SalidaComida) {
                        marcaSalidaComida = primera;
                    } else if (minDist1 === dist1EntradaComida) {
                        marcaEntradaComida = primera;
                    } else {
                        marcaSalida = primera;
                    }

                    // Asignar segunda marca (evitando asignar al mismo tipo que la primera)
                    if (minDist2 === dist2Salida && !marcaSalida) {
                        marcaSalida = segunda;
                    } else if (minDist2 === dist2EntradaComida && !marcaEntradaComida) {
                        marcaEntradaComida = segunda;
                    } else if (minDist2 === dist2SalidaComida && !marcaSalidaComida) {
                        marcaSalidaComida = segunda;
                    } else if (minDist2 === dist2Entrada && !marcaEntrada) {
                        marcaEntrada = segunda;
                    } else {
                        // Fallback: si ya está ocupado el tipo más cercano, usar el segundo más cercano
                        const distancias2 = [
                            { tipo: 'salida', dist: dist2Salida, ocupado: !!marcaSalida },
                            { tipo: 'entradaComida', dist: dist2EntradaComida, ocupado: !!marcaEntradaComida },
                            { tipo: 'salidaComida', dist: dist2SalidaComida, ocupado: !!marcaSalidaComida },
                            { tipo: 'entrada', dist: dist2Entrada, ocupado: !!marcaEntrada }
                        ].filter(d => !d.ocupado).sort((a, b) => a.dist - b.dist);

                        if (distancias2.length > 0) {
                            const mejorTipo = distancias2[0].tipo;
                            if (mejorTipo === 'salida') marcaSalida = segunda;
                            else if (mejorTipo === 'entradaComida') marcaEntradaComida = segunda;
                            else if (mejorTipo === 'salidaComida') marcaSalidaComida = segunda;
                            else if (mejorTipo === 'entrada') marcaEntrada = segunda;
                        }
                    }
                }
                // CASO: 3 marcas
                else if (todasLasMarcas.length === 3) {
                    const m1 = todasLasMarcas[0];
                    const m2 = todasLasMarcas[1];
                    const m3 = todasLasMarcas[2];
                    
                    // Punto medio entre salida e entrada de comida
                    const puntoMedioComida = Math.floor((minComidaSalida + minComidaEntrada) / 2);

                    // Primera marca es entrada si está antes de la hora de salida a comida
                    if (m1.minutos <= minComidaSalida - 30) {
                        marcaEntrada = m1;
                        
                        // Segunda marca: ¿salida comida o entrada comida?
                        if (m2.minutos <= puntoMedioComida) {
                            // m2 está antes del punto medio → es salida comida
                            marcaSalidaComida = m2;
                            // m3 puede ser entrada comida o salida final
                            if (m3.minutos > puntoMedioComida && m3.minutos < minFin - 60) {
                                marcaEntradaComida = m3;
                            } else {
                                marcaSalida = m3;
                            }
                        } else {
                            // m2 está después del punto medio → es entrada comida
                            marcaEntradaComida = m2;
                            marcaSalida = m3;
                        }
                    } else {
                        // Primera marca NO es entrada temprana
                        if (m1.minutos <= puntoMedioComida) {
                            // m1 es salida comida
                            marcaSalidaComida = m1;
                            marcaEntradaComida = m2;
                            marcaSalida = m3;
                        } else {
                            // m1 podría ser entrada tardía
                            marcaEntrada = m1;
                            if (m3.minutos >= rangos.salida.min) {
                                marcaSalida = m3;
                            }
                        }
                    }
                }
                // CASO: 4 o más marcas
                else if (todasLasMarcas.length >= 4) {
                    marcaEntrada = todasLasMarcas[0];
                    marcaSalida = todasLasMarcas[todasLasMarcas.length - 1];

                    let mejorSalidaComida = null;
                    let mejorDistSalidaComida = Infinity;
                    let mejorEntradaComida = null;
                    let mejorDistEntradaComida = Infinity;

                    // Punto medio entre salida e entrada de comida para separar mejor las marcas
                    // Ejemplo: si salida comida es 13:00 y entrada comida es 14:00, punto medio es 13:30
                    const puntoMedioComida = Math.floor((minComidaSalida + minComidaEntrada) / 2);

                    for (let i = 1; i < todasLasMarcas.length - 1; i++) {
                        const marca = todasLasMarcas[i];

                        // SALIDA COMIDA: marca debe estar ANTES del punto medio (más cerca de salida)
                        const distSalidaComida = Math.abs(marca.minutos - minComidaSalida);
                        if (distSalidaComida < mejorDistSalidaComida && marca.minutos <= puntoMedioComida) {
                            mejorDistSalidaComida = distSalidaComida;
                            mejorSalidaComida = marca;
                        }

                        // ENTRADA COMIDA: marca debe estar DESPUÉS del punto medio (más cerca de entrada)
                        // Esto asegura que 14:44 se clasifique como entrada de comida y no 13:14
                        const distEntradaComida = Math.abs(marca.minutos - minComidaEntrada);
                        if (distEntradaComida < mejorDistEntradaComida && marca.minutos > puntoMedioComida) {
                            mejorDistEntradaComida = distEntradaComida;
                            mejorEntradaComida = marca;
                        }
                    }

                    if (mejorSalidaComida) marcaSalidaComida = mejorSalidaComida;
                    if (mejorEntradaComida) marcaEntradaComida = mejorEntradaComida;
                }
            }

            // ================================================================
            // APLICAR MARCAS ENCONTRADAS AL REGISTRO BASE
            // REGLA DE ORO: Lo que CONVIENE a la empresa → CONSERVAR
            //               Lo que NO conviene → REDONDEAR al horario
            // ================================================================

            // ============================================================
            // ENTRADA AL TRABAJO (siempre índice 0)
            // - TARDE → CONSERVAR (conviene: no paga esos minutos)
            // - A TIEMPO (rango) → CONSERVAR
            // - MUY TEMPRANO → REDONDEAR (no conviene: pagaría tiempo extra)
            // ============================================================
            if (marcaEntrada) {
                const minMarcaEntrada = marcaEntrada.minutos;

                if (minMarcaEntrada > minInicio) {
                    // Llegó TARDE (después de su hora, ej: 9:30 para entrada 9:00)
                    // → CONSERVAR: Le conviene a la empresa (no paga esos minutos)
                    base[0] = { tipo: 'entrada', hora: marcaEntrada.hora, observacion: 'RETARDO' };
                } else if (minMarcaEntrada >= (minInicio + RANGOS_TOLERANCIA.entrada.min)) {
                    // Llegó dentro del rango permitido (ej: 8:45-9:00 para entrada 9:00)
                    // → CONSERVAR: Está OK
                    base[0] = { tipo: 'entrada', hora: marcaEntrada.hora, observacion: 'BIOMÉTRICO' };
                } else {
                    // Llegó MUY TEMPRANO (antes del rango, ej: 8:20 para entrada 9:00)
                    // → REDONDEAR: No conviene a la empresa (pagaría tiempo extra)
                    base[0] = {
                        tipo: 'entrada',
                        hora: jitterHora(inicio, -12, -3, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${dia.fecha}|E1_ADJ`),
                        observacion: 'AJUSTADO (MUY TEMPRANO)'
                    };
                }
            }

            // Determinar índice de salida final según si tiene comida
            // Con comida: [entrada(0), salidaComida(1), entradaComida(2), salida(3)]
            // Sin comida: [entrada(0), salida(1)]
            const indiceSalidaFinal = tieneComida ? 3 : 1;

            // ============================================================
            // SALIDA A COMIDA y ENTRADA DE COMIDA - Solo si tiene comida
            // ============================================================
            if (tieneComida) {
                const minSalidaComidaEsperada = horaAMinutos(comidaSalida);
                const minEntradaComidaEsperada = horaAMinutos(comidaEntrada);
                
                // ============================================================
                // SALIDA A COMIDA
                // - ANTES de su hora → CONSERVAR (conviene: trabajó menos)
                // - A TIEMPO o poco después (0 a +15 min) → CONSERVAR
                // - MUY TARDE (+15 min) → REDONDEAR (no conviene: trabajó de más sin pago)
                // ============================================================
                if (marcaSalidaComida) {
                    const minMarcaSalidaComida = marcaSalidaComida.minutos;
                    
                    if (minMarcaSalidaComida < minSalidaComidaEsperada) {
                        // Salió ANTES de su hora (ej: 12:55 para comida 13:00)
                        // → CONSERVAR: Le conviene a la empresa (trabajó menos)
                        base[1] = { tipo: 'salida', hora: marcaSalidaComida.hora, observacion: 'SALIÓ TEMPRANO' };
                    } else if (minMarcaSalidaComida <= (minSalidaComidaEsperada + RANGOS_TOLERANCIA.salida_comida.max)) {
                        // Salió dentro del rango permitido (ej: 13:00-13:15)
                        // → CONSERVAR: Está OK
                        base[1] = { tipo: 'salida', hora: marcaSalidaComida.hora, observacion: 'BIOMÉTRICO' };
                    } else {
                        // Salió MUY TARDE (ej: 13:30+ para comida 13:00)
                        // → REDONDEAR: No conviene (está trabajando de más sin pago)
                        base[1] = {
                            tipo: 'salida',
                            hora: jitterHora(comidaSalida, 5, 12, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${dia.fecha}|S1_ADJ`),
                            observacion: 'AJUSTADO (MUY TARDE)'
                        };
                    }
                }

                // ============================================================
                // ENTRADA DE COMIDA (regreso)
                // - TARDE → CONSERVAR (conviene: no paga esos minutos de descanso extra)
                // - A TIEMPO → CONSERVAR
                // - TEMPRANO → CONSERVAR (conviene: trabaja más sin pago extra)
                // - MUY TEMPRANO (>30 min antes) → REDONDEAR (probable error de marcación)
                // ============================================================
                if (marcaEntradaComida) {
                    const minMarcaEntradaComida = marcaEntradaComida.minutos;
                    const MARGEN_ERROR_TEMPRANO = 30; // Más de 30 min antes = probable error
                    
                    if (minMarcaEntradaComida > minEntradaComidaEsperada) {
                        // Regresó TARDE (ej: 14:10, 14:44 para entrada comida 14:00)
                        // → CONSERVAR: Le conviene a la empresa (no paga esos minutos)
                        const minutosTarde = minMarcaEntradaComida - minEntradaComidaEsperada;
                        base[2] = { 
                            tipo: 'entrada', 
                            hora: marcaEntradaComida.hora, 
                            observacion: `RETARDO COMIDA (+${minutosTarde} min)` 
                        };
                    } else if (minMarcaEntradaComida >= (minEntradaComidaEsperada - MARGEN_ERROR_TEMPRANO)) {
                        // Regresó A TIEMPO o TEMPRANO (hasta 30 min antes)
                        // → CONSERVAR: Le conviene (trabaja más sin pago extra)
                        base[2] = { tipo: 'entrada', hora: marcaEntradaComida.hora, observacion: 'BIOMÉTRICO' };
                    } else {
                        // Regresó MUY TEMPRANO (más de 30 min antes, ej: 13:20 para 14:00)
                        // → REDONDEAR: Probable error de marcación
                        base[2] = {
                            tipo: 'entrada',
                            hora: jitterHora(comidaEntrada, -3, 2, `${empleado.id_empleado || empleado.clave || empleado.nombre}|${dia.fecha}|E2_ADJ`),
                            observacion: 'AJUSTADO (POSIBLE ERROR)'
                        };
                    }
                }
            }

            // ============================================================
            // SALIDA A CASA (SALIDA FINAL)
            // - ANTES o a tiempo → CONSERVAR
            // - MUY TARDE → REDONDEAR (no conviene: pagaría horas extra)
            // ============================================================
            if (marcaSalida) {
                const minMarcaSalida = marcaSalida.minutos;

                if (minMarcaSalida <= minFin) {
                    // Salió antes o a la hora exacta
                    // → CONSERVAR: Está OK / Conviene
                    base[indiceSalidaFinal] = { tipo: 'salida', hora: marcaSalida.hora, observacion: 'BIOMÉTRICO' };
                } else {
                    // Salió DESPUÉS de su hora oficial (ej: 17:30 para salida 17:00)
                    // → REDONDEAR: No conviene (no se pagan horas extra)
                    base[indiceSalidaFinal] = { tipo: 'salida', hora: fin, observacion: 'AJUSTADO (HORA EXTRA)' };
                }
            }

            // ============================================================
            // VALIDACIÓN FINAL: Ajustar si excede máximo de horas del turno
            // Si el tiempo trabajado excede max_horas + 15 min, ajustar salida
            // Ejemplo: DIURNA max 8 hrs → si excede 8:15, ajustar salida
            // ============================================================
            const seedKeyAjuste = `${empleado.id_empleado || empleado.clave || empleado.nombre}|${dia.fecha}`;
            ajustarRegistrosSiExcedenMaximo(base, infoTurnoDia.max_horas, seedKeyAjuste);

            const trabajo = calcularTrabajoDesdeRegistros(base, infoTurnoDia.max_horas);
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

        // REGLA 5: Si NO tiene registro biométrico → inasistencia
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

        // REGLA 6: Tiene registro biométrico pero ya se completaron dias_trabajados
        // → Asignar vacaciones, incapacidades, ausencias o descanso según corresponda
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
                tipo_turno: infoTurnoDia.tipo_turno,
                max_horas: infoTurnoDia.max_horas
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
                tipo_turno: infoTurnoDia.tipo_turno,
                max_horas: infoTurnoDia.max_horas
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
                tipo_turno: infoTurnoDia.tipo_turno,
                max_horas: infoTurnoDia.max_horas
            });
            return;
        }

        // Si no hay más eventos, es descanso
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

            // console.log("Biometrico Central", JsonBiometricoCentral);

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

                    // console.log(`Procesando biométrico de rancho: ${nombreRancho}`);

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
                            // console.log(`Biométrico ${nombreRancho} procesado:`, jsonRancho);
                        } else if (jsonRancho.error) {
                            console.warn(`Error en biométrico ${nombreRancho}:`, jsonRancho.error);
                        }
                    } catch (errorRancho) {
                        console.warn(`No se pudo procesar biométrico de ${nombreRancho}:`, errorRancho);
                        // Continuar con los demás ranchos
                    }
                }
            }

            // console.log(`Total de biométricos de ranchos procesados: ${biometricosRanchos.length}`);

            // =====================================================
            // 4. Unir todos los JSONs
            // =====================================================
            const JsonUnido = await unirJson(JsonListaRaya, JsonBiometricoCentral, biometricosRanchos);

            // console.log("JSON Unido:", JsonUnido);

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

                    // console.log("Nombres normalizados: ", nombreNormalizado);


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
 * Calcula la distancia de Levenshtein entre dos cadenas
 * Útil para detectar errores de ortografía (ESPINOSA vs ESPINOZA)
 */
function distanciaLevenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // sustitución
                    matrix[i][j - 1] + 1,     // inserción
                    matrix[i - 1][j] + 1      // eliminación
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Verifica si dos palabras son similares (tolerando errores de ortografía)
 * Ejemplo: ESPINOSA ≈ ESPINOZA, MORALES ≈ MORALEZ
 */
function palabrasSimilares(p1, p2) {
    // Coincidencia exacta
    if (p1 === p2) return true;

    // Una contiene a la otra
    if (p1.includes(p2) || p2.includes(p1)) return true;

    // Calcular distancia de Levenshtein
    const distancia = distanciaLevenshtein(p1, p2);
    const maxLen = Math.max(p1.length, p2.length);

    // Permitir hasta 2 caracteres de diferencia para palabras largas (>5 chars)
    // o 1 caracter para palabras cortas
    const tolerancia = maxLen > 5 ? 2 : 1;

    return distancia <= tolerancia;
}

/**
 * Calcula similitud entre dos nombres normalizados (0-1)
 * Usa coincidencia de palabras individuales con tolerancia a errores ortográficos
 */
function calcularSimilitudNombres(nombre1, nombre2) {
    const palabras1 = normalizar(nombre1).split(" ").filter(p => p.length > 2); // Ignorar palabras muy cortas como "DE"
    const palabras2 = normalizar(nombre2).split(" ").filter(p => p.length > 2);

    if (palabras1.length === 0 || palabras2.length === 0) return 0;

    let coincidencias = 0;
    const usadas = new Set(); // Para no contar la misma palabra dos veces

    palabras1.forEach(p1 => {
        for (let i = 0; i < palabras2.length; i++) {
            if (usadas.has(i)) continue;
            if (palabrasSimilares(p1, palabras2[i])) {
                coincidencias++;
                usadas.add(i);
                break;
            }
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
    });

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
                    // Primero buscar coincidencia exacta
                    let empleadoInfo = empleadosMap.get(nombreNormalizado);

                    // Si no hay coincidencia exacta, buscar por similitud (para errores de ortografía)
                    if (!empleadoInfo) {
                        let mejorSimilitud = 0;
                        let mejorCandidato = null;
                        let nombreCandidato = '';

                        empleadosMap.forEach((info, nombreBD) => {
                            const similitud = calcularSimilitudNombres(empRaya.nombre, nombreBD);
                            if (similitud > mejorSimilitud && similitud >= 0.75) { // 75% de similitud mínima
                                mejorSimilitud = similitud;
                                mejorCandidato = info;
                                nombreCandidato = nombreBD;
                            }
                        });

                        if (mejorCandidato) {
                            // console.log(`✓ Coincidencia por similitud (${Math.round(mejorSimilitud * 100)}%): "${empRaya.nombre}" ≈ "${mejorCandidato.nombre_completo}"`);
                            empleadoInfo = mejorCandidato;
                        }
                    }

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

                        const Toast = Swal.mixin({
                            toast: true,
                            position: "top-end",
                            showConfirmButton: false,
                            timer: 5000,
                            timerProgressBar: true,
                            didOpen: (toast) => {
                                toast.onmouseenter = Swal.stopTimer;
                                toast.onmouseleave = Swal.resumeTimer;
                            }
                        });
                        Toast.fire({
                            icon: "warning",
                            title: `Empleado no encontrado en la base de datos: ${empRaya.nombre}`
                        });

                    }
                });
            }
        });
    }

    return jsonListaRaya;
}