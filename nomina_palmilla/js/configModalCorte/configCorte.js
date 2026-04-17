let rejas_totales = document.getElementById("rejas_totales");
let precio_reja = document.getElementById("precio_reja");
let total_pagar = document.getElementById("total_pagar");
const modalCorte = new bootstrap.Modal(document.getElementById("modalCorte"));

// Dias de la semana en el orden ideal para la nómina (DOMINGO = 0, LUNES = 1, ..., SABADO = 6)
const dias_nomina = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

$(document).ready(function () {

    obtenerTablasRancho();
    llenar_cuerpo_tabla_pagos_por_dia();
    buscar_cortador();
    buscar_cortador_nomina();


});

/**
 * ====================================================================
 * ====================================================================
 * +++++ FUNCIONES PARA LLENAR LAS TABLAS DE LOS PAGOS DE DOMINA  +++++
 * ====================================================================
 * ====================================================================
 */


/**
 * Obtiene un rango de fechas entre dos fechas dadas
 * @param {String} inicioStr 
 * @param {String} finStr 
 * @returns 
 */
function obtenerRangoFechas(inicioStr, finStr) {
    const meses = {
        Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4, Jun: 5,
        Jul: 6, Ago: 7, Sep: 8, Oct: 9, Nov: 10, Dic: 11
    };

    const mesesInv = Object.keys(meses); // ["Ene","Feb",...]

    // Función para convertir "12/Ene/2026" a Date
    function parseFecha(str) {
        const [dia, mesAbrev, anio] = str.split("/");
        return new Date(anio, meses[mesAbrev], dia);
    }

    // Función para formatear Date a "12/Ene/2026"
    function formatearFecha(date) {
        const dia = date.getDate();
        const mesAbrev = mesesInv[date.getMonth()];
        const anio = date.getFullYear();
        return `${dia}/${mesAbrev}/${anio}`;
    }

    // Función para dar o quitar dias a una fecha
    function moverDias(fecha, dias) {
        const nueva = new Date(fecha);
        nueva.setDate(nueva.getDate() + dias);
        return nueva;
    }

    // Convertir las fechas de inicio y fin a objetos Date
    let inicio = parseFecha(inicioStr);
    let fin = parseFecha(finStr);

    // Quitar un día tanto al inicio como al fin
    inicio = moverDias(inicio, 0);
    fin = moverDias(fin, 0);

    const resultado = [];
    let actual = new Date(inicio);

    while (actual <= fin) {
        resultado.push(formatearFecha(actual));
        actual.setDate(actual.getDate() + 1);
    }

    return resultado;
}

/**
 * 
 * @param {String} fechaStr Fecha con formato "12/Ene/2026"
 * @returns Nombre del día de la semana en español (ej. "LUNES")
 */
function obtenerDiaSemana(fechaStr) {
    // Mapeo de meses abreviados en español a número (0 = enero)
    const meses = {
        Ene: 0,
        Feb: 1,
        Mar: 2,
        Abr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Ago: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dic: 11
    };

    // Separar la cadena
    const [dia, mesStr, anio] = fechaStr.split("/");
    const mes = meses[mesStr];

    // Crear objeto Date
    const fecha = new Date(anio, mes, dia);

    // getDay() devuelve: 0=Domingo, 1=Lunes, ..., 6=Sábado
    const indice = fecha.getDay();

    // Ajustar al arreglo dias_nomina
    return dias_nomina[indice];
}

/**
 * Función para llenar el cuerpo de la tabla de pagos por día con las fechas del rango y los inputs correspondientes
 */
