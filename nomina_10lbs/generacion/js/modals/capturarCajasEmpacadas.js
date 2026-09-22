//===================================================
// FUNCIONES DEL MODAL DE CAPTURA GENERAL DE CAJAS EMPACADAS
//===================================================

$(document).ready(function () {

    abrirModalCajasEmpacadas();
    
    // Evento para calcular totales en tiempo real
    $(document).on('input', '.input-caja-empleado', function() {
        calcularTotalesEmpleados();
    });
    
    // Evento para guardar los empaques
    guardarEmpaquesEmpleados();


});


//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE CAPTURA DE CAJAS
//===================================================

function abrirModalCajasEmpacadas() {

    $('#btn_cajas_general').click(function () {

        // Limpiar completamente la tabla antes de cargar
        limpiarTablaCajas();

        // Cargar empleados
        cargarEmpleadosCajas();

        // Cargar días existentes del historial
        cargarDiasExistentes();

        agregarDiaTablaCajas();

        // Cargar valores del historial
        cargarValoresHistorial();

        // Abrir modal
        $('#modalCajasEmpacadas').modal('show');

    });

}


//===================================================
// FUNCIÓN PARA LIMPIAR LA TABLA DE CAJAS
//===================================================

function limpiarTablaCajas() {
    
    // Limpiar encabezados de días
    $('#headerFilaDias th[data-dia]').remove();
    
    // Limpiar subencabezados
    $('#encabezadoDias').empty();
    
    // Limpiar contenedor de totales
    $('#totalesContainer').empty();
    
    // Reiniciar contadores generales
    $('#totalGeneralCajas').text('0');
    $('#totalGeneralDinero').text('$0.00');
}


//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// MUESTRA LOS EMPLEADOS SEPARADOS EN CON SEGURO
// Y SIN SEGURO.
//===================================================

function cargarEmpleadosCajas() {

    // Limpiar tabla
    $('#tbodyGeneralCajas').empty();


    // Recorrer departamentos

    jsonNomina10lbs.departamentos.forEach(departamento => {


        // Obtener únicamente empleados visibles
        const empleadosMostrar = departamento.empleados.filter(
            empleado => empleado.mostrar
        );


        // Si no hay empleados visibles, no mostrar departamento
        if (empleadosMostrar.length === 0) {
            return;
        }


       // Encabezado del departamento

        $('#tbodyGeneralCajas').append(`

            <tr class="table-secondary">

                <td
                    colspan="3"
                    class="fw-bold"
                    style="
                        position: sticky;
                        left: 0;
                        z-index: 4;
                        background-color: #e2e3e5;
                    ">

                    <i class="bi bi-building me-2"></i>

                    ${departamento.nombre}

                </td>

            </tr>

        `);


       // Obtener empleados con seguro

        const empleadosConSeguro = empleadosMostrar.filter(
            empleado => empleado.seguroSocial === true
        );


       // Obtener empleados sin seguro

        const empleadosSinSeguro = empleadosMostrar.filter(
            empleado => empleado.seguroSocial === false
        );


       // Mostrar empleados con seguro

        if (empleadosConSeguro.length > 0) {

            $('#tbodyGeneralCajas').append(`

                <tr class="table-success">

                    <td
                        colspan="3"
                        class="fw-bold"
                        style="
                            position: sticky;
                            left: 0;
                            z-index: 4;
                            background-color: #d1e7dd;
                        ">

                        <i class="bi bi-shield-check me-2"></i>

                        Con Seguro

                    </td>

                </tr>

            `);


            // Recorrer empleados con seguro
            empleadosConSeguro.forEach((empleado, indice) => {

                $('#tbodyGeneralCajas').append(`

                    <tr
                        data-id-empleado="${empleado.id_empleado}"
                        data-tipo-fila="empleado">

                        <td
                            class="text-center"
                            style="
                                position: sticky;
                                left: 0;
                                z-index: 3;
                                background-color: white;
                                min-width: 50px;
                                width: 50px;
                            ">

                            ${indice + 1}

                        </td>

                        <td
                            style="
                                position: sticky;
                                left: 50px;
                                z-index: 3;
                                background-color: white;
                                min-width: 80px;
                                width: 80px;
                            ">

                            ${empleado.clave}

                        </td>

                        <td
                            style="
                                position: sticky;
                                left: 130px;
                                z-index: 3;
                                background-color: white;
                                min-width: 450px;
                                width: 450px;
                            ">

                            ${empleado.nombre}

                        </td>

                    </tr>

                `);

            });

        }


       // Mostrar empleados sin seguro

        if (empleadosSinSeguro.length > 0) {

            $('#tbodyGeneralCajas').append(`

                <tr class="table-warning">

                    <td
                        colspan="3"
                        class="fw-bold"
                        style="
                            position: sticky;
                            left: 0;
                            z-index: 4;
                            background-color: #fff3cd;
                        ">

                        <i class="bi bi-shield-x me-2"></i>

                        Sin Seguro

                    </td>

                </tr>

            `);


            // Recorrer empleados sin seguro
            empleadosSinSeguro.forEach((empleado, indice) => {

                $('#tbodyGeneralCajas').append(`

                    <tr
                        data-id-empleado="${empleado.id_empleado}"
                        data-tipo-fila="empleado">

                        <td
                            class="text-center"
                            style="
                                position: sticky;
                                left: 0;
                                z-index: 3;
                                background-color: white;
                                min-width: 50px;
                                width: 50px;
                            ">

                            ${indice + 1}

                        </td>

                        <td
                            style="
                                position: sticky;
                                left: 50px;
                                z-index: 3;
                                background-color: white;
                                min-width: 80px;
                                width: 80px;
                            ">

                            ${empleado.clave}

                        </td>

                        <td
                            style="
                                position: sticky;
                                left: 130px;
                                z-index: 3;
                                background-color: white;
                                min-width: 450px;
                                width: 450px;
                            ">

                            ${empleado.nombre}

                        </td>

                    </tr>

                `);
            });

        }


    });


}


