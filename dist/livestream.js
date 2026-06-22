"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveStreamManager = void 0;
const BASE_RECONNECT_DELAY_MS = 10000;
const MAX_RECONNECT_DELAY_MS = 5 * 60 * 1000;
class LiveStreamManager {
    constructor(platform, onEvent) {
        this.platform = platform;
        this.onEvent = onEvent;
        this.isConnected = false;
        this.abortController = null;
        this.reconnectTimeout = null;
        this.isRunning = false;
        this.consecutiveErrors = 0;
    }
    start() {
        this.isRunning = true;
        void this.connect();
    }
    stop() {
        var _a;
        this.isRunning = false;
        this.isConnected = false;
        (_a = this.abortController) === null || _a === void 0 ? void 0 : _a.abort();
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }
    async getLivestreamUrl() {
        const response = await this.platform.client.get('/api/v1/configurations/livestream');
        return response.data.url;
    }
    async connect() {
        if (!this.isRunning)
            return;
        try {
            if (!this.platform.tokenExpirationDate ||
                Date.now() >= this.platform.tokenExpirationDate) {
                await this.platform.refreshAccessToken();
            }
            const url = await this.getLivestreamUrl();
            await this.streamEvents(url);
        }
        catch (err) {
            if (!this.isRunning)
                return;
            this.isConnected = false;
            this.consecutiveErrors++;
            const delay = Math.min(BASE_RECONNECT_DELAY_MS *
                Math.pow(2, this.consecutiveErrors - 1), MAX_RECONNECT_DELAY_MS);
            this.platform.log.warn(`Livestream error: ${err.message}. Reconnecting in ${Math.round(delay / 1000)}s...`);
            this.scheduleReconnect(delay);
        }
    }
    async streamEvents(url) {
        var _a;
        this.abortController = new AbortController();
        let response;
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
        }
        catch (err) {
            if (err.name === 'AbortError')
                return;
            throw err;
        }
        if (!response.ok) {
            if (response.status === 401) {
                await this.platform.refreshAccessToken();
            }
            throw new Error(`Livestream HTTP ${response.status}: ${response.statusText}`);
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
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                // SSE events are separated by double newlines
                const parts = buffer.split('\n\n');
                buffer = (_a = parts.pop()) !== null && _a !== void 0 ? _a : '';
                for (const part of parts) {
                    this.parseAndDispatch(part);
                }
            }
        }
        catch (err) {
            if (err.name === 'AbortError')
                return;
            throw err;
        }
        finally {
            reader.releaseLock();
            this.isConnected = false;
        }
        // Stream closed normally — reconnect
        this.platform.log.debug('Livestream connection closed, reconnecting...');
        this.scheduleReconnect(BASE_RECONNECT_DELAY_MS);
    }
    parseAndDispatch(eventText) {
        let data = '';
        for (const line of eventText.split('\n')) {
            if (line.startsWith('data:')) {
                data = line.slice(5).trim();
            }
        }
        if (!data)
            return;
        this.platform.log.debug(`Livestream raw data: ${data}`);
        try {
            const parsed = JSON.parse(data);
            if (parsed.applianceId && parsed.property !== undefined && parsed.value !== undefined) {
                this.onEvent(parsed);
            }
            else {
                this.platform.log.debug(`Livestream event has unrecognised shape: ${data}`);
            }
        }
        catch (err) {
            this.platform.log.debug(`Livestream parse error: ${err.message} — raw: ${data}`);
        }
    }
    scheduleReconnect(delay) {
        if (!this.isRunning)
            return;
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            void this.connect();
        }, delay);
    }
}
exports.LiveStreamManager = LiveStreamManager;
//# sourceMappingURL=livestream.js.map