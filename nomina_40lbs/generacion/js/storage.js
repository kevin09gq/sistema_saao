//======================================================================
// FUNCION PARA GUARDAR LA NOMINA CUANDO SE RECARGA LA PAGINA 
//======================================================================

window.addEventListener('beforeunload', function () {
    if (typeof jsonNomina40lbs !== 'undefined') {
        saveNomina(jsonNomina40lbs);
    }
});

//======================================================================
//FUNCION PARA GUARDAR EL JSON DE LA NOMINA EN EL LOCAL STORAGE
//======================================================================

function saveNomina(jsonNomina40lbs) {
    try {
        const str = JSON.stringify(jsonNomina40lbs);
        localStorage.setItem('jsonNomina40lbs', str);
        return true;
    } catch (err) {
        return false;
    }
}

//======================================================================
// FUNCION PARA OBTENER EL JSON DE LA NOMINA DESDE EL LOCAL STORAGE
//======================================================================

function loadNomina() {
    try {
        const str = localStorage.getItem('jsonNomina40lbs');
        if (!str) return null;
        return JSON.parse(str);
    } catch (err) {
        return null;
    }
}

//====================================================================================
// FUNCION PARA RESTAURAR LA NOMINA DESDE EL LOCAL STORAGE CUANDO SE CARGA LA PAGINA
//====================================================================================

function restoreNomina() {
    try {
        const stored = loadNomina();
        if (!stored) return false;

        // Poner la variable global para que el resto del código la use
        jsonNomina40lbs = stored;

        cargarFiltroDepartamentos(); // Cargar el select
        llenarTablaNomina(); // Llenar la tabla con los empleados
        saveNomina(jsonNomina40lbs); // Guardar el JSON de la nómina en el local storage
        cambiarVistaNomina40lbs(); // Cambiar la vista para mostrar la tabla de nómina
        
        return true;
    } catch (err) {

        return false;
    }
}

//=========================================================================
// FUNCION PARA LIMPIAR LA NOMINA DEL LOCAL STORAGE Y DE LA VARIABLE GLOBAL
//=========================================================================

function clearNomina() {
    try {
        localStorage.removeItem('jsonNomina40lbs');
        // También limpiar la variable global para evitar que se vuelva a guardar en beforeunload
            jsonNomina40lbs = null;
        return true;
    } catch (err) {
        return false;
    }
}
