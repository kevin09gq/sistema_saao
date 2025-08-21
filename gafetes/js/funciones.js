$(document).ready(function () {
    // Variables globales
    let empleados = [];
    let empleadosFiltrados = [];
    let departamentos = [];
    let empleadosSeleccionados = new Set();
    let paginaActual = 1;
    const empleadosPorPagina = 10;
    let todosLosEmpleados = [];
    let ordenClave = 'asc'; // 'asc' o 'desc' para controlar el orden de la columna Clave

    // Cargar departamentos al iniciar
    cargarDepartamentos();

    // Cargar todos los empleados inicialmente
    cargarEmpleadosPorDepartamento('todos', true); // true para indicar que es carga global

    // Evento para seleccionar todos los empleados
    $('#seleccionarTodos').click(function () {
        $('.empleado-checkbox').prop('checked', true);
        empleadosSeleccionados = new Set(empleados.map(e => e.id_empleado));
        actualizarContadorSeleccionados();
    });

    // Evento para deseleccionar todos los empleados
    $('#deseleccionarTodos').click(function () {
        $('.empleado-checkbox').prop('checked', false);
        empleadosSeleccionados.clear();
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

    // Evento para generar gafetes
    $('#generarGafetes').click(function () {
        // Verificar si hay empleados seleccionados en el set
        if (empleadosSeleccionados.size === 0) {
            alert('Por favor, seleccione al menos un empleado para generar el gafete.');
            return;
        }
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
        actualizarContadorSeleccionados();
    });

    // Evento para imprimir gafetes
    $('#imprimirGafetes').click(function () {
        // Cerrar el modal si está abierto
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalGafetes'));
        if (modalInstance) {
            modalInstance.hide();
        }
        // Mostrar los gafetes en el DOM (sin mostrar modal)
        mostrarGafetes(true); // true = modo impresion
        // Crear una nueva ventana solo para imprimir
        const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
        // Obtener solo el contenido de los gafetes
        const contenidoGafetes = $('#contenidoGafetes').html();
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
    });

    // Función para cargar departamentos
    function cargarDepartamentos() {
        $.ajax({
            url: 'php/obtenerDepartamentos.php',
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
                console.error('Error al cargar departamentos:', error);
                console.error('Status:', status);
                console.error('Response:', xhr.responseText);
                
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
                empleados = data;
                if (esCargaGlobal) {
                    todosLosEmpleados = data; // Guardar todos los empleados globalmente
                }
                actualizarTablaEmpleados();
            },
            error: function (xhr, status, error) {
                console.error('Error al cargar empleados:', error);
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
            $cuerpo.append('<tr><td colspan="5" class="text-center">No se encontraron empleados</td></tr>');
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
            $cuerpo.append(`
                <tr>
                    <td>${empleado.clave_empleado}</td>
                    <td>${empleado.nombre} ${empleado.ap_paterno || ''} ${empleado.ap_materno || ''}</td>
                    <td>${obtenerNombreDepartamento(empleado.id_departamento)}</td>
                    <td>${empleado.nombre_area || 'Sin asignar'}</td>
                    <td class="text-center">
                        <input type="checkbox" class="form-check-input empleado-checkbox" 
                               data-id="${empleado.id_empleado}" value="${empleado.id_empleado}" 
                               ${estaSeleccionado ? 'checked' : ''}>
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
        
        const area = empleado.nombre_area.toLowerCase();
        
        switch (area) {
            case 'empaque':
                return '#041F08'; // Verde fuerte
            case 'rancho relicario':
                return '#56070c'; // Color vino
            case 'rancho pilar':
                return '#443263'; // Color lila
            case 'rancho huasteca':
                return '#0A610A'; // Verde claro
            default:
                return '#06320c'; // Color por defecto
        }
    }

    // Función para actualizar el contador de empleados seleccionados
    function actualizarContadorSeleccionados() {
        const total = empleadosSeleccionados.size;
        const $boton = $('#generarGafetes');

        if (total > 0) {
            $boton.html(`<i class="bi bi-card-checklist"></i> Generar gafetes (${total})`);
            $boton.removeClass('btn-warning').addClass('btn-success');
        } else {
            $boton.html('<i class="bi bi-card-checklist"></i> Generar gafetes');
            $boton.removeClass('btn-success').addClass('btn-warning');
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
        const columnas = 3;
        // Agrupar empleados en páginas de 3
        for (let i = 0; i < idsUnicos.length; i += columnas) {
            const grupo = idsUnicos.slice(i, i + columnas);
            // Contenedor de la "página"
            const $pagina = $('<div class="gafetes-pagina" style="width:100%;display:grid;grid-template-columns:repeat(3,6cm);justify-content:center;align-items:start;gap:0.5cm;page-break-after:always;min-height:20cm;"></div>');
            // Por cada empleado en la página, crear una columna con frente y reverso
            grupo.forEach(idEmpleado => {
                const empleado = todosLosEmpleados.find(e => e.id_empleado == idEmpleado); // <-- CAMBIO: buscar en todosLosEmpleados
                if (!empleado) return;
                // --- Frente ---
                const nombreCompleto = `${empleado.nombre} ${empleado.ap_paterno || ''} ${empleado.ap_materno || ''}`.trim();
                const primerNombre = empleado.nombre ? empleado.nombre.split(' ')[0] : '';
                const departamento = obtenerNombreDepartamento(empleado.id_departamento);
                // Calcular tamaño de fuente para el departamento
                const deptoLength = departamento.replace(/\s+/g, '').length;
                const fontSizeDepto = deptoLength >= 13 ? '8.2pt' : '10pt';
                const fotoHtml = empleado.foto ? `<img src="img/logo.jpg" alt="Foto" class="foto-empleado" style="width:100%;height:100%;object-fit:cover;">` : '';
                const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
                const fechaInicio = new Date();
                const fechaFin = new Date(fechaInicio);
                fechaFin.setMonth(fechaFin.getMonth() + 6);
                if (fechaFin.getDate() !== fechaInicio.getDate()) {
                    fechaFin.setDate(0);
                }
                const pad = n => n.toString().padStart(2, '0');
                const formato = (f) => `${pad(f.getDate())}/${meses[f.getMonth()]}/${f.getFullYear()}`;
                const vigenciaHtml = `<div style='font-size:6pt;font-weight:bold;text-align:center;margin-bottom:0.1cm;'>Vigencia: <span style='background:#ffe066;padding:0 0.1cm;border-radius:2px;'>${formato(fechaInicio)} AL ${formato(fechaFin)}</span></div>`;
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
                // Determinar el tamaño de letra según la longitud de las palabras (simplificado)
                const nombreSinEspacios = nombreCompleto.replace(/\s+/g, '');
                let fontSizeNombre;
                if (nombreAgrupado.some(p => p.replace(/\s+/g, '').length >= 13)) {
                    fontSizeNombre = '8.5pt';
                } else if (nombreSinEspacios.length >= 13) {
                    fontSizeNombre = '8.7pt';
                } else {
                    fontSizeNombre = '11pt';
                }
                const nombreEnLineas = nombreAgrupado.map(p => `<span style='display:block;text-align:left !important;font-size:inherit !important;'>${p}</span>`).join('');
                const colorArea = obtenerColorArea(empleado);
                const $frente = $(
                    `<div class="gafete" style="border:2px solid ${colorArea} !important;height:9.5cm !important;min-height:9.5cm !important;max-height:9.5cm !important;width:6cm !important;min-width:6cm !important;max-width:6cm !important;font-family:Segoe UI Black;margin-bottom:0!important;margin-top:0!important;padding:0.2cm !important;font-size:7pt !important;">
                        <div style="width:100%;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.06cm;">
                            <img src="img/logo.jpg" alt="Logo" style="max-width:1.8cm;max-height:1.6cm;object-fit:contain;display:block;margin-top:0.02cm;">
                            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.05cm;max-width:2.8cm;">
                                <img src="img/logo2.png" alt="Logo2" style="max-width:2.5cm;max-height:1.4cm;object-fit:contain;display:block;">
                                <div style="font-size:6.5pt !important;font-weight:bold;color:${colorArea};text-align:right;line-height:1.05;">${empleado.nombre_empresa ? empleado.nombre_empresa : ''}</div>
                            </div>
                        </div>
                        <div class="gafete-body" style="font-size:7pt;display:flex;flex-direction:row;align-items:flex-start;gap:0.2cm;min-height:5.5cm;">
                            <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-start;align-items:flex-start;gap:0.1cm;">
                                <div style="font-size:13px !important;font-weight:800;text-align:left !important;padding-left:0.1cm;padding-top:0.2cm;padding-bottom:0.05cm;line-height:1.1;color:${colorArea};">
                                    <strong style='color:${colorArea};font-size:8pt !important;text-align:left !important;'>Trabajador:</strong>
                                    <span class='nombre-gafete-frente' style='color:${colorArea};text-align:left !important;font-size:${fontSizeNombre} !important;font-weight:800;line-height:1.1;display:block;'>${nombreEnLineas}</span>
                                </div>
                                <div style="font-size:7pt;text-align:left !important;padding-left:0.1cm;margin-top:0.05cm;"><strong style='color:${colorArea};font-size:8pt !important;'>Área:</strong><br>
                                 <span class='dato-gafete-frente' style='color:${colorArea};text-align:left !important;font-size:${fontSizeDepto} !important;'>${departamento}</span></div>
                                <div style="font-size:8pt !important;text-align:left;padding-left:0.1cm;margin-top:0.2cm;"><strong style='color:${colorArea};font-size:8pt !important;'>Clave:</strong> 
                                 <span class='dato-gafete-frente' style='color:${colorArea};'>${empleado.clave_empleado}</span></div>
                                <div style="font-size:8pt !important;text-align:left;padding-left:0.1cm;margin-top:0.2cm;"><strong style='color:${colorArea};font-size:8pt !important;'>Sexo:</strong> 
                                 <span class='dato-gafete-frente' style='color:${colorArea};'>${empleado.sexo ? empleado.sexo : 'N/A'}</span></div>
                            </div>
                                <div style="flex:0 0 2.5cm;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;">
                                ${vigenciaHtml}
                                <div class="gafete-foto" style="margin:0.1cm 0;">
                                    <div class="marco-foto" style="width:1cm;height:2cm;border:1px solid #000;border-radius:0;margin:0 auto;overflow:hidden;">${fotoHtml}</div>
                                </div>
                                    <div class="gafete-sello" style="margin-top:0.1cm;text-align:center;font-size:5pt !important;font-weight:bold;letter-spacing:0.5px;">
                                    Sello de autenticidad
                                </div>
                                <div style="margin-top:0.3cm;text-align:left;font-size:7pt !important;font-weight:bold;letter-spacing:0.5px;color:${colorArea};">
                                    Casillero: ${empleado.num_casillero}
                                </div>
                            </div>
                        </div>
                        <div class="gafete-nombre-rect" style="margin-top:auto;display:flex;justify-content:center;align-items:center;">
                                    <div style="width:100%;background:${colorArea};border:none;border-radius:4px;padding:0.1cm 0;text-align:center;font-size:17pt !important;font-weight:bold;letter-spacing:0.5px;color:#fff;margin-top:0.1cm;">${primerNombre}</div>
                        </div>
                    </div>`
                );
                // --- Reverso ---
                const datosAtras = `
                    <div style='margin-bottom:0.08cm;'>
                       <span style='font-size:7pt !important;font-weight:bold;color:${colorArea};font-family:Segoe UI Black;line-height:1 !important;'>Domicilio de Trabajador:</span><br>
                        <span style='font-size:6.5pt !important;color:${colorArea};'>${empleado.domicilio ? empleado.domicilio : 'N/A'}</span>
                    </div>
                    <div style='display:flex;justify-content:space-between;gap:0.12cm;margin-bottom:0.08cm !important;'>
                        <div style='flex:1;'>
                            <span style='font-size:7pt !important;font-weight:bold;color:${colorArea};font-family:Segoe UI Black;line-height:1 !important;'>IMSS:</span><br>
                            <span style='font-size:6.5pt !important;color:${colorArea};line-height:1 !important;'>${empleado.imss ? empleado.imss : 'N/A'}</span>
                        </div>
                        <div style='flex:1;'>
                            <span style='font-size:7pt !important;font-weight:bold;color:${colorArea};font-family:Segoe UI Black;line-height:1 !important;'>CURP:</span><br>
                            <span style='font-size:6.5pt !important;color:${colorArea};line-height:1 !important;'>${empleado.curp ? empleado.curp : 'N/A'}</span>
                        </div>
                    </div>
                    <div style='margin-bottom:0.08cm !important;'>
                        <span style='font-size:7pt !important;font-weight:bold;color:${colorArea};font-family:Segoe UI Black;line-height:1 !important;'>Fecha de nacimiento:</span><br>
                        <span style='font-size:6.5pt !important;color:${colorArea};line-height:1 !important;'>${empleado.fecha_nacimiento ? formatearFechaYMDaDMY(empleado.fecha_nacimiento) : 'N/A'}</span>
                    </div>
                    <div style='margin-bottom:0.08cm !important;'>
                        <span style='font-size:7pt !important;font-weight:bold;color:${colorArea};font-family:Segoe UI Black;line-height:1 !important;'>Enfermedades/Alergias:</span><br>
                        <span style='font-size:6.5pt !important;color:${colorArea};line-height:1 !important;'>${empleado.enfermedades_alergias ? empleado.enfermedades_alergias : 'N/A'}</span>
                    </div>
                    <div style='margin-bottom:0.08cm !important;'>
                        <span style='font-size:7pt !important;font-weight:bold;color:${colorArea};font-family:Segoe UI Black;line-height:1 !important;'>Grupo sanguíneo:</span><br>
                        <span style='font-size:6.5pt !important;color:${colorArea};line-height:1 !important;'>${empleado.grupo_sanguineo ? empleado.grupo_sanguineo : 'N/A'}</span>
                    </div>
                    <div style='margin-bottom:0.06cm !important;'>
                        <span style='font-size:7pt !important;font-weight:bold;color:${colorArea};font-family:Segoe UI Black;line-height:1 !important;'>Fecha de ingreso:</span><br>
                        <span style='font-size:6.5pt !important;color:${colorArea};line-height:1 !important;'>${empleado.fecha_ingreso ? formatearFechaYMDaDMY(empleado.fecha_ingreso) : 'N/A'}</span>
                    </div>
                    <div style='background:${colorHexToRgba(colorArea, 0.12)};border-radius:4px;padding:0.08cm 0.10cm;margin-top:0.06cm;width:100%;box-sizing:border-box;'>
                        <div style="margin-bottom:0.08cm !important;"><span style="font-size:7pt !important;font-weight:bold;color:${colorArea};font-family:Segoe UI Black;">En caso de emergencia llamar a:</span></div>
                        <div style='text-align:center;margin-bottom:0.03cm;'>
                            <span style='font-size:7pt !important;color:${colorArea};'>
                                ${(empleado.emergencia_parentesco ? empleado.emergencia_parentesco : 'N/A')} - ${(empleado.emergencia_nombre_contacto ? empleado.emergencia_nombre_contacto : 'N/A')}
                            </span>
                        </div>
                        <div style='text-align:center;margin-bottom:0.03cm;'><span style='font-size:7pt !important;color:${colorArea};'>${formatearTelefono(empleado.emergencia_telefono)}</span></div>
                        <div style='text-align:center;'><span style='font-size:6.5pt !important;color:${colorArea};'>${empleado.emergencia_domicilio ? empleado.emergencia_domicilio : 'N/A'}</span></div>
                    </div>
                `;
                const $reverso = $(
                    `<div class="gafete" style="transform: rotate(180deg); border:2px solid ${colorArea} !important;height:9.5cm !important;min-height:9.5cm !important;max-height:9.5cm !important;width:6cm !important;min-width:6cm !important;max-width:6cm !important;font-family:Segoe UI Black;margin-bottom:0!important;margin-top:0!important;padding:0.2cm !important;font-size:6pt !important;overflow:hidden;box-sizing:border-box;">
                        <div style="width:100%;display:flex;justify-content:space-between;align-items:center;margin-bottom:0.1cm;">
                            <img src="img/logo.jpg" alt="Logo" style="max-width:1.8cm;max-height:1.8cm;object-fit:contain;display:block;">
                            <img src="img/logo2.png" alt="Logo2" style="max-width:2.8cm;max-height:1.8cm;object-fit:contain;display:block;">
                        </div>
                        <div class="gafete-body" style="justify-content: flex-start; font-size:5pt;">
                            <div style='font-size:6pt;'>
                                ${datosAtras.replace(/(Domicilio de trabajador:|Domicilio:|Domicilio de emergencia:)/g, '<span style=\"font-size:6pt;\">$1')}</div>
                        </div>
                    </div>`
                );
                // Contenedor columna (frente + reverso) con ancho y alto fijos
                const $columna = $('<div style="display:flex;flex-direction:column;justify-content:flex-start;align-items:center;gap:0;margin:0;padding:0;width:6cm !important;min-width:6cm !important;max-width:6cm !important;height:20cm !important;min-height:20cm !important;max-height:20cm !important;position:relative;"></div>');
                // Agregar el frente en la parte superior
                $columna.append($frente);
                // Agregar un pequeño espacio entre frente y reverso
                $columna.append($('<div style="height:0.2cm;"></div>'));
                // Ajustar estilos para mantener consistencia
                $reverso.css({
                    'margin': '0 auto',
                    'padding': '0',
                    'width': '6cm !important',
                    'min-width': '6cm !important',
                    'max-width': '6cm !important',
                    'height': '9.5cm !important',
                    'min-height': '9.5cm !important',
                    'max-height': '9.5cm !important',
                    'position': 'relative',
                    'display': 'block'
                });
                $frente.css({
                    'margin': '0 auto',
                    'padding': '0',
                    'width': '6cm !important',
                    'min-width': '6cm !important',
                    'max-width': '6cm !important',
                    'height': '9.5cm !important',
                    'min-height': '9.5cm !important',
                    'max-height': '9.5cm !important',
                    'display': 'block'
                });
                // Agregar el reverso debajo del frente
                $columna.append($reverso);
                $pagina.append($columna);
            });
            // Si hay menos de 3 empleados, rellenar columnas vacías para mantener el layout
            for (let j = grupo.length; j < columnas; j++) {
                $pagina.append('<div style="width:6cm;min-width:6cm;max-width:6cm;height:20cm;min-height:20cm;"></div>');
            }
            $contenido.append($pagina);
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
});