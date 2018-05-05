export class SshClientOptions {
    address: string;
}

export class SshClient implements Client {
    constructor(options: SshClientOptions) {

    }

    connect(): Promise<void> {
        return undefined;
    }

    close(): Promise<void> {
        return undefined;
    }

    runCommand(command: string): Promise<string> {
        return undefined;
    }
}