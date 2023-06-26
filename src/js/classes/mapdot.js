

/** Data related to rendering dots on a map projection */
export class MapDot {
    /** X-coordinate for this dot (can be Latitude, see {@link posType})
     * @type {number}
     * @memberof MapDot */
    x;
    /** Y-coordinate for this dot (can be Latitude, see {@link posType})
     * @memberof MapDot */
    y;
    /** Optional, default 0. Defines this dot's coordinate system.
     * 
     * 0. XY represents GLOBAL XY coordinates (eg cursor position). Default 
     * 1. XY represents LOCAL XY coordinates, relative to this {@link MapData}
     * 2. XY represents Latitude/Longitude coordinates
     * @memberof MapDot */
    posType;
    /** Optional, default null. ID for this dot. 
     * If set, can use to access all dots of the given ID. 
     * @memberof MapDot */
    id;
    /** Create a new {@link MapDot}. Set {@link X} and {@link Y} coordinates. 
     * Optionally specify {@link posType} and {@link id ID}.
     * 
     * @param {number} x X-coordinate for this dot (can be Latitude, see {@link posType})
     * @param {number} y Y-coordinate for this dot (can be Longitude, see {@link posType})
     * @param {number=0} posType Optional, default 0. Defines this dot's coordinate system.
     * 
     * 0. XY represents GLOBAL XY coordinates (eg cursor position). Default 
     * 1. XY represents LOCAL XY coordinates, relative to this {@link MapData}
     * 2. XY represents Latitude/Longitude coordinates
     * @param {string=null} id Optional, default null. ID for this dot. 
     * If set, can use to access all dots of the given ID.
     * @memberof MapDot
     */
    constructor(x, y, id = null, posType = 0) {
        this.x = x;
        this.y = y;
        switch (posType) {
            case 0: // global 
            case 1: // local 
            case 2: // latLong
                this.posType = posType;
                break;
            default:
                console.warn("Attempted to create MapDot of invalid posType ", posType,
                    ', see @posType param for valid values, defaulting to 0');
                this.posType = posType = 0;
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
        switch (this.posType) {
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
}

export function CreateDot(d3DotsGroup, projection) {
    d3DotsGroup.append('circle')
        .attr('class', 'mapDot')
        .attr('cx', function (d) { return d.GetX(projection) })
        .attr('cy', function (d) { return d.GetY(projection) })
        .attr('r', 3)
        .style('fill', 'red');
}