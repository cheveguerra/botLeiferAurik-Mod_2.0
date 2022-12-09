
const ExcelJS = require('exceljs');
const moment = require('moment');
const fs = require('fs');
const { MessageMedia, Buttons } = require('whatsapp-web.js');
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
const sendMessage = async (client, number = null, text = null, trigger = null, regla) => { //MOD by CHV - Agregamos el parametro "regla" para guardarlo en "chats/nuero.json"
    // console.log("SENDMESSAGE (send.js) & regla = " + regla)
    setTimeout(async () => {
    number = cleanNumber(number)
    const message = text
    // console.log("number="+number);
    client.sendMessage(number, message);
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
    number = cleanNumber(number)
    const { title = null, message = null, footer = null, buttons = [] } = actionButtons;
    let button = new Buttons(remplazos(message),[...buttons], title, footer);
    // console.log("number="+number);
    client.sendMessage(number, button);

    console.log(`⚡⚡⚡ Enviando mensajes....`);
    console.log("sendMessageButton.");
    // console.log("Trigger="+trigger);
    // console.log("************************  SEND MESSAGE BUTTON ***********************************");
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

module.exports = { sendMessage, sendMedia, lastTrigger, sendMessageButton, readChat, sendMediaVoiceNote }
