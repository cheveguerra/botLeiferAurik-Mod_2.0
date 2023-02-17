/**
 * ⚡⚡⚡ DECLARAMOS LAS LIBRERIAS y CONSTANTES A USAR! ⚡⚡⚡
 */
require('dotenv').config()
global.provider = process.env.PROVIDER || 'wwebjs';
const { Client } = require('whatsapp-web.js');
const { generateImage, cleanNumber, checkEnvFile, createClient, isValidNumber } = require('./controllers/handle')
const { initBot, traeVariables } = require('./provider/baileys')
const { sendMedia, sendMessage, lastTrigger, sendMessageButton, sendMessageList, readChat } = require('./controllers/send_baileys');
let enviado = false

function listenMessage(client){
    client.ev.on('messages.upsert', async msg => {
        let {from, body, nombre} = traeVariables(msg)
        if (from === 'status@broadcast' || msg.type !== 'notify') { return }
        client.theMsg = msg;
        console.log("#########################      INICIO      ############################")
        console.log("from, Body y Nombre = ", "|", from, "|", body, "|", nombre, "|", msg?.type)
        console.log("CLIENT:", client)
        // console.log('KEY=', msg.messages.key)
        // console.log('MESSAGES=', msg.messages)
        console.log('MESSAGE__=', msg.messages[0])
        // await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'hola como estas' })
        if(!enviado) {
            console.log("##########   Enviamos mensaje")
            sendMessage(client, "5215554192439@s.whatsapp.net", "hola")

            const buttonMessage = [
                {"body":"boton 1"},
                {"body":"boton 2"}
                ]
              
              console.log("Enviamos botones = ", from, buttonMessage)
              sendMessageButton(client, "5215554192439@s.whatsapp.net", "texto", buttonMessage)


            enviado = true
        }

    })
    enviado = false
}

async function inicializaBot(){
   const ib = await initBot()
   listenMessage(ib)
}
inicializaBot()