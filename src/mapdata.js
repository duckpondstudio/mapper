import * as d3 from 'd3';
import { parse, stringify } from 'transform-parser';
import { cursor } from './mapinput';

/** Container for all data related to displaying a map */
export class MapData {
    map;
    module;
    index = -1;
    projectionsContainer;
    projections = [];
    #output;
    #containerRect;
    constructor(
        module, projections = []) {
        this.map = module.map;
        this.module = module;
        this.index = this.module.moduleId;

        // create projections container 
        this.projectionsContainer = document.createElement('div');
        this.projectionsContainer.setAttribute('id', 'mod' + this.module.moduleId + '_projectionsCont');
        this.projectionsContainer.setAttribute('class', 'projectionsContainer');
        this.module.mapSubModule.appendChild(this.projectionsContainer);

        // define container rect
        this.#containerRect = this.projectionsContainer.getBoundingClientRect();
        // create output 
        this.#output = document.createElement('p');
        this.#output.setAttribute('id', 'mod' + module.moduleId + '_map' + 1 + '_output_' + this.index);
        this.module.dataSubModule.appendChild(this.#output);
        this.OutputText("Output goes here");
        for (let i = 0; i < projections.length; i++) {
            this.AddProjection(projections[i]);
        }
    }

    /** Add the given ProjectionData as a child of this MapData 
     * @param {ProjectionData} projection ProjectionData to add to this MapData */
    AddProjection(projection) {
        if (!projection) { return; }
        this.projections.push(projection);
        // update container rect
        this.#containerRect = this.projectionsContainer.getBoundingClientRect();
    }


    GetContainerOrigin() {
        return [this.GetContainerOriginX(), this.GetContainerOriginY()];
    }
    GetContainerOriginX() {
        return this.#containerRect.left;
    }
    GetContainerOriginY() {
        return this.#containerRect.top;
    }
    GetContainerExtent() {
        return [this.GetContainerExtentX(), this.GetContainerExtentY()];
    }
    GetContainerExtentX() {
        return this.GetContainerOriginX() + this.GetContainerWidth();
    }
    GetContainerExtentY() {
        return this.GetContainerOriginY() + this.GetContainerHeight();
    }

    /** Find the XY offset of the current cursor position from this container's origin
     * @return {number[]} two-value number array representing the XY coords 
     * offset from this container 
     * @memberof MapData
     */
    GetContainerCursorOffset() {
        return this.GetContainerPointOffset(cursor.point);
    }
    /** Find the XY offset of the given point from this container's origin
     * @param {number[]} xy two-value number array for the XY coords
     * of the point you want to find offset from this container
     * @return {number[]} two-value number array representing the XY coords 
     * offset from this container 
     * @memberof MapData
     */
    GetContainerPointOffset(xy) {
        return [this.GetContainerXOffset(xy[0]), this.GetContainerYOffset(xy[1])];
    }
    /** Find the XY offset of the given XY coords from this container's origin
     * @param {number} x X-coord you want to find offset from this container for
     * @param {number} y Y-coord you want to find offset from this container for
     * @return {number[]} two-value number array representing the XY coords 
     * offset from this container 
     * @memberof MapData
     */
    GetContainerXYOffset(x, y) {
        return [this.GetContainerXOffset(x), this.GetContainerYOffset(y)];
    }
    /** Find the X offset of the given point from this container's origin
     * @param {number} x X-coord you want to find offset from this container for
     * @return {number} value of the X offset from this container 
     * @memberof MapData
     */
    GetContainerXOffset(x) {
        return x - this.#containerRect.left;
    }
    /** Find the Y offset of the given point from this container's origin
     * @param {number} y Y-coord you want to find offset from this container for
     * @return {number} value of the Y offset from this container 
     * @memberof MapData
     */
    GetContainerYOffset(y) {
        return y - this.#containerRect.top;
    }

    GetContainerWidth() {
        return this.projectionsContainer.clientWidth;
    }
    GetContainerHeight() {
        return this.projectionsContainer.clientHeight;
    }
    GetContainerSize() {
        return [this.GetContainerWidth(), this.GetContainerHeight()];
    }

    IsXYWithinContainer(x, y, offsetToProjection = false) {
        // offsetToProjection should usually be FALSE here, this by default works with screenspace coords
        if (offsetToProjection) { x = this.GetContainerXOffset(x); y = this.GetContainerYOffset(y); }
        let origin = this.GetContainerOrigin();
        if (x < origin[0] || y < origin[1]) { return false; }
        let extent = this.GetContainerExtent();
        if (x > extent[0] || y > extent[1]) { return false; }
        return true;
    }
    IsPointWithinContainer(xy, offsetToProjection = false) {
        // offsetToProjection should usually be FALSE here, this by default works with screenspace coords
        return this.IsXYWithinContainer(xy[0], xy[1], offsetToProjection);
    }

    GetXYRatio(x, y, offsetToProjection = true) {
        return [this.GetXRatio(x, offsetToProjection), this.GetYRatio(y, offsetToProjection)];
    }
    GetXRatio(x, offsetToProjection = true) {
        if (offsetToProjection) { x = this.GetContainerXOffset(x); }
        let rX = 0;
        let origin = this.GetContainerOriginX();
        let extent = this.GetContainerExtentX();
        // ensure x is within container 
        if (x < origin || x > extent) { rX = -1; } else {
            // x is within bounds 
            rX = NormalizeValue(x, origin, extent, false);
        }
        return rX;
    }
    GetYRatio(y, offsetToProjection = true) {
        if (offsetToProjection) { y = this.GetContainerYOffset(y); }
        let rY = 0;
        let origin = this.GetContainerOriginY();
        let extent = this.GetContainerExtentY();
        // ensure y is within container 
        if (y < origin || y > extent) { rY = -1; } else {
            // y is within bounds 
            rY = NormalizeValue(y, origin, extent, false);
        }
        return rY;
    }

    GetPointRatio(xy, offsetToProjection = true) {
        return this.GetPointRatio(xy[0], xy[1], offsetToProjection);
    }

    GetProjectionAtPoint(xy, offsetToProjection = false) {
        // offsetToProjection should usually be FALSE here, this by default works with screenspace coords
        return this.GetProjectionAtXY(xy[0], xy[1], offsetToProjection);
    }

    GetProjectionAtXY(x, y, offsetToProjection = false) {
        // offsetToProjection should usually be FALSE here, this by default works with screenspace coords
        
        if (offsetToProjection) { x = this.GetContainerXOffset(x); y = this.GetContainerYOffset(y); }

        // let nX = NormalizeValue(x, this.GetContainerOriginX(), this.GetContainerExtentX(), false);
        // let nY = NormalizeValue(y, this.GetContainerOriginY(), this.GetContainerExtentY(), false);
        // return this.GetProjectionAtXYNormalized(nX, nY);

        // get all elements at the given point, filter to type SVG and class map
        let elements = document.elementsFromPoint(x, y).filter(function (e) {
            return e.nodeName === 'svg' && e.getAttribute('class') === 'map';
        });
        // iterate over them
        let projectionsFound = [];
        for (let i = 0; i < elements.length; i++) {
            // compare against projections (note that svgContainer is the node)
            for (let j = 0; j < this.projections.length; j++) {
                if (elements[i] == this.projections[j].svgContainer) {
                    // yup! found it, ensure we didn't somehow collect it twice 
                    if (!projectionsFound.includes(this.projections[j])) {
                        projectionsFound.push(this.projections[j]);
                    }
                }
            }
        }

        // check for found projections 
        switch (projectionsFound.length) {
            case 0:
                // none found, return no projections 
                return null;
            case 1:
                // one found, return that projection 
                return projectionsFound[0];
            default:
                //multiple found, return projection of highest index
                return projectionsFound.reduce((highest, current) => {
                    return current.index > highest.Type ? current : highest;
                });
        }
    }

    GetProjectionAtXYNormalized(x, y, offsetToProjection = false) {
        // offsetToProjection should usually be FALSE here, this by default works with screenspace coords
        
        if (offsetToProjection) { x = this.GetContainerXOffset(x); y = this.GetContainerYOffset(y); }
        let iX = InvertNormalizedValue(x, this.GetContainerOriginX(), this.GetContainerExtentX(), false);
        let iY = InvertNormalizedValue(y, this.GetContainerOriginY(), this.GetContainerExtentY(), false);
        return this.GetProjectionAtXY(iX, iY);
    }


    /**
     * Write the given values (single var or array) as text in this map's output field
     * @param {...string} string Line or lines of text to display. Leave empty to clear text
     * @memberof MapData
     */
    OutputText() {
        if (!arguments || arguments.length == 0) {
            this.#output.innerHTML = "";
            return;
        }
        if (arguments.length == 1) {
            this.#output.innerHTML = arguments[0];
        } else {
            this.#output.innerHTML = "";
            for (let i = 0; i < arguments.length; i++) {
                this.#output.innerHTML += arguments[i] + "<br>";
            }
        }
    }
    /** Clears output text data
     * @memberof MapData
     */
    ClearOutput() {
        this.OutputText();
    }
}

const debugClickProjection = true;

/** Container for all data for an individual projection within a map */
export class ProjectionData {
    projection;
    index;
    svg;
    svgContainer;
    projectionSize;
    mapData;
    #containerRect;
    constructor(projection, index, svgContainer, svg, projectionSize, mapData) {
        this.projection = projection;
        this.index = index;
        this.svgContainer = svgContainer;
        this.projectionSize = projectionSize;
        this.svg = svg;
        this.mapData = mapData;
        this.#containerRect = this.svgContainer.getBoundingClientRect();
        // check for debug on click functionality 
        if (debugClickProjection) {
            // target is the clicked map, event is pointer info
            let projectionReference = this;
            this.svg.on("click", function (event, target) {
                let pointer = d3.pointer(event, target);
                projectionReference.OutputDataAtPoint(pointer, false);
            });
        }
    }

