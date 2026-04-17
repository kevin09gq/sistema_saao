mostrarEstructuraPercepciones();
eliminarPercepcionExtra();
guardarInasistenciaManual();
eliminarInasistenciaManual();
mostrarEstructuraDeducciones();
eliminarDeduccionExtra();

/************************************
 * AGREGAR PERCEPCIONES ADICIONALES
 ************************************/

// Función para mostrar la estructura de percepciones adicionales en la interfaz
function mostrarEstructuraPercepciones() {
    // Agregar percepciones adicionales
    $("#btn-agregar-percepcion-confianza").click(function (e) {
        e.preventDefault();

        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) {
            return;
        }

        // Crear nuevo elemento de percepción con estructura Bootstrap
        const nuevoConcepto = `
        <div class="col-md-6 mb-3 percepcion-extra-item">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-semibold">Concepto Adicional</span>
                <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-percepcion">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="mt-2">
                <input type="text" class="form-control form-control-sm mb-2 nombre-percepcion" 
                       placeholder="Nombre del concepto">
                <input type="number" step="0.01" class="form-control form-control-sm cantidad-percepcion" 
                       value="0.00" placeholder="0.00">
            </div>
        </div>
    `;

        // Agregar el nuevo concepto al contenedor
        $('#contenedor-conceptos-adicionales-confianza').append(nuevoConcepto);

        // Agregar evento change para guardar cambios
        $('#contenedor-conceptos-adicionales-confianza').find('.percepcion-extra-item').last().find('input').on('change', function () {
            guardarPercepcionesExtra(empleado);
        });

    });
}

// Función para mostrar las percepciones adicionales existentes de un empleado en el modal
function mostrarPercepcionesExtras(empleado) {

    // Limpiar el contenedor de percepciones adicionales
    $('#contenedor-conceptos-adicionales-confianza').empty();

    // Si existen percepciones adicionales, mostrarlas
    if (empleado.percepciones_extra && Array.isArray(empleado.percepciones_extra) && empleado.percepciones_extra.length > 0) {
        empleado.percepciones_extra.forEach((percepcion) => {
            // Crear elemento de percepción con datos existentes
            const htmlPercepcion = `
                <div class="col-md-6 mb-3 percepcion-extra-item">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-semibold">Concepto Adicional</span>
                        <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-percepcion">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <div class="mt-2">
                        <input type="text" class="form-control form-control-sm mb-2 nombre-percepcion" 
                               value="${percepcion.nombre || ''}" placeholder="Nombre del concepto">
                        <input type="number" step="0.01" class="form-control form-control-sm cantidad-percepcion" 
                               value="${percepcion.cantidad || 0.00}" placeholder="0.00">
                    </div>
                </div>
            `;

            // Agregar el elemento al contenedor
            $('#contenedor-conceptos-adicionales-confianza').append(htmlPercepcion);

            // Agregar evento change para actualizar
            $('#contenedor-conceptos-adicionales-confianza').find('.percepcion-extra-item').last().find('input').on('change', function () {
                guardarPercepcionesExtra(empleado);
            });
        });
    }
}

// Función para guardar las percepciones adicionales en el objeto empleado
function guardarPercepcionesExtra(empleado) {
    // Si no hay empleado, salir
    if (!empleado) return;

    // Limpiar el array
    empleado.percepciones_extra = [];

    // Iterar sobre todos los elementos de percepción
    $('#contenedor-conceptos-adicionales-confianza').find('.percepcion-extra-item').each(function () {
        const nombre = $(this).find('.nombre-percepcion').val().trim();
        const cantidad = parseFloat($(this).find('.cantidad-percepcion').val()) || 0;

        // Solo guardar si tiene nombre
        if (nombre) {
            empleado.percepciones_extra.push({
                nombre: nombre,
                cantidad: cantidad
            });
        }
    });
}

