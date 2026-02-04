function initComponents() {
    $("#container-nomina_40lbs").attr("hidden", true);

    $("#tabla-nomina-responsive").removeAttr("hidden");

}

function limpiarCamposNomina() {
    $("#btn_limpiar_datos").click(function (e) {
        e.preventDefault();

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
                clearNomina();
                $("#container-nomina_40lbs").removeAttr("hidden");
                $("#tabla-nomina-responsive").attr("hidden", true);
            }
        });


    });

}

