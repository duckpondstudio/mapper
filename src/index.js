import { CreateMap } from './mapgen';
import css from './css/style.css';
import { InputSetup } from './mapinput';
import { CreateMapModule } from './module';
import * as m from './maps';

window.addEventListener('load', function () {
    // window is loaded 
    InputSetup();
    CreateMapModule(m.grieger);
});