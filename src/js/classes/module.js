import { MapData } from "./mapdata";
import { CreateMaps, mapSize } from "../mapmaker";
import { ClickedModule } from "../input";
import * as m from '../maps';
const feather = require('feather-icons');

const _spawnInfo = false;

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
    /** Currently active {@link Module module} @type {Module} */
    get module() { return CurrentModule(); },
    /** Currently active {@link MapData map} @type {MapData} */
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
     * @type {MapData[]}
     * @memberof Module */
    mapDatas;

    titleBar;

    mapSubModule;
    infoSubModule;

    #mapsToLoad = 0;

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
        let mapsCount = m.GetMapProjectionsArray(map).length;
        let mapSubModuleWidthHeight = m.GetMapContainerWidthHeight(map, mapSize, mapsCount);
        this.mapSubModule = document.createElement('div');
        this.mapSubModule.setAttribute('class', 'submodule map');
        this.mapSubModule.style.width = mapSubModuleWidthHeight[0] + 'px';
        this.mapSubModule.style.height = mapSubModuleWidthHeight[1] + 'px';
        // TODO: make submodule IDs accessible/easily readable for IDs of their children
        this.mapSubModule.id = 'mod' + this.moduleId + '_mapSub';
        this.container.appendChild(this.mapSubModule);

        // add info container
        this.infoSubModule = document.createElement('div');
        this.infoSubModule.setAttribute('class', 'submodule info');
        this.infoSubModule.setAttribute('id', 'mod' + this.moduleId + '_infoSub');
        // generate it to avoid errors but check if actually adding to document 
        if (_spawnInfo) {
            this.container.appendChild(this.infoSubModule);
        }

        // generate maps 
        this.mapDatas = CreateMaps(this);
        this.#mapsToLoad = this.mapDatas.length;

        // add module to document body 
        document.body.appendChild(this.container);
        this.AddedToDocumentBody();

        // increment static module counter, ensure all unique
        Module.moduleCount++;

        // if lastModule is null, assign it to the first generated one 
        if (_currentModule == null) { this.Select(); }
    }

    /**
     * Called when a map (and its given projections) have finished loading
     * @param {MapData} mapData MapData that has finished loading 
     */
    MapLoaded(mapData) {
        this.#mapsToLoad--;
        if (this.#mapsToLoad == 0) {
            this.AllMapsLoaded();
        } else if (this.#mapsToLoad < 0) {
            console.error("ERROR: MapLoaded called from mapData", mapData,
                "even though all maps have already loaded. Investigate");
        }
    }

    /**
     * Called when all maps in the module are successfully loaded 
     */
    AllMapsLoaded() {
        // generate data overlay
        console.log('create data overlay');
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