
function saveAndClearNominaConfianza() {
     $('#btn_guardar_nomina_confianza').on('click', function () {
        Swal.fire({
            title: '¿Confirmar guardado?',
            text: `¿Está seguro que desea guardar la nómina de la semana ${jsonNominaConfianza.numero_semana}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                guardarNominaConfianza();
            }
        });
    });

    $('#btn_limpiar_datos').on('click', function () {
        Swal.fire({
            title: '¿Limpiar datos?',
            text: '¿Está seguro que desea limpiar todos los datos? Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, limpiar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                limpiarDatos();
            }
        });
    });
}
function guardarNominaConfianza() {
    const jsonData = jsonNominaConfianza;
    const numeroSemana = jsonData.numero_semana;
    
    // IMPORTANTE: Usar fecha_cierre para determinar el año (NO fecha_inicio)
    // Esto es crítico para semanas que cruzan el cambio de año
    // Ejemplo: Semana 1 del 2026 que va del 27/Dic/2025 al 02/Ene/2026
    let anio = null;
    if (jsonData.fecha_cierre) {
        const partes = jsonData.fecha_cierre.split('/');
        anio = parseInt(partes[2]);
        if (!anio || isNaN(anio)) {
            anio = new Date().getFullYear();
        }
    } else if (jsonData.fecha_inicio) {
        // Fallback solo si no existe fecha_cierre
        const partes = jsonData.fecha_inicio.split('/');
        anio = parseInt(partes[2]);
        if (!anio || isNaN(anio)) {
            anio = new Date().getFullYear();
        }
    } else {
        anio = new Date().getFullYear();
    }
    
    // Log para debugging
    console.log('=== GUARDANDO NÓMINA ===');
    console.log('Semana:', numeroSemana);
    console.log('Año extraído:', anio);
    console.log('Fecha inicio:', jsonData.fecha_inicio);
    console.log('Fecha cierre:', jsonData.fecha_cierre);
    console.log('=========================')

    $.ajax({
        url: '../php/saveNominaConfianza.php',
        type: 'POST',
        data: JSON.stringify({
            id_empresa: 1,
            numero_semana: numeroSemana,
            anio: anio,
            nomina: JSON.stringify(jsonData),
            actualizar: true
        }),
        contentType: 'application/json; charset=UTF-8',
        success: function (response) {
            if (response.success) {
                Swal.fire({
                    title: 'Éxito',
                    text: response.message || 'Nómina guardada exitosamente.',
                    icon: 'success'
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.message || 'Error al guardar la nómina.',
                    icon: 'error'
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.fire({
                title: 'Error',
                text: `Error de comunicación con el servidor: ${error}`,
                icon: 'error'
            });
        }
    });
}

function limpiarDatos() {
    clearNomina();
    limpiarFiltrosYBusqueda();
    jsonNominaConfianza = null;
    $('#tabla-nomina-responsive').attr('hidden', true);
    $('#container-nomina').removeAttr('hidden');
    $('#form_excel')[0].reset();
    
    Swal.fire({
        title: 'Datos eliminados',
        text: 'Todos los datos han sido limpiados exitosamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

// Obtener nómina guardada por número de semana y año (devuelve JSON almacenado)
function obtenerNominaConfianzaPorSemana(numeroSemana, anio, onEncontrada, onNoEncontrada, onError) {
    $.ajax({
        url: '../php/getNominaConfianza.php',
        type: 'POST',
        data: JSON.stringify({
            id_empresa: 1,            // Empresa fija (ajustar si cambia)
            numero_semana: numeroSemana,
            anio: anio
        }),
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        success: function (response) {
            if (response && response.success && response.found) {
                if (typeof onEncontrada === 'function') onEncontrada(response.nomina);
            } else if (response && response.success && !response.found) {
                if (typeof onNoEncontrada === 'function') onNoEncontrada();
            } else {
                if (typeof onError === 'function') onError('Respuesta inválida del servidor');
            }
        },
        error: function (xhr, status, error) {
            if (typeof onError === 'function') onError(error || 'Error de comunicación');
        }
    });
}

// ========================================
// ACTUALIZAR REGISTROS BIOMÉTRICOS
// ========================================

function aplicarActualizarRegistrosBiometricos() {
      // Botón para actualizar registros biométricos
    $('#btn_actualizar_horarios').on('click', function() {
        if (typeof actualizarRegistrosBiometricos === 'function') {
            actualizarRegistrosBiometricos();
            limpiarFiltrosYBusqueda(); // Limpiar filtros y búsqueda tras actualización
        } else {
            alert('La función de actualización no está disponible.');
        }
    });

}
// Función para actualizar nómina guardada con nuevos registros biométricos
function actualizarRegistrosBiometricos() {
    // Verificar que exista una nómina cargada
    if (!jsonNominaConfianza || !jsonNominaConfianza.numero_semana) {
        Swal.fire({
            title: 'Error',
            text: 'No hay nómina cargada. Por favor, procesa primero los archivos.',
            icon: 'error'
        });
        return;
    }

    // Mostrar diálogo para subir archivo biométrico
    Swal.fire({
        title: 'Actualizar Registros Biométricos',
        html: `
            <p>Sube el archivo Excel del biométrico para actualizar los registros de la semana ${jsonNominaConfianza.numero_semana}.</p>
            <input type="file" id="archivo_biometrico_actualizar" accept=".xls,.xlsx" class="swal2-input" style="width: 80%;">
        `,
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const fileInput = document.getElementById('archivo_biometrico_actualizar');
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                Swal.showValidationMessage('Debes seleccionar un archivo');
                return false;
            }
            return fileInput.files[0];
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            procesarActualizacionBiometrico(result.value);
        }
    });
}

// Procesar el archivo biométrico y actualizar la nómina
function procesarActualizacionBiometrico(archivoBiometrico) {
    // Mostrar indicador de carga
    Swal.fire({
        title: 'Procesando...',
        text: 'Leyendo archivo biométrico',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('archivo_excel2', archivoBiometrico);

    // Enviar archivo al servidor para procesarlo
    $.ajax({
        url: '../php/leer_biometrico.php',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            try {
                const JsonBiometrico = JSON.parse(response);
                
                // Unir los registros del biométrico con la nómina actual
                unirRegistrosBiometricos(jsonNominaConfianza, JsonBiometrico);
                
                // Limpiar eventos especiales antes de recalcular
                limpiarEventosEspeciales(jsonNominaConfianza);
                
                // Ejecutar detección de eventos automáticos
                if (typeof detectarEventosAutomaticos === 'function') {
                    detectarEventosAutomaticos(jsonNominaConfianza);
                }
                
                // Guardar en localStorage
                if (typeof saveNomina === 'function') {
                    saveNomina(jsonNominaConfianza);
                }
                
                // Actualizar visualización de la tabla
                if (typeof mostrarDatosTabla === 'function') {
                    mostrarDatosTabla(jsonNominaConfianza);
                }
                
             
                
                Swal.fire({
                    title: 'Éxito',
                    text: 'Registros biométricos actualizados correctamente.',
                    icon: 'success'
                });
                
            } catch (e) {
              
                Swal.fire({
                    title: 'Error',
                    text: 'Error al procesar el archivo biométrico.',
                    icon: 'error'
                });
            }
        },
        error: function (xhr, status, error) {
        
            Swal.fire({
                title: 'Error',
                text: 'Error al leer el archivo biométrico: ' + error,
                icon: 'error'
            });
        }
    });
}

// Función para unir registros biométricos con nómina existente
function unirRegistrosBiometricos(nominaExistente, JsonBiometrico) {
    // Normalizar nombres para comparación
    const normalizar = s => s
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase()
        .split(" ")
        .sort()
        .join(" ");

    // Crear mapa de empleados del biométrico por nombre normalizado
    const empleadosBiometricoMap = {};
    if (JsonBiometrico && JsonBiometrico.empleados) {
        JsonBiometrico.empleados.forEach(emp => {
            empleadosBiometricoMap[normalizar(emp.nombre)] = emp;
        });
    }

    // Recorrer todos los departamentos y empleados de la nómina
    if (nominaExistente && nominaExistente.departamentos) {
        nominaExistente.departamentos.forEach(departamento => {
            if (departamento.empleados) {
                // Verificar si es el departamento "sin seguro"
                const esDepartamentoSinSeguro = departamento.nombre && 
                    departamento.nombre.toLowerCase().trim() === "sin seguro";
                
                // Filtrar o actualizar empleados según el departamento
                const empleadosFiltrados = departamento.empleados.filter(empleado => {
                    const nombreNormalizado = normalizar(empleado.nombre);
                    
                    // Si encontramos el empleado en el biométrico, actualizar sus registros
                    if (empleadosBiometricoMap[nombreNormalizado]) {
                        const empBiometrico = empleadosBiometricoMap[nombreNormalizado];
                        empleado.registros = empBiometrico.registros || [];
                        
                        return true; // Mantener empleado
                    } else {
                        // Si NO está en el biométrico
                        if (esDepartamentoSinSeguro) {
                            // Solo eliminar empleados del departamento "sin seguro"
                            return false; // Eliminar empleado
                        } else {
                            // Para otros departamentos, mantener empleado pero sin registros nuevos
                             // No modificar registros existentes
                            return true; // Mantener empleado
                        }
                    }
                });
                
                // Actualizar la lista de empleados del departamento
                departamento.empleados = empleadosFiltrados;
            }
        });
        
        // Eliminar departamentos que quedaron vacíos
        nominaExistente.departamentos = nominaExistente.departamentos.filter(departamento => {
            return departamento.empleados && departamento.empleados.length > 0;
        });
    }
}

// Función para limpiar todos los eventos especiales de cada empleado
function limpiarEventosEspeciales(nominaExistente) {
    if (!nominaExistente || !nominaExistente.departamentos) return;
    
    nominaExistente.departamentos.forEach(departamento => {
        if (departamento.empleados) {
            departamento.empleados.forEach(empleado => {
                // Limpiar historial de retardos
                empleado.historial_retardos = [];
                empleado.retardos = 0;
                
                // PRESERVAR INASISTENCIAS MANUALES - solo limpiar las automáticas
                if (Array.isArray(empleado.historial_inasistencias)) {
                    empleado.historial_inasistencias = empleado.historial_inasistencias.filter(
                        inasistencia => inasistencia && inasistencia.tipo === 'manual'
                    );
                } else {
                    empleado.historial_inasistencias = [];
                }
                
                // Recalcular total de inasistencias manteniendo solo las manuales
                let totalInasistenciasManual = 0;
                if (Array.isArray(empleado.historial_inasistencias)) {
                    empleado.historial_inasistencias.forEach(inasistencia => {
                        totalInasistenciasManual += parseFloat(inasistencia.descuento_inasistencia) || 0;
                    });
                }
                empleado.inasistencia = totalInasistenciasManual;
                empleado.inasistencias_contadas = empleado.historial_inasistencias.length;
                
                // Limpiar historial de olvidos
                empleado.historial_olvidos = [];
                empleado.checador = 0;
              
                
                // Limpiar historial de entradas tempranas
                empleado.historial_entradas_tempranas = [];
                
                // Limpiar historial de salidas tardías
                empleado.historial_salidas_tardias = [];
                
                // Limpiar historial de salidas tempranas
                empleado.historial_salidas_tempranas = [];
                
                
            });
        }
    });
   
}