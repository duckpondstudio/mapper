import { MapData } from "./mapdata";
import * as d3 from 'd3';
import { parse } from 'transform-parser';
import * as math from '../utils/math';
import { ClickedProjection } from "../input";

/** if true, fires a click event directly on the projection SVG, bypassing {@link baseinput} */
const debugClickOnProjection = false;

//TODO: move sizing logic (GetContainerSize, etc) into a parent class for both MapData and ProjectionData

/** Container for all data for an individual projection within a map */
export class ProjectionData {
    /** D3 projection data ref @type {d3.GeoProjection} @memberof ProjectionData */
    projection;
    index;
    /** D3 SVG Element @type {d3.Selection<SVGSVGElement, any, null, undefined>} @memberof ProjectionData */
    svg;
    svgContainer;
    projectionSize;
    /** Parent MapData reference @type {MapData} @memberof ProjectionData */
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
        // add click event 
        this.svgContainer.addEventListener('click', mouseEvent => {
            this.mapData.module.Select(); ClickedProjection(mouseEvent, this);
        });
        // check for debug on click functionality 
        if (debugClickOnProjection) {
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

    /**
     * Gets the latitude and longitude of this projection at the given normalized XY coordinate
     *
     * @param {number} x X-axis coordinate, normalized to this projection (0 - 1, 0 = left, 1 = right)
     * @param {number} y Y-axis coordinate, normalized to this projection (0 - 1, 0 = top, 1 = bottom)
     * @param {boolean=true} offsetToProjection Optional, default true. Offsets the given point relative 
     * to the projection we're reading data from. Necessary if passing in XY coordinates directly,
     * eg from mouse position (eg {@link cursor}), should disable if passing in already-converted
     * coordinates (eg {@link d3.pointer})
     * @return {number[]} Two-value number[] array, where [0] = Latitude and [1] = Longitude
     * @memberof ProjectionData
     */
    LatLongAtXY(x, y, offsetToProjection = true) {
        if (offsetToProjection) {
            x = this.GetContainerXOffset(x);
            y = this.GetContainerYOffset(y);
        }
        let xy = this.ApplySVGTransformOffsetsToXY(x, y);
        return this.projection.invert(xy).reverse();
    }
    /**
     * Gets the latitude and longitude of this projection at the given normalized XY coordinate
     *
     * @param {number[]} xy Two-value number array where [0] is X and [1] is Y.
     * Both coordinates are normalized, where a value of 0=top/left, and 1=bottom/right
     * @param {boolean=true} offsetToProjection Optional, default true. Offsets the given point relative 
     * to the projection we're reading data from. Necessary if passing in XY coordinates directly,
     * eg from mouse position (eg {@link cursor}), should disable if passing in already-converted
     * coordinates (eg {@link d3.pointer})
     * @return {number[]} Two-value number[] array, where [0] = Latitude and [1] = Longitude
     * @memberof ProjectionData
     */
    LatLongAtPoint(xy, offsetToProjection = true) {
        return this.LatLongAtXY(xy[0], xy[1], offsetToProjection);
    }

    /**
     * Gets the X and Y coordinate from the given latitude/longitude values using this projection
     *
     * @param {number} lat Latitude, converted to X-axis coordinate
     * @param {number} long Latitude, converted to X-axis coordinate
     * @param {boolean=true} offsetToProjection Optional, default true. Offsets the given point relative 
     * to the projection we're reading data from. Essentially, true = returns global XY (screenspace), 
     * and false = returns local screenspace (relative to this projection's origin)
     * @return {number[]} Two-value number[] array, where [0] = X and [1] = Y
     * @memberof ProjectionData
     */
    XYPointAtLatLong(lat, long, offsetFromProjection = true) {
        return this.XYPointAtLatLongPoint([lat, long], offsetFromProjection);
    }
    /**
     * Gets the X and Y coordinate from the given [latitude, longitude] using this projection
     *
     * @param {number[]} latLong Two-value number[] array, where [0] = latitude and [1] = longitude
     * @param {boolean=true} offsetToProjection Optional, default true. Offsets the given point relative 
     * to the projection we're reading data from. Essentially, true = returns global XY (screenspace), 
     * and false = returns local screenspace (relative to this projection's origin)
     * @return {number[]} Two-value number[] array, where [0] = X and [1] = Y
     * @memberof ProjectionData
     */
    XYPointAtLatLongPoint(latLong, offsetFromProjection = true) {
        let xy = this.projection(latLong.reverse());
        xy = this.ApplySVGTransformOffsetsToPoint(xy, true);
        if (offsetFromProjection) {
            let origin = this.GetContainerFullOrigin();
            xy[0] += origin[0];
            xy[1] += origin[1];
        }
        return xy;
    }

    /** Gets the XY offset based on this projection's SVG CSS (eg translation, rotation)
     * and applies it to the given X and Y coordinates (returns an [x,y] array)
     * @param {number} x X coordinate to modify
     * @param {number} y Y coordinate to modify
     * @param {boolean=false} reverseOrder Default false. Perform modifications in reverse order? (Eg for undoing them)
     * @returns {number[]} Two-value number[], [x,y] values for this transform
     * @see {@link GetSVGTransformOffsets}, method that directly reads the transform info
     * @see {@link svg}, element being read for transform info     
     * @memberof ProjectionData
     */
    ApplySVGTransformOffsetsToXY(x, y, reverseOrder = false) {
        return this.ApplySVGTransformOffsetsToPoint([x, y], reverseOrder);
    }

    /** Gets the XY offset based on this projection's SVG CSS (eg translation, rotation)
     * and applies it to the given XY
     * @param {number[]} xy Two-value number[], [x,y] to modify  
     * @param {boolean=false} reverseOrder Default false. Perform modifications in reverse order? (Eg for undoing them)
     * @returns {number[]} Two-value number[], [x,y] values for this transform
     * @see {@link GetSVGTransformOffsets}, method that directly reads the transform info
     * @see {@link svg}, element being read for transform info     
     * @memberof ProjectionData
     */
    ApplySVGTransformOffsetsToPoint(xy, reverseOrder = false) {
        return this.GetSVGTransformOffsets(xy, reverseOrder);
    }

    /** Gets the XY offset based on this projection's SVG CSS (eg translation, rotation)
     * @param {boolean=false} reverseOrder Default false. Perform modifications in reverse order? (Eg for undoing them)
     * @returns {number[]} Two-value number[], [x,y] values for this transform
     * @see {@link ApplySVGTransformOffsetsToPoint}, method that applies transform info to supplied [x,y] point
     * @see {@link svg}, element being read for transform info 
     * @memberof ProjectionData
     */
    GetSVGTransformOffsets(origin = [0, 0], reverseOrder = false) {
        let g = this.svg.select('.mapGroup');
        if (g) {
            let transform = g.attr('transform');
            if (transform) {
                let xy = origin;
                // transform found, be sure to update mouse x/y accordingly
                let t = parse(transform);
                // apply modifications in order
                if (reverseOrder) {
                    xy = Translate(xy, t, reverseOrder);
                    xy = Rotate(xy, t, this.projectionSize, reverseOrder);
                } else {
                    xy = Rotate(xy, t, this.projectionSize, reverseOrder);
                    xy = Translate(xy, t, reverseOrder);
                }

                function Translate(xy, t, reverse) {
                    // accommodate translation 
                    if (t.translate) {
                        xy[0] -= t.translate[0] * (reverse ? -1 : 1);
                        xy[1] -= t.translate[1] * (reverse ? -1 : 1);
                    }
                    // return xy;jk    q-0;LT6 (kitty <3)
                    return xy;
                }
                function Rotate(xy, t, size, reverse) {
                    // accommodate rotation 
                    if (t.rotate) {
                        xy = math.RotateAround(size, size, xy[0], xy[1], t.rotate[0] * (reverse ? -1 : 1));
                    }
                    return xy;
                }
                return xy;
            }
        }
        return origin;
    }


    /**
     * Outputs coordinate data for this projection at points X and Y, 
     * local to this projection's origin (0,0 = projection top left corner)
     *
     * @param {number} x X-axis coordinate, normalized to this projection (0 - 1, 0 = left, 1 = right)
     * @param {number} y Y-axis coordinate, normalized to this projection (0 - 1, 0 = top, 1 = bottom)
     * @param {boolean=true} offsetToProjection Optional, default true. Offsets the given point relative 
     * to the projection we're reading data from. Necessary if passing in XY coordinates directly,
     * eg from mouse position (eg {@link cursor}), should disable if passing in already-converted
     * coordinates (eg {@link d3.pointer})
     * @memberof ProjectionData
     */
    OutputDataAtXY(x, y, offsetToProjection = true) {
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
     * @param {boolean=true} offsetToProjection Optional, default true. Offsets the given point relative 
     * to the projection we're reading data from. Necessary if passing in XY coordinates directly,
     * eg from mouse position (eg {@link cursor}), should disable if passing in already-converted
     * coordinates (eg {@link d3.pointer})
     * @memberof ProjectionData
     */
    OutputDataAtPoint(xy, offsetToProjection = true) {
        this.OutputDataAtXY(xy[0], xy[1], offsetToProjection);
    }
}