/**
 * Guardar Historial Biométrico
 * Este script maneja el guardado del JSON procesado en la base de datos
 * Autor: Brandon
 */

// Función para convertir fecha del formato "29/Nov/2025" a "2025-11-29"
function convertirFechaParaBD(fechaStr) {
    if (!fechaStr) return null;
    
    const meses = {
        'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Ago': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12'
    };
    
    // Formato esperado: "29/Nov/2025"
    const partes = fechaStr.split('/');
    if (partes.length !== 3) return null;
    
    const dia = partes[0].padStart(2, '0');
    const mes = meses[partes[1]] || '01';
    const anio = partes[2];
    
    return `${anio}-${mes}-${dia}`;
}

// Función para obtener el JSON actualizado del sessionStorage
function obtenerJSONActualizado() {
    const jsonStr = sessionStorage.getItem('reloj-ocho');
    if (!jsonStr) {
        return null;
    }
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('Error al parsear JSON del sessionStorage:', e);
        return null;
    }
}

// Función para contar total de empleados
function contarTotalEmpleados(json) {
    if (!json || !json.departamentos) return 0;
    
    return json.departamentos.reduce((total, depto) => {
        return total + (depto.empleados ? depto.empleados.length : 0);
    }, 0);
}

// Variable para almacenar si existe registro previo
let registroExistente = null;

// Función para verificar si ya existe un registro en la BD
async function verificarExistenciaHistorial(numSem, fechaInicio, fechaFin, idEmpresa) {
    try {
        const response = await fetch('../php/verificar_historial.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                num_sem: numSem,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                id_empresa: idEmpresa || 1
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error al verificar existencia:', error);
        return { success: false, existe: false };
    }
}

// Función para mostrar el estado de existencia en el modal
function mostrarEstadoExistencia(resultado) {
    const alertaContainer = document.getElementById('alerta-existencia');
    const btnGuardar = document.getElementById('btn-confirmar-guardar-historial');
    
    if (!alertaContainer) return;
    
    if (resultado.existe) {
        registroExistente = resultado;
        const fechaRegistro = new Date(resultado.fecha_registro).toLocaleString('es-MX');
        
        alertaContainer.innerHTML = `
            <div class="alert alert-warning mb-0" role="alert">
                <i class="bi bi-exclamation-triangle me-1"></i>
                <strong>Registro existente encontrado</strong>
                <hr class="my-2">
                <small>
                    <strong>Guardado el:</strong> ${fechaRegistro}<br>
                    ${resultado.observacion_anterior ? `<strong>Observación anterior:</strong> ${resultado.observacion_anterior}` : '<em>Sin observación anterior</em>'}
                </small>
            </div>
        `;
        
        // Cambiar texto del botón
        btnGuardar.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i>Actualizar Historial';
        btnGuardar.classList.remove('btn-primary');
        btnGuardar.classList.add('btn-warning');
    } else {
        registroExistente = null;
        alertaContainer.innerHTML = `
            <div class="alert alert-success mb-0" role="alert">
                <i class="bi bi-check-circle me-1"></i>
                <strong>Nuevo registro</strong> - No existe historial previo para esta semana.
            </div>
        `;
        
        // Botón normal para guardar nuevo
        btnGuardar.innerHTML = '<i class="bi bi-save me-1"></i>Guardar Historial';
        btnGuardar.classList.remove('btn-warning');
        btnGuardar.classList.add('btn-primary');
    }
}

// Función para llenar el modal con la información del JSON
async function llenarModalHistorial() {
    const json = obtenerJSONActualizado();
    
    if (!json) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin datos',
            text: 'No hay datos procesados para guardar. Primero procesa un archivo de biométricos.',
            confirmButtonColor: '#3085d6'
        });
        return false;
    }
    
    // Llenar información del período
    document.getElementById('historial-num-semana').textContent = json.numero_semana || '-';
    document.getElementById('historial-fecha-inicio').textContent = json.fecha_inicio || '-';
    document.getElementById('historial-fecha-fin').textContent = json.fecha_cierre || '-';
    
    // Mostrar empresa (1 = SAAO, 2 = SB)
    const idEmpresaModal = json.id_empresa || 1;
    const nombreEmpresa = idEmpresaModal === 2 ? 'SB' : 'SAAO';
    const spanEmpresa = document.getElementById('historial-empresa');
    if (spanEmpresa) {
        spanEmpresa.textContent = nombreEmpresa;
        spanEmpresa.className = idEmpresaModal === 2 ? 'badge bg-success fs-6' : 'badge bg-info fs-6';
    }
    
    // Llenar resumen de datos
    // const totalDeptos = json.departamentos ? json.departamentos.length : 0;
    // const totalEmpleados = contarTotalEmpleados(json);
    
    // document.getElementById('historial-total-deptos').textContent = totalDeptos;
    // document.getElementById('historial-total-empleados').textContent = totalEmpleados;
    
    // Limpiar observación
    document.getElementById('historial-observacion').value = '';
    document.getElementById('historial-observacion-count').textContent = '0';
    
    // Verificar si ya existe en la BD
    const fechaInicioBD = convertirFechaParaBD(json.fecha_inicio);
    const fechaFinBD = convertirFechaParaBD(json.fecha_cierre);
    const idEmpresa = json.id_empresa || 1;
    
    // Mostrar loading en el área de alerta
    const alertaContainer = document.getElementById('alerta-existencia');
    if (alertaContainer) {
        alertaContainer.innerHTML = `
            <div class="alert alert-light mb-0" role="alert">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Verificando si existe registro previo...
            </div>
        `;
    }
    
    const resultado = await verificarExistenciaHistorial(json.numero_semana, fechaInicioBD, fechaFinBD, idEmpresa);
    mostrarEstadoExistencia(resultado);
    
    return true;
}

