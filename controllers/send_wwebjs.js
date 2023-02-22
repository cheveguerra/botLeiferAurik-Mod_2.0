const ExcelJS = require('exceljs');
const moment = require('moment');
const fs = require('fs');
const { MessageMedia, Buttons, List } = require('whatsapp-web.js');
const { cleanNumber } = require('./handle')
const { remplazos } = require('../implementaciones/extraFuncs') //MOD by CHV - Agregamos remplazos
const DELAY_TIME = 170; //ms
const DIR_MEDIA = `${__dirname}/../mediaSend`;
// import { Low, JSONFile } from 'lowdb'
// import { join } from 'path'
const { saveMessage } = require('../adapter')
// const { ingresarDatos, leerDatos } = require('../implementaciones/sheets')
const mime = require('mime-types')

/**
 * Enviar imagen o multimedia
 * @param {*} number
 * @param {*} mediaInput
 * @param {*} message
 * @param {*} caption
 * @returns
 */
const sendMedia = async (client, number, fileName, caption = null) => {
    console.log("SendMedia WWebJS = ", number, fileName, caption)
    // const fileDownloaded = await generalDownload(imageUrl)
    const file = `${DIR_MEDIA}/${fileName}`;
    console.log("FILE="+file);
    if (fs.existsSync(file)) {
        console.log("ARCHIVO EXISTE");
        const mimeType = mime.lookup(file)
        if (mimeType.includes('image')) return sendImage(client, number, file, caption)
        if (mimeType.includes('video')) return sendVideo(client, number, file, caption)
        if (mimeType.includes('audio')) return sendAudio(client, number, file, caption)
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
const sendImage = async (client, number, fileName, caption) => {
    const file = `${DIR_MEDIA}/${fileName}`;
    console.log("FILE="+file);
    if (fs.existsSync(file)) {
        console.log("ARCHIVO EXISTE");
        const media = MessageMedia.fromFilePath(file);
    }
    const base64 = fs.readFileSync(fileName, { encoding: 'base64' })
    const mimeType = mime.lookup(fileName)
    const media = new MessageMedia(mimeType, base64)
    client.sendMessage(number, media, { caption })
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
const sendMessage = async (client, number = null, text = null, regla = null) => { //MOD by CHV - Agregamos el parametro "regla" para guardarlo en "chats/numero.json"
    setTimeout(async () => {
    number = cleanNumber(number)
    const message = text
    client.sendMessage(number, message);
    // console.log(number, message, regla)
    await readChat(number, message, regla) //MOD by CHV - Agregamos el parametro "regla"
    console.log(`⚡⚡⚡ Enviando mensajes....`);
    // ingresarDatos(number, message, 'Salida', 'Bot Pruebas')
    // console.log("*********************  SEND MESSAGE  **************************************");
   },DELAY_TIME)
}

/**
 * Enviamos un mensaje con buttons a nuestro cliente
 * @param {*} number 
 */
const sendMessageButton = async (client, number, text = null, actionButtons) => {
    setTimeout(async () => {
        number = cleanNumber(number)
        const { title = null, message = null, footer = null, buttons = [] } = actionButtons;
        let button = new Buttons(
            remplazos(message, client),
            [...buttons],
            remplazos(title, client),
            remplazos(footer, client));
        console.log("sendMessageButton:", button)
        console.log(buttons)
        client.sendMessage(number, button);
        await readChat(number, message)
    }, DELAY_TIME)
    // console.log("************************  SEND MESSAGE BUTTON ***********************************");
}

/**
 * Enviamos listas (con el formato de response.json)
 * @param {*} number
 */
const sendMessageList = async (client, number = null, text = null, actionList) => {
    // console.log("***************   wwebjs send")
    setTimeout(async () => {
        // console.log("**********************   client   **************************")
        console.log(actionList)
        number = cleanNumber(number)
        const { body = null, buttonText = null, sections = [], title = null, footer = null } = actionList;
        let aList = new List( remplazos(body, client),remplazos(buttonText, client),[...sections],remplazos(title, client),remplazos(footer, client));
        client.sendMessage(number, aList);
        await readChat(number, message)
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
const readChat = async (number, message, regla = null) => { //MOD by CHV - Agregamos el parametro "regla" para guardarlo en "chats/numero.json"
    number = cleanNumber(number)
    await saveMessage( message, number, regla ) //MOD by CHV - Agregamos "regla"
    // console.log('Saved')
}

module.exports = { sendMessage, sendMedia, sendImage, lastTrigger, sendMessageButton, sendMessageList, readChat, sendMediaVoiceNote }
