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
                // Inicializar filtro de empresas
                obtenerEmpresasPermitidas();
            }
        },


    });
}

// Función para obtener empresas y llenar el select
function obtenerEmpresasPermitidas() {
    $.ajax({
        type: "POST",
        url: "../../public/php/obtenerEmpresa.php",
        success: function (response) {
            try {
                const empresas = JSON.parse(response);
                
                // Crear opciones del select
                let opciones = '<option value="0">Todas las Empresas</option>';
                empresas.forEach(empresa => {
                    opciones += `<option value="${empresa.id_empresa}">${empresa.nombre_empresa}</option>`;
                });
                
                // Llenar el select
                $("#filtro-empresa").html(opciones);
                
                // Inicializar el listener
                aplicarFiltroEmpresa();
            } catch (e) {
                console.error('Error al cargar empresas:', e);
            }
        },
        error: function (err) {
            console.error('Error al obtener empresas:', err);
        }
    });
}

// Función central para aplicar filtros combinados (departamento + empresa)
function aplicarFiltrosCombinados() {
    // Validar que hay datos
    if (!jsonNominaConfianza || !jsonNominaConfianza.departamentos) {
        return;
    }

    // Resetear a página 1
    paginaActualNomina = 1;

    // Obtener valores de ambos filtros
    const valorDepartamento = String($('#filtro-departamento').val() || '0');
    const valorEmpresa = String($('#filtro-empresa').val() || '0');

    // Si ambos están en "Todos", mostrar todo
    if (valorDepartamento === '0' && valorEmpresa === '0') {
        mostrarDatosTabla(jsonNominaConfianza, 1);
        return;
    }

    let empleadosFiltrados = [];

    // Paso 1: Filtrar por departamento
    if (valorDepartamento === '0') {
        // Todos los departamentos
        jsonNominaConfianza.departamentos.forEach(depto => {
            if (Array.isArray(depto.empleados)) {
                empleadosFiltrados = empleadosFiltrados.concat(depto.empleados);
            }
        });
    } else if (valorDepartamento === 'sin_seguro') {
        // Departamento "sin seguro"
        const deptoSinSeguro = jsonNominaConfianza.departamentos.find(
            d => String(d.nombre || '').toLowerCase().trim() === 'sin seguro'
        );
        if (deptoSinSeguro && Array.isArray(deptoSinSeguro.empleados)) {
            empleadosFiltrados = deptoSinSeguro.empleados.slice();
        }
    } else {
        // Departamento específico por ID
        const idDepartamento = Number(valorDepartamento);
        jsonNominaConfianza.departamentos.forEach(depto => {
            if (!Array.isArray(depto.empleados)) return;
            depto.empleados.forEach(emp => {
                if (Number(emp.id_departamento) === idDepartamento) {
                    empleadosFiltrados.push(emp);
                }
            });
        });
    }

    // Paso 2: Filtrar por empresa (sobre el resultado del filtro de departamento)
    if (valorEmpresa !== '0') {
        const idEmpresa = Number(valorEmpresa);
        empleadosFiltrados = empleadosFiltrados.filter(emp => {
            return Number(emp.id_empresa) === idEmpresa;
        });
    }

    // Mostrar resultados
    const jsonTemporal = {
        departamentos: [{
            nombre: 'Filtro',
            empleados: empleadosFiltrados
        }]
    };

    mostrarDatosTabla(jsonTemporal, 1);
}

// Función simple para filtrar por empresa (llama a filtros combinados)
function aplicarFiltroEmpresa() {
    $('#filtro-empresa').off('change').on('change', function () {
        aplicarFiltrosCombinados();
    });
}

// Función sencilla para filtrar la vista por departamento (llama a filtros combinados)
function aplicarFiltroDepartamento() {
    $('#filtro-departamento').off('change').on('change', function () {
        aplicarFiltrosCombinados();
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

        // Si el campo está vacío, reaplicar los filtros actuales
        if (q === '') {
            aplicarFiltrosCombinados();
            return;
        }

        // Obtener filtros actuales
        const valorDepartamento = String($('#filtro-departamento').val() || '0');
        const valorEmpresa = String($('#filtro-empresa').val() || '0');

        // Primero aplicar filtros de departamento y empresa para obtener el pool
        let pool = [];

        // Filtrar por departamento
        if (valorDepartamento === '0') {
            // Todos los departamentos
            jsonNominaConfianza.departamentos.forEach(depto => {
                if (Array.isArray(depto.empleados)) {
                    pool = pool.concat(depto.empleados);
                }
            });
        } else if (valorDepartamento === 'sin_seguro') {
            const depto = jsonNominaConfianza.departamentos.find(d => String(d.nombre || '').toLowerCase().trim() === 'sin seguro');
            pool = Array.isArray(depto && depto.empleados) ? depto.empleados.slice() : [];
        } else {
            const idSel = Number(valorDepartamento);
            jsonNominaConfianza.departamentos.forEach(d => {
                if (!Array.isArray(d.empleados)) return;
                d.empleados.forEach(emp => {
                    if (Number(emp.id_departamento) === idSel) pool.push(emp);
                });
            });
        }

        // Filtrar por empresa sobre el pool del departamento
        if (valorEmpresa !== '0') {
            const idEmpresa = Number(valorEmpresa);
            pool = pool.filter(emp => Number(emp.id_empresa) === idEmpresa);
        }

        // Ahora filtrar por búsqueda sobre el pool resultante
        const resultados = pool.filter(emp => {
            const nombre = String(emp.nombre || '').toLowerCase();
            const clave = String(emp.clave || '').toLowerCase();
            return nombre.indexOf(q) !== -1 || clave.indexOf(q) !== -1;
        });

        mostrarDatosTabla({ departamentos: [{ nombre: 'Busqueda', empleados: resultados }] }, 1);
    });
}

// Función para limpiar los filtros y la búsqueda
function limpiarFiltrosYBusqueda() {
    // Restablecer el select de departamento al valor por defecto
    $('#filtro-departamento').val('0');

    // Restablecer el select de empresa al valor por defecto
    $('#filtro-empresa').val('0');

    // Limpiar el campo de búsqueda
    $('#busqueda-nomina-confianza').val('');

    // Reaplicar los filtros para mostrar todos los datos
    aplicarFiltrosCombinados();
}