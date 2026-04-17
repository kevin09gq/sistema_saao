<?php
require_once __DIR__ . '/../../conexion/conexion.php';

$data = json_decode(file_get_contents('php://input'), true);
$case = isset($data['case']) ? $data['case'] : (isset($_GET['case']) ? $_GET['case'] : '');

switch ($case) {
    case 'obtenerDepartamentosNomina':
        $id_nomina = isset($data['id_nomina']) ? $data['id_nomina'] : (isset($_GET['id_nomina']) ? $_GET['id_nomina'] : 3);
        
        $sql = "SELECT d.id_departamento, d.nombre_departamento 
                FROM departamentos d
                INNER JOIN nomina_departamento nd ON d.id_departamento = nd.id_departamento
                WHERE nd.id_nomina = $id_nomina";
        
        $result = mysqli_query($conexion, $sql);
        $departamentos = [];
        
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $departamentos[] = $row;
            }
            echo json_encode(['success' => true, 'departamentos' => $departamentos]);
        } else {
            echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
        }
        break;

    case 'obtenerEmpresas':
        $sql = "SELECT id_empresa, nombre_empresa FROM empresa";
        $result = mysqli_query($conexion, $sql);
        $empresas = [];
        
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $empresas[] = $row;
            }
            echo json_encode(['success' => true, 'empresas' => $empresas]);
        } else {
            echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Caso no válido']);
        break;
}
?>
