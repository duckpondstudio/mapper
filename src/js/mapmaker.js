import demoMap from './../assets/img/grieger-triptychial-political.png';
import overlayGeo from './../assets/json/outline-safe.geojson';//       recommended for overlay sizing
// import overlayGeo from './../assets/json/outline-simple.geojson';//  recommended for ocean rendering
// import overlayGeo from './../assets/json/outline-default.geojson';// not recommended (SVG rendering errors)

// TODO: allow multiple geojson files to be imported onto a single map (eg to load land + ocean + lat/long lines separately)
// TODO: allow separate geojson files on the same map to be independently toggled on/off (ideally without recalculating the same map)

import { MapData } from './classes/mapdata';
import { ProjectionData } from './classes/projectiondata';
import { GetGeoJSON } from './geojsonparser';
import * as m from './maps';
import * as math from './utils/math';

import * as d3 from 'd3';
import * as d3gp from 'd3-geo-projection';

let mapSize = 200;

const usePerMapBorder = false;

let maps = [];

let geojson = GetGeoJSON();

let mapIndex = 0;

function CreateMap(module) {

    let map = module.map;

    if (map == null || map == "") {
        console.error('null/empty map projection specified, cannot create');
        return;
    }
    if (typeof map !== 'string') {
        console.error('map projection specified is invalid type, not string, cannot create. value: ' + map);
        return;
    }

    let projectionIndex = 0;
    let loadedProjections = 0;

    let mapData = new MapData(
        module
    );

    // generate projections 
    setTimeout(() => {
        switch (map) {
            case m.grieger:
                RetrieveProjection(m.adams2, mapData);
                RetrieveProjection(m.adams1, mapData);
                RetrieveProjection(m.adams2, mapData);
                break;
            default:
                RetrieveProjection(map, mapData);
                break;
        }

        // define mapContainer size based on map
        let containerWidth = mapSize;
        let containerHeight = mapSize;
        // check for special conditions
        switch (map) {
            case m.grieger:
            case 'grieger-test':
                containerWidth = mapSize * 2;
                break;
            default:
                // by default, mapContainer width is determined by projection count
                containerWidth = mapSize * projectionIndex;
                break;
        }
        // assign size to mapContainer
        mapData.mapContainer.style.width = containerWidth + 'px';
        mapData.mapContainer.style.height = containerHeight + 'px';

    }, 0);

    mapIndex++;

    maps.push(mapData);

    /**
     * Retrieve the given {@link ProjectionData} for this map
     * @param {string} projectionType Name of specific projection you want to retrieve projection for, see {@link m maps.js} 
     * @param {MapData} mapData {@link MapData} for this projection   
     * @returns {ProjectionData} */
    function RetrieveProjection(projectionType, mapData) {

        // store current projection index, because ProjectionIndex iterates on an async timer 
        let currentProjectionIndex = projectionIndex;

        if (mapData == null) {
            console.error("null mapData, can't retrieve projection, projectionType: " + projectionType);
            return;
        }

        let map = mapData.map;

        if (projectionType == null || projectionType == "") {
            console.error('null/empty projection type specified, cannot retrieve');
            return;
        }
        if (map == null || map == "") {
            console.error('null/empty map projection specified, cannot create, ' +
                'ensure map is first defined by calling CreateMap');
            return;
        }

        // checks passed, begin loading 
        loadedProjections++;// increment load counter

        let projection = GetProjection(projectionType);

        let fitSize = 1;
        // adjust projection scale (zoom)
        switch (map) {
            case m.grieger:
                fitSize = math.sqrt2;
                break;
        }
        projection
            .fitSize([mapSize * fitSize, mapSize * fitSize], overlayGeo);
        // using ocean JSON here because it extends all the way to the edges of lat/long, -180/-90 to 180/90, eg max size


        // create geopath generator
        let geoGenerator = d3.geoPath()
            .projection(projection);

        // left offset (adjust first map size - use projection width for right map cutoff)
        let leftOffset = 0;
        switch (map) {
            case m.grieger:
                if (currentProjectionIndex == 0) {
                    leftOffset = mapSize * -0.5;
                }
                break;
        }

        // prepare relevant transformations 
        let transform;


        // check for / apply per-map transformations
        // switch (map) { // obsolete - keeping for ref 
        //     case 'grieger-test':
        //         applyTransformation = true;
        //         rotation = 90;
        //         // translationX = -(mapSize * (math.sqrt2 - 1) * math.sqrt2rec);
        //         translationY = mapSize;
        //         break;
        // }

        let cssRotation = m.GetMapCSSRotation(projectionType);
        let cssTranslation = m.GetMapCSSTranslation(projectionType, mapSize);
        let hasRotation = cssRotation != 0;
        let hasTranslation =
            (cssTranslation != null && Array.isArray(cssTranslation) &&
                cssTranslation.length == 2 && cssTranslation != [0, 0]);
        let hasTransform = hasRotation || hasTranslation;

        // if projection calls for transformation, apply it here
        if (hasTransform) {
            transform = "";
            if (hasRotation) { 
                transform += "rotate(" + cssRotation + ", " + mapSize + ", " +
                    mapSize + (hasTranslation ? ") " : ")");
            }
            if (hasTranslation) { 
                transform += "translate(" + cssTranslation[0] + "," + cssTranslation[1] + ")";
            }   
        }


        let svgContainerId = "map_" + map + "_projection_" + currentProjectionIndex;

        // create the svg for the map
        let svg = d3.select(mapData.mapContainer).append('svg')
            .attr("class", "map")
            .attr("id", svgContainerId)
            .attr("width", mapSize)
            .attr("height", mapSize)
            .style("margin-left", leftOffset + 'px');

        // per-map svg border
        if (usePerMapBorder) {
            var containerBorder = svg.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("height", mapSize)
                .attr("width", mapSize)
                .style("stroke", "#FF0000")
                .style("fill", "none")
                .style("stroke-width", 2)
                ;
        }


        setTimeout(() => {

            // apply data
            let g = svg.append('g')
                .attr('class', 'mapGroup')
                .attr("transform", hasTransform ? transform : null)
                .selectAll('path')
                .data(geojson.features)
                .enter();
            
            
            g.append('path')
                .attr('class', function (d) {
                    let isWater = d.properties && d.properties.water === true;
                    return 'map' + (isWater ? ' water' : ' land');
                })
                .attr('d', geoGenerator);


            // get this projection container
            let svgContainer = document.getElementById(svgContainerId);

            // create projection data container
            let projectionData = new ProjectionData(
                projection, currentProjectionIndex, svgContainer, svg, mapSize, mapData);

            // add projectiondata to mapdata 
            mapData.AddProjection(projectionData);

            // decrement projection load index 
            loadedProjections--;

            if (loadedProjections == 0) {
                // done loading projections! 
            }

        }, 50);// nominal delay to ENSURE loadedProjections is incremented properly

        // increment projection index 
        projectionIndex++;
    }

    return mapData;
}