//===================================================
// FUNCIÓN PARA AGREGAR EL DÍA A LA TABLA
//===================================================

function agregarDiaTablaCajas() {
    $('#btnAgregarDiaTabla').on('click', function () {
        // Obtener el día seleccionado
        const diaSeleccionado = $('#selectAgregarDia').val();


        // Validar que se haya seleccionado un día
        if (!diaSeleccionado) {

            mostrarAlerta(
                'warning',
                'Seleccione Día',
                'Selecciona un día para agregar.'
            );

            return;
        }


        // Obtener precios de cajas
        const preciosCajas = jsonNomina10lbs.precio_cajas || [];


        // Obtener únicamente los precios que tienen utilidad
        const preciosUtilidad = preciosCajas.filter(
            caja => caja.utilidad === true
        );


        // Validar que existan precios de cajas
        if (preciosUtilidad.length === 0) {

            mostrarAlerta(
                'warning',
                'Sin precios de cajas',
                'No existen precios de cajas con utilidad.'
            );

            return;
        }


        // Verificar si el día ya existe
        let diaExiste = false;

        $('#headerFilaDias th').each(function () {

            if ($(this).data('dia') === diaSeleccionado) {

                diaExiste = true;

                return false;

            }

        });


        // Si el día ya existe
        if (diaExiste) {

            mostrarAlerta(
                'warning',
                'Día ya agregado',
                `El día ${diaSeleccionado} ya está agregado.`
            );

            return;
        }


        // Agregar encabezado del día
        $('#headerFilaDias').append(`

        <th
           colspan="${preciosUtilidad.length}"
           class="text-center"
           data-dia="${diaSeleccionado}"
           style="
           min-width: ${preciosUtilidad.length * 120}px;
        ">

        ${diaSeleccionado}

        </th>

    `);


        // Agregar subencabezado de precios y valores

        preciosUtilidad.forEach(caja => {

            $('#encabezadoDias').append(`

            <th
                class="text-center"
                data-dia="${diaSeleccionado}"
                data-valor="${caja.valor}"
                data-precio="${caja.precio}"
                style="
                background-color: ${caja.color};
                min-width: 120px;
                white-space: nowrap;
            ">


                ${caja.valor}

            </th>

        `);

        });


        // Agregar celdas con inputs numéricos para cada empleado
        agregarCeldasInputsEmpleados(diaSeleccionado, preciosUtilidad);


        // Limpiar selector
        $('#selectAgregarDia').val('');

    });

}


