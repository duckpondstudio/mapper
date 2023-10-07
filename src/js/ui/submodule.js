import { Module } from './module';
import * as stringUtils from '../utils/string';

export class SubModule {

    /**
     * Parent Module of this submodule
     * @type {Module}
     */
    parentModule;
    /** 
     * @type {HTMLDivElement}
     */
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

    /** Convenience, calls ID method on parent module */
    ID(...suffixes) {
        return this.parentModule.ID(...suffixes);
    }
}