import * as d3 from 'd3';
import { ProjectionData } from './projectiondata';

/** Container of all styles for MapDot */
export const dotStyle = {
    get circle() { return 'crc'; },
    get square() { return 'sqr'; },
    get default() { return this.circle; }
}

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
    /** 
     * Optional. Appearance style for this dot. Default {@link dotStyle.circle circle}
     * @see {@link dotStyle}
     * @memberof MapDot */
    style;

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
     * @memberof MapDot */
    constructor(x, y, id = null, posType = 0, style = dotStyle.circle) {
        this.x = x;
        this.y = y;
        this.id = id;
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
        switch (style) {
            case dotStyle.circle:
            case dotStyle.square:
                this.style = style;
                break;
            default:
                console.warn("Attempted to create MapDot on invalid style", style,
                    ", see @dotStyle for valid values, defaulting to dotStyle.circle");
                this.style = dotStyle.circle;
                break;
        }
    }

    /**
     * Returns {@link x} and {@link y} as a two-value number[] array: [{@link x}, {@link y}]
     * @readonly
     * @returns Two-value array [x, y]
     * @memberof MapDot
     */
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

    /**
     * Apply CSS styling for this dot
     * @param {d3.Selection} d3Selection D3 selected element (eg this dot's DOM element)
     * @param {ProjectionData} projection Reference to the projection rendering this dot 
     */
    StyleForD3(d3Selection, projection) {
        d3Selection
            .attr('cx', this.GetX(projection))
            .attr('cy', this.GetY(projection))
            .attr('r', 3)
            .style('fill', 'red')
            ;
    }
}

export function CreateDot(d3DotsGroup, projection) {
    d3DotsGroup.append('circle')
        .attr('class', 'mapDot')
        .each(function (d) { d.StyleForD3(d3.select(this), projection)});
}