import { CreateMap } from './mapgen';
// import cssFonts from './css/fonts.css';
import (/* webpackPreload: true */ './css/fonts.css');
import cssStyle from './css/style.css';
import { InputSetup } from './mapinput';
import { CreateMapModule } from './module';
import * as m from './maps';

window.addEventListener('load', function () {
    // window is loaded 
    InputSetup();
    console.time("mapLoad");
    CreateMapModule(m.grieger);
    console.timeEnd("mapLoad");
    PromiseFunction(HeavyScript);
});

let debugPromiseFunction = true;
function PromiseFunction(functionToExecute) {
    // Execute heavy function asynchronously
    if (debugPromiseFunction) {
        console.log('Beginning to execute promise function');
    }
    PromiseFunctionCallback()
        .then(function (result) {
            if (debugPromiseFunction)
                console.log('Function promise returned, result: ', result);
            return result;
        })
        .catch(function (error) {
            console.error('Function promise error: ', error);
        });
    function PromiseFunctionCallback() {
        return new Promise(function (resolve, reject) {
            // Simulate heavy computation with setTimeout
            setTimeout(function () {
                try {
                    const result = functionToExecute();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, 0);
        });
    }
}




function HeavyScript() {
    console.log("start heavy script");

    setInterval
    const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < 2500);

    console.log("done heavy script");
}
