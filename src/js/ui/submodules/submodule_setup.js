import { SubModule } from '../submodule';
import * as m from '../../data/maps';
import { CreateDropdown } from '../dropdown';
import * as stringUtils from '../../utils/string';
import { AllGradients } from '../../utils/color';

class Dropdown {
    dropdown;
    label;
    container;
    constructor(name, setupSubmodule, callback, ...options) {
        
        let simpleName = stringUtils.Simplify(name);

        this.dropdown = CreateDropdown(simpleName, setupSubmodule.ID(simpleName),
            setupSubmodule, callback, ...options);

        this.label = document.createElement('div');
        this.label.innerHTML = name;

        this.container = document.createElement('div');
        this.container.setAttribute('class', 'setupDropdown');

        this.container.appendChild(this.label);
        this.container.appendChild(this.dropdown);

        setupSubmodule.submoduleDiv.appendChild(this.container);
    }
}

export class SetupSubModule extends SubModule {

    mapDropdown;
    mapColor;
    dataColor;

    constructor(parentModule, submoduleName) {
        super(parentModule, submoduleName);

        this.mapDropdown = new Dropdown('Projection', this, this.MapSelected, ...m.GetAllMaps());
        this.mapColor = new Dropdown('Map Colours', this, this.MapColorSelected, ...m.GetAllMaps());
        this.dataColor = new Dropdown('Data Colour', this, this.DataColorSelected, ...AllGradients(true));

    }

    MapSelected() {
        let currentValue = this[this.selectedIndex].value;
        if (this.parent.parentModule.map != currentValue) {
            this.parent.parentModule.AssignMap(currentValue);
        }
    }
    MapColorSelected() {

    }
    DataColorSelected() {

    }
}
