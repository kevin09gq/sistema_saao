// Objeto para almacenar el empleado actual del modal
const objEmpleado = {
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

function establerDataModalCoordinador(empleado) {
    // Guardar el empleado en el objeto
    objEmpleado.setEmpleado(empleado);

    // Establecer información del empleado
    establecerInformacionEmpleado(empleado);
    // Establecer datos biométricos en la tabla
    establecerBiometrico(empleado);
    // Colorear filas de biométrico según eventos
    establecerColorBiometrico(empleado);

    // Establecer datos de horarios oficiales en la tabla
    establecerHorariosOficiales(empleado);

    // Establecer datos de eventos especiales
    mostrarRetardos(empleado);
    mostrarEntradasTempranas(empleado);
    mostrarSalidasTardias(empleado);
    mostrarSalidasTempranas(empleado);
    mostrarInasistencias(empleado);
    mostrarOlvidosChecador(empleado);

    // Establecer datos de percepciones
    establecerPercepciones(empleado);

    // Establecer datos de conceptos
    establecerConceptos(empleado);
    // Establecer datos de deducciones
    establerDeducciones(empleado);

    establecerHistorialChecador(empleado);
    establecerHistorialRetardos(empleado);
    establecerHistorialInasistencias(empleado);
    establecerHistorialPermisos(empleado);
    establecerHistorialUniforme(empleado);

    // Calcular sueldo a cobrar con todos los valores ya cargados
    calcularSueldoACobrar();

    // Mostrar modal usando Bootstrap
    const modalEl = document.getElementById('modal-coordinadores');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}
/************************************
 * ESTABLECER REGISTROS DEL BIOMETRICO
 ************************************/
function establecerInformacionEmpleado(empleado) {
    // Rellenar los campos del modal con los datos del empleado
    $('#campo-clave-coordinadores').text(empleado.clave || '');
    $('#campo-nombre-coordinadores').text(empleado.nombre || '');
    $('#campo-departamento-coordinadores').text(empleado.departamento || '');
    $('#campo-puesto-coordinadores').text(empleado.id_puestoEspecial || empleado.puesto || '');
    $('#nombre-empleado-modal').text(empleado.nombre || '');

}
/************************************
 * ESTABLECER REGISTROS DEL BIOMETRICO
 ************************************/

function establecerBiometrico(empleado) {

    // Si no hay empleado, salir
    if (!empleado || !empleado.registros) return;

    // Array de nombres de días en español
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Limpiar la tabla
    $('#tbody-biometrico-coordinadores').empty();

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
                <td><button class="btn btn-sm btn-outline-secondary">Editar</button></td>
            </tr>
        `;

        // Agregar fila a la tabla
        $('#tbody-biometrico-coordinadores').append(fila);
    });
}

function establecerColorBiometrico(empleado) {
    if (!empleado) return;
    
    // Definir colores y abreviaturas para cada tipo de evento
    const colores = {
        retardo: '#fef3c7',           // Amarillo (retardos)
        olvido: '#fee2e2',            // Rojo (olvidos)
        entrada_temprana: '#dbeafe',  // Azul (entradas tempranas)
        salida_tardia: '#fed7aa',     // Naranja (salidas tardías)
        salida_temprana: '#d1d5db',   // Gris oscuro (salidas tempranas)
        inasistencia: '#f3f4f6'       // Gris (inasistencias)
    };
    
    const abreviaturas = {
        retardo: 'R',
        olvido: 'O',
        entrada_temprana: 'ET',
        salida_tardia: 'STA',
        salida_temprana: 'STE',
        inasistencia: 'I'
    };
    
    // Array de nombres de días
    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    
    // Función auxiliar: convierte HH:MM a minutos
    function aMinutos(hora) {
        const [h, m] = hora.split(':');
        return parseInt(h) * 60 + parseInt(m);
    }
    
    // Primer paso: identificar la primera y última fila de cada fecha
    const primeraFilaPorFecha = {};
    const ultimaFilaPorFecha = {};
    let fechaAnterior = null;
    
    $('#tbody-biometrico-coordinadores tr').each(function () {
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
    $('#tbody-biometrico-coordinadores tr').each(function () {
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
            const diaSemana = diasSemana[fechaObj.getDay()];
            const horario = empleado.horario_oficial?.find(h => h.dia?.toUpperCase().trim() === diaSemana);
            
            if (horario?.entrada) {
                const minEntrada = aMinutos(entrada);
                const minHorario = aMinutos(horario.entrada);
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
            const diaSemana = diasSemana[fechaObj.getDay()];
            const horario = empleado.horario_oficial?.find(h => h.dia?.toUpperCase().trim() === diaSemana);
            
            if (horario?.salida) {
                const minSalida = aMinutos(salida);
                const minHorario = aMinutos(horario.salida);
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
            const diaSemana = diasSemana[fechaObj.getDay()];
            const horario = empleado.horario_oficial?.find(h => h.dia?.toUpperCase().trim() === diaSemana);
            
            if (horario?.salida) {
                const minSalida = aMinutos(salida);
                const minHorario = aMinutos(horario.salida);
                const diferencia = minHorario - minSalida;
                if (diferencia > 5) {
                    if (!colorAplicar) colorAplicar = colores.salida_temprana;
                    eventosEnRegistro.push(abreviaturas.salida_temprana);
                }
            }
        }
        
        // 6. INASISTENCIAS: en TODOS los registros del día
        if (Array.isArray(empleado.historial_inasistencias)) {
            const [d, m, a] = fecha.split('/');
            const fechaObj = new Date(a, m - 1, d);
            const diaDelRegistro = diasSemana[fechaObj.getDay()];
            
            const tieneInasistencia = empleado.historial_inasistencias.some(i => 
                i.dia.toUpperCase().trim() === diaDelRegistro.toUpperCase().trim()
            );
            if (tieneInasistencia) {
                if (!colorAplicar) colorAplicar = colores.inasistencia;
                eventosEnRegistro.push(abreviaturas.inasistencia);
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
 * ESTABLECER LOS HORARIOS OFICIALES    
 ************************************/

function establecerHorariosOficiales(empleado) {


    // Si no hay empleado, salir
    if (!empleado) return;

    // Array de días por defecto
    const diasPorDefecto = [
        { dia: 'LUNES', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'MARTES', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'MIERCOLES', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'JUEVES', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'VIERNES', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'SABADO', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'DOMINGO', entrada: '-', salida_comida: '-', entrada_comida: '', salida: '-' }
    ];

    // Obtener horarios: usar los del empleado o los por defecto
    const horarios = (empleado.horario_oficial && Array.isArray(empleado.horario_oficial) && empleado.horario_oficial.length > 0)
        ? empleado.horario_oficial
        : diasPorDefecto;

    // Limpiar la tabla
    $('#tbody-horarios-oficiales-coordinadores').empty();

    // Iterar sobre los horarios y agregar filas
    horarios.forEach(horario => {
        // Buscar si existe justificación para este día
        const justificacion = empleado.dias_justificados?.find(j => j.dia === horario.dia);
        const nombreJustificacion = justificacion ? `<span class="badge bg-info ms-2">${justificacion.tipo}</span>` : '';
        
        const fila = `
            <tr>
                <td>${horario.dia || '-'}</td>
                <td>${horario.entrada || '-'}</td>
                <td>${horario.salida_comida || '-'}</td>
                <td>${horario.entrada_comida || '-'}</td>
                <td>${horario.salida || '-'}</td>
                 <td>
                    <div class="d-flex gap-1 align-items-center">
                        <button type="button" class="btn btn-outline-primary btn-sm btn-justificado-coordinador" title="Abrir modal">
                            <i class="bi bi-clipboard2-check"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-horario-coordinador" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                        ${nombreJustificacion}
                    </div>
                </td>
            </tr> 
        `;

        // Agregar fila a la tabla
        $('#tbody-horarios-oficiales-coordinadores').append(fila);
    });
}

/************************************
 * ESTABLECER PERCEPCIONES DEL EMPLEADO
 ************************************/

// Función para establecer las percepciones del empleado en el modal
function establecerPercepciones(empleado) {

    // Si no hay empleado, salir
    if (!empleado) return;

    // Establecer sueldo semanal
    $('#mod-sueldo-semanal-coordinador').val(empleado.salario_semanal || '');
    // Establecer sueldo extra total
    $('#mod-total-extra-coordinador').val(empleado.sueldo_extra_total || '');
    mostrarPercepcionesExtras(empleado);

}


/************************************
 * ESTABLECER CONCEPTOS DEL EMPLEADO
 ************************************/

// Función para establecer los conceptos del empleado en el modal
function establecerConceptos(empleado) {

    // Si no hay empleado, salir
    if (!empleado) return;

    // Verificar si el empleado tiene seguro social
    const tieneSeguroSocial = empleado.seguroSocial !== false;

    desabilitarCamposConceptos(tieneSeguroSocial);
    const conceptos = empleado.conceptos || [];

    // Buscar conceptos por código
    const conceptoISR = conceptos.find(c => c.codigo === "45");
    const conceptoIMSS = conceptos.find(c => c.codigo === "52");
    const conceptoInfonavit = conceptos.find(c => c.codigo === "16");
    const conceptoAjusteSub = conceptos.find(c => c.codigo === "107");

    // Establecer valores en los campos de entrada
    $('#mod-isr-coordinador').val(conceptoISR ? conceptoISR.resultado || '' : '');
    $('#mod-imss-coordinador').val(conceptoIMSS ? conceptoIMSS.resultado || '' : '');
    $('#mod-infonavit-coordinador').val(conceptoInfonavit ? conceptoInfonavit.resultado || '' : '');
    $('#mod-ajustes-sub-coordinador').val(conceptoAjusteSub ? conceptoAjusteSub.resultado || '' : '');

    // Calcular total de conceptos
    calcularTotalConceptos();
}

// Función para calcular el total de conceptos y mostrarlo en el campo correspondiente
function calcularTotalConceptos() {
    const isr = parseFloat($('#mod-isr-coordinador').val()) || 0;
    const imss = parseFloat($('#mod-imss-coordinador').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-coordinador').val()) || 0;
    const ajusteSub = parseFloat($('#mod-ajustes-sub-coordinador').val()) || 0;

    const total = isr + imss + infonavit + ajusteSub;

    $('#mod-total-conceptos-coordinador').val(total.toFixed(2));
}

function desabilitarCamposConceptos(tieneSeguroSocial) {

    // Deshabilitar o habilitar campos de conceptos según seguroSocial
    if (!tieneSeguroSocial) {
        // Deshabilitar campos de entrada
        $('#mod-isr-coordinador').prop('disabled', true);
        $('#mod-imss-coordinador').prop('disabled', true);
        $('#mod-infonavit-coordinador').prop('disabled', true);
        $('#mod-ajustes-sub-coordinador').prop('disabled', true);

        // Deshabilitar botones de aplicar
        $('#btn-aplicar-isr-coordinador').prop('disabled', true);
        $('#btn-aplicar-imss-coordinador').prop('disabled', true);
        $('#btn-aplicar-infonavit-coordinador').prop('disabled', true);
        $('#btn-aplicar-ajuste-sub-coordinador').prop('disabled', true);

        // Deshabilitar total (aunque ya tiene readonly)
        $('#mod-total-conceptos-coordinador').prop('disabled', true);



        return; // Salir sin procesar conceptos
    }

    // Si tiene seguro social, habilitar los campos
    $('#mod-isr-coordinador').prop('disabled', false);
    $('#mod-imss-coordinador').prop('disabled', false);
    $('#mod-infonavit-coordinador').prop('disabled', false);
    $('#mod-ajustes-sub-coordinador').prop('disabled', false);

    $('#btn-aplicar-isr-coordinador').prop('disabled', false);
    $('#btn-aplicar-imss-coordinador').prop('disabled', false);
    $('#btn-aplicar-infonavit-coordinador').prop('disabled', false);
    $('#btn-aplicar-ajuste-sub-coordinador').prop('disabled', false);

    $('#mod-total-conceptos-coordinador').prop('disabled', false);
}


/************************************
 * ESTABLECER DEDUCCIONES DEL EMPLEADO
 ************************************/

function establerDeducciones(empleado) {
    // Si no hay empleado, salir
    if (!empleado) return;

    // Establecer tarjeta 
    $('#mod-tarjeta-coordinador').val(empleado.tarjeta || '');
    // Establecer préstamo
    $('#mod-prestamo-coordinador').val(empleado.prestamo || '');
    // Establecer checador
    $('#mod-checador-coordinador').val(empleado.checador || '');
    // Establecer retardos
    $('#mod-retardos-coordinador').val(empleado.retardos || '');
    // Establecer inasistencias
    $('#mod-inasistencias-coordinador').val(empleado.inasistencia || '');
    // Establecer permisos 
    $('#mod-permisos-coordinador').val(empleado.permiso || '');
    // Establecer uniforme 
    $('#mod-uniforme-coordinador').val(empleado.uniformes || '');

    // Establecer deducciones extras (depende del array)
    mostrarDeduccionesExtras(empleado);
    $('#mod-fagafetcofia-coordinador').val(empleado.fa_gafet_cofia || '');

    // Restaurar estado del redondeo (si estaba activo al guardar)
    const redondeoActivo = empleado.redondeo_activo === true;
    $('#mod-redondear-sueldo-coordinador').prop('checked', redondeoActivo);
    if (redondeoActivo) {
        $('#mod-redondeo-opciones-coordinador').show();
    } else {
        $('#mod-redondeo-opciones-coordinador').hide();
    }
}


/************************************
 * ESTABLECER HISTORIAL RETARDOS, CHECADOR, INASISTENCIAS
 ************************************/

function establecerHistorialChecador(empleado) {
    // Validar que exista el empleado
    if (!empleado) return;

    // Obtener el contenedor del historial
    const $contenedor = $('#contenedor-historial-olvidos');
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
function establecerHistorialUniforme(empleado) {
    if (!empleado) return;
    const $contenedor = $('#contenedor-historial-uniforme-coordinador');
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
function establecerHistorialRetardos(empleado) {
    // Validar que exista el empleado
    if (!empleado) return;

    // Obtener el contenedor del historial
    const $contenedor = $('#contenedor-historial-retardos');
    $contenedor.empty();

    // Si no hay historial, mostrar mensaje
    if (!Array.isArray(empleado.historial_retardos) || empleado.historial_retardos.length === 0) {
        $contenedor.html('<p class="text-muted text-center">Sin retardos por mostrar</p>');
        return;
    }

    // Crear tabla con los datos del historial
    const html = `
        <table class="table table-sm table-hover mb-0">
            <thead>
                <tr>
                    <th>Día</th>
                    <th>Fecha</th>
                    <th>Minutos</th>
                    <th>Tolerancia</th>
                    <th>$/min</th>
                    <th>Descuento</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                ${empleado.historial_retardos.map((retardo, indice) => `
                    <tr>
                        <td>${retardo.dia}</td>
                        <td>${retardo.fecha}</td>
                        <td>${retardo.minutos_retardo}m</td>
                        <td>${retardo.tolerancia}m</td>
                        <td>$${retardo.descuento_por_minuto}</td>
                        <td>$${parseFloat(retardo.total_descontado).toFixed(2)}</td>
                        <td><button type="button" class="btn btn-sm btn-primary btn-editar-retardo" data-index="${indice}"><i class="bi bi-pencil"></i></button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    $contenedor.html(html);
}

function establecerHistorialInasistencias(empleado) {
    // Validar que exista el empleado
    if (!empleado) return;

    // Obtener el contenedor del historial
    const $contenedor = $('#contenedor-historial-inasistencias-coordinador');
    $contenedor.empty();

    // Si no hay historial, mostrar mensaje
    if (!Array.isArray(empleado.historial_inasistencias) || empleado.historial_inasistencias.length === 0) {
        $contenedor.html('<p class="text-muted text-center">Sin inasistencias por mostrar</p>');
        return;
    }

    // Crear tabla con los datos del historial
    const html = `
        <table class="table table-sm table-hover mb-0">
            <thead>
                <tr>
                    <th>Día</th>
                    <th>Descuento</th>
                    <th>Tipo</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                ${empleado.historial_inasistencias.map((inasistencia, index) => `
                    <tr>
                        <td>${inasistencia.dia}</td>
                        <td>$${parseFloat(inasistencia.descuento_inasistencia).toFixed(2)}</td>
                        <td><span class="badge ${inasistencia.tipo === 'manual' ? 'bg-info' : 'bg-secondary'}">${inasistencia.tipo === 'manual' ? 'Manual' : 'Automática'}</span></td>
                        <td>
                            ${inasistencia.tipo === 'manual' ? `<button type="button" class="btn btn-sm btn-danger btn-eliminar-inasistencia-manual" data-index="${index}"><i class="bi bi-trash"></i></button>` : '<span class="text-muted">-</span>'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    $contenedor.html(html);

    // Agregar evento para eliminar inasistencias manuales

}

function establecerHistorialPermisos(empleado) {
    // Validar que exista el empleado
    if (!empleado) return;

    // Obtener el contenedor del historial
    const $contenedor = $('#contenedor-historial-permisos-coordinador');
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