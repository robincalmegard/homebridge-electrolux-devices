export type LiveStreamConfig = {
    url: string;
    appliances: Array<{
        applianceId: string;
        properties: string[];
    }>;
};

export type LiveStreamEvent = {
    applianceId: string;
    property: string;
    value: unknown;
};
