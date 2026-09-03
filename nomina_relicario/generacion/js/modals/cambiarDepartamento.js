$(document).ready(function () {
    abrirModalCambiarDepartamento();
    eventoSeleccionEmpleado();
    eventoSeleccionDepartamento();
    confirmarReasignacion();
});

//===================================================
// ABRIR MODAL Y POBLAR SELECTS
//===================================================

function abrirModalCambiarDepartamento() {

    $('#btn_cambiar_departamento').click(function () {

        // ocultar etiqueta de depto actual y alerta de incompatibilidad
        $('#infoDeptoActual').hide();
        $('#alertIncompatible').hide();
        $('#lblDeptoActual').text('');

        // poblar el select de empleados y departamentos
        poblarSelectsModal();

        // abrir el modal de bootstrap
        $('#modalCambiarDepartamento').modal('show');

    });

}

//===================================================
// POBLAR SELECT DE EMPLEADOS Y DEPARTAMENTOS
//===================================================

function poblarSelectsModal() {

    // limpiar opciones iniciales de los selects
    $('#selectEmpleadoCambiarDepto').html('<option value="">Selecciona un empleado</option>');
    $('#selectDepartamentoDestino').html('<option value="">Selecciona un departamento</option>');

    if (!jsonNominaRelicario || !Array.isArray(jsonNominaRelicario.departamentos)) return;

    // recorrer departamentos para agregar grupos de empleados y departamentos destino
    jsonNominaRelicario.departamentos.forEach(function (departamento) {

        // agregar opciones al select de departamentos destino
        $('#selectDepartamentoDestino').append(`
            <option value="${departamento.id_departamento}" data-tipo="${departamento.tipo_horario}">
                ${departamento.nombre}
            </option>
        `);

        if (!Array.isArray(departamento.empleados)) return;

        // filtrar empleados visibles
        const empleadosMostrar = departamento.empleados.filter(function (emp) {
            return emp.mostrar !== false;
        });

        if (empleadosMostrar.length === 0) return;

        // crear grupo por departamento en el select de empleados
        let groupHTML = `<optgroup label="${departamento.nombre}">`;

        empleadosMostrar.forEach(function (empleado) {
            groupHTML += `
                <option value="${empleado.id_empleado}" data-depto="${departamento.id_departamento}">
                    ${empleado.nombre} (${empleado.clave || ''})
                </option>
            `;
        });

        groupHTML += `</optgroup>`;

        $('#selectEmpleadoCambiarDepto').append(groupHTML);

    });

}

//===================================================
// EVENTO AL SELECCIONAR UN EMPLEADO
//===================================================

function eventoSeleccionEmpleado() {

    $('#selectEmpleadoCambiarDepto').change(function () {

        let optionEmp = $(this).find('option:selected');
        let idEmpleado = $(this).val();
        let idDeptoOrigen = optionEmp.data('depto');

        // si se deselecciona el empleado
        if (!idEmpleado) {
            $('#infoDeptoActual').hide();
            $('#lblDeptoActual').text('');
            $('#alertIncompatible').hide();
            return;
        }

        // buscar departamento de origen
        let deptoOrigen = jsonNominaRelicario.departamentos.find(function (d) {
            return d.id_departamento == idDeptoOrigen;
        });

        if (deptoOrigen) {
            // mostrar el nombre del departamento actual
            $('#lblDeptoActual').text(deptoOrigen.nombre);
            $('#infoDeptoActual').show();
        }

        // evaluar compatibilidad si ya hay un departamento destino seleccionado
        validarCompatibilidadDepartamentos();

    });

}

//===================================================
// EVENTO AL SELECCIONAR UN DEPARTAMENTO DESTINO
//===================================================

function eventoSeleccionDepartamento() {

    $('#selectDepartamentoDestino').change(function () {

        // evaluar si el departamento destino es compatible con el departamento actual del empleado
        validarCompatibilidadDepartamentos();

    });

}

//===================================================
// VALIDAR COMPATIBILIDAD DE TIPOS DE HORARIO
//===================================================

