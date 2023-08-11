import { SubModule } from '../submodule';

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