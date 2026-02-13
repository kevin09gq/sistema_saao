// Función para abrir el modal de tipo de día
function diasJustificados() {
    let _diaSeleccionado = null;
    let _empleadoActual = null;

    // Abrir modal cuando se hace clic en el botón
    $(document).on('click', '.btn-abrir-tipo-dia', function () {
        const $fila = $(this).closest('tr');
        const diaSemana = String($fila.data('dia-semana') || '').toUpperCase().trim();
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val() ? String($('#campo-id-empresa').val()).trim() : '';

        // Buscar el empleado actual
        let empleadoEncontrado = null;
        if (jsonNominaConfianza && jsonNominaConfianza.departamentos) {
            jsonNominaConfianza.departamentos.forEach(departamento => {
                departamento.empleados.forEach(empleado => {
                    if (String(empleado.clave).trim() === clave &&
                        String(empleado.id_empresa).trim() === idEmpresa) {
                        empleadoEncontrado = empleado;
                    }
                });
            });
        }

        _diaSeleccionado = diaSemana;
        _empleadoActual = empleadoEncontrado;

        $('#modal-tipo-dia').show();
    });

    // Cerrar modal
    $(document).on('click', '#cerrar-modal-tipo-dia, #btn-cancelar-tipo-dia', function () {
        $('#modal-tipo-dia').hide();
    });

    // Manejar selección de tipo de día
    $(document).on('click', '.btn-tipo-dia', function () {
        const tipoSeleccionado = $(this).data('tipo') || '';

        if (!_diaSeleccionado || !_empleadoActual) {
            console.warn('No hay día o empleado seleccionado');
            return;
        }

        // Inicializar dias_justificados si no existe
        if (!_empleadoActual.dias_justificados) {
            _empleadoActual.dias_justificados = {};
        }

        // Guardar o quitar tipo de día
        if (tipoSeleccionado) {
            _empleadoActual.dias_justificados[_diaSeleccionado] = tipoSeleccionado;
        } else {
            delete _empleadoActual.dias_justificados[_diaSeleccionado];
        }

        // Eliminar la propiedad dias_justificados si está vacía
        if (Object.keys(_empleadoActual.dias_justificados).length === 0) {
            delete _empleadoActual.dias_justificados;
        }

        // AGREGAR PROPIEDADES AL HORARIO_OFICIAL TAMBIÉN
        if (_empleadoActual.horario_oficial && Array.isArray(_empleadoActual.horario_oficial)) {
            const diaHorario = _empleadoActual.horario_oficial.find(h =>
                String(h.dia).toUpperCase().trim() === _diaSeleccionado
            );

            if (diaHorario) {
                if (tipoSeleccionado) {
                    diaHorario.justificado = true;
                    diaHorario.tipo_justificacion = tipoSeleccionado;
                } else {
                    delete diaHorario.justificado;
                    delete diaHorario.tipo_justificacion;
                }
            }
        }

        // Cerrar modal
        $('#modal-tipo-dia').hide();

        // Actualizar badge en la tabla (insertar junto a botones de acción)
        const $fila = $(`#horarios-oficiales-body tr[data-dia-semana="${_diaSeleccionado}"]`);
        if ($fila.length) {
            const $action = $fila.find('td').last().find('.d-flex');
            // Remover TODOS los badges de justificación (tanto nuevos como legacy)
            $action.find('.badge[data-justificacion="1"]').remove(); // Badge nuevo
            $action.find('.badge.bg-info').remove(); // Badge legacy de dias_justificados
            $action.find('.badge.bg-warning').remove(); // Cualquier badge de warning

            if (tipoSeleccionado) {
                const badge = `<span class="badge bg-warning text-dark ms-1" data-justificacion="1" style="font-size:0.75rem;">${tipoSeleccionado}</span>`;
                $action.append(badge);
            }
        }

        // Si se justificó el día (tipoSeleccionado no vacío), eliminar inasistencias automáticas de ese día
        if (tipoSeleccionado && _empleadoActual) {
            // Eliminar SOLO inasistencias automáticas de ese día del historial
            if (Array.isArray(_empleadoActual.historial_inasistencias)) {
                _empleadoActual.historial_inasistencias = _empleadoActual.historial_inasistencias.filter(h =>
                    !(h.tipo === 'automatico' && String(h.dia).toUpperCase().trim() === _diaSeleccionado)
                );
            }

            // Recalcular inasistencias_contadas (contar solo automáticas del historial actual)
            _empleadoActual.inasistencias_contadas = Array.isArray(_empleadoActual.historial_inasistencias)
                ? _empleadoActual.historial_inasistencias.filter(h => h.tipo === 'automatico').length
                : 0;

            // Recalcular inasistencia (suma de descuentos del historial actual)
            _empleadoActual.inasistencia = Array.isArray(_empleadoActual.historial_inasistencias)
                ? _empleadoActual.historial_inasistencias.reduce((sum, h) => sum + (parseFloat(h.descuento_inasistencia) || 0), 0)
                : 0;

            // Recalcular total a cobrar con el nuevo valor de inasistencia
            if (typeof calcularTotalCobrar === 'function') {
                calcularTotalCobrar(_empleadoActual);
            }

            // Actualizar el input del modal si está abierto
            $('#mod-inasistencias').val((_empleadoActual.inasistencia || 0).toFixed(2));
            
            // Actualizar sueldo a cobrar si el modal está abierto
            if (typeof calcularYMostrarSueldoACobrar === 'function') {
                calcularYMostrarSueldoACobrar();
            }
        } else if (!tipoSeleccionado && _empleadoActual) {
            // Si se quitó la justificación, regenerar inasistencias completo
            if (typeof detectarInasistencias === 'function') {
                detectarInasistencias(_empleadoActual.clave, _empleadoActual.id_empresa);
            }

            // Actualizar el input del modal con el nuevo valor
            $('#mod-inasistencias').val((_empleadoActual.inasistencia || 0).toFixed(2));
            
            // Actualizar sueldo a cobrar si el modal está abierto
            if (typeof calcularYMostrarSueldoACobrar === 'function') {
                calcularYMostrarSueldoACobrar();
            }
        }

        // Mostrar historiales actualizados
        if (typeof mostrarHistorialInasistencias === 'function') {
            mostrarHistorialInasistencias(_empleadoActual);
        }

        if (typeof mostrarInasistencias === 'function') {
            mostrarInasistencias(_empleadoActual);
        }

        // Guardar en localStorage
        if (typeof saveNomina === 'function') {
            saveNomina(jsonNominaConfianza);
        }

        // Refrescar tabla principal manteniendo la página actual y filtros (no resetear paginación si es posible)
        const modalNombreEmpleado = $('#nombre-empleado-modal').text().trim();
        if (modalNombreEmpleado) {
            if (typeof configPaginacionSearch === 'function') {
                configPaginacionSearch();
            } else if (typeof aplicarFiltrosCombinados === 'function') {
                aplicarFiltrosCombinados();
            }
        }

    });
}

