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
                mapData.AddDotXYLocal(x, y);
            }
            console.log((i + 1) + '/' + cols);
        }
    }, 0);
}