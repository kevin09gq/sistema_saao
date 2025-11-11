// contratos/js/plantillas.js
(function(){
  const API = '/sistema_saao/contratos/php/plantillas_fs.php';

  const lista = document.getElementById('listaPlantillas');
  const nuevoNombre = document.getElementById('nuevoNombre');
  const btnNueva = document.getElementById('btnNueva');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnEliminar = document.getElementById('btnEliminar');
  const btnRenombrar = document.getElementById('btnRenombrar');
  const tituloEdicion = document.getElementById('tituloEdicion');
  const inputPlaceholder = document.getElementById('inputPlaceholder');
  const btnInsertCustom = document.getElementById('btnInsertCustom');

  let actual = null;
  let quill = null;
  let tableModule = null; // Para el módulo de tablas
  
  // Template cache to reduce network requests
  const templateCache = new Map();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  function setStatusBadge(text, type) {
    // type: 'ok' | 'warn'
    let badge = document.getElementById('editorStatusBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'editorStatusBadge';
      badge.className = 'small mb-2';
      const editorContainer = document.getElementById('editorContainer');
      editorContainer.parentElement.insertBefore(badge, editorContainer);
    }
    badge.textContent = text;
    badge.style.color = type === 'ok' ? '#198754' : '#6c757d';
  }

  // Helper: establece el texto visible del label del picker de tamaño
  function setSizePickerLabelText(val) {
    const sizePicker = document.querySelector('.ql-size');
    if (!sizePicker) return;
    const label = sizePicker.querySelector('.ql-picker-label');
    if (!label) return;
    label.textContent = val || 'Normal';
  }

  // Función para actualizar las opciones y el label del selector de tamaño
  function updateSizePickerLabel() {
    // No actualizar si hay un input de texto con foco
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }
    
    const sizePicker = document.querySelector('.ql-size');
    if (!sizePicker) return;

    // Poner textos en los items (8pt, 10pt, etc.) y vista previa
    const items = sizePicker.querySelectorAll('.ql-picker-item');
    items.forEach(item => {
      const val = item.getAttribute('data-value');
      if (val) {
        item.textContent = val;
        item.style.fontSize = val;
      }
    });

    // Determinar tamaño actual por selección del editor (si existe quill)
    if (typeof quill !== 'undefined' && quill) {
      const fmt = quill.getFormat();
      const val = fmt && fmt.size ? fmt.size : null;
      setSizePickerLabelText(val);
    } else {
      // Fallback: usar el item seleccionado del picker si existe
      const selected = sizePicker.querySelector('.ql-picker-item.ql-selected');
      setSizePickerLabelText(selected ? selected.getAttribute('data-value') : null);
    }
  }

  // Función para actualizar las etiquetas del selector de interlineado
  function updateLineHeightPickerLabel() {
    // No actualizar si hay un input de texto con foco
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }
    
    const lineHeightPicker = document.querySelector('.ql-line-height');
    if (!lineHeightPicker) return;

    // Determinar interlineado actual por selección del editor (si existe quill)
    if (typeof quill !== 'undefined' && quill) {
      const fmt = quill.getFormat();
      const val = fmt && fmt['line-height'] ? fmt['line-height'] : '1.15';
      const label = lineHeightPicker.querySelector('.ql-picker-label');
      if (label) {
        label.textContent = val;
        label.setAttribute('data-value', val);
      }
    }
  }
  
  // Función para obtener el interlineado actual
  function getCurrentLineHeight() {
    if (!quill) return '1.15';
    
    const range = quill.getSelection();
    if (range && range.length > 0) {
      const format = quill.getFormat(range);
      return format['line-height'] || '1.15';
    } else if (range) {
      // Para posición sin selección, obtener formato del cursor
      const [line, offset] = quill.getLine(range.index);
      if (line) {
        const format = quill.getFormat(range.index, 0);
        return format['line-height'] || '1.15';
      }
    }
    return '1.15';
  }
  
  // --- Utilidades de saneamiento de estilos ---
  function cleanInlineFonts(root) {
    if (!root) return;
    const nodes = root.querySelectorAll('[style]');
    nodes.forEach(el => {
      const style = el.getAttribute('style');
      if (!style) return;
      const cleaned = style
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !/^font-family\s*:/i.test(s))
        .join('; ');
      if (cleaned) {
        el.setAttribute('style', cleaned);
      } else {
        el.removeAttribute('style');
      }
    });
    // Remover atributo 'face' en etiquetas <font> si existen
    const fonts = root.querySelectorAll('font[face]');
    fonts.forEach(f => f.removeAttribute('face'));
  }

  // Inicializar Quill Editor
  function initQuill() {
    if (typeof Quill === 'undefined') {
      setStatusBadge('Editor visual no disponible. Usando modo texto.', 'warn');
      return;
    }
    
    // Registrar el formato de interlineado
    registerLineHeightFormat();
    
    // Registrar el módulo de tablas mejoradas
    if (typeof QuillBetterTable !== 'undefined') {
      Quill.register({
        'modules/better-table': QuillBetterTable
      }, true);
    }
    
    // Registrar formato HTML para insertar tablas
    if (typeof Quill !== 'undefined') {
      const html = Quill.import('formats/html');
      if (html) {
        Quill.register(html, true);
      }
    }
    
    // Definir las fuentes disponibles con nombres amigables
    const fonts = [
      'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 
      'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 
      'Lucida Sans Unicode', 'Palatino Linotype', 'Tahoma', 
      'Times New Roman', 'Trebuchet MS', 'Verdana'
    ];
    
    // Registrar las fuentes en Quill
    const Font = Quill.import('formats/font');
    Font.whitelist = fonts;
    Quill.register(Font, true);
    
    // Registrar tamaños de fuente como estilo (pt - puntos, como en Word)
    const Size = Quill.import('attributors/style/size');
    Size.whitelist = ['8pt','10pt','11pt','12pt','14pt','16pt','18pt','20pt','22pt','24pt','26pt','28pt'];
    Quill.register(Size, true);
    
    // Configuración de Quill
    const toolbarOptions = [
      [{ 'font': fonts }, { 'size': Size.whitelist }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'line-height': ['1.0', '1.15', '1.5', '2.0'] }], // Agregar control de interlineado
      ['clean'],
      ['link', 'image', 'video']
    ];

    // Agregar botón de tabla si el módulo está disponible
    if (typeof QuillBetterTable !== 'undefined') {
      toolbarOptions.push(['better-table']);
    }
    
    // Agregar botones personalizados para control de tablas
    toolbarOptions.push([
      {
        'custom-table-controls': [
          'insert-table',
          'delete-row',
          'delete-column',
          'delete-table'
        ]
      }
    ]);

    quill = new Quill('#editorPlantilla', {
      modules: {
        toolbar: toolbarOptions,
        // Configurar el módulo de tablas mejoradas si está disponible
        'better-table': typeof QuillBetterTable !== 'undefined' ? {
          operationMenu: {
            items: {
              unmergeCells: {
                text: 'Separar celdas'
              },
              insertColumnRight: {
                text: 'Insertar columna a la derecha'
              },
              insertColumnLeft: {
                text: 'Insertar columna a la izquierda'
              },
              insertRowUp: {
                text: 'Insertar fila arriba'
              },
              insertRowDown: {
                text: 'Insertar fila abajo'
              },
              deleteColumn: {
                text: 'Eliminar columna'
              },
              deleteRow: {
                text: 'Eliminar fila'
              },
              deleteTable: {
                text: 'Eliminar tabla'
              }
            }
          },
          tableHeader: true,
          tableBorder: true
        } : false,
        keyboard: {
          bindings: typeof QuillBetterTable !== 'undefined' ? QuillBetterTable.keyboardBindings : {}
        }
      },
      formats: [
        'header','bold','italic','underline','strike',
        'list','script','indent','direction','size',
        'color','background','font','align','link','image','video','line-height','html'
      ],
      theme: 'snow',
      placeholder: 'Escribe aquí tu contrato...'
    });
    
    // Agregar formato de tabla si el módulo está disponible
    if (typeof QuillBetterTable !== 'undefined') {
      quill.getModule('toolbar').addHandler('better-table', function() {
        const tableModule = quill.getModule('better-table');
        if (tableModule) {
          tableModule.insertTable(3, 3);
        }
      });
      
      // Agregar 'better-table' al array de formatos
      quill.options.formats.push('better-table');
    }
    
    // Obtener referencia al módulo de tablas si está disponible
    if (typeof QuillBetterTable !== 'undefined') {
      tableModule = quill.getModule('better-table');
    }
    
    // Crear controles personalizados de tabla
    crearControlesTabla();
    
    // Inicializar redimensionamiento de tablas
    inicializarRedimensionamientoTablas();
    
    // Los estilos del editor ahora están en contratos/styles/editor-quill.css
    
    // Esperar a que el editor se inicialice completamente
    setTimeout(() => {
      // Actualizar los nombres de las fuentes en el selector
      updateFontPickerLabels();
      updateSizePickerLabel();
      updateLineHeightPickerLabel();
      
      // Agregar event listener para el selector de interlineado
      const lineHeightPicker = document.querySelector('.ql-line-height');
      if (lineHeightPicker) {
        // Configurar los valores del picker limpiando y reconfigurando correctamente
        const items = lineHeightPicker.querySelectorAll('.ql-picker-item');
        items.forEach((item, index) => {
          // Obtener el valor correcto del atributo data-value
          const val = item.getAttribute('data-value');
          if (val) {
            // Limpiar completamente el contenido del item
            while (item.firstChild) {
              item.removeChild(item.firstChild);
            }
            // Agregar solo el texto del valor
            item.appendChild(document.createTextNode(val));
          }
        });
        
        // Agregar event listener para cambios
        lineHeightPicker.addEventListener('click', function(e) {
          const target = e.target.closest('.ql-picker-item');
          if (target) {
            const value = target.getAttribute('data-value') || '1.15';
            applyLineHeight(value);
            
            // Actualizar el label
            const label = lineHeightPicker.querySelector('.ql-picker-label');
            if (label) {
              // Limpiar completamente el contenido del label
              while (label.firstChild) {
                label.removeChild(label.firstChild);
              }
              // Agregar solo el texto del valor
              label.appendChild(document.createTextNode(value));
              label.setAttribute('data-value', value);
            }
          }
        });
      }
    }, 100);
    
    setStatusBadge('Editor visual activo', 'ok');

    // Mantener actualizado el label del tamaño con la posición del cursor y cambios de texto
    quill.on('selection-change', (range) => {
      // Solo actualizar si hay una selección activa (el editor tiene foco)
      if (range) {
        updateSizePickerLabel();
        updateLineHeightPickerLabel();
      }
    });
    quill.on('text-change', () => {
      // Solo actualizar si el editor tiene foco
      if (quill.hasFocus()) {
        updateSizePickerLabel();
        updateLineHeightPickerLabel();
      }
    });
    
    // Escuchar cambios en el editor para actualizar el selector de interlineado
    quill.on('editor-change', function(eventName, ...args) {
      if (eventName === 'selection-change') {
        // Actualizar la selección del interlineado en el toolbar
        setTimeout(() => {
          updateLineHeightPickerLabel();
        }, 0);
      }
    });
  }

  // Función para actualizar las etiquetas del selector de fuentes
  function updateFontPickerLabels() {
    const fontPicker = document.querySelector('.ql-font');
    if (!fontPicker) return;
    
    const labels = {
      'Arial': 'Arial',
      'Arial Black': 'Arial Black',
      'Comic Sans MS': 'Comic Sans MS',
      'Courier New': 'Courier New',
      'Georgia': 'Georgia',
      'Helvetica': 'Helvetica',
      'Impact': 'Impact',
      'Lucida Console': 'Lucida Console',
      'Lucida Sans Unicode': 'Lucida Sans Unicode',
      'Palatino Linotype': 'Palatino Linotype',
      'Tahoma': 'Tahoma',
      'Times New Roman': 'Times New Roman',
      'Trebuchet MS': 'Trebuchet MS',
      'Verdana': 'Verdana'
    };
    
    // Actualizar las etiquetas de las opciones
    Object.keys(labels).forEach(fontName => {
      const option = fontPicker.querySelector(`.ql-picker-item[data-value="${fontName}"]`);
      if (option) {
        option.textContent = labels[fontName];
        option.style.fontFamily = getFontFamilyForLabel(fontName);
      }
    });
    
    // Actualizar la etiqueta seleccionada
    const selectedLabel = fontPicker.querySelector('.ql-picker-label');
    if (selectedLabel) {
      selectedLabel.innerHTML = 'Fuente';
    }
  }

  // Función para obtener la familia de fuentes para una etiqueta
  function getFontFamilyForLabel(fontName) {
    const fontMap = {
      'Arial': 'Arial, "Helvetica Neue", Helvetica, sans-serif',
      'Arial Black': '"Arial Black", "Arial Bold", Gadget, sans-serif',
      'Comic Sans MS': '"Comic Sans MS", cursive, sans-serif',
      'Courier New': '"Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace',
      'Georgia': 'Georgia, Times, "Times New Roman", serif',
      'Helvetica': 'Helvetica, "Helvetica Neue", Arial, sans-serif',
      'Impact': 'Impact, Haettenschweiler, "Franklin Gothic Bold", Charcoal, "Helvetica Inserat", "Bitstream Vera Sans Bold", "Arial Black", sans-serif',
      'Lucida Console': '"Lucida Console", Monaco, monospace',
      'Lucida Sans Unicode': '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
      'Palatino Linotype': '"Palatino Linotype", Palatino, Palladio, "URW Palladio L", "Book Antiqua", Baskerville, "Bookman Old Style", "Bitstream Charter", "Nimbus Roman No9 L", Garamond, "Apple Garamond", "ITC Garamond Narrow", "New Century Schoolbook", "Century Schoolbook", "Century Schoolbook L", Georgia, serif',
      'Tahoma': 'Tahoma, Verdana, Segoe, sans-serif',
      'Times New Roman': '"Times New Roman", TimesNewRoman, Times, Baskerville, Georgia, serif',
      'Trebuchet MS': '"Trebuchet MS", "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Tahoma, sans-serif',
      'Verdana': 'Verdana, Geneva, sans-serif'
    };
    
    return fontMap[fontName] || fontName;
  }

  function setEditorContent(html) { 
    if (quill) {
      // Show loading indicator
      const editorContainer = document.getElementById('editorContainer');
      if (editorContainer) {
        // Remove any existing loading indicator
        const existingIndicator = document.getElementById('editorLoadingIndicator');
        if (existingIndicator) existingIndicator.remove();
        
        // Create loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'editorLoadingIndicator';
        loadingIndicator.innerHTML = `
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                      background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 8px; 
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000; text-align: center;">
            <div class="spinner-border text-primary" role="status" style="margin-bottom: 10px;">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <Cargando contenido...</div>
          </div>
        `;
        editorContainer.style.position = 'relative';
        editorContainer.appendChild(loadingIndicator);
      }
      
      // Use setTimeout with 0 delay to yield control back to browser
      // This prevents the "page unresponsive" alert
      setTimeout(() => {
        try {
          // Convert HTML to Delta (formato de Quill)
          quill.root.innerHTML = html || '';
          // Limpiar estilos inline de fuentes para que el formato de Quill tenga efecto
          cleanInlineFonts(quill.root);
          // Normalizar tamaños pegados en px a pt
          normalizeFontSizesToPt(quill.root);
        } catch (e) {
          console.error('Error setting editor content:', e);
        } finally {
          // Remove loading indicator
          const loadingIndicator = document.getElementById('editorLoadingIndicator');
          if (loadingIndicator) loadingIndicator.remove();
        }
      }, 0);
    }
  }
  
  // Función para obtener el contenido del editor
  function getEditorContent() { 
    if (quill) {
      // Obtener contenido HTML del editor
      let content = quill.root.innerHTML;
      
      // PRESERVAR ESPACIOS MULTIPLES
      // Reemplazar múltiples espacios consecutivos con &nbsp; para que se mantengan en la vista previa
      content = content.replace(/ {2,}/g, function(match) {
        return match.split(' ').join('&nbsp;');
      });
      
      // Aplicar estilos inline para asegurar que el interlineado se mantenga
      // cuando se exporte a Word o PDF
      content = applyInlineLineHeightStyles(content);
      
      return content;
    }
    return '';
  }
  
  // Función para aplicar estilos inline de interlineado
  function applyInlineLineHeightStyles(htmlContent) {
    // Crear un elemento temporal para manipular el HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Aplicar interlineado a todos los elementos relevantes
    const elements = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span, li');
    elements.forEach(element => {
      // Si el elemento no tiene ya un estilo de line-height, aplicar el predeterminado
      if (!element.style.lineHeight || element.style.lineHeight === '') {
        element.style.lineHeight = '1.15';
      }
      
      // Asegurar propiedades específicas de Word
      element.style.setProperty('mso-line-height-rule', 'exactly');
    });
    
    // Procesar elementos que ya tienen atributos de line-height
    const styledElements = tempDiv.querySelectorAll('[style*="line-height"]');
    styledElements.forEach(element => {
      // Asegurar propiedades específicas de Word
      element.style.setProperty('mso-line-height-rule', 'exactly');
    });
    
    return tempDiv.innerHTML;
  }
  
  // Convierte cualquier font-size en px a pt (Word usa pt). 1px = 0.75pt
  function normalizeFontSizesToPt(root) {
    if (!root) return;
    const nodes = root.querySelectorAll('[style]');
    nodes.forEach(el => {
      const style = el.getAttribute('style');
      if (!style) return;
      // Reemplazar todas las ocurrencias de font-size: Npx por N*0.75pt
      const newStyle = style.replace(/font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)px/gi, (_, px) => {
        const pt = Math.round(parseFloat(px) * 0.75 * 10) / 10; // 1 decimal
        return `font-size: ${pt}pt`;
      });
      if (newStyle !== style) el.setAttribute('style', newStyle);
    });
  }
  
  function insertAtCursor(text) {
    const token = `{{${text}}}`;
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, token);
        quill.setSelection(range.index + token.length);
      } else {
        quill.insertText(0, token);
      }
    }
  }
  
  function setEditorEnabled(enabled) {
    if (quill) {
      quill.enable(enabled);
    }
    btnGuardar.disabled = !enabled;
    btnEliminar.disabled = !enabled || !actual;
    btnRenombrar.disabled = !enabled || !actual;
  }

  function listar() {
    // Show loading state
    lista.innerHTML = '<li class="list-group-item text-muted">Cargando plantillas...</li>';
    
    fetch(API + '?accion=listar')
      .then(r => r.json())
      .then(res => {
        if (!res.ok) throw new Error(res.error || 'Error al listar');
        
        // Use setTimeout to yield control back to browser
        setTimeout(() => {
          try {
            lista.innerHTML = '';
            
            // Create document fragment for better performance
            const fragment = document.createDocumentFragment();
            
            res.data.forEach(item => {
              const li = document.createElement('li');
              li.className = 'list-group-item d-flex justify-content-between align-items-center';
              li.innerHTML = `
                <span class="plantilla-item" data-nombre="${item.nombre}">${item.nombre.replace('.html', '')}</span>
                <span class="text-muted small">${new Date(item.modificado*1000).toLocaleString()}</span>
              `;
              
              // Add event listener
              li.querySelector('.plantilla-item').addEventListener('click', (e) => {
                e.preventDefault();
                seleccionar(item.nombre);
              });
              
              fragment.appendChild(li);
            });
            
            // Append all items at once
            lista.appendChild(fragment);
          } catch (e) {
            console.error('Error listing templates:', e);
            lista.innerHTML = '<li class="list-group-item text-danger">Error al cargar las plantillas</li>';
          }
        }, 0);
      })
      .catch(err => {
        console.error(err);
        lista.innerHTML = '<li class="list-group-item text-danger">No se pudieron cargar las plantillas</li>';
      });
  }

  function seleccionar(nombre) {
    // Cerrar el panel de plantillas
    const panelPlantillas = document.getElementById('panelPlantillas');
    const iconFlecha = document.getElementById('iconFlecha');
    if (panelPlantillas) {
      panelPlantillas.style.display = 'none';
      if (iconFlecha) iconFlecha.textContent = '▼';
    }
    
    // Check cache first
    const cached = templateCache.get(nombre);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      // Show loading state immediately
      tituloEdicion.textContent = 'Cargando: ' + nombre.replace('.html', '');
      setEditorEnabled(false);
      
      // Use setTimeout to yield control back to browser
      setTimeout(() => {
        try {
          actual = cached.data.nombre;
          setEditorContent(cached.data.contenido);
          setEditorEnabled(true);
          tituloEdicion.textContent = 'Editando: ' + actual.replace('.html', '');
          
          // Update font picker labels asynchronously
          setTimeout(() => {
            updateFontPickerLabels();
          }, 50);
        } catch (e) {
          console.error('Error loading cached template:', e);
          tituloEdicion.textContent = actual ? 'Editando: ' + actual.replace('.html', '') : 'Sin plantilla seleccionada';
          setEditorEnabled(!!actual);
        }
      }, 0);
      return;
    }
    
    // Show loading state immediately
    tituloEdicion.textContent = 'Cargando: ' + nombre.replace('.html', '');
    setEditorEnabled(false);
    
    fetch(API + '?accion=obtener&nombre=' + encodeURIComponent(nombre))
      .then(r => r.json())
      .then(res => {
        if (!res.ok) throw new Error(res.error || 'Error al obtener');
        
        // Cache the result
        templateCache.set(nombre, {
          data: res.data,
          timestamp: Date.now()
        });
        
        // Use setTimeout to yield control back to browser
        setTimeout(() => {
          try {
            actual = res.data.nombre;
            setEditorContent(res.data.contenido);
            setEditorEnabled(true);
            tituloEdicion.textContent = 'Editando: ' + actual.replace('.html', '');
            
            // Update font picker labels asynchronously
            setTimeout(() => {
              updateFontPickerLabels();
            }, 50);
          } catch (e) {
            console.error('Error loading template:', e);
            tituloEdicion.textContent = actual ? 'Editando: ' + actual.replace('.html', '') : 'Sin plantilla seleccionada';
            setEditorEnabled(!!actual);
          }
        }, 0);
      })
      .catch(err => {
        Swal.fire({
          title: 'Error',
          text: err.message,
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#10b981'
        });
        // Reset to previous state on error
        tituloEdicion.textContent = actual ? 'Editando: ' + actual.replace('.html', '') : 'Sin plantilla seleccionada';
        setEditorEnabled(!!actual);
      });
  }

  function nueva() {
    const name = (nuevoNombre.value || '').trim();
    if (!name) {
      // Mostrar alerta con SweetAlert2
      Swal.fire({
        title: 'Advertencia',
        text: 'Ingresa un nombre para la plantilla',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981'
      });
      return;
    }
    // Crear vacía inmediatamente
    const fd = new FormData();
    fd.append('accion', 'guardar');
    fd.append('nombre', name);
    fd.append('contenido', '<div class="page">\n  <h2>Contrato</h2>\n  <p>Estimado(a) {{empleado.nombre}} {{empleado.apellido_paterno}} {{empleado.apellido_materno}},</p>\n  <p>Se formaliza su Contrato con fecha de inicio {{FECHA_INICIO}} y salario semanal de {{SALARIO_SEMANAL}} MXN.</p>\n</div>');
    fetch(API, { method: 'POST', body: fd })
      .then(r => r.json())
      .then(res => {
        if (!res.ok) throw new Error(res.error || 'No se pudo crear');
        nuevoNombre.value = '';
        // Clear cache since we added a new template
        templateCache.clear();
        listar();
        seleccionar(res.data.nombre);
      })
      .catch(err => {
        Swal.fire({
          title: 'Error',
          text: err.message,
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#10b981'
        });
      });
  }

  function guardar() {
    if (!actual) return;
    const fd = new FormData();
    fd.append('accion', 'guardar');
    fd.append('nombre', actual);
    fd.append('contenido', getEditorContent());
    fetch(API, { method: 'POST', body: fd })
      .then(r => r.json())
      .then(res => {
        if (!res.ok) throw new Error(res.error || 'No se pudo guardar');
        // Clear cache for this template since it was updated
        templateCache.delete(actual);
        listar();
        Swal.fire({
          title: 'Éxito',
          text: 'Plantilla guardada correctamente',
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#10b981'
        });
      })
      .catch(err => {
        Swal.fire({
          title: 'Error',
          text: err.message,
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#10b981'
        });
      });
  }

  function eliminar() {
    if (!actual) return;
    
    // Usar SweetAlert2 para confirmar la eliminación
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Eliminar la plantilla ' + actual + '? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#10b981'
    }).then((result) => {
      if (result.isConfirmed) {
        const fd = new FormData();
        fd.append('accion', 'eliminar');
        fd.append('nombre', actual);
        fetch(API, { method: 'POST', body: fd })
          .then(r => r.json())
          .then(res => {
            if (!res.ok) throw new Error(res.error || 'No se pudo eliminar');
            // Clear cache for this template and refresh list
            templateCache.delete(actual);
            templateCache.clear(); // Clear all cache to be safe
            actual = null;
            setEditorContent('');
            setEditorEnabled(false);
            tituloEdicion.textContent = 'Sin plantilla seleccionada';
            listar();
            
            // Mostrar mensaje de éxito
            Swal.fire({
              title: 'Eliminada',
              text: 'La plantilla ha sido eliminada correctamente.',
              icon: 'success',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#10b981'
            });
          })
          .catch(err => {
            Swal.fire({
              title: 'Error',
              text: err.message,
              icon: 'error',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#10b981'
            });
          });
      }
    });
  }

  // Función para renombrar una plantilla
  function renombrar() {
    if (!actual) return;
    
    // Usar SweetAlert2 para solicitar el nuevo nombre
    Swal.fire({
      title: 'Renombrar Plantilla',
      input: 'text',
      inputLabel: 'Nuevo nombre para la plantilla:',
      inputValue: actual.replace('.html', ''),
      inputPlaceholder: 'Ingresa el nuevo nombre',
      showCancelButton: true,
      confirmButtonText: 'Renombrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'Debes ingresar un nombre para la plantilla';
        }
        if (value.trim() === actual.replace('.html', '')) {
          return 'El nuevo nombre debe ser diferente al actual';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevoNombre = result.value;
        // Preparar el nombre con la extensión .html
        const nuevoNombreConExtension = nuevoNombre.trim() + '.html';
        
        // Verificar si ya existe una plantilla con ese nombre
        fetch(API + '?accion=listar')
          .then(r => r.json())
          .then(res => {
            if (!res.ok) throw new Error(res.error || 'Error al listar');
            
            // Verificar si ya existe una plantilla con el nuevo nombre
            const existe = res.data.some(item => item.nombre === nuevoNombreConExtension);
            if (existe) {
              Swal.fire({
                title: 'Advertencia',
                text: 'Ya existe una plantilla con ese nombre. Por favor, elige otro nombre.',
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#10b981'
              });
              return;
            }
            
            // Proceder con el renombrado
            const fd = new FormData();
            fd.append('accion', 'renombrar');
            fd.append('nombre', actual);
            fd.append('nuevoNombre', nuevoNombreConExtension);
            return fetch(API, { method: 'POST', body: fd });
          })
          .then(r => {
            if (!r) return; // Si no hay respuesta, es porque ya existe una plantilla con ese nombre
            return r.json();
          })
          .then(res => {
            if (!res || !res.ok) {
              if (res && res.error) {
                throw new Error(res.error);
              } else {
                throw new Error('No se pudo renombrar la plantilla');
              }
            }
            
            // Clear cache for old and new template names
            templateCache.delete(actual);
            templateCache.delete(res.data.nuevoNombre);
            templateCache.clear(); // Clear all cache to be safe
            
            // Actualizar el nombre actual
            actual = res.data.nuevoNombre;
            
            // Actualizar la lista y la interfaz
            listar();
            tituloEdicion.textContent = 'Editando: ' + actual;
            Swal.fire({
              title: 'Éxito',
              text: 'Plantilla renombrada correctamente',
              icon: 'success',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#10b981'
            });
          })
          .catch(err => {
            Swal.fire({
              title: 'Error',
              text: 'Error: ' + err.message,
              icon: 'error',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#10b981'
            });
          });
      }
    });
  }

  // Función para mostrar modal de configuración de tabla
  function mostrarModalTabla() {
    // Crear modal si no existe
    let modal = document.getElementById('modalTabla');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modalTabla';
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Configurar Tabla</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="filasTabla" class="form-label">Número de Filas:</label>
                  <input type="number" class="form-control" id="filasTabla" min="1" max="20" value="3">
                </div>
                <div class="col-md-6">
                  <label for="columnasTabla" class="form-label">Número de Columnas:</label>
                  <input type="number" class="form-control" id="columnasTabla" min="1" max="10" value="3">
                </div>
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="incluirEncabezados" checked>
                <label class="form-check-label" for="incluirEncabezados">
                  Incluir fila de encabezados
                </label>
              </div>
              <div class="alert alert-info">
                <small>Puedes ajustar el tamaño de la tabla después de insertarla usando los controles de la barra de herramientas.</small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" id="btnCrearTabla">Crear Tabla</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    
    // Mostrar modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Event listener para crear tabla
    document.getElementById('btnCrearTabla').onclick = function() {
      const filas = parseInt(document.getElementById('filasTabla').value);
      const columnas = parseInt(document.getElementById('columnasTabla').value);
      const incluirEncabezados = document.getElementById('incluirEncabezados').checked;
      
      if (filas < 1 || columnas < 1) {
        alert('Por favor ingresa valores válidos para filas y columnas');
        return;
      }
      
      insertarTabla(filas, columnas, incluirEncabezados);
      bsModal.hide();
    };
  }

  // Función para crear controles personalizados de tabla
  function crearControlesTabla() {
    // Esperar a que la barra de herramientas esté lista
    setTimeout(() => {
      const toolbar = document.querySelector('.ql-toolbar');
      if (!toolbar) return;
      
      // Crear contenedor para controles de tabla
      const tableControls = document.createElement('span');
      tableControls.className = 'custom-table-controls';
      tableControls.innerHTML = `
        <button type="button" id="btnInsertTable" title="Insertar Tabla">📊</button>
        <button type="button" id="btnDeleteRow" title="Eliminar Fila" disabled>🗑️</button>
        <button type="button" id="btnDeleteColumn" title="Eliminar Columna" disabled>🗑️</button>
        <button type="button" id="btnDeleteTable" title="Eliminar Tabla" disabled>🗑️</button>
        <button type="button" id="btnAlignTableLeft" title="Alinear Izquierda" disabled>⬅️</button>
        <button type="button" id="btnAlignTableCenter" title="Centrar" disabled>⏺️</button>
        <button type="button" id="btnAlignTableRight" title="Alinear Derecha" disabled>➡️</button>
        <button type="button" id="btnBackgroundColor" title="Color de Fondo de Celda" disabled>🎨</button>
      `;
      
      // Insertar controles en la barra de herramientas
      toolbar.appendChild(tableControls);
      
      // Event listeners para los botones
      document.getElementById('btnInsertTable').addEventListener('click', mostrarModalTabla);
      document.getElementById('btnDeleteRow').addEventListener('click', eliminarFila);
      document.getElementById('btnDeleteColumn').addEventListener('click', eliminarColumna);
      document.getElementById('btnDeleteTable').addEventListener('click', eliminarTabla);
      
      // Event listeners para los botones de alineación
      document.getElementById('btnAlignTableLeft').addEventListener('click', () => alinearTabla('left'));
      document.getElementById('btnAlignTableCenter').addEventListener('click', () => alinearTabla('center'));
      document.getElementById('btnAlignTableRight').addEventListener('click', () => alinearTabla('right'));
      
      // Event listener para el botón de color de fondo
      document.getElementById('btnBackgroundColor').addEventListener('click', mostrarSelectorColorFondo);
      
      // Actualizar estado de botones cuando cambie la selección
      quill.on('selection-change', (range) => {
        // Solo actualizar si hay una selección activa (el editor tiene foco)
        if (range) {
          actualizarEstadoBotonesTabla();
        }
      });
    }, 100);
  }
  
  // Función para alinear tablas
  function alinearTabla(alineacion) {
    const range = quill.getSelection();
    if (!range) return;
    
    const [block] = quill.getLine(range.index);
    if (!block || !block.domNode) return;
    
    const table = block.domNode.closest('table');
    if (!table) return;
    
    // Remover clases de alineación existentes
    table.classList.remove('ql-align-left', 'ql-align-center', 'ql-align-right');
    
    // Agregar la clase de alineación correspondiente
    if (alineacion === 'left') {
      table.classList.add('ql-align-left');
      setStatusBadge('Tabla alineada a la izquierda', 'ok');
    } else if (alineacion === 'center') {
      table.classList.add('ql-align-center');
      setStatusBadge('Tabla centrada', 'ok');
    } else if (alineacion === 'right') {
      table.classList.add('ql-align-right');
      setStatusBadge('Tabla alineada a la derecha', 'ok');
    }
  }
  
  // Función para mostrar el selector de color de fondo para celdas de tabla
  function mostrarSelectorColorFondo() {
    const range = quill.getSelection();
    if (!range) return;
    
    const [block] = quill.getLine(range.index);
    if (!block || !block.domNode) return;
    
    const cell = block.domNode.closest('td, th');
    if (!cell) {
      setStatusBadge('Selecciona una celda de la tabla primero', 'warn');
      return;
    }
    
    // Crear un input de tipo color
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.style.position = 'absolute';
    colorInput.style.opacity = '0';
    colorInput.style.pointerEvents = 'none';
    document.body.appendChild(colorInput);
    
    // Cuando se seleccione un color, aplicarlo a la celda
    colorInput.addEventListener('change', function() {
      const color = this.value;
      cell.style.backgroundColor = color;
      setStatusBadge(`Color de fondo aplicado: ${color}`, 'ok');
      document.body.removeChild(this);
    });
    
    // Cuando se cancele, eliminar el input
    colorInput.addEventListener('blur', function() {
      document.body.removeChild(this);
    });
    
    // Abrir el selector de color
    colorInput.click();
  }
  
  // Función para actualizar el estado de los botones de tabla
  function actualizarEstadoBotonesTabla() {
    // No actualizar si hay un input de texto con foco
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }
    
    const btnDeleteRow = document.getElementById('btnDeleteRow');
    const btnDeleteColumn = document.getElementById('btnDeleteColumn');
    const btnDeleteTable = document.getElementById('btnDeleteTable');
    const btnAlignTableLeft = document.getElementById('btnAlignTableLeft');
    const btnAlignTableCenter = document.getElementById('btnAlignTableCenter');
    const btnAlignTableRight = document.getElementById('btnAlignTableRight');
    const btnBackgroundColor = document.getElementById('btnBackgroundColor');
    
    if (!btnDeleteRow || !btnDeleteColumn || !btnDeleteTable || 
        !btnAlignTableLeft || !btnAlignTableCenter || !btnAlignTableRight ||
        !btnBackgroundColor) return;
    
    const range = quill.getSelection();
    if (!range) {
      btnDeleteRow.disabled = true;
      btnDeleteColumn.disabled = true;
      btnDeleteTable.disabled = true;
      btnAlignTableLeft.disabled = true;
      btnAlignTableCenter.disabled = true;
      btnAlignTableRight.disabled = true;
      btnBackgroundColor.disabled = true;
      return;
    }
    
    // Verificar si el cursor está dentro de una tabla
    const [block] = quill.getLine(range.index);
    const isInTable = block && block.domNode && block.domNode.closest('table');
    
    btnDeleteRow.disabled = !isInTable;
    btnDeleteColumn.disabled = !isInTable;
    btnDeleteTable.disabled = !isInTable;
    btnAlignTableLeft.disabled = !isInTable;
    btnAlignTableCenter.disabled = !isInTable;
    btnAlignTableRight.disabled = !isInTable;
    btnBackgroundColor.disabled = !isInTable;
  }
  
  // Función para inicializar el redimensionamiento de tablas
  function inicializarRedimensionamientoTablas() {
    // Usar delegación de eventos para manejar tablas dinámicas
    document.addEventListener('mousedown', function(e) {
      const table = e.target.closest('table');
      if (!table) return;
      
      const tableRect = table.getBoundingClientRect();
      const cell = e.target.closest('td, th');
      
      // Detectar redimensionamiento desde bordes exteriores de la tabla - área más amplia
      const isResizingFromRightEdge = !cell && e.clientX > tableRect.right - 15 && e.clientX < tableRect.right + 15;
      const isResizingFromBottomEdge = !cell && e.clientY > tableRect.bottom - 15 && e.clientY < tableRect.bottom + 15;
      
      if (isResizingFromRightEdge) {
        e.preventDefault();
        e.stopPropagation();
        // Redimensionar toda la tabla desde el borde derecho
        iniciarRedimensionamientoTablaCompleta(e, table, 'width');
        return;
      }
      
      if (isResizingFromBottomEdge) {
        e.preventDefault();
        e.stopPropagation();
        // Redimensionar toda la tabla desde el borde inferior
        iniciarRedimensionamientoTablaCompleta(e, table, 'height');
        return;
      }
      
      // Detectar redimensionamiento desde celdas (funcionalidad original)
      if (!cell) return;
      
      const rect = cell.getBoundingClientRect();
      const isResizingColumn = e.clientX > rect.right - 8;
      const isResizingRow = e.clientY > rect.bottom - 8;
      
      if (isResizingColumn) {
        e.preventDefault();
        e.stopPropagation();
        iniciarRedimensionamientoColumna(e, cell, table);
      } else if (isResizingRow) {
        e.preventDefault();
        e.stopPropagation();
        iniciarRedimensionamientoFila(e, cell, table);
      }
    });
  }
  
  // Nueva función para redimensionar toda la tabla
  function iniciarRedimensionamientoTablaCompleta(e, table, direction) {
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = table.offsetWidth;
    const startHeight = table.offsetHeight;
    
    // Crear línea guía
    const guide = document.createElement('div');
    guide.className = `resize-guide ${direction === 'width' ? 'vertical' : 'horizontal'}`;
    
    if (direction === 'width') {
      guide.style.left = (table.getBoundingClientRect().right + window.scrollX) + 'px';
      guide.style.top = (table.getBoundingClientRect().top + window.scrollY) + 'px';
      guide.style.height = table.offsetHeight + 'px';
    } else {
      guide.style.left = (table.getBoundingClientRect().left + window.scrollX) + 'px';
      guide.style.top = (table.getBoundingClientRect().bottom + window.scrollY) + 'px';
      guide.style.width = table.offsetWidth + 'px';
    }
    
    document.body.appendChild(guide);
    
    // Agregar clase de redimensionamiento
    table.classList.add('resizing');
    
    function onMouseMove(e) {
      if (direction === 'width') {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(200, startWidth + deltaX);
        table.style.width = newWidth + 'px';
        guide.style.left = (table.getBoundingClientRect().right + window.scrollX) + 'px';
      } else {
        const deltaY = e.clientY - startY;
        const newHeight = Math.max(100, startHeight + deltaY);
        table.style.height = newHeight + 'px';
        guide.style.top = (table.getBoundingClientRect().bottom + window.scrollY) + 'px';
      }
    }
    
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.removeChild(guide);
      table.classList.remove('resizing');
      setStatusBadge(`Tabla redimensionada (${direction})`, 'ok');
    }
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
  
  // Función para redimensionar columnas
  function iniciarRedimensionamientoColumna(e, cell, table) {
    const startX = e.clientX;
    const startWidth = cell.offsetWidth;
    const columnIndex = Array.from(cell.parentNode.children).indexOf(cell);
    
    // Crear línea guía
    const guide = document.createElement('div');
    guide.className = 'resize-guide vertical';
    guide.style.left = (cell.getBoundingClientRect().right + window.scrollX) + 'px';
    guide.style.top = (table.getBoundingClientRect().top + window.scrollY) + 'px';
    guide.style.height = table.offsetHeight + 'px';
    document.body.appendChild(guide);
    
    // Agregar clase de redimensionamiento
    table.classList.add('resizing');
    
    function onMouseMove(e) {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + deltaX);
      
      // Actualizar ancho de la columna
      const allRows = table.querySelectorAll('tr');
      allRows.forEach(row => {
        const cellToResize = row.children[columnIndex];
        if (cellToResize) {
          cellToResize.style.width = newWidth + 'px';
        }
      });
      
      // Actualizar posición de la línea guía
      guide.style.left = (cell.getBoundingClientRect().right + window.scrollX) + 'px';
    }
    
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.removeChild(guide);
      table.classList.remove('resizing');
      setStatusBadge('Columna redimensionada', 'ok');
    }
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
  
  // Función para redimensionar filas
  function iniciarRedimensionamientoFila(e, cell, table) {
    const startY = e.clientY;
    const startHeight = cell.offsetHeight;
    const row = cell.closest('tr');
    const rowIndex = Array.from(row.parentNode.children).indexOf(row);
    
    // Crear línea guía
    const guide = document.createElement('div');
    guide.className = 'resize-guide horizontal';
    guide.style.left = (table.getBoundingClientRect().left + window.scrollX) + 'px';
    guide.style.top = (row.getBoundingClientRect().bottom + window.scrollY) + 'px';
    guide.style.width = table.offsetWidth + 'px';
    document.body.appendChild(guide);
    
    // Agregar clase de redimensionamiento
    table.classList.add('resizing');
    
    function onMouseMove(e) {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(30, startHeight + deltaY);
      
      // Actualizar altura de la fila
      const cells = row.querySelectorAll('td, th');
      cells.forEach(cell => {
        cell.style.height = newHeight + 'px';
      });
      
      // Actualizar posición de la línea guía
      guide.style.top = (row.getBoundingClientRect().bottom + window.scrollY) + 'px';
    }
    
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.removeChild(guide);
      table.classList.remove('resizing');
      setStatusBadge('Fila redimensionada', 'ok');
    }
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
  
  // Función para eliminar una fila
  function eliminarFila() {
    const range = quill.getSelection();
    if (!range) return;
    
    const [block] = quill.getLine(range.index);
    if (!block || !block.domNode) return;
    
    const table = block.domNode.closest('table');
    if (!table) return;
    
    const row = block.domNode.closest('tr');
    if (!row) return;
    
    // Contar filas restantes
    const remainingRows = table.querySelectorAll('tr');
    if (remainingRows.length <= 1) {
      if (confirm('¿Eliminar toda la tabla?')) {
        eliminarTabla();
      }
      return;
    }
    
    row.remove();
    setStatusBadge('Fila eliminada', 'ok');
  }
  
  // Función para eliminar una columna
  function eliminarColumna() {
    const range = quill.getSelection();
    if (!range) return;
    
    const [block] = quill.getLine(range.index);
    if (!block || !block.domNode) return;
    
    const table = block.domNode.closest('table');
    if (!table) return;
    
    const cell = block.domNode.closest('td, th');
    if (!cell) return;
    
    // Encontrar el índice de la columna
    const row = cell.closest('tr');
    const cells = Array.from(row.children);
    const columnIndex = cells.indexOf(cell);
    
    if (columnIndex === -1) return;
    
    // Contar columnas restantes
    const firstRow = table.querySelector('tr');
    if (!firstRow) return;
    
    const remainingCells = firstRow.children;
    if (remainingCells.length <= 1) {
      if (confirm('¿Eliminar toda la tabla?')) {
        eliminarTabla();
      }
      return;
    }
    
    // Eliminar la columna de todas las filas
    const allRows = table.querySelectorAll('tr');
    allRows.forEach(row => {
      const cellToRemove = row.children[columnIndex];
      if (cellToRemove) {
        cellToRemove.remove();
      }
    });
    
    setStatusBadge('Columna eliminada', 'ok');
  }
  
  // Función para eliminar toda la tabla
  function eliminarTabla() {
    const range = quill.getSelection();
    if (!range) return;
    
    const [block] = quill.getLine(range.index);
    if (!block || !block.domNode) return;
    
    const table = block.domNode.closest('table');
    if (!table) return;
    
    if (confirm('¿Eliminar toda la tabla?')) {
      table.remove();
      setStatusBadge('Tabla eliminada', 'ok');
    }
  }

  // Función para insertar una tabla con configuración personalizada
  function insertarTabla(filas = 3, columnas = 3, incluirEncabezados = true) {
    const range = quill.getSelection() || { index: quill.getLength() };
    
      if (incluirEncabezados) {
      // Crear tabla con encabezados usando método manual
      let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
      
      // Primera fila como encabezados
      tableHTML += '<tr>';
        for (let i = 1; i <= columnas; i++) {
        tableHTML += `<td style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0; font-weight: bold;">Encabezado ${i}</td>`;
        }
      tableHTML += '</tr>';
      
      // Filas de datos
      const filasDatos = filas - 1;
      for (let i = 1; i <= filasDatos; i++) {
        tableHTML += '<tr>';
        for (let j = 1; j <= columnas; j++) {
          tableHTML += `<td style="border: 1px solid #000; padding: 8px;">Celda ${i}-${j}</td>`;
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table>';
      
        quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
      } else {
      // Sin encabezados, usar el módulo de Quill
      if (tableModule) {
        tableModule.insertTable(filas, columnas);
      } else {
        // Fallback sin encabezados
        let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
        for (let i = 1; i <= filas; i++) {
          tableHTML += '<tr>';
          for (let j = 1; j <= columnas; j++) {
            tableHTML += `<td style="border: 1px solid #000; padding: 8px;">Celda ${i}-${j}</td>`;
          }
          tableHTML += '</tr>';
        }
        tableHTML += '</table>';
        quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
      }
    }
    
    setStatusBadge('Tabla insertada', 'ok');
  }
  

  btnNueva.addEventListener('click', nueva);
  btnGuardar.addEventListener('click', guardar);
  btnEliminar.addEventListener('click', eliminar);
  btnRenombrar.addEventListener('click', renombrar);

  // Toggle simple para el panel de plantillas
  const btnTogglePlantillas = document.getElementById('btnTogglePlantillas');
  const panelPlantillas = document.getElementById('panelPlantillas');
  const iconFlecha = document.getElementById('iconFlecha');
  
  if (btnTogglePlantillas && panelPlantillas) {
    btnTogglePlantillas.addEventListener('click', function() {
      const isVisible = panelPlantillas.style.display !== 'none';
      
      if (isVisible) {
        panelPlantillas.style.display = 'none';
        iconFlecha.textContent = '▼';
      } else {
        panelPlantillas.style.display = 'block';
        iconFlecha.textContent = '▲';
      }
    });
  }

  // Proteger el campo de nombre de plantilla para evitar que pierda el foco
  if (nuevoNombre) {
    nuevoNombre.addEventListener('focus', function() {
      // Marcar que el campo tiene foco
      this.dataset.hasFocus = 'true';
    });
    
    nuevoNombre.addEventListener('blur', function() {
      // Marcar que el campo perdió el foco
      this.dataset.hasFocus = 'false';
    });
  }

  // Agregar evento para el botón de insertar tabla
  document.getElementById('btnInsertarTabla').addEventListener('click', function(e) {
    e.preventDefault();
    mostrarModalTabla();
  });


  if (btnInsertCustom) btnInsertCustom.addEventListener('click', (e) => {
    e.preventDefault();
    const val = (inputPlaceholder && inputPlaceholder.value || '').trim();
    if (!val) return;
    insertAtCursor(val);
    inputPlaceholder.value = '';
  });

  // Handle quick insert buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('quick-insert')) {
      e.preventDefault();
      const val = e.target.getAttribute('data-value');
      if (val) {
        insertAtCursor(val);
      }
    }
  });

  // Inicializar la lista de plantillas
  listar();
  
  // Inicializar Quill después de que el DOM esté completamente cargado
  if (typeof Quill !== 'undefined') {
    initQuill();
  } else {
    // Fallback si Quill no se carga
    setTimeout(() => {
      if (typeof Quill !== 'undefined') {
        initQuill();
      } else {
        setStatusBadge('Editor visual no disponible. Usando modo texto.', 'warn');
      }
    }, 1000);
  }
})();

