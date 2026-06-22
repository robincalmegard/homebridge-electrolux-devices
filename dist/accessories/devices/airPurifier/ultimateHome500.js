"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UltimateHome500 = void 0;
const airPurifier_1 = require("./airPurifier");
class UltimateHome500 extends airPurifier_1.AirPurifier {
    constructor(_platform, _accessory, _item, _state, _appliance) {
        super(_platform, _accessory, _item, _state, _appliance);
        this._platform = _platform;
        this._accessory = _accessory;
        this._item = _item;
        this._state = _state;
        this._appliance = _appliance;
        this.uvLightService =
            this.accessory.getService(this.platform.Service.Lightbulb) ||
                this.accessory.addService(this.platform.Service.Lightbulb);
        this.uvLightService.setCharacteristic(this.platform.Characteristic.Name, 'UV Light');
        this.uvLightService
            .getCharacteristic(this.platform.Characteristic.On)
            .onGet(this.getCharacteristicValueGuard(this.getUVLight.bind(this)))
            .onSet(this.setCharacteristicValueGuard(this.setUVLight.bind(this)));
        this.airQualityService =
            this.accessory.getService(this.platform.Service.AirQualitySensor) ||
                this.accessory.addService(this.platform.Service.AirQualitySensor);
        this.airQualityService
            .getCharacteristic(this.platform.Characteristic.AirQuality)
            .onGet(this.getCharacteristicValueGuard(this.getAirQuality.bind(this)));
        this.airQualityService
            .getCharacteristic(this.platform.Characteristic.PM2_5Density)
            .onGet(this.getCharacteristicValueGuard(this.getPM2_5Density.bind(this)));
    }
    async getUVLight() {
        return this.state.properties.reported.UVState === 'on';
    }
    async setUVLight(value) {
        await this.sendCommand({
            UVState: value ? 'On' : 'Off'
        });
        this.state.properties.reported.UVState = value ? 'on' : 'off';
    }
    async getAirQuality() {
        if (this.state.properties.reported.PM2_5_approximate <= 25) {
            return this.platform.Characteristic.AirQuality.EXCELLENT;
        }
        else if (this.state.properties.reported.PM2_5_approximate <= 50) {
            return this.platform.Characteristic.AirQuality.GOOD;
        }
        else if (this.state.properties.reported.PM2_5_approximate <= 75) {
            return this.platform.Characteristic.AirQuality.FAIR;
        }
        else if (this.state.properties.reported.PM2_5_approximate <= 100) {
            return this.platform.Characteristic.AirQuality.INFERIOR;
        }
        else {
            return this.platform.Characteristic.AirQuality.POOR;
        }
    }
    async getPM2_5Density() {
        return this.state.properties.reported.PM2_5_approximate;
    }
    async update(state) {
        super.update(state);
    }
}
exports.UltimateHome500 = UltimateHome500;
//# sourceMappingURL=ultimateHome500.js.map