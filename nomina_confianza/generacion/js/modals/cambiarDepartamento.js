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

//===================================================
// POBLAR SELECT DE EMPLEADOS Y DEPARTAMENTOS
//===================================================

function poblarSelectsModal() {

    // limpiar opciones iniciales de los selects
    $('#selectEmpleadoCambiarDepto').html(
        '<option value="">Selecciona un empleado</option>'
    );

    $('#selectDepartamentoDestino').html(
        '<option value="">Selecciona un departamento</option>'
    );

    if (
        !jsonNominaConfianza ||
        !Array.isArray(jsonNominaConfianza.departamentos)
    ) {
        return;
    }

    // recorrer todos los departamentos
    jsonNominaConfianza.departamentos.forEach(function (departamento) {

        // agregar el departamento destino con empresa y departamento
        $('#selectDepartamentoDestino').append(`
            <option value="${departamento.id_empresa}|${departamento.id_departamento}">
                ${departamento.nombre}
            </option>
        `);

        if (!Array.isArray(departamento.empleados)) {
            return;
        }

        // filtrar empleados visibles
        const empleadosMostrar = departamento.empleados.filter(function (empleado) {
            return empleado.mostrar !== false;
        });

        if (empleadosMostrar.length === 0) {
            return;
        }

        // crear grupo por departamento
        let groupHTML = `<optgroup label="${departamento.nombre}">`;

        empleadosMostrar.forEach(function (empleado) {

            groupHTML += `
                <option
                    value="${empleado.id_empleado}"
                    data-empresa="${departamento.id_empresa}"
                    data-depto="${departamento.id_departamento}">
                    ${empleado.nombre} (${empleado.clave || ''})
                </option>
            `;

        });

        groupHTML += `</optgroup>`;

        $('#selectEmpleadoCambiarDepto').append(groupHTML);

    });

}


//===================================================
// EVENTO PARA SELECCIONAR EMPLEADO
//===================================================

function eventoSeleccionEmpleado() {

    $('#selectEmpleadoCambiarDepto').on('change', function () {

        // obtener el empleado seleccionado
        let idEmpleado = Number($(this).val());

        // limpiar información anterior
        $('#lblDeptoActual').text('');
        $('#infoDeptoActual').hide();
        $('#alertIncompatible').hide();

        if (!idEmpleado) {
            return;
        }

        // buscar el empleado dentro de todos los departamentos
        let empleadoEncontrado = null;
        let departamentoActual = null;

        jsonNominaConfianza.departamentos.forEach(function (departamento) {

            if (!Array.isArray(departamento.empleados)) {
                return;
            }

            departamento.empleados.forEach(function (empleado) {

                if (Number(empleado.id_empleado) === idEmpleado) {
                    empleadoEncontrado = empleado;
                    departamentoActual = departamento;
                }

            });

        });

        if (!empleadoEncontrado || !departamentoActual) {
            return;
        }

        // mostrar el departamento actual del empleado
        $('#lblDeptoActual').text(
            departamentoActual.nombre
        );

        $('#infoDeptoActual').show();

        // guardar temporalmente la información del departamento actual
        $('#selectEmpleadoCambiarDepto').data(
            'empresa-actual',
            departamentoActual.id_empresa
        );

        $('#selectEmpleadoCambiarDepto').data(
            'depto-actual',
            departamentoActual.id_departamento
        );

    });

}


//===================================================
// EVENTO PARA SELECCIONAR DEPARTAMENTO DESTINO
//===================================================

function eventoSeleccionDepartamento() {

    $('#selectDepartamentoDestino').on('change', function () {

        // obtener el departamento destino
        let valorDestino = $(this).val();

        // ocultar alerta
        $('#alertIncompatible').hide();

        if (!valorDestino) {
            return;
        }

        // separar empresa y departamento
        let datosDestino = valorDestino.split('|');

        let idEmpresaDestino = Number(datosDestino[0]);
        let idDepartamentoDestino = Number(datosDestino[1]);

        // obtener el empleado seleccionado
        let idEmpleado = Number(
            $('#selectEmpleadoCambiarDepto').val()
        );

        if (!idEmpleado) {
            return;
        }

        // obtener la empresa y departamento actuales
        let idEmpresaActual = Number(
            $('#selectEmpleadoCambiarDepto').data('empresa-actual')
        );

        let idDepartamentoActual = Number(
            $('#selectEmpleadoCambiarDepto').data('depto-actual')
        );

        // validar si el destino es el mismo departamento actual
        if (
            idEmpresaActual === idEmpresaDestino &&
            idDepartamentoActual === idDepartamentoDestino
        ) {

            $('#alertIncompatible')
                .removeClass('alert-danger')
                .addClass('alert-warning');

            $('#alertIncompatible span').text(
                'El empleado ya pertenece a este departamento.'
            );

            $('#alertIncompatible').show();

            return;
        }

        // restaurar el estado normal de la alerta
        $('#alertIncompatible')
            .removeClass('alert-warning')
            .addClass('alert-danger');

        $('#alertIncompatible span').text(
            'Departamento no compatible.'
        );

    });

}


