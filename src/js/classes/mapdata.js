import { ClickedMap, cursor } from '../input';
import { Module } from './module';
import { MapDot, dotStyle } from './mapdot';
import { CreateDot } from './mapdot';
import { ProjectionData } from './projectiondata';
import * as m from '../maps';
import * as disp from '../utils/display';
import * as math from '../utils/math';
import * as e from '../utils/element'

// see bottom for code examples

//TODO: move sizing logic (GetContainerSize, etc) into a parent class for both MapData and ProjectionData

const devicePixelRatio = window.devicePixelRatio;

const debugXYLatLong = true;

let PPP = 0;

/** Container for all data related to displaying a map */
export class MapData {
    /** Name of this map. See {@link m maps.js} @type {Module} @memberof MapData*/
    map;
    /** Module this MapData is contained in @type {Module} @memberof MapData*/
    module;
    /** Index, order in which this MapData was generated @type {Module} @memberof MapData*/
    index = -1;
    /** Div that contains all {@link projections} @type {HTMLDivElement} @memberof MapData*/
    mapContainer;
    /** Canvas for containing dots/data rendered on top of map @type {HTMLCanvasElement} @memberof MapData */
    mapCanvas;
    /** 2D render context for {@link mapCanvas} @type {CanvasRenderingContext2D} @memberof MapData */
    ctx;
    /** Array of projections loaded in this MapData @type {ProjectionData[]} @memberof MapData*/
    projections = [];
    /** Array of map dots to render @type {MapDot[]} @memberof MapData*/
    #mapDots = [];
    /** Paragraph used for basic MapData data output @type {HTMLParagraphElement} @memberof MapData*/
    #output;
    /** Rect for the size of this MapData, auto-updated on adding {@link projections}.
     *  @see mapContainer
     *  @type {HTMLParagraphElement} @memberof MapData*/
    #containerRect;

    /** Creates a new instance of MapData.
     *  @param {Module} module Module to load all relevant data from 
     *  @param {*} [projections=[]] List of projections to pre-load. 
     *  Can also call {@link AddProjection} at any time.
     *  @memberof MapData */
    constructor(
        module, index, projections = []) {
        this.map = module.map;
        this.module = module;
        this.index = index;

        // create projections container 
        this.mapContainer = document.createElement('div');
        this.mapContainer.setAttribute('id', 'mod' + this.module.moduleId + '_mapContainer');
        this.mapContainer.setAttribute('class', 'mapContainer');
        this.module.mapSubModule.appendChild(this.mapContainer);
        // add click event to container 
        this.mapContainer.addEventListener('click', mouseEvent => {
            this.module.Select(); ClickedMap(mouseEvent, this);
        });

        // create map canvas 
        this.mapCanvas = disp.CreateHDPICanvas();
        this.mapCanvas.id = 'mod' + this.module.moduleId + '_mapCanvas';
        this.mapCanvas.style.position = 'absolute';
        this.mapContainer.appendChild(this.mapCanvas);
        this.ctx = this.mapCanvas.getContext('2d', { alpha: true });

        // create output 
        this.#output = document.createElement('p');
        this.#output.setAttribute('id', 'mod' + module.moduleId + '_map' + 1 + '_output_' + this.index);
        this.module.dataSubModule.appendChild(this.#output);
        this.OutputText("Output goes here");
        for (let i = 0; i < projections.length; i++) {
            this.AddProjection(projections[i]);
        }
    }

    /** 
     * This {@link MapData} has been added to {@link document.body},
     * as called by its parent {@link Module}
     */
    AddedToDocumentBody() {
        // prevent right-click directly on map overlay canvas 
        this.mapCanvas.oncontextmenu = function (e) { e.stopPropagation(); }
        // propogate addedtodocumentbody method to all child projections 
        projections.forEach(projection => {
            projection.AddedToDocumentBody();
        });
    }

    #UpdateSize() {
        this.#containerRect = e.GetBoundingGlobalRect(this.mapContainer);
        let width = this.#containerRect.width;
        let height = this.#containerRect.height;
        disp.SetHDPICanvasSize(this.mapCanvas, width, height);
    }

    /** Add the given ProjectionData as a child of this MapData 
     * @param {ProjectionData} projection ProjectionData to add to this MapData */
    AddProjection(projection) {
        if (!projection) { return; }
        this.projections.push(projection);
        // update container rect
        this.#UpdateSize();
    }

