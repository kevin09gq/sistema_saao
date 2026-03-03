// Objeto para almacenar el empleado actual del modal
const objEmpleadoJornalero = {
    empleado: null,

    // Getter: obtener el empleado actual
    getEmpleado() {
        return this.empleado;
    },

    // Setter: establecer el empleado
    setEmpleado(emp) {
        this.empleado = emp;
    },

    // Limpiar: resetear el empleado
    limpiarEmpleado() {
        this.empleado = null;
    }
};

function establerDataModalJornalero(empleado) {
    // Guardar el empleado en el objeto
    objEmpleadoJornalero.setEmpleado(empleado);

    // Establecer la información básica del empleado en el modal
    establecerInformacionEmpleadoJornalero(empleado);

    // Establecer los registros del empleado en el modal
    establecerBiometricoJornalero(empleado);

    establecerDiasTrabajadosJornalero(empleado);

    // Mostrar eventos especiales
    mostrarEntradasTempranasJornalero(empleado);
    mostrarSalidasTardiasJornalero(empleado);
    mostrarSalidasTempranasJornalero(empleado);
    mostrarRetardosJornalero(empleado);
    mostrarInasistenciasJornalero(empleado);
    mostrarOlvidosChecadorJornalero(empleado);

    // Establecer percepciones del empleado en el modal
    establecerPercepcionesJornalero(empleado);

    // Establecer percepciones adicionales del empleado en el modal
    mostrarPercepcionesExtrasJornalero(empleado);


    // Establecer los conceptos del empleado en el modal
    establecerConceptosJornalero(empleado);

    // Mostrar modal usando Bootstrap
    const modalEl = document.getElementById('modal-jornaleros');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}


/************************************
 * ESTABLECER REGISTROS DEL EMPLEADO
 ************************************/
function establecerInformacionEmpleadoJornalero(empleado) {
    // Rellenar los campos del modal con los datos del empleado
    $('#campo-clave-jornaleros').text(empleado.clave || '');
    $('#campo-nombre-jornaleros').text(empleado.nombre || '');
    $('#nombre-jornalero-modal').text(empleado.nombre || '');

}

/************************************
 * ESTABLECER REGISTROS DEL BIOMETRICO
 ************************************/

