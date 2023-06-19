
import geoEarth from './json/ne_50m_land.geojson';
import geoOcean from './json/ocean_feature.geojson';

// GeoJSON geo-types per the GeoJSON spec at https://rdrr.io/cran/geoops/man/geojson-types.html June 18 2023
/** Collection geo-types (non-singular-objects) in GeoJSON format (generally containing collections), lowercase */
const geoJsonCollections = ['featurecollection', 'geometrycollection'];
/** Feature object geo-types (found in a featurecollection) in GeoJSON format, lowercase */
const geoJsonFeatureTypes = ['feature'];
/** Geometry object geo-types (found in a geometrycollection) in GeoJSON format, lowercase */
const geoJsonGeometryTypes = ['point', 'linestring', 'polygon', 'multipoint', 'multilinestring', 'multipolygon'];
/** All single object geo-types (non-collections) in GeoJSON format, lowercase */
const geoJsonObjectTypes = [...geoJsonFeatureTypes, ...geoJsonGeometryTypes];
/** All geo-types in the GeoJSON spec, lowercase */
const geoJsonTypes = [...geoJsonCollections, ...geoJsonObjectTypes];



export function GetGeoJSON() {



    // console.log("json: " + geoEarth.toString());

    console.log('geoOcean');
    console.log(Object.keys(geoOcean));

    console.log(geoOcean['type']);
    console.log(geoOcean['features']);
    console.log(typeof geoOcean['features']);
    console.log('is array: ', Array.isArray(geoOcean['features']));
    console.log(geoOcean['features'].length);


    console.log(typeof geoOcean);
    console.log(typeof geoOcean === 'object');
    let t = '';
    console.log(typeof t);
    console.log(typeof t == 'string');
    console.log(typeof t === 'string');
    console.log(typeof t == 'object');
    console.log(typeof t === 'object');


    function CombineGeoJSON(...geo) {

        let combinedType = '';
        let featureCollection = [];
        let geoCollection = [];

        // determine first type of collection
        for (let i = 0; i < geo.length; i++) {

            // first, THOROUGH type validation to ensure we validly combine different GeoJSON files.
            // fastidious overengineering? No, dangit, we want it to just work regardless of user competency, 
            // if the files are parsably valid! We're going beyond user-friendly - we're going user-empathetic <3 

            /** shorthand index container showing full size, index/length (eg 3/8) */
            let ix = i + '/' + geo.length;

            // nullcheck 
            if (geo[i] == null) { continue; }
            // check if object type 
            if (typeof geo[i] !== 'object') {
                // check if stringified json 
                if (typeof geo[i] === 'string') {
                    try {
                        geo[i] = JSON.parse(geo[i]);
                    } catch {
                        console.warn("Failed to parse string as valid JSON, ",
                            "cannot combine GeoJSON, skipping. Index %s, string: %s", ix, geo[i]);
                        continue;
                    }
                } else {
                    // not object, not string, ignore 
                    console.warn("Cannot combine GeoJSON with non-JSON property, ",
                        'neither an object nor a JSON - parsable string.skipping.Index ', ix, ", string: ", geo[i]);
                    continue;
                }
            }
            // ensure geo keys are lowercase for string comparison 
            geo = ObjectKeysToLower(geo);
            // ensure object has key 'type'
            let keys = Object.keys(geo);
            if (!keys.contains('type')) {
                // check if it contains a features or geometries key, from which we can infer the type
                let hasFeatures = keys.contains('features');
                // ensure features IS an array
                if (hasFeatures && !Array.isArray(geo[i]['features'])) {
                    console.warn('GeoJSON object at index ', ix, ' has a features object but it is NOT an array, invalid. ',
                        'Typeof: ', typeof geo[i]['features'], ' value: ', geo[i]['features']);
                    hasFeatures = false;
                }
                let hasGeometries = keys.contains('geometries');
                // ensure geometries IS an array
                if (hasGeometries && !Array.isArray(geo[i]['geometries'])) {
                    console.warn('GeoJSON object at index ', ix, ' has a geometries object but it is NOT an array, invalid. ',
                        'Typeof: ', typeof geo[i]['geometries'], ' value: ', geo[i]['geometries']);
                    hasGeometries = false;
                }
                if (hasFeatures && hasGeometries) {
                    // has both features AND geometries, compare length
                    if (geo[i]['features'].length == geo[i]['geometries'].length) {
                        // same length, default to features 
                        if (geo[i]['features'].length == 0) {
                            // neither have any values 
                            console.warn('GeoJSON to be combined has both features AND geometries but no specified type, ',
                                'however neither have any values. Check to ensure your .geojson files are properly formatted. ',
                                'Cannot combine this file, skipping. Index ', ix, ', object: ', geo[i]);
                            continue;
                        } else {
                            // both have same # of values 
                            console.warn('GeoJSON to be combined has both features AND geometries but no specified type, however ',
                                'both have the same number of values. Defaulting to type featurecollection, adding type key. ',
                                'Check to ensure your .geojson files are properly formatted. Index ', ix, ', object: ', geo[i]);
                            geo[i]['type'] = 'featurecollection';
                        }
                    } else if (geo[i]['features'].length > geo[i]['geometries'].length) {
                        // has more features than geometries 
                        console.warn("GeoJSON to be combined has both features AND geometries but no specified type, however ",
                            'it has more features than geometries. Assigning type featurecollection, adding type key. ',
                            'Check to ensure your .geojson files are properly formatted. ',
                            'Index ', ix, ', object: ', geo[i], ', features length: ', geo[i]['features'].length,
                            ', geometries length: ', geo[i]['geometries'].length);
                        geo[i]['type'] = 'featurecollection';
                    } else {
                        // has more geometries than features 
                        console.warn("GeoJSON to be combined has both features AND geometries but no specified type, however ",
                            'it has more geometries than features. Assigning type geometrycollection, adding type key. ',
                            'Check to ensure your .geojson files are properly formatted. ',
                            'Index ', ix, ', object: ', geo[i], ', features length: ', geo[i]['features'].length,
                            ', geometries length: ', geo[i]['geometries'].length);
                        geo[i]['type'] = 'geometrycollection';
                    }
                } else if (hasFeatures) {
                    // featurecollection type
                    console.warn('GeoJSON object at index ', ix, ' does not have a type, but it DOES have features. ',
                        'Assigning type featurecollection, adding type key. Check to ensure your .geojson files are properly formatted.');
                    geo[i]['type'] = 'featurecollection';
                } else if (hasGeometries) {
                    // geometrycollection type
                    console.warn('GeoJSON object at index ', ix, ' does not have a type, but it DOES have geometries. ',
                        'Assigning type geometrycollection, adding type key. Check to ensure your .geojson files are properly formatted.');
                    geo[i]['type'] = 'geometrycollection';
                } else {
                    // invalid type 
                    console.warn('GeoJSON object at index ', ix, ' does not have a type parameter, nor does it have ',
                        'features or geometries to parse. Not a valid GeoJSON object. Check your .geojson file/formatting. ',
                        'Cannot combine this file, skipping.');
                    continue;
                }
            }

            // determined type validity, iterate based on type 
            switch (geo[i]['type']) {
                case 'featurecollection':
                case 'geometrycollection':
                    // valid collection type 
                    if (combinedType == '') {
                        combinedType = geo[i]['type'];
                    } else if (combinedType == geo[i]['type']) {
                        // matching type to base type, check for contents 
                        let collectionName = combinedType == "featurecollection" ? 'features' : 'geometries';
                        if (!keys.includes(collectionName)) {
                            // does not include a collection of the valid name 
                            console.warn('GeoJSON object to be combined is of valid type ', combinedType,
                                ', but does not include key ', collectionName, ', and thus has no valid contents. ',
                                'Cannot combine this file, skipping. Index: ', ix, ', keys: ' + keys);
                            continue;
                        }
                        // ensure collection is an array 
                        if (!Array.isArray(geo[i][collectionName])) {
                            // not an array 
                            console.warn('GeoJSON object to be combined is of valid type ', combinedType,
                                ', but key ', collectionName, ' is not an array, and thus has no valid contents. ',
                                'Cannot combine this file, skipping. Index: ', ix, ', key type: ', typeof geo[i][collectionName]);
                            continue;
                        } else if (geo[i][collectionName].length == 0) {
                            // it IS an array, but has no values. no point in including, skipping silently 
                            continue;
                        }
                        // valid type, valid collection name, valid & populated array - work with it!
                        
                        //TODO: combine
                        
                    } else {
                        // type mismatch, cannot include 
                        console.warn("GeoJSON files of different types cannot be combined. Assigned type ", combinedType,
                            " is based off of the first-read GeoJSON object, and files of type ", geo[i]['type'],
                            ' cannot be mixed. Ensure you combine only GeoJSON files of the same type. Skipping this file.',
                            ' Index ', ix, ', collection length: ' + geo[i][collectionName].length);
                        continue;
                    }
                    break;
                default:
                    // check if it IS a default type, just a non-collection
                    if (geoJsonObjectTypes.contains(geo[i].type)) {
                        // check if geo[i] is an array 
                        // valid type, check if feature 
                        let isFeature = geo[i].type == 'feature';
                        if (combinedType == '') {
                            // type not yet set, collect both features/geometries 

                        }
                    } else {
                        // invalid type 
                    }
                    continue;
            }
        }

    }

}

/**
 * Duplicates the given object and returns it, with all its keys lowercase 
 * @param {object} obj Object who's keys you want to render lowercase 
 * @return {object} New object with duplicate values, with lowercase keys 
 * @author https://stackoverflow.com/a/12540603/12888769
 */
function ObjectKeysToLower(obj) {
    if (obj == null) { return null; }
    var key, keys = Object.keys(obj);
    var n = keys.length;
    var newObj = {}
    while (n--) {
        key = keys[n];
        newObj[key.toLowerCase()] = obj[key];
    }
    return newObj;
}