function llenar_cuerpo_tabla_pagos_por_dia() {
    // Limpiar el cuerpo de la tabla antes de llenarlo
    $("#cuerpo_tabla_pagos_por_dia", "#cuerpo_tabla_pagos_por_dia_nomina").html("");

    // Variables temporales para construir el HTML de las filas
    let tmp = ``;
    let tmp_editar = ``;

    // Validar que el JSON de nómina no sea null antes de intentar acceder a sus propiedades
    if (jsonNominaPalmilla == null) {
        return;
    }

    // Obtener el rango de fechas entre fecha_inicio y fecha_cierre
    const rangoFechas = obtenerRangoFechas(jsonNominaPalmilla.fecha_inicio, jsonNominaPalmilla.fecha_cierre);

    // ======================================================
    // Generar las filas de la tabla con las fechas del rango
    // ====================================================== 

    for (let i = 0; i < dias_nomina.length; i++) {
        tmp += `
            <tr>
                <td>${obtenerDiaSemana(rangoFechas[i])}</td>
                <td>${rangoFechas[i]}</td>
                <td>
                    <input type="number" step="0.01" min="0"
                        class="form-control shadow-sm pago_del_dia"
                        name="pago_${obtenerDiaSemana(rangoFechas[i]).toLowerCase()}"
                        id="pago_${obtenerDiaSemana(rangoFechas[i]).toLowerCase()}"
                        placeholder="Pago del día">
                </td>
                <td class="text-center">
                    <button
                        class="btn btn-outline-danger btn_limpiar_dia"
                        type="button"
                        title="Limpiar fila"><i class="bi bi-eraser-fill"></i></button>
                </td>
            </tr>
        `;
    }

    tmp += `
        <tr>
            <td></td>
            <td>Total:</td>
            <td class="text-end"><strong id="total_pagos">$0.00</strong></td>
            <td></td>
        </tr>
    `;


    // ============================================================================
    // Generar las filas de la tabla con las fechas del rango para editar la nómina
    // ============================================================================

    for (let i = 0; i < dias_nomina.length; i++) {
        tmp_editar += `
            <tr>
                <td>${obtenerDiaSemana(rangoFechas[i])}</td>
                <td>${rangoFechas[i]}</td>
                <td>
                    <input type="number" step="0.01" min="0"
                        class="form-control shadow-sm pago_del_dia_editar"
                        name="pago_editar_${obtenerDiaSemana(rangoFechas[i]).toLowerCase()}"
                        id="pago_editar_${obtenerDiaSemana(rangoFechas[i]).toLowerCase()}"
                        placeholder="Pago del día">
                </td>
                <td class="text-center">
                    <button 
                        class="btn btn-outline-danger btn_limpiar_dia" 
                        type="button" 
                        title="Limpiar fila"><i class="bi bi-eraser-fill"></i></button>
                </td>
            </tr>
        `;
    }

    tmp_editar += `
        <tr>
            <td></td>
            <td>Total:</td>
            <td class="text-end"><strong id="total_pagos_nomina_editar">$0.00</strong></td>
            <td></td>
        </tr>
    `;

    // ========================================================
    // Agregar las filas al cuerpo de la tabla
    // ========================================================
    $("#cuerpo_tabla_pagos_por_dia").html(tmp);
    $("#cuerpo_tabla_pagos_por_dia_nomina").html(tmp_editar);
}

/**
 * ====================================================================
 * ====================================================================
 * +++++ FUNCIONES PARA CONFIGURAR LA PARTE DE LAS REJAS DE LIMON +++++
 * ====================================================================
 * ====================================================================
 */

/**
 * Función para mostrar alertas utilizando SweetAlert2
 * @param {string} icono 
 * @param {string} titulo 
 * @param {string} texto 
 * @param {boolean} toast 
 */
function alerta(icono, titulo, texto, toast = false) {
    if (toast) {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: icono,
            title: titulo
        });
        return;
    }

    Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        confirmButtonText: "Entendido"
    });
}


/**
 * ===========================================================
 * FUNCIONES PREVIAS PARA DAR FUNCIONALIDAD AL MODAL DE CORTE
 * ===========================================================
 */

/**
 * La funcion hace uso de la funcion obtenerHorarioRancho
 * En ella se incluye el nùmero de tablas con las que
 * cuenta dicho rancho
 */
function obtenerTablasRancho() {
    // Obtener el id_area del Palmilla (siempre es 4)
    const id_area = 4;

    $.ajax({
        type: "GET",
        url: "../php/info-rancho.php",
        data: {
            accion: "obtenerHorarioRancho",
            id_area: id_area
        },
        dataType: "json",
        success: function (response) {
            let tablas = response.data.num_arboles;
            generarCheckboxes(tablas);
        },
        error: function (error) {
            console.error("Error al obtener el número de tablas: ", error);
        }
    });
}

