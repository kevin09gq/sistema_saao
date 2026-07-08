$(document).ready(function () {
    abrirModalListaDeRaya();
});



// FUNCIÓN PARA ABRIR EL MODAL DE LISTA DE RAYA
function abrirModalListaDeRaya() {

    // Detectar el clic en el botón "Actualizar Lista de Raya"
    $('#btn_lista_raya').click(function () {

        // Abrir el modal de Bootstrap
        $('#modalListaRaya').modal('show');

    });

}