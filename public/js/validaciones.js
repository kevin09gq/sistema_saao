
//Expresiones Regulares
function validarNombre(nombre) {
    var validar = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/;
    return validar.test(nombre);
}
function validarApellido(apellido) {
    var validar = /^(?:(?:[Dd]e(?:l)?|[Dd]e\s+(?:la|los|las))\s+)?[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/;
    return validar.test(apellido);
}

function validarClave(clave) {
    var validar = /^\d+$/;
    return validar.test(clave);
}


function validarCURP(curp) {
    var validar = /^[A-Z][AEIOU][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/i;
    return validar.test(curp);
}

function validarNSS(nss) {
    var validar = /^(\d{11}|\d{10}-\d)$/;
    return validar.test(nss);
}

function validarGrupoSanguineo(grupo) {
    var validar = /^(A|B|AB|O)[+-]$/i;
    return validar.test(grupo);
}

function validarParentesco(parentesco) {
    var validar = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/;
    return validar.test(parentesco);
}

function validarCorreo(correo) {
    var validar = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return validar.test(correo);
}

function validarContraseña(contraseña) {
    var validar = /^[A-Z][0-9a-zA-Z]*[!@#$%^&*]$/;
    return validar.test(contraseña);
}

function validarTelefono(telefono) {
    const regex = /^\d{10}$/;
    return regex.test(telefono);
}


