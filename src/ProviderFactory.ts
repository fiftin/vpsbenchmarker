import Provider from "./Provider";
import Hetzner from "./providers/Hetzner";

export default class ProviderFactory {
    private providerCreators = new Map();

    constructor() {
        this.providerCreators.set("hetzner", () => {
            return new Hetzner();
        });
    }

    public createProvider(name: string, options = {}): Provider {
        const creator = this.providerCreators.get(name);
        if (creator == null) {
            throw new Error(`Provider ${name} does not exists`);
        }
        return creator(options);
    }
}
