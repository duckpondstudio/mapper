// import * as dataClasses from "./dataclasses";

// /** 
//  * Max number of iterations {@link DataLocale.ParseLocaleData ParseLocaleData} 
//  * can self-loop before returning
//  * @type {number} */
// const localeIterationMax = 10;

// let debugInvalidLocaleData = false;

// /** 
//  * @deprecated this is replaced by {@link dataClasses.Location Location}
//  */
// export class DataLocale {

//     /** failsafe to ensure ParseLocaleData doesn't eternally loop
//      * @type {number} */
//     #localeDataIteration;

//     constructor(...localeData) {


//         this.latitude = 0;
//         this.longitude = 0;
//         this.geoPoint = [this.latitude, this.longitude];

//         this.city = null;
//         this.region = null;
//         this.country = null;
//         this.continent = null;

//         this.#localeDataIteration = -1;

//         this.ParseLocaleData(localeData);
//     }

//     ParseLocaleData(localeData) {

//         // nullcheck
//         if (localeData == null) {
//             this.#localeDataIteration = -1;
//             return;
//         }

//         // failsafe 
//         this.#localeDataIteration++;
//         if (this.#localeDataIteration > localeIterationMax) {
//             console.warn("ParseLocaleData exceeded iteration failsafe limit", localeIterationMax,
//                 "investigate:", localeData);
//             this.#localeDataIteration = -1;
//             return;
//         }

//         // attempt to parse locale data
//         switch (typeof (localeData)) {
//             case 'object':

//                 // object, check if array
//                 if (Array.isArray(localeData)) {
//                     switch (localeData.length) {
//                         case 0:
//                             // nothing, ignore 
//                             break;
//                         case 1:
//                             switch (typeof (localeData[0])) {
//                                 case 'object':
//                                     // reassign localeData[0] to localeData
//                                     // recursive statement - use #localeDataIteration failsafe 
//                                     localeData = localeData[0];
//                                     this.ParseLocaleData(localeData);
//                                     return;
//                                 case 'string':
//                                     ParseInputString(localeData[0]);
//                                     break;
//                                 default:
//                                     // can't do anything with a single number, bool, etc, ignore 
//                                     if (debugInvalidLocaleData) {
//                                         console.warn("Cannot parse invalid localeData[0]:", localeData);
//                                     }
//                                     break;
//                             }
//                             break;
//                         case 2:
//                             // two values - assume lat/long, aka geoPoint, if both numbers or number-parseable strings
//                             // if not, cascade to default case 
//                             let valid = true;
//                             if (valid && typeof (localeData[0] == 'string')) {
//                                 let parseLat = parseFloat(localeData[0]);
//                                 if (parseLat != NaN) { localeData[0] = parseLat; }
//                                 else { valid = false; }
//                             }
//                             if (valid && typeof (localeData[1] == 'string')) {
//                                 let parseLong = parseFloat(localeData[1]);
//                                 if (parseLong != NaN) { localeData[1] = parseLong; }
//                                 else { valid = false; }
//                             }
//                             if (valid && IsValidGeoPoint(localeData)) {
//                                 // got it, assign geoPoint 
//                                 this.geoPoint = localeData;
//                                 this.#localeDataIteration = -1;
//                                 return;
//                             }
//                         // don't break, fall to default
//                         default:
//                             // more values, iterate through all and parse them in order
//                             // under the assumption that the order is:
//                             // number (latitude), number (longitude), string (geoPoint), 
//                             // continent, country, region, city 
//                             let foundLatitude = false;
//                             let foundLongitude = false;
//                             for (let i = 0; i < localeData.length; i++) {
//                                 // nullcheck 
//                                 if (localeData[i] == null) { continue; }
//                                 // check for lat/long/geoPoint
//                                 if (!foundLatitude || !foundLongitude) {
//                                     if (!foundLatitude && !foundLongitude &&
//                                         IsValidGeoPoint(localeData[i])) {
//                                         this.geoPoint = localeData[i];
//                                         foundLatitude = foundLongitude = true;
//                                         continue;
//                                     }
//                                     if (!foundLatitude && IsValidLatitude(localeData[i])) {
//                                         this.latitude = localeData[i];
//                                         foundLatitude = true;
//                                         continue;
//                                     }
//                                     if (!foundLongitude && IsValidLongitude(localeData[i])) {
//                                         this.longitude = localeData[i];
//                                         foundLongitude = true;
//                                         continue;
//                                     }
//                                 }
//                                 // check for object/string parse info 
//                                 switch (typeof (localeData[i])) {
//                                     case 'object':
//                                         this.ParseLocaleObject(localeData[i]);
//                                         continue;
//                                     case 'string':
//                                         this.ParseInputString(localeData[i]);
//                                         continue;
//                                     default:
//                                         if (debugInvalidLocaleData) {
//                                             console.warn("Cannot parse invalid localeData array value, continuing, value:",
//                                                 localeData[i], 'index:', i, ', localeData:', localeData);
//                                         }
//                                         continue;
//                                 }
//                             }
//                             break;

