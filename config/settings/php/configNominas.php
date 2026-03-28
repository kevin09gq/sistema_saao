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
        case 'registrarNomina':
            registrarNomina();
            break;
        case 'actualizarNomina':
            actualizarNomina();
            break;
        case 'eliminarNomina':
            eliminarNomina();
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

        // ROLES LABORALES
        case 'obtenerRolesLaborales':
            obtenerRolesLaborales();
            break;
        case 'registrarRolLaboral':
            registrarRolLaboral();
            break;
        case 'eliminarRolLaboral':
            eliminarRolLaboral();
            break;

        // MAPEO ROL - PUESTO - NÓMINA
        case 'obtenerConfiguracionRolesPuesto':
            obtenerConfiguracionRolesPuesto();
            break;
        case 'registrarRelacionRolPuesto':
            registrarRelacionRolPuesto();
            break;
        case 'eliminarRelacionRolPuesto':
            eliminarRelacionRolPuesto();
            break;

        case 'obtenerDepartamentos':
            obtenerDepartamentos();
            break;
            
        case 'obtenerSoloPuestos':
            obtenerSoloPuestos();
            break;

        case 'obtenerPuestosPorNominaDepartamentos':
            obtenerPuestosPorNominaDepartamentos();
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

function obtenerNominas() {
    global $conexion;
    $sql = "SELECT id_nomina, nombre_nomina FROM nombre_nominas ORDER BY nombre_nomina ASC";
    $result = mysqli_query($conexion, $sql);
    $data = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
    }
    echo json_encode($data);
}

function registrarNomina() {
    global $conexion;
    if (isset($_POST['nombre_nomina'])) {
        $nombreNomina = trim($_POST['nombre_nomina']);
        if (empty($nombreNomina)) { echo "0"; return; }
        
        $sqlCheck = $conexion->prepare("SELECT COUNT(*) as c FROM nombre_nominas WHERE nombre_nomina = ?");
        $sqlCheck->bind_param("s", $nombreNomina);
        $sqlCheck->execute();
        $res = $sqlCheck->get_result()->fetch_assoc();
        if ($res['c'] > 0) { echo "3"; return; }

        $sql = $conexion->prepare("INSERT INTO nombre_nominas (nombre_nomina) VALUES (?)");
        $sql->bind_param("s", $nombreNomina);
        if ($sql->execute()) echo "1"; else echo "2";
    }
}

function actualizarNomina() {
    global $conexion;
    if (isset($_POST['nomina_id']) && isset($_POST['nombre_nomina'])) {
        $idNomina = (int)$_POST['nomina_id'];
        $nombreNomina = trim($_POST['nombre_nomina']);
        if (empty($nombreNomina)) { echo "0"; return; }

        $sqlCheck = $conexion->prepare("SELECT COUNT(*) as c FROM nombre_nominas WHERE nombre_nomina = ? AND id_nomina != ?");
        $sqlCheck->bind_param("si", $nombreNomina, $idNomina);
        $sqlCheck->execute();
        $res = $sqlCheck->get_result()->fetch_assoc();
        if ($res['c'] > 0) { echo "3"; return; }

        $sql = $conexion->prepare("UPDATE nombre_nominas SET nombre_nomina = ? WHERE id_nomina = ?");
        $sql->bind_param("si", $nombreNomina, $idNomina);
        if ($sql->execute()) echo "1"; else echo "2";
    }
}

function eliminarNomina() {
    global $conexion;
    if (isset($_POST['id_nomina'])) {
        $idNomina = (int)$_POST['id_nomina'];
        $sql = $conexion->prepare("DELETE FROM nombre_nominas WHERE id_nomina = ?");
        $sql->bind_param("i", $idNomina);
        if ($sql->execute()) echo "1"; else echo "2";
    }
}

// ==========================================
// MÓDULO: RELACIÓN NÓMINA - DEPARTAMENTO
// ==========================================

