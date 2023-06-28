import { MapData } from "./mapdata";
import { CreateMap } from "../mapmaker";
import { ClickedModule } from "../input";
import * as m from '../maps';
const feather = require('feather-icons')

/** {@link Module} most recently interacted with (can be null) */
let _currentModule = null;

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
 * Get the most-recently-interacted-with {@link Module}.
 * - If none is recently used, returns the first loaded.
 * - If none are loaded, returns null.
 * @see {@link modules} is the array containing all loaded modules
 * @see {@link current}, convenience getter for most recent {@link MapData map} and {@link Module module} 
 * @see {@link CurrentMap}, method for getting most recent {@link MapData map}
 * @export
 * @return {Module} */
export function CurrentModule() {
    if (_currentModule == null) {
        for (let i = 0; i < modules.length; i++) {
            if (modules[i] == null) continue;
            _currentModule = modules[i];
        }
    }
    return _currentModule;
}
/** 
 * Get the most recently used {@link MapData}, from the current {@link CurrentModule module}.
 * @see {@link current}, convenience getter for most recent {@link MapData map} and {@link Module module} 
 * @see {@link CurrentModule}, method for getting most recent {@link Module module}
 * @export
 * @return {Module} */
export function CurrentMap() {
    if (_currentModule == null) { return null; }
    return _currentModule.mapData;
}
/** 
 * Gets currently active {@link Module module} and {@link MapData map}. 
 * @see {@link CurrentModule}
 * @see {@link CurrentMap}
 * @export
 * */
export const current = {
    /** Currently active {@link Module module} */
    get module() { return CurrentModule(); },
    /** Currently active {@link MapData map} */
    get map() { return CurrentMap(); },
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
        this.container.addEventListener('click', mouseEvent => {
            this.Select(); ClickedModule(mouseEvent, this);
        });

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
        this.AddedToDocumentBody();

        // increment static module counter, ensure all unique
        Module.moduleCount++;

        // if lastModule is null, assign it to the first generated one 
        if (_currentModule == null) { this.Select(); }
    }

    /** This {@link Module} has been added to {@link document.body} */
    AddedToDocumentBody() { }

    /** Sets this Module as {@link _currentModule}, the most recently active module */
    Select() {
        _currentModule = this;
    }

    /** @static Singleton counter for all instantiated modules
     * @memberof Module */
    static moduleCount = 0;
}