$(document).ready(function () {
    // Variables globales
    let empleados = [];
    let empleadosFiltrados = [];
    let departamentos = [];
    let empleadosSeleccionados = new Set();
    // Hacer la variable empleadosSeleccionados accesible globalmente
    window.empleadosSeleccionados = empleadosSeleccionados;
    let paginaActual = 1;
    const empleadosPorPagina = 10;
    let todosLosEmpleados = [];
    let ordenClave = 'asc'; // 'asc' o 'desc' para controlar el orden de la columna Clave

    // Función para formatear texto a mayúsculas mientras se escribe
    function formatearMayusculas(selector) {
        $(selector).on('input', function () {
            // Obtener la posición actual del cursor
            const cursorPosition = this.selectionStart;
            // Convertir el valor a mayúsculas
            const valorMayusculas = $(this).val().toUpperCase();
            // Establecer el nuevo valor
            $(this).val(valorMayusculas);
            // Restaurar la posición del cursor
            this.setSelectionRange(cursorPosition, cursorPosition);
        });
    }

    // Función para obtener logos dinámicos según el empleado
    function obtenerLogosDinamicos(empleado) {
        // Sin rutas por defecto - solo usar si hay logos específicos
        let logoAreaUrl = null; // Sin fallback por defecto
        let logoEmpresaUrl = null; // Sin fallback por defecto

        try {
            // Verificar si hay sistema de logos dinámicos disponible
            if (window.actualizadorLogos) {
                // Si el empleado tiene área, buscar su logo
                if (empleado.id_area && window.actualizadorLogos.areas) {
                    const area = window.actualizadorLogos.areas.find(a => a.id_area == empleado.id_area);
                    if (area && area.logo_area) {
                        logoAreaUrl = `logos_area/${area.logo_area}`;
                    }
                }

                // Si el empleado tiene empresa, buscar su logo
                if (empleado.id_empresa && window.actualizadorLogos.empresas) {
                    const empresa = window.actualizadorLogos.empresas.find(e => e.id_empresa == empleado.id_empresa);
                    if (empresa && empresa.logo_empresa) {
                        logoEmpresaUrl = `logos_empresa/${empresa.logo_empresa}`;
                    } else {
                    }
                }
            } else {
            }
        } catch (error) {
           
        }

        return { logoAreaUrl, logoEmpresaUrl };
    }

    // Cargar departamentos al iniciar
    cargarDepartamentos();

    // Cargar todos los empleados inicialmente
    cargarEmpleadosPorDepartamento('todos', true); // true para indicar que es carga global
    
    // Hacer variables accesibles globalmente
    window.todosLosEmpleados = todosLosEmpleados;
    
    // Objeto para almacenar las preferencias de inclusión de fotos por empleado
    window.fotoInclusion = {};
    
    // Objeto para almacenar las preferencias de orden de nombre por empleado
    window.ordenNombre = {};
    
    // Objeto para almacenar el estado del toggle IMSS por empleado
    window.imssToggleState = {};
    
    // Función para cargar el estado del toggle desde localStorage
    function cargarEstadoToggleIMSS() {
        const estadoGuardado = localStorage.getItem('imssToggleState');
        if (estadoGuardado) {
            try {
                window.imssToggleState = JSON.parse(estadoGuardado);
            } catch (e) {
                console.warn('Error al cargar estado del toggle IMSS:', e);
                window.imssToggleState = {};
            }
        }
    }
    
    // Función para guardar el estado del toggle en localStorage
    function guardarEstadoToggleIMSS() {
        localStorage.setItem('imssToggleState', JSON.stringify(window.imssToggleState));
    }
    
    // Función para resetear todos los toggles IMSS a su estado original
    function resetearTogglesIMSS() {
        if (confirm('¿Estás seguro de que quieres resetear todos los toggles IMSS a su estado original?')) {
            localStorage.removeItem('imssToggleState');
            window.imssToggleState = {};
            // Recargar la tabla para mostrar los estados originales
            actualizarTablaEmpleados();
        }
    }
    
    // Hacer la función accesible globalmente para uso en consola o botones
    window.resetearTogglesIMSS = resetearTogglesIMSS;
    
    // Cargar el estado guardado al iniciar
    cargarEstadoToggleIMSS();

    // Evento para seleccionar todos los empleados
    $('#seleccionarTodos').click(function () {
        $('.empleado-checkbox').prop('checked', true);
        empleadosSeleccionados = new Set(empleados.map(e => e.id_empleado));
        window.empleadosSeleccionados = empleadosSeleccionados;
        
        actualizarContadorSeleccionados();
    });

    // Evento para deseleccionar todos los empleados
    $('#deseleccionarTodos').click(function () {
        $('.empleado-checkbox').prop('checked', false);
        empleadosSeleccionados.clear();
        window.empleadosSeleccionados = empleadosSeleccionados;
        
        // Limpiar las preferencias de inclusión de fotos, orden de nombre y toggle IMSS
        window.fotoInclusion = {};
        window.ordenNombre = {};
        // No limpiar window.imssToggleState para mantener las preferencias del usuario
        
        actualizarContadorSeleccionados();
    });

    // Función para actualizar los controles de paginación
    function actualizarControlesPaginacion(totalPaginas) {
        const $controles = $('#controlesPaginacion');

        // Limpiar controles excepto los botones Anterior y Siguiente
        $controles.find('li:not(#anteriorPagina, #siguientePagina)').remove();

        // Insertar el botón Anterior al principio
        $controles.prepend($('#anteriorPagina'));

        // Agregar números de página
        const inicio = Math.max(1, paginaActual - 2);
        const fin = Math.min(totalPaginas, inicio + 4);

        for (let i = inicio; i <= fin; i++) {
            const $pagina = $(`<li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="#" data-pagina="${i}">${i}</a>
            </li>`);

            $pagina.insertBefore('#siguientePagina');
        }

        // Actualizar estado de los botones Anterior/Siguiente
        $('#anteriorPagina').toggleClass('disabled', paginaActual === 1);
        $('#siguientePagina').toggleClass('disabled', paginaActual === totalPaginas);
    }

    // Manejar clic en los controles de paginación
    $(document).on('click', '.page-link', function (e) {
        e.preventDefault();

        const $enlace = $(this);
        const accion = $enlace.parent().attr('id');

        if (accion === 'anteriorPagina' && paginaActual > 1) {
            paginaActual--;
            actualizarTablaEmpleados();
        } else if (accion === 'siguientePagina' && paginaActual < Math.ceil(($('#buscadorEmpleados').val().trim() !== '' ? empleadosFiltrados.length : empleados.length) / empleadosPorPagina)) {
            paginaActual++;
            actualizarTablaEmpleados();
        } else if ($enlace.data('pagina')) {
            paginaActual = parseInt($enlace.data('pagina'));
            actualizarTablaEmpleados();
        }
    });

    // Evento para el buscador
    $('#buscadorEmpleados').on('input', function () {
        const termino = $(this).val().toLowerCase();
        
        // Mostrar u ocultar el botón de limpiar
        if (termino.length > 0) {
            $('#limpiarBuscador').show();
        } else {
            $('#limpiarBuscador').hide();
        }

        // Filtrar empleados
        empleadosFiltrados = empleados.filter(empleado => {
            const nombreCompleto = `${empleado.nombre} ${empleado.ap_paterno || ''} ${empleado.ap_materno || ''}`.toLowerCase();
            const clave = empleado.clave_empleado.toString().toLowerCase();

            return nombreCompleto.includes(termino) || clave.includes(termino);
        });

        // Volver a la primera página al buscar
        paginaActual = 1;

        // Actualizar la tabla
        actualizarTablaEmpleados();
    });
    
    // Evento para limpiar el buscador
    $('#limpiarBuscador').click(function () {
        $('#buscadorEmpleados').val('');
        $('#limpiarBuscador').hide();
        empleadosFiltrados = [];
        paginaActual = 1;
        actualizarTablaEmpleados();
    });

    // Evento para limpiar fotos huérfanas
    $('#limpiarFotos').click(function () {
        // Mostrar modal de confirmación personalizado
        mostrarConfirmacionLimpiar();
    });

    // Evento para generar gafetes
    $('#generarGafetes').click(function () {
        // Verificar si hay empleados seleccionados en el set
        if (empleadosSeleccionados.size === 0) {
            mostrarAlertaGafete('Por favor, seleccione al menos un empleado para generar el gafete.', 'warning');
            return;
        }
        
        // ACTUALIZACIÓN: Refrescar datos de empleados seleccionados antes de generar gafetes
        // para asegurar que se usen los datos más recientes
        refrescarDatosEmpleadosSeleccionados();
        
        // Mostrar solo la lista de empleados seleccionados en el modal
        mostrarListaEmpleadosSeleccionados();
    });

    // Evento para ordenar por columna Clave
    $(document).on('click', '#sortClave', function() {
        // Cambiar el orden actual
        ordenClave = ordenClave === 'asc' ? 'desc' : 'asc';
        
        // Actualizar los atributos de ordenación
        $('#sortClave')
            .removeAttr('data-sort-asc data-sort-desc')
            .attr(`data-sort-${ordenClave}`, '');
        
        // Volver a cargar la tabla con el nuevo orden
        actualizarTablaEmpleados();
    });
    
    // Establecer el orden inicial
    $('#sortClave').attr('data-sort-asc', '');

    // Evento para manejar la selección/deselección de empleados individuales
    $(document).on('change', '.empleado-checkbox', function () {
        const idEmpleado = $(this).val(); // Usamos value en lugar de data-id
        if ($(this).is(':checked')) {
            empleadosSeleccionados.add(idEmpleado);

        } else {
            empleadosSeleccionados.delete(idEmpleado);

        }
        window.empleadosSeleccionados = empleadosSeleccionados;
        actualizarContadorSeleccionados();
    });
    
    // Evento para manejar la selección/deselección de fotos individuales
    $(document).on('change', '.foto-checkbox', function () {
        const idEmpleado = $(this).val();
        window.fotoInclusion[idEmpleado] = $(this).is(':checked');
    });
    
    // Evento para manejar el cambio de orden de nombre
    $(document).on('change', '.orden-nombre-select', function () {
        const idEmpleado = $(this).val();
        const orden = $(this).find('option:selected').data('orden');
        window.ordenNombre[idEmpleado] = orden;
    });
    
    // Evento para manejar el cambio del toggle IMSS
    $(document).on('change', '.imss-toggle', function () {
        const idEmpleado = $(this).data('empleado-id');
        const isChecked = $(this).is(':checked');
        
        // Guardar el estado del toggle
        window.imssToggleState[idEmpleado] = isChecked;
        
        // Guardar en localStorage para persistencia
        guardarEstadoToggleIMSS();
        
        // Actualizar el texto del label
        const $label = $(this).siblings('label').find('.toggle-text');
        $label.text(isChecked ? 'Con IMSS' : 'Sin IMSS');
    });

    // Evento para editar empleado
    $(document).on('click', '.btn-editar', function () {
        const idEmpleado = $(this).data('id');
        const claveEmpleado = $(this).data('clave');
        
        // Llamar a la función para abrir el modal de edición
        abrirModalEditarEmpleado(idEmpleado, claveEmpleado);
    });

    // Evento para imprimir gafetes
    $('#imprimirGafetes').click(function () {
        
        // Verificar que hay empleados seleccionados
        if (!empleadosSeleccionados || empleadosSeleccionados.size === 0) {
            alert('Por favor selecciona al menos un empleado para imprimir');
            return;
        }
        
        // Cerrar el modal si está abierto
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalGafetes'));
        if (modalInstance) {
            modalInstance.hide();
        }
        
        // Esperar un poco para que el modal se cierre completamente
        setTimeout(() => {
            
            // Limpiar el contenido antes de generar
            $('#contenidoGafetes').empty();
            
            // Generar los gafetes directamente para impresión
            generarGafetesParaImpresion();
            
        }, 300);
    });
    
    // Nueva función específica para generar gafetes para impresión
    function generarGafetesParaImpresion() {
        // IMPORTANTE: Primero actualizar las fechas de vigencia
        actualizarFechasGafetes().then(function() {
            // Una vez actualizadas las fechas, obtener datos frescos de los empleados
            obtenerDatosFrescosParaImpresion();
        }).catch(function(error) {
            console.error('Error al actualizar fechas, continuando con impresión:', error);
            // Aún con error, intentar generar los gafetes
            obtenerDatosFrescosParaImpresion();
        });
    }
    
    // Función auxiliar para obtener datos frescos para impresión
    function obtenerDatosFrescosParaImpresion() {
        // Obtener datos frescos de los empleados antes de generar los gafetes
        $.ajax({
            url: 'php/obtenerEmpleados.php',
            type: 'GET',
            dataType: 'json',
            success: function(empleadosFrescos) {
                // Crear un mapa para acceso rápido a los datos frescos
                const mapaEmpleadosFrescos = {};
                empleadosFrescos.forEach(emp => {
                    mapaEmpleadosFrescos[emp.id_empleado] = emp;
                });
                
                // Actualizar la caché con los datos frescos
                const idsUnicos = [...new Set(Array.from(empleadosSeleccionados))];
                idsUnicos.forEach(id => {
                    const empleadoCache = todosLosEmpleados.find(e => e && e.id_empleado == id);
                    const empleadoFresco = mapaEmpleadosFrescos[id];
                    
                    if (empleadoFresco) {
                        if (empleadoCache) {
                            Object.assign(empleadoCache, empleadoFresco);
                        } else {
                            todosLosEmpleados.push(empleadoFresco);
                        }
                    }
                });
                
                // Generar los gafetes con datos actualizados
                generarGafetesConDatosActualizados(true); // true = modo impresión
                
                // Esperar a que se genere el contenido y luego imprimir
                setTimeout(() => {
                    procesarImpresion();
                }, 500);
            },
            error: function(xhr, status, error) {
                console.error('Error al obtener empleados:', error);
                // En caso de error, continuar con los datos existentes
                generarGafetesConDatosActualizados(true);
                setTimeout(() => {
                    procesarImpresion();
                }, 500);
            }
        });
    }
    
    // Función para procesar la impresión
    function procesarImpresion() {
        // Obtener solo el contenido de los gafetes
        const contenidoGafetes = $('#contenidoGafetes').html();
        
        if (!contenidoGafetes || contenidoGafetes.trim() === '') {
            alert('Error: No se pudo generar el contenido de los gafetes');
            return;
        }
        
        // Verificar que el contenido contiene gafetes y no solo texto
        if (!contenidoGafetes.includes('gafete') && !contenidoGafetes.includes('gafetes-pagina')) {
            alert('Error: El contenido generado no contiene gafetes válidos');
            return;
        }
        
        // Crear una nueva ventana solo para imprimir
        const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
        
        if (!ventanaImpresion) {
            alert('No se pudo abrir la ventana de impresión. Verifique que no esté bloqueando ventanas emergentes.');
            return;
        }
        
        // Crear el HTML completo para la ventana de impresión
        const htmlImpresion = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Gafetes - Impresión</title>
                <style>
                    @page {
                        size: A4;
                        margin: 1cm;
                    }
                    
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                        background: white;
                        font-size: 7pt;
                    }
                    
                    .gafetes-container {
                        display: grid;
                        grid-template-columns: repeat(3, 6.5cm);
                        justify-content: start;
                        /* gap: 0.5cm; */
                        width: 100%;
                        page-break-inside: avoid;
                        margin: 0;
                        padding: 0;
                    }
                    
                    .gafetes-pagina-sin-imss {
                        display: grid !important;
                        grid-template-columns: repeat(3, 6cm) !important;
                        grid-template-rows: repeat(2, auto) !important;
                        justify-content: center !important;
                        align-items: start !important;
                        gap: 0.5cm !important;
                        width: 100% !important;
                        page-break-inside: avoid;
                        margin: 0;
                        padding: 0;
                    }
                    
                    .gafetes-pagina-mixta {
                        display: grid !important;
                        grid-template-columns: repeat(3, 6cm) !important;
                        grid-template-rows: repeat(2, auto) !important;
                        justify-content: center !important;
                        align-items: start !important;
                        gap: 0.5cm !important;
                        width: 100% !important;
                        page-break-inside: avoid;
                        margin: 0;
                        padding: 0;
                    }
                    
                    .gafete {
                        width: 6.5cm !important;
                        min-width: 6.5cm !important;
                        max-width: 6.5cm !important;
                        height: 11cm !important;
                        min-height: 11cm !important;
                        max-height: 11cm !important;
                        margin-right: 0.5cm;
                        margin-bottom: 0.5cm;
                        margin-left: 0;
                        margin-top: 0;
                        box-shadow: 0 0 5px rgba(0,0,0,0.1);
                        border: 2px solid #06320c !important;
                        page-break-inside: avoid;
                        break-inside: avoid;
                        background: white;
                        padding: 0.1cm 0.4cm 0.4cm 0.4cm !important;
                        display: flex;
                        flex-direction: column;
                        box-sizing: border-box;
                        font-size: 7pt !important;
                    }
                    
                    .gafetes-container .gafete:nth-child(3n) {
                        margin-right: 0;
                    }
                    
                    .gafete * {
                        box-sizing: border-box;
                        font-size: 7pt !important;
                        text-align: center !important;
                        margin-bottom: 0.2em !important;
                    }
                    
                    /* Respetar los tamaños de fuente inline del contenido */
                    .gafete [style*="font-size"] {
                        font-size: inherit !important;
                    }
                    
                    /* Estilos específicos para el contenido del gafete */
                    .gafete .gafete-body {
                        font-size: 7pt !important;
                    }
                    
                    .gafete .gafete-body [style*="font-size:8pt"] {
                        font-size: 8pt !important;
                    }
                    
                    .gafete .gafete-body [style*="font-size:7pt"] {
                        font-size: 7pt !important;
                    }
                    
                    .gafete .gafete-body [style*="font-size:6pt"] {
                        font-size: 6pt !important;
                    }
                    
                    .gafete .gafete-body [style*="font-size:5pt"] {
                        font-size: 5pt !important;
                    }
                    
                    /* Estilos específicos para párrafos y divs en el gafete */
                    .gafete .gafete-body p {
                        font-size: 8pt !important;
                    }
                    
                    .gafete .gafete-body div {
                        font-size: 7pt !important;
                    }
                    
                    .gafete .gafete-body span {
                        font-size: inherit !important;
                    }
                    
                    .gafete .gafete-sello {
                        font-size: 5pt !important;
                    }
                    
                    .gafete .gafete-nombre-rect div {
                        font-size: 8pt !important;
                    }
                    
                    .gafete img {
                        max-width: 100%;
                        height: auto;
                        object-fit: contain;
                    }
                    
                    .marco-foto {
                        width: 2.8cm !important;
                        height: 3.3cm !important;
                        border: 1px solid #000 !important;
                        border-radius: 0 !important;
                        overflow: hidden;
                    }
                    
                    .page-break {
                        page-break-after: always;
                        break-after: page;
                        width: 100%;
                        height: 0;
                        margin: 0;
                        padding: 0;
                    }
                    
                    h4 {
                        text-align: center;
                        margin: 1cm 0;
                        font-size: 16pt;
                        font-weight: bold;
                    }
                    
                    @media print {
                        * {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        
                        body {
                            font-size: 12pt;
                        }
                        
                        .gafete {
                            width: 6.5cm !important;
                            min-width: 6.5cm !important;
                            max-width: 6.5cm !important;
                            height: 11cm !important;
                            min-height: 11cm !important;
                            max-height: 11cm !important;
                            margin-right: 0.5cm;
                            margin-bottom: 0.5cm;
                            margin-left: 0;
                            margin-top: 0;
                            font-size: 7pt !important;
                            padding: 0.1cm 0.4cm 0.4cm 0.4cm !important;
                        }
                        
                        .gafetes-container .gafete:nth-child(3n) {
                            margin-right: 0;
                        }
                        
                        .gafete .gafete-body {
                            font-size: 7pt !important;
                        }
                        
                        .gafete .gafete-body [style*="font-size:8pt"] {
                            font-size: 8pt !important;
                        }
                        
                        .gafete .gafete-body [style*="font-size:7pt"] {
                            font-size: 7pt !important;
                        }
                        
                        .gafete .gafete-body [style*="font-size:6pt"] {
                            font-size: 6pt !important;
                        }
                        
                        .gafete .gafete-body [style*="font-size:5pt"] {
                            font-size: 5pt !important;
                        }
                        
                        /* Estilos específicos para párrafos y divs en el gafete */
                        .gafete .gafete-body p {
                            font-size: 8pt !important;
                        }
                        
                        .gafete .gafete-body div {
                            font-size: 7pt !important;
                        }
                        
                        .gafete .gafete-body span {
                            font-size: inherit !important;
                        }
                        
                        .gafete .gafete-sello {
                            font-size: 5pt !important;
                        }
                        
                        .gafete .gafete-nombre-rect div {
                            font-size: 8pt !important;
                        }
                        
                        .gafetes-container {
                            display: grid;
                            grid-template-columns: repeat(3, 6.5cm);
                            justify-content: start;
                            /* gap: 0.5cm; */
                        }
                        
                        .gafetes-pagina-sin-imss {
                            display: grid !important;
                            grid-template-columns: repeat(3, 6cm) !important;
                            grid-template-rows: repeat(2, auto) !important;
                            justify-content: center !important;
                            align-items: start !important;
                            gap: 0.5cm !important;
                            width: 100% !important;
                            page-break-inside: avoid;
                            margin: 0;
                            padding: 0;
                        }
                        
                        .gafetes-pagina-mixta {
                            display: grid !important;
                            grid-template-columns: repeat(3, 6cm) !important;
                            grid-template-rows: repeat(2, auto) !important;
                            justify-content: center !important;
                            align-items: start !important;
                            gap: 0.5cm !important;
                            width: 100% !important;
                            page-break-inside: avoid;
                            margin: 0;
                            padding: 0;
                        }
                        .gafete-atras, .gafete-atras * {
                            font-size: 14pt !important;
                            margin-bottom: 0.4em !important;
                        }
                        .gafetes-container-atras {
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: flex-end;
                            /* gap: 0.5cm; */
                            width: 100%;
                            page-break-inside: avoid;
                            margin: 0;
                            padding: 0;
                        }
                        .nombre-gafete-frente {
                            color: #06320c;
                        }
                        .nombre-gafete-frente,
                        .dato-gafete-frente {
                            font-size: 14pt !important;
                            font-weight: bold !important;
                            text-align: left !important;
                            display: inline-block;
                        }
                        .gafete-body > div {
                            text-align: left !important;
                        }
                        #nombre-rect-print {
                            font-size: 14pt !important;
                            width: 100% !important;
                            margin-left: 0 !important;
                            margin-right: 0 !important;
                            left: 0 !important;
                            right: 0 !important;
                            box-sizing: border-box !important;
                        }
                        .gafete-nombre-rect {
                            position: relative !important;
                        }
                    }
                </style>
            </head>
            <body>
                ${contenidoGafetes}
                <script>
                    window.onload = function() {
                        window.print();
                        // Cerrar la ventana después de imprimir (soporte cruzado)
                        window.onafterprint = function() {
                            window.close();
                        };
                        // Respaldo: cerrar la ventana después de 0.5 segundos
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        // Escribir el contenido en la nueva ventana
        ventanaImpresion.document.write(htmlImpresion);
        ventanaImpresion.document.close();
    }

    // Función para cargar departamentos
    function cargarDepartamentos() {
        $.ajax({
            url: '../public/php/obtenerDepartamentos.php',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                departamentos = data;
                const $lista = $('#listaDepartamentos');

                // Limpiar la lista (excepto el primer elemento "Todos")
                $lista.find('a:not(:first)').remove();

                // Agregar departamentos a la lista
                data.forEach(depto => {
                    $lista.append(`
                        <a href="#" class="list-group-item list-group-item-action" 
                           data-departamento="${depto.id_departamento}">
                            <i class="bi bi-building me-2"></i>${depto.nombre_departamento}
                        </a>
                    `);
                });

                // Evento para filtrar empleados por departamento
                $lista.find('a').click(function (e) {
                    e.preventDefault();
                    const idDepartamento = $(this).data('departamento');
                    $lista.find('a').removeClass('active');
                    $(this).addClass('active');
                    cargarEmpleadosPorDepartamento(idDepartamento);
                });
            },
            error: function (xhr, status, error) {
               
                
                let errorMessage = 'Error al cargar los departamentos. ';
                if (xhr.responseText) {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        errorMessage += errorData.error || '';
                    } catch (e) {
                        errorMessage += 'Detalles técnicos: ' + xhr.responseText;
                    }
                } else {
                    errorMessage += 'Por favor, intente nuevamente.';
                }
                
                alert(errorMessage);
            }
        });
    }

    // Función para cargar empleados por departamento
    function cargarEmpleadosPorDepartamento(idDepartamento, esCargaGlobal = false) {
        let url = 'php/obtenerEmpleados.php';
        const data = {};

        if (idDepartamento !== 'todos') {
            data.id_departamento = idDepartamento;
        }

        $.ajax({
            url: url,
            type: 'GET',
            data: data,
            dataType: 'json',
            success: function (data) {
                // Si es una carga global, actualizar todosLosEmpleados
                if (esCargaGlobal) {
                    todosLosEmpleados = data; // Guardar todos los empleados globalmente
                    window.todosLosEmpleados = todosLosEmpleados; // Actualizar variable global
                    // También actualizar el array empleados para mantener consistencia
                    empleados = data;
                } else {
                    // Si no es carga global, solo actualizar el array empleados
                    empleados = data;
                }
                actualizarTablaEmpleados();
            },
            error: function (xhr, status, error) {
              
                alert('Error al cargar los empleados. Por favor, intente nuevamente.');
            }
        });
    }

    // Función para actualizar la tabla de empleados con paginación
    function actualizarTablaEmpleados() {
        // Si hay un término de búsqueda, usar empleadosFiltrados, de lo contrario usar todos los empleados
        const empleadosAMostrar = $('#buscadorEmpleados').val().trim() !== '' ? empleadosFiltrados : empleados;
        const totalEmpleados = empleadosAMostrar.length;
        const totalPaginas = Math.ceil(totalEmpleados / empleadosPorPagina);

        // Asegurarse de que la página actual sea válida
        if (paginaActual > totalPaginas && totalPaginas > 0) {
            paginaActual = totalPaginas;
        } else if (paginaActual < 1) {
            paginaActual = 1;
        }

        // Calcular índices para la paginación
        const inicio = (paginaActual - 1) * empleadosPorPagina;
        const fin = Math.min(inicio + empleadosPorPagina, totalEmpleados);

        // Actualizar información de paginación
        $('#inicio').text(totalEmpleados === 0 ? 0 : inicio + 1);
        $('#fin').text(fin);
        $('#total').text(totalEmpleados);

        // Actualizar controles de paginación
        actualizarControlesPaginacion(totalPaginas);

        // Limpiar tabla
        const $cuerpo = $('#cuerpoTabla');
        $cuerpo.empty();

        if (totalEmpleados === 0) {
            $cuerpo.append('<tr><td colspan="10" class="text-center">No se encontraron empleados</td></tr>');
            return;
        }

        // Ordenar empleados por clave numéricamente según el orden actual
        const empleadosOrdenados = [...empleadosAMostrar].sort((a, b) => {
            // Convertir a números para comparación numérica
            const claveA = parseInt(a.clave_empleado) || 0;
            const claveB = parseInt(b.clave_empleado) || 0;
            
            // Aplicar el orden actual (ascendente o descendente)
            return ordenClave === 'asc' ? claveA - claveB : claveB - claveA;
        });

        // Mostrar solo los empleados de la página actual
        for (let i = inicio; i < fin; i++) {
            const empleado = empleadosOrdenados[i];
            const estaSeleccionado = empleadosSeleccionados.has(empleado.id_empleado);
            // Verificar si la foto debe estar seleccionada según la preferencia del usuario
            const fotoSeleccionada = window.fotoInclusion[empleado.id_empleado] || false;
            
            // Determinar el estado del gafete
            let estadoGafete = 'Sin fecha';
            if (empleado.fecha_vigencia) {
                const fechaVigencia = new Date(empleado.fecha_vigencia);
                const hoy = new Date();
                // Resetear horas para comparar solo fechas
                fechaVigencia.setHours(0, 0, 0, 0);
                hoy.setHours(0, 0, 0, 0);
                
                if (fechaVigencia >= hoy) {
                    estadoGafete = 'Vigente';
                } else {
                    estadoGafete = 'Expirado';
                }
            }
            
            // Determinar si el empleado tiene IMSS
            const tieneIMSS = empleado.imss && empleado.imss !== 'N/A' && empleado.imss.trim() !== '';
            
            // Inicializar el estado del toggle si no existe (basado en si tiene IMSS)
            // Solo inicializar si no hay estado guardado previamente
            if (window.imssToggleState[empleado.id_empleado] === undefined) {
                window.imssToggleState[empleado.id_empleado] = tieneIMSS;
                // Guardar el estado inicial
                guardarEstadoToggleIMSS();
            }
            
            // Obtener el estado actual del toggle
            const toggleIMSS = window.imssToggleState[empleado.id_empleado];
            
            // Obtener el orden de nombre seleccionado para este empleado (por defecto: nombre primero)
            const ordenSeleccionado = window.ordenNombre[empleado.id_empleado] || 'nombre-primero';
            
            $cuerpo.append(`
                <tr>
                    <td>${empleado.clave_empleado}</td>
                    <td>${empleado.nombre} ${empleado.ap_paterno || ''} ${empleado.ap_materno || ''}</td>
                    <td>${obtenerNombreDepartamento(empleado.id_departamento)}</td>
                    <td>${empleado.nombre_area || 'Sin asignar'}</td>
                    <td class="text-center">
                        <span class="badge ${estadoGafete === 'Vigente' ? 'bg-success' : estadoGafete === 'Expirado' ? 'bg-danger' : 'bg-secondary'}">
                            ${estadoGafete}
                        </span>
                    </td>
                    <td class="text-center">
                        <div class="form-check form-switch d-flex justify-content-center">
                            <input class="form-check-input imss-toggle" type="checkbox" 
                                   id="imss_toggle_${empleado.id_empleado}" 
                                   data-empleado-id="${empleado.id_empleado}"
                                   ${toggleIMSS ? 'checked' : ''}>
                            <label class="form-check-label ms-2 small" for="imss_toggle_${empleado.id_empleado}">
                                <span class="toggle-text">${toggleIMSS ? 'Con IMSS' : 'Sin IMSS'}</span>
                            </label>
                        </div>
                    </td>
                    <td class="text-center">
                        <select class="form-select form-select-sm orden-nombre-select" value="${empleado.id_empleado}">
                            <option value="${empleado.id_empleado}" data-orden="nombre-primero" ${ordenSeleccionado === 'nombre-primero' ? 'selected' : ''}>
                                Nombre + Apellidos
                            </option>
                            <option value="${empleado.id_empleado}" data-orden="apellido-primero" ${ordenSeleccionado === 'apellido-primero' ? 'selected' : ''}>
                                Apellidos + Nombre
                            </option>
                        </select>
                    </td>
                    <td class="text-center">
                        <input type="checkbox" class="form-check-input empleado-checkbox" 
                               data-id="${empleado.id_empleado}" value="${empleado.id_empleado}" 
                               ${estaSeleccionado ? 'checked' : ''}>
                    </td>
                    <td class="text-center">
                        <input type="checkbox" class="form-check-input foto-checkbox" 
                               data-id="${empleado.id_empleado}" value="${empleado.id_empleado}" 
                               ${fotoSeleccionada ? 'checked' : ''}>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary btn-editar" 
                                data-id="${empleado.id_empleado}" 
                                data-clave="${empleado.clave_empleado}" 
                                title="Editar información del empleado">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                    </td>
                </tr>
            `);
        }
    }

    // Función para obtener el nombre del departamento por su ID
    function obtenerNombreDepartamento(idDepartamento) {
        if (!idDepartamento) return 'Sin asignar';

        const depto = departamentos.find(d => d.id_departamento == idDepartamento);
        return depto ? depto.nombre_departamento : 'Desconocido';
    }

    // Función para obtener el color del área del empleado
    function obtenerColorArea(empleado) {
        if (!empleado.nombre_area) return '#06320c'; // Color por defecto
        
        // Usar el nombre del área tal como viene de la base de datos (con la primera letra mayúscula)
        const area = empleado.nombre_area;
        
        switch (area) {
            case 'Empaque':
                return 'rgb(0, 77, 23)'; // COLOR CITRICOS SAAO
            case 'Rancho Relicario':
                return 'rgb(181, 6, 0)'; // COLOR RANCHO EL RELICARIO
            case 'Rancho Pilar':
                return 'rgb(194, 158, 240)'; // Lila claro
            case 'Rancho Huasteca':
                return 'rgb(50, 186, 91)'; // RANCHO LA HUASTECA
            default:
                return 'rgb(0, 77, 23)'; // COLOR CITRICOS SAAO por defecto
        }
    }

    // Función para obtener el color del texto de los datos por área
    function obtenerColorTextoDatos(empleado) {
        if (!empleado.nombre_area) return '#06320c'; // Color por defecto
        
        // Usar el nombre del área tal como viene de la base de datos (con la primera letra mayúscula)
        const area = empleado.nombre_area;
        
        switch (area) {
            case 'Empaque':
                return '#053010'; // COLOR ESPECÍFICO PARA EMPAQUE
            case 'Rancho Relicario':
                return '#540000'; // COLOR RANCHO EL RELICARIO
            case 'Rancho Pilar':
                return '#140329'; // Lila claro
            case 'Rancho Huasteca':
                return '#0B3617'; // RANCHO LA HUASTECA
            default:
                return '#06320c'; // COLOR CITRICOS SAAO por defecto
        }
    }

    // Función para actualizar el contador de empleados seleccionados
    function actualizarContadorSeleccionados() {
        const total = empleadosSeleccionados.size;
        const $boton = $('#generarGafetes');

        if (total > 0) {
            // Solo cambiar color del botón cuando hay empleados seleccionados
            $boton.removeClass('btn-warning').addClass('btn-success');
        } else {
            // Volver al color original cuando no hay empleados seleccionados
            $boton.removeClass('btn-success').addClass('btn-warning');
        }
    }
    
    // Función para refrescar los datos de los empleados seleccionados
    function refrescarDatosEmpleadosSeleccionados() {
        // Esta función asegura que los datos de los empleados seleccionados estén actualizados
        // antes de generar los gafetes
        
        // Hacer una llamada AJAX para obtener los datos más recientes de los empleados seleccionados
        const idsSeleccionados = Array.from(empleadosSeleccionados);
        
        if (idsSeleccionados.length > 0) {
            // Actualizar los datos de todos los empleados seleccionados con información fresca
            $.ajax({
                url: 'php/obtenerEmpleados.php',
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                    // Actualizar la cache con los datos más recientes
                    todosLosEmpleados = data;
                    window.todosLosEmpleados = todosLosEmpleados;
                    
                    // También actualizar el array empleados para mantener consistencia
                    // (esto afecta la tabla actual)
                    empleados = data;
                    
                    // Si hay un término de búsqueda activo, actualizar empleadosFiltrados también
                    if ($('#buscadorEmpleados').val().trim() !== '') {
                        const termino = $('#buscadorEmpleados').val().toLowerCase();
                        empleadosFiltrados = empleados.filter(empleado => {
                            const nombreCompleto = `${empleado.nombre} ${empleado.ap_paterno || ''} ${empleado.ap_materno || ''}`.toLowerCase();
                            const clave = empleado.clave_empleado.toString().toLowerCase();
                            return nombreCompleto.includes(termino) || clave.includes(termino);
                        });
                    }
                },
                error: function(xhr, status, error) {
                    // En caso de error, continuar con los datos existentes
                }
            });
        }
    }

    // Función para mostrar la lista de empleados seleccionados en el modal
    function mostrarListaEmpleadosSeleccionados() {
        const $contenido = $('#contenidoGafetes');
        $contenido.empty();
        const idsUnicos = [...new Set(Array.from(empleadosSeleccionados))];
        if (idsUnicos.length === 0) {
            $contenido.html('<p class="text-center">No hay empleados seleccionados</p>');
            return;
        }
        // Tabla con diseño moderno y bonito
        let html = `
        <div class="d-flex flex-column align-items-center w-100">
            <h4 class="mb-4" style="font-weight:700;color:#219653;letter-spacing:1px;">Empleados seleccionados para generar gafete</h4>
            <div class="table-responsive w-100" style="max-width:700px;">
                <table class="table table-hover align-middle shadow-sm" style="border-radius:16px;overflow:hidden;background:#fff;">
                    <thead style="background:linear-gradient(90deg,#27ae60 0%,#219653 100%);color:#fff;">
                        <tr>
                            <th style="border-top-left-radius:12px;">#</th>
                            <th>Clave</th>
                            <th>Nombre</th>
                            <th>Departamento</th>
                            <th style="border-top-right-radius:12px;">Área</th>
                        </tr>
                    </thead>
                    <tbody>`;
        idsUnicos.forEach((idEmpleado, idx) => {
            const empleado = todosLosEmpleados.find(e => e.id_empleado == idEmpleado); // <-- CAMBIO: buscar en todosLosEmpleados
            if (!empleado) return;
            const nombreCompleto = `${empleado.nombre} ${empleado.ap_paterno || ''} ${empleado.ap_materno || ''}`.trim();
            const departamento = obtenerNombreDepartamento(empleado.id_departamento);
            html += `<tr style="transition:background 0.2s;">
                        <td style="font-weight:600;color:#219653;">${idx + 1}</td>
                        <td style="font-weight:500;">${empleado.clave_empleado}</td>
                        <td>${nombreCompleto}</td>
                        <td>${departamento}</td>
                        <td>${empleado.nombre_area || 'Sin asignar'}</td>
                    </tr>`;
        });
        html += `</tbody></table></div></div>`;
        $contenido.html(html);
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('modalGafetes'));
        modal.show();
    }

    // Función para mostrar los gafetes en el modal o para impresión (estructura y diseño original)
    function mostrarGafetes(modoImpresion = false) {
        // Actualizar las fechas de creación y vigencia para los empleados seleccionados
        // IMPORTANTE: Esperar a que las fechas se actualicen antes de continuar
        actualizarFechasGafetes().then(function() {
            // Una vez actualizadas las fechas, obtener datos frescos de los empleados
            obtenerDatosFrescosYGenerarGafetes(modoImpresion);
        }).catch(function(error) {
            console.error('Error al actualizar fechas, continuando con generación:', error);
            // Aún con error, intentar generar los gafetes
            obtenerDatosFrescosYGenerarGafetes(modoImpresion);
        });
    }
    
    // Función auxiliar para obtener datos frescos y generar gafetes
    function obtenerDatosFrescosYGenerarGafetes(modoImpresion) {
        // Obtener datos frescos de los empleados antes de generar los gafetes
        $.ajax({
            url: 'php/obtenerEmpleados.php',
            type: 'GET',
            dataType: 'json',
            success: function(empleadosFrescos) {
                // Crear un mapa para acceso rápido a los datos frescos
                const mapaEmpleadosFrescos = {};
                empleadosFrescos.forEach(emp => {
                    mapaEmpleadosFrescos[emp.id_empleado] = emp;
                });
                
                // Combinar datos frescos con datos en cache
                // (preservar datos de empleados no devueltos por la consulta)
                const idsUnicos = [...new Set(Array.from(empleadosSeleccionados))];
                idsUnicos.forEach(id => {
                    const empleadoCache = todosLosEmpleados.find(e => e.id_empleado == id);
                    const empleadoFresco = mapaEmpleadosFrescos[id];
                    
                    if (empleadoFresco && empleadoCache) {
                        // Actualizar campos que pueden haber cambiado
                        empleadoCache.id_area = empleadoFresco.id_area;
                        empleadoCache.nombre_area = empleadoFresco.nombre_area;
                        empleadoCache.id_empresa = empleadoFresco.id_empresa;
                        empleadoCache.nombre_empresa = empleadoFresco.nombre_empresa;
                        // Agregar otros campos que puedan cambiar
                        empleadoCache.imss = empleadoFresco.imss;
                        empleadoCache.curp = empleadoFresco.curp;
                        empleadoCache.sexo = empleadoFresco.sexo;
                        empleadoCache.fecha_nacimiento = empleadoFresco.fecha_nacimiento;
                        empleadoCache.fecha_ingreso = empleadoFresco.fecha_ingreso;
                        empleadoCache.fecha_creacion = empleadoFresco.fecha_creacion;
                        empleadoCache.fecha_vigencia = empleadoFresco.fecha_vigencia;
                        empleadoCache.domicilio = empleadoFresco.domicilio;
                        empleadoCache.enfermedades_alergias = empleadoFresco.enfermedades_alergias;
                        empleadoCache.grupo_sanguineo = empleadoFresco.grupo_sanguineo;
                        empleadoCache.num_casillero = empleadoFresco.num_casillero;
                        empleadoCache.ruta_foto = empleadoFresco.ruta_foto;
                        empleadoCache.id_departamento = empleadoFresco.id_departamento;
                        empleadoCache.nombre_departamento = empleadoFresco.nombre_departamento;
                        // Datos de emergencia
                        empleadoCache.emergencia_parentesco = empleadoFresco.emergencia_parentesco;
                        empleadoCache.emergencia_nombre_contacto = empleadoFresco.emergencia_nombre_contacto;
                        empleadoCache.emergencia_telefono = empleadoFresco.emergencia_telefono;
                        empleadoCache.emergencia_domicilio = empleadoFresco.emergencia_domicilio;
                    } else if (empleadoFresco && !empleadoCache) {
                        // Si el empleado no estaba en cache, agregarlo
                        todosLosEmpleados.push(empleadoFresco);
                    }
                });
                
                // Ahora generar los gafetes con datos actualizados
                generarGafetesConDatosActualizados(modoImpresion);
            },
            error: function(xhr, status, error) {
                // En caso de error, continuar con los datos existentes
                generarGafetesConDatosActualizados(modoImpresion);
            }
        });
    }
    
    // Función auxiliar para generar gafetes con datos ya actualizados
    function generarGafetesConDatosActualizados(modoImpresion = false) {
        const $contenido = $('#contenidoGafetes');
        $contenido.empty();
        const idsUnicos = [...new Set(Array.from(empleadosSeleccionados))];
        if (idsUnicos.length === 0) {
            $contenido.html('<p class="text-center">No hay empleados seleccionados</p>');
            return;
        }
        // Ordenar idsUnicos por nombre completo para consistencia
        idsUnicos.sort((a, b) => {
            const empA = todosLosEmpleados.find(e => e.id_empleado == a); // <-- CAMBIO: buscar en todosLosEmpleados
            const empB = todosLosEmpleados.find(e => e.id_empleado == b);
            if (!empA || !empB) return 0;
            const nombreA = `${empA.nombre} ${empA.ap_paterno || ''} ${empA.ap_materno || ''}`.trim().toLowerCase();
            const nombreB = `${empB.nombre} ${empB.ap_paterno || ''} ${empB.ap_materno || ''}`.trim().toLowerCase();
            return nombreA.localeCompare(nombreB);
        });
        // Determinar qué empleados tienen IMSS y cuáles no
        const empleadosConIMSS = [];
        const empleadosSinIMSS = [];
        
        idsUnicos.forEach(idEmpleado => {
            const empleado = todosLosEmpleados.find(e => e.id_empleado == idEmpleado);
            if (empleado) {
                // Usar el estado del toggle en lugar de verificar el campo IMSS
                // Si no hay estado guardado, usar el valor del campo IMSS como predeterminado
                const tieneIMSSToggle = window.imssToggleState[idEmpleado] !== undefined ? 
                    window.imssToggleState[idEmpleado] : 
                    (empleado.imss && empleado.imss !== 'N/A' && empleado.imss.trim() !== '');
                
                if (tieneIMSSToggle) {
                    empleadosConIMSS.push(idEmpleado);
                } else {
                    empleadosSinIMSS.push(idEmpleado);
                }
            }
        });
        
        // Verificar si hay mezcla de tipos
        const hayMezcla = empleadosConIMSS.length > 0 && empleadosSinIMSS.length > 0;
        
        if (hayMezcla) {
            // Lógica para mezclar gafetes con y sin IMSS en la misma página
            procesarGafetesMezclados(empleadosConIMSS, empleadosSinIMSS, $contenido);
        } else {
            // Lógica original para un solo tipo
            if (empleadosConIMSS.length > 0) {
                // Solo empleados con IMSS (3 por página)
                const columnas = 3;
                for (let i = 0; i < empleadosConIMSS.length; i += columnas) {
                    const grupo = empleadosConIMSS.slice(i, i + columnas);
                    const $pagina = $('<div class="gafetes-pagina" style="width:100%;display:grid;grid-template-columns:repeat(3,6cm);justify-content:center;align-items:start;gap:0.5cm;page-break-after:always;min-height:20cm;"></div>');
                    generarGafetesEnPagina(grupo, $pagina, true);
                    $contenido.append($pagina);
                }
            }
            
            if (empleadosSinIMSS.length > 0) {
                // Solo empleados sin IMSS (6 por página)
                const gafetesPorPagina = 6;
                for (let i = 0; i < empleadosSinIMSS.length; i += gafetesPorPagina) {
                    const grupo = empleadosSinIMSS.slice(i, i + gafetesPorPagina);
                    const $pagina = $('<div class="gafetes-pagina-sin-imss" style="width:100%;display:grid;grid-template-columns:repeat(3,6cm);grid-template-rows:repeat(2,auto);justify-content:center;align-items:start;gap:0.5cm;page-break-after:always;min-height:20cm;"></div>');
                    generarGafetesEnPagina(grupo, $pagina, false);
                    $contenido.append($pagina);
                }
            }
        }
        
        // Llamar a la función para continuar con el resto de la lógica
        continuarGeneracionGafetes(modoImpresion);
    }
    
    // Nueva función para procesar gafetes mezclados (con y sin IMSS en la misma página)
    function procesarGafetesMezclados(empleadosConIMSS, empleadosSinIMSS, $contenido) {
        // Estrategia mejorada: llenar por columnas, no por espacios
        // Una página tiene 3 columnas, cada columna puede tener:
        // - 1 gafete con IMSS (frente arriba + reverso abajo)
        // - 2 gafetes sin IMSS (uno arriba + uno abajo)
        
        let colaConIMSS = [...empleadosConIMSS];
        let colaSinIMSS = [...empleadosSinIMSS];
        
        while (colaConIMSS.length > 0 || colaSinIMSS.length > 0) {
            const $pagina = $('<div class="gafetes-pagina-mixta" style="width:100%;display:grid;grid-template-columns:repeat(3,6cm);grid-template-rows:repeat(2,auto);justify-content:center;align-items:start;gap:0.5cm;page-break-after:always;min-height:20cm;"></div>');
            
            let columnasUsadas = 0;
            const maxColumnas = 3;
            let grupoMixto = [];
            
            // Llenar página columna por columna
            while (columnasUsadas < maxColumnas && (colaConIMSS.length > 0 || colaSinIMSS.length > 0)) {
                // Priorizar empleados con IMSS (ocupan 1 columna completa)
                if (colaConIMSS.length > 0) {
                    grupoMixto.push({ id: colaConIMSS.shift(), tieneIMSS: true, columna: columnasUsadas });
                    columnasUsadas += 1;
                } 
                // Si no hay empleados con IMSS, llenar con 2 empleados sin IMSS (1 columna)
                else if (colaSinIMSS.length > 0) {
                    // Primer empleado sin IMSS en la fila superior
                    grupoMixto.push({ id: colaSinIMSS.shift(), tieneIMSS: false, columna: columnasUsadas, fila: 0 });
                    
                    // Segundo empleado sin IMSS en la fila inferior (si hay)
                    if (colaSinIMSS.length > 0) {
                        grupoMixto.push({ id: colaSinIMSS.shift(), tieneIMSS: false, columna: columnasUsadas, fila: 1 });
                    }
                    
                    columnasUsadas += 1;
                }
            }
            
            // Solo agregar la página si tiene contenido
            if (grupoMixto.length > 0) {
                generarGafetesMixtos(grupoMixto, $pagina);
                $contenido.append($pagina);
            }
        }
    }
    
    // Función auxiliar para generar gafetes mixtos en una página
    function generarGafetesMixtos(grupoMixto, $pagina) {
        // Crear una matriz 2x3 para organizar los gafetes
        const matriz = [
            [null, null, null], // Fila superior
            [null, null, null]  // Fila inferior
        ];
        
        // Colocar gafetes en la matriz según su tipo y posición
        grupoMixto.forEach(item => {
            const empleado = todosLosEmpleados.find(e => e.id_empleado == item.id);
            if (!empleado) return;
            
            if (item.tieneIMSS) {
                // Gafete con IMSS ocupa toda la columna (fila 0 y 1)
                const gafeteCompleto = generarGafeteCompleto(empleado, true);
                // Marcar ambas posiciones de la columna como ocupadas
                matriz[0][item.columna] = { elemento: gafeteCompleto, tipo: 'imss-frente' };
                matriz[1][item.columna] = { elemento: null, tipo: 'imss-reverso' }; // El reverso está incluido en el gafeteCompleto
            } else {
                // Gafete sin IMSS ocupa solo una celda
                const gafeteSolo = generarGafeteCompleto(empleado, false);
                matriz[item.fila][item.columna] = { elemento: gafeteSolo, tipo: 'sin-imss' };
            }
        });
        
        // Agregar elementos a la página en orden de grid (fila por fila)
        for (let fila = 0; fila < 2; fila++) {
            for (let col = 0; col < 3; col++) {
                const celda = matriz[fila][col];
                
                if (celda && celda.elemento) {
                    // Agregar el gafete real
                    $pagina.append(celda.elemento);
                } else if (celda && celda.tipo === 'imss-reverso') {
                    // Esta celda está ocupada por el reverso de un gafete con IMSS, no agregar nada
                    // El CSS grid se encargará del posicionamiento
                } else {
                    // Celda vacía, agregar espacio en blanco
                    $pagina.append(`<div style="width:6cm;min-width:6cm;max-width:6cm;height:10cm;min-height:10cm;"></div>`);
                }
            }
        }
    }
    
    // Función auxiliar para generar un gafete completo (reutiliza lógica existente)
    function generarGafeteCompleto(empleado, tieneIMSS) {
        const idEmpleado = empleado.id_empleado;
        
        if (tieneIMSS) {
            // Crear contenedor para gafete con IMSS que ocupe 2 filas (grid-row: span 2)
            const $contenedor = $('<div style="grid-row:span 2;display:flex;flex-direction:column;justify-content:flex-start;align-items:center;gap:0;margin:0;padding:0;width:6cm !important;min-width:6cm !important;max-width:6cm !important;height:20cm !important;min-height:20cm !important;max-height:20cm !important;position:relative;"></div>');
            
            // Generar el gafete usando la función existente
            const $paginaTemporal = $('<div></div>');
            generarGafetesEnPagina([idEmpleado], $paginaTemporal, true);
            const gafeteGenerado = $paginaTemporal.children().first();
            
            // Copiar el contenido del gafete generado al contenedor
            $contenedor.html(gafeteGenerado.html());
            $contenedor.attr('class', gafeteGenerado.attr('class'));
            
            return $contenedor;
        } else {
            // Crear contenedor para gafete sin IMSS (solo 1 fila)
            const $contenedor = $('<div style="display:flex;flex-direction:column;justify-content:flex-start;align-items:center;gap:0;margin:0;padding:0;width:6cm !important;min-width:6cm !important;max-width:6cm !important;height:10cm !important;min-height:10cm !important;max-height:10cm !important;position:relative;"></div>');
            
            // Generar el gafete usando la función existente
            const $paginaTemporal = $('<div></div>');
            generarGafetesEnPagina([idEmpleado], $paginaTemporal, false);
            const gafeteGenerado = $paginaTemporal.children().first();
            
            // Copiar el contenido del gafete generado al contenedor
            $contenedor.html(gafeteGenerado.html());
            $contenedor.attr('class', gafeteGenerado.attr('class'));
            
            return $contenedor;
        }
    }
    
    // Nueva función auxiliar para generar gafetes en una página
    function generarGafetesEnPagina(grupo, $pagina, tienenIMSS) {
        // Por cada empleado en el grupo, crear gafete(s)
        grupo.forEach(idEmpleado => {
                const empleado = todosLosEmpleados.find(e => e.id_empleado == idEmpleado); // <-- CAMBIO: buscar en todosLosEmpleados
                if (!empleado) return;
                // --- Frente ---
                // Obtener el orden de nombre seleccionado para este empleado
                const ordenNombre = window.ordenNombre[empleado.id_empleado] || 'nombre-primero';
                let nombreCompleto;
                
                if (ordenNombre === 'apellido-primero') {
                    // Apellidos + Nombre
                    const apellidos = `${empleado.ap_paterno || ''} ${empleado.ap_materno || ''}`.trim();
                    nombreCompleto = apellidos ? `${apellidos} ${empleado.nombre}`.trim() : empleado.nombre;
                } else {
                    // Nombre + Apellidos (por defecto)
                    nombreCompleto = `${empleado.nombre} ${empleado.ap_paterno || ''} ${empleado.ap_materno || ''}`.trim();
                }
                const primerNombre = empleado.nombre ? empleado.nombre.split(' ')[0] : '';
                
                // Calcular tamaño de fuente dinámico para el rectángulo del nombre (solo primer nombre)
                const nombresArray = empleado.nombre ? empleado.nombre.trim().split(/\s+/).filter(Boolean) : [];
                const cantidadNombres = nombresArray.length;
                let fontSizeRectangulo;
                
                if (cantidadNombres === 1) {
                    fontSizeRectangulo = '16.5pt'; // Tamaño por defecto para un nombre
                } else if (cantidadNombres === 2) {
                    // Para dos nombres, verificar longitud total
                    const nombreCompleto = nombresArray.join(' ');
                    fontSizeRectangulo = nombreCompleto.length > 11 ? '12.5pt' : '16.5pt';
                } else {
                    // Tres o más nombres
                    const nombreCompleto = nombresArray.join(' ');
                    fontSizeRectangulo = nombreCompleto.length > 23 ? '7.4pt' : '11pt';
                }
                const departamento = obtenerNombreDepartamento(empleado.id_departamento);
                // Calcular tamaño de fuente para el departamento
                const deptoLength = departamento.replace(/\s+/g, '').length;
                const fontSizeDepto = deptoLength >= 13 ? '8.2pt' : '10pt';
                // Verificar si se debe incluir la foto según la preferencia del usuario
                const incluirFoto = window.fotoInclusion && window.fotoInclusion[empleado.id_empleado] !== undefined ? 
                                    window.fotoInclusion[empleado.id_empleado] : 
                                    false; // Por defecto NO incluir la foto si no hay preferencia
                // Ajustar la ruta de la foto para que sea relativa al directorio gafetes
                let rutaFotoAjustada = empleado.ruta_foto;
                if (empleado.ruta_foto) {
                    // Verificar si la ruta ya es correcta (relativa al directorio gafetes)
                    if (!empleado.ruta_foto.startsWith('../') && !empleado.ruta_foto.startsWith('http')) {
                        // Si la ruta comienza con 'fotos_empleados/', ya está en la ubicación correcta
                        if (empleado.ruta_foto.startsWith('fotos_empleados/')) {
                            rutaFotoAjustada = empleado.ruta_foto; // Ya está en la ubicación correcta
                        } else {
                            rutaFotoAjustada = '../' + empleado.ruta_foto; // Ajustar para directorio gafetes
                        }
                    } else {
                        rutaFotoAjustada = empleado.ruta_foto; // Mantener la ruta original si ya es relativa o absoluta
                    }
                }
                // Agregar timestamp para evitar problemas de caché
                const timestamp = new Date().getTime();
                const fotoHtml = (empleado.ruta_foto && incluirFoto) ? `<img src="${rutaFotoAjustada}?t=${timestamp}" alt="Foto" class="foto-empleado" style="width:100%;height:100%;object-fit:cover;">` : '';
                const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
                const fechaInicio = new Date();
                const fechaFin = new Date(fechaInicio);
                
                // Determinar si el empleado tiene IMSS válido usando el estado del toggle
                const tieneIMSS = window.imssToggleState[empleado.id_empleado] !== undefined ? 
                    window.imssToggleState[empleado.id_empleado] : 
                    (empleado.imss && empleado.imss !== 'N/A' && empleado.imss.trim() !== '');
                
                // Establecer la vigencia: 1 mes para empleados sin IMSS, 6 meses para empleados con IMSS
                const mesesVigencia = tieneIMSS ? 6 : 1;
                fechaFin.setMonth(fechaFin.getMonth() + mesesVigencia);
                if (fechaFin.getDate() !== fechaInicio.getDate()) {
                    fechaFin.setDate(0);
                }
                const pad = n => n.toString().padStart(2, '0');
                const formato = (f) => `${pad(f.getDate())}/${pad(f.getMonth() + 1)}/${f.getFullYear()}`;
                
                // Ya se determinó si el empleado tiene IMSS válido anteriormente
                // const tieneIMSS = empleado.imss && empleado.imss !== 'N/A' && empleado.imss.trim() !== '';
                
                // Crear vigenciaHtml condicional según IMSS
                let vigenciaHtml;
                if (tieneIMSS) {
                    // Si tiene IMSS, mostrar nombre de empresa (diseño completo) con posición absoluta
                    vigenciaHtml = `
                        <div style='position:absolute;top:1.3cm;right:0.2cm;font-size:5.3pt !important;font-weight:bold;text-align:center;width:2.5cm;'>
                            ${empleado.nombre_empresa ? `<div style='font-size:6.5pt !important;font-weight:bold;color:#020500;text-align:center;line-height:1.05;margin-bottom:0.03cm;'>${empleado.nombre_empresa}</div>` : ''}
                            <div style='text-align:center;font-weight:bold;margin-bottom:0.03cm;'>Vigencia:</div>
                            <span style="background:#ffe066; padding:0 2px; border-radius:2px; font-size:5.3pt; white-space:nowrap;">
    ${formato(fechaInicio)} AL ${formato(fechaFin)}
</span>

                        </div>`;
                } else {
                    // Si NO tiene IMSS, NO mostrar nombre de empresa
                    vigenciaHtml = `
                      <div style='position:absolute;top:2cm;right:0.2cm;font-size:5.3pt !important;font-weight:bold;text-align:center;width:2.5cm;'>
                            <div style='text-align:center;font-weight:bold;margin-bottom:0.03cm;'>Vigencia:</div>
                            <span style="background:#ffe066; padding:0 2px; border-radius:2px; font-size:5.3pt; white-space:nowrap;">
    ${formato(fechaInicio)} AL ${formato(fechaFin)}
</span>

                        </div>`;
                }
                // Agrupar palabras como DE, DEL, LA, LOS, LAS, Y con la siguiente para que no queden solas en un renglón
                const palabrasAgrupables = ['DE', 'DEL', 'LA', 'LOS', 'LAS', 'Y'];
                const nombrePartes = nombreCompleto.split(' ').filter(Boolean);
                let nombreAgrupado = [];
                for (let i = 0; i < nombrePartes.length; i++) {
                    const actual = nombrePartes[i].toUpperCase();
                    if (palabrasAgrupables.includes(actual) && i < nombrePartes.length - 1) {
                        // Agrupa con la siguiente palabra
                        nombreAgrupado.push(nombrePartes[i] + ' ' + nombrePartes[i + 1]);
                        i++; // Salta la siguiente palabra porque ya la agrupó
                    } else {
                        nombreAgrupado.push(nombrePartes[i]);
                    }
                }
                // Función para calcular el ancho visual aproximado del texto
                function calcularAnchoVisual(texto) {
                    // Pesos de ancho por letra (valores relativos)
                    const pesos = {
                        'M': 1.8, 'W': 1.8, 'D': 1.5, 'O': 1.4, 'Q': 1.4,
                        'B': 1.3, 'G': 1.3, 'P': 1.3, 'R': 1.3, 'S': 1.2,
                        'U': 1.2, 'V': 1.2, 'X': 1.2, 'Z': 1.2, 'A': 1.1,
                        'C': 1.1, 'E': 1.1, 'F': 1.1, 'H': 1.1, 'I': 0.8,
                        'J': 0.9, 'K': 1.1, 'L': 0.9, 'N': 1.1, 'T': 0.9,
                        'Y': 1.1, 'Ñ': 1.2, ' ': 0.5
                    };
                    
                    // Convertir a mayúsculas y calcular ancho total
                    return texto.toUpperCase().split('').reduce((ancho, letra) => {
                        return ancho + (pesos[letra] || 1.0); // Usar 1.0 como valor por defecto
                    }, 0);
                }
                
                // Dividir el nombre completo en palabras y limpiar espacios vacíos
                // Cada palabra irá en una línea separada
                const palabras = nombreCompleto.split(/\s+/).filter(p => p.trim() !== '');
                let palabrasUnidas = palabras;
                
                // Calcular el ancho visual de cada línea
                const anchosVisuales = palabrasUnidas.map(calcularAnchoVisual);
                const maxAnchoVisual = Math.max(...anchosVisuales);
                const totalLineas = palabrasUnidas.length;
                
                // Encontrar la palabra más ancha
                let palabraMasAncha = '';
                palabrasUnidas.forEach(palabra => {
                    const ancho = calcularAnchoVisual(palabra);
                    if (ancho > calcularAnchoVisual(palabraMasAncha)) {
                        palabraMasAncha = palabra;
                    }
                });
                
                // Determinar el tamaño de fuente basado en DOS factores:
                // 1. Número de renglones (saltos de línea) que ocupa el nombre completo
                // 2. Longitud en caracteres de la palabra más larga
                // IMPORTANTE: Todo el nombre (todas las líneas) tendrá el MISMO tamaño de fuente
                
                let fontSizeNombre;
                const palabrasNombre = nombreCompleto.split(' ');
                const palabraMasLarga = Math.max(...palabrasNombre.map(p => p.length));
                
                // Lógica basada en número de renglones (saltos de línea)
                if (totalLineas >= 6) {
                    // 6 o más renglones
                    if (palabraMasLarga >= 13) {
                        fontSizeNombre = '7.8pt'; // 13+ caracteres
                    } else if (palabraMasLarga === 12) {
                        fontSizeNombre = '8.8pt'; // 12 caracteres
                    } else if (palabraMasLarga === 11) {
                        fontSizeNombre = '10pt';   // 11 caracteres
                    } else if (palabraMasLarga === 10) {
                        fontSizeNombre = '11.2pt';   // 10 caracteres
                    } else if (palabraMasLarga === 9){
                        fontSizeNombre = '12.3pt';   // 9 caracteres
                    }else {
                        fontSizeNombre = '12.8pt'; // 1-8 caracteres
                    }
                } else if (totalLineas === 5) {
                    // 5 renglones
                    if (palabraMasLarga >= 13) {
                        fontSizeNombre = '9.4pt'; // 13+ caracteres
                    } else if (palabraMasLarga === 12) {
                        fontSizeNombre = '10.4pt'; // 12 caracteres
                    } else if (palabraMasLarga === 11) {
                        fontSizeNombre = '11.8pt';   // 11 caracteres
                    } else if (palabraMasLarga === 10) {
                        fontSizeNombre = '12.6pt';   // 10 caracteres
                    } else if (palabraMasLarga === 9){
                        fontSizeNombre = '13.1pt';   // 9 caracteres
                    }else {
                        fontSizeNombre = '13pt'; // 1-8 caracteres
                    }
                } else if (totalLineas === 4) {
                    // 4 renglones
                    if (palabraMasLarga >= 13) {
                        fontSizeNombre = '9.4pt'; // 13+ caracteres
                    } else if (palabraMasLarga === 12) {
                        fontSizeNombre = '10.4pt'; // 12 caracteres
                    } else if (palabraMasLarga === 11) {
                        fontSizeNombre = '11.6pt';   // 11 caracteres
                    } else if (palabraMasLarga === 10) {
                        fontSizeNombre = '12.6pt';   // 10 caracteres
                    } else if (palabraMasLarga === 9){
                        fontSizeNombre = '13.2pt';   // 9 caracteres
                    }else {
                        fontSizeNombre = '14pt'; // 1-8 caracteres
                    }
                } else if (totalLineas === 3) {
                    // 3 renglones
                    if (palabraMasLarga >= 13) {
                        fontSizeNombre = '9.2pt'; // 13+ caracteres
                    }else if (palabraMasLarga === 12) {
                            fontSizeNombre = '10.1pt'; // 12 caracteres
                    } else if (palabraMasLarga === 11) {
                        fontSizeNombre = '10.6pt';   // 11 caracteres
                    } else if (palabraMasLarga === 10) {
                        fontSizeNombre = '11.9pt';   // 10 caracteres
                    } else if (palabraMasLarga === 9){
                        fontSizeNombre = '12.8pt';   // 9 caracteres
                    }else if (palabraMasLarga === 8){
                        fontSizeNombre = '13.8pt';   // 8 caracteres
                    }else if (palabraMasLarga === 7){
                        fontSizeNombre = '15pt';   // 7 caracteres
                    }else if (palabraMasLarga === 6){
                        fontSizeNombre = '18pt';   // 6 caracteres
                    }else if (palabraMasLarga === 5){
                            fontSizeNombre = '20pt';   // 5 caracteres
                    }else {
                        fontSizeNombre = '21pt'; // 1-4 caracteres
                    }
                } else if (totalLineas === 2) {
                    // 2 renglones
                    if (palabraMasLarga >= 11) {
                        fontSizeNombre = '11pt';   // 11+ caracteres
                    } else if (palabraMasLarga >= 9) {
                        fontSizeNombre = '12pt';   // 9-10 caracteres
                    } else {
                        fontSizeNombre = '13pt';   // 1-8 caracteres
                    }
                } else {
                    // 1 renglón
                    if (palabraMasLarga >= 11) {
                        fontSizeNombre = '12pt';   // 11+ caracteres
                    } else if (palabraMasLarga >= 9) {
                        fontSizeNombre = '13pt';   // 9-10 caracteres
                    } else {
                        fontSizeNombre = '14pt';   // 1-8 caracteres
                    }
                }
                // Usar palabrasUnidas para el formato final con ajuste de interlineado
                const lineHeight = Math.min(1.1, 1.2 - (totalLineas * 0.05)); // Reducir interlineado para múltiples líneas
                const nombreEnLineas = palabrasUnidas.map((p, index) => {
                    // Aplicar el mismo tamaño de fuente a todas las líneas
                    return `<span style="display:block;text-align:left !important;font-size:${fontSizeNombre} !important;line-height:${lineHeight} !important;margin-bottom:0.05cm;">${p}</span>`;
                }).join('');
                const colorArea = obtenerColorArea(empleado);
                const colorTextoDatos = obtenerColorTextoDatos(empleado);
                
                // Obtener logos dinámicos para este empleado
                const logosDinamicos = obtenerLogosDinamicos(empleado);
                const logoAreaUrl = logosDinamicos.logoAreaUrl;
                const logoEmpresaUrl = logosDinamicos.logoEmpresaUrl;
                
                // Lógica de posicionamiento inteligente de logos (solo para empleados con IMSS)
                let logoHtml = '';
                
                // Solo mostrar logos si el empleado tiene IMSS
                if (tieneIMSS) {
                    if (logoAreaUrl && logoEmpresaUrl) {
                        // Ambos logos: área en esquina izquierda, empresa en esquina derecha
                        logoHtml = 
                            "<div style=\"width:100%;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.06cm;\">" +
                                "<div style=\"background:white;padding:0.05cm;display:inline-block;\">" +
                                    "<img src=\"" + logoAreaUrl + "\" alt=\"Logo Área\" class=\"gafete-logo-area\" style=\"max-width:1.8cm;max-height:1.6cm;object-fit:contain;display:block;margin-top:0.02cm;\">" +
                                "</div>" +
                                "<div style=\"display:flex;flex-direction:column;align-items:flex-end;gap:0.05cm;max-width:3.0cm;\">" +
                                    "<div style=\"background:transparent;padding:0.05cm;display:inline-block;\">" +
                                        "<img src=\"" + logoEmpresaUrl + "\" alt=\"Logo Empresa\" class=\"gafete-logo-empresa\" style=\"max-width:2.8cm;max-height:1.8cm;object-fit:contain;display:block;\">" +
                                    "</div>" +
                                "</div>" +
                            "</div>";
                    } else if (logoAreaUrl || logoEmpresaUrl) {
                        // Solo un logo: centrado horizontalmente
                        const logoSrc = logoAreaUrl || logoEmpresaUrl;
                        const logoAlt = logoAreaUrl ? 'Logo Área' : 'Logo Empresa';
                        const logoClass = logoAreaUrl ? 'gafete-logo-area' : 'gafete-logo-empresa';
                        const maxWidth = logoAreaUrl ? '2.5cm' : '2.8cm';
                        const maxHeight = logoAreaUrl ? '1.6cm' : '1.8cm';
                        const bgColor = logoAreaUrl ? 'white' : 'transparent';
                        logoHtml = 
                            "<div style=\"width:100%;display:flex;justify-content:center;align-items:flex-start;margin-bottom:0.06cm;\">" +
                                "<div style=\"background:" + bgColor + ";padding:0.05cm;display:inline-block;\">" +
                                    "<img src=\"" + logoSrc + "\" alt=\"" + logoAlt + "\" class=\"" + logoClass + "\" style=\"max-width:" + maxWidth + ";max-height:" + maxHeight + ";object-fit:contain;display:block;margin-top:0.02cm;\">" +
                                "</div>" +
                            "</div>";
                    } else {
                        // Sin logos: espacio mínimo
                        logoHtml = "<div style=\"width:100%;margin-bottom:0.06cm;\"></div>";
                    }
                } else {
                    // Para empleados sin IMSS, no mostrar logos
                    logoHtml = '';
                }
                
                let camposAdicionales = '';
                
                // Si el empleado tiene IMSS, mostrar todos los campos con posición absoluta
                // Ajustar posiciones y tamaños según el número de líneas del nombre
                let topArea, topClave, topBiometrico, fontSize;
                
                if (tieneIMSS) {
                    if (totalLineas === 3) {
                        // 3 líneas: ajustar según caracteres
                        if (palabraMasLarga === 5) {
                            // 5 caracteres: bajar todos los datos
                            topArea = '3cm';
                            topClave = '4.4cm';
                            topBiometrico = '5cm';
                            fontSize = '9.2pt';
                        } else if (palabraMasLarga === 6) {
                            // 6 caracteres: bajar todos los datos y usar tamaño de fuente normal
                            topArea = '2.8cm';
                            topClave = '4.4cm';
                            topBiometrico = '5cm';
                            fontSize = '9.4pt';
                        } else if (palabraMasLarga === 7) {
                            // 7 caracteres: bajar Clave y Biométrico
                            topArea = '2.6cm';
                            topClave = '4.2cm';
                            topBiometrico = '4.9cm';
                            fontSize = '9.4pt';
                        } else if (palabraMasLarga === 8) {
                            // 7 caracteres: bajar Clave y Biométrico
                            topArea = '2.3cm';
                            topClave = '4cm';
                            topBiometrico = '4.8cm';
                            fontSize = '9.4pt';
                        } else {                            
                            // Si la palabra más larga tiene 9 caracteres, bajar Clave y Biométrico
                            if (palabraMasLarga >= 9) {
                                topArea ='2.3cm';
                                topClave = '4cm';
                                topBiometrico = '4.8cm';
                                fontSize = '9.4pt';
                            }
                            fontSize = '9.4pt';
                        }
                    } else if (totalLineas === 4) {
                        // 4 líneas: subir el área
                        topArea = '2.7cm';
                        topClave = '4.3cm';
                        topBiometrico = '5.2cm';
                        fontSize = '9.1pt';
                    } else if (totalLineas === 5) {
                        // 5 líneas: ajustar según caracteres
                        if (palabraMasLarga === 7) {
                            // 7 caracteres: subir más el área
                            topArea = '2.9cm';
                            topClave = '4.4cm';
                            topBiometrico = '5.1cm';
                        } else if (palabraMasLarga === 8) {
                            // 8 caracteres: bajar datos y subir área
                            topArea = '3cm';
                            topClave = '4.5cm';
                            topBiometrico = '5.3cm';
                        } else if (palabraMasLarga === 9) {
                            // 9 caracteres: subir el área
                            topArea = '2.9cm';
                            topClave = '4.4cm';
                            topBiometrico = '5.2cm';
                        } else {
                            // Otros casos
                            topArea = '3cm';
                            topClave = '4.2cm';
                            topBiometrico = '5.1cm';
                        }
                        fontSize = '8.7pt';
                    } else if (totalLineas === 6) {
                        // 6 líneas: posiciones actuales
                        topArea = '3.2cm';
                        topClave = '4.6cm';
                        topBiometrico = '5.1cm';
                        fontSize = '8.7pt';
                    } else {
                        // 7+ líneas: posiciones actuales
                        topArea = '3cm';
                        topClave = '4.2cm';
                        topBiometrico = '5.1cm';
                        fontSize = '8pt';
                    }
                    
                    camposAdicionales = 
                        "<div style=\"position:absolute;top:" + topArea + ";left:0cm;font-size:" + fontSize + " !important;text-align:left !important;\"><strong style='color:" + colorTextoDatos + ";font-size:" + fontSize + " !important;'>Área:</strong><br>" +
                         "<span class='dato-gafete-frente' style='color:" + colorTextoDatos + ";text-align:left !important;font-size:" + fontSize + " !important;line-height:0.9 !important;'>" + departamento + "</span></div>" +
                        "<div style=\"position:absolute;top:" + topClave + ";left:0cm;font-size:" + fontSize + " !important;text-align:left;\"><strong style='color:" + colorTextoDatos + ";font-size:" + fontSize + " !important;'>Clave:</strong> " +
                         "<span class='dato-gafete-frente' style='color:" + colorTextoDatos + ";'>" + empleado.clave_empleado + "</span></div>" +
                        "<div style=\"position:absolute;top:4.8cm;right:-1.8cm;font-size:8.6pt !important;text-align:left;\"><strong style='color:" + colorTextoDatos + ";font-size:8.6pt!important;'>Sexo:</strong> " +
                         "<span class='dato-gafete-frente' style='color:" + colorTextoDatos + ";'>" + (empleado.sexo ? empleado.sexo : 'N/A') + "</span></div>" +
                        "<div style=\"position:absolute;top:" + topBiometrico + ";left:0cm;font-size:" + fontSize + " !important;text-align:left;white-space:nowrap;\"><strong style='color:" + colorTextoDatos + ";font-size:" + fontSize + " !important;display:inline;'>Biométrico:</strong> " +
                         "<span class='dato-gafete-frente' style='color:" + colorTextoDatos + ";display:inline;'>" + (empleado.biometrico ? empleado.biometrico : 'N/A') + "</span></div>";
                }
                
                
                // Aplicar rotación solo si tiene IMSS
                const estiloRotacion = tieneIMSS ? 'transform: rotate(180deg);' : '';
                
                // Definir el HTML del marco de la foto según si tiene IMSS o no
                let fotoHtmlContenedor = '';
                if (tieneIMSS) {
                    // Para gafetes con IMSS: posición absoluta fija
                    fotoHtmlContenedor = "<div class=\"gafete-foto\" style=\"position:absolute;top:2.4cm;right:0.1cm;z-index:10;\">" +
                        "<div class=\"marco-foto\" style=\"width:2.5cm !important;height:3cm !important;border:" + (empleado.ruta_foto && incluirFoto ? "none" : "1px solid #000") + ";border-radius:0;margin:0;overflow:hidden;display:flex;align-items:center;justify-content:center;\">" + fotoHtml + "</div>" +
                    "</div>";
                } else {
                    // Para gafetes sin IMSS: dentro del contenedor flex
                    fotoHtmlContenedor = "<div class=\"gafete-foto\" style=\"position:absolute;top:2.9cm;right:0.1cm;z-index:10;\">" +
                        "<div class=\"marco-foto\" style=\"width:2.5cm !important;height:3cm !important;border:" + (empleado.ruta_foto && incluirFoto ? "none" : "1px solid #000") + ";border-radius:0;margin:0;overflow:hidden;display:flex;align-items:center;justify-content:center;\">" + fotoHtml + "</div>" +
                    "</div>";
                }
                
                // Crear elementos con posición absoluta para gafetes con IMSS (al mismo nivel que la foto)
                let elementosAbsolutos = '';
                if (tieneIMSS) {
                    // Ajustar posición del nombre según número de líneas
                    let topNombre = totalLineas === 3 ? '2cm' : '1.8cm';
                    
                    elementosAbsolutos = 
                        "<div style=\"position:absolute;top:" + topNombre + ";left:0.2cm;width:3cm;\">" +
                            "<div style='position: absolute; top: 0cm;'><strong style='color:" + colorTextoDatos + ";font-size:8pt !important;text-align:left !important;'>Trabajador:</strong></div>" +
                            "<div style='margin-top: 0.3cm;'><span class='nombre-gafete-frente' style='color:" + colorTextoDatos + ";text-align:left !important;font-size:9.5pt !important;font-weight:800;line-height:1.1;display:block;'>" + nombreEnLineas + "</span></div>" +
                        "</div>" +
                        vigenciaHtml +
                        "<div class=\"gafete-sello\" style=\"position:absolute;top:5.6cm;right:0.1cm;text-align:center;font-size:5.5pt !important;font-weight:bold;letter-spacing:0.5px;width:2.5cm;\">" +
                            "Sello de autenticidad" +
                        "</div>" +
                        "<div style=\"position:absolute;top:6.2cm;right:0.2cm;text-align:left;font-size:7.5pt !important;font-weight:bold;letter-spacing:0.5px;color:" + colorTextoDatos + ";width:2.5cm;\">" +
                            "Casillero: " + empleado.num_casillero +
                        "</div>";
                }

                const $frente = $(
                    "<div class=\"gafete\" style=\"border:2px solid " + colorArea + " !important;height:9cm !important;min-height:9cm !important;max-height:9cm !important;width:6cm !important;min-width:6cm !important;max-width:6cm !important;font-family:Segoe UI Black;margin-bottom:0!important;margin-top:0!important;padding:0cm !important;font-size:7pt !important;position:relative;" + estiloRotacion + "\">" +
                        logoHtml +
                        (tieneIMSS ? fotoHtmlContenedor : '') +
                        (tieneIMSS ? elementosAbsolutos : '') +
                        "<div class=\"gafete-body\" style=\"font-size:7pt;display:flex;flex-direction:row;align-items:flex-start;gap:0.1cm;min-height:5.5cm;height:5.5cm;" + (tieneIMSS ? '' : 'justify-content:flex-start;align-items:flex-end;padding-bottom:0.1cm !important;') + "\">" +
                            "<div style=\"" + (tieneIMSS ? 'width:3cm;height:5.5cm;position:relative;' : 'flex:1;display:flex;flex-direction:column;justify-content:flex-start;align-items:flex-start;gap:0.05cm;') + "text-align:left !important;\">" +
                            //nombre sin imss    
                            (tieneIMSS ? '' : 
                                    "<div style=\"position: absolute; top:" + (totalLineas >= 5 ? '1.2cm' : '1.9cm') + "; left:0.2cm; width:3cm; font-size:13px !important;font-weight:800;text-align:left !important;line-height:1.1;color:" + colorTextoDatos + ";\">" +
                                        "<div style='margin-bottom: 0.05cm;text-align:left !important;'><strong style='color:" + colorTextoDatos + ";font-size:8pt !important;text-align:left !important;'>Trabajador:</strong></div>" +
                                        "<div style='text-align:left !important;'><span class='nombre-gafete-frente' style='color:" + colorTextoDatos + ";text-align:left !important;font-size:10pt !important;font-weight:800;line-height:1.1;display:block;'>" + nombreEnLineas + "</span></div>" +
                                    "</div>"
                                ) +
                                (tieneIMSS ? '' : 
                                    "<div style=\"position:absolute;top:4.8cm;left:0.2cm;width:2.8cm;font-size:7pt;text-align:left !important;\"><strong style='color:" + colorTextoDatos + ";font-size:8pt !important;'>Área:</strong><br>" +
                                     "<span class='dato-gafete-frente' style='color:" + colorTextoDatos + ";text-align:left !important;font-size:" + fontSizeDepto + " !important;word-wrap:break-word;white-space:normal;display:block;'>" + departamento + "</span></div>"
                                ) +
                                camposAdicionales +
                            "</div>" +
                                (tieneIMSS ? 
                                    // Para gafetes CON IMSS: espacio vacío ya que los elementos están posicionados absolutamente
                                    "<div style=\"flex:0 0 2.5cm;\"></div>"
                                : 
                                    // Contenedor para gafetes SIN IMSS
                                    "<div style=\"flex:0 0 2.5cm;display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-start;margin-left:0.5cm;\">" +
                                        vigenciaHtml +
                                        fotoHtmlContenedor +
                                    "</div>"
                                ) +
                        "</div>" +
                        "<div class=\"gafete-nombre-rect\" style=\"" + 
                            (tieneIMSS ? 
                                'position:absolute;bottom:-0.5cm;left:0;right:0;width:100%;height:0.8cm;display:flex;align-items:flex-end;' : 
                                'position:absolute;bottom:-1.8cm;left:0;right:0;width:100%;height:0.8cm;display:flex;align-items:flex-end;') + 
                            "\">" +
                                    "<div style=\"width:100%;background:" + colorArea + ";border:none;border-radius:4px 4px 0 0;padding:0.1cm 0;text-align:center !important;font-size:" + fontSizeRectangulo + 
                                    " !important;font-weight:bold;letter-spacing:0.5px;white-space:nowrap;overflow:hidden;color:" + 
                                    (empleado.nombre_area ? 
                                        (empleado.nombre_area.toLowerCase().includes('huasteca') ? '#082B11' : 
                                         empleado.nombre_area.toLowerCase().includes('pilar') ? '#201433' : 
                                         '#fff') 
                                    : '#fff') + 
                                    ";position:absolute;bottom:0;left:0;right:0;\">" + empleado.nombre + "</div>" +
                        "</div>" +
                    "</div>"
                );
                // --- Reverso ---
                // Calcular tamaño de fuente para domicilio de trabajador
                const domicilioTrabajador = empleado.domicilio ? empleado.domicilio : 'N/A';
                const lenDomicilio = domicilioTrabajador.length;
                const fontSizeDomicilioTrabajador = lenDomicilio > 80 ? '5.7pt' : 
                                    (lenDomicilio > 70 ? '6.9pt' : 
                                     (lenDomicilio > 60 ? '6.9pt' : 
                                      (lenDomicilio > 50 ? '6.9pt' : '7pt')));
                // Calcular tamaño de fuente dinámico para Enfermedades/Alergias
                // >125 caracteres => 5.7pt, >110 => 6pt, si no => 6.5pt
                const lenEA = (empleado.enfermedades_alergias ? empleado.enfermedades_alergias.length : 0);
                const fontSizeEnfermedadesAlergias = lenEA > 125 ? '6.3pt' : (lenEA > 110 ? '6.6pt' : '6.9pt');
                
                // Definir colores alternados para los fondos
                const colorGrisClaro = '#D0D0D0';
                const colorVerdeClaro = '#D7F5DE';
                
                // Calcular tamaño de fuente para nombre de contacto según número de palabras
                const nombreContacto = empleado.emergencia_nombre_contacto ? empleado.emergencia_nombre_contacto : 'N/A';
                const numPalabrasContacto = nombreContacto.trim().split(/\s+/).length;
                const fontSizeContacto = numPalabrasContacto >= 2 ? '5.5pt' : '7pt';
                
                const datosAtras = 
                    
                    "<div style='background:" + colorVerdeClaro + ";padding:0.03cm 0.1cm;margin-bottom:0.15cm;border-radius:4px;'>" +
                       "<div style='font-size:7.7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1.2 !important;margin-bottom:0.02cm;'>Domicilio de Trabajador:</div>" +
                       "<div style='font-size:" + fontSizeDomicilioTrabajador + " !important;color:" + colorTextoDatos + ";line-height:1.2;'>" + domicilioTrabajador + "</div>" +
                    "</div>" +
                    
                    "<div style='display:flex;justify-content:space-between;gap:0.1cm;margin-bottom:0.15cm; margin-top:0.11cm'>" +
                        "<div style='flex:1;background:" + colorVerdeClaro + ";padding:0.03cm 0.1cm;border-radius:4px;'>" +
                            "<div style='font-size:7.7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1.2 !important;margin-bottom:0.02cm; margin-top:0.17cm; white-space:nowrap;'>IMSS:</div>" +
                            "<div style='font-size:7pt !important;color:" + colorTextoDatos + ";line-height:1.2;'>" + (tieneIMSS && empleado.imss ? empleado.imss : 'N/A') + "</div>" +
                        "</div>" +
                        "<div style='flex:1;background:" + colorVerdeClaro + ";padding:0.03cm 0.1cm;border-radius:4px;'>" +
                            "<div style='font-size:7.7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1.2 !important;margin-bottom:0.02cm;white-space:nowrap;'>CURP:</div>" +
                            "<div style='font-size:7pt !important;color:" + colorTextoDatos + ";line-height:1.2;'>" + (empleado.curp ? empleado.curp : 'N/A') + "</div>" +
                        "</div>" +
                    "</div>" +
                    // 3. Fecha de nacimiento - Verde claro
                    "<div style='background:" + colorVerdeClaro + ";padding:0.03cm 0.1cm;margin-bottom:0.15cm;border-radius:4px;margin-top:0.11cm;'>" +
                        "<div style='font-size:7.7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1.2 !important;margin-bottom:0.02cm;white-space:nowrap;'>Fecha de nacimiento:</div>" +
                        "<div style='font-size:7pt !important;color:" + colorTextoDatos + ";line-height:1.2;'>" + (empleado.fecha_nacimiento ? formatearFechaYMDaDMY(empleado.fecha_nacimiento) : 'N/A') + "</div>" +
                    "</div>" +
                    // 4. Enfermedades/Alergias - Gris claro
                    "<div style='background:" + colorVerdeClaro + ";padding:0.03cm 0.1cm;margin-bottom:0.15cm;border-radius:4px;margin-top:0.11cm;'>" +
                        "<div style='font-size:7.7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1.2 !important;margin-bottom:0.02cm;white-space:nowrap;'>Enfermedades/Alergias:</div>" +
                        "<div style='font-size:" + fontSizeEnfermedadesAlergias + " !important;color:" + colorTextoDatos + ";line-height:1.2;'>" + (empleado.enfermedades_alergias ? empleado.enfermedades_alergias : 'N/A') + "</div>" +
                    "</div>" +
                    // 5. Grupo sanguíneo (Verde claro) y Fecha de ingreso/ reingreso (Gris claro) - Colores alternados
                    "<div style='display:flex;justify-content:space-between;gap:0.1cm;margin-bottom:0.11cm;'>" +
                        "<div style='flex:1;background:" + colorVerdeClaro + ";padding:0.03cm 0.1cm;border-radius:4px; margin-top:0.13cm;'>" +
                            "<div style='font-size:7.7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1.2 !important;margin-bottom:0.02cm;white-space:nowrap;'>Grupo sanguíneo:</div>" +
                            "<div style='font-size:7pt !important;color:" + colorTextoDatos + ";line-height:1.2;'>" + (empleado.grupo_sanguineo ? empleado.grupo_sanguineo : 'N/A') + "</div>" +
                        "</div>" +
                        "<div style='flex:1;background:" + colorVerdeClaro + ";padding:0.03cm 0.1cm;border-radius:4px; margin-top:0.13cm;'>" +
                            "<div style='font-size:7.7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1.2 !important;margin-bottom:0.02cm;white-space:nowrap;'>Fecha de ingreso:</div>" +
                            "<div style='font-size:7pt !important;color:" + colorTextoDatos + ";line-height:1.2;'>" + (empleado.fecha_reingreso ? formatearFechaYMDaDMY(empleado.fecha_reingreso) : (empleado.fecha_ingreso ? formatearFechaYMDaDMY(empleado.fecha_ingreso) : 'N/A')) + "</div>" +
                        "</div>" +
                    "</div>" +
                    // 6. Contacto de emergencia - Gris claro
                    "<div style='background:" + colorGrisClaro + ";border-radius:4px;padding:0.03cm 0.1cm;margin-top:0.05cm;width:100%;box-sizing:border-box;'>" +
                        "<div style=\"margin-bottom:0.03cm !important;\"><span style=\"font-size:7.5pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;\">En caso de emergencia llamar a:</span></div>" +
                        "<div style='text-align:center;margin:0.05cm 0;'>" +
                            "<div style='font-size:" + fontSizeContacto + " !important;color:" + colorTextoDatos + ";line-height:1.2;'>" +
                                (empleado.emergencia_parentesco ? empleado.emergencia_parentesco : 'N/A') + " - " + nombreContacto +
                            "</div>" +
                        "</div>" +
                        "<div style='text-align:center;margin:0.05cm 0;'>" +
                            "<div style='font-size:7.3pt !important;color:" + colorTextoDatos + ";line-height:1.2;'>" + formatearTelefono(empleado.emergencia_telefono) + "</div>" +
                        "</div>" +
                        "<div style='text-align:center;margin:0.05cm 0;'>" +
                            "<div style='font-size:" + (empleado.emergencia_domicilio ? (empleado.emergencia_domicilio.length > 80 ? '5.6pt' : (empleado.emergencia_domicilio.length > 70 ? '6.5pt' : (empleado.emergencia_domicilio.length > 60 ? '6.5pt' : (empleado.emergencia_domicilio.length > 50 ? '7pt' : '7pt')))) : '7pt') + " !important;color:" + colorTextoDatos + ";line-height:1.2;'>" + 
                            (empleado.emergencia_domicilio ? empleado.emergencia_domicilio : 'N/A') + "</div>" +
                        "</div>" +
                    "</div>";
                // Lógica personalizada para el reverso según la empresa
                let logoReversoHtml = '';
                
                // Solo mostrar contenido en el reverso si el empleado tiene IMSS
                if (tieneIMSS) {
                    // Verificar el nombre de la empresa
                    const nombreEmpresa = empleado.nombre_empresa ? empleado.nombre_empresa.toLowerCase() : '';
                    
                    if (nombreEmpresa.includes('citricos saao') || nombreEmpresa.includes('cítricos saao')) {
                        // Para CITRICOS SAAO: Mostrar texto "SAAO" con fuente Mistral
                        logoReversoHtml = 
                            "<div style=\"width:100%;display:flex;justify-content:center;align-items:center;margin-bottom:0cm;\">" +
                                "<div style=\"font-family:'Mistral', cursive;font-size:45pt !important;font-weight:bold;color:#004D17;text-align:center;line-height:0.9;\">" +
                                    "SAAO" +
                                "</div>" +
                            "</div>";
                    } else if (nombreEmpresa.includes('sb group') || nombreEmpresa.includes('sb')) {
                        // Para SB GROUP: Mostrar solo el logo de la empresa (si existe)
                        if (logoEmpresaUrl) {
                            logoReversoHtml = 
                                "<div style=\"width:100%;display:flex;justify-content:center;align-items:center;margin-bottom:-0.8cm;margin-top:-0.5cm;\">" +
                                    "<div style=\"background:transparent;padding:0;display:inline-block;\">" +
                                        "<img src=\"" + logoEmpresaUrl + "\" alt=\"Logo Empresa\" class=\"gafete-logo-reverso-empresa\" style=\"max-width:4cm;max-height:2.5cm;object-fit:contain;display:block;\">" +
                                    "</div>" +
                                "</div>";
                        } else {
                            // Sin logo: espacio mínimo
                            logoReversoHtml = "<div style=\"width:100%;margin-bottom:0.1cm;\"></div>";
                        }
                    } else {
                        // Para otras empresas: comportamiento por defecto (sin logos)
                        logoReversoHtml = "<div style=\"width:100%;margin-bottom:0.1cm;\"></div>";
                    }
                } else {
                    // Para empleados sin IMSS, no mostrar logos en el reverso
                    logoReversoHtml = '';
                }
                
                const $reverso = $(
                    "<div class=\"gafete\" style=\"border:2px solid " + colorArea + " !important;height:9cm !important;min-height:9cm !important;max-height:9cm !important;width:6cm !important;min-width:6cm !important;max-width:6cm !important;font-family:Segoe UI Black;margin-bottom:0!important;margin-top:0!important;padding:0.02cm 0.1cm 0.1cm 0.1cm !important;font-size:6pt !important;overflow:hidden;box-sizing:border-box;\">" +
                        logoReversoHtml +
                        "<div class=\"gafete-body\" style=\"justify-content: flex-start; font-size:5pt; margin-top:-0.2cm;\">" +
                            "<div style='font-size:6pt;'>" +
                                datosAtras.replace(/(Domicilio de trabajador:|Domicilio:|Domicilio de emergencia:)/g, '<span style=\"font-size:6pt;\">$1') + "</div>" +
                        "</div>" +
                    "</div>"
                );
                
            // Crear contenedor columna con lógica condicional para IMSS
            // Verificar el estado del toggle individual de este empleado
            const tieneIMSSIndividual = window.imssToggleState[empleado.id_empleado] !== undefined ? 
                window.imssToggleState[empleado.id_empleado] : 
                (empleado.imss && empleado.imss !== 'N/A' && empleado.imss.trim() !== '');
            
            let $columna;
            
            if (tieneIMSSIndividual) {
                // Si tienen IMSS, generar gafete completo (frente y reverso)
                $columna = $('<div style="display:flex;flex-direction:column;justify-content:flex-start;align-items:center;gap:0;margin:0;padding:0;width:6cm !important;min-width:6cm !important;max-width:6cm !important;height:19cm !important;min-height:19cm !important;max-height:19cm !important;position:relative;"></div>');
                
                // Aplicar rotación de 180 grados solo al frente
                $frente.css({
                    'transform': 'rotate(180deg)',
                    'margin': '0 auto',
                    'padding': '0',
                    'width': '6cm !important',
                    'min-width': '6cm !important',
                    'max-width': '6cm !important',
                    'height': '9cm !important',
                    'min-height': '9cm !important',
                    'max-height': '9cm !important',
                    'position': 'relative',
                    'display': 'block'
                });
                
                // El reverso se mantiene en su orientación normal
                $reverso.css({
                    'margin': '0 auto',
                    'padding': '0',
                    'width': '6cm !important',
                    'min-width': '6cm !important',
                    'max-width': '6cm !important',
                    'height': '9cm !important',
                    'min-height': '9cm !important',
                    'max-height': '9cm !important',
                    'position': 'relative',
                    'display': 'block'
                });
                
                // Agregar el frente primero (arriba) - rotado 180 grados
                $columna.append($frente);
                
                // Reducir el espacio entre frente y reverso para que estén casi rozándose
                $columna.append($('<div style="height:0.05cm;"></div>'));
                
                // Agregar el reverso después (abajo) - en orientación normal
                $columna.append($reverso);
            } else {
                // Para empleados sin IMSS, generar contenedor más pequeño solo para el frente
                $columna = $('<div style="display:flex;flex-direction:column;justify-content:flex-start;align-items:center;gap:0;margin:0;padding:0;width:6cm !important;min-width:6cm !important;max-width:6cm !important;height:10cm !important;min-height:10cm !important;max-height:10cm !important;position:relative;"></div>');
                
                // Para empleados sin IMSS, solo mostrar el frente rotado 180 grados
                $frente.css({
                    'margin': '0 auto',
                    'padding': '0',
                    'width': '6cm !important',
                    'min-width': '6cm !important',
                    'max-width': '6cm !important',
                    'height': '9cm !important',
                    'min-height': '9cm !important',
                    'max-height': '9cm !important',
                    'display': 'block'
                });
                $columna.append($frente);
            }
            $pagina.append($columna);
        });
        
        // Rellenar espacios vacíos si es necesario
        if (tienenIMSS) {
            // Para empleados con IMSS, rellenar hasta 3 columnas
            for (let j = grupo.length; j < 3; j++) {
                $pagina.append(`<div style="width:6cm;min-width:6cm;max-width:6cm;height:20cm;min-height:20cm;"></div>`);
            }
        } else {
            // Para empleados sin IMSS, rellenar hasta 6 espacios (2 filas x 3 columnas)
            for (let j = grupo.length; j < 6; j++) {
                $pagina.append(`<div style="width:6cm;min-width:6cm;max-width:6cm;height:10cm;min-height:10cm;"></div>`);
            }
        }
        
        // Ajustar tamaño de fuente del nombre si se desborda
        setTimeout(() => {
            $pagina.find('.nombre-gafete-frente').each(function () {
                const $nombre = $(this);
                const $marco = $nombre.closest('.gafete').find('.gafete-nombre-rect > div');
                // Ancho máximo permitido (en px, 5.5cm aprox a 96dpi)
                const maxWidthPx = 208; // 5.5cm * 37.8px/cm
                // Solo reducir si se desborda
                let fontSize = parseFloat($nombre.css('font-size'));
                while ($nombre[0].scrollWidth > maxWidthPx && fontSize > 7) {
                    fontSize -= 0.5;
                    $nombre.css('font-size', fontSize + 'pt');
                }
            });
        }, 10);
    }
    
    // Continuar con el resto de la función generarGafetesConDatosActualizados
    function continuarGeneracionGafetes(modoImpresion) {
        // Si no es modo impresión, mostrar el modal
        if (!modoImpresion) {
            const modal = new bootstrap.Modal(document.getElementById('modalGafetes'));
            modal.show();
        }
    }

    // Función auxiliar para obtener iniciales con estilo infantil
    function obtenerIniciales(nombre, apPaterno, apMaterno) {
        let iniciales = nombre ? nombre.charAt(0).toUpperCase() : '';
        iniciales += apPaterno ? apPaterno.charAt(0).toUpperCase() : '';
        iniciales += apMaterno ? apMaterno.charAt(0).toUpperCase() : '';

        if (!iniciales) {
            return `
                <div style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
                    color: #666;
                    font-size: 2rem;
                    font-weight: bold;
                    border-radius: 5px;
                ">
                    <i class="bi bi-person-fill"></i>
                </div>
            `;
        }

        return `
            <div style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
                color: #333;
                font-size: 2rem;
                font-weight: bold;
                border-radius: 5px;
            ">
                ${iniciales}
            </div>
        `;
    }

    // Formatea 'YYYY-MM-DD' (o variantes) a 'dd/mm/aaaa' sin usar Date para evitar desfases de zona horaria
    function formatearFechaYMDaDMY(fechaYMD) {
        if (!fechaYMD) return 'N/A';
        const str = String(fechaYMD).trim();
        // Coincidir patrones como 1994-03-12 o 1994/03/12 o 1994-03-12T00:00:00
        const m = str.match(/^(\d{4})[-\/.](\d{2})[-\/.](\d{2})/);
        if (m) {
            const y = m[1];
            const mo = m[2];
            const d = m[3];
            return `${d}/${mo}/${y}`;
        }
        // Respaldo: separar por no-dígitos
        const parts = str.split(/[^0-9]/).filter(Boolean);
        if (parts.length >= 3) {
            const y = parts[0];
            const mo = parts[1].padStart(2, '0');
            const d = parts[2].padStart(2, '0');
            return `${d}/${mo}/${y}`;
        }
        return str;
    }

    // Convierte hex (#RRGGBB) a rgba con transparencia para generar un fondo claro del mismo color
    function colorHexToRgba(hex, alpha) {
        if (!hex) return `rgba(0,0,0,${alpha || 0.1})`;
        const normalized = hex.replace('#', '');
        if (normalized.length !== 6) return `rgba(0,0,0,${alpha || 0.1})`;
        const r = parseInt(normalized.substring(0,2), 16);
        const g = parseInt(normalized.substring(2,4), 16);
        const b = parseInt(normalized.substring(4,6), 16);
        const a = typeof alpha === 'number' ? Math.max(0, Math.min(1, alpha)) : 0.12;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    // Formatear el teléfono de emergencia para que se vea profesional
    function formatearTelefono(telefono) {
        if (!telefono) return 'N/A';
        // Eliminar espacios y guiones existentes
        const limpio = telefono.replace(/[^\d]/g, '');
        // Si es un número de 10 dígitos (México)
        if (limpio.length === 10) {
            return limpio.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        }
        // Si es un número de 7 dígitos
        if (limpio.length === 7) {
            return limpio.replace(/(\d{3})(\d{4})/, '$1 $2');
        }
        // Si es un número de 8 dígitos
        if (limpio.length === 8) {
            return limpio.replace(/(\d{4})(\d{4})/, '$1 $2');
        }
        // Si es un número internacional de 12 o más dígitos
        if (limpio.length >= 12) {
            return limpio.replace(/(\d{2,4})(\d{2,4})(\d{4,})/, '$1 $2 $3');
        }
        // Si no coincide, devolver como está
        return telefono;
    }

    // Función para limpiar fotos huérfanas
    function limpiarFotosHuerfanas() {
        // Mostrar indicador de carga con nuevo diseño
        const $boton = $('#limpiarFotos');
        const textoOriginal = $boton.html();
        
        // Agregar clase de loading y cambiar contenido
        $boton.addClass('loading');
        $boton.prop('disabled', true);
        $boton.html('<i class="bi bi-arrow-clockwise"></i> Limpiando...');

        $.ajax({
            url: 'php/limpiar_fotos_huerfanas.php',
            method: 'POST',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    const stats = response.estadisticas;
                    
                    // Mostrar mensaje de éxito discreto en lugar de alert
                    mostrarMensajeExitoLimpieza(
                        `Limpieza completada: ${stats.fotos_eliminadas} fotos eliminadas`,
                        stats
                    );
                    
                    // Log detalles para desarrolladores
                    if (response.fotos_eliminadas && response.fotos_eliminadas.length > 0) {
                    }
                } else {
                    mostrarAlertaLimpieza('Error durante la limpieza: ' + response.message, 'danger');
                    if (response.errores && response.errores.length > 0) {
                     
                    }
                }
            },
            error: function(xhr, status, error) {
                mostrarAlertaLimpieza('Error de conexión al servidor durante la limpieza de fotos.', 'danger');
            },
            complete: function() {
                // Restaurar el botón con animación
                $boton.removeClass('loading');
                $boton.prop('disabled', false);
                $boton.html(textoOriginal);
            }
        });
    }
    
    // Función para actualizar las fechas de creación y vigencia de los gafetes
    function actualizarFechasGafetes() {
        // Crear un array de promesas para esperar a que todas las actualizaciones terminen
        const promesas = [];
        
        // Iterar sobre los empleados seleccionados y actualizar sus fechas
        empleadosSeleccionados.forEach(function(idEmpleado) {
            // Obtener el estado del toggle IMSS para este empleado
            const empleado = todosLosEmpleados.find(e => e.id_empleado == idEmpleado);
            let imssToggle = null;
            
            if (empleado) {
                // Usar el estado del toggle si existe, si no, usar el valor del campo IMSS
                imssToggle = window.imssToggleState[idEmpleado] !== undefined ? 
                    window.imssToggleState[idEmpleado] : 
                    (empleado.imss && empleado.imss !== 'N/A' && empleado.imss.trim() !== '');
            }
            
            // Crear una promesa para cada actualización
            const promesa = $.ajax({
                url: 'php/actualizarFechasGafete.php',
                method: 'POST',
                data: { 
                    id_empleado: idEmpleado,
                    imss_toggle: imssToggle
                },
                dataType: 'json'
            }).done(function(response) {
                console.log('Respuesta del servidor para empleado ' + idEmpleado + ':', response);
                if (response.success) {
                    // Actualizar las fechas en el objeto del empleado en cache
                    if (empleado) {
                        empleado.fecha_creacion = response.fecha_creacion;
                        empleado.fecha_vigencia = response.fecha_vigencia;
                    }
                    console.log('✓ Fechas actualizadas para empleado ' + idEmpleado + ': Creación=' + response.fecha_creacion + ', Vigencia=' + response.fecha_vigencia + ', Filas afectadas=' + response.affected_rows);
                } else {
                    console.error('✗ Error en respuesta para empleado ' + idEmpleado + ':', response.message);
                }
            }).fail(function(xhr, status, error) {
                console.error('✗ Error AJAX al actualizar fechas para empleado ' + idEmpleado + ':', {
                    status: status,
                    error: error,
                    responseText: xhr.responseText
                });
            });
            
            promesas.push(promesa);
        });
        
        // Retornar una promesa que se resuelve cuando todas las actualizaciones terminan
        return Promise.all(promesas).then(function() {
            // Actualizar el contador de notificaciones después de actualizar todas las fechas
            if (typeof updateNotificationCount === 'function') {
                updateNotificationCount();
            }
            console.log('Todas las fechas han sido actualizadas correctamente');
        }).catch(function(error) {
            console.error('Error al actualizar algunas fechas:', error);
        });
    }

    // Función para mostrar mensaje de éxito de limpieza discreto
    function mostrarMensajeExitoLimpieza(mensaje, stats) {
        const mensajeExito = document.createElement('div');
        mensajeExito.className = 'mensaje-limpieza-exito';
        mensajeExito.innerHTML = `
            <div class="mensaje-limpieza-content">
                <div class="mensaje-header">
                    <i class="bi bi-check-circle-fill"></i>
                    <span class="mensaje-titulo">${mensaje}</span>
                </div>
                <div class="mensaje-stats">
                    <div class="stat-item">
                        <span class="stat-label">Archivos revisados:</span>
                        <span class="stat-value">${stats.total_archivos_directorio}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Fotos en uso:</span>
                        <span class="stat-value">${stats.fotos_conservadas}</span>
                    </div>
                    <div class="stat-item highlight">
                        <span class="stat-label">Fotos eliminadas:</span>
                        <span class="stat-value">${stats.fotos_eliminadas}</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(mensajeExito);
        
        // Mostrar con animación
        setTimeout(() => {
            mensajeExito.classList.add('show');
        }, 100);
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            mensajeExito.classList.remove('show');
            setTimeout(() => {
                if (mensajeExito.parentNode) {
                    mensajeExito.parentNode.removeChild(mensajeExito);
                }
            }, 300);
        }, 5000);
    }
    
    // Función para mostrar alertas de limpieza
    function mostrarAlertaLimpieza(mensaje, tipo = 'info') {
        const alerta = document.createElement('div');
        alerta.className = `alerta-limpieza alerta-${tipo}`;
        alerta.innerHTML = `
            <div class="alerta-content">
                <i class="bi bi-exclamation-triangle-fill"></i>
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
        
        // Auto-cerrar después de 7 segundos
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.classList.remove('show');
                setTimeout(() => {
                    if (alerta.parentNode) {
                        alerta.parentNode.removeChild(alerta);
                    }
                }, 300);
            }
        }, 7000);
    }

    // ======================================
    // FUNCIÓN DE ALERTA ESTILO GAFETES
    // ======================================

    // Función para mostrar alertas (compatible con otras partes del sistema)
    function mostrarAlerta(mensaje, tipo = 'info') {
        // Reutilizar la función mostrarAlertaGafete ya existente
        mostrarAlertaGafete(mensaje, tipo);
    }

    // Función para mostrar alertas específicas de gafetes (mismo estilo que fotos)
    function mostrarAlertaGafete(mensaje, tipo = 'info') {
        const alerta = document.createElement('div');
        alerta.className = `alerta-gafete alerta-${tipo}`;
        alerta.innerHTML = `
            <div class="alerta-content">
                <i class="bi bi-${tipo === 'warning' ? 'exclamation-triangle-fill' : tipo === 'danger' || tipo === 'error' ? 'x-circle-fill' : 'info-circle-fill'}"></i>
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
    
    // ======================================
    // FUNCIONES DE VALIDACIÓN
    // ======================================

    // Funciones de validación importadas
    function validarNombre(nombre) {
        // Convertir a mayúsculas antes de validar
        const nombreMayusculas = nombre.toUpperCase();
        const validar = /^([A-ZÁÉÍÓÚÑa-záéíóúñ]+)( [A-ZÁÉÍÓÚÑa-záéíóúñ]+)*$/;
        return validar.test(nombreMayusculas);
    }

    function validarApellido(apellido) {
        // Convertir a mayúsculas antes de validar
    }

        function validarApellido(apellido) {
        // Convertir a mayúsculas antes de validar
        const apellidoMayusculas = apellido.toUpperCase();
        var validar = /^(?:(?:[Dd]e(?:l)?|[Dd]e\s+(?:la|los|las))\s+)?([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)$/;
        return validar.test(apellidoMayusculas);
    }

    function validarClave(clave) {
        // Permitir claves que contengan letras, números y caracteres especiales como /
        var validar = /^[a-zA-Z0-9\/]+$/;
        return validar.test(clave);
    }

    function validarCURP(curp) {
        var validar = /^[A-Z][AEIOU][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/i;
        return validar.test(curp);
    }

    function validarNSS(nss) {
        var validar = /^(\d{11}|\d{10}-\d)$/;
        return validar.test(nss);
    }

    function validarGrupoSanguineo(grupo) {
        var validar = /^(A|B|AB|O)[+-]$/i;
        return validar.test(grupo);
    }

    function validarParentesco(parentesco) {
        // Permitir mayúsculas y minúsculas, pero validar que sean letras y espacios
        var validar = /^([A-Za-zÁÉÍÓÚÑáéíóúñ]+)(\s[A-Za-zÁÉÍÓÚÑáéíóúñ]+)*$/;
        return validar.test(parentesco);
    }

    function validarTelefono(telefono) {
        const regex = /^\d{10}$/;
        return regex.test(telefono);
    }

    // ======================================
    // FUNCIONALIDAD MODAL EDITAR EMPLEADO
    // ======================================

    // Función para abrir el modal de editar empleado
    function abrirModalEditarEmpleado(idEmpleado, claveEmpleado) {
        let data = {
            id_empleado: idEmpleado,
            clave_empleado: claveEmpleado,
            accion: "dataEmpleado"
        };

        // Obtener los datos del empleado
        $.ajax({
            type: "POST",
            url: "../empleados/php/obtenerEmpleados.php",
            data: data,
            success: function (empleado) {
                if (!empleado.error) {
                    // Llenar los campos del modal con los datos del empleado
                    llenarCamposModal(empleado, idEmpleado, claveEmpleado);
                    
                    // Cargar dropdowns
                    cargarDropdownsModal(empleado);
                    
                    // Mostrar el modal
                    $("#modal_actualizar_empleado").modal("show");
                    
                    // Aplicar formateo a mayúsculas para los campos del contacto de emergencia (excepto parentesco)
                    formatearMayusculas("#modal_emergencia_nombre");
                    formatearMayusculas("#modal_emergencia_ap_paterno");
                    formatearMayusculas("#modal_emergencia_ap_materno");
                    // No aplicar formateo automático a parentesco para permitir mayúsculas y minúsculas
                }
            },
            error: function(xhr, status, error) {
                  alert('Error al cargar los datos del empleado');
            }
        });
    }

    // Función para llenar los campos del modal
    function llenarCamposModal(empleado, idEmpleado, claveEmpleado) {
        // Datos básicos del empleado
        $("#empleado_id").val(idEmpleado);
        $("#modal_clave_empleado").val(claveEmpleado);
        $("#modal_nombre_empleado").val(empleado.nombre_empleado || '');
        $("#modal_apellido_paterno").val(empleado.apellido_paterno_empleado || '');
        $("#modal_apellido_materno").val(empleado.apellido_materno_empleado || '');
        $("#modal_domicilio").val(empleado.domicilio_empleado || '');
        $("#modal_imss").val(empleado.imss || '');
        $("#modal_curp").val(empleado.curp || '');
        $("#modal_sexo").val(empleado.sexo || '');
        $("#modal_grupo_sanguineo").val(empleado.grupo_sanguineo || '');
        $("#modal_enfermedades_alergias").val(empleado.enfermedades_alergias || '');
        $("#modal_fecha_ingreso").val(empleado.fecha_ingreso || '');
        $("#modal_fecha_reingreso").val(empleado.ultima_fecha_reingreso || '');
        $("#modal_fecha_nacimiento").val(empleado.fecha_nacimiento || '');
        $("#modal_num_casillero").val(empleado.num_casillero || '');
        $("#modal_biometrico").val(empleado.biometrico || '');
        $("#modal_telefono_empleado").val(empleado.telefono_empleado || '');

        // Datos de contacto de emergencia
        $("#modal_emergencia_nombre").val(empleado.nombre_contacto || '');
        $("#modal_emergencia_ap_paterno").val(empleado.apellido_paterno_contacto || '');
        $("#modal_emergencia_ap_materno").val(empleado.apellido_materno_contacto || '');
        $("#modal_emergencia_telefono").val(empleado.telefono_contacto || '');
        $("#modal_emergencia_domicilio").val(empleado.domicilio_contacto || '');
        $("#modal_emergencia_parentesco").val(empleado.parentesco || '');
        
        // Cargar foto del empleado
        cargarFotoEmpleado(empleado);
    }

    // Función para cargar los dropdowns del modal
    function cargarDropdownsModal(empleado) {
        // Cargar departamentos
        $.ajax({
            type: "GET",
            url: "../public/php/obtenerDepartamentos.php",
            success: function (response) {
                let departamentos = JSON.parse(response);
                let opciones = `<option value="0">Ninguno</option>`;

                departamentos.forEach((element) => {
                    opciones += `<option value="${element.id_departamento}">${element.nombre_departamento}</option>`;
                });

                $("#modal_departamento").html(opciones);
                if (!empleado.id_departamento || empleado.id_departamento === "0") {
                    $("#modal_departamento").val("0");
                } else {
                    $("#modal_departamento").val(empleado.id_departamento);
                }
            }
        });

        // Cargar empresas
        $.ajax({
            type: "GET",
            url: "../public/php/obtenerEmpresa.php",
            success: function (response) {
                let empresas = JSON.parse(response);
                let opciones = `<option value="0">Ninguna</option>`;

                empresas.forEach((element) => {
                    opciones += `<option value="${element.id_empresa}">${element.nombre_empresa}</option>`;
                });

                $("#modal_empresa").html(opciones);
                if (!empleado.id_empresa || empleado.id_empresa === "0") {
                    $("#modal_empresa").val("0");
                } else {
                    $("#modal_empresa").val(empleado.id_empresa);
                }
            }
        });

        // Cargar áreas
        $.ajax({
            type: "GET",
            url: "../public/php/obtenerAreas.php",
            success: function (response) {
                let areas = JSON.parse(response);
                let opciones = `<option value="0">Ninguna</option>`;

                areas.forEach((element) => {
                    opciones += `<option value="${element.id_area}">${element.nombre_area}</option>`;
                });

                $("#modal_area").html(opciones);
                if (!empleado.id_area || empleado.id_area === "0") {
                    $("#modal_area").val("0");
                } else {
                    $("#modal_area").val(empleado.id_area);
                }
            }
        });

        // Cargar puestos
        $.ajax({
            type: "GET",
            url: "../public/php/obtenerPuestos.php",
            success: function (response) {
                let puestos = JSON.parse(response);
                let opciones = `<option value="0">Ninguno</option>`;

                puestos.forEach((element) => {
                    opciones += `<option value="${element.id_puestoEspecial}">${element.nombre_puesto}</option>`;
                });

                $("#modal_puesto").html(opciones);
                if (!empleado.id_puesto || empleado.id_puesto === "0") {
                    $("#modal_puesto").val("0");
                } else {
                    $("#modal_puesto").val(empleado.id_puesto);
                }
            }
        });
    }

    // Función para resaltar campos inválidos con efecto profesional
    function resaltarCampoInvalido(campoId) {
        const campo = $("#" + campoId);
        const parent = campo.parent();
        
        // Limpiar estilos previos
        campo.removeClass('border-success border-primary campo-valido');
        
        // Agregar clase personalizada para campo inválido
        campo.addClass('campo-invalido');
        
        // Aplicar estilos profesionales con gradiente y animación
        campo.css({
            'border': '2px solid #dc3545',
            'border-radius': '8px',
            'box-shadow': '0 0 20px rgba(220, 53, 69, 0.4), inset 0 1px 3px rgba(220, 53, 69, 0.1)',
            'background': 'linear-gradient(to right, rgba(220, 53, 69, 0.05), rgba(255, 255, 255, 0))',
            'transition': 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            'transform': 'scale(1.02)',
            'position': 'relative',
            'z-index': '10'
        });
        
        // Agregar animación de pulso continuo
        campo.addClass('animate__animated animate__headShake');
        
        // No mostrar indicador de texto, solo efecto visual
        // Los indicadores de texto han sido eliminados por solicitud del usuario
        
        // Quitar la animación después de que termine
        setTimeout(() => {
            campo.removeClass('animate__animated animate__headShake');
        }, 1000);
        
        // Scroll suave al primer campo inválido
        if ($('.campo-invalido').first().attr('id') === campoId) {
            $('html, body').animate({
                scrollTop: campo.offset().top - 150
            }, 500);
        }
    }

    // Función para limpiar resaltado de campos
    function limpiarResaltadoCampos() {
        // Remover todas las clases de validación
        $('.campo-invalido, .campo-valido').removeClass('campo-invalido campo-valido animate__animated animate__headShake animate__pulse');
        
        // Remover indicadores de error
        $('.error-indicator, .success-indicator').fadeOut(200, function() {
            $(this).remove();
        });
        
        // Restaurar estilos originales con transición suave
        $('input, select, textarea').css({
            'border': '',
            'border-radius': '',
            'box-shadow': '',
            'background': '',
            'transition': 'all 0.3s ease',
            'transform': '',
            'z-index': ''
        });
    }

    // Función para resaltar campo válido con efecto profesional
    function resaltarCampoValido(campoId) {
        const campo = $("#" + campoId);
        
        // Limpiar estilos previos
        campo.removeClass('border-danger border-primary campo-invalido');
        
        // Agregar clase personalizada para campo válido
        campo.addClass('campo-valido');
        
        // Aplicar estilos profesionales con gradiente y animación
        campo.css({
            'border': '2px solid #28a745',
            'border-radius': '8px',
            'box-shadow': '0 0 15px rgba(40, 167, 69, 0.3), inset 0 1px 3px rgba(40, 167, 69, 0.1)',
            'background': 'linear-gradient(to right, rgba(40, 167, 69, 0.05), rgba(255, 255, 255, 0))',
            'transition': 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            'transform': 'scale(1.01)'
        });
        
        // No mostrar indicador de texto, solo efecto visual
        // Los indicadores de texto han sido eliminados por solicitud del usuario
        
        // Animación sutil de confirmación
        campo.addClass('animate__animated animate__pulse');
        setTimeout(() => {
            campo.removeClass('animate__animated animate__pulse');
        }, 600);
    }

    // Evento para enviar el formulario de actualización
    $("#form_modal_actualizar_empleado").submit(function (e) {
        e.preventDefault();
        
        // Limpiar resaltados anteriores
        limpiarResaltadoCampos();

        // Recopilar todos los datos del formulario y convertir nombres y apellidos a mayúsculas
        let datos = {
            id_empleado: $("#empleado_id").val(),
            clave_empleado: $("#modal_clave_empleado").val(),
            nombre_empleado: $("#modal_nombre_empleado").val().toUpperCase(),
            apellido_paterno_empleado: $("#modal_apellido_paterno").val().toUpperCase(),
            apellido_materno_empleado: $("#modal_apellido_materno").val().toUpperCase(),
            domicilio_empleado: $("#modal_domicilio").val() || "",
            imss: $("#modal_imss").val() || "",
            curp: $("#modal_curp").val() || "",
            sexo: $("#modal_sexo").val(),
            grupo_sanguineo: $("#modal_grupo_sanguineo").val() || "",
            enfermedades_alergias: $("#modal_enfermedades_alergias").val() || "",
            fecha_ingreso: $("#modal_fecha_ingreso").val() || "",
            fecha_reingreso: $("#modal_fecha_reingreso").val() || "",
            id_departamento: $("#modal_departamento").val() || "",
            fecha_nacimiento: $("#modal_fecha_nacimiento").val() || "",
            num_casillero: $("#modal_num_casillero").val() || "",
            biometrico: $("#modal_biometrico").val() || "",
            telefono_empleado: $("#modal_telefono_empleado").val() || "",
            id_empresa: $("#modal_empresa").val() || "",
            id_area: $("#modal_area").val() || "",
            id_puestoEspecial: $("#modal_puesto").val() || "",
            nombre_contacto: $("#modal_emergencia_nombre").val().toUpperCase() || "",
            apellido_paterno_contacto: $("#modal_emergencia_ap_paterno").val().toUpperCase() || "",
            apellido_materno_contacto: $("#modal_emergencia_ap_materno").val().toUpperCase() || "",
            telefono_contacto: $("#modal_emergencia_telefono").val() || "",
            domicilio_contacto: $("#modal_emergencia_domicilio").val() || "",
            parentesco: $("#modal_emergencia_parentesco").val() || ""
        };

        // Validación mejorada con las funciones de validación
        let obligatoriosValidos = true;
        
        // Validar campos obligatorios y resaltar inválidos
        if (!validarClave(datos.clave_empleado)) {
            resaltarCampoInvalido('modal_clave_empleado');
            obligatoriosValidos = false;
        } else {
            resaltarCampoValido('modal_clave_empleado');
        }
        
        if (!validarNombre(datos.nombre_empleado)) {
            resaltarCampoInvalido('modal_nombre_empleado');
            obligatoriosValidos = false;
        } else {
            resaltarCampoValido('modal_nombre_empleado');
        }
        
        if (!validarApellido(datos.apellido_paterno_empleado)) {
            resaltarCampoInvalido('modal_apellido_paterno');
            obligatoriosValidos = false;
        } else {
            resaltarCampoValido('modal_apellido_paterno');
        }
        
        if (!validarApellido(datos.apellido_materno_empleado)) {
            resaltarCampoInvalido('modal_apellido_materno');
            obligatoriosValidos = false;
        } else {
            resaltarCampoValido('modal_apellido_materno');
        }
        
        if (!datos.sexo) {
            resaltarCampoInvalido('modal_sexo');
            obligatoriosValidos = false;
        } else {
            resaltarCampoValido('modal_sexo');
        }

        let opcionalesValidos = true;
        
        // Validar campos opcionales y resaltar inválidos
        if (datos.imss && !validarNSS(datos.imss)) {
            resaltarCampoInvalido('modal_imss');
            opcionalesValidos = false;
        } else if (datos.imss) {
            resaltarCampoValido('modal_imss');
        }
        
        if (datos.curp && !validarCURP(datos.curp)) {
            resaltarCampoInvalido('modal_curp');
            opcionalesValidos = false;
        } else if (datos.curp) {
            resaltarCampoValido('modal_curp');
        }
        
        if (datos.grupo_sanguineo && !validarGrupoSanguineo(datos.grupo_sanguineo)) {
            resaltarCampoInvalido('modal_grupo_sanguineo');
            opcionalesValidos = false;
        } else if (datos.grupo_sanguineo) {
            resaltarCampoValido('modal_grupo_sanguineo');
        }
        
        if (datos.nombre_contacto && !validarNombre(datos.nombre_contacto)) {
            resaltarCampoInvalido('modal_emergencia_nombre');
            opcionalesValidos = false;
        } else if (datos.nombre_contacto) {
            resaltarCampoValido('modal_emergencia_nombre');
        }
        
        if (datos.apellido_paterno_contacto && !validarApellido(datos.apellido_paterno_contacto)) {
            resaltarCampoInvalido('modal_emergencia_ap_paterno');
            opcionalesValidos = false;
        } else if (datos.apellido_paterno_contacto) {
            resaltarCampoValido('modal_emergencia_ap_paterno');
        }
        
        if (datos.apellido_materno_contacto && !validarApellido(datos.apellido_materno_contacto)) {
            resaltarCampoInvalido('modal_emergencia_ap_materno');
            opcionalesValidos = false;
        } else if (datos.apellido_materno_contacto) {
            resaltarCampoValido('modal_emergencia_ap_materno');
        }
        
        if (datos.parentesco && !validarParentesco(datos.parentesco)) {
            resaltarCampoInvalido('modal_emergencia_parentesco');
            opcionalesValidos = false;
        } else if (datos.parentesco) {
            resaltarCampoValido('modal_emergencia_parentesco');
        }
        
        if (datos.telefono_contacto && !validarTelefono(datos.telefono_contacto)) {
            resaltarCampoInvalido('modal_emergencia_telefono');
            opcionalesValidos = false;
        } else if (datos.telefono_contacto) {
            resaltarCampoValido('modal_emergencia_telefono');
        }
        
        if (datos.telefono_empleado && !validarTelefono(datos.telefono_empleado)) {
            resaltarCampoInvalido('modal_telefono_empleado');
            opcionalesValidos = false;
        } else if (datos.telefono_empleado) {
            resaltarCampoValido('modal_telefono_empleado');
        }

        if (!obligatoriosValidos) {
            mostrarAlerta('Existen campos obligatorios vacíos o incorrectos. Revisa los campos marcados en rojo.', 'warning');
            return;
        }

        if (!opcionalesValidos) {
            mostrarAlerta('Hay datos opcionales incorrectos. Revisa los campos marcados en rojo.', 'warning');
            return;
        }

        // Enviar datos al servidor
        $.ajax({
            type: "POST",
            url: "../empleados/php/update_empleado.php",
            data: datos,
            dataType: "json", // Asegurar que la respuesta se trate como JSON
            success: function (response) {
                // Verificar si hay una advertencia (casillero ocupado u otros errores)
                if (response.type === 'warning' || response.type === 'info') {
                    // Mostrar la advertencia con el mensaje específico
                    mostrarAlerta(response.text, response.type);
                    return;
                }
                
                // Si no hay advertencia, continuar con el flujo normal
                // Cerrar el modal
                $("#modal_actualizar_empleado").modal("hide");
                
                // Recargar la tabla de empleados
                const departamentoActual = $('#listaDepartamentos .active').data('departamento') || 'todos';
                cargarEmpleadosPorDepartamento(departamentoActual);
                
                // También recargar todosLosEmpleados para asegurar que los datos estén actualizados
                // Esto es importante para que los gafetes se generen con los datos actualizados
                cargarEmpleadosPorDepartamento('todos', true);
                
                // ACTUALIZACIÓN IMPORTANTE: Actualizar también los datos en la cache de empleados seleccionados
                // para que los gafetes se generen con los datos más recientes sin necesidad de recargar la página
                if (empleadosSeleccionados.has(datos.id_empleado)) {
                    // Actualizar los datos del empleado en la cache
                    setTimeout(function() {
                        // Buscar y actualizar el empleado en todosLosEmpleados
                        const empleadoIndex = todosLosEmpleados.findIndex(e => e.id_empleado == datos.id_empleado);
                        if (empleadoIndex !== -1) {
                            // Actualizar solo los campos que pueden cambiar
                            todosLosEmpleados[empleadoIndex].id_area = datos.id_area || null;
                            // Obtener el nombre del área seleccionada
                            const nombreArea = $("#modal_area option:selected").text();
                            todosLosEmpleados[empleadoIndex].nombre_area = nombreArea !== 'Ninguna' ? nombreArea : null;
                            
                            // Forzar una actualización visual si los gafetes están siendo mostrados
                            if ($('#modalGafetes').hasClass('show')) {
                                // Si el modal de gafetes está abierto, cerrarlo y mostrar un mensaje
                                $('#modalGafetes').modal('hide');
                                setTimeout(function() {
                                    mostrarAlerta('Datos actualizados. Por favor, genere nuevamente los gafetes para ver los cambios.', 'info');
                                }, 300);
                            }
                        }
                    }, 100);
                }
                
                // Mostrar mensaje de éxito
                mostrarAlerta('Empleado actualizado correctamente', 'success');
            },
            error: function(xhr, status, error) {
                 mostrarAlerta('Error al actualizar el empleado. Por favor, inténtelo de nuevo.', 'error');
            }
        });
    });

    // ======================================

    // Función para cargar y mostrar la foto actual del empleado
    function cargarFotoEmpleado(empleado) {
        const $fotoPreview = $('#foto_preview');
        const $noFotoPreview = $('#no_foto_preview');
        
        
        // Store employee data globally for access in other functions
        window.empleadoActual = empleado;
        
        if (empleado.ruta_foto && empleado.ruta_foto.trim() !== '') {
            $fotoPreview.attr('src', empleado.ruta_foto);
            $fotoPreview.show();
            $noFotoPreview.hide();
            $('#btn_eliminar_foto').prop('disabled', false);
        } else {
            $fotoPreview.hide();
            $noFotoPreview.show();
            $('#btn_eliminar_foto').prop('disabled', true);
        }
    }

    // Event listener para el input de nueva foto
    $('#nueva_foto').on('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                mostrarAlerta('Por favor seleccione un archivo de imagen válido', 'warning');
                $(this).val('');
                return;
            }
            
            // Validar tamaño (máximo 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                mostrarAlerta('El archivo es demasiado grande. Máximo 5MB permitido', 'warning');
                $(this).val('');
                return;
            }
            
            // Crear vista previa
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#nueva_foto_preview').attr('src', e.target.result);
                $('#nueva_foto_preview_container').show();
                $('#btn_subir_foto').prop('disabled', false);
            };
            reader.readAsDataURL(file);
        } else {
            $('#nueva_foto_preview_container').hide();
            $('#btn_subir_foto').prop('disabled', true);
        }
    });

    // Event listener para subir foto
    $('#btn_subir_foto').on('click', function() {
        const fileInput = $('#nueva_foto')[0];
        const file = fileInput.files[0];
        const idEmpleado = $('#empleado_id').val();
        
        
        if (!file || !idEmpleado) {
            mostrarAlerta('Seleccione una foto e intente de nuevo', 'warning');
            return;
        }
        
        const formData = new FormData();
        formData.append('foto', file);
        formData.append('id_empleado', idEmpleado);
        
        // Mostrar indicador de carga
        const $btnSubir = $(this);
        const textoOriginal = $btnSubir.html();
        $btnSubir.html('<i class="bi bi-hourglass-split"></i> Subiendo...');
        $btnSubir.prop('disabled', true);
        
        $.ajax({
            url: 'php/subir_foto_empleado.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                try {
                    // Handle both JSON and plain text responses
                    let result;
                    if (typeof response === 'string') {
                        result = JSON.parse(response);
                    } else {
                        result = response;
                    }
                    if (result.success) {
                        mostrarAlerta('Foto subida correctamente', 'success');
                        // Actualizar la vista previa de la foto
                        $('#foto_preview').attr('src', result.ruta_foto).show();
                        $('#no_foto_preview').hide();
                        $('#btn_eliminar_foto').prop('disabled', false);
                        // Limpiar el input y la vista previa de nueva foto
                        $('#nueva_foto').val('');
                        $('#nueva_foto_preview_container').hide();
                        $('#btn_subir_foto').prop('disabled', true);
                        
                        // Actualizar también la ruta de foto en el objeto empleado actual
                        // para que se refleje en otros lugares donde se use
                        if (typeof window.empleadoActual !== 'undefined') {
                            window.empleadoActual.ruta_foto = result.ruta_foto;
                        }
                        
                        // Forzar la actualización de la imagen para evitar problemas de caché
                        $('#foto_preview').attr('src', result.ruta_foto + '?t=' + new Date().getTime());
                    } else {
                        mostrarAlerta(result.message || 'Error al subir la foto', 'error');
                    }
                } catch (e) {
                   
                    mostrarAlerta('Error al procesar la respuesta del servidor', 'error');
                }
            },
            error: function(xhr, status, error) {
                mostrarAlerta('Error al subir la foto: ' + error, 'error');
            },
            complete: function() {
                // Restaurar el botón
                $btnSubir.html(textoOriginal);
                $btnSubir.prop('disabled', false);
            }
        });
    });

    // Event listener para eliminar foto
    $('#btn_eliminar_foto').on('click', function() {
        const idEmpleado = $('#empleado_id').val();
        
        
        if (!idEmpleado) {
            mostrarAlerta('No se puede eliminar la foto: ID de empleado no encontrado', 'warning');
            return;
        }
        
        // Mostrar modal de confirmación personalizado
        mostrarConfirmacionEliminarFoto(idEmpleado);
    });
    
    // Función para mostrar confirmación personalizada para eliminar foto
    function mostrarConfirmacionEliminarFoto(idEmpleado) {
        // Crear el modal de confirmación
        const modalId = 'modalConfirmacionEliminarFoto';
        
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
        modal.setAttribute('aria-labelledby', 'modalConfirmacionEliminarFotoLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content confirmacion-modal">
                    <div class="confirmacion-header">
                        <div class="confirmacion-icon">
                            <i class="bi bi-trash3-fill"></i>
                        </div>
                        <h5 class="confirmacion-title" id="modalConfirmacionEliminarFotoLabel">
                            Confirmar Eliminación
                        </h5>
                    </div>
                    <div class="confirmacion-body">
                        <p class="confirmacion-message">
                            ¿Está seguro de que desea eliminar la foto de este empleado?
                        </p>
                        <div class="confirmacion-warning">
                            <small>Esta acción no se puede deshacer</small>
                        </div>
                    </div>
                    <div class="confirmacion-footer">
                        <button type="button" class="btn btn-confirmacion btn-cancelar" data-bs-dismiss="modal">
                            <i class="bi bi-x-lg"></i> Cancelar
                        </button>
                        <button type="button" class="btn btn-confirmacion btn-confirmar" id="btnConfirmarEliminarFoto">
                            <i class="bi bi-trash3"></i> Sí, Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar el modal al DOM
        document.body.appendChild(modal);
        
        // Configurar eventos
        const btnConfirmar = modal.querySelector('#btnConfirmarEliminarFoto');
        btnConfirmar.addEventListener('click', () => {
            // Cerrar el modal
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            
            // Ejecutar la eliminación
            ejecutarEliminarFoto(idEmpleado);
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
    // Función para ejecutar la eliminación de la foto
    function ejecutarEliminarFoto(idEmpleado) {
        const $btnEliminar = $('#btn_eliminar_foto');
        const textoOriginal = $btnEliminar.html();
        $btnEliminar.html('<i class="bi bi-hourglass-split"></i> Eliminando...');
        $btnEliminar.prop('disabled', true);
        
        $.ajax({
            url: 'php/eliminar_foto_empleado.php',
            type: 'POST',
            data: { id_empleado: idEmpleado },
            dataType: 'json', // Especificar que esperamos JSON
            success: function(result) {
              
                if (result.success) {
                    mostrarAlerta('Foto eliminada correctamente', 'success');
                    // Actualizar la vista previa
                    $('#foto_preview').hide();
                    $('#no_foto_preview').show();
                    $('#btn_eliminar_foto').prop('disabled', true);
                    // Limpiar el input y la vista previa de nueva foto
                    $('#nueva_foto').val('');
                    $('#nueva_foto_preview_container').hide();
                    $('#btn_subir_foto').prop('disabled', true);
                } else {
                    mostrarAlerta(result.message || 'Error al eliminar la foto', 'error');
                }
            },
            error: function(xhr, status, error) {
             
                mostrarAlerta('Error al eliminar la foto: ' + error, 'error');
            },
            complete: function() {
                // Restaurar el botón
                $btnEliminar.html(textoOriginal);
                $btnEliminar.prop('disabled', false);
            }
        });
    }

    // Event listener para abrir el modal de editar empleado
    $('#btn_editar_empleado').on('click', function() {
        const idEmpleado = $('#empleado_id').val();
        if (!idEmpleado) {
            mostrarAlerta('No se puede editar el empleado: ID de empleado no encontrado', 'warning');
            return;
        }
        $.ajax({
            url: '../empleados/php/obtener_empleado.php',
            type: 'POST',
            data: { id_empleado: idEmpleado },
            success: function(response) {
                try {
                    const empleado = JSON.parse(response);
                    if (empleado) {
                        $('#modal_actualizar_empleado').modal('show');
                        $('#empleado_id').val(empleado.id_empleado);
                        $('#nombre').val(empleado.nombre);
                        $('#apellidos').val(empleado.apellidos);
                        $('#cargo').val(empleado.cargo);
                        $('#telefono').val(empleado.telefono);
                        $('#email').val(empleado.email);
                        cargarFotoEmpleado(empleado);
                    } else {
                        mostrarAlerta('No se pudo obtener la información del empleado', 'error');
                    }
                } catch (e) {
                    mostrarAlerta('Error al procesar la respuesta del servidor', 'error');
                }
            },
            error: function(xhr, status, error) {
                mostrarAlerta('Error al obtener la información del empleado: ' + error, 'error');
            }
        });
    });

    // Función para limpiar la pestaña de foto al cerrar el modal
    $('#modal_actualizar_empleado').on('hidden.bs.modal', function() {
        $('#nueva_foto').val('');
        $('#nueva_foto_preview_container').hide();
        $('#btn_subir_foto').prop('disabled', true);
        $('#foto_preview').hide();
    });

    // ======================================
    // FUNCIÓN DE ALERTA ESTILO GAFETES
    // ======================================
    
    // Función para mostrar alertas específicas de gafetes (mismo estilo que fotos)
    function mostrarAlertaGafete(mensaje, tipo = 'info') {
        const alerta = document.createElement('div');
        alerta.className = `alerta-gafete alerta-${tipo}`;
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
    
    // ======================================
    // FUNCIONES DE VALIDACIÓN
    // ======================================
    
    // Función para validar campos de texto
    function validarCampoTexto(campo, mensaje) {
        if (campo.val().trim() === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de correo electrónico
    function validarCorreoElectronico(campo, mensaje) {
        const correo = campo.val().trim();
        if (correo === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correoValido.test(correo)) {
            mostrarAlerta('Correo electrónico no válido', 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de teléfono
    function validarTelefono(campo, mensaje) {
        // Verificar si campo es un objeto jQuery o un valor directo
        let telefono;
        if (typeof campo === 'string') {
            // Si es un string, usarlo directamente
            telefono = campo.trim();
        } else if (campo && typeof campo.val === 'function') {
            // Si es un objeto jQuery, usar su método val()
            telefono = campo.val().trim();
        } else {
            // Si no es ninguno de los anteriores, mostrar error
            mostrarAlerta('Campo de teléfono inválido', 'error');
            return false;
        }
        
        if (telefono === '') {
            mostrarAlerta(mensaje, 'error');
            // Solo intentar enfocar si campo es un objeto jQuery
            if (campo && typeof campo.focus === 'function') {
                campo.focus();
            }
            return false;
        }
        const telefonoValido = /^\d{10}$/;
        if (!telefonoValido.test(telefono)) {
            mostrarAlerta('Teléfono no válido (debe ser de 10 dígitos)', 'error');
            // Solo intentar enfocar si campo es un objeto jQuery
            if (campo && typeof campo.focus === 'function') {
            campo.focus();
            }
            return false;
        }
        return true;
    }

    // Función para validar campos de contraseña
    function validarContraseña(campo, mensaje) {
        const contraseña = campo.val().trim();
        if (contraseña === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const contraseñaValida = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!contraseñaValida.test(contraseña)) {
            mostrarAlerta('Contraseña no válida (debe tener al menos 8 caracteres, una letra y un número)', 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de contraseña coincidentes
    function validarContraseñasCoincidentes(campo1, campo2, mensaje) {
        if (campo1.val() !== campo2.val()) {
            mostrarAlerta(mensaje, 'error');
            campo2.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de foto
    function validarFoto(campo, mensaje) {
        const archivo = campo[0].files[0];
        if (!archivo) {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const tiposValidos = ['image/jpeg', 'image/png'];
        if (!tiposValidos.includes(archivo.type)) {
            mostrarAlerta('Formato de archivo no válido (solo se permiten JPEG y PNG)', 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de selección
    function validarSeleccion(campo, mensaje) {
        if (campo.val() === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de fecha
    function validarFecha(campo, mensaje) {
        const fecha = campo.val().trim();
        if (fecha === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const fechaValida = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaValida.test(fecha)) {
            mostrarAlerta('Fecha no válida (debe ser en formato YYYY-MM-DD)', 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de número
    function validarNumero(campo, mensaje) {
        const numero = campo.val().trim();
        if (numero === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const numeroValido = /^\d+$/;
        if (!numeroValido.test(numero)) {
            mostrarAlerta('Número no válido', 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de número decimal
    function validarNumeroDecimal(campo, mensaje) {
        const numero = campo.val().trim();
        if (numero === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const numeroValido = /^\d+(\.\d{1,2})?$/;
        if (!numeroValido.test(numero)) {
            mostrarAlerta('Número decimal no válido', 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de número entero
    function validarNumeroEntero(campo, mensaje) {
        const numero = campo.val().trim();
        if (numero === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const numeroValido = /^\d+$/;
        if (!numeroValido.test(numero)) {
            mostrarAlerta('Número entero no válido', 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de número positivo
    function validarNumeroPositivo(campo, mensaje) {
        const numero = campo.val().trim();
        if (numero === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const numeroValido = /^\d+(\.\d{1,2})?$/;
        if (!numeroValido.test(numero) || parseFloat(numero) <= 0) {
            mostrarAlerta('Número positivo no válido', 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de número negativo
    function validarNumeroNegativo(campo, mensaje) {
        const numero = campo.val().trim();
        if (numero === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const numeroValido = /^-\d+(\.\d{1,2})?$/;
        if (!numeroValido.test(numero)) {
            mostrarAlerta('Número negativo no válido', 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de número entero positivo
    function validarNumeroEnteroPositivo(campo, mensaje) {
        const numero = campo.val().trim();
        if (numero === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const numeroValido = /^\d+$/;
        if (!numeroValido.test(numero) || parseInt(numero) <= 0) {
            mostrarAlerta('Número entero positivo no válido', 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de número entero negativo
    function validarNumeroEnteroNegativo(campo, mensaje) {
        const numero = campo.val().trim();
        if (numero === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const numeroValido = /^-\d+$/;
        if (!numeroValido.test(numero)) {
            mostrarAlerta('Número entero negativo no válido', 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de texto con longitud mínima
    function validarTextoMinimo(campo, longitud, mensaje) {
        if (campo.val().trim().length < longitud) {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de texto con longitud máxima
    function validarTextoMaximo(campo, longitud, mensaje) {
        if (campo.val().trim().length > longitud) {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de texto con longitud exacta
    function validarTextoExacto(campo, longitud, mensaje) {
        if (campo.val().trim().length !== longitud) {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de texto con expresión regular
    function validarTextoExpresion(campo, expresion, mensaje) {
        const texto = campo.val().trim();
        if (texto === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        if (!expresion.test(texto)) {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de texto con caracteres permitidos
    function validarTextoPermitidos(campo, caracteres, mensaje) {
        const texto = campo.val().trim();
        if (texto === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        if (!/^[\w\s]+$/.test(texto)) {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de texto con caracteres no permitidos
    function validarTextoNoPermitidos(campo, caracteres, mensaje) {
        const texto = campo.val().trim();
        if (texto === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        if (/[^\w\s]/.test(texto)) {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        return true;
    }

    // Función para validar campos de texto con palabras clave
    function validarTextoClaves(campo, claves, mensaje) {
        const texto = campo.val().trim();
        if (texto === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const palabras = texto.split(' ');
        for (let palabra of palabras) {
            if (!claves.includes(palabra)) {
                mostrarAlerta(mensaje, 'error');
                campo.focus();
                return false;
            }
        }
        return true;
    }

    // Función para validar campos de texto sin palabras clave
    function validarTextoSinClaves(campo, claves, mensaje) {
        const texto = campo.val().trim();
        if (texto === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const palabras = texto.split(' ');
        for (let palabra of palabras) {
            if (claves.includes(palabra)) {
                mostrarAlerta(mensaje, 'error');
                campo.focus();
                return false;
            }
        }
        return true;
    }

    // Función para validar campos de texto con palabras clave exactas
    function validarTextoClavesExactas(campo, claves, mensaje) {
        const texto = campo.val().trim();
        if (texto === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const palabras = texto.split(' ');
        if (palabras.length !== claves.length) {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        for (let i = 0; i < palabras.length; i++) {
            if (palabras[i] !== claves[i]) {
                mostrarAlerta(mensaje, 'error');
                campo.focus();
                return false;
            }
        }
        return true;
    }

    // Función para validar campos de texto con palabras clave en orden
    function validarTextoClavesOrden(campo, claves, mensaje) {
        const texto = campo.val().trim();
        if (texto === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const palabras = texto.split(' ');
        const clavesOrdenadas = claves.sort();
        const palabrasOrdenadas = palabras.sort();
        if (palabrasOrdenadas.length !== clavesOrdenadas.length) {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        for (let i = 0; i < palabrasOrdenadas.length; i++) {
            if (palabrasOrdenadas[i] !== clavesOrdenadas[i]) {
                mostrarAlerta(mensaje, 'error');
                campo.focus();
                return false;
            }
        }
        return true;
    }

    // Función para validar campos de texto con palabras clave en orden inverso
    function validarTextoClavesOrdenInverso(campo, claves, mensaje) {
        const texto = campo.val().trim();
        if (texto === '') {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        const palabras = texto.split(' ');
        const clavesOrdenInverso = claves.reverse();
        const palabrasOrdenInverso = palabras.reverse();
        if (palabrasOrdenInverso.length !== clavesOrdenInverso.length) {
            mostrarAlerta(mensaje, 'error');
            campo.focus();
            return false;
        }
        for (let i = 0; i < palabrasOrdenInverso.length; i++) {
            if (palabrasOrdenInverso[i] !== clavesOrdenInverso[i]) {
                mostrarAlerta(mensaje, 'error');
                campo.focus();
                return false;
            }
        }
        return true;
    }
    
    // ======================================
    // FUNCIÓN DE CONFIRMACIÓN LIMPIAR FOTOS
    // ======================================
    
    // Función para mostrar modal de confirmación para limpiar fotos
    function mostrarConfirmacionLimpiar() {
        // Crear el modal de confirmación
        const modalId = 'modalConfirmacionLimpiar';
        
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
        modal.setAttribute('aria-labelledby', 'modalConfirmacionLimpiarLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content confirmacion-limpiar">
                    <div class="modal-header">
                        <div class="confirmacion-icon">
                            <i class="bi bi-trash3-fill"></i>
                        </div>
                        <h5 class="modal-title" id="modalConfirmacionLimpiarLabel">
                            Confirmar Limpieza de Fotos
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="confirmacion-mensaje">
                            <p><strong>¿Estás seguro de que deseas eliminar las fotos que no están asociadas a ningún empleado?</strong></p>
                            <p class="text-muted">Esta acción eliminará permanentemente todos los archivos de imagen que no estén vinculados a empleados activos en el sistema.</p>
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
                        <button type="button" class="btn btn-danger" id="btnConfirmarLimpiar">
                            <i class="bi bi-trash3"></i> Sí, Eliminar Fotos
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar el modal al DOM
        document.body.appendChild(modal);
        
        // Configurar eventos
        const btnConfirmar = modal.querySelector('#btnConfirmarLimpiar');
        btnConfirmar.addEventListener('click', () => {
            // Cerrar el modal
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            
            // Ejecutar la limpieza
            limpiarFotosHuerfanas();
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
});