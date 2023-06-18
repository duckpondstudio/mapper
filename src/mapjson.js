
import geoEarth from './json/ne_50m_land.geojson';
import geoOcean from './json/ocean_feature.geojson';

const geoJsonStructure = [
    [ // [0] = Collections 
        ['FeatureCollection', ['features']],
        ['GeometryCollection', ['geometries']]
    ],
    [ // [1] = Objects (singular)
        ['Feature',['geometry', 'properties', 'id']],
    ]
];

/** Collection types in GeoJSON format (generally containing collections) */
const geoJsonCollections = ['FeatureCollection', 'GeometryCollection'];
/** Single object types in GeoJSON format */
const geoJsonObjects = ['Feature', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'];
const geoJsonTypes = [...geoJsonCollections, ...geoJsonObjects];

export function GetGeoJSON() {

    

    // console.log("json: " + geoEarth.toString());

    console.log('geoOcean');
    console.log(Object.keys(geoOcean));

    console.log(geoOcean['type']);
    console.log(geoOcean['features']);
    console.log(geoOcean['features'].length);
    GetGeoJSONArray('whaowot');
    
    
    function GetGeoJSONArray(geo) {
        if (geo == null) {
            console.error("Cannot get type of null geojson file, add a referenced file, returning null");
            return null;
        }
        let type = geo['type'];
        switch (type) {
            case 'FeatureCollection':
                break;
            case 'GeometryCollection':
                break;
        }
    }

}