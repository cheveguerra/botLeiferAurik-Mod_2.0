const { getData, getReply, saveMessageMysql } = require('./mysql')
const { saveMessageJson } = require('./jsonDb')
const { getDataIa } = require('./diaglogflow')
const  stepsInitial = require('../flow/initial.json')
const  stepsReponse = require('../flow/response.json')
const { isUndefined } = require('util');
var msjsRecibidos = [];
var ultimoStep; //MOD by CHV - 
var pasoAnterior = []; //MOD by CHV - Para guardar el paso anterior de cada número.
var pasoRequerido; //MOD by CHV - 
var vamosA = ""; //MOD by CHV - 
var VA = ""; //MOD by CHV - 
var elNum; //MOD by CHV - 
var cumplePasoPrevio; //MOD by CHV - 
const resps = require('../flow/response.json'); //MOD by CHV - Agregamos para traer las respuestas.
const { appendFile } = require('fs')

const get = (message, num) => new Promise((resolve, reject) => { //MOD by CHV - Agregamos parametro "num" para recibir el número de "app.js" 
    // console.log(num)
    elNum = num //MOD by CHV - 
    if(siguientePaso.find(k => k.numero.includes(elNum))){
        console.log("siguientePaso="+siguientePaso.find(k => k.numero.includes(elNum))["numero"], siguientePaso.find(k => k.numero.includes(elNum))["va"])        
        // ultimoStep = siguientePaso.find(k => k.numero.includes(elNum))["va"]
        pasoAnterior[elNum] = siguientePaso.find(k => k.numero.includes(elNum))["va"] //Asignamos pasoAnterior al número.
        siguientePaso.splice(siguientePaso.indexOf(elNum), 1)
        console.log("********************   "+siguientePaso.find(k => k.numero.includes(elNum)))
    }
    if(siguientePaso.length>1){console.log(siguientePaso[1]["numero"], siguientePaso[1]["va"])}

    /**
     * Si no estas usando un gesto de base de datos
     */

    if (process.env.DATABASE === 'none') {
        var { key } = stepsInitial.find(k => k.keywords.includes(message)) || { key: null }

        /* ###############################################  *   REGEXP   *   ####################################################
            Si queremos usar RegExp, en los "keywords" de inital.json, en lugar de un arreglo usamos un string (quitamos los [])
            y en él usamos "*" para significar cualquier texto y "|" para significar "OR", esto nos permite ser mas flexibles
            con los "keywords", por ejemplo, si queremos que el mensaje pueda decir:

                "Hola quiero info del paquete" o "Requiero mas informacion"

            ponemos "*info*" y la regla se va a disparar porque los dos contienen "info", o si queremos que se dispare con:

                "Quiero info del paquete numero 3" o "Me gusto el paquete de Angular"

            ponemos "paquete*3|paquete*angular" y la regla se dispara porque contiene "paquete" Y "3" -O- "paquete" Y "angular".

           #####################################################################################################################
        */
        var {keywords} = stepsInitial.find(k => k.key.includes(key)) || { keywords: null }
        if(!Array.isArray(keywords)){key=null;}//Si "keywords" no es arreglo entonces ponemos "key" en null y usamos REGEXP para buscar reglas.
        if(key == null && message.length > 0){
            console.log("=======  KEY ES NULO USAMOS REGEXP  =======");
            for (i=0; i<stepsInitial.length;i++){
                // console.log(i, stepsInitial[i].keywords, message.match(stepsInitial[i].keywords.toString().replaceAll("*",".*")));                
                if(!Array.isArray(stepsInitial[i].keywords)){// Si "Keywords" NO es arreglo entonces ...
                    x = null;
                    console.log("KEY=|" + stepsInitial[i].key.toString() + "|" )
                    // if(resps[stepsInitial[i].key.toString()].pasoRequerido != undefined){pr = resps[stepsInitial[i].key].pasoRequerido};
                    // console.log(resps[stepsInitial[i].key.toString()].pasoRequerido== ultimoStep)
                    console.log("Esta Key=" + stepsInitial[i].key.toString() + " - pasoReq=" + resps[stepsInitial[i].key.toString()].pasoRequerido + " - PasoAnt=" + ultimoStep+"|"+pasoAnterior[elNum])
                    if(resps[stepsInitial[i].key.toString()].pasoRequerido == undefined || resps[stepsInitial[i].key.toString()].pasoRequerido == pasoAnterior[elNum]){
                        var tempKeyword = "";
                        if (stepsInitial[i].keywords == "%solo_correos%"){
                            console.log("solo_correos")
                            tempKeyword = "[a-zA-Z0-9]+[_a-zA-Z0-9\.-]*[a-zA-Z0-9]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+[\.][a-zA-Z]{2,12})"}
                        else{tempKeyword = stepsInitial[i].keywords.toString().replaceAll("*",".*")}
                        x = message.match(tempKeyword);
                        // console.log("Keywords="+stepsInitial[i].keywords + " - key=" + stepsInitial[i].key + " - pasoReq=" + resps[stepsInitial[i].key].pasoRequerido + " - PasoAnt=" + ultimoStep)
                        // console.log("x:"+x+" - ultimoStep="+ultimoStep+" - pasoReq="+resps[stepsInitial[i].key].pasoRequerido);
                        // console.log(resps[stepsInitial[i].key].replyMessage.toString())
                        if (x != null){
                            key = stepsInitial[i].key;
                            if(resps[stepsInitial[i].key].pasoRequerido != null && resps[stepsInitial[i].key].pasoRequerido != pasoAnterior[elNum]){key=null;}
                            // console.log("KEY="+key+" - X="+x);
                            if(resps[stepsInitial[i].key].replyMessage.toString().search("/URL") > -1){
                                console.log("****************    HAY URL    ****************")
                            }
                            break;
                        }
                        else{x = null;}
                    } else 
                    { console.log("NO CUMPLE PASO REQ");
                    console.log("pasoReq=" + resps[stepsInitial[i].key.toString()].pasoRequerido + " - PasoAnt=" + ultimoStep)
                    }
                }
            }
            // console.log("<<<<<<<<<  "+key);
            // cumplePasoRequerido(key)
            // ultimoPaso = pasoRequerido;
            // ultimoStep = key;
        }
        const response = key || null
        // if(key != null){remplazos(resps[key].replyMessage.join(''));}
        if(resps[key]!=undefined){VA = resps[key].goto}else{VA=null}
        cumplePasoRequerido(key);
        vamosA = VA;
        // console.log(elNum)
        
        if(vamosA != "" && vamosA != undefined && cumplePasoPrevio == true){
            // console.log("ASIGNAMOS VAMOSA = " + vamosA);
            pasoAnterior[elNum] = vamosA;
        }
        // console.log("ULTIMOSTEP="+ultimoStep)
        vamosA = "";
        // console.log("MESSAGE: "+message);
        // console.log("KEY: "+key);
        // console.log("RESPONSE: "+response);
        if(cumplePasoPrevio) {resolve(response);}
    }

    /**
     * Si usas MYSQL
     */
    if (process.env.DATABASE === 'mysql') {
        getData(message, (dt) => {
            resolve(dt)
        });
    }

})

