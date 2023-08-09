import * as dataClasses from "./dataclasses";

export const targetType = {

    geoPoint: 'geopoint',

    stringName: dataClasses.name,
    searchName: dataClasses.searchname,

    continent: dataClasses.type_Continent,
    country: dataClasses.type_Country,
    region: dataClasses.type_Region,
    city: dataClasses.type_City,

    /** Continent subtype,  */
    m49: 'm49',
    /** Continent subtype, continent code, two-letter (AF - Africa, etc) */
    ccode: 'ccode',
    /** Country subtype, two-letter country code, ISO 3166-1 alpha-2 */
    iso2: 'iso2',
    /** Country subtype, three-letter country code, ISO 3166-1 alpha-3 */
    iso3: 'iso3',
    /** Country subtype, "country code numeric", 3-digit number, ISO 3166-1 numeric 
     * 
     * Technically distinct from per-country M49 code, tho in practice they are identical (as of Aug 2023)
    */
    ccn: 'ccn',
    /** Country subtype, Federal Information Processing Standard 10-4, two-letter */
    fips: 'fips',
    /** Country subtype, IOC: International Olympic Committe, three-letter */
    cioc: 'cioc',
    /** Region subtype, Admin-1 level codes, typically eg states/provinces */
    admin1: 'admin1',
    /** Formatted ISO2 + Admin-1 code, eg  */
    iso2a1: 'iso2a1',
    /** City subtype, Admin-2 level codes, typically eg counties/ridings.
     * 
     * Despite being a city subtype, multiple cities can share the same admin2 code.
     */
    admin2: 'admin2',
}

export function GetWith(getType, withType, withValue) {

}

function IsGetWithValid(getType, withType) {
    if (!IsTargetTypeValid(getType) || !IsTargetTypeValid(withType)) {
        return false;
    }
    switch (getType) {
        case targetType.geoPoint:
        case targetType.stringName:
        case targetType.searchName:
        case targetType.continent:
        case targetType.country:
        case targetType.region:
        case targetType.city:
        case targetType.m49:
        case targetType.ccode:
        case targetType.iso2:
        case targetType.iso3:
        case targetType.ccn:
        case targetType.fips:
        case targetType.cioc:
        case targetType.admin1:
        case targetType.iso2a1:
        case targetType.admin2:
        default:
            return false;
    }
}


/**
 * Does getting the given type with the given type return an array?
 * 
 * (eg, getting 'city' with 'country' returns an array of all cities in that country)
 * @param {string} type Type of target, see {@link targetType} 
 * @returns {string}
 */
function DoesGetWithReturnArray(getType, withType) {
    if (!IsTargetTypeValid(getType) || !IsTargetTypeValid(withType)) {
        return false;
    }
    getType = ConvertToContainerType(getType);
    withType = ConvertToContainerType(withType);
    switch (getType) {
        case targetType.continent:
            return false;
        case targetType.country:
            switch (withType) {
                case targetType.continent:
                    return true;
            }
            return false;
        case targetType.region:
            switch (withType) {
                case targetType.continent:
                case targetType.country:
                    return true;
            }
            return false;
        case targetType.city:
            switch (withType) {
                case targetType.continent:
                case targetType.country:
                case targetType.region:
                    return true;
            }
            return false;
        default:
            return false;
    }
}

/**
 * Is the given type a subtype of another type
 * 
 * (eg, 'm49' returns true, because it's a subtype of 'continent')
 * @param {string} type Type of target, see {@link targetType} 
 * @returns {string}
 */
function IsSubType(type) {
    switch (type) {
        case targetType.continent:
        case targetType.country:
        case targetType.region:
        case targetType.city:
            return false; // container type 
        case targetType.m49:
        case targetType.ccode:
            return true; // continent subtype 
        case targetType.iso2:
        case targetType.iso3:
        case targetType.ccn:
        case targetType.fips:
        case targetType.cioc:
            return true; // country subtype 
        case targetType.admin1:
        case targetType.iso2a1:
            return true; // region subtype 
        case targetType.admin2:
            return true; // city subtype 
        case targetType.geoPoint:
        case targetType.stringName:
        case targetType.searchName:
        default:
            return false; // n/a 
    }
}

/**
 * Is the given type a container for other types 
 * 
 * (eg, 'continent' returns true, because it's a container for 'm49' and 'ccode')
 * @param {string} type Type of target, see {@link targetType} 
 * @returns {string}
 */
function IsContainerType(type) {
    switch (type) {
        case targetType.continent:
        case targetType.country:
        case targetType.region:
        case targetType.city:
            return true; // container type 
        default:
            return false; // all other types 
    }
}

/**
 * Returns the relevant type that contains the given type, eg "m49" returns "continent"
 * @param {string} type Type of target, see {@link targetType} 
 * @returns {string}
 */
function ConvertToContainerType(type) {
    switch (type) {
        case targetType.continent:
        case targetType.country:
        case targetType.region:
        case targetType.city:
            return type;
        case targetType.m49:
        case targetType.ccode:
            return targetType.continent;
        case targetType.iso2:
        case targetType.iso3:
        case targetType.ccn:
        case targetType.fips:
        case targetType.cioc:
            return targetType.country;
        case targetType.admin1:
        case targetType.iso2a1:
            return targetType.region;
        case targetType.admin2:
            return targetType.city;
        case targetType.geoPoint:
        case targetType.stringName:
        case targetType.searchName:
        default:
            return type;
    }
}

/**
 * Is the given target type valid? 
 * @param {string} type Type of target, see {@link targetType} 
 * @see {@link targetType}
 * @returns {string}
 */
function IsTargetTypeValid(type) {
    switch (type) {
        case targetType.geoPoint:
        case targetType.stringName:
        case targetType.searchName:
        case targetType.continent:
        case targetType.country:
        case targetType.region:
        case targetType.city:
        case targetType.m49:
        case targetType.ccode:
        case targetType.iso2:
        case targetType.iso3:
        case targetType.ccn:
        case targetType.fips:
        case targetType.cioc:
        case targetType.admin1:
        case targetType.iso2a1:
        case targetType.admin2:
            return true;
        default:
            console.warn("Invalid target type", type,
                ", see datagetter.js/targetType for valid types");
            return false;
    }
}