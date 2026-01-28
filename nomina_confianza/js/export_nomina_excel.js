// Función para llenar el select de departamentos desde la BD
function llenarDepartamentos() {
    $.ajax({
        url: '../php/obtenerDepartamentos.php',
        type: 'GET',
        dataType: 'json',
        success: function (data) {

            var select = $('#modal-sw-depto');
            select.empty();

            // Opción general
            select.append('<option value="Todos">Todos</option>');

            // Opción fija
            select.append('<option value="0">Sin Seguro</option>');

            // Departamentos desde la BD
            $.each(data, function (index, depto) {
                select.append(
                    '<option value="' + depto.id_departamento + '">' +
                        depto.nombre_departamento +
                    '</option>'
                );
            });
        },
        error: function () {
            console.error('Error al cargar departamentos');
        }
    });
}

function abrirModal() {
    $('#btn_export_excel').on('click', function () {
        new bootstrap.Modal($('#modalExportExcel')[0]).show();
        llenarDepartamentos();
    });
}

// Función simple: obtiene parámetros seleccionados para el Excel
// - Departamento (id y nombre)
// - Empresa (id y nombre)
// - Fecha/NOMBRE de la nómina desde #nombre_nomina
function obtenerParametrosExportacion() {
    const $depto = $('#modal-sw-depto');
    const $empresa = $('#modal-sw-empresa');

    const departamento = {
        id: $depto.val(),
        nombre: $depto.find('option:selected').text()
    };

    const empresa = {
        id: $empresa.val(),
        nombre: $empresa.find('option:selected').text()
    };

    // Puede contener nombre y/o fecha, lo usamos tal cual por ahora
    const fecha_nomina = ($('#nombre_nomina').text() || '').trim();

    return { departamento, empresa, fecha_nomina };
}

// Generar Excel: envía parámetros al backend y descarga el archivo
$(document).on('click', '#btn_generar_excel_modal', function () {
    const params = obtenerParametrosExportacion();

    // Intentar leer número de semana del DOM (si existe)
    const numero_semana = ($('#num_semana').text() || '').trim();

    // Armar un título simple para el archivo
    const titulo = `${params.departamento.nombre || 'Nomina'} - ${params.empresa.nombre || ''}`.trim();

    const payload = {
        departamento: params.departamento,
        empresa: params.empresa,
        fecha_nomina: params.fecha_nomina,
        numero_semana: numero_semana,
        titulo: titulo,
        nomina: (typeof jsonNominaConfianza !== 'undefined' ? jsonNominaConfianza : null)
    };

    fetch('../php/generar_excel_simple.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async (res) => {
        if (!res.ok) throw new Error('Error al generar el Excel');
        const dispo = res.headers.get('Content-Disposition') || '';
        let suggested = 'nomina_confianza.xlsx';
        const m = /filename="?([^";]+)"?/i.exec(dispo);
        if (m && m[1]) suggested = m[1];
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = suggested;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    })
    .catch(err => {
        console.error(err);
        if (window.Swal) {
            Swal.fire('Error', 'No se pudo generar el Excel', 'error');
        } else {
            alert('No se pudo generar el Excel');
        }
    });
});
