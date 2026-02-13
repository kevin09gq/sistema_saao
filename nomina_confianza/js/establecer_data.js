// Cargar los datos del empleado en el modal
function cargarData(jsonNominaConfianza, clave, idEmpresa = null) {
    alternarTablas();


    // Buscar el empleado por clave e id_empresa en todos los departamentos
    let empleadoEncontrado = null;

    jsonNominaConfianza.departamentos.forEach(departamento => {
        departamento.empleados.forEach(empleado => {
            // Comparar clave Y id_empresa para identificar correctamente al empleado
            const claveCoincide = String(empleado.clave).trim() === String(clave).trim();
            const empresaCoincide = idEmpresa === null || Number(empleado.id_empresa || 1) === Number(idEmpresa);

            if (claveCoincide && empresaCoincide) {
                empleadoEncontrado = empleado;

            }
        });
    });

    // Si se encontró el empleado, establecer sus datos en el modal
    if (empleadoEncontrado) {
        $('#campo-nombre').text(empleadoEncontrado.nombre);
        $('#campo-clave').text(empleadoEncontrado.clave);
        $('#campo-id-empresa').val(empleadoEncontrado.id_empresa || '');
        $("#nombre-empleado-modal").text(empleadoEncontrado.nombre);

        // Asignar el nombre del departamento al campo correspondiente
        let nombreDepartamento = '';
        switch (empleadoEncontrado.id_departamento) {
            case 1:
                nombreDepartamento = 'Administración';
                break;
            case 2:
                nombreDepartamento = 'Producción';
                break;
            case 3:
                nombreDepartamento = 'Seguridad, Vigilancia e Intendencia';
                break;
            case 9:
                nombreDepartamento = 'Administración Sucursal CDMX';
                break;
            default:
                nombreDepartamento = 'Desconocido';
        }
        $('#campo-departamento').text(nombreDepartamento);

        // Percepciones
        $('#mod-sueldo-semanal').val(empleadoEncontrado.sueldo_semanal || '');
        $('#mod-vacaciones').val(empleadoEncontrado.vacaciones || '');
        $('#mod-total-extra').val(empleadoEncontrado.sueldo_extra_total || '');

        // Concepto
        const conceptos = empleadoEncontrado.conceptos || [];
        const conceptoISR = conceptos.find(c => c.codigo === "45");
        const conceptoIMSS = conceptos.find(c => c.codigo === "52");
        const conceptoInfonavit = conceptos.find(c => c.codigo === "16");
        const conceptoAjusteSub = conceptos.find(c => c.codigo === "107");

        $('#mod-isr').val(conceptoISR ? conceptoISR.resultado : '');
        $('#mod-imss').val(conceptoIMSS ? conceptoIMSS.resultado : '');
        $('#mod-infonavit').val(conceptoInfonavit ? conceptoInfonavit.resultado : '');
        $('#mod-ajustes-sub').val(conceptoAjusteSub ? conceptoAjusteSub.resultado : '');

        // Total de conceptos (ISR + IMSS + INFONAVIT + AJUSTE SUB)
        establecerTotalConceptos();
        activarActualizacionTotalConceptos();


        // Deducciones
        $('#mod-tarjeta').val(empleadoEncontrado.tarjeta || '');
        $('#mod-prestamo').val(empleadoEncontrado.prestamo || '');
        $('#mod-uniformes').val(empleadoEncontrado.uniformes || '');
        $('#mod-checador').val(empleadoEncontrado.checador || '');
        $('#mod-retardos').val(empleadoEncontrado.retardos || '');
        $('#mod-inasistencias').val((empleadoEncontrado.inasistencia || 0).toFixed(2));
        $('#mod-permiso').val(empleadoEncontrado.permiso || '');
        $('#mod-fa-gafet-cofia').val(empleadoEncontrado.fa_gafet_cofia || '0.00');

        //Total a cobrar
        $('#mod-sueldo-a-cobrar').val(empleadoEncontrado.total_cobrar || '');

        // Cargar preferencias de redondeo
        const redondeoActivo = empleadoEncontrado.redondeo_activo || false;
        $('#mod-redondear-sueldo').prop('checked', redondeoActivo);

        // Detectar eventos ANTES de mostrar las tablas (para generar historiales necesarios)
        if (typeof detectarRetardos === 'function') detectarRetardos(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        if (typeof detectarInasistencias === 'function') detectarInasistencias(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        if (typeof detectarOlvidosChecador === 'function') detectarOlvidosChecador(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        if (typeof detectarEntradasTempranas === 'function') detectarEntradasTempranas(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        if (typeof detectarSalidasTardias === 'function') detectarSalidasTardias(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        if (typeof detectarSalidasTempranas === 'function') detectarSalidasTempranas(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        if (typeof detectarPermisosYComida === 'function') detectarPermisosYComida(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);

        // Mostrar registros en la tabla (ahora con los historiales ya generados)
        mostrarRegistrosChecador(empleadoEncontrado);




        // Mostrar horarios oficiales en la tabla
        mostrarRegistrosBD(empleadoEncontrado);

        // Hacer horas editables a la tabla de horarios oficiales
        hacerHorasEditables();

        // Mostrar eventos especiales
        if (typeof mostrarEntradasTempranas === 'function') mostrarEntradasTempranas(empleadoEncontrado);
        if (typeof mostrarSalidasTardias === 'function') mostrarSalidasTardias(empleadoEncontrado);
        if (typeof mostrarSalidasTempranas === 'function') mostrarSalidasTempranas(empleadoEncontrado);
        if (typeof mostrarOlvidosChecador === 'function') mostrarOlvidosChecador(empleadoEncontrado);
        if (typeof mostrarRetardos === 'function') mostrarRetardos(empleadoEncontrado);
        if (typeof mostrarInasistencias === 'function') mostrarInasistencias(empleadoEncontrado);
        if (typeof mostrarHistorialRetardos === 'function') mostrarHistorialRetardos(empleadoEncontrado);
        if (typeof mostrarHistorialInasistencias === 'function') mostrarHistorialInasistencias(empleadoEncontrado);
        if (typeof mostrarHistorialOlvidos === 'function') mostrarHistorialOlvidos(empleadoEncontrado);
        if (typeof mostrarHistorialUniformes === 'function') mostrarHistorialUniformes(empleadoEncontrado);
        if (typeof mostrarHistorialPermisos === 'function') mostrarHistorialPermisos(empleadoEncontrado);
        if (typeof mostrarAnalisisPermisosComida === 'function') mostrarAnalisisPermisosComida(empleadoEncontrado);

        // Mostrar conceptos personalizados en extras_adicionales
        const $contenedorExtras = $('#contenedor-conceptos-adicionales');
        $contenedorExtras.empty(); // Limpiar el contenedor

        if (empleadoEncontrado.extras_adicionales && empleadoEncontrado.extras_adicionales.length > 0) {
            empleadoEncontrado.extras_adicionales.forEach((concepto, index) => {
                const conceptoHTML = `
                    <div class="col-md-6 mb-3 concepto-personalizado">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-semibold">Concepto ${index + 1}</span>
                            <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-concepto">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                        <div class="mt-2">
                            <input type="text" class="form-control mb-2" value="${concepto.nombre}" placeholder="Nombre del concepto">
                            <input type="number" step="0.01" class="form-control" value="${concepto.resultado}" placeholder="0">
                        </div>
                    </div>
                `;
                $contenedorExtras.append(conceptoHTML);
            });
        }

        // Mostrar deducciones personalizadas en deducciones_adicionales
        const $contenedorDeducciones = $('#contenedor-deducciones-adicionales');
        $contenedorDeducciones.empty(); // Limpiar el contenedor

        if (empleadoEncontrado.deducciones_adicionales && empleadoEncontrado.deducciones_adicionales.length > 0) {
            empleadoEncontrado.deducciones_adicionales.forEach((deduccion, index) => {
                const deduccionHTML = `
                    <div class="col-md-6 mb-3 deduccion-personalizada">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-semibold">Deducción ${index + 1}</span>
                            <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-deduccion">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                        <div class="mt-2">
                            <input type="text" class="form-control mb-2" value="${deduccion.nombre}" placeholder="Nombre de la deducción">
                            <input type="number" step="0.01" class="form-control" value="${deduccion.resultado}" placeholder="0">
                        </div>
                    </div>
                `;
                $contenedorDeducciones.append(deduccionHTML);
            });
        }

        // Calcular y mostrar el sueldo a cobrar inicial con los valores del modal
        if (typeof calcularYMostrarSueldoACobrar === 'function') {
            calcularYMostrarSueldoACobrar();
        }

        // Configurar inputs según el departamento (deshabilitar para "sin seguro")
        if (typeof configurarInputsSinSeguro === 'function') {
            configurarInputsSinSeguro(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        }

        // Activar funcionalidad de inasistencias manuales
        if (typeof activarFuncionalidadInasistencias === 'function') {
            activarFuncionalidadInasistencias();
        }
    } else {

    }
}

// ========================================
// TOTAL DE CONCEPTOS (ISR + IMSS + INFONAVIT + AJUSTE SUB)
// ========================================
function establecerTotalConceptos() {
    const isr = parseFloat($('#mod-isr').val()) || 0;
    const imss = parseFloat($('#mod-imss').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit').val()) || 0;
    const ajusteSub = parseFloat($('#mod-ajustes-sub').val()) || 0;

    const total = isr + imss + infonavit + ajusteSub;
    $('#mod-total-conceptos').val(total.toFixed(2));
}

function activarActualizacionTotalConceptos() {
    // Evitar duplicar listeners si se abre el modal muchas veces
    $('#mod-isr, #mod-imss, #mod-infonavit, #mod-ajustes-sub').off('input.totalConceptos');
    $('#mod-isr, #mod-imss, #mod-infonavit, #mod-ajustes-sub').on('input.totalConceptos', function () {
        establecerTotalConceptos();
    });
}

// Función para mostrar registros en la tabla de checador
function mostrarRegistrosChecador(empleado) {
    const $tbody = $('#tabla-checador tbody');
    $tbody.empty(); // Limpiar la tabla

    // Verificar si el empleado tiene registros
    if (!empleado.registros || empleado.registros.length === 0) {
        $tbody.append('<tr><td colspan="4" class="text-center">No hay registros disponibles</td></tr>');
        return;
    }

    // Recorrer los registros y agregarlos a la tabla
    empleado.registros.forEach((registro, indexRegistro) => {
        // Obtener el nombre del día a partir de la fecha
        const nombreDia = obtenerNombreDia(registro.fecha);

        // Agrupar registros por fecha para identificar primer/último del día
        const registrosMismaFecha = empleado.registros.filter(r => r.fecha === registro.fecha);
        const registrosConEntrada = registrosMismaFecha.filter(r => r.entrada && r.entrada !== '-');
        const registrosConSalida = registrosMismaFecha.filter(r => r.salida && r.salida !== '-');

        // Determinar si es el primer registro con entrada del día
        const esPrimeraEntrada = registrosConEntrada.length > 0 &&
            registrosConEntrada[0].entrada === registro.entrada;

        // Determinar si es el último registro con salida del día
        const esUltimaSalida = registrosConSalida.length > 0 &&
            registrosConSalida[registrosConSalida.length - 1].salida === registro.salida;

        // Detectar eventos específicos de ESTE REGISTRO
        const eventosDelRegistro = [];
        let claseEvento = '';

        // 1. RETARDOS (VERDE) - solo en la PRIMERA entrada del día
        if (esPrimeraEntrada && empleado.historial_retardos && empleado.historial_retardos.length > 0) {
            const retardo = empleado.historial_retardos.find(r => r.fecha === registro.fecha);
            if (retardo) {
                eventosDelRegistro.push({ tipo: 'retardo', nombre: 'Retardo', prioridad: 1 });
            }
        }

        // 2. OLVIDOS DEL CHECADOR (ROJO) - si ESTE registro tiene entrada o salida vacía
        const faltaEntrada = !registro.entrada || registro.entrada === '' || registro.entrada === '-';
        const faltaSalida = !registro.salida || registro.salida === '' || registro.salida === '-';

        if (faltaEntrada || faltaSalida) {
            if (empleado.historial_olvidos && empleado.historial_olvidos.length > 0) {
                const olvido = empleado.historial_olvidos.find(o => o.fecha === registro.fecha);
                if (olvido) {
                    eventosDelRegistro.push({ tipo: 'olvido', nombre: 'Olvido de checador', prioridad: 2 });
                }
            }
        }

        // 3. INASISTENCIAS (NARANJA) - solo si NO tiene entrada ni salida
        const esRegistroVacio = faltaEntrada && faltaSalida;
        if (esRegistroVacio && empleado.historial_inasistencias && empleado.historial_inasistencias.length > 0) {
            const inasistencia = empleado.historial_inasistencias.find(i => i.fecha === registro.fecha);
            if (inasistencia) {
                eventosDelRegistro.push({ tipo: 'inasistencia', nombre: 'Inasistencia', prioridad: 3 });
            }
        }

        // 4. SALIDAS TEMPRANAS (AZUL) - solo en la ÚLTIMA salida del día
        if (esUltimaSalida && empleado.historial_salidas_tempranas && empleado.historial_salidas_tempranas.length > 0) {
            const salidaTemprana = empleado.historial_salidas_tempranas.find(s => s.fecha === registro.fecha);
            if (salidaTemprana) {
                eventosDelRegistro.push({ tipo: 'salida-temprana', nombre: 'Salida temprana', prioridad: 4 });
            }
        }

        // 5. ENTRADAS TEMPRANAS (VERDE) - solo en la PRIMERA entrada del día
        if (esPrimeraEntrada && empleado.historial_entradas_tempranas && empleado.historial_entradas_tempranas.length > 0) {
            const entradaTemprana = empleado.historial_entradas_tempranas.find(e => e.fecha === registro.fecha);
            if (entradaTemprana) {
                eventosDelRegistro.push({ tipo: 'entrada-temprana', nombre: 'Entrada temprana', prioridad: 5 });
            }
        }

        // 6. SALIDAS TARDÍAS (MORADO) - solo en la ÚLTIMA salida del día
        if (esUltimaSalida && empleado.historial_salidas_tardias && empleado.historial_salidas_tardias.length > 0) {
            const salidaTardia = empleado.historial_salidas_tardias.find(s => s.fecha === registro.fecha);
            if (salidaTardia) {
                eventosDelRegistro.push({ tipo: 'salida-tardia', nombre: 'Salida tardía', prioridad: 6 });
            }
        }

        // Determinar clase CSS (mayor prioridad = número menor)
        let badgeMultiple = '';

        if (eventosDelRegistro.length > 0) {
            eventosDelRegistro.sort((a, b) => a.prioridad - b.prioridad);
            claseEvento = `evento-${eventosDelRegistro[0].tipo}`;

            // Si hay múltiples eventos, mostrar iniciales
            if (eventosDelRegistro.length > 1) {
                const iniciales = {
                    'retardo': 'R',
                    'olvido': 'O',
                    'inasistencia': 'I',
                    'salida-temprana': 'ST',
                    'entrada-temprana': 'ET',
                    'salida-tardia': 'SL'
                };

                const textoInicial = eventosDelRegistro.map(e => iniciales[e.tipo] || '?').join('·');
                badgeMultiple = `<span class="badge-eventos" title="Este registro tiene ${eventosDelRegistro.length} eventos">${textoInicial}</span>`;
            }
        }

        // Crear tooltip con TODOS los eventos del registro
        const tituloEvento = eventosDelRegistro.length > 0
            ? eventosDelRegistro.map(e => `• ${e.nombre}`).join('\n')
            : '';

        const fila = `
            <tr class="${claseEvento}" title="${tituloEvento}">
                <td>${nombreDia} ${badgeMultiple}</td>
                <td>${registro.fecha || '-'}</td>
                <td>${registro.entrada || '-'}</td>
                <td>${registro.salida || '-'}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-success btn-agregar-registro me-1" data-clave="${empleado.clave}" data-fecha="${registro.fecha || ''}" data-index="${indexRegistro}" title="Agregar registro">
                        <i class="bi bi-plus-lg"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-primary btn-editar-registro" data-clave="${empleado.clave}" data-fecha="${registro.fecha || ''}" data-index="${indexRegistro}" title="Editar registro">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `;
        $tbody.append(fila);
    });
}

// Función para mostrar registros desde la base de datos
function mostrarRegistrosBD(empleado) {
    const $tbody = $('#horarios-oficiales-body');
    $tbody.empty(); // Limpiar la tabla

    // Lista de días de la semana
    const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

    // Crear un mapa de registros por día para búsqueda rápida
    const registrosPorDia = {};
    if (empleado.horario_oficial && Array.isArray(empleado.horario_oficial)) {
        empleado.horario_oficial.forEach(dia => {
            registrosPorDia[dia.dia] = dia;
        });
    }

    // Iterar sobre los 7 días de la semana (SIEMPRE mostrar 7 filas)
    diasSemana.forEach(nombreDia => {
        // Buscar si existe un registro para este día
        const diaRegistro = registrosPorDia[nombreDia];

        // Crear opciones del select
        let opcionesSelect = `<option value="">- Seleccionar día -</option>`;
        opcionesSelect += diasSemana.map(dia => {
            const seleccionado = nombreDia === dia ? 'selected' : '';
            return `<option value="${dia}" ${seleccionado}>${dia}</option>`;
        }).join('');

        // Asignar datos del registro si existe, sino mostrar "-"
        const entrada = diaRegistro ? (diaRegistro.entrada || '-') : '-';
        const salidaComida = diaRegistro ? (diaRegistro.salida_comida || '-') : '-';
        const entradaComida = diaRegistro ? (diaRegistro.entrada_comida || '-') : '-';
        const salida = diaRegistro ? (diaRegistro.salida || '-') : '-';

        // Obtener justificación del horario oficial (nueva lógica)
        const tipoJustificacion = (diaRegistro && diaRegistro.justificado && diaRegistro.tipo_justificacion) ?
            String(diaRegistro.tipo_justificacion) : '';
        const badgeJustificacion = tipoJustificacion ?
            `<span class="badge bg-warning text-dark ms-1" data-justificacion="1" style="font-size:0.75rem;">${tipoJustificacion}</span>` : '';

        // Mantener compatibilidad con el sistema anterior de tipos_dia
        const tipoDia = (empleado && empleado.dias_justificados && empleado.dias_justificados[nombreDia]) ? String(empleado.dias_justificados[nombreDia]) : '';
        const badgeTipoDia = tipoDia ? `<span class="badge bg-info text-dark" style="font-size:0.75rem;">${tipoDia}</span>` : '';

        // Usar el badge de justificación si existe, sino el badge de tipo_dia para compatibilidad
        const badgeFinal = badgeJustificacion || badgeTipoDia;

        // Crear fila
        const fila = `
            <tr data-dia-semana="${nombreDia}">
                <td>
                    <select class="form-control form-control-sm select-dia">
                        ${opcionesSelect}
                    </select>
                </td>
                <td>${entrada}</td>
                <td>${salidaComida}</td>
                <td>${entradaComida}</td>
                <td>${salida}</td>
                <td>
                    <div class="d-flex gap-1 align-items-center">
                        <button type="button" class="btn btn-outline-primary btn-sm btn-abrir-tipo-dia" title="Abrir modal">
                            <i class="bi bi-clipboard2-check"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-horario" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                        ${badgeFinal}
                    </div>
                </td>
            </tr>
        `;
        $tbody.append(fila);
    });
}



// Función simple para obtener el nombre del día de la semana
function obtenerNombreDia(fecha) {
    if (!fecha) return '-';

    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Convertir formato DD/MM/YYYY a YYYY-MM-DD para que Date lo entienda
    let fechaParseada;
    if (fecha.includes('/')) {
        const partes = fecha.split('/');
        // partes[0] = día, partes[1] = mes, partes[2] = año
        fechaParseada = new Date(partes[2], partes[1] - 1, partes[0]);
    } else {
        fechaParseada = new Date(fecha);
    }

    // Verificar si la fecha es válida
    if (isNaN(fechaParseada.getTime())) {
        return '-';
    }

    return dias[fechaParseada.getDay()];
}

