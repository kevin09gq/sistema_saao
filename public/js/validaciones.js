
//Expresiones Regulares
function validarNombre(nombre) {
    const validar = /^([A-ZÁÉÍÓÚÑa-záéíóúñ]+)( [A-ZÁÉÍÓÚÑa-záéíóúñ]+)*$/;
    return validar.test(nombre);
}

function validarApellido(apellido) {
    var validar = /^(?:(?:[Dd]e(?:l)?|[Dd]e\s+(?:la|los|las))\s+)?([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)$/;
    return validar.test(apellido);
}

function validarClave(clave) {
    var validar = /^(\d+|SS\/\d{3})$/;
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
    const validar = /^([A-ZÁÉÍÓÚÑa-záéíóúñ]+)( [A-ZÁÉÍÓÚÑa-záéíóúñ]+)*$/;
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

function validarRFCfisica(rfc) {
    var validar = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/i;
    return validar.test(rfc);
}

function validarRFCmoral(rfc) {
    var validar = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/i;
    return validar.test(rfc);
}