    AddDotAtLatLongPointMapRatioPoint(latLong, xyMapRatio, id = null, style = dotStyle.default) {
        console.log("add dot at latlong " + latLong + " xyMapRatio " + xyMapRatio + " id", id, "style", style);


        this.ctx.beginPath();
        this.ctx.strokeStyle = 'purple';
        this.ctx.arc(200, 100, 50, 0, math.pi2);
        this.ctx.stroke();
    }

    AddDotAtLatLongPoint(latLong, id = null, style = dotStyle.default) {
        // get xy map ratio 
        let xyMapRatio = [0, 0];// TODO: calc xy ratio 
        this.AddDotAtLatLongPointMapRatioPoint(latLong, xyMapRatio, id, style);
    }
    AddDotAtLatLong(lat, long, id = null, style = dotStyle.default) { return this.AddDotAtLatLongPoint([lat, long], id, style); }
    AddDotAtGlobalPoint(xyGlobal, id = null, style = dotStyle.default) {

        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("xy global input is:", xyGlobal);
        console.log("container origin is:", this.GetContainerOrigin());
        let xyLocal = this.ContainerGlobalToLocalPoint(xyGlobal);
        console.log("XY Local is:", xyLocal);
        // return;
        let latLongAtPoint = this.LatLongAtPoint(xyLocal);
        // let pointratio = this.GetPointRatio(xyGlobal, false);
        // let ratioToXYLocal = this.PointRatioToXY(pointratio);
        // let ratioToXYGlobal = this.PointRatioToXY(pointratio, false);
        // let latLongfromLocal = this.LatLongAtPoint(xyGlobal, true);

        // TODO: determine why LatLong collection is borked on grieger (non-alt) with leftoffset / limited container size 

        // console.log("       ");
        // console.log("GlobalXY Input: " + xyGlobal);
        // // return;
        // console.log("xyLocal From GlobalXY: " + xyLocal);
        // console.log("LatLong From GlobalXY: " + latLongAtPoint);
        // console.log("PointRatio From GlobalXY: " + pointratio);
        // console.log("xyLocal From PointRatio: " + ratioToXYLocal);
        // console.log("GlobalXY From PointRatio: " + ratioToXYGlobal);
        // console.log("LatLong From xyLocal: " + latLongfromLocal);

        let est = "(Target: ~" + Math.round(xyGlobal[0]) +
            "," + Math.round(xyGlobal[1]) + ")";

        // console.log(" ");
        // console.log(" ");
        // console.log(" ");
        // console.log("LatLong Input: " + latLongAtPoint);
        // console.log("GlobalXY Input: " + xyGlobal);
        // console.log("xyLocal Reference: " + xyLocal);

        let moreLogging = true;
        if (moreLogging) {
            // console.log(" ");
            // console.log("A XY from LatLong, Avg True, Offset True");
            let xyFromLatLong = this.XYPointAtLatLongPoint(latLongAtPoint, true, true, true);
            // console.log("A Result : " + xyFromLatLong, est);
            // console.log(" ");


            PPP = 0;
            console.log("B0 XY from LatLong, Avg False, Offset True (LLAP:", latLongAtPoint, ")");
            xyFromLatLong = this.XYPointAtLatLongPoint(latLongAtPoint, false, true);
            console.log("B0 Result : " + xyFromLatLong, est);

            let diffX = xyGlobal[0] - xyFromLatLong[0];
            let diffY = xyGlobal[1] - xyFromLatLong[1];
            if (diffX < -1 || diffX > 1 || diffY < -1 || diffY > 1) {
                console.log("%cBAD: DiffX/Y:", "color:red; font-weight: bold", diffX, '/', diffY);
            } else {
                console.log("%cGOOD, within 1px diff :)", "color:green; font-weight: bold");
            }

            console.log(" ");
            let evenMoreLogging = false;
            if (evenMoreLogging) {
                PPP = 1;
                console.log("B1 XY from LatLong, Avg False, Offset True (LLAP:", latLongAtPoint, ")");
                xyFromLatLong = this.XYPointAtLatLongPoint(latLongAtPoint, false, true);
                console.log("B1 Result : " + xyFromLatLong, est);
                console.log(" ");
                PPP = 2;
                console.log("B2 XY from LatLong, Avg False, Offset True (LLAP:", latLongAtPoint, ")");
                xyFromLatLong = this.XYPointAtLatLongPoint(latLongAtPoint, false, true);
                console.log("B2 Result : " + xyFromLatLong, est);
                console.log(" ");
                // console.log("C XY from LatLong, Avg True, Offset False");
                // xyFromLatLong = this.XYPointAtLatLongPoint(latLongAtPoint, true, false);
                // console.log("C Result : " + xyFromLatLong, est);
                // console.log(" ");
                // console.log("D XY from LatLong, Avg False, Offset False");
                // xyFromLatLong = this.XYPointAtLatLongPoint(latLongAtPoint, false, false);
                // console.log("D Result : " + xyFromLatLong, est);
                // console.log(" ");
            }
        }

        console.log("Global XY Input:", xyGlobal);
        console.log("Local XY Input:", xyLocal);

        return;
        this.AddDotAtLatLongPointMapRatioPoint(
            this.LatLongAtPoint(xyGlobal),
            this.GetPointRatio(xyGlobal, false), id, style);
    }
    AddDotAtGlobal(xGlobal, yGlobal, id = null, style = dotStyle.default) { return this.AddDotAtGlobalPoint([xGlobal, yGlobal], id, style); }
    AddDotAtMapLocalPoint(xyMapLocal, id = null, style = dotStyle.default) {
        let latLong = [0, 0]; // TODO: calc lat/long
        let xyMapRatio = [0, 0];// TODO: calc xy ratio 
        this.AddDotAtLatLongPointMapRatioPoint(latLong, xyMapRatio, id, style);
    }
    AddDotAtMapLocal(xMapLocal, yMapLocal, id = null, style = dotStyle.default) { return this.AddDotAtMapLocalPoint([xMapLocal, yMapLocal], id, style); }
    // AddDotAtProjectionLocalPoint(xyProjectionLocal, id = null, style = dotStyle.default) { }
    // AddDotAtProjectionLocal(xProjectionLocal, yProjectionLocal, id = null, style = dotStyle.default) { }
    AddDotAtRatioPoint(xyMapRatio, id = null, style = dotStyle.default) {
        let latLong = [0, 0]; // TODO: calc lat/long
        this.AddDotAtLatLongPointMapRatioPoint(latLong, xyMapRatio, id, style);
    }
    AddDotAtRatio(xMapRatio, yMapRatio, id = null, style = dotStyle.default) { return this.AddDotAtRatioPoint([xMapRatio, yMapRatio], id, style); }
    // AddDotAtProjectionRatioPoint(xyProjectionRatio, id = null, style = dotStyle.default) { }
    // AddDotAtProjectionRatio(xProjectionRatio, yProjectionRatio, id = null, style = dotStyle.default) { }

