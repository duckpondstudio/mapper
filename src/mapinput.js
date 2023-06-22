import * as d3 from 'd3';
import { MapData, ProjectionData } from './mapcont';
import { modules } from './index';

const keyEventDown = 'keyEventDown';
const keyEventUp = 'keyEventUp';

let debugKeys = false;

let mouseHeld = false;
let pressedKeyCodes = [];

/** Apply input events to the supplied D3 map SVG
 * @param {ProjectionData} projectionData Contains all data refs for this specific projection 
 */
function AssignInput(projectionData) {
    // target is the clicked map, event is pointer info
    projectionData.svg.on("click", function (event, target) {
        let pointer = d3.pointer(event, target);
        console.log('pointer', pointer);
        console.log('cursor.point', cursor.point);
        projectionData.OutputDataAtXY(pointer[0], pointer[1]);
    });
}

function UpdateCoordinates(mouseEvent) {
    
    for (let i = 0; i < modules.length; i++) {
        if (modules[i].mapData.IsPointWithinContainer(cursor.point)) {
            modules[i].mapData.GetProjectionAtPoint(cursor.point).
                OutputDataAtPoint(cursor.point);
        }
    }
}


function InputSetup() {
    // global monitor cursor movement
    document.addEventListener('mouseenter', event => { MouseMove(event); });
    document.addEventListener('mousemove', event => { MouseMove(event); });
    document.addEventListener('mousedown', event => { MouseDown(event); });
    window.addEventListener('mouseup', event => { MouseUp(event); });
    // keyboard iniput 
    document.addEventListener('keydown', event => { KeyEvent(event, keyEventDown); });
    document.addEventListener('keyup', event => { KeyEvent(event, keyEventUp); });
}

/**
 * Triggers a mouse down event
 * @param {MouseEvent} mouseEvent MouseEvent data
 * @see {@link InputSetup} calls this method
 * @see {cursor} for current mouse position
 */
function MouseDown(mouseEvent) {
    SetMousePosition(mouseEvent);

    if (mouseEvent.button === 0) {
        mouseHeld = true;

        UpdateCoordinates();
    }
}
/**
 * Triggers a mouse up event
 * @param {MouseEvent} mouseEvent MouseEvent data
 * @see {@link InputSetup} calls this method
 * @see {cursor} for current mouse position
 */
function MouseUp(mouseEvent) {
    SetMousePosition(mouseEvent);
    
    if (mouseEvent.button === 0) {
        mouseHeld = false;
    }
}

/**
 * Triggers a mouse movement event
 * @param {MouseEvent} mouseEvent MouseEvent data
 * @see {@link InputSetup} calls this method
 * @see {cursor} for current mouse position
 */
function MouseMove(mouseEvent) {
    SetMousePosition(mouseEvent);

    if (mouseHeld) {
        UpdateCoordinates(mouseEvent);
    }
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
    let key = keyEvent.key;
    let index = pressedKeyCodes.indexOf(key);
    let initialDown = type == keyEventDown && index == -1;
    let debugValid = debugKeys && (type != keyEventDown || initialDown);
    if (debugValid) {
        console.log("Begin KeyEvent %s, key: %s, pressedKeyCodes: %o", type, key, pressedKeyCodes)
    }
    switch (type) {
        case keyEventDown:
            if (initialDown) {
                // key pressed initially 
                pressedKeyCodes.push(key);
                initialDown = true;

                switch (key) {
                    case ' ':
                        // pressed space 
                        console.log(modules[0].mapData.GetProjectionAtXYNormalized(0.5, 0.5));
                        break;
                }

            } else {
                // key pressed + held
            }
            // key pressed AND held 
            break;
        case keyEventUp:
            // key released 
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
    if (debugValid) {
        console.log("Complete KeyEvent %s, key: %s, pressedKeyCodes: %o", type, key, pressedKeyCodes)
    }
}

/** Object reference to the user's primary cursor position */
export const cursor = {
    point: [0, 0],
    get x() { return this.point[0]; },
    get y() { return this.point[1]; }
}

export { AssignInput, InputSetup };