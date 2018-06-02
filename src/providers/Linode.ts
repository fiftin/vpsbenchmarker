import {IProvider, IServerOptions} from "../IProvider";
import {IServer} from "../IServer";
import {readFile} from "fs";
import LinodeServer from "./LinodeServer";

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
        const key = new Promise(((resolve, reject) => {
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
                    key,
                ],
                booted: true,
                group: "Linode-Group",
                image: options.image,
                label: ``,
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

        return new LinodeServer(options, serverInfo);
    }

    public async destroyServer(server: IServer): Promise<void> {
        return undefined;
    }
}
