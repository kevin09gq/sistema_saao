//======================================================================
// FUNCION PARA GUARDAR LA NOMINA CUANDO SE RECARGA LA PAGINA 
//======================================================================

window.addEventListener('beforeunload', function () {
    if (typeof jsonNominaPilar !== 'undefined') {
        saveNomina(jsonNominaPilar);
    }
});

//======================================================================
//FUNCION PARA GUARDAR EL JSON DE LA NOMINA EN EL LOCAL STORAGE
//======================================================================

function saveNomina(jsonNominaPilar) {
    try {
        const str = JSON.stringify(jsonNominaPilar);
        localStorage.setItem('jsonNominaPilar', str);
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
        const str = localStorage.getItem('jsonNominaPilar');
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
        jsonNominaPilar = stored;

        cargarFiltroDepartamentos(); // Cargar el select
        llenarTablaNomina(); // Llenar la tabla con los empleados
        saveNomina(jsonNominaPilar); // Guardar el JSON de la nómina en el local storage
        cambiarVistaTablaNomina(); // Cambiar la vista para mostrar la tabla de nómina
        actualizarCabeceraNomina(jsonNominaPilar); // Actualizar la cabecera de la nómina
        
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
        localStorage.removeItem('jsonNominaPilar');
        // También limpiar la variable global para evitar que se vuelva a guardar en beforeunload
            jsonNominaPilar = null;
        return true;
    } catch (err) {
        return false;
    }
}
