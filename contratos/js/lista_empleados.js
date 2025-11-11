// contratos/js/lista_empleados.js
(function(){
  const API_PLANTILLAS = '/sistema_saao/contratos/php/plantillas_fs.php';
  const API_EMPLEADOS = '/sistema_saao/empleados/php/obtenerEmpleados.php';

  const tabla = document.getElementById('tablaEmpleados');
  const tbody = tabla.querySelector('tbody');
  const filtroDepartamento = document.getElementById('filtroDepartamento');
  const ordenarPor = document.getElementById('ordenarPor');
  const buscarEmpleado = document.getElementById('buscarEmpleado');
  const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
  const paginacionContainer = document.getElementById('paginacion');
  const infoInicio = document.getElementById('infoInicio');
  const infoFin = document.getElementById('infoFin');
  const infoTotal = document.getElementById('infoTotal');

  let plantillas = [];
  let empleadosOriginales = [];
  let empleadosFiltrados = [];
  let paginaActual = 1;
  const filasPorPagina = 10;

  function cargarPlantillas() {
    return fetch(API_PLANTILLAS + '?accion=listar')
      .then(r => r.json())
      .then(res => {
        if (!res.ok) throw new Error(res.error || 'Error al listar plantillas');
        plantillas = res.data || [];
      });
  }

  function cargarEmpleados() {
    return fetch(API_EMPLEADOS + '?accion=cargarEmpleados')
      .then(r => r.json());
  }

  function crearSelectPlantillas() {
    const sel = document.createElement('select');
    sel.className = 'form-select form-select-sm select-plantilla';
    const optDefault = document.createElement('option');
    optDefault.value = ''; optDefault.textContent = '-- Selecciona plantilla --';
    sel.appendChild(optDefault);
    plantillas.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.nombre; opt.textContent = p.nombre.replace('.html', '');
      sel.appendChild(opt);
    });
    return sel;
  }

  function poblarFiltroDepartamentos(empleados) {
    const departamentos = new Set();
    empleados.forEach(e => {
      if (e.nombre_departamento) {
        departamentos.add(e.nombre_departamento);
      }
    });
    
    filtroDepartamento.innerHTML = '<option value="">Todos los departamentos</option>';
    Array.from(departamentos).sort().forEach(dep => {
      const opt = document.createElement('option');
      opt.value = dep;
      opt.textContent = dep;
      filtroDepartamento.appendChild(opt);
    });
  }

  function filtrarYOrdenar() {
    const textoBusqueda = buscarEmpleado.value.toLowerCase().trim();
    const deptoSeleccionado = filtroDepartamento.value;
    const ordenSeleccionado = ordenarPor.value;

    // Filtrar
    empleadosFiltrados = empleadosOriginales.filter(e => {
      const nombreCompleto = `${e.nombre} ${e.ap_paterno} ${e.ap_materno}`.toLowerCase();
      const clave = (e.clave_empleado || '').toLowerCase();
      
      const cumpleBusqueda = !textoBusqueda || 
        nombreCompleto.includes(textoBusqueda) || 
        clave.includes(textoBusqueda);
      
      const cumpleDepto = !deptoSeleccionado || 
        e.nombre_departamento === deptoSeleccionado;
      
      return cumpleBusqueda && cumpleDepto;
    });

    // Ordenar
    empleadosFiltrados.sort((a, b) => {
      if (ordenSeleccionado === 'nombre_asc') {
        const nombreA = `${a.nombre} ${a.ap_paterno} ${a.ap_materno}`.toLowerCase();
        const nombreB = `${b.nombre} ${b.ap_paterno} ${b.ap_materno}`.toLowerCase();
        return nombreA.localeCompare(nombreB);
      } else if (ordenSeleccionado === 'nombre_desc') {
        const nombreA = `${a.nombre} ${a.ap_paterno} ${a.ap_materno}`.toLowerCase();
        const nombreB = `${b.nombre} ${b.ap_paterno} ${b.ap_materno}`.toLowerCase();
        return nombreB.localeCompare(nombreA);
      } else if (ordenSeleccionado === 'clave_asc') {
        const claveA = (a.clave_empleado || '').toString();
        const claveB = (b.clave_empleado || '').toString();
        return claveA.localeCompare(claveB, undefined, { numeric: true });
      } else if (ordenSeleccionado === 'clave_desc') {
        const claveA = (a.clave_empleado || '').toString();
        const claveB = (b.clave_empleado || '').toString();
        return claveB.localeCompare(claveA, undefined, { numeric: true });
      } else if (ordenSeleccionado === 'departamento') {
        const deptoA = (a.nombre_departamento || '').toLowerCase();
        const deptoB = (b.nombre_departamento || '').toLowerCase();
        return deptoA.localeCompare(deptoB);
      }
      return 0;
    });

    paginaActual = 1;
    renderizarTabla();
    renderizarPaginacion();
  }

  function renderizarTabla() {
    tbody.innerHTML = '';
    
    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const empleadosPagina = empleadosFiltrados.slice(inicio, fin);

    if (empleadosPagina.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5;
      td.className = 'text-center text-muted py-4';
      td.innerHTML = '<i class="bi bi-inbox" style="font-size: 2rem;"></i><br>No se encontraron empleados';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    empleadosPagina.forEach(e => {
      const tr = document.createElement('tr');

      // Clave con badge
      const tdClave = document.createElement('td');
      tdClave.innerHTML = `<span class="badge-clave">${e.clave_empleado}</span>`;

      // Nombre
      const tdNombre = document.createElement('td');
      tdNombre.textContent = `${e.nombre} ${e.ap_paterno} ${e.ap_materno}`.trim();

      // Departamento
      const tdDep = document.createElement('td');
      tdDep.innerHTML = `<i class="bi bi-building text-muted"></i> ${e.nombre_departamento || 'Sin departamento'}`;
      tdDep.className = 'text-nowrap';

      // Select plantilla
      const tdSel = document.createElement('td');
      const sel = crearSelectPlantillas();
      tdSel.appendChild(sel);

      // Acciones
      const tdAcc = document.createElement('td');
      tdAcc.className = 'text-center';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary btn-sm btn-generar';
      btn.innerHTML = '<i class="bi bi-file-earmark-text"></i> Generar';
      btn.addEventListener('click', () => {
        const plantilla = sel.value;
        if (!plantilla) { 
          alert('⚠️ Por favor selecciona una plantilla de contrato'); 
          return; 
        }
        const url = new URL('/sistema_saao/contratos/views/generar.php', window.location.origin);
        url.searchParams.set('empleadoId', e.id_empleado);
        url.searchParams.set('clave', e.clave_empleado);
        url.searchParams.set('plantilla', plantilla);
        window.location.href = url.toString();
      });
      tdAcc.appendChild(btn);

      tr.appendChild(tdClave);
      tr.appendChild(tdNombre);
      tr.appendChild(tdDep);
      tr.appendChild(tdSel);
      tr.appendChild(tdAcc);

      tbody.appendChild(tr);
    });

    // Actualizar info de paginación
    const totalEmpleados = empleadosFiltrados.length;
    infoTotal.textContent = totalEmpleados;
    infoInicio.textContent = totalEmpleados > 0 ? inicio + 1 : 0;
    infoFin.textContent = Math.min(fin, totalEmpleados);
  }

  function renderizarPaginacion() {
    paginacionContainer.innerHTML = '';
    
    const totalPaginas = Math.ceil(empleadosFiltrados.length / filasPorPagina);
    
    if (totalPaginas <= 1) return;

    // Botón anterior
    const liPrev = document.createElement('li');
    liPrev.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
    const aPrev = document.createElement('a');
    aPrev.className = 'page-link';
    aPrev.href = '#';
    aPrev.innerHTML = '<i class="bi bi-chevron-left"></i>';
    aPrev.addEventListener('click', (e) => {
      e.preventDefault();
      if (paginaActual > 1) {
        paginaActual--;
        renderizarTabla();
        renderizarPaginacion();
      }
    });
    liPrev.appendChild(aPrev);
    paginacionContainer.appendChild(liPrev);

    // Páginas numeradas
    const maxBotones = 5;
    let inicio = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
    let fin = Math.min(totalPaginas, inicio + maxBotones - 1);
    
    if (fin - inicio < maxBotones - 1) {
      inicio = Math.max(1, fin - maxBotones + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
      const a = document.createElement('a');
      a.className = 'page-link';
      a.href = '#';
      a.textContent = i;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        paginaActual = i;
        renderizarTabla();
        renderizarPaginacion();
      });
      li.appendChild(a);
      paginacionContainer.appendChild(li);
    }

    // Botón siguiente
    const liNext = document.createElement('li');
    liNext.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
    const aNext = document.createElement('a');
    aNext.className = 'page-link';
    aNext.href = '#';
    aNext.innerHTML = '<i class="bi bi-chevron-right"></i>';
    aNext.addEventListener('click', (e) => {
      e.preventDefault();
      if (paginaActual < totalPaginas) {
        paginaActual++;
        renderizarTabla();
        renderizarPaginacion();
      }
    });
    liNext.appendChild(aNext);
    paginacionContainer.appendChild(liNext);
  }

  function limpiarFiltros() {
    filtroDepartamento.value = '';
    ordenarPor.value = 'nombre_asc';
    buscarEmpleado.value = '';
    filtrarYOrdenar();
  }

  // Event listeners
  filtroDepartamento.addEventListener('change', filtrarYOrdenar);
  ordenarPor.addEventListener('change', filtrarYOrdenar);
  buscarEmpleado.addEventListener('input', filtrarYOrdenar);
  btnLimpiarFiltros.addEventListener('click', limpiarFiltros);

  // Inicializar
  Promise.all([cargarPlantillas(), cargarEmpleados()])
    .then(([, empleados]) => {
      // Filtrar solo empleados activos (excluir empleados dados de baja)
      const empleadosActivos = (empleados || []).filter(e => {
        // Filtrar por id_status = 1 (Activo) o nombre_status = 'Activo'
        return e.id_status === 1 || e.id_status === '1' || 
               (e.nombre_status && e.nombre_status.toLowerCase() === 'activo');
      });
      
      empleadosOriginales = empleadosActivos;
      empleadosFiltrados = [...empleadosOriginales];
      poblarFiltroDepartamentos(empleadosOriginales);
      filtrarYOrdenar();
    })
    .catch(err => {
      console.error(err);
      alert('❌ Error al cargar datos: ' + err.message);
    });
})();
