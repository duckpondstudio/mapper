// EXTREMELY WIP


import demoMap from './img/grieger-triptychial-political.png';
// import geojson from './demo.geojson';
// import geojson from './world.geojson';
import geojson from './ne_50m_land.geojson';
// import worldGeoJson from './world.geo.json';
// const worldGeoJson = require('./world.geo.json');

import * as Canvas from './canvas';
import * as d3 from 'd3';
import * as d3gp from 'd3-geo-projection';

var container;

var containerWidth = 360;
var containerHeight = containerWidth;
const containerScale = 1.4142135623730950488016887242097;
const containerOffset = 0.70710678118654752440084436210485;

let zoom = 1;
let rotation = [0, 0, 315];
let rotIndex = 0;

function GenerateCanvas() {
    console.log("generating canvas");

    container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);

    RetrieveProjection('adams1');
    // RetrieveProjection('adams2');
    // RetrieveProjection('adams1alt');
    // RetrieveProjection('adams1alt');
    // RetrieveProjection('adams1alt');
    // RetrieveProjection('adams1alt');
    // RetrieveProjection('adams1alt');
    // RetrieveProjection('adams1alt');
    // RetrieveProjection();
    // RetrieveProjection('adams1alt');
}

var b = true;
function RetrieveProjection(projectionType) {

    if (projectionType == null || projectionType == "") {
        projectionType = 'adams1';
    }

    let projection = GetProjection(projectionType);
    console.log("proj " + projectionType + " scale 1: " + projection.clipExtent());

    switch (projectionType) {
        default:
            projection
                .fitSize([containerWidth, containerHeight], geojson);
            break;
        case "adams1":
        case "adams1alt":
        case "adams2":
            projection
                .fitSize([containerWidth * containerScale, containerHeight * containerScale], geojson);
            // b = true;
            break;
    }
    console.log("proj " + projectionType + " scale 2: " + projection.clipExtent());


    let geoGenerator = d3.geoPath()
        .projection(projection);

    let svg = d3.select("#container").append('svg')
        .attr("class", "map")
        .attr("width", containerWidth)
        .attr("height", containerHeight);

    // container border
    var containerBorder = svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", containerHeight)
        .attr("width", containerWidth)
        .style("stroke", "#FF0000")
        .style("fill", "none")
        .style("stroke-width", 2)
        ;

    let g = svg.append('g')
    .attr("transform", "rotate(225 " +
        containerWidth * 1 + " " +
        containerHeight * 1 + ") " +
        "translate(" +
        containerWidth * 1 + " " +
        containerHeight * .4125 * containerOffset + ")")

        // .attr("transform", "rotate(225 " +
        //     containerWidth * 1 + " " +
        //     containerHeight * 1 + ") " +
        //     "translate(" +
        //     containerWidth * 1 + " " +
        //     containerHeight * .4125 * containerOffset + ")")
        
        .selectAll('path')
        .data(geojson.features)
        .enter();


    g.append('path')
        .attr('class', function (d) {
            return 'map' + (d.properties && d.properties.water === true ? ' water' : ' land');
        })
        .attr('d', geoGenerator);
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
            console.warn("Warning, should specify WHICH hemisphere. adams1 = atlantic, adams2 = pacific. Defaulting to adams1")
        case "adams1":
            return d3gp.geoPeirceQuincuncial()
                .rotate([0, 315, 45])
                .clipAngle(90);
            ;

        case "adams1alt":
            rotation[rotIndex] = nx * 45;
            let d = d3gp.geoPeirceQuincuncial()
                // .center([45,45])
                .rotate(rotation)
                // .rotate([45, 90,nx * 45 ])
                // .rotate([0, 180, nx * 45])
                ;
            nx++;
            return d;

        case "adams2":
            return d3gp.geoPeirceQuincuncial()
                .rotate([180, 0, 315])
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