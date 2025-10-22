$(document).ready(function () {
    const rutaRaiz = '/sistema_saao/';
    const rutaPlugins = '/sistema_saao/';

    getDepartamentos();
    obtenerDatosEmpleados();
    departamentoSeleccionado();
    filtrosBusqueda();
    setValoresModal();
    initOrdenamiento();
      actualizarTotalPorcentaje(); 

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
        $('.porcentaje-beneficiario').each(function() {
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
    $(document).on('input', '.porcentaje-beneficiario', function() {
        // Asegurarse de que el valor esté entre 0 y 100
        let valor = parseFloat($(this).val()) || 0;
        if (valor < 0) valor = 0;
        if (valor > 100) valor = 100;
        $(this).val(valor);
        
        actualizarTotalPorcentaje();
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


    // Se Obtienen los departamentos
    function getDepartamentos() {
        $.ajax({
            type: "GET",
            url: rutaRaiz + "public/php/obtenerDepartamentos.php",
            success: function (response) {
                if (!response.error) {
                    let departamentos = JSON.parse(response);
                    let opciones = `<option value=\"0\">Todos</option>
                                    <option value=\"1000\">Sin Seguro</option>`;
                    departamentos.forEach((element) => {
                        opciones += `
                        <option value=\"${element.id_departamento}\">${element.nombre_departamento}</option> `;
                    });
                    $("#filtroDepartamento").html(opciones);

                }

            }
        });
    }

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
                console.error("Error en la petición:", error);
                console.log("Respuesta completa:", xhr.responseText);
            }
        });
    }

    function departamentoSeleccionado() {
        // Si quieres recargar empleados al cambiar el filtro de departamento:
        $("#filtroDepartamento").on("change", function () {


            setFiltroDepartamento($(this).val());
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
                try {
                    VanillaToasts.create({
                        title: 'ADVERTENCIA',
                        text: 'La fecha de reingreso es obligatoria.',
                        type: 'warning',
                        icon: rutaPlugins + 'plugins/toasts/icons/icon_warning.png',
                        timeout: 2500
                    });
                } catch (e) { }
                return;
            }

            // Validación: la fecha de salida no puede ser anterior a la de reingreso
            if (fechaSalida) {
                const dReing = new Date(fechaReingreso);
                const dSal = new Date(fechaSalida);
                if (dSal < dReing) {
                    try {

                    } catch (e) { }
                    return;
                }
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
            $('#modal_hist_fecha_reingreso').val('');
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

    function setValoresModal(params) {
        $(document).on("click", ".btn-actualizar", function () {
            let idEmpleado = $(this).data("id");
            let claveEmpleado = $(this).data("clave");

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
                        let fechaIngreso = empleado.fecha_ingreso;
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

                        // Campos de salario
                        let salarioSemanal = empleado.salario_semanal;
                        let salarioMensual = empleado.salario_mensual;

                        // Obtener la última fecha de reingreso
                        let ultimaFechaReingreso = empleado.ultima_fecha_reingreso;

                        let nombreContacto = empleado.nombre_contacto;
                        let apPaternoContacto = empleado.apellido_paterno_contacto;
                        let apMaternoContacto = empleado.apellido_materno_contacto;
                        let telefonoContacto = empleado.telefono_contacto;
                        let domicilioContacto = empleado.domicilio_contacto;
                        let parentescoContacto = empleado.parentesco;

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
                        $("#modal_fecha_ingreso").val(fechaIngreso);
                        // Nuevos campos
                        $("#modal_fecha_nacimiento").val(fechaNacimiento);
                        $("#modal_num_casillero").val(numCasillero);
                        // Asignar biométrico
                        $("#modal_biometrico").val(biometrico);
                        $("#modal_telefono_empleado").val(telefonoEmpleado);

                        // Asignar la última fecha de reingreso si existe
                        if (ultimaFechaReingreso) {
                            $("#modal_fecha_reingreso").val(ultimaFechaReingreso);
                        } else {
                            $("#modal_fecha_reingreso").val("");
                        }

                        // Campos de salario
                        $("#modal_salario_semanal").val(salarioSemanal);
                        $("#modal_salario_mensual").val(salarioMensual);

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
                            console.error('Error al renderizar historial de reingresos:', e);
                           
                        }

                        // Cargar departamentos con la ruta correcta
                        $.ajax({
                            type: "GET",
                            url: rutaRaiz + "public/php/obtenerDepartamentos.php", // Ruta corregida
                            success: function (response) {
                                let departamentos = JSON.parse(response);
                                let opciones = `<option value="0">Ninguno</option>`;

                                departamentos.forEach((element) => {
                                    opciones += `
                                <option value="${element.id_departamento}">${element.nombre_departamento}</option>`;
                                });

                                $("#modal_departamento").html(opciones);
                                if (!idDepartamentoEmpleado || idDepartamentoEmpleado === "0") {
                                    $("#modal_departamento").val("0");
                                } else {
                                    $("#modal_departamento").val(idDepartamentoEmpleado);
                                }
                            }
                        });

                        // Cargar empresas
                        $.ajax({
                            type: "GET",
                            url: rutaRaiz + "public/php/obtenerEmpresa.php", // Ruta corregida
                            success: function (response) {
                                let empresas = JSON.parse(response);
                                let opciones = `<option value="0">Ninguna</option>`;

                                empresas.forEach((element) => {
                                    opciones += `
                                <option value="${element.id_empresa}">${element.nombre_empresa}</option>`;
                                });

                                $("#modal_empresa").html(opciones);
                                if (!idEmpresa || idEmpresa === "0") {
                                    $("#modal_empresa").val("0");
                                } else {
                                    $("#modal_empresa").val(idEmpresa);
                                }
                            }
                        });

                        // Cargar áreas
                        $.ajax({
                            type: "GET",
                            url: rutaRaiz + "public/php/obtenerAreas.php", // Ruta corregida
                            success: function (response) {
                                let areas = JSON.parse(response);
                                let opciones = `<option value="0">Ninguna</option>`;

                                areas.forEach((element) => {
                                    opciones += `
                                <option value="${element.id_area}">${element.nombre_area}</option>`;
                                });

                                $("#modal_area").html(opciones);
                                if (!idArea || idArea === "0") {
                                    $("#modal_area").val("0");
                                } else {
                                    $("#modal_area").val(idArea);
                                }
                            }
                        });

                        // Cargar puestos
                        $.ajax({
                            type: "GET",
                            url: rutaRaiz + "public/php/obtenerPuestos.php", // Ruta corregida
                            success: function (response) {
                                let puestos = JSON.parse(response);
                                let opciones = `<option value="0">Ninguno</option>`;

                                puestos.forEach((element) => {
                                    opciones += `
                                <option value="${element.id_puestoEspecial}">${element.nombre_puesto}</option>`;
                                });

                                $("#modal_puesto").html(opciones);
                                if (!idPuesto || idPuesto === "0") {
                                    $("#modal_puesto").val("0");
                                } else {
                                    $("#modal_puesto").val(idPuesto);
                                }
                            }
                        });

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
                            console.error('Error al renderizar beneficiarios:', e);
                        }

                        validarCampos($("#modal_clave_empleado"), validarClave);
                        validarCampos($("#modal_nombre_empleado"), validarNombre);
                        validarCampos($("#modal_apellido_paterno"), validarApellido);
                        validarCampos($("#modal_apellido_materno"), validarApellido);
                        validarCampos($("#modal_imss"), validarNSS);
                        validarCampos($("#modal_curp"), validarCURP);
                        validarCampos($("#modal_grupo_sanguineo"), validarGrupoSanguineo);
                        validarCampos($("#modal_telefono_empleado"), validarTelefono);
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

                        // Formatear campos del contacto de emergencia a mayúsculas
                        formatearMayusculas("#modal_emergencia_nombre");
                        formatearMayusculas("#modal_emergencia_ap_paterno");
                        formatearMayusculas("#modal_emergencia_ap_materno");
                        formatearMayusculas("#modal_emergencia_parentesco");

                    }

                },

            });

            // Finalmente mostramos el modal
            $("#modal_actualizar_empleado").modal("show");
        });
    }


    // Evento para enviar el formulario de actualización
    // Se valida que los campos obligatorios no estén vacíos y que los opcionales sean válidos
    // Si hay algún error, se muestra un mensaje de advertencia
    // Si todo es correcto, se envían los datos al servidor para actualizar el empleado
    // y se actualiza la tabla de empleados

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
        let fechaIngreso = $("#modal_fecha_ingreso").val();
        let idDepartamento = $("#modal_departamento").val();

        // Nuevos campos agregados
        let fechaNacimiento = $("#modal_fecha_nacimiento").val();
        let numCasillero = $("#modal_num_casillero").val();
        let idEmpresa = $("#modal_empresa").val();
        let idArea = $("#modal_area").val();
        let idPuesto = $("#modal_puesto").val();
        let biometrico = $("#modal_biometrico").val();
        let telefonoEmpleado = $("#modal_telefono_empleado").val();

        // Campos de salario
        let salarioSemanal = $("#modal_salario_semanal").val();
        let salarioMensual = $("#modal_salario_mensual").val();

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
        $('.porcentaje-beneficiario').each(function() {
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

        // Validaciones obligatorias
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
        if (emergenciaNombre && !validarNombre(emergenciaNombre)) opcionalesValidos = false;
        if (emergenciaApPaterno && !validarApellido(emergenciaApPaterno)) opcionalesValidos = false;
        if (emergenciaApMaterno && !validarApellido(emergenciaApMaterno)) opcionalesValidos = false;
        if (emergenciaParentesco && !validarParentesco(emergenciaParentesco)) opcionalesValidos = false;
        if (emergenciaTelefono && !validarTelefono(emergenciaTelefono)) opcionalesValidos = false;


        if (!obligatoriosValidos) {

            VanillaToasts.create({
                title: 'ADVERTENCIA!',
                text: 'Existen campos obligatorios vacíos o incorrectos.',
                type: 'warning', //valores aceptados: success, warning, info, error
                icon: rutaPlugins + 'plugins/toasts/icons/icon_warning.png',
                timeout: 3000, // visible 3 segundos
            });

            return;
        }

        if (!opcionalesValidos) {

            VanillaToasts.create({
                title: 'ADVERTENCIA!',
                text: 'Hay datos opcionales incorrectos.',
                type: 'warning', //valores aceptados: success, warning, info, error
                icon: rutaPlugins + 'plugins/toasts/icons/icon_warning.png',
                timeout: 3000, // visible 3 segundos
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
            fecha_ingreso: fechaIngreso || "",
            id_departamento: idDepartamento || "",

            // Nuevos campos agregados
            fecha_nacimiento: fechaNacimiento || "",
            num_casillero: numCasillero || "",
            id_empresa: idEmpresa || "",
            id_area: idArea || "",
            id_puestoEspecial: idPuesto || "",
            biometrico: biometrico || "",
            telefono_empleado: telefonoEmpleado || "",

            // Campos de salario
            salario_semanal: salarioSemanal || "",
            salario_mensual: salarioMensual || "",

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
            beneficiario_porcentaje: beneficiarios.map(b => b.porcentaje)
        };



        // Guardar la página actual antes de actualizar
        const paginaAnterior = paginaActual;
        
        $.ajax({
            type: "POST",
            url: "../php/update_empleado.php",
            data: datos,
            success: function (response) {
                // Actualizar la tabla de empleados
                $.ajax({
                    type: "POST",
                    url: "../php/obtenerEmpleados.php",
                    data: { accion: "cargarEmpleados" },
                    dataType: "json",
                    success: function(empleados) {
                        // Actualizar los datos sin resetear la paginación
                        empleadosData = empleados;
                        // Restaurar la página anterior
                        paginaActual = paginaAnterior;
                        // Renderizar la tabla con la página actual
                        renderTablaEmpleados();
                        
                        // Cerrar el modal
                        $("#modal_actualizar_empleado").modal("hide");

                        VanillaToasts.create({
                            title: response.title,
                            text: response.text,
                            type: response.type,
                            icon: response.icon,
                            timeout: response.timeout
                        });
                    },
                    error: function(xhr, status, error) {
                        console.error("Error al cargar empleados:", error);
                    }
                });
            }
        });

    });


    // Cambiar el Status del Empleado
    $(document).on("click", "#btn_status", function () {
        let idEmpleado = $(this).data("id-empleado");
        let idStatus = $(this).data("id-status");



        // Evitar doble click y desactivar visualmente
        const $el = $(this);
        if ($el.data('processing')) return;
        $el.data('processing', true).addClass('disabled').css('pointer-events', 'none').css('opacity', '0.6');

        let datos = {
            id_empleado: idEmpleado,
            id_status: idStatus,

            accion: "cambiarStatus"
        };

        console.log(datos);

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
                            paginacionStatus(empleadosData);
                        },
                        complete: function () {
                            $el.data('processing', false).removeClass('disabled').css('pointer-events', '').css('opacity', '');
                        }
                    });
                } else {
                    $el.data('processing', false).removeClass('disabled').css('pointer-events', '').css('opacity', '');
                }
            },
            error: function () {
                $el.data('processing', false).removeClass('disabled').css('pointer-events', '').css('opacity', '');
            }
        });
    });

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
                VanillaToasts.create({
                    title: response.title || 'SUCCESS',
                    text: response.text || 'Empleado eliminado correctamente.',
                    type: response.type || 'success',
                    icon: (response.icon) ? response.icon : (rutaPlugins + 'plugins/toasts/icons/icon_success.png'),
                    timeout: response.timeout || 3000
                });
            },
            error: function (xhr) {
                VanillaToasts.create({
                    title: 'ERROR',
                    text: xhr.responseText || 'No se pudo eliminar el empleado.',
                    type: 'error',
                    icon: rutaPlugins + 'plugins/toasts/icons/icon_error.png',
                    timeout: 4000
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
                        // No mostrar ningún mensaje
                    } else {
                        // No mostrar ningún mensaje
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

});