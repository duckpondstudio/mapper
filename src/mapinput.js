import * as d3 from 'd3';

/**
 * Apply input events to the supplied D3 SVG
 * @param {*} svg D3 generated map SVG to which input events will be applied
 */
function MapInput(svg) {
    // target is the clicked map, event is pointer info
    svg.on("click", function (event, target) {
        var pointer = d3.pointer(event, target);
        console.log("click " + pointer[0] + "," + pointer[1]);
        // give each map self-ref unique element ID
        // use that id along with target to determine click target
        // use mouse[0/1] as pixel points on that target
        // use pixel pts to get long/lat
        // output long lat to console
        // output long lat to screen
    });
}

export { MapInput };