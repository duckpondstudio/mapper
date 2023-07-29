import * as location from './dataclasses';

export class Continents {

    constructor() {
        this.continents = [];
        this.maps = {};
        this.dataFields = location.Continent.dataFields;
        // add searchname / searchaltnames for pre-calc toLocaleLowerCase versions of names 
        this.dataFields.push('searchname');
        this.dataFields.push('searchaltnames');
        // create maps for data fields 
        for (const field of this.dataFields) {
            this.maps[field] = new Map();
        }
    }

    AddContinent(continent, checkForExisting = false) {
        if (checkForExisting) {
            // TODO: check for existing continent 
            console.log("TODO");
        }
        // new continent, ensure searchname and searchaltnames present 
        if (continent.name !== null &&
            continent.searchname === null) {
            continent.searchname = continent.name;
        }
        if (continent.altnames !== null &&
            continent.altsearchnames === null) {
            continent.altsearchnames = continent.altnames;
        }
        // add to array 
        this.continents.push(continent);
    }

    // return ['name', 'code', 'm49', 'altnames'];
    GetContinent(name = null, code = null, m49 = null) {
        if (name !== null) {
            name = name.toLocaleLowerCase();
        }
        this.GetContinentBySearch({ searchname: name, code: code, m49: m49 });
    }
    GetContinentBySearch(searchDataFields) {

        if (this.continents.length == 0 || searchDataFields === null) {
            return null;
        }

        if (!this.dataFields.some((field) => searchDataFields[field] !== null)) {
            return null;
        }

        if (searchDataFields.name !== null) {
            searchDataFields.searchname = searchDataFields.name.toLocaleLowerCase();
            searchDataFields.name = null;
        }

        for (const field of this.dataFields) {
            // skip non-search name/altnames 
            if (field == 'name' || field == 'altnames' || field == 'searchaltnames') {
                continue;
            }
            // check if search data fields 
            if (searchDataFields[field] !== null) {
                const continentByField = this.continents[field].get(searchDataFields[field]);
                if (continentByField !== undefined) {
                    return continentByField;
                }
            }
        }

        // If no exact match found, try searching alternate names
        if (searchDataFields.searchname !== null) {
            for (const continent of this.continents) {
                if (continent.altsearchnames) {
                    for (const altName of continent.altsearchnames) {
                        if (altName === searchDataFields.searchname) {
                            return continent;
                        }
                    }
                }
            }
        }
    }




    //#region MAIN
    // MAIN: returns name
    // (eg GetContinentByX)

    //#endregion MAIN


    //#region SUB
    // SUB: returns non-name info
    // (eg GetContinentM49Code)

    //#endregion SUB

    //#endregion Continents

}


//#region MAIN
// MAIN: returns name
// (eg GetCountryByX)

//#endregion MAIN


//#region SUB
// SUB: returns non-name info
// (eg GetCountryIso3Code)

//#endregion SUB

//#endregion Countries




//#region Regions (Admin 1)

//#region MAIN
// MAIN: returns name
// (eg GetRegionByX)

//#endregion MAIN


//#region SUB
// SUB: returns non-name info
// (eg GetRegionA1Code)

//#endregion SUB

//#endregion Regions (Admin 1)




//#region Cities

//#region MAIN
// MAIN: returns name
// (eg GetCityByX)

//#endregion MAIN


//#region SUB
// SUB: returns non-name info
// (eg GetCityAdmin2Code)

//#endregion SUB

//#endregion Cities
