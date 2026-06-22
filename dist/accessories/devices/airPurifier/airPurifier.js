"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirPurifier = void 0;
const controller_1 = require("../../controller");
const filters_1 = require("../../../util/filters");
class AirPurifier extends controller_1.ElectroluxAccessoryController {
    constructor(_platform, _accessory, _item, _state, _appliance) {
        super(_platform, _accessory, _item, _state, _appliance);
        this._platform = _platform;
        this._accessory = _accessory;
        this._item = _item;
        this._state = _state;
        this._appliance = _appliance;
        this.accessory
            .getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Electrolux')
            .setCharacteristic(this.platform.Characteristic.Model, this.appliance.applianceInfo.model)
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.item.applianceId);
        this.airPurifierService =
            this.accessory.getService(this.platform.Service.AirPurifier) ||
                this.accessory.addService(this.platform.Service.AirPurifier);
        this.airPurifierService.setCharacteristic(this.platform.Characteristic.Name, this.item.applianceName);
        this.airPurifierService
            .getCharacteristic(this.platform.Characteristic.Active)
            .onGet(this.getCharacteristicValueGuard(this.getActive.bind(this)))
            .onSet(this.setCharacteristicValueGuard(this.setActive.bind(this)));
        this.airPurifierService
            .getCharacteristic(this.platform.Characteristic.CurrentAirPurifierState)
            .onGet(this.getCharacteristicValueGuard(this.getCurrentAirPurifierState.bind(this)));
        this.airPurifierService
            .getCharacteristic(this.platform.Characteristic.TargetAirPurifierState)
            .onGet(this.getCharacteristicValueGuard(this.getTargetAirPurifierState.bind(this)))
            .onSet(this.setCharacteristicValueGuard(this.setTargetAirPurifierState.bind(this)));
        this.airPurifierService
            .getCharacteristic(this.platform.Characteristic.LockPhysicalControls)
            .onGet(this.getCharacteristicValueGuard(this.getLockPhysicalControls.bind(this)))
            .onSet(this.setCharacteristicValueGuard(this.setLockPhysicalControls.bind(this)));
        this.airPurifierService
            .getCharacteristic(this.platform.Characteristic.RotationSpeed)
            .setProps({
            minValue: 0,
            maxValue: 5,
            minStep: 1
        })
            .onGet(this.getCharacteristicValueGuard(this.getRotationSpeed.bind(this)))
            .onSet(this.setCharacteristicValueGuard(this.setRotationSpeed.bind(this)));
        if ((0, filters_1.isParticleFilter)(this.state.properties.reported.FilterType_1) ||
            (0, filters_1.isParticleFilter)(this.state.properties.reported.FilterType_2)) {
            this.particleFilterService =
                this.accessory.getService(this.platform.Service.FilterMaintenance) ||
                    this.accessory.addService(this.platform.Service.FilterMaintenance);
            this.particleFilterService
                .getCharacteristic(this.platform.Characteristic.FilterChangeIndication)
                .onGet(this.getCharacteristicValueGuard(this.getParticleFilterChangeIndication.bind(this)));
            this.particleFilterService
                .getCharacteristic(this.platform.Characteristic.FilterLifeLevel)
                .onGet(this.getCharacteristicValueGuard(this.getParticleFilterLifeLevel.bind(this)));
            this.particleFilterService.setCharacteristic(this.platform.Characteristic.Name, 'Particle Filter');
            this.airPurifierService.addLinkedService(this.particleFilterService);
        }
    }
    async getActive() {
        return this.state.properties.reported.Workmode === 'PowerOff'
            ? this.platform.Characteristic.Active.INACTIVE
            : this.platform.Characteristic.Active.ACTIVE;
    }
    async setActive(value) {
        if ((this.state.properties.reported.Workmode === 'PowerOff' &&
            value === this.platform.Characteristic.Active.ACTIVE) ||
            (this.state.properties.reported.Workmode !== 'PowerOff' &&
                value === this.platform.Characteristic.Active.INACTIVE)) {
            await this.sendCommand({
                Workmode: value === this.platform.Characteristic.Active.ACTIVE
                    ? 'Auto'
                    : 'PowerOff'
            });
            this.state.properties.reported.Workmode =
                value === this.platform.Characteristic.Active.ACTIVE
                    ? 'Auto'
                    : 'PowerOff';
            this.airPurifierService.updateCharacteristic(this.platform.Characteristic.TargetAirPurifierState, value === this.platform.Characteristic.Active.ACTIVE
                ? await this.getTargetAirPurifierState()
                : this.platform.Characteristic.TargetAirPurifierState.AUTO);
            this.airPurifierService.updateCharacteristic(this.platform.Characteristic.RotationSpeed, value === this.platform.Characteristic.Active.ACTIVE
                ? this.state.properties.reported.Fanspeed
                : 0);
        }
        this.airPurifierService.updateCharacteristic(this.platform.Characteristic.CurrentAirPurifierState, value === this.platform.Characteristic.Active.ACTIVE
            ? this.platform.Characteristic.CurrentAirPurifierState
                .PURIFYING_AIR
            : this.platform.Characteristic.CurrentAirPurifierState.INACTIVE);
    }
    async getCurrentAirPurifierState() {
        switch (this.state.properties.reported.Workmode) {
            case 'Manual':
                return this.platform.Characteristic.CurrentAirPurifierState
                    .PURIFYING_AIR;
            case 'Auto':
                return this.platform.Characteristic.CurrentAirPurifierState
                    .PURIFYING_AIR;
            case 'PowerOff':
                return this.platform.Characteristic.CurrentAirPurifierState
                    .INACTIVE;
        }
    }
    async getTargetAirPurifierState() {
        switch (this.state.properties.reported.Workmode) {
            case 'Manual':
                return this.platform.Characteristic.TargetAirPurifierState
                    .MANUAL;
            case 'Auto':
                return this.platform.Characteristic.TargetAirPurifierState.AUTO;
            case 'PowerOff':
                return this.platform.Characteristic.TargetAirPurifierState.AUTO;
        }
    }
    async setTargetAirPurifierState(value) {
        let workMode;
        switch (value) {
            case this.platform.Characteristic.TargetAirPurifierState.MANUAL:
                workMode = 'Manual';
                break;
            case this.platform.Characteristic.TargetAirPurifierState.AUTO:
                workMode = 'Auto';
                break;
        }
        await this.sendCommand({
            Workmode: workMode
        });
        this.state.properties.reported.Workmode = workMode;
    }
    async getLockPhysicalControls() {
        return this.state.properties.reported.SafetyLock
            ? this.platform.Characteristic.LockPhysicalControls
                .CONTROL_LOCK_ENABLED
            : this.platform.Characteristic.LockPhysicalControls
                .CONTROL_LOCK_DISABLED;
    }
    async setLockPhysicalControls(value) {
        await this.sendCommand({
            SafetyLock: value ===
                this.platform.Characteristic.LockPhysicalControls
                    .CONTROL_LOCK_ENABLED
        });
        this.state.properties.reported.SafetyLock =
            value ===
                this.platform.Characteristic.LockPhysicalControls
                    .CONTROL_LOCK_ENABLED;
    }
    async getRotationSpeed() {
        return this.state.properties.reported.Fanspeed;
    }
    async setRotationSpeed(value) {
        if (value === 0) {
            await this.sendCommand({
                Workmode: 'PowerOff'
            });
            this.state.properties.reported.Workmode = 'PowerOff';
            this.airPurifierService.updateCharacteristic(this.platform.Characteristic.CurrentAirPurifierState, this.platform.Characteristic.CurrentAirPurifierState.INACTIVE);
            this.airPurifierService.updateCharacteristic(this.platform.Characteristic.TargetAirPurifierState, this.platform.Characteristic.TargetAirPurifierState.AUTO);
            return;
        }
        else if (this.state.properties.reported.Workmode === 'Auto') {
            await this.sendCommand({
                Workmode: 'Manual'
            });
            this.state.properties.reported.Workmode = 'Manual';
            this.airPurifierService.updateCharacteristic(this.platform.Characteristic.TargetAirPurifierState, this.platform.Characteristic.TargetAirPurifierState.MANUAL);
        }
        await this.sendCommand({
            Fanspeed: value
        });
        this.state.properties.reported.Fanspeed = value;
    }
    async getParticleFilterChangeIndication() {
        const filterLife = (0, filters_1.isParticleFilter)(this.state.properties.reported.FilterType_1)
            ? this.state.properties.reported.FilterLife_1
            : this.state.properties.reported.FilterLife_2;
        return filterLife <= 10
            ? this.platform.Characteristic.FilterChangeIndication.CHANGE_FILTER
            : this.platform.Characteristic.FilterChangeIndication.FILTER_OK;
    }
    async getParticleFilterLifeLevel() {
        return (0, filters_1.isParticleFilter)(this.state.properties.reported.FilterType_1)
            ? this.state.properties.reported.FilterLife_1
            : this.state.properties.reported.FilterLife_2;
    }
    async update(state) {
        var _a, _b;
        this.state = state;
        switch (this.state.properties.reported.Workmode) {
            case 'Manual':
                this.airPurifierService.updateCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.ACTIVE);
                this.airPurifierService.updateCharacteristic(this.platform.Characteristic.CurrentAirPurifierState, this.platform.Characteristic.CurrentAirPurifierState
                    .PURIFYING_AIR);
                this.airPurifierService.updateCharacteristic(this.platform.Characteristic.TargetAirPurifierState, this.platform.Characteristic.TargetAirPurifierState.MANUAL);
                break;
            case 'Auto':
                this.airPurifierService.updateCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.ACTIVE);
                this.airPurifierService.updateCharacteristic(this.platform.Characteristic.CurrentAirPurifierState, this.platform.Characteristic.CurrentAirPurifierState
                    .PURIFYING_AIR);
                this.airPurifierService.updateCharacteristic(this.platform.Characteristic.TargetAirPurifierState, this.platform.Characteristic.TargetAirPurifierState.AUTO);
                break;
            case 'PowerOff':
                this.airPurifierService.updateCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.INACTIVE);
                this.airPurifierService.updateCharacteristic(this.platform.Characteristic.CurrentAirPurifierState, this.platform.Characteristic.CurrentAirPurifierState
                    .INACTIVE);
                this.airPurifierService.updateCharacteristic(this.platform.Characteristic.TargetAirPurifierState, this.platform.Characteristic.TargetAirPurifierState.AUTO);
                break;
        }
        this.airPurifierService.updateCharacteristic(this.platform.Characteristic.LockPhysicalControls, this.state.properties.reported.SafetyLock
            ? this.platform.Characteristic.LockPhysicalControls
                .CONTROL_LOCK_ENABLED
            : this.platform.Characteristic.LockPhysicalControls
                .CONTROL_LOCK_DISABLED);
        this.airPurifierService.updateCharacteristic(this.platform.Characteristic.RotationSpeed, this.state.properties.reported.Fanspeed);
        const filterLife = (0, filters_1.isParticleFilter)(this.state.properties.reported.FilterType_1)
            ? this.state.properties.reported.FilterLife_1
            : this.state.properties.reported.FilterLife_2;
        (_a = this.particleFilterService) === null || _a === void 0 ? void 0 : _a.updateCharacteristic(this.platform.Characteristic.FilterChangeIndication, filterLife <= 10
            ? this.platform.Characteristic.FilterChangeIndication
                .CHANGE_FILTER
            : this.platform.Characteristic.FilterChangeIndication.FILTER_OK);
        (_b = this.particleFilterService) === null || _b === void 0 ? void 0 : _b.updateCharacteristic(this.platform.Characteristic.FilterLifeLevel, filterLife);
    }
}
exports.AirPurifier = AirPurifier;
//# sourceMappingURL=airPurifier.js.map