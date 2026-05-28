$(function () {
    const rutaRaiz = '/sistema_saao/';
    const columnasTabla = 3;
    const modalElement = document.getElementById('modalBiometricos');
    const modalActualizarElement = document.getElementById('modal_actualizar_empleado');
    const $modal = $('#modalBiometricos');

    if (!modalElement || !$modal.length) {
        return;
    }

    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    const modalActualizarInstance = modalActualizarElement
        ? bootstrap.Modal.getOrCreateInstance(modalActualizarElement)
        : null;
    const estado = {
        paginaActual: 1,
        areaSeleccionada: '',
        biometricoBuscado: '',
        targetInput: '',
        areaInput: '',
        areasCargadas: false,
        busquedaTimeout: null,
        abiertoDesdeActualizar: false
    };

    // Escapa texto antes de pintarlo en HTML para evitar caracteres conflictivos.
    function escaparHtml(texto) {
        return $('<div>').text(texto ?? '').html();
    }

    // Construye un arreglo corto de páginas para no saturar la interfaz.
    function obtenerPaginasVisibles(totalPaginas, paginaActual) {
        if (totalPaginas <= 7) {
            return Array.from({ length: totalPaginas }, (_, index) => index + 1);
        }

        const paginas = [1];
        const inicio = Math.max(2, paginaActual - 1);
        const fin = Math.min(totalPaginas - 1, paginaActual + 1);

        if (inicio > 2) {
            paginas.push('...');
        }

        for (let pagina = inicio; pagina <= fin; pagina++) {
            paginas.push(pagina);
        }

        if (fin < totalPaginas - 1) {
            paginas.push('...');
        }

        paginas.push(totalPaginas);
        return paginas;
    }

    // Muestra una fila simple para carga, error o tabla vacía.
    function renderFilaEstado(mensaje, clase = 'text-muted') {
        $('#tablaBiometricosCuerpo').html(`
            <tr>
                <td colspan="${columnasTabla}" class="text-center ${clase} py-4">${mensaje}</td>
            </tr>
        `);
    }

    // Carga las áreas una sola vez y después sólo reutiliza el select.
    function cargarAreas(areaPreseleccionada) {
        if (estado.areasCargadas) {
            $('#filtroAreaBiometrico').val(areaPreseleccionada || '');
            return;
        }

        $.ajax({
            type: 'GET',
            url: rutaRaiz + 'public/php/obtenerAreas.php',
            success: function (response) {
                let areas = [];

                try {
                    areas = JSON.parse(response);
                } catch (error) {
                    areas = [];
                }

                let opciones = '<option value="">Todas las areas</option>';
                $.each(areas, function (_, area) {
                    opciones += `<option value="${area.id_area}">${escaparHtml(area.nombre_area)}</option>`;
                });

                $('#filtroAreaBiometrico').html(opciones).val(areaPreseleccionada || '');
                estado.areasCargadas = true;
            },
            error: function () {
                $('#filtroAreaBiometrico').html('<option value="">Todas las areas</option>');
            }
        });
    }

    // Toma los filtros actuales del modal y los guarda en el estado.
    function sincronizarFiltros() {
        estado.areaSeleccionada = $('#filtroAreaBiometrico').val();
        estado.biometricoBuscado = $.trim($('#buscarNumeroBiometrico').val());
    }

    // Muestra las filas del resultado y deja la fila como selector del biométrico.
    function renderTabla(registros) {
        if (!Array.isArray(registros) || registros.length === 0) {
            renderFilaEstado('No se encontraron empleados con ese criterio.');
            return;
        }

        let html = '';

        $.each(registros, function (_, empleado) {
            html += `
                <tr class="fila-biometrico-seleccionable" data-biometrico="${escaparHtml(empleado.biometrico)}" style="cursor:pointer;">
                    <td><span class="badge text-bg-primary">${escaparHtml(empleado.biometrico)}</span></td>
                    <td>${escaparHtml(empleado.nombre_completo)}</td>
                    <td>${escaparHtml(empleado.clave_empleado)}</td>
                </tr>
            `;
        });

        $('#tablaBiometricosCuerpo').html(html);
    }

    // Dibuja una paginación compacta con anterior, siguiente y elipsis.
    function renderPaginacion(totalPaginas) {
        const $contenedor = $('#paginacionBiometricos');

        if (!totalPaginas || totalPaginas <= 1) {
            $contenedor.empty();
            return;
        }

        const paginasVisibles = obtenerPaginasVisibles(totalPaginas, estado.paginaActual);
        let html = `
            <li class="page-item ${estado.paginaActual === 1 ? 'disabled' : ''}">
                <a href="#" class="page-link" data-page="${estado.paginaActual - 1}" aria-label="Anterior">&laquo;</a>
            </li>
        `;

        $.each(paginasVisibles, function (_, pagina) {
            if (pagina === '...') {
                html += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
                return;
            }

            html += `
                <li class="page-item ${estado.paginaActual === pagina ? 'active' : ''}">
                    <a href="#" class="page-link" data-page="${pagina}">${pagina}</a>
                </li>
            `;
        });

        html += `
            <li class="page-item ${estado.paginaActual === totalPaginas ? 'disabled' : ''}">
                <a href="#" class="page-link" data-page="${estado.paginaActual + 1}" aria-label="Siguiente">&raquo;</a>
            </li>
        `;

        $contenedor.html(html);
    }

    // Actualiza el texto inferior con el rango actual de resultados.
    function renderInfo(totalRegistros, porPagina) {
        const inicio = totalRegistros === 0 ? 0 : ((estado.paginaActual - 1) * porPagina) + 1;
        const fin = Math.min(estado.paginaActual * porPagina, totalRegistros);
        $('#infoPaginacionBiometricos').text(`Mostrando ${inicio}-${fin} de ${totalRegistros} registros`);
    }

    // Consulta al backend y sólo refresca tabla/paginación cuando llega la respuesta.
    function cargarBiometricos(pagina) {
        estado.paginaActual = pagina || 1;

        $.ajax({
            type: 'GET',
            url: rutaRaiz + 'empleados/php/obtener_biometricos.php',
            dataType: 'json',
            data: {
                pagina: estado.paginaActual,
                id_area: estado.areaSeleccionada,
                biometrico: estado.biometricoBuscado
            }
        }).done(function (response) {
            if (!response || !response.success) {
                renderFilaEstado('No fue posible cargar los biométricos.', 'text-danger');
                $('#paginacionBiometricos').empty();
                $('#infoPaginacionBiometricos').text('Sin informacion disponible');
                return;
            }

            renderTabla(response.data);
            renderPaginacion(response.total_paginas);
            renderInfo(response.total_registros, response.por_pagina);
        }).fail(function () {
            renderFilaEstado('Ocurrio un error al consultar los biométricos.', 'text-danger');
            $('#paginacionBiometricos').empty();
            $('#infoPaginacionBiometricos').text('Sin informacion disponible');
        });
    }

    // Aplica filtros y reinicia desde la primera página.
    function aplicarFiltros() {
        sincronizarFiltros();
        cargarBiometricos(1);
    }

    // Ejecuta la consulta con una pequeña espera para evitar demasiadas peticiones.
    function aplicarFiltrosEnTiempoReal() {
        clearTimeout(estado.busquedaTimeout);
        estado.busquedaTimeout = setTimeout(function () {
            aplicarFiltros();
        }, 250);
    }

    // Cuando el modal se abre encima del de actualizar, desactiva el foco del padre.
    function desactivarFocoModalActualizar() {
        if (estado.abiertoDesdeActualizar && modalActualizarInstance && modalActualizarInstance._focustrap) {
            modalActualizarInstance._focustrap.deactivate();
        }
    }

    // Al cerrar el modal hijo, se reactiva el foco del modal padre.
    function reactivarFocoModalActualizar() {
        if (estado.abiertoDesdeActualizar && modalActualizarInstance && modalActualizarInstance._focustrap) {
            modalActualizarInstance._focustrap.activate();
        }
    }

    // Abre el modal desde el input actual sin recrearlo en cada página.
    function abrirModalBiometricos() {
        estado.targetInput = $(this).data('target-input') || '';
        estado.areaInput = $(this).data('area-input') || '';
        const abrirSinFiltros = $(this).data('open-all') === true || $(this).data('open-all') === 'true';
        estado.abiertoDesdeActualizar = !!$(this).closest('#modal_actualizar_empleado').length;

        const biometricoActual = estado.targetInput ? $(estado.targetInput).val() : '';
        const areaActual = estado.areaInput ? $(estado.areaInput).val() : '';

        if (abrirSinFiltros) {
            $('#buscarNumeroBiometrico').val('');
            cargarAreas('');
            estado.areaSeleccionada = '';
            estado.biometricoBuscado = '';
        } else {
            $('#buscarNumeroBiometrico').val(biometricoActual || '');
            cargarAreas(areaActual || '');
            estado.areaSeleccionada = areaActual || '';
            estado.biometricoBuscado = $.trim(biometricoActual || '');
        }

        desactivarFocoModalActualizar();
        modalInstance.show();
        cargarBiometricos(1);

        setTimeout(function () {
            $('#buscarNumeroBiometrico').trigger('focus');
        }, 150);
    }

    // Copia el biométrico seleccionado al input activo y cierra el modal.
    function seleccionarBiometrico() {
        const biometrico = $(this).data('biometrico');

        if (estado.targetInput) {
            $(estado.targetInput).val(biometrico).trigger('input').trigger('change');
        }

        modalInstance.hide();
    }

    // Navega entre páginas sin cerrar ni reabrir el modal.
    function cambiarPagina(event) {
        event.preventDefault();
        event.stopPropagation();

        const $item = $(this).closest('.page-item');
        const nuevaPagina = Number($(this).data('page'));

        if ($item.hasClass('disabled') || !nuevaPagina || nuevaPagina < 1 || nuevaPagina === estado.paginaActual) {
            return;
        }

        cargarBiometricos(nuevaPagina);
    }

    // Eventos principales del modal.
    $('.btn-abrir-modal-biometrico').on('click', abrirModalBiometricos);
    $('#filtroAreaBiometrico').on('change', aplicarFiltrosEnTiempoReal);
    $('#buscarNumeroBiometrico').on('input', aplicarFiltrosEnTiempoReal);

    $('#buscarNumeroBiometrico').on('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            aplicarFiltros();
        }
    });

    $modal.on('hidden.bs.modal', function () {
        reactivarFocoModalActualizar();
    });

    $('#paginacionBiometricos').on('click', '.page-link', cambiarPagina);
    $('#tablaBiometricosCuerpo').on('click', '.fila-biometrico-seleccionable', seleccionarBiometrico);
});
