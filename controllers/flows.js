const { get, reply, getIA } = require('../adapter')
const { saveExternalFile, checkIsUrl } = require('./handle')

/**
 * Regresa la regla que se cumple con el texto el mensaje.
 * @param {*} message 
 * @param {*} num 
 * @returns 
 */
const getMessages = async (message, num) => { //MOD by CHV - Agregamos el parametro "num" para recibir el numero desde "app.js"
    // console.log("GETMESSAGES (flow.js)")
    const data = await get(message, num) //MOD by CHV - Agregamos "num"
    return data
}

const responseMessages = async (step) => {
    const data = await reply(step)
    if( data && data.media ){
        const file = checkIsUrl(data.media) ? await saveExternalFile(data.media) : data.media;
        return { ...data, ...{media:file}}
    }
    return data
}

const bothResponse = async (message) => {
    const data = await getIA(message)
    if(data && data.media){
        const file = await saveExternalFile(data.media)
        return {...data,...{media:file}}
    }
    return data
}

const waitFor = (conditionFunction, WAIT_TIME) => {
    const poll = resolve => {
        if (conditionFunction())
            resolve();
        else setTimeout(_ => poll(resolve), WAIT_TIME);
    }
    return new Promise(poll);
}

module.exports = { getMessages, responseMessages, bothResponse, waitFor }