function buscarDatos(claveEmpleado) {
    // Busca el empleado en jsonGlobal usando la clave
    if (!window.jsonGlobal || !window.jsonGlobal.departamentos) return null;

    let empleadoEncontrado = null;

    // Recorre todos los departamentos y empleados
    window.jsonGlobal.departamentos.forEach(depto => {
        (depto.empleados || []).forEach(emp => {
            // Compara la clave como string o número
            if (String(emp.clave) === String(claveEmpleado)) {
                empleadoEncontrado = emp;
            }
        });
    });

    if (!empleadoEncontrado) return null;

    // Guarda los conceptos y registros en arreglos
    const conceptos = empleadoEncontrado.conceptos || [];
    const registros = empleadoEncontrado.registros || [];

    // Guarda los datos principales en un objeto
    const datosPrincipales = {
        clave: empleadoEncontrado.clave,
        nombre: empleadoEncontrado.nombre,
        neto_pagar: empleadoEncontrado.neto_pagar,
        horas_totales: empleadoEncontrado.horas_totales,
        tiempo_total: empleadoEncontrado.tiempo_total
    };

    // Muestra en consola para que lo veas fácil
    console.log('Datos principales:', datosPrincipales);
    console.log('Conceptos:', conceptos);
    console.log('Registros:', registros);
    establecerDatosModal(datosPrincipales.nombre, datosPrincipales.clave, datosPrincipales.neto_pagar, 
        datosPrincipales.horas_totales, datosPrincipales.tiempo_total, conceptos, registros);
    return empleadoEncontrado;


}


function establecerDatosModal(nombre, clave, neto_pagar, horas_totales, tiempo_total, conceptos, registros) {

    //Muestra los datos en el modal "Trabajador"
    $('#campo-nombre').html('<strong>Nombre:</strong> ' + nombre);
    $('#campo-clave').html('<strong>Clave:</strong> ' + clave);
    $('#campo-neto-pagar').html('<strong>Neto a pagar:</strong> $' + neto_pagar);
    $('#campo-horas-totales').html('<strong>Horas totales:</strong> ' + horas_totales);
    $('#campo-tiempo-total').html('<strong>Tiempo total:</strong> ' + tiempo_total);


     //Muestra los datos en el modal "Concpetos"
    // Limpia el contenedor de conceptos antes de agregar nuevos
    $('#conceptos-cards').empty();

    // Recorre el arreglo de conceptos y crea las tarjetas
    conceptos.forEach(concepto => {
        // Crea el HTML para cada concepto
        const conceptoCard = `
            <div class="concepto-card">
                <div class="concepto-codigo">${concepto.codigo}</div>
                <div class="concepto-nombre">${concepto.nombre}</div>
                <input class="concepto-resultado" type="text" value="${concepto.resultado}">
            </div>
        `;
        // Agrega la tarjeta al contenedor
        $('#conceptos-cards').append(conceptoCard);
    });

     //Muestra los datos en el modal "Registros"
    // Limpia el contenedor de registros antes de agregar nuevos
    $('#registros-cards').empty();
    // Recorre el arreglo de registros y crea las tarjetas
    registros.forEach(registro => {
        // Crea el HTML para cada registro
        const registroCard = `
            <li>
                <div class="registro-fecha">${registro.fecha}</div>
                <div class="registro-datos">
                    <div class="registro-row">
                        <label class="registro-label">Entrada:</label>
                        <input class="registro-input" type="text" value="${registro.entrada}">
                        <label class="registro-label">Salida:</label>
                        <input class="registro-input" type="text" value="${registro.salida}">
                    </div>
                    <div class="registro-row">
                        <label class="registro-label">Trabajado:</label>
                        <input class="registro-input" type="text" value="${registro.trabajado}">
                        <label class="registro-label">comida:</label>
                        <input class="registro-input" type="text" value="">
                    </div>
                </div>
            </li>
    `;
        // Agrega la tarjeta al contenedor
        $('#registros-cards').append(registroCard);
    });
}


