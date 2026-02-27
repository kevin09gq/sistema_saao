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

    // Establecer los conceptos del empleado en el modal
    establecerConceptos(empleado);
    
    // Mostrar modal usando Bootstrap
    const modalEl = document.getElementById('modal-jornaleros');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function establecerInformacionEmpleadoJornalero(empleado) {
    // Rellenar los campos del modal con los datos del empleado
    $('#campo-clave-jornaleros').text(empleado.clave || '');
    $('#campo-nombre-jornaleros').text(empleado.nombre || '');
    $('#nombre-jornalero-modal').text(empleado.nombre || '');

}


/************************************
 * ESTABLECER CONCEPTOS DEL EMPLEADO
 ************************************/

function establecerConceptos(empleado) {

    // Si no hay empleado, salir
    if (!empleado) return;

    // Verificar si el empleado tiene seguro social
    const tieneSeguroSocial = empleado.seguroSocial !== false;

    desabilitarCamposConceptos(tieneSeguroSocial);
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
    calcularTotalConceptos();
}

// Función para calcular el total de conceptos y mostrarlo en el campo correspondiente
function calcularTotalConceptos() {
    const isr = parseFloat($('#mod-isr-jornalero').val()) || 0;
    const imss = parseFloat($('#mod-imss-jornalero').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-jornalero').val()) || 0;
    const ajusteSub = parseFloat($('#mod-ajustes-sub-jornalero').val()) || 0;

    const total = isr + imss + infonavit + ajusteSub;

    $('#mod-total-conceptos-jornalero').val(total.toFixed(2));
}


function desabilitarCamposConceptos(tieneSeguroSocial) {

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
