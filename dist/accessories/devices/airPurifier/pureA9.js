"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PureA9 = void 0;
const airPurifier_1 = require("./airPurifier");
const voc_1 = require("../../../util/voc");
class PureA9 extends airPurifier_1.AirPurifier {
    constructor(_platform, _accessory, _item, _state, _appliance) {
        super(_platform, _accessory, _item, _state, _appliance);
        this._platform = _platform;
        this._accessory = _accessory;
        this._item = _item;
        this._state = _state;
        this._appliance = _appliance;
        this.ionizerService =
            this.accessory.getService(this.platform.Service.Switch) ||
                this.accessory.addService(this.platform.Service.Switch);
        this.ionizerService.setCharacteristic(this.platform.Characteristic.Name, 'Ionizer');
        this.ionizerService
            .getCharacteristic(this.platform.Characteristic.On)
            .onGet(this.getCharacteristicValueGuard(this.getIonizer.bind(this)))
            .onSet(this.setCharacteristicValueGuard(this.setIonizer.bind(this)));
        this.airQualityService =
            this.accessory.getService(this.platform.Service.AirQualitySensor) ||
                this.accessory.addService(this.platform.Service.AirQualitySensor);
        this.airQualityService
            .getCharacteristic(this.platform.Characteristic.AirQuality)
            .onGet(this.getCharacteristicValueGuard(this.getAirQuality.bind(this)));
        this.airQualityService
            .getCharacteristic(this.platform.Characteristic.PM2_5Density)
            .onGet(this.getCharacteristicValueGuard(this.getPM2_5Density.bind(this)));
        this.airQualityService
            .getCharacteristic(this.platform.Characteristic.PM10Density)
            .onGet(this.getCharacteristicValueGuard(this.getPM10Density.bind(this)));
        this.airQualityService
            .getCharacteristic(this.platform.Characteristic.VOCDensity)
            .onGet(this.getCharacteristicValueGuard(this.getVOCDensity.bind(this)));
        this.humiditySensorService =
            this.accessory.getService(this.platform.Service.HumiditySensor) ||
                this.accessory.addService(this.platform.Service.HumiditySensor);
        this.humiditySensorService
            .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
            .onGet(this.getCharacteristicValueGuard(this.getCurrentRelativeHumidity.bind(this)));
        this.temperatureSensorService =
            this.accessory.getService(this.platform.Service.TemperatureSensor) ||
                this.accessory.addService(this.platform.Service.TemperatureSensor);
        this.temperatureSensorService
            .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .onGet(this.getCharacteristicValueGuard(this.getCurrentTemperature.bind(this)));
        this.carbonDioxideSensorService =
            this.accessory.getService(this.platform.Service.CarbonDioxideSensor) ||
                this.accessory.addService(this.platform.Service.CarbonDioxideSensor);
        this.carbonDioxideSensorService
            .getCharacteristic(this.platform.Characteristic.CarbonDioxideDetected)
            .onGet(this.getCharacteristicValueGuard(this.getCarbonDioxideDetected.bind(this)));
        this.carbonDioxideSensorService
            .getCharacteristic(this.platform.Characteristic.CarbonDioxideLevel)
            .onGet(this.getCharacteristicValueGuard(this.getCarbonDioxideLevel.bind(this)));
    }
    async getIonizer() {
        return this.state.properties.reported.Ionizer;
    }
    async setIonizer(value) {
        await this.sendCommand({
            Ionizer: value
        });
        this.state.properties.reported.Ionizer = value;
    }
    async getAirQuality() {
        if (this.state.properties.reported.PM2_5 <= 25) {
            return this.platform.Characteristic.AirQuality.EXCELLENT;
        }
        else if (this.state.properties.reported.PM2_5 <= 50) {
            return this.platform.Characteristic.AirQuality.GOOD;
        }
        else if (this.state.properties.reported.PM2_5 <= 75) {
            return this.platform.Characteristic.AirQuality.FAIR;
        }
        else if (this.state.properties.reported.PM2_5 <= 100) {
            return this.platform.Characteristic.AirQuality.INFERIOR;
        }
        else {
            return this.platform.Characteristic.AirQuality.POOR;
        }
    }
    async getPM2_5Density() {
        return this.state.properties.reported.PM2_5;
    }
    async getPM10Density() {
        return this.state.properties.reported.PM10;
    }
    async getVOCDensity() {
        var _a;
        const vocDensity = (0, voc_1.tvocPPBToVocDensity)(this.state.properties.reported.TVOC, this.state.properties.reported.Temp, (_a = this._platform.config.vocMolecularWeight) !== null && _a !== void 0 ? _a : 30.026);
        return Math.min(vocDensity, this.airQualityService.getCharacteristic(this.platform.Characteristic.VOCDensity).props.maxValue);
    }
    async getCurrentRelativeHumidity() {
        return this.state.properties.reported.Humidity;
    }
    async getCurrentTemperature() {
        return this.state.properties.reported.Temp;
    }
    async getCarbonDioxideDetected() {
        return this.state.properties.reported.ECO2 >
            this.platform.config.carbonDioxideSensorAlarmValue
            ? this.platform.Characteristic.CarbonDioxideDetected
                .CO2_LEVELS_ABNORMAL
            : this.platform.Characteristic.CarbonDioxideDetected
                .CO2_LEVELS_NORMAL;
    }
    async getCarbonDioxideLevel() {
        return this.state.properties.reported.ECO2;
    }
    async update(state) {
        super.update(state);
        this.ionizerService.updateCharacteristic(this.platform.Characteristic.On, this.state.properties.reported.Ionizer ? 1 : 0);
        this.airQualityService.updateCharacteristic(this.platform.Characteristic.AirQuality, await this.getAirQuality());
        this.airQualityService.updateCharacteristic(this.platform.Characteristic.PM2_5Density, this.state.properties.reported.PM2_5);
        this.airQualityService.updateCharacteristic(this.platform.Characteristic.PM10Density, this.state.properties.reported.PM10);
        this.airQualityService.updateCharacteristic(this.platform.Characteristic.VOCDensity, await this.getVOCDensity());
        this.humiditySensorService.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, this.state.properties.reported.Humidity);
        this.temperatureSensorService.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, this.state.properties.reported.Temp);
        this.carbonDioxideSensorService.updateCharacteristic(this.platform.Characteristic.CarbonDioxideDetected, this.state.properties.reported.CO2 >
            this.platform.config.carbonDioxideSensorAlarmValue
            ? this.platform.Characteristic.CarbonDioxideDetected
                .CO2_LEVELS_ABNORMAL
            : this.platform.Characteristic.CarbonDioxideDetected
                .CO2_LEVELS_NORMAL);
        this.carbonDioxideSensorService.updateCharacteristic(this.platform.Characteristic.CarbonDioxideLevel, this.state.properties.reported.CO2);
    }
}
exports.PureA9 = PureA9;
//# sourceMappingURL=pureA9.js.map