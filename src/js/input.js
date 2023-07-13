import * as d3 from 'd3';
import * as test from './test';
import { MapData } from './classes/mapdata';
import { ProjectionData } from './classes/projectiondata';
import { Module, current } from './classes/module';
import { PreventKeyboardEventShiftKeyModification } from './utils/string.js';

const keyEventDown = 'keyEventDown';
const keyEventUp = 'keyEventUp';

let debugKeys = false;

let mouseClickUpdatesCoords = false;
let mouseDragUpdatesCoords = false;

let mouseHeld = false;
let pressedKeys = [];

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

        if (mouseClickUpdatesCoords)
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
    SetCursorPosition(mouseEvent.pageX, mouseEvent.pageY);
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
    // ensure key value isn't mucked about with by Shift key (eg no @, only 2)
    keyEvent = PreventKeyboardEventShiftKeyModification(keyEvent);
    let key = keyEvent.key.toLowerCase();// force key values to lowercase 
    let index = pressedKeys.indexOf(key);
    let initialDown = type == keyEventDown && index == -1;
    let debugValid = debugKeys && (type != keyEventDown || initialDown);
    if (debugValid) {
        console.log("Begin KeyEvent %s, key: %s, pressedKeys: %o", type, key, pressedKeys)
    }

    switch (type) {
        case keyEventDown:
            if (initialDown) {
                // key pressed initially 
                pressedKeys.push(key);
                initialDown = true;

                // note that for simplicity, all key values are lowercase here 
                switch (key) {
                    case ' ':
                        // pressed space
                        KeySpace();
                        break;
                    case 'enter':
                        // pressed enter key
                        KeyEnter();
                        break;
                    case 'escape':
                        // pressed escape key
                        KeyEsc();
                        break;

                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        KeyNumber(parseInt(key));
                        // check if triggering a numeric test 
                        if (IsShiftHeldEvent(keyEvent) && IsKeyHeld(test.testKey)) {
                            test.NumericTest(parseInt(key));
                        }
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
                pressedKeys.splice(index, 1);
            } else {
                // should be impossible
                console.warn('Key', key, 'released that is not in the pressedKeys array, should be impossible,',
                    'likely a browser glitch, investigate. PressedKeys: ', pressedKeys);
            }
            break;
        default:
            console.warn("Invalid KeyEvent type %s, cannot process KeyEvent, key: %s", type, key);
            break;
    }
    if (debugValid) {
        console.log("Complete KeyEvent %s, key: %s, pressedKeys: %o", type, key, pressedKeys)
    }
}

/**
 * Returns true if the supplied key is currently held, eg '3', 'Shift', etc
 * @param {string} key Key to check, eg '3', 'Shift', etc
 * @returns {boolean}
 */
export function IsKeyHeld(key) {
    key = key.toLowerCase();
    if (key == 'space') { key = ' '; }
    return pressedKeys.includes(key);
}

/**
 * Globally accessible read-only check if shift key is currently held 
 * - If calling with access to a {@link KeyboardEvent}, recommended use {@link IsShiftHeldEvent}
 */
export function IsShiftHeld() {
    return pressedKeys.includes('shift');
}
/**
 * 
 * @param {KeyboardEvent} keyEvent 
 * @returns 
 */
export function IsShiftHeldEvent(keyEvent) {
    return keyEvent.shiftKey || IsShiftHeld();
}

/** Object reference to the user's primary cursor position */
export const cursor = {
    point: [0, 0],
    get x() { return this.point[0]; },
    get y() { return this.point[1]; }
}

//#endregion input setup

//#region useful key events

/** User pressed the spacebar */
function KeySpace() {
    test.DrawNormalizedDots(current.map);
}

/** User pressed the enter/return key */
function KeyEnter() {
}

/** User pressed the escape key */
function KeyEsc() {
}

/**
 * User pressed the given number key
 * @param {Number} num 
 */
function KeyNumber(num) {
    switch (num) {
        case 0:
            break;
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        case 4:
            break;
        case 5:
            break;
        case 6:
            break;
        case 7:
            break;
        case 8:
            break;
        case 9:
            break;
    }
}

//#endregion useful key events 

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
    mapData.AddDotAtGlobalPoint(cursor.point);
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
    // check if the current module's mapData contains the cursor 
    if (current.map.IsPointWithinContainer(cursor.point)) {
        let projection = current.map.GetProjectionAtPoint(cursor.point);
        if (projection != null) {
            // update that projection's lat/long info 
            projection.OutputDataAtPoint(cursor.point);
        }
    }
}