import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { ElectroluxAccessory } from './accessories/accessory';
import { Appliance } from './definitions/appliance';
import { Context } from './definitions/context';
import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApplianceState } from './definitions/applianceState';
export declare class ElectroluxDevicesPlatform implements DynamicPlatformPlugin {
    readonly log: Logger;
    readonly config: PlatformConfig;
    readonly api: API;
    readonly Service: typeof Service;
    readonly Characteristic: typeof Characteristic;
    readonly accessories: ElectroluxAccessory[];
    accessToken: string | null;
    private refreshToken;
    tokenExpirationDate: number | null;
    client: AxiosInstance;
    regionalBaseUrl: string | null;
    private devicesDiscovered;
    private pollingInterval;
    private liveStream;
    constructor(log: Logger, config: PlatformConfig, api: API);
    configureAccessory(accessory: PlatformAccessory<Context>): void;
    createClient(): Promise<void>;
    authInterceptor(value: InternalAxiosRequestConfig<unknown>): InternalAxiosRequestConfig<unknown>;
    loadAuthData(): Promise<void>;
    refreshAccessToken(): Promise<void>;
    private getAppliances;
    getApplianceInfo(applianceId: string): Promise<Appliance | null>;
    getApplianceState(applianceId: string): Promise<ApplianceState | null>;
    discoverDevices(): Promise<void>;
    pollStatus(force?: boolean): Promise<void>;
    private handleLivestreamEvent;
}
//# sourceMappingURL=platform.d.ts.map