// Función para guardar el historial en la base de datos
async function guardarHistorialEnBD() {
    const json = obtenerJSONActualizado();
    
    if (!json) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No hay datos para guardar',
            confirmButtonColor: '#d33'
        });
        return;
    }
    
    const observacion = document.getElementById('historial-observacion').value.trim();
    
    // Preparar datos para enviar
    const datosEnviar = {
        biometricos: json,
        num_sem: json.numero_semana,
        fecha_inicio: convertirFechaParaBD(json.fecha_inicio),
        fecha_fin: convertirFechaParaBD(json.fecha_cierre),
        observacion: observacion || null
    };
    
    // Validar fechas convertidas
    if (!datosEnviar.fecha_inicio || !datosEnviar.fecha_fin) {
        Swal.fire({
            icon: 'error',
            title: 'Error en fechas',
            text: 'No se pudieron convertir las fechas del período',
            confirmButtonColor: '#d33'
        });
        return;
    }
    
    // Mostrar loading
    Swal.fire({
        title: 'Guardando...',
        text: 'Por favor espera mientras se guarda el historial',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const response = await fetch('../php/guardar_historial.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosEnviar)
        });
        
        const resultado = await response.json();
        
        if (resultado.success) {
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalGuardarHistorial'));
            if (modal) modal.hide();
            
            // Mensaje diferente si actualizó o creó nuevo
            const titulo = resultado.actualizado ? '¡Actualizado!' : '¡Guardado!';
            const mensaje = resultado.actualizado 
                ? 'El historial se ha actualizado correctamente' 
                : 'El historial se ha guardado correctamente';
            
            Swal.fire({
                icon: 'success',
                title: titulo,
                text: mensaje,
                confirmButtonColor: '#28a745'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: resultado.message || 'Ocurrió un error al guardar el historial',
                confirmButtonColor: '#d33'
            });
        }
    } catch (error) {
        console.error('Error en la petición:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            confirmButtonColor: '#d33'
        });
    }
}

// Event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Contador de caracteres para observación
    const observacionInput = document.getElementById('historial-observacion');
    const observacionCount = document.getElementById('historial-observacion-count');
    
    if (observacionInput && observacionCount) {
        observacionInput.addEventListener('input', function() {
            observacionCount.textContent = this.value.length;
        });
    }
    
    // Evento al abrir el modal
    const modalGuardar = document.getElementById('modalGuardarHistorial');
    if (modalGuardar) {
        modalGuardar.addEventListener('show.bs.modal', async function(event) {
            const hayDatos = await llenarModalHistorial();
            if (!hayDatos) {
                // Prevenir que se abra el modal si no hay datos
                event.preventDefault();
            }
        });
    }
    
    // Botón confirmar guardar
    const btnGuardar = document.getElementById('btn-confirmar-guardar-historial');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarHistorialEnBD);
    }
});

console.log("guardar_historial.js cargado correctamente");
