// Objeto para almacenar el empleado actual del modal
const objEmpleadoJornalero = {
    empleado: null,

    // Getter: obtener el empleado actual
    getEmpleado() {
        return this.empleado;
    },

    // Setter: establecer el empleado
    setEmpleado(emp) {
        this.empleado = emp;
    },

    // Limpiar: resetear el empleado
    limpiarEmpleado() {
        this.empleado = null;
    }
};

function establerDataModalJornalero(empleado) {
    // Guardar el empleado en el objeto
    objEmpleadoJornalero.setEmpleado(empleado);

    // Establecer la información básica del empleado en el modal
    establecerInformacionEmpleadoJornalero(empleado);

    // Establecer los registros del empleado en el modal
    establecerBiometricoJornalero(empleado);

    // Colorear filas de biométrico según eventos
    establecerColorBiometricoJornalero(empleado);

    establecerDiasTrabajadosJornalero(empleado);

    // Mostrar eventos especiales
    mostrarEntradasTempranasJornalero(empleado);
    mostrarSalidasTardiasJornalero(empleado);
    mostrarSalidasTempranasJornalero(empleado);
    mostrarRetardosJornalero(empleado);
    mostrarInasistenciasJornalero(empleado);
    mostrarOlvidosChecadorJornalero(empleado);

    // Establecer percepciones del empleado en el modal
    establecerPercepcionesJornalero(empleado);

    // Establecer percepciones adicionales del empleado en el modal
    mostrarPercepcionesExtrasJornalero(empleado);
    mostrarDeduccionesExtrasJornalero(empleado);

    // Establecer deducciones del empleado en el modal
    establecerDeduccionesJornalero(empleado);

    // Establecer los conceptos del empleado en el modal
    establecerConceptosJornalero(empleado);

    // Establecer historial de checador del empleado en el modal
    establecerHistorialChecadorJornalero(empleado);

    // Establecer historial de permisos del empleado en el modal
    establecerHistorialPermisosJornalero(empleado);

    // Establecer historial de uniformes del empleado en el modal
    establecerHistorialUniformeJornalero(empleado);

    calcularSueldoACobrarJornalero();


    // Mostrar modal usando Bootstrap
    const modalEl = document.getElementById('modal-jornaleros');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}


/************************************
 * ESTABLECER REGISTROS DEL EMPLEADO
 ************************************/
function establecerInformacionEmpleadoJornalero(empleado) {
    // Rellenar los campos del modal con los datos del empleado
    $('#campo-clave-jornaleros').text(empleado.clave || '');
    $('#campo-nombre-jornaleros').text(empleado.nombre || '');
    $('#nombre-jornalero-modal').text(empleado.nombre || '');

    // Mostrar los días trabajados en el footer del modal
    $('#dias-trabajados-modal-footer').text(`Días Trabajados: ${empleado.dias_trabajados || 0}`);
}

/************************************
 * ESTABLECER REGISTROS DEL BIOMETRICO
 ************************************/

