import {IServer} from "./IServer";

export interface IProviderSettings {
    name: string;
    logo: string;
}

export interface IServerOptions {
    id: string;
    name: string;
    image: string;
    type: string;
    privateKey: string;
    location: string;
    username?: string;
}

export interface IProvider {
    createServer(options: IServerOptions): Promise<IServer>;
    destroyServer(server: IServer): Promise<void>;
}