const reply = (step) => new Promise((resolve, reject) => {
    /**
    * Si no estas usando un gesto de base de datos
    */
    if (process.env.DATABASE === 'none') {
        let resData = { replyMessage: '', media: null, trigger: null }
        const responseFind = stepsReponse[step] || {};
        resData = {
            ...resData, 
            ...responseFind
            // replyMessage:responseFind.replyMessage.join('')
        }
        resolve(resData);
        return 
    }
    /**
     * Si usas MYSQL
     */
    if (process.env.DATABASE === 'mysql') {
        let resData = { replyMessage: '', media: null, trigger: null }
        getReply(step, (dt) => {
            resData = { ...resData, ...dt }
            resolve(resData)
        });
    }
})

const getIA = (message) => new Promise((resolve, reject) => {
    /**
     * Si usas dialogflow
     */
     if (process.env.DATABASE === 'dialogflow') {
        let resData = { replyMessage: '', media: null, trigger: null }
        getDataIa(message,(dt) => {
            resData = { ...resData, ...dt }
            resolve(resData)
        })
    }
})

/**
 * 
 * @param {*} message 
 * @param {*} date 
 * @param {*} trigger 
 * @param {*} number
 * @returns 
 */
const saveMessage = ( message, trigger, number, regla ) => new Promise( async (resolve, reject) => { //MOD by CHV - Agregamos el partametro "regla" para poder guardarlo en "chats/numero.json"
     switch ( process.env.DATABASE ) {
         case 'mysql':
             resolve( await saveMessageMysql( message, trigger, number ) )
             break;
         case 'none':
             resolve( await saveMessageJson( message, trigger, number, regla) ) //MOD by CHV - Agregamos el paranetro "regla"
            //  console.log("REGLA DESDE APP.JS="+regla)
             break;
         default:
             resolve(true)
             break;
    }
})

