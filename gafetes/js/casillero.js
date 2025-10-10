// Variables globales
let casilleroActual = null;
let paginaActual = 1;
let totalPaginas = 1;
let filtroActual = 'todos'; // 'todos', 'disponibles', 'asignados'
let busquedaActual = ''; // Texto de búsqueda actual

// Función para cargar los casilleros desde la base de datos
function cargarCasilleros(pagina = 1, filtro = 'todos', busqueda = '') {
    // Asegurarse de que la página sea un número válido
    const paginaValida = Math.max(1, parseInt(pagina) || 1);
    paginaActual = paginaValida;
    filtroActual = filtro;
    busquedaActual = busqueda;
    
    const contenedor = document.getElementById('contenedor-casilleros');
    if (!contenedor) return;

    // Mostrar indicador de carga
    contenedor.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando casilleros...</p>
        </div>`;

    // Construir la URL con todos los parámetros
    let url = `php/obtener_casilleros.php?pagina=${paginaValida}&filtro=${filtro}`;
    if (busqueda) {
        url += `&busqueda=${encodeURIComponent(busqueda)}`;
    }

    // Hacer la petición para obtener los casilleros
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                paginaActual = data.pagina_actual;
                totalPaginas = data.total_paginas;
                filtroActual = data.filtro_actual;
                busquedaActual = data.busqueda_actual || '';
                mostrarCasilleros(data.data);
                mostrarPaginacion();
                actualizarBotonesFiltro(filtro);
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
                    <button class="btn btn-sm btn-outline-primary" onclick="cargarCasilleros(1, '${filtro}', '${busqueda}')">
                        <i class="bi bi-arrow-clockwise"></i> Reintentar
                    </button>
                </div>`;
        });
}

// Función para actualizar el estado de los botones de filtro
function actualizarBotonesFiltro(filtro) {
    // Remover clase active de todos los botones
    document.getElementById('btnFiltroTodos').classList.remove('active');
    document.getElementById('btnFiltroDisponibles').classList.remove('active');
    document.getElementById('btnFiltroAsignados').classList.remove('active');
    
    // Agregar clase active al botón correspondiente
    switch (filtro) {
        case 'disponibles':
            document.getElementById('btnFiltroDisponibles').classList.add('active');
            break;
        case 'asignados':
            document.getElementById('btnFiltroAsignados').classList.add('active');
            break;
        default:
            document.getElementById('btnFiltroTodos').classList.add('active');
    }
}

// Función para mostrar los casilleros en la cuadrícula
function mostrarCasilleros(casilleros) {
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
        let claseEstado = 'bg-success'; // Disponible
        if (totalEmpleados > 0) {
            claseEstado = 'bg-warning'; // Parcialmente ocupado (1 empleado)
            if (totalEmpleados >= 2) {
                claseEstado = 'bg-danger'; // Completamente ocupado (2 empleados)
            }
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
        
        html += `
        <div class="col-auto p-1">
            <div class="casillero-item ${claseEstado}" 
                 onclick="manejarClicCasillero('${numCasillero.replace(/'/g, "\\'")}', ${totalEmpleados > 0})">
                <div class="casillero-numero">${numCasillero}</div>
                <div class="casillero-estado">${estado} (${totalEmpleados}/2)</div>
                ${infoEmpleado}
            </div>
        </div>`;
    });

    contenedor.innerHTML = html;
}

