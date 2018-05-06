interface Server {
    connect(): Promise<IClient>;
}