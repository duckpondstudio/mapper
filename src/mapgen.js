import demoMap from './img/grieger-triptychial-political.png';
import overlayGeo from './json/outline-safe.geojson';//       recommended for overlay sizing
// import overlayGeo from './json/outline-simple.geojson';//  recommended for ocean rendering
// import overlayGeo from './json/outline-default.geojson';// not recommended (SVG rendering errors)

// TODO: allow multiple geojson files to be imported onto a single map (eg to load land + ocean + lat/long lines separately)
// TODO: allow separate geojson files on the same map to be independently toggled on/off (ideally without recalculating the same map)

import { MapData, ProjectionData } from './mapdata';
import { GetGeoJSON } from './mapjson';
import * as m from './maps';

import * as d3 from 'd3';
import * as d3gp from 'd3-geo-projection';

let mapSize = 200;
const containerScale = 1.4142135623730950488016887242097;
const containerOffset = 0.70710678118654752440084436210485;

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

    // mapContainer.appendChild(title);


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

        // define projectionsContainer size based on map
        let containerWidth = mapSize;
        let containerHeight = mapSize;
        // check for special conditions
        switch (map) {
            case m.grieger:
            case 'grieger-test':
                containerWidth = mapSize * 2;
                break;
            default:
                // by default, projectionsContainer width is determined by projection count
                containerWidth = mapSize * projectionIndex;
                break;
        }
        // assign size to projectionsContainer
        mapData.projectionsContainer.style.width = containerWidth + 'px';
        mapData.projectionsContainer.style.height = containerHeight + 'px';

    }, 0);

    mapIndex++;

    maps.push(mapData);

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
                fitSize = containerScale;
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

        let applyTransformation = false;
        let rotation = 0;
        let translationX = 0;
        let translationY = 0;


        // check for / apply per-map transformations
        // switch (map) { // obsolete - keeping for ref 
        //     case 'grieger-test':
        //         applyTransformation = true;
        //         rotation = 90;
        //         // translationX = -(mapSize * (containerScale - 1) * containerOffset);
        //         translationY = mapSize;
        //         break;
        // }

        // check for / apply per-projection transformations
        switch (projectionType) {
            case m.adams1:
            case m.adams2:
                applyTransformation = true;
                // horizontal, a1 NA facing up
                rotation = 135;
                translationX = (mapSize * (containerScale - 1) * containerOffset);
                translationY = mapSize;
                // vertical, a1 NA facing right
                // rotation = 225;
                // translationX = mapSize;
                // translationY = mapSize * (containerScale - 1) * containerOffset;
                break;
        }

        // if projection calls for transformation, apply it here
        if (applyTransformation) {
            transform =
                "rotate(" + rotation + "," + mapSize + "," + mapSize + ") " +
                "translate(" + translationX + "," + translationY + ")";
        }


        let svgContainerId = "map_" + map + "_projection_" + currentProjectionIndex;

        // create the svg for the map
        let svg = d3.select(mapData.projectionsContainer).append('svg')
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
                .attr('class','mapGroup')
                .attr("transform", transform)
                .selectAll('path')
                .data(geojson.features)
                .enter();
            let v = 0;
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