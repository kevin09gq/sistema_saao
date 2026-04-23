// Funciones simples y fáciles de entender para Local Storage
// Guardar automáticamente antes de recargar la página
// Solo guardar si jsonNominaHuasteca tiene datos válidos (evita re-grabar después de un clear)
window.addEventListener('beforeunload', function () {
    if (jsonNominaHuasteca && Array.isArray(jsonNominaHuasteca.departamentos) && jsonNominaHuasteca.departamentos.length > 0) {
        saveNomina(jsonNominaHuasteca);
    }
});

//=======================================
// GUARDA LA NOMINA EN LOCAL STORAGE
//=======================================

function saveNomina(jsonNominaHuasteca) {
    try {
        const str = JSON.stringify(jsonNominaHuasteca);
        localStorage.setItem('jsonNominaHuasteca', str);
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
        const str = localStorage.getItem('jsonNominaHuasteca');
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
        localStorage.removeItem('jsonNominaHuasteca');
        window.jsonNominaHuasteca = null;

        // Marcar que se limpió intencionalmente para que restoreNomina no restaure
        sessionStorage.setItem('nominaLimpiada', '1');

        // Limpiar tabla, formulario y ocultar contenedor
        $('#tabla-nomina-body-huasteca').empty();
        $('#form_excel_raya')[0].reset();
        $('#tabla-nomina-responsive').prop('hidden', true);

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
        const wasCleared = sessionStorage.getItem('nominaLimpiada') === '1';
        const stored = loadNomina();

        if (wasCleared && !stored) {
            console.info('[restoreNomina] Bloqueado por nominaLimpiada y sin datos guardados.');
            sessionStorage.removeItem('nominaLimpiada');
            return false;
        }

        if (!stored) {
            console.info('[restoreNomina] Sin datos en localStorage.');
            return false;
        }

        if (wasCleared) {
            console.info('[restoreNomina] nominaLimpiada activo, pero hay datos guardados. Se restaura.');
            sessionStorage.removeItem('nominaLimpiada');
        }

        // Poner la variable global para que el resto del código la use
        jsonNominaHuasteca = stored;

        if (typeof initComponents === 'function') {
            initComponents();
        } else {
            console.warn('[restoreNomina] initComponents no disponible.');
        }

        // Renderizar tabla restaurada
        if (typeof mostrarDatosTabla === 'function') {
            let id_departamento = parseInt($('#filtro_departamento').val());

            // Si el select aún no tiene valor válido, usar el primer departamento del JSON
            if (!id_departamento && jsonNominaHuasteca.departamentos && jsonNominaHuasteca.departamentos.length > 0) {
                id_departamento = jsonNominaHuasteca.departamentos[0].id_departamento;
            }

            // Lógica para ocultar columnas (Modo Confianza)
            const depaObjeto = jsonNominaHuasteca.departamentos.find(d => 
                d.empleados && d.empleados.some(e => e.id_departamento == id_departamento)
            );
            
            if (depaObjeto) {
                const primerEmpleado = depaObjeto.empleados.find(e => e.id_departamento == id_departamento);
                if (primerEmpleado && parseInt(primerEmpleado.tipo_horario) === 1) {
                    $('#tabla-nomina-container-huasteca').addClass('modo-confianza');
                } else {
                    $('#tabla-nomina-container-huasteca').removeClass('modo-confianza');
                }
            }

            let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaHuasteca, id_departamento);
            mostrarDatosTabla(jsonFiltrado, 1);
        }

        if (typeof actualizarCabeceraNomina === 'function') {
            actualizarCabeceraNomina(jsonNominaHuasteca);
        } else {
            console.warn('[restoreNomina] actualizarCabeceraNomina no disponible.');
        }

        return true;
    } catch (err) {
        console.error('[restoreNomina] Error al restaurar:', err);
        return false;
    }
}