function eliminarMarcaje() {
    $(document).on('click', '.btn-eliminar-horario', function () {
        const $fila = $(this).closest('tr');
        const diaSemana = String($fila.data('dia-semana') || '').toUpperCase().trim();
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val() ? String($('#campo-id-empresa').val()).trim() : '';

        // Buscar el empleado actual
        let empleadoEncontrado = null;
        if (jsonNominaConfianza && jsonNominaConfianza.departamentos) {
            jsonNominaConfianza.departamentos.forEach(departamento => {
                departamento.empleados.forEach(empleado => {
                    if (String(empleado.clave).trim() === clave &&
                        String(empleado.id_empresa).trim() === idEmpresa) {
                        empleadoEncontrado = empleado;
                    }
                });
            });
        }

        if (!empleadoEncontrado) return;

        // Eliminar del horario_oficial
        if (empleadoEncontrado.horario_oficial && Array.isArray(empleadoEncontrado.horario_oficial)) {
            const indice = empleadoEncontrado.horario_oficial.findIndex(h =>
                String(h.dia).toUpperCase().trim() === diaSemana
            );
            if (indice !== -1) {
                empleadoEncontrado.horario_oficial.splice(indice, 1);
            }
        }

        // Limpiar justificaciones
        if (empleadoEncontrado.dias_justificados && empleadoEncontrado.dias_justificados[diaSemana]) {
            delete empleadoEncontrado.dias_justificados[diaSemana];
            if (Object.keys(empleadoEncontrado.dias_justificados).length === 0) {
                delete empleadoEncontrado.dias_justificados;
            }
        }

        // Actualizar tabla
        if (typeof mostrarRegistrosBD === 'function') {
            mostrarRegistrosBD(empleadoEncontrado);
        }

        // Redetectar eventos
        if (typeof detectarRetardos === 'function') {
            detectarRetardos(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        }
        if (typeof detectarInasistencias === 'function') {
            detectarInasistencias(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        }
        if (typeof detectarOlvidosChecador === 'function') {
            detectarOlvidosChecador(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        }
        if (typeof detectarEntradasTempranas === 'function') {
            detectarEntradasTempranas(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        }
        if (typeof detectarSalidasTardias === 'function') {
            detectarSalidasTardias(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        }
        if (typeof detectarSalidasTempranas === 'function') {
            detectarSalidasTempranas(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        }
        if (typeof detectarPermisosYComida === 'function') {
            detectarPermisosYComida(empleadoEncontrado.clave, empleadoEncontrado.id_empresa);
        }

        // Actualizar visualizaciones
        if (typeof mostrarHistorialRetardos === 'function') {
            mostrarHistorialRetardos(empleadoEncontrado);
        }
        if (typeof mostrarHistorialInasistencias === 'function') {
            mostrarHistorialInasistencias(empleadoEncontrado);
        }
        if (typeof mostrarHistorialOlvidos === 'function') {
            mostrarHistorialOlvidos(empleadoEncontrado);
        }
        if (typeof mostrarRetardos === 'function') {
            mostrarRetardos(empleadoEncontrado);
        }
        if (typeof mostrarInasistencias === 'function') {
            mostrarInasistencias(empleadoEncontrado);
        }
        if (typeof mostrarOlvidosChecador === 'function') {
            mostrarOlvidosChecador(empleadoEncontrado);
        }
        if (typeof mostrarEntradasTempranas === 'function') {
            mostrarEntradasTempranas(empleadoEncontrado);
        }
        if (typeof mostrarSalidasTardias === 'function') {
            mostrarSalidasTardias(empleadoEncontrado);
        }
        if (typeof mostrarSalidasTempranas === 'function') {
            mostrarSalidasTempranas(empleadoEncontrado);
        }
        if (typeof mostrarAnalisisPermisosComida === 'function') {
            mostrarAnalisisPermisosComida(empleadoEncontrado);
        }

    });
}

// Función sencilla para abrir el modal de Días Inhábiles (DESCANSO / FESTIVO)
function diasInhabiles() {
    // Usamos jQuery para el evento y la API de Bootstrap 5 para mostrar el modal
    $(document).on('click', '#btn_dias_inhabiles', function () {
        const $modal = $('#modal-dias-inhabiles');
        if ($modal.length === 0) {
            console.warn('Modal #modal-dias-inhabiles no encontrado');
            return;
        }
        const modalEl = $modal[0];
        // Obtener o crear instancia de Bootstrap Modal y mostrarla
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
    });

    // Handler para guardar día inhábil → solo actualiza inasistencias de TODOS los empleados
    $(document).on('click', '#btn-guardar-dia-inhabil', function () {
        const diaSeleccionado = $('#select-dia-semana').val();
        const tipoSeleccionado = $('#select-tipo-dias').val();

        if (!diaSeleccionado || !tipoSeleccionado) {
            alert('Selecciona un día y un tipo');
            return;
        }

        const diaMayus = diaSeleccionado.toUpperCase().trim();

        // Recorrer TODOS los empleados y aplicar justificación + eliminar inasistencias automáticas
        jsonNominaConfianza.departamentos.forEach(departamento => {
            departamento.empleados.forEach(empleado => {

                // 1. Marcar en dias_justificados
                if (!empleado.dias_justificados) empleado.dias_justificados = {};
                empleado.dias_justificados[diaMayus] = tipoSeleccionado;

                // 2. Marcar en horario_oficial
                if (Array.isArray(empleado.horario_oficial)) {
                    const diaHorario = empleado.horario_oficial.find(h =>
                        String(h.dia).toUpperCase().trim() === diaMayus
                    );
                    if (diaHorario) {
                        diaHorario.justificado = true;
                        diaHorario.tipo_justificacion = tipoSeleccionado;
                    }
                }

                // 3. Eliminar SOLO inasistencias automáticas de ese día del historial
                if (Array.isArray(empleado.historial_inasistencias)) {
                    empleado.historial_inasistencias = empleado.historial_inasistencias.filter(h =>
                        !(h.tipo === 'automatico' && String(h.dia).toUpperCase().trim() === diaMayus)
                    );
                }

                // 4. Recalcular inasistencias_contadas (contar solo automáticas del historial actual)
                empleado.inasistencias_contadas = Array.isArray(empleado.historial_inasistencias)
                    ? empleado.historial_inasistencias.filter(h => h.tipo === 'automatico').length
                    : 0;

                // 5. Recalcular inasistencia (suma de descuentos del historial actual)
                empleado.inasistencia = Array.isArray(empleado.historial_inasistencias)
                    ? empleado.historial_inasistencias.reduce((sum, h) => sum + (parseFloat(h.descuento_inasistencia) || 0), 0)
                    : 0;

                // 6. Recalcular total a cobrar con el nuevo valor de inasistencia
                if (typeof calcularTotalCobrar === 'function') {
                    calcularTotalCobrar(empleado);
                }
            });
        });

        // Guardar en localStorage
        if (typeof saveNomina === 'function') {
            saveNomina(jsonNominaConfianza);
        }

        // Refrescar la tabla principal para que se vea el cambio en la columna AUSENTISMO
        if (typeof configPaginacionSearch === 'function') {
            configPaginacionSearch();
        } else if (typeof aplicarFiltrosCombinados === 'function') {
            aplicarFiltrosCombinados();
        }

        // Cerrar modal
        const modalEl = document.getElementById('modal-dias-inhabiles');
        if (modalEl) {
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
        }

        // Si hay un modal de empleado abierto, actualizar sus datos también
        const claveAbierta = $('#campo-clave').text().trim();
        const idEmpresaAbierta = $('#campo-id-empresa').val() ? String($('#campo-id-empresa').val()).trim() : '';
        if (claveAbierta && idEmpresaAbierta) {
            let empAbierto = null;
            jsonNominaConfianza.departamentos.forEach(dept => {
                dept.empleados.forEach(emp => {
                    if (String(emp.clave).trim() === claveAbierta && String(emp.id_empresa).trim() === idEmpresaAbierta) {
                        empAbierto = emp;
                    }
                });
            });
            if (empAbierto) {
                if (typeof mostrarRegistrosBD === 'function') mostrarRegistrosBD(empAbierto);
                if (typeof mostrarHistorialInasistencias === 'function') mostrarHistorialInasistencias(empAbierto);
                if (typeof mostrarInasistencias === 'function') mostrarInasistencias(empAbierto);
                $('#mod-inasistencias').val((empAbierto.inasistencia || 0).toFixed(2));
            }
        }
    });
}

// Copiar valores HV a filas LUNES->SABADO
function copiarHorarioVariable() {
    const entrada = $('#hv-input-entrada').val() || '';
    const salidaComida = $('#hv-input-salida-comida').val() || '';
    const entradaComida = $('#hv-input-entrada-comida').val() || '';
    const salida = $('#hv-input-salida').val() || '';

    // Seleccionar filas del tbody (asumimos que están en orden LUNES..DOMINGO)
    const $rows = $('#tbody-horario-variable tr');
    // Copiar solo a las primeras 6 filas (LUNES..SABADO)
    $rows.slice(0, 6).each(function () {
        const $r = $(this);
        const $entrada = $r.find('.entrada');
        const $salidaComida = $r.find('.salida-comida');
        const $entradaComida = $r.find('.entrada-comida');
        const $salida = $r.find('.salida');

        $entrada.val(entrada);
        $salidaComida.val(salidaComida);
        $entradaComida.val(entradaComida);
        $salida.val(salida);
    });
}

function lstEmpSinHorarioVar() {
    // Encontrar empleados sin horario oficial (ausente o todos los días vacíos)
    const empleados = [];
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return empleados;

    jsonNominaConfianza.departamentos.forEach(dept => {
        dept.empleados.forEach(emp => {
            const horario = emp.horario_oficial;
            let sinHorario = false;

            if (!Array.isArray(horario) || horario.length === 0) {
                sinHorario = true;
            } else {
                // Si existen 7 días pero todos los campos de horas están vacíos, considerarlo sin horario
                const anyNonEmpty = horario.some(d => {
                    return (d.entrada && String(d.entrada).trim() !== '') ||
                        (d.salida_comida && String(d.salida_comida).trim() !== '') ||
                        (d.entrada_comida && String(d.entrada_comida).trim() !== '') ||
                        (d.salida && String(d.salida).trim() !== '');
                });
                if (!anyNonEmpty) sinHorario = true;
            }

            if (sinHorario && emp.mostrar !== false) {
                empleados.push({ clave: emp.clave, nombre: emp.nombre, id_empresa: emp.id_empresa });
            }
        });
    });

    // Pintar en el modal
    const $tbody = $('#tbody-empleados-sin-horario');
    $tbody.empty();

    if (empleados.length === 0) {
        $('#empleados-sin-horario-empty').show();
        $('#empleados-sin-horario-count').text('');
    } else {
        $('#empleados-sin-horario-empty').hide();
        $('#empleados-sin-horario-count').text(empleados.length + ' empleados sin horario oficial');

        empleados.forEach(emp => {
            const row = `
                <tr>
                    <td class="text-center"><input type="checkbox" class="form-check-input chk-emp-sin-hor" data-clave="${emp.clave}" data-id-empresa="${emp.id_empresa}"></td>
                    <td>${emp.clave}</td>
                    <td>${emp.nombre}</td>
                </tr>
            `;
            $tbody.append(row);
        });
    }

    return empleados;
}

function establecerHorarioVariable() {

    // Abrir modal Horario Variable
    $(document).on('click', '#btn_add_horario_variable', function () {
        const $modal = $('#modalHorarioVariable');
        if ($modal.length === 0) {
            console.warn('Modal #modalHorarioVariable no encontrado');
            return;
        }
        const modalEl = $modal[0];
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
    });

    // Bind: click on copy button
    $(document).on('click', '#hv-btn-copiar-horario', function () {
        copiarHorarioVariable();
    });
    // Abrir el modal de empleados sin horario cuando se aplica el horario variable
    $(document).on('click', '#btn-aplicar-horario', function () {
        // Asegurarse de que la tabla de horario variable esté poblada primero
        // Copiar valores al tbody para facilitar la asignación (si el usuario quiere)
        copiarHorarioVariable();

        // Generar la lista
        lstEmpSinHorarioVar();

        // Mostrar modal
        const $modal = $('#modalEmpleadosSinHorarioOficial');
        if ($modal.length === 0) {
            console.warn('Modal #modalEmpleadosSinHorarioOficial no encontrado');
            return;
        }
        const modalEl = $modal[0];
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
    });

    // Select all checkbox behavior
    $(document).on('change', '#chk-select-all-sin-horario', function () {
        const checked = $(this).is(':checked');
        $('#tbody-empleados-sin-horario .chk-emp-sin-hor').prop('checked', checked);
    });

    // Asignar horario (las filas del modal HV) a los empleados seleccionados
    $(document).on('click', '#btn-asignar-horario-seleccionados', function () {
        const seleccionados = [];
        $('#tbody-empleados-sin-horario .chk-emp-sin-hor:checked').each(function () {
            seleccionados.push({ clave: $(this).data('clave'), id_empresa: $(this).data('id-empresa') });
        });

        if (seleccionados.length === 0) {
            alert('Selecciona al menos un empleado');
            return;
        }

        // Construir el horario desde el tbody del modalHorarioVariable (7 filas esperadas)
        const horario = [];
        $('#tbody-horario-variable tr').each(function () {
            const dia = $(this).find('input[type="text"]').val() || '';
            const entrada = $(this).find('.entrada').val() || '';
            const salida_comida = $(this).find('.salida-comida').val() || '';
            const entrada_comida = $(this).find('.entrada-comida').val() || '';
            const salida = $(this).find('.salida').val() || '';

            horario.push({ dia: String(dia).toUpperCase().trim(), entrada, salida_comida, entrada_comida, salida });
        });

        // Asignar a cada empleado seleccionado
        seleccionados.forEach(sel => {
            // Buscar empleado
            let emp = null;
            jsonNominaConfianza.departamentos.forEach(dept => {
                dept.empleados.forEach(e => {
                    if (String(e.clave) === String(sel.clave) && String(e.id_empresa) === String(sel.id_empresa)) {
                        emp = e;
                    }
                });
            });

            if (!emp) return;

            // Asignar copia del horario
            emp.horario_oficial = horario.map(h => ({ ...h }));

            // Redetectar eventos para este empleado
            if (typeof mostrarRegistrosBD === 'function') mostrarRegistrosBD(emp);
            if (typeof detectarRetardos === 'function') detectarRetardos(emp.clave, emp.id_empresa);
            if (typeof detectarInasistencias === 'function') detectarInasistencias(emp.clave, emp.id_empresa);
            if (typeof detectarOlvidosChecador === 'function') detectarOlvidosChecador(emp.clave, emp.id_empresa);
            if (typeof detectarEntradasTempranas === 'function') detectarEntradasTempranas(emp.clave, emp.id_empresa);
            if (typeof detectarSalidasTardias === 'function') detectarSalidasTardias(emp.clave, emp.id_empresa);
            if (typeof detectarSalidasTempranas === 'function') detectarSalidasTempranas(emp.clave, emp.id_empresa);
            if (typeof detectarPermisosYComida === 'function') detectarPermisosYComida(emp.clave, emp.id_empresa);

            // Actualizar visualizaciones si modal de empleado abierto es este
            const claveAbierta = $('#campo-clave').text().trim();
            const idEmpresaAbierta = $('#campo-id-empresa').val() ? String($('#campo-id-empresa').val()).trim() : '';
            if (String(emp.clave).trim() === claveAbierta && String(emp.id_empresa).trim() === idEmpresaAbierta) {
                if (typeof mostrarHistorialInasistencias === 'function') mostrarHistorialInasistencias(emp);
                if (typeof mostrarInasistencias === 'function') mostrarInasistencias(emp);
                if (typeof mostrarRegistrosBD === 'function') mostrarRegistrosBD(emp);
                $('#mod-inasistencias').val((emp.inasistencia || 0).toFixed(2));
            }
        });

        // Guardar y refrescar tabla manteniendo la página actual y filtros
        if (typeof saveNomina === 'function') saveNomina(jsonNominaConfianza);
        if (typeof configPaginacionSearch === 'function') {
            configPaginacionSearch();
        } else if (typeof aplicarFiltrosCombinados === 'function') {
            aplicarFiltrosCombinados();
        }

        // Cerrar modal
        const modalEl = document.getElementById('modalEmpleadosSinHorarioOficial');
        if (modalEl) {
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
        }
    });


}


// Habilita edición inline de una fila de `#tabla-checador` al pulsar el botón de editar
function habilitarEdicionRegistro() {
    $(document).on('click', '.btn-editar-registro', function (e) {
        e.preventDefault();
        const $btn = $(this);
        const $tr = $btn.closest('tr');

        if ($tr.data('editing')) return; // ya en edición
        $tr.data('editing', true);

        const $tdFecha = $tr.find('td').eq(1);
        const $tdEntrada = $tr.find('td').eq(2);
        const $tdSalida = $tr.find('td').eq(3);
        const $tdAcciones = $tr.find('td').eq(4);

        const originalAcciones = $tdAcciones.html();

        const textoFecha = $tdFecha.text().trim();
        const textoEntrada = $tdEntrada.text().trim();
        const textoSalida = $tdSalida.text().trim();

        const aHora = v => {
            if (!v || v === '-' ) return '';
            const p = String(v).split(':');
            return p.slice(0,2).join(':');
        };

        // Solo entrada y salida son editables; la fecha se mantiene como texto
        const $inputEntrada = $('<input type="time" class="form-control form-control-sm er-entrada">').val(aHora(textoEntrada));
        const $inputSalida = $('<input type="time" class="form-control form-control-sm er-salida">').val(aHora(textoSalida));

        // Reemplazar solo las celdas de entrada y salida
        $tdEntrada.empty().append($inputEntrada);
        $tdSalida.empty().append($inputSalida);

        const $btnGuardar = $("<button class=\"btn btn-sm btn-success btn-guardar-registro me-1\" title=\"Guardar\" aria-label=\"Guardar\"><i class=\"bi bi-check-lg\"></i></button>");
        const $btnCancelar = $("<button class=\"btn btn-sm btn-secondary btn-cancelar-edicion\" title=\"Cancelar\" aria-label=\"Cancelar\"><i class=\"bi bi-x-lg\"></i></button>");

        $tdAcciones.empty().append($btnGuardar, $btnCancelar);

        // Cancelar edición: restaurar entradas y acciones (fecha nunca se tocó)
        $btnCancelar.on('click.edicion', function (ev) {
            ev.preventDefault();
            $tdEntrada.text(textoEntrada || '-');
            $tdSalida.text(textoSalida || '-');
            $tdAcciones.html(originalAcciones);
            $tr.data('editing', false);
        });

        // Guardar edición
        $btnGuardar.on('click.edicion', function (ev) {
            ev.preventDefault();
            const nuevaEntrada = String($inputEntrada.val() || '').trim();
            const nuevaSalida = String($inputSalida.val() || '').trim();

            // Actualizar DOM (mostrar '-' si vacío). Fecha se mantiene intacta.
            $tdEntrada.text(nuevaEntrada ? nuevaEntrada : '-');
            $tdSalida.text(nuevaSalida ? nuevaSalida : '-');

            // Restaurar botones
            $tdAcciones.html(originalAcciones);
            $tr.data('editing', false);

            // Actualizar objeto jsonNominaConfianza
            const clave = String($btn.data('clave') || '').trim();
            const indexRegistro = parseInt($btn.data('index'), 10);
            const idEmpresa = $('#campo-id-empresa').val() ? String($('#campo-id-empresa').val()).trim() : '';

            if (!clave || isNaN(indexRegistro)) return;

            // Buscar empleado
            let empleado = null;
            if (typeof buscarEmpleadoPorClaveYEmpresa === 'function') {
                empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
            }
            if (!empleado && window.jsonNominaConfianza && Array.isArray(jsonNominaConfianza.departamentos)) {
                jsonNominaConfianza.departamentos.forEach(depto => {
                    (depto.empleados || []).forEach(emp => {
                        if (!empleado && String(emp.clave).trim() === String(clave).trim() &&
                            (idEmpresa === '' || String(emp.id_empresa).trim() === String(idEmpresa).trim())) {
                            empleado = emp;
                        }
                    });
                });
            }

            if (!empleado) return;

            if (!Array.isArray(empleado.registros) || indexRegistro < 0 || indexRegistro >= empleado.registros.length) return;

            // Guardar solo entrada y salida en el array (fecha no se toca)
            empleado.registros[indexRegistro].entrada = nuevaEntrada ? nuevaEntrada : '-';
            empleado.registros[indexRegistro].salida = nuevaSalida ? nuevaSalida : '-';

            // Refrescar vista para mantener consistencia de badges/tooltips
            if (typeof mostrarRegistrosChecador === 'function') mostrarRegistrosChecador(empleado);

            // Recalcular detectores si existen
            if (typeof detectarRetardos === 'function') detectarRetardos(empleado.clave, empleado.id_empresa);
            if (typeof detectarInasistencias === 'function') detectarInasistencias(empleado.clave, empleado.id_empresa);
            if (typeof detectarOlvidosChecador === 'function') detectarOlvidosChecador(empleado.clave, empleado.id_empresa);
            if (typeof detectarEntradasTempranas === 'function') detectarEntradasTempranas(empleado.clave, empleado.id_empresa);
            if (typeof detectarSalidasTardias === 'function') detectarSalidasTardias(empleado.clave, empleado.id_empresa);
            if (typeof detectarSalidasTempranas === 'function') detectarSalidasTempranas(empleado.clave, empleado.id_empresa);
            if (typeof detectarPermisosYComida === 'function') detectarPermisosYComida(empleado.clave, empleado.id_empresa);

            // Actualizar valores en el modal
            $('#mod-checador').val((empleado.checador || 0).toFixed(2));

            // Mostrar historiales actualizados
            if (typeof mostrarHistorialOlvidos === 'function') {
                mostrarHistorialOlvidos(empleado);
            }
            if (typeof mostrarOlvidosChecador === 'function') {
                mostrarOlvidosChecador(empleado);
            }
            if (typeof mostrarHistorialRetardos === 'function') {
                mostrarHistorialRetardos(empleado);
            }
            if (typeof mostrarRetardos === 'function') {
                mostrarRetardos(empleado);
            }
            if (typeof mostrarHistorialInasistencias === 'function') {
                mostrarHistorialInasistencias(empleado);
            }
            if (typeof mostrarInasistencias === 'function') {
                mostrarInasistencias(empleado);
            }

            // Recalcular total a cobrar con los nuevos valores
            if (typeof calcularTotalCobrar === 'function') {
                calcularTotalCobrar(empleado);
            }

            // Actualizar sueldo a cobrar si el modal está abierto
            if (typeof calcularYMostrarSueldoACobrar === 'function') {
                calcularYMostrarSueldoACobrar();
            }

            // Persistir
            if (typeof saveNomina === 'function') saveNomina(jsonNominaConfianza);
        });
    });
}

habilitarEdicionRegistro();

// Habilita el botón "Agregar registro" para insertar una nueva fila (solo fecha y día)
function habilitarAgregarRegistro() {
    $(document).on('click', '.btn-agregar-registro', function (e) {
        e.preventDefault();
        const $btn = $(this);
        const clave = String($btn.data('clave') || '').trim();
        const fecha = String($btn.data('fecha') || '').trim();
        const idEmpresa = $('#campo-id-empresa').val() ? String($('#campo-id-empresa').val()).trim() : '';

        // Buscar empleado
        let empleado = null;
        if (typeof buscarEmpleadoPorClaveYEmpresa === 'function') {
            empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        }
        if (!empleado && window.jsonNominaConfianza && Array.isArray(jsonNominaConfianza.departamentos)) {
            jsonNominaConfianza.departamentos.forEach(depto => {
                (depto.empleados || []).forEach(emp => {
                    if (!empleado && String(emp.clave).trim() === String(clave).trim() && (idEmpresa === '' || String(emp.id_empresa).trim() === String(idEmpresa).trim())) {
                        empleado = emp;
                    }
                });
            });
        }
        if (!empleado) return;

        if (!Array.isArray(empleado.registros)) empleado.registros = [];

        const nuevoRegistro = {
            fecha: fecha || '-',
            entrada: '-',
            salida: '-'
        };

        const indexRegistro = parseInt($btn.data('index'), 10);
        if (!isNaN(indexRegistro) && indexRegistro >= 0 && indexRegistro < empleado.registros.length) {
            // Insertar después del registro actual
            empleado.registros.splice(indexRegistro + 1, 0, nuevoRegistro);
        } else {
            // Si no hay índice válido, agregar al final
            empleado.registros.push(nuevoRegistro);
        }

        // Persistir y refrescar la vista del checador
        if (typeof saveNomina === 'function') saveNomina(jsonNominaConfianza);
        if (typeof mostrarRegistrosChecador === 'function') mostrarRegistrosChecador(empleado);
    });
}

habilitarAgregarRegistro();

