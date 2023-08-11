let capitalizeFirstLetter = true;

/**
 * 
 * @param {string} name 
 * @param {string} id 
 * @param {function} onChangeCallback 
 * @param  {...any} values 
 * @returns {HTMLSelectElement}
 */
export function CreateDropdown(name, id, parent, onChangeCallback, ...values) {

    let dropdown = document.createElement("select");
    dropdown.parent = parent;
    dropdown.name = name;
    dropdown.id = id;

    for (const val of values) {
        var option = document.createElement("option");
        option.value = val;
        if (capitalizeFirstLetter) {
            option.text = val.charAt(0).toUpperCase() + val.slice(1);
        }
        dropdown.appendChild(option);
    }

    if (onChangeCallback != null) {
        dropdown.onchange = onChangeCallback;
    }

    return dropdown;
}