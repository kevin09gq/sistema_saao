$(document).ready(function () {
    const rutaPlugins = '/sistema_saao/';
    obtenerDepartamentos();

    //Funcion para obtener los departamentos
    function obtenerDepartamentos() {
        $.ajax({
            type: "GET",
            url: rutaPlugins + "public/php/obtenerDepartamentos.php",
            success: function (response) {
                let departamentos = JSON.parse(response);
                let opciones = `<option value="">Selecciona un departamento</option>`;

                departamentos.forEach((element) => {
                    opciones += `
                    <option value="${element.id_departamento}">${element.nombre_departamento}</option>
                `;
                });

                // Asegúrate de usar el ID correcto del select
                $("#filtro-departamento-modal").html(opciones);
            },
            error: function () {
                console.error("Error al cargar departamentos");
            }
        });
    }
});