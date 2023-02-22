const axios = require('axios').default;
const { removeDiacritics, getRandomInt, remplazos, soloNumero, traeVariablesFromClient } = require('./extraFuncs')
const { sendMedia, sendMessage, sendMessageButton, sendMessageList, readChat } = require(`../controllers/send`)
const { vamosA, traeUltimaVisita } = require('../adapter/index')

/**
 * LAS FUNCIONES SE DECLARAN COMO UN OBJETO DENTRO DE MODULE.EXPORTS, DE LA SIGUIENTE MANERA:
 * 
 *     nombreFuncion1 : function nombreFuncion1(ctx) { // Aqui va el código de la funcion },
 *     nombreFuncion2 : function nombreFuncion2(ctx) { // Aqui va el código de la funcion }
 *
 * SE PUEDE USAR LA FUNCION traeVariablesFromClient(ctx) PARA OBTENER LAS VARIABLES from, body, name, hasMedia y step:
 * 
 *     const { from, body, name, hasMedia, step } = traeVariablesFromClient(ctx)
 * 
 * O SE PUEDEN OBTENER DIRECTAMENTE DEL OBJETO ctx QUE RECIBE LA FUNCION:
 * 
 *     const from = ctx.theMsg.from
 */

module.exports = {
            /**
             * Llama el API para traer categorias de Guna.
             * @param {*} ctx El objeto del mensaje.
             */
            getGunaCats : async function getGunaCats(ctx) {
                const { from, body, name, hasMedia, step } = traeVariablesFromClient(ctx)
                let lasOpciones = []
                let lasOpciones2 = []
                let theUrl = `http://localhost:8888/dbrquery?j={"query":"selectTipoFerreroMty","exec":"ExecuteQuery","params":{"par1":"xxx"}}`
                const RES = await axios.get(theUrl).then(function (response) {
                    for(reg=0;reg<response.data.respuesta.length;reg++) {
                        let tempItem = {}
                        tempItem['id']=response.data.respuesta[reg].CAT_PT_DESC
                        tempItem['title']=response.data.respuesta[reg].CAT_PT_DESC
                        lasOpciones.push(tempItem)
                        console.log(lasOpciones.length, lasOpciones)
                    }
                    console.log(lasOpciones2)
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
                    sendMessageList(ctx, from, null, productList)


                    console.log(ctx)
                    sendMessagList(ctx, from, null, productList);
                    return
                }).catch(function (error) {
                    console.log(error);
                    return error
                });
                // for(o=0;o<lasOpciones.length;o++){
                //     let theUrlSubsT = `http://localhost:8888/dbrquery?j={"query":"selectSubtipoFerreroMty","exec":"ExecuteQuery","params":{"par1":"${lasOpciones[o].id}"}}`
                //     const RES2 = await axios.get(theUrlSubsT).then(function (response2) {
                //         console.log("LO= ", lasOpciones.length, o)
                //         console.log("R2= ", response2.data.respuesta.length)
                //         lasOpciones2 = {}
                //         lasOpciones[o].rows = []
                //         delete lasOpciones[o].id
                //         for(st=0;st<response2.data.respuesta.length;st++) {
                //             let tempItem = {}
                //             tempItem['rowId']=response2.data.respuesta[st].CAT_PS_DESC
                //             tempItem['title']=response2.data.respuesta[st].CAT_PS_DESC
                //             lasOpciones[o].rows.push(tempItem)
                //             console.log("LO2= ", lasOpciones2.length, st, tempItem)
                //             // lasOpciones[st].rows = lasOpciones2
                //         }
                //     }).catch(function (error) {
                //     console.log(error);
                //     return error
                //     })
                // }
                // console.log(lasOpciones)
                // console.log(lasOpciones[0].rows)
                // const productList = {
                //     body: remplazos("Selecciona una categoria 👇🏽", ctx),
                //     title: "Ver las categorías",
                //     sections:lasOpciones,
                //     footer:"",
                //     buttonText:`CATEGORÍAS`
                // }
                // sendMessageList(ctx, from, null, productList)
            },
            /**
             * Llama el API para traer subcategorias de Guna.
             * @param {*} ctx El objeto del mensaje.
             */
            getGunaSubtipo : async function getGunaSubtipo(ctx) {
                const { from, body, name, hasMedia, step } = traeVariablesFromClient(ctx);
                let par1 = ctx.theMsg.body
                vars[from]['tipo'] = ctx.theMsg.body
                // console.log("V_TIPO=", from, vars[from]['tipo'])
                let theUrl = `http://localhost:8888/dbrquery?j={"query":"selectSubtipoFerreroMty","exec":"ExecuteQuery","params":{"par1":"${vars[from]['tipo']}"}}`
                const RES = await axios.get(theUrl).then(function (response) {
                    if( response.data.respuesta.length == 0 ) {
                        console.log("No hay resultados",from)
                        vamosA(from, "gunaCats")
                        sendMessage(ctx, from, "Esa categoría *no existe*, por favor revisa y vuelve a intentar.", null, step)
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
                        body: remplazos("Selecciona una subcategoría 👇🏽", ctx),
                        title: "Ver las subcategorías",
                        sections:[
                            {   title: "Subcategorías",
                                rows: lasOpciones,
                            }
                        ],
                        footer:"",
                        buttonText:`CATEGORÍA ${body}`
                    }
                    sendMessageList(ctx, from, null, productList)
                    return "1"
                }).catch(function (error) {
                console.log(error);
                return error
                });
            },
            /**
             * Llama el API para traer productos de Guna.
             * @param {*} ctx El objeto del mensaje.
             */
            getGunaProds : async function getGunaProds(ctx) {
                const { from, body, name, hasMedia, step } = traeVariablesFromClient(ctx);
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
                    sendMessageList(ctx, from, null, productList)
                    return "1"
                }).catch(function (error) {
                console.log(error);
                return error
                });
            },
            /**
             * Llama el API para traer productos de Guna.
             * @param {*} ctx El objeto del mensaje.
             */
            agregaProds : async function agregaProds(ctx) {
                const { from, body, name, hasMedia, step } = traeVariablesFromClient(ctx);
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
                    sendMessage(ctx, from, elMensaje, null, step);
                        await delay(500)
                        vars[from]['recompra'] = true
                        getGunaProds(ctx)
                        vamosA(from, "gunaProds")
                    return
                }
                sendMessage(ctx, from, elMensaje, null, step);
                return
            },
            /**
             * Tomamos la cantidad del producto seleccionado.
             * @param {*} ctx El objeto del mensaje.
             */
            prodCantidad : async function prodCantidad(ctx) {
                const { from, body, name, hasMedia, step } = traeVariablesFromClient(ctx);
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
                    sendMessageButton(ctx, from, null, bts)
                }
                else{
                    console.log("NO SOLO NUMS")
                    vamosA(from, "gunaProdsAgrega")
                    sendMessage(ctx, from, "Por favor escribe 👉🏽 *solo* 👈🏽 el número.", null, step);
                }
                return "1"
            },
            /**
             * Mandamos nuevamente la lista de productos.
             * @param {*} ctx El objeto del mensaje.
             */
            comprarMas : async function comprarMas(ctx) {
                const { from, body, name, hasMedia, step } = traeVariablesFromClient(ctx);
                console.log("Entramos a comprarMas")
                vars[from]['recompra'] = true
                vamosA(from, "gunaProds")
                await getGunaProds(ctx)
                vars[from]['recompra'] = undefined
                return "1"
            },
            /**
             * Mandamos nuevamente la lista de categorías.
             * @param {*} ctx El objeto del mensaje.
             */
            terminaCompra : async function terminaCompra(ctx) {
                const { from, body, name, hasMedia, step } = traeVariablesFromClient(ctx);
                console.log("Entramos a terminaCompra")
                vars[from] = []
                sendMessage(ctx, from, "!Gracias por tu compra, regresa pronto!", null, step);
                return
            },
            /**
             * Llama el API para desbloquear un usuario.
             * @param {*} ctx El objeto del mensaje.
             */
            desbloqueaUsuario : async function desbloqueaUsuario(ctx) {
                const { from, body, name, hasMedia, step } = traeVariablesFromClient(ctx);
                let par1 = ctx.theMsg.body
                let theUrl = `http://localhost:8888/dbrquery?j={"query":"update_usuario_guna_nobajas","exec":"ExecuteCommand","params":{"par1":"${par1}", "par2":"XXPARAM2XX", "par3":"XXPARAM3XX"}}`
                const RES = await axios.get(theUrl).then(function (response) {
                    const { AffectedRows } = response.data['respuesta'][0]
                    console.log('AFFECTED_ROWS = ', AffectedRows)
                    if(response.data['respuesta'][0]['AffectedRows']=="1"){
                    sendMessage(ctx, from, "Listo, usuario *"+response.data['params']['par1']+"* desbloqueado, por favor *cerrar navegadores* y reingresar.", null, step);
                    }
                    else{
                    sendMessage(ctx, from, "El usuario *"+response.data['params']['par1']+"* no *existe* o esta dado de *baja*, por favor revisarlo y volver a intentar.", null, step);
                    }
                    return response
                }).catch(function (error) {
                console.log(error);
                return error
                });
            },
            /**
             * Llama el API para desbloquear el usuario.
             * 
             * @param {*} theURL El URL para llamar al API 
             * @param {*} step
             */
            desbloqueaUsuario2 : async function desbloqueaUsuario2(theUrl, step) {
                // const { from, body, name, hasMedia, step } = traeVariablesFromClient(ctx);
                // const RES = await axios.get(theUrl).then(function (response) {
                //     const { AffectedRows } = response.data['respuesta'][0]
                //     console.log('AFFECTED_ROWS = ', AffectedRows)
                //     if(response.data['respuesta'][0]['AffectedRows']=="1"){
                //         sendMessage(ctx, from, "Listo, usuario *"+response.data['params']['par1']+"* desbloqueado, por favor *cerrar navegadores* y reingresar.", null, step);
                //     }
                //     else{
                //         sendMessage(ctx, from, "El usuario *"+response.data['params']['par1']+"* no *existe* o esta dado de *baja*, por favor revisarlo y volver a intentar.", null, step);
                //     }
                //     return response
                // }).catch(function (error) {
                //     console.log(error);
                //     return error
                // });
            }
}
// module.exports = new funcsClass()