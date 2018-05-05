interface Client {
    runCommand(command: string): Promise<string>;
    close(): Promise<any>;
}