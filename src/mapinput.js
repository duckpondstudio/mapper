import * as d3 from 'd3';

/**
 * Apply input events to the supplied D3 map SVG
 * @param {d3.Selection} selectedSVG D3 selection of generated map SVG to which input events will be applied
 * @param {d3.GeoProjection} projection Associated geoprojection data for this map 
 */
function MapInput(selectedSVG, projection) {
    // target is the clicked map, event is pointer info
    selectedSVG.on("click", function (event, target) {
        var pointer = d3.pointer(event, target);
        console.log("clicked " + selectedSVG.attr('id'));
        console.log("Pixel X/Y: " + pointer[0] + "/" + pointer[1]);
        console.log("1a Long/Lat: " + projection.invert([pointer[0], pointer[1]]));
        console.log("1b Long/Lat: " + projection.invert([pointer[1], pointer[0]]));
        console.log("2a Long/Lat: " + projection([pointer[0], pointer[1]]));
        console.log("2b Long/Lat: " + projection([pointer[1], pointer[0]]));
        // give each map self-ref unique element ID
        // use that id along with target to determine click target
        // use mouse[0/1] as pixel points on that target
        // use pixel pts to get long/lat
        // output long lat to console
        // output long lat to screen
    });
}

export { MapInput };