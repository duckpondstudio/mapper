import * as dataLocation from './datalocation';
import * as stringUtils from '../utils/string';

/** Flag for WIP feature, searching by data field combos (eg longitude AND latitude) */
let searchByDataCombos = false;

export class LocationsContainer {

    /** Array containing all locations 
     * @type {dataLocation.Location[]}
    */
    locations;

    /** Map containing all locations, using their searchname as a key */
    locationMap_ByName;
    /** Array of Maps containing Maps tied to each dataField, 
     * where each Map KEY is a Location's searchname, and 
     * VALUE is that Location's value for the given dataField 
     * 
     * Used to find a location's [dataField]value from an input searchname */
    dataFieldMaps_ValueByName;// TODO: integrate this value (see GetLocation) 
    /** Array of Maps containing Maps tied to each dataField, 
     * where each Map KEY is a Location's value for the given
     * dataField (string simplified), VALUE is the searchname 
     * 
     * Use to find a location's searchname from an input [dataField]value */
    dataFieldMaps_NameByValue;// TODO: integrate this value (see GetLocation) 

    // TODO: altnames by searchname, searchname by altnames

    constructor(locationType) {

        if (!dataLocation.IsValidLocationType(locationType)) {
            console.error("Invalid locationType", locationType,
                'cannot create new LocationsContainer with invalid type.');
            return;
        }

        this.locations = [];

        this.dataFields = dataLocation.GetDataFields(locationType);
        this.searchDataFields = dataLocation.GetSearchDataFields(locationType);
        this.searchDataCombos = dataLocation.GetSearchDataCombos(locationType);

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
     * @param {dataLocation.Location} location 
     * @param {boolean} checkForExisting 
     * @returns 
     */
    AddLocation(location, checkForExisting = true) {


        // nullcheck 
        if (location == null) { return; }
        // check if location is an existing one 
        if (checkForExisting) {
            let existing = this.GetLocation(location.dataValues);
            if (existing != null) {
                existing.AddData(location);
                return;
            }
        }

        // not pre-existing, ensure name property exists 
        if (location.name == null || location.name == '') {
            console.warn("Can't add Location without a .name property, returning.",
                "Location:", location, "LocationContainer:", this);
            return;
        }
        // note (since name exists, we can take for granted that searchname exists)


        // add to array 
        this.locations.push(location);
        this.locationMap_ByName.set(
            location[dataLocation.searchname],
            location);

        location.addedToContainer = true;

        // update data maps with new location 
        this.UpdateLocationDataMaps(location);
    }

    /**
     * Ensure the given location's data is all up-to-date 
     * in the relevant data maps 
     * @param {dataLocation.Location} location 
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
        if (!stringUtils.IsNullOrEmptyOrWhitespace(searchName) &&
            this.locationMap_ByName.has(searchName)) {
            // found matching searchname 
            return this.GetLocationBySearchName(searchName, true);// don't need to re-check 
        }

        // second, search by altnames (datafields)
        if (dataValues[3] != null) {
            let searchAltNames = dataLocation.Location.AltNamesToArray(dataValues[3]);
            searchAltNames.forEach(altName => {
                if (!stringUtils.IsNullOrEmptyOrWhitespace(altName) &&
                    this.locationMap_ByName.has(altName)) {
                    // found matching searchaltname 
                    return this.GetLocationBySearchName(altName, true);// don't need to re-check 
                }
            });
        }

        if (dataValues.length <= 3) {
            // no add'l dataValues, only name/altnames/searchname/searchaltnames return null 
            return null;
        }

        // third, search by values (datafields index 4+)
        for (let i = 4; i < dataValues.length; i++) {
            // confirm valid searchDataField type 
            if (!this.searchDataFields.includes(this.dataFields[i])) { continue; }
            // bypass null values 
            if (dataValues[i] == null) { continue; }
            // simply value for search 
            let simplifiedValue = stringUtils.Simplify(dataValues[i].toString());
            // search relevant data column for the value 
            if (this.dataFieldMaps_NameByValue[this.dataFields[i]].has(simplifiedValue)) {
                // found it! 
                // TODO: collect multiple values, compare for accuracy? how? 
                searchName = this.dataFieldMaps_NameByValue[this.dataFields[i]].get(simplifiedValue);
                // found search name, now ensure location map includes it 
                if (this.locationMap_ByName.has(searchName)) {
                    // found matching searchname 
                    return this.GetLocationBySearchName(searchName, true);// don't need to re-check 
                } else {
                    // not found in location map 
                    console.groupCollapsed("SearchName Error: " + searchName);
                    console.warn("SearchName:", searchName, "was found in dataFieldsMaps_NameByValue map,",
                        "but not in locationMap_ByName map.Investigate. Index:", i);
                    console.warn("dataValues:", dataValues);
                    console.warn("dataFields:", this.dataFields);
                    console.warn("this.dataFieldMaps_NameByValue:", this.dataFieldMaps_NameByValue);
                    console.warn("this.dataFieldMaps_NameByValue[dataFields[i]]:", this.dataFieldMaps_NameByValue[dataFields[i]]);
                    console.warn("this.locationMap_ByName:", this.locationMap_ByName);
                    console.groupEnd();
                    continue;
                }
            }
        }

        // fourth, search by data field combos 
        if (searchByDataCombos) {
            for (let i = 0; i < this.searchDataCombos.length; i++) {
                let combo = this.searchDataCombos[i];
                let found = true;
                combo.forEach(field => {
                    if (found) {
                        let dataFieldIndex = this.dataFields.indexOf(field);
                        if (dataFieldIndex == -1) {
                            found = false;
                        } else {
                            // found index, ensure value exists 
                            if (dataValues[dataFieldIndex] != null && dataValues[dataFieldIndex] != '') {
                                let simplifiedValue = stringUtils.Simplify(dataValues[dataFieldIndex].toString());
                                // search relevant data column for the value 
                                if (this.dataFieldMaps_NameByValue[this.dataFields[dataFieldIndex]].has(simplifiedValue)) {
                                    // found target value, 
                                    searchName = this.dataFieldMaps_NameByValue[this.dataFields[i]].get(simplifiedValue);
                                    if (this.locationMap_ByName.has(searchName)) {
                                    }
                                } else {
                                    found = false;
                                }
                            } else {
                                // dataValue is null/empty 
                                found = false;
                            }
                        }
                    }
                });
                if (!found) {
                    continue;
                }
            }
        }

        return null;
    }
    GetLocationBySearchName(searchName, skipCheck = false) {
        if (skipCheck || this.locationMap_ByName.has(searchName)) {
            // found matching searchname 
            return this.locationMap_ByName.get(searchName);
        }
    }
}

/**
 * Gets the {@link LocationsContainer} for the given {@link dataLocation.Location Location} type
 * @param {string} locationType Location type input, see {@link dataLocation.type_Continent}, 
 * {@link dataLocation.type_Country Country}, etc
 * @returns {LocationsContainer} {@link LocationsContainer} for the relevant location type 
 */
export function GetLocationsContainer(locationType) {
    switch (locationType) {
        case dataLocation.type_Continent: return ContinentsContainer;
        case dataLocation.type_Country: return CountriesContainer;
        case dataLocation.type_Region: return RegionsContainer;
        case dataLocation.type_City: return CitiesContainer;
        case dataLocation.type_Default:
            console.error("Type_Default is an invalid input for GetLocationsContainer, returning null");
            return null;
        default:
            console.error("Invalid unknown input", locationType, "for GetLocationsContainer, returning null");
            return null;
    }
}

export const ContinentsContainer = new LocationsContainer(dataLocation.type_Continent);
export const CountriesContainer = new LocationsContainer(dataLocation.type_Country);
export const RegionsContainer = new LocationsContainer(dataLocation.type_Region);
export const CitiesContainer = new LocationsContainer(dataLocation.type_City);