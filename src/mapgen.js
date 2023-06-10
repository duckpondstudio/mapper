import demoMap from './img/grieger-triptychial-political.png';
// import geojson from './json/demo.geojson';
// import geojson from './json/world.geojson';
import geojson from './json/ne_50m_land.geojson';

import { MapInput } from './mapinput';

import * as d3 from 'd3';
import * as d3gp from 'd3-geo-projection';

let root = document.querySelector(':root');
let body = document.body;

export let mapSize = 200;
const containerScale = 1.4142135623730950488016887242097;
const containerOffset = 0.70710678118654752440084436210485;

const usePerMapBorder = false;

let mapIndex = 0;
let projectionIndex = 0; // not async 

function CreateMap(map) {

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
    body.appendChild(mapContainer);

    let title = document.createElement("h1");
    title.setAttribute('id', 'titleContainer_' + mapIndex);
    title.innerHTML = "Map Data Collector";

    mapContainer.appendChild(title);
    // body.appendChild(title);

    let projContainer = document.createElement('div');
    projContainer.setAttribute('id', 'projectionContainer_' + mapIndex);
    projContainer.setAttribute('class', 'projectionContainer');
    mapContainer.appendChild(projContainer);

    // add output
    let output = document.createElement('p');
    output.setAttribute('id', 'output_' + mapIndex);
    output.innerHTML = "Output goes here";
    mapContainer.appendChild(output);

    let mapData = { map: map, output: output, projContainer: projContainer };

    // generate projections 
    switch (map) {
        case 'grieger':
            RetrieveProjection('adams2', mapData);
            RetrieveProjection('adams1', mapData);
            RetrieveProjection('adams2', mapData);
            break;
        case 'grieger-test':
            RetrieveProjection('peirce', mapData);
            RetrieveProjection('peirce', mapData);
            break;
        default:
            RetrieveProjection(map, mapData);
            break;
    }

    // define projectionContainer size based on map
    let containerWidth = mapSize;
    let containerHeight = mapSize;
    // check for special conditions
    switch (map) {
        case 'grieger':
        case 'grieger-test':
            containerWidth = mapSize * 2;
            break;
        default:
            // by default, projectionContainer width is determined by projection count
            containerWidth = mapSize * projectionIndex;
            break;
    }
    // assign size to projectionContainer
    projContainer.style.width = containerWidth + 'px';
    projContainer.style.height = containerHeight + 'px';

    mapIndex++;

}

function RetrieveProjection(projectionType, mapData) {

    let map = mapData.map;
    let projContainer = mapData.projContainer;

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
        case "grieger":
        case 'grieger-test':
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
        case 'grieger':
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
    switch (map) {
        case 'grieger-test':
            applyTransformation = true;
            rotation = 90;
            // translationX = -(mapSize * (containerScale - 1) * containerOffset);
            translationY = mapSize;
            break;
    }

    // check for / apply per-projection transformations
    switch (projectionType) {
        case "adams1":
        case "adams2":
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

    // create the svg for the map
    let svg = d3.select(projContainer).append('svg')
        .attr("class", "map")
        .attr("id", "map_" + map + "_projection_" + projectionIndex)
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

    // apply map events
    MapInput(svg, projection);

    // increment projection index 
    projectionIndex++;
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
            console.log("Unsupported projection type " + projectionType + ", returning geoEquirectangular");
            return d3.geoEquirectangular();
        case "geoequirectangular":
        case "equirectangular":
            return d3.geoEquirectangular();

        case "pierce":
            console.warn("Warning, common misspelling of Peirce, E before I in this name my dude! Returning correct, but check spelling.");
            return GetProjection('peirce');

        case "peirce":
        case "peircequincuncial":
            return d3gp.geoPeirceQuincuncial()
                .rotate([0, 0, 315]);

        case "adams":
            console.warn("Warning, \"adams\" is invalid projection, must specify WHICH hemisphere. " +
                "\"adams1\" = atlantic, \"adams2\" = pacific. Returning null");
            return null;

        case "adams1":
            return d3gp.geoPeirceQuincuncial()
                .rotate([0, 315, 45])
                .clipAngle(90);

        case "adams2":
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
    body.appendChild(img);
}

export { CreateMap };