//===================================================
// CONFIRMAR REASIGNACIÓN DEL EMPLEADO
//===================================================

function confirmarReasignacion() {

    $('#btnConfirmarReasignacion').click(function () {

        // obtener el empleado seleccionado
        let idEmpleado = Number(
            $('#selectEmpleadoCambiarDepto').val()
        );

        // obtener el departamento destino
        let valorDestino = $('#selectDepartamentoDestino').val();

        // validar que se haya seleccionado un empleado
        if (!idEmpleado) {

            mostrarAlerta(
                'warning',
                'Empleado no seleccionado',
                'Selecciona un empleado antes de continuar.'
            );

            return;
        }

        // validar que se haya seleccionado un departamento
        if (!valorDestino) {

            mostrarAlerta(
                'warning',
                'Departamento no seleccionado',
                'Selecciona un departamento destino antes de continuar.'
            );

            return;
        }

        // separar empresa y departamento destino
        let datosDestino = valorDestino.split('|');

        let idEmpresaDestino = Number(datosDestino[0]);
        let idDepartamentoDestino = Number(datosDestino[1]);

        // buscar el departamento destino
        let departamentoDestino = null;

        jsonNominaConfianza.departamentos.forEach(function (departamento) {

            if (
                Number(departamento.id_empresa) === idEmpresaDestino &&
                Number(departamento.id_departamento) === idDepartamentoDestino
            ) {
                departamentoDestino = departamento;
            }

        });

        // validar que exista el departamento destino
        if (!departamentoDestino) {

            mostrarAlerta(
                'error',
                'Departamento no encontrado',
                'No se encontró el departamento seleccionado.'
            );

            return;
        }

        // buscar al empleado y su departamento actual
        let empleadoEncontrado = null;
        let departamentoOrigen = null;
        let indiceEmpleado = -1;

        jsonNominaConfianza.departamentos.forEach(function (departamento) {

            if (!Array.isArray(departamento.empleados)) {
                return;
            }

            for (let i = 0; i < departamento.empleados.length; i++) {

                if (
                    Number(departamento.empleados[i].id_empleado) === idEmpleado
                ) {

                    empleadoEncontrado = departamento.empleados[i];
                    departamentoOrigen = departamento;
                    indiceEmpleado = i;

                    break;
                }

            }

        });

        // validar que se haya encontrado al empleado
        if (!empleadoEncontrado || !departamentoOrigen) {

            mostrarAlerta(
                'error',
                'Empleado no encontrado',
                'No se encontró el empleado dentro de la nómina.'
            );

            return;
        }

        // validar que no sea el mismo departamento
        if (
            Number(departamentoOrigen.id_empresa) === idEmpresaDestino &&
            Number(departamentoOrigen.id_departamento) === idDepartamentoDestino
        ) {

            mostrarAlerta(
                'warning',
                'Departamento actual',
                'El empleado ya pertenece al departamento seleccionado.'
            );

            return;
        }

        // confirmar la reasignación
        Swal.fire({
            icon: 'question',
            title: '¿Confirmar reasignación?',
            html: `
                <div class="text-start">
                    <p class="mb-2">
                        <strong>Empleado:</strong><br>
                        ${empleadoEncontrado.nombre}
                    </p>

                    <p class="mb-2">
                        <strong>Departamento actual:</strong><br>
                        ${departamentoOrigen.nombre}
                    </p>

                    <p class="mb-0">
                        <strong>Nuevo departamento:</strong><br>
                        ${departamentoDestino.nombre}
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Sí, reasignar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then(function (resultado) {

            if (!resultado.isConfirmed) {
                return;
            }

            // eliminar al empleado del departamento actual
            departamentoOrigen.empleados.splice(
                indiceEmpleado,
                1
            );

            // actualizar la información del empleado
            empleadoEncontrado.id_departamento = idDepartamentoDestino;
            empleadoEncontrado.id_empresa = idEmpresaDestino;

            // agregar al empleado al nuevo departamento
            departamentoDestino.empleados.push(
                empleadoEncontrado
            );

            // cerrar el modal
            $('#modalCambiarDepartamento').modal('hide');

            // limpiar los controles del modal
            $('#selectEmpleadoCambiarDepto').val('');
            $('#selectDepartamentoDestino').val('');
            $('#lblDeptoActual').text('');
            $('#infoDeptoActual').hide();
            $('#alertIncompatible').hide();

            // volver a cargar los departamentos en el filtro
            cargarFiltroDepartamentos();

            // seleccionar el nuevo departamento en el filtro principal
            $('#filtro-departamento').val(
                idEmpresaDestino + '|' + idDepartamentoDestino
            );

            // ORDENAR EMPLEADOS
            jsonNominaConfianza.departamentos.forEach(function (departamento) {

                departamento.empleados.sort(function (a, b) {

                    return a.nombre.localeCompare(b.nombre, 'es', {
                        sensitivity: 'base'
                    });

                });

            });


            // actualizar la tabla
            llenarTablaNomina();

            // mostrar mensaje de confirmación
            mostrarAlerta(
                'success',
                'Empleado reasignado',
                'El empleado fue reasignado correctamente al nuevo departamento.'
            );

        });

    });

}