import { SubModule } from '../submodule';
import * as m from '../../data/maps';
import { GetBoundingGlobalRect } from "../../utils/element";
import { mapSize } from '../../mapgen/mapmaker';
import { SetCSSRule } from '../../base/css';
import { GetColor } from '../../utils/color';

export class MapSubModule extends SubModule {

    #map;

    #landColor;
    #waterColor;

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

        this.ResetColor();
    }

    GetLandColor() { return this.#landColor; }
    GetWaterColor() { return this.#waterColor; }

    ResetColor() {
        this.SetLandWaterColor('land', 'water');
    }
    SetColorPair(colorPair) {
        // TODO: make this work with color pairs 
    }
    SetLandWaterColor(landColor = 'land', waterColor = 'water') {
        this.SetLandColor(landColor);
        this.SetWaterColor(waterColor);
    }
    SetLandColor(landColor) {
        if (this.#landColor == landColor) { return; }
        this.#landColor = landColor;
        let ruleName = ".mapContainer .map .land.m" + this.parentModule.moduleId;
        console.log("C:", GetColor(landColor));
        console.log("RuleName:", ruleName);
        SetCSSRule(ruleName,
            "fill:" + GetColor(landColor));
    }
    SetWaterColor(waterColor) {
        // if (this.#waterColor == waterColor) { return; }
        this.#waterColor = waterColor;
        SetCSSRule(".mapContainer .map .water.m" + this.parentModule.moduleId,
            "fill:" + GetColor(waterColor));
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