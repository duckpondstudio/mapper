
import demoMap from './img/grieger-triptychial-political.png';
import * as Canvas from './canvas';

function GenerateCanvas() {
    console.log("generating canvas");
}

function ShowDemoMap() {
    console.log("creating demo map img");
    const img = new Image();
    img.src = demoMap;
    img.width = 500;
    document.body.appendChild(img);
}

export { GenerateCanvas };