
import demoMap from './img/grieger-triptychial-political.png';
import geojson from './demo.geojson';
// import worldGeoJson from './world.geo.json';
// const worldGeoJson = require('./world.geo.json');

import * as Canvas from './canvas';
import * as d3 from 'd3';

var container;
var svg;
var map;

var width = '800px';
var height = '400px';


function GenerateCanvas() {
    console.log("generating canvas");

    container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);

    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // svg.setAttribute("id", "container");
    svg.style.width = width;
    svg.style.height = height;
    container.appendChild(svg);

    map = document.createElement("g");
    map.setAttribute('class', 'map');
    svg.appendChild(map);

    RetrieveProjection();
}


function RetrieveProjection() {

    let projection = d3.geoEquirectangular()
        .scale(200)
        .translate([200, 150]);

    let geoGenerator = d3.geoPath()
        .projection(projection);

    let u = d3.select('#container g.map')
        .selectAll('path')
        .data(geojson.features);

    u.enter()
        .append('path')
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



function GetProjection(type) {
    switch (type) {

        default:
            console.log("equi");
            return d3.geoEquirectangular();

        case "adams":
            return d3.geoProjection(function (x, y) {
                var s = y < 0 ? -1 : 1; // Hemisphere determination

                var xn = (x / 180) - 1; // Normalized longitude
                var yn = s * Math.sqrt(1 - (Math.abs(y) / 90) ** 2); // Normalized latitude

                var maxAbs = Math.max(Math.abs(xn), Math.abs(yn)); // Maximum absolute value

                // Map the normalized coordinates to the square
                var mappedX = xn / maxAbs * (width / 2);
                var mappedY = yn / maxAbs * (height / 2);

                return [mappedX, mappedY];
            });
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