import * as Papa from 'papaparse';

//TODO: look into parsers for other filetypes, eg https://www.npmjs.com/package/xlsx

let debugParseCSV = false;

/**
 * 
 * @param {string} fileName 
 */
export function ParseCSVLocal(fileName, onComplete, onError) {

    let filePath = 'data/csv/' + fileName;
    if (!filePath.endsWith('.csv')) {
        filePath += '.csv';
    }
    ParseCSV(filePath, onComplete, onError, true);
}
export function ParseCSVURL(url, onComplete, onError) {
    ParseCSV(url, onComplete, onError, true);
}
export function ParseCSVString(csvString, onComplete, onError) {
    ParseCSV(csvString, onComplete, onError, false);
}


function ParseCSV(csv, onComplete, onError, download = false) {
    if (debugParseCSV) {
        console.log("Parse CSV:", csv, "(Download:" + download + ")");
    }
    Papa.parse(csv, {
        download: download,
        complete: (results, file) => {
            ParseComplete(results, file);
            if (onComplete != null) {
                onComplete(results, file);
            }
        },
        error: (error, file) => {
            ParseError(error, file);
            if (onError != null) {
                onError(error, file);
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