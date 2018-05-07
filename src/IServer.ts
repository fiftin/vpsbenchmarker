export interface IServerInfo {
    location: string;
    country: string;
    city: string;
}

export interface IServer {
    connect(): Promise<IClient>;
    getInfo(): Promise<IServerInfo>;
}
