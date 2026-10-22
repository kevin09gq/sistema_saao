<?php
require_once __DIR__ . "/../../conexion/conexion.php";
/** @var mysqli $conexion */

header('Content-Type: application/json');

$accion = $_GET['accion'] ?? $_POST['accion'] ?? '';

switch ($accion) {
    case 'obtenerExpediente':
        obtenerExpedienteEmpleado();
        break;
    case 'obtenerResumenProgresos':
        obtenerResumenProgresos();
        break;
    case 'guardarValor':
        guardarValorCampo();
        break;
    case 'obtenerHistorial':
        obtenerHistorialCampo();
        break;
    case 'obtenerDepartamentos':
        obtenerDepartamentos();
        break;
    default:
        echo json_encode(['exito' => false, 'mensaje' => 'Acción no válida']);
}

function obtenerResumenProgresos()
{
    global $conexion;

    // 1. Obtener los IDs de catálogo activo
    $resCat = $conexion->query("SELECT id_expediente FROM catalogo_expediente WHERE activo = 1");
    $catalogoActivo = [];
    if ($resCat) {
        while ($r = $resCat->fetch_assoc()) {
            $catalogoActivo[] = (int)$r['id_expediente'];
        }
    }
    $totalRequisitos = count($catalogoActivo);

    // 2. Obtener todos los valores registrados para requisitos activos
    $sql = "SELECT cv.id_empleado, cv.id_expediente, cv.valor 
            FROM campo_expediente cv 
            INNER JOIN catalogo_expediente ce ON cv.id_expediente = ce.id_expediente
            WHERE ce.activo = 1";
    $resVal = $conexion->query($sql);

    $progresos = [];
    if ($resVal) {
        while ($row = $resVal->fetch_assoc()) {
            $idEmp = (int)$row['id_empleado'];
            $idExp = (int)$row['id_expediente'];
            $raw = $row['valor'] === null ? '' : trim($row['valor']);

            $entregado = false;
            if ($raw !== '' && $raw !== '0') {
                if (strpos($raw, '{') === 0 && strrpos($raw, '}') === strlen($raw) - 1) {
                    $obj = json_decode($raw, true);
                    if ($obj && (!empty($obj['_entregado']) || !empty($obj['BOOLEAN']))) {
                        $entregado = true;
                    }
                } else if ($raw === '1' || strtolower($raw) === 'true') {
                    $entregado = true;
                }
            }

            if (!isset($progresos[$idEmp])) {
                $progresos[$idEmp] = [
                    'entregados' => [],
                    'total' => $totalRequisitos
                ];
            }
            if ($entregado) {
                $progresos[$idEmp]['entregados'][$idExp] = true;
            }
        }
    }

    echo json_encode([
        'exito' => true,
        'total_requisitos' => $totalRequisitos,
        'catalogo_activo' => $catalogoActivo,
        'progresos' => $progresos
    ], JSON_UNESCAPED_UNICODE);
}

function obtenerExpedienteEmpleado()
{
    global $conexion;

    $idEmpleado = isset($_GET['id_empleado']) ? (int)$_GET['id_empleado'] : 0;
    if ($idEmpleado <= 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'ID de empleado no válido']);
        return;
    }

    $stmt = $conexion->prepare("SELECT 
        ce.id_expediente,
        ce.nombre,
        ce.tipo_dato,
        ce.historial,
        cv.valor,
        cv.fecha_actualizacion
        FROM catalogo_expediente ce
        LEFT JOIN campo_expediente cv 
            ON ce.id_expediente = cv.id_expediente 
            AND cv.id_empleado = ?
        WHERE ce.activo = 1
        ORDER BY ce.nombre ASC");
    $stmt->bind_param("i", $idEmpleado);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $campos = [];
    if ($resultado && $resultado->num_rows > 0) {
        while ($row = $resultado->fetch_assoc()) {
            $campos[] = [
                'id_expediente' => (int)$row['id_expediente'],
                'nombre' => $row['nombre'],
                'tipo_dato' => $row['tipo_dato'],
                'tipo_dato_etiqueta' => obtenerEtiquetaTipo($row['tipo_dato']),
                'historial' => (bool)$row['historial'],
                'valor' => $row['valor'],
                'fecha_actualizacion' => $row['fecha_actualizacion']
            ];
        }
    }
    $stmt->close();

    echo json_encode(['exito' => true, 'datos' => $campos], JSON_UNESCAPED_UNICODE);
}

function obtenerEtiquetaTipo($tipo)
{
    $etiquetas = [
        'BOOLEAN' => 'Sí / No',
        'DECIMAL' => 'Número Decimal',
        'TEXT'    => 'Texto',
        'DATE'    => 'Fecha Completa',
        'YEAR'    => 'Año'
    ];
    return $etiquetas[$tipo] ?? $tipo;
}

