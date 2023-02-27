const { Client, LocalAuth, Buttons, List } = require('whatsapp-web.js');
require('dotenv').config()
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors')
const qrcode = require('qrcode-terminal');
const app = express();
app.use(cors())
app.use(express.json())
const server = require('http').Server(app)
const port = process.env.PORT || 3000
const { generateImage, checkEnvFile } = require('../controllers/handle')
const { connectionReady } = require('../controllers/connection')
const { body, validationResult } = require('express-validator');
app.use('/', require('../routes/web'))


const { Server } = require("socket.io");
const io = new Server(server);

// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

let socks

initBot = async () => {
    console.log("WaWebJS Init")
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] }
    });

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
    let waReady = false
 // Socket IO
     io.on('connection', async function (socket) {
        console.log("Connecting ...")
        socks = socket
        
        await socket.emit('message', 'Connecting...');
        
        socket.on('checkConn', async function () { // Si recibe mensaje, regresa "connOk"
            console.log("checking conn")
            await socket.emit('connOk', 'Connected');
        })

        try {
            client.on('message', () => {
                console.log(waReady)
                socket.emit('incomming', 'Message In')
                waReady = true
            })
            client.on('qr', qr => generateImage(qr, async () => {
                qrcode.generate(qr, { small: true });
                console.log(`Ver QR http://localhost:${port}/bot.qr.png`)
                await socket.emit('qr', `http://localhost:${port}/bot.qr.png`);
                await socket.emit('message', 'QR Code received, scan please!');
            }))

            client.on('ready', async () => {
                await socket.emit('ready', 'Whatsapp is ready!');
                await socket.emit('message', 'Whatsapp is ready!');
                waReady = true
            });

            client.on('authenticated', async () => {
                await socket.emit('authenticated', 'Whatsapp is authenticated!');
                await socket.emit('message', 'Whatsapp is authenticated!');
                // console.log('AUTHENTICATED');
            });

            client.on('auth_failure', async function (session) {
                await socket.emit('message', 'Auth failure, restarting...');
                waReady = false
            });

            client.on('disconnected', async (reason) => {
                await socket.emit('message', 'Whatsapp is disconnected!');
                waReady = false
                // client.destroy();
                // client.initialize();
            })
        }
        catch (e) {waReady = false }

    });

    server.listen(port, () => {
    console.log(`El server esta listo en el puerto ${port}`);
    })

    const phoneNumberFormatter = function (number) {
        // 1. Menghilangkan karakter selain angka
        let formatted = number.replace(/\D/g, '');

        // 2. Menghilangkan angka 0 di depan (prefix)
        //    Kemudian diganti dengan 62
        if (formatted.startsWith('0')) {
            formatted = '62' + formatted.substr(1);
        }

        if (!formatted.endsWith('@c.us')) {
            formatted += '@c.us';
        }

        return formatted;
    }

    const checkRegisteredNumber = async function (number) {
        const isRegistered = await client.isRegisteredUser(number);
        return isRegistered;
    }
    
    // Send message
    app.post('/send-message', [
        body('number').notEmpty(),
        body('message').notEmpty(),
    ], async (req, res) => {

        console.log("xxxxxxxx", req.body)

        socks.emit('incomming', 'Message In')

        const errors = validationResult(req).formatWith(({
            msg
        }) => {
            return msg;
        });

        if (!errors.isEmpty()) {
            return res.status(422).json({
                status: false,
                message: errors.mapped()
            });
        }

        const number = phoneNumberFormatter(req.body.number);
        const message = req.body.message;
        const isRegisteredNumber = await checkRegisteredNumber(number);
        if (!isRegisteredNumber) {
            return res.status(422).json({
                status: false,
                message: 'The number is not registered'
            });
        }

        client.sendMessage(number, message).then(response => {
            res.status(200).json({
                status: true,
                response: response
            });
        }).catch(err => {
            res.status(500).json({
                status: false,
                response: err
            });
        });
    });


    checkEnvFile();
    return client
}

module.exports = { initBot }