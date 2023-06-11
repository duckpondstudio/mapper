import * as d3 from 'd3';
import { parse, stringify } from 'transform-parser';
import { mapSize } from './mapgen';
import { MapData, ProjectionData } from './mapdata';

/** Apply input events to the supplied D3 map SVG
 * @param {ProjectionData} projectionData Contains all data refs for this specific projection 
 */
function AssignInput(projectionData) {
    let selectedSVG = projectionData.svg;
    let output = projectionData.mapData.output;
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
                let t = parse(transform);
                // accommodate rotation 
                if (t.rotate) {
                    xy = RotateAround(mapSize, mapSize, x, y, t.rotate[0]);
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
        let latLong = projectionData.projection.invert([x, y]).reverse();
        projectionData.mapData.OutputText(
            ("Clicked Latitude: " + latLong[0]).toString(),
            "Clicked Longitude: " + latLong[1]
        );
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

export { AssignInput };