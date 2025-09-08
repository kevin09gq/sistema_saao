// Archivo: actualizarLogos.js
// Manejo de la funcionalidad de actualización de logos para empresas y áreas

class ActualizadorLogos {
    constructor() {
        this.empresas = [];
        this.areas = [];
        this.logosToUpdate = new Map(); // Para almacenar los logos a actualizar
        this.initEventListeners();
        
        // Cargar datos de logos inmediatamente para tenerlos disponibles
        this.cargarDatosIniciales();
    }

    initEventListeners() {
        // Event listener para cuando se abre el modal
        $('#modalActualizarLogos').on('shown.bs.modal', () => {
            this.cargarDatos();
        });

        // Event listener para el botón de actualizar
        $('#btnActualizarLogos').on('click', () => {
            this.actualizarLogos();
        });

        // Reset del modal al cerrar
        $('#modalActualizarLogos').on('hidden.bs.modal', () => {
            this.resetModal();
        });

        // Event listener para limpiar logos huérfanos
        $(document).on('click', '#limpiarLogos', () => {
            this.mostrarConfirmacionLimpiarLogos();
        });
        
        // Event listeners para las pestañas
        $('#logosTabs .nav-link').on('click', (e) => {
            e.preventDefault();
            $(e.target).tab('show');
        });
    }

    async cargarDatosIniciales() {
        try {
            // Cargar solo los datos sin renderizar en el modal
            const [empresasData, areasData] = await Promise.all([
                this.obtenerEmpresas(),
                this.obtenerAreas()
            ]);

            this.empresas = empresasData;
            this.areas = areasData;
        } catch (error) {
           
            // No mostrar error al usuario ya que es carga en background
        }
    }

    async cargarDatos() {
        try {
            // Cargar empresas y áreas en paralelo
            const [empresasData, areasData] = await Promise.all([
                this.obtenerEmpresas(),
                this.obtenerAreas()
            ]);

            this.empresas = empresasData;
            this.areas = areasData;

            this.renderizarEmpresas();
            this.renderizarAreas();
        } catch (error) {
          
            this.mostrarError('Error al cargar los datos de empresas y áreas');
        }
    }