// Función para mostrar la paginación
function mostrarPaginacion() {
    const contenedor = document.getElementById('contenedor-casilleros');
    if (!contenedor) return;

    // Solo mostrar paginación si hay más de una página
    if (totalPaginas <= 1) return;

    let paginacionHtml = `
        <div class="col-12 mt-3">
            <nav aria-label="Navegación de casilleros">
                <ul class="pagination justify-content-center">
    `;

    // Botón anterior
    if (paginaActual > 1) {
        paginacionHtml += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="cargarCasilleros(${paginaActual - 1}, '${filtroActual}', '${busquedaActual}'); return false;">
                    <i class="bi bi-chevron-left"></i> Anterior
                </a>
            </li>
        `;
    } else {
        paginacionHtml += `
            <li class="page-item disabled">
                <span class="page-link">
                    <i class="bi bi-chevron-left"></i> Anterior
                </span>
            </li>
        `;
    }

    // Mostrar siempre la página 1
    paginacionHtml += `
        <li class="page-item ${paginaActual === 1 ? 'active' : ''}">
            <a class="page-link" href="#" onclick="cargarCasilleros(1, '${filtroActual}', '${busquedaActual}'); return false;">1</a>
        </li>
    `;

    // Mostrar puntos suspensivos si es necesario
    if (paginaActual > 3) {
        paginacionHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }

    // Páginas intermedias
    const rangoInicio = Math.max(2, paginaActual - 1);
    const rangoFin = Math.min(totalPaginas - 1, paginaActual + 1);

    for (let i = rangoInicio; i <= rangoFin; i++) {
        paginacionHtml += `
            <li class="page-item ${paginaActual === i ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cargarCasilleros(${i}, '${filtroActual}', '${busquedaActual}'); return false;">${i}</a>
            </li>
        `;
    }

    // Mostrar puntos suspensivos si es necesario
    if (paginaActual < totalPaginas - 2) {
        paginacionHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }

    // Mostrar la última página si hay más de una página
    if (totalPaginas > 1) {
        paginacionHtml += `
            <li class="page-item ${paginaActual === totalPaginas ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cargarCasilleros(${totalPaginas}, '${filtroActual}', '${busquedaActual}'); return false;">${totalPaginas}</a>
            </li>
        `;
    }

    // Botón siguiente
    if (paginaActual < totalPaginas) {
        paginacionHtml += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="cargarCasilleros(${paginaActual + 1}, '${filtroActual}', '${busquedaActual}'); return false;">
                    Siguiente <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        `;
    } else {
        paginacionHtml += `
            <li class="page-item disabled">
                <span class="page-link">
                    Siguiente <i class="bi bi-chevron-right"></i>
                </span>
            </li>
        `;
    }

    paginacionHtml += `
                </ul>
            </nav>
        </div>
    `;

    // Agregar la paginación después de los casilleros
    contenedor.innerHTML += paginacionHtml;
}

