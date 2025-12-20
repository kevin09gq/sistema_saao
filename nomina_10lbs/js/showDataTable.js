function setInitialVisibility() {
    $('#container-nomina').attr('hidden', true);
    $("#tabla-nomina-responsive").removeAttr("hidden");
}

function mostrarDatosTabla(jsonNominaConfianza, pagina = 1) {
    const empleadosPorPagina = 7;
    
    // Obtener todos los empleados de todos los departamentos
    let todosEmpleados = [];
    jsonNominaConfianza.departamentos.forEach(departamento => {
        todosEmpleados = todosEmpleados.concat(departamento.empleados);
    });
    
    // Calcular índices para la paginación
    const inicio = (pagina - 1) * empleadosPorPagina;
    const fin = inicio + empleadosPorPagina;
    const empleadosPagina = todosEmpleados.slice(inicio, fin);
    
    // Limpiar la tabla
    $('#tabla-nomina-body').empty();
    
    // Mostrar empleados de la página actual
    empleadosPagina.forEach((empleado, index) => {
        const numeroFila = inicio + index + 1;
        
        // Función para buscar concepto por código (segura si no existe 'conceptos')
        const buscarConcepto = (codigo) => {
            if (!Array.isArray(empleado.conceptos)) return '0.00';
            const concepto = empleado.conceptos.find(c => String(c.codigo) === String(codigo));
            if (concepto) {
                const valor = parseFloat(concepto.resultado) || 0;
                return valor.toFixed(2);
            }
            return '0.00';
        };
        
        // Función para formatear valores (mostrar — si es 0.00)
        const formatearValor = (valor) => {
            const num = parseFloat(valor) || 0;
            return num === 0 ? '<span class="valor-vacio">—</span>' : num.toFixed(2);
        };
        
        const fila = `
            <tr>
                <td>${numeroFila}</td>
                <td>${empleado.nombre}</td>
                <td>${formatearValor(0)}</td>
                <td>${formatearValor(0)}</td>
                <td>${formatearValor(0)}</td>
                <td>${formatearValor(0)}</td>
                <td>${formatearValor(empleado.tarjeta || 0)}</td>
                <td>${formatearValor(buscarConcepto('45'))}</td>
                <td>${formatearValor(buscarConcepto('52'))}</td>
                <td>${formatearValor(0)}</td>
                <td>${formatearValor(buscarConcepto('16'))}</td>
                <td>${formatearValor(0)}</td>
                <td>${formatearValor(0)}</td>
                <td>${formatearValor(0)}</td>
                <td>${formatearValor(0)}</td>
                <td>${formatearValor(0)}</td>
                <td><strong>${formatearValor(0)}</strong></td>
            </tr>
        `;
        $('#tabla-nomina-body').append(fila);
    });
    
    // Crear la paginación
    paginarTabla(jsonNominaConfianza, todosEmpleados.length, pagina, empleadosPorPagina);
}

function paginarTabla(jsonNominaConfianza, totalEmpleados, paginaActual, empleadosPorPagina) {
    // Calcular total de páginas
    const totalPaginas = Math.ceil(totalEmpleados / empleadosPorPagina);
    
    // Limpiar paginación
    $('#paginacion-nomina').empty();
    
    // Botón anterior
    if (paginaActual > 1) {
        $('#paginacion-nomina').append(`
            <li class="page-item">
                <a class="page-link" href="#" data-pagina="${paginaActual - 1}">Anterior</a>
            </li>
        `);
    }
    
    // Botones de páginas
    for (let i = 1; i <= totalPaginas; i++) {
        const activo = i === paginaActual ? 'active' : '';
        $('#paginacion-nomina').append(`
            <li class="page-item ${activo}">
                <a class="page-link" href="#" data-pagina="${i}">${i}</a>
            </li>
        `);
    }
    
    // Botón siguiente
    if (paginaActual < totalPaginas) {
        $('#paginacion-nomina').append(`
            <li class="page-item">
                <a class="page-link" href="#" data-pagina="${paginaActual + 1}">Siguiente</a>
            </li>
        `);
    }
    
    // Evento click en los botones de paginación
    $('#paginacion-nomina .page-link').on('click', function(e) {
        e.preventDefault();
        const nuevaPagina = parseInt($(this).data('pagina'));
        mostrarDatosTabla(jsonNominaConfianza, nuevaPagina);
    });
}