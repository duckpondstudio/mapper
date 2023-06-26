import { MapData } from "./classes/mapdata";


/**
 * draw dots across mapdata, show land/water on each dot 
 * @param {MapData} mapData mapdata to draw onto 
 * @param {number} [rows=30] number of rows of dots
 * @param {number} [cols=60] number of columns of dots 
 */
export function DrawLandWaterDots(mapData, rows = 5, cols = 10) {
    if (rows <= 0 || cols <= 0) {
        console.warn("can't render land/water dots with no rows/cols");
        return;
    }
    setTimeout(() => {
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let x = i / (cols - 1);
                let y = j / (rows - 1);
                mapData.AddDotNormalized(x, y, 'test');
            }
            console.log((i + 1) + '/' + cols);
        }
    }, 0);
}

export function DrawNormalizedDots(mapData, multiple = false) {
    if (!multiple) { 
        mapData.AddDotNormalized(0.5, 0.5, 'test');
        return;
    }
    for (let i = 0; i < 3; i++) {
        let x = 0;
        switch (i) {
            case 0: x = 0.1; break;
            case 1: x = 0.5; break;
            case 2: x = 0.9; break;
        }
        for (let j = 0; j < 3; j++) {
            let y = 0;
            switch (j) {
                case 0: y = 0.1; break;
                case 1: y = 0.5; break;
                case 2: y = 0.9; break;
            }
            mapData.AddDotNormalized(x, y, 'test');
        }
    }
}