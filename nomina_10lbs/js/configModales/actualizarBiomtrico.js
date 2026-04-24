// cuando se presione el botón se abrirá el modal
abrirModalBiometrico();
subirBiometrico(); // inicializar listener del botón siguiente

function abrirModalBiometrico() {
    $("#btn_actualizar_biometrico").click(function (e) {
        e.preventDefault();


        // antes de mostrar, resetear estado y poblar lista
        resetearModalBiometrico();
        listarEmpleados();
        // crear instancia y mostrar modal
        const modalEl = document.getElementById('biometricoModal');
        if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }

        buscarEmpleados(); // activar búsqueda al abrir modal
        inicializarSelectoresToolBiometrico(); // activar botones de seleccionar/deseleccionar
    });
}

function listarEmpleados() {
    // vaciar lista
    $('#lista-empleados-biometrico').empty();

    if (!jsonNomina10lbs || !Array.isArray(jsonNomina10lbs.departamentos)) {
        return;
    }

    jsonNomina10lbs.departamentos.forEach(depto => {
        if (!Array.isArray(depto.empleados)) return;
        depto.empleados.forEach(emp => {
            if (emp.mostrar === false) return; // omitir
            const item = `
                <label class="list-group-item">
                    <input type="checkbox" class="form-check-input me-2" data-empresa="${emp.id_empresa}" value="${emp.clave}">
                    ${emp.nombre} <small class="text-muted">(${emp.clave})</small>
                </label>
            `;
            $('#lista-empleados-biometrico').append(item);
        });
    });
}

function buscarEmpleados() {
    // asocia el evento keyup al input de búsqueda
    $('#buscar-empleado-biometrico').on('keyup', function () {
        const texto = $(this).val().toLowerCase();
        $('#lista-empleados-biometrico .list-group-item').each(function () {
            const contenido = $(this).text().toLowerCase();
            $(this).toggle(contenido.indexOf(texto) !== -1);
        });
    });
}

// ========================================
// SELECCIONAR/DESELECCIONAR TODOS
// ========================================

function inicializarSelectoresToolBiometrico() {
    // Botón Seleccionar Todo
    $(document).on('click', '#btn-seleccionar-todos-biometrico', function () {
        seleccionarTodosBiometrico();
    });

    // Botón Deseleccionar Todo
    $(document).on('click', '#btn-deseleccionar-todos-biometrico', function () {
        deseleccionarTodosBiometrico();
    });
}

function seleccionarTodosBiometrico() {
    // Seleccionar solo los checkboxes visibles (después de filtrar con búsqueda)
    $('#lista-empleados-biometrico .list-group-item:visible input[type="checkbox"]').prop('checked', true);
}

function deseleccionarTodosBiometrico() {
    // Deseleccionar todos los checkboxes visibles
    $('#lista-empleados-biometrico .list-group-item:visible input[type="checkbox"]').prop('checked', false);
}

function subirBiometrico() {
    // manejar clic en siguiente para mostrar el input de archivo
    $(document).on('click', '#btn-siguiente-biometrico', function () {
        const boton = $(this);
        const listaOculta = $('#lista-empleados-biometrico').is(':hidden') || $('#seccion-seleccion-biometrico').is(':hidden');

        // FASE 1: Mostrar interfaz de archivo
        if (!listaOculta) {
            // validar al menos uno seleccionado
            const marcados = $('#lista-empleados-biometrico input:checked');
            if (marcados.length === 0) {
                alert('Selecciona al menos un empleado');
                return;
            }

            // ocultar controles anteriores
            if ($('#seccion-seleccion-biometrico').length > 0) {
                $('#seccion-seleccion-biometrico').hide();
            } else {
                $('#lista-empleados-biometrico').hide();
                $('#buscar-empleado-biometrico').closest('.mb-3').hide();
            }
            
            // mostrar sección de archivo
            $('#seccion-archivo-biometrico').show();
            boton.html('<span>Procesar archivo</span> <i class="bi bi-gear-fill ms-2"></i>');
            return;
        }

        // FASE 2: Procesar archivo y actualizar biométrico
        const archivo = $('#archivo-biometrico-modal')[0].files[0];
        if (!archivo) {
            alert('Selecciona un archivo Excel');
            return;
        }

        // Deshabilitar botón durante procesamiento
        boton.prop('disabled', true).text('Procesando...');

        // Obtener claves de empleados seleccionados
        const clavesSeleccionadas = $('#lista-empleados-biometrico input:checked').map(function () {
            return {
                clave: $(this).val(),
                id_empresa: $(this).data('empresa')
            };
        }).get();

        // Procesar archivo biométrico
        const formData = new FormData();
        formData.append('archivo_excel2', archivo);

        $.ajax({
            url: '../php/leerBiometrico.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                try {
                    const JsonBiometrico = JSON.parse(res);

                    // Unir biométrico solo con empleados seleccionados
                    unirBiometricoConSeleccionados(jsonNomina10lbs, JsonBiometrico, clavesSeleccionadas);

                    // Recalcular eventos por empleado seleccionado
                    clavesSeleccionadas.forEach(obj => {
                        const emp = obtenerEmpleadoPorClave(obj.clave, obj.id_empresa);
                        if (!emp) {
                            console.warn(`No se encontró empleado con clave ${obj.clave}`);
                            return;
                        }
                        // Actualizar evntos, checador, etc. según registros nuevos

                        asignarHistorialOlvidos(emp);
                        asignarTotalOlvidos(emp);

                    });

                    // Cerrar modal y limpiar
                    const modal = bootstrap.Modal.getInstance(document.getElementById('biometricoModal'));
                    if (modal) modal.hide();

                    // Limpiar formulario
                    $('#archivo-biometrico-modal').val('');
                    resetearModalBiometrico();

                    alert('Biométrico actualizado correctamente');

                   refrescarTabla(); // función para actualizar la tabla principal con los nuevos datos

                } catch (e) {
                    console.error('Error al procesar biométrico:', e);
                    alert('Error al procesar el archivo');
                } finally {
                    boton.prop('disabled', false).text('Procesar archivo');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error al leer biométrico:', error);
                alert('Error al procesar el archivo');
                boton.prop('disabled', false).text('Procesar archivo');
            }
        });
    });

    // --- ACCIÓN BOTÓN REGRESAR ---
    $(document).on('click', '#btn-regresar-biometrico', function () {
        resetearModalBiometrico();
    });
}