/**
 * Funcion que genera checkboxes de acuerdo al numero de tablas que tenga el rancho
 * @param {int} numTablas 
 */
function generarCheckboxes(numTablas) {
    const contenedor = document.getElementById("cuerpo_tablas_corte");
    contenedor.innerHTML = "";
    for (let i = 1; i <= numTablas; i++) {
        const div = document.createElement("div");
        div.className = "form-check form-check-inline";

        const input = document.createElement("input");
        input.className = "form-check-input check-tabla";
        input.type = "checkbox";
        input.id = "tabla" + i;
        input.value = i;

        const label = document.createElement("label");
        label.className = "form-check-label";
        label.setAttribute("for", input.id);
        label.textContent = i;

        div.appendChild(input);
        div.appendChild(label);
        contenedor.appendChild(div);
    }
}

/**
 * Obtiene los valores de las tablas seleccionadas
 * @returns integer[]
 */
function obtenerSeleccionados() {
    const seleccionados = [];
    document.querySelectorAll("#cuerpo_tablas_corte input:checked").forEach(chk => {
        seleccionados.push(chk.value);
    });
    return seleccionados;
}

/**
 * Genera inputs para la cantidad de rejas por cada tabla seleccionada
 */
function generarInputsCantidadRejas(tablas_seleccionadas) {
    // Limpiar el contenedor de inputs
    const cuerpo = document.getElementById("cuerpo_cantidad_rejas");

    cuerpo.innerHTML = "";
    rejas_totales.value = 0;
    // Crear inputs para cada tabla seleccionada
    tablas_seleccionadas.forEach(tabla => {
        const div = document.createElement("div");

        div.className = "col-md-4 mb-2";
        const label = document.createElement("label");
        label.textContent = `Rejas de la tabla ${tabla}: `;
        label.setAttribute("for", "rejas_tabla_" + tabla);


        const input = document.createElement("input");
        input.type = "number";
        input.className = "form-control mb-3 shadow-sm cantidad_rejas";
        input.id = "rejas_tabla_" + tabla;
        input.name = "rejas_tabla[]";
        input.placeholder = "Ej. 150";

        div.appendChild(label); div.appendChild(input);
        cuerpo.appendChild(div);
    });
}

/**
 * Evento que se dispara al cambiar el estado de los checkboxes
 * y genera los inputs para la cantidad de rejas por cada tabla seleccionada
 */
$(document).on("change", ".check-tabla", function (e) {
    e.preventDefault();

    let tablas_seleccionadas = obtenerSeleccionados();
    total_pagar.value = "";

    generarInputsCantidadRejas(tablas_seleccionadas);
});

/**
 * Evento que se dispara al ingresar un valor en los inputs de cantidad de rejas
 * y suma el total de rejas ingresadas en todos los inputs para mostrarlo en el input de cantidad total de rejas
 */
$(document).on("input", "#precio_reja, .cantidad_rejas", function (e) {
    e.preventDefault();

    let cantidad_total_rejas = 0;

    // Iterar sobre cada input de cantidad de rejas y sumar sus valores
    $(".cantidad_rejas").each(function () {
        let valor = parseInt($(this).val(), 10);
        if (!isNaN(valor)) {
            cantidad_total_rejas += valor;
        }
    });

    // Actualizar el total de rejas
    rejas_totales.value = cantidad_total_rejas;

    // Calcular el total a pagar
    let precio = parseFloat(precio_reja.value) || 0;
    let total = cantidad_total_rejas * precio;

    // Dar formato de moneda (ejemplo: pesos mexicanos)
    let formatoMoneda = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2
    });

    total_pagar.value = formatoMoneda.format(total);
});


/**
 * Evento que se dispara al ingresar texto en el input del nombre del cortador
 * Convierte el texto a mayúsculas y quita acentos
 */
$(document).on("input", "#nombre_cortador", function () {
    let texto = $(this).val();

    // Convertir a mayúsculas
    texto = texto.toUpperCase();

    // Quitar acentos
    texto = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Actualizar el valor del input
    $(this).val(texto);
});


