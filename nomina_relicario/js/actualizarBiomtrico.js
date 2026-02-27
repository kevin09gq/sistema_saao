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
    });
}

function listarEmpleados() {
    // vaciar lista
    $('#lista-empleados-biometrico').empty();

    if (!jsonNominaRelicario || !Array.isArray(jsonNominaRelicario.departamentos)) {
        return;
    }

    jsonNominaRelicario.departamentos.forEach(depto => {
        if (!Array.isArray(depto.empleados)) return;
        depto.empleados.forEach(emp => {
            if (emp.mostrar === false) return; // omitir
            const item = `
                <label class="list-group-item">
                    <input type="checkbox" class="form-check-input me-2" value="${emp.clave}">
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

function subirBiometrico() {
    // manejar clic en siguiente para mostrar el input de archivo
    $(document).on('click', '#btn-siguiente-biometrico', function () {
        const boton = $(this);
        const listaOculta = $('#lista-empleados-biometrico').is(':hidden');

        // FASE 1: Mostrar interfaz de archivo
        if (!listaOculta) {
            // validar al menos uno seleccionado
            const marcados = $('#lista-empleados-biometrico input:checked');
            if (marcados.length === 0) {
                alert('Selecciona al menos un empleado');
                return;
            }

            // ocultar controles anteriores
            $('#lista-empleados-biometrico').hide();
            $('#buscar-empleado-biometrico').closest('.mb-3').hide();
            // mostrar sección de archivo
            $('#seccion-archivo-biometrico').show();
            boton.text('Procesar archivo');
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
        const clavesSeleccionadas = $('#lista-empleados-biometrico input:checked').map(function() {
            return $(this).val();
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
                    unirBiometricoConSeleccionados(jsonNominaRelicario, JsonBiometrico, clavesSeleccionadas);

                    // Recalcular por empleado seleccionado: retardos, inasistencias y olvidos
                    clavesSeleccionadas.forEach(clave => {
                        const emp = obtenerEmpleadoPorClave(clave);
                        if (!emp) return;

                        if (typeof asignarHistorialRetardos === 'function') {
                            asignarHistorialRetardos(emp);
                            if (typeof asignarTotalRetardosCoordinador === 'function') {
                                asignarTotalRetardosCoordinador(emp, true);
                            }
                        }

                        if (typeof asignarHistorialInasistencias === 'function') {
                            asignarHistorialInasistencias(emp);
                            if (typeof asignarTotalInasistenciasCoordinador === 'function') {
                                asignarTotalInasistenciasCoordinador(emp, true);
                            }
                        }

                        if (typeof asignarHistorialOlvidos === 'function') {
                            asignarHistorialOlvidos(emp);
                            if (typeof asignarTotalOlvidosCoordinador === 'function') {
                                asignarTotalOlvidosCoordinador(emp, true);
                            }
                        }
                    });

                    // Actualizar tabla manteniendo filtrado y pagination
                    const jsonFiltrado = window.jsonFiltrado || filtrarEmpleadosPorDepartamento(jsonNominaRelicario, 7);
                    const paginaActual = window.paginaActualNomina || 1;
                    mostrarDatosTabla(jsonFiltrado, paginaActual);

                    // Cerrar modal y limpiar
                    const modal = bootstrap.Modal.getInstance(document.getElementById('biometricoModal'));
                    if (modal) modal.hide();

                    // Limpiar formulario
                    $('#archivo-biometrico-modal').val('');
                    resetearModalBiometrico();

                    alert('Biométrico actualizado correctamente');

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
}

// Helper: buscar empleado por clave en la nómina
function obtenerEmpleadoPorClave(clave) {
    if (!jsonNominaRelicario || !Array.isArray(jsonNominaRelicario.departamentos)) {
        return null;
    }
    for (const depto of jsonNominaRelicario.departamentos) {
        if (!Array.isArray(depto.empleados)) continue;
        for (const emp of depto.empleados) {
            if (String(emp.clave) === String(clave)) {
                return emp;
            }
        }
    }
    return null;
}

// Unir registros de biométrico solo con empleados seleccionados
function unirBiometricoConSeleccionados(jsonNominaRelicario, JsonBiometrico, clavesSeleccionadas) {
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

    // Recorrer departamentos y actualizar SOLO empleados seleccionados
    if (jsonNominaRelicario && jsonNominaRelicario.departamentos) {
        jsonNominaRelicario.departamentos.forEach(depto => {
            if (depto.empleados) {
                depto.empleados.forEach(emp => {
                    // Solo procesar si esta clave fue seleccionada
                    if (clavesSeleccionadas.includes(String(emp.clave))) {
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
    // Mostrar lista y búsqueda
    $('#lista-empleados-biometrico').show();
    $('#buscar-empleado-biometrico').closest('.mb-3').show();
    // Ocultar sección de archivo
    $('#seccion-archivo-biometrico').hide();
    // Limpiar búsqueda
    $('#buscar-empleado-biometrico').val('');
    // Mostrar todos los items
    $('#lista-empleados-biometrico .list-group-item').show();
    // Botón vuelve a "Siguiente"
    $('#btn-siguiente-biometrico').text('Siguiente');
}