// Función para manejar el clic en un casillero
function manejarClicCasillero(numCasillero, estaOcupado) {
    casilleroActual = numCasillero;
    
    // Mostrar el modal de edición
    const modal = new bootstrap.Modal(document.getElementById('modalEditarCasillero'));
    document.getElementById('nuevo_numero').value = numCasillero;
    document.getElementById('casillero_id').value = numCasillero;
    
    // Limpiar el campo de búsqueda de empleado o pre-llenarlo si estamos en modal de editar empleado
    const buscarEmpleadoInput = document.getElementById('buscarEmpleado');
    if (buscarEmpleadoInput) {
        // Detectar si estamos en el modal de editar empleado
        const modalEditarEmpleado = document.getElementById('modal_actualizar_empleado');
        if (modalEditarEmpleado && modalEditarEmpleado.classList.contains('show')) {
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
        } else {
            buscarEmpleadoInput.value = '';
        }
    }
    
    // Mostrar información del empleado actual si existe
    if (estaOcupado) {
        cargarInfoEmpleadoAsignado(numCasillero);
    } else {
        document.getElementById('infoEmpleadoAsignado').innerHTML = '';
    }
    
    // Configurar el botón de guardar cambios
    document.getElementById('btnGuardarCambios').onclick = function() {
        actualizarNumeroCasillero(numCasillero);
    };
    
    // Configurar el botón de eliminar casillero
    document.getElementById('btnEliminarCasillero').onclick = function() {
        eliminarCasillero(numCasillero);
    };
    
    // Configurar el botón de búsqueda
    document.getElementById('btnBuscarEmpleado').onclick = function() {
        buscarEmpleado();
    };
    
    // Configurar el botón de limpiar búsqueda
    const btnLimpiarBusqueda = document.getElementById('btnLimpiarBusquedaEmpleado');
    const inputBuscarEmpleado = document.getElementById('buscarEmpleado');
    
    if (btnLimpiarBusqueda && inputBuscarEmpleado) {
        // Hacer que el botón de limpiar siempre sea visible
        btnLimpiarBusqueda.style.display = 'block';
        
        // Función para manejar el clic en el botón de limpiar
        function manejarClicLimpiar() {
            inputBuscarEmpleado.value = '';
            inputBuscarEmpleado.focus();
            // Limpiar los resultados de búsqueda
            const resultadosDiv = document.getElementById('resultadoBusqueda');
            if (resultadosDiv) {
                resultadosDiv.innerHTML = `
                    <div class="text-center text-muted">
                        <i class="bi bi-person-lines-fill fs-1"></i>
                        <p class="mt-2">Busque un empleado para asignar al casillero</p>
                    </div>`;
            }
        }
        
        // Configurar el clic del botón de limpiar
        btnLimpiarBusqueda.onclick = manejarClicLimpiar;
    }
    
    // Permitir búsqueda con Enter
    inputBuscarEmpleado.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarEmpleado();
        }
    });
    
    // Agregar evento para cargar información cuando se cambia a la pestaña de asignar
    document.getElementById('asignar-tab').addEventListener('shown.bs.tab', function() {
        if (estaOcupado) {
            cargarInfoEmpleadoAsignado(numCasillero);
        }
        
        // Pre-llenar el campo de búsqueda si estamos en modal de editar empleado
        const buscarEmpleadoInput = document.getElementById('buscarEmpleado');
        if (buscarEmpleadoInput) {
            const modalEditarEmpleado = document.getElementById('modal_actualizar_empleado');
            if (modalEditarEmpleado && modalEditarEmpleado.classList.contains('show')) {
                const nombreEmpleado = document.getElementById('modal_nombre_empleado')?.value || '';
                const apellidoPaterno = document.getElementById('modal_apellido_paterno')?.value || '';
                const apellidoMaterno = document.getElementById('modal_apellido_materno')?.value || '';
                
                if (nombreEmpleado || apellidoPaterno) {
                    const nombreCompleto = `${nombreEmpleado} ${apellidoPaterno} ${apellidoMaterno}`.trim();
                    buscarEmpleadoInput.value = nombreCompleto;
                }
            }
        }
    });
    
    // Agregar evento para cargar información cuando se cambia a la pestaña de editar
    document.getElementById('editar-tab').addEventListener('shown.bs.tab', function() {
        if (estaOcupado) {
            cargarInfoEmpleadoAsignado(numCasillero);
        }
    });
    
    // Limpiar resultados anteriores
    document.getElementById('resultadoBusqueda').innerHTML = `
        <div class="text-center text-muted">
            <i class="bi bi-person-lines-fill fs-1"></i>
            <p class="mt-2">Busque un empleado para asignar al casillero</p>
        </div>
    `;
    
    modal.show();
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
    fetch(`php/buscar_empleados.php?q=${encodeURIComponent(busqueda)}`)
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
                                    onclick="asignarEmpleado('${casilleroActual}', ${empleado.id_empleado}, '${nombreCompleto.replace(/'/g, "\\'")}')">
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

