export type ApplianceState = {
    applianceId: string;
    connectionState: ConnectionState;
    status: Status;
    properties: Properties;
};
type ConnectionState = 'Connected' | 'Disconnected';
type Status = 'enabled' | 'disabled';
type Properties = {
    reported: {
        applianceState: ApplianceStateValue;
        temperatureRepresentation: TemperatureRepresentation;
        sleepMode: Toggle;
        targetTemperatureC: number;
        uiLockMode: boolean;
        mode: Mode;
        fanSpeedSetting: FanSpeedSetting;
        verticalSwing: Toggle;
        filterState: State;
        ambientTemperatureC: number;
        Workmode: WorkMode;
        Fanspeed: number;
        FilterLife_1: number;
        FilterType_1: FilterType;
        FilterLife_2: number;
        FilterType_2: FilterType;
        Ionizer: boolean;
        UILight: boolean;
        SafetyLock: boolean;
        PM1: number;
        PM2_5: number;
        PM10: number;
        Temp: number;
        Humidity: number;
        TVOC: number;
        ECO2: number;
        CO2: number;
        UVState: Toggle;
        PM2_5_approximate: number;
    };
};
type ApplianceStateValue = 'running' | 'off';
type Toggle = 'on' | 'off';
type TemperatureRepresentation = 'celcius';
export type Mode = 'auto' | 'cool' | 'heat';
export type FanSpeedSetting = 'auto' | 'low' | 'middle' | 'high';
type State = 'good';
type WorkMode = 'Manual' | 'Auto' | 'PowerOff';
export declare enum FilterType {
    ParticleFilter1 = 48,
    ParticleFilter2 = 49,
    OdorFilter = 192
}
export {};
//# sourceMappingURL=applianceState.d.ts.map