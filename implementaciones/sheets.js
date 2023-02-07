const { getTime, getDate, getFormat, getCompareDate, getFormatMs } = require('util-tiempo')
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const RESPONSES_SHEET_ID = '1tVRX1ojXJadsjRUJ-pNv8DZgziaIMcAdsMtPmWQRBcM';  //Generar en google.cloud
const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID);
const CREDENTIALS = JSON.parse(fs.readFileSync('./implementaciones/credenciales.json'));

async function ingresarDatos(numero, mensaje){
    let Fecha = getDate();
    let Hora = getTime(Date.now(), {local: 'es-MX', timeZone: 'America/Mexico_City', hour12:false});
    elNum = numero.replace('@c.us', '')
    if(elNum.substring(0,3) == '521') { elNum = elNum.replace('521', '52') }
    let rows = [{
        Numero: elNum.trim(),
        Mensaje: mensaje,
        Fecha: Fecha,
        Hora: Hora
    }];
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });
    await doc.loadInfo();
    let sheet = doc.sheetsByTitle['Mensajes'];
    // console.log("SHEET=", sheet)
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        await sheet.addRow(row);
        console.log("Datos guardados (sheets.js)")
    }
    // console.log('Fecha:',Fecha,);
    // console.log('Hora:',Hora);
    // console.log('Nombre:',nombre);
    // console.log('Apellidos:',apellido);
    // console.log('Direccion:',direccion);
    // console.log('Planta:',planta);
    // console.log('Codigo Postal:',CP);
    // console.log('Descripcion:',descripcion);
    // console.log('Telefono:',telsim);
    // console.log('Horario deseado:',horario);
    // console.log('ID_Solicitud: ',ID_Solicitud);
    // console.log('Estado: ',Estado)
    // console.log('-----------------------------------');
}

async function leerDatos(telsim){
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });
    await doc.loadInfo();
    let sheet = doc.sheetsByIndex[0];
    let nya;
    let cont = 0
    let found = false
    nya = [];
    let rows = await sheet.getRows();
    console.log(rows.length)
    // for (let index = 0; index < rows.length; index++) {
    //     const row = rows[index];
    //     if (row.Telefono == telsim) {
    //         nya['Nombre'] = row.Nombre+' '+row.Apellido
    //         nya['Direccion'] = row.Direccion+' '+row.Planta+', '+row.CP 
    //         nya['Estado'] = row.Estado
    //     }
    // }
    while (!found && cont < rows.length){ //Usamos while para que no recorra TODOS los registros y se pare encuanto lo encuentre.
        const row = rows[cont];
        console.log(row.Nombre, found, cont)
        if (row.Telefono == telsim) {
            nya['Nombre'] = row.Nombre+' '+row.Apellido
            nya['Direccion'] = row.Direccion+', '+row.Planta+', CP:'+row.CP 
            nya['Estado'] = row.Estado
            found = true
        }
        cont++
    }
    return nya
};

module.exports = {ingresarDatos,leerDatos};