//===================================================
// FUNCIÓN PARA AGREGAR CELDAS DE INPUT A EMPLEADOS
//===================================================

function agregarCeldasInputsEmpleados(dia, preciosUtilidad) {
    
    // Recorrer todas las filas de empleados
    $('#tbodyGeneralCajas tr[data-tipo-fila="empleado"]').each(function() {
        
        const idEmpleado = $(this).data('id-empleado');
        
        // Para cada valor de caja, agregar una celda con input
        preciosUtilidad.forEach(caja => {
            
            $(this).append(`
                <td
                    class="text-center"
                    data-dia="${dia}"
                    data-valor="${caja.valor}"
                    style="
                        background-color: ${caja.color};
                        border-right: 2px solid #000;
                        min-width: 120px;">
                    
                    <input
                        type="number"
                        class="form-control form-control-sm input-caja-empleado"
                        data-id-empleado="${idEmpleado}"
                        data-dia="${dia}"
                        data-valor="${caja.valor}"
                        data-precio="${caja.precio}"
                        min="0"
                        step="1"
                        placeholder="0"
                        style="
                            background-color: transparent;
                            border: none;
                            text-align: center;
                            font-weight: bold;">
                    
                </td>
            `);
        });
    });
}


//===================================================
// FUNCIÓN PARA CALCULAR TOTALES DE EMPLEADOS EN TIEMPO REAL
//===================================================

function calcularTotalesEmpleados() {
    
    let totalCajasEmpacadas = 0;
    let totalDineroEmpleados = 0;
    
    // Recorrer todos los inputs de cajas de empleados
    $('.input-caja-empleado').each(function() {
        
        const cantidad = parseInt($(this).val()) || 0;
        const precio = parseFloat($(this).data('precio')) || 0;
        
        // Sumar cajas empacadas
        totalCajasEmpacadas += cantidad;
        
        // Sumar dinero (cantidad × precio unitario)
        totalDineroEmpleados += cantidad * precio;
    });
    
    // Actualizar los totales en el modal
    $('#totalGeneralCajas').text(totalCajasEmpacadas);
    $('#totalGeneralDinero').text('$' + totalDineroEmpleados.toFixed(2));
    
    // Validar contra los límites de clientes
    validarLimitesClientes(totalCajasEmpacadas, totalDineroEmpleados);
}


//===================================================
// FUNCIÓN PARA VALIDAR CONTRA LOS LÍMITES DE CLIENTES
//===================================================

function validarLimitesClientes(totalCajasEmpleados, totalDineroEmpleados) {
    
    // Validar que exista la estructura de clientes
    if (
        !jsonNomina10lbs ||
        !jsonNomina10lbs.clientes
    ) {
        return;
    }
    
    // Obtener los límites generales de clientes
    const limiteCajasClientes = jsonNomina10lbs.clientes.total_de_cajas || 0;
    const limiteDineroClientes = jsonNomina10lbs.clientes.total_general || 0;
    
    // Validar si se superó el límite general de cajas
    if (totalCajasEmpleados > limiteCajasClientes) {
        
        mostrarAlerta(
            'warning',
            'Límite de cajas superado',
            `Se han capturado ${totalCajasEmpleados} cajas, pero el límite según clientes es de ${limiteCajasClientes} cajas.`
        );
    }
    
    // Validar si se superó el límite general de dinero
    if (totalDineroEmpleados > limiteDineroClientes) {
        
        mostrarAlerta(
            'warning',
            'Límite de dinero superado',
            `El total a pagar es $${totalDineroEmpleados.toFixed(2)}, pero el límite según clientes es de $${limiteDineroClientes.toFixed(2)}.`
        );
    }
    
    // Validar por tipo de caja individualmente
    validarPorTipoCaja();
}


