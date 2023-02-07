
const ExcelJS = require('exceljs');
const moment = require('moment');
const fs = require('fs');
const { MessageMedia, Buttons, List } = require('whatsapp-web.js');
const { cleanNumber } = require('./handle')
const { remplazos } = require('../adapter/index'); //MOD by CHV - Agregamos remplazos
const DELAY_TIME = 170; //ms
const DIR_MEDIA = `${__dirname}/../mediaSend`;
// import { Low, JSONFile } from 'lowdb'
// import { join } from 'path'
const { saveMessage } = require('../adapter')
/**
 * Enviamos archivos multimedia a nuestro cliente
 * @param {*} number 
 * @param {*} fileName 
 */

const sendMedia = (client, number = null, fileName = null, trigger = null) => {
    if(!client) return console.error("El objeto cliente no está definido.");
    console.log("MEDIA:"+fileName);
    try {
        number = cleanNumber(number || 0)
        const file = `${DIR_MEDIA}/${fileName}`;
        console.log("FILE="+file);
        if (fs.existsSync(file)) {
            console.log("ARCHIVO EXISTE");
            const media = MessageMedia.fromFilePath(file);
            client.sendMessage(number, media, { sendAudioAsVoice: true });
        }
    } catch(e) {
        throw e;
    }
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
    setTimeout(async () => {
    number = cleanNumber(number)
    const message = text
    client.sendMessage(number, message);
    // console.log(number, message, regla)
    await readChat(number, message, trigger, regla) //MOD by CHV - Agregamos el parametro "regla"
    console.log(`⚡⚡⚡ Enviando mensajes....`);
    // console.log("*********************  SEND MESSAGE  **************************************");
   },DELAY_TIME)
}

/**
 * Enviamos un mensaje con buttons a nuestro cliente
 * @param {*} number 
 */
const sendMessageButton = async (client, number = null, text = null, actionButtons) => {
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
 * Enviamos listas (con el formato de response.json)
 * @param {*} number
 */
const sendMessageList = async (client, number = null, text = null, actionList) => {
    setTimeout(async () => {
        // console.log("**********************   client   **************************")
        // console.log(client)
        number = cleanNumber(number)
        const { body = null, buttonText = null, sections = [], title = null, footer = null } = actionList;
        let aList = new List( remplazos(body, client),remplazos(buttonText, client),[...sections],remplazos(title, client),remplazos(footer, client));
        client.sendMessage(number, aList);
        await readChat(number, message, actionList)
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
