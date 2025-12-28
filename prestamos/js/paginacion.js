// Variables globales para la paginación
let paginaActual = 1;
let filasPorPagina = 4;

// Función para inicializar la paginación
function inicializarPaginacion() {
    // Eventos para los botones de navegación
    $(document).on('click', '#btnPaginaAnterior', function() {
        if (paginaActual > 1) {
            paginaActual--;
            aplicarPaginacion();
        }
    });

    $(document).on('click', '#btnPaginaSiguiente', function() {
        let totalFilas = $('#tablaPrestamosBody tr').not('.text-center').length;
        let totalPaginas = Math.ceil(totalFilas / filasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            aplicarPaginacion();
        }
    });

    // Evento para los números de página
    $(document).on('click', '.btn-numero-pagina', function() {
        paginaActual = parseInt($(this).data('pagina'));
        aplicarPaginacion();
    });
}

// Función para aplicar la paginación (se llama después de cargar datos)
function aplicarPaginacion() {
    let filas = $('#tablaPrestamosBody tr').not('.text-center');
    let totalFilas = filas.length;

    if (totalFilas === 0) {
        $('#controlesPaginacion').hide();
        return;
    }

    // Calcular total de páginas
    let totalPaginas = Math.ceil(totalFilas / filasPorPagina);

    // Si solo hay una página o menos, ocultar controles
    if (totalPaginas <= 1) {
        $('#controlesPaginacion').hide();
        filas.show();
        return;
    }

    // Mostrar controles
    $('#controlesPaginacion').show();

    // Calcular qué filas mostrar
    let inicio = (paginaActual - 1) * filasPorPagina;
    let fin = inicio + filasPorPagina;

    // Ocultar todas las filas y mostrar solo las de la página actual
    filas.each(function(index) {
        if (index >= inicio && index < fin) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });

    // Actualizar controles
    actualizarControlesPaginacion(totalFilas, totalPaginas);
}

// Función para actualizar los controles de paginación
function actualizarControlesPaginacion(totalFilas, totalPaginas) {
    // Actualizar estado de botones anterior/siguiente
    $('#btnPaginaAnterior').prop('disabled', paginaActual === 1);
    $('#btnPaginaSiguiente').prop('disabled', paginaActual === totalPaginas);

    // Generar números de página
    let numerosPagina = '';
    for (let i = 1; i <= totalPaginas; i++) {
        let claseActiva = i === paginaActual ? 'activa' : '';
        numerosPagina += `<button class="btn-numero-pagina ${claseActiva}" data-pagina="${i}">${i}</button>`;
    }
    $('#numerosPagina').html(numerosPagina);

    // Actualizar texto de información
    let inicio = (paginaActual - 1) * filasPorPagina + 1;
    let fin = Math.min(paginaActual * filasPorPagina, totalFilas);
    $('#infoPaginacion').text(`Mostrando ${inicio}-${fin} de ${totalFilas} préstamos`);
}

// Función para resetear a la primera página (útil cuando se aplican filtros)
function resetearPaginacion() {
    paginaActual = 1;
    aplicarPaginacion();
}
