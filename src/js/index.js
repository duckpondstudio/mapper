import(/* webpackPreload: true */ './../css/fonts.css');
import(/* webpackPreload: true */ './../css/style.css');
import { CreateModule } from './classes/module';
import { InputSetup } from './input';
import * as m from './maps';

window.addEventListener('load', function () {
    // window is loaded 
    InputSetup();
    // CreateModule(m.diptych);
    CreateModule(m.grieger);
    // CreateModule(m.grieger_full);
    // CreateModule(m.adams1);
    // CreateModule(m.adams2);
    // CreateModule(m.adams2);
    // CreateModule(m.adams2);
    // CreateModule(m.adams2);
    // CreateModule(m.grieger_alt);
    // CreateModule(m.grieger);
    // CreateModule(m.adams1_alt);
    // CreateModule(m.grieger_alt);
    // TODO: very buggy rendering with non-square projections 
    // CreateModule(m.equirectangular);
});
