import { GetTerm } from "../data/datanames";
import { MapData } from "../mapgen/mapdata";
import { Module, current } from '../ui/module';
import * as m from "../data/maps";
import { TestReadCSV } from "../utils/dataparser";

// Default testkey: t           ----------------- SHIFT + T + Num

/**
 * Key that must be held, along with shift, to trigger a numeric test when pressing 
 * a number key. Eg, Shift+{@link testKey [testKey]}+3 will trigger Numeric Test 3.
 * @see {@link NumericTest}
 * @see {@link ./input.js }
 */
export const testKey = 't';

/**
 * Triggers numeric test of the given value.
 * @param {Number} num Integer from 0-9 triggering the given numeric test 
 */
export function NumericTest(num) {
    console.group("Numeric Test " + num);
    switch (num) {

        case 1:
            
            TestReadCSV('continent-codes');
            
            break;

        case 2:
            break;

        case 3:
            // check datanames.GetTerms against a bunch of potential inputs 
            const terms = [
                '',
                'ioghweoh',
                'butts',
                'longitude',
                'latitude',
                'langidude',
                'contnigt',
                'town',
                'city',
                'gpt',
                'goipont',
                'COUNTRY-CITY',
                'CITY-COUNTRY',
                'CITYCOUNTRY',
                'CITYSTATE',
                'crdnt',
                'LATLONG',
                'LONGLAT',
                'citys',
                'township',
                'country',
                'co_ordinate',
                'coord-inate',
                'this sucks',
                'this rules',
            ];
            for (let i = 0; i < terms.length; i++) {
                console.log("Term:", terms[i], "result:", GetTerm(terms[i]));
            }
            break;

        case 4:
            break;

        case 5:
            break;

        case 6:
            break;

        case 7:
            break;

        case 8:
            break;

        case 9:
            break;

        case 0:
            break;

    }
    console.groupEnd("Numeric Test " + num);
}


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
                mapData.AddDotAtRatio(x, y, 'test');
            }
            console.log((i + 1) + '/' + cols);
        }
    }, 0);
}

export function DrawNormalizedDots(mapData, multiple = true) {
    if (!multiple) {
        mapData.AddDotAtRatio(0.5, 0.5, 'test');
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
            mapData.AddDotAtRatio(x, y, 'test');
        }
    }
}