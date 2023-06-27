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
     * 0. XY is GLOBAL XY coordinates (eg cursor position). Default 
     * 1. XY is LOCAL XY coordinates, relative to its {@link MapData}
     * 2. XY is normalized 0~1 fraction relative to its {@link ProjectionData projection}
     * 3. XY is Latitude/Longitude coordinates
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

    #retrievedXY = false;
    #xy;

    /** Create a new {@link MapDot}. Set {@link X} and {@link Y} coordinates. 
     * Optionally specify {@link posType} and {@link id ID}.
     * 
     * @param {number} x X-coordinate for this dot (can be Latitude, see {@link posType})
     * @param {number} y Y-coordinate for this dot (can be Longitude, see {@link posType})
     * @param {number=0} posType Optional, default 0. Defines this dot's coordinate system.
     * 
     * 0. XY is GLOBAL XY coordinates (eg cursor position). Default 
     * 1. XY is LOCAL XY coordinates, relative to this {@link MapData}
     * 2. XY is normalized 0~1 fraction relative to its {@link ProjectionData projection}
     * 3. XY is Latitude/Longitude coordinates
     * @param {string=null} id Optional, default null. ID for this dot. 
     * If set, can use to access all dots of the given ID.
     * @memberof MapDot */
    constructor(x, y, id = null, posType = 0, style = dotStyle.circle) {
        this.x = x;
        this.y = y;
        this.id = id;
        // set pos type
        switch (posType) {
            case 0: // global 
            case 1: // local 
            case 2: // normalized
            case 3: // latLong
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
        // if (this.#retrievedXY)
        //     return this.#xy;
        switch (this.posType) {
            case 0: // global, screenspace
                // convert screenspace to lat/long for per-projection localization
                let latLong = p.LatLongAtPoint(this.xy);
                this.#xy = p.XYPointAtLatLongPoint(latLong, false);
                break;
            case 1: // already local to projection 
                this.#xy = [this.x, this.y];
                break;
            case 2: // normalized
                this.#xy = p.MapPointRatioToXY(this.xy);// xy 0-1 ratio per mapdata
                break;
            case 3: // lat/long
                this.#xy = p.XYPointAtLatLong(this.xy, false);
                break;
        }
        this.#retrievedXY = true;
        return this.#xy;
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
        .each(function (d) { d.StyleForD3(d3.select(this), projection) });
}