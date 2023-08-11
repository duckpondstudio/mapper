let capitalizeFirstLetter = true;

export function CreateDropdown(name, id, ...values) {
 
    let dropdown = document.createElement("select");
    dropdown.name = name;
    dropdown.id = values;
 
    for (const val of values)
    {
        var option = document.createElement("option");
        option.value = val;
        if (capitalizeFirstLetter) {
            option.text = val.charAt(0).toUpperCase() + val.slice(1);
        }
        dropdown.appendChild(option);
    }

    return dropdown;
 
    // document.getElementById("container").appendChild(label).appendChild(dropdown);
}