// Helper: buscar empleado por clave en la nómina
function obtenerEmpleadoPorClave(clave, id_empresa) {
    if (!jsonNomina10lbs || !Array.isArray(jsonNomina10lbs.departamentos)) {
        return null;
    }
    for (const depto of jsonNomina10lbs.departamentos) {
        if (!Array.isArray(depto.empleados)) continue;
        for (const emp of depto.empleados) {
            if (String(emp.clave) === String(clave) && String(emp.id_empresa) === String(id_empresa)) {
                return emp;
            }
        }
    }
    return null;
}

// Unir registros de biométrico solo con empleados seleccionados
function unirBiometricoConSeleccionados(jsonNomina10lbs, JsonBiometrico, clavesSeleccionadas) {
    // Normalizar nombres para comparación exacta (mismo algoritmo que process_excel.js)
    const normalizar = s => s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase()
        .split(" ")
        .sort()
        .join(" ");

    // Crear mapa de biométrico para búsqueda rápida
    const empleados2Map = {};
    if (JsonBiometrico && JsonBiometrico.empleados) {
        JsonBiometrico.empleados.forEach(emp => {
            empleados2Map[normalizar(emp.nombre)] = emp;
        });
    }

    // Parámetro 'clavesSeleccionadas' es array de objetos {clave,id_empresa}
    const seleccionadosSet = new Set(clavesSeleccionadas.map(o => String(o.clave) + '|' + String(o.id_empresa)));

    // Recorrer departamentos y actualizar SOLO empleados seleccionados
    if (jsonNomina10lbs && jsonNomina10lbs.departamentos) {
        jsonNomina10lbs.departamentos.forEach(depto => {
            if (depto.empleados) {
                depto.empleados.forEach(emp => {
                    // Solo procesar si esta clave+empresa fue seleccionada
                    if (seleccionadosSet.has(String(emp.clave) + '|' + String(emp.id_empresa))) {
                        const empBio = empleados2Map[normalizar(emp.nombre)];
                        if (empBio) {
                            // Copiar registros del biométrico
                            emp.registros = empBio.registros || [];
                        }
                    }
                });
            }
        });
    }
}

// Resetear modal a estado inicial
function resetearModalBiometrico() {
    // Usar IDs de sección optimizados si existen
    if ($('#seccion-seleccion-biometrico').length > 0) {
        $('#seccion-seleccion-biometrico').show();
    } else {
        // Fallback
        $('#lista-empleados-biometrico').show();
        $('#buscar-empleado-biometrico').closest('.mb-3').show();
    }

    // Ocultar sección de archivo
    $('#seccion-archivo-biometrico').hide();
    
    // Limpiar búsqueda y archivo
    $('#buscar-empleado-biometrico').val('');
    $('#archivo-biometrico-modal').val('');

    // Mostrar todos los items de la lista
    $('#lista-empleados-biometrico .list-group-item').show();

    // Botón vuelve a "Siguiente"
    $('#btn-siguiente-biometrico').html('<span>Siguiente</span> <i class="bi bi-arrow-right ms-2"></i>');
}
