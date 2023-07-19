
export class Locale {

    constructor(...localeData) {


        this.lat = 0;
        this.long = 0;
        this.geoPoint = [lat, long];

        this.city = null;
        this.region = null;
        this.country = null;
        this.continent = null;

        if (localeData == null)
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
}