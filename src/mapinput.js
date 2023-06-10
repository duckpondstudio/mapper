import * as d3 from 'd3';
import { parse, stringify } from 'transform-parser';

/**
 * Apply input events to the supplied D3 map SVG
 * @param {d3.Selection} selectedSVG D3 selection of generated map SVG to which input events will be applied
 * @param {d3.GeoProjection} projection Associated geoprojection data for this map 
 * @param {HTMLParagraphElement} output Element where output text is displayed
 */
function MapInput(selectedSVG, projection, output) {
    // target is the clicked map, event is pointer info
    selectedSVG.on("click", function (event, target) {
        let pointer = d3.pointer(event, target);
        let x = pointer[0];
        let y = pointer[1];
        console.log("clicked " + selectedSVG.attr('id'));
        console.log("Pixel X/Y: " + pointer[0] + "/" + pointer[1]);

        let transform;
        let g = selectedSVG.select('g');
        if (g) {
            transform = g.attr('transform');
            if (transform) {
                // transform found, be sure to update mouse x/y accordingly
                let t = parse(transform);
                
            }
        }
        console.log("transform: " + transform);
        
        let latLong = projection.invert([x, y]).reverse();

        console.log('LatLong A: ' + latLong);

        // DONE give each map self-ref unique element ID
        // use that id along with target to determine click target
        // use mouse[0/1] as pixel points on that target
        // use pixel pts to get long/lat
        // output long lat to console
        // output long lat to screen
    });
}

function RotateAround(pivotX, pivotY, pointX, pointY, angle) {
    let radians = (Math.PI / 180) * angle;
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);
    let newX = (cos * (pointX - pivotX)) + (sin * (pointY - pivotY)) + pivotX;
    let newY = (cos * (pointY - pivotY)) - (sin * (pointX - pivotX)) + pivotY;
    return [newX, newY];
}

export { MapInput };