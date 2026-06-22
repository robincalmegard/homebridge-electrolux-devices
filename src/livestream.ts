import type { ElectroluxDevicesPlatform } from './platform';
import { LiveStreamConfig, LiveStreamEvent } from './definitions/livestream';

const BASE_RECONNECT_DELAY_MS = 10_000;
const MAX_RECONNECT_DELAY_MS = 5 * 60 * 1000;

export class LiveStreamManager {
    isConnected = false;

    private abortController: AbortController | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isRunning = false;
    private consecutiveErrors = 0;

    constructor(
        private readonly platform: ElectroluxDevicesPlatform,
        private readonly onEvent: (event: LiveStreamEvent) => void
    ) {}

    start() {
        this.isRunning = true;
        void this.connect();
    }

    stop() {
        this.isRunning = false;
        this.isConnected = false;
        this.abortController?.abort();
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    private async getLivestreamUrl(): Promise<string> {
        const response = await this.platform.client.get<LiveStreamConfig>(
            '/api/v1/configurations/livestream'
        );
        return response.data.url;
    }

    private async connect() {
        if (!this.isRunning) return;

        try {
            if (
                !this.platform.tokenExpirationDate ||
                Date.now() >= this.platform.tokenExpirationDate
            ) {
                await this.platform.refreshAccessToken();
            }

            const url = await this.getLivestreamUrl();
            await this.streamEvents(url);
        } catch (err) {
            if (!this.isRunning) return;

            this.isConnected = false;
            this.consecutiveErrors++;

            const delay = Math.min(
                BASE_RECONNECT_DELAY_MS *
                    Math.pow(2, this.consecutiveErrors - 1),
                MAX_RECONNECT_DELAY_MS
            );

            this.platform.log.warn(
                `Livestream error: ${(err as Error).message}. Reconnecting in ${Math.round(delay / 1000)}s...`
            );

            this.scheduleReconnect(delay);
        }
    }

    private async streamEvents(url: string): Promise<void> {
        this.abortController = new AbortController();

        let response: Response;
        try {
            response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${this.platform.accessToken}`,
                    'x-api-key': this.platform.config.apiKey,
                    Accept: 'text/event-stream',
                    'Cache-Control': 'no-cache',
                },
                signal: this.abortController.signal,
            });
        } catch (err) {
            if ((err as Error).name === 'AbortError') return;
            throw err;
        }

        if (!response.ok) {
            if (response.status === 401) {
                await this.platform.refreshAccessToken();
            }
            throw new Error(
                `Livestream HTTP ${response.status}: ${response.statusText}`
            );
        }

        if (!response.body) {
            throw new Error('Livestream response has no body');
        }

        this.isConnected = true;
        this.consecutiveErrors = 0;
        this.platform.log.info('Livestream connected');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                this.platform.log.debug(`Livestream chunk (${chunk.length} bytes): ${JSON.stringify(chunk)}`);
                buffer += chunk;

                // SSE events are separated by double newlines
                const parts = buffer.split('\n\n');
                buffer = parts.pop() ?? '';

                for (const part of parts) {
                    this.parseAndDispatch(part);
                }
            }
        } catch (err) {
            if ((err as Error).name === 'AbortError') return;
            throw err;
        } finally {
            reader.releaseLock();
            this.isConnected = false;
        }

        // Stream closed normally — reconnect
        this.platform.log.debug(
            'Livestream connection closed, reconnecting...'
        );
        this.scheduleReconnect(BASE_RECONNECT_DELAY_MS);
    }

    private parseAndDispatch(eventText: string) {
        let data = '';
        for (const line of eventText.split('\n')) {
            if (line.startsWith('data:')) {
                data = line.slice(5).trim();
            }
        }

        if (!data) return;

        this.platform.log.debug(`Livestream raw data: ${data}`);

        try {
            const parsed = JSON.parse(data) as LiveStreamEvent;
            if (parsed.applianceId && parsed.property !== undefined && parsed.value !== undefined) {
                this.onEvent(parsed);
            } else {
                this.platform.log.debug(`Livestream event has unrecognised shape: ${data}`);
            }
        } catch (err) {
            this.platform.log.debug(`Livestream parse error: ${(err as Error).message} — raw: ${data}`);
        }
    }

    private scheduleReconnect(delay: number) {
        if (!this.isRunning) return;
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            void this.connect();
        }, delay);
    }
}
