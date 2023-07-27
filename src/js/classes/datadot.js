import { DataLocale } from "./datalocale";


/** 
 * A DataDot is one unit of data, containing at least a 
 * longitude and latitude, and whatever data is relevant. 
 * */
export class DataDot {


    /** Local reference for {@link locale this.locale} @type {DataLocale} */
    #_locale;
    /** Local reference for {@link value this.value} @type {Number} */
    #_value;

    constructor(value, ...localeData) {
        if (value != null && value != undefined) {
            this.value = value;
        }
        if (localeData != null && localeData != undefined
            && localeData.length > 0) {
            this.locale = new DataLocale(localeData);
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
     * @type {DataLocale}
     */
    get locale() {
        if (this.#_locale == null) {
            this.locale = new DataLocale();
        }
        return this.#_locale;
    }
    /**
     * @type {DataLocale}
     */
    set locale(locale) {
        this.#_locale = locale;
    }

    SetLatitudeLongitude(latitude, longitude) {
        this.SetGeoPoint([latitude, longitude]);
    }
    SetGeoPoint(geoPoint) {
        this.locale.geoPoint = geoPoint;
    }


}