    GetContainerOrigin() {
        let raw = this.GetContainerFullOrigin();
        let cont = this.mapData.GetContainerOrigin();
        return [Math.max(raw[0], cont[0]), Math.max(raw[1], cont[1])];
    }
    GetContainerFullOrigin() {
        return [this.#containerRect.left, this.#containerRect.top];
    }
    GetContainerExtent() {
        let raw = this.GetContainerFullExtent();
        let cont = this.mapData.GetContainerExtent();
        return [Math.min(raw[0], cont[0]), Math.min(raw[1], cont[1])];
    }
    GetContainerFullExtent() {
        return [this.#containerRect.right, this.#containerRect.bottom];
    }

    GetContainerCursorOffset() {
        return this.GetContainerPointOffset(cursor.point);
    }
    GetContainerPointOffset(xy) {
        return [this.GetContainerXOffset(xy[0]), this.GetContainerYOffset(xy[1])];
    }
    GetContainerXYOffset(x, y) {
        return [this.GetContainerXOffset(x), this.GetContainerYOffset(y)];
    }
    GetContainerXOffset(x) {
        return x - this.#containerRect.left;
    }
    GetContainerYOffset(y) {
        return y - this.#containerRect.top;
    }

    GetContainerSize() {
        let ori = this.GetContainerOrigin();
        let ext = this.GetContainerExtent();
        return [ext[0] - ori[0], ext[1] - ori[1]];
    }
    GetContainerWidth() { return this.GetContainerSize()[0]; }
    GetContainerHeight() { return this.GetContainerSize()[1]; }

    GetContainerFullWidth() {
        return this.#containerRect.right - this.#containerRect.left;
    }
    GetContainerFullHeight() {
        return this.#containerRect.bottom - this.#containerRect.top;
    }
    GetContainerFullSize() {
        return [this.GetContainerFullWidth(), this.GetContainerFullHeight()];
    }



    /**
     * Gets the latitude and longitude of this projection at the given normalized XY coordinate
     *
     * @param {number} x X-axis coordinate, normalized to this projection (0 - 1, 0 = left, 1 = right)
     * @param {number} y Y-axis coordinate, normalized to this projection (0 - 1, 0 = top, 1 = bottom)
     * @param {boolean} offsetToProjection Optional, default true. Offsets the given point relative 
     * to the projection we're reading data from. Necessary if passing in XY coordinates directly,
     * eg from mouse position (eg {@link cursor}), should disable if passing in already-converted
     * coordinates (eg {@link d3.pointer})
     * @return {number[]} Two-value number[] array, where [0] = Latitude and [1] = Longitude
     * @memberof ProjectionData
     */
    LatLongAtXY(x, y, offsetToProjection = true) {

        if (offsetToProjection) { x = this.GetContainerXOffset(x); y = this.GetContainerYOffset(y); }

        let transform;
        let g = this.svg.select('g');

        if (g) {
            transform = g.attr('transform');
            if (transform) {
                // transform found, be sure to update mouse x/y accordingly
                let t = parse(transform);
                // accommodate rotation 
                if (t.rotate) {
                    let xy = RotateAround(this.projectionSize, this.projectionSize, x, y, t.rotate[0]);
                    x = xy[0];
                    y = xy[1];
                }
                // accommodate translation 
                if (t.translate) {
                    x -= t.translate[0];
                    y -= t.translate[1];
                }
            }
        }
        return this.projection.invert([x, y]).reverse();
    }
    /**
     * Gets the latitude and longitude of this projection at the given normalized XY coordinate
     *
     * @param {number[]} xy Two-value number array where [0] is X and [1] is Y.
     * Both coordinates are normalized, where a value of 0=top/left, and 1=bottom/right
     * @return {number[]} Two-value number[] array, where [0] = Latitude and [1] = Longitude
     * @param {boolean} offsetToProjection Optional, default true. Offsets the given point relative 
     * to the projection we're reading data from. Necessary if passing in XY coordinates directly,
     * eg from mouse position (eg {@link cursor}), should disable if passing in already-converted
     * coordinates (eg {@link d3.pointer})
     * @memberof ProjectionData
     */
    LatLongAtPoint(xy, offsetToProjection = true) {
        return this.LatLongAtXY(xy[0], xy[1], offsetToProjection);
    }


    /**
     * Outputs coordinate data for this projection at points X and Y, 
     * local to this projection's origin (0,0 = projection top left corner)
     *
     * @param {number} x X-axis coordinate, normalized to this projection (0 - 1, 0 = left, 1 = right)
     * @param {number} y Y-axis coordinate, normalized to this projection (0 - 1, 0 = top, 1 = bottom)
     * @param {boolean} offsetToProjection Optional, default true. Offsets the given point relative 
     * to the projection we're reading data from. Necessary if passing in XY coordinates directly,
     * eg from mouse position (eg {@link cursor}), should disable if passing in already-converted
     * coordinates (eg {@link d3.pointer})
     * @memberof ProjectionData
     */
    OutputDataAtXY(x, y, offsetToProjection = true) {
        console.log("output data at XY, x: ", x, ", y: ", y);
        let latLong = this.LatLongAtXY(x, y, offsetToProjection);
        this.mapData.OutputText(
            ("Clicked Latitude: " + latLong[0]),
            "Clicked Longitude: " + latLong[1]
        );
    }

    /**
     * Outputs coordinate data for this projection at point XY, 
     * local to this projection's origin (0,0 = projection top left corner)
     *
     * @param {number[]} xy Two-value number array where [0] is X and [1] is Y.
     * Both coordinates are normalized, where a value of 0=top/left, and 1=bottom/right
     * @param {boolean} offsetToProjection Optional, default true. Offsets the given point relative 
     * to the projection we're reading data from. Necessary if passing in XY coordinates directly,
     * eg from mouse position (eg {@link cursor}), should disable if passing in already-converted
     * coordinates (eg {@link d3.pointer})
     * @memberof ProjectionData
     */
    OutputDataAtPoint(xy, offsetToProjection = true) {
        this.OutputDataAtXY(xy[0], xy[1], offsetToProjection);
    }
}

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
function RotateAround(pivotX, pivotY, pointX, pointY, angle) {
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
 * @param {boolean} clamp Optional. Clamp value between 0 and 1? Default false
 * @returns {number} Normalized number for value's ratio between min and max
 */
function NormalizeValue(value, min, max, clamp = false) {
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
 * @param {boolean} clamp Optional, default false. Clamp value between 0 and 1? 
 *  If true, <=0 returns min, >=1 returns max
 * @returns Inverted normalized value, non-normalized
 */
function InvertNormalizedValue(value, min, max, clamp = false) {
    if (clamp) { if (value <= 0) { return min; } else if (value >= 1) { return max; } }
    let range = max - min;
    return (value * range) + min;
}