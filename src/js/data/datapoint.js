import Konva from "konva";

import * as DataOverlay from './dataoverlay';
import { Location } from './datalocation';

export class DataPoint {

    /** 
     * How should this DataPoint be drawn by {@link DataOverlay.DataOverlay DataOverlay}? 
     * 
     * 0. Via the {@link DataPoint.#location location} property
     * 1. Via the {@link DataPoint.#xValue xRatio} and {@link DataPoint.#yValue yRatio} '
     * properties, as percentages across the {@link DataOverlay.DataOverlay Overlay}'s 
     * width and height (0-1, 0=top left, 1=bottom right)
     * 3. Via the {@link DataPoint.#xValue xRatio} and {@link DataPoint.#yValue yRatio} '
     * properties, as X and Y coordinates (not recommended)
     * 
     * @type {Number}
    */
    #drawType = 0;

    /**
     * @type {Location}
     */
    #location;

    #xValue = 0.5;
    #yValue = 0.5;

    #shape;

    /**
     * @type {DataOverlay.DataOverlay}
     */
    parentOverlay;

    constructor(parentOverlay) {

        this.parentOverlay = parentOverlay;

        this.#shape = new Konva.Circle({
            radius: 6,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 1
        });

    }




    UpdatePosition() {
        switch (this.#drawType) {
            case 0:
                // via Location
                console.log("TODO");
                break;
            case 1:
                // via x/y, as percent of overlay
                if (this.parentOverlay == null) {
                    console.warn("Cannot determine x/y of datapoint with null parentOverlay, returning", this);
                    return;
                }
                this.shape.x(this.parentOverlay.width * this.x);
                this.shape.y(this.parentOverlay.height * this.y);
                break;
            case 2:
                // via x/y, as pixel coordinates
                this.shape.x(this.x);
                this.shape.y(this.y);
                break;
        }
    }



    //#region Getters and Setters 

    get shape() {
        return this.#shape;
    }

    get location() {
        return this.#location;
    }
    set location(newLocation) {
        this.#location = newLocation;
        if (this.#drawType == 0) {
            this.UpdatePosition();
        }
    }

    get drawType() {
        return this.#drawType;
    }
    set drawType(newDrawType) {
        if (newDrawType < 0 || newDrawType > 2) {
            console.error("Invalid DrawType %i, must be 0-2, current DrawType is %i, returning", newDrawType, this.#drawType);
            return;
        }
        this.#drawType = newDrawType;
        this.UpdatePosition();
    }

    get x() {
        return this.#xValue;
    }
    set x(newX) {
        this.#xValue = newX;
        if (this.#drawType == 1 || this.#drawType == 2) {
            this.UpdatePosition();
        }
    }
    get y() {
        return this.#yValue;
    }
    set y(newY) {
        this.#yValue = newY;
        if (this.#drawType == 1 || this.#drawType == 2) {
            this.UpdatePosition();
        }
    }

    //#endregion Getters and Setters 

}