<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerBiometricos':
        obtenerBiometricos($conexion);
        break;

    case 'liberarBiometrico':
        liberarBiometrico($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER TODOS LOS BIOMÉTRICOS Y SU DISPONIBILIDAD
// POR ÁREA (1 BIOMÉTRICO POR ÁREA)
//===========================================================

function obtenerBiometricos(mysqli $conexion)
{
    // 1. Obtener todas las áreas del sistema
    $sqlAreas = "SELECT id_area, nombre_area 
                 FROM areas 
                 ORDER BY nombre_area ASC";

    $resAreas = mysqli_query($conexion, $sqlAreas);

    if (!$resAreas) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al consultar las áreas: " . mysqli_error($conexion)
        ]);
        return;
    }

    $areasCatalogo = [];
    while ($area = mysqli_fetch_assoc($resAreas)) {
        $areasCatalogo[] = [
            'id_area' => (int) $area['id_area'],
            'nombre_area' => trim($area['nombre_area'])
        ];
    }

    // 2. Obtener todos los empleados que tienen un biométrico asignado
    $sqlEmpleados = "SELECT 
                        e.id_empleado,
                        e.biometrico,
                        e.clave_empleado,
                        e.nombre,
                        e.ap_paterno,
                        e.ap_materno,
                        e.id_area,
                        COALESCE(a.nombre_area, 'Sin área') AS nombre_area
                    FROM info_empleados e
                    LEFT JOIN areas a ON a.id_area = e.id_area
                    WHERE e.biometrico IS NOT NULL 
                      AND e.biometrico != '' 
                      AND e.biometrico != 0
                    ORDER BY 
                        e.biometrico ASC,
                        a.nombre_area ASC";

    $resEmpleados = mysqli_query($conexion, $sqlEmpleados);

    if (!$resEmpleados) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al consultar los empleados con biométrico: " . mysqli_error($conexion)
        ]);
        return;
    }

    $biometricosAgrupados = [];

    while ($fila = mysqli_fetch_assoc($resEmpleados)) {

        $numBiometrico = (string) $fila['biometrico'];

        if (!isset($biometricosAgrupados[$numBiometrico])) {
            $biometricosAgrupados[$numBiometrico] = [
                'biometrico' => $numBiometrico,
                'ocupantes' => []
            ];
        }

        $nombreCompleto = trim(
            $fila['nombre'] . ' ' . 
            $fila['ap_paterno'] . ' ' . 
            ($fila['ap_materno'] ?? '')
        );

        $idArea = !empty($fila['id_area']) ? (int)$fila['id_area'] : 0;

        $biometricosAgrupados[$numBiometrico]['ocupantes'][] = [
            'id_empleado' => (int) $fila['id_empleado'],
            'clave' => $fila['clave_empleado'] ?? '',
            'nombre_completo' => $nombreCompleto,
            'id_area' => $idArea,
            'nombre_area' => $fila['nombre_area']
        ];
    }

    $listaFinal = [];

    // Calcular áreas ocupadas y disponibles para cada número de biométrico
    foreach ($biometricosAgrupados as $num => $datos) {

        $idsAreasOcupadas = array_map(function ($ocupante) {
            return $ocupante['id_area'];
        }, $datos['ocupantes']);

        $areasDisponibles = [];
        foreach ($areasCatalogo as $area) {
            if (!in_array($area['id_area'], $idsAreasOcupadas)) {
                $areasDisponibles[] = $area;
            }
        }

        $datos['areas_disponibles'] = $areasDisponibles;
        $datos['total_ocupadas'] = count($datos['ocupantes']);
        $datos['total_disponibles'] = count($areasDisponibles);

        $listaFinal[] = $datos;
    }

    // Ordenamiento natural (por número de biométrico)
    usort($listaFinal, function ($a, $b) {
        return strnatcasecmp($a['biometrico'], $b['biometrico']);
    });

    echo json_encode([
        "success" => true,
        "areas" => $areasCatalogo,
        "biometricos" => $listaFinal,
        "total_biometricos" => count($listaFinal)
    ]);
}


//===========================================================
// FUNCIÓN PARA LIBERAR EL BIOMÉTRICO DE UN EMPLEADO
//===========================================================

function liberarBiometrico(mysqli $conexion)
{
    $id_empleado = intval($_POST['id_empleado'] ?? 0);

    if ($id_empleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se proporcionó el id del empleado."
        ]);
        return;
    }

    $sql = "UPDATE info_empleados 
            SET biometrico = NULL 
            WHERE id_empleado = ?";

    $stmt = mysqli_prepare($conexion, $sql);

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta de liberación: " . mysqli_error($conexion)
        ]);
        return;
    }

    mysqli_stmt_bind_param($stmt, "i", $id_empleado);

    if (mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);

        echo json_encode([
            "success" => true,
            "mensaje" => "El biométrico ha sido liberado correctamente."
        ]);
    } else {
        $error = mysqli_stmt_error($stmt);
        mysqli_stmt_close($stmt);

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al liberar el biométrico: " . $error
        ]);
    }
}
