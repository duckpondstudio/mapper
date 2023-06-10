import * as d3 from 'd3';
import { parse, stringify } from 'transform-parser';
import { mapSize } from './mapgen';

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
        let xy = [x, y];
        console.log("clicked " + selectedSVG.attr('id'));
        console.log("Pixel X/Y: " + pointer[0] + "/" + pointer[1]);

        let transform;
        let g = selectedSVG.select('g');
        if (g) {
            transform = g.attr('transform');
            if (transform) {
                // transform found, be sure to update mouse x/y accordingly
                console.log("TEST");

                let t = parse(transform);
                console.log("t.translate: " + t.translate);
                console.log("t.rotate " + t.rotate);
                console.log("t.rotate[1] " + t.rotate[1]);
                console.log("typeof t trans: " + (typeof t.translate));
                console.log("typeof t rotate: " + (typeof t.rotate));
                // accommodate rotation 
                if (t.rotate) {
                    console.log("pre xy: " + xy);
                    xy = RotateAround(mapSize, mapSize, x, y, t.rotate[0]);
                    console.log("post xy: " + xy);
                }
                // accommodate translation 
                if (t.translate) {
                    xy[0] -= t.translate[0];
                    xy[1] -= t.translate[1];
                }
                x = xy[0];
                y = xy[1];
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