// Función para calcular el total de sueldo extra (scoped al modal visible)
// MEJORADA: Ahora detecta si es modal de detalles o de ticket manual
function calcularTotalExtra() {
    const modal = document.querySelector('.modal.show') || document;
    
    // Verificar si es el modal de DETALLES (tiene #campo-clave con IDs como #mod-horas-extras)
    const esModalDetalles = modal.querySelector('#campo-clave') !== null;
    
    if (esModalDetalles) {
        // ===== LÓGICA PARA MODAL DE DETALLES =====
        const horasExtras = parseFloat(document.querySelector('#mod-horas-extras').value) || 0;
        const bonoAntiguedad = parseFloat(document.querySelector('#mod-bono-antiguedad').value) || 0;
        const actividadesEspeciales = parseFloat(document.querySelector('#mod-actividades-especiales').value) || 0;
        const bonoPuesto = parseFloat(document.querySelector('#mod-bono-responsabilidad').value) || 0;

        // Sumar conceptos adicionales dinámicos
        let conceptosAdicionalesTotales = 0;
        document.querySelectorAll('.concepto-adicional .concepto-valor').forEach(function(input) {
            conceptosAdicionalesTotales += parseFloat(input.value) || 0;
        });

        // Calcular el total
        const totalExtra = horasExtras + bonoAntiguedad + actividadesEspeciales + bonoPuesto + conceptosAdicionalesTotales;

        // Actualizar el campo total extra
        document.querySelector('#mod-total-extra').value = totalExtra.toFixed(2);

        // Actualizar en el JSON global también
        const clave = document.querySelector('#campo-clave').textContent.trim();
        if (clave && window.actualizarPropiedadEmpleadoEnJsonGlobal) {
            // Actualizar cada componente individual
            window.actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'sueldo_extra', horasExtras);
            window.actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'bono_antiguedad', bonoAntiguedad);
            window.actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'actividades_especiales', actividadesEspeciales);
            window.actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'bono_puesto', bonoPuesto);
            
            // Actualizar el total extra
            window.actualizarTotalExtraEnJsonGlobal(clave, totalExtra);
            
            // Actualizar sueldo a cobrar
            if (window.actualizarSueldoACobrarEnTiempoReal) {
                window.actualizarSueldoACobrarEnTiempoReal(clave);
            }
        }
    } else {
        // ===== LÓGICA PARA MODAL DE TICKET MANUAL =====
        const horasExtras = parseFloat((modal.querySelector('input[name="sueldo_extra"]') || {}).value || 0) || 0;
        const bonoAntiguedad = parseFloat((modal.querySelector('input[name="bono_antiguedad"]') || {}).value || 0) || 0;
        const actividadesEspeciales = parseFloat((modal.querySelector('input[name="actividades_especiales"]') || {}).value || 0) || 0;
        const bonoPuesto = parseFloat((modal.querySelector('input[name="bono_puesto"]') || {}).value || 0) || 0;
        
        // Sumar percepciones agregadas dinámicamente dentro del modal activo
        let percepcionesExtras = 0;
        modal.querySelectorAll('input[name="percepcion_valor[]"]').forEach(function(input) {
            percepcionesExtras += parseFloat(input.value) || 0;
        });
        const total = horasExtras + bonoAntiguedad + actividadesEspeciales + bonoPuesto + percepcionesExtras;
        const out = modal.querySelector('input[name="sueldo_extra_final"]');
        if (out) out.value = total.toFixed(2);
    }
}


