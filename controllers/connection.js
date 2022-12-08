const connectionReady = (cb = () =>{}) => {
    console.log('Listo para escuchar mensajes')
    console.log('El cliente esta listo!');
    console.log('🔴 Escribe: /hola');
    cb()
}

const connectionLost = (cb = () =>{}) => {
    console.log('** Error de autentificacion vuelve a generar el QRCODE (Borrar el archivo session.json) **');
    cb()
}


module.exports = {connectionReady, connectionLost}