// Función para cargar la información del empleado asignado
function cargarInfoEmpleadoAsignado(numCasillero) {
    fetch(`php/obtener_empleado_casillero.php?casillero=${encodeURIComponent(numCasillero)}`)
        .then(response => response.json())
        .then(data => {
            const infoContainer = document.getElementById('infoEmpleadoAsignado');
            
            if (data.success && data.empleados && data.empleados.length > 0) {
                let empleadosHtml = '';
                data.empleados.forEach(empleado => {
                    empleadosHtml += `
                        <div class="alert alert-info">
                            <h6><i class="bi bi-person-badge"></i> Empleado Asignado:</h6>
                            <p class="mb-1"><strong>Nombre:</strong> ${empleado.nombre} ${empleado.apellido_paterno} ${empleado.apellido_materno || ''}</p>
                            <p class="mb-1"><strong>ID Empleado:</strong> ${empleado.id_empleado}</p>
                            ${empleado.departamento ? `<p class="mb-1"><strong>Departamento:</strong> ${empleado.departamento}</p>` : ''}
                            <p class="mb-0">
                                <button class="btn btn-sm btn-danger" onclick="liberarCasillero('${numCasillero}', ${empleado.id_empleado})">
                                    <i class="bi bi-person-dash"></i> Liberar Casillero
                                </button>
                            </p>
                        </div>`;
                });
                
                infoContainer.innerHTML = empleadosHtml;
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
            document.getElementById('infoEmpleadoAsignado').innerHTML = `
                <div class="alert alert-danger">
                    <h6><i class="bi bi-exclamation-triangle"></i> Error</h6>
                    <p class="mb-0">Ocurrió un error al cargar la información del empleado asignado.</p>
                </div>`;
        });
}

// Función para asignar un empleado a un casillero
function asignarEmpleado(numCasillero, idEmpleado, nombreEmpleado) {
    // Confirmación estilizada
    return mostrarConfirmacionCasillero({
        titulo: 'Confirmar asignación',
        mensaje: `¿Desea asignar el casillero <strong>${numCasillero}</strong> a <strong>${nombreEmpleado}</strong>?`,
        tipo: 'question',
        textoConfirmar: 'Sí, asignar',
        textoCancelar: 'Cancelar',
        onConfirm: () => ejecutarAsignacion(numCasillero, idEmpleado, nombreEmpleado)
    });
}

function ejecutarAsignacion(numCasillero, idEmpleado, nombreEmpleado) {
    fetch('php/asignar_casillero.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `num_casillero=${encodeURIComponent(numCasillero)}&id_empleado=${idEmpleado}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('success', 'Asignación exitosa', `El casillero ${numCasillero} ha sido asignado a ${nombreEmpleado}`);
            cargarCasilleros(paginaActual, filtroActual, busquedaActual);
            // Cerrar el modal después de 1 segundo
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarCasillero'));
                modal.hide();
            }, 1000);
        } else {
            // Verificar si el error es porque el casillero está ocupado
            if (data.error && data.error.includes('máximo')) {
                mostrarNotificacion('warning', 'Casillero lleno', data.error);
            } else if (data.error && data.error.includes('ya tiene asignado')) {
                mostrarNotificacion('warning', 'Empleado con casillero', data.error);
            } else {
                throw new Error(data.error || 'Error al asignar el casillero');
            }
        }
    })
    .catch(error => {
        console.error('Error al asignar casillero:', error);
        mostrarNotificacion('danger', 'Error', error.message || 'Ocurrió un error al asignar el casillero');
    });
}

// Función para eliminar un casillero
function eliminarCasillero(numCasillero) {
    // Verificar si el casillero está ocupado
    fetch(`php/obtener_empleado_casillero.php?casillero=${encodeURIComponent(numCasillero)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.empleados && data.empleados.length > 0) {
                // El casillero está ocupado
                mostrarNotificacion('warning', 'Casillero ocupado', 'No se puede eliminar un casillero ocupado. Libere el casillero primero.');
                return;
            }
            
            // Confirmar la eliminación
            if (!confirm(`¿Está seguro de eliminar el casillero ${numCasillero}? Esta acción no se puede deshacer.`)) {
                return;
            }
            
            // Enviar la petición al servidor
            fetch('php/eliminar_casillero.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `num_casillero=${encodeURIComponent(numCasillero)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Cerrar el modal y recargar los casilleros
                    bootstrap.Modal.getInstance(document.getElementById('modalEditarCasillero')).hide();
                    cargarCasilleros(paginaActual, filtroActual, busquedaActual);
                    // Mostrar notificación de éxito
                    mostrarNotificacion('success', 'Casillero eliminado', `El casillero ${numCasillero} ha sido eliminado correctamente`);
                } else {
                    throw new Error(data.error || 'Error al eliminar el casillero');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarNotificacion('danger', 'Error', error.message || 'Ocurrió un error al eliminar el casillero');
            });
        })
        .catch(error => {
            console.error('Error al verificar estado del casillero:', error);
            mostrarNotificacion('danger', 'Error', 'Ocurrió un error al verificar el estado del casillero');
        });
}