function guardarValorCampo()
{
    global $conexion;

    $idEmpleado = isset($_POST['id_empleado']) ? (int)$_POST['id_empleado'] : 0;
    $idExpediente = isset($_POST['id_expediente']) ? (int)$_POST['id_expediente'] : 0;
    $valorNuevo = $_POST['valor'] ?? null;

    if ($idEmpleado <= 0 || $idExpediente <= 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'IDs no válidos']);
        return;
    }

    $valorNuevo = ($valorNuevo === '' || $valorNuevo === null) ? null : (string)$valorNuevo;

    $stmtInfo = $conexion->prepare("SELECT historial, tipo_dato FROM catalogo_expediente WHERE id_expediente = ?");
    $stmtInfo->bind_param("i", $idExpediente);
    $stmtInfo->execute();
    $stmtInfo->bind_result($requiereHistorial, $tipoDato);
    $stmtInfo->fetch();
    $stmtInfo->close();

    $requiereHistorial = (bool)$requiereHistorial;
    $tipoDato = $tipoDato ?? 'TEXT';

    $conexion->begin_transaction();

    try {
        $stmtValorAnterior = $conexion->prepare("SELECT valor FROM campo_expediente WHERE id_empleado = ? AND id_expediente = ?");
        $stmtValorAnterior->bind_param("ii", $idEmpleado, $idExpediente);
        $stmtValorAnterior->execute();
        $stmtValorAnterior->bind_result($valorAnterior);
        $tieneRegistro = $stmtValorAnterior->fetch();
        $stmtValorAnterior->close();

        // Determinar si el valor cambió (considerando estructura JSON para YEAR)
        $valorCambio = false;
        $datosAdicionalesCambiaron = false;
        if ($tieneRegistro) {
            if ($tipoDato === 'YEAR') {
                // Para campos tipo YEAR, comparar como JSON
                $anteriorDecoded = json_decode($valorAnterior, true);
                $nuevoDecoded = json_decode($valorNuevo, true);
                $valorCambio = json_encode($anteriorDecoded) !== json_encode($nuevoDecoded);
                
                // Verificar si solo cambió _entregado o también cambiaron datos adicionales
                if ($valorCambio && isset($anteriorDecoded['_entregado']) && isset($nuevoDecoded['_entregado'])) {
                    $anteriorEntregado = $anteriorDecoded['_entregado'];
                    $nuevoEntregado = $nuevoDecoded['_entregado'];
                    unset($anteriorDecoded['_entregado']);
                    unset($nuevoDecoded['_entregado']);
                    $datosAdicionalesCambiaron = json_encode($anteriorDecoded) !== json_encode($nuevoDecoded);
                }
            } else {
                $valorCambio = $valorAnterior !== $valorNuevo;
                
                // Para otros tipos, verificar si es JSON y solo cambió _entregado
                if ($valorCambio && strpos($valorAnterior, '{') === 0 && strpos($valorNuevo, '{') === 0) {
                    $anteriorDecoded = json_decode($valorAnterior, true);
                    $nuevoDecoded = json_decode($valorNuevo, true);
                    if (isset($anteriorDecoded['_entregado']) && isset($nuevoDecoded['_entregado'])) {
                        $anteriorEntregado = $anteriorDecoded['_entregado'];
                        $nuevoEntregado = $nuevoDecoded['_entregado'];
                        unset($anteriorDecoded['_entregado']);
                        unset($nuevoDecoded['_entregado']);
                        $datosAdicionalesCambiaron = json_encode($anteriorDecoded) !== json_encode($nuevoDecoded);
                    }
                }
            }
        }

        // Solo guardar historial si cambiaron los datos adicionales, no solo el flag _entregado
        if ($requiereHistorial && $tieneRegistro && $valorCambio && $datosAdicionalesCambiaron) {
            // Obtener el id_campo correspondiente
            $stmtIdCampo = $conexion->prepare("SELECT id_campo FROM campo_expediente WHERE id_empleado = ? AND id_expediente = ?");
            $stmtIdCampo->bind_param("ii", $idEmpleado, $idExpediente);
            $stmtIdCampo->execute();
            $stmtIdCampo->bind_result($idCampo);
            $stmtIdCampo->fetch();
            $stmtIdCampo->close();

            if ($idCampo) {
                $stmtHist = $conexion->prepare("INSERT INTO historial_expediente (id_campo, valor) VALUES (?, ?)");
                $stmtHist->bind_param("is", $idCampo, $valorAnterior);
                $stmtHist->execute();
                $stmtHist->close();
            }
        }

        if ($tieneRegistro) {
            $stmtUpd = $conexion->prepare("UPDATE campo_expediente SET valor = ?, fecha_actualizacion = NOW() WHERE id_empleado = ? AND id_expediente = ?");
            $stmtUpd->bind_param("sii", $valorNuevo, $idEmpleado, $idExpediente);
            $stmtUpd->execute();
            $stmtUpd->close();
        } else {
            $stmtIns = $conexion->prepare("INSERT INTO campo_expediente (id_empleado, id_expediente, valor) VALUES (?, ?, ?)");
            $stmtIns->bind_param("iis", $idEmpleado, $idExpediente, $valorNuevo);
            $stmtIns->execute();
            $stmtIns->close();
        }

        $conexion->commit();
        echo json_encode(['exito' => true, 'mensaje' => 'Valor guardado correctamente']);
    } catch (Exception $e) {
        $conexion->rollback();
        echo json_encode(['exito' => false, 'mensaje' => 'Error al guardar: ' . $e->getMessage()]);
    }
}

