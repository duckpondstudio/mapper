/** Const ref to download link @type {HTMLAnchorElement} */
const a = document.createElement('a');

export function WriteCSV(...rows) {
    WriteCSVWithDelim(',', ...rows);
}
export function WriteCSVWithDelim(delimiter, ...rows) {

    if (rows == null || rows.length == 0) { return; }

    if (delimiter == null || delimiter == '') {
        console.warn("Invalid delimiter ", delimiter, ", can't be null/empty,",
            'defaulting to \',\' comma');
        delimiter = ',';
    }

    let csvRows = [];
    for (let i = 0; i < rows.length; i++) {
        if (Array.isArray(rows[i])) {
            csvRows.push(rows[i].join(delimiter));
        } else {
            csvRows.push(rows[i]);
        }
    }

    let csvString = csvRows.join('%0A');

    DownloadCSV(csvString);
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
    WriteCSV(...s);
}