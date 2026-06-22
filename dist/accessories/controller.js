"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectroluxAccessoryController = void 0;
class ElectroluxAccessoryController {
    constructor(_platform, _accessory, _item, _state, _appliance) {
        this._platform = _platform;
        this._accessory = _accessory;
        this._item = _item;
        this._state = _state;
        this._appliance = _appliance;
        this.platform = _platform;
        this.accessory = _accessory;
        this.item = _item;
        this.appliance = _appliance;
        this.state = _state;
        this.accessory.context.capabilities = this.appliance;
    }
    async sendCommand(body) {
        try {
            if (this.platform.tokenExpirationDate &&
                Date.now() >= this.platform.tokenExpirationDate) {
                await this.platform.refreshAccessToken();
            }
            await this.platform.client.put(`/api/v1/appliances/${this.item.applianceId}/command`, body);
        }
        catch (error) {
            this.platform.log.error('An error occurred while sending command: ', error.message, 'url: ', `/api/v1/appliances/${this.item.applianceId}/command`, 'body: ', body);
        }
    }
    getCharacteristicValueGuard(getter) {
        return async () => {
            if (this.state.connectionState === 'Disconnected') {
                throw new this.platform.api.hap.HapStatusError(-70402 /* this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
            }
            return await getter();
        };
    }
    setCharacteristicValueGuard(setter) {
        return async (value) => {
            if (this.state.connectionState === 'Disconnected') {
                throw new this.platform.api.hap.HapStatusError(-70402 /* this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
            }
            return setter(value);
        };
    }
}
exports.ElectroluxAccessoryController = ElectroluxAccessoryController;
//# sourceMappingURL=controller.js.map