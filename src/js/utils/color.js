class GradientColorInfo {
    color;
    value;
    constructor (color = 0x00C000, value = -1) {
        this.color = color;
        this.value = value;
    }
}

function rgbFromHex(hex) {
    const r = (hex >> 16) & 0xFF;
    const g = (hex >> 8) & 0xFF;
    const b = hex & 0xFF;
    return `rgb(${r}, ${g}, ${b})`;
}

function GenerateGradient(...colors) {
    const definedStops = colors.filter(
        colorInfo => colorInfo instanceof GradientColorInfo && colorInfo.value >= 0
    );

    const undefinedStops = colors.filter(color => !definedStops.includes(color));

    if (undefinedStops.length > 0 && definedStops.length > 0) {
        let lastDefinedValue = definedStops[0].value;
        let newStops = [...definedStops];

        for (let i = 1; i < definedStops.length; i++) {
            const currentStop = definedStops[i];
            const nextDefinedValue = currentStop.value;
            const gapSize = nextDefinedValue - lastDefinedValue;
            const step = gapSize / (undefinedStops.length + 1);

            for (let j = 1; j <= undefinedStops.length; j++) {
                const value = lastDefinedValue + step * j;
                newStops.push({ color: rgbFromHex(undefinedStops[j - 1]), value });
            }

            lastDefinedValue = nextDefinedValue;
        }

        newStops.sort((a, b) => a.value - b.value);
        definedStops.length = 0; // Clear the original array
        definedStops.push(...newStops);
    }

    const colorStopStrings = definedStops.map(stop => {
        return `${rgbFromHex(stop.color)} ${stop.value.toFixed(3)}%`;
    });

    const gradientString = `linear-gradient(to right, ${colorStopStrings.join(', ')})`;
    return gradientString;
}

export function Test() {

    // Example usage:
    let gradientString = GenerateGradient(
        new GradientColorInfo(0x000000, 0),
        "0xFF0000",
        "0x00FF00",
        new GradientColorInfo(0x0000FF, 50),
        new GradientColorInfo(0xFFFFFF, 100)
    );
    console.log(gradientString);
}