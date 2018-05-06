interface IServer {
    connect(): Promise<IClient>;
}
