import { MapData } from "../mapgen/mapdata";
import { CreateMaps } from "../mapgen/mapmaker";
import { ClickedModule } from "../base/input";
import { DataOverlay } from '../data/dataoverlay';
import * as m from '../data/maps';
import { InfoSubModule } from "./submodules/submodule_info";
import { MapSubModule } from "./submodules/submodule_map";
import { SetupSubModule } from "./submodules/submodule_setup";
import * as stringUtils from "../utils/string";
const feather = require('feather-icons');

const moduleTypes =
    ['map', 'data'];

/** {@link Module} most recently interacted with (can be null) */
let _currentModule = null;
/** {@link MapData} most recently interacted with (can be null) */
let _currentMap = null;

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
    if (_currentMap == null) {
        if (_currentModule != null) { _currentMap = _currentModule.mapDatas[0]; }
    }
    return _currentMap;
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
    set map(mapData) {
        if (!mapData instanceof MapData) {
            console.warn("current.map setter MUST be type MapData, cannot set to", mapData);
            return;
        }
        _currentMap = mapData;
    }
}

/**
 * Basic display and data container for everything maps and data! 
 */
export class Module {

    map;
    container;
    /**
     * Numeric ID value for this {@link Module}
     * @type {Number}
     * @see {@link ID} for getting a value to assign to DOM .id property
     */
    moduleId;

    /**
     * Array of all {@link MapData} maps loaded into this module 
     * @type {MapData[]}
     * @memberof Module */
    mapDatas;
    /**
     * Canvas overlaid on all module maps for rendering data points
     * @type {DataOverlay}
     * @memberof Module
     */
    dataOverlay;

    titleBar;
    #titleText;

    /** @type {SetupSubModule} */ setupSubModule;
    /** @type {MapSubModule} */ mapSubModule;
    /** @type {InfoSubModule} */ infoSubModule;

    #mapsToLoad = 0;

    isLoading = false;

    constructor(type, data) {

        // metadata setup 
        this.moduleId = Module.moduleCount;

        // create container 
        this.container = document.createElement('div');
        this.container.id = this.ID();
        this.container.setAttribute('class', 'module background');
        // add selection event listener to container 
        this.container.addEventListener('click', mouseEvent => {
            this.Select(); ClickedModule(mouseEvent, this);
        });

        // add titlebar to module 
        this.titleBar = document.createElement('div');
        this.titleBar.id = this.ID("titleBar");
        this.titleBar.setAttribute('class', 'module titleBar');
        this.container.appendChild(this.titleBar);

        // add icon to titlebar 
        let icon = document.createElement('div');
        icon.innerHTML = this.GetModuleIcon(type);
        icon.setAttribute('class', 'contents icon');
        this.titleBar.appendChild(icon);

        // add title to titlebar
        this.#titleText = document.createElement("h1");
        this.#titleText.id = this.ID("titleBar_Text");
        this.#titleText.setAttribute('class', 'contents text');
        this.titleBar.appendChild(this.#titleText);
        this.SetTitle(stringUtils.CapitalizeFirstLetter(type) + " Module");


        switch (type) {
            case 'map':

                let map = this.data;
                if (stringUtils.IsNullOrEmptyOrWhitespace(map)) {
                    map = m.grieger;
                }

                // create submodules
                this.setupSubModule = new SetupSubModule(this, 'setup');
                // this.CreateMapSubmodule();
                this.mapSubModule = new MapSubModule(this, 'map');
                this.infoSubModule = new InfoSubModule(this, 'info');

                // assign loaded map
                if (map != null) {
                    this.AssignMap(map);
                }
                break;

            case 'data':
                break;
        }


        // add module to document body 
        document.body.appendChild(this.container);
        this.AddedToDocumentBody();

        // increment static module counter, ensure all unique
        Module.moduleCount++;

        // if lastModule is null, assign it to the first generated one 
        if (_currentModule == null) { this.Select(); }
    }

    /**
     * 
     * @param {*} moduleType 
     * @returns {feather.FeatherIcon}
     */
    GetModuleIcon(moduleType) {
        switch (moduleType) {
            case 'map':
                return feather.icons.globe.toSvg();
            case 'data':
                return feather.icons.database.toSvg();
        }
    }

    AssignMap(map) {
        // todo: move map-centric methods into a separate script for map module, similar to submodules 

        if (this.isLoading) {
            console.warn("Cannot assign a new map while module is still loading,",
                'module:', this, ', new map:', map);
            return;
        }
        this.isLoading = true;

        // remove any current children 
        if (this.mapSubModule == null) {
            console.warn("Must initialize MapSubModule before AssigningMap", map,
                'to Module:', this);
            return;
        }

        this.mapSubModule.ClearMaps();

        this.map = m.ParseMap(map);
        // this.SetTitle(m.GetMapFullName(this.map));

        this.mapSubModule.AssignMap(map);

        // generate maps 
        this.mapDatas = CreateMaps(this);
        this.#mapsToLoad = this.mapDatas.length;
    }


    SetTitle(titleText) {
        if (this.#titleText != null) {
            this.#titleText.innerHTML = titleText;
        }
    }

    ID(...suffixes) {
        let id = "mod" + this.moduleId;
        if (suffixes == null) {
            return id;
        }
        for (let i = 0; i < suffixes.length; i++) {
            // add suffix value 
            if (i > 0 && typeof (suffixes[i] === 'number' &&
                typeof (suffixes[i - 1] === 'string'))) {
                // if a number is preceded by a string, don't prefix underscore 
                id += suffixes[i];
            }
            else {
                id += "_" + suffixes[i];
            }
        }
        return id;
    }

    /**
     * Called when a map (and its given projections) have finished loading
     * @param {MapData} mapData MapData that has finished loading 
     */
    MapLoaded(mapData) {
        this.#mapsToLoad--;
        if (this.#mapsToLoad == 0) {
            this.#AllMapsLoaded();
        } else if (this.#mapsToLoad < 0) {
            console.error("ERROR: MapLoaded called from mapData", mapData,
                "even though all maps have already loaded. Investigate");
        }
    }

    /**
     * Called when all maps in the module are successfully loaded 
     */
    #AllMapsLoaded() {
        // generate data overlay
        this.dataOverlay = new DataOverlay(this);
        this.mapSubModule.submoduleDiv.prepend(this.dataOverlay.div);
        this.dataOverlay.AddedToDocumentBody();

        // completed loading 
        this.isLoading = false;
    }

    /** This {@link Module} has been added to {@link document.body} */
    AddedToDocumentBody() { }

    /** Sets this Module as {@link _currentModule}, the most recently active module */
    Select() {
        _currentModule = this;
    }

    /**
     * Quick reference getter to the global rect for the map submodule 
     * @see {@link GetBoundingGlobalRect}
     * @returns {DOMRect}
     */
    GetMapRect() {
        return this.mapSubModule.GetMapRect();
    }



    /**
     * Write the given values (single var or array) as text in this map's output field
     * @param {...string} string Line or lines of text to display. Leave empty to clear text
     * @memberof MapData
     */
    OutputText(...text) {
        this.infoSubModule.OutputText(...text);
    }
    /** Clears output text data
     * @memberof MapData
     */
    ClearOutput() {
        this.infoSubModule.ClearOutput();
    }

    /** @static Singleton counter for all instantiated modules
     * @memberof Module */
    static moduleCount = 0;
}