/**
 * ⚡⚡⚡ DECLARAMOS LAS LIBRERIAS y CONSTANTES A USAR! ⚡⚡⚡
 */
require('dotenv').config()
global.provider = process.env.PROVIDER || 'wwebjs';
const fs = require('fs');
global.siguientePaso = [{"numero":"1", "va":"XXX"}]; //MOD by CHV - Agregamos para pasar el VAMOSA a "index.js"
global.pasoAnterior = [];
const axios = require('axios').default;
const { List } = require('whatsapp-web.js');
// const mysqlConnection = require('./config/mysql')
const { initBot, traeVariables } = require(`./provider/${provider}`)
const { isValidNumber } = require('./controllers/handle')
const { saveMedia, saveMediaToGoogleDrive } = require('./controllers/save')
const { getMessages, responseMessages, bothResponse, waitFor } = require('./controllers/flows')
const { sendMedia, sendMessage, sendMessageButton, sendMessageList, readChat } = require(`./controllers/send_${provider}`);
const { stepsInitial, vamosA, traeUltimaVisita } = require('./adapter/index');//MOD by CHV - Agregamos para utilizar remplazos y stepsInitial
const { removeDiacritics, getRandomInt, remplazos, soloNumero, agregaVars } = require('./implementaciones/extraFuncs')
// const { guardaXLSDatos, leeXLSDatos} = require('./Excel');
// const { ingresarDatos, leerDatos } = require('./implementaciones/sheets')
const MULTI_DEVICE = process.env.MULTI_DEVICE || 'true';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve,ms))
let client
let client0
var dialogflowFilter = false;
var newBody; //MOD by CHV - 
var nuevaRespuesta; //MOD by CHV - Se agrego para los remplazos
var vars = []
let blackList = ['34692936038', '34678310819', '34660962689', '34649145761','34630283553','34648827637','34630255646','14178973313']

