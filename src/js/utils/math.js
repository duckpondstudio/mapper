

/**
 * Rotate the given XY point around the given pivot XY by the given angle in degrees 
 *
 * @param {number} pivotX X point to rotate 
 * @param {number} pivotY Y point to rotate
 * @param {number} pointX X pivot to rotate around
 * @param {number} pointY Y pivot to rotate around
 * @param {number} angle Angle, in degrees, to rotate by 
 * @return {number[]} Two-value number array where [0] is resulting X and [1] is resulting Y 
 */
export function RotateAround(pivotX, pivotY, pointX, pointY, angle) {
    let radians = (Math.PI / 180) * angle;
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);
    let newX = (cos * (pointX - pivotX)) + (sin * (pointY - pivotY)) + pivotX;
    let newY = (cos * (pointY - pivotY)) - (sin * (pointX - pivotX)) + pivotY;
    return [newX, newY];
}

/**
 * Returns the normalized value between min and max 
 * 
 * Eg, if value=200, min=100, and max=300, returns 0.5
 * @param {number} value Value to normalize relative to min and max
 * @param {number} min Minimum extent of the range of normalization
 * @param {number} max Maximum extent of the range of normalization
 * @param {boolean=false} clamp Optional. Clamp value between 0 and 1? Default false
 * @returns {number} Normalized number for value's ratio between min and max
 */
export function NormalizeValue(value, min, max, clamp = false) {
    let v = (value - min) / (max - min);
    if (clamp) { if (v < 0) { v = 0; } else if (v > 1) { v = 1; } }
    return v;
}

/**
 * Convert a normalized value to its non-normalized state, given the min/max values. 
 * 
 * Eg if value=0.5, min=100, and max=300, returns 200
 * @param {number} value Value as a ratio min/max to invert. 
 * Typically between 0 and 1, see {@link clamp}
 * @param {number} min Min value of the range to invert normalization
 * @param {number} max Max value of the range to invert normalization
 * @param {boolean=false} clamp Optional, default false. Clamp value between 0 and 1? 
 *  If true, <=0 returns min, >=1 returns max
 * @returns Inverted normalized value, non-normalized
 */
export function InvertNormalizedValue(value, min, max, clamp = false) {
    if (clamp) { if (value <= 0) { return min; } else if (value >= 1) { return max; } }
    let range = max - min;
    return (value * range) + min;
}