import {readFile} from "fs";
import {Client as Ssh2Client} from "ssh2";
import SshClientOptions from "./SshClientOptions";

export class SshClient implements IClient {
    private conn: Ssh2Client;
    private options: SshClientOptions;

    constructor(options: SshClientOptions) {
        this.options = options;
    }

    public async connect(): Promise<any> {
        const privateKey: Buffer = await new Promise<Buffer>(((resolve, reject) => {
            readFile(this.options.privateKey, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        }));
        return await new Promise((resolve, reject) => {
            this.conn = new Ssh2Client();
            this.conn.on("ready", () => {
                resolve();
            }).connect({
                host: this.options.host,
                privateKey,
                username: this.options.username,
            });
        });
    }

    public close(): Promise<void> {
        this.conn.destroy();
        return;
    }

    public runCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let stdout = "";
            let stderr = "";
            this.conn.exec(command, (err, stream) => {
                if (err) {
                    reject(err);
                }

                stream.stderr.on("data", (data) => {
                    stderr += data.toString();
                }).on("end", () => {
                    resolve(stderr);
                });

                stream.stdout.on("data", (data) => {
                    stdout += data.toString();
                }).on("end", () => {
                    resolve(stdout);
                });

                // stream.on("close", (code, signal) => {
                //     this.conn.end();
                //     reject(new Error(`Connection closed (${code}, ${signal}).`));
                // }).on("data", (data) => {
                //     stdout += data.toString();
                // }).stderr.on("data", (data: Buffer) => {
                //     stderr += data.toString();
                // }).on("end", () => {
                //     resolve(stdout);
                // });
            });
        });
    }
}
