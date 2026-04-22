// ================================================
// FUNCIONES DE ALMACENAMIENTO EN LOCALSTORAGE
// ================================================
// Guardar automáticamente antes de recargar la página
window.addEventListener('beforeunload', function () {
    if (jsonAguinaldo && Array.isArray(jsonAguinaldo) && jsonAguinaldo.length > 0) {
        saveAguinaldo(jsonAguinaldo);
    }
});


/**
 * Guardar jsonAguinaldo en localStorage
 * @param {Array} jsonAguinaldo - Array de empleados con datos de aguinaldo
 * @returns {Boolean} true si se guardó correctamente, false en caso de error
 */
function saveAguinaldo(jsonAguinaldo) {
    try {
        const str = JSON.stringify(jsonAguinaldo);
        localStorage.setItem('jsonAguinaldo', str);
        return true;
    } catch (err) {
        console.error('Error al guardar en localStorage:', err);
        return false;
    }
}


/**
 * Cargar jsonAguinaldo desde localStorage
 * @returns {Array|null} Array de empleados o null si no existe
 */
function loadAguinaldo() {
    try {
        const str = localStorage.getItem('jsonAguinaldo');
        if (!str) return null;
        return JSON.parse(str);
    } catch (err) {
        console.error('Error al cargar desde localStorage:', err);
        return null;
    }
}


/**
 * Limpiar localStorage y la variable global
 * @returns {Boolean} true si se limpió correctamente
 */
function clearAguinaldo() {
    try {
        localStorage.removeItem('jsonAguinaldo');
        window.jsonAguinaldo = null;

        // Limpiar tabla
        $('#cuerpo-tabla-aguinaldo').html(
            '<tr><td colspan="6" class="text-center text-muted">Cargando información...</td></tr>'
        );
        $('#paginacion').empty();

        return true;
    } catch (err) {
        console.error('Error al limpiar localStorage:', err);
        return false;
    }
}


/**
 * Restaurar jsonAguinaldo desde localStorage y renderizar
 * @returns {Boolean} true si se restauró, false si no hay datos
 */
function restoreAguinaldo() {
    try {
        const stored = loadAguinaldo();
        if (!stored) return false;

        // Asignar a la variable global
        jsonAguinaldo = stored;

        // Verificar y recalcular si faltan datos (para datos viejos en localStorage)
        if (typeof diasTrabajados === 'function' && typeof calcularAguinaldo === 'function') {
            jsonAguinaldo.slice(1).forEach(empleado => {
                // Si falta dias_trabajados, recalcularlo (null o undefined, pero no 0)
                if (empleado.dias_trabajados === null || empleado.dias_trabajados === undefined) {
                    empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_real);
                }
                // Si falta aguinaldo, recalcularlo (null o undefined, pero no -1 o 0)
                if (empleado.aguinaldo === null || empleado.aguinaldo === undefined) {
                    empleado.aguinaldo = calcularAguinaldo(empleado.dias_trabajados, empleado.sueldo_diario);
                }
            });
        }

        // Renderizar tabla si la función existe
        if (typeof llenar_tabla === 'function') {
            llenar_tabla();
        }

        return true;
    } catch (err) {
        console.error('Error al restaurar desde localStorage:', err);
        return false;
    }
}