// internal tool used to create CSV files

import { ParseCSVLocal } from "../utils/parse_csv";
import * as csv from "../utils/write_csv";
import * as stringUtils from '../utils/string';
import * as location from './datalocation';
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
    // return [n,an,sn,san, ccode, m49]
    ParseCSV('continent-codes', location.type_Continent, 1);
}
export function BuildCountries() {
    currentCSV = new CSVData(FileNameCountries, location.Country.prototype.dataFields);
    // return [n,an,sn,san, continent, iso2, iso3, ccn, fips, cioc, latitude, longitude]
    ParseCSV('countryInfo', location.type_Country, 1);
    ParseCSV('countries', location.type_Country, 2);
    ParseCSV('countryaliases', location.type_Country, 3);
    ParseCSV('countryaliases', location.type_Country, 4);
}
export function BuildRegions() {
    currentCSV = new CSVData(FileNameRegions, location.Region.prototype.dataFields);
    // return [n,an,sn,san, continent, country, iso2a1, a1code, a2codes, latitude, longitude]
    ParseCSV('admin-1-codes', location.type_Region, 1, 0);
    ParseCSV('admin-2-codes', location.type_Region, 2, 0);
}
export function BuildCities() {
    currentCSV = new CSVData(FileNameCities, location.City.prototype.dataFields);
    // return [n,an,sn,san, continent, country, a1code, a2code, latitude, longitude]
    ParseCSV('worldcities', location.type_City, 1);
    ParseCSV('geonames-all-cities-with-a-population-500', location.type_City, 2);
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
function BuildLocationArray(type, name, altnames, ...data) {
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
        case location.type_Continent:
            // return [n,an,sn,san, ccode, m49]
            let continent = new location.Continent(name, altnames, null, null, ...data);
            dataContainer.ContinentsContainer.AddLocation(continent);
            break;
        case location.type_Country:
            // return [n,an,sn,san, continent, iso2, iso3, ccn, fips, cioc, latitude, longitude]
            let country = new location.Country(name, altnames, null, null, ...data);
            dataContainer.CountriesContainer.AddLocation(country);
            break;
        case location.type_Region:
            // return [n,an,sn,san, continent, country, iso2a1, a1code, a2codes, latitude, longitude]
            let region = new location.Region(name, altnames, null, null, ...data);
            dataContainer.RegionsContainer.AddLocation(region);
            break;
        case location.type_City:
            // return [n,an,sn,san, continent, country, a1code, a2code, latitude, longitude]
            let city = new location.City(name, altnames, null, null, ...data);
            dataContainer.CitiesContainer.AddLocation(city);
            break;
    }
}
function SaveLocationArray() {
    switch (currentCSV.fileName) {
        case FileNameContinents:
        case location.type_Continent:
            dataContainer.ContinentsContainer.locations.forEach(location => {
                currentCSV.AddRow(location.row);
            });
            break;
        case FileNameCountries:
        case location.type_Country:
            dataContainer.CountriesContainer.locations.forEach(location => {
                currentCSV.AddRow(location.row);
            });
            break;
        case FileNameRegions:
        case location.type_Region:
            dataContainer.RegionsContainer.locations.forEach(location => {
                currentCSV.AddRow(location.row);
            });
            break;
        case FileNameCities:
        case location.type_City:
            dataContainer.CitiesContainer.locations.forEach(location => {
                currentCSV.AddRow(location.row);
            });
            break;
    }
    currentCSV.Save();
}

function ParseCSV(localFileName, type, step, headerRows = 1) {
    csvParseCount++;
    ParseCSVLocal(localFileName, ParseCSVSuccess, ParseCSVError,
        { type: type, step: step, headerRows: headerRows });
}

