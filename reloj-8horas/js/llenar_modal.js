/**
 * Este archivo contiene la logica relacionada con el modal de talles por empleado
 * 
 * Autor: Brandon
 */

$(document).ready(function () {

    /**
     * ==================================================
     * Funciones auxiliares para procesar fechas y horas
     * ==================================================
     */
    function parseDDMMYYYY(s) {
        if (!s) return null;
        const [dd, mm, yyyy] = String(s).split('/').map(x => parseInt(x, 10));
        if (!dd || !mm || !yyyy) return null;
        return new Date(yyyy, mm - 1, dd);
    }

    function diaSemanaES(date) {
        const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
        return dias[date.getDay()];
    }

    function calcularDiferenciaHoras(horaInicio, horaFin) {
        if (!horaInicio || !horaFin) return '00:00';

        const [hI, mI] = horaInicio.split(':').map(x => parseInt(x, 10));
        const [hF, mF] = horaFin.split(':').map(x => parseInt(x, 10));

        let minutosInicio = hI * 60 + mI;
        let minutosFin = hF * 60 + mF;

        // Si la salida es menor que la entrada, asumimos que cruzó medianoche
        if (minutosFin < minutosInicio) {
            minutosFin += 24 * 60;
        }

        const diff = minutosFin - minutosInicio;
        const horas = Math.floor(diff / 60);
        const minutos = diff % 60;

        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }


    /**
     * ================================================================
     * Aqui se llena la información del modal de detalles del empleado
     * ================================================================
     */
    $(document).on('abrir-modal-detalles', function (event, data) {
        const emp = data.empleado;
        const depto = data.departamento;

        // Guardar referencia al empleado actual en el botón de guardar
        $('#btn-guardar-registros').data('empleadoActual', emp);


        /**
         * ==============================================
         * 1. Se llena la información básica del empleado
         * ==============================================
         */
        $('#campo-clave').text(emp.clave || emp.id_empleado || 'N/A');
        $('#campo-nombre').text(emp.nombre || 'Sin nombre');
        $('#campo-departamento').text(depto || 'Sin departamento');
        $('#nombre-empleado-modal').text(emp.nombre || 'Sin nombre');
        $('#campo-dias-trabajados').text(emp.dias_trabajados || '0');
        $('#campo-ausencias').text(emp.ausencias ? emp.dias_ausencias : 'No');
        $('#campo-vacaciones').text(emp.vacaciones ? emp.dias_vacaciones : 'No');
        $('#campo-incapacidades').text(emp.incapacidades ? emp.dias_incapacidades : 'No');

        // Mostrar/ocultar contenedor de horario variable según horario_fijo
        const $contenedorHorarioVariable = $('.contenedor-aplicar-horario-variable');
        const $switchHorarioVariable = $('#aplicarHorarioEmpleado');

        if (emp.horario_fijo === 0) {
            // Si no tiene horario fijo, mostrar el contenedor
            $contenedorHorarioVariable.prop('hidden', false);
            // Establecer el estado del switch según aplicar_horario_variable
            $switchHorarioVariable.prop('checked', emp.aplicar_horario_variable === true);
        } else {
            // Si tiene horario fijo (1), ocultar el contenedor
            $contenedorHorarioVariable.prop('hidden', true);
        }


        /**
         * ============================================
         *  2. Mostrar los registros procesados del empleado
         * ============================================
         */
        const $tbody = $('#table-body-registros-procesados');
        $tbody.empty();

        const registros = emp.registros_procesados || [];

        registros.forEach(r => {
            const d = parseDDMMYYYY(r.fecha);
            const dia = d ? diaSemanaES(d) : '';
            const tipoEvento = r.tipo || 'asistencia'; // Obtener el tipo del registro

            const marcas = Array.isArray(r.registros) ? r.registros : [];

            // Agrupar por pares: entrada-salida (dinámicamente para soportar múltiples pares)
            const pares = [];
            for (let i = 0; i < marcas.length; i += 2) {
                if (marcas[i] && marcas[i + 1]) {
                    pares.push({ entrada: marcas[i].hora, salida: marcas[i + 1].hora });
                }
            }

            // Si no hay pares, mostrar al menos una fila con guiones
            if (pares.length === 0) {
                const $row = $('<tr>');
                $row.attr('data-tipo', tipoEvento); // Guardar tipo en la fila
                $row.attr('data-fecha', r.fecha || '');
                $row.append(`<td>${dia}</td>`);
                $row.append(`<td>${r.fecha || ''}</td>`);
                $row.append(`<td><input type="time" class="form-control form-control-sm hora-entrada" value="" /></td>`);
                $row.append(`<td><input type="time" class="form-control form-control-sm hora-salida" value="" /></td>`);
                $row.append(`<td class="horas-trabajadas-cell">-</td>`);
                $row.append(`<td>
                                <button class="btn btn-sm btn-primary btn-agregar-fila-abajo" title="Insertar fila abajo"><i class="bi bi-caret-down-square"></i></button>
                                <button class="btn btn-sm btn-warning btn-limpiar-horario" title="Limpiar fila"><i class="bi bi-x-circle-fill"></i></button>
                                <button class="btn btn-sm btn-danger btn-borrar-fila-horario" title="Borrar fila"><i class="bi bi-trash-fill"></i></button>
                                <button type="button" class="btn btn-sm btn-outline-primary btn-abrir-eventos" data-bs-toggle="modal" data-bs-target="#eventosModal" title="Asignar eventos">
                                    <i class="bi bi-calendar-check-fill"></i>
                                </button>
                            </td>`);
                $tbody.append($row);
            } else {
                // Crear una fila por cada par entrada-salida
                pares.forEach((par, idx) => {
                    const horasTrabajadas = calcularDiferenciaHoras(par.entrada, par.salida);

                    const $row = $('<tr>');
                    // Solo la primera fila del par guarda el tipo (es la misma fecha)
                    if (idx === 0) {
                        $row.attr('data-tipo', tipoEvento);
                    }
                    $row.attr('data-fecha', r.fecha || '');
                    $row.append(`<td>${dia}</td>`);
                    $row.append(`<td>${r.fecha || ''}</td>`);
                    $row.append(`<td><input type="time" class="form-control form-control-sm hora-entrada" value="${par.entrada}" /></td>`);
                    $row.append(`<td><input type="time" class="form-control form-control-sm hora-salida" value="${par.salida}" /></td>`);
                    $row.append(`<td class="horas-trabajadas-cell">${horasTrabajadas}</td>`);
                    $row.append(`<td>
                                    <button class="btn btn-sm btn-primary btn-agregar-fila-abajo" title="Insertar fila abajo"><i class="bi bi-caret-down-square"></i></button>
                                    <button class="btn btn-sm btn-warning btn-limpiar-horario" title="Limpiar fila"><i class="bi bi-x-circle-fill"></i></button>
                                    <button class="btn btn-sm btn-danger btn-borrar-fila-horario" title="Borrar fila"><i class="bi bi-trash-fill"></i></button>
                                    <button type="button" class="btn btn-sm btn-outline-primary btn-abrir-eventos" data-bs-toggle="modal" data-bs-target="#eventosModal" title="Asignar eventos">
                                        <i class="bi bi-calendar-check-fill"></i>
                                    </button>
                                </td>`);

                    $tbody.append($row);
                });
            }
        });


        /**
        * ============================================
        *  3. Mostrar los registros originales del empleado
        * ============================================
        */
        const $tbodyOriginales = $('#tabla-cuerpo-registros-originales');
        $tbodyOriginales.empty();

        const registrosOriginales = emp.registros || [];

        if (registrosOriginales.length === 0) {
            // Si no hay registros, mostrar mensaje
            const $row = $('<tr>');
            $row.append('<td colspan="3" class="text-center text-muted">No tiene registros en el biométrico</td>');
            $tbodyOriginales.append($row);
        } else {
            registrosOriginales.forEach(reg => {
                const $row = $('<tr>');
                $row.append(`<td>${reg.fecha || '-'}</td>`);
                $row.append(`<td>${reg.entrada || '-'}</td>`);
                $row.append(`<td>${reg.salida || '-'}</td>`);
                $tbodyOriginales.append($row);
            });
        }



        /**
        * =================================
        * 4. Mostrar el horario del empleado
        * =================================
        */
        const $tbodyHorarios = $('#table-body-horarios');
        $tbodyHorarios.empty();

        const horarios = emp.horario || [];

        for (let i = 0; i < 7; i++) {
            const h = horarios[i] || {};
            const $row = $('<tr>');

            let dias = ['SABADO', 'DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

            let tmp_select_dia = `<select class="form-select form-select-sm" name="horario_dia[]"> <option value="">Dia</option>`;

            dias.forEach(dia => {
                tmp_select_dia += `<option value="${dia}" ${(h.dia === dia) ? 'selected' : ''}>${dia}</option>`;
            });

            tmp_select_dia += `</select>`;

            //$row.append(`<td><input type="text" class="form-control" name="horario_dia[]" value="${h.dia || ''}" placeholder="Día"></td>`);

            $row.append(`<td>${tmp_select_dia}</td>`);
            $row.append(`<td><input type="time" class="form-control" name="horario_entrada[]" value="${h.entrada || ''}"></td>`);
            $row.append(`<td><input type="time" class="form-control" name="horario_salida_comida[]" value="${h.salida_comida || ''}"></td>`);
            $row.append(`<td><input type="time" class="form-control" name="horario_entrada_comida[]" value="${h.entrada_comida || ''}"></td>`);
            $row.append(`<td><input type="time" class="form-control" name="horario_salida[]" value="${h.salida || ''}"></td>`);
            $tbodyHorarios.append($row);
        }


        /**
        * ======================================
        * 5. Mostrar tabla de registros procesados
        * ======================================
        */
        $('#tabla-registros-procesados').show();
        $('#tabla-registros-originales').hide();
        $('#btn-guardar-registros').show();

        mostrarRegistrosProcesados();
    });


    /**
     * ======================================================================
     * Eventos para los botones, el primero muestra los registros procesados
     * en el segundo se muestran los registros originales (no editables)
     * ======================================================================
     */
    $(document).on('click', '#btn-registros-procesados', function () {
        mostrarRegistrosProcesados();
    });

    $(document).on('click', '#btn-registros-originales', function () {
        $('#tabla-registros-procesados').hide();
        $('#tabla-registros-originales').show();
        $('#btn-guardar-registros').hide();
        $(this).removeClass('btn-outline-secondary').addClass('btn-secondary');
        $('#btn-registros-procesados').removeClass('btn-primary').addClass('btn-outline-primary');
    });


    function mostrarRegistrosProcesados() {
        $('#tabla-registros-procesados').show();
        $('#tabla-registros-originales').hide();
        $('#btn-guardar-registros').show();
        $(this).removeClass('btn-outline-primary').addClass('btn-primary');
        $('#btn-registros-originales').removeClass('btn-secondary').addClass('btn-outline-secondary');
    }


    /**
     * ========================================================================
     * Evento para calcular horas trabajadas al cambiar horas de entrada/salida
     * ========================================================================
     */
    $(document).on('change', '.hora-entrada, .hora-salida', function () {
        const $row = $(this).closest('tr');
        const entrada = $row.find('.hora-entrada').val();
        const salida = $row.find('.hora-salida').val();

        if (entrada && salida) {
            const horasTrabajadas = calcularDiferenciaHoras(entrada, salida);
            $row.find('.horas-trabajadas-cell').text(horasTrabajadas);
        } else {
            $row.find('.horas-trabajadas-cell').text('-');
        }
    });

    // Event listener para limpiar fila (sin eliminarla)
    $(document).on('click', '.btn-limpiar-horario', function (e) {
        e.preventDefault();
        const $row = $(this).closest('tr');

        // Limpiar los inputs de entrada y salida
        $row.find('.hora-entrada').val('');
        $row.find('.hora-salida').val('');

        // Actualizar la celda de horas trabajadas
        $row.find('.horas-trabajadas-cell').text('-');
    });

    // Event listener para borrar fila de horario (Borrar completamente)
    $(document).on('click', '.btn-borrar-fila-horario', function (e) {
        e.preventDefault();

        const $row = $(this).closest('tr');
        const fecha = $row.find('td').eq(1).text().trim();

        // Contar cuántas filas tienen la misma fecha
        const $tbody = $('#table-body-registros-procesados');
        const filasConMismaFecha = $tbody.find('tr').filter(function () {
            return $(this).find('td').eq(1).text().trim() === fecha;
        });

        // Si hay más de una fila con esa fecha, se puede eliminar
        if (filasConMismaFecha.length > 1) {
            $row.remove();
        } else {
            // Si solo hay una fila, mostrar mensaje informativo
            Swal.fire({
                title: "Advertencia",
                text: "Debe quedar al menos un registro por fecha",
                icon: "warning",
                timer: 2000,
                showConfirmButton: false
            });
        }
    });

    // Event listener para agregar nueva fila vacía debajo
    $(document).on('click', '.btn-agregar-fila-abajo', function (e) {
        e.preventDefault();
        const $currentRow = $(this).closest('tr');

        // Obtener el día y fecha de la fila actual para mantener contexto
        const dia = $currentRow.find('td').eq(0).text();
        const fecha = $currentRow.find('td').eq(1).text();

        // Crear nueva fila vacía con la misma estructura
        const $newRow = $('<tr>');
        $newRow.append(`<td>${dia}</td>`);
        $newRow.append(`<td>${fecha}</td>`);
        $newRow.append(`<td><input type="time" class="form-control form-control-sm hora-entrada" value="" /></td>`);
        $newRow.append(`<td><input type="time" class="form-control form-control-sm hora-salida" value="" /></td>`);
        $newRow.append(`<td class="horas-trabajadas-cell">-</td>`);
        $newRow.append(`<td>
                            <button class="btn btn-sm btn-primary btn-agregar-fila-abajo" title="Insertar fila abajo"><i class="bi bi-caret-down-square"></i></button>
                            <button class="btn btn-sm btn-warning btn-limpiar-horario" title="Limpiar fila"><i class="bi bi-x-circle-fill"></i></button>
                            <button class="btn btn-sm btn-danger btn-borrar-fila-horario" title="Borrar fila"><i class="bi bi-trash-fill"></i></button>
                            <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#eventosModal" title="Asignar eventos">
                                <i class="bi bi-calendar-check-fill"></i>
                            </button>
                        </td>`);

        // Insertar la nueva fila justo después de la fila actual
        $currentRow.after($newRow);
    });

    // BORRAR ESTO MÁS TARDE
    $(document).on('input', 'input[name="horario_dia[]"]', function () {
        const $input = $(this);
        const cursorPos = $input[0].selectionStart;
        const valorOriginal = $input.val();
        const valorMayusculas = valorOriginal.toUpperCase();

        if (valorOriginal !== valorMayusculas) {
            $input.val(valorMayusculas);
            $input[0].setSelectionRange(cursorPos, cursorPos);
        }
    });

    // =============================================================
    // Event listener para guardar los horarios de forma individual
    // =============================================================
    $(document).on('click', '#btn-guardar-horarios', async function () {
        const empleadoActual = $('#btn-guardar-registros').data('empleadoActual');

        if (!empleadoActual) {
            Swal.fire({
                title: "Error",
                text: "No se pudo identificar el empleado actual",
                icon: "error"
            });
            return;
        }

        // Leer los horarios del formulario
        const horariosNuevos = [];
        $('#table-body-horarios tr').each(function () {
            const $fila = $(this);
            const dia = $fila.find('select[name="horario_dia[]"]').val().trim().toUpperCase();
            const entrada = $fila.find('input[name="horario_entrada[]"]').val();
            const salidaComida = $fila.find('input[name="horario_salida_comida[]"]').val();
            const entradaComida = $fila.find('input[name="horario_entrada_comida[]"]').val();
            const salida = $fila.find('input[name="horario_salida[]"]').val();

            // Solo agregar si tiene al menos el día
            if (dia) {
                horariosNuevos.push({
                    dia: dia,
                    entrada: entrada || '',
                    salida_comida: salidaComida || '',
                    entrada_comida: entradaComida || '',
                    salida: salida || ''
                });
            }
        });

        // Obtener el JSON unido del sessionStorage
        let jsonUnido;
        try {
            const stored = sessionStorage.getItem('reloj-ocho');
            if (!stored) {
                Swal.fire({
                    title: "Error",
                    text: "No se encontraron datos en sessionStorage",
                    icon: "error"
                });
                return;
            }
            jsonUnido = JSON.parse(stored);
        } catch (e) {
            console.error('Error al parsear sessionStorage:', e);
            return;
        }

        // Buscar el empleado en el JSON
        let empleadoEncontrado = null;
        let departamentoEncontrado = null;

        for (const depto of jsonUnido.departamentos || []) {
            for (const emp of depto.empleados || []) {
                if (emp.id_empleado === empleadoActual.id_empleado ||
                    emp.clave === empleadoActual.clave ||
                    (emp.nombre && empleadoActual.nombre && emp.nombre.trim() === empleadoActual.nombre.trim())) {
                    empleadoEncontrado = emp;
                    departamentoEncontrado = depto;
                    break;
                }
            }
            if (empleadoEncontrado) break;
        }

        if (!empleadoEncontrado) {
            Swal.fire({
                title: "Error",
                text: "No se encontró el empleado en el storage",
                icon: "error"
            });
            return;
        }

        // Actualizar el horario del empleado
        empleadoEncontrado.horario = horariosNuevos;

        // Re-procesar los registros del empleado
        if (horariosNuevos.length > 0) {
            await reprocesarRegistrosEmpleadoIndividual(empleadoEncontrado, jsonUnido, departamentoEncontrado.nombre);
        }

        // Guardar en sessionStorage
        try {
            sessionStorage.setItem('reloj-ocho', JSON.stringify(jsonUnido));
        } catch (e) {
            console.error('Error al guardar en sessionStorage:', e);
            Swal.fire({
                title: "Error",
                text: "Error al guardar los cambios",
                icon: "error"
            });
            return;
        }

        // Actualizar la referencia local
        empleadoActual.horario = horariosNuevos;
        empleadoActual.registros_procesados = empleadoEncontrado.registros_procesados;

        Swal.fire({
            title: "Horarios guardados",
            text: "Los horarios del empleado han sido actualizados",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });

        // Cerrar el modal
        $('#modal-detalles').fadeOut(300);

        // Disparar evento para actualizar la interfaz (preservando paginación)
        $(document).trigger('reloj-data-updated', [{ preservePage: true }]);
    });

    // copiar horario a todos los días para los horarios de forma individual
    $(document).on('click', '#btn-copiar-horario-detalles', function (e) {
        e.preventDefault();

        // Recuperar los valores de los inputs
        const entrada = document.getElementById('input_detalles_copiar_entrada').value;
        const salidaComida = document.getElementById('input_detalles_copiar_salida_comida').value;
        const entradaComida = document.getElementById('input_detalles_copiar_entrada_comida').value;
        const salida = document.getElementById('input_detalles_copiar_salida').value;
        // Recupera el cuerpo de la tabla de horarios individuales
        const tbody = document.getElementById('table-body-horarios');
        // Verifica que el tbody exista
        if (!tbody) return;
        // Recupera todas las filas del tbody
        const filas = tbody.querySelectorAll('tr');
        // Recorrer las filas y asignar los valores copiados
        for (let i = 0; i < 7 && i < filas.length; i++) {
            // recupera todos los inputs de tipo tiempo en la fila actual
            const inputs = filas[i].querySelectorAll('input[type="time"]');
            // Debe haber exactamente 4 inputs para proceder
            if (inputs.length === 4) {
                // Asigna los valores copiados a los inputs correspondientes
                inputs[0].value = entrada;
                inputs[1].value = salidaComida;
                inputs[2].value = entradaComida;
                inputs[3].value = salida;
            }
        }

    });

    /**
     * Re-procesa los registros de un empleado individual
     */
    async function reprocesarRegistrosEmpleadoIndividual(empleado, jsonUnido, nombreDepto) {
        // Obtener días de la semana
        const diasSemana = obtenerDiasSemanaLocal(jsonUnido.fecha_inicio, jsonUnido.fecha_cierre);

        // Obtener festividades
        let festivosSet = new Set();
        if (typeof obtenerFestividadesSet === 'function') {
            try {
                festivosSet = await obtenerFestividadesSet();
            } catch (e) {
                console.warn('No se pudieron obtener festividades:', e);
            }
        }

        // Constantes de departamentos especiales
        const DEPA_CDMX = "Sucursal CdMx administrativos";
        const DEPA_COMPRA = "Compra de limon";
        const DEPA_VIGILANCIA = "Seguridad Vigilancia e Intendencia";

        const nombreDeptoLimpio = (nombreDepto || '').replace(/^\d+\s*/, '').trim();
        const esDeptoEspecial = nombreDeptoLimpio === DEPA_CDMX || nombreDeptoLimpio === DEPA_COMPRA;
        const esVigilancia = nombreDeptoLimpio === DEPA_VIGILANCIA;

        // Guardar registros editados manualmente
        const registrosEditadosMap = {};
        if (empleado.registros_procesados && Array.isArray(empleado.registros_procesados)) {
            empleado.registros_procesados.forEach(reg => {
                if (reg.editado_manualmente) {
                    registrosEditadosMap[reg.fecha] = reg;
                }
            });
        }

        // Re-procesar
        empleado.registros_procesados = procesarRegistrosEmpleadoLocal(
            empleado,
            diasSemana,
            esDeptoEspecial,
            esVigilancia,
            festivosSet
        );

        // Restaurar registros editados manualmente
        empleado.registros_procesados = empleado.registros_procesados.map(reg => {
            if (registrosEditadosMap[reg.fecha]) {
                return registrosEditadosMap[reg.fecha];
            }
            return reg;
        });

        // Recalcular totales
        const totalMin = (empleado.registros_procesados || []).reduce((acc, dia) => {
            const m = (dia && typeof dia.trabajado_minutos === 'number') ? dia.trabajado_minutos : 0;
            return acc + m;
        }, 0);

        empleado.trabajado_total_minutos = totalMin;
        empleado.trabajado_total_hhmm = minutosAHoraLocal(totalMin);
        empleado.trabajado_total_decimal = Math.round((totalMin / 60) * 100) / 100;
    }

    /**
     * Genera arreglo de días de la semana
     */
    function obtenerDiasSemanaLocal(fechaInicio, fechaFin) {
        const meses = {
            'ENE': 0, 'FEB': 1, 'MAR': 2, 'ABR': 3,
            'MAY': 4, 'JUN': 5, 'JUL': 6, 'AGO': 7,
            'SEP': 8, 'OCT': 9, 'NOV': 10, 'DIC': 11
        };

        function parseFecha(f) {
            const [dia, mes, anio] = f.split('/');
            return new Date(parseInt(anio), meses[mes.toUpperCase()], parseInt(dia));
        }

        const inicio = parseFecha(fechaInicio);
        const fin = parseFecha(fechaFin);
        const dias = [];

        for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
            dias.push({
                fecha: d.toLocaleDateString('es-MX').split('/').map(x => x.padStart(2, '0')).join('/'),
                esSabado: d.getDay() === 6,
                esDomingo: d.getDay() === 0
            });
        }

        return dias;
    }

    function minutosAHoraLocal(totalMin) {
        const hh = Math.floor(totalMin / 60);
        const mm = totalMin % 60;
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }

    /**
     * Procesa los registros de un empleado (versión local)
     */
    function procesarRegistrosEmpleadoLocal(empleado, diasSemana, esDeptoEspecial, esVigilancia, festivosSet = new Set()) {
        const registrosMap = {};
        (empleado.registros || []).forEach(r => {
            if (!registrosMap[r.fecha]) {
                registrosMap[r.fecha] = [];
            }
            registrosMap[r.fecha].push(r);
        });

        Object.keys(registrosMap).forEach(fecha => {
            registrosMap[fecha].sort((a, b) => (a.entrada || '').localeCompare(b.entrada || ''));
        });

        const horario = empleado.horario || [];

        if (!Array.isArray(horario) || horario.length === 0) {
            return diasSemana.map(dia => ({
                fecha: dia.fecha,
                tipo: "sin_horario",
                registros: [],
                trabajado_minutos: 0,
                trabajado_hhmm: '00:00',
                trabajado_decimal: 0,
                observacion_dia: "SIN HORARIO DEFINIDO",
                tipo_turno: "N/A",
                max_horas: 0
            }));
        }

        // Funciones auxiliares
        const obtenerTurnoPorDia = (fecha) => {
            const diasSemanaES = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
            const [dia, mes, anio] = fecha.split('/');
            const fechaObj = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
            const nombreDia = diasSemanaES[fechaObj.getDay()];

            const turnoDelDia = horario.find(h => h.dia.toUpperCase() === nombreDia);
            if (turnoDelDia) {
                // Verificar si tiene un evento especial (descanso o día festivo)
                if (turnoDelDia.evento === 'descanso') {
                    return {
                        hora_inicio: null,
                        hora_fin: null,
                        salida_comida: null,
                        entrada_comida: null,
                        tiene_comida: false,
                        evento: 'descanso'
                    };
                }
                if (turnoDelDia.evento === 'dia_festivo') {
                    return {
                        hora_inicio: null,
                        hora_fin: null,
                        salida_comida: null,
                        entrada_comida: null,
                        tiene_comida: false,
                        evento: 'dia_festivo'
                    };
                }

                const entrada = turnoDelDia.entrada && turnoDelDia.entrada.trim() !== '' ? turnoDelDia.entrada : null;
                const salida = turnoDelDia.salida && turnoDelDia.salida.trim() !== '' ? turnoDelDia.salida : null;

                // Si no tiene entrada/salida, es día de descanso
                if (!entrada || !salida) {
                    return { hora_inicio: null, hora_fin: null, salida_comida: null, entrada_comida: null, tiene_comida: false, evento: '' };
                }

                // Verificar si tiene comida definida
                const salidaComida = turnoDelDia.salida_comida && turnoDelDia.salida_comida.trim() !== '' ? turnoDelDia.salida_comida : null;
                const entradaComida = turnoDelDia.entrada_comida && turnoDelDia.entrada_comida.trim() !== '' ? turnoDelDia.entrada_comida : null;
                const tieneComida = salidaComida !== null && entradaComida !== null;

                return {
                    hora_inicio: entrada,
                    hora_fin: salida,
                    salida_comida: salidaComida,
                    entrada_comida: entradaComida,
                    tiene_comida: tieneComida,
                    evento: ''
                };
            }
            return { hora_inicio: null, hora_fin: null, salida_comida: null, entrada_comida: null, tiene_comida: false, evento: '' };
        };

        function normalizarHoraLocal(hora) {
            if (!hora) return '';
            const partes = String(hora).split(':');
            if (partes.length < 2) return '';
            return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
        }

        function horaAMinutosLocal(horaHHMM) {
            const h = normalizarHoraLocal(horaHHMM);
            if (!h) return 0;
            const [hh, mm] = h.split(':').map(Number);
            return (hh * 60) + mm;
        }

        function minutosAHoraFn(mins) {
            let total = mins % (24 * 60);
            if (total < 0) total += (24 * 60);
            const h = Math.floor(total / 60);
            const m = total % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }

        function hashString(str) {
            let h = 2166136261;
            for (let i = 0; i < str.length; i++) {
                h ^= str.charCodeAt(i);
                h = Math.imul(h, 16777619);
            }
            return h >>> 0;
        }

        function jitterHora(baseHoraHHMM, minOffset, maxOffset, seedKey) {
            const base = horaAMinutosLocal(baseHoraHHMM);
            const seed = hashString(seedKey);
            const rango = (maxOffset - minOffset + 1);
            const offset = minOffset + (seed % rango);
            return minutosAHoraFn(base + offset);
        }

        // ============================================================
        // CLASIFICADOR DE INCIDENCIAS DE MARCAJES (versión local)
        // ============================================================
        function clasificarIncidenciaMarcajes(todasLasMarcas, turno, tieneComida) {
            const numMarcas = todasLasMarcas.length;
            const inicio = normalizarHoraLocal(turno.hora_inicio);
            const fin = normalizarHoraLocal(turno.hora_fin);
            const minInicio = horaAMinutosLocal(inicio);
            const minFin = horaAMinutosLocal(fin);

            let comidaSalida = null, comidaEntrada = null;
            let minComidaSalida = null, minComidaEntrada = null;

            if (tieneComida) {
                comidaSalida = normalizarHoraLocal(turno.salida_comida);
                comidaEntrada = normalizarHoraLocal(turno.entrada_comida);
                minComidaSalida = horaAMinutosLocal(comidaSalida);
                minComidaEntrada = horaAMinutosLocal(comidaEntrada);
            }

            const resultado = {
                caso: '',
                descripcion: '',
                marcasClasificadas: { entrada: null, salidaComida: null, entradaComida: null, salida: null },
                observaciones: [],
                requiereAtencion: false
            };

            if (numMarcas === 0) {
                resultado.caso = 'E-19';
                resultado.descripcion = 'Sin marcas';
                resultado.observaciones.push('OLVIDO TOTAL');
                resultado.requiereAtencion = true;
                return resultado;
            }

            if (numMarcas === 1) {
                const marca = todasLasMarcas[0];
                if (marca.minutos <= minInicio + 90) {
                    resultado.caso = 'D-15';
                    resultado.marcasClasificadas.entrada = marca;
                    resultado.observaciones.push('FALTA SALIDA');
                } else if (marca.minutos >= minFin - 90) {
                    resultado.caso = 'D-18';
                    resultado.marcasClasificadas.salida = marca;
                    resultado.observaciones.push('FALTA ENTRADA');
                } else {
                    resultado.caso = 'D-XX';
                    resultado.observaciones.push('MARCA AMBIGUA');
                }
                resultado.requiereAtencion = true;
                return resultado;
            }

            if (numMarcas === 2 && !tieneComida) {
                resultado.caso = 'A-IDEAL';
                resultado.marcasClasificadas.entrada = todasLasMarcas[0];
                resultado.marcasClasificadas.salida = todasLasMarcas[1];
                return resultado;
            }

            if (numMarcas === 2 && tieneComida) {
                resultado.caso = 'C-10';
                resultado.descripcion = 'Sin comidas marcadas';
                resultado.marcasClasificadas.entrada = todasLasMarcas[0];
                resultado.marcasClasificadas.salida = todasLasMarcas[1];
                resultado.observaciones.push('NO MARCÓ COMIDAS');
                resultado.requiereAtencion = true;
                return resultado;
            }

            if (numMarcas === 3 && tieneComida) {
                resultado.caso = 'B-XX';
                resultado.descripcion = 'Falta 1 marca';
                resultado.observaciones.push('MARCAJE INCOMPLETO');
                resultado.requiereAtencion = true;
                return resultado;
            }

            if (numMarcas === 4 && tieneComida) {
                resultado.caso = 'A-1';
                resultado.descripcion = 'Marcaje completo';
                resultado.marcasClasificadas.entrada = todasLasMarcas[0];
                resultado.marcasClasificadas.salidaComida = todasLasMarcas[1];
                resultado.marcasClasificadas.entradaComida = todasLasMarcas[2];
                resultado.marcasClasificadas.salida = todasLasMarcas[3];
                return resultado;
            }

            if (numMarcas >= 5) {
                resultado.caso = 'F-20';
                resultado.descripcion = `${numMarcas} marcas extras`;
                resultado.observaciones.push('MARCAS DUPLICADAS');
                resultado.requiereAtencion = true;
                return resultado;
            }

            return resultado;
        }

        // ============================================================
        // VALIDADOR DE HORARIOS ANÓMALOS (versión local)
        // ============================================================
        function validarHorariosAnomalos(marcasClasificadas, turno, tieneComida) {
            const anomalias = [];
            const entrada = marcasClasificadas.entrada;
            const salida = marcasClasificadas.salida;
            const salidaComida = marcasClasificadas.salidaComida;
            const entradaComida = marcasClasificadas.entradaComida;

            if (entrada && salida) {
                const duracionReal = salida.minutos - entrada.minutos;
                let tiempoComida = 0;
                if (tieneComida && salidaComida && entradaComida) {
                    tiempoComida = entradaComida.minutos - salidaComida.minutos;
                }
                const trabajoNeto = duracionReal - tiempoComida;

                if (trabajoNeto < 240 && trabajoNeto > 0) {
                    anomalias.push({ tipo: 'G-23', descripcion: 'JORNADA CORTA' });
                }
                if (duracionReal > 720) {
                    anomalias.push({ tipo: 'G-24', descripcion: 'JORNADA MUY LARGA' });
                }
            }

            if (tieneComida && salidaComida && entradaComida) {
                const duracionComida = entradaComida.minutos - salidaComida.minutos;
                if (duracionComida < 10) {
                    anomalias.push({ tipo: 'G-25', descripcion: 'COMIDA MUY CORTA' });
                }
            }

            return anomalias;
        }

        function construirRegistrosDia(turno, fecha, observacion) {
            const inicio = normalizarHoraLocal(turno.hora_inicio);
            const fin = normalizarHoraLocal(turno.hora_fin);

            // Verificar si el turno tiene comida
            const tieneComida = turno.tiene_comida === true;

            // ============================================================
            // REGLAS DE GENERACIÓN DE HORAS (ACTUALIZADAS):
            // ENTRADA: Entre -13 y 0 minutos antes de la hora oficial (rango 7:47-8:00 para horario 8:00)
            // SALIDA FINAL: SIEMPRE entre 0 y +7 minutos después de la hora oficial
            // SALIDA COMIDA: Entre -5 y 0 minutos antes de la hora oficial
            // ENTRADA COMIDA: Calcular para asegurar mínimo 57 min de comida
            // ============================================================

            const REGLAS = {
                entrada: { min: -13, max: 0 },
                salida: { min: 0, max: 7 },
                salida_comida: { min: -5, max: 0 },
                entrada_comida: { min: -3, max: 0 },
                MINUTOS_MENOS_COMIDA: 3
            };

            const seedBase = `${empleado.id_empleado || empleado.clave}|${fecha}`;

            // Entrada al trabajo: -13 a 0 minutos
            const e1 = jitterHora(inicio, REGLAS.entrada.min, REGLAS.entrada.max, `${seedBase}|E1`);

            // Salida final: SIEMPRE 0 a +7 minutos
            const s2 = jitterHora(fin, REGLAS.salida.min, REGLAS.salida.max, `${seedBase}|S2`);

            // Si NO tiene comida, solo devolver entrada y salida
            if (!tieneComida) {
                return [
                    { tipo: 'entrada', hora: e1, observacion },
                    { tipo: 'salida', hora: s2, observacion }
                ];
            }

            // Calcular horarios de comida (duración = oficial - 3 minutos = mínimo 57 min)
            const comidaSalidaBase = normalizarHoraLocal(turno.salida_comida);
            const comidaEntradaBase = normalizarHoraLocal(turno.entrada_comida);

            const minComidaSalida = horaAMinutosLocal(comidaSalidaBase);
            const minComidaEntrada = horaAMinutosLocal(comidaEntradaBase);
            const duracionComidaOficial = minComidaEntrada - minComidaSalida;
            const duracionComidaMinima = duracionComidaOficial - REGLAS.MINUTOS_MENOS_COMIDA; // 57 min para 1hr, 117 min para 2hrs

            // Salida a comida: -5 a 0 minutos
            const s1 = jitterHora(comidaSalidaBase, REGLAS.salida_comida.min, REGLAS.salida_comida.max, `${seedBase}|S1`);

            // Entrada de comida: Calcular para que dure mínimo 57 min
            const minSalidaComidaReal = horaAMinutosLocal(s1);
            const minEntradaComidaMinima = minSalidaComidaReal + duracionComidaMinima;
            const minEntradaComidaOficialMenos3 = minComidaEntrada + REGLAS.entrada_comida.min;
            const minEntradaComidaFinal = Math.max(minEntradaComidaMinima, minEntradaComidaOficialMenos3);
            const variacionEntradaComida = hashString(`${seedBase}|E2_VAR`) % 4; // 0 a 3 min
            const e2 = minutosAHoraFn(minEntradaComidaFinal + variacionEntradaComida);

            return [
                { tipo: 'entrada', hora: e1, observacion },
                { tipo: 'salida', hora: s1, observacion },
                { tipo: 'entrada', hora: e2, observacion },
                { tipo: 'salida', hora: s2, observacion }
            ];
        }

        function calcularTrabajoDesdeRegistros(registros, maxHorasTurno = 8) {
            let minutosTrabajados = 0;
            const maxMinutos = maxHorasTurno * 60;

            for (let i = 0; i < registros.length; i++) {
                if (registros[i].tipo === 'entrada' && i + 1 < registros.length && registros[i + 1].tipo === 'salida') {
                    const e = horaAMinutosLocal(registros[i].hora);
                    const s = horaAMinutosLocal(registros[i + 1].hora);
                    if (s >= e) {
                        minutosTrabajados += (s - e);
                    } else {
                        minutosTrabajados += ((24 * 60) - e + s);
                    }
                    i++;
                }
            }

            // Limitar al máximo de horas del turno
            if (minutosTrabajados > maxMinutos) {
                minutosTrabajados = maxMinutos;
            }

            return {
                minutos: minutosTrabajados,
                hhmm: minutosAHoraFn(minutosTrabajados),
                decimal: Math.round((minutosTrabajados / 60) * 100) / 100
            };
        }

        // Función para ajustar registros si exceden máximo de horas del turno
        // IMPORTANTE: La salida NUNCA puede ser antes de la hora oficial del turno
        function ajustarRegistrosSiExcedenMaximo(registros, maxHorasTurno, seedKey) {
            if (!registros || registros.length === 0) return registros;

            const TOLERANCIA_MINUTOS = 15;
            const maxMinutosPermitidos = (maxHorasTurno * 60) + TOLERANCIA_MINUTOS;

            let minutosTrabajados = 0;
            const pares = [];

            for (let i = 0; i < registros.length; i++) {
                if (registros[i].tipo === 'entrada' && i + 1 < registros.length && registros[i + 1].tipo === 'salida') {
                    const e = horaAMinutosLocal(registros[i].hora);
                    const s = horaAMinutosLocal(registros[i + 1].hora);
                    let duracion = s >= e ? (s - e) : ((24 * 60) - e + s);
                    minutosTrabajados += duracion;
                    pares.push({ idxSalida: i + 1, minSalida: s });
                    i++;
                }
            }

            if (minutosTrabajados <= maxMinutosPermitidos || pares.length === 0) {
                return registros;
            }

            // El tiempo excede el máximo - solo agregar nota, NO mover la salida antes de la hora oficial
            const ultimoPar = pares[pares.length - 1];
            registros[ultimoPar.idxSalida].observacion = registros[ultimoPar.idxSalida].observacion + ' [TIEMPO EXCEDE MÁXIMO]';

            return registros;
        }

        const resultados = [];
        const diasTrabajadosRestantes = empleado.dias_trabajados || 0;
        let diasProcesados = 0;

        // ============================================================
        // CONTADORES PARA EVENTOS (vacaciones, incapacidades, ausencias)
        // Se usan para asignar días cuando ya se completaron dias_trabajados
        // ============================================================
        const diasVacacionesRestantes = empleado.dias_vacaciones || 0;
        const diasIncapacidadesRestantes = empleado.dias_incapacidades || 0;
        const diasAusenciasRestantes = empleado.dias_ausencias || 0;
        let vacacionesProcesadas = 0;
        let incapacidadesProcesadas = 0;
        let ausenciasProcesadas = 0;

        diasSemana.forEach(dia => {
            // Domingos siempre descanso
            if (dia.esDomingo) {
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "descanso",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "DOMINGO (DESCANSO)",
                    tipo_turno: "N/A",
                    max_horas: 0
                });
                return;
            }

            // DÍAS FESTIVOS → marcar como dia_festivo
            if (festivosSet.has(dia.fecha)) {
                // Para VIGILANCIA: verificar si tienen registros biométricos en este día
                if (esVigilancia) {
                    const registrosDelDiaFestivo = registrosMap[dia.fecha] || [];
                    const tieneRegistrosEnFestivo = registrosDelDiaFestivo.length > 0 &&
                        registrosDelDiaFestivo.some(r => r.entrada || r.salida);

                    if (tieneRegistrosEnFestivo) {
                        // Vigilancia CON registros → procesar como día normal (no retornar)
                        console.log(`[VIGILANCIA] ${empleado.nombre} trabajó el día festivo ${dia.fecha}`);
                    } else {
                        // Vigilancia SIN registros → se les dio el día festivo
                        resultados.push({
                            fecha: dia.fecha,
                            tipo: "dia_festivo",
                            registros: [],
                            trabajado_minutos: 0,
                            trabajado_hhmm: '00:00',
                            trabajado_decimal: 0,
                            observacion_dia: "DÍA FESTIVO",
                            tipo_turno: "N/A",
                            max_horas: 0
                        });
                        return;
                    }
                } else {
                    // Para otros departamentos: siempre es día festivo
                    resultados.push({
                        fecha: dia.fecha,
                        tipo: "dia_festivo",
                        registros: [],
                        trabajado_minutos: 0,
                        trabajado_hhmm: '00:00',
                        trabajado_decimal: 0,
                        observacion_dia: "DÍA FESTIVO",
                        tipo_turno: "N/A",
                        max_horas: 0
                    });
                    return;
                }
            }

            const turno = obtenerTurnoPorDia(dia.fecha);
            const esLaborable = turno.hora_inicio && turno.hora_fin;

            const tipoTurno = esLaborable ? `DIURNA(${turno.hora_inicio}-${turno.hora_fin})` : 'N/A';
            const maxHoras = esLaborable ? 8 : 0;

            const registrosDelDia = registrosMap[dia.fecha] || [];
            const tieneRegistroBiometrico = registrosDelDia.length > 0 &&
                registrosDelDia.some(r => r.entrada || r.salida);

            // Verificar si el turno tiene un EVENTO especial (desde horarios variables)
            if (turno.evento === 'descanso') {
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "descanso",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "DESCANSO (HORARIO VARIABLE)",
                    tipo_turno: "N/A",
                    max_horas: 0
                });
                return;
            }

            if (turno.evento === 'dia_festivo') {
                if (!tieneRegistroBiometrico) {
                    resultados.push({
                        fecha: dia.fecha,
                        tipo: "dia_festivo",
                        registros: [],
                        trabajado_minutos: 0,
                        trabajado_hhmm: '00:00',
                        trabajado_decimal: 0,
                        observacion_dia: "DÍA FESTIVO (HORARIO VARIABLE)",
                        tipo_turno: "N/A",
                        max_horas: 0
                    });
                    return;
                }
                // Si tiene registros, continuar procesando normalmente
            }

            // Días NO laborables según horario → no_laboro (no es descanso ni ausencia)
            // Solo el DOMINGO es "descanso" oficial
            if (!esLaborable) {
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "no_laboro",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "NO LABORA ESTE DÍA",
                    tipo_turno: "N/A",
                    max_horas: 0
                });
                return;
            }

            // Departamentos especiales auto-generan
            if (esDeptoEspecial && diasProcesados < diasTrabajadosRestantes) {
                diasProcesados++;
                const registrosDia = construirRegistrosDia(turno, dia.fecha, 'REGISTRO AUTOMÁTICO');
                // Ajustar si excede máximo de horas
                const seedKey = `${empleado.id_empleado || empleado.clave}|${dia.fecha}`;
                ajustarRegistrosSiExcedenMaximo(registrosDia, maxHoras, seedKey);
                const trabajo = calcularTrabajoDesdeRegistros(registrosDia, maxHoras);
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "asistencia",
                    registros: registrosDia,
                    trabajado_minutos: trabajo.minutos,
                    trabajado_hhmm: trabajo.hhmm,
                    trabajado_decimal: trabajo.decimal,
                    observacion_dia: "REGISTRO AUTOMÁTICO",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }

            // Si tiene registro biométrico
            if (tieneRegistroBiometrico && diasProcesados < diasTrabajadosRestantes) {
                diasProcesados++;
                const base = construirRegistrosDia(turno, dia.fecha, 'RELLENO');
                // Ajustar si excede máximo de horas
                const seedKey = `${empleado.id_empleado || empleado.clave}|${dia.fecha}`;
                ajustarRegistrosSiExcedenMaximo(base, maxHoras, seedKey);
                const trabajo = calcularTrabajoDesdeRegistros(base, maxHoras);
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "asistencia",
                    registros: base,
                    trabajado_minutos: trabajo.minutos,
                    trabajado_hhmm: trabajo.hhmm,
                    trabajado_decimal: trabajo.decimal,
                    observacion_dia: "OK/PARCIAL",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }

            // Sin registro biométrico del día
            // NUEVA LÓGICA: Si dias_ausencias === 0, RRHH indicó que no tuvo ausencias
            // → Auto-generar registros en lugar de marcar inasistencia
            if (!tieneRegistroBiometrico) {
                const diasAusenciasRestantes = empleado.dias_ausencias || 0;
                
                if (diasAusenciasRestantes === 0 && diasProcesados < diasTrabajadosRestantes) {
                    // RRHH indicó 0 ausencias → auto-generar registro
                    diasProcesados++;
                    const registrosDia = construirRegistrosDia(turno, dia.fecha, 'REGISTRO GENERADO');
                    const trabajo = calcularTrabajoDesdeRegistros(registrosDia, maxHoras);
                    resultados.push({
                        fecha: dia.fecha,
                        tipo: "asistencia",
                        registros: registrosDia,
                        trabajado_minutos: trabajo.minutos,
                        trabajado_hhmm: trabajo.hhmm,
                        trabajado_decimal: trabajo.decimal,
                        observacion_dia: "SIN CHECADA (0 AUSENCIAS RRHH)",
                        tipo_turno: tipoTurno,
                        max_horas: maxHoras
                    });
                    return;
                }
                
                // Si tiene ausencias pendientes o ya completó dias_trabajados → inasistencia
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "inasistencia",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "SIN REGISTRO BIOMÉTRICO",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }

            // Días restantes → Asignar vacaciones, incapacidades, ausencias o descanso
            // Prioridad: vacaciones > incapacidades > ausencias > descanso
            if (vacacionesProcesadas < diasVacacionesRestantes) {
                vacacionesProcesadas++;
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "vacaciones",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "VACACIONES",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }

            if (incapacidadesProcesadas < diasIncapacidadesRestantes) {
                incapacidadesProcesadas++;
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "incapacidad",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "INCAPACIDAD",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }

            if (ausenciasProcesadas < diasAusenciasRestantes) {
                ausenciasProcesadas++;
                resultados.push({
                    fecha: dia.fecha,
                    tipo: "ausencia",
                    registros: [],
                    trabajado_minutos: 0,
                    trabajado_hhmm: '00:00',
                    trabajado_decimal: 0,
                    observacion_dia: "AUSENCIA",
                    tipo_turno: tipoTurno,
                    max_horas: maxHoras
                });
                return;
            }

            resultados.push({
                fecha: dia.fecha,
                tipo: "descanso",
                registros: [],
                trabajado_minutos: 0,
                trabajado_hhmm: '00:00',
                trabajado_decimal: 0,
                observacion_dia: "DÍA DE DESCANSO",
                tipo_turno: tipoTurno,
                max_horas: maxHoras
            });
        });

        return resultados;
    }

    // ===============================================
    // Evento para actualizar aplicar_horario_variable
    // ===============================================
    $(document).on('change', '#aplicarHorarioEmpleado', function () {
        const nuevoValor = $(this).is(':checked');
        const empleadoActual = $('#btn-guardar-registros').data('empleadoActual');

        if (!empleadoActual) {
            console.error('No se pudo identificar el empleado actual');
            return;
        }

        // Obtener el JSON unido del sessionStorage
        let jsonUnido;
        try {
            const stored = sessionStorage.getItem('reloj-ocho');
            if (!stored) return;
            jsonUnido = JSON.parse(stored);
        } catch (e) {
            console.error('Error al parsear sessionStorage:', e);
            return;
        }

        // Buscar el empleado en el JSON y actualizar
        for (const depto of jsonUnido.departamentos || []) {
            for (const emp of depto.empleados || []) {
                if (emp.id_empleado === empleadoActual.id_empleado ||
                    emp.clave === empleadoActual.clave ||
                    (emp.nombre && empleadoActual.nombre && emp.nombre.trim() === empleadoActual.nombre.trim())) {

                    // Actualizar el valor de aplicar_horario_variable
                    emp.aplicar_horario_variable = nuevoValor;

                    // También actualizar la referencia local del empleado
                    empleadoActual.aplicar_horario_variable = nuevoValor;

                    console.log(`Horario variable actualizado para ${emp.nombre}: ${nuevoValor}`);
                    break;
                }
            }
        }

        // Guardar en sessionStorage
        try {
            sessionStorage.setItem('reloj-ocho', JSON.stringify(jsonUnido));
        } catch (e) {
            console.error('Error al guardar en sessionStorage:', e);
        }
    });

    // Función para convertir HH:MM a minutos
    function horaAMinutos(hora) {
        if (!hora) return 0;
        const [h, m] = hora.split(':').map(x => parseInt(x, 10));
        return h * 60 + m;
    }

    // Función para convertir minutos a HH:MM
    function minutosAHora(minutos) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    // Función para redondear decimal según la lógica especificada
    function redondearDecimal(hhmm) {
        if (!hhmm) return 0;
        const [horas, minutos] = hhmm.split(':').map(x => parseInt(x, 10));

        // Si los minutos están entre 0 y 10, redondear hacia abajo
        if (minutos >= 0 && minutos <= 10) {
            return horas;
        } else {
            // Si los minutos están entre 11 y 59, redondear hacia arriba
            return horas + 1;
        }
    }

    // ====================================================================
    // Guardar cambios que se hizo manualmente para los registro procesados
    // ====================================================================
    $(document).on('click', '#btn-guardar-registros', function () {

        // Obtener el empleado actual del storage temporal
        const empleadoActual = $(this).data('empleadoActual');

        if (!empleadoActual) {
            alert('No se pudo identificar el empleado actual');
            return;
        }

        // Obtener el JSON unido del sessionStorage
        let jsonUnido;
        try {
            const stored = sessionStorage.getItem('reloj-ocho');

            if (!stored) {
                alert('No se encontraron datos en sessionStorage');
                return;
            }

            jsonUnido = JSON.parse(stored);
        } catch (e) {
            console.error('Error al parsear sessionStorage:', e);
            alert('Error al cargar los datos del storage');
            return;
        }

        // Buscar el empleado en el JSON
        let empleadoEncontrado = null;
        let departamentoEncontrado = null;

        for (const depto of jsonUnido.departamentos || []) {
            for (const emp of depto.empleados || []) {
                if (emp.id_empleado === empleadoActual.id_empleado ||
                    emp.clave === empleadoActual.clave ||
                    (emp.nombre && empleadoActual.nombre && emp.nombre.trim() === empleadoActual.nombre.trim())) {
                    empleadoEncontrado = emp;
                    departamentoEncontrado = depto;
                    console.log('Empleado encontrado!');
                    break;
                }
            }
            if (empleadoEncontrado) break;
        }

        if (!empleadoEncontrado) {
            console.error('No se encontró el empleado. Datos:', {
                empleadoActual,
                totalDepartamentos: jsonUnido.departamentos?.length,
                totalEmpleados: jsonUnido.departamentos?.reduce((acc, d) => acc + (d.empleados?.length || 0), 0)
            });
            alert('No se encontró el empleado en el storage');
            return;
        }

        // Leer la tabla y reorganizar los datos
        const $tbody = $('#table-body-registros-procesados');
        const filas = $tbody.find('tr').toArray();

        // Crear un mapa de registros por fecha
        const registrosPorFecha = {};

        filas.forEach(fila => {
            const $fila = $(fila);
            const fecha = $fila.find('td').eq(1).text().trim();
            const entrada = $fila.find('.hora-entrada').val();
            const salida = $fila.find('.hora-salida').val();

            if (!fecha) return;

            if (!registrosPorFecha[fecha]) {
                registrosPorFecha[fecha] = {
                    dia: $fila.find('td').eq(0).text().trim(),
                    fecha: fecha,
                    pares: []
                };
            }

            if (entrada && salida) {
                registrosPorFecha[fecha].pares.push({ entrada, salida });
            }
        });

        // Actualizar registros_procesados
        empleadoEncontrado.registros_procesados.forEach(regProc => {
            const datosActualizados = registrosPorFecha[regProc.fecha];

            if (datosActualizados && datosActualizados.pares.length > 0) {
                // Actualizar el array de registros manteniendo la estructura original
                regProc.registros = [];
                datosActualizados.pares.forEach(par => {
                    regProc.registros.push(
                        { tipo: 'entrada', hora: par.entrada, observacion: 'EDITADO' },
                        { tipo: 'salida', hora: par.salida, observacion: 'EDITADO' }
                    );
                });

                // Calcular minutos trabajados totales del día
                let minutosDelDia = 0;
                datosActualizados.pares.forEach(par => {
                    const minEntrada = horaAMinutos(par.entrada);
                    const minSalida = horaAMinutos(par.salida);
                    let diff = minSalida - minEntrada;
                    if (diff < 0) diff += 24 * 60; // Cruzó medianoche
                    minutosDelDia += diff;
                });

                // Solo actualizar los campos de tiempo trabajado, mantener los demás campos
                regProc.trabajado_minutos = minutosDelDia;
                regProc.trabajado_hhmm = minutosAHora(minutosDelDia);
                regProc.trabajado_decimal = parseFloat((minutosDelDia / 60).toFixed(2));

                // IMPORTANTE: Si el día era inasistencia y ahora tiene registros, cambiar a asistencia
                if (regProc.tipo === 'inasistencia') {
                    regProc.tipo = 'asistencia';
                    regProc.observacion_dia = 'EDITADO MANUALMENTE';
                }

                // Marcar como editado manualmente para que no se sobrescriba al recargar
                regProc.editado_manualmente = true;
            } else if (datosActualizados && datosActualizados.pares.length === 0) {
                // Si no hay pares (todas las filas están vacías), limpiar registros
                // pero mantener el tipo original si era descanso o vacaciones
                if (regProc.tipo === 'asistencia') {
                    regProc.registros = [];
                    regProc.trabajado_minutos = 0;
                    regProc.trabajado_hhmm = '00:00';
                    regProc.trabajado_decimal = 0;
                    regProc.tipo = 'inasistencia';
                    regProc.observacion_dia = 'SIN REGISTRO BIOMÉTRICO';
                    regProc.editado_manualmente = true;
                }
            }
        });

        // Recalcular totales del empleado
        let totalMinutos = 0;
        empleadoEncontrado.registros_procesados.forEach(regProc => {
            if (regProc.tipo === 'asistencia') {
                totalMinutos += regProc.trabajado_minutos || 0;
            }
        });

        empleadoEncontrado.trabajado_total_minutos = totalMinutos;
        empleadoEncontrado.trabajado_total_hhmm = minutosAHora(totalMinutos);
        empleadoEncontrado.trabajado_total_decimal = redondearDecimal(minutosAHora(totalMinutos));

        // Guardar en sessionStorage
        try {
            sessionStorage.setItem('reloj-ocho', JSON.stringify(jsonUnido));
        } catch (e) {
            console.error('Error al guardar en sessionStorage:', e);
            alert('Error al guardar los cambios');
            return;
        }

        Swal.fire({
            title: "Registros guardados exitosamente",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });

        // Cerrar el modal
        $('#modal-detalles').fadeOut(300);

        // Disparar evento para recargar la interfaz (preservando la paginación actual)
        $(document).trigger('reloj-data-updated', [{ preservePage: true }]);
        console.log('Evento reloj-data-updated disparado (paginación preservada)');
    });

    // Eventos para oscurecer el modal de detalles cuando eventosModal se abre/cierra
    $('#eventosModal').on('show.bs.modal', function (event) {
        $('#modal-detalles').addClass('eventos-modal-abierto');

        // Obtener el botón que disparó el modal y su fila
        const $boton = $(event.relatedTarget);
        const $fila = $boton.closest('tr');

        if ($fila.length) {
            // Guardar referencia a la fila para usarla al guardar
            $(this).data('filaActual', $fila);

            const tipoActual = $fila.attr('data-tipo') || 'asistencia';
            const fecha = $fila.attr('data-fecha') || '';

            console.log('Tipo actual:', tipoActual, 'Fecha:', fecha); // Debug

            // Limpiar selección previa
            $('#form-eventos-empleados input[name="tipoEvento"]').prop('checked', false);

            // Seleccionar el radio correspondiente al tipo
            const $radio = $(`#form-eventos-empleados input[name="tipoEvento"][value="${tipoActual}"]`);
            console.log('Radio encontrado:', $radio.length); // Debug
            $radio.prop('checked', true);

            // Actualizar el título del modal con la fecha
            if (fecha) {
                $('#eventosModalLabel').text(`Eventos del día ${fecha}`);
            } else {
                $('#eventosModalLabel').text('Eventos del empleado');
            }
        }
    });

    $('#eventosModal').on('hidden.bs.modal', function () {
        $('#modal-detalles').removeClass('eventos-modal-abierto');
        // Limpiar la referencia a la fila
        $(this).removeData('filaActual');
    });

    // Event listener para guardar evento (tipo de día)
    $(document).on('click', '#btn-guardar-evento', function () {
        const $modal = $('#eventosModal');
        const $fila = $modal.data('filaActual');

        if (!$fila || !$fila.length) {
            Swal.fire({
                title: "Error",
                text: "No se encontró la fila del registro",
                icon: "error"
            });
            return;
        }

        // Obtener el tipo seleccionado
        const tipoSeleccionado = $('#form-eventos-empleados input[name="tipoEvento"]:checked').val();

        if (!tipoSeleccionado) {
            Swal.fire({
                title: "Selecciona un tipo",
                text: "Debes seleccionar un tipo de evento",
                icon: "warning"
            });
            return;
        }

        const fecha = $fila.attr('data-fecha');
        const empleadoActual = $('#btn-guardar-registros').data('empleadoActual');

        if (!empleadoActual) {
            Swal.fire({
                title: "Error",
                text: "No se encontró el empleado actual",
                icon: "error"
            });
            return;
        }

        // Obtener el JSON unido del sessionStorage
        let jsonUnido;
        try {
            const data = sessionStorage.getItem('reloj-ocho');
            if (!data) throw new Error('No hay datos');
            jsonUnido = JSON.parse(data);
        } catch (e) {
            Swal.fire({
                title: "Error",
                text: "No se pudieron cargar los datos",
                icon: "error"
            });
            return;
        }

        // Buscar el empleado en el JSON
        let empleadoEncontrado = null;
        for (const depto of jsonUnido.departamentos || []) {
            for (const emp of depto.empleados || []) {
                if (emp.clave === empleadoActual.clave || emp.id_empleado === empleadoActual.id_empleado) {
                    empleadoEncontrado = emp;
                    break;
                }
            }
            if (empleadoEncontrado) break;
        }

        if (!empleadoEncontrado) {
            Swal.fire({
                title: "Error",
                text: "No se encontró el empleado en los datos",
                icon: "error"
            });
            return;
        }

        // Buscar el registro_procesado con esa fecha y actualizar
        const registroProcesado = empleadoEncontrado.registros_procesados.find(r => r.fecha === fecha);

        if (registroProcesado) {
            // Guardar el tipo anterior para actualizar contadores
            const tipoAnterior = registroProcesado.tipo;

            // Actualizar el tipo
            registroProcesado.tipo = tipoSeleccionado;

            // IMPORTANTE: Marcar como editado manualmente para que no se sobreescriba al recargar
            registroProcesado.editado_manualmente = true;

            // Si el tipo NO es asistencia, vaciar registros y poner horas en 0
            if (tipoSeleccionado !== 'asistencia') {
                registroProcesado.registros = [];
                registroProcesado.trabajado_minutos = 0;
                registroProcesado.trabajado_hhmm = '00:00';
                registroProcesado.trabajado_decimal = 0;

                // Actualizar observación según el tipo
                switch (tipoSeleccionado) {
                    case 'vacaciones':
                        registroProcesado.observacion_dia = 'VACACIONES';
                        break;
                    case 'incapacidad':
                        registroProcesado.observacion_dia = 'INCAPACIDAD';
                        break;
                    case 'inasistencia':
                        registroProcesado.observacion_dia = 'AUSENCIA';
                        break;
                    case 'descanso':
                        registroProcesado.observacion_dia = 'DESCANSO';
                        break;
                }
            }

            // Actualizar las filas en la tabla
            const $tbody = $('#table-body-registros-procesados');
            const $filasConMismaFecha = $tbody.find('tr').filter(function () {
                return $(this).attr('data-fecha') === fecha;
            });

            // Si el tipo NO es asistencia, eliminar filas extras y dejar solo una
            if (tipoSeleccionado !== 'asistencia') {
                // Mantener solo la primera fila y eliminar las demás
                $filasConMismaFecha.each(function (index) {
                    if (index === 0) {
                        // Primera fila: actualizar y limpiar
                        $(this).attr('data-tipo', tipoSeleccionado);
                        $(this).find('.hora-entrada').val('');
                        $(this).find('.hora-salida').val('');
                        $(this).find('.horas-trabajadas-cell').text('-');
                    } else {
                        // Filas adicionales: eliminar
                        $(this).remove();
                    }
                });
            } else {
                // Si es asistencia, solo actualizar el data-tipo
                $filasConMismaFecha.each(function () {
                    $(this).attr('data-tipo', tipoSeleccionado);
                });
            }

            // =====================================================
            // Recalcular contadores de vacaciones, incapacidades, 
            // ausencias y días trabajados basándose en registros_procesados
            // =====================================================
            let contadorVacaciones = 0;
            let contadorIncapacidades = 0;
            let contadorAusencias = 0;
            let contadorAsistencias = 0;

            empleadoEncontrado.registros_procesados.forEach(regProc => {
                switch (regProc.tipo) {
                    case 'vacaciones':
                        contadorVacaciones++;
                        break;
                    case 'incapacidad':
                        contadorIncapacidades++;
                        break;
                    case 'inasistencia':
                        contadorAusencias++;
                        break;
                    case 'asistencia':
                        contadorAsistencias++;
                        break;
                    // 'descanso' no cuenta para ningún contador
                }
            });

            // Asegurar que los valores estén entre 0 y 6
            contadorVacaciones = Math.max(0, Math.min(6, contadorVacaciones));
            contadorIncapacidades = Math.max(0, Math.min(6, contadorIncapacidades));
            contadorAusencias = Math.max(0, Math.min(6, contadorAusencias));
            contadorAsistencias = Math.max(0, Math.min(6, contadorAsistencias));

            // Actualizar claves del empleado
            empleadoEncontrado.dias_vacaciones = contadorVacaciones;
            empleadoEncontrado.vacaciones = contadorVacaciones > 0;

            empleadoEncontrado.dias_incapacidades = contadorIncapacidades;
            empleadoEncontrado.incapacidades = contadorIncapacidades > 0;

            empleadoEncontrado.dias_ausencias = contadorAusencias;
            empleadoEncontrado.ausencias = contadorAusencias > 0;

            // dias_trabajados = días de asistencia (máximo 6)
            empleadoEncontrado.dias_trabajados = contadorAsistencias;

            // Recalcular totales de minutos trabajados
            let totalMinutos = 0;
            empleadoEncontrado.registros_procesados.forEach(regProc => {
                totalMinutos += regProc.trabajado_minutos || 0;
            });

            empleadoEncontrado.trabajado_total_minutos = totalMinutos;
            empleadoEncontrado.trabajado_total_hhmm = minutosAHora(totalMinutos);
            empleadoEncontrado.trabajado_total_decimal = redondearDecimal(minutosAHora(totalMinutos));

            // Actualizar también la referencia local (empleadoActual)
            empleadoActual.registros_procesados = empleadoEncontrado.registros_procesados;
            empleadoActual.trabajado_total_minutos = empleadoEncontrado.trabajado_total_minutos;
            empleadoActual.trabajado_total_hhmm = empleadoEncontrado.trabajado_total_hhmm;
            empleadoActual.trabajado_total_decimal = empleadoEncontrado.trabajado_total_decimal;
            empleadoActual.dias_vacaciones = empleadoEncontrado.dias_vacaciones;
            empleadoActual.vacaciones = empleadoEncontrado.vacaciones;
            empleadoActual.dias_incapacidades = empleadoEncontrado.dias_incapacidades;
            empleadoActual.incapacidades = empleadoEncontrado.incapacidades;
            empleadoActual.dias_ausencias = empleadoEncontrado.dias_ausencias;
            empleadoActual.ausencias = empleadoEncontrado.ausencias;
            empleadoActual.dias_trabajados = empleadoEncontrado.dias_trabajados;

            // Actualizar la información mostrada en el modal de detalles
            $('#campo-dias-trabajados').text(empleadoEncontrado.dias_trabajados || '0');
            $('#campo-ausencias').text(empleadoEncontrado.ausencias ? empleadoEncontrado.dias_ausencias : 'No');
            $('#campo-vacaciones').text(empleadoEncontrado.vacaciones ? empleadoEncontrado.dias_vacaciones : 'No');
            $('#campo-incapacidades').text(empleadoEncontrado.incapacidades ? empleadoEncontrado.dias_incapacidades : 'No');
        }

        // Guardar en sessionStorage
        try {
            sessionStorage.setItem('reloj-ocho', JSON.stringify(jsonUnido));
        } catch (e) {
            console.error('Error al guardar en sessionStorage:', e);
        }

        // Cerrar el modal de eventos
        const modalInstance = bootstrap.Modal.getInstance($modal[0]);
        if (modalInstance) {
            modalInstance.hide();
        }

        // Mostrar confirmación
        Swal.fire({
            title: "Evento guardado",
            text: `El día ${fecha} se marcó como ${tipoSeleccionado}`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });
    });

});