function obtenerDepartamentosPorNomina() {
    global $conexion;
    if(isset($_GET['id_nomina'])) {
        $idNomina = (int)$_GET['id_nomina'];

        $sql = $conexion->prepare("SELECT nd.id_nomina_departamento, d.nombre_departamento 
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

function registrarNominaDepartamento() {
    global $conexion;
    if (isset($_POST['id_nomina']) && isset($_POST['id_departamento'])) {
        $idNomina = (int)$_POST['id_nomina'];
        $idDepto = (int)$_POST['id_departamento'];

        $sqlCheck = $conexion->prepare("SELECT COUNT(*) as c FROM nomina_departamento WHERE id_nomina = ? AND id_departamento = ?");
        $sqlCheck->bind_param("ii", $idNomina, $idDepto);
        $sqlCheck->execute();
        $res = $sqlCheck->get_result()->fetch_assoc();
        if ($res['c'] > 0) { echo "3"; return; }

        $sql = $conexion->prepare("INSERT INTO nomina_departamento (id_nomina, id_departamento) VALUES (?, ?)");
        $sql->bind_param("ii", $idNomina, $idDepto);
        if ($sql->execute()) echo "1"; else echo "2";
    }
}

function eliminarNominaDepartamento() {
    global $conexion;
    if (isset($_POST['id_relacion'])) {
        $idRel = (int)$_POST['id_relacion'];
        $sql = $conexion->prepare("DELETE FROM nomina_departamento WHERE id_nomina_departamento = ?");
        $sql->bind_param("i", $idRel);
        if ($sql->execute()) echo "1"; else echo "2";
    }
}

function obtenerDepartamentos() {
    global $conexion;
    $sql = "SELECT id_departamento, nombre_departamento FROM departamentos ORDER BY nombre_departamento ASC";
    $result = mysqli_query($conexion, $sql);
    $data = array();
    if($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
    }
    echo json_encode($data);
}

// ==========================================
// MÓDULO: ROLES LABORALES
// ==========================================

function obtenerRolesLaborales() {
    global $conexion;
    $sql = "SELECT id_rol_laboral, nombre_rol FROM rol_laboral ORDER BY nombre_rol ASC";
    $result = mysqli_query($conexion, $sql);
    $data = array();
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
    }
    echo json_encode($data);
}

function registrarRolLaboral() {
    global $conexion;
    if (isset($_POST['nombre_rol'])) {
        $nombreRol = trim($_POST['nombre_rol']);
        if (empty($nombreRol)) { echo "0"; return; }

        $sqlCheck = $conexion->prepare("SELECT COUNT(*) as c FROM rol_laboral WHERE nombre_rol = ?");
        $sqlCheck->bind_param("s", $nombreRol);
        $sqlCheck->execute();
        $res = $sqlCheck->get_result()->fetch_assoc();
        if ($res['c'] > 0) { echo "3"; return; }

        $sql = $conexion->prepare("INSERT INTO rol_laboral (nombre_rol) VALUES (?)");
        $sql->bind_param("s", $nombreRol);
        if ($sql->execute()) echo "1"; else echo "2";
    }
}

function eliminarRolLaboral() {
    global $conexion;
    if (isset($_POST['id_rol_laboral'])) {
        $idRol = (int)$_POST['id_rol_laboral'];
        $sql = $conexion->prepare("DELETE FROM rol_laboral WHERE id_rol_laboral = ?");
        $sql->bind_param("i", $idRol);
        if ($sql->execute()) echo "1"; else echo "2";
    }
}

// ==========================================
// MÓDULO: MAPEO ROL - PUESTO - NÓMINA
// ==========================================

function obtenerConfiguracionRolesPuesto() {
    global $conexion;
    if (isset($_GET['id_nomina'])) {
        $idNomina = (int)$_GET['id_nomina'];

        $sql = $conexion->prepare("SELECT rlp.id_rol_laboral, rlp.id_puestoEspecial, rl.nombre_rol, pe.nombre_puesto
                                   FROM rol_laboral_puesto rlp
                                   INNER JOIN rol_laboral rl ON rlp.id_rol_laboral = rl.id_rol_laboral
                                   INNER JOIN puestos_especiales pe ON rlp.id_puestoEspecial = pe.id_puestoEspecial
                                   WHERE rlp.id_nomina = ?
                                   ORDER BY pe.nombre_puesto ASC");
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

function registrarRelacionRolPuesto() {
    global $conexion;
    if (isset($_POST['id_nomina']) && isset($_POST['id_puesto']) && isset($_POST['id_rol'])) {
        $idNomina = (int)$_POST['id_nomina'];
        $idPuesto = (int)$_POST['id_puesto'];
        $idRol = (int)$_POST['id_rol'];

        $sqlCheck = $conexion->prepare("SELECT COUNT(*) as c FROM rol_laboral_puesto WHERE id_nomina = ? AND id_puestoEspecial = ?");
        $sqlCheck->bind_param("ii", $idNomina, $idPuesto);
        $sqlCheck->execute();
        $res = $sqlCheck->get_result()->fetch_assoc();
        if ($res['c'] > 0) { echo "3"; return; }

        $sql = $conexion->prepare("INSERT INTO rol_laboral_puesto (id_rol_laboral, id_puestoEspecial, id_nomina) VALUES (?, ?, ?)");
        $sql->bind_param("iii", $idRol, $idPuesto, $idNomina);
        if ($sql->execute()) echo "1"; else echo "2";
    }
}

function eliminarRelacionRolPuesto() {
    global $conexion;
    if (isset($_POST['id_nomina']) && isset($_POST['id_puesto']) && isset($_POST['id_rol'])) {
        $idNomina = (int)$_POST['id_nomina'];
        $idPuesto = (int)$_POST['id_puesto'];
        $idRol = (int)$_POST['id_rol'];

        $sql = $conexion->prepare("DELETE FROM rol_laboral_puesto WHERE id_rol_laboral = ? AND id_puestoEspecial = ? AND id_nomina = ?");
        $sql->bind_param("iii", $idRol, $idPuesto, $idNomina);
        if ($sql->execute()) echo "1"; else echo "2";
    }
}

function obtenerSoloPuestos() {
    global $conexion;
    $sql = "SELECT id_puestoEspecial, nombre_puesto FROM puestos_especiales ORDER BY nombre_puesto ASC";
    $result = mysqli_query($conexion, $sql);
    $data = array();
    if($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
    }
    echo json_encode($data);
}

function obtenerPuestosPorNominaDepartamentos() {
    global $conexion;
    if (isset($_GET['id_nomina'])) {
        $idNomina = (int)$_GET['id_nomina'];

        // Query: Puestos que pertenecen a los departamentos asignados a esta nómina
        // EXCLUYENDO los que ya tienen un rol asignado en esta nómina
        $sql = $conexion->prepare("SELECT DISTINCT pe.id_puestoEspecial, pe.nombre_puesto 
                                   FROM puestos_especiales pe
                                   INNER JOIN departamentos_puestos dp ON pe.id_puestoEspecial = dp.id_puestoEspecial
                                   INNER JOIN nomina_departamento nd ON dp.id_departamento = nd.id_departamento
                                   WHERE nd.id_nomina = ? 
                                   AND pe.id_puestoEspecial NOT IN (
                                       SELECT id_puestoEspecial FROM rol_laboral_puesto WHERE id_nomina = ?
                                   )
                                   ORDER BY pe.nombre_puesto ASC");
        
        $sql->bind_param("ii", $idNomina, $idNomina);
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

function obtenerAreas() {
    global $conexion;
    $sql = "SELECT id_area, nombre_area FROM areas ORDER BY nombre_area ASC";
    $result = mysqli_query($conexion, $sql);
    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function obtenerDepartamentosPorArea() {
    global $conexion;
    if (isset($_GET['id_area'])) {
        $idArea = (int)$_GET['id_area'];
        $sql = $conexion->prepare("SELECT id_departamento, nombre_departamento FROM departamentos WHERE id_area = ? ORDER BY nombre_departamento ASC");
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
