import(/* webpackPreload: true */ './../css/fonts.css');
import(/* webpackPreload: true */ './../css/style.css');
import { CreateModule } from './classes/module';
import { DemoUIObject } from './classes/uidemo';
import { InputSetup } from './input';
import * as m from './maps';

window.addEventListener('load', function () {
    // window is loaded 
    InputSetup();
    CreateModule(m.grieger);
    // TODO: very buggy rendering with non-square projections
    // CreateModule(m.equirectangular);
    
    // DemoUIObject('gradient');
});
