import { SubModule } from '../submodule';
import * as m from '../../data/maps';
import { CreateDropdown } from '../dropdown';

export class SetupSubModule extends SubModule {

    mapDropdown;

    constructor(parentModule, submoduleName) {
        super(parentModule, submoduleName);

        this.mapDropdown = CreateDropdown('mapDropdown', this.ID('mapDropdown'),
            this, this.MapSelected, ...m.GetAllMaps());

        this.submoduleDiv.appendChild(this.mapDropdown);
    }

    MapSelected() {
        let currentValue = this[this.selectedIndex].value;
        if (this.parent.parentModule.map != currentValue) {
            this.parent.parentModule.AssignMap(currentValue);
        }

    }

}