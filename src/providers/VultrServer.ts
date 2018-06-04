import {IServer, IServerInfo} from "../IServer";
import {ISshClientOptions, SshClient} from "../SshClient";

const requestPromise = require("request-promise-native");

const logger = console;

export default class VultrServer implements IServer {
    public readonly id: string;
    public readonly SUBID: string;

    private readonly serverInfo: any;
    private readonly clientOptions: ISshClientOptions;

    public constructor(id: string, serverInfo: any, clientOptions: ISshClientOptions) {
        this.id = id;
        this.SUBID = serverInfo.SUBID;
        this.serverInfo = serverInfo;
        this.clientOptions = clientOptions;
    }

    public async connect(): Promise<IClient> {
        this.clientOptions.password = this.serverInfo.default_password;
        const client = new SshClient(this.clientOptions);
        while (true) {
            try {
                await new Promise((resolve) => setTimeout(resolve, 30000));
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
        return {
            city: this.serverInfo.location,
            cores: this.serverInfo.vcpu_count,
            country: "",
            id: this.id,
            location: "",
            memory: Math.round(parseInt(this.serverInfo.ram, 10) / 1024),
            os: `${this.serverInfo.os}`,
            priceHourly: parseFloat(this.serverInfo.cost_per_month) / 750,
            priceMonthly: parseFloat(this.serverInfo.cost_per_month),
            transfer: Math.round(parseFloat(this.serverInfo.allowed_bandwidth_gb) / 1000),
            volumeSize: Math.round( this.serverInfo.disk.split(" ")[1]),
            volumeType: "ssd", // this.serverInfo.disk.split(" ")[0].toLowerCase(),
        };
    }
}
