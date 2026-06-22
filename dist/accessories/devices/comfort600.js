"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comfort600 = void 0;
const lodash_1 = __importDefault(require("lodash"));
const controller_1 = require("../controller");
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
class Comfort600 extends controller_1.ElectroluxAccessoryController {
    constructor(_platform, _accessory, _item, _state, _appliance) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        super(_platform, _accessory, _item, _state, _appliance);
        this._platform = _platform;
        this._accessory = _accessory;
        this._item = _item;
        this._state = _state;
        this._appliance = _appliance;
        this.setTemperature = lodash_1.default.debounce(async (value) => {
            this.sendCommand({
                targetTemperatureC: value
            });
        }, 1000);
        this.accessory
            .getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Electrolux')
            .setCharacteristic(this.platform.Characteristic.Model, this.appliance.applianceInfo.model)
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.item.applianceId);
        this.service =
            this.accessory.getService(this.platform.Service.HeaterCooler) ||
                this.accessory.addService(this.platform.Service.HeaterCooler);
        this.service.setCharacteristic(this.platform.Characteristic.Name, this.item.applianceName);
        this.service
            .getCharacteristic(this.platform.Characteristic.Active)
            .onGet(this.getCharacteristicValueGuard(this.getActive.bind(this)))
            .onSet(this.setCharacteristicValueGuard(this.setActive.bind(this)));
        this.service
            .getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState)
            .setProps({
            validValues: [
                this.platform.Characteristic.CurrentHeaterCoolerState
                    .INACTIVE,
                this.platform.Characteristic.CurrentHeaterCoolerState.IDLE,
                this.platform.Characteristic.CurrentHeaterCoolerState
                    .COOLING,
                this.platform.Characteristic.CurrentHeaterCoolerState
                    .HEATING
            ]
        })
            .onGet(this.getCharacteristicValueGuard(this.getCurrentHeaterCoolerState.bind(this)));
        const targetHeaterCoolerStateValidValues = [
            this.appliance.capabilities.mode.values['AUTO'] !== undefined &&
                this.platform.Characteristic.TargetHeaterCoolerState.AUTO,
            this.appliance.capabilities.mode.values['COOL'] !== undefined &&
                this.platform.Characteristic.TargetHeaterCoolerState.COOL,
            this.appliance.capabilities.mode.values['HEAT'] !== undefined &&
                this.platform.Characteristic.TargetHeaterCoolerState.HEAT
        ].filter((value) => value !== false);
        this.service
            .getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
            .setProps({
            validValues: targetHeaterCoolerStateValidValues
        })
            .onGet(this.getCharacteristicValueGuard(this.getTargetHeaterCoolerState.bind(this)))
            .onSet(this.setCharacteristicValueGuard(this.setTargetHeaterCoolerState.bind(this)));
        this.service
            .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .onGet(this.getCharacteristicValueGuard(this.getCurrentTemperature.bind(this)));
        this.service
            .getCharacteristic(this.platform.Characteristic.LockPhysicalControls)
            .onGet(this.getCharacteristicValueGuard(this.getLockPhysicalControls.bind(this)))
            .onSet(this.setCharacteristicValueGuard(this.setLockPhysicalControls.bind(this)));
        this.service
            .getCharacteristic(this.platform.Characteristic.Name)
            .onGet(this.getCharacteristicValueGuard(this.getName.bind(this)));
        if (this.appliance.capabilities.fanSpeedState) {
            this.service
                .getCharacteristic(this.platform.Characteristic.RotationSpeed)
                .setProps({
                minValue: 0,
                maxValue: this.appliance.capabilities.fanSpeedState.values
                    .length,
                minStep: 1
            })
                .onGet(this.getCharacteristicValueGuard(this.getRotationSpeed.bind(this)))
                .onSet(this.setCharacteristicValueGuard(this.setRotationSpeed.bind(this)));
        }
        else {
            this.service.removeCharacteristic(this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed));
        }
        if (this.appliance.capabilities.verticalSwing) {
            this.service
                .getCharacteristic(this.platform.Characteristic.SwingMode)
                .onGet(this.getCharacteristicValueGuard(this.getSwingMode.bind(this)))
                .onSet(this.setCharacteristicValueGuard(this.setSwingMode.bind(this)));
        }
        else {
            this.service.removeCharacteristic(this.service.getCharacteristic(this.platform.Characteristic.SwingMode));
        }
        this.service
            .getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
            .setValue(this.state.properties.reported.mode === 'auto' ? (_b = (_a = this.appliance.capabilities.targetTemperatureC) === null || _a === void 0 ? void 0 : _a.max) !== null && _b !== void 0 ? _b : 32 : this.state.properties.reported.targetTemperatureC)
            .setProps({
            minValue: (_d = (_c = this.appliance.capabilities.targetTemperatureC) === null || _c === void 0 ? void 0 : _c.min) !== null && _d !== void 0 ? _d : 16,
            maxValue: (_f = (_e = this.appliance.capabilities.targetTemperatureC) === null || _e === void 0 ? void 0 : _e.max) !== null && _f !== void 0 ? _f : 32,
            minStep: (_h = (_g = this.appliance.capabilities.targetTemperatureC) === null || _g === void 0 ? void 0 : _g.step) !== null && _h !== void 0 ? _h : 1
        })
            .onGet(this.getCharacteristicValueGuard(this.getCoolingThresholdTemperature.bind(this)))
            .onSet(this.setCharacteristicValueGuard(this.setCoolingThresholdTemperature.bind(this)));
        this.service
            .getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
            .setValue(this.state.properties.reported.targetTemperatureC)
            .setProps({
            minValue: (_k = (_j = this.appliance.capabilities.targetTemperatureC) === null || _j === void 0 ? void 0 : _j.min) !== null && _k !== void 0 ? _k : 16,
            maxValue: (_m = (_l = this.appliance.capabilities.targetTemperatureC) === null || _l === void 0 ? void 0 : _l.max) !== null && _m !== void 0 ? _m : 32,
            minStep: (_p = (_o = this.appliance.capabilities.targetTemperatureC) === null || _o === void 0 ? void 0 : _o.step) !== null && _p !== void 0 ? _p : 1
        })
            .onGet(this.getCharacteristicValueGuard(this.getHeatingThresholdTemperature.bind(this)))
            .onSet(this.setCharacteristicValueGuard(this.setHeatingThresholdTemperature.bind(this)));
    }
    async getActive() {
        return this.state.properties.reported.applianceState === 'running'
            ? this.platform.Characteristic.Active.ACTIVE
            : this.platform.Characteristic.Active.INACTIVE;
    }
    async setActive(value) {
        if ((this.state.properties.reported.applianceState === 'running' &&
            value === this.platform.Characteristic.Active.ACTIVE) ||
            (this.state.properties.reported.applianceState === 'off' &&
                value === this.platform.Characteristic.Active.INACTIVE)) {
            return;
        }
        this.sendCommand({
            executeCommand: value === this.platform.Characteristic.Active.ACTIVE
                ? 'ON'
                : 'OFF'
        });
        this.state.properties.reported.applianceState =
            value === this.platform.Characteristic.Active.ACTIVE
                ? 'running'
                : 'off';
    }
    async getCurrentHeaterCoolerState() {
        var _a;
        switch (this.state.properties.reported.mode) {
            case 'cool':
                return this.platform.Characteristic.CurrentHeaterCoolerState
                    .COOLING;
            case 'heat':
                return this.platform.Characteristic.CurrentHeaterCoolerState
                    .HEATING;
            case 'auto':
                if (((_a = this.appliance.capabilities.mode) === null || _a === void 0 ? void 0 : _a.values['HEAT']) ===
                    undefined) {
                    return this.state.properties.reported.ambientTemperatureC >
                        this.state.properties.reported.targetTemperatureC
                        ? this.platform.Characteristic.CurrentHeaterCoolerState
                            .COOLING
                        : this.platform.Characteristic.CurrentHeaterCoolerState
                            .IDLE;
                }
                return this.state.properties.reported.ambientTemperatureC >
                    this.state.properties.reported.targetTemperatureC
                    ? this.platform.Characteristic.CurrentHeaterCoolerState
                        .COOLING
                    : this.platform.Characteristic.CurrentHeaterCoolerState
                        .HEATING;
        }
    }
    async getTargetHeaterCoolerState() {
        switch (this.state.properties.reported.mode) {
            case 'cool':
                return this.platform.Characteristic.TargetHeaterCoolerState
                    .COOL;
            case 'heat':
                return this.platform.Characteristic.TargetHeaterCoolerState
                    .HEAT;
            case 'auto':
                return this.platform.Characteristic.TargetHeaterCoolerState
                    .AUTO;
        }
    }
    async setTargetHeaterCoolerState(value) {
        var _a, _b;
        let mode = null;
        let currentState = null;
        switch (value) {
            case this.platform.Characteristic.TargetHeaterCoolerState.AUTO:
                mode = 'AUTO';
                currentState =
                    this.state.properties.reported.ambientTemperatureC >
                        this.state.properties.reported.targetTemperatureC
                        ? this.platform.Characteristic.CurrentHeaterCoolerState
                            .COOLING
                        : this.platform.Characteristic.CurrentHeaterCoolerState
                            .HEATING;
                break;
            case this.platform.Characteristic.TargetHeaterCoolerState.COOL:
                mode = 'COOL';
                currentState =
                    this.platform.Characteristic.CurrentHeaterCoolerState
                        .COOLING;
                break;
            case this.platform.Characteristic.TargetHeaterCoolerState.HEAT:
                mode = 'HEAT';
                currentState =
                    this.platform.Characteristic.CurrentHeaterCoolerState
                        .HEATING;
                break;
        }
        if (!mode) {
            return;
        }
        await this.sendCommand({
            mode
        });
        if (currentState) {
            this.service.updateCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState, currentState);
            switch (value) {
                case this.platform.Characteristic.TargetHeaterCoolerState.AUTO:
                    this.service.updateCharacteristic(this.platform.Characteristic
                        .CoolingThresholdTemperature, (_b = (_a = this.appliance.capabilities.targetTemperatureC) === null || _a === void 0 ? void 0 : _a.max) !== null && _b !== void 0 ? _b : 32);
                    this.service.updateCharacteristic(this.platform.Characteristic
                        .HeatingThresholdTemperature, this.state.properties.reported.targetTemperatureC);
                    break;
                case this.platform.Characteristic.TargetHeaterCoolerState.COOL:
                    this.service.updateCharacteristic(this.platform.Characteristic
                        .CoolingThresholdTemperature, this.state.properties.reported.targetTemperatureC);
                    break;
                case this.platform.Characteristic.TargetHeaterCoolerState.HEAT:
                    this.service.updateCharacteristic(this.platform.Characteristic
                        .HeatingThresholdTemperature, this.state.properties.reported.targetTemperatureC);
                    break;
            }
            this.state.properties.reported.mode = mode.toLowerCase();
        }
    }
    async getCurrentTemperature() {
        return this.state.properties.reported.ambientTemperatureC;
    }
    async getLockPhysicalControls() {
        return this.state.properties.reported.uiLockMode
            ? this.platform.Characteristic.LockPhysicalControls
                .CONTROL_LOCK_ENABLED
            : this.platform.Characteristic.LockPhysicalControls
                .CONTROL_LOCK_DISABLED;
    }
    async setLockPhysicalControls(value) {
        await this.sendCommand({
            uiLockMode: value ===
                this.platform.Characteristic.LockPhysicalControls
                    .CONTROL_LOCK_ENABLED
        });
        this.state.properties.reported.uiLockMode =
            value ===
                this.platform.Characteristic.LockPhysicalControls
                    .CONTROL_LOCK_ENABLED;
    }
    async getName() {
        return this.accessory.displayName;
    }
    async getRotationSpeed() {
        switch (this.state.properties.reported.fanSpeedSetting) {
            case 'auto':
                return 0;
            case 'low':
                return 1;
            case 'middle':
                return 2;
            case 'high':
                return 3;
        }
    }
    async setRotationSpeed(value) {
        const numberValue = value;
        let fanSpeedSetting = 'auto';
        switch (numberValue) {
            case 1:
                fanSpeedSetting = 'low';
                break;
            case 2:
                fanSpeedSetting = 'middle';
                break;
            case 3:
                fanSpeedSetting = 'high';
                break;
        }
        this.state.properties.reported.fanSpeedSetting = fanSpeedSetting;
        await this.sendCommand({
            fanSpeedSetting: fanSpeedSetting.toUpperCase()
        });
    }
    async getSwingMode() {
        return this.state.properties.reported.verticalSwing === 'on'
            ? this.platform.Characteristic.SwingMode.SWING_ENABLED
            : this.platform.Characteristic.SwingMode.SWING_DISABLED;
    }
    async setSwingMode(value) {
        await this.sendCommand({
            verticalSwing: value === this.platform.Characteristic.SwingMode.SWING_ENABLED
                ? 'ON'
                : 'OFF'
        });
        this.state.properties.reported.verticalSwing =
            value === this.platform.Characteristic.SwingMode.SWING_ENABLED
                ? 'on'
                : 'off';
    }
    async getCoolingThresholdTemperature() {
        if (this.state.properties.reported.mode === 'auto') {
            return 32;
        }
        return this.state.properties.reported.targetTemperatureC;
    }
    async setCoolingThresholdTemperature(value) {
        if (this.state.properties.reported.mode === 'auto') {
            throw new this.platform.api.hap.HapStatusError(-70410 /* this.platform.api.hap.HAPStatus.INVALID_VALUE_IN_REQUEST */);
        }
        try {
            await this.setTemperature(value);
            this.state.properties.reported.targetTemperatureC = value;
        }
        catch (err) {
            throw new this.platform.api.hap.HapStatusError(-70402 /* this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
        }
    }
    async getHeatingThresholdTemperature() {
        return this.state.properties.reported.targetTemperatureC;
    }
    async setHeatingThresholdTemperature(value) {
        try {
            await this.setTemperature(value);
            this.state.properties.reported.targetTemperatureC = value;
        }
        catch (err) {
            throw new this.platform.api.hap.HapStatusError(-70402 /* this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
        }
    }
    update(state) {
        var _a, _b;
        this.state = state;
        let currentState, targetState;
        switch (this.state.properties.reported.mode) {
            case 'cool':
                currentState =
                    this.platform.Characteristic.CurrentHeaterCoolerState
                        .COOLING;
                targetState =
                    this.platform.Characteristic.TargetHeaterCoolerState.COOL;
                break;
            case 'heat':
                currentState =
                    this.platform.Characteristic.CurrentHeaterCoolerState
                        .HEATING;
                targetState =
                    this.platform.Characteristic.TargetHeaterCoolerState.HEAT;
                break;
            default:
                currentState =
                    this.state.properties.reported.ambientTemperatureC >
                        this.state.properties.reported.targetTemperatureC
                        ? this.platform.Characteristic.CurrentHeaterCoolerState
                            .COOLING
                        : this.platform.Characteristic.CurrentHeaterCoolerState
                            .HEATING;
                targetState =
                    this.platform.Characteristic.TargetHeaterCoolerState.AUTO;
                break;
        }
        let rotationSpeed;
        switch (this.state.properties.reported.fanSpeedSetting) {
            case 'auto':
                rotationSpeed = 0;
                break;
            case 'low':
                rotationSpeed = 1;
                break;
            case 'middle':
                rotationSpeed = 2;
                break;
            case 'high':
                rotationSpeed = 3;
                break;
        }
        this.service.updateCharacteristic(this.platform.Characteristic.Active, this.state.properties.reported.applianceState === 'running'
            ? this.platform.Characteristic.Active.ACTIVE
            : this.platform.Characteristic.Active.INACTIVE);
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState, currentState);
        this.service.updateCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState, targetState);
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, this.state.properties.reported.ambientTemperatureC);
        this.service.updateCharacteristic(this.platform.Characteristic.LockPhysicalControls, this.state.properties.reported.uiLockMode
            ? this.platform.Characteristic.LockPhysicalControls
                .CONTROL_LOCK_ENABLED
            : this.platform.Characteristic.LockPhysicalControls
                .CONTROL_LOCK_DISABLED);
        this.service.updateCharacteristic(this.platform.Characteristic.RotationSpeed, rotationSpeed);
        this.service.updateCharacteristic(this.platform.Characteristic.SwingMode, this.state.properties.reported.verticalSwing === 'on'
            ? this.platform.Characteristic.SwingMode.SWING_ENABLED
            : this.platform.Characteristic.SwingMode.SWING_DISABLED);
        if (this.state.properties.reported.mode === 'auto') {
            this.service.updateCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature, (_b = (_a = this.appliance.capabilities.targetTemperatureC) === null || _a === void 0 ? void 0 : _a.max) !== null && _b !== void 0 ? _b : 32);
            this.service.updateCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature, this.state.properties.reported.targetTemperatureC);
        }
        else {
            this.service.updateCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature, this.state.properties.reported.targetTemperatureC);
            this.service.updateCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature, this.state.properties.reported.targetTemperatureC);
        }
    }
}
exports.Comfort600 = Comfort600;
//# sourceMappingURL=comfort600.js.map