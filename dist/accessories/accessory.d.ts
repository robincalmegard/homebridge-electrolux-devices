import { PlatformAccessory } from 'homebridge';
import { ElectroluxAccessoryController } from './controller';
import { Context } from '../definitions/context';
export declare class ElectroluxAccessory {
    readonly platformAccessory: PlatformAccessory<Context>;
    controller?: ElectroluxAccessoryController;
    constructor(platformAccessory: PlatformAccessory<Context>, controller?: ElectroluxAccessoryController);
}
//# sourceMappingURL=accessory.d.ts.map