import {IServer, IServerInfo} from "../IServer";
import {ISshClientOptions, SshClient} from "../SshClient";

const logger = console;

export default class HetznerServer implements IServer {
    public readonly serverInfo: any;
    private readonly clientOptions: ISshClientOptions;

    constructor(serverInfo: any, clientOptions: ISshClientOptions) {
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
            location: `${datacenter.location.latitude},${datacenter.location.longitude}`,
            memory: serverType.memory,
            priceHourly: serverType.prices[0].price_hourly.net,
            priceMonthly: serverType.prices[0].price_monthly.net,
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
