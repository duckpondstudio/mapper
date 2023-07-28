/** Const ref to download link @type {HTMLAnchorElement} */
const a = document.createElement('a');

/** Default delimiter to use */
const defaultDelim = ',';
/** Used to temporarily replace delimiter in individual entries, 
 * so entry count doesn't get broken */
const delimReplacement = '||**||';
/** Used to signify start/end of a single cell with value containing the delimiter */
const delimQuote = '"';

export function WriteCSV(fileName, rows) {
    WriteCSVWithDelim(fileName, defaultDelim, rows);
}
export function WriteCSVWithDelim(fileName, delimiter, rows) {

    if (rows == null || rows.length == 0) { return; }

    if (delimiter == null || delimiter == '') {
        console.warn("Invalid delimiter ", delimiter, ", can't be null/empty,",
            'defaulting to \',\' comma');
        delimiter = ',';
    }

    let csvRows = [];
    for (let i = 0; i < rows.length; i++) {
        if (Array.isArray(rows[i])) {
            // determine if individual entries contain the delimiter
            let delimFound = false;
            for (let j = 0; j < rows[i].length; j++) {
                if (typeof rows[i][j] === 'string' &&
                    rows[i][j].indexOf(delimiter) >= 0) {
                    delimFound = true;
                    rows[i][j] = delimQuote + rows[i][j].replaceAll(delimiter, delimReplacement) + delimQuote;
                }
            }
            let row = rows[i].join(delimiter);
            if (delimFound) {
                row = row.replaceAll(delimReplacement, delimiter);
            }
            csvRows.push(row);
        } else {
            csvRows.push(rows[i]);
        }
    }

    let csvString = csvRows.join('%0A');

    DownloadCSV(csvString, fileName);
}

/**
 * Download the given string as a file of the given name/extension. 
 * Extremely hacky solution for internally downloading CSVs 
 * @param {string} csvString CSV text to download  
 * @param {string} fileName Filename of downloaded file 
 * @param {string} ext Extension of downloaded file 
 */
function DownloadCSV(csvString, fileName = 'download') {
    DownloadString(csvString, fileName, 'csv');
}

/**
 * Download the given string as a file of the given name/extension. 
 * Extremely hacky solution for internally downloading assets 
 * @param {string} string Input value to download to file  
 * @param {string} fileName Filename of downloaded file 
 * @param {string} ext Extension of downloaded file 
 */
function DownloadString(string, fileName = 'download', ext = 'txt') {
    string = string.replaceAll(' ', '%20');// ensure spaces are properly encoded 
    a.href = 'data:attachment/' + ext + ',' + string;
    a.target = '_blank';
    a.download = fileName + '.' + ext;
    a.click();
}


export function WriteTestCSV() {
    let s = [['id', 'x2', 'rand', 'test']];
    for (let i = 0; i < 20; i++) {
        let r = [i, i * 2, Math.round(Math.random() * 100), 'test'];
        s.push(r);
    }
    WriteCSV(s);
}