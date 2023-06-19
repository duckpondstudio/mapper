
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

    let geoCombined = CombineGeoJSON(geoOcean, geoEarth);
    
    function CombineGeoJSON(...geo) {

        // check length minimums 
        if (geo.length == 0) { console.warn("Cannot combine GeoJSON files - no files provided"); return null; }
        else if (geo.length == 1) { return geo[0]; }

        let isFeatureCollection = false;
        let combinedType = '';
        let combinedCollection = [];
        let looseFeatureCollection = [];
        let looseGeometryCollection = [];

        let decrementFailsafe = 0;

        // determine first type of collection
        for (let i = 0; i < geo.length; i++) {

            // first, THOROUGH type validation to ensure we validly combine different GeoJSON files.
            // fastidious overengineering? No, dangit, we want it to just work regardless of user competency, 
            // if the files are parsably valid! We're going beyond user-friendly - we're going user-empathetic <3 

            /** shorthand index container showing full size, index/length (eg 3/8) */
            let ix = i + '/' + geo.length;

            // reset failsafe if needed 
            if (decrementFailsafe > 0) { decrementFailsafe--; }

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
            geo[i] = ObjectKeysToLowerAndTrim(geo[i]);
            // ensure object has key 'type'
            let keys = Object.keys(geo[i]);
            // check for type key (ensure it's non-null, non-whitespace)
            if (!keys.includes('type') || geo[i]['type'] == null || geo[i]['type'] == '') {
                // check if it contains a features or geometries key, from which we can infer the type
                let hasFeatures = keys.includes('features');
                // ensure features IS an array
                if (hasFeatures && !Array.isArray(geo[i]['features'])) {
                    console.warn('GeoJSON object at index ', ix, ' has a features object but it is NOT an array, invalid. ',
                        'Typeof: ', typeof geo[i]['features'], ' value: ', geo[i]['features']);
                    hasFeatures = false;
                }
                let hasGeometries = keys.includes('geometries');
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
            let geoType = geo[i]['type'].toLowerCase().trim();
            switch (geoType) {
                case 'featurecollection':
                case 'geometrycollection':
                    // valid collection type, check if first setting combined type 
                    if (combinedType == '') {
                        // found target type, assign combined type 
                        combinedType = geoType;
                        // determine collection type
                        //      note that isFeatureCollection is false even if invalid, so it doesn't 
                        //      necessarily mean that it IS a geometrycollection 
                        isFeatureCollection = geoType == 'featurecollection';
                        // check loose feature collections
                        if (looseFeatureCollection.length > 0) {
                            // yep, loose features found, confirm we're if a feature collection 
                            if (isFeatureCollection) {
                                // valid, add feature collection 
                                Array.prototype.push.apply(combinedCollection, looseFeatureCollection);
                            } else {
                                // invalid, discard feature collection 
                                console.warn('Collection type is determined as GeometryCollection',
                                    'but uncollected features have already been found and must be discarded. ',
                                    'GeoJSON types FeatureCollection and GeometryCollection cannot be combined. Discarding ',
                                    looseFeatureCollection.length, (looseFeatureCollection.length == 1 ? ' feature.' : 'features.'));
                            }
                            looseFeatureCollection = [];
                        }
                        // check loose geometry collections
                        if (looseGeometryCollection.length > 0) {
                            // yep, loose geometries found, confirm we're if a geometry collection 
                            if (!isFeatureCollection) {
                                // valid, add geometrycollection 
                                Array.prototype.push.apply(combinedCollection, looseGeometryCollection);
                            } else {
                                // invalid, discard geometrycollection 
                                console.warn('Collection type is determined as FeatureCollection',
                                    'but uncollected features have already been found and must be discarded. ',
                                    'GeoJSON types FeatureCollection and GeometryCollection cannot be combined. Discarding ',
                                    looseGeometryCollection.length, (looseGeometryCollection.length == 1 ? ' feature.' : 'features.'));
                            }
                            looseGeometryCollection = [];
                        }
                    }
                    if (combinedType == geoType) {
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
                        Array.prototype.push.apply(combinedCollection, geo[i][collectionName]);
                    } else {
                        // type mismatch, cannot include 
                        console.warn("GeoJSON files of different types cannot be combined. Assigned type ", combinedType,
                            " is based off of the first-read GeoJSON object, and files of type ", geoType,
                            ' cannot be mixed. Ensure you combine only GeoJSON files of the same type. Skipping this file.',
                            ' Index ', ix, ', collection length: ' + geo[i][collectionName].length);
                        continue;
                    }
                    break;
                default:
                    // check if it IS a default type, just a non-collection
                    if (geoJsonObjectTypes.contains(geoType)) {
                        // valid type, check if feature 
                        let isFeature = geoType == 'feature';
                        if (combinedType == '') {
                            // type not yet set, collect both features/geometries, wait to combine them
                            if (isFeature) {
                                looseFeatureCollection.push(geo[i]);
                            } else {
                                looseGeometryCollection.push(geo[i]);
                            }
                        } else {
                            // combined type is set, check for validity 
                            if (isFeatureCollection == isFeature) {
                                // correct type, add feature to combined collection 
                                combinedCollection.push(geo[i]);
                            } else {
                                // invalid type, cannot combine 
                                console.warn('Cannot merge different collection types into one GeoJSON file. ',
                                    'Combined file is type ', (isFeatureCollection ? 'Feature' : 'Geometry'),
                                    ' while current file attempting to merge is type ', (isFeature ? 'Feature' : 'Geometry'),
                                    '. Type is determined by the first valid GeoJSON collection found. Check the order ',
                                    'you are loading files in, and ensure you only load files of one type. ',
                                    'Index ', ix, ', cannot merge, skipping file.');
                                continue;
                            }
                        }
                    } else if (geoJsonCollections.contains(geoType)) {
                        // theoretically impossible to get here? failsafe accommodation 
                        if (geoType.includes('f')) {
                            // featurecollection, assign proper name, decrement+redo iteration 
                            geo[i]['type'] = 'featurecollection';
                        } else if (geoType.includes('g')) {
                            // geometrycollection, assign proper name, decrement+redo iteration 
                            geo[i]['type'] = 'geometrycollection';
                        } else {
                            // impossible?
                            console.warn('Failsafe, impossible GeoJSON type found: ', geoType,
                                ', check source code for errors (spelling?). Check const array vars. ',
                                'Index ', ix, ', cannot combine GeoJSON file, continuing');
                            continue;
                        }
                        // modified / corrected type setting, decrement+redo iteration
                        if (decrementFailsafe > 0) {
                            // do NOT decrement if we've hit failsafe more than once 
                            console.error("ERROR: hit impossible failsafe twice, investigate. Skipping file", geo[i]);
                        } else {
                            decrementFailsafe = 2;// set to 2 so it'll still be flagged on next iteration, but reset afterwards 
                            i--;
                        }
                        continue;
                    } else {
                        // invalid type 
                        console.warn('Cannot combine GeoJSON file of invalid type ', geoType,
                            ', must be a valid GeoJSON geo-type. Index ', ix, ', skipping file')
                        continue;
                    }
            }
        }

        // done iterating through files, check if type was assigned properly / any loose collections 
        if (combinedType == '') {
            // no type found 
            if (looseFeatureCollection.length > 0) {
                if (looseGeometryCollection.length > 0) {
                    // both loose features AND geometry found, select larger amount 
                    if (looseFeatureCollection.length == looseGeometryCollection.length) {
                        // equal amounts of both - default to geometries 
                        console.warn('Could not find a set GeoJSON collection type, but found both loose features and geometries. ',
                            'There is an equal number of both, ', looseFeatureCollection.length, '. Discarding geometries, ',
                            'defaulting to FeatureCollection. Types cannot be mixed - use only Features OR Geometries.');
                        Array.prototype.push.apply(combinedCollection, looseFeatureCollection);
                        combinedType = 'featurecollection';
                        isFeatureCollection = true;
                        looseFeatureCollection = [];
                    } else if (looseFeatureCollection.length > looseGeometryCollection.length) {
                        // more features than geometries 
                        console.warn('Could not find a set GeoJSON collection type, but found both loose features and geometries. ',
                            'There are more features, ', looseFeatureCollection.length, ', than geometries, ', looseGeometryCollection.length,
                            '. Disicarding geometries, defaulting to FeatureCollection. Types cannot be mixed - use only Features OR Geometries.')
                        Array.prototype.push.apply(combinedCollection, looseFeatureCollection);
                        combinedType = 'featurecollection';
                        isFeatureCollection = true;
                        looseFeatureCollection = [];
                    } else {
                        // more geometries than features 
                        console.warn('Could not find a set GeoJSON collection type, but found both loose features and geometries. ',
                            'There are more geometries, ', looseGeometryCollection.length, ', than features, ', looseFeatureCollection.length,
                            '. Disicarding features, defaulting to GeometryCollection. Types cannot be mixed - use only Features OR Geometries.')
                        Array.prototype.push.apply(combinedCollection, looseGeometryCollection);
                        combinedType = 'geometrycollection';
                        isFeatureCollection = false;
                        looseGeometryCollection = [];
                    }
                } else {
                    // loose features found 
                    if (combinedCollection.length > 0) {
                        console.warn('GeoJSON combined collection has values, yet combined type was not assigned. ',
                            'This should be impossible. Investigate. For now, assigning found loose features. ',
                            combinedCollection, looseFeatureCollection, geo);
                    }
                    Array.prototype.push.apply(combinedCollection, looseFeatureCollection);
                    combinedType = 'featurecollection';
                    isFeatureCollection = true;
                    looseFeatureCollection = [];
                }
            } else if (looseGeometryCollection.length > 0) {
                // loose geometry found 
                if (combinedCollection.length > 0) {
                    console.warn('GeoJSON combined collection has values, yet combined type was not assigned. ',
                        'This should be impossible. Investigate. For now, assigning found loose geometries. ',
                        combinedCollection, looseGeometryCollection, geo);
                }
                Array.prototype.push.apply(combinedCollection, looseGeometryCollection);
                combinedType = 'geometrycollection';
                isFeatureCollection = false;
                looseGeometryCollection = [];
            }
        }
        
        // create and return merged GeoJSON
        switch (combinedType) {
            case 'featurecollection':
                return {
                    type: 'FeatureCollection', // NOT lowercase, final output uses GeoJSON standard capitalization 
                    features: combinedCollection
                };
            case 'geometrycollection':
                return {
                    type: 'GeometryCollection', // NOT lowercase, final output uses GeoJSON standard capitalization 
                    geometries: combinedCollection
                };
            default:
                // invalid combined type 
                console.warn('Final GeoJSON combinedType is invalid: ', combinedType, ', cannot return merged GeoJSON file. ',
                    'Investigate source code. Returning null. Combined collection length: ', combinedCollection.length,
                    ', combined collection: ', combinedCollection, ', geo params: ', geo);
                return null;
        }

    }

}

/**
 * Duplicates the given object and returns it, with all its keys lowercase and trimmed 
 * @param {object} obj Object who's keys you want to render lowercase 
 * @return {object} New object with duplicate values, with lowercase keys 
 * @author https://stackoverflow.com/a/12540603/12888769
 */
function ObjectKeysToLowerAndTrim(obj) {
    if (obj == null) { return null; }
    var key, keys = Object.keys(obj);
    var n = keys.length;
    var newObj = {}
    while (n--) {
        key = keys[n];
        newObj[key.toLowerCase().trim()] = obj[key];
    }
    return newObj;
}