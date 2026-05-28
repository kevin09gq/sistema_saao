<?php
header('Content-Type: application/json; charset=utf-8');

include("../../config/config.php");
include("../../conexion/conexion.php");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        'success' => false,
        'message' => 'Metodo no permitido.'
    ]);
    exit;
}

$idEmpresa = isset($_GET['id_empresa']) ? (int) $_GET['id_empresa'] : 0;
$limite = isset($_GET['limite']) ? (int) $_GET['limite'] : 1000;
$limite = max(1, min($limite, 1000));

if ($idEmpresa <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Selecciona una empresa valida.'
    ]);
    exit;
}

$sql = $conexion->prepare(
    "SELECT
        e.id_empleado,
        e.clave_empleado,
        e.nombre,
        e.ap_paterno,
        e.ap_materno,
        e.id_empresa,
        emp.nombre_empresa
    FROM info_empleados e
    LEFT JOIN empresa emp ON emp.id_empresa = e.id_empresa
    WHERE e.clave_empleado IS NOT NULL
      AND TRIM(e.clave_empleado) <> ''"
);

if (!$sql) {
    echo json_encode([
        'success' => false,
        'message' => 'No se pudo preparar la consulta.'
    ]);
    exit;
}

$sql->execute();
$resultado = $sql->get_result();

$clavesNumericas = [];
$clavesSS = [];

for ($i = 1; $i <= $limite; $i++) {
    $claveNumerica = str_pad((string) $i, 3, '0', STR_PAD_LEFT);
    $claveSS = 'SS/' . str_pad((string) $i, 3, '0', STR_PAD_LEFT);

    $clavesNumericas[$claveNumerica] = [
        'clave' => $claveNumerica,
        'tipo' => 'numerica',
        'disponible' => true,
        'empleados_misma_empresa' => [],
        'empleados_otras_empresas' => [],
        'empleados_sin_empresa' => [],
        'total_asignados' => 0
    ];

    $clavesSS[$claveSS] = [
        'clave' => $claveSS,
        'tipo' => 'ss',
        'disponible' => true,
        'empleados_misma_empresa' => [],
        'empleados_otras_empresas' => [],
        'empleados_sin_empresa' => [],
        'total_asignados' => 0
    ];
}

while ($row = $resultado->fetch_assoc()) {
    $clave = strtoupper(trim((string) ($row['clave_empleado'] ?? '')));

    if ($clave === '') {
        continue;
    }

    $idEmpresaEmpleado = isset($row['id_empresa']) ? (int) $row['id_empresa'] : null;
    if (empty($row['id_empresa'])) {
        $idEmpresaEmpleado = null;
    }

    $empleado = [
        'id_empleado' => (int) $row['id_empleado'],
        'nombre_completo' => trim(
            implode(' ', array_filter([
                $row['nombre'] ?? '',
                $row['ap_paterno'] ?? '',
                $row['ap_materno'] ?? ''
            ]))
        ),
        'id_empresa' => $idEmpresaEmpleado,
        'empresa' => $row['nombre_empresa'] ?: 'Sin empresa asignada'
    ];

    if (preg_match('/^\d+$/', $clave)) {
        $numero = (int) $clave;
        if ($numero >= 1 && $numero <= $limite) {
            $claveFormateada = str_pad((string) $numero, 3, '0', STR_PAD_LEFT);
            agregarEmpleadoAClave($clavesNumericas[$claveFormateada], $empleado, $idEmpresa);
        }
        continue;
    }

    if (preg_match('/^SS\/(\d{1,3})$/', $clave, $matches)) {
        $numero = (int) $matches[1];
        if ($numero >= 1 && $numero <= $limite) {
            $claveFormateada = 'SS/' . str_pad((string) $numero, 3, '0', STR_PAD_LEFT);
            agregarEmpleadoAClave($clavesSS[$claveFormateada], $empleado, $idEmpresa);
        }
    }
}

$sql->close();

echo json_encode([
    'success' => true,
    'id_empresa' => $idEmpresa,
    'limite' => $limite,
    'numericas' => array_values($clavesNumericas),
    'ss' => array_values($clavesSS),
    'resumen' => [
        'numericas_mostradas' => count($clavesNumericas),
        'ss_mostradas' => count($clavesSS),
        'numericas_ocupadas_misma_empresa' => contarClavesOcupadas($clavesNumericas),
        'ss_ocupadas_misma_empresa' => contarClavesOcupadas($clavesSS),
        'numericas_disponibles_misma_empresa' => contarClavesDisponibles($clavesNumericas),
        'ss_disponibles_misma_empresa' => contarClavesDisponibles($clavesSS)
    ]
], JSON_UNESCAPED_UNICODE);

function agregarEmpleadoAClave(&$claveInfo, $empleado, $idEmpresaSeleccionada)
{
    $claveInfo['total_asignados']++;

    if ($empleado['id_empresa'] === null) {
        $claveInfo['empleados_sin_empresa'][] = $empleado;
        return;
    }

    if ((int) $empleado['id_empresa'] === (int) $idEmpresaSeleccionada) {
        $claveInfo['empleados_misma_empresa'][] = $empleado;
        $claveInfo['disponible'] = false;
        return;
    }

    $claveInfo['empleados_otras_empresas'][] = $empleado;
}

function contarClavesOcupadas($claves)
{
    $total = 0;

    foreach ($claves as $clave) {
        if (!$clave['disponible']) {
            $total++;
        }
    }

    return $total;
}

function contarClavesDisponibles($claves)
{
    $total = 0;

    foreach ($claves as $clave) {
        if ($clave['disponible']) {
            $total++;
        }
    }

    return $total;
}
