// internal tool used to create CSV files

import { ParseCSVLocal } from "../utils/parse_csv";
import { WriteCSV } from "../utils/write_csv";
import * as location from './dataclasses';

let debugDataCreator = true;

let currentCSV;
let csvParseCount = 0;
let csvSuccessCount = 0;

export function BuildContinents() {
    currentCSV = new CSVData('ContinentsData', location.Continent.dataFields);
    // return ['name', 'code', 'm49', 'altnames'];
    ParseCSV('continent-codes', 'continents', 1);
}
export function BuildCountries() {
    currentCSV = new CSVData('CountriesData', location.Country.dataFields);
    // return ['name', 'continent', 'iso2', 'iso3', 'ccn', 'fips', 'cioc', 'continent', 'latitude', 'longitude', 'altnames'];
    ParseCSV('countryInfo', 'countries', 1);
}
export function BuildRegions() {
    currentCSV = new CSVData('RegionsData', location.Region.dataFields);
    // return ['name', 'continent', 'country', 'a1code', 'a2codes', 'latitude', 'longitude', 'altnames'];

}
export function BuildCities() {
    currentCSV = new CSVData('CitiesData', location.City.dataFields);
    // return ['name', 'continent', 'country', 'a1code', 'a2code', 'latitude', 'longitude', 'altnames'];
}

function BuildLocationArray(type, ...data) {
    switch (type) {
        case 'continents':
            break;
        case 'countries':
            break;
        case 'regions':
            break;
        case 'cities':
            break;
    }
}
function SaveLocationArray() {
    // currentCSV.AddRow(
    currentCSV.Save();
}

function ParseCSV(localFileName, type, step) {
    csvParseCount++;
    ParseCSVLocal(localFileName, ParseCSVSuccess, ParseCSVError, { type: type, step: step });
}

function ParseCSVSuccess(results, file, callbackParam = null) {
    console.log("Parsed CSV Continents file:", file, ', Callback Param:', callbackParam);
    if (debugDataCreator) {
        console.log("CSV file results:", results);
    }
    switch (callbackParam.type) {
        case 'continents':
            switch (callbackParam.step) {
                case 1:
                    for (let i = 1; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        // ['name', 'code', 'm49', 'altnames'];
                        BuildLocationArray(callbackParam.type,
                            results.data[i][2], // name
                            results.data[i][0], // code 
                            results.data[i][1], // m49
                            results.data[i][3], // altnames 
                        );
                    }
                    break;
            }
            break;
        case 'countries':
            switch (callbackParam.step) {
                case 1:
                    for (let i = 1; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        // 'name', 'continent', 'iso2', 'iso3', 'ccn', 'fips', 'cioc', 'continent', 'latitude', 'longitude', 'altnames'];
                        let fips = csvRow[3];
                        if (fips == null || fips == '') { fips = csvRow[18]; }// "equivalent fips code"
                        BuildLocationArray(callbackParam.type,
                            csvRow[4], // name
                            csvRow[8], // continent (code)
                            csvRow[0], // iso2 
                            csvRow[1], // iso3 
                            csvRow[2], // ccn 
                            fips, // fips 
                            null, // cioc 
                            null, // latitude 
                            null, // longitude 
                            null, // altnames 
                        );
                    }
                    break;
            }
            break;
        case 'regions':
            switch (callbackParam.step) {
                case 1:
                    for (let i = 1; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        currentCSV.AddRow(
                            // csvRow[2], // name 
                        );
                    }
                    break;
            }
            break;
        case 'cities':
            switch (callbackParam.step) {
                case 1:
                    for (let i = 1; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        currentCSV.AddRow(
                            // csvRow[2], // name 
                        );
                    }
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
            SaveLocationArray();
        } else {
            console.error("No successful CSV files were parsed, nothing to write");
        }
    }
}


class CSVData {

    fileName;
    rowLabels;
    rows;

    constructor(fileName, rowLabels) {
        this.fileName = fileName;
        this.rowLabels = rowLabels;
        this.rows = [rowLabels];
    }

    AddRow(...row) {
        if (row.length != this.rowLabels.length) {
            if (debugDataCreator) {
                console.warn("Row length", row.length, "does not match rowLabels length",
                    this.rowLabels.length, "adding/culling values. RowLabels:", this.rowLabels,
                    ", Row:", row);
            }
            row.length = this.rowLabels.length;
        }
        this.rows.push(row);
    }

    Save() {
        WriteCSV(this.fileName, this.rows);
    }

}