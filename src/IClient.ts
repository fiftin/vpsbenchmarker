interface IClient {
    isRoot(): boolean;
    runCommand(command: string): Promise<string>;
    close(): Promise<any>;
}
