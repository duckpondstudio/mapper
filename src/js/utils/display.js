// credit to https://stackoverflow.com/a/15666143/12888769 
let _prSet;
let _pr;
let _PIXEL_RATIO = (function () {
    let c = document.createElement('canvas');
    let ctx = c.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    let bsr = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;
    c.remove();
    return dpr / bsr;
})();

export let PixelRatio = (function () {
    if (_prSet !== true) {
        _pr = _PIXEL_RATIO;
        _prSet = true;
    }
    return _pr;
})();

export function CreateHDPICanvas(width = 0, height = 0) {
    // TODO: prevent canvas right-click while allowing right-click to screen below
    // TODO: make canvas right-click image output a merged image of overlay + map (all projections)
    let c = document.createElement('canvas');
    // assign class 
    c.setAttribute('class', 'mapOverlayCanvas');
    // if width/height are initially defined, assign them 
    if (width != 0 || height != 0) {
        SetHDPICanvasSize(c, width, height);
    }
    return c;
}

export function SetHDPICanvasSize(canvas, width, height) {
    canvas.width = width * PixelRatio;
    canvas.height = height * PixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.getContext('2d').setTransform(
        PixelRatio, 0, 0, PixelRatio, 0, 0);
}