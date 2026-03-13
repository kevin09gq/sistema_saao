<?php
// Desactivar la visualización de errores para que no rompan el JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

include "../../conexion/conexion.php";

// Forzar cabecera JSON
header('Content-Type: application/json; charset=UTF-8');

$action = $_GET['action'] ?? '';

try {
    if (!$conexion) {
        throw new Exception("Error de conexión a la base de datos: " . mysqli_connect_error());
    }

    if ($action === 'get_years') {
        $query = "SELECT DISTINCT anio FROM nomina_relicario WHERE anio IS NOT NULL AND anio > 0 ORDER BY anio DESC";
        $result = mysqli_query($conexion, $query);
        
        if (!$result) {
            throw new Exception("Error en la consulta de años: " . mysqli_error($conexion));
        }

        $anios = [];
        while ($row = mysqli_fetch_assoc($result)) {
            if ($row['anio']) {
                $anios[] = $row['anio'];
            }
        }
        
        // Si no hay años, devolver un array vacío en lugar de nada
        echo json_encode($anios ?: []);
    } 
    elseif ($action === 'get_weeks') {
        $anio = $_GET['anio'] ?? '';
        if (!$anio) throw new Exception("Año no proporcionado");
        
        $query = "SELECT id_nomina_relicario, numero_semana FROM nomina_relicario WHERE anio = ? ORDER BY numero_semana DESC";
        $stmt = $conexion->prepare($query);
        if (!$stmt) {
            throw new Exception("Error al preparar consulta de semanas: " . $conexion->error);
        }

        $stmt->bind_param("i", $anio);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $semanas = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $semanas[] = $row;
        }
        echo json_encode($semanas);
    } 
    elseif ($action === 'get_cortes') {
        $id_nomina = $_GET['id_nomina'] ?? '';
        if (!$id_nomina) throw new Exception("ID de nómina no proporcionado");
        
        $query = "SELECT * FROM cortes_relicario WHERE id_nomina = ? ORDER BY fecha_corte DESC, id DESC";
        $stmt = $conexion->prepare($query);
        if (!$stmt) {
            throw new Exception("Error al preparar consulta de cortes: " . $conexion->error);
        }

        $stmt->bind_param("i", $id_nomina);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $cortes = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $cortes[] = $row;
        }
        echo json_encode($cortes);
    } 
    elseif ($action === 'get_corte_details') {
        $id_corte = $_GET['id_corte'] ?? '';
        if (!$id_corte) throw new Exception("ID de corte no proporcionado");
        
        // Obtener datos del corte
        $queryCorte = "SELECT * FROM cortes_relicario WHERE id = ?";
        $stmtCorte = $conexion->prepare($queryCorte);
        if (!$stmtCorte) {
            throw new Exception("Error al preparar consulta de detalle de corte: " . $conexion->error);
        }

        $stmtCorte->bind_param("i", $id_corte);
        $stmtCorte->execute();
        $resultCorte = $stmtCorte->get_result();
        $corte = $resultCorte->fetch_assoc();
        
        if (!$corte) throw new Exception("Corte no encontrado");
        
        // Obtener tablas del corte
        $queryTablas = "SELECT * FROM cortes_relicario_tablas WHERE id_corte = ? ORDER BY num_tabla ASC";
        $stmtTablas = $conexion->prepare($queryTablas);
        if (!$stmtTablas) {
            throw new Exception("Error al preparar consulta de tablas de corte: " . $conexion->error);
        }

        $stmtTablas->bind_param("i", $id_corte);
        $stmtTablas->execute();
        $resultTablas = $stmtTablas->get_result();
        
        $tablas = [];
        while ($row = mysqli_fetch_assoc($resultTablas)) {
            $tablas[] = $row;
        }
        
        echo json_encode([
            'corte' => $corte,
            'tablas' => $tablas
        ]);
    } 
    else {
        throw new Exception("Acción no válida: " . $action);
    }
} catch (Exception $e) {
    // Si hay un error, devolverlo como JSON con código 500
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'action' => $action
    ]);
}
?>
