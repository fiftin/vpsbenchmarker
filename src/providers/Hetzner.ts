import HetznerServer from "./HetznerServer";

export default class Hetzner implements IProvider {
    public async createServer(): Promise<IServer> {
        return new HetznerServer();
    }

    public destroyServer(server: IServer): Promise<void> {
        return undefined;
    }
}