module.exports = { get, reply, getIA, saveMessage, remplazos, stepsInitial } //MOD by CHV - Agregamos "remplazos" y "stepsInitial" para usarlos en "apps.js"

/**
 * Reemplaza texto en la respuesta con variables predefinidas.  
 */
function remplazos(elTexto, extraInfo){
    if(elTexto == null){elTexto = '';}
    laLista = elTexto.toString().split(' ');
    // console.log(laLista);
    // console.log('=============  remplazos  ============');
        for (var i = 0; i < laLista.length; i++) {
            // console.log('Revisamos: '+laLista[i]);
            if (laLista[i].search('%dia_semana%')>-1){//Remplaza con el dia de hoy.
                var dia = new Date().getDay();
                if(dia==0){diaSemana='domingo';}
                else if(dia==1){diaSemana='lunes';}
                else if(dia==2){diaSemana='martes';}
                else if(dia==3){diaSemana='miercoles';}
                else if(dia==4){diaSemana='jueves';}
                else if(dia==5){diaSemana='viernes';}
                else {diaSemana='sábado';}
                elTexto = elTexto.replace('%dia_semana%', diaSemana);
            }
            if (laLista[i].search('%saludo%')>-1){//Remplaza con "Buenos dias, tardes o noches" dependiendo de la hora.
                var hora = new Date().getHours()
                if(hora>0 && hora < 12){saludo='Buenos días';}
                else if(hora>11 && hora < 19){saludo='Buenas tardes';}
                else {saludo='Buenas noches';}
                elTexto = elTexto.toString().replace('%saludo%', saludo);
            }
            if (laLista[i].search('%hora24%')>-1){//Remplaza con la hora a 24 hrs.
                var hora = new Date().getHours();
                if (hora.toString().length < 2){hora = "0" + hora;}
                elTexto = elTexto.toString().replace('%hora24%', hora);
            }
            if (laLista[i].search('%hora12%')>-1){//Remplaza con la hora a 12 hrs.
                var hora = new Date().getHours();
                var ampm = hora >= 12 ? 'pm' : 'am';
                hora = hora % 12;
                hora = hora ? hora : 12; // the hour '0' should be '12'
                if (hora.toString().length < 2){hora = "0" + hora;}
                elTexto = elTexto.toString().replace('%hora12%', hora);
            }
            if (laLista[i].search('%minutos%')>-1){//Remplaza con los minutos de la hora actual.
                var mins = new Date().getMinutes();
                if (mins.toString().length < 2){mins = "0" + mins;}
                elTexto = elTexto.toString().replace('%minutos%', mins);
            }
            if (laLista[i].search('%ampm%')>-1){//Remplaza con am o pm.
                var hours = new Date().getHours();
                var ampm = hours >= 12 ? 'pm' : 'am';
                elTexto = elTexto.toString().replace('%ampm%', ampm);
            }
            if (laLista[i].search('%rnd_')>-1){//Remplaza con opción al azar dentro de las especificadas.
                var inicio = laLista[i].search('%rnd_');
                var final = laLista[i].indexOf("%", inicio+1);
                // console.log(inicio, final);
                var subStr = laLista[i].substring(inicio, final+1);
                // console.log("El substring="+subStr);
                var partes = subStr.toString().split('_');
                if(partes.length > 1){
                    var opciones = partes[1].toString().substring(0,partes[1].toString().length-1).split(",");
                    var elRand = Math.floor(Math.random() * (opciones.length));
                    if(elRand == opciones.length){elRand = elRand - 1;}
                    // console.log(opciones.length, elRand, opciones[elRand]);
                    elTexto = elTexto.toString().replace(subStr, opciones[elRand]);
                }
                else{
                    elTexto = elTexto.toString().replace(subStr, "");
                }
            }
            if(laLista[i].search('%msjant_')>-1){//Remplaza con el mensaje anterior especificado.
                var histlMsjs = {};
                console.log("entramos a msjant")
                // var hayHistorial = (chkFile(`${__dirname}/chats/`+from+".json"));
                if(chkFile(`${__dirname}/../chats/`+elNum+".json")){
                    let rawdata = fs.readFileSync(`./chats/${elNum}.json`);
                    let elHistorial0 = JSON.parse(rawdata);
                    elHistorial = elHistorial0["messages"];

                    var inicio = laLista[i].search('%msjant_');
                    var final = laLista[i].indexOf("%", inicio+1);
                    var subStr = laLista[i].substring(inicio, final+1);
                    console.log("Substr = |" + subStr + "|");
                    var partes = subStr.toString().split('_');
                    if(partes.length > 1){
                        console.log("Partes[1] = |" + partes[1] + "|");
                        let posicion0 = partes[1].substring(0, partes[1].length-1)
                        console.log("Posicion0 = |" + posicion0 + "|");
                        posicion = ((posicion0*1) + 1);
                        console.log("Posicion = " + posicion);
                        console.log( elHistorial.length );
                        console.log((elHistorial.length*1)-posicion);
                        console.log("Mensaje="+elHistorial[elHistorial.length - posicion]["message"])
                        elTexto = elTexto.toString().replace(subStr, elHistorial[elHistorial.length - posicion]["message"]);
                    }
                    // histlMsjs = elHistorial["messages"];
                    // totalMsjs = histlMsjs.length-1;
                    // ultimoMensaje = histlMsjs[histlMsjs.length-1];
                    // let mensajeAnterior = elHistorial["messages"][totalMsjs-1];
                    // console.log("Mensajes:"+totalMsjs+", Ultimo:"+JSON.stringify(ultimoMensaje));
                    // console.log("Anterior:"+JSON.stringify(mensajeAnterior));
                }
                // return histlMsjs;
            }
            if (laLista[i].search('%nombre%')>-1){//Remplaza con el nombre del remitente.
                if(typeof extraInfo !== undefined){
                    const {theMsg} = extraInfo;
                    if(theMsg['_data']['notifyName'] !== undefined){
                        elTexto = elTexto.toString().replace('%nombre%', theMsg['_data']['notifyName']);
                    }
                }
            }
            if (laLista[i].search('%primer_nombre%')>-1){//Remplaza con el nombre del remitente.
                if(typeof extraInfo !== undefined){
                    const {theMsg} = extraInfo;
                    if(theMsg['_data']['notifyName'] !== undefined){
                        elTexto = elTexto.toString().replace('%primer_nombre%', theMsg['_data']['notifyName'].split(' ')[0]);
                    }
                }
            }
      }
    //   console.log("EL TEXTO="+elTexto);
      return elTexto
 }

