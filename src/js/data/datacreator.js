// internal tool used to create CSV files

import { ParseCSVLocal } from "../utils/parse_csv";
import { WriteCSV } from "../utils/write_csv";
import * as stringUtils from '../utils/string';
import * as location from './dataclasses';
import * as dataContainer from './datacontainer';

const FileNameContinents = "ContinentsData";
const FileNameCountries = "CountriesData";
const FileNameRegions = "RegionsData";
const FileNameCities = "CitiesData";

let debugDataCreator = true;

/** If false, do not add empty rows to location array
 * @type {boolean}
 * @see BuildLocationArray
 */
const addEmptyRows = false;
/** If true, remove empty rows from the end of a location array's file export 
 * @type {boolean}
 * @see Save
 */
const removeEmptyRowsFromExportEnd = true;

let currentCSV;
let csvParseCount = 0;
let csvSuccessCount = 0;

export function BuildContinents() {
    currentCSV = new CSVData(FileNameContinents, location.Continent.prototype.dataFields);
    // return ['name', 'code', 'm49', 'altnames'];
    ParseCSV('continent-codes', FileNameContinents, 1);
}
export function BuildCountries() {
    currentCSV = new CSVData(FileNameCountries, location.Country.prototype.dataFields);
    // return ['name', 'continent', 'iso2', 'iso3', 'ccn', 'fips', 'cioc', 'continent', 'latitude', 'longitude', 'altnames'];
    ParseCSV('countryInfo', FileNameCountries, 1);
}
export function BuildRegions() {
    currentCSV = new CSVData(FileNameRegions, location.Region.prototype.dataFields);
    // return ['name', 'continent', 'country', 'a1code', 'a2codes', 'latitude', 'longitude', 'altnames'];
}
export function BuildCities() {
    currentCSV = new CSVData(FileNameCities, location.City.prototype.dataFields);
    // return ['name', 'continent', 'country', 'a1code', 'a2code', 'latitude', 'longitude', 'altnames'];
}

/**
 * Adds the following data to a list of objects containing relevant 
 * location data. Allows us to combine multiple data sources from different 
 * sheets, without re-generating the same data.
 * (eg one sheet has City Name and Country, another sheet has City Name and
 * Admin1Code, we put both into one object and convert that object to a row)
 * @param {string} type 
 * @param  {...string} data 
 */
function BuildLocationArray(type, ...data) {
    if (!addEmptyRows) {
        let emptyRow = true;
        for (let i = 0; i < data.length; i++) {
            if (!stringUtils.IsNullOrEmptyOrWhitespace(data[i])) {
                emptyRow = false;
                break;
            }
        }
        if (emptyRow) {
            return;
        }
    }
    switch (type) {
        case FileNameContinents:
            // ['name', 'code', 'm49', 'altnames'];
            let continent = new location.Continent(...data);
            dataContainer.ContinentsContainer.AddLocation(continent);
            break;
        case FileNameCountries:
            // ['name', 'continent', 'iso2', 'iso3', 'ccn', 'fips', 'cioc', 'continent', 'latitude', 'longitude', 'altnames'];
            let country = new location.Country(...data);
            dataContainer.CountriesContainer.AddLocation(country);
            break;
        case FileNameRegions:
            // ['name', 'continent', 'country', 'a1code', 'a2codes', 'latitude', 'longitude', 'altnames'];
            let region = new location.Region(...data);
            dataContainer.RegionsContainer.AddLocation(region);
            break;
        case FileNameCities:
            // ['name', 'continent', 'country', 'a1code', 'a2code', 'latitude', 'longitude', 'altnames'];
            let city = new location.City(...data);
            dataContainer.CitiesContainer.AddLocation(city);
            break;
    }
}
function SaveLocationArray() {
    switch (currentCSV.fileName) {
        case FileNameContinents:
            dataContainer.ContinentsContainer.locations.forEach(location => {
                currentCSV.AddRow(location.row);
            });
            break;
        case FileNameCountries:
            dataContainer.CountriesContainer.locations.forEach(location => {
                currentCSV.AddRow(location.row);
            });
            break;
        case FileNameRegions:
            dataContainer.RegionsContainer.locations.forEach(location => {
                currentCSV.AddRow(location.row);
            });
            break;
        case FileNameCities:
            dataContainer.CitiesContainer.locations.forEach(location => {
                currentCSV.AddRow(location.row);
            });
            break;
    }
    currentCSV.Save();
}

function ParseCSV(localFileName, type, step) {
    csvParseCount++;
    ParseCSVLocal(localFileName, ParseCSVSuccess, ParseCSVError, { type: type, step: step });
}

function ParseCSVSuccess(results, file, callbackParam = null) {
    if (debugDataCreator) {
        console.log("Parsed CSV file:", file, ', Callback Param:', callbackParam);
        console.log("CSV file results:", results);
    }
    switch (callbackParam.type) {
        case FileNameContinents:
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
        case FileNameCountries:
            switch (callbackParam.step) {
                case 1:
                    for (let i = 1; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        // ['name', 'continent', 'iso2', 'iso3', 'ccn', 'fips', 'cioc', 'continent', 'latitude', 'longitude', 'altnames'];
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
        case FileNameRegions:
            switch (callbackParam.step) {
                case 1:
                    for (let i = 1; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        // ['name', 'continent', 'country', 'a1code', 'a2codes', 'latitude', 'longitude', 'altnames'];
                        currentCSV.AddRow(
                            // csvRow[2], // name 
                        );
                    }
                    break;
            }
            break;
        case FileNameCities:
            switch (callbackParam.step) {
                case 1:
                    for (let i = 1; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        // ['name', 'continent', 'country', 'a1code', 'a2code', 'latitude', 'longitude', 'altnames'];
                        currentCSV.AddRow(
                            csvRow
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

    /**
     * Add the given values to the CSV to write out as a row
     * @param  {...any} row Values, passed in as an ...array
     */
    AddRowValues(...row) {
        this.AddRow(row);
    }
    /**
     * Add the given array to the CSV to write out as values 
     * @param {*[]} row Array of values to write as a row of the CSV 
     */
    AddRow(row) {
        console.trace();
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
        if (this.rows == null) {
            this.rows = [];
        }
        // clear out null end rows 
        if (removeEmptyRowsFromExportEnd) {
            if (this.rows.length > 0) {
                let length = this.rows.length;
                for (let i = this.rows.length - 1; i >= 0; i--) {
                    let foundNonNullEntry = false;
                    for (let j = 0; j < this.rows[j].length; j++) {
                        if (!stringUtils.IsNullOrEmptyOrWhitespace(this.rows[i][j])) {
                            foundNonNullEntry = true;
                            break;
                        }
                    };
                    if (foundNonNullEntry) {
                        break;
                    }
                    length--;
                }
                // update length, remove excessive entries 
                this.rows.length = length;
            }
        }
        WriteCSV(this.fileName, this.rows);
    }

}