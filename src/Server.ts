interface Server {
    connect(): Promise<Client>;
}