function obtenerHistorialCampo()
{
    global $conexion;

    $idEmpleado = isset($_GET['id_empleado']) ? (int)$_GET['id_empleado'] : 0;
    $idExpediente = isset($_GET['id_expediente']) ? (int)$_GET['id_expediente'] : 0;

    if ($idEmpleado <= 0 || $idExpediente <= 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'IDs no válidos']);
        return;
    }

    // Primero obtener el id_campo correspondiente
    $stmtIdCampo = $conexion->prepare("SELECT id_campo FROM campo_expediente WHERE id_empleado = ? AND id_expediente = ?");
    $stmtIdCampo->bind_param("ii", $idEmpleado, $idExpediente);
    $stmtIdCampo->execute();
    $stmtIdCampo->bind_result($idCampo);
    $stmtIdCampo->fetch();
    $stmtIdCampo->close();

    if (!$idCampo) {
        echo json_encode(['exito' => true, 'datos' => []], JSON_UNESCAPED_UNICODE);
        return;
    }

    $stmt = $conexion->prepare("SELECT 
        he.id_historial,
        he.valor,
        he.fecha_registro
        FROM historial_expediente he
        WHERE he.id_campo = ?
        ORDER BY he.fecha_registro DESC, he.id_historial DESC");
    $stmt->bind_param("i", $idCampo);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $historial = [];
    if ($resultado && $resultado->num_rows > 0) {
        while ($row = $resultado->fetch_assoc()) {
            $historial[] = [
                'id_historial' => (int)$row['id_historial'],
                'valor' => $row['valor'],
                'fecha_registro' => $row['fecha_registro']
            ];
        }
    }
    $stmt->close();

    echo json_encode(['exito' => true, 'historial' => $historial]);
}

function obtenerDepartamentos()
{
    global $conexion;

    $arreglo = array();

    // Obtener id_area desde POST o GET
    $id_area = $_POST['id_area'] ?? $_GET['id_area'] ?? null;

    if (!empty($id_area)) {
        // Asegurar que sea entero
        $id_area = (int)$id_area;

        // SQL con filtro por área
        $sql = "SELECT DISTINCT
                    d.id_departamento,
                    d.nombre_departamento
                FROM departamentos d
                INNER JOIN areas_departamentos ad
                    ON d.id_departamento = ad.id_departamento
                WHERE ad.id_area = ?";

        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            die("Error en prepare: " . $conexion->error);
        }

        $stmt->bind_param("i", $id_area);
        $stmt->execute();
        $query = $stmt->get_result();

    } else {
        // Traer todos los departamentos si no se envía id_area
        $sql = "SELECT
                    d.id_departamento,
                    d.nombre_departamento,
                    GROUP_CONCAT(ad.id_area) as id_area
                FROM departamentos d
                LEFT JOIN areas_departamentos ad
                    ON d.id_departamento = ad.id_departamento
                GROUP BY d.id_departamento, d.nombre_departamento";
        $query = $conexion->query($sql);

        if (!$query) {
            die("Error en query: " . $conexion->error);
        }
    }

    // Construir arreglo
    while ($row = $query->fetch_object()) {
        // Un departamento puede pertenecer a varias áreas; conservar todas
        $areas = array();
        if (isset($row->id_area) && $row->id_area !== null && $row->id_area !== '') {
            $areas = array_values(array_filter(array_map('intval', explode(',', $row->id_area))));
        }

        $arreglo[] = array(
            "id_departamento" => $row->id_departamento,
            "nombre_departamento" => $row->nombre_departamento,
            "id_area" => $areas[0] ?? null,
            "id_areas" => $areas
        );
    }

    // Respuesta JSON
    echo json_encode($arreglo, JSON_UNESCAPED_UNICODE);
}
