<?php
include("../../../conexion/conexion.php");

if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
        // NÓMINAS
        case 'obtenerNominas':
            obtenerNominas();
            break;
        case 'actualizarNomina':
            actualizarNomina();
            break;

        // RELACIONES NÓMINA - DEPARTAMENTO
        case 'obtenerDepartamentosPorNomina':
            obtenerDepartamentosPorNomina();
            break;
        case 'registrarNominaDepartamento':
            registrarNominaDepartamento();
            break;
        case 'eliminarNominaDepartamento':
            eliminarNominaDepartamento();
            break;

        case 'obtenerAreas':
            obtenerAreas();
            break;
        case 'obtenerDepartamentosPorArea':
            obtenerDepartamentosPorArea();
            break;

        default:
            echo "Acción no reconocida";
    }
} else {
    echo "No se especificó ninguna acción";
}

// ==========================================
// MÓDULO: NOMBRES DE NÓMINA
// ==========================================

function obtenerNominas()
{
    global $conexion;
    $sql = "SELECT n.id_nomina, n.nombre_nomina, n.id_area, a.nombre_area 
            FROM nombre_nominas n
            INNER JOIN areas a ON n.id_area = a.id_area 
            ORDER BY n.nombre_nomina ASC";
    $result = mysqli_query($conexion, $sql);
    $data = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
    }
    echo json_encode($data);
}


function actualizarNomina()
{
    global $conexion;
    if (isset($_POST['nomina_id']) && isset($_POST['nombre_nomina']) && isset($_POST['id_area'])) {
        $idNomina = (int) $_POST['nomina_id'];
        $nombreNomina = trim($_POST['nombre_nomina']);
        $idArea = (int) $_POST['id_area'];
        if (empty($nombreNomina) || empty($idArea)) {
            echo "0";
            return;
        }

        $sqlCheck = $conexion->prepare("SELECT COUNT(*) as c FROM nombre_nominas WHERE nombre_nomina = ? AND id_nomina != ?");
        $sqlCheck->bind_param("si", $nombreNomina, $idNomina);
        $sqlCheck->execute();
        $res = $sqlCheck->get_result()->fetch_assoc();
        if ($res['c'] > 0) {
            echo "3";
            return;
        }

        // Obtener el área actual para comparar
        $sqlCurrArea = $conexion->prepare("SELECT id_area FROM nombre_nominas WHERE id_nomina = ?");
        $sqlCurrArea->bind_param("i", $idNomina);
        $sqlCurrArea->execute();
        $currAreaRes = $sqlCurrArea->get_result()->fetch_assoc();
        $oldIdArea = $currAreaRes['id_area'];

        $conexion->begin_transaction();
        try {
            $sql = $conexion->prepare("UPDATE nombre_nominas SET nombre_nomina = ?, id_area = ? WHERE id_nomina = ?");
            $sql->bind_param("sii", $nombreNomina, $idArea, $idNomina);
            $sql->execute();

            // Si el área cambió, eliminar los departamentos asignados a la nómina
            if ($oldIdArea != $idArea) { 
                $sqlDel = $conexion->prepare("DELETE FROM nomina_departamento WHERE id_nomina = ?");
                $sqlDel->bind_param("i", $idNomina);
                $sqlDel->execute();
            }

            $conexion->commit();
            echo "1";
        } catch (Exception $e) {
            $conexion->rollback();
            echo "2";
        }
    }
}

// ==========================================
// MÓDULO: RELACIÓN NÓMINA - DEPARTAMENTO
// ==========================================

function obtenerDepartamentosPorNomina()
{
    global $conexion;
    if (isset($_GET['id_nomina'])) {
        $idNomina = (int) $_GET['id_nomina'];

        $sql = $conexion->prepare("SELECT nd.id_nomina_departamento, d.nombre_departamento, nd.color_depto_nomina 
                                   FROM nomina_departamento nd
                                   INNER JOIN departamentos d ON nd.id_departamento = d.id_departamento
                                   WHERE nd.id_nomina = ?
                                   ORDER BY d.nombre_departamento ASC");
        $sql->bind_param("i", $idNomina);
        $sql->execute();
        $result = $sql->get_result();

        $data = array();
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
    } else {
        echo json_encode([]);
    }
}

function registrarNominaDepartamento()
{
    global $conexion;
    if (isset($_POST['id_nomina']) && isset($_POST['id_departamento'])) {
        $idNomina = (int) $_POST['id_nomina'];
        $idDepto = (int) $_POST['id_departamento'];
        $colorDepto = $_POST['color_depto_nomina'] ?? '#FF0000';

        $sqlCheck = $conexion->prepare("SELECT COUNT(*) as c FROM nomina_departamento WHERE id_nomina = ? AND id_departamento = ?");
        $sqlCheck->bind_param("ii", $idNomina, $idDepto);
        $sqlCheck->execute();
        $res = $sqlCheck->get_result()->fetch_assoc();
        if ($res['c'] > 0) {
            echo "3";
            return;
        }

        $sql = $conexion->prepare("INSERT INTO nomina_departamento (id_nomina, id_departamento, color_depto_nomina) VALUES (?, ?, ?)");
        $sql->bind_param("iis", $idNomina, $idDepto, $colorDepto);
        if ($sql->execute())
            echo "1";
        else
            echo "2";
    }
}

function eliminarNominaDepartamento()
{
    global $conexion;
    if (isset($_POST['id_relacion'])) {
        $idRel = (int) $_POST['id_relacion'];
        $sql = $conexion->prepare("DELETE FROM nomina_departamento WHERE id_nomina_departamento = ?");
        $sql->bind_param("i", $idRel);
        if ($sql->execute())
            echo "1";
        else
            echo "2";
    }
}

function obtenerAreas()
{
    global $conexion;
    $sql = "SELECT id_area, nombre_area FROM areas ORDER BY nombre_area ASC";
    $result = mysqli_query($conexion, $sql);
    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function obtenerDepartamentosPorArea()
{
    global $conexion;
    if (isset($_GET['id_area'])) {
        $idArea = (int) $_GET['id_area'];
        $sql = $conexion->prepare("SELECT d.id_departamento, d.nombre_departamento 
                                   FROM departamentos d
                                   INNER JOIN areas_departamentos ad ON d.id_departamento = ad.id_departamento
                                   WHERE ad.id_area = ? 
                                   ORDER BY d.nombre_departamento ASC");
        $sql->bind_param("i", $idArea);
        $sql->execute();
        $result = $sql->get_result();
        $data = array();
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
    } else {
        echo json_encode([]);
    }
}

?>