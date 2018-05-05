export default abstract class Provider {
    abstract createServer(): Promise<Server>;
    abstract destroyServer(server: Server): Promise<void>;
}