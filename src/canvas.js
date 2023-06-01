// EXTREMELY WIP


import demoMap from './img/grieger-triptychial-political.png';
// import geojson from './demo.geojson';
// import geojson from './world.geojson';
import geojson from './ne_50m_land.geojson';

import * as Canvas from './canvas';
import * as d3 from 'd3';
import * as d3gp from 'd3-geo-projection';

var root = document.querySelector(':root');

var container;

var containerWidth = 400;
var containerHeight = 200;
var mapSize = 200;
const containerScale = 1.4142135623730950488016887242097;
const containerOffset = 0.70710678118654752440084436210485;

const usePerMapBorder = false;

let zoom = 1;
let rotation = [0, 0, 315];
let rotIndex = 0;

let firstMap;

function GenerateCanvas() {
    console.log("generating canvas");

    container = document.createElement('div');
    container.setAttribute('id', 'container');
    container.setAttribute('class', 'container');
    container.style.width = containerWidth + 'px';
    container.style.height = containerHeight + 'px';
    // container.setAttribute('width', containerWidth);
    // container.setAttribute('height', containerHeight);
    document.body.appendChild(container);

    firstMap = true;
    
    // generate projections 
    RetrieveProjection('adams2');
    RetrieveProjection('adams1');
    RetrieveProjection('adams2');
}

var b = true;
function RetrieveProjection(projectionType) {

    if (projectionType == null || projectionType == "") {
        projectionType = 'adams1';
    }

    let projection = GetProjection(projectionType);
    console.log("proj " + projectionType + " scale 1: " + projection.clipExtent());

    // adjust projection scale
    switch (projectionType) {
        default:
            projection
                .fitSize([mapSize, mapSize], geojson);
            break;
        case "adams1":
        case "adams1alt":
        case "adams2":
            projection
                .fitSize([mapSize * containerScale, mapSize * containerScale], geojson);
            // b = true;
            break;
    }
    console.log("proj " + projectionType + " scale 2: " + projection.clipExtent());

    // create geopath generator
    let geoGenerator = d3.geoPath()
        .projection(projection);
    
    // left offset (adjust first map size - use container width for right map cutoff)
    let leftOffset = 0;
    switch (projectionType) {
        case 'adams1':
        case 'adams2':
            if (firstMap) {
                leftOffset = mapSize * -0.5;
            }
            break;
    }
    firstMap = false;

    // create the svg for the map
    let svg = d3.select("#container").append('svg')
        .attr("class", "map")
        .attr("width", mapSize)
        .attr("height", mapSize)
        .style("margin-left", leftOffset + 'px');

    // prepare relevant transformations 
    let transform;

    let applyTransformation = false;
    let rotation = 0;
    let translationX = 0;
    let translationY = 0;

    // check for / apply transformations
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
            "rotate(" + rotation + " " + mapSize + " " + mapSize + ") " +
            "translate(" + translationX + " " + translationY + ")";
    }

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
}

let nx = 0;

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

/* */

function ShowDemoMap() {
    console.log("creating demo map img");
    const img = new Image();
    img.src = demoMap;
    img.width = 500;
    document.body.appendChild(img);
}

export { GenerateCanvas };