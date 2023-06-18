
import geoEarth from './json/ne_50m_land.geojson';
import geoOcean from './json/ocean_feature.geojson';

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