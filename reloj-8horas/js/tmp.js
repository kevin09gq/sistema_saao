/**
 * Función para obtener el número de la semana del año
 * Basado en ISO 8601, donde la semana 1 es la que contiene el primer jueves del año
 */
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

/**
 * Función para formatear una fecha en formato 'DD DE MES AÑO' en mayúsculas
 */
function formatDateToSpanish(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = date.toLocaleDateString('es-ES', options).toUpperCase();
    // Asegurarse de que el mes esté en mayúsculas (algunos navegadores no lo hacen)
    return dateStr;
}

/**
 * Función para obtener el rango de fechas de la próxima semana
 * Devuelve un objeto con las fechas de inicio y fin de la próxima semana
 */
function getNextWeekRange() {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (domingo) a 6 (sábado)
    const daysUntilNextMonday = currentDay === 0 ? 1 : 8 - currentDay;
    
    // Fecha del próximo lunes
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilNextMonday);
    
    // Fecha del próximo domingo
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    
    return {
        start: nextMonday,
        end: nextSunday,
        weekNumber: getWeekNumber(nextMonday)
    };
}

function formatDateFromDDMMMYYYY(dateStr) {
    // Convertir de formato "29/Nov/2025" a "29 DE NOVIEMBRE 2025"
    const [day, month, year] = dateStr.split('/');
    const monthNames = {
        'Ene': 'ENERO', 'Feb': 'FEBRERO', 'Mar': 'MARZO', 'Abr': 'ABRIL',
        'May': 'MAYO', 'Jun': 'JUNIO', 'Jul': 'JULIO', 'Ago': 'AGOSTO',
        'Sep': 'SEPTIEMBRE', 'Oct': 'OCTUBRE', 'Nov': 'NOVIEMBRE', 'Dic': 'DICIEMBRE'
    };
    return `${day} DE ${monthNames[month]} ${year}`;
}

/**
 * Carga los departamentos en el select correspondiente
 */
function cargarDepartamentos() {

    try {
        const datos = sessionStorage.getItem('reloj-ocho');
        if (!datos) return;

        const datosGuardados = JSON.parse(datos);
        if (!datosGuardados.departamentos || !Array.isArray(datosGuardados.departamentos)) return;

        const select = document.getElementById('departamentos-reloj');
        if (!select) return;

        // Limpiar opciones existentes
        select.innerHTML = '';

        // Agregar opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Todos los departamentos';
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        // Agregar cada departamento como una opción
        datosGuardados.departamentos.forEach((depto, index) => {
            const option = document.createElement('option');
            option.value = index; // Usar el índice como valor
            option.textContent = depto.nombre; // Mostrar el nombre del departamento
            select.appendChild(option);
        });

        console.log("Hola departamentos");

        // Agregar event listener para filtrar la tabla cuando se seleccione un departamento
        select.addEventListener('change', function() {
            // Aquí irá la lógica para filtrar la tabla cuando esté implementada
            console.log('Departamento seleccionado:', this.value);
        });
    } catch (e) {
        console.error('Error al cargar departamentos:', e);
    }
}

/**
 * Función para actualizar la interfaz con la información de la semana
 */
function actualizarInterfaz() {
    // Obtener los datos guardados en sessionStorage
    let datosGuardados = null;
    try {
        const datos = sessionStorage.getItem('reloj-ocho');
        if (datos) {
            datosGuardados = JSON.parse(datos);
        }
    } catch (e) {
        console.error('Error al leer de sessionStorage:', e);
    }
    
    // Usar las fechas de sessionStorage si están disponibles
    let tituloTexto = '';
    if (datosGuardados && datosGuardados.fecha_inicio && datosGuardados.fecha_cierre) {
        const inicio = formatDateFromDDMMMYYYY(datosGuardados.fecha_inicio);
        const cierre = formatDateFromDDMMMYYYY(datosGuardados.fecha_cierre);
        tituloTexto = `CHEQUEOS DEL ${inicio} AL ${cierre}`;
    } else {
        // Si no hay fechas en sessionStorage, calcularlas
        const weekRange = getNextWeekRange();
        const startStr = formatDateToSpanish(weekRange.start);
        const endStr = formatDateToSpanish(weekRange.end);
        tituloTexto = `CHEQUEOS DEL ${startStr} AL ${endStr}`;
    }
    
    // Actualizar el título
    const tituloElement = document.getElementById('titulo_reloj');
    if (tituloElement) {
        tituloElement.textContent = tituloTexto;
    }
    
    // Actualizar el número de semana
    const semanaElement = document.getElementById('num_semana');
    if (semanaElement) {
        const numeroSemana = (datosGuardados && datosGuardados.numero_semana) || 
                           (() => {
                               const weekRange = getNextWeekRange();
                               return weekRange.weekNumber;
                           })();
        semanaElement.textContent = `Semana ${numeroSemana}`;
    }
    
    // Cargar los departamentos en el select
    cargarDepartamentos();
}

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página correcta antes de ejecutar
    if (document.getElementById('titulo_reloj') && document.getElementById('num_semana')) {
        actualizarInterfaz();
    }
});