//                     }
//                 } else {
//                     // localeData IS an object, IS NOT an Array 
//                     this.ParseLocaleObject(localeObject);
//                 }
//                 break;
//             case 'string':
//                 ParseInputString(localeData);
//                 break;
//             default:
//                 // can't do anything with a single number, bool, etc, ignore 
//                 if (debugInvalidLocaleData) {
//                     console.warn("Cannot parse invalid localeData:", localeData);
//                 }
//                 break;
//         }

//         this.#localeDataIteration = -1;
//     }

//     ParseLocaleObject(localeObject) {
//         // TODO: parse object, check for GeoPoint, then potential key:value pairs 
//     }
//     ParseInputString(localeString) {
//         // TODO: parse string, checking for continent/country/city name
//     }


//     get latitude() {
//         return this._latitude;
//     }
//     get longitude() {
//         return this._longitude;
//     }
//     get geoPoint() {
//         return [this._latitude, this._longitude];
//     }
//     get city() {
//         return this._city;
//     }
//     get region() {
//         return this._region;
//     }
//     get country() {
//         return this._country;
//     }
//     get continent() {
//         return this._continent;
//     }

//     set latitude(latitude) {
//         this._latitude = latitude;
//     }
//     set longitude(longitude) {
//         this._longitude = longitude;
//     }
//     set geoPoint(geoPoint) {
//         if (geoPoint == null) {
//             this._latitude = null;
//             this._longitude = null;
//             return;
//         }
//         if (!Array.isArray(geoPoint)) {
//             console.warn("GeoPoint must be an array, cannot assign",
//                 geoPoint, "as a value, returning");
//             return;
//         }
//         if (geoPoint.length != 2) {
//             console.warn("GeoPoint array must have two values, cannot assign",
//                 geoPoint, "returning");
//         }
//         if (
//             (geoPoint[0] != null && typeof (geoPoint[0]) !== 'number') ||
//             (geoPoint[1] != null && typeof (geoPoint[1] !== 'number'))) {
//             console.warn("One or both of GeoPoint's values are invalid,",
//                 geoPoint, "values must be null or type number, returning");
//             return;
//         }
//         this._latitude = geoPoint[0];
//         this._longitude = geoPoint[1];
//     }
//     set city(city) {
//         this._city = city;
//     }
//     set region(region) {
//         this._region = region;
//     }
//     set country(country) {
//         this._country = country;
//     }
//     set continent(continent) {
//         this._continent = continent;
//     }

//     static IsValidLatitude(latitude) {
//         if (latitude == null || typeof (latitude) != 'number' || Number.isNaN(latitude)) {
//             return false;
//         }
//         return latitude >= -90 && latitude <= 90;
//     }
//     static IsValidLongitude(longitude) {
//         if (longitude == null || typeof (longitude) != 'number' || Number.isNaN(longitude)) {
//             return false;
//         }
//         return longitude >= -180 && longitude <= 180;
//     }
//     static IsValidLatitudeLongitude(latitude, longitude) {
//         return this.IsValidLatitude(latitude) && this.IsValidLongitude(longitude);
//     }
//     static IsValidGeoPoint(geoPoint) {
//         if (geoPoint == null || !Array.isArray(geoPoint) || geoPoint.length != 2) {
//             return false;
//         }
//         return this.IsValidLatitude(geoPoint[0]) && this.IsValidLongitude(geoPoint[1]);
//     }
// }