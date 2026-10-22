// CREAR VARIABLE GLOBAL RUTA RAIZ PARA USARLA EN ARCHIVOS JS
var rutaRaiz = "/sistema_saao/";

//=========================================
// FUNCIÓN PARA OBTENER LAS INICIALES DE 
// LA EMPRESA, AREAS, PUESTOS ETC
//=========================================

function obtenerIniciales(nombre) {
    // Obtener las iniciales (primera letra de cada palabra)
    return nombre
        .split(' ')
        .map(palabra => palabra.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
}

//=========================================
// FUNCIÓN PARA MOSTRAR UN MENSAJE DE ALERTA
//=========================================

function mostrarAlerta(icono, titulo, mensaje) {

    Swal.fire({
        icon: icono,
        title: titulo,
        text: mensaje,
        confirmButtonText: "Aceptar"
    });

}