// Función para eliminar una percepción adicional del empleado
function eliminarPercepcionExtra() {
    // Delegación de eventos para eliminar percepciones
    $("#contenedor-conceptos-adicionales-confianza").on('click', '.btn-eliminar-percepcion', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const $elemento = $(this).closest('.percepcion-extra-item');

        if (!$elemento || $elemento.length === 0) return;

        $elemento.remove();
        guardarPercepcionesExtra(empleado);
        calcularTotalPercepcionesEnTiempoReal();
    });
}

/************************************
 * AGREGAR DEDUCCIONES ADICIONALES
 ************************************/

// Función para mostrar la estructura de deducciones adicionales en la interfaz
function mostrarEstructuraDeducciones() {
    // Agregar deducciones adicionales
    $("#btn-agregar-deduccion-confianza").click(function (e) {
        e.preventDefault();

        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        // Crear nuevo elemento de deducción con estructura Bootstrap
        const nuevaDeduccion = `
        <div class="col-md-6 mb-3 deduccion-extra-item">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-semibold">Deducción Adicional</span>
                <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-deduccion">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="mt-2">
                <input type="text" class="form-control form-control-sm mb-2 nombre-deduccion" 
                       placeholder="Nombre de la deducción">
                <input type="number" step="0.01" class="form-control form-control-sm cantidad-deduccion" 
                       value="0.00" placeholder="0.00">
            </div>
        </div>
    `;

        // Agregar la nueva deducción al contenedor
        $('#contenedor-deducciones-adicionales-confianza').append(nuevaDeduccion);

        // Agregar evento change para guardar cambios
        $('#contenedor-deducciones-adicionales-confianza').find('.deduccion-extra-item').last().find('input').on('change', function () {
            guardarDeduccionesExtra(empleado);
        });

    });
}

// Función para mostrar las deducciones adicionales existentes de un empleado en el modal
function mostrarDeduccionesExtras(empleado) {

    // Si no hay empleado, salir
    if (!empleado) return;

    // Limpiar el contenedor de deducciones adicionales
    $('#contenedor-deducciones-adicionales-confianza').empty();

    // Si existen deducciones adicionales, mostrarlas
    if (empleado.deducciones_extra && Array.isArray(empleado.deducciones_extra) && empleado.deducciones_extra.length > 0) {
        empleado.deducciones_extra.forEach((deduccion) => {
            const elementoDeduccion = `
            <div class="col-md-6 mb-3 deduccion-extra-item">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-semibold">Deducción Adicional</span>
                    <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-deduccion">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="mt-2">
                    <input type="text" class="form-control form-control-sm mb-2 nombre-deduccion" 
                           value="${deduccion.nombre || ''}" placeholder="Nombre de la deducción">
                    <input type="number" step="0.01" class="form-control form-control-sm cantidad-deduccion" 
                           value="${parseFloat(deduccion.cantidad).toFixed(2)}" placeholder="0.00">
                </div>
            </div>
        `;
            $('#contenedor-deducciones-adicionales-confianza').append(elementoDeduccion);

            // Agregar evento change para actualizar
            $('#contenedor-deducciones-adicionales-confianza').find('.deduccion-extra-item').last().find('input').on('change', function () {
                guardarDeduccionesExtra(empleado);
            });
        });
    }
}

// Función para guardar las deducciones adicionales en el objeto empleado
function guardarDeduccionesExtra(empleado) {
    // Si no hay empleado, salir
    if (!empleado) return;

    // Limpiar el array
    empleado.deducciones_extra = [];

    // Iterar sobre todos los elementos de deducción
    $('#contenedor-deducciones-adicionales-confianza').find('.deduccion-extra-item').each(function () {
        const nombre = $(this).find('.nombre-deduccion').val().trim();
        const cantidad = parseFloat($(this).find('.cantidad-deduccion').val()) || 0;

        // Solo guardar si tiene nombre
        if (nombre) {
            empleado.deducciones_extra.push({
                nombre: nombre,
                cantidad: cantidad
            });
        }
    });
}

