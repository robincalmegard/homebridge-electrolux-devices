"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tvocPPBToVocDensity = void 0;
/*
    tvocPPBToVocDensity converts TVOC in parts per billion (ppb) to VOC density (μg/m^3).
    This function is based on the following formula:

    VOC density (μg/m^3) = P * MW * ppb / R * (K + T°C)

    Where:
        - P is the standard atmospheric pressure in kPa (1 atm = 101.325 kPa)
        - MW is the molecular weight of the gas in g/mol
        - ppb is the TVOC in parts per billion
        - R is the ideal gas constant
        - K is the standard temperature in Kelvin (0°C)
        - T is the provided temperature (in Celsius)

    Credits: @mafredri
*/
const tvocPPBToVocDensity = (ppb, temperature, molecularWeight) => Math.round((101.325 * molecularWeight * ppb) /
    (8.31446261815324 * (273.15 + temperature)));
exports.tvocPPBToVocDensity = tvocPPBToVocDensity;
//# sourceMappingURL=voc.js.map