// Función para limpiar el campo de búsqueda
function limpiarCampoBusqueda() {
    const inputBuscarEmpleado = document.getElementById('buscarEmpleado');
    const btnLimpiarBusqueda = document.getElementById('btnLimpiarBusquedaEmpleado');
    
    if (inputBuscarEmpleado) {
        inputBuscarEmpleado.value = '';
        inputBuscarEmpleado.focus();
        // Mostrar el mensaje de búsqueda por defecto
        const resultadosDiv = document.getElementById('resultadoBusqueda');
        if (resultadosDiv) {
            resultadosDiv.innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-person-lines-fill fs-1"></i>
                    <p class="mt-2">Busque un empleado para asignar al casillero</p>
                </div>`;
        }
    }
    
    // Mantener el botón de limpieza siempre visible
    if (btnLimpiarBusqueda) {
        btnLimpiarBusqueda.style.opacity = '0.6';
        btnLimpiarBusqueda.style.visibility = 'visible';
    }
}

// Función para actualizar la visibilidad del botón de limpieza
function actualizarBotonLimpiar() {
    const inputBuscarEmpleado = document.getElementById('buscarEmpleado');
    const btnLimpiarBusqueda = document.getElementById('btnLimpiarBusquedaEmpleado');
    
    if (inputBuscarEmpleado && btnLimpiarBusqueda) {
        if (inputBuscarEmpleado.value.trim() !== '') {
            btnLimpiarBusqueda.style.opacity = '0.6';
            btnLimpiarBusqueda.style.visibility = 'visible';
        } else {
            btnLimpiarBusqueda.style.opacity = '0';
            btnLimpiarBusqueda.style.visibility = 'hidden';
        }
    }
    
    // Disparar el evento de búsqueda automáticamente al escribir
    if (inputBuscarEmpleado && inputBuscarEmpleado.value.trim() !== '') {
        buscarEmpleado();
    }
}

// Función para liberar un casillero
function liberarCasillero(numCasillero, idEmpleado) {
    // Confirmación estilizada
    return mostrarConfirmacionCasillero({
        titulo: 'Liberar casillero',
        mensaje: `¿Está seguro de liberar el casillero <strong>${numCasillero}</strong> para este empleado?`,
        tipo: 'warning',
        textoConfirmar: 'Sí, liberar',
        textoCancelar: 'Cancelar',
        onConfirm: () => ejecutarLiberacion(numCasillero, idEmpleado)
    });
}

function ejecutarLiberacion(numCasillero, idEmpleado) {
    fetch('php/liberar_casillero.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `num_casillero=${encodeURIComponent(numCasillero)}&id_empleado=${idEmpleado}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('success', 'Casillero liberado', `El casillero ${numCasillero} ha sido liberado correctamente para este empleado`);
            cargarCasilleros(paginaActual, filtroActual, busquedaActual);
            cargarInfoEmpleadoAsignado(numCasillero); // Recargar la información
            // Limpiar el campo de búsqueda
            limpiarCampoBusqueda();
        } else {
            throw new Error(data.error || 'Error al liberar el casillero');
        }
    })
    .catch(error => {
        console.error('Error al liberar casillero:', error);
        mostrarNotificacion('danger', 'Error', error.message || 'Ocurrió un error al liberar el casillero');
    });
}

