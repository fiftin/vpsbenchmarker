import {IServer, IServerInfo} from "../IServer";
import {ISshClientOptions, SshClient} from "../SshClient";

const logger = console;

export default class HetznerServer implements IServer {
    public readonly serverInfo: any;
    private readonly clientOptions: ISshClientOptions;
    private readonly id: string;

    constructor(id: string, serverInfo: any, clientOptions: ISshClientOptions) {
        this.id = id;
        this.serverInfo = serverInfo;
        this.clientOptions = clientOptions;
    }

    public async getInfo(): Promise<IServerInfo> {
        const datacenter = this.serverInfo.datacenter;
        const serverType = this.serverInfo.server_type;
        return {
            city: datacenter.location.city,
            cores: serverType.cores,
            country: datacenter.location.country,
            id: this.id,
            location: `${datacenter.location.latitude},${datacenter.location.longitude}`,
            memory: serverType.memory,
            os: `${this.serverInfo.image.os_flavor} ${this.serverInfo.image.os_version}`,
            priceHourly: serverType.prices[0].price_hourly.net,
            priceMonthly: serverType.prices[0].price_monthly.net,
            transfer: serverType.transfer || 0,
            volumeSize: serverType.disk,
            volumeType: serverType.storage_type,
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
