const { MessageMedia, Client, LocalAuth, Buttons, List } = require('whatsapp-web.js');
const { sendMedia, sendMessage, sendMessageButton, sendMessageList, readChat } = require(`../controllers/send`);
const mime = require('mime-types')
// const mysqlConnection = require('./config/mysql')
require('dotenv').config()
const fs = require('fs');
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors')
const qrcode = require('qrcode-terminal');
const app = express();
app.use(cors())
app.use(express.json())
// Use the express-fileupload middleware
const server = require('http').Server(app)
const port = process.env.PORT || 3000
const { generateImage, checkEnvFile } = require('../controllers/handle')
const { connectionReady } = require('../controllers/connection')
const { body, validationResult } = require('express-validator');
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.use('/', require('../routes/web'))


const { Server } = require("socket.io");
const io = new Server(server);

// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

let socks
let client

initBot = async () => {
    console.log("Iniciamos WaWebJS")
    client = new Client({
        authStrategy: new LocalAuth(),
        pup: { headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] }
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

    client.on('qr', qr => generateImage(qr, async () => {
        qrcode.generate(qr, { small: true });
        console.log(`Ver QR http://localhost:${port}/bot.qr.png`)
    }))


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
        // console.log("Conectando ...")
        socket.emit('ioStatus', socketioStatus);
        socks = socket
        await socket.emit('message', 'Conectando...');
        socket.on('checkConn', async function () { // Si recibe mensaje, regresa "connOk"
            // console.log("checking conn")
            await socket.emit('connOk', 'Connected');
        })

        try {
            client.on('message', msg => {
                // console.log(msg)
                // console.log(waReady)
                socketioStatus = "wa_msg"; socket.emit('ioStatus', socketioStatus); socket.emit('wa_msg', msg.body);
                socket.emit('incomming', 'Message In')
                waReady = true
            })
            client.on('qr', qr => generateImage(qr, async () => {
                socketioStatus = "wa_qr"; socket.emit('ioStatus', socketioStatus);
                qrcode.generate(qr, { small: true });
                console.log(`Ver QR http://localhost:${port}/bot.qr.png`)
                await socket.emit('qr', `http://localhost:${port}/bot.qr.png`);
                await socket.emit('message', 'QR Code received, scan please!');
            }))

            client.on('ready', async () => {
                socketioStatus = "wa_ready"
                await socket.emit('ready', 'Whatsapp esta listo!');
                await socket.emit('message', 'Whatsapp está listo!');
                waReady = true
            });

            client.on('authenticated', async () => {
                socketioStatus = "wa_autenticated"; socket.emit('ioStatus', socketioStatus);
                await socket.emit('authenticated', 'Whatsapp is authenticated!');
                await socket.emit('message', 'Whatsapp is authenticated!');
                // console.log('AUTHENTICATED');
            });

            client.on('auth_failure', async function (session) {
                await socket.emit('message', 'Auth failure, restarting...');
                waReady = false
            });

            client.on('disconnected', async (reason) => {
                socketioStatus = "wa_disconnected"; socket.emit('ioStatus', socketioStatus);
                await socket.emit('message', 'Whatsapp is disconnected!');
                waReady = false
                // client.destroy();
                // client.initialize();
            })
        }
        catch (e) {waReady = false }

     });
    server.listen(port, () => {
        console.log(`El servidor web esta listo en el puerto ${port} - http://localhost:${port}`);
    })
    const phoneNumberFormatter = function (number) {
        // 1. Eliminar caracteres que no sean números
        let formatted = number.replace(/\D/g, '');

        // 2. Eliminar el número 0 del prefijo y reemplazarlo con 62
        // if (formatted.startsWith('0')) {
        //     formatted = '62' + formatted.substr(1);
        // }

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
        // console.log("REQUEST=", req.body)
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
    // Send buttons
    app.post('/send-buttons', async (req, res) => {
        // console.log("REQUEST=", req.body)
        socks.emit('incomming', 'Button In')

        if (client.theMsg === undefined) {
            client.theMsg = {}
            client.theMsg.from = "WEB"
            client.theMsg.body = "WEB"
            client.theMsg.name = "WEB"   
        }
 
        const number = phoneNumberFormatter(req.body.number);
        const title = req.body.title || null;
        const btnmsg = req.body.btnmsg;
        const btn1 = req.body.btn1;
        const btn2 = req.body.btn2 || null;
        const btn3 = req.body.btn3 || null;
        const footer = req.body.footer || null;
        const isRegisteredNumber = await checkRegisteredNumber(number);
        if (!isRegisteredNumber) {
            return res.status(422).json({
                status: false,
                message: 'The number is not registered'
            });
        }
        let botones = []
        botones.push({ body: btn1 })
        if (btn2 != null) { botones.push({ body: btn2 }) }
        if (btn3 != null) { botones.push({body: btn3}) }
        let losBotones = new Buttons(btnmsg, botones, title, footer);
        client.sendMessage(number, losBotones).then(response => {
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
    // Send image
    app.post('/send-image', async (req, res) => {
        // console.log("REQUEST=", req.body)
        socks.emit('incomming', 'Image In')
        const number = phoneNumberFormatter(req.body.number);
        // const filename = req.body.image || null;
        const caption = req.body.caption || null;
        const { image } = req.files;
        // If no image submitted, exit
        if (!image) return res.sendStatus(400);
        // Move the uploaded image to our upload folder
        image.mv(__dirname + '/../mediaSend/' + image.name);
        res.sendStatus(200);
        const isRegisteredNumber = await checkRegisteredNumber(number);
        if (!isRegisteredNumber) {
            return res.status(422).json({
                status: false,
                message: 'The number is not registered'
            });
        }
        // sendMedia(client, number, image.name, caption)
        // `${__dirname}/../mediaSend`;
        const file = `${__dirname}/../mediaSend/${image.name}`;
        console.log("FILE="+file);
        if (fs.existsSync(file)) {
            console.log("ARCHIVO EXISTE");
            const media = MessageMedia.fromFilePath(file);
        }
        const base64 = fs.readFileSync(file, { encoding: 'base64' })
        const mimeType = mime.lookup(file)
        const media = new MessageMedia(mimeType, base64)
        client.sendMessage(number, media, { caption }).then(response => {
            socks.emit('imgOk', 'image sent')
            console.log("Imagen OK")
            // res.status(200).json({
            //     status: true,
            //     response: response
            // });

        }).catch(err => {
            socks.emit('imgKo', 'image NOT sent')
            console.log("Imagen NOT OK")
            // res.status(500).json({
            //     status: false,
            //     response: err
            // });
        });
    });
    // app.post('/upload', async (req, res) => {
    //     // Get the file that was set to our field named "image"
    //     const { image } = req.files;
    //     // If no image submitted, exit
    //     if (!image) return res.sendStatus(400);
    //     // Move the uploaded image to our upload folder
    //     image.mv(__dirname + '/../mediaSend/' + image.name);
    //     res.sendStatus(200);
    // });

    checkEnvFile();
    return client
}

module.exports = { initBot }