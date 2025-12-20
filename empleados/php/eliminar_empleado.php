<?php
include("../../config/config.php");
include("../../conexion/conexion.php");

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'title' => 'ERROR',
        'text' => 'Método no permitido.',
        'type' => 'error',
        'icon' => $rutaRaiz . 'plugins/toasts/icons/icon_error.png',
        'timeout' => 3000
    ]);
    exit;
}

$id_empleado = isset($_POST['id_empleado']) ? intval($_POST['id_empleado']) : 0;
if ($id_empleado <= 0) {
    http_response_code(400);
    echo json_encode([
        'title' => 'ERROR',
        'text' => 'ID de empleado inválido.',
        'type' => 'error',
        'icon' => $rutaRaiz . 'plugins/toasts/icons/icon_error.png',
        'timeout' => 3000
    ]);
    exit;
}

try {
    $conexion->begin_transaction();

    // Eliminar asignaciones de casilleros del empleado
    $sqlLiberar = $conexion->prepare("DELETE FROM empleado_casillero WHERE id_empleado = ?");
    $sqlLiberar->bind_param("i", $id_empleado);
    if (!$sqlLiberar->execute()) { throw new Exception('No se pudo liberar los casilleros asignados.'); }
    $sqlLiberar->close();

    // Eliminar historial de reingresos del empleado
    $sqlDelHist = $conexion->prepare("DELETE FROM historial_reingresos WHERE id_empleado = ?");
    $sqlDelHist->bind_param("i", $id_empleado);
    if (!$sqlDelHist->execute()) { throw new Exception('No se pudo eliminar el historial de reingresos.'); }
    $sqlDelHist->close();

    // Obtener contactos relacionados a este empleado
    $contactIds = [];
    $sqlSelectContact = $conexion->prepare("SELECT id_contacto FROM empleado_contacto WHERE id_empleado = ?");
    $sqlSelectContact->bind_param("i", $id_empleado);
    if (!$sqlSelectContact->execute()) { throw new Exception('No se pudo obtener contactos.'); }
    $res = $sqlSelectContact->get_result();
    while ($row = $res->fetch_assoc()) { $contactIds[] = intval($row['id_contacto']); }
    $sqlSelectContact->close();

    // Eliminar relaciones del empleado
    $sqlDelRel = $conexion->prepare("DELETE FROM empleado_contacto WHERE id_empleado = ?");
    $sqlDelRel->bind_param("i", $id_empleado);
    if (!$sqlDelRel->execute()) { throw new Exception('No se pudo eliminar relaciones de contacto.'); }
    $sqlDelRel->close();

    // =============================
    // ELIMINAR RELACIONES DE BENEFICIARIOS
    // =============================
    // Obtener beneficiarios relacionados al empleado
    $beneficiarioIds = [];
    $sqlSelectBenef = $conexion->prepare("SELECT id_beneficiario FROM empleado_beneficiario WHERE id_empleado = ?");
    $sqlSelectBenef->bind_param("i", $id_empleado);
    if (!$sqlSelectBenef->execute()) { throw new Exception('No se pudo obtener beneficiarios.'); }
    $resBenef = $sqlSelectBenef->get_result();
    while ($row = $resBenef->fetch_assoc()) { $beneficiarioIds[] = intval($row['id_beneficiario']); }
    $sqlSelectBenef->close();

    // Eliminar relaciones en empleado_beneficiario
    $sqlDelBenefRel = $conexion->prepare("DELETE FROM empleado_beneficiario WHERE id_empleado = ?");
    $sqlDelBenefRel->bind_param("i", $id_empleado);
    if (!$sqlDelBenefRel->execute()) { throw new Exception('No se pudo eliminar relaciones de beneficiarios.'); }
    $sqlDelBenefRel->close();

    // Limpiar beneficiarios huérfanos (sin relación con ningún empleado)
    if (!empty($beneficiarioIds)) {
        $sqlCountBenef = $conexion->prepare("SELECT COUNT(*) AS c FROM empleado_beneficiario WHERE id_beneficiario = ?");
        $sqlDeleteBenef = $conexion->prepare("DELETE FROM beneficiarios WHERE id_beneficiario = ?");
        foreach ($beneficiarioIds as $bid) {
            $sqlCountBenef->bind_param("i", $bid);
            if (!$sqlCountBenef->execute()) { throw new Exception('No se pudo verificar referencias de beneficiarios.'); }
            $countRes = $sqlCountBenef->get_result();
            $countRow = $countRes->fetch_assoc();
            $numRefs = intval($countRow['c']);
            if ($numRefs === 0) {
                $sqlDeleteBenef->bind_param("i", $bid);
                if (!$sqlDeleteBenef->execute()) { throw new Exception('No se pudo eliminar un beneficiario huérfano.'); }
            }
        }
        $sqlCountBenef->close();
        $sqlDeleteBenef->close();
    }

    // Eliminar turnos del empleado
    $sqlDelTurno = $conexion->prepare("DELETE FROM empleado_turno WHERE id_empleado = ?");
    $sqlDelTurno->bind_param("i", $id_empleado);
    if (!$sqlDelTurno->execute()) { throw new Exception('No se pudo eliminar los turnos del empleado.'); }
    $sqlDelTurno->close();

    // =============================
    // ELIMINAR EMPLEADO
    // =============================
    $sqlDelEmp = $conexion->prepare("DELETE FROM info_empleados WHERE id_empleado = ?");
    $sqlDelEmp->bind_param("i", $id_empleado);
    if (!$sqlDelEmp->execute()) { throw new Exception('No se pudo eliminar al empleado.'); }
    $sqlDelEmp->close();

    // Limpiar contactos huérfanos (sin relación)
    if (!empty($contactIds)) {
        $sqlCount = $conexion->prepare("SELECT COUNT(*) AS c FROM empleado_contacto WHERE id_contacto = ?");
        $sqlDeleteContacto = $conexion->prepare("DELETE FROM contacto_emergencia WHERE id_contacto = ?");
        foreach ($contactIds as $cid) {
            $sqlCount->bind_param("i", $cid);
            if (!$sqlCount->execute()) { throw new Exception('No se pudo verificar referencias de contactos.'); }
            $countRes = $sqlCount->get_result();
            $countRow = $countRes->fetch_assoc();
            $numRefs = intval($countRow['c']);
            if ($numRefs === 0) {
                $sqlDeleteContacto->bind_param("i", $cid);
                if (!$sqlDeleteContacto->execute()) { throw new Exception('No se pudo eliminar un contacto de emergencia.'); }
            }
        }
        $sqlCount->close();
        $sqlDeleteContacto->close();
    }

    $conexion->commit();

    echo json_encode([
        'title' => 'SUCCESS',
        'text' => 'Empleado, beneficiarios y contactos eliminados correctamente.',
        'type' => 'success',
        'icon' => $rutaRaiz . 'plugins/toasts/icons/icon_success.png',
        'timeout' => 3000
    ]);
} catch (Exception $e) {
    $conexion->rollback();
    http_response_code(500);
    echo json_encode([
        'title' => 'ERROR',
        'text' => 'Error al eliminar: ' . $e->getMessage(),
        'type' => 'error',
        'icon' => $rutaRaiz . 'plugins/toasts/icons/icon_error.png',
        'timeout' => 4000
    ]);
}

?>
