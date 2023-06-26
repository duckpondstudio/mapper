import { MapData } from "./mapdata";
import { CreateMap } from "../mapmaker";
import * as m from '../maps';
const feather = require('feather-icons')

/** {@link Module} most recently interacted with (can be null) */
let lastModule = null;

/** Array containing all loaded {@link Module modules}
 * @type {Module[]} */
export let modules = [];

/**
 * Create a new map module & submodules for the given projection
 * @see {@link maps.js} for a list of valid projections
 * @param {string} map Name of the map projection you want to load. 
 */
export function CreateModule(map) {
    let module = new Module(map);
    module.mapData = CreateMap(module);
    modules.push(module);
    return module;
}

/** 
 * Get the most recently loaded/used {@link Module}.
 * - If none is recently used, returns the first loaded.
 * - If none are loaded, returns null.
 * @see {@link modules} is the array containing all loaded modules
 * @export
 * @return {Module} */
export function LastModule() {
    if (lastModule == null) {
        for (let i = 0; i < modules.length; i++) {
            if (modules[i] == null) continue;
            lastModule = modules[i];
        }
    }
    return lastModule;
}

/**
 * Basic display and data container for everything maps and data! 
 */
export class Module {

    map;
    container;
    moduleId;

    /** 
     * @type {MapData}
     * @memberof Module */
    mapData;    

    titleBar;

    mapSubModule;
    dataSubModule;

    constructor(map) {

        // metadata setup 
        this.map = m.ParseMap(map);
        this.moduleId = Module.moduleCount;

        // create container 
        this.container = document.createElement('div');
        this.container.id = "mod" + this.moduleId + "_" + map;
        this.container.setAttribute('class', 'module background');
        // add selection event listener to container 
        this.container.addEventListener('click', this.SelectModule);

        // add titlebar to module 
        this.titleBar = document.createElement('div');
        this.titleBar.id = "mod" + this.moduleId + "_titleBar";
        this.titleBar.setAttribute('class', 'module titleBar');
        this.container.appendChild(this.titleBar);

        // add icon to titlebar 
        let icon = document.createElement('div');
        icon.innerHTML = feather.icons.globe.toSvg();
        icon.setAttribute('class', 'contents icon');
        this.titleBar.appendChild(icon);

        // add title to titlebar
        let titleText = document.createElement("h1");
        titleText.setAttribute('id', 'mod' + this.moduleId + '_titleText');
        titleText.innerHTML = m.GetMapFullName(map);
        titleText.setAttribute('class', 'contents text');
        this.titleBar.appendChild(titleText);

        // add map submodule 
        this.mapSubModule = document.createElement('div');
        this.mapSubModule.setAttribute('class', 'submodule map');
        this.mapSubModule.id = 'mod' + this.moduleId + '_mapCont';
        this.container.appendChild(this.mapSubModule);
        
        // add data container
        this.dataSubModule = document.createElement('div');
        this.dataSubModule.setAttribute('class', 'submodule data');
        this.dataSubModule.setAttribute('id', 'mod' + this.moduleId + '_dataCont');
        this.container.appendChild(this.dataSubModule);

        // add module to document body 
        document.body.appendChild(this.container);

        // increment static module counter, ensure all unique
        Module.moduleCount++;
    }

    /** Select this module */
    SelectModule(mouseEvent) {
        lastModule = this;
    }

    /** @static Singleton counter for all instantiated modules
     * @memberof Module */
    static moduleCount = 0;
}