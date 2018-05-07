export interface IServerInfo {
    id: string;
    city: string;
    country: string;
    location: string;
    cores: number;
    memory: number;
    volumeSize: number;
    volumeType: string;
    priceHourly: number;
    priceMonthly: number;
    os: string;
}

export interface IServer {
    connect(): Promise<IClient>;
    getInfo(): Promise<IServerInfo>;
}
