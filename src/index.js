import(/* webpackPreload: true */ './css/fonts.css');
import(/* webpackPreload: true */ './css/style.css');
import { CreateMapModule } from './module';
import { InputSetup } from './mapinput';
import * as m from './maps';

export let modules = [];

window.addEventListener('load', function () {
    // window is loaded 
    console.time("mapLoad");
    InputSetup();
    modules.push(CreateMapModule(m.grieger));
    console.timeEnd("mapLoad");
});









//TODO: potentially useful, test / make snippet
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