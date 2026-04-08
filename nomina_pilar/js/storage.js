// Funciones simples y fáciles de entender para Local Storage
// Guardar automáticamente antes de recargar la página
// Solo guardar si jsonNominaPilar tiene datos válidos (evita re-grabar después de un clear)
window.addEventListener('beforeunload', function () {
    if (jsonNominaPilar && Array.isArray(jsonNominaPilar.departamentos) && jsonNominaPilar.departamentos.length > 0) {
        saveNomina(jsonNominaPilar);
    }
});


function saveNomina(jsonNominaPilar) {
    try {
        const str = JSON.stringify(jsonNominaPilar);
        localStorage.setItem('jsonNominaPilar', str);
        return true;
    } catch (err) {
        return false;
    }
}

function loadNomina() {
    try {
        const str = localStorage.getItem('jsonNominaPilar');
        if (!str) return null;
        return JSON.parse(str);
    } catch (err) {
        return null;
    }
}

function clearNomina() {
    try {
        localStorage.removeItem('jsonNominaPilar');
        window.jsonNominaPilar = null;

        // Limpiar tabla, formulario y ocultar contenedor
        $('#tabla-nomina-body-pilar').empty();
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
        jsonNominaPilar = stored;

        if (typeof initComponents === 'function') {
            initComponents();
        }

        // Renderizar tabla restaurada
        if (typeof mostrarDatosTabla === 'function') {
            let id_departamento = parseInt($('#filtro_departamento').val());

            // Si el select aún no tiene valor válido, usar el primer departamento del JSON
            if (!id_departamento && jsonNominaPilar.departamentos && jsonNominaPilar.departamentos.length > 0) {
                id_departamento = jsonNominaPilar.departamentos[0].id_departamento;
            }

            let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaPilar, id_departamento);
            mostrarDatosTabla(jsonFiltrado, 1);
        }

        actualizarCabeceraNomina(jsonNominaPilar);

        return true;
    } catch (err) {

        return false;
    }
}


