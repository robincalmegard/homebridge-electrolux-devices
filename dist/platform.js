"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectroluxDevicesPlatform = void 0;
const settings_1 = require("./settings");
const devices_1 = require("./const/devices");
const accessory_1 = require("./accessories/accessory");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("./const/url");
const axios_1 = __importStar(require("axios"));
const livestream_1 = require("./livestream");
/*
    HomebridgePlatform
    This class is the main constructor for your plugin, this is where you should
    parse the user config and discover/register accessories with Homebridge.
*/
class ElectroluxDevicesPlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        this.accessories = [];
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpirationDate = null;
        this.regionalBaseUrl = null;
        this.devicesDiscovered = false;
        this.pollingInterval = null;
        this.liveStream = null;
        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        this.api.on('didFinishLaunching', async () => {
            try {
                await this.createClient();
                await this.loadAuthData();
                // run the method to discover / register your devices as accessories
                await this.discoverDevices();
            }
            catch (err) {
                this.log.warn(err.message);
            }
            finally {
                if (this.config.pollingInterval &&
                    this.config.pollingInterval < 120) {
                    this.log.warn('Polling interval is less than 120 seconds. This could lead to issues with the Electrolux API rate limiting. Please consider increasing the polling interval.');
                }
                this.pollingInterval = setInterval(this.pollStatus.bind(this), (this.config.pollingInterval || 120) * 1000);
            }
        });
        this.api.on('shutdown', async () => {
            var _a;
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
            }
            (_a = this.liveStream) === null || _a === void 0 ? void 0 : _a.stop();
        });
    }
    /*
        This function is invoked when homebridge restores cached accessories from disk at startup.
        It should be used to setup event handlers for characteristics and update respective values.
    */
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        // add the restored accessory to the accessories cache so we can track if it has already been registered
        this.accessories.push(new accessory_1.ElectroluxAccessory(accessory));
    }
    async createClient() {
        if (!this.config.apiKey) {
            throw new Error('Please make sure the plugin is configured properly. Check https://github.com/tomekkleszcz/homebridge-electrolux-devices?tab=readme-ov-file#-installation for more information.');
        }
        this.client = axios_1.default.create({
            baseURL: url_1.API_URL,
            headers: {
                Accept: 'application/json',
                'Accept-Charset': 'utf-8',
                'x-api-key': this.config.apiKey
            }
        });
        this.client.interceptors.request.use(this.authInterceptor.bind(this));
    }
    authInterceptor(value) {
        if (value.url === '/api/v1/token/refresh') {
            return value;
        }
        if (this.accessToken) {
            value.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return value;
    }
    async loadAuthData() {
        var _a;
        const storagePath = path_1.default.format({
            dir: this.api.user.storagePath(),
            base: 'homebridge_electrolux_device_persist.json'
        });
        /* Check if the file exists. */
        const exists = fs_1.default.existsSync(storagePath);
        /* If the file does not exist, get the refresh token from the config to get a new access token. */
        if (!exists) {
            this.refreshToken = this.config.refreshToken;
            if (!this.refreshToken) {
                throw new Error('Please make sure the plugin is configured properly. Check https://github.com/tomekkleszcz/homebridge-electrolux-devices?tab=readme-ov-file#-installation for more information.');
            }
            try {
                await this.refreshAccessToken();
            }
            catch (err) {
                if (err instanceof axios_1.AxiosError) {
                    const axiosError = err;
                    if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                        throw new Error('Invalid refresh token! Please configure the plugin again using this guide: https://github.com/tomekkleszcz/homebridge-electrolux-devices?tab=readme-ov-file#-installation');
                    }
                }
            }
            return;
        }
        /* Read the file and parse the JSON. */
        const json = fs_1.default.readFileSync(storagePath, 'utf8');
        try {
            const data = JSON.parse(json);
            /* If the file version is not 1, get the refresh token from the config to get a new access token. */
            if (data.version !== 1) {
                this.refreshToken = this.config.refreshToken;
                if (!this.refreshToken) {
                    throw new Error('Please make sure the plugin is configured properly. Check https://github.com/tomekkleszcz/homebridge-electrolux-devices?tab=readme-ov-file#-installation for more information.');
                }
                await this.refreshAccessToken();
                return;
            }
            /* Set the auth data from the file. */
            this.accessToken = data.accessToken;
            this.refreshToken = data.refreshToken;
            this.tokenExpirationDate = data.tokenExpirationDate;
            if (!this.tokenExpirationDate ||
                Date.now() >= this.tokenExpirationDate) {
                await this.refreshAccessToken();
            }
        }
        catch (_b) {
            fs_1.default.unlinkSync(storagePath);
            throw new Error('Malformed auth data file! Please configure the plugin again using this guide: https://github.com/tomekkleszcz/homebridge-electrolux-devices?tab=readme-ov-file#-installation');
        }
    }
    async refreshAccessToken() {
        if (!this.refreshToken) {
            return;
        }
        this.log.info('Refreshing access token...');
        const response = await this.client.post('/api/v1/token/refresh', {
            refreshToken: this.refreshToken
        });
        this.accessToken = response.data.accessToken;
        this.refreshToken = response.data.refreshToken;
        this.tokenExpirationDate = Date.now() + response.data.expiresIn * 1000;
        this.log.info('Access token refreshed!');
        const json = JSON.stringify({
            version: 1,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            tokenExpirationDate: this.tokenExpirationDate
        });
        const storagePath = path_1.default.format({
            dir: this.api.user.storagePath(),
            base: 'homebridge_electrolux_device_persist.json'
        });
        fs_1.default.writeFile(storagePath, json, 'utf8', (err) => {
            if (err) {
                this.log.error('An error occurred while saving auth data: ', err.message);
            }
        });
    }
    async getAppliances() {
        const response = await this.client.get('/api/v1/appliances');
        return response.data;
    }
    async getApplianceInfo(applianceId) {
        try {
            const response = await this.client.get(`/api/v1/appliances/${applianceId}/info`);
            return response.data;
        }
        catch (_a) {
            return null;
        }
    }
    async getApplianceState(applianceId) {
        try {
            const response = await this.client.get(`/api/v1/appliances/${applianceId}/state`);
            return response.data;
        }
        catch (_a) {
            return null;
        }
    }
    /*
        Get the appliances from the Electrolux API and register each appliance as an accessory.
    */
    async discoverDevices() {
        if (!this.accessToken) {
            return;
        }
        this.log.info('Discovering devices...');
        const appliances = await this.getAppliances();
        appliances.map(async (applianceItem) => {
            if (!devices_1.DEVICES[applianceItem.applianceType]) {
                this.log.warn('Accessory not found for model:', applianceItem.applianceType);
                const applianceInfo = await this.getApplianceInfo(applianceItem.applianceId);
                const deviceData = {
                    appliance: {
                        type: applianceItem.applianceType,
                        deviceType: applianceInfo === null || applianceInfo === void 0 ? void 0 : applianceInfo.applianceInfo.deviceType,
                        model: applianceInfo === null || applianceInfo === void 0 ? void 0 : applianceInfo.applianceInfo.model,
                        variant: applianceInfo === null || applianceInfo === void 0 ? void 0 : applianceInfo.applianceInfo.variant,
                        colour: applianceInfo === null || applianceInfo === void 0 ? void 0 : applianceInfo.applianceInfo.colour
                    },
                    capabilities: applianceInfo === null || applianceInfo === void 0 ? void 0 : applianceInfo.capabilities
                };
                this.log.warn('It looks like this appliance is not supported by the plugin. Please create a new issue here: https://github.com/tomekkleszcz/homebridge-electrolux-devices/issues and include the log below in the description.');
                this.log.warn(JSON.stringify(deviceData));
                return;
            }
            const state = await this.getApplianceState(applianceItem.applianceId);
            if (!state) {
                this.log.warn('State not found for appliance:', applianceItem.applianceId);
                return;
            }
            const uuid = this.api.hap.uuid.generate(applianceItem.applianceId);
            const existingAccessory = this.accessories.find((accessory) => accessory.platformAccessory.UUID === uuid);
            /*
                Get the capabilities of the appliance from the context.
                If the capabilities are not in the context, fetch them from the API.
                If the capabilities equals null, that means the appliance capabilities is not supported.
            */
            const appliance = (existingAccessory === null || existingAccessory === void 0 ? void 0 : existingAccessory.platformAccessory.context.appliance) !==
                undefined
                ? existingAccessory.platformAccessory.context.appliance
                : await this.getApplianceInfo(applianceItem.applianceId);
            if (existingAccessory) {
                this.log.info('Restoring existing accessory from cache:', existingAccessory.platformAccessory.displayName);
                existingAccessory.controller = new devices_1.DEVICES[applianceItem.applianceType](this, existingAccessory.platformAccessory, applianceItem, state, appliance);
                return;
            }
            this.log.info('Adding new accessory:', applianceItem.applianceName);
            const platformAccessory = new this.api.platformAccessory(applianceItem.applianceName, uuid);
            const accessory = new accessory_1.ElectroluxAccessory(platformAccessory, new devices_1.DEVICES[applianceItem.applianceType](this, platformAccessory, applianceItem, state, appliance));
            this.accessories.push(accessory);
            this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [
                platformAccessory
            ]);
        });
        this.log.info('Devices discovered!');
        this.devicesDiscovered = true;
        if (!this.liveStream) {
            this.liveStream = new livestream_1.LiveStreamManager(this, this.handleLivestreamEvent.bind(this));
            this.liveStream.start();
        }
    }
    async pollStatus() {
        var _a, _b, _c, _d;
        try {
            if (!this.tokenExpirationDate ||
                Date.now() >= this.tokenExpirationDate) {
                await this.refreshAccessToken();
            }
            if (!this.devicesDiscovered) {
                await this.discoverDevices();
                return;
            }
            if ((_a = this.liveStream) === null || _a === void 0 ? void 0 : _a.isConnected) {
                this.log.debug('Livestream active, skipping poll for appliance state.');
                return;
            }
            this.log.debug('Polling appliances status...');
            const appliances = await this.getAppliances();
            appliances.map(async (appliance) => {
                var _a;
                const uuid = this.api.hap.uuid.generate(appliance.applianceId);
                const existingAccessory = this.accessories.find((accessory) => accessory.platformAccessory.UUID === uuid);
                if (!existingAccessory) {
                    return;
                }
                const state = await this.getApplianceState(appliance.applianceId);
                if (!state) {
                    return;
                }
                (_a = existingAccessory.controller) === null || _a === void 0 ? void 0 : _a.update(state);
            });
            this.log.debug('Appliances status polled!');
        }
        catch (err) {
            let message = err.message;
            if (err instanceof axios_1.AxiosError) {
                const axiosError = err;
                message = (_d = (_c = (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : message;
            }
            this.log.warn('Polling error: ', message);
        }
    }
    handleLivestreamEvent(event) {
        const { applianceId, property, value } = event;
        this.log.debug(`Livestream event: ${applianceId} ${property} = ${JSON.stringify(value)}`);
        const uuid = this.api.hap.uuid.generate(applianceId);
        const accessory = this.accessories.find((a) => a.platformAccessory.UUID === uuid);
        if (!(accessory === null || accessory === void 0 ? void 0 : accessory.controller)) {
            this.log.debug(`Livestream event for unknown accessory: ${applianceId}`);
            return;
        }
        const state = accessory.controller.state;
        if (property === 'connectionState') {
            accessory.controller.state = {
                ...state,
                connectionState: value
            };
        }
        else if (property === 'status') {
            accessory.controller.state = {
                ...state,
                status: value
            };
        }
        else {
            state.properties.reported[property] =
                value;
        }
        accessory.controller.update(accessory.controller.state);
    }
}
exports.ElectroluxDevicesPlatform = ElectroluxDevicesPlatform;
//# sourceMappingURL=platform.js.map