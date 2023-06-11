import * as d3 from 'd3';
import { mapSize } from './mapgen';
import { MapData, ProjectionData } from './mapdata';

/** Apply input events to the supplied D3 map SVG
 * @param {ProjectionData} projectionData Contains all data refs for this specific projection 
 */
function AssignInput(projectionData) {
    // target is the clicked map, event is pointer info
    projectionData.svg.on("click", function (event, target) {
        let pointer = d3.pointer(event, target);
        projectionData.OutputXYData(pointer[0], pointer[1]);
    });
}

export { AssignInput };