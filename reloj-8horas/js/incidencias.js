/**
 * Incidencias - Asignación manual de Vacaciones e Incapacidades
 * 
 * Este módulo permite al usuario asignar los días específicos de vacaciones
 * e incapacidades para empleados que los tienen según la lista de raya.
 * 
 * Autor: Brandon
 */

$(document).ready(function () {

    // ============================================================
    // NOMBRES DE DÍAS EN ESPAÑOL
    // ============================================================
    const DIAS_SEMANA_ES = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];

    /**
     * Parsea fecha DD/MM/YYYY a Date
     */
    function parseDDMMYYYY(s) {
        if (!s) return null;
        const [dd, mm, yyyy] = String(s).split('/').map(x => parseInt(x, 10));
        if (!dd || !mm || !yyyy) return null;
        return new Date(yyyy, mm - 1, dd);
    }

    /**
     * Obtiene el nombre del día en español
     */
    function getNombreDia(fechaStr) {
        const date = parseDDMMYYYY(fechaStr);
        if (!date) return '';
        return DIAS_SEMANA_ES[date.getDay()];
    }

    /**
     * Obtiene los datos del JSON desde sessionStorage
     */
    function obtenerDatos() {
        try {
            const data = sessionStorage.getItem('reloj-ocho');
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            console.error('Error al parsear datos:', e);
            return null;
        }
    }

    /**
     * Busca empleados con vacaciones o incapacidades según la lista de raya ORIGINAL
     * (valores que vienen del Excel/lista de raya, no los recalculados)
     */
    function buscarEmpleadosConIncidencias(jsonUnido) {
        const empleadosConIncidencias = [];

        (jsonUnido.departamentos || []).forEach(depto => {
            const nombreDepto = (depto.nombre || '').replace(/^\d+\.?\s*/, '').trim();

            (depto.empleados || []).forEach(emp => {
                // Usar los datos originales de la lista de raya
                // Se busca dias_vacaciones_original o dias_vacaciones (primer procesamiento)
                const diasVac = emp.dias_vacaciones_original != null ? emp.dias_vacaciones_original : (emp.dias_vacaciones || 0);
                const diasInc = emp.dias_incapacidades_original != null ? emp.dias_incapacidades_original : (emp.dias_incapacidades || 0);

                if (diasVac > 0 || diasInc > 0) {
                    // Contar cuántos días ya están asignados manualmente
                    let vacAsignadas = 0;
                    let incAsignadas = 0;

                    (emp.registros_procesados || []).forEach(reg => {
                        if (reg.editado_manualmente) {
                            if (reg.tipo === 'vacaciones') vacAsignadas++;
                            if (reg.tipo === 'incapacidad') incAsignadas++;
                        }
                    });

                    empleadosConIncidencias.push({
                        clave: emp.clave || emp.id_empleado,
                        nombre: emp.nombre,
                        departamento: nombreDepto,
                        dias_vacaciones: diasVac,
                        dias_incapacidades: diasInc,
                        vacaciones_asignadas: vacAsignadas,
                        incapacidades_asignadas: incAsignadas,
                        registros_procesados: emp.registros_procesados || [],
                        empleado_ref: emp
                    });
                }
            });
        });

        return empleadosConIncidencias;
    }

    /**
     * Obtiene el badge de tipo según el estado actual del registro
     */
    function getBadgeTipo(tipo) {
        switch (tipo) {
            case 'asistencia': return '<span class="badge bg-light text-dark tipo-actual-badge">Asistencia</span>';
            case 'inasistencia': return '<span class="badge bg-secondary tipo-actual-badge">Inasistencia</span>';
            case 'vacaciones': return '<span class="badge bg-success tipo-actual-badge">Vacaciones</span>';
            case 'incapacidad': return '<span class="badge bg-primary tipo-actual-badge">Incapacidad</span>';
            case 'descanso': return '<span class="badge bg-warning text-dark tipo-actual-badge">Descanso</span>';
            case 'no_laboro': return '<span class="badge bg-dark tipo-actual-badge">No labora</span>';
            case 'dia_festivo': return '<span class="badge bg-danger tipo-actual-badge">Festivo</span>';
            default: return `<span class="badge bg-secondary tipo-actual-badge">${tipo || 'N/A'}</span>`;
        }
    }

    /**
     * Determina si un día puede recibir incidencia
     * Todos los días pueden recibir incidencia - el usuario decide manualmente
     */
    function puedeAsignarIncidencia(registro) {
        return true;
    }

    /**
     * Calcula el estado de asignación de un empleado
     */
    function calcularEstado(emp) {
        const totalRequerido = emp.dias_vacaciones + emp.dias_incapacidades;
        const totalAsignado = emp.vacaciones_asignadas + emp.incapacidades_asignadas;

        if (totalAsignado === 0) return { clase: 'badge-estado-pendiente', texto: 'Pendiente' };
        if (totalAsignado >= totalRequerido) return { clase: 'badge-estado-completo', texto: 'Completo' };
        return { clase: 'badge-estado-parcial', texto: `${totalAsignado}/${totalRequerido}` };
    }

    /**
     * Renderiza la tabla principal de empleados
     */
    function renderizarTablaEmpleados(empleados) {
        const $tbody = $('#tbody-incidencias');
        $tbody.empty();

        if (empleados.length === 0) {
            $('#incidencias-contenido').hide();
            $('#incidencias-vacio').show();
            return;
        }

        $('#incidencias-vacio').hide();
        $('#incidencias-contenido').show();

        empleados.forEach((emp, idx) => {
            const estado = calcularEstado(emp);

            // Fila principal del empleado (clickeable para expandir)
            const $filaEmpleado = $(`
                <tr class="fila-empleado-incidencia" data-idx="${idx}">
                    <td class="text-center">
                        <i class="bi bi-chevron-right flecha-expand"></i>
                    </td>
                    <td>
                        <strong>${emp.nombre}</strong>
                        <br><small class="text-muted">Clave: ${emp.clave}</small>
                    </td>
                    <td><small>${emp.departamento}</small></td>
                    <td class="text-center">
                        ${emp.dias_vacaciones > 0
                    ? `<span class="badge bg-success">${emp.vacaciones_asignadas}/${emp.dias_vacaciones}</span>`
                    : '<span class="text-muted">-</span>'}
                    </td>
                    <td class="text-center">
                        ${emp.dias_incapacidades > 0
                    ? `<span class="badge bg-primary">${emp.incapacidades_asignadas}/${emp.dias_incapacidades}</span>`
                    : '<span class="text-muted">-</span>'}
                    </td>
                    <td class="text-center">
                        <span class="badge ${estado.clase}">${estado.texto}</span>
                    </td>
                </tr>
            `);

            $tbody.append($filaEmpleado);

            // Fila de detalle (oculta inicialmente)
            const $filaDetalle = $(`
                <tr class="detalle-dias-row" data-idx="${idx}" style="display:none;">
                    <td colspan="6">
                        <div class="detalle-dias-container">
                            ${renderizarDiasEmpleado(emp, idx)}
                        </div>
                    </td>
                </tr>
            `);

            $tbody.append($filaDetalle);
        });
    }

    /**
     * Renderiza la sub-tabla de días para un empleado
     */
    function renderizarDiasEmpleado(emp, idxEmpleado) {
        const registros = emp.registros_procesados;

        if (!registros || registros.length === 0) {
            return '<p class="text-muted">No hay registros procesados</p>';
        }

        let html = '<table class="table table-sm table-bordered tabla-dias-incidencia">';
        html += '<thead><tr>';
        html += '<th>Día</th><th>Fecha</th><th>Estado Actual</th>';

        if (emp.dias_incapacidades > 0) {
            html += '<th class="text-center">Incapacidad</th>';
        }
        if (emp.dias_vacaciones > 0) {
            html += '<th class="text-center">Vacaciones</th>';
        }

        html += '</tr></thead><tbody>';

        registros.forEach((reg, idxDia) => {
            const nombreDia = getNombreDia(reg.fecha);
            const puede = puedeAsignarIncidencia(reg);
            const esDescanso = reg.tipo === 'descanso' || reg.tipo === 'no_laboro' || reg.tipo === 'dia_festivo';
            const rowClass = esDescanso ? 'dia-descanso-row' : '';

            // Determinar si este día ya tiene asignación manual
            const esIncapacidadManual = reg.editado_manualmente && reg.tipo === 'incapacidad';
            const esVacacionManual = reg.editado_manualmente && reg.tipo === 'vacaciones';
            const esAsistencia = reg.tipo === 'asistencia';

            html += `<tr class="${rowClass}">`;
            html += `<td><strong>${nombreDia}</strong></td>`;
            html += `<td>${reg.fecha}</td>`;
            html += `<td>${getBadgeTipo(reg.tipo)}</td>`;

            if (emp.dias_incapacidades > 0) {
                if (puede) {
                    html += `<td class="text-center">
                        <input type="checkbox" class="form-check-input check-incapacidad"
                            data-emp-idx="${idxEmpleado}" data-dia-idx="${idxDia}" data-fecha="${reg.fecha}"
                            ${esIncapacidadManual ? 'checked' : ''}
                            title="Marcar como Incapacidad">
                    </td>`;
                } else {
                    html += '<td class="text-center"><span class="text-muted">—</span></td>';
                }
            }

            if (emp.dias_vacaciones > 0) {
                if (puede) {
                    html += `<td class="text-center">
                        <input type="checkbox" class="form-check-input check-vacacion"
                            data-emp-idx="${idxEmpleado}" data-dia-idx="${idxDia}" data-fecha="${reg.fecha}"
                            ${esVacacionManual ? 'checked' : ''}
                            title="Marcar como Vacaciones">
                    </td>`;
                } else {
                    html += '<td class="text-center"><span class="text-muted">—</span></td>';
                }
            }

            html += '</tr>';
        });

        html += '</tbody></table>';

        // Contadores
        html += '<div class="d-flex gap-3 mt-2">';
        if (emp.dias_incapacidades > 0) {
            html += `<span class="contador-seleccion text-primary" id="contador-inc-${idxEmpleado}">
                Incapacidades: <span class="num-inc">0</span>/${emp.dias_incapacidades}
            </span>`;
        }
        if (emp.dias_vacaciones > 0) {
            html += `<span class="contador-seleccion text-success" id="contador-vac-${idxEmpleado}">
                Vacaciones: <span class="num-vac">0</span>/${emp.dias_vacaciones}
            </span>`;
        }
        html += '</div>';

        return html;
    }

    /**
     * Actualiza los contadores de selección para un empleado
     */
    function actualizarContadores(idxEmpleado, empleados) {
        const emp = empleados[idxEmpleado];
        if (!emp) return;

        const $detalle = $(`.detalle-dias-row[data-idx="${idxEmpleado}"]`);
        const incChecked = $detalle.find('.check-incapacidad:checked').length;
        const vacChecked = $detalle.find('.check-vacacion:checked').length;

        // Actualizar contadores visuales
        $detalle.find(`#contador-inc-${idxEmpleado} .num-inc`).text(incChecked);
        $detalle.find(`#contador-vac-${idxEmpleado} .num-vac`).text(vacChecked);

        // Actualizar badges en la fila principal
        const $filaPrincipal = $(`.fila-empleado-incidencia[data-idx="${idxEmpleado}"]`);

        if (emp.dias_incapacidades > 0) {
            $filaPrincipal.find('td:nth-child(5) .badge').text(`${incChecked}/${emp.dias_incapacidades}`);
        }
        if (emp.dias_vacaciones > 0) {
            $filaPrincipal.find('td:nth-child(4) .badge').text(`${vacChecked}/${emp.dias_vacaciones}`);
        }

        // Actualizar estado
        const totalRequerido = emp.dias_vacaciones + emp.dias_incapacidades;
        const totalAsignado = incChecked + vacChecked;
        let estadoClase, estadoTexto;

        if (totalAsignado === 0) {
            estadoClase = 'badge-estado-pendiente';
            estadoTexto = 'Pendiente';
        } else if (totalAsignado >= totalRequerido) {
            estadoClase = 'badge-estado-completo';
            estadoTexto = 'Completo';
        } else {
            estadoClase = 'badge-estado-parcial';
            estadoTexto = `${totalAsignado}/${totalRequerido}`;
        }

        $filaPrincipal.find('td:last-child .badge')
            .removeClass('badge-estado-pendiente badge-estado-completo badge-estado-parcial')
            .addClass(estadoClase)
            .text(estadoTexto);
    }

    // ============================================================
    // VARIABLE PARA ALMACENAR LOS EMPLEADOS CON INCIDENCIAS
    // ============================================================
    let empleadosIncidencias = [];

    // ============================================================
    // EVENTO: Abrir modal de incidencias
    // ============================================================
    const modalIncidencias = document.getElementById('modalIncidencias');
    if (modalIncidencias) {
        modalIncidencias.addEventListener('show.bs.modal', function () {
            const $loading = $('#incidencias-loading');
            const $vacio = $('#incidencias-vacio');
            const $contenido = $('#incidencias-contenido');

            $loading.show();
            $vacio.hide();
            $contenido.hide();

            const jsonUnido = obtenerDatos();

            if (!jsonUnido) {
                $loading.hide();
                $vacio.show();
                return;
            }

            // Guardar valores originales de lista de raya si no se han guardado aún
            (jsonUnido.departamentos || []).forEach(depto => {
                (depto.empleados || []).forEach(emp => {
                    if (emp.dias_vacaciones_original == null) {
                        emp.dias_vacaciones_original = emp.dias_vacaciones || 0;
                    }
                    if (emp.dias_incapacidades_original == null) {
                        emp.dias_incapacidades_original = emp.dias_incapacidades || 0;
                    }
                    // Guardar tipo_original de cada registro para poder revertir correctamente
                    (emp.registros_procesados || []).forEach(reg => {
                        if (reg.tipo_original == null) {
                            reg.tipo_original = reg.tipo;
                            // Guardar también los datos originales de trabajo para restaurar
                            reg.registros_original = reg.registros ? JSON.parse(JSON.stringify(reg.registros)) : [];
                            reg.trabajado_minutos_original = reg.trabajado_minutos || 0;
                            reg.trabajado_hhmm_original = reg.trabajado_hhmm || '00:00';
                            reg.trabajado_decimal_original = reg.trabajado_decimal || 0;
                            reg.observacion_dia_original = reg.observacion_dia || '';
                        }
                    });
                });
            });

            // Guardar los originales en sessionStorage
            try {
                sessionStorage.setItem('reloj-ocho', JSON.stringify(jsonUnido));
            } catch (e) {
                console.error('Error al guardar originales:', e);
            }

            empleadosIncidencias = buscarEmpleadosConIncidencias(jsonUnido);

            $loading.hide();
            renderizarTablaEmpleados(empleadosIncidencias);

            // Actualizar contadores iniciales
            empleadosIncidencias.forEach((emp, idx) => {
                setTimeout(() => actualizarContadores(idx, empleadosIncidencias), 50);
            });
        });
    }

    // ============================================================
    // EVENTO: Click en fila de empleado para expandir/colapsar
    // ============================================================
    $(document).on('click', '.fila-empleado-incidencia', function () {
        const idx = $(this).data('idx');
        const $detalle = $(`.detalle-dias-row[data-idx="${idx}"]`);
        const $flecha = $(this).find('.flecha-expand');

        if ($detalle.is(':visible')) {
            $detalle.hide();
            $(this).removeClass('expandido');
        } else {
            $detalle.show();
            $(this).addClass('expandido');
            // Actualizar contadores al abrir
            actualizarContadores(idx, empleadosIncidencias);
        }
    });

    // ============================================================
    // EVENTO: Checkbox de incapacidad cambiado
    // ============================================================
    $(document).on('change', '.check-incapacidad', function (e) {
        e.stopPropagation();
        const idxEmpleado = parseInt($(this).data('emp-idx'));
        const fecha = $(this).data('fecha');
        const isChecked = $(this).is(':checked');

        // Si se marca incapacidad, desmarcar vacaciones del mismo día
        if (isChecked) {
            $(`.check-vacacion[data-emp-idx="${idxEmpleado}"][data-fecha="${fecha}"]`).prop('checked', false);
        }

        // Validar que no exceda el límite
        const emp = empleadosIncidencias[idxEmpleado];
        if (isChecked && emp) {
            const $detalle = $(`.detalle-dias-row[data-idx="${idxEmpleado}"]`);
            const totalChecked = $detalle.find('.check-incapacidad:checked').length;

            if (totalChecked > emp.dias_incapacidades) {
                $(this).prop('checked', false);
                Swal.fire({
                    title: "Límite alcanzado",
                    text: `Solo se pueden asignar ${emp.dias_incapacidades} día${emp.dias_incapacidades > 1 ? 's' : ''} de incapacidad`,
                    icon: "warning",
                    timer: 2000,
                    showConfirmButton: false
                });
                return;
            }
        }

        actualizarContadores(idxEmpleado, empleadosIncidencias);
    });

    // ============================================================
    // EVENTO: Checkbox de vacaciones cambiado
    // ============================================================
    $(document).on('change', '.check-vacacion', function (e) {
        e.stopPropagation();
        const idxEmpleado = parseInt($(this).data('emp-idx'));
        const fecha = $(this).data('fecha');
        const isChecked = $(this).is(':checked');

        // Si se marca vacaciones, desmarcar incapacidad del mismo día
        if (isChecked) {
            $(`.check-incapacidad[data-emp-idx="${idxEmpleado}"][data-fecha="${fecha}"]`).prop('checked', false);
        }

        // Validar que no exceda el límite
        const emp = empleadosIncidencias[idxEmpleado];
        if (isChecked && emp) {
            const $detalle = $(`.detalle-dias-row[data-idx="${idxEmpleado}"]`);
            const totalChecked = $detalle.find('.check-vacacion:checked').length;

            if (totalChecked > emp.dias_vacaciones) {
                $(this).prop('checked', false);
                Swal.fire({
                    title: "Límite alcanzado",
                    text: `Solo se pueden asignar ${emp.dias_vacaciones} día${emp.dias_vacaciones > 1 ? 's' : ''} de vacaciones`,
                    icon: "warning",
                    timer: 2000,
                    showConfirmButton: false
                });
                return;
            }
        }

        actualizarContadores(idxEmpleado, empleadosIncidencias);
    });

    // ============================================================
    // EVENTO: Guardar incidencias
    // ============================================================
    $(document).on('click', '#btn-guardar-incidencias', function (e) {
        e.preventDefault();

        const jsonUnido = obtenerDatos();
        if (!jsonUnido) {
            Swal.fire({ title: "Error", text: "No hay datos cargados", icon: "error" });
            return;
        }

        // Validar que todos los empleados con incidencias tengan horario asignado
        const empleadosSinHorario = [];
        empleadosIncidencias.forEach(empInfo => {
            const tieneRegistrosSinHorario = empInfo.registros_procesados.some(reg =>
                reg.tipo === 'sin_horario'
            );
            if (tieneRegistrosSinHorario) {
                empleadosSinHorario.push({
                    nombre: empInfo.nombre,
                    clave: empInfo.clave
                });
            }
        });

        if (empleadosSinHorario.length > 0) {
            const listaNombres = empleadosSinHorario.map(e => `<li>${e.nombre} (${e.clave})</li>`).join('');
            Swal.fire({
                title: "⚠️ Horarios pendientes",
                html: `
                    <p>Los siguientes empleados no tienen horario asignado:</p>
                    <ul style="text-align: left; max-height: 200px; overflow-y: auto;">
                        ${listaNombres}
                    </ul>
                    <p class="mt-3"><strong>Por favor, asigna horarios antes de guardar incidencias.</strong></p>
                `,
                icon: "warning",
                confirmButtonText: "Entendido"
            });
            return;
        }

        let totalCambios = 0;

        // Recorrer cada empleado con incidencias
        empleadosIncidencias.forEach((empInfo, idxEmpleado) => {
            // Buscar el empleado en el JSON actual (no usar la referencia vieja)
            let emp = null;
            const claveEmp = empInfo.clave;
            for (const depto of (jsonUnido.departamentos || [])) {
                const encontrado = (depto.empleados || []).find(e =>
                    (e.clave || e.id_empleado) === claveEmp
                );
                if (encontrado) {
                    emp = encontrado;
                    break;
                }
            }
            if (!emp) return;

            const $detalle = $(`.detalle-dias-row[data-idx="${idxEmpleado}"]`);

            // Recoger los checkboxes marcados (usar attr para asegurar string)
            const incapacidadesMarcadas = new Set();
            const vacacionesMarcadas = new Set();

            $detalle.find('.check-incapacidad:checked').each(function () {
                incapacidadesMarcadas.add(String($(this).attr('data-fecha')));
            });

            $detalle.find('.check-vacacion:checked').each(function () {
                vacacionesMarcadas.add(String($(this).attr('data-fecha')));
            });

            console.log(`Empleado ${empInfo.clave}: Inc=${[...incapacidadesMarcadas]}, Vac=${[...vacacionesMarcadas]}`);

            // Actualizar registros_procesados del empleado
            (emp.registros_procesados || []).forEach(reg => {
                const fecha = String(reg.fecha);

                if (incapacidadesMarcadas.has(fecha)) {
                    // Marcar como incapacidad
                    if (reg.tipo !== 'incapacidad' || !reg.editado_manualmente) {
                        reg.tipo = 'incapacidad';
                        reg.registros = [];
                        reg.trabajado_minutos = 0;
                        reg.trabajado_hhmm = '00:00';
                        reg.trabajado_decimal = 0;
                        reg.observacion_dia = 'INCAPACIDAD';
                        reg.editado_manualmente = true;
                        totalCambios++;
                    }
                } else if (vacacionesMarcadas.has(fecha)) {
                    // Marcar como vacaciones
                    if (reg.tipo !== 'vacaciones' || !reg.editado_manualmente) {
                        reg.tipo = 'vacaciones';
                        reg.registros = [];
                        reg.trabajado_minutos = 0;
                        reg.trabajado_hhmm = '00:00';
                        reg.trabajado_decimal = 0;
                        reg.observacion_dia = 'VACACIONES';
                        reg.editado_manualmente = true;
                        totalCambios++;
                    }
                } else {
                    // Si antes era incapacidad/vacaciones manual y ahora no está marcado,
                    // revertir al estado original del día
                    if (reg.editado_manualmente && (reg.tipo === 'incapacidad' || reg.tipo === 'vacaciones')) {
                        // Restaurar tipo y datos originales
                        const tipoOrig = reg.tipo_original || 'inasistencia';
                        reg.tipo = tipoOrig;
                        reg.registros = reg.registros_original ? JSON.parse(JSON.stringify(reg.registros_original)) : [];
                        reg.trabajado_minutos = reg.trabajado_minutos_original || 0;
                        reg.trabajado_hhmm = reg.trabajado_hhmm_original || '00:00';
                        reg.trabajado_decimal = reg.trabajado_decimal_original || 0;
                        reg.observacion_dia = reg.observacion_dia_original || '';
                        reg.editado_manualmente = false;
                        totalCambios++;
                    }
                }
            });

            // Recalcular contadores del empleado
            let contVac = 0, contInc = 0, contAus = 0, contAsis = 0;
            (emp.registros_procesados || []).forEach(reg => {
                switch (reg.tipo) {
                    case 'vacaciones': contVac++; break;
                    case 'incapacidad': contInc++; break;
                    case 'inasistencia': contAus++; break;
                    case 'asistencia': contAsis++; break;
                }
            });

            emp.dias_vacaciones = contVac;
            emp.vacaciones = contVac > 0;
            emp.dias_incapacidades = contInc;
            emp.incapacidades = contInc > 0;
            emp.dias_ausencias = contAus;
            emp.ausencias = contAus > 0;
            emp.dias_trabajados = contAsis;

            // Recalcular totales de minutos trabajados
            let totalMin = 0;
            (emp.registros_procesados || []).forEach(reg => {
                totalMin += reg.trabajado_minutos || 0;
            });
            emp.trabajado_total_minutos = totalMin;
            const hh = Math.floor(totalMin / 60);
            const mm = totalMin % 60;
            emp.trabajado_total_hhmm = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
            emp.trabajado_total_decimal = Math.round((totalMin / 60) * 100) / 100;
        });

        // Guardar en sessionStorage
        try {
            sessionStorage.setItem('reloj-ocho', JSON.stringify(jsonUnido));
            console.log('Incidencias guardadas. Total cambios:', totalCambios);
        } catch (e) {
            console.error('Error al guardar en sessionStorage:', e);
            Swal.fire({ title: "Error", text: "No se pudieron guardar los datos", icon: "error" });
            return;
        }

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalIncidencias'));
        if (modal) modal.hide();

        // Actualizar interfaz
        $(document).trigger('reloj-data-updated');

        // Mostrar confirmación
        Swal.fire({
            title: "Incidencias guardadas",
            text: totalCambios > 0
                ? `Se actualizaron ${totalCambios} registro${totalCambios > 1 ? 's' : ''}`
                : "No hubo cambios",
            icon: totalCambios > 0 ? "success" : "info",
            timer: 2000,
            showConfirmButton: false
        });
    });

    // Evitar que clicks en checkboxes propaguen al TR padre (expandir/colapsar)
    $(document).on('click', '.check-incapacidad, .check-vacacion', function (e) {
        e.stopPropagation();
    });

});

console.log("incidencias.js cargado correctamente");