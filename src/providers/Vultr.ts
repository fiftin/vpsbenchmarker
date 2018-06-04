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
        const result = await requestPromise({
            form: {
                DCID: options.location,
                OSID: options.image,
                SSHKEYID: this.settings.sshKey,
                VPSPLANID: options.type,
                label: options.name,
            },
            headers: {
                "API-Key": this.settings.apiToken,
            },
            json: true,
            method: "POST",
            uri: "https://api.vultr.com/v1/server/create",
        });

        const SUBID = result.SUBID;

        let serverInfo;

        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 10000));

            const servers = (await requestPromise({
                headers: {
                    "API-Key": this.settings.apiToken,
                },
                json: true,
                method: "GET",
                uri: `https://api.vultr.com/v1/server/list`,
            }));

            serverInfo = servers[SUBID];

            if (serverInfo.status === "active") {
                break;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 60000));

        return new VultrServer(options.id, serverInfo, {
            host: serverInfo.main_ip,
            privateKey: options.privateKey,
            username: "root",
        });
    }

    public async destroyServer(server: IServer): Promise<void> {
        const vultrServer = server as VultrServer;
        await requestPromise({
            form: {
                SUBID: vultrServer.SUBID,
            },
            headers: {
                "API-Key": this.settings.apiToken,
            },
            json: true,
            method: "POST",
            uri: `https://api.vultr.com/v1/server/destroy`,
        });
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}
