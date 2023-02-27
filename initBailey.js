const  baileysReq = require ('@adiwajshing/baileys')
var pino = require('pino');
const { createWriteStream } = require('fs')
var combineImage = require('combine-image');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    Browsers,
    DisconnectReason,
} = baileysReq
const globalVendorArgs = { name: `bot` }
var qr = require('qr-image');

/**
 * Hace promesa el write
 * @param {*} base64
 */
const baileyGenerateImage = async (base64, name = 'bot.qr.png') => {
    const PATH_QR = `${process.cwd()}/public/${name}`;
    let qr_svg = qr.image(base64, { type: 'png', margin: 4 });

    const writeFilePromise = () =>
        new Promise((resolve, reject) => {
            const file = qr_svg.pipe(createWriteStream(PATH_QR));
            file.on('finish', () => resolve(true));
            file.on('error', reject);
        });

    await writeFilePromise();

    const cleanImage = await combineImage([PATH_QR], {
        margin: 15,
        color: 0xffffffff,
    });
    cleanImage.write(PATH_QR);
};


function listenMessage(client){
    client.ev.on('messages.upsert', async msg => {
        console.log('M=', msg)
        console.log('replying to', msg.messages[0])
        // await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'hola como estas' })
    })
}


/**
 * Iniciar todo Bailey
 */
initBailey = async () => {
    const NAME_DIR_SESSION = `baileys_sessions`;
    const { state, saveCreds } = await useMultiFileAuthState(
        NAME_DIR_SESSION
    );
    saveCredsGlobal = saveCreds;
    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        auth: state,
        browser: Browsers.macOS('Desktop'),
        syncFullHistory: false,
        logger: pino({ level: 'error' }),
    })
    try {
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if(connection === 'close') {
                if (statusCode !== DisconnectReason.loggedOut) {
                    initBailey();
                }
                if (statusCode === DisconnectReason.loggedOut) {
                    const PATH_BASE = join(process.cwd(), NAME_DIR_SESSION);
                    rimraf(PATH_BASE, (err) => {
                        if (err) return
                    });
                    initBailey();
                }
            }
            /** Conexion abierta correctamente */
            if (connection === 'open') {
                console.log('ready', true);
                // initBusEvents(sock);
            }
            /** QR Code */
            if (qr) {
                console.log('require_action', {
                    instructions: [
                        `Debes escanear el QR Code para iniciar bot.qr.png`,
                        `Recuerda que el QR se actualiza cada minuto `,
                        `Necesitas ayuda: https://link.codigoencasa.com/DISCORD`,
                    ],
                });
                await baileyGenerateImage(
                    qr,
                    `bot.qr.png`
                );
            }
        });
        sock.ev.on('creds.update', async () => {
            await saveCreds();
        });
    } catch (e) {
        // logger.log(e);
        console.log('auth_failure', [
            `Algo inesperado ha ocurrido NO entres en pánico`,
            `Reinicia el BOT`,
            `Tambien puedes mirar un log que se ha creado baileys.log`,
            `Necesitas ayuda: https://link.codigoencasa.com/DISCORD`,
            `(Puedes abrir un ISSUE) https://github.com/codigoencasa/bot-whatsapp/issues/new/choose`,
        ]);
    }
    listenMessage(sock)
    // sock.ev.on('messages.upsert', async (m) => {
    //     console.log('M=', m)
    //     console.log('replying to', m.messages[0])
    //     // await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'hola como estas' })
    // })
}
// run in main file
initBailey()


module.exports = { initBailey, listenMessage, baileyGenerateImage }