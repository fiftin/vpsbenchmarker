import {Client as Ssh2Client} from "ssh2";

export class SshClientOptions {
    address: string;
}

export class SshClient implements Client {
    private _conn: Ssh2Client;
    private _options: SshClientOptions;
    constructor(options: SshClientOptions) {
        this._options = options;
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._conn = new Ssh2Client();
            this._conn.on('ready', () => {
                resolve();
            }).connect({

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

                }).on('data', data => {
                });
            });
        });
    }
}