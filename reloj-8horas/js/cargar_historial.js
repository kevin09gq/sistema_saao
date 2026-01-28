/**
 * Cargar Historial Biométrico
 * Este script maneja la carga de historiales guardados desde la base de datos
 */

// Estado de la paginación y orden
let historialState = {
    pagina: 1,
    limite: 5,
    orden: 'fecha_inicio',
    direccion: 'DESC',
    totalPaginas: 1,
    totalRegistros: 0
};

// Función para formatear fecha de BD a formato legible
function formatearFechaBD(fechaStr) {
    if (!fechaStr) return '-';
    
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const fecha = new Date(fechaStr + 'T00:00:00');
    
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
}

// Función para formatear fecha y hora de registro
function formatearFechaHora(fechaStr) {
    if (!fechaStr) return '-';
    
    const fecha = new Date(fechaStr);
    
    const opciones = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return fecha.toLocaleDateString('es-MX', opciones);
}

// Función para renderizar la paginación
function renderizarPaginacionHistorial() {
    const $paginacion = $('#historial-paginacion');
    $paginacion.empty();
    
    if (historialState.totalPaginas <= 1) {
        $('#historial-paginacion-container').hide();
        return;
    }
    
    $('#historial-paginacion-container').show();
    
    // Botón anterior
    const disabledPrev = historialState.pagina === 1 ? 'disabled' : '';
    $paginacion.append(`
        <li class="page-item ${disabledPrev}">
            <a class="page-link" data-pagina="${historialState.pagina - 1}" aria-label="Anterior">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `);
    
    // Números de página
    let startPage = Math.max(1, historialState.pagina - 2);
    let endPage = Math.min(historialState.totalPaginas, historialState.pagina + 2);
    
    // Ajustar para mostrar siempre 5 páginas si es posible
    if (endPage - startPage < 4) {
        if (startPage === 1) {
            endPage = Math.min(historialState.totalPaginas, startPage + 4);
        } else if (endPage === historialState.totalPaginas) {
            startPage = Math.max(1, endPage - 4);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const active = i === historialState.pagina ? 'active' : '';
        $paginacion.append(`
            <li class="page-item ${active}">
                <a class="page-link" data-pagina="${i}">${i}</a>
            </li>
        `);
    }
    
    // Botón siguiente
    const disabledNext = historialState.pagina === historialState.totalPaginas ? 'disabled' : '';
    $paginacion.append(`
        <li class="page-item ${disabledNext}">
            <a class="page-link" data-pagina="${historialState.pagina + 1}" aria-label="Siguiente">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `);
}

// Función para cargar la lista de historiales
async function cargarListaHistoriales(resetPagina = false) {
    if (resetPagina) {
        historialState.pagina = 1;
    }
    
    const $loading = $('#historial-loading');
    const $vacio = $('#historial-vacio');
    const $contenido = $('#historial-contenido');
    const $tbody = $('#tbody-historiales');
    
    // Mostrar loading
    $loading.show();
    $vacio.hide();
    $contenido.hide();
    
    try {
        const params = new URLSearchParams({
            pagina: historialState.pagina,
            limite: historialState.limite,
            orden: historialState.orden,
            dir: historialState.direccion
        });
        
        const response = await fetch(`../php/obtener_historiales.php?${params}`);
        const resultado = await response.json();
        
        $loading.hide();
        
        if (!resultado.success) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: resultado.message || 'Error al cargar historiales',
                confirmButtonColor: '#d33'
            });
            return;
        }
        
        // Actualizar estado de paginación
        if (resultado.paginacion) {
            historialState.pagina = resultado.paginacion.pagina_actual;
            historialState.totalPaginas = resultado.paginacion.total_paginas;
            historialState.totalRegistros = resultado.paginacion.total_registros;
        }
        
        if (historialState.totalRegistros === 0) {
            $vacio.show();
            return;
        }
        
        // Mostrar info de total
        const inicio = (historialState.pagina - 1) * historialState.limite + 1;
        const fin = Math.min(historialState.pagina * historialState.limite, historialState.totalRegistros);
        $('#historial-info-total').text(`Mostrando ${inicio}-${fin} de ${historialState.totalRegistros}`);
        
        // Llenar tabla
        $tbody.empty();
        
        resultado.historiales.forEach(h => {
            const periodo = `${formatearFechaBD(h.fecha_inicio)} - ${formatearFechaBD(h.fecha_fin)}`;
            const observacion = h.observacion || '<em class="text-muted">Sin observación</em>';
            const fechaGuardado = formatearFechaHora(h.fecha_registro);
            
            const $row = $(`
                <tr data-id="${h.id}">
                    <td class="text-center">
                        <span class="badge bg-primary fs-6">${h.num_sem}</span>
                    </td>
                    <td>${periodo}</td>
                    <td>${observacion}</td>
                    <td><small>${fechaGuardado}</small></td>
                    <td class="text-center">
                        <button type="button" class="btn btn-danger btn-sm btn-eliminar-historial" 
                                data-historial-id="${h.id}" 
                                title="Eliminar historial">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
            
            $tbody.append($row);
        });
        
        // Renderizar paginación
        renderizarPaginacionHistorial();
        
        $contenido.show();
        
    } catch (error) {
        console.error('Error al cargar historiales:', error);
        $loading.hide();
        
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            confirmButtonColor: '#d33'
        });
    }
}

// Función para cargar un historial específico
async function cargarHistorialPorId(id) {
    // Mostrar loading
    Swal.fire({
        title: 'Cargando historial...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const response = await fetch(`../php/obtener_historial_por_id.php?id=${id}`);
        const resultado = await response.json();
        
        if (!resultado.success) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: resultado.message || 'Error al cargar el historial',
                confirmButtonColor: '#d33'
            });
            return;
        }
        
        // Guardar en sessionStorage
        sessionStorage.setItem('reloj-ocho', JSON.stringify(resultado.biometricos));
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCargarHistorial'));
        if (modal) modal.hide();
        
        // Ocultar el formulario de carga de archivos
        $('#container-reloj').prop('hidden', true);
        
        // Mostrar la tabla si estaba oculta
        $('#tabla-reloj-responsive').prop('hidden', false);
        
        // Poblar campos (título, semana, selects)
        if (typeof poblarCamposDesdeDatos === 'function') {
            poblarCamposDesdeDatos(resultado.biometricos);
        }
        
        // Disparar evento para actualizar la interfaz
        $(document).trigger('reloj-data-updated', [{ fromHistorial: true }]);
        
        Swal.fire({
            icon: 'success',
            title: '¡Historial cargado!',
            text: `Semana ${resultado.historial.num_sem} cargada correctamente`,
            confirmButtonColor: '#28a745',
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error('Error al cargar historial:', error);
        
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            confirmButtonColor: '#d33'
        });
    }
}

// Función para eliminar un historial
async function eliminarHistorialBiometrico(id) {
    console.log('Eliminando historial con ID:', id);
    
    const confirmacion = await Swal.fire({
        title: '¿Eliminar historial?',
        text: 'Esta acción no se puede deshacer, se perderá toda la información guardada en este historial.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (!confirmacion.isConfirmed) return;
    
    try {
        const response = await fetch('../php/eliminar_historial.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        });
        
        const resultado = await response.json();
        
        if (resultado.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: 'El historial ha sido eliminado',
                confirmButtonColor: '#28a745',
                timer: 1500,
                showConfirmButton: false
            });
            
            // Recargar lista (mantener página actual si hay registros, sino ir a la anterior)
            if (historialState.pagina > 1 && $('#tbody-historiales tr').length === 1) {
                historialState.pagina--;
            }
            cargarListaHistoriales();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: resultado.message || 'Error al eliminar',
                confirmButtonColor: '#d33'
            });
        }
    } catch (error) {
        console.error('Error al eliminar historial:', error);
        
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            confirmButtonColor: '#d33'
        });
    }
}

// Event listeners cuando el DOM esté listo
$(document).ready(function() {
    
    // Evento al abrir el modal de cargar historial
    const modalCargar = document.getElementById('modalCargarHistorial');
    if (modalCargar) {
        modalCargar.addEventListener('show.bs.modal', function() {
            // Resetear estado al abrir
            historialState.pagina = 1;
            $('#historial-orden-columna').val(historialState.orden);
            $('#historial-orden-dir').val(historialState.direccion);
            cargarListaHistoriales();
        });
    }
    
    // Evento cambio de orden (columna)
    $(document).on('change', '#historial-orden-columna', function() {
        historialState.orden = $(this).val();
        cargarListaHistoriales(true);
    });
    
    // Evento cambio de orden (dirección)
    $(document).on('change', '#historial-orden-dir', function() {
        historialState.direccion = $(this).val();
        cargarListaHistoriales(true);
    });
    
    // Evento click en paginación
    $(document).on('click', '#historial-paginacion .page-link', function(e) {
        e.preventDefault();
        
        const $item = $(this).closest('.page-item');
        if ($item.hasClass('disabled') || $item.hasClass('active')) return;
        
        const pagina = parseInt($(this).data('pagina'));
        if (pagina && pagina >= 1 && pagina <= historialState.totalPaginas) {
            historialState.pagina = pagina;
            cargarListaHistoriales();
        }
    });
    
    // Evento click en fila de historial para cargarlo
    $(document).on('click', '#tbody-historiales tr', function(e) {
        // Ignorar si hizo click en el botón de eliminar o en sus hijos
        if ($(e.target).closest('.btn-eliminar-historial').length) {
            return;
        }
        
        const id = $(this).data('id');
        if (id) {
            cargarHistorialPorId(id);
        }
    });
    
    // Evento click en botón eliminar - usando selector más específico
    $(document).on('click', '.btn-eliminar-historial', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const id = $(this).data('historial-id');
        console.log('Click en botón eliminar, ID:', id);
        
        if (id) {
            eliminarHistorialBiometrico(id);
        }
    });
    
});

console.log("cargar_historial.js cargado correctamente");
