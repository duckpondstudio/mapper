import(/* webpackPreload: true */ './../../css/fonts.css');
import(/* webpackPreload: true */ './../../css/style.css');
import { CreateModule } from "../ui/module";
import { DemoUIObject } from '../ui/uidemo';
import { InputSetup } from './input';
import * as m from '../data/maps';

window.addEventListener('load', function () {
    // window is loaded
    // import CSV files 
    importAllCsvFiles(require.context('./../../assets/csv', true, /\.csv$/));
    // import setup data 
    InputSetup();
    CreateModule(m.grieger);
    // TODO: very buggy rendering with non-square projections
    // CreateModule(m.equirectangular);

    // DemoUIObject('gradient');
});

async function importAllCsvFiles(r) {
    r.keys().forEach(r);  
} 