function validarCompatibilidadDepartamentos() {

    let optionEmp = $('#selectEmpleadoCambiarDepto').find('option:selected');
    let idEmpleado = $('#selectEmpleadoCambiarDepto').val();
    let idDeptoOrigen = optionEmp.data('depto');
    let idDeptoDestino = $('#selectDepartamentoDestino').val();

    // si no hay empleado o departamento seleccionado, ocultar alerta
    if (!idEmpleado || !idDeptoDestino) {
        $('#alertIncompatible').hide();
        return true;
    }

    // buscar departamento de origen y destino
    let deptoOrigen = jsonNominaRelicario.departamentos.find(function (d) {
        return d.id_departamento == idDeptoOrigen;
    });

    let deptoDestino = jsonNominaRelicario.departamentos.find(function (d) {
        return d.id_departamento == idDeptoDestino;
    });

    if (!deptoOrigen || !deptoDestino) {
        $('#alertIncompatible').hide();
        return true;
    }

    // comparar tipos de horario (tipo 1 con 1, tipo 2 con 2)
    if (deptoOrigen.tipo_horario != deptoDestino.tipo_horario) {
        // mostrar mensaje de incompatibilidad
        $('#alertIncompatible').slideDown();
        return false;
    } else {
        // ocultar mensaje si son compatibles
        $('#alertIncompatible').hide();
        return true;
    }

}

//===================================================
// CONFIRMAR REASIGNACIÓN DE DEPARTAMENTO
//===================================================

function confirmarReasignacion() {

    $('#btnConfirmarReasignacion').click(function () {

        let idEmpleado = $('#selectEmpleadoCambiarDepto').val();
        let idDeptoOrigen = $('#selectEmpleadoCambiarDepto').find('option:selected').data('depto');
        let idDeptoDestino = $('#selectDepartamentoDestino').val();

        // validar selección de empleado
        if (!idEmpleado) {
            mostrarAlerta('warning', 'Advertencia', 'Por favor, selecciona un empleado.');
            return;
        }

        // validar selección de departamento destino
        if (!idDeptoDestino) {
            mostrarAlerta('warning', 'Advertencia', 'Por favor, selecciona el departamento destino.');
            return;
        }

        // validar que los tipos de horario sean compatibles
        let esCompatible = validarCompatibilidadDepartamentos();
        if (!esCompatible) {
            mostrarAlerta('error', 'Departamento no compatible', 'No es posible reasignar un empleado entre departamentos con diferente tipo de horario.');
            return;
        }

        // buscar departamentos
        let deptoOrigen = jsonNominaRelicario.departamentos.find(function (d) {
            return d.id_departamento == idDeptoOrigen;
        });

        let deptoDestino = jsonNominaRelicario.departamentos.find(function (d) {
            return d.id_departamento == idDeptoDestino;
        });

        if (!deptoOrigen || !deptoDestino) {
            mostrarAlerta('error', 'Error', 'No se encontraron los datos del departamento.');
            return;
        }

        // buscar el índice del empleado en el departamento de origen
        let empIndex = deptoOrigen.empleados.findIndex(function (e) {
            return e.id_empleado.toString() === idEmpleado.toString();
        });

        if (empIndex === -1) {
            mostrarAlerta('error', 'Error', 'No se encontró al empleado en el departamento original.');
            return;
        }

        // extraer el empleado del departamento de origen
        let empleado = deptoOrigen.empleados.splice(empIndex, 1)[0];

        // actualizar el id_departamento del empleado
        empleado.id_departamento = parseInt(idDeptoDestino);

        // agregar al departamento destino
        deptoDestino.empleados.push(empleado);

        // ordenar empleados del departamento destino alfabéticamente
        deptoDestino.empleados.sort(function (a, b) {
            return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
        });

        // actualizar la tabla de nómina
        llenarTablaNomina();

        // cerrar el modal
        $('#modalCambiarDepartamento').modal('hide');

        // notificar éxito al usuario
        mostrarAlerta('success', 'Éxito', `Se reasignó a ${empleado.nombre} al departamento ${deptoDestino.nombre}.`);

    });

}
