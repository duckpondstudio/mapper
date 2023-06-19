import * as d3 from 'd3';
import { MapData, ProjectionData } from './mapcont';

const keyEventDown = 'keyEventDown';
const keyEventUp = 'keyEventUp';

let pressedKeyCodes = [];

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
    // keyboard iniput 
    document.addEventListener('keydown', event => { KeyEvent(event, keyEventDown); });
    document.addEventListener('keyup', event => { KeyEvent(event, keyEventUp); });
}

/**
 * Assigns the current mouse position based on the supplied mouseEvent
 * @param {MouseEvent} mouseEvent MouseEvent data
 * @see {@link InputSetup} calls this method
 */
function SetMousePosition(mouseEvent) {
    cursor.point[0] = mouseEvent.clientX;
    cursor.point[1] = mouseEvent.clientY;
};

/**
 * Process a keyboard event
 *
 * @param {KeyboardEvent} keyEvent KeyboardEvent data 
 * @param {string} type Event type, see {@link keyEventDown} and {@link keyEventUp}
 * @see {@link InputSetup} calls this method
 */
function KeyEvent(keyEvent, type) {
    let index = -1;
    let key = keyEvent.key;
    switch (type) {
        case keyEventDown:
            index = pressedKeyCodes.indexOf(key);
            if (index == -1) {
                // key pressed initially 
                pressedKeyCodes.push(key);
            } else {
                // key pressed + held
            }
            // key pressed AND held 
            break;
        case keyEventUp:
            // key released 
            index = pressedKeyCodes.indexOf(key);
            if (index >= 0) {
                // key released
                pressedKeyCodes.splice(index, 1);
            } else {
                // should be impossible
                console.warn('Key released that is not in the pressedKeyCodes array, should be impossible, ',
                    'likely a browser glitch, investigate. PressedKeyCodes: ', pressedKeyCodes);
            }
            break;
        default:
            console.warn("Invalid KeyEvent type %s, cannot process KeyEvent, key: %s", type, key);
            break;
    }
}

/** Object reference to the user's primary cursor position */
export const cursor = {
    point: [0, 0],
    get x() { return this.point[0]; },
    get y() { return this.point[1]; }
}

export { AssignInput, InputSetup };