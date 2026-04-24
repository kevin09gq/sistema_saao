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

function establerDataModal(empleado) {
    // Guardar el empleado en el objeto
    objEmpleado.setEmpleado(empleado);

    // Establecer información del empleado
    establecerInformacionEmpleado(empleado);

    // Establecer Biometrico del empleado
    establecerBiometrico(empleado);

    // Colorear filas de biométrico según eventos
    establecerColorBiometrico(empleado);

    // Establecer percepciones del empleado
    establecerPercepciones(empleado);

    // Establecer percepciones adicionales del empleado
    mostrarPercepcionesExtras10lbs(empleado);
    mostrarDeduccionesExtras10lbs(empleado);

    // Establecer conceptos del empleado
    establecerConceptos(empleado);

    // Establecer deducciones del empleado
    establecerDeducciones(empleado);

    // Establecer historial de checador del empleado
    establecerHistorialChecador(empleado);
    // Establecer historial de inasistencias del empleado
    establecerHistorialInasistencias(empleado);
    // Establecer historial de permisos del empleado
    establecerHistorialPermisos(empleado);
    // Establecer historial de uniforme del empleado
    establecerHistorialUniforme(empleado);

    mostrarEntradasTempranas(empleado);
    mostrarSalidasTardias(empleado);
    mostrarSalidasTempranas(empleado);
    mostrarRetardos(empleado);
    mostrarInasistencias(empleado);
    mostrarOlvidosChecador(empleado);


    calcularSueldoACobrar();

    // Cargar los tipos de cajas empacadas en el select
    establecerTiposCajasEmpacadas();

    // Mostrar el historial de empaque si existe
    mostrarHistorialEmpaque(empleado);

    // Mostrar modal usando Bootstrap
    const modalEl = document.getElementById('modal-10lbs');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/************************************
 * ESTABLECER INFORMACIÓN DEL EMPLEADO
 ************************************/

function establecerInformacionEmpleado(empleado) {
    // Rellenar los campos del modal con los datos del empleado
    $('#campo-clave-10lbs').text(empleado.clave || '');
    $('#campo-nombre-10lbs').text(empleado.nombre || '');
    $('#campo-minutos-trabajados-10lbs').text(empleado.minutos_trabajados || '0');
    $('#campo-minutos-extras-10lbs').text(empleado.minutos_extras_trabajados || '0');
    $('#nombre-empleado-modal').text(empleado.nombre || '');
}

/************************************
 * ESTABLECER BIOMETRICO DEL EMPLEADO
 ************************************/
function establecerBiometrico(empleado) {

    // Si no hay empleado, salir
    if (!empleado || !empleado.registros) return;

    // Array de nombres de días en español
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Limpiar la tabla
    $('#tbody-biometrico-10lbs').empty();

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
        $('#tbody-biometrico-10lbs').append(fila);
    });
}

