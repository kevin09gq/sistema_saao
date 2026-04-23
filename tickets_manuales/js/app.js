$(document).ready(function() {
    const configNominas = {
        nomina_40lbs: {
            percepciones: [
                { nombre: 'Sueldo Neto', id: 'sueldo_neto', tipo: 'number', paso: '0.01' },
                { nombre: 'Incentivo', id: 'incentivo', tipo: 'number', paso: '0.01' },
                { nombre: 'Horas Extras', id: 'horas_extra', tipo: 'number', paso: '0.01' },
                { nombre: 'Bono de Antigüedad', id: 'bono_antiguedad', tipo: 'number', paso: '0.01' },
                { nombre: 'Actividades Especiales', id: 'actividades_especiales', tipo: 'number', paso: '0.01' },
                { nombre: 'Sueldo Puesto', id: 'puesto', tipo: 'number', paso: '0.01' }
            ],
            deducciones: [
                { nombre: 'ISR', id: 'isr', codigo: '45', tipo: 'number', paso: '0.01' },
                { nombre: 'IMSS', id: 'imss', codigo: '52', tipo: 'number', paso: '0.01' },
                { nombre: 'Ajuste al Sub', id: 'ajuste_sub', codigo: '107', tipo: 'number', paso: '0.01' },
                { nombre: 'Infonavit', id: 'infonavit', codigo: '16', tipo: 'number', paso: '0.01' },
                { nombre: 'Permiso', id: 'permiso', tipo: 'number', paso: '0.01' },
                { nombre: 'Inasistencias', id: 'inasistencia', tipo: 'number', paso: '0.01' },
                { nombre: 'Uniformes', id: 'uniformes', tipo: 'number', paso: '0.01' },
                { nombre: 'Checador', id: 'checador', tipo: 'number', paso: '0.01' },
                { nombre: 'Préstamo', id: 'prestamo', tipo: 'number', paso: '0.01' },
                { nombre: 'Tarjeta', id: 'tarjeta', tipo: 'number', paso: '0.01' }
            ]
        },
        nomina_huasteca: {
            percepciones: [
                { nombre: 'Sueldo Semanal', id: 'salario_semanal', tipo: 'number', paso: '0.01' },
                { nombre: 'Extras', id: 'sueldo_extra_total', tipo: 'number', paso: '0.01' }
            ],
            deducciones: [
                { nombre: 'Retardos', id: 'retardos', tipo: 'number', paso: '0.01' },
                { nombre: 'Permiso', id: 'permiso', tipo: 'number', paso: '0.01' },
                { nombre: 'Inasistencias', id: 'inasistencia', tipo: 'number', paso: '0.01' },
                { nombre: 'Uniformes', id: 'uniformes', tipo: 'number', paso: '0.01' },
                { nombre: 'Checador', id: 'checador', tipo: 'number', paso: '0.01' },
                { nombre: 'Préstamo', id: 'prestamo', tipo: 'number', paso: '0.01' },
                { nombre: 'Tarjeta', id: 'tarjeta', tipo: 'number', paso: '0.01' }
            ]
        },
        nomina_palmilla: {
            percepciones: [
                { nombre: 'Sueldo Semanal', id: 'salario_semanal', tipo: 'number', paso: '0.01' },
                { nombre: 'Extras', id: 'sueldo_extra_total', tipo: 'number', paso: '0.01' }
            ],
            deducciones: [
                { nombre: 'Retardos', id: 'retardos', tipo: 'number', paso: '0.01' },
                { nombre: 'Permiso', id: 'permiso', tipo: 'number', paso: '0.01' },
                { nombre: 'Inasistencias', id: 'inasistencia', tipo: 'number', paso: '0.01' },
                { nombre: 'Uniformes', id: 'uniformes', tipo: 'number', paso: '0.01' },
                { nombre: 'Checador', id: 'checador', tipo: 'number', paso: '0.01' },
                { nombre: 'Préstamo', id: 'prestamo', tipo: 'number', paso: '0.01' },
                { nombre: 'Tarjeta', id: 'tarjeta', tipo: 'number', paso: '0.01' }
            ]
        },
        nomina_pilar: {
            percepciones: [
                { nombre: 'Sueldo Semanal', id: 'salario_semanal', tipo: 'number', paso: '0.01' },
                { nombre: 'Extras', id: 'sueldo_extra_total', tipo: 'number', paso: '0.01' }
            ],
            deducciones: [
                { nombre: 'Retardos', id: 'retardos', tipo: 'number', paso: '0.01' },
                { nombre: 'Permiso', id: 'permiso', tipo: 'number', paso: '0.01' },
                { nombre: 'Inasistencias', id: 'inasistencia', tipo: 'number', paso: '0.01' },
                { nombre: 'Uniformes', id: 'uniformes', tipo: 'number', paso: '0.01' },
                { nombre: 'Checador', id: 'checador', tipo: 'number', paso: '0.01' },
                { nombre: 'Préstamo', id: 'prestamo', tipo: 'number', paso: '0.01' },
                { nombre: 'Tarjeta', id: 'tarjeta', tipo: 'number', paso: '0.01' }
            ]
        },
        nomina_relicario: {
            percepciones: [
                { nombre: 'Sueldo Semanal', id: 'salario_semanal', tipo: 'number', paso: '0.01' },
                { nombre: 'Extras', id: 'sueldo_extra_total', tipo: 'number', paso: '0.01' }
            ],
            deducciones: [
                { nombre: 'Retardos', id: 'retardos', tipo: 'number', paso: '0.01' },
                { nombre: 'ISR', id: 'isr', codigo: '45', tipo: 'number', paso: '0.01' },
                { nombre: 'IMSS', id: 'imss', codigo: '52', tipo: 'number', paso: '0.01' },
                { nombre: 'Ajuste al Sub', id: 'ajuste_sub', codigo: '107', tipo: 'number', paso: '0.01' },
                { nombre: 'Infonavit', id: 'infonavit', codigo: '16', tipo: 'number', paso: '0.01' },
                { nombre: 'Permiso', id: 'permiso', tipo: 'number', paso: '0.01' },
                { nombre: 'Inasistencias', id: 'inasistencia', tipo: 'number', paso: '0.01' },
                { nombre: 'Uniformes', id: 'uniformes', tipo: 'number', paso: '0.01' },
                { nombre: 'Checador', id: 'checador', tipo: 'number', paso: '0.01' },
                { nombre: 'Préstamo', id: 'prestamo', tipo: 'number', paso: '0.01' },
                { nombre: 'Tarjeta', id: 'tarjeta', tipo: 'number', paso: '0.01' }
            ]
        },
        nomina_confianza: {
            percepciones: [
                { nombre: 'Sueldo Semanal', id: 'sueldo_semanal', tipo: 'number', paso: '0.01' },
                { nombre: 'Extras', id: 'sueldo_extra_total', tipo: 'number', paso: '0.01' }
            ],
            deducciones: [
                { nombre: 'Retardos', id: 'retardos', tipo: 'number', paso: '0.01' },
                { nombre: 'ISR', id: 'isr', codigo: '45', tipo: 'number', paso: '0.01' },
                { nombre: 'IMSS', id: 'imss', codigo: '52', tipo: 'number', paso: '0.01' },
                { nombre: 'Ajuste al Sub', id: 'ajuste_sub', codigo: '107', tipo: 'number', paso: '0.01' },
                { nombre: 'Infonavit', id: 'infonavit', codigo: '16', tipo: 'number', paso: '0.01' },
                { nombre: 'Permiso', id: 'permiso', tipo: 'number', paso: '0.01' },
                { nombre: 'Inasistencias', id: 'inasistencia', tipo: 'number', paso: '0.01' },
                { nombre: 'Uniformes', id: 'uniformes', tipo: 'number', paso: '0.01' },
                { nombre: 'Checador', id: 'checador', tipo: 'number', paso: '0.01' },
                { nombre: 'Préstamo', id: 'prestamo', tipo: 'number', paso: '0.01' },
                { nombre: 'Tarjeta', id: 'tarjeta', tipo: 'number', paso: '0.01' }
            ]
        }
    };

    $('#selectorNomina').change(function() {
        const nominaSeleccionada = $(this).val();

        // Limpiar todos los campos al cambiar de nómina
        $('#seccionFormulario input').val('');
        $('#adicionalesPercepciones, #adicionalesDeducciones').empty();
        $('.tm-suggestions').removeClass('show').html('');
        calcularTotales();

        if (!nominaSeleccionada) {
            $('#seccionFormulario').attr('hidden', true);
            return;
        }

        $('#seccionFormulario').removeAttr('hidden');
        
        // Mostrar u ocultar campo de días laborados según la nómina
        const nominasConDias = ['nomina_huasteca', 'nomina_palmilla', 'nomina_pilar', 'nomina_relicario'];
        if (nominasConDias.includes(nominaSeleccionada)) {
            $('#groupDiasLaborados').removeAttr('hidden');
        } else {
            $('#groupDiasLaborados').attr('hidden', true);
        }

        initAutocomplete();
        cargarCamposNomina(nominaSeleccionada);
    });

    function initAutocomplete() {
        if ($('#suggestionsClave').length === 0) {
            $('#inputClave').after('<div id="suggestionsClave" class="tm-suggestions"></div>');
        }
        if ($('#suggestionsNombre').length === 0) {
            $('#inputNombre').after('<div id="suggestionsNombre" class="tm-suggestions"></div>');
        }

        let timeoutBusquedaClave = null;
        let timeoutBusquedaNombre = null;

        $('#inputClave').off('input').on('input', function() {
            const termino = $(this).val().trim();
            const nomina = $('#selectorNomina').val();

            if (timeoutBusquedaClave) {
                clearTimeout(timeoutBusquedaClave);
            }

            if (termino.length < 1) {
                $('#suggestionsClave').removeClass('show').html('');
                return;
            }

            timeoutBusquedaClave = setTimeout(function() {
                buscarEmpleados(termino, 'clave', 'suggestionsClave', nomina);
            }, 250);
        });

        $('#inputNombre').off('input').on('input', function() {
            const termino = $(this).val().trim();
            const nomina = $('#selectorNomina').val();

            if (timeoutBusquedaNombre) {
                clearTimeout(timeoutBusquedaNombre);
            }

            if (termino.length < 3) {
                $('#suggestionsNombre').removeClass('show').html('');
                return;
            }

            timeoutBusquedaNombre = setTimeout(function() {
                buscarEmpleados(termino, 'nombre', 'suggestionsNombre', nomina);
            }, 250);
        });

        $(document).off('click.autocompletado').on('click.autocompletado', function(e) {
            if (!$(e.target).closest('.tm-form-group').length) {
                $('.tm-suggestions').removeClass('show');
            }
        });
    }

    function buscarEmpleados(termino, tipo, contenedorId, nomina) {
        $.ajax({
            url: '/sistema_saao/tickets_manuales/php/buscar_empleado.php',
            method: 'GET',
            data: { query: termino, tipo: tipo, nomina: nomina },
            dataType: 'json',
            success: function(response) {
                console.log('Respuesta del servidor:', response);
                if (Array.isArray(response)) {
                    renderizarSugerencias(response, contenedorId);
                } else if (response.error) {
                    console.error('Error del PHP:', response.error);
                    $('#' + contenedorId).removeClass('show').html('');
                } else {
                    console.error('Respuesta inesperada:', response);
                    $('#' + contenedorId).removeClass('show').html('');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error en la busqueda:', status, error);
                console.log('Respuesta del servidor:', xhr.responseText);
                $('#' + contenedorId).removeClass('show').html('');
            }
        });
    }

    function renderizarSugerencias(empleados, contenedorId) {
        const container = $('#' + contenedorId);

        if (empleados.length === 0) {
            container.html('<div class="tm-no-results">No se encontraron empleados</div>').addClass('show');
            return;
        }

        container.empty();
        empleados.forEach(function(emp) {
            const $item = $(`
                <div class="tm-suggestion-item">
                    <div class="suggestion-nombre">${emp.nombre}</div>
                    <div class="suggestion-info">
                        <span><i class="bi bi-key"></i> ${emp.clave}</span>
                        <span><i class="bi bi-building"></i> ${emp.departamento || 'Sin depto'}</span>
                        <span><i class="bi bi-briefcase"></i> ${emp.puesto || 'Sin puesto'}</span>
                    </div>
                </div>
            `);
            $item.data('empleado', emp);
            container.append($item);
        });

        container.addClass('show');
    }

    $(document).off('click', '.tm-suggestion-item').on('click', '.tm-suggestion-item', function() {
        const datosEmpleado = $(this).data('empleado');
        seleccionarEmpleado(datosEmpleado);
    });

    function seleccionarEmpleado(empleado) {
        if (!empleado) return;
        $('#inputClave').val(empleado.clave || '');
        $('#inputNombre').val(empleado.nombre || '');
        $('#inputFechaIngreso').val(empleado.fecha_ingreso || '');
        $('#inputDepartamento').val(empleado.departamento || '');
        $('#inputPuesto').val(empleado.puesto || '');
        $('#inputSalarioDiario').val(empleado.salario_diario || '');
        $('#inputSalarioSemanal').val(empleado.salario_semanal || '');
        $('#inputDiasLaborados').val(empleado.dias_trabajados || '0');

        // Autocompletar el sueldo en la sección de percepciones
        const salario = empleado.salario_semanal || '';
        $('#sueldo_neto, #salario_semanal, #sueldo_semanal').val(salario);

        $('.tm-suggestions').removeClass('show').html('');
        
        // Recalcular totales después de autocompletar
        calcularTotales();
    }

    function cargarCamposNomina(nomina) {
        const config = configNominas[nomina];
        if (!config) return;

        let htmlPercepciones = '';
        config.percepciones.forEach(function(campo) {
            htmlPercepciones += `
                <div class="tm-form-group">
                    <label>${campo.nombre}</label>
                    <input type="${campo.tipo}" step="${campo.paso}" class="tm-input percepcion-input" 
                           id="${campo.id}" data-campo="${campo.id}" placeholder="0.00">
                </div>
            `;
        });
        $('#contenedorPercepciones').html(htmlPercepciones);

        let htmlDeducciones = '';
        config.deducciones.forEach(function(campo) {
            htmlDeducciones += `
                <div class="tm-form-group">
                    <label>${campo.nombre}</label>
                    <input type="${campo.tipo}" step="${campo.paso}" class="tm-input deduccion-input" 
                           id="${campo.id}" data-campo="${campo.id}" placeholder="0.00">
                </div>
            `;
        });
        $('#contenedorDeducciones').html(htmlDeducciones);

        // Calcular totales iniciales
        calcularTotales();
    }

    // Calcular totales en tiempo real
    function calcularTotales() {
        let totalPercepciones = 0;
        let totalDeducciones = 0;

        // Sumar percepciones fijas
        $('.percepcion-input').each(function() {
            const valor = parseFloat($(this).val()) || 0;
            totalPercepciones += valor;
        });

        // Sumar deducciones fijas
        $('.deduccion-input').each(function() {
            const valor = parseFloat($(this).val()) || 0;
            totalDeducciones += valor;
        });

        // Sumar adicionales
        $('#adicionalesPercepciones .dynamic-value').each(function() {
            const valor = parseFloat($(this).val()) || 0;
            totalPercepciones += valor;
        });

        $('#adicionalesDeducciones .dynamic-value').each(function() {
            const valor = parseFloat($(this).val()) || 0;
            totalDeducciones += valor;
        });

        const neto = totalPercepciones - totalDeducciones;

        // Formatear como moneda
        const money = (val) => '$ ' + val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        $('#totalPercepciones').text(money(totalPercepciones));
        $('#totalDeducciones').text(money(totalDeducciones));
        $('#netoRecibir').text(money(neto));
    }

    // Event listeners para el cálculo en tiempo real
    $(document).on('input', '.percepcion-input, .deduccion-input, .dynamic-value', function() {
        calcularTotales();
    });

    // También recalcular cuando se eliminan filas dinámicas
    const originalRemove = $.fn.remove;
    // Como el onclick está en línea en el HTML generado, mejor usamos delegación
    $(document).on('click', '.tm-btn-remove', function() {
        $(this).closest('.tm-row-dynamic').remove();
        calcularTotales();
    });

    // Funcionalidad para agregar conceptos dinámicos
    $('#btnAgregarPercepcion').click(function() {
        agregarCampoDinamico('adicionalesPercepciones', 'percepcion');
    });

    $('#btnAgregarDeduccion').click(function() {
        agregarCampoDinamico('adicionalesDeducciones', 'deduccion');
    });

    function agregarCampoDinamico(contenedorId, tipo) {
        const html = `
            <div class="tm-row-dynamic">
                <div class="tm-form-group">
                    <label>Concepto</label>
                    <input type="text" class="tm-input dynamic-name" placeholder="Ej. Bono Extra">
                </div>
                <div class="tm-form-group">
                    <label>Monto</label>
                    <input type="number" step="0.01" class="tm-input dynamic-value" placeholder="0.00">
                </div>
                <button type="button" class="tm-btn-remove">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        $(`#${contenedorId}`).append(html);
    }

    $('#btnLimpiar').click(function() {
        $('#seccionFormulario input').val('');
        $('#adicionalesPercepciones, #adicionalesDeducciones').empty();
        $('.tm-suggestions').removeClass('show').html('');
        calcularTotales();
    });

    $('#btnDescargarTicket').click(function() {
        const nominaSeleccionada = $('#selectorNomina').val();
        if (!nominaSeleccionada) {
            Swal.fire('Advertencia', 'Por favor seleccione una nómina', 'warning');
            return;
        }

        const nombreEmpleado = $('#inputNombre').val();
        if (!nombreEmpleado) {
            Swal.fire('Advertencia', 'Por favor seleccione o ingrese un empleado', 'warning');
            return;
        }

        const datos = {
            nomina: nominaSeleccionada,
            clave: $('#inputClave').val(),
            nombre: $('#inputNombre').val(),
            fechaIngreso: $('#inputFechaIngreso').val(),
            departamento: $('#inputDepartamento').val(),
            puesto: $('#inputPuesto').val(),
            semana: $('#inputSemana').val(),
            salarioDiario: $('#inputSalarioDiario').val(),
            salarioSemanal: $('#inputSalarioSemanal').val(),
            diasTrabajados: $('#inputDiasLaborados').val() || '0',
            percepciones: {},
            deducciones: {},
            adicionales: {
                percepciones: [],
                deducciones: []
            }
        };

        $('.percepcion-input').each(function() {
            const campo = $(this).data('campo');
            const valor = $(this).val();
            const nombre = $(this).prev('label').text();
            if (valor) {
                datos.percepciones[campo] = { nombre, monto: parseFloat(valor) };
            }
        });

        $('.deduccion-input').each(function() {
            const campo = $(this).data('campo');
            const valor = $(this).val();
            const nombre = $(this).prev('label').text();
            if (valor) {
                datos.deducciones[campo] = { nombre, monto: parseFloat(valor) };
            }
        });

        $('#adicionalesPercepciones .tm-row-dynamic').each(function() {
            const nombre = $(this).find('.dynamic-name').val();
            const valor = $(this).find('.dynamic-value').val();
            if (nombre && valor) {
                datos.adicionales.percepciones.push({ nombre, monto: parseFloat(valor) });
            }
        });

        $('#adicionalesDeducciones .tm-row-dynamic').each(function() {
            const nombre = $(this).find('.dynamic-name').val();
            const valor = $(this).find('.dynamic-value').val();
            if (nombre && valor) {
                datos.adicionales.deducciones.push({ nombre, monto: parseFloat(valor) });
            }
        });

        // Determinar el archivo PHP a llamar
        let archivoPHP = '';
        switch(nominaSeleccionada) {
            case 'nomina_40lbs': archivoPHP = 'descargar_40lbs.php'; break;
            case 'nomina_huasteca': archivoPHP = 'descargar_huasteca.php'; break;
            case 'nomina_palmilla': archivoPHP = 'descargar_palmilla.php'; break;
            case 'nomina_pilar': archivoPHP = 'descargar_pilar.php'; break;
            case 'nomina_relicario': archivoPHP = 'descargar_relicario.php'; break;
            case 'nomina_confianza': archivoPHP = 'descargar_confianza.php'; break;
            default: archivoPHP = 'descargar_confianza.php';
        }

        // Crear un formulario oculto para descargar el PDF
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '../php/' + archivoPHP;

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'datos';
        input.value = JSON.stringify(datos);
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    });
});