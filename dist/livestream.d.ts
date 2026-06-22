import type { ElectroluxDevicesPlatform } from './platform';
import { LiveStreamEvent } from './definitions/livestream';
export declare class LiveStreamManager {
    private readonly platform;
    private readonly onEvent;
    private readonly onConnected?;
    isConnected: boolean;
    private abortController;
    private reconnectTimeout;
    private isRunning;
    private consecutiveErrors;
    constructor(platform: ElectroluxDevicesPlatform, onEvent: (event: LiveStreamEvent) => void, onConnected?: (() => void) | undefined);
    start(): void;
    stop(): void;
    private getLivestreamConfig;
    private connect;
    private streamEvents;
    private parseAndDispatch;
    private scheduleReconnect;
}
//# sourceMappingURL=livestream.d.ts.map