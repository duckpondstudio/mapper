/**
 * Global reference to document CSS
 * @type {CSSStyleDeclaration}
 */
export let css;

/** Initialize CSS references, should only run once */
export function InitializeCSS() {
    if (css != null) { return; }
    // load css reference 
    css = getComputedStyle(document.documentElement);
}