/**
 * Revisa si la regla especificada depende (es submenu) de otra regla, y cambia la variable "cumplePasoPrevio" a verdadero o falso.
 */
 function cumplePasoRequerido(step){
    //Traemos las respuestas para obtener el "pasoRequerido".
    if(resps[step]!=undefined){pasoRequerido=resps[step].pasoRequerido}else{pasoRequerido=null}
    if((pasoRequerido != null && pasoRequerido == ultimoStep)){
        // console.log("REQUIERE PASO PREVIO Y CUMPLE");
        cumplePasoPrevio = true;
    }
    else if((pasoRequerido != null && pasoRequerido != pasoAnterior[elNum])){
        // console.log("REQUIERE PASO PREVIO Y NO LO CUMPLE");
        cumplePasoPrevio = false;
    }
    else{
        // console.log("NO REQUIERE PASO PREVIO")
        cumplePasoPrevio = true;
    }
    pasoAnterior[elNum] = step
    ultimoPaso = pasoRequerido;
}

const fs = require('fs');
function chkFile(theFile){ //MOD by CHV - Agregamos para revisar que exista el archivo "chats/numero.json"
    if (fs.existsSync(theFile)) {
        // console.log("Si existe el archivo "+ theFile);
        var h = true;
    }
    else{
        // console.log("No existe el archivo "+ theFile);
        var h = false;
    }
    return h;
}