import { cursor } from '../input';
import { Module } from './module';
import { MapDot } from './mapdot';
import { ProjectionData } from './projectiondata';
import * as m from '../maps';
import * as math from '../utils/math';

// see bottom for code examples

//TODO: move sizing logic (GetContainerSize, etc) into a parent class for both MapData and ProjectionData

/** Container for all data related to displaying a map */
export class MapData {
    /** Name of this map. See {@link m maps.js} @type {Module} @memberof MapData*/
    map;
    /** Module this MapData is contained in @type {Module} @memberof MapData*/
    module;
    /** Index, order in which this MapData was generated @type {Module} @memberof MapData*/
    index = -1;
    /** Div that contains all {@link projections} @type {HTMLDivElement} @memberof MapData*/
    projectionsContainer;
    /** Array of projections loaded in this MapData @type {ProjectionData[]} @memberof MapData*/
    projections = [];
    /** Array of map dots to render @type {MapDot[]} @memberof MapData*/
    #mapDots = [];
    /** Paragraph used for basic MapData data output @type {HTMLParagraphElement} @memberof MapData*/
    #output;
    /** Rect for the size of this MapData, auto-updated on adding {@link projections}.
     *  @see projectionsContainer
     *  @type {HTMLParagraphElement} @memberof MapData*/
    #containerRect;
    /** Creates a new instance of MapData.
     *  @param {Module} module Module to load all relevant data from 
     *  @param {*} [projections=[]] List of projections to pre-load. 
     *  Can also call {@link AddProjection} at any time.
     *  @memberof MapData */
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

