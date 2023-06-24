import * as d3 from 'd3';
import { MapData, ProjectionData } from './mapdata';
import { modules } from './module';

const keyEventDown = 'keyEventDown';
const keyEventUp = 'keyEventUp';

let debugKeys = false;

let mouseDragUpdatesCoords = false;

let mouseHeld = false;
let pressedKeyCodes = [];


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
    console.log("LOSS OF FOCUS");
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

                        let avgLatLongToXY = false;
                        let avgXYToLatLong = false;

                        switch (1) {
                            case 0:
                                //  proj[0] (falkland islands) off patagonia
                                let xyAtLatLong = modules[0].mapData.XYPointAtLatLong(-52.169, -60.511, avgLatLongToXY);
                                let latLongAtXY = modules[0].mapData.LatLongAtPoint([118, 205], avgXYToLatLong);
                                console.log("LatLong to XY (should be ~[118, 205])");
                                console.log(xyAtLatLong);
                                console.log("XY to LatLong (should be ~[52.169, -60.511])");
                                console.log(latLongAtXY);
                                break;
                            case 1:

                                //  proj[1] middle of france
                                let xyAtLatLong1 = modules[0].mapData.XYPointAtLatLong(40, -5.6, avgLatLongToXY);
                                let latLongAtXY1 = modules[0].mapData.LatLongAtPoint([239, 193], avgXYToLatLong);
                                console.log("LatLong to XY (should be ~[239, 193])");
                                console.log(xyAtLatLong1);
                                console.log("XY to LatLong (should be ~[40, 5.6])");
                                console.log(latLongAtXY1);
                                break;
                            case 2:

                                //  proj[2] middle of aus
                                let xyAtLatLong2 = modules[0].mapData.XYPointAtLatLong(-25.304, 132.858, avgLatLongToXY);
                                let latLongAtXY2 = modules[0].mapData.LatLongAtPoint([410, 216], avgXYToLatLong);
                                console.log("LatLong to XY (should be ~[410, 216])");
                                console.log(xyAtLatLong2);
                                console.log("XY to LatLong (should be ~[25.3, 132.86])");
                                console.log(latLongAtXY2);
                                break;
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



/** Uses {@link ProjectionData}'s OutputDataAtPoint to display long/lat coordinate information at the cursor */
function TestUpdateCursorCoordinates() {
    // iterate thru all modules 
    for (let i = 0; i < modules.length; i++) {
        // check if the current module's mapData contains the cursor 
        if (modules[i].mapData.IsPointWithinContainer(cursor.point)) {
            // get which, if any, projection is under the cursor

            // test ALL projections long/lat
            // for (let j = 0; j < modules[i].mapData.projections.length; j++) {
            //     let p = modules[i].mapData.projections[j];
            //     console.log('P', j, ' LatLong at Cursor: ', p.LatLongAtPoint(cursor.point));
            // }

            let nonAvgL = modules[i].mapData.LatLongAtPoint(cursor.point, false);
            let avgL = modules[i].mapData.LatLongAtPoint(cursor.point);
            let nonAvgLToNonAvgC = modules[i].mapData.XYPointAtLatLongPoint(nonAvgL, false);
            let nonAvgLToAvgC = modules[i].mapData.XYPointAtLatLongPoint(nonAvgL);
            let avgLToNonAvgC = modules[i].mapData.XYPointAtLatLongPoint(avgL, false);
            let avgLToAvgC = modules[i].mapData.XYPointAtLatLongPoint(avgL);

            console.log(" ============================= ");
            console.log(" CONTROL LATLONG AT CLICK: ", modules[i].mapData.GetProjectionAtPoint(cursor.point).LatLongAtPoint(cursor.point));
            console.log("  DIRECT LATLONG AT CLICK: ", nonAvgL);
            console.log("  AVERAGED LATLONG AT CLICK: ", avgL);
            console.log(" ============================= ");
            console.log(" CLICK POINT: ", cursor.point);
            console.log("  NONAVG L TO NONAVG C: ", nonAvgLToNonAvgC);
            console.log("  NONAVG L TO AVG C: ", nonAvgLToAvgC);
            // console.log("  AVG L TO NONAVG C: ", avgLToNonAvgC, false);
            // console.log("  AVG L TO AVG C: ", avgLToAvgC);

            let projection = modules[i].mapData.GetProjectionAtPoint(cursor.point);
            if (projection != null) {
                // update that projection's lat/long info 
                projection.OutputDataAtPoint(cursor.point);
            }
        }
    }
}