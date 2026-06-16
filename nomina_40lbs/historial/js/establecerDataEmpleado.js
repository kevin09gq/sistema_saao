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

    // Establecer percepciones del empleado
    establecerPercepciones(empleado);
    mostrarPercepcionesExtras40lbs(empleado);

    // Establecer conceptos del empleado
    establecerConceptos(empleado);

    // Establecer deducciones del empleado
    establecerDeducciones(empleado);
    mostrarDeduccionesExtras40lbs(empleado);

    // Establecer historial de checador, inasistencias, permisos y uniforme
    establecerHistorialChecador(empleado);
    establecerHistorialInasistencias(empleado);
    establecerHistorialPermisos(empleado);
    establecerHistorialUniforme(empleado);

    // Establecer sueldo a cobrar
    establecerSueldoACobrar(empleado);

    // Hacer que todos los campos del modal sean de solo lectura
    $('#modal-40lbs input').prop('readonly', true);
    $('#modal-40lbs input, #modal-40lbs textarea').prop('readonly', true);
    $('#modal-40lbs select').prop('disabled', true);

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

function mostrarPercepcionesExtras40lbs(empleado) {

    // Limpiar el contenedor de percepciones adicionales
    $('#contenedor-conceptos-adicionales-40lbs').empty();

    // Si existen percepciones adicionales, mostrarlas
    if (empleado.percepciones_extra && Array.isArray(empleado.percepciones_extra) && empleado.percepciones_extra.length > 0) {
        empleado.percepciones_extra.forEach((percepcion) => {
            // Crear elemento de percepción con datos existentes
            const htmlPercepcion = `
                <div class="col-md-6 mb-3 percepcion-extra-item">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-semibold">Concepto Adicional</span>
                    </div>
                    <div class="mt-2">
                        <input type="text" class="form-control form-control-sm mb-2 nombre-percepcion" 
                               value="${percepcion.nombre || ''}" placeholder="Nombre del concepto">
                        <input type="number" step="0.01" class="form-control form-control-sm cantidad-percepcion" 
                               value="${percepcion.cantidad || 0.00}" placeholder="0.00">
                    </div>
                </div>
            `;

            // Agregar el elemento al contenedor
            $('#contenedor-conceptos-adicionales-40lbs').append(htmlPercepcion);

        });
    }
}

/************************************
 * ESTABLECER CONCEPTOS DEL EMPLEADO
 ************************************/

function establecerConceptos(empleado) {

    // Si no hay empleado, salir
    if (!empleado) return;

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
    $('#mod-uniforme-40lbs').val(empleado.uniformes || '');
    // Establecer inasistencias
    $('#mod-inasistencias-40lbs').val(empleado.inasistencia || '');
    // Establecer fa_gafet_cofia
    $('#mod-fagafetcofia-40lbs').val(empleado.fa_gafet_cofia || '');



}

function mostrarDeduccionesExtras40lbs(empleado) {

    // Si no hay empleado, salir
    if (!empleado) return;

    // Limpiar el contenedor de deducciones adicionales
    $('#contenedor-deducciones-adicionales-40lbs').empty();

    // Si existen deducciones adicionales, mostrarlas
    if (empleado.deducciones_extra && Array.isArray(empleado.deducciones_extra) && empleado.deducciones_extra.length > 0) {
        empleado.deducciones_extra.forEach((deduccion) => {
            const elementoDeduccion = `
            <div class="col-md-6 mb-3 deduccion-extra-item">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-semibold">Deducción Adicional</span>
                </div>
                <div class="mt-2">
                    <input type="text" class="form-control form-control-sm mb-2 nombre-deduccion" 
                           value="${deduccion.nombre || ''}" placeholder="Nombre de la deducción">
                    <input type="number" step="0.01" class="form-control form-control-sm cantidad-deduccion" 
                           value="${parseFloat(deduccion.cantidad).toFixed(2)}" placeholder="0.00">
                </div>
            </div>
        `;
            $('#contenedor-deducciones-adicionales-40lbs').append(elementoDeduccion);
        });
    }
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
                    
                </tr>
            </thead>
            <tbody>
                ${empleado.historial_olvidos.map((olvido, index) => `
                    <tr>
                        <td>${olvido.dia}</td>
                        <td>${olvido.fecha}</td>
                        <td>$${parseFloat(olvido.descuento_olvido).toFixed(2)}</td>
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
                    
                </tr>
            </thead>
            <tbody>
                ${empleado.historial_inasistencias.map((inasistencia, index) => {
        const esAutoIgnorada = inasistencia.tipo === 'automatico' && empleado.ignorar_inasistencias_automaticas;
        return `
                        <tr class="${esAutoIgnorada ? 'opacity-50 text-decoration-line-through' : ''}">
                            <td>${inasistencia.dia}</td>
                            <td>$${parseFloat(inasistencia.descuento_inasistencia).toFixed(2)}</td>
                            <td>
                                <span class="badge ${inasistencia.tipo === 'manual' ? 'bg-info' : 'bg-secondary'}">${inasistencia.tipo === 'manual' ? 'Manual' : 'Automática'}</span>
                                ${esAutoIgnorada ? '<span class="badge bg-warning text-dark ms-1">Ignorada</span>' : ''}
                            </td>
                        </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
    `;

    $contenedor.html(html);
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
                   
                </tr>
            </thead>
            <tbody>
                ${empleado.historial_permisos.map((permiso, index) => `
                    <tr>
                        <td>${permiso.dia}</td>
                        <td>${permiso.minutos_permiso}m</td>
                        <td>$${parseFloat(permiso.costo_por_minuto).toFixed(2)}</td>
                        <td>$${parseFloat(permiso.descuento_permiso).toFixed(2)}</td>
                       
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
                    
                </tr>
            </thead>
            <tbody>
                ${empleado.historial_uniforme.map((u, index) => `
                    <tr>
                        <td>${u.folio}</td>
                        <td>${u.cantidad}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    $contenedor.html(html);
}

function establecerSueldoACobrar(empleado) {
    if (!empleado) return;
    const $input = $('#mod-sueldo-a-cobrar-40lbs');
    $input.val(empleado.total_cobrar ? parseFloat(empleado.total_cobrar).toFixed(2) : '0.00');
}