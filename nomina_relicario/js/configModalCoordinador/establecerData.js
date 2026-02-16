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
    
    // Mostrar modal usando Bootstrap
    const modalEl = document.getElementById('modal-coordinadores');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function establecerBiometrico(){
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

function establecerHorariosOficiales(){ 
    const empleado = objEmpleado.getEmpleado();
    
    // Si no hay empleado, salir
    if (!empleado) return;
    
    // Array de días por defecto
    const diasPorDefecto = [
        { dia: 'LUNES',     entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'MARTES',    entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'MIERCOLES', entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'JUEVES',    entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'VIERNES',   entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'SABADO',    entrada: '-', salida_comida: '-', entrada_comida: '-', salida: '-' },
        { dia: 'DOMINGO',   entrada: '-', salida_comida: '-', entrada_comida: '', salida: '-' }
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

