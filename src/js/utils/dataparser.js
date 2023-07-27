import * as Papa from 'papaparse';

import csvTest from '../../assets/csv/continent-codes.csv';


/**
 * 
 * @param {string} fileName 
 */
export function TestReadCSV(fileName) {

    let filePath = 'data/csv/' + fileName;
    if (!filePath.endsWith('.csv')) {
        filePath += '.csv';
    }

    console.log("Reading CSV file:", filePath);

    let parsedObject = Papa.parse(filePath, {
        download: true,
        // delimiter: ',',
        // TODO: integrate step/streaming, see: https://www.papaparse.com/docs
        complete: ParseComplete,

    });


}

function ParseComplete(results, file) {
    console.log("Parse complete,", results, file);
}
function ParseError(error, file) {
    console.log("Parse error:", error, file);
}