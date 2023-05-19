import { GenerateCanvas } from './canvas';
import css from './css/style.css';

window.addEventListener('load', function () {
    // window is loaded 
    console.log("loaded");
    GenerateCanvas();
});

console.log("page init");