// Función para eliminar una deducción adicional del empleado
function eliminarDeduccionExtra() {
    // Delegación de eventos para eliminar deducciones
    $("#contenedor-deducciones-adicionales-confianza").on('click', '.btn-eliminar-deduccion', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const $elemento = $(this).closest('.deduccion-extra-item');

        if (!$elemento || $elemento.length === 0) return;

        $elemento.remove();
        guardarDeduccionesExtra(empleado);
        calcularTotalDeduccionesEnTiempoReal();
    });
}

/************************************
 * AGREGAR INASISTENCIAS MANUALES
 ************************************/

// Función para guardar inasistencia manual en el historial
function guardarInasistenciaManual() {
    $("#btn-agregar-inasistencia-confianza").click(function (e) {
        e.preventDefault();

        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;

        // Obtener valores del formulario
        const dia = $('#select-dia-inasistencia-confianza').val().trim();
        let descuento = parseFloat($('#input-descuento-inasistencia-confianza').val()) || 0;

        // Si el descuento es 0 o vacío, calcularlo automáticamente como salario_semanal / 7
        if (descuento === 0) {
            const salarioSemanal = parseFloat(empleado.salario_semanal) || 0;
            descuento = salarioSemanal / 7;
        }

        if (!dia) {
            Swal.fire({
                icon: 'warning',
                title: 'Día faltante',
                text: 'Por favor selecciona un día de la semana',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        // Inicializar historial si no existe
        if (!Array.isArray(empleado.historial_inasistencias)) {
            empleado.historial_inasistencias = [];
        }

        // Verificar si existen automáticas actualmente
        const tieneAutomaticas = empleado.historial_inasistencias.some(i => i.tipo === 'automatico');

        // Si ya tiene el flag de ignorar, simplemente agregamos la manual
        if (empleado.ignorar_inasistencias_automaticas === true || !tieneAutomaticas) {
            finalizarGuardadoInasistencia(empleado, dia, descuento);
        } else {
            // Preguntar si quiere sumar o solo manuales
            Swal.fire({
                title: 'Inasistencias Automáticas Detectadas',
                text: "¿Deseas sumar esta inasistencia manual a las calculadas automáticamente o prefieres solo tomar las manuales?",
                icon: 'question',
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonText: '<i class="bi bi-plus-circle"></i> Sumar ambas',
                denyButtonText: '<i class="bi bi-person-check"></i> Solo manuales',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#28a745',
                denyButtonColor: '#17a2b8',
                cancelButtonColor: '#6c757d',
                width: '600px'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Sumar: mantener flag en falso/null
                    empleado.ignorar_inasistencias_automaticas = false;
                    finalizarGuardadoInasistencia(empleado, dia, descuento);
                } else if (result.isDenied) {
                    // Solo manuales: activar flag y limpiar automáticas
                    empleado.ignorar_inasistencias_automaticas = true;
                    // eliminamos manuales_editado_manual para que no interfiera si existe uno previo en otro modulo
                    empleado._inasistencia_editado_manual = true; 
                    
                    finalizarGuardadoInasistencia(empleado, dia, descuento);
                }
            });
        }
    });
}

// Función auxiliar para centralizar la agregación y refresco
function finalizarGuardadoInasistencia(empleado, dia, descuento) {
    // Agregar nueva inasistencia manual
    empleado.historial_inasistencias.push({
        dia: dia,
        descuento_inasistencia: descuento,
        tipo: 'manual'
    });

    // Limpiar formulario UI
    $('#select-dia-inasistencia-confianza').val('');
    $('#input-descuento-inasistencia-confianza').val('0.00');

    // Recalcular inasistencias (llamará a asignarHistorialInasistencias en eventos.js, 
    // la cual ya modificamos para respetar ignorar_inasistencias_automaticas)
    asignarHistorialInasistencias(empleado);
    
    // Calcular total actual respetando el flag de ignorar automáticas
    const totalInasistencias = empleado.historial_inasistencias.reduce((sum, i) => {
        if (i.tipo === 'automatico' && empleado.ignorar_inasistencias_automaticas) {
            return sum;
        }
        return sum + (parseFloat(i.descuento_inasistencia) || 0);
    }, 0);
    
    $('#mod-inasistencias-confianza').val(totalInasistencias.toFixed(2));
    empleado.inasistencia = totalInasistencias;

    // Refrescar UI del modal
    establecerHistorialInasistencias(empleado);
    calcularSueldoACobrar();
}

/************************************
 * ELIMINAR INASISTENCIAS MANUALES
 ************************************/

// Función para eliminar inasistencia manual del historial
function eliminarInasistenciaManual() {
    const $contenedor = $('#contenedor-historial-inasistencias-confianza');
    
    // Delegación de eventos para eliminar inasistencias manuales
    $contenedor.on('click', '.btn-eliminar-inasistencia-manual', function () {
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;

        const index = $(this).data('index');

        // Eliminar la inasistencia del array
        empleado.historial_inasistencias.splice(index, 1);

        // Si ya no quedan manuales, por seguridad podemos permitir que vuelvan las automáticas
        const tieneManuales = empleado.historial_inasistencias.some(i => i.tipo === 'manual');
        if (!tieneManuales) {
            empleado.ignorar_inasistencias_automaticas = false;
        }

        // Recalcular el historial (esto traerá de vuelta las automáticas si el flag es false)
        asignarHistorialInasistencias(empleado);

        // Calcular y actualizar el total de inasistencias respetando el flag
        const totalInasistencias = empleado.historial_inasistencias.reduce((sum, i) => {
            if (i.tipo === 'automatico' && empleado.ignorar_inasistencias_automaticas) {
                return sum;
            }
            return sum + (parseFloat(i.descuento_inasistencia) || 0);
        }, 0);
        $('#mod-inasistencias-confianza').val(totalInasistencias.toFixed(2));
        empleado.inasistencia = totalInasistencias;

        // Actualizar la tabla
        establecerHistorialInasistencias(empleado);
        calcularSueldoACobrar();
    });
}

/************************************
 * EDITAR HISTORIAL CHECADOR MANUALES
 ************************************/

// Función para editar el descuento de un olvido en el historial
function editarOlvidoChecador() {
    const $contenedor = $('#contenedor-historial-olvidos');
    
    $contenedor.off('click', '.btn-editar-olvido');
    $contenedor.on('click', '.btn-editar-olvido', function () {
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;

        const indice = $(this).data('index');
        const olvido = empleado.historial_olvidos[indice];
        const fila = $(this).closest('tr');
        const celdaDescuento = fila.find('td').eq(2);
        
        const valor = parseFloat(olvido.descuento_olvido).toFixed(2);
        const htmlEditable = `
            <div class="d-flex gap-2">
                <input type="number" step="0.01" class="form-control form-control-sm input-editar-olvido" value="${valor}" min="0">
                <button type="button" class="btn btn-sm btn-success btn-confirmar-olvido" title="Guardar"><i class="bi bi-check"></i></button>
                <button type="button" class="btn btn-sm btn-danger btn-cancelar-olvido" title="Cancelar"><i class="bi bi-x"></i></button>
            </div>
        `;
        
        celdaDescuento.html(htmlEditable);
        const inputNuevo = celdaDescuento.find('.input-editar-olvido');
        inputNuevo.focus().select();
        
        // Botón confirmar
        celdaDescuento.find('.btn-confirmar-olvido').on('click', function() {
            guardarDescuentoOlvido(inputNuevo, olvido, empleado);
        });
        
        // Botón cancelar
        celdaDescuento.find('.btn-cancelar-olvido').on('click', function() {
            establecerHistorialChecador(empleado);
        });
    });
}

// Función para guardar el descuento del olvido editado
function guardarDescuentoOlvido(inputElement, olvidoObject, empleadoObject) {
    const raw = inputElement.val();

    // Si está vacío, cancelar edición y mantener valor anterior
    if (raw === null || raw.trim() === '') {
        establecerHistorialChecador(empleadoObject);
        return;
    }

    const valorNuevo = parseFloat(raw);
    // Validar número (permitir 0)
    if (isNaN(valorNuevo) || valorNuevo < 0) {
        alert('Por favor ingresa un valor válido');
        establecerHistorialChecador(empleadoObject);
        return;
    }

    // Guardar el nuevo descuento (incluye 0)
    olvidoObject.descuento_olvido = valorNuevo;
    // Marcar el registro como editado manualmente
    olvidoObject.editado = true;

    const total = empleadoObject.historial_olvidos.reduce((suma, item) => 
        suma + (parseFloat(item.descuento_olvido) || 0), 0);

    empleadoObject.checador = total;
    $('#mod-checador-confianza').val(total.toFixed(2));
    establecerHistorialChecador(empleadoObject);
    calcularSueldoACobrar();
}

// Inicializar función de edición de olvidos
editarOlvidoChecador();




/************************************
 * EDITAR HISTORIAL RETARDOS
 ************************************/

// Función para editar tolerancia y descuento por minuto de un retardo
function editarRetardoChecador() {
    const contenedor = $('#contenedor-historial-retardos');
    
    contenedor.off('click', '.btn-editar-retardo');
    contenedor.on('click', '.btn-editar-retardo', function () {
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;

        const indice = $(this).data('index');
        const retardo = empleado.historial_retardos[indice];
        const fila = $(this).closest('tr');
        const celdaTolerancia = fila.find('td').eq(3);
        const celdaDescuentoMinuto = fila.find('td').eq(4);
        const celdaDescuento = fila.find('td').eq(5);
        
        const toleranciaActual = parseFloat(retardo.tolerancia).toFixed(2);
        const descuentoMinutoActual = parseFloat(retardo.descuento_por_minuto).toFixed(2);
        
        // Celda para tolerancia
        const htmlTolerancia = `
            <div class="d-flex gap-1">
                <input type="number" step="0.01" class="form-control form-control-sm input-tolerancia" value="${toleranciaActual}" min="0">
            </div>
        `;
        
        // Celda para descuento por minuto
        const htmlDescuentoMinuto = `
            <div class="d-flex gap-2 align-items-center">
                <input type="number" step="0.01" class="form-control form-control-sm input-descuento-minuto" value="${descuentoMinutoActual}" min="0">
                <button type="button" class="btn btn-sm btn-success btn-confirmar-retardo" title="Guardar"><i class="bi bi-check"></i></button>
                <button type="button" class="btn btn-sm btn-danger btn-cancelar-retardo" title="Cancelar"><i class="bi bi-x"></i></button>
            </div>
        `;
        
        celdaTolerancia.html(htmlTolerancia);
        celdaDescuentoMinuto.html(htmlDescuentoMinuto);
        
        const inputTolerancia = celdaTolerancia.find('.input-tolerancia');
        const inputDescuentoMinuto = celdaDescuentoMinuto.find('.input-descuento-minuto');
        inputTolerancia.focus();
        
        // Función para recalcular el descuento en tiempo real
        function recalcularDescuentoTiempoReal() {
            const tol = parseFloat(inputTolerancia.val()) || 0;
            const desc = parseFloat(inputDescuentoMinuto.val()) || 0;
            const minutosAjustados = Math.max(0, retardo.minutos_retardo - tol);
            const nuevoDescuento = minutosAjustados * desc;
            celdaDescuento.html(`$${nuevoDescuento.toFixed(2)}`);
        }
        
        // Recalcular cuando el usuario cambia tolerancia
        inputTolerancia.on('input', recalcularDescuentoTiempoReal);
        
        // Recalcular cuando el usuario cambia descuento por minuto
        inputDescuentoMinuto.on('input', recalcularDescuentoTiempoReal);
        
        // Botón confirmar
        celdaDescuentoMinuto.find('.btn-confirmar-retardo').on('click', function() {
            guardarRetardoEditado(inputTolerancia, inputDescuentoMinuto, retardo, empleado);
        });
        
        // Botón cancelar
        celdaDescuentoMinuto.find('.btn-cancelar-retardo').on('click', function() {
            establecerHistorialRetardos(empleado);
        });
    });
}

// Función para guardar cambios en un retardo editado
function guardarRetardoEditado(inputTolerancia, inputDescuentoMinuto, retardoObject, empleadoObject) {
    const rawTol = inputTolerancia.val();
    const rawDesc = inputDescuentoMinuto.val();

    // Si alguno está vacío, cancelar edición
    if (rawTol === null || rawTol.trim() === '' || rawDesc === null || rawDesc.trim() === '') {
        establecerHistorialRetardos(empleadoObject);
        return;
    }

    const tolerancia = parseFloat(rawTol);
    const descuentoMinuto = parseFloat(rawDesc);

    // Validar números válidos
    if (isNaN(tolerancia) || tolerancia < 0 || isNaN(descuentoMinuto) || descuentoMinuto < 0) {
        alert('Por favor ingresa valores válidos (números >= 0)');
        establecerHistorialRetardos(empleadoObject);
        return;
    }

    // Actualizar valores
    retardoObject.tolerancia = tolerancia;
    retardoObject.descuento_por_minuto = descuentoMinuto;

    // Recalcular descuento total
    const minutosAjustados = Math.max(0, retardoObject.minutos_retardo - tolerancia);
    retardoObject.total_descontado = parseFloat((minutosAjustados * descuentoMinuto).toFixed(2));

    // Marcar como editado
    retardoObject.editado = true;

    // Recalcular total de retardos
    const total = empleadoObject.historial_retardos.reduce((suma, item) => 
        suma + (parseFloat(item.total_descontado) || 0), 0);

    empleadoObject.retardos = total;
    $('#mod-retardos-confianza').val(total.toFixed(2));
    establecerHistorialRetardos(empleadoObject);
    calcularSueldoACobrar();
}

// Inicializar función de edición de retardos
editarRetardoChecador();


/************************************
 * AGREGAR Y ELIMINAR PERMISOS
 ************************************/

// Función para guardar permiso manual en el historial
function guardarPermisoManual() {
    // Función para recalcular descuento en tiempo real
    function recalcularDescuentoPermiso() {
        const minutos = parseInt($('#input-minutos-permiso-confianza').val()) || 0;
        const costoMinuto = parseFloat($('#input-costo-minuto-permiso-confianza').val()) || 0;
        const descuento = minutos * costoMinuto;
        $('#input-descuento-permiso-confianza').val(descuento.toFixed(2));
    }

    // Agregar eventos de input para cálculo en tiempo real
    $('#input-minutos-permiso-confianza').on('input', recalcularDescuentoPermiso);
    $('#input-costo-minuto-permiso-confianza').on('input', recalcularDescuentoPermiso);

    $("#btn-agregar-permiso-confianza").click(function (e) {
        e.preventDefault();

        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) {
            return;
        }

        // Obtener valores del formulario
        const dia = $('#select-dia-permiso-confianza').val().trim();
        const minutos = parseInt($('#input-minutos-permiso-confianza').val()) || 0;
        const costoMinuto = parseFloat($('#input-costo-minuto-permiso-confianza').val()) || 0;
        const descuento = minutos * costoMinuto;

        // Validar que tenga día
        if (!dia) {
            alert('Por favor selecciona un día');
            return;
        }

        // Inicializar historial si no existe
        if (!Array.isArray(empleado.historial_permisos)) {
            empleado.historial_permisos = [];
        }

        // Agregar nuevo permiso manual
        empleado.historial_permisos.push({
            dia: dia,
            minutos_permiso: minutos,
            costo_por_minuto: costoMinuto,
            descuento_permiso: descuento,
           
        });

        // Limpiar formulario
        $('#select-dia-permiso-confianza').val('');
        $('#input-minutos-permiso-confianza').val('0');
        $('#input-costo-minuto-permiso-confianza').val('0.00');
        $('#input-descuento-permiso-confianza').val('0.00');

        // Calcular y actualizar el total de permisos
        const totalPermisos = empleado.historial_permisos.reduce((sum, p) => {
            return sum + (parseFloat(p.descuento_permiso) || 0);
        }, 0);

        empleado.permiso = totalPermisos;
        $('#mod-permisos-confianza').val(totalPermisos.toFixed(2));

        establecerHistorialPermisos(empleado);
        calcularSueldoACobrar();

        console.log('Permiso guardado:', empleado.historial_permisos);
    });
}

// Función para eliminar permiso manual del historial
function eliminarPermisoManual() {
    const $contenedor = $('#contenedor-historial-permisos-confianza');
    
    // Delegación de eventos para eliminar permisos manuales
    $contenedor.on('click', '.btn-eliminar-permiso-manual', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const index = $(this).data('index');

        // Eliminar el permiso del array
        empleado.historial_permisos.splice(index, 1);

        // Calcular y actualizar el total de permisos
        const totalPermisos = empleado.historial_permisos.reduce((sum, p) => {
            return sum + (parseFloat(p.descuento_permiso) || 0);
        }, 0);
        empleado.permiso = totalPermisos;
        $('#mod-permisos-confianza').val(totalPermisos.toFixed(2));

        // Actualizar la tabla
        establecerHistorialPermisos(empleado);
        calcularSueldoACobrar();

        console.log('Permiso eliminado. Historial actualizado:', empleado.historial_permisos);
    });
}

