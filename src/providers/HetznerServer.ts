import {SshClient} from "../SshClient";

export default class HetznerServer implements IServer {
    public async connect(): Promise<IClient> {
        const client = new SshClient({
            host: "195.201.91.117",
            privateKey: "C:\\Users\\fifti\\.ssh\\id_rsa",
            username: "root",
        });
        await client.connect();
        return client;
    }
}