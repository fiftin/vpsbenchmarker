import {ISshClientOptions, SshClient} from "../SshClient";

export default class HetznerServer implements IServer {
    private readonly options: ISshClientOptions;
    constructor(options: ISshClientOptions) {
        this.options = options;
    }

    public async connect(): Promise<IClient> {
        const client = new SshClient(this.options);
        await client.connect();
        return client;
    }
}
