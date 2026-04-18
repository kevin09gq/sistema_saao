// Funciones simples y fáciles de entender para Local Storage
// Guardar automáticamente antes de recargar la página
// Solo guardar si jsonNominaRelicario tiene datos válidos (evita re-grabar después de un clear)
window.addEventListener('beforeunload', function () {
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
            let id_departamento = parseInt($('#filtro_departamento').val());

            // Si el select aún no tiene valor válido, usar el primer departamento del JSON
            if (!id_departamento && jsonNominaRelicario.departamentos && jsonNominaRelicario.departamentos.length > 0) {
                id_departamento = jsonNominaRelicario.departamentos[0].id_departamento;
            }

            // Lógica para ocultar columnas (Modo Confianza)
            const depaObjeto = jsonNominaRelicario.departamentos.find(d => 
                d.empleados && d.empleados.some(e => e.id_departamento == id_departamento)
            );
            
            if (depaObjeto) {
                const primerEmpleado = depaObjeto.empleados.find(e => e.id_departamento == id_departamento);
                if (primerEmpleado && parseInt(primerEmpleado.tipo_horario) === 1) {
                    $('#tabla-nomina-container-relicario').addClass('modo-confianza');
                } else {
                    $('#tabla-nomina-container-relicario').removeClass('modo-confianza');
                }
            }

            let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, id_departamento);
            mostrarDatosTabla(jsonFiltrado, 1);
        }

        actualizarCabeceraNomina(jsonNominaRelicario);

        return true;
    } catch (err) {

        return false;
    }
}