    /**
     * Add a MapDot dot to this projection
     * @param {number} x X coordinate of this dot (or latitude, see {@link type})
     * @param {number} y X coordinate of this dot (or longitude, see {@link type})
     * @param {number} [type=0] Optional, default 0. Defines the rendering behaviour of this dot.
     * 
     * 0. XY represents GLOBAL XY coordinates (eg cursor position). Default 
     * 1. XY represents LOCAL XY coordinates, relative to this {@link MapData}
     * 2. XY represents Latitude/Longitude coordinates
     * @param {string} [id=null]
     * @memberof MapData
     */
    AddDotXY(x, y, type = 0, id = null) {
        // check if any dots matching exist 
        this.#mapDots.forEach(mapDot => {
            if (mapDot.x == x && mapDot.y == y &&
                mapDot.type == type && mapDot.id == id) {
                // mapDot already exists, no need to add 
                return;
            }
        });
        let mapDot = new MapDot(x, y, type, id);
        this.#mapDots.push(mapDot);
        this.#UpdateDots();
        console.log("ADDED DOT at ", x, '/', y);
    }
    /**
     * Add a MapDot dot to this projection
     * @param {number} xy X and Y coordinates of this dot (or lat/long, see {@link type})
     * @param {number} [type=0] Optional, default 0. Defines the rendering behaviour of this dot.
     * 
     * 0. XY represents GLOBAL XY coordinates (eg cursor position). Default 
     * 1. XY represents LOCAL XY coordinates, relative to this {@link MapData}
     * 2. XY represents Latitude/Longitude coordinates
     * @param {string} [id=null]
     * @memberof MapData
     */
    AddDot(xy, type = 0, id = null) {
        this.AddDotXY(xy[0], xy[1], type, id);
    }
    AddDotXYLocal(x, y, id = null) {
        this.AddDotXY(x, y, 1, id);
    }
    AddDotXYGlobal(x, y, id = null) {
        this.AddDotXY(x, y, 0, id);
    }
    AddDotLatLong(lat, long, id = null) {
        this.AddDotXY(lat, long, 2, id);
    }

    RemoveDotsByXY(xy) {
        if (this.#mapDots.length == 0) { return; }
        let length = this.#mapDots.length;
        this.#mapDots = this.#mapDots.filter(function (mapDot) {
            return mapDot.xy != xy;
        });
        if (this.#mapDots.length != length) { this.#UpdateDots(); }
    }
    RemoveDotsByType(type) {
        if (this.#mapDots.length == 0) { return; }
        let length = this.#mapDots.length;
        this.#mapDots = this.#mapDots.filter(function (mapDot) {
            return mapDot.type != type;
        });
        if (this.#mapDots.length != length) { this.#UpdateDots(); }
    }
    RemoveDotsByID(id) {
        if (this.#mapDots.length == 0) { return; }
        let length = this.#mapDots.length;
        this.#mapDots = this.#mapDots.filter(function (mapDot) {
            return mapDot.id != id;
        });
        if (this.#mapDots.length != length) { this.#UpdateDots(); }
    }
    RemoveAllDots() {
        if (this.#mapDots.length == 0) { return; }
        this.#mapDots = [];
        this.#UpdateDots();
    }

    GetAllDots() { return this.#mapDots; }
    GetDotsByXY(xy) {
        let dots = [];
        for (let i = 0; i < this.#mapDots.length; i++) {
            if (this.#mapDots[i].xy == xy) { dots.push(this.#mapDots[i]); }
        }
        return dots;
    }
    GetDotsByType(type) {
        let dots = [];
        for (let i = 0; i < this.#mapDots.length; i++) {
            if (this.#mapDots[i].type == type) { dots.push(this.#mapDots[i]); }
        }
        return dots;
    }
    GetDotsByID(id) {
        let dots = [];
        for (let i = 0; i < this.#mapDots.length; i++) {
            if (this.#mapDots[i].id == id) { dots.push(this.#mapDots[i]); }
        }
        return dots;
    }


    /** Updates all rendered map dots
     */
    #UpdateDots() {

        // iterate thru all projections 
        this.projections.forEach(projection => {
            let svg = projection.svg;

            // check if dotGroup exists 
            let dotGroup = svg.select('.dotGroup');
            if (dotGroup.empty()) {
                svg.append('g').attr('class', 'dotGroup').raise();
                dotGroup = svg.select('.dotGroup');
            } else {
                // remove all current map dots 
                svg.selectAll('.mapDot').remove();
            }
            dotGroup.selectAll('circle')
                .data(this.#mapDots)
                .enter()
                .append('circle')
                .attr('class', 'mapDot')
                .attr('cx', function (d) { return d.GetX(projection) })
                .attr('cy', function (d) { return d.GetY(projection) })
                .attr('r', 3)
                .style('fill', 'red');
        });
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

    ConstrainPointWithinContainer(xy, offsetToProjection) {
        return this.ConstrainXYWithinContainer(xy[0], xy[1], offsetToProjection);
    }
    ConstrainXYWithinContainer(x, y, offsetToProjection) {
        let size = this.GetContainerSize();
        // offsetToProjection should usually be FALSE here, this by default works with screenspace coords
        if (offsetToProjection) { x = this.GetContainerXOffset(x); y = this.GetContainerYOffset(y); }
        let origin = this.GetContainerOrigin();
        let extent = this.GetContainerExtent();
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
            rX = math.NormalizeValue(x, origin, extent, false);
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
            rY = math.NormalizeValue(y, origin, extent, false);
        }
        return rY;
    }

    GetPointRatio(xy, offsetToProjection = true) {
        return this.GetPointRatio(xy[0], xy[1], offsetToProjection);
    }

    /** Get the XY coordinates associated with the given latitude/longitude 
     * @param {number} lat latitude 
     * @param {number} long longitude
     * @param {boolean=true} useAvgXY 
     * @param {boolean=false} offsetProjection 
     * @param {boolean=true} constrainToContainer If true, constrains the returned XY to the container, 
     * either adding/subtracting container's width/height to the result until it's within bounds (0 size matches width)
     * @returns {number[]} XY coordinates from the given latitude/longitude 
     * @memberof MapData
     */
    XYPointAtLatLong(lat, long, useAvgXY = true, offsetProjection = false, constrainToContainer = true) {
        return this.XYPointAtLatLongPoint([lat, long], useAvgXY, offsetProjection, constrainToContainer);
    }
    /** Get the XY coordinates associated with the given latitude/longitude 
     * @param {number[]} latLong Two-value number[] array representing [latitude,longitude] 
     * @param {boolean=true} useAvgXY 
     * @param {boolean=false} offsetProjection 
     * @param {boolean=true} constrainToContainer If true, constrains the returned XY to the container, 
     * either adding/subtracting container's width/height to the result until it's within bounds (0 size matches width)
     * @returns {number[]} XY coordinates from the given latitude/longitude 
     * @memberof MapData
     */
    XYPointAtLatLongPoint(latLong, useAvgXY = true, offsetProjection = false, constrainToContainer = true) {
        // NOTE: using average across multiple projections minimizes 
        //       any tiny differences between individual projections 
        // ensure projections exist 
        switch (this.projections.length) {
            case 0:
                console.error("Cannot get point at LatLong: ", latLong, ", no projections loaded, ",
                    "ensure module is fully loaded. UseAvgXY ", useAvgXY,
                    ", OffsetProjection ", offsetProjection, ". Returning null");
                return null;
            case 1:
                // only one projection, no need to average it out 
                useAvgXY = false;
                break;
        }
        let xy = [0, 0];
        if (useAvgXY) {
            // use all the combined projections to get the average XY 
            // iterate thru all latitude/longitude, and return the average
            for (let i = 0; i < this.projections.length; i++) {
                let projXY = this.projections[i].XYPointAtLatLongPoint(latLong, offsetProjection);
                if (i == 0) {
                    xy = projXY;
                } else {
                    xy[0] += projXY[0];
                    xy[1] += projXY[1];
                }
            }
            xy[0] /= this.projections.length;
            xy[1] /= this.projections.length;
        } else {
            // NON-average, just use one projection
            // by default, use the middle projection (least likelihood of a point being out-of-container)
            let projection = this.projections[Math.floor(this.projections.length / 2)];// [2]
            // projection nullcheck 
            if (projection == null) {
                if (this.projections.length > 1) {
                    // middle projection didn't work, search through all 
                    for (let i = 0; i < this.projections.length; i++) {
                        if (this.projections[i] != null) {
                            projection = this.projections[i];
                            break;
                        }
                    }
                }
                if (projection == null) {
                    console.error("Can't get XY at LatLong", latLong,
                        ", no valid projection found, returning null, mapData:", this);
                    return null;
                }
            }
            xy = projection.XYPointAtLatLongPoint(latLong, !offsetProjection);
        }
        // lastly, ensure the returned point is within the bounds of this container 
        if (constrainToContainer && !this.IsPointWithinContainer(xy, offsetProjection)) {
            // not within bounds, constrain within container 
            xy = this.ConstrainPointWithinContainer(xy, offsetProjection);
        }
        return xy;
    }

    LatLongAtXY(x, y, useAvgLatLong = true, offsetProjection = false) {
        return this.LatLongAtPoint([x, y], offsetProjection, useAvgLatLong);
    }
    LatLongAtPoint(xy, useAvgLatLong = true, offsetProjection = false) {
        // NOTE: using average across multiple projections minimizes 
        //       any tiny differences between individual projections 
        // ensure projections exist 
        switch (this.projections.length) {
            case 0:
                console.error("Cannot get LatLong at point: ", xy, ", no projections loaded, ",
                    "ensure module is fully loaded. UseAvgLatLong ", useAvgLatLong,
                    ", OffsetProjection ", offsetProjection, ". Returning null");
                return null;
            case 1:
                // only one projection, no need to average it out 
                useAvgLatLong = false;
                break;
        }
        if (useAvgLatLong) {
            // use all the combined projections to get the average Lat/Long value
            let avgLatLong = [0, 0];
            // iterate thru all latitude/longitude, and return the average
            for (let i = 0; i < this.projections.length; i++) {
                let latLong = this.projections[i].LatLongAtPoint(xy, !offsetProjection);
                if (i == 0) {
                    avgLatLong = latLong;
                } else {
                    avgLatLong[0] += latLong[0];
                    avgLatLong[1] += latLong[1];
                }
            }
            avgLatLong[0] /= this.projections.length;
            avgLatLong[1] /= this.projections.length;
            return avgLatLong;
        }
        // get projection (no point doing the getter if there's only 1 projection)
        let projection = this.projections.length == 1 && this.projections[0] != null ?
            this.projections[0] :
            this.GetProjectionAtPoint(xy, offsetProjection);
        // projection nullcheck 
        if (projection == null) {
            if (this.projections.length > 1) {
                console.warn("Could not get LatLong at point: ", xy, ", on map: ", this.map,
                    ", no projection found at point, attempting to get avgLatLong of ",
                    this.projections.length, " projections instead. OffsetProjection: ", offsetProjection);
                return this.LatLongAtPoint(xy, !offsetProjection, true);
            } else {
                console.error("Cannot get LatLong at point: ", xy, ", projection at point null, ",
                    "ensure point is valid (bounds check?). AvgLatLong false, OffsetProjection ",
                    offsetProjection, ". Returning null");
                return null;
            }
        }
        return projection.LatLongAtPoint(xy, !offsetProjection);
    }

    GetProjectionAtPoint(xy, offsetToProjection = false) {
        // offsetToProjection should usually be FALSE here, this by default works with screenspace coords
        return this.GetProjectionAtXY(xy[0], xy[1], offsetToProjection);
    }

    GetProjectionAtXY(x, y, offsetToProjection = false) {
        // offsetToProjection should usually be FALSE here, this by default works with screenspace coords

        if (offsetToProjection) { x = this.GetContainerXOffset(x); y = this.GetContainerYOffset(y); }

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
        let iX = math.InvertNormalizedValue(x, this.GetContainerOriginX(), this.GetContainerExtentX(), false);
        let iY = math.InvertNormalizedValue(y, this.GetContainerOriginY(), this.GetContainerExtentY(), false);
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



/* EXAMPLE: getting latitude & longitude from MapData with an XY coordinate, and reversing it

/// Use GetProjectionAtPoint to obtain the ProjectionData from the given point (eg, cursor.point)
let projection = mapData.GetProjectionAtPoint(cursor.point);
if (projection != null) { /// nullcheck
    /// use LatLongAtPoint to get [latitude, longitude], from the ProjectionData 
    let latitudeLong = projection.LatLongAtPoint(cursor.point);
    /// use XYPointAtLatLongPoint to convert [latitude, longitude] back to screenspace XY
    let reversedLatLong = projection.XYPointAtLatLongPoint(latLong);  
}
/// NOTE: using LatLongAtPoint(point, false) and XYPointAtLatLongPoint(latLong, false) 
          will process the point value LOCALLY to the ProjectionData's origin 
*/
