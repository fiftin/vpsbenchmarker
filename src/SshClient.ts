import {readFile} from "fs";
import {Client as Ssh2Client} from "ssh2";

const logger = console;

export interface ISshClientOptions {
    host: string;
    username: string;
    privateKey: string;
}

export class SshClient implements IClient {
    private conn: Ssh2Client;
    private options: ISshClientOptions;

    constructor(options: ISshClientOptions) {
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
            logger.log(`Executing command over SSH: "${command}"...`);
            this.conn.exec(command, (err, stream) => {
                if (err) {
                    reject(err);
                }

                stream.stderr.on("data", (data) => {
                    const str = data.toString();
                    logger.log(str);
                    stderr += str + "\n";
                }).on("end", () => {
                    resolve(stderr);
                });

                stream.stdout.on("data", (data) => {
                    const str = data.toString();
                    logger.log(str);
                    stdout += str + "\n";
                }).on("end", () => {
                    resolve(stdout);
                });
            });
        });
    }

    public isRoot(): boolean {
        return this.options.username === "root";
    }
}
