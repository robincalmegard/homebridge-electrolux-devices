"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isParticleFilter = void 0;
const applianceState_1 = require("../definitions/applianceState");
const isParticleFilter = (filterType) => filterType === applianceState_1.FilterType.ParticleFilter1 ||
    filterType === applianceState_1.FilterType.ParticleFilter2;
exports.isParticleFilter = isParticleFilter;
//# sourceMappingURL=filters.js.map