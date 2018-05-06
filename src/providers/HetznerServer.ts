import {SshClient} from "../SshClient";
import SshClientOptions from "../SshClientOptions";

export default class HetznerServer implements IServer {
    async connect(): Promise<IClient> {
        const options = new SshClientOptions();
        const client = new SshClient(options);
        await client.connect();
        return client;
    }
}