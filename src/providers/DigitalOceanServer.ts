import {IServer, IServerInfo} from "../IServer";
import {ISshClientOptions, SshClient} from "../SshClient";

const logger = console;

export default class DigitalOceanServer implements IServer {
    public readonly serverInfo: any;
    private readonly clientOptions: ISshClientOptions;
    private readonly id: string;

    constructor(id: string, serverInfo: any, clientOptions: ISshClientOptions) {
        this.id = id;
        this.serverInfo = serverInfo;
        this.clientOptions = clientOptions;
    }

    public async getInfo(): Promise<IServerInfo> {
        return {
            city: "",
            cores: this.serverInfo.vcpus,
            country: "",
            id: this.id,
            location: "",
            memory: Math.round(this.serverInfo.memory / 1024),
            os: `${this.serverInfo.image.slug}`,
            priceHourly: 0,
            priceMonthly: 0,
            transfer: 0,
            volumeSize: this.serverInfo.disk,
            volumeType: "ssd",
        };
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
}
