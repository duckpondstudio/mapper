import * as dataClasses from './dataclasses';
import * as stringUtils from '../utils/string';

export class LocationsContainer {

    /** Array containing all locations 
     * @type {dataClasses.Location[]}
    */
    locations;

    #dataFieldsLoaded = false;

    constructor(locationType) {

        if (!dataClasses.IsValidLocationType(locationType)) {
            console.error("Invalid locationType", locationType,
                'cannot create new LocationsContainer with invalid type.');
            return;
        }

        this.locations = [];

        this.dataFields = dataClasses.GetDataFields(locationType);
        
        // create maps for data fields 
        this.mapsByName = {};
        this.mapsByValue = {};
        for (const field of this.dataFields) {
            this.mapsByName[field] = new Map();
            this.mapsByValue[field] = new Map();
        }
    }

    /**
     * Adds a new Location to this container.
     * 
     * Note: For adding, Location MUST have a 'name' property
     * @param {dataClasses.Location} location 
     * @param {boolean} checkForExisting 
     * @returns 
     */
    AddLocation(location, checkForExisting = true) {

        // nullcheck 
        if (location == null) { return; }
        // ensure name property exists 
        if (location.name == null || location.name == '') {
            console.warn("Can't add Location without a .name property, returning.",
                "Location:", location, "LocationContainer:", this);
            return;
        }
        // note (since name exists, we can take for granted that searchname exists)

        // check if location is an existing one 
        if (checkForExisting) {
            console.log("CHECK FOR EXISTING, name:", location.name);
            let existing = this.GetLocation(
                ...location.dataFields);
            console.log("existing:", existing);
            if (existing != null) {
                existing.AddData(location);
                return;
            }
        }
        
        // add to array 
        this.locations.push(location);

        // update data maps with new location 
        this.UpdateLocationDataMaps(location);
    }

    /**
     * Ensure the given location's data is all up-to-date 
     * in the relevant data maps 
     * @param {dataClasses.Location} location 
     */
    UpdateLocationDataMaps(location) {
        // add to maps 
        for (const field of this.dataFields) {
            // iterate through data fields 
            this.mapsByName[field] = new Map();
            this.mapsByValue[field] = new Map();
        }
    }

    GetLocation(...dataFields) {
        // TODO NOTE: all we're doing currently is passing in fields, not values =_=; 
        let location = this.GetLocationBySearch(dataFields);
        if (location != null) { return location; }
        if (this.altnames != null && this.altnames.length > 0) {
            this.altnames.forEach(altName => {
                location = this.GetLocation(altName);
                if (location != null) {
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

        if (searchDataFields.name != null) {
            searchDataFields.searchname = stringUtils.Simplify(searchDataFields.name);
            searchDataFields.name = null;
        }
        console.log(searchDataFields.name);
        console.log("SDF: ", searchDataFields);
        for (const field of this.dataFields) {
            // skip non-search name/altnames 
            if (field == 'name' || field == 'altnames' || field == 'searchaltnames') {
                continue;
            }
            // check if search data fields 
            // console.log("searching field:", field);

            this.locations.forEach(searchLocation => {
                if (searchLocation[field] != null) {
                    if (searchLocation[field] === searchDataFields[field]) {
                        return searchLocation;
                    }
                }
            });

            // if (searchDataFields[field] != null) {
            //     const locationByField = this.locations[field].get(searchDataFields[field]);
            //     if (locationByField !== undefined) {
            //         return locationByField;
            //     }
            // }
        }

        // If no exact match found, try searching alternate names
        if (searchDataFields.searchname != null) {
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
}

/**
 * Gets the {@link LocationsContainer} for the given {@link dataClasses.Location Location} type
 * @param {string} locationType Location type input, see {@link dataClasses.type_Continent}, 
 * {@link dataClasses.type_Country Country}, etc
 * @returns {LocationsContainer} {@link LocationsContainer} for the relevant location type 
 */
export function GetLocationsContainer(locationType) {
    switch (locationType) {
        case dataClasses.type_Continent: return ContinentsContainer;
        case dataClasses.type_Country: return CountriesContainer;
        case dataClasses.type_Region: return RegionsContainer;
        case dataClasses.type_City: return CitiesContainer;
        case dataClasses.type_Default:
            console.error("Type_Default is an invalid input for GetLocationsContainer, returning null");
            return null;
        default:
            console.error("Invalid unknown input", locationType, "for GetLocationsContainer, returning null");
            return null;
    }
}

export const ContinentsContainer = new LocationsContainer(dataClasses.type_Continent);
export const CountriesContainer = new LocationsContainer(dataClasses.type_Country);
export const RegionsContainer = new LocationsContainer(dataClasses.type_Region);
export const CitiesContainer = new LocationsContainer(dataClasses.type_City);