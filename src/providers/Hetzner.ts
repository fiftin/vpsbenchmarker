import HetznerServer from "./HetznerServer";

const requestPromise = require("request-promise-native");

export interface IHetznerSettings {
    apiToken: string;
    sshKey: string;
}

export interface IHetznerServerOptions extends IServerOptions {
    image: string;
    type: string;
    privateKey: string;
    location: string;
}

export class Hetzner implements IProvider<IHetznerServerOptions> {
    private readonly settings: IHetznerSettings;
    constructor(settings: IHetznerSettings) {
        this.settings = settings;
    }

    public async createServer(options: IHetznerServerOptions): Promise<IServer> {
        const serverInfo = await requestPromise({
            body: {
                image: options.image,
                location: options.location,
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

        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 10000));

            const info = await requestPromise({
                headers: {
                    Authorization: `Bearer ${this.settings.apiToken}`,
                },
                json: true,
                method: "GET",
                uri: `https://api.hetzner.cloud/v1/servers/${serverInfo.server.id}`,
            });
            if (info.server.status === "running") {
                break;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 60000));

        return new HetznerServer(serverInfo.server, {
            host: serverInfo.server.public_net.ipv4.ip,
            privateKey: options.privateKey,
            username: "root",
        });
    }

    public async destroyServer(server: IServer): Promise<void> {
        const hetznerServer = server as HetznerServer;
        const result = await requestPromise({
            headers: {
                Authorization: `Bearer ${this.settings.apiToken}`,
            },
            json: true,
            method: "DELETE",
            uri: `https://api.hetzner.cloud/v1/servers/${hetznerServer.serverInfo.id}`,
        });
        const error = result.action.error;
        if (error) {
            throw new Error(`Error ${error.code} during deleting ` +
                `server ${hetznerServer.serverInfo.id}: ${error.message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}
