import * as dataClasses from './dataclasses';
import * as stringUtils from '../utils/string';

export class LocationsContainer {

    /** Array containing all locations 
     * @type {dataClasses.Location[]}
    */
    locations;

    #dataFieldsLoaded = false;

    /** Map containing all locations, using their searchname as a key */
    locationMap_ByName;
    /** Array of Maps containing Maps tied to each dataField, 
     * where each Map KEY is a Location's searchname, and 
     * VALUE is that Location's value for the given dataField 
     * 
     * Used to find a location's [dataField]value from an input searchname */
    dataFieldMaps_ValueByName;
    /** Array of Maps containing Maps tied to each dataField, 
     * where each Map KEY is a Location's value for the given
     * dataField (string simplified), VALUE is the searchname 
     * 
     * Use to find a location's searchname from an input [dataField]value */
    dataFieldMaps_NameByValue;

    // TODO: altnames by searchname, searchname by altnames

    constructor(locationType) {

        if (!dataClasses.IsValidLocationType(locationType)) {
            console.error("Invalid locationType", locationType,
                'cannot create new LocationsContainer with invalid type.');
            return;
        }

        this.locations = [];

        this.dataFields = dataClasses.GetDataFields(locationType);

        // create maps for data fields

        this.locationMap_ByName = new Map();

        this.dataFieldMaps_ValueByName = {};
        this.dataFieldMaps_NameByValue = {};
        for (const field of this.dataFields) {
            this.dataFieldMaps_ValueByName[field] = new Map();
            this.dataFieldMaps_NameByValue[field] = new Map();
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
        console.log("adding location:", location[dataClasses.searchname]);
        // note (since name exists, we can take for granted that searchname exists)

        // check if location is an existing one 
        if (checkForExisting) {
            console.log("CHECK FOR EXISTING, name:", location.name);
            let existing = this.GetLocation(location.dataValues);
            console.log("existing:", existing);
            if (existing != null) {
                existing.AddData(location);
                return;
            }
        }

        // add to array 
        this.locations.push(location);
        this.locationMap_ByName.set(
            location[dataClasses.searchname],
            location);

        location.addedToContainer = true;

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
        let name = location.name;
        if (name == null || name == '') {
            console.warn('Cannot update maps with Location with invalid name,',
                'location:', location);
            return;
        }
        name = stringUtils.Simplify(name);
        for (const field of this.dataFields) {
            // iterate through data fields 
            let value = location[field];
            if (value != null && value != '') {
                // found value 
                let valueName = stringUtils.Simplify(value.toString());
                this.dataFieldMaps_ValueByName[field].set(name, value);
                this.dataFieldMaps_NameByValue[field].set(valueName, name);
            }
        }
    }

    GetLocation(dataValues) {


        if (dataValues.length != this.dataFields.length) {
            console.error('Cannot get location, dataValues / fields array length mismatch.',
                'They must be the same length, otherwise we\'re implicitly comparing different location types');
            return null;
        }

        // first search by searchname 
        let searchName = dataValues[2];
        console.log("searchname:", searchName);
        console.log("locbyname has:", this.locationMap_ByName.has(searchName));
        if (this.locationMap_ByName.has(searchName)) {
            // found matching searchname 
            return this.locationMap_ByName.get(searchName);
        }
        console.log("NOT FOUND, locbyname:", this.locationMap_ByName);

        // second, search by altnames (datafields)
        let searchAltNames = dataClasses.Location.AltNamesToArray(dataValues[3]);
        searchAltNames.forEach(altName => {
            if (this.locationMap_ByName.has(altName)) {
                return this.locationMap_ByName.get(altName);
            }
        });

        // third, search by values (datafields index 4+)
        // TODO: search by values 
        // console.error("NOT YET IMPLEMENTED search for location by datafield values");
        return null;

        let location = this.GetLocationBySearch(dataValues);
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