// Función para agregar control de interlineado personalizado
function addCustomLineHeightControl() {
  // Esta función ya no es necesaria ya que estamos usando el control integrado de Quill
  // Pero la mantenemos por compatibilidad
  return;
}

// Registrar el formato de interlineado
function registerLineHeightFormat() {
  if (typeof Quill === 'undefined') return;
  
  try {
    // Usar el enfoque correcto para Quill 2.x
    const Inline = Quill.import('blots/inline');
    
    class LineHeightBlot extends Inline {
      static create(value) {
        let node = super.create();
        node.style.lineHeight = value;
        return node;
      }
      
      static formats(node) {
        return node.style.lineHeight || '1.15';
      }
    }
    
    LineHeightBlot.blotName = 'line-height';
    LineHeightBlot.tagName = 'span';
    LineHeightBlot.className = 'ql-line-height';
    
    Quill.register(LineHeightBlot);
  } catch (e) {
    console.warn('No se pudo registrar el formato de interlineado:', e);
  }
}

// Función para aplicar interlineado al texto seleccionado
function applyLineHeight(value) {
  if (!quill) return;
  
  const range = quill.getSelection();
  if (range) {
    quill.format('line-height', value, 'user');
  }
}

// Función para obtener el interlineado actual
function getCurrentLineHeight() {
  if (!quill) return '1.15';
  
  const range = quill.getSelection();
  if (range) {
    const format = quill.getFormat(range);
    return format['line-height'] || '1.15';
  }
  return '1.15';
}

// Función para mostrar alertas personalizadas sin CDN
function mostrarAlertaPersonalizada(mensaje, tipo = 'info') {
  // Crear el contenedor de la alerta
  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
  alerta.style = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
  alerta.setAttribute('role', 'alert');
    
  // Definir el ícono según el tipo
  let icono = 'ℹ️';
  if (tipo === 'success') icono = '✅';
  else if (tipo === 'warning') icono = '⚠️';
  else if (tipo === 'error') icono = '❌';
    
  // Contenido de la alerta
  alerta.innerHTML = `
    <div class="d-flex align-items-center">
      <span class="me-2 fs-5">${icono}</span>
      <div class="flex-grow-1">${mensaje}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
    
  // Agregar al body
  document.body.appendChild(alerta);
    
  // Eliminar automáticamente después de 5 segundos
  setTimeout(() => {
    if (alerta.parentNode) {
      alerta.remove();
    }
  }, 5000);
}
