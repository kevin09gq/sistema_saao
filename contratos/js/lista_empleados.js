$(document).ready(function () {
  // Verificar permisos al cargar la página
  aplicarPermisosPersonalizarContratos();
  aplicarPermisosGenerarContratos();
});

// contratos/js/lista_empleados.js
(function () {
  const API_PLANTILLAS = '/sistema_saao/contratos/php/plantillas_fs.php';
  const API_EMPLEADOS = '/sistema_saao/contratos/php/obtener_empleados.php';
  const API_AREAS_DEPTOS = '/sistema_saao/gestion_empleados/empleados/php/infoAreasDepartamento.php';

  const tabla = document.getElementById('tablaEmpleados');
  const tbody = tabla.querySelector('tbody');
  const filtroArea = document.getElementById('filtroArea');
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
    optDefault.value = '';
    optDefault.textContent = '-- Selecciona plantilla --';
    sel.appendChild(optDefault);
    plantillas.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.nombre;
      opt.textContent = p.nombre.replace('.html', '');
      sel.appendChild(opt);
    });
    return sel;
  }

  // Cargar lista de áreas en el select
  function cargarAreas(empleados) {
    fetch(API_AREAS_DEPTOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ accion: 'obtenerAreas' })
    })
      .then(r => r.json())
      .then(res => {
        if (res && res.success && Array.isArray(res.areas) && res.areas.length > 0) {
          filtroArea.innerHTML = '<option value="">Todas las áreas</option>';
          res.areas.forEach(area => {
            const opt = document.createElement('option');
            opt.value = area.id_area;
            opt.textContent = area.nombre_area;
            filtroArea.appendChild(opt);
          });
        } else {
          poblarAreasDesdeEmpleados(empleados);
        }
      })
      .catch(() => {
        poblarAreasDesdeEmpleados(empleados);
      });
  }

  function poblarAreasDesdeEmpleados(empleados) {
    const areasMap = new Map();
    empleados.forEach(e => {
      if (e.id_area && e.nombre_area) {
        areasMap.set(String(e.id_area), e.nombre_area);
      }
    });

    filtroArea.innerHTML = '<option value="">Todas las áreas</option>';
    Array.from(areasMap.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .forEach(([id, nombre]) => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = nombre;
        filtroArea.appendChild(opt);
      });
  }

  // Cargar departamentos filtrados por el área seleccionada
  function cargarDepartamentosPorArea(idArea) {
    if (!idArea) {
      filtroDepartamento.disabled = true;
      filtroDepartamento.innerHTML = '<option value="">Departamento</option>';
      filtroDepartamento.value = '';
      return;
    }

    filtroDepartamento.disabled = false;
    filtroDepartamento.innerHTML = '<option value="">Cargando departamentos...</option>';

    fetch(API_AREAS_DEPTOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ accion: 'obtenerDepartamentos', id_area: idArea })
    })
      .then(r => r.json())
      .then(res => {
        let deptos = (res && res.success && Array.isArray(res.departamentos)) ? res.departamentos : [];

        if (deptos.length === 0) {
          // Fallback desde empleados de esa área
          const deptoSet = new Set();
          empleadosOriginales
            .filter(e => String(e.id_area) === String(idArea))
            .forEach(e => {
              if (e.nombre_departamento) deptoSet.add(e.nombre_departamento);
            });
          deptos = Array.from(deptoSet).sort().map(d => ({ nombre_departamento: d }));
        }

        filtroDepartamento.innerHTML = '<option value="">Todos los departamentos</option>';
        deptos.forEach(d => {
          const opt = document.createElement('option');
          opt.value = d.nombre_departamento;
          opt.textContent = d.nombre_departamento;
          filtroDepartamento.appendChild(opt);
        });
      })
      .catch(() => {
        const deptoSet = new Set();
        empleadosOriginales
          .filter(e => String(e.id_area) === String(idArea))
          .forEach(e => {
            if (e.nombre_departamento) deptoSet.add(e.nombre_departamento);
          });

        filtroDepartamento.innerHTML = '<option value="">Todos los departamentos</option>';
        Array.from(deptoSet).sort().forEach(d => {
          const opt = document.createElement('option');
          opt.value = d;
          opt.textContent = d;
          filtroDepartamento.appendChild(opt);
        });
      });
  }

  function filtrarYOrdenar() {
    const textoBusqueda = buscarEmpleado.value.toLowerCase().trim();
    const areaSeleccionada = filtroArea.value;
    const deptoSeleccionado = filtroDepartamento.value;
    const ordenSeleccionado = ordenarPor.value;

    // Filtrar
    empleadosFiltrados = empleadosOriginales.filter(e => {
      const nombreCompleto = `${e.nombre} ${e.ap_paterno} ${e.ap_materno}`.toLowerCase();
      const clave = (e.clave_empleado || '').toLowerCase();
      const area = (e.nombre_area || '').toLowerCase();

      const cumpleBusqueda = !textoBusqueda ||
        nombreCompleto.includes(textoBusqueda) ||
        clave.includes(textoBusqueda) ||
        area.includes(textoBusqueda);

      const cumpleArea = !areaSeleccionada ||
        String(e.id_area) === String(areaSeleccionada);

      const cumpleDepto = !deptoSeleccionado ||
        e.nombre_departamento === deptoSeleccionado;

      return cumpleBusqueda && cumpleArea && cumpleDepto;
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
      } else if (ordenSeleccionado === 'area') {
        const areaA = (a.nombre_area || '').toLowerCase();
        const areaB = (b.nombre_area || '').toLowerCase();
        return areaA.localeCompare(areaB);
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
      td.colSpan = 6;
      td.className = 'text-center text-muted py-5';
      td.innerHTML = `
        <div class="py-3">
          <i class="bi bi-inbox text-muted" style="font-size: 2.2rem; opacity: 0.5;"></i>
          <div class="mt-2 fw-semibold text-secondary">No se encontraron empleados</div>
          <small class="text-muted">Prueba cambiando los filtros o el término de búsqueda</small>
        </div>
      `;
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    empleadosPagina.forEach(e => {
      const tr = document.createElement('tr');

      // Clave con badge
      const tdClave = document.createElement('td');
      tdClave.className = 'text-center';
      tdClave.innerHTML = `<span class="badge-clave">${e.clave_empleado}</span>`;

      // Nombre
      const tdNombre = document.createElement('td');
      const nombreCompleto = `${e.nombre} ${e.ap_paterno} ${e.ap_materno}`.trim();
      tdNombre.innerHTML = `<span class="fw-semibold text-dark">${nombreCompleto}</span>`;

      // Área (NUEVA COLUMNA)
      const tdArea = document.createElement('td');
      tdArea.className = 'text-nowrap';
      tdArea.innerHTML = `<span class="text-muted small"><i class="bi bi-geo-alt me-1"></i></span><span class="text-secondary small fw-medium">${e.nombre_area || 'Sin área'}</span>`;

      // Departamento
      const tdDep = document.createElement('td');
      tdDep.className = 'text-nowrap';
      tdDep.innerHTML = `<span class="text-muted small"><i class="bi bi-building me-1"></i></span><span class="text-secondary small fw-medium">${e.nombre_departamento || 'Sin departamento'}</span>`;

      // Select plantilla
      const tdSel = document.createElement('td');
      const sel = crearSelectPlantillas();
      tdSel.appendChild(sel);

      // Acciones
      const tdAcc = document.createElement('td');
      tdAcc.className = 'text-center';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-success btn-sm btn-generar';
      btn.innerHTML = '<i class="bi bi-file-earmark-text me-1"></i> Generar';
      btn.addEventListener('click', () => {
        const plantilla = sel.value;
        if (!plantilla) {
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'warning',
              title: 'Plantilla requerida',
              text: 'Por favor selecciona una plantilla de contrato para este empleado.',
              confirmButtonColor: '#2d6a4f'
            });
          } else {
            alert('⚠️ Por favor selecciona una plantilla de contrato');
          }
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
      tr.appendChild(tdArea);
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

    // Aplicar permisos para el botón generar en la tabla
    if (typeof aplicarPermisosGenerarContratos === 'function') {
      aplicarPermisosGenerarContratos();
    }
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
    filtroArea.value = '';
    filtroDepartamento.disabled = true;
    filtroDepartamento.innerHTML = '<option value="">Departamento</option>';
    filtroDepartamento.value = '';
    ordenarPor.value = 'nombre_asc';
    buscarEmpleado.value = '';
    filtrarYOrdenar();
  }

  // Event listeners
  filtroArea.addEventListener('change', () => {
    const idArea = filtroArea.value;
    cargarDepartamentosPorArea(idArea);
    filtrarYOrdenar();
  });

  filtroDepartamento.addEventListener('change', filtrarYOrdenar);
  ordenarPor.addEventListener('change', filtrarYOrdenar);
  buscarEmpleado.addEventListener('input', filtrarYOrdenar);
  btnLimpiarFiltros.addEventListener('click', limpiarFiltros);

  // Inicializar
  Promise.all([cargarPlantillas(), cargarEmpleados()])
    .then(([, empleados]) => {
      // Filtrar solo empleados activos (excluir empleados dados de baja)
      const empleadosActivos = (empleados || []).filter(e => {
        return e.id_status === 1 || e.id_status === '1' ||
          (e.nombre_status && e.nombre_status.toLowerCase() === 'activo');
      });

      empleadosOriginales = empleadosActivos;
      empleadosFiltrados = [...empleadosOriginales];

      // Cargar lista de áreas en el select
      cargarAreas(empleadosOriginales);

      // El departamento inicia bloqueado
      filtroDepartamento.disabled = true;
      filtroDepartamento.innerHTML = '<option value="">Departamento</option>';

      filtrarYOrdenar();
    })
    .catch(err => {
      console.error(err);
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar datos',
          text: err.message,
          confirmButtonColor: '#2d6a4f'
        });
      } else {
        alert('❌ Error al cargar datos: ' + err.message);
      }
    });
})();