function establecerBiometricoJornalero(empleado) {

    // Limpiar la tabla
    $('#tbody-biometrico-jornaleros').empty();

    // Si no hay empleado o registros, mostrar mensaje
    if (!empleado || !empleado.registros || empleado.registros.length === 0) {
        const filaVacia = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-inbox"></i> No hay registros biométricos
                </td>
            </tr>
        `;
        $('#tbody-biometrico-jornaleros').append(filaVacia);
        return;
    }

    // Array de nombres de días en español
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Iterar sobre los registros y agregar filas
    empleado.registros.forEach(registro => {
        // Calcular día de la semana a partir de la fecha (formato DD/MM/YYYY)
        const [dia, mes, anio] = registro.fecha.split('/');
        const fecha = new Date(anio, mes - 1, dia);
        const nombreDia = dias[fecha.getDay()];

        // Crear fila
        const fila = `
            <tr>
                <td>${nombreDia}</td>
                <td>${registro.fecha}</td>
                <td>${registro.entrada || '-'}</td>
                <td>${registro.salida || '-'}</td>
                <td><button class="btn btn-sm btn-outline-secondary">Editar</button></td>
            </tr>
        `;

        // Agregar fila a la tabla
        $('#tbody-biometrico-jornaleros').append(fila);
    });
}

/************************************
 * ESTABLECER DIAS TRABAJADOS DEL EMPLEADO
 ************************************/

function establecerDiasTrabajadosJornalero(empleado) {
    // Limpiar la tabla
    $('#tbody-dias-trabajados-jornaleros').empty();

    // Si no hay empleado o registros, mostrar mensaje
    if (!empleado || !empleado.registros || empleado.registros.length === 0) {
        const filaVacia = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="bi bi-calendar-x"></i> No hay días trabajados registrados
                </td>
            </tr>
        `;
        $('#tbody-dias-trabajados-jornaleros').append(filaVacia);
        return;
    }

    // Array de nombres de días en español
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Agrupar registros por fecha para manejar múltiples marcajes el mismo día
    const registrosPorFecha = {};
    let diasTrabajados = 0;

    empleado.registros.forEach(registro => {
        const fecha = registro.fecha;
        if (!registrosPorFecha[fecha]) {
            registrosPorFecha[fecha] = [];
        }
        registrosPorFecha[fecha].push(registro);
    });

    // Crear filas para días trabajados
    Object.keys(registrosPorFecha).forEach(fecha => {
        const registrosDelDia = registrosPorFecha[fecha];

        // Verificar si hay al menos una entrada válida ese día
        const tieneEntradaValida = registrosDelDia.some(registro =>
            registro.entrada && registro.entrada.trim() !== ""
        );

        if (tieneEntradaValida) {
            diasTrabajados++;
            // Calcular día de la semana a partir de la fecha (formato DD/MM/YYYY)
            const [dia, mes, anio] = fecha.split('/');
            const fechaObj = new Date(anio, mes - 1, dia);
            const nombreDia = dias[fechaObj.getDay()];

            // Obtener salario diario
            const salarioDiario = parseFloat(empleado.salario_diario) || 0;

            // Crear fila
            const fila = `
                <tr>
                    <td>${nombreDia}</td>
                    <td>${fecha}</td>
                    <td>$${salarioDiario.toFixed(2)}</td>
                </tr>
            `;

            // Agregar fila a la tabla
            $('#tbody-dias-trabajados-jornaleros').append(fila);
        }
    });

    // Si no hay días trabajados, mostrar mensaje
    if (diasTrabajados === 0) {
        const filaVacia = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="bi bi-calendar-x"></i> No hay días trabajados (sin entradas válidas)
                </td>
            </tr>
        `;
        $('#tbody-dias-trabajados-jornaleros').append(filaVacia);
    }
}


/************************************
 * ESTABLECER PERCEPCIONES DEL EMPLEADO
 ************************************/

// Función para establecer las percepciones del empleado en el modal
function establecerPercepcionesJornalero(empleado) {

    // Si no hay empleado, salir
    if (!empleado) return;

    // Establecer sueldo semanal
    $('#mod-sueldo-semanal-jornalero').val(empleado.salario_semanal || '');

    // Establecer pasaje
    $('#mod-pasaje-jornalero').val(empleado.pasaje || '');

    // Establecer tardeada
    $('#mod-tardeada-jornalero').val(empleado.tardeada || '');

    // Establecer sueldo extra total
     $('#mod-total-extra-jornalero').val(empleado.sueldo_extra_total || '');

}


/************************************
 * ESTABLECER CONCEPTOS DEL EMPLEADO
 ************************************/

function establecerConceptosJornalero(empleado) {

    // Si no hay empleado, salir
    if (!empleado) return;

    // Verificar si el empleado tiene seguro social
    const tieneSeguroSocial = empleado.seguroSocial !== false;

    desabilitarCamposConceptosJornalero(tieneSeguroSocial);
    const conceptos = empleado.conceptos || [];

    // Buscar conceptos por código
    const conceptoISR = conceptos.find(c => c.codigo === "45");
    const conceptoIMSS = conceptos.find(c => c.codigo === "52");
    const conceptoInfonavit = conceptos.find(c => c.codigo === "16");
    const conceptoAjusteSub = conceptos.find(c => c.codigo === "107");

    // Establecer valores en los campos de entrada
    $('#mod-isr-jornalero').val(conceptoISR ? conceptoISR.resultado || '' : '');
    $('#mod-imss-jornalero').val(conceptoIMSS ? conceptoIMSS.resultado || '' : '');
    $('#mod-infonavit-jornalero').val(conceptoInfonavit ? conceptoInfonavit.resultado || '' : '');
    $('#mod-ajustes-sub-jornalero').val(conceptoAjusteSub ? conceptoAjusteSub.resultado || '' : '');

    // Calcular total de conceptos
    calcularTotalConceptosJornalero();
}

// Función para calcular el total de conceptos y mostrarlo en el campo correspondiente
function calcularTotalConceptosJornalero() {
    const isr = parseFloat($('#mod-isr-jornalero').val()) || 0;
    const imss = parseFloat($('#mod-imss-jornalero').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-jornalero').val()) || 0;
    const ajusteSub = parseFloat($('#mod-ajustes-sub-jornalero').val()) || 0;

    const total = isr + imss + infonavit + ajusteSub;

    $('#mod-total-conceptos-jornalero').val(total.toFixed(2));
}

function desabilitarCamposConceptosJornalero(tieneSeguroSocial) {

    // Deshabilitar o habilitar campos de conceptos según seguroSocial
    if (!tieneSeguroSocial) {
        // Deshabilitar campos de entrada
        $('#mod-isr-jornalero').prop('disabled', true);
        $('#mod-imss-jornalero').prop('disabled', true);
        $('#mod-infonavit-jornalero').prop('disabled', true);
        $('#mod-ajustes-sub-jornalero').prop('disabled', true);

        // Deshabilitar botones de aplicar
        $('#btn-aplicar-isr-jornalero').prop('disabled', true);
        $('#btn-aplicar-imss-jornalero').prop('disabled', true);
        $('#btn-aplicar-infonavit-jornalero').prop('disabled', true);
        $('#btn-aplicar-ajuste-sub-jornalero').prop('disabled', true);

        // Deshabilitar total (aunque ya tiene readonly)
        $('#mod-total-conceptos-jornalero').prop('disabled', true);

        return; // Salir sin procesar conceptos
    }

    // Si tiene seguro social, habilitar los campos
    $('#mod-isr-jornalero').prop('disabled', false);
    $('#mod-imss-jornalero').prop('disabled', false);
    $('#mod-infonavit-jornalero').prop('disabled', false);
    $('#mod-ajustes-sub-jornalero').prop('disabled', false);

    $('#btn-aplicar-isr-jornalero').prop('disabled', false);
    $('#btn-aplicar-imss-jornalero').prop('disabled', false);
    $('#btn-aplicar-infonavit-jornalero').prop('disabled', false);
    $('#btn-aplicar-ajuste-sub-jornalero').prop('disabled', false);

    $('#mod-total-conceptos-jornalero').prop('disabled', false);
}