// Inicializar funciones de permisos
guardarPermisoManual();
eliminarPermisoManual();

// ----------------------------------
// UNIFORME MANUAL
// ----------------------------------

// Función para guardar uniforme manual en el historial
function guardarUniformeManual() {
    $("#btn-agregar-uniforme-confianza").click(function(e) {
        e.preventDefault();
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;

        const folio = $('#input-folio-uniforme-confianza').val().trim();
        const cantidad = parseInt($('#input-cantidad-uniforme-confianza').val()) || 0;
        if (!folio) {
            alert('Por favor ingresa un folio');
            return;
        }
        if (cantidad <= 0) {
            alert('La cantidad debe ser mayor a 0');
            return;
        }
        if (!Array.isArray(empleado.historial_uniforme)) {
            empleado.historial_uniforme = [];
        }
        empleado.historial_uniforme.push({
            folio: folio,
            cantidad: cantidad,
        });

        $('#input-folio-uniforme-confianza').val('');
        $('#input-cantidad-uniforme-confianza').val('0');

        // recalcular total
        const total = empleado.historial_uniforme.reduce((s, u) => s + (parseInt(u.cantidad) || 0), 0);
        $('#mod-uniforme-confianza').val(total);
        empleado.uniformes = total;
        establecerHistorialUniforme(empleado);
        calcularSueldoACobrar();
        console.log('Uniforme guardado', empleado.historial_uniforme);
    });
}

// Función para eliminar uniforme manual del historial
function eliminarUniformeManual() {
    const $contenedor = $('#contenedor-historial-uniforme-confianza');
    $contenedor.on('click', '.btn-eliminar-uniforme-manual', function() {
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;
        const index = $(this).data('index');
        empleado.historial_uniforme.splice(index,1);
        const total = empleado.historial_uniforme.reduce((s, u) => s + (parseInt(u.cantidad) || 0), 0);
        $('#mod-uniforme-confianza').val(total);
        empleado.uniformes = total;
        establecerHistorialUniforme(empleado);
        calcularSueldoACobrar();
        
    });
}

// Inicializar funciones de uniforme
guardarUniformeManual();
eliminarUniformeManual();

