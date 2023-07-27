import(/* webpackPreload: true */ './../../css/fonts.css');
import(/* webpackPreload: true */ './../../css/style.css');
import { CreateModule } from "../ui/module";
import { DemoUIObject } from '../ui/uidemo';
import { InputSetup } from './input';
import * as m from '../data/maps';

window.addEventListener('load', function () {
    // window is loaded 
    InputSetup();
    CreateModule(m.grieger);
    // TODO: very buggy rendering with non-square projections
    // CreateModule(m.equirectangular);
    
    // DemoUIObject('gradient');
});