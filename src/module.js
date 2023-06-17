import { CreateMap } from "./mapgen";
import * as m from './maps';
const feather = require('feather-icons')


import svgGlobe from './svg/globe.svg';


export class Module {
    map;
    container;
    moduleId;

    titleBar;

    mapSubMod;
    dataSubMod;

    constructor(map) {

        // metadata setup 
        this.map = m.ParseMap(map);
        this.moduleId = Module.moduleCount;

        // create container 
        this.container = document.createElement('div');
        this.container.id = "module_" + this.moduleId + "_" + map;
        this.container.setAttribute('class', 'module background');

        // let bg = document.createElement('div');
        // bg.id = "module_" + this.moduleId + "_bg";
        // bg.setAttribute('class', 'module background');
        // this.container.appendChild(bg);

        this.titleBar = document.createElement('div');
        this.titleBar.id = "module_" + this.moduleId + "_titleBar";
        this.titleBar.setAttribute('class', 'module titleBar');
        this.container.appendChild(this.titleBar);

        let icon = document.createElement('div');
        // icon.src = svgGlobe;
        icon.innerHTML = feather.icons.globe.toSvg();
        icon.setAttribute('class', 'contents icon');
        this.titleBar.appendChild(icon);

        let title = document.createElement("h1");
        title.setAttribute('id', 'titleContainer_' + this.moduleId);
        title.innerHTML = m.GetMapFullName(map);
        title.setAttribute('class', 'contents text');
        this.titleBar.appendChild(title);

        document.body.appendChild(this.container);

        // this.mapSubMod

        // increment static module counter, ensure all unique
        Module.moduleCount++;
    }

    /** @static Singleton counter for all instantiated modules
     * @memberof Module */
    static moduleCount = 0;
}

export function CreateMapModule(map) {

    let module = new Module(map);
    CreateMap(module);

}