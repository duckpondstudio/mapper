export class Continent {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    static get dataFields() {
        return ['name', 'code', 'm49', 'altnames'];
    }

}
export class Country {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    static get dataFields() {
        return ['name', 'continent', 'iso2', 'iso3', 'ccn', 'cioc', 'continent', 'latitude', 'longitude', 'altnames'];
    }
}
export class Region {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    static get dataFields() {
        return ['name', 'continent', 'country', 'a1code', 'a2codes', 'latitude', 'longitude', 'altnames'];
    }
}
export class City {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    static get dataFields() {
        return ['name', 'continent', 'country', 'a1code', 'a2code', 'latitude', 'longitude', 'altnames'];
    }
}