    async obtenerEmpresas() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'php/obtenerEmpresa.php',
                type: 'GET',
                dataType: 'json',
                success: (response) => {
                    if (response.success) {
                        resolve(response.data);
                    } else {
                        reject(new Error(response.message || 'Error al obtener empresas'));
                    }
                },
                error: (xhr, status, error) => {
                    reject(new Error(`Error AJAX: ${error}`));
                }
            });
        });
    }

    async obtenerAreas() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'php/obtenerAreas.php',
                type: 'GET',
                dataType: 'json',
                success: (response) => {
                    if (response.success) {
                        resolve(response.data);
                    } else {
                        reject(new Error(response.message || 'Error al obtener áreas'));
                    }
                },
                error: (xhr, status, error) => {
                    reject(new Error(`Error AJAX: ${error}`));
                }
            });
        });
    }

    renderizarEmpresas() {
        const container = $('#listaEmpresas');
        container.empty();

        if (this.empresas.length === 0) {
            container.html(`
                <div class="text-center py-5">
                    <i class="bi bi-building text-muted fs-1"></i>
                    <p class="mt-3 text-muted">No se encontraron empresas registradas</p>
                </div>
            `);
            return;
        }

        this.empresas.forEach(empresa => {
            const logoUrl = empresa.logo_empresa ? 
                `logos_empresa/${empresa.logo_empresa}` : null;
            
            const empresaHtml = this.crearItemLogo(
                'empresa',
                empresa.id_empresa,
                empresa.nombre_empresa,
                logoUrl
            );
            
            container.append(empresaHtml);
        });

        this.bindFileInputEvents('empresa');
    }

    renderizarAreas() {
        const container = $('#listaAreas');
        container.empty();

        if (this.areas.length === 0) {
            container.html(`
                <div class="text-center py-5">
                    <i class="bi bi-geo-alt text-muted fs-1"></i>
                    <p class="mt-3 text-muted">No se encontraron áreas registradas</p>
                </div>
            `);
            return;
        }

        this.areas.forEach(area => {
            const logoUrl = area.logo_area ? 
                `logos_area/${area.logo_area}` : null;
            
            const areaHtml = this.crearItemLogo(
                'area',
                area.id_area,
                area.nombre_area,
                logoUrl
            );
            
            container.append(areaHtml);
        });

        this.bindFileInputEvents('area');
    }

    crearItemLogo(tipo, id, nombre, logoUrl) {
        const tipoSingular = tipo === 'empresa' ? 'empresa' : 'área';
        const iconClass = tipo === 'empresa' ? 'bi-building' : 'bi-geo-alt';
        const borderColor = tipo === 'empresa' ? 'border-primary' : 'border-success';
        
        return `
            <div class="logo-item ${borderColor}" data-tipo="${tipo}" data-id="${id}">
                <h6 class="d-flex align-items-center justify-content-center">
                    <i class="bi ${iconClass}"></i>
                    <span class="fw-bold ms-2">${nombre}</span>
                </h6>
                <div class="logo-preview-container">
                    ${logoUrl ? 
                        `<img src="${logoUrl}" class="logo-preview img-fluid" alt="Logo ${nombre}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                         <div class="no-logo" style="display: none;">
                            <i class="bi bi-image"></i>
                         </div>` :
                        `<div class="no-logo text-center">
                            <i class="bi bi-image"></i>
                         </div>`
                    }
                </div>
                <div class="button-container">
                    <input type="file" class="custom-file-input logo-file-input" 
                           id="logo_${tipo}_${id}" 
                           accept="image/*" 
                           data-tipo="${tipo}" 
                           data-id="${id}">
                    <label for="logo_${tipo}_${id}" class="custom-file-label">
                        <i class="bi bi-upload"></i> Subir
                    </label>
                    ${logoUrl ? `
                    <button type="button" class="btn btn-sm delete-logo-btn" 
                            data-tipo="${tipo}" data-id="${id}">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>` : ''}
                </div>
            </div>
        `;
    }

    bindFileInputEvents(tipo) {
        $(`.logo-file-input[data-tipo="${tipo}"]`).on('change', (e) => {
            this.handleFileSelection(e);
        });
        
        // Bind delete button events
        $(`.delete-logo-btn[data-tipo="${tipo}"]`).on('click', (e) => {
            this.handleDeleteLogo(e);
        });
    }

    handleFileSelection(e) {
        const input = e.target;
        const file = input.files[0];
        const tipo = input.dataset.tipo;
        const id = input.dataset.id;
        const logoItem = $(input).closest('.logo-item');

        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            this.mostrarError('Por favor seleccione un archivo de imagen válido');
            input.value = '';
            return;
        }

        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.mostrarError('El archivo es demasiado grande. Máximo 5MB permitido');
            input.value = '';
            return;
        }

        // Crear vista previa
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewContainer = logoItem.find('.logo-preview-container');
            previewContainer.html(`
                <img src="${e.target.result}" class="logo-preview" alt="Vista previa">
            `);
            
            // Marcar como actualizado
            logoItem.addClass('logo-updated updating');
            setTimeout(() => logoItem.removeClass('updating'), 300);
            
            // Actualizar el texto del label
            const label = logoItem.find('.custom-file-label');
            label.html('<i class="bi bi-check-circle"></i> Logo seleccionado');
        };
        reader.readAsDataURL(file);

        // Almacenar el archivo para subir
        this.logosToUpdate.set(`${tipo}_${id}`, {
            file: file,
            tipo: tipo,
            id: id,
            nombre: logoItem.find('h6').text().replace(/^[\s\S]*?\s/, '') // Remover el ícono
        });
    }

    handleDeleteLogo(e) {
        const button = $(e.target).closest('.delete-logo-btn');
        const tipo = button.data('tipo');
        const id = button.data('id');
        const logoItem = button.closest('.logo-item');
        const nombre = logoItem.find('h6 .fw-bold').text();

        // Mostrar modal de confirmación personalizado
        this.mostrarConfirmacionEliminarLogo(tipo, id, nombre);
    }

    mostrarConfirmacionEliminarLogo(tipo, id, nombre) {
        // Crear el modal de confirmación
        const modalId = 'modalConfirmacionEliminarLogo';
        
        // Eliminar modal existente si lo hay
        const modalExistente = document.getElementById(modalId);
        if (modalExistente) {
            modalExistente.remove();
        }
        
        // Crear el nuevo modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.tabIndex = -1;
        modal.setAttribute('aria-labelledby', 'modalConfirmacionEliminarLogoLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content confirmacion-limpiar-logos">
                    <div class="modal-header">
                        <div class="confirmacion-icon">
                            <i class="bi bi-trash3"></i>
                        </div>
                        <h5 class="modal-title" id="modalConfirmacionEliminarLogoLabel">
                            Confirmar Eliminación de Logo
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="confirmacion-mensaje">
                            <p><strong>¿Está seguro de que desea eliminar el logo de ${nombre}?</strong></p>
                            <p class="text-muted">Esta acción eliminará permanentemente el logo y no se puede deshacer.</p>
                            <div class="alert alert-warning d-flex align-items-center mt-3">
                                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                <small>Esta acción no se puede deshacer</small>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-lg"></i> Cancelar
                        </button>
                        <button type="button" class="btn btn-danger" id="btnConfirmarEliminarLogo">
                            <i class="bi bi-trash3"></i> Sí, Eliminar Logo
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar el modal al DOM
        document.body.appendChild(modal);
        
        // Configurar eventos
        const btnConfirmar = modal.querySelector('#btnConfirmarEliminarLogo');
        btnConfirmar.addEventListener('click', () => {
            // Cerrar el modal
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            
            // Ejecutar la eliminación
            this.eliminarLogo(tipo, id)
                .then(response => {
                    if (response.success) {
                        this.mostrarExito(response.message);
                        // Recargar datos para reflejar los cambios
                        setTimeout(() => this.cargarDatos(), 1000);
                    } else {
                        this.mostrarError(response.message);
                    }
                })
                .catch(error => {
                 
                    this.mostrarError('Error al eliminar el logo');
                });
        });
        
        // Limpiar el modal del DOM cuando se cierre
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
        
        // Mostrar el modal
        const modalInstance = new bootstrap.Modal(modal, {
            backdrop: 'static',
            keyboard: false
        });
        modalInstance.show();
    }

    async eliminarLogo(tipo, id) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'php/eliminar_logo.php',
                type: 'POST',
                data: {
                    tipo: tipo,
                    id: id
                },
                dataType: 'json',
                success: (response) => {
                    resolve(response);
                },
                error: (xhr, status, error) => {
                    reject(new Error(`Error AJAX: ${error}`));
                }
            });
        });
    }

    async actualizarLogos() {
        if (this.logosToUpdate.size === 0) {
            this.mostrarError('No hay logos para actualizar');
            return;
        }

        const btnActualizar = $('#btnActualizarLogos');
        const spinner = $('#spinnerLogos');
        
        // Mostrar loading
        btnActualizar.prop('disabled', true);
        spinner.removeClass('d-none');

        try {
            const promises = [];
            
            for (const [key, logoData] of this.logosToUpdate) {
                promises.push(this.subirLogo(logoData));
            }

            const resultados = await Promise.all(promises);
            
            // Verificar si todos fueron exitosos
            const exitosos = resultados.filter(r => r.success).length;
            const fallidos = resultados.length - exitosos;

            if (fallidos === 0) {
                this.mostrarExito(`Se actualizaron correctamente ${exitosos} logo(s)`);
                // Limpiar los logos pendientes
                this.logosToUpdate.clear();
                // Recargar datos para mostrar los logos actualizados
                setTimeout(() => {
                    this.cargarDatos();
                    // También recargar datos iniciales para el sistema dinámico
                    this.cargarDatosIniciales();
                }, 1000);
            } else {
                this.mostrarAdvertencia(`Se actualizaron ${exitosos} logo(s). ${fallidos} fallaron.`);
            }

        } catch (error) {
           
            this.mostrarError('Error al actualizar los logos');
        } finally {
            // Ocultar loading
            btnActualizar.prop('disabled', false);
            spinner.addClass('d-none');
        }
    }

    async subirLogo(logoData) {
        const formData = new FormData();
        formData.append('logo', logoData.file);
        formData.append('tipo', logoData.tipo);
        formData.append('id', logoData.id);

        return new Promise((resolve) => {
            $.ajax({
                url: 'php/actualizar_logo.php',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: (response) => {
                    resolve(response);
                },
                error: (xhr, status, error) => {
                    resolve({
                        success: false,
                        message: `Error al subir logo de ${logoData.nombre}: ${error}`
                    });
                }
            });
        });
    }

    resetModal() {
        // Limpiar los datos
        this.logosToUpdate.clear();
        
        // Limpiar las listas
        $('#listaEmpresas').empty();
        $('#listaAreas').empty();
        
        // Resetear botón
        const btnActualizar = $('#btnActualizarLogos');
        const spinner = $('#spinnerLogos');
        
        btnActualizar.prop('disabled', false);
        spinner.addClass('d-none');
    }

    mostrarExito(mensaje) {
        this.mostrarAlertaLogos(mensaje, 'success');
    }

    mostrarError(mensaje) {
        this.mostrarAlertaLogos(mensaje, 'danger');
    }

    mostrarAdvertencia(mensaje) {
        this.mostrarAlertaLogos(mensaje, 'warning');
    }
    
    // Función para mostrar alertas específicas de logos (mismo estilo que gafetes/fotos)
    mostrarAlertaLogos(mensaje, tipo = 'info') {
        const alerta = document.createElement('div');
        alerta.className = `alerta-gafete alerta-${tipo}`;
        alerta.innerHTML = `
            <div class="alerta-content">
                <i class="bi bi-${tipo === 'warning' ? 'exclamation-triangle-fill' : tipo === 'danger' ? 'x-circle-fill' : tipo === 'success' ? 'check-circle-fill' : 'info-circle-fill'}"></i>
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

    // Función para mostrar modal de confirmación para limpiar logos
    mostrarConfirmacionLimpiarLogos() {
        // Crear el modal de confirmación
        const modalId = 'modalConfirmacionLimpiarLogos';
        
        // Eliminar modal existente si lo hay
        const modalExistente = document.getElementById(modalId);
        if (modalExistente) {
            modalExistente.remove();
        }
        
        // Crear el nuevo modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.tabIndex = -1;
        modal.setAttribute('aria-labelledby', 'modalConfirmacionLimpiarLogosLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content confirmacion-limpiar-logos">
                    <div class="modal-header">
                        <div class="confirmacion-icon">
                            <i class="bi bi-images"></i>
                        </div>
                        <h5 class="modal-title" id="modalConfirmacionLimpiarLogosLabel">
                            Confirmar Limpieza de Logos
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="confirmacion-mensaje">
                            <p><strong>¿Está seguro de que desea eliminar los logos que no están asociados a ninguna empresa o área?</strong></p>
                            <p class="text-muted">Esta acción eliminará permanentemente todos los archivos de logo que no estén vinculados a empresas o áreas activas en el sistema.</p>
                            <div class="alert alert-warning d-flex align-items-center mt-3">
                                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                <small>Esta acción no se puede deshacer</small>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-lg"></i> Cancelar
                        </button>
                        <button type="button" class="btn btn-danger" id="btnConfirmarLimpiarLogos">
                            <i class="bi bi-images"></i> Sí, Eliminar Logos
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar el modal al DOM
        document.body.appendChild(modal);
        
        // Configurar eventos
        const btnConfirmar = modal.querySelector('#btnConfirmarLimpiarLogos');
        btnConfirmar.addEventListener('click', () => {
            // Cerrar el modal
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            
            // Ejecutar la limpieza
            this.limpiarLogosHuerfanos();
        });
        
        // Limpiar el modal del DOM cuando se cierre
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
        
        // Mostrar el modal
        const modalInstance = new bootstrap.Modal(modal, {
            backdrop: 'static',
            keyboard: false
        });
        modalInstance.show();
    }

    async limpiarLogosHuerfanos() {
        try {
            const response = await new Promise((resolve, reject) => {
                $.ajax({
                    url: 'php/limpiar_logos_huerfanos.php',
                    type: 'POST',
                    dataType: 'json',
                    success: (response) => {
                        resolve(response);
                    },
                    error: (xhr, status, error) => {
                        reject(new Error(`Error AJAX: ${error}`));
                    }
                });
            });

            if (response.success) {
                this.mostrarExito(response.message);
                // Recargar datos para reflejar los cambios
                if (this.logosToUpdate.size > 0) {
                    setTimeout(() => this.cargarDatos(), 1000);
                }
            } else {
                this.mostrarError(response.message);
            }

        } catch (error) {
           
            this.mostrarError('Error al limpiar los logos huérfanos');
        }
    }

    // Función para obtener logos dinámicos de un empleado
    static obtenerLogosDinamicos(empleado) {
        
        let logoAreaUrl = null; // Sin fallback por defecto
        let logoEmpresaUrl = null; // Sin fallback por defecto

        if (!window.actualizadorLogos) {
            return { logoAreaUrl, logoEmpresaUrl };
        }


        // Si el empleado tiene área, buscar su logo
        if (empleado.id_area) {
            const area = window.actualizadorLogos.areas.find(a => a.id_area == empleado.id_area);
            if (area && area.logo_area) {
                logoAreaUrl = `logos_area/${area.logo_area}`;
            }
        } else {
        }

        // Si el empleado tiene empresa, buscar su logo
        if (empleado.id_empresa) {
            const empresa = window.actualizadorLogos.empresas.find(e => e.id_empresa == empleado.id_empresa);
            if (empresa && empresa.logo_empresa) {
                logoEmpresaUrl = `logos_empresa/${empresa.logo_empresa}`;
            }
        } else {
        }

        return { logoAreaUrl, logoEmpresaUrl };
    }

    // Función para interceptar y reemplazar URLs de logos estáticos
    static reemplazarLogosEstaticos() {
        
        // NO interceptamos la función mostrarGafetes original
        // En su lugar, interceptamos cuando se actualiza el contenido del DOM
        ActualizadorLogos.interceptarActualizacionesDOM();
    }
    
    // Función para interceptar actualizaciones del DOM
    static interceptarActualizacionesDOM() {
        
        // Crear un MutationObserver para detectar cuando se agregan gafetes al DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Verificar si el nodo contiene gafetes
                            const gafetes = node.querySelectorAll ? node.querySelectorAll('.gafete') : [];
                            if (gafetes.length > 0 || (node.classList && node.classList.contains('gafete'))) {
                                setTimeout(() => {
                                    ActualizadorLogos.procesarLogosEnGafetes();
                                }, 100); // Pequeño delay para asegurar que el DOM esté completo
                            }
                        }
                    });
                }
            });
        });
        
        // Observar cambios en el contenedor de gafetes
        const contenedorGafetes = document.getElementById('contenidoGafetes');
        if (contenedorGafetes) {
            observer.observe(contenedorGafetes, {
                childList: true,
                subtree: true
            });
        }
        
        // También observar el modal de gafetes
        const modalGafetes = document.getElementById('modalGafetes');
        if (modalGafetes) {
            observer.observe(modalGafetes, {
                childList: true,
                subtree: true
            });
        }
        
        // Guardar referencia del observer
        window.logoObserver = observer;
    }
    
    // Función para interceptar append y modificar HTML antes del renderizado
    static interceptarAppendHTML() {
        
        // Guardar la función original de append
        if (!window.jQueryAppendOriginal) {
            window.jQueryAppendOriginal = $.fn.append;
            
            $.fn.append = function(content) {
                // Si el contenido contiene logos estáticos, reemplazarlos
                if (typeof content === 'string' && (content.includes('img/logo.jpg') || content.includes('img/logo2.png'))) {
                    content = ActualizadorLogos.reemplazarLogosEnHTML(content);
                }
                
                // Llamar a la función original
                return window.jQueryAppendOriginal.call(this, content);
            };
        }
    }
    
    // Función para reemplazar logos directamente en el HTML
    static reemplazarLogosEnHTML(html) {
        if (!window.actualizadorLogos || !window.todosLosEmpleados) {
            return html;
        }
        
        // Intentar encontrar información del empleado en el HTML
        let empleadoEncontrado = null;
        
        // Buscar por clave de empleado en el HTML
        for (const empleado of window.todosLosEmpleados) {
            if (empleado.clave_empleado && html.includes(empleado.clave_empleado.toString())) {
                empleadoEncontrado = empleado;
                break;
            }
        }
        
        // Buscar por nombre si no se encontró por clave
        if (!empleadoEncontrado) {
            for (const empleado of window.todosLosEmpleados) {
                if (empleado.nombre) {
                    const nombres = empleado.nombre.split(' ');
                    for (const nombre of nombres) {
                        if (nombre.length > 2 && html.includes(nombre)) {
                            empleadoEncontrado = empleado;
                            break;
                        }
                    }
                }
            }
        }
        
        if (empleadoEncontrado) {
            const { logoAreaUrl, logoEmpresaUrl } = ActualizadorLogos.obtenerLogosDinamicos(empleadoEncontrado);
            
            // Reemplazar las URLs en el HTML
            html = html.replace(/src="img\/logo\.jpg"/g, `src="${logoAreaUrl}"`);
            html = html.replace(/src="img\/logo2\.png"/g, `src="${logoEmpresaUrl}"`);
            
        } else {
        }
        
        return html;
    }

    // Función para procesar y reemplazar logos en los gafetes ya generados
    static procesarLogosEnGafetes() {
        
        if (!window.actualizadorLogos) {
            return;
        }
        
        if (window.actualizadorLogos.areas.length === 0 || window.actualizadorLogos.empresas.length === 0) {
            window.actualizadorLogos.cargarDatosIniciales().then(() => {
                ActualizadorLogos.procesarLogosEnGafetes();
            });
            return;
        }


        // Buscar todas las imágenes de logos en los gafetes
        const imagenes = document.querySelectorAll('#contenidoGafetes img, #modalGafetes img');
        
        let logosReemplazados = 0;
        
        imagenes.forEach((img, index) => {
            const src = img.getAttribute('src');
            
            // Solo procesar logos estáticos
            if (src === 'img/logo.jpg' || src === 'img/logo2.png') {
                
                // Encontrar el empleado correspondiente a este gafete
                const empleado = ActualizadorLogos.encontrarEmpleadoPorImagen(img);
                
                if (empleado) {
                    
                    const { logoAreaUrl, logoEmpresaUrl } = ActualizadorLogos.obtenerLogosDinamicos(empleado);
                    
                    let nuevoSrc = null;
                    
                    // Reemplazar según el tipo de logo
                    if (src === 'img/logo.jpg') {
                        nuevoSrc = logoAreaUrl;
                    } else if (src === 'img/logo2.png') {
                        nuevoSrc = logoEmpresaUrl;
                    }
                    
                    if (nuevoSrc && nuevoSrc !== src) {
                        // Cambiar el src de la imagen
                        img.setAttribute('src', nuevoSrc);
                        img.setAttribute('alt', src === 'img/logo.jpg' ? 'Logo Área' : 'Logo Empresa');
                        
                        // Añadir error handler para ocultar imagen si no carga
                        img.onerror = function() {
                            this.style.display = 'none';
                            this.onerror = null;
                        };
                        
                        logosReemplazados++;
                        
                        // Marcar como procesado para evitar reprocesar
                        img.setAttribute('data-logo-procesado', 'true');
                    }
                } else {
                }
            } else if (img.getAttribute('data-logo-procesado') !== 'true') {
            }
        });
        
        if (logosReemplazados > 0) {
            // Logos reemplazados exitosamente
        }
    }
    
    // Función para encontrar el empleado correspondiente a una imagen de logo
    static encontrarEmpleadoPorImagen(img) {
        // Buscar el contenedor de gafete más cercano
        const gafete = img.closest('.gafete');
        if (!gafete) {
            return null;
        }

        // Obtener todo el texto del gafete
        const textoGafete = gafete.textContent || gafete.innerText || '';
        
        // Buscar empleados usando datos globales
        const empleados = window.todosLosEmpleados || [];
        
        if (empleados.length === 0) {
            // Intentar obtener del set de empleados seleccionados
            if (window.empleadosSeleccionados && window.empleadosSeleccionados.size > 0) {
                const empleadosSeleccionadosArray = Array.from(window.empleadosSeleccionados);
                // Para este caso, retornar el primer empleado como aproximación
                // En una implementación real, necesitaríamos obtener los datos completos
                return { id_empleado: empleadosSeleccionadosArray[0] };
            }
            return null;
        }
        
        // Método 1: Buscar por clave de empleado (más confiable)
        for (const empleado of empleados) {
            if (empleado.clave_empleado && textoGafete.includes(empleado.clave_empleado.toString())) {
                return empleado;
            }
        }
        
        // Método 2: Buscar por nombre
        for (const empleado of empleados) {
            if (empleado.nombre) {
                const nombres = empleado.nombre.split(' ');
                for (const nombre of nombres) {
                    if (nombre.length > 2 && textoGafete.includes(nombre)) {
                        return empleado;
                    }
                }
            }
        }
        
        // Método 3: Buscar por apellidos
        for (const empleado of empleados) {
            if (empleado.ap_paterno && empleado.ap_paterno.length > 3 && textoGafete.includes(empleado.ap_paterno)) {
                return empleado;
            }
        }
        
        return null;
    }

    // Función de debug para verificar el estado del sistema
    static debugLogos() {
        // Función de depuración sin logs de consola
    }
}

// Inicializar cuando el documento esté listo
$(document).ready(() => {
    window.actualizadorLogos = new ActualizadorLogos();
    
    // Interceptar la generación de gafetes para usar logos dinámicos
    ActualizadorLogos.reemplazarLogosEstaticos();
    
    // Exponer función de debug globalmente
    window.debugLogos = ActualizadorLogos.debugLogos;
    
    // Exponer función para procesar logos manualmente
    window.procesarLogos = () => {
        ActualizadorLogos.procesarLogosEnGafetes();
    };
    
    // Procesar logos automáticamente cuando se muestre el modal de gafetes
    $('#modalGafetes').on('shown.bs.modal', () => {
        setTimeout(() => {
            ActualizadorLogos.procesarLogosEnGafetes();
        }, 500); // Delay para asegurar que el contenido esté renderizado
    });
});