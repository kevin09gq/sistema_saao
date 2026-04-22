// Funciones simples y fáciles de entender para Local Storage
// Guardar automáticamente antes de recargar la página
window.addEventListener('beforeunload', function() {
    if (typeof jsonNominaConfianza !== 'undefined' && jsonNominaConfianza) {
        saveNomina(jsonNominaConfianza);
    }
});
function saveNomina(jsonNominaConfianza) {
    try {
        const str = JSON.stringify(jsonNominaConfianza);
        localStorage.setItem('jsonNominaConfianza', str);
        return true;
    } catch (err) {
        return false;
    }
}

function loadNomina() {
    try {
        const str = localStorage.getItem('jsonNominaConfianza');
        if (!str) return null;
        return JSON.parse(str);
    } catch (err) {
        return null;
    }
}

function clearNomina() {
    try {
        localStorage.removeItem('jsonNominaConfianza');
        return true;
    } catch (err) {
        return false;
    }
}

// Helper simple: guarda la variable global `jsonNominaConfianza` si existe
function autosaveNomina() {
    if (typeof jsonNominaConfianza !== 'undefined' && jsonNominaConfianza) {
        return saveNomina(jsonNominaConfianza);
    }
    return false;
}

// Restaura la nómina desde localStorage y actualiza la vista si las funciones UI están disponibles
function restoreNomina() {
    try {
        const stored = loadNomina();
        if (!stored) return false;

        // Poner la variable global para que el resto del código la use
        jsonNominaConfianza = stored;

        // Asegurar que existan las propiedades necesarias si la función está disponible
        if (typeof asignarPropiedadesEmpleado === 'function') {
            asignarPropiedadesEmpleado(jsonNominaConfianza);
        }

        // Mostrar la UI existente sólo si las funciones están definidas
        if (typeof setInitialVisibility === 'function') {
            setInitialVisibility();
        }
        if (typeof obtenerDepartamentosPermitidos === 'function') {
            obtenerDepartamentosPermitidos();
        }
        if (typeof mostrarDatosTabla === 'function') {
            mostrarDatosTabla(jsonNominaConfianza);
        }
        if (typeof actualizarCabeceraNomina === 'function') {
            actualizarCabeceraNomina(jsonNominaConfianza);
        }

        return true;
    } catch (err) {
        
        return false;
    }
}


