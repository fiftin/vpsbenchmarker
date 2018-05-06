import {ISshClientOptions, SshClient} from "../SshClient";

export default class HetznerServer implements IServer {
    private readonly serverInfo: any;
    private readonly clientOptions: ISshClientOptions;

    constructor(serverInfo: any, clientOptions: ISshClientOptions) {
        this.serverInfo = serverInfo;
        this.clientOptions = clientOptions;
    }

    public async connect(): Promise<IClient> {
        const client = new SshClient(this.clientOptions);
        await client.connect();
        return client;
    }
}
