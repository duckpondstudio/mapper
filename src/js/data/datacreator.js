// internal tool used to create CSV files

import { ParseCSVLocal } from "../utils/parse_csv";
import { WriteCSV } from "../utils/write_csv";

let debugDataCreator = true;

let currentCSV;
let csvParseCount = 0;

export function BuildContinents() {

    currentCSV = new CSVData('all_continents',
        'name', 'code', 'm49', 'alt_names');

    ParseCSV('continent-codes', ParseCSVContinents, ParseCSVError, 1);

}

function ParseCSV(localFileName, onComplete, onError, callbackParam = null) {
    csvParseCount++;
    ParseCSVLocal(localFileName, onComplete, onError, callbackParam);
}

function ParseCSVContinents(results, file, callbackParam = null) {
    console.log("Parsed CSV Continents file:", file, ', Callback Param:', callbackParam);
    if (debugDataCreator) {
        console.log("CSV file results:", results);
    }
    console.log(1);
    switch (callbackParam) {
        case 1:
            console.log(2);
            for (let i = 1; i < results.data.length; i++) {
                console.log(3 + ',', i);
                currentCSV.AddRow(
                    results.data[i][2],
                    results.data[i][0],
                    results.data[i][1],
                    results.data[i][3]
                );
            }
            break;
    }
    csvParseCount--;
    if (csvParseCount == 0) {
        // done
        currentCSV.Save();
    }
}
function ParseCSVCountries(results, file, callbackParam = null) {

}
function ParseCSVRegions(results, file, callbackParam = null) {

}
function ParseCSVCities(results, file, callbackParam = null) {

}

function ParseCSVError(error, file) {
    console.error("Error", error, "while parsing CSV file", file);
}


class CSVData {

    fileName;
    rowLabels;
    rows;

    constructor(fileName, ...rowLabels) {
        this.fileName = fileName;
        this.rowLabels = rowLabels;
        this.rows = [rowLabels];
    }

    AddRow(...row) {
        console.log("add row", row);
        if (row.length != this.rowLabels.length) {
            if (debugDataCreator) {
                console.warn("Row length", row.length, "does not match rowLabels length",
                this.rowLabels.length, "adding/culling values. RowLabels:", this.rowLabels,
                ", Row:", row);
            }
            row.length = this.rowLabels.length;
        }
        this.rows.push(row);
        console.log("pushed row, rows:", this.rows);
    }

    Save() {
        WriteCSV(this.fileName, this.rows);
    }

}