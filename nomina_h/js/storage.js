//======================================================================
// FUNCION PARA GUARDAR LA NOMINA CUANDO SE RECARGA LA PAGINA 
//======================================================================

window.addEventListener('beforeunload', function () {
    if (typeof jsonNominaHuasteca !== 'undefined') {
        saveNomina(jsonNominaHuasteca);
    }
});

//======================================================================
//FUNCION PARA GUARDAR EL JSON DE LA NOMINA EN EL LOCAL STORAGE
//======================================================================

function saveNomina(jsonNominaHuasteca) {
    try {
        const str = JSON.stringify(jsonNominaHuasteca);
        localStorage.setItem('jsonNominaH', str);
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
        const str = localStorage.getItem('jsonNominaH');
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
        jsonNominaHuasteca = stored;

        cargarFiltroDepartamentos(); // Cargar el select
        llenarTablaNomina(); // Llenar la tabla con los empleados
        saveNomina(jsonNominaHuasteca); // Guardar el JSON de la nómina en el local storage
        cambiarVistaTablaNomina(); // Cambiar la vista para mostrar la tabla de nómina
        actualizarCabeceraNomina(jsonNominaHuasteca); // Actualizar la cabecera de la nómina
        
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
        localStorage.removeItem('jsonNominaH');
        // También limpiar la variable global para evitar que se vuelva a guardar en beforeunload
            jsonNominaHuasteca = null;
        return true;
    } catch (err) {
        return false;
    }
}
