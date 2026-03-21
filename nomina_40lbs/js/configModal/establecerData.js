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

    // Establecer Biometrico Redondeado del empleado
    establecerBiomtricoRedondeado(empleado);

    // Establecer percepciones del empleado
    establecerPercepciones(empleado);

    // Establecer percepciones adicionales del empleado
    mostrarPercepcionesExtras40lbs(empleado);
    mostrarDeduccionesExtras40lbs(empleado);

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

    // Mostrar modal usando Bootstrap
    const modalEl = document.getElementById('modal-40lbs');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/************************************
 * ESTABLECER INFORMACIÓN DEL EMPLEADO
 ************************************/

function establecerInformacionEmpleado(empleado) {
    // Rellenar los campos del modal con los datos del empleado
    $('#campo-clave-40lbs').text(empleado.clave || '');
    $('#campo-nombre-40lbs').text(empleado.nombre || '');
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
    $('#tbody-biometrico-40lbs').empty();

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
        $('#tbody-biometrico-40lbs').append(fila);
    });
}

/************************************
 * ESTABLECER BIOMÉTRICO REDONDEADO DEL EMPLEADO
 ************************************/
function establecerBiomtricoRedondeado(empleado) {
    // Si no hay empleado o no tiene biometrico_redondeado, salir
    if (!empleado || !empleado.biometrico_redondeado || !Array.isArray(empleado.biometrico_redondeado)) {
        return;
    }

    // Limpiar la tabla
    $('#tbody-biometrico-redondeado-40lbs').empty();

    // Iterar sobre los registros de biometrico redondeado
    empleado.biometrico_redondeado.forEach(registro => {
        // Capitalizar el nombre del día (viernes -> Viernes)
        const nombreDia = registro.dia.charAt(0).toUpperCase() + registro.dia.slice(1);

        // Crear fila con los datos
        const fila = `
            <tr>
                <td class="text-center">${nombreDia}</td>
                <td class="text-center">${registro.entrada || '-'}</td>
                <td class="text-center">${registro.termino_comida || '-'}</td>
                <td class="text-center">${registro.entrada_comida || '-'}</td>
                <td class="text-center">${registro.salida || '-'}</td>
                <td class="text-center">${registro.horas_comida || '-'}</td>
                <td class="text-center">${registro.minutos_trabajados || '-'}</td>
                <td class="text-center">${registro.horas_trabajadas || '-'}</td>
                <td class="text-center"><button class="btn btn-sm btn-outline-secondary">Editar</button></td>
            </tr>
        `;

        // Agregar fila a la tabla
        $('#tbody-biometrico-redondeado-40lbs').append(fila);
    });
}


/************************************
 * ESTABLECER PERCEPCIONES DEL EMPLEADO
 ************************************/
function establecerPercepciones(empleado) {
    // Establecer sueldo neto
    $("#mod-sueldo-neto-40lbs").val(empleado.sueldo_neto || '');

    // Establecer incentivo 
    $("#mod-incentivo-40lbs").val(empleado.incentivo || '');

    // Establecer Horas extras
    $("#mod-horas-extras-40lbs").val(empleado.horas_extra || '');

    // Establecer Bono de Antiguedad
    $("#mod-bono-antiguedad-40lbs").val(empleado.bono_antiguedad || '');

    // Establecer actividades especiales
    $("#mod-actividades-especiales-40lbs").val(empleado.actividades_especiales || '');

    // Establecer puesto
    $("#mod-puesto-40lbs").val(empleado.puesto || '');

    // Establecer total extras
    $("#mod-total-extra-40lbs").val(empleado.sueldo_extra_total || '');

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
    $('#mod-isr-40lbs').val(conceptoISR ? conceptoISR.resultado || '' : '');
    $('#mod-imss-40lbs').val(conceptoIMSS ? conceptoIMSS.resultado || '' : '');
    $('#mod-infonavit-40lbs').val(conceptoInfonavit ? conceptoInfonavit.resultado || '' : '');
    $('#mod-ajustes-sub-40lbs').val(conceptoAjusteSub ? conceptoAjusteSub.resultado || '' : '');

    // Calcular total de conceptos
    calcularTotalConceptosJornalero();
}

