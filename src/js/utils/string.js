/**
 * Surround the input string with the given surroundWith string, before and after
 * @param {string} input String to modify 
 * @param {string} surroundWith 
 * @returns {string} Input string surrounded with the given value
 */
export function SurroundString(input, surroundWith) {
    if (!input.startsWith(surroundWith)) { input = surroundWith + input; }
    if (!input.endsWith(surroundWith)) { input = input + surroundWith; }
    return input;
}
/**
 * Prefix and suffix the input string with the given prefix/suffix values 
 * @param {string} input String to modify 
 * @param {string} prefixWith String to prefix the input with (before) 
 * @param {string} suffixWith String to suffix the input with (after)
 * @returns {string} Input string prefixed/suffixed with the given values 
 */
export function PrefixSuffixString(input, prefixWith, suffixWith) {
    input = PrefixString(input, prefixWith);
    input = SuffixString(input, suffixWith);
    return input;
}
/**
 * Prefix the input string with the given value  
 * @param {string} input String to modify 
 * @param {string} prefixWith String to prefix the input with (before) 
 * @returns {string} Input string prefixed with the given value
 */
export function PrefixString(input, prefixWith) {
    if (!input.startsWith(prefixWith)) { input = prefixWith + input; }
    return input;
}
/**
 * Suffix the input string with the given suffix value 
 * @param {string} input String to modify 
 * @param {string} suffixWith String to suffix the input with (after)
 * @returns {string} Input string suffixed with the given value
 */
export function SuffixString(input, suffixWith) {
    if (!input.endsWith(suffixWith)) { input = input + suffixWith; }
    return input;
}

/**
 * Returns true if the inputString both starts and ends with the searchString 
 * @param {string} inputString 
 * @param {string} searchString 
 * @returns 
 */
export function StartsAndEndsWith(inputString, searchString) {
    return inputString.startsWith(searchString) && inputString.endsWith(searchString);
}

/**
 * Returns true if input string is null, empty, or whitespace
 * @param {string} inputString String to check  
 * @returns {boolean} True if string is null, empty, or whitespace
 */
export function IsNullOrEmptyOrWhitespace(inputString) {
    return inputString === null || inputString.match(/^ *$/) !== null;
}

/**
 * Prevents modification of a KeyboardEvent's {@link KeyboardEvent.key Key} property's letters/numbers by pressing the Shift key
 * @example If the key provided is '@', returns '2'.
 * @param {KeyboardEvent} keyEvent {@link KeyboardEvent} to modify 
 * @param {boolean} [forceCase=true] Should alpha keys be forced to a specific case? Default true
 * @param {boolean} [lowerCase=true] If forced, should alpha keys be lower case? Default true
 * @returns {KeyboardEvent} KeyboardEvent with its Key property modified as needed
 */
export function PreventKeyboardEventShiftKeyModification(keyEvent, forceCase = true, lowerCase = true) {
    if (!IsCharShiftModifiable(keyEvent.key)) { return keyEvent; }
    let newKey = RemoveShiftModificationFromKey(keyEvent.key, forceCase, lowerCase);
    if (newKey == keyEvent.key) { return keyEvent; }
    return new KeyboardEvent(keyEvent.type, Object.assign({}, keyEvent, { key: newKey }));
}
/**
 * Removes modification to letters/numbers by pressing the Shift key
 * @example If the key provided is '@', returns '2'.
 * @param {string} key Specific key to modify (in string format)
 * @param {boolean} [forceCase=true] Should alpha keys be forced to a specific case? Default true
 * @param {boolean} [lowerCase=true] If forced, should alpha keys be lower case? Default true
 * @returns {string} Key string, modified as needed
 */
function RemoveShiftModificationFromKey(key, forceCase = true, lowerCase = true) {
    switch (key) {
        // convert shift+number to number
        case '!': return '1';
        case '@': return '2';
        case '#': return '3';
        case '$': return '4';
        case '%': return '5';
        case '^': return '6';
        case '&': return '7';
        case '*': return '8';
        case '(': return '9';
        case ')': return '0';
        // non-numeric, check for case modification 
        default: return forceCase ? lowerCase ? key.toLowerCase() : key.toUpperCase() : key;
    }
}

export function IsCharShiftModifiable(char) {
    // must be one char
    if (!IsStringChar(char)) return false;
    // must be shift+number key punctuation OR alphabetical
    return (IsStringAlpha(char) || IsStringShiftNumeric(char));
}

/**
 * Checks to see if the given string is only one character long, and is alphanumeric (a-z, A-Z, 0-9)
 * @param {string} char String to check
 * @returns {boolean} True if the string is only one character long and is alphanumeric
 */
export function IsCharAlphaNumeric(char) {
    return IsStringChar(char) && (IsStringAlpha(char) || IsStringNumeric(char));
}

/**
 * Checks if the given string is exactly one character long
 * @param {string} str string to check
 * @returns {boolean} True if length == 1
 */
function IsStringChar(str) {
    return str.length == 1;
}

/**
 * Checks to see if the given string is only one character long, and is alphanumeric (a-z, A-Z, 0-9)
 * @param {string} str String to check
 * @returns {boolean} True if the string is only one character long and is alphanumeric
 */
function IsStringAlpha(str) {
    if (str.length != 1) return false;
    return /^[A-Za-z]*$/.test(str);
}

/**
 * Checks to see if the given string is only one character long, and is alphanumeric (a-z, A-Z, 0-9)
 * @param {string} str String to check
 * @returns {boolean} True if the string is only one character long and is alphanumeric
 */
function IsStringNumeric(str) {
    if (str.length != 1) return false;
    return /^[0-9]*$/.test(str);
}

/**
 * Is the given string one of the Shift+NumberKey punctuation results? !@#$%^&*()
 * @param str String to check
 * @returns True if 
 */
function IsStringShiftNumeric(str) {
    return /[!@#$%^&*()]/.test(str);
}