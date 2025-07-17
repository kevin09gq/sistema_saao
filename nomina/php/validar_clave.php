<?php
include "../../conexion/conexion.php";

if(isset($_POST['clave'])) {
    $clave = (int)$_POST['clave'];

    
    $sql = $conexion->prepare("SELECT COUNT(*) FROM info_empleados WHERE clave_empleado = ?");
    $sql->bind_param("i", $clave);
    $sql->execute();
    $sql->bind_result($count);
    $sql->fetch();
    $sql->close();
    if($count > 0) {
        print_r(true);
    } else {
       print_r(false);
    }

 }
   


?>