/**
 * Returns geoprojection of the given projection type (with any manual modifications, 
 * otherwise you can just directly call d3.myProjection() )
 * @param {string} projectionType name of the projection type you want  
 * @return {d3.GeoProjection} d3.GeoProjection data for the given name 
 */
function GetProjection(projectionType) {

    // nullcheck
    if (projectionType == null) {
        // null, just return default projection type (geoEquirectangular)
        console.warn("Cannot get projection type, given type is null, returning d3.geoEquirectangular");
        return d3.geoEquirectangular();
    }

    // ensure lowercase
    if (typeof (projectionType) === 'string') {
        projectionType = projectionType.toLowerCase();
    } else {
        // not a string, invalid parsing 
        console.warn("Can't get projection from type, type isn't a string, type value: "
            + projectionType + ", typeof: " + typeof (projectionType) + ", returning d3.geoEquirectangular");
        return d3.geoEquirectangular();
    }

    switch (projectionType) {

        default:
            console.warn("Unsupported projection type " + projectionType + ", refer to maps.js, returning geoEquirectangular");
            return d3.geoEquirectangular();

        case m.equirectangular:
            return d3.geoEquirectangular();

        case m.peirce:
            return d3gp.geoPeirceQuincuncial()
                .rotate([0, 0, 315]);

        case m.adams1:
            return d3gp.geoPeirceQuincuncial()
                .rotate([0, 315, 45])
                .clipAngle(90);

        case m.adams2:
            return d3gp.geoPeirceQuincuncial()
                .rotate([0, 135, 315])
                .clipAngle(90);

    }
}

function ShowDemoMap() {
    console.warn("Demo map img being created");
    const img = new Image();
    img.src = demoMap;
    img.width = 500;
    document.body.appendChild(img);
}

export { CreateMap };