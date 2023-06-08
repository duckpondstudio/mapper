import { CreateMap } from './mapgen';
import css from './css/style.css';

window.addEventListener('load', function () {
    // window is loaded 
    console.log("loaded");
    CreateMap('grieger');
    CreateMap('grieger');
});

console.log("page init");