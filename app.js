/**
 * ⚡⚡⚡ DECLARAMOS LAS LIBRERIAS y CONSTANTES A USAR! ⚡⚡⚡
 */
require('dotenv').config()
global.provider = process.env.PROVIDER || 'wwebjs';
const fs = require('fs');
global.siguientePaso = [{"numero":"1", "va":"XXX"}]; //MOD by CHV - Agregamos para pasar el VAMOSA a "index.js"
global.pasoAnterior = [];
global.socketioStatus = ""
global.vars = []
// const mysqlConnection = require('./config/mysql')
if( provider == 'baileys' ){ const { initBot } = require(`./provider/baileys`) }
else { const { initBot } = require(`./provider/wwebjs`) }
const { isValidNumber } = require('./controllers/handle')
const { saveMedia, saveMediaToGoogleDrive } = require('./controllers/save')
const { getMessages, responseMessages, bothResponse, waitFor } = require('./controllers/flows')
const { sendMedia, sendMessage, sendMessageButton, sendMessageList, readChat } = require(`./controllers/send`);
const { stepsInitial, vamosA, traeUltimaVisita } = require('./adapter/index');//MOD by CHV - Agregamos para utilizar remplazos y stepsInitial
const { removeDiacritics, getRandomInt, remplazos, soloNumero, agregaVars, traeVariablesFromMsg, traeVariablesFromClient } = require('./implementaciones/extraFuncs')
const appFuncs = require('./implementaciones/appFuncs')
// const { guardaXLSDatos, leeXLSDatos} = require('./Excel');
// const { ingresarDatos, leerDatos } = require('./implementaciones/sheets')
const MULTI_DEVICE = process.env.MULTI_DEVICE || 'true';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve,ms))
let client
let client0
var dialogflowFilter = false;
var newBody; //MOD by CHV - 
var nuevaRespuesta; //MOD by CHV - Se agrego para los remplazos
let blackList = ['346XXXX6038', '3467XXXX819', '34660XXXX89', '3464XXXX761','3463XXXX553','3464XXXX637','3463XXXX646','1417XXXX313']

// ############################################################################################################
// ##########################   AQUI SE DECLARAN LAS FUNCIONES PERSONALIZADAS DESDE   #########################
// ########################   EL ARCHIVO APPFUNCS.JS EN EL DIRECTORIO IMPLEMENTACIONES   ######################
// ############################################################################################################

const arrayOfAppFuncs = Object.entries(appFuncs);
for(thisF = 0; thisF < arrayOfAppFuncs.length; thisF++){
    // console.log(arrayOfAppFuncs[thisF][0], "|", arrayOfAppFuncs[thisF][1])
    global[arrayOfAppFuncs[thisF][0]] = arrayOfAppFuncs[thisF][1]
}

