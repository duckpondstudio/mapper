import Konva from "konva";
import { Module } from "./module";

/**
 * Handles the Konva overlay for visually displaying datadots on maps 
 */
export class DataOverlay {

    module;
    div;
    
    #mapRect;

    #stage;
    #layer;

    /**
     * Construct a new DataOverlay for the given {@link Module}
     * @param {Module} module Parent {@link Module} for this overlay
     * @memberof DataOverlay
     */
    constructor(module) {
        this.module = module;
        this.div = document.createElement('div');
        this.div.id = module.ID('dataoverlay');
        this.div.setAttribute('class', 'mapOverlayCanvas');
    }

    /** This {@link DataOverlay} has been added to {@link document.body} */
    AddedToDocumentBody() {
        this.#mapRect = this.module.GetMapRect();
        this.#stage = new Konva.Stage({
            container: this.div.id,
            width: this.#mapRect.width,
            height: this.#mapRect.height
        });
        this.#layer = new Konva.Layer();

        let circle = new Konva.Circle(
            {
                x: this.#mapRect.width / 2,
                y: this.#mapRect.height / 2,
                radius: 10,
                fill: 'red',
                stroke: 'black',
                strokeWidth: 2
            }
        );

        this.#layer.add(circle);
        this.#stage.add(this.#layer);
        this.#layer.draw();
    }

}