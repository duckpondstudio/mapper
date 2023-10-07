import(/* webpackPreload: true */ './../../css/fonts.css');
import(/* webpackPreload: true */ './../../css/style.css');

import { CreateModule } from "../ui/module";
import { DemoUIObject } from '../ui/uidemo';
import { InputSetup } from './input';
import * as m from '../data/maps';
import { LoadCSS } from "./css";

window.addEventListener('load', function () {
    // window is loaded
    LoadCSS();
    // import CSV files 
    ImportAllFiles(require.context('./../../assets/export', true,
        /\.(csv|txt|xlsx?|xls)$/
    ));
    // import setup data 
    InputSetup();
    CreateModule('map', m.grieger);
    CreateModule('data');
    
});


async function ImportAllFiles(r) {
    r.keys().forEach(r);
} 