import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { ElectroluxDevicesPlatform } from '../../../platform';
import { Appliance } from '../../../definitions/appliance';
import { ElectroluxAccessoryController } from '../../controller';
import { ApplianceItem } from '../../../definitions/appliances';
import { ApplianceState } from '../../../definitions/applianceState';
export declare class AirPurifier extends ElectroluxAccessoryController {
    readonly _platform: ElectroluxDevicesPlatform;
    readonly _accessory: PlatformAccessory<ElectroluxAccessoryController>;
    readonly _item: ApplianceItem;
    readonly _state: ApplianceState;
    readonly _appliance: Appliance;
    private airPurifierService;
    private particleFilterService?;
    constructor(_platform: ElectroluxDevicesPlatform, _accessory: PlatformAccessory<ElectroluxAccessoryController>, _item: ApplianceItem, _state: ApplianceState, _appliance: Appliance);
    getActive(): Promise<CharacteristicValue>;
    setActive(value: CharacteristicValue): Promise<void>;
    getCurrentAirPurifierState(): Promise<CharacteristicValue>;
    getTargetAirPurifierState(): Promise<CharacteristicValue>;
    setTargetAirPurifierState(value: CharacteristicValue): Promise<void>;
    getLockPhysicalControls(): Promise<CharacteristicValue>;
    setLockPhysicalControls(value: CharacteristicValue): Promise<void>;
    getRotationSpeed(): Promise<CharacteristicValue>;
    setRotationSpeed(value: CharacteristicValue): Promise<void>;
    getParticleFilterChangeIndication(): Promise<CharacteristicValue>;
    getParticleFilterLifeLevel(): Promise<CharacteristicValue>;
    update(state: ApplianceState): Promise<void>;
}
//# sourceMappingURL=airPurifier.d.ts.map