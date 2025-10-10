// Controlador para manejar la apertura del modal de casilleros desde el formulario de empleados
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales para paginación
    let paginaActual = 1;
    let filtroActual = 'todos';
    let busquedaActual = '';
    
    // Función para cargar y mostrar el modal de casilleros
    function mostrarModalCasillero() {
        // Verificar si el modal ya existe en el DOM
        const modalExistente = document.getElementById('modalCasillero');
        if (modalExistente) {
            // Si ya existe, simplemente mostrarlo
            const modal = new bootstrap.Modal(modalExistente);
            modal.show();
            
            // Si el modal ya estaba cargado, inicializar la carga de casilleros
            if (window.casilleroJsLoaded) {
                // Esperar un momento para que el modal se muestre completamente
                setTimeout(() => {
                    // Llamar directamente al endpoint PHP con la ruta correcta
                    cargarCasillerosDesdePHP();
                }, 300);
            }
            return;
        }
        
        // Si no existe, cargarlo desde el servidor
        fetch('../../gafetes/views/modal_casillero.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar el modal de casilleros');
                }
                return response.text();
            })
            .then(html => {
                // Agregar el modal al final del body
                document.body.insertAdjacentHTML('beforeend', html);
                
                // Inicializar el modal
                const modalElement = document.getElementById('modalCasillero');
                if (modalElement) {
                    // Cargar el CSS necesario para el modal si no está presente
                    if (!document.querySelector('#casilleroCss')) {
                        const link = document.createElement('link');
                        link.id = 'casilleroCss';
                        link.rel = 'stylesheet';
                        link.href = '../../gafetes/css/casillero.css';
                        document.head.appendChild(link);
                    }
                    
                    // Cargar el JavaScript necesario para el modal si no está presente
                    if (!window.casilleroJsLoaded) {
                        const script = document.createElement('script');
                        script.src = '../../gafetes/js/casillero.js';
                        script.onload = function() {
                            window.casilleroJsLoaded = true;
                            const modal = new bootstrap.Modal(modalElement);
                            modal.show();
                            
                            // Inicializar la carga de casilleros después de que el JS se haya cargado
                            setTimeout(() => {
                                // Llamar directamente al endpoint PHP con la ruta correcta
                                cargarCasillerosDesdePHP();
                            }, 300);
                        };
                        document.body.appendChild(script);
                    } else {
                        const modal = new bootstrap.Modal(modalElement);
                        modal.show();
                        
                        // Inicializar la carga de casilleros
                        setTimeout(() => {
                            // Llamar directamente al endpoint PHP con la ruta correcta
                            cargarCasillerosDesdePHP();
                        }, 300);
                    }
                    
                    // Agregar botón para agregar nuevo casillero
                    setTimeout(() => {
                        agregarBotonAgregarCasillero();
                    }, 500);
                }
            })
            .catch(error => {
                console.error('Error al cargar el modal de casilleros:', error);
                alert('Error al cargar el modal de casilleros. Por favor, inténtelo de nuevo.');
            });
    }
    
    // Función para agregar el botón de agregar casillero
    function agregarBotonAgregarCasillero() {
        const btnAgregarCasillero = document.getElementById('btnAgregarCasillero');
        if (btnAgregarCasillero) {
            btnAgregarCasillero.addEventListener('click', function() {
                mostrarModalAgregarCasillero();
            });
        }
    }
    
    // Función para mostrar el modal de agregar casillero
    function mostrarModalAgregarCasillero() {
        // Verificar si el modal ya existe en el DOM
        const modalExistente = document.getElementById('modalAgregarCasillero');
        if (modalExistente) {
            // Limpiar el formulario
            document.getElementById('numeroCasillero').value = '';
            
            // Mostrar el modal
            const modal = new bootstrap.Modal(modalExistente);
            modal.show();
            
            // Configurar eventos del modal
            configurarEventosModalAgregar();
            return;
        }
        
        // Si no existe, cargarlo desde el archivo PHP
        fetch('../views/modal_agregar_casillero.php')
            .then(response => response.text())
            .then(html => {
                // Agregar el modal al final del body
                document.body.insertAdjacentHTML('beforeend', html);
                
                // Mostrar el modal
                const modal = new bootstrap.Modal(document.getElementById('modalAgregarCasillero'));
                modal.show();
                
                // Configurar eventos del modal
                configurarEventosModalAgregar();
            })
            .catch(error => {
                console.error('Error al cargar el modal de agregar casillero:', error);
                alert('Error al cargar el modal de agregar casillero. Por favor, inténtelo de nuevo.');
            });
    }
    
    // Función para configurar los eventos del modal de agregar casillero
    function configurarEventosModalAgregar() {
        // Botón de confirmar agregar
        document.getElementById('btnConfirmarAgregar').onclick = function() {
            // Obtener el número del casillero
            const numeroCasillero = document.getElementById('numeroCasillero').value.trim();
            
            // Validar que el número no esté vacío
            if (!numeroCasillero) {
                VanillaToasts.create({
                    title: 'Campo requerido',
                    text: 'Por favor, ingrese un número de casillero válido',
                    type: 'warning',
                    timeout: 4000,
                    positionClass: 'topRight'
                });
                return;
            }
            
            // Mostrar indicador de carga en el botón
            const btnConfirmar = document.getElementById('btnConfirmarAgregar');
            const btnOriginalHTML = btnConfirmar.innerHTML;
            btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Agregando...';
            btnConfirmar.disabled = true;
            
            // Preparar los datos para enviar
            const formData = new FormData();
            formData.append('num_casillero', numeroCasillero);
            
            // Llamar al PHP de creación con la ruta correcta
            fetch('../../gafetes/php/crear_casillero.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Mostrar mensaje de éxito
                    VanillaToasts.create({
                        title: '¡Éxito!',
                        text: 'Casillero agregado correctamente',
                        type: 'success',
                        timeout: 4000,
                        positionClass: 'topRight'
                    });
                    
                    // Cerrar el modal
                    bootstrap.Modal.getInstance(document.getElementById('modalAgregarCasillero')).hide();
                    
                    // Recargar la lista de casilleros
                    setTimeout(() => {
                        cargarCasillerosDesdePHP();
                    }, 300);
                } else {
                    // Mostrar mensaje de error
                    VanillaToasts.create({
                        title: 'Error',
                        text: 'Error al agregar el casillero: ' + (data.error || 'Error desconocido'),
                        type: 'error',
                        timeout: 5000,
                        positionClass: 'topRight'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                VanillaToasts.create({
                    title: 'Error de conexión',
                    text: 'Error al agregar el casillero: ' + error.message,
                    type: 'error',
                    timeout: 5000,
                    positionClass: 'topRight'
                });
            })
            .finally(() => {
                // Restaurar el botón
                btnConfirmar.innerHTML = btnOriginalHTML;
                btnConfirmar.disabled = false;
            });
        };
    }
    
    // Función para cargar los casilleros directamente llamando al PHP con la ruta correcta
    window.cargarCasillerosDesdePHP = function(filtro = 'todos', pagina = 1, busqueda = '') {
        const contenedor = document.getElementById('contenedor-casilleros');
        if (!contenedor) return;
        
        // Actualizar variables globales
        paginaActual = pagina;
        filtroActual = filtro;
        busquedaActual = busqueda;
        
        // Mostrar indicador de carga
        contenedor.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando casilleros...</p>
            </div>`;
        
        // Llamar directamente al PHP con la ruta correcta
        // Construir URL con parámetros
        let url = `../../gafetes/php/obtener_casilleros.php?pagina=${pagina}&filtro=${filtro}`;
        if (busqueda.trim() !== '') {
            url += `&busqueda=${encodeURIComponent(busqueda)}`;
        }
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Mostrar los casilleros
                    mostrarCasillerosEnModal(data.data, filtro);
                    // Mostrar controles de paginación
                    mostrarControlesPaginacion(data);
                } else {
                    throw new Error(data.error || 'Error al cargar los casilleros');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                contenedor.innerHTML = `
                    <div class="col-12 text-center text-danger">
                        <i class="bi bi-exclamation-triangle-fill fs-1"></i>
                        <p class="mt-2">Error al cargar los casilleros: ${error.message}</p>
                        <button class="btn btn-sm btn-outline-primary" onclick="cargarCasillerosDesdePHP('${filtro}', ${pagina}, '${busqueda}')">
                            <i class="bi bi-arrow-clockwise"></i> Reintentar
                        </button>
                    </div>`;
            });
    };
    
    // Función para mostrar los casilleros en el modal
    function mostrarCasillerosEnModal(casilleros, filtro = 'todos') {
        const contenedor = document.getElementById('contenedor-casilleros');
        if (!contenedor) return;
        
        if (casilleros.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i> No hay casilleros registrados.
                    </div>
                </div>`;
            return;
        }
        
        // Crear la cuadrícula de casilleros
        let html = '';
        casilleros.forEach(casillero => {
            // Asegurarse de que los valores sean del tipo correcto
            const numCasillero = String(casillero.num_casillero || '');
            const totalEmpleados = parseInt(casillero.total_empleados) || 0;
            const estado = String(casillero.estado || 'Disponible');
            const empleadoNombre = String(casillero.empleado_nombre || '');
            
            // Determinar el color según el estado y número de empleados
            let claseEstado = 'bg-success'; // Disponible (0 empleados)
            if (totalEmpleados === 1) {
                claseEstado = 'bg-warning'; // Parcialmente ocupado (1 empleado)
            } else if (totalEmpleados >= 2) {
                claseEstado = 'bg-danger'; // Completamente ocupado (2 o más empleados)
            }
            
            // Mostrar solo los primeros nombres de empleados si están asignados
            let infoEmpleado = '';
            if (empleadoNombre && empleadoNombre.trim() !== '') {
                // Si hay múltiples empleados, mostrar solo los primeros nombres separados por coma
                if (totalEmpleados > 1) {
                    // Para múltiples empleados, mostrar solo los primeros nombres separados por coma
                    const nombres = empleadoNombre.split(', ').map(nombreCompleto => {
                        // Extraer solo el primer nombre de cada empleado
                        return nombreCompleto.split(' ')[0];
                    });
                    infoEmpleado = `<div class="casillero-empleado" title="${empleadoNombre}">${nombres.join(', ')}</div>`;
                } else {
                    // Para un solo empleado, mostrar solo el primer nombre
                    let nombreMostrar = empleadoNombre.split(' ')[0];
                    infoEmpleado = `<div class="casillero-empleado" title="${empleadoNombre}">${nombreMostrar}</div>`;
                }
            }
            
            const estaOcupado = totalEmpleados > 0;
            
            // Agregar un atributo data para identificar el casillero
            html += `
            <div class="col-auto p-1">
                <div class="casillero-item ${claseEstado}" 
                     data-numero="${numCasillero}"
                     data-ocupado="${estaOcupado}">
                    <div class="casillero-numero">${numCasillero}</div>
                    <div class="casillero-estado">${estado} (${totalEmpleados}/2)</div>
                    ${infoEmpleado}
                </div>
            </div>`;
        });
        
        contenedor.innerHTML = html;
        
        // Agregar botones de filtro
        configurarBotonesFiltro(filtro);
        
        // Agregar evento de clic a los casilleros
        document.querySelectorAll('.casillero-item').forEach(item => {
            item.addEventListener('click', function() {
                const numeroCasillero = this.getAttribute('data-numero');
                const estaOcupado = this.getAttribute('data-ocupado') === 'true';
                manejarClicCasillero(numeroCasillero, estaOcupado);
            });
        });
    }
    
    // Función para manejar el clic en un casillero
    function manejarClicCasillero(numeroCasillero, estaOcupado) {
        // Cargar y mostrar el modal de edición de casillero
        cargarYMostrarModalEdicion(numeroCasillero, estaOcupado);
    }
    
    // Función para cargar y mostrar el modal de edición
    function cargarYMostrarModalEdicion(numeroCasillero, estaOcupado) {
        // Verificar si el modal de edición ya existe
        const modalEdicionExistente = document.getElementById('modalEditarCasillero');
        if (modalEdicionExistente) {
            // Si ya existe, mostrarlo con los datos del casillero
            mostrarModalEdicion(numeroCasillero, estaOcupado);
            return;
        }
        
        // Si no existe, cargarlo desde el archivo PHP
        fetch('../views/modal_editar_casillero.php')
            .then(response => response.text())
            .then(html => {
                // Agregar el modal al final del body
                document.body.insertAdjacentHTML('beforeend', html);
                
                // Mostrar el modal con los datos del casillero
                mostrarModalEdicion(numeroCasillero, estaOcupado);
            })
            .catch(error => {
                console.error('Error al cargar el modal de edición de casilleros:', error);
                alert('Error al cargar el modal de edición de casilleros. Por favor, inténtelo de nuevo.');
            });
    }
    
    // Función para mostrar el modal de edición con los datos del casillero
    function mostrarModalEdicion(numeroCasillero, estaOcupado) {
        // Establecer los valores en el modal
        document.getElementById('casillero_id').value = numeroCasillero;
        document.getElementById('nuevo_numero').value = numeroCasillero;
        
        // Limpiar el campo de búsqueda de empleado y resultados
        const buscarEmpleadoInput = document.getElementById('buscarEmpleado');
        document.getElementById('resultadoBusqueda').innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-person-lines-fill fs-1"></i>
                <p class="mt-2">Busque un empleado para asignar al casillero</p>
            </div>`;
        
        // Mostrar el modal
        const modalEdicion = new bootstrap.Modal(document.getElementById('modalEditarCasillero'));
        modalEdicion.show();
        
        // Configurar eventos del modal
        configurarEventosModalEdicion(numeroCasillero, estaOcupado);
        
        // Si el casillero está ocupado, cargar la información del empleado
        if (estaOcupado) {
            cargarInfoEmpleadoAsignado(numeroCasillero);
        }
        
        // Detectar si estamos en el modal de editar empleado
        const modalEditarEmpleado = document.getElementById('modal_actualizar_empleado');
        if (modalEditarEmpleado && modalEditarEmpleado.classList.contains('show') && buscarEmpleadoInput) {
            // Estamos en el modal de editar empleado, obtener el nombre
            const nombreEmpleado = document.getElementById('modal_nombre_empleado')?.value || '';
            const apellidoPaterno = document.getElementById('modal_apellido_paterno')?.value || '';
            const apellidoMaterno = document.getElementById('modal_apellido_materno')?.value || '';
            
            if (nombreEmpleado || apellidoPaterno) {
                const nombreCompleto = `${nombreEmpleado} ${apellidoPaterno} ${apellidoMaterno}`.trim();
                buscarEmpleadoInput.value = nombreCompleto;
            } else {
                buscarEmpleadoInput.value = '';
            }
        }
        
        // Agregar evento para limpiar el campo de búsqueda cuando se cierre el modal
        const modalElement = document.getElementById('modalEditarCasillero');
        modalElement.addEventListener('hidden.bs.modal', function () {
            // Limpiar el campo de búsqueda de empleado y resultados
            if (buscarEmpleadoInput) {
                buscarEmpleadoInput.value = '';
            }
            document.getElementById('resultadoBusqueda').innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-person-lines-fill fs-1"></i>
                    <p class="mt-2">Busque un empleado para asignar al casillero</p>
                </div>`;
        });
    }
    
    // Función para cargar la información del empleado asignado a un casillero
    function cargarInfoEmpleadoAsignado(numeroCasillero) {
        // Mostrar indicador de carga
        const infoContainer = document.getElementById('infoEmpleadoAsignado');
        infoContainer.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando información del empleado...</p>
            </div>`;
        
        // Llamar al PHP para obtener la información del empleado
        fetch(`../../gafetes/php/obtener_empleado_casillero.php?casillero=${encodeURIComponent(numeroCasillero)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.empleados && data.empleados.length > 0) {
                    let empleadosHTML = '';
                    data.empleados.forEach(empleado => {
                        // Mostrar solo el primer nombre del empleado
                        const nombreMostrar = empleado.nombre.split(' ')[0];
                        const nombreCompleto = `${empleado.nombre} ${empleado.apellido_paterno} ${empleado.apellido_materno || ''}`.trim();
                        
                        empleadosHTML += `
                            <div class="alert alert-info">
                                <h6><i class="bi bi-person-badge"></i> Empleado Asignado:</h6>
                                <p class="mb-1"><strong>Nombre:</strong> ${nombreMostrar}</p>
                                <p class="mb-1"><strong>ID Empleado:</strong> ${empleado.id_empleado}</p>
                                ${empleado.departamento ? `<p class="mb-1"><strong>Departamento:</strong> ${empleado.departamento}</p>` : ''}
                                <p class="mb-0">
                                    <button class="btn btn-sm btn-danger" onclick="liberarCasillero('${numeroCasillero}', ${empleado.id_empleado})">
                                        <i class="bi bi-person-dash"></i> Liberar Casillero
                                    </button>
                                </p>
                            </div>`;
                    });
                    infoContainer.innerHTML = empleadosHTML;
                } else {
                    infoContainer.innerHTML = `
                        <div class="alert alert-warning">
                            <h6><i class="bi bi-info-circle"></i> Información</h6>
                            <p class="mb-0">Este casillero está marcado como ocupado pero no se encontró información del empleado asignado.</p>
                        </div>`;
                }
            })
            .catch(error => {
                console.error('Error al cargar información del empleado:', error);
                infoContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <h6><i class="bi bi-exclamation-triangle"></i> Error</h6>
                        <p class="mb-0">Ocurrió un error al cargar la información del empleado asignado.</p>
                    </div>`;
            });
    }
    
    // Función para configurar los eventos del modal de edición
    function configurarEventosModalEdicion(numeroCasillero, estaOcupado) {
        // Botón de guardar cambios
        document.getElementById('btnGuardarCambios').onclick = function() {
            // Obtener el nuevo número del casillero
            const nuevoNumero = document.getElementById('nuevo_numero').value;
            
            // Validar que el nuevo número no esté vacío
            if (!nuevoNumero || nuevoNumero.trim() === '') {
                VanillaToasts.create({
                    title: 'Campo requerido',
                    text: 'Por favor, ingrese un número de casillero válido',
                    type: 'warning',
                    timeout: 4000,
                    positionClass: 'topRight'
                });
                return;
            }
            
            // Si el número no cambia, solo cerrar el modal
            if (nuevoNumero === numeroCasillero) {
                // Actualizar el campo del formulario de empleados
                const numCasilleroField = document.getElementById('modal_num_casillero');
                if (numCasilleroField) {
                    numCasilleroField.value = nuevoNumero;
                }
                
                // Cerrar ambos modales
                bootstrap.Modal.getInstance(document.getElementById('modalEditarCasillero')).hide();
                bootstrap.Modal.getInstance(document.getElementById('modalCasillero')).hide();
                return;
            }
            
            // Mostrar indicador de carga en el botón
            const btnGuardar = document.getElementById('btnGuardarCambios');
            const btnOriginalHTML = btnGuardar.innerHTML;
            btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
            btnGuardar.disabled = true;
            
            // Preparar los datos para enviar
            const formData = new FormData();
            formData.append('numero_anterior', numeroCasillero);
            formData.append('nuevo_numero', nuevoNumero);
            
            // Llamar al PHP de actualización con la ruta correcta
            fetch('../../gafetes/php/actualizar_casillero.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Actualizar el campo del formulario de empleados
                    const numCasilleroField = document.getElementById('modal_num_casillero');
                    if (numCasilleroField) {
                        numCasilleroField.value = nuevoNumero;
                    }
                    
                    // Mostrar mensaje de éxito
                    VanillaToasts.create({
                        title: '¡Éxito!',
                        text: 'Casillero actualizado correctamente',
                        type: 'success',
                        timeout: 4000,
                        positionClass: 'topRight'
                    });
                    
                    // Cerrar ambos modales
                    bootstrap.Modal.getInstance(document.getElementById('modalEditarCasillero')).hide();
                    bootstrap.Modal.getInstance(document.getElementById('modalCasillero')).hide();
                    
                    // Recargar la lista de casilleros
                    setTimeout(() => {
                        cargarCasillerosDesdePHP();
                    }, 300);
                } else {
                    // Mostrar mensaje de error
                    VanillaToasts.create({
                        title: 'Error',
                        text: 'Error al actualizar el casillero: ' + (data.error || 'Error desconocido'),
                        type: 'error',
                        timeout: 5000,
                        positionClass: 'topRight'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                VanillaToasts.create({
                    title: 'Error de conexión',
                    text: 'Error al actualizar el casillero: ' + error.message,
                    type: 'error',
                    timeout: 5000,
                    positionClass: 'topRight'
                });
            })
            .finally(() => {
                // Restaurar el botón
                btnGuardar.innerHTML = btnOriginalHTML;
                btnGuardar.disabled = false;
            });
        };
        
        // Botón de eliminar
        document.getElementById('btnEliminarCasillero').onclick = function() {
            // Confirmar la eliminación
            if (!confirm(`¿Está seguro de eliminar el casillero ${numeroCasillero}?`)) {
                return;
            }
            
            // Verificar si el casillero está ocupado antes de eliminar
            // (esto se verifica también en el servidor, pero podemos hacer una verificación básica aquí)
            
            // Mostrar indicador de carga en el botón
            const btnEliminar = document.getElementById('btnEliminarCasillero');
            const btnOriginalHTML = btnEliminar.innerHTML;
            btnEliminar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Eliminando...';
            btnEliminar.disabled = true;
            
            // Preparar los datos para enviar
            const formData = new FormData();
            formData.append('num_casillero', numeroCasillero);
            
            // Llamar al PHP de eliminación con la ruta correcta
            fetch('../../gafetes/php/eliminar_casillero.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Mostrar mensaje de éxito
                    VanillaToasts.create({
                        title: '¡Éxito!',
                        text: 'Casillero eliminado correctamente',
                        type: 'success',
                        timeout: 4000,
                        positionClass: 'topRight'
                    });
                    
                    // Cerrar ambos modales
                    bootstrap.Modal.getInstance(document.getElementById('modalEditarCasillero')).hide();
                    bootstrap.Modal.getInstance(document.getElementById('modalCasillero')).hide();
                    
                    // Recargar la lista de casilleros
                    setTimeout(() => {
                        cargarCasillerosDesdePHP();
                    }, 300);
                } else {
                    // Mostrar mensaje de error
                    VanillaToasts.create({
                        title: 'Error',
                        text: 'Error al eliminar el casillero: ' + (data.error || 'Error desconocido'),
                        type: 'error',
                        timeout: 5000,
                        positionClass: 'topRight'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                VanillaToasts.create({
                    title: 'Error de conexión',
                    text: 'Error al eliminar el casillero: ' + error.message,
                    type: 'error',
                    timeout: 5000,
                    positionClass: 'topRight'
                });
            })
            .finally(() => {
                // Restaurar el botón
                btnEliminar.innerHTML = btnOriginalHTML;
                btnEliminar.disabled = false;
            });
        };
        
        // Configurar la funcionalidad de búsqueda de empleados en la pestaña de asignación
        const btnBuscarEmpleado = document.getElementById('btnBuscarEmpleado');
        if (btnBuscarEmpleado) {
            btnBuscarEmpleado.addEventListener('click', function() {
                buscarEmpleado();
            });
        }
        
        // Permitir búsqueda con Enter
        const inputBuscarEmpleado = document.getElementById('buscarEmpleado');
        if (inputBuscarEmpleado) {
            inputBuscarEmpleado.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    buscarEmpleado();
                }
            });
        }
        
        // Limpiar resultados cuando se cambia a la pestaña de asignar
        const tabAsignar = document.getElementById('asignar-tab');
        if (tabAsignar) {
            tabAsignar.addEventListener('shown.bs.tab', function() {
                // Limpiar el campo de búsqueda de empleado y resultados
                document.getElementById('buscarEmpleado').value = '';
                document.getElementById('resultadoBusqueda').innerHTML = `
                    <div class="text-center text-muted">
                        <i class="bi bi-person-lines-fill fs-1"></i>
                        <p class="mt-2">Busque un empleado para asignar al casillero</p>
                    </div>`;
                
                // Pre-llenar el campo de búsqueda si estamos en modal de editar empleado
                const modalEditarEmpleado = document.getElementById('modal_actualizar_empleado');
                const buscarEmpleadoInput = document.getElementById('buscarEmpleado');
                if (modalEditarEmpleado && modalEditarEmpleado.classList.contains('show') && buscarEmpleadoInput) {
                    const nombreEmpleado = document.getElementById('modal_nombre_empleado')?.value || '';
                    const apellidoPaterno = document.getElementById('modal_apellido_paterno')?.value || '';
                    const apellidoMaterno = document.getElementById('modal_apellido_materno')?.value || '';
                    
                    if (nombreEmpleado || apellidoPaterno) {
                        const nombreCompleto = `${nombreEmpleado} ${apellidoPaterno} ${apellidoMaterno}`.trim();
                        buscarEmpleadoInput.value = nombreCompleto;
                    }
                }
            });
        }
    }
    
    // Función para buscar empleados
    function buscarEmpleado() {
        const busqueda = document.getElementById('buscarEmpleado').value.trim();
        const resultadosDiv = document.getElementById('resultadoBusqueda');
        
        if (!busqueda) {
            resultadosDiv.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i> Por favor ingrese un nombre o ID de empleado
                </div>
            `;
            return;
        }
        
        // Mostrar indicador de carga
        resultadosDiv.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Buscando...</span>
                </div>
                <p class="mt-2">Buscando empleados...</p>
            </div>
        `;
        
        // Realizar la búsqueda
        fetch(`../../gafetes/php/buscar_empleados.php?q=${encodeURIComponent(busqueda)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.results && data.results.length > 0) {
                    // Mostrar resultados
                    let html = '<div class="list-group">';
                    data.results.forEach(empleado => {
                        const nombreCompleto = `${empleado.nombre} ${empleado.apellido_paterno} ${empleado.apellido_materno || ''}`.trim();
                        html += `
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-1">${nombreCompleto}</h6>
                                    <small class="text-muted">ID: ${empleado.id_empleado}</small>
                                </div>
                                <button class="btn btn-sm btn-primary" 
                                        onclick="asignarEmpleado('${document.getElementById('casillero_id').value}', ${empleado.id_empleado}, '${nombreCompleto.replace(/'/g, "\\'")}')">
                                    <i class="bi bi-check-lg"></i> Asignar
                                </button>
                            </div>
                        `;
                    });
                    html += '</div>';
                    resultadosDiv.innerHTML = html;
                } else {
                    // No se encontraron resultados
                    resultadosDiv.innerHTML = `
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i> No se encontraron empleados que coincidan con "${busqueda}"
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error en la búsqueda:', error);
                resultadosDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i> Ocurrió un error al buscar empleados
                    </div>
                `;
            });
    }
    
    // Función global para asignar un empleado a un casillero
    window.asignarEmpleado = function(numeroCasillero, idEmpleado, nombreEmpleado) {
        // Mostrar confirmación
        if (!confirm(`¿Desea asignar el casillero ${numeroCasillero} a ${nombreEmpleado}?`)) {
            return;
        }
        
        // Mostrar indicador de carga
        const btnAsignar = event.target;
        const btnOriginalHTML = btnAsignar.innerHTML;
        btnAsignar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        btnAsignar.disabled = true;
        
        // Preparar los datos para enviar
        const formData = new FormData();
        formData.append('num_casillero', numeroCasillero);
        formData.append('id_empleado', idEmpleado);
        
        // Llamar al PHP de asignación con la ruta correcta
        fetch('../../gafetes/php/asignar_casillero.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mostrar mensaje de éxito
                VanillaToasts.create({
                    title: '¡Éxito!',
                    text: 'Empleado asignado correctamente al casillero',
                    type: 'success',
                    timeout: 4000,
                    positionClass: 'topRight'
                });
                
                // Cerrar ambos modales
                bootstrap.Modal.getInstance(document.getElementById('modalEditarCasillero')).hide();
                bootstrap.Modal.getInstance(document.getElementById('modalCasillero')).hide();
                
                // Recargar la lista de casilleros
                setTimeout(() => {
                    cargarCasillerosDesdePHP();
                }, 300);
            } else {
                // Mostrar mensaje de error
                VanillaToasts.create({
                    title: 'Error',
                    text: 'Error al asignar el empleado: ' + (data.error || 'Error desconocido'),
                    type: 'error',
                    timeout: 5000,
                    positionClass: 'topRight'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            VanillaToasts.create({
                title: 'Error de conexión',
                text: 'Error al asignar el empleado: ' + error.message,
                type: 'error',
                timeout: 5000,
                positionClass: 'topRight'
            });
        })
        .finally(() => {
            // Restaurar el botón
            btnAsignar.innerHTML = btnOriginalHTML;
            btnAsignar.disabled = false;
        });
    };
    
    // Función global para liberar un casillero
    window.liberarCasillero = function(numeroCasillero, idEmpleado) {
        // Mostrar confirmación
        if (!confirm(`¿Está seguro de liberar el casillero ${numeroCasillero}?`)) {
            return;
        }
        
        // Mostrar indicador de carga
        const btnLiberar = event.target;
        const btnOriginalHTML = btnLiberar.innerHTML;
        btnLiberar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        btnLiberar.disabled = true;
        
        // Preparar los datos para enviar
        const formData = new FormData();
        formData.append('num_casillero', numeroCasillero);
        formData.append('id_empleado', idEmpleado);
        
        // Llamar al PHP de liberación con la ruta correcta
        fetch('../../gafetes/php/liberar_casillero.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mostrar mensaje de éxito
                VanillaToasts.create({
                    title: '¡Éxito!',
                    text: 'Casillero liberado correctamente',
                    type: 'success',
                    timeout: 4000,
                    positionClass: 'topRight'
                });
                
                // Recargar la lista de casilleros
                setTimeout(() => {
                    cargarCasillerosDesdePHP();
                    // Limpiar la información del empleado asignado
                    document.getElementById('infoEmpleadoAsignado').innerHTML = '';
                }, 300);
            } else {
                // Mostrar mensaje de error
                VanillaToasts.create({
                    title: 'Error',
                    text: 'Error al liberar el casillero: ' + (data.error || 'Error desconocido'),
                    type: 'error',
                    timeout: 5000,
                    positionClass: 'topRight'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            VanillaToasts.create({
                title: 'Error de conexión',
                text: 'Error al liberar el casillero: ' + error.message,
                type: 'error',
                timeout: 5000,
                positionClass: 'topRight'
            });
        })
        .finally(() => {
            // Restaurar el botón
            btnLiberar.innerHTML = btnOriginalHTML;
            btnLiberar.disabled = false;
        });
    };
    
    // Función para mostrar los controles de paginación
    function mostrarControlesPaginacion(data) {
        const controlesPaginacion = document.getElementById('controles-paginacion');
        const infoPaginacion = document.getElementById('info-paginacion');
        const paginacionCasilleros = document.getElementById('paginacion-casilleros');
        
        if (!controlesPaginacion || !infoPaginacion || !paginacionCasilleros) return;
        
        // Mostrar información de paginación
        const inicio = ((data.pagina_actual - 1) * data.casilleros_por_pagina) + 1;
        const fin = Math.min(data.pagina_actual * data.casilleros_por_pagina, data.total_casilleros);
        infoPaginacion.textContent = `Mostrando ${inicio}-${fin} de ${data.total_casilleros} casilleros`;
        
        // Generar botones de paginación
        let paginacionHTML = '';
        
        // Botón anterior
        if (data.pagina_actual > 1) {
            paginacionHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="cargarCasillerosDesdePHP('${filtroActual}', ${data.pagina_actual - 1}, '${busquedaActual}')">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>`;
        } else {
            paginacionHTML += `
                <li class="page-item disabled">
                    <span class="page-link"><i class="bi bi-chevron-left"></i></span>
                </li>`;
        }
        
        // Números de página
        const maxPaginas = 5;
        let inicio_pag = Math.max(1, data.pagina_actual - Math.floor(maxPaginas / 2));
        let fin_pag = Math.min(data.total_paginas, inicio_pag + maxPaginas - 1);
        
        if (fin_pag - inicio_pag + 1 < maxPaginas) {
            inicio_pag = Math.max(1, fin_pag - maxPaginas + 1);
        }
        
        // Primera página si no está visible
        if (inicio_pag > 1) {
            paginacionHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="cargarCasillerosDesdePHP('${filtroActual}', 1, '${busquedaActual}')">1</a>
                </li>`;
            if (inicio_pag > 2) {
                paginacionHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }
        
        // Páginas numeradas
        for (let i = inicio_pag; i <= fin_pag; i++) {
            if (i === data.pagina_actual) {
                paginacionHTML += `
                    <li class="page-item active">
                        <span class="page-link">${i}</span>
                    </li>`;
            } else {
                paginacionHTML += `
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="cargarCasillerosDesdePHP('${filtroActual}', ${i}, '${busquedaActual}')">${i}</a>
                    </li>`;
            }
        }
        
        // Última página si no está visible
        if (fin_pag < data.total_paginas) {
            if (fin_pag < data.total_paginas - 1) {
                paginacionHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            paginacionHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="cargarCasillerosDesdePHP('${filtroActual}', ${data.total_paginas}, '${busquedaActual}')">${data.total_paginas}</a>
                </li>`;
        }
        
        // Botón siguiente
        if (data.pagina_actual < data.total_paginas) {
            paginacionHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="cargarCasillerosDesdePHP('${filtroActual}', ${data.pagina_actual + 1}, '${busquedaActual}')">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>`;
        } else {
            paginacionHTML += `
                <li class="page-item disabled">
                    <span class="page-link"><i class="bi bi-chevron-right"></i></span>
                </li>`;
        }
        
        paginacionCasilleros.innerHTML = paginacionHTML;
        
        // Mostrar controles de paginación solo si hay más de una página
        if (data.total_paginas > 1) {
            controlesPaginacion.style.display = 'block';
        } else {
            controlesPaginacion.style.display = 'none';
        }
    }
    
    // Función para configurar los botones de filtro
    function configurarBotonesFiltro(filtroActual = 'todos') {
        // Remover clase active de todos los botones
        document.getElementById('btnFiltroTodos').classList.remove('active');
        document.getElementById('btnFiltroDisponibles').classList.remove('active');
        document.getElementById('btnFiltroAsignados').classList.remove('active');

        
        // Agregar clase active al botón correspondiente
        switch (filtroActual) {
            case 'disponibles':
                document.getElementById('btnFiltroDisponibles').classList.add('active');
                break;
            case 'asignados':
                document.getElementById('btnFiltroAsignados').classList.add('active');
                break;
            default:
                document.getElementById('btnFiltroTodos').classList.add('active');
        }
        
        // Agregar eventos a los botones de filtro
        document.getElementById('btnFiltroTodos').onclick = function() {
            cargarCasillerosDesdePHP('todos', 1, busquedaActual);
        };
        
        document.getElementById('btnFiltroDisponibles').onclick = function() {
            cargarCasillerosDesdePHP('disponibles', 1, busquedaActual);
        };
        
        document.getElementById('btnFiltroAsignados').onclick = function() {
            cargarCasillerosDesdePHP('asignados', 1, busquedaActual);
        };
    }
    
    // Agregar evento al botón de abrir casillero en el formulario de empleados
    const btnAbrirCasillero = document.getElementById('btnAbrirCasilleroEmpleado');
    if (btnAbrirCasillero) {
        btnAbrirCasillero.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarModalCasillero();
        });
    }
    
    // Agregar eventos de búsqueda cuando el modal se muestra
    document.addEventListener('shown.bs.modal', function(e) {
        if (e.target.id === 'modalCasillero') {
            // Configurar evento para la búsqueda
            const inputBusqueda = document.getElementById('busquedaCasilleros');
            const btnLimpiar = document.getElementById('btnLimpiarBusqueda');
            
            if (inputBusqueda) {
                // Búsqueda en tiempo real con debounce
                let timeoutBusqueda;
                inputBusqueda.addEventListener('input', function() {
                    clearTimeout(timeoutBusqueda);
                    const busqueda = this.value.trim();
                    timeoutBusqueda = setTimeout(() => {
                        cargarCasillerosDesdePHP(filtroActual, 1, busqueda);
                    }, 500); // Esperar 500ms después de dejar de escribir
                });
                
                // Búsqueda al presionar Enter
                inputBusqueda.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        cargarCasillerosDesdePHP(filtroActual, 1, this.value.trim());
                    }
                });
            }
            
            if (btnLimpiar) {
                btnLimpiar.addEventListener('click', function() {
                    if (inputBusqueda) {
                        inputBusqueda.value = '';
                        cargarCasillerosDesdePHP(filtroActual, 1, '');
                    }
                });
            }
        }
    });
});
