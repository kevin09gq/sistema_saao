// Archivo: actualizarLogos.js
// Manejo de la funcionalidad de actualización de logos para empresas y áreas en contratos

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
            console.error('Error al cargar datos iniciales:', error);
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
            console.error('Error al cargar datos:', error);
            this.mostrarError('Error al cargar los datos de empresas y áreas');
        }
    }

    async obtenerEmpresas() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/sistema_saao/contratos/php/obtener_empresas.php',
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
                url: '/sistema_saao/gafetes/php/obtenerAreas.php',
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
            // Usar URL pública proporcionada por el backend si existe
            // Fallback a construirla con marca_empresa
            const logoUrl = empresa.logo_url
                ? empresa.logo_url
                : (empresa.marca_empresa ? `/sistema_saao/contratos/logos_empresa/${empresa.marca_empresa}` : null);
            
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
                `/sistema_saao/gafetes/logos_area/${area.logo_area}` : null;
            
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
                <div class="logo-actions">
                    <label class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-upload"></i> Subir Logo
                        <input type="file" class="d-none logo-input" accept="image/*" data-tipo="${tipo}" data-id="${id}">
                    </label>
                    ${logoUrl ?
                        `<button class="btn btn-outline-danger btn-sm eliminar-logo" data-tipo="${tipo}" data-id="${id}">
                            <i class="bi bi-trash"></i> Eliminar
                         </button>` : ''
                    }
                </div>
            </div>
        `;
    }

    bindFileInputEvents(tipo) {
        // Event listener para inputs de archivo
        $(`#lista${tipo === 'empresa' ? 'Empresas' : 'Areas'} .logo-input`).on('change', (e) => {
            const file = e.target.files[0];
            const tipo = $(e.target).data('tipo');
            const id = $(e.target).data('id');

            if (file) {
                this.handleFileSelection(file, tipo, id);
            }
        });

        // Event listener para botones de eliminar
        $(`#lista${tipo === 'empresa' ? 'Empresas' : 'Areas'} .eliminar-logo`).on('click', (e) => {
            const tipo = $(e.target).closest('.eliminar-logo').data('tipo');
            const id = $(e.target).closest('.eliminar-logo').data('id');
            this.eliminarLogo(tipo, id);
        });
    }

    async handleFileSelection(file, tipo, id) {
        if (!file.type.startsWith('image/')) {
            this.mostrarError('Por favor, seleccione un archivo de imagen válido');
            return;
        }

        // Preparar FormData y endpoint según el tipo
        const formData = new FormData();
        formData.append('logo', file);
        formData.append('id', id);

        const url = (tipo === 'empresa')
            ? '/sistema_saao/contratos/php/actualizar_logo_empresa.php'
            : '/sistema_saao/gafetes/php/actualizar_logo.php';

        // Para áreas, el endpoint de Gafetes requiere 'tipo' además de 'id'
        if (tipo !== 'empresa') {
            formData.append('tipo', tipo);
        }

        try {
            const response = await $.ajax({
                url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json'
            });

            if (response.success) {
                this.cargarDatos(); // Recargar datos después de actualizar
                this.mostrarExito('Logo actualizado correctamente');
            } else {
                throw new Error(response.message || 'Error al actualizar el logo');
            }
        } catch (error) {
            console.error('Error al actualizar logo:', error);
            this.mostrarError('Error al actualizar el logo');
        }
    }

    async eliminarLogo(tipo, id) {
        try {
            const url = (tipo === 'empresa')
                ? '/sistema_saao/contratos/php/eliminar_logo_empresa.php'
                : '/sistema_saao/gafetes/php/eliminar_logo.php';

            const data = (tipo === 'empresa') ? { id } : { tipo, id };

            const response = await $.ajax({
                url,
                type: 'POST',
                data,
                dataType: 'json'
            });

            if (response.success) {
                this.cargarDatos(); // Recargar datos después de eliminar
                this.mostrarExito('Logo eliminado correctamente');
            } else {
                throw new Error(response.message || 'Error al eliminar el logo');
            }
        } catch (error) {
            console.error('Error al eliminar logo:', error);
            this.mostrarError('Error al eliminar el logo');
        }
    }

    mostrarConfirmacionLimpiarLogos() {
        const modalHtml = `
            <div class="modal fade" id="modalConfirmacionLimpiarLogos" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content confirmacion-limpiar-logos">
                        <div class="modal-header">
                            <div class="confirmacion-icon">
                                <i class="bi bi-exclamation-triangle"></i>
                            </div>
                            <h5 class="modal-title" id="modalConfirmacionLimpiarLogosLabel">
                                Confirmar Limpieza de Logos
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body">
                            <div class="confirmacion-mensaje">
                                <p>¿Está seguro que desea limpiar los logos no utilizados?</p>
                                <p class="text-muted">Esta acción eliminará todos los logos que no estén asignados a ninguna empresa o área.</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="bi bi-x-circle"></i> Cancelar
                            </button>
                            <button type="button" class="btn btn-danger" id="btnConfirmarLimpiarLogos">
                                <i class="bi bi-trash"></i> Confirmar Limpieza
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Eliminar modal anterior si existe
        $('#modalConfirmacionLimpiarLogos').remove();

        // Agregar nuevo modal al DOM
        $('body').append(modalHtml);

        // Configurar evento para el botón de confirmar
        $('#btnConfirmarLimpiarLogos').on('click', () => {
            this.limpiarLogos();
        });

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalConfirmacionLimpiarLogos'));
        modal.show();
    }

    async limpiarLogos() {
        try {
            const response = await $.ajax({
                url: '/sistema_saao/gafetes/php/limpiar_logos_huerfanos.php',
                type: 'POST',
                dataType: 'json'
            });

            if (response.success) {
                // Cerrar modal de confirmación
                $('#modalConfirmacionLimpiarLogos').modal('hide');
                this.cargarDatos(); // Recargar datos después de limpiar
                this.mostrarExito('Logos no utilizados eliminados correctamente');
            } else {
                throw new Error(response.message || 'Error al limpiar logos');
            }
        } catch (error) {
            console.error('Error al limpiar logos:', error);
            this.mostrarError('Error al limpiar los logos no utilizados');
        }
    }

    resetModal() {
        this.logosToUpdate.clear();
        // Limpiar cualquier mensaje de error o éxito
        $('.alert').remove();
    }

    mostrarError(mensaje) {
        const alertHtml = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
            </div>
        `;
        this.mostrarAlerta(alertHtml);
    }

    mostrarExito(mensaje) {
        const alertHtml = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
            </div>
        `;
        this.mostrarAlerta(alertHtml);
    }

    mostrarAlerta(alertHtml) {
        // Eliminar alertas anteriores
        $('.alert').remove();
        // Agregar nueva alerta al principio del modal-body
        $('#modalActualizarLogos .modal-body').prepend(alertHtml);
    }
}

// Inicializar el actualizador de logos cuando el documento esté listo
$(document).ready(() => {
    window.actualizadorLogos = new ActualizadorLogos();
});