/**
 * ===============================================
 * Funcion para buscar cortador con autocompletado
 * ===============================================
 */
function buscar_cortador() {
    $("#nombre_cortador").autocomplete({
        source: function (request, response) {

            // 1. Buscar el departamento Corte
            let departamento = jsonNominaPalmilla.departamentos
                .find(d => d.nombre === "Corte");

            // 2. Obtener nombres de empleados con concepto REJA sin duplicados
            let empleados = departamento
                ? [...new Set(
                    departamento.empleados
                        .filter(emp => emp.concepto === "REJA")
                        .map(emp => emp.nombre)
                )]
                : [];

            // 3. Filtrar según lo que escribe el usuario
            let resultados = empleados.filter(nombre =>
                nombre.toLowerCase().includes(request.term.toLowerCase())
            );

            // 4. Formato que requiere autocomplete
            response(resultados.map(nombre => ({
                label: nombre,
                value: nombre
            })));

        },
        minLength: 1,
        appendTo: "#modalCorte"
    });
}


/**
 * ====================================================================
 * GUARDAR EL TICKET DEL CORTE
 * ====================================================================
 */

$(document).on("submit", "#form_corte", function (e) {
    e.preventDefault();

    // Recuperar los valores de los campos del formulario
    let folio = $("#folio_corte").val().trim();
    let nombreCortador = $("#nombre_cortador").val().trim();
    let fecha = $("#fecha_corte").val().trim();


    // --------------------------------------
    // Validar que los campos no estén vacíos
    // --------------------------------------
    if (folio === "") {
        alerta("info", "Folio requerido", "Por favor, ingresa el folio del corte");
        return;
    }

    if (nombreCortador === "") {
        alerta("info", "Nombre requerido", "Por favor, ingresa el nombre del cortador");
        return;
    }

    if (fecha === "") {
        alerta("info", "Fecha requerida", "Por favor, ingresa la fecha del corte");
        return;
    }


    // ----------------------------------------
    // Validar si seleccione al menos una tabla
    // ----------------------------------------
    let tablas_seleccionadas = obtenerSeleccionados();
    if (tablas_seleccionadas.length === 0) {
        alerta("info", "Tablas no seleccionadas", "Por favor, selecciona al menos una tabla para el corte");
        return;
    }


    // -----------------------------------------------------------------------------------
    // Validar que se hayan ingresado las cantidades de rejas para cada tabla seleccionada
    // -----------------------------------------------------------------------------------
    let valido = true;

    $(".cantidad_rejas").each(function () {
        let valor = $(this).val().trim();
        if (valor === "" || isNaN(valor)) {
            valido = false;
            return false; // salir del each en cuanto encuentre uno vacío
        }
    });

    if (!valido) {
        alerta("info", "Cantidad de rejas requerida", "Por favor, ingresa la cantidad de rejas para cada tabla seleccionada");
        return; // detener aquí
    }


    // ---------------------------------------------------
    // Validar que la cantidad total de rejas no sea cero
    // ---------------------------------------------------
    let cantidad_total_rejas = parseInt(rejas_totales.value, 10);
    if (isNaN(cantidad_total_rejas) || cantidad_total_rejas <= 0) {
        alerta("info", "Cantidad total de rejas inválida", "La cantidad total de rejas debe ser un número mayor a cero");
        return;
    }

    // Recuperar las cantidades de rejas por tabla
    let datosRejas = [];
    $(".cantidad_rejas").each(function () {
        let valor = $(this).val().trim();
        let id = $(this).attr("id"); // ej. rejas_tabla_1
        let tabla = id.replace("rejas_tabla_", ""); // extraer número de tabla

        if (valor !== "" && !isNaN(valor)) {
            datosRejas.push({
                tabla: tabla,
                cantidad: parseInt(valor, 10)
            });
        }
    });


    // Recuperar el precio de la reja
    let precio = parseFloat(precio_reja.value) || 0;

    /**
     * ============================================================ 
     * AGREGAR EL TICKET EL JSON DE NÓMINA
     * ============================================================
     */

    // Validar si el folio ya existe
    if (folioExiste(folio)) {

        Swal.fire({
            title: "Folio duplicado",
            text: "Este folio ya existe. ¿Deseas registrarlo de todas formas?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, registrarlo",
            cancelButtonText: "Cancelar"
        }).then((result) => {

            if (result.isConfirmed) {
                guardarTicketCorte(folio, nombreCortador, fecha, datosRejas, precio);
            }

        });

        return;
    }

    guardarTicketCorte(folio, nombreCortador, fecha, datosRejas, precio);

});


