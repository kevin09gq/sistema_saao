<?php

require_once __DIR__ . '/../../vendor/autoload.php';
include_once __DIR__ . '/../../conexion/conexion.php';

$conexion = $conexion ?? null;
if (!($conexion instanceof mysqli)) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode(['mensaje' => 'No se pudo establecer conexión a la base de datos.']);
    exit;
}

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(405);
    echo json_encode(['mensaje' => 'Método no permitido.']);
    exit;
}

$empleadosIds = json_decode($_POST['empleados'] ?? '[]', true);
$camposSeleccionados = json_decode($_POST['campos'] ?? '[]', true);
$unirHojas = ($_POST['unir_hojas'] ?? '0') === '1';

if (!is_array($empleadosIds) || !count($empleadosIds)) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(400);
    echo json_encode(['mensaje' => 'No se recibieron empleados para exportar.']);
    exit;
}

if (!is_array($camposSeleccionados)) {
    $camposSeleccionados = [];
}

$camposFijos = ['clave_empleado', 'nombre', 'ap_paterno', 'ap_materno'];
$camposEmpleadoInfo = ['imss', 'curp', 'domicilio', 'sexo', 'grupo_sanguineo', 'fecha_nacimiento', 'rfc_empleado', 'estado_civil', 'num_casillero', 'biometrico', 'telefono_empleado', 'enfermedades_alergias', 'id_empresa', 'id_area', 'id_departamento', 'id_puestoEspecial', 'salario_semanal', 'salario_diario', 'horario_fijo', 'fecha_alta_empresa', 'fecha_alta_imss', 'status_nss'];
$camposEmergencia = ['emergencia_nombre', 'emergencia_ap_paterno', 'emergencia_ap_materno', 'emergencia_telefono', 'emergencia_parentesco', 'emergencia_domicilio'];
$camposBeneficiario = ['beneficiario_nombre', 'beneficiario_ap_paterno', 'beneficiario_ap_materno', 'beneficiario_parentesco', 'beneficiario_porcentaje'];
$ordenCampos = [
    'imss',
    'curp',
    'domicilio',
    'sexo',
    'grupo_sanguineo',
    'fecha_nacimiento',
    'rfc_empleado',
    'estado_civil',
    'num_casillero',
    'biometrico',
    'telefono_empleado',
    'enfermedades_alergias',
    'id_empresa',
    'id_area',
    'id_departamento',
    'id_puestoEspecial',
    'salario_semanal',
    'salario_diario',
    'horario_fijo',
    'fecha_alta_empresa',
    'fecha_alta_imss',
    'status_nss',
    'emergencia_nombre',
    'emergencia_ap_paterno',
    'emergencia_ap_materno',
    'emergencia_telefono',
    'emergencia_parentesco',
    'emergencia_domicilio',
    'reingresos',
    'beneficiario_nombre',
    'beneficiario_ap_paterno',
    'beneficiario_ap_materno',
    'beneficiario_parentesco',
    'beneficiario_porcentaje',
    'horario_reloj',
    'horario_oficial',
];

// Etiquetas para las columnas
$labels = [
    'clave_empleado' => 'Clave',
    'nombre' => 'Nombre',
    'ap_paterno' => 'Apellido paterno',
    'ap_materno' => 'Apellido materno',
    'imss' => 'IMSS',
    'curp' => 'CURP',
    'domicilio' => 'Domicilio',
    'sexo' => 'Sexo',
    'grupo_sanguineo' => 'Grupo sanguíneo',
    'fecha_nacimiento' => 'Fecha de nacimiento',
    'rfc_empleado' => 'RFC',
    'estado_civil' => 'Estado civil',
    'num_casillero' => 'Número de casillero',
    'biometrico' => 'Biométrico',
    'telefono_empleado' => 'Teléfono',
    'enfermedades_alergias' => 'Enfermedades/Alergias',
    'id_empresa' => 'Empresa',
    'id_area' => 'Área',
    'id_departamento' => 'Departamento',
    'id_puestoEspecial' => 'Puesto',
    'salario_semanal' => 'Salario semanal',
    'salario_diario' => 'Salario diario',
    'horario_fijo' => 'Horario fijo',
    'fecha_alta_empresa' => 'Fecha empresa',
    'fecha_alta_imss' => 'Fecha IMSS',
    'status_nss' => 'Estatus',
    'emergencia_nombre' => 'Nombre ',
    'emergencia_ap_paterno' => 'Apellido paterno',
    'emergencia_ap_materno' => 'Apellido materno',
    'emergencia_telefono' => 'Teléfono',
    'emergencia_parentesco' => 'Parentesco',
    'emergencia_domicilio' => 'Domicilio',
    'reingresos' => 'Reingresos / Fechas',
    'beneficiario_nombre' => 'Nombre',
    'beneficiario_ap_paterno' => 'Apellido paterno',
    'beneficiario_ap_materno' => 'Apellido materno',
    'beneficiario_parentesco' => 'Parentesco',
    'beneficiario_porcentaje' => 'Porcentajes',
    'horario_reloj' => 'Horarios',
    'horario_oficial' => 'Horarios oficiales',
];

$camposSeleccionados = array_values(array_unique(array_filter($camposSeleccionados, function ($campo) use ($labels, $camposFijos) {
    return isset($labels[$campo]) && !in_array($campo, $camposFijos, true);
})));

$mostrarIdentificacionEmpleado = count(array_intersect(
    $camposSeleccionados,
    array_merge($camposEmpleadoInfo, $camposEmergencia, $camposBeneficiario)
)) > 0;

