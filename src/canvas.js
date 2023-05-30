// EXTREMELY WIP


import demoMap from './img/grieger-triptychial-political.png';
// import geojson from './demo.geojson';
import geojson from './world.geojson';
// import worldGeoJson from './world.geo.json';
// const worldGeoJson = require('./world.geo.json');

import * as Canvas from './canvas';
import * as d3 from 'd3';
import * as d3gp from 'd3-geo-projection';

var container;

var containerWidth = 600;
var containerHeight = 600;


function GenerateCanvas() {
    console.log("generating canvas");

    container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);

    // svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // // svg.setAttribute("id", "container");
    // svg.style.width = width;
    // svg.style.height = height;
    // container.appendChild(svg);

    // map = document.createElement("g");
    // map.setAttribute('class', 'map');
    // svg.appendChild(map);

    RetrieveProjection();
}


function RetrieveProjection() {

    let projection = GetProjection('adams1')
        .fitSize([containerWidth, containerHeight], geojson)
        ;

    let geoGenerator = d3.geoPath()
        .projection(projection);

    let svg = d3.select("#container").append('svg')
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
        .attr('class', 'map')
        .selectAll('path')
        .data(geojson.features);
    
    // g.append('path',

    g.enter()
        .append('path')
        // .attr("transform","rotate(45)")
        .attr('d', geoGenerator);
}
/*
    // Define the width and height of the square

    // Define the projection function for Adam's Hemisphere In A Square
    var projection = GetProjection()
        .fitSize([width, height], worldGeoJson)
        // .scale(200)
        // .translate([200, 150])
        ;


    // Create a path generator
    var path = d3.geoPath().projection(projection);

    var joined = d3.select('#container').select('g.map')
        .selectAll('path')
        .data(worldGeoJson.features);

    joined.enter()
        .append('path')
        .attr('d', path)
    
        .attr('fill', 'steelblue')
        .attr('stroke', 'white')
        .attr('stroke-width', 0.5)
        ;

    // console.log("JSON:");
    // console.log(worldGeoJson);

    // var geo = worldGeoJson;

    // console.log(geo);

    // // Fetch the geographic data (e.g., GeoJSON)
    // d3.json(geo).then(function (data) {
    //     // Append the path elements for each feature
    //     d3.select('#map').selectAll('path')
    //         .data(data.features)
    //         .enter()
    //         .append('path')
    //         .attr('d', path)
    //         .attr('fill', 'steelblue')
    //         .attr('stroke', 'white')
    //         .attr('stroke-width', 0.5);
    // });




    // fetch('https://proj.org/operations/projections/adams_hemi')
    //     .then(response => response.text())
    //     .then(svgData => {
    //         // Process the retrieved SVG data

    //         const img = document.createElement('img');
    //         img.src = `data:image/svg+xml,${encodeURIComponent(svgData)}`;

    //         // Embed the SVG into your website
    //         // const container = document.getElementById('imageContainer');
    //         // container.appendChild(img);
    //         document.body.appendChild(img);

    //     })
    //     .catch(error => {
    //         // Handle any errors that occur during the request
    //         console.log("failed get, " + error);
    //     });

    // ShowDemoMap();
}


*/
function GetProjection(type) {

    // nullcheck
    if (type == null) {
        // null, just return default projection type (geoEquirectangular)
        console.warn("Cannot get projection type, given type is null, returning d3.geoEquirectangular");
        return d3.geoEquirectangular();
    }

    // ensure lowercase
    if (typeof (type) === 'string') {
        type = type.toLowerCase();
    } else {
        // not a string, invalid parsing 
        console.warn("Can't get projection from type, type isn't a string, type value: "
            + type + ", typeof: " + typeof (type) + ", returning d3.geoEquirectangular");
        return d3.geoEquirectangular();
    }

    switch (type) {

        default:
            console.log("Unsupported projection type " + type + ", returning geoEquirectangular");
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
                .rotate([0, 0, 315])
                .clipAngle(90);
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