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

function InputSetup() {
    // global monitor cursor movement
    document.addEventListener('mouseenter', event => { SetMousePosition(event); });
    document.addEventListener('mousemove', event => { SetMousePosition(event); });
    document.addEventListener('mousedown', event => { SetMousePosition(event); });
}

/**
 * Assigns the current mouse position based on the supplied mouseEvent
 * @param {MouseEvent} mouseEvent
 */
function SetMousePosition(mouseEvent) {
    pos.point[0] = mouseEvent.clientX;
    pos.point[1] = mouseEvent.clientY;
    console.log("X: " + pos.x + ", Y: " + pos.y);
};

const pos = {
    point: [0, 0],
    get x() { return this.point[0]; },
    get y() { return this.point[1]; }
}

export { AssignInput };