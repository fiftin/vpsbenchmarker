interface IClient {
    runCommand(command: string): Promise<string>;
    close(): Promise<any>;
}
