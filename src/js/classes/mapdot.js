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
    /** Latitude for this dot
     * @type {number}
     * @memberof MapDot */
    lat;
    /** Longitude for this dot
     * @memberof MapDot */
    long;
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

    /** 
     * Create a new {@link MapDot}. Set {@link lat latitude} and {@link long longitude} coordinates. 
     * Optionally specify {@link id ID} and {@link style style (appearance)}.
     * 
     * @param {number} lat Latitude for this dot
     * @param {number} long Longitude for this dot
     * @param {string} [id=null] Optional, default null. ID for this dot. 
     * If set, can use to access all dots of the given ID.
     * @param {string} [style=dotStyle.default] Style this dot will be 
     * rendered as. See {@link dotStyle}
     * @memberof MapDot */
    constructor(lat, long, id = null, style = dotStyle.default) {
        // set basic values 
        this.lat = lat;
        this.long = long;
        this.id = id;
        // set style, ensure it's valid 
        switch (style) {
            case dotStyle.circle:
            case dotStyle.square:
                this.style = style;
                break;
            default:
                console.warn("Attempted to create MapDot on invalid style", style,
                    ", see @dotStyle for valid values, defaulting to dotStyle.default");
                this.style = dotStyle.default;
                break;
        }
    }

    /**
     * Returns {@link lat} and {@link long} as a two-value number[] array: [{@link lat}, {@link long}]
     * @readonly
     * @returns Two-value array [lat, long]
     * @memberof MapDot
     */
    get latLong() { return [this.lat, this.long]; }

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
                let latLong = p.LatLongAtPoint(this.latLong);
                this.#xy = p.XYPointAtLatLongPoint(latLong, false);
                break;
            case 1: // already local to projection 
                this.#xy = [this.lat, this.long];
                break;
            case 2: // normalized
                this.#xy = p.MapPointRatioToXY(this.latLong);// xy 0-1 ratio per mapdata
                break;
            case 3: // lat/long
                this.#xy = p.XYPointAtLatLong(this.latLong, false);
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