import {IProvider, IServerOptions} from "../IProvider";
import {IServer} from "../IServer";
import VultrServer from "./VultrServer";

const requestPromise = require("request-promise-native");

export interface IVultrSettings {
    apiToken: string;
    sshKey: string;
}

export class Vultr implements IProvider {
    private readonly settings: IVultrSettings;
    constructor(settings: IVultrSettings) {
        this.settings = settings;
    }

    public async createServer(options: IServerOptions): Promise<IServer> {
        let serverInfo = (await requestPromise({
            body: {
                backups: false,
                image: options.image,
                ipv6: true,
                name: options.name,
                private_networking: null,
                region: options.location,
                size: options.type,
                ssh_keys: [this.settings.sshKey],
                tags: [],
                user_data: null,
                volumes: null,
            },
            headers: {
                "Authorization": `Bearer ${this.settings.apiToken}`,
                "Content-Type": "application/json",
            },
            json: true,
            method: "POST",
            uri: "https://api.digitalocean.com/v2/droplets",
        })).droplet;

        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 10000));

            serverInfo = (await requestPromise({
                headers: {
                    "Authorization": `Bearer ${this.settings.apiToken}`,
                    "Content-Type": "application/json",
                },
                json: true,
                method: "GET",
                uri: `https://api.digitalocean.com/v2/droplets/${serverInfo.id}`,
            })).droplet;
            if (serverInfo.status === "active") {
                break;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 60000));

        const sizes = (await requestPromise({
            headers: {
                "Authorization": `Bearer ${this.settings.apiToken}`,
                "Content-Type": "application/json",
            },
            json: true,
            method: "GET",
            uri: "https://api.digitalocean.com/v2/sizes",
        })).sizes;

        return new VultrServer(options.id, serverInfo, {
            host: serverInfo.networks.v4[0].ip_address,
            privateKey: options.privateKey,
            username: "root",
        });
    }

    public async destroyServer(server: IServer): Promise<void> {
        const vultrServer = server as VultrServer;
        await requestPromise({
            headers: {
                "Authorization": `Bearer ${this.settings.apiToken}`,
                "Content-Type": "application/json",
            },
            json: true,
            method: "DELETE",
            uri: `https://api.digitalocean.com/v2/droplets/${vultrServer.id}`,
        });
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}