//===================================================
// FUNCIÓN PARA VALIDAR POR TIPO DE CAJA INDIVIDUALMENTE
//===================================================

function validarPorTipoCaja() {
    
    // Validar que exista la estructura de clientes
    if (
        !jsonNomina10lbs ||
        !jsonNomina10lbs.clientes ||
        !Array.isArray(jsonNomina10lbs.clientes.registros)
    ) {
        return;
    }
    
    // Calcular cajas por tipo de caja de los clientes
    const cajasPorTipoClientes = {};
    
    jsonNomina10lbs.clientes.registros.forEach(function(cliente) {
        const tipoCaja = cliente.tipo_caja;
        const cajas = (parseInt(cliente.cajas) || 0) * (parseInt(cliente.tarimas) || 0);
        
        if (!cajasPorTipoClientes[tipoCaja]) {
            cajasPorTipoClientes[tipoCaja] = 0;
        }
        
        cajasPorTipoClientes[tipoCaja] += cajas;
    });
    
    // Calcular cajas por tipo de caja de los empleados
    const cajasPorTipoEmpleados = {};
    
    $('.input-caja-empleado').each(function() {
        const tipoCaja = $(this).data('valor');
        const cantidad = parseInt($(this).val()) || 0;
        
        if (!cajasPorTipoEmpleados[tipoCaja]) {
            cajasPorTipoEmpleados[tipoCaja] = 0;
        }
        
        cajasPorTipoEmpleados[tipoCaja] += cantidad;
    });
    
    // Validar cada tipo de caja
    for (const tipoCaja in cajasPorTipoClientes) {
        
        const limiteCajasTipo = cajasPorTipoClientes[tipoCaja] || 0;
        const cajasEmpacadasTipo = cajasPorTipoEmpleados[tipoCaja] || 0;
        
        if (cajasEmpacadasTipo > limiteCajasTipo) {
            
            mostrarAlerta(
                'warning',
                `Límite superado en caja ${tipoCaja}`,
                `Se han empacado ${cajasEmpacadasTipo} cajas de tipo ${tipoCaja}, pero el límite según clientes es de ${limiteCajasTipo} cajas.`
            );
        }
    }
}


//===================================================
// FUNCIÓN PARA OBTENER PRECIO UNITARIO POR TIPO DE CAJA
//===================================================

function obtenerPrecioUnitarioPorTipo(tipoCaja) {
    
    // Validar que exista la información de precios
    if (
        !jsonNomina10lbs ||
        !Array.isArray(jsonNomina10lbs.precio_cajas)
    ) {
        return 0;
    }
    
    // Buscar el precio correspondiente al tipo de caja
    const cajaEncontrada = jsonNomina10lbs.precio_cajas.find(
        caja => caja.valor === tipoCaja
    );
    
    // Retornar el precio si existe, si no retornar 0
    if (cajaEncontrada && cajaEncontrada.precio) {
        return parseFloat(cajaEncontrada.precio) || 0;
    }
    
    return 0;
}


//===================================================
// FUNCIÓN PARA GUARDAR EMPAQUES DE EMPLEADOS
//===================================================