// Función para calcular el total de conceptos y mostrarlo en el campo correspondiente
function calcularTotalConceptosJornalero() {
    const isr = parseFloat($('#mod-isr-40lbs').val()) || 0;
    const imss = parseFloat($('#mod-imss-40lbs').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-40lbs').val()) || 0;
    const ajusteSub = parseFloat($('#mod-ajustes-sub-40lbs').val()) || 0;

    const total = isr + imss + infonavit + ajusteSub;

    $('#mod-total-conceptos-40lbs').val(total.toFixed(2));
}

function desabilitarCamposConceptos(tieneSeguroSocial) {

    // Deshabilitar o habilitar campos de conceptos según seguroSocial
    if (!tieneSeguroSocial) {
        // Deshabilitar campos de entrada
        $('#mod-isr-40lbs').prop('disabled', true);
        $('#mod-imss-40lbs').prop('disabled', true);
        $('#mod-infonavit-40lbs').prop('disabled', true);
        $('#mod-ajustes-sub-40lbs').prop('disabled', true);

        // Deshabilitar botones de aplicar
        $('#btn-aplicar-isr-40lbs').prop('disabled', true);
        $('#btn-aplicar-imss-40lbs').prop('disabled', true);
        $('#btn-aplicar-infonavit-40lbs').prop('disabled', true);
        $('#btn-aplicar-ajuste-sub-40lbs').prop('disabled', true);

        // Deshabilitar total (aunque ya tiene readonly)
        $('#mod-total-conceptos-40lbs').prop('disabled', true);

        return; // Salir sin procesar conceptos
    }

    // Si tiene seguro social, habilitar los campos
    $('#mod-isr-40lbs').prop('disabled', false);
    $('#mod-imss-40lbs').prop('disabled', false);
    $('#mod-infonavit-40lbs').prop('disabled', false);
    $('#mod-ajustes-sub-40lbs').prop('disabled', false);

    $('#btn-aplicar-isr-40lbs').prop('disabled', false);
    $('#btn-aplicar-imss-40lbs').prop('disabled', false);
    $('#btn-aplicar-infonavit-40lbs').prop('disabled', false);
    $('#btn-aplicar-ajuste-sub-40lbs').prop('disabled', false);

    $('#mod-total-conceptos-40lbs').prop('disabled', false);
}


/************************************
 * ESTABLECER DEDUCCIONES DEL EMPLEADO
 ************************************/

function establecerDeducciones(empleado) {
    // Si no hay empleado, salir
    if (!empleado) return;

    // Establecer tarjeta 
    $('#mod-tarjeta-40lbs').val(empleado.tarjeta || '');
    // Establecer préstamo
    $('#mod-prestamo-40lbs').val(empleado.prestamo || '');
    // Establecer Permiso
    $('#mod-permisos-40lbs').val(empleado.permiso || '');
    // Establecer checador
    $('#mod-checador-40lbs').val(empleado.checador || '');
    // Establecer Uniforme
    $('#mod-uniforme-40lbs').val(empleado.uniforme || '');
    // Establecer inasistencias
    $('#mod-inasistencias-40lbs').val(empleado.inasistencia || '');
    // Establecer fa_gafet_cofia
    $('#mod-fagafetcofia-40lbs').val(empleado.fa_gafet_cofia || '');

    // Restaurar estado del redondeo (si estaba activo al guardar)
    const redondeoActivo = empleado.redondeo_activo === true;
    $('#mod-redondear-sueldo-40lbs').prop('checked', redondeoActivo);
 
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
    const $contenedor = $('#contenedor-historial-inasistencias-40lbs');
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
    const $contenedor = $('#contenedor-historial-permisos-40lbs');
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
    const $contenedor = $('#contenedor-historial-uniforme-40lbs');
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
