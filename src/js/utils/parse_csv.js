import * as Papa from 'papaparse';

//TODO: look into parsers for other filetypes, eg https://www.npmjs.com/package/xlsx

let debugParseCSV = false;

/**
 * 
 * @param {string} fileName 
 */
export function ParseCSVLocal(fileName, onComplete, onError, callbackParam = null) {

    let filePath = 'data/csv/' + fileName;
    if (!filePath.endsWith('.csv')) {
        filePath += '.csv';
    }
    ParseCSV(filePath, onComplete, onError, true, callbackParam);
}
export function ParseCSVURL(url, onComplete, onError, callbackParam = null) {
    ParseCSV(url, onComplete, onError, true, callbackParam);
}
export function ParseCSVString(csvString, onComplete, onError, callbackParam = null) {
    ParseCSV(csvString, onComplete, onError, false, callbackParam);
}


function ParseCSV(csv, onComplete, onError, download = false, callbackParam = null) {
    if (debugParseCSV) {
        console.log("Parse CSV:", csv, "(Download:" + download + ")");
    }
    Papa.parse(csv, {
        download: download,
        complete: (results, file) => {
            ParseComplete(results, file);
            if (onComplete != null) {
                onComplete(results, file, callbackParam);
            }
        },
        error: (error, file) => {
            ParseError(error, file);
            if (onError != null) {
                onError(error, file, callbackParam);
            }
        }
    })
}

function ParseComplete(results, file) {
    if (debugParseCSV) {
        console.log("Parse complete,", results, file);
    }
}
function ParseError(error, file) {
    if (debugParseCSV) {
        console.log("Parse error:", error, file);
    }
}