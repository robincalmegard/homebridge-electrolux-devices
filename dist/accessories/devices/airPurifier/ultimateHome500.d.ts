import type { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { ElectroluxDevicesPlatform } from '../../../platform';
import { AirPurifier } from './airPurifier';
import { ElectroluxAccessoryController } from '../../controller';
import { Appliance } from '../../../definitions/appliance';
import { ApplianceState } from '../../../definitions/applianceState';
import { ApplianceItem } from '../../../definitions/appliances';
export declare class UltimateHome500 extends AirPurifier {
    readonly _platform: ElectroluxDevicesPlatform;
    readonly _accessory: PlatformAccessory<ElectroluxAccessoryController>;
    readonly _item: ApplianceItem;
    readonly _state: ApplianceState;
    readonly _appliance: Appliance;
    private uvLightService;
    private airQualityService;
    constructor(_platform: ElectroluxDevicesPlatform, _accessory: PlatformAccessory<ElectroluxAccessoryController>, _item: ApplianceItem, _state: ApplianceState, _appliance: Appliance);
    getUVLight(): Promise<CharacteristicValue>;
    setUVLight(value: CharacteristicValue): Promise<void>;
    getAirQuality(): Promise<CharacteristicValue>;
    getPM2_5Density(): Promise<CharacteristicValue>;
    update(state: ApplianceState): Promise<void>;
}
//# sourceMappingURL=ultimateHome500.d.ts.map