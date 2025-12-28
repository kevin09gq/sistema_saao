function obtenerDepartamentosPermitidos() {

      $.ajax({
        type: "POST",
        url: "../php/obtenerDepartamentos.php",

        success: function (response) {
            if (!response.error) {
                let departamentos = JSON.parse(response);
                // Opción para mostrar todos los departamentos
                let opciones = ``;
                opciones += `
                <option value="0">Todos</option>
                `;

                // Agrega cada departamento como opción en el select
                departamentos.forEach((element) => {
                    opciones += `
                    <option value="${element.id_departamento}">${element.nombre_departamento}</option>
                `;
                });

                // Llena el select con las opciones
                $("#filtro-departamento").html(opciones);

                // Agregar opción para el departamento 'sin seguro'
                $("#filtro-departamento").append(`
                    <option value="sin_seguro">Sin Seguro</option>
                `);

                // Inicializar el listener del filtro una vez que el select tiene opciones
                aplicarFiltroDepartamento();
                // Inicializar búsqueda
                aplicarBusquedaNomina();

              
            }
        },


    });
}

// Función sencilla para filtrar la vista por departamento sin modificar el JSON original
function aplicarFiltroDepartamento() {
    $('#filtro-departamento').off('change').on('change', function () {
        const valor = $(this).val();
        // Si no hay datos todavía, no hacer nada
        if (typeof jsonNominaConfianza === 'undefined' || !jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) {
            return;
        }

        // Resetear a página 1 al cambiar de filtro
        paginaActualNomina = 1;

        // Valor '0' = Todos
        if (String(valor) === '0') {
            mostrarDatosTabla(jsonNominaConfianza, 1);
            return;
        }

        // Manejo especial: si seleccionaron la opción 'sin_seguro'
        if (String(valor) === 'sin_seguro') {
            // Buscar departamento con nombre 'sin seguro' (insensible a mayúsculas)
            const deptoSinSeguro = jsonNominaConfianza.departamentos.find(d => String(d.nombre || '').toLowerCase().trim() === 'sin seguro');
            const empleadosFiltrados = Array.isArray(deptoSinSeguro && deptoSinSeguro.empleados) ? deptoSinSeguro.empleados.slice() : [];
            const jsonTemporal = { departamentos: [{ nombre: 'sin seguro', empleados: empleadosFiltrados }] };
            mostrarDatosTabla(jsonTemporal, 1);
            return;
        }

        const idSeleccionado = Number(valor);

        // Recolectar empleados cuyo id_departamento coincida
        const empleadosFiltrados = [];
        jsonNominaConfianza.departamentos.forEach(depto => {
            if (!Array.isArray(depto.empleados)) return;
            depto.empleados.forEach(emp => {
                if (Number(emp.id_departamento) === idSeleccionado) {
                    empleadosFiltrados.push(emp);
                }
            });
        });

        // Construir un JSON temporal compatible con mostrarDatosTabla
        const jsonTemporal = { departamentos: [{ nombre: 'Filtro', empleados: empleadosFiltrados }] };
        mostrarDatosTabla(jsonTemporal, 1);
    });
}

// Función simple para buscar en la nómina por nombre, apellidos o clave
function aplicarBusquedaNomina() {
    $('#busqueda-nomina-confianza').off('input').on('input', function () {
        const q = String($(this).val() || '').trim().toLowerCase();

        // Si no hay datos todavía, no hacer nada
        if (typeof jsonNominaConfianza === 'undefined' || !jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) {
            return;
        }

        // Si el campo está vacío, reaplicar el filtro de departamento actual (si hay)
        if (q === '') {
            $('#filtro-departamento').trigger('change');
            return;
        }

        // Obtener el departamento seleccionado
        const filtroActual = String($('#filtro-departamento').val() || '0');

        const filtrarPorQuery = (lista) => {
            return lista.filter(emp => {
                const nombre = String(emp.nombre || '').toLowerCase();
                const clave = String(emp.clave || '').toLowerCase();
                return nombre.indexOf(q) !== -1 || clave.indexOf(q) !== -1;
            });
        };

        // Si hay departamento seleccionado (no 'Todos'), buscar SOLO allí
        if (filtroActual !== '0') {
            let pool = [];
            if (filtroActual === 'sin_seguro') {
                const depto = jsonNominaConfianza.departamentos.find(d => String(d.nombre || '').toLowerCase().trim() === 'sin seguro');
                pool = Array.isArray(depto && depto.empleados) ? depto.empleados.slice() : [];
            } else {
                const idSel = Number(filtroActual);
                jsonNominaConfianza.departamentos.forEach(d => {
                    if (!Array.isArray(d.empleados)) return;
                    d.empleados.forEach(emp => {
                        if (Number(emp.id_departamento) === idSel) pool.push(emp);
                    });
                });
            }

            const resultadosDept = filtrarPorQuery(pool);
            mostrarDatosTabla({ departamentos: [{ nombre: 'Busqueda', empleados: resultadosDept }] }, 1);
            return;
        }

        // Si no hay departamento seleccionado (Todos), búsqueda global
        const todos = [];
        jsonNominaConfianza.departamentos.forEach(d => {
            if (!Array.isArray(d.empleados)) return;
            d.empleados.forEach(e => todos.push(e));
        });
        const resultados = filtrarPorQuery(todos);
        mostrarDatosTabla({ departamentos: [{ nombre: 'Busqueda', empleados: resultados }] }, 1);
    });
}