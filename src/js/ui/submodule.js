import * as module from './module';
import * as stringUtils from '../utils/string';

class SubModule {

    parentModule;
    submoduleDiv;

    /**
     * 
     * @param {string} submoduleName name of this submodule, eg "info" and "map" 
     */
    constructor(parentModule, submoduleName) {

        this.parentModule = parentModule;

        if (stringUtils.IsNullOrEmptyOrWhitespace(submoduleName)) {
            submoduleName = 'default';
        }
        let idName = submoduleName + 'Sub';

        // add info container
        this.submoduleDiv = document.createElement('div');
        this.submoduleDiv.setAttribute('class', 'submodule ' + submoduleName);
        this.submoduleDiv.setAttribute('id', parentModule.ID(idName));
        
        this.parentModule.container.appendChild(this.submoduleDiv);
    }
}

export class InfoSubModule extends SubModule {

    /** Paragraph used for basic MapData data output @type {HTMLParagraphElement} @memberof MapData*/
    #infoOutput;

    constructor(parentModule, submoduleName) {

        super(parentModule, submoduleName);
        
        // info output text 
        this.#infoOutput = document.createElement('p');
        this.#infoOutput.setAttribute('id', this.parentModule.ID('infoSub', 'output'));
        this.submoduleDiv.appendChild(this.#infoOutput);
        
        this.OutputText("Output goes here");
    }

    /**
     * Write the given values (single var or array) as text in this map's output field
     * @param {...string} string Line or lines of text to display. Leave empty to clear text
     * @memberof MapData
     */
    OutputText(...text) {
        if (!text || text.length == 0) {
            this.#infoOutput.innerHTML = "";
            return;
        }
        if (text.length == 1) {
            this.#infoOutput.innerHTML = text[0];
        } else {
            this.#infoOutput.innerHTML = "";
            for (let i = 0; i < text.length; i++) {
                this.#infoOutput.innerHTML += text[i] + "<br>";
            }
        }
    }
    /** Clears output text data
     * @memberof MapData
     */
    ClearOutput() {
        this.OutputText();
    }
}
