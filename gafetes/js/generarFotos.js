document.addEventListener('DOMContentLoaded', function() {
    
    // Función principal para generar fotos
    function generarFotosEmpleados() {
        // Obtener empleados seleccionados desde la variable global o desde checkboxes
        let empleadosSeleccionados = new Set();
        
        // Método 1: Intentar acceder a la variable global
        if (window.empleadosSeleccionados && window.empleadosSeleccionados.size > 0) {
            // La variable global puede contener strings o integers, normalizamos a integers
            window.empleadosSeleccionados.forEach(id => {
                const numericId = parseInt(id);
                if (!isNaN(numericId)) {
                    empleadosSeleccionados.add(numericId);
                }
            });
        } 
        
        // Método 2: Si no hay variable global o está vacía, obtener desde checkboxes directamente
        if (empleadosSeleccionados.size === 0) {
            const checkboxes = document.querySelectorAll('#tablaEmpleados input[type="checkbox"]:checked');
            checkboxes.forEach((checkbox, index) => {
                const value = parseInt(checkbox.value);
                if (!isNaN(value)) {
                    empleadosSeleccionados.add(value);
                }
            });
        }
        
        // Método 3: Último intento con jQuery si está disponible
        if (empleadosSeleccionados.size === 0 && typeof $ !== 'undefined') {
            const jqueryCheckboxes = $('#tablaEmpleados input[type="checkbox"]:checked');
            jqueryCheckboxes.each(function(index) {
                const value = parseInt($(this).val());
                if (!isNaN(value)) {
                    empleadosSeleccionados.add(value);
                }
            });
        }
        
        // Método 4: Alternativo usando clase específica
        if (empleadosSeleccionados.size === 0) {
            const empleadoCheckboxes = document.querySelectorAll('.empleado-checkbox:checked');
            empleadoCheckboxes.forEach((checkbox, index) => {
                const value = parseInt(checkbox.value);
                if (!isNaN(value)) {
                    empleadosSeleccionados.add(value);
                }
            });
        }
        
        // Método 5: Último recurso - buscar por data-id
        if (empleadosSeleccionados.size === 0) {
            const dataIdCheckboxes = document.querySelectorAll('input[data-id]:checked');
            dataIdCheckboxes.forEach((checkbox, index) => {
                const dataId = parseInt(checkbox.getAttribute('data-id'));
                if (!isNaN(dataId)) {
                    empleadosSeleccionados.add(dataId);
                }
            });
        }
        
        // Verificar si hay empleados seleccionados
        if (empleadosSeleccionados.size === 0) {
            mostrarAlertaFoto('Por favor, seleccione al menos un empleado para generar las fotos.', 'warning');
            return;
        }
        
        // Mostrar indicador de carga
        const btnGenerar = document.getElementById('generarFoto');
        const textoOriginal = btnGenerar.innerHTML;
        btnGenerar.disabled = true;
        btnGenerar.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando...';
        
        // Obtener datos de empleados seleccionados
        obtenerDatosEmpleados(Array.from(empleadosSeleccionados))
            .then(empleados => {
                if (empleados.length === 0) {
                    throw new Error('No se pudieron obtener los datos de los empleados seleccionados');
                }
                
                // Generar el contenido de fotos para impresión
                generarContenidoFotos(empleados);
            })
            .catch(error => {
              
                mostrarAlertaFoto('Error al generar las fotos: ' + error.message, 'danger');
            })
            .finally(() => {
                // Restaurar botón
                btnGenerar.disabled = false;
                btnGenerar.innerHTML = textoOriginal;
            });
    }
    
    // Función para obtener datos de empleados desde el servidor
    async function obtenerDatosEmpleados(idsEmpleados) {
        try {
            const response = await fetch('php/obtenerFotosEmpleados.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ empleados: idsEmpleados })
            });
            
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            
            const data = await response.json();
            
            if (data.success) {
                return data.empleados;
            } else {
                throw new Error(data.message || 'Error al obtener datos de empleados');
            }
        } catch (error) {
       
            throw error;
        }
    }
    
    // Función para generar el contenido HTML de las fotos
    function generarContenidoFotos(empleados) {
        // Filtrar solo empleados que tienen foto
        const empleadosConFoto = empleados.filter(emp => emp.ruta_foto && emp.ruta_foto.trim() !== '');
        
        if (empleadosConFoto.length === 0) {
            mostrarAlertaFoto('Ninguno de los empleados seleccionados tiene foto asignada.', 'warning');
            return;
        }
        
        // Mostrar el modal de previsualización
        mostrarModalPrevisualizar(empleadosConFoto);
    }
    
    // Función para mostrar el modal de previsualización
    function mostrarModalPrevisualizar(empleados) {
        const modal = new bootstrap.Modal(document.getElementById('modalFotos'));
        
        // Generar lista de empleados seleccionados
        const listaEmpleados = document.getElementById('listaEmpleadosFotos');
        const empleadosHTML = `
            <div class="alert alert-light border-start border-success border-4">
                <h6 class="fw-bold mb-2 text-success">\u2713 Empleados con fotos (${empleados.length}):</h6>
                <div class="d-flex flex-wrap gap-2">
                    ${empleados.map(emp => 
                        `<span class="badge bg-success">${emp.nombre} ${emp.ap_paterno || ''} ${emp.ap_materno || ''} - ${emp.clave_empleado}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        listaEmpleados.innerHTML = empleadosHTML;
        
        // Generar vista previa de fotos
        const contenidoFotos = document.getElementById('contenidoFotos');
        const timestamp = new Date().getTime();
        
        let fotosHTML = '<div class="row g-2">';
        empleados.forEach((empleado, index) => {
            fotosHTML += `
                <div class="col-6 col-sm-4 col-md-3 col-lg-2">
                    <div class="card h-100 shadow-sm">
                        <div class="card-header bg-success text-white p-1 text-center">
                            <small class="fw-bold" style="font-size: 0.7rem;">Foto ${index + 1}</small>
                        </div>
                        <div class="card-body p-1">
                            <img src="${empleado.ruta_foto}?t=${timestamp}" 
                                 class="img-fluid rounded" 
                                 style="width: 100%; height: 80px; object-fit: contain; background: #f8f9fa; border: 1px solid #ddd;"
                                 alt="Foto empleado">
                            <div class="mt-1">
                                <small class="text-muted d-block" style="font-size: 0.65rem;">Clave: ${empleado.clave_empleado}</small>
                                <small class="text-muted" style="font-size: 0.65rem; line-height: 1.2;">${empleado.nombre}</small>
                            </div>
                            <div class="input-group input-group-sm mt-1">
                                <span class="input-group-text">Copias</span>
                                <input type="number" class="form-control form-control-sm copias-input" data-id="${(typeof empleado.id !== 'undefined' ? empleado.id : (typeof empleado.id_empleado !== 'undefined' ? empleado.id_empleado : ''))}" value="1" min="1" max="50" />
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        fotosHTML += '</div>';
        
        contenidoFotos.innerHTML = fotosHTML;
        
        // Configurar el botón de imprimir
        const btnImprimir = document.getElementById('imprimirFotos');
        btnImprimir.onclick = function() {
            // Leer cantidades de copias indicadas
            const inputs = document.querySelectorAll('.copias-input');
            const copiasMap = {};
            inputs.forEach(inp => {
                const id = parseInt(inp.getAttribute('data-id'));
                let val = parseInt(inp.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 50) val = 50;
                if (!isNaN(id)) {
                    copiasMap[id] = val;
                }
            });

            // Expandir la lista de empleados según copias
            const empleadosExpandido = [];
            empleados.forEach(emp => {
                var rawKey = (typeof emp.id !== 'undefined') ? emp.id : ((typeof emp.id_empleado !== 'undefined') ? emp.id_empleado : null);
                var key = parseInt(rawKey);
                const n = (!isNaN(key) && copiasMap[key]) ? copiasMap[key] : 1;
                for (let i = 0; i < n; i++) {
                    empleadosExpandido.push(emp);
                }
            });

            modal.hide();
            // Esperar a que se cierre el modal antes de abrir la ventana de impresión
            setTimeout(() => {
                abrirVentanaImpresion(empleadosExpandido);
            }, 300);
        };
        
        // Mostrar el modal
        modal.show();
    }
    
    // Función para abrir la ventana de impresión
    function abrirVentanaImpresion(empleados) {
        // Crear ventana de impresión
        const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
        
        if (!ventanaImpresion) {
            mostrarAlertaFoto('No se pudo abrir la ventana de impresión. Verifique que no esté bloqueando ventanas emergentes.', 'danger');
            return;
        }
        
        // Generar HTML para impresión
        const htmlImpresion = generarHTMLFotos(empleados);
        
        // Escribir contenido en la nueva ventana
        ventanaImpresion.document.write(htmlImpresion);
        ventanaImpresion.document.close();
        
        // Configurar auto-cierre de la ventana
        configurarAutoCierre(ventanaImpresion);
        
        // Abrir diálogo de impresión automáticamente
        ventanaImpresion.onload = function() {
            setTimeout(() => {
                ventanaImpresion.print();
            }, 500);
        };
    }
    
    // Función para generar el HTML de las fotos
    function generarHTMLFotos(empleados) {
        const timestamp = new Date().getTime();
        
        let fotosHTML = '';
        empleados.forEach((empleado, index) => {
            fotosHTML += `
                <div class="foto-empleado" style="
                    width: 2.5cm !important;
                    height: 3.0cm !important;
                    margin: 0.2cm;
                    display: inline-block;
                    page-break-inside: avoid;
                    border: none;
                    padding: 0;
                    background: transparent;
                ">
                    <img src="${empleado.ruta_foto}?t=${timestamp}" style="
                        width: 2.5cm !important;
                        height: 3.0cm !important;
                        object-fit: cover !important;
                        border: 1px solid #ccc !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        display: block !important;
                        vertical-align: middle !important;
                    " alt="Foto empleado">
                </div>
            `;
        });
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Fotos de Empleados - ${timestamp}</title>
                <style>
                    /* Cache busting comment: ${timestamp} */
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: Arial, sans-serif;
                        background: white;
                        margin: 0;
                        padding: 1cm;
                    }
                    
                    .contenedor-fotos {
                        display: block;
                        text-align: left;
                        line-height: 0;
                    }
                    
                    .foto-empleado {
                        width: 2.5cm !important;
                        height: 3.0cm !important;
                        margin: 0.2cm !important;
                        display: inline-block !important;
                        page-break-inside: avoid !important;
                        border: none !important;
                        padding: 0 !important;
                        background: white !important;
                        vertical-align: top !important;
                        text-align: center !important;
                        line-height: 3.0cm !important;
                    }
                    
                    .foto-empleado img {
                        width: 2.5cm !important;
                        height: 3.0cm !important;
                        object-fit: cover !important;
                        border: 1px solid #ccc !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        display: block !important;
                    }
                    
                    @media print {
                        body {
                            margin: 0 !important;
                            padding: 0.5cm !important;
                            background: white !important;
                        }
                        
                        .foto-empleado {
                            width: 2.5cm !important;
                            height: 3.0cm !important;
                            margin: 0.1cm !important;
                            display: inline-block !important;
                            page-break-inside: avoid !important;
                            border: none !important;
                            padding: 0 !important;
                            background: white !important;
                            text-align: center !important;
                            line-height: 3.0cm !important;
                        }
                        
                        .foto-empleado img {
                            width: 2.5cm !important;
                            height: 3.0cm !important;
                            object-fit: cover !important;
                            border: 1px solid #ccc !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            background: white !important;
                            border-radius: 0 !important;
                            box-shadow: none !important;
                            display: block !important;
                            vertical-align: middle !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="contenedor-fotos">
                    ${fotosHTML}
                </div>
            </body>
            </html>
        `;
    }
    
    // Función para configurar auto-cierre de ventana
    function configurarAutoCierre(ventana) {
        let cerrada = false;
        
        const cerrarVentana = () => {
            if (!cerrada && ventana && !ventana.closed) {
                cerrada = true;
                try {
                    ventana.close();
                } catch (e) {
                }
            }
        };
        
        // Cerrar después de imprimir
        ventana.addEventListener('afterprint', () => {
            setTimeout(cerrarVentana, 1000);
        });
        
        // Cerrar con ESC
        ventana.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                setTimeout(cerrarVentana, 500);
            }
        });
        
        // Cerrar si la ventana principal se cierra
        window.addEventListener('beforeunload', cerrarVentana);
        
        // Auto-cerrar después de 10 segundos máximo
        setTimeout(cerrarVentana, 10000);
    }
    
    // Función para mostrar alertas específicas de fotos
    function mostrarAlertaFoto(mensaje, tipo = 'info') {
        const alerta = document.createElement('div');
        alerta.className = `alerta-foto alerta-${tipo}`;
        alerta.innerHTML = `
            <div class="alerta-content">
                <i class="bi bi-${tipo === 'warning' ? 'exclamation-triangle-fill' : tipo === 'danger' ? 'x-circle-fill' : 'info-circle-fill'}"></i>
                <span>${mensaje}</span>
                <button type="button" class="btn-close-alerta">×</button>
            </div>
        `;
        
        document.body.appendChild(alerta);
        
        // Mostrar con animación
        setTimeout(() => {
            alerta.classList.add('show');
        }, 100);
        
        // Configurar botón de cerrar
        alerta.querySelector('.btn-close-alerta').addEventListener('click', () => {
            alerta.classList.remove('show');
            setTimeout(() => {
                if (alerta.parentNode) {
                    alerta.parentNode.removeChild(alerta);
                }
            }, 300);
        });
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.classList.remove('show');
                setTimeout(() => {
                    if (alerta.parentNode) {
                        alerta.parentNode.removeChild(alerta);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Event listener para el botón
    document.getElementById('generarFoto').addEventListener('click', generarFotosEmpleados);
});