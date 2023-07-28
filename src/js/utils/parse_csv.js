import * as Papa from 'papaparse';

/**
 * 
 * @param {string} fileName 
 */
export function ReadLocalCSV(fileName) {

    let filePath = 'data/csv/' + fileName;
    if (!filePath.endsWith('.csv')) {
        filePath += '.csv';
    }
    ParseCSV(filePath, true);
}
export function ParseCSVURL(url) {
    ParseCSV(url, true);
}
export function ParseCSVString(csvString) {
    ParseCSV(csv, false);
}


function ParseCSV(csv, download = false) {
    console.log("Parse CSV:", csv, "(Download:" + download + ")");
    Papa.parse(csv, {
        download: download,
        complete: ParseComplete,
        error: ParseError
    })
}

function ParseComplete(results, file) {
    console.log("Parse complete,", results, file);
}
function ParseError(error, file) {
    console.log("Parse error:", error, file);
}