// ============================
// MODO PREVISUALIZACIÓN (JSON)
// ============================
if (isset($_POST['preview']) && $_POST['preview'] === '1') {
    // Construir lista de columnas igual que en el Excel
    $columnas = $mostrarIdentificacionEmpleado ? ['clave_empleado', 'nombre', 'ap_paterno', 'ap_materno'] : [];
    foreach ($camposSeleccionados as $campo) {
        if (!in_array($campo, ['clave_empleado', 'nombre', 'ap_paterno', 'ap_materno'], true) && isset($labels[$campo])) {
            $columnas[] = $campo;
        }
    }

    $cachePreview = [];
    $obtenerPreview = function (int $idEmpleado) use (&$cachePreview, $conexion) {
        if (!isset($cachePreview[$idEmpleado])) {
            $cachePreview[$idEmpleado] = obtenerDatosEmpleado($conexion, $idEmpleado);
        }
        return $cachePreview[$idEmpleado];
    };

    $incluirHorarioReloj   = in_array('horario_reloj', $camposSeleccionados, true);
    $incluirHorarioOficial = in_array('horario_oficial', $camposSeleccionados, true);
    $incluirReingresos     = in_array('reingresos', $camposSeleccionados, true);

    // Excluir campos que van en sus propias pestañas
    $camposExcluirInfo = [];
    if ($incluirHorarioReloj)   $camposExcluirInfo[] = 'horario_reloj';
    if ($incluirHorarioOficial) $camposExcluirInfo[] = 'horario_oficial';
    if ($incluirReingresos)     $camposExcluirInfo[] = 'reingresos';

    $columnasInfo = array_values(array_filter($columnas, function ($campo) use ($camposExcluirInfo) {
        return !in_array($campo, $camposExcluirInfo, true);
    }));

    $columnasData = [];
    foreach ($columnasInfo as $campo) {
        if (str_starts_with($campo, 'emergencia_')) {
            $grupo = 'emergencia';
        } elseif (str_starts_with($campo, 'beneficiario_')) {
            $grupo = 'beneficiario';
        } else {
            $grupo = 'empleado';
        }
        $columnasData[] = ['key' => $campo, 'label' => $labels[$campo] ?? $campo, 'grupo' => $grupo];
    }

    $filas = [];
    $horariosReloj   = [];
    $horariosOficial  = [];
    $reingresosData   = [];
    $totalEmpleadosPreview = 0;

    foreach ($empleadosIds as $idEmpleado) {
        $idEmpleado = (int)$idEmpleado;
        if ($idEmpleado <= 0) continue;
        $datos = $obtenerPreview($idEmpleado);
        if (!$datos) continue;
        $totalEmpleadosPreview++;

        $beneficiarios = $datos['beneficiarios_lista'] ?? [];
        $incluyeCamposBeneficiario = in_array('beneficiario_nombre', $columnasInfo, true) || in_array('beneficiario_ap_paterno', $columnasInfo, true) || in_array('beneficiario_ap_materno', $columnasInfo, true);

        // Si no hay beneficiarios o no se seleccionaron campos de beneficiario, solo una fila
        if (!empty($columnasInfo) && (empty($beneficiarios) || !$incluyeCamposBeneficiario)) {
            $fila = [];
            foreach ($columnasInfo as $campo) {
                $fila[$campo] = $datos[$campo] ?? '';
            }
            $filas[] = $fila;
        } elseif (!empty($columnasInfo)) {
            // Una fila por cada beneficiario
            foreach ($beneficiarios as $ben) {
                $fila = [];
                foreach ($columnasInfo as $campo) {
                    if ($campo === 'beneficiario_nombre') {
                        $fila[$campo] = $ben['nombre'] ?? '';
                    } elseif ($campo === 'beneficiario_ap_paterno') {
                        $fila[$campo] = $ben['ap_paterno'] ?? '';
                    } elseif ($campo === 'beneficiario_ap_materno') {
                        $fila[$campo] = $ben['ap_materno'] ?? '';
                    } elseif ($campo === 'beneficiario_parentesco') {
                        $fila[$campo] = $ben['parentesco'] ?? '';
                    } elseif ($campo === 'beneficiario_porcentaje') {
                        $fila[$campo] = $ben['porcentaje'] ?? '';
                    } else {
                        $fila[$campo] = $datos[$campo] ?? '';
                    }
                }
                $filas[] = $fila;
            }
        }

        if ($incluirHorarioReloj) {
            $detalle = $datos['horario_reloj_detalle'] ?? [];
            $horariosReloj[] = [
                'clave'   => $datos['clave_empleado'] ?? '',
                'nombre'  => $datos['nombre_completo'] ?? '',
                'detalle' => is_array($detalle) ? $detalle : []
            ];
        }

        if ($incluirHorarioOficial) {
            $detalle = $datos['horario_oficial_detalle'] ?? [];
            $horariosOficial[] = [
                'clave'   => $datos['clave_empleado'] ?? '',
                'nombre'  => $datos['nombre_completo'] ?? '',
                'detalle' => is_array($detalle) ? $detalle : []
            ];
        }

        if ($incluirReingresos) {
            $detalle = $datos['reingresos_detalle'] ?? [];
            $reingresosData[] = [
                'clave'   => $datos['clave_empleado'] ?? '',
                'nombre'  => $datos['nombre_completo'] ?? '',
                'detalle' => is_array($detalle) ? $detalle : []
            ];
        }
    }

    $respuesta = [
        'columnas' => $columnasData,
        'filas'    => $filas,
        'total'    => $totalEmpleadosPreview,
        'mostrar_identificacion_empleado' => $mostrarIdentificacionEmpleado
    ];

    if ($incluirHorarioReloj) {
        $respuesta['horarios_reloj'] = $horariosReloj;
    }
    if ($incluirHorarioOficial) {
        $respuesta['horarios_oficial'] = $horariosOficial;
    }
    if ($incluirReingresos) {
        $respuesta['reingresos'] = $reingresosData;
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($respuesta, JSON_UNESCAPED_UNICODE);
    exit;
}

// Detectar qué tipos de datos se seleccionaron
$tieneEmpleado = count(array_intersect($camposSeleccionados, $camposEmpleadoInfo)) > 0;
$tieneEmergencia = count(array_intersect($camposSeleccionados, $camposEmergencia)) > 0;
$tieneBeneficiario = count(array_intersect($camposSeleccionados, $camposBeneficiario)) > 0;

define('COLOR_ENCABEZADO', '06750E');
define('COLOR_TEXTO_ENCABEZADO', 'FFFFFFFF');

function textoSeguro($valor): string
{
    if ($valor === null) {
        return '';
    }

    if (is_bool($valor)) {
        return $valor ? 'Sí' : 'No';
    }

    return trim((string)$valor);
}

function formatoFecha(?string $valor): string
{
    if (!$valor || $valor === '0000-00-00') {
        return '';
    }

    $timestamp = strtotime($valor);
    if (!$timestamp) {
        return $valor;
    }

    $meses = [
        1 => 'ENE', 2 => 'FEB', 3 => 'MAR', 4 => 'ABR', 5 => 'MAY', 6 => 'JUN',
        7 => 'JUL', 8 => 'AGO', 9 => 'SEP', 10 => 'OCT', 11 => 'NOV', 12 => 'DIC'
    ];

    $dia = date('d', $timestamp);
    $mes = $meses[(int)date('n', $timestamp)];
    $anio = date('Y', $timestamp);

    return "{$dia}/{$mes}/{$anio}";
}

function formatoMoneda($valor): string
{
    if ($valor === null || $valor === '') {
        return '';
    }

    return number_format((float)$valor, 2, '.', ',');
}

function formatoHoraAmPm($valor): string
{
    $valor = textoSeguro($valor);
    if ($valor === '') {
        return '';
    }

    // Si ya viene con am/pm (o variantes), respetarlo.
    if (preg_match('/\b(am|pm)\b|a\.?\s*m\.?|p\.?\s*m\.?/i', $valor)) {
        return $valor;
    }

    // Espera formatos tipo HH:MM o HH:MM:SS
    if (!preg_match('/^(\d{1,2}):(\d{2})(?::\d{2})?$/', $valor, $m)) {
        return $valor;
    }

    $hora24 = (int)$m[1];
    $minuto = $m[2];

    if ($hora24 < 0 || $hora24 > 23) {
        return $valor;
    }

    $esPm = $hora24 >= 12;
    $hora12 = $hora24 % 12;
    if ($hora12 === 0) {
        $hora12 = 12;
    }

    $sufijo = $esPm ? 'p. m.' : 'a. m.';
    return sprintf('%02d:%s %s', $hora12, $minuto, $sufijo);
}

function letraColumna(int $numero): string
{
    return Coordinate::stringFromColumnIndex($numero);
}

function unirLineas(array $valores): string
{
    $valores = array_filter(array_map(function ($valor) {
        return trim((string)$valor);
    }, $valores), function ($valor) {
        return $valor !== '';
    });

    return implode("\n", array_values($valores));
}

function configurarHojaParaImpresion($sheet): void
{
    $pageSetup = $sheet->getPageSetup();
    $pageSetup->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $pageSetup->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    $pageSetup->setFitToPage(true);
    $pageSetup->setFitToWidth(1);
    $pageSetup->setFitToHeight(0);
    $pageSetup->setHorizontalCentered(true);
    
    $margenes = $sheet->getPageMargins();
    $margenes->setTop(0.5);
    $margenes->setBottom(0.5);
    $margenes->setLeft(0.5);
    $margenes->setRight(0.5);
    $margenes->setHeader(0.3);
    $margenes->setFooter(0.3);
}

function obtenerDatosEmpleado(mysqli $conexion, int $idEmpleado): array
{
    $sql = $conexion->prepare("SELECT 
        e.id_empleado,
        e.clave_empleado,
        e.nombre,
        e.ap_paterno,
        e.ap_materno,
        e.domicilio,
        e.imss,
        e.curp,
        e.sexo,
        e.enfermedades_alergias,
        e.grupo_sanguineo,
        e.fecha_nacimiento,
        e.fecha_alta_empresa,
        e.fecha_alta_imss,
        e.salario_semanal,
        e.salario_diario,
        e.biometrico,
        e.telefono_empleado,
        e.status_nss,
        e.rfc_empleado,
        e.estado_civil,
        e.horario_fijo,
        d.nombre_departamento,
        a.nombre_area,
        emp.nombre_empresa,
        p.nombre_puesto,
        (SELECT GROUP_CONCAT(c.num_casillero SEPARATOR ', ') FROM empleado_casillero ec INNER JOIN casilleros c ON ec.num_casillero = c.num_casillero WHERE ec.id_empleado = e.id_empleado) AS num_casillero,
        cont.nombre AS emergencia_nombre,
        cont.ap_paterno AS emergencia_ap_paterno,
        cont.ap_materno AS emergencia_ap_materno,
        cont.telefono AS emergencia_telefono,
        cont.domicilio AS emergencia_domicilio,
        ec.parentesco AS emergencia_parentesco,
        hrq.horario AS horario_reloj,
        ho.horario_oficial AS horario_oficial
    FROM info_empleados e
    LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
    LEFT JOIN areas a ON e.id_area = a.id_area
    LEFT JOIN empresa emp ON e.id_empresa = emp.id_empresa
    LEFT JOIN puestos_especiales p ON e.id_puestoESpecial = p.id_puestoESpecial
    LEFT JOIN empleado_contacto ec ON e.id_empleado = ec.id_empleado
    LEFT JOIN contacto_emergencia cont ON ec.id_contacto = cont.id_contacto
    LEFT JOIN empleado_horario_reloj hrq ON hrq.id_empleado = e.id_empleado
    LEFT JOIN horarios_oficiales ho ON ho.id_empleado = e.id_empleado
    WHERE e.id_empleado = ? LIMIT 1");

    $sql->bind_param('i', $idEmpleado);
    $sql->execute();
    $resultado = $sql->get_result();
    $empleado = $resultado ? $resultado->fetch_assoc() : [];
    $sql->close();

    if (!$empleado) {
        return [];
    }

    $sqlBeneficiarios = $conexion->prepare("SELECT 
        b.nombre,
        b.ap_paterno,
        b.ap_materno,
        eb.parentesco,
        eb.porcentaje
    FROM empleado_beneficiario eb
    INNER JOIN beneficiarios b ON eb.id_beneficiario = b.id_beneficiario
    WHERE eb.id_empleado = ?
    ORDER BY b.nombre ASC, b.ap_paterno ASC, b.ap_materno ASC");

    $sqlBeneficiarios->bind_param('i', $idEmpleado);
    $sqlBeneficiarios->execute();
    $resultadoBeneficiarios = $sqlBeneficiarios->get_result();

    $beneficiariosNombre = [];
    $beneficiariosApPaterno = [];
    $beneficiariosApMaterno = [];
    $beneficiariosParentesco = [];
    $beneficiariosPorcentaje = [];
    $beneficiariosDetalle = [];

    while ($row = $resultadoBeneficiarios->fetch_assoc()) {
        $nombre = textoSeguro($row['nombre'] ?? '');
        $apPaterno = textoSeguro($row['ap_paterno'] ?? '');
        $apMaterno = textoSeguro($row['ap_materno'] ?? '');
        
        $beneficiariosNombre[] = $nombre;
        $beneficiariosApPaterno[] = $apPaterno;
        $beneficiariosApMaterno[] = $apMaterno;
        $beneficiariosParentesco[] = $row['parentesco'] ?? '';
        $beneficiariosPorcentaje[] = number_format((float)($row['porcentaje'] ?? 0), 2, '.', ',') . '%';

        $beneficiariosDetalle[] = [
            'nombre' => $nombre,
            'ap_paterno' => $apPaterno,
            'ap_materno' => $apMaterno,
            'parentesco' => $row['parentesco'] ?? '',
            'porcentaje' => number_format((float)($row['porcentaje'] ?? 0), 2, '.', ',') . '%'
        ];
    }

    $sqlBeneficiarios->close();

    $sqlReingresos = $conexion->prepare("SELECT fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = ? ORDER BY fecha_reingreso ASC, id_historial ASC");
    $sqlReingresos->bind_param('i', $idEmpleado);
    $sqlReingresos->execute();
    $resultadoReingresos = $sqlReingresos->get_result();
    $reingresos = [];
    $reingresosDetalle = [];

    while ($row = $resultadoReingresos->fetch_assoc()) {
        $fechaReingreso = formatoFecha($row['fecha_reingreso'] ?? null);
        $fechaBaja = formatoFecha($row['fecha_salida'] ?? null);
        $reingresos[] = trim($fechaReingreso . ' -> ' . $fechaBaja);
        $reingresosDetalle[] = [
            'fecha_reingreso' => $fechaReingreso,
            'fecha_baja' => $fechaBaja,
        ];
    }

    $sqlReingresos->close();

    $horarioReloj = [];
    $horarioRelojJson = json_decode($empleado['horario_reloj'] ?? '', true);
    if (is_array($horarioRelojJson)) {
        foreach ($horarioRelojJson as $dia => $horario) {
            if (is_array($horario)) {
                $horarioReloj[] = trim(
                    $dia . ': ' .
                    ($horario['entrada'] ?? '') . ' - ' .
                    ($horario['salida_comida'] ?? '') . ' - ' .
                    ($horario['entrada_comida'] ?? '') . ' - ' .
                    ($horario['salida'] ?? '')
                );
            }
        }
    }

    $horarioOficial = [];
    $horarioOficialJson = json_decode($empleado['horario_oficial'] ?? '', true);
    if (is_array($horarioOficialJson)) {
        foreach ($horarioOficialJson as $dia => $horario) {
            if (is_array($horario)) {
                $horarioOficial[] = trim(
                    $dia . ': ' .
                    ($horario['entrada'] ?? '') . ' - ' .
                    ($horario['salida_comida'] ?? '') . ' - ' .
                    ($horario['entrada_comida'] ?? '') . ' - ' .
                    ($horario['salida'] ?? '')
                );
            }
        }
    }

    return [
        'clave_empleado' => textoSeguro($empleado['clave_empleado'] ?? ''),
        'nombre' => textoSeguro($empleado['nombre'] ?? ''),
        'ap_paterno' => textoSeguro($empleado['ap_paterno'] ?? ''),
        'ap_materno' => textoSeguro($empleado['ap_materno'] ?? ''),
        'nombre_completo' => trim(implode(' ', array_filter([
            textoSeguro($empleado['nombre'] ?? ''),
            textoSeguro($empleado['ap_paterno'] ?? ''),
            textoSeguro($empleado['ap_materno'] ?? '')
        ]))),
        'imss' => textoSeguro($empleado['imss'] ?? ''),
        'curp' => textoSeguro($empleado['curp'] ?? ''),
        'domicilio' => textoSeguro($empleado['domicilio'] ?? ''),
        'sexo' => ($empleado['sexo'] ?? '') === 'M' ? 'Masculino' : (($empleado['sexo'] ?? '') === 'F' ? 'Femenino' : ''),
        'grupo_sanguineo' => textoSeguro($empleado['grupo_sanguineo'] ?? ''),
        'fecha_nacimiento' => formatoFecha($empleado['fecha_nacimiento'] ?? null),
        'rfc_empleado' => textoSeguro($empleado['rfc_empleado'] ?? ''),
        'estado_civil' => textoSeguro($empleado['estado_civil'] ?? ''),
        'num_casillero' => textoSeguro($empleado['num_casillero'] ?? ''),
        'biometrico' => textoSeguro($empleado['biometrico'] ?? ''),
        'telefono_empleado' => textoSeguro($empleado['telefono_empleado'] ?? ''),
        'enfermedades_alergias' => textoSeguro($empleado['enfermedades_alergias'] ?? ''),
        'id_empresa' => textoSeguro($empleado['nombre_empresa'] ?? ''),
        'id_area' => textoSeguro($empleado['nombre_area'] ?? ''),
        'id_departamento' => textoSeguro($empleado['nombre_departamento'] ?? ''),
        'id_puestoEspecial' => textoSeguro($empleado['nombre_puesto'] ?? ''),
        'salario_semanal' => formatoMoneda($empleado['salario_semanal'] ?? ''),
        'salario_diario' => formatoMoneda($empleado['salario_diario'] ?? ''),
        'horario_fijo' => ((int)($empleado['horario_fijo'] ?? 0) === 1) ? 'Sí' : 'No',
        'fecha_alta_empresa' => formatoFecha($empleado['fecha_alta_empresa'] ?? null),
        'fecha_alta_imss' => formatoFecha($empleado['fecha_alta_imss'] ?? null),
        'status_nss' => ((int)($empleado['status_nss'] ?? 0) === 1) ? 'Activo' : 'Baja',
        'emergencia_nombre' => textoSeguro($empleado['emergencia_nombre'] ?? ''),
        'emergencia_ap_paterno' => textoSeguro($empleado['emergencia_ap_paterno'] ?? ''),
        'emergencia_ap_materno' => textoSeguro($empleado['emergencia_ap_materno'] ?? ''),
        'emergencia_telefono' => textoSeguro($empleado['emergencia_telefono'] ?? ''),
        'emergencia_parentesco' => textoSeguro($empleado['emergencia_parentesco'] ?? ''),
        'emergencia_domicilio' => textoSeguro($empleado['emergencia_domicilio'] ?? ''),
        'reingresos' => unirLineas($reingresos),
        'reingresos_detalle' => $reingresosDetalle,
        'beneficiario_nombre' => unirLineas($beneficiariosNombre),
        'beneficiario_ap_paterno' => unirLineas($beneficiariosApPaterno),
        'beneficiario_ap_materno' => unirLineas($beneficiariosApMaterno),
        'beneficiario_parentesco' => unirLineas($beneficiariosParentesco),
        'beneficiario_porcentaje' => unirLineas($beneficiariosPorcentaje),
        'beneficiarios_lista' => $beneficiariosDetalle,
        'horario_reloj' => unirLineas($horarioReloj),
        'horario_oficial' => unirLineas($horarioOficial),
        // Para exportación por pestañas (tablas)
        'horario_reloj_detalle' => is_array($horarioRelojJson) ? $horarioRelojJson : [],
        'horario_oficial_detalle' => is_array($horarioOficialJson) ? $horarioOficialJson : [],
    ];
}



$seleccionaHorarioReloj = in_array('horario_reloj', $camposSeleccionados, true);
$seleccionaHorarioOficial = in_array('horario_oficial', $camposSeleccionados, true);
$seleccionaReingresos = in_array('reingresos', $camposSeleccionados, true);

$spreadsheet = new Spreadsheet();
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

// Función genérica para crear tablas de tipo empleado
$crearTablaEmpleado = function ($sheet, string $titulo, array $empleadosIds, callable $obtener, array $camposAMostrar, bool $incluirIdentificacion = true) {
    global $labels;
    
    $sheet->setTitle($titulo);
    $sheet->setCellValue('A1', mb_strtoupper($titulo, 'UTF-8'));
    $sheet->mergeCells('A1:' . letraColumna(count($camposAMostrar) + 3) . '1');
    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
    $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

    // Encabezados
    $columnas = $incluirIdentificacion ? ['clave_empleado', 'nombre', 'ap_paterno', 'ap_materno'] : [];
    foreach ($camposAMostrar as $campo) {
        if (in_array($campo, ['clave_empleado', 'nombre', 'ap_paterno', 'ap_materno'], true)) {
            continue;
        }
        $columnas[] = $campo;
    }

    $fila = 3;
    foreach ($columnas as $indice => $campo) {
        $sheet->setCellValue(letraColumna($indice + 1) . $fila, $labels[$campo] ?? $campo);
    }
    $sheet->getStyle('A3:' . letraColumna(count($columnas)) . '3')->getFont()->setBold(true)->getColor()->setARGB(COLOR_TEXTO_ENCABEZADO);
    $sheet->getStyle('A3:' . letraColumna(count($columnas)) . '3')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB(COLOR_ENCABEZADO);
    $sheet->getStyle('A3:' . letraColumna(count($columnas)) . '3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

    $fila = 4;
    foreach ($empleadosIds as $idEmpleado) {
        $idEmpleado = (int)$idEmpleado;
        if ($idEmpleado <= 0) {
            continue;
        }

        $datos = $obtener($idEmpleado);
        if (!$datos) {
            continue;
        }

        $beneficiarios = $datos['beneficiarios_lista'] ?? [];
        $esTablaBeneficiarios = $titulo === 'Beneficiarios';

        if ($esTablaBeneficiarios && !empty($beneficiarios)) {
            foreach ($beneficiarios as $ben) {
                foreach ($columnas as $indice => $campo) {
                    $celda = letraColumna($indice + 1) . $fila;
                    $valor = $datos[$campo] ?? '';

                    if ($campo === 'beneficiario_nombre') {
                        $valor = $ben['nombre'] ?? '';
                    } elseif ($campo === 'beneficiario_ap_paterno') {
                        $valor = $ben['ap_paterno'] ?? '';
                    } elseif ($campo === 'beneficiario_ap_materno') {
                        $valor = $ben['ap_materno'] ?? '';
                    } elseif ($campo === 'beneficiario_parentesco') {
                        $valor = $ben['parentesco'] ?? '';
                    } elseif ($campo === 'beneficiario_porcentaje') {
                        $valor = $ben['porcentaje'] ?? '';
                    }

                    $sheet->setCellValue($celda, $valor);
                    $sheet->getStyle($celda)->getAlignment()->setWrapText(true);
                    $sheet->getStyle($celda)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                    $sheet->getStyle($celda)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                }
                $fila++;
            }
        } else {
            foreach ($columnas as $indice => $campo) {
                $celda = letraColumna($indice + 1) . $fila;
                $sheet->setCellValue($celda, $datos[$campo] ?? '');
                $sheet->getStyle($celda)->getAlignment()->setWrapText(true);
                $sheet->getStyle($celda)->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
            }
            $fila++;
        }
    }

    for ($i = 1; $i <= count($columnas); $i++) {
        $sheet->getColumnDimension(letraColumna($i))->setAutoSize(true);
    }

    $sheet->setAutoFilter('A3:' . letraColumna(count($columnas)) . '3');
    $sheet->getStyle('A3:' . letraColumna(count($columnas)) . ($fila - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
    // Centrar todo el contenido de la tabla
    $sheet->getStyle('A4:' . letraColumna(count($columnas)) . ($fila - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle('A4:' . letraColumna(count($columnas)) . ($fila - 1))->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
    configurarHojaParaImpresion($sheet);
};

$crearTablaHorarios = function ($sheet, string $titulo, array $empleadosIds, callable $obtener, string $keyDetalle, bool $mostrarIdentificacion) {
    $sheet->setTitle($titulo);
    $sheet->setCellValue('A1', mb_strtoupper($titulo, 'UTF-8') . ' POR EMPLEADO');
    $sheet->mergeCells('A1:E1');
    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
    $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

    $fila = 3;
    foreach ($empleadosIds as $idEmpleado) {
        $idEmpleado = (int)$idEmpleado;
        if ($idEmpleado <= 0) {
            continue;
        }

        $datos = $obtener($idEmpleado);
        if (!$datos) {
            continue;
        }

        $detalle = $datos[$keyDetalle] ?? [];
        if (!is_array($detalle)) {
            $detalle = [];
        }

        // Filtrar solo filas con día (si no hay día, no se imprime nada)
        $filasValidas = [];
        $esLista = count($detalle) === 0 || array_keys($detalle) === range(0, count($detalle) - 1);
        if ($esLista) {
            foreach ($detalle as $horario) {
                if (!is_array($horario)) {
                    continue;
                }
                $dia = textoSeguro($horario['dia'] ?? '');
                if ($dia === '') {
                    continue;
                }
                $filasValidas[] = $horario;
            }
        } else {
            foreach ($detalle as $dia => $horario) {
                $dia = textoSeguro((string)$dia);
                if ($dia === '' || !is_array($horario)) {
                    continue;
                }
                $horario['dia'] = $dia;
                $filasValidas[] = $horario;
            }
        }

        // Si no hay filas válidas, poner un mensaje de "Sin horarios"
        if (!count($filasValidas)) {
            $filasValidas[] = ['dia' => 'Sin horarios registrados', 'entrada' => '', 'salida_comida' => '', 'entrada_comida' => '', 'salida' => ''];
        }

        if ($mostrarIdentificacion) {
            $sheet->setCellValue('A' . $fila, 'Clave:');
            $sheet->setCellValue('B' . $fila, $datos['clave_empleado'] ?? '');
            $sheet->setCellValue('C' . $fila, 'Nombre:');
            $nombreCompleto = trim(($datos['nombre'] ?? '') . ' ' . ($datos['ap_paterno'] ?? '') . ' ' . ($datos['ap_materno'] ?? ''));
            $sheet->setCellValue('D' . $fila, $nombreCompleto);
            $sheet->mergeCells('D' . $fila . ':E' . $fila);
            $sheet->getStyle('A' . $fila . ':E' . $fila)->getFont()->setBold(true);
            $fila++;
        }

        // Encabezados estilo "tabla" como en el modal
        $sheet->setCellValue('A' . $fila, 'Día');
        $sheet->setCellValue('B' . $fila, 'Entrada');
        $sheet->setCellValue('C' . $fila, 'Salida comida');
        $sheet->setCellValue('D' . $fila, 'Entrada comida');
        $sheet->setCellValue('E' . $fila, 'Salida');
        $sheet->getStyle('A' . $fila . ':E' . $fila)->getFont()->setBold(true)->getColor()->setARGB(COLOR_TEXTO_ENCABEZADO);
        $sheet->getStyle('A' . $fila . ':E' . $fila)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB(COLOR_ENCABEZADO);
        $sheet->getStyle('A' . $fila . ':E' . $fila)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $fila++;

        $inicioTabla = $fila - 1;

        foreach ($filasValidas as $horario) {
            $sheet->setCellValue('A' . $fila, textoSeguro($horario['dia'] ?? ''));
            $sheet->setCellValue('B' . $fila, formatoHoraAmPm($horario['entrada'] ?? ''));
            $sheet->setCellValue('C' . $fila, formatoHoraAmPm($horario['salida_comida'] ?? ''));
            $sheet->setCellValue('D' . $fila, formatoHoraAmPm($horario['entrada_comida'] ?? ''));
            $sheet->setCellValue('E' . $fila, formatoHoraAmPm($horario['salida'] ?? ''));
            $fila++;
        }

        $finTabla = max($inicioTabla, $fila - 1);
        $sheet->getStyle('A' . $inicioTabla . ':E' . $finTabla)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        $fila += 2;
    }

    foreach (range('A', 'E') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
    
    configurarHojaParaImpresion($sheet);
};

$cacheDatos = [];
$obtenerDatos = function (int $idEmpleado) use (&$cacheDatos, $conexion) {
    if (!isset($cacheDatos[$idEmpleado])) {
        $cacheDatos[$idEmpleado] = obtenerDatosEmpleado($conexion, $idEmpleado);
    }
    return $cacheDatos[$idEmpleado];
};

$hojaBaseAsignada = false;

$crearTablaReingresos = function ($sheet, array $empleadosIds, callable $obtener, bool $mostrarIdentificacion) {
    $sheet->setTitle('Reingresos');
    $sheet->setCellValue('A1', 'HISTORIAL DE REINGRESOS Y SALIDAS');
    $sheet->mergeCells('A1:C1');
    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
    $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

    $fila = 3;
    foreach ($empleadosIds as $idEmpleado) {
        $idEmpleado = (int)$idEmpleado;
        if ($idEmpleado <= 0) {
            continue;
        }

        $datos = $obtener($idEmpleado);
        if (!$datos) {
            continue;
        }

        $detalle = $datos['reingresos_detalle'] ?? [];
        if (!is_array($detalle)) {
            $detalle = [];
        }

        if ($mostrarIdentificacion) {
            $sheet->setCellValue('A' . $fila, 'Clave:');
            $sheet->setCellValue('B' . $fila, $datos['clave_empleado'] ?? '');
            $nombreCompleto = trim(($datos['nombre'] ?? '') . ' ' . ($datos['ap_paterno'] ?? '') . ' ' . ($datos['ap_materno'] ?? ''));
            $sheet->setCellValue('C' . $fila, $nombreCompleto);
            $sheet->getStyle('A' . $fila . ':C' . $fila)->getFont()->setBold(true);
            $fila++;
        }

        // Encabezados de tabla
        $sheet->setCellValue('A' . $fila, '#');
        $sheet->setCellValue('B' . $fila, 'Fecha de Reingreso');
        $sheet->setCellValue('C' . $fila, 'Fecha Baja');
        $sheet->getStyle('A' . $fila . ':C' . $fila)->getFont()->setBold(true)->getColor()->setARGB(COLOR_TEXTO_ENCABEZADO);
        $sheet->getStyle('A' . $fila . ':C' . $fila)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB(COLOR_ENCABEZADO);
        $sheet->getStyle('A' . $fila . ':C' . $fila)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $fila++;

        $inicioTabla = $fila - 1;
        $contador = 1;

        if (empty($detalle)) {
            $sheet->setCellValue('A' . $fila, '-');
            $sheet->setCellValue('B' . $fila, 'Sin reingresos');
            $sheet->setCellValue('C' . $fila, '-');
            $fila++;
        } else {
            foreach ($detalle as $row) {
                if (!is_array($row)) {
                    continue;
                }
                $fechaReingreso = textoSeguro($row['fecha_reingreso'] ?? '');
                $fechaBaja = textoSeguro($row['fecha_baja'] ?? '');
                if ($fechaReingreso === '' && $fechaBaja === '') {
                    continue;
                }
                $sheet->setCellValue('A' . $fila, $contador);
                $sheet->setCellValue('B' . $fila, $fechaReingreso);
                $sheet->setCellValue('C' . $fila, $fechaBaja);
                $fila++;
                $contador++;
            }
        }

        $finTabla = max($inicioTabla, $fila - 1);
        $sheet->getStyle('A' . $inicioTabla . ':C' . $finTabla)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        $fila += 2;
    }

    foreach (range('A', 'C') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
    
    configurarHojaParaImpresion($sheet);
};

// Crear hojas por tipo de dato
if ($unirHojas && ($tieneEmpleado || $tieneEmergencia || $tieneBeneficiario)) {
    // MODO UNIDO: Información, Emergencia y Beneficiario en una sola hoja
    $sheet = $spreadsheet->getActiveSheet();
    $hojaBaseAsignada = true;
    $sheet->setTitle('Información General');

    $camposEmpleadoSel = array_filter($camposSeleccionados, fn($c) => in_array($c, $camposEmpleadoInfo, true));
    $camposEmergenciaSel = array_filter($camposSeleccionados, fn($c) => in_array($c, $camposEmergencia, true));
    $camposBeneficiarioSel = array_filter($camposSeleccionados, fn($c) => in_array($c, $camposBeneficiario, true));

    // Columnas base: Clave y Nombre
    $columnas = ['clave_empleado', 'nombre', 'ap_paterno', 'ap_materno'];
    $grupos = [
        ['label' => 'Empleado', 'span' => 4 + count($camposEmpleadoSel)],
        ['label' => 'Emergencia', 'span' => count($camposEmergenciaSel)],
        ['label' => 'Beneficiarios', 'span' => count($camposBeneficiarioSel)]
    ];

    foreach ($camposEmpleadoSel as $c) $columnas[] = $c;
    foreach ($camposEmergenciaSel as $c) $columnas[] = $c;
    foreach ($camposBeneficiarioSel as $c) $columnas[] = $c;

    // Fila 1: Título general
    $sheet->setCellValue('A1', 'INFORMACIÓN GENERAL DE EMPLEADOS');
    $sheet->mergeCells('A1:' . letraColumna(count($columnas)) . '1');
    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
    $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

    // Fila 2: Grupos (Empleado, Emergencia, Beneficiarios)
    $colActual = 1;
    foreach ($grupos as $grupo) {
        if ($grupo['span'] > 0) {
            $rango = letraColumna($colActual) . '2:' . letraColumna($colActual + $grupo['span'] - 1) . '2';
            $sheet->setCellValue(letraColumna($colActual) . '2', mb_strtoupper($grupo['label'], 'UTF-8'));
            $sheet->mergeCells($rango);
            $sheet->getStyle($rango)->getFont()->setBold(true);
            $sheet->getStyle($rango)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle($rango)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('E2EFDA');
            $sheet->getStyle($rango)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            $colActual += $grupo['span'];
        }
    }

    // Fila 3: Encabezados de campos
    foreach ($columnas as $indice => $campo) {
        $sheet->setCellValue(letraColumna($indice + 1) . '3', $labels[$campo] ?? $campo);
    }
    $sheet->getStyle('A3:' . letraColumna(count($columnas)) . '3')->getFont()->setBold(true)->getColor()->setARGB(COLOR_TEXTO_ENCABEZADO);
    $sheet->getStyle('A3:' . letraColumna(count($columnas)) . '3')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB(COLOR_ENCABEZADO);
    $sheet->getStyle('A3:' . letraColumna(count($columnas)) . '3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

    // Datos
    $fila = 4;
    foreach ($empleadosIds as $idEmpleado) {
        $datos = $obtenerDatos((int)$idEmpleado);
        if (!$datos) continue;

        $beneficiarios = $datos['beneficiarios_lista'] ?? [];
        $tieneCamposBen = count($camposBeneficiarioSel) > 0;

        if (empty($beneficiarios) || !$tieneCamposBen) {
            foreach ($columnas as $indice => $campo) {
                $celda = letraColumna($indice + 1) . $fila;
                $sheet->setCellValue($celda, $datos[$campo] ?? '');
                $sheet->getStyle($celda)->getAlignment()->setWrapText(true);
                $sheet->getStyle($celda)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                $sheet->getStyle($celda)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }
            $fila++;
        } else {
            foreach ($beneficiarios as $ben) {
                foreach ($columnas as $indice => $campo) {
                    $celda = letraColumna($indice + 1) . $fila;
                    $valor = $datos[$campo] ?? '';

                    if ($campo === 'beneficiario_nombre') {
                        $valor = $ben['nombre'] ?? '';
                    } elseif ($campo === 'beneficiario_ap_paterno') {
                        $valor = $ben['ap_paterno'] ?? '';
                    } elseif ($campo === 'beneficiario_ap_materno') {
                        $valor = $ben['ap_materno'] ?? '';
                    } elseif ($campo === 'beneficiario_parentesco') {
                        $valor = $ben['parentesco'] ?? '';
                    } elseif ($campo === 'beneficiario_porcentaje') {
                        $valor = $ben['porcentaje'] ?? '';
                    }

                    $sheet->setCellValue($celda, $valor);
                    $sheet->getStyle($celda)->getAlignment()->setWrapText(true);
                    $sheet->getStyle($celda)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                    $sheet->getStyle($celda)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                }
                $fila++;
            }
        }
    }

    for ($i = 1; $i <= count($columnas); $i++) {
        $sheet->getColumnDimension(letraColumna($i))->setAutoSize(true);
    }
    $sheet->getStyle('A3:' . letraColumna(count($columnas)) . ($fila - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
    configurarHojaParaImpresion($sheet);

} else {
    // MODO SEPARADO (Original)
    if ($tieneEmpleado) {
        $sheetEmpleado = $spreadsheet->getActiveSheet();
        $hojaBaseAsignada = true;
        $camposEmpleadoSeleccionados = array_filter($camposSeleccionados, function ($c) use ($camposEmpleadoInfo) {
            return in_array($c, $camposEmpleadoInfo, true);
        });
        $crearTablaEmpleado($sheetEmpleado, 'Información del Empleado', $empleadosIds, $obtenerDatos, $camposEmpleadoSeleccionados, true);
    }

    if ($tieneBeneficiario) {
        $sheetBeneficiario = $hojaBaseAsignada ? $spreadsheet->createSheet() : $spreadsheet->getActiveSheet();
        if (!$hojaBaseAsignada) $hojaBaseAsignada = true;
        $camposBeneficiarioSeleccionados = array_filter($camposSeleccionados, function ($c) use ($camposBeneficiario) {
            return in_array($c, $camposBeneficiario, true);
        });
        $crearTablaEmpleado($sheetBeneficiario, 'Beneficiarios', $empleadosIds, $obtenerDatos, $camposBeneficiarioSeleccionados, true);
    }

    if ($tieneEmergencia) {
        $sheetEmergencia = $hojaBaseAsignada ? $spreadsheet->createSheet() : $spreadsheet->getActiveSheet();
        if (!$hojaBaseAsignada) $hojaBaseAsignada = true;
        $camposEmergenciaSeleccionados = array_filter($camposSeleccionados, function ($c) use ($camposEmergencia) {
            return in_array($c, $camposEmergencia, true);
        });
        $crearTablaEmpleado($sheetEmergencia, 'Emergencia', $empleadosIds, $obtenerDatos, $camposEmergenciaSeleccionados, true);
    }
}

if ($seleccionaHorarioReloj) {
    $sheetHorarios = $hojaBaseAsignada ? $spreadsheet->createSheet() : $spreadsheet->getActiveSheet();
    if (!$hojaBaseAsignada) $hojaBaseAsignada = true;
    $crearTablaHorarios($sheetHorarios, 'Horarios', $empleadosIds, $obtenerDatos, 'horario_reloj_detalle', true);
}

if ($seleccionaHorarioOficial) {
    $sheetHorariosOficiales = $hojaBaseAsignada ? $spreadsheet->createSheet() : $spreadsheet->getActiveSheet();
    if (!$hojaBaseAsignada) $hojaBaseAsignada = true;
    $crearTablaHorarios($sheetHorariosOficiales, 'Horarios Oficiales', $empleadosIds, $obtenerDatos, 'horario_oficial_detalle', true);
}

if ($seleccionaReingresos) {
    $sheetReingresos = $hojaBaseAsignada ? $spreadsheet->createSheet() : $spreadsheet->getActiveSheet();
    if (!$hojaBaseAsignada) $hojaBaseAsignada = true;
    $crearTablaReingresos($sheetReingresos, $empleadosIds, $obtenerDatos, true);
}

$filename = 'empleados_exportacion_' . date('Ymd_His') . '.xlsx';

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
