//===================================================
// FUNCIONES DEL MODAL DE CAPTURA GENERAL DE CAJAS EMPACADAS
//===================================================

$(document).ready(function () {

    abrirModalCajasEmpacadas();

});


//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE CAPTURA DE CAJAS
//===================================================

function abrirModalCajasEmpacadas() {

    $('#btnVerCajas').click(function () {

        // Limpiar completamente la tabla antes de cargar
        limpiarTablaCajas();

        // Cargar empleados
        cargarEmpleadosCajas();

        // Cargar días existentes del historial
        cargarDiasExistentes();

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

    jsonHistorial10lbs .departamentos.forEach(departamento => {


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
                        disabled
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
}





//===================================================
// FUNCIÓN PARA CARGAR DÍAS EXISTENTES DEL HISTORIAL
//===================================================

function cargarDiasExistentes() {
    
    // Validar que exista la estructura del JSON
    if (!jsonHistorial10lbs  || !Array.isArray(jsonHistorial10lbs .departamentos)) {
        return;
    }
    
    // Obtener todos los días únicos del historial
    const diasUnicos = new Set();
    
    // Recorrer departamentos y empleados
    jsonHistorial10lbs .departamentos.forEach(departamento => {
        
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
    const preciosCajas = jsonHistorial10lbs .precio_cajas || [];
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
    if (!jsonHistorial10lbs  || !Array.isArray(jsonHistorial10lbs .departamentos)) {
        return;
    }
    
    // Recorrer departamentos y empleados
    jsonHistorial10lbs .departamentos.forEach(departamento => {
        
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