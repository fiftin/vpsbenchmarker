import {IServer} from "./IServer";

export interface IServerOptions {
    name: string;
}

export interface IProvider<T extends IServerOptions> {
    createServer(options: T): Promise<IServer>;
    destroyServer(server: IServer): Promise<void>;
}