/**
 * Función para guardar el ticket del corte en el JSON de nómina
 */
function guardarTicketCorte(folio, nombreCortador, fecha, datosRejas, precio) {

    let nuevoTicket = {
        folio,
        fecha,
        datosRejas,
        precio_reja: precio
    };

    let departamento = jsonNominaPalmilla.departamentos.find(
        d => d.nombre === "Corte"
    );

    if (!departamento) {
        departamento = {
            id_departamento: 800,
            nombre: "Corte",
            empleados: []
        };
        jsonNominaPalmilla.departamentos.push(departamento);
    }

    let empleado = departamento.empleados.find(e =>
        e.nombre === nombreCortador && e.concepto === "REJA"
    );

    if (empleado) {

        if (!Array.isArray(empleado.tickets)) {
            empleado.tickets = [];
        }

        empleado.tickets.push(nuevoTicket);

    } else {

        departamento.empleados.push({
            nombre: nombreCortador,
            concepto: "REJA",
            tickets: [nuevoTicket]
        });

    }

    // Mostrar alerta de éxito y limpiar el formulario
    alerta("success", "Corte guardado", "El ticket del corte se ha guardado correctamente", true);
    limpiar_formulario_corte();
    //modalCorte.hide();

    let dep = $("#filtro_departamento").val();

    if (dep == 800) {
        mostrarDatosTablaCorte(jsonNominaPalmilla);
    }

}


/**
 * Función para verificar si un folio ya existe en los tickets de corte
 */
function folioExiste(folio) {

    for (let dep of jsonNominaPalmilla.departamentos) {

        for (let emp of dep.empleados) {

            if (emp.concepto === "REJA" && Array.isArray(emp.tickets)) {

                let encontrado = emp.tickets.find(t => t.folio === folio);

                if (encontrado) {
                    return true;
                }

            }

        }

    }

    return false;
}


/**
 * Función para limpiar el formulario del corte
 */
function limpiar_formulario_corte() {
    $("#form_corte").trigger("reset");
    $("#cuerpo_cantidad_rejas").html("");

    $("#form_corte_nomina").trigger("reset");
    $("#total_pagos").html("$0.00");
}


/** *********************************************************************************************************************************** */
/** *********************************************************************************************************************************** */

/**
 * ====================================================================
 * ====================================================================
 * +++++ FUNCIONES PARA CONFIGURAR LA PARTE DE LAS NOMINAS +++++
 * ====================================================================
 * ====================================================================
 */


/**
 * Evento para limpiar la fila del pago por dia
 */
$(document).on("click", ".btn_limpiar_dia", function (e) {
    e.preventDefault();

    // Recuperar la fila donde se hizo clic
    const $fila = $(this).closest('tr');
    // Limpiar todos los campos de la fila
    $fila.find('input').val('');

    // Calcular el total después de copiar el salario
    calcularTotalPagos();
});


/**
 * Evento para copiar el salario diario a todos los días de pago por día
 */