/**
 * Escuchamos cuando entra un mensaje.
*/
function listenMessage(client){
    if(provider == 'wwebjs'){ client0 = client; messageEV = 'message' } // Usamos WWebJS.
    else { client0 = client.ev; messageEV = 'messages.upsert' } // Usamos Baileys.
    client0.on(messageEV, async msg => {
        if(provider == 'wwebjs'){ msg.type = 'notify' }
        const { from, body, name, hasMedia } = traeVariablesFromMsg(msg);
        if (vars[from] === undefined) vars[from] = []
        // Este bug lo reporto Lucas Aldeco Brescia para evitar que se publiquen estados.
        if (from === 'status@broadcast' || msg.type !== 'notify') { console.log("++++++  status@broadcast o tipo mensaje = ", msg.type); return }
        console.log("+++++++++++++++++++++++++++++++++++++  INICIO  +++++++++++++++++++++++++++++++++++++++");
        console.log("HORA:"+new Date().toLocaleTimeString()+" FROM:"+from+", BODY:"+body+", HASMEDIA:"+hasMedia+", DEVICETYPE:"+client.theMsg?.deviceType);
        // * Numero NO válido.
        if(!isValidNumber(from)){ console.log("Número invalido"); return }
        const number = soloNumero(from)
        newBody = removeDiacritics(body) //MOD by CHV - Agregamos para quitar acentos
        message = newBody.toLowerCase();
        // * Blacklist, los telefonos incluidos en este arreglo son ignorados por el bot.
        if (blackList.includes(number)){ console.log('BlackListed'); return }
        var { key } = stepsInitial.find(k => k.keywords.includes(message)) || { key: null }//MOD by CHV - Se agrega para obtener KEY
        await readChat(number, message, key) //MOD by CHV - Agregamos key/regla para guardarla en "chats/numero.json"
        client = agregaVars(client, msg, traeVariablesFromMsg(msg))
        client.theMsg['key'] = key
        // console.log(client)


        if (body == '/bt') {
            // send a buttons message with image header!
            const buttons = [
                { buttonId: 'id1', buttonText: { displayText: 'Button 1' }, type: 1 },
                { buttonId: 'id2', buttonText: { displayText: 'Button 2' }, type: 1 },
                { buttonId: 'id3', buttonText: { displayText: 'Button 3' }, type: 1 }
            ]

            const buttonMessage = {
                image: { url: 'https://media2.giphy.com/media/VQJu0IeULuAmCwf5SL/giphy.gif' },
                caption: "Hi it's button message",
                footer: 'Hello World',
                buttons: buttons,
                headerType: 4
            }
            const sendMsg = await client.sendMessage(from, buttonMessage)

        }

        /**
         * Si el mensaje trae un archivo multimedia, aquí lo guardamos.
        */
        if (process.env.SAVE_MEDIA === 'true' && hasMedia) { const media = await msg.downloadMedia(); saveMedia(media); }
        
        // Guardamos los mensajes  entrantes en una hoja de Google Sheets
        // ingresarDatos(from, body, 'Entrada', 'Bot Pruebas')

        /**
         * Si estas usando dialogflow solo manejamos una funcion todo es IA
         */
        if (process.env.DATABASE === 'dialogflow') {
            if (process.env.DIALOGFLOW_MEDIA_FOR_SLOT_FILLING === 'true' && dialogflowFilter) {
                waitFor(_ => hasMedia, 30000)
                    .then(async _ => {
                        if (hasMedia) {
                            const media = await msg.downloadMedia();
                            message = await saveMediaToGoogleDrive(media);
                            const response = await bothResponse(message.substring(256, -1), number);
                            await sendMessage(client, from, response.replyMessage);
                        }
                        return
                    });
                dialogflowFilter = false;
            }
            if (!message.length) return;
            const response = await bothResponse(message.substring(256, -1), number);
            await sendMessage(client, from, response.replyMessage);
            if (response.actions) {
                await sendMessageButton(client, from, null, response.actions);
                return
            }
            if (response.media) {
                sendMedia(client, from, response.media);
            }
            return
        }

        /**
         * Si el texto del mensaje dispara alguna regla, entramos a esta condición.
        */
        const step = await getMessages(message, from);
        client.theMsg['step'] = step
        if (step) {
            // console.log("Entramos a STEP")
            const response = await responseMessages(step);
            client.theMsg['trigger'] = response.trigger
            var resps = require('./flow/response.json');
            nuevaRespuesta = remplazos(resps[step].replyMessage.join(''), client);
            client.theMsg['replyMessage'] = nuevaRespuesta

            // ####################################################################################################################
            // ##############################    INICIAN FUNCIONES PARA MANEJO DE PARAMETROS  #####################################
            // ##############################               EN EL RESPONSE.JSON               #####################################
            // ####################################################################################################################
            /*
            *   Si quieres ejecutar una función.
            */
            if(response.hasOwnProperty('funcion')){
                console.log("#############    Encontramos función, ejecutamos la función '" + response.funcion + "'")
                laFuncion = response.funcion + "(client)"
                eval(laFuncion)
            }
            /**
             * Si quieres enviar imagen.
            */
            if (!response.delay && response.media) {
                // console.log("++++++++++++++++++++++++++++  SEND MEDIA NO DELAY  +++++++++++++++++++++++++++++++++++");
                await sendMedia(client, from, response.media);
                console.log("Enviamos imagen")
                await delay(500)
            }
            /**
             * Si quieres enviar imagen con retraso.
            */
            if (response.delay && response.media) {
                setTimeout(() => {
                    // console.log("++++++++++++++++++++++++++++  SEND MEDIA AND DELAY  +++++++++++++++++++++++++++++++++++");
                    sendMedia(client, from, response.media);
                }, response.delay)
            }
            /**
             * Si quieres enviar mensaje con retraso.
            */
            if (response.delay){
                // await sendMessage(client, from, nuevaRespuesta, response.trigger, step); // Mod by CHV - Para mandar varios mensajes en el mismo response, se cambio esta linea por el forEach de abajo.
                setTimeout(() => {
                    response.replyMessage.forEach( async messages => {
                        var thisMsg = messages.mensaje
                        if(Array.isArray(messages.mensaje)){thisMsg = messages.mensaje.join('\n')}
                        await sendMessage(client, from, remplazos(thisMsg, client), step);
                    })
                }, response.delay)
                await delay(500)
            }
            else
            /**
             * Si quieres enviar un mensaje.
            */
            {   // await sendMessage(client, from, nuevaRespuesta, response.trigger, step); // Mod by CHV - Para mandar varios mensajes en el mismo response, se cambio esta linea por el forEach de abajo.
                response.replyMessage.forEach( async messages => {
                    var thisMsg = messages.mensaje
                    if(Array.isArray(messages.mensaje)){thisMsg = messages.mensaje.join('\n')}
                    // console.log("Mensaje=", thisMsg)
                    if(thisMsg !== undefined) await sendMessage(client, from, remplazos(thisMsg, client), step);
                })
                await delay(500)
            }
            /**
             * Si quieres enviar botones o listas
            */
            if(response.hasOwnProperty('actions')){
                const { actions } = response;
                // console.log("++++++++++++++++++++++++++++  SEND MESG BUTTON/LIST  +++++++++++++++++++++++++++++++++++");
                if(actions['sections'] === undefined){ //Botones
                    console.log("Botones")
                    await sendMessageButton(client, from, null, actions);
                }
                else { //Listas
                    console.log("Listas")
                    await sendMessageList(client, from, null, actions);
                }
            }
            return
        }
        /**
         * Si quieres tener un mensaje por defecto
         */
        if (process.env.DEFAULT_MESSAGE === 'true') {
            const response = await responseMessages('DEFAULT')
            // await sendMessage(client, from, response.replyMessage, response.trigger); // Mod by CHV - Para mandar varios mensajes en el mismo response, se cambio esta linea por el forEach de abajo.
            response.replyMessage.forEach( async messages => {
                var thisMsg = messages.mensaje
                if(Array.isArray(messages.mensaje)){thisMsg = messages.mensaje.join('\n')}
                await sendMessage(client, from, remplazos(thisMsg, client), step);
            })

            /**
             * Si quieres enviar botones
             */
            if(response.hasOwnProperty('actions')){
                const { actions } = response;
                if(actions['sections'] === undefined){ //Botones
                    console.log("Botones")
                    await sendMessageButton(client, from, null, actions);
                }
                else{ //Listas
                    console.log("Listas")
                    await sendMessageList(client, from, null, actions);
                }
            }
            return
        }
    });
}

/**
 * Este evento es necesario para el filtro de Dialogflow
 */
function listenMessageFromBot(client0){
    if(provider == 'wwebjs') {client = client0} else {client = client0.ev}
    client.on('message_create', async botMsg => {
// const listenMessageFromBot = () => client.on('message_create', async botMsg => {
        const { body } = botMsg;
        const dialogflowFilterConfig = fs.readFileSync('./flow/dialogflow.json', 'utf8');
        const keywords = JSON.parse(dialogflowFilterConfig);

        for (i = 0; i < keywords.length; i++) {
            key = keywords[i];
            for (var j = 0; j < key.phrases.length; j++) {
                let filters = key.phrases[j];
                if (body.includes(filters)) {
                    dialogflowFilter = true;
                    //console.log(`El filtro de Dialogflow coincidió con el mensaje: ${filters}`);
                }
            }
        }
    });
}

// ####################################################################################################################
// ##############################  INICIAN FUNCIONES PARA LA CREACION DEL CLIENTE  ####################################
// ##############################                 DE WHATSAPP-WEB.JS               ####################################
// ####################################################################################################################
async function inicializaBot(){
    const ib = await initBot()
    listenMessage(ib)
    // listenMessageFromBot(ib)
 }
 inicializaBot()
