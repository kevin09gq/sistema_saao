<?php
include("../../conexion/conexion.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['id_empleado']) && isset($_POST['status_nss'])) {
        $idEmpleado = (int)$_POST['id_empleado'];
        $statusNss = (int)$_POST['status_nss']; // 0 o 1
        
        // Validar que el status sea 0 o 1
        if ($statusNss !== 0 && $statusNss !== 1) {
            echo json_encode(['success' => false]);
            exit;
        }
        
        // Actualizar el status NSS del empleado
        $sql = $conexion->prepare("UPDATE info_empleados SET status_nss = ? WHERE id_empleado = ?");
        $sql->bind_param("ii", $statusNss, $idEmpleado);
        
        if ($sql->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false]);
        }
        
        $sql->close();
    } else {
        echo json_encode(['success' => false]);
    }
} else {
    echo json_encode(['success' => false]);
}
?>