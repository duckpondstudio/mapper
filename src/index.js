import { CreateMap } from './mapgen';
import css from './css/style.css';
import { InputSetup } from './mapinput';
import { CreateMapModule } from './module';

window.addEventListener('load', function () {
    // window is loaded 
    InputSetup();
    CreateMapModule('grieger');
});