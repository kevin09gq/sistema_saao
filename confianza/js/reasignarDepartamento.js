// Función auxiliar para mapear nombre de departamento a id
function mapearDepartamentoAId(nombreDepartamento) {
    if (!nombreDepartamento) return null;
    
    const nombreDeptRaw = String(nombreDepartamento || '').trim();
    const nombreDept = nombreDeptRaw.replace(/^\s*\d+\s+/, '').trim();
    const nombreLower = nombreDept.toLowerCase();
    
    if (nombreLower === 'administracion') return 1;
    else if (nombreLower === 'produccion') return 2;
    else if (nombreLower === 'seguridad vigilancia e intendencia') return 3;
    else if (nombreLower === 'administracion sucursal cdmx') return 9;
    
    return null;
}

// Función auxiliar para obtener nombre de departamento por id
function obtenerNombreDepartamentoPorId(id) {
    switch(id) {
        case 1: return 'Administracion';
        case 2: return 'Produccion';
        case 3: return 'Seguridad Vigilancia e Intendencia';
        case 9: return 'Administracion Sucursal CdMx';
        default: return 'Sin Departamento Asignado';
    }
}

// Variable global para almacenar la nómina
var jsonNominaConfianzaReasignar = null;

// Función para mostrar el modal de reasignación
function mostrarModalReasignar() {
    $('#btnReasignarDepartamento').on('click', function() {
        // Obtener la nómina actual del proceso principal
        if (typeof jsonNominaConfianza !== 'undefined' && jsonNominaConfianza) {
            jsonNominaConfianzaReasignar = jsonNominaConfianza;
        } else {
            // Intentar cargar desde localStorage
            try {
                const guardada = loadNomina();
                if (guardada) {
                    jsonNominaConfianzaReasignar = guardada;
                }
            } catch (e) {
                console.error('No se pudo cargar la nómina');
            }
        }
        
        if (!jsonNominaConfianzaReasignar) {
            Swal.fire('Error', 'No hay datos de nómina disponibles', 'error');
            return;
        }
        
        // Cargar la estructura actual
        cargarEstructuraDepartamentos();
        // Mostrar el modal
        $('#modalReasignarDepartamento').modal('show');
    });
}

