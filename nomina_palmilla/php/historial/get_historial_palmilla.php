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

function extraerMesDesdeJson($json_nomina) {
    global $meses_map;
    if(!$json_nomina) return null;
    $data = json_decode($json_nomina, true);
    if(isset($data['fecha_cierre'])) {
        $partes = explode('/', $data['fecha_cierre']);
        if(count($partes) >= 2) {
            $mesStr = $partes[1];
            return isset($meses_map[$mesStr]) ? $meses_map[$mesStr] : null;
        }
    }
    return null;
}

try {
    if ($action === 'get_filtros_iniciales') {
        $query = "
            SELECT DISTINCT n.id_nomina_palmilla, n.anio, n.numero_semana, n.nomina_palmilla
            FROM nomina_palmilla n
            JOIN cortes_palmilla c ON n.id_nomina_palmilla = c.id_nomina
            ORDER BY n.anio DESC, n.numero_semana ASC
        ";
        $stmt = $conexion->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $estructura = [];
        
        while($row = $result->fetch_assoc()) {
            $anio = $row['anio'];
            $semana = $row['numero_semana'];
            $mes = extraerMesDesdeJson($row['nomina_palmilla']);
            
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

        $query_cortes = "
            SELECT 
                c.id, c.folio, c.nombre_cortador, c.fecha_corte, c.precio_reja,
                n.numero_semana as sem_corte, n.anio as anio_corte, n.nomina_palmilla,
                GROUP_CONCAT(CONCAT('T', t.num_tabla, ':', t.rejas) SEPARATOR '|') as tablas_detalle,
                SUM(t.rejas) as total_rejas,
                SUM(t.rejas * c.precio_reja) as dinero_generado
            FROM cortes_palmilla c
            JOIN nomina_palmilla n ON c.id_nomina = n.id_nomina_palmilla
            LEFT JOIN cortes_palmilla_tablas t ON c.id = t.id_corte
            WHERE $where
            GROUP BY c.id
            ORDER BY c.fecha_corte DESC, c.id DESC
        ";
        
        $stmt = $conexion->prepare($query_cortes);
        if ($params_types !== "") {
            $stmt->bind_param($params_types, ...$params_values);
        }
        $stmt->execute();
        $result_cortes = $stmt->get_result();
        
        $cortes = [];
        $total_rejas = 0;
        $total_dinero = 0;
        
        $ids_cortes_incluidos = [];

        while ($c = $result_cortes->fetch_assoc()) {
            $mes_corte = extraerMesDesdeJson($c['nomina_palmilla']);
            
            if ($filtro_mes !== '' && (int)$mes_corte !== (int)$filtro_mes) {
                continue;
            }
            
            unset($c['nomina_palmilla']);
            
            $cortes[] = $c;
            $total_rejas += (int)$c['total_rejas'];
            $total_dinero += (float)$c['dinero_generado'];
            $ids_cortes_incluidos[] = $c['id'];
        }

        $ranking = [];
        $mejor_tabla = null;
        
        if (count($ids_cortes_incluidos) > 0) {
            $ids_string = implode(",", $ids_cortes_incluidos);
            $query_ranking = "
                SELECT t.num_tabla, SUM(t.rejas) as total
                FROM cortes_palmilla_tablas t
                WHERE t.id_corte IN ($ids_string)
                GROUP BY t.num_tabla
                ORDER BY total DESC
            ";
            $result_ranking = $conexion->query($query_ranking);
            
            while ($r = $result_ranking->fetch_assoc()) {
                $ranking[] = $r;
            }
            $mejor_tabla = !empty($ranking) ? $ranking[0] : null;
        }

        echo json_encode([
            "status" => "success",
            "data" => [
                "cortes" => $cortes,
                "ranking_tablas" => $ranking,
                "total_rejas" => $total_rejas,
                "total_dinero" => $total_dinero,
                "mejor_tabla" => $mejor_tabla ? "Tabla " . $mejor_tabla['num_tabla'] . " (" . $mejor_tabla['total'] . " rejas)" : "Sin datos"
            ]
        ]);
        exit();
    }

    echo json_encode(["status" => "error", "message" => "Acción no válida."]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
