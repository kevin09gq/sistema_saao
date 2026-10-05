<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerCasillerosDisponibles':
        obtenerCasillerosDisponibles($conexion);
        break;

    case 'liberarCasillero':
        liberarCasillero($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER TODOS LOS CASILLEROS Y SU DISPONIBILIDAD
// LÍMITE DE 2 PERSONAS POR CASILLERO
//===========================================================

function obtenerCasillerosDisponibles(mysqli $conexion)
{
    // Consulta para obtener casilleros junto con los empleados asignados
    $sql = "SELECT 
                c.num_casillero,
                ec.id_empleado,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno
            FROM casilleros c
            LEFT JOIN empleado_casillero ec 
                ON c.num_casillero = ec.num_casillero
            LEFT JOIN info_empleados e 
                ON ec.id_empleado = e.id_empleado
            ORDER BY 
                LENGTH(c.num_casillero) ASC,
                c.num_casillero ASC";

    $resultado = mysqli_query($conexion, $sql);

    if (!$resultado) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al consultar los casilleros: " . mysqli_error($conexion)
        ]);
        return;
    }

    $casillerosAgrupados = [];

    // Agrupar los resultados por número de casillero
    while ($fila = mysqli_fetch_assoc($resultado)) {

        $numCasillero = (string) $fila['num_casillero'];

        if (!isset($casillerosAgrupados[$numCasillero])) {
            $casillerosAgrupados[$numCasillero] = [
                'num_casillero' => $numCasillero,
                'empleados' => [],
                'total_ocupantes' => 0,
                'capacidad_maxima' => 2,
                'disponible' => true,
                'estado' => 'Disponible'
            ];
        }

        // Si hay un empleado asignado
        if (!empty($fila['id_empleado'])) {

            $nombreCompleto = trim(
                $fila['nombre'] . ' ' . 
                $fila['ap_paterno'] . ' ' . 
                ($fila['ap_materno'] ?? '')
            );

            $casillerosAgrupados[$numCasillero]['empleados'][] = [
                'id_empleado' => (int) $fila['id_empleado'],
                'clave' => $fila['clave_empleado'] ?? '',
                'nombre_completo' => $nombreCompleto
            ];
        }
    }

    $listaFinal = [];
    $totalDisponibles = 0;
    $totalOcupados = 0;

    foreach ($casillerosAgrupados as $num => $datos) {

        $totalOcupantes = count($datos['empleados']);
        $datos['total_ocupantes'] = $totalOcupantes;

        // Determinar estado y disponibilidad (límite 2 personas)
        if ($totalOcupantes >= 2) {
            $datos['disponible'] = false;
            $datos['estado'] = 'Ocupado';
            $totalOcupados++;
        } else {
            $datos['disponible'] = true;
            $datos['estado'] = ($totalOcupantes === 1) ? 'Parcial' : 'Disponible';
            $totalDisponibles++;
        }

        $listaFinal[] = $datos;
    }

    // Ordenamiento natural (por número de casillero de forma numérica y alfanumérica)
    usort($listaFinal, function ($a, $b) {
        return strnatcasecmp($a['num_casillero'], $b['num_casillero']);
    });

    echo json_encode([
        "success" => true,
        "casilleros" => $listaFinal,
        "estadisticas" => [
            "total" => count($listaFinal),
            "disponibles" => $totalDisponibles,
            "ocupados" => $totalOcupados
        ]
    ]);
}


//===========================================================
// FUNCIÓN PARA LIBERAR UN CASILLERO DE UN EMPLEADO
//===========================================================

function liberarCasillero(mysqli $conexion)
{
    $num_casillero = trim($_POST['num_casillero'] ?? '');
    $id_empleado = intval($_POST['id_empleado'] ?? 0);

    if (empty($num_casillero)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se proporcionó el número de casillero."
        ]);
        return;
    }

    // Si se proporciona un id_empleado, se libera solo ese empleado
    // Si no se proporciona, se liberan todos los empleados de ese casillero
    if ($id_empleado > 0) {
        $sql = "DELETE FROM empleado_casillero WHERE id_empleado = ? AND num_casillero = ?";
        $stmt = mysqli_prepare($conexion, $sql);

        if (!$stmt) {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al preparar la consulta de liberación."
            ]);
            return;
        }

        mysqli_stmt_bind_param($stmt, "is", $id_empleado, $num_casillero);
    } else {
        $sql = "DELETE FROM empleado_casillero WHERE num_casillero = ?";
        $stmt = mysqli_prepare($conexion, $sql);

        if (!$stmt) {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al preparar la consulta de liberación."
            ]);
            return;
        }

        mysqli_stmt_bind_param($stmt, "s", $num_casillero);
    }

    if (mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);

        echo json_encode([
            "success" => true,
            "mensaje" => "El casillero ha sido liberado correctamente."
        ]);
    } else {
        $error = mysqli_stmt_error($stmt);
        mysqli_stmt_close($stmt);

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al liberar el casillero: " . $error
        ]);
    }
}