// Cargar la estructura de departamentos y empleados
function cargarEstructuraDepartamentos() {
    if (!jsonNominaConfianzaReasignar || !jsonNominaConfianzaReasignar.departamentos) {
        $('#estructuraDepartamentos').html('<p class="text-danger">No hay datos de nómina disponibles</p>');
        return;
    }

    let html = '';
    
    // Llenar el select de departamentos destino
    let opcionesDepartamentos = '<option value="">-- Seleccionar departamento --</option>';
    
    // Primero procesar departamentos normales (no "sin seguro")
    jsonNominaConfianzaReasignar.departamentos.forEach((departamento, index) => {
        if (departamento.nombre && departamento.nombre.toLowerCase() !== 'sin seguro' && 
            departamento.empleados && departamento.empleados.length > 0) {
            // Agregar opción al select
            opcionesDepartamentos += `<option value="${index}">${departamento.nombre}</option>`;
            
            // Mostrar departamento y sus empleados
            html += `
                <div class="card mb-2">
                    <div class="card-header bg-primary text-white">
                        <strong>${departamento.nombre}</strong> (${departamento.empleados.length} empleados)
                    </div>
                    <div class="card-body p-2">
            `;
            
            departamento.empleados.forEach(empleado => {
                // Solo mostrar empleados con mostrar = true
                if (empleado.mostrar !== false) {
                    html += `
                        <div class="form-check mb-1">
                            <input class="form-check-input checkbox-empleado" 
                                   type="checkbox" 
                                   value="${empleado.clave}" 
                                   data-depto-origen="${index}"
                                   data-id-empresa="${empleado.id_empresa || 1}"
                                   id="emp_${empleado.clave}_${empleado.id_empresa || 1}">
                            <label class="form-check-label" for="emp_${empleado.clave}_${empleado.id_empresa || 1}">
                                ${empleado.nombre} (Clave: ${empleado.clave})
                            </label>
                        </div>
                    `;
                }
            });
            
            html += '</div></div>';
        }
    });
    
    // Procesar empleados de "sin seguro" y agruparlos por id_departamento
    const deptoSinSeguro = jsonNominaConfianzaReasignar.departamentos.find(
        dept => dept.nombre && dept.nombre.toLowerCase() === 'sin seguro'
    );
    
    if (deptoSinSeguro && deptoSinSeguro.empleados && deptoSinSeguro.empleados.length > 0) {
        // Agrupar empleados por id_departamento
        const empleadosPorDepartamento = {};
        
        deptoSinSeguro.empleados.forEach(empleado => {
            // Solo procesar empleados con mostrar = true
            if (empleado.mostrar !== false) {
                const idDepto = empleado.id_departamento || 'sin_asignar';
                if (!empleadosPorDepartamento[idDepto]) {
                    empleadosPorDepartamento[idDepto] = [];
                }
                empleadosPorDepartamento[idDepto].push(empleado);
            }
        });
        
        // Mostrar cada grupo de empleados "sin seguro" en su departamento correspondiente
        Object.keys(empleadosPorDepartamento).forEach(idDepto => {
            const empleadosGrupo = empleadosPorDepartamento[idDepto];
            const nombreDepto = obtenerNombreDepartamentoPorId(parseInt(idDepto)) + ' (Sin Seguro)';
            
            html += `
                <div class="card mb-2">
                    <div class="card-header bg-warning text-dark">
                        <strong>${nombreDepto}</strong> (${empleadosGrupo.length} empleados)
                    </div>
                    <div class="card-body p-2">
            `;
            
            empleadosGrupo.forEach(empleado => {
                // Solo mostrar empleados con mostrar = true
                if (empleado.mostrar !== false) {
                    // Usar un índice especial para "sin seguro"
                    const deptoOrigenIndex = jsonNominaConfianzaReasignar.departamentos.indexOf(deptoSinSeguro);
                    html += `
                        <div class="form-check mb-1">
                            <input class="form-check-input checkbox-empleado" 
                                   type="checkbox" 
                                   value="${empleado.clave}" 
                                   data-depto-origen="${deptoOrigenIndex}"
                                   data-id-empresa="${empleado.id_empresa || 1}"
                                   data-sin-seguro="true"
                                   id="emp_${empleado.clave}_${empleado.id_empresa || 1}">
                            <label class="form-check-label" for="emp_${empleado.clave}_${empleado.id_empresa || 1}">
                                ${empleado.nombre} (Clave: ${empleado.clave})
                            </label>
                        </div>
                    `;
                }
            });
            
            html += '</div></div>';
        });
    }
    
    $('#selectDepartamentoDestino').html(opcionesDepartamentos);
    $('#estructuraDepartamentos').html(html);
    
    // Vincular evento al cambiar selección de checkboxes
    $('.checkbox-empleado').on('change', function() {
        actualizarListaEmpleadosSeleccionados();
    });
}

