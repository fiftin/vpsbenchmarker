interface IProvider<TServerOptions> {
    createServer(options: TServerOptions): Promise<IServer>;
    destroyServer(server: IServer): Promise<void>;
}