    /**
     * Add a MapDot dot to this projection
     * @param {number} x X coordinate of this dot (or latitude, see {@link posType})
     * @param {number} y X coordinate of this dot (or longitude, see {@link posType})
     * @param {number} [posType=0] Optional, default 0. Defines the rendering behaviour of this dot.
     * 
     * 0. XY is GLOBAL XY coordinates (eg cursor position). Default 
     * 1. XY is LOCAL XY coordinates, relative to this {@link MapData}
     * 2. XY is normalized 0~1 fraction relative to its {@link ProjectionData projection}
     * 3. XY is Latitude/Longitude coordinates
     * @param {string} [id=null]
     * @memberof MapData
     */
    AddDotXY(x, y, id = null, posType = 0, style = dotStyle.default) {
        // check if any dots matching exist 
        if (this.#MapDotParamsAlreadyExists(x, y, id, posType, style)) { return; }
        // create new mapDot
        let mapDot = new MapDot(x, y, id, posType, style);

        this.#RenderDot(mapDot, false);
    }

    RemoveDotsByXY(xy) {
        if (this.#mapDots.length == 0) { return; }
        let dotsToRemove = this.#mapDots.filter(function (mapDot) {
            return mapDot.latLong == xy;
        });
        dotsToRemove.forEach(mapDot => {
            this.#RemoveDot(mapDot);
        });
    }
    RemoveDotsByID(id) {
        if (this.#mapDots.length == 0) { return; }
        let dotsToRemove = this.#mapDots.filter(function (mapDot) {
            return mapDot.id == id;
        });
        dotsToRemove.forEach(mapDot => {
            this.#RemoveDot(mapDot);
        });
    }
    RemoveAllDots() {
        if (this.#mapDots.length == 0) { return; }
        this.#mapDots.forEach(mapDot => {
            this.#RemoveDot(mapDot);
        });
    }

    GetAllDots() { return this.#mapDots; }
    GetDotsByXY(xy) {
        let dots = [];
        for (let i = 0; i < this.#mapDots.length; i++) {
            if (this.#mapDots[i].latLong == xy) { dots.push(this.#mapDots[i]); }
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

    #RenderDot(mapDot, checkForDuplicateDot = true) {
        console.log("r", 1);
        if (checkForDuplicateDot && this.#MapDotAlreadyExists(mapDot)) {
            console.log("r", -1);
            return;
        }
        console.log("r", 2);
        this.#mapDots.push(mapDot);
        console.log("r", 3);
        this.ctx.beginPath();
        this.ctx.arc(200, 100, 50, 0, math.pi2);
        this.ctx.stroke();
        console.log("r", 4);

    }
    #RemoveDot(mapDot) {
    }

    #MapDotAlreadyExists(mapDot) {
        return this.#MapDotParamsAlreadyExists(
            mapDot.lat,
            mapDot.long,
            mapDot.id,
            mapDot.style
        );
    }
    #MapDotParamsAlreadyExists(lat, long, id, style) {
        // check if any dots matching exist 
        this.#mapDots.forEach(mapDot => {
            if (mapDot.lat == lat && mapDot.long == long &&
                mapDot.id == id && mapDot.style == style) {
                // mapDot already exists, no need to add 
                return true;
            }
        });
        return false;
    }

    /** Updates all rendered map dots
     */
    #UpdateDots() {

        console.log("REMOVE ME");
        return;

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
            //TODO Only render dots on THIS projection, or adjacent + within 2x dot size/radius of its projection's edge  
            let dots = dotGroup.selectAll('circle')
                .data(this.#mapDots)// data input line 
                .enter();
            CreateDot(dots, projection);
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

    /** Convenience function, uses {@link GetContainerXYOffset} and adds 1 */
    ContainerGlobalToLocalPoint(xyGlobal) {
        return this.ContainerGlobalToLocalXY(xyGlobal[0], xyGlobal[1]);
    }
    /** Convenience function, uses {@link GetContainerXYOffset} and adds 1 */
    ContainerGlobalToLocalXY(xGlobal, yGlobal) {
        return [this.ContainerGlobalToLocalX(xGlobal),
            this.ContainerGlobalToLocalY(yGlobal)];
        }
        /** Convenience function, uses {@link GetContainerXOffset} and adds 1 */
        ContainerGlobalToLocalX(xGlobal) {
            return this.GetContainerXOffset(xGlobal) + 1;
        }
        /** Convenience function, uses {@link GetContainerYOffset} and adds 1 */
        ContainerGlobalToLocalY(yGlobal) {
        return this.GetContainerYOffset(yGlobal) + 1;
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
        return x - this.GetContainerOriginX();
    }
    /** Find the Y offset of the given point from this container's origin
     * @param {number} y Y-coord you want to find offset from this container for
     * @return {number} value of the Y offset from this container 
     * @memberof MapData
     */
    GetContainerYOffset(y) {
        return y - this.GetContainerOriginY();
    }

    GetContainerWidth() {
        return this.mapContainer.clientWidth;
    }
    GetContainerHeight() {
        return this.mapContainer.clientHeight;
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

    ConstrainPointWithinContainer(xy, offsetToProjection, zeroOrigin = false) {
        return this.ConstrainXYWithinContainer(xy[0], xy[1], offsetToProjection, zeroOrigin);
    }
    ConstrainXYWithinContainer(x, y, offsetToProjection, zeroOrigin = false) {
        let size = this.GetContainerSize();
        // offsetToProjection should usually be FALSE here, this by default works with screenspace coords
        if (offsetToProjection) { x = this.GetContainerXOffset(x); y = this.GetContainerYOffset(y); }
        let origin = zeroOrigin ? [0, 0] : this.GetContainerOrigin();
        let extent = zeroOrigin ? size : this.GetContainerExtent();
        console.log("CONSTRAIN, x", x, "y", y, "offset", offsetToProjection, "zeroOri", zeroOrigin, ", size:", size, ", origin:", origin, ", extent:", extent)
        // x coordinate
        console.log("updating X, x:", x, ", size:", size, ", origin:", origin, ", extent:", extent);
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
        console.log("updating Y, y:", y, ", size:", size, ", origin:", origin, ", extent:", extent);
        if (size[1] == 0) {
            // zero height, y must match
            y = origin[1];
            console.log("Y0: ", y);
        } else {
            // ensure within bounds 
            console.log("Y1: ", y);
            if (y < origin[1]) {
                console.log("Y2A: ", y);
                while (y < origin[1]) { y += size[1]; }
                console.log("Y2B: ", y);
            } else if (y > extent[1]) {
                console.log("Y3A: ", y);
                while (y > extent[1]) { y -= size[1]; }
                console.log("Y3B: ", y);
            }
        }
        console.log("Y4: ", y);
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
        return this.GetXYRatio(xy[0], xy[1], offsetToProjection);
    }

    XYRatioToXY(xRatio, yRatio, offsetToProjection) {
        let iX = math.InvertNormalizedValue(xRatio, this.GetContainerOriginX(), this.GetContainerExtentX(), false);
        let iY = math.InvertNormalizedValue(yRatio, this.GetContainerOriginY(), this.GetContainerExtentY(), false);
        if (offsetToProjection) { iX = this.GetContainerXOffset(iX); iY = this.GetContainerYOffset(iY); }
        return [iX, iY];
    }
    PointRatioToXY(xyRatio, offsetToProjection = true) {
        return this.XYRatioToXY(xyRatio[0], xyRatio[1], offsetToProjection);
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
    XYPointAtLatLongPoint(latLong, useAvgXY = true, offsetProjection = true, constrainToContainer = true) {
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
        if (debugXYLatLong) {
            console.log("getting XY at latlong", latLong, 'useAvgXY', useAvgXY,
                'offsetProjection', offsetProjection, "constrainToContainer", constrainToContainer);
            console.log("map:", this.map, "mapdata:", this);
        }
        // determine default projection index 
        // by default, use the middle projection (least likelihood of a point being out-of-container)
        // let projID = this.projections.length <= 1 ? 0 : Math.floor(this.projections.length / 2);
        let defaultProjectionID = PPP;
        let projection = this.projections[defaultProjectionID];// [2]
        let xy = [0, 0];
        if (useAvgXY) {
            // use all the combined projections to get the average XY 
            // iterate thru all latitude/longitude, and return the average
            if (debugXYLatLong) { console.log("processing avg latlong>xy across", this.projections.length, "projections"); }
            for (let i = 0; i < this.projections.length; i++) {
                let projXY = this.projections[i].XYPointAtLatLongPoint(latLong, offsetProjection, constrainToContainer, true);
                // console.log("Proj", i, "XYPointAtLatLong", projXY);
                // remap local-to-projection point to global point
                // projXY = this.projections[i].MapProjectionLocalPointToGlobalPoint(projXY);
                let x = projXY[0];
                let y = projXY[1];
                if (i == 0) {
                    xy[0] = x;
                    xy[1] = y;
                } else {
                    xy[0] += x;
                    xy[1] += y;
                }
                console.log("avg project for p%i:", i, projXY, " | projected xy:", xy);
            }
            xy[0] /= this.projections.length;
            xy[1] /= this.projections.length;
            console.log("avg projected XY final:", xy);
        } else {
            // NON-average, just use one projection
            // projection nullcheck 
            if (projection == null) {
                if (this.projections.length > 1) {
                    // middle projection didn't work, search through all 
                    for (let i = 0; i < this.projections.length; i++) {
                        if (i == defaultProjectionID) { continue; }
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
            // get projection-local XY
            xy = projection.XYPointAtLatLongPoint(latLong, offsetProjection, constrainToContainer, true);
        }
        // remap local-to-projection to global point using default projection
        console.log("PRE XY MAP PROJ LOCAL-TO-GLOBAL:", xy);
        xy = this.projections[defaultProjectionID].MapProjectionLocalPointToGlobalPoint(xy);
        console.log("POST XY MAP PROJ LOCAL-TO-GLOBAL:", xy);


        // lastly, failsafe ensure the returned point is within the bounds of this container
        // if (constrainToContainer && !this.IsPointWithinContainer(xy, offsetProjection)) {
        // console.log("XY:", xy);
        // console.log("Point within F:", this.IsPointWithinContainer(xy, false));
        // console.log("Point within T:", this.IsPointWithinContainer(xy, true));
        if (constrainToContainer) {
            // not within bounds, constrain within container 
            console.log("PRE MAP CONSTRAINT:", xy, "offset:", (offsetProjection));
            xy = this.ConstrainPointWithinContainer(xy, offsetProjection);
            console.log("POST MAP CONSTRAINT:", xy);
        }
        return math.RoundNumArray(xy);
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
                let latLong = this.projections[i].LatLongAtPoint(xy, offsetProjection);
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
                return this.LatLongAtPoint(xy, offsetProjection, true);
            } else {
                console.error("Cannot get LatLong at point: ", xy, ", projection at point null, ",
                    "ensure point is valid (bounds check?). AvgLatLong false, OffsetProjection ",
                    offsetProjection, ". Returning null");
                return null;
            }
        }
        return projection.LatLongAtPoint(xy, offsetProjection);
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