function establecerColorBiometrico(empleado) {
    if (!empleado || !empleado.registros) return;

    // Definir colores para cada tipo de evento
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

    };

    // Identificar la primera y última fila de cada fecha para aplicar eventos específicos
    const primeraFilaPorFecha = {};
    const ultimaFilaPorFecha = {};
    let fechaAnterior = null;

    $('#tbody-biometrico-10lbs tr').each(function () {
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

    // Obtener horarios semanales globales para comparaciones (si están disponibles)
    const horariosPorDia = {};
    if (window.jsonNomina10lbs && Array.isArray(window.jsonNomina10lbs.horarios_semanales)) {
        window.jsonNomina10lbs.horarios_semanales.forEach(h => {
            horariosPorDia[normalizarDia(h.dia)] = h;
        });
    }

    // Recorrer las filas y aplicar lógica de colorización
    $('#tbody-biometrico-10lbs tr').each(function () {
        const $fila = $(this);
        const $celdas = $fila.find('td');
        const fecha = $celdas.eq(1).text().trim();
        const entrada = $celdas.eq(2).text().trim();
        const salida = $celdas.eq(3).text().trim();

        if (!fecha) return;

        const eventosEnRegistro = [];
        let colorAplicar = null;
        const diaNom = normalizarDia(nombreDia(fecha));
        const horario = horariosPorDia[diaNom];

    

        // 2. OLVIDOS (Si falta entrada o salida)
        if ((entrada === '-' || salida === '-') && Array.isArray(empleado.historial_olvidos)) {
            const tieneOlvido = empleado.historial_olvidos.some(o => o.fecha === fecha);
            if (tieneOlvido) {
                if (!colorAplicar) colorAplicar = colores.olvido;
                eventosEnRegistro.push(abreviaturas.olvido);
            }
        }

        // Si tenemos horario, calcular eventos de tiempo
        if (horario) {
            // 3. RETARDOS (Solo en la primera fila del día)
            if (primeraFilaPorFecha[fecha] === this && entrada && entrada !== '-' && horario.entrada) {
                const diff = aMinutos(entrada) - aMinutos(horario.entrada);
                if (diff > 0) {
                    if (!colorAplicar) colorAplicar = colores.retardo;
                    eventosEnRegistro.push(abreviaturas.retardo);
                }
            }

            // 4. ENTRADAS TEMPRANAS (Solo en la primera fila del día)
            if (primeraFilaPorFecha[fecha] === this && entrada && entrada !== '-' && horario.entrada) {
                const diff = aMinutos(entrada) - aMinutos(horario.entrada);
                if (diff < -50) { // Siguiendo lógica de eventos.js
                    if (!colorAplicar) colorAplicar = colores.entrada_temprana;
                    eventosEnRegistro.push(abreviaturas.entrada_temprana);
                }
            }

            // 5. SALIDAS TARDÍAS (Solo en la última fila del día)
            if (ultimaFilaPorFecha[fecha] === this && salida && salida !== '-' && horario.salida) {
                const diff = aMinutos(salida) - aMinutos(horario.salida);
                if (diff > 50) { // Siguiendo lógica de eventos.js
                    if (!colorAplicar) colorAplicar = colores.salida_tardia;
                    eventosEnRegistro.push(abreviaturas.salida_tardia);
                }
            }

            // 6. SALIDAS TEMPRANAS (Solo en la última fila del día)
            if (ultimaFilaPorFecha[fecha] === this && salida && salida !== '-' && horario.salida) {
                const diff = aMinutos(salida) - aMinutos(horario.salida);
                if (diff < -5) { // Siguiendo lógica de eventos.js
                    if (!colorAplicar) colorAplicar = colores.salida_temprana;
                    eventosEnRegistro.push(abreviaturas.salida_temprana);
                }
            }
        }

        // Aplicar el color si se encontró un evento
        if (colorAplicar) {
            $fila.css('background-color', colorAplicar);
        }

        // Agregar badge si hay eventos detectados
        if (eventosEnRegistro.length > 0) {
            const eventosTexto = eventosEnRegistro.join(', ');
            const badgeColor = '#000000';
            const badge = `<span class="badge" style="background-color: ${colorAplicar || '#e5e7eb'}; color: ${badgeColor}; margin-left: 8px; font-size: 0.85em; padding: 2px 6px; border:1px solid ${badgeColor}; border-radius:4px;">${eventosTexto}</span>`;
            $celdas.eq(0).append(badge);
        }
    });
}

/************************************
 * ESTABLECER PERCEPCIONES DEL EMPLEADO
 ************************************/
function establecerPercepciones(empleado) {
    // Establecer sueldo neto
    $("#mod-sueldo-neto-10lbs").val(empleado.sueldo_neto || '');

    // Establecer total extras
    $("#mod-total-extra-10lbs").val(empleado.sueldo_extra_total || '');

}

/************************************
 * ESTABLECER CONCEPTOS DEL EMPLEADO
 ************************************/

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
    $('#mod-isr-10lbs').val(conceptoISR ? conceptoISR.resultado || '' : '');
    $('#mod-imss-10lbs').val(conceptoIMSS ? conceptoIMSS.resultado || '' : '');
    $('#mod-infonavit-10lbs').val(conceptoInfonavit ? conceptoInfonavit.resultado || '' : '');
    $('#mod-ajustes-sub-10lbs').val(conceptoAjusteSub ? conceptoAjusteSub.resultado || '' : '');

    // Calcular total de conceptos
    calcularTotalConceptosJornalero();
}

