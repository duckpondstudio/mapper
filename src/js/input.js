import * as d3 from 'd3';
import { MapData } from './classes/mapdata';
import { ProjectionData } from './classes/projectiondata';
import { Module, modules } from './classes/module';

const keyEventDown = 'keyEventDown';
const keyEventUp = 'keyEventUp';

let debugKeys = false;

let mouseDragUpdatesCoords = true;

let mouseHeld = false;
let pressedKeyCodes = [];

//#region input setup

export function InputSetup() {
    // global monitor cursor movement
    document.addEventListener('mouseenter', event => { MouseMove(event); });
    document.addEventListener('mousemove', event => { MouseMove(event); });
    document.addEventListener('mousedown', event => { MouseDown(event); });
    window.addEventListener('mouseup', event => { MouseUp(event); });
    document.addEventListener('drag', event => { DragMove(event); })
    document.addEventListener('dragstart', event => { DragStart(event); })
    document.addEventListener('dragend', event => { DragEnd(event); })
    // loss-of-focus events
    window.addEventListener('blur', event => { LossOfFocusEvent(event); });
    document.addEventListener('visibilitychange', event => {
        if (document.visibilityState === 'hidden') { LossOfFocusEvent(event); }
    });
    document.addEventListener('focusout', function (event) {
        if (event.target === document || event.target === window) { LossOfFocusEvent(event); }
    });
    // keyboard iniput 
    document.addEventListener('keydown', event => { KeyEvent(event, keyEventDown); });
    document.addEventListener('keyup', event => { KeyEvent(event, keyEventUp); });
}

/**
 * Triggers a mouse movement event
 * @param {MouseEvent} mouseEvent MouseEvent data
 * @see {@link InputSetup} calls this method
 * @see {cursor} for current mouse position
 */
function MouseMove(mouseEvent) {
    SetMousePosition(mouseEvent);

    if (mouseHeld && mouseDragUpdatesCoords) {
        TestUpdateCursorCoordinates();
    }
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

        TestUpdateCursorCoordinates();
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
 * Triggers a current drag movement event
 * @param {DragEvent} dragEvent 
 * @see {@link InputSetup} calls this method
 * @see {cursor} for current mouse position
 */
function DragMove(dragEvent) {
    SetMousePosition(dragEvent);
    mouseHeld = false;
}
/**
 * Triggers a drag start event
 * @param {DragEvent} dragEvent 
 * @see {@link InputSetup} calls this method
 * @see {cursor} for current mouse position
 */
function DragStart(dragEvent) {
    SetMousePosition(dragEvent);
    mouseHeld = false;
}
/**
 * Triggers a drag end event
 * @param {DragEvent} dragEvent 
 * @see {@link InputSetup} calls this method
 * @see {cursor} for current mouse position
 */
function DragEnd(dragEvent) {
    SetMousePosition(dragEvent);
    mouseHeld = false;// disable regardless of button, to accommodate weird right-click tomfoolery 
}

function LossOfFocusEvent(event) {
    mouseHeld = false;
}

/**
 * Assigns the current cursor position based on the supplied mouseEvent's mouse position 
 * @param {MouseEvent} mouseEvent MouseEvent data
 * @see {@link InputSetup} calls this method
 */
function SetMousePosition(mouseEvent) {
    SetCursorPosition(mouseEvent.clientX, mouseEvent.clientY);
};
/**
 * Assigns the current cursor position based on the supplied XY coordinates 
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 */
function SetCursorPosition(x, y) {
    cursor.point[0] = x;
    cursor.point[1] = y;
}

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

//#endregion input setup

//#region per-element input receivers

/**
 * User clicked on somewhere a module. Called by {@link Module}
 * @param {MouseEvent} mouseEvent MouseEvent associated with this click
 * @param {Module} module Module that was clicked on
 */
export function ClickedModule(mouseEvent, module) {

}

/**
 * User clicked on a map. Called by {@link MapData}
 * @param {MouseEvent} mouseEvent MouseEvent associated with this click 
 * @param {MapData} mapData {@link MapData} that was clicked on
 */
export function ClickedMap(mouseEvent, mapData) {
    mapData.AddDot(cursor.point);
}

/**
 * User clicked on a specific map projection. Called by {@link ProjectionData}
 * @param {MouseEvent} mouseEvent MouseEvent associated with this click 
 * @param {ProjectionData} projection {@link ProjectionData} that was clicked on
 */
export function ClickedProjection(mouseEvent, projection) {
    projection.OutputDataAtPoint(cursor.point);
}

//#endregion per-element input receivers


/** Uses {@link ProjectionData}'s OutputDataAtPoint to display long/lat coordinate information at the cursor */
function TestUpdateCursorCoordinates() {
    // iterate thru all modules 
    for (let i = 0; i < modules.length; i++) {
        // check if the current module's mapData contains the cursor 
        if (modules[i].mapData.IsPointWithinContainer(cursor.point)) {
            let projection = modules[i].mapData.GetProjectionAtPoint(cursor.point);
            if (projection != null) {
                // update that projection's lat/long info 
                projection.OutputDataAtPoint(cursor.point);
            }
        }
    }
}