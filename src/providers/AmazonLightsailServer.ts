import {Instance} from "aws-sdk/clients/lightsail";
import {IServer, IServerInfo} from "../IServer";
import {ISshClientOptions, SshClient} from "../SshClient";

const logger = console;

export default class AmazonLightsailServer implements IServer {
    public readonly id: string;
    public readonly region: string;
    public readonly serverInfo: Instance;
    private readonly clientOptions: ISshClientOptions;

    public constructor(id: string, region: string, serverInfo: Instance, clientOptions: ISshClientOptions) {
        this.id = id;
        this.region = region;
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
                logger.log(`Error during connection to server ${this.id}: ${e.message}\nTrying again...`);
                await new Promise((resolve) => setTimeout(resolve, 30000));
            }
        }
        return client;
    }

    public async getInfo(): Promise<IServerInfo> {
        return {
            city: this.serverInfo.location.regionName,
            cores: this.serverInfo.hardware.cpuCount,
            country: "",
            id: this.id,
            location: "",
            memory: this.serverInfo.hardware.ramSizeInGb,
            os: ``,
            priceHourly: 0,
            priceMonthly: 0,
            transfer: Math.floor(this.serverInfo.networking.monthlyTransfer.gbPerMonthAllocated / 1000),
            volumeSize: this.serverInfo.hardware.disks[0].sizeInGb,
            volumeType: "ssd",
        };
    }
}
