import 'toolcool-color-picker';

export function CreateColorPicker(parent, onChangeCallback, initialColor) {

    
    let colorPicker = document.createElement('toolcool-color-picker');

    colorPicker.parent = parent;

    colorPicker.setAttribute('button-width', '32px');
    colorPicker.setAttribute('button-height', '18px');
    colorPicker.setAttribute('button-padding', '1px');
    colorPicker.setAttribute('margin-bottom', '20px');
    colorPicker.setAttribute('margin-top', '50px');
    
    colorPicker.setAttribute('color', initialColor);

    if (onChangeCallback != null) {
        colorPicker.addEventListener('change', onChangeCallback);
    }
        
    return colorPicker;

}