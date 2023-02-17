const ExcelJS = require('exceljs');
const moment = require('moment');
const fs = require('fs');
const { MessageMedia, Buttons, List } = require('whatsapp-web.js');
const { cleanNumber } = require('./handle')
const { remplazos } = require('../implementaciones/extraFuncs'); //MOD by CHV - Agregamos remplazos
const DELAY_TIME = 170; //ms
const DIR_MEDIA = `${__dirname}/../mediaSend`;
// import { Low, JSONFile } from 'lowdb'
// import { join } from 'path'
const { saveMessage } = require('../adapter')
const { ingresarDatos, leerDatos } = require('../implementaciones/sheets')
const mime = require('mime-types')

/**
 * Enviar imagen o multimedia
 * @param {*} number
 * @param {*} mediaInput
 * @param {*} message
 * @example await sendMessage('+XXXXXXXXXXX', 'https://dominio.com/imagen.jpg' | 'img/imagen.jpg')
 */
const sendMedia = async (client, number, fileName, text) => {
    console.log("SendMedia = ", number, fileName, text)
    // const fileDownloaded = await generalDownload(imageUrl)

    const file = `${DIR_MEDIA}/${fileName}`;
    console.log("FILE="+file);
    if (fs.existsSync(file)) {
        console.log("ARCHIVO EXISTE");
        const mimeType = mime.lookup(file)
        if (mimeType.includes('image')) return sendImage(client, number, file, text)
        if (mimeType.includes('video')) return sendVideo(client, number, file, text)
        if (mimeType.includes('audio')) return sendAudio(client, number, file, text)
        return sendFile(client, number, file)
    }
}

/**
 * Enviar imagen
 * @param {*} number
 * @param {*} imageUrl
 * @param {*} text
 * @returns
 */
const sendImage = async (client, number, filePath, text) => {
    client.sendMessage(number, {
        image: fs.readFileSync(filePath),
        caption: text,
    })
}

/**
 * Enviamos archivos como notas de voz
 * @param {*} number 
 * @param {*} fileName 
 */

 const sendMediaVoiceNote = (client, number = null, fileName = null) => {
     if(!client) return console.error("El objeto cliente no está definido.");
     try { 
        number = cleanNumber(number || 0)
        const file = `${DIR_MEDIA}/${fileName}`;
        if (fs.existsSync(file)) {
            const media = MessageMedia.fromFilePath(file);
            client.sendMessage(number, media ,{ sendAudioAsVoice: true });

        }
    }catch(e) {
        throw e;
}

}
/**
 * Enviamos un mensaje simple (texto) a nuestro cliente
 * @param {*} number 
 */
const sendMessage = async (client, number = null, text = null, trigger = null, regla) => { //MOD by CHV - Agregamos el parametro "regla" para guardarlo en "chats/numero.json"
    if(text !== undefined && text != null){
        setTimeout(async () => {
        number = cleanNumber(number)
        await client.sendMessage(number, { text: text })
        // console.log(number, message, regla)
        await readChat(number, text, trigger, regla) //MOD by CHV - Agregamos el parametro "regla"
        console.log(`⚡⚡⚡ Enviando mensajes....`);
        ingresarDatos(number, text, 'Salida', 'Bot Pruebas')
        // console.log("*********************  SEND MESSAGE  **************************************");
       },DELAY_TIME)
    }
}

/**
 * Enviamos un mensaje con buttons a nuestro cliente
 * @param {*} number 
 */
const sendMessageButton2 = async (client, number = null, text = null, actionButtons) => {
    setTimeout(async () => {
        number = cleanNumber(number)
        const { title = null, message = null, footer = null, buttons = [] } = actionButtons;
        let button = new Buttons(remplazos(message, client),[...buttons], remplazos(title, client), remplazos(footer, client));
        await readChat(number, message, actionButtons)
        client.sendMessage(number, button);
        console.log(`⚡⚡⚡ Enviando mensajes (botones)....`);
        // console.log("sendMessageButton.");
    }, DELAY_TIME)
    // console.log("************************  SEND MESSAGE BUTTON ***********************************");
}

/**
 *
 * @param {string} number
 * @param {string} text
 * @param {string} footer
 * @param {Array} buttons
 * @example await sendMessage("+XXXXXXXXXXX", "Your Text", "Your Footer", [{"buttonId": "id", "buttonText": {"displayText": "Button"}, "type": 1}])
 */
const sendMessageButton = async (client, number, text = null, actionButtons) => {
    number = cleanNumber(number)
    const { title = null, message = null, footer = null, buttons = [] } = actionButtons;
    const templateButtons = buttons.map((btn, i) => ({
        buttonId: `id-btn-${i}`,
        buttonText: { displayText: btn.body },
        type: 1,
    }))
    text = remplazos(`*${title}*\n${message}`, client)
    await readChat(number, message, actionButtons)
    // console.log("sendMessageButton:", text, templateButtons)
    const buttonMessage = { text, footer, buttons: templateButtons, headerType: 1 }
    return client.sendMessage(number, buttonMessage)
}

/**
 * Enviamos listas (con el formato de response.json)
 * @param {*} number
 */
const sendMessageList = async (client, number = null, text = null, actionList) => {
    console.log("****************   baileys send")
    setTimeout(async () => {
        // console.log("**********************   client   **************************")
        number = cleanNumber(number)
        const { body = null, buttonText = null, sections = [], title = null, footer = null } = actionList;
        const theList = {
            text: remplazos(body, client),
            footer: remplazos(footer, client),
            title: remplazos(title, client),
            buttonText: remplazos(buttonText, client),
            sections
          }
        console.log(theList)
        // console.log(sections[0])
        client.sendMessage(number, theList);
        await readChat(number, body, actionList)
        console.log('⚡⚡⚡ Enviando lista a '+number+' ....');
    }, DELAY_TIME)
}

/**
 * Opte
 */
const lastTrigger = (number) => new Promise((resolve, reject) => {
    number = cleanNumber(number)
    const pathExcel = `${__dirname}/../chats/${number}.xlsx`;
    const workbook = new ExcelJS.Workbook();
    if (fs.existsSync(pathExcel)) {
        workbook.xlsx.readFile(pathExcel)
            .then(() => {
                const worksheet = workbook.getWorksheet(1);
                const lastRow = worksheet.lastRow;
                const getRowPrevStep = worksheet.getRow(lastRow.number);
                const lastStep = getRowPrevStep.getCell('C').value;
                resolve(lastStep)
            });
    } else {
        resolve(null)
    }
})

/**
 * Guardar historial de conversacion
 * @param {*} number 
 * @param {*} message 
 */
const readChat = async (number, message, trigger = null, regla) => { //MOD by CHV - Agregamos el parametro "regla" para guardarlo en "chats/numero.json"
    number = cleanNumber(number)
    await saveMessage( message, trigger, number, regla ) //MOD by CHV - Agregamos "regla"
    // console.log('Saved')
}

module.exports = { sendMessage, sendMedia, lastTrigger, sendMessageButton, sendMessageList, readChat, sendMediaVoiceNote }