function establecerBiometricoJornalero(empleado) {

    // Limpiar la tabla
    $('#tbody-biometrico-jornaleros').empty();

    // Si no hay empleado o registros, mostrar mensaje
    if (!empleado || !empleado.registros || empleado.registros.length === 0) {
        const filaVacia = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-inbox"></i> No hay registros biométricos
                </td>
            </tr>
        `;
        $('#tbody-biometrico-jornaleros').append(filaVacia);
        return;
    }

    // Array de nombres de días en español
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Iterar sobre los registros y agregar filas
    empleado.registros.forEach(registro => {
        // Calcular día de la semana a partir de la fecha (formato DD/MM/YYYY)
        const [dia, mes, anio] = registro.fecha.split('/');
        const fecha = new Date(anio, mes - 1, dia);
        const nombreDia = dias[fecha.getDay()];

        // Crear fila
        const fila = `
            <tr>
                <td>${nombreDia}</td>
                <td>${registro.fecha}</td>
                <td>${registro.entrada || '-'}</td>
                <td>${registro.salida || '-'}</td>
            </tr>
        `;

        // Agregar fila a la tabla
        $('#tbody-biometrico-jornaleros').append(fila);
    });
    // Mostrar el número total de días trabajados desde la propiedad del empleado
    const totalDiasTrabajados = empleado.dias_trabajados || 0;

    const filaTotal = `
        <tr class="fw-bold table-active">
            <td colspan="3" class="text-end">Días Trabajados (Biométrico):</td>
            <td class="text-center">${totalDiasTrabajados}</td>
        </tr>
    `;
    $('#tbody-biometrico-jornaleros').append(filaTotal);
}

/************************************
 * ESTABLECER DIAS TRABAJADOS DEL EMPLEADO
 ************************************/

function establecerDiasTrabajadosJornalero(empleado) {
    // Limpiar la tabla
    $('#tbody-dias-trabajados-jornaleros').empty();

    // Si no hay empleado o registros, mostrar mensaje
    if (!empleado || !empleado.registros || empleado.registros.length === 0) {
        const filaVacia = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-calendar-x"></i> No hay días trabajados registrados
                </td>
            </tr>
        `;
        $('#tbody-dias-trabajados-jornaleros').append(filaVacia);
        return;
    }

    // Array de nombres de días en español
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Agrupar registros por fecha para manejar múltiples marcajes el mismo día
    const registrosPorFecha = {};
    let diasTrabajados = 0;
    let totalCantidad = 0;
    let filas = [];

    empleado.registros.forEach(registro => {
        const fecha = registro.fecha;
        if (!registrosPorFecha[fecha]) {
            registrosPorFecha[fecha] = [];
        }
        registrosPorFecha[fecha].push(registro);
    });

    // Crear filas para días trabajados
    Object.keys(registrosPorFecha).forEach(fecha => {
        const registrosDelDia = registrosPorFecha[fecha];

        // Verificar si hay al menos una entrada válida ese día
        const tieneEntradaValida = registrosDelDia.some(registro =>
            registro.entrada && registro.entrada.trim() !== ""
        );

        // Calcular día de la semana a partir de la fecha (formato DD/MM/YYYY)
        const [dia, mes, anio] = fecha.split('/');
        const fechaObj = new Date(anio, mes - 1, dia);
        const nombreDia = dias[fechaObj.getDay()];

        // Obtener salario diario
        const salarioDiario = parseFloat(empleado.salario_diario) || 0;

        if (tieneEntradaValida) {
            diasTrabajados++;
            totalCantidad += salarioDiario;

            // Crear fila
            const fila = `
                <tr>
                    <td>${nombreDia}</td>
                    <td>${fecha}</td>
                    <td>$${salarioDiario.toFixed(2)}</td>
                    <td class="text-center"><strong>1</strong></td>
                </tr>
            `;

            // Agregar fila a la tabla
            filas.push(fila);
        } else {
            // Crear fila para día no trabajado
            const fila = `
                <tr class="text-muted table-light">
                    <td>${nombreDia}</td>
                    <td>${fecha}</td>
                    <td>$0.00</td>
                    <td class="text-center"><strong>0</strong></td>
                </tr>
            `;

            // Agregar fila a la tabla
            filas.push(fila);
        }
    });

    // --- AGREGAR DÍAS EXTRA MANUALES ---
    if (Array.isArray(empleado.dias_extra_detalle) && empleado.dias_extra_detalle.length > 0) {
        const salarioDiario = parseFloat(empleado.salario_diario) || 0;

        empleado.dias_extra_detalle.forEach(extra => {
            diasTrabajados++;
            totalCantidad += salarioDiario;

            const filaExtra = `
                <tr class="table-info">
                    <td>${extra.dia}</td>
                    <td><span class="badge bg-primary">Día Extra</span></td>
                    <td>$${salarioDiario.toFixed(2)}</td>
                    <td class="text-center"><strong>1</strong></td>
                </tr>
            `;
            filas.push(filaExtra);
        });
    }

    // --- RESTAR DÍAS (DESCUENTOS) ---
    if (Array.isArray(empleado.dias_menos_detalle) && empleado.dias_menos_detalle.length > 0) {
        const salarioDiario = parseFloat(empleado.salario_diario) || 0;

        empleado.dias_menos_detalle.forEach(menos => {
            diasTrabajados--;
            totalCantidad -= salarioDiario;

            const filaMenos = `
                <tr class="table-danger">
                    <td>${menos.dia}</td>
                    <td><span class="badge bg-danger">Descuento</span></td>
                    <td>-$${salarioDiario.toFixed(2)}</td>
                    <td class="text-center"><strong>-1</strong></td>
                </tr>
            `;
            filas.push(filaMenos);
        });
    }

    // Si hay filas, agregarlas a la tabla
    if (filas.length > 0) {
        filas.forEach(fila => $('#tbody-dias-trabajados-jornaleros').append(fila));

        // Agregar fila de total
        const filaTotal = `
            <tr class="fw-bold table-active">
                <td colspan="2">TOTAL</td>
                <td>$${totalCantidad.toFixed(2)}</td>
                <td class="text-center"><strong>${diasTrabajados}</strong></td>
            </tr>
        `;
        $('#tbody-dias-trabajados-jornaleros').append(filaTotal);

        // Actualizar también el contador en el footer del modal para consistencia
        $('#dias-trabajados-modal-footer').text(`Días Trabajados: ${diasTrabajados}`);
    } else {
        const filaVacia = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-calendar-x"></i> No hay días trabajados (sin entradas válidas)
                </td>
            </tr>
        `;
        $('#tbody-dias-trabajados-jornaleros').append(filaVacia);
    }
}

function establecerColorBiometricoJornalero(empleado) {
    if (!empleado) return;

    // Validar que exista horarioRancho global
    const horarioRancho = jsonNominaRelicario?.horarioRancho;
    if (!Array.isArray(horarioRancho)) return;

    // Definir colores y abreviaturas para cada tipo de evento
    const colores = {
        retardo: '#fef3c7',           // Amarillo (retardos)
        olvido: '#fee2e2',            // Rojo (olvidos)
        entrada_temprana: '#dbeafe',  // Azul (entradas tempranas)
        salida_tardia: '#fed7aa',     // Naranja (salidas tardías)
        salida_temprana: '#e5d4f0',   // Gris oscuro (salidas tempranas)

    };

    const abreviaturas = {
        retardo: 'R',
        olvido: 'O',
        entrada_temprana: 'ET',
        salida_tardia: 'STA',
        salida_temprana: 'STE',

    };

    // Array de nombres de días SIN acento (para buscar en horarioRancho)
    const diasSemanaRancho = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];


    // Primer paso: identificar la primera y última fila de cada fecha
    const primeraFilaPorFecha = {};
    const ultimaFilaPorFecha = {};
    let fechaAnterior = null;

    $('#tbody-biometrico-jornaleros tr').each(function () {
        const $celdas = $(this).find('td');
        const fecha = $celdas.eq(1).text().trim();

        if (fecha) {
            if (fecha !== fechaAnterior) {
                primeraFilaPorFecha[fecha] = this;
                fechaAnterior = fecha;
            }
            ultimaFilaPorFecha[fecha] = this;
        }
    });

    // Segundo paso: colorear filas y agregar eventos según eventos
    $('#tbody-biometrico-jornaleros tr').each(function () {
        const $celdas = $(this).find('td');
        const fecha = $celdas.eq(1).text().trim();
        const entrada = $celdas.eq(2).text().trim();
        const salida = $celdas.eq(3).text().trim();

        if (!fecha) return;

        const eventosEnRegistro = [];
        let colorAplicar = null;

        // 1. RETARDOS: solo en la PRIMERA fila de cada fecha
        if (primeraFilaPorFecha[fecha] === this &&
            Array.isArray(empleado.historial_retardos)) {
            const tieneRetardo = empleado.historial_retardos.some(r => r.fecha === fecha);
            if (tieneRetardo) {
                colorAplicar = colores.retardo;
                eventosEnRegistro.push(abreviaturas.retardo);
            }
        }

        // 2. OLVIDOS: solo en registros que NO tienen salida
        if ((salida === '-' || salida === '') &&
            Array.isArray(empleado.historial_olvidos)) {
            const tieneOlvido = empleado.historial_olvidos.some(o => o.fecha === fecha);
            if (tieneOlvido) {
                if (!colorAplicar) colorAplicar = colores.olvido;
                eventosEnRegistro.push(abreviaturas.olvido);
            }
        }

        // 3. ENTRADAS TEMPRANAS: solo primera fila del día (entrada 45 min antes)
        if (primeraFilaPorFecha[fecha] === this && entrada && entrada !== '-') {
            const [d, m, a] = fecha.split('/');
            const fechaObj = new Date(a, m - 1, d);
            const diaSemana = diasSemanaRancho[fechaObj.getDay()];
            const horario = horarioRancho.find(h => h.dia?.toUpperCase().trim() === diaSemana);

            if (horario?.entrada) {
                const minEntrada = aMinutosJornalero(entrada);
                const minHorario = aMinutosJornalero(horario.entrada);
                const diferencia = minHorario - minEntrada;
                if (diferencia > 45) {
                    if (!colorAplicar) colorAplicar = colores.entrada_temprana;
                    eventosEnRegistro.push(abreviaturas.entrada_temprana);
                }
            }
        }

        // 4. SALIDAS TARDÍAS: solo última fila del día (salida 45 min después)
        if (ultimaFilaPorFecha[fecha] === this && salida && salida !== '-') {
            const [d, m, a] = fecha.split('/');
            const fechaObj = new Date(a, m - 1, d);
            const diaSemana = diasSemanaRancho[fechaObj.getDay()];
            const horario = horarioRancho.find(h => h.dia?.toUpperCase().trim() === diaSemana);

            if (horario?.salida) {
                const minSalida = aMinutosJornalero(salida);
                const minHorario = aMinutosJornalero(horario.salida);
                const diferencia = minSalida - minHorario;
                if (diferencia > 45) {
                    if (!colorAplicar) colorAplicar = colores.salida_tardia;
                    eventosEnRegistro.push(abreviaturas.salida_tardia);
                }
            }
        }

        // 5. SALIDAS TEMPRANAS: solo última fila del día (salida 5 min antes)
        if (ultimaFilaPorFecha[fecha] === this && salida && salida !== '-') {
            const [d, m, a] = fecha.split('/');
            const fechaObj = new Date(a, m - 1, d);
            const diaSemana = diasSemanaRancho[fechaObj.getDay()];
            const horario = horarioRancho.find(h => h.dia?.toUpperCase().trim() === diaSemana);

            if (horario?.salida) {
                const minSalida = aMinutosJornalero(salida);
                const minHorario = aMinutosJornalero(horario.salida);
                const diferencia = minHorario - minSalida;
                if (diferencia > 5) {
                    if (!colorAplicar) colorAplicar = colores.salida_temprana;
                    eventosEnRegistro.push(abreviaturas.salida_temprana);
                }
            }
        }


        // Aplicar el color si se encontró un evento
        if (colorAplicar) {
            $(this).css('background-color', colorAplicar);
        }

        // Agregar badge cuando hay más de un evento en el registro
        if (eventosEnRegistro.length > 1) {
            const eventosTexto = eventosEnRegistro.join(', ');
            const badgeColor = colorAplicar ? '#000000' : '#666666';
            const badge = `<span class="badge" style="background-color: ${colorAplicar || '#e5e7eb'}; color: ${badgeColor}; margin-left: 8px; font-size: 0.85em; padding: 2px 6px; border:1px solid ${badgeColor}; border-radius:4px;">${eventosTexto}</span>`;
            $celdas.eq(0).append(badge);
        }
    });
}


/************************************
 * ESTABLECER PERCEPCIONES DEL EMPLEADO
 ************************************/

// Función para establecer las percepciones del empleado en el modal
function establecerPercepcionesJornalero(empleado) {

    // Si no hay empleado, salir
    if (!empleado) return;

    // Establecer sueldo semanal
    $('#mod-sueldo-semanal-jornalero').val(empleado.salario_semanal || '');

    // Establecer pasaje
    $('#mod-pasaje-jornalero').val(empleado.pasaje || '');

    // Establecer comida
    $('#mod-comida-jornalero').val(empleado.comida || '');

    // Establecer tardeada
    $('#mod-tardeada-jornalero').val(empleado.tardeada || '');

    // Establecer sueldo extra total
    $('#mod-total-extra-jornalero').val(empleado.sueldo_extra_total || '');

}


/************************************
 * ESTABLECER CONCEPTOS DEL EMPLEADO
 ************************************/

function establecerConceptosJornalero(empleado) {

    // Si no hay empleado, salir
    if (!empleado) return;

    // Verificar si el empleado tiene seguro social
    const tieneSeguroSocial = empleado.seguroSocial !== false;

    desabilitarCamposConceptosJornalero(tieneSeguroSocial);
    const conceptos = empleado.conceptos || [];

    // Buscar conceptos por código
    const conceptoISR = conceptos.find(c => c.codigo === "45");
    const conceptoIMSS = conceptos.find(c => c.codigo === "52");
    const conceptoInfonavit = conceptos.find(c => c.codigo === "16");
    const conceptoAjusteSub = conceptos.find(c => c.codigo === "107");

    // Establecer valores en los campos de entrada
    $('#mod-isr-jornalero').val(conceptoISR ? conceptoISR.resultado || '' : '');
    $('#mod-imss-jornalero').val(conceptoIMSS ? conceptoIMSS.resultado || '' : '');
    $('#mod-infonavit-jornalero').val(conceptoInfonavit ? conceptoInfonavit.resultado || '' : '');
    $('#mod-ajustes-sub-jornalero').val(conceptoAjusteSub ? conceptoAjusteSub.resultado || '' : '');

    // Calcular total de conceptos
    calcularTotalConceptosJornalero();
}

// Función para calcular el total de conceptos y mostrarlo en el campo correspondiente
function calcularTotalConceptosJornalero() {
    const isr = parseFloat($('#mod-isr-jornalero').val()) || 0;
    const imss = parseFloat($('#mod-imss-jornalero').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-jornalero').val()) || 0;
    const ajusteSub = parseFloat($('#mod-ajustes-sub-jornalero').val()) || 0;

    const total = isr + imss + infonavit + ajusteSub;

    $('#mod-total-conceptos-jornalero').val(total.toFixed(2));
}

function desabilitarCamposConceptosJornalero(tieneSeguroSocial) {

    // Deshabilitar o habilitar campos de conceptos según seguroSocial
    if (!tieneSeguroSocial) {
        // Deshabilitar campos de entrada
        $('#mod-isr-jornalero').prop('disabled', true);
        $('#mod-imss-jornalero').prop('disabled', true);
        $('#mod-infonavit-jornalero').prop('disabled', true);
        $('#mod-ajustes-sub-jornalero').prop('disabled', true);

        // Deshabilitar botones de aplicar
        $('#btn-aplicar-isr-jornalero').prop('disabled', true);
        $('#btn-aplicar-imss-jornalero').prop('disabled', true);
        $('#btn-aplicar-infonavit-jornalero').prop('disabled', true);
        $('#btn-aplicar-ajuste-sub-jornalero').prop('disabled', true);

        // Deshabilitar total (aunque ya tiene readonly)
        $('#mod-total-conceptos-jornalero').prop('disabled', true);

        return; // Salir sin procesar conceptos
    }

    // Si tiene seguro social, habilitar los campos
    $('#mod-isr-jornalero').prop('disabled', false);
    $('#mod-imss-jornalero').prop('disabled', false);
    $('#mod-infonavit-jornalero').prop('disabled', false);
    $('#mod-ajustes-sub-jornalero').prop('disabled', false);

    $('#btn-aplicar-isr-jornalero').prop('disabled', false);
    $('#btn-aplicar-imss-jornalero').prop('disabled', false);
    $('#btn-aplicar-infonavit-jornalero').prop('disabled', false);
    $('#btn-aplicar-ajuste-sub-jornalero').prop('disabled', false);

    $('#mod-total-conceptos-jornalero').prop('disabled', false);
}


/************************************
 * ESTABLECER DEDUCCIONES DEL EMPLEADO
 ************************************/

function establecerDeduccionesJornalero(empleado) {
    // Si no hay empleado, salir
    if (!empleado) return;

    // Establecer tarjeta 
    $('#mod-tarjeta-jornalero').val(empleado.tarjeta || '');
    // Establecer préstamo
    $('#mod-prestamo-jornalero').val(empleado.prestamo || '');
    // Establecer checador
    $('#mod-checador-jornalero').val(empleado.checador || '');
    // Establecer retardos
    $('#mod-retardos-jornalero').val(empleado.retardos || '');
    // Establecer permiso
    $('#mod-permisos-jornalero').val(empleado.permiso || '');
    // Establecer uniformes
    $('#mod-uniforme-jornalero').val(empleado.uniformes || '');
    // Establecer Deducciones extras
    $('#mod-fagafetcofia-jornalero').val(empleado.fa_gafet_cofia || '');

    // Restaurar estado del redondeo (si estaba activo al guardar)
    const redondeoActivo = empleado.redondeo_activo === true;
    $('#mod-redondear-sueldo-jornalero').prop('checked', redondeoActivo);
    if (redondeoActivo) {
        $('#mod-redondeo-opciones-jornalero').show();
    } else {
        $('#mod-redondeo-opciones-jornalero').hide();
    }
}


/************************************
 * ESTABLECER HISTORIAL CHECADOR
 ************************************/

function establecerHistorialChecadorJornalero(empleado) {
    // Validar que exista el empleado
    if (!empleado) return;

    // Obtener el contenedor del historial
    const $contenedor = $('#contenedor-historial-olvidos-jornaleros');
    $contenedor.empty();

    // Si no hay historial, mostrar mensaje
    if (!Array.isArray(empleado.historial_olvidos) || empleado.historial_olvidos.length === 0) {
        $contenedor.html('<p class="text-muted text-center">Sin olvidos por mostrar</p>');
        return;
    }

    // Crear tabla con los datos del historial
    const html = `
        <table class="table table-sm table-hover mb-0">
            <thead>
                <tr>
                    <th>Día</th>
                    <th>Fecha</th>
                    <th>Descuento</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                ${empleado.historial_olvidos.map((olvido, index) => `
                    <tr>
                        <td>${olvido.dia}</td>
                        <td>${olvido.fecha}</td>
                        <td>$${parseFloat(olvido.descuento_olvido).toFixed(2)}</td>
                        <td><button type="button" class="btn btn-sm btn-primary btn-editar-olvido" data-index="${index}"><i class="bi bi-pencil"></i></button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    $contenedor.html(html);
}

/************************************
 * ESTABLECER HISTORIAL PERMISOS
 ************************************/

function establecerHistorialPermisosJornalero(empleado) {
    // Validar que exista el empleado
    if (!empleado) return;

    // Obtener el contenedor del historial
    const $contenedor = $('#contenedor-historial-permisos-jornalero');
    $contenedor.empty();

    // Si no hay historial, mostrar mensaje
    if (!Array.isArray(empleado.historial_permisos) || empleado.historial_permisos.length === 0) {
        $contenedor.html('<p class="text-muted text-center">Sin permisos por mostrar</p>');
        return;
    }

    // Crear tabla con los datos del historial
    const html = `
        <table class="table table-sm table-hover mb-0">
            <thead>
                <tr>
                    <th>Día</th>
                    <th>Minutos</th>
                    <th>$/min</th>
                    <th>Descuento</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                ${empleado.historial_permisos.map((permiso, index) => `
                    <tr>
                        <td>${permiso.dia}</td>
                        <td>${permiso.minutos_permiso}m</td>
                        <td>$${parseFloat(permiso.costo_por_minuto).toFixed(2)}</td>
                        <td>$${parseFloat(permiso.descuento_permiso).toFixed(2)}</td>
                        <td>
                            <button type="button" class="btn btn-sm btn-danger btn-eliminar-permiso-manual" data-index="${index}"><i class="bi bi-trash"></i></button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    $contenedor.html(html);
}

/************************************
 * ESTABLECER HISTORIAL UNIFORME
 ************************************/

function establecerHistorialUniformeJornalero(empleado) {
    if (!empleado) return;
    const $contenedor = $('#contenedor-historial-uniforme-jornalero');
    $contenedor.empty();
    if (!Array.isArray(empleado.historial_uniforme) || empleado.historial_uniforme.length === 0) {
        $contenedor.html('<p class="text-muted text-center">Sin uniformes por mostrar</p>');
        return;
    }
    const html = `
        <table class="table table-sm table-hover mb-0">
            <thead>
                <tr>
                    <th>Folio</th>
                    <th>Cantidad</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                ${empleado.historial_uniforme.map((u, index) => `
                    <tr>
                        <td>${u.folio}</td>
                        <td>${u.cantidad}</td>
                        <td><button type="button" class="btn btn-sm btn-danger btn-eliminar-uniforme-manual" data-index="${index}"><i class="bi bi-trash"></i></button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    $contenedor.html(html);
}
