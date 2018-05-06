interface IProvider {
    createServer(): Promise<IServer>;
    destroyServer(server: IServer): Promise<void>;
}
