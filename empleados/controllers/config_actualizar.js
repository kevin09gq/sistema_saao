$(document).ready(function () {
    const rutaRaiz = '/sistema_saao/';

    // Agregue esto BHL
    const $switch_horario_fijo = $("#modal_switchCheckHorarioFijo");
    const $tab_horarios = $("#tab-horarios");

    getDepartamentos();
    getAreas();
    obtenerDatosEmpleados();
    departamentoSeleccionado();
    areaSeleccionada();
    filtrosBusqueda();
    setValoresModal();
    initOrdenamiento();
    actualizarTotalPorcentaje();

    // Botón limpiar buscador de empleados
    $(document).off('click', '#btn-clear-buscador-empleado').on('click', '#btn-clear-buscador-empleado', function (e) {
        e.preventDefault();
        const $input = $('#buscadorEmpleado');
        $input.val('');
        // re-aplicar búsqueda usando la misma ruta que el input listener
        setBusqueda('');
        $input.focus();
    });

    // Calcular salario diario a partir del semanal en el modal
    $(document).on('input', '#modal_salario_semanal', function () {
        const val = parseFloat($(this).val());
        if (isNaN(val)) {
            $('#modal_salario_diario').val('');
        } else {
            const diario = val / 7;
            // $('#modal_salario_diario').val(diario.toFixed(2));
            $('#modal_salario_diario').val(diario);
        }
    });

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
    };

    // Función para actualizar el total de porcentajes de beneficiarios
    function actualizarTotalPorcentaje() {
        let total = 0;
        $('.porcentaje-beneficiario').each(function () {
            const valor = parseFloat($(this).val()) || 0;
            total += valor;
        });

        // Actualizar el campo de total
        $('#total_porcentaje_beneficiarios').val(total.toFixed(2));

        // Resaltar en rojo si no es 100%
        if (total > 0 && total !== 100) {
            $('#total_porcentaje_beneficiarios').addClass('is-invalid');
        } else {
            $('#total_porcentaje_beneficiarios').removeClass('is-invalid');
        }

        return total;
    }

    // Escuchar cambios en los inputs de porcentaje
    $(document).on('input', '.porcentaje-beneficiario', function () {
        // Asegurarse de que el valor esté entre 0 y 100
        let valor = parseFloat($(this).val()) || 0;
        if (valor < 0) valor = 0;
        if (valor > 100) valor = 100;
        $(this).val(valor);

        actualizarTotalPorcentaje();
    });

    // Manejar el botón de eliminar beneficiario
    $(document).on('click', '.btn-eliminar-beneficiario', function () {
        const $fila = $(this).closest('tr');

        // Limpiar todos los campos de la fila
        $fila.find('input[name="beneficiario_nombre[]"]').val('');
        $fila.find('input[name="beneficiario_ap_paterno[]"]').val('');
        $fila.find('input[name="beneficiario_ap_materno[]"]').val('');
        $fila.find('input[name="beneficiario_parentesco[]"]').val('');
        $fila.find('input[name="beneficiario_porcentaje[]"]').val('');

        // Eliminar el campo oculto del ID si existe
        $fila.find('input[name="beneficiario_id[]"]').remove();

        // Remover clases de validación
        $fila.find('input').removeClass('border-success border-danger');

        // Actualizar el total de porcentajes
        actualizarTotalPorcentaje();
    });

    // Manejar el botón de eliminar horario oficial
    $(document).on('click', '.btn-eliminar-horario-oficial', function () {
        const $fila = $(this).closest('tr');

        $fila.find('select[name="horario_oficial_dia[]"]').val('');
        $fila.find('input[name="horario_oficial_entrada[]"]').val('');
        $fila.find('input[name="horario_oficial_salida_comida[]"]').val('');
        $fila.find('input[name="horario_oficial_entrada_comida[]"]').val('');
        $fila.find('input[name="horario_oficial_salida[]"]').val('');

        // Remover clases de validación
        $fila.find('input').removeClass('border-success border-danger');
    });

    // Helper: Formatea 'YYYY-MM-DD' a 'DD/MM/YYYY'
    function formatToDMY(dateStr) {
        if (!dateStr) return '';
        // Intentar dividir por '-'
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const [y, m, d] = parts;
            if (y && m && d) {
                const dd = d.padStart(2, '0');
                const mm = m.padStart(2, '0');
                return `${dd}/${mm}/${y}`;
            }
        }
        // Fallback por si viene en otro formato interpretable por Date
        const dt = new Date(dateStr);
        if (!isNaN(dt)) {
            const dd = String(dt.getDate()).padStart(2, '0');
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const yyyy = dt.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        }
        return dateStr;
    }

    // Helper: Convierte 'DD/MM/YYYY' o 'YYYY-MM-DD' a 'YYYY-MM-DD'
    function toYMD(dateStr) {
        if (!dateStr) return '';
        const trimmed = String(dateStr).trim();
        // Si ya viene en Y-M-D
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
        // Si viene en D/M/Y
        const m = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (m) {
            const dd = m[1].padStart(2, '0');
            const mm = m[2].padStart(2, '0');
            const yyyy = m[3];
            return `${yyyy}-${mm}-${dd}`;
        }
        // Fallback usando Date
        const dt = new Date(trimmed.replace(/\//g, '-'));
        if (!isNaN(dt)) {
            const dd = String(dt.getDate()).padStart(2, '0');
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const yyyy = dt.getFullYear();
            return `${yyyy}-${mm}-${dd}`;
        }
        return trimmed;
    }

    // Helper: Formatea 'YYYY-MM-DD' a 'DD/Mon/YYYY' (Mon en español, ej: Jun)
    function formatToDMonY(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        const monthsEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        if (parts.length === 3) {
            const [y, m, d] = parts;
            if (y && m && d) {
                const dd = d.padStart(2, '0');
                const mmIndex = parseInt(m, 10) - 1;
                if (mmIndex >= 0 && mmIndex < 12) {
                    const mon = monthsEs[mmIndex];
                    return `${dd}/${mon}/${y}`;
                }
            }
        }
        const dt = new Date(dateStr);
        if (!isNaN(dt)) {
            const dd = String(dt.getDate()).padStart(2, '0');
            const mon = monthsEs[dt.getMonth()];
            const yyyy = dt.getFullYear();
            return `${dd}/${mon}/${yyyy}`;
        }
        return dateStr;
    }

    // Helper: Convierte 'DD/Mon/YYYY' o 'YYYY-MM-DD' a 'YYYY-MM-DD'
    function dMonYToYMD(dateStr) {
        if (!dateStr) return '';
        const trimmed = String(dateStr).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
        const monthsEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const parts = trimmed.split('/');
        if (parts.length === 3) {
            const [d, mon, y] = parts;
            const mmIndex = monthsEs.findIndex(m => m.toLowerCase() === mon.toLowerCase());
            if (mmIndex !== -1) {
                const dd = d.padStart(2, '0');
                const mm = String(mmIndex + 1).padStart(2, '0');
                return `${y}-${mm}-${dd}`;
            }
        }
        return toYMD(trimmed);
    }

    // Función para actualizar el input de fecha alta empresa con la fecha más reciente del historial
    function actualizarFechaAltaEmpresaDesdeHistorial() {
        const $tbody = $('#tbody_historial_reingresos');
        const filas = $tbody.find('tr');
        
        // Verificar si hay registros en el historial
        if (filas.length > 0 && !filas.first().find('td').attr('colspan')) {
            let fechaMasReciente = null;
            
            // Recorrer las filas para encontrar la fecha más reciente sin fecha de salida
            filas.each(function() {
                const $btnEdit = $(this).find('.btn-editar-historial');
                if ($btnEdit.length > 0) {
                    const fechaSalidaTxt = $(this).children('td').eq(2).text().trim();
                    const fechaReingresoTxt = $(this).children('td').eq(1).text().trim();
                    
                    // Si no tiene fecha de salida (está activo), usar esta fecha
                    if (!fechaSalidaTxt || fechaSalidaTxt === '') {
                        fechaMasReciente = toYMD(fechaReingresoTxt);
                    }
                }
            });
            
            // Si no hay registro activo, buscar el último reingreso (el más reciente)
            if (!fechaMasReciente) {
                let ultimaFechaReingreso = null;
                filas.each(function() {
                    const $btnEdit = $(this).find('.btn-editar-historial');
                    if ($btnEdit.length > 0) {
                        const fechaReingresoTxt = $(this).children('td').eq(1).text().trim();
                        const fechaReingresoYMD = toYMD(fechaReingresoTxt);
                        
                        if (!ultimaFechaReingreso || new Date(fechaReingresoYMD) > new Date(ultimaFechaReingreso)) {
                            ultimaFechaReingreso = fechaReingresoYMD;
                        }
                    }
                });
                fechaMasReciente = ultimaFechaReingreso;
            }
            
            // Si encontramos una fecha, actualizar el input
            if (fechaMasReciente) {
                $("#modal_fecha_alta_empresa").prop('type', 'text').val(formatToDMonY(fechaMasReciente));
            }
        }
    }

    // ===================================================
    // Funciones para obtener datos de selects con filtros
    // ===================================================

    // Obtener áreas para el modal
    function obtenerAreasModal() {
        $.ajax({
            type: "GET",
            url: rutaRaiz + "public/php/obtenerAreas.php",
            success: function (response) {
                let areas = JSON.parse(response);
                let opciones = `<option value="0">Ninguna</option>`;

                areas.forEach((element) => {
                    opciones += `<option value="${element.id_area}">${element.nombre_area}</option>`;
                });

                $("#modal_area").html(opciones);
            },
            error: function () {
                console.error('Error al obtener áreas');
            }
        });
    }

    // Obtener departamentos para el modal (con filtro opcional por área)
    function obtenerDepartamentosModal(idArea = null) {
        let ajaxConfig = {
            url: rutaRaiz + "public/php/obtenerDepartamentos.php",
            success: function (response) {
                let departamentos = JSON.parse(response);
                let opciones = `<option value="0">Ninguno</option>`;

                departamentos.forEach((element) => {
                    opciones += `<option value="${element.id_departamento}">${element.nombre_departamento}</option>`;
                });

                $("#modal_departamento").html(opciones);
            },
            error: function () {
                console.error('Error al obtener departamentos');
            }
        };

        // Si se proporciona idArea, hacer POST con filtro
        if (idArea && idArea != "0") {
            ajaxConfig.type = "POST";
            ajaxConfig.data = { id_area: idArea };
        } else {
            ajaxConfig.type = "GET";
        }

        $.ajax(ajaxConfig);
    }

    // Obtener puestos para el modal (con filtro opcional por departamento)
    function obtenerPuestosModal(idDepartamento = null) {
        let ajaxConfig = {
            url: rutaRaiz + "public/php/obtenerPuestos.php",
            success: function (response) {
                let puestos = JSON.parse(response);
                let opciones = `<option value="0">Ninguno</option>`;

                puestos.forEach((element) => {
                    opciones += `<option value="${element.id_puestoEspecial}">${element.nombre_puesto}</option>`;
                });

                $("#modal_puesto").html(opciones);
            },
            error: function (error) {
                console.error('Error al obtener puestos:', error);
            }
        };

        // Si se proporciona idDepartamento, hacer POST con filtro
        if (idDepartamento && idDepartamento != "0") {
            ajaxConfig.type = "POST";
            ajaxConfig.data = { id_departamento: idDepartamento };
        } else {
            ajaxConfig.type = "GET";
        }

        $.ajax(ajaxConfig);
    }

    // ===================================================
    // Eventos de cascada para los selects del modal
    // ===================================================

    // Cuando se selecciona un área en el modal
    $(document).on('change', '#modal_area', function () {
        const idArea = $(this).val();

        if (idArea && idArea !== "0") {
            // Cargar departamentos filtrados por área
            obtenerDepartamentosModal(idArea);
            // Limpiar y resetear el select de puestos
            $('#modal_puesto').html('<option value="0">Ninguno</option>');
        } else {
            // Si no hay área, cargar todos los departamentos
            obtenerDepartamentosModal();
            $('#modal_puesto').html('<option value="0">Ninguno</option>');
        }
    });

    // Cuando se selecciona un departamento en el modal
    $(document).on('change', '#modal_departamento', function () {
        const idDepartamento = $(this).val();

        if (idDepartamento && idDepartamento !== "0") {
            // Cargar puestos filtrados por departamento
            obtenerPuestosModal(idDepartamento);
        } else {
            // Si no hay departamento, cargar todos los puestos
            obtenerPuestosModal();
        }
    });

    /**
     * Obtener áreas para el filtro principal
     */
    function getAreas() {
        $.ajax({
            type: "GET",
            url: rutaRaiz + "public/php/obtenerAreas.php",
            success: function (response) {
                if (!response.error) {
                    let areas = JSON.parse(response);
                    let opciones = `<option value=\"0\">Seleccionar Area</option>`;
                    areas.forEach((element) => {
                        opciones += `
                        <option value=\"${element.id_area}\">${element.nombre_area}</option> `;
                    });
                    $("#filtroArea").html(opciones);

                }

            }
        });
    }

    // Se Obtienen los departamentos para el filtro principal
    function getDepartamentos(id_area = null) {
        $.ajax({
            type: "GET",
            url: rutaRaiz + "public/php/obtenerDepartamentos.php",
            data: { id_area: id_area },
            success: function (response) {
                if (!response.error) {
                    let departamentos = JSON.parse(response);
                    let opciones = `<option value=\"0\">Seleccionar Departamento</option>
                                    <option value=\"1000\">Sin Seguro</option>`;
                    departamentos.forEach((element) => {
                        opciones += `
                        <option value=\"${element.id_departamento}\">${element.nombre_departamento}</option> `;
                    });
                    $("#filtroDepartamento").html(opciones);

                }

            }
        });

        // Recoger horarios oficiales
        let horarios_oficiales = [];
        $('input[name="horario_oficial_dia[]"]').each(function (index) {
            const dia = $(this).val().trim();
            const entrada = $('input[name="horario_oficial_entrada[]"]').eq(index).val().trim();
            const salida_comida = $('input[name="horario_oficial_salida_comida[]"]').eq(index).val().trim();
            const entrada_comida = $('input[name="horario_oficial_entrada_comida[]"]').eq(index).val().trim();
            const salida = $('input[name="horario_oficial_salida[]"]').eq(index).val().trim();

            if (dia || entrada || salida_comida || entrada_comida || salida) {
                horarios_oficiales.push({
                    dia: dia || "",
                    entrada: entrada || "",
                    salida_comida: salida_comida || "",
                    entrada_comida: entrada_comida || "",
                    salida: salida || ""
                });
            }
        });
    }

    // Obtener datos de empleados
    function obtenerDatosEmpleados() {
        $.ajax({
            type: "POST",
            url: "../php/obtenerEmpleados.php",
            data: {
                accion: "cargarEmpleados",
            },
            dataType: "json",
            success: function (empleados) {

                setEmpleadosData(empleados);
            },
            error: function (xhr, status, error) {

            }
        });
    }


    function areaSeleccionada() {
        $('#filtroArea').change(function (e) {
            e.preventDefault();
            let idArea = $(this).val();
            let idDepartamento = $("#filtroDepartamento").val(); // Obtener el departamento seleccionado para mantener el filtro
            // Filtrar departamentos del select
            getDepartamentos(idArea);
            // Filtrar la tabla de acuerdo al area
            setFiltroArea(idArea, "0");
            // Limpia la barra de busqueda
            $("#buscadorEmpleado").val("");
            setBusqueda(""); // Resetea búsqueda
        });
    }

    function departamentoSeleccionado() {
        // Si quieres recargar empleados al cambiar el filtro de departamento:
        $("#filtroDepartamento").on("change", function () {

            let idArea = $("#filtroArea").val(); // Obtener el área seleccionada para mantener el filtro
            let idDepartamento = $(this).val();

            setFiltroDepartamento(idDepartamento, idArea);
            $("#buscadorEmpleado").val(""); // Opcional: limpia el buscador al cambiar departamento
            setBusqueda(""); // Resetea búsqueda
        });
    }


    function filtrosBusqueda(param) {

        $("#buscadorEmpleado").on("input", function () {
            setBusqueda($(this).val());
        });


        // Manejar el cambio de estado con el switch de NSS
        $(document).on("change", ".switch-nss", function () {
            let idEmpleado = $(this).data("id-empleado");
            let isChecked = $(this).is(":checked");
            let statusNss = isChecked ? 1 : 0; // 1 = Activo, 0 = Inactivo

            // Verificar si el switch está deshabilitado (por IMSS vacío)
            if ($(this).is(':disabled')) {
                return; // No hacer nada si está deshabilitado
            }

            // Evitar doble click y desactivar visualmente
            const $el = $(this);
            if ($el.data('processing')) return;
            $el.data('processing', true).addClass('disabled').css('pointer-events', 'none').css('opacity', '0.6');

            let datos = {
                id_empleado: idEmpleado,
                status_nss: statusNss
            };

            $.ajax({
                type: "POST",
                url: "../php/estatus_nss.php",
                data: datos,
                dataType: "json",
                success: function (response) {
                    if (response.success) {
                        // Guardar el cambio en el objeto de cambios
                        window.nssCambios[idEmpleado] = statusNss;

                        // Actualizar el estado en los datos locales si existe
                        const empleadoIndex = empleadosData.findIndex(emp => emp.id_empleado == idEmpleado);
                        if (empleadoIndex !== -1) {
                            empleadosData[empleadoIndex].status_nss = statusNss;
                        }

                        // Si estamos en la vista de "Sin Seguro", recargar la tabla
                        if ($('#filtroDepartamento').val() === "1000") {
                            renderTablaEmpleados();
                        }
                    } else {
                        // Revertir el estado del switch si falla
                        $el.prop('checked', !isChecked);
                    }
                    $el.data('processing', false).removeClass('disabled').css('pointer-events', '').css('opacity', '');
                },
                error: function () {
                    // Revertir el estado del switch si hay error
                    $el.prop('checked', !isChecked);
                    $el.data('processing', false).removeClass('disabled').css('pointer-events', '').css('opacity', '');
                }
            });
        });

        // Abrir modal de edición con datos de la fila
        $(document).on('click', '.btn-editar-historial', function () {

            const idHist = $(this).data('id-historial');
            const $fila = $(this).closest('tr');
            const fechaReingreso = ($fila.children('td').eq(1).text() || '').trim();
            const fechaSalida = ($fila.children('td').eq(2).text() || '').trim();
            const frYmd = toYMD(fechaReingreso);
            const fsYmd = toYMD(fechaSalida);

            $('#modal_hist_id_historial').val(idHist);
            $('#modal_hist_fecha_reingreso').val(frYmd);
            $('#modal_hist_fecha_salida').val(fsYmd);

            $('#modal_historial_reingreso').modal('show');
        });

        // Guardar cambios del reingreso
        $(document).on('click', '#btn_guardar_historial', function () {
            const idHist = $('#modal_hist_id_historial').val();
            const fechaReingreso = $('#modal_hist_fecha_reingreso').val();
            const fechaSalida = $('#modal_hist_fecha_salida').val(); // puede ir vacío => NULL en backend

            if (!fechaReingreso) {
                Swal.fire({
                    title: 'ADVERTENCIA',
                    text: 'La fecha de reingreso es obligatoria.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            // Obtener fecha de alta de la empresa
            const fechaAltaEmpresa = dMonYToYMD($('#modal_fecha_alta_empresa').val());
            if (!fechaAltaEmpresa) {
                Swal.fire({
                    title: 'ADVERTENCIA',
                    text: 'Debe definir primero la fecha de alta de la empresa.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            // Verificar si es el último registro del historial (el más reciente)
            const $filaEditando = $(`#tbody_historial_reingresos .btn-editar-historial[data-id-historial='${idHist}']`).closest('tr');
            const esUltimoRegistro = $filaEditando.is(':last-child');
            
            // Solo validar contra fecha de alta empresa si NO es el último registro
            if (!esUltimoRegistro) {
                if (new Date(fechaReingreso) < new Date(fechaAltaEmpresa)) {
                    Swal.fire({
                        title: 'ERROR',
                        text: `La fecha de reingreso no puede ser anterior a la fecha de alta de la empresa (${formatToDMY(fechaAltaEmpresa)}).`,
                        icon: 'error',
                        confirmButtonText: 'Entendido'
                    });
                    return;
                }

                if (fechaSalida && new Date(fechaSalida) < new Date(fechaAltaEmpresa)) {
                    Swal.fire({
                        title: 'ERROR',
                        text: `La fecha de salida no puede ser anterior a la fecha de alta de la empresa (${formatToDMY(fechaAltaEmpresa)}).`,
                        icon: 'error',
                        confirmButtonText: 'Entendido'
                    });
                    return;
                }
            }

            // Construir los intervalos cronológicos propuestos para validación en frontend
            const intervals = [];
            let errorMsg = null;

            $('#tbody_historial_reingresos tr').each(function () {
                const $btnEdit = $(this).find('.btn-editar-historial');
                if ($btnEdit.length === 0) return; // Fila "Sin registros"

                const idHistRow = $btnEdit.data('id-historial').toString();

                let entrada, salida;
                if (idHistRow === idHist) {
                    entrada = fechaReingreso;
                    salida = fechaSalida || null;
                } else {
                    const entradaTxt = $(this).children('td').eq(1).text().trim();
                    const salidaTxt = $(this).children('td').eq(2).text().trim();
                    entrada = toYMD(entradaTxt);
                    salida = salidaTxt ? toYMD(salidaTxt) : null;
                }

                intervals.push({
                    id: idHistRow,
                    entrada: entrada,
                    salida: salida
                });
            });

            if (idHist === '') {
                intervals.push({
                    id: 'nuevo',
                    entrada: fechaReingreso,
                    salida: fechaSalida || null
                });
            }

            // Ordenar intervalos
            intervals.sort((a, b) => new Date(a.entrada) - new Date(b.entrada));

            // Validar traslapes y orden lógico
            for (let i = 0; i < intervals.length; i++) {
                const cur = intervals[i];
                if (cur.salida && new Date(cur.salida) < new Date(cur.entrada)) {
                    errorMsg = `La fecha de salida (${formatToDMY(cur.salida)}) no puede ser anterior a la de entrada/reingreso (${formatToDMY(cur.entrada)}).`;
                    break;
                }

                if (i < intervals.length - 1) {
                    const next = intervals[i + 1];
                    if (!cur.salida) {
                        errorMsg = `No se puede registrar un reingreso posterior si el periodo anterior aún no tiene fecha de salida.`;
                        break;
                    }
                    if (new Date(next.entrada) <= new Date(cur.salida)) {
                        errorMsg = `Las fechas no pueden sobreponerse. El siguiente reingreso (${formatToDMY(next.entrada)}) debe ser posterior a la salida anterior (${formatToDMY(cur.salida)}).`;
                        break;
                    }
                }
            }

            if (errorMsg) {
                Swal.fire({
                    title: 'ERROR',
                    text: errorMsg,
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            // Si hay idHist => editar. Si está vacío => crear (nuevoReingreso)
            const isCreate = !idHist;
            const payload = isCreate
                ? {
                    accion: 'nuevoReingreso',
                    id_empleado: $('#empleado_id').val(),
                    fecha_reingreso: fechaReingreso,
                    fecha_salida: fechaSalida
                }
                : {
                    accion: 'editarReingreso',
                    id_historial: idHist,
                    fecha_reingreso: fechaReingreso,
                    fecha_salida: fechaSalida
                };

            $.ajax({
                type: 'POST',
                url: '../php/obtenerEmpleados.php',
                data: payload,
                success: function (resp) {
                    let parsedResp = resp;
                    if (typeof resp === 'string') {
                        try {
                            parsedResp = JSON.parse(resp);
                        } catch (e) { }
                    }

                    if (parsedResp && parsedResp.success === false) {
                        Swal.fire({
                            title: 'ERROR',
                            text: parsedResp.message || 'Error de validación.',
                            icon: 'error',
                            confirmButtonText: 'Entendido'
                        });
                        return;
                    }

                    const $tbody = $('#tbody_historial_reingresos');
                    if (!isCreate) {
                        if (resp == true || resp === '1') {
                            const $btn = $(`#tbody_historial_reingresos .btn-editar-historial[data-id-historial='${idHist}']`);
                            const $fila = $btn.closest('tr');
                            $fila.children('td').eq(1).text(fechaReingreso);
                            $fila.children('td').eq(2).text(fechaSalida);

                            //Formatear fechas a DD/MM/YYYY
                            const frTxt = $fila.children('td').eq(1).text();
                            const fsTxt = $fila.children('td').eq(2).text();
                            $fila.children('td').eq(1).text(formatToDMY(frTxt));
                            $fila.children('td').eq(2).text(formatToDMY(fsTxt));

                            $('#modal_historial_reingreso').modal('hide');
                            obtenerDatosEmpleados();
                            
                            // Actualizar el input de fecha alta empresa con la fecha más reciente del historial
                            actualizarFechaAltaEmpresaDesdeHistorial();
                        }
                    } else {
                        const newId = (resp || '').toString().trim();
                        if (newId && newId !== 'false' && newId !== '0') {
                            // Limpiar "Sin registros" si existe
                            const $first = $tbody.find('tr').first();
                            if ($first.find('td').length === 1 && $first.find('td').attr('colspan')) {
                                $tbody.empty();
                            }
                            const idx = $tbody.find('tr').length + 1;
                            const frFmt = formatToDMY(fechaReingreso);
                            const fsFmt = formatToDMY(fechaSalida || '');
                            const nuevaFila = `
                            <tr>
                                <td>${idx}</td>
                                <td>${frFmt}</td>
                                <td>${fsFmt}</td>
                                <td>
                                    <button type="button" class="btn btn-danger btn-sm btn-eliminar-historial" data-id-historial="${newId}">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                    <button type="button" class="btn btn-warning btn-sm btn-editar-historial" data-id-historial="${newId}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                </td>
                            </tr>`;
                            $tbody.append(nuevaFila);
                            $('#modal_historial_reingreso').modal('hide');
                            obtenerDatosEmpleados();
                            
                            // Actualizar el input de fecha alta empresa con la fecha más reciente del historial
                            actualizarFechaAltaEmpresaDesdeHistorial();
                        }
                    }
                },
                error: function () {
                    // No mostrar ningún mensaje
                }
            });
        });

        // Abrir modal vacío para crear nuevo reingreso
        $(document).on('click', '#btn_nuevo_reingreso', function () {
            $('#modal_hist_id_historial').val('');

            // Si no hay registros registrados, pre-poblar con la fecha de alta de la empresa
            const numFilas = $('#tbody_historial_reingresos tr').length;
            const sinRegistros = $('#tbody_historial_reingresos tr').first().find('td').attr('colspan') !== undefined;
            if (numFilas === 0 || sinRegistros) {
                const fechaAlta = dMonYToYMD($('#modal_fecha_alta_empresa').val());
                $('#modal_hist_fecha_reingreso').val(fechaAlta);
            } else {
                $('#modal_hist_fecha_reingreso').val('');
            }

            $('#modal_hist_fecha_salida').val('');
            $('#modal_historial_reingreso').modal('show');
        });

        $("#activos-tab").on("click", function () {
            setFiltroEstado("Activo");
        });
        $("#inactivos-tab").on("click", function () {
            setFiltroEstado("Baja");
        });
        $("#all-tab").on("click", function () {
            setFiltroEstado("Todos");
        });

    }

    function validarDatos(selector, validacion) {
        $(selector).on('input', function () {
            const valor = $(this).val();

            // Quita clases anteriores
            $(this).removeClass('border-success border-danger');

            // Si está vacío, no aplica ninguna clase
            if (valor === "") return;

            // Aplica validación directa sin trim
            const isValid = validacion(valor);
            $(this).addClass(isValid ? 'border-success' : 'border-danger');
        });
    }


    function validarCampos(selector, validar) {
        let valorCampo = selector.val();
        if (valorCampo === "") {
            $(selector).removeClass("border-danger");
            $(selector).removeClass("border-success");
            return;

        }
        if (validar(valorCampo)) {
            $(selector).removeClass("border-danger");
            $(selector).addClass("border-success");

        } else {
            $(selector).removeClass("border-success");
            $(selector).addClass("border-danger");

        }

    }

    /**
     * Función para formatear números de manera flexible:
     * - Si el número es 0, muestra un guion "0"
     * - Si el número tiene más de 2 decimales y no son ceros, muestra todos los decimales significativos
     * - En caso contrario, muestra el número con máximo 2 decimales
     * @param {Number} valor 
     * @returns 
     */
    function formatoFlexible(valor) {
        // Convertimos a número
        let numero = parseFloat(valor);

        // Si no hay salario (null, vacío, NaN) o es cero → retorna ''
        if (!valor || isNaN(numero) || numero === 0) {
            return '';
        }

        // Convertimos a string para analizar decimales
        let str = numero.toString();

        // Si tiene más de dos decimales y no son ceros, lo dejamos tal cual
        if (str.includes(".")) {
            let [entero, decimales] = str.split(".");
            if (decimales.length > 2 && !/^0+$/.test(decimales.slice(2))) {
                return str; // conserva todos los decimales significativos
            }
        }

        // En caso contrario, mostramos con máximo dos decimales
        return numero.toFixed(2);
    }



    /**
     * ================================================
     * Función para abrir el modal de actualización
     * y poblar los campos con los valores del empleado
     * ================================================
     */
    function setValoresModal(params) {
        $(document).on("click", ".btn-actualizar", function () {
            let idEmpleado = $(this).data("id");
            let claveEmpleado = $(this).data("clave");

            // Cuando se abra el formulario se reinicia
            $("#form_modal_actualizar_empleado").trigger("reset");

            let data = {
                id_empleado: idEmpleado,
                clave_empleado: claveEmpleado,
                accion: "dataEmpleado"
            };

            // Primero obtenemos los datos del empleado
            $.ajax({
                type: "POST",
                url: "../php/obtenerEmpleados.php",
                data: data,
                success: function (empleado) {
                    if (!empleado.error) {

                        // Extraemos todos los datos del empleado incluyendo los nuevos campos
                        let nombreEmpleado = empleado.nombre_empleado;
                        let apPaternoEmpleado = empleado.apellido_paterno_empleado;
                        let apMaternoEmpleado = empleado.apellido_materno_empleado;
                        let domicilioEmpleado = empleado.domicilio_empleado;
                        let imssEmpleado = empleado.imss;
                        let curpEmpleado = empleado.curp;
                        let sexoEmpleado = empleado.sexo;
                        let grupoSanguineo = empleado.grupo_sanguineo;
                        let enfermedades = empleado.enfermedades_alergias;
                        let fechaAltaEmpresa = empleado.fecha_alta_empresa;
                        let fechaAltaImss = empleado.fecha_alta_imss;
                        let idDepartamentoEmpleado = empleado.id_departamento;

                        // Nuevos campos
                        let fechaNacimiento = empleado.fecha_nacimiento;
                        let numCasillero = empleado.num_casillero;
                        let idEmpresa = empleado.id_empresa;
                        let idArea = empleado.id_area;
                        let idPuesto = empleado.id_puesto;
                        // Traer biométrico
                        let biometrico = empleado.biometrico;
                        let telefonoEmpleado = empleado.telefono_empleado;
                        // Traer status NSS
                        let statusNss = empleado.status_nss;
                        // Nuevos campos RFC y estado civil
                        let rfcEmpleado = empleado.rfc_empleado;
                        let estadoCivil = empleado.estado_civil;

                        // Campos de salario
                        let salarioSemanal = empleado.salario_semanal;
                        let salarioDiario = formatoFlexible(empleado.salario_diario);

                        // Obtener la última fecha de reingreso
                        let ultimaFechaReingreso = empleado.ultima_fecha_reingreso;
                        
                        // Obtener la fecha alta empresa actual (la más reciente del historial o la original)
                        let fechaAltaEmpresaActual = empleado.fecha_alta_empresa_actual || fechaAltaEmpresa;

                        let nombreContacto = empleado.nombre_contacto;
                        let apPaternoContacto = empleado.apellido_paterno_contacto;
                        let apMaternoContacto = empleado.apellido_materno_contacto;
                        let telefonoContacto = empleado.telefono_contacto;
                        let domicilioContacto = empleado.domicilio_contacto;
                        let parentescoContacto = empleado.parentesco;

                        // Obtener el valor del switch de horario fijo
                        let horarioFijo = empleado.horario_fijo;
                        // Inicializar el estado del switch según horarioFijo
                        if (horarioFijo == 1) {
                            $switch_horario_fijo.prop("checked", true);
                            $tab_horarios.prop("disabled", false); // habilita el tab 
                        } else {
                            $switch_horario_fijo.prop("checked", false);
                            $tab_horarios.prop("disabled", true); // deshabilita el tab 
                        }

                        $("#label-nombre-empleado").text(nombreEmpleado + " " + apPaternoEmpleado + " " + apMaternoEmpleado);

                        // Asignamos los valores a los inputs del modal
                        $("#empleado_id").val(idEmpleado);
                        $("#modal_clave_empleado").val(claveEmpleado);
                        $("#modal_nombre_empleado").val(nombreEmpleado);
                        $("#modal_apellido_paterno").val(apPaternoEmpleado);
                        $("#modal_apellido_materno").val(apMaternoEmpleado);
                        $("#modal_domicilio").val(domicilioEmpleado);
                        $("#modal_imss").val(imssEmpleado);
                        $("#modal_curp").val(curpEmpleado);
                        $("#modal_sexo").val(sexoEmpleado);
                        $("#modal_grupo_sanguineo").val(grupoSanguineo);
                        $("#modal_enfermedades_alergias").val(enfermedades);
                        // La fecha alta empresa se asigna al input correspondiente (usando la fecha más reciente del historial)
                        $("#modal_fecha_alta_empresa").prop('type', 'text').val(formatToDMonY(fechaAltaEmpresaActual));
                        // Fecha alta IMSS
                        $("#modal_fecha_alta_imss").prop('type', 'text').val(formatToDMonY(fechaAltaImss));
                        // Vista de Fecha Ingreso IMSS en pestaña Trabajador (solo lectura)
                        $("#modal_fecha_ingreso_imss_vista").prop('type', 'text').val(formatToDMonY(fechaAltaImss));
                        // Nuevos campos
                        $("#modal_fecha_nacimiento").val(fechaNacimiento);
                        mostrarEdadEmpleado(fechaNacimiento);
                        $("#modal_num_casillero").val(numCasillero);
                        // Asignar biométrico
                        $("#modal_biometrico").val(biometrico);
                        $("#modal_telefono_empleado").val(telefonoEmpleado);
                        // Asignar RFC y estado civil
                        $("#modal_rfc").val(rfcEmpleado);
                        $("#modal_estado_civil").val(estadoCivil);

                        // Asignar la última fecha de reingreso si existe
                        if (ultimaFechaReingreso) {
                            $("#modal_fecha_reingreso").val(ultimaFechaReingreso);
                        } else {
                            $("#modal_fecha_reingreso").val("");
                        }

                        // Campos de salario
                        $("#modal_salario_semanal").val(salarioSemanal);
                        $("#modal_salario_diario").val(salarioDiario);

                        $("#modal_emergencia_nombre").val(nombreContacto);
                        $("#modal_emergencia_ap_paterno").val(apPaternoContacto);
                        $("#modal_emergencia_ap_materno").val(apMaternoContacto);
                        $("#modal_emergencia_telefono").val(telefonoContacto);
                        $("#modal_emergencia_domicilio").val(domicilioContacto);
                        $("#modal_emergencia_parentesco").val(parentescoContacto);

                        // Poblar la tabla de Reingresos en el modal
                        try {
                            const historial = Array.isArray(empleado.historial) ? empleado.historial : [];
                            const $tbodyReingresos = $('#tbody_historial_reingresos');
                            if ($tbodyReingresos.length) {
                                let filas = '';
                                if (historial.length === 0) {
                                    filas = '<tr><td colspan="4" class="text-center">Sin registros</td></tr>';
                                } else {
                                    historial.forEach((item, idx) => {
                                        const fechaReingreso = item.fecha_reingreso || '';
                                        const fechaSalida = item.fecha_salida || '';
                                        const frFmt = formatToDMY(fechaReingreso);
                                        const fsFmt = formatToDMY(fechaSalida);
                                        filas += `
                                            <tr>
                                                <td>${idx + 1}</td>
                                                <td>${frFmt}</td>
                                                <td>${fsFmt}</td>
                                                <td>
                                                    <button type="button" class="btn btn-danger btn-sm btn-eliminar-historial" data-id-historial="${item.id_historial}">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                    <button type="button" class="btn btn-warning btn-sm btn-editar-historial" data-id-historial="${item.id_historial}">
                                                        <i class="bi bi-pencil"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    });
                                }
                                $tbodyReingresos.html(filas);
                            }
                        } catch (e) {


                        }

                        // Cargar empresas
                        $.ajax({
                            type: "GET",
                            url: rutaRaiz + "public/php/obtenerEmpresa.php",
                            success: function (response) {
                                let empresas = JSON.parse(response);
                                let opciones = `<option value="0">Ninguna</option>`;

                                empresas.forEach((element) => {
                                    opciones += `<option value="${element.id_empresa}">${element.nombre_empresa}</option>`;
                                });

                                $("#modal_empresa").html(opciones);
                                if (!idEmpresa || idEmpresa === "0") {
                                    $("#modal_empresa").val("0");
                                } else {
                                    $("#modal_empresa").val(idEmpresa);
                                }
                            }
                        });

                        // ============================================================
                        // Cargar áreas, departamentos y puestos en cascada
                        // ============================================================

                        // Paso 1: Cargar áreas
                        $.ajax({
                            type: "GET",
                            url: rutaRaiz + "public/php/obtenerAreas.php",
                            success: function (response) {
                                let areas = JSON.parse(response);
                                let opciones = `<option value="0">Ninguna</option>`;

                                areas.forEach((element) => {
                                    opciones += `<option value="${element.id_area}">${element.nombre_area}</option>`;
                                });

                                $("#modal_area").html(opciones);

                                // Seleccionar el área del empleado
                                if (!idArea || idArea === "0") {
                                    $("#modal_area").val("0");
                                    // Si no hay área, cargar todos los departamentos
                                    cargarDepartamentosYSeleccionar(null, idDepartamentoEmpleado, idPuesto);
                                } else {
                                    $("#modal_area").val(idArea);
                                    // Cargar departamentos filtrados por área
                                    cargarDepartamentosYSeleccionar(idArea, idDepartamentoEmpleado, idPuesto);
                                }
                            }
                        });

                        // Función auxiliar para cargar departamentos y luego puestos
                        function cargarDepartamentosYSeleccionar(idArea, idDepartamento, idPuesto) {
                            let ajaxConfig = {
                                url: rutaRaiz + "public/php/obtenerDepartamentos.php",
                                success: function (response) {
                                    let departamentos = JSON.parse(response);
                                    let opciones = `<option value="0">Ninguno</option>`;

                                    departamentos.forEach((element) => {
                                        opciones += `<option value="${element.id_departamento}">${element.nombre_departamento}</option>`;
                                    });

                                    $("#modal_departamento").html(opciones);

                                    // Seleccionar el departamento del empleado
                                    if (!idDepartamento || idDepartamento === "0") {
                                        $("#modal_departamento").val("0");
                                        // Si no hay departamento, cargar todos los puestos
                                        cargarPuestosYSeleccionar(null, idPuesto);
                                    } else {
                                        $("#modal_departamento").val(idDepartamento);
                                        // Cargar puestos filtrados por departamento
                                        cargarPuestosYSeleccionar(idDepartamento, idPuesto);
                                    }
                                }
                            };

                            // Filtrar por área si se proporciona
                            if (idArea && idArea !== "0") {
                                ajaxConfig.type = "POST";
                                ajaxConfig.data = { id_area: idArea };
                            } else {
                                ajaxConfig.type = "GET";
                            }

                            $.ajax(ajaxConfig);
                        }

                        // Función auxiliar para cargar puestos y seleccionar
                        function cargarPuestosYSeleccionar(idDepartamento, idPuesto) {
                            let ajaxConfig = {
                                url: rutaRaiz + "public/php/obtenerPuestos.php",
                                success: function (response) {
                                    let puestos = JSON.parse(response);
                                    let opciones = `<option value="0">Ninguno</option>`;

                                    puestos.forEach((element) => {
                                        opciones += `<option value="${element.id_puestoEspecial}">${element.nombre_puesto}</option>`;
                                    });

                                    $("#modal_puesto").html(opciones);

                                    // Seleccionar el puesto del empleado
                                    if (!idPuesto || idPuesto === "0") {
                                        $("#modal_puesto").val("0");
                                    } else {
                                        $("#modal_puesto").val(idPuesto);
                                    }
                                }
                            };

                            // Filtrar por departamento si se proporciona
                            if (idDepartamento && idDepartamento !== "0") {
                                ajaxConfig.type = "POST";
                                ajaxConfig.data = { id_departamento: idDepartamento };
                            } else {
                                ajaxConfig.type = "GET";
                            }

                            $.ajax(ajaxConfig);
                        }

                        // Poblar la tabla de beneficiarios en el modal
                        try {
                            const beneficiarios = Array.isArray(empleado.beneficiarios) ? empleado.beneficiarios : [];
                            const $tbodyBeneficiarios = $('#tbody_beneficiarios');

                            if ($tbodyBeneficiarios.length) {
                                // Limpiar todas las filas primero
                                $tbodyBeneficiarios.find('input').val('');
                                $tbodyBeneficiarios.find('input[type="hidden"]').remove(); // Limpiar campos ocultos previos

                                // Llenar con los datos de beneficiarios
                                beneficiarios.forEach((beneficiario, index) => {
                                    if (index < 5) { // Solo llenar las primeras 5 filas
                                        const $fila = $tbodyBeneficiarios.find('tr').eq(index);
                                        $fila.find('input[name="beneficiario_nombre[]"]').val(beneficiario.nombre_beneficiario || '');
                                        $fila.find('input[name="beneficiario_ap_paterno[]"]').val(beneficiario.apellido_paterno_beneficiario || '');
                                        $fila.find('input[name="beneficiario_ap_materno[]"]').val(beneficiario.apellido_materno_beneficiario || '');
                                        $fila.find('input[name="beneficiario_parentesco[]"]').val(beneficiario.parentesco || '');
                                        $fila.find('input[name="beneficiario_porcentaje[]"]').val(beneficiario.porcentaje || '');

                                        // Agregar campo oculto con el ID del beneficiario
                                        $fila.append(`<input type="hidden" name="beneficiario_id[]" value="${beneficiario.id_beneficiario || ''}">`);
                                    }
                                });

                                // Aplicar validaciones y formateo a campos de beneficiarios
                                $tbodyBeneficiarios.find('input[name="beneficiario_nombre[]"]').each(function () {
                                    validarDatos($(this), validarNombre);
                                    formatearMayusculas($(this));
                                });

                                $tbodyBeneficiarios.find('input[name="beneficiario_ap_paterno[]"]').each(function () {
                                    validarDatos($(this), validarApellido);
                                    formatearMayusculas($(this));
                                });

                                $tbodyBeneficiarios.find('input[name="beneficiario_ap_materno[]"]').each(function () {
                                    validarDatos($(this), validarApellido);
                                    formatearMayusculas($(this));
                                });

                                $tbodyBeneficiarios.find('input[name="beneficiario_parentesco[]"]').each(function () {
                                    validarDatos($(this), validarParentesco);
                                    formatearMayusculas($(this));
                                });
                            }
                        } catch (e) {

                        }

                        // Poblar la tabla de los horarios de reloj BHL
                        try {
                            // Obtener el día de descanso
                            let dia_descanso = empleado.dia_descanso;
                            const horarios = Array.isArray(empleado.horario_reloj) ? empleado.horario_reloj : [];
                            const $tbodyHorarios = $('#tbody_horarios');

                            if ($tbodyHorarios.length) {
                                // Limpiar todas las filas primero
                                $tbodyHorarios.find('input').val('');
                                $tbodyHorarios.find('select').prop('selectedIndex', 0); // resetear selects

                                // Llenar con los datos de horarios
                                horarios.forEach((horario, index) => {
                                    if (index < 7) { // Solo llenar las primeras 7 filas
                                        const $fila = $tbodyHorarios.find('tr').eq(index);

                                        // Ahora horario_dia es un select
                                        $fila.find('select[name="horario_dia[]"]').val(horario.dia || '');

                                        $fila.find('input[name="horario_entrada[]"]').val(horario.entrada || '');
                                        $fila.find('input[name="horario_salida_comida[]"]').val(horario.salida_comida || '');
                                        $fila.find('input[name="horario_entrada_comida[]"]').val(horario.entrada_comida || '');
                                        $fila.find('input[name="horario_salida[]"]').val(horario.salida || '');

                                        if (horario.descanso && horario.descanso == 1) {
                                            $fila.find('input[name="horario_descanso[]"]').prop('checked', true);
                                        } else {
                                            $fila.find('input[name="horario_descanso[]"]').prop('checked', false);
                                        }

                                    }
                                });
                            }
                        } catch (e) {
                            console.error("Error al cargar horarios:", e);
                        }


                        // Poblar la tabla de los horarios oficiales
                        try {
                            let horariosOf = [];
                            if (Array.isArray(empleado.horarios_oficiales)) {
                                horariosOf = empleado.horarios_oficiales;
                            } else if (empleado.horario_oficial) {
                                try { horariosOf = JSON.parse(empleado.horario_oficial); } catch (_) { horariosOf = []; }
                            }

                            const $tbodyHorariosOf = $('#tbody_horarios_oficiales');
                            if ($tbodyHorariosOf.length) {
                                $tbodyHorariosOf.find('input').val('');
                                horariosOf.forEach((h, index) => {
                                    if (index < 7) {
                                        const $fila = $tbodyHorariosOf.find('tr').eq(index);

                                        // Se cambio por un select
                                        $fila.find('select[name="horario_oficial_dia[]"]').val(h.dia || '');
                                        $fila.find('input[name="horario_oficial_entrada[]"]').val(h.entrada || '');
                                        $fila.find('input[name="horario_oficial_salida_comida[]"]').val(h.salida_comida || '');
                                        $fila.find('input[name="horario_oficial_entrada_comida[]"]').val(h.entrada_comida || '');
                                        $fila.find('input[name="horario_oficial_salida[]"]').val(h.salida || '');
                                    }
                                });
                            }
                        } catch (e) {
                            // no-op
                        }


                        validarCampos($("#modal_clave_empleado"), validarClave);
                        validarCampos($("#modal_nombre_empleado"), validarNombre);
                        validarCampos($("#modal_apellido_paterno"), validarApellido);
                        validarCampos($("#modal_apellido_materno"), validarApellido);
                        validarCampos($("#modal_imss"), validarNSS);
                        validarCampos($("#modal_curp"), validarCURP);
                        validarCampos($("#modal_grupo_sanguineo"), validarGrupoSanguineo);
                        validarCampos($("#modal_telefono_empleado"), validarTelefono);
                        validarCampos($("#modal_rfc"), validarRFCfisica);
                        validarCampos($("#modal_emergencia_nombre"), validarNombre);
                        validarCampos($("#modal_emergencia_ap_paterno"), validarApellido);
                        validarCampos($("#modal_emergencia_ap_materno"), validarApellido);
                        validarCampos($("#modal_emergencia_telefono"), validarTelefono);
                        validarCampos($("#modal_emergencia_parentesco"), validarParentesco);

                        validarDatos($("#modal_clave_empleado"), validarClave);
                        validarDatos($("#modal_nombre_empleado"), validarNombre);
                        validarDatos($("#modal_apellido_paterno"), validarApellido);
                        validarDatos($("#modal_apellido_materno"), validarApellido);
                        validarDatos($("#modal_imss"), validarNSS);
                        validarDatos($("#modal_curp"), validarCURP);
                        validarDatos($("#modal_grupo_sanguineo"), validarGrupoSanguineo);
                        validarDatos($("#modal_telefono_empleado"), validarTelefono);
                        validarDatos($("#modal_rfc"), validarRFCfisica);
                        validarDatos($("#modal_emergencia_nombre"), validarNombre);
                        validarDatos($("#modal_emergencia_ap_paterno"), validarApellido);
                        validarDatos($("#modal_emergencia_ap_materno"), validarApellido);
                        validarDatos($("#modal_emergencia_telefono"), validarTelefono);
                        validarDatos($("#modal_emergencia_parentesco"), validarParentesco);

                        // Aplicar formateo a mayúsculas para los campos requeridos
                        formatearMayusculas("#modal_clave_empleado");
                        formatearMayusculas("#modal_nombre_empleado");
                        formatearMayusculas("#modal_apellido_paterno");
                        formatearMayusculas("#modal_apellido_materno");
                        formatearMayusculas("#modal_curp");
                        formatearMayusculas("#modal_rfc");

                        // Formatear campos del contacto de emergencia a mayúsculas
                        formatearMayusculas("#modal_emergencia_nombre");
                        formatearMayusculas("#modal_emergencia_ap_paterno");
                        formatearMayusculas("#modal_emergencia_ap_materno");
                        formatearMayusculas("#modal_emergencia_parentesco");

                        // -----------------------------------------------
                        // Cargar foto del empleado en el panel
                        // -----------------------------------------------
                        const rutaFoto = empleado.ruta_foto;
                        const $preview = $('#foto_empleado_preview');
                        const $overlay = $('#foto_overlay');

                        if (rutaFoto) {
                            // La ruta en BD es relativa a gafetes/ (ej: fotos_empleados/empleado_1.jpg)
                            $preview.attr('src', rutaRaiz + 'gafetes/' + rutaFoto + '?t=' + Date.now());
                            $preview.show();
                            $overlay.addClass('hidden');
                        } else {
                            $preview.attr('src', '');
                            $preview.hide();
                            $overlay.removeClass('hidden');
                        }

                    }

                },

            });

            // Inicializar los tap control del modal
            $("#tab-trabajador").addClass("active");
            $("#tab-emergencia").removeClass("active");
            $("#tab-reingresos").removeClass("active");
            $("#tab-beneficiarios").removeClass("active");
            $("#tab-horarios").removeClass("active");
            $("#tab-horarios-oficiales").removeClass("active");
            $("#tab-configuracion").removeClass("active");

            // Inicializar el contenido de los tabs
            $("#tab_trabajador").addClass("show active");
            $("#tab_emergencia").removeClass("show active");
            $("#tab_reingresos").removeClass("show active");
            $("#tab_beneficiarios").removeClass("show active");
            $("#tab_horarios").removeClass("show active");
            $("#tab_horarios_oficiales").removeClass("show active");
            $("#tab_configuracion").removeClass("show active");


            // Finalmente mostramos el modal
            $("#modal_actualizar_empleado").modal("show");
        });
    } // Aqui agregue cosas BHL

    // ============================================================
    // Manejo de foto del empleado en el modal de actualización
    // ============================================================

    // Función helper para actualizar la vista previa de la foto
    function actualizarVistaFoto(rutaFoto) {
        const $preview = $('#foto_empleado_preview');
        const $overlay = $('#foto_overlay');
        if (rutaFoto) {
            // La ruta en BD es relativa a la carpeta gafetes/ (ej: fotos_empleados/empleado_1.jpg)
            const urlFoto = rutaRaiz + 'gafetes/' + rutaFoto + '?t=' + Date.now();
            $preview.attr('src', urlFoto);
            $preview.show();
            $overlay.addClass('hidden');
        } else {
            $preview.attr('src', '');
            $preview.hide();
            $overlay.removeClass('hidden');
        }
    }

    // Clic en el contenedor de foto => abre selector de archivo
    $(document).on('click', '#foto_empleado_container', function () {
        $('#input_foto_empleado').trigger('click');
    });

    // Cuando se selecciona un archivo para subir
    $(document).on('change', '#input_foto_empleado', function () {
        const archivo = this.files[0];
        if (!archivo) return;

        const idEmpleado = $('#empleado_id').val();
        if (!idEmpleado) {
            Swal.fire({ icon: 'warning', title: 'Aviso', text: 'No se pudo identificar al empleado.' });
            return;
        }

        const formData = new FormData();
        formData.append('id_empleado', idEmpleado);
        formData.append('foto', archivo);

        $('#foto_empleado_container').addClass('cargando');

        $.ajax({
            type: 'POST',
            url: rutaRaiz + 'gafetes/php/subir_foto_empleado.php',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                $('#foto_empleado_container').removeClass('cargando');
                if (response.success) {
                    actualizarVistaFoto(response.ruta_foto);
                    Swal.fire({ icon: 'success', title: '¡Foto actualizada!', text: response.message, timer: 2000, showConfirmButton: false });
                    // Limpiar el input para permitir subir la misma foto nuevamente
                    $('#input_foto_empleado').val('');
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: response.message });
                    $('#input_foto_empleado').val('');
                }
            },
            error: function () {
                $('#foto_empleado_container').removeClass('cargando');
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.' });
                $('#input_foto_empleado').val('');
            }
        });
    });

    // Botón eliminar foto
    $(document).on('click', '#btn_eliminar_foto_empleado', function () {
        const idEmpleado = $('#empleado_id').val();
        if (!idEmpleado) return;

        Swal.fire({
            title: '¿Eliminar foto?',
            text: 'Se eliminará la foto del empleado. ¿Deseas continuar?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(function (result) {
            if (result.isConfirmed) {
                $.ajax({
                    type: 'POST',
                    url: rutaRaiz + 'gafetes/php/eliminar_foto_empleado.php',
                    data: { id_empleado: idEmpleado },
                    success: function (response) {
                        if (response.success) {
                            actualizarVistaFoto(null);
                            Swal.fire({ icon: 'success', title: 'Foto eliminada', text: response.message, timer: 2000, showConfirmButton: false });
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error', text: response.message });
                        }
                    },
                    error: function () {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.' });
                    }
                });
            }
        });
    });


    // ========================================================================================
    // Evento para ENVIAR el formulario de actualización
    // Se valida que los campos obligatorios no estén vacíos y que los opcionales sean válidos
    // Si hay algún error, se muestra un mensaje de advertencia
    // Si todo es correcto, se envían los datos al servidor para actualizar el empleado
    // y se actualiza la tabla de empleados
    // ========================================================================================
    $("#form_modal_actualizar_empleado").submit(function (e) {
        e.preventDefault();

        // Datos del empleado
        let idEmpleado = $("#empleado_id").val();
        let clave = $("#modal_clave_empleado").val();
        let nombre = $("#modal_nombre_empleado").val();
        let apellidoPaterno = $("#modal_apellido_paterno").val();
        let apellidoMaterno = $("#modal_apellido_materno").val();
        let domicilio = $("#modal_domicilio").val();
        let imss = $("#modal_imss").val();
        let curp = $("#modal_curp").val();
        let sexo = $("#modal_sexo").val();
        let grupoSanguineo = $("#modal_grupo_sanguineo").val();
        let enfermedades = $("#modal_enfermedades_alergias").val();
        let fechaAltaEmpresa = dMonYToYMD($("#modal_fecha_alta_empresa").val());
        let fechaAltaImss = dMonYToYMD($("#modal_fecha_alta_imss").val());
        let idDepartamento = $("#modal_departamento").val();

        // Nuevos campos agregados
        let fechaNacimiento = $("#modal_fecha_nacimiento").val();
        let numCasillero = $("#modal_num_casillero").val();
        let idEmpresa = $("#modal_empresa").val();
        let idArea = $("#modal_area").val();
        let idPuesto = $("#modal_puesto").val();
        let biometrico = $("#modal_biometrico").val();
        let telefonoEmpleado = $("#modal_telefono_empleado").val();
        let rfcEmpleado = $("#modal_rfc").val();
        let estadoCivil = $("#modal_estado_civil").val();

        // Campos de salario
        let salarioSemanal = $("#modal_salario_semanal").val();
        let salarioDiario = $("#modal_salario_diario").val();

        // Datos de emergencia
        let emergenciaNombre = $("#modal_emergencia_nombre").val();
        let emergenciaApPaterno = $("#modal_emergencia_ap_paterno").val();
        let emergenciaApMaterno = $("#modal_emergencia_ap_materno").val();
        let emergenciaTelefono = $("#modal_emergencia_telefono").val();
        let emergenciaDomicilio = $("#modal_emergencia_domicilio").val();
        let emergenciaParentesco = $("#modal_emergencia_parentesco").val();

        // Obtener datos de beneficiarios del modal (VERSIÓN MEJORADA)
        let beneficiarios = [];
        $('#tbody_beneficiarios tr').each(function (index) {
            const $fila = $(this);
            const id_beneficiario = $fila.find('input[name="beneficiario_id[]"]').val(); // NUEVO: Capturar ID
            const nombre = $fila.find('input[name="beneficiario_nombre[]"]').val().trim();
            const ap_paterno = $fila.find('input[name="beneficiario_ap_paterno[]"]').val().trim();
            const ap_materno = $fila.find('input[name="beneficiario_ap_materno[]"]').val().trim();
            const parentesco = $fila.find('input[name="beneficiario_parentesco[]"]').val().trim();
            const porcentaje = $fila.find('input[name="beneficiario_porcentaje[]"]').val().trim();

            // Solo agregar beneficiarios que tengan al menos el nombre
            if (nombre) {
                beneficiarios.push({
                    id_beneficiario: id_beneficiario || "", // NUEVO: Incluir ID
                    nombre: nombre,
                    ap_paterno: ap_paterno || "",
                    ap_materno: ap_materno || "",
                    parentesco: parentesco || "",
                    porcentaje: porcentaje || ""
                });
            }
        });

        // Validar que el total de porcentajes de beneficiarios sea 100% si hay al menos un beneficiario
        let totalPorcentaje = 0;
        let hayBeneficiarios = false;
        $('.porcentaje-beneficiario').each(function () {
            const valor = parseFloat($(this).val()) || 0;
            if (valor > 0) {
                hayBeneficiarios = true;
                totalPorcentaje += valor;
            }
        });

        if (hayBeneficiarios && totalPorcentaje !== 100) {
            Swal.fire({
                title: 'Error en porcentajes',
                text: `El total de porcentajes de beneficiarios debe ser exactamente 100%. Actual: ${totalPorcentaje}%`,
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return false;
        }

        // Recoger los datos del horario BHL
        let horarios = [];
        $('select[name="horario_dia[]"]').each(function (index) {
            const dia = $(this).val().trim();
            const entrada = $('input[name="horario_entrada[]"]').eq(index).val().trim();
            const salida_comida = $('input[name="horario_salida_comida[]"]').eq(index).val().trim();
            const entrada_comida = $('input[name="horario_entrada_comida[]"]').eq(index).val().trim();
            const salida = $('input[name="horario_salida[]"]').eq(index).val().trim();
            const descanso = $('input[name="horario_descanso[]"]').eq(index).is(':checked') ? 1 : 0;

            // Solo agregar si al menos un campo tiene valor
            if (dia || entrada || salida_comida || entrada_comida || salida) {
                horarios.push({
                    dia: dia || "",
                    entrada: entrada || "",
                    salida_comida: salida_comida || "",
                    entrada_comida: entrada_comida || "",
                    salida: salida || "",
                    descanso: descanso
                });
            }
        });

        // Recoger horarios oficiales
        let horarios_oficiales = [];
        $('select[name="horario_oficial_dia[]"]').each(function (index) {
            // El input del dia se cambio por un select
            const dia = $(this).val().trim();
            const entrada = $('input[name="horario_oficial_entrada[]"]').eq(index).val().trim();
            const salida_comida = $('input[name="horario_oficial_salida_comida[]"]').eq(index).val().trim();
            const entrada_comida = $('input[name="horario_oficial_entrada_comida[]"]').eq(index).val().trim();
            const salida = $('input[name="horario_oficial_salida[]"]').eq(index).val().trim();

            if (dia || entrada || salida_comida || entrada_comida || salida) {
                horarios_oficiales.push({
                    dia: dia || "",
                    entrada: entrada || "",
                    salida_comida: salida_comida || "",
                    entrada_comida: entrada_comida || "",
                    salida: salida || ""
                });
            }
        });

        // Validar si el horario es fijo o variable BHL
        let horario_fijo = $("#modal_switchCheckHorarioFijo").is(":checked") ? 1 : 0;

        if (horario_fijo == 0) {
            horarios = []; // Si es variable, no enviar horarios predefinidos
            // horarios_oficiales NO se toca: es independiente del horario fijo
        }

        // Validaciones obligatorias (turnos opcionales)
        let obligatoriosValidos = (
            validarClave(clave) &&
            validarNombre(nombre) &&
            validarApellido(apellidoPaterno) &&
            validarApellido(apellidoMaterno) &&
            sexo
        );

        let opcionalesValidos = true;
        if (imss && !validarNSS(imss)) opcionalesValidos = false;
        if (curp && !validarCURP(curp)) opcionalesValidos = false;
        if (grupoSanguineo && !validarGrupoSanguineo(grupoSanguineo)) opcionalesValidos = false;
        if (telefonoEmpleado && !validarTelefono(telefonoEmpleado)) opcionalesValidos = false;
        if (rfcEmpleado && !validarRFCfisica(rfcEmpleado)) opcionalesValidos = false;
        if (emergenciaNombre && !validarNombre(emergenciaNombre)) opcionalesValidos = false;
        if (emergenciaApPaterno && !validarApellido(emergenciaApPaterno)) opcionalesValidos = false;
        if (emergenciaApMaterno && !validarApellido(emergenciaApMaterno)) opcionalesValidos = false;
        if (emergenciaParentesco && !validarParentesco(emergenciaParentesco)) opcionalesValidos = false;
        if (emergenciaTelefono && !validarTelefono(emergenciaTelefono)) opcionalesValidos = false;


        if (!obligatoriosValidos) {

            Swal.fire({
                title: 'ADVERTENCIA',
                text: 'Existen campos obligatorios vacíos o incorrectos.',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });

            return;
        }

        if (!opcionalesValidos) {

            Swal.fire({
                title: 'ADVERTENCIA',
                text: 'Hay datos opcionales incorrectos.',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });

            return;
        }
        // Construir objeto con todos los datos, enviando "" si están vacíos
        let datos = {
            id_empleado: idEmpleado,
            clave_empleado: clave,
            nombre_empleado: nombre,
            apellido_paterno_empleado: apellidoPaterno,
            apellido_materno_empleado: apellidoMaterno,
            domicilio_empleado: domicilio || "",
            imss: imss || "",
            curp: curp || "",
            sexo: sexo,
            grupo_sanguineo: grupoSanguineo || "",
            enfermedades_alergias: enfermedades || "",
            fecha_alta_empresa: fechaAltaEmpresa || "",
            fecha_alta_imss: fechaAltaImss || "",
            id_departamento: idDepartamento || "",

            // Nuevos campos agregados
            fecha_nacimiento: fechaNacimiento || "",
            num_casillero: numCasillero || "",
            id_empresa: idEmpresa || "",
            id_area: idArea || "",
            id_puestoEspecial: idPuesto || "",
            biometrico: biometrico || "",
            telefono_empleado: telefonoEmpleado || "",
            rfc_empleado: rfcEmpleado || "",
            estado_civil: estadoCivil || "",

            // Campos de salario
            salario_semanal: salarioSemanal || "",
            salario_diario: salarioDiario || "",

            nombre_contacto: emergenciaNombre || "",
            apellido_paterno_contacto: emergenciaApPaterno || "",
            apellido_materno_contacto: emergenciaApMaterno || "",
            telefono_contacto: emergenciaTelefono || "",
            domicilio_contacto: emergenciaDomicilio || "",
            parentesco: emergenciaParentesco || "",

            // Datos de beneficiarios (VERSIÓN MEJORADA)
            beneficiario_id: beneficiarios.map(b => b.id_beneficiario), // NUEVO: Array de IDs
            beneficiario_nombre: beneficiarios.map(b => b.nombre),
            beneficiario_ap_paterno: beneficiarios.map(b => b.ap_paterno),
            beneficiario_ap_materno: beneficiarios.map(b => b.ap_materno),
            beneficiario_parentesco: beneficiarios.map(b => b.parentesco),
            beneficiario_porcentaje: beneficiarios.map(b => b.porcentaje),

            // Datos de horarios del reloj BHL
            horarios: horarios,
            horario_fijo: horario_fijo,

            // Datos de horarios oficiales
            horarios_oficiales: horarios_oficiales,
        };

        // Guardar la página actual antes de actualizar
        const paginaAnterior = paginaActual;


        $.ajax({
            type: "POST",
            url: "../php/update_empleado.php",
            data: datos,
            success: function (response) {
                // Verificar si hay error en la respuesta
                if (response && response.type === 'error') {
                    Swal.fire({
                        title: response.title || 'ERROR',
                        text: response.text || 'Error al actualizar el empleado.',
                        icon: response.type || 'error',
                        confirmButtonText: 'Entendido'
                    });
                    return;
                }

                // Actualizar la tabla de empleados
                $.ajax({
                    type: "POST",
                    url: "../php/obtenerEmpleados.php",
                    data: { accion: "cargarEmpleados" },
                    dataType: "json",
                    success: function (empleados) {
                        // Actualizar los datos sin resetear la paginación
                        empleadosData = empleados;
                        // Restaurar la página anterior
                        paginaActual = paginaAnterior;
                        // Renderizar la tabla con la página actual
                        renderTablaEmpleados();

                        // Recargar los datos del empleado actualizado en el modal (incluyendo historial actualizado)
                        const idEmpleado = datos.id_empleado;
                        const claveEmpleado = datos.clave_empleado;
                        
                        $.ajax({
                            type: "POST",
                            url: "../php/obtenerEmpleados.php",
                            data: { 
                                accion: "dataEmpleado",
                                id_empleado: idEmpleado,
                                clave_empleado: claveEmpleado
                            },
                            dataType: "json",
                            success: function (empleadoActualizado) {
                                // Actualizar el historial de reingresos en el modal
                                const $tbodyReingresos = $('#tbody_historial_reingresos');
                                if ($tbodyReingresos.length) {
                                    const historial = Array.isArray(empleadoActualizado.historial) ? empleadoActualizado.historial : [];
                                    let filas = '';
                                    if (historial.length === 0) {
                                        filas = '<tr><td colspan="4" class="text-center">Sin registros</td></tr>';
                                    } else {
                                        historial.forEach((item, idx) => {
                                            const fechaReingreso = item.fecha_reingreso || '';
                                            const fechaSalida = item.fecha_salida || '';
                                            const frFmt = formatToDMY(fechaReingreso);
                                            const fsFmt = formatToDMY(fechaSalida);
                                            filas += `
                                                <tr>
                                                    <td>${idx + 1}</td>
                                                    <td>${frFmt}</td>
                                                    <td>${fsFmt}</td>
                                                    <td>
                                                        <button type="button" class="btn btn-danger btn-sm btn-eliminar-historial" data-id-historial="${item.id_historial}">
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                        <button type="button" class="btn btn-warning btn-sm btn-editar-historial" data-id-historial="${item.id_historial}">
                                                            <i class="bi bi-pencil"></i>
                                                        </button>
                                                    </td>
                                                </tr>`;
                                        });
                                    }
                                    $tbodyReingresos.html(filas);
                                }
                                
                                // Actualizar la fecha alta empresa en el modal con la fecha más reciente
                                const fechaAltaEmpresaActual = empleadoActualizado.fecha_alta_empresa_actual || empleadoActualizado.fecha_alta_empresa;
                                $("#modal_fecha_alta_empresa").prop('type', 'text').val(formatToDMonY(fechaAltaEmpresaActual));
                            },
                            error: function (xhr, status, error) {
                                console.error('Error al recargar datos del empleado:', error);
                            }
                        });

                        // Cerrar el modal
                        $("#modal_actualizar_empleado").modal("hide");

                        Swal.fire({
                            title: response.title || 'EXITO',
                            text: response.text || 'Empleado actualizado correctamente.',
                            icon: response.type || 'success',
                            confirmButtonText: 'Entendido'
                        });
                    },
                    error: function (xhr, status, error) {

                    }
                });
            }
        });

    });

    // Cambiar el Status del Empleado
    $(document).on("click", "#btn_status", function () {
        let idEmpleado = $(this).data("id-empleado");
        let idStatus = $(this).data("id-status");

        let mensaje = idStatus == 1 ? "¿Deseas desactivar a este empleado?" : "¿Deseas activar a este empleado?";

        // Si se está dando de baja, mostrar opciones de fecha
        if (idStatus == 1) {
            Swal.fire({
                title: "Cambiar status",
                text: mensaje,
                icon: "info",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "rgb(127, 127, 127)",
                confirmButtonText: "Sí, cambiar",
                cancelButtonText: "Cancelar",
                reverseButtons: true,
                focusCancel: true
            }).then((result) => {
                if (result.isConfirmed) {
                    // Mostrar opciones para la fecha de baja
                    Swal.fire({
                        title: "Seleccionar fecha de baja",
                        text: "¿Deseas usar la fecha de hoy o ingresar una fecha manual?",
                        icon: "question",
                        showCancelButton: true,
                        showDenyButton: true,
                        confirmButtonColor: "#3085d6",
                        denyButtonColor: "#17a2b8",
                        cancelButtonColor: "rgb(127, 127, 127)",
                        confirmButtonText: "Fecha de hoy",
                        denyButtonText: "Fecha manual",
                        cancelButtonText: "Cancelar",
                        reverseButtons: true,
                        focusCancel: true
                    }).then((fechaResult) => {
                        if (fechaResult.isConfirmed) {
                            // Usar fecha de hoy
                            procesarCambioStatus(idEmpleado, idStatus, null, this);
                        } else if (fechaResult.isDenied) {
                            // Fecha manual
                            Swal.fire({
                                title: "Ingresar fecha de baja",
                                html: '<input type="date" id="fecha_baja_manual" class="swal2-input">',
                                icon: "info",
                                showCancelButton: true,
                                confirmButtonColor: "#3085d6",
                                cancelButtonColor: "rgb(127, 127, 127)",
                                confirmButtonText: "Aceptar",
                                cancelButtonText: "Cancelar",
                                reverseButtons: true,
                                focusCancel: true,
                                preConfirm: () => {
                                    const fecha = document.getElementById('fecha_baja_manual').value;
                                    if (!fecha) {
                                        Swal.showValidationMessage('Por favor selecciona una fecha');
                                    }
                                    return fecha;
                                }
                            }).then((manualResult) => {
                                if (manualResult.isConfirmed) {
                                    const fechaManual = manualResult.value;
                                    procesarCambioStatus(idEmpleado, idStatus, fechaManual, this);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            // Si se está activando, proceder normalmente
            Swal.fire({
                title: "Cambiar status",
                text: mensaje,
                icon: "info",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "rgb(127, 127, 127)",
                confirmButtonText: "Sí, cambiar",
                cancelButtonText: "Cancelar",
                reverseButtons: true,
                focusCancel: true
            }).then((result) => {
                if (result.isConfirmed) {
                    procesarCambioStatus(idEmpleado, idStatus, null, this);
                }
            });
        }
    });

    // Función para procesar el cambio de status
    function procesarCambioStatus(idEmpleado, idStatus, fechaBaja, element) {
        // Evitar doble click y desactivar visualmente
        const $el = $(element);
        if ($el.data('processing')) return;
        $el.data('processing', true).addClass('disabled').css('pointer-events', 'none').css('opacity', '0.6');

        let datos = {
            id_empleado: idEmpleado,
            id_status: idStatus,
            accion: "cambiarStatus"
        };

        // Agregar fecha de baja si se proporcionó
        if (fechaBaja) {
            datos.fecha_baja = fechaBaja;
        }

        $.ajax({
            type: "POST",
            url: "../php/obtenerEmpleados.php",
            data: datos,
            success: function (response) {

                if (response == true) {
                    // Actualizar solo los datos sin cambiar la página actual
                    $.ajax({
                        type: "POST",
                        url: "../php/obtenerEmpleados.php",
                        data: {
                            accion: "cargarEmpleados",
                        },
                        dataType: "json",
                        success: function (empleados) {
                            empleadosData = empleados;
                            paginacionStatus(empleados);

                            // Actualizar la fecha alta empresa en el modal si está abierto
                            const idEmpleado = datos.id_empleado;
                            
                            // Buscar la clave del empleado en los datos cargados
                            const empleadoEncontrado = empleados.find(emp => emp.id_empleado == idEmpleado);
                            const claveEmpleado = empleadoEncontrado ? empleadoEncontrado.clave_empleado : null;
                            
                            if ($('#modal_actualizar_empleado').hasClass('show') && claveEmpleado) {
                                $.ajax({
                                    type: "POST",
                                    url: "../php/obtenerEmpleados.php",
                                    data: { 
                                        accion: "dataEmpleado",
                                        id_empleado: idEmpleado,
                                        clave_empleado: claveEmpleado
                                    },
                                    dataType: "json",
                                    success: function (empleadoActualizado) {
                                        // Actualizar el historial de reingresos en el modal
                                        const $tbodyReingresos = $('#tbody_historial_reingresos');
                                        if ($tbodyReingresos.length) {
                                            const historial = Array.isArray(empleadoActualizado.historial) ? empleadoActualizado.historial : [];
                                            let filas = '';
                                            if (historial.length === 0) {
                                                filas = '<tr><td colspan="4" class="text-center">Sin registros</td></tr>';
                                            } else {
                                                historial.forEach((item, idx) => {
                                                    const fechaReingreso = item.fecha_reingreso || '';
                                                    const fechaSalida = item.fecha_salida || '';
                                                    const frFmt = formatToDMY(fechaReingreso);
                                                    const fsFmt = formatToDMY(fechaSalida);
                                                    filas += `
                                                        <tr>
                                                            <td>${idx + 1}</td>
                                                            <td>${frFmt}</td>
                                                            <td>${fsFmt}</td>
                                                            <td>
                                                                <button type="button" class="btn btn-danger btn-sm btn-eliminar-historial" data-id-historial="${item.id_historial}">
                                                                    <i class="bi bi-trash"></i>
                                                                </button>
                                                                <button type="button" class="btn btn-warning btn-sm btn-editar-historial" data-id-historial="${item.id_historial}">
                                                                    <i class="bi bi-pencil"></i>
                                                                </button>
                                                            </td>
                                                        </tr>`;
                                                });
                                            }
                                            $tbodyReingresos.html(filas);
                                        }
                                        
                                        // Actualizar la fecha alta empresa en el modal con la fecha más reciente
                                        const fechaAltaEmpresaActual = empleadoActualizado.fecha_alta_empresa_actual || empleadoActualizado.fecha_alta_empresa;
                                        $("#modal_fecha_alta_empresa").prop('type', 'text').val(formatToDMonY(fechaAltaEmpresaActual));
                                    }
                                });
                            }

                            const Toast = Swal.mixin({
                                toast: true,
                                position: "top-end",
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true,
                                didOpen: (toast) => {
                                    toast.onmouseenter = Swal.stopTimer;
                                    toast.onmouseleave = Swal.resumeTimer;
                                }
                            });
                            Toast.fire({
                                icon: "success",
                                title: "Cambio de status exitoso"
                            });
                        },
                        complete: function () {
                            $el.data('processing', false).removeClass('disabled').css('pointer-events', '').css('opacity', '');
                        }
                    });
                } else {
                    $el.data('processing', false).removeClass('disabled').css('pointer-events', '').css('opacity', '');
                    Swal.fire({
                        title: "No permitido",
                        text: "Este empleado tiene una deuda pendiente",
                        icon: "error",
                        confirmButtonText: "Entendido"
                    });
                }
            },
            error: function () {
                $el.data('processing', false).removeClass('disabled').css('pointer-events', '').css('opacity', '');
            }
        });
    }

    // Eliminar empleado (visible en filas inactivas)
    $(document).on('click', '.btn-eliminar', function () {
        const idEmpleado = $(this).data('id');
        const nombreEmpleado = $(this).data('nombre');

        if (typeof Swal === 'undefined') {
            const confirmado = confirm(`¿Deseas eliminar definitivamente a ${nombreEmpleado}? Esta acción no se puede deshacer.`);
            if (!confirmado) return;
            ejecutarEliminacion(idEmpleado);
            return;
        }

        Swal.fire({
            title: '¿Eliminar empleado?',
            text: `Se eliminará definitivamente a ${nombreEmpleado}. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            focusCancel: true
        }).then((result) => {
            if (!result.isConfirmed) return;
            ejecutarEliminacion(idEmpleado);
        });
    });

    function ejecutarEliminacion(idEmpleado) {
        $.ajax({
            type: 'POST',
            url: '../php/eliminar_empleado.php',
            data: { id_empleado: idEmpleado },
            dataType: 'json',
            success: function (response) {
                obtenerDatosEmpleados();
                Swal.fire({
                    title: response.title || 'SUCCESS',
                    text: response.text || 'Empleado eliminado correctamente.',
                    icon: response.type || 'success',
                    confirmButtonText: 'Entendido'
                });
            },
            error: function (xhr) {
                Swal.fire({
                    title: 'ERROR',
                    text: xhr.responseText || 'No se pudo eliminar el empleado.',
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
            }
        });
    }

    // Eliminar un registro del historial de reingresos (en el modal)
    $(document).on('click', '.btn-eliminar-historial', function () {
        const idHist = $(this).data('id-historial');
        const $fila = $(this).closest('tr');
        const $tbody = $('#tbody_historial_reingresos');

        if (!idHist) return;

        // Verificar si es la última fila del tbody (más reciente)
        const esUltima = $fila.is(':last-child');
        if (!esUltima) {
            Swal.fire({
                title: 'No permitido',
                text: 'Solo se permite eliminar los registros de reingresos desde el más reciente (actual) hacia el más antiguo. Elimina primero los registros más recientes.',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const ejecutar = () => {
            $.ajax({
                type: 'POST',
                url: '../php/obtenerEmpleados.php',
                data: { accion: 'eliminarReingreso', id_historial: idHist },
                success: function (resp) {
                    if (resp == true || resp === '1') {
                        $fila.remove();
                        // Si no quedan filas, mostrar mensaje vacío
                        if ($tbody.find('tr').length === 0) {
                            $tbody.html('<tr><td colspan="3" class="text-center">Sin registros</td></tr>');
                        } else {
                            // Reindexar la primera columna (#)
                            $tbody.find('tr').each(function (i) {
                                $(this).children('td').eq(0).text(i + 1);
                            });
                        }
                        obtenerDatosEmpleados();
                        
                        // Actualizar el input de fecha alta empresa con la fecha más reciente del historial
                        actualizarFechaAltaEmpresaDesdeHistorial();
                    } else {
                        Swal.fire({
                            title: 'No permitido',
                            text: 'No se puede eliminar este registro porque existen registros más actuales.',
                            icon: 'error',
                            confirmButtonText: 'Entendido'
                        });
                    }
                },
                error: function () {
                    // No mostrar ningún mensaje
                }
            });
        };

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '¿Eliminar registro?',
                text: 'Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true,
                focusCancel: true
            }).then((r) => { if (r.isConfirmed) ejecutar(); });
        } else {
            if (confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) ejecutar();
        }
    });

    // Función para inicializar el ordenamiento
    function initOrdenamiento() {
        // Manejar los eventos de los botones de ordenamiento
        $("#ordenNombreAsc").on("click", function () {
            setOrden("nombre_asc");
        });

        $("#ordenNombreDesc").on("click", function () {
            setOrden("nombre_desc");
        });

        $("#ordenClaveAsc").on("click", function () {
            setOrden("clave_asc");
        });

        $("#ordenClaveDesc").on("click", function () {
            setOrden("clave_desc");
        });
    }

    $(document).on('click', '#btnCopiarHorariosOficiales', function () {
        // Obtener valores del formulario de referencia de horarios oficiales
        const entrada = $('#ref_of_entrada').val();
        const salidaComida = $('#ref_of_salida_comida').val();
        const entradaComida = $('#ref_of_entrada_comida').val();
        const salida = $('#ref_of_salida').val();

        // Copiar a las primeras 6 filas de horarios oficiales
        $('#tbody_horarios_oficiales tr').each(function (index) {
            if (index < 7) { // solo las primeras 6 filas
                $(this).find('input[name="horario_oficial_entrada[]"]').val(entrada);
                $(this).find('input[name="horario_oficial_salida_comida[]"]').val(salidaComida);
                $(this).find('input[name="horario_oficial_entrada_comida[]"]').val(entradaComida);
                $(this).find('input[name="horario_oficial_salida[]"]').val(salida);
            }
        });
    });


    // =====================================================
    // SECCION PARA MANEJAR LOS HORARIOS PARA BIOMETRICO BHL
    // =====================================================

    // Evento para el botón de copiar horarios
    $(document).on('click', '#btnCopiarHorarios', function () {
        // Obtener valores del formulario de referencia
        const entrada = $('#ref_entrada').val();
        const salidaComida = $('#ref_salida_comida').val();
        const entradaComida = $('#ref_entrada_comida').val();
        const salida = $('#ref_salida').val();

        // Verificar si al menos uno tiene valor
        if (!entrada && !salidaComida && !entradaComida && !salida) return;

        // Copiar a las primeras 7 filas
        $('#tbody_horarios tr').each(function (index) {
            if (index < 7) { // solo las primeras 7 filas
                if (entrada) {
                    $(this).find('input[name="horario_entrada[]"]').val(entrada);
                }
                if (salidaComida) {
                    $(this).find('input[name="horario_salida_comida[]"]').val(salidaComida);
                }
                if (entradaComida) {
                    $(this).find('input[name="horario_entrada_comida[]"]').val(entradaComida);
                }
                if (salida) {
                    $(this).find('input[name="horario_salida[]"]').val(salida);
                }
            }
        });
    });

    // Manejar el botón de limpiar la fila del horario
    $(document).on('click', '.btn-eliminar-horario', function () {
        const $fila = $(this).closest('tr');

        // Limpiar todos los campos de la fila
        $fila.find('input[name="horario_entrada[]"]').val('');
        $fila.find('input[name="horario_salida_comida[]"]').val('');
        $fila.find('input[name="horario_entrada_comida[]"]').val('');
        $fila.find('input[name="horario_salida[]"]').val('');

        // Remover clases de validación
        $fila.find('input').removeClass('border-success border-danger');
    });

    // Manejar el checkbox de día de descanso
    $(document).on('change', '.chk-descanso', function (e) {
        e.preventDefault();

        // referencia a la fila donde está el checkbox
        let $fila = $(this).closest('tr');

        if ($(this).is(':checked')) {
            // limpiar todos los inputs de hora en esa fila
            $fila.find('input[type="time"]').val('');
        }
    });

    // Manejar el switch de horario fijo/variable
    $switch_horario_fijo.on("change", function () {
        if ($(this).is(":checked")) {
            $tab_horarios.prop("disabled", false); // habilita el tab
        } else {
            $tab_horarios.prop("disabled", true); // deshabilita el tab 
        }
    });




    /**
     * ===========================================================
     * CONFIGURACION DE FECHAS DE INGRESO
    * ============================================================
     */

    /**
     * EVENTO PARA MOSTRAR LA SECCIÓN DE CONFIGURACIÓN
     */
    $(document).on('click', '#tab-configuracion', function (e) {
        e.preventDefault();
        // MOSTRAR SECCION DE ACCESO
        $('#seccion_acceso').removeClass('d-none');
        // OCULTAR SECCION DE FECHAS
        $('#seccion_fechas').addClass('d-none');
        // LIMPIAR EL CAMPO DE CONTRASEÑA
        $('#inputPassword').val('');
    });

    /**
     * CONTRASEÑA PARA ENTRAR A CONFIGURACIÓN
     */
    $(document).on('click', '#btn_acceder_fechas', function (e) {
        e.preventDefault();
        // RECUPERAR LA CONTRASEÑA INGRESADA
        const claveIngresada = $('#inputPassword').val().trim();
        // VALIDAR LA CONTRASEÑA
        if (claveIngresada === '12345') {
            // OCULTAR LA SECCIÓN DE ACCESO
            $('#seccion_acceso').addClass('d-none');
            // MOSTRAR LA SECCIÓN DE FECHAS
            $('#seccion_fechas').removeClass('d-none');
        } else {
            Swal.fire({
                title: 'Acceso denegado',
                text: 'La contraseña ingresada es incorrecta.',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    });

    // Cambiar dinámicamente tipo de input a date en focus y a text en blur para mantener formato de vista 'DD/Mon/YYYY'
    $(document).on('focus', '#modal_fecha_alta_empresa, #modal_fecha_alta_imss', function () {
        const val = $(this).val();
        if (val) {
            const ymd = dMonYToYMD(val);
            $(this).prop('type', 'date').val(ymd);
        } else {
            $(this).prop('type', 'date');
        }
    });

    $(document).on('blur', '#modal_fecha_alta_empresa, #modal_fecha_alta_imss', function () {
        const val = $(this).val();
        $(this).prop('type', 'text');
        if (val) {
            $(this).val(formatToDMonY(val));
        } else {
            $(this).val('');
        }
    });

    // Actualizar edad en tiempo real al cambiar la fecha de nacimiento
    $(document).on('change', '#modal_fecha_nacimiento', function () {
        mostrarEdadEmpleado($(this).val());
    });

});

// ─── Utilidad: calcula y muestra la edad del empleado ────────────────────────
function calcularEdad(fechaNac) {
    if (!fechaNac) return null;
    const hoy = new Date();
    const nac = new Date(fechaNac);
    if (isNaN(nac.getTime())) return null;

    let anios = hoy.getFullYear() - nac.getFullYear();
    let meses = hoy.getMonth() - nac.getMonth();
    let dias = hoy.getDate() - nac.getDate();

    if (dias < 0) {
        meses--;
        // días del mes anterior
        const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        dias += mesAnterior.getDate();
    }
    if (meses < 0) {
        anios--;
        meses += 12;
    }
    return { anios, meses, dias };
}

function mostrarEdadEmpleado(fechaNac) {
    const edad = calcularEdad(fechaNac);
    const $badge = $('#edad-empleado-vista');
    const $texto = $('#edad-empleado-texto');

    if (!edad) {
        $badge.addClass('d-none');
        $texto.text('');
        return;
    }

    const partes = [];
    if (edad.anios > 0) partes.push(`${edad.anios} año${edad.anios !== 1 ? 's' : ''}`);
    if (edad.meses > 0) partes.push(`${edad.meses} mes${edad.meses !== 1 ? 'es' : ''}`);
    if (edad.dias >= 0) partes.push(`${edad.dias}  día${edad.dias !== 1 ? 's' : ''}`);

    $texto.text(partes.join(', '));
    $badge.removeClass('d-none');
}