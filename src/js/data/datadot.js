import * as dataClasses from "./dataclasses";
import { DataLocale } from "./datalocale";

/** 
 * A DataDot is one unit of data, containing at least a 
 * longitude and latitude, and whatever data is relevant. 
 * */
export class DataDot {


    /** 
     * Local reference for {@link DataDot.location location} 
     * @type {dataClasses.Location} */
    #_location;
    /** Local reference for value {@link DataDot.value} @type {Number} */
    #_value;

    #_latitude;
    #_longitude;
    #_latLongBypass;

    constructor(value, ...locationData) {
        if (value != null && value != undefined) {
            this.value = value;
        }
        if (locationData != null && locationData != undefined
            && locationData.length > 0) {
            switch (locationData.length) {
                case 0:
                    break;
                case 1:
                    // check first value for location and geopoint
                    if (locationData[0] instanceof dataClasses.Location) {
                        this.location = locationData[0];
                    } else if (DataLocale.IsValidGeoPoint(locationData[0])) {
                        this.SetGeoPoint(locationData[0]);
                    }
                    break;
                case 2:
                    // check first value for location and geopoint
                    if (locationData[0] instanceof dataClasses.Location) {
                        this.location = locationData[0];
                        break;
                    } else if (DataLocale.IsValidGeoPoint(locationData[0])) {
                        this.SetGeoPoint(locationData[0]);
                        break;
                    }
                    // check latitude / longitude 
                    if (DataLocale.IsValidLatitudeLongitude(locationData[0], locationData[1])) {
                        this.SetGeoPoint(locationData);
                    }
                    break;
                default:
                    // check first value for location and geopoint
                    if (locationData[0] instanceof dataClasses.Location) {
                        this.location = locationData[0];
                        break;
                    } else if (DataLocale.IsValidGeoPoint(locationData[0])) {
                        this.SetGeoPoint(locationData[0]);
                        break;
                    }
                    console.warn("Invalid params for DataDot constructor,", locationData);
                    break;
            }

        }
    }

    /**
     * @type {Number}
     */
    get value() {
        if (this.#_value == null) {
            this.value = 0;
        }
        return this.#_value;
    }
    /**
     * @type {Number}
     */
    set value(value) {
        this.#_value = value;
    }

    /**
     * @type {dataClasses.Location}
     */
    get location() {
        if (this.#_location == null) {
            this.location = new DataLocale();
        }
        return this.#_location;
    }
    /**
     * @type {dataClasses.Location}
     */
    set location(location) {
        this.#_location = location;
    }

    SetLatitudeLongitude(latitude, longitude) {
        this.#_latitude = latitude;
        this.#_longitude = longitude;
    }
    SetGeoPoint(geoPoint) {
        this.SetLatitudeLongitude(geoPoint[0], geoPoint[1]);
    }


}