function ParseCSVSuccess(results, file, callbackParam = null) {
    if (debugDataCreator) {
        console.log("Parsed CSV file:", file, ', Callback Param:', callbackParam);
        console.log("CSV file results:", results);
    }
    switch (callbackParam.type) {
        case location.type_Continent:
            switch (callbackParam.step) {
                case 1:
                    // reading from continent-codes.csv 
                    for (let i = callbackParam.headerRows; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        // return [n,an,sn,san, ccode, m49]
                        BuildLocationArray(
                            callbackParam.type,
                            csvRow[2], // name
                            csvRow[3], // altnames 
                            csvRow[0], // ccode 
                            csvRow[1], // m49
                        );
                    }
                    break;
            }
            break;
        case location.type_Country:
            switch (callbackParam.step) {
                case 1:
                    // reading from countryInfo.csv 
                    for (let i = callbackParam.headerRows; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        // return [n,an,sn,san, continent, iso2, iso3, ccn, fips, cioc, latitude, longitude]
                        let iso2 = csvRow[0]; iso2 = iso2 != null && typeof iso2 === 'string' && iso2.trim().length == 2 ? iso2 : null;
                        let iso3 = csvRow[1]; iso3 = iso3 != null && typeof iso3 === 'string' && iso3.trim().length == 3 ? iso3 : null;
                        let fips = csvRow[3];
                        if (fips == null || fips == '') { fips = csvRow[18]; }// "equivalent fips code"
                        BuildLocationArray(callbackParam.type,
                            csvRow[4], // name
                            null, // altnames 
                            csvRow[8], // continent (code)
                            iso2, // iso2 
                            iso3, // iso3 
                            csvRow[2], // ccn 
                            fips, // fips 
                            null, // cioc 
                            null, // latitude 
                            null, // longitude 
                        );
                    }
                    break;
                case 2:
                    // reading from countries.csv 
                    // return [n,an,sn,san, continent, iso2, iso3, ccn, fips, cioc, latitude, longitude]
                    for (let i = callbackParam.headerRows; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        let lat = '';
                        let long = '';
                        let iso2 = csvRow[3]; iso2 = iso2 != null && typeof iso2 === 'string' && iso2.trim().length == 2 ? iso2 : null;
                        let iso3 = csvRow[5]; iso3 = iso3 != null && typeof iso3 === 'string' && iso3.trim().length == 3 ? iso3 : null;
                        if (!stringUtils.IsNullOrEmptyOrWhitespace(csvRow[18])) {
                            let latLong = csvRow[18].split(',');
                            lat = latLong[0];
                            long = latLong[1];
                        }
                        // TODO: a2 codes are not being converted to an array, but as a single value 
                        BuildLocationArray(callbackParam.type,
                            csvRow[0], // name
                            csvRow[1], // altnames 
                            null, // continent (code)
                            iso2, // iso2 
                            iso3, // iso3 
                            csvRow[4], // ccn 
                            null, // fips 
                            csvRow[6], // cioc 
                            lat, // latitude 
                            long, // longitude 
                        );
                    }
                    break;
                case 3:
                case 4:
                    // reading from countryaliases.csv (3 formatted, 4 unformatted)
                    for (let i = callbackParam.headerRows; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        // return [n,an,sn,san, continent, iso2, iso3, ccn, fips, cioc, latitude, longitude]
                        let iso3 = csvRow[0]; iso3 = iso3 != null && typeof iso3 === 'string' && iso3.trim().length == 3 ? iso3 : null;
                        BuildLocationArray(callbackParam.type,
                            null, // name
                            callbackParam.step == 3 ? csvRow[1] : csvRow[2], // altnames 
                            null, // continent (code)
                            null, // iso2 
                            iso3, // iso3 
                            null, // ccn 
                            null, // fips 
                            null, // cioc 
                            null, // latitude 
                            null, // longitude 
                        );
                    }
            }
            break;
        case location.type_Region:
            switch (callbackParam.step) {
                case 1: // admin-1-codes 
                    for (let i = callbackParam.headerRows; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        let iso2a1array = csvRow[0].split('.');
                        let iso2 = iso2a1array[0];
                        let admin1Code = iso2a1array[1];
                        // return [n,an,sn,san, continent, country, iso2a1, a1code, a2codes, latitude, longitude]
                        BuildLocationArray(callbackParam.type,
                            csvRow[2], // name
                            csvRow[1], // altnames
                            null, // continent
                            iso2, // country
                            csvRow[0], // iso2a1
                            admin1Code, // a1code
                            null, // a2codes
                            null, // latitude
                            null, // longitude
                        );
                    }
                    break;
                case 2: // admin-2-codes 
                    for (let i = callbackParam.headerRows; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        let iso2a1a2array = csvRow[0].split('.');
                        let iso2a1 = csvRow[0].substring(0, csvRow[0].lastIndexOf('.'));
                        let iso2 = iso2a1a2array[0];
                        let admin1Code = iso2a1a2array[1];
                        let admin2Code = iso2a1a2array[2];
                        // return [n,an,sn,san, continent, country, iso2a1, a1code, a2codes, latitude, longitude]
                        BuildLocationArray(callbackParam.type,
                            csvRow[2], // name
                            csvRow[1], // altnames
                            null, // continent
                            iso2, // country
                            iso2a1, // iso2a1
                            admin1Code, // a1code
                            admin2Code, // a2codes
                            null, // latitude
                            null, // longitude
                        );
                    }
                    break;
                case 0: // template
                    for (let i = callbackParam.headerRows; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        // return [n,an,sn,san, continent, country, iso2a1, a1code, a2codes, latitude, longitude]
                        BuildLocationArray(callbackParam.type,
                            null, // name
                            null, // altnames
                            null, // continent
                            null, // country
                            null, // iso2a1
                            null, // a1code
                            null, // a2codes
                            null, // latitude
                            null, // longitude
                        );
                    }
                    break;
            }
            break;
        case location.type_City:
            switch (callbackParam.step) {
                case 1:
                    // worldcities.csv 
                    for (let i = callbackParam.headerRows; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        // return [n,an,sn,san, continent, country, a1code, a2code, latitude, longitude]
                        BuildLocationArray(callbackParam.type,
                            csvRow[1], // name
                            csvRow[0], // altnames
                            null, // continent
                            csvRow[4], // country
                            null, // a1code
                            null, // a2code
                            csvRow[2], // latitude
                            csvRow[3], // longitude
                        );
                    }
                    break;
                case 2: // cities500 (aka cities-workbook, aka geonames-all-cities-with-a-population-500.csv) 
                    for (let i = callbackParam.headerRows; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        // return [n,an,sn,san, continent, country, a1code, a2code, latitude, longitude]
                        let name = csvRow[2];
                        if (stringUtils.IsNullOrEmptyOrWhitespace(name)) {
                            name = csvRow[1];
                        }
                        let altNames = csvRow[1] == csvRow[2] ? csvRow[3] :
                            csvRow[1] + csv.defaultDelim + csvRow[3];
                        if (name == "Cairo") { console.log("CAIRO:",csvRow); }
                        BuildLocationArray(callbackParam.type,
                            name, // name
                            altNames, // altnames
                            null, // continent
                            csvRow[8], // country
                            csvRow[10], // a1code
                            csvRow[11], // a2code
                            csvRow[4], // latitude
                            csvRow[5], // longitude
                        );
                    }
                    break;
                case 0: // template 
                    for (let i = callbackParam.headerRows; i < results.data.length; i++) {
                        let csvRow = results.data[i];
                        // return [n,an,sn,san, continent, country, a1code, a2code, latitude, longitude]
                        BuildLocationArray(callbackParam.type,
                            null, // name
                            null, // altnames
                            null, // continent
                            null, // country
                            null, // a1code
                            null, // a2code
                            null, // latitude
                            null, // longitude
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
        csv.WriteCSV(this.fileName, this.rows);
    }

}