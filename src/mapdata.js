import * as d3 from 'd3';
import { parse, stringify } from 'transform-parser';
import { cursor } from './mapinput';
import { Module } from './module';
import * as m from './maps';

// see bottom for code examples

//TODO: move sizing logic (GetContainerSize, etc) into a parent class for both MapData and ProjectionData
//TODO: gosh it'd be nice to clean this script up =_=;

/// MAPDATA SETUP

/// MAPDOT SETUP

/// PROJECTION SETUP 
/** if true, fires a click event directly on the projection SVG, bypassing {@link mapinput} */
const debugClickOnProjection = false;

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

/** Data related to rendering dots on a map projection */
class MapDot {
    /** X-coordinate for this dot (can be Latitude, see {@link type})
     * @type {number}
     * @memberof MapDot */
    x;
    /** Y-coordinate for this dot (can be Latitude, see {@link type})
     * @memberof MapDot */
    y;
    /** Optional, default 0. Defines the rendering behaviour of this dot.
     * 
     * 0. XY represents GLOBAL XY coordinates (eg cursor position). Default 
     * 1. XY represents LOCAL XY coordinates, relative to this {@link MapData}
     * 2. XY represents Latitude/Longitude coordinates
     * @memberof MapDot */
    type;
    /** Optional, default null. ID for this dot. 
     * If set, can use to access all dots of the given ID. 
     * @memberof MapDot */
    id;
    /** Create a new {@link MapDot}. Set {@link X} and {@link Y} coordinates. 
     * Optionally specify {@link type} and {@link id ID}.
     * 
     * @param {number} x X-coordinate for this dot (can be Latitude, see {@link type})
     * @param {number} y Y-coordinate for this dot (can be Longitude, see {@link type})
     * @param {number=0} type Optional, default 0. Defines the rendering behaviour of this dot.
     * 
     * 0. XY represents GLOBAL XY coordinates (eg cursor position). Default 
     * 1. XY represents LOCAL XY coordinates, relative to this {@link MapData}
     * 2. XY represents Latitude/Longitude coordinates
     * @param {string=null} id Optional, default null. ID for this dot. 
     * If set, can use to access all dots of the given ID.
     * @memberof MapDot
     */
    constructor(x, y, type = 0, id = null) {
        this.x = x;
        this.y = y;
        switch (type) {
            case 0: // global 
            case 1: // local 
            case 2: // latLong
                this.type = type;
                break;
            default:
                console.warn("Attempted to create MapDot of invalid type ", type,
                    ', see @type param for valid values, defaulting to 0');
                this.type = type = 0;
                break;
        }
        this.id = id;
    }

    get xy() { return [this.x, this.y]; }

    /** 
     * Get X coord relative to the given {@link p projection}
     * @param {ProjectionData} p Projection to get X coord relative to 
     * @memberof MapDot */
    GetXY(p) {
        switch (this.type) {
            case 0: // global, screenspace
                // convert screenspace to lat/long for per-projection localization
                let latLong = p.LatLongAtPoint(this.xy);
                let newXY = p.XYPointAtLatLongPoint(latLong, false);
                return newXY;
            case 1: // already local to projection 
                return this.x;
            case 2: // lat/long
                // TODO: doing xy/latlong conversion twice for XY, only do it once (eg XAtLatitude)
                return p.XYPointAtLatLong(this.xy, false)[0];
        }
    }

    /** 
     * Get X coord relative to the given {@link projection}
     * @param {ProjectionData} projection Projection to get X coord relative to 
     * @memberof MapDot */
    GetX(projection) {
        return this.GetXY(projection)[0];
    }
    /** 
     * Get Y coord relative to the given {@link projection}
     * @param {ProjectionData} projection Projection to get Y coord relative to 
     * @memberof MapDot */
    GetY(projection) {
        return this.GetXY(projection)[1];
    }

    processXY(mapData) {
        switch (type) {
            case 0: // global 
                return GetContainerPointOffset(this.xy);
            case 1: // local
                return this.xy;
            case 2: // lat/long
                return mapData.XYPointAtLatLongPoint(this.xy);
        }
    }
}

/** Container for all data for an individual projection within a map */
export class ProjectionData {
    /** D3 projection data ref @type {d3.GeoProjection} @memberof ProjectionData */
    projection;
    index;
    /** D3 SVG Element @type {d3.Selection<SVGSVGElement, any, null, undefined>} @memberof ProjectionData */
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
                        xy = RotateAround(size, size, xy[0], xy[1], t.rotate[0] * (reverse ? -1 : 1));
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
 * @param {boolean=false} clamp Optional. Clamp value between 0 and 1? Default false
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
 * @param {boolean=false} clamp Optional, default false. Clamp value between 0 and 1? 
 *  If true, <=0 returns min, >=1 returns max
 * @returns Inverted normalized value, non-normalized
 */
function InvertNormalizedValue(value, min, max, clamp = false) {
    if (clamp) { if (value <= 0) { return min; } else if (value >= 1) { return max; } }
    let range = max - min;
    return (value * range) + min;
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