$(document).on("click", "#btn_copiar_salario", function (e) {
    e.preventDefault();

    let salario = $("#salario_diario").val().trim();

    if (salario === "" || isNaN(salario)) {
        alerta("info", "Salario diario inválido", "Por favor, ingresa un salario diario válido para copiar");
        return;
    }

    salario = parseFloat(salario).toFixed(2);

    // Nombre del empleado
    const empleadoNombre = $("#nombre_cortador_nomina").val().trim();

    if (empleadoNombre === "") {
        alerta("info", "Nombre requerido", "Ingresa el nombre del Cabo para copiar el salario diario");
        return;
    }

    // ======================================
    // Buscar departamento Corte (si existe)
    // ======================================
    let corteDepto = null;

    if (jsonNominaPalmilla.departamentos) {
        corteDepto = jsonNominaPalmilla.departamentos.find(d => d.nombre === "Corte");
    }

    // ======================================
    // Obtener tickets (si existen)
    // ======================================
    let ticketsReja = [];

    if (corteDepto && corteDepto.empleados) {
        const empleadoReja = corteDepto.empleados.find(e =>
            e.nombre === empleadoNombre && e.concepto === "REJA"
        );

        if (empleadoReja && empleadoReja.tickets) {
            ticketsReja = empleadoReja.tickets;
        }
    }

    // ======================================
    // Set de fechas con REJA
    // ======================================
    const fechasConReja = new Set();

    ticketsReja.forEach(ticket => {
        if (ticket.fecha) {
            fechasConReja.add(ticket.fecha); // YYYY-MM-DD
        }
    });

    console.log("Empleado:", empleadoNombre);
    console.log("Fechas con REJA:", [...fechasConReja]);

    // ======================================
    // Función para convertir fecha tabla → ISO
    // ======================================
    function convertirFechaAISO(fechaStr) {
        const meses = {
            "ENE": "01",
            "FEB": "02",
            "MAR": "03",
            "ABR": "04",
            "MAY": "05",
            "JUN": "06",
            "JUL": "07",
            "AGO": "08",
            "SEP": "09",
            "OCT": "10",
            "NOV": "11",
            "DIC": "12"
        };

        const partes = fechaStr.split("/");

        if (partes.length !== 3) return null;

        const dia = partes[0].padStart(2, "0");
        const mes = meses[partes[1].toUpperCase()];
        const anio = partes[2];

        if (!mes) return null;

        return `${anio}-${mes}-${dia}`;
    }

    // ======================================
    // Llenar tabla
    // ======================================
    $("#cuerpo_tabla_pagos_por_dia")
        .find("tr")
        .not(":last")
        .each(function () {

            const fechaTexto = $(this).find("td:eq(1)").text().trim();
            const fechaISO = convertirFechaAISO(fechaTexto);

            const input = $(this).find('input[type="number"]');

            // Si no se pudo convertir, limpiar
            if (!fechaISO) {
                input.val("");
                return;
            }
            
            // - Sin tickets → llenar todo
            // - Con tickets → solo fechas coincidentes
            if (fechasConReja.size === 0 || fechasConReja.has(fechaISO)) {
                input.val(salario);
            } else {
                input.val("");
            }
        });

    // Calcular total
    calcularTotalPagos();
});


/**
 * Función para detectar si ingreso un valor y calcular el total de la semana
 */
$(document).on("input", "#cuerpo_tabla_pagos_por_dia input[type='number']", function (e) {
    e.preventDefault();

    // Calcular el total cada vez que se ingrese un valor en los inputs de pago por día
    calcularTotalPagos();
});


/**
 * Función para formatear los valores de pago por día al perder el foco
 */
$(document).on("blur", ".pago_del_dia", function () {

    let valor = $(this).val().trim();

    if (valor === "" || isNaN(valor)) {
        $(this).val("");
        return;
    }

    valor = parseFloat(valor).toFixed(2);

    $(this).val(valor);
});


/**
 * Función para calcular el total de pagos por día sumando los valores
 */
function calcularTotalPagos() {
    let total = 0;

    $("#cuerpo_tabla_pagos_por_dia")
        .find('input[type="number"]')
        .each(function () {
            let valor = parseFloat($(this).val());
            if (!isNaN(valor)) {
                total += valor;
            }
        });

    // Formateador de moneda
    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    $("#total_pagos").text(formatter.format(total));
}

/**
 * ========================================================
 * Funcion para buscar cortador con autocompletado (Nomina)
 * ========================================================
 */
function buscar_cortador_nomina() {
    $("#nombre_cortador_nomina").autocomplete({
        source: function (request, response) {

            // 1. Buscar el departamento Corte
            let departamento = jsonNominaPalmilla.departamentos
                .find(d => d.nombre === "Corte");

            // 2. Obtener nombres de empleados con concepto NOMINA sin duplicados
            let empleados = departamento
                ? [...new Set(
                    departamento.empleados
                        .filter(emp => emp.concepto === "REJA")
                        .map(emp => emp.nombre)
                )]
                : [];

            // 3. Filtrar según lo que escribe el usuario
            let resultados = empleados.filter(nombre =>
                nombre.toLowerCase().includes(request.term.toLowerCase())
            );

            // 4. Formato que requiere autocomplete
            response(resultados.map(nombre => ({
                label: nombre,
                value: nombre
            })));

        },
        minLength: 1,
        appendTo: "#modalCorte"
    });
}

