
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
        return this._geoPoint;
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
        this._geoPoint = geoPoint;
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