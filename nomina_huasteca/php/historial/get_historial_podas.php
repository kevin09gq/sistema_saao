<?php
header('Content-Type: application/json; charset=utf-8');
include "../../../config/config.php";
include "../../../conexion/conexion.php";

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode(["status" => "error", "message" => "No has iniciado sesión."]);
    exit();
}

$action = isset($_POST['action']) ? $_POST['action'] : '';

$meses_map = [
    'Ene' => 1, 'Feb' => 2, 'Mar' => 3, 'Abr' => 4, 'May' => 5, 'Jun' => 6,
    'Jul' => 7, 'Ago' => 8, 'Sep' => 9, 'Oct' => 10, 'Nov' => 11, 'Dic' => 12
];

function extraerMesDesdeJson($json_nomina)
{
    global $meses_map;
    if (!$json_nomina) return null;
    $data = json_decode($json_nomina, true);
    if (isset($data['fecha_cierre'])) {
        $partes = explode('/', $data['fecha_cierre']);
        if (count($partes) >= 2) {
            $mesStr = $partes[1];
            return isset($meses_map[$mesStr]) ? $meses_map[$mesStr] : null;
        }
    }
    return null;
}

try {
    if ($action === 'get_filtros_iniciales') {
        $query = "
            SELECT DISTINCT n.id_nomina_huasteca, n.anio, n.numero_semana, n.nomina_huasteca
            FROM nomina_huasteca n
            JOIN podas_huasteca p ON n.id_nomina_huasteca = p.id_nomina
            ORDER BY n.anio DESC, n.numero_semana ASC
        ";
        $stmt = $conexion->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();

        $estructura = [];

        while ($row = $result->fetch_assoc()) {
            $anio = $row['anio'];
            $semana = $row['numero_semana'];
            $mes = extraerMesDesdeJson($row['nomina_huasteca']);

            if ($anio == null) continue;

            if (!isset($estructura[$anio])) {
                $estructura[$anio] = [];
            }
            if ($mes != null) {
                if (!isset($estructura[$anio][$mes])) {
                    $estructura[$anio][$mes] = [];
                }
                if ($semana != null && !in_array($semana, $estructura[$anio][$mes])) {
                    $estructura[$anio][$mes][] = $semana;
                }
            }
        }

        echo json_encode(["status" => "success", "data" => $estructura]);
        exit();
    }

    if ($action === 'buscar') {
        $filtro_anio = isset($_POST['anio']) ? $_POST['anio'] : '';
        $filtro_mes = isset($_POST['mes']) ? $_POST['mes'] : '';
        $filtro_semana = isset($_POST['semana']) ? $_POST['semana'] : '';

        // Obtener el color del área de Huasteca (ID 6)
        $color_area = '#B50600'; // Color por defecto
        $query_color = "
            SELECT a.colores 
            FROM areas a
            INNER JOIN nombre_nominas n ON a.id_area = n.id_area
            WHERE n.id_nomina = 6
            LIMIT 1
        ";
        $res_color = $conexion->query($query_color);
        if ($res_color && $row_color = $res_color->fetch_assoc()) {
            if (!empty($row_color['colores'])) {
                $color_area = $row_color['colores'];
            }
        }

        $params_types = "";
        $params_values = [];
        $where_clauses = ["1=1"]; 

        if ($filtro_anio !== '') {
            $where_clauses[] = "n.anio = ?";
            $params_types .= "i";
            $params_values[] = (int)$filtro_anio;
        }
        if ($filtro_semana !== '') {
            $where_clauses[] = "n.numero_semana = ?";
            $params_types .= "i";
            $params_values[] = (int)$filtro_semana;
        }

        $where = implode(" AND ", $where_clauses);

        $query_podas = "
            SELECT 
                p.id_poda, p.nombre_empleado, p.fecha_creacion,
                n.numero_semana as sem_poda, n.anio as anio_poda, n.nomina_huasteca,
                SUM(CASE WHEN m.es_extra = 0 THEN IFNULL(m.arboles_podados, 0) ELSE 0 END) as total_arboles,
                SUM(CASE WHEN m.es_extra = 0 THEN (IFNULL(m.arboles_podados, 0) * IFNULL(m.monto, 0)) ELSE 0 END) as total_podas,
                SUM(CASE WHEN m.es_extra = 1 THEN IFNULL(m.monto, 0) ELSE 0 END) as total_extras,
                SUM(
                    CASE
                        WHEN m.es_extra = 0 THEN (IFNULL(m.arboles_podados, 0) * IFNULL(m.monto, 0))
                        ELSE IFNULL(m.monto, 0)
                    END
                ) as total_monto,
                (SELECT m2.monto
                 FROM podas_movimientos_huasteca m2
                 WHERE m2.id_poda = p.id_poda AND m2.es_extra = 0
                 ORDER BY m2.fecha ASC, m2.id_movimiento ASC
                 LIMIT 1) as pago_por_arbol,
                (SELECT m3.concepto FROM podas_movimientos_huasteca m3 WHERE m3.id_poda = p.id_poda AND m3.es_extra = 1 LIMIT 1) as concepto_extra,
                COUNT(m.id_movimiento) as dias_registrados
            FROM podas_huasteca p
            JOIN nomina_huasteca n ON p.id_nomina = n.id_nomina_huasteca
            LEFT JOIN podas_movimientos_huasteca m ON p.id_poda = m.id_poda
            WHERE $where
            GROUP BY p.id_poda
            ORDER BY p.id_poda ASC
        ";

        $stmt = $conexion->prepare($query_podas);
        if ($params_types !== "") {
            $stmt->bind_param($params_types, ...$params_values);
        }
        $stmt->execute();
        $result_podas = $stmt->get_result();

        $podas = [];
        $total_arboles = 0;
        $total_monto = 0;
        $mejor_podador = null;
        $max_arboles = 0;

        while ($p = $result_podas->fetch_assoc()) {
            $mes_poda = extraerMesDesdeJson($p['nomina_huasteca']);
            if ($filtro_mes !== '' && (int)$mes_poda !== (int)$filtro_mes) {
                continue;
            }

            unset($p['nomina_huasteca']);

            $podas[] = $p;
            $total_arboles += (int)$p['total_arboles'];
            $total_monto += (float)$p['total_monto'];

            if ((int)$p['total_arboles'] > $max_arboles) {
                $max_arboles = (int)$p['total_arboles'];
                $mejor_podador = $p['nombre_empleado'] . " (" . $max_arboles . " árboles)";
            }
        }

        // Ranking (solo podas reales con árboles)
        $ranking = [];
        if (count($podas) > 0) {
            foreach ($podas as $p) {
                if ((int)$p['total_arboles'] > 0) {
                    $ranking[] = [
                        "nombre_empleado" => $p['nombre_empleado'],
                        "total_arboles" => (int)$p['total_arboles'],
                        "id_poda" => $p['id_poda']
                    ];
                }
            }
            usort($ranking, function ($a, $b) {
                return $b['total_arboles'] - $a['total_arboles'];
            });
        }

        echo json_encode([
            "status" => "success",
            "data" => [
                "podas" => $podas,
                "ranking_podadores" => $ranking,
                "total_arboles" => $total_arboles,
                "total_dinero" => $total_monto,
                "mejor_podador" => $mejor_podador ?: "Sin datos",
                "color_area" => $color_area
            ]
        ]);
        exit();
    }

    if ($action === 'get_movimientos') {
        $id_poda = isset($_POST['id_poda']) ? (int)$_POST['id_poda'] : 0;

        $query = "
            SELECT m.id_movimiento, m.concepto, m.fecha, m.arboles_podados, m.monto, m.es_extra
            FROM podas_movimientos_huasteca m
            WHERE m.id_poda = ?
            ORDER BY m.fecha ASC, m.id_movimiento ASC
        ";
        $stmt = $conexion->prepare($query);
        $stmt->bind_param("i", $id_poda);
        $stmt->execute();
        $result = $stmt->get_result();

        $movimientos = [];
        while ($row = $result->fetch_assoc()) {
            $movimientos[] = $row;
        }

        echo json_encode(["status" => "success", "data" => $movimientos]);
        exit();
    }

    echo json_encode(["status" => "error", "message" => "Acción no válida."]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