// Función para actualizar el número del casillero
function actualizarNumeroCasillero(numeroAnterior) {
    const nuevoNumero = document.getElementById('nuevo_numero').value.trim();
    
    if (!nuevoNumero) {
        alert('Por favor ingrese un número de casillero válido');
        return;
    }
    
    if (nuevoNumero === numeroAnterior) {
        bootstrap.Modal.getInstance(document.getElementById('modalEditarCasillero')).hide();
        return;
    }
    
    // Mostrar indicador de carga
    const btnGuardar = document.getElementById('btnGuardarCambios');
    const btnOriginalHTML = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
    btnGuardar.disabled = true;
    
    // Enviar la petición al servidor
    fetch('php/actualizar_casillero.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `numero_anterior=${encodeURIComponent(numeroAnterior)}&nuevo_numero=${encodeURIComponent(nuevoNumero)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Cerrar el modal y recargar los casilleros
            bootstrap.Modal.getInstance(document.getElementById('modalEditarCasillero')).hide();
            cargarCasilleros(paginaActual, filtroActual, busquedaActual);
            // Mostrar notificación de éxito
            mostrarNotificacion('success', 'Casillero actualizado', `El casillero se actualizó correctamente a ${nuevoNumero}`);
        } else {
            throw new Error(data.error || 'Error al actualizar el casillero');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('danger', 'Error', error.message || 'Ocurrió un error al actualizar el casillero');
    })
    .finally(() => {
        // Restaurar el botón
        btnGuardar.innerHTML = btnOriginalHTML;
        btnGuardar.disabled = false;
    });
}

// Función para mostrar notificaciones
function mostrarNotificacion(tipo, titulo, mensaje) {
    // Wrapper para el nuevo toast estilizado
    crearContenedorToastsCasillero();
    const icono = tipo === 'success' ? 'check-circle-fill' : (tipo === 'warning' ? 'exclamation-triangle-fill' : (tipo === 'info' ? 'info-circle-fill' : 'x-circle-fill'));
    const toast = document.createElement('div');
    toast.className = `casillero-toast casillero-toast-${tipo}`;
    toast.innerHTML = `
        <div class="casillero-toast-icon"><i class="bi bi-${icono}"></i></div>
        <div class="casillero-toast-content">
            <div class="casillero-toast-title">${titulo}</div>
            <div class="casillero-toast-message">${mensaje}</div>
        </div>
        <button class="casillero-toast-close" aria-label="Cerrar">×</button>
    `;
    document.getElementById('casillero-toasts-container').appendChild(toast);
    // Animar y autodestruir
    requestAnimationFrame(() => toast.classList.add('show'));
    const close = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    };
    toast.querySelector('.casillero-toast-close').addEventListener('click', close);
    setTimeout(close, 5000);
}

function crearContenedorToastsCasillero() {
    if (!document.getElementById('casillero-toasts-container')) {
        const cont = document.createElement('div');
        cont.id = 'casillero-toasts-container';
        document.body.appendChild(cont);
    }
}

