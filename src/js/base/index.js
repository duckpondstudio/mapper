import(/* webpackPreload: true */ './../../css/fonts.css');
import(/* webpackPreload: true */ './../../css/style.css');

import { CreateModule } from "../ui/module";
import { DemoUIObject } from '../ui/uidemo';
import { InputSetup } from './input';
import * as m from '../data/maps';

window.addEventListener('load', function () {
    // window is loaded
    // import CSV files 
    ImportAllFiles(require.context('./../../assets/export', true,
        /\.(csv|txt|xlsx?|xls)$/
    ));
    // import setup data 
    InputSetup();
    CreateModule('map', m.grieger);
    // TODO: very buggy rendering with non-square projections
    // CreateModule(m.equirectangular);
    // DemoUIObject('gradient');
});


async function ImportAllFiles(r) {
    r.keys().forEach(r);
} 