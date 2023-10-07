import 'toolcool-color-picker';

export function CreateColorPicker() {

    
    let colorPicker = document.createElement('toolcool-color-picker');

    colorPicker.setAttribute('button-width', '32px');
    colorPicker.setAttribute('button-height', '20px');
    colorPicker.setAttribute('button-padding', '2px');
    // colorPicker.setAttribute('style', 'margin-bottom:20px');
    colorPicker.setAttribute('margin-bottom', '20px');
    // colorPicker.style.
    // colorPicker.style.marginTop = '20px';

    return colorPicker;

}