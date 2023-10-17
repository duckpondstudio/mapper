import * as dataLocation from "./datalocation";

export const targetType = {

    /** two-index Number array representing [latitude,longitude] 
     * @type {string} */
    geoPoint: 'geopoint',

    /** string name of a location formatted for (typically, ASCII) display, eg San Francisco 
     * @see {@link dataLocation.name DataClasses.name}
     * @type {string} */
    stringName: dataLocation.name,
    /** string name of a location formatted for searching (typically via stringUtils.Simplify), eg sanfrancisco 
     * @see {@link dataLocation.searchname DataClasses.searchname}
     * @type {string} */
    searchName: dataLocation.searchname,

    /** 
     * {@link dataLocation.Location Location} reference, 
     * specifically {@link dataLocation.Continent Continent}
     * @see {@link dataLocation.type_Continent DataClasses.type_Continent}
     * @type {string} */
    continent: dataLocation.type_Continent,
    /** 
     * {@link dataLocation.Location Location} reference, 
     * specifically {@link dataLocation.Country Country}
     * @see {@link dataLocation.type_Country DataClasses.type_Country}
     * @type {string} */
    country: dataLocation.type_Country,
    /** 
     * {@link dataLocation.Location Location} reference, 
     * specifically {@link dataLocation.Region Region}
     * @see {@link dataLocation.type_Region DataClasses.type_Region}
     * @type {string} */
    region: dataLocation.type_Region,
    /** 
     * {@link dataLocation.Location Location} reference, 
     * specifically {@link dataLocation.City City}
     * @see {@link dataLocation.type_City DataClasses.type_City}
     * @type {string} */
    city: dataLocation.type_City,

    /** Continent subtype, UN M49 code, three-digit number (saved as string)
     * @type {string} */
    m49: 'm49',
    /** Continent subtype, continent code, two-letter (AF - Africa, etc) 
     * @type {string} */
    ccode: 'ccode',
    /** Country subtype, two-letter country code, ISO 3166-1 alpha-2 
     * @type {string} */
    iso2: 'iso2',
    /** Country subtype, three-letter country code, ISO 3166-1 alpha-3 */
    iso3: 'iso3',
    /** Country subtype, "country code numeric", 3-digit number, ISO 3166-1 numeric (saved as string)
     * 
     * Technically distinct from per-country UN M49 code, tho in practice they are identical (as of Aug 2023)
     * @type {string} */
    ccn: 'ccn',
    /** Country subtype, Federal Information Processing Standard 10-4, two-letter 
     * @type {string} */
    fips: 'fips',
    /** Country subtype, IOC: International Olympic Committe, three-letter 
     * @type {string} */
    cioc: 'cioc',
    /** Region subtype, Admin-1 level codes, two-digit number (string), typically eg states/provinces 
     * @type {string} */
    admin1: 'admin1',
    /** Formatted ISO2 + Admin-1 code joined with a period, eg CA.01 
     * @type {string} */
    iso2a1: 'iso2a1',
    /** City subtype, Admin-2 level codes, typically eg counties/ridings.
     * 
     * Note: Despite being a city subtype, multiple cities can share the same admin2 code.
     * @type {string} */
    admin2: 'admin2',
    //TODO: add regional ISO-3166-2 codes (check for regional M49 codes too)
}

export function GetWith(getType, withType, withValue) {
    if (!IsGetWithValid(getType, withType)) {
        console.error("Cannot get type", getType, 'with type', withType,
            'refer to datagetter.js to see valid types. Returning the input withValue', withValue);
        return withValue;
    }
    if (getType == withType) { return withValue; }

    // convert withValue to its container type 
    if (IsContainerType(withType)) {
        // no need 
    } else {
        if (IsSubTypeOfContinent(withType)) {

        } else if (IsSubTypeOfCountry(withType)) {

        } else if (IsSubTypeOfRegion(withType)) {

        } else if (IsSubTypeOfCity(withType)) {

        } else {
            console.warn('Type', withType, 'recognized as subtype, but not of',
                'continent/country/region/city, investigate check methods, returning withValue');
            return withValue;
        }
    }

    switch (getType) {

        case targetType.geoPoint:
        case targetType.stringName:
        case targetType.searchName:
        case targetType.continent:
        case targetType.m49:
        case targetType.ccode:
        case targetType.country:
        case targetType.iso2:
        case targetType.iso3:
        case targetType.ccn:
        case targetType.fips:
        case targetType.cioc:
        case targetType.region:
        case targetType.admin1:
        case targetType.iso2a1:
        case targetType.city:
        case targetType.admin2:

        default:
            console.error('invalid gettype', getType, ', should be impossible to get here');
            return withValue;
    }
}


