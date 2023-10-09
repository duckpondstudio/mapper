import { SubModule } from '../submodule';
import * as m from '../../data/maps';
import { GetBoundingGlobalRect } from "../../utils/element";
import { mapSize } from '../../mapgen/mapmaker';
import { SetCSSRule, SetCSSVar, root } from '../../base/css';
import { GetColor, LerpColor } from '../../utils/color';

export class MapSubModule extends SubModule {

    #map;

    #landColor = 'land';
    #waterColor = 'water';

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

        this.#AssignColorCSSClass();

        this.ResetColor();
    }

    GetLandColor() { return GetColor(this.#landColor); }
    GetWaterColor() { return GetColor(this.#waterColor); }


    #AssignColorCSSClass() {
        // create a dynamically named mX (m0, m1) CSS class, and variable references
        //     so that we can just modify the CSS vars to change the color 
        // define names 
        let ruleLandName = ".mapContainer .map .land.m" + this.parentModule.moduleId;
        let ruleWaterName = ".mapContainer .map .water.m" + this.parentModule.moduleId;
        let cssLandVarName = '--color-map-land-fill-m' + this.parentModule.moduleId;
        let cssLandStrokeVarName = '--color-map-land-fill-m' + this.parentModule.moduleId + '-stroke';
        let cssWaterVarName = '--color-map-water-fill-m' + this.parentModule.moduleId;
        // create CSS vars 
        SetCSSVar(cssLandVarName, this.GetLandColor());
        SetCSSVar(cssLandStrokeVarName, LerpColor(this.GetLandColor(), '#000000', 0.5));
        SetCSSVar(cssWaterVarName, this.GetWaterColor());
        // set CSS rules 
        SetCSSRule(ruleLandName, 'fill:var(' + cssLandVarName + ')', 'stroke:var(' + cssLandStrokeVarName + ')');
        SetCSSRule(ruleWaterName, 'fill:var(' + cssWaterVarName + ')', 'stroke:var(' + cssWaterVarName + ')');
    }


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
        let fillVarName = '--color-map-land-fill-m' + this.parentModule.moduleId;
        let strokeVarName = '--color-map-land-fill-m' + this.parentModule.moduleId + '-stroke';
        SetCSSVar(fillVarName, this.GetLandColor());
        let targetColor = this.parentModule.setupSubModule.mapLandColorPicker.isDark ? "#FFFFFF" : "#000000";
        SetCSSVar(strokeVarName, LerpColor(this.GetLandColor(), targetColor, 0.35));
    }
    SetWaterColor(waterColor) {
        // if (this.#waterColor == waterColor) { return; }
        this.#waterColor = waterColor;
        let varName = '--color-map-water-fill-m' + this.parentModule.moduleId;
        SetCSSVar(varName, this.GetWaterColor());
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