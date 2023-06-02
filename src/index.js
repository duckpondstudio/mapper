import { CreateMap } from './mapgen';
import css from './css/style.css';

window.addEventListener('load', function () {
    // window is loaded 
    console.log("loaded");
    CreateMap('griegeralt');
});

console.log("page init");