import demoMap from './img/grieger-triptychial-political.png';
// import geojson from './json/demo.geojson';
// import geojson from './json/world.geojson';
import geojson from './json/ne_50m_land.geojson';

import { AssignInput } from './mapinput';
import { MapData, ProjectionData } from './mapcont';
import * as m from './maps';

import * as d3 from 'd3';
import * as d3gp from 'd3-geo-projection';

let mapSize = 200;
const containerScale = 1.4142135623730950488016887242097;
const containerOffset = 0.70710678118654752440084436210485;

const usePerMapBorder = false;

let maps = [];

let mapIndex = 0;
let projectionIndex = 0; // not async 

function CreateMap(module) {

    let map = module.map;

    console.log("creating map: " + map);

    if (map == null || map == "") {
        console.error('null/empty map projection specified, cannot create');
        return;
    }
    if (typeof map !== 'string') {
        console.error('map projection specified is invalid type, not string, cannot create. value: ' + map);
        return;
    }

    projectionIndex = 0;

    let mapContainer = document.createElement('div');
    mapContainer.id = 'mapContainer_' + mapIndex;
    module.container.appendChild(mapContainer);

    let title = document.createElement("h1");
    title.setAttribute('id', 'titleContainer_' + mapIndex);
    title.innerHTML = "Map Data Collector";

    mapContainer.appendChild(title);
    // module.container.appendChild(title);

    let projectionsContainer = document.createElement('div');
    projectionsContainer.setAttribute('id', 'projectionsContainer_' + mapIndex);
    projectionsContainer.setAttribute('class', 'projectionsContainer');
    mapContainer.appendChild(projectionsContainer);

    // add data container
    let dataContainer = document.createElement('div');
    dataContainer.setAttribute('id', 'data_' + mapIndex);
    mapContainer.appendChild(dataContainer);


    let mapData = new MapData(
        map,
        mapIndex,
        dataContainer,
        projectionsContainer
    );


    // generate projections 
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
    projectionsContainer.style.width = containerWidth + 'px';
    projectionsContainer.style.height = containerHeight + 'px';

    mapIndex++;

    maps.push(mapData);

}

function RetrieveProjection(projectionType, mapData) {

    if (mapData == null) {
        console.error("null mapData, can't retrieve projection, projectionType: " + projectionType);
        return;
    }

    let map = mapData.map;
    let projectionsContainer = mapData.projectionsContainer;

    if (projectionType == null || projectionType == "") {
        console.error('null/empty projection type specified, cannot retrieve');
        return;
    }
    if (map == null || map == "") {
        console.error('null/empty map projection specified, cannot create, ' +
            'ensure map is first defined by calling CreateMap');
        return;
    }

    console.log('retrieving projection ' + projectionType + ' for map projection ' + map);
    let projection = GetProjection(projectionType);

    let fitSize = 1;
    // adjust projection scale (zoom)
    switch (map) {
        case m.grieger:
            fitSize = containerScale;
            break;
    }
    projection
        .fitSize([mapSize * fitSize, mapSize * fitSize], geojson);


    // create geopath generator
    let geoGenerator = d3.geoPath()
        .projection(projection);

    // left offset (adjust first map size - use projection width for right map cutoff)
    let leftOffset = 0;
    switch (map) {
        case m.grieger:
            if (projectionIndex == 0) {
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

    
    let svgContainerId = "map_" + map + "_projection_" + projectionIndex;
    
    // create the svg for the map
    let svg = d3.select(projectionsContainer).append('svg')
        .attr("class", "map")
        .attr("id", svgContainerId)
        .attr("width", mapSize)
        .attr("height", mapSize)
        .style("margin-left", leftOffset + 'px');

    // apply data
    let g = svg.append('g')
        .attr("transform", transform)
        .selectAll('path')
        .data(geojson.features)
        .enter();

    g.append('path')
        .attr('class', function (d) {
            return 'map' + (d.properties && d.properties.water === true ? ' water' : ' land');
        })
        .attr('d', geoGenerator);

    // per-map border
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

    // get this projection container
    let svgContainer = document.getElementById(svgContainerId);

    // create projection data container
    let projectionData = new ProjectionData(
        projection, projectionIndex, svgContainer, svg, mapSize, mapData);

    // apply map events
    AssignInput(projectionData);

    // increment projection index 
    projectionIndex++;

    // add projectiondata to mapdata 
    mapData.AddProjection(projectionData);
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
            console.log("Unsupported projection type " + projectionType + ", refer to maps.js, returning geoEquirectangular");
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
    console.log("creating demo map img");
    const img = new Image();
    img.src = demoMap;
    img.width = 500;
    document.body.appendChild(img);
}

export { CreateMap };