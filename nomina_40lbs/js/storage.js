// Funciones simples y fáciles de entender para Local Storage
// Guardar automáticamente antes de recargar la página
// Solo guardar si jsonNomina40lbs tiene datos válidos (evita re-grabar después de un clear)
window.addEventListener('beforeunload', function () {
    if (jsonNomina40lbs && Array.isArray(jsonNomina40lbs.departamentos) && jsonNomina40lbs.departamentos.length > 0) {
        saveNomina(jsonNomina40lbs);
    }
});

//=======================================
// GUARDA LA NOMINA EN LOCAL STORAGE
//=======================================

function saveNomina(jsonNomina40lbs) {
    try {
        const str = JSON.stringify(jsonNomina40lbs);
        localStorage.setItem('jsonNomina40lbs', str);
        return true;
    } catch (err) {
        return false;
    }
}

//=======================================
// CARGA LA NOMINA DESDE LOCAL STORAGE
//=======================================

function loadNomina() {
    try {
        const str = localStorage.getItem('jsonNomina40lbs');
        if (!str) return null;
        return JSON.parse(str);
    } catch (err) {
        return null;
    }
}

//=======================================
// LIMPIA LA NOMINA DE LOCAL STORAGE Y DE LA VARIABLE GLOBAL
//=======================================

function clearNomina() {
    try {
        localStorage.removeItem('jsonNomina40lbs');
        // También limpiar la variable global para evitar que se vuelva a guardar en beforeunload
        if (typeof window !== 'undefined') {
            window.jsonNomina40lbs = null;
        }
        return true;
    } catch (err) {
        return false;
    }
}


//=======================================
// RESTAURA LA NOMINA DESDE LOCAL STORAGE Y ACTUALIZA LA VISTA
//=======================================

// Restaura la nómina desde localStorage y actualiza la vista si las funciones UI están disponibles
function restoreNomina() {
    try {
        const stored = loadNomina();
        if (!stored) return false;

        // Poner la variable global para que el resto del código la use
        jsonNomina40lbs = stored;

        if (typeof initComponents === 'function') {
            initComponents();
        }

        // Renderizar tabla restaurada
        if (typeof mostrarDatosTabla === 'function') {
            poblarSelectDepartamentos(jsonNomina40lbs); // Poblar el select dinámico
            refrescarTabla(); // Usar la lógica dinámica en lugar de ID estático
        }
        actualizarCabeceraNomina(jsonNomina40lbs);

        return true;
    } catch (err) {

        return false;
    }
}


