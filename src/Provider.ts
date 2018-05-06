export default abstract class Provider {
    public abstract createServer(): Promise<IServer>;
    public abstract destroyServer(server: IServer): Promise<void>;
}
