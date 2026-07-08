//  VARIABLES PARA LA PAGINACIÓN

// Cantidad de empleados que se mostrarán por página
const registrosPorPagina = 7;

// Página actual que se está visualizando
let paginaActual = 1;


// FUNCIÓN PARA LLENAR LA TABLA DE LA NÓMINA
// MUESTRA UNICAMENTE LOS EMPLEADOS DE LA PÁGINA ACTUAL EN LA TABLA

function llenarTablaNomina() {
    // Limpiar el contenido actual de la tabla
    $('#tabla-nomina-body-40lbs').empty();

    // Obtener el departamento seleccionado
    let filtro = $('#filtro-departamento').val();

    // Obtener el texto escrito en el buscador
    let textoBusqueda = $('#busqueda-nomina-40lbs').val().trim().toUpperCase();

    let datos = filtro.split("-");

    let idDepartamento = Number(datos[0]);
    let tipoEmpleado = datos[1];


    // Calcular el primer y último registro que se mostrarán en la página
    let inicio = (paginaActual - 1) * registrosPorPagina;
    let fin = paginaActual * registrosPorPagina;

    // Contador general de empleados recorridos
    let contador = 0;

    // Número consecutivo que aparecerá en la columna "#"
    let numeroFila = inicio + 1;

    // Recorrer todos los departamentos
    jsonNomina40lbs.departamentos.forEach(departamento => {

        if (departamento.id_departamento != idDepartamento) {
            return;
        }

        // Recorrer todos los empleados del departamento
        departamento.empleados.forEach(empleado => {

            // Si se seleccionó CSS solo mostrar empleados con seguro social
            if (tipoEmpleado == "CSS" && !empleado.seguroSocial) {
                return;
            }

            // Si se seleccionó SSS solo mostrar empleados sin seguro social
            if (tipoEmpleado == "SSS" && empleado.seguroSocial) {
                return;
            }

            // Si existe un texto de búsqueda, buscar por nombre o clave
            if (textoBusqueda != "") {

                let nombreEmpleado = empleado.nombre.toUpperCase();
                let claveEmpleado = empleado.clave.toUpperCase();

                // Si no coincide el nombre ni la clave, pasar al siguiente empleado
                if (!nombreEmpleado.includes(textoBusqueda) &&
                    !claveEmpleado.includes(textoBusqueda)) {
                    return;
                }

            }


            // Verificar si el empleado pertenece al rango de la página actual
            if (contador >= inicio && contador < fin) {

                // Agregar la fila del empleado a la tabla
                $('#tabla-nomina-body-40lbs').append(`
                    <tr>
                        <td>${numeroFila}</td>
                        <td>${empleado.nombre}</td>
                        
                    </tr>
                `);
                // Incrementar el número consecutivo
                numeroFila++;
            }
            // Incrementar el contador general de empleados
            contador++;

        });

    });

    crearPaginacion();

}


// FUNCIÓN PARA CREAR LA PAGINACIÓN
// GENERA LOS BOTONES DE ACUERDO CON LA CANTIDAD DE EMPLEADOS
// DEL DEPARTAMENTO Y TIPO (CSS O SSS) SELECCIONADO.

function crearPaginacion() {

    // Obtener el departamento seleccionado
    let filtro = $('#filtro-departamento').val();

    // Obtener el texto escrito en el buscador
    let textoBusqueda = $('#busqueda-nomina-40lbs').val().trim().toUpperCase();


    // El valor tiene el formato: "idDepartamento-TipoEmpleado"
    let datos = filtro.split("-");

    let idDepartamento = Number(datos[0]);
    let tipoEmpleado = datos[1];

    // Variable para almacenar el total de empleados que cumplen el filtro
    let totalEmpleados = 0;

    // Recorrer los departamentos
    jsonNomina40lbs.departamentos.forEach(departamento => {

        // Solo trabajar con el departamento seleccionado
        if (departamento.id_departamento != idDepartamento) {
            return;
        }

        // Recorrer los empleados del departamento
        departamento.empleados.forEach(empleado => {

            // Si se seleccionó CSS, contar únicamente empleados con seguro social
            if (tipoEmpleado == "CSS" && !empleado.seguroSocial) {
                return;
            }

            // Si se seleccionó SSS, contar únicamente empleados sin seguro social
            if (tipoEmpleado == "SSS" && empleado.seguroSocial) {
                return;
            }

                // Si existe un texto de búsqueda, buscar por nombre o clave
            if (textoBusqueda != "") {

                let nombreEmpleado = empleado.nombre.toUpperCase();
                let claveEmpleado = empleado.clave.toUpperCase();

                // Si no coincide el nombre ni la clave, pasar al siguiente empleado
                if (!nombreEmpleado.includes(textoBusqueda) &&
                    !claveEmpleado.includes(textoBusqueda)) {
                    return;
                }

            }

            // Incrementar el total de empleados que se mostrarán
            totalEmpleados++;

        });

    });

    // Calcular el número total de páginas
    let totalPaginas = Math.ceil(totalEmpleados / registrosPorPagina);

    // Limpiar la paginación actual
    $('#paginacion-nomina').empty();

    // Crear un botón por cada página
    for (let i = 1; i <= totalPaginas; i++) {

        $('#paginacion-nomina').append(`
            <li class="page-item ${i == paginaActual ? 'active' : ''}">
                <button class="page-link" onclick="cambiarPagina(${i})">
                    ${i}
                </button>
            </li>
        `);

    }

}

// FUNCIÓN PARA CAMBIAR DE PÁGINA
// ACTUALIZA LA PÁGINA ACTUAL Y VUELVE A CARGAR LA TABLA CON LOS REGISTROS DE ESA PÁGINA

function cambiarPagina(pagina) {

    // Guardar la página seleccionada
    paginaActual = pagina;

    // Volver a llenar la tabla con los registros de la nueva página
    llenarTablaNomina();

}