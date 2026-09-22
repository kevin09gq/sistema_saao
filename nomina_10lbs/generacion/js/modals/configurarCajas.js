$(document).ready(function () {

    abrirModalConfigurarCajas();

    editarCajaUtilidad();

});


//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE CONFIGURACIÓN
// DE LAS CAJAS EN LA UTILIDAD
//===================================================

function abrirModalConfigurarCajas() {

    // Detectar el clic en el botón para configurar las cajas
    $('#btn_configurar_cajas_utilidad').click(function () {

        // Cargar las cajas antes de mostrar el modal
        cargarCajasUtilidad();

        // Abrir el modal de Bootstrap
        $('#modalConfigurarCajasUtilidad').modal('show');

    });

}


//===================================================
// FUNCIÓN PARA CARGAR LAS CAJAS EN EL MODAL
// MUESTRA:
// VALOR, PRECIO, COLOR Y UTILIDAD
//===================================================

function cargarCajasUtilidad() {

    // Limpiar tabla
    $('#tbody-configurar-cajas-utilidad').empty();


    // Validar que exista el arreglo de cajas
    if (
        !jsonNomina10lbs ||
        !jsonNomina10lbs.precio_cajas ||
        jsonNomina10lbs.precio_cajas.length === 0
    ) {

        $('#tbody-configurar-cajas-utilidad').append(`
            <tr>

                <td colspan="5" class="text-center">

                    No existen cajas configuradas.

                </td>

            </tr>
        `);

        return;
    }


    // Recorrer las cajas
    jsonNomina10lbs.precio_cajas.forEach(function (caja, indice) {

        // Determinar el estado de utilidad
        let utilidadSeleccionada = caja.utilidad === true;


        $('#tbody-configurar-cajas-utilidad').append(`

            <tr data-indice="${indice}">

                <!-- VALOR -->
                <td class="text-center fw-bold">

                    ${caja.valor}

                </td>


                <!-- PRECIO -->
                <td class="text-center">

                    $${parseFloat(caja.precio || 0).toFixed(2)}

                </td>


                <!-- COLOR -->
                <td class="text-center">

                    <input
                        type="color"
                        class="form-control form-control-color mx-auto input-color-caja"
                        value="${caja.color || '#ffffff'}"
                        data-indice="${indice}">

                </td>


                <!-- UTILIDAD -->
                <td class="text-center">

                    <div class="form-check form-switch d-flex justify-content-center">

                        <input
                            class="form-check-input input-utilidad-caja"
                            type="checkbox"
                            role="switch"
                            data-indice="${indice}"
                            ${utilidadSeleccionada ? 'checked' : ''}>

                    </div>

                </td>


                <!-- EDITAR -->
                <td class="text-center">

                    <button
                        type="button"
                        class="btn btn-success btn-sm btn-editar-caja-utilidad"
                        data-indice="${indice}">

                        <i class="bi bi-pencil-square me-1"></i>

                        Editar

                    </button>

                </td>

            </tr>

        `);

    });

}

//===================================================
// FUNCIÓN PARA EDITAR UNA CAJA
// SOLAMENTE MODIFICA:
// COLOR Y UTILIDAD
//===================================================

function editarCajaUtilidad() {

    $(document).on(
        'click',
        '.btn-editar-caja-utilidad',
        function () {

            // Obtener índice de la caja
            let indice = $(this).data('indice');


            // Obtener la caja del JSON
            let caja = jsonNomina10lbs.precio_cajas[indice];


            // Validar que exista la caja
            if (!caja) {

                mostrarAlerta(
                    "warning",
                    "Advertencia",
                    "No se encontró la caja seleccionada."
                );

                return;
            }


            // Obtener el color seleccionado
            let color = $(
                '.input-color-caja[data-indice="' + indice + '"]'
            ).val();


            // Obtener el estado de utilidad
            let utilidad = $(
                '.input-utilidad-caja[data-indice="' + indice + '"]'
            ).prop('checked');


            caja.color = color;

            caja.utilidad = utilidad;


            // Mostrar información en consola
            console.log("Caja actualizada:", caja);


            // Mostrar mensaje
            mostrarAlerta(
                "success",
                "Éxito",
                "La configuración de la caja se actualizó correctamente."
            );

        }
    );

}