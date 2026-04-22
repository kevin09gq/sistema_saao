// Funciones simples y fáciles de entender para Local Storage
// Guardar automáticamente antes de recargar la página
// Solo guardar si jsonNominaConfianza tiene datos válidos (evita re-grabar después de un clear)
window.addEventListener('beforeunload', function () {
    if (jsonNominaConfianza && Array.isArray(jsonNominaConfianza.departamentos) && jsonNominaConfianza.departamentos.length > 0) {
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
        // También limpiar la variable global para evitar que se vuelva a guardar en beforeunload
        if (typeof window !== 'undefined') {
            window.jsonNominaConfianza = null;
        }
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
        jsonNominaConfianza = stored;

        if (typeof initComponents === 'function') {
            initComponents();
        }  

        // Renderizar tabla restaurada
        if (typeof aplicarFiltrosConfianza === 'function') {
            aplicarFiltrosConfianza();
        }
        actualizarCabeceraNomina(jsonNominaConfianza);

        return true;
    } catch (err) {

        return false;
    }
}


