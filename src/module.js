import { CreateMap } from "./mapgen";
import * as m from './maps';
const feather = require('feather-icons')


import svgGlobe from './svg/globe.svg';


export class Module {
    map;
    container;
    moduleId;

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

    /** @static Singleton counter for all instantiated modules
     * @memberof Module */
    static moduleCount = 0;
}

/**
 * Create a new map module & submodules for the given projection
 * @see {@link maps.js} for a list of valid projections
 * @param {string} map Name of the map projection you want to load. 
 *  
 */
export function CreateMapModule(map) {

    let module = new Module(map);
    CreateMap(module);

}