function mostrarConfirmacionCasillero({ titulo, mensaje, tipo = 'warning', textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar', onConfirm }) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'casillero-confirm-overlay';
    overlay.innerHTML = `
        <div class="casillero-confirm">
            <div class="casillero-confirm-header casillero-confirm-${tipo}">
                <i class="bi ${tipo === 'question' ? 'bi-question-circle-fill' : tipo === 'warning' ? 'bi-exclamation-triangle-fill' : tipo === 'success' ? 'bi-check-circle-fill' : 'bi-info-circle-fill'}"></i>
                <span>${titulo}</span>
                <button class="casillero-confirm-close" aria-label="Cerrar">×</button>
            </div>
            <div class="casillero-confirm-body">${mensaje}</div>
            <div class="casillero-confirm-actions">
                <button class="btn btn-light casillero-btn-cancelar">${textoCancelar}</button>
                <button class="btn btn-primary casillero-btn-confirmar">${textoConfirmar}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    // Eventos
    const cerrar = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 200);
    };
    overlay.querySelector('.casillero-confirm-close').addEventListener('click', cerrar);
    overlay.querySelector('.casillero-btn-cancelar').addEventListener('click', cerrar);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(); });
    overlay.querySelector('.casillero-btn-confirmar').addEventListener('click', () => {
        try { onConfirm && onConfirm(); } finally { cerrar(); }
    });
    requestAnimationFrame(() => overlay.classList.add('show'));
}

// Función para inicializar los eventos de los botones de filtro
function inicializarEventosCasillero() {
    // Configurar eventos de los botones de filtro
    document.getElementById('btnFiltroTodos')?.addEventListener('click', function() {
        cargarCasilleros(1, 'todos', busquedaActual);
    });
    
    document.getElementById('btnFiltroDisponibles')?.addEventListener('click', function() {
        cargarCasilleros(1, 'disponibles', busquedaActual);
    });
    
    document.getElementById('btnFiltroAsignados')?.addEventListener('click', function() {
        cargarCasilleros(1, 'asignados', busquedaActual);
    });
    
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
                cargarCasilleros(1, filtroActual, busqueda);
            }, 500); // Esperar 500ms después de dejar de escribir
        });
        
        // Búsqueda al presionar Enter
        inputBusqueda.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                cargarCasilleros(1, filtroActual, this.value.trim());
            }
        });
    }
    
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function() {
            if (inputBusqueda) {
                inputBusqueda.value = '';
                cargarCasilleros(1, filtroActual, '');
            }
        });
    }
}

// Función para cargar el modal desde PHP
function cargarModalCasillero() {
    return new Promise((resolve, reject) => {
        // Si el modal ya existe, eliminarlo para evitar duplicados
        const modalExistente = document.getElementById('modalCasillero');
        if (modalExistente) {
            // Eliminar todos los eventos del modal existente
            const modalInstance = bootstrap.Modal.getInstance(modalExistente);
            if (modalInstance) {
                modalInstance.dispose();
            }
            modalExistente.remove();
        }

        fetch('views/modal_casillero.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar el modal');
                }
                return response.text();
            })
            .then(html => {
                // Agregar el modal al final del body
                document.body.insertAdjacentHTML('beforeend', html);
                
                const modalElement = document.getElementById('modalCasillero');
                if (!modalElement) {
                    throw new Error('No se pudo crear el modal');
                }

                // Configurar el evento de guardar
                const btnGuardar = document.getElementById('guardarCasillero');
                if (btnGuardar) {
                    btnGuardar.addEventListener('click', function() {
                        console.log('Guardando datos del casillero...');
                    });
                }
                
                // Configurar el botón de agregar casillero
                const btnAgregar = document.getElementById('btnAgregarCasillero');
                if (btnAgregar) {
                    btnAgregar.addEventListener('click', function() {
                        agregarCasillero();
                    });
                }
                
                // Inicializar eventos de los botones de filtro
                inicializarEventosCasillero();
                
                // Configurar el evento para cuando el modal se cierre
                modalElement.addEventListener('hidden.bs.modal', function() {
                    // Limpiar el modal cuando se cierre
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) {
                        modalInstance.dispose();
                    }
                    // No eliminamos el modal aquí para evitar parpadeo al volver a abrirlo
                });
                
                // Cargar los casilleros cuando se muestre el modal
                modalElement.addEventListener('shown.bs.modal', function() {
                    cargarCasilleros(1, 'todos', '');
                });
                
                resolve(true);
            })
            .catch(error => {
                console.error('Error al cargar el modal:', error);
                reject(error);
            });
    });
}

// Función para mostrar el modal de agregar casillero
function mostrarModalAgregarCasillero() {
    // Limpiar el formulario
    const numeroInput = document.getElementById('numeroCasillero');
    if (numeroInput) {
        numeroInput.value = '';
    }
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalAgregarCasillero'));
    modal.show();
    
    // Configurar el botón de confirmar
    const btnConfirmar = document.getElementById('btnConfirmarAgregar');
    if (btnConfirmar) {
        // Remover eventos anteriores si existen
        btnConfirmar.removeEventListener('click', handleConfirmarAgregar);
        // Agregar el nuevo evento
        btnConfirmar.addEventListener('click', handleConfirmarAgregar);
    }
}

// Manejador para el botón de confirmar en el modal de agregar casillero
function handleConfirmarAgregar() {
    const numeroInput = document.getElementById('numeroCasillero');
    if (!numeroInput) {
        mostrarNotificacion('danger', 'Error', 'No se pudo encontrar el campo de número de casillero');
        return;
    }
    
    const numero = numeroInput.value.trim();
    
    // Validar que el número no esté vacío
    if (numero === '') {
        mostrarNotificacion('warning', 'Advertencia', 'El número de casillero no puede estar vacío');
        numeroInput.focus();
        return;
    }
    
    // Mostrar indicador de carga
    const btnConfirmar = document.getElementById('btnConfirmarAgregar');
    if (!btnConfirmar) {
        console.error('Botón de confirmar no encontrado');
        return;
    }
    
    const btnOriginalHTML = btnConfirmar.innerHTML;
    btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Agregando...';
    btnConfirmar.disabled = true;
    
    // Enviar la petición al servidor
    fetch('php/crear_casillero.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `num_casillero=${encodeURIComponent(numero)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarCasillero'));
            modal.hide();
            
            // Recargar los casilleros para reflejar el nuevo
            cargarCasilleros(1, 'todos', ''); // Resetear a página 1 y sin búsqueda
            
            // Mostrar notificación de éxito
            mostrarNotificacion('success', 'Casillero agregado', `El casillero ${numero} se ha creado correctamente`);
        } else {
            throw new Error(data.error || 'Error al crear el casillero');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('danger', 'Error', error.message || 'Ocurrió un error al crear el casillero');
    })
    .finally(() => {
        // Restaurar el botón
        setTimeout(() => {
            btnConfirmar.innerHTML = btnOriginalHTML;
            btnConfirmar.disabled = false;
        }, 500);
    });
}

