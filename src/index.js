import { CreateMap } from './mapgen';
// import cssFonts from './css/fonts.css';
import (/* webpackPreload: true */ './css/fonts.css');
import cssStyle from './css/style.css';
import { InputSetup } from './mapinput';
import { CreateMapModule } from './module';
import * as m from './maps';

window.addEventListener('load', function () {
    // window is loaded 
    InputSetup();
    CreateMapModule(m.grieger);
});