// Actualizar la lista de empleados seleccionados
function actualizarListaEmpleadosSeleccionados() {
    const seleccionados = [];
    $('.checkbox-empleado:checked').each(function() {
        const clave = $(this).val();
        const deptoOrigen = $(this).data('depto-origen');
        const idEmpresa = $(this).data('id-empresa');
        
        // Encontrar el empleado en la estructura
        const departamento = jsonNominaConfianzaReasignar.departamentos[deptoOrigen];
        const empleado = departamento.empleados.find(emp => 
            emp.clave == clave && (emp.id_empresa || 1) == idEmpresa
        );
        
        if (empleado) {
            seleccionados.push({
                empleado: empleado,
                deptoOrigen: deptoOrigen,
                nombreDeptoOrigen: departamento.nombre
            });
        }
    });
    
    // Mostrar en la lista de empleados a mover
    if (seleccionados.length > 0) {
        let listaHtml = '<ul class="list-group">';
        seleccionados.forEach(item => {
            listaHtml += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${item.empleado.nombre}
                    <small class="text-muted">De: ${item.nombreDeptoOrigen}</small>
                </li>
            `;
        });
        listaHtml += '</ul>';
        $('#listaEmpleadosParaMover').html(listaHtml);
    } else {
        $('#listaEmpleadosParaMover').html('<p class="text-muted">Selecciona empleados de la lista de abajo</p>');
    }
}

// Guardar los cambios de reasignación
function guardarReasignacion() {
    $('#btnGuardarReasignacion').on('click', function() {
        const deptoDestinoIndex = $('#selectDepartamentoDestino').val();
        
        if (!deptoDestinoIndex) {
            Swal.fire('Error', 'Por favor selecciona un departamento destino', 'warning');
            return;
        }
        
        const seleccionados = [];
        $('.checkbox-empleado:checked').each(function() {
            const clave = $(this).val();
            const deptoOrigen = $(this).data('depto-origen');
            const idEmpresa = $(this).data('id-empresa');
            
            seleccionados.push({
                clave: clave,
                deptoOrigen: deptoOrigen,
                idEmpresa: idEmpresa
            });
        });
        
        if (seleccionados.length === 0) {
            Swal.fire('Error', 'Por favor selecciona al menos un empleado', 'warning');
            return;
        }
        
        // Confirmar acción
        Swal.fire({
            title: '¿Confirmar reasignación?',
            text: `Vas a mover ${seleccionados.length} empleado(s) al departamento seleccionado`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, mover',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Realizar la reasignación
                realizarReasignacion(seleccionados, parseInt(deptoDestinoIndex));
            }
        });
    });
}

// Realizar la reasignación de empleados
function realizarReasignacion(empleadosSeleccionados, deptoDestinoIndex) {
    const deptoDestino = jsonNominaConfianzaReasignar.departamentos[deptoDestinoIndex];
    
    // Obtener el id_departamento del departamento destino
    const nuevoIdDepartamento = mapearDepartamentoAId(deptoDestino.nombre);
    
    // Encontrar el departamento "sin seguro" para manejar empleados especiales
    const deptoSinSeguro = jsonNominaConfianzaReasignar.departamentos.find(
        dept => dept.nombre && dept.nombre.toLowerCase() === 'sin seguro'
    );
    
    empleadosSeleccionados.forEach(empSel => {
        // Encontrar el empleado en el departamento de origen
        const deptoOrigen = jsonNominaConfianzaReasignar.departamentos[empSel.deptoOrigen];
        const indexEmpleado = deptoOrigen.empleados.findIndex(emp => 
            emp.clave == empSel.clave && (emp.id_empresa || 1) == empSel.idEmpresa
        );
        
        if (indexEmpleado !== -1) {
            const empleado = deptoOrigen.empleados[indexEmpleado];
            
            // Verificar si el empleado es de "sin seguro"
            const esDeSinSeguro = deptoOrigen.nombre && deptoOrigen.nombre.toLowerCase() === 'sin seguro';
            
            if (esDeSinSeguro) {
                // Para empleados de "sin seguro": solo actualizar id_departamento, no mover de departamento
                if (nuevoIdDepartamento !== null) {
                    empleado.id_departamento = nuevoIdDepartamento;
                    console.log(`Actualizando id_departamento de ${empleado.nombre} (sin seguro) a ${nuevoIdDepartamento}`);
                }
                // No se remueve ni se mueve de departamento
            } else {
                // Para empleados normales: mover entre departamentos
                // Remover del departamento origen
                const empleadoMovido = deptoOrigen.empleados.splice(indexEmpleado, 1)[0];
                
                // ACTUALIZAR EL ID_DEPARTAMENTO
                if (nuevoIdDepartamento !== null) {
                    empleadoMovido.id_departamento = nuevoIdDepartamento;
                    console.log(`Actualizando id_departamento de ${empleadoMovido.nombre} a ${nuevoIdDepartamento}`);
                }
                
                // Agregar al departamento destino
                if (!deptoDestino.empleados) {
                    deptoDestino.empleados = [];
                }
                deptoDestino.empleados.push(empleadoMovido);
            }
        }
    });
    
    // Si había empleados de "sin seguro" y no existe el departamento "sin seguro", crearlo
    if (!deptoSinSeguro && jsonNominaConfianzaReasignar.departamentos.some(dept => 
        dept.empleados && dept.empleados.some(emp => emp.id_departamento !== undefined)
    )) {
        jsonNominaConfianzaReasignar.departamentos.push({
            nombre: 'sin seguro',
            empleados: []
        });
    }
    
    // Guardar en localStorage
    try {
        saveNomina(jsonNominaConfianzaReasignar);
        // Actualizar la tabla
        mostrarDatosTabla(jsonNominaConfianzaReasignar);
        
        Swal.fire('¡Éxito!', 'Empleados reasignados correctamente', 'success');
        $('#modalReasignarDepartamento').modal('hide');
        
        // Limpiar selecciones
        $('.checkbox-empleado').prop('checked', false);
        $('#selectDepartamentoDestino').val('');
        $('#listaEmpleadosParaMover').html('<p class="text-muted">Selecciona empleados de la lista de abajo</p>');
    } catch (error) {
        Swal.fire('Error', 'Hubo un problema al guardar los cambios', 'error');
    }
}

// Inicializar cuando el documento esté listo
$(document).ready(function() {
    mostrarModalReasignar();
    guardarReasignacion();
});