/**
 * Escuchamos cuando entre un mensaje
*/
function listenMessage(client){
    if(provider == 'wwebjs'){ client0 = client; messageEV = 'message' } // Usamos WWebJS.
    else { client0 = client.ev; messageEV = 'messages.upsert' } // Usamos Baileys.
    client0.on(messageEV, async msg => {
        const { from, body, name, hasMedia } = traeVariables(msg);
        if(provider == 'wwebjs'){ msg.type = 'notify' }
        if (vars[from] === undefined) vars[from] = []
        // Este bug lo reporto Lucas Aldeco Brescia para evitar que se publiquen estados
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
        await readChat(number, message, null , key) //MOD by CHV - Agregamos key/regla para guardarla en "chats/numero.json"
        client = agregaVars(client, msg, traeVariables(msg))
        client.theMsg['key'] = key

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

            // ############################################################################################################
            // ##############################     INICIAN FUNCIONES PERSONALIZADAS    #####################################
            // ############################################################################################################

            /**
             * Llama el API para traer categorias de Guna.
             * @param {*} ctx El objeto del mensaje.
             */
            async function getGunaCats(ctx) {
                let theUrl = `http://localhost:8888/dbrquery?j={"query":"selectTipoFerreroMty","exec":"ExecuteQuery","params":{"par1":"xxx"}}`
                const RES = await axios.get(theUrl).then(function (response) {
                    let lasOpciones = []
                    for(reg=0;reg<response.data.respuesta.length;reg++) {
                        let tempItem = {}
                        tempItem['id']=response.data.respuesta[reg].CAT_PT_DESC
                        tempItem['title']=response.data.respuesta[reg].CAT_PT_DESC
                        lasOpciones.push(tempItem)
                        // console.log(lasOpciones.length, tempItem)
                    }
                    const productList = {
                        body: remplazos("%saludo%, selecciona una categoría 👇🏽", ctx),
                        title: "Ver las categorías",
                        sections:[
                            {   title: "Categorías",
                                rows: lasOpciones,
                            }
                        ],
                        footer:"Categorías",
                        buttonText:"Selecciona"
                    }
                    sendMessageList(client, from, null, productList)
                    // console.log(ctx)
                    // sendMessagList(client, from, null, productList);
                    return
                }).catch(function (error) {
                console.log(error);
                return error
                });
            }
            /**
             * Llama el API para traer subcategorias de Guna.
             * @param {*} ctx El objeto del mensaje.
             */
            async function getGunaSubtipo(ctx) {
                let par1 = ctx.theMsg.body
                vars[from]['tipo'] = ctx.theMsg.body
                // console.log("V_TIPO=", from, vars[from]['tipo'])
                let theUrl = `http://localhost:8888/dbrquery?j={"query":"selectSubtipoFerreroMty","exec":"ExecuteQuery","params":{"par1":"${vars[from]['tipo']}"}}`
                const RES = await axios.get(theUrl).then(function (response) {
                    if( response.data.respuesta.length == 0 ) {
                        console.log("No hay resultados",from)
                        vamosA(from, "gunaCats")
                        client.sendMessage(from, "Esa categoría *no existe*, por favor revisa y vuelve a intentar.")
                    }
                    let elMensaje = "Gracias,\nAhora una subcategoría:\n\n"
                    let lasOpciones = []
                    for(reg=0;reg<response.data.respuesta.length;reg++) {
                        let tempItem = {}
                        tempItem['id']=response.data.respuesta[reg].CAT_PS_DESC
                        tempItem['title']=response.data.respuesta[reg].CAT_PS_DESC
                        lasOpciones.push(tempItem)
                        // console.log(lasOpciones.length, tempItem)
                    }
                    const productList = {
                        body: remplazos("Sselecciona una subcategoría 👇🏽", ctx),
                        title: "Ver las subcategorías",
                        sections:[
                            {   title: "Subcategorías",
                                rows: lasOpciones,
                            }
                        ],
                        footer:"",
                        buttonText:`CATEGORÍA ${body}`
                    }
                    sendMessageList(client, from, null, productList)
                    return "1"
                }).catch(function (error) {
                console.log(error);
                return error
                });
            }
            /**
             * Llama el API para traer productos de Guna.
             * @param {*} ctx El objeto del mensaje.
             */
            async function getGunaProds(ctx) {
                if(vars[from]['recompra'] === undefined) vars[from]['subtipo'] = ctx.theMsg.body
                console.log(vars[from]['tipo'], vars[from]['subtipo'], "RECOMPRA=", vars[from]['recompra'])
                let theUrl = `http://localhost:8888/dbrquery?j={"query":"selectProdsFerreroMty","exec":"ExecuteQuery","params":{"par1":"${vars[from]['tipo']}", "par2":"${vars[from]['subtipo']}"}}`
                const RES = await axios.get(theUrl).then(function (response) {
                    let elMensaje = "Gracias,\nAhora un producto:\n\n"
                    let lasOpciones = []
                    console.log("resultados selectProds",response.data.respuesta.length)
                    for(reg=0;reg<response.data.respuesta.length;reg++) {
                        let tempItem = {}
                        tempItem['id']=response.data.respuesta[reg].CAT_GP_ID
                        tempItem['title']=`${response.data.respuesta[reg].CAT_GP_NOMBRE} $${response.data.respuesta[reg].CAT_GP_PRECIO}, INV:${response.data.respuesta[reg].CAT_GP_ALMACEN}     `
                        lasOpciones.push(tempItem)
                    }
                    const productList = {
                        body: remplazos("Selecciona un producto 👇🏽", ctx),
                        title: "Ver los productos",
                        sections:[
                            {   title: "Productos",
                                rows: lasOpciones,
                            }
                        ],
                        buttonText:`SUBCATEGORÍA ${vars[from]['subtipo']}`
                    }
                    sendMessageList(client, from, null, productList)
                    return "1"
                }).catch(function (error) {
                console.log(error);
                return error
                });
            }
            /**
             * Llama el API para traer productos de Guna.
             * @param {*} ctx El objeto del mensaje.
             */
            async function agregaProds(ctx) {
                // vars[from]['subtipo'] = ctx.theMsg.body
                if(vars[from]['prods'] === undefined) { vars[from]['prods'] = [] }
                let elProd = ctx.theMsg.body
                let elMensaje = ""
                if(elProd.indexOf(' $') > -1){ // Producto con formato correcto. 
                    vars[from]['ultimoProd'] = elProd
                    elProd = elProd.substring(0, elProd.indexOf(' $')).trim().toLowerCase()
                    var precio = ctx.theMsg.body.substring(ctx.theMsg.body.indexOf(' $')+2)
                    // console.log("precio",precio)
                    precio = precio.substring(0, precio.indexOf(','))
                    // console.log("precio",precio)
                    vars[from]['prods'][elProd] = {"cant":0, "precio":precio}
                    // console.log("EL_PROD=", elProd)
                    // console.log(vars[from]['prods'])
                    elMensaje = ctx.theMsg.replyMessage
                    let re = ctx.theMsg.body.trim().toLowerCase()
                    elMensaje = elMensaje.replace(re, elProd.toLowerCase())
                }
                else{ // Producto SIN precio.
                    elMensaje = "El producto que seleccionaste es *incorrecto*, por favor intenta de nuevo."
                    sendMessage(client, from, elMensaje, ctx.theMsg.trigger, ctx.theMsg.step);
                        await delay(500)
                        vars[from]['recompra'] = true
                        getGunaProds()
                        vamosA(from, "gunaProds")
                    return
                }
                sendMessage(client, from, elMensaje, ctx.theMsg.trigger, ctx.theMsg.step);
                return
            }
            /**
             * Tomamos la cantidad del producto seleccionado.
             * @param {*} ctx El objeto del mensaje.
             */
            async function prodCantidad(ctx) {
                // console.log("Entramos a prodCantidad")
                let laCant = ctx.theMsg.body.trim()
                const reg = new RegExp(/^\d+$/)
                let elProd = vars[from]['ultimoProd'].toLowerCase()
                elProd = elProd.substring(0, elProd.indexOf(' $')).trim()
                console.log("SOLO NUMS |" + laCant + "|", reg.test(laCant))
                if(reg.test(laCant)){
                    // console.log(vars)
                    // console.log("Recibimos cant = " + laCant)
                    // console.log("EL_PROD=", vars[from]['prods'][elProd])
                    // console.log("precio=", vars[from]['prods'][elProd].precio)
                    vars[from]['prods'][elProd] = {"cant":laCant, "precio":vars[from]['prods'][elProd]['precio']}
                    var elMensaje = ""
                    const prods = Object.keys(vars[from]['prods']);
                    var total = 0
                    prods.forEach((prod, index) => {
                        if( vars[from]['prods'][prod] !== undefined && prod[0] !== undefined  ){
                            elMensaje = elMensaje + `${vars[from]['prods'][prod].cant} - ${prod[0].toUpperCase() + prod.substring(1)}\n`
                            console.log("cant y precio=", vars[from]['prods'][prod].cant, vars[from]['prods'][prod].precio)
                            if(reg.test(vars[from]['prods'][prod].cant) && vars[from]['prods'][prod].precio != ""){
                                total = total + (vars[from]['prods'][prod].cant * vars[from]['prods'][prod].precio)
                            }
                        } 
                        console.log(prod, vars[from]['prods'][prod]);
                    });
                    let pesos = Intl.NumberFormat('en-US')
                    elMensaje = elMensaje + "\n*Total*: $" + pesos.format(total)
                    elMensaje = elMensaje + "\n¿Quieres agregar mas productos a tu orden?"
                    var bts = {
                        "title":"Tu orden",
                        "message":elMensaje,
                        "buttons":[
                            {"body":"➕ Agregar productos"},
                            {"body":"⬅️ Cambiar categoría"},
                            {"body":"✖️ Terminar"}
                        ]
                    }
                    sendMessageButton(client, from, "xxx", bts)
                }
                else{
                    console.log("NO SOLO NUMS")
                    vamosA(from, "gunaProdsAgrega")
                    sendMessage(client, from, "Por favor escribe 👉🏽 *solo* 👈🏽 el número.", response.trigger, step);
                }
                return "1"
            }
            /**
             * Mandamos nuevamente la lista de productos.
             * @param {*} ctx El objeto del mensaje.
             */
            async function comprarMas(ctx) {
                console.log("Entramos a comprarMas")
                vars[from]['recompra'] = true
                vamosA(from, "gunaProds")
                await getGunaProds(ctx)
                vars[from]['recompra'] = undefined
                return "1"
            }
            /**
             * Mandamos nuevamente la lista de categorías.
             * @param {*} ctx El objeto del mensaje.
             */
            async function terminaCompra(ctx) {
                console.log("Entramos a terminaCompra")
                vars[from] = []
                sendMessage(client, from, "!Gracias por tu compra, regresa pronto!", response.trigger, step);
                return
            }
            /**
             * Llama el API para desbloquear un usuario.
             * @param {*} ctx El objeto del mensaje.
             */
            async function desbloqueaUsuario(ctx) {
                let par1 = ctx.theMsg.body
                let theUrl = `http://localhost:8888/dbrquery?j={"query":"update_usuario_guna_nobajas","exec":"ExecuteCommand","params":{"par1":"${par1}", "par2":"XXPARAM2XX", "par3":"XXPARAM3XX"}}`
                const RES = await axios.get(theUrl).then(function (response) {
                    const { AffectedRows } = response.data['respuesta'][0]
                    console.log('AFFECTED_ROWS = ', AffectedRows)
                    if(response.data['respuesta'][0]['AffectedRows']=="1"){
                    sendMessage(client, from, "Listo, usuario *"+response.data['params']['par1']+"* desbloqueado, por favor *cerrar navegadores* y reingresar.", response.trigger, step);
                    }
                    else{
                    sendMessage(client, from, "El usuario *"+response.data['params']['par1']+"* no *existe* o esta dado de *baja*, por favor revisarlo y volver a intentar.", response.trigger, step);
                    }
                    return response
                }).catch(function (error) {
                console.log(error);
                return error
                });
            }
            /**
             * Llama el API para desbloquear el usuario.
             * 
             * @param {*} theURL El URL para llamar al API 
             * @param {*} step
             */
            async function desbloqueaUsuario2(theUrl, step) {
                // const {from} = client.theMsg
                // const RES = await axios.get(theUrl).then(function (response) {
                //     const { AffectedRows } = response.data['respuesta'][0]
                //     console.log('AFFECTED_ROWS = ', AffectedRows)
                //     if(response.data['respuesta'][0]['AffectedRows']=="1"){
                //         sendMessage(client, from, "Listo, usuario *"+response.data['params']['par1']+"* desbloqueado, por favor *cerrar navegadores* y reingresar.", response.trigger, step);
                //     }
                //     else{
                //         sendMessage(client, from, "El usuario *"+response.data['params']['par1']+"* no *existe* o esta dado de *baja*, por favor revisarlo y volver a intentar.", response.trigger, step);
                //     }
                //     return response
                // }).catch(function (error) {
                //     console.log(error);
                //     return error
                // });
            }

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
                await sendMedia(client, from, response.media, response.trigger);
                console.log("Enviamos imagen")
                await delay(500)
            }
            /**
             * Si quieres enviar imagen con retraso.
            */
            if (response.delay && response.media) {
                setTimeout(() => {
                    // console.log("++++++++++++++++++++++++++++  SEND MEDIA AND DELAY  +++++++++++++++++++++++++++++++++++");
                    sendMedia(client, from, response.media, response.trigger);
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
                        await sendMessage(client, from, remplazos(thisMsg, client), response.trigger);
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
                    if(thisMsg !== undefined) await sendMessage(client, from, remplazos(thisMsg, client), response.trigger);
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
                await sendMessage(client, from, remplazos(thisMsg, client), response.trigger);
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
    listenMessageFromBot(ib)
 }
 inicializaBot()
