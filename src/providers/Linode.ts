import {IProvider, IServerOptions} from "../IProvider";
import {IServer} from "../IServer";
import {readFile} from "fs";
import LinodeServer from "./LinodeServer";
import HetznerServer from "./HetznerServer";

const requestPromise = require("request-promise-native");

export interface ILinodeSettings {
    apiToken: string;
    sshKey: string;
    rootPassword: string;
}

export interface ILinodeServerOptions extends IServerOptions {
    name: string;
    image: string;
    type: string;
    privateKey: string;
    location: string;
}

export class Linode implements IProvider<ILinodeServerOptions> {
    private readonly settings: ILinodeSettings;
    constructor(settings: ILinodeSettings) {
        this.settings = settings;
    }

    public async createServer(options: ILinodeServerOptions): Promise<IServer> {
        const key = await new Promise<string>(((resolve, reject) => {
            readFile(this.settings.sshKey, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data.toString());
            });
        }));

        let serverInfo = (await requestPromise({
            body: {
                authorized_keys: [
                    key.trim(),
                ],
                booted: true,
                group: "Linode-Group",
                image: options.image,
                label: options.name,
                region: options.location,
                root_pass: this.settings.rootPassword,
                type: options.type,
            },
            headers: {
                "Authorization": `Bearer ${this.settings.apiToken}`,
                "Content-Type": "application/json",
            },
            json: true,
            method: "POST",
            uri: "https://api.linode.com/v4/linode/instances",
        }));

        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 10000));

            serverInfo = (await requestPromise({
                headers: {
                    "Authorization": `Bearer ${this.settings.apiToken}`,
                    "Content-Type": "application/json",
                },
                json: true,
                method: "GET",
                uri: `https://api.linode.com/v4/linode/instances/${serverInfo.id}`,
            }));
            if (serverInfo.status === "running") {
                break;
            }
        }

        return new LinodeServer(options.id, serverInfo, {
            host: serverInfo.ipv4[0],
            privateKey: options.privateKey,
            username: "root",
        });
    }

    public async destroyServer(server: IServer): Promise<void> {
        const linodeServer = server as HetznerServer;
        const result = await requestPromise({
            headers: {
                Authorization: `Bearer ${this.settings.apiToken}`,
            },
            json: true,
            method: "DELETE",
            uri: `https://api.linode.com/v4/linode/instances/${linodeServer.serverInfo.id}`,
        });
        const errors = result.errors;
        if (errors) {
            const error = errors[0];
            throw new Error(`Error ${error.field} during deleting ` +
                `server ${linodeServer.serverInfo.id}: ${error.reason}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}
