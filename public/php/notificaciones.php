<?php
ob_start();
include("../../conexion/conexion.php");
ob_end_clean();
header('Content-Type: application/json; charset=utf-8');

/** @var mysqli $conexion */
$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    case 'obtenerNotificaciones':
        obtenerNotificaciones($conexion);
        break;
    default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}

// ======================================================
// OBTIENE LAS NOTIFICACIONES DE ANIVERSARIOS
// ======================================================
// Tipos de notificación:
//   PROXIMO   → aniversario en los próximos 2 días (aún no ha llegado)
//   HOY       → el aniversario es exactamente hoy
//   RECIENTE  → el aniversario fue hace 1 o 2 días
// ======================================================
function obtenerNotificaciones($conexion)
{
    $hoy = new DateTime('today');

    // Traer todos los empleados activos con su fecha de ingreso efectiva
    $sql = "
        SELECT
            e.id_empleado,
            e.clave_empleado,
            e.nombre,
            e.ap_paterno,
            e.ap_materno,
            COALESCE(
                (SELECT MAX(hr.fecha_reingreso)
                 FROM historial_reingresos hr
                 WHERE hr.id_empleado = e.id_empleado),
                e.fecha_alta_empresa
            ) AS fecha_ingreso_final
        FROM info_empleados e
        WHERE e.id_status = 1
          AND e.fecha_alta_empresa IS NOT NULL
          AND CAST(e.fecha_alta_empresa AS CHAR) != '0000-00-00'
          AND e.fecha_alta_empresa >= '1900-01-01'
        ORDER BY e.clave_empleado ASC
    ";

    $result = mysqli_query($conexion, $sql);
    if (!$result) {
        echo json_encode(['error' => mysqli_error($conexion)]);
        return;
    }

    $notificaciones = [];

    while ($emp = mysqli_fetch_assoc($result)) {
        // Saltar si la fecha de ingreso es inválida
        $fi = $emp['fecha_ingreso_final'] ?? '';
        if (empty($fi) || $fi === '0000-00-00' || $fi < '1900-01-01') continue;

        $fechaIngreso = new DateTime($fi);

        // Calcular el próximo aniversario en el año actual
        $anivEsteAnio = (clone $fechaIngreso)->setDate(
            (int)$hoy->format('Y'),
            (int)$fechaIngreso->format('m'),
            (int)$fechaIngreso->format('d')
        );

        // Si el aniversario de este año ya pasó completamente (> 2 días), usar el del año siguiente
        $difDias = (int)$hoy->diff($anivEsteAnio)->days;
        $esPasado = $anivEsteAnio < $hoy;

        if ($esPasado && $difDias > 2) {
            // El aniversario de este año ya pasó hace más de 2 días → no aplica
            continue;
        }

        // Años que cumple en este aniversario
        $aniosCumple = (int)$fechaIngreso->diff($anivEsteAnio)->y;
        if ($aniosCumple <= 0) continue; // aún no ha cumplido su primer año

        $nombre = trim($emp['nombre'] . ' ' . $emp['ap_paterno'] . ' ' . $emp['ap_materno']);

        // ── Determinar el TIPO ─────────────────────────────────
        if (!$esPasado && $difDias == 0) {
            // Exactamente hoy
            $tipo = 'HOY';
        } elseif (!$esPasado && $difDias >= 1 && $difDias <= 2) {
            // Dentro de 1 o 2 días (próximo)
            $tipo = 'PROXIMO';
        } elseif ($esPasado && $difDias >= 1 && $difDias <= 2) {
            // Fue hace 1 o 2 días (reciente)
            $tipo = 'RECIENTE';
        } else {
            continue;
        }

        $notificaciones[] = [
            'id_empleado'       => $emp['id_empleado'],
            'clave_empleado'    => $emp['clave_empleado'],
            'nombre'            => $nombre,
            'fecha_aniversario' => $anivEsteAnio->format('Y-m-d'),
            'anios'             => $aniosCumple,
            'dias_diferencia'   => $difDias,
            'tipo'              => $tipo,
        ];
    }

    // Ordenar: HOY primero, luego PROXIMO, luego RECIENTE
    $orden = ['HOY' => 0, 'PROXIMO' => 1, 'RECIENTE' => 2];
    usort($notificaciones, fn($a, $b) => $orden[$a['tipo']] - $orden[$b['tipo']]);

    echo json_encode([
        'total'          => count($notificaciones),
        'notificaciones' => $notificaciones,
    ], JSON_UNESCAPED_UNICODE);
}