// Función para agregar un nuevo casillero (reemplaza la versión anterior)
function agregarCasillero() {
    mostrarModalAgregarCasillero();
}

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Función para mostrar el modal de casillero
    function mostrarModalCasillero() {
        cargarModalCasillero()
            .then((success) => {
                if (success) {
                    const modalElement = document.getElementById('modalCasillero');
                    if (modalElement) {
                        // Crear una nueva instancia del modal sin backdrop
                        const modal = new bootstrap.Modal(modalElement, {
                            backdrop: false, // Desactiva el fondo oscuro
                            keyboard: true  // Permite cerrar con la tecla ESC
                        });
                        
                        // Limpiar el modal cuando se cierre
                        modalElement.addEventListener('hidden.bs.modal', function() {
                            // Dar tiempo a que se complete la animación
                            setTimeout(() => {
                                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                                if (modalInstance) {
                                    modalInstance.dispose();
                                }
                                if (modalElement.parentNode) {
                                    modalElement.remove();
                                }
                                
                                // Eliminar el backdrop manualmente si existe
                                const backdrops = document.querySelectorAll('.modal-backdrop');
                                backdrops.forEach(backdrop => {
                                    backdrop.remove();
                                });
                                
                                // Eliminar la clase modal-open del body
                                document.body.classList.remove('modal-open');
                                document.body.style.overflow = '';
                                document.body.style.paddingRight = '';
                            }, 300);
                        });
                        
                        // Mostrar el modal
                        modal.show();
                    }
                }
            })
            .catch(error => {
                console.error('Error al mostrar el modal:', error);
            });
    }
    
    // Cargar el modal cuando se haga clic en el botón principal de casillero
    document.getElementById('btnCasillero')?.addEventListener('click', mostrarModalCasillero);
    
    // Inicializar el botón de abrir casillero desde el formulario de edición
    const btnAbrirCasillero = document.getElementById('btnAbrirCasillero');
    if (btnAbrirCasillero) {
        btnAbrirCasillero.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarModalCasillero();
        });
    }
    
    // Manejar el evento de cierre del modal cuando se presiona la tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modalElement = document.getElementById('modalCasillero');
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        }
    });
});