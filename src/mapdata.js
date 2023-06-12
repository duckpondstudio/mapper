import * as d3 from 'd3';
import { parse, stringify } from 'transform-parser';
import { cursor } from './mapinput';

/** Container for all data related to displaying a map */
export class MapData {
    map;
    index = -1;
    dataContainer;
    projectionsContainer;
    projections = [];
    #output;
    #containerRect;
    constructor(
        map, index, dataContainer, projectionsContainer, projections = []) {
        this.map = map;
        this.index = index;
        this.dataContainer = dataContainer;
        this.projectionsContainer = projectionsContainer;
        this.projections = projections;
        if (!dataContainer) {
            console.error("Cannot create MapData properly without dataContainer");
            return;
        }
        // define container rect
        this.#containerRect = this.projectionsContainer.getBoundingClientRect();
        // create output 
        this.#output = document.createElement('p');
        this.#output.setAttribute('id', 'output_' + this.index);
        this.dataContainer.appendChild(this.#output);
        this.OutputText("Output goes here");
    }
    AddProjection(projection) {
        if (!projection) { return; }
        this.projections.push(projection);
        // update container rect
        this.#containerRect = this.projectionsContainer.getBoundingClientRect();
    }


    GetContainerOrigin() {
        return [this.#containerRect.left, this.#containerRect.top];
    }
    GetContainerExtent() {
        let xy = this.GetContainerOrigin();
        xy[0] += this.GetContainerWidth();
        xy[0] += this.GetContainerHeight();
        return xy;
    }

    /** Find the XY offset of the current cursor position from this container's origin
     * @param {number[]} xy two-value number array for the XY coords
     * of the point you want to find offset from this container
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
        xy[0] -= this.#containerRect.left;
        xy[1] -= this.#containerRect.top;
        return xy;
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
    }

    GetContainerOrigin() {
        return [this.#containerRect.left, this.#containerRect.top];
    }
    GetContainerExtent() {
        let xy = this.GetContainerOrigin();
        xy[0] += this.GetContainerWidth();
        xy[0] += this.GetContainerHeight();
        return xy;
    }
    GetContainerFullExtent() {
        let xy = this.GetContainerOrigin();
        xy[0] += this.GetContainerFullWidth();
        xy[0] += this.GetContainerFullHeight();
        return xy;
    }

    GetContainerCursorOffset() {
        return this.GetContainerPointOffset(cursor.point);
    }
    GetContainerPointOffset(xy) {
        xy[0] -= this.#containerRect.left;
        xy[1] -= this.#containerRect.top;
        return xy;
    }

    GetContainerWidth() {
        let contOrigin = this.mapData.GetContainerOrigin();
        let contSize = this.mapData.GetContainerSize();
        let projOrigin = this.GetContainerOrigin();
        let projSize = this.GetContainerFullSize();
        console.log("W: " + this.mapData.projectionsContainer.clientWidth);
        console.log("CONT ORI: " + contOrigin);
        console.log("PROJ ORI: " + projOrigin);
        console.log("CONT SIZE: " + contSize);
        console.log("PROJ SIZE: " + projSize);

        // define in-container left
        let insetLeft = projOrigin[0] - contOrigin[0];
        let insetTop = projOrigin[1] - contOrigin[1];
        let insetRight = contSize[0] - projSize[0];
        let insetBottom = contSize[1] - projSize[1];

        console.log("IN L: " + insetLeft + ", IN T: " + insetTop);
        console.log("IN R: " + insetRight + ", IN B: " + insetBottom);
    }
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
     * Outputs coordinate data for this projection at points X and Y, 
     * local to this projection's origin (0,0 = projection top left corner)
     *
     * @param {number} x X-axis coordinate 
     * @param {number} y Y-axis coordinate
     * @memberof ProjectionData
     */
    OutputXYData(x, y) {
        let transform;
        let g = this.svg.select('g');

        var rect = this.svgContainer.getBoundingClientRect();
        // console.log(rect.top, rect.right, rect.bottom, rect.left);

        console.log("Click Relative X: " + x);
        console.log("Click Relative Y: " + y);
        console.log("Screen Cursor XY: " + cursor.point);
        console.log("Proj. Origin XY: " + this.GetContainerOrigin());
        console.log("Container size: " + this.GetContainerWidth());
        console.log("W2: " + this.svgContainer.clientWidth);
        console.log("L2: " + this.svgContainer.clientLeft);

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

        let latLong = this.projection.invert([x, y]).reverse();
        this.mapData.OutputText(
            ("Clicked Latitude: " + latLong[0]).toString(),
            "Clicked Longitude: " + latLong[1]
        );
    }
    /**
     * Outputs coordinate data for this projection at point XY, 
     * local to this projection's origin (0,0 = projection top left corner)
     *
     * @param {number[]} xy Two-value num array where [0] is X and [1] is Y 
     * @memberof ProjectionData
     */
    OutputPointData(xy) { this.OutputXYData(xy[0], xy[1]); }
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