import { Module } from "./module";


export class DataOverlay {

    module;
    #canvas;

    /**
     * Construct a new DataOverlay for the given {@link Module}
     * @param {Module} module Parent {@link Module} for this overlay
     * @memberof DataOverlay
     */
    constructor(module) {
        this.module = module;
    }

}