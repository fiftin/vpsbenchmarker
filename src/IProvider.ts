interface IServerOptions {
    name: string;
}

interface IProvider<T extends IServerOptions> {
    createServer(options: T): Promise<IServer>;
    destroyServer(server: IServer): Promise<void>;
}
