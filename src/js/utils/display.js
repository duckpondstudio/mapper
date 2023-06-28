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
    let c = document.createElement('canvas');
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