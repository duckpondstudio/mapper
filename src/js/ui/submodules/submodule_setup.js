import { SubModule } from '../submodule';
import * as m from '../../data/maps';
import { CreateDropdown } from '../dropdown';
import { CreateColorPicker } from '../colorpicker';
import * as stringUtils from '../../utils/string';
import { AllGradients, AllColorPairs, GetColor, GradientsOfType, IsGradient, GetColorPair, Gradient } from '../../utils/color';

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
        this.container.setAttribute('class', 'uiLabeledAsset dropdown ' + simpleName);

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
    constructor(name, setupSubmodule, callback, initialColor) {
        let simpleName = stringUtils.Simplify(name);
        this.colorPicker = CreateColorPicker(setupSubmodule, callback, initialColor);

        this.label = document.createElement('div');
        this.label.setAttribute('class', 'uiLabeledAsset colorPicker label');
        this.label.innerHTML = name;

        this.container = document.createElement('div');
        this.container.setAttribute('class', 'uiLabeledAsset colorPicker ' + simpleName);

        this.container.appendChild(this.label);
        this.container.appendChild(this.colorPicker);

        setupSubmodule.submoduleDiv.appendChild(this.container);
    }

    get color() {
        return this.colorPicker.color.toHexString();
    }
    set color(color) {
        this.colorPicker.setAttribute('color', color);
    }

    get isDark() {
        return this.colorPicker.color.isDark();
    }
}

export class SetupSubModule extends SubModule {

    mapDropdown;
    mapColor;
    mapLandColorPicker;
    mapWaterColorPicker;
    dataColor;

    #lastColorPickerVisible = false;
    #bypassCallback = false;

    constructor(parentModule, submoduleName) {
        super(parentModule, submoduleName);

        this.mapDropdown = new Dropdown('Projection', this, this.MapSelected, ...m.GetAllMaps());

        let colorPairs = AllColorPairs(true);
        colorPairs.push(...GradientsOfType('singleaxis', true));
        colorPairs.push('--DIY', 'custom');
        this.mapColor = new Dropdown('Map Colours', this, this.MapColorSelected, ...colorPairs);

        this.mapLandColorPicker = new ColorPicker('Land', this, this.MapLandColorSelected, GetColor('land'));
        this.mapWaterColorPicker = new ColorPicker('Water', this, this.MapWaterColorSelected, GetColor('water'));

        this.dataColor = new Dropdown('Data Colours', this, this.DataColorSelected, ...AllGradients(true));

        this.dataColor.AssignLink("https://github.com/bpostlethwaite/colormap/blob/master/colormaps.png",
            "Colour Previews");

        this.UpdateDisplayColorPickers(true);
    }

    MapSelected() {
        let currentValue = this[this.selectedIndex].value;
        // use "this.parent", which is assigned in dropdown, 
        // because "this" refers to the DROPDOWN, not this class
        if (this.parent.parentModule.map != currentValue) {
            this.parent.parentModule.AssignMap(currentValue);
        }
    }
    MapColorSelected() {
        let currentValue = this[this.selectedIndex].value;
        // first, determine if custom 
        if (currentValue == 'custom') {
            // custom colors, do nothing 
        } else if (IsGradient(currentValue, 'singleaxis')) {
            // single-axis gradient 
            let gradient = Gradient(currentValue);
            const gradientRange = 0.15;
            let lowIndex = Math.round(gradient.length * gradientRange);
            let highIndex = Math.round(gradient.length * (1 - gradientRange));
            this.parent.parentModule.mapSubModule.SetLandWaterColor(gradient[lowIndex], gradient[highIndex]);
        } else {
            // color pair
            let colorPair = GetColorPair(currentValue, true);
            this.parent.parentModule.mapSubModule.SetLandWaterColor(colorPair[0], colorPair[1]);
        }
        this.parent.UpdateDisplayColorPickers();
    }
    MapLandColorSelected() {
        if (this.parent.#bypassCallback) { return; }
        let color = this.parent.mapLandColorPicker.color;
        this.parent.parentModule.mapSubModule.SetLandColor(color);
    }
    MapWaterColorSelected() {
        if (this.parent.#bypassCallback) { return; }
        let color = this.parent.mapWaterColorPicker.color;
        this.parent.parentModule.mapSubModule.SetWaterColor(color);
    }
    DataColorSelected() {
    }

    UpdateDisplayColorPickers(force = false) {
        let display = this.mapColor.dropdown[this.mapColor.dropdown.selectedIndex].value == 'custom';
        if (!force && this.#lastColorPickerVisible == display) { return; }
        this.#lastColorPickerVisible = display;
        if (display && !force) {
            // displaying after hiding (or forcing display), update colors without modified callback (unless forcing)
            this.#bypassCallback = true;
            this.mapLandColorPicker.color = this.parentModule.mapSubModule.GetLandColor();
            this.mapWaterColorPicker.color = this.parentModule.mapSubModule.GetWaterColor();
            this.#bypassCallback = false;
        }
        this.mapLandColorPicker.container.style.display = display ? 'inline-block' : 'none';
        this.mapWaterColorPicker.container.style.display = display ? 'inline-block' : 'none';
    }
}
