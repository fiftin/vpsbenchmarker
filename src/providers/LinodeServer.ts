import {IServer, IServerInfo} from "../IServer";
import {ISshClientOptions, SshClient} from "../SshClient";

const requestPromise = require("request-promise-native");

const logger = console;

export default class LinodeServer implements IServer {
    private readonly serverInfo: any;
    private readonly clientOptions: ISshClientOptions;

    public constructor(serverInfo: any, clientOptions: ISshClientOptions) {
        this.serverInfo = serverInfo;
        this.clientOptions = clientOptions;

    }

    public async connect(): Promise<IClient> {
        const client = new SshClient(this.clientOptions);
        while (true) {
            try {
                await client.connect();
                break;
            } catch (e) {
                logger.log(`Error during connection to server ${this.serverInfo.name}: ${e.message}\nTrying again...`);
                await new Promise((resolve) => setTimeout(resolve, 30000));
            }
        }
        return client;
    }

    public async getInfo(): Promise<IServerInfo> {
        const os = this.serverInfo.image.split("/")[1];
        return {
            city: "",
            cores: this.serverInfo.specs.vcpus,
            country: "",
            id: this.serverInfo.id,
            location: "",
            memory: Math.round(this.serverInfo.specs.memory / 1024),
            os: `${os}`,
            priceHourly: 0,
            priceMonthly: 0,
            transfer: Math.round(this.serverInfo.specs.transfer / 1000),
            volumeSize: Math.round(this.serverInfo.specs.disk / 1024),
            volumeType: "ssd",
        };
    }
}
