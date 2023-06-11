import * as d3 from 'd3';

/** Container for all data related to displaying a map */
export class MapData {
    map;
    index = -1;
    dataContainer;
    projectionContainer;
    projections = [];
    #output;
    constructor(
        map, index, dataContainer, projectionContainer, projections = []) {
        this.map = map;
        this.index = index;
        this.dataContainer = dataContainer;
        this.projectionContainer = projectionContainer;
        this.projections = projections;
        if (!dataContainer) {
            console.error("Cannot create MapData properly without dataContainer");
            return;
        }
        // create output 
        this.#output = document.createElement('p');
        this.#output.setAttribute('id', 'output_' + this.index);
        this.dataContainer.appendChild(this.#output);
        this.OutputText("Output goes here");
    }
    AddProjection(projection) {
        if (!projection) { return; }
        this.projections.push(projection);
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
    mapData;
    constructor(projection, index, svg, mapData) {
        this.projection = projection;
        this.index = index;
        this.svg = svg;
        this.mapData = mapData;
    }
}