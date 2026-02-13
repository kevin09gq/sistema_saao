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
    if (!$sqlLiberar->execute()) {
        throw new Exception('No se pudo liberar los casilleros asignados.');
    }
    $sqlLiberar->close();

    // Eliminar historial de reingresos del empleado
    $sqlDelHist = $conexion->prepare("DELETE FROM historial_reingresos WHERE id_empleado = ?");
    $sqlDelHist->bind_param("i", $id_empleado);
    if (!$sqlDelHist->execute()) {
        throw new Exception('No se pudo eliminar el historial de reingresos.');
    }
    $sqlDelHist->close();

    // Obtener contactos relacionados a este empleado
    $contactIds = [];
    $sqlSelectContact = $conexion->prepare("SELECT id_contacto FROM empleado_contacto WHERE id_empleado = ?");
    $sqlSelectContact->bind_param("i", $id_empleado);
    if (!$sqlSelectContact->execute()) {
        throw new Exception('No se pudo obtener contactos.');
    }
    $res = $sqlSelectContact->get_result();
    while ($row = $res->fetch_assoc()) {
        $contactIds[] = intval($row['id_contacto']);
    }
    $sqlSelectContact->close();

    // Eliminar relaciones del empleado
    $sqlDelRel = $conexion->prepare("DELETE FROM empleado_contacto WHERE id_empleado = ?");
    $sqlDelRel->bind_param("i", $id_empleado);
    if (!$sqlDelRel->execute()) {
        throw new Exception('No se pudo eliminar relaciones de contacto.');
    }
    $sqlDelRel->close();

    // =============================
    // ELIMINAR RELACIONES DE BENEFICIARIOS
    // =============================
    // Obtener beneficiarios relacionados al empleado
    $beneficiarioIds = [];
    $sqlSelectBenef = $conexion->prepare("SELECT id_beneficiario FROM empleado_beneficiario WHERE id_empleado = ?");
    $sqlSelectBenef->bind_param("i", $id_empleado);
    if (!$sqlSelectBenef->execute()) {
        throw new Exception('No se pudo obtener beneficiarios.');
    }
    $resBenef = $sqlSelectBenef->get_result();
    while ($row = $resBenef->fetch_assoc()) {
        $beneficiarioIds[] = intval($row['id_beneficiario']);
    }
    $sqlSelectBenef->close();

    // Eliminar relaciones en empleado_beneficiario
    $sqlDelBenefRel = $conexion->prepare("DELETE FROM empleado_beneficiario WHERE id_empleado = ?");
    $sqlDelBenefRel->bind_param("i", $id_empleado);
    if (!$sqlDelBenefRel->execute()) {
        throw new Exception('No se pudo eliminar relaciones de beneficiarios.');
    }
    $sqlDelBenefRel->close();

    // Limpiar beneficiarios huérfanos (sin relación con ningún empleado)
    if (!empty($beneficiarioIds)) {
        $sqlCountBenef = $conexion->prepare("SELECT COUNT(*) AS c FROM empleado_beneficiario WHERE id_beneficiario = ?");
        $sqlDeleteBenef = $conexion->prepare("DELETE FROM beneficiarios WHERE id_beneficiario = ?");
        foreach ($beneficiarioIds as $bid) {
            $sqlCountBenef->bind_param("i", $bid);
            if (!$sqlCountBenef->execute()) {
                throw new Exception('No se pudo verificar referencias de beneficiarios.');
            }
            $countRes = $sqlCountBenef->get_result();
            $countRow = $countRes->fetch_assoc();
            $numRefs = intval($countRow['c']);
            if ($numRefs === 0) {
                $sqlDeleteBenef->bind_param("i", $bid);
                if (!$sqlDeleteBenef->execute()) {
                    throw new Exception('No se pudo eliminar un beneficiario huérfano.');
                }
            }
        }
        $sqlCountBenef->close();
        $sqlDeleteBenef->close();
    }

    // Eliminar horarios del Biometrico del empleado
    $sqlLiberarHorario = $conexion->prepare("DELETE FROM empleado_horario_reloj WHERE id_empleado = ?");
    $sqlLiberarHorario->bind_param("i", $id_empleado);
    $sqlLiberarHorario->execute();
    $sqlLiberarHorario->close();

     // Eliminar horarios oficiales del empleado
    $sqlLiberarHorarioOficial = $conexion->prepare("DELETE FROM horarios_oficiales WHERE id_empleado = ?");
    $sqlLiberarHorarioOficial->bind_param("i", $id_empleado);
    $sqlLiberarHorarioOficial->execute();
    $sqlLiberarHorarioOficial->close();

    // Eliminar historial de incidencias semanal relacionado al empleado
    $sqlDelHistInc = $conexion->prepare("DELETE FROM historial_incidencias_semanal WHERE empleado_id = ?");
    $sqlDelHistInc->bind_param("i", $id_empleado);
    if (!$sqlDelHistInc->execute()) {
        throw new Exception('No se pudo eliminar el historial de incidencias semanal.');
    }
    $sqlDelHistInc->close();

    // =============================
    // ELIMINAR AUTORIZACIONES RELACIONADAS (historiales_autorizaciones, claves_autorizacion)
    // =============================
    $sqlDelHistAut = $conexion->prepare("DELETE historiales_autorizaciones FROM historiales_autorizaciones JOIN claves_autorizacion ON historiales_autorizaciones.id_clave = claves_autorizacion.id_autorizacion WHERE claves_autorizacion.id_empleado = ?");
    $sqlDelHistAut->bind_param("i", $id_empleado);
    if (!$sqlDelHistAut->execute()) {
        throw new Exception('No se pudo eliminar historiales de autorizaciones.');
    }
    $sqlDelHistAut->close();

    $sqlDelClaves = $conexion->prepare("DELETE FROM claves_autorizacion WHERE id_empleado = ?");
    $sqlDelClaves->bind_param("i", $id_empleado);
    if (!$sqlDelClaves->execute()) {
        throw new Exception('No se pudo eliminar claves de autorización.');
    }
    $sqlDelClaves->close();

    // =============================
    // ELIMINAR PRÉSTAMOS RELACIONADOS (detalle_planes, planes_pagos, prestamos_abonos, prestamos)
    // =============================
    $sqlDelDetalle = $conexion->prepare("DELETE detalle_planes FROM detalle_planes JOIN planes_pagos ON detalle_planes.id_plan = planes_pagos.id_plan JOIN prestamos ON planes_pagos.id_prestamo = prestamos.id_prestamo WHERE prestamos.id_empleado = ?");
    $sqlDelDetalle->bind_param("i", $id_empleado);
    if (!$sqlDelDetalle->execute()) {
        throw new Exception('No se pudo eliminar detalle de planes.');
    }
    $sqlDelDetalle->close();

    $sqlDelPlanes = $conexion->prepare("DELETE planes_pagos FROM planes_pagos JOIN prestamos ON planes_pagos.id_prestamo = prestamos.id_prestamo WHERE prestamos.id_empleado = ?");
    $sqlDelPlanes->bind_param("i", $id_empleado);
    if (!$sqlDelPlanes->execute()) {
        throw new Exception('No se pudo eliminar planes de pagos.');
    }
    $sqlDelPlanes->close();

    $sqlDelAbonos = $conexion->prepare("DELETE prestamos_abonos FROM prestamos_abonos JOIN prestamos ON prestamos_abonos.id_prestamo = prestamos.id_prestamo WHERE prestamos.id_empleado = ?");
    $sqlDelAbonos->bind_param("i", $id_empleado);
    if (!$sqlDelAbonos->execute()) {
        throw new Exception('No se pudo eliminar abonos de préstamos.');
    }
    $sqlDelAbonos->close();

    $sqlDelPrest = $conexion->prepare("DELETE FROM prestamos WHERE id_empleado = ?");
    $sqlDelPrest->bind_param("i", $id_empleado);
    if (!$sqlDelPrest->execute()) {
        throw new Exception('No se pudo eliminar préstamos.');
    }
    $sqlDelPrest->close();

    // =============================
    // ELIMINAR EMPLEADO
    // =============================
    $sqlDelEmp = $conexion->prepare("DELETE FROM info_empleados WHERE id_empleado = ?");
    $sqlDelEmp->bind_param("i", $id_empleado);
    if (!$sqlDelEmp->execute()) {
        throw new Exception('No se pudo eliminar al empleado.');
    }
    $sqlDelEmp->close();

    // Limpiar contactos huérfanos (sin relación)
    if (!empty($contactIds)) {
        $sqlCount = $conexion->prepare("SELECT COUNT(*) AS c FROM empleado_contacto WHERE id_contacto = ?");
        $sqlDeleteContacto = $conexion->prepare("DELETE FROM contacto_emergencia WHERE id_contacto = ?");
        foreach ($contactIds as $cid) {
            $sqlCount->bind_param("i", $cid);
            if (!$sqlCount->execute()) {
                throw new Exception('No se pudo verificar referencias de contactos.');
            }
            $countRes = $sqlCount->get_result();
            $countRow = $countRes->fetch_assoc();
            $numRefs = intval($countRow['c']);
            if ($numRefs === 0) {
                $sqlDeleteContacto->bind_param("i", $cid);
                if (!$sqlDeleteContacto->execute()) {
                    throw new Exception('No se pudo eliminar un contacto de emergencia.');
                }
            }
        }
        $sqlCount->close();
        $sqlDeleteContacto->close();
    }

    $conexion->commit();

    echo json_encode([
        'title' => 'SUCCESS',
        'text' => 'Empleado, beneficiarios, contactos y horarios eliminados correctamente.',
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