function guardarEmpaquesEmpleados() {
    
    $('#btnAplicarCajasGeneral').on('click', function() {
        
        // Validar que exista la estructura del JSON
        if (!jsonNomina10lbs || !Array.isArray(jsonNomina10lbs.departamentos)) {
            mostrarAlerta(
                'error',
                'Error',
                'No existe la estructura del JSON.'
            );
            return;
        }
        
        // Limpiar historial de todos los empleados antes de guardar
        limpiarHistorialEmpleados();
        
        let registrosGuardados = 0;
        let empleadosConHistorial = new Set();
        
        // Recorrer todos los inputs con valores
        $('.input-caja-empleado').each(function() {
            
            const idEmpleado = $(this).data('id-empleado');
            const dia = $(this).data('dia');
            const tipoCaja = $(this).data('valor');
            const precioUnitario = parseFloat($(this).data('precio')) || 0;
            const cantidad = parseInt($(this).val()) || 0;
            
            // Solo procesar si hay cantidad capturada
            if (cantidad > 0) {
                
                // Calcular subtotal
                const subtotal = cantidad * precioUnitario;
                
                // Buscar el empleado en el JSON
                const empleado = buscarEmpleadoEnJSON(idEmpleado);
                
                if (empleado) {
                    
                    // Validar que exista el historial de empaque
                    if (!Array.isArray(empleado.historial_empaque)) {
                        empleado.historial_empaque = [];
                    }
                    
                    // Agregar registro al historial
                    empleado.historial_empaque.push({
                        dia: dia,
                        cantidad: cantidad,
                        precio_unitario: precioUnitario,
                        subtotal: subtotal,
                        tipo: tipoCaja
                    });
                    
                    // Marcar empleado como con historial
                    empleadosConHistorial.add(idEmpleado);
                    
                    registrosGuardados++;
                }
            }
        });
        
        // Calcular sueldo neto para cada empleado con historial
        empleadosConHistorial.forEach(function(idEmpleado) {
            
            const empleado = buscarEmpleadoEnJSON(idEmpleado);
            
            if (empleado) {
                
                // Calcular y guardar el sueldo neto
                empleado.sueldo_neto = calcularSueldoNetoEmpleado(empleado);
            }
        });
        
        if (registrosGuardados > 0) {
            // Mostrar mensaje de éxito
            mostrarAlerta(
                'success',
                'Éxito',
                `Se guardaron ${registrosGuardados} registros de empaque correctamente.`
            );

            llenarTablaNomina();
        } else {
            mostrarAlerta(
                'warning',
                'Sin datos',
                'No hay cantidades capturadas para guardar.'
            );
        }
        
        // Cerrar modal
        $('#modalCajasEmpacadas').modal('hide');
    });
}


//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADO EN EL JSON
//===================================================

function buscarEmpleadoEnJSON(idEmpleado) {
    
    // Convertir a número para asegurar comparación correcta
    const idBusqueda = parseInt(idEmpleado);
    
    // Recorrer departamentos
    for (const departamento of jsonNomina10lbs.departamentos) {
        
        // Validar que exista el arreglo de empleados
        if (!Array.isArray(departamento.empleados)) {
            continue;
        }
        
        // Buscar empleado por ID (comparación flexible)
        const empleado = departamento.empleados.find(
            emp => parseInt(emp.id_empleado) === idBusqueda
        );
        
        if (empleado) {
            return empleado;
        }
    }
    
    return null;
}


//===================================================
// FUNCIÓN PARA CALCULAR EL SUELDO NETO DEL EMPLEADO
//===================================================

function calcularSueldoNetoEmpleado(empleado) {
    
    // Validar que se proporcione un empleado
    if (!empleado) {
        return 0;
    }
    
    // Validar que exista el historial de empaque
    if (!Array.isArray(empleado.historial_empaque)) {
        return 0;
    }
    
    // Validar que el historial tenga registros
    if (empleado.historial_empaque.length === 0) {
        return 0;
    }
    
    // Sumar todos los subtotales del historial
    let sueldoNeto = 0;
    
    empleado.historial_empaque.forEach(function(registro) {
        
        const subtotal = parseFloat(registro.subtotal) || 0;
        sueldoNeto += subtotal;
    });
    
    return sueldoNeto;
}


//===================================================
// FUNCIÓN PARA LIMPIAR HISTORIAL DE EMPLEADOS
//===================================================

