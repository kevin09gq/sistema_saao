
// Variable global para almacenar el JSON original sin filtrar
let jsonNomina40lbsOriginal = null;

filtrarEmpleados();

function filtrarEmpleados(){
   $('#filtro-departamento').on('change', function () {
        const valorSelect = $(this).val();

        // Guardar el JSON original en la primera vez
        if (jsonNomina40lbsOriginal === null && jsonNomina40lbs !== null) {
            jsonNomina40lbsOriginal = JSON.parse(JSON.stringify(jsonNomina40lbs));
        }

        // Si no hay JSON original, no hacer nada
        if (jsonNomina40lbsOriginal === null) {
            console.warn('No hay datos de nómina cargados');
            return;
        }

        // Mapear el valor del select a id_departamento y seguroSocial
        let idDepartamento = null;
        let seguroSocial = null;

        if (valorSelect === '1') {
            idDepartamento = 4;
            seguroSocial = true;
        } else if (valorSelect === '2') {
            idDepartamento = 4;
            seguroSocial = false;
        } else if (valorSelect === '3') {
            idDepartamento = 5;
            seguroSocial = true;
        } else if (valorSelect === '4') {
            idDepartamento = 5;
            seguroSocial = false;
        }

        // Filtrar empleados usando una sola función
        const jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNomina40lbsOriginal, idDepartamento, seguroSocial);

        // Mostrar datos en la tabla
        mostrarDatosTabla(jsonFiltrado, 1);
    });
}

