import { ApplianceItem } from '../definitions/appliances';
import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { ElectroluxDevicesPlatform } from '../platform';
import { Appliance } from '../definitions/appliance';
import { ApplianceState } from '../definitions/applianceState';
export declare abstract class ElectroluxAccessoryController {
    readonly _platform: ElectroluxDevicesPlatform;
    readonly _accessory: PlatformAccessory;
    readonly _item: ApplianceItem;
    readonly _state: ApplianceState;
    readonly _appliance: Appliance;
    platform: ElectroluxDevicesPlatform;
    accessory: PlatformAccessory;
    item: ApplianceItem;
    state: ApplianceState;
    appliance: Appliance;
    constructor(_platform: ElectroluxDevicesPlatform, _accessory: PlatformAccessory, _item: ApplianceItem, _state: ApplianceState, _appliance: Appliance);
    sendCommand(body: Record<string, CharacteristicValue>): Promise<void>;
    getCharacteristicValueGuard(getter: () => Promise<CharacteristicValue>): () => Promise<CharacteristicValue>;
    setCharacteristicValueGuard(setter: (value: CharacteristicValue) => Promise<void>): (value: CharacteristicValue) => Promise<void>;
    abstract update(state: ApplianceState): void;
}
//# sourceMappingURL=controller.d.ts.map