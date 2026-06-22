import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { AirPurifier } from './airPurifier';
import { ElectroluxDevicesPlatform } from '../../../platform';
import { ElectroluxAccessoryController } from '../../controller';
import { Appliance } from '../../../definitions/appliance';
import { ApplianceState } from '../../../definitions/applianceState';
import { ApplianceItem } from '../../../definitions/appliances';
export declare class PureA9 extends AirPurifier {
    readonly _platform: ElectroluxDevicesPlatform;
    readonly _accessory: PlatformAccessory<ElectroluxAccessoryController>;
    readonly _item: ApplianceItem;
    readonly _state: ApplianceState;
    readonly _appliance: Appliance;
    private ionizerService;
    private airQualityService;
    private humiditySensorService;
    private temperatureSensorService;
    private carbonDioxideSensorService;
    constructor(_platform: ElectroluxDevicesPlatform, _accessory: PlatformAccessory<ElectroluxAccessoryController>, _item: ApplianceItem, _state: ApplianceState, _appliance: Appliance);
    getIonizer(): Promise<CharacteristicValue>;
    setIonizer(value: CharacteristicValue): Promise<void>;
    getAirQuality(): Promise<CharacteristicValue>;
    getPM2_5Density(): Promise<CharacteristicValue>;
    getPM10Density(): Promise<CharacteristicValue>;
    getVOCDensity(): Promise<CharacteristicValue>;
    getCurrentRelativeHumidity(): Promise<CharacteristicValue>;
    getCurrentTemperature(): Promise<CharacteristicValue>;
    getCarbonDioxideDetected(): Promise<CharacteristicValue>;
    getCarbonDioxideLevel(): Promise<CharacteristicValue>;
    update(state: ApplianceState): Promise<void>;
}
//# sourceMappingURL=pureA9.d.ts.map