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

function establerDataModal(empleado) {
    // Guardar el empleado en el objeto
    objEmpleado.setEmpleado(empleado);

    // Establecer información del empleado
    establecerInformacionEmpleado(empleado);

    // Establecer Biometrico del empleado
    establecerBiometrico(empleado);

    // Establecer Biometrico Redondeado del empleado
    establecerBiomtricoRedondeado(empleado);

    // Establecer percepciones del empleado
    establecerPercepciones(empleado);

    mostrarEntradasTempranas(empleado);
    mostrarSalidasTardias(empleado);
    mostrarSalidasTempranas(empleado);
    mostrarRetardos(empleado);
    mostrarInasistencias(empleado);
    mostrarOlvidosChecador(empleado);

    // Mostrar modal usando Bootstrap
    const modalEl = document.getElementById('modal-40lbs');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/************************************
 * ESTABLECER INFORMACIÓN DEL EMPLEADO
 ************************************/

function establecerInformacionEmpleado(empleado) {
    // Rellenar los campos del modal con los datos del empleado
    $('#campo-clave-40lbs').text(empleado.clave || '');
    $('#campo-nombre-40lbs').text(empleado.nombre || '');
    $('#nombre-empleado-modal').text(empleado.nombre || '');
}

/************************************
 * ESTABLECER BIOMETRICO DEL EMPLEADO
 ************************************/
function establecerBiometrico(empleado) {

    // Si no hay empleado, salir
    if (!empleado || !empleado.registros) return;

    // Array de nombres de días en español
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Limpiar la tabla
    $('#tbody-biometrico-40lbs').empty();

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
        $('#tbody-biometrico-40lbs').append(fila);
    });
}

/************************************
 * ESTABLECER BIOMÉTRICO REDONDEADO DEL EMPLEADO
 ************************************/
function establecerBiomtricoRedondeado(empleado) {
    // Si no hay empleado o no tiene biometrico_redondeado, salir
    if (!empleado || !empleado.biometrico_redondeado || !Array.isArray(empleado.biometrico_redondeado)) {
        return;
    }

    // Limpiar la tabla
    $('#tbody-biometrico-redondeado-40lbs').empty();

    // Iterar sobre los registros de biometrico redondeado
    empleado.biometrico_redondeado.forEach(registro => {
        // Capitalizar el nombre del día (viernes -> Viernes)
        const nombreDia = registro.dia.charAt(0).toUpperCase() + registro.dia.slice(1);

        // Crear fila con los datos
        const fila = `
            <tr>
                <td class="text-center">${nombreDia}</td>
                <td class="text-center">${registro.entrada || '-'}</td>
                <td class="text-center">${registro.termino_comida || '-'}</td>
                <td class="text-center">${registro.entrada_comida || '-'}</td>
                <td class="text-center">${registro.salida || '-'}</td>
                <td class="text-center">${registro.horas_comida || '-'}</td>
                <td class="text-center">${registro.minutos_trabajados || '-'}</td>
                <td class="text-center">${registro.horas_trabajadas || '-'}</td>
                <td class="text-center"><button class="btn btn-sm btn-outline-secondary">Editar</button></td>
            </tr>
        `;

        // Agregar fila a la tabla
        $('#tbody-biometrico-redondeado-40lbs').append(fila);
    });
}


/************************************
 * ESTABLECER PERCEPCIONES DEL EMPLEADO
 ************************************/
function establecerPercepciones(empleado) {
    // Establecer sueldo neto
    $("#mod-sueldo-neto-40lbs").val(empleado.sueldo_neto || '');

    // Establecer incentivo 
    $("#mod-incentivo-40lbs").val(empleado.incentivo || '');

    // Establecer Horas extras
    $("#mod-horas-extras-40lbs").val(empleado.horas_extra || '');

    // Establecer Bono de Antiguedad
    $("#mod-bono-antiguedad-40lbs").val(empleado.bono_antiguedad || '');

    // Establecer actividades especiales
    $("#mod-actividades-especiales-40lbs").val(empleado.actividades_especiales || '');

    // Establecer puesto
    $("#mod-puesto-40lbs").val(empleado.puesto || '');

    // Establecer total extras
    $("#mod-sueldo-extra-total-40lbs").val(empleado.sueldo_extra_total || '');

}