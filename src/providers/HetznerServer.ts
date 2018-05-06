import {SshClient, SshClientOptions} from "../SshClient";

export default class HetznerServer implements Server {
    constructor() {

    }

    async connect(): Promise<IClient> {
        const options = new SshClientOptions();
        const client = new SshClient(options);
        await client.connect();
        return client;
    }
}