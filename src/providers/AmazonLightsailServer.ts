import {Instance} from "aws-sdk/clients/lightsail";
import {IServer, IServerInfo} from "../IServer";
import {ISshClientOptions} from "../SshClient";

export default class AmazonLightsailServer implements IServer {
    public readonly instanceName: string;
    public readonly region: string;
    private readonly serverInfo: Instance;
    private readonly clientOptions: ISshClientOptions;

    public constructor(instanceName: string, region: string, serverInfo: Instance, clientOptions: ISshClientOptions) {
        this.instanceName = instanceName;
        this.region = region;
        this.serverInfo = serverInfo;
        this.clientOptions = clientOptions;
    }

    public async connect(): Promise<IClient> {
        return undefined;
    }

    public async getInfo(): Promise<IServerInfo> {
        return undefined;
    }
}