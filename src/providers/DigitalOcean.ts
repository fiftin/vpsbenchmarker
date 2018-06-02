import {IProvider, IServerOptions} from "../IProvider";
import {IServer} from "../IServer";
import DigitalOceanServer from "./DigitalOceanServer";

const requestPromise = require("request-promise-native");

export interface IDigitalOceanSettings {
    apiToken: string;
    sshKey: string;
}

export interface IDigitalOceanServerOptions extends IServerOptions {
    name: string;
    image: string;
    type: string;
    privateKey: string;
    location: string;
}

export class DigitalOcean implements IProvider<IDigitalOceanServerOptions> {
    private readonly settings: IDigitalOceanSettings;
    constructor(settings: IDigitalOceanSettings) {
        this.settings = settings;
    }

    public async createServer(options: IDigitalOceanServerOptions): Promise<IServer> {
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

        return new DigitalOceanServer(options.id, serverInfo, sizes, {
            host: serverInfo.networks.v4[0].ip_address,
            privateKey: options.privateKey,
            username: "root",
        });
    }

    public async destroyServer(server: IServer): Promise<void> {
        const hetznerServer = server as DigitalOceanServer;
        await requestPromise({
            headers: {
                "Authorization": `Bearer ${this.settings.apiToken}`,
                "Content-Type": "application/json",
            },
            json: true,
            method: "DELETE",
            uri: `https://api.digitalocean.com/v2/droplets/${hetznerServer.serverInfo.id}`,
        });
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}
