

/**
 * 
 * @param {string} fileName 
 */
export function TestReadCSV(fileName) {

    let filePath = '../../assets/csv/' + fileName;
    if (!filePath.endsWith('.csv')) {
        filePath += '.csv';
    }

    console.log("Reading CSV file:", filePath);

}