import * as dataClasses from './dataclasses';

export class LocationsContainer {

    /** Array containing all locations 
     * @type {Location[]}
    */
    locations;

    #dataFieldsLoaded = false;

    constructor() {
        this.locations = [];
        this.maps = {};
    }

    #LoadDataFields(fromLocation) {
        if (this.#dataFieldsLoaded) {
            return;
        }
        this.dataFields = fromLocation.dataFields;
        // add searchname / searchaltnames for pre-calc toLocaleLowerCase versions of names 
        this.dataFields.push('searchname');
        this.dataFields.push('searchaltnames');
        // create maps for data fields 
        for (const field of this.dataFields) {
            this.maps[field] = new Map();
        }
    }

    AddLocation(location, checkForExisting = false) {
        if (location === null) { return; }
        this.#LoadDataFields(location);
        // ensure searchname and searchaltnames present 
        if (location.name !== null &&
            location.searchname === null) {
            location.searchname = location.name;
        }
        if (location.altnames !== null &&
            location.altsearchnames === null) {
            location.altsearchnames = location.altnames;
        }
        // check if location is an existing one 
        if (checkForExisting) {
            let existing = this.GetLocation(
                ...location.dataFields);
            if (existing !== null) {
                existing.AddData(location);
                return;
            }
        }
        // add to array 
        this.locations.push(location);
    }

    GetLocation(...dataFields) {
        let location = this.GetLocationBySearch(dataFields);
        if (location !== null) { return location; }
        if (altnames !== null && altnames.length > 0) {
            altnames.forEach(altName => {
                location = this.GetLocation(altName);
                if (location !== null) {
                    return location;
                }
            });
        }
        return location;
    }
    GetLocationBySearch(searchDataFields) {

        if (this.locations.length == 0 || searchDataFields === null) {
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
                const locationByField = this.locations[field].get(searchDataFields[field]);
                if (locationByField !== undefined) {
                    return locationByField;
                }
            }
        }

        // If no exact match found, try searching alternate names
        if (searchDataFields.searchname !== null) {
            for (const location of this.locations) {
                if (location.altsearchnames) {
                    for (const altName of location.altsearchnames) {
                        if (altName === searchDataFields.searchname) {
                            return location;
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



export const ContinentsContainer = new LocationsContainer();