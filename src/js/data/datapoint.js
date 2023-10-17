import * as DataOverlay from './dataoverlay';
import { Location } from './datalocation';

export class DataPoint {

    /** 
     * How should this DataPoint be drawn by {@link DataOverlay.DataOverlay DataOverlay}? 
     * 
     * 0. Via the {@link DataPoint.location location} property
     * 1. Via the {@link DataPoint.xRatio xRatio} and {@link DataPoint.yRatio yRatio} '
     * properties, as percentages across the {@link DataOverlay.DataOverlay Overlay}'s 
     * width and height (0-1, 0=top left, 1=bottom right)
     * 3. Via the {@link DataPoint.xRatio xRatio} and {@link DataPoint.yRatio yRatio} '
     * properties, as X and Y coordinates (not recommended)
     * 
     * @type {Number}
    */
    drawType = 0;

    /**
     * @type {Location}
     */
    location;

    xRatio = 0.5;
    yRatio = 0.5;

}