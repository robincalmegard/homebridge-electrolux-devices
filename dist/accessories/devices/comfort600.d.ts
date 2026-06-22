import { PlatformAccessory, CharacteristicValue } from 'homebridge';
import { ElectroluxDevicesPlatform } from '../../platform';
import { Appliance } from '../../definitions/appliance';
import { ElectroluxAccessoryController } from '../controller';
import { ApplianceItem } from '../../definitions/appliances';
import { ApplianceState } from '../../definitions/applianceState';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export declare class Comfort600 extends ElectroluxAccessoryController {
    readonly _platform: ElectroluxDevicesPlatform;
    readonly _accessory: PlatformAccessory<ElectroluxAccessoryController>;
    readonly _item: ApplianceItem;
    readonly _state: ApplianceState;
    readonly _appliance: Appliance;
    private service;
    constructor(_platform: ElectroluxDevicesPlatform, _accessory: PlatformAccessory<ElectroluxAccessoryController>, _item: ApplianceItem, _state: ApplianceState, _appliance: Appliance);
    private setTemperature;
    getActive(): Promise<CharacteristicValue>;
    setActive(value: CharacteristicValue): Promise<void>;
    getCurrentHeaterCoolerState(): Promise<CharacteristicValue>;
    getTargetHeaterCoolerState(): Promise<CharacteristicValue>;
    setTargetHeaterCoolerState(value: CharacteristicValue): Promise<void>;
    getCurrentTemperature(): Promise<CharacteristicValue>;
    getLockPhysicalControls(): Promise<CharacteristicValue>;
    setLockPhysicalControls(value: CharacteristicValue): Promise<void>;
    getName(): Promise<CharacteristicValue>;
    getRotationSpeed(): Promise<CharacteristicValue>;
    setRotationSpeed(value: CharacteristicValue): Promise<void>;
    getSwingMode(): Promise<CharacteristicValue>;
    setSwingMode(value: CharacteristicValue): Promise<void>;
    getCoolingThresholdTemperature(): Promise<CharacteristicValue>;
    setCoolingThresholdTemperature(value: CharacteristicValue): Promise<void>;
    getHeatingThresholdTemperature(): Promise<CharacteristicValue>;
    setHeatingThresholdTemperature(value: CharacteristicValue): Promise<void>;
    update(state: ApplianceState): void;
}
//# sourceMappingURL=comfort600.d.ts.map