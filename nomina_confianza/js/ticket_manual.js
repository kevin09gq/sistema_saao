// Función para calcular el total de sueldo extra (scoped al modal visible)
function calcularTotalExtra() {
    const modal = document.querySelector('.modal.show') || document;
    const vacacionesInput = modal.querySelector('input[name="vacaciones"]');
    const vacaciones = parseFloat(vacacionesInput ? vacacionesInput.value : 0) || 0;
    let totalExtras = vacaciones;
    // Sumar todos los conceptos extras de percepciones dentro del modal activo
    modal.querySelectorAll('input[name="percepcion_valor[]"]').forEach(function(input) {
        totalExtras += parseFloat(input.value) || 0;
    });
    const sueldoExtraFinal = modal.querySelector('input[name="sueldo_extra_final"]');
    if (sueldoExtraFinal) {
        sueldoExtraFinal.value = totalExtras.toFixed(2);
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
{
        if (!key.includes('[]')) {
            data[key] = value || '';
        }
    }

    // Asegurar que los campos numéricos tengan valor 0 si están vacíos
    const camposNumericos = [
        'vacaciones', 'sueldo_semanal', 'sueldo_extra_final',
        'ajustes_sub', 'retardos', 'permisos', 'inasistencias',
        'neto_pagar', 'prestamo', 'uniformes', 'checador',
        'isr', 'imss_descuento', 'infonavit', 'sueldo_diario'
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
