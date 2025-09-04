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
                        console.log('Logo de área encontrado:', logoAreaUrl);
                    }
                }

                // Si el empleado tiene empresa, buscar su logo
                if (empleado.id_empresa && window.actualizadorLogos.empresas) {
                    const empresa = window.actualizadorLogos.empresas.find(e => e.id_empresa == empleado.id_empresa);
                    if (empresa && empresa.logo_empresa) {
                        logoEmpresaUrl = `logos_empresa/${empresa.logo_empresa}`;
                        console.log('Logo de empresa encontrado:', logoEmpresaUrl);
                    } else {
                        console.log('No se encontró el logo para la empresa ID:', empleado.id_empresa);
                        console.log('Empresas disponibles:', window.actualizadorLogos.empresas);
                    }
                }
            } else {
                console.log('actualizadorLogos no está disponible');
            }
        } catch (error) {
            console.error('Error en obtenerLogosDinamicos:', error);
        }

        return { logoAreaUrl, logoEmpresaUrl };
    }

    // Cargar departamentos al iniciar
    cargarDepartamentos();

    // Cargar todos los empleados inicialmente
    cargarEmpleadosPorDepartamento('todos', true); // true para indicar que es carga global
    
    // Hacer variables accesibles globalmente
    window.todosLosEmpleados = todosLosEmpleados;

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

    // Evento para editar empleado
    $(document).on('click', '.btn-editar', function () {
        const idEmpleado = $(this).data('id');
        const claveEmpleado = $(this).data('clave');
        
        // Llamar a la función para abrir el modal de edición
        abrirModalEditarEmpleado(idEmpleado, claveEmpleado);
    });

    // Evento para imprimir gafetes
    $('#imprimirGafetes').click(function () {
        console.log('Botón imprimir clickeado');
        
        // Verificar que hay empleados seleccionados
        if (!empleadosSeleccionados || empleadosSeleccionados.size === 0) {
            alert('Por favor selecciona al menos un empleado para imprimir');
            return;
        }
        
        console.log('Empleados seleccionados:', empleadosSeleccionados.size);
        
        // Cerrar el modal si está abierto
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalGafetes'));
        if (modalInstance) {
            modalInstance.hide();
        }
        
        // Esperar un poco para que el modal se cierre completamente
        setTimeout(() => {
            console.log('Generando gafetes para impresión...');
            
            // Mostrar los gafetes en el DOM (sin mostrar modal)
            mostrarGafetes(true); // true = modo impresion
            
            // Esperar un poco más para que se genere el contenido
            setTimeout(() => {
                console.log('Obteniendo contenido de gafetes...');
                
                // Obtener solo el contenido de los gafetes
                const contenidoGafetes = $('#contenidoGafetes').html();
                
                console.log('Contenido obtenido:', contenidoGafetes ? 'Sí' : 'No');
                
                if (!contenidoGafetes) {
                    alert('Error: No se pudo generar el contenido de los gafetes');
                    return;
                }
                
                // Crear una nueva ventana solo para imprimir
                console.log('Creando ventana de impresión...');
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
                console.log('Escribiendo contenido en ventana de impresión...');
                ventanaImpresion.document.write(htmlImpresion);
                ventanaImpresion.document.close();
                console.log('Ventana de impresión configurada correctamente');
                
            }, 500); // Esperar 500ms para que se genere el contenido
        }, 300); // Esperar 300ms para que se cierre el modal
    });

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
                    <td class="text-center">
                        <button class="btn btn-sm btn-editar" 
                                data-id="${empleado.id_empleado}" 
                                data-clave="${empleado.clave_empleado}" 
                                title="Editar información del empleado">
                            <i class="bi bi-pencil-square"></i>
                            <span class="btn-text">Editar</span>
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
        
        const area = empleado.nombre_area.toLowerCase();
        
        switch (area) {
            case 'empaque':
                return 'rgb(0, 77, 23)'; // COLOR CITRICOS SAAO
            case 'rancho relicario':
                return 'rgb(181, 6, 0)'; // COLOR RANCHO EL RELICARIO
            case 'rancho pilar':
                return 'rgb(194, 158, 240)'; // Lila claro
            case 'rancho huasteca':
                return 'rgb(50, 186, 91)'; // RANCHO LA HUASTECA
            default:
                return 'rgb(0, 77, 23)'; // COLOR CITRICOS SAAO por defecto
        }
    }

    // Función para obtener el color del texto de los datos por área
    function obtenerColorTextoDatos(empleado) {
        if (!empleado.nombre_area) return '#06320c'; // Color por defecto
        
        const area = empleado.nombre_area.toLowerCase();
        
        switch (area) {
            case 'empaque':
                return '#053010'; // COLOR ESPECÍFICO PARA EMPAQUE
            case 'rancho relicario':
                return '#540000'; // COLOR RANCHO EL RELICARIO
            case 'rancho pilar':
                return '#140329'; // Lila claro
            case 'rancho huasteca':
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
        actualizarFechasGafetes();
        
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
                
                // Calcular tamaño de fuente dinámico para el rectángulo del nombre (solo primer nombre)
                const nombresArray = empleado.nombre ? empleado.nombre.trim().split(/\s+/).filter(Boolean) : [];
                const cantidadNombres = nombresArray.length;
                let fontSizeRectangulo;
                
                if (cantidadNombres === 1) {
                    fontSizeRectangulo = '17pt'; // Tamaño por defecto para un nombre
                } else if (cantidadNombres === 2) {
                    fontSizeRectangulo = '14pt'; // Tamaño reducido para dos nombres
                } else {
                    fontSizeRectangulo = '12pt'; // Tamaño más pequeño para tres o más nombres
                }
                const departamento = obtenerNombreDepartamento(empleado.id_departamento);
                // Calcular tamaño de fuente para el departamento
                const deptoLength = departamento.replace(/\s+/g, '').length;
                const fontSizeDepto = deptoLength >= 13 ? '8.2pt' : '10pt';
                const fotoHtml = empleado.ruta_foto ? `<img src="${empleado.ruta_foto}" alt="Foto" class="foto-empleado" style="width:100%;height:100%;object-fit:cover;">` : '';
                const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
                const fechaInicio = new Date();
                const fechaFin = new Date(fechaInicio);
                fechaFin.setMonth(fechaFin.getMonth() + 6);
                if (fechaFin.getDate() !== fechaInicio.getDate()) {
                    fechaFin.setDate(0);
                }
                const pad = n => n.toString().padStart(2, '0');
                const formato = (f) => `${pad(f.getDate())}/${meses[f.getMonth()]}/${f.getFullYear()}`;
                
                // Determinar si el empleado tiene IMSS válido (MOVER ANTES de vigenciaHtml)
                const tieneIMSS = empleado.imss && empleado.imss !== 'N/A' && empleado.imss.trim() !== '';
                
                // Crear vigenciaHtml condicional según IMSS
                let vigenciaHtml;
                if (tieneIMSS) {
                    // Si tiene IMSS, mostrar nombre de empresa (diseño completo)
                    vigenciaHtml = `
                        <div style='font-size:5.3pt !important;font-weight:bold;text-align:center;margin:0 auto 0.1cm;max-width:100%;'>
                            ${empleado.nombre_empresa ? `<div style='font-size:6.5pt !important;font-weight:bold;color:#020500;text-align:center;line-height:1.05;margin-bottom:0.05cm;'>${empleado.nombre_empresa}</div>` : ''}
                            <div style='white-space:nowrap;'>Vigencia: <span style='background:#ffe066;padding:0 0.1cm;border-radius:2px;font-size:5.3pt !important;'>${formato(fechaInicio)}</span></div>
                            <div style='white-space:nowrap;'><span style='background:#ffe066;padding:0 0.1cm;border-radius:2px;font-size:5.3pt !important;'>AL ${formato(fechaFin)}</span></div>
                        </div>`;
                } else {
                    // Si NO tiene IMSS, NO mostrar nombre de empresa (diseño simplificado)
                    vigenciaHtml = `
                        <div style='font-size:5.3pt !important;font-weight:bold;text-align:center;margin:0 auto 0.1cm;max-width:100%;'>
                            <div style='white-space:nowrap;'>Vigencia: <span style='background:#ffe066;padding:0 0.1cm;border-radius:2px;font-size:5.3pt !important;'>${formato(fechaInicio)}</span></div>
                            <div style='white-space:nowrap;'><span style='background:#ffe066;padding:0 0.1cm;border-radius:2px;font-size:5.3pt !important;'>AL ${formato(fechaFin)}</span></div>
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
                const nombreEnLineas = nombreAgrupado.map(p => "<span style='display:block;text-align:left !important;font-size:inherit !important;'>" + p + "</span>").join('');
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
                                "<div style=\"display:flex;flex-direction:column;align-items:flex-end;gap:0.05cm;max-width:2.8cm;\">" +
                                    "<div style=\"background:white;padding:0.05cm;display:inline-block;\">" +
                                        "<img src=\"" + logoEmpresaUrl + "\" alt=\"Logo Empresa\" class=\"gafete-logo-empresa\" style=\"max-width:2.5cm;max-height:1.4cm;object-fit:contain;display:block;\">" +
                                    "</div>" +
                                "</div>" +
                            "</div>";
                    } else if (logoAreaUrl || logoEmpresaUrl) {
                        // Solo un logo: centrado horizontalmente
                        const logoSrc = logoAreaUrl || logoEmpresaUrl;
                        const logoAlt = logoAreaUrl ? 'Logo Área' : 'Logo Empresa';
                        const logoClass = logoAreaUrl ? 'gafete-logo-area' : 'gafete-logo-empresa';
                        logoHtml = 
                            "<div style=\"width:100%;display:flex;justify-content:center;align-items:flex-start;margin-bottom:0.06cm;\">" +
                                "<div style=\"background:white;padding:0.05cm;display:inline-block;\">" +
                                    "<img src=\"" + logoSrc + "\" alt=\"" + logoAlt + "\" class=\"" + logoClass + "\" style=\"max-width:2.5cm;max-height:1.6cm;object-fit:contain;display:block;margin-top:0.02cm;\">" +
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
                
                // Si el empleado tiene IMSS, mostrar todos los campos (diseño estándar)
                if (tieneIMSS) {
                    camposAdicionales = 
                        "<div style=\"font-size:8pt !important;text-align:left;padding-left:0.1cm;margin-top:0.2cm;\"><strong style='color:" + colorTextoDatos + ";font-size:8pt !important;'>Clave:</strong> " +
                         "<span class='dato-gafete-frente' style='color:" + colorTextoDatos + ";'>" + empleado.clave_empleado + "</span></div>" +
                        "<div style=\"font-size:8pt !important;text-align:left;padding-left:0.1cm;margin-top:0.2cm;\"><strong style='color:" + colorTextoDatos + ";font-size:8pt !important;'>Sexo:</strong> " +
                         "<span class='dato-gafete-frente' style='color:" + colorTextoDatos + ";'>" + (empleado.sexo ? empleado.sexo : 'N/A') + "</span></div>";
                }
                // Si no tiene IMSS, no mostrar campos adicionales (diseño simplificado)
                
                const $frente = $(
                    "<div class=\"gafete\" style=\"border:2px solid " + colorArea + " !important;height:9cm !important;min-height:9cm !important;max-height:9cm !important;width:6cm !important;min-width:6cm !important;max-width:6cm !important;font-family:Segoe UI Black;margin-bottom:0!important;margin-top:0!important;padding:0.2cm !important;font-size:7pt !important;\">" +
                        logoHtml +         
                        "<div class=\"gafete-body\" style=\"font-size:7pt;display:flex;flex-direction:row;align-items:flex-start;gap:0.2cm;min-height:5.5cm;" + (tieneIMSS ? '' : 'justify-content:center;align-items:flex-end;padding-bottom:0.2cm !important;') + "\">" +
                            "<div style=\"flex:1;display:flex;flex-direction:column;justify-content:flex-start;align-items:flex-start;gap:0.1cm;\">" +
                                "<div style=\"font-size:13px !important;font-weight:800;text-align:left !important;padding-left:0.1cm;padding-top:0.2cm;padding-bottom:0.05cm;line-height:1.1;color:" + colorTextoDatos + ";\">" +
                                    "<strong style='color:" + colorTextoDatos + ";font-size:8pt !important;text-align:left !important;'>Trabajador:</strong>" +
                                    "<span class='nombre-gafete-frente' style='color:" + colorTextoDatos + ";text-align:left !important;font-size:" + fontSizeNombre + " !important;font-weight:800;line-height:1.1;display:block;'>" + nombreEnLineas + "</span>" +
                                "</div>" +
                                "<div style=\"font-size:7pt;text-align:left !important;padding-left:0.1cm;margin-top:0.05cm;\"><strong style='color:" + colorTextoDatos + ";font-size:8pt !important;'>Área:</strong><br>" +
                                 "<span class='dato-gafete-frente' style='color:" + colorTextoDatos + ";text-align:left !important;font-size:" + fontSizeDepto + " !important;'>" + departamento + "</span></div>" +
                                camposAdicionales +
                            "</div>" +
                                "<div style=\"flex:0 0 2.5cm;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;\">" +
                                vigenciaHtml +
                                "<div class=\"gafete-foto\" style=\"margin:0.1cm 0;\">" +
                                    "<div class=\"marco-foto\" style=\"width:2.5cm !important;height:3cm !important;border:1px solid #000;border-radius:0;margin:0 auto;overflow:hidden;\">" + fotoHtml + "</div>" +
                                "</div>" +
                                (tieneIMSS ? 
                                    "<div class=\"gafete-sello\" style=\"margin-top:0.1cm;text-align:center;font-size:5pt !important;font-weight:bold;letter-spacing:0.5px;\">" +
                                        "Sello de autenticidad" +
                                    "</div>" +
                                    "<div style=\"margin-top:0.3cm;text-align:left;font-size:7pt !important;font-weight:bold;letter-spacing:0.5px;color:" + colorTextoDatos + ";\">" +
                                        "Casillero: " + empleado.num_casillero +
                                    "</div>"
                                 : '') +
                            "</div>" +
                        "</div>" +
                        "<div class=\"gafete-nombre-rect\" style=\"margin-top:auto;display:flex;justify-content:center;align-items:center;" + (tieneIMSS ? '' : 'margin-top:0.6cm;') + "\">" +
                                    "<div style=\"width:100%;background:" + colorArea + ";border:none;border-radius:4px;padding:0.1cm 0;text-align:center;font-size:" + fontSizeRectangulo + " !important;font-weight:bold;letter-spacing:0.5px;color:#fff;margin-top:0.1cm;\">" + empleado.nombre + "</div>" +
                        "</div>" +
                    "</div>"
                );
                // --- Reverso ---
                const datosAtras = 
                    "<div style='margin-bottom:0.08cm;'>" +
                       "<span style='font-size:7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1 !important;'>Domicilio de Trabajador:</span><br>" +
                        "<span style='font-size:6.5pt !important;color:" + colorTextoDatos + ";'>" + (empleado.domicilio ? empleado.domicilio : 'N/A') + "</span>" +
                    "</div>" +
                    "<div style='display:flex;justify-content:space-between;gap:0.12cm;margin-bottom:0.08cm !important;'>" +
                        "<div style='flex:1;'>" +
                            "<span style='font-size:7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1 !important;'>IMSS:</span><br>" +
                            "<span style='font-size:6.5pt !important;color:" + colorTextoDatos + ";line-height:1 !important;'>" + (empleado.imss ? empleado.imss : 'N/A') + "</span>" +
                        "</div>" +
                        "<div style='flex:1;'>" +
                            "<span style='font-size:7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1 !important;'>CURP:</span><br>" +
                            "<span style='font-size:6.5pt !important;color:" + colorTextoDatos + ";line-height:1 !important;'>" + (empleado.curp ? empleado.curp : 'N/A') + "</span>" +
                        "</div>" +
                    "</div>" +
                    "<div style='margin-bottom:0.08cm !important;'>" +
                        "<span style='font-size:7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1 !important;'>Fecha de nacimiento:</span><br>" +
                        "<span style='font-size:6.5pt !important;color:" + colorTextoDatos + ";line-height:1 !important;'>" + (empleado.fecha_nacimiento ? formatearFechaYMDaDMY(empleado.fecha_nacimiento) : 'N/A') + "</span>" +
                    "</div>" +
                    "<div style='margin-bottom:0.08cm !important;'>" +
                        "<span style='font-size:7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1 !important;'>Enfermedades/Alergias:</span><br>" +
                        "<span style='font-size:6.5pt !important;color:" + colorTextoDatos + ";line-height:1 !important;'>" + (empleado.enfermedades_alergias ? empleado.enfermedades_alergias : 'N/A') + "</span>" +
                    "</div>" +
                    "<div style='margin-bottom:0.08cm !important;'>" +
                        "<span style='font-size:7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1 !important;'>Grupo sanguíneo:</span><br>" +
                        "<span style='font-size:6.5pt !important;color:" + colorTextoDatos + ";line-height:1 !important;'>" + (empleado.grupo_sanguineo ? empleado.grupo_sanguineo : 'N/A') + "</span>" +
                    "</div>" +
                    "<div style='margin-bottom:0.06cm !important;'>" +
                        "<span style='font-size:7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;line-height:1 !important;'>Fecha de ingreso:</span><br>" +
                        "<span style='font-size:6.5pt !important;color:" + colorTextoDatos + ";line-height:1 !important;'>" + (empleado.fecha_ingreso ? formatearFechaYMDaDMY(empleado.fecha_ingreso) : 'N/A') + "</span>" +
                    "</div>" +
                    "<div style='background:" + colorHexToRgba(colorArea, 0.12) + ";border-radius:4px;padding:0.08cm 0.10cm;margin-top:0.06cm;width:100%;box-sizing:border-box;'>" +
                        "<div style=\"margin-bottom:0.08cm !important;\"><span style=\"font-size:7pt !important;font-weight:bold;color:" + colorTextoDatos + ";font-family:Segoe UI Black;\">En caso de emergencia llamar a:</span></div>" +
                        "<div style='text-align:center;margin-bottom:0.03cm;'>" +
                            "<span style='font-size:7pt !important;color:" + colorTextoDatos + ";'>" +
                                (empleado.emergencia_parentesco ? empleado.emergencia_parentesco : 'N/A') + " - " + (empleado.emergencia_nombre_contacto ? empleado.emergencia_nombre_contacto : 'N/A') +
                            "</span>" +
                        "</div>" +
                        "<div style='text-align:center;margin-bottom:0.03cm;'><span style='font-size:7pt !important;color:" + colorTextoDatos + ";'>" + formatearTelefono(empleado.emergencia_telefono) + "</span></div>" +
                        "<div style='text-align:center;'><span style='font-size:6.5pt !important;color:" + colorTextoDatos + ";'>" + (empleado.emergencia_domicilio ? empleado.emergencia_domicilio : 'N/A') + "</span></div>" +
                    "</div>";
                // Lógica de posicionamiento inteligente de logos para el reverso (solo para empleados con IMSS)
                let logoReversoHtml = '';
                
                // Solo mostrar logos en el reverso si el empleado tiene IMSS
                if (tieneIMSS) {
                    if (logoAreaUrl && logoEmpresaUrl) {
                        // Ambos logos: distribuidos en los extremos
                        logoReversoHtml = 
                            "<div style=\"width:100%;display:flex;justify-content:space-between;align-items:center;margin-bottom:0.1cm;\">" +
                                "<div style=\"background:white;padding:0.05cm;display:inline-block;\">" +
                                    "<img src=\"" + logoAreaUrl + "\" alt=\"Logo Área\" class=\"gafete-logo-reverso-area\" style=\"max-width:1.8cm;max-height:1.8cm;object-fit:contain;display:block;\">" +
                                "</div>" +
                                "<div style=\"background:white;padding:0.05cm;display:inline-block;\">" +
                                    "<img src=\"" + logoEmpresaUrl + "\" alt=\"Logo Empresa\" class=\"gafete-logo-reverso-empresa\" style=\"max-width:2.8cm;max-height:1.8cm;object-fit:contain;display:block;\">" +
                                "</div>" +
                            "</div>";
                    } else if (logoAreaUrl || logoEmpresaUrl) {
                        // Solo un logo: centrado horizontalmente
                        const logoSrc = logoAreaUrl || logoEmpresaUrl;
                        const logoAlt = logoAreaUrl ? 'Logo Área' : 'Logo Empresa';
                        const maxWidth = logoAreaUrl ? '1.8cm' : '2.8cm';
                        const logoClass = logoAreaUrl ? 'gafete-logo-reverso-area' : 'gafete-logo-reverso-empresa';
                        logoReversoHtml = 
                            "<div style=\"width:100%;display:flex;justify-content:center;align-items:center;margin-bottom:0.1cm;\">" +
                                "<div style=\"background:white;padding:0.05cm;display:inline-block;\">" +
                                    "<img src=\"" + logoSrc + "\" alt=\"" + logoAlt + "\" class=\"" + logoClass + "\" style=\"max-width:" + maxWidth + ";max-height:1.8cm;object-fit:contain;display:block;\">" +
                                "</div>" +
                            "</div>";
                    } else {
                        // Sin logos: espacio mínimo
                        logoReversoHtml = "<div style=\"width:100%;margin-bottom:0.1cm;\"></div>";
                    }
                } else {
                    // Para empleados sin IMSS, no mostrar logos en el reverso
                    logoReversoHtml = '';
                }
                
                const $reverso = $(
                    "<div class=\"gafete\" style=\"transform: rotate(180deg); border:2px solid " + colorArea + " !important;height:9cm !important;min-height:9cm !important;max-height:9cm !important;width:6cm !important;min-width:6cm !important;max-width:6cm !important;font-family:Segoe UI Black;margin-bottom:0!important;margin-top:0!important;padding:0.2cm !important;font-size:6pt !important;overflow:hidden;box-sizing:border-box;\">" +
                        logoReversoHtml +
                        "<div class=\"gafete-body\" style=\"justify-content: flex-start; font-size:5pt;\">" +
                            "<div style='font-size:6pt;'>" +
                                datosAtras.replace(/(Domicilio de trabajador:|Domicilio:|Domicilio de emergencia:)/g, '<span style=\"font-size:6pt;\">$1') + "</div>" +
                        "</div>" +
                    "</div>"
                );
                
                // Crear contenedor columna con lógica condicional para IMSS
                let $columna;
                
                if (tieneIMSS) {
                    // Si tiene IMSS, generar gafete completo (frente y reverso)
                    $columna = $('<div style="display:flex;flex-direction:column;justify-content:flex-start;align-items:center;gap:0;margin:0;padding:0;width:6cm !important;min-width:6cm !important;max-width:6cm !important;height:20cm !important;min-height:20cm !important;max-height:20cm !important;position:relative;"></div>');
                } else {
                    // Si NO tiene IMSS, generar contenedor más pequeño solo para el frente
                    $columna = $('<div style="display:flex;flex-direction:column;justify-content:flex-start;align-items:center;gap:0;margin:0;padding:0;width:6cm !important;min-width:6cm !important;max-width:6cm !important;height:10cm !important;min-height:10cm !important;max-height:10cm !important;position:relative;"></div>');
                }
                // Agregar el frente a la columna
                $columna.append($frente);
                
                if (tieneIMSS) {
                    // Solo si tiene IMSS, agregar el reverso
                    // Agregar un pequeño espacio entre frente y reverso
                    $columna.append($('<div style="height:0.2cm;"></div>'));
                    
                    // Ajustar estilos para mantener consistencia del gafete completo
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
                } else {
                    // Si no tiene IMSS, solo ajustar estilos del frente para gafete simplificado
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
                }
                $pagina.append($columna);
            });
            // Si hay menos de 3 empleados, rellenar columnas vacías para mantener el layout
            for (let j = grupo.length; j < columnas; j++) {
                // Usar altura variable dependiendo si hay empleados con IMSS en el grupo
                const hayEmpleadosConIMSS = grupo.some(emp => emp.imss && emp.imss !== 'N/A' && emp.imss.trim() !== '');
                const alturaColumna = hayEmpleadosConIMSS ? '20cm' : '10cm';
                $pagina.append(`<div style="width:6cm;min-width:6cm;max-width:6cm;height:${alturaColumna};min-height:${alturaColumna};"></div>`);
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
                        console.log('Fotos eliminadas:', response.fotos_eliminadas);
                    }
                } else {
                    mostrarAlertaLimpieza('Error durante la limpieza: ' + response.message, 'danger');
                    if (response.errores && response.errores.length > 0) {
                        console.error('Errores:', response.errores);
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Error en la petición:', error);
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
        // Iterar sobre los empleados seleccionados y actualizar sus fechas
        empleadosSeleccionados.forEach(function(idEmpleado) {
            // Hacer una solicitud AJAX para actualizar las fechas en la base de datos
            $.ajax({
                url: 'php/actualizarFechasGafete.php',
                method: 'POST',
                data: { id_empleado: idEmpleado },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        console.log('Fechas actualizadas para el empleado ' + idEmpleado + ':', response);
                        // Actualizar el contador de notificaciones después de actualizar las fechas
                        if (typeof updateNotificationCount === 'function') {
                            updateNotificationCount();
                        }
                    } else {
                        console.error('Error al actualizar fechas para el empleado ' + idEmpleado + ':', response.message);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error en la solicitud AJAX para el empleado ' + idEmpleado + ':', error);
                }
            });
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
    // FUNCIONES DE VALIDACIÓN
    // ======================================

    // Funciones de validación importadas
    function validarNombre(nombre) {
        const validar = /^([A-ZÁÉÍÓÚÑa-záéíóúñ]+)( [A-ZÁÉÍÓÚÑa-záéíóúñ]+)*$/;
        return validar.test(nombre);
    }

    function validarApellido(apellido) {
        var validar = /^(?:(?:[Dd]e(?:l)?|[Dd]e\s+(?:la|los|las))\s+)?([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)$/;
        return validar.test(apellido);
    }

    function validarClave(clave) {
        var validar = /^\d+$/;
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
        var validar = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/;
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
                }
            },
            error: function(xhr, status, error) {
                console.error('Error al obtener datos del empleado:', error);
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
        $("#modal_fecha_nacimiento").val(empleado.fecha_nacimiento || '');
        $("#modal_num_casillero").val(empleado.num_casillero || '');

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

    // Evento para enviar el formulario de actualización
    $("#form_modal_actualizar_empleado").submit(function (e) {
        e.preventDefault();

        // Recopilar todos los datos del formulario
        let datos = {
            id_empleado: $("#empleado_id").val(),
            clave_empleado: $("#modal_clave_empleado").val(),
            nombre_empleado: $("#modal_nombre_empleado").val(),
            apellido_paterno_empleado: $("#modal_apellido_paterno").val(),
            apellido_materno_empleado: $("#modal_apellido_materno").val(),
            domicilio_empleado: $("#modal_domicilio").val() || "",
            imss: $("#modal_imss").val() || "",
            curp: $("#modal_curp").val() || "",
            sexo: $("#modal_sexo").val(),
            grupo_sanguineo: $("#modal_grupo_sanguineo").val() || "",
            enfermedades_alergias: $("#modal_enfermedades_alergias").val() || "",
            fecha_ingreso: $("#modal_fecha_ingreso").val() || "",
            id_departamento: $("#modal_departamento").val() || "",
            fecha_nacimiento: $("#modal_fecha_nacimiento").val() || "",
            num_casillero: $("#modal_num_casillero").val() || "",
            id_empresa: $("#modal_empresa").val() || "",
            id_area: $("#modal_area").val() || "",
            id_puestoEspecial: $("#modal_puesto").val() || "",
            nombre_contacto: $("#modal_emergencia_nombre").val() || "",
            apellido_paterno_contacto: $("#modal_emergencia_ap_paterno").val() || "",
            apellido_materno_contacto: $("#modal_emergencia_ap_materno").val() || "",
            telefono_contacto: $("#modal_emergencia_telefono").val() || "",
            domicilio_contacto: $("#modal_emergencia_domicilio").val() || "",
            parentesco: $("#modal_emergencia_parentesco").val() || ""
        };

        // Validación mejorada con las funciones de validación
        let obligatoriosValidos = (
            validarClave(datos.clave_empleado) &&
            validarNombre(datos.nombre_empleado) &&
            validarApellido(datos.apellido_paterno_empleado) &&
            validarApellido(datos.apellido_materno_empleado) &&
            datos.sexo
        );

        let opcionalesValidos = true;
        if (datos.imss && !validarNSS(datos.imss)) opcionalesValidos = false;
        if (datos.curp && !validarCURP(datos.curp)) opcionalesValidos = false;
        if (datos.grupo_sanguineo && !validarGrupoSanguineo(datos.grupo_sanguineo)) opcionalesValidos = false;
        if (datos.nombre_contacto && !validarNombre(datos.nombre_contacto)) opcionalesValidos = false;
        if (datos.apellido_paterno_contacto && !validarApellido(datos.apellido_paterno_contacto)) opcionalesValidos = false;
        if (datos.apellido_materno_contacto && !validarApellido(datos.apellido_materno_contacto)) opcionalesValidos = false;
        if (datos.parentesco && !validarParentesco(datos.parentesco)) opcionalesValidos = false;
        if (datos.telefono_contacto && !validarTelefono(datos.telefono_contacto)) opcionalesValidos = false;

        if (!obligatoriosValidos) {
            mostrarAlerta('Existen campos obligatorios vacíos o incorrectos.', 'warning');
            return;
        }

        if (!opcionalesValidos) {
            mostrarAlerta('Hay datos opcionales incorrectos.', 'warning');
            return;
        }

        // Enviar datos al servidor
        $.ajax({
            type: "POST",
            url: "../empleados/php/update_empleado.php",
            data: datos,
            success: function (response) {
                // Cerrar el modal
                $("#modal_actualizar_empleado").modal("hide");
                
                // Recargar la tabla de empleados
                const departamentoActual = $('#listaDepartamentos .active').data('departamento') || 'todos';
                cargarEmpleadosPorDepartamento(departamentoActual);
                
                // También recargar todosLosEmpleados para asegurar que los datos estén actualizados
                // Esto es importante para que los gafetes se generen con los datos actualizados
                cargarEmpleadosPorDepartamento('todos', true);
                
                // Actualizar también el conjunto de empleados seleccionados para reflejar los cambios
                // Esto asegura que cuando se generen los gafetes, los datos sean los más recientes
                const idEmpleado = datos.id_empleado;
                if (empleadosSeleccionados.has(idEmpleado)) {
                    // Forzar una actualización de la interfaz si el empleado actualizado está seleccionado
                    setTimeout(() => {
                        // Pequeño retraso para asegurar que los datos se hayan cargado
                        console.log('Empleado actualizado y datos recargados');
                    }, 100);
                }
                
                // Mostrar mensaje de éxito
                mostrarAlerta('Empleado actualizado correctamente', 'success');
            },
            error: function(xhr, status, error) {
                console.error('Error al actualizar empleado:', error);
                mostrarAlerta('Error al actualizar el empleado. Por favor, inténtelo de nuevo.', 'error');
            }
        });
    });

    // ======================================
    // FUNCIONALIDAD DE FOTO EN MODAL
    // ======================================

    // Función para cargar y mostrar la foto actual del empleado
    function cargarFotoEmpleado(empleado) {
        const $fotoPreview = $('#foto_preview');
        const $noFotoPreview = $('#no_foto_preview');
        
        if (empleado.ruta_foto) {
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
            url: '../empleados/php/subir_foto.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                try {
                    const result = JSON.parse(response);
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
        
        // Confirmar eliminación
        if (!confirm('¿Está seguro de que desea eliminar la foto de este empleado?')) {
            return;
        }
        
        const $btnEliminar = $(this);
        const textoOriginal = $btnEliminar.html();
        $btnEliminar.html('<i class="bi bi-hourglass-split"></i> Eliminando...');
        $btnEliminar.prop('disabled', true);
        
        $.ajax({
            url: '../empleados/php/eliminar_foto.php',
            type: 'POST',
            data: { id_empleado: idEmpleado },
            success: function(response) {
                try {
                    const result = JSON.parse(response);
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
                } catch (e) {
                    mostrarAlerta('Error al procesar la respuesta del servidor', 'error');
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
    });

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