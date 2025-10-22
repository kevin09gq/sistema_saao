<?php
session_start();

// Configuración de la base de datos
$db_host = 'localhost';
$db_user = 'root';
$db_pass = 'cuates2003';
$db_name = 'sistema_nomina';

// Configuración de tiempo de ejecución y memoria
set_time_limit(300); // 5 minutos
ini_set('memory_limit', '512M');

// Verificar si se envió el formulario
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../views/configuracion.php');
    exit;
}

// Verificar si se subió un archivo
if (!isset($_FILES['archivo_bd']) || $_FILES['archivo_bd']['error'] !== UPLOAD_ERR_OK) {
    echo "<script>
        alert('No se ha seleccionado ningún archivo o hubo un error al subirlo.');
        window.location.href = '../views/configuracion.php';
    </script>";
    exit;
}

// Verificar que sea un archivo SQL
$file_extension = strtolower(pathinfo($_FILES['archivo_bd']['name'], PATHINFO_EXTENSION));
if ($file_extension !== 'sql') {
    echo "<script>
        alert('El archivo debe ser de tipo .sql');
        window.location.href = '../views/configuracion.php';
    </script>";
    exit;
}

// Leer el contenido del archivo
$sql_file = $_FILES['archivo_bd']['tmp_name'];
$sql_content = file_get_contents($sql_file);

if ($sql_content === false || empty($sql_content)) {
    echo "<script>
        alert('El archivo está vacío o no se pudo leer.');
        window.location.href = '../views/configuracion.php';
    </script>";
    exit;
}

// Conectar a la base de datos
$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Verificar la conexión
if ($mysqli->connect_error) {
    echo "<script>
        alert('Error de conexión: " . addslashes($mysqli->connect_error) . "');
        window.location.href = '../views/configuracion.php';
    </script>";
    exit;
}

// Configurar el charset
$mysqli->set_charset("utf8mb4");

// Desactivar autocommit para transacciones
$mysqli->autocommit(false);

try {
    // Dividir el contenido en consultas individuales
    $queries = array();
    $current_query = '';
    $lines = explode("\n", $sql_content);
    
    foreach ($lines as $line) {
        // Ignorar comentarios y líneas vacías
        $line = trim($line);
        
        if (empty($line) || 
            substr($line, 0, 2) === '--' || 
            substr($line, 0, 2) === '/*' || 
            substr($line, 0, 1) === '#') {
            continue;
        }
        
        // Agregar la línea a la consulta actual
        $current_query .= $line . ' ';
        
        // Si la línea termina con punto y coma, es el final de una consulta
        if (substr(trim($line), -1) === ';') {
            $queries[] = trim($current_query);
            $current_query = '';
        }
    }
    
    // Agregar la última consulta si existe
    if (!empty($current_query)) {
        $queries[] = trim($current_query);
    }
    
    // Ejecutar cada consulta
    $executed = 0;
    $errors = array();
    
    foreach ($queries as $query) {
        if (!empty($query)) {
            if ($mysqli->multi_query($query)) {
                do {
                    // Limpiar resultados
                    if ($result = $mysqli->store_result()) {
                        $result->free();
                    }
                } while ($mysqli->more_results() && $mysqli->next_result());
                $executed++;
            } else {
                // Solo registrar errores críticos
                if ($mysqli->errno !== 0) {
                    $errors[] = 'Error: ' . $mysqli->error;
                }
            }
        }
    }
    
    // Si hubo muchos errores, hacer rollback
    if (count($errors) > 10) {
        $mysqli->rollback();
        echo "<script>
            alert('Hubo demasiados errores al importar la base de datos. Por favor, verifica el archivo SQL.');
            window.location.href = '../views/configuracion.php';
        </script>";
    } else {
        // Confirmar la transacción
        $mysqli->commit();
        echo "<script>
            alert('✅ Base de datos importada correctamente. Consultas ejecutadas: " . $executed . "');
            window.location.href = '../views/configuracion.php';
        </script>";
    }
    
} catch (Exception $e) {
    $mysqli->rollback();
    echo "<script>
        alert('Error al importar: " . addslashes($e->getMessage()) . "');
        window.location.href = '../views/configuracion.php';
    </script>";
}

// Cerrar la conexión
$mysqli->close();
?>
