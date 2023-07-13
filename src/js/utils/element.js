/**
 * 
 * @param {HTMLElement} element 
 */
export function GetBoundingGlobalRect(element) {
    let rect = getBoundingClientRect(element);
    let globalOffset = GetGlobalXYOffset(element);
    rect.x = globalOffset.x;
    rect.y = globalOffset.y;
    rect.top = rect.height < 0 ? rect.y + rect.height : rect.y;
    rect.left = rect.width < 0 ? rect.x + rect.width : rect.x;
    rect.bottom = rect.height < 0 ? rect.y : rect.y + rect.height;
    rect.right = rect.width < 0 ? rect.x : rect.x + rect.width;
    return rect;
}
export function GetGlobalXYOffset(element) {
    // credit: https://stackoverflow.com/a/28222246/12888769
    const rect = element.getBoundingClientRect();
    return {
        x: rect.x + window.scrollX,
        y: rect.y + window.scrollY
    };
}

/**  */
const getBoundingClientRect = element => {
    console. log("1");
    const { x, y, width, height, top, bottom, left, right } = element.getBoundingClientRect()
    return { x, y, width, height, top, bottom, left, right }
}