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

    $notificaciones = array();

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

    // ======================================================
    // AGREGAR NOTIFICACIONES DE GAFETES (nuevo código agregado)
    // ======================================================
    // Notificaciones de gafetes vencidos
    $sql_vencidos = "SELECT id_empleado, clave_empleado, nombre, ap_paterno, ap_materno, fecha_vigencia 
        FROM info_empleados 
        WHERE fecha_vigencia < CURDATE() 
          AND fecha_vigencia IS NOT NULL
          AND id_status = 1";

    $result_vencidos = $conexion->query($sql_vencidos);
    if ($result_vencidos) {
        while ($row = $result_vencidos->fetch_assoc()) {
            $fecha_vigencia = new DateTime($row['fecha_vigencia']);
            $diferencia = $fecha_vigencia->diff($hoy);
            $nombre = trim($row['nombre'] . ' ' . $row['ap_paterno'] . ' ' . $row['ap_materno']);
            
            $notificaciones[] = [
                'id_empleado'       => $row['id_empleado'],
                'clave_empleado'    => $row['clave_empleado'],
                'nombre'            => $nombre,
                'fecha_vigencia'    => $row['fecha_vigencia'],
                'dias_vencidos'     => $diferencia->days,
                'tipo'              => 'GAFETE_VENCIDO',
            ];
        }
    }

    // Notificaciones de gafetes próximos a vencer (7 días)
    $sql_proximos = "SELECT id_empleado, clave_empleado, nombre, ap_paterno, ap_materno, fecha_vigencia 
        FROM info_empleados 
        WHERE fecha_vigencia IS NOT NULL 
          AND fecha_vigencia >= CURDATE() 
          AND fecha_vigencia <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
          AND id_status = 1";

    $result_proximos = $conexion->query($sql_proximos);
    if ($result_proximos) {
        while ($row = $result_proximos->fetch_assoc()) {
            $fecha_vigencia = new DateTime($row['fecha_vigencia']);
            $fecha_vigencia->setTime(0,0,0);
            $diferencia = $hoy->diff($fecha_vigencia);
            $nombre = trim($row['nombre'] . ' ' . $row['ap_paterno'] . ' ' . $row['ap_materno']);
            
            $notificaciones[] = [
                'id_empleado'       => $row['id_empleado'],
                'clave_empleado'    => $row['clave_empleado'],
                'nombre'            => $nombre,
                'fecha_vigencia'    => $row['fecha_vigencia'],
                'dias_restantes'    => (int)$diferencia->format('%r%a'),
                'tipo'              => 'GAFETE_PROXIMO',
            ];
        }
    }

    // Ordenar: HOY primero, luego PROXIMO, luego RECIENTE, luego gafetes
    // Pero mantenemos el orden original para lo que ya existía
    $orden = ['HOY' => 0, 'PROXIMO' => 1, 'RECIENTE' => 2, 'GAFETE_VENCIDO' => 3, 'GAFETE_PROXIMO' => 4];
    usort($notificaciones, fn($a, $b) => $orden[$a['tipo']] - $orden[$b['tipo']]);

    echo json_encode([
        'total'          => count($notificaciones),
        'notificaciones' => $notificaciones,
    ], JSON_UNESCAPED_UNICODE);
}
