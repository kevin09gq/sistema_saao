// Funciones simples y fáciles de entender para Local Storage
// Guardar automáticamente antes de recargar la página
// Solo guardar si jsonNominaRelicario tiene datos válidos (evita re-grabar después de un clear)
window.addEventListener('beforeunload', function() {
    if (jsonNominaRelicario && Array.isArray(jsonNominaRelicario.departamentos) && jsonNominaRelicario.departamentos.length > 0) {
        saveNomina(jsonNominaRelicario);
    }
});


function saveNomina(jsonNominaRelicario) {
    try {
        const str = JSON.stringify(jsonNominaRelicario);
        localStorage.setItem('jsonNominaRelicario', str);
        return true;
    } catch (err) {
        return false;
    }
}

function loadNomina() {
    try {
        const str = localStorage.getItem('jsonNominaRelicario');
        if (!str) return null;
        return JSON.parse(str);
    } catch (err) {
        return null;
    }
}

function clearNomina() {
    try {
        localStorage.removeItem('jsonNominaRelicario');
        window.jsonNominaRelicario = null;
        
        // Limpiar tabla, formulario y ocultar contenedor
        $('#tabla-nomina-body-relicario').empty();
        $('#form_excel_raya')[0].reset();
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
        jsonNominaRelicario = stored;

        if (typeof initComponents === 'function') {
            initComponents();
        }

        // Renderizar tabla restaurada
        if (typeof mostrarDatosTabla === 'function') {
             // Filtrar empleados con id_tipo_puesto 1
                let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, 7);


                mostrarDatosTabla(jsonFiltrado, 1);
        }

        return true;
    } catch (err) {
        
        return false;
    }
}


