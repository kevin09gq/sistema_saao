// contratos/js/generar.js
(function(){
  const API_PLANTILLAS = '/sistema_saao/contratos/php/plantillas_fs.php';
  const API_EMPLEADOS = '/sistema_saao/contratos/php/obtener_empleados.php';
  const API_GUARDAR = '/sistema_saao/contratos/php/guardar_html.php';
  const API_EXPORTAR_WORD = '/sistema_saao/contratos/php/exportar_word.php';

  // Elementos del nuevo formulario
  const formDatosContrato = document.getElementById('formDatosContrato');
  const btnVerVistaPrevia = document.getElementById('btnVerVistaPrevia');
  const previewContent = document.getElementById('previewContent');
  const btnImprimir = document.getElementById('btnImprimir');
  const btnGuardarHtml = document.getElementById('btnGuardarHtml');
  const btnDescargarWord = document.getElementById('btnDescargarWord');
  // Beneficiarios UI
  const selectBeneficiario = document.getElementById('selectBeneficiario');
  const beneficiarioNombreInput = document.getElementById('beneficiarioNombre');
  const beneficiarioParentescoInput = document.getElementById('beneficiarioParentesco');
  const beneficiarioPorcentajeInput = document.getElementById('beneficiarioPorcentaje');

  let plantillaActual = null; // {nombre, contenido}
  let empleadoSeleccionado = null; // objeto detalle empleado
  let beneficiarioSeleccionado = null; // {id_beneficiario, nombre_completo, parentesco, porcentaje}

  // Utilidades de formato de fecha
  const MESES_ES = [
    'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
    'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'
  ];

  function esFechaValidaParts(y, m, d) {
    const dt = new Date(y, m - 1, d);
    return dt && dt.getFullYear() === y && (dt.getMonth() + 1) === m && dt.getDate() === d;
  }

  function parseYMD(fechaStr) {
    if (!fechaStr) return null;
    // Espera formato "YYYY-MM-DD"
    const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(fechaStr.trim());
    if (!m) return null;
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    if (!esFechaValidaParts(y, mo, d)) return null;
    return { y, m: mo, d };
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function formatFechaDMY(fechaStr) {
    const p = parseYMD(fechaStr);
    if (!p) return (fechaStr || '').toString();
    return `${pad2(p.d)}/${pad2(p.m)}/${p.y}`;
  }

  function formatFechaLarga(fechaStr) {
    const p = parseYMD(fechaStr);
    if (!p) return (fechaStr || '').toString();
    const mes = MESES_ES[p.m - 1] || '';
    return `${pad2(p.d)} DE ${mes} DEL ${p.y}`;
  }

  // Convertir número a palabras (para año) en español, 0..9999
  function numeroALetrasEs(n) {
    n = parseInt(n, 10);
    if (isNaN(n) || n < 0 || n > 9999) return String(n);
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    function dosCifras(x) {
      if (x < 10) return unidades[x];
      if (x < 20) return especiales[x - 10];
      const d = Math.floor(x / 10), u = x % 10;
      if (d === 2) return u === 0 ? 'veinte' : 'veinti' + unidades[u];
      return u === 0 ? decenas[d] : decenas[d] + ' y ' + unidades[u];
    }

    function tresCifras(x) {
      if (x === 100) return 'cien';
      const c = Math.floor(x / 100), r = x % 100;
      const pref = c === 0 ? '' : centenas[c] + (r ? ' ' : '');
      return pref + (r ? dosCifras(r) : '');
    }

    const miles = Math.floor(n / 1000);
    const resto = n % 1000;
    let texto = '';
    if (miles > 0) {
      if (miles === 1) texto = 'mil';
      else texto = tresCifras(miles) + ' mil';
    }
    if (resto > 0) texto += (texto ? ' ' : '') + tresCifras(resto);
    return texto || 'cero';
  }

  // Convierte horas numéricas a texto: 1 -> "una hora", 2 -> "dos horas"
  function formatHorasDescanso(valor) {
    if (valor == null || valor === '') return '';
    const n = parseInt(String(valor).trim(), 10);
    if (isNaN(n)) return '';
    if (n === 1) return 'una hora';
    const letras = numeroALetrasEs(n);
    return (letras ? letras : String(n)) + ' horas';
  }

  // Formato de fecha para contrato: "<u>20</u> DÍAS DEL MES DE <u>ENERO</u> DEL AÑO 2025"
  function formatFechaContrato(fechaStr, mode = 'clasico') {
    const p = parseYMD(fechaStr);
    if (!p) return '';
    const dia = p.d; // sin cero a la izquierda
    const mesNombre = (MESES_ES[p.m - 1] || '').toUpperCase();
    
    // Siempre usar el año en formato numérico
    return `<u>${dia}</u> DÍAS DEL MES DE <u>${mesNombre}</u> DEL AÑO ${p.y}`;
  }

  function formatFechaRecibo(fechaStr) {
    const p = parseYMD(fechaStr);
    if (!p) return '';
    const dia2 = pad2(p.d);
    const mesNombre = (MESES_ES[p.m - 1] || '').toUpperCase();
    return `<u>${dia2}</u> DE <u>${mesNombre}</u> DEL <u>${p.y}</u>`;
  }

  // Formato: "<u>DD</u> de mes del YYYY" (mes en minúsculas, día subrayado)
  function formatFechaPeriodo(fechaStr) {
    const p = parseYMD(fechaStr);
    if (!p) return '';
    const dia2 = pad2(p.d);
    const mesNombreMin = (MESES_ES[p.m - 1] || '').toLowerCase();
    return `<u>${dia2}</u> de ${mesNombreMin} del ${p.y}`;
  }

  // Combina dos fechas de periodo: "<u>DD</u> de mes del YYYY al <u>DD</u> de mes del YYYY"
  function formatPeriodoPrueba(inicioStr, finStr) {
    const ini = formatFechaPeriodo(inicioStr);
    const fin = formatFechaPeriodo(finStr);
    if (ini && fin) return `${ini} al ${fin}`;
    return ini || fin || '';
  }

  // Formatear tiempo de HH:MM a "HH:MM"
  function formatTime(timeStr) {
    if (!timeStr) return '';
    // Formato de entrada: HH:MM (formato 24 horas)
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const hours = parts[0];
      const minutes = parts[1];
      return `${hours}:${minutes}`;
    }
    return timeStr;
  }

  // Subrayar únicamente los números de una hora "HH:MM" => "<u>HH</u>:<u>MM</u>"
  function underlineTime(timeStr) {
    const base = formatTime(timeStr);
    const m = /^(\d{1,2}):(\d{2})$/.exec(base);
    if (!m) return base;
    const hh = m[1];
    const mm = m[2];
    return `<u>${hh}</u>:<u>${mm}</u>`;
  }

  // Formatear tiempo para mostrar en formato "HH:MM a las HH:MM" con números subrayados
  function formatTimeRange(start, end) {
    if (!start || !end) return '';
    
    // Convertir tiempo a formato con am para la mañana
    function formatTimeWithAm(timeStr) {
      if (!timeStr) return '';
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        let hours = parseInt(parts[0]);
        const minutes = parts[1];
        
        // Para horas de la mañana (0-11), mostramos con "am"
        if (hours < 12) {
          // Convertir 0 horas a 12
          if (hours === 0) hours = 12;
          return `${hours}:${minutes} am`;
        } 
        // Para horas de la tarde (12-23), mostramos sin "pm"
        else {
          return `${hours}:${minutes}`;
        }
      }
      return timeStr;
    }
    
    const startTime = formatTimeWithAm(start);
    const endTime = formatTimeWithAm(end);
    
    return `${startTime} a ${endTime}`;
  }

  // Formatear tiempo para mostrar en formato "HH:MM a las HH:MM" (para comida) con números subrayados
  function formatTimeRangeComida(start, end) {
    if (!start || !end) return '';
    
    // Convertir tiempo a formato con am para la mañana
    function formatTimeWithAm(timeStr) {
      if (!timeStr) return '';
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        let hours = parseInt(parts[0]);
        const minutes = parts[1];
        
        // Para horas de la mañana (0-11), mostramos con "am"
        if (hours < 12) {
          // Convertir 0 horas a 12
          if (hours === 0) hours = 12;
          return `${hours}:${minutes} am`;
        } 
        // Para horas de la tarde (12-23), mostramos sin "pm"
        else {
          return `${hours}:${minutes}`;
        }
      }
      return timeStr;
    }
    
    const startTime = formatTimeWithAm(start);
    const endTime = formatTimeWithAm(end);
    
    // Para el horario de comida, usamos "a las" entre horas
    return `${startTime} a las ${endTime}`;
  }

  // Formatear tiempo para mostrar en formato "HH:MM a HH:MM" (para sábado) con números subrayados
  function formatTimeRangeSabado(start, end) {
    if (!start || !end) return '';
    
    // Convertir tiempo a formato con am para la mañana
    function formatTimeWithAm(timeStr) {
      if (!timeStr) return '';
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        let hours = parseInt(parts[0]);
        const minutes = parts[1];
        
        // Para horas de la mañana (0-11), mostramos con "am"
        if (hours < 12) {
          // Convertir 0 horas a 12
          if (hours === 0) hours = 12;
          return `${hours}:${minutes} am`;
        } 
        // Para horas de la tarde (12-23), mostramos sin "pm"
        else {
          return `${hours}:${minutes}`;
        }
      }
      return timeStr;
    }
    
    const startTime = formatTimeWithAm(start);
    const endTime = formatTimeWithAm(end);
    
    return `${startTime} a ${endTime}`;
  }

  // Formatear salario con símbolo de pesos
  function formatSalario(salario) {
    if (!salario) return '';
    // Convertir a número y formatear con 2 decimales
    const num = parseFloat(salario);
    if (isNaN(num)) return '';
    // Formatear con comas para miles y 2 decimales
    return '$' + num.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Normalizar cadena monetaria: quitar símbolos y dejar solo dígitos y punto
  function normalizeMoney(value) {
    if (value == null) return '';
    const s = String(value).replace(/[^0-9.]/g, '');
    return s;
  }

  // Calcula artículo definido por sexo: 'EL' o 'LA'
  function obtenerArticuloPorSexo(sexoRaw) {
    if (!sexoRaw) return 'EL';
    const s = ('' + sexoRaw).trim().toUpperCase();
    // Heurísticas comunes: FEMENINO/MUJER/F -> LA, MASCULINO/HOMBRE/M -> EL
    if (s.startsWith('F') || s.includes('FEM') || s.includes('MUJ') || s.includes('WOM')) return 'LA';
    if (s.startsWith('M') || s.includes('MAS') || s.includes('HOM') || s.includes('VAR') || s.includes('MAN')) return 'EL';
    // También contemplar 'H' de HOMBRE directamente
    if (s.startsWith('H')) return 'EL';
    return 'EL';
  }

  // Calcula nacionalidad por sexo: 'mexicano' o 'mexicana'
  function obtenerNacionalidad(sexoRaw) {
    if (!sexoRaw) return 'MEXICANO';
    const s = ('' + sexoRaw).trim().toUpperCase();
    // Heurísticas comunes: FEMENINO/MUJER/F -> mexicana, MASCULINO/HOMBRE/M -> mexicano
    if (s.startsWith('F') || s.includes('FEM') || s.includes('MUJ') || s.includes('WOM')) return 'MEXICANA';
    if (s.startsWith('M') || s.includes('MAS') || s.includes('HOM') || s.includes('VAR') || s.includes('MAN')) return 'MEXICANO';
    // También contemplar 'H' de HOMBRE directamente
    if (s.startsWith('H')) return 'MEXICANO';
    return 'MEXICANA';
  }

  // Calcula estado civil por sexo: ajusta género según el sexo del empleado
  function obtenerEstadoCivilPorSexo(estadoCivil, sexoRaw) {
    console.log('obtenerEstadoCivilPorSexo llamada con:', { estadoCivil, sexoRaw });
    
    if (!estadoCivil) return '';
    
    // Convertir a mayúsculas para comparación
    const estado = estadoCivil.toString().toUpperCase().trim();
    const sexo = sexoRaw ? sexoRaw.toString().trim().toUpperCase() : '';
    
    // Verificar si es mujer (FEMENINO/MUJER/F)
    const esMujer = sexo === 'F' || sexo.startsWith('F') || sexo.includes('FEM') || sexo.includes('MUJ') || sexo.includes('WOM');
    
    console.log('Análisis de género:', { estado, sexo, esMujer });
    
    // Si no es mujer, devolver el valor tal cual
    if (!esMujer) {
      console.log('Devuelto estado civil masculino:', estado);
      return estado;
    }
    
    // Ajustar según el estado civil
    let resultado = estado;
    switch (estado) {
      case 'SOLTERO(A)':
        resultado = 'SOLTERA';
        break;
      case 'CASADO(A)':
        resultado = 'CASADA';
        break;
      case 'VIUDO(A)':
        resultado = 'VIUDA';
        break;
      case 'DIVORCIADO(A)':
        resultado = 'DIVORCIADA';
        break;
      // Para 'UNIÓN LIBRE' no se cambia ya que es neutro
      case 'UNIÓN LIBRE':
        resultado = 'UNIÓN LIBRE';
        break;
      // También manejar versiones sin paréntesis
      case 'SOLTERO':
        resultado = 'SOLTERA';
        break;
      case 'CASADO':
        resultado = 'CASADA';
        break;
      case 'VIUDO':
        resultado = 'VIUDA';
        break;
      case 'DIVORCIADO':
        resultado = 'DIVORCIADA';
        break;
      default:
        // Si ya tiene la forma femenina, devolver tal cual
        if (estado.includes('SOLTERA') || estado.includes('CASADA') || estado.includes('VIUDA') || 
            estado.includes('DIVORCIADA') || estado.includes('SEPARADA')) {
          resultado = estado;
        }
        // Para cualquier otro caso, devolver el valor original
        break;
    }
    
    console.log('Devuelto estado civil femenino:', resultado);
    return resultado;
  }

  // Verificar si hay parámetros en la URL
  function verificarParametrosUrl() {
    if (window.parametrosUrl) {
      const { empleadoId, empleadoClave, plantillaNombre } = window.parametrosUrl;
      if (empleadoId && empleadoClave) {
        cargarEmpleadoDetalle(empleadoId, empleadoClave);
      }
      
      if (plantillaNombre) {
        cargarPlantilla(plantillaNombre);
      }
    }
  }

  function cargarPlantilla(nombre) {
    if (!nombre) { 
      plantillaActual = null;
      mostrarTodosCampos(); // Mostrar todos si no hay plantilla
      return;
    }
    fetch(API_PLANTILLAS + '?accion=obtener&nombre=' + encodeURIComponent(nombre))
      .then(r => r.json())
      .then(res => {
        if (!res.ok) throw new Error(res.error || 'No se pudo obtener');
        plantillaActual = res.data;
        // Detectar placeholders y filtrar campos
        setTimeout(() => {
          detectarYFiltrarCampos(res.data.contenido);
        }, 100);
      })
      .catch(err => {
        console.error('Error al cargar plantilla:', err);
        mostrarTodosCampos();
      });
  }

  // Mapeo de placeholders a selectores CSS de campos
  const PLACEHOLDER_MAP = {
    'estado_civil': '#estadoCivil',
    'rfc_empleado': '#rfcEmpleado',
    'descripcion_puesto': '#descripcionPuesto',
    'direccion_puesto': '#direccionPuesto',
    'tipo_recibo': '#tipoRecibo',
    'fecha_recibo': '#fechaRecibo',
    'fecha_contrato': '#fechaContrato, #formatoFechaContrato',
    'FECHA_CONTRATO': '#fechaContrato, #formatoFechaContrato',
    'tipo_contrato': '#tipoContrato',
    'salario_semanal': '#salarioSemanal',
    'SALARIO_SEMANAL': '#salarioSemanal',
    'sueldo': '#sueldo',
    'salario_diario': '#salarioDiario',
    'periodicidad_pago': '#periodicidadPago',
    'dia_pago': '#diaPago',
    'inicio_labores': '#inicioLabores',
    'INICIO_LABORES': '#inicioLabores',
    'periodo_prueba_inicio': '#periodoPruebaInicio',
    'PERIODO_PRUEBA_INICIO': '#periodoPruebaInicio',
    'periodo_prueba_fin': '#periodoPruebaFin',
    'PERIODO_PRUEBA_FIN': '#periodoPruebaFin',
    'PERIODO_PRUEBA': '#periodoPruebaInicio, #periodoPruebaFin',
    'horario_laboral': '#laboralHorariosContainer, #agregarHorarioLaboral',
    'HORARIO_LABORAL': '#laboralHorariosContainer, #agregarHorarioLaboral',
    'horario_comida': '#comidaHorariosContainer, #agregarHorarioComida',
    'HORARIO_COMIDA': '#comidaHorariosContainer, #agregarHorarioComida',
    'horario_sabado': '#sabadoEntrada, #sabadoSalida',
    'HORARIO_SABADO': '#sabadoEntrada, #sabadoSalida',
    'horario_prestaciones': '#prestacionesEntrada, #prestacionesSalida',
    'HORARIO_PRESTACIONES': '#prestacionesEntrada, #prestacionesSalida',
    'horas_descanso': '#horasDescanso',
    'HORAS_DESCANSO': '#horasDescanso',
    'duracion_jornada': '#duracionJornada',
    'DURACION_JORNADA': '#duracionJornada',
    'dias_descanso': '#diasDescanso',
    'DIAS_DESCANSO': '#diasDescanso',
    'horario_turno': '#turnoHorariosContainer, #agregarHorarioTurno',
    'HORARIO_TURNO': '#turnoHorariosContainer, #agregarHorarioTurno'
  };

  function detectarYFiltrarCampos(contenido) {
    if (!contenido) {
      mostrarTodosCampos();
      return;
    }

    // Extraer placeholders del contenido
    const regex = /{{\s*([a-zA-Z_]+)\s*}}/g;
    const placeholders = new Set();
    let match;
    
    while ((match = regex.exec(contenido)) !== null) {
      placeholders.add(match[1]);
    }

    console.log('Placeholders encontrados:', Array.from(placeholders));

    // Primero ocultar todos los campos opcionales
    Object.values(PLACEHOLDER_MAP).forEach(selector => {
      const campos = document.querySelectorAll(selector);
      campos.forEach(campo => {
        const col = campo.closest('[class*="col-"]');
        if (col) col.style.display = 'none';
      });
    });

    // Mostrar solo los campos que tienen placeholder
    placeholders.forEach(ph => {
      const selector = PLACEHOLDER_MAP[ph];
      if (selector) {
        const campos = document.querySelectorAll(selector);
        campos.forEach(campo => {
          const col = campo.closest('[class*="col-"]');
          if (col) col.style.display = '';
        });
      }
    });

    // Ocultar secciones vacías
    ocultarSeccionesVacias();
    
    console.log(`Formulario filtrado: ${placeholders.size} placeholders activos`);
  }

  function mostrarTodosCampos() {
    // Mostrar todos los campos
    const allCols = document.querySelectorAll('#formDatosContrato [class*="col-"]');
    allCols.forEach(col => {
      col.style.display = '';
    });
    
    // Mostrar todas las secciones
    const secciones = document.querySelectorAll('.form-section');
    secciones.forEach(sec => {
      sec.style.display = '';
    });
  }

  function ocultarSeccionesVacias() {
    const secciones = document.querySelectorAll('.form-section');
    secciones.forEach(seccion => {
      const colsVisibles = Array.from(seccion.querySelectorAll('[class*="col-"]'))
        .filter(col => col.style.display !== 'none');
      
      if (colsVisibles.length === 0) {
        seccion.style.display = 'none';
      } else {
        seccion.style.display = '';
      }
    });
  }

  function cargarEmpleadoDetalle(id, clave) {
    if (!id || !clave) { empleadoSeleccionado = null; return; }
    const fd = new FormData();
    fd.append('accion', 'dataEmpleado');
    fd.append('id_empleado', id);
    fd.append('clave_empleado', clave);
    fetch(API_EMPLEADOS, { method: 'POST', body: fd })
      .then(r => r.json())
      .then(res => {
        empleadoSeleccionado = res || null;
        // Rellenar el formulario con los datos del empleado
        rellenarFormularioEmpleado(res);
        poblarBeneficiarios(res);
      })
      .catch(err => console.error('Error al cargar datos del empleado:', err));
  }

  // Rellenar el formulario con los datos del empleado
  function rellenarFormularioEmpleado(datos) {
    if (!datos) return;
    
    // Función auxiliar para llenar campo y marcar como autocompletado
    function llenarCampo(id, valor) {
      const campo = document.getElementById(id);
      if (campo && valor) {
        campo.value = valor;
        campo.classList.add('auto-filled');
      }
    }
    
    // Datos del trabajador
    llenarCampo('nombreTrabajador', 
      `${datos.nombre_empleado || ''} ${datos.apellido_paterno_empleado || ''} ${datos.apellido_materno_empleado || ''}`.trim());
    
    llenarCampo('fechaNacimiento', datos.fecha_nacimiento || '');
    
    // Calcular edad si hay fecha de nacimiento
    if (datos.fecha_nacimiento) {
      const fechaNac = new Date(datos.fecha_nacimiento);
      const hoy = new Date();
      const edad = Math.floor((hoy - fechaNac) / (365.25 * 24 * 60 * 60 * 1000));
      if (edad > 0) {
        llenarCampo('edad', edad);
      }
    }
    
    // Mostrar fecha de ingreso si está disponible
    if (datos.fecha_ingreso) {
      llenarCampo('fechaIngreso', datos.fecha_ingreso);
    }
    
    llenarCampo('curp', datos.curp || '');
    // Seleccionar estado civil y ajustar etiquetas del <select> según sexo
    (function(){
      const estadoCivilSelect = document.getElementById('estadoCivil');
      if (!estadoCivilSelect) return;

      // Ajustar etiquetas visibles quitando "(a)" según sexo
      const sexoRaw = (datos.sexo || '').toString().trim().toUpperCase();
      const esMujer = sexoRaw === 'F' || sexoRaw.startsWith('F') || sexoRaw.includes('FEM') || sexoRaw.includes('MUJ') || sexoRaw.includes('WOM');
      const labelsHombre = {
        'Soltero(a)': 'Soltero',
        'Casado(a)': 'Casado',
        'Viudo(a)': 'Viudo',
        'Divorciado(a)': 'Divorciado',
        'Unión Libre': 'Unión Libre',
        'Separado(a)': 'Separado'
      };
      const labelsMujer = {
        'Soltero(a)': 'Soltera',
        'Casado(a)': 'Casada',
        'Viudo(a)': 'Viuda',
        'Divorciado(a)': 'Divorciada',
        'Unión Libre': 'Unión Libre',
        'Separado(a)': 'Separada'
      };
      const labels = esMujer ? labelsMujer : labelsHombre;
      for (let i = 0; i < estadoCivilSelect.options.length; i++) {
        const opt = estadoCivilSelect.options[i];
        if (labels[opt.value]) {
          opt.text = labels[opt.value];
        }
      }

      // Selección automática con el valor que viene de BD
      const raw = (datos.estado_civil || '').toString().trim();
      if (!raw) return;

      // Mapeo de variantes comunes (mayúsculas, sin acentos, femenino/masculino) a los valores del select
      const mapa = {
        'SOLTERO(A)': 'Soltero(a)',
        'SOLTERO': 'Soltero(a)',
        'SOLTERA': 'Soltero(a)',
        'CASADO(A)': 'Casado(a)',
        'CASADO': 'Casado(a)',
        'CASADA': 'Casado(a)',
        'VIUDO(A)': 'Viudo(a)',
        'VIUDO': 'Viudo(a)',
        'VIUDA': 'Viudo(a)',
        'DIVORCIADO(A)': 'Divorciado(a)',
        'DIVORCIADO': 'Divorciado(a)',
        'DIVORCIADA': 'Divorciado(a)',
        'UNION LIBRE': 'Unión Libre',
        'UNION_LIBRE': 'Unión Libre',
        'UNIÓN LIBRE': 'Unión Libre',
        'SEPARADO(A)': 'Separado(a)',
        'SEPARADO': 'Separado(a)',
        'SEPARADA': 'Separado(a)'
      };

      // Normalizar: quitar acentos para comparar y pasar a mayúsculas
      const upperNoAccent = raw.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();
      let valorSeleccion = mapa[upperNoAccent] || raw;

      // Buscar opción que coincida ignorando mayúsculas/acentos
      let elegido = false;
      for (let i = 0; i < estadoCivilSelect.options.length; i++) {
        const optVal = estadoCivilSelect.options[i].value;
        const optCmp = optVal.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        const valCmp = valorSeleccion.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        if (optCmp === valCmp) {
          estadoCivilSelect.selectedIndex = i;
          elegido = true;
          break;
        }
      }
      if (!elegido) {
        // Si no coincide con ninguna opción, dejar en "Seleccione" (vacío)
        estadoCivilSelect.value = '';
      }
      estadoCivilSelect.classList.add('auto-filled');
    })();
    llenarCampo('rfcEmpleado', datos.rfc_empleado || '');
    llenarCampo('domicilioTrabajador', datos.domicilio_empleado || '');
    llenarCampo('puestoTrabajador', datos.nombre_puesto || '');
    llenarCampo('direccionPuesto', datos.direccion_puesto || '');
    
    // Datos de la empresa
    llenarCampo('nombreEmpresa', datos.nombre_empresa || '');
    llenarCampo('rfcEmpresa', datos.rfc_empresa || '');
    llenarCampo('domicilioFiscal', datos.domicilio_fiscal || '');
  }

  function nombreCompletoBeneficiario(b) {
    if (!b) return '';
    const partes = [b.nombre_beneficiario || '', b.apellido_paterno_beneficiario || '', b.apellido_materno_beneficiario || ''];
    return partes.join(' ').replace(/\s+/g, ' ').trim();
  }

  function poblarBeneficiarios(datos) {
    // Limpiar select/inputs si existen
    if (selectBeneficiario) selectBeneficiario.innerHTML = '<option value="">-- Sin beneficiario --</option>';
    beneficiarioSeleccionado = null;
    if (beneficiarioNombreInput) beneficiarioNombreInput.value = '';
    if (beneficiarioParentescoInput) beneficiarioParentescoInput.value = '';
    if (beneficiarioPorcentajeInput) beneficiarioPorcentajeInput.value = '';

    const lista = (datos && Array.isArray(datos.beneficiarios)) ? datos.beneficiarios.slice(0, 5) : [];
    if (lista.length === 0) return;

    // Agregar opciones al select si existe
    if (selectBeneficiario) {
      lista.forEach((b, idx) => {
        const opt = document.createElement('option');
        opt.value = String(b.id_beneficiario);
        const txtPct = (b.porcentaje != null && b.porcentaje !== '') ? ` - ${b.porcentaje}%` : '';
        opt.textContent = `${nombreCompletoBeneficiario(b)}${b.parentesco ? ' (' + b.parentesco + ')' : ''}${txtPct}`;
        // Guardar datos en dataset
        opt.dataset.nombre = nombreCompletoBeneficiario(b);
        opt.dataset.parentesco = b.parentesco || '';
        opt.dataset.porcentaje = (b.porcentaje != null && b.porcentaje !== '') ? String(b.porcentaje) : '';
        selectBeneficiario.appendChild(opt);
      });
    }

    // Preseleccionar el primero
    if (selectBeneficiario && selectBeneficiario.options.length > 1) {
      selectBeneficiario.selectedIndex = 1; // primera opción real
      actualizarCamposBeneficiarioDesdeSelect();
    } else if (!selectBeneficiario) {
      // Si no hay select en la UI, rellenar directamente los inputs con el primer beneficiario
      const b0 = lista[0];
      if (b0) {
        const nombre = nombreCompletoBeneficiario(b0);
        const parentesco = b0.parentesco || '';
        const porcentaje = (b0.porcentaje != null && b0.porcentaje !== '') ? String(b0.porcentaje) : '';
        if (beneficiarioNombreInput) beneficiarioNombreInput.value = nombre;
        if (beneficiarioParentescoInput) beneficiarioParentescoInput.value = parentesco;
        if (beneficiarioPorcentajeInput) beneficiarioPorcentajeInput.value = porcentaje ? (porcentaje + '%') : '';
      }
    }

    // Renderizar lista visual de beneficiarios (máx. 5)
    const listaUi = document.getElementById('beneficiariosLista');
    if (listaUi) {
      listaUi.innerHTML = '';
      lista.forEach((b, i) => {
        const li = document.createElement('div');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        const nombre = nombreCompletoBeneficiario(b);
        const parentesco = b.parentesco || '';
        const pct = (b.porcentaje != null && b.porcentaje !== '') ? `${b.porcentaje}%` : '';
        li.innerHTML = `<span>${i + 1}. ${nombre}</span><span class="text-muted">${parentesco}${pct ? ' · ' + pct : ''}</span>`;
        listaUi.appendChild(li);
      });
    }
  }

  function actualizarCamposBeneficiarioDesdeSelect() {
    if (!selectBeneficiario) return;
    const opt = selectBeneficiario.selectedOptions && selectBeneficiario.selectedOptions[0];
    if (!opt || !opt.value) {
      beneficiarioSeleccionado = null;
      if (beneficiarioNombreInput) beneficiarioNombreInput.value = '';
      if (beneficiarioParentescoInput) beneficiarioParentescoInput.value = '';
      if (beneficiarioPorcentajeInput) beneficiarioPorcentajeInput.value = '';
      return;
    }
    const nombre = opt.dataset.nombre || opt.textContent || '';
    const parentesco = opt.dataset.parentesco || '';
    const porcentaje = opt.dataset.porcentaje || '';
    beneficiarioSeleccionado = {
      id_beneficiario: parseInt(opt.value, 10),
      nombre,
      parentesco,
      porcentaje
    };
    if (beneficiarioNombreInput) beneficiarioNombreInput.value = nombre;
    if (beneficiarioParentescoInput) beneficiarioParentescoInput.value = parentesco;
    if (beneficiarioPorcentajeInput) beneficiarioPorcentajeInput.value = porcentaje ? (porcentaje + '%') : '';
  }

  // Recopilar datos del formulario
  function recopilarDatosFormulario() {
    const datos = {};
    
    // Datos de la empresa
    datos.empresa = document.getElementById('nombreEmpresa').value;
    datos.rfc_empresa = document.getElementById('rfcEmpresa').value;
    datos.domicilio_fiscal = document.getElementById('domicilioFiscal').value;
    
    // Datos del trabajador
    datos.nombre_trabajador = document.getElementById('nombreTrabajador').value;
    datos.sexo = empleadoSeleccionado ? empleadoSeleccionado.sexo : ''; // Obtener sexo de la BD
    datos.fecha_nacimiento = document.getElementById('fechaNacimiento').value;
    datos.edad = document.getElementById('edad').value;
    datos.estado_civil = document.getElementById('estadoCivil').value;
    datos.curp = document.getElementById('curp').value;
    datos.rfc_empleado = document.getElementById('rfcEmpleado') ? document.getElementById('rfcEmpleado').value : '';
    datos.domicilio_trabajador = document.getElementById('domicilioTrabajador').value;
    // Fecha de ingreso (solo lectura, se obtiene de la base de datos)
    datos.fecha_ingreso = document.getElementById('fechaIngreso').value;
    
    // Datos del puesto
    datos.puesto_trabajador = document.getElementById('puestoTrabajador').value;
    datos.direccion_puesto = document.getElementById('direccionPuesto').value;
    datos.descripcion_puesto = document.getElementById('descripcionPuesto') ? document.getElementById('descripcionPuesto').value : '';
    
    // Datos de recibo y contrato
    datos.tipo_recibo = document.getElementById('tipoRecibo').value;
    datos.fecha_recibo = document.getElementById('fechaRecibo').value;
    datos.fecha_contrato = document.getElementById('fechaContrato') ? document.getElementById('fechaContrato').value : '';
    datos.formato_fecha_contrato = document.getElementById('formatoFechaContrato') ? document.getElementById('formatoFechaContrato').value : 'clasico';
    datos.salario_semanal = document.getElementById('salarioSemanal').value;
    // Nuevos campos de pago (guardar valor numérico sin símbolos)
    datos.sueldo = document.getElementById('sueldo') ? normalizeMoney(document.getElementById('sueldo').value) : '';
    datos.salario_diario = document.getElementById('salarioDiario') ? normalizeMoney(document.getElementById('salarioDiario').value) : '';
    datos.periodicidad_pago = document.getElementById('periodicidadPago') ? document.getElementById('periodicidadPago').value : '';
    datos.dia_pago = document.getElementById('diaPago') ? document.getElementById('diaPago').value : '';
    datos.tipo_contrato = document.getElementById('tipoContrato').value;
    
    // Nuevos datos solicitados
    datos.inicio_labores = document.getElementById('inicioLabores').value;
    datos.dias_descanso = document.getElementById('diasDescanso').value;
    // Periodo de prueba
    datos.periodo_prueba_inicio = document.getElementById('periodoPruebaInicio') ? document.getElementById('periodoPruebaInicio').value : '';
    datos.periodo_prueba_fin = document.getElementById('periodoPruebaFin') ? document.getElementById('periodoPruebaFin').value : '';
    
    // Formatear horarios laborales: soportar múltiples rangos en el contenedor dinámico
    const contLaboral = document.getElementById('laboralHorariosContainer');
    if (contLaboral) {
      const entradasLab = contLaboral.querySelectorAll('.laboral-entrada');
      const salidasLab = contLaboral.querySelectorAll('.laboral-salida');
      const rangosLab = [];
      const nLab = Math.max(entradasLab.length, salidasLab.length);
      for (let i = 0; i < nLab; i++) {
        const ini = entradasLab[i] ? (entradasLab[i].value || '') : '';
        const fin = salidasLab[i] ? (salidasLab[i].value || '') : '';
        const rango = formatTimeRange(ini, fin);
        if (rango) rangosLab.push(rango);
      }
      datos.horario_laboral = rangosLab.join(', ');
    } else {
      // Fallback: un solo rango por si no existe contenedor
      datos.horario_laboral = formatTimeRange(
        document.getElementById('horarioEntrada').value,
        document.getElementById('horarioSalida').value
      );
    }
    
    // Horario de comida: soportar múltiples rangos en el contenedor dinámico
    const contComida = document.getElementById('comidaHorariosContainer');
    if (contComida) {
      const entradas = contComida.querySelectorAll('.comida-entrada');
      const salidas = contComida.querySelectorAll('.comida-salida');
      const rangos = [];
      const n = Math.max(entradas.length, salidas.length);
      for (let i = 0; i < n; i++) {
        const ini = entradas[i] ? (entradas[i].value || '') : '';
        const fin = salidas[i] ? (salidas[i].value || '') : '';
        const rango = formatTimeRangeComida(ini, fin);
        if (rango) rangos.push(rango);
      }
      datos.horario_comida = rangos.join(', ');
    } else {
      // Fallback antiguo por si no existe el contenedor
      const ce = document.getElementById('comidaEntrada');
      const cs = document.getElementById('comidaSalida');
      datos.horario_comida = (ce && cs) ? formatTimeRangeComida(ce.value, cs.value) : '';
    }
    
    // Horario de prestaciones (formato "HH:MM a las HH:MM" con números subrayados)
    {
      const pe = document.getElementById('prestacionesEntrada');
      const ps = document.getElementById('prestacionesSalida');
      if (pe && ps) {
        datos.horario_prestaciones = formatTimeRange(pe.value || '', ps.value || '');
      } else {
        datos.horario_prestaciones = '';
      }
    }

    // Horario de turno: soportar múltiples rangos en el contenedor dinámico
    const contTurno = document.getElementById('turnoHorariosContainer');
    if (contTurno) {
      const entradasTurno = contTurno.querySelectorAll('.turno-entrada');
      const salidasTurno = contTurno.querySelectorAll('.turno-salida');
      const rangosTurno = [];
      const nTurno = Math.max(entradasTurno.length, salidasTurno.length);
      for (let i = 0; i < nTurno; i++) {
        const ini = entradasTurno[i] ? (entradasTurno[i].value || '') : '';
        const fin = salidasTurno[i] ? (salidasTurno[i].value || '') : '';
        const rango = formatTimeRange(ini, fin);
        if (rango) rangosTurno.push(rango);
      }
      datos.horario_turno = rangosTurno.join(', ');
    }

    // Horas de descanso: número en formulario -> texto en español
    {
      const hd = document.getElementById('horasDescanso');
      const raw = hd ? hd.value : '';
      datos.horas_descanso = raw || '';
      datos.horas_descanso_texto = formatHorasDescanso(raw);
    }

    // Duración de la jornada (número tal cual)
    {
      const dj = document.getElementById('duracionJornada');
      datos.duracion_jornada = dj ? (dj.value || '') : '';
    }
    
    datos.horario_sabado = formatTimeRangeSabado(
      document.getElementById('sabadoEntrada').value,
      document.getElementById('sabadoSalida').value
    );
    // Beneficiario seleccionado (si hay). Edición local, no persiste en BD
    datos.beneficiario_id = selectBeneficiario ? (selectBeneficiario.value || '') : '';
    datos.beneficiario_nombre = beneficiarioNombreInput ? (beneficiarioNombreInput.value || '') : '';
    datos.beneficiario_parentesco = beneficiarioParentescoInput ? (beneficiarioParentescoInput.value || '') : '';
    datos.beneficiario_porcentaje = beneficiarioPorcentajeInput ? (beneficiarioPorcentajeInput.value || '').replace('%','').trim() : '';

    return datos;
  }

  // Generar vista previa del contrato
  function generarVistaPrevia() {
    if (!plantillaActual) {
      mostrarMensajePreview('No hay ninguna plantilla de contrato cargada.');
      return;
    }
    
    const datos = recopilarDatosFormulario();
    let html = plantillaActual.contenido;
    // Determinar artículo por sexo (formulario o datos de empleado)
    const articulo = obtenerArticuloPorSexo(datos.sexo || (empleadoSeleccionado && empleadoSeleccionado.sexo) || '');
    // Determinar nacionalidad por sexo (formulario o datos de empleado)
    const nacionalidad = obtenerNacionalidad(datos.sexo || (empleadoSeleccionado && empleadoSeleccionado.sexo) || '');
    
    // Mostrar en consola los datos para depuración
    console.log('Datos para generar vista previa:', {
      estado_civil: datos.estado_civil,
      sexo: datos.sexo,
      sexoEmpleadoSeleccionado: empleadoSeleccionado && empleadoSeleccionado.sexo
    });
    
    // Reemplazar placeholders con los datos del formulario
    html = html.replace(/{{\s*empresa\s*}}/g, (datos.empresa || '').toUpperCase());
    html = html.replace(/{{\s*nombre_empresa\s*}}/g, (datos.empresa || '').toUpperCase());
    html = html.replace(/{{\s*rfc_empresa\s*}}/g, (datos.rfc_empresa || '').toUpperCase());
    html = html.replace(/{{\s*domicilio_fiscal\s*}}/g, (datos.domicilio_fiscal || '').toUpperCase());
    html = html.replace(/{{\s*nombre_trabajador\s*}}/g, (datos.nombre_trabajador || '').toUpperCase());
    html = html.replace(/{{\s*sexo\s*}}/g, (datos.sexo || '').toUpperCase());
    html = html.replace(/{{\s*fecha_nacimiento\s*}}/g, formatFechaDMY(datos.fecha_nacimiento || ''));
    html = html.replace(/{{\s*edad\s*}}/g, (datos.edad || '').toUpperCase());
    // Ajustar estado civil según el sexo del empleado
    const sexoEmpleado = datos.sexo || (empleadoSeleccionado && empleadoSeleccionado.sexo) || '';
    const estadoCivilAjustado = obtenerEstadoCivilPorSexo(datos.estado_civil, sexoEmpleado);
    html = html.replace(/{{\s*estado_civil\s*}}/g, estadoCivilAjustado.toUpperCase());
    html = html.replace(/{{\s*curp\s*}}/g, (datos.curp || '').toUpperCase());
    html = html.replace(/{{\s*rfc_empleado\s*}}/g, (datos.rfc_empleado || '').toUpperCase());
    html = html.replace(/{{\s*domicilio_trabajador\s*}}/g, (datos.domicilio_trabajador || '').toUpperCase());
    html = html.replace(/{{\s*puesto_trabajador\s*}}/g, (datos.puesto_trabajador || '').toUpperCase());
    html = html.replace(/{{\s*direccion_puesto\s*}}/g, (datos.direccion_puesto || '').toUpperCase());
    html = html.replace(/{{\s*descripcion_puesto\s*}}/g, (datos.descripcion_puesto || '').toUpperCase());
    html = html.replace(/{{\s*tipo_recibo\s*}}/g, (datos.tipo_recibo || '').toUpperCase());
    html = html.replace(/{{\s*fecha_recibo\s*}}/g, formatFechaRecibo(datos.fecha_recibo || ''));
    // FECHA_CONTRATO con modo seleccionado en el formulario (con HTML)
    html = html.replace(/{{\s*FECHA_CONTRATO\s*}}/g, formatFechaContrato(datos.fecha_contrato || '', datos.formato_fecha_contrato || 'clasico'));
    html = html.replace(/{{\s*tipo_contrato\s*}}/g, (datos.tipo_contrato || '').toUpperCase());
    // Reemplazo de artículo (para uso en cualquier parte de la plantilla)
    html = html.replace(/{\{\s*articulo\s*\}\}/g, articulo);
    // Reemplazo de nacionalidad (para uso en cualquier parte de la plantilla)
    html = html.replace(/{\{\s*nacionalidad\s*\}\}/g, nacionalidad);
    
    // Reemplazo de nuevos placeholders
    html = html.replace(/{{\s*SALARIO_SEMANAL\s*}}/g, formatSalario(datos.salario_semanal));
    html = html.replace(/{{\s*sueldo\s*}}/g, formatSalario(datos.sueldo));
    html = html.replace(/{{\s*salario_diario\s*}}/g, formatSalario(datos.salario_diario));
    html = html.replace(/{{\s*periodicidad_pago\s*}}/g, (datos.periodicidad_pago || ''));
    html = html.replace(/{{\s*dia_pago\s*}}/g, (datos.dia_pago || ''));
    html = html.replace(/{{\s*INICIO_LABORES\s*}}/g, formatFechaDMY(datos.inicio_labores || ''));
    // Periodo de prueba
    html = html.replace(/{{\s*PERIODO_PRUEBA\s*}}/g, formatPeriodoPrueba(datos.periodo_prueba_inicio || '', datos.periodo_prueba_fin || ''));
    html = html.replace(/{{\s*PERIODO_PRUEBA_INICIO\s*}}/g, formatFechaPeriodo(datos.periodo_prueba_inicio || ''));
    html = html.replace(/{{\s*PERIODO_PRUEBA_FIN\s*}}/g, formatFechaPeriodo(datos.periodo_prueba_fin || ''));
    // Reemplazo secuencial para HORARIO_LABORAL: cada aparición toma el siguiente rango
    {
      const hlList = (datos.horario_laboral || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      let hlIndex = 0;
      // Si solo hay un placeholder en el template, mostrar todos los horarios
      // Si hay múltiples placeholders, mostrar uno por uno (secuencial)
      html = html.replace(/{{\s*HORARIO_LABORAL\s*}}/g, (match) => {
        // Contar cuántos placeholders hay en el HTML
        const allMatches = html.match(/{{\s*HORARIO_LABORAL\s*}}/g);
        const totalMatches = allMatches ? allMatches.length : 0;
        
        if (hlList.length === 0) return '';
        
        // MODIFICACIÓN: Siempre mostrar todos los horarios con el formato solicitado
        // Formato: "de las 09:00 a las 18:00 horas" para un solo horario
        // Formato: "de las 09:00 a las 18:00 horas y de las 09:00 a las 18:00 horas" para múltiples horarios
        if (hlList.length === 1) {
          // Para un solo horario: "de las 09:00 a las 18:00 horas"
          return 'de las ' + hlList[0].replace(' a ', ' a las ') + ' horas';
        } else {
          // Para múltiples horarios: "de las 09:00 a las 18:00 horas y de las 09:00 a las 18:00 horas"
          return hlList.map((horario, index) => {
            const formatted = horario.replace(' a ', ' a las ');
            return 'de las ' + formatted + ' horas';
          }).join(' y ');
        }
      });
    }
    // Reemplazo secuencial para HORARIO_COMIDA: cada aparición toma el siguiente rango
    {
      const hcList = (datos.horario_comida || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      let hcIndex = 0;
      // Si solo hay un placeholder en el template, mostrar todos los horarios
      // Si hay múltiples placeholders, mostrar uno por uno (secuencial)
      html = html.replace(/{{\s*HORARIO_COMIDA\s*}}/g, (match) => {
        // Contar cuántos placeholders hay en el HTML
        const allMatches = html.match(/{{\s*HORARIO_COMIDA\s*}}/g);
        const totalMatches = allMatches ? allMatches.length : 0;
        
        if (hcList.length === 0) return '';
        
        // MODIFICACIÓN: Siempre mostrar todos los horarios con el formato solicitado
        // Formato: "de las 09:00 a las 18:00" para un solo horario
        // Formato: "de las 09:00 a las 18:00 y de las 09:00 a las 18:00" para múltiples horarios
        if (hcList.length === 1) {
          // Para un solo horario: "de las 09:00 a las 18:00"
          return 'de las ' + hcList[0].replace(" a las ", " a ");
        } else {
          // Para múltiples horarios: "de las 09:00 a las 18:00 y de las 09:00 a las 18:00"
          return hcList.map((horario, index) => {
            const formatted = horario.replace(" a las ", " a ");
            return 'de las ' + formatted;
          }).join(' y ');
        }
      });
    }
    html = html.replace(/{{\s*HORARIO_SABADO\s*}}/g, datos.horario_sabado || '');
    // Horario de prestaciones
    html = html.replace(/{{\s*HORARIO_PRESTACIONES\s*}}/g, datos.horario_prestaciones || '');
    html = html.replace(/{{\s*horario_prestaciones\s*}}/g, datos.horario_prestaciones || '');
    // Horario de turno
    html = html.replace(/{{\s*HORARIO_TURNO\s*}}/g, (match) => {
      const turnoList = (datos.horario_turno || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      
      // Si no hay horarios, retornar vacío
      if (turnoList.length === 0) return '';
      
      // MODIFICACIÓN: Siempre mostrar todos los horarios con el formato solicitado
      // Formato: "de las 09:00 a las 18:00" para un solo horario
      // Formato: "de las 09:00 a las 18:00 y de las 09:00 a las 18:00" para múltiples horarios
      if (turnoList.length === 1) {
        // Para un solo horario: "de las 09:00 a las 18:00"
        return 'de las ' + turnoList[0].replace(' a ', ' a las ');
      } else {
        // Para múltiples horarios: "de las 09:00 a las 18:00 y de las 09:00 a las 18:00"
        return turnoList.map((horario, index) => {
          const formatted = horario.replace(' a ', ' a las ');
          return 'de las ' + formatted;
        }).join(' y ');
      }
    });
    html = html.replace(/{{\s*horario_turno\s*}}/g, datos.horario_turno || '');
    // Horas de descanso
    html = html.replace(/{{\s*HORAS_DESCANSO\s*}}/g, datos.horas_descanso_texto || '');
    html = html.replace(/{{\s*horas_descanso\s*}}/g, datos.horas_descanso_texto || '');
    // Duración de la jornada (número)
    html = html.replace(/{{\s*DURACION_JORNADA\s*}}/g, (datos.duracion_jornada || ''));
    html = html.replace(/{{\s*duracion_jornada\s*}}/g, (datos.duracion_jornada || ''));
    html = html.replace(/{{\s*DIAS_DESCANSO\s*}}/g, (datos.dias_descanso || '').toLowerCase());

    // Beneficiarios: reemplazo secuencial por ocurrencia (hasta 5). Soporta punto o guion.
    {
      let lista = [];
      if (empleadoSeleccionado && Array.isArray(empleadoSeleccionado.beneficiarios)) {
        lista = empleadoSeleccionado.beneficiarios.slice(0, 5).map(b => ({
          id: b.id_beneficiario,
          nombre: nombreCompletoBeneficiario(b),
          parentesco: b.parentesco || '',
          porcentaje: (b.porcentaje != null && b.porcentaje !== '') ? String(b.porcentaje) : ''
        }));
      }

      // Aplicar ediciones locales del formulario sobre la salida (sin tocar BD)
      // Si el usuario edita los campos, mostramos SOLO ese beneficiario editado para evitar duplicados.
      const hayEdicionLocal = (
        (datos.beneficiario_nombre && datos.beneficiario_nombre.trim() !== '') ||
        (datos.beneficiario_parentesco && datos.beneficiario_parentesco.trim() !== '') ||
        (datos.beneficiario_porcentaje && String(datos.beneficiario_porcentaje).trim() !== '')
      );
      if (hayEdicionLocal) {
        const nuevo = {
          id: null,
          nombre: datos.beneficiario_nombre || '',
          parentesco: datos.beneficiario_parentesco || '',
          porcentaje: datos.beneficiario_porcentaje || ''
        };
        lista = [nuevo];
      }

      let idxNombre = 0;
      let idxPar = 0;
      let idxPct = 0;
      const replNombre = () => {
        if (lista.length === 0) return '';
        if (idxNombre >= lista.length) return '';
        const val = (lista[idxNombre].nombre || '').toUpperCase();
        idxNombre++;
        return val;
      };
      const replPar = () => {
        if (lista.length === 0) return '';
        if (idxPar >= lista.length) return '';
        const val = (lista[idxPar].parentesco || '').toUpperCase();
        idxPar++;
        return val ? ("<strong>" + val + ":</strong>") : '';
      };
      const replPct = () => {
        if (lista.length === 0) return '';
        if (idxPct >= lista.length) return '';
        const raw = (lista[idxPct].porcentaje != null && lista[idxPct].porcentaje !== '')
          ? String(lista[idxPct].porcentaje)
          : '';
        idxPct++;
        return raw ? (raw + '%') : '';
      };
      // Nombre: {{beneficiario.nombre}} o {{beneficiario-nombre}}
      html = html.replace(/{{\s*beneficiario[\.-]nombre\s*}}/g, replNombre);
      // Parentesco: {{beneficiario.parentesco}} o {{beneficiario-parentesco}}
      html = html.replace(/{{\s*beneficiario[\.-]parentesco\s*}}/g, replPar);
      // Porcentaje: {{beneficiario.porcentaje}} o {{beneficiario-porcentaje}}
      html = html.replace(/{{\s*beneficiario[\.-]porcentaje\s*}}/g, replPct);
      // Lista completa: {{beneficiarios}} (toda la lista en una sola aparición)
      const listaRender = lista.map(it => {
        const nombre = (it.nombre || '').toUpperCase();
        const par = (it.parentesco || '').toUpperCase();
        const pct = (it.porcentaje != null && it.porcentaje !== '') ? (String(it.porcentaje) + '%') : '';
        const parHtml = par ? ("<strong>" + par + ":</strong>") : '';
        return [parHtml, nombre, pct].filter(Boolean).join(' ').trim();
      }).filter(Boolean).join('<br>');
      html = html.replace(/{{\s*beneficiarios\s*}}/g, listaRender);
    }
    
    // Si hay datos de empleado, también reemplazar esos placeholders
    if (empleadoSeleccionado) {
      html = html.replace(/{{\s*empleado\.nombre\s*}}/g, 
        `${empleadoSeleccionado.nombre_empleado || ''} ${empleadoSeleccionado.apellido_paterno_empleado || ''} ${empleadoSeleccionado.apellido_materno_empleado || ''}`.trim().toUpperCase());
      html = html.replace(/{{\s*empleado\.curp\s*}}/g, (empleadoSeleccionado.curp || '').toUpperCase());
      html = html.replace(/{{\s*empleado\.fecha_nacimiento\s*}}/g, formatFechaDMY(empleadoSeleccionado.fecha_nacimiento || ''));
      html = html.replace(/{{\s*empleado\.fecha_ingreso\s*}}/g, formatFechaDMY(empleadoSeleccionado.fecha_ingreso || ''));
      html = html.replace(/{{\s*empleado\.domicilio\s*}}/g, (empleadoSeleccionado.domicilio_empleado || '').toUpperCase());
      html = html.replace(/{{\s*empleado\.puesto\s*}}/g, (empleadoSeleccionado.nombre_puesto || '').toUpperCase());
      html = html.replace(/{{\s*empleado\.empresa\s*}}/g, (empleadoSeleccionado.nombre_empresa || '').toUpperCase());
    }
    // Mantener estilos de alineación y clases de Quill tal como vienen en la plantilla
    
    // Mostrar la vista previa
    if (previewContent) {
      previewContent.innerHTML = `
        <div class="a4-container">
          <div class="page">
            ${html}
          </div>
        </div>
      `;
      
      // PRESERVAR ESPACIOS MULTIPLES EN LA VISTA PREVIA
      // Asegurar que los espacios múltiples se mantengan visualmente
      const pageContent = previewContent.querySelector('.page');
      if (pageContent) {
        // Aplicar estilo CSS para preservar espacios en blanco
        pageContent.style.whiteSpace = 'pre-wrap';
      }
      
      // Habilitar botones de acción
      if (btnImprimir) btnImprimir.disabled = false;
      if (btnGuardarHtml) btnGuardarHtml.disabled = false;
      if (btnDescargarWord) btnDescargarWord.disabled = false;
    }
  }

  // Mostrar mensaje en el área de vista previa
  function mostrarMensajePreview(mensaje) {
    if (previewContent) {
      previewContent.innerHTML = `
        <div class="preview-placeholder">
          <i class="bi bi-info-circle"></i>
          <h5>Información</h5>
          <p class="mb-0">${mensaje}</p>
        </div>
      `;
    }
  }

  // Imprimir contrato
  function imprimirContrato() {
    const contenido = previewContent.querySelector('.a4-container');
    if (!contenido) { 
      alert('No hay contenido para imprimir'); 
      return; 
    }
    
    // Configurar nombre del archivo PDF
    const nombreArchivo = obtenerNombreArchivo();
    document.title = nombreArchivo; // El navegador usa el título para el nombre del PDF

    const htmlContent = contenido.innerHTML;

    // Crear iframe oculto para imprimir sin abrir nueva pestaña/ventana
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '100%';
    iframe.style.bottom = '100%';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    // Normalizar HTML para impresión (alineado con Word):
    // aplicar line-height 1.15 inline y márgenes uniformes
    let htmlForPrint = htmlContent;
    try {
      const tmp = document.createElement('div');
      tmp.innerHTML = htmlContent;
      tmp.querySelectorAll('p, div, li, td, th, h1, h2, h3, h4, h5, h6').forEach(el => {
        // Preservar el line-height existente o aplicar 1.15 por defecto
        if (!el.style.lineHeight || el.style.lineHeight === '') {
          el.style.lineHeight = '1.15';
        }
        // Asegurar propiedades específicas para impresión
        el.style.setProperty('mso-line-height-rule', 'exactly');
        
        if (el.tagName === 'P') {
          el.style.marginBottom = '12pt';
        }
        if (el.tagName === 'LI') {
          el.style.marginBottom = '6pt';
        }
      });
      htmlForPrint = tmp.innerHTML;
    } catch (_) { /* noop */ }

    // Obtener el ID de la empresa del empleado seleccionado
    let idEmpresa = 0;
    if (empleadoSeleccionado && empleadoSeleccionado.id_empresa) {
      idEmpresa = empleadoSeleccionado.id_empresa;
    }

    // Cargar la plantilla HTML desde el archivo externo, pasando el ID de la empresa
    fetch(`/sistema_saao/contratos/php/get_print_template.php?id_empresa=${idEmpresa}`)
      .then(response => response.text())
      .then(template => {
        // Reemplazar el marcador de contenido con el HTML real
        const finalHtml = template.replace('{{CONTENIDO}}', `
          ${htmlForPrint}
          <script>
            // Eliminar cualquier numeración de página existente
            function removePageNumbers() {
              // Eliminar elementos de numeración de página
              const pageNumbers = document.querySelectorAll('.page-number, .page-counter, .correct-page-number, .page-number-container');
              pageNumbers.forEach(el => {
                if (el.parentNode) {
                  el.parentNode.removeChild(el);
                }
              });
              
              // Eliminar estilos de numeración de página
              const pageStyles = document.querySelectorAll('style');
              pageStyles.forEach(style => {
                if (style.textContent.includes('page-number') || style.textContent.includes('page-counter')) {
                  style.remove();
                }
              });
            }
            
            // Ejecutar cuando el documento esté listo
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', removePageNumbers);
            } else {
              removePageNumbers();
            }
            
            // Forzar márgenes consistentes
            document.addEventListener('DOMContentLoaded', function() {
              const style = document.createElement('style');
              style.textContent = \`
                @page { 
                  margin: 2.5cm 3cm !important; 
                  size: letter !important;
                }
                @page :first { 
                  margin: 1.5cm 3cm 2.5cm 3cm !important; /* top right bottom left */
                  size: letter !important;
                }
                body { 
                  margin: 0 !important; 
                  padding: 0 !important; 
                }
                .page { 
                  margin: 0 !important; 
                  padding: 0 !important; 
                  page-break-after: always !important;
                  position: relative !important;
                }
                .page > :first-child {
                  margin-top: 0 !important;
                  padding-top: 0 !important;
                }
                /* Eliminar cualquier numeración de página */
                .page::after {
                  display: none !important;
                  content: "" !important;
                }
                .page::before {
                  display: none !important;
                  content: "" !important;
                }
              \`;
              document.head.appendChild(style);
            });
          <\/script>
        `);
        
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(finalHtml);
        doc.close();

        // Esperar a que el iframe cargue y disparar impresión
        iframe.onload = () => {
          try {
            // Forzar la carga de la imagen de marca de agua antes de imprimir
            const watermarkPath = idEmpresa > 0 ? 
              '/sistema_saao/contratos/logos_empresa/' + (empleadoSeleccionado.marca_empresa || 'agua.jpeg') : 
              '/sistema_saao/contratos/img/agua.jpeg';
            
            const watermarkImage = new Image();
            watermarkImage.src = watermarkPath;
            
            // Esperar a que la imagen se cargue completamente
            watermarkImage.onload = function() {
              console.log('Marca de agua precargada, iniciando impresión');
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
            };
            
            // Si hay un error cargando la imagen, imprimir de todos modos
            watermarkImage.onerror = function() {
              console.log('Error cargando marca de agua, imprimiendo de todos modos');
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
            };
            
            // Timeout de seguridad para evitar esperar demasiado
            setTimeout(() => {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
            }, 2000);
          } finally {
            // Remover el iframe después de un pequeño delay para permitir la cola de impresión
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          }
        };
      })
      .catch(err => {
        console.error('Error al cargar la plantilla de impresión:', err);
        alert('Error al cargar la plantilla de impresión');
        document.body.removeChild(iframe);
      });
  }

  // Aplicar estilos computados como inline para preservar formato exacto
  function aplicarEstilosInline(original, clone) {
    try {
      const elementosOriginales = original.querySelectorAll('*');
      const elementosClone = clone.querySelectorAll('*');
      
      for (let i = 0; i < elementosOriginales.length && i < elementosClone.length; i++) {
        const orig = elementosOriginales[i];
        const clon = elementosClone[i];
        
        if (!orig || !clon) continue;
        
        try {
          const estilos = window.getComputedStyle(orig);
          
          // Solo aplicar propiedades clave
          const propiedades = {
            'font-family': estilos.fontFamily,
            'font-size': estilos.fontSize,
            'font-weight': estilos.fontWeight,
            'font-style': estilos.fontStyle,
            'text-align': estilos.textAlign,
            'text-decoration': estilos.textDecoration,
            'line-height': estilos.lineHeight
          };
          
          let estiloInline = clon.getAttribute('style') || '';
          
          Object.keys(propiedades).forEach(prop => {
            const valor = propiedades[prop];
            if (valor && valor !== 'normal' && valor !== 'none') {
              // Solo agregar si no existe ya en el estilo inline
              if (estiloInline.indexOf(prop) === -1) {
                estiloInline += `${prop}: ${valor}; `;
              }
            }
          });
          
          if (estiloInline) {
            clon.setAttribute('style', estiloInline.trim());
          }
        } catch (e) {
          console.warn('Error aplicando estilos a elemento:', e);
        }
      }
    } catch (e) {
      console.error('Error en aplicarEstilosInline:', e);
    }
  }

  // Obtener nombre de archivo limpio para exportación
  function obtenerNombreArchivo() {
    const nombreArchivoInput = document.getElementById('nombreArchivo');
    let nombreArchivo = '';
    
    if (nombreArchivoInput && nombreArchivoInput.value && nombreArchivoInput.value.trim() !== '') {
      nombreArchivo = nombreArchivoInput.value.trim();
    } else {
      // Generar nombre por defecto: Contrato_NombreEmpleado_Fecha
      let nombreEmpleado = 'Empleado';
      if (empleadoSeleccionado && empleadoSeleccionado.nombre) {
        nombreEmpleado = (empleadoSeleccionado.nombre + ' ' + (empleadoSeleccionado.apellido_paterno || '') + ' ' + (empleadoSeleccionado.apellido_materno || '')).trim();
      }
      const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      nombreArchivo = `Contrato_${nombreEmpleado}_${fecha}`;
    }
    
    // Limpiar el nombre del archivo: quitar acentos, espacios, caracteres especiales
    nombreArchivo = nombreArchivo
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/[^a-zA-Z0-9_-]/g, '_') // solo letras, números, guiones
      .replace(/_+/g, '_') // evitar múltiples guiones bajos consecutivos
      .replace(/^_|_$/g, ''); // quitar guiones al inicio/final
    
    return nombreArchivo || 'contrato';
  }

  // Exportar contrato a Word
  function exportarWord() {
    const contenido = previewContent.querySelector('.a4-container .page');
    if (!contenido) { 
      alert('No hay contenido para exportar'); 
      return; 
    }
    
    const nombreArchivo = obtenerNombreArchivo();
    
    // Clonar el contenido para no modificar el original
    const clone = contenido.cloneNode(true);
    
    // Aplicar estilos inline a todos los elementos para preservar el formato exacto
    aplicarEstilosInline(contenido, clone);
    
    const htmlContent = clone.innerHTML;
    const fd = new FormData();
    fd.append('nombre', nombreArchivo);
    fd.append('contenido', htmlContent);
    
    // Agregar id_empresa para marca de agua dinámica
    let idEmpresa = 0;
    if (typeof empleadoSeleccionado !== 'undefined' && empleadoSeleccionado && empleadoSeleccionado.id_empresa) {
      idEmpresa = empleadoSeleccionado.id_empresa;
    }
    fd.append('id_empresa', idEmpresa);
    
    // Mostrar indicador de carga
    if (btnDescargarWord) {
      btnDescargarWord.disabled = true;
      btnDescargarWord.innerHTML = '⏳ Generando Word...';
    }
    
    fetch(API_EXPORTAR_WORD, { method: 'POST', body: fd })
      .then(r => {
        // Verificar si la respuesta es JSON válida
        const contentType = r.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return r.text().then(text => {
            console.error('Respuesta no JSON recibida:', text);
            throw new Error('El servidor devolvió una respuesta inválida. Revisa la consola para más detalles.');
          });
        }
        return r.json();
      })
      .then(res => {
        if (!res.ok) throw new Error(res.error || 'No se pudo exportar a Word');
        
        // Obtener el nombre del archivo y el contenido codificado
        const nombre = res.data && res.data.nombre ? res.data.nombre : 'documento.docx';
        const contenidoBase64 = res.data && res.data.contenido ? res.data.contenido : '';
        
        // Decodificar el contenido base64
        const contenidoBinario = atob(contenidoBase64);
        
        // Crear un Blob con el contenido
        const byteArray = new Uint8Array(contenidoBinario.length);
        for (let i = 0; i < contenidoBinario.length; i++) {
          byteArray[i] = contenidoBinario.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        
        // Crear URL para descarga
        const url = window.URL.createObjectURL(blob);
        
        // Descargar el archivo automáticamente
        const link = document.createElement('a');
        link.href = url;
        link.download = nombre;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Liberar el objeto URL
        window.URL.revokeObjectURL(url);
        
        // No mostrar ninguna alerta
      })
      .catch(err => {
        console.error('Error al exportar a Word:', err);
        // No mostrar ninguna alerta, solo registrar el error en consola
      })
      .finally(() => {
        // Restaurar el botón
        if (btnDescargarWord) {
          btnDescargarWord.disabled = false;
          btnDescargarWord.innerHTML = '📄 Descargar Word';
        }
      });
  }

  // Adjuntar event listeners
  function attachEventListeners() {
    if (btnVerVistaPrevia) {
      btnVerVistaPrevia.addEventListener('click', generarVistaPrevia);
    }
    
    if (btnImprimir) {
      btnImprimir.addEventListener('click', (e) => { 
        e.preventDefault(); 
        imprimirContrato(); 
      });
    }
    
    if (btnDescargarWord) {
      btnDescargarWord.addEventListener('click', (e) => { 
        e.preventDefault(); 
        exportarWord(); 
      });
    }

    if (selectBeneficiario) {
      selectBeneficiario.addEventListener('change', () => {
        actualizarCamposBeneficiarioDesdeSelect();
      });
    }

    // Formatear inputs monetarios al salir del campo
    const sueldoInput = document.getElementById('sueldo');
    const salarioDiarioInput = document.getElementById('salarioDiario');
    const onBlurFormatMoney = (ev) => {
      const el = ev.target;
      const raw = normalizeMoney(el.value);
      el.value = formatSalario(raw);
    };
    if (sueldoInput) sueldoInput.addEventListener('blur', onBlurFormatMoney);
    if (salarioDiarioInput) salarioDiarioInput.addEventListener('blur', onBlurFormatMoney);

    // Botón: agregar más rangos de horario de comida
    const btnAgregarHorarioComida = document.getElementById('agregarHorarioComida');
    const contComida = document.getElementById('comidaHorariosContainer');
    if (btnAgregarHorarioComida && contComida) {
      btnAgregarHorarioComida.addEventListener('click', (e) => {
        e.preventDefault();
        const row = document.createElement('div');
        row.className = 'col-12 d-flex flex-wrap align-items-end gap-2';
        row.innerHTML = `
          <div class="col-12 col-md-3">
            <input type="time" class="form-control form-control-sm comida-entrada" placeholder="Entrada" />
          </div>
          <div class="col-12 col-md-3">
            <input type="time" class="form-control form-control-sm comida-salida" placeholder="Salida" />
          </div>
          <div class="col-auto">
            <button type="button" class="btn btn-outline-danger btn-sm" data-action="removeComida">Quitar</button>
          </div>
        `;
        contComida.appendChild(row);
      });

      // Delegación para quitar filas
      contComida.addEventListener('click', (ev) => {
        const target = ev.target;
        if (target && target.getAttribute('data-action') === 'removeComida') {
          ev.preventDefault();
          const row = target.closest('.col-12');
          if (row && contComida.children.length > 1) {
            contComida.removeChild(row);
          }
        }
      });
    }

    // Botón: agregar más rangos de horario laboral
    const btnAgregarHorarioLaboral = document.getElementById('agregarHorarioLaboral');
    const contLaboral = document.getElementById('laboralHorariosContainer');
    if (btnAgregarHorarioLaboral && contLaboral) {
      btnAgregarHorarioLaboral.addEventListener('click', (e) => {
        e.preventDefault();
        const row = document.createElement('div');
        row.className = 'col-12 d-flex flex-wrap align-items-end gap-2';
        row.innerHTML = `
          <div class="col-12 col-md-3">
            <input type="time" class="form-control form-control-sm laboral-entrada" placeholder="Entrada" />
          </div>
          <div class="col-12 col-md-3">
            <input type="time" class="form-control form-control-sm laboral-salida" placeholder="Salida" />
          </div>
          <div class="col-auto">
            <button type="button" class="btn btn-outline-danger btn-sm" data-action="removeLaboral">Quitar</button>
          </div>
        `;
        contLaboral.appendChild(row);
      });

      // Delegación para quitar filas de horarios laborales
      contLaboral.addEventListener('click', (ev) => {
        const target = ev.target;
        if (target && target.getAttribute('data-action') === 'removeLaboral') {
          ev.preventDefault();
          const row = target.closest('.col-12');
          if (row && contLaboral.children.length > 1) {
            contLaboral.removeChild(row);
          }
        }
      });
    }

    // Botón: agregar más rangos de horario de turno
    const btnAgregarHorarioTurno = document.getElementById('agregarHorarioTurno');
    const contTurno = document.getElementById('turnoHorariosContainer');
    if (btnAgregarHorarioTurno && contTurno) {
      btnAgregarHorarioTurno.addEventListener('click', (e) => {
        e.preventDefault();
        const row = document.createElement('div');
        row.className = 'col-12 d-flex flex-wrap align-items-end gap-2';
        row.innerHTML = `
          <div class="col-12 col-md-3">
            <input type="time" class="form-control form-control-sm turno-entrada" placeholder="Entrada" />
          </div>
          <div class="col-12 col-md-3">
            <input type="time" class="form-control form-control-sm turno-salida" placeholder="Salida" />
          </div>
          <div class="col-auto">
            <button type="button" class="btn btn-outline-danger btn-sm" data-action="removeTurno">Quitar</button>
          </div>
        `;
        contTurno.appendChild(row);
      });

      // Delegación para quitar filas de horarios de turno
      contTurno.addEventListener('click', (ev) => {
        const target = ev.target;
        if (target && target.getAttribute('data-action') === 'removeTurno') {
          ev.preventDefault();
          const row = target.closest('.col-12');
          if (row && contTurno.children.length > 1) {
            contTurno.removeChild(row);
          }
        }
      });
    }
  }

  // Inicializar la aplicación
  function init() {
    attachEventListeners();
    verificarParametrosUrl();
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();