import { CreateMap } from './mapgen';
import css from './css/style.css';
import { InputSetup } from './mapinput';

window.addEventListener('load', function () {
    // window is loaded 
    InputSetup();
    CreateMap('grieger');
});

console.log("page init");