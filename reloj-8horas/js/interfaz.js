// Autor: Brandon

$(document).ready(function () {

    // Estado global de la interfaz
    const STATE = {
        pageSize: 5,
        page: 1,
        deptIndex: -1,
        puesto: '-1',
        empleadosFlat: [],
        datos: null
    };

    // Carga los datos del reloj desde sessionStorage
    function cargarDatos() {
        try {
            const raw = sessionStorage.getItem('reloj-ocho');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    // Parsea una fecha en formato "DD/MM/YYYY" a un objeto Date
    function parseDDMMYYYY(s) {
        if (!s) return null;
        const [dd, mm, yyyy] = String(s).split('/').map(x => parseInt(x, 10));
        if (!dd || !mm || !yyyy) return null;
        return new Date(yyyy, mm - 1, dd);
    }

    // Devuelve el día de la semana en español en mayúsculas
    function diaSemanaES(date) {
        const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
        return dias[date.getDay()];
    }


    /**
     * ==========================================================
     * Normaliza una hora en formato "HH:MM", asegurando que
     * tanto horas como minutos tengan dos dígitos.
     * Si la hora no es válida, devuelve una cadena vacía.
     * ==========================================================
     */
    function normalizarHHMM(h) {
        if (!h) return '';
        const partes = String(h).split(':');
        if (partes.length < 2) return '';
        return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
    }


    /**
     * ==========================================================
     * Convierte una hora en formato "HH:MM" a minutos totales.
     * Si la hora no es válida, devuelve 0.
     * ==========================================================
     */
    function hhmmToMin(hhmm) {
        const h = normalizarHHMM(hhmm);
        if (!h) return 0;
        const [hh, mm] = h.split(':').map(Number);
        return (hh * 60) + mm;
    }

    /**
     * ==========================================================
     * Calcula la diferencia entre dos horas en formato "HH:MM"
     * y devuelve el resultado también en formato "HH:MM".
     * Si la hora de fin es menor que la de inicio, se asume que
     * la hora de fin corresponde al día siguiente.
     * ==========================================================
     */
    function diffHHMM(inicio, fin) {
        if (!inicio || !fin) return '';
        const a = hhmmToMin(inicio);
        const b = hhmmToMin(fin);
        let d = b - a;
        if (d < 0) d += 24 * 60;
        const hh = Math.floor(d / 60);
        const mm = d % 60;
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }

    /**
     * ====================================================================
     * Obtiene el color de fondo para una columna según el tipo de registro
     * - Azul para incapacidad
     * - Verde para vacaciones
     * - Amarillo para descanso
     * - Gris para ausencia, inasistencia, no_laboro
     * - Naranja para sin_horario
     * - Sin color para asistencia
     * ====================================================================
     */
    function getRowColor(tipo, emp) {
        const t = String(tipo || '').toLowerCase();
        if (t === 'ausencia' || t === 'inasistencia') return '#A6A6A6';
        if (t === 'incapacidad') return '#3D7BFF';
        if (t === 'vacaciones') return '#027d00ff';
        if (t === 'descanso') return '#FCFF00';
        if (t === 'dia_festivo') return '#00FFFF';
        
        if (t === 'sin_horario') return '#ffb300ff';
        
        // no_laboro = día sin horario asignado (no es descanso ni ausencia)
        if (t === 'no_laboro') return '';

        /**
         * Si llega aquí significa asistencia
         * asi que no lleva color de fondo
         */
        return '';
    }

    /**
     * ====================================================================
     * Obtiene el texto del tooltip según el tipo de registro
     * Devuelve vacío para asistencia (no mostrar tooltip)
     * ====================================================================
     */
    function getTooltipText(tipo) {
        const t = String(tipo || '').toLowerCase();
        if (t === 'ausencia' || t === 'inasistencia') return '⚠️ Día de ausencia';
        if (t === 'incapacidad') return '🏥 Día de incapacidad';
        if (t === 'vacaciones') return '🌴 Día de vacaciones';
        if (t === 'descanso') return '😴 Día de descanso';
        if (t === 'dia_festivo') return '🎉 Día festivo';
        if (t === 'sin_horario') return '📋 Sin horario asignado';
        if (t === 'no_laboro') return ''; // Sin tooltip para días que no labora
        return '';
    }

    /**
     * ==========================================================
     * Aplana la estructura de departamentos y empleados en una
     * lista única de empleados con referencia a su departamento.
     * ==========================================================
     */
    function flattenEmpleados(datos) {
        const out = [];
        if (!datos || !Array.isArray(datos.departamentos)) return out;
        datos.departamentos.forEach((d, idx) => {
            (d.empleados || []).forEach(emp => {
                out.push({
                    deptIndex: idx,
                    deptNombre: d.nombre,
                    empleado: emp
                });
            });
        });
        return out;
    }


    /**
     * ==========================================================
     * Filtra la lista de empleados según los criterios
     * seleccionados en STATE (departamento, puesto, búsqueda).
     * Devuelve la lista filtrada.
     * ==========================================================
     */
    function getEmpleadosFiltrados() {
        let lista = STATE.empleadosFlat;
        // Filtrar por departamento si aplica
        if (STATE.deptIndex !== -1) {
            lista = lista.filter(x => x.deptIndex === STATE.deptIndex);
        }
        // Filtrar por puesto si aplica
        if (STATE.puesto !== '-1') {
            lista = lista.filter(x => {
                const emp = x.empleado;
                return emp.puesto && emp.puesto === STATE.puesto;
            });
        }
        // Filtrar por búsqueda si hay texto
        const q = (STATE.busqueda || '').trim().toLowerCase();
        if (q) {
            lista = lista.filter(x => {
                const emp = x.empleado;
                return (
                    (emp.nombre && emp.nombre.toLowerCase().includes(q)) ||
                    (emp.clave && String(emp.clave).toLowerCase().includes(q)) ||
                    (emp.clave_empleado && String(emp.clave_empleado).toLowerCase().includes(q)) ||
                    (emp.id_empleado && String(emp.id_empleado).toLowerCase().includes(q))
                );
            });
        }
        return lista;
    }

    // --- Búsqueda ---
    STATE.busqueda = '';
    $(document).on('input', '#campo-busqueda', function () {
        STATE.busqueda = $(this).val();
        STATE.page = 1;
        render();
    });

    $(document).on('click', '#btn-clear-busqueda', function () {
        $('#campo-busqueda').val('');
        STATE.busqueda = '';
        STATE.page = 1;
        render();
    });

    function renderPaginacion(totalItems) {
        const totalPages = Math.max(1, Math.ceil(totalItems / STATE.pageSize));
        if (STATE.page > totalPages) STATE.page = totalPages;
        const $p = $('#paginacion-reloj');
        $p.empty();

        function addItem(label, page, disabled, active) {
            const li = $('<li>').addClass('page-item');
            if (disabled) li.addClass('disabled');
            if (active) li.addClass('active');
            const a = $('<a>').addClass('page-link').attr('href', '#').text(label);
            a.on('click', function (e) {
                e.preventDefault();
                if (disabled) return;
                STATE.page = page;
                render();
            });
            li.append(a);
            $p.append(li);
        }

        addItem('«', Math.max(1, STATE.page - 1), STATE.page === 1, false);

        // Ventana de páginas
        const start = Math.max(1, STATE.page - 2);
        const end = Math.min(totalPages, start + 4);
        for (let i = start; i <= end; i++) {
            addItem(String(i), i, false, i === STATE.page);
        }

        addItem('»', Math.min(totalPages, STATE.page + 1), STATE.page === totalPages, false);
    }

    /**
     * ===============================================
     * Función para renderizar la tabla de un empleado
     * ===============================================
     */
    function renderTablaEmpleado(item, idxGlobal) {
        const emp = item.empleado;
        const registros = emp.registros_procesados || [];

        const $wrap = $('<div>').addClass('mb-4 tabla-empleado-wrapper').attr('data-empleado-idx', idxGlobal);
        const $table = $('<table>').addClass('table table-hover table-bordered table-sm');
        const $tbody = $('<tbody>');

        // Header tipo imagen
        const fechaInicio = STATE.datos?.fecha_inicio || '';
        const fechaFin = STATE.datos?.fecha_cierre || '';
        $tbody.append(`
            <tr>
                <th class="table-secondary" style="width:160px;">Departamento</th>
                <td colspan="7">${item.deptNombre || ''}</td>
            </tr>
            <tr>
                <th class="table-secondary">Desde</th>
                <td colspan="2">${fechaInicio}</td>
                <th>Hasta</th>
                <td colspan="3">${fechaFin}</td>
            </tr>
            <tr>
                <th class="table-secondary">Nombre</th>
                <td colspan="4">${emp.nombre || ''}</td>
                <th class="table-secondary">Total semana</th>
                <td colspan="2">${emp.trabajado_total_decimal ?? 0} (${emp.trabajado_total_hhmm || '00:00'})</td>
            </tr>
        `);

        // Encabezados (orden como imagen)
        $tbody.append(`
            <tr>
                <th class="table-secondary" style="width:60px;">ID</th>
                <th class="table-secondary" style="width:110px;">Día</th>
                <th class="table-secondary" style="width:110px;">Fecha</th>
                <th class="table-secondary">Turno</th>
                <th class="table-secondary" style="width:90px;">Entrada</th>
                <th class="table-secondary" style="width:90px;">Salida</th>
                <th class="table-secondary" style="width:140px;">Redondeo Entrada</th>
                <th class="table-secondary" style="width:140px;">Redondeo Salida</th>
                <th class="table-secondary" style="width:90px;">Trabajado</th>
                <th class="table-secondary" style="width:140px;">Tarde / Temprano</th>
                <th class="table-secondary" style="width:90px;">Descanso</th>
            </tr>
        `);

        // Buscar el turno del sábado para usar como fallback
        let turnoSabado = 'N/A';
        const regSabado = registros.find(reg => {
            const d = parseDDMMYYYY(reg.fecha);
            return d && diaSemanaES(d) === 'SÁBADO';
        });
        if (regSabado && regSabado.tipo_turno && regSabado.tipo_turno !== 'N/A') {
            turnoSabado = regSabado.tipo_turno;
        }

        registros.forEach(r => {
            const d = parseDDMMYYYY(r.fecha);
            const dia = d ? diaSemanaES(d) : '';

            // Usar tipo_turno que viene en cada registro_procesado
            // Si es N/A (ej: domingo), usar el turno del sábado
            let turnoTxt = r.tipo_turno || 'N/A';
            if (turnoTxt === 'N/A' && turnoSabado !== 'N/A') {
                turnoTxt = turnoSabado;
            }

            const marcas = Array.isArray(r.registros) ? r.registros : [];
            const e1 = marcas[0]?.hora || '';
            const s1 = marcas[1]?.hora || '';
            const e2 = marcas[2]?.hora || '';
            const s2 = marcas[3]?.hora || '';

            const rowColor = getRowColor(r.tipo, emp);
            const tooltipText = getTooltipText(r.tipo);
            const cellStyle = rowColor ? `style="background-color: ${rowColor} !important;"` : '';
            const tooltipAttrs = tooltipText ? `class="celda-con-tooltip" data-tooltip="${tooltipText}"` : '';
            const id = emp.clave || emp.id_empleado || (idxGlobal + 1);

            // Para asistencia, verificar cuántos registros tiene el día
            // Si tiene 4 registros (E1, S1, E2, S2) → 2 filas
            // Si tiene 2 registros (E1, S1 sin comida) → 1 fila
            if (String(r.tipo) === 'asistencia') {
                // Primera fila siempre (E1, S1)
                $tbody.append(`
                    <tr>
                        <td>${id}</td>
                        <td>${dia}</td>
                        <td>${r.fecha || ''}</td>
                        <td>${turnoTxt}</td>
                        <td ${cellStyle} ${tooltipAttrs}>${e1}</td>
                        <td ${cellStyle} ${tooltipAttrs}>${s1}</td>
                        <td></td>
                        <td></td>
                        <td>${diffHHMM(e1, s1) || '00:00'}</td>
                        <td></td>
                        <td></td>
                    </tr>
                `);
                
                // Segunda fila solo si tiene E2 o S2 (turno con comida)
                if (e2 || s2) {
                    $tbody.append(`
                        <tr>
                            <td>${id}</td>
                            <td>${dia}</td>
                            <td>${r.fecha || ''}</td>
                            <td>${turnoTxt}</td>
                            <td ${cellStyle} ${tooltipAttrs}>${e2}</td>
                            <td ${cellStyle} ${tooltipAttrs}>${s2}</td>
                            <td></td>
                            <td></td>
                            <td>${diffHHMM(e2, s2) || '00:00'}</td>
                            <td></td>
                            <td></td>
                        </tr>
                    `);
                }
            } else {
                // Para eventos, una fila con columnas en blanco
                $tbody.append(`
                    <tr>
                        <td>${id}</td>
                        <td>${dia}</td>
                        <td>${r.fecha || ''}</td>
                        <td>${turnoTxt}</td>
                        <td ${cellStyle} ${tooltipAttrs}></td>
                        <td ${cellStyle} ${tooltipAttrs}></td>
                        <td></td>
                        <td></td>
                        <td>${r.trabajado_hhmm || '00:00'}</td>
                        <td></td>
                        <td></td>
                    </tr>
                `);
            }

            
        });

        // Filas de resumen como en la imagen
        const horasTotales = (emp.trabajado_total_decimal ?? 0).toFixed(2);
        const tiempoTotal = emp.trabajado_total_hhmm || '00:00';

        const horasRedondeada = redondearHoras(tiempoTotal);

        $tbody.append(`
            <tr>
                <th colspan="2">Horas totales</th>
                <td colspan="2">${horasRedondeada}</td>
                <th colspan="3">Tiempo total</th>
                <td colspan="4">${tiempoTotal}</td>
            </tr>
        `);

        $table.append($tbody);
        $wrap.append($table);

        // Guardar referencia al empleado completo
        $wrap.data('empleadoData', { empleado: emp, departamento: item.deptNombre });

        return $wrap;
    }

    function render() {
        STATE.datos = cargarDatos();
        if (!STATE.datos) {
            $('#tablas-reloj').empty();
            $('#paginacion-reloj').empty();
            return;
        }

        console.log(STATE.datos);

        STATE.empleadosFlat = flattenEmpleados(STATE.datos);
        const list = getEmpleadosFiltrados();
        renderPaginacion(list.length);

        const start = (STATE.page - 1) * STATE.pageSize;
        const pageItems = list.slice(start, start + STATE.pageSize);
        const $container = $('#tablas-reloj');
        $container.empty();

        pageItems.forEach((it, idx) => {
            $container.append(renderTablaEmpleado(it, start + idx));
        });
    }

    /**
     * =========================================================
     * Redondea horas en formato "HH:MM" al entero más cercano.
     * =========================================================
     */
    function redondearHoras(hhmm) {
        const [horasStr, minutosStr] = (hhmm || '00:00').split(':');
        const horas = parseInt(horasStr, 10);
        const minutos = parseInt(minutosStr, 10);
        const resultado = minutos <= 10 ? horas : horas + 1;
        return resultado.toFixed(2);
    }

    /**
     * ================================
     * Filtro de departamento cambiado
     * ================================
     */
    $(document).on('change', '#departamentos-reloj', function () {
        const v = parseInt($(this).val(), 10);
        STATE.deptIndex = Number.isFinite(v) ? v : -1;
        STATE.page = 1;
        render();
    });


    /**
    * ================================
    * Filtro de puesto cambiado
    * ================================
    */
    $(document).on('change', '#puestos-reloj', function () {
        const v = $(this).val();
        STATE.puesto = v || '-1';
        STATE.page = 1;
        render();
    });

    // Cuando process_excel.js guarda / reprocesa
    $(document).on('reloj-data-updated', function (event, options) {
        // Si options.preservePage es true, no resetear la página
        if (!options || !options.preservePage) {
            STATE.page = 1;
        }
        
        render();
    });

    // Menú contextual (clic derecho)
    let $contextMenu = null;

    function crearMenuContextual() {
        if ($contextMenu) return $contextMenu;

        $contextMenu = $('<div>')
            .attr('id', 'context-menu-empleado')
            .css({
                position: 'fixed',
                display: 'none',
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 9999,
                borderRadius: '4px',
                minWidth: '150px'
            });

        const $opcion = $('<div>')
            .text('🔎​ Ver Detalles')
            .css({
                padding: '10px 15px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
            })
            .hover(
                function () { $(this).css('backgroundColor', '#f0f0f0'); },
                function () { $(this).css('backgroundColor', '#fff'); }
            );

        $contextMenu.append($opcion);
        $('body').append($contextMenu);

        return $contextMenu;
    }

    // Evento clic derecho en tablas de empleados
    $(document).on('contextmenu', '.tabla-empleado-wrapper', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const $tabla = $(this);
        const empleadoData = $tabla.data('empleadoData');

        if (!empleadoData) {
            console.warn('No se encontraron datos del empleado');
            return;
        }

        const menu = crearMenuContextual();

        // Usar clientX y clientY para posicionamiento relativo al viewport
        menu.css({
            display: 'block',
            left: e.clientX + 'px',
            top: e.clientY + 'px'
        }).data('empleadoData', empleadoData);

        return false;
    });

    // Cerrar menú contextual al hacer clic fuera
    $(document).on('click', function (e) {
        if ($contextMenu && !$(e.target).closest('#context-menu-empleado').length) {
            $contextMenu.hide();
        }
    });

    // Evento clic en opción del menú contextual
    $(document).on('click', '#context-menu-empleado > div', function () {
        const menu = $(this).parent();
        const empleadoData = menu.data('empleadoData');

        if (empleadoData) {
            abrirModalDetalles(empleadoData);
        }

        menu.hide();
    });

    // Función para abrir modal de detalles
    function abrirModalDetalles(data) {
        // Disparar evento personalizado con los datos del empleado
        $(document).trigger('abrir-modal-detalles', [data]);

        // Asegurar que el tab de información esté activo
        $('#tab-info').addClass('active');
        $('#tab-registros').removeClass('active');
        $('#tab-horarios').removeClass('active');

        // Asegurar que el contenido del tab de información esté visible
        $('#tab_info').addClass('show active');
        $('#tab_registros').removeClass('show active');
        $('#tab_horarios').removeClass('show active');

        // Mostrar modal
        $('#modal-detalles').fadeIn(300);
    }

    // Cerrar modal
    $(document).on('click', '#cerrar-modal-detalles, #btn-cancelar-detalles', function () {
        $('#modal-detalles').fadeOut(300);
    });

    // Cerrar modal al hacer clic fuera
    $(document).on('click', '#modal-detalles', function (e) {
        if ($(e.target).is('#modal-detalles')) {
            $('#modal-detalles').fadeOut(300);
        }
    });

    // ===============================================
    // Tooltip personalizado para celdas con color
    // ===============================================
    let $tooltip = null;

    function crearTooltip() {
        if ($tooltip) return $tooltip;

        $tooltip = $('<div>')
            .attr('id', 'tooltip-celda')
            .css({
                position: 'fixed',
                display: 'none',
                backgroundColor: 'rgba(33, 37, 41, 0.95)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                zIndex: 10000,
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap',
                transition: 'opacity 0.15s ease-in-out'
            });

        $('body').append($tooltip);
        return $tooltip;
    }

    // Mostrar tooltip al hacer hover en celdas con color
    $(document).on('mouseenter', '.celda-con-tooltip', function (e) {
        const texto = $(this).data('tooltip');
        if (!texto) return;

        const tooltip = crearTooltip();
        tooltip.text(texto).css({
            display: 'block',
            opacity: 0
        });

        // Posicionar tooltip arriba de la celda
        const rect = this.getBoundingClientRect();
        const tooltipHeight = tooltip.outerHeight();
        const tooltipWidth = tooltip.outerWidth();

        let top = rect.top - tooltipHeight - 8;
        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

        // Ajustar si se sale de la pantalla
        if (top < 5) {
            top = rect.bottom + 8; // Mostrar abajo si no cabe arriba
        }
        if (left < 5) {
            left = 5;
        }
        if (left + tooltipWidth > window.innerWidth - 5) {
            left = window.innerWidth - tooltipWidth - 5;
        }

        tooltip.css({
            top: top + 'px',
            left: left + 'px',
            opacity: 1
        });
    });

    // Ocultar tooltip al salir de la celda
    $(document).on('mouseleave', '.celda-con-tooltip', function () {
        if ($tooltip) {
            $tooltip.css({ display: 'none', opacity: 0 });
        }
    });

    // Render inicial
    render();
});

/**
 * ==========================================================
 * Función global para obtener los datos filtrados
 * Aplica los filtros de departamento y puesto actuales
 * ==========================================================
 */
function obtenerDatosFiltrados() {
    // Obtener datos originales
    let datos = null;
    try {
        const raw = sessionStorage.getItem('reloj-ocho');
        datos = raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }

    if (!datos || !datos.departamentos) return datos;

    // Obtener filtros actuales
    const deptIndex = $('#departamentos-reloj').val();
    const puesto = $('#puestos-reloj').val();

    // Si no hay filtros, retornar todos los datos
    if ((!deptIndex || deptIndex === '-1') && (!puesto || puesto === '-1')) {
        return datos;
    }

    // Clonar datos para no modificar el original
    const datosFiltrados = JSON.parse(JSON.stringify(datos));

    // Aplicar filtros
    if (deptIndex && deptIndex !== '-1') {
        const idx = parseInt(deptIndex);
        // Mantener solo el departamento seleccionado
        datosFiltrados.departamentos = datosFiltrados.departamentos.filter((d, i) => i === idx);
    }

    // Filtrar por puesto si aplica
    if (puesto && puesto !== '-1') {
        datosFiltrados.departamentos = datosFiltrados.departamentos.map(dept => {
            return {
                ...dept,
                empleados: dept.empleados.filter(emp => emp.puesto === puesto)
            };
        }).filter(dept => dept.empleados.length > 0);
    }

    return datosFiltrados;
}