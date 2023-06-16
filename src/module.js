import { CreateMap } from "./mapgen";

export class Module {
    map;
    container;
    moduleId;
    constructor(map) {
        
        // metadata setup 
        this.map = map;
        this.moduleId = Module.moduleCount;
        
        // create container 
        this.container = document.createElement('div');
        this.container.id = "mapModule_" + this.moduleId + "_" + map;
        this.container.setAttribute('class', 'mapModule');
    
        document.body.appendChild(this.container);
        
        // increment static module counter, ensure all unique
        Module.moduleCount++;
    }
    
    /** @static Singleton counter for all instantiated modules
     * @memberof Module */
    static moduleCount = 0;
}

export function CreateMapModule(map) {

    console.log("building map module, " + map);

    let module = new Module(map);

    CreateMap(module);

}