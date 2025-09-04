document.addEventListener('DOMContentLoaded', function() {
    console.log('Script subirFotos.js cargado correctamente');
    const btnSubirFotos = document.getElementById('subirFotos');
    const inputFotos = document.getElementById('fotosEmpleados');
    const vistaPreviaFotos = document.getElementById('vistaPreviaFotos');
    const listaEmpleadosSeleccionados = document.getElementById('listaEmpleadosSeleccionados');
    const btnSubir = document.getElementById('btnSubirFotos');
    const spinnerSubir = document.getElementById('spinnerSubir');
    
    // Variable para almacenar los empleados seleccionados
    let empleadosSeleccionados = [];
    
    // Manejador para el botón de subir fotos
    btnSubirFotos.addEventListener('click', function() {
        // Resetear completamente el modal
        resetearModal();
        
        // Obtener empleados seleccionados desde la variable global del archivo funciones.js
        // Intentar acceder a la variable global empleadosSeleccionados del archivo funciones.js
        let empleadosSeleccionadosGlobal = window.empleadosSeleccionados || new Set();
        
        // Si no está disponible globalmente, obtener desde los checkboxes
        if (empleadosSeleccionadosGlobal.size === 0) {
            const checkboxes = document.querySelectorAll('#tablaEmpleados input[type="checkbox"]:checked');
            console.log('Empleados seleccionados desde checkboxes:', checkboxes.length);
            
            empleadosSeleccionados = Array.from(checkboxes).map(checkbox => {
                const fila = checkbox.closest('tr');
                const nombre = fila.querySelector('td:nth-child(2)')?.textContent.trim() || 'Sin nombre';
                const clave = fila.querySelector('td:first-child')?.textContent.trim() || 'Sin clave';
                
                console.log(`Empleado: ${nombre} (${clave})`);
                
                return {
                    id: checkbox.value,
                    nombre: nombre,
                    clave: clave
                };
            });
        } else {
            // Usar los empleados seleccionados globalmente
            console.log('Empleados seleccionados globalmente:', empleadosSeleccionadosGlobal.size);
            
            // Obtener los datos de los empleados desde todosLosEmpleados si está disponible
            const empleadosCompletos = [];
            empleadosSeleccionadosGlobal.forEach(id => {
                // Primero intentar obtener desde todosLosEmpleados (funciones.js)
                if (window.todosLosEmpleados && window.todosLosEmpleados.length > 0) {
                    const empleado = window.todosLosEmpleados.find(emp => emp.id_empleado == id);
                    if (empleado) {
                        empleadosCompletos.push({
                            id: empleado.id_empleado,
                            nombre: `${empleado.nombre} ${empleado.ap_paterno || ''} ${empleado.ap_materno || ''}`.trim(),
                            clave: empleado.clave_empleado
                        });
                    }
                } else {
                    // Fallback: buscar en la tabla DOM (solo empleados del departamento actual)
                    const checkbox = document.querySelector(`#tablaEmpleados input[type="checkbox"][value="${id}"]`);
                    if (checkbox) {
                        const fila = checkbox.closest('tr');
                        const nombre = fila.querySelector('td:nth-child(2)')?.textContent.trim() || 'Sin nombre';
                        const clave = fila.querySelector('td:first-child')?.textContent.trim() || 'Sin clave';
                        
                        empleadosCompletos.push({
                            id: id,
                            nombre: nombre,
                            clave: clave
                        });
                    }
                }
            });
            
            empleadosSeleccionados = empleadosCompletos;
        }
        
        if (empleadosSeleccionados.length === 0) {
            mostrarAlerta('Por favor, seleccione al menos un empleado', 'warning');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalSubirFotos'));
            modal.hide();
            return;
        }
        
        // Mostrar lista de empleados seleccionados
        const empleadosHTML = `
            <div class="alert alert-light">
                <h6 class="fw-bold mb-2">Empleados seleccionados (${empleadosSeleccionados.length}):</h6>
                <div class="d-flex flex-wrap gap-2">
                    ${empleadosSeleccionados.map(emp => 
                        `<span class="badge bg-primary">${emp.nombre} (${emp.clave})</span>`
                    ).join('')}
                </div>
            </div>
        `;
        listaEmpleadosSeleccionados.innerHTML = empleadosHTML;
    });
    
    // Obtener empleados seleccionados
    function obtenerEmpleadosSeleccionados() {
        return empleadosSeleccionados;
    }

    // Manejador para la selección de fotos
    inputFotos.addEventListener('change', function(e) {
        const archivos = Array.from(e.target.files);
        const empleados = obtenerEmpleadosSeleccionados();
        
        // Limpiar vista previa anterior
        vistaPreviaFotos.innerHTML = '';
        
        // Crear contenedor para las fotos
        const fotosContainer = document.createElement('div');
        fotosContainer.className = 'row g-3';
        vistaPreviaFotos.appendChild(fotosContainer);
        
        // Mostrar las fotos con selectores de empleado
        archivos.forEach((archivo, index) => {
            if (!archivo.type.startsWith('image/')) {
                mostrarAlerta(`El archivo "${archivo.name}" no es una imagen válida.`, 'danger');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const col = document.createElement('div');
                col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
                col.innerHTML = `
                    <div class="photo-card">
                        <div class="photo-card-header">
                            <span class="photo-number">Foto ${index + 1}</span>
                            <button type="button" class="btn-delete" data-file-index="${index}">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div class="photo-container">
                            <img src="${e.target.result}" alt="Vista previa" class="photo-image">
                        </div>
                        <div class="photo-card-body">
                            <div class="employee-selector">
                                <select class="form-select selector-empleado" data-file-index="${index}">
                                    <option value="" selected disabled>Seleccionar empleado</option>
                                    ${empleados.map(emp => 
                                        `<option value="${emp.id}">${emp.nombre} (${emp.clave})</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="file-info">
                                <div class="file-name" title="${archivo.name}">
                                    <i class="bi bi-image-fill"></i>
                                    <span>${archivo.name.length > 15 ? archivo.name.substring(0, 15) + '...' : archivo.name}</span>
                                </div>
                                <div class="file-size">${formatBytes(archivo.size)}</div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Configurar botón de eliminar
                col.querySelector('.btn-delete').addEventListener('click', function() {
                    col.remove();
                    actualizarContadoresFotos();
                });
                
                fotosContainer.appendChild(col);
            };
            
            reader.readAsDataURL(archivo);
        });
        
        // Agregar manejador de eventos para eliminar fotos
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete')) {
                const card = e.target.closest('.col-12');
                if (card) {
                    card.remove();
                    // Actualizar contadores si es necesario
                    actualizarContadoresFotos();
                }
            }
        });
    });
    
    // Función para actualizar los contadores de fotos
    function actualizarContadoresFotos() {
        const fotos = document.querySelectorAll('.photo-number');
        fotos.forEach((foto, index) => {
            foto.textContent = `Foto ${index + 1}`;
        });
    }
    
    // Manejador para el botón de subir
    btnSubir.addEventListener('click', async function() {
        const formData = new FormData();
        let hasValidFiles = false;
        
        // Obtener los archivos del input principal
        const archivos = Array.from(inputFotos.files);
        
        // Recolectar todas las fotos con sus respectivos empleados
        archivos.forEach((archivo, index) => {
            const selector = document.querySelector(`.selector-empleado[data-file-index="${index}"]`);
            
            if (selector && selector.value && archivo) {
                formData.append(`fotos[]`, archivo);
                formData.append(`empleado_id[]`, selector.value);
                hasValidFiles = true;
            }
        });
        
        if (!hasValidFiles) {
            mostrarAlerta('Por favor, asigna al menos una foto a un empleado.', 'warning');
            return;
        }
        
        // Agregar clase de carga a todas las tarjetas
        const tarjetas = document.querySelectorAll('.photo-card');
        tarjetas.forEach(tarjeta => {
            tarjeta.classList.add('uploading');
        });
        
        // Deshabilitar botón de subir y mostrar estado de carga
        btnSubir.disabled = true;
        btnSubir.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Subiendo fotos...';
        
        try {
            const response = await fetch('php/subir_fotos.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Mostrar animación de éxito
                tarjetas.forEach(tarjeta => {
                    tarjeta.classList.remove('uploading');
                    tarjeta.classList.add('success');
                });
                
                // Mostrar mensaje de éxito discreto
                mostrarMensajeExito(data.message || 'Fotos subidas exitosamente');
                
                // Restaurar el botón inmediatamente
                btnSubir.disabled = false;
                btnSubir.innerHTML = '<i class="bi bi-upload"></i> Subir Fotos';
                
                // Cerrar el modal después de 1.5 segundos sin recargar
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalSubirFotos'));
                    modal.hide();
                    // Limpiar el contenido del modal para la próxima vez
                    vistaPreviaFotos.innerHTML = '';
                    inputFotos.value = '';
                    listaEmpleadosSeleccionados.innerHTML = '';
                    // Actualizar la tabla de empleados si existe la función
                    if (typeof cargarEmpleados === 'function') {
                        cargarEmpleados();
                    }
                }, 1500);
            } else {
                // Remover estado de carga si hay error
                tarjetas.forEach(tarjeta => {
                    tarjeta.classList.remove('uploading');
                });
                mostrarAlerta(data.message || 'Error al subir las fotos', 'danger');
            }
            
            // Mostrar errores si los hay (pero sin alertas molestas)
            if (data.errores && data.errores.length > 0) {
                console.log('Algunos archivos tuvieron errores:', data.errores);
            }
        } catch (error) {
            console.error('Error:', error);
            // Remover estado de carga si hay error
            tarjetas.forEach(tarjeta => {
                tarjeta.classList.remove('uploading');
            });
            mostrarAlerta('Error de conexión con el servidor', 'danger');
        } finally {
            // Asegurar que el botón siempre se restaure
            btnSubir.disabled = false;
            btnSubir.innerHTML = '<i class="bi bi-upload"></i> Subir Fotos';
        }
        
    });
    
    // Función para formatear el tamaño del archivo
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Función para mostrar alertas
    function mostrarAlerta(mensaje, tipo = 'info') {
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
        alerta.role = 'alert';
        alerta.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        `;
        
        // Insertar la alerta al principio del contenedor principal
        const contenedor = document.querySelector('.container');
        if (contenedor) {
            contenedor.insertBefore(alerta, contenedor.firstChild);
            
            // Eliminar la alerta después de 5 segundos
            setTimeout(() => {
                alerta.classList.remove('show');
                setTimeout(() => alerta.remove(), 150);
            }, 5000);
        }
    }
    
    // Función para mostrar mensaje de éxito discreto
    function mostrarMensajeExito(mensaje) {
        const mensajeExito = document.createElement('div');
        mensajeExito.className = 'mensaje-exito-discreto';
        mensajeExito.innerHTML = `
            <div class="mensaje-content">
                <i class="bi bi-check-circle-fill"></i>
                <span>${mensaje}</span>
            </div>
        `;
        
        document.body.appendChild(mensajeExito);
        
        // Mostrar con animación
        setTimeout(() => {
            mensajeExito.classList.add('show');
        }, 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            mensajeExito.classList.remove('show');
            setTimeout(() => {
                if (mensajeExito.parentNode) {
                    mensajeExito.parentNode.removeChild(mensajeExito);
                }
            }, 300);
        }, 3000);
    }
    
    // Función para resetear completamente el modal
    function resetearModal() {
        // Limpiar todas las vistas previas
        vistaPreviaFotos.innerHTML = '';
        listaEmpleadosSeleccionados.innerHTML = '';
        inputFotos.value = '';
        
        // Asegurar que el botón esté en estado normal
        btnSubir.disabled = false;
        btnSubir.innerHTML = '<i class="bi bi-upload"></i> Subir Fotos';
        
        // Remover cualquier clase de estado de éxito o carga que pueda quedar
        const tarjetasAnteriores = document.querySelectorAll('.photo-card');
        tarjetasAnteriores.forEach(tarjeta => {
            tarjeta.classList.remove('uploading', 'success');
        });
        
        // Remover cualquier mensaje de éxito que pueda estar visible
        const mensajesExito = document.querySelectorAll('.mensaje-exito-discreto');
        mensajesExito.forEach(mensaje => {
            if (mensaje.parentNode) {
                mensaje.parentNode.removeChild(mensaje);
            }
        });
    }
});
