
/** 
 * Show debug log output for {@link PromiseFunction}? 
 * @type {boolean=true} */
let debugPromiseFunction = true;

/**
 * Simple wrapper around Promise, that calls and returns value from a method
 * @export
 * @param {function} functionToInvoke Function invoked and returned in Promise. 
 * @returns Value returned from {@link functionToInvoke} */
export function PromiseFunction(functionToInvoke) {
    // Execute heavy function asynchronously
    if (debugPromiseFunction) {
        console.log('Beginning to execute promise function', functionToInvoke);
    }
    PromiseFunctionCallback()
        .then(function (result) {
            if (debugPromiseFunction) {
                console.log('Function promise returned, result: ', result);
            }
            return result;
        })
        .catch(function (error) {
            console.error('Function promise error: ', error);
        });
    function PromiseFunctionCallback() {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                try {
                    const result = functionToInvoke();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, 0);
        });
    }
}