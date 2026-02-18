// Objeto para almacenar el empleado actual del modal
const objEmpleado = {
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

function establerDataModalCoordinador(empleado) {
    // Guardar el empleado en el objeto
    objEmpleado.setEmpleado(empleado);

    // Rellenar los campos del modal con los datos del empleado
    $('#campo-clave-coordinadores').text(empleado.clave || '');
    $('#campo-nombre-coordinadores').text(empleado.nombre || '');
    $('#campo-departamento-coordinadores').text(empleado.departamento || '');
    $('#campo-puesto-coordinadores').text(empleado.id_puestoEspecial || empleado.puesto || '');
    $('#nombre-empleado-modal').text(empleado.nombre || '');

    // Establecer datos biométricos en la tabla
    establecerBiometrico();

    // Establecer datos de horarios oficiales en la tabla
    establecerHorariosOficiales();

    // Establecer datos de percepciones
    establecerPercepciones();

    // Establecer datos de conceptos
    establecerConceptos();

    // Mostrar modal usando Bootstrap
    const modalEl = document.getElementById('modal-coordinadores');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/************************************
 * ESTABLECER REGISTROS DEL BIOMETRICO
 ************************************/

function establecerBiometrico() {
    const empleado = objEmpleado.getEmpleado();

    // Si no hay empleado, salir
    if (!empleado || !empleado.registros) return;

    // Array de nombres de días en español
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Limpiar la tabla
    $('#tbody-biometrico-coordinadores').empty();

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
        $('#tbody-biometrico-coordinadores').append(fila);
    });
}

/************************************
 * ESTABLECER LOS HORARIOS OFICIALES    
 ************************************/

function establecerHorariosOficiales() {
    const empleado = objEmpleado.getEmpleado();

    // Si no hay empleado, salir
    if (!empleado) return;

    // Array de días por defecto
    const diasPorDefecto = [
        { dia: 'LUNES', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'MARTES', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'MIERCOLES', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'JUEVES', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'VIERNES', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'SABADO', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'DOMINGO', entrada: '-', salida_comida: '-', entrada_comida: '', salida: '-' }
    ];

    // Obtener horarios: usar los del empleado o los por defecto
    const horarios = (empleado.horario_oficial && Array.isArray(empleado.horario_oficial) && empleado.horario_oficial.length > 0)
        ? empleado.horario_oficial
        : diasPorDefecto;

    // Limpiar la tabla
    $('#tbody-horarios-oficiales-coordinadores').empty();

    // Iterar sobre los horarios y agregar filas
    horarios.forEach(horario => {
        const fila = `
            <tr>
                <td>${horario.dia || '-'}</td>
                <td>${horario.entrada || '-'}</td>
                <td>${horario.salida_comida || '-'}</td>
                <td>${horario.entrada_comida || '-'}</td>
                <td>${horario.salida || '-'}</td>
            </tr> 
        `;

        // Agregar fila a la tabla
        $('#tbody-horarios-oficiales-coordinadores').append(fila);
    });
}

/************************************
 * ESTABLECER PERCEPCIONES DEL EMPLEADO
 ************************************/

// Función para establecer las percepciones del empleado en el modal
function establecerPercepciones() {
    const empleado = objEmpleado.getEmpleado();

    // Si no hay empleado, salir
    if (!empleado) return;

    // Establecer sueldo semanal
    $('#mod-sueldo-semanal-coordinador').val(empleado.salario_semanal || '');
    // Establecer sueldo extra total
    $('#mod-total-extra-coordinador').val(empleado.sueldo_extra_total || '');
    mostrarPercepcionesExtras(empleado);
  
}


/************************************
 * ESTABLECER CONCEPTOS DEL EMPLEADO
 ************************************/

// Función para establecer los conceptos del empleado en el modal
function establecerConceptos() {
    const empleado = objEmpleado.getEmpleado();

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
    $('#mod-isr-coordinador').val(conceptoISR ? conceptoISR.resultado || '' : '');
    $('#mod-imss-coordinador').val(conceptoIMSS ? conceptoIMSS.resultado || '' : '');
    $('#mod-infonavit-coordinador').val(conceptoInfonavit ? conceptoInfonavit.resultado || '' : '');
    $('#mod-ajustes-sub-coordinador').val(conceptoAjusteSub ? conceptoAjusteSub.resultado || '' : '');
    
    // Calcular total de conceptos
    calcularTotalConceptos();
}

// Función para calcular el total de conceptos y mostrarlo en el campo correspondiente
function calcularTotalConceptos() {
    const isr = parseFloat($('#mod-isr-coordinador').val()) || 0;
    const imss = parseFloat($('#mod-imss-coordinador').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-coordinador').val()) || 0;
    const ajusteSub = parseFloat($('#mod-ajustes-sub-coordinador').val()) || 0;
    
    const total = isr + imss + infonavit + ajusteSub;
    
    $('#mod-total-conceptos-coordinador').val(total.toFixed(2));
}

function desabilitarCamposConceptos(tieneSeguroSocial) {
        
    // Deshabilitar o habilitar campos de conceptos según seguroSocial
    if (!tieneSeguroSocial) {
        // Deshabilitar campos de entrada
        $('#mod-isr-coordinador').prop('disabled', true);
        $('#mod-imss-coordinador').prop('disabled', true);
        $('#mod-infonavit-coordinador').prop('disabled', true);
        $('#mod-ajustes-sub-coordinador').prop('disabled', true);
        
        // Deshabilitar botones de aplicar
        $('#btn-aplicar-isr-coordinador').prop('disabled', true);
        $('#btn-aplicar-imss-coordinador').prop('disabled', true);
        $('#btn-aplicar-infonavit-coordinador').prop('disabled', true);
        $('#btn-aplicar-ajuste-sub-coordinador').prop('disabled', true);
        
        // Deshabilitar total (aunque ya tiene readonly)
        $('#mod-total-conceptos-coordinador').prop('disabled', true);
        
        
        
        return; // Salir sin procesar conceptos
    }
    
    // Si tiene seguro social, habilitar los campos
    $('#mod-isr-coordinador').prop('disabled', false);
    $('#mod-imss-coordinador').prop('disabled', false);
    $('#mod-infonavit-coordinador').prop('disabled', false);
    $('#mod-ajustes-sub-coordinador').prop('disabled', false);
    
    $('#btn-aplicar-isr-coordinador').prop('disabled', false);
    $('#btn-aplicar-imss-coordinador').prop('disabled', false);
    $('#btn-aplicar-infonavit-coordinador').prop('disabled', false);
    $('#btn-aplicar-ajuste-sub-coordinador').prop('disabled', false);
    
    $('#mod-total-conceptos-coordinador').prop('disabled', false);
}

