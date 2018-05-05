import Provider from "../Provider";
import HetznerServer from "./HetznerServer";

export default class Hetzner extends Provider {
    async createServer(): Promise<Server> {
        await Promise.resolve();
        return new HetznerServer();
    }

    destroyServer(server: Server): Promise<void> {
        return undefined;
    }
}