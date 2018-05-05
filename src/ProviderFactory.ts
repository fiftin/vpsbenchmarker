import Provider from "./Provider";
import Hetzner from "./providers/Hetzner";

export default class ProviderFactory {
    private _providerCreators = new Map();

    constructor() {
        this._providerCreators["hetzner"] = () => {
            return new Hetzner();
        }
    }

    createProvider(name: string, options = {}): Provider {
        const creator = this._providerCreators[name];
        if (creator === null) {
            throw new Error(`Provider ${name} does not exists`);
        }
        return creator(options);
    }
}