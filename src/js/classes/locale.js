/** 
 * Max number of iterations {@link Locale.ParseLocaleData ParseLocaleData} 
 * can self-loop before returning
 * @type {number} */
const localeIterationMax = 10;

export class Locale {

    /** failsafe to ensure ParseLocaleData doesn't eternally loop
     * @type {number} */
    #localeDataIteration;

    constructor(...localeData) {


        this.lat = 0;
        this.long = 0;
        this.geoPoint = [lat, long];

        this.city = null;
        this.region = null;
        this.country = null;
        this.continent = null;

        this.#localeDataIteration = -1;

        this.ParseLocaleData(localeData);
    }

    ParseLocaleData(localeData) {

        // nullcheck
        if (localeData == null) {
            this.#localeDataIteration = -1;
            return;
        }

        // failsafe 
        this.#localeDataIteration++;
        if (this.#localeDataIteration > localeIterationMax) {
            console.warn("ParseLocaleData exceeded iteration failsafe limit", localeIterationMax,
                "investigate:", localeData);
            this.#localeDataIteration = -1;
            return;
        }

        // attempt to parse locale data
        switch (typeof (localeData)) {
            case 'object':

                // object, check if array
                if (Array.isArray(localeData)) {
                    switch (localeData.length) {
                        case 0:
                            break;
                        case 1:
                            switch (typeof (localeData[0])) {
                                case 'object':
                                    // reassign localeData[0] to localeData
                                    // recursive statement - use #localeDataIteration failsafe 
                                    localeData = localeData[0];
                                    this.ParseLocaleData(localeData);
                                    return;
                                case 'string':
                                    ParseInputString(localeData[0]);
                                    break;
                                default:
                                    // can't do anything with a single number, bool, etc, ignore 
                                    break;
                            }
                            break;
                        case 2:
                            // two values - assume lat/long if both numbers or number-parseable strings
                            // if not, cascade to default case 
                            let valid = true;
                            if (valid && typeof (localeData[0] == 'string')) {
                                let parseLat = parseFloat(localeData[0]);
                                if (parseLat != NaN) { localeData[0] = parseLat; }
                                else { valid = false; }
                            }
                            if (valid && typeof (localeData[1] == 'string')) {
                                let parseLong = parseFloat(localeData[1]);
                                if (parseLong != NaN) { localeData[1] = parseLong; }
                                else { valid = false; }
                            }
                            if (valid && typeof (localeData[0]) == 'number' &&
                                typeof (localeData[1]) == 'number') {

                            }
                            break;
                        default:
                            // more values, iterate through all and parse them in order
                            // under the assumption that the order is:
                            // number (latitude), number (longitude), string (geoPoint), 
                            // continent, country, region, city 
                            break;

                    }
                } else {
                    // localeData IS an object, IS NOT an Array 
                }
                break;
            case 'string':
                ParseInputString(localeData);
                break;
            default:
                // can't do anything with a single number, bool, etc, ignore 
                break;
        }

        this.#localeDataIteration = -1;
    }

    ParseInputString(localeString) {

    }


    get lat() {
        return this._lat;
    }
    get long() {
        return this._long;
    }
    get geoPoint() {
        return [this._lat, this._long];
    }
    get city() {
        return this._city;
    }
    get region() {
        return this._region;
    }
    get country() {
        return this._country;
    }
    get continent() {
        return this._continent;
    }

    set lat(lat) {
        this._lat = lat;
    }
    set long(long) {
        this._long = long;
    }
    set geoPoint(geoPoint) {
        if (geoPoint == null) {
            this._lat = null;
            this._long = null;
            return;
        }
        if (!Array.isArray(geoPoint)) {
            console.warn("GeoPoint must be an array, cannot assign",
                geoPoint, "as a value, returning");
            return;
        }
        if (geoPoint.length != 2) {
            console.warn("GeoPoint array must have two values, cannot assign",
                geoPoint, "returning");
        }
        if (
            (geoPoint[0] != null && typeof (geoPoint[0]) !== 'number') ||
            (geoPoint[1] != null && typeof (geoPoint[1] !== 'number'))) {
            console.warn("One or both of GeoPoint's values are invalid,",
                geoPoint, "values must be null or type number, returning");
            return;
        }
        this._lat = geoPoint[0];
        this._long = geoPoint[1];
    }
    set city(city) {
        this._city = city;
    }
    set region(region) {
        this._region = region;
    }
    set country(country) {
        this._country = country;
    }
    set continent(continent) {
        this._continent = continent;
    }

    static IsValidLatitude(latitude) {
        if (latitude == null || typeof (latitude) != 'number' || Number.isNaN(latitude)) {
            return false;
        }
        return latitude >= -90 && latitude <= 90;
    }
    static IsValidLongitude(longitude) {
        if (longitude == null || typeof (longitude) != 'number' || Number.isNaN(longitude)) {
            return false;
        }
        return longitude >= -180 && longitude <= 180;
    }
    static IsValidLatLong(latLong) {
        if (latLong == null || !Array.isArray(latLong) || latLong.length != 2) {
            return false;
        }
        return this.IsValidLatitude(latLong[0]) && this.IsValidLongitude(latLong[1]);
    }
}