// Funciones para agregar percepciones y deducciones dinámicamente
function agregarPercepcion() {
    const modal = document.querySelector('.modal.show') || document;
    const container = modal.querySelector('#percepciones-list') || document.getElementById('percepciones-list');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'row g-2 mb-2 percepcion-item';
    div.innerHTML = `
        <div class="col-8">
            <input type="text" class="form-control" name="percepcion_nombre[]" placeholder="Nombre del concepto">
        </div>
        <div class="col-3">
            <input type="number" step="0.01" class="form-control" name="percepcion_valor[]" placeholder="0.00" onchange="calcularTotalExtra()">
        </div>
        <div class="col-1">
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.parentElement.parentElement.remove(); calcularTotalExtra();">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
    container.appendChild(div);
}

function agregarDeduccion() {
    const modal = document.querySelector('.modal.show') || document;
    const container = modal.querySelector('#deducciones-list') || document.getElementById('deducciones-list');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'row g-2 mb-2 deduccion-item';
    div.innerHTML = `
        <div class="col-8">
            <input type="text" class="form-control" name="deduccion_nombre[]" placeholder="Nombre del concepto">
        </div>
        <div class="col-3">
            <input type="number" step="0.01" class="form-control" name="deduccion_valor[]" placeholder="0.00">
        </div>
        <div class="col-1">
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.parentElement.parentElement.remove()">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
    container.appendChild(div);
}

// Evento para abrir el modal
// NOTA: La inicialización del autocompletado se hace desde tickets_manuales.js
// cuando se abre el modal, no aquí en DOMContentLoaded
/*
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar autocompletado
    setupAutocompletadoClave();
    setupAutocompletadoNombre();
    
    // Manejar el envío del formulario
    const formTicketManual = document.getElementById('formTicketManual');
    if (formTicketManual) {
        formTicketManual.addEventListener('submit', function(e) {
            e.preventDefault();
            generarTicketManual(this);
        });
    }
});
*/

function generarTicketManual(form) {
    const formData = new FormData(form);
    const data = {};

    // Obtener todos los campos del formulario
    for (let [key, value] of formData.entries()) {
        if (!key.includes('[]')) {
            data[key] = value || '';
        }
    }

    // Asegurar que los campos numéricos tengan valor 0 si están vacíos
    const camposNumericos = [
        'vacaciones', 'sueldo_base', 'incentivo', 'sueldo_extra_final', 'sueldo_extra',
        'bono_antiguedad', 'aplicar_bono', 'actividades_especiales', 'bono_puesto',
        'neto_pagar', 'prestamo', 'uniformes', 'checador', 'fa_gafet_cofia',
        'inasistencias_minutos', 'inasistencias_descuento', 'salario_diario', 'salario_semanal'
    ];
    
    camposNumericos.forEach(campo => {
        if (!data[campo] || data[campo] === '') {
            data[campo] = 0;
        }
    });

    // Procesar percepciones adicionales
    data.conceptos_adicionales = [];
    const nombresPercepcion = formData.getAll('percepcion_nombre[]');
    const valoresPercepcion = formData.getAll('percepcion_valor[]');
    
    for (let i = 0; i < nombresPercepcion.length; i++) {
        if (nombresPercepcion[i] && valoresPercepcion[i]) {
            data.conceptos_adicionales.push({
                nombre: nombresPercepcion[i],
                valor: parseFloat(valoresPercepcion[i]) || 0
            });
        }
    }

    // Procesar deducciones
    data.conceptos = [];
    const nombresDeduccion = formData.getAll('deduccion_nombre[]');
    const valoresDeduccion = formData.getAll('deduccion_valor[]');
    
    for (let i = 0; i < nombresDeduccion.length; i++) {
        if (nombresDeduccion[i] && valoresDeduccion[i]) {
            data.conceptos.push({
                nombre: nombresDeduccion[i],
                resultado: parseFloat(valoresDeduccion[i]) || 0
            });
        }
    }

    // Enviar petición al servidor
    fetch('../php/generar_ticket_manual.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al generar el ticket');
        }
        return response.blob();
    })
    .then(blob => {
        // Descargar el PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ticket_manual_' + new Date().getTime() + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // No cerrar el modal ni limpiar el formulario

        Swal.fire({
            icon: 'success',
            title: 'Ticket generado',
            text: 'El ticket se ha generado correctamente',
            timer: 2000,
            showConfirmButton: false
        });
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo generar el ticket: ' + error.message
        });
    });
}
