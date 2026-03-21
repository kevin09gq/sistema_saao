// Funciones simples y fáciles de entender para Local Storage
// Guardar automáticamente antes de recargar la página
// Solo guardar si jsonNominaHuasteca tiene datos válidos (evita re-grabar después de un clear)
window.addEventListener('beforeunload', function () {
    if (jsonNominaHuasteca && Array.isArray(jsonNominaHuasteca.departamentos) && jsonNominaHuasteca.departamentos.length > 0) {
        saveNomina(jsonNominaHuasteca);
    }
});


function saveNomina(jsonNominaHuasteca) {
    try {
        const str = JSON.stringify(jsonNominaHuasteca);
        localStorage.setItem('jsonNominaHuasteca', str);
        return true;
    } catch (err) {
        return false;
    }
}

function loadNomina() {
    try {
        const str = localStorage.getItem('jsonNominaHuasteca');
        if (!str) return null;
        return JSON.parse(str);
    } catch (err) {
        return null;
    }
}

function clearNomina() {
    try {
        localStorage.removeItem('jsonNominaHuasteca');
        window.jsonNominaHuasteca = null;

        // Limpiar tabla, formulario y ocultar contenedor
        $('#tabla-nomina-body-huasteca').empty();
        
        //('#form_excel_raya')[0].reset();
        $('#tabla-nomina-responsive').prop('hidden', true);

        return true;
    } catch (err) {
        return false;
    }
}


// Restaura la nómina desde localStorage y actualiza la vista si las funciones UI están disponibles
function restoreNomina() {
    try {
        const stored = loadNomina();
        if (!stored) return false;

        // Poner la variable global para que el resto del código la use
        jsonNominaHuasteca = stored;

        if (typeof initComponents === 'function') {
            initComponents();
        }

        // Renderizar tabla restaurada
        if (typeof mostrarDatosTabla === 'function') {
            // Filtrar empleados con id_departamento = 12
            let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaHuasteca, 12);
            mostrarDatosTabla(jsonFiltrado, 1);
        }

       // actualizarCabeceraNomina(jsonNominaHuasteca);

        return true;
    } catch (err) {

        return false;
    }
}


