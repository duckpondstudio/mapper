import { SubModule } from '../submodule';
import * as m from '../../data/maps';
import { CreateDropdown } from '../dropdown';
import { CreateColorPicker } from '../colorpicker';
import * as stringUtils from '../../utils/string';
import { AllGradients, GetColor } from '../../utils/color';

class Dropdown {
    // TODO: genericize, move to dropdown.js 
    dropdown;
    label;
    container;
    link;
    constructor(name, setupSubmodule, callback, ...options) {

        let simpleName = stringUtils.Simplify(name);

        this.dropdown = CreateDropdown(simpleName, setupSubmodule.ID(simpleName),
            setupSubmodule, callback, ...options);

        this.label = document.createElement('div');
        this.label.innerHTML = name;

        this.container = document.createElement('div');
        this.container.setAttribute('class', 'uiLabeledAsset ' + simpleName);

        this.container.appendChild(this.label);
        this.container.appendChild(this.dropdown);

        setupSubmodule.submoduleDiv.appendChild(this.container);
    }

    // TODO: genericize, for title/content assets 
    AssignLink(linkUrl, hoverText) {
        this.link = document.createElement('div');
        this.link.innerHTML += " &nbsp;<sup><a href=" +
            linkUrl + " target=_blank>(?)</a></sup>";
        if (!stringUtils.IsNullOrEmptyOrWhitespace(hoverText)) {
            this.link.setAttribute('class', 'uiLabeledAsset hoverText');
            this.link.setAttribute('title', hoverText);
        }
        this.label.appendChild(this.link);
    }
}

class ColorPicker {
    // TODO: genericize, move to colorpicker.js
    colorPicker;
    label;
    container;
    constructor(name, setupSubmodule, callback, ...options) {
        let simpleName = stringUtils.Simplify(name);
        this.colorPicker = CreateColorPicker();

        this.label = document.createElement('div');
        this.label.innerHTML = name;

        this.container = document.createElement('div');
        this.container.setAttribute('class', 'uiLabeledAsset colorPicker ' + simpleName);

        this.container.appendChild(this.label);
        this.container.appendChild(this.colorPicker);
        
        setupSubmodule.submoduleDiv.appendChild(this.container);
    }

    get color() {
        return this.colorPicker.color;
    }
    set color(color) {
        this.colorPicker.color = color;
    }
}

export class SetupSubModule extends SubModule {

    mapDropdown;
    mapColor;
    mapLandColorPicker;
    mapWaterColorPicker;
    dataColor;

    constructor(parentModule, submoduleName) {
        super(parentModule, submoduleName);

        this.mapDropdown = new Dropdown('Projection', this, this.MapSelected, ...m.GetAllMaps());
        this.mapColor = new Dropdown('Map Colours', this, this.MapColorSelected, '---');

        this.mapLandColorPicker = new ColorPicker('Land', this, this.MapLandColorSelected);
        this.mapWaterColorPicker = new ColorPicker('Water', this, this.MapWaterColorSelected);

        this.dataColor = new Dropdown('Data Colours', this, this.DataColorSelected, ...AllGradients(true));

        this.dataColor.AssignLink("https://github.com/bpostlethwaite/colormap/blob/master/colormaps.png",
            "Colour Previews");
        
        console.log(GetColor('land'));

    }

    MapSelected() {
        let currentValue = this[this.selectedIndex].value;
        if (this.parent.parentModule.map != currentValue) {
            this.parent.parentModule.AssignMap(currentValue);
        }
    }
    MapColorSelected() {
        console.log("HI");
    }
    MapLandColorSelected() {

    }
    MapWaterColorSelected() {

    }
    DataColorSelected() {

        console.log("HI2");
    }
}
