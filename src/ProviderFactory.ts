import {IProvider, IServerOptions} from "./IProvider";
import {Hetzner} from "./providers/Hetzner";

const config = require("../config.json");

export default class ProviderFactory {
    private providerCreators = new Map();

    constructor() {
        this.providerCreators.set("hetzner", () => {
            return new Hetzner({
                apiToken: config.providers.hetzner.settings.apiToken,
                sshKey: config.providers.hetzner.settings.sshKey,
            });
        });
    }

    public createProvider<T extends IServerOptions>(name: string, options: T): IProvider<T> {
        const creator = this.providerCreators.get(name);
        if (creator == null) {
            throw new Error(`Provider ${name} does not exists`);
        }
        return creator(options);
    }
}