// Función para calcular el total de conceptos y mostrarlo en el campo correspondiente
function calcularTotalConceptosJornalero() {
    const isr = parseFloat($('#mod-isr-10lbs').val()) || 0;
    const imss = parseFloat($('#mod-imss-10lbs').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-10lbs').val()) || 0;
    const ajusteSub = parseFloat($('#mod-ajustes-sub-10lbs').val()) || 0;

    const total = isr + imss + infonavit + ajusteSub;

    $('#mod-total-conceptos-10lbs').val(total.toFixed(2));
}

function desabilitarCamposConceptos(tieneSeguroSocial) {

    // Deshabilitar o habilitar campos de conceptos según seguroSocial
    if (!tieneSeguroSocial) {
        // Deshabilitar campos de entrada
        $('#mod-isr-10lbs').prop('disabled', true);
        $('#mod-imss-10lbs').prop('disabled', true);
        $('#mod-infonavit-10lbs').prop('disabled', true);
        $('#mod-ajustes-sub-10lbs').prop('disabled', true);

        // Deshabilitar botones de aplicar
        $('#btn-aplicar-isr-10lbs').prop('disabled', true);
        $('#btn-aplicar-imss-10lbs').prop('disabled', true);
        $('#btn-aplicar-infonavit-10lbs').prop('disabled', true);
        $('#btn-aplicar-ajuste-sub-10lbs').prop('disabled', true);

        // Deshabilitar total (aunque ya tiene readonly)
        $('#mod-total-conceptos-10lbs').prop('disabled', true);

        return; // Salir sin procesar conceptos
    }

    // Si tiene seguro social, habilitar los campos
    $('#mod-isr-10lbs').prop('disabled', false);
    $('#mod-imss-10lbs').prop('disabled', false);
    $('#mod-infonavit-10lbs').prop('disabled', false);
    $('#mod-ajustes-sub-10lbs').prop('disabled', false);

    $('#btn-aplicar-isr-10lbs').prop('disabled', false);
    $('#btn-aplicar-imss-10lbs').prop('disabled', false);
    $('#btn-aplicar-infonavit-10lbs').prop('disabled', false);
    $('#btn-aplicar-ajuste-sub-10lbs').prop('disabled', false);

    $('#mod-total-conceptos-10lbs').prop('disabled', false);
}


/************************************
 * ESTABLECER DEDUCCIONES DEL EMPLEADO
 ************************************/

function establecerDeducciones(empleado) {
    // Si no hay empleado, salir
    if (!empleado) return;

    // Establecer tarjeta 
    $('#mod-tarjeta-10lbs').val(empleado.tarjeta || '');
    // Establecer préstamo
    $('#mod-prestamo-10lbs').val(empleado.prestamo || '');
    // Establecer Permiso
    $('#mod-permisos-10lbs').val(empleado.permiso || '');
    // Establecer checador
    $('#mod-checador-10lbs').val(empleado.checador || '');
    // Establecer Uniforme
    $('#mod-uniforme-10lbs').val(empleado.uniforme || '');
    // Establecer inasistencias
    $('#mod-inasistencias-10lbs').val(empleado.inasistencia || '');
    // Establecer fa_gafet_cofia
    $('#mod-fagafetcofia-10lbs').val(empleado.fa_gafet_cofia || '');

    // Restaurar estado del redondeo (si estaba activo al guardar)
    const redondeoActivo = empleado.redondeo_activo === true;
    $('#mod-redondear-sueldo-10lbs').prop('checked', redondeoActivo);

}

/************************************
 * ESTABLECER HISTORIAL CHECADOR, INASISTENCIAS
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

function establecerHistorialInasistencias(empleado) {
    // Validar que exista el empleado
    if (!empleado) return;

    // Obtener el contenedor del historial
    const $contenedor = $('#contenedor-historial-inasistencias-10lbs');
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
    const $contenedor = $('#contenedor-historial-permisos-10lbs');
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

function establecerHistorialUniforme(empleado) {
    if (!empleado) return;
    const $contenedor = $('#contenedor-historial-uniforme-10lbs');
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


/************************************
 * ESTABLECER LOS TIPOS DE CAJAS EMPACADAS 
 ************************************/

function establecerTiposCajasEmpacadas() {
    const $select = $('#select-tipo-caja-10lbs');
    $select.empty().append('<option value="">Seleccionar tipo...</option>');

    // Validar que existan los datos en el JSON global
    if (jsonNomina10lbs && Array.isArray(jsonNomina10lbs.precio_cajas)) {
        jsonNomina10lbs.precio_cajas.forEach(caja => {
            // Solo mostrar los que tienen utilidad true
            if (caja.utilidad === true) {
                // Formato: "12:1 - $17"
                const precioFormateado = parseFloat(caja.precio).toFixed(0);
                const textoOption = `${caja.valor} - $${precioFormateado}`;

                $select.append(`<option value="${caja.valor}" data-precio="${caja.precio}">${textoOption}</option>`);
            }
        });
    }
}

/************************************
 * MOSTRAR HISTORIAL DE EMPAQUE
 ************************************/
function mostrarHistorialEmpaque(empleado) {
    if (!empleado) return;

    const $tbody = $('#tbody-cajas-10lbs');
    $tbody.empty();

    let totalCantidad = 0;
    let totalPago = 0;

    if (Array.isArray(empleado.historial_empaque) && empleado.historial_empaque.length > 0) {
        empleado.historial_empaque.forEach((item, index) => {
            totalCantidad += parseInt(item.cantidad) || 0;
            totalPago += parseFloat(item.subtotal) || 0;

            const fila = `
                <tr>
                    <td>${item.dia}</td>
                    <td>${item.tipo}</td>
                    <td class="text-success">$${parseFloat(item.precio_unitario).toFixed(2)}</td>
                    <td class="fw-bold">${item.cantidad}</td>
                    <td class="fw-bold text-primary">$${parseFloat(item.subtotal).toFixed(2)}</td>
                    <td>
                        <button type="button" class="btn btn-link btn-delete-caja" onclick="eliminarEmpaque(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            $tbody.append(fila);
        });
    } else {
        $tbody.html('<tr><td colspan="6" class="text-center text-muted py-3">No hay registros de cajas empacadas para esta semana.</td></tr>');
    }

    // Actualizar totales en el pie de tabla
    $('#total-cantidad-cajas-10lbs').text(totalCantidad);
    $('#total-pago-cajas-10lbs').text(`$${totalPago.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
}


