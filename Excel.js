const ExcelJS = require('exceljs');
const fs = require('fs')
const workbook = new ExcelJS.Workbook();

const guardaXLSDatos = async (nombre, edad, sexo) => {
    // read from a file
    await workbook.xlsx.readFile('./bot.xlsx');
    // fetch sheet by name
    const worksheet = workbook.getWorksheet('Bot');
    const rowValues = [];
    rowValues[1] = nombre;
    rowValues[2] = edad;
    rowValues[3] = sexo;
    worksheet.addRow(rowValues);
    await workbook.xlsx.writeFile('./bot.xlsx');
    console.log(rowValues)
    console.log("Guardamos XLS")
}

const leeXLSDatos = async (srchStr) => {
    // read from a file
    await workbook.xlsx.readFile('./bot.xlsx');
    // fetch sheet by name
    const worksheet = workbook.getWorksheet('Bot');
    console.log(worksheet.rowCount)
    let colNombre = worksheet.getColumn(1).values
    let cont = 0
    let encontrado = 0
    let row
    let res = []
    // while (cont <= worksheet.rowCount && encontrado == 0) { // Ocupamos while en lugar de forEach para que deje de buscar en cuanto encuentre el resultado. 
    //     console.log(cont, colNombre[cont], srchStr)
    //     if(colNombre[cont] === srchStr) {
    //         row = worksheet.getRow(cont);
    //         res['nombre'] = row.getCell(1).value
    //         res['edad'] = row.getCell(2).value
    //         res['sexo'] = row.getCell(3).value
    //         encontrado = colNombre[cont]
    //     }
    //     cont++;
    // } 
    // console.log("RES=", res)
    // for (let index = 0; index < worksheet.rowCount; index++) {



    // }
    let rows = []
    worksheet.eachRow(function(row, rowNumber) {
        // console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
        rows[rowNumber-1]={'nombre':row.getCell(1).value, 'carnet':row.getCell(4).value, 'factura':row.getCell(5).value, 'prefijo':row.getCell(6).value}
      });
    //   console.log(rows)
    return rows
}

module.exports = {guardaXLSDatos, leeXLSDatos};