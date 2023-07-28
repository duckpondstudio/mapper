// internal tool used to create CSV files

import { ParseCSVLocal } from "../utils/parse_csv";
import { WriteCSV } from "../utils/write_csv";

let debugDataCreator = true;

let currentCSV;
let csvParseCount = 0;
let csvSuccessCount = 0;

export function BuildContinents() {
    currentCSV = new CSVData('all_continents',
        'name', 'code', 'm49', 'alt_names');
    ParseCSV('continent-codes', ParseCSVSuccess, ParseCSVError, 'continents', 1);
}

function ParseCSV(localFileName, onComplete, onError, type, step) {
    csvParseCount++;
    ParseCSVLocal(localFileName, onComplete, onError, { type: type, step: step });
}

function ParseCSVSuccess(results, file, callbackParam = null) {
    console.log("Parsed CSV Continents file:", file, ', Callback Param:', callbackParam);
    if (debugDataCreator) {
        console.log("CSV file results:", results);
    }
    console.log(1);
    switch (callbackParam.type) {
        case 'continents':
            switch (callbackParam.step) {
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
            break;
        case 'countries':
            switch (callbackParam.step) {
                case 1:
                    break;
            }
            break;
        case 'regions':
            switch (callbackParam.step) {
                case 1:
                    break;
            }
            break;
        case 'cities':
            switch (callbackParam.step) {
                case 1:
                    break;
            }
            break;
    }
    csvSuccessCount++;
    CSVParseDecrement();
}

function ParseCSVError(error, file) {
    console.error("Error", error, "while parsing CSV file", file);
    CSVParseDecrement();
}

function CSVParseDecrement() {
    csvParseCount--;
    if (csvParseCount == 0) {
        // done
        if (csvSuccessCount > 0) {
            currentCSV.Save();
        } else {
            console.error("No successful CSV files were parsed, nothing to write");
        }
    }
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