function limpiarHistorialEmpleados() {
    
    // Validar que exista la estructura del JSON
    if (!jsonNomina10lbs || !Array.isArray(jsonNomina10lbs.departamentos)) {
        return;
    }
    
    // Recorrer departamentos y empleados
    jsonNomina10lbs.departamentos.forEach(departamento => {
        
        if (!Array.isArray(departamento.empleados)) {
            return;
        }
        
        departamento.empleados.forEach(empleado => {
            
            // Limpiar el historial de empaque de cada empleado
            empleado.historial_empaque = [];
        });
    });
}


//===================================================
// FUNCIÓN PARA CARGAR DÍAS EXISTENTES DEL HISTORIAL
//===================================================

function cargarDiasExistentes() {
    
    // Validar que exista la estructura del JSON
    if (!jsonNomina10lbs || !Array.isArray(jsonNomina10lbs.departamentos)) {
        return;
    }
    
    // Obtener todos los días únicos del historial
    const diasUnicos = new Set();
    
    // Recorrer departamentos y empleados
    jsonNomina10lbs.departamentos.forEach(departamento => {
        
        if (!Array.isArray(departamento.empleados)) {
            return;
        }
        
        departamento.empleados.forEach(empleado => {
            
            if (!Array.isArray(empleado.historial_empaque)) {
                return;
            }
            
            empleado.historial_empaque.forEach(registro => {
                if (registro.dia) {
                    diasUnicos.add(registro.dia);
                }
            });
        });
    });
    
    // Obtener precios de cajas
    const preciosCajas = jsonNomina10lbs.precio_cajas || [];
    const preciosUtilidad = preciosCajas.filter(
        caja => caja.utilidad === true
    );
    
    // Agregar cada día encontrado
    diasUnicos.forEach(dia => {
        
        // Verificar si el día ya existe en la tabla
        let diaExiste = false;
        $('#headerFilaDias th').each(function () {
            if ($(this).data('dia') === dia) {
                diaExiste = true;
                return false;
            }
        });
        
        // Si no existe, agregarlo
        if (!diaExiste) {
            
            // Agregar encabezado del día
            $('#headerFilaDias').append(`
                <th
                   colspan="${preciosUtilidad.length}"
                   class="text-center"
                   data-dia="${dia}"
                   style="
                   min-width: ${preciosUtilidad.length * 120}px;
                ">
                ${dia}
                </th>
            `);
            
            // Agregar subencabezado de precios y valores
            preciosUtilidad.forEach(caja => {
                $('#encabezadoDias').append(`
                    <th
                        class="text-center"
                        data-dia="${dia}"
                        data-valor="${caja.valor}"
                        data-precio="${caja.precio}"
                        style="
                        background-color: ${caja.color};
                        min-width: 120px;
                        white-space: nowrap;
                    ">
                        ${caja.valor}
                    </th>
                `);
            });
            
            // Agregar celdas de inputs para este día
            agregarCeldasInputsEmpleados(dia, preciosUtilidad);
        }
    });
}


//===================================================
// FUNCIÓN PARA CARGAR VALORES DEL HISTORIAL
//===================================================

function cargarValoresHistorial() {
    
    // Validar que exista la estructura del JSON
    if (!jsonNomina10lbs || !Array.isArray(jsonNomina10lbs.departamentos)) {
        return;
    }
    
    // Recorrer departamentos y empleados
    jsonNomina10lbs.departamentos.forEach(departamento => {
        
        if (!Array.isArray(departamento.empleados)) {
            return;
        }
        
        departamento.empleados.forEach(empleado => {
            
            if (!Array.isArray(empleado.historial_empaque)) {
                return;
            }
            
            // Recorrer cada registro del historial
            empleado.historial_empaque.forEach(registro => {
                
                const idEmpleado = empleado.id_empleado;
                const dia = registro.dia;
                const tipoCaja = registro.tipo;
                const cantidad = registro.cantidad;
                
                // Buscar el input correspondiente y asignar el valor
                $(`.input-caja-empleado[data-id-empleado="${idEmpleado}"][data-dia="${dia}"][data-valor="${tipoCaja}"]`).val(cantidad);
            });
        });
    });
    
    // Calcular totales iniciales
    calcularTotalesEmpleados();
}