//#region Container Type Checks and Conversion 

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
function ConvertSubTypeToContainerType(type) {
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

function ConvertSubTypeValueToContainerTypeValue(type, value) {
    let containerType = ConvertSubTypeToContainerType(type);
    if (containerType == type) { return value; } // identical, just return value 
    switch (value) {
        case targetType.continent:
            break;
        case targetType.country:
            break;
        case targetType.region:
            break;
        case targetType.city:
            break;
    }
}

/**
 * Checks if given type is NOT a container or subtype, eg "geopoint" or "searchname"
 * @param {string} type Type of target, see {@link targetType} 
 * @returns False if container type or subtype, true otherwise 
 */
function IsNonContainerOrSubType(type) {
    switch (type) {
        case type.geoPoint:
        case type.stringName:
        case type.searchName:
            return true;
    }
    return false;
}

//#endregion Container Type Checks and Conversion 


//#region Subtype Checks

/**
 * Is the given type a subtype of another type
 * 
 * (eg, 'm49' returns true, because it's a subtype of 'continent')
 * @param {string} type Type of target, see {@link targetType} 
 * @returns {boolean}
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
 * Is the given type a subtype of continent 
 * @param {string} type Type of target, see {@link targetType} 
 * @param {boolean} [containerTypeIsTrue=true] Should the container type itself return true?
 * @see IsSubType
 * @returns {boolean}
 */
function IsSubTypeOfContinent(type, containerTypeIsTrue = true) {
    switch (type) {
        case targetType.continent:
            return containerTypeIsTrue;
        case targetType.m49:
        case targetType.ccode:
            return true; // continent subtype 
        default:
            return false; // n/a 
    }
}

/**
 * Is the given type a subtype of country  
 * @param {string} type Type of target, see {@link targetType} 
 * @param {boolean} [containerTypeIsTrue=true] Should the container type itself return true?
 * @see IsSubType
 * @returns {boolean}
 */
function IsSubTypeOfCountry(type, containerTypeIsTrue = true) {
    switch (type) {
        case targetType.country:
            return containerTypeIsTrue;
        case targetType.iso2:
        case targetType.iso3:
        case targetType.ccn:
        case targetType.fips:
        case targetType.cioc:
            return true; // country subtype 
        default:
            return false; // n/a 
    }
}

/**
 * Is the given type a subtype of region 
 * @param {string} type Type of target, see {@link targetType} 
 * @param {boolean} [containerTypeIsTrue=true] Should the container type itself return true?
 * @see IsSubType
 * @returns {boolean}
 */
function IsSubTypeOfRegion(type, containerTypeIsTrue = true) {
    switch (type) {
        case targetType.region:
            return containerTypeIsTrue;
        case targetType.admin1:
        case targetType.iso2a1:
            return true; // region subtype 
        default:
            return false; // n/a 
    }
}

/**
 * Is the given type a subtype of city 
 * @param {string} type Type of target, see {@link targetType} 
 * @param {boolean} [containerTypeIsTrue=true] Should the container type itself return true?
 * @see IsSubType
 * @returns {boolean}
 */
function IsSubTypeOfCity(type, containerTypeIsTrue = true) {
    switch (type) {
        case targetType.city:
            return containerTypeIsTrue;
        case targetType.admin2:
            return true; // city subtype 
        default:
            return false;
    }
}

//#endregion Subtype Checks

//#region Validity and Parameter Checks

/**
 * Checks if it's possible to get the given target type {@link getType}
 * with the given target type {@link withType}
 * @param {string} getType Type that you want to GET 
 * @param {string} withType Type WITH WHICH you want to get from 
 * @param {boolean} [arrayOnlyIsTrue=true] Return true if returned value is array?
 * @see {@link targetType} for list of all possible types 
 * @returns {boolean} True if possible to get the getType with the withType 
 */
function IsGetWithValid(getType, withType, arrayOnlyIsTrue = true) {
    if (!IsTargetTypeValid(getType) || !IsTargetTypeValid(withType)) {
        return false; // invalid, return false 
    } else if (getType == withType) {
        return true; // can get self with self, just wasted computation *shrug* 
    }
    switch (getType) {

        case targetType.geoPoint:
            switch (withType) {
                case targetType.stringName:
                case targetType.searchName:
                    return false;// can't get geopoint by name 
            }
            return true;// can get geopoint from all other types 

        case targetType.stringName:
            // can get names from anything except geopoint
            return getType != targetType.geoPoint;

        case targetType.searchName:
            return true; // can get search names from anything including geopoint 

        case targetType.continent:
        case targetType.m49:
        case targetType.ccode:
            return true; // can get continent from anything 

        case targetType.country:
        case targetType.iso2:
        case targetType.iso3:
        case targetType.ccn:
        case targetType.fips:
        case targetType.cioc:
            if (IsSubTypeOfContinent(withType))
                return arrayOnlyIsTrue;
            return true;

        case targetType.region:
        case targetType.admin1:
        case targetType.iso2a1:
            if (IsSubTypeOfContinent(withType) ||
                IsSubTypeOfCountry(withType))
                return arrayOnlyIsTrue;
            return true;

        case targetType.city:
        case targetType.admin2:
            if (IsSubTypeOfContinent(withType) ||
                IsSubTypeOfCountry(withType) ||
                IsSubTypeOfRegion(withType))
                return arrayOnlyIsTrue;
            return true;

        default:
            return false;
    }
}


/**
 * Is the given target type valid? 
 * @param {string} type Type of target, see {@link targetType} 
 * @see {@link targetType} for all valid types 
 * @returns {boolean}
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

/**
 * Does getting the given type with the given type return an array?
 * 
 * (eg, getting 'city' with 'country' returns an array of all cities in that country)
 * @param {string} type Type of target, see {@link targetType} 
 * @returns {boolean}
 */
function DoesGetWithReturnArray(getType, withType) {
    if (!IsTargetTypeValid(getType) || !IsTargetTypeValid(withType)) {
        return false;
    }
    getType = ConvertSubTypeToContainerType(getType);
    withType = ConvertSubTypeToContainerType(withType);
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

//#endregion Validity Checks 
