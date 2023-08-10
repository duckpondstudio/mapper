import { MapData } from "../mapgen/mapdata";
import { CreateMaps, mapSize } from "../mapgen/mapmaker";
import { ClickedModule } from "../base/input";
import { DataOverlay } from '../data/dataoverlay';
import * as m from '../data/maps';
import { GetBoundingGlobalRect } from "../utils/element";
const feather = require('feather-icons');

const _spawnInfo = true;

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

    /** @type {HTMLDivElement} */ setupSubModule;
    /** @type {HTMLDivElement} */ mapSubModule;
    /** @type {HTMLDivElement} */ infoSubModule;

    /** Paragraph used for basic MapData data output @type {HTMLParagraphElement} @memberof MapData*/
    #infoOutput;

    #mapsToLoad = 0;

    isLoading = false;

    constructor(map) {

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
        icon.innerHTML = feather.icons.globe.toSvg();
        icon.setAttribute('class', 'contents icon');
        this.titleBar.appendChild(icon);

        // add title to titlebar
        this.#titleText = document.createElement("h1");
        this.#titleText.id = this.ID("titleBar_Text");
        this.#titleText.setAttribute('class', 'contents text');
        this.titleBar.appendChild(this.#titleText);
        this.SetTitle("New Module");

        // create submodules 
        this.CreateSetupSubmodule();
        this.CreateMapSubmodule();
        this.CreateInfoSubmodule();

        // assign loaded map
        if (map != null) {
            this.AssignMap(map);
        }

        // add module to document body 
        document.body.appendChild(this.container);
        this.AddedToDocumentBody();

        // increment static module counter, ensure all unique
        Module.moduleCount++;

        // if lastModule is null, assign it to the first generated one 
        if (_currentModule == null) { this.Select(); }
    }

    AssignMap(map) {


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
        while (this.mapSubModule.firstChild) {
            this.mapSubModule.removeChild(this.mapSubModule.firstChild);
        }

        this.map = m.ParseMap(map);
        this.SetTitle(m.GetMapFullName(this.map));

        let mapsCount = m.GetMapProjectionsArray(this.map).length;
        let mapSubModuleWidthHeight = m.GetMapContainerWidthHeight(this.map, mapSize, mapsCount);
        this.mapSubModule.style.width = mapSubModuleWidthHeight[0] + 'px';
        this.mapSubModule.style.height = mapSubModuleWidthHeight[1] + 'px';

        // generate maps 
        this.mapDatas = CreateMaps(this);
        this.#mapsToLoad = this.mapDatas.length;
    }

    CreateSetupSubmodule() {

    }

    CreateMapSubmodule() {
        // add map submodule
        this.mapSubModule = document.createElement('div');
        this.mapSubModule.setAttribute('class', 'submodule map');
        this.mapSubModule.id = this.ID('mapSub');
        this.container.appendChild(this.mapSubModule);
    }


    CreateInfoSubmodule() {

        // add info container
        this.infoSubModule = document.createElement('div');
        this.infoSubModule.setAttribute('class', 'submodule info');
        this.infoSubModule.setAttribute('id', this.ID('infoSub'));
        // info output text 
        this.#infoOutput = document.createElement('p');
        this.#infoOutput.setAttribute('id', this.ID('infoSub', 'output'));
        this.infoSubModule.appendChild(this.#infoOutput);
        this.OutputText("Output goes here");
        // generate it to avoid errors but check if actually adding to document 
        if (_spawnInfo) {
            this.container.appendChild(this.infoSubModule);
        }
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
        this.mapSubModule.prepend(this.dataOverlay.div);
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
        return GetBoundingGlobalRect(this.mapSubModule);
    }



    /**
     * Write the given values (single var or array) as text in this map's output field
     * @param {...string} string Line or lines of text to display. Leave empty to clear text
     * @memberof MapData
     */
    OutputText(...text) {
        if (!text || text.length == 0) {
            this.#infoOutput.innerHTML = "";
            return;
        }
        if (text.length == 1) {
            this.#infoOutput.innerHTML = text[0];
        } else {
            this.#infoOutput.innerHTML = "";
            for (let i = 0; i < text.length; i++) {
                this.#infoOutput.innerHTML += text[i] + "<br>";
            }
        }
    }
    /** Clears output text data
     * @memberof MapData
     */
    ClearOutput() {
        this.OutputText();
    }

    /** @static Singleton counter for all instantiated modules
     * @memberof Module */
    static moduleCount = 0;
}