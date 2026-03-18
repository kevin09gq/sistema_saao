// ticket_manual_pilar.js - Lógica para ticket manual en nómina pilar

$(document).ready(function() {
    // Abrir modal de ticket manual
    // El botón debe tener un ID único o manejarse por clase. En Relicario parece que se usa btn_ticket_manual
    // Pero en Pilar el botón gris de ticket manual ahora abre la selección. 
    // Vamos a crear un nuevo evento o usar un botón diferente si es necesario.
    // El usuario dijo "ahora vamos hacer el manual", supongo que quiere un botón para esto.
    
    // Función para agregar percepciones dinámicas
    $('#btn_agregar_percepcion_manual').on('click', function() {
        const container = $('#percepciones-list-manual');
        const div = $('<div>').addClass('row g-2 mb-2 percepcion-item');
        div.html(`
            <div class="col-8">
                <input type="text" class="form-control" name="percepcion_nombre[]" placeholder="Nombre del concepto">
            </div>
            <div class="col-3">
                <input type="number" step="0.01" class="form-control" name="percepcion_valor[]" placeholder="0.00">
            </div>
            <div class="col-1">
                <button type="button" class="btn btn-sm btn-outline-danger btn-remove-item">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `);
        container.append(div);
    });

    // Función para agregar deducciones dinámicas
    $('#btn_agregar_deduccion_manual').on('click', function() {
        const container = $('#deducciones-list-manual');
        const div = $('<div>').addClass('row g-2 mb-2 deduccion-item');
        div.html(`
            <div class="col-8">
                <input type="text" class="form-control" name="deduccion_nombre[]" placeholder="Nombre del concepto">
            </div>
            <div class="col-3">
                <input type="number" step="0.01" class="form-control" name="deduccion_valor[]" placeholder="0.00">
            </div>
            <div class="col-1">
                <button type="button" class="btn btn-sm btn-outline-danger btn-remove-item">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `);
        container.append(div);
    });

    // Eliminar items dinámicos
    $(document).on('click', '.btn-remove-item', function() {
        $(this).closest('.row').remove();
    });

    // Manejar envío del formulario
    $('#formTicketManualPilar').on('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = {};

        // Convertir FormData a objeto simple
        for (let [key, value] of formData.entries()) {
            if (!key.includes('[]')) {
                data[key] = value || '';
            }
        }

        // Asegurar campos numéricos
        const camposNumericos = [
            'salario_semanal', 'pasaje', 'comida', 'tardeada',
            'retardos', 'isr', 'imss_descuento', 'ajuste_sub', 'infonavit',
            'permiso', 'inasistencia', 'uniforme', 'checador', 'prestamo', 'tarjeta'
        ];
        
        camposNumericos.forEach(campo => {
            if (!data[campo] || data[campo] === '') {
                data[campo] = 0;
            }
        });

        // Procesar dinámicos
        data.conceptos_adicionales = [];
        const nombresPercepcion = formData.getAll('percepcion_nombre[]');
        const valoresPercepcion = formData.getAll('percepcion_valor[]');
        for (let i = 0; i < nombresPercepcion.length; i++) {
            if (nombresPercepcion[i] && valoresPercepcion[i]) {
                data.conceptos_adicionales.push({
                    nombre: nombresPercepcion[i],
                    valor: parseFloat(valoresPercepcion[i]) || 0
                });
            }
        }

        data.conceptos = [];
        const nombresDeduccion = formData.getAll('deduccion_nombre[]');
        const valoresDeduccion = formData.getAll('deduccion_valor[]');
        for (let i = 0; i < nombresDeduccion.length; i++) {
            if (nombresDeduccion[i] && valoresDeduccion[i]) {
                data.conceptos.push({
                    nombre: nombresDeduccion[i],
                    resultado: parseFloat(valoresDeduccion[i]) || 0
                });
            }
        }

        Swal.fire({
            title: 'Generando ticket...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        fetch(rutaRaiz + '/nomina_pilar/php/generar_ticket_manual.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(async response => {
            if (!response.ok) {
                const text = await response.text();
                console.error('Error del servidor:', text);
                throw new Error('Error al generar el ticket: ' + text);
            }
            return response.blob();
        })
        .then(blob => {
            Swal.close();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ticket_manual_pilar_' + new Date().getTime() + '.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            Swal.fire({
                icon: 'success',
                title: '¡Ticket generado!',
                text: 'El ticket se ha descargado correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        })
        .catch(error => {
            Swal.close();
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar el ticket manual.'
            });
        });
    });

    // Búsqueda de empleados por clave o nombre (Autocompletado)
    const setupAutocomplete = (inputId, suggestionId, field) => {
        $(`#${inputId}`).on('input', function() {
            const query = $(this).val().trim();
            const $suggestions = $(`#${suggestionId}`);
            
            if (query.length < 1) {
                $suggestions.hide();
                return;
            }

            $.ajax({
                url: rutaRaiz + '/nomina_pilar/php/buscar_empleado.php',
                method: 'GET',
                data: { query: query, tipo: field },
                dataType: 'json',
                success: function(response) {
                    if (Array.isArray(response) && response.length > 0) {
                        $suggestions.empty().show();
                        response.forEach(emp => {
                            const item = $('<button>')
                                .addClass('list-group-item list-group-item-action')
                                .html(`<strong>${emp.clave_empleado}</strong> - ${emp.nombre_completo}`)
                                .on('click', function(e) {
                                    e.preventDefault();
                                    llenarCamposManual(emp);
                                    $suggestions.hide();
                                });
                            $suggestions.append(item);
                        });
                    } else {
                        $suggestions.hide();
                    }
                }
            });
        });
    };

    setupAutocomplete('input_clave_manual', 'suggestions_clave_manual', 'clave');
    setupAutocomplete('input_nombre_manual', 'suggestions_nombre_manual', 'nombre');

    function llenarCamposManual(emp) {
        const form = $('#formTicketManualPilar');
        form.find('input[name="clave"]').val(emp.clave_empleado);
        form.find('input[name="nombre"]').val(emp.nombre_completo);
        form.find('input[name="departamento"]').val(emp.departamento || '');
        form.find('input[name="nombre_puesto"]').val(emp.puesto || '');
        form.find('input[name="fecha_ingreso"]').val(emp.fecha_ingreso || '');
        form.find('input[name="salario_diario"]').val(emp.salario_diario || 0);
        form.find('input[name="salario_semanal"]').val(emp.salario_semanal || 0);
        
        // Sincronizar salario semanal en percepciones
        form.find('input[name="salario_semanal"]').last().val(emp.salario_semanal || 0);
    }

    // Cerrar sugerencias al hacer clic fuera
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.position-relative').length) {
            $('.list-group').hide();
        }
    });
});
