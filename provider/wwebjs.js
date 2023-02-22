const { Client, LocalAuth, Buttons, List } = require('whatsapp-web.js');
require('dotenv').config()
const express = require('express');
const cors = require('cors')
const qrcode = require('qrcode-terminal');
const app = express();
app.use(cors())
app.use(express.json())
const server = require('http').Server(app)
const port = process.env.PORT || 3000
const { generateImage, checkEnvFile } = require('../controllers/handle')
const { connectionReady } = require('../controllers/connection')
app.use('/', require('../routes/web'))

initBot = async () => {
    console.log("WaWebJS Init")
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] }
    });

    client.on('qr', qr => generateImage(qr, () => {
        qrcode.generate(qr, { small: true });
        console.log(`Ver QR http://localhost:${port}/qr`)
        socketEvents.sendQR(qr)
    }))

    client.on('ready', (a) => {
        connectionReady()
        // listenMessage(client)
        // listenMessageFromBot()
        // socketEvents.sendStatus(client)
    });

    client.on('auth_failure', (e) => {
        // console.log(e)
        // connectionLost()
    });

    client.on('authenticated', () => {
        console.log('AUTHENTICATED'); 
    });

    client.initialize();

    /**
    * Verificamos si tienes un gesto de db
    */

    if (process.env.DATABASE === 'mysql') {
    mysqlConnection.connect()
    }

    server.listen(port, () => {
    console.log(`El server esta listo en el puerto ${port}`);
    })

    checkEnvFile();
    return client
}

module.exports = { initBot }