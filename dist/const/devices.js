"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEVICES = void 0;
const comfort600_1 = require("../accessories/devices/comfort600");
const wellA7_1 = require("../accessories/devices/airPurifier/wellA7");
const pureA9_1 = require("../accessories/devices/airPurifier/pureA9");
const ultimateHome500_1 = require("../accessories/devices/airPurifier/ultimateHome500");
const airPurifier_1 = require("../accessories/devices/airPurifier/airPurifier");
exports.DEVICES = {
    /* Air conditioners */
    Azul: comfort600_1.Comfort600,
    /* Air purifiers */
    WELLA7: wellA7_1.WellA7,
    WELLA5: airPurifier_1.AirPurifier,
    PUREA9: pureA9_1.PureA9,
    Muju: ultimateHome500_1.UltimateHome500
};
//# sourceMappingURL=devices.js.map