import requestPromise from "request-promise-native";
import HetznerServer from "./HetznerServer";

export interface IHetznerSettings {
    apiToken: string;
    sshKey: string;
}

export interface IHetznerServerOptions {
    image: string;
    name: string;
    type: string;
    privateKey: string;
}

export default class Hetzner implements IProvider<IHetznerServerOptions> {
    private readonly settings: IHetznerSettings;
    constructor(settings: IHetznerSettings) {
        this.settings = settings;
    }

    public async createServer(options: IHetznerServerOptions): Promise<IServer> {
        await requestPromise({
            body: {
                image: options.image,
                name: options.name,
                server_type: options.type,
                ssh_keys: [this.settings.sshKey],
                start_after_create: true,
            },
            headers: {
                Authorization: `Bearer ${this.settings.apiToken}`,
            },
            json: true,
            method: "POST",
            uri: "https://api.hetzner.cloud/v1/servers",
        });

        return new HetznerServer({
            host: "",
            privateKey: options.privateKey,
            username: "root",
        });
    }

    public destroyServer(server: IServer): Promise<void> {
        return undefined;
    }
}
