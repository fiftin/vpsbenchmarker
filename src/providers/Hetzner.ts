import Provider from "../Provider";
import HetznerServer from "./HetznerServer";

export default class Hetzner extends Provider {
    async createServer(): Promise<IServer> {
        await Promise.resolve();
        return new HetznerServer();
    }

    destroyServer(server: IServer): Promise<void> {
        return undefined;
    }
}