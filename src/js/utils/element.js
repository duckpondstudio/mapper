const generousRounding = 'generous';
const narrowRounding = 'narrow';
const floorRounding = 'floor';
const ceilRounding = 'ceil';
const noneRounding = 'none';
const defaultRounding = 'default';

/**
 * Returns the {@link DOMRect} for the given {@link HTMLElement} positioned globally
 * @param {HTMLElement} element DOM element to read
 * @param {string} [roundingType=generousRounding] Rounding type to use? See {@link RoundRect}
 * @returns {DOMRect} The {@link DOMRect} for this element, positioned globally
 */
export function GetBoundingGlobalRect(element, roundingType = generousRounding) {
    let rect = getBoundingClientRect(element);
    let globalOffset = GetGlobalXYOffset(element);
    rect.x = globalOffset.x;
    rect.y = globalOffset.y;
    rect.top = rect.height < 0 ? rect.y + rect.height : rect.y;
    rect.left = rect.width < 0 ? rect.x + rect.width : rect.x;
    rect.bottom = rect.height < 0 ? rect.y : rect.y + rect.height;
    rect.right = rect.width < 0 ? rect.x : rect.x + rect.width;
    rect = RoundRect(rect, roundingType);
    return rect;
}
/**
 * Get the absolute (global, relative to page) X/Y position offset
 * for the given DOM element
 * @param {HTMLElement} element DOM element to read
 * @returns {Object} Object with .x and .y representing the 
 * given element's absolute X/Y offset
 */
export function GetGlobalXYOffset(element) {
    // credit: https://stackoverflow.com/a/28222246/12888769
    const rect = element.getBoundingClientRect();
    return {
        x: rect.x + window.scrollX,
        y: rect.y + window.scrollY
    };
}

/**
 * Gets this element's {@link DOMRect} using 
 * {@link HTMLElement.getBoundingClientRect getBoundingClientRect}, 
 * and returns a modifiable copy of it.
 * @param {HTMLElement} element DOM element to read rect from 
 * @returns {DOMRect} Modifiable {@link DOMRect}
 */
const getBoundingClientRect = element => {
    const { x, y, width, height, top, bottom, left, right } = element.getBoundingClientRect()
    return { x, y, width, height, top, bottom, left, right }
}

/**
 * Rounds all values in the given {@link DOMRect}
 * @param {DOMRect} rect Input {@link DOMRect} value
 * @param {string} [rounding=defaultRounding] Rounding type to use? 
 * - {@link generousRounding} Generous rounding expands rect (eg top/right are ceil, left/bottom are floor)
 * - {@link narrowRounding} Narrow rounding contracts rect (eg top/right are floor, left/bottom are ceil)
 * - {@link floorRounding} Floor rounding uses Math.floor for all values
 * - {@link ceilRounding} Ceil rounding uses Math.ceil for all values
 * - {@link defaultRounding} Default rounding uses Math.round for all values
 * - {@link noneRounding} None rounding simply returns the input rect
 * @returns {DOMRect} Rounded {@link DOMRect}
 */
export function RoundRect(rect, rounding = defaultRounding) {
    switch (rounding) {
        case noneRounding:
        case noneRounding + "Rounding":
            return rect;
        case generousRounding:
        case generousRounding + "Rounding":
            rect.x = Math.floor(rect.x);
            rect.y = Math.ceil(rect.y);
            rect.top = Math.ceil(rect.top);
            rect.left = Math.floor(rect.left);
            rect.bottom = Math.floor(rect.bottom);
            rect.right = Math.ceil(rect.right);
            break;
        case narrowRounding:
        case narrowRounding + "Rounding":
            rect.x = Math.ceil(rect.x);
            rect.y = Math.floor(rect.y);
            rect.top = Math.floor(rect.top);
            rect.left = Math.ceil(rect.left);
            rect.bottom = Math.ceil(rect.bottom);
            rect.right = Math.floor(rect.right);
            break;
        case floorRounding:
        case floorRounding + "Rounding":
            rect.x = Math.floor(rect.x);
            rect.y = Math.floor(rect.y);
            rect.top = Math.floor(rect.top);
            rect.left = Math.floor(rect.left);
            rect.bottom = Math.floor(rect.bottom);
            rect.right = Math.floor(rect.right);
            break;
        case ceilRounding:
        case ceilRounding + "Rounding":
            rect.x = Math.ceil(rect.x);
            rect.y = Math.ceil(rect.y);
            rect.top = Math.ceil(rect.top);
            rect.left = Math.ceil(rect.left);
            rect.bottom = Math.ceil(rect.bottom);
            rect.right = Math.ceil(rect.right);
            break;
        case defaultRounding:
        case defaultRounding + "Rounding":
        default:
            rect.x = Math.round(rect.x);
            rect.y = Math.round(rect.y);
            rect.top = Math.round(rect.top);
            rect.left = Math.round(rect.left);
            rect.bottom = Math.round(rect.bottom);
            rect.right = Math.round(rect.right);
            break;
    }
    return rect;
}