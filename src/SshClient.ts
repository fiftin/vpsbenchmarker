import {Client as Ssh2Client} from "ssh2";
import {readFile} from "fs";

export class SshClientOptions {
    host: string;
    username: string;
    privateKey: string;
}

export class SshClient implements Client {
    private _conn: Ssh2Client;
    private _options: SshClientOptions;
    constructor(options: SshClientOptions) {
        this._options = options;
    }

    async connect(): Promise<any> {
        const privateKey: Buffer = await new Promise<Buffer>(((resolve, reject) => {
            readFile(this._options.privateKey, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        }));
        return await new Promise((resolve, reject) => {
            this._conn = new Ssh2Client();
            this._conn.on('ready', () => {
                resolve();
            }).connect({
                host: this._options.host,
                username: this._options.username,
                privateKey: privateKey
            });
        });
    }

    close(): Promise<void> {
        this._conn.destroy();
        return;
    }

    runCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this._conn.exec(command, (err, stream) => {
                if (err) {
                    reject(err);
                }
                stream.on('close', (code, signal) => {
                    reject(new Error(`Connection closed (${code}, ${signal}).`))
                }).on('data', data => {
                    resolve(data);
                });
            });
        });
    }
}