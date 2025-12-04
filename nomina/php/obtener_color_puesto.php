<?php
include("../../conexion/conexion.php");
header('Content-Type: application/json');

try {
    // Aceptar JSON o x-www-form-urlencoded
    $input = file_get_contents('php://input');
    $data = [];
    if ($input) {
        $parsed = json_decode($input, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($parsed)) {
            $data = $parsed;
        }
    }

    $idEmpleado = null;
    $clave = null;

    if (isset($_POST['id_empleado'])) {
        $idEmpleado = (int)$_POST['id_empleado'];
    } elseif (isset($_POST['clave'])) {
        $clave = trim($_POST['clave']);
    } elseif (isset($data['id_empleado'])) {
        $idEmpleado = (int)$data['id_empleado'];
    } elseif (isset($data['clave'])) {
        $clave = trim($data['clave']);
    }

    if ($idEmpleado === null && ($clave === null || $clave === '')) {
        echo json_encode(['success' => false, 'message' => 'Parámetro requerido: id_empleado o clave']);
        exit;
    }

    if ($idEmpleado !== null) {
        $sql = $conexion->prepare("SELECT pe.color_hex
                                   FROM info_empleados ie
                                   INNER JOIN puestos_especiales pe ON ie.id_puestoEspecial = pe.id_puestoEspecial
                                   WHERE ie.id_empleado = ?");
        $sql->bind_param("i", $idEmpleado);
    } else {
        $sql = $conexion->prepare("SELECT pe.color_hex
                                   FROM info_empleados ie
                                   INNER JOIN puestos_especiales pe ON ie.id_puestoEspecial = pe.id_puestoEspecial
                                   WHERE ie.clave_empleado = ?");
        $sql->bind_param("s", $clave);
    }

    if (!$sql) {
        echo json_encode(['success' => false, 'message' => 'Error de preparación: ' . $conexion->error]);
        exit;
    }

    $sql->execute();
    $res = $sql->get_result();
    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        echo json_encode(['success' => true, 'color_hex' => $row['color_hex']]);
    } else {
        echo json_encode(['success' => true, 'color_hex' => null]);
    }
    $sql->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
