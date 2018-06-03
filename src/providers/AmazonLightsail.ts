import {Lightsail} from "aws-sdk";
import {IProvider, IServerOptions} from "../IProvider";
import {IServer} from "../IServer";
import AmazonLightsailServer from "./AmazonLightsailServer";
import {PromiseResult, Request} from "aws-sdk/lib/request";
import {AWSError} from "aws-sdk/lib/error";

const requestPromise = require("request-promise-native");

export interface ILightsailSettings {
    secretAccessKey: string;
    accessKeyId: string;
    sshKey: string;
}

export interface ILightsailServerOptions extends IServerOptions {
    name: string;
    image: string;
    type: string;
    privateKey: string;
    location: string;
    username: string;
}

export class AmazonLightsail implements IProvider<ILightsailServerOptions> {
    private readonly settings: ILightsailSettings;
    public constructor(settings: ILightsailSettings) {
        this.settings = settings;

    }

    public async createServer(options: ILightsailServerOptions): Promise<IServer> {
        const lightsail = new Lightsail({
            accessKeyId: this.settings.accessKeyId,
            region: options.location,
            secretAccessKey: this.settings.secretAccessKey,
        });

        await lightsail.createInstances({
            availabilityZone: options.location + "a",
            blueprintId: options.image,
            bundleId: options.type,
            instanceNames: [options.name],
            keyPairName: this.settings.sshKey,
        }).promise();

        let serverInfo: PromiseResult<Lightsail.Types.GetInstanceResult, AWSError>;
        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 10000));

            serverInfo = await lightsail.getInstance({ instanceName: options.name }).promise();

            if (serverInfo.instance.state.name === "running") {
                break;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 60000));

        return new AmazonLightsailServer(options.name, options.location, serverInfo.instance, {
            host: serverInfo.instance.publicIpAddress,
            privateKey: options.privateKey,
            username: options.username,
        });
    }

    public async destroyServer(server: IServer): Promise<void> {
        const lightsailServer = server as AmazonLightsailServer;
        const lightsail = new Lightsail({
            accessKeyId: this.settings.accessKeyId,
            region: lightsailServer.region,
            secretAccessKey: this.settings.secretAccessKey,
        });

        const res = await lightsail.deleteInstance({
            instanceName: lightsailServer.instanceName,
        }).promise();
        return undefined;
    }
}
