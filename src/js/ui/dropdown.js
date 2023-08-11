let capitalizeFirstLetter = true;

export class OptionDisplay {
    // TODO: replace .text with this, and render img/color/gradients inline with dropdown options 
    text;
    img;
    color;
    gradientName;
}

/**
 * 
 * @param {string} name 
 * @param {string} id 
 * @param {function} onChangeCallback 
 * @param  {...any} options 
 * @returns {HTMLSelectElement}
 */
export function CreateDropdown(name, id, parent, onChangeCallback, ...options) {

    let dropdown = document.createElement("select");
    dropdown.parent = parent;
    dropdown.name = name;
    dropdown.id = id;

    for (let val of options) {
        var option = document.createElement("option");
        val = val.trim();
        let disabled = false;
        if (val == '---') {
            disabled = true;
            val = ' - - - - - ';
        }
        else if (val.startsWith('--')) {
            while (val.startsWith('-'))
                val = val.substring(1);
            val = ' - - - ' + val.trim() + ' - - - ';
            disabled = true;
        }
        option.disabled = disabled;
        option.value = val;
        let text = val;
        if (capitalizeFirstLetter) {
            text = val.charAt(0).toUpperCase() + val.slice(1);
        }

        let optionLabel = document.createTextNode(text);
        option.appendChild(optionLabel);
        dropdown.appendChild(option);
    }

    if (onChangeCallback != null) {
        dropdown.onchange = onChangeCallback;
    }

    return dropdown;
}