import { MapData } from "./mapdata";
import * as d3 from 'd3';
import { parse } from 'transform-parser';
import { ClickedProjection } from "../input";
import * as math from '../utils/math';
import * as m from '../maps';

/** if true, fires a click event directly on the projection SVG, bypassing {@link baseinput} */
const debugClickOnProjection = false;
const debugXYLatLong = true;
const debugSVGConversion = false;

//TODO: move sizing logic (GetContainerSize, etc) into a parent class for both MapData and ProjectionData

/** Container for all data for an individual projection within a map */
export class ProjectionData {
    /** Name of this projection, see {@link m maps.js} @type {string} @memberof ProjectionData */
    projection;
    /** D3 projection data ref @type {d3.GeoProjection} @memberof ProjectionData */
    d3Projection;
    index;
    /** D3 SVG Element @type {d3.Selection<SVGSVGElement, any, null, undefined>} @memberof ProjectionData */
    svg;
    svgContainer;
    projectionSize;
    /** Parent MapData reference @type {MapData} @memberof ProjectionData */
    mapData;
    #containerRect;


    constructor(projection, d3Projection, index, svgContainer, svg, projectionSize, mapData) {
        this.projection = projection;
        this.d3Projection = d3Projection;
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

    /** 
     * This {@link ProjectionData} has been added to {@link document.body},
     * as called by its parent {@link MapData}
     */
    AddedToDocumentBody() { }

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
        console.log("GXOFF x:", x);
        console.log("GXOFF contR.L:", this.#containerRect.left);
        console.log("GXOFF x-contR.L:", (x - this.#containerRect.left));
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


    ConstrainPointWithinContainer(xy, offsetToProjection, zeroOrigin = false) {
        return this.ConstrainXYWithinContainer(xy[0], xy[1], offsetToProjection, zeroOrigin);
    }
    ConstrainXYWithinContainer(x, y, offsetToProjection, zeroOrigin = false) {
        let size = this.GetContainerFullSize();
        // offsetToProjection should usually be FALSE here, this by default works with screenspace coords
        if (offsetToProjection) { x = this.GetContainerXOffset(x); y = this.GetContainerYOffset(y); }
        let origin = zeroOrigin ? [0, 0] : this.GetContainerOrigin();
        let extent = zeroOrigin ? size : this.GetContainerExtent();
        console.log("Constrain, XY:", x, y, "ORIGIN:", origin, "EXTENT:", extent);
        // x coordinate
        if (size[0] == 0) {
            // zero width, x must match
            x = origin[0];
        } else {
            // ensure within bounds 
            if (x < origin[0]) {
                while (x < origin[0]) { x += size[0]; }
            } else if (x > extent[0]) {
                while (x > extent[0]) { x -= size[0]; }
            }
        }
        // y coordinate
        if (size[1] == 0) {
            // zero height, y must match
            y = origin[1];
        } else {
            // ensure within bounds 
            if (y < origin[1]) {
                while (y < origin[1]) { y += size[1]; }
            } else if (y > extent[1]) {
                while (y > extent[1]) { y -= size[1]; }
            }
        }
        return [x, y];
    }


    XYRatioToXY(xRatio, yRatio, offsetToProjection) {
        let origin = this.GetContainerOrigin();
        let extent = this.GetContainerExtent();
        let iX = math.InvertNormalizedValue(xRatio, origin[0], extent[0], false);
        let iY = math.InvertNormalizedValue(yRatio, origin[1], extent[1], false);
        if (offsetToProjection) { iX = this.GetContainerXOffset(iX); iY = this.GetContainerYOffset(iY); }
        return [iX, iY];
    }
    PointRatioToXY(xyRatio, offsetToProjection = true) {
        return this.XYRatioToXY(xyRatio[0], xyRatio[1], offsetToProjection);
    }

    MapXYRatioToXY(xRatio, yRatio, offsetToProjection) {
        let origin = this.mapData.GetContainerOrigin();
        let extent = this.mapData.GetContainerExtent();
        let iX = math.InvertNormalizedValue(xRatio, origin[0], extent[0], false);
        let iY = math.InvertNormalizedValue(yRatio, origin[1], extent[1], false);
        if (offsetToProjection) { iX = this.GetContainerXOffset(iX); iY = this.GetContainerYOffset(iY); }
        return this.MapPointGlobalToProjectionLocal([iX, iY]);
    }
    MapPointRatioToXY(xyRatio, offsetToProjection) {
        return this.MapXYRatioToXY(xyRatio[0], xyRatio[1], offsetToProjection);
    }


    MapPointGlobalToProjectionLocal(xy) {
        let origin = this.GetContainerFullOrigin();
        xy[0] -= origin[0];
        xy[1] -= origin[1];
        return xy;
    }
    MapXYGlobalToProjectionLocal(x, y) {
        return this.MapPointGlobalToProjectionLocal([x, y]);
    }

    MapProjectionLocalPointToGlobalPoint(xy) {
        let origin = this.GetContainerFullOrigin();
        xy[0] += origin[0];
        xy[1] += origin[1];
        return xy;
    }
    MapProjectionLocalXYToGlobalPoint(x, y) {
        return this.MapProjectionLocalXYToGlobalPoint([x, y]);
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
        let latLong = this.d3Projection.invert(xy).reverse();
        return latLong;
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
     * @param {boolean} [zeroOrigin=false] If true, returns local XY result relative to this projection's zeroed origin, 
     * eg within this projection's size boundaries. Useful for determining averages across multiple projections.
     * @return {number[]} Two-value number[] array, where [0] = X and [1] = Y
     * @memberof ProjectionData
     */
    XYPointAtLatLong(lat, long, offsetFromProjection = true, zeroOrigin = false) {
        return this.XYPointAtLatLongPoint([lat, long], offsetFromProjection, zeroOrigin);
    }
    /**
     * Gets the X and Y coordinate from the given [latitude, longitude] using this projection
     *
     * @param {number[]} latLong Two-value number[] array, where [0] = latitude and [1] = longitude
     * @param {boolean=true} offsetToProjection Optional, default true. Offsets the given point relative 
     * to the projection we're reading data from. Essentially, true = returns global XY (screenspace), 
     * and false = returns local screenspace (relative to this projection's origin)
     * @param {boolean=true} constrainToContainer If true, constrains the returned XY to the parent {@link MapData.mapContainer}, 
     * either adding/subtracting container's width/height to the result until it's within bounds (0 size matches width)
     * @param {boolean} [zeroOrigin=false] If true, returns local XY result relative to this projection's zeroed origin, 
     * eg within this projection's size boundaries. Useful for determining averages across multiple projections.
     * @return {number[]} Two-value number[] array, where [0] = X and [1] = Y
     * @memberof ProjectionData
     */
    XYPointAtLatLongPoint(latLong, offsetToProjection = false, constrainToContainer = true, zeroOrigin = false) {

        let fixedLatLong = latLong.slice();
        if (debugXYLatLong) { console.log('P' + this.index, "latlong input:", latLong, "offset:", offsetToProjection); }
        while (fixedLatLong[0] < -90) { fixedLatLong[0] += 180; }
        while (fixedLatLong[0] > 90) { fixedLatLong[0] -= 180; }
        while (fixedLatLong[1] < -180) { fixedLatLong[1] += 360; }
        while (fixedLatLong[1] > 180) { fixedLatLong[1] -= 360; }
        if (debugXYLatLong) { console.log('P' + this.index, "latlong FIXED input:", fixedLatLong, "offset:", offsetToProjection); }
        let xy = this.d3Projection(fixedLatLong.reverse());
        if (debugXYLatLong) { console.log('P' + this.index, "xy output:", xy); }
        let mapSize = this.GetContainerFullSize();
        console.log("Mapsize:", mapSize);
        if (xy[0] < 0) { xy[0] = (xy[0] * -1) + mapSize[0]; }
        if (xy[1] < 0) { xy[1] = (xy[1] * -1) + mapSize[1]; }
        if (debugXYLatLong) { console.log('P' + this.index, "xy postMapSize output:", xy); }
        // let xy = this.projection(latLong.slice());
        xy = this.ApplySVGTransformOffsetsToPoint(xy, true);
        if (debugXYLatLong) { console.log('P' + this.index, "xy post svg:", xy); }
        if (offsetToProjection) {
            // let origin = this.GetContainerFullOrigin();
            let origin = this.GetContainerOrigin();
            if (debugXYLatLong) { console.log('P' + this.index, 'move xy', xy, 'by origin', origin); }
            xy[0] += origin[0];
            xy[1] += origin[1];
            if (debugXYLatLong) { console.log('P' + this.index, 'xy result', xy); }
        }
        // if (constrainToContainer && !this.mapData.IsPointWithinContainer(xy, offsetToProjection)) {
        if (constrainToContainer) {
            // not within bounds, constrain within container 
            console.log("PRE CONSTRAIN:", xy, "OFFSET:", offsetToProjection, "ZERO:", zeroOrigin);
            // xy = this.ConstrainPointWithinContainer(xy, offsetToProjection, zeroOrigin);
            console.log("POST CONSTRAIN:", xy);
        }
        if (debugXYLatLong) { console.log('P' + this.index, "xy after constraint:", xy); }

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
            // determine left offset
            let leftOffset = 0;
            let node = g.node();
            if (node != null) {
                /** Parent element of the SVG group @type {HTMLElement} */
                let parent = node.parentElement;
                if (parent != null &&
                    parent.style != null &&
                    parent.style.marginLeft != null &&
                    !isNaN(parent.style.marginLeft)) {
                    // valid left offset 
                    leftOffset = parent.style.marginLeft;
                }
            }
            let hasLeftOffset = leftOffset != 0;
            // determine translation / rotation 
            let transform = g.attr('transform');
            let t;// parsed transform ref 
            let hasTranslation = false;
            let translation;
            // get the rotation (test between CSS and D3 rotation)
            let rotation = m.GetProjectionCSSRotation(this.projection);
            // let rotation = m.GetProjectionRotation(this.projection);
            let hasRotation = rotation != 0;
            if (transform) {
                // transform found, be sure to update mouse x/y accordingly
                t = parse(transform);
                hasTranslation = t.translate != null;
                if (t.translate[0] == 0 && t.translate[1] == 0) {
                    hasTranslation = false;
                }
                if (hasTranslation) { translation = t.translate; }
            }
            // apply modifications in order
            let xy = origin;
            if (reverseOrder) {
                if (hasTranslation) { xy = Translate(xy, translation, reverseOrder); }
                if (hasRotation) { xy = Rotate(xy, rotation, this.projectionSize, reverseOrder); }
                if (hasLeftOffset) { xy = math.AddToNumArray(xy, leftOffset); }
            } else {
                if (hasLeftOffset) { xy = math.AddToNumArray(xy, leftOffset); }
                if (hasRotation) { xy = Rotate(xy, rotation, this.projectionSize, reverseOrder); }
                if (hasTranslation) { xy = Translate(xy, translation, reverseOrder); }
            }
            return xy;
        }
        function Translate(xy, translation, reverse) {
            // accommodate translation 
            if (debugSVGConversion) console.log("translate xy", xy, "by", translation);
            if (reverse) {
                translation[0] *= -1;
                translation[1] *= -1;
            }
            xy[0] -= translation[0];
            xy[1] -= translation[1];
            if (debugSVGConversion) console.log("translation result:", xy);
            // return xy;jk    q-0;LT6 (kitty <3)
            return xy;
        }
        /** 
         * @param {ProjectionData} projection
         */
        function Rotate(xy, rotation, size, reverse) {
            // accommodate rotation 
            if (rotation != 0) {
                if (reverse) { rotation *= -1; }
                if (debugSVGConversion) console.log('rotate xy', xy, 'by', rotation);
                xy = math.RotateAround(size, size, xy[0], xy[1], rotation);
                if (debugSVGConversion) console.log('rotation result', xy);
            } else {
                if (debugSVGConversion) console.log('do not rotate xy', xy);
            }
            return xy;
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