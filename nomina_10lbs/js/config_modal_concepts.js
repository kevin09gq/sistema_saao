// Variable global para guardar la fila seleccionada
var filaSeleccionada = null;

// Función simple: muestra el menú contextual cuando se hace click en cualquier parte de la tabla
function mostrarContextMenu() {
	var $menu = $('#context-menu');
	if ($menu.length === 0) return; // no hay menú en el DOM

	// Adjunta un manejador simple: al hacer click derecho (contextmenu) en el cuerpo de la tabla, posiciona y muestra el menú
	$('#tabla-nomina-body').on('contextmenu', function (e) {
		e.preventDefault();
		e.stopPropagation();
		
		// Guardar la fila sobre la que se hizo clic
		filaSeleccionada = $(e.target).closest('tr');
		
		var x = e.pageX;
		var y = e.pageY;
		$menu.css({ top: y + 'px', left: x + 'px' }).show();
	});
}

// Función simple: al hacer click en una opción del menú contextual, mostrar el modal
function bindContextMenuToModal() {
	var $menu = $('#context-menu');
	if ($menu.length === 0) return;

	$menu.on('click', '.cm-item', function (e) {
		e.preventDefault();
		
		// Obtener la clave de la fila seleccionada
		if (filaSeleccionada && filaSeleccionada.length > 0) {
			var clave = filaSeleccionada.data('clave');
			console.log(clave);
			
			
			// Cargar los datos del empleado en el modal
			if (typeof cargarData === 'function' && jsonNominaConfianza) {
				cargarData(jsonNominaConfianza, clave);
			}
		} else {
		
		}
		
		// Mostrar modal de detalles
		$('#modal-detalles').show();
		// Ocultar el menú contextual
		$menu.hide();
	});
}

// Función para cerrar el modal
function cerrarModalDetalles() {
	$("#cerrar-modal-detalles").click(function (e) { 
		e.preventDefault();
		$('#modal-detalles').hide();
		limpiarModalDetalles();
	});
}

function limpiarModalDetalles() {
    // Limpiar campos de información básica
    $('#campo-nombre').text('');
    $('#campo-clave').text('');
    $('#nombre-empleado-modal').text('');

    // Limpiar campos de percepciones
    $('#mod-sueldo-semanal').val('');
	$('#mod-vacaciones').val('');

	// Limpiar campos de conceptos
    $('#mod-isr').val('');
    $('#mod-imss').val('');
    $('#mod-infonavit').val('');

    // Limpiar campos de deducciones
    $('#mod-tarjeta').val('');
    $('#mod-prestamo').val('');
    $('#mod-uniformes').val('');
    $('#mod-checador').val('');
    $('#mod-retardos').val('');
    $('#mod-inasistencias').val('');
    $('#mod-permiso').val('');

 

    // Limpiar tabla de registros
    $('#tabla-checador tbody').empty();

	// Limpiar conceptos personalizados
	$('#contenedor-conceptos-adicionales').empty();

	// Limpiar deducciones personalizadas
	$('#contenedor-deducciones-adicionales').empty();

    // Limpiar eventos especiales
    $('#olvidos-checador-content').empty();
    $('#retardos-content').empty();
    $('#faltas-content').empty();

    // Limpiar totales
    $('#total-olvidos-checador').text('');
    $('#total-retardos').text('');
    $('#total-faltas').text('');
}