/**
 * Evento que se dispara al ingresar texto en el input del nombre del cortador
 * Convierte el texto a mayúsculas y quita acentos (Nomina)
 */
$(document).on("input", "#nombre_cortador_nomina", function () {
    let texto = $(this).val();

    // Convertir a mayúsculas
    texto = texto.toUpperCase();

    // Quitar acentos
    texto = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Actualizar el valor del input
    $(this).val(texto);
});


/**
 * Evento para crear la nomina del empleado
 */
$(document).on('submit', '#form_corte_nomina', function (e) {
    e.preventDefault();

    // Recuperar los valores de los campos del formulario
    let nombreCortador = $("#nombre_cortador_nomina").val().trim();

    // --------------------------------------
    // Validar que los campos no estén vacíos
    // --------------------------------------
    if (nombreCortador === "") {
        alerta("info", "Nombre requerido", "Por favor, ingresa el nombre del cortador");
        return;
    }


    // -------------------------------------------------------
    // Validar que por lo menos un día tenga un pago ingresado
    // -------------------------------------------------------
    let alMenosUnPago = false;

    $(".pago_del_dia").each(function () {
        let valor = parseFloat($(this).val());

        if (!isNaN(valor) && valor > 0) {
            alMenosUnPago = true;
            return false; // rompe el each
        }
    });

    if (!alMenosUnPago) {
        alerta("info", "Pago requerido", "Debes ingresar pago en al menos un día");
        return;
    }

    // RECUPERAR LOS PAGOS POR DIA
    let pagos = obtenerPagosPorDia();

    console.log(pagos);


    if (pagos.length === 0) {
        alerta("info", "Pago requerido", "Debes ingresar pago en al menos un día");
        return;
    }

    // 1. Buscar o crear departamento Corte
    let departamento = jsonNominaPalmilla.departamentos.find(d => d.nombre === "Corte");

    if (!departamento) {
        departamento = {
            id_departamento: 800,
            nombre: "Corte",
            empleados: []
        };
        jsonNominaPalmilla.departamentos.push(departamento);
    }

    if (!Array.isArray(departamento.empleados)) {
        departamento.empleados = [];
    }

    // 2. Buscar empleado con concepto NOMINA
    let empleadoExistente = departamento.empleados.find(e =>
        e.nombre === nombreCortador && e.concepto === "NOMINA"
    );

    if (empleadoExistente) {

        // Ya existe nómina
        alerta(
            "info",
            "Nomina ya registrada",
            "Este cortador ya tiene una nomina registrada."
        );

        return; // detener proceso
    }

    // 3. Si no existe, crear nuevo empleado con su nómina
    departamento.empleados.push({
        nombre: nombreCortador,
        concepto: "NOMINA",
        nomina: pagos
    });


    // Mostrar alerta de éxito y limpiar el formulario
    alerta("success", "Corte guardado", "Nomina guardada con exito", true);
    limpiar_formulario_corte();
    //modalCorte.hide();

    // Cargar tabla principal
    let dep = $("#filtro_departamento").val();
    if (dep == 800) {
        mostrarDatosTablaCorte(jsonNominaPalmilla);
    }

});


/**
 * Función para obtener los pagos por día ingresados en la tabla de pagos por día
 */
function obtenerPagosPorDia() {

    let pagos = [];

    $("#cuerpo_tabla_pagos_por_dia tr").not(":last").each(function () {

        let dia = $(this).find("td:eq(0)").text().trim();
        let valor = parseFloat($(this).find(".pago_del_dia").val());

        // Si es NaN o vacío, convertir a 0
        if (isNaN(valor)) {
            valor = 0;
        }

        pagos.push({
            dia: dia,
            pago: parseFloat(valor.toFixed(2))
        });

    });

    return pagos;
}