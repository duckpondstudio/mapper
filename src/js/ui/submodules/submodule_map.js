import { SubModule } from '../submodule';
import * as m from '../../data/maps';
import { GetBoundingGlobalRect } from "../../utils/element";
import { mapSize } from '../../mapgen/mapmaker';

export class MapSubModule extends SubModule {

    #map;

    ClearMaps() {
        while (this.submoduleDiv.firstChild) {
            this.submoduleDiv.removeChild(this.submoduleDiv.firstChild);
        }
    }

    AssignMap(map) {

        this.#map = map;
        let mapsCount = m.GetMapProjectionsArray(this.#map).length;
        let mapSubModuleWidthHeight = m.GetMapContainerWidthHeight(
            this.#map, mapSize, mapsCount);
        this.submoduleDiv.style.width = mapSubModuleWidthHeight[0] + 'px';
        this.submoduleDiv.style.height = mapSubModuleWidthHeight[1] + 'px';
    }

    /**
     * Quick reference getter to the global rect for the map submodule 
     * @see {@link GetBoundingGlobalRect}
     * @returns {DOMRect}
     */
    GetMapRect() {
        return GetBoundingGlobalRect(this.submoduleDiv);
    }

}